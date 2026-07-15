import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api");
}

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname) || isApiRoute(pathname)) {
    return NextResponse.next();
  }

  if (isAdminRoute(pathname)) {
    const authCookie = request.cookies.get("auth-storage");
    let isAuthenticated = false;
    let isAdmin = false;

    if (authCookie?.value) {
      try {
        const decoded = decodeURIComponent(authCookie.value);
        const parsed = JSON.parse(decoded);
        const state = parsed.state ?? parsed;
        if (state?.isAuthenticated && state?.user) {
          isAuthenticated = true;
          isAdmin = state.user.dbRole === "ADMIN";
        }
      } catch {
        isAuthenticated = false;
        isAdmin = false;
      }
    }

    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
