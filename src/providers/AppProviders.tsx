"use client";

import { CDPHooksProvider } from "@coinbase/cdp-hooks";
import { QueryProvider } from "./QueryProvider";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const projectId = process.env.NEXT_PUBLIC_CDP_PROJECT_ID;

  if (!projectId) {
    throw new Error("NEXT_PUBLIC_CDP_PROJECT_ID is required");
  }

  return (
    <QueryProvider>
      <CDPHooksProvider
        config={{
          projectId,
        }}
      >
        {children}
      </CDPHooksProvider>
    </QueryProvider>
  );
}
