// app/api/validate-session/route.ts
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { validateSession } from "@/app/api/auth/[...auth]/session";

export async function POST(request: Request) {
  const { sessionToken } = await request.json();

  try {
    const { session, user } = await validateSession(sessionToken);

    if (!session || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    return NextResponse.json({ session, user });
  } catch (error) {
    console.error("Session validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate session" },
      { status: 500 }
    );
  }
}

("use client");

import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icons } from "@/components/ui/icons"; // Make sure you have this component

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

export function AuthGuard({
  children,
  requireAuth = true,
  fallback = (
    <div className="flex justify-center items-center h-screen">
      {" "}
      <Icons.spinner className="size-4 animate-spin" />
    </div>
  ),
}: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isClientSideChecked, setIsClientSideChecked] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !user) {
        router.push("/login");
      } else if (!requireAuth && user) {
        router.push("/dashboard");
      }
      setIsClientSideChecked(true);
    }
  }, [user, isLoading, requireAuth, router]);

  // Show loading state while initial check is happening
  if (isLoading || !isClientSideChecked) {
    return fallback;
  }

  // Don't render children for unauthorized or wrong state
  if ((requireAuth && !user) || (!requireAuth && user)) {
    return null;
  }

  // Render the protected content
  return <>{children}</>;
}

("use client");
import { createContext, useContext, useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";

interface User {
  id: string;
  username: string | null;
  email: string | null;
  name?: string | null;
  image?: string | null;
}

interface Session {
  user: User;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signup: (email: string, password: string, username: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshSession = async () => {
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const newUser = data.user
          ? {
              ...data.user,
              name: data.user.name || data.user.username,
            }
          : null;

        setUser(newUser);
        setSession(newUser ? { user: newUser } : null);
        return newUser;
      } else {
        setUser(null);
        setSession(null);
        return null;
      }
    } catch (error) {
      console.error("Session refresh failed:", error);
      setUser(null);
      setSession(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const signup = async (email: string, password: string, username: string) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      const newUser = {
        ...data.user,
        name: data.user.name || data.user.username,
      };

      setUser(newUser);
      setSession({ user: newUser });
      router.push("/dashboard");
    } catch (error) {
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/signin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      const newUser = {
        ...data.user,
        name: data.user.name || data.user.username,
      };

      setUser(newUser);
      setSession({ user: newUser });
      router.push("/dashboard");
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch("/api/auth/signout", {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setUser(null);
      setSession(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  const loginWithGithub = async () => {
    try {
      window.location.href = "/api/auth/github";
    } catch (error) {
      console.error("GitHub login failed:", error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      window.location.href = "/api/auth/google";
    } catch (error) {
      console.error("Google login failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        signup,
        login,
        logout,
        refreshSession,
        loginWithGithub,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Convenience hook to match NextAuth pattern
export const useSession = () => {
  const { session, isLoading } = useAuth();
  return {
    data: session,
    status: isLoading
      ? "loading"
      : session
      ? "authenticated"
      : "unauthenticated",
  };
};

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
