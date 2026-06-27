"use client";

import { useT } from "@/lib/hooks/useLocale";

export function MapLoading() {
  const t = useT();
  return (
    <div className="flex h-full items-center justify-center bg-muted">
      {t.map.loading}
    </div>
  );
}
