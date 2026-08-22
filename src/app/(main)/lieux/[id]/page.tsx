import dynamic from "next/dynamic";
import { notFound, redirect } from "next/navigation";
import { PageTitle } from "@/components/ui/BackButton";
import { OpenMapsButton } from "@/components/ui/OpenMapsButton";
import { LieuLikeButton } from "../lieu-like-button";
import { createClient } from "@/lib/supabase/server";
import type { Lieu } from "@/types";

const PlacesMap = dynamic(
  () =>
    import("@/components/features/PlacesMap").then((mod) => mod.PlacesMap),
  { ssr: false },
);

type LieuPageProps = {
  params: { id: string };
};

export default async function LieuPage({ params }: LieuPageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("lieux")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const lieu = data as Lieu;
  const hasCoordinates = lieu.latitude != null && lieu.longitude != null;

  const [{ count: likeCount }, { data: myLike }] = await Promise.all([
    supabase
      .from("likes_lieux")
      .select("*", { count: "exact", head: true })
      .eq("lieu_id", lieu.id),
    supabase
      .from("likes_lieux")
      .select("id")
      .eq("lieu_id", lieu.id)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  return (
    <main className="flex flex-col gap-4">
      <PageTitle title={lieu.nom} />
      <LieuLikeButton
        lieuId={lieu.id}
        initialCount={likeCount ?? 0}
        initialLiked={Boolean(myLike)}
      />
      {lieu.categorie ? (
        <span className="w-fit rounded-[8px] bg-[#1E1E1E] px-2 py-1 text-xs text-[#FF2D87]">
          {lieu.categorie}
        </span>
      ) : null}
      <p className="text-sm text-[#888888]">{lieu.adresse}</p>
      {lieu.description ? (
        <p className="text-white">{lieu.description}</p>
      ) : null}

      {hasCoordinates ? (
        <PlacesMap
          lieux={[lieu]}
          center={[Number(lieu.latitude), Number(lieu.longitude)]}
          zoom={14}
          interactive={false}
        />
      ) : null}

      <OpenMapsButton nom={lieu.nom} adresse={lieu.adresse} />

      {lieu.site_web ? (
        <a
          href={lieu.site_web}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-bold text-[#FF2D87] underline"
        >
          Site web
        </a>
      ) : null}
      {lieu.instagram ? (
        <a
          href={lieu.instagram}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-bold text-[#FF2D87] underline"
        >
          Instagram
        </a>
      ) : null}
    </main>
  );
}
