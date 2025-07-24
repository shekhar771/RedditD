import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getServerSession } from "@/lib/server-auth";
import SubredditPageContent from "./Post";
import type { Subreddit, User, Subscription } from "@prisma/client";

interface PageProps {
  params: {
    slug: string;
  };
}

interface SubredditWithCreator extends Subreddit {
  Creator: User;
}

export default async function Page({ params }: PageProps) {
  const { slug } = params;

  try {
    const session = await getServerSession();
    const { user } = session || {};

    // Fetch subreddit and subscriber count in parallel
    const [subreddit, subscriberCount] = await Promise.all([
      prisma.subreddit.findFirst({
        where: { name: slug },
        include: {
          Creator: true,
        },
      }) as Promise<SubredditWithCreator | null>,

      prisma.subscription.count({
        where: { subreddit: { name: slug } },
      }),
    ]);

    if (!subreddit) return notFound();

    // Check subscription status if user is logged in
    let isSubscribed = false;
    if (user) {
      const subscription = (await prisma.subscription.findUnique({
        where: {
          UserId_subredditId: {
            UserId: user.id,
            subredditId: subreddit.id,
          },
        },
      })) as Subscription | null;
      isSubscribed = !!subscription;
    }

    return (
      <SubredditPageContent
        subreddit={subreddit}
        subscriberCount={subscriberCount}
        isSubscribed={isSubscribed}
        slug={slug}
      />
    );
  } catch (error) {
    console.error("Error loading subreddit page:", error);
    return notFound();
  }
}
