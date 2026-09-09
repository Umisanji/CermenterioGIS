import { chromium } from 'playwright';

async function runSearchVerification() {
  console.log('🚀 Starting Playwright Search Verification Test...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  try {
    console.log('1. Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    // Open the Cementerios dropdown in the Navbar
    console.log('2. Clicking "Cementerios" in Navbar...');
    const cementeriosBtn = page.locator('button:has-text("Cementerios")');
    await cementeriosBtn.waitFor({ state: 'visible', timeout: 5000 });
    await cementeriosBtn.click();

    // Select "Lomas de Barrillas"
    console.log('3. Selecting "Lomas de Barrillas"...');
    const barrillasOption = page.locator('text=Lomas de Barrillas').first();
    await barrillasOption.waitFor({ state: 'visible', timeout: 5000 });
    await barrillasOption.click();

    // Wait for the search bar input on the map viewer
    const searchInput = page.locator('.search-input');
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ Search input found on GIS Map Viewer.');

    // TEST 1: Single name "JUAN"
    console.log('4. Testing search for "JUAN"...');
    await searchInput.fill('');
    await searchInput.fill('JUAN');
    await page.waitForTimeout(600); // Debounce / fetch wait

    const dropdown = page.locator('.search-results-dropdown');
    await dropdown.waitFor({ state: 'visible', timeout: 5000 });

    const resultItems = page.locator('.search-result-item');
    const count1 = await resultItems.count();
    console.log(`Found ${count1} result(s) for "JUAN"`);

    if (count1 !== 1) {
      throw new Error(`Expected exactly 1 result for "JUAN", but got ${count1}`);
    }

    const titleText1 = await resultItems.first().locator('.result-title').textContent();
    const subtitleText1 = await resultItems.first().locator('.result-subtitle').textContent();
    console.log(`✅ Result 1 Title: "${titleText1.trim()}"`);
    console.log(`✅ Result 1 Subtitle: "${subtitleText1.trim()}"`);

    // Verify clean subtitle format
    if (!subtitleText1.includes('Lote #3462') || !subtitleText1.includes('Sección')) {
      throw new Error(`Subtitle does not match expected clean format: ${subtitleText1}`);
    }

    // TEST 2: Full name "JUAN PEREZ" (multi-word with space)
    console.log('5. Testing full name search for "JUAN PEREZ"...');
    await searchInput.fill('JUAN PEREZ');
    await page.waitForTimeout(600);

    const count2 = await resultItems.count();
    console.log(`Found ${count2} result(s) for "JUAN PEREZ"`);

    if (count2 !== 1) {
      throw new Error(`Expected exactly 1 result for "JUAN PEREZ", but got ${count2}`);
    }
    console.log('✅ Full name multi-word search succeeded.');

    // TEST 3: Multi-word name "MIGUEL ANGEL"
    console.log('6. Testing full name search for "MIGUEL ANGEL"...');
    await searchInput.fill('MIGUEL ANGEL');
    await page.waitForTimeout(600);

    const count3 = await resultItems.count();
    console.log(`Found ${count3} result(s) for "MIGUEL ANGEL"`);

    if (count3 !== 1) {
      throw new Error(`Expected exactly 1 result for "MIGUEL ANGEL", but got ${count3}`);
    }

    const titleText3 = await resultItems.first().locator('.result-title').textContent();
    const subtitleText3 = await resultItems.first().locator('.result-subtitle').textContent();
    console.log(`✅ Result 3 Title: "${titleText3.trim()}" | Subtitle: "${subtitleText3.trim()}"`);

    // TEST 4: Click result and verify Drawer opens
    console.log('7. Clicking search result to verify Drawer opens...');
    await resultItems.first().click();
    await page.waitForTimeout(800);

    const drawer = page.locator('.tumba-drawer-block');
    await drawer.waitFor({ state: 'visible', timeout: 5000 });
    const drawerTitle = await drawer.locator('h2').textContent();
    console.log(`✅ Drawer opened with header: "${drawerTitle.trim()}"`);

    // Take screenshot for visual verification
    await page.screenshot({ path: 'public/search_verification_screenshot.png' });
    console.log('📸 Screenshot saved to public/search_verification_screenshot.png');

    console.log('🎉 ALL PLAYWRIGHT SEARCH VERIFICATION TESTS PASSED 100%!');
  } catch (err) {
    console.error('❌ Playwright Test Error:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runSearchVerification();
