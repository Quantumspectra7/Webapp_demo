# GramVest Master Dataset & Central Architecture Report
## SIH 2026 — PS 26091: AI-Driven Hyper-Local Business Advisory & Financial Structuring Assistant for Rural Micro-Entrepreneurs

---

## 1. Dataset Overview
The GramVest Master Dataset provides an authoritative, relational, source-backed single source of truth for rural and semi-urban enterprise development in Punjab, India. The architecture enforces two non-negotiable principles:
1. **AI explains; software calculates.** Deterministic financial projections, loan amortizations, break-even analyses, and DSCR metrics are calculated via standardized relational models, preventing LLM arithmetic hallucinations.
2. **Zero fabricated data & complete provenance.** Every official datum (demographics, mandi prices, scheme limits, policy rules) is explicitly linked to an official source identifier (`source_id`), retrieval date, and confidence level. Census data is strictly identified as `source_year = 2011`.
3. **Zero fake embeddings.** Document chunk embeddings remain `NULL` with `embedding_status = 'pending'`, awaiting real model generation (`text-embedding-004`).

---

## 2. Database Architecture
- **Engine**: PostgreSQL 15+
- **Logical Schema Partitioning**:
  - `master`: Public reference data, statutory rates, business templates, commodity pricing, scheme rules, and RAG knowledge.
  - `app`: User accounts, profiles, financial scenarios, calculation runs, financial outputs, and DPR reports.
- **Extensions**:
  - `uuid-ossp`: Unique stable keys
  - `postgis`: Geo-spatial vector indexing, radius distance calculations (`ST_DWithin`, `ST_Distance`), and boundary mapping.
  - `vector` (pgvector): High-dimensional semantic embeddings (`vector(768)`) for Retrieval-Augmented Generation (RAG) directly inside PostgreSQL.
- **Relational Integrity**: Enforced via cascading foreign keys, check constraints on numeric bounds ($>0$, percentages between $0-100\%$, min $\le$ typical $\le$ max), and spatial coordinate constraints.

---

## 3. Table Inventory (35 Master Tables)
| Domain | Schema | Table Name | Records | Key Responsibility |
| :--- | :--- | :--- | :--- | :--- |
| **Provenance** | `master` | `sources` | 12 | Authoritative registry of ministries, census, banks, and open data |
| **Versioning** | `master` | `dataset_versions` | 1 | Semantic release tracking and schema compatibility logging |
| **Quality** | `master` | `data_quality` | 4 | Freshness, completeness, and audit scores per entity |
| **Geography** | `master` | `states`, `districts`, `blocks`, `villages`, `locations` | 33 | Normalized PostGIS hierarchy with Census 2011 village codes |
| **Demographics** | `master` | `demographics` | 4 | Census 2011 population, households, gender, and worker counts |
| **Commerce** | `master` | `markets`, `businesses` | 9 | APMC Mandis and mapped competitive enterprise presence |
| **Products & Prices** | `master` | `products`, `prices`, `equipment` | 28 | Commodities, daily AGMARKNET modal rates, and equipment quotes |
| **Business Models** | `master` | `business_templates`, `_cost_templates`, `_revenue_templates`, `_expense_templates` | 38 | Deterministic micro-enterprise capex, opex, and revenue formulas |
| **Schemes** | `master` | `schemes`, `scheme_versions`, `scheme_eligibility_rules` | 18 | PMEGP, PMFME, AHIDF, MUDRA rules & parameter bounds |
| **Financial Ref** | `master` | `financial_references` | 5 | Macroeconomic statutory rates (RBI repo rate, MCLR spreads, IT Act) |
| **Operating Ops** | `master` | `business_operating_assumptions` | 5 | Micro-enterprise operational parameters (inventory cycle, wastage %) |
| **Advisory Logic** | `master` | `risk_rules`, `opportunity_rules`, `scoring_config` | 13 | Risk mitigation matrix, opportunity signals, and viability weights |
| **AI / RAG** | `master` | `documents`, `document_chunks` | 7 | Official operational guidelines chunked with pending vector metadata |
| **User Profiles** | `app` | `users`, `profiles` | 4 | Entrepreneur profiles and business intent |
| **Financial Runs**| `app` | `financial_scenarios`, `calculation_runs` | 2 | User financial scenarios and auditable engine execution snapshots |
| **Results & What-If**| `app` | `financial_results`, `what_if_scenarios` | 3 | Deterministic financial metrics and stress-testing perturbations |
| **Reporting** | `app` | `reports` | Schema | Detailed Project Reports (DPR) tracking metadata |

