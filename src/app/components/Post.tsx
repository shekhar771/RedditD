"use client";

import React, {
  memo,
  useCallback,
  useMemo,
  useState,
  lazy,
  Suspense,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Post, User, Subreddit, Comment, Vote, PostType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LinkPreview } from "@/lib/validator/PostAdd";
import {
  MessageCircle,
  Share2,
  Trash,
  Image as ImageIcon,
  Link as LinkIcon,
  FileText,
  ExternalLink,
} from "lucide-react";

// Lazy load heavy components
const JsonContentRenderer = lazy(() =>
  import("@/app/components/Editor").then((m) => ({
    default: m.JsonContentRenderer,
  }))
);
const VoteComponent = lazy(() => import("@/app/components/Vote"));
const ImageModal = lazy(() =>
  import("./ImageModal").then((m) => ({ default: m.ImageModal }))
);

// --- Type Definitions ---
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
  onTypeClick?: (type: PostType) => void;
  priority?: boolean; // For image loading priority
}

// --- Optimized Utility Components ---
const PostTypeIcon = memo(({ type }: { type: string }) => {
  const IconComponent = useMemo(() => {
    switch (type) {
      case "IMAGE":
        return ImageIcon;
      case "LINK":
        return LinkIcon;
      case "TEXT":
      default:
        return FileText;
    }
  }, [type]);

  return <IconComponent className="h-3 w-3 mr-1" />;
});
PostTypeIcon.displayName = "PostTypeIcon";

// Memoized date formatter
const formatPostDate = (() => {
  const formatters = {
    short: new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    full: new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  return (date: Date, variant: "short" | "full" = "short") => {
    return formatters[variant].format(new Date(date));
  };
})();

const PostHeader = memo<{
  post: PostWithRelations;
  dateVariant?: "short" | "full";
}>(({ post, dateVariant = "short" }) => {
  const formattedDate = useMemo(
    () => formatPostDate(post.createdAt, dateVariant),
    [post.createdAt, dateVariant]
  );

  const subredditInitial = useMemo(
    () => post.subreddit.name.charAt(0).toUpperCase(),
    [post.subreddit.name]
  );

  const authorName = useMemo(
    () => post.author.username || post.author.name,
    [post.author.username, post.author.name]
  );

  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 text-xs">
        <Link
          href={`/r/${post.subreddit.name}`}
          prefetch={true}
          className="flex items-center gap-2 hover:opacity-80 no-underline"
          aria-label={`Go to r/${post.subreddit.name}`}
        >
          <Avatar className="h-5 w-5">
            {post.subreddit.image ? (
              <AvatarImage
                src={post.subreddit.image}
                alt={post.subreddit.name}
                loading="lazy"
              />
            ) : (
              <AvatarFallback className="text-xs bg-orange-500 text-white">
                {subredditInitial}
              </AvatarFallback>
            )}
          </Avatar>
          <span className="font-medium hover:text-blue-500 hover:underline">
            r/{post.subreddit.name}
          </span>
        </Link>
        <span className="text-muted-foreground">•</span>
        <span className="text-muted-foreground">{formattedDate}</span>
      </div>
      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
        <Link
          href={`/user/${authorName}`}
          prefetch={true}
          className="hover:text-blue-500 no-underline"
        >
          Posted by u/{authorName}
        </Link>
      </div>
    </div>
  );
});
PostHeader.displayName = "PostHeader";

const PostTitle = memo<{
  post: PostWithRelations;
  variant?: "list" | "detail";
  href: string;
}>(({ post, variant = "list", href }) => {
  const titleClasses = useMemo(
    () =>
      `font-semibold mb-2 no-underline text-current hover:text-blue-600 ${
        variant === "detail"
          ? "text-xl md:text-2xl font-bold mb-3 leading-tight"
          : "text-lg"
      }`,
    [variant]
  );

  return (
    <Link href={href} prefetch={true}>
      <h2 className={titleClasses}>{post.title}</h2>
    </Link>
  );
});
PostTitle.displayName = "PostTitle";

