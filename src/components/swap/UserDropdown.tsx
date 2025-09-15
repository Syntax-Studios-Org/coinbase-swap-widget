"use client";

import { ChevronDown, Copy, Download, LogOut, Check } from "lucide-react";
import {
  useEvmAddress,
  useSignOut,
} from "@coinbase/cdp-hooks";
import { truncateAddress } from "@/utils/format";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { ExportPrivateKeyModal } from "@/components/auth/ExportPrivateKeyModal";
import { useState } from "react";

export function UserDropdown() {
  const evmAddress = useEvmAddress();
  const signOut = useSignOut();

  const [addressCopied, setAddressCopied] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const copyAddress = async () => {
    if (evmAddress && !addressCopied) {
      await navigator.clipboard.writeText(evmAddress);
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    }
  };

  const openExportModal = () => {
    setIsExportModalOpen(true);
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
            <button
              onClick={copyAddress}
              className="p-1 hover:bg-white/10 rounded"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          {/* Export Private Key */}
          <DropdownMenuItem
            onClick={openExportModal}
            className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer p-0"
            title="Export your private key - Keep it safe!"
          >
            <div className="flex items-center space-x-3 w-full p-2">
              <Download className="w-4 h-4" />
              <span className="text-sm">Export Private Key</span>
            </div>
          </DropdownMenuItem>

          {/* Sign Out */}
          <div className="pt-2 border-t border-white/10">
            <button
              onClick={signOut}
              className="flex items-center space-x-3 w-full p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </DropdownMenuContent>

      <ExportPrivateKeyModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </DropdownMenu>
  );
}
