# GramVest — Rural Business Decision Engine

> **SIH 2026 — Problem Statement 26091**  
> *"AI-Driven Hyper-Local Business Advisory & Financial Structuring Assistant for Rural Micro-Entrepreneurs."*

---

## 🌟 Overview

**GramVest** is a professional decision-support web application for rural and small-town entrepreneurs in Punjab, India. It combines **Location + Market + Finance + AI** into a calm, trustworthy, and actionable economic tool.

The application is **NOT** a generic AI chatbot, **NOT** a standard admin dashboard, and **NOT** an aesthetic toy. It is built to assist rural entrepreneurs in understanding whether an enterprise fits their local market, capital, and risk appetite before borrowing money.

### Core Value Persona & Geographic Focus
- **Entrepreneur**: Gurpreet Singh (GS)
- **Venture**: Small Dairy Processing & Bulk Milk Chilling Unit (1,000L BMC, 500 L/day initial capacity)
- **Location**: Sidhwan Bet, Jagraon Block, Ludhiana District, Punjab
- **Capital Outlay**: ₹9,00,000 Total Project Cost (₹3,00,000 own equity, ₹6,00,000 term loan)
- **Primary Scheme**: PMEGP Rural Special Category (35% Capital Subsidy = ₹3,15,000)
- **Viability Rank**: 74 / 100 (Top Quartile, Jagraon-Ludhiana rural belt)
- **Debt Coverage Ratio (DSCR)**: 1.62x (Comfortably exceeds bank 1.30x hurdle)

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router) with React 19 & TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with custom Warm Editorial Humanism theme tokens
- **Interactive Maps**: Leaflet & React-Leaflet with custom map pins and 5km/10km radius overlays
- **Data Visualizations**: Recharts for monthly cash flow statements, sensitivity comparisons, and viability breakdown
- **Icons**: Lucide React
- **Architecture**: Decoupled domain service layer with swappable mock/API provider interfaces

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Production Build & Typecheck
```bash
npm run build
```

### 4. Run Automated Unit Tests
```bash
npm test
```
Runs unit tests for financial math (`calculateEMI`, `calculateOperatingFinancials`, `calculateViabilityScore`) and Indian formatters (`formatCurrency`, `formatCompactCurrency`, `formatNumber`).

---

## 🗺️ Product Routes & Features

| Route | Feature Description |
| :--- | :--- |
| `/` | **Landing Page**: Value proposition, dynamic rotating checks, 4 pillars, teaser radar |
| `/onboarding` | **Guided Onboarding**: 4-step wizard for Punjab locations, capital, and venture selection (includes 1-click Demo Persona Loader) |
| `/dashboard` | **Executive Workspace**: Operational verdict hero, 74/100 viability rank, snapshot modules |
| `/market` | **Market Intelligence**: 5km vs 10km toggle, demographic metrics, supply deficit gap |
| `/market/competitors`| **Interactive Competitor Map**: Full Leaflet spatial map with category filters and competitor details inspector |
| `/opportunity` | **Opportunity Analysis**: Local gaps, 3-pillar breakdown (Recommendations, Conditions, Concerns), and explainable score breakdown |
| `/risks` | **SWOT & Risk Matrix**: 2x2 SWOT grid and categorized risk table with practical mitigations |
| `/money` | **Financial Simulator**: Live sliders for project cost, own equity, and prices with instant EMI & DSCR recalculation, plus 12-month cash flow chart |
| `/financing` | **Scheme Router**: PMEGP 35% subsidy match, AIF 3% subvention, and interactive loan document checklist |
| `/advisor` | **AI Advisory Assistant**: Context-aware chat grounded in Punjab PAU agricultural benchmarks with citations |
| `/what-if` | **What-If Simulator**: Stress-test price declines, summer fodder price hikes, and power outages with side-by-side comparison |
| `/report` | **Feasibility DPR Report**: 18-section bank-ready Detailed Project Report, PDF export, and print formatting |

---

## 📖 Architecture & Integration Documentation

Comprehensive documentation has been prepared for backend developers:
- [Frontend Data Contracts](file:///docs/FRONTEND_DATA_CONTRACTS.md): Request and response schemas for all 7 service domains.
- [Backend Integration Guide](file:///docs/BACKEND_INTEGRATION_GUIDE.md): Step-by-step FastAPI / PostGIS replacement instructions.
- [Component & Design System Architecture](file:///docs/COMPONENT_ARCHITECTURE.md): Design tokens, typography hierarchy, and component taxonomy.

---

## 📋 Acceptance Verification Checklist

- [x] Landing page with dynamic rotating validation checks
- [x] Guided 4-step onboarding with Punjab geographic cascade
- [x] Central dashboard with 74/100 circular viability gauge and status pills
- [x] 5 km / 10 km catchment toggle
- [x] Interactive Leaflet map with competitor pins and catchment radius
- [x] Explainable viability score with configurable weights
- [x] 2x2 SWOT analysis & categorized risk matrix with mitigations
- [x] Dynamic financial simulator with real-time EMI, DSCR, and cash flow updates
- [x] Recommended PMEGP 35% subsidy route with document checklist
- [x] Context-aware AI Advisor with citations and suggested prompts
- [x] What-If downside stress-testing simulator with delta table
- [x] Feasibility DPR Report with PDF download simulation and print layout
- [x] 100% decoupled service and provider architecture for future backend APIs
- [x] Automated unit tests passing for calculations and formatters
