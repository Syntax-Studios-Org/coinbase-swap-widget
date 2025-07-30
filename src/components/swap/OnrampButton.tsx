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
import Image from "next/image";

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
        <div className="relative mt-4 p-[1px] rounded-[1rem] bg-[conic-gradient(from_180deg_at_50%_50%,#79DBD2_0deg,#45E1E5_90deg,#B82EA4_172.8deg,#FF9533_230.4deg,#0052FF_306deg,#7FD057_360deg)] cursor-pointer">
          <div className="rounded-[1rem] p-4 bg-[#0A0B0D] flex justify-between">
            <div>
              <p className="text-white font-normal tracking-tight text-base">Buy Crypto with ease</p>
              <p className="text-white/60 text-[13px] tracking-tight">Buying and transferring USDC on Base is free</p>
            </div>
            <Image src={'/onramp-bg-img.svg'} alt="Onramp Background Image" width={72} height={36} />
          </div>
        </div>
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
