-- SAKRA VISION: Database Schema Migration 001
-- Target Engine: MySQL 8.0+

CREATE DATABASE IF NOT EXISTS `sakra_stocks` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sakra_stocks`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `tier` ENUM('PRIVATE_WEALTH', 'RESEARCH_MEMBER', 'STANDARD') DEFAULT 'PRIVATE_WEALTH',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. User Settings
CREATE TABLE IF NOT EXISTS `user_settings` (
  `user_id` VARCHAR(36) PRIMARY KEY,
  `theme` VARCHAR(20) DEFAULT 'ivory',
  `currency` VARCHAR(5) DEFAULT 'INR',
  `data_mode` ENUM('DEMO', 'CONNECTED') DEFAULT 'DEMO',
  `notifications_daily` BOOLEAN DEFAULT TRUE,
  `notifications_technical` BOOLEAN DEFAULT TRUE,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Stocks Master Registry
CREATE TABLE IF NOT EXISTS `stocks` (
  `symbol` VARCHAR(30) PRIMARY KEY,
  `isin` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `exchange` VARCHAR(10) NOT NULL DEFAULT 'NSE',
  `series` VARCHAR(5) DEFAULT 'EQ',
  `sector` VARCHAR(100),
  `industry` VARCHAR(100),
  `market_cap_cr` DECIMAL(15, 2),
  `pe_ratio` DECIMAL(8, 2),
  `pb_ratio` DECIMAL(8, 2),
  `div_yield` DECIMAL(5, 2),
  `high_52w` DECIMAL(12, 2),
  `low_52w` DECIMAL(12, 2),
  `beta` DECIMAL(6, 3),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Historical Daily Prices (Matching NSE CM Bhavcopy Structure)
CREATE TABLE IF NOT EXISTS `historical_daily_prices` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `symbol` VARCHAR(30) NOT NULL,
  `trade_date` DATE NOT NULL,
  `open_price` DECIMAL(12, 2) NOT NULL,
  `high_price` DECIMAL(12, 2) NOT NULL,
  `low_price` DECIMAL(12, 2) NOT NULL,
  `close_price` DECIMAL(12, 2) NOT NULL,
  `last_price` DECIMAL(12, 2),
  `prev_close_price` DECIMAL(12, 2),
  `volume` BIGINT NOT NULL,
  `turnover_value` DECIMAL(18, 2),
  `trades_count` INT,
  `series` VARCHAR(5) DEFAULT 'EQ',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_symbol_date` (`symbol`, `trade_date`),
  INDEX `idx_date` (`trade_date`),
  FOREIGN KEY (`symbol`) REFERENCES `stocks`(`symbol`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Watchlists
CREATE TABLE IF NOT EXISTS `watchlists` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL DEFAULT 'Primary Watchlist',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Watchlist Items
CREATE TABLE IF NOT EXISTS `watchlist_items` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `watchlist_id` VARCHAR(36) NOT NULL,
  `symbol` VARCHAR(30) NOT NULL,
  `notes` TEXT,
  `target_entry_price` DECIMAL(12, 2),
  `added_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_wl_symbol` (`watchlist_id`, `symbol`),
  FOREIGN KEY (`watchlist_id`) REFERENCES `watchlists`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`symbol`) REFERENCES `stocks`(`symbol`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Portfolio Holdings
CREATE TABLE IF NOT EXISTS `portfolio_holdings` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `symbol` VARCHAR(30) NOT NULL,
  `exchange` VARCHAR(10) DEFAULT 'NSE',
  `quantity` DECIMAL(12, 4) NOT NULL,
  `avg_purchase_price` DECIMAL(12, 2) NOT NULL,
  `purchase_date` DATE,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`symbol`) REFERENCES `stocks`(`symbol`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. News Articles (Firecrawl / Scraped Feed)
CREATE TABLE IF NOT EXISTS `news_articles` (
  `id` VARCHAR(64) PRIMARY KEY, -- SHA-256 hash of URL for deduplication
  `url` VARCHAR(512) NOT NULL,
  `headline` VARCHAR(500) NOT NULL,
  `source_publisher` VARCHAR(150),
  `published_time` TIMESTAMP NULL,
  `scraped_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `raw_content` MEDIUMTEXT,
  `ai_summary` TEXT,
  `sentiment` ENUM('BULLISH', 'BEARISH', 'NEUTRAL', 'CAUTION') DEFAULT 'NEUTRAL',
  `key_risks` TEXT,
  `related_symbols` VARCHAR(255)
) ENGINE=InnoDB;

-- 9. Groq AI Company Research Reports
CREATE TABLE IF NOT EXISTS `company_research_reports` (
  `id` VARCHAR(36) PRIMARY KEY,
  `symbol` VARCHAR(30) NOT NULL,
  `model_version` VARCHAR(100) NOT NULL,
  `executive_thesis` TEXT NOT NULL,
  `bullish_evidence` JSON,
  `bearish_risks` JSON,
  `confidence_rating` VARCHAR(50),
  `generated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`symbol`) REFERENCES `stocks`(`symbol`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Prediction & Quantitative Scenario Runs
CREATE TABLE IF NOT EXISTS `prediction_runs` (
  `id` VARCHAR(36) PRIMARY KEY,
  `symbol` VARCHAR(30) NOT NULL,
  `model_name` VARCHAR(150) NOT NULL,
  `horizon` VARCHAR(20) NOT NULL,
  `predicted_direction` VARCHAR(50) NOT NULL,
  `calibrated_confidence` DECIMAL(5, 2),
  `target_range_low` DECIMAL(12, 2),
  `target_range_high` DECIMAL(12, 2),
  `features_snapshot` JSON,
  `backtest_metrics` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`symbol`) REFERENCES `stocks`(`symbol`) ON DELETE CASCADE
) ENGINE=InnoDB;
