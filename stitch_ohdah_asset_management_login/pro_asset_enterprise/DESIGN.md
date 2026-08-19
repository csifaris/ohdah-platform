---
name: Pro-Asset Enterprise
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#444651'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#1b2b3f'
  on-tertiary: '#ffffff'
  tertiary-container: '#314156'
  on-tertiary-container: '#9dadc6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Inter
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
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  stack-sm: 4px
  stack-md: 12px
  stack-lg: 24px
---

## Brand & Style
The design system is engineered for **Ohdah**, a high-stakes asset management platform where precision, reliability, and clarity are paramount. The brand personality is authoritative yet modern, utilizing a **Corporate Minimalist** aesthetic that avoids unnecessary decoration in favor of functional elegance.

The UI evokes an emotional response of security and "total control." By blending high-contrast elements with ample whitespace, the system ensures that complex data sets remain legible and actionable. The style prioritizes a premium "Enterprise Grade" feel, using subtle depth and a refined color application to differentiate between management tiers and asset statuses.

## Colors
The palette is rooted in a **Deep Professional Blue** primary, symbolizing trust and institutional stability. This is balanced by a **Success Green** used strictly for positive status indicators (Active, Verified, Maintained).

- **Primary (#1e3a8a):** Used for primary actions, active navigation states, and key headers.
- **Success (#10b981):** Reserved for "In Stock" or "Healthy" asset statuses.
- **Background (#f8fafc):** A cool-toned light grey that reduces eye strain during long administrative sessions.
- **Surface (#ffffff):** Used for cards and containers to create clear separation from the background.
- **Accessibility:** All text combinations must maintain a minimum contrast ratio of 4.5:1 against their backgrounds.

## Typography
This design system utilizes **Inter** for its exceptional clarity in both English and Arabic scripts (via its comprehensive character set). The typographic scale is optimized for data density and information hierarchy.

For **Arabic RTL support**, the line-height is slightly increased (by approximately 10-15% where necessary) to accommodate taller ascenders and descenders in Arabic glyphs without crowding the lines. Headlines use a tighter tracking to feel more impactful, while small labels use increased tracking for legibility on asset tags and technical specifications.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid Grid**. On desktop, content is contained within a 1440px maximum width to ensure readability of data tables. 

- **Grid:** A 12-column system for desktop, 8-column for tablet, and 4-column for mobile.
- **RTL Support:** The layout must mirror perfectly. Sidebars move from left-to-right to right-to-left. The primary "F-pattern" for reading is inverted.
- **Rhythm:** An 8px linear scale governs all spacing. Vertical stacks of information (e.g., asset details) use the `stack-md` unit to maintain a tight, professional density.

## Elevation & Depth
Elevation in this design system is used to indicate interactivity and information layering rather than physical realism. 

- **Surface Tiers:** Use a three-tier system. The background is Level 0 (#f8fafc). Main content cards are Level 1 (#ffffff) with a 1px border (#e2e8f0).
- **Shadows:** We use "Ambient Shadows"—soft, diffused, and low-opacity.
    - *Resting Card:* 0px 1px 3px rgba(0,0,0,0.05).
    - *Hover/Active:* 0px 10px 15px -3px rgba(30, 58, 138, 0.08) (tinted with Primary Blue).
- **Overlays:** Modals and slide-outs use a 40% opacity blur background to maintain context without visual noise.

## Shapes
To soften the professional rigor of the enterprise environment, the system utilizes **Rounded (0.5rem base)** corner logic. However, major containers and primary buttons utilize the `rounded-xl` (1.5rem) setting to create a modern, approachable feel that distinguishes the product from legacy "boxy" software.

- **Inputs/Small Buttons:** 0.5rem (Rounded).
- **Cards/Modals/Large Actions:** 1.5rem (Rounded-XL).

## Components
Consistent implementation of these components ensures a unified user experience:

- **Buttons:** Primary buttons are solid Deep Blue with white text. Secondary buttons use a subtle grey ghost-style with a primary-colored border on hover.
- **Asset Cards:** Utilize `rounded-xl` corners and a soft shadow. They must include a clear status badge in the top-right (or top-left in RTL).
- **Input Fields:** High-contrast borders (#cbd5e1) that darken to Primary Blue on focus. Labels are always positioned above the field for maximum clarity in form-heavy asset entry.
- **Data Tables:** Row-based with hover states. Use "Zebra-striping" only for tables exceeding 10 columns.
- **Status Chips:** High-saturation background with 10% opacity and 100% opacity text for high visibility (e.g., Green text on light green background).
- **Sidebar:** A vertical navigation bar on the right (for RTL/Arabic) or left (for LTR/English), utilizing a semi-collapsed state to maximize the working area for asset dashboards.