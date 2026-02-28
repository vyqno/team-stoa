import { createThirdwebClient } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";

export const thirdwebClient = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

export const CHAIN = baseSepolia;

export const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
