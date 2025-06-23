"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tab";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import PostCard from "@/app/components/Post";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfileClientProps {
  user: {
    id: string;
    username: string;
    name: string | null;
    image: string | null;
    postCount: number;
    commentCount: number;
  };
  posts: any[];
  comments: any[];
  likedPosts: any[];
}

export default function UserProfileClient({
  user,
  posts,
  comments,
  likedPosts,
}: UserProfileClientProps) {
  const [activeTab, setActiveTab] = useState("posts");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ProfileHeader
        user={user}
        postCount={user.postCount}
        commentCount={user.commentCount}
      />

      <div className="w-full mt-8">
        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>
              View posts, comments, and liked content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="likes">Likes</TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="mt-6">
                {posts.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    No posts yet
                  </p>
                ) : (
                  <div className="space-y-4 mt-4">
                    {posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        commentCount={post.comment.length}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="comments" className="mt-6">
                {comments.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    No comments yet
                  </p>
                ) : (
                  <div className="space-y-4 mt-4">
                    {comments.map((comment) => {
                      const upvotes = comment.votes.filter(
                        (v: any) => v.type === "UPVOTE"
                      ).length;
                      const downvotes = comment.votes.filter(
                        (v: any) => v.type === "DOWNVOTE"
                      ).length;
                      const netVotes = upvotes - downvotes;

                      return (
                        <div
                          key={comment.id}
                          className="border rounded-lg px-4 py-3 shadow-sm bg-background"
                        >
                          <div className="flex items-center gap-2 text-sm mb-2">
                            {comment.author?.image && (
                              <img
                                src={comment.author.image}
                                alt={comment.author.username || "User"}
                                className="w-6 h-6 rounded-full"
                              />
                            )}
                            <span className="font-medium">
                              {user.username || "User"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(
                                new Date(comment.createdAt),
                                { addSuffix: true }
                              )}
                            </span>
                          </div>

                          <Link
                            href={`/r/${comment.post.subreddit.name}/post/${comment.post.id}`}
                            className="block hover:underline focus:outline-none"
                          >
                            <p className="text-sm font-semibold mb-1">
                              {comment.post.title}
                            </p>
                            <p className="text-sm text-foreground leading-relaxed">
                              {comment.content}
                            </p>
                          </Link>

                          <div className="flex items-center gap-2 mt-3">
                            <ArrowUp
                              className={cn(
                                "h-4 w-4",
                                netVotes > 0 && "text-orange-500"
                              )}
                            />
                            <span
                              className={cn(
                                "text-xs font-medium",
                                netVotes > 0 && "text-orange-500",
                                netVotes < 0 && "text-blue-500"
                              )}
                            >
                              {netVotes}
                            </span>
                            <ArrowDown
                              className={cn(
                                "h-4 w-4",
                                netVotes < 0 && "text-blue-500"
                              )}
                            />

                            <Link
                              href={`/r/${comment.post.subreddit.name}/post/${comment.post.id}`}
                              className="ml-auto text-xs text-muted-foreground hover:underline"
                            >
                              View Post
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="likes" className="mt-6">
                {likedPosts.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    No liked posts yet
                  </p>
                ) : (
                  <div className="space-y-4 mt-4">
                    {likedPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        commentCount={post.comment.length}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProfileHeader({
  user,
  postCount,
  commentCount,
}: {
  user: {
    username: string;
    name: string | null;
    image: string | null;
  };
  postCount: number;
  commentCount: number;
}) {
  return (
    <div className="flex items-center gap-6">
      <Avatar className="h-24 w-24">
        <AvatarImage src={user.image || ""} />
        <AvatarFallback>
          {user.name?.charAt(0) || user.username.charAt(0)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <h1 className="text-2xl font-bold">{user.name || user.username}</h1>
        <p className="text-muted-foreground">u/{user.username}</p>

        <div className="flex gap-4 mt-2">
          <div>
            <span className="font-semibold">{postCount}</span>
            <span className="text-muted-foreground ml-1">Posts</span>
          </div>
          <div>
            <span className="font-semibold">{commentCount}</span>
            <span className="text-muted-foreground ml-1">Comments</span>
          </div>
        </div>
      </div>
    </div>
  );
}
