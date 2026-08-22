import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/stripe/config";
import { getStripe } from "@/lib/stripe/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const { data: profil } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profil?.stripe_customer_id) {
    return NextResponse.json(
      { error: "Aucun abonnement à gérer" },
      { status: 400 },
    );
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: profil.stripe_customer_id,
    return_url: `${getSiteUrl()}/abonnement`,
    locale: "fr",
  });

  return NextResponse.json({ url: session.url });
}
