"use client";

import { useState, useEffect } from "react";
import { CreditCard } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";
import { OnrampModal } from "./OnrampModal";
import { useIsSignedIn } from "@coinbase/cdp-hooks";

export function OnrampButton() {
  const [isOpen, setIsOpen] = useState(false);
  const isSignedIn = useIsSignedIn();

  // Close modal when user is not signed in
  useEffect(() => {
    if (!isSignedIn && isOpen) {
      setIsOpen(false);
    }
  }, [isSignedIn, isOpen]);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-2 text-xs"
          disabled={!isSignedIn}
          title={
            !isSignedIn
              ? "Please sign in to buy crypto"
              : "Buy crypto with fiat"
          }
        >
          <CreditCard className="h-3 w-3 mr-1" />
          Buy Crypto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buy USDC on Base</DialogTitle>
        </DialogHeader>
        <OnrampModal onClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
}
