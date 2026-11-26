import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:5173';

async function testInteractions() {
  console.log('Testing deep interactions in Headless Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const errors = [];
  page.on('pageerror', err => errors.push(err.toString()));

  // 1. Screener sorting & filtering
  console.log('\n--- 1. Testing Screener Filters & Sorting ---');
  await page.goto(`${BASE_URL}/screener`, { waitUntil: 'networkidle0' });
  
  // Test search filter
  await page.type('input[placeholder*="Search symbol"]', 'TCS');
  await new Promise(r => setTimeout(r, 400));
  const rowCountAfterSearch = await page.$eval('tbody tr', rows => rows.length);
  const rowText = await page.$eval('tbody tr', el => el.textContent).catch(() => '');
  console.log(`Screener filter for "TCS" returned ${rowCountAfterSearch} row(s). Contains TCS: ${rowText.includes('TCS')}`);

  // Clear search and test sorting
  await page.evaluate(() => {
    const input = document.querySelector('input[placeholder*="Search symbol"]');
    if (input) {
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 300));

  // Click Price column header to sort
  const sorted = await page.evaluate(() => {
    const th = Array.from(document.querySelectorAll('th')).find(h => h.textContent.includes('Price'));
    if (th) {
      th.click();
      return true;
    }
    return false;
  });
  console.log(`Clicked Price header to sort: ${sorted}`);
  await new Promise(r => setTimeout(r, 400));

  // 2. Watchlist Toggle Action
  console.log('\n--- 2. Testing Watchlist Add/Remove Action ---');
  await page.goto(`${BASE_URL}/stocks/TCS`, { waitUntil: 'networkidle0' });
  const initialWatchlistBtnText = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Watchlist'));
    return btn ? btn.textContent.trim() : null;
  });
  console.log('Initial watchlist button text on /stocks/TCS:', initialWatchlistBtnText);

  // Click watchlist button
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Watchlist'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  const updatedWatchlistBtnText = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Watchlist'));
    return btn ? btn.textContent.trim() : null;
  });
  console.log('Updated watchlist button text on /stocks/TCS:', updatedWatchlistBtnText);

  // Verify in /watchlist page
  await page.goto(`${BASE_URL}/watchlist`, { waitUntil: 'networkidle0' });
  const hasTCSInWatchlist = await page.evaluate(() => {
    return document.body.textContent.includes('Tata Consultancy Services');
  });
  console.log('Watchlist page displays TCS:', hasTCSInWatchlist);

  // 3. Portfolio Add Position Form
  console.log('\n--- 3. Testing Portfolio Add Position Form ---');
  await page.goto(`${BASE_URL}/portfolio`, { waitUntil: 'networkidle0' });
  
  // Click Add Equity Position button
  const addBtnClicked = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Add Equity Position'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked "Add Equity Position" button:', addBtnClicked);
  await new Promise(r => setTimeout(r, 400));

  // Check form modal rendered
  const modalVisible = await page.evaluate(() => {
    const heading = Array.from(document.querySelectorAll('h3, h4')).find(h => h.textContent.includes('Record New Holding') || h.textContent.includes('Holding'));
    return !!heading;
  });
  console.log('Transaction form modal visible:', modalVisible);

  // Fill in form fields and submit
  if (modalVisible) {
    await page.type('input[placeholder="e.g. INFY"]', 'TATAMOTORS');
    await page.type('input[placeholder="e.g. 50"]', '25');
    await page.type('input[placeholder="e.g. 1450.00"]', '980.50');
    
    // Click submit button in form
    await page.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll('button[type="submit"]')).find(b => b.textContent.includes('Save') || b.textContent.includes('Record'));
      if (submitBtn) submitBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Verify TATAMOTORS is now in the portfolio holdings table
    const hasTataInPortfolio = await page.evaluate(() => {
      return document.body.textContent.includes('TATAMOTORS');
    });
    console.log('Portfolio table updated with TATAMOTORS position:', hasTataInPortfolio);
  }

  // 4. Verification of Data Mode Badge
  console.log('\n--- 4. Checking Data Mode Badge and Demo Disclaimers ---');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
  const demoBadges = await page.evaluate(() => {
    const badges = Array.from(document.querySelectorAll('*')).filter(el => {
      const t = el.textContent.trim();
      return t === 'DEMO' || t.includes('DEMO DATA') || t.includes('DEMONSTRATION');
    });
    return badges.length;
  });
  console.log(`Count of visible DEMO labels/badges on Dashboard: ${demoBadges}`);

  // 5. Check Brand Logo
  console.log('\n--- 5. Checking Brand Logo Rendering ---');
  const logoSrc = await page.evaluate(() => {
    const img = document.querySelector('aside img');
    return img ? img.getAttribute('src') : null;
  });
  console.log('Sidebar Brand Logo src:', logoSrc);

  console.log('\nTotal Page Errors during test:', errors.length);
  if (errors.length > 0) {
    console.log('Errors:', errors);
  }

  await browser.close();
  console.log('\nAll interaction tests completed successfully!');
}

testInteractions().catch(console.error);
