import { NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // Prisma client instance
import { hashPassword, verifyPasswordHash } from "./password";
import {
  generateRandomSessionToken,
  createSession,
  invalidateSession,
} from "./session";
import { setSessionCookie, deleteSessionCookie } from "./cookie";
import { cookies } from "next/headers";

// Handle POST request for signup

export async function POST(req: Request) {
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
    const session = await createSession(sessionToken, user.id);

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
    await setSessionCookie(sessionToken, session.expiresAt, response);

    return response;
  } catch (error) {
    console.error("Signup error:", error);

    // Ensure a proper error response
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create user. Please try again.",
      },
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
    await setSessionCookie(sessionToken, session.expiresAt, response);

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
    // Get the session token from the cookie
    const sessionToken = (await cookies()).get("session")?.value;
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
    await deleteSessionCookie(response);

    return response;
  } catch (error) {
    console.error("Signout error:", error);
    return NextResponse.json(
      { error: "Failed to sign out. Please try again." },
      { status: 500 }
    );
  }
}
