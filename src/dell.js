// ===== Đọc tên laptop Dell =====
// Dell đặt số hiệu theo quy tắc: chữ số đầu là hạng (3 phổ thông, 5 tầm trung, 7 cao cấp, 9 cao nhất),
// chữ số thứ hai là cỡ màn hình, các số sau là đời (năm) và biến thể. Mỗi dòng có ngoại lệ riêng, nên
// bảng DELL_MODELS (data-laptop.js) luôn được ưu tiên; quy tắc chỉ dùng khi đời máy chưa có trong bảng.
// Từ 01/2025 Dell bỏ tên Precision / Latitude / XPS / Inspiron, đổi sang Dell, Dell Pro, Dell Pro Max.

const DELL_SIZE = { '1': '11,6″', '2': '12,5″', '3': '13,3″', '4': '14″', '5': '15,6″', '6': '16″', '7': '17,3″', '8': '18″' };

const DELL_LINES = {
  precision: {
    name: 'Precision', kind: 'Máy trạm di động (workstation)', short: 'Máy trạm',
    tiers: { '3': 'Dòng 3000, rẻ nhất', '5': 'Dòng 5000, mỏng nhẹ, vỏ nhôm', '7': 'Dòng 7000, mạnh, dễ nâng cấp' },
    year: d => (d >= 1 ? 2015 + d : null),
    variant: { '0': 'Bản thường', '1': 'Chip H và card NVIDIA mạnh hơn (chỉ dòng 3000)' }
  },
  latitude: {
    name: 'Latitude', kind: 'Laptop doanh nghiệp', short: 'Doanh nghiệp',
    tiers: { '3': 'Dòng 3000, phổ thông', '5': 'Dòng 5000, tầm trung', '7': 'Dòng 7000, cao cấp, mỏng nhẹ', '9': 'Dòng 9000, cao nhất (từ 2020)' },
    gen2: { '70': 2016, '80': 2017, '90': 2018, '00': 2019, '10': 2020, '20': 2021, '30': 2022, '40': 2023, '50': 2024 },
    genE: { '40': 2014, '50': 2015, '70': 2016 },
    variant: { '0': 'Bản thường (chip tiết kiệm điện U)', '1': 'Bản mạnh hơn (chip H hoặc P, có thể có card rời)', '5': 'Bản chip AMD' }
  },
  vostro: {
    name: 'Vostro', kind: 'Laptop cho doanh nghiệp nhỏ', short: 'Doanh nghiệp nhỏ',
    tiers: { '3': 'Dòng 3000, giá rẻ', '5': 'Dòng 5000, tầm trung', '7': 'Dòng 7000, cấu hình cao' },
    year: d => ({ 8: 2018, 9: 2019, 0: 2020, 1: 2021, 2: 2022, 3: 2023, 4: 2024 })[d] || null,
    variant: { '0': 'Chip Intel', '2': 'Bản giữa năm 2020 (5402, 5502)', '5': 'Chip AMD' }
  },
  inspiron: {
    name: 'Inspiron', kind: 'Laptop phổ thông, gia đình', short: 'Phổ thông',
    tiers: { '3': 'Dòng 3000, giá rẻ', '5': 'Dòng 5000, tầm trung', '7': 'Dòng 7000, cao cấp' },
    year: d => ({ 7: 2017, 8: 2018, 9: 2019, 0: 2020, 1: 2021, 2: 2022, 3: 2023, 4: 2024 })[d] || null,
    variant: { '0': 'Chip Intel', '1': 'Chip Intel khác cùng năm, hoặc Snapdragon (2024)', '5': 'Chip AMD' }
  },
  xps: {
    name: 'XPS', kind: 'Laptop cao cấp mỏng nhẹ', short: 'Cao cấp',
    tiers: { '9': 'Số 9: XPS', '7': 'Số 7: XPS đời 2019' },
    year: (d, d1) => (d1 === '7' ? 2019 : ({ 0: 2020, 1: 2021, 2: 2022, 3: 2023, 4: 2024, 5: 2025 })[d] || null),
    variant: { '0': 'Bản thường', '5': 'Biến thể: bản rẻ hơn hoặc chip khác (AMD, Snapdragon)' }
  },
  g: {
    name: 'G', kind: 'Laptop chơi game', short: 'Chơi game',
    tiers: { '5': 'G15, game phổ thông', '7': 'G16, game cao hơn' },
    year: d => ({ 0: 2020, 1: 2021, 2: 2022, 3: 2023, 4: 2024 })[d] || null,
    variant: { '0': 'Chip Intel', '1': 'Chip Intel đời khác cùng năm (5511)', '5': 'Chip AMD' }
  }
};

