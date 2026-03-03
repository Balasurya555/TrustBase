import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="flex items-center justify-between px-6 py-4 md:px-12 md:py-6">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-[#111827]">
          <span className="h-7 w-7 rounded-xl bg-[#2563EB] text-center text-xs leading-7 text-white">
            TB
          </span>
          <span className="text-sm font-semibold">TrustBase</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#1F2937] shadow-sm">
            Powered by <span className="text-[#2563EB]">Base</span>
          </span>
          <Link
            href="/dashboard"
            className="hidden rounded-full bg-[#2563EB] px-4 py-1.5 text-xs font-medium text-white shadow-md shadow-blue-500/30 transition hover:bg-[#1D4ED8] sm:inline-flex"
          >
            Launch App
          </Link>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col items-center gap-12 px-6 pb-16 pt-4 text-center md:flex-row md:items-center md:gap-20 md:px-12 md:pb-24 md:pt-8 md:text-left">
        <div className="flex-1 space-y-6">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-[#111827] sm:text-4xl md:text-5xl">
            Protect your rental and legal agreements in seconds.
          </h1>
          <p className="max-w-xl text-balance text-sm leading-relaxed text-[#4B5563] sm:text-base">
            TrustBase makes it easy to{" "}
            <span className="font-semibold text-[#111827]">secure your agreements</span> with
            tamper-proof blockchain protection. No crypto jargon—just simple, reliable proof that
            your document hasn&apos;t been changed.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-[#2563EB] px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition hover:bg-[#1D4ED8]"
            >
              Get started
            </Link>
            <p className="text-xs text-[#6B7280] sm:text-sm">
              Built for landlords, students, and everyday agreements.
            </p>
          </div>
        </div>

        <div className="mt-4 w-full max-w-md flex-1 md:mt-0">
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <p className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
              How TrustBase helps
            </p>
            <ul className="mt-4 space-y-3 text-sm text-[#374151]">
              <li>• Upload your agreement as a PDF.</li>
              <li>• Secure it with a one-time blockchain transaction.</li>
              <li>• Share a simple proof link if there&apos;s ever a dispute.</li>
            </ul>
            <div className="mt-5 rounded-xl bg-[#EFF6FF] px-4 py-3 text-left text-xs text-[#1D4ED8]">
              <p className="font-medium">No one sees your file.</p>
              <p className="mt-1 text-[#1E3A8A]">
                Your agreement never leaves your device. We only store a fingerprint of the
                document on the blockchain.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
