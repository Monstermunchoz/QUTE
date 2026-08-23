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
    source?: string;
    messageId?: string;
    action?: string;
  } | null;

  const source = body?.source === "salon" ? "salon" : "prive";
  const messageId = body?.messageId?.trim() ?? "";
  const action = body?.action?.trim() ?? "";

  if (!messageId || !["innocenter", "masquer", "supprimer"].includes(action)) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const table = source === "salon" ? "salon_messages" : "messages";

  if (action === "supprimer") {
    const { error } = await staff.admin.from(table).delete().eq("id", messageId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    await logAdminAction(staff.admin, {
      adminId: staff.user.id,
      action: "supprimer_message",
      cibleType: "message",
      cibleId: messageId,
      details: { source },
    });
    return NextResponse.json({ ok: true });
  }

  const patch =
    action === "innocenter"
      ? { a_verifier: false, masque: false }
      : { masque: true, a_verifier: false };

  const { error } = await staff.admin.from(table).update(patch).eq("id", messageId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAdminAction(staff.admin, {
    adminId: staff.user.id,
    action: action === "innocenter" ? "innocenter_message" : "masquer_message",
    cibleType: "message",
    cibleId: messageId,
    details: { source },
  });

  return NextResponse.json({ ok: true });
}
