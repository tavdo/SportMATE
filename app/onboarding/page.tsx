"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ka } from "@/lib/i18n/ka";
import { AVATAR_COLORS, SPORT_EMOJI, type SportType } from "@/lib/types";
import {
  getOrCreateDeviceId,
  setStoredNickname,
  setStoredPreferredSports,
  setStoredAvatarColor,
} from "@/lib/device";
import { createOrUpdatePlayer } from "@/lib/api";
import { usePlayer } from "@/lib/hooks/usePlayer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const sports: SportType[] = ["football", "basketball", "volleyball"];

export default function OnboardingPage() {
  const router = useRouter();
  const { setPlayer } = usePlayer();
  const [nickname, setNickname] = useState("");
  const [selectedSports, setSelectedSports] = useState<SportType[]>([]);
  const [color, setColor] = useState(AVATAR_COLORS[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleSport(sport: SportType) {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!nickname.trim()) {
      setError(ka.onboarding.nicknameRequired);
      return;
    }
    if (selectedSports.length === 0) {
      setError(ka.onboarding.sportsRequired);
      return;
    }

    setLoading(true);
    try {
      const deviceId = getOrCreateDeviceId();
      setStoredNickname(nickname.trim());
      setStoredPreferredSports(selectedSports);
      setStoredAvatarColor(color);

      const player = await createOrUpdatePlayer({
        nickname: nickname.trim(),
        preferred_sports: selectedSports,
        avatar_color: color,
        device_id: deviceId,
      });

      setPlayer(player);
      router.replace("/");
    } catch (e) {
      const msg = e instanceof Error ? e.message : ka.common.error;
      setError(msg.includes("Firebase") || msg.includes("FIREBASE") ? ka.common.firebaseNotConfigured : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">{ka.appName}</h1>
        <p className="mt-2 text-muted-foreground">{ka.onboarding.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="nickname">{ka.onboarding.nicknameLabel}</Label>
          <Input
            id="nickname"
            placeholder={ka.onboarding.nicknamePlaceholder}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={24}
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label>{ka.onboarding.sportsLabel}</Label>
          <div className="flex gap-3">
            {sports.map((sport) => (
              <button
                key={sport}
                type="button"
                onClick={() => toggleSport(sport)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-2xl border-2 py-4 transition-colors",
                  selectedSports.includes(sport)
                    ? "border-primary bg-primary/10"
                    : "border-muted"
                )}
              >
                <span className="text-2xl">{SPORT_EMOJI[sport]}</span>
                <span className="text-xs font-medium">{ka.sports[sport]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>{ka.onboarding.colorLabel}</Label>
          <div className="flex flex-wrap gap-3">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  "h-10 w-10 rounded-full transition-transform",
                  color === c && "ring-2 ring-offset-2 ring-foreground scale-110"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? ka.common.loading : ka.onboarding.submit}
        </Button>
      </form>
    </div>
  );
}
