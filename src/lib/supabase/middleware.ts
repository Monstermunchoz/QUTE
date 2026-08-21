import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import { getPublicSupabaseEnv } from "@/lib/supabase/env";

type SessionResult = {
  supabaseResponse: NextResponse;
  user: User | null;
};

export async function updateSession(request: NextRequest): Promise<SessionResult> {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const { url: supabaseUrl, anonKey: supabaseAnonKey } = getPublicSupabaseEnv();

  if (!supabaseUrl || !supabaseAnonKey) {
    return { supabaseResponse, user: null };
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabaseResponse, user };
}
