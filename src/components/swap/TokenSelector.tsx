"use client";

import { useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
} from "@/components/ui";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { SUPPORTED_NETWORKS } from "@/constants/tokens";
import type { Token } from "@/types/swap";
import type { SupportedNetwork } from "@/constants/tokens";

interface TokenSelectorProps {
  selectedToken: Token | null;
  onTokenSelect: (token: Token) => void;
  network: SupportedNetwork;
  label: string;
  excludeToken?: Token | null;
}

export function TokenSelector({
  selectedToken,
  onTokenSelect,
  network,
  label,
  excludeToken,
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const tokens = Object.values(SUPPORTED_NETWORKS[network]);
  const { data: balances } = useTokenBalances(network, tokens);

  const availableTokens = tokens.filter(
    (token) =>
      (!excludeToken || token.address !== excludeToken.address) &&
      (searchQuery === "" ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.name.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  // Get token balance
  const getTokenBalance = (tokenAddress: string) => {
    return balances?.find(
      (b) => b.token.address.toLowerCase() === tokenAddress.toLowerCase(),
    );
  };

  const handleTokenSelect = (token: Token) => {
    onTokenSelect(token);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-3/4 justify-between h-12 px-3">
          {selectedToken ? (
            <div className="flex items-center space-x-2">
              {selectedToken.logoUrl && (
                <img
                  src={selectedToken.logoUrl}
                  alt={selectedToken.symbol}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <div className="text-left">
                <div className="font-medium">{selectedToken.symbol}</div>
                <div className="text-xs text-muted-foreground">
                  {selectedToken.name}
                </div>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">Select {label}</span>
          )}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select {label}</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-1 max-h-96 overflow-y-auto">
          {availableTokens.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tokens found
            </div>
          ) : (
            availableTokens.map((token) => {
              const balance = getTokenBalance(token.address);
              return (
                <Button
                  key={token.address}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3 hover:bg-muted"
                  onClick={() => handleTokenSelect(token)}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div className="relative">
                      {token.logoUrl ? (
                        <img
                          src={token.logoUrl}
                          alt={token.symbol}
                          className="w-10 h-10 rounded-full"
                          onError={(e) => {
                            e.currentTarget.src = `https://via.placeholder.com/40/6366f1/ffffff?text=${token.symbol.charAt(0)}`;
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {token.symbol.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 text-left">
                      <div className="font-medium text-base">
                        {token.symbol}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {token.name}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-medium">
                        {balance?.formattedBalance || "0.000000"}
                      </div>
                      {balance?.usdValue && balance.usdValue > 0 && (
                        <div className="text-sm text-muted-foreground">
                          ${balance.usdValue.toFixed(2)}
                        </div>
                      )}
                    </div>

                    {selectedToken?.address === token.address && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </Button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
