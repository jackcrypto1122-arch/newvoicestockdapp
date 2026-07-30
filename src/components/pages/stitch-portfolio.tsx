"use client";

import { useAccount } from "wagmi";
import { usePortfolio } from "@/hooks/use-oraculum-data";
import { formatAmount, formatPercent, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import StitchShell, {
  DataLoadState,
  EmptyState,
  GlassPanel,
  SectionHeader,
  StatCard,
} from "@/components/stitch-shell";

export function StitchPortfolioPage() {
  const { address: walletAddress, isConnected } = useAccount();
  const { data: portfolio, isLoading, isError } = usePortfolio(walletAddress);
  const holdings = portfolio?.holdings ?? [];

  return (
    <StitchShell>
      {!isConnected ? (
        <div className="p-6">
          <EmptyState
            icon="account_balance_wallet"
            title="Connect your wallet"
            description="Once connected, StockVoice reads native ETH, ERC-20 balances, live market pricing, and recent performance."
          />
        </div>
      ) : (
        <div className="p-6 pt-0 pb-8 grid grid-cols-12 gap-4">
          <div className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon="account_balance"
              label="Total Value"
              value={formatUsd(portfolio?.totalUsdValue)}
              change={formatPercent(0)} /* Mocked change for overall portfolio */
              positive={true}
              plainChange={true}
              iconBg="bg-[var(--m3-primary-container)]/20 text-[var(--m3-primary)]"
            />
            <StatCard
              icon="pie_chart"
              label="Tracked Assets"
              value={String(holdings.length)}
              change="Tokens"
              positive={true}
              plainChange={true}
              iconBg="bg-[var(--m3-secondary)]/20 text-[var(--m3-secondary)]"
            />
            <StatCard
              icon="trending_up"
              label="Top Holding"
              value={holdings[0]?.symbol ?? "N/A"}
              change={formatUsd(holdings[0]?.usdValue)}
              positive={true}
              plainChange={true}
              iconBg="bg-[var(--m3-tertiary)]/20 text-[var(--m3-tertiary)]"
            />
            <StatCard
              icon="data_usage"
              label="Largest Mover"
              value={portfolio?.topMovers[0]?.symbol ?? "N/A"}
              change={
                portfolio?.topMovers[0]?.change24hPct != null
                  ? formatPercent(portfolio.topMovers[0].change24hPct)
                  : "N/A"
              }
              positive={(portfolio?.topMovers[0]?.change24hPct ?? 0) >= 0}
              iconBg="bg-[var(--m3-error)]/10 text-[var(--m3-error)]"
            />
          </div>

          <div className="col-span-12 xl:col-span-7 flex flex-col gap-4">
            <GlassPanel>
              <SectionHeader title="Asset Allocation" />
              <DataLoadState isLoading={isLoading} isError={isError} empty={!holdings.length}>
                <div className="space-y-4">
                  {holdings.map((holding) => {
                    const share =
                      portfolio?.totalUsdValue && holding.usdValue
                        ? (holding.usdValue / portfolio.totalUsdValue) * 100
                        : 0;
                    return (
                      <div key={holding.address}>
                        <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 text-[14px]">
                          <div className="min-w-0">
                            <p className="truncate font-bold">{holding.symbol}</p>
                            <p className="truncate text-[11px] text-[var(--m3-on-surface-variant)]">
                              {holding.name}
                            </p>
                          </div>
                          <span className="tabular-nums text-[var(--m3-on-surface-variant)]">
                            {formatAmount(holding.amountUi)}
                          </span>
                          <span className="tabular-nums font-bold">
                            {formatUsd(holding.usdValue)}
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--m3-surface-container-highest)]/50">
                          <div
                            className="h-full rounded-full bg-[var(--m3-primary)]"
                            style={{ width: `${Math.max(share, 2)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DataLoadState>
            </GlassPanel>
          </div>

          <div className="col-span-12 xl:col-span-5 flex flex-col gap-4">
            <GlassPanel>
              <SectionHeader title="Top Movers" />
              <DataLoadState
                isLoading={isLoading}
                isError={isError}
                empty={!portfolio?.topMovers.length}
              >
                <ul className="space-y-3 text-[14px]">
                  {(portfolio?.topMovers ?? []).map((mover) => (
                    <li
                      key={mover.address}
                      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-2 border-b border-white/5 last:border-0"
                    >
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-wider text-[var(--m3-on-surface-variant)] font-bold">
                        {mover.symbol}
                      </span>
                      <span className="truncate text-[var(--m3-on-surface-variant)] text-[12px]">
                        Exposure {formatUsd(mover.usdValue)}
                      </span>
                      <span
                        className={cn(
                          "tabular-nums font-bold",
                          (mover.change24hPct ?? 0) >= 0
                            ? "text-[var(--m3-secondary)]"
                            : "text-[var(--m3-error)]",
                        )}
                      >
                        {formatPercent(mover.change24hPct)}
                      </span>
                    </li>
                  ))}
                </ul>
              </DataLoadState>
            </GlassPanel>
          </div>
        </div>
      )}
    </StitchShell>
  );
}
