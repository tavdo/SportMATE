"use client";

import Link from "next/link";
import { useT } from "@/lib/hooks/useLocale";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const links = [
  { href: "/admin/games", key: "games" as const },
  { href: "/admin/users", key: "users" as const },
  { href: "/admin/venues", key: "venues" as const },
  { href: "/admin/settings", key: "settings" as const },
];

export default function AdminDashboardPage() {
  const t = useT();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.admin.title}</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {links.map(({ href, key }) => (
          <Link key={href} href={href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="font-semibold">{t.admin[key]}</CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {t.admin.dashboard}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