const PostTypeIndicator = memo<{
  post: PostWithRelations;
  onTypeClick?: (type: PostType) => void;
}>(({ post, onTypeClick }) => {
  const handleTypeClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onTypeClick?.(post.type as PostType);
    },
    [onTypeClick, post.type]
  );

  return (
    <div className="flex items-center gap-2 mb-2">
      <button
        type="button"
        className="inline-flex items-center text-xs font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded-full hover:bg-secondary/80 transition-colors"
        onClick={handleTypeClick}
      >
        <PostTypeIcon type={post.type} />
        {post.type || "TEXT"}
      </button>
      {post.tag && (
        <span className="inline-flex items-center text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
          {post.tag}
        </span>
      )}
    </div>
  );
});
PostTypeIndicator.displayName = "PostTypeIndicator";

const TextContent = memo<{
  post: PostWithRelations;
  variant: "list" | "detail";
}>(({ post, variant }) => (
  <div className="mt-2">
    <Suspense
      fallback={<div className="h-20 bg-secondary/20 rounded animate-pulse" />}
    >
      <JsonContentRenderer
        content={post.content}
        className={`prose prose-sm max-w-none dark:prose-invert ${
          variant === "list" ? "line-clamp-5" : ""
        }`}
      />
    </Suspense>
  </div>
));
TextContent.displayName = "TextContent";

