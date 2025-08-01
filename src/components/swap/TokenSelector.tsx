"use client";

import { useState, useMemo } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import Image from "next/image";
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
import { NETWORKS } from "@/constants/config";

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

  const tokens = useMemo(() => Object.values(SUPPORTED_NETWORKS[network]), [network]);
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
                <Image
                  src={selectedToken.logoUrl}
                  alt={selectedToken.symbol}
                  className="rounded-full"
                  width={20}
                  height={20}
                />
              )}
              <span className="text-white text-sm font-medium">
                {selectedToken.symbol}
              </span>
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

      <DialogContent className="sm:max-w-md bg-[#141519] border-white/10 p-3 py-5 max-h-[80vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-white text-md font-normal -mt-2">
            Select a token
          </DialogTitle>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative -mt-5">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Search tokens"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-3 bg-[#292B30] border-white/10 text-white placeholder-white/40 rounded-full h-12 text-sm"
          />
        </div>

        {/* Network Filter Tabs */}
        <div className="flex items-center space-x-2 max-h-8">
          {Object.entries(NETWORKS).map(([key, networkInfo]) => (
            <button
              key={key}
              className={`flex items-center space-x-2 px-2 py-1.5 rounded-full text-sm tracking-tight ${
                network === key.toLowerCase()
                  ? "bg-white text-[#0A0B0D]"
                  : "bg-[#292B30] text-white/60 hover:bg-white/10"
              }`}
            >
              <Image
                src={networkInfo.logoUrl}
                alt={networkInfo.name}
                width={16}
                height={16}
              />
              <span>{networkInfo.name}</span>
            </button>
          ))}
        </div>

        {/* Separator - Always visible */}
        <div className="relative -mx-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[#8B919D] text-xs font-normal tracking-tight uppercase">
            Your Tokens
          </span>
          <span className="text-[#8B919D] text-xs font-normal tracking-tight uppercase">
            Balance
          </span>
        </div>

        {/* Token List */}
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {availableTokens.length === 0 ? (
            <div className="text-center py-6 text-white/60 text-sm">
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
                    <div className="relative flex-shrink-0">
                      {token.logoUrl ? (
                        <Image
                          src={token.logoUrl}
                          alt={token.symbol}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#0052FF]/20 flex items-center justify-center">
                          <span className="text-sm font-semibold text-[#0052FF]">
                            {token.symbol.charAt(0)}
                          </span>
                        </div>
                      )}
                      {/* Network indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-sm bg-white">
                        <Image
                          src={
                            NETWORKS[network === "base" ? "Base" : network]?.logoUrl ||
                            "/icons/base.svg"
                          }
                          alt={network}
                          width={14}
                          height={14}
                          className="rounded"
                        />
                      </div>
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <div className="font-normal text-sm text-white truncate tracking-tight">
                        {token.name}
                      </div>
                      <div className="text-xs text-[#8B919D] truncate tracking-tight">
                        ${token.symbol}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="font-normal text-sm text-white tracking-tight">
                        {balance?.formattedBalance || "0.00"}
                      </div>
                      <div className="text-xs text-[#8B919D] tracking-tight">
                        ${balance?.usdValue?.toFixed(2) || "0.00"}
                      </div>
                    </div>

                    {selectedToken?.address === token.address && (
                      <Check className="h-4 w-4 text-[#0052FF] flex-shrink-0" />
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
