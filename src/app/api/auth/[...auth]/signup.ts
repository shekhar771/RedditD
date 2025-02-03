// src/app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "./password";
import {
  generateRandomSessionToken,
  createSession,
} from "@/app/api/auth/[...auth]/session";
import { setSessionCookie } from "@/app/api/auth/[...auth]/cookie";

export async function POST(req: Request) {
  const body = await req.json();
  const { username, email, password } = body;

  // Validate the request body
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { username, email, passwordHash },
    });

    const sessionToken = generateRandomSessionToken();
    const session = await createSession(sessionToken, user.id);

    const response = NextResponse.json({ user }, { status: 201 });
    await setSessionCookie(sessionToken, session.expiresAt, response);

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: `failed to create user ${error}` },
      { status: 500 }
    );
  }
}
