"use client";

import { useState, useMemo } from "react";
import { formatUnits, parseUnits } from "viem";
import { Button } from "@/components/ui";
import { UserDropdown } from "./UserDropdown";
import { SwapInput } from "./SwapInput";
import { ReviewTransactionModal } from "./ReviewTransactionModal";
import { ConnectWalletModal } from "../auth/ConnectWalletModal";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import {
  useSwapState,
  useCreateSwapQuote,
  useSwapPrice,
} from "@/hooks/useSwap";
import { useSwapExecution } from "@/hooks/useSwapExecution";
import { useEvmAddress, useIsSignedIn } from "@coinbase/cdp-hooks";
import { SUPPORTED_NETWORKS } from "@/constants/tokens";
import type { SupportedNetwork } from "@/constants/tokens";
import Image from "next/image";
import { OnrampButton } from "./OnrampButton";
import { getTokenDecimals, getTokenSymbol } from "@/utils/tokens";

export function SwapWidget() {
  const {
    fromToken,
    toToken,
    fromAmount,
    network,
    setFromToken,
    setToToken,
    setFromAmount,
    setNetwork,
    swapTokens,
  } = useSwapState();
  const [slippage, setSlippage] = useState(1.0);
  const [showTradeDetails, setShowTradeDetails] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const isSignedIn = useIsSignedIn();
  const evmAddress = useEvmAddress();
  const { createQuote, isLoading: isCreateSwapQuoteLoading } =
    useCreateSwapQuote();
  const { executeSwap, isLoading: isExecuteSwapLoading } = useSwapExecution();

  const tokens = useMemo(
    () => Object.values(SUPPORTED_NETWORKS[network as SupportedNetwork]),
    [network],
  );
  const { data: balances, refetch: refetchBalances } = useTokenBalances(
    network as SupportedNetwork,
    tokens,
  );

  const getTokenBalance = (tokenAddress: string) => {
    return balances?.find(
      (b) => b.token.address.toLowerCase() === tokenAddress.toLowerCase(),
    );
  };

  // Get swap price quote to check if swap is possible
  const parsedAmount = useMemo(() => {
    try {
      return fromToken && fromAmount && !isNaN(Number(fromAmount))
        ? parseUnits(fromAmount, fromToken.decimals)
        : BigInt(0);
    } catch (error) {
      console.error("Error parsing amount:", error);
      return BigInt(0);
    }
  }, [fromToken, fromAmount]);

  const {
    data: quote,
    isLoading: isLoadingQuote,
    error: quoteError,
  } = useSwapPrice(
    fromToken,
    toToken,
    parsedAmount,
    network,
    Boolean(fromToken && toToken && fromAmount),
  );

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
    if (!fromToken || !toToken || !fromAmount) return;

    try {
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
    } catch (error: any) {
      console.error("Swap failed:", error);
      throw error;
    }
  };

  const handleConnectWallet = () => {
    setShowConnectModal(true);
  };

  // Check for insufficient balance
  const hasInsufficientBalance = Boolean(quote?.issues?.balance);
  const isValidAmount =
    fromAmount && !isNaN(Number(fromAmount)) && Number(fromAmount) > 0;

  const isLoading = isCreateSwapQuoteLoading || isExecuteSwapLoading;

  const canSwap = Boolean(
    isSignedIn &&
      fromToken &&
      toToken &&
      isValidAmount &&
      !hasInsufficientBalance &&
      quote &&
      !isLoadingQuote,
  );

  // Determine button text and state
  const getButtonState = () => {
    if (!isSignedIn) return { text: "Connect Wallet", disabled: false };
    if (!fromToken || !toToken)
      return { text: "Select tokens", disabled: true };
    if (!isValidAmount) return { text: "Enter amount", disabled: true };
    if (hasInsufficientBalance)
      return { text: "Insufficient balance", disabled: true };
    if (isLoadingQuote) return { text: "Getting quote...", disabled: true };
    if (isLoading) return { text: "Swapping...", disabled: true };
    return { text: "Swap", disabled: false };
  };

  const buttonState = getButtonState();

  return (
    <div className="w-full max-w-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-xl font-medium">Swap</h1>
        {isSignedIn && (
          <UserDropdown slippage={slippage} onSlippageChange={setSlippage} />
        )}
      </div>

      <div className="rounded-2xl relative overflow-hidden flex flex-col">
        {/* You're paying section */}
        <SwapInput
          label="You're paying"
          token={fromToken}
          amount={fromAmount}
          onTokenSelect={setFromToken}
          onAmountChange={setFromAmount}
          balance={fromToken ? getTokenBalance(fromToken.address) : null}
          onMaxClick={handleMaxClick}
          network={network as SupportedNetwork}
          excludeToken={toToken}
          hasError={hasInsufficientBalance}
        />

        {/* Separator line with swap button */}
        <div className="relative bg-[#0A0B0D] h-[3px]">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <button
              onClick={swapTokens}
              className="bg-[#141519] border-2 border-[#0A0B0D] rounded-md p-2 hover:bg-[#1A1B1F] transition-colors"
            >
              <Image src="/swap.svg" alt="Swap" width={20} height={20} />
            </button>
          </div>
        </div>

        {/* To receive section */}
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
        />
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
                <span>Coinbase fee</span>
                <span>
                  {formatUnits(
                    BigInt(quote.fees?.protocolFee.amount || "0"),
                    getTokenDecimals(quote.fees.protocolFee.token, network),
                  )}{" "}
                  {getTokenSymbol(quote.fees.protocolFee.token, network)}
                </span>
              </div>
            )}
            {quote.fees?.gasFee && (
              <div className="flex justify-between text-white/60">
                <span>Network Fee</span>
                <span>
                  {formatUnits(
                    BigInt(quote.fees?.gasFee.amount || "0"),
                    getTokenDecimals(quote.fees.gasFee.token, network),
                  )}{" "}
                  {getTokenSymbol(quote.fees.gasFee.token, network)}
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
      {quote && fromToken && toToken && (
        <ReviewTransactionModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onConfirm={handleConfirmSwap}
          fromToken={fromToken}
          toToken={toToken}
          fromAmount={fromAmount}
          quote={quote}
          slippage={slippage}
          isLoading={isLoading}
          network={network}
        />
      )}
    </div>
  );
}
