"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function dashboard() {
  const router = useRouter();

  async useEffect(() => {
   const check=await fetch("/api/auth/session", { credentials: "include" });
  });
}
