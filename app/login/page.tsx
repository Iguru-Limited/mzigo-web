import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

function LoginFormWrapper() {
  return (
    <div className="bg-muted flex min-h-screen flex-col items-center justify-center p-4 md:p-6 lg:p-10">
      <div className="w-full max-w-6xl">
        <LoginForm />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="bg-muted flex min-h-screen flex-col items-center justify-center p-6 md:p-10">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <LoginFormWrapper />
    </Suspense>
  );
}

