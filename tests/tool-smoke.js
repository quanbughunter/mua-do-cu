const { chromium } = require('playwright');
const path = require('path');
const os = require('os'), cp = require('child_process'), fs = require('fs');
const SP = fs.mkdtempSync(path.join(os.tmpdir(), 'soi-')) + '/';
// ảnh thử: tường trắng có 5 đốm bụi, ảnh đen có 20 điểm nóng và 1 cột sáng (cần Python + Pillow + NumPy)
cp.execFileSync('python3', ['-c', `
import numpy as np, random
from PIL import Image, ImageDraw, ImageFilter
random.seed(1); np.random.seed(1)
im = Image.new('L', (3000, 2000), 215); d = ImageDraw.Draw(im)
for x, y in [(600,500),(1500,900),(2400,1500),(900,1600),(2100,400)]: d.ellipse((x-14,y-14,x+14,y+14), fill=185)
a = np.array(im.filter(ImageFilter.GaussianBlur(4))).astype(np.int16)[:,:,None].repeat(3,2) + np.random.randint(-3,4,(2000,3000,1))
Image.fromarray(np.clip(a,0,255).astype('uint8')).save('${SP}wall.jpg', quality=92)
a = np.random.randint(0,10,(3000,4000,3)).astype('uint8')
for i in range(20): a[random.randint(5,2994), random.randint(5,3994)] = [230,200,210]
a[:,1234] = [120,120,120]
Image.fromarray(a).save('${SP}dark.jpg', quality=98)
`]);
const FILE = 'file://' + path.resolve(__dirname, '../dist/www/index.html');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(FILE);
  await p.click('[data-cat="camera"]');
  await p.selectOption('#f-model', 'c-r50');
  await p.click('[data-act="tool"][data-tool="exif"]');
  await p.setInputFiles('#x-f', path.join(__dirname, 'fixtures/canon-r6.jpg'));
  await p.waitForSelector('#x-out dl');
  console.log('EXIF:', (await p.textContent('#x-out')).replace(/\s+/g, ' ').slice(0, 400));
  await p.click('#x-m'); await p.click('#x-s');
  await p.waitForTimeout(200);
  console.log('after: title=', await p.textContent('.appbar h1'), '| ticket=', (await p.textContent('.ticket')).replace(/\s+/g, ' '));
  await p.click('[data-tab="check"]');
  console.log('shutter item:', (await p.textContent('#it-cm\\.shutter')).replace(/\s+/g, ' ').slice(0, 120));
  // dust
  await p.click('[data-act="tool"][data-tool="dust"]');
  await p.setInputFiles('#u-f', SP + 'wall.jpg');
  await p.waitForSelector('#u-out canvas', { timeout: 20000 });
  console.log('DUST:', (await p.textContent('#u-out')).replace(/\s+/g, ' '));
  await p.screenshot({ path: SP + 'dust.png' });
  await p.click('[data-act="closelayer"]');
  await p.click('[data-act="tool"][data-tool="hotpixel"]');
  await p.setInputFiles('#h-f', SP + 'dark.jpg');
  await p.waitForSelector('#h-out canvas', { timeout: 30000 });
  console.log('HOT:', (await p.textContent('#h-out')).replace(/\s+/g, ' '));
  await p.click('[data-act="closelayer"]');
  // headphones drain
  await p.click('[data-act="home"]'); await p.click('[data-cat="headphones"]'); await p.selectOption('#f-model', 'ap-p2c');
  await p.click('[data-tab="check"]');
  await p.click('[data-act="tool"][data-tool="drain"]');
  await p.fill('#d-l0', '100'); await p.fill('#d-l1', '92'); await p.fill('#d-r0', '100'); await p.fill('#d-r1', '93');
  console.log('DRAIN:', (await p.textContent('#d-out')).replace(/\s+/g, ' '), '| picked:', await p.getAttribute('[data-pick][aria-pressed="true"]', 'data-pick'));
  await p.click('[data-act="closelayer"]');
  // pin Galaxy từ nhật ký *#9900#
  await p.click('[data-act="home"]'); await p.click('[data-cat="phone"]'); await p.selectOption('#f-model', 'ss-s24u');
  await p.click('[data-tab="check"]');
  await p.click('[data-act="tool"][data-tool="galaxybatt"]');
  await p.setInputFiles('#g-f', path.join(__dirname, 'fixtures/galaxy-dumpstate.zip'));
  await p.waitForSelector('#g-out dl', { timeout: 20000 });
  console.log('GALAXY:', (await p.textContent('#g-out')).replace(/\s+/g, ' ').slice(0, 260), '| status:', await p.textContent('#g-st'));
  await p.screenshot({ path: SP + 'galaxy.png', fullPage: true });
  await p.click('#g-s');
  await p.waitForTimeout(200);
  console.log('battery item:', (await p.textContent('#it-ph\\.battery')).replace(/\s+/g, ' ').slice(0, 120));
  console.log('shots in', SP);
  console.log(errs.length ? errs : 'no errors');
  await b.close();
})();
