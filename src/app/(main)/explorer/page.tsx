import { redirect } from "next/navigation";
import { ExplorerTabs } from "./explorer-tabs";
import { createClient } from "@/lib/supabase/server";
import { estPremium } from "@/lib/subscription";
import { eventOverlapsParisDay } from "@/lib/utils/event-date";
import { isJeSorsActive, parisDayBounds } from "@/lib/utils/je-sors";
import type {
  Evenement,
  Groupe,
  JeSors,
  Lieu,
  Participation,
  Profile,
  Salon,
} from "@/types";

type ExplorerPageProps = {
  searchParams: { tab?: string };
};

export default async function ExplorerPage({ searchParams }: ExplorerPageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: blocks } = await supabase
    .from("blocages")
    .select("bloqueur_id, bloque_id")
    .or(`bloqueur_id.eq.${user.id},bloque_id.eq.${user.id}`);

  const blockedIds = Array.from(
    new Set(
      (blocks ?? []).flatMap((row) => {
        const blocker = row.bloqueur_id as string;
        const blocked = row.bloque_id as string;
        if (blocker === user.id) {
          return [blocked];
        }
        if (blocked === user.id) {
          return [blocker];
        }
        return [];
      }),
    ),
  );

  let query = supabase
    .from("profiles")
    .select(
      "id, pseudo, ville, zone, photo_url, photo_status, abonnement, role, identites, date_naissance",
    )
    .neq("id", user.id)
    .not("photo_status", "eq", "rejected")
    .order("created_at", { ascending: false })
    .limit(100);

  if (blockedIds.length > 0) {
    query = query.not("id", "in", `(${blockedIds.join(",")})`);
  }

  const nowIso = new Date().toISOString();
  const { start, end } = parisDayBounds();
  const weekAgo = new Date(start.getTime() - 7 * 86_400_000).toISOString();

  const [
    { data: profileRows },
    { data: salonRows },
    { data: groupeRows },
    { data: lieuRows },
    { data: eventRows },
    { data: jeSorsRows },
    { data: meRow },
    { data: likeRows },
  ] = await Promise.all([
    query,
    supabase.from("salons").select("*").order("created_at", { ascending: true }),
    supabase.from("groupes").select("*").order("created_at", { ascending: false }),
    supabase.from("lieux").select("*").order("nom", { ascending: true }),
    supabase
      .from("evenements")
      .select("*")
      .eq("statut", "publie")
      .gte("date_debut", weekAgo)
      .lt("date_debut", end.toISOString())
      .order("date_debut", { ascending: true }),
    supabase.from("je_sors").select("user_id, statut, zone, expires_at").gt("expires_at", nowIso),
    supabase
      .from("profiles")
      .select("abonnement, abonnement_statut")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.from("likes_lieux").select("lieu_id"),
  ]);

  const evenements = ((eventRows ?? []) as Evenement[]).filter(
    (event) =>
      eventOverlapsParisDay(event, start, end) ||
      new Date(event.date_debut).getTime() >= Date.now(),
  );
  const eventIds = evenements.map((event) => event.id);

  let participations: Participation[] = [];

  if (eventIds.length > 0) {
    const { data: participationRows } = await supabase
      .from("participations")
      .select("*")
      .in("evenement_id", eventIds);

    participations = (participationRows ?? []) as Participation[];
  }

  const profiles = (profileRows ?? []) as Pick<
    Profile,
    | "id"
    | "pseudo"
    | "ville"
    | "zone"
    | "photo_url"
    | "photo_status"
    | "abonnement"
    | "role"
    | "identites"
    | "date_naissance"
  >[];

  const likeCounts: Record<string, number> = {};

  for (const row of likeRows ?? []) {
    const lieuId = row.lieu_id as string;
    likeCounts[lieuId] = (likeCounts[lieuId] ?? 0) + 1;
  }

  const lieux = ((lieuRows ?? []) as Lieu[]).slice().sort((a, b) => {
    const delta = (likeCounts[b.id] ?? 0) - (likeCounts[a.id] ?? 0);
    if (delta !== 0) {
      return delta;
    }
    return a.nom.localeCompare(b.nom, "fr");
  });

  const requestedTab = searchParams.tab;
  const initialTab =
    requestedTab === "evenements" ||
    requestedTab === "lieux" ||
    requestedTab === "salons" ||
    requestedTab === "groupes"
      ? requestedTab
      : "personnes";

  const jeSorsByUserId = Object.fromEntries(
    ((jeSorsRows ?? []) as Pick<JeSors, "user_id" | "statut" | "zone" | "expires_at">[])
      .filter((row) => isJeSorsActive(row))
      .map((row) => [row.user_id, { statut: row.statut, zone: row.zone }]),
  );

  return (
    <ExplorerTabs
      profiles={profiles}
      salons={(salonRows ?? []) as Salon[]}
      groupes={(groupeRows ?? []) as Groupe[]}
      lieux={lieux}
      lieuLikeCounts={likeCounts}
      evenements={evenements}
      participations={participations}
      currentUserId={user.id}
      initialTab={initialTab}
      canCreateSalon={estPremium(meRow)}
      canFilter={estPremium(meRow)}
      jeSorsByUserId={jeSorsByUserId}
    />
  );
}
