import { notFound, redirect } from "next/navigation";
import { Avatar } from "@/components/features/Avatar";
import { ProfileActions } from "./profile-actions";
import { createClient } from "@/lib/supabase/server";
import { isJeSorsActive, jeSorsLabel } from "@/lib/utils/je-sors";
import type { AlbumPhoto, JeSors, Profile } from "@/types";

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
    .select(
      "id, pseudo, bio, ville, zone, photo_url, photo_status, identites, orientations, ce_que_je_cherche, interets, compte_verifie, age_visible, created_at",
    )
    .eq("id", params.id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const profile = data as Profile;

  if (profile.photo_status === "rejected") {
    notFound();
  }

  const location = [profile.ville, profile.zone].filter(Boolean).join(" · ");

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

  const [{ data: jeSorsRow }, { data: albumRows }] = await Promise.all([
    supabase
      .from("je_sors")
      .select("statut, zone, expires_at")
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
  ]);

  const jeSors =
    jeSorsRow && isJeSorsActive(jeSorsRow as Pick<JeSors, "expires_at">)
      ? (jeSorsRow as Pick<JeSors, "statut" | "zone" | "expires_at">)
      : null;
  const album = (albumRows ?? []) as Pick<AlbumPhoto, "id" | "url" | "ordre">[];

  return (
    <main className="flex flex-col items-center gap-4 pb-4 text-center">
      <Avatar pseudo={profile.pseudo} photoUrl={profile.photo_url} size="xl" />
      <h1 className="text-2xl font-bold text-white">{profile.pseudo}</h1>
      {jeSors ? (
        <>
          <span className="rounded-[8px] bg-[#FF2D87] px-2 py-1 text-xs font-bold text-white">
            🔥 Sort ce soir
          </span>
          <p className="text-[#888888]">
            {jeSorsLabel(jeSors.statut)}
            {jeSors.zone ? ` · ${jeSors.zone}` : ""}
          </p>
        </>
      ) : (
        <p className="text-[#888888]">{location || "Lyon Métropole"}</p>
      )}

      {profile.bio ? (
        <p className="max-w-sm text-white">{profile.bio}</p>
      ) : (
        <p className="text-sm text-[#888888]">Pas encore de bio.</p>
      )}

      {profile.ce_que_je_cherche ? (
        <div className="w-full rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-4">
          <p className="text-[14px] text-[#888888]">Ce que je cherche</p>
          <p className="mt-1 text-white">{profile.ce_que_je_cherche}</p>
        </div>
      ) : null}

      {album.length > 0 ? (
        <div className="grid w-full grid-cols-3 gap-2">
          {album.map((photo, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={photo.id}
              src={photo.url}
              alt={`Photo ${index + 1} de ${profile.pseudo}`}
              className="aspect-square w-full rounded-[12px] object-cover"
            />
          ))}
        </div>
      ) : null}

      <ProfileActions
        profileId={profile.id}
        alreadyQrushed={Boolean(existingQrush)}
        hasMatch={Boolean(match)}
        matchId={match?.id ?? null}
        existingConversation={existingConversation}
      />
    </main>
  );
}
