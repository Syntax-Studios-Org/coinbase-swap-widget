"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button, Input } from "@/components/ui";
import { useSignIn, useVerifyOTP } from "@/hooks/useAuth";
import { validateEmail, validateOTP, formatError } from "@/utils/validation";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectWalletModal({
  isOpen,
  onClose,
}: ConnectWalletModalProps) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [flowId, setFlowId] = useState<string | null>(null);
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");

  const signInMutation = useSignIn();
  const verifyOTPMutation = useVerifyOTP();

  const handleSignIn = async () => {
    setEmailError("");

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    try {
      const result = await signInMutation.mutateAsync({ email });
      setFlowId(result.flowId);
    } catch (error) {
      setEmailError(formatError(error));
    }
  };

  const handleVerifyOTP = async () => {
    setOtpError("");

    if (!validateOTP(otp)) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    if (!flowId) {
      setOtpError("Flow ID not found. Please sign in again.");
      return;
    }

    try {
      await verifyOTPMutation.mutateAsync({ flowId, otp });
      onClose();
    } catch (error) {
      setOtpError(formatError(error));
    }
  };

  const isSignInStep = !flowId;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-[#141519] rounded-2xl px-6 py-6">
        <DialogHeader>
          <DialogTitle className="text-white text-sm font-normal">
            Sign in with email
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 flex justify-center">
          <Image
            src="/email-header-img.svg"
            alt="email"
            width={112}
            height={56}
          />
        </div>

        <div>
          <div className="text-center text-white text-[20px] font-medium tracking-tight">
            {isSignInStep
              ? "Sign in with email"
              : `We’ve sent an OTP to ${email.slice(0, 1)}******${email.slice(email.indexOf('@')-2)}`}
          </div>
          <div className="text-center text-[#8B919D] text-[13px] font-normal tracking-tight">
            {isSignInStep
              ? "demo.coinbase.com"
              : `Enter the 6-digit code we’ve sent to you`}
          </div>
        </div>

        <div className="mt-2 space-y-4">
          {isSignInStep ? (
            <>
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
                disabled={signInMutation.isPending}
                className="bg-[#141519] h-14 border-white/10 text-white placeholder-white/40"
              />
              <Button
                onClick={handleSignIn}
                isLoading={signInMutation.isPending}
                className="w-full h-12 bg-white hover:bg-white/90 text-black rounded-full font-medium"
                disabled={!email}
              >
                Request Verification Code
              </Button>
            </>
          ) : (
            <>
              <Input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                error={otpError}
                disabled={verifyOTPMutation.isPending}
                maxLength={6}
                className="bg-[#141519] h-14 border-white/10 text-white placeholder-white/40 tracking-widest"
              />
              <Button
                onClick={handleVerifyOTP}
                isLoading={verifyOTPMutation.isPending}
                className="w-full h-12 bg-white hover:bg-white/90 text-black rounded-full font-medium"
                disabled={!otp}
              >
                Verify & Connect
              </Button>
            </>
          )}
        </div>

        <div className="relative mt-6 -mx-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#141519] px-3 text-xs text-white/50 border border-white/10 rounded-full">
              you're allowing to:
            </span>
          </div>
        </div>
        <div>
          <ul className="text-sm text-[#8B919D] space-y-1 tracking-tight">
            <li className="flex items-center gap-2">
              <span>
                <Image src={"/eye.svg"} width={16} height={16} alt="eye" />
              </span>
              Let it see your wallet balance & activity
            </li>
            <li className="flex items-center gap-2">
              <span>
                <Image
                  src={"/check-tick-single.svg"}
                  width={16}
                  height={16}
                  alt="eye"
                />
              </span>
              Let it send request for transactions
            </li>
            <li className="flex items-center gap-2">
              <span>
                <Image
                  src={"/red-cross.svg"}
                  width={16}
                  height={16}
                  alt="eye"
                />
              </span>
              It cannot move funds without your permission
            </li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
