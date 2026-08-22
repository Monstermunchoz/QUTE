"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/features/Avatar";
import { OpenChatButton } from "./open-chat-button";
import { PendingActions } from "./pending-actions";
import type { Conversation, Match, Profile, Qrush } from "@/types";

type QuteHubProps = {
  currentUserId: string;
  matches: Match[];
  pending: Conversation[];
  qrushs: Qrush[];
  profilesById: Record<string, Profile>;
  initialTab?: "matchs" | "attente" | "qrush";
};

export function QuteHub({
  currentUserId,
  matches,
  pending,
  qrushs,
  profilesById,
  initialTab,
}: QuteHubProps) {
  const [tab, setTab] = useState<"matchs" | "attente" | "qrush">(
    initialTab ?? (pending.length > 0 ? "attente" : "matchs"),
  );

  useEffect(() => {
    if (initialTab) {
      setTab(initialTab);
    }
  }, [initialTab]);

  return (
    <main className="flex flex-col gap-4 bg-[#000000] pb-4">
      <header>
        <h1 className="page-title text-white">QUTE</h1>
        <p className="page-copy text-[#888888]">Matchs, QRUSH et messages.</p>
      </header>

      <div className="tabs-scroll flex gap-2">
        <button
          type="button"
          onClick={() => setTab("matchs")}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
            tab === "matchs" ? "text-[#FF2D87]" : "text-[#888888]"
          }`}
        >
          Matchs
        </button>
        <button
          type="button"
          onClick={() => setTab("qrush")}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
            tab === "qrush" ? "text-[#FF2D87]" : "text-[#888888]"
          }`}
        >
          QRUSH
          {qrushs.length > 0 ? (
            <span className="ml-2 rounded-full bg-[#FF4444] px-2 py-0.5 text-[10px] text-white">
              {qrushs.length}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setTab("attente")}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
            tab === "attente" ? "text-[#FF2D87]" : "text-[#888888]"
          }`}
        >
          Messages en attente
          {pending.length > 0 ? (
            <span className="ml-2 rounded-full bg-[#FF4444] px-2 py-0.5 text-[10px] text-white">
              {pending.length}
            </span>
          ) : null}
        </button>
      </div>

      {tab === "qrush" ? (
        qrushs.length === 0 ? (
          <p className="pt-16 text-center text-[#888888]">
            Personne ne t&apos;a encore QRUSHé.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {qrushs.map((qrush) => {
              const profile = profilesById[qrush.envoyeur_id];
              const pseudo = profile?.pseudo ?? "QUTE";

              return (
                <li key={qrush.id}>
                  <Link
                    href={`/explorer/${qrush.envoyeur_id}`}
                    className="flex items-center gap-3 rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-4"
                  >
                    <Avatar
                      pseudo={pseudo}
                      photoUrl={profile?.photo_url}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-white">{pseudo}</p>
                      <p className="text-sm text-[#888888]">T&apos;a QRUSHé</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )
      ) : null}

      {tab === "matchs" ? (
        matches.length === 0 ? (
          <p className="pt-16 text-center text-[#888888]">
            Pas encore de match. Va QRUSHer quelqu&apos;un ! 😏
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {matches.map((match) => {
              const otherId =
                match.user1_id === currentUserId
                  ? match.user2_id
                  : match.user1_id;
              const profile = profilesById[otherId];
              const pseudo = profile?.pseudo ?? "QUTE";

              return (
                <li
                  key={match.id}
                  className="flex flex-col gap-3 rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      pseudo={pseudo}
                      photoUrl={profile?.photo_url}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-white">{pseudo}</p>
                      <p className="text-sm text-[#888888]">
                        {profile?.ville || "Lyon Métropole"}
                      </p>
                    </div>
                  </div>
                  <OpenChatButton matchId={match.id} />
                </li>
              );
            })}
          </ul>
        )
      ) : null}

      {tab === "attente" ? (
        pending.length === 0 ? (
          <p className="pt-16 text-center text-[#888888]">
            Aucun message en attente.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {pending.map((conversation) => {
              const otherId = conversation.initiateur_id ?? "";
              const profile = profilesById[otherId];
              const pseudo = profile?.pseudo ?? "QUTE";

              return (
                <li
                  key={conversation.id}
                  className="flex flex-col gap-3 rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      pseudo={pseudo}
                      photoUrl={profile?.photo_url}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-white">{pseudo}</p>
                      <p className="text-sm text-[#888888]">
                        Tu as un message en attente
                      </p>
                    </div>
                  </div>
                  <PendingActions conversationId={conversation.id} />
                </li>
              );
            })}
          </ul>
        )
      ) : null}
    </main>
  );
}
