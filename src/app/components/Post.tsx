"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Post, User, Subreddit, Comment, Vote, PostType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LinkPreview } from "@/lib/validator/PostAdd";
import { JsonContentRenderer } from "@/app/components/Editor";
import VoteComponent from "@/app/components/Vote";
import {
  MessageCircle,
  Share2,
  Image as ImageIcon,
  Link as LinkIcon,
  FileText,
} from "lucide-react";

export type PostWithRelations = Post & {
  author: User;
  subreddit: Subreddit;
  comment: (Comment & {
    author: User;
    votes: { type: "UPVOTE" | "DOWNVOTE"; userId: string }[];
  })[];
  Vote: Vote[];
};

interface PostCardProps {
  post: PostWithRelations;
  session: any;
  variant?: "list" | "detail";
  showActions?: boolean;
  onPostClick?: (postId: string) => void;
  className?: string;
}

export const getPostTypeIcon = (type: string) => {
  switch (type) {
    case "IMAGE":
      return <ImageIcon className="h-3 w-3 mr-1" />;
    case "LINK":
      return <LinkIcon className="h-3 w-3 mr-1" />;
    case "TEXT":
    default:
      return <FileText className="h-3 w-3 mr-1" />;
  }
};

export const formatPostDate = (
  date: Date,
  variant: "short" | "full" = "short"
) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(variant === "full" && {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }).format(new Date(date));
};

