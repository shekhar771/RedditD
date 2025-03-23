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
import { CalendarIcon, Users, Info, Flag, Calendar } from "lucide-react";
import { formatDistance } from "date-fns";

const SubredditSidebar = ({ subreddit }) => {
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
              <p className="font-medium">{subreddit.members || 0} members</p>
              <p className="text-xs text-gray-500">
                {subreddit.activeMembers || 0} online now
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <p className="text-sm">Created {formattedDate}</p>
          </div>

          {subreddit.rules && subreddit.rules.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Community Rules</h3>
              <ul className="text-sm space-y-2">
                {subreddit.rules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="font-medium">{index + 1}.</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" variant="outline">
            Create Post
          </Button>
        </CardFooter>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Moderators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            {subreddit.moderators ? (
              <ul className="space-y-1">
                {subreddit.moderators.map((mod, index) => (
                  <li
                    key={index}
                    className="text-blue-500 hover:underline cursor-pointer"
                  >
                    u/{mod}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No moderators available</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" variant="ghost" size="sm">
            View All Moderators
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SubredditSidebar;
