import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: string;
  } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";

  if (!email) {
    return NextResponse.json({ banni: false });
  }

  try {
    const admin = createServiceClient();
    const { data, error } = await admin
      .from("emails_bannis")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("[auth/email-banni]", error);
      return NextResponse.json({ banni: false });
    }

    return NextResponse.json({ banni: Boolean(data) });
  } catch (error) {
    console.error("[auth/email-banni]", error);
    return NextResponse.json({ banni: false });
  }
}
