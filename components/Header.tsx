import React from "react";

type HeaderProps = {
  walletAddress: string | null;
  isConnecting: boolean;
  onConnect: () => void;
};

function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function Header({ walletAddress, isConnecting, onConnect }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 md:px-12 md:py-5">
      <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-[#111827]">
        <span className="h-8 w-8 rounded-2xl bg-[#2563EB] text-center text-sm leading-8 text-white shadow-md shadow-blue-500/30">
          TB
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">TrustBase</span>
          <span className="text-[11px] font-normal text-[#6B7280]">
            Protect your agreements in seconds
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden rounded-full bg-white px-3 py-1 text-xs font-medium text-[#1F2937] shadow-sm sm:inline-flex">
          Powered by <span className="ml-1 text-[#2563EB]">Base</span>
        </span>
        <button
          type="button"
          onClick={onConnect}
          disabled={isConnecting}
          className="inline-flex items-center justify-center rounded-full bg-white px-4 py-1.5 text-xs font-medium text-[#111827] shadow-md transition hover:bg-[#EFF6FF] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isConnecting
            ? "Connecting..."
            : walletAddress
              ? shortenAddress(walletAddress)
              : "Connect Wallet"}
        </button>
      </div>
    </header>
  );
}

