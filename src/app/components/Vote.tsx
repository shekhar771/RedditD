"use client";

import React, { useState, useEffect } from "react";
import { Post, User, Subreddit, Comment, Vote } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

type PostWithRelations = Post & {
  author: User;
  subreddit: Subreddit;
  comment: Comment[];
  Vote: Vote[];
};

interface VoteComponentProps {
  post: PostWithRelations;
  sessionUserId?: string; // Change from session to just the userId
}

const VoteComponent: React.FC<VoteComponentProps> = ({
  post,
  sessionUserId,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Calculate initial state from server data
  const calculateInitialState = () => {
    const initialVoteCount = post.Vote.reduce(
      (acc, vote) => acc + (vote.type === "UPVOTE" ? 1 : -1),
      0
    );

    const currentUserVote = post.Vote.find(
      (vote) => vote.userId === sessionUserId
    );

    return {
      voteCount: initialVoteCount,
      userVote: (currentUserVote?.type as "UPVOTE" | "DOWNVOTE" | null) || null,
    };
  };

  const [state, setState] = useState(calculateInitialState());
  const [isPending, setIsPending] = useState(false);

  // Update state when post or sessionUserId changes
  useEffect(() => {
    setState(calculateInitialState());
  }, [post, sessionUserId]);

  const voteMutation = useMutation({
    mutationFn: async ({
      postId,
      type,
    }: {
      postId: string;
      type: "UPVOTE" | "DOWNVOTE";
    }) => {
      return await axios.post("/api/posts/vote", { postId, type });
    },
    onMutate: async ({ type }) => {
      setIsPending(true);

      // Optimistic update
      const previousState = { ...state };

      setState((prev) => {
        let newCount = prev.voteCount;
        let newUserVote = prev.userVote;

        if (prev.userVote === type) {
          newUserVote = null;
          newCount += type === "UPVOTE" ? -1 : 1;
        } else if (prev.userVote) {
          newUserVote = type;
          newCount += type === "UPVOTE" ? 2 : -2;
        } else {
          newUserVote = type;
          newCount += type === "UPVOTE" ? 1 : -1;
        }

        return {
          voteCount: newCount,
          userVote: newUserVote,
        };
      });

      return { previousState };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousState) {
        setState(context.previousState);
      }
      toast({
        title: "Error",
        description: "Failed to register vote. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsPending(false);
      // Refetch the post data to ensure sync with server
      queryClient.invalidateQueries({
        queryKey: ["post", post.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["posts", post.subreddit.name],
      });
    },
  });

  const handleVote = (type: "UPVOTE" | "DOWNVOTE") => {
    if (isPending || !sessionUserId) return;
    voteMutation.mutate({ postId: post.id, type });
  };

  return (
    <div className="flex rounded-3xl items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "p-1 h-8 w-8  hover:text-orange-500",
          state.userVote === "UPVOTE" && "text-orange-500 ",
          isPending && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => handleVote("UPVOTE")}
        disabled={isPending || !sessionUserId}
      >
        <ArrowUp className="h-4 w-4" />
      </Button>

      <span
        className={cn(
          "text-xs font-medium",
          state.voteCount > 0 && "text-orange-500",
          state.voteCount < 0 && "text-blue-500",
          state.voteCount === 0 && "text-muted-foreground"
        )}
      >
        {state.voteCount}
      </span>

      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "p-1 h-8 w-8  hover:text-blue-500",
          state.userVote === "DOWNVOTE" && "text-blue-500 ",
          isPending && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => handleVote("DOWNVOTE")}
        disabled={isPending || !sessionUserId}
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default VoteComponent;
