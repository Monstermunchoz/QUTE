import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const staff = await requireStaff();

  if ("error" in staff) {
    return staff.error;
  }

  const url = new URL(request.url);
  const source = url.searchParams.get("source");
  const conversationId = url.searchParams.get("conversationId");
  const salonId = url.searchParams.get("salonId");
  const messageId = url.searchParams.get("messageId");

  if (source === "prive" && conversationId) {
    const { data } = await staff.admin
      .from("messages")
      .select("id, auteur_id, contenu, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(40);

    return NextResponse.json({
      lignes: (
        (data ?? []) as { id: string; auteur_id: string; contenu: string }[]
      ).map((row) => ({
        id: row.id,
        auteur: row.auteur_id,
        contenu: row.contenu,
        mine: row.id === messageId,
      })),
    });
  }

  if (source === "salon" && salonId) {
    const { data } = await staff.admin
      .from("salon_messages")
      .select("id, auteur_id, contenu, created_at")
      .eq("salon_id", salonId)
      .order("created_at", { ascending: true })
      .limit(40);

    return NextResponse.json({
      lignes: (
        (data ?? []) as { id: string; auteur_id: string; contenu: string }[]
      ).map((row) => ({
        id: row.id,
        auteur: row.auteur_id,
        contenu: row.contenu,
        mine: row.id === messageId,
      })),
    });
  }

  return NextResponse.json({ lignes: [] });
}
