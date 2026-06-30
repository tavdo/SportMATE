"use client";

import type { SportType, SkillLevel } from "@/lib/types";
import { SPORT_EMOJI, SPORT_TYPES } from "@/lib/types";
import { useT } from "@/lib/hooks/useLocale";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  sport: SportType | null;
  dateFilter: "today" | "tomorrow" | "week";
  skill: SkillLevel | null;
  onSportChange: (sport: SportType | null) => void;
  onDateChange: (filter: "today" | "tomorrow" | "week") => void;
  onSkillChange: (skill: SkillLevel | null) => void;
}

const sports: (SportType | null)[] = [null, ...SPORT_TYPES];
const skills: (SkillLevel | null)[] = [null, "beginner", "intermediate", "advanced"];

export function FilterBar({
  sport,
  dateFilter,
  skill,
  onSportChange,
  onDateChange,
  onSkillChange,
}: FilterBarProps) {
  const t = useT();

  const dateLabels: Record<"today" | "tomorrow" | "week", string> = {
    today: t.map.today,
    tomorrow: t.map.tomorrow,
    week: t.map.thisWeek,
  };

  return (
    <div className="space-y-2 rounded-2xl bg-background/95 p-3 shadow-lg backdrop-blur">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sports.map((s) => (
          <button
            key={s ?? "all"}
            onClick={() => onSportChange(s)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              sport === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {s ? SPORT_EMOJI[s] : t.map.allSports}
          </button>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {(["today", "tomorrow", "week"] as const).map((d) => (
          <button
            key={d}
            onClick={() => onDateChange(d)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-medium",
              dateFilter === d
                ? "bg-secondary text-secondary-foreground"
                : "bg-muted/60 text-muted-foreground"
            )}
          >
            {dateLabels[d]}
          </button>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {skills.map((sk) => (
          <button
            key={sk ?? "any"}
            onClick={() => onSkillChange(sk)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs",
              skill === sk
                ? "border border-primary text-primary"
                : "text-muted-foreground"
            )}
          >
            {sk ? t.skill[sk] : t.skill.any}
          </button>
        ))}
      </div>
    </div>
  );
}
