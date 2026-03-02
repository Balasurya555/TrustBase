import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100">
      <header className="flex items-center justify-between px-6 py-4 md:px-10 md:py-6">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-slate-100">
          <span className="h-6 w-6 rounded-lg bg-[#0052FF] text-center text-xs leading-6 text-white">
            TB
          </span>
          <span className="text-sm font-semibold">TrustBase</span>
        </div>
        <div className="rounded-full border border-[#1f2937] bg-[#020617]/40 px-3 py-1 text-xs font-medium text-slate-300 shadow-sm">
          Built on <span className="text-[#60a5fa]">Base</span>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-6 pb-16 pt-8 text-center md:flex-row md:items-start md:gap-16 md:px-10 md:pb-24 md:pt-16 md:text-left">
        <div className="flex-1 space-y-6">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl md:text-5xl">
            Onchain Trust Infrastructure
            <br />
            for Real-World Contracts
          </h1>
          <p className="max-w-xl text-balance text-sm leading-relaxed text-slate-300 sm:text-base">
            TrustBase anchors off-chain legal agreements on-chain using{" "}
            <span className="font-semibold text-slate-100">AI</span> and the{" "}
            <span className="font-semibold text-slate-100">
              Base Ethereum L2
            </span>
            . Upload agreements, generate tamper-proof hashes, and register
            them on Base Sepolia for immutable, verifiable provenance.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-[#0052FF] px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition hover:bg-[#2563eb]"
            >
              Launch App
            </Link>
            <p className="text-xs text-slate-400 sm:text-sm">
              No backend. All interactions via your wallet.
            </p>
          </div>
        </div>

        <div className="mt-6 w-full max-w-md flex-1 md:mt-0">
          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5 shadow-xl shadow-black/40">
            <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
              <span>TrustBase Agreement Snapshot</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                Testnet · Base Sepolia
              </span>
            </div>
            <div className="space-y-3 rounded-xl border border-slate-800/70 bg-[#020617]/40 px-4 py-3 text-left text-xs text-slate-300">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Status</span>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                  Ready to register
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Network</span>
                <span className="font-mono text-[11px] text-slate-100">
                  Base Sepolia (84532)
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-slate-400">Document hash (SHA-256)</span>
                <span className="line-clamp-1 font-mono text-[11px] text-slate-100">
                  0x3af2...c9e1 – generated client-side
                </span>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-slate-800/70 bg-[#020617]/60 px-4 py-3 text-left">
              <p className="mb-2 text-xs font-medium text-slate-200">
                How it works
              </p>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>• Connect your wallet on Base Sepolia.</li>
                <li>• Upload a PDF to generate a SHA-256 hash.</li>
                <li>• Register the agreement on-chain via TrustBase.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
