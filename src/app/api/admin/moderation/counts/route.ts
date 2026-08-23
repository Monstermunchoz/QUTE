import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin/api";
import { fetchModerationCounts } from "@/lib/admin/moderation-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const staff = await requireStaff();

  if ("error" in staff) {
    return staff.error;
  }

  const counts = await fetchModerationCounts();

  return NextResponse.json(counts, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
