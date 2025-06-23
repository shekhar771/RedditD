// src/app/api/auth/signin/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPasswordHash } from "./password";
import {
  generateRandomSessionToken,
  createSession,
} from "@/app/api/auth/[...auth]/session";
import { setSessionCookie } from "@/app/api/auth/[...auth]/cookie";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPasswordHash(user.passwordHash, password))) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const sessionToken = generateRandomSessionToken();
    const session = await createSession(sessionToken, user.id);

    const response = NextResponse.json({ user }, { status: 200 });
    await setSessionCookie(sessionToken, session.expiresAt, response);

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to sign in ${error}` },
      { status: 500 }
    );
  }
}
