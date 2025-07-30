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
        <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 transition-colors rounded-full px-2 py-1.5 min-w-[103px] h-9">
          {selectedToken ? (
            <>
              {selectedToken.logoUrl && (
                <img
                  src={selectedToken.logoUrl}
                  alt={selectedToken.symbol}
                  className="w-5 h-5 rounded-full"
                />
              )}
              <span className="text-white text-sm font-medium">{selectedToken.symbol}</span>
              <ChevronDown className="h-3 w-3 text-white/60" />
            </>
          ) : (
            <>
              <span className="text-white/60 text-sm">Select {label}</span>
              <ChevronDown className="h-3 w-3 text-white/60" />
            </>
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-[#1A1B1F] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Select {label}</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#2A2B2F] border-white/10 text-white placeholder-white/40"
          />
        </div>

        <div className="space-y-1 max-h-96 overflow-y-auto">
          {availableTokens.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              No tokens found
            </div>
          ) : (
            availableTokens.map((token) => {
              const balance = getTokenBalance(token.address);
              return (
                <button
                  key={token.address}
                  className="w-full p-3 hover:bg-white/5 rounded-lg transition-colors"
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
                        <div className="w-10 h-10 rounded-full bg-[#0052FF]/20 flex items-center justify-center">
                          <span className="text-sm font-semibold text-[#0052FF]">
                            {token.symbol.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 text-left">
                      <div className="font-medium text-base text-white">
                        {token.symbol}
                      </div>
                      <div className="text-sm text-white/60">
                        {token.name}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-medium text-white">
                        {balance?.formattedBalance || "0.000000"}
                      </div>
                      {balance?.usdValue && balance.usdValue > 0 && (
                        <div className="text-sm text-white/60">
                          ${balance.usdValue.toFixed(2)}
                        </div>
                      )}
                    </div>

                    {selectedToken?.address === token.address && (
                      <Check className="h-5 w-5 text-[#0052FF]" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
