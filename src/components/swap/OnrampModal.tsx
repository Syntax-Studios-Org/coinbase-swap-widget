"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { useOnramp } from "@/hooks/useOnramp";
import { BASE_TOKENS } from "@/constants/tokens";
import Image from "next/image";
import { NETWORKS } from "@/constants/config";

interface OnrampModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnrampModal({ isOpen, onClose }: OnrampModalProps) {
  const [amount, setAmount] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("ETH");
  const [selectedNetwork, setSelectedNetwork] = useState("Base");
  const [paymentCurrency, setPaymentCurrency] = useState("USD");
  const [paymentMethod, setPaymentMethod] = useState("Debit Card");

  const { generateOnrampUrl, state: onrampState } = useOnramp();

  const handleAmountPreset = (value: number) => {
    setAmount(value.toString());
  };

  const handleCreateSession = async () => {
    if (!amount || onrampState.isLoading || onrampState.isGeneratingUrl) return;

    try {
      const sessionUrl = await generateOnrampUrl({
        destinationAddress: "0x" as any, // Will be replaced by actual address in hook
        fiatAmount: parseFloat(amount),
        fiatCurrency: paymentCurrency as any,
        cryptoAsset: selectedAsset as any,
        network: (NETWORKS[selectedNetwork].name.toLowerCase() || selectedNetwork.toLowerCase()) as any,
        paymentMethod: paymentMethod as any,
      });

      if (sessionUrl) {
        window.open(sessionUrl, "_blank");
        onClose();
      }
    } catch (error) {
      console.error("Failed to create onramp session:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#141519]">
        <DialogHeader>
          <DialogTitle>
            <p className="font-normal tracking-tight text-sm -mt-2">
              Select a token to buy
            </p>
          </DialogTitle>
        </DialogHeader>

        {/* Hero Section */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Image
              src={"/onramp-bg-img.svg"}
              alt="on-ramp"
              width={104}
              height={56}
            />
          </div>
          <h2 className="text-white text-[20px] font-medium leading-[120%] tracking-[-0.04em] mb-2">
            Buy crypto with ease
          </h2>
          <p className="text-white/60 text-[13px] font-normal leading-[120%] tracking-[-0.04em]">
            Buy crypto directly to your wallet
          </p>
        </div>

        <div className="space-y-4">
          {/* Asset and Network Selection Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[13px] font-normal mb-2 uppercase tracking-tight text-[#8B919D]">
                Select asset
              </label>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger className="w-full p-3 border border-[#292B30] rounded-sm bg-[#141519] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#141519] border-[#292B30]">
                  {Object.entries(BASE_TOKENS).map(([symbol, token]) => (
                    <SelectItem
                      key={symbol}
                      value={symbol}
                      className="text-white hover:bg-white/10"
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src={token.logoUrl || "/icons/eth.svg"}
                          alt={token.symbol}
                          width={20}
                          height={20}
                        />
                        <span>{token.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[13px] font-normal mb-2 uppercase tracking-tight text-[#8B919D]">
                Select network
              </label>
              <Select
                value={selectedNetwork}
                onValueChange={setSelectedNetwork}
              >
                <SelectTrigger className="w-full p-3 border border-[#292B30] rounded-sm bg-[#141519] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#141519] border-[#292B30]">
                  {Object.entries(NETWORKS).map(([key, network]) => (
                    <SelectItem
                      key={key}
                      value={key}
                      className="text-white hover:bg-white/10"
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src={network.logoUrl}
                          alt={network.name}
                          width={20}
                          height={20}
                        />
                        <span>{network.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amount Field */}
          <div>
            <label className="text-[13px] font-normal mb-2 uppercase tracking-tight text-[#8B919D]">
              Amount
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Image
                  src="/dollar-symbol.svg"
                  alt="USD"
                  width={16}
                  height={16}
                />
              </div>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 pl-10 pr-32 border border-[#292B30] rounded-sm bg-[#141519] text-white placeholder-white/40"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                <button
                  onClick={() => handleAmountPreset(20)}
                  className="px-2 py-1 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
                >
                  $20
                </button>
                <button
                  onClick={() => handleAmountPreset(50)}
                  className="px-2 py-1 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
                >
                  $50
                </button>
                <button
                  onClick={() => handleAmountPreset(100)}
                  className="px-2 py-1 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
                >
                  $100
                </button>
              </div>
            </div>
          </div>

          {/* Payment Currency */}
          <div>
            <label className="text-[13px] font-normal mb-2 uppercase tracking-tight text-[#8B919D]">
              Payment currency
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                <Image
                  src="/dollar-symbol.svg"
                  alt="USD"
                  width={16}
                  height={16}
                />
              </div>
              <Select
                value={paymentCurrency}
                onValueChange={setPaymentCurrency}
              >
                <SelectTrigger className="w-full p-3 pl-10 border border-[#292B30] rounded-sm bg-[#141519] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#141519] border-[#292B30]">
                  <SelectItem
                    value="USD"
                    className="text-white hover:bg-white/10"
                  >
                    US Dollar
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-[13px] font-normal mb-2 uppercase tracking-tight text-[#8B919D]">
              Payment method
            </label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="w-full p-3 border border-[#292B30] rounded-sm bg-[#141519] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#141519] border-[#292B30]">
                <SelectItem
                  value="Debit Card"
                  className="text-white hover:bg-white/10"
                >
                  Debit Card
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Secured by Coinbase Divider */}
          <div className="relative my-6 -mx-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#292B30]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#141519] px-3 text-xs text-[#8B919D] border border-[#292B30] rounded-full flex items-center gap-1">
                <Image src={"/lock.svg"} width={12} height={12} alt="lock" />
                Secured by <strong className="text-white">coinbase</strong>
              </span>
            </div>
          </div>

          {/* Request Link Button */}
          <Button
            onClick={handleCreateSession}
            disabled={!amount || onrampState.isLoading || onrampState.isGeneratingUrl}
            isLoading={onrampState.isLoading || onrampState.isGeneratingUrl}
            className="w-full h-12 bg-white hover:bg-white/90 text-black font-medium rounded-full"
          >
            Request link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
