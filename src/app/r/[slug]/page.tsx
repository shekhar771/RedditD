import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
// import { toast } from "@/hooks/use-toast";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import React, { FC } from "react";
import { Plus } from "lucide-react";
import Image from "next/image";
import Formsubmit from "./test";
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
    <div className="w-full md:w-9/12 mx-auto relative">
      <div aria-label="background image" className="relative h-16 md:h-20">
        {subreddit.backgroundImage ? (
          <Image
            className="md:rounded-2xl w-full"
            src={subreddit.backgroundImage}
            alt={subreddit.name}
          />
        ) : (
          <div className="w-full h-16 bg-gray-800 md:rounded-2xl md:h-20" />
        )}
      </div>

      <div className="top-[0.5rem] relative md:absolute md:top-[2.5rem] left-5">
        <Avatar className="h-16 w-16 md:h-20 md:w-20 border-4 border-white shadow-lg">
          {subreddit.image ? (
            <AvatarImage src={subreddit.image} alt={subreddit.name} />
          ) : (
            <AvatarFallback className="text-3xl md:text-5xl bg-orange-500">
              {subreddit.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
      </div>

      <div className="ml-24 -mt-12  flex flex-col md:flex-row  md:mt-1 md:justify-between md:items-center">
        <div className="ml-7">
          <h1 className="text-4xl md:text-4xl font-bold">r/{slug}</h1>
          <div className="md:hidden ">10k member</div>
        </div>

        <Formsubmit />
        <br />
      </div>
    </div>
  );
};

export default page;
