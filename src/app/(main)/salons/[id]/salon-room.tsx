"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Avatar } from "@/components/features/Avatar";
import { ProfileModal } from "@/components/features/ProfileModal";
import { SalonMembersModal } from "@/components/features/SalonMembersModal";
import { BackButton } from "@/components/ui/BackButton";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Salon, SalonMessage } from "@/types";

type Author = Pick<Profile, "id" | "pseudo" | "photo_url">;

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
              .select("id, pseudo, photo_url")
              .eq("id", message.auteur_id)
              .maybeSingle()
              .then(({ data }) => {
                if (data) {
                  setAuthors((current) => ({
                    ...current,
                    [data.id]: data as Author,
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
    <div className="flex h-[calc(100vh-12rem)] flex-col bg-[var(--bg)]">
      <header className="flex shrink-0 items-center gap-2 border-b border-[var(--border)] bg-[var(--bg)] py-1">
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

      <div className="flex-1 space-y-4 overflow-y-auto py-4">
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
              <div key={message.id} className="flex items-start gap-2">
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
                  />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white">{pseudo}</p>
                  <p
                    className={`mt-1 inline-block max-w-full px-4 py-2 text-sm text-white ${
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
                  <p className="mt-1 text-[12px] text-[#888888]">
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

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
          placeholder="Écris dans le salon…"
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
