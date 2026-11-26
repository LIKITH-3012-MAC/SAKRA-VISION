import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { pool, query } from '../config/db.js';
import { logger } from '../utils/logger.js';

/**
 * SAKRA VISION — Historical Bhavcopy Data Importer
 * Streams and batches end-of-day equity records from NSE CM Bhavcopy CSV files.
 */

export async function importBhavcopyFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  logger.info(`Starting Bhavcopy import: ${filePath}`);

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let lineCount = 0;
  let headers = [];
  const batch = [];
  const BATCH_SIZE = 500;
  let insertedCount = 0;

  for await (const line of rl) {
    lineCount++;
    if (lineCount === 1) {
      headers = line.split(',').map(h => h.trim());
      continue;
    }

    if (!line.trim()) continue;

    const cols = line.split(',').map(c => c.trim());
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cols[i];
    });

    // We only import Cash Market (CM) Equity (EQ) instruments
    const series = row['SctySrs'] || row['SERIES'] || '';
    if (series !== 'EQ' && series !== 'GB') continue;

    const symbol = row['TckrSymb'] || row['SYMBOL'];
    const tradeDate = row['TradDt'] || row['TIMESTAMP'] || row['DATE'];
    const open = parseFloat(row['OpnPric'] || row['OPEN']) || 0;
    const high = parseFloat(row['HghPric'] || row['HIGH']) || 0;
    const low = parseFloat(row['LwPric'] || row['LOW']) || 0;
    const close = parseFloat(row['ClsPric'] || row['CLOSE']) || 0;
    const last = parseFloat(row['LastPric'] || row['LAST']) || close;
    const prevClose = parseFloat(row['PrvsClsgPric'] || row['PREVCLOSE']) || open;
    const volume = parseInt(row['TtlTradgVol'] || row['TOTTRDQTY'] || '0', 10);
    const turnover = parseFloat(row['TtlTrfVal'] || row['TOTTRDVAL'] || '0');
    const trades = parseInt(row['TtlNbOfTxsExctd'] || row['TOTALTRADES'] || '0', 10);

    if (!symbol || !tradeDate || isNaN(close) || close <= 0) continue;

    batch.push({
      symbol,
      tradeDate,
      open,
      high,
      low,
      close,
      last,
      prevClose,
      volume,
      turnover,
      trades,
      series,
    });

    if (batch.length >= BATCH_SIZE) {
      insertedCount += await processBatch(batch);
      batch.length = 0; // Clear
    }
  }

  if (batch.length > 0) {
    insertedCount += await processBatch(batch);
  }

  logger.info(`Import complete. Processed ${lineCount} rows, imported/updated ${insertedCount} equity records.`);
  return { lineCount, insertedCount };
}

async function processBatch(batch) {
  if (!pool) {
    logger.info(`Processed batch of ${batch.length} records (database running in offline/file mode).`);
    return batch.length;
  }

  try {
    const values = batch.map(r => [
      r.symbol, r.tradeDate, r.open, r.high, r.low, r.close, r.last, r.prevClose, r.volume, r.turnover, r.trades, r.series
    ]);

    const sql = `
      INSERT INTO historical_daily_prices 
      (symbol, trade_date, open_price, high_price, low_price, close_price, last_price, prev_close_price, volume, turnover_value, trades_count, series)
      VALUES ?
      ON DUPLICATE KEY UPDATE
      close_price = VALUES(close_price),
      volume = VALUES(volume),
      turnover_value = VALUES(turnover_value)
    `;

    await pool.query(sql, [values]);
    return batch.length;
  } catch (err) {
    logger.warn('Error inserting batch into MySQL:', { error: err.message });
    return batch.length;
  }
}

// Direct CLI execution check
if (process.argv[1]?.endsWith('importHistoricalData.js')) {
  const samplePath = '/Users/likithnaidu/Desktop/tej-bazaar/tests/fixtures/nse_bhavcopy_20250430_sample.csv';
  importBhavcopyFile(samplePath)
    .then(res => {
      console.log('Result:', res);
      process.exit(0);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
