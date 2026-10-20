// ===== Dữ liệu dùng chung: mức chấm, hạng, đường cong giá, khấu hao, tiền tệ =====
// Mỗi mục kiểm tra có danh sách "mức" (levels). f = hệ số điểm (1 = đủ điểm, 0 = mất hết điểm của mục).
// ko = true  → loại trực tiếp (không mua, không định giá).
// cap = N     → điểm tổng tối đa N dù các mục khác tốt (vd. màn vỡ thì tối đa hạng Khá).

const LV = {
  std: [
    { id: 'ok', label: 'Tốt', f: 1 },
    { id: 'minor', label: 'Hơi kém', f: 0.7 },
    { id: 'major', label: 'Lỗi rõ', f: 0.3 },
    { id: 'bad', label: 'Hỏng', f: 0 }
  ],
  cosmetic: [
    { id: 'ok', label: 'Như mới', f: 1 },
    { id: 'minor', label: 'Xước nhẹ', f: 0.75 },
    { id: 'major', label: 'Xước rõ, móp', f: 0.4 },
    { id: 'bad', label: 'Nứt, vỡ, móp nặng', f: 0.1 }
  ],
  box: [
    { id: 'ok', label: 'Đủ hộp, cáp, hoá đơn', f: 1 },
    { id: 'minor', label: 'Có hộp, thiếu giấy tờ', f: 0.6 },
    { id: 'major', label: 'Chỉ có máy', f: 0.25 }
  ],
  warranty: [
    { id: 'ok', label: 'Còn ≥ 6 tháng', f: 1 },
    { id: 'minor', label: 'Còn < 6 tháng', f: 0.75 },
    { id: 'major', label: 'Hết / không rõ', f: 0.5 }
  ]
};

function gate(okLabel, badLabel, badNote) {
  return [
    { id: 'ok', label: okLabel || 'Đạt', f: 1 },
    { id: 'bad', label: badLabel || 'Không đạt', f: 0, ko: true, note: badNote || '' }
  ];
}

// Hạng tình trạng theo điểm. Dải 95/85/70/50 bám theo thang của các sàn (Back Market, Swappa)
// và bản nháp "Wear Index" (A 85–100, B 70–84, C 50–69).
const GRADES = [
  { min: 95, id: 'S', name: 'Như mới', tone: 'pass' },
  { min: 85, id: 'A', name: 'Rất tốt', tone: 'pass' },
  { min: 70, id: 'B', name: 'Tốt', tone: 'info' },
  { min: 50, id: 'C', name: 'Khá', tone: 'warn' },
  { min: 0, id: 'D', name: 'Kém, cần sửa', tone: 'stop' }
];

// Hệ số ngoại hình: điểm ngoại hình → hệ số nhân vào giá tham chiếu.
// Giá tham chiếu = giá máy cũ đẹp, đủ chức năng (khoảng 85 điểm ngoại hình) → hệ số 1.
// Khoảng cách Fair ↔ Excellent ≈ 10% (Back Market, refurb.me). Sửa được khi có dữ liệu thật.
const COS_CURVE = [[0, 0.80], [40, 0.86], [55, 0.90], [70, 0.95], [85, 1.00], [95, 1.03], [100, 1.04]];

// Hạng ngoại hình kiểu CTIA (chữ cái), tách khỏi tình trạng chức năng.
const COS_GRADES = [
  { min: 90, id: 'A', name: 'Như mới' },
  { min: 75, id: 'B', name: 'Hao mòn nhẹ' },
  { min: 55, id: 'C', name: 'Hao mòn rõ' },
  { min: 0, id: 'D', name: 'Hư hại nặng' }
];

