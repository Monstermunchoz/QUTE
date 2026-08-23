import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/admin/audit";
import { requireStaff } from "@/lib/admin/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const staff = await requireStaff();

  if ("error" in staff) {
    return staff.error;
  }

  const body = (await request.json().catch(() => null)) as {
    id?: string;
    action?: string;
  } | null;

  const id = body?.id?.trim() ?? "";
  const action = body?.action?.trim() ?? "";

  if (!id || !["innocenter", "supprimer"].includes(action)) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const { data: row } = await staff.admin
    .from("messages_quarantaine")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!row) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  if (action === "innocenter") {
    if (row.salon_id) {
      const { error } = await staff.admin.from("salon_messages").insert({
        salon_id: row.salon_id,
        auteur_id: row.auteur_id,
        contenu: row.contenu,
        a_verifier: false,
        trust_score: 0,
        trust_categorie: null,
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else if (row.conversation_id) {
      const { error } = await staff.admin.from("messages").insert({
        conversation_id: row.conversation_id,
        auteur_id: row.auteur_id,
        contenu: row.contenu,
        a_verifier: false,
        trust_score: 0,
        trust_categorie: null,
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    await staff.admin.from("messages_quarantaine").delete().eq("id", id);

    await logAdminAction(staff.admin, {
      adminId: staff.user.id,
      action: "quarantaine_innocenter",
      cibleType: "message",
      cibleId: id,
      details: { auteur_id: row.auteur_id },
    });

    return NextResponse.json({ ok: true });
  }

  await staff.admin
    .from("messages_quarantaine")
    .update({
      statut: "supprime",
      traite_par: staff.user.id,
      traite_at: new Date().toISOString(),
    })
    .eq("id", id);

  await logAdminAction(staff.admin, {
    adminId: staff.user.id,
    action: "quarantaine_supprimer",
    cibleType: "message",
    cibleId: id,
    details: { auteur_id: row.auteur_id },
  });

  return NextResponse.json({ ok: true });
}
