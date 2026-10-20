// ===== Giải mã: số máy Apple, IMEI, số model AirPods, thông tin EXIF máy ảnh =====

// ---------- Số máy Apple (part number), vd. MFYN4ZA/A ----------
const APPLE_SOURCE = {
  M: { text: 'Máy mới bán lẻ', tone: 'pass' },
  F: { text: 'Máy tân trang (Apple hoặc nhà mạng)', tone: 'info' },
  G: { text: 'Máy tân trang', tone: 'info' },
  N: { text: 'Máy đổi bảo hành', tone: 'info', note: 'Ngày bảo hành có thể khác máy gốc.' },
  P: { text: 'Máy khắc chữ theo yêu cầu', tone: 'info' },
  '3': { text: 'Máy trưng bày cửa hàng', tone: 'warn', note: 'Bật màn hình nhiều giờ mỗi ngày, dễ bóng mờ.' },
  '4': { text: 'Máy bán "nguyên trạng", không bảo hành', tone: 'warn' },
  '5': { text: 'Máy không bảo hành Apple', tone: 'warn' }
};

// Bảng mã thị trường. Apple không công bố, bảng do cộng đồng TheAppleWiki tổng hợp và có thể đổi theo đời máy.
const REGION_LEGACY = {
  A: 'Canada', AA: 'UAE', AB: 'Ai Cập, Jordan, Ả Rập Xê Út, UAE', AE: 'Vùng Vịnh', AH: 'Bahrain, Kuwait', AM: 'Mỹ, Canada',
  B: 'Anh, Ireland', BR: 'Brazil', BZ: 'Brazil', C: 'Canada', CH: 'Trung Quốc', CL: 'Canada, Chile', CZ: 'Séc', D: 'Đức',
  DN: 'Áo, Đức, Hà Lan', E: 'Mexico', EE: 'Estonia', F: 'Pháp', FB: 'Pháp, Luxembourg', FD: 'Áo, Thuỵ Sĩ', FN: 'Pháp, Hà Lan',
  FS: 'Phần Lan', GR: 'Hy Lạp', HB: 'Israel', HN: 'Ấn Độ', HU: 'Ukraina', IP: 'Ý', J: 'Nhật Bản', KH: 'Trung Quốc, Hàn Quốc',
  KN: 'Đan Mạch, Na Uy', KS: 'Phần Lan, Thuỵ Điển', LA: 'Mỹ Latinh', LE: 'Argentina', LL: 'Mỹ, Canada', LP: 'Ba Lan', LT: 'Litva',
  LV: 'Latvia', LZ: 'Chile, Paraguay, Uruguay', MG: 'Hungary', MO: 'Macau, Hồng Kông', MY: 'Malaysia', N: 'Hà Lan',
  NF: 'Bỉ, Pháp, Hà Lan', PA: 'Úc, Hồng Kông', PK: 'Phần Lan, Ba Lan', PL: 'Ba Lan', PM: 'Ba Lan', PO: 'Bồ Đào Nha',
  PP: 'Philippines', QL: 'Ý, Tây Ban Nha, Bồ Đào Nha', QN: 'Bắc Âu', RK: 'Kazakhstan', RM: 'Nga, Kazakhstan', RO: 'Romania',
  RP: 'Nga', RR: 'Nga', RS: 'Nga', RU: 'Nga', SA: 'Việt Nam (chủ yếu iPad, Mac)', SE: 'Serbia', SL: 'Slovakia', SO: 'Nam Phi',
  SU: 'Ukraina', T: 'Ý', TA: 'Đài Loan', TH: 'Thái Lan', TU: 'Thổ Nhĩ Kỳ', UA: 'Ukraina', VC: 'Canada', VN: 'Việt Nam',
  X: 'Úc, New Zealand', Y: 'Tây Ban Nha', Z: 'UAE, Anh', ZA: 'Singapore, Hồng Kông', ZD: 'Châu Âu', ZP: 'Hồng Kông, Macau, Úc, Đài Loan', ZS: 'UAE'
};
// Bảng mới (đời iPhone 17 Pro trở đi).
const REGION_MODERN = {
  AF: 'Trung Đông, châu Phi, Ukraina', AH: 'Vùng Vịnh (Bahrain, Kuwait, Oman, Qatar, Ả Rập Xê Út, UAE)', BE: 'Mỹ Latinh',
  CH: 'Trung Quốc', F: 'Pháp', HN: 'Ấn Độ', HX: 'Đông Âu', ID: 'Indonesia', J: 'Nhật Bản', KH: 'Hàn Quốc', LL: 'Mỹ',
  QL: 'Nam Âu, Thuỵ Sĩ', QN: 'Bắc Âu, Anh', SX: 'Balkan, Séc, Slovakia', TU: 'Thổ Nhĩ Kỳ', VC: 'Canada',
  X: 'Úc, Malaysia, New Zealand, Philippines, Singapore', Y: 'Mexico', ZA: 'Hồng Kông', ZD: 'Tây Âu', ZP: 'Đài Loan, Thái Lan, Việt Nam'
};
// Thị trường bán bản chỉ eSIM.
const ESIM_ONLY = { us: ['LL'], '17': ['LL', 'VC', 'Y', 'J', 'AH'] };

