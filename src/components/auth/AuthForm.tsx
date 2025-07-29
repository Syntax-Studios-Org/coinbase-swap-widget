"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { useSignIn, useVerifyOTP } from "@/hooks/useAuth";
import { validateEmail, validateOTP, formatError } from "@/utils/validation";

export function AuthForm() {
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
    } catch (error) {
      setOtpError(formatError(error));
    }
  };

  const isSignInStep = !flowId;

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">
          {isSignInStep ? "Sign In" : "Verify Email"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isSignInStep
            ? "Enter your email to get started"
            : "Enter the 6-digit code sent to your email"}
        </p>
      </div>

      {isSignInStep ? (
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="abc@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            label="Email Address"
            disabled={signInMutation.isPending}
          />
          <Button
            onClick={handleSignIn}
            isLoading={signInMutation.isPending}
            className="w-full"
            disabled={!email}
          >
            Send Verification Code
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            error={otpError}
            label="Verification Code"
            disabled={verifyOTPMutation.isPending}
            maxLength={6}
          />
          <Button
            onClick={handleVerifyOTP}
            isLoading={verifyOTPMutation.isPending}
            className="w-full"
            disabled={!otp}
          >
            Verify Code
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setFlowId(null);
              setOtp("");
              setOtpError("");
            }}
            className="w-full"
            disabled={verifyOTPMutation.isPending}
          >
            Back to Email
          </Button>
        </div>
      )}
    </div>
  );
}
