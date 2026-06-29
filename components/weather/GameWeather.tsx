"use client";

import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Loader2,
  Sun,
} from "lucide-react";
import type { GameWeather, WeatherCondition } from "@/lib/weather";
import { useLocale, useT } from "@/lib/hooks/useLocale";
import { formatDateTime, formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Lightbulb } from "lucide-react";

function formatTemplate(template: string, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce(
    (text, [key, value]) => text.replace(`{{${key}}}`, String(value)),
    template
  );
}

function WeatherAdvice({
  weather,
  gameAt,
  className,
}: {
  weather: GameWeather;
  gameAt: string;
  className?: string;
}) {
  const t = useT();
  const { locale } = useLocale();

  if (!weather.isRainLikely) return null;

  const gameTime = formatDateTime(gameAt, locale);

  if (weather.suggestion) {
    const suggestedTime = formatTime(weather.suggestion.suggestedAt, locale);
    return (
      <div
        className={cn(
          "mt-3 flex gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-950 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-100",
          className
        )}
      >
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
        <div>
          <p className="font-medium">{t.weather.weatherTip}</p>
          <p className="mt-1">
            {formatTemplate(t.weather.suggestReschedule, {
              gameTime,
              percent: weather.precipitationProbability,
              suggestedTime,
              suggestedPercent: weather.suggestion.suggestedPrecipitationProbability,
            })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <p className={cn("mt-3 text-sm text-muted-foreground", className)}>
      {t.weather.noBetterTime}
    </p>
  );
}

function ConditionIcon({
  condition,
  className,
}: {
  condition: WeatherCondition;
  className?: string;
}) {
  const props = { className: cn("h-5 w-5 shrink-0", className) };

  switch (condition) {
    case "clear":
      return <Sun {...props} className={cn(props.className, "text-amber-500")} />;
    case "cloudy":
      return <CloudSun {...props} className={cn(props.className, "text-sky-500")} />;
    case "fog":
      return <CloudFog {...props} className={cn(props.className, "text-slate-400")} />;
    case "drizzle":
    case "rain":
      return <CloudRain {...props} className={cn(props.className, "text-blue-500")} />;
    case "thunder":
      return <CloudLightning {...props} className={cn(props.className, "text-violet-500")} />;
    case "snow":
      return <Cloud {...props} className={cn(props.className, "text-sky-300")} />;
    default:
      return <Cloud {...props} />;
  }
}

interface GameWeatherCardProps {
  weather: GameWeather | null;
  loading?: boolean;
  className?: string;
  gameAt?: string | null;
}

export function GameWeatherCard({ weather, loading, className, gameAt }: GameWeatherCardProps) {
  const t = useT();

  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border bg-muted/40 px-3 py-2 text-sm text-muted-foreground",
          className
        )}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        {t.common.loading}
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-3",
        weather.isRainLikely
          ? "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30"
          : "bg-muted/30",
        className
      )}
    >
      <div className="mb-1 text-xs font-medium text-muted-foreground">
        {t.weather.forecast} · {t.weather.atGameTime}
      </div>
      <div className="flex items-center gap-3">
        <ConditionIcon condition={weather.condition} />
        <div className="min-w-0 flex-1">
          <div className="font-medium">
            {formatTemplate(t.weather.temperature, { temp: weather.temperature })}
            {" · "}
            {t.weather.conditions[weather.condition]}
          </div>
          <div
            className={cn(
              "text-sm",
              weather.isRainLikely ? "font-medium text-amber-800 dark:text-amber-200" : "text-muted-foreground"
            )}
          >
            {formatTemplate(t.weather.rainChance, {
              percent: weather.precipitationProbability,
            })}
          </div>
        </div>
      </div>
      {gameAt && <WeatherAdvice weather={weather} gameAt={gameAt} />}
      <p className="mt-2 text-xs text-muted-foreground">{t.weather.disclaimer}</p>
    </div>
  );
}

interface WeatherRainAlertProps {
  weather: GameWeather | null;
  loading?: boolean;
  className?: string;
}

export function WeatherRainAlert({
  weather,
  loading,
  className,
}: WeatherRainAlertProps) {
  const t = useT();

  if (loading || !weather?.isRainLikely) return null;

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100",
        className
      )}
    >
      <CloudRain className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
      <div>
        <p className="font-medium">{t.weather.rainLikely}</p>
        <p className="mt-1">
          {formatTemplate(t.weather.rainWarning, {
            percent: weather.precipitationProbability,
          })}
        </p>
      </div>
    </div>
  );
}
