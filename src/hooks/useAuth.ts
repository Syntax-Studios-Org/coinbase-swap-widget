import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSignInWithEmail, useVerifyEmailOTP } from "@coinbase/cdp-hooks";
import type { SignInRequest, VerifyOTPRequest, AuthError } from "@/types/auth";

export const useSignIn = () => {
  const signInWithEmail = useSignInWithEmail();

  return useMutation({
    mutationFn: async ({ email }: SignInRequest) => {
      const result = await signInWithEmail({ email });
      return result;
    },
    onError: (error: Error) => {
      console.error("Sign in failed:", error);
    },
  });
};

export const useVerifyOTP = () => {
  const verifyEmailOtp = useVerifyEmailOTP();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ flowId, otp }: VerifyOTPRequest) => {
      const result = await verifyEmailOtp({ flowId, otp });
      return result;
    },
    onSuccess: (data) => {
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: Error) => {
      console.error("OTP verification failed:", error);
    },
  });
};
