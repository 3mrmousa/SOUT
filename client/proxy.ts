import type { NextRequest } from "next/server";
import { redirectMiddleware } from "./middleware/redirect.middleware";

export function proxy(request: NextRequest) {
  return redirectMiddleware(request);
}

export default proxy;

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|ttf|woff|woff2)).*)",
  ],
};
