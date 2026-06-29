"use client";

import type { ParticipantWithPlayer } from "@/lib/types";
import { reliabilityColor } from "@/lib/types";
import { useT } from "@/lib/hooks/useLocale";
import { PlayerAvatar } from "@/components/profile/PlayerAvatar";
import { PlayerLink } from "@/components/profile/PlayerLink";

interface PlayerListProps {
  participants: ParticipantWithPlayer[];
  hostId: string;
  selectedNoShows?: string[];
  onToggleNoShow?: (playerId: string) => void;
  showNoShowPicker?: boolean;
}

export function PlayerList({
  participants,
  hostId,
  selectedNoShows = [],
  onToggleNoShow,
  showNoShowPicker = false,
}: PlayerListProps) {
  const t = useT();

  if (participants.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t.session.going}: 0</p>
    );
  }

  return (
    <ul className="space-y-2">
      {participants.map((pt) => {
        const player = Array.isArray(pt.player) ? pt.player[0] : pt.player;
        if (!player) return null;
        const dotColor = reliabilityColor(player.games_played, player.no_shows);
        const isHost = player.id === hostId;

        return (
          <li
            key={pt.id}
            className="flex items-center justify-between rounded-xl border px-3 py-2"
          >
            <div className="flex items-center gap-3">
              {showNoShowPicker && !isHost && onToggleNoShow && (
                <input
                  type="checkbox"
                  checked={selectedNoShows.includes(player.id)}
                  onChange={() => onToggleNoShow(player.id)}
                  className="h-4 w-4 rounded"
                />
              )}
              <PlayerAvatar
                id={player.id}
                nickname={player.nickname}
                avatarColor={player.avatar_color}
                linkable
              />
              <div>
                <div className="flex items-center gap-2">
                  <PlayerLink id={player.id} nickname={player.nickname} />
                  {isHost && (
                    <span className="text-xs text-muted-foreground">
                      ({t.session.host})
                    </span>
                  )}
                </div>
                {player.is_verified && (
                  <span className="text-xs text-primary">{t.profile.verified}</span>
                )}
              </div>
            </div>
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: dotColor }}
              title={`${t.profile.gamesPlayed}: ${player.games_played}, ${t.profile.noShows}: ${player.no_shows}`}
            />
          </li>
        );
      })}
    </ul>
  );
}
