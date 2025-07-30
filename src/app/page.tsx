"use client";

import { SwapWidget } from "@/components/swap/SwapWidget";
import { LoadingSpinner } from "@/components/ui";
import { useIsInitialized } from "@coinbase/cdp-hooks";

export default function HomePage() {
  const isInitialized = useIsInitialized();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0B0D' }}>
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-white/60">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0B0D' }}>
      <nav className="flex items-center p-6">
        <img
          src="/icons/base.svg"
          alt="Base"
          className="w-8 h-8"
        />
      </nav>

      <main className="flex items-center justify-center px-4" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <SwapWidget />
      </main>
    </div>
  );
}
