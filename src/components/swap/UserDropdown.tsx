"use client";

import { useState } from "react";
import { ChevronDown, Copy, LogOut, Settings } from "lucide-react";
import { useEvmAddress, useSignOut } from "@coinbase/cdp-hooks";
import { truncateAddress } from "@/utils/format";

interface UserDropdownProps {
  slippage: number;
  onSlippageChange: (value: number) => void;
}

export function UserDropdown({ slippage, onSlippageChange }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [slippageInput, setSlippageInput] = useState(slippage.toString());
  const evmAddress = useEvmAddress();
  const signOut = useSignOut();

  const copyAddress = async () => {
    if (evmAddress) {
      await navigator.clipboard.writeText(evmAddress);
    }
  };

  const handleSlippageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSlippageInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 50) {
      onSlippageChange(numValue);
    }
  };

  if (!evmAddress) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors"
      >
        <div className="w-5 h-5 bg-white rounded-full"></div>
        <span className="text-sm font-medium">{truncateAddress(evmAddress)}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-[#1A1B1F] border border-white/10 rounded-lg shadow-lg z-20 p-3 space-y-3">
            {/* Address with copy */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/80">{truncateAddress(evmAddress)}</span>
              <div className="flex items-center space-x-2">
                <button onClick={copyAddress} className="p-1 hover:bg-white/10 rounded">
                  <img src="/copy.svg" alt="Copy" className="w-4 h-4" />
                </button>
                <button onClick={signOut} className="p-1 hover:bg-white/10 rounded">
                  <img src="/logout.svg" alt="Logout" className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slippage Setting */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img src="/settings-gear.svg" alt="Settings" className="w-4 h-4" />
                <span className="text-sm text-white">Set slippage</span>
              </div>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={slippageInput}
                  onChange={handleSlippageChange}
                  className="w-12 h-6 text-xs bg-white/10 border border-white/20 rounded px-1 text-white text-center"
                  min="0"
                  max="50"
                  step="0.1"
                />
                <span className="text-xs text-white/60">%</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
