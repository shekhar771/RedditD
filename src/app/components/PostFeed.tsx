import React, { useRef, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import PostCard from "@/app/components/Post";
import { useAuth } from "./AuthProvider";
import { Loader2 } from "lucide-react";

export type SortOption = "new" | "top" | "controversial" | "hot";
export type PostType = "TEXT" | "IMAGE" | "LINK";

interface PostFeedProps {
  queryKey: string;
  sort: SortOption;
  selectedTypes: PostType[];
  filterMode: "subscribed" | "all";
  subreddit?: string;
}

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

      if (selectedTypes.length > 0) {
        selectedTypes.forEach((type) => {
          params.append("types", type);
        });
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
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Loading posts...</p>
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
      <div className="text-center  py-8">
        <p className="text-muted-foreground">No posts found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your filters or check back later
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.pages.map((page, pageIndex) => (
        <React.Fragment key={pageIndex}>
          {page.posts.map((post: any) => (
            <PostCard session={session} key={post.id} post={post} />
          ))}
        </React.Fragment>
      ))}

      <div ref={loadMoreRef} className="h-1" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
