export const RAIN_WARNING_THRESHOLD = 50;

export type WeatherCondition =
  | "clear"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "thunder"
  | "snow";

export interface GameWeather {
  temperature: number;
  precipitationProbability: number;
  condition: WeatherCondition;
  isRainLikely: boolean;
}

interface OpenMeteoHourly {
  time: string[];
  temperature_2m: number[];
  precipitation_probability: number[];
  weather_code: number[];
}

interface OpenMeteoResponse {
  hourly: OpenMeteoHourly;
}

export function weatherCodeToCondition(code: number): WeatherCondition {
  if (code === 0) return "clear";
  if (code <= 3) return "cloudy";
  if (code <= 48) return "fog";
  if (code <= 55) return "drizzle";
  if (code <= 67) return "rain";
  if (code <= 77) return "snow";
  if (code <= 82) return "rain";
  if (code <= 99) return "thunder";
  return "cloudy";
}

export function isRainCondition(condition: WeatherCondition): boolean {
  return condition === "drizzle" || condition === "rain" || condition === "thunder";
}

function formatDateInTz(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatHourInTz(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
  return hour.padStart(2, "0");
}

export async function fetchGameWeather(
  lat: number,
  lng: number,
  at: Date
): Promise<GameWeather | null> {
  if (at.getTime() < Date.now() - 60 * 60 * 1000) {
    return null;
  }

  const timeZone = "Asia/Tbilisi";
  const dateStr = formatDateInTz(at, timeZone);
  const hourStr = formatHourInTz(at, timeZone);
  const targetKey = `${dateStr}T${hourStr}:00`;

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("hourly", "temperature_2m,precipitation_probability,weather_code");
  url.searchParams.set("timezone", timeZone);
  url.searchParams.set("start_date", dateStr);
  url.searchParams.set("end_date", dateStr);

  const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
  if (!res.ok) return null;

  const data = (await res.json()) as OpenMeteoResponse;
  const idx = data.hourly.time.findIndex((t) => t.startsWith(targetKey.slice(0, 13)));
  if (idx === -1) return null;

  const temperature = data.hourly.temperature_2m[idx];
  const precipitationProbability = data.hourly.precipitation_probability[idx] ?? 0;
  const condition = weatherCodeToCondition(data.hourly.weather_code[idx] ?? 0);
  const isRainLikely =
    precipitationProbability >= RAIN_WARNING_THRESHOLD ||
    (isRainCondition(condition) && precipitationProbability >= 30);

  return {
    temperature: Math.round(temperature),
    precipitationProbability: Math.round(precipitationProbability),
    condition,
    isRainLikely,
  };
}