function decodeApplePartNo(raw) {
  const s = String(raw || '').toUpperCase().replace(/\s+/g, '');
  if (!s) return null;
  const m = s.match(/^([0-9]{1,3}|[A-Z])([A-Z0-9]{4})([A-Z]{1,2})(\/[A-Z])?$/);
  if (!m) return { ok: false, msg: 'Không đúng dạng số máy Apple (vd. MFYN4ZA/A). Xem ở Cài đặt › Cài đặt chung › Giới thiệu › Số máy.' };
  const src = APPLE_SOURCE[m[1]] || { text: 'Mã nguồn gốc lạ (' + m[1] + ')', tone: 'warn' };
  return {
    ok: true, first: m[1], config: m[2], region: m[3],
    source: src,
    regionLegacy: REGION_LEGACY[m[3]] || null,
    regionModern: REGION_MODERN[m[3]] || null
  };
}

// Máy này có khay SIM không? 'none' = chỉ eSIM, 'tray' = có khay, null = không xác định.
function simExpectation(model, part) {
  if (!model || model.brand !== 'apple') return null;
  if (model.esim === 'all') return 'none';
  if (!model.esim) return model.year && model.year <= 2021 ? 'tray' : (model.year && model.year < 2026 ? 'tray' : null);
  if (!part || !part.ok) return null;
  return ESIM_ONLY[model.esim].indexOf(part.region) >= 0 ? 'none' : 'tray';
}

// ---------- IMEI ----------
function luhnCheckDigit(body14) {
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let d = body14.charCodeAt(i) - 48;
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return (10 - (sum % 10)) % 10;
}

function checkIMEI(raw) {
  const d = String(raw || '').replace(/\D/g, '');
  if (!d) return null;
  if (d.length === 16) return { ok: true, sv: true, digits: d, tac: d.slice(0, 8), msg: 'Đây là IMEISV (16 số), không có chữ số kiểm tra. Bấm *#06# để xem IMEI 15 số.' };
  if (d.length !== 15) return { ok: false, digits: d, msg: 'IMEI phải có 15 số (đang có ' + d.length + ').' };
  const exp = luhnCheckDigit(d.slice(0, 14));
  const got = d.charCodeAt(14) - 48;
  return exp === got
    ? { ok: true, digits: d, tac: d.slice(0, 8), msg: 'Hợp lệ. Mã TAC ' + d.slice(0, 8) + ' xác định model.' }
    : { ok: false, digits: d, tac: d.slice(0, 8), msg: 'Sai chữ số kiểm tra (đúng ra là ' + exp + '). Gõ nhầm hoặc IMEI bị sửa.' };
}

// ---------- Số model AirPods ----------
function airpodsLookup(num) {
  const n = String(num || '').toUpperCase().replace(/\s+/g, '');
  if (!n) return null;
  const hits = [];
  HEADPHONE_MODELS.forEach(m => {
    if (m.nums && m.nums.indexOf(n) >= 0) hits.push({ model: m, part: 'tai' });
    if (m.cases && m.cases.indexOf(n) >= 0) hits.push({ model: m, part: 'hộp' });
  });
  return hits;
}

