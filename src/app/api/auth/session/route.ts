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