# GramVest Database Architecture & Systems Design Specification
## SIH 2026 — PS 26091: Central Data Architecture Review

---

## 1. Executive Summary & Design Philosophy
The GramVest Central Database serves as the single authoritative source of truth for rural and semi-urban entrepreneurship in Punjab, India. The architecture enforces two non-negotiable foundational principles:

1. **AI Explains; Software Calculates**:
   - Generative LLMs and AI advisors are never permitted to calculate loan amortizations, debt service coverage ratios (DSCR), capital subsidies, or tax depreciations.
   - All financial mathematics are executed deterministically by audited backend calculation engines against structured template equations. AI layers receive calculated results solely for natural language explanation and contextual advisory.
2. **Zero Fabricated Data & Full Provenance**:
   - Every external datum carries an explicit `source_id`, retrieval timestamp, publication date, and confidence level.
   - Decennial census figures are explicitly attributed to `source_year = 2011` and never labeled as "current population".
   - Estimates are explicitly isolated with `is_estimated = true`, methodology notes, and reference citations.

---

## 2. Two-Tier Logical Schema Architecture

To strictly isolate public reference knowledge from user-specific transactions and derived computational artifacts, the PostgreSQL database is partitioned into two distinct logical schemas:
- **`master` Schema**: Authoritative public data, government scheme parameters, commodity prices, equipment quotes, business templates, risk matrices, and vector document chunks.
- **`app` Schema**: User accounts, entrepreneur profiles, user financial scenarios, calculation audit runs, stress-testing simulations, and generated Detailed Project Reports (DPR).

```
PostgreSQL Database: gramvest
│
├── master (Public & Reference Data Layer)
│   ├── sources
│   ├── dataset_versions
│   ├── data_quality
│   ├── states
│   ├── districts
│   ├── blocks
│   ├── villages
│   ├── locations
│   ├── demographics (Census 2011)
│   ├── business_categories
│   ├── businesses (Sample competitor presences)
│   ├── markets (APMC Mandis & Rural Haats)
│   ├── products
│   ├── prices (AGMARKNET & Farmgate benchmarks)
│   ├── equipment (Triangulated vendor benchmarks)
│   ├── business_templates
│   ├── business_cost_templates
│   ├── business_revenue_templates
│   ├── business_expense_templates
│   ├── schemes
│   ├── scheme_versions
│   ├── scheme_eligibility_rules
│   ├── financial_references (Macro / Regulatory: RBI, IT Act)
│   ├── business_operating_assumptions (Micro-enterprise ops)
│   ├── risk_rules
│   ├── opportunity_rules
│   ├── scoring_config
│   ├── documents
│   └── document_chunks (pgvector RAG store)
│
└── app (User & Runtime Derived Data Layer)
    ├── users
    ├── profiles
    ├── financial_scenarios
    ├── calculation_runs (Audit logging of engine executions)
    ├── financial_results (Computed financial metrics)
    ├── what_if_scenarios (Stress-test perturbations)
    └── reports (Bankable DPR PDFs & summaries)
```

---

## 3. Detailed Domain Specifications

### A. Provenance & Versioning (`master` schema)
- **`master.sources`**:
  - Authoritative registry capturing `source_type` (`official_government`, `census`, `official_market_data`, `bank`, `osm`, `vendor_reference`, `curated`, `estimated`), publication URLs, retrieval timestamps, and legal licenses.
- **`master.dataset_versions`**:
  - Tracks dataset release milestones (`v1.0-sih2026-mvp`), release dates, schema versions, active flags, and cryptographic hashes of the processed seed files.
- **`master.data_quality`**:
  - Logs per-entity confidence, freshness, and completeness metrics, ensuring continuous quality assurance.

### B. Geography & PostGIS Spatial Topology (`master` schema)
- **Hierarchy**: `states` $\to$ `districts` $\to$ `blocks` $\to$ `villages` $\to$ `locations`.
- **Coordinate System**: WGS 84 (EPSG:4326) with PostGIS `GEOMETRY(Point, 4326)`.
- **Administrative Boundary Validation**:
  - Bounding box check ($[29.5^\circ\text{N}-32.5^\circ\text{N}, 73.8^\circ\text{E}-76.9^\circ\text{E}]$) is maintained as a fast pre-filter.
  - Precise boundary validation enforces PostGIS polygon containment against the official Survey of India Punjab state administrative boundary (`ST_Contains(punjab_admin_polygon, geom)`).
