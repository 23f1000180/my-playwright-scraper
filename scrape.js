const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false }); // Visible for debug
  const seeds = ['74','75','76','77','78','79','80','81','82','83'];
  let grandTotal = 0;

  console.log('Starting scrape...');

  for (const seed of seeds) {
    console.log(`\n--- Processing seed ${seed} ---`);
    const page = await browser.newPage();
    
    try {
      await page.goto(`https://sanand0.github.io/tdsdata/js_table/?seed=${seed}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000); // Wait for JS tables
      
      // Screenshot for debug
      await page.screenshot({ path: `debug-${seed}.png` });
      console.log(`Screenshot saved: debug-${seed}.png`);
      
      // Try multiple selectors for table cells
      const numbers = await page.evaluate(() => {
        const selectors = ['td', 'table td', '.table td', '[data-number]'];
        let allNumbers = [];
        
        for (const sel of selectors) {
          const cells = document.querySelectorAll(sel);
          cells.forEach(cell => {
            const text = cell.textContent?.trim();
            if (text) {
              const num = parseFloat(text.replace(/[^\d.-]/g, ''));
              if (!isNaN(num)) allNumbers.push(num);
            }
          });
        }
        return allNumbers;
      });

      console.log(`Seed ${seed}: Found ${numbers.length} numbers`);
      if (numbers.length > 0) {
        const pageSum = numbers.reduce((a, b) => a + b, 0);
        grandTotal += pageSum;
        console.log(`Seed ${seed} sum: ${pageSum.toFixed(2)}`);
      } else {
        console.log(`Seed ${seed}: No numbers found`);
      }
      
    } catch (error) {
      console.error(`Error seed ${seed}:`, error.message);
    }
    
    await page.close();
  }

  console.log(`\n🎉 GRAND TOTAL: ${grandTotal.toFixed(2)}`);
  await browser.close();
})();

