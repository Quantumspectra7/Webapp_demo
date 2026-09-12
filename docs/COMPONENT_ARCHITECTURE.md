# GramVest — Component & Design System Architecture

This document details the component hierarchy, visual design system tokens, and UX patterns implemented across the GramVest application.

---

## 1. Visual Design System (Warm Editorial Humanism)

GramVest avoids generic "AI-slop", neon gradients, and floating cards in favor of a trustworthy, grounded ledger-and-cartography aesthetic inspired by physical Indian business ledgers (*bahi khata*) and survey registers.

### 1.1 Color Palette
- **Canvas Base (`#FFF8F2` / `#F8F5EE`)**: Warm unbleached paper surface reducing screen glare.
- **Surfaces & Cards (`#FFFFFF` / `#FFFDF9`)**: Crisp white paper modules with subtle 1px `#DDD6C9` ink rules.
- **Primary Ink (`#1D1B18` / `#25231F`)**: Deep charcoal high-contrast ink for legibility.
- **Primary Accent (`#9D3E21` / `#C75D3E`)**: Kiln-fired terracotta for focal call-to-actions and key capital thresholds.
- **Positive Guidance / Sage (`#536346` / `#416246`)**: Muted olive green for healthy debt ratios and verified outcomes.
- **Warning / Planning (`#735c00` / `#CAA739`)**: Warm mustard for watchouts and seasonal fodder warnings.
- **Structural Lines (`#DDD6C9` / `#E7DED5`)**: Grounded boundaries delineating rows and modules.

### 1.2 Typography System
- **Editorial Headings**: `Noto Serif` (`var(--font-noto-serif)`). Conveys the weight of legal gazettes and institutional permanence.
- **Interface & Operational Reading**: `Plus Jakarta Sans` (`var(--font-plus-jakarta)`). Crisp geometric clarity under diverse screen lighting.
- **Financial Numbers**: Tabular lining figures enabled for ledger accuracy (`tabular-nums`).

---

## 2. Component Hierarchy

```
AppShell
├── Sidebar (fixed left, w-72)
│   ├── Logo & Brand Header ("GramVest · Rural Decision Engine")
│   ├── Navigation Groups (Home, Your Business, Get Help, Your Report)
│   ├── Reset Demo Scenario Trigger
│   ├── Language Switcher (EN / PA / HI)
│   └── Profile Settings Link
│
├── Header (sticky top)
│   ├── Business Selector Dropdown ("Dairy Processing Unit · Jagraon, Punjab")
│   ├── Help / Documentation Link
│   └── User Avatar Pill (GS / "Gurpreet S.")
│
└── Main Workspace View
    ├── Common Building Blocks:
    │   ├── StatusPill (Market, Money, Customers, Risk)
    │   ├── SourceBadge (Source dataset, date, verification status)
    │   ├── ConfidenceBadge (High/Medium/Low confidence tag)
    │   ├── MetricCard (Label, large tabular value, unit, delta pill)
    │   └── DynamicMapWrapper (SSR-safe Leaflet map with radius & pins)
    │
    └── Screen-Specific Workspaces:
        ├── Landing Page (Rotating verification check phrases, 4 pillars)
        ├── Onboarding Wizard (4-step guided setup with instant demo loader)
        ├── Dashboard (Operational verdict hero, 74/100 rank, quick snapshots)
        ├── Market Intelligence (5km/10km toggle, demographic metrics, price trend)
        ├── Competitor Map (Interactive Leaflet map + filterable inspector drawer)
        ├── Opportunity & Viability (Local gaps, 3-pillar breakdown, explainable score)
        ├── SWOT & Risks (2x2 SWOT grid, categorized risk matrix with mitigations)
        ├── Financial Simulator (Project cost table, live sliders, cash flow chart)
        ├── Scheme Router (PMEGP 35% grant, AIF 3% subvention, interactive checklist)
        ├── AI Advisor (Split-view context panel + streaming chat with citations)
        ├── What-If Simulator (Base vs Scenario sliders, sensitivity bar chart, pivots)
        └── Feasibility DPR Report (18 bankable sections, PDF download & print)
```

---

## 3. Product Routing Structure

| Route | Screen Name | Key Interaction |
| :--- | :--- | :--- |
| `/` | Landing Page | Dynamic rotating validation banner, teaser, CTA |
| `/onboarding` | Guided Onboarding | 4-step wizard, Punjab location cascade, demo preset |
| `/dashboard` | Executive Dashboard | Central workspace, 74/100 viability rank, snapshot modules |
| `/market` | Market Intelligence | 5km vs 10km toggle, population & consumption metrics |
| `/market/competitors`| Interactive Map | Leaflet spatial nodes, type filters, competitor drawer |
| `/opportunity` | Opportunity Analysis | Local gap evidence, explainable scoring weights |
| `/risks` | SWOT & Risk Matrix | 2x2 SWOT, severity filter, mandatory bank mitigations |
| `/money` | Financial Simulator | Live sliders for capital, EMI, cash flow recalculation |
| `/financing` | Scheme Router | PMEGP subsidy match (₹3.15L), document checklist |
| `/advisor` | AI Business Advisor | Context drawer, suggested prompts, citations |
| `/what-if` | What-If Simulator | Stress-test price & fodder shocks, sensitivity comparison |
| `/report` | Feasibility DPR | Complete bankable Detailed Project Report, PDF & Print |
