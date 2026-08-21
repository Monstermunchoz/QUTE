import { SignalementActions } from "./signalement-actions";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Signalement } from "@/types";

export default async function AdminSignalementsPage() {
  const supabase = createClient();
  const { data: rows } = await supabase
    .from("signalements")
    .select("*")
    .eq("statut", "en_attente")
    .order("created_at", { ascending: false });

  const signalements = (rows ?? []) as Signalement[];
  const ids = Array.from(
    new Set(
      signalements.flatMap((item) => [item.rapporteur_id, item.cible_id]),
    ),
  );

  let profilesById: Record<string, Pick<Profile, "id" | "pseudo">> = {};

  if (ids.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, pseudo")
      .in("id", ids);

    profilesById = Object.fromEntries(
      ((profiles ?? []) as Pick<Profile, "id" | "pseudo">[]).map((profile) => [
        profile.id,
        profile,
      ]),
    );
  }

  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-white">Signalements</h1>
      {signalements.length === 0 ? (
        <p className="text-sm text-[#888888]">Rien en attente.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {signalements.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 rounded-[12px] border border-[#1E1E1E] bg-[#111111] p-4"
            >
              <p className="text-sm text-[#888888]">
                {new Date(item.created_at).toLocaleString("fr-FR")} · {item.type}
              </p>
              <p className="text-white">
                <span className="text-[#888888]">Rapporteur :</span>{" "}
                {profilesById[item.rapporteur_id]?.pseudo ?? "QUTE"}
              </p>
              <p className="text-white">
                <span className="text-[#888888]">Cible :</span>{" "}
                {profilesById[item.cible_id]?.pseudo ?? "QUTE"}
              </p>
              <p className="text-white">{item.raison}</p>
              <SignalementActions
                signalementId={item.id}
                cibleId={item.cible_id}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
