import { NextResponse } from "next/server";
import {
  assertDeletableTarget,
  parseUserId,
  requireStaff,
} from "@/lib/admin/api";
import { logAdminAction } from "@/lib/admin/audit";

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
    const { data: cible } = await staff.admin
      .from("profiles")
      .select("pseudo")
      .eq("id", userId)
      .maybeSingle();
    const pseudo = typeof cible?.pseudo === "string" ? cible.pseudo : "";

    const { data: authData, error: getError } =
      await staff.admin.auth.admin.getUserById(userId);

    if (getError) {
      console.error("[admin/bannir] getUserById", getError);
      return NextResponse.json({ error: getError.message }, { status: 500 });
    }

    const email = authData.user?.email?.trim().toLowerCase() ?? "";

    if (!email) {
      return NextResponse.json(
        { error: "Email introuvable pour ce compte." },
        { status: 400 },
      );
    }

    const { error: banError } = await staff.admin.from("emails_bannis").upsert(
      {
        email,
        banni_par: staff.user.id,
      },
      { onConflict: "email" },
    );

    if (banError) {
      console.error("[admin/bannir] emails_bannis", banError);
      return NextResponse.json({ error: banError.message }, { status: 500 });
    }

    await staff.admin
      .from("profiles")
      .update({ banni: true, email_banni: email })
      .eq("id", userId);

    const { error: authError } = await staff.admin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("[admin/bannir] deleteUser", authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const { error: profileError } = await staff.admin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error("[admin/bannir] profile", profileError);
    }

    await logAdminAction(staff.admin, {
      adminId: staff.user.id,
      action: "bannir",
      cibleType: "profil",
      cibleId: userId,
      details: { pseudo, email },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    console.error("[admin/bannir]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
