// ===== Đọc tên laptop nhiều hãng: Lenovo, HP, Apple, ASUS, Acer, MSI =====
// Dell nằm riêng ở dell.js. Bảng đời máy hãng khác ở data-laptops.js (LAPTOP_MORE, sinh từ tests/laptop-data/*.txt).
// Cách làm như Dell: tách tên ra từng phần có nghĩa (dòng, hạng, cỡ màn, đời, nền tảng chip, card) theo quy tắc
// của từng hãng, rồi tra bảng. Bảng luôn đúng hơn quy tắc; khi đời máy chưa có trong bảng thì ghi "≈ năm".

const LP_BRAND_NAMES = { dell: 'Dell', lenovo: 'Lenovo', hp: 'HP', apple: 'Apple', asus: 'ASUS', acer: 'Acer', msi: 'MSI' };

const LAPTOP_LINES = {
  thinkpad: { name: 'ThinkPad', kind: 'Laptop doanh nghiệp Lenovo', short: 'Doanh nghiệp' },
  thinkbook: { name: 'ThinkBook', kind: 'Laptop văn phòng Lenovo', short: 'Văn phòng' },
  legion: { name: 'Legion', kind: 'Laptop chơi game Lenovo', short: 'Chơi game' },
  loq: { name: 'LOQ', kind: 'Laptop chơi game giá rẻ Lenovo', short: 'Game giá rẻ' },
  ideapad: { name: 'IdeaPad', kind: 'Laptop phổ thông Lenovo', short: 'Phổ thông' },
  yoga: { name: 'Yoga', kind: 'Laptop cao cấp, mỏng nhẹ Lenovo', short: 'Cao cấp' },
  elitebook: { name: 'EliteBook', kind: 'Laptop doanh nghiệp cao cấp HP', short: 'Doanh nghiệp' },
  probook: { name: 'ProBook', kind: 'Laptop doanh nghiệp phổ thông HP', short: 'Văn phòng' },
  zbook: { name: 'ZBook', kind: 'Máy trạm di động HP (workstation)', short: 'Máy trạm' },
  dragonfly: { name: 'Dragonfly', kind: 'Laptop doanh nghiệp siêu nhẹ HP', short: 'Cao cấp' },
  victus: { name: 'Victus', kind: 'Laptop chơi game HP', short: 'Chơi game' },
  omen: { name: 'Omen', kind: 'Laptop chơi game cao cấp HP', short: 'Chơi game' },
  pavilion: { name: 'Pavilion', kind: 'Laptop phổ thông HP', short: 'Phổ thông' },
  envy: { name: 'Envy', kind: 'Laptop cao cấp HP', short: 'Cao cấp' },
  spectre: { name: 'Spectre', kind: 'Laptop cao cấp nhất HP', short: 'Cao cấp' },
  hp: { name: 'HP 14 / 15', kind: 'Laptop giá rẻ HP', short: 'Giá rẻ' },
  macbookair: { name: 'MacBook Air', kind: 'Laptop Apple mỏng nhẹ', short: 'Mỏng nhẹ' },
  macbookpro: { name: 'MacBook Pro', kind: 'Laptop Apple hiệu năng cao', short: 'Hiệu năng' },
  macbookneo: { name: 'MacBook Neo', kind: 'Laptop Apple giá rẻ (từ 2026)', short: 'Giá rẻ' },
  tuf: { name: 'TUF Gaming', kind: 'Laptop chơi game ASUS, bền, giá vừa', short: 'Chơi game' },
  rog: { name: 'ROG', kind: 'Laptop chơi game cao cấp ASUS', short: 'Chơi game' },
  zenbook: { name: 'Zenbook', kind: 'Laptop mỏng nhẹ cao cấp ASUS', short: 'Cao cấp' },
  vivobook: { name: 'Vivobook', kind: 'Laptop phổ thông ASUS', short: 'Phổ thông' },
  expertbook: { name: 'ExpertBook', kind: 'Laptop doanh nghiệp ASUS', short: 'Doanh nghiệp' },
  nitro: { name: 'Nitro', kind: 'Laptop chơi game giá rẻ Acer', short: 'Chơi game' },
  predator: { name: 'Predator', kind: 'Laptop chơi game cao cấp Acer', short: 'Chơi game' },
  aspire: { name: 'Aspire', kind: 'Laptop phổ thông Acer', short: 'Phổ thông' },
  swift: { name: 'Swift', kind: 'Laptop mỏng nhẹ Acer', short: 'Mỏng nhẹ' },
  msigaming: { name: 'MSI', kind: 'Laptop chơi game MSI', short: 'Chơi game' },
  msioffice: { name: 'Modern / Prestige', kind: 'Laptop văn phòng MSI', short: 'Văn phòng' }
};

const LP_SIZE = { '11': '11,6″', '12': '12,5″', '13': '13,3″', '14': '14″', '15': '15,6″', '16': '16″', '17': '17,3″', '18': '18″' };
const LP_GEN_YEAR = { '05': 2020, '5': 2020, '6': 2021, '7': 2022, '8': 2023, '9': 2024, '10': 2025, '11': 2026 };

function lpAll() { return typeof LAPTOP_MORE === 'undefined' ? [] : LAPTOP_MORE; }
function lpNorm(s) { return String(s || '').replace(/[‐-―]/g, '-').replace(/\s+/g, ' ').trim(); }
function lpKey(s) {
  return String(s || '').toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\b(?:lenovo|hp|apple|asus|acer|msi|laptop|gaming|notebook)\b/g, ' ')
    .replace(/\bgen(?:eration)?\s*(\d+)/g, 'g$1')
    .replace(/2[\s-]?in[\s-]?1/g, '2in1')
    .replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}
function lpHas(hay, needle) { return !!needle && (' ' + hay + ' ').indexOf(' ' + needle + ' ') >= 0; }

// Tra bảng theo tên, mã máy, tên khác; trả về các đời máy khớp dài nhất.
function lpFind(raw, brand) {
  const k = lpKey(raw);
  let best = [], blen = 0;
  lpAll().forEach(m => {
    if (brand && m.brand !== brand) return;
    let ml = 0;
    [m.name, m.code].concat(m.aliases || [], m.codes || []).forEach((c, i) => {
      const ck = lpKey(c);
      if (ck.length < 3 || /^\d+$/.test(ck) || (ck.length === 3 && !/^[a-z]\d\d$/.test(ck))) return; // mã quá ngắn hoặc chỉ có số dễ khớp nhầm
      if (ck.length > ml && lpHas(k, ck)) ml = ck.length;
    });
    if (!ml) return;
    if (ml > blen) { best = [m]; blen = ml; } else if (ml === blen) best.push(m);
  });
  if (!best.length && k.length >= 4 && /\s/.test(k)) {
    // gõ thiếu (vd. "Zephyrus G14", "TUF F15"): lấy mọi đời máy có tên chứa đủ chuỗi gõ vào
    best = lpAll().filter(m => (!brand || m.brand === brand) && lpHas(lpKey(m.name), k));
  }
  return best;
}
function lpByCode(code, brand) {
  const c = String(code || '').toLowerCase();
  return lpAll().filter(m => (!brand || m.brand === brand) && (m.codes || []).some(x => x.toLowerCase() === c));
}

// Đời trước, đời sau, cùng năm khác cỡ / khác hạng.
function laptopNeighbors(m) {
  if (!m) return { prev: null, next: null, same: [] };
  if (m.brand === 'dell') return dellNeighbors(m);
  const all = lpAll();
  const ser = all.filter(x => x.series === m.series && x.id !== m.id && x.year);
  const prev = ser.filter(x => x.year < m.year).sort((a, b) => b.year - a.year)[0] || null;
  const next = ser.filter(x => x.year > m.year).sort((a, b) => a.year - b.year)[0] || null;
  const same = all.filter(x => x.id !== m.id && x.year === m.year && x.family === m.family && x !== prev && x !== next).slice(0, 6);
  return { prev, next, same };
}

function laptopByName(name) {
  const d = typeof dellByName === 'function' ? dellByName(name) : null;
  if (d) return d;
  const r = decodeLaptop(name);
  return r && r.ok && r.kind !== 'ambiguous' && r.models && r.models.length === 1 ? r.models[0] : null;
}

