"use client";

import { useMemo } from "react";
import { useMarkets } from "@/hooks/use-oraculum-data";
import { FEATURED_TOKENS, STOCK_TOKEN_ADDRESSES } from "@/lib/constants";
import { formatPercent, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import StitchShell, {
  DataLoadState,
  GlassPanel,
  SectionHeader,
  StatCard,
} from "@/components/stitch-shell";

export function StitchMarketsPage() {
  const { data, isLoading, isError } = useMarkets();
  const stockAddressSet = useMemo(
    () => new Set(STOCK_TOKEN_ADDRESSES.map((address) => address.toLowerCase())),
    [],
  );
  const markets = useMemo(
    () =>
      (data?.markets ?? []).filter((market) => !stockAddressSet.has(market.address.toLowerCase())),
    [data?.markets, stockAddressSet],
  );
  const gainers = useMemo(
    () => [...markets].sort((a, b) => (b.change24hPct ?? -999) - (a.change24hPct ?? -999)),
    [markets],
  );
  const losers = useMemo(
    () => [...markets].sort((a, b) => (a.change24hPct ?? 999) - (b.change24hPct ?? 999)),
    [markets],
  );

  return (
    <StitchShell>
      <div className="p-6 pt-0 pb-8 grid grid-cols-12 gap-4">
        <div className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon="trending_up"
            label="Tracked Crypto Assets"
            value={String(markets.length || FEATURED_TOKENS.length - STOCK_TOKEN_ADDRESSES.length)}
            change="Tokens"
            positive={true}
            plainChange={true}
            iconBg="bg-[var(--m3-primary-container)]/20 text-[var(--m3-primary)]"
          />
          <StatCard
            icon="arrow_upward"
            label="Top Gainer"
            value={gainers[0]?.symbol ?? "N/A"}
            change={formatPercent(gainers[0]?.change24hPct)}
            positive={true}
            iconBg="bg-[var(--m3-secondary)]/20 text-[var(--m3-secondary)]"
          />
          <StatCard
            icon="arrow_downward"
            label="Top Loser"
            value={losers[0]?.symbol ?? "N/A"}
            change={formatPercent(losers[0]?.change24hPct)}
            positive={false}
            iconBg="bg-[var(--m3-error)]/10 text-[var(--m3-error)]"
          />
        </div>

        <div className="col-span-12 flex flex-col gap-4 mt-2">
          <GlassPanel>
            <SectionHeader title="Crypto Markets Board" />
            <DataLoadState isLoading={isLoading} isError={isError} empty={!markets.length}>
              <ul className="divide-y divide-white/5">
                {markets.map((row) => (
                  <li
                    key={row.address}
                    className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 py-4 text-[14px]"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-bold">{row.symbol}</p>
                      <p className="truncate text-[11px] text-[var(--m3-on-surface-variant)]">
                        {row.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="tabular-nums font-bold">{formatUsd(row.priceUsd)}</p>
                      <p className="text-[11px] text-[var(--m3-on-surface-variant)]">
                        Vol {formatUsd(row.volume24hUsd)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "tabular-nums font-bold min-w-[80px] text-right",
                        (row.change24hPct ?? 0) >= 0
                          ? "text-[var(--m3-secondary)]"
                          : "text-[var(--m3-error)]",
                      )}
                    >
                      {formatPercent(row.change24hPct)}
                    </span>
                  </li>
                ))}
              </ul>
            </DataLoadState>
          </GlassPanel>
        </div>
      </div>
    </StitchShell>
  );
}
