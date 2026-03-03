import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TrustBase – Protect Your Agreements",
  description:
    "TrustBase helps you protect rental and legal agreements with simple, tamper-proof blockchain protection on Base Sepolia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased bg-[#F8FAFC] text-[#111827]`}>
        {children}
      </body>
    </html>
  );
}
