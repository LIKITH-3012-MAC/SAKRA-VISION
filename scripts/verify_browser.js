import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:5173';

const ROUTES = [
  '/',
  '/dashboard',
  '/market',
  '/screener',
  '/stocks/RELIANCE',
  '/watchlist',
  '/research',
  '/portfolio',
  '/predictions',
  '/reports',
  '/settings',
];

async function main() {
  console.log('Launching headless Google Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleLogs = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.toString());
  });

  console.log(`Navigating to ${BASE_URL}...`);
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 15000 });
  } catch (e) {
    console.log('Goto completed or timeout:', e.message);
  }

  // Check title
  const title = await page.title();
  console.log('Page Title:', title);

  // Check if root has content
  const rootHtml = await page.$eval('#root', (el) => el.innerHTML).catch(() => '');
  console.log('Root HTML length:', rootHtml.length);
  if (rootHtml.length > 0) {
    console.log('First 200 chars of #root:', rootHtml.slice(0, 200));
  } else {
    console.log('WARNING: Root is empty!');
  }

  console.log('\nPage Errors caught:', pageErrors);
  console.log('\nConsole Logs count:', consoleLogs.length);
  if (pageErrors.length > 0) {
    console.log('Errors:', pageErrors);
  }
  const errorLogs = consoleLogs.filter((l) => l.type === 'error');
  if (errorLogs.length > 0) {
    console.log('Console Errors:', errorLogs);
  }

  // Capture flagship dashboard screenshot
  await page.screenshot({ path: 'dashboard-real.png', fullPage: false });
  console.log('Saved dashboard-real.png');

  // Verify all routes
  console.log('\n--- VERIFYING ALL 10 ROUTES ---');
  for (const route of ROUTES) {
    try {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await new Promise(r => setTimeout(r, 400));
      const htmlLen = await page.$eval('#root', (el) => el.innerHTML.length).catch(() => 0);
      const h1 = await page.$eval('h1', (el) => el.textContent).catch(() => 'No H1');
      console.log(`Route [${route}]: SUCCESS (HTML len: ${htmlLen}, H1: "${h1}")`);
    } catch (err) {
      console.error(`Route [${route}]: FAILED (${err.message})`);
    }
  }

  // Interactive Test 1: Global Spotlight Search
  console.log('\n--- TESTING GLOBAL SEARCH INTERACTION ---');
  try {
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0', timeout: 10000 });
    
    // Find the button with search text
    const searchBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Search equities'));
    });
    
    if (searchBtn && searchBtn.click) {
      await searchBtn.click();
      console.log('Clicked search bar trigger button');
    } else {
      await page.keyboard.down('Meta');
      await page.keyboard.press('KeyK');
      await page.keyboard.up('Meta');
      console.log('Triggered Meta+K');
    }
    await new Promise(r => setTimeout(r, 500));

    // Type query
    await page.keyboard.type('INFY');
    await new Promise(r => setTimeout(r, 500));
    console.log('Typed INFY into spotlight search');
    
    // Check if search modal appeared and has results
    const modalVisible = await page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="Search by symbol"]');
      return !!input;
    });
    console.log('Search modal visible:', modalVisible);

    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 800));
    console.log('Current URL after Enter:', page.url());
  } catch (err) {
    console.log('Search test error:', err.message);
  }

  // Interactive Test 2: Chart Timeframe Switcher
  console.log('\n--- TESTING CHART TIMEFRAME SWITCHING ---');
  try {
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0', timeout: 10000 });
    const buttonTexts = await page.$eval('button', btns => btns.map(b => b.textContent.trim()));
    const tfBtns = buttonTexts.filter(b => ['1D', '1W', '1M', '3M', '1Y'].includes(b));
    console.log('Available timeframe buttons on dashboard:', tfBtns);
    
    // Click 1W
    const clicked = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '1W');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log('Clicked 1W timeframe:', clicked);
    await new Promise(r => setTimeout(r, 500));
  } catch (err) {
    console.log('Timeframe test note:', err.message);
  }

  await browser.close();
  console.log('\nVerification complete!');
}

main().catch(console.error);
