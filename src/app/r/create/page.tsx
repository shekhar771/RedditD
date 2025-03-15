"use client";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { createSubredditPayload } from "@/lib/validator/subreddit";
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
      console.log("Sending payload:", payload); // Log the payload

      const { data } = await axios.post("/api/subreddit", payload);
      return data as string;
    },
    onError: (error) => {
      console.error("Failed to create subreddit:", error);
      alert("Failed to create subreddit. Please try again.");
    },
    onSuccess: (data) => {
      console.error("sucess to create subreddit:", data);
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
            <p className="absolute px-3  left-0 inset-y-0 grid place-items-center ">
              r/
            </p>{" "}
            <Input
              className="pl-6 md: pl-7"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
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
              Create
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
