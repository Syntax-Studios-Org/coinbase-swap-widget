import { useQuery } from "@tanstack/react-query";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { formatUnits } from "viem";
import type { Token, TokenBalance, TokenBalancesApiResponse, ApiTokenBalance } from "@/types/swap";
import type { SupportedNetwork } from "@/constants/tokens";

export const useTokenBalances = (network: SupportedNetwork, tokens: Token[]) => {
  const evmAddress = useEvmAddress();

  return useQuery({
    queryKey: ["tokenBalances", evmAddress, network],
    queryFn: async (): Promise<TokenBalance[]> => {
      if (!evmAddress) return [];

      try {
        const response = await fetch("/api/balances", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address: evmAddress,
            network,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch balances");
        }

        const result: TokenBalancesApiResponse = await response.json();

        const balances: TokenBalance[] = tokens.map(token => {
          const apiBalance = result.balances?.find((balance: ApiTokenBalance) =>
            balance.token.contractAddress?.toLowerCase() === token.address.toLowerCase()
          );

          const balance = apiBalance ? BigInt(apiBalance.amount.amount) : BigInt(0);
          const decimals = apiBalance ? apiBalance.amount.decimals : token.decimals;
          const formattedBalance = formatUnits(balance, decimals);

          return {
            token,
            balance,
            formattedBalance: parseFloat(formattedBalance).toFixed(6),
          };
        });

        return balances;
      } catch (error) {
        console.error("Error fetching token balances:", error);
        return tokens.map(token => ({
          token,
          balance: BigInt(0),
          formattedBalance: "0.000000",
          usdValue: 0,
        }));
      }
    },
    enabled: !!evmAddress,
    refetchInterval: 30000,
    staleTime: 10000,
  });
};