function checkAirpodsSet(left, right, caseNo) {
  const parts = [['Tai trái', left], ['Tai phải', right], ['Hộp sạc', caseNo]].filter(p => p[1]);
  if (!parts.length) return null;
  const rows = parts.map(([label, v]) => {
    const hits = airpodsLookup(v) || [];
    return { label, value: String(v).toUpperCase(), names: hits.map(h => h.model.name + ' (' + h.part + ')'), ids: hits.map(h => h.model.id) };
  });
  const unknown = rows.filter(r => !r.ids.length);
  // Hộp A2190 dùng chung Pro 1; A1602/A1938 dùng chung AirPods 1/2.
  let common = null;
  rows.forEach(r => { if (!r.ids.length) return; common = common === null ? r.ids.slice() : common.filter(id => r.ids.indexOf(id) >= 0); });
  let verdict;
  if (unknown.length) verdict = { tone: 'stop', text: 'Có số không thuộc AirPods nào trong danh sách: ' + unknown.map(u => u.value).join(', ') + '. Kiểm tra lại cách đọc, nếu đúng thì nghi hàng giả.' };
  else if (common && common.length) verdict = { tone: 'pass', text: 'Cùng một đời: ' + HEADPHONE_MODELS.filter(m => common.indexOf(m.id) >= 0).map(m => m.name).join(' / ') + '.' };
  else verdict = { tone: 'warn', text: 'Các bộ phận thuộc các đời khác nhau: có tai hoặc hộp đã thay.' };
  return { rows, verdict, ids: common || [] };
}

// ---------- Kích thước màn hình iPhone (để đối chiếu khi mở app trên chính máy đang kiểm) ----------
function iphonesByScreen(w, h, dpr) {
  const a = Math.min(w, h), b = Math.max(w, h);
  return PHONE_MODELS.filter(m => m.screen && m.screen[0] === a && m.screen[1] === b && Math.abs(m.screen[2] - dpr) < 0.01).map(m => m.name);
}

// ---------- EXIF / MakerNote máy ảnh ----------
// Đọc trực tiếp từ JPEG gốc: hãng, đời máy, số sê-ri, số lần chụp (Nikon, Canon R5/R6/R6 II/R8/R50,
// Sony, Pentax, Fujifilm). Cách đọc dựa trên mã nguồn ExifTool 13.59.

const SONY_DECIPHER = (function () {
  const t = new Uint8Array(256);
  for (let b = 0; b < 256; b++) t[b] = b;
  for (let b = 0; b < 249; b++) t[(b * b * b) % 249] = b;
  return t;
})();

const EXIF_MODEL_MAP = [
  [/EOS R50$/i, 'c-r50'], [/EOS R10$/i, 'c-r10'], [/EOS R8$/i, 'c-r8'], [/EOS R7$/i, 'c-r7'], [/EOS RP$/i, 'c-rp'], [/EOS R$/i, 'c-r'],
  [/EOS R6m2$/i, 'c-r6ii'], [/EOS R6$/i, 'c-r6'], [/EOS R5$/i, 'c-r5'], [/EOS M50m2$/i, 'c-m50ii'], [/EOS 90D$/i, 'c-90d'],
  [/EOS (850D|Rebel T8i|Kiss X10i)$/i, 'c-850d'], [/EOS 6D Mark II$/i, 'c-6dii'],
  [/^ILCE-7M3/i, 's-a7iii'], [/^ILCE-7M4/i, 's-a7iv'], [/^ILCE-7CM2/i, 's-a7cii'], [/^ILCE-7C$/i, 's-a7c'], [/^ILCE-6400/i, 's-a6400'],
  [/^ILCE-6600/i, 's-a6600'], [/^ILCE-6700/i, 's-a6700'], [/^ZV-E10$/i, 's-zve10'],
  [/Z ?5$/i, 'n-z5'], [/Z ?6_?2|Z ?6 ?II$/i, 'n-z6ii'], [/Z ?6_?3|Z ?6 ?III$/i, 'n-z6iii'], [/Z ?50$/i, 'n-z50'], [/Z ?fc$/i, 'n-zfc'], [/Z ?f$/i, 'n-zf'],
  [/D750$/i, 'n-d750'], [/D7500$/i, 'n-d7500'], [/D850$/i, 'n-d850'],
  [/X-T30 ?II/i, 'f-xt30ii'], [/X-S10/i, 'f-xs10'], [/X-S20/i, 'f-xs20'], [/X-T4/i, 'f-xt4'], [/X-T5/i, 'f-xt5'], [/X100VI/i, 'f-x100vi'], [/X100V$/i, 'f-x100v']
];

