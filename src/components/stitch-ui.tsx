"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { TokenIcon } from "@/components/ui/token-icon";
import { useMarkets, usePortfolio, useQuote, useWalletBalances } from "@/hooks/use-oraculum-data";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useTokenOptions } from "@/hooks/use-token-options";
import {
  ETH_ADDRESS,
  SYMBOL_TO_ADDRESS,
  USDC_ADDRESS,
  WETH_ADDRESS,
  STOCK_TOKEN_ADDRESSES,
} from "@/lib/constants";
import { formatAmount, formatPercent, formatUsd, shortAddress } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useOraculumStore } from "@/store/oraculum-store";
import type { ExecutionStatus, TokenInfo, VoiceIntent, WalletBalance } from "@/types/dapp";

/* ─── Types ─── */
type TokenChoice = TokenInfo & {
  amountUi?: number;
  amountRaw?: string;
  usdPrice?: number | null;
  usdValue?: number | null;
  priceChange24hPct?: number | null;
};

/* ─── Material Symbol helper ─── */
function MIcon({
  name,
  className,
  fill,
  style,
}: {
  name: string;
  className?: string;
  fill?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={cn("material-symbols-outlined", className)}
      style={{
        ...(fill ? { fontVariationSettings: '"FILL" 1' } : {}),
        ...style,
      }}
    >
      {name}
    </span>
  );
}

