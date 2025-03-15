// lib/server-auth.ts
import { cookies } from "next/headers";
import { validateSession } from "@/app/api/auth/[...auth]/session";
import { SESSION_COOKIE_NAME } from "@/app/api/auth/[...auth]/cookie";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export type AuthUser = {
  id: string;
  username: string | null;
  email: string | null;
  name?: string | null;
  image?: string | null;
};

// Get the current session without any redirect or error
export async function getServerSession() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return { session: null, user: null };
  }

  return await validateSession(sessionToken);
}

// For server components - redirects to login if not authenticated
export async function requireAuth(): Promise<AuthUser> {
  const { user } = await getServerSession();

  if (!user) {
    redirect("/login");
  }

  return user;
}

// For API routes - throws error if not authenticated
export async function validateAuthForApi() {
  const { user, session } = await getServerSession();

  if (!user || !session) {
    throw new Error("Unauthorized");
  }

  return { user, session };
}

// Get the auth user without redirecting
export async function getAuthUser(): Promise<AuthUser | null> {
  const { user } = await getServerSession();
  return user;
}

// For API routes - protected route handler wrapper
export function withAuth(
  handler: (req: NextRequest, user: AuthUser) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const { user } = await validateAuthForApi();
      return await handler(req, user);
    } catch (error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      console.error("API Error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  };
}

// Server actions wrapper
export function withAuthAction<T, A extends any[]>(
  action: (user: AuthUser, ...args: A) => Promise<T>
) {
  return async (...args: A): Promise<T | { error: string }> => {
    try {
      const { user } = await validateAuthForApi();
      return await action(user, ...args);
    } catch (error) {
      console.error("Server Action Error:", error);
      return { error: error.message || "An error occurred" };
    }
  };
}
