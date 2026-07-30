# Vozdex AI Reference UI Plan

## Goal

Make the current Vozdex AI dApp UI look closer to the shared reference image:

- futuristic premium dashboard
- dark neon background
- glowing purple/blue/green gradients
- AI assistant feeling
- large central listening orb
- polished glass-like trading panels
- stronger dashboard hierarchy

This is possible without changing the product backend. Most of the work is **frontend redesign**.

## Good News

The current app already has the right structure for this direction:

- left sidebar
- main dashboard area
- right-side trading card area
- stat cards
- voice section
- activity / market widgets

So we do **not** need to rebuild the whole dApp from scratch.

We mainly need to redesign:

1. layout styling
2. card system
3. background effects
4. hero voice section
5. swap panel styling
6. dashboard widgets

## What To Change

### 1. Global Visual Theme

Current UI:

- black luxury terminal
- lime accent

Reference UI:

- deep navy / indigo / black base
- purple-blue neon glow
- soft glass cards
- aurora background

### New direction

Use a palette closer to:

- Background base: `#050816`
- Surface: `#0b1023`
- Surface 2: `#111936`
- Border: `rgba(110,140,255,0.18)`
- Primary purple: `#7c3cff`
- Secondary blue: `#2f7bff`
- Cyan glow: `#35e0ff`
- Success green: `#2ee6a6`
- Text primary: `#f5f7ff`
- Text muted: `#9aa4c7`

## 2. Main Home Layout

The reference image layout can map to the current home page like this:

### Top bar

- greeting text on left
- wallet CTA and utility icons on right

Current app mapping:

- reuse `PageHeader`
- add greeting variant like `Good evening, Olivia`
- keep wallet button on the right
- add notification / quick actions buttons

### Top stat cards

Reference style:

- 4 compact glowing cards
- icon + title + bold metric + trend text

Current app mapping:

- keep existing `StatGrid`
- redesign cards with richer gradient surface, better icon badges, and chart accents

### Center hero card

Reference style:

- big glowing orb
- “I’m Listening...” heading
- AI-ready status
- quick voice prompt chips

Current app mapping:

- replace the current simple voice section with a large hero card
- keep actual voice logic from the existing `VoiceButton`
- redesign only the presentation

### Right swap panel

Reference style:

- glassy swap panel
- large token selectors
- strong amount hierarchy
- review swap CTA

Current app mapping:

- keep existing `SwapCard`
- redesign visual layout and spacing
- move it into a taller premium side panel on desktop

### Lower widgets

Reference style:

- AI execution flow strip
- recent activity panel
- AI agents panel
- market overview card

Current app mapping:

- execution flow can be a new component
- recent activity can reuse existing activity data
- market overview can reuse existing market card data
- AI agents can be a presentational card for now

## 3. Sidebar Redesign

The current sidebar already works structurally, but it should be redesigned to match the image.

### Changes needed

- make sidebar darker and more atmospheric
- add stronger glowing logo area
- use softer vertical spacing
- active nav item should have purple glow pill
- wallet status card should look embedded and premium
- user profile card at bottom should be redesigned to match reference

### Keep

- navigation structure
- wallet state info
- app branding

## 4. Voice Hero Section

This is the biggest visual change.

### In the reference image

The voice area feels like the product centerpiece.

It includes:

- glowing orb
- animated wave lines
- aurora background
- listening state text
- prompt suggestion chips

### Implementation approach

Build a new hero component, for example:

- `src/components/dashboard/voice-hero.tsx`

This component can include:

- animated radial orb
- layered gradients
- blurred glow rings
- waveform lines using CSS or SVG
- status badge: `AI is ready`
- prompt chips

Important:

- keep the existing microphone and transcript logic
- only replace the visual container

## 5. Swap Card Redesign

The current swap functionality can stay the same. The UI should be upgraded to look like the reference.

### Visual changes

- larger panel
- soft blue/purple gradient edge glow
- better spacing between pay/receive rows
- bigger token badges
- cleaner divider with swap direction button
- strong primary CTA button
- fee and rate info in smaller footer row

### Functional changes not required

- no backend change needed
- no swap logic change needed
- no wallet flow change needed

## 6. New Components Likely Needed

To match the screenshot well, we should add a few new presentational components:

- `dashboard-topbar.tsx`
- `dashboard-stat-card.tsx`
- `voice-hero.tsx`
- `execution-flow-card.tsx`
- `market-overview-card.tsx`
- `agents-card.tsx`
- `recent-activity-card.tsx`

These can reuse existing data from the current hooks and store.

## 7. Background And Effects

This is a big part of why the screenshot looks premium.

### Add:

- aurora gradient background layers
- radial light bloom behind important cards
- subtle noise texture if desired
- glow shadows on active elements
- soft glass borders

### Avoid:

- too much blur
- too many bright colors at once
- overly saturated cyberpunk effects
- heavy animation everywhere

## 8. Typography Changes

To match the screenshot better:

- use cleaner modern sans for dashboard body
- keep strong bold metric typography
- reduce serif usage on this version
- use smaller uppercase labels for metadata
- use large friendly hero headline for assistant state

The reference is less editorial and more **AI fintech product**.

## 9. Exact Screen Mapping

### Reference image sections -> Vozdex sections

1. Left navigation rail
   - use current sidebar

2. Greeting top header
   - update current page header

3. Stat cards row
   - redesign current stat grid

4. Large listening hero card
   - redesign current voice section on home

5. Swap panel on right
   - redesign current `SwapCard`

6. AI execution flow row
   - add new visual component

7. Recent activity row
   - reuse current history / activity data

8. Market overview card
   - upgrade current market card

9. AI agents card
   - new presentation component

## 10. Is This A Full Rebuild?

No.

This is mostly:

- UI redesign
- layout restructuring
- component restyling
- a few new presentational blocks

Core logic can remain:

- wallet connect
- market data hooks
- swap flow
- voice parsing
- history and orders

## 11. Best Way To Build It

### Phase 1

Redesign only the home dashboard:

- sidebar
- top bar
- stat cards
- voice hero
- swap panel
- lower widgets

### Phase 2

Apply the same design system to:

- portfolio
- markets
- stock markets
- orders
- history
- settings

### Phase 3

Polish:

- motion
- hover states
- responsive behavior
- mobile adaptation

## 12. Practical Recommendation

Best workflow:

1. designer creates Figma based on this reference
2. we build the new home dashboard first
3. then we extend the same design language to the rest of the dApp

This is the fastest way to get a high-quality result without breaking working features.

## 13. Final Answer

Yes, your dApp can look like the shared image.

Because your current app already has:

- the right page structure
- the right product modules
- the right dashboard sections

So the task is mainly to transform the **visual system and component layout**, not rebuild the product logic.

## 14. What I Can Do Next

I can help in either of these two ways:

### Option A

Create a more detailed **designer handoff markdown** based exactly on this reference image.

### Option B

Start directly coding the new home dashboard UI in the app so it visually moves toward this screenshot.