// ---------- Nhận ra hãng ----------
function lpBrandOf(s) {
  const u = s.toUpperCase();
  if (/\b(dell|precision|latitude|vostro|inspiron|xps|alienware)\b/i.test(s) || /^(pro max|pro)\s*1[3-8]\b/i.test(s) ||
    /^[DPM][ABC]\d{5}$/i.test(s) || /^PW[57]\d{5}$/i.test(s) || /^g1[56]\b/i.test(s)) return 'dell';
  if (/macbook|\bmac\d{1,2},\d|\bmb[ap]\b/i.test(s) || /^A[123]\d{3}$/i.test(s) || /^[A-Z0-9]{5}[A-Z]{1,2}\/A$/i.test(s.replace(/\s+/g, ''))) return 'apple';
  if (/^2[01][A-Z0-9]{2}([A-Z0-9]{6})?$/i.test(s) && lpByCode(s.slice(0, 4), 'lenovo').length) return 'lenovo';
  if (/\b(thinkpad|thinkbook|ideapad|legion|yoga|loq|lenovo)\b/i.test(s) || /\b[TXPELZ]1[2-8][spgv]?\s*(?:yoga\s*)?(?:gen|g)\s*\d/i.test(s) ||
    /\bX1\s*(carbon|c|yoga|extreme|nano|2[\s-]?in[\s-]?1)\b/i.test(s) || /\bP1\s*(?:gen|g)\s*\d/i.test(s) || /\b[TXELA][2-5][789][05]S?\b/.test(u) ||
    /\bP[457][123]S?\b/.test(u) || /\b1[3-8][IAQ][A-Z0-9]{2}(?:05|\d{1,2})H?\b/.test(u)) return 'lenovo';
  if (/\b(elitebook|probook|zbook|dragonfly|victus|omen|pavilion|envy|spectre|omnibook)\b/i.test(s) || /^hp\b/i.test(s) || /\b1[3-7]s?-[a-z]{1,2}\d/i.test(s)) return 'hp';
  if (/\b(asus|zenbook|vivobook|rog|tuf|zephyrus|strix|expertbook|proart)\b/i.test(s) || /\b(FX|FA|GA|GU|GV|GX|GZ|UX|UM|X|M|K|S|E|B|G|V|H|A)\d{3,4}[A-Z]{2,3}\b/.test(u)) return 'asus';
  if (/\b(acer|nitro|predator|aspire|swift|helios|travelmate|extensa)\b/i.test(s) || /\b(ANV|AN|PHN|PH|PT|SFG|SFX|SF|SP|TMP|EX|AL|A)\d{2,3}-\d{2,3}/.test(u)) return 'acer';
  if (/\b(msi|katana|cyborg|sword|bravo|alpha|delta|pulse|crosshair|vector|raider|stealth|titan|modern|prestige|creator|summit|gf63|gf65|gf66|gf75|gf76|gl66|gl76|gp66|gp76|ge66|ge76|gs66|gs76)\b/i.test(s)) return 'msi';
  return null;
}

function decodeLaptop(raw) {
  const s = lpNorm(raw);
  if (!s) return null;
  const b = lpBrandOf(s);
  if (b === 'dell') return lpDell(decodeDell(s));
  if (b) return LP_DECODERS[b](s);
  const hits = lpFind(s);
  if (hits.length) return LP_DECODERS[hits[0].brand](s);
  const d = lpDell(decodeDell(s));
  if (d && d.ok) return d;
  if (/^\d{4}$/.test(s)) return d;
  return { ok: false, msg: 'Chưa nhận ra tên máy. Gõ tên in dưới đáy máy hoặc trên tin rao, vd. "Precision 5560", "ThinkPad T14 Gen 3", "EliteBook 840 G8", "MacBook Air M2", "A2338", "FX506HC", "AN515-57", "Katana GF66 11UE", "Legion 5 15ACH6H".' };
}

function lpDell(r) {
  if (r && r.ok && !r.brand) r.brand = 'dell';
  return r;
}

// Ghép kết quả: tra bảng, rồi lấy phần giải nghĩa từ chuỗi gõ vào (hoặc từ tên đời máy nếu chuỗi gõ vào không đọc được).
function lpDecodeWith(brand, s, parse, extraHits) {
  const pin = parse(s);
  let hits = (extraHits && extraHits.length) ? extraHits : lpFind(s, brand);
  if (hits.length > 1 && pin && pin.year) { const h = hits.filter(m => m.year === pin.year); if (h.length) hits = h; }
  if (hits.length > 1 && pin && pin.pick) { const h = hits.filter(pin.pick); if (h.length) hits = h; }
  if (hits.length > 1) {
    return { ok: true, kind: 'ambiguous', brand, models: hits, msg: hits.length + ' đời máy ' + LP_BRAND_NAMES[brand] + ' khớp với "' + s + '". Chọn đúng máy:' };
  }
  const mdl = hits[0] || null;
  let q = pin && pin.parts && pin.parts.length ? pin : (mdl ? parse(mdl.name) : null);
  if (!q && !mdl) return { ok: false, msg: LP_UNKNOWN[brand] };
  q = q || { line: mdl.line, parts: [], year: mdl.year };
  let parts = q.parts || [];
  if (mdl && mdl.year && q.year && q.year !== mdl.year) parts = parts.map(p => (p.year ? Object.assign({}, p, { text: p.text + ' (bảng ghi ' + mdl.year + ')' }) : p));
  const L = LAPTOP_LINES[q.line] || LAPTOP_LINES[mdl && mdl.line] || { name: LP_BRAND_NAMES[brand], kind: 'Laptop ' + LP_BRAND_NAMES[brand], short: '' };
  return {
    ok: true, kind: 'code', brand, line: q.line || (mdl && mdl.line), lineName: q.lineName || L.name, lineKind: L.kind, lineShort: q.lineShort || L.short,
    code: mdl ? mdl.code : (q.code || s), title: mdl ? mdl.name : (q.title || s), parts,
    year: mdl && mdl.year ? mdl.year : q.year, approx: !mdl, size: (mdl && mdl.size) || q.size || '',
    cpu: mdl ? mdl.cpu : (q.cpu || ''), models: mdl ? [mdl] : [], warn: q.warn || ''
  };
}

const LP_UNKNOWN = {
  lenovo: 'Chưa nhận ra máy Lenovo này. Gõ theo dạng "ThinkPad T14 Gen 3", "X1 Carbon Gen 9", "T480", "Legion 5 15ACH6H", "IdeaPad 5 14ITL05", "ThinkBook 14 G4 IAP" hoặc Machine Type 4 ký tự trên tem đáy (vd. 20W0).',
  hp: 'Chưa nhận ra máy HP này. Gõ theo dạng "EliteBook 840 G8", "ProBook 450 G9", "ZBook Firefly 14 G8", hoặc mã sau dấu gạch như "Victus 16-d0123TX", "15s-fq2xxx".',
  apple: 'Chưa nhận ra MacBook này. Gõ số model dưới đáy máy (vd. A2338), Model Identifier (vd. MacBookPro17,1, Mac14,2) hoặc tên như "MacBook Air M2", "MacBook Pro 14 M3 Pro".',
  asus: 'Chưa nhận ra máy ASUS này. Gõ mã trên tem đáy máy, vd. FX506HC, UX3402ZA, GA401QM, X515EA.',
  acer: 'Chưa nhận ra máy Acer này. Gõ mã trên tem đáy máy, vd. AN515-57, A515-56, SF314-59, PH315-54.',
  msi: 'Chưa nhận ra máy MSI này. Gõ tên dòng và mã, vd. "GF63 Thin 11UC", "Katana GF66 11UE", "Katana 15 B13VFK", "Modern 14 C12M".'
};

// ---------- Lenovo ----------
const LENOVO_PLAT = {
  IKB: ['Intel Core thế hệ 7–8 U (Kaby Lake)', 2017], ICH: ['Intel Core thế hệ 8 H (Coffee Lake)', 2018],
  IWL: ['Intel Core thế hệ 8 U (Whiskey Lake)', 2019],
  IRH: ['Intel Core thế hệ 9 H (Coffee Lake Refresh)', 2019, { 8: ['Intel Core thế hệ 13 H (Raptor Lake)', 2023], 9: ['Intel Core thế hệ 13–14 H (Raptor Lake)', 2024], 10: ['Intel Core thế hệ 13–14 H (Raptor Lake)', 2025] }],
  IML: ['Intel Core thế hệ 10 U (Comet Lake)', 2020, { 9: ['Intel Core Ultra thế hệ 1 (Meteor Lake)', 2024] }],
  IIL: ['Intel Core thế hệ 10 (Ice Lake)', 2020],
  IMH: ['Intel Core thế hệ 10 H (Comet Lake)', 2020, { 9: ['Intel Core Ultra thế hệ 1 H (Meteor Lake)', 2024] }],
  ITL: ['Intel Core thế hệ 11 U (Tiger Lake)', 2021], ITH: ['Intel Core thế hệ 11 H (Tiger Lake)', 2021],
  IHU: ['Intel Core thế hệ 11 H35 (Tiger Lake)', 2021],
  IAU: ['Intel Core thế hệ 12 U (Alder Lake)', 2022], IAP: ['Intel Core thế hệ 12 P (Alder Lake)', 2022],
  IAH: ['Intel Core thế hệ 12 H (Alder Lake)', 2022, { 10: ['Intel Core Ultra thế hệ 2 H (Arrow Lake)', 2025] }],
  IAX: ['Intel Core thế hệ 12 HX (Alder Lake)', 2022, { 10: ['Intel Core Ultra thế hệ 2 HX (Arrow Lake)', 2025] }],
  IRU: ['Intel Core thế hệ 13 U (Raptor Lake)', 2023], IRP: ['Intel Core thế hệ 13 P (Raptor Lake)', 2023],
  IRL: ['Intel Core thế hệ 13 (Raptor Lake)', 2023],
  IRX: ['Intel Core thế hệ 13 HX (Raptor Lake)', 2023, { 9: ['Intel Core thế hệ 14 HX (Raptor Lake Refresh)', 2024] }],
  ILL: ['Intel Core Ultra thế hệ 2 V (Lunar Lake)', 2024], IAL: ['Intel Core Ultra thế hệ 2 (Arrow Lake)', 2025],
  API: ['AMD Ryzen 3000 U (Picasso)', 2019], ARE: ['AMD Ryzen 4000 U (Renoir)', 2020],
  ARH: ['AMD Ryzen 4000 H (Renoir)', 2020, { 7: ['AMD Ryzen 6000 H (Rembrandt)', 2022] }],
  ALC: ['AMD Ryzen 5000 U (Lucienne, Cezanne)', 2021], ACL: ['AMD Ryzen 5000 U (Lucienne, Cezanne)', 2021],
  ACN: ['AMD Ryzen 5000 U (Cezanne)', 2021], ACH: ['AMD Ryzen 5000 H (Cezanne)', 2021],
  ABA: ['AMD Ryzen 5x25U (Barcelo)', 2022], ARB: ['AMD Ryzen 6000 U (Rembrandt)', 2022],
  AMN: ['AMD Ryzen 7020 (Mendocino)', 2023], ABR: ['AMD Ryzen 7030 U (Barcelo-R)', 2023], ABP: ['AMD Ryzen 7030 U (Barcelo-R)', 2023],
  APH: ['AMD Ryzen 7040 H (Phoenix)', 2023], APU: ['AMD Ryzen 7040 U (Phoenix)', 2023], ARP: ['AMD Ryzen 7035 (Rembrandt-R)', 2023],
  ARX: ['AMD Ryzen 7045 HX (Dragon Range)', 2023], AHP: ['AMD Ryzen 8040 (Hawk Point)', 2024],
  ASP: ['AMD Ryzen AI 300 (Strix Point)', 2024], AKP: ['AMD Ryzen AI 300 (Krackan Point)', 2025]
};
const TB_G_TO_GEN = { 1: '05', 2: '05', 3: '6', 4: '7', 5: '8', 6: '8', 7: '9', 8: '10', 9: '11' };
function lenovoPlat(code, gen) {
  const p = LENOVO_PLAT[code];
  if (!p) return null;
  const g = gen != null ? String(+gen) : null;
  const o = p[2] && g && p[2][g];
  return o ? { cpu: o[0], year: o[1] } : { cpu: p[0], year: p[1] };
}

