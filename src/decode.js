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

// ---------- Mã máy → bản nước nào (mọi hãng) ----------
// Hãng không công bố đầy đủ. Bảng do cộng đồng tổng hợp: TheAppleWiki (Apple), AndroidSage / SamMobile (Samsung),
// miuirom.org và Xiaomi Miui Hellas (Xiaomi). Dùng để đối chiếu, không phải bằng chứng duy nhất.
// grp: nhóm vùng để so mã model với mã phần mềm ('kr' Hàn, 'us' Mỹ, 'cn' Trung Quốc, 'jp' Nhật, 'intl' còn lại).

const APPLE_MARKET_NOTES = {
  LL: 'Bản Mỹ: từ iPhone 14 trở đi chỉ có eSIM, không có khay SIM; iPhone 13 trở về trước có 1 khe nano SIM và eSIM.',
  CH: 'Bản Trung Quốc đại lục: từ iPhone XS đến 16 có 2 khe nano SIM.',
  ZP: 'Bản Hồng Kông, Macau: từ iPhone XS đến 16 thường có 2 khe nano SIM.',
  ZA: 'Mã ZA dùng cho cả Hồng Kông (từ iPhone XS đến 16 thường 2 khe nano SIM) và Singapore (1 khe).',
  J: 'Bản Nhật: tiếng chụp ảnh luôn kêu, không tắt được.',
  KH: 'Bản Hàn: tiếng chụp ảnh luôn kêu, không tắt được.',
  VN: 'Máy bán chính hãng tại Việt Nam, bảo hành được ở Việt Nam khi còn hạn.'
};
const APPLE_RU = ['RU', 'RS', 'RR', 'RP', 'RM'];

