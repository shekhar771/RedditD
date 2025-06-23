"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import axios, { AxiosError } from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { subredditsubscribberPayload } from "@/lib/validator/subreddit";

interface SubscribeLeaveToggleProps {
  isSubscribed: boolean;
  subredditId: string;
  subredditName: string;
}

export function SubscribeLeaveToggle({
  isSubscribed,
  subredditName,
  subredditId,
}: SubscribeLeaveToggleProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { mutate: unsubscribe } = useMutation({
    mutationFn: async () => {
      const payload: subredditsubscribberPayload = {
        subredditId: subredditId,
      };

      const { data } = await axios.delete("/api/subreddit/join", {
        data: payload,
      });

      return data as string;
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.status === 401) {
        toast({
          variant: "destructive",
          title: "You are not logged in",
        });
      } else if (
        error instanceof AxiosError &&
        error.response?.status === 400
      ) {
        toast({
          variant: "destructive",
          title: "Admin cannot unsubscribe from their own subreddit",
        });
      } else {
        toast({
          title: "There was a problem",
          variant: "destructive",
          description: "Something went wrong. Please try again.",
        });
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `You have successfully unsubscribed from r/${subredditName}`,
      });
      router.refresh();
    },
  });

  const { mutate: subscribe, isLoading } = useMutation({
    mutationFn: async () => {
      const payload: subredditsubscribberPayload = {
        subredditId: subredditId,
      };

      const { data } = await axios.post("/api/subreddit/join", payload);
      return data as string;
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.status === 401) {
        toast({
          variant: "destructive",
          title: "You are not logged in",
        });
      } else {
        toast({
          title: "There was a problem",
          variant: "destructive",
          description: "Something went wrong. Please try again.",
        });
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `You have joined r/${subredditName}`,
      });
      router.refresh();
    },
  });

  return (
    <div className="w-full">
      {isSubscribed ? (
        <Button
          onClick={() => unsubscribe()}
          variant="outline"
          className="w-full"
        >
          Leave Community
        </Button>
      ) : (
        <Button
          onClick={() => subscribe()}
          isLoading={isLoading}
          className="w-full"
        >
          Join Community
        </Button>
      )}

      <Button
        onClick={() => router.push(`${pathname}/submit`)}
        className="w-full mt-2 flex items-center gap-1.5"
      >
        <Plus className="h-4 w-4" />
        <span>Create Post</span>
      </Button>
    </div>
  );
}
