# GramVest Master Dataset Compliance & Quality Audit Report
**Audit Execution Timestamp**: 2026-09-12T09:51:02.781251Z
**Target Platform**: PostgreSQL 15+ / PostGIS / pgvector
**Jurisdiction**: Punjab, India (Focus: Ludhiana District)
**Total Verified Tables**: 35

## Summary Results
- **PASS**: 10 check categories
- **WARNINGS**: 3 documented constraints
- **FAILURES**: 0 items
- **CRITICAL ERRORS**: 0

### Compliance Verdict: ✅ **PASSED (0 FAIL, 0 CRITICAL ERRORS) - READY FOR PRODUCTION**

---

## Detailed Passed Verification Criteria

- [x] All 35 core tables populated across master and app schemas.
- [x] 100% Primary Key uniqueness verified across all tables.
- [x] All source-dependent entities link to registered sources in sources.csv.
- [x] All spatial points strictly contained within official Punjab administrative polygon.
- [x] Zero fake embeddings: all pending chunks have NULL vector and explicit text-embedding-004 metadata.
- [x] Financial reference data strictly separated from business operating assumptions.
- [x] 100% of financial results trace back to an audited calculation_runs execution snapshot.
- [x] All Census demographic figures strictly mandate 'source_year = 2011'.
- [x] All estimated capex items contain explicit estimation_method and reference sources.
- [x] All records classified with valid 6-way data_status taxonomy.

## Documented Constraints & Operational Warnings
- [!] Historical Census 2011: National census pending post-2011; population figures serve as historical benchmark.
- [!] Public Map Competitor Coverage: Businesses from OSM represent sample mapped nodes, not exhaustive ground census.
- [!] Vector Embeddings Pending: Document chunk embeddings set to NULL awaiting offline text-embedding-004 ingestion.

## Master Table Inventory Breakdown
| Schema | Table Name | Record Count | Data Status Mix | Primary Key | Key Foreign Keys |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `master` | `sources` | 12 | official/curated/verified | `id` | `None` |
| `master` | `dataset_versions` | 1 | official | `id` | `None` |
| `master` | `data_quality` | 4 | official/verified | `id` | `record_id` |
| `master` | `states` | 1 | official | `id` | `None` |
| `master` | `districts` | 20 | official | `id` | `state_id` |
| `master` | `blocks` | 16 | official | `id` | `district_id` |
| `master` | `villages` | 250 | official | `id` | `state_id, district_id, block_id, source_id` |
| `master` | `locations` | 257 | demo/official/verified | `id` | `village_id, block_id, district_id, source_id` |
| `master` | `demographics` | 250 | official | `id` | `location_id, village_id, source_id` |
| `master` | `business_categories` | 8 | curated/verified | `id` | `None` |
| `master` | `businesses` | 7 | verified | `id` | `business_category_id, state_id, district_id, block_id, village_id, source_id` |
| `master` | `markets` | 6 | official/verified | `id` | `state_id, district_id, block_id, village_id, source_id` |
| `master` | `products` | 11 | official/verified | `id` | `None` |
| `master` | `prices` | 10 | official/verified | `id` | `product_id, location_id, district_id, market_id, source_id` |
| `master` | `equipment` | 9 | verified | `id` | `business_category_id, source_id` |
| `master` | `business_templates` | 3 | verified | `id` | `business_category_id, source_id` |
| `master` | `business_cost_templates` | 15 | estimated/official/curated/verified | `id` | `business_template_id, source_id` |
| `master` | `business_revenue_templates` | 6 | official/curated/verified | `id` | `business_template_id, product_id, price_source_id` |
| `master` | `business_expense_templates` | 14 | verified/official/curated | `id` | `business_template_id, source_id` |
| `master` | `schemes` | 4 | official | `id` | `None` |
| `master` | `scheme_versions` | 4 | official | `id` | `scheme_id, source_id, source_document_id` |
| `master` | `scheme_eligibility_rules` | 10 | official | `id` | `scheme_version_id, source_id` |
| `master` | `financial_references` | 5 | official/verified | `id` | `source_id` |
| `master` | `business_operating_assumptions` | 5 | curated/verified | `id` | `business_category_id, source_id` |
| `master` | `risk_rules` | 7 | official/curated/verified | `id` | `business_category_id, source_id` |
| `master` | `opportunity_rules` | 5 | official/curated/verified | `id` | `business_category_id, source_id` |
| `master` | `scoring_config` | 1 | curated | `id` | `None` |
| `app` | `users` | 2 | demo | `id` | `None` |
| `app` | `demo_profiles` | 2 | demo | `id` | `user_id, location_id, business_category_id` |
| `app` | `demo_financial_scenarios` | 1 | demo | `id` | `user_id, business_template_id` |
| `app` | `calculation_runs` | 1 | demo | `id` | `scenario_id` |
| `app` | `demo_financial_results` | 1 | demo | `id` | `run_id, scenario_id` |
| `app` | `demo_what_if_scenarios` | 2 | demo | `id` | `base_scenario_id` |
| `master` | `documents` | 3 | official | `id` | `source_id` |
| `master` | `document_chunks` | 4 | official | `id` | `document_id` |

---
*Report generated autonomously by GramVest Automated Data Quality Assurance Suite.*