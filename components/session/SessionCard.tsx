"use client";

import Link from "next/link";
import type { SessionFeed } from "@/lib/types";
import { SPORT_COLORS, SPORT_EMOJI } from "@/lib/types";
import { useLocale, useT } from "@/lib/hooks/useLocale";
import { formatDateTime, cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface SessionCardProps {
  session: SessionFeed & { is_host?: boolean };
  compact?: boolean;
}

export function SessionCard({ session, compact }: SessionCardProps) {
  const t = useT();
  const { locale } = useLocale();
  const color = SPORT_COLORS[session.sport];

  return (
    <Link href={`/session/${session.id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="h-1" style={{ backgroundColor: color }} />
        <CardContent className={cn("space-y-2", compact ? "p-3" : "p-4")}>
          <div className="flex items-start justify-between gap-2">
            <div className="font-semibold">
              {SPORT_EMOJI[session.sport]} {t.sports[session.sport]}
            </div>
            {session.is_host && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                {t.myGames.hosted}
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatDateTime(session.starts_at, locale)}
          </div>
          <div className="text-sm font-medium">
            {session.current_players}/{session.max_players} {t.map.players}
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
