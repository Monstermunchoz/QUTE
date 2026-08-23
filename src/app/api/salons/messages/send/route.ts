import { NextResponse } from "next/server";
import {
  analyserMessage,
  notifierAdminsQuarantaine,
} from "@/lib/trust/analyser";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    salonId?: string;
    contenu?: string;
  } | null;

  const salonId = body?.salonId?.trim() ?? "";
  const contenu = body?.contenu?.trim() ?? "";

  if (!salonId || contenu.length < 1 || contenu.length > 1000) {
    return NextResponse.json({ error: "Message invalide" }, { status: 400 });
  }

  const analyse = await analyserMessage(contenu);

  if (analyse.action === "bloquer") {
    const admin = createServiceClient();
    await admin.from("messages_quarantaine").insert({
      salon_id: salonId,
      auteur_id: user.id,
      contenu,
      trust_score: analyse.score,
      trust_categorie: analyse.categorie,
    });
    await notifierAdminsQuarantaine(analyse.score);
    return NextResponse.json({ success: true });
  }

  const { data, error } = await supabase
    .from("salon_messages")
    .insert({
      salon_id: salonId,
      auteur_id: user.id,
      contenu,
      a_verifier: analyse.action === "verifier",
      trust_score: analyse.score,
      trust_categorie: analyse.categorie,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: data });
}
