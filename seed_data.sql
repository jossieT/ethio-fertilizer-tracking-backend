-- SEED DATA FOR ETHIO-FERT-TRACKING (FSM V2)
-- This script populates all tables except 'users' with realistic sample data.

-- 1. Regions
INSERT INTO regions (region_name_e, region_name_a) VALUES 
('Amhara', 'አማራ'),
('Oromia', 'ኦሮሚያ'),
('Sidama', 'ሲዳማ'),
('Tigray', 'ትግራይ')
ON CONFLICT (region_name_e) DO NOTHING;

-- 2. Zones
INSERT INTO zones (zone_name, region_id) VALUES 
('North Gondar', (SELECT region_id FROM regions WHERE region_name_e = 'Amhara')),
('West Arsi', (SELECT region_id FROM regions WHERE region_name_e = 'Oromia')),
('Hawassa', (SELECT region_id FROM regions WHERE region_name_e = 'Sidama'))
ON CONFLICT (zone_name, region_id) DO NOTHING;

-- 3. Woredas
INSERT INTO woredas (woreda_name, zone_id) VALUES 
('Dembiya', (SELECT zone_id FROM zones WHERE zone_name = 'North Gondar')),
('Shashemene', (SELECT zone_id FROM zones WHERE zone_name = 'West Arsi')),
('Hawassa Zuria', (SELECT zone_id FROM zones WHERE zone_name = 'Hawassa'))
ON CONFLICT (woreda_name, zone_id) DO NOTHING;

-- 4. Kebeles
INSERT INTO kebeles (kebele_name, woreda_id) VALUES 
('K-01 Kola', (SELECT woreda_id FROM woredas WHERE woreda_name = 'Dembiya')),
('K-02 Dega', (SELECT woreda_id FROM woredas WHERE woreda_name = 'Dembiya')),
('Melka Oda', (SELECT woreda_id FROM woredas WHERE woreda_name = 'Shashemene')),
('Tula', (SELECT woreda_id FROM woredas WHERE woreda_name = 'Hawassa Zuria'))
ON CONFLICT (kebele_name, woreda_id) DO NOTHING;

-- 5. Fertilizer Types
INSERT INTO fertilizer_types (fert_name, description) VALUES 
('Urea', 'High nitrogen content fertilizer for leafy growth'),
('DAP', 'Diammonium phosphate for root development'),
('NPS', 'Nitrogen, Phosphorus, and Sulfur blend'),
('NPSB', 'NPS with Boron'),
('Potassium Chloride', 'Rich in potassium for fruit and seed development')
ON CONFLICT (fert_name) DO NOTHING;

-- 6. Farmers
INSERT INTO farmers (unique_farmer_id, full_name, gender, phone_number, address, farm_area_hectares, kebele_id, registered_by) VALUES 
('FRM001', 'Abel Tesfaye', 'Male', '0911000001', 'Area 1, Block A', 2.5, (SELECT kebele_id FROM kebeles WHERE kebele_name = 'K-01 Kola'), 'UID999'),
('FRM002', 'Lidya Girma', 'Female', '0911000002', 'Area 2, Block B', 1.8, (SELECT kebele_id FROM kebeles WHERE kebele_name = 'K-01 Kola'), 'UID999'),
('FRM003', 'Kassa Tadesse', 'Male', '0911000003', 'Rural Way 5', 5.0, (SELECT kebele_id FROM kebeles WHERE kebele_name = 'Melka Oda'), 'UID999'),
('FRM004', 'Genet Alemu', 'Female', '0911000004', 'Lake Side 12', 3.2, (SELECT kebele_id FROM kebeles WHERE kebele_name = 'Tula'), 'UID999')
ON CONFLICT (unique_farmer_id) DO NOTHING;

-- 7. Demands (V2 Aggregated)
INSERT INTO demands (crop, quantity, kebele_id, status) VALUES 
('Wheat', 500.50, (SELECT kebele_id FROM kebeles WHERE kebele_name = 'K-01 Kola'), 'Approved'),
('Maize', 1200.00, (SELECT kebele_id FROM kebeles WHERE kebele_name = 'K-01 Kola'), 'Pending'),
('Teaff', 800.75, (SELECT kebele_id FROM kebeles WHERE kebele_name = 'Melka Oda'), 'Approved'),
('Barley', 450.00, (SELECT kebele_id FROM kebeles WHERE kebele_name = 'Tula'), 'Rejected');

-- 8. Inventory
INSERT INTO inventory (kebele_id, product_name, stock_quantity) VALUES 
((SELECT kebele_id FROM kebeles WHERE kebele_name = 'K-01 Kola'), 'Fertilizer', 5000.00),
((SELECT kebele_id FROM kebeles WHERE kebele_name = 'Melka Oda'), 'Fertilizer', 3500.00),
((SELECT kebele_id FROM kebeles WHERE kebele_name = 'Tula'), 'Fertilizer', 2000.00)
ON CONFLICT (kebele_id) DO NOTHING;

-- 9. Sales
INSERT INTO sales (farmer_id, kebele_id, product_name, quantity, status) VALUES 
((SELECT farmer_id FROM farmers WHERE unique_farmer_id = 'FRM001'), (SELECT kebele_id FROM kebeles WHERE kebele_name = 'K-01 Kola'), 'Fertilizer', 5.5, 'Delivered'),
((SELECT farmer_id FROM farmers WHERE unique_farmer_id = 'FRM002'), (SELECT kebele_id FROM kebeles WHERE kebele_name = 'K-01 Kola'), 'Fertilizer', 3.0, 'Initiated'),
((SELECT farmer_id FROM farmers WHERE unique_farmer_id = 'FRM003'), (SELECT kebele_id FROM kebeles WHERE kebele_name = 'Melka Oda'), 'Fertilizer', 10.0, 'Delivered')
-- 10. Auto-Calc Demands (Legacy Support)
INSERT INTO farmer_auto_calc_demand (farmer_id, year_season, crop, land_allocated_ha, fert_type_id, quantity_required_qt) VALUES 
((SELECT farmer_id FROM farmers WHERE unique_farmer_id = 'FRM001'), '2024/25 Meher', 'Wheat', 2.5, (SELECT fert_type_id FROM fertilizer_types WHERE fert_name = 'Urea'), 125.0);

-- 11. Kebele Demand Summary (Legacy Support)
INSERT INTO kebele_fert_demand_summary (kebele_id, year_season, fert_type_id, demand_collected, demand_approved) VALUES 
((SELECT kebele_id FROM kebeles WHERE kebele_name = 'K-01 Kola'), '2024/25 Meher', (SELECT fert_type_id FROM fertilizer_types WHERE fert_name = 'Urea'), 1000.0, 950.0);
