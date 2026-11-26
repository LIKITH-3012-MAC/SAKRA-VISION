-- SAKRA VISION: Seed Data
USE `sakra_stocks`;

-- Seed Default User
INSERT INTO `users` (`id`, `email`, `name`, `tier`)
VALUES ('u-default-001', 'likith@sakra-vision.internal', 'Likith Naidu', 'PRIVATE_WEALTH')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `user_settings` (`user_id`, `theme`, `currency`, `data_mode`)
VALUES ('u-default-001', 'ivory', 'INR', 'DEMO')
ON DUPLICATE KEY UPDATE `theme` = VALUES(`theme`);

-- Seed Stocks Master (Verified ISINs & Equities)
INSERT INTO `stocks` (`symbol`, `isin`, `name`, `exchange`, `series`, `sector`, `industry`, `market_cap_cr`, `pe_ratio`, `pb_ratio`, `div_yield`, `high_52w`, `low_52w`, `beta`)
VALUES
('RELIANCE', 'INE002A01018', 'Reliance Industries Limited', 'NSE', 'EQ', 'Oil & Gas / Retail', 'Conglomerate', 1902000.00, 26.40, 2.10, 0.72, 1608.80, 1215.00, 0.88),
('HDFCBANK', 'INE040A01034', 'HDFC Bank Limited', 'NSE', 'EQ', 'Financial Services', 'Private Sector Banking', 1465000.00, 18.20, 2.60, 1.15, 1985.00, 1420.00, 1.05),
('TCS', 'INE467B01029', 'Tata Consultancy Services Ltd', 'NSE', 'EQ', 'Information Technology', 'IT Services & Consulting', 1248000.00, 27.50, 11.20, 2.45, 4580.00, 3320.00, 0.74),
('INFY', 'INE009A01021', 'Infosys Limited', 'NSE', 'EQ', 'Information Technology', 'IT Services', 622000.00, 24.80, 7.60, 2.70, 1970.00, 1360.00, 0.85),
('ICICIBANK', 'INE090A01021', 'ICICI Bank Limited', 'NSE', 'EQ', 'Financial Services', 'Private Sector Banking', 885000.00, 17.50, 2.90, 0.80, 1315.00, 980.00, 1.12),
('BHARTIARTL', 'INE397D01024', 'Bharti Airtel Limited', 'NSE', 'EQ', 'Telecommunications', 'Telecom Services', 980000.00, 38.40, 6.20, 0.60, 1780.00, 1120.00, 0.78),
('SBIN', 'INE062A01020', 'State Bank of India', 'NSE', 'EQ', 'Financial Services', 'Public Sector Banking', 725000.00, 10.40, 1.50, 1.80, 912.00, 680.00, 1.18),
('ITC', 'INE154A01025', 'ITC Limited', 'NSE', 'EQ', 'FMCG & Consumer', 'Diversified Consumer Goods', 590000.00, 26.50, 7.80, 2.85, 520.00, 410.00, 0.62),
('ZYDUSWELL', 'INE768C01010', 'Zydus Wellness Limited', 'NSE', 'EQ', 'FMCG & Consumer', 'Consumer Healthcare', 11200.00, 32.10, 2.30, 0.45, 2350.00, 1540.00, 0.72)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Seed Historical Bhavcopy records (Matching verified tej-bazaar fixture date 2025-04-30 / Oct 2026)
INSERT INTO `historical_daily_prices` (`symbol`, `trade_date`, `open_price`, `high_price`, `low_price`, `close_price`, `last_price`, `prev_close_price`, `volume`, `turnover_value`, `trades_count`)
VALUES
('HDFCBANK', '2026-10-27', 1913.00, 1936.90, 1910.30, 1925.00, 1920.10, 1908.80, 15968435, 30739492241.20, 275126),
('INFY', '2026-10-27', 1496.80, 1508.80, 1482.60, 1500.10, 1491.50, 1497.50, 7704183, 11555716056.40, 128359),
('RELIANCE', '2026-10-27', 1402.00, 1412.40, 1369.00, 1405.00, 1395.00, 1399.70, 25480745, 35797220282.00, 598769),
('TCS', '2026-10-27', 3472.00, 3509.90, 3366.00, 3453.70, 3431.80, 3472.50, 2809332, 9731586389.30, 129048),
('ZYDUSWELL', '2026-10-27', 1802.40, 1839.00, 1759.00, 1765.20, 1759.00, 1802.40, 22144, 39528631.70, 4584)
ON DUPLICATE KEY UPDATE `close_price` = VALUES(`close_price`);

-- Seed Default Watchlist
INSERT INTO `watchlists` (`id`, `user_id`, `name`)
VALUES ('wl-primary-001', 'u-default-001', 'Core Portfolio Watchlist')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `watchlist_items` (`watchlist_id`, `symbol`, `notes`, `target_entry_price`)
VALUES
('wl-primary-001', 'RELIANCE', 'Consolidating above 20 EMA, monitoring retail margin expansion', 1390.00),
('wl-primary-001', 'HDFCBANK', 'Loan-to-deposit ratio stabilizing', 1900.00),
('wl-primary-001', 'TCS', 'Long-term IT cash flow dividend compounder', 3400.00),
('wl-primary-001', 'INFY', 'AI Topaz contract traction', 1480.00)
ON DUPLICATE KEY UPDATE `notes` = VALUES(`notes`);
