"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { debounce } from "lodash";
import Image from "next/image";
import { ModeToggle } from "./ThemeButton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/components/AuthProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import reddie1 from "../../../public/reddie1.svg";

const Navbar = () => {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    users: any[];
    subreddits: any[];
    posts: any[];
  } | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const performSearch = debounce(async (query: string) => {
    if (query.length < 2) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      setSearchResults({
        users: data.users || [],
        subreddits: data.subreddits || [],
        posts: data.posts || [],
      });
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults({ users: [], subreddits: [], posts: [] });
    } finally {
      setIsSearching(false);
    }
  }, 300);

  useEffect(() => {
    performSearch(searchQuery);
    return () => performSearch.cancel();
  }, [searchQuery]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getInitials = () => {
    if (!user) return "?";

    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }

    if (user.username) {
      return user.username.substring(0, 1).toUpperCase();
    }

    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }

    return "?";
  };

  return (
    <nav className="flex h-[8vh] w-full items-center border-b shadow-md pl-0 pr-5 justify-between mx-2 sm:justify-between sm:h-[9vh] px-14 mb-0.5 transition-all duration-300 hover:shadow-lg">
      <Link href="/" className="flex items-center">
        <Image
          src={reddie1}
          alt="reddit logo"
          className="h-14 w-full min-w-fit"
        />
        <span className="hidden sm:block text-xl font-semibold ml-2">
          Reddit
        </span>
      </Link>

      <div className="flex justify-center flex-1 relative" ref={searchRef}>
        <form
          onSubmit={handleSearchSubmit}
          className="relative w-full max-w-[600px]"
        >
          <div className="relative">
            <Input
              placeholder="Search Reddit"
              className="h-11 rounded-2xl px-4 sm:ml-4 w-full"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>

          {/* Search results dropdown */}
          {isSearchOpen && searchQuery && (
            <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 max-h-[60vh] overflow-y-auto border dark:border-gray-700">
              {isSearching ? (
                <div className="p-4 text-center text-gray-500">
                  Searching...
                </div>
              ) : searchResults ? (
                <>
                  {/* Users results */}
                  {searchResults.users.length > 0 && (
                    <div className="p-2 border-b dark:border-gray-700">
                      <h3 className="font-semibold px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                        Users
                      </h3>
                      {searchResults.users.map((user) => (
                        <Link
                          key={user.id}
                          href={`/user/${user.username}`}
                          className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          onClick={() => setIsSearchOpen(false)}
                        >
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={user.image} />
                            <AvatarFallback>
                              {user.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.username}</p>
                            {user.name && (
                              <p className="text-sm text-gray-500">
                                {user.name}
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Subreddits results */}
                  {searchResults.subreddits.length > 0 && (
                    <div className="p-2 border-b dark:border-gray-700">
                      <h3 className="font-semibold px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                        Communities
                      </h3>
                      {searchResults.subreddits.map((subreddit) => (
                        <Link
                          key={subreddit.id}
                          href={`/r/${subreddit.name}`}
                          className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          onClick={() => setIsSearchOpen(false)}
                        >
                          <div className="h-8 w-8 mr-2 rounded-full bg-red-500 flex items-center justify-center text-white">
                            r/
                          </div>
                          <div>
                            <p className="font-medium">r/{subreddit.name}</p>
                            {subreddit.description && (
                              <p className="text-sm text-gray-500 truncate">
                                {subreddit.description}
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Posts results */}
                  {searchResults.posts.length > 0 && (
                    <div className="p-2">
                      <h3 className="font-semibold px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
                        Posts
                      </h3>
                      {searchResults.posts.map((post) => (
                        <Link
                          key={post.id}
                          href={`/r/${post.subreddit.name}/post/${post.id}`}
                          className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          onClick={() => setIsSearchOpen(false)}
                        >
                          <p className="font-medium">{post.title}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <span>r/{post.subreddit.name}</span>
                            <span className="mx-1">•</span>
                            <span>u/{post.author.username}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {searchResults.users.length === 0 &&
                    searchResults.subreddits.length === 0 &&
                    searchResults.posts.length === 0 && (
                      <div className="p-4 text-center text-gray-500">
                        No results found
                      </div>
                    )}

                  <div className="p-2 border-t dark:border-gray-700">
                    <Link
                      href={`/search?q=${encodeURIComponent(searchQuery)}`}
                      className="block text-center p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                      onClick={() => setIsSearchOpen(false)}
                    >
                      View all results for "{searchQuery}"
                    </Link>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </form>
      </div>

      <div className="flex items-center gap-x-4">
        <ModeToggle />

        {isLoading ? (
          <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 outline-none">
                <Avatar>
                  <AvatarImage
                    src={user.image}
                    alt={user.username || "User profile picture"}
                    referrerPolicy="no-referrer"
                  />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex item-center justify-center flex-col gap-1 p-2">
                <div className="font-medium">
                  {user.name && <p>{user.name}</p>}
                </div>
                <div className="w-full text-zinc-700 dark:text-zinc-300 text-sm">
                  {user.email && <p>{user.email}</p>}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/user/${user.username}`}>Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/r/create">Create a subreddit</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Button variant="secondary" asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
