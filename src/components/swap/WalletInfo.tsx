"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui";
import { truncateAddress } from "@/utils/format";

interface WalletInfoProps {
  address: string;
  onCopy: () => void;
}

export function WalletInfo({ address, onCopy }: WalletInfoProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm font-medium">Connected</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-mono">{truncateAddress(address)}</span>
        <Button variant="ghost" size="icon" onClick={onCopy} className="h-6 w-6">
          <Copy className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}