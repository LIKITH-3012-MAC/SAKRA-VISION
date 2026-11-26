-- ==============================================================================
-- SAKRA VISION: Migration 003 — Portfolios, Holdings, & Watchlists
-- Compatible with MySQL 8.0+ and Aiven Cloud MySQL
-- ==============================================================================

USE `sakra_stocks`;

-- 1. Portfolios Table
CREATE TABLE IF NOT EXISTS `portfolios` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NULL, -- Prepared for future auth; NULL in single-tenant local-dev mode
  `name` VARCHAR(100) NOT NULL DEFAULT 'Primary Wealth Portfolio',
  `description` VARCHAR(255) DEFAULT NULL,
  `currency` VARCHAR(5) NOT NULL DEFAULT 'INR',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_portfolios_user_id` (`user_id`)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Portfolio Holdings Table
CREATE TABLE IF NOT EXISTS `portfolio_holdings` (
  `id` VARCHAR(36) PRIMARY KEY,
  `portfolio_id` VARCHAR(36) NOT NULL,
  `symbol` VARCHAR(30) NOT NULL,
  `exchange` VARCHAR(10) NOT NULL DEFAULT 'NSE',
  `quantity` DECIMAL(14, 4) NOT NULL,
  `average_buy_price` DECIMAL(14, 2) NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Constraints & Indexes
  UNIQUE KEY `uk_portfolio_symbol` (`portfolio_id`, `symbol`),
  INDEX `idx_holdings_portfolio_id` (`portfolio_id`),
  INDEX `idx_holdings_symbol` (`symbol`),
  CONSTRAINT `fk_holdings_portfolio`
    FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. Watchlists Table
CREATE TABLE IF NOT EXISTS `watchlists` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NULL, -- Prepared for future auth; NULL in single-tenant local-dev mode
  `name` VARCHAR(100) NOT NULL DEFAULT 'Primary Monitored Equities',
  `description` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_watchlists_user_id` (`user_id`)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 4. Watchlist Items Table
CREATE TABLE IF NOT EXISTS `watchlist_items` (
  `id` VARCHAR(36) PRIMARY KEY,
  `watchlist_id` VARCHAR(36) NOT NULL,
  `symbol` VARCHAR(30) NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Unique constraint prevents duplicate symbols in same watchlist
  UNIQUE KEY `uk_watchlist_symbol` (`watchlist_id`, `symbol`),
  INDEX `idx_items_watchlist_id` (`watchlist_id`),
  INDEX `idx_items_symbol` (`symbol`),
  CONSTRAINT `fk_items_watchlist`
    FOREIGN KEY (`watchlist_id`) REFERENCES `watchlists` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
