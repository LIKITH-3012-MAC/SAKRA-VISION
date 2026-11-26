#!/usr/bin/env node

/**
 * SAKRA VISION — Administrative Historical Market Data Ingestion Tool
 * 
 * Usage:
 *   node src/jobs/ingestHistoricalData.js [optional_file_or_dir_path]
 *   npm run ingest:market-data
 */

import fs from 'fs';
import path from 'path';
import { ingestBhavcopyFile, getMarketDatasetOverview } from '../services/historicalDataService.js';
import { logger } from '../utils/logger.js';

async function main() {
  console.log('================================================================');
  console.log(' SAKRA VISION — Historical Market Data Ingestion Tool');
  console.log(' Dataset: tejhq/indian-markets (NSE & BSE Official Bhavcopy EOD)');
  console.log('================================================================\n');

  const targetArg = process.argv[2];
  let targetPaths = [];

  if (targetArg) {
    const resolved = path.resolve(targetArg);
    if (!fs.existsSync(resolved)) {
      console.error(`Error: Provided path does not exist: ${resolved}`);
      process.exit(1);
    }
    const stat = fs.statSync(resolved);
    if (stat.isDirectory()) {
      const files = fs.readdirSync(resolved).filter(f => f.endsWith('.csv')).map(f => path.join(resolved, f));
      targetPaths.push(...files);
    } else {
      targetPaths.push(resolved);
    }
  } else {
    // Check standard locations
    const candidateDirs = [
      path.resolve(process.cwd(), '../data/fixtures'),
      path.resolve(process.cwd(), 'data/fixtures'),
      '/Users/likithnaidu/Desktop/tej-bazaar/tests/fixtures',
    ];

    for (const d of candidateDirs) {
      if (fs.existsSync(d)) {
        const files = fs.readdirSync(d).filter(f => f.endsWith('.csv')).map(f => path.join(d, f));
        targetPaths.push(...files);
      }
    }

    // Deduplicate paths
    targetPaths = Array.from(new Set(targetPaths));
  }

  if (targetPaths.length === 0) {
    console.warn('No Bhavcopy CSV files found to ingest.');
    console.log('To ingest historical market data:');
    console.log('  1. Place Bhavcopy CSV files in "data/fixtures/"');
    console.log('  2. Or run: node src/jobs/ingestHistoricalData.js /path/to/bhavcopy.csv\n');
    console.log('Official tejhq/indian-markets repository: https://github.com/tejhq/indian-markets');
    process.exit(0);
  }

  console.log(`Found ${targetPaths.length} Bhavcopy dataset file(s) for ingestion:\n`);
  targetPaths.forEach((p, idx) => console.log(`  [${idx + 1}] ${p}`));
  console.log('\n--- Processing Ingestion Batches ---\n');

  const results = [];
  let grandTotalRead = 0;
  let grandTotalValid = 0;
  let grandTotalQuarantined = 0;

  for (const filePath of targetPaths) {
    try {
      console.log(`Ingesting: ${path.basename(filePath)}...`);
      const summary = await ingestBhavcopyFile(filePath);
      results.push(summary);
      grandTotalRead += summary.totalLinesProcessed;
      grandTotalValid += summary.validRecords;
      grandTotalQuarantined += summary.quarantinedCount;

      console.log(`  ✓ Processed ${summary.validRecords} records in ${summary.durationMs}ms (${summary.throughputRowsPerSec} rows/sec)`);
      if (summary.quarantinedCount > 0) {
        console.log(`  ⚠ Quarantined ${summary.quarantinedCount} malformed rows`);
      }
    } catch (err) {
      console.error(`  ✗ Failed to ingest ${path.basename(filePath)}: ${err.message}`);
    }
  }

  console.log('\n================================================================');
  console.log(' INGESTION SUMMARY');
  console.log('================================================================');
  console.log(` Files Processed:     ${results.length}`);
  console.log(` Total Lines Read:    ${grandTotalRead}`);
  console.log(` Valid EOD Records:   ${grandTotalValid}`);
  console.log(` Quarantined Rows:    ${grandTotalQuarantined}`);

  const overview = await getMarketDatasetOverview();
  console.log('\n Current Database/Catalog State:');
  console.log(` Total Stored Records:  ${overview.totalRecords}`);
  console.log(` Unique Symbols:        ${overview.symbolsCount}`);
  console.log(` Date Coverage:         ${overview.earliestTradeDate || 'N/A'} to ${overview.latestTradeDate || 'N/A'}`);
  console.log(` Data Mode:             ${overview.dataMode}`);
  console.log('================================================================\n');

  process.exit(0);
}

main().catch((err) => {
  logger.error('Fatal error during administrative ingestion:', { error: err.message, stack: err.stack });
  process.exit(1);
});
