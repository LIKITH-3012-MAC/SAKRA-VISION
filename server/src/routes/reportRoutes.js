import { Router } from 'express';

const router = Router();

router.get('/daily', (req, res) => {
  res.json({
    status: 'success',
    report: {
      id: 'rep-20261027',
      date: '2026-10-27',
      title: 'SAKRA VISION Daily Market Intelligence Dispatch',
      executiveSummary: 'Indian equities closed higher led by financial services and telecommunications.',
      indicesSummary: {
        nifty50: 25460.25,
        sensex: 83520.15,
      },
      source: 'Direct NSE Bhavcopy reconciliation',
    },
  });
});

export default router;
