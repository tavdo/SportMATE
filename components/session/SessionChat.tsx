"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import type { SessionMessage } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import { getFirestoreDb } from "@/lib/firebase-client";
import { useLocale, useT } from "@/lib/hooks/useLocale";
import { formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SessionChatProps {
  sessionId: string;
  currentUserId: string;
  disabled?: boolean;
}

export function SessionChat({
  sessionId,
  currentUserId,
  disabled = false,
}: SessionChatProps) {
  const t = useT();
  const { locale } = useLocale();
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const db = getFirestoreDb();
    if (!db) return;

    const q = query(
      collection(db, "sessions", sessionId, "messages"),
      orderBy("created_at", "asc"),
      limit(200)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const next = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as SessionMessage
        );
        setMessages(next);
      },
      () => setMessages([])
    );

    return () => unsub();
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending || disabled) return;

    setSending(true);
    setError("");

    try {
      await apiFetch<SessionMessage>(`/api/sessions/${sessionId}/messages`, {
        method: "POST",
        body: JSON.stringify({ text: trimmed }),
      });
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setSending(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <h2 className="text-base font-semibold">{t.session.chat}</h2>
        <p className="text-sm text-muted-foreground">{t.session.chatHint}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          ref={listRef}
          className="max-h-64 space-y-3 overflow-y-auto rounded-xl border bg-muted/20 p-3"
        >
          {messages.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t.session.chatEmpty}
            </p>
          ) : (
            messages.map((msg) => {
              const isMine = msg.player_id === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={cn("flex gap-2", isMine && "flex-row-reverse")}
                >
                  <div
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: msg.avatar_color }}
                  >
                    {msg.nickname.charAt(0).toUpperCase()}
                  </div>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3 py-2",
                      isMine
                        ? "bg-primary text-primary-foreground"
                        : "border bg-background"
                    )}
                  >
                    <div
                      className={cn(
                        "mb-0.5 flex items-center gap-2 text-xs",
                        isMine ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}
                    >
                      <span className="font-medium">{msg.nickname}</span>
                      <span>{formatTime(msg.created_at, locale)}</span>
                    </div>
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                      {msg.text}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.session.chatPlaceholder}
            maxLength={500}
            disabled={disabled || sending}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={disabled || sending || !text.trim()}
            aria-label={t.session.chatSend}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
