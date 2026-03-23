import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication (redirect to login if not authenticated)
const protectedRoutes = ["/profile", "/settings"];

// Routes that are always public
const publicRoutes = ["/auth/login", "/auth/register", "/auth/signin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth cookies (Supabase or NextAuth)
  const hasAuthCookie = request.cookies.getAll().some(
    (cookie) =>
      cookie.name.includes("auth-token") ||
      cookie.name.includes("sb-") ||
      cookie.name === "next-auth.session-token" ||
      cookie.name === "__Secure-next-auth.session-token"
  );

  // If accessing a protected route without auth, redirect to sign-in
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !hasAuthCookie) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
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
