"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Info, Shield } from "lucide-react";
import { formatDistance } from "date-fns";

const SubredditSidebar = ({ subreddit, subscriberCount }) => {
  // Format date for display
  const formattedDate = subreddit.createdAt
    ? formatDistance(new Date(subreddit.createdAt), new Date(), {
        addSuffix: true,
      })
    : "Unknown";

  return (
    <div className="w-full">
      <Card className="w-full mb-4">
        <CardHeader>
          <CardTitle>About r/{subreddit.name}</CardTitle>
          <CardDescription>Community details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subreddit.description && (
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-gray-500 mt-0.5" />
              <p className="text-sm">{subreddit.description}</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium">{subscriberCount || 0} members</p>
              <p className="text-xs text-gray-500">Created {formattedDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <p className="text-sm">Created {formattedDate}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" variant="outline">
            Create Post
          </Button>
        </CardFooter>
      </Card>

      {subreddit.Creator && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Moderation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Created by</p>
                <p className="text-sm text-blue-500 hover:underline cursor-pointer">
                  u/
                  {subreddit.Creator.username ||
                    subreddit.Creator.name ||
                    "unknown"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubredditSidebar;
