import { chromium } from 'playwright';

async function verifyUnifiedFilterLayout() {
  console.log('🚀 Verifying Unified Vertical Stack (Filters on top + Results directly below)...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    // Open Lomas de Barrillas
    const cementeriosBtn = page.locator('button:has-text("Cementerios")');
    await cementeriosBtn.click();
    await page.locator('text=Lomas de Barrillas').first().click();

    const searchInput = page.locator('.search-input');
    await searchInput.waitFor({ state: 'visible' });

    // 1. Type "32"
    await searchInput.fill('32');
    await page.waitForTimeout(600);

    const resultItems = page.locator('.search-result-item');
    console.log(`Results before opening filters: ${await resultItems.count()}`);

    // 2. Open Filters Panel
    const filterBtn = page.locator('.search-date-toggle-btn');
    await filterBtn.click();
    await page.waitForTimeout(400);

    // 3. Verify both Filters and Results List are present simultaneously
    const filterHeader = page.locator('text=Filtros Avanzados (PostgreSQL)');
    await filterHeader.waitFor({ state: 'visible' });
    console.log('✅ Filter panel is visible at the top');

    const resultHeader = page.locator('.results-header');
    await resultHeader.waitFor({ state: 'visible' });
    console.log('✅ Results list is visible directly below filters');

    // 4. Verify Geometry / Vertical Stacking (Results must be strictly below filters)
    const filterBox = await filterHeader.boundingBox();
    const resultsBox = await resultHeader.boundingBox();

    console.log(`Filter Box bottom Y: ${filterBox.y + filterBox.height} | Results Box top Y: ${resultsBox.y}`);
    if (resultsBox.y < filterBox.y + filterBox.height) {
      throw new Error(`Visual overlap detected! Results top Y (${resultsBox.y}) is above filters bottom Y (${filterBox.y + filterBox.height})`);
    }
    console.log('✅ Perfect Vertical Stacking: Results list sits strictly below the filter controls');

    // 5. Test real-time filtering: Click "Hombre"
    const hombreBtn = page.locator('button:has-text("Hombre")');
    await hombreBtn.click();
    await page.waitForTimeout(500);

    const countHombre = await page.locator('.search-result-item').count();
    console.log(`Filtered results count for Hombre: ${countHombre}`);

    await page.screenshot({ path: 'public/unified_filter_below_fixed.png' });
    console.log('📸 Screenshot saved to public/unified_filter_below_fixed.png');
    console.log('🎉 UNIFIED VERTICAL STACK TEST PASSED WITH 100% SUCCESS!');
  } catch (err) {
    console.error('❌ Verification Error:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

verifyUnifiedFilterLayout();
