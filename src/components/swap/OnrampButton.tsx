"use client";

import { useState } from "react";
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

export function OnrampButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
          <CreditCard className="h-3 w-3 mr-1" />
          Buy Crypto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buy Crypto with Fiat</DialogTitle>
        </DialogHeader>
        <OnrampModal onClose={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
