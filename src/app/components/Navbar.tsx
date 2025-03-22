"use client";

import Link from "next/link";
import React from "react";
import reddie from "../../../public/reddie-logo.svg";
import reddie1 from "../../../public/reddie1.svg";

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
import { Icons } from "@/components/ui/icons";
import { Search } from "lucide-react";
const Navbar = () => {
  const { user, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Determine the initials for avatar fallback
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
    <nav className="flex h-[8vh] w-full items-center border-b  shadow-md pl-0 pr-5 justify-between mx-2 sm:justify-between sm:h-[10vh] px-14 mb-0.5  transition-all duration-300 hover:shadow-lg">
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
      <div className="flex  justify-center flex-1 relative w-full">
        <Input
          placeholder="Search Reddit"
          className="h-11 rounded-2xl px-4 sm: ml-4 max-w-[600px] "
        />
        <Search className="relative top-2 right-10" />
      </div>
      <div className="flex items-center gap-x-4">
        <ModeToggle />

        {isLoading ? (
          // Show a loading state if auth state is still loading
          <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
        ) : user ? (
          // User is logged in - show profile dropdown
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 outline-none border">
                <Avatar>
                  <AvatarImage
                    src={user.image || undefined}
                    alt={user.username || "User profile picture"}
                    referrerPolicy="no-referrer"
                  />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex item-center justify-center flex-col gap-1 p-2">
                <div className="font-medium">
                  {user.name && <p>{user.name}</p>}
                </div>
                <div className="w-[200px] text-zinc-700 text-sm">
                  {user.email && <p>{user.email}</p>}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/r/create">Create a subreddit</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // User is not logged in - show login/signup buttons
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
