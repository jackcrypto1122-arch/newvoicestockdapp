"use client";

import { useAccount } from "wagmi";
import { useOraculumStore } from "@/store/oraculum-store";
import { useTokenOptions } from "@/hooks/use-token-options";
import { shortAddress } from "@/lib/format";
import StitchShell, { GlassPanel, SectionHeader, MIcon } from "@/components/stitch-shell";
import { TokenSelectField } from "@/components/token/token-select-field";

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 py-2 border-b border-white/5 last:border-0">
      <span className="text-[12px] text-[var(--m3-on-surface-variant)]">{k}</span>
      <span className="truncate text-right font-bold text-[14px]">{v}</span>
    </div>
  );
}

function TokenSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const tokens = useTokenOptions();
  return <TokenSelectField label={label} value={value} onChange={onChange} tokens={tokens} />;
}

export function StitchSettingsPage() {
  const { address } = useAccount();
  const swapInputAddress = useOraculumStore((state) => state.swapInputAddress);
  const swapOutputAddress = useOraculumStore((state) => state.swapOutputAddress);
  const slippageBps = useOraculumStore((state) => state.slippageBps);
  const priorityFee = useOraculumStore((state) => state.priorityFee);
  const setSwapPair = useOraculumStore((state) => state.setSwapPair);
  const setSlippage = useOraculumStore((state) => state.setSlippage);
  const setPriorityFee = useOraculumStore((state) => state.setPriorityFee);

  const copyRpc = async () => {
    await navigator.clipboard.writeText(
      process.env.NEXT_PUBLIC_ROBINHOOD_RPC_URL ?? "https://rpc.mainnet.chain.robinhood.com",
    );
  };

  return (
    <StitchShell>
      <div className="p-6 pt-0 pb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassPanel>
          <SectionHeader title="Trading Defaults" />
          <div className="grid gap-4 mt-2">
            <TokenSelect
              label="Input token"
              value={swapInputAddress}
              onChange={(address) => setSwapPair(address, swapOutputAddress)}
            />
            <TokenSelect
              label="Output token"
              value={swapOutputAddress}
              onChange={(address) => setSwapPair(swapInputAddress, address)}
            />
          </div>
        </GlassPanel>

        <GlassPanel>
          <SectionHeader title="Safety Controls" />
          <div className="space-y-4 mt-2">
            <div>
              <label className="block text-[12px] text-[var(--m3-on-surface-variant)] mb-2">
                Slippage:{" "}
                <span className="text-white font-bold">{(slippageBps / 100).toFixed(2)}%</span>
              </label>
              <div className="flex gap-2 mb-3">
                {[0.5, 1, 2.5, 5].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setSlippage(pct * 100)}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] text-[var(--m3-on-surface-variant)] transition-colors hover:text-white hover:bg-white/10"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={10}
                max={5000}
                step={10}
                value={slippageBps}
                onChange={(event) => setSlippage(Number(event.target.value))}
                className="w-full accent-[var(--m3-primary)]"
              />
            </div>
            <div>
              <label className="block text-[12px] text-[var(--m3-on-surface-variant)] mb-2">
                Priority fee
              </label>
              <select
                value={priorityFee}
                onChange={(event) =>
                  setPriorityFee(event.target.value as "auto" | "low" | "medium" | "high")
                }
                className="w-full rounded-xl border border-white/10 bg-[var(--m3-surface-container)] px-3 py-2.5 text-[14px] text-white outline-none focus:border-[var(--m3-primary)]/50"
              >
                <option value="auto">Auto</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel>
          <SectionHeader title="Connection" />
          <div className="space-y-1 mt-2">
            <Row k="Address" v={shortAddress(address)} />
            <Row k="Network" v="Robinhood Chain mainnet" />
            <Row k="Connectors" v="MetaMask, WalletConnect, RainbowKit" />
          </div>
        </GlassPanel>

        <GlassPanel>
          <SectionHeader title="RPC Endpoint" />
          <div className="space-y-4 mt-2">
            <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-[11px] text-[var(--m3-on-surface-variant)] break-all">
              {process.env.NEXT_PUBLIC_ROBINHOOD_RPC_URL ??
                "https://rpc.mainnet.chain.robinhood.com"}
            </p>
            <button
              type="button"
              onClick={copyRpc}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 text-[13px] font-bold text-white w-full justify-center"
            >
              <MIcon name="content_copy" className="text-[16px]" />
              Copy Endpoint
            </button>
          </div>
        </GlassPanel>
      </div>
    </StitchShell>
  );
}
