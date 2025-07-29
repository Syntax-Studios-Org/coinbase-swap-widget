"use client";

import { Button, Card, CardContent, CardSeparator } from "@/components/ui";
import { truncateAddress } from "@/utils/format";
import { useSignOut, useEvmAddress } from "@coinbase/cdp-hooks";
import type { User } from "@coinbase/cdp-hooks";

interface UserProfileProps {
  user: User;
}

export function UserProfile({ user }: UserProfileProps) {
  const signOut = useSignOut();
  const evmAddress = useEvmAddress();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };
  const displayAddress = evmAddress || user.evmAccounts?.[0];
  const truncatedAccount = displayAddress
    ? truncateAddress(displayAddress)
    : "No address";

  return (
    <div className="w-full max-w-md space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Welcome!</h1>
        <p className="text-sm text-muted-foreground">
          You are successfully signed in.
        </p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Primary Account
            </h3>
            <p className="mt-1 text-lg font-mono text-foreground">
              {truncatedAccount}
            </p>
          </div>

          {user.evmAccounts && user.evmAccounts.length > 1 && (
            <>
              <CardSeparator />
              <div>
                <p className="text-sm text-muted-foreground">
                  +{user.evmAccounts.length - 1} more account
                  {user.evmAccounts.length > 2 ? "s" : ""}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button variant="outline" className="w-full">
          View All Accounts
        </Button>
        <Button variant="secondary" onClick={handleSignOut} className="w-full">
          Sign Out
        </Button>
      </div>
    </div>
  );
}
