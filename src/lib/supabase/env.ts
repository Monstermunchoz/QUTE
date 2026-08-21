export function getPublicSupabaseEnv() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
    .trim()
    .replace(/\/rest\/v1\/?$/i, "")
    .replace(/\/$/, "");
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

  return { url, anonKey };
}
