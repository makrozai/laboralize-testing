const { chromium, devices } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  
  console.log('--- RUNNING FULL VISUAL VERIFICATION ---');
  const contextDesktop = await browser.newContext({ viewport: { width: 1440, height: 2500 } });
  const pageDesktop = await contextDesktop.newPage();
  const url = 'file://' + path.resolve(__dirname, 'index.html');
  await pageDesktop.goto(url);
  await pageDesktop.waitForTimeout(500);
  
  // Home Full Page
  await pageDesktop.screenshot({ path: 'tw_desktop_home_fixed.png', fullPage: true });
  console.log('Saved tw_desktop_home_fixed.png');

  // Open B2B Modal
  await pageDesktop.click('text=Contactar a Ventas');
  await pageDesktop.waitForTimeout(1000);
  await pageDesktop.screenshot({ path: 'tw_desktop_b2b_modal.png', fullPage: false });
  console.log('Saved tw_desktop_b2b_modal.png');
  
  // Close B2B Modal
  await pageDesktop.locator('text=×').click();
  await pageDesktop.waitForTimeout(500);

  // Navigate to course detail
  await pageDesktop.click('.card:first-child');
  await pageDesktop.waitForTimeout(500);
  
  // Open Trailer Modal
  // First, we need to click the trailer image (it has onclick="app.playTrailer...")
  await pageDesktop.locator('text=Ver Trailer').first().click();
  await pageDesktop.waitForTimeout(1000);
  await pageDesktop.screenshot({ path: 'tw_desktop_trailer_modal.png', fullPage: false });
  console.log('Saved tw_desktop_trailer_modal.png');

  await contextDesktop.close();
  await browser.close();
  
  console.log('Verification Complete!');
})();
