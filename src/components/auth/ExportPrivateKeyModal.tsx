"use client";

import { useState } from "react";
import { EyeOff, Eye, Copy, Check, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui";
import { useExportEvmAccount, useEvmAddress } from "@coinbase/cdp-hooks";

interface ExportPrivateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportPrivateKeyModal({ isOpen, onClose }: ExportPrivateKeyModalProps) {
  const evmAddress = useEvmAddress();
  const exportEvmAccount = useExportEvmAccount();

  const [privateKey, setPrivateKey] = useState<string>("");
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [hasExported, setHasExported] = useState(false);

  const handleExportPrivateKey = async () => {
    if (!evmAddress || isExporting) return;

    try {
      setIsExporting(true);
      const { privateKey: exportedKey } = await exportEvmAccount({ evmAccount: evmAddress });
      setPrivateKey(exportedKey);
      setHasExported(true);
    } catch (error) {
      console.error("Failed to export private key:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!privateKey || isCopied) return;

    try {
      await navigator.clipboard.writeText(privateKey);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const handleClose = () => {
    setPrivateKey("");
    setIsKeyVisible(false);
    setHasExported(false);
    setIsCopied(false);
    onClose();
  };

  // Export private key when modal opens
  if (isOpen && !hasExported && !isExporting) {
    handleExportPrivateKey();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md bg-[#141519] border border-[#292B30] text-white">
        <DialogHeader>
          <DialogTitle className="text-white text-sm font-normal">
            Export Private Key
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Header Text */}
          <div className="text-center">
            <h3 className="text-white font-medium">Your private key</h3>
            <p className="text-sm text-[#8B919D]">For your eyes only. Do not share.</p>
          </div>

          {/* Private Key Display */}
          <div className="relative">
            <div className="border border-[#292B30] rounded-lg p-4 bg-[#1A1B1F] relative">
              <div className={`font-mono text-sm break-all ${!isKeyVisible ? 'blur-sm select-none' : ''}`}>
                {isExporting ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                ) : (
                  privateKey || "Loading..."
                )}
              </div>

              {hasExported && (
                <button
                  onClick={() => setIsKeyVisible(!isKeyVisible)}
                  className="absolute bottom-3 right-3 p-1 hover:bg-white/10 rounded transition-colors"
                >
                  {isKeyVisible ? (
                    <Eye className="w-4 h-4 text-[#8B919D]" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-[#8B919D]" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Copy Button */}
          <Button
            onClick={handleCopyToClipboard}
            disabled={!hasExported || !privateKey || isCopied}
            className="w-full h-12 bg-white hover:bg-white/90 text-black rounded-full font-medium"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied to Clipboard
              </>
            ) : (
              <>
                Copy to Clipboard
              </>
            )}
          </Button>

          {/* Security Notice */}
          <div className="relative my-6 -mx-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#292B30]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#141519] px-3 text-xs text-[#8B919D] border border-[#292B30] rounded-full">
                Keep your private key secret
              </span>
            </div>
          </div>

          {/* Security Bullet Points */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-[#4672ED] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#8B919D]">
                Your Private key is like your password for your wallet
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-[#4672ED] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#8B919D]">
                If someone gets it they can drain your wallet
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-[#4672ED] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#8B919D]">
                Never share it with anyone - no person, website or app
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
