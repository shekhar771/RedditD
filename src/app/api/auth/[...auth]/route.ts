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
        name: null,
        image: null,
      },
      // Explicitly select which fields to return
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        image: true,
      },
    });

    const account = await prisma.account.create({
      data: {
        userId: user.id,
        type: "email_password",
        provider: "credentials",
        providerAccountId: email,
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
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name || null,
          image: user.image || null,
        },
      },
      { status: 200 }
    );
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
