import { chromium } from 'playwright';

async function verifyFilterOverlap() {
  console.log('🚀 Verifying Filter Popover & Dropdown Non-Overlapping with Playwright...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    // Open Lomas de Barrillas
    const cementeriosBtn = page.locator('button:has-text("Cementerios")');
    await cementeriosBtn.click();
    await page.locator('text=Lomas de Barrillas').first().click();

    // Click Filter button to open popover
    const filterBtn = page.locator('.search-date-toggle-btn');
    await filterBtn.click();
    await page.waitForTimeout(300);

    // Verify filter popover is visible
    const popover = page.locator('.search-date-popover');
    if (!(await popover.isVisible())) {
      throw new Error('Filter popover failed to open');
    }
    console.log('✅ Filter popover is visible');

    // Verify results dropdown is NOT visible simultaneously
    const dropdownWhileFilterOpen = page.locator('.search-results-dropdown');
    const isDropdownVisible = await dropdownWhileFilterOpen.isVisible();
    if (isDropdownVisible) {
      throw new Error('Search results dropdown should NOT be visible while filter popover is open!');
    }
    console.log('✅ No collision: Search results dropdown is hidden while configuring filters');

    // Click S/I filter button
    const siBtn = popover.locator('button:has-text("S/I")');
    await siBtn.click();
    await page.waitForTimeout(300);

    // Verify action button text
    const applyBtn = popover.locator('button:has-text("Ver")');
    const applyBtnText = await applyBtn.textContent();
    console.log(`Apply button text: "${applyBtnText}"`);

    // Click apply button
    await applyBtn.click();
    await page.waitForTimeout(600);

    const isPopoverClosed = !(await popover.isVisible());
    const dropdown = page.locator('.search-results-dropdown');
    await dropdown.waitFor({ state: 'visible', timeout: 3000 });
    const isDropdownNowOpen = await dropdown.isVisible();

    if (!isPopoverClosed) {
      throw new Error('Filter popover should close after clicking apply');
    }
    if (!isDropdownNowOpen) {
      throw new Error('Search results dropdown should open cleanly after clicking apply');
    }

    console.log('✅ Filter popover closed and results dropdown displayed cleanly without any overlap');
    await page.screenshot({ path: 'public/filter_overlap_fixed.png' });
    console.log('📸 Screenshot saved to public/filter_overlap_fixed.png');
    console.log('🎉 ALL OVERLAP CHECKS PASSED!');
  } catch (err) {
    console.error('❌ Verification Error:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

verifyFilterOverlap();
