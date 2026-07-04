const { chromium, devices } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices['iPhone 13'],
  });
  const page = await context.newPage();
  
  const url = 'file://' + path.resolve(__dirname, 'index.html');
  console.log('Navigating to:', url);
  await page.goto(url);
  await page.waitForTimeout(500);
  
  console.log('Screenshot 1: Mobile Home');
  await page.screenshot({ path: 'mobile_home.png', fullPage: true });

  console.log('Opening mobile menu...');
  await page.click('.mobile-menu-btn');
  await page.waitForTimeout(500);
  
  console.log('Clicking Capacitaciones...');
  await page.click('text=Capacitaciones');
  await page.waitForTimeout(500);
  console.log('Screenshot 2: Mobile Catalog');
  await page.screenshot({ path: 'mobile_catalog.png', fullPage: true });

  console.log('Clicking first course...');
  await page.click('.card-title');
  await page.waitForTimeout(500);
  console.log('Screenshot 3: Mobile Course');
  await page.screenshot({ path: 'mobile_course.png', fullPage: true });

  console.log('Opening mobile menu...');
  await page.click('.mobile-menu-btn');
  await page.waitForTimeout(500);

  console.log('Clicking Ingresar...');
  await page.click('text=Ingresar');
  await page.waitForTimeout(500);
  
  // Need to use the primary button in the modal
  await page.click('.modal-content .btn-primary');
  await page.waitForTimeout(500);
  console.log('Screenshot 4: Mobile Intranet');
  await page.screenshot({ path: 'mobile_intranet.png', fullPage: true });

  await browser.close();
  console.log('Mobile Verification Complete!');
})();
