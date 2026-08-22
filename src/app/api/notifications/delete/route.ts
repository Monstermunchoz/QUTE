import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";

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
    notification_id?: string;
    all?: boolean;
  } | null;

  const notificationId = body?.notification_id?.trim() ?? "";
  const deleteAll = body?.all === true;

  if (!deleteAll && !notificationId) {
    return NextResponse.json(
      { error: "Notification invalide" },
      { status: 400 },
    );
  }

  try {
    const admin = createServiceClient();
    let query = admin.from("notifications").delete().eq("user_id", user.id);

    if (!deleteAll) {
      query = query.eq("id", notificationId);
    }

    const { error } = await query;

    if (error) {
      console.error("[notifications/delete]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    console.error("[notifications/delete]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
