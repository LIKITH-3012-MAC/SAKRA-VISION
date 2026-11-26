import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:5173/predictions';

async function testPredictionLab() {
  console.log('--- LAUNCHING HEADLESS CHROME FOR PREDICTION LAB ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100 });

  const consoleLogs = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.toString());
  });

  console.log(`Navigating to ${BASE_URL}...`);
  await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Verify Page Title & Headings
  const title = await page.title();
  const h1 = await page.$eval('h1', el => el.textContent.trim()).catch(() => 'No H1');
  console.log(`Page Title: "${title}"`);
  console.log(`Main Heading (H1): "${h1}"`);

  // 2. Check presence of Brand / Model badge & Notice
  const noticeFound = await page.evaluate(() => {
    return document.body.innerText.includes('Statistical Transparency & Algorithmic Notice:');
  });
  console.log(`Algorithmic Limitations Notice Visible: ${noticeFound}`);

  // 3. Test Horizon Switcher (Click 1 Session)
  console.log('\n--- TESTING HORIZON SWITCHING ---');
  const clicked1Day = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('1 Session'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked "1 Session" button:', clicked1Day);
  await new Promise(r => setTimeout(r, 800));

  // 4. Test Model Selector (Click "Exponential Smoothing" button)
  console.log('\n--- TESTING MODEL BUTTONS ---');
  const clickedModel = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Exponential Smoothing'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked "Exponential Smoothing" button:', clickedModel);
  await new Promise(r => setTimeout(r, 800));

  // 5. Test Switching Stock (Click "INFY")
  console.log('\n--- TESTING STOCK SWITCHING ---');
  const clickedStock = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.trim() === 'INFY');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked "INFY" stock pill:', clickedStock);
  await new Promise(r => setTimeout(r, 800));

  // 6. Switch back to RELIANCE with Horizon 1 and Trend model to view full backtest results table
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const relBtn = btns.find(b => b.textContent.trim() === 'RELIANCE');
    if (relBtn) relBtn.click();
    const trendBtn = btns.find(b => b.textContent.includes('Linear Drift'));
    if (trendBtn) trendBtn.click();
    const h1Btn = btns.find(b => b.textContent.includes('1 Session'));
    if (h1Btn) h1Btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // 7. Verify Backtest Metrics and Evaluation Windows in DOM
  const backtestVerification = await page.evaluate(() => {
    const text = document.body.innerText;
    const hasMae = text.includes('Mean Absolute Error (MAE)');
    const hasRmse = text.includes('Root Mean Squared Error (RMSE)');
    const hasDirAcc = text.includes('Directional Accuracy (%)');
    const hasMape = text.includes('Mean Absolute % Error (MAPE)');
    const hasWindowsTable = text.includes('Walk-Forward Evaluation Windows Sample:');
    const hasBeatsNaive = text.includes('Baseline Outperformance') || text.includes('vs Naive Baseline');
    return { hasMae, hasRmse, hasDirAcc, hasMape, hasWindowsTable, hasBeatsNaive };
  });
  console.log('Backtest Detail Verification:', backtestVerification);

  // 8. Capture Screenshot
  await page.screenshot({ path: 'prediction-lab-real.png', fullPage: false });
  console.log('Saved prediction-lab-real.png');

  // 9. Error Summary
  console.log('\n--- RUNTIME HEALTH CHECK ---');
  console.log(`Page Errors: ${pageErrors.length}`);
  if (pageErrors.length > 0) {
    console.error('Errors:', pageErrors);
  }
  const errorLogs = consoleLogs.filter(l => l.type === 'error');
  console.log(`Console Errors: ${errorLogs.length}`);
  if (errorLogs.length > 0) {
    console.error('Console error details:', errorLogs);
  }

  await browser.close();
  console.log('\n--- PREDICTION LAB BROWSER VERIFICATION COMPLETE ---');
}

testPredictionLab().catch(console.error);
