"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/features/Avatar";
import { Button } from "@/components/ui/Button";
import { abonnementLabel, isQutePlus } from "@/lib/abonnement";
import { friendLabel, isFriendLocked } from "@/lib/amis";
import { createClient } from "@/lib/supabase/client";
import { isJeSorsActive } from "@/lib/utils/je-sors";
import type { Ami, Conversation, JeSors, Profile } from "@/types";

type ProfileModalProps = {
  open: boolean;
  onClose: () => void;
  profileId: string | null;
  currentUserId: string;
};

export function ProfileModal({
  open,
  onClose,
  profileId,
  currentUserId,
}: ProfileModalProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jeSors, setJeSors] = useState(false);
  const [qrushed, setQrushed] = useState(false);
  const [relation, setRelation] = useState<Ami | null>(null);
  const [conversation, setConversation] = useState<Pick<
    Conversation,
    "id" | "statut"
  > | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [firstMessage, setFirstMessage] = useState("");
  const [pendingNotice, setPendingNotice] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mine = profileId === currentUserId;

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !profileId) {
      return;
    }

    const supabase = createClient();
    setError(null);
    setComposeOpen(false);
    setFirstMessage("");
    setPendingNotice(false);

    async function load() {
      const [{ data: profileRow }, { data: jeSorsRow }, { data: qrushRow }, { data: amiRows }, { data: conversationRow }] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("id", profileId).maybeSingle(),
          supabase
            .from("je_sors")
            .select("expires_at")
            .eq("user_id", profileId)
            .gt("expires_at", new Date().toISOString())
            .maybeSingle(),
          supabase
            .from("qrushs")
            .select("id")
            .eq("envoyeur_id", currentUserId)
            .eq("receveur_id", profileId)
            .maybeSingle(),
          supabase
            .from("amis")
            .select("*")
            .or(
              `and(demandeur_id.eq.${currentUserId},destinataire_id.eq.${profileId}),and(demandeur_id.eq.${profileId},destinataire_id.eq.${currentUserId})`,
            ),
          supabase
            .from("conversations")
            .select("id, statut")
            .or(
              `and(initiateur_id.eq.${currentUserId},destinataire_id.eq.${profileId}),and(initiateur_id.eq.${profileId},destinataire_id.eq.${currentUserId})`,
            )
            .maybeSingle(),
        ]);

      setProfile((profileRow as Profile | null) ?? null);
      setJeSors(
        Boolean(
          jeSorsRow &&
            isJeSorsActive(jeSorsRow as Pick<JeSors, "expires_at">),
        ),
      );
      setQrushed(Boolean(qrushRow));
      const ami = ((amiRows ?? []) as Ami[]).find(
        (item) => item.statut !== "refuse",
      );
      setRelation(ami ?? null);
      setConversation(
        (conversationRow as Pick<Conversation, "id" | "statut"> | null) ?? null,
      );
      setPendingNotice(conversationRow?.statut === "en_attente");
    }

    void load();
  }, [open, profileId, currentUserId]);

  async function sendQrush() {
    if (!profileId || qrushed) {
      return;
    }

    setLoading("qrush");
    setError(null);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("qrushs").insert({
      envoyeur_id: currentUserId,
      receveur_id: profileId,
    });
    setLoading(null);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setQrushed(true);
  }

  async function addFriend() {
    if (!profileId || isFriendLocked(relation)) {
      return;
    }

    setLoading("ami");
    setError(null);
    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("amis")
      .insert({
        demandeur_id: currentUserId,
        destinataire_id: profileId,
        statut: "en_attente",
      })
      .select("*")
      .single();
    setLoading(null);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setRelation(data as Ami);
  }

  async function sendFirstMessage() {
    if (!profileId) {
      return;
    }

    const contenu = firstMessage.trim();

    if (contenu.length < 1 || contenu.length > 1000) {
      setError("Le message doit faire entre 1 et 1000 caractères.");
      return;
    }

    setLoading("message");
    setError(null);
    const supabase = createClient();
    const { data: created, error: conversationError } = await supabase
      .from("conversations")
      .insert({
        statut: "en_attente",
        initiateur_id: currentUserId,
        destinataire_id: profileId,
      })
      .select("id")
      .single();

    if (conversationError || !created) {
      setLoading(null);
      setError(conversationError?.message ?? "Impossible d'envoyer le message.");
      return;
    }

    const { error: messageError } = await supabase.from("messages").insert({
      conversation_id: created.id,
      auteur_id: currentUserId,
      contenu,
    });
    setLoading(null);

    if (messageError) {
      setError(messageError.message);
      return;
    }

    setConversation({ id: created.id, statut: "en_attente" });
    setComposeOpen(false);
    setFirstMessage("");
    setPendingNotice(true);
  }

  async function startMessage() {
    setError(null);

    if (conversation?.statut === "acceptee" || conversation?.statut === "en_attente" || pendingNotice) {
      setPendingNotice(true);
      return;
    }

    setComposeOpen(true);
  }

  async function blockProfile() {
    if (!profileId) {
      return;
    }

    setLoading("block");
    setError(null);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("blocages").insert({
      bloqueur_id: currentUserId,
      bloque_id: profileId,
    });
    setLoading(null);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    onClose();
  }

  if (!open || !profileId) {
    return null;
  }

  const location = [profile?.ville, profile?.zone].filter(Boolean).join(" · ");

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative max-h-[90vh] w-full max-w-[400px] overflow-y-auto rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-8"
      >
        <button
          type="button"
          aria-label="Fermer"
          onClick={onClose}
          className="absolute right-4 top-4 text-xl text-[#888888] hover:text-white"
        >
          ✕
        </button>

        {profile ? (
          <div className="flex flex-col items-center text-center">
            <Avatar
              pseudo={profile.pseudo}
              photoUrl={profile.photo_url}
              size="lg"
            />
            <h2 className="mt-4 text-[22px] font-bold text-white">
              {profile.pseudo}
            </h2>
            <p className="mt-1 text-sm text-[#888888]">
              {location || "Lyon Métropole"}
            </p>
            {isQutePlus(profile.abonnement) ? (
              <span className="mt-2 rounded-[8px] bg-[#FF2D87] px-2 py-1 text-[10px] font-bold text-white">
                {abonnementLabel(profile.abonnement)}
              </span>
            ) : null}
            {jeSors ? (
              <span className="mt-2 rounded-[8px] bg-[#FF2D87] px-2 py-1 text-xs font-bold text-white">
                🔥 Sort ce soir
              </span>
            ) : null}
            {profile.bio ? (
              <p className="mt-4 text-sm text-white">{profile.bio}</p>
            ) : null}
            {profile.ce_que_je_cherche ? (
              <div className="mt-4 w-full rounded-[12px] border border-[#1E1E1E] bg-[#000000] p-3 text-left">
                <p className="text-[13px] text-[#888888]">Ce que je cherche</p>
                <p className="mt-1 text-sm text-white">
                  {profile.ce_que_je_cherche}
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-[#888888]">
            Chargement du profil…
          </p>
        )}

        {!mine && profile ? (
          <div className="mt-6 flex flex-col gap-2">
            <Button
              type="button"
              label={qrushed ? "QRUSHé ✓" : "QRUSH 💫"}
              disabled={qrushed}
              loading={loading === "qrush"}
              onClick={() => void sendQrush()}
            />
            <Button
              type="button"
              label={friendLabel(relation, currentUserId)}
              variant="secondary"
              disabled={isFriendLocked(relation)}
              loading={loading === "ami"}
              onClick={() => void addFriend()}
            />
            <Button
              type="button"
              label="Envoyer un message"
              variant="secondary"
              loading={loading === "message"}
              onClick={() => void startMessage()}
            />
            {pendingNotice ? (
              <p className="text-sm text-[#FF2D87]">
                {conversation?.statut === "acceptee"
                  ? "Vous avez déjà une conversation."
                  : "Message envoyé ! En attente de réponse."}
              </p>
            ) : null}
            {composeOpen ? (
              <div className="flex flex-col gap-2">
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
                  loading={loading === "message"}
                  onClick={() => void sendFirstMessage()}
                />
              </div>
            ) : null}
            <Button
              type="button"
              label="Voir le profil complet"
              variant="ghost"
              onClick={() => {
                onClose();
                router.push(`/explorer/${profileId}`);
              }}
            />
            <button
              type="button"
              onClick={() => void blockProfile()}
              className="mt-2 text-sm text-[#FF4444]"
            >
              Bloquer
            </button>
            {error ? <p className="text-sm text-[#FF4444]">{error}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
