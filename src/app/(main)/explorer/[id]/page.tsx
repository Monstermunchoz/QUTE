import { notFound, redirect } from "next/navigation";
import { Avatar } from "@/components/features/Avatar";
import { BackButton } from "@/components/ui/BackButton";
import { BadgeList } from "@/components/ui/ChipSelect";
import { BadgeAbonnement } from "@/components/ui/BadgeAbonnement";
import { publicPhotoUrl } from "@/lib/photos";
import { canSeeChamp } from "@/lib/profile/options";
import { createClient } from "@/lib/supabase/server";
import { getAge } from "@/lib/utils/age";
import { isJeSorsActive } from "@/lib/utils/je-sors";
import { ProfileActions } from "./profile-actions";
import type { AlbumPhoto, Ami, JeSors, Profile } from "@/types";

type ProfilePageProps = {
  params: { id: string };
};

export default async function ExplorerProfilePage({ params }: ProfilePageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (params.id === user.id) {
    redirect("/moi");
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const profile = data as Profile;

  if (profile.photo_status === "rejected") {
    notFound();
  }

  if (profile.photo_status !== "approved" && profile.id !== user.id) {
    const { data: me } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    const role = typeof me?.role === "string" ? me.role : "";
    if (role !== "admin" && role !== "moderateur") {
      notFound();
    }
  }

  const { data: blockRows } = await supabase
    .from("blocages")
    .select("id")
    .or(
      `and(bloqueur_id.eq.${user.id},bloque_id.eq.${profile.id}),and(bloqueur_id.eq.${profile.id},bloque_id.eq.${user.id})`,
    )
    .limit(1);

  if ((blockRows ?? []).length > 0) {
    notFound();
  }

  const { data: existingQrush } = await supabase
    .from("qrushs")
    .select("id")
    .eq("envoyeur_id", user.id)
    .eq("receveur_id", profile.id)
    .maybeSingle();

  const pair =
    user.id < profile.id
      ? { user1_id: user.id, user2_id: profile.id }
      : { user1_id: profile.id, user2_id: user.id };

  const { data: match } = await supabase
    .from("matchs")
    .select("id")
    .eq("user1_id", pair.user1_id)
    .eq("user2_id", pair.user2_id)
    .maybeSingle();

  const { data: existingConversation } = await supabase
    .from("conversations")
    .select("id, statut")
    .or(
      `and(initiateur_id.eq.${user.id},destinataire_id.eq.${profile.id}),and(initiateur_id.eq.${profile.id},destinataire_id.eq.${user.id})`,
    )
    .maybeSingle();

  const [{ data: jeSorsRow }, { data: albumRows }, { data: amiRows }] =
    await Promise.all([
      supabase
        .from("je_sors")
        .select("statut, zone, expires_at, lieu_id, lieu_libre")
        .eq("user_id", profile.id)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle(),
      supabase
        .from("photos")
        .select("id, url, ordre")
        .eq("user_id", profile.id)
        .eq("statut", "approved")
        .order("ordre", { ascending: true })
        .limit(6),
      supabase
        .from("amis")
        .select("*")
        .or(
          `and(demandeur_id.eq.${user.id},destinataire_id.eq.${profile.id}),and(demandeur_id.eq.${profile.id},destinataire_id.eq.${user.id})`,
        ),
    ]);

  const outing = jeSorsRow as
    | (Pick<JeSors, "statut" | "zone" | "expires_at" | "lieu_libre"> & {
        lieu_id?: string | null;
      })
    | null;
  const jeSors = outing && isJeSorsActive(outing) ? outing : null;
  let jeSorsLieu = jeSors?.lieu_libre ?? null;

  if (jeSors?.lieu_id) {
    const { data: lieuRow } = await supabase
      .from("lieux")
      .select("nom")
      .eq("id", jeSors.lieu_id)
      .maybeSingle();
    jeSorsLieu = (lieuRow as { nom?: string } | null)?.nom ?? jeSorsLieu;
  }

  const album = (albumRows ?? []) as Pick<AlbumPhoto, "id" | "url" | "ordre">[];
  const friendRelation =
    ((amiRows ?? []) as Ami[]).find((item) => item.statut !== "refuse") ?? null;
  const hasMatch = Boolean(match);
  const age = profile.age_visible ? getAge(profile.date_naissance) : null;
  const location = [profile.ville, profile.zone].filter(Boolean).join(" · ");
  const showIdentites = canSeeChamp(profile.visibilite_identites, hasMatch);
  const showOrientations = canSeeChamp(
    profile.visibilite_orientations,
    hasMatch,
  );
  const instagram = profile.instagram?.replace(/^@/, "") ?? "";

  return (
    <main className="flex flex-col gap-4">
      <header className="flex items-center gap-1">
        <BackButton />
        <h1 className="truncate text-2xl font-bold text-[var(--text)]">
          {profile.pseudo}
        </h1>
      </header>

      {album.length > 0 ? (
        <div className="tabs-scroll flex w-full gap-2">
          {album.map((photo, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={photo.id}
              src={photo.url}
              alt={`Photo ${index + 1} de ${profile.pseudo}`}
              className="h-[240px] w-full max-w-full shrink-0 rounded-[16px] object-cover"
            />
          ))}
        </div>
      ) : null}

      <div className="flex flex-col items-center gap-3 text-center">
        <Avatar
          pseudo={profile.pseudo}
          photoUrl={publicPhotoUrl(profile.photo_status, profile.photo_url)}
          size="xl"
          abonnement={profile.abonnement}
          role={profile.role}
        />
        <div>
          <p className="text-2xl font-bold text-[var(--text)]">
            {profile.pseudo}
            {profile.pronoms ? (
              <span className="ml-2 text-base font-normal text-[var(--text-muted)]">
                {profile.pronoms}
              </span>
            ) : null}
          </p>
          {age != null ? (
            <p className="text-sm text-[var(--text-muted)]">{age} ans</p>
          ) : null}
          <p className="text-[var(--text-muted)]">
            {location || "Lyon Métropole"}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <BadgeAbonnement abonnement={profile.abonnement} role={profile.role} />
          {jeSors ? (
            <span className="rounded-[8px] bg-[#FF2D87] px-2 py-1 text-xs font-bold text-white">
              🔥 Sort ce soir
              {jeSorsLieu ? ` · ${jeSorsLieu}` : ""}
            </span>
          ) : null}
        </div>
      </div>

      {profile.bio ? (
        <p className="text-[var(--text)]">{profile.bio}</p>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">Pas encore de bio.</p>
      )}

      {showIdentites && (profile.identites ?? []).length > 0 ? (
        <section>
          <h2 className="mb-2 text-sm font-bold text-[var(--text-muted)]">
            Identités
          </h2>
          <BadgeList items={profile.identites} />
        </section>
      ) : null}

      {showOrientations && (profile.orientations ?? []).length > 0 ? (
        <section>
          <h2 className="mb-2 text-sm font-bold text-[var(--text-muted)]">
            Orientations
          </h2>
          <BadgeList items={profile.orientations} />
        </section>
      ) : null}

      {(profile.recherche ?? []).length > 0 || profile.ce_que_je_cherche ? (
        <section className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-4">
          <h2 className="text-sm font-bold text-[var(--text-muted)]">
            Ce que je cherche
          </h2>
          {(profile.recherche ?? []).length > 0 ? (
            <div className="mt-2">
              <BadgeList items={profile.recherche ?? []} />
            </div>
          ) : null}
          {profile.ce_que_je_cherche ? (
            <p className="mt-2 text-[var(--text)]">{profile.ce_que_je_cherche}</p>
          ) : null}
        </section>
      ) : null}

      {(profile.interets ?? []).length > 0 ? (
        <section>
          <h2 className="mb-2 text-sm font-bold text-[var(--text-muted)]">
            Intérêts
          </h2>
          <BadgeList items={profile.interets} />
        </section>
      ) : null}

      {(profile.langues ?? []).length > 0 ? (
        <section>
          <h2 className="mb-2 text-sm font-bold text-[var(--text-muted)]">
            Langues
          </h2>
          <BadgeList items={profile.langues ?? []} />
        </section>
      ) : null}

      {instagram ? (
        <a
          href={`https://instagram.com/${instagram}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold text-[#FF2D87]"
        >
          @{instagram}
        </a>
      ) : null}

      <ProfileActions
        profileId={profile.id}
        currentUserId={user.id}
        alreadyQrushed={Boolean(existingQrush)}
        hasMatch={hasMatch}
        matchId={match?.id ?? null}
        existingConversation={existingConversation}
        friendRelation={friendRelation}
      />
    </main>
  );
}
