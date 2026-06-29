"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import type { Player } from "@/lib/types";
import { MAX_AVATAR_BYTES } from "@/lib/avatar-constants";
import { deletePlayerAvatar, uploadPlayerAvatar } from "@/lib/api";
import { useT } from "@/lib/hooks/useLocale";
import { PlayerAvatar } from "@/components/profile/PlayerAvatar";
import { Button } from "@/components/ui/button";

interface AvatarUploadProps {
  player: Player;
  nickname: string;
  avatarColor: string;
  onUpdated: (player: Player) => void;
}

export function AvatarUpload({
  player,
  nickname,
  avatarColor,
  onUpdated,
}: AvatarUploadProps) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setError("");
    if (file.size > MAX_AVATAR_BYTES) {
      setError(t.profile.photoTooLarge);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError(t.profile.invalidPhotoType);
      return;
    }

    setUploading(true);
    try {
      const updated = await uploadPlayerAvatar(file);
      onUpdated(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.common.error);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    setError("");
    setUploading(true);
    try {
      const updated = await deletePlayerAvatar();
      onUpdated(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.common.error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <PlayerAvatar
          nickname={nickname}
          avatarColor={avatarColor}
          avatarUrl={player.avatar_url}
          size="lg"
        />
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      <div className="flex flex-wrap justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Camera className="mr-2 h-4 w-4" />
          {player.avatar_url ? t.profile.changePhoto : t.profile.uploadPhoto}
        </Button>
        {player.avatar_url && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={uploading}
            onClick={() => void handleRemove()}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t.profile.removePhoto}
          </Button>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground">{t.profile.photoHint}</p>
      {error && <p className="text-center text-sm text-destructive">{error}</p>}
    </div>
  );
}
