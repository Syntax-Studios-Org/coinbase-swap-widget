"use client";

import { useState, useMemo, useCallback } from "react";
import { formatUnits, parseUnits } from "viem";
import { Button } from "@/components/ui";
import { UserDropdown } from "./UserDropdown";
import { SwapInput } from "./SwapInput";
import { ReviewTransactionModal } from "./ReviewTransactionModal";
import { ConnectWalletModal } from "../auth/ConnectWalletModal";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useSwap } from "@/hooks/useSwap";
import { useSend } from "@/hooks/useSend";
import { useEvmAddress, useIsSignedIn } from "@coinbase/cdp-hooks";
import { SUPPORTED_NETWORKS } from "@/constants/tokens";
import type { SupportedNetwork } from "@/constants/tokens";
import Image from "next/image";
import { OnrampButton } from "./OnrampButton";
import { getTokenDecimals, getTokenSymbol } from "@/utils/tokens";
import { SlippageSelectorDropdown } from "./SlippageSelectorDropdown";

export function SwapWidget() {
  const {
    // State
    fromToken,
    toToken,
    fromAmount,
    network,
    setFromToken,
    setToToken,
    setFromAmount,
    setNetwork,
    swapTokens,
    // Price data
    priceData,
    isPriceLoading,
    // Quote creation
    createQuote,
    isQuoteLoading,
    // Execution
    executeSwap,
    isExecutionLoading,
  } = useSwap();

  const {
    // Send execution
    executeSend,
    isExecutionLoading: isSendLoading,
    isValidAddress,
  } = useSend();

  const [activeTab, setActiveTab] = useState<"swap" | "send">("swap");
  const [toAddress, setToAddress] = useState("");
  const [slippage, setSlippage] = useState(1.0); // Slippage tolerance: max acceptable price movement %
  const [showTradeDetails, setShowTradeDetails] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const isSignedIn = useIsSignedIn();
  const evmAddress = useEvmAddress();

  const tokens = useMemo(() => {
    const supportedNetwork = SUPPORTED_NETWORKS[network as SupportedNetwork];
    return supportedNetwork ? Object.values(supportedNetwork) : [];
  }, [network]);
  const { data: balances, refetch: refetchBalances } = useTokenBalances(
    network as SupportedNetwork,
    tokens,
  );

  const getTokenBalance = (tokenAddress: string) => {
    return balances?.find(
      (b) => b.token.address.toLowerCase() === tokenAddress.toLowerCase(),
    );
  };

  // Handle network change and reset tokens
  const handleNetworkChange = useCallback(
    (newNetwork: SupportedNetwork) => {
      setNetwork(newNetwork);
      // Reset tokens when network changes since they might not exist on the new network
      setFromToken(null);
      setToToken(null);
      setFromAmount("");
    },
    [setNetwork, setFromToken, setToToken, setFromAmount],
  );

  // // Get swap price quote to check if swap is possible
  // const parsedAmount = useMemo(() => {
  //   try {
  //     return fromToken && fromAmount && !isNaN(Number(fromAmount))
  //       ? parseUnits(fromAmount, fromToken.decimals)
  //       : BigInt(0);
  //   } catch (error) {
  //     console.error("Error parsing amount:", error);
  //     return BigInt(0);
  //   }
  // }, [fromToken, fromAmount]);

  const quote = priceData;
  const isLoadingQuote = isPriceLoading;

  const handleMaxClick = () => {
    if (!fromToken) return;
    const balance = getTokenBalance(fromToken.address);
    if (balance) {
      const rawBalance = balance.balance;
      const formattedAmount = formatUnits(rawBalance, fromToken.decimals);
      setFromAmount(formattedAmount);
    }
  };

  const handleSwap = async () => {
    if (!canSwap) return;
    setShowReviewModal(true);
  };

  const handleConfirmSwap = async () => {
    if (!fromToken || !fromAmount) return;

    try {
      if (activeTab === "swap") {
        if (!toToken) return;
        
        const swapQuote = await createQuote({
          fromToken: fromToken.address,
          toToken: toToken.address,
          fromAmount: parseUnits(fromAmount, fromToken.decimals),
          network,
          taker: evmAddress!,
          slippageBps: Math.round(slippage * 100),
        });

        const result = await executeSwap({
          swapQuote,
          fromTokenAddress: fromToken.address,
          network,
        });

        await refetchBalances();
        return result;
      } else {
        // Send mode
        if (!toAddress) return;
        
        const result = await executeSend({
          token: fromToken,
          amount: fromAmount,
          toAddress,
          network,
        });

        await refetchBalances();
        return result;
      }
    } catch (error: any) {
      console.error(`${activeTab} failed:`, error);
      throw error;
    }
  };

  const handleConnectWallet = () => {
    setShowConnectModal(true);
  };

  // Validate amount first
  const isValidAmount =
    fromAmount && !isNaN(Number(fromAmount)) && Number(fromAmount) > 0;

  // Check for insufficient balance
  const hasInsufficientBalance = useMemo(() => {
    if (activeTab === "swap") {
      return Boolean(quote?.issues?.balance);
    } else {
      // Send mode - check if user has enough balance
      if (!fromToken || !fromAmount || !isValidAmount) return false;
      
      const balance = getTokenBalance(fromToken.address);
      if (!balance) return false;
      
      try {
        const amountBigInt = parseUnits(fromAmount, fromToken.decimals);
        return amountBigInt > balance.balance;
      } catch (error) {
        return false;
      }
    }
  }, [activeTab, quote, fromToken, fromAmount, getTokenBalance, isValidAmount]);
  const isValidToAddress = activeTab === "send" ? isValidAddress(toAddress) : true;

  const isLoading = isQuoteLoading || isExecutionLoading || isSendLoading;

  const canSwap = Boolean(
    isSignedIn &&
      fromToken &&
      (activeTab === "swap" ? toToken : true) &&
      isValidAmount &&
      isValidToAddress &&
      !hasInsufficientBalance &&
      (activeTab === "swap" ? quote && !isLoadingQuote : true),
  );

  // Determine button text and state
  const getButtonState = () => {
    if (!isSignedIn) return { text: "Connect Wallet", disabled: false };
    if (!fromToken) return { text: "Select token", disabled: true };
    if (activeTab === "swap" && !toToken)
      return { text: "Select tokens", disabled: true };
    if (!isValidAmount) return { text: "Enter amount", disabled: true };
    if (activeTab === "send" && !isValidToAddress)
      return { text: "Enter valid address", disabled: true };
    if (hasInsufficientBalance)
      return { text: "Insufficient balance", disabled: true };
    if (activeTab === "swap" && isLoadingQuote)
      return { text: "Getting quote...", disabled: true };
    if (isLoading)
      return {
        text: activeTab === "swap" ? "Swapping..." : "Sending...",
        disabled: true,
      };
    return { text: activeTab === "swap" ? "Swap" : "Send", disabled: false };
  };

  const buttonState = getButtonState();

  return (
    <div className="w-full max-w-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center bg-[#141519] rounded-full p-1">
          <button
            onClick={() => setActiveTab("swap")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === "swap"
                ? "bg-white text-black"
                : "text-white/60 hover:text-white"
            }`}
          >
            Swap
          </button>
          <button
            onClick={() => setActiveTab("send")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === "send"
                ? "bg-white text-black"
                : "text-white/60 hover:text-white"
            }`}
          >
            Send
          </button>
        </div>
        {isSignedIn && (
          <div className="flex items-center space-x-2">
            <UserDropdown />
            <SlippageSelectorDropdown
              slippage={slippage}
              onSlippageChange={setSlippage}
            />
          </div>
        )}
      </div>

      <div className="rounded-2xl relative overflow-hidden flex flex-col">
        {/* First section - From/Sending */}
        <SwapInput
          label={activeTab === "swap" ? "You're paying" : "Sending"}
          token={fromToken}
          amount={fromAmount}
          onTokenSelect={setFromToken}
          onAmountChange={setFromAmount}
          balance={fromToken ? getTokenBalance(fromToken.address) : null}
          onMaxClick={handleMaxClick}
          network={network as SupportedNetwork}
          excludeToken={activeTab === "swap" ? toToken : null}
          hasError={hasInsufficientBalance}
          onNetworkChange={handleNetworkChange}
        />

        {/* Separator line with swap button */}
        <div className="relative bg-[#0A0B0D] h-[3px]">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <button
              onClick={activeTab === "swap" ? swapTokens : undefined}
              className="bg-[#141519] border-2 border-[#0A0B0D] rounded-md p-2 hover:bg-[#1A1B1F] transition-colors"
            >
              <Image src="/swap.svg" alt="Swap" width={20} height={20} />
            </button>
          </div>
        </div>

        {/* Second section - To receive or To address */}
        {activeTab === "swap" ? (
          <SwapInput
            label="To receive"
            token={toToken}
            amount={
              quote
                ? (
                    parseFloat(quote.toAmount.toString()) /
                    Math.pow(10, toToken?.decimals || 18)
                  ).toFixed(6)
                : ""
            }
            onTokenSelect={setToToken}
            balance={toToken ? getTokenBalance(toToken.address) : null}
            readOnly={true}
            network={network as SupportedNetwork}
            excludeToken={fromToken}
            onNetworkChange={handleNetworkChange}
          />
        ) : (
          <div className="p-4 bg-[#141519] rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/60 text-sm tracking-tight">
                To address
              </span>
            </div>
            <input
              type="text"
              placeholder="0x..."
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              className="coinbase-sans bg-transparent placeholder-white/40 border-none outline-none w-full text-2xl font-medium text-white"
            />
          </div>
        )}
      </div>

      {/* Swap Button */}
      <div className="mt-4">
        <Button
          onClick={isSignedIn ? handleSwap : handleConnectWallet}
          disabled={buttonState.disabled}
          isLoading={isLoading}
          className={`w-full h-14 rounded-[60px] font-medium text-base border-none transition-colors ${
            buttonState.disabled
              ? "bg-[#7D7E7F] text-black cursor-not-allowed"
              : "bg-white hover:bg-white/90 text-black"
          }`}
        >
          {buttonState.text}
        </Button>
      </div>

      {/* Trade Details */}
      <div className="mt-4 bg-[#141519] rounded-xl p-2.5">
        <button
          onClick={() => setShowTradeDetails(!showTradeDetails)}
          className="flex items-center justify-between w-full text-white/60 text-sm hover:text-white/80 transition-colors"
        >
          <span>Trade details</span>
          <img
            src="/chevron-down.svg"
            alt="Toggle"
            className={`w-4 h-4 transition-transform ${showTradeDetails ? "rotate-180" : ""}`}
          />
        </button>
        {showTradeDetails && quote && (
          <div className="mt-3 space-y-2 text-sm border-t-2 border-[#292B30] pt-3">
            <div className="flex justify-between text-white/60">
              <span>Slippage tolerance</span>
              <span>{slippage}%</span>
            </div>
            {quote.fees?.protocolFee && (
              <div className="flex justify-between text-white/60">
                <span>Transaction fee</span>
                <span>
                  {formatUnits(
                    BigInt(quote.fees?.protocolFee.amount || "0"),
                    getTokenDecimals(quote.fees.protocolFee.token, network),
                  )}{" "}
                  {getTokenSymbol(quote.fees.protocolFee.token, network)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <OnrampButton />

      <ConnectWalletModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
      />

      {/* Review Transaction Modal */}
      {fromToken && (activeTab === "swap" ? quote && toToken : toAddress) && (
        <ReviewTransactionModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onConfirm={handleConfirmSwap}
          fromToken={fromToken}
          toToken={toToken || undefined}
          fromAmount={fromAmount}
          quote={quote || undefined}
          slippage={slippage}
          isLoading={isLoading}
          network={network}
          mode={activeTab}
          toAddress={toAddress}
        />
      )}
    </div>
  );
}