const ImageContent = memo<{
  post: PostWithRelations;
  variant: "list" | "detail";
  priority?: boolean;
}>(({ post, variant, priority = false }) => {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsImageOpen(true);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  if (!post.imageUrl) return null;

  return (
    <div className="mt-2">
      <div
        className={`relative w-full rounded-md overflow-hidden bg-secondary cursor-zoom-in ${
          variant === "detail" ? "max-h-[70vh]" : "max-h-[400px]"
        }`}
        onClick={handleImageClick}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 bg-secondary animate-pulse flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <img
          src={post.imageUrl}
          alt={post.imageAlt || "Post image"}
          className={`object-contain w-full h-full transition-all duration-300 ${
            variant === "detail"
              ? "max-h-[70vh]"
              : "max-h-[400px] hover:scale-105"
          } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={handleImageLoad}
        />
      </div>
      {isImageOpen && (
        <Suspense fallback={null}>
          <ImageModal
            src={post.imageUrl}
            alt={post.imageAlt || "Post image"}
            open={isImageOpen}
            onClose={() => setIsImageOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
});
ImageContent.displayName = "ImageContent";

const LinkContent = memo<{
  post: PostWithRelations;
  variant: "list" | "detail";
}>(({ post, variant }) => {
  const linkMeta = useMemo(
    () => post.linkMeta as LinkPreview | null,
    [post.linkMeta]
  );

  const linkUrl = useMemo(
    () => post.linkUrl || linkMeta?.url || "#",
    [post.linkUrl, linkMeta?.url]
  );

  const handleLinkClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div className="mt-2">
      <div className="border rounded-lg hover:bg-secondary/50 transition-colors duration-200 overflow-hidden">
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleLinkClick}
          className="flex gap-3 p-3 no-underline text-current group"
        >
          {linkMeta?.image && (
            <div className="flex-shrink-0 overflow-hidden rounded w-16 h-16 md:w-24 md:h-24 bg-secondary">
              <img
                src={linkMeta.image}
                alt="Link preview"
                className="object-cover w-full h-full transition-transform group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium mb-1 truncate group-hover:text-blue-600 transition-colors">
              {linkMeta?.title || "No title"}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-2">
              {linkMeta?.description || "No description available"}
            </p>
            <span className="inline-flex items-center text-xs md:text-sm text-blue-500 group-hover:underline truncate">
              <ExternalLink className="h-3 w-3 mr-1 flex-shrink-0" />
              {new URL(linkUrl).hostname}
            </span>
          </div>
        </a>
      </div>
    </div>
  );
});
LinkContent.displayName = "LinkContent";

const PostActions = memo<{
  post: PostWithRelations;
  onShare: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  session: any;
  commentCount: number;
  postHref: string;
}>(({ post, onShare, onDelete, session, commentCount, postHref }) => {
  const canDelete = useMemo(
    () => post.authorId === session?.user?.id,
    [post.authorId, session?.user?.id]
  );

  return (
    <div className="mt-3 flex items-center gap-2">
      <Suspense
        fallback={
          <div className="h-8 w-16 bg-secondary/20 rounded animate-pulse" />
        }
      >
        <VoteComponent post={post} sessionUserId={session?.user?.id} />
      </Suspense>

      <Link href={postHref} prefetch={true}>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground gap-1 px-2"
          asChild
        >
          <span>
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">{commentCount}</span>
          </span>
        </Button>
      </Link>

      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground gap-1 px-2"
        onClick={onShare}
      >
        <Share2 className="h-4 w-4" />
      </Button>

      {canDelete && onDelete && (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground gap-1 px-2"
          onClick={onDelete}
        >
          <Trash className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
});
PostActions.displayName = "PostActions";

// --- Main PostCard Component ---
const PostCard = memo<PostCardProps>(
  ({
    post,
    session,
    variant = "list",
    showActions = true,
    onPostClick,
    className = "",
    onTypeClick,
    priority = false,
  }) => {
    const router = useRouter();
    const { toast } = useToast();

    const postHref = useMemo(
      () => `/r/${post.subreddit.name}/post/${post.id}`,
      [post.subreddit.name, post.id]
    );

    const commentCount = useMemo(
      () => post.comment?.length || 0,
      [post.comment?.length]
    );

    const handleDelete = useCallback(
      async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm("Are you sure you want to delete this post?")) {
          return;
        }

        const toastId = toast({
          title: "Deleting post...",
          description: "Please wait.",
        });

        try {
          const response = await fetch(`/api/posts/${post.id}/delete`, {
            method: "DELETE",
            credentials: "include",
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to delete post");
          }

          toast({
            title: "Success",
            description: "Post deleted successfully",
          });

          router.replace(`/r/${post.subreddit.name}`);
        } catch (err) {
          toast({
            title: "Error",
            description:
              err instanceof Error ? err.message : "Failed to delete post",
            variant: "destructive",
          });
        }
      },
      [post.id, post.subreddit.name, router, toast]
    );

    const handleShare = useCallback(
      async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const url = `${window.location.origin}${postHref}`;

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
          // Fallback for older browsers
          try {
            await navigator.clipboard.writeText(url);
            toast({
              title: "Link copied!",
              description: "Post link copied to clipboard",
              duration: 2000,
            });
          } catch {
            toast({
              title: "Share Failed",
              description: "Could not share the post. Please try again.",
              variant: "destructive",
            });
          }
        }
      },
      [postHref, post.title, toast]
    );

    const handlePostClick = useCallback(
      (e: React.MouseEvent) => {
        // Only handle click if it's not on an interactive element
        const target = e.target as HTMLElement;
        if (target.closest('a, button, [role="button"]')) {
          return;
        }

        e.preventDefault();
        if (onPostClick) {
          onPostClick(post.id);
        } else {
          router.push(postHref);
        }
      },
      [onPostClick, post.id, postHref, router]
    );

    const renderContent = useCallback(() => {
      switch (post.type) {
        case "IMAGE":
          return (
            <ImageContent post={post} variant={variant} priority={priority} />
          );
        case "LINK":
          return <LinkContent post={post} variant={variant} />;
        case "TEXT":
        default:
          return <TextContent post={post} variant={variant} />;
      }
    }, [post, variant, priority]);

    const cardClasses = useMemo(
      () =>
        `bg-card text-card-foreground rounded-md border hover:border-muted-foreground/30 transition-colors duration-200 flex mb-3 ${
          variant === "list" ? "cursor-pointer" : ""
        } ${className}`,
      [variant, className]
    );

    return (
      <article
        className={cardClasses}
        onClick={variant === "list" ? handlePostClick : undefined}
        role={variant === "list" ? "button" : undefined}
        tabIndex={variant === "list" ? 0 : undefined}
      >
        <div className="flex-1 p-3 overflow-hidden">
          <PostHeader
            post={post}
            dateVariant={variant === "detail" ? "full" : "short"}
          />
          <PostTitle post={post} variant={variant} href={postHref} />
          <PostTypeIndicator post={post} onTypeClick={onTypeClick} />
          <div className="overflow-hidden">{renderContent()}</div>
          {showActions && (
            <PostActions
              post={post}
              onShare={handleShare}
              onDelete={handleDelete}
              session={session}
              commentCount={commentCount}
              postHref={postHref}
            />
          )}
        </div>
      </article>
    );
  }
);

PostCard.displayName = "PostCard";

export default PostCard;