function matchCameraModel(model) {
  if (!model) return null;
  for (const [re, id] of EXIF_MODEL_MAP) if (re.test(model.trim())) return id;
  return null;
}

function parseCameraJpeg(buf) {
  const u8 = new Uint8Array(buf);
  const dv = new DataView(buf);
  const N = u8.length;
  const out = { notes: [] };
  const ascii = (o, n) => { let s = ''; for (let i = 0; i < n && o + i < N; i++) s += String.fromCharCode(u8[o + i]); return s; };
  if (N < 4 || u8[0] !== 0xFF || u8[1] !== 0xD8) return { error: 'Không phải ảnh JPEG.' };

  // Tìm APP1 Exif
  let off = 2, t0 = -1;
  while (off + 4 <= N) {
    if (u8[off] !== 0xFF) { off++; continue; }
    const mk = u8[off + 1];
    if (mk === 0xFF) { off++; continue; }
    if (mk === 0xD8 || mk === 0x01 || (mk >= 0xD0 && mk <= 0xD7)) { off += 2; continue; }
    if (mk === 0xDA || mk === 0xD9) break;
    const len = dv.getUint16(off + 2);
    if (mk === 0xE1 && ascii(off + 4, 6) === 'Exif\0\0') { t0 = off + 10; break; }
    off += 2 + len;
  }
  if (t0 < 0) return { error: 'Ảnh không còn thông tin EXIF. Ảnh gửi qua Zalo, Messenger, Telegram (dạng ảnh) thường bị xoá thông tin: cần file gốc.' };

  const u16 = (o, le) => (o + 2 <= N ? dv.getUint16(o, le) : 0);
  const u32 = (o, le) => (o + 4 <= N ? dv.getUint32(o, le) : 0);
  const SZ = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8, 13: 4 };
  function readIFD(at, base, le) {
    const map = {};
    if (at < 0 || at + 2 > N) return map;
    const cnt = u16(at, le);
    if (cnt === 0 || cnt > 512) return map;
    for (let i = 0; i < cnt; i++) {
      const e = at + 2 + i * 12;
      if (e + 12 > N) break;
      const tag = u16(e, le), type = u16(e + 2, le), count = u32(e + 4, le);
      const size = (SZ[type] || 1) * count;
      const pos = size <= 4 ? e + 8 : base + u32(e + 8, le);
      if (pos < 0 || pos + Math.min(size, 4) > N) continue;
      map[tag] = { type, count, size, pos };
    }
    return map;
  }
  const str = (e) => { if (!e) return ''; let s = ''; for (let i = 0; i < e.size && e.pos + i < N; i++) { const c = u8[e.pos + i]; if (c === 0) break; s += String.fromCharCode(c); } return s.trim(); };
  const num = (e, le) => !e ? null : e.type === 3 ? u16(e.pos, le) : e.type === 4 || e.type === 9 ? u32(e.pos, le) : e.type === 1 || e.type === 7 ? u8[e.pos] : null;
  const rat = (e, le) => { if (!e || e.type !== 5) return null; const a = u32(e.pos, le), b = u32(e.pos + 4, le); return b ? a / b : null; };

  const bo = ascii(t0, 2);
  if (bo !== 'II' && bo !== 'MM') return { error: 'EXIF hỏng.' };
  const le = bo === 'II';
  const ifd0 = readIFD(t0 + u32(t0 + 4, le), t0, le);
  out.make = str(ifd0[0x010F]);
  out.model = str(ifd0[0x0110]);
  out.software = str(ifd0[0x0131]);
  const exifPtr = ifd0[0x8769] ? u32(ifd0[0x8769].pos, le) : 0;
  const exif = exifPtr ? readIFD(t0 + exifPtr, t0, le) : {};
  out.date = str(exif[0x9003]) || str(ifd0[0x0132]);
  out.iso = num(exif[0x8827], le);
  out.exposure = rat(exif[0x829A], le);
  out.fnumber = rat(exif[0x829D], le);
  out.bodySerial = str(exif[0xA431]);
  out.lens = str(exif[0xA434]);
  out.lensSerial = str(exif[0xA435]);
  out.catalogId = matchCameraModel(out.model);

  const mn = exif[0x927C];
  const make = out.make.toUpperCase();
  const shutter = (value, kind, src) => { out.shutter = { value, kind, src }; };
  if (!mn) { out.notes.push('Không có MakerNote (thông tin riêng của hãng), nên không đọc được số lần chụp.'); return out; }
  const m0 = mn.pos;

  try {
    if (/^NIKON/.test(make)) {
      out.brand = 'nikon';
      if (ascii(m0, 7) === 'Nikon\0\x02') {
        const tb = m0 + 10, le2 = ascii(tb, 2) === 'II';
        const ifd = readIFD(tb + u32(tb + 4, le2), tb, le2);
        out.makerSerial = str(ifd[0x001D]) || str(ifd[0x00A0]).replace(/^NO=\s*/, '');
        const sc = ifd[0x00A7] ? u32(ifd[0x00A7].pos, le2) : null;
        if (sc != null && sc !== 0xFFFFF7FF) shutter(sc, 'total', 'Nikon 0x00A7');
        const mech = ifd[0x0037] ? u32(ifd[0x0037].pos, le2) : null;
        if (mech != null && mech > 0 && mech !== 0xFFFFF7FF) out.mechCount = mech;
      } else out.notes.push('MakerNote Nikon đời cũ, không có số lần chụp.');
    } else if (/^CANON/.test(make)) {
      out.brand = 'canon';
      const ifd = readIFD(m0, t0, le);
      if (ifd[0x000C]) out.makerSerial = String(u32(ifd[0x000C].pos, le)).padStart(10, '0');
      const ci = ifd[0x000D];
      let o = null;
      if (/\bEOS R[56]$/.test(out.model)) o = 0x0AF1;
      else if (/\bEOS (R6m2|R8|R50)$/.test(out.model)) o = 0x0D29;
      if (ci && o != null) {
        if (ci.size >= o + 4 && ci.pos + o + 4 <= N) shutter(u32(ci.pos + o, le), 'total', 'Canon CameraInfo');
        else out.notes.push('Khối CameraInfo ngắn bất thường, không đọc được.');
      } else out.notes.push('App chưa đọc được số lần chụp của đời Canon này từ ảnh (chỉ R5, R6, R6 II, R8, R50).');
    } else if (/^SONY/.test(make)) {
      out.brand = 'sony';
      const start = /^(SONY (DSC|CAM|MOBILE)|\0\0SONY PIC\0|VHAB {5}\0)/.test(ascii(m0, 12)) ? m0 + 12 : m0;
      let le2 = le, cnt = u16(start, le2);
      if (cnt === 0 || cnt > 300) { le2 = !le; cnt = u16(start, le2); }
      const ifd = readIFD(start, t0, le2);
      const e = ifd[0x9050];
      if (e && e.size >= 0x40) {
        const raw = u8.subarray(e.pos, Math.min(N, e.pos + e.size));
        const d = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) d[i] = SONY_DECIPHER[raw[i]];
        const rd = o => (d[o] | (d[o + 1] << 8) | (d[o + 2] << 16) | (d[o + 3] << 24)) >>> 0;
        const M = out.model;
        const zero5 = raw[0] === 0 && raw[1] === 0 && raw[2] === 0 && raw[3] === 0 && raw[4] === 0;
        if (/^(ILCE-(6700|7CM2|7CR)|ILME-FX2)\b/.test(M) || (/^ILCE-(1M2|7M5|7RM6)/.test(M) && zero5)) {
          shutter(rd(0x0A) & 0xFFFFFF, 'mech', 'Sony 9050d');
        } else if (/^ZV-(E1|E10M2)\b/.test(M)) {
          out.notes.push('Đời máy này không có số đếm màn trập trong ảnh.');
        } else if (/^ILCE-(1M2|7M5|7RM6)/.test(M)) {
          out.notes.push('Máy này chỉ ghi số lần chụp khi chụp bằng màn trập cơ. Chụp lại tấm thử với màn trập cơ.');
        } else if (/^(ILCE-(6100A?|6300|6400A?|6500|6600|7C|7M3|7RM2|7RM3A?|7RM4A?|7SM2|9|9M2)|ILCA-99M2|ZV-E10)\b/.test(M) ||
                   /^(ILCE-(1\b|7M4|7RM5|7SM3)|ILME-FX3)/.test(M)) {
          shutter(rd(0x3A) & 0xFFFFFF, 'total', 'Sony 9050b/c');
        } else if (!/^(DSC-|Stellar|ILCE-(1|6100|6300|6400|6500|6600|6700|7C|7M3|7M4|7M5|7RM2|7RM3A?|7RM4A?|7RM5|7RM6|7SM2|7SM3|9|9M2)|ILCA-99M2|ILME-(FX2|FX3)|ZV-)/.test(M)) {
          shutter(rd(0x32) & 0xFFFFFF, 'total', 'Sony 9050a');
          out.notes.push('Một số đời Sony cũ quay vòng về 0 sau 65.536 lần.');
        }
      } else out.notes.push('Không thấy khối dữ liệu 0x9050 của Sony.');
      if (!out.bodySerial) out.notes.push('Sony chỉ ghi số sê-ri khi bật Ghi số sê-ri trong menu Tệp.');
    } else if (/^FUJIFILM/.test(make) || ascii(m0, 8) === 'FUJIFILM') {
      out.brand = 'fujifilm';
      const ifd = readIFD(m0 + u32(m0 + 8, true), m0, true);
      out.makerSerial = str(ifd[0x0010]);
      if (ifd[0x1438]) shutter(u16(ifd[0x1438].pos, true) & 0x7FFF, 'images', 'Fujifilm ImageCount');
      else out.notes.push('Đời máy này không ghi số ảnh.');
    } else if (/^(PENTAX|RICOH|ASAHI)/.test(make)) {
      out.brand = 'pentax';
      let start = m0, le2 = le, base = m0;
      if (ascii(m0, 4) === 'AOC\0') { const b2 = ascii(m0 + 4, 2); if (b2 === 'MM') le2 = false; else if (b2 === 'II') le2 = true; start = m0 + 6; }
      else if (ascii(m0, 8) === 'PENTAX \0') { const b2 = ascii(m0 + 8, 2); le2 = b2 === 'II'; start = m0 + 10; base = m0; }
      let cnt = u16(start, le2);
      if (cnt === 0 || cnt > 300) le2 = !le2;
      const ifd = readIFD(start, base, le2);
      const sc = ifd[0x005D], dt = ifd[0x0006], tm = ifd[0x0007];
      if (sc && dt && tm && sc.size === 4 && dt.size >= 4 && tm.size >= 3) {
        const be = o => ((u8[o] << 24) | (u8[o + 1] << 16) | (u8[o + 2] << 8) | u8[o + 3]) >>> 0;
        const raw = be(sc.pos), date = be(dt.pos);
        const time = ((u8[tm.pos] << 24) | (u8[tm.pos + 1] << 16) | (u8[tm.pos + 2] << 8)) >>> 0;
        shutter(((raw ^ date ^ ((0xFFFFFFFF - time) >>> 0)) >>> 0), 'total', 'Pentax 0x005D');
        out.notes.push('Pentax không đếm lần chụp Live View và quay phim; số có thể bị đặt lại khi bảo dưỡng.');
      }
      for (const b of [base, t0]) {
        const e = readIFD(start, b, le2)[0x0229];
        const s = str(e);
        if (s && /^[\x20-\x7E]+$/.test(s)) { out.makerSerial = s; break; }
      }
    } else if (/^(OLYMPUS|OM DIGITAL)/.test(make)) {
      out.brand = 'olympus'; out.notes.push(SC_HOWTO.olympus);
    } else if (/^PANASONIC/.test(make)) {
      out.brand = 'panasonic'; out.notes.push(SC_HOWTO.panasonic);
    }
  } catch (err) {
    out.notes.push('Lỗi khi đọc MakerNote: ' + err.message);
  }
  return out;
}
