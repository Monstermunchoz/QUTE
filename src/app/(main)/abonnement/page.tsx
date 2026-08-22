import { redirect } from "next/navigation";
import { AbonnementView } from "./abonnement-view";
import { normalizeAbonnement } from "@/lib/abonnement";
import { createClient } from "@/lib/supabase/server";

export default async function AbonnementPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("abonnement")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <AbonnementView
      current={normalizeAbonnement(
        (profile as { abonnement?: string } | null)?.abonnement,
      )}
    />
  );
}
