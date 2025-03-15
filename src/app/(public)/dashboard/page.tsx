"use client";

import { AuthGuard } from "@/app/components/AuthGuard";
import { useAuth } from "@/app/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/server-auth";
import { useRouter } from "next/navigation";

export default async function DashboardPage() {
  // const user = await requireAuth(); // Server-side auth check

  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <div>array</div>
            <CardTitle>Welcome to your Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground">Logged in as:</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Username:</p>
                <p className="font-medium">{user?.username}</p>
              </div>
              <Button onClick={handleLogout} variant="outline">
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
