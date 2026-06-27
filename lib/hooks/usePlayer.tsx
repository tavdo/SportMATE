"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/hooks/useAuth";
import type { Player } from "@/lib/types";

interface PlayerContextValue {
  player: Player | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setPlayer: (player: Player) => void;
}

const PlayerContext = createContext<PlayerContextValue>({
  player: null,
  loading: true,
  refresh: async () => {},
  setPlayer: () => {},
});

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const refresh = useCallback(async () => {
    if (!user) {
      setPlayer(null);
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch<Player>("/api/players/me");
      setPlayer(data);
    } catch {
      setPlayer(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    refresh();
  }, [authLoading, refresh]);

  useEffect(() => {
    if (authLoading || loading) return;
    if (pathname.startsWith("/admin")) return;

    if (!user && pathname !== "/onboarding") {
      router.replace("/onboarding");
      return;
    }

    if (user && !player && pathname !== "/onboarding") {
      router.replace("/onboarding");
      return;
    }

    if (user && player && pathname === "/onboarding") {
      router.replace("/");
    }
  }, [authLoading, loading, user, player, pathname, router]);

  return (
    <PlayerContext.Provider value={{ player, loading: authLoading || loading, refresh, setPlayer }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
