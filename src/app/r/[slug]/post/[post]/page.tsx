// r/[slug]/post/[post]/page.tsx
"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import CommentSection from "@/app/components/Comment";
import PostCard, { PostWithRelations } from "@/app/components/Post";
import PageLayoutWrapper from "@/app/components/Layoutwrapper";
import { useAuth } from "@/app/components/AuthProvider";
import { CommentWithRelations } from "@/lib/validator/comment";
import { prisma } from "@/lib/db";

const SinglePostPage = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { session } = useAuth();

  const subName = params.slug as string;
  const postId = params.post as string;

  const {
    data: post,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      if (!postId) {
        throw new Error("Post ID is required");
      }

      const { data } = await axios.get<PostWithRelations>(
        `/api/posts/${postId}`
      );
      return data;
    },
    enabled: !!postId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const { data: subscriberCount } = useQuery({
    queryKey: ["subscriber-count", post?.subredditId],
    queryFn: async () => {
      if (!post?.subredditId) return 0;
      const { data } = await axios.get(
        `/api/subreddit/${post.subredditId}/subscribers`
      );
      return data.count || 0;
    },
    enabled: !!post?.subredditId,
  });

  const handleRetry = () => {
    refetch();
  };
  type PostWithCommentsAndRelations = PostWithRelations & {
    comment: CommentWithRelations[];
  };

  const PostSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-4">
      <div className="flex">
        <div className="hidden md:block p-2 bg-gray-50 dark:bg-gray-900 rounded-l-lg w-14">
          <div className="flex flex-col items-center space-y-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-4 w-6 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-24 w-full mb-4" />
          <div className="md:hidden flex items-center gap-4 pt-2 border-t">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>
    </div>
  );

  // Error cases
  if (!postId) {
    return (
      <PageLayoutWrapper>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h3 className="font-medium">Invalid URL</h3>
          <p className="mt-1">Post ID is missing from the URL.</p>
        </div>
      </PageLayoutWrapper>
    );
  }

  if (isLoading) {
    return (
      <PageLayoutWrapper>
        <PostSkeleton />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      </PageLayoutWrapper>
    );
  }

  if (error) {
    console.error("Error loading post:", error);
    return (
      <PageLayoutWrapper>
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
          <h3 className="font-medium text-lg mb-2">Error loading post</h3>
          <p className="mb-4">
            {axios.isAxiosError(error)
              ? `${error.response?.status}: ${
                  error.response?.data?.message || error.message
                }`
              : "Something went wrong while loading the post."}
          </p>
          <div className="flex gap-3">
            <Button onClick={handleRetry} variant="outline" size="sm">
              Try Again
            </Button>
            <Button onClick={() => router.back()} variant="ghost" size="sm">
              Go Back
            </Button>
          </div>
        </div>
      </PageLayoutWrapper>
    );
  }

  if (!post) {
    return (
      <PageLayoutWrapper>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <h3 className="text-lg font-medium mb-2">Post not found</h3>
          <p className="text-gray-500 mb-4">
            The post you're looking for doesn't exist or may have been removed.
          </p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </PageLayoutWrapper>
    );
  }

  const breadcrumbItems = [
    {
      label: `r/${subName}`,
      href: `/r/${subName}`,
    },
    {
      label: post.title,
    },
  ];

  return (
    <PageLayoutWrapper
      subreddit={post.subreddit}
      subscriberCount={subscriberCount || 0}
      showBreadcrumb={true}
      breadcrumbItems={breadcrumbItems}
    >
      {/* Post content using the shared PostCard component */}
      <PostCard
        post={post}
        session={session}
        variant="detail"
        showActions={true}
      />

      {/* Comment section */}
      <div className=" dark:bg-black rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-4">
          Comments ({post.comment?.length || 0})
        </h2>
        <CommentSection
          postId={postId}
          session={session}
          initialComments={post.comment || []}
        />
      </div>
    </PageLayoutWrapper>
  );
};

export default SinglePostPage;
