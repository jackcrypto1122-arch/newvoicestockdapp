"use client";

import StitchShell, { GlassPanel, MIcon } from "@/components/stitch-shell";

export function StitchX402Page() {
  return (
    <StitchShell>
      <div className="p-6 pt-0 pb-8 flex items-center justify-center flex-1">
        <GlassPanel className="flex flex-col items-center justify-center p-12 text-center max-w-lg w-full">
          <div className="relative mb-6 grid h-24 w-24 place-items-center rounded-full border border-[var(--m3-primary)]/20 bg-[var(--m3-primary)]/10 shadow-[0_0_60px_-15px_rgba(200,255,0,0.3)]">
            <MIcon name="settings_input_antenna" className="text-[40px] text-[var(--m3-primary)]" />
          </div>
          <h2 className="font-[var(--font-sora)] text-[28px] font-bold tracking-tight text-white drop-shadow-sm mb-3">
            Coming Soon
          </h2>
          <p className="max-w-[28rem] text-[14px] text-[var(--m3-on-surface-variant)] leading-relaxed">
            We are designing <strong className="text-white">private x402 payments</strong> so a
            voice agent can guide, verify, and complete secure payment actions without exposing
            sensitive flow details.
          </p>
        </GlassPanel>
      </div>
    </StitchShell>
  );
}

export function StitchKeyRecoveryPage() {
  return (
    <StitchShell>
      <div className="p-6 pt-0 pb-8 flex items-center justify-center flex-1">
        <GlassPanel className="flex flex-col items-center justify-center p-12 text-center max-w-lg w-full">
          <div className="relative mb-6 grid h-24 w-24 place-items-center rounded-full border border-[var(--m3-primary)]/20 bg-[var(--m3-primary)]/10 shadow-[0_0_60px_-15px_rgba(200,255,0,0.3)]">
            <MIcon name="key" className="text-[40px] text-[var(--m3-primary)]" />
          </div>
          <h2 className="font-[var(--font-sora)] text-[28px] font-bold tracking-tight text-white drop-shadow-sm mb-3">
            Coming Soon
          </h2>
          <p className="max-w-[28rem] text-[14px] text-[var(--m3-on-surface-variant)] leading-relaxed">
            We are building <strong className="text-white">voice-based key recovery</strong> using a
            voice challenge as one recovery factor, combined with trusted contacts, so users can
            verify it is really them without depending only on a seed phrase.
          </p>
        </GlassPanel>
      </div>
    </StitchShell>
  );
}
