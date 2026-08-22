"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ParticipationStatut } from "@/types";

export async function saveParticipation(
  evenementId: string,
  statut: ParticipationStatut,
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tu dois être connecté·e." };
  }

  const { error } = await supabase.from("participations").upsert(
    {
      evenement_id: evenementId,
      user_id: user.id,
      statut,
    },
    { onConflict: "evenement_id,user_id" },
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/accueil");
  revalidatePath("/explorer");
  revalidatePath(`/evenements/${evenementId}`);

  return { ok: true as const };
}
