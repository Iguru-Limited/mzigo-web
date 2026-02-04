"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [idNumber, setIdNumber] = useState("");
  const [passPhrase, setPassPhrase] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const { data: session, status, update } = useSession();

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push(callbackUrl);
    }
  }, [status, session, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        id_number: idNumber,
        pass_phrase: passPhrase,
        redirect: false,
        callbackUrl: callbackUrl,
      });

      if (result?.error) {
        toast.error("Login Failed", {
          description: result.error || "Invalid phone number or password. Please try again.",
        });
        setIsLoading(false);
      } else if (result?.ok) {
        toast.success("Login Successful", {
          description: "Redirecting to dashboard...",
        });
        // Update session to ensure it's available
        await update();
        // Wait a bit longer for the session cookie to be set server-side
        // The proxy will handle the redirect when it detects the token
        setTimeout(() => {
          // Force a full page reload to ensure the proxy sees the token
          window.location.href = callbackUrl;
        }, 500);
      } else {
        toast.error("Login Failed", {
          description: "Unexpected response. Please try again.",
        });
        setIsLoading(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred. Please try again.";
      toast.error("Login Failed", {
        description: errorMessage,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 w-full", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-sm md:text-base text-balance">
                  Login to your account to continue
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="id_number">Username</FieldLabel>
                <Input
                  id="id_number"
                  type="text"
                  placeholder="1234"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  required
                  disabled={isLoading}
                  className="text-base"
                />
              </Field>
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="pass_phrase">Password</FieldLabel>
                  <a
                    href="/forgot-password"
                    className="text-xs md:text-sm text-primary underline-offset-2 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="pass_phrase"
                  type="password"
                  value={passPhrase}
                  onChange={(e) => setPassPhrase(e.target.value)}
                  required
                  disabled={isLoading}
                  className="text-base"
                />
              </Field>
              <Field>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full text-base py-5"
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted-foreground px-6">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
