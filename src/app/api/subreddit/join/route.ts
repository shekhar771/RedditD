// app/api/subreddit/route.ts
import { NextResponse, NextRequest } from "next/server";
import { withAuth } from "@/lib/server-auth";
import { subredditsubscriber } from "@/lib/validator/subreddit";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json();

    const { subredditId } = subredditsubscriber.parse(body);
    console.log("Received payload:", body); // Log the payload

    const existSubredditsubscription = await prisma.subscription.findFirst({
      where: {
        subredditId: subredditId,
        UserId: user.id,
      },
    });
    if (existSubredditsubscription) {
      return NextResponse.json(
        { error: "subscription already exists" },
        { status: 400 }
      );
    }
    const newSubbredditsubscription = await prisma.subscription.create({
      data: {
        UserId: user.id,
        subredditId: subredditId,
      },
    });

    // await prisma.subscription.create({
    //   data: {
    //     UserId: user.id,
    //     subredditId: newSubbreddit.id,
    //   },
    // });
    return new NextResponse(subredditId);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors); // Log validation errors

      return NextResponse.json("invalid request data", { status: 422 });
    }
    console.error("failed to  subscribe error:", error);
    return NextResponse.json(
      { error: "Failed to  subscribe, Kindly try again" },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json();
    const { subredditId } = subredditsubscriber.parse(body);
    console.log("Received payload:", body); // Log the payload

    const existSubredditsubscription = await prisma.subscription.findFirst({
      where: {
        subredditId: subredditId,
        UserId: user.id,
      },
    });
    if (!existSubredditsubscription) {
      return NextResponse.json(
        { message: "you are not subscribed to the given subreddit" },
        { status: 400 }
      );
    }
    const admin = await prisma.subreddit.findFirst({
      where: {
        id: subredditId,
        creatorId: user.id,
      },
    });
    if (admin) {
      return NextResponse.json(
        {
          message: "you cannot unsubscribe if you are the creator",
        },
        { status: 400 }
      );
    }
    if (existSubredditsubscription) {
      const deletesubscription = await prisma.subscription.delete({
        where: {
          UserId_subredditId: {
            subredditId,
            UserId: user.id,
          },
        },
      });
      return NextResponse.json(
        { message: "unsubscribe successfully" },
        { status: 200 }
      );
    }

    return new NextResponse(subredditId);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors); // Log validation errors

      return NextResponse.json("invalid request data", { status: 422 });
    }
    console.error("failed to  subscribe error:", error);
    return NextResponse.json(
      { error: "Failed to  subscribe, Kindly try again" },
      { status: 500 }
    );
  }
});
