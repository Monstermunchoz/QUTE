import { NextResponse } from "next/server";
import { isStaffRole } from "@/lib/admin/staff";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function requireStaff() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: "Non connecté" }, { status: 401 }),
    };
  }

  const { data: profil } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  const role = typeof profil?.role === "string" ? profil.role : "";

  if (!isStaffRole(role)) {
    return {
      error: NextResponse.json({ error: "Accès refusé" }, { status: 403 }),
    };
  }

  return {
    user,
    role,
    admin: createServiceClient(),
  };
}

export function parseUserId(body: unknown) {
  if (!body || typeof body !== "object" || !("userId" in body)) {
    return "";
  }

  const value = (body as { userId?: unknown }).userId;
  return typeof value === "string" ? value.trim() : "";
}

export async function assertDeletableTarget(
  admin: ReturnType<typeof createServiceClient>,
  actor: { id: string; role: string },
  userId: string,
) {
  if (userId === actor.id) {
    return NextResponse.json(
      { error: "Tu ne peux pas supprimer ton propre compte." },
      { status: 400 },
    );
  }

  const { data: cible } = await admin
    .from("profiles")
    .select("id, role")
    .eq("id", userId)
    .maybeSingle();

  if (!cible) {
    return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  }

  if (cible.role === "admin") {
    return NextResponse.json(
      { error: "Impossible de supprimer un admin." },
      { status: 403 },
    );
  }

  if (cible.role === "moderateur" && actor.role !== "admin") {
    return NextResponse.json(
      { error: "Seul un admin peut supprimer un modérateur." },
      { status: 403 },
    );
  }

  return null;
}