const SS_MODELS = {
  G980: 'Galaxy S20', G981: 'Galaxy S20 5G', G985: 'Galaxy S20+', G986: 'Galaxy S20+ 5G', G988: 'Galaxy S20 Ultra',
  G780: 'Galaxy S20 FE', G781: 'Galaxy S20 FE 5G', G991: 'Galaxy S21', G996: 'Galaxy S21+', G998: 'Galaxy S21 Ultra', G990: 'Galaxy S21 FE',
  S901: 'Galaxy S22', S906: 'Galaxy S22+', S908: 'Galaxy S22 Ultra',
  S911: 'Galaxy S23', S916: 'Galaxy S23+', S918: 'Galaxy S23 Ultra', S711: 'Galaxy S23 FE',
  S921: 'Galaxy S24', S926: 'Galaxy S24+', S928: 'Galaxy S24 Ultra', S721: 'Galaxy S24 FE',
  S931: 'Galaxy S25', S936: 'Galaxy S25+', S938: 'Galaxy S25 Ultra', S937: 'Galaxy S25 Edge', S731: 'Galaxy S25 FE',
  N970: 'Galaxy Note10', N971: 'Galaxy Note10 5G', N975: 'Galaxy Note10+', N976: 'Galaxy Note10+ 5G',
  N980: 'Galaxy Note20', N981: 'Galaxy Note20 5G', N985: 'Galaxy Note20 Ultra', N986: 'Galaxy Note20 Ultra 5G',
  F926: 'Galaxy Z Fold3', F711: 'Galaxy Z Flip3', F936: 'Galaxy Z Fold4', F721: 'Galaxy Z Flip4', F946: 'Galaxy Z Fold5', F731: 'Galaxy Z Flip5',
  F956: 'Galaxy Z Fold6', F741: 'Galaxy Z Flip6', F966: 'Galaxy Z Fold7', F766: 'Galaxy Z Flip7',
  A525: 'Galaxy A52', A526: 'Galaxy A52 5G', A528: 'Galaxy A52s 5G', A536: 'Galaxy A53 5G', A546: 'Galaxy A54 5G', A556: 'Galaxy A55 5G', A566: 'Galaxy A56 5G',
  A346: 'Galaxy A34 5G', A356: 'Galaxy A35 5G', A366: 'Galaxy A36 5G', A256: 'Galaxy A25 5G', A266: 'Galaxy A26 5G',
  A155: 'Galaxy A15', A156: 'Galaxy A15 5G', A165: 'Galaxy A16', A166: 'Galaxy A16 5G'
};
const SS_SUFFIX = {
  B: { text: 'Quốc tế (châu Âu, Nga, Trung Á, Đông Nam Á, Việt Nam…)', tone: 'pass', grp: 'intl' },
  F: { text: 'Quốc tế (đời cũ hoặc dòng 4G)', tone: 'pass', grp: 'intl' },
  E: { text: 'Châu Á, châu Phi', tone: 'pass', grp: 'intl' },
  M: { text: 'Mỹ Latinh', tone: 'info', grp: 'intl' },
  N: { text: 'Hàn Quốc', tone: 'info', grp: 'kr', note: 'Bản Hàn: thường chỉ 1 khe nano SIM (đời mới có thêm eSIM). Tiếng chụp ảnh bắt buộc khi lắp SIM Hàn. Bảo hành theo Samsung Hàn.' },
  U: { text: 'Mỹ, bản nhà mạng', tone: 'warn', grp: 'us', note: 'Bản nhà mạng Mỹ: có thể bị khoá mạng, phần mềm và cập nhật theo nhà mạng. Kiểm kỹ mục Không khoá nhà mạng.' },
  U1: { text: 'Mỹ, bản không khoá mạng', tone: 'info', grp: 'us', note: 'Bản Mỹ: thường 1 khe nano SIM và eSIM.' },
  W: { text: 'Canada', tone: 'info', grp: 'ca' },
  '0': { text: 'Trung Quốc, Hồng Kông, Đài Loan', tone: 'info', grp: 'cn', note: 'Thường có 2 khe nano SIM. Xem mã CSC: CHC/CHN là Trung Quốc đại lục, TGY Hồng Kông, BRI Đài Loan.' },
  Q: { text: 'Nhật Bản, bản không khoá mạng', tone: 'info', grp: 'jp', note: 'Máy Nhật: tiếng chụp ảnh luôn kêu.' }
};
const SS_CSC = {
  XXV: ['Việt Nam', 'intl'], XEV: ['Việt Nam', 'intl'], SER: ['Nga', 'intl'], SKZ: ['Kazakhstan', 'intl'], CAU: ['Kavkaz (Armenia, Azerbaijan, Gruzia)', 'intl'],
  CAC: ['Uzbekistan', 'intl'], SEK: ['Ukraina', 'intl'], KOO: ['Hàn Quốc (bản không nhà mạng)', 'kr'], SKC: ['Hàn Quốc (SK Telecom)', 'kr'],
  KTC: ['Hàn Quốc (KT)', 'kr'], LUC: ['Hàn Quốc (LG U+)', 'kr'], OKR: ['Hàn Quốc (nhóm phần mềm Hàn)', 'kr'],
  XAA: ['Mỹ (không nhà mạng)', 'us'], ATT: ['Mỹ (AT&T)', 'us'], TMB: ['Mỹ (T-Mobile)', 'us'], VZW: ['Mỹ (Verizon)', 'us'], USC: ['Mỹ (US Cellular)', 'us'],
  OYM: ['Mỹ (nhóm phần mềm Mỹ, không khoá mạng)', 'us'], OYN: ['Mỹ (nhóm phần mềm nhà mạng Mỹ)', 'us'], XAC: ['Canada', 'ca'],
  CHC: ['Trung Quốc đại lục', 'cn'], CHN: ['Trung Quốc đại lục', 'cn'], TGY: ['Hồng Kông', 'cn'], BRI: ['Đài Loan', 'cn'],
  INS: ['Ấn Độ', 'intl'], INU: ['Ấn Độ', 'intl'], XSG: ['UAE, vùng Vịnh', 'intl'], KSA: ['Ả Rập Xê Út', 'intl'], MID: ['Iraq, UAE', 'intl'],
  THL: ['Thái Lan', 'intl'], XME: ['Malaysia', 'intl'], XSP: ['Singapore', 'intl'], SIN: ['Singapore (SingTel)', 'intl'], XID: ['Indonesia', 'intl'], XTC: ['Philippines', 'intl'],
  XEO: ['Ba Lan', 'intl'], EUX: ['Châu Âu', 'intl'], EUY: ['Châu Âu', 'intl'], BTU: ['Anh, Ireland', 'intl'], DBT: ['Đức', 'intl'], XEF: ['Pháp', 'intl'],
  ITV: ['Ý', 'intl'], PHE: ['Tây Ban Nha', 'intl'], TUR: ['Thổ Nhĩ Kỳ', 'intl'], ORX: ['Slovakia', 'intl'], ZTO: ['Brazil', 'intl'], TPA: ['Panama', 'intl'], XSA: ['Úc', 'intl'],
  OXM: ['Nhóm phần mềm quốc tế (nhiều nước châu Âu, châu Á)', 'intl'], OXE: ['Nhóm phần mềm Nga, Kazakhstan, Ukraina, UAE', 'intl'],
  OXA: ['Nhóm phần mềm Tây Âu (Anh, Pháp, Đức, Ý, Ba Lan)', 'intl'], OLB: ['Nhóm phần mềm Đông Nam Á (Việt Nam, Thái Lan, Malaysia, Philippines, Singapore)', 'intl'],
  OWO: ['Nhóm phần mềm Mỹ Latinh', 'intl']
};
const SS_GRP_NAME = { kr: 'Hàn Quốc', us: 'Mỹ', cn: 'Trung Quốc / Hồng Kông / Đài Loan', jp: 'Nhật Bản', ca: 'Canada', intl: 'quốc tế' };

