"use client";

import type { ParticipantWithPlayer } from "@/lib/types";
import { reliabilityColor } from "@/lib/types";
import { ka } from "@/lib/i18n/ka";

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
  if (participants.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{ka.session.going}: 0</p>
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
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: player.avatar_color }}
              >
                {player.nickname.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 font-medium">
                  {player.nickname}
                  {isHost && (
                    <span className="text-xs text-muted-foreground">
                      ({ka.session.host})
                    </span>
                  )}
                </div>
                {player.is_verified && (
                  <span className="text-xs text-primary">{ka.profile.verified}</span>
                )}
              </div>
            </div>
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: dotColor }}
              title={`${ka.profile.gamesPlayed}: ${player.games_played}, ${ka.profile.noShows}: ${player.no_shows}`}
            />
          </li>
        );
      })}
    </ul>
  );
}