---

## 4. Data Sources & Provenance Registry
1. **Census of India 2011**: Primary Census Abstract Punjab (`SRC-GOI-CENSUS-2011`).
2. **Ministry of MSME / KVIC**: PMEGP Operational Guidelines 2022 (`SRC-GOI-MSME-PMEGP`).
3. **Ministry of Food Processing Industries (MoFPI)**: PMFME Operational Guidelines (`SRC-GOI-MOFPI-PMFME`).
4. **Department of Animal Husbandry & Dairying (DAHD)**: AHIDF Operational Guidelines (`SRC-GOI-DAHD-AHIDF`).
5. **Department of Financial Services / MUDRA Ltd**: PMMY Policy Framework 2024 (`SRC-GOI-PMMY-MUDRA`).
6. **Directorate of Marketing & Inspection (DMI)**: AGMARKNET Daily Punjab Mandi Prices (`SRC-PB-MANDI-AGMARK`).
7. **Punjab Dairy Development Board & Milkfed**: Farmgate Milk Pricing circulars (`SRC-PB-DAIRY-BOARD`).
8. **Reserve Bank of India (RBI)**: Repo Rate & Priority Sector Lending Master Directions (`SRC-RBI-BENCHMARK-2026`).
9. **NABARD**: Potential Linked Credit Plan (PLP) Ludhiana District (`SRC-NABARD-PLP-LDH`).
10. **OpenStreetMap Contributors**: Punjab POI & Commercial Nodes (`SRC-OSM-PUNJAB-POI`).
11. **Ludhiana Machinery Manufacturers**: Agro-machinery and Dairy Equipment benchmarks (`SRC-VEND-EQUIP-REF`).
12. **GramVest Research**: Curated domain matrices and scoring logic (`SRC-GRAMVEST-CURATED`).

---

## 5. Source Reliability & Confidence Scoring
- **Official Government Policy (1.00 - 0.97)**: PMEGP, PMFME, AHIDF, MUDRA, RBI, Census.
- **Official Market Data (0.98 - 0.95)**: AGMARKNET daily mandi modal auctions, Punjab Dairy Board circulars.
- **Institutional Research & Benchmarks (0.95 - 0.90)**: NABARD PLP unit costs, triangulated vendor quotes.
- **Open Data & POI (0.88 - 0.82)**: OpenStreetMap commercial locations (explicitly flagged as sample coverage, not exhaustive ground census).

---

## 6. Geographic Coverage (Punjab Deep-Dive)
- **Primary Deep District**: **Ludhiana** (5 Blocks: *Jagraon, Khanna, Dehlon, Raikot, Ludhiana-1*).
- **Secondary Anchor Districts**: *Amritsar (Majitha), Jalandhar (Nakodar), Bathinda (Talwandi Sabo), Hoshiarpur (Dasuya)*.
- **Administrative Boundary Validation**: All coordinates verified against the official administrative territory of Punjab using PostGIS polygon containment `ST_Contains`.

---

## 7. Business Category Coverage (MVP Strategy & Justification)
The initial MVP focuses deeply on **3 core categories**:
1. **Dairy & Milk Value Addition (`CAT-DAIRY`)**: Punjab has the highest per capita milk availability in India; high rural household engagement; massive financial alignment with AHIDF and PMEGP; high-margin conversion (milk to paneer/ghee).
2. **Agro & Food Processing (`CAT-AGRO-FOOD`)**: Leveraging Punjab’s status as the grain basket of India; local milling and branded packaging under PMFME (ODOP scheme) yields immediate local cash flow.
3. **Farm Equipment Custom Hiring (`CAT-FARM-EQUIP`)**: High capital cost of farm mechanization forces 80%+ of marginal farmers to hire machinery on custom hourly rental during seasonal sowing windows.

---

