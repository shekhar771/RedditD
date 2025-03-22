"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
// import { toast } from "@/hooks/use-toast";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import React, { FC } from "react";
import { Plus } from "lucide-react";
import Image from "next/image";

interface PageProps {}

const Formsubmit: FC<PageProps> = () => {
  //   const slug = useParams();

  return (
    <div className="flex gap-3 mt-4 md:mt-1 md:ml-1 justify-start">
      {/* <div className="flex gap-3 flex-col"> */}
      <Button className="flex items-center gap-1.5">
        <Plus className="h-4 w-4" />
        <span>Create post</span>
      </Button>
      <Button variant="secondary">Join</Button>
    </div>
  );
};

export default Formsubmit;
