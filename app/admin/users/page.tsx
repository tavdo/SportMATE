"use client";

import { useCallback, useEffect, useState } from "react";
import type { Player } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import { useT } from "@/lib/hooks/useLocale";
import { genderLabel } from "@/components/profile/GenderPicker";
import { Button } from "@/components/ui/button";

export default function AdminUsersPage() {
  const t = useT();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Player[]>("/api/admin/players");
      setPlayers(data);
    } catch {
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function patchPlayer(id: string, body: Partial<Player>) {
    await apiFetch(`/api/admin/players/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    load();
  }

  if (loading) return <p>{t.common.loading}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t.admin.users}</h1>
      {players.length === 0 ? (
        <p className="text-muted-foreground">{t.admin.noData}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left">{t.admin.nickname}</th>
                <th className="p-3 text-left">{t.admin.phone}</th>
                <th className="p-3 text-left">{t.admin.gender}</th>
                <th className="p-3 text-left">{t.admin.gamesPlayed}</th>
                <th className="p-3 text-left">{t.admin.noShows}</th>
                <th className="p-3 text-left">{t.admin.status}</th>
                <th className="p-3 text-left">{t.admin.actions}</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3 font-medium">{p.nickname}</td>
                  <td className="p-3">{p.phone_number ?? p.email ?? "—"}</td>
                  <td className="p-3">{genderLabel(p.gender, t)}</td>
                  <td className="p-3">{p.games_played}</td>
                  <td className="p-3">{p.no_shows}</td>
                  <td className="p-3">
                    {p.is_banned && <span className="text-destructive">{t.admin.banned}</span>}
                    {p.is_verified && !p.is_banned && (
                      <span className="text-primary">{t.admin.verified}</span>
                    )}
                    {!p.is_banned && !p.is_verified && "—"}
                  </td>
                  <td className="p-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => patchPlayer(p.id, { is_verified: !p.is_verified })}
                    >
                      {p.is_verified ? t.admin.unverify : t.admin.verify}
                    </Button>
                    <Button
                      size="sm"
                      variant={p.is_banned ? "outline" : "destructive"}
                      onClick={() => patchPlayer(p.id, { is_banned: !p.is_banned })}
                    >
                      {p.is_banned ? t.admin.unban : t.admin.ban}
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
