"use client";
import { useState } from "react";
import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import { Icons } from "@/components/ui/icons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { signup } from "@/lib/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // src/app/(public)/signup/page.tsx
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate input
      if (!formData.email || !formData.password || !formData.username) {
        setError("Please fill in all fields.");
        return;
      }

      // Attempt signup
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // Parse the response
      const data = await response.json();

      // Check if the request was successful
      if (!response.ok) {
        // Throw an error with the backend's error message
        throw new Error(data.error || "Failed to sign up");
      }

      // Signup successful
      toast({
        title: "Account Created",
        description: "Your account has been successfully created.",
      });
      console.log(data);
      // Optionally redirect or sign in
    } catch (error) {
      // Set the error state with the error message
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = (provider: string) => {
    try {
      setIsLoading(true);
      signIn(provider, { callbackUrl: "/dashboard" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
      //toaster
      setError(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  return (
    <div className="grid w-full grow items-center px-4 sm:justify-center">
      <Card className="w-full sm:w-96">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Welcome! Please fill in the details to get started.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-y-4">
            <div className="grid grid-cols-2 gap-x-4">
              <Button
                size="sm"
                variant="outline"
                type="button"
                disabled={isLoading}
                onClick={() => handleSocialSignIn("github")}
              >
                {isLoading ? (
                  <Icons.spinner className="size-4 animate-spin" />
                ) : (
                  <>
                    <Icons.gitHub className="mr-2 size-4" />
                    GitHub
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                type="button"
                disabled={isLoading}
                onClick={() => handleSocialSignIn("google")}
              >
                {isLoading ? (
                  <Icons.spinner className="size-4 animate-spin" />
                ) : (
                  <>
                    <Icons.google className="mr-2 size-4" />
                    Google
                  </>
                )}
              </Button>
            </div>

            <p className="flex items-center gap-x-3 text-sm text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
              or
            </p>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>

          <CardFooter>
            <div className="grid w-full gap-y-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Icons.spinner className="size-4 animate-spin" />
                ) : (
                  "Sign up"
                )}
              </Button>
              <Button variant="link" size="sm" asChild>
                <Link href="/login">Already have an account? Sign in</Link>
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