/* ─── Sidebar nav items ─── */
const sidebarNavItems = [
  { id: "swap", label: "Swap", icon: "sync_alt", href: "/stitch-preview" },
  { id: "portfolio", label: "Portfolio", icon: "account_balance_wallet", href: "/portfolio" },
  { id: "crypto", label: "Crypto Market", icon: "trending_up", href: "/markets" },
  { id: "stock", label: "Stock Market", icon: "show_chart", href: "/stock-markets" },
  { id: "orders", label: "Orders", icon: "list_alt", href: "/orders" },
  { id: "history", label: "History", icon: "history", href: "/history" },
  { id: "settings", label: "Settings", icon: "settings", href: "/settings" },
  {
    id: "x402",
    label: "Private x402",
    icon: "settings_input_antenna",
    href: "/private-x402-payments",
  },
] as const;

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function StitchUi() {
  /* ── Hooks (all preserved from original) ── */
  const speech = useSpeechRecognition();
  const { address, isConnected } = useAccount();
  const { data: portfolio } = usePortfolio(address);
  const { data: marketPayload } = useMarkets();
  const { data: balances } = useWalletBalances(address);
  const tokenOptions = useTokenOptions();

  const swapInputAddress = useOraculumStore((s) => s.swapInputAddress);
  const swapOutputAddress = useOraculumStore((s) => s.swapOutputAddress);
  const swapAmount = useOraculumStore((s) => s.swapAmount);
  const slippageBps = useOraculumStore((s) => s.slippageBps);
  const lastIntent = useOraculumStore((s) => s.lastIntent);
  const executions = useOraculumStore((s) => s.executions);
  const voiceReviewRequired = useOraculumStore((s) => s.voiceReviewRequired);
  const setSwapPair = useOraculumStore((s) => s.setSwapPair);
  const setSwapAmount = useOraculumStore((s) => s.setSwapAmount);
  const setLastIntent = useOraculumStore((s) => s.setLastIntent);
  const setVoiceReviewRequired = useOraculumStore((s) => s.setVoiceReviewRequired);

  const [isParsing, setIsParsing] = useState(false);
  const [greeting, setGreeting] = useState("Welcome back");
  const [swapMode, setSwapMode] = useState<"crypto" | "stock">("crypto");

  /* ── Derived data ── */
  const markets = marketPayload?.markets ?? [];
  const ethMarket = markets.find((m) => m.symbol === "ETH") ?? markets[0];
  const topMarketMover = [...markets]
    .sort((a, b) => (b.change24hPct ?? -999) - (a.change24hPct ?? -999))
    .at(0);

  const mergedTokens = useMemo<TokenChoice[]>(() => {
    const byAddress = new Map<string, TokenChoice>();
    for (const t of tokenOptions) byAddress.set(t.address.toLowerCase(), t);
    for (const b of balances ?? []) {
      const existing = byAddress.get(b.address.toLowerCase());
      byAddress.set(b.address.toLowerCase(), {
        ...(existing ?? b),
        ...b,
        logoUri: existing?.logoUri ?? b.logoUri,
      });
    }
    return Array.from(byAddress.values());
  }, [balances, tokenOptions]);

  const stockAddressSet = useMemo(
    () => new Set(STOCK_TOKEN_ADDRESSES.map((address) => address.toLowerCase())),
    [],
  );

  const cryptoTokens = useMemo(
    () => mergedTokens.filter((t) => !stockAddressSet.has(t.address.toLowerCase())),
    [mergedTokens, stockAddressSet],
  );
  const stockTokens = useMemo(
    () => mergedTokens.filter((t) => stockAddressSet.has(t.address.toLowerCase())),
    [mergedTokens, stockAddressSet],
  );
  const ethToken = useMemo(
    () => mergedTokens.find((t) => t.address.toLowerCase() === ETH_ADDRESS.toLowerCase())!,
    [mergedTokens],
  );

  let isInputEth = swapInputAddress.toLowerCase() === ETH_ADDRESS.toLowerCase();
  let isOutputEth = swapOutputAddress.toLowerCase() === ETH_ADDRESS.toLowerCase();

  if (!isInputEth && !isOutputEth) {
    isInputEth = true;
  }
  if (isInputEth && isOutputEth) {
    isOutputEth = false;
  }

  const sideTokens = swapMode === "stock" ? stockTokens : cryptoTokens;

  const inputTokensList = isInputEth ? [ethToken].filter(Boolean) : sideTokens;
  const outputTokensList = isOutputEth ? [ethToken].filter(Boolean) : sideTokens;

  const inputToken =
    inputTokensList.find((t) => t.address.toLowerCase() === swapInputAddress.toLowerCase()) ??
    inputTokensList[0] ??
    ethToken;
  const outputToken =
    outputTokensList.find((t) => t.address.toLowerCase() === swapOutputAddress.toLowerCase()) ??
    outputTokensList[1] ??
    outputTokensList[0] ??
    ethToken;

  const handleModeChange = useCallback(
    (mode: "crypto" | "stock") => {
      setSwapMode(mode);
      if (mode === "stock") {
        const firstStock = stockTokens[0];
        if (firstStock) {
          setSwapPair(ETH_ADDRESS, firstStock.address);
        }
      } else {
        const nonEthCrypto = cryptoTokens.find(
          (t) => t.address.toLowerCase() !== ETH_ADDRESS.toLowerCase(),
        );
        if (nonEthCrypto) {
          setSwapPair(ETH_ADDRESS, nonEthCrypto.address);
        } else {
          setSwapPair(ETH_ADDRESS, USDC_ADDRESS);
        }
      }
    },
    [setSwapMode, setSwapPair, stockTokens, cryptoTokens],
  );

  const quoteRequest = useMemo(() => {
    if (!isConnected || !address || !inputToken || !outputToken) return null;
    const amount = Number.parseFloat(swapAmount);
    if (!(amount > 0)) return null;
    try {
      return {
        inputAddress: inputToken.address,
        outputAddress: outputToken.address,
        amountRaw: parseUnits(swapAmount, inputToken.decimals).toString(),
        slippageBps,
        walletAddress: address,
      };
    } catch {
      return null;
    }
  }, [address, inputToken, isConnected, outputToken, slippageBps, swapAmount]);

  const { data: quote } = useQuote(quoteRequest);

  const totalPnl = useMemo(() => {
    const holdings = portfolio?.holdings ?? [];
    const totalUsdChange = holdings.reduce((sum, h) => {
      if (h.usdValue == null || h.priceChange24hPct == null) return sum;
      return sum + (h.usdValue * h.priceChange24hPct) / 100;
    }, 0);
    const totalUsdValue = portfolio?.totalUsdValue ?? 0;
    const totalPct = totalUsdValue > 0 ? (totalUsdChange / totalUsdValue) * 100 : null;
    return { usd: totalUsdChange, pct: totalPct };
  }, [portfolio?.holdings, portfolio?.totalUsdValue]);

  const activityItems = useMemo(
    () => buildActivityCards(executions, lastIntent).slice(0, 3),
    [executions, lastIntent],
  );

  const aiAgents = useMemo(
    () => [
      {
        label: "Sniper Bot Alpha",
        detail: markets.length ? `Monitoring ${markets.length} pairs` : "Monitoring new pairs",
        icon: "track_changes",
        tone: "secondary" as const,
        active: Boolean(markets.length),
      },
      {
        label: "Arbitrage Seeker",
        detail: quote ? "Live route found" : "Scanning DEX spreads",
        icon: "currency_exchange",
        tone: "tertiary" as const,
        active: Boolean(quote),
      },
      {
        label: "Sentiment Analyst",
        detail: speech.supported ? "Twitter & News parser" : "Parser unavailable",
        icon: "insights",
        tone: "muted" as const,
        active: false,
      },
    ],
    [markets.length, quote, speech.supported],
  );

  /* ── Voice intent parser (preserved) ── */
  const parseIntent = useCallback(
    async (transcript: string) => {
      if (!transcript.trim()) return;
      setIsParsing(true);
      try {
        const response = await fetch("/api/voice/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript }),
        });
        const payload = (await response.json()) as VoiceIntent & { error?: string };
        if (!response.ok) throw new Error(payload.error ?? "Unable to parse transcript.");

        setLastIntent(payload);
        const inputAddr = payload.inputSymbol ? SYMBOL_TO_ADDRESS[payload.inputSymbol] : undefined;
        const outputAddr = payload.outputSymbol
          ? SYMBOL_TO_ADDRESS[payload.outputSymbol]
          : undefined;
        if (payload.amount) setSwapAmount(payload.amount);
        if (inputAddr && outputAddr) setSwapPair(inputAddr, outputAddr);
        setVoiceReviewRequired(
          Boolean(
            (payload.action === "swap" || payload.action === "buy" || payload.action === "sell") &&
            payload.amount &&
            inputAddr &&
            outputAddr,
          ),
        );
      } finally {
        setIsParsing(false);
      }
    },
    [setLastIntent, setSwapAmount, setSwapPair, setVoiceReviewRequired],
  );

  useEffect(() => {
    if (!speech.listening && speech.hasFinalTranscript && speech.transcript.trim()) {
      void parseIntent(speech.transcript);
    }
  }, [parseIntent, speech.hasFinalTranscript, speech.listening, speech.transcript]);

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  /* ── Handlers (preserved) ── */
  const applySuggestion = (inputAddr: string, outputAddr: string, amount: string) => {
    setSwapPair(inputAddr, outputAddr);
    setSwapAmount(amount);
  };

  const handleSwapDirection = () => {
    if (!inputToken || !outputToken) return;
    setSwapPair(outputToken.address, inputToken.address);
  };

  const handleAmountChange = (value: string) => {
    const normalized = value.replace(/[^\d.]/g, "").replace(/(\..*)\./, "$1");
    setSwapAmount(normalized);
  };

  const handleInputTokenChange = (nextAddress: string) => {
    setSwapPair(
      nextAddress,
      nextAddress.toLowerCase() === swapOutputAddress.toLowerCase()
        ? swapInputAddress
        : swapOutputAddress,
    );
  };

  const handleOutputTokenChange = (nextAddress: string) => {
    setSwapPair(
      nextAddress.toLowerCase() === swapInputAddress.toLowerCase()
        ? swapOutputAddress
        : swapInputAddress,
      nextAddress,
    );
  };

  /* ── Derived display values ── */
  const riskScore = executions.some((e) => e.status === "failed")
    ? "Medium"
    : voiceReviewRequired
      ? "Review"
      : "Low";

  const activeAgentCount = aiAgents.filter((a) => a.active).length;

  const activityFeed = activityItems.length
    ? activityItems
    : [
        {
          title: "Awaiting trades",
          detail: "Voice or manual swap actions will appear here",
          status: "Standby",
          time: "live",
          icon: "sync_alt",
        },
      ];

  /* ═══════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════ */
  return (
    <div className="stitch-m3 relative min-h-screen w-full font-[var(--font-hanken)] text-[16px] font-normal leading-[1.5] text-[var(--m3-on-surface)]">
      {/* ── Video Background ── */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 z-0 h-full w-full object-cover pointer-events-none"
      >
        <source src="/bg-hero.mp4" type="video/mp4" />
      </video>

      {/* ── Outer Shell ── */}
      <div className="relative z-10 flex min-h-screen w-full">
        {/* ═══════════ SIDEBAR ═══════════ */}
        <nav className="sticky top-0 z-50 hidden h-screen w-[260px] shrink-0 flex-col border-r border-[var(--m3-outline-variant)]/10 bg-transparent py-6 backdrop-blur-xl lg:flex">
          {/* Brand */}
          <div className="mb-6 flex items-center gap-3 px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-[var(--m3-primary)] to-[var(--m3-tertiary)] font-bold text-[var(--m3-on-primary)]">
              S
            </div>
            <div>
              <h1 className="font-[var(--font-sora)] text-[20px] font-bold leading-none tracking-tight text-[var(--m3-on-surface)]">
                StockVoice
              </h1>
              <p className="mt-1 font-[var(--font-geist)] text-[9px] tracking-widest text-[var(--m3-on-surface-variant)]">
                VOICE TRADING TERMINAL
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex-1 space-y-0.5 overflow-y-auto px-2">
            {sidebarNavItems.map((item) => {
              const isActive = item.id === "swap";
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "mx-2 flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all",
                    isActive
                      ? "bg-[var(--m3-primary-container)] font-bold text-[var(--m3-on-primary-container)]"
                      : "text-[var(--m3-on-surface-variant)] hover:bg-white/5 hover:text-[var(--m3-primary)]",
                  )}
                >
                  <MIcon name={item.icon} className="text-[20px]" fill={isActive} />
                  <span className="flex-1 font-[var(--font-geist)] text-[14px] font-medium leading-[1.2] tracking-[0.05em]">
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="h-1.5 w-1.5 rounded-full bg-[var(--m3-secondary)]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Wallet Status */}
          <div className="mt-auto px-4 mb-2">
            <div className="glass-panel rounded-xl p-3 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-[var(--font-geist)] text-[10px] uppercase tracking-wider text-[var(--m3-on-surface-variant)]">
                  Wallet
                </span>
                <div className="flex items-center gap-1.5 text-[var(--m3-secondary)]">
                  <div
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      isConnected
                        ? "bg-[var(--m3-secondary)] animate-pulse"
                        : "bg-[var(--m3-on-surface-variant)]",
                    )}
                  />
                  <span className="font-[var(--font-geist)] text-[9px]">
                    {isConnected ? "Connected" : "Standby"}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-[var(--font-geist)] text-[12px]">
                  {isConnected ? shortAddress(address) : "Connect wallet"}
                </span>
                {isConnected && (
                  <button
                    type="button"
                    onClick={() => void navigator.clipboard.writeText(address ?? "")}
                    aria-label="Copy wallet address"
                  >
                    <MIcon
                      name="content_copy"
                      className="text-[14px] text-[var(--m3-on-surface-variant)] cursor-pointer"
                    />
                  </button>
                )}
              </div>
              <StitchConnectButton />
            </div>
          </div>
        </nav>

        {/* ═══════════ MAIN CONTENT ═══════════ */}
        <div className="relative z-10 flex flex-1 flex-col min-h-screen bg-transparent">
          {/* ── Top Header ── */}
          <header className="flex h-16 w-full items-center justify-between px-6 shrink-0 z-40">
            <div>
              <h2 className="font-[var(--font-sora)] text-[24px] font-bold">
                {greeting}, {isConnected ? "trader" : "Trader"} 👋
              </h2>
              <p className="mt-0.5 text-[14px] leading-none text-[var(--m3-on-surface-variant)]">
                Your AI trading assistant is ready.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StitchConnectButton compact />
              <button
                type="button"
                className="glass-panel relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--m3-outline-variant)]/50 hover:bg-white/10"
              >
                <MIcon name="notifications" className="text-[20px]" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--m3-error)]" />
              </button>
            </div>
          </header>

          {/* ── Dashboard Canvas ── */}
          <main className="flex-1 grid grid-cols-12 gap-4 p-6 pt-0 pb-8">
            {/* ──── Stats Row ──── */}
            <div className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon="account_balance"
                label="Portfolio Value"
                value={isConnected ? formatUsd(portfolio?.totalUsdValue) : "Connect"}
                change={isConnected ? formatPercent(totalPnl.pct) : "Live wallet required"}
                positive={(totalPnl.pct ?? 0) >= 0}
                iconBg="bg-[var(--m3-primary-container)]/20 text-[var(--m3-primary)]"
              />
              <StatCard
                icon="sync_alt"
                label="Total P&L"
                value={isConnected ? formatUsd(totalPnl.usd) : "N/A"}
                change={isConnected ? formatPercent(totalPnl.pct) : "No connected wallet"}
                positive={(totalPnl.pct ?? 0) >= 0}
                valueColor={(totalPnl.pct ?? 0) >= 0 ? "text-[var(--m3-secondary)]" : ""}
                iconBg="bg-[var(--m3-secondary)]/20 text-[var(--m3-secondary)]"
              />
              <StatCard
                icon="data_usage"
                label="Top Mover"
                value={topMarketMover?.symbol ?? "Waiting"}
                change={formatPercent(topMarketMover?.change24hPct)}
                positive={(topMarketMover?.change24hPct ?? 0) >= 0}
                iconBg="bg-[var(--m3-tertiary)]/20 text-[var(--m3-tertiary)]"
              />
              <StatCard
                icon="verified_user"
                label="Risk Score"
                value={riskScore}
                change={voiceReviewRequired ? "Voice confirmation pending" : "Stable"}
                positive={riskScore !== "Medium"}
                plainChange
                iconBg="bg-[var(--m3-secondary)]/20 text-[var(--m3-secondary)]"
              />
            </div>

            {/* ──── Main 2-Column Layout ──── */}
            <div className="col-span-12 grid grid-cols-12 gap-4">
              {/* LEFT COLUMN: Voice Hub, Market Overview, AI Flow */}
              <div className="col-span-12 xl:col-span-8 flex flex-col gap-4">
                {/* Voice Hub */}
                <section className="min-h-[340px] glass-panel-active rounded-3xl p-6 relative flex flex-col items-center justify-center overflow-hidden border border-[var(--m3-primary)]/10">
                  {/* Visualizer Background */}
                  <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
                    <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-[var(--m3-primary)] to-transparent opacity-20 blur-sm" />
                    <svg
                      className="absolute h-32 w-full opacity-40"
                      preserveAspectRatio="none"
                      viewBox="0 0 800 200"
                    >
                      <path
                        className="animate-pulse"
                        d="M0,100 Q50,50 100,100 T200,100 T300,100 T400,100 T500,100 T600,100 T700,100 T800,100"
                        fill="none"
                        stroke="var(--m3-primary)"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>

                  {/* Plasma Core / Mic Button */}
                  <div className="relative z-10 mb-4 scale-75">
                    <button
                      type="button"
                      onClick={() => (speech.listening ? speech.stop() : speech.start())}
                      disabled={!speech.supported}
                      className="relative flex h-64 w-64 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-60 transition-transform hover:scale-105 active:scale-95"
                    >
                      <div className="absolute inset-0 rounded-full bg-[var(--m3-primary)] blur-3xl opacity-20 animate-pulse" />
                      <img
                        src="/mic-orb.png"
                        alt="Voice Input"
                        className="relative z-10 h-full w-full object-cover rounded-full"
                      />
                    </button>
                  </div>

                  {/* Status Text */}
                  <div className="z-10 mb-4 text-center">
                    <h2 className="font-[var(--font-sora)] text-[36px] font-bold tracking-tight mb-1">
                      {speech.listening
                        ? "I'm Listening..."
                        : isParsing
                          ? "Parsing command..."
                          : lastIntent?.action
                            ? `Intent: ${lastIntent.action}`
                            : "I'm Listening..."}
                    </h2>
                    <p className="text-[16px] text-[var(--m3-on-surface-variant)]">
                      {speech.error
                        ? speech.error
                        : speech.transcript
                          ? `"${speech.transcript}"`
                          : "How can I help with your trade?"}
                    </p>
                  </div>

                  {/* AI Engine Ready badge */}
                  <div className="z-10 mb-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[var(--m3-surface-container-high)]/20 px-3 py-1 border border-[var(--m3-outline-variant)]/10 backdrop-blur-md">
                      <div className="h-1.5 w-1.5 rounded-full bg-[var(--m3-secondary)] animate-pulse" />
                      <span className="font-[var(--font-geist)] text-[11px] text-[var(--m3-on-surface-variant)]">
                        {isParsing ? "Parsing live transcript" : "AI Engine Ready"}
                      </span>
                    </div>
                  </div>

                  {/* Suggestion Buttons */}
                  <div className="flex flex-wrap gap-3 z-10 justify-center">
                    <button
                      type="button"
                      onClick={() => applySuggestion(USDC_ADDRESS, ETH_ADDRESS, "250")}
                      className="px-4 py-2 rounded-full border border-[var(--m3-primary)]/30 bg-[var(--m3-primary)]/5 hover:bg-[var(--m3-primary)]/10 transition-all text-[13px] font-semibold text-white"
                    >
                      Buy $250 ETH
                    </button>
                    <button
                      type="button"
                      onClick={() => applySuggestion(ETH_ADDRESS, USDC_ADDRESS, "0.5")}
                      className="px-4 py-2 rounded-full border border-[var(--m3-tertiary)]/30 bg-[var(--m3-tertiary)]/5 hover:bg-[var(--m3-tertiary)]/10 transition-all text-[13px] font-semibold text-white"
                    >
                      Swap ETH to USDC
                    </button>
                    <button
                      type="button"
                      onClick={() => applySuggestion(ETH_ADDRESS, WETH_ADDRESS, "1")}
                      className="px-4 py-2 rounded-full border border-[var(--m3-secondary)]/30 bg-[var(--m3-secondary)]/5 hover:bg-[var(--m3-secondary)]/10 transition-all text-[13px] font-semibold text-white"
                    >
                      Wrap into WETH
                    </button>
                  </div>
                </section>

                {/* AI Execution Flow */}
                <div className="glass-panel rounded-3xl p-6 border border-white/5 overflow-x-auto min-h-[140px] flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-[var(--font-geist)] text-[12px] font-bold uppercase tracking-wider text-[var(--m3-on-surface-variant)]">
                      AI Execution Flow
                    </h3>
                  </div>
                  <div className="flex items-center justify-between relative min-w-[600px]">
                    {/* Connecting line */}
                    <div className="absolute top-5 left-0 w-full h-px border-t border-dashed border-[var(--m3-outline-variant)]/30 -z-0" />
                    <FlowStep
                      icon="mic"
                      label="Voice Input"
                      detail={speech.listening ? "Listening..." : "Ready"}
                      active={speech.listening || Boolean(lastIntent)}
                    />
                    <FlowStep
                      icon="psychology"
                      label="AI Understanding"
                      detail={isParsing ? "Processing" : lastIntent?.action ? "Parsed" : "Standby"}
                      active={isParsing || Boolean(lastIntent)}
                    />
                    <FlowStep
                      icon="shield"
                      label="Risk Analysis"
                      detail={voiceReviewRequired ? "Safety check" : "Ready"}
                      active={voiceReviewRequired}
                    />
                    <FlowStep
                      icon="alt_route"
                      label="Route Planning"
                      detail={quote ? "Path found" : "Finding path"}
                      active={Boolean(quote)}
                    />
                    <FlowStep
                      icon="play_arrow"
                      label="Execution"
                      detail={executions.length ? executions[0].status : "On-chain"}
                      active={Boolean(executions.length)}
                    />
                    <FlowStep
                      icon="check_circle"
                      label="Confirmation"
                      detail={
                        executions.some((e) => e.status === "confirmed") ? "Complete" : "Waiting"
                      }
                      active={executions.some((e) => e.status === "confirmed")}
                    />
                  </div>
                </div>

                {/* Market Overview */}
                <div className="glass-panel rounded-3xl p-6 border border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-[var(--font-geist)] text-[12px] font-bold uppercase tracking-wider text-[var(--m3-on-surface-variant)]">
                      Market Overview
                    </h3>
                    <div className="flex items-center gap-2 bg-[var(--m3-surface-container-high)]/20 px-2 py-1 rounded-lg border border-[var(--m3-outline-variant)]/10">
                      <span className="text-[11px] font-bold">24H</span>
                      <MIcon name="expand_more" className="text-[14px]" />
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <TokenIcon
                          symbol={ethMarket?.symbol}
                          logoUri={ethMarket?.logoUri}
                          size="sm"
                          className="h-5 w-5"
                        />
                        <span className="text-[14px] font-bold text-[var(--m3-on-surface-variant)]">
                          {ethMarket?.symbol ?? "ETH"} / USD
                        </span>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <h4 className="text-[36px] font-bold">{formatUsd(ethMarket?.priceUsd)}</h4>
                        <span
                          className={cn(
                            "font-bold text-[14px]",
                            (ethMarket?.change24hPct ?? 0) >= 0
                              ? "text-[var(--m3-secondary)]"
                              : "text-[var(--m3-error)]",
                          )}
                        >
                          {formatPercent(ethMarket?.change24hPct)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 h-16 max-w-md hidden lg:block">
                      <svg
                        className={cn(
                          "h-full w-full fill-none",
                          (ethMarket?.change24hPct ?? 0) >= 0
                            ? "stroke-[var(--m3-secondary)]"
                            : "stroke-[var(--m3-error)]",
                        )}
                        strokeWidth="2"
                        viewBox="0 0 400 60"
                      >
                        <path d="M0,10 L40,15 L80,45 L120,35 L160,55 L200,40 L240,50 L280,20 L320,45 L360,30 L400,50" />
                      </svg>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      <MarketMetric label="24H Volume" value={formatUsd(ethMarket?.volume24hUsd)} />
                      <MarketMetric label="Liquidity" value={formatUsd(ethMarket?.liquidityUsd)} />
                      <MarketMetric label="Top Mover" value={topMarketMover?.symbol ?? "N/A"} />
                      <MarketMetric label="Market Cap" value={formatUsd(ethMarket?.marketCap)} />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Swap Widget, Active AI Agents, Recent Activity */}
              <div className="col-span-12 xl:col-span-4 flex flex-col gap-4">
                {/* Swap Widget */}
                <section className="glass-panel rounded-3xl p-5 flex flex-col border border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-[var(--font-geist)] text-[12px] font-bold uppercase tracking-wider text-[var(--m3-on-surface-variant)]">
                        Swap
                      </h3>
                      <div className="flex bg-white/5 rounded-full p-0.5 ml-2">
                        <button
                          type="button"
                          onClick={() => handleModeChange("crypto")}
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors",
                            swapMode === "crypto"
                              ? "bg-[var(--m3-primary)] text-black"
                              : "text-[var(--m3-on-surface-variant)] hover:text-white",
                          )}
                        >
                          Crypto
                        </button>
                        <button
                          type="button"
                          onClick={() => handleModeChange("stock")}
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors",
                            swapMode === "stock"
                              ? "bg-[var(--m3-primary)] text-black"
                              : "text-[var(--m3-on-surface-variant)] hover:text-white",
                          )}
                        >
                          Stock
                        </button>
                      </div>
                    </div>
                    <Link
                      href="/settings"
                      className="text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-primary)] transition-colors"
                    >
                      <MIcon name="tune" className="text-[18px]" />
                    </Link>
                  </div>

                  {/* Swap Legs */}
                  <div className="space-y-3 flex-1 flex flex-col justify-center">
                    {/* Input leg */}
                    <SwapLegCard
                      token={inputToken}
                      amount={swapAmount}
                      onAmountChange={handleAmountChange}
                      tokens={inputTokensList}
                      onTokenChange={handleInputTokenChange}
                    />

                    {/* Swap direction button */}
                    <div className="flex justify-center -my-2 relative z-10">
                      <button
                        type="button"
                        onClick={handleSwapDirection}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--m3-surface-container-high)] border border-[var(--m3-outline-variant)]/30 text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-primary)] transition-colors shadow-md"
                      >
                        <MIcon name="swap_vert" className="text-[16px]" />
                      </button>
                    </div>

                    {/* Output leg */}
                    <SwapLegCard
                      token={outputToken}
                      amount={quote ? formatAmount(quote.outAmountUi, 4) : "0.00"}
                      readOnly
                      tokens={outputTokensList}
                      onTokenChange={handleOutputTokenChange}
                    />
                  </div>

                  {/* Review Button + Fee */}
                  <div className="mt-4">
                    <Link
                      href="/"
                      className="block w-full btn-primary-gradient text-center text-white font-bold py-3 rounded-xl text-[14px]"
                    >
                      Review Swap
                    </Link>
                    <div className="flex justify-between text-[10px] text-[var(--m3-on-surface-variant)] mt-2 px-1">
                      <span>Network Fee</span>
                      <span>
                        {quote?.estimatedGas
                          ? `${formatAmount(Number(formatUnits(BigInt(quote.estimatedGas), 9)), 6)} ETH`
                          : "~ dynamic"}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Active AI Agents */}
                <div className="glass-panel rounded-3xl p-6 border border-white/5 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-[var(--font-geist)] text-[12px] font-bold uppercase tracking-wider text-[var(--m3-on-surface-variant)]">
                      Active AI Agents
                    </h3>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)] text-[10px] font-bold">
                      {activeAgentCount}
                    </span>
                  </div>
                  <div className="space-y-3 flex-1 flex flex-col justify-center">
                    {aiAgents.map((agent) => (
                      <AgentRow key={agent.label} {...agent} />
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="glass-panel rounded-3xl p-6 border border-white/5 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-[var(--font-geist)] text-[12px] font-bold uppercase tracking-wider text-[var(--m3-on-surface-variant)]">
                      Recent Activity
                    </h3>
                    <Link
                      href="/history"
                      className="text-[11px] text-[var(--m3-primary)] hover:underline font-bold"
                    >
                      View all
                    </Link>
                  </div>
                  <div className="space-y-3 flex-1 flex flex-col justify-center">
                    {activityFeed.map((item) => (
                      <ActivityCard key={item.title + item.time} {...item} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* ── Mobile Bottom Nav ── */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--m3-outline-variant)]/10 bg-[var(--m3-surface)]/80 px-2 py-2 backdrop-blur-xl lg:hidden">
          <div className="grid grid-cols-4 gap-1">
            {[
              { icon: "sync_alt", label: "Swap", href: "/stitch-preview" },
              { icon: "account_balance_wallet", label: "Portfolio", href: "/portfolio" },
              { icon: "trending_up", label: "Markets", href: "/markets" },
              { icon: "history", label: "History", href: "/history" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-medium text-[var(--m3-on-surface-variant)]"
              >
                <MIcon name={item.icon} className="text-[20px]" />
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

function StitchConnectButton({ compact = false }: { compact?: boolean }) {
  return (
    <ConnectButton.Custom>
      {({ account, mounted, openAccountModal, openConnectModal }) => {
        const connected = mounted && Boolean(account);
        return (
          <button
            type="button"
            onClick={connected ? openAccountModal : openConnectModal}
            className={cn(
              "glass-panel inline-flex items-center justify-center gap-2 rounded-full border border-[var(--m3-outline-variant)]/50 text-white transition-colors hover:bg-white/10",
              compact ? "px-4 py-2 text-[13px] font-semibold" : "w-full py-1.5 mt-1 text-[11px]",
            )}
          >
            <MIcon
              name="account_balance_wallet"
              className={compact ? "text-[18px]" : "text-[14px]"}
            />
            <span>{connected ? shortAddress(account?.address) : "Connect Wallet"}</span>
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}

function StatCard({
  icon,
  label,
  value,
  change,
  positive,
  plainChange = false,
  valueColor = "",
  iconBg,
}: {
  icon: string;
  label: string;
  value: string;
  change: string;
  positive: boolean;
  plainChange?: boolean;
  valueColor?: string;
  iconBg: string;
}) {
  return (
    <div className="glass-panel rounded-2xl p-3.5 flex flex-col justify-center border border-white/5">
      <div className="flex items-center gap-2 mb-1">
        <div className={cn("flex h-6 w-6 items-center justify-center rounded", iconBg)}>
          <MIcon name={icon} className="text-[14px]" />
        </div>
        <span className="font-[var(--font-geist)] text-[10px] font-semibold uppercase tracking-wider text-[var(--m3-on-surface-variant)]">
          {label}
        </span>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <h3
            className={cn(
              "font-[var(--font-sora)] text-[22px] font-bold leading-none mb-1",
              valueColor,
            )}
          >
            {value}
          </h3>
          <div
            className={cn(
              "flex items-center gap-1 text-[11px]",
              plainChange
                ? "text-[var(--m3-on-surface-variant)]"
                : positive
                  ? "text-[var(--m3-secondary)]"
                  : "text-[var(--m3-error)]",
            )}
          >
            {!plainChange && <MIcon name="arrow_upward" className="text-[12px]" />}
            <span className="font-semibold">{change}</span>
          </div>
        </div>
        {!plainChange && (
          <div className="h-6 w-12 opacity-60">
            <svg
              className={cn(
                "h-full w-full fill-none",
                positive ? "stroke-[var(--m3-secondary)]" : "stroke-[var(--m3-error)]",
              )}
              strokeWidth="2"
              viewBox="0 0 100 40"
            >
              <path d="M0,35 Q10,20 20,25 T40,15 T60,20 T80,5 T100,10" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

function CustomTokenSelect({
  token,
  tokens,
  onChange,
}: {
  token?: TokenChoice;
  tokens: TokenChoice[];
  onChange?: (address: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function clickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 cursor-pointer bg-transparent outline-none focus:outline-none"
      >
        <TokenIcon symbol={token?.symbol} logoUri={token?.logoUri} size="sm" className="h-6 w-6" />
        <span className="text-[16px] font-bold text-white uppercase">{token?.symbol}</span>
        <MIcon name="expand_more" className="text-[18px] text-[var(--m3-on-surface-variant)]" />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 z-50 w-56 mt-2 overflow-y-auto overscroll-contain rounded-xl border border-white/10 bg-[#0b1326] shadow-2xl ring-1 ring-black/5"
          style={{ maxHeight: "208px" }} // Roughly 4 items
        >
          <div className="flex flex-col py-2">
            {tokens.map((t) => (
              <button
                key={t.address}
                type="button"
                onClick={() => {
                  onChange?.(t.address);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/10 w-full",
                  token?.address === t.address ? "bg-white/5" : "",
                )}
              >
                <TokenIcon
                  symbol={t.symbol}
                  logoUri={t.logoUri}
                  size="sm"
                  className="h-6 w-6 shrink-0"
                />
                <span className="text-[14px] font-bold text-white uppercase truncate">
                  {t.symbol}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SwapLegCard({
  token,
  amount,
  readOnly = false,
  tokens,
  onTokenChange,
  onAmountChange,
}: {
  token?: TokenChoice;
  amount: string;
  readOnly?: boolean;
  tokens: TokenChoice[];
  onTokenChange?: (address: string) => void;
  onAmountChange?: (value: string) => void;
}) {
  return (
    <div className="rounded-xl p-3 border border-[var(--m3-outline-variant)]/10 bg-[var(--m3-surface-container-high)]/10">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center bg-[var(--m3-surface-container-low)] px-3 py-1.5 rounded-[12px] border border-[var(--m3-outline-variant)]/20 shadow-sm">
          <CustomTokenSelect token={token} tokens={tokens} onChange={onTokenChange} />
        </div>
        <input
          type="text"
          readOnly={readOnly}
          value={amount}
          onChange={(e) => onAmountChange?.(e.target.value)}
          className={cn(
            "bg-transparent text-right font-[var(--font-sora)] text-[20px] font-bold outline-none w-1/2 p-0 border-none focus:ring-0",
            readOnly ? "cursor-default text-white/75" : "text-white",
          )}
        />
      </div>
      <div className="flex justify-between text-[11px] text-[var(--m3-on-surface-variant)] px-1 mt-2">
        <span>
          Balance: {formatAmount((token as WalletBalance | undefined)?.amountUi ?? 0, 4)}{" "}
          {token?.symbol ?? ""}
        </span>
        <span>{formatUsd((token as WalletBalance | undefined)?.usdValue)}</span>
      </div>
    </div>
  );
}

function AgentRow({
  label,
  detail,
  icon,
  tone,
  active,
}: {
  label: string;
  detail: string;
  icon: string;
  tone: "secondary" | "tertiary" | "muted";
  active: boolean;
}) {
  const toneVar =
    tone === "secondary"
      ? "var(--m3-secondary)"
      : tone === "tertiary"
        ? "var(--m3-tertiary)"
        : "var(--m3-on-surface-variant)";

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-xl border border-white/5 transition-colors cursor-pointer",
        active
          ? "bg-[var(--m3-surface-container-highest)]/20 hover:bg-white/5"
          : "bg-[var(--m3-surface-container-highest)]/5 opacity-60",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-[var(--m3-surface-container)] border border-white/10">
          <MIcon name={icon} className="text-[16px]" style={{ color: toneVar }} />
        </div>
        <div>
          <div className="text-[14px] font-bold text-white leading-none mb-1">{label}</div>
          <div className="text-[11px] text-[var(--m3-on-surface-variant)]">{detail}</div>
        </div>
      </div>
      <div
        className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide"
        style={{
          color: toneVar,
          borderColor: `color-mix(in srgb, ${toneVar} 20%, transparent)`,
          backgroundColor: `color-mix(in srgb, ${toneVar} 10%, transparent)`,
          borderWidth: "1px",
          borderStyle: "solid",
        }}
      >
        <div
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: active ? toneVar : "var(--m3-on-surface-variant)" }}
        />
        {active ? "Active" : "Paused"}
      </div>
    </div>
  );
}

function MarketMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-[var(--m3-on-surface-variant)] uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-[14px] font-bold">{value}</div>
    </div>
  );
}

function ActivityCard({
  title,
  detail,
  status,
  time,
  icon: iconName,
}: {
  title: string;
  detail: string;
  status: string;
  time: string;
  icon?: string;
}) {
  const resolvedIcon =
    iconName ??
    (title.toLowerCase().includes("swap")
      ? "sync_alt"
      : title.toLowerCase().includes("bridge")
        ? "account_tree"
        : title.toLowerCase().includes("buy")
          ? "shopping_cart"
          : "history");

  const iconColor = title.toLowerCase().includes("swap")
    ? "text-[var(--m3-primary)]"
    : title.toLowerCase().includes("bridge")
      ? "text-[var(--m3-tertiary)]"
      : "text-[var(--m3-secondary)]";

  const iconBg = title.toLowerCase().includes("swap")
    ? "bg-[var(--m3-primary)]/10"
    : title.toLowerCase().includes("bridge")
      ? "bg-[var(--m3-tertiary)]/10"
      : "bg-[var(--m3-secondary)]/10";

  return (
    <div className="bg-[var(--m3-surface-container-highest)]/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center">
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full mb-3",
          iconBg,
          iconColor,
        )}
      >
        <MIcon name={resolvedIcon} className="text-[20px]" />
      </div>
      <div className="text-[14px] font-bold mb-0.5">{title}</div>
      <div className="text-[11px] text-[var(--m3-on-surface-variant)] mb-2">{detail}</div>
      <div className="text-[10px] text-[var(--m3-secondary)] font-bold">{status}</div>
      <div className="text-[9px] text-[var(--m3-on-surface-variant)]">{time}</div>
    </div>
  );
}

function FlowStep({
  icon,
  label,
  detail,
  active,
}: {
  icon: string;
  label: string;
  detail: string;
  active?: boolean;
}) {
  return (
    <div className={cn("relative z-10 flex flex-col items-center gap-2", !active && "opacity-40")}>
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border",
          active
            ? "border-[var(--m3-primary)]/50 bg-[var(--m3-primary)]/20 text-[var(--m3-primary)] shadow-[0_0_15px_rgba(192,193,255,0.3)]"
            : "border-white/10 bg-[var(--m3-surface-container)] text-[var(--m3-on-surface-variant)]",
        )}
      >
        <MIcon name={icon} className="text-[18px]" />
      </div>
      <div className="text-center">
        <div className="text-[11px] font-bold">{label}</div>
        <div
          className={cn(
            "text-[9px]",
            active
              ? "text-[var(--m3-primary)] animate-pulse"
              : "text-[var(--m3-on-surface-variant)]",
          )}
        >
          {detail}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITIES (preserved from original)
   ═══════════════════════════════════════════════════════════════════════════ */

function buildActivityCards(executions: ExecutionStatus[], lastIntent?: VoiceIntent) {
  const executionCards = executions.slice(0, 2).map((execution) => ({
    title: execution.inputSymbol && execution.outputSymbol ? "Swap" : "Execution",
    detail:
      execution.inputSymbol && execution.outputSymbol
        ? `${execution.inputSymbol} → ${execution.outputSymbol}`
        : shortAddress(execution.hash),
    status: execution.status.replace("_", " "),
    time: timeAgo(execution.createdAt),
  }));

  const intentCard = lastIntent
    ? [
        {
          title:
            lastIntent.action === "buy" ? "Buy" : lastIntent.action === "sell" ? "Sell" : "Voice",
          detail:
            lastIntent.inputSymbol && lastIntent.outputSymbol
              ? `${lastIntent.inputSymbol} → ${lastIntent.outputSymbol}`
              : `${lastIntent.action} intent`,
          status: "Parsed",
          time: "just now",
        },
      ]
    : [];

  return [...executionCards, ...intentCard];
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function timeAgo(value: string) {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return "just now";

  const diffMinutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60_000));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return `${Math.floor(diffHours / 24)}d ago`;
}
