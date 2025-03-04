"use client";

import { HomeIcon } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="">
      <h1 className="font-bold text-3xl md:text-4xl">HOMEPAGE</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 gap-y-4 lg:grid-cols-3">
        <div className="">feed</div>
        <div className="overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last">
          <div className="bg-primary-foreground px-6 py-2 ">
            <p className="font-semibold text-foreground py-3 flex item-center  gap-1.5">
              <HomeIcon className="w-4 h-6 items-center" /> info
            </p>{" "}
          </div>
        </div>{" "}
      </div>
    </div>
  );
}
// grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]