const XM_SUFFIX = {
  G: { text: 'Quốc tế', tone: 'pass', grp: 'intl' }, Y: { text: 'Quốc tế', tone: 'pass', grp: 'intl' },
  C: { text: 'Trung Quốc', tone: 'warn', grp: 'cn', note: 'Máy bán ở Trung Quốc. Nếu còn ROM Trung Quốc: thiếu dịch vụ Google, thông báo dễ chậm. Xem thêm Phiên bản HyperOS.' },
  I: { text: 'Ấn Độ', tone: 'info', grp: 'intl' }, L: { text: 'Mỹ Latinh', tone: 'info', grp: 'intl' },
  J: { text: 'Nhật Bản', tone: 'info', grp: 'jp', note: 'Máy Nhật: tiếng chụp ảnh luôn kêu.' }
};
const XM_ROM = {
  MI: ['ROM quốc tế (Global)', 'pass', 'intl'], EU: ['ROM châu Âu (EEA)', 'pass', 'intl'], RU: ['ROM Nga', 'pass', 'intl'],
  ID: ['ROM Indonesia', 'pass', 'intl'], TR: ['ROM Thổ Nhĩ Kỳ', 'pass', 'intl'], IN: ['ROM Ấn Độ', 'info', 'intl'],
  TW: ['ROM Đài Loan', 'info', 'intl'], JP: ['ROM Nhật Bản', 'info', 'jp'],
  CN: ['ROM Trung Quốc', 'warn', 'cn']
};
const ANDROID_LETTER = { S: 12, T: 13, U: 14, V: 15, W: 16 };
const CODE_BRAND_NAMES = { apple: 'Apple', samsung: 'Samsung', xiaomi: 'Xiaomi / Redmi / POCO', oppo: 'Oppo / OnePlus / Realme', vivo: 'vivo', honor: 'Honor / Huawei' };
const HONOR_CN = ['AN', 'AL', 'TN', 'TL', 'DN', 'DL', 'CL'];
const HONOR_INTL = ['NX', 'LX', 'L', 'N'];

function mkCode(o) { return Object.assign({ ok: true, rows: [], notes: [], model: null, grp: null }, o); }