const TP_SERIES = {
  T: 'Dòng T: chủ lực doanh nghiệp, bền, đủ cổng', X: 'Dòng X: nhỏ gọn, mang đi nhiều', P: 'Dòng P: máy trạm (workstation), card đồ hoạ chuyên dụng',
  E: 'Dòng E: giá rẻ cho doanh nghiệp nhỏ', L: 'Dòng L: doanh nghiệp giá rẻ, dễ thay linh kiện', Z: 'Dòng Z: cao cấp, chip AMD', A: 'Dòng A: bản chip AMD (2018)'
};
const TP_SUFFIX = { s: 'Bản mỏng nhẹ (s = slim)', p: 'Bản chip H mạnh hơn', g: 'Bản card rời mạnh (g = graphics)', v: 'Bản giá mềm của dòng P' };
const TP_X1 = {
  carbon: 'Carbon: vỏ sợi carbon, mỏng nhẹ nhất dòng doanh nghiệp', c: 'Carbon (X1C): vỏ sợi carbon, mỏng nhẹ', yoga: 'Yoga: màn cảm ứng xoay gập 360°, có bút',
  extreme: 'Extreme: chip H, card rời, mạnh nhất dòng X1', nano: 'Nano: siêu nhẹ, khoảng 0,9 kg', '2in1': '2-in-1: tên mới của X1 Yoga từ 2024',
  titanium: 'Titanium: vỏ titan, màn 3:2', fold: 'Fold: màn gập'
};
const TP_BASE = {
  T14: 2019, T14s: 2019, T15: 2019, T15p: 2019, T15g: 2019, X13: 2019, 'X13 Yoga': 2019, L13: 2019, L14: 2019, L15: 2019, P14s: 2019,
  P15s: 2019, P15: 2019, P17: 2019, P15v: 2019, T16: 2021, P16: 2021, P16s: 2021, P16v: 2021, Z13: 2021, Z16: 2021, L16: 2022,
  E14: 2018, E15: 2018, E16: 2022, 'X1 Carbon': 2012, 'X1 C': 2012, 'X1 Yoga': 2015, 'X1 2in1': 2015, 'X1 Extreme': 2017,
  'X1 Nano': { 1: 2020, 2: 2022, 3: 2023 }, 'X1 Titanium': { 1: 2021 }, P1: 2017, X12: { 1: 2021, 2: 2023 }
};
function tpYear(k, gen) {
  const b = TP_BASE[k];
  if (b == null) return null;
  return typeof b === 'object' ? b[gen] || null : b + gen;
}
const TP_OLD_SIZE = { '2': '12,5″', '3': '13,3″', '4': '14″', '5': '15,6″', '7': '17,3″' };
const TP_OLD_YEAR = { '70': 2017, '75': 2017, '80': 2018, '85': 2018, '90': 2019, '95': 2019 };
const LENOVO_TIER = { 1: 'Hạng 1: rẻ nhất', 3: 'Hạng 3: giá rẻ', 5: 'Hạng 5: tầm trung', 6: 'Hạng 6: trên trung', 7: 'Hạng 7: cao cấp', 9: 'Hạng 9: cao nhất' };

function lenovoLine(s) {
  if (/thinkpad/i.test(s)) return 'thinkpad';
  if (/thinkbook/i.test(s)) return 'thinkbook';
  if (/\bloq\b/i.test(s)) return 'loq';
  if (/legion/i.test(s)) return 'legion';
  if (/yoga/i.test(s)) return 'yoga';
  return 'ideapad';
}

