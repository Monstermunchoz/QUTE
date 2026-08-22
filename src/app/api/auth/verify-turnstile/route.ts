import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function siteKey() {
  return (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "").trim();
}

function secretKey() {
  return (process.env.TURNSTILE_SECRET_KEY ?? "").trim();
}

export async function POST(request: Request) {
  const site = siteKey();

  if (!site) {
    console.warn(
      "[turnstile] NEXT_PUBLIC_TURNSTILE_SITE_KEY vide — captcha désactivé, inscription non bloquée.",
    );
    return NextResponse.json({ ok: true, skipped: true });
  }

  const secret = secretKey();

  if (!secret) {
    console.warn(
      "[turnstile] TURNSTILE_SECRET_KEY manquante — impossible de valider le token.",
    );
    return NextResponse.json(
      { ok: false, error: "Captcha mal configuré." },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    token?: string;
  } | null;
  const token = body?.token?.trim() ?? "";

  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Captcha requis." },
      { status: 400 },
    );
  }

  const payload = new URLSearchParams();
  payload.set("secret", secret);
  payload.set("response", token);

  const verify = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: payload,
    },
  );
  const result = (await verify.json().catch(() => null)) as {
    success?: boolean;
  } | null;

  if (!result?.success) {
    return NextResponse.json(
      { ok: false, error: "Captcha invalide." },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
