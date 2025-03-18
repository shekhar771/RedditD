// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define routes configuration
const ROUTES = {
  public: ["/", "/about", "/contact"],
  auth: ["/login", "/signup", "/forgot-password"],
  protected: ["/dashboard", "/profile", "/settings", "/r/", "/r/create"],
  default: "/dashboard",
};

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  // Check if current path matches any route type
  const isAuthRoute = ROUTES.auth.some((route) => pathname.startsWith(route));
  const isPublicRoute = ROUTES.public.some((route) =>
    pathname.startsWith(route)
  );
  const isProtectedRoute = ROUTES.protected.some((route) => {
    if (pathname === route) return true;
    if (
      route.endsWith("/")
        ? pathname.startsWith(route)
        : pathname === route || pathname.startsWith(`${route}/`)
    )
      return true;
    return false;
  });

  // Function to validate session by calling the API route
  const validateUserSession = async () => {
    if (!sessionToken) return null;

    try {
      const response = await fetch(
        `${request.nextUrl.origin}/api/auth/validate-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionToken }),
        }
      );

      if (!response.ok) return null;

      const { session, user } = await response.json();
      return { session, user };
    } catch (error) {
      console.error("Session validation error from middleware:", error);
      return null;
    }
  };

  // Handle authentication routes (login, signup)
  if (isAuthRoute) {
    const userData = await validateUserSession();
    if (userData) {
      return NextResponse.redirect(new URL(ROUTES.default, request.url));
    }
    return NextResponse.next();
  }

  // Handle public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Handle protected routes
  if (isProtectedRoute) {
    const userData = await validateUserSession();
    if (!userData) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    const response = NextResponse.next();
    response.headers.set("x-user-id", userData.user.id);
    response.headers.set("x-user-email", userData.user.email);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/r/:path*",
    "/login",
    "/signup",
    "/forgot-password",
  ],
};
