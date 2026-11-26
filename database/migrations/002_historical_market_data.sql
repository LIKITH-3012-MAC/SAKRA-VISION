-- ==============================================================================
-- SAKRA VISION: Migration 002 — Historical Market Data Ingestion Schema
-- Compatible with MySQL 8.0+ and Aiven Cloud MySQL
-- Dataset Source: Official NSE & BSE Bhavcopy (SEBI CMTS & Legacy Bhavcopy Layout)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS `historical_eod_prices` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `trade_date` DATE NOT NULL,
  `symbol` VARCHAR(30) NOT NULL,
  `series` VARCHAR(10) NOT NULL DEFAULT 'EQ',
  `isin` VARCHAR(20) DEFAULT NULL,
  `company_name` VARCHAR(255) DEFAULT NULL,
  `open_price` DECIMAL(14, 2) NOT NULL,
  `high_price` DECIMAL(14, 2) NOT NULL,
  `low_price` DECIMAL(14, 2) NOT NULL,
  `close_price` DECIMAL(14, 2) NOT NULL,
  `last_price` DECIMAL(14, 2) DEFAULT NULL,
  `previous_close` DECIMAL(14, 2) DEFAULT NULL,
  `volume` BIGINT NOT NULL DEFAULT 0,
  `turnover` DECIMAL(20, 2) DEFAULT 0.00,
  `trade_count` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Business key: unique per symbol, trade date, and series
  UNIQUE KEY `uk_symbol_date_series` (`symbol`, `trade_date`, `series`),

  -- Performance indexes for fast symbol time-series lookups & date range scans
  INDEX `idx_symbol_trade_date` (`symbol`, `trade_date`),
  INDEX `idx_trade_date` (`trade_date`),
  INDEX `idx_isin` (`isin`),
  INDEX `idx_company_name` (`company_name`)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
