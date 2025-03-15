// app/api/subreddit/route.ts
import { NextResponse, NextRequest } from "next/server";
import { withAuth } from "@/lib/server-auth";

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const { name } = await req.json();
    return NextResponse.json({ message: "Subreddit created successfully" });
  } catch (error) {
    console.error("failed to create subreddit error:", error);
    return NextResponse.json(
      { error: "Failed to create subbreddit" },
      { status: 500 }
    );
  }
});
