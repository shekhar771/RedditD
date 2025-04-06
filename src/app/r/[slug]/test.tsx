"use client";
import { Button } from "@/components/ui/button";
// import { toast } from "@/hooks/use-toast";
import React, { FC, startTransition } from "react";
import { Plus } from "lucide-react";
import axios, { AxiosError } from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { subredditsubscribberPayload } from "@/lib/validator/subreddit";
import { objectInputType } from "zod";

interface PageProps {
  isSubscribed: Boolean;
  subredditId: string;
  subredditName: string;
}

const Formsubmit: FC<PageProps> = ({
  isSubscribed,
  subredditName,
  subredditId,
}) => {
  //   const slug = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { mutate: unsubscribe } = useMutation({
    mutationFn: async () => {
      const payload: subredditsubscribberPayload = {
        subredditId: subredditId,
      };

      const { data } = await axios.delete("/api/subreddit/join", {
        data: payload,
      });

      return data as string;
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.status === 401) {
        console.error("not logged in");
        toast({
          variant: "destructive",

          title: "You are not logged in",
          // description: ``,
        });
      } else if (
        error instanceof AxiosError &&
        error.response?.status === 400
      ) {
        console.error("not logged in");
        toast({
          variant: "destructive",

          title: "Admin cannot unsubscribe from their own subreddit ",
          // description: ``,
        });
      } else {
        toast({
          title: "There was problem ",
          variant: "destructive",
          description: `Something went wrong, Kindly try again ${error.response?.message}`,
        });
      }
      // alert("Failed to create subreddit. Please try again.");
    },
    onSuccess: (data) => {
      toast({
        title: "Success",

        description: `You have successfully unsubscribe from  ${subredditName} subreddit`,
      });
      // router.push(`/r/${data.name}`);
      console.log(`You have joined ${subredditName} subreddit`, data);
      startTransition(() => {
        router.refresh();
      });
    },
  });
  const { mutate: subscribe, isLoading } = useMutation({
    mutationFn: async () => {
      const payload: subredditsubscribberPayload = {
        subredditId: subredditId,
      };

      const { data } = await axios.post("/api/subreddit/join", payload);

      return data as string;
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.status === 401) {
        console.error("not logged in");
        toast({
          variant: "destructive",

          title: "You are not logged in",
          // description: ``,
        });
      } else {
        toast({
          title: "There was problem ",
          variant: "destructive",
          description: `Something went wrong, Kindly try again ${error.response?.message}`,
        });
      }
      // alert("Failed to create subreddit. Please try again.");
    },
    onSuccess: (data) => {
      toast({
        title: "Success",

        description: `You have joined ${subredditName} subreddit`,
      });
      // router.push(`/r/${data.name}`);
      console.log(`You have joined ${subredditName} subreddit`, data);
      startTransition(() => {
        router.refresh();
      });
    },
  });

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
        {isSubscribed ? (
          <Button onClick={() => unsubscribe()} variant="secondary">
            Leave
          </Button>
        ) : (
          <Button onClick={() => subscribe()} variant="secondary">
            Join
          </Button>
        )}
      </div>
    </div>
  );
};

export default Formsubmit;
