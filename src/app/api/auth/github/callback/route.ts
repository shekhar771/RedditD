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
      console.error("Missing code or state");
      return NextResponse.redirect(
        new URL("/login?error=missing_params", request.url)
      );
    }

    const cookieStore = await cookies();
    const storedState = cookieStore.get("github_oauth_state")?.value;

    if (!storedState || state !== storedState) {
      console.error("State mismatch");
      return NextResponse.redirect(
        new URL("/login?error=state_mismatch", request.url)
      );
    }

    // Get the tokens from GitHub
    const tokens = await github.validateAuthorizationCode(code);

    // Extract the access token from the nested structure
    const accessToken = tokens.data.access_token;

    if (!accessToken) {
      console.error("No access token received");
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
      console.error("GitHub API error:", await githubUserResponse.text());
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

    if (!emailsResponse.ok) {
      console.error("GitHub emails API error:", await emailsResponse.text());
      return NextResponse.redirect(
        new URL("/login?error=github_email", request.url)
      );
    }

    const emails = await emailsResponse.json();
    const primaryEmail =
      emails.find((email: any) => email.primary)?.email || githubUser.email;

    if (!primaryEmail) {
      console.error("No primary email found");
      return NextResponse.redirect(
        new URL("/login?error=no_email", request.url)
      );
    }

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email: primaryEmail }, { username: githubUser.login }],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: primaryEmail,
          username: githubUser.login,
          name: githubUser.name || githubUser.login,
          image: githubUser.avatar_url,
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
    console.error("Full error details:", error);
    return NextResponse.redirect(
      new URL("/login?error=oauth_failed", request.url)
    );
  }
}
