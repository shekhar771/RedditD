"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PostFeed from "@/app/components/PostFeed";
import PostFilters from "@/app/components/post/Sorting";
import TwoColumnLayout from "@/app/components/PageLayout";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/app/components/AuthProvider";
import { SubscribeLeaveToggle } from "./test";

export type SortOption = "new" | "top" | "controversial" | "hot";
export type PostType = "TEXT" | "IMAGE" | "LINK";

interface SubredditPageContentProps {
  subreddit: {
    id: string;
    name: string;
    createdAt: Date;
    description: string | null;
    image: string | null;
    backgroundImage: string | null;
    Creator: {
      username: string | null;
    } | null;
  };
  subscriberCount: number;
  isSubscribed: boolean;
  slug: string;
}

export default function SubredditPageContent({
  subreddit,
  subscriberCount,
  isSubscribed,
  slug,
}: SubredditPageContentProps) {
  const router = useRouter();
  const { user, session } = useAuth();
  const [input, setInput] = useState<string>("");
  const [selectedTypes, setSelectedTypes] = useState<PostType[]>([]);
  const [sort, setSort] = useState<SortOption>("hot");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { mutate: createPost, isLoading } = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(`/api/posts`, {
        title: input,
        type: "TEXT",
      });
      return data;
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not create post",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Post created successfully",
      });
      router.push(`/r/${slug}/post/${data.id}`);
    },
  });

  // Sidebar content
  const sidebarContent = (
    <>
      {/* Community Info */}
      <div className="overflow-hidden h-fit rounded-lg border bg-card">
        <div className="bg-secondary px-4 py-3">
          <p className="font-semibold text-foreground">
            About r/{subreddit.name}
          </p>
        </div>
        <div className="p-4 text-sm leading-6 space-y-4">
          <p className="text-foreground">
            {subreddit.description || "No description provided"}
          </p>

          <div className="flex items-center gap-x-2">
            <div
              className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center
            "
            >
              <span className="text-xs">r/</span>
            </div>
            <p className="text-sm text-foreground">
              Created by u/{subreddit.Creator?.username || "unknown"}
            </p>
          </div>

          <div className="pt-2 border-t">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{subscriberCount}</p>
                <p className="text-muted-foreground text-xs">Members</p>
              </div>
            </div>
          </div>

          <SubscribeLeaveToggle
            subredditId={subreddit.id}
            subredditName={subreddit.name}
            isSubscribed={isSubscribed}
          />
        </div>
      </div>

      {/*  Filters */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <h3 className="font-medium">Quick Filters</h3>
        <div className="space-y-2">
          <Button
            variant={selectedTypes.length === 0 ? "default" : "secondary"}
            size="sm"
            className="w-full justify-start"
            onClick={() => setSelectedTypes([])}
          >
            All posts
          </Button>
          {(["TEXT", "IMAGE", "LINK"] as PostType[]).map((type) => (
            <Button
              key={type}
              variant={
                selectedTypes.includes(type) && selectedTypes.length === 1
                  ? "default"
                  : "secondary"
              }
              size="sm"
              className="w-full justify-start"
              onClick={() => setSelectedTypes([type])}
            >
              {type.toLowerCase()} only
            </Button>
          ))}
        </div>
      </div>
    </>
  );

  // Main content
  const mainContent = (
    <>
      {/* Header section */}
      <div className="relative h-16 md:h-20 mb-12 md:mb-16">
        {subreddit.backgroundImage ? (
          <Image
            className="w-full object-cover md:rounded-2xl"
            src={subreddit.backgroundImage}
            alt={subreddit.name}
            fill
            priority
          />
        ) : (
          <div className="w-full h-full bg-gray-800 md:rounded-2xl" />
        )}

        <div className="absolute -bottom-8 md:-bottom-12 left-4 flex items-center">
          <Avatar className="h-16 w-16 md:h-20 md:w-20 border-4 border-background shadow-lg">
            {subreddit.image ? (
              <AvatarImage src={subreddit.image} alt={subreddit.name} />
            ) : (
              <AvatarFallback className="text-3xl bg-orange-500">
                {subreddit.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <h1 className="ml-4 text-2xl md:text-3xl font-bold mt-7">
            r/{subreddit.name}
          </h1>
        </div>
      </div>

      {/* Post Filters */}
      <PostFilters
        selectedTypes={selectedTypes}
        onTypesChange={setSelectedTypes}
        sort={sort}
        onSortChange={setSort}
      />

      {/* Post Feed */}
      <PostFeed
        queryKey={`subreddit-posts-${subreddit.id}`}
        sort={sort}
        selectedTypes={selectedTypes}
        subreddit={subreddit.name}
        filterMode={"subscribed"}
      />
    </>
  );

  return (
    <TwoColumnLayout
      mainContent={mainContent}
      sidebarContent={sidebarContent}
    />
  );
}
