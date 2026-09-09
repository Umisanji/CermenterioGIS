import { chromium } from 'playwright';

async function verify325Search() {
  console.log('🚀 Verifying "325" Search with Playwright...');
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

    // Search for "325"
    await searchInput.fill('325');
    await page.waitForTimeout(600);

    const resultItems = page.locator('.search-result-item');
    const count = await resultItems.count();
    console.log(`Results count for "325": ${count}`);

    for (let i = 0; i < count; i++) {
      const title = await resultItems.nth(i).locator('.result-title').textContent();
      const subtitle = await resultItems.nth(i).locator('.result-subtitle').textContent();
      console.log(`[${i + 1}] Title: "${title}" | Subtitle: "${subtitle}"`);
      if (title.startsWith('Lote #')) {
        throw new Error(`Found empty lot in search results: ${title}`);
      }
    }

    if (count !== 4) {
      throw new Error(`Expected exactly 4 deceased results for "325", but got ${count}`);
    }

    console.log('✅ All 4 results are valid deceased persons in lotes 3252 / 3254! No empty lots found.');
    console.log('🎉 VERIFICATION SUCCESSFUL!');
  } catch (err) {
    console.error('❌ Verification Error:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

verify325Search();
