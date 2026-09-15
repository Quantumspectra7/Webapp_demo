# GramVest Data Coverage Matrix & Availability Audit
## SIH 2026 — PS 26091: Central Data Architecture Review

This document provides a module-by-module and category-by-category audit of data availability, source reliability, and identified gaps across the GramVest platform.

---

## 1. MVP Business Category Comparative Coverage Matrix

We evaluate our 3 initial MVP business categories—plus secondary prospective categories—across 8 distinct data dimensions to establish realistic data richness rather than assuming equal availability:

| Category | Market Data Availability | Competitor Data Density | Price Data Freshness & Depth | Equipment Cost Reliability | Financial Operating Assumptions | Scheme Coverage & Subsidy Fit | Risk & Mitigation Rules | Overall Data Confidence | Recommendation & Strategic Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Dairy & Milk Value Addition (`CAT-DAIRY`)** | **High**: Milkfed/Verka network, district cattle fairs, cooperative collection centers. | **Medium**: Cooperative societies mapped; unorganized village milkmen (doodhias) unmapped. | **High**: Farmgate milk pricing circulars (Fat/SNF rates) from Punjab Dairy Board; wholesale paneer quotes. | **High**: Standardized quotes for Bulk Milk Coolers (1000L), automated analyzers, and paneer presses. | **High**: Well-documented 15-day milk procurement cycle, 3.5% fat/8.5% SNF standard yields. | **Exceptional**: PMEGP (25-35% subsidy) + AHIDF (3% interest subvention, 90% loan) + NABARD DEDS. | **High**: Operational power outage risk, winter flush season glut, FSSAI quality norms. | **0.94 / 1.00** | **Tier 1 Primary MVP**: Extremely data-rich, highest rural Punjab relevance, deep scheme integration. |
| **2. Agro & Food Processing - Flour Mill (`CAT-AGRO-FOOD`)** | **Very High**: APMC mandis (Khanna, Jagraon, Ludhiana) with daily AGMARKNET trade arrivals. | **Medium**: Prominent commercial chakkis mapped in OSM; informal domestic stone mills unmapped. | **Very High**: Daily modal auction rates for raw wheat grain; peri-urban packaged retail atta prices. | **High**: Standardized quotes from Ludhiana agro-machinery makers for 24-inch chakkis, destoners, sealers. | **High**: Documented extraction rate (93% atta, 6% bran, 1% milling loss), energy kWh/quintal norms. | **Very High**: PMFME (35% capital subsidy, max ₹10L) + PMEGP manufacturing. | **High**: Post-harvest grain price volatility, informal local price undercutting. | **0.93 / 1.00** | **Tier 1 Primary MVP**: Core staple commodity of Punjab; verified mandi pricing; direct PMFME ODOP alignment. |
| **3. Farm Equipment Custom Hiring (`CAT-FARM-EQUIP`)** | **Medium**: Seasonally concentrated around sowing windows (Rabi/Kharif); mandis serve as machinery hubs. | **Low-Medium**: Formal implement dealers mapped; individual farmer-owned rental tractors unmapped. | **Medium-High**: Hourly rental benchmarks published in NABARD PLP Ludhiana; diesel fuel benchmark. | **Exceptional**: Standardized dealer price lists for 50 HP tractors, rotavators, laser land levelers. | **Medium**: Machine maintenance hours per season, diesel consumption (4.5 L/hr), operator day rates. | **High**: Sub-Mission on Agricultural Mechanization (SMAM) + PMEGP service unit cap (₹20L). | **High**: Extreme seasonality (two 25-day annual peaks), diesel price escalation risk. | **0.90 / 1.00** | **Tier 1 Primary MVP**: Critical farm mechanization bottleneck in Punjab; solid capital benchmarks. |
| **4. Commercial Poultry (`CAT-POULTRY`)** | **Medium**: Broiler integration contracts exist; feed mills mapped. | **Low**: Commercial sheds outside village clusters rarely geo-tagged. | **Medium**: Daily NECC egg rates; broiler spot market volatility. | **Medium**: Shed civil construction quotes vary widely across tehsils. | **Medium**: Feed conversion ratio (FCR 1.5 - 1.7), bird mortality assumptions. | **High**: AHIDF broiler feed plants, PMEGP. | **High**: Extreme disease risk (Avian influenza), feed raw material price shocks. | **0.82 / 1.00** | **Phase 2 Expansion**: High biological volatility; defer until post-MVP. |
| **5. Beekeeping & Honey (`CAT-BEEKEEPING`)** | **Medium**: Migratory apiaries across Punjab mustard belt. | **Very Low**: Mobile apiaries do not have fixed physical footprints. | **Medium**: National Bee Board wholesale honey procurement quotes. | **Medium**: Wooden hive boxes, centrifugal extractors. | **Low-Medium**: Weather-dependent floral nectar flow; seasonal migration transport costs. | **High**: National Beekeeping & Honey Mission (NBHM), PMEGP. | **Medium-High**: Pesticide spray toxicity, climate change disruptions. | **0.78 / 1.00** | **Phase 2 Expansion**: Lack of fixed physical location complicates GIS mapping. |
| **6. Rural Retail & Kirana (`CAT-RETAIL-GROCERY`)** | **High**: Ubiquitous in every village center and street corner. | **Low**: High informal density; OSM captures <15% of actual rural kirana stores. | **Medium**: Standard FMCG MRP lists; wholesale distributor margins. | **High**: Basic shelving, deep freezers, digital weighing scales. | **Medium**: Credit sales (khata) to villagers (bad debt risk 5-10%). | **Medium**: MUDRA Shishu/Kishor; not eligible for PMEGP/PMFME manufacturing grants. | **Medium**: Working capital lock-in, inventory expiry. | **0.80 / 1.00** | **Phase 3 Expansion**: Intense competition; limited specialized scheme assistance. |

