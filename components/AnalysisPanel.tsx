import React from "react";
import type { AnalysisResult } from "@/app/api/analyze/route";

type AnalysisPanelProps = {
  analysis: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
};

function getRiskStyles(risk: AnalysisResult["riskScore"]) {
  switch (risk) {
    case "Low":
      return {
        label: "Low risk",
        className: "bg-[#DCFCE7] text-[#166534]",
      };
    case "High":
      return {
        label: "High risk",
        className: "bg-[#FEE2E2] text-[#B91C1C]",
      };
    case "Medium":
    default:
      return {
        label: "Medium risk",
        className: "bg-[#FEF3C7] text-[#92400E]",
      };
  }
}

export function AnalysisPanel({ analysis, isLoading, error }: AnalysisPanelProps) {
  if (isLoading) {
    return (
      <div className="mx-auto mt-4 max-w-xl rounded-2xl bg-white p-4 text-sm text-[#111827] shadow-lg">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#EFF6FF]">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
          </span>
          <div>
            <p className="font-semibold">Analyzing your document…</p>
            <p className="text-xs text-[#6B7280]">
              We&apos;re reviewing this agreement for risk, unfair terms, and missing protections.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-4 max-w-xl rounded-2xl bg-white p-4 text-xs text-[#B91C1C] shadow-lg">
        {error}
      </div>
    );
  }

  if (!analysis) return null;

  const riskStyles = getRiskStyles(analysis.riskScore);

  return (
    <div className="mx-auto mt-4 max-w-xl space-y-4 rounded-2xl bg-white p-6 text-sm text-[#111827] shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
            AI risk overview
          </p>
          <p className="mt-1 text-sm font-semibold">
            {analysis.documentType || "Agreement"} summary
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${riskStyles.className}`}
        >
          {riskStyles.label}
        </span>
      </div>

      <p className="text-sm text-[#4B5563]">{analysis.riskSummary}</p>

      {analysis.issues?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Potential issues
          </p>
          <div className="space-y-3">
            {analysis.issues.map((issue, index) => (
              <div
                key={`${issue.clauseTitle}-${index}`}
                className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3"
              >
                <p className="text-sm font-semibold text-[#111827]">
                  {issue.clauseTitle || `Issue ${index + 1}`}
                </p>
                <p className="mt-1 text-xs text-[#B91C1C]">{issue.problem}</p>
                <p className="mt-1 text-xs text-[#4B5563]">
                  <span className="font-medium">Impact: </span>
                  {issue.impact}
                </p>
                <p className="mt-1 text-xs text-[#065F46]">
                  <span className="font-medium">Suggestion: </span>
                  {issue.suggestion}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.missingProtections?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Missing protections
          </p>
          <div className="space-y-3">
            {analysis.missingProtections.map((item, index) => (
              <div
                key={`${item.protection}-${index}`}
                className="rounded-xl border border-dashed border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3"
              >
                <p className="text-sm font-semibold text-[#1D4ED8]">
                  {item.protection || `Protection ${index + 1}`}
                </p>
                <p className="mt-1 text-xs text-[#1E3A8A]">{item.whyItMatters}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

