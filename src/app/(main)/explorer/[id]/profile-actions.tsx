"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MatchModal } from "@/components/features/MatchModal";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { friendLabel, isFriendLocked } from "@/lib/amis";
import { openConversation } from "@/app/(main)/qute/actions";
import { qrushDuJour, quotaQrushAtteint } from "@/lib/qrush";
import type { Ami, Conversation } from "@/types";

type ProfileActionsProps = {
  profileId: string;
  currentUserId: string;
  alreadyQrushed: boolean;
  hasMatch: boolean;
  matchId: string | null;
  existingConversation: Pick<Conversation, "id" | "statut"> | null;
  friendRelation: Ami | null;
};

function matchPair(userId: string, profileId: string) {
  return userId < profileId
    ? { user1_id: userId, user2_id: profileId }
    : { user1_id: profileId, user2_id: userId };
}

export function ProfileActions({
  profileId,
  currentUserId,
  alreadyQrushed,
  hasMatch,
  matchId,
  existingConversation,
  friendRelation,
}: ProfileActionsProps) {
  const router = useRouter();
  const [qrushed, setQrushed] = useState(alreadyQrushed);
  const [relation, setRelation] = useState<Ami | null>(friendRelation);
  const [qrushLoading, setQrushLoading] = useState(false);
  const [friendLoading, setFriendLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [firstMessage, setFirstMessage] = useState("");
  const [pendingNotice, setPendingNotice] = useState(
    existingConversation?.statut === "en_attente",
  );
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportDone, setReportDone] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendQrush() {
    if (qrushed) {
      return;
    }

    setError(null);
    setQrushLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: me } = await supabase
      .from("profiles")
      .select("abonnement, abonnement_statut")
      .eq("id", user.id)
      .maybeSingle();
    const used = await qrushDuJour(supabase, user.id);

    if (quotaQrushAtteint(me, used)) {
      setQrushLoading(false);
      setError(
        "Tu as utilisé tes 20 QRUSH du jour. Passe à QUTE+ pour en envoyer sans limite.",
      );
      return;
    }

    const { error: insertError } = await supabase.from("qrushs").insert({
      envoyeur_id: user.id,
      receveur_id: profileId,
    });

    if (insertError) {
      setQrushLoading(false);
      setError(
        insertError.message.includes("quota_qrush")
          ? "Tu as utilisé tes 20 QRUSH du jour. Passe à QUTE+ pour en envoyer sans limite."
          : insertError.message,
      );
      return;
    }

    setQrushed(true);

    const pair = matchPair(user.id, profileId);
    const { data: match } = await supabase
      .from("matchs")
      .select("id")
      .eq("user1_id", pair.user1_id)
      .eq("user2_id", pair.user2_id)
      .maybeSingle();

    setQrushLoading(false);

    if (match) {
      setMatchOpen(true);
    }
  }

  async function addFriend() {
    if (isFriendLocked(relation)) {
      return;
    }

    setError(null);
    setFriendLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error: insertError } = await supabase
      .from("amis")
      .insert({
        demandeur_id: user.id,
        destinataire_id: profileId,
        statut: "en_attente",
      })
      .select("*")
      .single();

    setFriendLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setRelation(data as Ami);
  }

  async function openOrStartMessage() {
    setError(null);

    if (existingConversation?.statut === "acceptee") {
      router.push(`/qute/${existingConversation.id}`);
      return;
    }

    if (hasMatch && matchId) {
      await openConversation(matchId);
      return;
    }

    if (existingConversation?.statut === "en_attente" || pendingNotice) {
      setPendingNotice(true);
      return;
    }

    setComposeOpen(true);
  }

  async function sendFirstMessage() {
    const contenu = firstMessage.trim();

    if (contenu.length < 1 || contenu.length > 1000) {
      setError("Le message doit faire entre 1 et 1000 caractères.");
      return;
    }

    setMessageLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .insert({
        statut: "en_attente",
        initiateur_id: user.id,
        destinataire_id: profileId,
      })
      .select("id")
      .single();

    if (conversationError || !conversation) {
      setMessageLoading(false);
      setError(conversationError?.message ?? "Impossible d'envoyer le message.");
      return;
    }

    const { error: messageError } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      auteur_id: user.id,
      contenu,
    });

    setMessageLoading(false);

    if (messageError) {
      setError(messageError.message);
      return;
    }

    setComposeOpen(false);
    setFirstMessage("");
    setPendingNotice(true);
  }

  async function blockProfile() {
    setError(null);
    setBlockLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error: insertError } = await supabase.from("blocages").insert({
      bloqueur_id: user.id,
      bloque_id: profileId,
    });

    setBlockLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push("/explorer");
    router.refresh();
  }

  async function submitReport() {
    const raison = reportReason.trim();

    if (raison.length < 1 || raison.length > 500) {
      setError("La raison doit faire entre 1 et 500 caractères.");
      return;
    }

    setReportLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error: insertError } = await supabase.from("signalements").insert({
      rapporteur_id: user.id,
      cible_id: profileId,
      type: "profil",
      raison,
    });

    setReportLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setReportOpen(false);
    setReportReason("");
    setReportDone(true);
  }

  return (
    <>
      <div className="mt-6 flex w-full flex-col gap-3">
        <Button
          type="button"
          label={qrushed ? "QRUSHé ✓" : "QRUSH 💫"}
          disabled={qrushed}
          loading={qrushLoading}
          onClick={() => void sendQrush()}
        />
        <Button
          type="button"
          label={friendLabel(relation, currentUserId)}
          variant="secondary"
          disabled={isFriendLocked(relation)}
          loading={friendLoading}
          onClick={() => void addFriend()}
        />
        <Button
          type="button"
          label="Envoyer un message"
          variant="secondary"
          loading={messageLoading}
          onClick={() => void openOrStartMessage()}
        />
        {pendingNotice ? (
          <p className="text-sm text-[#FF2D87]">
            Message envoyé ! En attente de réponse.
          </p>
        ) : null}
        {composeOpen ? (
          <div className="flex flex-col gap-3 rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-4 text-left">
            <textarea
              value={firstMessage}
              onChange={(event) =>
                setFirstMessage(event.target.value.slice(0, 1000))
              }
              maxLength={1000}
              rows={3}
              placeholder="Écris un premier message…"
              className="w-full rounded-[12px] border border-[#333333] bg-[#1E1E1E] px-4 py-3 text-sm text-white outline-none placeholder:text-[#555555]"
            />
            <Button
              type="button"
              label="Envoyer"
              loading={messageLoading}
              onClick={() => void sendFirstMessage()}
            />
            <Button
              type="button"
              label="Annuler"
              variant="ghost"
              onClick={() => setComposeOpen(false)}
            />
          </div>
        ) : null}
        <button
          type="button"
          disabled={blockLoading}
          onClick={() => void blockProfile()}
          className="mt-2 text-sm text-[#FF4444]"
        >
          Bloquer
        </button>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setReportOpen(true);
          }}
          className="text-sm text-[var(--text-muted)]"
        >
          Signaler
        </button>
        {reportDone ? (
          <p className="text-sm text-[#FF2D87]">Signalement envoyé. Merci.</p>
        ) : null}
        {error ? <p className="text-sm text-[#FF4444]">{error}</p> : null}
      </div>

      {reportOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-title"
        >
          <div className="modal-shell rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-6">
            <h2 id="report-title" className="text-xl font-bold text-white">
              Signaler ce profil
            </h2>
            <textarea
              value={reportReason}
              onChange={(event) =>
                setReportReason(event.target.value.slice(0, 500))
              }
              maxLength={500}
              rows={4}
              placeholder="Pourquoi tu signales ?"
              className="mt-4 w-full rounded-[12px] border border-[#333333] bg-[#1E1E1E] px-4 py-3 text-sm text-white outline-none placeholder:text-[#555555]"
            />
            <p className="mt-1 text-right text-xs text-[#888888]">
              {reportReason.length}/500
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Button
                type="button"
                label="Envoyer"
                loading={reportLoading}
                onClick={() => void submitReport()}
              />
              <Button
                type="button"
                label="Annuler"
                variant="ghost"
                onClick={() => setReportOpen(false)}
              />
            </div>
          </div>
        </div>
      ) : null}

      <MatchModal
        open={matchOpen}
        onClose={() => setMatchOpen(false)}
        onSeeMatches={() => {
          setMatchOpen(false);
          router.push("/qute");
        }}
      />
    </>
  );
}
