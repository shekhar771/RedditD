"use client";

import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}
export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !user) {
        router.push("/login");
      } else if (!requireAuth && user) {
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, requireAuth, router]);

  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  if (requireAuth && !user) {
    return null;
  }

  if (!requireAuth && user) {
    return null;
  }

  return <>{children}</>;
}
