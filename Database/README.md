# GramVest Master Data System (SIH 2026 — PS 26091)

> **AI-Driven Hyper-Local Business Advisory & Financial Structuring Assistant for Rural & Small-Town Entrepreneurs in Punjab, India.**

This repository contains the authoritative, source-backed central data architecture, PostgreSQL schema (with two-tier `master` / `app` schema isolation, PostGIS & pgvector), normalized master datasets (35 tables), modular seed scripts, automated validation engine, and team usage documentation for the GramVest platform.

---

## 1. Quickstart & Database Initialization

### Prerequisites
- PostgreSQL 15+ with `postgis` and `pgvector` extensions installed.
- Python 3.9+

### Setup Commands
```bash
# 1. Create database
createdb -U postgres gramvest

# 2. Apply two-tier relational DDL schema (creates master & app schemas, PostGIS, pgvector, and indexes)
psql -U postgres -d gramvest -f database_schema.sql

# 3. Populate all master reference and demo data via the modular seed orchestrator
psql -U postgres -d gramvest -f seed.sql

# 4. Run automated data quality and compliance test suite
python validate_data.py
```

---

## 2. Directory Layout
```
Database/
├── database_schema.sql             # PostgreSQL 15+ DDL (master & app schemas, PostGIS, pgvector)
├── seed.sql                        # Master seed orchestrator running modular SQL loaders
├── validate_data.py                # Automated compliance & polygon boundary test suite
├── DATABASE_ARCHITECTURE.md        # Two-tier schema design & lifecycle governance
├── DATA_COVERAGE_MATRIX.md         # 8-dimensional MVP category & module data audit
├── SOURCE_VERIFICATION_REPORT.md   # Official URL audit & provenance verification
├── DATA_QUALITY_REPORT.md          # Automated audit report (0 Fail, 0 Critical Errors)
├── DATABASE_RELATIONSHIPS.md       # Mermaid ER diagrams & relational navigation flows
├── TEAM_DATA_USAGE.md              # Query blueprints for Arpit, Pranav, Ansh, Deepak, Ramashankar
├── MASTER_DATASET_REPORT.md        # Comprehensive data architecture report
├── build_dataset.py                # Master dataset generator pipeline
├── generate_sql_and_docs.py        # DDL, modular seeds, and data dictionary builder
├── data/
│   ├── raw/                        # Original reference tables
│   ├── processed/                  # 35 Normalized master CSV files
│   ├── reference/                  # Financial references & operating assumptions
│   ├── demo/                       # Demo entrepreneur cases & calculation runs
│   ├── schemas/                    # Table specifications
│   ├── sources/                    # Sourced registry metadata
│   ├── documents/                  # Official policy guidelines for RAG (PMEGP, PMFME, AHIDF)
│   ├── sql/                        # Modular seed scripts (seed_01_*.sql to seed_08_*.sql)
│   ├── validation/                 # validate_data.py & DATA_QUALITY_REPORT.md
│   └── docs/                       # data_dictionary.csv, ER diagrams, and team guides
```

---

## 3. Core Architectural Principles
1. **AI Explains; Software Calculates**: All financial projections (EBITDA, EMI, DSCR, Break-Even) are computed deterministically by the backend financial engine using template cost and revenue equations.
2. **Two-Tier Schema Isolation**:
   - `master.*`: Contains verified public reference data, government scheme parameters, and vector knowledge chunks.
   - `app.*`: Contains user profiles, financial scenarios, auditable calculation runs, and DPR reports.
3. **Zero Fabricated Data & Zero Fake Embeddings**: Every external datum carries an authoritative `source_id`, retrieval date, and confidence level. Document chunk embeddings remain `NULL` (`embedding_status = 'pending'`) awaiting execution by a real embedding model (`text-embedding-004`).
4. **Explicit Census Attribution**: Census data is strictly identified as `source_year = 2011` and never labeled as "current population".
5. **Coverage Transparency**: Spatial competitor maps and mandi nodes carry a `coverage_status` (`verified`, `good`, `partial`) to inform entrepreneurs of public map limitations.
6. **Separated Financial References vs. Operating Assumptions**: Macroeconomic statutory benchmarks (RBI repo rate, MCLR spreads, IT Act depreciation) are strictly separated from micro-enterprise operating parameters (working capital inventory cycle days, normal wastage %).

---

## 4. Key Documentation Links
- [Database Architecture & Design Specification](DATABASE_ARCHITECTURE.md)
- [Data Coverage Matrix & MVP Category Audit](DATA_COVERAGE_MATRIX.md)
- [Source Verification & Provenance Audit](SOURCE_VERIFICATION_REPORT.md)
- [Data Architecture & Final Deliverables Report](MASTER_DATASET_REPORT.md)
- [Database ER Diagrams & Relationships](DATABASE_RELATIONSHIPS.md)
- [Team Data Usage & API Mapping](TEAM_DATA_USAGE.md)
- [Data Quality Validation Report](DATA_QUALITY_REPORT.md)
- [Complete Data Dictionary](data/docs/data_dictionary.csv)
