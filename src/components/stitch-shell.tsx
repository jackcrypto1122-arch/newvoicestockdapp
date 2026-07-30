"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { cn } from "@/lib/utils";
import { shortAddress } from "@/lib/format";

/* ─── Material Symbol helper ─── */
export function MIcon({
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
  { id: "swap", label: "Swap", icon: "sync_alt", href: "/" },
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

/* ─── Connect Button ─── */
export function StitchConnectButton({ compact = false }: { compact?: boolean }) {
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

/* ─── Greeting helper ─── */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/* ═══════════════════════════════════════════════════════════════════════════
   STITCH SHELL — shared layout for all pages
   ═══════════════════════════════════════════════════════════════════════════ */
export default function StitchShell({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const pathname = usePathname();
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  /* Determine active sidebar item from pathname */
  const activeNavId = (() => {
    if (pathname === "/" || pathname === "/stitch-preview") return "swap";
    const match = sidebarNavItems.find(
      (item) => item.href !== "/" && pathname.startsWith(item.href),
    );
    return match?.id ?? "swap";
  })();

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
              const isActive = item.id === activeNavId;
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
          <header className="flex min-h-16 w-full items-start md:items-center justify-between gap-2 px-4 py-4 md:px-6 md:py-0 shrink-0 z-40">
            <div className="flex flex-col gap-1 md:gap-0.5">
              <h2 className="font-[var(--font-sora)] text-[18px] md:text-[24px] font-bold leading-tight md:leading-normal">
                {greeting},<br className="md:hidden" /> {isConnected ? "trader" : "Trader"} 👋
              </h2>
              <p className="text-[12px] md:text-[14px] leading-tight text-[var(--m3-on-surface-variant)]">
                Your AI trading assistant is ready.
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              <StitchConnectButton compact />
              <button
                type="button"
                className="glass-panel relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--m3-outline-variant)]/50 hover:bg-white/10 shrink-0"
              >
                <MIcon name="notifications" className="text-[20px]" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--m3-error)]" />
              </button>
            </div>
          </header>

          {/* ── Page Content ── */}
          {children}
        </div>

        {/* ── Mobile Bottom Nav ── */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--m3-outline-variant)]/10 bg-[var(--m3-surface)]/80 px-2 py-2 backdrop-blur-xl lg:hidden">
          <div className="grid grid-cols-4 gap-1">
            {[
              { icon: "sync_alt", label: "Swap", href: "/" },
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
   SHARED SUB-COMPONENTS (exported for use by page components)
   ═══════════════════════════════════════════════════════════════════════════ */

export function StatCard({
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

export function GlassPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("glass-panel rounded-3xl p-6 border border-white/5", className)}>
      {children}
    </div>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-[var(--font-geist)] text-[12px] font-bold uppercase tracking-wider text-[var(--m3-on-surface-variant)]">
        {title}
      </h3>
      {action}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-panel rounded-3xl p-12 border border-white/5 flex flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--m3-primary)]/10 mb-4">
        <MIcon name={icon} className="text-[28px] text-[var(--m3-primary)]" />
      </div>
      <h3 className="font-[var(--font-sora)] text-[20px] font-bold mb-2">{title}</h3>
      <p className="text-[14px] text-[var(--m3-on-surface-variant)] max-w-md">{description}</p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--m3-primary)]/30 bg-[var(--m3-primary)]/5 hover:bg-[var(--m3-primary)]/10 transition-all text-[13px] font-semibold text-white"
      >
        <MIcon name="arrow_back" className="text-[16px]" />
        Return to Swap
      </Link>
    </div>
  );
}

export function DataLoadState({
  isLoading,
  isError,
  empty,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  empty: boolean;
  children: React.ReactNode;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 py-8 justify-center text-[var(--m3-on-surface-variant)]">
        <MIcon name="progress_activity" className="text-[20px] animate-spin" />
        <span className="text-[14px]">Loading live data...</span>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex items-center gap-3 py-8 justify-center text-[var(--m3-error)]">
        <MIcon name="error" className="text-[20px]" />
        <span className="text-[14px]">Unable to load data right now.</span>
      </div>
    );
  }
  if (empty) {
    return (
      <div className="flex items-center gap-3 py-8 justify-center text-[var(--m3-on-surface-variant)]">
        <MIcon name="inbox" className="text-[20px]" />
        <span className="text-[14px]">No records available yet.</span>
      </div>
    );
  }
  return <>{children}</>;
}
