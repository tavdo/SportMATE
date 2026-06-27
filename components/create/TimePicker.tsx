"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/hooks/useLocale";

interface TimePickerProps {
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

export function TimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
}: TimePickerProps) {
  const t = useT();

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="date">{t.create.date}</Label>
        <Input
          id="date"
          type="date"
          value={date}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="time">{t.create.time}</Label>
        <Input
          id="time"
          type="time"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
        />
      </div>
    </div>
  );
}
