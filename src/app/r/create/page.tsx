"use client";
import { Input } from "@/components/ui/input";
import axios, { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { createSubredditPayload } from "@/lib/validator/subreddit";
import { toast } from "@/hooks/use-toast";
const Page = () => {
  const router = useRouter();
  const [input, setInput] = useState<string>("");
  const [inputdes, setInputdes] = useState<string>("");

  const { mutate: submitData, isLoading } = useMutation({
    mutationFn: async () => {
      const payload: createSubredditPayload = {
        name: input,
        description: inputdes,
      };

      const { data } = await axios.post("/api/subreddit", payload);

      return data as string;
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.status === 409) {
        console.error("subreddit already exist");
        toast({
          variant: "destructive",

          title: "failed ",
          description: `subreddit already exist`,
        });
      } else if (
        error instanceof AxiosError &&
        error.response?.status === 422
      ) {
        console.error("subreddit name should be between 3 to 21 characters");
        toast({
          variant: "destructive",

          title: "subreddit name should be between 3 to 21 characters ",
        });
      } else {
        toast({
          title: "failed ",
          variant: "destructive",
          description: `error ${error.response?.message}`,
        });
      }
      // alert("Failed to create subreddit. Please try again.");
    },
    onSuccess: (data) => {
      toast({
        title: "Success",

        description: `r/${data.name} subreddit created successfully`,
      });
      router.push(`/r/${data.name}`);
      console.log("sucess to create subreddit:", data);
    },
  });
  return (
    <div className="  container flex items-center rounded-lg h-full max-w-3xl mx-auto ">
      <div className=" bg-card relative  w-full h-fit p-4 rounded-lg space-y-6">
        <div className=" bg-card flex justify-between items-center">
          <h1 className="text-xl font-semibold">Create a subreddit</h1>
        </div>
        <hr></hr>
        <div className="bg-card space-y-4">
          <p>Name</p>
          <div className="relative">
            <p className="absolute px-3  text-zinc-800 left-0 inset-y-0 grid place-items-center ">
              r/
            </p>{" "}
            <Input
              className="pl-6 md: pl-7"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <div>Description</div>
          <Input
            className=""
            value={inputdes}
            onChange={(e) => setInputdes(e.target.value)}
          />
          <div className="flex gap-2 mx-2 my-3">
            <Button
              variant="outline"
              // className="bg-destructive-foreground"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              isLoading={isLoading}
              disabled={input.length === 0}
              onClick={() => submitData()}
            >
              Create a subreddit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
