# Vozdex AI Dashboard UI Handoff

## Purpose

This document is for the UI designer who will redesign or refine the Vozdex AI dashboard.

The product is a **voice-first trading terminal** for crypto and tokenized stocks. The app already has working flows and page structure. The goal is to improve the **visual design, hierarchy, dashboard clarity, and premium product feel** without changing the core product logic.

## Product Summary

Vozdex AI combines:

- wallet connection
- swap execution
- portfolio visibility
- crypto market tracking
- stock token tracking
- order and history views
- voice-assisted trade intent capture

Primary idea: users should feel like they are inside a **premium AI trading terminal**, not a generic DeFi dashboard.

## Design Goal

Create a UI direction that feels:

- premium
- futuristic
- sharp
- confident
- fast to scan
- clearly voice-first

The current interface already leans toward a **dark luxury terminal** aesthetic. The redesign should improve it, not replace it with a generic SaaS dashboard.

## Current Brand Direction

### Core mood

- dark black background
- neon lime accent
- high contrast text
- terminal-like labels
- editorial headings
- dense but polished card layout

### Current visual tokens

- Background: `#000000`
- Card: `#050505`
- Border: `#222222`
- Primary accent: `#c2ff00`
- Primary foreground: `#000000`
- Muted text: `#a1a1aa`
- Error/destructive: `#ff5a67`

### General feel to preserve

- strong contrast
- glow used sparingly
- premium trading desk energy
- clean typography
- compact data presentation
- not playful
- not cartoonish
- not glassmorphism-heavy

## Main Layout Structure

The current desktop app uses a 3-column layout:

1. **Left sidebar**
2. **Main content area**
3. **Right utility rail**

### 1. Left Sidebar

Used for:

- logo / product identity
- main navigation
- wallet connect action
- terminal status card

Current nav items:

- Swap
- Portfolio
- Crypto Market
- Stock Market
- Orders
- History
- Settings
- Private x402 Payments

### 2. Main Content Area

Used for:

- page header
- top stats
- main task UI
- page-specific content panels

### 3. Right Rail

Used for:

- wallet summary
- featured market card
- recent activity card

This right rail is important. It should feel useful and premium, not like leftover widgets.

## Priority Screen: Home Dashboard

This is the most important screen and should receive the most design attention.

### Current content on home

1. Page header
   - Eyebrow: `Protocol · v1.0 α`
   - Title: `Swap Tokens`
   - Subtitle about live routing, wallet-aware execution, and voice capture
   - Wallet status pill on the right

2. Top stat cards
   - Portfolio
   - ETH spot
   - Top mover
   - Tracked pairs

3. Voice CTA block
   - prominent microphone / tap-to-speak interaction

4. Swap card
   - input token
   - output token
   - amount fields
   - direction switch
   - quote refresh
   - rate / slippage / fee
   - connect wallet / trade CTA

5. Right rail widgets
   - wallet snapshot
   - featured market
   - activity feed

### What the redesign should improve on home

- Make the voice-first identity more obvious
- Make the swap card feel more flagship and tactile
- Improve visual hierarchy between stats, voice action, and trading action
- Make the page feel like a single coherent terminal, not several separate blocks
- Improve information density without making it feel cramped
- Make wallet status and trading readiness easier to understand at a glance

## Secondary Screens

These should feel part of the same system as the home dashboard.

### Portfolio

Current content:

- total value
- top holding
- largest mover
- wallet info
- asset allocation list
- top movers list

Designer goal:

- stronger portfolio overview hierarchy
- cleaner balance rows
- clearer percentage / allocation visuals
- more premium asset breakdown presentation

### Crypto Market

Current content:

- tracked assets count
- top gainer
- top loser
- token rows with price, volume, and 24h change

Designer goal:

- better scanability
- clearer row hierarchy
- stronger distinction between price, volume, and performance
- potential room for mini trend visuals if helpful

### Stock Market

Current content mirrors crypto market but for stock tokens.

Designer goal:

- keep consistency with crypto market
- add subtle cues so stock tokens feel distinct from crypto without creating a separate design system

### Orders

Current content:

