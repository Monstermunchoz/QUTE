"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Avatar } from "@/components/features/Avatar";
import { BackButton } from "@/components/ui/BackButton";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage, Profile } from "@/types";

type ChatRoomProps = {
  conversationId: string;
  currentUserId: string;
  other: Pick<Profile, "id" | "pseudo" | "photo_url">;
  initialMessages: ChatMessage[];
  pending?: boolean;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatRoom({
  conversationId,
  currentUserId,
  other,
  initialMessages,
  pending = false,
}: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const canSend = draft.trim().length >= 1 && draft.trim().length <= 1000 && !sending;

  function addMessage(message: ChatMessage) {
    setMessages((current) =>
      current.some((item) => item.id === message.id)
        ? current
        : [...current, message],
    );
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          addMessage(payload.new as ChatMessage);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId]);

  async function sendMessage() {
    const contenu = draft.trim();

    if (pending || contenu.length < 1 || contenu.length > 1000 || sending) {
      return;
    }

    setSending(true);
    setError(null);

    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        auteur_id: currentUserId,
        contenu,
      })
      .select("*")
      .single();

    setSending(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    if (data) {
      addMessage(data as ChatMessage);
    }

    setDraft("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col bg-[var(--bg)]">
      <header className="flex shrink-0 items-center gap-2 border-b border-[var(--border)] bg-[var(--bg)] py-1">
        <BackButton />
        <Avatar pseudo={other.pseudo} photoUrl={other.photo_url} size="sm" />
        <p className="truncate font-bold text-[var(--text)]">{other.pseudo}</p>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto py-4">
        {messages.length === 0 ? (
          <p className="pt-10 text-center text-sm text-[#888888]">
            Le premier mot, c&apos;est le plus dur.
          </p>
        ) : (
          messages.map((message) => {
            const mine = message.auteur_id === currentUserId;

            return (
              <div
                key={message.id}
                className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
              >
                <p
                  className={`max-w-[80%] px-4 py-2 text-sm text-white ${
                    mine
                      ? "rounded-[16px_4px_16px_16px]"
                      : "rounded-[4px_16px_16px_16px] bg-[#1E1E1E]"
                  }`}
                  style={
                    mine
                      ? {
                          background:
                            "linear-gradient(135deg, #FF2D87, #7B2FFF)",
                        }
                      : undefined
                  }
                >
                  {message.contenu}
                </p>
                <span className="mt-1 text-[12px] text-[#888888]">
                  {formatTime(message.created_at)}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {pending ? (
        <p className="border-t border-[#1E1E1E] pt-3 text-center text-sm text-[#FF2D87]">
          Message envoyé ! En attente de réponse.
        </p>
      ) : (
      <form
        className="flex shrink-0 items-end gap-2 border-t border-[#1E1E1E] bg-[#000000] pt-3"
        onSubmit={(event) => {
          event.preventDefault();
          void sendMessage();
        }}
      >
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value.slice(0, 1000))}
          onKeyDown={onKeyDown}
          maxLength={1000}
          rows={1}
          placeholder="Écris un message…"
          className="max-h-32 min-h-[44px] flex-1 resize-none rounded-[24px] border border-[#1E1E1E] bg-[#111111] px-4 py-3 text-sm text-white outline-none placeholder:text-[#555555]"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Envoyer"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #FF2D87, #7B2FFF)" }}
        >
          <svg
            className="icon"
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.8"
            aria-hidden
          >
            <path d="M5 12h12M13 6l6 6-6 6" />
          </svg>
        </button>
      </form>
      )}

      {error ? (
        <p className="pt-2 text-center text-sm text-[#FF4444]">{error}</p>
      ) : null}
    </div>
  );
}
