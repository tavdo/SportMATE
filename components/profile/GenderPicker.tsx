"use client";

import type { Gender } from "@/lib/types";
import { GENDER_OPTIONS } from "@/lib/types";
import type { Messages } from "@/lib/i18n";
import { useT } from "@/lib/hooks/useLocale";
import { cn } from "@/lib/utils";

interface GenderPickerProps {
  value: Gender | null;
  onChange: (gender: Gender) => void;
  className?: string;
}

export function GenderPicker({ value, onChange, className }: GenderPickerProps) {
  const t = useT();

  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      {GENDER_OPTIONS.map((gender) => (
        <button
          key={gender}
          type="button"
          onClick={() => onChange(gender)}
          className={cn(
            "rounded-xl border-2 px-3 py-3 text-sm font-medium transition-colors",
            value === gender
              ? "border-primary bg-primary/10"
              : "border-muted bg-background"
          )}
        >
          {t.gender[gender]}
        </button>
      ))}
    </div>
  );
}

export function genderLabel(
  gender: Gender | null | undefined,
  t: Messages
): string {
  if (!gender) return "—";
  return t.gender[gender];
}
