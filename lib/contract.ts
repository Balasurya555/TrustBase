import { BrowserProvider, Contract, type TransactionReceipt } from "ethers";

const BASE_SEPOLIA_CHAIN_ID_DECIMAL = 84532;
const BASE_SEPOLIA_CHAIN_ID_HEX = "0x14A34";

// Placeholder ABI – replace with your deployed contract's ABI
// which must include the `registerAgreement(string,address)` function.
export const CONTRACT_ABI: any[] = [];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

if (!CONTRACT_ADDRESS) {
  // This will surface clearly during development if the env var is missing.
  // In production, Next.js replaces this at build time.
  // eslint-disable-next-line no-console
  console.warn(
    "NEXT_PUBLIC_CONTRACT_ADDRESS is not set. Contract interactions will fail until this is configured.",
  );
}

function getEthereum(): any {
  if (typeof window === "undefined") {
    throw new Error("Window is undefined – blockchain interactions are client-side only.");
  }

  const { ethereum } = window as unknown as { ethereum?: unknown };

  if (!ethereum) {
    throw new Error("No injected Ethereum provider found. Please install MetaMask.");
  }

  return ethereum;
}

export async function getBrowserProvider(): Promise<BrowserProvider> {
  const ethereum = getEthereum();
  return new BrowserProvider(ethereum);
}

export async function getSigner() {
  const provider = await getBrowserProvider();
  return provider.getSigner();
}

export async function getNetworkChainId(): Promise<number> {
  const ethereum = getEthereum();

  const chainIdHex: string = await ethereum.request({
    method: "eth_chainId",
  });

  return parseInt(chainIdHex, 16);
}

export function isOnBaseSepolia(chainId: number): boolean {
  return chainId === BASE_SEPOLIA_CHAIN_ID_DECIMAL;
}

export async function switchToBaseSepolia(): Promise<void> {
  const ethereum = getEthereum();

  await ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: BASE_SEPOLIA_CHAIN_ID_HEX }],
  });
}

async function getContractInstance(): Promise<Contract> {
  if (!CONTRACT_ADDRESS) {
    throw new Error(
      "NEXT_PUBLIC_CONTRACT_ADDRESS is not set. Please configure it in your environment.",
    );
  }

  const signer = await getSigner();

  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

export async function registerAgreement(
  docHash: string,
  tenantAddress: string,
): Promise<TransactionReceipt> {
  if (!docHash) {
    throw new Error("Document hash is required.");
  }

  if (!tenantAddress) {
    throw new Error("Tenant wallet address is required.");
  }

  const contract = await getContractInstance();

  const tx = await contract.registerAgreement(docHash, tenantAddress);
  const receipt: TransactionReceipt = await tx.wait();

  return receipt;
}

export const baseSepoliaConstants = {
  chainIdDecimal: BASE_SEPOLIA_CHAIN_ID_DECIMAL,
  chainIdHex: BASE_SEPOLIA_CHAIN_ID_HEX,
};

