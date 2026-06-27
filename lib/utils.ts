import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import type { Locale } from "@/lib/i18n";

function localeTag(locale: Locale): string {
  if (locale === "en") return "en-GB";
  if (locale === "ru") return "ru-RU";
  return "ka-GE";
}

export function formatDate(date: Date | string, locale: Locale = "ka"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(localeTag(locale), {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(date: Date | string, locale: Locale = "ka"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString(localeTag(locale), {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(date: Date | string, locale: Locale = "ka"): string {
  return `${formatDate(date, locale)} ${formatTime(date, locale)}`;
}

/** @deprecated Use formatDate with locale */
export function formatGeorgianDate(date: Date | string): string {
  return formatDate(date, "ka");
}

/** @deprecated Use formatTime with locale */
export function formatGeorgianTime(date: Date | string): string {
  return formatTime(date, "ka");
}

/** @deprecated Use formatDateTime with locale */
export function formatGeorgianDateTime(date: Date | string): string {
  return formatDateTime(date, "ka");
}

export function getDateRange(
  filter: "today" | "tomorrow" | "week"
): { from: string; to: string } {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (filter === "today") {
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { from: start.toISOString(), to: end.toISOString() };
  }

  if (filter === "tomorrow") {
    const from = new Date(start);
    from.setDate(from.getDate() + 1);
    const to = new Date(from);
    to.setDate(to.getDate() + 1);
    return { from: from.toISOString(), to: to.toISOString() };
  }

  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { from: start.toISOString(), to: end.toISOString() };
}
