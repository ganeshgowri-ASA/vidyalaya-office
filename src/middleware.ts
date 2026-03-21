import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication (redirect to login if not authenticated)
const protectedRoutes = ["/profile", "/settings"];

// Routes that are always public
const publicRoutes = ["/auth/login", "/auth/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for Supabase auth tokens in cookies
  // Supabase stores auth in cookies with the sb-*-auth-token pattern
  const hasAuthCookie = request.cookies.getAll().some(
    (cookie) => cookie.name.includes("auth-token") || cookie.name.includes("sb-")
  );

  // If accessing a protected route without auth, redirect to login
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !hasAuthCookie) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated and trying to access auth pages, redirect to home
  if (publicRoutes.some((route) => pathname.startsWith(route)) && hasAuthCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/settings/:path*", "/auth/:path*"],
};