// Đời chip Intel theo năm ra mắt, chỉ để đoán khi chưa có trong bảng.
const DELL_CPU_BY_YEAR = {
  2014: 'Intel Core thế hệ 4 (Haswell)', 2015: 'Intel Core thế hệ 5–6', 2016: 'Intel Core thế hệ 6 (Skylake)',
  2017: 'Intel Core thế hệ 7 (Kaby Lake)', 2018: 'Intel Core thế hệ 8 (Coffee Lake, Kaby Lake R)',
  2019: 'Intel Core thế hệ 8–9 (Whiskey Lake, Coffee Lake Refresh)', 2020: 'Intel Core thế hệ 10 (Comet Lake, Ice Lake)',
  2021: 'Intel Core thế hệ 11 (Tiger Lake)', 2022: 'Intel Core thế hệ 12 (Alder Lake)', 2023: 'Intel Core thế hệ 13 (Raptor Lake)',
  2024: 'Intel Core Ultra thế hệ 1 (Meteor Lake) hoặc Core thế hệ 14', 2025: 'Intel Core Ultra thế hệ 2 (Arrow Lake, Lunar Lake)'
};

// Tên mới từ 2025: Dell (người dùng), Dell Pro (doanh nghiệp), Dell Pro Max (máy trạm); hạng Base / Plus / Premium.
const DELL_NEW_BRANDS = { D: 'Dell', P: 'Dell Pro', M: 'Dell Pro Max' };
const DELL_NEW_TIERS = { A: 'Premium', B: 'Plus', C: 'Base' };

function dellNorm(s) {
  return String(s || '').replace(/\s+/g, ' ').replace(/[‐-―]/g, '-').trim();
}

// Tìm trong bảng theo dòng + số hiệu, hoặc chỉ số hiệu (có thể trùng nhiều dòng, vd. 5420).
function dellFind(line, code) {
  if (typeof DELL_MODELS === 'undefined') return [];
  return DELL_MODELS.filter(m => (m.code || '').toUpperCase() === String(code).toUpperCase() && (!line || m.line === line));
}

function dellByName(name) {
  if (typeof DELL_MODELS === 'undefined') return null;
  const n = dellNorm(name).toLowerCase();
  return DELL_MODELS.find(m => m.name.toLowerCase() === n || m.name.toLowerCase() === 'dell ' + n) || null;
}

// Đời trước, đời sau, cùng đời khác cỡ / khác hạng.
function dellNeighbors(m) {
  if (!m || typeof DELL_MODELS === 'undefined') return { prev: null, next: null, same: [] };
  const peers = DELL_MODELS.filter(x => x.line === m.line && x.id !== m.id && x.year);
  const sameShape = peers.filter(x => x.series === m.series && x.size === m.size && x.code && /^\d{4}$/.test(x.code) && x.code[3] === m.code[3]);
  const prev = sameShape.filter(x => x.year < m.year).sort((a, b) => b.year - a.year)[0] || null;
  const next = sameShape.filter(x => x.year > m.year).sort((a, b) => a.year - b.year)[0] || null;
  const same = DELL_MODELS.filter(x => x.id !== m.id && x.year === m.year && x.family === m.family && x !== prev && x !== next).slice(0, 6);
  return { prev, next, same };
}

