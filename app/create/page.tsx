"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Venue, SportType, SkillLevel } from "@/lib/types";
import { SPORT_EMOJI } from "@/lib/types";
import { useT } from "@/lib/hooks/useLocale";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VenuePicker } from "@/components/create/VenuePicker";
import { TimePicker } from "@/components/create/TimePicker";
import { GameWeatherCard, WeatherRainAlert } from "@/components/weather/GameWeather";
import { useGameWeather } from "@/lib/hooks/useGameWeather";

export default function CreatePage() {
  const router = useRouter();
  const t = useT();
  const steps = [t.create.stepVenue, t.create.stepSport, t.create.stepTime, t.create.stepDetails];
  const [step, setStep] = useState(0);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [sport, setSport] = useState<SportType | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("18:00");
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [skill, setSkill] = useState<SkillLevel>("any");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Venue[]>("/api/venues")
      .then(setVenues)
      .catch(() => setVenues([]));
  }, []);

  function next() {
    if (step < steps.length - 1) setStep(step + 1);
  }

  function back() {
    if (step > 0) setStep(step - 1);
    else router.push("/");
  }

  async function handleSubmit() {
    if (!venue || !sport || !date || !time) return;

    setLoading(true);
    setError("");

    const startsAt = new Date(`${date}T${time}:00`);

    try {
      const session = await apiFetch<{ id: string }>("/api/sessions", {
        method: "POST",
        body: JSON.stringify({
          venue_id: venue.id,
          sport,
          starts_at: startsAt.toISOString(),
          max_players: maxPlayers,
          skill,
          note: note || null,
        }),
      });
      router.push(`/session/${session.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.common.error);
    } finally {
      setLoading(false);
    }
  }

  const availableSports = venue?.sports ?? [];

  const startsAtIso = date && time ? `${date}T${time}:00` : null;
  const showWeather =
    !!venue &&
    !venue.is_indoor &&
    !!startsAtIso &&
    !Number.isNaN(new Date(startsAtIso).getTime());

  const { weather, loading: weatherLoading } = useGameWeather({
    lat: venue?.lat,
    lng: venue?.lng,
    at: startsAtIso,
    enabled: showWeather && (step === 2 || step === 3),
  });

  return (
    <div className="min-h-dvh pb-8">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background px-4 py-3">
        <Button variant="ghost" size="icon" onClick={back}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">{t.create.title}</h1>
          <p className="text-xs text-muted-foreground">
            {step + 1}/{steps.length} — {steps[step]}
          </p>
        </div>
      </header>

      <div className="p-4">
        <div className="mb-6 flex gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full",
                i <= step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {step === 0 && (
          <VenuePicker
            venues={venues}
            selectedVenueId={venue?.id}
            onSelect={(v) => {
              setVenue(v);
              if (v.sports.length === 1) setSport(v.sports[0]);
            }}
          />
        )}

        {step === 1 && venue && (
          <div className="grid gap-3">
            {availableSports.map((s) => (
              <button
                key={s}
                onClick={() => setSport(s)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-colors",
                  sport === s ? "border-primary bg-primary/10" : "border-muted"
                )}
              >
                <span className="text-3xl">{SPORT_EMOJI[s]}</span>
                <span className="font-medium">{t.sports[s]}</span>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <TimePicker
              date={date}
              time={time}
              onDateChange={setDate}
              onTimeChange={setTime}
            />
            {showWeather && (
              <>
                <WeatherRainAlert weather={weather} loading={weatherLoading} />
                <GameWeatherCard weather={weather} loading={weatherLoading} />
              </>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            {showWeather && (
              <WeatherRainAlert weather={weather} loading={weatherLoading} />
            )}
            <div className="space-y-2">
              <Label>{t.create.maxPlayers}</Label>
              <Input
                type="number"
                min={2}
                max={30}
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.create.skill}</Label>
              <Select value={skill} onValueChange={(v) => setSkill(v as SkillLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["any", "beginner", "intermediate", "advanced"] as SkillLevel[]).map(
                    (s) => (
                      <SelectItem key={s} value={s}>
                        {t.skill[s]}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.create.note}</Label>
              <Input
                placeholder={t.create.notePlaceholder}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <div className="mt-8 flex gap-3">
          {step < steps.length - 1 ? (
            <Button
              className="flex-1"
              size="lg"
              onClick={next}
              disabled={
                (step === 0 && !venue) ||
                (step === 1 && !sport) ||
                (step === 2 && (!date || !time))
              }
            >
              {t.create.next}
            </Button>
          ) : (
            <Button
              className="flex-1"
              size="lg"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? t.common.loading : t.create.submit}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
