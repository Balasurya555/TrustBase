import React from "react";

type UploadCardProps = {
  selectedFile: File | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isHashing: boolean;
  hashError: string | null;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  tenantAddress: string;
  onTenantAddressChange: (value: string) => void;
  isTenantAddressValid: boolean;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  networkError: string | null;
  onSwitchNetwork: () => void;
  walletConnected: boolean;
};

export function UploadCard({
  selectedFile,
  onFileChange,
  isHashing,
  hashError,
  onAnalyze,
  isAnalyzing,
  tenantAddress,
  onTenantAddressChange,
  isTenantAddressValid,
  canSubmit,
  isSubmitting,
  onSubmit,
  networkError,
  onSwitchNetwork,
  walletConnected,
}: UploadCardProps) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-lg sm:p-8">
      <div className="mb-4 space-y-1">
        <h1 className="text-lg font-semibold text-[#111827] sm:text-xl">
          Protect Your Agreement
        </h1>
        <p className="text-sm text-[#6B7280]">
          Secure your agreement with tamper-proof blockchain protection. Perfect for rentals,
          deposits, and everyday contracts.
        </p>
      </div>

      {!walletConnected && (
        <div className="mb-4 rounded-xl bg-[#FEF3C7] px-3 py-2 text-xs text-[#92400E]">
          <p className="font-medium">Connect your wallet to get started.</p>
          <p className="mt-0.5">
            You&apos;ll use your wallet to confirm a one-time transaction on the Base network.
          </p>
        </div>
      )}

      {networkError && (
        <div className="mb-4 rounded-xl bg-[#EFF6FF] px-3 py-2 text-xs text-[#1D4ED8]">
          <p className="font-medium">You&apos;re not connected to Base network.</p>
          <p className="mt-1 text-[#1E3A8A]">
            To protect your agreement, please switch your wallet to Base Sepolia.
          </p>
          <button
            type="button"
            onClick={onSwitchNetwork}
            className="mt-2 inline-flex items-center justify-center rounded-full bg-[#2563EB] px-3 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#1D4ED8]"
          >
            Switch to Base Sepolia
          </button>
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-[#111827]">1. Upload Your Agreement</h2>
          <div className="rounded-2xl border border-dashed border-[#CBD5F5] bg-[#F9FAFB] px-4 py-5 text-center transition hover:border-[#2563EB]/60 hover:bg-[#EFF6FF]">
            <p className="text-sm font-medium text-[#111827]">
              {selectedFile ? selectedFile.name : "Drag & drop your PDF here"}
            </p>
            <p className="mt-1 text-xs text-[#6B7280]">Your file never leaves your device.</p>
            <div className="mt-3">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-white px-4 py-1.5 text-xs font-medium text-[#111827] shadow-sm ring-1 ring-[#E5E7EB] hover:bg-[#F3F4F6]">
                <span>Browse files</span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={onFileChange}
                />
              </label>
            </div>
            {isHashing && (
              <p className="mt-2 text-xs text-[#6B7280]">Creating a secure fingerprint…</p>
            )}
            {hashError && (
              <p className="mt-2 text-xs text-[#B91C1C]">
                {hashError || "Something went wrong. Please try again."}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-[#111827]">2. Analyze Your Agreement</h2>
          </div>
          <button
            type="button"
            onClick={onAnalyze}
            disabled={!selectedFile || isAnalyzing}
            className="flex w-full items-center justify-center rounded-2xl bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#030712] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAnalyzing ? "Analyzing your document…" : "Analyze Agreement"}
          </button>
          <p className="text-xs text-[#6B7280]">
            We’ll scan this document for risk, unfair terms, and missing protections before you
            decide to secure it on the blockchain.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-medium text-[#111827]">3. Enter Tenant Wallet</h2>
          <input
            type="text"
            value={tenantAddress}
            onChange={(event) => onTenantAddressChange(event.target.value)}
            placeholder="Enter tenant’s wallet address"
            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
          />
          {!isTenantAddressValid && tenantAddress.length > 0 && (
            <p className="text-xs text-[#B91C1C]">
              Please enter a valid wallet address that starts with 0x.
            </p>
          )}
          <p className="text-xs text-[#6B7280]">
            This is the wallet that should be linked to the agreement (for example, your tenant).
          </p>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className="flex w-full items-center justify-center rounded-2xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Securing your agreement…" : "Secure on Blockchain"}
          </button>
          <p className="text-xs text-[#6B7280]">
            You&apos;ll confirm the transaction in your wallet. It usually takes less than 30
            seconds.
          </p>
        </div>
      </div>
    </div>
  );
}

