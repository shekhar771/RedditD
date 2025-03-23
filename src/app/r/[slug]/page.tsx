import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import React, { FC } from "react";
import { Plus } from "lucide-react";
import Image from "next/image";
import Formsubmit from "./test";
import { getServerSession } from "@/lib/server-auth";
import SubredditSidebar from "./sidebar";

interface PageProps {
  params: {
    slug: string;
    imageUrl?: string;
  };
}

const page: FC<PageProps> = async ({ params }: PageProps) => {
  const { slug } = await params;
  const { user, session } = await getServerSession();

  const subreddit = await prisma.subreddit.findFirst({
    where: {
      name: slug,
    },
    include: {
      post: {
        include: {
          author: true,
          subreddit: true,
          comment: true,
          Vote: true,
        },
        take: 2,
      },
    },
  });

  if (!subreddit) {
    return notFound();
  }

  return (
    <div className="w-full md:w-10/12 mx-auto relative">
      {/* Header section */}
      <div aria-label="background image" className="relative h-16 md:h-20">
        {subreddit.backgroundImage ? (
          <Image
            className="md:rounded-2xl w-full"
            src={subreddit.backgroundImage}
            alt={subreddit.name}
          />
        ) : (
          <div className="w-full h-16 bg-gray-800 md:rounded-2xl md:h-20" />
        )}
      </div>

      <div className="top-[0.5rem] relative md:absolute md:top-[2.5rem] left-5">
        <Avatar className="h-16 w-16 md:h-20 md:w-20 border-4 border-white shadow-lg">
          {subreddit.image ? (
            <AvatarImage src={subreddit.image} alt={subreddit.name} />
          ) : (
            <AvatarFallback className="text-3xl md:text-5xl bg-orange-500">
              {subreddit.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
      </div>

      <div className="ml-24 -mt-12 flex flex-col md:flex-row md:mt-1 md:justify-between md:items-center">
        <div className="ml-7">
          <h1 className="text-4xl md:text-4xl font-bold">r/{slug}</h1>
          <div className="md:hidden">{subreddit.members || 10000} members</div>
        </div>

        <Formsubmit />
      </div>

      {/* Main content with sidebar layout */}
      <div className="mt-6 flex flex-col md:flex-row gap-6">
        {/* Main content area */}
        <div className="w-full md:w-2/3">
          {/* This is where you would map through and display your posts */}
          <div className="space-y-4">
            {subreddit.post && subreddit.post.length > 0 ? (
              subreddit.post.map((post) => (
                <div
                  key={post.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
                >
                  <h2 className="text-xl font-semibold">{post.title}</h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    {/* {post.content} */}
                    check
                  </p>
                  {/* Add more post details as needed */}
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                <h3 className="text-lg font-medium">No posts yet</h3>
                <p className="mt-2 text-gray-500">
                  Be the first to post in r/{slug}
                </p>
                <Button className="mt-4">Create Post</Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-1/3 mt-4 md:mt-0">
          <SubredditSidebar subreddit={subreddit} />
        </div>
      </div>
    </div>
  );
};

export default page;
