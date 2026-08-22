import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PROTECTED_ROUTES = [
  "/accueil",
  "/explorer",
  "/creer",
  "/qute",
  "/moi",
  "/salons",
  "/groupes",
  "/lieux",
  "/evenements",
  "/admin",
  "/abonnement",
  "/parametres",
  "/securite",
  "/aide",
  "/amis",
];
const AUTH_ROUTES = ["/login", "/register"];
const PUBLIC_ROUTES = ["/cgu"];

function matchesRoute(pathname: string, routes: string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function redirectWithCookies(url: URL, source: NextResponse) {
  const redirectResponse = NextResponse.redirect(url);
  const setCookies =
    typeof source.headers.getSetCookie === "function"
      ? source.headers.getSetCookie()
      : [];

  if (setCookies.length > 0) {
    setCookies.forEach((cookie) => {
      redirectResponse.headers.append("Set-Cookie", cookie);
    });
  } else {
    source.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
  }

  const cacheControl = source.headers.get("Cache-Control");
  if (cacheControl) {
    redirectResponse.headers.set("Cache-Control", cacheControl);
  }
  redirectResponse.headers.set("Pragma", "no-cache");
  redirectResponse.headers.set("Expires", "0");

  return redirectResponse;
}

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (matchesRoute(pathname, PUBLIC_ROUTES)) {
    return supabaseResponse;
  }

  if (matchesRoute(pathname, PROTECTED_ROUTES) && !user) {
    return redirectWithCookies(
      new URL("/login", request.url),
      supabaseResponse,
    );
  }

  if (matchesRoute(pathname, AUTH_ROUTES) && user) {
    return redirectWithCookies(
      new URL("/accueil", request.url),
      supabaseResponse,
    );
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
