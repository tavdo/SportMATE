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
  suggestion?: WeatherSuggestion | null;
}

export interface WeatherSuggestion {
  suggestedAt: string;
  suggestedHour: number;
  suggestedPrecipitationProbability: number;
  hoursShift: number;
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

function formatHourInTz(date: Date, timeZone: string): number {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "numeric",
      hour12: false,
    }).format(date)
  );
  return hour === 24 ? 0 : hour;
}

function hourIsRainLikely(precip: number, condition: WeatherCondition): boolean {
  return (
    precip >= RAIN_WARNING_THRESHOLD ||
    (isRainCondition(condition) && precip >= 30)
  );
}

function findHourIndex(
  hourly: OpenMeteoHourly,
  dateStr: string,
  hour: number
): number {
  return hourly.time.findIndex((t) => {
    const entryDate = t.slice(0, 10);
    const entryHour = Number(t.slice(11, 13));
    return entryDate === dateStr && entryHour === hour;
  });
}

function findBetterTimeSuggestion(
  hourly: OpenMeteoHourly,
  dateStr: string,
  gameHour: number,
  gamePrecip: number,
  gameCondition: WeatherCondition
): WeatherSuggestion | null {
  if (!hourIsRainLikely(gamePrecip, gameCondition)) return null;

  const windowStart = Math.max(8, gameHour - 4);
  const windowEnd = Math.min(22, gameHour + 2);

  let best: { hour: number; precip: number; score: number } | null = null;

  for (let hour = windowStart; hour <= windowEnd; hour++) {
    if (hour === gameHour) continue;

    const idx = findHourIndex(hourly, dateStr, hour);
    if (idx === -1) continue;

    const precip = hourly.precipitation_probability[idx] ?? 0;
    const condition = weatherCodeToCondition(hourly.weather_code[idx] ?? 0);
    if (hourIsRainLikely(precip, condition)) continue;

    const hoursShift = hour - gameHour;
    const score = precip + (hoursShift > 0 ? 8 : 0);

    if (!best || score < best.score) {
      best = { hour, precip, score };
    }
  }

  if (!best) return null;

  return {
    suggestedAt: `${dateStr}T${String(best.hour).padStart(2, "0")}:00`,
    suggestedHour: best.hour,
    suggestedPrecipitationProbability: Math.round(best.precip),
    hoursShift: best.hour - gameHour,
  };
}

function buildGameWeather(
  hourly: OpenMeteoHourly,
  dateStr: string,
  hour: number
): GameWeather | null {
  const idx = findHourIndex(hourly, dateStr, hour);
  if (idx === -1) return null;

  const temperature = hourly.temperature_2m[idx];
  const precipitationProbability = hourly.precipitation_probability[idx] ?? 0;
  const condition = weatherCodeToCondition(hourly.weather_code[idx] ?? 0);
  const isRainLikely = hourIsRainLikely(precipitationProbability, condition);
  const suggestion = findBetterTimeSuggestion(
    hourly,
    dateStr,
    hour,
    precipitationProbability,
    condition
  );

  return {
    temperature: Math.round(temperature),
    precipitationProbability: Math.round(precipitationProbability),
    condition,
    isRainLikely,
    suggestion,
  };
}

async function fetchHourlyForecast(
  lat: number,
  lng: number,
  dateStr: string
): Promise<OpenMeteoHourly | null> {
  const timeZone = "Asia/Tbilisi";
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
  return data.hourly;
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
  const hour = formatHourInTz(at, timeZone);

  const hourly = await fetchHourlyForecast(lat, lng, dateStr);
  if (!hourly) return null;

  return buildGameWeather(hourly, dateStr, hour);
}
