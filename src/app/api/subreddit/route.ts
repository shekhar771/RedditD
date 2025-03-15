// app/api/subreddit/route.ts
import { NextResponse, NextRequest } from "next/server";
import { withAuth } from "@/lib/server-auth";
import { subredditSchema } from "@/lib/validator/subreddit";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json();
    const { name, description } = subredditSchema.parse(body);
    console.log("Received payload:", body); // Log the payload

    const existSubreddit = await prisma.subreddit.findFirst({
      where: {
        name: name,
      },
    });
    if (existSubreddit) {
      return NextResponse.json(
        { error: "Subreddit already exists" },
        { status: 409 }
      );
    }
    const newSubbreddit = await prisma.subreddit.create({
      data: {
        name,
        creatorId: user.id,
        description: description,
      },
    });

    await prisma.subscription.create({
      data: {
        UserId: user.id,
        subredditId: newSubbreddit.id,
      },
    });
    return NextResponse.json({
      name: newSubbreddit.name,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors); // Log validation errors

      return NextResponse.json({ error: error.errors }, { status: 422 });
    }
    console.error("failed to create subreddit error:", error);
    return NextResponse.json(
      { error: "Failed to create subbreddit" },
      { status: 500 }
    );
  }
});
