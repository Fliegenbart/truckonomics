# Design Guidelines: Truck Comparison & TCO Calculator

## Design Approach: Carbon Design System

**Rationale:** This is a data-intensive comparison and calculation tool requiring clear information hierarchy, robust data visualization, and efficient user input workflows. Carbon Design System excels in enterprise-grade applications with complex data displays and forms.

**Core Principles:**
- Clarity over decoration - every element serves the data
- Scannable information architecture for quick comparisons
- Professional, trustworthy aesthetic for financial decisions
- Efficient input-to-output workflow

---

## Color Palette

### Light Mode (Primary)
- **Background:** 0 0% 98% (neutral-100)
- **Surface:** 0 0% 100% (white cards)
- **Primary Brand:** 210 100% 40% (professional blue for headers, CTAs)
- **Success/Savings:** 142 71% 35% (green for cost savings indicators)
- **Warning/Costs:** 25 95% 53% (orange for high-cost alerts)
- **Text Primary:** 0 0% 13%
- **Text Secondary:** 0 0% 38%
- **Borders:** 0 0% 88%

### Dark Mode
- **Background:** 0 0% 9%
- **Surface:** 0 0% 13%
- **Primary:** 210 100% 60%
- **Success:** 142 71% 45%
- **Warning:** 25 95% 60%
- **Text Primary:** 0 0% 95%
- **Text Secondary:** 0 0% 70%

---

## Typography

**Font Stack:** 'Inter', system-ui, sans-serif (via Google Fonts)

- **Headings (H1):** 32px/40px, font-weight 600, tracking -0.02em
- **Section Headers (H2):** 24px/32px, font-weight 600
- **Card Titles (H3):** 18px/24px, font-weight 500
- **Body Text:** 14px/20px, font-weight 400
- **Labels/Captions:** 12px/16px, font-weight 500, uppercase tracking
- **Data Values:** 16px/24px, font-weight 600, tabular-nums

---

## Layout System

**Spacing Units:** Consistent use of 4, 8, 12, 16, 24, 32, 48 (Tailwind units: p-1, p-2, p-3, p-4, p-6, p-8, p-12)

**Grid Structure:**
- Max container width: 1440px (max-w-7xl)
- Comparison cards: 3-column grid on desktop (lg:grid-cols-3), stack on mobile
- Form inputs: 2-column grid for related parameters (md:grid-cols-2)
- Charts: Full-width within cards

---

## Component Library

### Header & Navigation
- Clean top bar with app title and dark mode toggle
- Sticky navigation during scroll
- Height: 64px, subtle bottom border

### Input Parameter Section
**Three Column Cards (Diesel, Electric 1, Electric 2):**
- White/dark surface cards with 16px padding
- Vehicle image placeholder at top (160px height, object-cover)
- Vehicle name/model input field
- Grouped parameter inputs:
  - Purchase price (currency input with $ prefix)
  - Annual mileage (number with comma formatting)
  - Fuel/electricity cost per unit
  - Maintenance costs (annual)
  - Insurance (annual)
  - Expected lifespan (years dropdown)
- Each card has subtle shadow on light mode, border on dark mode

### Calculation Controls
- Centered control panel below input cards
- Timeframe selector: Pill-style toggle (3yr, 5yr, 7yr, 10yr)
- Large "Calculate TCO" primary button (48px height, full-width on mobile)
- Reset parameters link (text-only, subtle)

### Results Dashboard
**Summary Metrics (4-column grid on desktop):**
- Large metric cards showing:
  - Total savings (diesel vs best electric)
  - Break-even point (months)
  - 10-year TCO comparison
  - Environmental impact difference
- Each metric: Large number (32px) with label below

### Data Visualization
**Amortization Timeline Chart:**
- Line chart showing cumulative costs over time
- Three colored lines (diesel = blue-gray, electric1 = green, electric2 = teal)
- Break-even point markers with vertical dashed lines
- X-axis: Years (0-10), Y-axis: Cost ($)
- Interactive tooltips on hover
- Legend at top-right of chart

**Cost Breakdown Comparison:**
- Stacked bar chart showing:
  - Purchase price
  - Fuel/electricity costs
  - Maintenance
  - Insurance
  - Depreciation
- Side-by-side bars for each vehicle
- Color-coded segments with legend

### Detailed TCO Table
- Responsive table with year-by-year breakdown
- Columns: Year | Diesel Cost | Electric 1 Cost | Electric 2 Cost | Savings
- Alternating row backgrounds for readability
- Sticky header on scroll
- Mobile: Transform to cards with labels

### Footer
- Simple footer with tool version, data sources disclaimer
- Links: About, Methodology, Contact
- 48px height, subtle top border

---

## Images

**Hero Section:** No hero image - tool launches directly into functionality

**Vehicle Cards:** Each comparison card includes a vehicle image placeholder (16:9 aspect ratio, 160px height) at the top showing the truck type. Use placeholder with descriptive alt text like "Diesel Truck Model" or "Electric Truck Model 1".

---

## Interactions & States

- Input fields: Clear focus states with blue outline
- Buttons: Subtle scale on hover (transform: scale(1.02))
- Charts: Smooth transitions when data updates (300ms ease)
- Loading state: Skeleton screens for charts while calculating
- Error states: Inline validation messages below inputs in red
- Success states: Green highlight flash on successful calculation

---

## Accessibility & Responsiveness

- All form inputs properly labeled with aria-labels
- Chart data available in table format for screen readers
- Keyboard navigation for all interactive elements
- Mobile: Single column stack, collapsible input sections
- Tablet: 2-column input grid
- Desktop: 3-column comparison layout
- Touch-friendly tap targets (minimum 44px)

---

## Animation Philosophy

**Minimal, purposeful motion:**
- Data updates: Smooth number counting animation (1s duration)
- Chart rendering: Fade-in with slight upward motion (400ms)
- No decorative animations - focus on data clarity