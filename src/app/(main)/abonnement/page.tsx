import { redirect } from "next/navigation";
import { AbonnementView } from "./abonnement-view";
import { normalizeAbonnement } from "@/lib/abonnement";
import { createClient } from "@/lib/supabase/server";
import type { AbonnementStatut } from "@/lib/subscription";

type PaiementRow = {
  id: string;
  montant: number;
  devise: string;
  statut: string;
  plan: string | null;
  facture_url: string | null;
  created_at: string;
};

type AbonnementPageProps = {
  searchParams: { success?: string; annule?: string };
};

export default async function AbonnementPage({
  searchParams,
}: AbonnementPageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: paiementRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "abonnement, abonnement_statut, abonnement_fin, essai_utilise, stripe_customer_id",
      )
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("paiements")
      .select("id, montant, devise, statut, plan, facture_url, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const row = profile as {
    abonnement?: string;
    abonnement_statut?: AbonnementStatut;
    abonnement_fin?: string | null;
    essai_utilise?: boolean;
    stripe_customer_id?: string | null;
  } | null;

  return (
    <AbonnementView
      current={normalizeAbonnement(row?.abonnement)}
      statut={row?.abonnement_statut ?? "inactif"}
      fin={row?.abonnement_fin ?? null}
      essaiUtilise={Boolean(row?.essai_utilise)}
      hasCustomer={Boolean(row?.stripe_customer_id)}
      paiements={(paiementRows ?? []) as PaiementRow[]}
      banner={
        searchParams.success === "1"
          ? "success"
          : searchParams.annule === "1"
            ? "annule"
            : null
      }
    />
  );
}
