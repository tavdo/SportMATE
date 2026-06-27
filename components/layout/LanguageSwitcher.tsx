"use client";

import type { Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/hooks/useLocale";
import { cn } from "@/lib/utils";

const locales: { id: Locale; label: string }[] = [
  { id: "ka", label: "ქარ" },
  { id: "en", label: "EN" },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  return (
    <div className={cn("inline-flex rounded-lg border bg-muted p-1", className)}>
      {locales.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => setLocale(id)}
          className={cn(
            "rounded-md px-3 py-1 text-sm font-medium transition-colors",
            locale === id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
