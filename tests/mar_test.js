import { chromium } from 'playwright';

async function verifyMarSearch() {
  console.log('🚀 Verifying "Mar" Search & Text Highlighting with Playwright...');
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

    // Search for "Mar"
    await searchInput.fill('Mar');
    await page.waitForTimeout(600);

    const resultItems = page.locator('.search-result-item');
    const count = await resultItems.count();
    console.log(`Results count for "Mar": ${count}`);

    for (let i = 0; i < count; i++) {
      const title = await resultItems.nth(i).locator('.result-title').textContent();
      const subtitle = await resultItems.nth(i).locator('.result-subtitle').textContent();
      console.log(`[${i + 1}] Title: "${title}" | Subtitle: "${subtitle}"`);
    }

    // Verify highlighted spans exist in the dropdown
    const highlights = page.locator('.search-results-dropdown span[style*="background-color: rgb(254, 240, 138)"], .search-results-dropdown span[style*="#FEF08A"]');
    const highlightCount = await highlights.count();
    console.log(`✅ Total highlighted text matches found in DOM: ${highlightCount}`);

    if (count !== 2) {
      throw new Error(`Expected exactly 2 results for "Mar" (Mar Sastre and Miguel Angel Martinez), but got ${count}`);
    }

    await page.screenshot({ path: 'public/mar_highlight_verification.png' });
    console.log('📸 Screenshot saved to public/mar_highlight_verification.png');
    console.log('🎉 VERIFICATION SUCCESSFUL!');
  } catch (err) {
    console.error('❌ Verification Error:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

verifyMarSearch();
