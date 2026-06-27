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
import { getOrCreateDeviceId } from "@/lib/device";
import { apiFetch } from "@/lib/api";
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
  const router = useRouter();
  const pathname = usePathname();

  const refresh = useCallback(async () => {
    const deviceId = getOrCreateDeviceId();
    if (!deviceId) {
      setPlayer(null);
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch<Player>(`/api/players/${deviceId}/profile`);
      setPlayer(data);
    } catch {
      setPlayer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (loading) return;
    if (!player && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [loading, player, pathname, router]);

  return (
    <PlayerContext.Provider value={{ player, loading, refresh, setPlayer }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
