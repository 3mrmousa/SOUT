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
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password";

  const hasSession =
    request.cookies.has("access_token") || request.cookies.has("refresh_token");

  if (!hasSession && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasSession && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return NextResponse.next();
}
