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
  const canSend =
    draft.trim().length >= 1 && draft.trim().length <= 1000 && !sending;

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
    <div className="chat-shell">
      <header className="flex shrink-0 items-center gap-2 border-b border-[#1E1E1E] bg-[var(--bg)] px-2 py-2">
        <BackButton />
        <Avatar pseudo={other.pseudo} photoUrl={other.photo_url} size="sm" />
        <p className="truncate font-bold text-[var(--text)]">{other.pseudo}</p>
      </header>

      <div className="chat-messages">
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
                  className={`chat-bubble ${mine ? "chat-bubble-out" : "chat-bubble-in"}`}
                >
                  {message.contenu}
                </p>
                <span className="chat-time">{formatTime(message.created_at)}</span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {pending ? (
        <p className="border-t border-[#1E1E1E] px-4 py-3 text-center text-sm text-[#FF2D87]">
          Message envoyé ! En attente de réponse.
        </p>
      ) : (
        <form
          className="chat-composer"
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
            className="flex-1 resize-none border border-[#1E1E1E] bg-[#111111] px-4 text-white outline-none placeholder:text-[#555555]"
          />
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Envoyer"
            className="chat-send flex items-center justify-center disabled:opacity-40"
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
        <p className="px-4 pb-2 text-center text-sm text-[#FF4444]">{error}</p>
      ) : null}
    </div>
  );
}
