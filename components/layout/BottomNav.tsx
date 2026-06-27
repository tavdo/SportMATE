"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, CalendarDays, User } from "lucide-react";
import { ka } from "@/lib/i18n/ka";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: ka.nav.map, icon: Map },
  { href: "/my-games", label: ka.nav.myGames, icon: CalendarDays },
  { href: "/profile", label: ka.nav.profile, icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/onboarding" || pathname.startsWith("/create") || pathname.startsWith("/session/")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 safe-bottom">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
