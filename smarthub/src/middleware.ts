import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const adminRoutes = ["/admin"];
const customerOnlyRoutes = ["/cart", "/wishlist", "/account", "/checkout", "/orders"];
const publicRoutes = ["/", "/login", "/register", "/products"];

function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some((route) => pathname.startsWith(route));
}

function isCustomerOnlyRoute(pathname: string): boolean {
  return customerOnlyRoutes.some((route) => pathname.startsWith(route));
}

function isPublicRoute(pathname: string): boolean {
  if (pathname === "/") return true;
  return publicRoutes.some((route) => pathname.startsWith(route));
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

  if (isAdminRoute(pathname)) {
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
    return NextResponse.next();
  }

  if (isCustomerOnlyRoute(pathname)) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (isPublicRoute(pathname)) {
    if (isAuthenticated && isAdmin && pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
