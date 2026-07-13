<!-- Colors verified against bancsabadell.com (primary blue #006DFF extracted directly from the live site's logo mark). Typography could not be scraped from the live site's CSS in this session (no browser/network access to fetch stylesheets); Inter is specified as a deliberate, on-brand substitute chosen for neutrality, legibility at data density, and excellent tabular-figure support. Swap in Banco Sabadell's proprietary typeface here if/when brand guidelines supply one. -->
---
name: Banco Sabadell Operations Dashboard
description: Bank-wide operational KPIs for executive leadership, at a glance and on brand.
colors:
  sabadell-blue: "#006DFF"
  sabadell-blue-deep: "#0052C2"
  sabadell-blue-tint: "#E8F1FF"
  neutral-bg: "#F6F8FB"
  neutral-surface: "#FBFCFE"
  neutral-border: "#E2E7EE"
  neutral-text: "#10151C"
  neutral-text-secondary: "#5B6472"
  status-positive: "#1A8754"
  status-warning: "#B7791B"
  status-negative: "#C23B3B"
typography:
  display:
    fontFamily: "Inter, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "clamp(1.75rem, 2.2vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Inter, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  title:
    fontFamily: "Inter, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.04em"
  numeric:
    fontFamily: "Inter, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.01em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.sabadell-blue}"
    textColor: "#FFFFFF"
    typography: "{typography.title}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.sabadell-blue-deep}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.sabadell-blue}"
    typography: "{typography.title}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  kpi-panel:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  nav-item-active:
    backgroundColor: "{colors.sabadell-blue-tint}"
    textColor: "{colors.sabadell-blue-deep}"
    typography: "{typography.title}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
---

# Design System: Banco Sabadell Operations Dashboard

## 1. Overview

**Creative North Star: "The Boardroom Instrument Panel"**

Not a SaaS analytics tool wearing a bank's colors: an instrument panel built for people who make decisions with the bank's money. Every number is load-bearing. The interface is quiet by default and lets exactly one color, the Banco Sabadell blue, mark what deserves attention: a primary action, an active state, a KPI trending outside its normal band. Everything else lives in a tight, cool-neutral grayscale so the blue is never competing with itself.

The system explicitly rejects the generic SaaS-dashboard reflex: no gradient hero metrics, no glassmorphism, no identical icon-plus-heading card grids, no dark-mode-by-default fintech look. It equally rejects the legacy-core-banking-terminal failure mode: dense, undifferentiated tables with no visual hierarchy. This is restrained, not sparse; institutional, not decorative.

**Key Characteristics:**
- One accent color carries the interface; neutrals do the rest of the work.
- Flat surfaces with tonal separation instead of boxed, bordered cards everywhere.
- Numbers set in tabular figures, sized for a ten-second read from across a boardroom table.
- Status is never color-only: an icon or label always rides alongside red/amber/green.

## 2. Colors

A restrained palette: tinted cool neutrals carry structure, the Sabadell blue is reserved for meaning, and three muted status colors handle risk signals without ever standing in for the brand accent.

### Primary
- **Sabadell Blue** (#006DFF): The single brand accent, extracted directly from the live Banco Sabadell logo mark. Used for primary buttons, active navigation state, key links, and to highlight the one KPI on any screen that most deserves attention. Never used as a background wash.

### Neutral
- **Fog White** (#F6F8FB): Page background. A near-white cool gray, never pure `#fff`.
- **Panel White** (#FBFCFE): Surface color for panels and the top nav bar, a half-step lighter than the page background so panels read as raised without a shadow.
- **Hairline Gray** (#E2E7EE): Borders, dividers, table hairlines.
- **Ink** (#10151C): Primary text. A near-black with a cool tint, never pure `#000`.
- **Slate** (#5B6472): Secondary text, timestamps, helper copy, axis labels.

### Named Rules
**The One Voice Rule.** Sabadell Blue appears on no more than roughly 10% of any given screen's surface. If more than one element is competing for blue at the same time, one of them is wrong.

## 3. Typography

**Display Font:** Inter (with -apple-system, Segoe UI fallback)
**Body Font:** Inter (with -apple-system, Segoe UI fallback)
**Label/Mono Font:** Inter, tabular-figure variant for all numeric data

**Character:** A single, highly legible grotesque carries the whole system. Inter was chosen specifically for its tabular-number support and neutrality at data density; it disappears so the numbers can lead. (Banco Sabadell's live proprietary typeface could not be extracted in this session without browser access; substitute the confirmed brand font here once available, keeping the same weight and size relationships.)

### Hierarchy
- **Display** (600, clamp(1.75rem, 2.2vw, 2.5rem), 1.15): Page title and section-level headers only. Appears once or twice per screen.
- **Headline** (600, 1.25rem, 1.3): Panel titles ("Deposits", "Branch Network", "Risk Signals").
- **Title** (600, 0.9375rem, 1.4): Sub-labels, button text, table column headers.
- **Body** (400, 0.9375rem, 1.5): Supporting copy, descriptions, tooltips. Capped at 65–75ch line length wherever prose appears.
- **Numeric** (600, 2rem, 1.1, tabular figures): The KPI figures themselves. Always tabular-aligned so columns of numbers read as columns.
- **Label** (600, 0.75rem, 1.3, 0.04em, uppercase): Eyebrow labels above KPI figures, status chips, table headers.

### Named Rules
**The Tabular Rule.** Any numeral displayed for comparison (a KPI, a table column, a trend delta) uses tabular figures. Proportional numerals are forbidden in data contexts; they make columns of numbers lie about their alignment.

## 4. Elevation

Flat by default. Depth is conveyed through tonal contrast (Panel White against Fog White background, a one-step lightness difference) and a single hairline border, not through drop shadows. Shadows are reserved for genuinely floating elements, transient overlays like a tooltip or a dropdown menu, never for static panels sitting in the page flow.

### Shadow Vocabulary
- **Overlay** (`box-shadow: 0 8px 24px rgba(16, 21, 28, 0.12)`): Dropdown menus, date pickers, transient popovers only.
- **Focus ring** (`box-shadow: 0 0 0 3px rgba(0, 109, 255, 0.35)`): Keyboard focus indicator on interactive elements, always visible, never suppressed.

### Named Rules
**The Flat-by-Default Rule.** Panels sitting in the normal page flow never carry a drop shadow. If it isn't floating above the page (a menu, a modal, a tooltip), it doesn't get a shadow.

## 5. Components

Every component favors legibility and restraint over ornament. Nothing animates its own layout; nothing glows unless it is the one accent color doing its one job.

### Buttons
- **Shape:** Gently rounded corners (6px).
- **Primary:** Solid Sabadell Blue (#006DFF) background, white text, 10px/20px padding. Reserved for the single most important action on a screen (e.g. "Export report", "Drill into branch").
- **Hover / Focus:** Background deepens to #0052C2 on hover; a 3px blue focus ring (rgba(0,109,255,0.35)) appears on keyboard focus. Transition on background-color only, 150ms ease-out.
- **Secondary / Ghost:** Transparent background, Sabadell Blue text, same padding and radius as primary. Used for every action that isn't the screen's single primary one.

### KPI Panels (signature component)
- **Corner Style:** 10px radius.
- **Background:** Panel White (#FBFCFE) against the Fog White (#F6F8FB) page, no border needed at rest; a 1px Hairline Gray border appears only when the panel is interactive (clickable through to detail).
- **Shadow Strategy:** None at rest, per the Flat-by-Default Rule.
- **Internal Padding:** 24px (spacing.lg).
- **Anatomy:** Uppercase Label above a large tabular Numeric figure, with a small trend indicator (arrow + percentage) that uses a status color plus a directional icon, never color alone.

### Data Tables
- **Style:** No cell borders; rows separated by a single Hairline Gray divider. Numeric columns right-aligned with tabular figures. Column headers in Title-weight, uppercase Label style for sort indicators.
- **Row states:** Hover tints the row background to Sabadell Blue tint (#E8F1FF) at low opacity; no border-left accent stripe, ever.

### Navigation
- **Style:** A slim top bar (Panel White background, Hairline Gray bottom border) carrying the Banco Sabadell logo mark at left and account/context controls at right. A left rail handles primary sections.
- **States:** Inactive items in Slate text; active item gets the Sabadell Blue tint background (#E8F1FF) with Sabadell Blue Deep (#0052C2) text, per the nav-item-active token, never an underline or a side-stripe.
- **Mobile/tablet:** Left rail collapses to a top icon bar; active state treatment is identical.

### Status Chips
- **Style:** Small pill (full radius), colored text on a tinted background of the same hue at low opacity (e.g. status-negative text on a 10%-opacity red background), always paired with a directional or severity icon.
- **Never:** A bare colored dot with no label. Color alone never carries the meaning.

## 6. Do's and Don'ts

### Do:
- **Do** reserve Sabadell Blue (#006DFF) for the one thing per screen that most deserves attention: a primary action, an active nav state, or the single most important KPI.
- **Do** use tabular figures for every numeral in a data context so columns of numbers align.
- **Do** pair every status color (positive #1A8754, warning #B7791B, negative #C23B3B) with an icon or label, never color alone.
- **Do** keep panels flat at rest; reserve shadows for floating overlays only (menus, tooltips, modals).
- **Do** tint every neutral toward the brand's cool blue hue; Fog White and Ink are never pure `#fff` / `#000`.

### Don't:
- **Don't** build gradient hero metrics, glassmorphism panels, or gradient text. If a metric needs emphasis, make it bigger or bolder, not gradient-filled.
- **Don't** default to dark mode. This is an executive boardroom tool reviewed in bright rooms and on shared screens; light, high-contrast, flat is the default.
- **Don't** repeat the same icon-plus-heading card for every KPI. Vary panel density and layout so the eye has real hierarchy to follow, not a uniform grid.
- **Don't** use a `border-left` color stripe on any panel, table row, or alert. Use a tinted background, an icon, or nothing.
- **Don't** let the dashboard read like a dense legacy core-banking terminal: no wall-to-wall tables with no breathing room, no ambiguous unlabeled axes.
- **Don't** rely on red/green alone for risk or performance signals; always add a label or icon for color-blind accessibility (WCAG 2.1 AA).
