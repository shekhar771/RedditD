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
    const searchParams = new URL(request.url).searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const cookieStore = cookies();
    const storedState = (await cookieStore).get("github_oauth_state")?.value;

    if (!code || !state || !storedState || state !== storedState) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const tokens = await github.validateAuthorizationCode(code);

    // Fetch GitHub user data
    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });

    const githubUser = await githubUserResponse.json();

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        email: githubUser.email,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: githubUser.email,
          username: githubUser.login,
          name: githubUser.name || githubUser.login,
        },
      });
    }

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
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
