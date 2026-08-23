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
    action?: string;
    id?: string;
    actif?: boolean;
    pattern?: string;
    categorie?: string;
    poids?: number;
  } | null;

  const action = body?.action?.trim() ?? "";

  if (action === "toggle") {
    const id = body?.id?.trim() ?? "";
    if (!id || typeof body?.actif !== "boolean") {
      return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
    }

    const { error } = await staff.admin
      .from("trust_rules")
      .update({ actif: body.actif })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logAdminAction(staff.admin, {
      adminId: staff.user.id,
      action: "trust_regle",
      cibleType: "message",
      cibleId: id,
      details: { op: body.actif ? "activer" : "desactiver" },
    });

    return NextResponse.json({ ok: true });
  }

  if (action === "create") {
    const pattern = body?.pattern?.trim() ?? "";
    const categorie = body?.categorie?.trim() ?? "";
    const poids = Number(body?.poids);

    if (!pattern || !categorie || !Number.isInteger(poids) || poids < 1 || poids > 5) {
      return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
    }

    const { data, error } = await staff.admin
      .from("trust_rules")
      .insert({
        pattern,
        categorie,
        poids,
        actif: true,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logAdminAction(staff.admin, {
      adminId: staff.user.id,
      action: "trust_regle",
      cibleType: "message",
      cibleId: data?.id ?? null,
      details: { op: "ajouter", categorie, poids },
    });

    return NextResponse.json({ ok: true, id: data?.id });
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}
