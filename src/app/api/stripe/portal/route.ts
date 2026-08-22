import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/stripe/config";
import {
  clearMismatchedCustomer,
  customerExistsInCurrentMode,
  isUsableCustomerId,
} from "@/lib/stripe/customer";
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
    .select("id, pseudo, stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profil) {
    return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  }

  const existingId = (profil.stripe_customer_id as string | null)?.trim() || null;

  if (!existingId) {
    return NextResponse.json({ error: "no_customer" });
  }

  try {
    if (!isUsableCustomerId(existingId)) {
      await clearMismatchedCustomer(user.id);
      return NextResponse.json({ error: "invalid_customer" });
    }

    const exists = await customerExistsInCurrentMode(existingId);

    if (!exists) {
      await clearMismatchedCustomer(user.id);
      return NextResponse.json({ error: "invalid_customer" });
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer: existingId,
      return_url: `${getSiteUrl()}/abonnement`,
      locale: "fr",
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    console.error("[stripe/portal]", error);

    if (
      message.toLowerCase().includes("no such customer") ||
      message.toLowerCase().includes("similar object exists in test mode") ||
      message.toLowerCase().includes("similar object exists in live mode")
    ) {
      await clearMismatchedCustomer(user.id);
      return NextResponse.json({ error: "invalid_customer" });
    }

    return NextResponse.json(
      { error: "invalid_customer" },
      { status: 500 },
    );
  }
}