- **Spatial Indexing**: GiST indexes on all spatial geometry columns enable sub-5ms 5km / 10km radius buffering (`ST_DWithin`) for market access and competitor density calculations.

### C. Demographics (`master.demographics`)
- Strictly bound to official Census of India 2011 Primary Census Abstract.
- Mandates `source_year = 2011`.
- Captures total population, households, male/female split, main workers, marginal workers, cultivators, agricultural laborers, and literacy rates.

### D. Commerce, Products & Pricing (`master` schema)
- **`master.markets`**:
  - APMC Mandis (Khanna, Jagraon, Ludhiana Dana Mandi) and rural weekly haats. Captures operating days, logistics accessibility score (0-10), and coverage disclaimers.
- **`master.businesses`**:
  - Sample competitor presences extracted from OpenStreetMap and verified local cooperative registers.
  - Explicitly carries `coverage_type` (`sample_osm`, `cooperative_registry`, `local_survey`), `coverage_status`, and a transparent coverage note informing entrepreneurs that the dataset represents identified public map presences rather than an exhaustive ground census.
- **`master.products` & `master.prices`**:
  - Normalized commodity catalog.
  - Price records carry `price_scope` (`market`, `district`, `local`, `regional`, `reference`), price date, and link to daily AGMARKNET modal auction quotes or Punjab Dairy Development Board procurement circulars.
- **`master.equipment`**:
  - Triangulated commercial machinery price quotes (minimum, typical, maximum) based on certified Punjab agro-equipment fabricators in Ludhiana.

### E. Financial Reference Data vs. Business Operating Assumptions
To maintain architectural clarity, macro regulatory standards are strictly separated from micro-enterprise operational parameters:

1. **`master.financial_references`** (Macroeconomic & Regulatory):
   - Stores authoritative statutory benchmarks: RBI policy repo rate (6.50%), commercial bank rural MSME lending spreads (3.00%), Income Tax Act Section 32 depreciation schedules (15% for plant & machinery, 10% for civil sheds), and standard DSCR bank acceptance thresholds ($\ge 1.35\text{x}$).
2. **`master.business_operating_assumptions`** (Micro-enterprise Operational Parameters):
   - Stores category-specific operational norms: normative raw material inventory holding days (e.g., 21 days for dairy, 45 days for grain milling), normal processing wastage/shrinkage percentages (e.g., 1.5% for flour milling), and capacity ramp-up milestones (Month 1: 50%, Month 3: 75%, Month 6: 100%).

### F. Business Templates & Financial Models (`master` schema)
- **`master.business_templates`**: Normalized blueprint definitions for supported rural micro-enterprises with scale (`micro`, `small`, `medium`), capital ranges, and rated throughput capacity.
- **`master.business_cost_templates`**: Detailed capital expenditure (Capex) line items (land, building, equipment, machinery, installation, working capital margin) labeled with estimation flags.
- **`master.business_revenue_templates`**: Output product turnover projections based on rated capacity and linked commodity pricing assumptions.
- **`master.business_expense_templates`**: Cash operating expenditures (Opex: raw materials, wages, commercial electricity tariffs, fuel, preventive maintenance, transit insurance).

### G. Government Schemes & Eligibility Governance (`master` schema)
- **`master.schemes` & `master.scheme_versions`**:
  - Temporal policy parameters (`effective_from`, `effective_to`), maximum project costs, maximum grant/subsidy funding, interest rates, loan tenure, and moratorium months for PMEGP, PMFME, AHIDF, and MUDRA.
- **`master.scheme_eligibility_rules`**:
  - Deterministic logical rules (`numeric_range`, `categorical`, `boolean`) evaluated programmatically by the Scheme Router without probabilistic inference.

### H. Advisory Logic: Risk, Opportunity & Viability (`master` schema)
- **`master.risk_rules`**:
  - Structured risk matrices across 12 risk types (operational, seasonal, regulatory, raw material, supply, etc.) with explicit conditions, severity ratings, quantitative probabilities, impacts, and actionable mitigations.
