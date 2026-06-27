"use client";

import { useCallback, useEffect, useState } from "react";
import type { SessionFeed, SessionStatus } from "@/lib/types";
import { SPORT_EMOJI } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import { useT, useLocale } from "@/lib/hooks/useLocale";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function AdminGamesPage() {
  const t = useT();
  const { locale } = useLocale();
  const [sessions, setSessions] = useState<SessionFeed[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<SessionFeed[]>("/api/admin/sessions");
      setSessions(data);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function cancelSession(id: string) {
    await apiFetch(`/api/admin/sessions/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "cancelled" }),
    });
    load();
  }

  async function deleteSession(id: string) {
    if (!confirm(t.admin.deleteGame + "?")) return;
    await apiFetch(`/api/admin/sessions/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <p>{t.common.loading}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t.admin.games}</h1>
      {sessions.length === 0 ? (
        <p className="text-muted-foreground">{t.admin.noData}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left">{t.admin.sports}</th>
                <th className="p-3 text-left">{t.session.venue}</th>
                <th className="p-3 text-left">{t.session.dateTime}</th>
                <th className="p-3 text-left">{t.admin.host}</th>
                <th className="p-3 text-left">{t.admin.players}</th>
                <th className="p-3 text-left">{t.admin.status}</th>
                <th className="p-3 text-left">{t.admin.actions}</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-3">
                    {SPORT_EMOJI[s.sport]} {t.sports[s.sport]}
                  </td>
                  <td className="p-3">{s.venue_name}</td>
                  <td className="p-3">{formatDateTime(s.starts_at, locale)}</td>
                  <td className="p-3">{s.host_nickname}</td>
                  <td className="p-3">
                    {s.current_players}/{s.max_players}
                  </td>
                  <td className="p-3">{t.status[s.status as SessionStatus] ?? s.status}</td>
                  <td className="p-3 space-x-2">
                    {s.status !== "cancelled" && (
                      <Button size="sm" variant="outline" onClick={() => cancelSession(s.id)}>
                        {t.admin.cancelGame}
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => deleteSession(s.id)}>
                      {t.admin.deleteGame}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