## 8. Market & Price Coverage
- **APMC Mandis**: Includes Khanna Mandi (Asia's largest grain market), Jagraon APMC, and Ludhiana Central Dana Mandi.
- **Price Scopes**: Explicitly labeled `market` (auction modal), `district` (wholesale retail), or `local` (farmgate procurement).

---

## 9. Equipment & Setup Cost Coverage
- Contains triangulated minimum, typical, and maximum commercial cost quotes for:
  - Bulk Milk Coolers (1000L DX SS304)
  - Pneumatic Paneer Presses & processing vats
  - Ultrasonic Milk Analyzers & SS cans
  - Commercial 24-inch stone-ground atta chakkis & destoners
  - Continuous nitrogen pouch band sealers
  - 50 HP 4WD utility tractors, 7-ft rotavators, and laser land levelers.

---

## 10. Government Scheme Coverage & Versioning
- **PMEGP (v2.0)**: Max ₹50L manufacturing, 25-35% rural margin money subsidy, 10% own equity.
- **PMFME (v1.0)**: 35% credit-linked capital subsidy up to ₹10L ceiling.
- **AHIDF (v1.0)**: 3% interest subvention for 8 years, up to 90% loan financing, 25% CGFTAH guarantee.
- **MUDRA (2024 Update)**: Refinance collateral-free loans up to ₹20L under Tarun Plus.

---

## 11. Financial Modeling & Auditable Calculation Runs
The financial engine calculates:
$$\text{Project Cost} = \text{Fixed Capex} + \text{Working Capital Margin}$$
$$\text{Financing Requirement} = \text{Project Cost} - \text{Own Capital Contribution}$$
$$\text{Monthly EBITDA} = \text{Monthly Revenue} - \text{Monthly Cash Operating Expenses}$$
$$\text{DSCR} = \frac{\text{Annual EBITDA}}{\text{Annual Total Debt Service (Principal + Interest)}}$$
Every calculation execution generates an immutable audit record in `app.calculation_runs` storing the calculation engine version, the serialized input parameters, and the execution timestamp.

---

## 12. Risk Matrix & Opportunity Rules
- **Risk Taxonomy**: Operational, seasonal, regulatory, raw material volatility, and financial risk rules each with deterministic severity, probability, impact, and actionable mitigation.
- **Opportunity Logic**: Transparent scoring conditions explaining *why* an enterprise is viable (e.g. margin arbitrage between raw milk and paneer, PMFME ODOP subsidy advantage).

---

## 13. Viability Scoring Formula
Configured in `master.scoring_config` (version 1.0-SIH2026):
$$\text{Viability Score} = 0.25(\text{Market Demand}) + 0.20(\text{Competition Gap}) + 0.20(\text{Capital Fit}) + 0.20(\text{Cash Flow}) + 0.15(\text{Risk Resilience})$$

---

## 14. AI / RAG Knowledge Base & Embedding Governance
- Official government policy documents are chunked with section headers and page references.
- Zero fake/simulated embeddings: vector column is defined as `embedding vector(768) NULL` with `embedding_status = 'pending'`, `embedding_model = 'text-embedding-004'`, and `embedding_dimension = 768`.

---

## 15. End-to-End Demo Profile (Gurpreet Singh)
- **Profile**: Rural entrepreneur in Agwar Lopo Kalan, Jagraon (`USR-PB-2026-001`, `PRF-PB-2026-001`).
- **Target Business**: 1000 LPD Mini Dairy & Artisan Paneer Unit.
- **Calculation Run**: `RUN-PB-2026-001` (Engine: `GramVest-DeterministicFinance-v1.0`).
- **Financial Structure**:
  - Project Cost: ₹11,95,000
  - Own Capital: ₹2,39,000 (20%)
  - Term Loan: ₹9,56,000 (80% @ 9.5% p.a., 84 months, 6 months moratorium)
  - Monthly Revenue: ₹11,23,200 | Monthly Expenses: ₹10,07,500
  - Monthly Net Operating Profit: ₹1,15,700
  - Monthly EMI: ₹15,670
  - **DSCR**: 7.38x | **Viability Score**: 84.5 / 100 (Highly Bankable)
- **Scheme Routed**: PMEGP (Rural General 25% subsidy) or AHIDF (3% interest subvention).

---

## 16. Data Quality Assurance & Validation Results
- **Engine**: `validate_data.py`
- **Result**: **10 / 10 check categories PASSED (0 FAIL, 0 Critical Errors)**.
- **Documented Warnings**:
  1. Historical Census 2011 attribution explicitly documented.
  2. Public map competitor coverage tagged as sample coverage with transparent disclaimers.
  3. AI embeddings explicitly flagged as pending offline `text-embedding-004` population.

---

## 17. Database Setup Instructions
To deploy the database locally:
```bash
# 1. Create PostgreSQL database
createdb -U postgres gramvest

# 2. Run Two-Tier DDL Schema (creates master & app schemas, PostGIS, pgvector extensions, and indexes)
psql -U postgres -d gramvest -f database_schema.sql

# 3. Seed Master Data via Modular Seed Orchestrator
psql -U postgres -d gramvest -f seed.sql

# 4. Verify Compliance Test Suite
python validate_data.py
```
