// Laptop Dell: tra tên máy, phiếu kiểm laptop, battery report, thử bàn phím. Chụp ở 390px, sáng và tối.
// Chạy sau `python3 build.py`: node tests/dell-smoke.js
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.resolve(__dirname, '../dist/www/index.html');
const OUT = path.join(__dirname, 'shots');
let fail = 0;
const ok = (c, n, x) => { if (!c) { fail++; console.log('✗ ' + n + (x !== undefined ? ' → ' + JSON.stringify(x) : '')); } };
(async () => {
  const browser = await chromium.launch();
  for (const scheme of ['light', 'dark']) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: scheme });
    const errs = [];
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
    await page.goto(FILE);
    const shot = (n, full) => page.screenshot({ path: path.join(OUT, scheme + '-dell-' + n + '.png'), fullPage: !!full });
    const overflow = async where => { const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); ok(ov <= 0, 'tràn ngang ở ' + where, ov); };

    // 1) Tra tên máy nhanh từ trang chủ
    await page.click('[data-act="quick"][data-q="dell"]');
    await page.fill('#q-dell', 'Precision 5560');
    await page.waitForTimeout(150);
    const t1 = (await page.textContent('#q-out')).replace(/\s+/g, ' ');
    ok(/2021/.test(t1) && /15,6/.test(t1), 'Precision 5560 → 2021, 15,6″', t1.slice(0, 200));
    await shot('1-quick');
    await shot('1-quick-full', true);
    await overflow('tra tên');
    await page.fill('#q-dell', 'PB14250');
    await page.waitForTimeout(100);
    ok(/Dell Pro/.test(await page.textContent('#q-out')), 'PB14250 → Dell Pro');
    await page.fill('#q-dell', 'Latitude 7420');
    await page.waitForTimeout(100);
    ok(/2021/.test(await page.textContent('#q-out')), 'Latitude 7420 → 2021');
    await page.fill('#q-dell', 'Precision 5560');
    await page.waitForTimeout(100);

    // 2) Mở phiếu kiểm laptop từ kết quả
    await page.click('#q-out [data-act="newwith"]');
    await page.waitForTimeout(150);
    ok(await page.$('#f-tag'), 'Phiếu laptop có ô Service Tag');
    await page.fill('#f-tag', 'abc1d23');
    await page.waitForTimeout(100);
    ok(/ABC1D23/.test(await page.textContent('#d-tag')), 'Service Tag viết hoa và có link Dell');
    await shot('2-info-full', true);
    await overflow('thông tin laptop');

    // 3) Battery report
    await page.click('[data-act="tool"][data-tool="battreport"]');
    await page.setInputFiles('#b-f', path.join(__dirname, 'fixtures/battery-report.html'));
    await page.waitForSelector('#b-out .bignum');
    const t3 = (await page.textContent('#b-out')).replace(/\s+/g, ' ');
    ok(/83/.test(t3) && /253/.test(t3) && /Precision 5560/.test(t3), 'Battery report: 83%, 253 lần sạc, Precision 5560', t3.slice(0, 200));
    await shot('3-battreport');
    await page.click('#b-s');
    await page.waitForTimeout(100);

    // 4) Thử bàn phím
    await page.click('[data-tab="check"]');
    await page.waitForTimeout(100);
    await shot('4-check-full', true);
    await overflow('danh sách kiểm laptop');
    const kb = await page.$('[data-act="tool"][data-tool="keyboard"]');
    ok(kb, 'Có nút thử bàn phím');
    if (kb) {
      await kb.click();
      for (const k of ['KeyQ', 'KeyW', 'KeyE', 'Space', 'Enter']) await page.keyboard.press(k === 'KeyQ' ? 'q' : k === 'KeyW' ? 'w' : k === 'KeyE' ? 'e' : k);
      ok((await page.textContent('#kb-n')) === '5', 'Bàn phím: đếm 5 phím', await page.textContent('#kb-n'));
      await shot('5-keyboard');
      await page.click('[data-act="closelayer"]');
    }

    // 5) Kết quả: giá tham chiếu từ giá cũ ở VN
    await page.click('[data-tab="result"]');
    await page.waitForTimeout(100);
    await shot('6-result-full', true);
    await overflow('kết quả');

    // 6) Nút Back của Android
    const back = await page.evaluate(() => [window.__back(), window.__back()]);
    ok(back[0] === true && back[1] === false, 'window.__back: về trang chủ rồi báo thoát', back);

    ok(!errs.length, scheme + ': lỗi console', errs);
    await page.close();
  }
  await browser.close();
  console.log(fail ? fail + ' lỗi' : 'dell-smoke: đạt');
  process.exit(fail ? 1 : 0);
})();
