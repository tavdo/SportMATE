import { ka, type Messages } from "./ka";
import { en } from "./en";
import { ru } from "./ru";

export type Locale = "ka" | "en" | "ru";

export const messages: Record<Locale, Messages> = { ka, en, ru };

export function getMessages(locale: Locale): Messages {
  return messages[locale] ?? ka;
}

export function detectLocale(): Locale {
  if (typeof window === "undefined") return "ka";
  const stored = localStorage.getItem("sportmate_locale");
  if (stored === "en" || stored === "ka" || stored === "ru") return stored;
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith("en")) return "en";
  if (lang.startsWith("ru")) return "ru";
  return "ka";
}

export function getLocaleFromHeader(acceptLanguage: string | null): Locale {
  const lang = acceptLanguage?.toLowerCase() ?? "";
  if (lang.startsWith("en")) return "en";
  if (lang.startsWith("ru")) return "ru";
  return "ka";
}

export type { Messages } from "./ka";
