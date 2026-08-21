import { redirect } from "next/navigation";
import { CeSoirHub } from "./ce-soir-hub";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { parisDayBounds } from "@/lib/utils/je-sors";
import { isJeSorsActive } from "@/lib/utils/je-sors";
import type { Evenement, JeSors, Profile, Salon, SalonMessage } from "@/types";

async function signOut() {
  "use server";

  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function AccueilPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { start, end } = parisDayBounds();
  const nowIso = new Date().toISOString();

  const { data: profile } = await supabase
    .from("profiles")
    .select("pseudo")
    .eq("id", user.id)
    .maybeSingle();

  const pseudo = profile?.pseudo ?? user.user_metadata?.pseudo ?? "";

  const [{ data: jeSorsRows }, { data: eventRows }, { data: messageRows }] =
    await Promise.all([
      supabase
        .from("je_sors")
        .select("*")
        .gt("expires_at", nowIso)
        .order("created_at", { ascending: false }),
      supabase
        .from("evenements")
        .select("*")
        .eq("statut", "publie")
        .gte("date_debut", start.toISOString())
        .lt("date_debut", end.toISOString())
        .order("date_debut", { ascending: true }),
      supabase
        .from("salon_messages")
        .select("salon_id, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

  const jeSors = ((jeSorsRows ?? []) as JeSors[]).filter(isJeSorsActive);
  const eventsTonight = (eventRows ?? []) as Evenement[];

  const outingIds = jeSors.slice(0, 10).map((row) => row.user_id);
  let profilesById: Record<
    string,
    Pick<Profile, "id" | "pseudo" | "ville" | "photo_url">
  > = {};

  if (outingIds.length > 0) {
    const { data: outingProfiles } = await supabase
      .from("profiles")
      .select("id, pseudo, ville, photo_url")
      .in("id", outingIds);

    profilesById = Object.fromEntries(
      (
        (outingProfiles ?? []) as Pick<
          Profile,
          "id" | "pseudo" | "ville" | "photo_url"
        >[]
      ).map((item) => [item.id, item]),
    );
  }

  const outings = jeSors.slice(0, 10).flatMap((row) => {
    const outingProfile = profilesById[row.user_id];

    if (!outingProfile) {
      return [];
    }

    return [
      {
        profile: outingProfile,
        statut: row.statut,
        zone: row.zone,
      },
    ];
  });

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

  const salonOrder = Array.from(
    new Set(
      ((messageRows ?? []) as Pick<SalonMessage, "salon_id">[]).map(
        (row) => row.salon_id,
      ),
    ),
  ).slice(0, 3);

  let salons: Salon[] = [];

  if (salonOrder.length > 0) {
    const { data: salonRows } = await supabase
      .from("salons")
      .select("*")
      .in("id", salonOrder);

    const byId = Object.fromEntries(
      ((salonRows ?? []) as Salon[]).map((salon) => [salon.id, salon]),
    );
    salons = salonOrder.map((id) => byId[id]).filter(Boolean);
  }

  return (
    <>
      <CeSoirHub
        pseudo={pseudo}
        peopleCount={jeSors.length}
        eventsCount={eventsTonight.length}
        lieuxCount={lieuKeys.size}
        outings={outings}
        eventsTonight={eventsTonight}
        salons={salons}
      />
      <form action={signOut} className="pb-4">
        <Button type="submit" label="Déconnexion" variant="secondary" />
      </form>
    </>
  );
}
