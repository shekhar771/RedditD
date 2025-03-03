// middleware.ts

import { validateSession } from "@/app/api/auth/[...auth]/session";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


// Define routes configuration
const ROUTES = {
  public: ["/", "/about", "/contact"],
  auth: ["/login", "/signup", "/forgot-password"],
  protected: ["/dashboard", "/profile", "/settings"],
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
  const isProtectedRoute = ROUTES.protected.some((route) =>
    pathname.startsWith(route)
  );

  // Function to validate session and return user data
  const validateUserSession = async () => {
    if (!sessionToken) return null;
    try {
      const { session, user } = await validateSession(sessionToken);
      return session && user ? { session, user } : null;
    } catch (error) {
      console.error("Session validation error:", error);
      return null;
    }
  };

  // Handle authentication routes (login, signup)
  if (isAuthRoute) {
    const userData = await validateUserSession();
    if (userData) {
      // Redirect authenticated users away from auth routes
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
      // Redirect unauthenticated users to login
 
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Add user info to headers for API routes
    const response = NextResponse.next();
    response.headers.set("x-user-id", userData.user.id);
    response.headers.set("x-user-email", userData.user.email);
    return response;
  }

  // Default handling for unspecified routes
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};