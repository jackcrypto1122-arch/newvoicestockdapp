"use client";

import { useMemo } from "react";
import { useAccount } from "wagmi";
import { useHistory } from "@/hooks/use-oraculum-data";
import { useOraculumStore } from "@/store/oraculum-store";
import { formatTime, shortAddress } from "@/lib/format";
import { cn } from "@/lib/utils";
import StitchShell, {
  DataLoadState,
  EmptyState,
  GlassPanel,
  SectionHeader,
  MIcon,
} from "@/components/stitch-shell";
import type { HistoryItem } from "@/types/dapp";

export function StitchHistoryPage() {
  const { address: walletAddress, isConnected } = useAccount();
  const { data: history, isLoading, isError } = useHistory(walletAddress);
  const executions = useOraculumStore((state) => state.executions);

  const combined = useMemo(() => {
    const chainEvents = (history ?? []).map((item) => ({
      id: item.hash,
      label: item.label,
      detail: item.hash,
      status: item.status,
      kind: item.kind,
      timestamp: item.timestamp ? item.timestamp * 1000 : 0,
      url: item.explorerUrl,
    }));

    const executionEvents = executions.map((item) => ({
      id: item.hash,
      label: `${item.inputSymbol ?? "Token"} to ${item.outputSymbol ?? "Token"}`,
      detail: item.hash,
      status: item.status,
      kind: "swap" as HistoryItem["kind"],
      timestamp: Date.parse(item.createdAt),
      url: item.explorerUrl,
    }));

    return [...executionEvents, ...chainEvents].sort(
      (left, right) => right.timestamp - left.timestamp,
    );
  }, [executions, history]);

  return (
    <StitchShell>
      <div className="p-6 pt-0 pb-8 grid grid-cols-1 gap-4">
        {!isConnected && !executions.length ? (
          <EmptyState
            icon="history"
            title="Timeline Empty"
            description="Connect a wallet or submit a swap to build your timeline. On-chain history comes from Robinhood Chain RPC, while StockVoice session activity is stored in the current browser session."
          />
        ) : (
          <GlassPanel>
            <SectionHeader title="Recent Activity" />
            <DataLoadState
              isLoading={isConnected && isLoading}
              isError={isConnected && isError}
              empty={!combined.length}
            >
              <ul className="divide-y divide-white/5">
                {combined.map((item) => (
                  <li
                    key={item.id}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 py-4 text-[14px]"
                  >
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-wider text-[var(--m3-on-surface-variant)] font-bold">
                      {item.kind}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-bold">{item.label}</p>
                      <p className="truncate text-[11px] text-[var(--m3-on-surface-variant)]">
                        {shortAddress(item.detail)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          "text-[10px] uppercase tracking-wider font-bold mb-0.5",
                          item.status === "confirmed"
                            ? "text-[var(--m3-secondary)]"
                            : item.status === "failed"
                              ? "text-[var(--m3-error)]"
                              : "text-[var(--m3-on-surface-variant)]",
                        )}
                      >
                        {item.status}
                      </p>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-[var(--m3-on-surface-variant)] hover:text-white"
                      >
                        {item.timestamp ? formatTime(Math.floor(item.timestamp / 1000)) : "Pending"}
                        <MIcon name="arrow_outward" className="text-[12px]" />
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </DataLoadState>
          </GlassPanel>
        )}
      </div>
    </StitchShell>
  );
}