// Giải mã một tên máy. Trả về { ok, line, code, parts: [{ch, label, text}], year, approx, cpu, size, models, msg }.
function decodeDell(raw) {
  const s0 = dellNorm(raw);
  if (!s0) return null;
  const s = s0.replace(/^dell\s+/i, '');
  let m;

  // 1) Mã máy kiểu mới, vd. PB14250, MC16250, DB14250
  m = s.match(/^([DPM])([ABC])(\d{2})(\d{2})(\d)$/i);
  if (m) {
    const b = m[1].toUpperCase(), t = m[2].toUpperCase();
    const name = DELL_NEW_BRANDS[b] + ' ' + m[3] + (t === 'C' ? '' : ' ' + DELL_NEW_TIERS[t]);
    const hits = (typeof DELL_MODELS === 'undefined' ? [] : DELL_MODELS.filter(x => (x.codes || []).indexOf(s.toUpperCase()) >= 0 || x.name.toLowerCase() === ('dell ' + name.replace(/^Dell /, '')).toLowerCase() || x.name.toLowerCase() === name.toLowerCase()));
    return {
      ok: true, kind: 'new', line: 'new', code: s.toUpperCase(), title: name, year: 2000 + +m[4], approx: false,
      parts: [
        { ch: b, label: 'Thương hiệu', text: DELL_NEW_BRANDS[b] + (b === 'M' ? ' (máy trạm, thay Precision)' : b === 'P' ? ' (doanh nghiệp, thay Latitude)' : ' (người dùng, thay Inspiron, XPS)') },
        { ch: t, label: 'Hạng', text: DELL_NEW_TIERS[t] + (t === 'A' ? ' (cao nhất)' : t === 'B' ? ' (giữa)' : ' (cơ bản)') },
        { ch: m[3], label: 'Cỡ màn', text: m[3] + '″' },
        { ch: m[4], label: 'Năm', text: '20' + m[4] },
        { ch: m[5], label: 'Nền tảng', text: m[5] === '5' ? 'Chip AMD' : m[5] === '0' ? 'Chip Intel' : 'Biến thể ' + m[5] }
      ],
      models: hits, size: m[3] + '″', cpu: DELL_CPU_BY_YEAR[2000 + +m[4]] || ''
    };
  }

  // 1b) Dell Pro Precision (2026): PW514260 = dòng 5 · 14″ · 2026 · Intel
  m = s.match(/^PW([57])(1[468])(\d{2})(\d)$/i);
  if (m) {
    const name = 'Dell Pro Precision ' + m[1] + ' ' + m[2];
    const hits = typeof DELL_MODELS === 'undefined' ? [] : DELL_MODELS.filter(x => (x.codes || []).indexOf(s.toUpperCase()) >= 0);
    return {
      ok: true, kind: 'new', line: 'new', code: s.toUpperCase(), title: name, year: 2000 + +m[3], approx: !hits.length,
      parts: [
        { ch: 'PW', label: 'Thương hiệu', text: 'Dell Pro Precision: tên Precision quay lại từ 03/2026' },
        { ch: m[1], label: 'Hạng', text: m[1] === '7' ? 'Dòng 7, mạnh nhất' : 'Dòng 5, mỏng nhẹ' },
        { ch: m[2], label: 'Cỡ màn', text: m[2] + '″' },
        { ch: m[3], label: 'Năm', text: '20' + m[3] },
        { ch: m[4], label: 'Nền tảng', text: m[4] === '5' ? 'Chip AMD' : 'Chip Intel' }
      ],
      models: hits, size: m[2] + '″', cpu: 'Intel Core Ultra Series 3 (Panther Lake)'
    };
  }

  // 2) Tên kiểu mới: Dell Pro Max 16 Plus, Dell Pro 14 Premium, Dell 14 Plus
  m = s.match(/^(pro max|pro)?\s*(\d{2})\s*(plus|premium|base)?$/i);
  if (m && (m[1] || m[3]) && +m[2] >= 13 && +m[2] <= 18) {
    const brand = m[1] ? (m[1].toLowerCase() === 'pro max' ? 'Dell Pro Max' : 'Dell Pro') : 'Dell';
    const tier = m[3] ? m[3][0].toUpperCase() + m[3].slice(1).toLowerCase() : 'Base';
    const name = brand + ' ' + m[2] + (tier === 'Base' ? '' : ' ' + tier);
    const hits = typeof DELL_MODELS === 'undefined' ? [] : DELL_MODELS.filter(x => x.name.toLowerCase() === name.toLowerCase());
    return {
      ok: true, kind: 'new', line: 'new', code: name, title: name, year: hits[0] ? hits[0].year : 2025, approx: !hits[0],
      parts: [
        { ch: brand.replace('Dell', '').trim() || 'Dell', label: 'Thương hiệu', text: brand === 'Dell Pro Max' ? 'Máy trạm (thay Precision)' : brand === 'Dell Pro' ? 'Doanh nghiệp (thay Latitude)' : 'Người dùng (thay Inspiron, XPS)' },
        { ch: m[2], label: 'Cỡ màn', text: m[2] + '″' },
        { ch: tier, label: 'Hạng', text: tier === 'Premium' ? 'Cao nhất' : tier === 'Plus' ? 'Giữa' : 'Cơ bản' }
      ],
      models: hits, size: m[2] + '″', cpu: DELL_CPU_BY_YEAR[2025]
    };
  }

  // 3) Latitude đời cũ có chữ E: E7450, E5470
  m = s.match(/^(?:latitude\s*)?e\s?(\d)(\d)(\d{2})$/i);
  if (m) {
    const L = DELL_LINES.latitude;
    const y = L.genE[m[3]] || null;
    return finishDell('latitude', 'E' + m[1] + m[2] + m[3], [
      { ch: 'E', label: 'Thế hệ cũ', text: 'Chữ E: Latitude trước 2017' },
      { ch: m[1], label: 'Hạng', text: L.tiers[m[1]] || '?' },
      { ch: m[2], label: 'Cỡ màn', text: DELL_SIZE[m[2]] || '?' },
      { ch: m[3], label: 'Đời', text: y ? 'Khoảng ' + y : 'Chưa rõ' }
    ], y, DELL_SIZE[m[2]], s);
  }

  // 4) Dòng + 4 số: Precision 5560, Latitude 7420, XPS 15 9510, Inspiron 16 Plus 7620, G15 5520, Vostro 3510
  m = s.match(/^(precision|latitude|vostro|inspiron|xps|g)\s*(1[3-7])?\s*(plus|2-in-1)?\s*(\d{4})\b/i) || s.match(/^(g)(1[56])\s*(\d{4})\b/i);
  let lineKey = null, code = null;
  if (m) {
    if (m.length === 4) { lineKey = 'g'; code = m[3]; } else { lineKey = m[1].toLowerCase(); code = m[4]; }
  } else if ((m = s.match(/^(\d{4})$/))) {
    code = m[1];
  }
  if (!code) {
    if (/alienware/i.test(s)) return { ok: false, msg: 'Alienware đặt tên theo kiểu riêng (m15 R7, x16 R2…): R là lần làm lại, không đọc ra năm theo quy tắc. Thử tìm tên đầy đủ trên trang Dell.' };
    return { ok: false, msg: 'Chưa nhận ra tên máy. Gõ theo dạng "Precision 5560", "Latitude 7420", "XPS 15 9510", "Inspiron 7620", "G15 5520", "Vostro 3510", hoặc tên mới như "Pro Max 16 Plus", "PB14250".' };
  }

  if (!lineKey) {
    const hits = dellFind(null, code);
    if (hits.length === 1) lineKey = hits[0].line;
    else if (hits.length > 1) return { ok: true, kind: 'ambiguous', code, models: hits, msg: 'Số ' + code + ' có ở ' + hits.length + ' dòng máy. Chọn đúng dòng in trên máy:' };
    else return { ok: false, msg: 'Số ' + code + ' chưa có trong bảng. Gõ thêm tên dòng, vd. "Latitude ' + code + '" hoặc "Precision ' + code + '", để đọc theo quy tắc.' };
  }

  const L = DELL_LINES[lineKey];
  const d = code.split('');
  let parts = [], y = null;
  if (lineKey === 'latitude') {
    y = L.gen2[d[2] + d[3]] || L.gen2[d[2] + '0'] || null;
    parts = [
      { ch: d[0], label: 'Hạng', text: L.tiers[d[0]] || '?' },
      { ch: d[1], label: 'Cỡ màn', text: DELL_SIZE[d[1]] || '?' },
      { ch: d[2], label: 'Đời', text: y ? 'Đời ' + y : 'Chưa rõ' },
      { ch: d[3], label: 'Biến thể', text: L.variant[d[3]] || 'Biến thể ' + d[3] }
    ];
  } else if (lineKey === 'xps') {
    y = L.year(+d[2], d[0]);
    parts = [
      { ch: d[0], label: 'Dòng', text: L.tiers[d[0]] || '?' },
      { ch: d[1], label: 'Cỡ màn', text: DELL_SIZE[d[1]] || '?' },
      { ch: d[2], label: 'Đời', text: y ? 'Khoảng ' + y : 'Chưa rõ' },
      { ch: d[3], label: 'Biến thể', text: L.variant[d[3]] || 'Biến thể ' + d[3] }
    ];
  } else {
    y = L.year(+d[2], d[0]);
    parts = [
      { ch: d[0], label: lineKey === 'g' ? 'Dòng' : 'Hạng', text: L.tiers[d[0]] || '?' },
      { ch: d[1], label: 'Cỡ màn', text: DELL_SIZE[d[1]] || '?' },
      { ch: d[2], label: 'Đời', text: y ? 'Khoảng ' + y : 'Chưa rõ' },
      { ch: d[3], label: 'Biến thể', text: L.variant[d[3]] || 'Biến thể ' + d[3] }
    ];
  }
  return finishDell(lineKey, code, parts, y, DELL_SIZE[d[1]], s);
}

