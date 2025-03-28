import PostAddNav from "@/app/components/Postadd";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tab";
import { prisma } from "@/lib/db";
import { Ghost } from "lucide-react";
import { notFound } from "next/navigation";
import React from "react";

interface PageProps {
  params: {
    slug: string;
    imageUrl?: string;
  };
}
const tabs = [
  { id: "overview", label: "Overview" },
  { id: "integrations", label: "Integrations" },
  { id: "activity", label: "Activity" },
  { id: "domains", label: "Domains" },
  { id: "usage", label: "Usage" },
  { id: "monitoring", label: "Monitoring" },
];

const page = async ({ params }: PageProps) => {
  const handleTabChange = (tabId: string) => {
    console.log("Selected tab:", tabId);
  };
  const { slug } = await params;
  const onsubmit = async (data: any) => {
    try {
      console.log("Form Data:", data);
    } catch (error) {}
  };

  const subreddit = await prisma.subreddit.findFirst({
    where: {
      name: slug,
    },
  });
  if (!subreddit) {
    return notFound();
  }
  return (
    <div className="container mx-auto w-full sm:w-4/6 mt-5">
      <div className="flex justify-between mt-1 items-center">
        <h1 className="text-3xl md:text-3xl font-bold">Create Post</h1>
        <Button className="p-1" variant="outline">
          draft
        </Button>
      </div>
      <div className="mt-3 flex items-center gap-2 bg-secondary rounded-2xl px-3 py-1 w-fit border">
        <Avatar className="h-10 w-10 md:h-8 md:w-8 border-2 border-white shadow-lg">
          {subreddit.image ? (
            <AvatarImage src={subreddit.image} alt={subreddit.name} />
          ) : (
            <AvatarFallback className="text-2xl md:text-3xl bg-orange-500">
              {subreddit.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
        <h3 className=" text-xl  font-bold  ">r/{slug}</h3>
      </div>
      <PostAddNav subredditId={subreddit.id} />
      <div className="flex items-center gap-2  mt-4 justify-end ">
        <Button variant="ghost">Draft</Button>

        <Button type="submit">submit</Button>
      </div>
    </div>
  );
};

export default page;
