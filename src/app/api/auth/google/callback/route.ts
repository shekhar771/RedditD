import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const state = url.searchParams.get("state");
    const code = url.searchParams.get("code");

    if (!state || !code) {
      return NextResponse.redirect(new URL("/login?error=missing_params", req.url));
    }

    const cookieStore = await cookies(); // ✅ Await cookies()
    const storedState = cookieStore.get("google_oauth_state")?.value;
    const codeVerifier = cookieStore.get("google_code_verifier")?.value;

    if (!storedState || !codeVerifier || state !== storedState) {
      cookieStore.delete("google_oauth_state");
      cookieStore.delete("google_code_verifier");
      return NextResponse.redirect(new URL("/login?error=invalid_state", req.url));
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URI}/api/auth/google/callback`,
        code_verifier: codeVerifier!,
      }),
    });

    if (!tokenResponse.ok) {
      console.error("Token fetch error:", await tokenResponse.text());
      return NextResponse.redirect(new URL("/login?error=token_fetch_failed", req.url));
    }

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      return NextResponse.redirect(new URL("/login?error=invalid_access_token", req.url));
    }

    const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userResponse.ok) {
      console.error("User fetch error:", await userResponse.text());
      return NextResponse.redirect(new URL("/login?error=user_fetch_failed", req.url));
    }

    const userInfo = await userResponse.json();
    console.log("User Info:", userInfo);

    // TODO: Save user info in the database and create a session.

    return NextResponse.redirect(new URL("/dashboard", req.url));
  } catch (error) {
    console.error("OAuth error:", error);
    return NextResponse.redirect(new URL("/login?error=oauth_failed", req.url));
  }
}
