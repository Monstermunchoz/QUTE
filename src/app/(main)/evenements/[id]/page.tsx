import dynamic from "next/dynamic";
import { notFound, redirect } from "next/navigation";
import { Avatar } from "@/components/features/Avatar";
import { PageTitle } from "@/components/ui/BackButton";
import { OpenMapsButton } from "@/components/ui/OpenMapsButton";
import { eventCategoryLabel } from "@/lib/events/categories";
import { formatEventDate } from "@/lib/utils/event-date";
import { createClient } from "@/lib/supabase/server";
import { ParticipationActions } from "./participation-actions";
import type {
  Evenement,
  Lieu,
  Participation,
  ParticipationStatut,
  Profile,
} from "@/types";

const PlacesMap = dynamic(
  () =>
    import("@/components/features/PlacesMap").then((mod) => mod.PlacesMap),
  { ssr: false },
);

type EventPageProps = {
  params: { id: string };
};

export default async function EventPage({ params }: EventPageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("evenements")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  const event = data as Evenement;

  if (event.statut === "refuse") {
    notFound();
  }

  if (event.statut === "pending" && event.createur_id !== user.id) {
    notFound();
  }

  let lieu: Lieu | null = null;

  if (event.lieu_id) {
    const { data: lieuRow } = await supabase
      .from("lieux")
      .select("*")
      .eq("id", event.lieu_id)
      .maybeSingle();

    lieu = (lieuRow as Lieu | null) ?? null;
  } else if (event.lieu_nom) {
    const { data: lieuRow } = await supabase
      .from("lieux")
      .select("*")
      .eq("nom", event.lieu_nom)
      .maybeSingle();

    lieu = (lieuRow as Lieu | null) ?? null;
  }

  const { data: participationRows } = await supabase
    .from("participations")
    .select("*")
    .eq("evenement_id", event.id);

  const participations = (participationRows ?? []) as Participation[];
  const attendees = participations.filter(
    (item) => item.statut === "interesse" || item.statut === "participe",
  );
  const myStatut =
    (participations.find((item) => item.user_id === user.id)
      ?.statut as ParticipationStatut | undefined) ?? null;

  const attendeeIds = attendees.map((item) => item.user_id);
  let profilesById: Record<
    string,
    Pick<Profile, "id" | "pseudo" | "photo_url" | "abonnement" | "role">
  > = {};

  if (attendeeIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, pseudo, photo_url, abonnement, role")
      .in("id", attendeeIds);

    profilesById = Object.fromEntries(
      (
        (profiles ?? []) as Pick<
          Profile,
          "id" | "pseudo" | "photo_url" | "abonnement" | "role"
        >[]
      ).map((profile) => [profile.id, profile]),
    );
  }

  const hasCoordinates = lieu?.latitude != null && lieu?.longitude != null;
  const lieuLine = [event.lieu_nom, event.adresse].filter(Boolean).join(" · ");
  const mapsNom = lieu?.nom || event.lieu_nom || event.titre;
  const mapsAdresse = event.adresse || lieu?.adresse || "";

  return (
    <main className="flex flex-col gap-4">
      <PageTitle title={event.titre} />
      {event.statut === "pending" ? (
        <p className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[#FF2D87]">
          En attente de validation
        </p>
      ) : null}
      <p className="font-bold text-white">{formatEventDate(event.date_debut)}</p>
      {event.date_fin ? (
        <p className="text-sm text-[#888888]">
          Jusqu&apos;au {formatEventDate(event.date_fin)}
        </p>
      ) : null}
      {lieuLine ? <p className="text-sm text-[#888888]">{lieuLine}</p> : null}
      {event.categorie ? (
        <span className="w-fit rounded-[8px] bg-[#1E1E1E] px-2 py-1 text-xs text-[#FF2D87]">
          {eventCategoryLabel(event.categorie)}
        </span>
      ) : null}
      {event.description ? (
        <p className="text-white">{event.description}</p>
      ) : null}

      {hasCoordinates && lieu ? (
        <PlacesMap
          lieux={[lieu]}
          center={[Number(lieu.latitude), Number(lieu.longitude)]}
          zoom={14}
          interactive={false}
        />
      ) : null}

      <OpenMapsButton nom={mapsNom} adresse={mapsAdresse} />

      {event.statut === "publie" ? (
        <ParticipationActions
          evenementId={event.id}
          currentUserId={user.id}
          initialStatut={myStatut}
          initialCount={attendees.length}
        />
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-white">
          Participants ({attendees.length})
        </h2>
        {attendees.length === 0 ? (
          <p className="text-sm text-[#888888]">Personne pour l&apos;instant.</p>
        ) : (
          <ul className="flex flex-wrap gap-3">
            {attendees.map((item) => {
              const profile = profilesById[item.user_id];
              const pseudo = profile?.pseudo ?? "QUTE";

              return (
                <li key={item.id} className="flex flex-col items-center gap-1">
                  <Avatar
                    pseudo={pseudo}
                    photoUrl={profile?.photo_url}
                    size="sm"
                    abonnement={profile?.abonnement}
                    role={profile?.role}
                  />
                  <span className="max-w-[64px] truncate text-xs text-[#888888]">
                    {pseudo}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
