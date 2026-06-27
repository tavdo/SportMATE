"use client";

import { useCallback, useEffect, useState } from "react";
import type { SiteSettings } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import { useT } from "@/lib/hooks/useLocale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminSettingsPage() {
  const t = useT();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<SiteSettings>("/api/admin/settings");
      setSettings(data);
    } catch {
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await apiFetch<SiteSettings>("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify(settings),
      });
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !settings) return <p>{t.common.loading}</p>;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">{t.admin.settings}</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-2">
          <Label>{t.admin.appName}</Label>
          <Input
            value={settings.app_name}
            onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>{t.admin.tagline}</Label>
          <Input
            value={settings.tagline}
            onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>{t.admin.contactPhone}</Label>
          <Input
            value={settings.contact_phone ?? ""}
            onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value || null })}
            placeholder="+995..."
          />
        </div>
        <div className="space-y-2">
          <Label>{t.admin.contactEmail}</Label>
          <Input
            type="email"
            value={settings.contact_email ?? ""}
            onChange={(e) => setSettings({ ...settings, contact_email: e.target.value || null })}
          />
        </div>
        <div className="space-y-2">
          <Label>{t.admin.about}</Label>
          <textarea
            className="flex min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={settings.about ?? ""}
            onChange={(e) => setSettings({ ...settings, about: e.target.value || null })}
          />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? t.common.loading : t.admin.save}
        </Button>
        {saved && <p className="text-sm text-primary">{t.admin.saved}</p>}
      </form>
    </div>
  );
}