- **`master.opportunity_rules`**:
  - Deterministic evaluation conditions explaining *why* an enterprise is commercially attractive in a specific village or cluster (e.g., milk surplus paired with lack of local chilling, ODOP district capital subsidy).
- **`master.scoring_config`**:
  - Versioned multi-criteria weighting configuration:
    $$\text{Score} = 0.25(\text{Demand}) + 0.20(\text{Competition Gap}) + 0.20(\text{Capital Fit}) + 0.20(\text{Cash Flow}) + 0.15(\text{Risk})$$

### I. AI / RAG Knowledge Base Governance (`master` schema)
- **No Fake/Simulated Embeddings Policy**:
  - In compliance with core data engineering standards, vector columns are never populated with synthetic or random floating-point values.
  - Column `embedding` is defined as `vector(768) NULL`.
  - Column `embedding_status` defaults to `'pending'`.
  - Columns `embedding_model` (`text-embedding-004`) and `embedding_dimension` (`768`) make the target vector pipeline explicit.
  - When real embeddings are computed via the offline embedding ingestion worker, `embedding` is populated and `embedding_status` transitions to `'active'`.
  - HNSW index is created on `embedding` using cosine distance operator `vector_cosine_ops`.

### J. User Profiles, Audit Logging & Financial Results (`app` schema)
- **`app.users` & `app.profiles`**:
  - Lightweight entrepreneur profiles without unnecessary PII (no Aadhaar numbers stored).
- **`app.financial_scenarios`**:
  - User-configured financial parameters linking chosen template, own capital, and financing terms.
- **`app.calculation_runs` (Auditability Layer)**:
  - Every financial run logs:
    - `run_id` (UUID PK)
    - `scenario_id` (FK to scenario)
    - `engine_version` (e.g., `GramVest-DeterministicFinance-v1.0`)
    - `input_snapshot_json` (Full JSON serialization of inputs used for calculation)
    - `calculated_at` (Timezone-aware timestamp)
    - `execution_status` (`SUCCESS`, `FAILED`)
- **`app.financial_results`**:
  - Outputs generated by the calculation run: EMI, total interest, annual revenue, annual opex, net operating profit, net cash flow, break-even capacity %, and DSCR. Linked to `calculation_run_id`.
- **`app.what_if_scenarios`**:
  - Stress-test parameters (-5% price drop, +10% raw material inflation) evaluating scenario sensitivity.
- **`app.reports`**:
  - Metadata tracking generated Detailed Project Reports (DPR) and bankable PDF summaries.

---

## 4. Modular Seed & Ingestion Strategy

To ensure maintainability, version control, and scalability, database seeding avoids fragile monolithic SQL files:
1. **Modular Seed Scripts**:
   - `data/sql/seed_sources.sql`: Sources, versions, quality audit
   - `data/sql/seed_geography.sql`: States, districts, blocks, villages, locations, demographics
   - `data/sql/seed_markets_prices.sql`: Mandis, businesses, products, prices, equipment
   - `data/sql/seed_templates.sql`: Business templates, capex, revenue, opex templates
   - `data/sql/seed_schemes.sql`: Schemes, scheme versions, eligibility rules
   - `data/sql/seed_advisory.sql`: Macro references, operating assumptions, risk rules, opportunity rules, scoring config
   - `data/sql/seed_documents.sql`: RAG documents and chunks (with pending embedding state)
   - `data/sql/seed_demo_app.sql`: Demo users, profiles, calculation runs, scenarios, results
2. **Master Orchestrator (`seed.sql`)**:
   - Executes all modular scripts sequentially inside a single transaction block (`BEGIN ... COMMIT`).
   - Supports high-throughput PostgreSQL CSV `COPY` operations for bulk geographic datasets in production environments.

---

## 5. Acceptance & Validation Criteria
- **Threshold**: Strictly **0 FAIL, 0 Critical Errors**.
- **Warnings Policy**: Warnings are permitted only for documented, intentional constraints (such as historical 2011 census attribution or sample POI coverage), and each warning must be recorded with its rationale in `DATA_QUALITY_REPORT.md`.
