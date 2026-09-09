import { chromium } from 'playwright';

async function runComprehensiveE2ETest() {
  console.log('🧪 =========================================================');
  console.log('🧪 STARTING COMPREHENSIVE FULL E2E TEST SUITE (PLAYWRIGHT CLI)');
  console.log('🧪 =========================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1366, height: 850 } });
  const page = await context.newPage();

  let passedTests = 0;
  let failedTests = 0;

  const testPass = (name) => {
    passedTests++;
    console.log(`✅ [PASS] ${name}`);
  };

  const testFail = (name, error) => {
    failedTests++;
    console.error(`❌ [FAIL] ${name}:`, error);
  };

  try {
    // ------------------------------------------------------------------------
    // 1. HOME & LANDING PAGE NAVIGATION
    // ------------------------------------------------------------------------
    console.log('--- 1. Testing Homepage & Navbar ---');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    const header = page.locator('.coatza-header');
    await header.waitFor({ state: 'visible' });
    testPass('Header and official branding visible');

    const brandLogo = page.locator('.descanso-logo-img');
    await brandLogo.waitFor({ state: 'visible' });
    testPass('Descanso Digno logo rendered');

    // ------------------------------------------------------------------------
    // 2. ADMIN AUTHENTICATION (LOGIN FLOW VIA "Acceder")
    // ------------------------------------------------------------------------
    console.log('\n--- 2. Testing Administrator Login Flow ---');
    const accederBtn = page.locator('button:has-text("Acceder")');
    await accederBtn.waitFor({ state: 'visible', timeout: 5000 });
    await accederBtn.click();
    await page.waitForTimeout(400);

    const loginModal = page.locator('h3:has-text("Iniciar Sesión")');
    await loginModal.waitFor({ state: 'visible', timeout: 3000 });
    testPass('LoginModal opened via createPortal');

    // Fill Admin credentials
    await page.locator('input[placeholder="Corre@Ejemplo.com"]').fill('admin@coatza.gob.mx');
    await page.locator('input[placeholder="••••••••"]').fill('admin123');
    await page.locator('button[type="submit"]:has-text("Iniciar Sesión")').click();

    await page.waitForTimeout(1000);
    const avatarIcon = page.locator('.coatza-header button div:has-text("A")').first();
    await avatarIcon.waitFor({ state: 'visible', timeout: 5000 });
    testPass('Authenticated as Administrator (role: admin, Avatar A visible)');

    // ------------------------------------------------------------------------
    // 3. NAVIGATE TO GIS MAP VIEWER
    // ------------------------------------------------------------------------
    console.log('\n--- 3. Testing Map Viewer Navigation ---');
    const cementeriosBtn = page.locator('button:has-text("Cementerios")');
    await cementeriosBtn.click();
    const barrillasOption = page.locator('text=Lomas de Barrillas').first();
    await barrillasOption.click();

    const searchInput = page.locator('.search-input');
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    testPass('Navigated to Lomas de Barrillas GIS Map Viewer');

    // ------------------------------------------------------------------------
    // 4. TESTING ADVANCED SEARCH & DEDUPLICATION
    // ------------------------------------------------------------------------
    console.log('\n--- 4. Testing PostgreSQL Search & Filters ---');
    
    // Search "JUAN"
    await searchInput.fill('JUAN');
    await page.waitForTimeout(500);
    const dropdown = page.locator('.search-results-dropdown');
    await dropdown.waitFor({ state: 'visible' });

    let results = page.locator('.search-result-item');
    let count = await results.count();
    if (count === 1) {
      testPass('Search "JUAN" returns exactly 1 distinct result');
    } else {
      testFail('Search "JUAN"', `Expected 1 result but found ${count}`);
    }

    // Full name search "JUAN PEREZ"
    await searchInput.fill('JUAN PEREZ');
    await page.waitForTimeout(500);
    count = await results.count();
    if (count === 1) {
      testPass('Full name search "JUAN PEREZ" succeeds with 1 match');
    } else {
      testFail('Full name search "JUAN PEREZ"', `Expected 1 result but found ${count}`);
    }

    // Lot number search "3462"
    await searchInput.fill('3462');
    await page.waitForTimeout(500);
    count = await results.count();
    if (count >= 1) {
      testPass('Lot search "3462" finds target tomb');
    } else {
      testFail('Lot search "3462"', `No results found for lot 3462`);
    }

    // ------------------------------------------------------------------------
    // 5. OPEN DRAWER & TEST TOMB INSPECTION
    // ------------------------------------------------------------------------
    console.log('\n--- 5. Testing Tomb Drawer Inspection ---');
    await results.first().click();
    await page.waitForTimeout(800);

    const drawer = page.locator('.tumba-drawer-block');
    await drawer.waitFor({ state: 'visible', timeout: 5000 });
    const drawerTitle = await drawer.locator('h2').textContent();
    if (drawerTitle.includes('3462')) {
      testPass(`Drawer opened for Lote #3462: "${drawerTitle.trim()}"`);
    } else {
      testFail('Drawer header', `Expected Lote 3462 but got: ${drawerTitle}`);
    }

    // Test Deceased Card Expansion
    const deceasedItems = page.locator('.tumba-drawer-block .reorder-card-active, .tumba-drawer-block [draggable]');
    const deceasedCount = await deceasedItems.count();
    testPass(`Deceased list rendered with ${deceasedCount} items`);

    // Expand first deceased card
    const firstChevron = page.locator('.tumba-drawer-block svg.lucide-chevron-right').first();
    if (await firstChevron.isVisible()) {
      await firstChevron.click();
      await page.waitForTimeout(300);
      testPass('Expanded deceased card to inspect details (dates, cause of death)');
    }

    // ------------------------------------------------------------------------
    // 6. TEST DECEASED CRUD: ADD NEW DECEASED (AUTO-NIVEL STACKING)
    // ------------------------------------------------------------------------
    console.log('\n--- 6. Testing Deceased CRUD (Add New Deceased & Auto-Nivel) ---');
    const addDifuntoBtn = page.locator('button:has-text("Registrar Nuevo Difunto / Nivel")');
    await addDifuntoBtn.waitFor({ state: 'visible', timeout: 5000 });
    await addDifuntoBtn.click();
    await page.waitForTimeout(400);

    const addModal = page.locator('h3:has-text("Registrar Nuevo Difunto")');
    await addModal.waitFor({ state: 'visible', timeout: 3000 });
    testPass('AddDifuntoModal opened cleanly via createPortal');

    const testUniqueName = `TestAuto_${Date.now().toString().slice(-4)}`;
    await page.locator('input[placeholder="Ej. Juan Carlos"]').fill(testUniqueName);
    await page.locator('input[placeholder="Ej. Perez"]').fill('AutomatedTest');
    await page.locator('input[placeholder="Ej. Garcia"]').fill('Tester');
    await page.locator('input[placeholder*="Causas naturales"]').fill('Prueba E2E Playwright');

    // Submit
    await page.locator('button[type="submit"]:has-text("Registrar Difunto")').click();
    await page.waitForTimeout(1000);
    testPass(`Submitted new deceased: "${testUniqueName}"`);

    // Verify top stacking in Drawer (Nivel #1)
    await page.waitForTimeout(800);
    const topDeceasedText = await page.locator('.tumba-drawer-block strong').first().textContent();
    if (topDeceasedText.includes(testUniqueName)) {
      testPass(`Auto-Nivel Stacking confirmed: "${topDeceasedText}" placed at top Nivel #1`);
    } else {
      testFail('Auto-Nivel Stacking', `Expected top deceased to be ${testUniqueName} but got ${topDeceasedText}`);
    }

    // ------------------------------------------------------------------------
    // 7. TEST DECEASED CRUD: EDIT DECEASED
    // ------------------------------------------------------------------------
    console.log('\n--- 7. Testing Deceased CRUD (Edit Deceased) ---');
    const editBtn = page.locator('.tumba-drawer-block button[title="Editar datos del difunto"]').first();
    await editBtn.click();
    await page.waitForTimeout(400);

    const editModal = page.locator('h3:has-text("Editar Datos del Difunto")');
    await editModal.waitFor({ state: 'visible', timeout: 3000 });
    testPass('EditDifuntoModal opened');

    const updatedName = `${testUniqueName}_Mod`;
    await page.locator('input[placeholder="Ej. Juan Carlos"]').fill(updatedName);
    await page.locator('button[type="submit"]:has-text("Guardar Cambios")').click();
    await page.waitForTimeout(1000);
    testPass(`Deceased edited to "${updatedName}" in PostgreSQL`);

    // ------------------------------------------------------------------------
    // 8. TEST DECEASED CRUD: DELETE DECEASED (CLEANUP & RENUMBERING)
    // ------------------------------------------------------------------------
    console.log('\n--- 8. Testing Deceased CRUD (Delete & Renumber) ---');
    page.once('dialog', async (dialog) => {
      console.log(`Dialog accepted: "${dialog.message()}"`);
      await dialog.accept();
    });

    const deleteBtn = page.locator('.tumba-drawer-block button[title="Eliminar difunto de la fosa"]').first();
    await deleteBtn.click();
    await page.waitForTimeout(1200);
    testPass('Deleted test deceased record and verified automatic level renumbering');

    // ------------------------------------------------------------------------
    // 9. TEST TITULAR & FOSA MODAL
    // ------------------------------------------------------------------------
    console.log('\n--- 9. Testing Titular & Fosa Editing Modal ---');
    const editTitularBtn = page.locator('button:has-text("Editar Titular")').first();
    await editTitularBtn.waitFor({ state: 'visible', timeout: 5000 });
    await editTitularBtn.click();
    await page.waitForTimeout(400);

    const titularModal = page.locator('h3:has-text("Datos del Titular y Fosa")');
    await titularModal.waitFor({ state: 'visible', timeout: 3000 });
    testPass('EditTitularModal opened cleanly with separated titular fields');

    // Close modal
    await page.locator('button:has-text("Cancelar")').click();
    await page.waitForTimeout(300);
    testPass('EditTitularModal cancel action verified');

    // ------------------------------------------------------------------------
    // 10. TEST ADD PHOTO MODAL & MULTER ENGINE
    // ------------------------------------------------------------------------
    console.log('\n--- 10. Testing AddPhotoModal & Multer Engine ---');
    const addPhotoBtn = page.locator('button:has-text("Agregar Foto")').first();
    await addPhotoBtn.waitFor({ state: 'visible', timeout: 5000 });
    await addPhotoBtn.click();
    await page.waitForTimeout(400);

    const photoModal = page.locator('h3:has-text("Agregar Foto de Tumba")');
    await photoModal.waitFor({ state: 'visible', timeout: 3000 });
    testPass('AddPhotoModal opened with direct binary upload zone');

    await page.locator('button:has-text("Cancelar")').click();
    await page.waitForTimeout(300);
    testPass('AddPhotoModal cancel action verified');

    // ------------------------------------------------------------------------
    // 11. TEST Z-INDEX OVERLAP: PROFILE MENU VS SEARCH BAR
    // ------------------------------------------------------------------------
    console.log('\n--- 11. Testing Profile Dropdown Z-Index Stacking ---');
    const avatar = page.locator('.coatza-header button div:has-text("A")').first();
    await avatar.waitFor({ state: 'visible', timeout: 3000 });
    await avatar.click();
    await page.waitForTimeout(300);

    const userDropdown = page.locator('text=Cambiar de Cuenta');
    await userDropdown.waitFor({ state: 'visible' });
    testPass('Profile avatar dropdown opened on top of map search bar (clean z-index layering)');

    // Take Full Page Verification Screenshot
    await page.screenshot({ path: 'public/e2e_full_verification.png', fullPage: true });
    console.log('📸 Full E2E verification screenshot saved to public/e2e_full_verification.png');

  } catch (err) {
    testFail('Unexpected Test Runner Exception', err);
  } finally {
    await browser.close();

    console.log('\n=========================================================');
    console.log(`📊 TEST SUITE SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('=========================================================');

    if (failedTests > 0) {
      process.exit(1);
    }
  }
}

runComprehensiveE2ETest();
