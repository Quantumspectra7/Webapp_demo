"""
SQL DDL and Modular Seed Script Generator for GramVest (Two-Tier Architecture)
Generates:
1. database_schema.sql (PostgreSQL 15+ DDL with master & app schemas, PostGIS, pgvector, and search_path)
2. Modular seed scripts (seed_01_sources.sql, seed_02_geography.sql, etc.)
3. Master orchestrator seed.sql
4. data_dictionary.csv
"""

import os
import csv
import json

BASE_DIR = r"c:\Users\Admin\Desktop\SIH2026\Database"
DATA_DIR = os.path.join(BASE_DIR, "data")
PROCESSED_DIR = os.path.join(DATA_DIR, "processed")
SQL_DIR = os.path.join(DATA_DIR, "sql")
DOCS_DIR = os.path.join(DATA_DIR, "docs")

def save_csv(filename, fieldnames, rows, target_dirs=[PROCESSED_DIR, DOCS_DIR]):
    for d in target_dirs:
        os.makedirs(d, exist_ok=True)
        path = os.path.join(d, filename)
        with open(path, mode="w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for r in rows:
                writer.writerow(r)
    print(f"Saved {filename} with {len(rows)} records.")

def generate_schema_sql():
    sql = """-- ====================================================================
-- GramVest Master Database Schema (Two-Tier Architecture)
-- Target: PostgreSQL 15+ with PostGIS & pgvector
-- Jurisdiction: Punjab, India (SIH 2026 - PS 26091)
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Create Logical Schemas
CREATE SCHEMA IF NOT EXISTS master;
CREATE SCHEMA IF NOT EXISTS app;

-- Set Default Search Path for multi-schema resolution
SET search_path TO master, app, public;

-- 3. Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS app.reports CASCADE;
DROP TABLE IF EXISTS app.what_if_scenarios CASCADE;
DROP TABLE IF EXISTS app.financial_results CASCADE;
DROP TABLE IF EXISTS app.calculation_runs CASCADE;
DROP TABLE IF EXISTS app.financial_scenarios CASCADE;
DROP TABLE IF EXISTS app.profiles CASCADE;
DROP TABLE IF EXISTS app.users CASCADE;

DROP TABLE IF EXISTS master.document_chunks CASCADE;
DROP TABLE IF EXISTS master.documents CASCADE;
DROP TABLE IF EXISTS master.scoring_config CASCADE;
DROP TABLE IF EXISTS master.opportunity_rules CASCADE;
DROP TABLE IF EXISTS master.risk_rules CASCADE;
DROP TABLE IF EXISTS master.business_operating_assumptions CASCADE;
DROP TABLE IF EXISTS master.financial_references CASCADE;
DROP TABLE IF EXISTS master.scheme_eligibility_rules CASCADE;
DROP TABLE IF EXISTS master.scheme_versions CASCADE;
DROP TABLE IF EXISTS master.schemes CASCADE;
DROP TABLE IF EXISTS master.equipment CASCADE;
DROP TABLE IF EXISTS master.business_expense_templates CASCADE;
DROP TABLE IF EXISTS master.business_revenue_templates CASCADE;
DROP TABLE IF EXISTS master.business_cost_templates CASCADE;
DROP TABLE IF EXISTS master.business_templates CASCADE;
DROP TABLE IF EXISTS master.prices CASCADE;
DROP TABLE IF EXISTS master.products CASCADE;
DROP TABLE IF EXISTS master.businesses CASCADE;
DROP TABLE IF EXISTS master.markets CASCADE;
DROP TABLE IF EXISTS master.demographics CASCADE;
DROP TABLE IF EXISTS master.locations CASCADE;
DROP TABLE IF EXISTS master.villages CASCADE;
DROP TABLE IF EXISTS master.blocks CASCADE;
DROP TABLE IF EXISTS master.districts CASCADE;
DROP TABLE IF EXISTS master.states CASCADE;
DROP TABLE IF EXISTS master.business_categories CASCADE;
DROP TABLE IF EXISTS master.data_quality CASCADE;
DROP TABLE IF EXISTS master.dataset_versions CASCADE;
DROP TABLE IF EXISTS master.sources CASCADE;

-- ====================================================================
-- MASTER SCHEMA: PROVENANCE, DATASET VERSIONS & QUALITY AUDIT
-- ====================================================================
CREATE TABLE master.sources (
    id VARCHAR(64) PRIMARY KEY,
    source_name VARCHAR(255) NOT NULL,
    source_type VARCHAR(64) NOT NULL CHECK (source_type IN (
        'official_government', 'official_open_data', 'census', 'osm', 
        'official_market_data', 'research_report', 'bank', 'scheme_document', 
        'vendor_reference', 'curated', 'estimated'
    )),
    publisher VARCHAR(255) NOT NULL,
    source_url TEXT,
    publication_date DATE,
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    source_year INT,
    license VARCHAR(128),
    description TEXT,
    notes TEXT,
    data_status VARCHAR(32) NOT NULL DEFAULT 'official'
);

CREATE TABLE master.dataset_versions (
    id VARCHAR(64) PRIMARY KEY,
    version_tag VARCHAR(64) NOT NULL UNIQUE,
    release_date DATE NOT NULL,
    schema_version VARCHAR(32) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    change_summary TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_status VARCHAR(32) NOT NULL DEFAULT 'official'
);

CREATE TABLE master.data_quality (
    id VARCHAR(64) PRIMARY KEY,
    schema_name VARCHAR(32) NOT NULL DEFAULT 'master',
    table_name VARCHAR(64) NOT NULL,
    record_id VARCHAR(64) NOT NULL,
    confidence_score NUMERIC(4,3) CHECK (confidence_score BETWEEN 0.0 AND 1.0),
    freshness_score NUMERIC(4,3) CHECK (freshness_score BETWEEN 0.0 AND 1.0),
    completeness_score NUMERIC(4,3) CHECK (completeness_score BETWEEN 0.0 AND 1.0),
    validation_status VARCHAR(32) NOT NULL CHECK (validation_status IN ('PASS', 'WARNING', 'FAIL')),
    last_validated TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    data_status VARCHAR(32) NOT NULL DEFAULT 'official'
);

-- ====================================================================
-- MASTER SCHEMA: BUSINESS CATEGORIES
-- ====================================================================
CREATE TABLE master.business_categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    parent_category VARCHAR(64) REFERENCES master.business_categories(id) ON DELETE SET NULL,
    slug VARCHAR(128) NOT NULL UNIQUE,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    mvp BOOLEAN NOT NULL DEFAULT FALSE,
    data_status VARCHAR(32) NOT NULL DEFAULT 'verified'
);

-- ====================================================================
-- MASTER SCHEMA: GEOGRAPHY (PostGIS Hierarchy)
-- ====================================================================
CREATE TABLE master.states (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL UNIQUE,
    state_code VARCHAR(8) NOT NULL UNIQUE,
    country VARCHAR(64) NOT NULL DEFAULT 'India',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    data_status VARCHAR(32) NOT NULL DEFAULT 'official'
);

CREATE TABLE master.districts (
    id VARCHAR(32) PRIMARY KEY,
    state_id VARCHAR(32) NOT NULL REFERENCES master.states(id) ON DELETE RESTRICT,
    name VARCHAR(128) NOT NULL,
    district_code VARCHAR(16) NOT NULL UNIQUE,
    headquarters VARCHAR(128),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    data_status VARCHAR(32) NOT NULL DEFAULT 'official'
);

CREATE TABLE master.blocks (
    id VARCHAR(32) PRIMARY KEY,
    district_id VARCHAR(32) NOT NULL REFERENCES master.districts(id) ON DELETE RESTRICT,
    name VARCHAR(128) NOT NULL,
    block_code VARCHAR(16) NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    data_status VARCHAR(32) NOT NULL DEFAULT 'official'
);

CREATE TABLE master.villages (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    state_id VARCHAR(32) NOT NULL REFERENCES master.states(id) ON DELETE RESTRICT,
    district_id VARCHAR(32) NOT NULL REFERENCES master.districts(id) ON DELETE RESTRICT,
    block_id VARCHAR(32) NOT NULL REFERENCES master.blocks(id) ON DELETE RESTRICT,
    census_code VARCHAR(32) NOT NULL UNIQUE,
    latitude NUMERIC(10, 7) NOT NULL CHECK (latitude BETWEEN 29.0 AND 33.0),
    longitude NUMERIC(10, 7) NOT NULL CHECK (longitude BETWEEN 73.0 AND 77.5),
    geometry GEOMETRY(Point, 4326),
    source_id VARCHAR(64) NOT NULL REFERENCES master.sources(id) ON DELETE RESTRICT,
    source_year INT NOT NULL CHECK (source_year = 2011),
    source_url TEXT,
    confidence NUMERIC(4,3) NOT NULL CHECK (confidence BETWEEN 0.0 AND 1.0),
    data_status VARCHAR(32) NOT NULL DEFAULT 'official'
);

CREATE TABLE master.locations (
    id VARCHAR(64) PRIMARY KEY,
    village_id VARCHAR(64) REFERENCES master.villages(id) ON DELETE SET NULL,
    block_id VARCHAR(32) REFERENCES master.blocks(id) ON DELETE RESTRICT,
    district_id VARCHAR(32) REFERENCES master.districts(id) ON DELETE RESTRICT,
    latitude NUMERIC(10, 7) NOT NULL CHECK (latitude BETWEEN 29.0 AND 33.0),
    longitude NUMERIC(10, 7) NOT NULL CHECK (longitude BETWEEN 73.0 AND 77.5),
    address_text TEXT,
    source_id VARCHAR(64) NOT NULL REFERENCES master.sources(id) ON DELETE RESTRICT,
    confidence NUMERIC(4,3) NOT NULL CHECK (confidence BETWEEN 0.0 AND 1.0),
    geometry GEOMETRY(Point, 4326),
    data_status VARCHAR(32) NOT NULL DEFAULT 'official'
);

CREATE INDEX idx_villages_geom ON master.villages USING GIST (geometry);
CREATE INDEX idx_locations_geom ON master.locations USING GIST (geometry);

-- ====================================================================
-- MASTER SCHEMA: DEMOGRAPHICS (Census 2011 Only)
-- ====================================================================
CREATE TABLE master.demographics (
    id VARCHAR(64) PRIMARY KEY,
    location_id VARCHAR(64) REFERENCES master.locations(id) ON DELETE CASCADE,
    village_id VARCHAR(64) REFERENCES master.villages(id) ON DELETE CASCADE,
    source_year INT NOT NULL CHECK (source_year = 2011),
    population INT NOT NULL CHECK (population >= 0),
    households INT NOT NULL CHECK (households >= 0),
    male_population INT CHECK (male_population >= 0),
    female_population INT CHECK (female_population >= 0),
    workers INT CHECK (workers >= 0),
    main_workers INT CHECK (main_workers >= 0),
    marginal_workers INT CHECK (marginal_workers >= 0),
    literacy_rate NUMERIC(5,2) CHECK (literacy_rate BETWEEN 0.0 AND 100.0),
    sc_population INT CHECK (sc_population >= 0),
    other_available_indicators JSONB,
    source_id VARCHAR(64) NOT NULL REFERENCES master.sources(id) ON DELETE RESTRICT,
    confidence NUMERIC(4,3) NOT NULL CHECK (confidence BETWEEN 0.0 AND 1.0),
    data_status VARCHAR(32) NOT NULL DEFAULT 'official'
);

-- ====================================================================
-- MASTER SCHEMA: MARKETS & MANDIS
-- ====================================================================
CREATE TABLE master.markets (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    market_type VARCHAR(64) NOT NULL CHECK (market_type IN (
        'mandi', 'haat', 'weekly_market', 'retail_market', 
        'wholesale_market', 'town_center', 'transport_hub', 'commercial_center'
    )),
    category VARCHAR(128),
    state_id VARCHAR(32) NOT NULL REFERENCES master.states(id),
    district_id VARCHAR(32) NOT NULL REFERENCES master.districts(id),
    block_id VARCHAR(32) REFERENCES master.blocks(id),
    village_id VARCHAR(64) REFERENCES master.villages(id),
    latitude NUMERIC(10, 7) NOT NULL CHECK (latitude BETWEEN 29.0 AND 33.0),
    longitude NUMERIC(10, 7) NOT NULL CHECK (longitude BETWEEN 73.0 AND 77.5),
    geometry GEOMETRY(Point, 4326),
    operating_days VARCHAR(128),
    accessibility_score NUMERIC(3,1) CHECK (accessibility_score BETWEEN 0.0 AND 10.0),
    source_id VARCHAR(64) NOT NULL REFERENCES master.sources(id),
    source_date DATE NOT NULL,
    confidence NUMERIC(4,3) NOT NULL CHECK (confidence BETWEEN 0.0 AND 1.0),
    coverage_status VARCHAR(32) NOT NULL DEFAULT 'verified',
    coverage_note TEXT,
    data_status VARCHAR(32) NOT NULL DEFAULT 'official'
);

CREATE INDEX idx_markets_geom ON master.markets USING GIST (geometry);

-- ====================================================================
-- MASTER SCHEMA: BUSINESSES & COMPETITOR PRESENCE
-- ====================================================================
CREATE TABLE master.businesses (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    business_category_id VARCHAR(64) NOT NULL REFERENCES master.business_categories(id),
    subcategory VARCHAR(128),
    business_type VARCHAR(64) NOT NULL CHECK (business_type IN (
        'retail', 'service', 'manufacturing', 'farm_based', 'food', 'wholesale', 'other'
    )),
    state_id VARCHAR(32) NOT NULL REFERENCES master.states(id),
    district_id VARCHAR(32) NOT NULL REFERENCES master.districts(id),
    block_id VARCHAR(32) REFERENCES master.blocks(id),
    village_id VARCHAR(64) REFERENCES master.villages(id),
    latitude NUMERIC(10, 7) NOT NULL CHECK (latitude BETWEEN 29.0 AND 33.0),
    longitude NUMERIC(10, 7) NOT NULL CHECK (longitude BETWEEN 73.0 AND 77.5),
    geometry GEOMETRY(Point, 4326),
    address TEXT,
    source_id VARCHAR(64) NOT NULL REFERENCES master.sources(id),
    source_type VARCHAR(64) NOT NULL DEFAULT 'osm',
    coverage_type VARCHAR(64) NOT NULL DEFAULT 'sample_osm',
    source_date DATE NOT NULL,
    confidence NUMERIC(4,3) NOT NULL CHECK (confidence BETWEEN 0.0 AND 1.0),
    status VARCHAR(32) NOT NULL DEFAULT 'operational',
    coverage_status VARCHAR(32) NOT NULL DEFAULT 'good',
    coverage_note TEXT,
    data_status VARCHAR(32) NOT NULL DEFAULT 'verified'
);

CREATE INDEX idx_businesses_geom ON master.businesses USING GIST (geometry);
CREATE INDEX idx_businesses_cat ON master.businesses(business_category_id);

-- ====================================================================
-- MASTER SCHEMA: PRODUCTS & LOCAL PRICES
-- ====================================================================
CREATE TABLE master.products (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,
    subcategory VARCHAR(64),
    unit VARCHAR(32) NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    data_status VARCHAR(32) NOT NULL DEFAULT 'verified'
);

CREATE TABLE master.prices (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES master.products(id) ON DELETE CASCADE,
    location_id VARCHAR(64) REFERENCES master.locations(id) ON DELETE SET NULL,
    district_id VARCHAR(32) NOT NULL REFERENCES master.districts(id),
    market_id VARCHAR(64) REFERENCES master.markets(id) ON DELETE SET NULL,
    unit VARCHAR(32) NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    min_price NUMERIC(12, 2) CHECK (min_price >= 0),
    max_price NUMERIC(12, 2) CHECK (max_price >= min_price),
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    price_date DATE NOT NULL,
    price_scope VARCHAR(32) NOT NULL CHECK (price_scope IN ('local', 'market', 'district', 'regional', 'reference')),
    source_id VARCHAR(64) NOT NULL REFERENCES master.sources(id),
    confidence NUMERIC(4,3) NOT NULL CHECK (confidence BETWEEN 0.0 AND 1.0),
    notes TEXT,
    data_status VARCHAR(32) NOT NULL DEFAULT 'official'
);

-- ====================================================================
-- MASTER SCHEMA: EQUIPMENT & SETUP COSTS
-- ====================================================================
CREATE TABLE master.equipment (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,
    business_category_id VARCHAR(64) NOT NULL REFERENCES master.business_categories(id),
    unit VARCHAR(32) NOT NULL,
    min_cost NUMERIC(12, 2) NOT NULL CHECK (min_cost >= 0),
    typical_cost NUMERIC(12, 2) NOT NULL CHECK (typical_cost >= min_cost),
    max_cost NUMERIC(12, 2) NOT NULL CHECK (max_cost >= typical_cost),
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    price_date DATE NOT NULL,
    vendor_or_source TEXT,
    source_id VARCHAR(64) NOT NULL REFERENCES master.sources(id),
    confidence NUMERIC(4,3) NOT NULL CHECK (confidence BETWEEN 0.0 AND 1.0),
    notes TEXT,
    data_status VARCHAR(32) NOT NULL DEFAULT 'verified'
);

-- ====================================================================
-- MASTER SCHEMA: BUSINESS TEMPLATES & COST/REVENUE/EXPENSE
-- ====================================================================
CREATE TABLE master.business_templates (
    id VARCHAR(64) PRIMARY KEY,
    business_category_id VARCHAR(64) NOT NULL REFERENCES master.business_categories(id),
    name VARCHAR(128) NOT NULL,
    slug VARCHAR(128) NOT NULL UNIQUE,
    scale VARCHAR(32) NOT NULL CHECK (scale IN ('micro', 'small', 'medium')),
    description TEXT,
    recommended_location_type TEXT,
    recommended_customer_type TEXT,
    minimum_capital NUMERIC(14, 2) NOT NULL CHECK (minimum_capital >= 0),
    maximum_capital NUMERIC(14, 2) NOT NULL CHECK (maximum_capital >= minimum_capital),
    typical_capacity NUMERIC(12, 2) NOT NULL CHECK (typical_capacity > 0),
    unit VARCHAR(32) NOT NULL,
    mvp BOOLEAN NOT NULL DEFAULT FALSE,
    source_id VARCHAR(64) NOT NULL REFERENCES master.sources(id),
    confidence NUMERIC(4,3) NOT NULL CHECK (confidence BETWEEN 0.0 AND 1.0),
    data_status VARCHAR(32) NOT NULL DEFAULT 'verified'
);

CREATE TABLE master.business_cost_templates (
    id VARCHAR(64) PRIMARY KEY,
    business_template_id VARCHAR(64) NOT NULL REFERENCES master.business_templates(id) ON DELETE CASCADE,
    cost_type VARCHAR(64) NOT NULL CHECK (cost_type IN (
        'land', 'building', 'equipment', 'machinery', 'furniture', 
        'vehicle', 'installation', 'license', 'working_capital', 'inventory', 'other'
    )),
    item_name VARCHAR(128) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(32) NOT NULL,
    unit_cost NUMERIC(12, 2) NOT NULL CHECK (unit_cost >= 0),
    total_cost NUMERIC(14, 2) NOT NULL CHECK (total_cost >= 0),
    source_id VARCHAR(64) NOT NULL REFERENCES master.sources(id),
    source_date DATE,
    confidence NUMERIC(4,3) NOT NULL CHECK (confidence BETWEEN 0.0 AND 1.0),
    is_estimated BOOLEAN NOT NULL DEFAULT FALSE,
    estimation_method TEXT,
    data_status VARCHAR(32) NOT NULL DEFAULT 'verified'
);

CREATE TABLE master.business_revenue_templates (
    id VARCHAR(64) PRIMARY KEY,
    business_template_id VARCHAR(64) NOT NULL REFERENCES master.business_templates(id) ON DELETE CASCADE,
    product_id VARCHAR(64) NOT NULL REFERENCES master.products(id),
    monthly_quantity NUMERIC(12, 2) NOT NULL CHECK (monthly_quantity >= 0),
    unit VARCHAR(32) NOT NULL,
    price_assumption NUMERIC(12, 2) NOT NULL CHECK (price_assumption >= 0),
    revenue NUMERIC(14, 2) NOT NULL CHECK (revenue >= 0),
    price_source_id VARCHAR(64) NOT NULL REFERENCES master.sources(id),
    confidence NUMERIC(4,3) NOT NULL CHECK (confidence BETWEEN 0.0 AND 1.0),
    data_status VARCHAR(32) NOT NULL DEFAULT 'verified'
);

CREATE TABLE master.business_expense_templates (
    id VARCHAR(64) PRIMARY KEY,
    business_template_id VARCHAR(64) NOT NULL REFERENCES master.business_templates(id) ON DELETE CASCADE,
    expense_type VARCHAR(64) NOT NULL CHECK (expense_type IN (
        'raw_material', 'salary', 'rent', 'electricity', 'transport', 
        'maintenance', 'marketing', 'feed', 'utilities', 'insurance', 'other'
    )),
    item_name VARCHAR(128) NOT NULL,
    monthly_amount NUMERIC(12, 2) NOT NULL CHECK (monthly_amount >= 0),
    unit VARCHAR(32) NOT NULL,
    source_id VARCHAR(64) NOT NULL REFERENCES master.sources(id),
    confidence NUMERIC(4,3) NOT NULL CHECK (confidence BETWEEN 0.0 AND 1.0),
    data_status VARCHAR(32) NOT NULL DEFAULT 'verified'
);

-- ====================================================================
-- MASTER SCHEMA: GOVERNMENT SCHEMES & RULES
-- ====================================================================
CREATE TABLE master.schemes (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    provider VARCHAR(128) NOT NULL,
    scheme_type VARCHAR(64) NOT NULL,
    description TEXT,
    official_url TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    data_status VARCHAR(32) NOT NULL DEFAULT 'official'
);

CREATE TABLE master.scheme_versions (
    id VARCHAR(64) PRIMARY KEY,
    scheme_id VARCHAR(64) NOT NULL REFERENCES master.schemes(id) ON DELETE CASCADE,
    version VARCHAR(32) NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    project_cost_min NUMERIC(14, 2) NOT NULL CHECK (project_cost_min >= 0),
    project_cost_max NUMERIC(14, 2) NOT NULL CHECK (project_cost_max >= project_cost_min),
    funding_percent NUMERIC(5, 2) NOT NULL CHECK (funding_percent BETWEEN 0.0 AND 100.0),
    funding_max NUMERIC(14, 2) NOT NULL CHECK (funding_max >= 0),
    interest_rate NUMERIC(5, 2) CHECK (interest_rate BETWEEN 0.0 AND 50.0),
    tenure_months INT NOT NULL CHECK (tenure_months > 0),
    moratorium_months INT NOT NULL DEFAULT 0 CHECK (moratorium_months >= 0),
    subsidy_information TEXT,
    collateral_information TEXT,
    margin_requirements TEXT,
    source_id VARCHAR(64) NOT NULL REFERENCES master.sources(id),
    source_document_id VARCHAR(64),
    eligibility_summary TEXT,
    confidence NUMERIC(4,3) NOT NULL CHECK (confidence BETWEEN 0.0 AND 1.0),
    data_status VARCHAR(32) NOT NULL DEFAULT 'official'
);

CREATE TABLE master.scheme_eligibility_rules (
    id VARCHAR(64) PRIMARY KEY,
    scheme_version_id VARCHAR(64) NOT NULL REFERENCES master.scheme_versions(id) ON DELETE CASCADE,
    rule_type VARCHAR(32) NOT NULL CHECK (rule_type IN ('numeric_range', 'boolean', 'categorical', 'expression')),
    field_name VARCHAR(64) NOT NULL,
    operator VARCHAR(8) NOT NULL CHECK (operator IN ('==', '!=', '>', '>=', '<', '<=', 'in', 'not_in')),
    expected_value TEXT NOT NULL,
    description TEXT,
    source_id VARCHAR(64) NOT NULL REFERENCES master.sources(id),
    data_status VARCHAR(32) NOT NULL DEFAULT 'official'
);

-- ====================================================================
-- MASTER SCHEMA: SEPARATED FINANCIAL REFERENCES & OPERATING ASSUMPTIONS
-- ====================================================================
CREATE TABLE master.financial_references (
    id VARCHAR(64) PRIMARY KEY,
    indicator_name VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,
    value NUMERIC(12, 4) NOT NULL,
    unit VARCHAR(32) NOT NULL,
    applicable_jurisdiction VARCHAR(64) NOT NULL DEFAULT 'India',
    effective_from DATE NOT NULL,
    effective_to DATE,
    source_id VARCHAR(64) NOT NULL REFERENCES master.sources(id),
    confidence NUMERIC(4,3) NOT NULL CHECK (confidence BETWEEN 0.0 AND 1.0),
    notes TEXT,
    data_status VARCHAR(32) NOT NULL DEFAULT 'official'
);

CREATE TABLE master.business_operating_assumptions (
    id VARCHAR(64) PRIMARY KEY,
    business_category_id VARCHAR(64) NOT NULL REFERENCES master.business_categories(id) ON DELETE CASCADE,
    parameter_name VARCHAR(128) NOT NULL,
    value NUMERIC(12, 4) NOT NULL,
    unit VARCHAR(32) NOT NULL,
    applicable_region VARCHAR(64) NOT NULL DEFAULT 'Punjab',
    source_id VARCHAR(64) NOT NULL REFERENCES master.sources(id),
    confidence NUMERIC(4,3) NOT NULL CHECK (confidence BETWEEN 0.0 AND 1.0),
    notes TEXT,
    data_status VARCHAR(32) NOT NULL DEFAULT 'verified'
);

-- ====================================================================
-- MASTER SCHEMA: RISK, OPPORTUNITY & SCORING CONFIG
-- ====================================================================
CREATE TABLE master.risk_rules (
    id VARCHAR(64) PRIMARY KEY,
    business_category_id VARCHAR(64) NOT NULL REFERENCES master.business_categories(id) ON DELETE CASCADE,
    risk_type VARCHAR(64) NOT NULL CHECK (risk_type IN (
        'demand', 'competition', 'supply', 'raw_material_cost', 'operational', 
        'seasonal', 'financial', 'regulatory', 'market_access', 'climate', 'labor', 'other'
    )),
    condition TEXT NOT NULL,
    severity VARCHAR(16) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    probability NUMERIC(4, 3) NOT NULL CHECK (probability BETWEEN 0.0 AND 1.0),
    impact TEXT NOT NULL,
    description TEXT NOT NULL,
    mitigation TEXT NOT NULL,
    source_id VARCHAR(64) NOT NULL REFERENCES master.sources(id),
    confidence NUMERIC(4,3) NOT NULL CHECK (confidence BETWEEN 0.0 AND 1.0),
    data_status VARCHAR(32) NOT NULL DEFAULT 'verified'
);

CREATE TABLE master.opportunity_rules (
    id VARCHAR(64) PRIMARY KEY,
    business_category_id VARCHAR(64) NOT NULL REFERENCES master.business_categories(id) ON DELETE CASCADE,
    factor VARCHAR(64) NOT NULL,
    condition TEXT NOT NULL,
    score NUMERIC(5, 2) NOT NULL CHECK (score BETWEEN 0.0 AND 100.0),
    reason TEXT NOT NULL,
    source_id VARCHAR(64) NOT NULL REFERENCES master.sources(id),
    confidence NUMERIC(4,3) NOT NULL CHECK (confidence BETWEEN 0.0 AND 1.0),
    data_status VARCHAR(32) NOT NULL DEFAULT 'verified'
);

CREATE TABLE master.scoring_config (
    id VARCHAR(64) PRIMARY KEY,
    version VARCHAR(32) NOT NULL UNIQUE,
    market_demand_weight NUMERIC(4, 2) NOT NULL CHECK (market_demand_weight BETWEEN 0.0 AND 1.0),
    competition_opportunity_weight NUMERIC(4, 2) NOT NULL CHECK (competition_opportunity_weight BETWEEN 0.0 AND 1.0),
    capital_fit_weight NUMERIC(4, 2) NOT NULL CHECK (capital_fit_weight BETWEEN 0.0 AND 1.0),
    profit_cashflow_weight NUMERIC(4, 2) NOT NULL CHECK (profit_cashflow_weight BETWEEN 0.0 AND 1.0),
    risk_resilience_weight NUMERIC(4, 2) NOT NULL CHECK (risk_resilience_weight BETWEEN 0.0 AND 1.0),
    effective_from DATE NOT NULL,
    effective_to DATE,
    data_status VARCHAR(32) NOT NULL DEFAULT 'curated',
    CONSTRAINT check_weights_sum CHECK (
        market_demand_weight + competition_opportunity_weight + capital_fit_weight + 
        profit_cashflow_weight + risk_resilience_weight = 1.00
    )
);

-- ====================================================================
-- MASTER SCHEMA: AI / RAG DOCUMENTS (Nullable Embeddings)
-- ====================================================================
CREATE TABLE master.documents (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    document_type VARCHAR(64) NOT NULL,
    source_id VARCHAR(64) NOT NULL REFERENCES master.sources(id),
    source_url TEXT,
    publisher VARCHAR(255),
    version VARCHAR(32),
    effective_from DATE,
    effective_to DATE,
    publication_date DATE,
    file_path TEXT NOT NULL,
    content_hash VARCHAR(128) NOT NULL,
    language VARCHAR(16) NOT NULL DEFAULT 'en',
    confidence NUMERIC(4,3) NOT NULL CHECK (confidence BETWEEN 0.0 AND 1.0),
    data_status VARCHAR(32) NOT NULL DEFAULT 'official'
);

CREATE TABLE master.document_chunks (
    id VARCHAR(64) PRIMARY KEY,
    document_id VARCHAR(64) NOT NULL REFERENCES master.documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    chunk_text TEXT NOT NULL,
    page_number INT,
    section VARCHAR(128),
    embedding vector(768) NULL, -- Strictly NULL awaiting real embedding model execution
    embedding_model VARCHAR(64) NOT NULL DEFAULT 'text-embedding-004',
    embedding_dimension INT NOT NULL DEFAULT 768,
    embedding_status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (embedding_status IN ('pending', 'active', 'failed')),
    metadata JSONB,
    data_status VARCHAR(32) NOT NULL DEFAULT 'official'
);

-- pgvector Index on embeddings (will index non-null rows once populated)
CREATE INDEX idx_document_chunks_embedding ON master.document_chunks USING hnsw (embedding vector_cosine_ops);

-- ====================================================================
-- APP SCHEMA: USERS, PROFILES, RUNS, SCENARIOS & RESULTS
-- ====================================================================
CREATE TABLE app.users (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(128) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    role VARCHAR(32) NOT NULL DEFAULT 'entrepreneur',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_status VARCHAR(32) NOT NULL DEFAULT 'demo'
);

CREATE TABLE app.profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
    location_id VARCHAR(64) NOT NULL REFERENCES master.locations(id) ON DELETE RESTRICT,
    business_category_id VARCHAR(64) NOT NULL REFERENCES master.business_categories(id) ON DELETE RESTRICT,
    business_idea TEXT NOT NULL,
    own_capital NUMERIC(14, 2) NOT NULL CHECK (own_capital >= 0),
    experience_level VARCHAR(128),
    target_customers TEXT,
    existing_assets TEXT,
    preferred_scale VARCHAR(32) NOT NULL DEFAULT 'micro',
    desired_monthly_income NUMERIC(12, 2) CHECK (desired_monthly_income >= 0),
    risk_preference VARCHAR(32) NOT NULL DEFAULT 'moderate',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_status VARCHAR(32) NOT NULL DEFAULT 'demo'
);

CREATE TABLE app.financial_scenarios (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
    business_template_id VARCHAR(64) NOT NULL REFERENCES master.business_templates(id),
    project_cost NUMERIC(14, 2) NOT NULL CHECK (project_cost > 0),
    own_contribution NUMERIC(14, 2) NOT NULL CHECK (own_contribution >= 0),
    financing_requirement NUMERIC(14, 2) NOT NULL CHECK (financing_requirement >= 0),
    loan_amount NUMERIC(14, 2) NOT NULL CHECK (loan_amount >= 0),
    interest_rate NUMERIC(5, 2) NOT NULL CHECK (interest_rate >= 0),
    tenure_months INT NOT NULL CHECK (tenure_months > 0),
    moratorium_months INT NOT NULL DEFAULT 0 CHECK (moratorium_months >= 0),
    monthly_revenue NUMERIC(14, 2) NOT NULL CHECK (monthly_revenue >= 0),
    monthly_expenses NUMERIC(14, 2) NOT NULL CHECK (monthly_expenses >= 0),
    working_capital NUMERIC(14, 2) NOT NULL CHECK (working_capital >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_status VARCHAR(32) NOT NULL DEFAULT 'demo'
);

CREATE TABLE app.calculation_runs (
    id VARCHAR(64) PRIMARY KEY,
    scenario_id VARCHAR(64) NOT NULL REFERENCES app.financial_scenarios(id) ON DELETE CASCADE,
    engine_version VARCHAR(64) NOT NULL,
    input_snapshot_json JSONB NOT NULL,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    execution_status VARCHAR(32) NOT NULL DEFAULT 'SUCCESS',
    execution_notes TEXT,
    data_status VARCHAR(32) NOT NULL DEFAULT 'demo'
);

CREATE TABLE app.financial_results (
    id VARCHAR(64) PRIMARY KEY,
    run_id VARCHAR(64) NOT NULL REFERENCES app.calculation_runs(id) ON DELETE CASCADE,
    scenario_id VARCHAR(64) NOT NULL REFERENCES app.financial_scenarios(id) ON DELETE CASCADE,
    emi NUMERIC(12, 2) NOT NULL CHECK (emi >= 0),
    total_interest NUMERIC(14, 2) NOT NULL CHECK (total_interest >= 0),
    annual_revenue NUMERIC(14, 2) NOT NULL CHECK (annual_revenue >= 0),
    annual_expense NUMERIC(14, 2) NOT NULL CHECK (annual_expense >= 0),
    annual_profit NUMERIC(14, 2) NOT NULL,
    cash_flow NUMERIC(14, 2) NOT NULL,
    break_even NUMERIC(6, 2) NOT NULL,
    dscr NUMERIC(6, 2) NOT NULL,
    viability_score NUMERIC(5, 2) NOT NULL CHECK (viability_score BETWEEN 0.0 AND 100.0),
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_status VARCHAR(32) NOT NULL DEFAULT 'demo'
);

CREATE TABLE app.what_if_scenarios (
    id VARCHAR(64) PRIMARY KEY,
    base_scenario_id VARCHAR(64) NOT NULL REFERENCES app.financial_scenarios(id) ON DELETE CASCADE,
    scenario_name VARCHAR(128) NOT NULL,
    selling_price_change_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    demand_change_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    raw_material_change_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    operating_cost_change_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    capital_change NUMERIC(14, 2) NOT NULL DEFAULT 0.0,
    loan_change NUMERIC(14, 2) NOT NULL DEFAULT 0.0,
    other_assumptions JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_status VARCHAR(32) NOT NULL DEFAULT 'demo'
);

CREATE TABLE app.reports (
    id VARCHAR(64) PRIMARY KEY,
    profile_id VARCHAR(64) NOT NULL REFERENCES app.profiles(id) ON DELETE CASCADE,
    scenario_id VARCHAR(64) REFERENCES app.financial_scenarios(id) ON DELETE SET NULL,
    report_type VARCHAR(64) NOT NULL CHECK (report_type IN ('dpr', 'feasibility', 'executive_summary', 'bank_application')),
    title VARCHAR(255) NOT NULL,
    file_format VARCHAR(16) NOT NULL DEFAULT 'pdf',
    generated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(32) NOT NULL DEFAULT 'ready',
    content_summary JSONB,
    data_status VARCHAR(32) NOT NULL DEFAULT 'demo'
);

-- ====================================================================
-- COMPATIBILITY VIEWS: Expose tables in public schema for legacy SQL
-- ====================================================================
CREATE OR REPLACE VIEW public.sources AS SELECT * FROM master.sources;
CREATE OR REPLACE VIEW public.dataset_versions AS SELECT * FROM master.dataset_versions;
CREATE OR REPLACE VIEW public.villages AS SELECT * FROM master.villages;
CREATE OR REPLACE VIEW public.locations AS SELECT * FROM master.locations;
CREATE OR REPLACE VIEW public.demographics AS SELECT * FROM master.demographics;
CREATE OR REPLACE VIEW public.markets AS SELECT * FROM master.markets;
CREATE OR REPLACE VIEW public.businesses AS SELECT * FROM master.businesses;
CREATE OR REPLACE VIEW public.products AS SELECT * FROM master.products;
CREATE OR REPLACE VIEW public.prices AS SELECT * FROM master.prices;
CREATE OR REPLACE VIEW public.equipment AS SELECT * FROM master.equipment;
CREATE OR REPLACE VIEW public.business_templates AS SELECT * FROM master.business_templates;
CREATE OR REPLACE VIEW public.schemes AS SELECT * FROM master.schemes;
CREATE OR REPLACE VIEW public.scheme_versions AS SELECT * FROM master.scheme_versions;
CREATE OR REPLACE VIEW public.document_chunks AS SELECT * FROM master.document_chunks;

-- End of DDL Schema
"""
    with open(os.path.join(SQL_DIR, "database_schema.sql"), "w", encoding="utf-8") as f:
        f.write(sql)
    with open(os.path.join(BASE_DIR, "database_schema.sql"), "w", encoding="utf-8") as f:
        f.write(sql)
    print("Generated database_schema.sql with two-tier schema successfully.")

def read_csv_rows(filename):
    path = os.path.join(PROCESSED_DIR, filename)
    with open(path, mode="r", encoding="utf-8") as f:
        return list(csv.DictReader(f))

def escape_val(v):
    if v is None or v == "" or v == "None":
        return "NULL"
    if isinstance(v, bool):
        return "TRUE" if v else "FALSE"
    if isinstance(v, (int, float)):
        return str(v)
    val_str = str(v).strip()
    if val_str.lower() == "true":
        return "TRUE"
    if val_str.lower() == "false":
        return "FALSE"
    try:
        if "." in val_str:
            float(val_str)
            return val_str
        int(val_str)
        return val_str
    except ValueError:
        pass
    
    if val_str.startswith("SRID=4326;POINT"):
        return f"ST_GeomFromEWKT('{val_str}')"
    clean_str = val_str.replace("'", "''")
    return f"'{clean_str}'"

def generate_modular_seeds():
    modules = [
        ("seed_01_sources.sql", [
            ("master.sources", "sources.csv"),
            ("master.dataset_versions", "dataset_versions.csv"),
            ("master.data_quality", "data_quality.csv")
        ]),
        ("seed_02_geography.sql", [
            ("master.states", "states.csv"),
            ("master.districts", "districts.csv"),
            ("master.blocks", "blocks.csv"),
            ("master.villages", "villages.csv"),
            ("master.locations", "locations.csv"),
            ("master.demographics", "demographics.csv")
        ]),
        ("seed_03_commerce_pricing.sql", [
            ("master.business_categories", "business_categories.csv"),
            ("master.markets", "markets.csv"),
            ("master.businesses", "businesses.csv"),
            ("master.products", "products.csv"),
            ("master.prices", "prices.csv"),
            ("master.equipment", "equipment.csv")
        ]),
        ("seed_04_templates.sql", [
            ("master.business_templates", "business_templates.csv"),
            ("master.business_cost_templates", "business_cost_templates.csv"),
            ("master.business_revenue_templates", "business_revenue_templates.csv"),
            ("master.business_expense_templates", "business_expense_templates.csv")
        ]),
        ("seed_05_schemes.sql", [
            ("master.schemes", "schemes.csv"),
            ("master.scheme_versions", "scheme_versions.csv"),
            ("master.scheme_eligibility_rules", "scheme_eligibility_rules.csv")
        ]),
        ("seed_06_advisory.sql", [
            ("master.financial_references", "financial_references.csv"),
            ("master.business_operating_assumptions", "business_operating_assumptions.csv"),
            ("master.risk_rules", "risk_rules.csv"),
            ("master.opportunity_rules", "opportunity_rules.csv"),
            ("master.scoring_config", "scoring_config.csv")
        ]),
        ("seed_07_documents.sql", [
            ("master.documents", "documents.csv"),
            ("master.document_chunks", "document_chunks.csv")
        ]),
        ("seed_08_demo_app.sql", [
            ("app.users", "users.csv"),
            ("app.profiles", "demo_profiles.csv"),
            ("app.financial_scenarios", "demo_financial_scenarios.csv"),
            ("app.calculation_runs", "calculation_runs.csv"),
            ("app.financial_results", "demo_financial_results.csv"),
            ("app.what_if_scenarios", "demo_what_if_scenarios.csv")
        ])
    ]

    orchestrator_lines = [
        "-- ====================================================================",
        "-- GramVest Master Seed Orchestrator (Modular Execution)",
        "-- Executes all domain seed modules inside a single transactional block",
        "-- ====================================================================\n",
        "BEGIN;\n",
        "SET search_path TO master, app, public;\n"
    ]

    for script_name, tables in modules:
        script_lines = [
            f"-- ====================================================================",
            f"-- GramVest Module Seed: {script_name}",
            f"-- ====================================================================\n"
        ]
        orchestrator_lines.append(f"-- >>> Executing Module: {script_name}")
        
        for table_name, csv_file in tables:
            rows = read_csv_rows(csv_file)
            if not rows:
                continue
            cols = list(rows[0].keys())
            cols_str = ", ".join(cols)
            script_lines.append(f"-- Table: {table_name} ({len(rows)} records)")
            orchestrator_lines.append(f"-- Table: {table_name} ({len(rows)} records)")
            
            for r in rows:
                vals = [escape_val(r.get(col)) for col in cols]
                vals_str = ", ".join(vals)
                sql_insert = f"INSERT INTO {table_name} ({cols_str}) VALUES ({vals_str}) ON CONFLICT (id) DO NOTHING;"
                script_lines.append(sql_insert)
                orchestrator_lines.append(sql_insert)
            script_lines.append("")
            orchestrator_lines.append("")

        with open(os.path.join(SQL_DIR, script_name), "w", encoding="utf-8") as f:
            f.write("\n".join(script_lines))
        print(f"Generated modular seed: {script_name}")

    orchestrator_lines.append("COMMIT;\n")
    orchestrator_sql = "\n".join(orchestrator_lines)
    
    with open(os.path.join(SQL_DIR, "seed.sql"), "w", encoding="utf-8") as f:
        f.write(orchestrator_sql)
    with open(os.path.join(BASE_DIR, "seed.sql"), "w", encoding="utf-8") as f:
        f.write(orchestrator_sql)
    print("Generated seed.sql orchestrator successfully.")

def generate_data_dictionary():
    dict_rows = [
        {"table_name": "master.sources", "purpose": "Authoritative data provenance and source catalog", "column_name": "id", "data_type": "VARCHAR(64)", "nullable": "NO", "primary_key": "YES", "foreign_key": "NONE", "description": "Unique stable identifier for the source", "allowed_values": "SRC-*", "example": "SRC-GOI-MSME-PMEGP", "source_required": "NO", "confidence_required": "NO", "module_using_it": "All Modules / Provenance Engine"},
        {"table_name": "master.dataset_versions", "purpose": "Dataset release tracking & schema compatibility", "column_name": "version_tag", "data_type": "VARCHAR(64)", "nullable": "NO", "primary_key": "NO", "foreign_key": "UNIQUE", "description": "Semantic release tag of the dataset", "allowed_values": "SemVer strings", "example": "1.0.0-SIH2026-MVP", "source_required": "NO", "confidence_required": "NO", "module_using_it": "DevOps & System Auditing"},
        {"table_name": "master.villages", "purpose": "Census-backed village geographic entities with coordinates", "column_name": "census_code", "data_type": "VARCHAR(32)", "nullable": "NO", "primary_key": "NO", "foreign_key": "UNIQUE", "description": "Official 6-digit Census 2011 village code", "allowed_values": "Official Census codes", "example": "033105", "source_required": "YES", "confidence_required": "YES", "module_using_it": "GIS / Location Resolver"},
        {"table_name": "master.villages", "purpose": "Census-backed village geographic entities with coordinates", "column_name": "geometry", "data_type": "GEOMETRY(Point, 4326)", "nullable": "YES", "primary_key": "NO", "foreign_key": "NONE", "description": "PostGIS spatial point for 5km/10km radius queries", "allowed_values": "WGS84 Point", "example": "SRID=4326;POINT(75.4712 30.7725)", "source_required": "YES", "confidence_required": "YES", "module_using_it": "GIS Engine (Ansh)"},
        {"table_name": "master.demographics", "purpose": "Census 2011 population and worker counts", "column_name": "source_year", "data_type": "INT", "nullable": "NO", "primary_key": "NO", "foreign_key": "NONE", "description": "Year of data observation (strictly 2011 for Census)", "allowed_values": "2011", "example": "2011", "source_required": "YES", "confidence_required": "YES", "module_using_it": "Market Intelligence & Scoring"},
        {"table_name": "master.businesses", "purpose": "Identified public map competitors and services", "column_name": "coverage_type", "data_type": "VARCHAR(64)", "nullable": "NO", "primary_key": "NO", "foreign_key": "NONE", "description": "Source methodology for POI capture", "allowed_values": "sample_osm, cooperative_registry, local_survey", "example": "sample_osm", "source_required": "YES", "confidence_required": "YES", "module_using_it": "Competitor Mapping UI (Arpit)"},
        {"table_name": "master.prices", "purpose": "Verified commodity and product pricing", "column_name": "price_scope", "data_type": "VARCHAR(32)", "nullable": "NO", "primary_key": "NO", "foreign_key": "NONE", "description": "Geographic applicability level of price", "allowed_values": "local, market, district, regional, reference", "example": "market", "source_required": "YES", "confidence_required": "YES", "module_using_it": "Financial Engine (Deepak)"},
        {"table_name": "master.financial_references", "purpose": "Authoritative macroeconomic and statutory benchmarks", "column_name": "value", "data_type": "NUMERIC(12,4)", "nullable": "NO", "primary_key": "NO", "foreign_key": "NONE", "description": "Benchmark numeric rate or ratio", "allowed_values": "Official statutory rates", "example": "6.50", "source_required": "YES", "confidence_required": "YES", "module_using_it": "Financial Calculations & Solvency"},
        {"table_name": "master.business_operating_assumptions", "purpose": "Standard micro-enterprise operational parameters", "column_name": "parameter_name", "data_type": "VARCHAR(128)", "nullable": "NO", "primary_key": "NO", "foreign_key": "NONE", "description": "Operational metric (e.g. inventory cycle days)", "allowed_values": "Documented operational norms", "example": "Normative Working Capital Inventory & Receivables Cycle", "source_required": "YES", "confidence_required": "YES", "module_using_it": "Financial Modeling Engine"},
        {"table_name": "master.document_chunks", "purpose": "RAG chunked text excerpts and embeddings", "column_name": "embedding", "data_type": "vector(768)", "nullable": "YES", "primary_key": "NO", "foreign_key": "NONE", "description": "High-dimensional vector embedding (NULL while pending)", "allowed_values": "768-dim float vector or NULL", "example": "NULL", "source_required": "NO", "confidence_required": "NO", "module_using_it": "AI Advisor / Semantic Search"},
        {"table_name": "app.calculation_runs", "purpose": "Auditable log of every financial calculation execution", "column_name": "id", "data_type": "VARCHAR(64)", "nullable": "NO", "primary_key": "YES", "foreign_key": "NONE", "description": "Unique run ID for the calculation", "allowed_values": "RUN-*", "example": "RUN-PB-2026-001", "source_required": "NO", "confidence_required": "NO", "module_using_it": "Audit & Financial Engine"},
        {"table_name": "app.financial_results", "purpose": "Computed outputs from deterministic finance engine", "column_name": "dscr", "data_type": "NUMERIC(6,2)", "nullable": "NO", "primary_key": "NO", "foreign_key": "NONE", "description": "Debt Service Coverage Ratio (EBITDA / Total Debt Service)", "allowed_values": "> 0", "example": "7.38", "source_required": "NO (Engine Computed)", "confidence_required": "NO", "module_using_it": "Bankability & DPR Generation"}
    ]

    fields = ["table_name", "purpose", "column_name", "data_type", "nullable", "primary_key", "foreign_key", "description", "allowed_values", "example", "source_required", "confidence_required", "module_using_it"]
    save_csv("data_dictionary.csv", fields, dict_rows, [DOCS_DIR, PROCESSED_DIR, DATA_DIR])
    print("Generated data_dictionary.csv successfully.")

if __name__ == "__main__":
    generate_schema_sql()
    generate_modular_seeds()
    generate_data_dictionary()
