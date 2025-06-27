"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CompassIcon, HomeIcon, PlusCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";

import { useAuth } from "./components/AuthProvider";

import PostFeed from "./components/PostFeed";
import PostFilters from "./components/post/Sorting";
import TwoColumnLayout from "./components/PageLayout";
import { SortOption, PostType } from "@/app/types/post";

export default function Home() {
  const router = useRouter();
  const { user, session } = useAuth();
  const [input, setInput] = useState<string>("");
  const [selectedTypes, setSelectedTypes] = useState<PostType[]>([]);
  const [sort, setSort] = useState<SortOption>("hot");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Remove the conflicting handleTypeClick function - we'll use the one in PostFilters

  const { mutate: createSubreddit, isLoading } = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post("/api/subreddit", { name: input });
      return data as string;
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not create subreddit",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `r/${data} created successfully`,
      });
      router.push(`/r/${data}`);
    },
  });

  // Function to handle single type selection (for sidebar quick filters)
  const handleQuickFilter = (type: PostType | null) => {
    if (type === null) {
      setSelectedTypes([]);
    } else {
      setSelectedTypes([type]);
    }
  };

  // Sidebar content
  const sidebarContent = (
    <>
      {/* Community Info */}
      <div className="overflow-hidden h-fit rounded-lg border bg-card">
        <div className=" px-4 py-3">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <HomeIcon className="w-4 h-4" />{" "}
            {session?.user ? "Your Feed" : "Popular Posts"}
          </p>
        </div>
        <div className="p-4 text-sm leading-6 space-y-4">
          <p className="text-foreground">
            {session?.user
              ? "Posts from your subscribed communities"
              : "Popular posts from all communities"}
          </p>
          <Button asChild className="w-full">
            <Link href="/r/create" className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Create Community
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <h3 className="font-medium">Quick Filters</h3>
        <div className="space-y-2">
          <Button
            variant={selectedTypes.length === 0 ? "default" : "secondary"}
            size="sm"
            className="w-full justify-start"
            onClick={() => handleQuickFilter(null)}
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
              onClick={() => handleQuickFilter(type)}
            >
              {type.toLowerCase()} only
            </Button>
          ))}
        </div>
      </div>
      <Button
        asChild
        variant="ghost"
        className="w-full bg-card rounded-lg border justify-start"
      >
        <Link href="/r/subreddits" className="flex items-center gap-2">
          <CompassIcon className="w-4 h-4" />
          Discover Communities
        </Link>
      </Button>
    </>
  );

  // Main content
  const mainContent = (
    <>
      {" "}
      <div className=" px-1 justify-center items-center bg-card text-xl rounded-xl py-2 mb-1">
        <p className="font-semibold text-foreground flex items-center gap-1.5">
          <HomeIcon className="w-6 h-6" />
          {session?.user ? "Your Feed" : "Popular Posts"}
        </p>
      </div>
      {/* Post Filters */}
      <PostFilters
        selectedTypes={selectedTypes}
        onTypesChange={setSelectedTypes}
        sort={sort}
        onSortChange={setSort}
      />
      <PostFeed
        queryKey="some-query-key"
        sort={sort}
        selectedTypes={selectedTypes}
        filterMode="all"
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