export const PostHeader: React.FC<{
  post: PostWithRelations;
  dateVariant?: "short" | "full";
  onSubredditClick: (e: React.MouseEvent) => void;
  onUserClick: (e: React.MouseEvent) => void;
}> = ({ post, dateVariant = "short", onSubredditClick, onUserClick }) => (
  <div className="mb-2">
    <div className="flex items-center gap-2 text-xs">
      <Avatar
        className="h-5 w-5 cursor-pointer hover:opacity-80"
        onClick={onSubredditClick}
      >
        {post.subreddit.image ? (
          <AvatarImage src={post.subreddit.image} alt={post.subreddit.name} />
        ) : (
          <AvatarFallback className="text-xs bg-orange-500 text-white">
            {post.subreddit.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>
      <span
        className="font-medium hover:text-blue-500 hover:underline cursor-pointer"
        onClick={onSubredditClick}
      >
        r/{post.subreddit.name}
      </span>
      <span className="text-muted-foreground">•</span>
      <span className="text-muted-foreground">
        {formatPostDate(post.createdAt, dateVariant)}
      </span>
    </div>
    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
      <span
        className="hover:text-blue-500 cursor-pointer"
        onClick={onUserClick}
      >
        Posted by u/{post.author.username || post.author.name}
      </span>
    </div>
  </div>
);

export const PostTitle: React.FC<{
  post: PostWithRelations;
  variant?: "list" | "detail";
}> = ({ post, variant = "list" }) => (
  <h2
    className={`font-semibold mb-2 ${
      variant === "detail"
        ? "text-xl md:text-2xl font-bold mb-3 leading-tight"
        : "text-lg hover:text-blue-600 cursor-pointer"
    }`}
  >
    {post.title}
  </h2>
);

export const PostTypeIndicator: React.FC<{
  post: PostWithRelations;
  onTypeClick?: (type: PostType) => void;
}> = ({ post, onTypeClick }) => {
  const handleTypeClick = (e: React.MouseEvent, type: PostType) => {
    e.stopPropagation();
    if (onTypeClick) {
      onTypeClick(type);
    }
  };

  return (
    <div className="flex items-center gap-2 mb-2">
      <span
        className="inline-flex items-center text-xs font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded-full hover:bg-secondary/80 cursor-pointer"
        onClick={(e) => handleTypeClick(e, post.type as PostType)}
      >
        {getPostTypeIcon(post.type)}
        {post.type || "TEXT"}
      </span>
      {post.tag && (
        <span className="inline-flex items-center text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
          {post.tag}
        </span>
      )}
    </div>
  );
};
export const PostContentRenderers = {
  renderTextContent: (
    post: PostWithRelations,
    variant: "list" | "detail" = "list"
  ) => (
    <div className="mt-2">
      <JsonContentRenderer
        content={post.content}
        className={`prose prose-sm max-w-none dark:prose-invert ${
          variant === "list" ? "line-clamp-5" : ""
        }`}
      />
    </div>
  ),

  renderImageContent: (
    post: PostWithRelations,
    variant: "list" | "detail" = "list"
  ) => (
    <div className="mt-2">
      {post.imageUrl && (
        <div
          className={`relative w-full rounded-md overflow-hidden bg-secondary ${
            variant === "detail" ? "max-h-[70vh]" : "max-h-[400px]"
          }`}
        >
          <img
            src={post.imageUrl}
            alt={post.imageAlt || "Post image"}
            className={`object-contain w-full h-full ${
              variant === "detail"
                ? "max-h-[70vh] cursor-zoom-in"
                : "max-h-[400px] hover:scale-105 transition-transform duration-300"
            }`}
            loading="lazy"
          />
        </div>
      )}
    </div>
  ),

  renderLinkContent: (
    post: PostWithRelations,
    variant: "list" | "detail" = "list"
  ) => {
    const linkMeta = post.linkMeta as LinkPreview | null;
    return (
      <div className="mt-2">
        <div className="border rounded-lg hover:bg-secondary transition-colors duration-200 overflow-hidden">
          <div className="flex gap-3 p-3">
            {linkMeta?.image && (
              <div className="flex-shrink-0 overflow-hidden rounded w-16 h-16 md:w-24 md:h-24">
                <img
                  src={linkMeta.image}
                  alt="Link preview"
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium mb-1 truncate">
                {linkMeta?.title || "No title"}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-2">
                {linkMeta?.description || "No description available"}
              </p>
              <a
                href={post.linkUrl || linkMeta?.url}
                className="inline-flex items-center text-xs md:text-sm text-blue-500 hover:underline truncate"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                {post.linkUrl || linkMeta?.url || "View link"}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const PostActions: React.FC<{
  post: PostWithRelations;
  onShare: () => void;
  onCommentClick?: () => void;
  session: any;
}> = ({ post, onShare, onCommentClick, session }) => (
  <div className="mt-3 flex items-center gap-2">
    <div onClick={(e) => e.stopPropagation()}>
      <VoteComponent post={post} sessionUserId={session?.user?.id} />
    </div>
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-foreground gap-1 px-2"
      onClick={onCommentClick}
    >
      <MessageCircle className="h-4 w-4" />
      <span className="text-xs">{post.comment?.length || 0}</span>
    </Button>
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-foreground gap-1 px-2"
      onClick={onShare}
    >
      <Share2 className="h-4 w-4" />
    </Button>
  </div>
);

const PostCard: React.FC<PostCardProps> = ({
  post,
  session,
  variant = "list",
  showActions = true,
  onPostClick,
  className = "",
  onTypeClick,
}) => {
  const router = useRouter();
  const { toast } = useToast();

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/r/${post.subreddit.name}/post/${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "Post link copied to clipboard",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handlePostClick = () => {
    if (onPostClick) {
      onPostClick(post.id);
    } else {
      router.push(`/r/${post.subreddit.name}/post/${post.id}`);
    }
  };

  const handleSubredditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/r/${post.subreddit.name}`);
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/user/${post.author.username || post.author.name}`);
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handlePostClick();
  };

  const renderContent = () => {
    switch (post.type) {
      case "IMAGE":
        return PostContentRenderers.renderImageContent(post, variant);
      case "LINK":
        return PostContentRenderers.renderLinkContent(post, variant);
      case "TEXT":
      default:
        return PostContentRenderers.renderTextContent(post, variant);
    }
  };
  return (
    <div
      className={`bg-card text-card-foreground rounded-md border hover:border-muted-foreground/30 transition-colors duration-200 flex mb-3 cursor-pointer ${className}`}
      onClick={handlePostClick}
    >
      <div className="flex-1 p-3 overflow-hidden">
        <PostHeader
          post={post}
          dateVariant={variant === "detail" ? "full" : "short"}
          onSubredditClick={handleSubredditClick}
          onUserClick={handleUserClick}
        />
        <PostTitle post={post} variant={variant} />
        <PostTypeIndicator post={post} onTypeClick={onTypeClick} />
        <div className="overflow-hidden">{renderContent()}</div>

        {showActions && (
          <PostActions
            post={post}
            onShare={handleShare}
            onCommentClick={handleCommentClick}
            session={session}
          />
        )}
      </div>
    </div>
  );
};

export default PostCard;
