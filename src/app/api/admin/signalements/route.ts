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
    signalementId?: string;
    action?: string;
  } | null;

  const signalementId = body?.signalementId?.trim() ?? "";
  const action =
    body?.action === "traiter"
      ? "traiter"
      : body?.action === "rejeter"
        ? "rejeter"
        : "";

  if (!signalementId || !action) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const { data: row } = await staff.admin
    .from("signalements")
    .select("id, cible_id, raison")
    .eq("id", signalementId)
    .maybeSingle();

  if (!row) {
    return NextResponse.json({ error: "Signalement introuvable" }, { status: 404 });
  }

  const { error } = await staff.admin
    .from("signalements")
    .update({ statut: action === "traiter" ? "traite" : "rejete" })
    .eq("id", signalementId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAdminAction(staff.admin, {
    adminId: staff.user.id,
    action: "traiter_signalement",
    cibleType: "signalement",
    cibleId: signalementId,
    details: {
      decision: action,
      cible_id: row.cible_id,
      raison: row.raison ?? "",
    },
  });

  return NextResponse.json({ ok: true });
}
