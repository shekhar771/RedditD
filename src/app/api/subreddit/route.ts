// app/api/auth/session/route.ts
import { NextResponse } from "next/server";
import { getSessionToken } from "../auth/asa";

export async function POST(req: Request) {
  try {
    const session = getSessionToken;
    const { name } = await req.json();
  } catch (error) {
    console.error("failed to create subreddit error:", error);
    return NextResponse.json(
      { error: "Failed to create subbreddit" },
      { status: 500 }
    );
  }
}
