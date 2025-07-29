"use client";

import { useState } from "react";
import { DollarSign, ArrowRight } from "lucide-react";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { SUPPORTED_NETWORKS } from "@/constants/tokens";

interface OnrampModalProps {
  onClose: () => void;
}

export function OnrampModal({ onClose }: OnrampModalProps) {
  const [usdAmount, setUsdAmount] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState("USDC");
  const [network, setNetwork] = useState("base");

  const tokens = Object.values(
    SUPPORTED_NETWORKS[network as keyof typeof SUPPORTED_NETWORKS],
  );
  const estimatedCrypto =
    selectedCrypto === "USDC"
      ? usdAmount
      : selectedCrypto === "ETH"
        ? (parseFloat(usdAmount || "0") / 2500).toFixed(6)
        : usdAmount;

  const handleBuyCrypto = () => {
    console.log("Buy crypto:", { usdAmount, selectedCrypto, network });
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Amount (USD)</label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="number"
            placeholder="100"
            value={usdAmount}
            onChange={(e) => setUsdAmount(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Network</label>
        <Select value={network} onValueChange={setNetwork}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="base">Base</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Receive</label>
        <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tokens.map((token) => (
              <SelectItem key={token.address} value={token.symbol}>
                <div className="flex items-center space-x-2">
                  {token.logoUrl && (
                    <img
                      src={token.logoUrl}
                      alt={token.symbol}
                      className="w-4 h-4 rounded-full"
                    />
                  )}
                  <span>{token.symbol}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {usdAmount && (
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-lg font-semibold">${usdAmount}</div>
              <div className="text-sm text-muted-foreground">USD</div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="text-center">
              <div className="text-lg font-semibold">≈ {estimatedCrypto}</div>
              <div className="text-sm text-muted-foreground">
                {selectedCrypto}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-3">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleBuyCrypto}
          className="flex-1"
          disabled={!usdAmount || parseFloat(usdAmount) <= 0}
        >
          Continue to Payment
        </Button>
      </div>

      <div className="text-xs text-muted-foreground text-center">
        Onramp powered by Coinbase. Rates are estimates and may vary.
      </div>
    </div>
  );
}
