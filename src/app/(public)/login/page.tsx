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

// You'll need to implement your own icons or import from a library like lucide-react
import {
  Camera as IconSpinner,
} from "lucide-react";
import { Icons } from "@/components/ui/icons";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState("start");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Implement your authentication logic here
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep("verifications");
    }, 1000);
  };

  const handleSocialAuth = (provider: string) => {
    setIsLoading(true);
    // Implement your social authentication logic here
    console.log(`Authenticating with ${provider}`);
    setIsLoading(false);
  };

  const renderStartStep = () => (
    <Card className="w-full item-center justify-center sm:w-96">
      <CardHeader>
        <CardTitle>Sign in to Acme Co</CardTitle>
        <CardDescription>
          Welcome back! Please sign in to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-y-4">
        <div className="grid grid-cols-2 gap-x-4">
          <Button
            size="sm"
            variant="outline"
            type="button"
            disabled={isLoading}
            onClick={() => handleSocialAuth("github")}
          >
            {isLoading ? (
              <IconSpinner className="size-4 animate-spin" />
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
            onClick={() => handleSocialAuth("google")}
          >
            {isLoading ? (
              <IconSpinner className="size-4 animate-spin" />
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
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </CardContent>
      <CardFooter>
        <div className="grid w-full gap-y-4">
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <IconSpinner className="size-4 animate-spin" />
            ) : (
              "Continue"
            )}
          </Button>
          <Button variant="link" size="sm" asChild>
            <Link href="/signup">Don&apos;t have an account? Sign up</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );

  const renderVerificationStep = () => (
    <Card className="w-full sm:w-96">
      <CardHeader>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>
          Enter the verification code sent to your email
        </CardDescription>
        <p className="text-sm text-muted-foreground">Welcome back {email}</p>
      </CardHeader>
      <CardContent className="grid gap-y-4">
        <div className="grid gap-y-2 items-center justify-center">
          <div className="flex justify-center gap-2">
            {verificationCode.map((digit, index) => (
              <Input
                key={index}
                type="text"
                maxLength={1}
                className="w-9 h-9 text-center"
                value={digit}
                onChange={(e) => {
                  const newCode = [...verificationCode];
                  newCode[index] = e.target.value;
                  setVerificationCode(newCode);

                  // Auto-focus next input
                  if (e.target.value && index < 5) {
                    const nextInput = document.querySelector(
                      `input[name=code-${index + 1}]`
                    );
                    nextInput?.focus();
                  }
                }}
                name={`code-${index}`}
              />
            ))}
          </div>
          <Button variant="link" size="sm" className="text-muted-foreground">
            Didn&apos;t receive a code? Resend
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <div className="grid w-full gap-y-4">
          <Button disabled={isLoading}>
            {isLoading ? (
              <IconSpinner className="size-4 animate-spin" />
            ) : (
              "Continue"
            )}
          </Button>
          <Button
            size="sm"
            variant="link"
            onClick={() => setCurrentStep("start")}
          >
            Go back
          </Button>
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <div className="grid w-full grow items-center px-4 sm:justify-center">
      {currentStep === "start" ? renderStartStep() : renderVerificationStep()}
    </div>
  );
}
