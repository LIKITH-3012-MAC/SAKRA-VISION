import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORTFOLIO_URL = 'http://localhost:5173/portfolio';
const WATCHLIST_URL = 'http://localhost:5173/watchlist';

async function verifyPortfolioAndWatchlists() {
  console.log('--- LAUNCHING HEADLESS CHROME FOR PHASE 6 VERIFICATION ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });

  const pageErrors = [];
  const consoleLogs = [];

  page.on('pageerror', (err) => pageErrors.push(err.toString()));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleLogs.push(msg.text());
  });

  // ==========================================
  // 1. VERIFY PORTFOLIO PAGE
  // ==========================================
  console.log(`\nNavigating to ${PORTFOLIO_URL}...`);
  await page.goto(PORTFOLIO_URL, { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1200));

  const portfolioH1 = await page.$eval('h1', el => el.textContent.trim()).catch(() => 'No H1');
  console.log(`Portfolio H1: "${portfolioH1}"`);

  // Verify metric cards (case-insensitive)
  const portfolioMetrics = await page.evaluate(() => {
    const text = document.body.innerText.toLowerCase();
    return {
      hasMarketValue: text.includes('current portfolio value'),
      hasInvestedCost: text.includes('total invested cost'),
      hasUnrealizedPL: text.includes('net unrealized p&l'),
      hasCoverage: text.includes('valuation coverage'),
      hasLocalDevNotice: text.includes('local development mode'),
      hasTable: Boolean(document.querySelector('table')),
      hasAllocationChart: text.includes('asset allocation by symbol'),
    };
  });
  console.log('Portfolio Metrics & Components:', portfolioMetrics);

  // Test Adding a Position via Modal
  console.log('\nTesting "Add Equity Position" flow...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Add Equity Position'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Type into modal fields
  await page.type('input[placeholder*="RELIANCE"]', 'TATAMOTORS');
  await page.type('input[placeholder="e.g. 50"]', '50');
  await page.type('input[placeholder="e.g. 2850.00"]', '950.00');
  await new Promise(r => setTimeout(r, 400));

  // Click Save Holding
  await page.evaluate(() => {
    const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Save Holding'));
    if (saveBtn) saveBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // Verify TATAMOTORS position is now in the table
  const positionAdded = await page.evaluate(() => {
    return document.body.innerText.includes('TATAMOTORS');
  });
  console.log('TATAMOTORS position successfully visible in portfolio table:', positionAdded);

  // Test Deleting the TATAMOTORS Position
  console.log('\nTesting position removal confirmation flow...');
  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr'));
    const tataRow = rows.find(r => r.innerText.includes('TATAMOTORS'));
    if (tataRow) {
      const delBtn = tataRow.querySelector('button[title*="Delete"]');
      if (delBtn) delBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 600));

  // Confirm removal in dialog
  await page.evaluate(() => {
    const confirmBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Confirm Remove'));
    if (confirmBtn) confirmBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  const positionRemoved = await page.evaluate(() => {
    return !document.body.innerText.includes('TATAMOTORS');
  });
  console.log('TATAMOTORS position successfully removed from table:', positionRemoved);

  await page.screenshot({ path: 'portfolio-real.png', fullPage: false });
  console.log('Saved portfolio-real.png');

  // ==========================================
  // 2. VERIFY WATCHLIST PAGE
  // ==========================================
  console.log(`\nNavigating to ${WATCHLIST_URL}...`);
  await page.goto(WATCHLIST_URL, { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1200));

  const watchlistH1 = await page.$eval('h1', el => el.textContent.trim()).catch(() => 'No H1');
  console.log(`Watchlist H1: "${watchlistH1}"`);

  const watchlistVerification = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      hasHeader: text.includes('Curated Indian Equities Watchlist'),
      hasTable: Boolean(document.querySelector('table')),
      hasReliance: text.includes('RELIANCE'),
      hasHdfc: text.includes('HDFCBANK'),
      hasTradeDate: Boolean(document.querySelector('tbody tr')),
    };
  });
  console.log('Watchlist Components & Data:', watchlistVerification);

  // Test Search/Filter
  await page.type('input[placeholder*="Filter watchlist"]', 'RELIANCE');
  await new Promise(r => setTimeout(r, 400));
  const filteredCount = await page.evaluate(() => {
    return document.querySelectorAll('tbody tr').length;
  });
  console.log('Filtered watchlist item count for "RELIANCE":', filteredCount);

  await page.screenshot({ path: 'watchlist-real.png', fullPage: false });
  console.log('Saved watchlist-real.png');

  // Summary
  console.log('\n--- BROWSER RUNTIME HEALTH SUMMARY ---');
  console.log(`Page Errors: ${pageErrors.length}`);
  if (pageErrors.length > 0) console.error('Errors:', pageErrors);
  console.log(`Console Errors: ${consoleLogs.length}`);
  if (consoleLogs.length > 0) console.error('Console Errors:', consoleLogs);

  await browser.close();
  console.log('\n--- PHASE 6 BROWSER VERIFICATION COMPLETE ---');
}

verifyPortfolioAndWatchlists().catch(console.error);
