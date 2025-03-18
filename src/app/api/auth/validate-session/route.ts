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
