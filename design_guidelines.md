# Design Guidelines: Heavy-Duty Truck TCO Calculator

## Design Approach: Apple HIG-Inspired Data Tool

**Rationale:** This professional financial calculator requires the clarity and trustworthiness of Apple's design language—clean typography, generous whitespace, elevation-based hierarchy, and refined interactions—while maintaining the data-intensive functionality of an enterprise tool.

**Core Principles:**
- Clarity through simplicity and breathing room
- Elevation and subtle shadows create depth without visual noise
- Glass-morphism for modern, premium feel
- Smooth, purposeful animations enhance understanding
- Professional blue accents on neutral foundation

---

## Color Palette

### Light Mode (Primary)
- **Background:** Linear gradient from 220 15% 97% to 220 10% 99%
- **Surface/Cards:** 0 0% 100% with elevation shadows
- **Primary Accent:** 210 100% 48% (professional blue for CTAs, highlights)
- **Success Green:** 142 76% 36% (savings indicators)
- **Alert Orange:** 25 95% 53% (cost warnings)
- **Text Primary:** 220 15% 15%
- **Text Secondary:** 220 10% 45%
- **Glass Effect:** rgba(255, 255, 255, 0.8) with 24px blur

### Dark Mode
- **Background:** Linear gradient from 220 20% 8% to 220 15% 11%
- **Surface:** 220 15% 13% with subtle glow
- **Primary:** 210 100% 58%
- **Success:** 142 76% 42%
- **Text Primary:** 220 15% 95%
- **Glass Effect:** rgba(30, 35, 45, 0.7) with 24px blur

---

## Typography

**Font Stack:** SF Pro Display, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif

- **Hero Title:** 56px/64px, font-weight 700, tracking -0.03em
- **Section Headers:** 32px/40px, font-weight 600, tracking -0.02em
- **Card Titles:** 20px/28px, font-weight 600
- **Body Text:** 16px/24px, font-weight 400
- **Labels:** 13px/18px, font-weight 500, letter-spacing 0.5px
- **Data Values:** 24px/32px, font-weight 700, tabular-nums
- **Small Print:** 12px/16px, font-weight 400

---

## Layout System

**Spacing Philosophy:** Generous whitespace using 8, 16, 24, 32, 48, 64, 80 (Tailwind: 2, 4, 6, 8, 12, 16, 20)

**Grid Structure:**
- Max container: 1280px with 48px horizontal padding on desktop
- Vehicle comparison: 3-column grid (gap-8) on lg:, stack on mobile
- Form sections: 2-column on md: for paired inputs
- Chart containers: Full-width with 24px internal padding

---

## Component Library

### Glass-Morphism Header
- Height: 80px, backdrop-blur-xl with glass effect background
- Floating appearance with subtle bottom shadow
- Left: App title "TCO Calculator" (24px, font-weight 600)
- Right: Dark mode toggle (smooth icon transition)
- Sticky positioning with smooth fade-in on scroll

### Hero Introduction Section
- 64px top padding, centered content
- Large headline: "Compare Total Cost of Ownership"
- Subheadline: "Class 8 Diesel vs. Electric Semi-Trucks" (text-secondary)
- Brief description paragraph with max-width of 640px
- Soft gradient background transitioning to main content

### Vehicle Comparison Cards
**Three Floating Cards (Diesel, Electric Option 1, Electric Option 2):**
- Rounded corners: 16px (rounded-2xl)
- Elevation: 0 4px 24px rgba(0,0,0,0.06) on light, soft glow on dark
- Padding: 32px
- Hover state: Subtle lift (translateY(-4px)) with enhanced shadow
- Top section: Vehicle illustration placeholder (240px height, rounded-xl, object-cover, subtle overlay gradient)
- Vehicle name input: Large, borderless with bottom border accent
- Parameter groups with 16px vertical spacing:
  - Purchase Price ($, large input)
  - Annual Mileage (mi/year)
  - Fuel/Electricity Rate ($/unit)
  - Annual Maintenance ($)
  - Annual Insurance ($)
  - Expected Lifespan (dropdown, 5-15 years)

