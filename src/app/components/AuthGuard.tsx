"use client";

import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icons } from "@/components/ui/icons"; // Make sure you have this component

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

export function AuthGuard({
  children,
  requireAuth = true,
  fallback = (
    <div className="flex justify-center items-center h-screen">
      {" "}
      <Icons.spinner className="size-4 animate-spin" />
    </div>
  ),
}: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isClientSideChecked, setIsClientSideChecked] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !user) {
        router.push("/login");
      } else if (!requireAuth && user) {
        router.push("/dashboard");
      }
      setIsClientSideChecked(true);
    }
  }, [user, isLoading, requireAuth, router]);

  // Show loading state while initial check is happening
  if (isLoading || !isClientSideChecked) {
    return fallback;
  }

  // Don't render children for unauthorized or wrong state
  if ((requireAuth && !user) || (!requireAuth && user)) {
    return null;
  }

  // Render the protected content
  return <>{children}</>;
}
