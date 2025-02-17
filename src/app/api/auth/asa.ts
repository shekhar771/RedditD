import { validateSession } from "@/app/api/auth/[...auth]/session";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = ["/", "/forgot-password", "reset-password"];
const authRoutes = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  // Check if the current path is an auth route (login/signup)
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // If user is authenticated and trying to access auth routes, redirect to dashboard
  if (sessionToken && isAuthRoute) {
    try {
      const { session, user } = await validateSession(sessionToken);
      if (session && user) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (error) {
      // If session validation fails, continue to auth route
      console.error("Session validation failed:", error);
    }
  }

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Allow public routes without authentication
  if (isPublicRoute || isAuthRoute) {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (!sessionToken) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const { session, user } = await validateSession(sessionToken);

    if (!session || !user) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Add user info to request headers for use in API routes
    const response = NextResponse.next();
    response.headers.set("x-user-id", user.id);
    response.headers.set("x-user-email", user.email);
    return response;
  } catch (error) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
