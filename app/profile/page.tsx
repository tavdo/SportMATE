"use client";

import { useState } from "react";
import type { SportType } from "@/lib/types";
import { SPORT_EMOJI, AVATAR_COLORS } from "@/lib/types";
import { ka } from "@/lib/i18n/ka";
import {
  setStoredNickname,
  setStoredPreferredSports,
  setStoredAvatarColor,
} from "@/lib/device";
import { createOrUpdatePlayer } from "@/lib/api";
import { usePlayer } from "@/lib/hooks/usePlayer";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const sports: SportType[] = ["football", "basketball", "volleyball"];

export default function ProfilePage() {
  const { player, refresh, setPlayer } = usePlayer();
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(player?.nickname ?? "");
  const [selectedSports, setSelectedSports] = useState<SportType[]>(
    player?.preferred_sports ?? []
  );
  const [color, setColor] = useState(player?.avatar_color ?? AVATAR_COLORS[0]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!player) {
    return (
      <div className="flex min-h-dvh items-center justify-center pb-safe">
        {ka.common.loading}
      </div>
    );
  }

  function toggleSport(sport: SportType) {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  }

  async function handleSave() {
    setLoading(true);
    try {
      const updated = await createOrUpdatePlayer({
        nickname: nickname.trim(),
        preferred_sports: selectedSports,
        avatar_color: color,
      });
      setStoredNickname(nickname.trim());
      setStoredPreferredSports(selectedSports);
      setStoredAvatarColor(color);
      setPlayer(updated);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      refresh();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh pb-safe">
      <header className="border-b px-4 py-4">
        <h1 className="text-xl font-bold">{ka.profile.title}</h1>
      </header>

      <div className="p-4 space-y-6">
        <div className="flex flex-col items-center gap-3 py-4">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white"
            style={{ backgroundColor: editing ? color : player.avatar_color }}
          >
            {(editing ? nickname : player.nickname).charAt(0).toUpperCase()}
          </div>
          <div className="text-lg font-semibold">
            {editing ? nickname : player.nickname}
          </div>
          <div className="text-sm text-muted-foreground">
            {player.is_verified ? ka.profile.verified : ka.profile.notVerified}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-2xl border p-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{player.games_played}</div>
            <div className="text-sm text-muted-foreground">
              {ka.profile.gamesPlayed}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">
              {player.no_shows}
            </div>
            <div className="text-sm text-muted-foreground">
              {ka.profile.noShows}
            </div>
          </div>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{ka.profile.nickname}</Label>
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={24}
              />
            </div>

            <div className="space-y-2">
              <Label>{ka.profile.sports}</Label>
              <div className="flex gap-2">
                {sports.map((sport) => (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => toggleSport(sport)}
                    className={cn(
                      "flex flex-1 flex-col items-center gap-1 rounded-xl border-2 py-3",
                      selectedSports.includes(sport)
                        ? "border-primary bg-primary/10"
                        : "border-muted"
                    )}
                  >
                    <span className="text-xl">{SPORT_EMOJI[sport]}</span>
                    <span className="text-xs">{ka.sports[sport]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{ka.onboarding.colorLabel}</Label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "h-8 w-8 rounded-full",
                      color === c && "ring-2 ring-offset-1 ring-foreground"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setEditing(false)}
              >
                {ka.common.cancel}
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={loading}
              >
                {ka.profile.save}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">{ka.profile.sports}</div>
              <div className="mt-1 flex gap-2">
                {player.preferred_sports.map((s) => (
                  <span key={s} className="rounded-full bg-muted px-3 py-1 text-sm">
                    {SPORT_EMOJI[s]} {ka.sports[s]}
                  </span>
                ))}
              </div>
            </div>

            <Button className="w-full" variant="outline" onClick={() => setEditing(true)}>
              {ka.profile.editProfile}
            </Button>

            {saved && (
              <p className="text-center text-sm text-primary">{ka.profile.saved}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
