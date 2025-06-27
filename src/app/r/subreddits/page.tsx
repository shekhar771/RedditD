"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/app/components/AuthProvider";
import { PlusCircle } from "lucide-react";

interface Subreddit {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  backgroundImage: string | null;
  subscribers: number;
  isSubscribed: boolean;
}

export default function SubredditsPage() {
  const { session } = useAuth();

  const { data: subreddits, isLoading } = useQuery({
    queryKey: ["subreddits"],
    queryFn: async () => {
      const { data } = await axios.get("/api/subreddits");
      return data as Subreddit[];
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Browse Communities</h1>
        {session?.user && (
          <Button asChild>
            <Link href="/r/create" className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Create Community
            </Link>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-lg border bg-card animate-pulse"
            >
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                  <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {subreddits?.map((subreddit) => (
            <Link
              key={subreddit.id}
              href={`/r/${subreddit.name}`}
              className="block p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
            >
              <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10">
                  {subreddit.image ? (
                    <AvatarImage src={subreddit.image} alt={subreddit.name} />
                  ) : (
                    <AvatarFallback className="bg-primary text-white">
                      {subreddit.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h2 className="font-semibold">r/{subreddit.name}</h2>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {subreddit.description || "No description"}
                  </p>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <span>{subreddit.subscribers} members</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