function lenovoParse(s) {
  const u = lpNorm(s);
  let m;
  const yr = (y, extra) => ({ label: 'Đời', year: true, text: y ? 'Năm ' + y + (extra || '') : 'Chưa rõ' });
  // ThinkPad X1 Carbon / Yoga / Extreme / Nano / 2-in-1
  m = u.match(/\bX1\s*(Carbon|C|Yoga|Extreme|Nano|2[\s-]?in[\s-]?1|Titanium|Fold)\b\s*(?:Gen(?:eration)?|G)?\s*(\d{1,2})(?:st|nd|rd|th)?\b/i);
  if (m) {
    const v = m[1].toLowerCase().replace(/[\s-]/g, ''), gen = +m[2];
    const k = 'X1 ' + (v === 'c' ? 'Carbon' : v === '2in1' ? '2in1' : m[1][0].toUpperCase() + m[1].slice(1).toLowerCase());
    const y = tpYear(k, gen);
    return {
      line: 'thinkpad', year: y, size: v === 'extreme' ? '15,6–16″' : v === 'nano' ? '13″' : '14″', title: 'ThinkPad ' + k.replace('2in1', '2-in-1') + ' Gen ' + gen,
      parts: [{ ch: 'X1', label: 'Dòng', text: 'X1: cao cấp nhất của ThinkPad' }, { ch: m[1], label: 'Biến thể', text: TP_X1[v] || m[1] }, Object.assign({ ch: 'Gen ' + gen }, yr(y, ' (đời ' + gen + ')'))],
      pick: x => x.name.toLowerCase().indexOf(k.toLowerCase().replace('2in1', '2-in-1').replace('x1 c', 'x1 carbon')) >= 0
    };
  }
  m = u.match(/\bP1\s*(?:Gen(?:eration)?|G)\s*(\d)\b/i);
  if (m) {
    const y = tpYear('P1', +m[1]);
    return { line: 'thinkpad', year: y, size: '15,6–16″', title: 'ThinkPad P1 Gen ' + m[1], parts: [{ ch: 'P1', label: 'Dòng', text: 'P1: máy trạm mỏng nhẹ cao cấp, anh em với X1 Extreme' }, Object.assign({ ch: 'Gen ' + m[1] }, yr(y))] };
  }
  m = u.match(/\bX12\s*Detachable\s*(?:Gen|G)?\s*(\d)?/i);
  if (m) {
    const g = +(m[1] || 1), y = tpYear('X12', g);
    return { line: 'thinkpad', year: y, size: '12,3″', title: 'ThinkPad X12 Detachable Gen ' + g, parts: [{ ch: 'X12', label: 'Dòng', text: 'Máy tính bảng 12,3″ tháo bàn phím' }, Object.assign({ ch: 'Gen ' + g }, yr(y))] };
  }
  // ThinkPad đời mới: T14 Gen 3, T14s Gen 2, P14s G5, X13 Yoga Gen 2, E14 Gen 4
  m = u.match(/\b([TXPELZ])(1[2-8])([spgv])?\s*(Yoga\s*)?(?:Gen(?:eration)?|G)\s*(\d{1,2})\b/i);
  if (m) {
    const L = m[1].toUpperCase(), sz = m[2], suf = (m[3] || '').toLowerCase(), gen = +m[5];
    const k = L + sz + suf + (m[4] ? ' Yoga' : '');
    const y = tpYear(k, gen) || tpYear(L + sz, gen);
    const parts = [{ ch: L, label: 'Dòng', text: TP_SERIES[L] }, { ch: sz, label: 'Cỡ màn', text: LP_SIZE[sz] || sz + '″' }];
    if (suf) parts.push({ ch: suf, label: 'Biến thể', text: TP_SUFFIX[suf] });
    if (m[4]) parts.push({ ch: 'Yoga', label: 'Biến thể', text: 'Màn cảm ứng xoay gập' });
    parts.push(Object.assign({ ch: 'Gen ' + gen }, yr(y, ' (đời ' + gen + ')')));
    return { line: 'thinkpad', year: y, size: LP_SIZE[sz], title: 'ThinkPad ' + k + ' Gen ' + gen, parts };
  }
  // ThinkPad đời cũ: T480, T490s, X280, X390, E490, L480, A485
  m = u.toUpperCase().match(/\b([TXELA])([2-5])([789][05])(S)?\b/);
  if (m) {
    const y = TP_OLD_YEAR[m[3]];
    const parts = [{ ch: m[1], label: 'Dòng', text: TP_SERIES[m[1]] }, { ch: m[2], label: 'Cỡ màn', text: TP_OLD_SIZE[m[2]] || '?' },
      Object.assign({ ch: m[3][0] + '0', label: 'Đời' }, yr(y)), { ch: m[3][1], label: 'Chip', text: m[3][1] === '5' ? 'Bản chip AMD' : 'Chip Intel' }];
    if (m[4]) parts.splice(2, 0, { ch: 's', label: 'Biến thể', text: TP_SUFFIX.s });
    return { line: 'thinkpad', year: y, size: TP_OLD_SIZE[m[2]], title: 'ThinkPad ' + m[1] + m[2] + m[3] + (m[4] ? 's' : ''), parts };
  }
  m = u.toUpperCase().match(/\bP([457])([123])(S)?\b/);
  if (m) {
    const y = 2016 + +m[2];
    return {
      line: 'thinkpad', year: y, size: TP_OLD_SIZE[m[1]], title: 'ThinkPad P' + m[1] + m[2] + (m[3] ? 's' : ''),
      parts: [{ ch: 'P', label: 'Dòng', text: TP_SERIES.P }, { ch: m[1], label: 'Cỡ màn', text: TP_OLD_SIZE[m[1]] }, Object.assign({ ch: m[2], label: 'Đời' }, yr(y))].concat(m[3] ? [{ ch: 's', label: 'Biến thể', text: TP_SUFFIX.s }] : [])
    };
  }
  // ThinkBook 14 G4 IAP
  m = u.match(/\bThinkBook\s*(1[3-6])([sp])?\s*(?:G(\d{1,2})\s*\+?\s*)?([IAQ][A-Z]{2})?\b/i);
  if (m) {
    const g = m[3] ? +m[3] : null, plat = m[4] ? lenovoPlat(m[4].toUpperCase(), g ? TB_G_TO_GEN[g] : null) : null;
    const parts = [{ ch: m[1], label: 'Cỡ màn', text: LP_SIZE[m[1]] }];
    if (m[2]) parts.push({ ch: m[2], label: 'Biến thể', text: m[2] === 's' ? 'Bản mỏng nhẹ' : 'Bản hiệu năng cao' });
    if (g) parts.push({ ch: 'G' + g, label: 'Đời', text: 'Đời ' + g + ' của ThinkBook' });
    if (plat) parts.push({ ch: m[4].toUpperCase(), label: 'Nền tảng chip', text: plat.cpu, year: true });
    return { line: 'thinkbook', year: plat ? plat.year : null, size: LP_SIZE[m[1]], cpu: plat && plat.cpu, title: 'ThinkBook ' + m[1] + (m[2] || '') + (g ? ' G' + g : '') + (m[4] ? ' ' + m[4].toUpperCase() : ''), parts };
  }
  // Máy người dùng: Legion 5 15ACH6H, IdeaPad 5 14ITL05, Yoga Slim 7 14ITL05, LOQ 15IRH8
  m = u.toUpperCase().match(/\b(1[3-8])([IAQ])([A-Z0-9]{2})(05|\d{1,2})?(H)?\b/);
  if (m && (m[2] === 'Q' || LENOVO_PLAT[m[2] + m[3]])) {
    const line = lenovoLine(u), gen = m[4] || null;
    const plat = m[2] === 'Q' ? { cpu: 'Qualcomm Snapdragon X', year: 2024 } : lenovoPlat(m[2] + m[3], gen);
    const y = gen ? LP_GEN_YEAR[String(+gen === 5 ? '05' : +gen)] || plat.year : plat.year;
    const tier = u.match(/\b(?:Legion(?:\s+(?:Pro|Slim))?|IdeaPad(?:\s+(?:Gaming|Slim|Flex|Pro))?|Yoga(?:\s+(?:Slim|Pro|Book))?|V)\s+([13579])\b/i);
    const parts = [];
    if (tier) parts.push({ ch: tier[1], label: 'Hạng', text: LENOVO_TIER[tier[1]] || 'Hạng ' + tier[1] });
    if (/\bpro\b/i.test(u) && line === 'legion') parts.push({ ch: 'Pro', label: 'Biến thể', text: 'Bản Pro: màn to 16:10, mạnh hơn' });
    if (/\bslim\b/i.test(u)) parts.push({ ch: 'Slim', label: 'Biến thể', text: 'Bản mỏng nhẹ' });
    parts.push({ ch: m[1], label: 'Cỡ màn', text: LP_SIZE[m[1]] });
    parts.push({ ch: m[2], label: 'Hãng chip', text: m[2] === 'I' ? 'Intel' : m[2] === 'A' ? 'AMD' : 'Qualcomm' });
    if (m[2] !== 'Q') parts.push({ ch: m[3], label: 'Nền tảng chip', text: plat.cpu });
    parts.push({ ch: gen || '–', label: 'Đời', year: true, text: gen ? 'Đời ' + (+gen) + ': năm ' + y : 'Năm ' + y + ' (đời cũ, chưa đánh số)' });
    if (m[5]) parts.push({ ch: 'H', label: 'Hậu tố', text: 'Bản công suất cao: card chạy mạnh hơn bản không có H' });
    return { line, year: y, size: LP_SIZE[m[1]], cpu: plat.cpu, title: m[0], parts };
  }
  return null;
}

function decodeLenovo(s) {
  // Machine Type (4 ký tự đầu của mã trên tem, vd. 20W0S0XX00)
  const mt = s.toUpperCase().match(/\b(2[01][A-Z0-9]{2})(?:[A-Z0-9]{0,6})\b/);
  const mtHits = mt ? lpByCode(mt[1], 'lenovo') : [];
  const r = lpDecodeWith('lenovo', s, lenovoParse, lpFind(s, 'lenovo').length ? null : mtHits);
  if (r.ok && mt && mtHits.length && r.parts) r.parts = [{ ch: mt[1], label: 'Machine Type', text: 'Mã loại máy in trên tem đáy, tra ra đúng đời' }].concat(r.parts.length ? r.parts : []);
  return r;
}

