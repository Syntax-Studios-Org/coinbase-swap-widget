"use client";

import { useState } from "react";
import { DollarSign, AlertCircle } from "lucide-react";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  LoadingSpinner,
} from "@/components/ui";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { useUSDCOnramp } from "@/hooks/useOnramp";
import { ONRAMP_CONFIG, SUPPORTED_FIAT_CURRENCIES } from "@/constants/config";
import type { SupportedFiatCurrency } from "@/types/onramp";

interface OnrampModalProps {
  onClose: () => void;
}

export function OnrampModal({ onClose }: OnrampModalProps) {
  const [usdAmount, setUsdAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] =
    useState<SupportedFiatCurrency>("USD");
  const [amountError, setAmountError] = useState("");

  const { openUSDCOnramp, state } = useUSDCOnramp();

  const validateAmount = (amount: string): boolean => {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setAmountError("Please enter a valid amount");
      return false;
    }

    if (numAmount < ONRAMP_CONFIG.minAmount) {
      setAmountError(`Minimum amount is $${ONRAMP_CONFIG.minAmount}`);
      return false;
    }

    if (numAmount > ONRAMP_CONFIG.maxAmount) {
      setAmountError(`Maximum amount is $${ONRAMP_CONFIG.maxAmount}`);
      return false;
    }

    setAmountError("");
    return true;
  };

  const handleBuyCrypto = async () => {
    if (!validateAmount(usdAmount)) {
      return;
    }

    try {
      await openUSDCOnramp(parseFloat(usdAmount), selectedCurrency);
      // Don't close the modal immediately - let user see the loading state
      // The modal will close when they return from Coinbase Pay
    } catch (error) {
      console.error("Failed to open onramp:", error);
      // Error is handled by the hook and displayed in the UI
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {state.error && <ErrorMessage message={state.error} />}

      {/* Amount Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Amount</label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="number"
            placeholder={`${ONRAMP_CONFIG.minAmount} - ${ONRAMP_CONFIG.maxAmount}`}
            value={usdAmount}
            onChange={(e) => {
              setUsdAmount(e.target.value);
              if (amountError) setAmountError("");
            }}
            className="pl-10"
            disabled={state.isLoading}
            min={ONRAMP_CONFIG.minAmount}
            max={ONRAMP_CONFIG.maxAmount}
          />
        </div>
        {amountError && (
          <div className="flex items-center space-x-1 text-sm text-red-600">
            <AlertCircle className="h-3 w-3" />
            <span>{amountError}</span>
          </div>
        )}
      </div>

      {/* Currency Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Currency</label>
        <Select
          value={selectedCurrency}
          onValueChange={(value) =>
            setSelectedCurrency(value as SupportedFiatCurrency)
          }
          disabled={state.isLoading}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SUPPORTED_FIAT_CURRENCIES).map(
              ([code, currency]) => (
                <SelectItem key={code} value={code}>
                  {currency.name} ({currency.symbol})
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Network Display (Fixed to Base) */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Network</label>
        <div className="p-3 bg-muted rounded-md">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium">Base Mainnet</span>
          </div>
        </div>
      </div>

      {/* Asset Display (Fixed to USDC) */}
      <div className="space-y-2">
        <label className="text-sm font-medium">You'll Receive</label>
        <div className="p-3 bg-muted rounded-md">
          <div className="flex items-center space-x-2">
            <img
              src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png"
              alt="USDC"
              className="w-4 h-4 rounded-full"
            />
            <span className="text-sm font-medium">USDC (USD Coin)</span>
          </div>
        </div>
      </div>

      {/* Amount Summary */}
      {usdAmount && !amountError && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-semibold">
              ${usdAmount} {selectedCurrency}
            </div>
            <div className="text-sm text-muted-foreground">
              You'll receive USDC on Base network
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1"
          disabled={state.isLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleBuyCrypto}
          className="flex-1"
          disabled={
            !usdAmount ||
            parseFloat(usdAmount) <= 0 ||
            !!amountError ||
            state.isLoading
          }
        >
          {state.isLoading ? (
            <div className="flex items-center space-x-2">
              <LoadingSpinner size="sm" />
              <span>Opening Coinbase Pay...</span>
            </div>
          ) : (
            "Continue to Coinbase Pay"
          )}
        </Button>
      </div>

      {/* Footer Info */}
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <div>Powered by Coinbase Pay</div>
        <div>Secure • Fast • Trusted</div>
      </div>
    </div>
  );
}
