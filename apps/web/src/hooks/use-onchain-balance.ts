import { useReadContract } from "thirdweb/react";
import { getContract } from "thirdweb";
import { balanceOf } from "thirdweb/extensions/erc20";
import { thirdwebClient, CHAIN, USDC_ADDRESS } from "@/lib/thirdweb";

const usdcContract = getContract({
  client: thirdwebClient,
  chain: CHAIN,
  address: USDC_ADDRESS,
});

export function useOnchainBalance(walletAddress: string | undefined) {
  const { data, isLoading, refetch } = useReadContract(balanceOf, {
    contract: usdcContract,
    address: walletAddress!,
    queryOptions: {
      enabled: !!walletAddress,
      refetchInterval: 15_000,
    },
  });

  // USDC has 6 decimals
  const balanceUsdc = data ? Number(data) / 1e6 : 0;

  return { balanceUsdc, isLoading, refetch };
}