---

## 2. Module-by-Module Data Availability & Gap Audit

### Module 1: Entrepreneur Profile & User Data
- **Available Data**: Form parameters (own capital, preferred business scale, education level, experience, existing shed assets, risk appetite).
- **Missing / Excluded Data**: Aadhaar and personal financial identity documents (intentionally excluded to prevent regulatory and privacy non-compliance).
- **Coverage Status**: **Complete (100%)**.

### Module 2: Location & PostGIS Spatial Resolution
- **Available Data**: Punjab State boundary, 5 key districts (*Ludhiana, Amritsar, Jalandhar, Bathinda, Hoshiarpur*), 9 rural blocks, 10 Census villages with official 6-digit Census 2011 codes, and precise WGS84 centroid coordinates.
- **Coverage Limitation**: Only 10 sample villages are deeply parameterized for the MVP demo; remaining 12,000+ Punjab villages have census codes and coordinates in state open data but lack localized business density surveys.
- **Coverage Status**: **Good (Verified Sample)**.

### Module 3: Demographics
- **Available Data**: Census 2011 Primary Census Abstract: population, households, gender split, total workers, main workers, marginal workers, cultivators, agricultural laborers, and literacy rates.
- **Coverage Limitation**: Data is historical (2011). National decennial census was postponed post-2011.
- **Protocol**: Mandate `source_year = 2011` and display UI tag: *"Census 2011 Benchmark Reference"*.
- **Coverage Status**: **Authoritative (Historical)**.

### Module 4: Market Intelligence & APMC Mandis
- **Available Data**: Major APMC Mandis (Khanna, Jagraon, Ludhiana Dana Mandi) and rural weekly haats. PostGIS points, operating days, road accessibility scores.
- **Coverage Status**: **Complete (Verified)**.

### Module 5: Competitor Mapping
- **Available Data**: Sample commercial flour mills, cooperative milk centers, paneer processing units, and agro-workshops extracted from OpenStreetMap and cooperative registers.
- **Coverage Limitation**: Does not represent an exhaustive ground census of informal village enterprises.
- **Protocol**: Display `coverage_status = 'good'` and disclaimer: *"Identified businesses from public map data; may not reflect all local informal establishments"*.
- **Coverage Status**: **Sample / Good**.

### Module 6: Local Commodity & Product Prices
- **Available Data**: Daily modal wholesale auction rates from AGMARKNET for wheat, paddy, mustard; Punjab Dairy Board farmgate cow and buffalo milk procurement rates; wholesale paneer and branded chakki atta quotes.
- **Coverage Limitation**: Hyper-local village farmgate transactions vary by $\pm 5\%$ based on fat testing and moisture content.
- **Coverage Status**: **High Freshness & Confidence (Verified)**.

### Module 7: Equipment & Setup Costs
- **Available Data**: Triangulated commercial machinery costs (min, typical, max) from reputable Ludhiana agro-industrial equipment manufacturers for bulk milk chillers, paneer presses, ultrasonic milk analyzers, 24-inch stone chakkis, vibro destoners, nitrogen pouch sealers, tractors, rotavators, and laser levelers.
- **Coverage Status**: **Complete (Verified Benchmarks)**.

### Module 8: Business Templates & Unit Economics
- **Available Data**: Complete operational templates for Mini Dairy Processing, Commercial Atta Chakki, and Farm Custom Hiring Center. Structured capex line items, monthly revenue projections, and operating expenses (power tariffs, wages, fuel, maintenance).
- **Estimated Parameters**: Civil shed renovation (₹350/sq ft), backup diesel generator installation, and initial working capital margins are marked with `is_estimated = true`.
- **Coverage Status**: **Complete (Curated + Estimated)**.

### Module 9: Government Scheme Router
- **Available Data**: Official parameters, funding limits, subsidy percentages, loan tenures, moratorium periods, and eligibility criteria for PMEGP (v2.0), PMFME (v1.0), AHIDF (v1.0), and MUDRA (2024 Update).
- **Coverage Status**: **Complete (100% Official)**.

### Module 10: Financial Engine & Viability Calculations
- **Available Data**: Deterministic calculations for Capex, Loan Financing, EMI, EBITDA, Annual Debt Service, Net Cashflow, DSCR, and Break-Even %.
- **Audit Logging**: Every financial projection links to a `calculation_runs` record storing the calculation engine version, input snapshot hash, and calculation timestamp.
- **Coverage Status**: **Complete (Deterministic Engine)**.

### Module 11: Risk & Opportunity Engine
- **Available Data**: 7 category-specific risk rules covering operational, seasonal, regulatory, raw material, and financial risks with explicit mitigations. 5 opportunity evaluation conditions explaining commercial viability factors.
- **Coverage Status**: **Complete (Curated Rules)**.

### Module 12: AI / RAG Knowledge Base
- **Available Data**: Full-text operational guidelines for PMEGP (2022), PMFME (2021), and AHIDF (2020) formatted in markdown and chunked with page and section references.
- **Embedding Policy**: Vector column is set to `NULL` with `embedding_status = 'pending'`, `embedding_model = 'text-embedding-004'`, and `embedding_dimension = 768`. Zero fake/simulated vectors.
- **Coverage Status**: **Complete (Text Chunks) / Pending (Real Model Embedding)**.

### Module 13: Detailed Project Report (DPR) Feasibility
- **Available Data**: Complete end-to-end data pipeline supporting the compilation of bankable DPR PDFs containing profile details, spatial context, financial projections, debt service schedules, scheme subsidy routing, and risk mitigation strategies.
- **Coverage Status**: **Complete (Integrated)**.
