import UserProfileClient from "@/app/components/userprofile";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

interface UserProfilePageProps {
  params: {
    slug: string;
  };
}

export default async function UserProfilePage({
  params,
}: UserProfilePageProps) {
  const username = params.slug;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      posts: {
        include: {
          author: true,
          subreddit: true,
          Vote: true,
          comment: { select: { id: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      Comment: {
        include: {
          post: {
            select: {
              id: true,
              title: true,
              subreddit: { select: { name: true } },
            },
          },
          votes: { select: { type: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      Vote: {
        where: { type: "UPVOTE" },
        include: {
          post: {
            include: {
              author: true,
              subreddit: true,
              Vote: true,
              comment: { select: { id: true } },
            },
          },
        },
        orderBy: {
          post: { createdAt: "desc" },
        },
      },
      _count: {
        select: {
          posts: true,
          Comment: true,
        },
      },
    },
  });

  if (!user) return notFound();

  return (
    <UserProfileClient
      user={{
        id: user.id,
        username: user.username,
        name: user.name,
        image: user.image,
        postCount: user._count.posts,
        commentCount: user._count.Comment,
      }}
      posts={user.posts}
      comments={user.Comment}
      likedPosts={user.Vote.map((v) => v.post)}
    />
  );
}
