// Tra mã máy: trang đầu → công cụ nhanh, ví dụ, so chéo; ô mã máy trong phiếu Samsung / Xiaomi; IMEI.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.resolve(__dirname, '../dist/www/index.html');
const OUT = path.join(__dirname, 'shots');
(async () => {
  const browser = await chromium.launch();
  let bad = 0;
  for (const scheme of ['light', 'dark']) {
    const p = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: scheme });
    const errs = [];
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
    await p.goto(FILE); await p.waitForTimeout(200);
    await p.screenshot({ path: path.join(OUT, scheme + '-m1-home.png'), fullPage: true });
    await p.click('[data-act="quick"][data-q="market"]');
    await p.fill('#q-code', 'MGCM3LL/A');
    const t1 = await p.textContent('#q-out');
    if (!/Mỹ/.test(t1) || !/eSIM/.test(t1)) { bad++; errs.push('iPhone decode missing: ' + t1.slice(0, 120)); }
    await p.screenshot({ path: path.join(OUT, scheme + '-m2-iphone.png'), fullPage: true });
    await p.click('[data-act="qex"][data-v="SM-S928B/DS SER/SER/SER"]');
    const t2 = await p.textContent('#q-out');
    if (!/Galaxy S24 Ultra/.test(t2) || !/Nga/.test(t2)) { bad++; errs.push('Samsung decode missing'); }
    await p.fill('#q-code', 'SM-S928N SER/SER/SER');
    const t3 = await p.textContent('#q-out');
    if (!/So chéo/.test(t3)) { bad++; errs.push('cross warning missing'); }
    await p.screenshot({ path: path.join(OUT, scheme + '-m3-cross.png'), fullPage: true });
    await p.fill('#q-code', 'abc xyz12');
    const t4 = await p.textContent('#q-out');
    if (!/Chưa nhận ra/.test(t4)) { bad++; errs.push('unknown message missing'); }
    await p.click('details.where summary');
    await p.screenshot({ path: path.join(OUT, scheme + '-m4-where.png'), fullPage: true });
    let ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (ov > 0) { bad++; errs.push('overflow quick ' + ov); }
    await p.click('[data-act="closelayer"]');
    // IMEI
    await p.click('[data-act="quick"][data-q="imei"]');
    await p.fill('#q-imei', '350683211411797\n357563651411792');
    const t5 = await p.textContent('#q-out');
    if (!/Hợp lệ/.test(t5) || !/Sai chữ số/.test(t5)) { bad++; errs.push('imei out wrong'); }
    await p.screenshot({ path: path.join(OUT, scheme + '-m5-imei.png'), fullPage: true });
    await p.click('[data-act="closelayer"]');
    // Phiếu Samsung: chọn S24 Ultra, nhập mã S23 Ultra → báo lệch
    await p.click('[data-cat="phone"]');
    await p.selectOption('#f-model', 'ss-s24u');
    await p.waitForTimeout(80);
    await p.fill('#f-partno', 'sm-s918n');
    await p.fill('#f-code2', 'SER/SER/SER');
    const t6 = await p.textContent('#d-partno');
    if (!/Không khớp/.test(t6) || !/So chéo/.test(t6)) { bad++; errs.push('inspection mismatch missing: ' + t6.slice(0, 160)); }
    const v6 = await p.inputValue('#f-partno');
    if (v6 !== 'SM-S918N') { bad++; errs.push('uppercase failed ' + v6); }
    await p.click('[data-tab="gates"]'); await p.click('[data-tab="info"]');
    const ins = await p.textContent('#d-partno');
    if (!/không phải Galaxy S24 Ultra/.test(ins)) { bad++; errs.push('mismatch missing after rerender'); }
    const rep = await p.evaluate(() => document.querySelector('#f-code2').value);
    if (rep !== 'SER/SER/SER') { bad++; errs.push('code2 lost ' + rep); }
    await p.screenshot({ path: path.join(OUT, scheme + '-m6-samsung-info.png'), fullPage: true });
    // ph.model tool button jumps to field
    await p.click('[data-tab="gates"]');
    const btn = await p.$('[data-act="goinfo"][data-focus="f-partno"]');
    if (!btn) { bad++; errs.push('goinfo partno button missing'); } else { await btn.click(); await p.waitForTimeout(80); const fid = await p.evaluate(() => document.activeElement && document.activeElement.id); if (fid !== 'f-partno') { bad++; errs.push('focus ' + fid); } }
    // Xiaomi
    await p.click('[data-act="home"]'); await p.click('[data-cat="phone"]');
    await p.selectOption('#f-model', 'mi-rn13p');
    await p.fill('#f-partno', '2312DRA50C'); await p.fill('#f-code2', 'OS2.0.3.0.VNFMIXM');
    const t7 = await p.textContent('#d-partno');
    if (!/ROM sửa/.test(t7)) { bad++; errs.push('xiaomi cross missing'); }
    await p.screenshot({ path: path.join(OUT, scheme + '-m7-xiaomi-info.png'), fullPage: false });
    ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (ov > 0) { bad++; errs.push('overflow insp ' + ov); }
    console.log(scheme, errs.length ? errs : 'no errors');
    bad += errs.filter(e => /PAGEERROR|error/i.test(e)).length;
    await p.close();
  }
  await browser.close();
  process.exit(bad ? 1 : 0);
})();
