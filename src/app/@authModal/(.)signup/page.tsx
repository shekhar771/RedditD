"use client";
import SignInPage from "@/app/(public)/login/page";
import SignUpPage from "@/app/(public)/signup/page";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC } from "react";

interface pageProps {} // Define props if needed

const page: FC<pageProps> = ({}) => {
  const router = useRouter();
  return (
    <div className="fixed inset-0 bg-zinc-900/20 z-10 flex items-center justify-center">
      <div className="relative mt-20">
        {/* container flex item-center h-fit   mt-20 max-w-sm mx-auto */}
        {/* <div className="w-full  h-fit relative px-1 py-20 rounded-lg bg-white"> */}
        <div className="absolute top-2 right-5 z-10">
          <Button onClick={() => router.back()} variant="outline">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <SignUpPage />
      </div>
    </div>
    // </div>
  );
};

export default page;
