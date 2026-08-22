import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import {
  supabaseCookieEncode,
  supabaseCookieOptions,
} from "@/lib/supabase/cookies";
import { getPublicSupabaseEnv } from "@/lib/supabase/env";

type SessionResult = {
  supabaseResponse: NextResponse;
  user: User | null;
};

function applyAuthHeaders(
  response: NextResponse,
  headers?: Record<string, string>,
) {
  response.headers.set(
    "Cache-Control",
    "private, no-cache, no-store, must-revalidate, max-age=0",
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  if (!headers) {
    return;
  }

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
}

export async function updateSession(
  request: NextRequest,
): Promise<SessionResult> {
  let supabaseResponse = NextResponse.next({
    request,
  });
  applyAuthHeaders(supabaseResponse);

  const { url: supabaseUrl, anonKey: supabaseAnonKey } = getPublicSupabaseEnv();

  if (!supabaseUrl || !supabaseAnonKey) {
    return { supabaseResponse, user: null };
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: supabaseCookieOptions,
    cookies: {
      encode: supabaseCookieEncode,
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, {
            ...supabaseCookieOptions,
            ...options,
          }),
        );
        applyAuthHeaders(supabaseResponse, headers);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabaseResponse, user };
}
