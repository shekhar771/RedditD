// SearchClient.tsx (updated)
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tab";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

interface SearchResult {
  users: User[];
  subreddits: Subreddit[];
  posts: Post[];
}

interface User {
  id: string;
  username: string;
  name?: string;
  image?: string;
}

interface Subreddit {
  id: string;
  name: string;
  description?: string;
}

interface Post {
  id: string;
  title: string;
  subreddit: Subreddit;
  author: User;
  createdAt: string;
}

interface SearchClientProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function SearchClient({ searchParams }: SearchClientProps) {
  const [activeTab, setActiveTab] = useState("posts");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const queryValue = searchParams.q;
  const searchQuery =
    typeof queryValue === "string" ? queryValue : queryValue?.[0] || "";

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Search failed:", error);
        setResults({ users: [], subreddits: [], posts: [] });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [searchQuery]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">No results found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search results for "{searchQuery}"
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="posts">
                Posts ({results.posts.length})
              </TabsTrigger>
              <TabsTrigger value="communities">
                Communities ({results.subreddits.length})
              </TabsTrigger>
              <TabsTrigger value="users">
                Users ({results.users.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-6">
              {results.posts.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No posts found
                </p>
              ) : (
                <div className="space-y-4">
                  {results.posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/r/${post.subreddit.name}/post/${post.id}`}
                      className="block hover:bg-accent p-4 rounded-lg transition-colors"
                    >
                      <h3 className="font-medium">{post.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <span>r/{post.subreddit.name}</span>
                        <span className="mx-1">•</span>
                        <span>u/{post.author.username}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="communities" className="mt-6">
              {results.subreddits.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No communities found
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.subreddits.map((subreddit) => (
                    <Link
                      key={subreddit.id}
                      href={`/r/${subreddit.name}`}
                      className="flex items-center p-4 hover:bg-accent rounded-lg transition-colors"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500 text-white mr-4">
                        r/
                      </div>
                      <div>
                        <h3 className="font-medium">r/{subreddit.name}</h3>
                        {subreddit.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {subreddit.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="users" className="mt-6">
              {results.users.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No users found
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.users.map((user) => (
                    <Link
                      key={user.id}
                      href={`/user/${user.username}`}
                      className="flex items-center p-4 hover:bg-accent rounded-lg transition-colors"
                    >
                      <Avatar className="h-10 w-10 mr-4">
                        <AvatarImage src={user.image} />
                        <AvatarFallback>
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{user.username}</h3>
                        {user.name && (
                          <p className="text-sm text-muted-foreground">
                            {user.name}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