function finishDell(lineKey, code, parts, y, size, raw) {
  const L = DELL_LINES[lineKey];
  let hits = dellFind(lineKey, code);
  const want2in1 = /2[\s-]?in[\s-]?1/i.test(raw || '');
  if (hits.length > 1) hits = hits.slice().sort((a, b) => (/2-in-1/i.test(b.name) === want2in1) - (/2-in-1/i.test(a.name) === want2in1));
  const mdl = hits[0] || null;
  const twin = want2in1 && mdl && !/2-in-1/i.test(mdl.name);
  if (mdl && mdl.year) parts = parts.map(p => (p.label === 'Đời' ? Object.assign({}, p, { text: 'Năm ' + mdl.year + (y && y !== mdl.year ? ' (quy tắc đoán ' + y + ')' : '') }) : p));
  const year = mdl && mdl.year ? mdl.year : y;
  return {
    ok: true, kind: 'code', line: lineKey, lineName: L.name, lineKind: L.kind, lineShort: L.short, code, title: mdl ? mdl.name : 'Dell ' + L.name + ' ' + code,
    parts, year, approx: !mdl, size: (mdl && mdl.size) || size || '', cpu: mdl ? mdl.cpu : (DELL_CPU_BY_YEAR[year] || ''), models: hits,
    warn: twin ? 'Bản 2-in-1 (xoay gập) dùng chung số hiệu nhưng là máy khác: cấu hình, cân nặng và giá dưới đây là của bản thường.' : ''
  };
}
