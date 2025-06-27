import React, { useRef, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import PostCard from "@/app/components/Post";
import { useAuth } from "./AuthProvider";
import { Loader2 } from "lucide-react";

import { SortOption, PostType } from "@/app/types/post";

interface PostFeedProps {
  queryKey: string;
  sort: SortOption;
  selectedTypes: PostType[];
  filterMode: "subscribed" | "all";
  subreddit?: string;
}

const PostSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-md shadow p-4 mb-4 animate-pulse">
    <div className="flex items-start space-x-3">
      <div className="flex flex-col items-center">
        <div className="h-6 w-6 bg-black dark:bg-gray-700 rounded-full"></div>
        <div className="h-16 w-0.5 bg-black dark:bg-gray-700 mt-1"></div>
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-20 bg-black dark:bg-gray-700 rounded"></div>
          <div className="h-3 w-16 bg-black dark:bg-gray-700 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-5 w-3/4 bg-black dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-full bg-black dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-2/3 bg-black dark:bg-gray-700 rounded"></div>
        </div>
        <div className="flex space-x-4 pt-2">
          <div className="h-4 w-16 bg-black dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-16 bg-black dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-16 bg-black dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

export default function PostFeed({
  queryKey,
  sort,
  selectedTypes,
  filterMode,
  subreddit,
}: PostFeedProps) {
  const { session } = useAuth();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
    queryKey: [queryKey, sort, selectedTypes, filterMode, subreddit],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: pageParam.toString(),
        pageSize: "5",
        sort,
        filterMode,
      });

      // ✅ Fix: Join types with commas instead of creating multiple params
      if (selectedTypes.length > 0) {
        params.append("types", selectedTypes.join(","));
      }

      if (subreddit) {
        params.append("subreddit", subreddit);
      }

      const endpoint = subreddit ? `/api/posts` : "/api/posts/feed";
      const { data } = await axios.get(`${endpoint}?${params.toString()}`);
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length + 1 : undefined;
    },
  });

  // Infinite scroll effect
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === "loading") {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center py-8 text-destructive">
        <p>Error loading posts</p>
        <p className="text-sm text-muted-foreground mt-1">
          {error instanceof Error ? error.message : "Unknown error occurred"}
        </p>
      </div>
    );
  }

  if (!data?.pages[0]?.posts?.length) {
    return (
      <div className="text-center py-8 ">
        <p className="text-muted-foreground">No posts found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your filters or check back later
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-1">
      {data.pages.map((page, pageIndex) => (
        <React.Fragment key={pageIndex}>
          {page.posts.map((post: any) => (
            <PostCard session={session} key={post.id} post={post} />
          ))}
        </React.Fragment>
      ))}

      <div ref={loadMoreRef} className="h-1" />

      {isFetchingNextPage && (
        <>
          <PostSkeleton />
          <PostSkeleton />
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </>
      )}
    </div>
  );
}
