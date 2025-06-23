"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, ArrowDown, Reply, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { CommentWithRelations } from "@/lib/validator/comment";
import { formatDistanceToNow } from "date-fns";

interface CommentItemProps {
  comment: CommentWithRelations;
  session: any;
  postId: string;
  depth?: number;
  maxDepth?: number;
  showReplies?: boolean;
  showActions?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  session,
  postId,
  depth = 0,
  maxDepth = 3,
  showReplies = true,
  showActions = true,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const voteCount = comment.votes.reduce(
    (acc, vote) => acc + (vote.type === "UPVOTE" ? 1 : -1),
    0
  );

  const currentUserVote = comment.votes.find(
    (vote) => vote.userId === session?.user?.id
  );

  const [localVoteCount, setLocalVoteCount] = useState(voteCount);
  const [userVote, setUserVote] = useState<"UPVOTE" | "DOWNVOTE" | null>(
    (currentUserVote?.type as "UPVOTE" | "DOWNVOTE" | null) || null
  );

  const voteMutation = useMutation({
    mutationFn: async ({
      commentId,
      type,
    }: {
      commentId: string;
      type: "UPVOTE" | "DOWNVOTE";
    }) => {
      return await axios.post("/api/comments/vote", { commentId, type });
    },
    onError: () => {
      setUserVote(
        (currentUserVote?.type as "UPVOTE" | "DOWNVOTE" | null) || null
      );
      setLocalVoteCount(voteCount);
      toast({
        title: "Error",
        description: "Failed to register vote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const replyMutation = useMutation({
    mutationFn: async (data: {
      content: string;
      postId: string;
      replyToId: string;
    }) => {
      return await axios.post("/api/comments", data);
    },
    onSuccess: () => {
      setReplyContent("");
      setShowReplyForm(false);
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      toast({
        title: "Success",
        description: "Reply posted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleVote = (type: "UPVOTE" | "DOWNVOTE") => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote on comments.",
        variant: "destructive",
      });
      return;
    }

    let newCount = localVoteCount;
    let newUserVote = userVote;

    if (userVote === type) {
      newUserVote = null;
      newCount += type === "UPVOTE" ? -1 : 1;
    } else if (userVote) {
      newUserVote = type;
      newCount += type === "UPVOTE" ? 2 : -2;
    } else {
      newUserVote = type;
      newCount += type === "UPVOTE" ? 1 : -1;
    }

    setUserVote(newUserVote);
    setLocalVoteCount(newCount);
    voteMutation.mutate({ commentId: comment.id, type });
  };

  const handleReply = () => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to reply to comments.",
        variant: "destructive",
      });
      return;
    }

    if (!replyContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply.",
        variant: "destructive",
      });
      return;
    }

    replyMutation.mutate({
      content: replyContent,
      postId,
      replyToId: comment.id,
    });
  };

  const canReply = depth < maxDepth;
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div
      className={cn("border-l-2 border-gray-200 dark:border-gray-700", {
        "ml-4": depth > 0,
      })}
    >
      <div className="pl-4 py-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-2">
            {comment.author && comment.author.image ? (
              <img
                src={comment.author.image}
                alt={comment.author.name || "User"}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-muted" />
            )}

            <span className="font-medium text-sm">
              {comment.author?.username ||
                comment.author?.name ||
                "Unknown User"}
            </span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          {hasReplies && showReplies && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 h-6"
            >
              <MessageSquare className="h-3 w-3" />
              <span className="text-xs ml-1">{isCollapsed ? "+" : "-"}</span>
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="mb-3">
          <p className="text-sm leading-relaxed">{comment.content}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "p-1 h-6 w-6",
                userVote === "UPVOTE" && "text-orange-500"
              )}
              onClick={() => handleVote("UPVOTE")}
            >
              <ArrowUp className="h-3 w-3" />
            </Button>
            <span
              className={cn(
                "text-xs font-medium px-1",
                localVoteCount > 0 && "text-orange-500",
                localVoteCount < 0 && "text-blue-500"
              )}
            >
              {localVoteCount}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "p-1 h-6 w-6",
                userVote === "DOWNVOTE" && "text-blue-500"
              )}
              onClick={() => handleVote("DOWNVOTE")}
            >
              <ArrowDown className="h-3 w-3" />
            </Button>
          </div>

          {showActions && canReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-xs h-6 px-2"
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}
        </div>

        {/* Reply Form */}
        {showActions && showReplyForm && (
          <div className="mt-3 space-y-2">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="min-h-[80px] text-sm"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleReply}
                disabled={replyMutation.isPending}
              >
                {replyMutation.isPending ? "Posting..." : "Post Reply"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Nested Replies */}
        {showReplies && hasReplies && !isCollapsed && (
          <div className="mt-3">
            {comment.replies!.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                session={session}
                postId={postId}
                depth={depth + 1}
                maxDepth={maxDepth}
                showReplies={showReplies}
                showActions={showActions}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
