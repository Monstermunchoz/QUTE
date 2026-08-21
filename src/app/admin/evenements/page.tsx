import { EventModerationActions } from "./event-moderation-actions";
import { formatEventDate } from "@/lib/utils/event-date";
import { createClient } from "@/lib/supabase/server";
import type { Evenement, Profile } from "@/types";

export default async function AdminEvenementsPage() {
  const supabase = createClient();
  const { data: rows } = await supabase
    .from("evenements")
    .select("*")
    .eq("statut", "pending")
    .order("created_at", { ascending: false });

  const evenements = (rows ?? []) as Evenement[];
  const creatorIds = evenements
    .map((event) => event.createur_id)
    .filter(Boolean) as string[];

  let profilesById: Record<string, Pick<Profile, "id" | "pseudo">> = {};

  if (creatorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, pseudo")
      .in("id", Array.from(new Set(creatorIds)));

    profilesById = Object.fromEntries(
      ((profiles ?? []) as Pick<Profile, "id" | "pseudo">[]).map((profile) => [
        profile.id,
        profile,
      ]),
    );
  }

  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-white">Événements</h1>
      {evenements.length === 0 ? (
        <p className="text-sm text-[#888888]">Aucun événement pending.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {evenements.map((event) => (
            <li
              key={event.id}
              className="flex flex-col gap-2 rounded-[12px] border border-[#1E1E1E] bg-[#111111] p-4"
            >
              <h2 className="font-bold text-white">{event.titre}</h2>
              <p className="text-sm text-[#888888]">
                Créateur :{" "}
                {event.createur_id
                  ? (profilesById[event.createur_id]?.pseudo ?? "QUTE")
                  : "—"}
              </p>
              <p className="font-bold text-white">
                {formatEventDate(event.date_debut)}
              </p>
              <p className="text-sm text-[#888888]">
                {[event.lieu_nom, event.adresse].filter(Boolean).join(" · ") ||
                  "Lieu non précisé"}
              </p>
              {event.description ? (
                <p className="text-white">{event.description}</p>
              ) : null}
              <EventModerationActions evenementId={event.id} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
