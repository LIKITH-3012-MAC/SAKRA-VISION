import { describe, it, expect } from 'vitest';
import path from 'path';
import fs from 'fs';
import {
  parseTradeDate,
  parsePrice,
  parseInteger,
  detectColumnMapping,
  normalizeRecord,
  ingestBhavcopyFile,
  IN_MEMORY_EOD_STORE,
} from '../src/services/historicalDataService.js';

describe('Historical Market Data Ingestion Pipeline', () => {
  describe('Date Parsing', () => {
    it('parses standard ISO YYYY-MM-DD dates correctly', () => {
      expect(parseTradeDate('2025-04-30')).toBe('2025-04-30');
      expect(parseTradeDate('2010-01-04')).toBe('2010-01-04');
    });

    it('parses legacy NSE DD-MMM-YYYY dates correctly', () => {
      expect(parseTradeDate('30-APR-2025')).toBe('2025-04-30');
      expect(parseTradeDate('04-JAN-2010')).toBe('2010-01-04');
      expect(parseTradeDate('15-OCT-2024')).toBe('2024-10-15');
    });

    it('rejects invalid or corrupted date formats', () => {
      expect(parseTradeDate('')).toBeNull();
      expect(parseTradeDate(null)).toBeNull();
      expect(parseTradeDate('INVALID_DATE')).toBeNull();
      expect(parseTradeDate('1900-99-99')).toBeNull();
    });
  });

  describe('Numeric & Price Parsing', () => {
    it('parses clean and comma-separated numbers safely', () => {
      expect(parsePrice('1405.00')).toBe(1405.00);
      expect(parsePrice('1,405.50')).toBe(1405.50);
      expect(parsePrice('35,797,220,282.00')).toBe(35797220282.00);
      expect(parsePrice(null, 10)).toBe(10);
      expect(parsePrice('INVALID', 0)).toBe(0);
    });

    it('parses integer volumes and trade counts safely', () => {
      expect(parseInteger('25480745')).toBe(25480745);
      expect(parseInteger('1,500,000')).toBe(1500000);
      expect(parseInteger('', 0)).toBe(0);
    });
  });

  describe('Schema Auto-Detection', () => {
    it('detects modern SEBI CMTS headers', () => {
      const headers = ['TradDt', 'TckrSymb', 'SctySrs', 'ISIN', 'FinInstrmNm', 'OpnPric', 'ClsPric'];
      const mapping = detectColumnMapping(headers);
      expect(mapping).toBeDefined();
      expect(mapping.type).toBe('SEBI_CMTS');
      expect(mapping.symbol).toBe('TckrSymb');
      expect(mapping.close).toBe('ClsPric');
    });

    it('detects legacy NSE headers', () => {
      const headers = ['SYMBOL', 'SERIES', 'OPEN', 'HIGH', 'LOW', 'CLOSE', 'TIMESTAMP'];
      const mapping = detectColumnMapping(headers);
      expect(mapping).toBeDefined();
      expect(mapping.type).toBe('LEGACY_NSE');
      expect(mapping.symbol).toBe('SYMBOL');
      expect(mapping.date).toBe('TIMESTAMP');
    });

    it('returns null for unrecognized headers', () => {
      const headers = ['FOO', 'BAR', 'BAZ'];
      expect(detectColumnMapping(headers)).toBeNull();
    });
  });

  describe('Row Normalization & Quarantining', () => {
    const mapping = {
      type: 'SEBI_CMTS',
      symbol: 'TckrSymb',
      date: 'TradDt',
      series: 'SctySrs',
      isin: 'ISIN',
      name: 'FinInstrmNm',
      open: 'OpnPric',
      high: 'HghPric',
      low: 'LwPric',
      close: 'ClsPric',
      last: 'LastPric',
      prevClose: 'PrvsClsgPric',
      volume: 'TtlTradgVol',
      turnover: 'TtlTrfVal',
      trades: 'TtlNbOfTxsExctd',
    };

    it('successfully normalizes a valid row', () => {
      const raw = {
        TckrSymb: 'RELIANCE',
        TradDt: '2025-04-30',
        SctySrs: 'EQ',
        ISIN: 'INE002A01018',
        FinInstrmNm: 'RELIANCE INDUSTRIES LTD',
        OpnPric: '1402.00',
        HghPric: '1412.40',
        LwPric: '1369.00',
        ClsPric: '1405.00',
        LastPric: '1395.00',
        PrvsClsgPric: '1399.70',
        TtlTradgVol: '25480745',
        TtlTrfVal: '35797220282.00',
        TtlNbOfTxsExctd: '598769',
      };

      const result = normalizeRecord(raw, mapping, 1);
      expect(result.valid).toBe(true);
      expect(result.record.symbol).toBe('RELIANCE');
      expect(result.record.tradeDate).toBe('2025-04-30');
      expect(result.record.closePrice).toBe(1405.00);
      expect(result.record.volume).toBe(25480745);
    });

    it('quarantines row when symbol is missing', () => {
      const raw = { TckrSymb: '', TradDt: '2025-04-30', ClsPric: '1405.00' };
      const result = normalizeRecord(raw, mapping, 2);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('MISSING_SYMBOL');
    });

    it('quarantines row when date is corrupt', () => {
      const raw = { TckrSymb: 'RELIANCE', TradDt: 'NOT_A_DATE', ClsPric: '1405.00' };
      const result = normalizeRecord(raw, mapping, 3);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('INVALID_DATE');
    });

    it('quarantines row when close price is zero or negative', () => {
      const raw = { TckrSymb: 'RELIANCE', TradDt: '2025-04-30', ClsPric: '-5.00' };
      const result = normalizeRecord(raw, mapping, 4);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('INVALID_CLOSE_PRICE');
    });
  });

  describe('Streaming Batch Ingestion & Restart Safety', () => {
    it('ingests fixture file safely without memory spikes', async () => {
      const fixturePath = path.resolve('tests/fixtures/sample_ingest.csv');
      fs.mkdirSync(path.dirname(fixturePath), { recursive: true });

      const testCsv = [
        'TradDt,BizDt,Sgmt,Src,FinInstrmTp,FinInstrmId,ISIN,TckrSymb,SctySrs,XpryDt,FininstrmActlXpryDt,StrkPric,OptnTp,FinInstrmNm,OpnPric,HghPric,LwPric,ClsPric,LastPric,PrvsClsgPric,UndrlygPric,SttlmPric,OpnIntrst,ChngInOpnIntrst,TtlTradgVol,TtlTrfVal,TtlNbOfTxsExctd,SsnId,NewBrdLotQty,Rmks,Rsvd1,Rsvd2,Rsvd3,Rsvd4',
        '2025-04-30,2025-04-30,CM,NSE,STK,1333,INE040A01034,HDFCBANK,EQ,,,,,HDFC BANK LTD,1913.00,1936.90,1910.30,1925.00,1920.10,1908.80,,1925.00,,,15968435,30739492241.20,275126,F1,1,,,,,',
        '2025-04-30,2025-04-30,CM,NSE,STK,2885,INE002A01018,RELIANCE,EQ,,,,,RELIANCE INDUSTRIES LTD,1402.00,1412.40,1369.00,1405.00,1395.00,1399.70,,1405.40,,,25480745,35797220282.00,598769,F1,1,,,,,',
        // Malformed row for quarantine testing: missing symbol
        '2025-04-30,2025-04-30,CM,NSE,STK,9999,INE000000000,,EQ,,,,,CORRUPT CORP,100.00,105.00,95.00,102.00,102.00,100.00,,102.00,,,1000,102000.00,10,F1,1,,,,,',
      ].join('\n');

      fs.writeFileSync(fixturePath, testCsv);

      const summary = await ingestBhavcopyFile(fixturePath, { batchSize: 2 });
      expect(summary.validRecords).toBe(2);
      expect(summary.quarantinedCount).toBe(1);
      expect(summary.schemaDetected).toBe('SEBI_CMTS');

      // Re-run to test restart safety / deterministic deduplication
      const replaySummary = await ingestBhavcopyFile(fixturePath, { batchSize: 2 });
      expect(replaySummary.validRecords).toBe(2);
      expect(replaySummary.quarantinedCount).toBe(1);

      // Clean up
      fs.unlinkSync(fixturePath);
    });
  });
});
