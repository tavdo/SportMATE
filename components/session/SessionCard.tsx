"use client";

import Link from "next/link";
import type { SessionFeed } from "@/lib/types";
import { SPORT_COLORS, SPORT_EMOJI } from "@/lib/types";
import { ka } from "@/lib/i18n/ka";
import { formatGeorgianDateTime, cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface SessionCardProps {
  session: SessionFeed & { is_host?: boolean };
  compact?: boolean;
}

export function SessionCard({ session, compact }: SessionCardProps) {
  const color = SPORT_COLORS[session.sport];

  return (
    <Link href={`/session/${session.id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="h-1" style={{ backgroundColor: color }} />
        <CardContent className={cn("space-y-2", compact ? "p-3" : "p-4")}>
          <div className="flex items-start justify-between gap-2">
            <div className="font-semibold">
              {SPORT_EMOJI[session.sport]} {ka.sports[session.sport]}
            </div>
            {session.is_host && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                {ka.myGames.hosted}
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatGeorgianDateTime(session.starts_at)}
          </div>
          <div className="text-sm font-medium">
            {session.current_players}/{session.max_players} {ka.map.players}
          </div>
          <div className="text-sm">{session.venue_name}</div>
          {session.district && (
            <div className="text-xs text-muted-foreground">{session.district}</div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