function decodeOneCode(token) {
  const s = String(token || '').trim().toUpperCase().replace(/[‐-―]/g, '-');
  if (!s) return null;

  // Samsung: dòng SAOMC trong Mã nhà cung cấp dịch vụ, vd. SAOMC_SM-S928B_OXM_SKZ_16_0005
  let m = s.match(/^SAOMC_SM-?([A-Z]\d{3})([A-Z0-9]{0,3})_([A-Z]{3})_([A-Z]{3})/);
  if (m) return samsungCscResult(s, [m[4], m[3]], m[1], m[2]);

  // Samsung: Phiên bản CSC, vd. S928BOXM6DZI1, S918U1OYM2AWB1
  m = s.match(/^([A-Z]\d{3})(U1|[A-Z]|0)?([A-Z]{3})(\d[A-Z0-9]{4,5})$/);
  if (m && (SS_CSC[m[3]] || /^O[A-Z]{2}$/.test(m[3]))) return samsungCscResult(s, [m[3]], m[1], m[2] || '');
  if (m && SS_MODELS[m[1]]) {
    return mkCode({ brand: 'samsung', what: 'Phiên bản phần mềm Samsung', code: s, model: SS_MODELS[m[1]], ssBase: m[1],
      market: { text: 'Không đọc được nước từ dòng này', tone: 'info' },
      rows: [['Đời máy', SS_MODELS[m[1]]]],
      notes: [{ tone: 'info', text: 'Đây là phiên bản phần mềm (PDA). Mã nước nằm ở dòng Phiên bản CSC hoặc Mã nhà cung cấp dịch vụ, cùng màn Thông tin phần mềm.' }] });
  }

  // Samsung: mã nhà mạng Nhật (docomo SC-xxX, au SCGxx)
  if (/^(SC-\d{2}[A-Z]|SCG\d{2}|SCV\d{2})$/.test(s)) {
    return mkCode({ brand: 'samsung', what: 'Mã máy Samsung bán qua nhà mạng Nhật', code: s, grp: 'jp',
      market: { text: 'Nhật Bản, máy nhà mạng', tone: 'warn' },
      notes: [{ tone: 'warn', text: 'Máy nhà mạng Nhật: dễ bị khoá mạng, thiếu băng tần dùng ở Việt Nam và Nga, tiếng chụp ảnh luôn kêu.' }] });
  }

  // Samsung: số model, vd. SM-S928B/DS, SM-S928N, SM-S928U1, SM-S9280
  m = s.match(/^(SM-?)?([A-Z])(\d{3})([A-Z0-9]{0,3}?)(\/DS)?$/);
  if (m && (m[1] || SS_MODELS[m[2] + m[3]]) && (m[1] || m[4])) {
    const base = m[2] + m[3];
    let suf = m[4];
    let dual = !!m[5];
    if (!SS_SUFFIX[suf] && suf.length === 2 && suf[1] === 'D' && SS_SUFFIX[suf[0]]) { suf = suf[0]; dual = true; }
    const sx = SS_SUFFIX[suf] || null;
    const name = SS_MODELS[base] || null;
    const r = mkCode({ brand: 'samsung', what: 'Số model Samsung', code: 'SM-' + base + m[4] + (m[5] || ''), model: name, ssBase: base, grp: sx ? sx.grp : null,
      market: sx ? { text: sx.text, tone: sx.tone } : { text: suf ? 'Hậu tố "' + suf + '" chưa có trong bảng' : 'Thiếu hậu tố vùng (chữ sau 3 số)', tone: 'info' } });
    r.rows.push(['Đời máy', name || base + ' (chưa có trong bảng đời máy)']);
    if (suf) r.rows.push(['Hậu tố', suf + (sx ? ' · ' + sx.text : '')]);
    if (dual) r.rows.push(['SIM', '/DS: 2 SIM']);
    if (sx && sx.note) r.notes.push({ tone: sx.tone === 'warn' ? 'warn' : 'info', text: sx.note });
    return r;
  }

  // Samsung: mã CSC đứng riêng, vd. SER, SKZ/SKZ/SKZ, SKZ/SKZ/SKZ,SKZ/SKZ
  if (/^[A-Z]{3}([\/,][A-Z]{3})*$/.test(s)) {
    const codes = s.split(/[\/,]/);
    if (codes.some(x => SS_CSC[x])) return samsungCscResult(s, codes, null, null);
  }

  // Apple: số máy, vd. MGCM3LL/A
  if (/^([0-9]{1,3}|[A-Z])[A-Z0-9]{4}[A-Z]{1,2}\/[A-Z]$/.test(s) || /^[MFNPG][A-Z0-9]{4}[A-Z]{1,2}$/.test(s)) {
    const p = decodeApplePartNo(s);
    if (p && p.ok) {
      const head = p.regionLegacy || p.regionModern;
      const ru = APPLE_RU.indexOf(p.region) >= 0;
      const r = mkCode({ brand: 'apple', what: 'Số máy Apple', code: s, grp: p.region === 'CH' ? 'cn' : p.region === 'LL' ? 'us' : p.region === 'J' ? 'jp' : p.region === 'KH' ? 'kr' : 'intl',
        market: { text: head || 'Mã vùng ' + p.region + ' chưa có trong bảng', tone: p.region === 'VN' ? 'pass' : 'info' },
        rows: [['Nguồn gốc', p.first + ' · ' + p.source.text], ['Mã vùng', p.region + (head ? ' · ' + head : '')]] });
      if (p.regionModern && p.regionLegacy && p.regionModern !== p.regionLegacy) r.rows.push(['Từ iPhone 17 Pro', p.regionModern]);
      if (p.source.tone !== 'pass') r.notes.push({ tone: p.source.tone === 'warn' ? 'warn' : 'info', text: 'Số máy bắt đầu bằng "' + p.first + '": ' + p.source.text + '.' + (p.source.note ? ' ' + p.source.note : '') });
      const n = APPLE_MARKET_NOTES[p.region] || (ru ? 'Máy bán chính hãng tại Nga.' : '');
      if (n) r.notes.push({ tone: 'info', text: n });
      return r;
    }
  }
  if (/^A\d{4}$/.test(s)) {
    return mkCode({ brand: 'apple', what: 'Mã kiểu máy Apple', code: s, market: { text: 'Mã A chỉ cho biết đời máy, không rõ nước', tone: 'info' },
      notes: [{ tone: 'info', text: 'Trong Cài đặt › Cài đặt chung › Giới thiệu, bấm vào dòng Số máy để đổi sang dạng có dấu gạch chéo (vd. MGCM3LL/A) rồi nhập lại.' }] });
  }

  // Xiaomi: phiên bản HyperOS / MIUI, vd. OS2.0.3.0.VNFMIXM, 3.0.305.0.WMLTWXM, V14.0.4.0.TKIJPXM
  m = s.match(/^(OS|V)?(\d{1,2})\.(\d+)\.(\d+)\.(\d+)\.([A-Z])([A-Z]{2})([A-Z]{2})XM([A-Z]*)$/);
  if (m) {
    const rom = XM_ROM[m[8]];
    const major = +m[2];
    const r = mkCode({ brand: 'xiaomi', what: 'Phiên bản phần mềm Xiaomi', code: s, grp: rom ? rom[2] : null, romRegion: m[8],
      market: rom ? { text: rom[0], tone: rom[1] } : { text: 'Mã vùng ROM "' + m[8] + '" chưa có trong bảng', tone: 'info' } });
    r.rows.push(['Hệ điều hành', (major >= 10 ? 'MIUI ' + major : 'HyperOS ' + major) + (ANDROID_LETTER[m[6]] ? ' · Android ' + ANDROID_LETTER[m[6]] : '')]);
    r.rows.push(['Mã vùng ROM', m[8] + 'XM' + (rom ? ' · ' + rom[0] : '')]);
    if (m[8] === 'CN') r.notes.push({ tone: 'warn', text: 'ROM Trung Quốc: không có sẵn dịch vụ Google, thông báo ứng dụng dễ đến chậm, một số ứng dụng Việt hoặc ngân hàng có thể chạy không ổn định.' });
    if (m[9]) r.notes.push({ tone: 'info', text: 'Đuôi "' + m[9] + '" sau XM thường là bản cho một nhà mạng.' });
    return r;
  }

  // Xiaomi / Redmi / POCO: kiểu máy, vd. 2312DRA50G, 24040RN64Y
  m = s.match(/^(\d{2})(\d{2})[0-9A-Z]{3,7}$/);
  if (m && /[A-Z]$/.test(s) && /[A-Z]/.test(s.slice(4, -1)) && +m[2] >= 1 && +m[2] <= 12) {
    const L = s.slice(-1), sx = XM_SUFFIX[L];
    const r = mkCode({ brand: 'xiaomi', what: 'Kiểu máy Xiaomi / Redmi / POCO', code: s, grp: sx ? sx.grp : null,
      market: sx ? { text: sx.text, tone: sx.tone } : { text: 'Chữ cuối "' + L + '" chưa có trong bảng', tone: 'info' } });
    r.rows.push(['Chữ cuối', L + (sx ? ' · ' + sx.text : '')]);
    r.rows.push(['Đăng ký mẫu', 'khoảng tháng ' + (+m[2]) + '/20' + m[1]]);
    if (sx && sx.note) r.notes.push({ tone: sx.tone === 'warn' ? 'warn' : 'info', text: sx.note });
    return r;
  }

  // Oppo / OnePlus: CPH = quốc tế, P + 2 chữ + 3 số = Trung Quốc; Realme: RMX
  if (/^CPH\d{4}$/.test(s)) {
    return mkCode({ brand: 'oppo', what: 'Kiểu máy Oppo / OnePlus', code: s, grp: 'intl', market: { text: 'Quốc tế', tone: 'pass' },
      notes: [{ tone: 'info', text: 'Mã CPH là bản bán ngoài Trung Quốc, có sẵn dịch vụ Google.' }] });
  }
  if (/^P[A-Z]{2}\d{3}$/.test(s)) {
    return mkCode({ brand: 'oppo', what: 'Kiểu máy Oppo / OnePlus', code: s, grp: 'cn', market: { text: 'Trung Quốc', tone: 'warn' },
      notes: [{ tone: 'warn', text: 'Bản Trung Quốc: ColorOS bản nội địa, thường thiếu dịch vụ Google và ít ngôn ngữ. Hãng không bảo hành ngoài Trung Quốc.' }] });
  }
  if (/^RMX\d{4}$/.test(s)) {
    return mkCode({ brand: 'oppo', what: 'Kiểu máy Realme', code: s, market: { text: 'Không đọc được nước từ mã RMX', tone: 'info' },
      notes: [{ tone: 'info', text: 'Realme dùng mã RMX cho mọi thị trường. Xem ngôn ngữ, dịch vụ Google và phiên bản realme UI để đoán.' }] });
  }

  // vivo: V + 4 số, đuôi A thường là bản Trung Quốc
  m = s.match(/^V(\d{4})([A-Z]?)$/);
  if (m) {
    const cn = m[2] === 'A';
    return mkCode({ brand: 'vivo', what: 'Kiểu máy vivo', code: s, grp: cn ? 'cn' : 'intl',
      market: { text: cn ? 'Thường là bản Trung Quốc' : 'Thường là bản quốc tế', tone: cn ? 'warn' : 'info' },
      notes: [{ tone: 'info', text: 'Quy ước của vivo: mã có đuôi A thường là máy bán ở Trung Quốc, không đuôi là bản quốc tế. Đối chiếu thêm ngôn ngữ và dịch vụ Google.' }] });
  }

  // Honor / Huawei: 3 chữ - đuôi, vd. DNP-AN00 (TQ), DNP-NX9 (quốc tế), ELE-L29
  m = s.match(/^([A-Z]{3})-([A-Z]{1,2})(\d{1,2})$/);
  if (m) {
    const cn = HONOR_CN.indexOf(m[2]) >= 0, intl = HONOR_INTL.indexOf(m[2]) >= 0;
    const r = mkCode({ brand: 'honor', what: 'Kiểu máy Honor / Huawei', code: s, grp: cn ? 'cn' : intl ? 'intl' : null,
      market: cn ? { text: 'Trung Quốc', tone: 'warn' } : intl ? { text: 'Quốc tế', tone: 'pass' } : { text: 'Đuôi "' + m[2] + m[3] + '" chưa có trong bảng', tone: 'info' } });
    if (cn) r.notes.push({ tone: 'warn', text: 'Đuôi ' + m[2] + m[3] + ' là bản Trung Quốc: phần mềm nội địa, thiếu dịch vụ Google, không bảo hành ngoài Trung Quốc.' });
    if (intl) r.notes.push({ tone: 'info', text: 'Bản quốc tế. Riêng Huawei đời mới thì bản quốc tế cũng không có dịch vụ Google; Honor quốc tế thì có.' });
    return r;
  }

  // IMEI: không cho biết nước bán, nhưng kiểm tra được chữ số cuối
  if (/^\d{15,16}$/.test(s)) {
    const im = checkIMEI(s);
    return mkCode({ brand: null, what: 'IMEI', code: s, market: { text: 'IMEI không cho biết máy bán ở nước nào', tone: 'info' },
      rows: [['TAC', im.tac], ['Kiểm tra', im.ok ? (im.sv ? 'IMEISV 16 số' : 'Đúng thuật toán Luhn') : 'Sai chữ số cuối']],
      notes: [{ tone: im.ok ? 'info' : 'stop', text: im.msg }] });
  }

  return { ok: false, code: s, msg: 'Chưa nhận ra mã "' + s + '".' };
}

