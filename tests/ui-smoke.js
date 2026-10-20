// Chụp màn hình các bước chính ở bề rộng điện thoại, sáng và tối; báo lỗi console.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.resolve(__dirname, '../dist/www/index.html');
const OUT = path.join(__dirname, 'shots');
(async () => {
  const browser = await chromium.launch();
  for (const scheme of ['light', 'dark']) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: scheme });
    const errs = [];
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
    await page.goto(FILE);
    await page.waitForTimeout(300);
    const shot = async n => page.screenshot({ path: path.join(OUT, scheme + '-' + n + '.png'), fullPage: n.endsWith('full') });
    await shot('1-home');
    await page.click('.slip');
    await page.waitForTimeout(100);
    await shot('2-info-full');
    await page.click('[data-tab="gates"]');
    await shot('3-gates');
    await page.click('[data-tab="check"]');
    await shot('4-check-full');
    await page.click('[data-tab="result"]');
    await shot('5-result-full');
    // overflow check
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (ov > 0) errs.push('horizontal overflow ' + ov);
    // new camera inspection
    await page.click('[data-act="home"]');
    await page.click('[data-cat="camera"]');
    await page.selectOption('#f-model', 'c-r50');
    await page.waitForTimeout(100);
    await page.click('[data-tab="check"]');
    await shot('6-camera-check');
    await page.click('[data-act="tool"][data-tool="exif"]');
    await shot('7-tool-exif');
    await page.click('[data-act="closelayer"]');
    await page.click('[data-act="home"]');
    await page.click('[data-cat="headphones"]');
    await page.selectOption('#f-model', 'ap-p2c');
    await page.click('[data-act="tool"][data-tool="airpods"]');
    await page.fill('#a-l', 'A3047'); await page.fill('#a-r', 'A3048'); await page.fill('#a-c', 'A2700');
    await shot('8-tool-airpods');
    await page.click('[data-act="closelayer"]');
    await page.click('[data-act="home"]');
    await page.click('[data-act="settings"]');
    await shot('9-settings');
    console.log(scheme, errs.length ? errs : 'no errors');
    await page.close();
  }
  await browser.close();
})();
// Ảnh vừa khung màn hình cho trang kết quả và các công cụ
(async () => {
  const { chromium } = require('playwright');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: 'light' });
  await p.goto(FILE); await p.click('.slip'); await p.click('[data-tab="result"]');
  await p.screenshot({ path: path.join(OUT, 'v-result-top.png') });
  await p.evaluate(() => window.scrollBy(0, 900));
  await p.screenshot({ path: path.join(OUT, 'v-result-mid.png') });
  await b.close();
})();
