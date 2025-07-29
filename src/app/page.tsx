"use client";

import { AuthForm } from "@/components/auth/AuthForm";
import { SwapWidget } from "@/components/swap/SwapWidget";
import { LoadingSpinner } from "@/components/ui";
import { useIsInitialized, useIsSignedIn } from "@coinbase/cdp-hooks";

export default function HomePage() {
  const isInitialized = useIsInitialized();
  const isSignedIn = useIsSignedIn();

  if (!isInitialized) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      {!isSignedIn ? <AuthForm /> : <SwapWidget />}
    </main>
  );
}
