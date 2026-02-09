"use client";

import { useState, useEffect, Suspense } from "react";
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
  FieldDescription,
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Suspense fallback={<div className="bg-muted relative hidden md:block overflow-hidden h-full min-h-96" />}>
            <div className="bg-muted relative hidden md:block overflow-hidden h-full min-h-96">
              <img
                src="/logo.jpg"
                alt="Login Image"
                loading="eager"
                className="w-full h-full object-cover dark:brightness-[0.2] dark:grayscale"
              />
            </div>
          </Suspense>
          <div className="flex flex-col items-center w-full py-8">
            {/* The Logo Container */}
            <Suspense fallback={<div className="w-32 h-32 bg-muted rounded" />}>
              <div className="mb-4">
                <img
                  src="/logo.jpg"
                  alt="Mzigo Logo"
                  loading="eager"
                  className="w-32 h-32 object-contain"
                />
              </div>
            </Suspense>

            {/* The Form */}
            <div className="w-full">
              <form className="p-8 md:p-12" onSubmit={handleSubmit}>
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-3xl font-bold">Welcome</h1>
                    <p className="text-muted-foreground text-base text-balance">
                      Sign in to your account to continue
                    </p>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="idNumber" className="text-base">Username</FieldLabel>
                    <Input
                      id="idNumber"
                      type="text"
                      placeholder="
                      
                      username"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      disabled={isLoading}
                      required
                      className="py-3 text-lg"
                    />
                  </Field>
                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="passPhrase" className="text-base">Password</FieldLabel>
                    </div>
                    <Input
                      id="passPhrase"
                      type="password"
                      placeholder="*********"
                      value={passPhrase}
                      onChange={(e) => setPassPhrase(e.target.value)}
                      disabled={isLoading}
                      required
                      className="py-3 text-lg"
                    />
                  </Field>
                  <Field>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
