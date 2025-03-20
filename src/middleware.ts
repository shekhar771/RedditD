// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "./app/api/auth/[...auth]/cookie";

export async function middleware(request: NextRequest) {
  // Define the protected routes
  const protectedPaths = [
    "/dashboard",
    "/settings",
    "/profile",
    "/create-subreddit",
    "/r/create",
    "/submit",
  ];
  ///---------------------------------------------------------------------------------------------------------

  const authRoutes = ["/login", "/signup"];

  // Get the path from the request
  const path = request.nextUrl.pathname;
  const isAuthRoute = authRoutes.some((route) => path === route);

  const cookieStore = request.cookies;
  const sessionToken = cookieStore.get("session")?.value;

  // If user is logged in and trying to access auth routes, redirect to dashboard
  if (isAuthRoute && sessionToken) {
    try {
      // Validate the session token

      const response = await fetch(
        new URL("/api/auth/validate-session", request.url),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionToken }),
        }
      );

      if (response.ok) {
        // User is logged in, redirect to dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (error) {
      console.error("Error validating session:", error);
      // If validation fails, continue to auth page
    }
  }

  ///---------------------------------------------------------------------------------------------------------
  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(
    (protectedPath) =>
      path === protectedPath || path.startsWith(`${protectedPath}/`)
  );

  if (isProtectedPath) {
    // Get the session cookie
    const cookieStore = request.cookies;
    const sessionToken = cookieStore.get("session")?.value;

    // If there's no session token, redirect to login
    if (!sessionToken) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }

    // Optional: Validate the token on each request
    // This adds some overhead but ensures session is still valid
    try {
      const response = await fetch(
        new URL("/api/auth/validate-session", request.url),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionToken }),
        }
      );

      if (!response.ok) {
        const url = new URL("/login", request.url);
        url.searchParams.set("redirect", path);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error("Error validating session:", error);
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: [
    // Protected routes
    "/dashboard/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/submit/:path*",
    "/r/create",
    "/login",
    "/signup",

    // Exclude API routes from middleware
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
