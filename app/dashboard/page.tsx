/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  baseSepoliaConstants,
  getNetworkChainId,
  isOnBaseSepolia,
  registerAgreement,
  switchToBaseSepolia,
} from "@/lib/contract";
import { generateSHA256 } from "@/lib/hash";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<any>;
      on?: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

type TxStatus = "idle" | "pending" | "success" | "error";

export default function DashboardPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState(false);
  const [hashError, setHashError] = useState<string | null>(null);

  const [tenantAddress, setTenantAddress] = useState("");
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const isCorrectNetwork = useMemo(
    () => (chainId != null ? isOnBaseSepolia(chainId) : false),
    [chainId],
  );

  const explorerUrl = useMemo(
    () => (txHash ? `https://sepolia.basescan.org/tx/${txHash}` : null),
    [txHash],
  );

  const canSubmit =
    !!walletAddress &&
    !!fileHash &&
    !!tenantAddress &&
    isCorrectNetwork &&
    txStatus !== "pending";

  useEffect(() => {
    async function initializeConnection() {
      if (typeof window === "undefined" || !window.ethereum) return;

      try {
        const accounts: string[] = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }

        const currentChainId = await getNetworkChainId();
        setChainId(currentChainId);
        setNetworkError(
          isOnBaseSepolia(currentChainId)
            ? null
            : "Connected to the wrong network. Please switch to Base Sepolia.",
        );
      } catch (error) {
        console.error(error);
      }
    }

    initializeConnection();

    const handleAccountsChanged = (accounts: string[]) => {
      setWalletAddress(accounts[0] ?? null);
    };

    const handleChainChanged = (hexChainId: string) => {
      const newChainId = parseInt(hexChainId, 16);
      setChainId(newChainId);
      setNetworkError(
        isOnBaseSepolia(newChainId)
          ? null
          : "Connected to the wrong network. Please switch to Base Sepolia.",
      );
    };

    if (window.ethereum?.on) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setWalletError(null);
    setNetworkError(null);

    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not available. Please install it to continue.");
      }

      const accounts: string[] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts returned from wallet.");
      }

      setWalletAddress(accounts[0]);

      const currentChainId = await getNetworkChainId();
      setChainId(currentChainId);

      if (!isOnBaseSepolia(currentChainId)) {
        setNetworkError("Connected to the wrong network. Please switch to Base Sepolia.");
      }
    } catch (error: any) {
      console.error(error);
      setWalletError(error?.message ?? "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSwitchNetwork = async () => {
    setNetworkError(null);
    try {
      await switchToBaseSepolia();
      const newChainId = await getNetworkChainId();
      setChainId(newChainId);
      if (!isOnBaseSepolia(newChainId)) {
        setNetworkError(
          "Failed to switch to Base Sepolia. Please change the network manually in your wallet.",
        );
      }
    } catch (error: any) {
      console.error(error);
      setNetworkError(error?.message ?? "Failed to switch network.");
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file ?? null);
    setFileHash(null);
    setHashError(null);

    if (!file) return;

    if (file.type !== "application/pdf") {
      setHashError("Only PDF files are supported.");
      return;
    }

    setIsHashing(true);

    try {
      const hash = await generateSHA256(file);
      setFileHash(hash);
    } catch (error: any) {
      console.error(error);
      setHashError(error?.message ?? "Failed to generate SHA-256 hash.");
    } finally {
      setIsHashing(false);
    }
  };

  const handleRegisterAgreement = async () => {
    if (!canSubmit || !fileHash) return;

    setTxStatus("pending");
    setTxError(null);
    setTxHash(null);

    try {
      const receipt = await registerAgreement(fileHash, tenantAddress);
      setTxStatus("success");
      setTxHash(receipt.hash);
    } catch (error: any) {
      console.error(error);
      setTxStatus("error");
      setTxError(error?.message ?? "Failed to register agreement on Base Sepolia.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-800/70 bg-[#020617]/60 px-6 py-4 md:px-10 md:py-5">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-slate-100">
          <span className="h-7 w-7 rounded-lg bg-[#0052FF] text-center text-xs leading-7 text-white">
            TB
          </span>
          <span className="text-sm font-semibold">TrustBase</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-slate-800/80 bg-[#020617]/80 px-3 py-1.5 text-[11px] text-slate-300 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Base Sepolia</span>
            <span className="font-mono text-[10px] text-slate-400">
              {baseSepoliaConstants.chainIdDecimal}
            </span>
          </div>
          <button
            type="button"
            onClick={handleConnectWallet}
            disabled={isConnecting}
            className="inline-flex items-center justify-center rounded-full border border-[#1f2937] bg-[#020617] px-4 py-1.5 text-xs font-medium text-slate-100 shadow-sm transition hover:border-[#0052FF] hover:bg-[#020617]/80 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isConnecting
              ? "Connecting..."
              : walletAddress
                ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                : "Connect Wallet"}
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8 md:px-10 md:py-10 lg:flex-row">
        <section className="w-full flex-1 space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5 shadow-lg shadow-black/40">
            <h1 className="text-base font-semibold text-slate-50 sm:text-lg">
              Agreement Registration
            </h1>
            <p className="mt-1 text-xs text-slate-400 sm:text-sm">
              Anchor off-chain legal contracts to Base Sepolia using client-side hashing and your
              wallet.
            </p>

            <div className="mt-5 space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-300">
                  1. Upload agreement (PDF)
                </label>
                <div className="flex items-center justify-between rounded-xl border border-dashed border-slate-700 bg-[#020617]/60 px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-200">
                      {selectedFile ? selectedFile.name : "Drop a PDF here or browse"}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      File is never uploaded. Hash is generated in your browser.
                    </span>
                  </div>
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#111827] px-3 py-1.5 text-xs font-medium text-slate-100 ring-1 ring-slate-700 hover:bg-[#1f2937]">
                    <span>Browse</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {isHashing && (
                  <p className="text-[11px] text-slate-400">Generating SHA-256 hash…</p>
                )}
                {fileHash && (
                  <div className="mt-2 space-y-1 rounded-xl border border-slate-700 bg-[#020617]/60 px-3 py-2">
                    <p className="text-[11px] font-medium text-slate-300">
                      SHA-256 hash (hex)
                    </p>
                    <p className="break-all font-mono text-[11px] text-slate-100">{fileHash}</p>
                  </div>
                )}
                {hashError && <p className="text-[11px] text-red-400">{hashError}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-300">
                  2. Tenant wallet address
                </label>
                <input
                  type="text"
                  value={tenantAddress}
                  onChange={(event) => setTenantAddress(event.target.value)}
                  placeholder="0x..."
                  className="w-full rounded-xl border border-slate-700 bg-[#020617] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-[#0052FF] focus:outline-none focus:ring-1 focus:ring-[#0052FF]"
                />
                <p className="text-[11px] text-slate-500">
                  This should be the on-chain address of the tenant or counterparty.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleRegisterAgreement}
                  disabled={!canSubmit}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[#0052FF] px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-500/25 transition hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {txStatus === "pending" ? "Registering on Base…" : "Register on Base"}
                </button>
                <p className="text-[11px] text-slate-500">
                  You will be asked to sign a transaction with your connected wallet. Gas is paid on
                  Base Sepolia.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full flex-1 space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-[#020617]/80 p-5 shadow-lg shadow-black/40">
            <h2 className="text-sm font-semibold text-slate-50">Session & Network Status</h2>
            <div className="mt-3 space-y-3 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Wallet</span>
                <span className="font-mono text-[11px]">
                  {walletAddress
                    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                    : "Not connected"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Network</span>
                <span className="font-mono text-[11px]">
                  {chainId != null ? `Chain ID ${chainId}` : "Unknown"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Target</span>
                <span className="font-mono text-[11px] text-emerald-400">
                  Base Sepolia ({baseSepoliaConstants.chainIdDecimal})
                </span>
              </div>
            </div>

            {networkError && (
              <div className="mt-4 space-y-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2">
                <p className="text-[11px] font-medium text-amber-200">Wrong network detected</p>
                <p className="text-[11px] text-amber-100/80">{networkError}</p>
                <button
                  type="button"
                  onClick={handleSwitchNetwork}
                  className="mt-2 inline-flex items-center justify-center rounded-full bg-amber-400 px-3 py-1 text-[11px] font-semibold text-amber-950 hover:bg-amber-300"
                >
                  Switch to Base Sepolia
                </button>
              </div>
            )}

            {walletError && (
              <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-[11px] text-red-100">
                {walletError}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#020617]/80 p-5 shadow-lg shadow-black/40">
            <h2 className="text-sm font-semibold text-slate-50">Transaction Status</h2>
            <div className="mt-3 space-y-2 text-xs text-slate-300">
              {txStatus === "idle" && (
                <p className="text-slate-400">
                  No transaction yet. Fill in the details and click{" "}
                  <span className="font-semibold text-slate-100">Register on Base</span> to begin.
                </p>
              )}
              {txStatus === "pending" && (
                <p className="text-slate-300">
                  Transaction submitted. Waiting for confirmation on Base Sepolia…
                </p>
              )}
              {txStatus === "success" && txHash && (
                <div className="space-y-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2">
                  <p className="text-[11px] font-semibold text-emerald-200">
                    Agreement successfully registered on Base Sepolia.
                  </p>
                  <p className="text-[11px] text-emerald-100/90">
                    Transaction hash:
                    <br />
                    <span className="break-all font-mono text-[11px]">{txHash}</span>
                  </p>
                  {explorerUrl && (
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-3 py-1 text-[11px] font-semibold text-emerald-950 hover:bg-emerald-300"
                    >
                      View on BaseScan
                    </a>
                  )}
                </div>
              )}
              {txStatus === "error" && txError && (
                <div className="space-y-1 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2">
                  <p className="text-[11px] font-semibold text-red-200">
                    Transaction failed or was rejected.
                  </p>
                  <p className="text-[11px] text-red-100/90 break-words">{txError}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

