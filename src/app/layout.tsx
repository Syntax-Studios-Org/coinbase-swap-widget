import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/providers/AppProviders";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export const metadata: Metadata = {
  title: "Coinbase CDP Swap Widget",
  description:
    "A production-ready swap widget built with Coinbase Developer Platform",
  keywords: ["coinbase", "cdp", "swap", "crypto", "web3"],
  authors: [{ name: "Coinbase Developer Platform" }],
  openGraph: {
    title: "Coinbase CDP Swap Widget",
    description:
      "A production-ready swap widget built with Coinbase Developer Platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={"font-coinbase-sans"}>
        <ErrorBoundary>
          <AppProviders>{children}</AppProviders>
        </ErrorBoundary>
      </body>
    </html>
  );
}