function samsungCscResult(raw, codes, base, suf) {
  const uniq = codes.filter((x, i) => codes.indexOf(x) === i);
  const known = uniq.filter(x => SS_CSC[x]);
  const main = SS_CSC[uniq[0]] || (known.length ? SS_CSC[known[0]] : null);
  const r = mkCode({ brand: 'samsung', what: base ? 'Phần mềm Samsung (CSC)' : 'Mã CSC Samsung', code: raw, grp: main ? main[1] : null,
    market: main ? { text: main[0], tone: main[1] === 'intl' ? 'pass' : 'info' } : { text: 'Mã CSC chưa có trong bảng', tone: 'info' } });
  if (base) {
    r.ssBase = base; r.model = SS_MODELS[base] || null;
    r.rows.push(['Đời máy', (SS_MODELS[base] || base) + (suf ? ' · hậu tố ' + suf : '')]);
    const sx = SS_SUFFIX[suf];
    if (sx) r.suffixGrp = sx.grp;
  }
  uniq.forEach(x => r.rows.push(['CSC ' + x, SS_CSC[x] ? SS_CSC[x][0] : (/^O[A-Z]{2}$/.test(x) ? 'nhóm phần mềm nhiều nước' : 'chưa có trong bảng')]));
  if (/^O[A-Z]{2}$/.test(uniq[0]) && uniq.length === 1) r.notes.push({ tone: 'info', text: 'Mã bắt đầu bằng O là nhóm phần mềm dùng cho nhiều nước. Nước cụ thể là mã 3 chữ ở dòng Mã nhà cung cấp dịch vụ (vd. SER/SER/SER).' });
  if (r.suffixGrp && main && r.suffixGrp !== main[1] && [r.suffixGrp, main[1]].some(g => g !== 'intl')) {
    r.notes.push({ tone: 'warn', text: 'Hậu tố model (' + SS_GRP_NAME[r.suffixGrp] + ') và phần mềm (' + SS_GRP_NAME[main[1]] + ') không cùng vùng: máy có thể đã bị cài lại phần mềm khác nước.' });
  }
  return r;
}

