"use client";

import type { BalanceAlert as BalanceAlertType } from "@/lib/types";

interface BalanceAlertProps {
  alerts: BalanceAlertType[];
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: "border-red-500/50 bg-red-500/10 text-red-300",
  warning: "border-amber-500/50 bg-amber-500/10 text-amber-300",
  info: "border-blue-500/50 bg-blue-500/10 text-blue-300",
};

const SEVERITY_LABEL: Record<string, string> = {
  critical: "CRITICAL",
  warning: "WARNING",
  info: "INFO",
};

export default function BalanceAlert({ alerts }: BalanceAlertProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
      <h3 className="mb-3 font-semibold">
        밸런스 이상치 탐지{" "}
        <span className="text-xs font-normal text-[var(--color-text-secondary)]">
          QA 관점 분석
        </span>
      </h3>
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-lg border p-3 ${SEVERITY_STYLES[alert.severity] || ""}`}
          >
            <div className="flex items-center gap-2">
              <span className="rounded bg-black/20 px-1.5 py-0.5 text-xs font-bold">
                {SEVERITY_LABEL[alert.severity]}
              </span>
              <span className="text-xs opacity-70">{alert.category}</span>
            </div>
            <p className="mt-1 text-sm">{alert.message}</p>
            <div className="mt-2 flex gap-4 text-xs opacity-70">
              <span>
                값: <span className="font-mono">{alert.value.toFixed(1)}</span>
              </span>
              <span>
                평균:{" "}
                <span className="font-mono">{alert.average.toFixed(1)}</span>
              </span>
              <span>
                편차:{" "}
                <span className="font-mono">
                  {alert.deviation > 0 ? "+" : ""}
                  {alert.deviation.toFixed(1)}%
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
