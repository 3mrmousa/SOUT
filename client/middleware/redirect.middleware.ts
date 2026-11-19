import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function redirectMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never redirect static files, assets, or API calls
  if (
    pathname.includes(".") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  const isPublicPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password";

  // Does the user have a session? access_token or refresh_token
  const hasSession =
    request.cookies.has("access_token") || request.cookies.has("refresh_token");

  // Not logged in -> go to /login
  if (!hasSession && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Already logged in -> go to /
  if (hasSession && isPublicPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}
