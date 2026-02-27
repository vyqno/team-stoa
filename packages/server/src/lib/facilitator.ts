import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { registerExactEvmScheme } from "@x402/evm/exact/server";
import type { Network } from "@x402/core/types";

export const X402_NETWORK: Network =
  (process.env.X402_NETWORK as Network) ?? "eip155:84532";

const FACILITATOR_URL =
  process.env.X402_FACILITATOR_URL ??
  "https://api.cdp.coinbase.com/platform/v2/x402";

const facilitatorClient = new HTTPFacilitatorClient({
  url: FACILITATOR_URL,
});

export const resourceServer = new x402ResourceServer(facilitatorClient);
registerExactEvmScheme(resourceServer, { networks: [X402_NETWORK] });

let initialized = false;

export async function initializeFacilitator(): Promise<void> {
  if (initialized) return;
  try {
    await resourceServer.initialize();
    initialized = true;
    console.log(`x402 facilitator initialized (${FACILITATOR_URL})`);
  } catch (err) {
    console.warn("x402 facilitator init warning (will retry on first call):", err);
  }
}
