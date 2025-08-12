"use client";

import { ChevronDown } from "lucide-react";
import { useEvmAddress, useSignOut } from "@coinbase/cdp-hooks";
import { truncateAddress } from "@/utils/format";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import Image from "next/image";

export function UserDropdown() {
  const evmAddress = useEvmAddress();
  const signOut = useSignOut();

  const copyAddress = async () => {
    if (evmAddress) {
      await navigator.clipboard.writeText(evmAddress);
    }
  };

  if (!evmAddress) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors">
          <div className="w-5 h-5 bg-white rounded-full"></div>
          <span className="text-sm font-medium">
            {truncateAddress(evmAddress)}
          </span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 bg-[#1A1B1F] border border-white/10"
        align="end"
      >
        <div className="p-3 space-y-3">
          {/* Address with copy */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/80">
              {truncateAddress(evmAddress)}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={copyAddress}
                className="p-1 hover:bg-white/10 rounded"
              >
                <Image width={16} height={16} src="/copy.svg" alt="Copy" />
              </button>
              <button
                onClick={signOut}
                className="p-1 hover:bg-white/10 rounded"
              >
                <Image width={16} height={16} src="/logout.svg" alt="Logout" />
              </button>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
