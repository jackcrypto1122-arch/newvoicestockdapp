"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http } from "wagmi";
import { getDefaultConfig, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { useState, useMemo } from "react";
import { Toaster } from "sonner";
import { DEFAULT_EXPLORER, DEFAULT_RPC_URL, ROBINHOOD_CHAIN_ID } from "@/lib/constants";
import { defineChain } from "viem";

// #region debug-point A:module-load
void fetch("http://127.0.0.1:7777/event", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    sessionId: "stitch-preview-error",
    runId: "pre-fix",
    hypothesisId: "A",
    location: "src/components/providers/app-providers.tsx:module",
    msg: "[DEBUG] app-providers module loaded",
    data: { hasWindow: typeof window !== "undefined" },
    ts: Date.now(),
  }),
}).catch(() => {});
// #endregion

const robinhoodChain = defineChain({
  id: ROBINHOOD_CHAIN_ID,
  name: "Robinhood Chain",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: [DEFAULT_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: "Robinhood Chain Explorer",
      url: DEFAULT_EXPLORER,
    },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  // #region debug-point B:component-enter
  void fetch("http://127.0.0.1:7777/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "stitch-preview-error",
      runId: "pre-fix",
      hypothesisId: "B",
      location: "src/components/providers/app-providers.tsx:AppProviders",
      msg: "[DEBUG] app-providers component entered",
      data: { hasWindow: typeof window !== "undefined" },
      ts: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  const config = useMemo(() => {
    // #region debug-point C:config-start
    void fetch("http://127.0.0.1:7777/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "stitch-preview-error",
        runId: "pre-fix",
        hypothesisId: "C",
        location: "src/components/providers/app-providers.tsx:getDefaultConfig:start",
        msg: "[DEBUG] getDefaultConfig starting",
        data: { chainId: robinhoodChain.id, rpcUrl: DEFAULT_RPC_URL, projectId: "YOUR_PROJECT_ID" },
        ts: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    try {
      const rainbowConfig = getDefaultConfig({
        appName: "StockVoice",
        projectId: "YOUR_PROJECT_ID", // We can use a dummy for now, or check if there's one in env!
        chains: [robinhoodChain],
        transports: {
          [robinhoodChain.id]: http(),
        },
      });

      // #region debug-point D:config-success
      void fetch("http://127.0.0.1:7777/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "stitch-preview-error",
          runId: "pre-fix",
          hypothesisId: "D",
          location: "src/components/providers/app-providers.tsx:getDefaultConfig:success",
          msg: "[DEBUG] getDefaultConfig completed",
          data: { chainCount: 1 },
          ts: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

      return rainbowConfig;
    } catch (error) {
      // #region debug-point E:config-error
      void fetch("http://127.0.0.1:7777/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "stitch-preview-error",
          runId: "pre-fix",
          hypothesisId: "E",
          location: "src/components/providers/app-providers.tsx:getDefaultConfig:error",
          msg: "[DEBUG] getDefaultConfig threw",
          data: {
            error:
              error instanceof Error
                ? { name: error.name, message: error.message, stack: error.stack }
                : String(error),
          },
          ts: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      throw error;
    }
  }, []);

  // #region debug-point F:provider-render
  void fetch("http://127.0.0.1:7777/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "stitch-preview-error",
      runId: "pre-fix",
      hypothesisId: "F",
      location: "src/components/providers/app-providers.tsx:return",
      msg: "[DEBUG] app-providers rendering providers",
      data: { hasChildren: Boolean(children) },
      ts: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#C2FF00",
            accentColorForeground: "black",
            borderRadius: "medium",
            fontStack: "system",
            overlayBlur: "small",
          })}
        >
          {children}
          <Toaster position="top-right" richColors />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
