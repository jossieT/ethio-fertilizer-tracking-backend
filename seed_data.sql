-- SEED DATA FOR ETHIO-FERT-TRACKING (FARMER-CENTRIC PIVOT)
-- This script populates all tables except 'users' with realistic sample data matching the new individual farmer model.

-- 1. Regions
INSERT INTO regions (region_name_e, region_name_a) VALUES 
('Amhara', 'አማራ'),
('Oromia', 'ኦሮሚያ')
ON CONFLICT (region_name_e) DO NOTHING;

-- 2. Zones
INSERT INTO zones (zone_name, region_id) VALUES 
('North Gondar', (SELECT region_id FROM regions WHERE region_name_e = 'Amhara')),
('West Arsi', (SELECT region_id FROM regions WHERE region_name_e = 'Oromia'))
ON CONFLICT (zone_name, region_id) DO NOTHING;

-- 3. Woredas
INSERT INTO woredas (woreda_name, zone_id) VALUES 
('Dembiya', (SELECT zone_id FROM zones WHERE zone_name = 'North Gondar')),
('Shashemene', (SELECT zone_id FROM zones WHERE zone_name = 'West Arsi'))
ON CONFLICT (woreda_name, zone_id) DO NOTHING;

-- 4. Kebeles
INSERT INTO kebeles (kebele_name, woreda_id) VALUES 
('K-01 Kola', (SELECT woreda_id FROM woredas WHERE woreda_name = 'Dembiya')),
('Melka Oda', (SELECT woreda_id FROM woredas WHERE woreda_name = 'Shashemene'))
ON CONFLICT (kebele_name, woreda_id) DO NOTHING;

-- 5. Fertilizer Types
-- Standardized to Urea and DAP for the new transactions
INSERT INTO fertilizer_types (fert_name, description) VALUES 
('Urea', 'Urea Fertilizer'),
('DAP', 'Diammonium Phosphate')
ON CONFLICT (fert_name) DO NOTHING;

-- 6. Farmers
INSERT INTO farmers (unique_farmer_id, full_name, gender, phone_number, kebele_id, registered_by) VALUES 
('FRM001', 'Abel Tesfaye', 'Male', '0911000001', (SELECT kebele_id FROM kebeles WHERE kebele_name = 'K-01 Kola'), 'UID999'),
('FRM002', 'Lidya Girma', 'Female', '0911000002', (SELECT kebele_id FROM kebeles WHERE kebele_name = 'K-01 Kola'), 'UID999')
ON CONFLICT (unique_farmer_id) DO NOTHING;

-- 7. Demands (Individual Farmer with Crop Details)
INSERT INTO demands (farmer_id, demand_year, season_meher, fert_type, amount_needed_qt, crop_cereal, crop_pulse, registered_by) VALUES 
((SELECT farmer_id FROM farmers WHERE unique_farmer_id = 'FRM001'), '2024/25', true, 'Urea', 5.5, 'Wheat', 'Beans', 'UID999'),
((SELECT farmer_id FROM farmers WHERE unique_farmer_id = 'FRM002'), '2024/25', true, 'DAP', 3.0, 'Maize', NULL, 'UID999');

-- 8. Sales (Individual Farmer Supply)
INSERT INTO sales (farmer_id, supply_year, season, fert_type, amount_supplied_qt, registered_by, approval_status) VALUES 
((SELECT farmer_id FROM farmers WHERE unique_farmer_id = 'FRM001'), '2024', 'Meher', 'Urea', 5.5, 'UID999', 'Approved');

-- 9. Inventory (Aggregate Kebele Stock)
INSERT INTO inventory (kebele_id, product_name, stock_quantity) VALUES 
((SELECT kebele_id FROM kebeles WHERE kebele_name = 'K-01 Kola'), 'Urea', 1000.00),
((SELECT kebele_id FROM kebeles WHERE kebele_name = 'K-01 Kola'), 'DAP', 800.00)
ON CONFLICT (kebele_id) DO NOTHING;
