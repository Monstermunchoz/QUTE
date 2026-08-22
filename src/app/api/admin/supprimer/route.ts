import { NextResponse } from "next/server";
import {
  assertDeletableTarget,
  parseUserId,
  requireStaff,
} from "@/lib/admin/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const staff = await requireStaff();

  if ("error" in staff) {
    return staff.error;
  }

  const body = await request.json().catch(() => null);
  const userId = parseUserId(body);

  if (!userId) {
    return NextResponse.json({ error: "Utilisateur invalide" }, { status: 400 });
  }

  const blocked = await assertDeletableTarget(
    staff.admin,
    { id: staff.user.id, role: staff.role },
    userId,
  );

  if (blocked) {
    return blocked;
  }

  try {
    const { error: authError } = await staff.admin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("[admin/supprimer] deleteUser", authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const { error: profileError } = await staff.admin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error("[admin/supprimer] profile", profileError);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    console.error("[admin/supprimer]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
