"use client";

import { useState } from "react";

const Page = () => {
  const [input, setInput] = useState<string>("");
  return (
    <div>
      <h1>Create Page</h1>
      <p>This is a starter template for a Next.js page using TypeScript.</p>
    </div>
  );
};

export default Page;
