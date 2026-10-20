// ===== Máy ảnh =====
// sc = cách đọc số lần chụp từ ảnh JPEG: 'total' (gồm cả màn trập điện tử), 'mech' (chỉ màn trập cơ),
//      'images' (số ảnh của Fujifilm, có thể bị reset), null = không đọc được từ ảnh.
// rated = độ bền màn trập { n, src }. src: 'hãng' (tài liệu hãng), 'phụ' (nguồn thứ cấp). Không có thì dùng ước tính theo phân khúc.
// tier: entry | mid | ff | pro → ước tính 100k / 150k / 200k / 300k khi hãng không công bố.

const SHUTTER_TIER = { entry: 100000, mid: 150000, ff: 200000, pro: 300000 };

const CAMERA_MODELS = [
  // --- Canon ---
  { id: 'c-r50', brand: 'canon', name: 'Canon EOS R50', year: 2023, usd: 679, kind: 'ml', sc: 'total', tier: 'entry', slots: 1 },
  { id: 'c-r10', brand: 'canon', name: 'Canon EOS R10', year: 2022, usd: 979, kind: 'ml', sc: null, tier: 'mid', slots: 1 },
  { id: 'c-r8', brand: 'canon', name: 'Canon EOS R8', year: 2023, usd: 1499, kind: 'ml', sc: 'total', tier: 'mid', slots: 1 },
  { id: 'c-r7', brand: 'canon', name: 'Canon EOS R7', year: 2022, usd: 1499, kind: 'ml', sc: null, tier: 'mid', ibis: true, slots: 2 },
  { id: 'c-rp', brand: 'canon', name: 'Canon EOS RP', year: 2019, usd: 1299, kind: 'ml', sc: null, rated: { n: 100000, src: 'phụ' }, slots: 1 },
  { id: 'c-r', brand: 'canon', name: 'Canon EOS R', year: 2018, usd: 2299, kind: 'ml', sc: null, rated: { n: 200000, src: 'hãng' }, slots: 1 },
  { id: 'c-r6', brand: 'canon', name: 'Canon EOS R6', year: 2020, usd: 2499, kind: 'ml', sc: 'total', rated: { n: 300000, src: 'hãng' }, ibis: true, slots: 2 },
  { id: 'c-r6ii', brand: 'canon', name: 'Canon EOS R6 Mark II', year: 2022, usd: 2499, kind: 'ml', sc: 'total', tier: 'ff', ibis: true, slots: 2 },
  { id: 'c-r5', brand: 'canon', name: 'Canon EOS R5', year: 2020, usd: 3899, kind: 'ml', sc: 'total', rated: { n: 500000, src: 'hãng' }, ibis: true, slots: 2 },
  { id: 'c-m50ii', brand: 'canon', name: 'Canon EOS M50 Mark II', year: 2020, usd: 599, kind: 'ml', sc: null, tier: 'entry', slots: 1 },
  { id: 'c-90d', brand: 'canon', name: 'Canon EOS 90D', year: 2019, usd: 1199, kind: 'dslr', sc: null, tier: 'mid', slots: 1 },
  { id: 'c-850d', brand: 'canon', name: 'Canon EOS 850D', year: 2020, usd: 749, kind: 'dslr', sc: null, tier: 'entry', slots: 1 },
  { id: 'c-6dii', brand: 'canon', name: 'Canon EOS 6D Mark II', year: 2017, usd: 1999, kind: 'dslr', sc: null, rated: { n: 100000, src: 'phụ' }, slots: 1 },
  // --- Sony ---
  { id: 's-a7iii', brand: 'sony', name: 'Sony A7 III', year: 2018, usd: 1999, kind: 'ml', sc: 'total', rated: { n: 200000, src: 'phụ' }, ibis: true, slots: 2 },
  { id: 's-a7iv', brand: 'sony', name: 'Sony A7 IV', year: 2021, usd: 2499, kind: 'ml', sc: 'total', tier: 'ff', ibis: true, slots: 2 },
  { id: 's-a7c', brand: 'sony', name: 'Sony A7C', year: 2020, usd: 1799, kind: 'ml', sc: 'total', tier: 'ff', ibis: true, slots: 1 },
  { id: 's-a7cii', brand: 'sony', name: 'Sony A7C II', year: 2023, usd: 2199, kind: 'ml', sc: 'mech', tier: 'ff', ibis: true, slots: 1 },
  { id: 's-a6400', brand: 'sony', name: 'Sony A6400', year: 2019, usd: 899, kind: 'ml', sc: 'total', rated: { n: 200000, src: 'hãng' }, slots: 1 },
  { id: 's-a6600', brand: 'sony', name: 'Sony A6600', year: 2019, usd: 1399, kind: 'ml', sc: 'total', tier: 'mid', ibis: true, slots: 1 },
  { id: 's-a6700', brand: 'sony', name: 'Sony A6700', year: 2023, usd: 1399, kind: 'ml', sc: 'mech', tier: 'mid', ibis: true, slots: 1 },
  { id: 's-zve10', brand: 'sony', name: 'Sony ZV-E10', year: 2021, usd: 699, kind: 'ml', sc: 'total', tier: 'entry', noEvf: true, slots: 1 },
  // --- Nikon ---
  { id: 'n-z5', brand: 'nikon', name: 'Nikon Z5', year: 2020, usd: 1399, kind: 'ml', sc: 'total', rated: { n: 200000, src: 'phụ' }, ibis: true, slots: 2 },
  { id: 'n-z6ii', brand: 'nikon', name: 'Nikon Z6 II', year: 2020, usd: 1999, kind: 'ml', sc: 'total', tier: 'ff', ibis: true, slots: 2 },
  { id: 'n-z6iii', brand: 'nikon', name: 'Nikon Z6III', year: 2024, usd: 2499, kind: 'ml', sc: 'total', tier: 'ff', ibis: true, slots: 2 },
  { id: 'n-z50', brand: 'nikon', name: 'Nikon Z50', year: 2019, usd: 859, kind: 'ml', sc: 'total', tier: 'entry', slots: 1 },
  { id: 'n-zf', brand: 'nikon', name: 'Nikon Zf', year: 2023, usd: 1999, kind: 'ml', sc: 'total', tier: 'ff', ibis: true, slots: 2 },
  { id: 'n-zfc', brand: 'nikon', name: 'Nikon Z fc', year: 2021, usd: 959, kind: 'ml', sc: 'total', tier: 'entry', slots: 1 },
  { id: 'n-d750', brand: 'nikon', name: 'Nikon D750', year: 2014, usd: 2299, kind: 'dslr', sc: 'total', rated: { n: 150000, src: 'phụ' }, slots: 2 },
  { id: 'n-d7500', brand: 'nikon', name: 'Nikon D7500', year: 2017, usd: 1249, kind: 'dslr', sc: 'total', rated: { n: 150000, src: 'phụ' }, slots: 1 },
  { id: 'n-d850', brand: 'nikon', name: 'Nikon D850', year: 2017, usd: 3299, kind: 'dslr', sc: 'total', rated: { n: 200000, src: 'phụ' }, slots: 2 },
  // --- Fujifilm ---
  { id: 'f-xt30ii', brand: 'fujifilm', name: 'Fujifilm X-T30 II', year: 2021, usd: 899, kind: 'ml', sc: 'images', tier: 'entry', slots: 1 },
  { id: 'f-xs10', brand: 'fujifilm', name: 'Fujifilm X-S10', year: 2020, usd: 999, kind: 'ml', sc: 'images', tier: 'entry', ibis: true, slots: 1 },
  { id: 'f-xs20', brand: 'fujifilm', name: 'Fujifilm X-S20', year: 2023, usd: 1299, kind: 'ml', sc: 'images', tier: 'mid', ibis: true, slots: 1 },
  { id: 'f-xt4', brand: 'fujifilm', name: 'Fujifilm X-T4', year: 2020, usd: 1699, kind: 'ml', sc: 'images', rated: { n: 300000, src: 'phụ' }, ibis: true, slots: 2 },
  { id: 'f-xt5', brand: 'fujifilm', name: 'Fujifilm X-T5', year: 2022, usd: 1699, kind: 'ml', sc: 'images', tier: 'mid', ibis: true, slots: 2 },
  { id: 'f-x100v', brand: 'fujifilm', name: 'Fujifilm X100V', year: 2020, usd: 1399, kind: 'ml', fixed: true, sc: 'images', tier: 'entry', slots: 1 },
  { id: 'f-x100vi', brand: 'fujifilm', name: 'Fujifilm X100VI', year: 2024, usd: 1599, kind: 'ml', fixed: true, sc: 'images', tier: 'entry', ibis: true, slots: 1 },
  // --- Khác ---
  { id: 'cam-ml', brand: 'other', name: 'Máy mirrorless khác', kind: 'ml', tier: 'mid' },
  { id: 'cam-dslr', brand: 'other', name: 'Máy DSLR khác', kind: 'dslr', tier: 'mid' }
];

