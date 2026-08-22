import type { SupabaseClient } from "@supabase/supabase-js";
import { estPremium, type ProfilAbonnement } from "@/lib/subscription";

export const QRUSH_QUOTA_GRATUIT = 20;

export async function qrushDuJour(supabase: SupabaseClient, userId: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("qrushs")
    .select("*", { count: "exact", head: true })
    .eq("envoyeur_id", userId)
    .gte("created_at", start.toISOString());

  return count ?? 0;
}

export function quotaQrushAtteint(profil: ProfilAbonnement, countToday: number) {
  return !estPremium(profil) && countToday >= QRUSH_QUOTA_GRATUIT;
}
