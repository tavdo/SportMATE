"use client";

import { useState } from "react";
import type { SportType, Gender, AgeRange } from "@/lib/types";
import { SPORT_EMOJI, SPORT_TYPES, AVATAR_COLORS } from "@/lib/types";
import { useT } from "@/lib/hooks/useLocale";
import { GenderPicker, genderLabel } from "@/components/profile/GenderPicker";
import { AgeRangePicker, ageRangeLabel } from "@/components/profile/AgeRangePicker";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { useAuth } from "@/lib/hooks/useAuth";
import { createOrUpdatePlayer } from "@/lib/api";
import { signOutUser } from "@/lib/auth-client";
import { usePlayer } from "@/lib/hooks/usePlayer";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const sports = SPORT_TYPES;

export default function ProfilePage() {
  const { player, refresh, setPlayer } = usePlayer();
  const { isAdmin } = useAuth();
  const t = useT();
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(player?.nickname ?? "");
  const [selectedSports, setSelectedSports] = useState<SportType[]>(
    player?.preferred_sports ?? []
  );
  const [gender, setGender] = useState<Gender | null>(player?.gender ?? null);
  const [ageRange, setAgeRange] = useState<AgeRange | null>(player?.age_range ?? null);
  const [color, setColor] = useState(player?.avatar_color ?? AVATAR_COLORS[0]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!player) {
    return (
      <div className="flex min-h-dvh items-center justify-center pb-safe">
        {t.common.loading}
      </div>
    );
  }

  function toggleSport(sport: SportType) {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  }

  async function handleSave() {
    if (!gender || !ageRange) return;
    setLoading(true);
    try {
      const updated = await createOrUpdatePlayer({
        nickname: nickname.trim(),
        preferred_sports: selectedSports,
        avatar_color: color,
        gender,
        age_range: ageRange,
      });
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
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{t.profile.title}</h1>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="p-4 space-y-6">
        <AvatarUpload
          player={player}
          nickname={editing ? nickname : player.nickname}
          avatarColor={editing ? color : player.avatar_color}
          onUpdated={(updated) => {
            setPlayer(updated);
            refresh();
          }}
        />
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="text-lg font-semibold">
            {editing ? nickname : player.nickname}
          </div>
          <div className="text-sm text-muted-foreground">
            {player.phone_number ?? player.email ?? "—"}
          </div>
          <div className="text-sm text-muted-foreground">
            {player.is_verified ? t.profile.verified : t.profile.notVerified}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-2xl border p-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{player.games_played}</div>
            <div className="text-sm text-muted-foreground">
              {t.profile.gamesPlayed}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">
              {player.no_shows}
            </div>
            <div className="text-sm text-muted-foreground">
              {t.profile.noShows}
            </div>
          </div>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t.profile.nickname}</Label>
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={24}
              />
            </div>

            <div className="space-y-2">
              <Label>{t.profile.sports}</Label>
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
                    <span className="text-xs">{t.sports[sport]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t.profile.gender}</Label>
              <GenderPicker value={gender} onChange={setGender} />
            </div>

            <div className="space-y-2">
              <Label>{t.profile.ageRange}</Label>
              <AgeRangePicker value={ageRange} onChange={setAgeRange} />
            </div>

            <div className="space-y-2">
              <Label>{t.onboarding.colorLabel}</Label>
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
                {t.common.cancel}
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={loading || !gender || !ageRange}
              >
                {t.profile.save}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">{t.profile.sports}</div>
              <div className="mt-1 flex gap-2">
                {player.preferred_sports.map((s) => (
                  <span key={s} className="rounded-full bg-muted px-3 py-1 text-sm">
                    {SPORT_EMOJI[s]} {t.sports[s]}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">{t.profile.gender}</div>
              <div className="mt-1 font-medium">{genderLabel(player.gender, t)}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">{t.profile.ageRange}</div>
              <div className="mt-1 font-medium">{ageRangeLabel(player.age_range, t)}</div>
            </div>

            <Button className="w-full" variant="outline" onClick={() => {
              setNickname(player.nickname);
              setSelectedSports(player.preferred_sports);
              setGender(player.gender);
              setAgeRange(player.age_range);
              setColor(player.avatar_color);
              setEditing(true);
            }}>
              {t.profile.editProfile}
            </Button>

            {isAdmin && (
              <Button asChild className="w-full" variant="secondary">
                <Link href="/admin">{t.profile.adminPanel}</Link>
              </Button>
            )}

            <Button
              className="w-full"
              variant="ghost"
              onClick={async () => {
                await signOutUser();
                window.location.href = "/onboarding";
              }}
            >
              {t.profile.logout}
            </Button>

            {saved && (
              <p className="text-center text-sm text-primary">{t.profile.saved}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
