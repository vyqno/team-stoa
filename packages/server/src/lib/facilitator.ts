import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { registerExactEvmScheme } from "@x402/evm/exact/server";
import type { Network } from "@x402/core/types";
import { facilitator as cdpFacilitator } from "@coinbase/x402";

export const X402_NETWORK: Network =
  (process.env.X402_NETWORK as Network) ?? "eip155:84532";

const facilitatorClient = new HTTPFacilitatorClient(cdpFacilitator);

export const resourceServer = new x402ResourceServer(facilitatorClient);
registerExactEvmScheme(resourceServer, { networks: [X402_NETWORK] });

let initialized = false;

export async function initializeFacilitator(): Promise<void> {
  if (initialized) return;
  try {
    await resourceServer.initialize();
    initialized = true;
    console.log("x402 facilitator initialized (CDP)");
  } catch (err) {
    console.warn("x402 facilitator init warning (will retry on first call):", err);
  }
}
