"use client";

import { useMemo, useState } from "react";
import { Avatar } from "@/components/features/Avatar";
import { ProfileModal } from "@/components/features/ProfileModal";
import { PageTitle } from "@/components/ui/BackButton";
import { otherAmiId } from "@/lib/amis";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Ami, Profile } from "@/types";

type AmisHubProps = {
  currentUserId: string;
  relations: Ami[];
  profilesById: Record<
    string,
    Pick<Profile, "id" | "pseudo" | "ville" | "photo_url" | "abonnement" | "role">
  >;
};

export function AmisHub({
  currentUserId,
  relations,
  profilesById,
}: AmisHubProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"amis" | "recues" | "envoyees">("amis");
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const friends = useMemo(
    () => relations.filter((item) => item.statut === "accepte"),
    [relations],
  );
  const incoming = useMemo(
    () =>
      relations.filter(
        (item) =>
          item.statut === "en_attente" && item.destinataire_id === currentUserId,
      ),
    [relations, currentUserId],
  );
  const outgoing = useMemo(
    () =>
      relations.filter(
        (item) =>
          item.statut === "en_attente" && item.demandeur_id === currentUserId,
      ),
    [relations, currentUserId],
  );

  async function updateRelation(id: string, statut: "accepte" | "refuse") {
    setLoadingId(id);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("amis")
      .update({ statut })
      .eq("id", id);
    setLoadingId(null);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.refresh();
  }

  async function cancelRelation(id: string) {
    setLoadingId(id);
    setError(null);
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("amis")
      .delete()
      .eq("id", id);
    setLoadingId(null);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    router.refresh();
  }

  function row(relation: Ami) {
    const otherId = otherAmiId(relation, currentUserId);
    const profile = profilesById[otherId];
    const pseudo = profile?.pseudo ?? "QUTE";

    return (
      <li
        key={relation.id}
        className="flex items-center gap-3 rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-4"
      >
        <button
          type="button"
          onClick={() => setProfileId(otherId)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <Avatar
            pseudo={pseudo}
            photoUrl={profile?.photo_url}
            size="md"
            abonnement={profile?.abonnement}
            role={profile?.role}
          />
          <div className="min-w-0">
            <p className="truncate font-bold text-white">{pseudo}</p>
            <p className="truncate text-sm text-[#888888]">
              {profile?.ville || "Lyon Métropole"}
            </p>
          </div>
        </button>
        {tab === "recues" ? (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={loadingId === relation.id}
              onClick={() => void updateRelation(relation.id, "accepte")}
              className="flex h-[52px] min-w-[96px] shrink-0 items-center justify-center rounded-[12px] px-3 text-sm font-bold text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #FF2D87, #7B2FFF)" }}
            >
              Accepter
            </button>
            <button
              type="button"
              onClick={() => void updateRelation(relation.id, "refuse")}
              className="flex h-[52px] min-w-[96px] shrink-0 items-center justify-center rounded-[12px] border border-[#1E1E1E] px-3 text-sm font-bold text-white"
            >
              Refuser
            </button>
          </div>
        ) : null}
        {tab === "envoyees" ? (
          <button
            type="button"
            onClick={() => void cancelRelation(relation.id)}
            className="text-sm font-bold text-[#FF4444]"
          >
            Annuler
          </button>
        ) : null}
      </li>
    );
  }

  const current =
    tab === "amis" ? friends : tab === "recues" ? incoming : outgoing;

  return (
    <main className="flex flex-col gap-4">
      <PageTitle title="Mes amis" />

      <div className="tabs-scroll flex gap-2 pr-5">
        <button
          type="button"
          onClick={() => setTab("amis")}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
            tab === "amis" ? "text-[#FF2D87]" : "text-[var(--text-muted)]"
          }`}
        >
          Mes amis
        </button>
        <button
          type="button"
          onClick={() => setTab("recues")}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
            tab === "recues" ? "text-[#FF2D87]" : "text-[var(--text-muted)]"
          }`}
        >
          <span className="md:hidden">Reçues</span>
          <span className="hidden md:inline">Demandes reçues</span>
          {incoming.length > 0 ? (
            <span className="ml-2 rounded-full bg-[#FF4444] px-2 py-0.5 text-[10px] text-white">
              {incoming.length}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setTab("envoyees")}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
            tab === "envoyees" ? "text-[#FF2D87]" : "text-[var(--text-muted)]"
          }`}
        >
          <span className="md:hidden">Envoyées</span>
          <span className="hidden md:inline">Demandes envoyées</span>
        </button>
      </div>

      {current.length === 0 ? (
        <p className="pt-16 text-center text-[#888888]">
          {tab === "amis"
            ? "Tu n'as pas encore d'amis sur QUTE. Va faire connaissance dans les salons !"
            : tab === "recues"
              ? "Aucune demande reçue."
              : "Aucune demande envoyée."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">{current.map(row)}</ul>
      )}

      {error ? <p className="text-sm text-[#FF4444]">{error}</p> : null}

      <ProfileModal
        open={Boolean(profileId)}
        onClose={() => setProfileId(null)}
        profileId={profileId}
        currentUserId={currentUserId}
      />
    </main>
  );
}
