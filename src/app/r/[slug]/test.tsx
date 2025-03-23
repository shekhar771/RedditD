"use client";
import { Button } from "@/components/ui/button";
// import { toast } from "@/hooks/use-toast";
import React, { FC } from "react";
import { Plus } from "lucide-react";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";

interface PageProps {}

const Formsubmit: FC<PageProps> = () => {
  //   const slug = useParams();
  const joinSubreddit = () => {};
  const router = useRouter();
  const pathname = usePathname();
  return (
    <div className="md:ml-auto">
      <div className="flex gap-3 mt-4   md:mt-1 mr-1 md:justify-between ">
        {/* <div className="flex gap-3 flex-col"> */}
        <Button
          aria-placeholder="create post"
          onClick={() => router.push(`${pathname}/submit`)}
          className="flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Create post</span>
        </Button>
        {
          <Button onClick={() => joinSubreddit()} variant="secondary">
            Join
          </Button>
        }
      </div>
    </div>
  );
};

export default Formsubmit;
