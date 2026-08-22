"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Avatar } from "@/components/features/Avatar";
import { ProfileModal } from "@/components/features/ProfileModal";
import { SalonMembersModal } from "@/components/features/SalonMembersModal";
import { BackButton } from "@/components/ui/BackButton";
import { BadgeAbonnement } from "@/components/ui/BadgeAbonnement";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Salon, SalonMessage } from "@/types";

type Author = Pick<Profile, "id" | "pseudo" | "photo_url" | "abonnement" | "role">;

type SalonRoomProps = {
  salon: Salon;
  currentUserId: string;
  initialMessages: SalonMessage[];
  authors: Record<string, Author>;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SalonRoom({
  salon,
  currentUserId,
  initialMessages,
  authors: initialAuthors,
}: SalonRoomProps) {
  const [messages, setMessages] = useState<SalonMessage[]>(initialMessages);
  const [authors, setAuthors] = useState<Record<string, Author>>(initialAuthors);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [membersOpen, setMembersOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const memberCount = useMemo(
    () => new Set(messages.map((message) => message.auteur_id)).size,
    [messages],
  );
  const canSend =
    draft.trim().length >= 1 && draft.trim().length <= 1000 && !sending;

  const authorsRef = useRef(initialAuthors);
  authorsRef.current = authors;

  function addMessage(message: SalonMessage) {
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
      .channel(`salon-messages:${salon.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "salon_messages",
          filter: `salon_id=eq.${salon.id}`,
        },
        (payload) => {
          const message = payload.new as SalonMessage;
          addMessage(message);

          if (!authorsRef.current[message.auteur_id]) {
            void supabase
              .from("profiles")
              .select("id, pseudo, photo_url, photo_status, abonnement, role")
              .eq("id", message.auteur_id)
              .maybeSingle()
              .then(({ data }) => {
                if (data) {
                  const row = data as Author & { photo_status?: string };
                  setAuthors((current) => ({
                    ...current,
                    [row.id]: {
                      id: row.id,
                      pseudo: row.pseudo,
                      photo_url: row.photo_status === "approved" ? row.photo_url : null,
                      abonnement: row.abonnement,
                      role: row.role,
                    },
                  }));
                }
              });
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [salon.id]);

  async function sendMessage() {
    const contenu = draft.trim();

    if (contenu.length < 1 || contenu.length > 1000 || sending) {
      return;
    }

    setSending(true);
    setError(null);

    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("salon_messages")
      .insert({
        salon_id: salon.id,
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
      addMessage(data as SalonMessage);
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
      <header className="flex min-w-0 shrink-0 items-center gap-2 border-b border-[#1E1E1E] bg-[var(--bg)] px-2 py-2">
        <BackButton />
        <div className="min-w-0">
          <h1 className="truncate font-bold text-[var(--text)]">{salon.nom}</h1>
          <button
            type="button"
            onClick={() => setMembersOpen(true)}
            className="text-left text-xs font-bold text-[#FF2D87]"
          >
            {memberCount} personne{memberCount === 1 ? "" : "s"} dans ce salon
          </button>
        </div>
      </header>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <p className="pt-10 text-center text-sm text-[#888888]">
            Le salon est encore calme. Lance le débat.
          </p>
        ) : (
          messages.map((message) => {
            const author = authors[message.auteur_id];
            const mine = message.auteur_id === currentUserId;
            const pseudo = author?.pseudo ?? "QUTE";

            return (
              <div
                key={message.id}
                className={`mb-3 flex items-start gap-2 ${
                  mine ? "chat-row-out flex-row-reverse" : "chat-row-in"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setProfileId(message.auteur_id)}
                  aria-label={`Voir le profil de ${pseudo}`}
                  className="shrink-0"
                >
                  <Avatar
                    pseudo={pseudo}
                    photoUrl={author?.photo_url}
                    size="sm"
                    abonnement={author?.abonnement}
                    role={author?.role}
                  />
                </button>
                <div
                  className={`min-w-0 max-w-[75%] ${mine ? "items-end text-right" : ""}`}
                >
                  <p
                    className={`flex items-center gap-1.5 text-sm font-bold text-white ${
                      mine ? "justify-end" : ""
                    }`}
                  >
                    {pseudo}
                    <BadgeAbonnement
                      abonnement={author?.abonnement}
                      role={author?.role}
                    />
                  </p>
                  <p
                    className={`chat-bubble ${mine ? "chat-bubble-out" : "chat-bubble-in"}`}
                  >
                    {message.contenu}
                  </p>
                  <p className="chat-time">{formatTime(message.created_at)}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

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
          placeholder="Écris dans le salon…"
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

      {error ? (
        <p className="pt-2 text-center text-sm text-[#FF4444]">{error}</p>
      ) : null}

      <SalonMembersModal
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
        salonId={salon.id}
        onSelect={(id) => {
          setMembersOpen(false);
          setProfileId(id);
        }}
      />
      <ProfileModal
        open={Boolean(profileId)}
        onClose={() => setProfileId(null)}
        profileId={profileId}
        currentUserId={currentUserId}
      />
    </div>
  );
}
