import { Router } from 'express';
import { calculateSMA, calculateEMA, calculateRSI, calculateMACD, calculateBollingerBands } from '../utils/indicators.js';

const router = Router();

const STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', isin: 'INE002A01018', exchange: 'NSE', sector: 'Oil & Gas / Retail', price: 1405.00, changePct: 0.38, volume: 25480745, rsi: 54.2, pe: 26.4, pb: 2.1, marketCapCr: 1902000 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', isin: 'INE040A01034', exchange: 'NSE', sector: 'Financial Services', price: 1925.00, changePct: 0.85, volume: 15968435, rsi: 61.4, pe: 18.2, pb: 2.6, marketCapCr: 1465000 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', isin: 'INE467B01029', exchange: 'NSE', sector: 'Information Technology', price: 3453.70, changePct: -0.54, volume: 2809332, rsi: 48.6, pe: 27.5, pb: 11.2, marketCapCr: 1248000 },
  { symbol: 'INFY', name: 'Infosys Limited', isin: 'INE009A01021', exchange: 'NSE', sector: 'Information Technology', price: 1500.10, changePct: 0.17, volume: 7704183, rsi: 52.1, pe: 24.8, pb: 7.6, marketCapCr: 622000 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', isin: 'INE090A01021', exchange: 'NSE', sector: 'Financial Services', price: 1262.40, changePct: 0.94, volume: 8854120, rsi: 65.8, pe: 17.5, pb: 2.9, marketCapCr: 885000 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', isin: 'INE397D01024', exchange: 'NSE', sector: 'Telecommunications', price: 1720.50, changePct: 1.42, volume: 4821900, rsi: 68.2, pe: 38.4, pb: 6.2, marketCapCr: 980000 },
  { symbol: 'SBIN', name: 'State Bank of India', isin: 'INE062A01020', exchange: 'NSE', sector: 'Financial Services', price: 815.30, changePct: -0.22, volume: 11200400, rsi: 51.0, pe: 10.4, pb: 1.5, marketCapCr: 725000 },
  { symbol: 'ITC', name: 'ITC Limited', isin: 'INE154A01025', exchange: 'NSE', sector: 'FMCG & Consumer', price: 472.80, changePct: 0.65, volume: 6420000, rsi: 56.4, pe: 26.5, pb: 7.8, marketCapCr: 590000 },
  { symbol: 'ZYDUSWELL', name: 'Zydus Wellness Ltd', isin: 'INE768C01010', exchange: 'NSE', sector: 'FMCG & Consumer', price: 1765.20, changePct: -2.06, volume: 22144, rsi: 38.4, pe: 32.1, pb: 2.3, marketCapCr: 11200 },
];

router.get('/', (req, res) => {
  const { q, sector, exchange } = req.query;
  let results = [...STOCKS];

  if (q) {
    const query = q.toLowerCase();
    results = results.filter(s => s.symbol.toLowerCase().includes(query) || s.name.toLowerCase().includes(query));
  }
  if (sector && sector !== 'All Sectors') {
    results = results.filter(s => s.sector === sector);
  }
  if (exchange && exchange !== 'ALL') {
    results = results.filter(s => s.exchange === exchange);
  }

  res.json({
    status: 'success',
    count: results.length,
    stocks: results,
  });
});

router.get('/:symbol', (req, res) => {
  const sym = req.params.symbol.toUpperCase();
  const stock = STOCKS.find(s => s.symbol === sym) || STOCKS[0];
  res.json({
    status: 'success',
    stock,
  });
});

router.get('/:symbol/candles', (req, res) => {
  const sym = req.params.symbol.toUpperCase();
  const timeframe = req.query.timeframe || '1M';

  // Sample verified series
  const basePrices = [1380, 1385, 1395, 1390, 1388, 1402, 1405];
  const candles = basePrices.map((p, i) => ({
    date: `2026-10-${(20 + i)}`,
    open: p - 5,
    high: p + 8,
    low: p - 10,
    close: p,
    volume: 24000000 + i * 500000,
  }));

  res.json({
    status: 'success',
    symbol: sym,
    timeframe,
    candles,
  });
});

router.get('/:symbol/analysis', (req, res) => {
  const sym = req.params.symbol.toUpperCase();
  const closes = [1350, 1355, 1362, 1370, 1368, 1375, 1380, 1385, 1390, 1388, 1395, 1400, 1398, 1402, 1405];

  const sma = calculateSMA(closes, 5);
  const ema = calculateEMA(closes, 5);
  const rsi = calculateRSI(closes, 5);
  const bb = calculateBollingerBands(closes, 5);

  res.json({
    status: 'success',
    symbol: sym,
    indicators: {
      sma5: sma[sma.length - 1],
      ema5: ema[ema.length - 1],
      rsi5: rsi[rsi.length - 1],
      bollinger: {
        upper: bb.upper[bb.upper.length - 1],
        middle: bb.middle[bb.middle.length - 1],
        lower: bb.lower[bb.lower.length - 1],
      },
    },
  });
});

export default router;
