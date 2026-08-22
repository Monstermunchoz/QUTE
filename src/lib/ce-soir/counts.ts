import { createClient } from "@/lib/supabase/server";
import { isEventTonight } from "@/lib/utils/event-date";
import { isJeSorsActive, parisDayBounds } from "@/lib/utils/je-sors";
import type { Evenement, JeSors } from "@/types";

export type CeSoirCounts = {
  peopleCount: number;
  eventsCount: number;
  lieuxCount: number;
};

export async function getCeSoirCounts(
  supabase: ReturnType<typeof createClient>,
): Promise<CeSoirCounts> {
  const nowIso = new Date().toISOString();
  const { start, end } = parisDayBounds();

  const [{ data: jeSorsRows }, { data: eventRows }] = await Promise.all([
    supabase
      .from("je_sors")
      .select("user_id, lieu_id, expires_at")
      .gt("expires_at", nowIso),
    supabase
      .from("evenements")
      .select("id, lieu_id, lieu_nom, date_debut, statut")
      .eq("statut", "publie")
      .gte("date_debut", start.toISOString())
      .lt("date_debut", end.toISOString()),
  ]);

  const jeSors = ((jeSorsRows ?? []) as Pick<
    JeSors,
    "user_id" | "lieu_id" | "expires_at"
  >[]).filter(isJeSorsActive);

  const eventsTonight = ((eventRows ?? []) as Pick<
    Evenement,
    "id" | "lieu_id" | "lieu_nom" | "date_debut" | "statut"
  >[]).filter((event) => isEventTonight(event.date_debut));

  const peopleCount = new Set(jeSors.map((row) => row.user_id)).size;
  const lieuKeys = new Set<string>();

  for (const event of eventsTonight) {
    if (event.lieu_id) {
      lieuKeys.add(event.lieu_id);
    } else if (event.lieu_nom) {
      lieuKeys.add(event.lieu_nom);
    }
  }

  for (const row of jeSors) {
    if (row.lieu_id) {
      lieuKeys.add(row.lieu_id);
    }
  }

  return {
    peopleCount,
    eventsCount: eventsTonight.length,
    lieuxCount: lieuKeys.size,
  };
}
