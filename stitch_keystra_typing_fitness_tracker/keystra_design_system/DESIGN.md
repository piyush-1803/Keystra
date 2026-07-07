---
name: Keystra Design System
colors:
  surface: '#131314'
  surface-dim: '#131314'
  surface-bright: '#39393a'
  surface-container-lowest: '#0e0e0f'
  surface-container-low: '#1c1b1c'
  surface-container: '#201f20'
  surface-container-high: '#2a2a2b'
  surface-container-highest: '#353436'
  on-surface: '#e5e2e3'
  on-surface-variant: '#c7c4d6'
  inverse-surface: '#e5e2e3'
  inverse-on-surface: '#313031'
  outline: '#918f9f'
  outline-variant: '#464554'
  surface-tint: '#c2c1ff'
  primary: '#c2c1ff'
  on-primary: '#1c0b9f'
  primary-container: '#5856d6'
  on-primary-container: '#e7e4ff'
  inverse-primary: '#4f4ccd'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#915b00'
  on-tertiary-container: '#ffe1c2'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c2c1ff'
  on-primary-fixed: '#0c006a'
  on-primary-fixed-variant: '#3631b4'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#131314'
  on-background: '#e5e2e3'
  surface-variant: '#353436'
typography:
  display-metrics:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-xs:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 24px
  stack-gap: 12px
  section-gap: 40px
  grid-columns: '12'
  grid-gutter: 20px
---

## Brand & Style

The design system is engineered for a high-performance, privacy-centric desktop experience. It merges the technical precision of developer tools with the refined elegance of modern productivity software. The aesthetic is rooted in **Modern Minimalism** with **Glassmorphic** accents, creating a workspace that feels both lightweight and powerful.

Targeting professionals, writers, and developers, the UI evokes a sense of "Flow State"—unobtrusive when you are working, yet deeply insightful when you are reviewing performance. The visual language prioritizes clarity, speed, and trust through a disciplined use of whitespace, high-quality typography, and subtle depth.

## Colors

The palette is anchored by **Electric Indigo**, a color that signifies cognitive speed and neural activity. The default experience is a deep-mode environment to reduce eye strain during long typing sessions.

- **Primary (Electric Indigo):** Used for active states, primary actions, and performance trends.
- **Success (Emerald):** Indicates high accuracy and completed goals.
- **Warning/Streak (Amber):** Represents momentum, streaks, and focus alerts.
- **AI/Insights (Amethyst):** Reserved for automated suggestions and typing patterns.
- **Neutrals:** A range of tiered charcoals (`#0F0F10` to `#2C2C2E`) used to create depth without relying on pure blacks, maintaining a premium "software-as-an-instrument" feel.

## Typography

This design system utilizes a trio of typefaces to distinguish between narrative, action, and data.

1.  **Geist (Headlines):** Used for impactful titles and primary navigation. Its geometric rigor matches the "performance" aspect of the brand.
2.  **Inter (Body):** The workhorse for all interface text, settings, and descriptions, ensuring maximum legibility.
3.  **JetBrains Mono (Data):** Specifically for metrics (WPM, Accuracy %, KPH). Monospaced characters ensure that numbers don't jump horizontally as they live-update during a session.

**Scale:** Use `display-metrics` for large dashboard counters. Use `label-xs` for "Local-only" badges and metadata.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** model with high-density data visualization. The desktop application uses a "Command Center" structure:

- **Sidebar/Navigation:** Collapsible 240px glassmorphic sidebar.
- **Main Stage:** A centered 12-column grid for dashboards and heatmaps.
- **Floating Command Bar:** A 640px fixed-width modal for quick actions (Search, Settings, Switch Profile).

Spacing is strictly based on a **4px baseline**. Most component gaps should default to `stack-gap` (12px) to maintain a compact, "pro-tool" density.

## Elevation & Depth

Depth is conveyed through a combination of **Tonal Layering** and **Glassmorphism**. 

- **Level 0 (Base):** The main application background, using the darkest neutral.
- **Level 1 (Cards):** Slightly lighter surface with a 1px subtle border (`rgba(255,255,255,0.08)`).
- **Level 2 (Command Bar/Modals):** Background blur (20px) with 70% opacity backgrounds to create a sense of floating over the data.
- **Shadows:** Use extremely soft, large-radius shadows (e.g., `0 20px 40px rgba(0,0,0,0.4)`) for floating elements only. Inline cards should not have shadows, relying instead on high-contrast borders.

## Shapes

The design system uses a **Rounded** language to soften the technical nature of the data. 

- **Primary Surfaces:** 12px for standard cards and buttons.
- **Large Containers:** 16px for the main dashboard view and command bars.
- **Badges/Chips:** Full pill-shape (999px) to contrast against the structured grid of the cards.

Borders are always "hairline" (1px) to maintain the refined, premium aesthetic.

## Components

### Buttons & Inputs
- **Primary Action:** Solid Electric Indigo with Geist Medium text. 
- **Secondary:** Ghost style with 1px border; fills on hover.
- **Inputs:** Dark background with active Indigo bottom-border or focus-ring.

### Data Visualization
- **Sparklines:** 2px stroke width, no fill, using primary or accent colors based on performance trend.
- **Heatmaps:** A grid of 12px rounded squares (radius: 3px). Opacity scales from 10% to 100% of the Primary color based on keystroke frequency.

### Command Bar (Raycast-inspired)
- A floating, centered interface.
- Includes a search icon, a Geist-font input, and a list of results with "K-shortcuts" displayed on the right in `data-mono`.

### Privacy Indicators
- **Local-only Badge:** A small `label-xs` chip with a locking icon, always visible in the footer or top-right of sensitive data cards.
- **Status Toasts:** Floating at the top-center, using 16px radius and backdrop blur.

### Navigation
- Vertical sidebar with iconography on the left. Active state indicated by a vertical 2px Indigo line on the left edge and a subtle background tint.