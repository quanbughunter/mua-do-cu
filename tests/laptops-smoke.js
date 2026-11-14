// Laptop nhiều hãng: tra tên Lenovo, HP, MacBook, ASUS; phiếu MacBook; lọc theo hãng; battery report máy Lenovo.
// Chụp ở 390px, sáng và tối. Chạy sau `python3 build.py`: node tests/laptops-smoke.js
const { chromium } = require('playwright');
const fs = require('fs'), os = require('os'), path = require('path');
const FILE = 'file://' + path.resolve(__dirname, '../dist/www/index.html');
const OUT = path.join(__dirname, 'shots');
let fail = 0;
const ok = (c, n, x) => { if (!c) { fail++; console.log('✗ ' + n + (x !== undefined ? ' → ' + JSON.stringify(x) : '')); } };
(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'soi-lp-'));
  const rep = path.join(tmp, 'battery-report.html');
  fs.writeFileSync(rep, fs.readFileSync(path.join(__dirname, 'fixtures/battery-report.html'), 'utf8').replace(/Dell Inc\.?\s*Precision 5560/g, 'LENOVO 20W0S0XX00'));
  const browser = await chromium.launch();
  for (const scheme of ['light', 'dark']) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: scheme });
    const errs = [];
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
    await page.goto(FILE);
    const shot = (n, full) => page.screenshot({ path: path.join(OUT, scheme + '-lp-' + n + '.png'), fullPage: !!full });
    const overflow = async where => { const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); ok(ov <= 0, 'tràn ngang ở ' + where, ov); };
    const out = async () => (await page.textContent('#q-out')).replace(/\s+/g, ' ');

    // 1) Tra tên máy nhiều hãng
    await page.click('[data-act="quick"][data-q="dell"]');
    for (const [q, re] of [['ThinkPad T14 Gen 3', /2022/], ['EliteBook 840 G8', /2021/], ['FX506HC', /RTX 3050/], ['Katana GF66 11UE', /RTX 3060/], ['AN515-57', /Nitro/]]) {
      await page.fill('#q-dell', q);
      await page.waitForTimeout(80);
      ok(re.test(await out()), q, (await out()).slice(0, 160));
    }
    await page.fill('#q-dell', 'Legion 5 15ACH6H');
    await page.waitForTimeout(100);
    await shot('1-legion', true);
    await overflow('tra Legion');
    await page.fill('#q-dell', 'A2338');
    await page.waitForTimeout(100);
    ok((await page.$$('#q-out [data-act="dellpick"]')).length === 2, 'A2338 hỏi lại 2 đời');
    await page.click('#q-out [data-act="dellpick"]');
    await page.waitForTimeout(100);
    ok(/MacBook Pro 13 M1/.test(await out()), 'Chọn đời M1', (await out()).slice(0, 120));
    await page.fill('#q-dell', 'MacBook Air M1');
    await page.waitForTimeout(100);
    ok(/A2337|2020/.test(await out()), 'MacBook Air M1 → 2020');
    await shot('2-mac', true);
    await page.click('.sheet details.where > summary'); await page.click('.sheet .lp-rb >> nth=3 >> summary');
    await page.waitForTimeout(50);
    await shot('3-rules', true);
    await overflow('cách đọc tên');

    // 2) Phiếu MacBook
    await page.click('#q-out [data-act="newwith"]');
    await page.waitForTimeout(150);
    ok(/Số sê-ri/.test(await page.textContent('label[for="f-tag"]')), 'MacBook: ô số sê-ri thay cho Service Tag');
    ok((await page.$eval('#f-lbrand', e => e.value)) === 'apple', 'Ô hãng hiện Apple');
    ok(!(await page.$('[data-tool="battreport"]')), 'MacBook: không có nút battery report của Windows');
    await page.fill('#f-tag', 'c02abc12def3');
    await page.waitForTimeout(80);
    ok(/checkcoverage|Apple/.test(await page.innerHTML('#d-tag')), 'MacBook: link tra bảo hành Apple');
    await shot('4-mac-info', true);
    await overflow('thông tin MacBook');
    await page.click('[data-tab="gates"]');
    await page.waitForTimeout(100);
    const gt = (await page.textContent('main')).replace(/\s+/g, ' ');
    ok(/Khoá kích hoạt/.test(gt) && /Apple Business Manager/.test(gt) && !/mật khẩu BIOS/.test(gt), 'MacBook: mục bắt buộc có Khoá kích hoạt, MDM của Apple, không hỏi BIOS', gt.slice(0, 200));
    await shot('5-mac-gates', true);
    await page.click('[data-tab="check"]');
    await page.waitForTimeout(100);
    const chk = (await page.textContent('main')).replace(/\s+/g, ' ');
    ok(/Dung lượng tối đa/.test(chk) && !/Windows có bản quyền/.test(chk) && !/BIOS/.test(chk), 'MacBook: kiểm pin theo macOS, không hỏi Windows, không nhắc BIOS');
    await shot('5-mac-check', true);
    await page.click('[data-tab="result"]');
    await page.waitForTimeout(100);
    await shot('6-mac-result', true);
    await overflow('kết quả MacBook');

    // 3) Đổi hãng: danh sách đời máy chỉ còn Lenovo, đời đang chọn bị bỏ
    await page.click('[data-tab="info"]');
    await page.waitForTimeout(80);
    await page.selectOption('#f-lbrand', 'lenovo');
    await page.waitForTimeout(150);
    const opts = await page.$$eval('#f-model option', os => os.map(o => o.textContent));
    ok(opts.length > 50 && opts.slice(1).every(t => /Lenovo/.test(t)), 'Lọc hãng Lenovo', opts.slice(0, 4));
    ok((await page.$eval('#f-model', e => e.value)) === '', 'Đổi hãng bỏ đời máy khác hãng');
    ok(/S\/N|MTM/.test(await page.textContent('label[for="f-tag"]')), 'Lenovo: ô S/N hoặc MTM');

    // 4) Battery report máy Lenovo: tên máy là Machine Type
    await page.click('[data-act="tool"][data-tool="battreport"]');
    await page.setInputFiles('#b-f', rep);
    await page.waitForSelector('#b-out .bignum');
    const t4 = (await page.textContent('#b-out')).replace(/\s+/g, ' ');
    ok(/20W0S0XX00/.test(t4) && /T14 Gen 2/.test(t4), 'Battery report: LENOVO 20W0… → nút chọn T14 Gen 2', t4.slice(0, 220));
    await shot('7-battreport');
    await page.click('#b-m');
    await page.waitForTimeout(80);
    await page.click('#b-s');
    await page.waitForTimeout(150);
    ok(/T14 Gen 2/.test(await page.$eval('#f-model', e => e.options[e.selectedIndex].textContent)), 'Đã chọn T14 Gen 2 cho phiếu');
    await page.fill('#f-tag', '20w0s0xx00');
    await page.waitForTimeout(80);
    ok(/Mã loại máy 20W0/.test(await page.textContent('#d-tag')), 'Lenovo: MTM 20W0 tra ra đời máy');
    await shot('8-lenovo-info', true);
    await overflow('thông tin Lenovo');

    ok(!errs.length, 'lỗi trong trang (' + scheme + ')', errs);
    await page.close();
  }
  await browser.close();
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(fail ? fail + ' lỗi' : 'laptops-smoke: đạt');
  process.exit(fail ? 1 : 0);
})();
