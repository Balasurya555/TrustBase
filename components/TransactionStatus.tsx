import React from "react";

export type TxStatus = "idle" | "pending" | "success" | "error";

type TransactionStatusProps = {
  status: TxStatus;
  txHash: string | null;
  error: string | null;
};

function shortenHash(hash: string): string {
  if (!hash || hash.length < 12) return hash;
  return `${hash.slice(0, 10)}…${hash.slice(-6)}`;
}

export function TransactionStatus({ status, txHash, error }: TransactionStatusProps) {
  if (status === "idle") return null;

  if (status === "pending") {
    return (
      <div className="mx-auto mt-4 max-w-xl rounded-2xl bg-white p-4 text-sm text-[#111827] shadow-lg">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#EFF6FF]">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
          </span>
          <div>
            <p className="font-semibold">Securing your agreement…</p>
            <p className="text-xs text-[#6B7280]">
              We&apos;re sending your agreement fingerprint to the blockchain. This usually takes a
              few seconds.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success" && txHash) {
    const explorerUrl = `https://sepolia.basescan.org/tx/${txHash}`;

    return (
      <div className="mx-auto mt-4 max-w-xl rounded-2xl bg-white p-4 text-sm text-[#111827] shadow-lg">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#D1FAE5] text-[#047857]">
            ✓
          </span>
          <div>
            <p className="font-semibold">
              Agreement Successfully Protected{" "}
              <span aria-hidden="true" className="ml-1">
                🎉
              </span>
            </p>
            <p className="mt-1 text-xs text-[#6B7280]">
              Your agreement&apos;s fingerprint is now stored on the blockchain. You can always
              prove it hasn&apos;t been changed.
            </p>
            <div className="mt-3 space-y-1 text-xs">
              <p className="text-[#6B7280]">Transaction</p>
              <p className="font-mono text-[11px] text-[#111827]">{shortenHash(txHash)}</p>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center rounded-full bg-[#10B981] px-3 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#059669]"
              >
                View on Base Explorer
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error" && error) {
    return (
      <div className="mx-auto mt-4 max-w-xl rounded-2xl bg-white p-4 text-sm text-[#111827] shadow-lg">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#FEE2E2] text-[#B91C1C]">
            !
          </span>
          <div>
            <p className="font-semibold">We couldn&apos;t protect your agreement.</p>
            <p className="mt-1 text-xs text-[#6B7280]">
              The transaction was rejected or failed. You can try again in a moment.
            </p>
            <p className="mt-2 text-xs text-[#B91C1C] break-words">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

