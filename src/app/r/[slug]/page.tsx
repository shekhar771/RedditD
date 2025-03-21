import { AuthGuard } from "@/app/components/AuthGuard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { toast } from "@/hooks/use-toast";
import { prisma } from "@/lib/db";
import { Search } from "lucide-react";
import { notFound } from "next/navigation";
import React, { FC } from "react";

interface PageProps {
  params: {
    slug: string;
    imageUrl?: string;
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
      <div className="flex flex-row  justify-between px-16 mx-5 items-center">
        <div className="flex  gap-5 items-end">
          <div className="relative ">
            <Avatar className=" h-16 w-16">
              {subreddit.image ? (
                <AvatarImage src={subreddit.image} alt={subreddit.name} />
              ) : (
                <AvatarFallback className="h-16 w-16 text-3xl ">
                  {subreddit.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
          </div>{" "}
          <div className="text-3xl">{slug}</div>
        </div>
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
