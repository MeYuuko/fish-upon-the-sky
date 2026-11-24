---
name: citrus-frontend-design
description: Design and refine this workspace’s dark-first atmospheric studio interfaces, sliding-pill navigation, and group planning experiences with Fish Upon The Sky's Citrus, Sea, Amalfi, and Cream tokens.
---

# Citrus Studio Frontend Design

Use this workspace-local reference when designing, implementing, or reviewing web interfaces for **Fish Upon The Sky**. It blends a **dark-first atmospheric studio editorial concept** (inspired by Psychoactive Studios) with **5Lab-style tactile sliding pill navigation** and Fish Upon The Sky's warm **Citrus, Sea, Amalfi, and Cream** brand palette.

## Design intent

- **Atmospheric studio minimalism with warmth:** Default to deep obsidian-navy surfaces illuminated by subtle ambient sky/citrus glows, frosted glass bento containers, and crisp hairlines—never generic glowing neon blobs or cluttered dashboards.
- **Tactile clarity first:** Prioritise practical group tasks (quick voting, shared schedules, expenses, member info) while keeping playful personality in restrained micro-motion and crisp editorial typography.
- **Dual-theme parity:** Dark-first by default (`#0B121D`), with a first-class Light mode (`#FBF9F2`) sharing the same glass geometry, spacing rhythm, and contrast guarantees.

## Typography

Use a 1.25 modular scale based on a `16px` (`1rem`) body size:

| Token | Size | Typical role |
| --- | ---: | --- |
| `--type-sm` | `0.8rem` | Tracked eyebrows, telemetry metadata, tabular superscript counts |
| `--type-base` | `1rem` | Body copy, form labels, controls |
| `--type-lg` | `1.25rem` | Lead copy and card titles |
| `--type-xl` | `1.563rem` | Section headings |
| `--type-2xl` | `1.953rem` | Subpage headings |
| `--type-3xl` | `2.441rem` | Large section headings |
| `--type-4xl` | `3.052rem` | Page headings |
| `--type-5xl` | `3.815rem` | Hero display headlines |
| `--type-6xl` | `4.768rem` | Oversized editorial statement headlines |

- **Display face (`--font-display`):** Local `DL Calvera` (`fonts/Headings/DL-Calvera-2.otf`) for hero headlines, brand wordmarks, and numerical counters. Always apply `--tracking-display: 0.045em` and `--word-spacing-display: 0.06em` so condensed geometric glyphs never feel cramped.
- **Body & UI face (`--font-body`):** Local `NANG Nexa Pro` (`fonts/text/OpenType-TT/`) across weights `300`–`900` for readable body text, forms, pills, and metadata.
- **Telemetry & counts:** Use uppercase tracked labels (`letter-spacing: 0.12em–0.15em`) and `font-variant-numeric: tabular-nums` for superscript counts (`01`, `07`), dates, and status tags.

## Spacing, shape, and HUD motifs

Use an 8px base grid (`--space-1: 0.5rem` through `--space-12: 6rem`).

- **Radii:** `--radius-field: 0.75rem`, `--radius-card: 1.5rem`, `--radius-panel: 2rem`, and `--radius-pill: 999px` for capsules and primary actions.
- **Psychoactive-inspired structural motifs:**
  - **Frosted glass bento cards:** `backdrop-filter: blur(16px)` with `1px solid var(--color-line)` hairlines and subtle elevation.
  - **HUD registration crosshairs (`+`):** Place subtle `+` marks (`--color-muted-soft`) at hero or focal container corners to frame composition without adding visual clutter.
  - **Dot-ended hairline rules (`•———•`):** Use `.dot-rule` separators to bridge telemetry labels, section headers, and footer links.
  - **Avoid sticker/cartoon clutter** inside the main planner workspace; keep visual emphasis on typography, light, glass, and clean geometry.

## Color tokens

Keep raw hex/rgba values in the `:root` / `.theme-dark` token layer and consume semantic tokens across components:

- **Core 6-color palette (MP174):**
  - `--palette-white: #F4F5FA` (*White Solid*) — light page canvas and dark-mode primary text.
  - `--palette-cream: #D4EAFF` (*Veiling Waterfalls*) — soft highlight surface, dark-mode secondary ink (`--color-ink-soft`), and readable dark-mode links.
  - `--palette-citrus: #F1FF62` (*Lemon Pie*) — high-energy primary action fill (paired with `#112358` dark text), active pill indicator in dark mode, and focus ring.
  - `--palette-sea: #0192C6` (*Dynamic Blue*) — mid-tone sky accent, active wave highlights, and glass borders.
  - `--palette-amalfi: #004499` (*Fright Night*) — light-mode primary link/pill tone, deep glass tint, and wax seal body.
  - `--palette-deep: #112358` (*Fibonacci Blue*) — dark-first primary canvas and high-contrast ink on light/lemon surfaces.
- **Dark-first surface system (`.theme-dark`, default):**
  - `--color-page: #112358`
  - `--color-paper: #0D1C47`
  - `--surface-panel: rgba(0, 68, 153, 0.28)`
  - `--color-text: #F4F5FA`
  - `--color-ink-soft: #D4EAFF`
  - `--color-muted: #93B4DA`
  - `--color-line: rgba(212, 234, 255, 0.16)`
  - `--color-border: rgba(212, 234, 255, 0.24)`
- **Light surface system (`:root`, toggleable):**
  - `--color-page: #F4F5FA`, `--color-paper: #FFFFFF`, `--surface-panel: rgba(255, 255, 255, 0.9)`, `--color-text: #112358`.

## Navigation & Motion (5Lab + Framer Motion)

- **Floating Top Header (`.studio-header`):** Replace fixed sidebars with a sticky translucent top bar containing the brand lockup on the left, a centered `.pill-switch` navigation capsule, and compact theme/member/action controls on the right. Keep a bottom `.mobile-nav` for narrow screens (`<= 760px`).
- **Sliding Pill Switch (`.pill-switch`):** Use a single shared `layoutId` spring indicator (`.pill-switch-bg`) that glides smoothly behind the active tab (`type: 'spring', stiffness: 360, damping: 32`), paired with optional superscript `tabular-nums` counts (`.pill-switch-count`). Reuse this exact pattern for in-page filters and segmented switches.
- **View & entrance transitions:** Animate tab transitions and section reveals cleanly (`cubic-bezier(0.22, 1, 0.36, 1)`), and respect `prefers-reduced-motion` across all CSS and Framer Motion transitions.

## Accessibility & responsiveness

- Maintain `>= 44px` minimum hit targets for interactive controls and `3px` visible focus outlines (`--color-focus`).
- Verify contrast for text over glass surfaces in both Dark and Light modes.
- Ensure narrow, medium, and wide viewports (`375px`, `768px`, `1280px+`) wrap cleanly without horizontal scrolling.
