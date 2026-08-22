import { NextResponse } from "next/server";
import { getCeSoirCounts } from "@/lib/ce-soir/counts";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const counts = await getCeSoirCounts(supabase);
  return NextResponse.json(counts);
}
