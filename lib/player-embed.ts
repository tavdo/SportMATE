import type { EmbeddedPlayer, Player } from "@/lib/types";

export function embedPlayer(player: Player): EmbeddedPlayer {
  return {
    id: player.id,
    nickname: player.nickname,
    avatar_color: player.avatar_color,
    avatar_url: player.avatar_url ?? null,
    games_played: player.games_played,
    no_shows: player.no_shows,
    is_verified: player.is_verified,
  };
}
