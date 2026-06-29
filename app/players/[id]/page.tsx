"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { PublicPlayer } from "@/lib/types";
import { SPORT_EMOJI, reliabilityColor } from "@/lib/types";
import { fetchPublicPlayer } from "@/lib/api";
import { useAuth } from "@/lib/hooks/useAuth";
import { useLocale, useT } from "@/lib/hooks/useLocale";
import { genderLabel } from "@/components/profile/GenderPicker";
import { ageRangeLabel } from "@/components/profile/AgeRangePicker";
import { PlayerAvatar } from "@/components/profile/PlayerAvatar";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function PlayerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const playerId = params.id as string;
  const { user } = useAuth();
  const t = useT();
  const { locale } = useLocale();
  const [player, setPlayer] = useState<PublicPlayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isSelf = user?.uid === playerId;

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchPublicPlayer(playerId)
      .then(setPlayer)
      .catch((e) => {
        setPlayer(null);
        setError(e instanceof Error ? e.message : t.common.error);
      })
      .finally(() => setLoading(false));
  }, [playerId, t.common.error]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center pb-safe">
        {t.common.loading}
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-dvh pb-safe">
        <header className="flex items-center gap-3 border-b px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{t.publicProfile.title}</h1>
        </header>
        <p className="p-4 text-center text-muted-foreground">
          {error || t.publicProfile.notFound}
        </p>
      </div>
    );
  }

  const dotColor = reliabilityColor(player.games_played, player.no_shows);

  return (
    <div className="min-h-dvh pb-safe">
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">{t.publicProfile.title}</h1>
      </header>

      <div className="space-y-6 p-4">
        <div className="flex flex-col items-center gap-3 py-4">
          <PlayerAvatar
            nickname={player.nickname}
            avatarColor={player.avatar_color}
            avatarUrl={player.avatar_url}
            size="lg"
          />
          <div className="text-lg font-semibold">{player.nickname}</div>
          {player.is_verified && (
            <div className="text-sm text-primary">{t.profile.verified}</div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: dotColor }}
            />
            {t.publicProfile.reliability}
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

        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">{t.profile.sports}</div>
            <div className="mt-1 flex flex-wrap gap-2">
              {player.preferred_sports.length > 0 ? (
                player.preferred_sports.map((s) => (
                  <span key={s} className="rounded-full bg-muted px-3 py-1 text-sm">
                    {SPORT_EMOJI[s]} {t.sports[s]}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </div>
          </div>

          {player.gender && (
            <div>
              <div className="text-sm text-muted-foreground">{t.profile.gender}</div>
              <div className="mt-1 font-medium">{genderLabel(player.gender, t)}</div>
            </div>
          )}

          {player.age_range && (
            <div>
              <div className="text-sm text-muted-foreground">{t.profile.ageRange}</div>
              <div className="mt-1 font-medium">
                {ageRangeLabel(player.age_range, t)}
              </div>
            </div>
          )}

          <div>
            <div className="text-sm text-muted-foreground">
              {t.publicProfile.memberSince}
            </div>
            <div className="mt-1 font-medium">
              {formatDate(player.created_at, locale)}
            </div>
          </div>
        </div>

        {isSelf && (
          <Button asChild className="w-full" variant="outline">
            <Link href="/profile">{t.publicProfile.editMyProfile}</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
