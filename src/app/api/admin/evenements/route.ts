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
    evenementId?: string;
    action?: string;
  } | null;

  const evenementId = body?.evenementId?.trim() ?? "";
  const action =
    body?.action === "publier"
      ? "publier"
      : body?.action === "refuser"
        ? "refuser"
        : "";

  if (!evenementId || !action) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const { data: event } = await staff.admin
    .from("evenements")
    .select("id, titre")
    .eq("id", evenementId)
    .maybeSingle();

  if (!event) {
    return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
  }

  const { error } = await staff.admin
    .from("evenements")
    .update({ statut: action === "publier" ? "publie" : "refuse" })
    .eq("id", evenementId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAdminAction(staff.admin, {
    adminId: staff.user.id,
    action: action === "publier" ? "publier_evenement" : "refuser_evenement",
    cibleType: "evenement",
    cibleId: evenementId,
    details: { titre: event.titre ?? "" },
  });

  return NextResponse.json({ ok: true });
}
