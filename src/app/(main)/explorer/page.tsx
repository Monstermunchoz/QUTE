import { redirect } from "next/navigation";
import { ExplorerTabs } from "./explorer-tabs";
import { createClient } from "@/lib/supabase/server";
import { isJeSorsActive } from "@/lib/utils/je-sors";
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
    .select("bloque_id")
    .eq("bloqueur_id", user.id);

  const blockedIds = (blocks ?? []).map((row) => row.bloque_id as string);

  let query = supabase
    .from("profiles")
    .select("id, pseudo, ville, photo_url, photo_status")
    .neq("id", user.id)
    .not("photo_status", "eq", "rejected")
    .order("created_at", { ascending: false })
    .limit(100);

  if (blockedIds.length > 0) {
    query = query.not("id", "in", `(${blockedIds.join(",")})`);
  }

  const nowIso = new Date().toISOString();

  const [
    { data: profileRows },
    { data: salonRows },
    { data: groupeRows },
    { data: lieuRows },
    { data: eventRows },
    { data: jeSorsRows },
  ] = await Promise.all([
    query,
    supabase.from("salons").select("*").order("created_at", { ascending: true }),
    supabase.from("groupes").select("*").order("created_at", { ascending: false }),
    supabase.from("lieux").select("*").order("nom", { ascending: true }),
    supabase
      .from("evenements")
      .select("*")
      .eq("statut", "publie")
      .gte("date_debut", nowIso)
      .order("date_debut", { ascending: true }),
    supabase.from("je_sors").select("user_id, statut, zone, expires_at").gt("expires_at", nowIso),
  ]);

  const evenements = (eventRows ?? []) as Evenement[];
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
    "id" | "pseudo" | "ville" | "photo_url" | "photo_status"
  >[];

  const initialTab =
    searchParams.tab === "evenements" ? "evenements" : "personnes";

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
      lieux={(lieuRows ?? []) as Lieu[]}
      evenements={evenements}
      participations={participations}
      currentUserId={user.id}
      initialTab={initialTab}
      jeSorsByUserId={jeSorsByUserId}
    />
  );
}
