"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getNetworkChainId,
  isOnBaseSepolia,
  registerAgreement,
  switchToBaseSepolia,
} from "@/lib/contract";
import { generateSHA256 } from "@/lib/hash";
import { Header } from "@/components/Header";
import { UploadCard } from "@/components/UploadCard";
import { TransactionStatus, type TxStatus } from "@/components/TransactionStatus";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import type { AnalysisResult } from "@/app/api/analyze/route";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<any>;
      on?: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

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

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const isCorrectNetwork = useMemo(
    () => (chainId != null ? isOnBaseSepolia(chainId) : false),
    [chainId],
  );

  const explorerUrl = useMemo(
    () => (txHash ? `https://sepolia.basescan.org/tx/${txHash}` : null),
    [txHash],
  );

  const isTenantAddressValid = useMemo(() => {
    if (!tenantAddress) return false;
    const pattern = /^0x[a-fA-F0-9]{40}$/;
    return pattern.test(tenantAddress);
  }, [tenantAddress]);

  const canSubmit =
    !!walletAddress && !!fileHash && isTenantAddressValid && isCorrectNetwork && txStatus !== "pending";

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
    setAnalysis(null);
    setAnalysisError(null);

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

  const handleAnalyzeAgreement = async () => {
    if (!selectedFile) {
      setAnalysisError("Please upload your agreement first.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysis(null);

    try {
      const text = await selectedFile.text();
      const trimmed = text.trim();

      if (trimmed.length < 200) {
        setAnalysisError(
          "This document looks very short or unreadable. Please upload the full agreement text.",
        );
        setIsAnalyzing(false);
        return;
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentText: trimmed }),
      });

      const json = (await response.json()) as {
        success: boolean;
        data: AnalysisResult | null;
        error?: string;
      };

      if (!json.success || !json.data) {
        setAnalysisError(
          json.error ??
            "We couldn’t analyze this document. Please try again or use a different file.",
        );
        setIsAnalyzing(false);
        return;
      }

      setAnalysis(json.data);
    } catch (error) {
      console.error(error);
      setAnalysisError("We couldn’t analyze this document. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header walletAddress={walletAddress} isConnecting={isConnecting} onConnect={handleConnectWallet} />

      <main className="flex flex-col items-center px-4 pb-12 pt-4 sm:px-6 md:px-0">
        <div className="w-full max-w-xl">
          <UploadCard
            selectedFile={selectedFile}
            onFileChange={handleFileChange}
            isHashing={isHashing}
            hashError={hashError}
            onAnalyze={handleAnalyzeAgreement}
            isAnalyzing={isAnalyzing}
            tenantAddress={tenantAddress}
            onTenantAddressChange={setTenantAddress}
            isTenantAddressValid={isTenantAddressValid}
            canSubmit={canSubmit}
            isSubmitting={txStatus === "pending"}
            onSubmit={handleRegisterAgreement}
            networkError={networkError}
            onSwitchNetwork={handleSwitchNetwork}
            walletConnected={!!walletAddress}
          />
        </div>

        <div className="w-full max-w-xl">
          <AnalysisPanel analysis={analysis} isLoading={isAnalyzing} error={analysisError} />
        </div>

        <div className="w-full max-w-xl mt-4">
          <TransactionStatus status={txStatus} txHash={txHash} error={txError} />
        </div>

        {walletError && (
          <div className="mx-auto mt-4 w-full max-w-xl rounded-2xl bg-white p-4 text-xs text-[#B91C1C] shadow-lg">
            {walletError}
          </div>
        )}
      </main>
    </div>
  );
}

