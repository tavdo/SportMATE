import { ka, type Messages } from "./ka";
import { en } from "./en";

export type Locale = "ka" | "en";

export const messages: Record<Locale, Messages> = { ka, en };

export function getMessages(locale: Locale): Messages {
  return messages[locale] ?? ka;
}

export function detectLocale(): Locale {
  if (typeof window === "undefined") return "ka";
  const stored = localStorage.getItem("sportmate_locale");
  if (stored === "en" || stored === "ka") return stored;
  return navigator.language.startsWith("en") ? "en" : "ka";
}

export function getLocaleFromHeader(acceptLanguage: string | null): Locale {
  if (acceptLanguage?.toLowerCase().startsWith("en")) return "en";
  return "ka";
}

export type { Messages } from "./ka";