function ratedShutter(m) {
  if (!m) return { n: SHUTTER_TIER.mid, src: 'ước tính' };
  if (m.rated) return m.rated;
  return { n: SHUTTER_TIER[m.tier || 'mid'], src: 'ước tính' };
}

const SC_HOWTO = {
  canon: 'Canon đời này không ghi số lần chụp vào ảnh. Cần phần mềm đọc qua cáp USB (vd. EOSInfo, Shutter Count) hoặc trung tâm dịch vụ.',
  panasonic: 'Panasonic chỉ xem được trong menu ẩn của máy.',
  olympus: 'Olympus / OM System chỉ xem được trong menu ẩn của máy.',
  default: 'Đời máy này không ghi số lần chụp vào ảnh. Hỏi người bán ảnh chụp màn hình phần mềm đọc qua USB.'
};

const CAMERA = {
  id: 'camera',
  name: 'Máy ảnh',
  icon: 'camera',
  models: CAMERA_MODELS,
  retention: m => (m && m.kind === 'dslr' ? 'camera_dslr' : 'camera_mirrorless'),
  searchQuery: (m, insp) => (m ? m.name : 'máy ảnh') + (insp.info.lens ? ' ' + insp.info.lens : ''),
  fields: ['lens', 'serial', 'warranty'],
  groups: [
    { id: 'lock', name: 'Nguồn gốc', W: 0, note: 'Không tính điểm. Lỗi ở đây là không mua.' },
    { id: 'sh', name: 'Màn trập', W: 18 },
    { id: 'sensor', name: 'Cảm biến', W: 20 },
    { id: 'af', name: 'Lấy nét và chống rung', W: 12 },
    { id: 'view', name: 'Màn hình và kính ngắm', W: 10 },
    { id: 'fn', name: 'Nút, khe thẻ, cổng, pin', W: 15 },
    { id: 'body', name: 'Thân máy và ngàm', W: 15 },
    { id: 'lens', name: 'Ống kính kèm theo', W: 15 },
    { id: 'acc', name: 'Phụ kiện và bảo hành', W: 5 }
  ],
  items: [
    {
      id: 'cm.serial', g: 'lock', gate: true, tool: 'exif',
      t: 'Số sê-ri khớp: thân máy, hộp, ảnh chụp thử',
      how: c => 'Số sê-ri in dưới đáy hoặc trong khoang pin. So với tem hộp và với số đọc từ ảnh chụp thử (công cụ Đọc ảnh máy ảnh).' + (c.brand === 'sony' ? ' Sony chỉ ghi số sê-ri vào ảnh khi bật Menu › Chụp › Tệp › Ghi số sê-ri.' : '') + (c.brand === 'fujifilm' ? ' Fujifilm ghi số nội bộ, không trùng số in trên thân máy, chỉ so được giữa các ảnh.' : ''),
      levels: [
        { id: 'ok', label: 'Khớp', f: 1 },
        { id: 'nobox', label: 'Không có hộp / ảnh để so', f: 1 },
        { id: 'bad', label: 'Không khớp', f: 0, ko: true, note: 'Sê-ri lệch: nghi đồ trộm hoặc thân máy bị tráo.' }
      ]
    },
    {
      id: 'cm.stolen', g: 'lock', optional: true,
      t: 'Tra máy bị báo mất (Lenstag)',
      how: 'Nhập số sê-ri vào mục kiểm tra đồ bị mất của lenstag.com trước khi trả tiền.',
      levels: gate('Không có trong danh sách', 'Bị báo mất', 'Máy bị báo mất cắp: không mua.')
    },

    // ---------- Màn trập ----------
    {
      id: 'cm.shutter', g: 'sh', w: 3, tool: 'exif',
      t: 'Số lần chụp',
      how: c => {
        const r = ratedShutter(c.model);
        let s = c.model && c.model.sc
          ? 'Nhờ người bán chụp một tấm JPEG mới, gửi bạn file gốc (qua AirDrop, cáp, hoặc gửi dạng tệp — Telegram/Zalo gửi dạng ảnh sẽ xoá thông tin). Mở bằng công cụ Đọc ảnh máy ảnh.'
          : (SC_HOWTO[c.brand] || SC_HOWTO.default);
        if (c.model && c.model.sc === 'mech') s += ' Máy này chỉ đếm màn trập cơ.';
        if (c.model && c.model.sc === 'images') s += ' Fujifilm ghi "số ảnh", có thể bị đặt lại khi cập nhật firmware, nên số thấp chưa chắc là ít dùng.';
        s += ' Độ bền tham khảo: ' + r.n.toLocaleString('vi-VN') + ' lần (' + (r.src === 'hãng' ? 'hãng công bố' : r.src === 'phụ' ? 'nguồn thứ cấp' : 'ước tính theo phân khúc, hãng không công bố') + ').';
        return s;
      },
      input: {
        key: 'shutter', label: 'Số lần chụp', unit: 'lần', min: 0, max: 2000000,
        auto: (v, c) => { const p = v / ratedShutter(c.model).n; return p < 0.3 ? 'ok' : p < 0.7 ? 'mid' : p <= 1 ? 'high' : 'over'; }
      },
      levels: [
        { id: 'ok', label: '< 30% độ bền', f: 1 },
        { id: 'mid', label: '30–70%', f: 0.8 },
        { id: 'high', label: '70–100%', f: 0.45, note: 'Trừ tiền thay màn trập khi trả giá (thường 150–400 USD).' },
        { id: 'over', label: '> 100%', f: 0.15, note: 'Màn trập đã quá tuổi thọ dự kiến, có thể hỏng bất cứ lúc nào.' }
      ]
    },
    {
      id: 'cm.shutterwork', g: 'sh', w: 2,
      t: 'Màn trập hoạt động',
      how: 'Chụp ở tốc độ nhanh nhất (1/4000 hoặc 1/8000) và chậm (1 giây), chụp liên tiếp một loạt. Tiếng màn trập đều; ảnh tốc độ cao không có dải đen.',
      levels: [
        { id: 'ok', label: 'Bình thường', f: 1 },
        { id: 'major', label: 'Ảnh có dải đen / tiếng lạ', f: 0.1, cap: 45, note: 'Màn trập sắp hỏng: tính tiền thay.' },
        { id: 'bad', label: 'Kẹt, không chụp được', f: 0, cap: 30 }
      ]
    },

    // ---------- Cảm biến ----------
    {
      id: 'cm.dust', g: 'sensor', w: 3, tool: 'dust',
      t: 'Bụi và xước cảm biến',
      how: 'Chụp tường trắng hoặc bầu trời, khẩu f/16, lấy nét tay ra vô cực, ISO thấp, tắt khử nhiễu. Mở ảnh bằng công cụ Soi bụi cảm biến.',
      levels: [
        { id: 'ok', label: 'Sạch', f: 1 },
        { id: 'minor', label: 'Ít bụi, vệ sinh được', f: 0.85 },
        { id: 'major', label: 'Nhiều bụi / vết dầu', f: 0.5 },
        { id: 'bad', label: 'Xước cảm biến', f: 0, cap: 40, note: 'Xước cảm biến không vệ sinh được: bỏ hoặc trả rất thấp.' }
      ]
    },
    {
      id: 'cm.pixels', g: 'sensor', w: 3, tool: 'hotpixel',
      t: 'Điểm chết, điểm nóng',
      how: 'Đậy nắp ống kính, tắt khử nhiễu, chụp một tấm ISO 1600–3200 phơi sáng 1–4 giây. Mở bằng công cụ Soi điểm nóng.',
      levels: [
        { id: 'ok', label: 'Vài điểm lẻ (bình thường)', f: 1 },
        { id: 'minor', label: 'Hơi nhiều điểm', f: 0.75 },
        { id: 'major', label: 'Có cụm điểm', f: 0.3 },
        { id: 'bad', label: 'Cả hàng / cột chết', f: 0, cap: 40 }
      ]
    },

    // ---------- Lấy nét, chống rung ----------
    {
      id: 'cm.af', g: 'af', w: 3,
      t: 'Lấy nét tự động',
      how: 'Thử các chế độ lấy nét, nhận diện mắt, ở gần và xa, cả lúc quay video.',
      levels: [
        { id: 'ok', label: 'Nhanh, chính xác', f: 1 },
        { id: 'minor', label: 'Hơi chậm', f: 0.7 },
        { id: 'major', label: 'Hay trượt nét', f: 0.3 },
        { id: 'bad', label: 'Không lấy nét', f: 0, cap: 40 }
      ]
    },
    {
      id: 'cm.ibis', g: 'af', w: 2, when: c => !c.model || c.model.ibis,
      t: 'Chống rung thân máy (IBIS)',
      how: 'Bật máy, ngắm ở tiêu cự dài: hình phải ổn định. Khi tắt máy, lắc nhẹ có tiếng lục cục là bình thường ở nhiều máy; khi đang bật mà kêu hoặc hình rung là lỗi.',
      levels: LV.std
    },

    // ---------- Màn hình, kính ngắm ----------
    {
      id: 'cm.lcd', g: 'view', w: 2,
      t: 'Màn hình sau',
      how: 'Xem điểm chết, sọc. Lật xoay màn hình hết các góc, thử cảm ứng.',
      levels: [
        { id: 'ok', label: 'Tốt', f: 1 },
        { id: 'minor', label: 'Xước nhẹ', f: 0.8 },
        { id: 'major', label: 'Nứt / điểm chết / bản lề lỏng', f: 0.35 },
        { id: 'bad', label: 'Không hiển thị', f: 0, cap: 50 }
      ]
    },
    {
      id: 'cm.evf', g: 'view', w: 2, when: c => !c.model || !c.model.noEvf,
      t: c => c.model && c.model.kind === 'dslr' ? 'Kính ngắm quang học' : 'Kính ngắm điện tử',
      how: 'Nhìn qua kính ngắm: rõ, không bụi bẩn lớn. Chỉnh núm diop. Đưa mắt lại gần: máy phải tự chuyển từ màn hình sang kính ngắm.',
      levels: LV.std
    },

    // ---------- Nút, khe thẻ, cổng, pin ----------
    { id: 'cm.buttons', g: 'fn', w: 3, t: 'Nút bấm và bánh xe', how: 'Bấm mọi nút, xoay mọi bánh xe, bấm nửa cò lấy nét.', levels: LV.std },
    {
      id: 'cm.slots', g: 'fn', w: 2,
      t: c => c.model && c.model.slots === 2 ? 'Cả hai khe thẻ nhớ' : 'Khe thẻ nhớ',
      how: 'Cắm thẻ của bạn, chụp, định dạng, xem lại ảnh. Soi chân tiếp xúc trong khe.',
      levels: [
        { id: 'ok', label: 'Đọc ghi tốt', f: 1 },
        { id: 'major', label: 'Chập chờn', f: 0.3 },
        { id: 'bad', label: 'Không nhận thẻ', f: 0, cap: 50 }
      ]
    },
    { id: 'cm.ports', g: 'fn', w: 1, t: 'Cổng USB, HDMI, mic, chân đèn flash', how: 'Cắm sạc qua USB, cắm thử cáp các cổng có thể thử. Soi chân tiếp xúc trên đế đèn.', levels: LV.std },
    {
      id: 'cm.battery', g: 'fn', w: 2,
      t: 'Pin và nắp pin',
      how: 'Pin không phồng, không nóng bất thường. Nắp pin đóng chặt. Hỏi số pin kèm theo.',
      levels: [
        { id: 'ok', label: 'Tốt', f: 1 },
        { id: 'minor', label: 'Pin chai', f: 0.7, note: 'Pin máy ảnh thay được, trừ tiền một viên pin.' },
        { id: 'major', label: 'Pin phồng / nắp hỏng', f: 0.3 }
      ]
    },
    { id: 'cm.video', g: 'fn', w: 1, t: 'Quay video 5–10 phút', how: 'Quay ở độ phân giải cao nhất: không báo quá nhiệt, có tiếng, không có tiếng kêu của chống rung trong âm thanh.', levels: LV.std },

    // ---------- Thân máy ----------
    {
      id: 'cm.drop', g: 'body', w: 3,
      t: 'Dấu hiệu rơi va',
      how: 'Soi các góc móp, nắp trên nứt, ngàm lệch, ốc vít trầy.',
      levels: [
        { id: 'ok', label: 'Không có', f: 1 },
        { id: 'minor', label: 'Trầy góc nhẹ', f: 0.75 },
        { id: 'major', label: 'Móp, nứt', f: 0.3, cap: 65 },
        { id: 'bad', label: 'Ngàm lệch / vỡ', f: 0, cap: 40 }
      ]
    },
    {
      id: 'cm.water', g: 'body', w: 2,
      t: 'Dấu hiệu ẩm, cát, gỉ',
      how: 'Soi tiếp điểm pin và ngàm, khe dưới cao su bọc. Xoay bánh xe nghe có lạo xạo cát.',
      levels: [
        { id: 'ok', label: 'Sạch', f: 1 },
        { id: 'major', label: 'Có cát, ố', f: 0.3 },
        { id: 'bad', label: 'Gỉ sét', f: 0, cap: 30, note: 'Gỉ sét bên trong rất khó sửa triệt để.' }
      ]
    },
    { id: 'cm.mount', g: 'body', w: 1, when: c => !c.model || !c.model.fixed, t: 'Ngàm và tiếp điểm', how: 'Lắp ống kính: khít, không lỏng. Tiếp điểm sáng, không mòn.', levels: LV.std },
    { id: 'cm.grip', g: 'body', w: 2, t: 'Vỏ ngoài, cao su bọc', how: 'Cao su có bong, phồng không; vỏ trầy nhiều không.', levels: LV.cosmetic },

    // ---------- Ống kính kèm ----------
    {
      id: 'cm.lglass', g: 'lens', w: 3, when: c => c.hasLens,
      t: 'Kính ống kính: mốc, mờ, xước',
      how: 'Rọi đèn pin nghiêng qua ống kính từ trước rồi từ sau, xoay chậm. Mốc trông như mạng nhện. Vài hạt bụi bên trong là bình thường.',
      levels: [
        { id: 'ok', label: 'Trong', f: 1 },
        { id: 'minor', label: 'Có ít bụi', f: 0.9 },
        { id: 'major', label: 'Mờ / xước mặt trước', f: 0.45 },
        { id: 'bad', label: 'Mốc bên trong / xước mặt sau', f: 0, note: 'Mốc lan và khó tẩy: chỉ mua nếu không tính tiền ống kính.' }
      ]
    },
    {
      id: 'cm.laperture', g: 'lens', w: 2, when: c => c.hasLens,
      t: 'Lá khẩu',
      how: 'Đặt f/8 rồi bấm nút xem trước độ sâu trường ảnh (hoặc chụp), nhìn lá khẩu có dầu bóng, có đóng mở không.',
      levels: [
        { id: 'ok', label: 'Khô, đóng mở tốt', f: 1 },
        { id: 'major', label: 'Dính dầu', f: 0.4 },
        { id: 'bad', label: 'Kẹt', f: 0 }
      ]
    },
    { id: 'cm.lmech', g: 'lens', w: 2, when: c => c.hasLens, t: 'Lấy nét, vòng zoom, chống rung ống kính', how: 'Lấy nét không đi tới đi lui mãi; vòng zoom, vòng nét trơn đều; bật chống rung hình ổn định, không kêu lạch cạch.', levels: LV.std },

    { id: 'cm.box', g: 'acc', w: 1, t: 'Hộp, sạc, dây đeo, hoá đơn', how: 'Hộp có tem số sê-ri giúp đối chiếu.', levels: LV.box },
    { id: 'cm.warranty', g: 'acc', w: 1, t: 'Bảo hành còn lại', levels: LV.warranty }
  ]
};

const CATEGORIES = [PHONE, HEADPHONES, CAMERA];