// ---------- HP ----------
const HP_ELITE_SERIES = { '8': 'Dòng 800: chủ lực, vỏ nhôm', '6': 'Dòng 600: phổ thông', '7': 'Dòng 700: bản AMD đời cũ', '1': 'Dòng 1000: cao cấp nhất' };
const HP_PRO_SERIES = { '4': 'Dòng 400: phổ thông', '6': 'Dòng 600: bền hơn, nhiều cổng' };
const HP_SIZE = { '2': '12,5″', '3': '13,3″', '4': '14″', '5': '15,6″', '6': '16″', '7': '17,3″' };
const HP_ZB = { firefly: 'Firefly: mỏng nhẹ nhất, chip U', studio: 'Studio: mỏng, màn đẹp, card mạnh', power: 'Power: giá mềm, card khá', fury: 'Fury: mạnh nhất, 4 khe RAM', create: 'Create: cho người làm sáng tạo' };
const HP_SUFFIX = { TU: 'Chip Intel, không card rời (hàng châu Á)', TX: 'Chip Intel, có card rời (hàng châu Á)', AU: 'Chip AMD, không card rời (hàng châu Á)', AX: 'Chip AMD, có card rời (hàng châu Á)', NR: 'Hàng bán lẻ ở Mỹ', DX: 'Hàng bán lẻ ở Mỹ', WM: 'Hàng bán ở Walmart (Mỹ)' };
const HP_X1030 = { 2: 2017, 3: 2018, 4: 2019, 7: 2020, 8: 2021 };
const HP_DRAGONFLY = { 1: 2019, 2: 2021, 3: 2022, 4: 2023 };
// Mã dòng máy gia dụng: cỡ màn + chữ (nền tảng) + số (đời trong dòng). Ghi theo hiểu biết chung, chưa đối chiếu hết.
const HP_CODES = {
  '15-eg': ['pavilion', 'Intel', { 0: ['Intel Core thế hệ 11', 2020], 2: ['Intel Core thế hệ 12', 2022], 3: ['Intel Core thế hệ 13', 2023] }],
  '15-eh': ['pavilion', 'AMD', { 0: ['AMD Ryzen 4000', 2020], 1: ['AMD Ryzen 5000', 2021], 2: ['AMD Ryzen 5000', 2022], 3: ['AMD Ryzen 7000', 2023] }],
  '14-dv': ['pavilion', 'Intel', { 0: ['Intel Core thế hệ 11', 2020], 2: ['Intel Core thế hệ 12', 2022] }],
  '14-ec': ['pavilion', 'AMD', { 0: ['AMD Ryzen 5000', 2021] }],
  '14-dw': ['pavilion', 'Intel', { 0: ['Intel Core thế hệ 10', 2020], 1: ['Intel Core thế hệ 11', 2020] }],
  '14-dy': ['pavilion', 'Intel', { 0: ['Intel Core thế hệ 11', 2021], 2: ['Intel Core thế hệ 12', 2022] }],
  '13-be': ['pavilion', 'AMD', { 0: ['AMD Ryzen 5000', 2021], 2: ['AMD Ryzen 7000', 2023] }],
  '16-d': ['victus', 'Intel', { 0: ['Intel Core thế hệ 11 H', 2021], 1: ['Intel Core thế hệ 12 H', 2022] }],
  '16-e': ['victus', 'AMD', { 0: ['AMD Ryzen 5000 H', 2021], 1: ['AMD Ryzen 6000 H', 2022] }],
  '15-fa': ['victus', 'Intel', { 0: ['Intel Core thế hệ 12 H', 2022], 1: ['Intel Core thế hệ 12–13 H', 2023] }],
  '15-fb': ['victus', 'AMD', { 0: ['AMD Ryzen 5000 H', 2022], 1: ['AMD Ryzen 7035 / 7040', 2023] }],
  '16-r': ['victus', 'Intel', { 0: ['Intel Core thế hệ 13 H/HX', 2023], 1: ['Intel Core thế hệ 14 HX', 2024] }],
  '16-s': ['victus', 'AMD', { 0: ['AMD Ryzen 7040 H', 2023], 1: ['AMD Ryzen 8040 H', 2024] }],
  '15-dc': ['omen', 'Intel', { 0: ['Intel Core thế hệ 8 H', 2018], 1: ['Intel Core thế hệ 9 H', 2019] }],
  '15-ek': ['omen', 'Intel', { 0: ['Intel Core thế hệ 10 H', 2020], 1: ['Intel Core thế hệ 10 H', 2021] }],
  '15-en': ['omen', 'AMD', { 0: ['AMD Ryzen 4000 H', 2020], 1: ['AMD Ryzen 5000 H', 2021] }],
  '16-b': ['omen', 'Intel', { 0: ['Intel Core thế hệ 11 H', 2021], 1: ['Intel Core thế hệ 12 H', 2022] }],
  '16-c': ['omen', 'AMD', { 0: ['AMD Ryzen 5000 H', 2021] }],
  '16-k': ['omen', 'Intel', { 0: ['Intel Core thế hệ 12 H', 2022] }],
  '16-n': ['omen', 'AMD', { 0: ['AMD Ryzen 6000 H', 2022] }],
  '16-wf': ['omen', 'Intel', { 0: ['Intel Core thế hệ 13 HX', 2023], 1: ['Intel Core thế hệ 14 HX', 2024] }],
  '16-xf': ['omen', 'AMD', { 0: ['AMD Ryzen 7040 H', 2023] }],
  '13-ay': ['envy', 'AMD', { 0: ['AMD Ryzen 4000 U', 2020], 1: ['AMD Ryzen 5000 U', 2021] }],
  '13-bd': ['envy', 'Intel', { 0: ['Intel Core thế hệ 11', 2021] }],
  '13-bf': ['envy', 'Intel', { 0: ['Intel Core thế hệ 12', 2022] }],
  '13-ba': ['envy', 'Intel', { 0: ['Intel Core thế hệ 10', 2020], 1: ['Intel Core thế hệ 11', 2020] }],
  '14-ea': ['spectre', 'Intel', { 0: ['Intel Core thế hệ 11', 2020], 1: ['Intel Core thế hệ 11', 2021] }],
  '14-ef': ['spectre', 'Intel', { 0: ['Intel Core thế hệ 12', 2022], 2: ['Intel Core thế hệ 13', 2023] }],
  '13-aw': ['spectre', 'Intel', { 0: ['Intel Core thế hệ 10', 2020], 2: ['Intel Core thế hệ 11', 2020] }],
  '15s-fq': ['hp', 'Intel', { 1: ['Intel Core thế hệ 10', 2020], 2: ['Intel Core thế hệ 11', 2021], 5: ['Intel Core thế hệ 12', 2022] }],
  '15s-eq': ['hp', 'AMD', { 1: ['AMD Ryzen 3000 / 4000', 2020], 2: ['AMD Ryzen 5000', 2021] }],
  '14s-dq': ['hp', 'Intel', { 2: ['Intel Core thế hệ 11', 2021], 5: ['Intel Core thế hệ 12', 2022] }],
  '15-dw': ['hp', 'Intel', { 1: ['Intel Core thế hệ 10', 2020], 3: ['Intel Core thế hệ 11', 2021] }],
  '15-fc': ['hp', 'AMD', { 0: ['AMD Ryzen 7020 / 7030', 2023] }],
  '15-fd': ['hp', 'Intel', { 0: ['Intel Core thế hệ 13', 2023] }]
};

function hpParse(s) {
  const u = lpNorm(s);
  let m;
  const yt = (y, note) => ({ label: 'Đời', year: true, text: y ? 'Năm ' + y + (note || '') : 'Chưa rõ' });
  // Tên mới từ 2025: EliteBook 8 G1i 14, ZBook Ultra G1a 14, ProBook 4 G1i
  m = u.match(/\b(EliteBook|ProBook|ZBook|OmniBook)\s*(\d|X|Ultra|Fury|Power|Firefly)\s*G(\d)([iaq])\b(?:\s*(1[3-8]))?/i);
  if (m) {
    const y = 2024 + +m[3], line = m[1].toLowerCase() === 'omnibook' ? 'pavilion' : m[1].toLowerCase();
    return {
      line, year: y, size: m[5] ? LP_SIZE[m[5]] : '', title: 'HP ' + m[0],
      parts: [{ ch: m[2], label: 'Hạng', text: /^\d$/.test(m[2]) ? 'Hạng ' + m[2] + ' (số càng lớn càng cao cấp)' : m[2] + ': bản cao cấp, mỏng nhẹ' },
        Object.assign({ ch: 'G' + m[3] }, yt(y, ' (tên mới đặt từ 2025)')), { ch: m[4], label: 'Chip', text: m[4] === 'i' ? 'Intel' : m[4] === 'a' ? 'AMD' : 'Qualcomm Snapdragon' }]
        .concat(m[5] ? [{ ch: m[5], label: 'Cỡ màn', text: LP_SIZE[m[5]] }] : [])
    };
  }
  m = u.match(/\bDragonfly\s*(?:Max\s*)?G(\d)\b/i);
  if (m) {
    const y = HP_DRAGONFLY[m[1]];
    return { line: 'dragonfly', year: y, size: '13,3–13,5″', title: 'HP Elite Dragonfly G' + m[1], parts: [{ ch: 'Dragonfly', label: 'Dòng', text: 'Doanh nghiệp siêu nhẹ, khoảng 1 kg' }, Object.assign({ ch: 'G' + m[1] }, yt(y))] };
  }
  // Doanh nghiệp: EliteBook 840 G8, EliteBook x360 1040 G8, ProBook 450 G9, ZBook Firefly 14 G8, ZBook Studio G5, ZBook 15 G6
  m = u.match(/\b(EliteBook|ProBook|ZBook)\s*(x360\s*)?(?:(Firefly|Studio|Power|Fury|Create)\s*)?(\d{2,4}u?)?\s*G(\d{1,2})\b/i);
  if (m) {
    const line = m[1].toLowerCase(), x360 = !!m[2], zb = (m[3] || '').toLowerCase(), digits = m[4] || '', g = +m[5];
    let y = 2013 + g, note = '';
    if (line === 'probook') { y = g <= 8 ? 2012 + g : 2013 + g; if (g <= 8) note = ' (ra cuối năm)'; }
    if (line === 'elitebook' && /^1030$/.test(digits)) y = HP_X1030[g] || null;
    const parts = [];
    if (x360) parts.push({ ch: 'x360', label: 'Biến thể', text: 'Màn cảm ứng xoay gập 360°' });
    if (line === 'zbook') {
      if (zb) parts.push({ ch: m[3], label: 'Dòng ZBook', text: HP_ZB[zb] });
      if (digits) parts.push({ ch: digits, label: 'Cỡ màn', text: (LP_SIZE[digits.replace('u', '')] || digits + '″') + (/u$/.test(digits) ? ', bản chip U' : '') });
    } else if (/^\d{3,4}$/.test(digits)) {
      const d = digits.length === 4 ? digits.slice(1) : digits;
      const ser = digits.length === 4 ? '1' : d[0];
      parts.push({ ch: digits.length === 4 ? digits.slice(0, 2) : d[0], label: 'Hạng', text: (line === 'probook' ? HP_PRO_SERIES[ser] : HP_ELITE_SERIES[ser]) || 'Dòng ' + ser + '00' });
      parts.push({ ch: d[1], label: 'Cỡ màn', text: HP_SIZE[d[1]] || '?' });
      parts.push({ ch: d[2], label: 'Chip', text: d[2] === '5' || ser === '7' ? 'Chip AMD' : 'Chip Intel' });
    }
    parts.push(Object.assign({ ch: 'G' + g }, yt(y, ' (đời ' + g + note + ')')));
    const size = line === 'zbook' ? (LP_SIZE[digits.replace('u', '')] || '') : (/^\d{3,4}$/.test(digits) ? HP_SIZE[(digits.length === 4 ? digits.slice(1) : digits)[1]] : '');
    return { line, year: y, size, title: 'HP ' + m[0].replace(/\s+/g, ' '), parts };
  }
  // Máy gia dụng: Victus 16-d0123TX, 15s-fq2xxx, Pavilion x360 14-dw1017TU
  m = u.match(/\b(1[3-7])(s|z)?-([a-z]{1,2})(\d)(?:\d{3}|x{3})?([a-z]{2})?/i);
  if (m) {
    const k = m[1] + (m[2] || '').toLowerCase() + '-' + m[3].toLowerCase(), t = HP_CODES[k];
    const gen = +m[4], gi = t && t[2][gen];
    const line = t ? t[0] : (/victus/i.test(u) ? 'victus' : /omen/i.test(u) ? 'omen' : /envy/i.test(u) ? 'envy' : /spectre/i.test(u) ? 'spectre' : /pavilion/i.test(u) ? 'pavilion' : 'hp');
    const parts = [{ ch: m[1] + (m[2] || ''), label: 'Cỡ màn', text: (m[1] === '16' ? '16,1″' : LP_SIZE[m[1]]) + (m[2] ? ' (chữ ' + m[2] + ': bản giá rẻ)' : '') },
      { ch: m[3].toLowerCase(), label: 'Mã dòng', text: t ? LAPTOP_LINES[t[0]].name + ', chip ' + t[1] : 'Mã dòng chưa có trong bảng' },
      { ch: m[4], label: 'Đời', year: true, text: gi ? gi[0] + ', khoảng ' + gi[1] : 'Đời ' + gen + ' trong dòng' }];
    const suf = m[5] && HP_SUFFIX[m[5].toUpperCase()];
    if (suf) parts.push({ ch: m[5].toUpperCase(), label: 'Hậu tố', text: suf });
    return { line, year: gi ? gi[1] : null, size: m[1] === '16' ? '16,1″' : LP_SIZE[m[1]], cpu: gi ? gi[0] : '', title: 'HP ' + (LAPTOP_LINES[line] ? LAPTOP_LINES[line].name.replace('HP 14 / 15', 'HP') + ' ' : '') + k + m[4], parts, code: k + m[4] };
  }
  return null;
}