### Calculation Control Panel
- Centered, glass-morphism container (backdrop-blur-lg)
- Rounded-2xl with subtle border
- Padding: 24px
- Timeframe selector: Pill buttons (3yr, 5yr, 7yr, 10yr) with smooth sliding indicator
- Primary CTA: "Calculate TCO" button (56px height, rounded-xl, gradient background, scale on hover)
- Secondary: "Reset All" text link below

### Results Dashboard

**Summary Metrics (4-column grid, gap-6):**
- Card style: White/dark surface, rounded-xl, 32px padding
- Each metric displays:
  - Large value (48px, font-weight 700, colored by type)
  - Label below (14px, text-secondary)
  - Small icon above value (24px)
  - Subtle pulsing animation on update

**Visual Insights Section:**
- Two-column layout on desktop (gap-8)
- Left: "Cost Over Time" line chart
- Right: "Breakdown Comparison" stacked bars
- Each chart in elevated card (40px padding, rounded-xl)

**Amortization Chart:**
- Clean line chart with gradient fills below lines
- Three vehicle lines with distinct colors (smooth curves)
- Break-even markers: Vertical dashed lines with floating labels
- Interactive tooltips: Glass-morphism background with sharp data
- Axes: Minimal styling, light grid lines
- Legend: Top-right, pill-style badges

**Cost Breakdown Chart:**
- Horizontal stacked bars for better mobile readability
- Categories: Purchase, Fuel, Maintenance, Insurance, Depreciation
- Smooth bar segments with rounded ends
- Color-coded with legend
- Hover: Highlight segment with value callout

### Year-by-Year Table
- Full-width card with 24px padding
- Rounded-xl, subtle shadow
- Sticky header with glass effect on scroll
- Columns: Year | Diesel | EV1 | EV2 | Annual Savings | Cumulative Savings
- Alternating row tints (subtle)
- Mobile: Transform to expandable accordion cards

### Footer
- 80px height, glass-morphism effect
- Centered content with max-width 1280px
- Left: "Methodology" and "Data Sources" links
- Right: Version info
- Subtle top border with gradient

---

## Images

**Hero Section:** No traditional hero image—leads directly into tool functionality with clean typography and gradient background.

**Vehicle Cards:** Each comparison card includes a semi-truck illustration (240px height, 16:9 aspect ratio). Use realistic renderings:
- Diesel: Modern Class 8 diesel semi in silver/chrome
- Electric 1: Sleek electric semi in white/blue
- Electric 2: Alternative electric model in dark gray
Images have subtle overlay gradient from bottom for text legibility.

---

## Animations & Interactions

**Motion Philosophy:** Smooth, physics-based animations that enhance clarity

- Card hover: translateY(-4px) + shadow enhancement (200ms ease-out)
- Button interactions: Scale(0.98) on press, smooth color transitions
- Chart rendering: Staggered fade-in with line drawing animation (800ms)
- Data updates: Number count-up with easing (1200ms)
- Toggle switches: Smooth sliding indicator (300ms cubic-bezier)
- Glass elements: Subtle backdrop-filter transitions
- Focus states: Glowing blue ring (2px, blur 4px)
- Loading states: Skeleton screens with shimmer effect

---

## Elevation & Shadow System

- **Level 1 (Cards):** 0 2px 16px rgba(0,0,0,0.04)
- **Level 2 (Hover):** 0 8px 32px rgba(0,0,0,0.08)
- **Level 3 (Modals):** 0 16px 48px rgba(0,0,0,0.12)
- **Glass Effect:** backdrop-blur(24px) with semi-transparent backgrounds
- Dark mode: Use subtle glows instead of shadows

---

## Responsive Behavior

- **Desktop (1280px+):** 3-column vehicle cards, 4-column metrics, side-by-side charts
- **Tablet (768-1279px):** 2-column cards, 2-column metrics, stacked charts
- **Mobile (<768px):** Single column, collapsible input sections, vertical chart orientation
- Touch targets: Minimum 48px for all interactive elements
- Horizontal scroll for tables on narrow viewports