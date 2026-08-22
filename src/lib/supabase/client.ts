import { createBrowserClient } from "@supabase/ssr";
import {
  supabaseCookieEncode,
  supabaseCookieOptions,
} from "@/lib/supabase/cookies";
import { getPublicSupabaseEnv } from "@/lib/supabase/env";

export function createClient() {
  const { url, anonKey } = getPublicSupabaseEnv();

  return createBrowserClient(url, anonKey, {
    cookieOptions: supabaseCookieOptions,
    cookies: { encode: supabaseCookieEncode },
  });
}
