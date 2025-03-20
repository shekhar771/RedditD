import { AuthGuard } from "@/app/components/AuthGuard";
// import { toast } from "@/hooks/use-toast";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import React, { FC } from "react";

interface PageProps {
  params: {
    slug: string;
  };
}

const page: FC<PageProps> = async ({ params }: PageProps) => {
  //   const slug = useParams();
  const { slug } = await params;

  const subreddit = await prisma.subreddit.findFirst({
    where: {
      name: slug,
    },
    include: {
      post: {
        include: {
          author: true,
          subreddit: true,
          comment: true,
          Vote: true,
        },
        // take: INFINTE_SCROLL_PAGINATION,
        take: 2,
      },
    },
  });
  if (!subreddit) {
    // toast({
    //   title: `The r\ ${slug} subreddit does not exist`,
    //   variant: "destructive",
    // });
    return notFound();
  }

  return (
    <AuthGuard>
      <div className="flex flex-row  justify-between px-9 mx-5 items-center">
        <div>image</div> <div className="text-3xl">{slug}</div>
        <div className="flex  gap-5">
          <div>create post</div>
          <div>join</div>
          <div>...option</div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default page;
