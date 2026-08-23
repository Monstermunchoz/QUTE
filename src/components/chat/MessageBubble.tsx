"use client";

import { detecterArnaque } from "@/lib/trust/detecter-arnaque";

type MessageBubbleProps = {
  contenu: string;
  mine: boolean;
  masque?: boolean;
  isStaff?: boolean;
  categorie?: string | null;
  timeLabel: string;
};

export function MessageBubble({
  contenu,
  mine,
  masque = false,
  isStaff = false,
  categorie,
  timeLabel,
}: MessageBubbleProps) {
  if (masque && !isStaff) {
    return null;
  }

  if (masque && isStaff) {
    return (
      <div className={`mb-3 flex flex-col ${mine ? "chat-row-out items-end" : "chat-row-in items-start"}`}>
        <p className="text-xs italic text-[#888888] opacity-40">
          [Message masqué par la modération]
        </p>
        <span className="chat-time">{timeLabel}</span>
      </div>
    );
  }

  return (
    <div
      className={`mb-3 flex flex-col ${mine ? "chat-row-out items-end" : "chat-row-in items-start"}`}
    >
      <p className={`chat-bubble ${mine ? "chat-bubble-out" : "chat-bubble-in"}`}>
        {contenu}
      </p>
      {!mine && detecterArnaque(categorie) ? (
        <p className="mt-1 flex items-center gap-1 text-xs text-amber-400">
          ⚠️ Sois prudent·e — QUTE ne demande jamais d&apos;argent ni de codes.
        </p>
      ) : null}
      <span className="chat-time">{timeLabel}</span>
    </div>
  );
}
