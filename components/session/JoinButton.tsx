"use client";

import { useState } from "react";
import { ka } from "@/lib/i18n/ka";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import type { SessionDetail } from "@/lib/types";

interface JoinButtonProps {
  session: SessionDetail;
  isJoined: boolean;
  isHost: boolean;
  onUpdate: () => void;
}

export function JoinButton({
  session,
  isJoined,
  isHost,
  onUpdate,
}: JoinButtonProps) {
  const [loading, setLoading] = useState(false);
  const isFull = session.current_players >= session.max_players;
  const isPast = new Date(session.starts_at) < new Date();
  const isCancelled = session.status === "cancelled";

  async function handleJoin() {
    setLoading(true);
    try {
      await apiFetch(`/api/sessions/${session.id}/join`, { method: "POST" });
      onUpdate();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleLeave() {
    setLoading(true);
    try {
      await apiFetch(`/api/sessions/${session.id}/leave`, { method: "POST" });
      onUpdate();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!confirm(ka.session.cancel + "?")) return;
    setLoading(true);
    try {
      await apiFetch(`/api/sessions/${session.id}/cancel`, { method: "POST" });
      onUpdate();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (isCancelled) {
    return (
      <Button disabled className="w-full" variant="secondary">
        {ka.session.cancelled}
      </Button>
    );
  }

  if (isPast) {
    return (
      <Button disabled className="w-full" variant="secondary">
        {ka.session.done}
      </Button>
    );
  }

  if (isHost) {
    return (
      <Button
        className="w-full"
        variant="destructive"
        onClick={handleCancel}
        disabled={loading}
      >
        {ka.session.cancel}
      </Button>
    );
  }

  if (isJoined) {
    return (
      <Button
        className="w-full"
        variant="outline"
        onClick={handleLeave}
        disabled={loading}
      >
        {ka.session.leave}
      </Button>
    );
  }

  if (isFull) {
    return (
      <Button disabled className="w-full" variant="secondary">
        {ka.session.full}
      </Button>
    );
  }

  return (
    <Button className="w-full" size="lg" onClick={handleJoin} disabled={loading}>
      {ka.session.join}
    </Button>
  );
}
