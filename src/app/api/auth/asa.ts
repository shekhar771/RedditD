// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")

}


model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

    @@index([userId])

}

model User {
  id            String    @id @default(cuid())
  name          String?
    username      String?   @unique  // Add this line
email         String?   @unique
  emailVerified DateTime?
  passwordHash String?

  image    String?
  accounts Account[]
  sessions Session[]
}

lib/auth.ts 
import { GitHub } from "arctic";

export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_CLIENT_SECRET!,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback` // Add the full callback URL
);



component/AuthProvider.tsx 
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signup: (email: string, password: string, username: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  loginWithGithub: () => Promise<void>; // Add this new method
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
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
        setUser(data.user);
        return data.user;
      } else {
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error("Session refresh failed:", error);
      setUser(null);
      return null;
      router.push("/login");
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

      setUser(data.user);
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

      setUser(data.user);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginWithGithub,
        signup,
        login,
        logout,
        refreshSession,
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

component/AuthGuard.tsx
"use client";

import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}
export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !user) {
        router.push("/login");
      } else if (!requireAuth && user) {
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, requireAuth, router]);

  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  if (requireAuth && !user) {
    return null;
  }

  if (!requireAuth && user) {
    return null;
  }

  return <>{children}</>;
}

Navbar.tsx
"use client";

import Link from "next/link";
import React from "react";
import reddie from "../../../public/reddie-logo.svg";
import Image from "next/image";
import { ModeToggle } from "./ThemeButton";
import { Button } from "@/components/ui/button";
type Props = {};

const Navbar = (props: Props) => {
  return (
    <nav className="flex h-[10vh] w-full items-center border-b px-7 mx-2 md:justify-between px-14 mb-3">
      <Link href="/">
        <Image src={reddie} alt="reddit logo" className="  h-14 w-full" />
      </Link>
      <div className="flex items-center gap-x-2">
        <ModeToggle />
        <Button variant="secondary" asChild>
          <Link href="/signup">Sign Up</Link>
        </Button>

        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;


middleware.ts
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

Layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "@/app/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./components/AuthProvider";

export const metadata: Metadata = {
  title: "Reddie",
  description: "Reddit clone with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
dashboard/pages.tsx

"use client";

import { AuthGuard } from "@/app/components/AuthGuard";
import { useAuth } from "@/app/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to your Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground">Logged in as:</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Username:</p>
                <p className="font-medium">{user?.username}</p>
              </div>
              <Button onClick={handleLogout} variant="outline">
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}

api/auth/session/route.ts
// app/api/auth/session/route.ts
import { NextResponse } from "next/server";
import { getSessionToken } from "../[...auth]/cookie";
import { validateSession } from "../[...auth]/session";

export async function GET() {
  try {
    const sessionToken = await getSessionToken();

    if (!sessionToken) {
      return NextResponse.json(
        { error: "No session found" },
        { status: 401 }
      );
    }

    const { session, user } = await validateSession(sessionToken);

    if (!session || !user) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    });
  } catch (error) {
    console.error("Session validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate session" },
      { status: 500 }
    );
  }
}

// app/api/auth/github/callback/route.ts
import { github } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  createSession,
  generateRandomSessionToken,
} from "@/app/api/auth/[...auth]/session";
import { setSessionCookie } from "@/app/api/auth/[...auth]/cookie";

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/login?error=missing_params", request.url)
      );
    }

    const cookieStore = await cookies();
    const storedState = cookieStore.get("github_oauth_state")?.value;

    if (!storedState || state !== storedState) {
      return NextResponse.redirect(
        new URL("/login?error=state_mismatch", request.url)
      );
    }

    // Get the tokens from GitHub
    const tokens = await github.validateAuthorizationCode(code);
    const accessToken = tokens.data.access_token;

    if (!accessToken) {
      return NextResponse.redirect(
        new URL("/login?error=no_token", request.url)
      );
    }

    // Fetch GitHub user data
    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${accessToken}`,
        "User-Agent": "NextJS-App",
      },
    });

    if (!githubUserResponse.ok) {
      return NextResponse.redirect(
        new URL("/login?error=github_api", request.url)
      );
    }

    const githubUser = await githubUserResponse.json();

    // Fetch user's emails
    const emailsResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${accessToken}`,
        "User-Agent": "NextJS-App",
      },
    });

    const emails = await emailsResponse.json();
    const primaryEmail = emails.find((email: any) => email.primary);

    if (!primaryEmail) {
      return NextResponse.redirect(
        new URL("/login?error=no_email", request.url)
      );
    }

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email: primaryEmail.email }, { username: githubUser.login }],
      },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: primaryEmail.email,
          username: githubUser.login,
          name: githubUser.name || githubUser.login,
          image: githubUser.avatar_url,
          emailVerified: primaryEmail.verified ? new Date() : null,
        },
      });
    }

    // Update or create account
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: "github",
          providerAccountId: githubUser.id.toString(),
        },
      },
      create: {
        userId: user.id,
        type: "oauth",
        provider: "github",
        providerAccountId: githubUser.id.toString(),
        access_token: accessToken,
        token_type: "bearer",
        scope: tokens.data.scope || "",
      },
      update: {
        access_token: accessToken,
        scope: tokens.data.scope || "",
      },
    });

    // Create session
    const sessionToken = generateRandomSessionToken();
    const session = await createSession(sessionToken, user.id);

    // Create response with redirect
    const response = NextResponse.redirect(new URL("/dashboard", request.url));

    // Set session cookie
    await setSessionCookie(sessionToken, session.expires, response);

    return response;
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    return NextResponse.redirect(
      new URL("/login?error=oauth_failed", request.url)
    );
  }
}

// app/api/auth/github/route.ts
import { generateState } from "arctic";
import { github } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(): Promise<Response> {
  const state = generateState();
  const url = github.createAuthorizationURL(state, ["read:user", "user:email"]);

  const cookieStore = await cookies();
  cookieStore.set("github_oauth_state", state, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    sameSite: "lax",
  });

  return NextResponse.redirect(url.toString());
}
api/auth/[...auth]/route.ts 
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // Prisma client instance
import { hashPassword, verifyPasswordHash } from "./password";
import {
  generateRandomSessionToken,
  createSession,
  invalidateSession,
} from "./session";
import {
  setSessionCookie,
  deleteSessionCookie,
  SESSION_COOKIE_NAME,
} from "./cookie";
import { cookies } from "next/headers";

// Handle POST request for signup

export async function POST(req: Request) {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*"); // Allow all origins (or specify your frontend URL)
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new NextResponse(null, { headers });
  }
  try {
    // Parse the request body
    const body = await req.json();
    const { username, email, password } = body;

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash the password
    const passwordHash = await hashPassword(password);

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
      },
      // Explicitly select which fields to return
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    // Create a session for the user
    const sessionToken = generateRandomSessionToken();
    // const id = "aaa";
    // const user = { id: id, username: "aa", email: "a", password: "aa" };
    console.log(sessionToken);
    const session = await createSession(sessionToken, user.id);
    console.log(session);

    // Create response with user data
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
      { status: 201 }
    );

    // Set the session cookie
    await setSessionCookie(sessionToken, session.expires, response);

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Registration failed" },
      { status: 500 }
    );
  }
}

// Handle PUT request for signin
export async function PUT(req: Request) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find the user in the database
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPasswordHash(user.passwordHash, password))) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create a session for the user
    const sessionToken = generateRandomSessionToken();
    const session = await createSession(sessionToken, user.id);

    // Set the session cookie
    const response = NextResponse.json({ user }, { status: 200 });
    await setSessionCookie(sessionToken, session.expires, response);

    return response;
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json(
      { error: "Failed to sign in. Please try again." },
      { status: 500 }
    );
  }
}

// Handle DELETE request for signout
export async function DELETE(req: Request) {
  try {
    const cookiestore = cookies();
    const sessionToken = (await cookiestore).get(SESSION_COOKIE_NAME)?.value;
    // Get the session token from the cookie
    if (!sessionToken) {
      return NextResponse.json({ error: "No session found" }, { status: 400 });
    }

    // Invalidate the session in the database
    await invalidateSession(sessionToken);

    // Delete the session cookie
    const response = NextResponse.json(
      { message: "Signed out successfully" },
      { status: 200 }
    );
    return await deleteSessionCookie(response);
  } catch (error) {
    console.error("Signout error:", error);
    return NextResponse.json(
      { error: "Failed to sign out. Please try again." },
      { status: 500 }
    );
  }
}

session ts 
import { sha256 } from "@oslojs/crypto/sha2";
// import { webcrypto as crypto } from "crypto"; // Add this import
import { prisma } from "@/lib/db"; // Prisma client instance
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";

const SESSION_REFRESH_INTERVAL_MS = 1000 * 60 * 60 * 24 * 15; // 15 days
const SESSION_MAX_DURATION_MS = SESSION_REFRESH_INTERVAL_MS * 2; // 30 days

const fromSessionTokenToSessionId = (sessionToken: string) => {
  return encodeHexLowerCase(sha256(new TextEncoder().encode(sessionToken)));
};
const crypto = globalThis.crypto;

export const generateRandomSessionToken = () => {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes); // Now uses the correct crypto instance
  return encodeBase32LowerCaseNoPadding(bytes);
};

export const createSession = async (sessionToken: string, userId: string) => {
  const sessionId = fromSessionTokenToSessionId(sessionToken);

  const session = {
    id: sessionId,
    userId,
    sessionToken,
    expires: new Date(Date.now() + SESSION_MAX_DURATION_MS), // Change expiresAt to expires
  };

  await prisma.session.create({ data: session });
  return session;
};

export const validateSession = async (sessionToken: string) => {
  const sessionId = fromSessionTokenToSessionId(sessionToken);

  const result = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!result) return { session: null, user: null };

  const { user, ...session } = result;

  if (Date.now() >= session.expires.getTime()) {
    await prisma.session.delete({ where: { id: sessionId } });
    return { session: null, user: null };
  }

  if (Date.now() >= session.expires.getTime() - SESSION_REFRESH_INTERVAL_MS) {
    session.expires = new Date(Date.now() + SESSION_MAX_DURATION_MS);
    await prisma.session.update({
      where: { id: sessionId },
      data: { expires: session.expires },
    });
  }

  return { session, user };
};

export const invalidateSession = async (sessionToken: string) => {
  try {
    await prisma.session.delete({ where: { sessionToken: sessionToken } });
  } catch (error) {
    console.error("Error invalidating session:", error);
    throw new Error("Failed to invalidate session");
  }
};

cookies.ts 
// app/api/auth/[...auth]/cookie.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const SESSION_COOKIE_NAME = "session";

// Cookie configuration
const getCookieOptions = (expiresAt?: Date) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  ...(expiresAt && { expires: expiresAt }),
  // Set a reasonable max age as fallback if expires is not provided
  maxAge: expiresAt
    ? Math.floor((expiresAt.getTime() - Date.now()) / 1000)
    : 60 * 60 * 24 * 7, // 1 week default
});

export const setSessionCookie = async (
  sessionToken: string,
  expiresAt: Date,
  response?: NextResponse
) => {
  const cookieOptions = getCookieOptions(expiresAt);

  try {
    if (response) {
      // For API routes using NextResponse
      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: sessionToken,
        ...cookieOptions,
      });
    } else {
      // For server components/middleware
      (
        await // For server components/middleware
        cookies()
      ).set({
        name: SESSION_COOKIE_NAME,
        value: sessionToken,
        ...cookieOptions,
      });
    }
  } catch (error) {
    console.error("Error setting session cookie:", error);
    throw new Error("Failed to set session cookie");
  }
};

export const deleteSessionCookie = async (response?: NextResponse) => {
  const cookieOptions = {
    ...getCookieOptions(),
    maxAge: 0, // Expire immediately
    expires: new Date(0), // Set expiration to past date
  };

  try {
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      ...cookieOptions,
    });
    return response;
  } catch (error) {
    console.error("Error deleting session cookie:", error);
    throw new Error("Failed to delete session cookie");
  }
};

export const getSessionToken = async (): Promise<string | undefined> => {
  try {
    return (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  } catch (error) {
    console.error("Error getting session token:", error);
    return undefined;
  }
};

// Utility to check if a session token exists
export const hasSessionToken = async (): Promise<boolean> => {
  try {
    const token = await getSessionToken();
    return !!token;
  } catch {
    return false;
  }
};

login/pages.tsx
"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Camera as IconSpinner } from "lucide-react";
import { Icons } from "@/components/ui/icons";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider";
import { AuthGuard } from "@/app/components/AuthGuard";

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loginWithGithub } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);

      toast({
        title: "Success",
        description: "Logged in successfully",
      });

      //
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleGithubLogin = async () => {
    try {
      await loginWithGithub();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "GitHub login failed. Please try again.",
      });
    }
  };
  const handleSocialAuth = async (provider: string) => {
    setIsLoading(true);
    try {
      // Implement proper social auth flow
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Authentication failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="grid w-full grow items-center px-4 sm:justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Sign in to Reddie</CardTitle>
            <CardDescription>
              Welcome back! Please sign in to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                disabled={isLoading}
                onClick={() => handleGithubLogin()}
              >
                {isLoading ? (
                  <IconSpinner className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Icons.gitHub className="mr-2 h-4 w-4" />
                    GitHub
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                disabled={isLoading}
                onClick={() => handleSocialAuth("google")}
              >
                {isLoading ? (
                  <IconSpinner className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Icons.google className="mr-2 h-4 w-4" />
                    Google
                  </>
                )}
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading && (
                <IconSpinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign In
            </Button>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </AuthGuard>
  );
}