- execution ledger
- swap route summary
- execution status
- explorer link

Designer goal:

- make status tracking feel precise and trustworthy
- clearer distinction between pending, confirmed, and failed
- better visual rhythm for rows and statuses

### History

Current content:

- on-chain history
- local execution history
- kind, label, hash, status, timestamp

Designer goal:

- stronger timeline or ledger feel
- easier scanning of action type and status
- clearer timestamps and explorer actions

### Voice AI

Current content:

- large microphone action
- transcript area
- parse button
- suggestions
- parsed intent fields
- handoff explanation

Designer goal:

- make this feel like a premium AI console
- improve confidence and feedback during listening / parsing
- create a more intentional AI interaction pattern
- visually connect voice parsing to the swap flow

### Settings

Current content:

- default pair
- slippage presets
- priority fee
- wallet connection info
- RPC endpoint

Designer goal:

- keep this minimal and structured
- make controls feel high-quality and clear
- avoid making settings look more important than trading

## UI System Guidance

### Typography

Recommended direction:

- elegant serif or editorial-style headings
- clean modern sans-serif for UI and body
- tabular numerals for prices, balances, percentages, and timestamps
- uppercase micro-labels for dashboard metadata

The typography should feel intentional and expensive, not loud.

### Cards

Cards should feel:

- compact
- slightly layered
- crisp edged or softly rounded
- high contrast
- easy to scan

Avoid overly soft, washed-out, or generic dashboard cards.

### Data Presentation

Prioritize:

- clear numeric hierarchy
- excellent spacing for rows
- fast scanning
- obvious gain/loss states
- visible active status indicators

### Motion

Motion should be subtle and purposeful:

- nav state transitions
- live status pulses
- hover elevation
- quote refresh feedback
- voice listening animation

Avoid decorative animation that slows down the feeling of the terminal.

### Icons

Icons should feel:

- thin to medium stroke
- sharp
- technical
- consistent in weight

## Key UX Problems To Solve

The redesign should specifically help with these:

1. The dashboard needs a stronger "hero" focus on the trading action.
2. Voice interaction should feel more central to the product identity.
3. The right rail should feel integrated, not secondary clutter.
4. Market, portfolio, and activity data should be easier to scan in under 3 seconds.
5. Status surfaces should feel reliable and professional.
6. Mobile and tablet views should still feel premium, not compressed leftovers.

## Responsive Expectations

### Desktop

Preferred experience:

- left sidebar visible
- main content centered and spacious
- right rail visible on large screens

### Tablet

Expected:

- right rail may collapse below main content
- sidebar may reduce in width or become a drawer

### Mobile

Expected:

- bottom navigation
- simplified page header
- strongest actions remain visible first
- voice CTA and swap action stay prominent

## What Should Not Change

Please do **not** redesign the product into a different kind of app.

Keep these foundations:

- dark terminal-based direction
- neon-lime accent family
- voice-first product identity
- trading dashboard structure
- professional financial feel

Avoid:

- pastel SaaS style
- soft consumer fintech style
- playful AI assistant style
- generic Web3 gradients everywhere
- overly noisy cyberpunk visuals

## Suggested Deliverables From Designer

Please provide:

1. Desktop home dashboard redesign
2. Desktop portfolio page redesign
3. Desktop market list design
4. Desktop voice AI screen redesign
5. Mobile home dashboard version
6. Reusable design system guidance for:
   - cards
   - stat blocks
   - tables / data rows
   - status pills
   - navigation states
   - form controls
   - voice interaction states

## Important Product Notes

- Wallet connection is a core part of the experience.
- Swap execution is the main job to optimize around.
- Voice is a signature feature, not a side feature.
- Crypto and stock-token views should feel related but not confusing.
- The app should look trustworthy enough for users to move money through it.

## Summary For Designer

Design Vozdex AI like a **premium voice-powered trading terminal**.

The best outcome is a dashboard that feels:

- more focused
- more intentional
- more luxurious
- more legible
- more clearly centered on trading + AI voice interaction

The UI should feel ready for a serious fintech/Web3 product, while still looking distinctive and memorable.
