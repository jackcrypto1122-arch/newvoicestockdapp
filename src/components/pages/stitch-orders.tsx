"use client";

import { useOraculumStore } from "@/store/oraculum-store";
import { formatAmount } from "@/lib/format";
import { cn } from "@/lib/utils";
import StitchShell, {
  EmptyState,
  GlassPanel,
  SectionHeader,
  MIcon,
} from "@/components/stitch-shell";

export function StitchOrdersPage() {
  const executions = useOraculumStore((state) => state.executions);

  return (
    <StitchShell>
      <div className="p-6 pt-0 pb-8 grid grid-cols-1 gap-4">
        <GlassPanel>
          <SectionHeader title="Execution Ledger" />
          {executions.length ? (
            <ul className="divide-y divide-white/5">
              {executions.map((execution) => (
                <li
                  key={execution.hash}
                  className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 py-4 text-[14px]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold">
                      {execution.inputSymbol ?? "Token"} to {execution.outputSymbol ?? "Token"}
                    </p>
                    <p className="truncate text-[11px] text-[var(--m3-on-surface-variant)]">
                      {execution.inAmountUi != null
                        ? formatAmount(execution.inAmountUi)
                        : "Pending"}{" "}
                      to{" "}
                      {execution.outAmountUi != null
                        ? formatAmount(execution.outAmountUi)
                        : "quote"}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-1 text-[10px] uppercase tracking-wider font-bold",
                      execution.status === "confirmed"
                        ? "border-[var(--m3-secondary)]/40 text-[var(--m3-secondary)] bg-[var(--m3-secondary)]/10"
                        : execution.status === "failed"
                          ? "border-[var(--m3-error)]/40 text-[var(--m3-error)] bg-[var(--m3-error)]/10"
                          : "border-white/20 text-[var(--m3-on-surface-variant)] bg-white/5",
                    )}
                  >
                    {execution.status}
                  </span>
                  <a
                    href={execution.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[var(--m3-primary)] hover:underline font-bold text-[12px]"
                  >
                    Explorer <MIcon name="arrow_outward" className="text-[14px]" />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-6">
              <EmptyState
                icon="list_alt"
                title="No swap executions yet."
                description="Build and submit a live swap from the home screen to populate this ledger."
              />
            </div>
          )}
        </GlassPanel>
      </div>
    </StitchShell>
  );
}
