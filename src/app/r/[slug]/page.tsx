import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getServerSession } from "@/lib/server-auth";
import SubredditPageContent from "./Post";

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = params;
  const { user } = await getServerSession();

  const subreddit = await prisma.subreddit.findFirst({
    where: { name: slug },
    include: {
      Creator: true,
    },
  });

  if (!subreddit) return notFound();

  const subscriberCount = await prisma.subscription.count({
    where: { subredditId: subreddit.id },
  });

  let isSubscribed = false;
  if (user) {
    const subscription = await prisma.subscription.findUnique({
      where: {
        UserId_subredditId: {
          UserId: user.id,
          subredditId: subreddit.id,
        },
      },
    });
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
}
