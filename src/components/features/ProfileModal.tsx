"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/features/Avatar";
import { BadgeList } from "@/components/ui/ChipSelect";
import { Button } from "@/components/ui/Button";
import { abonnementLabel, isQutePlus } from "@/lib/abonnement";
import { friendLabel, isFriendLocked } from "@/lib/amis";
import { canSeeChamp } from "@/lib/profile/options";
import { createClient } from "@/lib/supabase/client";
import { getAge } from "@/lib/utils/age";
import { isJeSorsActive } from "@/lib/utils/je-sors";
import type { AlbumPhoto, Ami, Conversation, JeSors, Profile } from "@/types";

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
  const [album, setAlbum] = useState<Pick<AlbumPhoto, "id" | "url">[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [jeSors, setJeSors] = useState(false);
  const [jeSorsLieu, setJeSorsLieu] = useState<string | null>(null);
  const [isMatch, setIsMatch] = useState(false);
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
        if (lightbox) {
          setLightbox(null);
          return;
        }
        onClose();
      }
    }

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, lightbox]);

  useEffect(() => {
    if (!open || !profileId) {
      return;
    }

    const supabase = createClient();
    setError(null);
    setComposeOpen(false);
    setFirstMessage("");
    setPendingNotice(false);
    setLightbox(null);

    async function load() {
      const pair =
        currentUserId < profileId!
          ? { user1_id: currentUserId, user2_id: profileId }
          : { user1_id: profileId, user2_id: currentUserId };

      const [
        { data: profileRow },
        { data: jeSorsRow },
        { data: qrushRow },
        { data: amiRows },
        { data: conversationRow },
        { data: albumRows },
        { data: matchRow },
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", profileId).maybeSingle(),
        supabase
          .from("je_sors")
          .select("expires_at, lieu_id, lieu_libre")
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
        supabase
          .from("photos")
          .select("id, url, ordre")
          .eq("user_id", profileId)
          .eq("statut", "approved")
          .order("ordre", { ascending: true })
          .limit(6),
        supabase
          .from("matchs")
          .select("id")
          .eq("user1_id", pair.user1_id)
          .eq("user2_id", pair.user2_id)
          .maybeSingle(),
      ]);

      const loaded = (profileRow as Profile | null) ?? null;
      setProfile(loaded);
      setAlbum((albumRows ?? []) as Pick<AlbumPhoto, "id" | "url">[]);
      setIsMatch(Boolean(matchRow));

      const outing = jeSorsRow as
        | (Pick<JeSors, "expires_at" | "lieu_libre"> & { lieu_id?: string | null })
        | null;
      const active = Boolean(outing && isJeSorsActive(outing));
      setJeSors(active);

      if (active && outing?.lieu_id) {
        const { data: lieuRow } = await supabase
          .from("lieux")
          .select("nom")
          .eq("id", outing.lieu_id)
          .maybeSingle();
        setJeSorsLieu(
          (lieuRow as { nom?: string } | null)?.nom ??
            outing.lieu_libre ??
            null,
        );
      } else {
        setJeSorsLieu(outing?.lieu_libre ?? null);
      }

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

    if (
      conversation?.statut === "acceptee" ||
      conversation?.statut === "en_attente" ||
      pendingNotice
    ) {
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

  const age = profile?.age_visible ? getAge(profile.date_naissance) : null;
  const location = [profile?.ville, profile?.zone].filter(Boolean).join(" · ");
  const showIdentites =
    mine || canSeeChamp(profile?.visibilite_identites, isMatch);
  const showOrientations =
    mine || canSeeChamp(profile?.visibilite_orientations, isMatch);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="modal-shell relative rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-8"
      >
        <div className="modal-header -mx-8 -mt-8 mb-4 flex justify-end bg-[var(--surface)] px-4 py-3">
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="text-xl text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            ✕
          </button>
        </div>

        {profile ? (
          <div className="flex flex-col items-center text-center">
            <Avatar
              pseudo={profile.pseudo}
              photoUrl={profile.photo_url}
              size="lg"
            />
            <h2 className="mt-4 text-[22px] font-bold text-[var(--text)]">
              {profile.pseudo}
              {age != null ? (
                <span className="font-normal text-[var(--text-muted)]">
                  , {age}
                </span>
              ) : null}
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {location || "Lyon Métropole"}
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {isQutePlus(profile.abonnement) ? (
                <span className="rounded-[8px] bg-[#FF2D87] px-2 py-1 text-[10px] font-bold text-white">
                  {abonnementLabel(profile.abonnement)}
                </span>
              ) : null}
              {jeSors ? (
                <span className="rounded-[8px] bg-[#FF2D87] px-2 py-1 text-xs font-bold text-white">
                  🔥 Sort ce soir
                  {jeSorsLieu ? ` · ${jeSorsLieu}` : ""}
                </span>
              ) : null}
            </div>
            {profile.bio ? (
              <p className="mt-4 w-full text-left text-sm text-[var(--text)]">
                {profile.bio}
              </p>
            ) : null}
            {showIdentites && (profile.identites ?? []).length > 0 ? (
              <div className="mt-4 w-full text-left">
                <p className="mb-2 text-[13px] text-[var(--text-muted)]">
                  Identités
                </p>
                <BadgeList items={profile.identites} />
              </div>
            ) : null}
            {showOrientations && (profile.orientations ?? []).length > 0 ? (
              <div className="mt-4 w-full text-left">
                <p className="mb-2 text-[13px] text-[var(--text-muted)]">
                  Orientations
                </p>
                <BadgeList items={profile.orientations} />
              </div>
            ) : null}
            {(profile.recherche ?? []).length > 0 || profile.ce_que_je_cherche ? (
              <div className="mt-4 w-full rounded-[12px] border border-[var(--border)] bg-[var(--bg)] p-3 text-left">
                <p className="text-[13px] text-[var(--text-muted)]">
                  Ce que je cherche
                </p>
                {(profile.recherche ?? []).length > 0 ? (
                  <div className="mt-2">
                    <BadgeList items={profile.recherche ?? []} />
                  </div>
                ) : null}
                {profile.ce_que_je_cherche ? (
                  <p className="mt-2 text-sm text-[var(--text)]">
                    {profile.ce_que_je_cherche}
                  </p>
                ) : null}
              </div>
            ) : null}
            {(profile.interets ?? []).length > 0 ? (
              <div className="mt-4 w-full text-left">
                <p className="mb-2 text-[13px] text-[var(--text-muted)]">
                  Centres d&apos;intérêt
                </p>
                <BadgeList items={profile.interets} />
              </div>
            ) : null}
            {album.length > 0 ? (
              <div className="mt-4 w-full text-left">
                <p className="mb-2 text-[13px] text-[var(--text-muted)]">
                  Album
                </p>
                <div className="tabs-scroll flex gap-2 pr-5">
                  {album.map((photo, index) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={photo.id}
                      src={photo.url}
                      alt={`Photo ${index + 1} de ${profile.pseudo}`}
                      onClick={() => setLightbox(photo.url)}
                      className="h-20 w-20 shrink-0 cursor-pointer rounded-[12px] object-cover"
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-[var(--text-muted)]">
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
                  className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--chip)] px-4 py-3 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
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

      {lightbox ? (
        <button
          type="button"
          aria-label="Fermer la photo"
          className="absolute inset-0 z-[80] flex items-center justify-center bg-black/85 p-6"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Photo agrandie"
            className="max-h-full max-w-full rounded-[16px] object-contain"
          />
        </button>
      ) : null}
    </div>
  );
}