// Nhiều mã cách nhau bằng dấu cách / xuống dòng. Trả về từng mã và các cảnh báo khi so chéo.
function decodeCodes(raw) {
  const toks = String(raw || '').split(/[\s;]+/).map(t => t.replace(/^[,.:]+|[,.:]+$/g, '')).filter(t => t.length >= 3 && (/\d/.test(t) || /^[A-Za-z]{3}([\/,][A-Za-z]{3})*$/.test(t)));
  const items = toks.slice(0, 6).map(decodeOneCode).filter(x => x && (x.ok || /\d/.test(x.code)));
  const cross = [];
  const ok = items.filter(x => x.ok);
  const ssModel = ok.find(x => x.brand === 'samsung' && x.what === 'Số model Samsung' && x.grp);
  const ssSoft = ok.find(x => x.brand === 'samsung' && x.what !== 'Số model Samsung' && x.grp);
  if (ssModel && ssSoft && ssModel.grp !== ssSoft.grp && [ssModel.grp, ssSoft.grp].some(g => g !== 'intl')) {
    cross.push({ tone: 'warn', text: 'Số model là bản ' + SS_GRP_NAME[ssModel.grp] + ' nhưng phần mềm là bản ' + SS_GRP_NAME[ssSoft.grp] + ': máy có thể đã bị cài lại phần mềm khác nước.' });
  }
  if (ssModel && ssSoft && ssModel.ssBase && ssSoft.ssBase && ssModel.ssBase !== ssSoft.ssBase) {
    cross.push({ tone: 'warn', text: 'Số model (' + ssModel.ssBase + ') và phần mềm (' + ssSoft.ssBase + ') thuộc hai đời máy khác nhau.' });
  }
  const xmModel = ok.find(x => x.brand === 'xiaomi' && x.what.indexOf('Kiểu máy') === 0);
  const xmRom = ok.find(x => x.brand === 'xiaomi' && x.romRegion);
  if (xmModel && xmRom && xmModel.grp === 'cn' && xmRom.romRegion !== 'CN') {
    cross.push({ tone: 'warn', text: 'Máy bản Trung Quốc nhưng chạy ' + (XM_ROM[xmRom.romRegion] ? XM_ROM[xmRom.romRegion][0] : 'ROM ' + xmRom.romRegion) + ': máy đã bị mở khoá và cài lại ROM, thường là ROM sửa. Rủi ro: cập nhật lỗi, ứng dụng ngân hàng có thể từ chối máy đã mở khoá.' });
  } else if (xmModel && xmRom && xmModel.grp === 'intl' && xmRom.romRegion === 'CN') {
    cross.push({ tone: 'warn', text: 'Máy bản quốc tế nhưng chạy ROM Trung Quốc: phần mềm đã bị cài lại.' });
  }
  return { items, cross };
}

