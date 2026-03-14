-- PostgreSQL Schema for Ethiopian Fertilizer Digital Tracking & Management System

-- 1. Administrative Hierarchy
CREATE TABLE regions (
    region_id SERIAL PRIMARY KEY,
    region_name_e VARCHAR(60) NOT NULL UNIQUE,
    region_name_a VARCHAR(60),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE zones (
    zone_id SERIAL PRIMARY KEY,
    zone_name VARCHAR(100) NOT NULL,
    region_id INT REFERENCES regions(region_id) ON DELETE CASCADE,
    UNIQUE(zone_name, region_id)
);

CREATE TABLE woredas (
    woreda_id SERIAL PRIMARY KEY,
    woreda_name VARCHAR(100) NOT NULL,
    zone_id INT REFERENCES zones(zone_id) ON DELETE CASCADE,
    UNIQUE(woreda_name, zone_id)
);

CREATE TABLE kebeles (
    kebele_id SERIAL PRIMARY KEY,
    kebele_name VARCHAR(150) NOT NULL,
    woreda_id INT REFERENCES woredas(woreda_id) ON DELETE CASCADE,
    UNIQUE(kebele_name, woreda_id)
);

-- 2. User Management
CREATE TYPE user_role AS ENUM ('Federal', 'Region', 'Zone', 'Woreda', 'Kebele');

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    region_id INT REFERENCES regions(region_id),
    zone_id INT REFERENCES zones(zone_id),
    woreda_id INT REFERENCES woredas(woreda_id),
    kebele_id INT REFERENCES kebeles(kebele_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Fertilizer Types
CREATE TABLE fertilizer_types (
    fert_type_id SERIAL PRIMARY KEY,
    fert_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Farmers
CREATE TABLE farmers (
    farmer_id SERIAL PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    gender VARCHAR(10),
    phone VARCHAR(20),
    kebele_id INT REFERENCES kebeles(kebele_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Fertilizer Demand Calculation (Per Farmer)
CREATE TABLE farmer_auto_calc_demand (
    calc_id SERIAL PRIMARY KEY,
    farmer_id INT REFERENCES farmers(farmer_id) ON DELETE CASCADE,
    year_season VARCHAR(20) NOT NULL, -- e.g., '2017/18'
    crop VARCHAR(100),
    land_allocated_ha DECIMAL(10, 2),
    fert_type_id INT REFERENCES fertilizer_types(fert_type_id),
    quantity_required_qt DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Kebele Fertilizer Demand Summary
CREATE TABLE kebele_fert_demand_summary (
    kfdid SERIAL PRIMARY KEY,
    kebele_id INT REFERENCES kebeles(kebele_id) ON DELETE CASCADE,
    year_season VARCHAR(20) NOT NULL,
    fert_type_id INT REFERENCES fertilizer_types(fert_type_id),
    demand_collected DECIMAL(15, 2) DEFAULT 0,
    demand_intelligence DECIMAL(15, 2) DEFAULT 0,
    demand_adjusted_by_kebele DECIMAL(15, 2) DEFAULT 0,
    demand_adjusted_by_woreda DECIMAL(15, 2) DEFAULT 0,
    demand_approved DECIMAL(15, 2) DEFAULT 0,
    final_allocated DECIMAL(15, 2) DEFAULT 0,
    stop_adjustment BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(kebele_id, year_season, fert_type_id)
);

-- Indexes for performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_kebele_summary_lookup ON kebele_fert_demand_summary(kebele_id, year_season);

-- SAMPLE DATA
INSERT INTO regions (region_name_e, region_name_a) VALUES ('Amhara', 'አማራ');
INSERT INTO zones (zone_name, region_id) VALUES ('North Gondar', (SELECT region_id FROM regions WHERE region_name_e = 'Amhara'));
INSERT INTO woredas (woreda_name, zone_id) VALUES ('Dembiya', (SELECT zone_id FROM zones WHERE zone_name = 'North Gondar'));
INSERT INTO kebeles (kebele_name, woreda_id) VALUES ('Test Kebele', (SELECT woreda_id FROM woredas WHERE woreda_name = 'Dembiya'));

-- Test User: Alemu Ketema, phone 0912345678, password password123
INSERT INTO users (full_name, phone, password_hash, role, kebele_id) 
VALUES ('Alemu Ketema', '0912345678', '$2b$10$W9eB.PppjhTLOBMnLpsQWemXFMK0sIiUrIeGj952hzZfA2k1cgmhC', 'Kebele', (SELECT kebele_id FROM kebeles WHERE kebele_name = 'Test Kebele'));

-- Fertilizer Types
INSERT INTO fertilizer_types (fert_name) VALUES ('Urea'), ('DAP'), ('NPS'), ('NPSB');

-- Sample Summary Data for Dashboard
INSERT INTO kebele_fert_demand_summary 
(kebele_id, year_season, fert_type_id, demand_collected, demand_intelligence, demand_adjusted_by_kebele, demand_adjusted_by_woreda, demand_approved, final_allocated)
VALUES 
((SELECT kebele_id FROM kebeles WHERE kebele_name = 'Test Kebele'), '2017/18', (SELECT fert_type_id FROM fertilizer_types WHERE fert_name = 'Urea'), 500, 480, 490, 490, 485, 485),
((SELECT kebele_id FROM kebeles WHERE kebele_name = 'Test Kebele'), '2017/18', (SELECT fert_type_id FROM fertilizer_types WHERE fert_name = 'DAP'), 300, 290, 295, 295, 290, 290);
