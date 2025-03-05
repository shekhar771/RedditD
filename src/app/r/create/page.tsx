"use client";

import { useState } from "react";

const Page = () => {
  const [input, setInput] = useState<string>("");
  return (
    <div className="  container flex items-center h-full max-w-3xl mx-auto ">
      <div className="relative bg-white w-full h-fit p-4 rounded-lg space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semfold">Create a subreddit</h1>
        </div>
      </div>

      <p>This is a starter template for a Next.js page using TypeScript.</p>
    </div>
  );
};

export default Page;
