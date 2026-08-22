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
    kind?: string;
    profileId?: string;
    photoId?: string;
    action?: string;
  } | null;

  const kind = body?.kind === "album" ? "album" : "avatar";
  const profileId = body?.profileId?.trim() ?? "";
  const photoId = body?.photoId?.trim() ?? "";
  const action = body?.action === "rejeter" ? "rejeter" : body?.action === "approuver" ? "approuver" : "";

  if (!profileId || !action) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  if (kind === "album" && !photoId) {
    return NextResponse.json({ error: "Photo invalide" }, { status: 400 });
  }

  const { data: cible } = await staff.admin
    .from("profiles")
    .select("pseudo")
    .eq("id", profileId)
    .maybeSingle();

  const pseudo = typeof cible?.pseudo === "string" ? cible.pseudo : "";

  try {
    if (kind === "album") {
      const { error } = await staff.admin
        .from("photos")
        .update({ statut: action === "approuver" ? "approved" : "rejected" })
        .eq("id", photoId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      await logAdminAction(staff.admin, {
        adminId: staff.user.id,
        action: action === "approuver" ? "approuver_photo" : "rejeter_photo",
        cibleType: "photo",
        cibleId: photoId,
        details: { kind: "album", pseudo, profileId },
      });

      return NextResponse.json({ ok: true });
    }

    if (action === "approuver") {
      const { data: signed } = await staff.admin.storage
        .from("avatars")
        .createSignedUrl(`${profileId}/pending.jpg`, 60 * 60 * 24 * 365);

      const { error } = await staff.admin
        .from("profiles")
        .update({
          photo_status: "approved",
          photo_url: signed?.signedUrl ?? undefined,
        })
        .eq("id", profileId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      const { error } = await staff.admin
        .from("profiles")
        .update({ photo_status: "rejected", photo_url: null })
        .eq("id", profileId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    await logAdminAction(staff.admin, {
      adminId: staff.user.id,
      action: action === "approuver" ? "approuver_photo" : "rejeter_photo",
      cibleType: "photo",
      cibleId: profileId,
      details: { kind: "avatar", pseudo },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    console.error("[admin/photos]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