// Đối chiếu mã đã giải với đời máy đang chọn trong phiếu.
function codeModelMismatch(model, res) {
  if (!model || !res) return null;
  const items = (res.items || []).filter(x => x.ok);
  if (model.brand === 'samsung' && model.sm) {
    const hit = items.find(x => x.ssBase && x.ssBase !== model.sm);
    if (hit) return 'Mã ' + hit.ssBase + (hit.model ? ' (' + hit.model + ')' : '') + ' không phải ' + model.name + ' (' + model.sm + ').';
  }
  const other = items.find(x => x.brand && x.brand !== model.brand && !(model.brand === 'other' && ['oppo', 'vivo', 'honor'].indexOf(x.brand) >= 0));
  if (other) return 'Mã vừa nhập là của ' + CODE_BRAND_NAMES[other.brand] + ', không khớp máy đang chọn (' + model.name + ').';
  return null;
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

// ===== Pin Galaxy từ nhật ký *#9900# (dumpstate) =====
// Samsung không hiện % pin trên nhiều bản phần mềm, nhưng tệp dumpState_….zip có ghi:
// BatteryInfoBackUp › mSavedBatteryAsoc / mSavedBatteryBsoh (độ khoẻ %), battery_cycle (vòng sạc cộng dồn),
// batteryFullCharge (dung lượng thiết kế, µAh). Phần dưới đây không dùng DOM để kiểm thử được trong Node.

// Tìm mục dumpstate*.txt lớn nhất trong tệp ZIP. read(start, end) → Promise<DataView>.
async function findZipEntry(size, read, want) {
  const re = want || /^dumpstate.*\.txt$/i;
  const tailLen = Math.min(size, 65557);
  const tail = await read(size - tailLen, size);
  let eocd = -1;
  for (let i = tail.byteLength - 22; i >= 0; i--) { if (tail.getUint32(i, true) === 0x06054b50) { eocd = i; break; } }
  if (eocd < 0) throw new Error('Tệp nén bị hỏng hoặc chưa chép xong. Chép lại tệp rồi thử lần nữa.');
  let cdSize = tail.getUint32(eocd + 12, true), cdOff = tail.getUint32(eocd + 16, true);
  if (cdOff === 0xFFFFFFFF || cdSize === 0xFFFFFFFF) {
    const loc = eocd - 20;
    if (loc >= 0 && tail.getUint32(loc, true) === 0x07064b50) {
      const off = Number(tail.getBigUint64(loc + 8, true));
      const z = await read(off, off + 56);
      cdSize = Number(z.getBigUint64(40, true)); cdOff = Number(z.getBigUint64(48, true));
    }
  }
  const cd = await read(cdOff, cdOff + cdSize);
  let p = 0, best = null;
  while (p + 46 <= cd.byteLength && cd.getUint32(p, true) === 0x02014b50) {
    const method = cd.getUint16(p + 10, true);
    let csize = cd.getUint32(p + 20, true), usize = cd.getUint32(p + 24, true), lho = cd.getUint32(p + 42, true);
    const nlen = cd.getUint16(p + 28, true), xlen = cd.getUint16(p + 30, true), clen = cd.getUint16(p + 32, true);
    let name = '';
    for (let k = 0; k < nlen; k++) name += String.fromCharCode(cd.getUint8(p + 46 + k));
    let x = p + 46 + nlen;
    const xend = x + xlen;
    while (x + 4 <= xend) {
      const id = cd.getUint16(x, true), sz = cd.getUint16(x + 2, true);
      if (id === 1) {
        let q = x + 4;
        if (usize === 0xFFFFFFFF) { usize = Number(cd.getBigUint64(q, true)); q += 8; }
        if (csize === 0xFFFFFFFF) { csize = Number(cd.getBigUint64(q, true)); q += 8; }
        if (lho === 0xFFFFFFFF) { lho = Number(cd.getBigUint64(q, true)); q += 8; }
      }
      x += 4 + sz;
    }
    if (re.test(name.split('/').pop()) && (!best || usize > best.usize)) best = { name, method, csize, usize, lho };
    p += 46 + nlen + xlen + clen;
  }
  return best;
}
// Vị trí bắt đầu dữ liệu nén của một mục (sau tiêu đề cục bộ).
async function zipDataStart(read, e) {
  const lh = await read(e.lho, e.lho + 30);
  if (lh.getUint32(0, true) !== 0x04034b50) throw new Error('Không đọc được tệp nhật ký trong gói nén.');
  return e.lho + 30 + lh.getUint16(26, true) + lh.getUint16(28, true);
}

const GB_PATS = {
  bsoh: /mSavedBatteryBsoh\s*[:=]\s*(\d{1,3})\b/,
  asoc: /mSavedBatteryAsoc\s*[:=]\s*(\d{1,3})\b/,
  usage: /mSavedBatteryUsage\s*[:=]\s*(\d+)/,
  maxTemp: /mSavedBatteryMaxTemp\s*[:=]\s*(-?\d+)/,
  model: /\[ro\.product\.model\]:\s*\[([^\]\s]+)\]/,
  pda: /\[ro\.build\.PDA\]:\s*\[([^\]\s]+)\]/,
  design: /batteryFullCharge(?:DesignCapacityUah)?\s*=\s*(\d{6,8})/
};
const GB_CYCLE = /(?:battery_cycle:\s*|BATTERY_CYCLE\()(\d{1,6})/g;

// Dò từng đoạn chữ (đã giải nén). push() trả true khi đã đủ thông tin để dừng sớm.
function galaxyBattScanner() {
  const found = {}, lines = {};
  let cycle = null, tail = '', after = -1;
  const around = (buf, i, n) => buf.slice(Math.max(0, i - 120), Math.min(buf.length, i + n + 160)).replace(/\s+/g, ' ').trim();
  return {
    push(text) {
      const buf = tail + text;
      for (const k in GB_PATS) {
        if (found[k] != null) continue;
        const m = GB_PATS[k].exec(buf);
        if (m) { found[k] = m[1]; lines[k] = around(buf, m.index, m[0].length); }
      }
      GB_CYCLE.lastIndex = 0;
      let m;
      while ((m = GB_CYCLE.exec(buf))) {
        const v = +m[1];
        if (cycle == null || v > cycle) { cycle = v; lines.cycle = around(buf, m.index, m[0].length); }
      }
      tail = buf.slice(-400);
      const core = (found.bsoh != null || found.asoc != null) && (cycle != null || found.usage != null) && found.model != null;
      if (!core) return false;
      if (found.design != null) return true;
      // Đủ thông tin chính nhưng chưa thấy dung lượng thiết kế: đọc thêm khoảng 30 triệu ký tự rồi dừng.
      if (after < 0) after = 0;
      after += text.length;
      return after > 3e7;
    },
    result() { return galaxyBattSummary(found, cycle, lines); }
  };
}
function galaxyBattSummary(f, cycle, lines) {
  const n = k => (f[k] != null ? +f[k] : null);
  const bsoh = n('bsoh'), asoc = n('asoc');
  const health = bsoh != null ? bsoh : asoc;
  const design = f.design != null ? Math.round(+f.design / 1000) : null;
  return {
    health, src: bsoh != null ? 'bsoh' : asoc != null ? 'asoc' : null, bsoh, asoc,
    cycles: cycle != null ? cycle : f.usage != null ? Math.round(+f.usage / 100) : null,
    maxTempC: f.maxTemp != null ? +f.maxTemp / 10 : null,
    designMah: design, remainMah: design && health != null ? Math.round(design * health / 1000) * 10 : null,
    model: f.model || null, pda: f.pda || null,
    level: health == null ? null : health >= 90 ? 'ok' : health >= 85 ? 'b85' : health >= 80 ? 'b80' : 'low',
    lines: lines || {}
  };
}
