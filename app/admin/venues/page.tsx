"use client";

import { useCallback, useEffect, useState } from "react";
import type { SportType, Venue } from "@/lib/types";
import { SPORT_EMOJI } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import { useT } from "@/lib/hooks/useLocale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const sports: SportType[] = ["football", "basketball", "volleyball"];

const emptyForm = {
  name: "",
  lat: "41.64",
  lng: "41.63",
  district: "",
  note: "",
  sports: [] as SportType[],
  is_indoor: false,
  is_free: true,
};

export default function AdminVenuesPage() {
  const t = useT();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Venue[]>("/api/admin/venues");
      setVenues(data);
    } catch {
      setVenues([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function toggleSport(sport: SportType) {
    setForm((f) => ({
      ...f,
      sports: f.sports.includes(sport)
        ? f.sports.filter((s) => s !== sport)
        : [...f.sports, sport],
    }));
  }

  function startEdit(venue: Venue) {
    setEditingId(venue.id);
    setShowForm(true);
    setForm({
      name: venue.name,
      lat: String(venue.lat),
      lng: String(venue.lng),
      district: venue.district ?? "",
      note: venue.note ?? "",
      sports: venue.sports,
      is_indoor: venue.is_indoor,
      is_free: venue.is_free,
    });
  }

  function resetForm() {
    setEditingId(null);
    setShowForm(false);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      name: form.name,
      lat: Number(form.lat),
      lng: Number(form.lng),
      district: form.district || null,
      note: form.note || null,
      sports: form.sports,
      is_indoor: form.is_indoor,
      is_free: form.is_free,
      surface: null,
    };

    if (editingId) {
      await apiFetch(`/api/admin/venues/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    } else {
      await apiFetch("/api/admin/venues", {
        method: "POST",
        body: JSON.stringify(body),
      });
    }

    resetForm();
    load();
  }

  async function deleteVenue(id: string) {
    if (!confirm(t.admin.deleteVenue + "?")) return;
    await apiFetch(`/api/admin/venues/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <p>{t.common.loading}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.admin.venues}</h1>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          {t.admin.addVenue}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t.admin.name}</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>{t.admin.district}</Label>
              <Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t.admin.lat}</Label>
              <Input type="number" step="any" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>{t.admin.lng}</Label>
              <Input type="number" step="any" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t.admin.sports}</Label>
            <div className="flex gap-2">
              {sports.map((sport) => (
                <button
                  key={sport}
                  type="button"
                  onClick={() => toggleSport(sport)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm",
                    form.sports.includes(sport) ? "border-primary bg-primary/10" : ""
                  )}
                >
                  {SPORT_EMOJI[sport]} {t.sports[sport]}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t.admin.note}</Label>
            <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_indoor} onChange={(e) => setForm({ ...form, is_indoor: e.target.checked })} />
              {t.admin.indoor}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_free} onChange={(e) => setForm({ ...form, is_free: e.target.checked })} />
              {t.admin.free}
            </label>
          </div>
          <div className="flex gap-2">
            <Button type="submit">{editingId ? t.admin.save : t.admin.addVenue}</Button>
            <Button type="button" variant="outline" onClick={resetForm}>{t.common.cancel}</Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {venues.map((venue) => (
          <div key={venue.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border p-4">
            <div>
              <div className="font-semibold">{venue.name}</div>
              <div className="text-sm text-muted-foreground">
                {venue.district} · {venue.lat}, {venue.lng}
              </div>
              <div className="mt-1 text-sm">
                {venue.sports.map((s) => SPORT_EMOJI[s]).join(" ")}
              </div>
              {venue.note && <p className="mt-1 text-sm text-muted-foreground">{venue.note}</p>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => startEdit(venue)}>
                {t.admin.editVenue}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => deleteVenue(venue.id)}>
                {t.admin.deleteVenue}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
