"use client";

import type { AgeRange } from "@/lib/types";
import { AGE_RANGE_OPTIONS } from "@/lib/types";
import type { Messages } from "@/lib/i18n";
import { useT } from "@/lib/hooks/useLocale";
import { cn } from "@/lib/utils";

interface AgeRangePickerProps {
  value: AgeRange | null;
  onChange: (ageRange: AgeRange) => void;
  className?: string;
}

export function AgeRangePicker({ value, onChange, className }: AgeRangePickerProps) {
  const t = useT();

  return (
    <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-3", className)}>
      {AGE_RANGE_OPTIONS.map((range) => (
        <button
          key={range}
          type="button"
          onClick={() => onChange(range)}
          className={cn(
            "rounded-xl border-2 px-3 py-3 text-sm font-medium transition-colors",
            value === range
              ? "border-primary bg-primary/10"
              : "border-muted bg-background"
          )}
        >
          {t.ageRange[range]}
        </button>
      ))}
    </div>
  );
}

export function ageRangeLabel(
  ageRange: AgeRange | null | undefined,
  t: Messages
): string {
  if (!ageRange) return "—";
  return t.ageRange[ageRange];
}
