"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ka } from "@/lib/i18n/ka";

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
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="date">{ka.create.date}</Label>
        <Input
          id="date"
          type="date"
          value={date}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="time">{ka.create.time}</Label>
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