// Khấu hao thô theo năm tuổi (so với giá lúc ra mắt), chỉ dùng khi chưa có giá thị trường.
// Điện thoại: theo báo cáo BankMyCell/SellCell (iPhone giữ giá tốt hơn Android).
// Máy ảnh: theo chỉ số MPB (mirrorless mất ~17%/3 năm ở Mỹ, DSLR ~35%) và khảo sát Minna Camera.
const RETENTION = {
  phone_apple: [[0, 0.85], [1, 0.75], [2, 0.62], [3, 0.52], [4, 0.43], [5, 0.35], [7, 0.25]],
  phone_android: [[0, 0.75], [1, 0.55], [2, 0.40], [3, 0.30], [4, 0.22], [5, 0.17], [7, 0.10]],
  headphones: [[0, 0.75], [1, 0.60], [2, 0.48], [3, 0.38], [4, 0.30], [5, 0.24]],
  camera_mirrorless: [[0, 0.85], [1, 0.78], [2, 0.70], [3, 0.64], [4, 0.58], [5, 0.53], [8, 0.42]],
  camera_dslr: [[0, 0.75], [1, 0.60], [2, 0.50], [3, 0.43], [4, 0.37], [5, 0.32], [8, 0.22]]
};

const CURRENCIES = {
  RUB: { symbol: '₽', name: 'Rúp', step: 100, bigStep: 500, locale: 'vi-VN', after: true },
  VND: { symbol: '₫', name: 'Đồng', step: 50000, bigStep: 100000, locale: 'vi-VN', after: true },
  USD: { symbol: '$', name: 'Đô la', step: 1, bigStep: 5, locale: 'en-US', after: false }
};

// Kết luận theo tỉ lệ giá người bán đòi (A) / giá hợp lý (F).
// A ≤ F: mua. F < A ≤ F / tỉ lệ chốt: trả giá. Cao hơn nữa: bỏ.
// Tỉ lệ chốt 0,73 = giá chốt trung bình / giá rao trên eBay (NBER, 25 triệu cuộc trả giá).
const VERDICTS = {
  stop: { code: 'stop', stamp: 'Không mua', tone: 'stop' },
  great: { code: 'great', stamp: 'Giá tốt', tone: 'pass', title: 'Rẻ hơn giá hợp lý, mua được' },
  buy: { code: 'buy', stamp: 'Mua được', tone: 'pass', title: 'Giá hợp lý' },
  haggle: { code: 'haggle', stamp: 'Trả giá', tone: 'warn', title: 'Cao hơn giá hợp lý, trả giá rồi mới mua' },
  walk: { code: 'walk', stamp: 'Bỏ', tone: 'stop', title: 'Đắt quá: trả giá thành công cũng khó về mức hợp lý' },
  pending: { code: 'pending', stamp: 'Chưa xong', tone: 'info', title: 'Còn mục bắt buộc chưa kiểm' }
};

// Liên kết tìm giá tham khảo (mở trang tìm kiếm, app không tự thu thập dữ liệu).
const MARKET_LINKS = [
  { id: 'avito', name: 'Avito', url: q => 'https://www.avito.ru/all?q=' + encodeURIComponent(q) },
  { id: 'chotot', name: 'Chợ Tốt', url: q => 'https://www.chotot.com/mua-ban?q=' + encodeURIComponent(q) },
  { id: 'ebay', name: 'eBay (đã bán)', url: q => 'https://www.ebay.com/sch/i.html?_nkw=' + encodeURIComponent(q) + '&LH_Sold=1&LH_Complete=1' }
];

const DEFAULT_SETTINGS = {
  currency: 'RUB',
  usdRub: 82,             // 1 USD = ? RUB (tự sửa theo tỷ giá đang dùng)
  rubVnd: 296,            // 1 RUB = ? VND (mặc định theo 71.000 ₽ ≈ 21 triệu ₫)
  repairFactor: 0.8,      // giá sửa ở tiệm so với bảng giá hãng (Apple, Sony...)
  listingDiscount: 5,     // giá rao thường cao hơn giá chốt (%)
  closeRatio: 0.73,       // giá chốt / giá rao khi trả giá thành công
  margin: 0               // biên an toàn thêm khi mua của người lạ (%)
};
