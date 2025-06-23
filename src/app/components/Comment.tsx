"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { CommentWithRelations } from "@/lib/validator/comment";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import {
  MessageCircle,
  ArrowUp,
  ArrowDown,
  Reply,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CommentItem from "./CommentItem";

interface CommentSectionProps {
  postId: string;
  session: any;
  initialComments?: CommentWithRelations[];
}

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  session,
  initialComments = [],
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [sortBy, setSortBy] = useState<"new" | "top" | "old">("new");

  const commentMutation = useMutation({
    mutationFn: async (data: { content: string; postId: string }) => {
      return await axios.post("/api/comments", data);
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      toast({
        title: "Success",
        description: "Comment posted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = () => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment.",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment.",
        variant: "destructive",
      });
      return;
    }

    commentMutation.mutate({
      content: newComment,
      postId,
    });
  };

  const buildCommentTree = (
    comments: CommentWithRelations[]
  ): CommentWithRelations[] => {
    const commentMap = new Map<string, CommentWithRelations>();
    const rootComments: CommentWithRelations[] = [];

    comments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    comments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id);
      if (!commentWithReplies) return;

      if (comment.replyToID) {
        const parent = commentMap.get(comment.replyToID);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  };

  const sortedComments = useMemo(() => {
    const tree = buildCommentTree(initialComments);

    const sortComments = (
      comments: CommentWithRelations[]
    ): CommentWithRelations[] => {
      const sorted = [...comments].sort((a, b) => {
        switch (sortBy) {
          case "new":
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          case "old":
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          case "top":
            const aScore = a.votes.reduce(
              (acc, vote) => acc + (vote.type === "UPVOTE" ? 1 : -1),
              0
            );
            const bScore = b.votes.reduce(
              (acc, vote) => acc + (vote.type === "UPVOTE" ? 1 : -1),
              0
            );
            return bScore - aScore;
          default:
            return 0;
        }
      });

      return sorted.map((comment) => ({
        ...comment,
        replies: comment.replies ? sortComments(comment.replies) : [],
      }));
    };

    return sortComments(tree);
  }, [initialComments, sortBy]);

  return (
    <div className="space-y-6">
      {/* Comment form */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            {session?.user?.image ? (
              <AvatarImage src={session.user.image} />
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground">
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                session
                  ? "What are your thoughts?"
                  : "Please sign in to comment..."
              }
              className="min-h-[100px] text-sm"
              disabled={!session}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {session
                  ? `Commenting as u/${
                      session.user?.username || session.user?.name
                    }`
                  : "Sign in to join the discussion"}
              </span>
              <Button
                size="sm"
                onClick={handleSubmitComment}
                disabled={
                  !session || commentMutation.isPending || !newComment.trim()
                }
              >
                {commentMutation.isPending ? "Posting..." : "Comment"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments
        </h3>
        {sortedComments.length > 0 && (
          <Select
            value={sortBy}
            onValueChange={(value: "new" | "top" | "old") => setSortBy(value)}
          >
            <SelectTrigger className="w-32 h-8">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Newest</SelectItem>
              <SelectItem value="top">Top</SelectItem>
              <SelectItem value="old">Oldest</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {sortedComments.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              No comments yet. Be the first to comment!
            </p>
          </div>
        ) : (
          sortedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              session={session}
              postId={postId}
              depth={0}
              maxDepth={3}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
