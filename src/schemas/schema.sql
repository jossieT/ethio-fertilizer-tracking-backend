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

CREATE SEQUENCE user_display_id_seq START WITH 1;

CREATE TABLE users (
    user_id TEXT PRIMARY KEY DEFAULT ('UID' || LPAD(nextval('user_display_id_seq')::text, 3, '0')),
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
    unique_farmer_id VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    phone_number VARCHAR(20),
    address TEXT,
    farm_area_hectares NUMERIC(8,2),
    photo_url TEXT,
    land_certificate_url TEXT,
    kebele_id INT REFERENCES kebeles(kebele_id) ON DELETE SET NULL,
    registered_by TEXT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_farmers_kebele ON farmers(kebele_id);
CREATE INDEX idx_farmers_unique_id ON farmers(unique_farmer_id);

-- 5. Farmer Demand Requests
CREATE TABLE farmer_demand (
    demand_id SERIAL PRIMARY KEY,
    farmer_id INT NOT NULL REFERENCES farmers(farmer_id) ON DELETE CASCADE,
    demand_year VARCHAR(10) NOT NULL, -- e.g., '2017/18'
    season_irrigation BOOLEAN DEFAULT FALSE,
    season_meher BOOLEAN DEFAULT FALSE,
    season_belg BOOLEAN DEFAULT FALSE,
    fert_type_id INT NOT NULL REFERENCES fertilizer_types(fert_type_id),
    amount_needed_qt NUMERIC(10,2) NOT NULL,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registered_by TEXT REFERENCES users(user_id),
    approval_status VARCHAR(20) DEFAULT 'Pending' CHECK (approval_status IN ('Pending', 'Approved', 'Rejected')),
    approved_by TEXT REFERENCES users(user_id),
    approved_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_farmer_demand_farmer ON farmer_demand(farmer_id);
CREATE INDEX idx_farmer_demand_year ON farmer_demand(demand_year);
CREATE INDEX idx_farmer_demand_status ON farmer_demand(approval_status);

-- 6. Fertilizer Demand Calculation (Kebele/Farmer Auto-Calc)
CREATE TABLE farmer_auto_calc_demand (
    calc_id SERIAL PRIMARY KEY,
    farmer_id INT REFERENCES farmers(farmer_id) ON DELETE CASCADE,
    year_season VARCHAR(20) NOT NULL, 
    crop VARCHAR(100),
    land_allocated_ha DECIMAL(10, 2),
    fert_type_id INT REFERENCES fertilizer_types(fert_type_id),
    quantity_required_qt DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Kebele Fertilizer Demand Summary
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

-- Sample Farmers
INSERT INTO farmers (full_name, sex, kebele_id, farmer_unique_id, phone_number, registered_by)
VALUES 
('Girma Kasahun', 'Male', (SELECT kebele_id FROM kebeles WHERE kebele_name = 'Test Kebele'), 'NID001', '0987654321', 'UID001'),
('Abebech Tadesse', 'Female', (SELECT kebele_id FROM kebeles WHERE kebele_name = 'Test Kebele'), 'NID002', '0987654322', 'UID001');

-- Sample Demands
INSERT INTO farmer_demand (farmer_id, demand_year, season_meher, fert_type_id, amount_needed_qt, registered_by)
VALUES 
(1, '2017/18', true, (SELECT fert_type_id FROM fertilizer_types WHERE fert_name = 'Urea'), 150.50, 'UID001'),
(2, '2017/18', true, (SELECT fert_type_id FROM fertilizer_types WHERE fert_name = 'DAP'), 200.00, 'UID001');

-- Sample Summary Data for Dashboard
INSERT INTO kebele_fert_demand_summary 
(kebele_id, year_season, fert_type_id, demand_collected, demand_intelligence, demand_adjusted_by_kebele, demand_adjusted_by_woreda, demand_approved, final_allocated)
VALUES 
((SELECT kebele_id FROM kebeles WHERE kebele_name = 'Test Kebele'), '2017/18', (SELECT fert_type_id FROM fertilizer_types WHERE fert_name = 'Urea'), 500, 480, 490, 490, 485, 485),
((SELECT kebele_id FROM kebeles WHERE kebele_name = 'Test Kebele'), '2017/18', (SELECT fert_type_id FROM fertilizer_types WHERE fert_name = 'DAP'), 300, 290, 295, 295, 290, 290);
