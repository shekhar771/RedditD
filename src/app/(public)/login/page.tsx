"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Camera as IconSpinner } from "lucide-react";
import { Icons } from "@/components/ui/icons";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider";
import { AuthGuard } from "@/app/components/AuthGuard";

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);

      toast({
        title: "Success",
        description: "Logged in successfully",
      });

      //
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: string) => {
    setIsLoading(true);
    try {
      // Implement proper social auth flow
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Authentication failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="grid w-full grow items-center px-4 sm:justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Sign in to Acme Co</CardTitle>
            <CardDescription>
              Welcome back! Please sign in to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                disabled={isLoading}
                onClick={() => handleSocialAuth("github")}
              >
                {isLoading ? (
                  <IconSpinner className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Icons.gitHub className="mr-2 h-4 w-4" />
                    GitHub
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                disabled={isLoading}
                onClick={() => handleSocialAuth("google")}
              >
                {isLoading ? (
                  <IconSpinner className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Icons.google className="mr-2 h-4 w-4" />
                    Google
                  </>
                )}
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading && (
                <IconSpinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign In
            </Button>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </AuthGuard>
  );
}
