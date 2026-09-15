# GramVest Team Data Usage & Microservice API Mapping

This guide outlines the precise responsibility, database table ownership, query patterns, and API contract mapping for each member of the GramVest engineering team.

---

## 1. Team Ownership Matrix

| Team Member | Domain & Engineering Role | Primary Tables Consumed & Managed | Key API Endpoints Owned |
| :--- | :--- | :--- | :--- |
| **Pranav** | Backend Lead & Database Administrator | All tables (schema, migrations, connection pooling, CRUD) | Core Framework, Auth, CRUD APIs |
| **Arpit** | Frontend & UI/UX Lead | Consumes API responses (never queries DB directly) | Presentation layer, Forms, Dynamic Dashboards |
| **Ansh** | GIS & Market Intelligence Lead | `states`, `districts`, `blocks`, `villages`, `locations`, `demographics`, `markets`, `businesses` | `/api/location/resolve`, `/api/market/analyze`, `/api/market/competitors` |
| **Deepak** | Finance Engine & AI/RAG Lead | `business_templates`, `business_cost_templates`, `business_revenue_templates`, `business_expense_templates`, `equipment`, `prices`, `schemes`, `scheme_versions`, `scheme_eligibility_rules`, `financial_assumptions`, `risk_rules`, `opportunity_rules`, `scoring_config`, `documents`, `document_chunks` | `/api/finance/project`, `/api/finance/repayment`, `/api/finance/dscr`, `/api/schemes/route`, `/api/advisor/chat`, `/api/simulator/what-if` |
| **Ramashankar**| Integration, Product & DPR Lead | `users`, `profiles`, `financial_scenarios`, `financial_results`, `what_if_scenarios`, `reports`, `sources`, `data_quality` | `/api/profile`, `/api/opportunity/score`, `/api/report/generate` |

---

## 2. Detailed Member Workflows & Query Patterns

### A. Ansh (GIS + Spatial Intelligence)
**Primary Responsibility**: Geographic resolution, Census demographic aggregation, radius buffering, and spatial competitor density.

#### Required PostGIS Query Blueprints
1. **Resolve Nearest 5km / 10km Mandi**:
   ```sql
   SELECT id, name, market_type, accessibility_score,
          ST_Distance(geometry, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography) / 1000.0 AS distance_km
   FROM markets
   WHERE ST_DWithin(geometry::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, 10000)
   ORDER BY distance_km ASC;
   ```
2. **Competitor Density Analysis**:
   ```sql
   SELECT b.business_category_id, COUNT(b.id) AS competitor_count,
          STRING_AGG(b.name, ', ') AS identified_competitors
   FROM businesses b
   WHERE ST_DWithin(b.geometry::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, 5000)
   GROUP BY b.business_category_id;
   ```
3. **Census Demographics Fetch (Census 2011)**:
   ```sql
   SELECT v.name AS village_name, v.census_code, d.population, d.households, d.literacy_rate, d.workers
   FROM villages v
   JOIN demographics d ON d.village_id = v.id
   WHERE v.id = :village_id AND d.source_year = 2011;
   ```

---

### B. Deepak (Finance Engine + AI / RAG)
**Primary Responsibility**: Deterministic financial projection (Capex, Opex, EBITDA, EMI, DSCR), rule-based scheme router, and pgvector semantic retrieval.

#### Financial Projection Logic (Software Calculates; AI Explains)
- **EBITDA**: $\text{Monthly Revenue} - \text{Monthly Expenses}$
- **Annual Debt Service**: $\text{Monthly EMI} \times 12$
- **DSCR**: $\frac{\text{Annual Operating Profit}}{\text{Annual Total Debt Service}}$
- **Break-Even Point (%)**: $\frac{\text{Fixed Operating Costs}}{\text{Revenue} - \text{Variable Operating Costs}} \times 100$

#### AI / RAG Semantic Search Query Blueprint
```sql
SELECT c.id, c.document_id, c.chunk_text, c.section,
       1 - (c.embedding <=> :query_embedding) AS cosine_similarity,
       d.title, d.publisher, d.source_url
FROM document_chunks c
JOIN documents d ON d.id = c.document_id
ORDER BY c.embedding <=> :query_embedding ASC
LIMIT 4;
```

#### Scheme Router Query Blueprint
```sql
SELECT s.name AS scheme_name, sv.version, sv.funding_percent, sv.funding_max,
       sv.subsidy_information, sv.interest_rate, sv.moratorium_months
FROM schemes s
JOIN scheme_versions sv ON sv.scheme_id = s.id
WHERE s.active = TRUE
  AND :project_cost BETWEEN sv.project_cost_min AND sv.project_cost_max
  AND NOT EXISTS (
      SELECT 1 FROM scheme_eligibility_rules r
      WHERE r.scheme_version_id = sv.id
        AND r.field_name = 'business_category_id'
        AND :business_category_id != r.expected_value
  );
```

---

### C. Pranav (Backend / API Integration)
**Primary Responsibility**: Database pooling, transaction management, data validation, and microservice REST interfaces.

#### Core Endpoint Implementations
- `POST /api/profile` -> Creates `users` and `profiles` records; links to `locations`.
- `GET /api/location/resolve?query=Agwar+Lopo+Kalan` -> Returns normalized `village_id`, `block_id`, `district_id`, and PostGIS centroid coordinates.
- `POST /api/finance/project` -> Reads `business_cost_templates`, calculates total capex, working capital margin, and returns loan structuring options.
- `POST /api/finance/dscr` -> Computes deterministic debt service coverage ratio.
- `POST /api/simulator/what-if` -> Writes to `what_if_scenarios` and returns recalculations.

---

### D. Arpit (Frontend & UI Integration)
**Primary Responsibility**: Build responsive, accessible user interfaces for rural entrepreneurs.

#### UI Guidelines
- **Always Render Data Disclaimers**: Display `coverage_status` and `coverage_note` tags whenever competitor maps or Mandi lists are shown.
- **Explicit Census Labeling**: Never label village population as "Current Population". Display as *"Population (Census 2011 Reference)"*.
- **No Client Calculations**: Never calculate loan EMIs or viability scores in JavaScript. Submit user inputs to `/api/finance/project` and display authoritative backend values.

---

### E. Ramashankar (Integration & DPR Generation)
**Primary Responsibility**: End-to-end data pipeline integrity, verifiable audit trails, and generating bankable PDF Detailed Project Reports (DPR).

#### DPR Compilation Flow
1. Fetch entrepreneur profile from `profiles`.
2. Fetch geographic & demographic context from `villages` + `demographics`.
3. Fetch financial results from `financial_results`.
4. Fetch applicable scheme subsidy rules from `scheme_versions`.
5. Fetch risk factors and mitigations from `risk_rules`.
6. Compile into PDF document and store metadata in `reports`.
