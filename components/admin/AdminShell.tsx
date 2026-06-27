"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useT } from "@/lib/hooks/useLocale";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", labelKey: "dashboard" as const },
  { href: "/admin/games", labelKey: "games" as const },
  { href: "/admin/users", labelKey: "users" as const },
  { href: "/admin/venues", labelKey: "venues" as const },
  { href: "/admin/settings", labelKey: "settings" as const },
];

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const t = useT();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        {t.common.loading}
      </div>
    );
  }

  if (!user) {
    router.replace("/onboarding");
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6">
        <h1 className="text-xl font-bold">{t.admin.forbidden}</h1>
        <p className="text-center text-muted-foreground">{t.admin.forbiddenHint}</p>
        <Link href="/" className="text-primary underline">
          {t.admin.backToApp}
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}

export function AdminNav() {
  const pathname = usePathname();
  const t = useT();

  return (
    <nav className="flex flex-wrap gap-2 border-b bg-muted/40 p-4">
      {navItems.map(({ href, labelKey }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            )}
          >
            {t.admin[labelKey]}
          </Link>
        );
      })}
      <Link
        href="/"
        className="ml-auto rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
      >
        {t.admin.backToApp}
      </Link>
    </nav>
  );
}