function decodeHP(s) {
  const p = hpParse(s);
  const hits = p && p.code ? lpByCode(p.code, 'hp') : null;
  return lpDecodeWith('hp', s, hpParse, hits && hits.length ? hits : null);
}

// ---------- Apple ----------
const APPLE_CHIP_YEAR = { M1: 2020, M2: 2022, M3: 2023, M4: 2024, M5: 2025, M6: 2026 };
function appleParse(s) {
  const t = lpNorm(s), lo = t.toLowerCase();
  const fam = /neo/.test(lo) ? 'neo' : /air|\bmba\b/.test(lo) ? 'air' : /macbook\s*pro|\bmbp\b|macbookpro/.test(lo) ? 'pro' : null;
  const chip = lo.match(/\bm([1-6])(?:\s*(pro|max))?\b/);
  const size = lo.match(/\b(13|14|15|16)(?:["″]|\s*inch|-inch)?\b/);
  const year = lo.match(/\b(201[5-9]|202\d)\b/);
  const anum = t.match(/\bA(1[5-9]\d{2}|[23]\d{3})\b/i);
  const ident = t.match(/\b(MacBook(?:Air|Pro)?\d{1,2},\d{1,2}|Mac1\d,\d{1,2})\b/i);
  const parts = [];
  if (anum) parts.push({ ch: 'A' + anum[1], label: 'Số model', text: 'In dưới đáy máy, cạnh dòng "Designed by Apple"' });
  if (ident) parts.push({ ch: ident[1], label: 'Model Identifier', text: 'Mã trong Báo cáo hệ thống' });
  if (size) parts.push({ ch: size[1], label: 'Cỡ màn', text: size[1] + '″' });
  if (chip) {
    const c = 'M' + chip[1], y = APPLE_CHIP_YEAR[c];
    parts.push({ ch: c + (chip[2] ? ' ' + chip[2][0].toUpperCase() + chip[2].slice(1) : ''), label: 'Chip', year: true, text: 'Apple ' + c + (chip[2] ? ' ' + chip[2][0].toUpperCase() + chip[2].slice(1) : '') + ', chip ra từ ' + y });
  }
  if (year && !chip) parts.push({ ch: year[1], label: 'Năm', year: true, text: 'Năm ' + year[1] });
  if (!parts.length) return null;
  return {
    line: fam ? 'macbook' + fam : null, parts, year: year ? +year[1] : (chip ? APPLE_CHIP_YEAR['M' + chip[1]] : null),
    size: size ? size[1] + '″' : '', title: 'MacBook ' + (fam === 'air' ? 'Air' : fam === 'neo' ? 'Neo' : 'Pro') + (size ? ' ' + size[1] : '') + (chip ? ' M' + chip[1] + (chip[2] ? ' ' + chip[2] : '') : ''),
    fam, chip: chip ? 'm' + chip[1] + (chip[2] ? ' ' + chip[2].toLowerCase() : '') : null, sizeN: size ? size[1] : null, anum: anum ? 'A' + anum[1] : null, ident: ident ? ident[1] : null
  };
}

function decodeApple(s) {
  // Số máy (part number) MGN63LL/A: chỉ ra nguồn gốc, thị trường; không ra đời máy
  const pn = s.toUpperCase().replace(/\s+/g, '').match(/^([A-Z0-9]{1,3}[A-Z0-9]{4})([A-Z]{1,2})\/A$/);
  if (pn && typeof decodeApplePartNo === 'function') {
    const r = decodeApplePartNo(s);
    if (r && r.ok) {
      const reg = r.regionModern || r.regionLegacy;
      return {
        ok: true, kind: 'code', brand: 'apple', line: 'macbookpro', lineName: 'MacBook', lineKind: 'Số máy Apple (part number)', lineShort: '', code: s.toUpperCase(), title: s.toUpperCase(),
        parts: [{ ch: r.first, label: 'Nguồn gốc', text: r.source.text }, { ch: r.config, label: 'Cấu hình', text: 'Mã cấu hình (chip, RAM, ổ, màu)' }, { ch: r.region + '/A', label: 'Thị trường', text: reg ? (reg.name || reg.text || reg) : 'Chưa rõ' }],
        year: null, approx: true, size: '', cpu: '', models: [], warn: 'Số máy cho biết nguồn gốc và thị trường. Muốn biết đời máy, xem số model A… dưới đáy máy hoặc Model Identifier.'
      };
    }
  }
  const p = appleParse(s);
  let hits = lpFind(s, 'apple');
  if (p && (p.anum || p.ident)) hits = lpByCode(p.anum || p.ident, 'apple');
  else if (p && p.fam) {
    hits = lpAll().filter(m => {
      if (m.brand !== 'apple') return false;
      const q = appleParse(m.name);
      if (!q || q.fam !== p.fam) return false;
      if (p.chip && q.chip !== p.chip) return false;
      if (p.sizeN && q.sizeN && p.sizeN !== q.sizeN) return false;
      if (!p.chip && p.year && m.year !== p.year && !(m.name.indexOf('–') > 0 && m.year < p.year && m.year >= p.year - 2)) return false;
      if (!p.chip && !p.year) return false;
      if (/oled/i.test(m.name) !== /oled/i.test(s)) return false;
      return true;
    });
    if (p.chip && !p.sizeN && hits.length > 1) { const h = hits.filter(m => /Air 13|Pro 13|Neo/.test(m.name)); if (h.length === 1) hits = h; }
  }
  return lpDecodeWith('apple', s, appleParse, hits.length ? hits : null);
}

// ---------- ASUS ----------
const ASUS_PREFIX = {
  FX: ['tuf', 'TUF Gaming, chip Intel'], FA: ['tuf', 'TUF Gaming, chip AMD'], GA: ['rog', 'ROG Zephyrus, chip AMD'], GU: ['rog', 'ROG Zephyrus, chip Intel'],
  GV: ['rog', 'ROG Flow X, xoay gập'], GX: ['rog', 'ROG Zephyrus S / Duo'], GZ: ['rog', 'ROG Flow Z13, máy tính bảng'], G: ['rog', 'ROG Strix'],
  UX: ['zenbook', 'Zenbook, chip Intel'], UM: ['zenbook', 'Zenbook, chip AMD'], X: ['vivobook', 'Vivobook phổ thông, chip Intel'], M: ['vivobook', 'Vivobook phổ thông, chip AMD'],
  K: ['vivobook', 'Vivobook Pro / 15X / 16X'], S: ['vivobook', 'Vivobook S'], E: ['vivobook', 'Vivobook Go, giá rẻ'], V: ['vivobook', 'Vivobook Gaming'],
  N: ['vivobook', 'Vivobook Pro N'], A: ['vivobook', 'Vivobook (tên mới từ 2023), chip Intel'], B: ['expertbook', 'ExpertBook (doanh nghiệp)'], P: ['expertbook', 'ExpertBook P'], H: ['zenbook', 'ProArt Studiobook']
};
const ASUS_AMD_PREFIX = ['FA', 'GA', 'UM', 'M'];
const ASUS_PLAT_INTEL = {
  F: ['Intel Core thế hệ 8–10 U', 2019], J: ['Intel Core thế hệ 10 (Ice Lake)', 2020], L: ['Intel Core thế hệ 10 H (Comet Lake)', 2020],
  E: ['Intel Core thế hệ 11 U (Tiger Lake)', 2021], H: ['Intel Core thế hệ 11 H (Tiger Lake)', 2021], P: ['Intel Core thế hệ 11 H35 (Tiger Lake)', 2021],
  Z: ['Intel Core thế hệ 12 (Alder Lake)', 2022], V: ['Intel Core thế hệ 13 (Raptor Lake)', 2023], M: ['Intel Core Ultra thế hệ 1 (Meteor Lake)', 2024],
  S: ['Intel Core Ultra thế hệ 2 V (Lunar Lake)', 2024], C: ['Intel Core Ultra thế hệ 2 H (Arrow Lake)', 2025]
};
const ASUS_PLAT_AMD = {
  D: ['AMD Ryzen 3000 (Picasso)', 2019], I: ['AMD Ryzen 4000 (Renoir)', 2020], Q: ['AMD Ryzen 5000 H (Cezanne)', 2021], U: ['AMD Ryzen 5000 U', 2021],
  R: ['AMD Ryzen 6000 H (Rembrandt)', 2022], T: ['AMD Ryzen 6000 U (Rembrandt)', 2022], N: ['AMD Ryzen 7035 H (Rembrandt-R)', 2023],
  X: ['AMD Ryzen 7040 H (Phoenix)', 2023], Y: ['AMD Ryzen 7030 U (Barcelo-R)', 2023], F: ['AMD Ryzen 7020 (Mendocino)', 2023],
  K: ['AMD Ryzen 7040 U (Phoenix)', 2023], W: ['AMD Ryzen AI 300 (Strix Point)', 2024], E: ['AMD Ryzen AI Max (Strix Halo)', 2025]
};
const ASUS_GPU = {
  2020: { A: 'Card tích hợp', H: 'NVIDIA GTX 1650', I: 'NVIDIA GTX 1650 Ti', U: 'NVIDIA GTX 1660 Ti', V: 'NVIDIA RTX 2060', W: 'NVIDIA RTX 2070', S: 'NVIDIA RTX 2080 Super', C: 'NVIDIA RTX 3050', E: 'NVIDIA RTX 3050 Ti', M: 'NVIDIA RTX 3060' },
  2021: { A: 'Card tích hợp', F: 'NVIDIA RTX 2050', H: 'NVIDIA GTX 1650', C: 'NVIDIA RTX 3050', E: 'NVIDIA RTX 3050 Ti', M: 'NVIDIA RTX 3060', R: 'NVIDIA RTX 3070', W: 'NVIDIA RTX 3070 Ti', S: 'NVIDIA RTX 3080', Z: 'NVIDIA RTX 3080 Ti', J: 'AMD Radeon RX 6700S', K: 'AMD Radeon RX 6800S', Y: 'AMD Radeon RX 6800M' },
  2023: { A: 'Card tích hợp', C: 'NVIDIA RTX 3050', J: 'NVIDIA RTX 3050', U: 'NVIDIA RTX 4050', V: 'NVIDIA RTX 4060', I: 'NVIDIA RTX 4070', Z: 'NVIDIA RTX 4080', Y: 'NVIDIA RTX 4090' }
};
function asusParse(s) {
  const u = lpNorm(s).toUpperCase();
  const m = u.match(/\b(FX|FA|GA|GU|GV|GX|GZ|UX|UM|G|X|M|K|S|E|B|P|H|V|N|A)(\d{3,4})([A-Z]{2,3})\b/);
  if (!m) return null;
  const pre = m[1], dg = m[2], L = m[3];
  let plat, gpu, extra = '';
  if (L.length === 3 && (pre === 'B' || pre === 'P')) { extra = L[0]; plat = L[1]; gpu = L[2]; } else { plat = L[0]; gpu = L[1]; extra = L[2] || ''; }
  let amd = ASUS_AMD_PREFIX.indexOf(pre) >= 0;
  if (['G', 'GV', 'GX', 'GZ'].indexOf(pre) >= 0) amd = 'DIQRNXYTW'.indexOf(plat) >= 0 || (pre === 'GZ' && plat === 'E');
  let P = (amd ? ASUS_PLAT_AMD : ASUS_PLAT_INTEL)[plat] || null;
  if (P && !amd && plat === 'J' && ['G', 'GU', 'FX'].indexOf(pre) >= 0) P = ['Intel Core thế hệ 13–14 HX (Raptor Lake)', 2023];
  if (P && !amd && plat === 'M' && dg.length === 3 && ['X', 'E'].indexOf(pre) >= 0) P = ['Intel Celeron / Pentium (Gemini Lake)', 2020];
  if (P && amd && plat === 'U' && ['FA', 'GA'].indexOf(pre) >= 0) P = ['AMD Ryzen 8040 H (Hawk Point)', 2024];
  const year = P ? P[1] : null;
  const gmap = ASUS_GPU[year && year >= 2023 ? 2023 : year && year >= 2021 ? 2021 : 2020];
  const gtext = gmap[gpu] || (year >= 2025 ? 'Card rời đời 2025 (chưa có trong bảng)' : 'Chưa rõ');
  const size = LP_SIZE[{ '3': '13', '4': '14', '5': '15', '6': '16', '7': '17', '8': '18' }[dg.length === 3 ? dg[0] : dg[1]]] || '';
  const pinfo = ASUS_PREFIX[pre];
  const parts = [{ ch: pre, label: 'Dòng', text: pinfo[1] },
    { ch: dg, label: 'Khung máy', text: (size ? 'Cỡ ' + size : 'Mã khung') + (dg.length === 4 ? ', hạng ' + dg[0] : '') },
    { ch: plat, label: 'Nền tảng chip', year: true, text: P ? P[0] + ' (' + P[1] + ')' : 'Chưa có trong bảng' },
    { ch: gpu, label: 'Card', text: gtext }];
  if (extra) parts.push({ ch: extra, label: 'Ký hiệu thêm', text: 'Biến thể cấu hình (màn, ổ, màu)' });
  return { line: pinfo[0], year, size, cpu: P ? P[0] : '', title: 'ASUS ' + m[0], parts, code: pre + dg + plat + gpu };
}
function decodeAsus(s) {
  const p = asusParse(s);
  let hits = lpFind(s, 'asus');
  if (!hits.length && p) hits = lpByCode(p.code, 'asus');
  return lpDecodeWith('asus', s, asusParse, hits.length ? hits : null);
}

// ---------- Acer ----------
const ACER_PREFIX = {
  A: ['aspire', 'Aspire'], AL: ['aspire', 'Aspire Lite'], EX: ['aspire', 'Extensa, giá rẻ'], TMP: ['aspire', 'TravelMate P, doanh nghiệp'],
  AN: ['nitro', 'Nitro 5 (Aspire Nitro)'], ANV: ['nitro', 'Nitro V'], PH: ['predator', 'Predator Helios'], PHN: ['predator', 'Predator Helios Neo'],
  PT: ['predator', 'Predator Triton'], SF: ['swift', 'Swift'], SFG: ['swift', 'Swift Go'], SFX: ['swift', 'Swift X (có card rời)'], SP: ['swift', 'Spin, xoay gập']
};
// Số sau gạch: số đầu 4 (hoặc 2) là AMD, 5 và 7 là Intel, 3 là Intel Celeron/Pentium; các số sau là đời trong khung.
const ACER_GEN = {
  'AN515-42': ['AMD Ryzen 2000 H', 2018], 'AN515-43': ['AMD Ryzen 3000 H', 2019], 'AN515-44': ['AMD Ryzen 4000 H', 2020], 'AN515-45': ['AMD Ryzen 5000 H', 2021],
  'AN515-46': ['AMD Ryzen 6000 H', 2022], 'AN515-47': ['AMD Ryzen 7035', 2023], 'AN515-51': ['Intel Core thế hệ 7 H', 2017], 'AN515-52': ['Intel Core thế hệ 8 H', 2018],
  'AN515-53': ['Intel Core thế hệ 8 H', 2018], 'AN515-54': ['Intel Core thế hệ 9 H', 2019], 'AN515-55': ['Intel Core thế hệ 10 H', 2020], 'AN515-56': ['Intel Core thế hệ 11 (U, H35)', 2021],
  'AN515-57': ['Intel Core thế hệ 11 H', 2021], 'AN515-58': ['Intel Core thế hệ 12 H', 2022], 'AN517-55': ['Intel Core thế hệ 10 H', 2020],
  'ANV15-41': ['AMD Ryzen 7035', 2023], 'ANV15-51': ['Intel Core thế hệ 13 H', 2023], 'ANV15-52': ['Intel Core thế hệ 13 H / Core 200H', 2024],
  'AN16-41': ['AMD Ryzen 7040 H', 2023], 'AN16-51': ['Intel Core thế hệ 13 H', 2023],
  'PH315-51': ['Intel Core thế hệ 8 H', 2018], 'PH315-52': ['Intel Core thế hệ 9 H', 2019], 'PH315-53': ['Intel Core thế hệ 10 H', 2020],
  'PH315-54': ['Intel Core thế hệ 11 H', 2021], 'PH315-55': ['Intel Core thế hệ 12 H', 2022], 'PHN16-71': ['Intel Core thế hệ 13 HX', 2023],
  'PHN16-72': ['Intel Core thế hệ 14 HX', 2024], 'PH16-71': ['Intel Core thế hệ 13 HX', 2023], 'PH16-72': ['Intel Core thế hệ 14 HX', 2024],
  'PT315-52': ['Intel Core thế hệ 10 H', 2020], 'PT315-53': ['Intel Core thế hệ 11 H', 2021],
  'A515-43': ['AMD Ryzen 3000 U', 2019], 'A515-44': ['AMD Ryzen 4000 U', 2020], 'A515-45': ['AMD Ryzen 5000 U', 2021], 'A515-47': ['AMD Ryzen 7030 U', 2023],
  'A515-52': ['Intel Core thế hệ 8 U', 2018], 'A515-53': ['Intel Core thế hệ 8 U (Whiskey Lake)', 2019], 'A515-54': ['Intel Core thế hệ 8–10 U', 2019],
  'A515-55': ['Intel Core thế hệ 10 (Ice Lake)', 2020], 'A515-56': ['Intel Core thế hệ 11', 2021], 'A515-57': ['Intel Core thế hệ 12', 2022], 'A515-58': ['Intel Core thế hệ 13', 2023],
  'A315-23': ['AMD Ryzen 3000 U', 2019], 'A315-34': ['Intel Celeron / Pentium', 2019], 'A315-35': ['Intel Celeron / Pentium', 2021], 'A315-54': ['Intel Core thế hệ 8–10 U', 2019],
  'A315-56': ['Intel Core thế hệ 10 (Ice Lake)', 2020], 'A315-58': ['Intel Core thế hệ 11', 2021], 'A315-59': ['Intel Core thế hệ 12', 2022],
  'A514-54': ['Intel Core thế hệ 11', 2021], 'A514-55': ['Intel Core thế hệ 12', 2022], 'A715-41': ['AMD Ryzen 3000 H', 2019], 'A715-42': ['AMD Ryzen 5000 U', 2021],
  'A715-75': ['Intel Core thế hệ 10 H', 2020], 'A715-76': ['Intel Core thế hệ 12 H', 2022],
  'SF314-57': ['Intel Core thế hệ 10 (Ice Lake)', 2019], 'SF314-58': ['Intel Core thế hệ 10 U (Comet Lake)', 2020], 'SF314-59': ['Intel Core thế hệ 11', 2020],
  'SF314-511': ['Intel Core thế hệ 11', 2021], 'SF314-512': ['Intel Core thế hệ 12', 2022], 'SF314-71': ['Intel Core thế hệ 12 H', 2022],
  'SF314-41': ['AMD Ryzen 3000 U', 2019], 'SF314-42': ['AMD Ryzen 4000 U', 2020], 'SF314-43': ['AMD Ryzen 5000 U', 2021],
  'SFG14-71': ['Intel Core thế hệ 13', 2023], 'SFG14-72': ['Intel Core Ultra thế hệ 1', 2024], 'SFG14-41': ['AMD Ryzen 7040', 2023],
  'SFX14-41': ['AMD Ryzen 5000 U', 2021], 'SFX14-51': ['Intel Core thế hệ 12', 2022]
};
const ACER_SIZE = { '13': '13,3″', '14': '14″', '15': '15,6″', '16': '16″', '17': '17,3″', '18': '18″' };
const ACER_TIER = { '1': 'Hạng 1: rẻ nhất', '2': 'Hạng 2', '3': 'Hạng 3: phổ thông', '5': 'Hạng 5: tầm trung', '6': 'Hạng 6', '7': 'Hạng 7: cao hơn' };
function acerParse(s) {
  const u = lpNorm(s).toUpperCase();
  const m = u.match(/\b(ANV|AN|PHN|PH|PT|SFG|SFX|SF|SP|TMP|EX|AL|A)(\d{2,3})-(\d{2,3})([A-Z]{0,2})\b/);
  if (!m) return null;
  const pre = m[1], d = m[2], n = m[3], suf = m[4];
  const tier = d.length === 3 ? d[0] : '', sz = d.length === 3 ? d.slice(1) : d;
  const key = pre + d + '-' + n, g = ACER_GEN[key];
  const vend = n[0] === '4' || n[0] === '2' ? 'AMD' : n[0] === '3' ? 'Intel Celeron / Pentium' : 'Intel';
  const pinfo = ACER_PREFIX[pre];
  const parts = [{ ch: pre, label: 'Dòng', text: pinfo[1] }];
  if (tier) parts.push({ ch: tier, label: 'Hạng', text: pre === 'AN' ? 'Nitro 5' : pre === 'PH' || pre === 'PT' ? 'Dòng 300' : ACER_TIER[tier] || 'Hạng ' + tier });
  parts.push({ ch: sz, label: 'Cỡ màn', text: ACER_SIZE[sz] || sz + '″' });
  parts.push({ ch: n, label: 'Nền tảng', year: true, text: g ? g[0] + ' (' + g[1] + ')' : 'Chip ' + vend + ', đời ' + n.slice(1) + ' của khung' });
  if (/G/.test(suf)) parts.push({ ch: 'G', label: 'Hậu tố', text: 'Có card rời (G = graphics)' });
  return { line: pinfo[0], year: g ? g[1] : null, size: ACER_SIZE[sz] || '', cpu: g ? g[0] : vend, title: 'Acer ' + pre + d + '-' + n + suf, parts, code: pre + d + '-' + n };
}
function decodeAcer(s) {
  const p = acerParse(s);
  let hits = lpFind(s, 'acer');
  if (!hits.length && p) hits = lpByCode(p.code, 'acer');
  return lpDecodeWith('acer', s, acerParse, hits.length ? hits : null);
}

// ---------- MSI ----------
const MSI_SERIES = { R: 'NVIDIA GTX 10', S: 'NVIDIA GTX 16 hoặc RTX 20', U: 'NVIDIA RTX 30', V: 'NVIDIA RTX 40', W: 'NVIDIA RTX 50', M: 'Card tích hợp' };
const MSI_TIER = {
  R: { C: 'GTX 1050', D: 'GTX 1050 Ti', E: 'GTX 1060', F: 'GTX 1070', G: 'GTX 1080' },
  S: { C: 'GTX 1650', D: 'GTX 1660 Ti', E: 'RTX 2060', F: 'RTX 2070', G: 'RTX 2080' },
  U: { C: 'RTX 3050', D: 'RTX 3050 Ti', E: 'RTX 3060', F: 'RTX 3060', G: 'RTX 3070 / 3070 Ti', H: 'RTX 3080 / 3080 Ti' },
  V: { D: 'RTX 4050', E: 'RTX 4050', F: 'RTX 4060', G: 'RTX 4070', H: 'RTX 4080', I: 'RTX 4090' },
  W: { E: 'RTX 5050', F: 'RTX 5060', G: 'RTX 5070', H: 'RTX 5080', I: 'RTX 5090' }
};
const MSI_FRAME = /\b(GF63|GF65|GF66|GF75|GF76|GL66|GL76|GP66|GP76|GE66|GE76|GS66|GS76|Katana(?:\s+A?1[57])?|Sword(?:\s+1[57])?|Cyborg(?:\s+1[57])?|Bravo(?:\s+1[57])?|Alpha(?:\s+1[57])?|Delta(?:\s+15)?|Pulse(?:\s+\w+)?|Crosshair(?:\s+1[5-7])?|Vector(?:\s+\w+)?|Raider(?:\s+\w+)?|Stealth(?:\s+\w+)?|Titan|Modern(?:\s+1[3-5])?|Prestige(?:\s+1[3-6])?|Creator|Summit|Thin)\b/i;
function msiParse(s) {
  const t = lpNorm(s);
  const fr = t.match(MSI_FRAME);
  const amdFrame = /bravo|alpha|delta|katana\s*a1|a15 ai|venture a/i.test(t);
  const m = t.toUpperCase().match(amdFrame ? /\b([A-F])(\d)([A-Z])([A-Z])([A-Z]{0,2})\b/ : /\b([A-F]?)(\d{1,2})([MRSUVW])([A-Z]?)([A-Z]{0,3})\b/);
  if (!m || (!fr && !/msi/i.test(t))) return null;
  const rev = m[1], gen = +m[2], s1 = m[3], s2 = m[4], rest = m[5];
  let cpu, year;
  if (amdFrame) { cpu = 'AMD Ryzen ' + gen + '000'; year = { 4: 2020, 5: 2021, 6: 2022, 7: 2023, 8: 2024 }[gen] || null; } else if (gen <= 2) { cpu = 'Intel Core Ultra thế hệ ' + gen; year = gen === 1 ? 2024 : 2025; } else { cpu = 'Intel Core thế hệ ' + gen; year = gen >= 7 && gen <= 14 ? 2010 + gen : null; }
  const nv = MSI_TIER[s1] && MSI_TIER[s1][s2];
  const gtext = amdFrame && !MSI_TIER[s1] ? 'Card AMD Radeon RX' : s1 === 'M' ? 'Card tích hợp' : nv ? 'NVIDIA ' + nv : (MSI_SERIES[s1] || 'Chưa rõ');
  const parts = [];
  if (fr) parts.push({ ch: fr[1], label: 'Dòng', text: /modern|prestige|summit|creator/i.test(fr[1]) ? 'Văn phòng, mỏng nhẹ' : 'Máy chơi game, khung ' + (/7\d|17/.test(fr[1]) ? '17,3″' : '15,6″') });
  if (rev) parts.push({ ch: rev, label: 'Lần làm', text: rev === 'A' ? 'Bản đầu của khung' : 'Bản làm lại (' + rev + ')' });
  parts.push({ ch: String(gen), label: 'Chip', year: true, text: cpu + (year ? ' (' + year + ')' : '') });
  parts.push({ ch: s1 + (s2 || ''), label: 'Card', text: gtext });
  if (rest) parts.push({ ch: rest, label: 'Ký hiệu thêm', text: 'Biến thể cấu hình (màn, ổ, màu)' });
  const line = fr && /modern|prestige|summit|creator/i.test(fr[1]) ? 'msioffice' : 'msigaming';
  return { line, year, cpu, title: 'MSI ' + (fr ? fr[1] + ' ' : '') + m[0], parts, code: m[0], frame: fr ? fr[1].toLowerCase() : '' };
}
function decodeMsi(s) {
  const p = msiParse(s);
  let hits = lpFind(s, 'msi');
  if (!hits.length && p) {
    hits = lpAll().filter(m => m.brand === 'msi' && lpHas(lpKey(m.name), p.code.toLowerCase()));
    if (hits.length > 1 && p.frame) { const h = hits.filter(m => m.name.toLowerCase().indexOf(p.frame.split(' ')[0]) >= 0); if (h.length) hits = h; }
  }
  return lpDecodeWith('msi', s, msiParse, hits.length ? hits : null);
}

const LP_DECODERS = { lenovo: decodeLenovo, hp: decodeHP, apple: decodeApple, asus: decodeAsus, acer: decodeAcer, msi: decodeMsi };
