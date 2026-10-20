// ===== Điện thoại =====
// Danh mục máy: thông tin dùng để sinh đúng mục kiểm tra (Face ID hay Touch ID, nút Tác vụ, số chu kỳ pin...).
// usd = giá ra mắt ở Mỹ (chỉ để gợi ý khi ước tính khấu hao). screen = [rộng, cao, tỉ lệ điểm ảnh] trong Safari.
// esim: 'us' = bản Mỹ (LL) chỉ eSIM; '17' = chỉ eSIM ở 12 thị trường; 'all' = chỉ eSIM mọi nơi.

const PHONE_MODELS = [
  // --- Apple ---
  { id: 'ip-se2', brand: 'apple', name: 'iPhone SE (thế hệ 2)', year: 2020, usd: 399, touchId: true, parts: 'battery', truetone: true, zoom: ['1×'], screen: [375, 667, 2] },
  { id: 'ip-11', brand: 'apple', name: 'iPhone 11', year: 2019, usd: 699, faceId: true, parts: 'bd', truetone: true, zoom: ['0.5×', '1×'], screen: [414, 896, 2] },
  { id: 'ip-11p', brand: 'apple', name: 'iPhone 11 Pro', year: 2019, usd: 999, faceId: true, oled: true, parts: 'bd', truetone: true, zoom: ['0.5×', '1×', '2×'], screen: [375, 812, 3] },
  { id: 'ip-11pm', brand: 'apple', name: 'iPhone 11 Pro Max', year: 2019, usd: 1099, faceId: true, oled: true, parts: 'bd', truetone: true, zoom: ['0.5×', '1×', '2×'], screen: [414, 896, 3] },
  { id: 'ip-12m', brand: 'apple', name: 'iPhone 12 mini', year: 2020, usd: 699, faceId: true, oled: true, parts: 'full', truetone: true, magsafe: true, zoom: ['0.5×', '1×'], screen: [375, 812, 3] },
  { id: 'ip-12', brand: 'apple', name: 'iPhone 12', year: 2020, usd: 799, faceId: true, oled: true, parts: 'full', truetone: true, magsafe: true, zoom: ['0.5×', '1×'], screen: [390, 844, 3] },
  { id: 'ip-12p', brand: 'apple', name: 'iPhone 12 Pro', year: 2020, usd: 999, faceId: true, oled: true, parts: 'full', truetone: true, magsafe: true, zoom: ['0.5×', '1×', '2×'], screen: [390, 844, 3] },
  { id: 'ip-12pm', brand: 'apple', name: 'iPhone 12 Pro Max', year: 2020, usd: 1099, faceId: true, oled: true, parts: 'full', truetone: true, magsafe: true, zoom: ['0.5×', '1×', '2.5×'], screen: [428, 926, 3] },
  { id: 'ip-se3', brand: 'apple', name: 'iPhone SE (thế hệ 3)', year: 2022, usd: 429, touchId: true, parts: 'battery', truetone: true, zoom: ['1×'], screen: [375, 667, 2] },
  { id: 'ip-13m', brand: 'apple', name: 'iPhone 13 mini', year: 2021, usd: 699, faceId: true, oled: true, parts: 'full', truetone: true, magsafe: true, zoom: ['0.5×', '1×'], screen: [375, 812, 3] },
  { id: 'ip-13', brand: 'apple', name: 'iPhone 13', year: 2021, usd: 799, faceId: true, oled: true, parts: 'full', truetone: true, magsafe: true, zoom: ['0.5×', '1×'], screen: [390, 844, 3] },
  { id: 'ip-13p', brand: 'apple', name: 'iPhone 13 Pro', year: 2021, usd: 999, faceId: true, oled: true, parts: 'full', truetone: true, magsafe: true, zoom: ['0.5×', '1×', '3×'], screen: [390, 844, 3] },
  { id: 'ip-13pm', brand: 'apple', name: 'iPhone 13 Pro Max', year: 2021, usd: 1099, faceId: true, oled: true, parts: 'full', truetone: true, magsafe: true, zoom: ['0.5×', '1×', '3×'], screen: [428, 926, 3] },
  { id: 'ip-14', brand: 'apple', name: 'iPhone 14', year: 2022, usd: 799, faceId: true, oled: true, parts: 'full', truetone: true, magsafe: true, esim: 'us', zoom: ['0.5×', '1×'], screen: [390, 844, 3] },
  { id: 'ip-14pl', brand: 'apple', name: 'iPhone 14 Plus', year: 2022, usd: 899, faceId: true, oled: true, parts: 'full', truetone: true, magsafe: true, esim: 'us', zoom: ['0.5×', '1×'], screen: [428, 926, 3] },
  { id: 'ip-14p', brand: 'apple', name: 'iPhone 14 Pro', year: 2022, usd: 999, faceId: true, oled: true, parts: 'full', truetone: true, magsafe: true, esim: 'us', zoom: ['0.5×', '1×', '2×', '3×'], screen: [393, 852, 3] },
  { id: 'ip-14pm', brand: 'apple', name: 'iPhone 14 Pro Max', year: 2022, usd: 1099, faceId: true, oled: true, parts: 'full', truetone: true, magsafe: true, esim: 'us', zoom: ['0.5×', '1×', '2×', '3×'], screen: [430, 932, 3] },
  { id: 'ip-15', brand: 'apple', name: 'iPhone 15', year: 2023, usd: 799, faceId: true, oled: true, parts: 'full', truetone: true, magsafe: true, usbc: true, cycles: true, esim: 'us', zoom: ['0.5×', '1×', '2×'], screen: [393, 852, 3] },
  { id: 'ip-15pl', brand: 'apple', name: 'iPhone 15 Plus', year: 2023, usd: 899, faceId: true, oled: true, parts: 'full', truetone: true, magsafe: true, usbc: true, cycles: true, esim: 'us', zoom: ['0.5×', '1×', '2×'], screen: [430, 932, 3] },
  { id: 'ip-15p', brand: 'apple', name: 'iPhone 15 Pro', year: 2023, usd: 999, faceId: true, oled: true, parts: 'full', truetone: true, magsafe: true, usbc: true, cycles: true, action: true, esim: 'us', zoom: ['0.5×', '1×', '2×', '3×'], screen: [393, 852, 3] },
  { id: 'ip-15pm', brand: 'apple', name: 'iPhone 15 Pro Max', year: 2023, usd: 1199, faceId: true, oled: true, parts: 'full', truetone: true, magsafe: true, usbc: true, cycles: true, action: true, esim: 'us', zoom: ['0.5×', '1×', '2×', '5×'], screen: [430, 932, 3] },
  { id: 'ip-16e', brand: 'apple', name: 'iPhone 16e', year: 2025, usd: 599, faceId: true, oled: true, parts: 'full', truetone: true, usbc: true, cycles: true, action: true, esim: 'us', zoom: ['1×', '2×'], screen: [390, 844, 3] },
  { id: 'ip-16', brand: 'apple', name: 'iPhone 16', year: 2024, usd: 799, faceId: true, oled: true, parts: 'full', truetone: true, magsafe: true, usbc: true, cycles: true, action: true, camCtrl: true, esim: 'us', zoom: ['0.5×', '1×', '2×'], screen: [393, 852, 3] },
  { id: 'ip-16pl', brand: 'apple', name: 'iPhone 16 Plus', year: 2024, usd: 899, faceId: true, oled: true, parts: 'full', truetone: true, magsafe: true, usbc: true, cycles: true, action: true, camCtrl: true, esim: 'us', zoom: ['0.5×', '1×', '2×'], screen: [430, 932, 3] },
  { id: 'ip-16p', brand: 'apple', name: 'iPhone 16 Pro', year: 2024, usd: 999, faceId: true, oled: true, parts: 'full', truetone: true, magsafe: true, usbc: true, cycles: true, action: true, camCtrl: true, esim: 'us', zoom: ['0.5×', '1×', '2×', '5×'], screen: [402, 874, 3] },
  { id: 'ip-16pm', brand: 'apple', name: 'iPhone 16 Pro Max', year: 2024, usd: 1199, faceId: true, oled: true, parts: 'full', truetone: true, magsafe: true, usbc: true, cycles: true, action: true, camCtrl: true, esim: 'us', zoom: ['0.5×', '1×', '2×', '5×'], screen: [440, 956, 3] },
  { id: 'ip-17', brand: 'apple', name: 'iPhone 17', year: 2025, usd: 799, faceId: true, oled: true, parts: 'full', truetone: true, magsafe: true, usbc: true, cycles: true, action: true, camCtrl: true, esim: '17', zoom: ['0.5×', '1×', '2×'], screen: [402, 874, 3] },
  { id: 'ip-air', brand: 'apple', name: 'iPhone Air', year: 2025, usd: 999, faceId: true, oled: true, parts: 'full', truetone: true, magsafe: true, usbc: true, cycles: true, action: true, camCtrl: true, esim: 'all', zoom: ['1×', '2×'], screen: [420, 912, 3] },
  { id: 'ip-17p', brand: 'apple', name: 'iPhone 17 Pro', year: 2025, usd: 1099, faceId: true, oled: true, parts: 'full', truetone: true, magsafe: true, usbc: true, cycles: true, action: true, camCtrl: true, esim: '17', zoom: ['0.5×', '1×', '2×', '4×', '8×'], screen: [402, 874, 3] },
  { id: 'ip-17pm', brand: 'apple', name: 'iPhone 17 Pro Max', year: 2025, usd: 1199, faceId: true, oled: true, parts: 'full', truetone: true, magsafe: true, usbc: true, cycles: true, action: true, camCtrl: true, esim: '17', zoom: ['0.5×', '1×', '2×', '4×', '8×'], screen: [440, 956, 3] },
  { id: 'ip-17e', brand: 'apple', name: 'iPhone 17e', year: 2026, faceId: true, oled: true, parts: 'full', truetone: true, magsafe: true, usbc: true, cycles: true, esim: '17' },
  { id: 'ip-18p', brand: 'apple', name: 'iPhone 18 Pro', year: 2026, faceId: true, oled: true, parts: 'full', truetone: true, magsafe: true, usbc: true, cycles: true, action: true, camCtrl: true },
  { id: 'ip-18pm', brand: 'apple', name: 'iPhone 18 Pro Max', year: 2026, faceId: true, oled: true, parts: 'full', truetone: true, magsafe: true, usbc: true, cycles: true, action: true, camCtrl: true },
  // --- Samsung ---
  { id: 'ss-s23', brand: 'samsung', name: 'Galaxy S23', year: 2023, usd: 799, oled: true },
  { id: 'ss-s23u', brand: 'samsung', name: 'Galaxy S23 Ultra', year: 2023, usd: 1199, oled: true, spen: true },
  { id: 'ss-s24', brand: 'samsung', name: 'Galaxy S24', year: 2024, usd: 799, oled: true },
  { id: 'ss-s24p', brand: 'samsung', name: 'Galaxy S24+', year: 2024, usd: 999, oled: true },
  { id: 'ss-s24u', brand: 'samsung', name: 'Galaxy S24 Ultra', year: 2024, usd: 1299, oled: true, spen: true },
  { id: 'ss-s25', brand: 'samsung', name: 'Galaxy S25', year: 2025, usd: 799, oled: true },
  { id: 'ss-s25p', brand: 'samsung', name: 'Galaxy S25+', year: 2025, usd: 999, oled: true },
  { id: 'ss-s25u', brand: 'samsung', name: 'Galaxy S25 Ultra', year: 2025, usd: 1299, oled: true, spen: true },
  { id: 'ss-a55', brand: 'samsung', name: 'Galaxy A55', year: 2024, oled: true },
  { id: 'ss-a56', brand: 'samsung', name: 'Galaxy A56', year: 2025, oled: true },
  { id: 'ss-other', brand: 'samsung', name: 'Samsung khác', oled: true },
  // --- Google Pixel --- (tình trạng pin hiển thị từ Pixel 8a trở đi)
  { id: 'px-8', brand: 'pixel', name: 'Pixel 8', year: 2023, usd: 699, oled: true },
  { id: 'px-8p', brand: 'pixel', name: 'Pixel 8 Pro', year: 2023, usd: 999, oled: true },
  { id: 'px-8a', brand: 'pixel', name: 'Pixel 8a', year: 2024, usd: 499, oled: true, batteryHealth: true },
  { id: 'px-9', brand: 'pixel', name: 'Pixel 9', year: 2024, usd: 799, oled: true, batteryHealth: true },
  { id: 'px-9p', brand: 'pixel', name: 'Pixel 9 Pro', year: 2024, usd: 999, oled: true, batteryHealth: true },
  { id: 'px-9pxl', brand: 'pixel', name: 'Pixel 9 Pro XL', year: 2024, usd: 1099, oled: true, batteryHealth: true },
  { id: 'px-9a', brand: 'pixel', name: 'Pixel 9a', year: 2025, usd: 499, oled: true, batteryHealth: true },
  { id: 'px-10', brand: 'pixel', name: 'Pixel 10', year: 2025, usd: 799, oled: true, batteryHealth: true },
  { id: 'px-10p', brand: 'pixel', name: 'Pixel 10 Pro', year: 2025, usd: 999, oled: true, batteryHealth: true },
  { id: 'px-10pxl', brand: 'pixel', name: 'Pixel 10 Pro XL', year: 2025, usd: 1199, oled: true, batteryHealth: true },
  { id: 'px-other', brand: 'pixel', name: 'Pixel khác', oled: true },
  // --- Xiaomi ---
  { id: 'mi-14', brand: 'xiaomi', name: 'Xiaomi 14', year: 2024, oled: true },
  { id: 'mi-15', brand: 'xiaomi', name: 'Xiaomi 15', year: 2025, oled: true },
  { id: 'mi-rn13p', brand: 'xiaomi', name: 'Redmi Note 13 Pro', year: 2024, oled: true },
  { id: 'mi-rn14p', brand: 'xiaomi', name: 'Redmi Note 14 Pro', year: 2025, oled: true },
  { id: 'mi-other', brand: 'xiaomi', name: 'Xiaomi / Redmi / Poco khác', oled: true },
  // --- Khác ---
  { id: 'and-other', brand: 'other', name: 'Android hãng khác' }
];

const PHONE = {
  id: 'phone',
  name: 'Điện thoại',
  icon: 'phone',
  models: PHONE_MODELS,
  retention: m => (m.brand === 'apple' ? 'phone_apple' : 'phone_android'),
  searchQuery: (m, insp) => (m ? m.name : '') + (insp.info.storage ? ' ' + insp.info.storage : ''),
  fields: ['storage', 'partno', 'imei', 'serial', 'warranty'],
  groups: [
    { id: 'lock', name: 'Tài khoản và pháp lý', W: 0, note: 'Không tính điểm. Lỗi ở đây là không mua.' },
    { id: 'id', name: 'Nhận dạng và linh kiện', W: 12 },
    { id: 'bat', name: 'Pin và sạc', W: 14 },
    { id: 'scr', name: 'Màn hình', W: 20 },
    { id: 'cam', name: 'Camera', W: 12 },
    { id: 'fn', name: 'Chức năng', W: 24 },
    { id: 'body', name: 'Ngoại hình', W: 13 },
    { id: 'acc', name: 'Phụ kiện và bảo hành', W: 5 }
  ],
  items: [
    // ---------- Tài khoản và pháp lý (loại trực tiếp) ----------
    {
      id: 'ph.actlock', g: 'lock', gate: true, when: c => c.brand === 'apple',
      t: 'Khoá kích hoạt iCloud',
      how: 'Người bán đăng xuất Apple ID (Cài đặt › tên người bán › Đăng xuất), rồi xoá máy: Cài đặt › Cài đặt chung › Chuyển hoặc đặt lại iPhone › Xoá tất cả nội dung và cài đặt. Máy khởi động lại vào màn hình "Xin chào". Bạn tự cài đặt đến hết bằng mạng của mình.',
      pass: 'Không hiện "iPhone bị khoá với chủ sở hữu", không hỏi Apple ID cũ. Apple đã gỡ trang tra khoá iCloud từ năm 2017, nên chỉ có cách thử tại chỗ.',
      levels: gate('Cài đặt xong, không hỏi Apple ID cũ', 'Còn khoá / không đăng xuất được', 'Máy dính iCloud không dùng được, Apple không mở khoá giúp.')
    },
    {
      id: 'ph.frp', g: 'lock', gate: true, when: c => c.brand !== 'apple',
      t: 'Tài khoản Google và tài khoản hãng (FRP)',
      how: {
        samsung: 'Người bán xoá tài khoản Google và Samsung trong Cài đặt › Tài khoản và sao lưu, rồi đặt lại máy từ Cài đặt (không dùng menu Recovery). Bạn cài đặt lại bằng tài khoản Google của mình.',
        xiaomi: 'Người bán tắt Tìm thiết bị và xoá tài khoản Xiaomi, xoá tài khoản Google, rồi đặt lại máy. Sau khi đặt lại không được hiện dòng "This phone has been linked to Xiaomi account".',
        default: 'Người bán xoá tài khoản Google (Cài đặt › Mật khẩu và tài khoản), rồi đặt lại máy từ Cài đặt. Bạn cài đặt lại bằng tài khoản Google của mình.'
      },
      pass: 'Cài đặt xong mà không bị hỏi tài khoản của người trước. Từ Android 15, khoá FRP nằm sâu trong hệ thống, gần như không phá được.',
      levels: gate('Cài đặt xong bằng tài khoản của tôi', 'Bị hỏi tài khoản cũ', 'Máy dính FRP / tài khoản Xiaomi không dùng được.')
    },
    {
      id: 'ph.mdm', g: 'lock', gate: true,
      t: 'Không bị quản lý từ xa (MDM)',
      how: {
        apple: 'Xem đầu trang Cài đặt có dòng "iPhone này được giám sát và quản lý bởi…" không. Vào Cài đặt › Cài đặt chung › VPN và quản lý thiết bị xem có hồ sơ nào. Khi cài đặt lại không được hiện màn hình "Quản lý từ xa".',
        default: 'Vào Cài đặt › Bảo mật › Ứng dụng quản trị thiết bị và mục hồ sơ công việc. Khi cài đặt lại không được hiện yêu cầu đăng ký thiết bị của công ty.'
      },
      pass: 'Không có hồ sơ quản lý, không có thông báo giám sát.',
      levels: gate('Không có', 'Có hồ sơ quản lý', 'Máy của công ty hoặc trường học, có thể bị khoá từ xa.')
    },
    {
      id: 'ph.carrier', g: 'lock', gate: true,
      t: 'Không khoá nhà mạng',
      path: { apple: 'Cài đặt › Cài đặt chung › Giới thiệu › Khoá nhà mạng' },
      how: 'Cắm SIM của bạn (hoặc cài eSIM nếu máy chỉ có eSIM), gọi một cuộc và mở một trang web bằng 4G.',
      pass: { apple: 'Dòng Khoá nhà mạng ghi "Không giới hạn SIM". Gọi và lên mạng được.', default: 'Nhận SIM, gọi và lên mạng được.' },
      levels: gate('Không giới hạn SIM, gọi được', 'Bị khoá mạng', 'Máy khoá mạng không dùng được SIM Nga hay Việt Nam.')
    },
    {
      id: 'ph.imei', g: 'lock', gate: true, tool: 'imei',
      t: 'IMEI khớp và hợp lệ',
      how: 'Bấm *#06# để xem IMEI. So với số trong Cài đặt › Giới thiệu, số khắc trên khay SIM (nếu có) và tem trên hộp. Nhập IMEI vào ô Thông tin máy để kiểm tra chữ số cuối.',
      pass: 'Các nơi trùng nhau, IMEI đủ 15 số và đúng thuật toán Luhn.',
      levels: [
        { id: 'ok', label: 'Khớp, hợp lệ', f: 1 },
        { id: 'tray', label: 'Chỉ khay SIM lệch', f: 0.5, note: 'Có thể khay bị thay. Máy đã qua tay sửa, soi kỹ các mục khác.' },
        { id: 'bad', label: 'IMEI lệch / sai', f: 0, ko: true, note: 'IMEI phần cứng khác phần mềm hoặc sai thuật toán: bo mạch bị thay hoặc IMEI bị sửa.' }
      ]
    },
    {
      id: 'ph.blacklist', g: 'lock', optional: true,
      t: 'IMEI không bị báo mất',
      how: 'Tra IMEI ở một trang kiểm tra danh sách đen (vd. imei.info). Kết quả chỉ để tham khảo: nhà mạng Nga và Việt Nam có thể không gửi dữ liệu vào danh sách chung của GSMA. Tra IMEI không cho biết máy có dính iCloud/FRP.',
      levels: gate('Sạch', 'Bị báo mất cắp', 'Máy bị báo mất cắp có thể bị chặn sóng hoặc bị thu hồi.')
    },

    // ---------- Nhận dạng và linh kiện ----------
    {
      id: 'ph.model', g: 'id', w: 3, gate: true, tool: 'partno',
      t: 'Đúng model, dung lượng, màu',
      path: { apple: 'Cài đặt › Cài đặt chung › Giới thiệu', samsung: 'Cài đặt › Thông tin điện thoại', default: 'Cài đặt › Giới thiệu điện thoại' },
      how: { apple: 'Xem Tên máy, Số máy (dạng MFYN4ZA/A) và Dung lượng. Nhập Số máy vào ô Thông tin máy để giải mã: chữ đầu cho biết máy mới bán lẻ, tân trang hay máy đổi bảo hành; hai chữ cuối cho biết thị trường.', default: 'Xem tên model và dung lượng trong Cài đặt, so với lời người bán.' },
      pass: 'Đúng như người bán mô tả.',
      levels: [
        { id: 'ok', label: 'Đúng mô tả', f: 1 },
        { id: 'minor', label: 'Lệch nhỏ (màu, phiên bản)', f: 0.6 },
        { id: 'major', label: 'Dung lượng nhỏ hơn', f: 0.2, note: 'Định giá lại theo dung lượng thật.' },
        { id: 'bad', label: 'Không phải máy này', f: 0, ko: true, note: 'Model thật khác lời người bán.' }
      ]
    },
    {
      id: 'ph.simtray', g: 'id', w: 2, when: c => c.simExpect != null,
      t: 'Khe SIM đúng phiên bản',
      how: c => c.simExpect === 'none'
        ? 'Theo số máy, bản này chỉ dùng eSIM nên cạnh trái phải phẳng, KHÔNG có khay SIM.'
        : 'Theo số máy, bản này có khay SIM ở cạnh trái, dưới nút âm lượng.',
      pass: c => c.simExpect === 'none' ? 'Không có khay SIM. Lưu ý: bạn phải dùng eSIM.' : 'Có khay SIM.',
      levels: [
        { id: 'ok', label: 'Khớp', f: 1 },
        { id: 'bad', label: 'Không khớp', f: 0, cap: 60, note: 'Thân máy không khớp số máy: có thể đã thay vỏ hoặc là máy dựng lại.' }
      ]
    },
    {
      id: 'ph.serial', g: 'id', w: 2, when: c => c.brand === 'apple', tool: 'coverage',
      t: 'Số sê-ri và bảo hành Apple',
      how: 'Lấy Số sê-ri trong Cài đặt › Cài đặt chung › Giới thiệu, tra ở checkcoverage.apple.com (trang tra bảo hành, không phải ô tìm kiếm của Apple Support).',
      pass: 'Ra đúng model. Ngày mua hợp lệ khớp với lời người bán.',
      levels: [
        { id: 'ok', label: 'Hợp lệ, khớp', f: 1 },
        { id: 'minor', label: 'Ngày mua lệch lời kể', f: 0.6 },
        { id: 'bad', label: 'Sê-ri sai / ra máy khác', f: 0, ko: true, note: 'Sê-ri không hợp lệ hoặc thuộc máy khác.' }
      ]
    },
    {
      id: 'ph.parts', g: 'id', w: 3, when: c => c.brand === 'apple' && !!c.model && !!c.model.parts,
      t: 'Lịch sử linh kiện và dịch vụ',
      path: 'Cài đặt › Cài đặt chung › Giới thiệu (mục chỉ hiện khi máy từng sửa)',
      how: c => 'Mục này theo dõi ' + ({ battery: 'pin', bd: 'pin và màn hình', full: 'pin, màn hình, bo mạch, camera trước và sau' }[c.model.parts] || 'linh kiện') + '. Không có mục này nghĩa là chưa sửa hoặc chỉ thay phần không theo dõi (như kính lưng).',
      pass: 'Không có mục, hoặc mọi linh kiện ghi "Chính hãng".',
      levels: [
        { id: 'ok', label: 'Không có / Chính hãng', f: 1 },
        { id: 'used', label: 'Có linh kiện "Đã dùng"', f: 0.75, note: 'Linh kiện thật tháo từ máy khác, không còn bảo hành.' },
        { id: 'unknown', label: 'Màn hoặc pin "Không xác định"', f: 0.3, note: 'Linh kiện không chính hãng: trừ 10–20% giá, kiểm kỹ True Tone và cảm ứng.' },
        { id: 'bad', label: 'Bo mạch "Chưa xác minh" / lỗi Face ID', f: 0, cap: 40, note: 'Bo mạch từng thay hoặc Face ID lỗi. Hầu hết người mua nên bỏ.' }
      ]
    },
    {
      id: 'ph.root', g: 'id', w: 2, when: c => c.brand !== 'apple',
      t: 'Không root, không mở khoá bootloader',
      how: {
        samsung: 'Bật máy xem có cảnh báo màu cam "bootloader is unlocked" không. Mở thử Thư mục bảo mật và Samsung Wallet: nếu báo lỗi Knox thì bit bảo hành đã bị đánh dấu (0x1), không đảo ngược được.',
        xiaomi: 'Vào Cài đặt › Cài đặt bổ sung › Tuỳ chọn nhà phát triển › Trạng thái Mi Unlock. Màn hình khởi động có chữ "unlocked" là đã mở khoá.',
        default: 'Bật máy xem có cảnh báo màu cam hoặc vàng về bootloader không, và có ứng dụng root (Magisk...) không.'
      },
      pass: 'Không có cảnh báo khi khởi động, không có ứng dụng root.',
      levels: [
        { id: 'ok', label: 'Nguyên bản', f: 1 },
        { id: 'major', label: 'Đã root / mở khoá / Knox 0x1', f: 0.3, note: 'Ứng dụng ngân hàng, Samsung Pay, Thư mục bảo mật có thể không chạy.' }
      ]
    },

    // ---------- Pin và sạc ----------
    {
      id: 'ph.battery', g: 'bat', w: 4,
      t: 'Tình trạng pin',
      path: c => c.brand === 'apple'
        ? (c.model && c.model.cycles ? 'Cài đặt › Pin › Tình trạng pin' : 'Cài đặt › Pin › Tình trạng pin và sạc')
        : c.brand === 'pixel' ? 'Cài đặt › Pin › Tình trạng pin (Pixel 8a trở lên)'
          : c.brand === 'samsung' ? 'Samsung Members › Chẩn đoán › Pin' : '',
      how: c => c.brand === 'apple'
        ? 'Ghi Dung lượng tối đa.' + (c.model && c.model.cycles ? ' Máy này còn hiện Số chu kỳ, Ngày sản xuất, Ngày dùng đầu tiên: so với tuổi máy người bán kể. Apple thiết kế pin còn 80% sau 1.000 chu kỳ.' : ' Apple thiết kế pin đời này còn 80% sau 500 chu kỳ.') + ' Nếu ghi "Không thể xác minh pin Apple chính hãng" thì chọn mức pin không chính hãng.'
        : c.brand === 'samsung' ? 'Samsung Members chỉ cho kết luận Bình thường / Yếu / Kém. Một số máy có thêm Cài đặt › Pin › Thông tin pin với phần trăm và số chu kỳ.'
          : c.brand === 'pixel' ? 'Trạng thái Bình thường / Giảm (dưới 80%). Số chu kỳ ở Cài đặt › Giới thiệu điện thoại › Thông tin pin.'
            : 'Nếu máy không hiện, ước lượng bằng ứng dụng như AccuBattery (cần dùng vài ngày) hoặc xem pin tụt nhanh khi quay video.',
      input: { key: 'battery', label: 'Dung lượng tối đa', unit: '%', min: 50, max: 100, auto: v => v >= 90 ? 'ok' : v >= 85 ? 'b85' : v >= 80 ? 'b80' : 'low' },
      input2: { key: 'cycles', label: 'Số chu kỳ', unit: '', min: 0, max: 3000, when: c => c.brand !== 'apple' || (c.model && c.model.cycles) },
      levels: [
        { id: 'ok', label: '≥ 90%', f: 1 },
        { id: 'b85', label: '85–89%', f: 0.75 },
        { id: 'b80', label: '80–84%', f: 0.45, note: 'Pin sắp phải thay, trừ một phần tiền thay pin.' },
        { id: 'low', label: '< 80% / cần bảo dưỡng', f: 0.1, note: 'Trừ đủ tiền thay pin (pin iPhone chính hãng ở Mỹ: 99–129 USD).' },
        { id: 'fake', label: 'Pin không chính hãng', f: 0.2, note: 'Số phần trăm không đáng tin, giá bán lại thấp hơn.' }
      ]
    },
    {
      id: 'ph.swell', g: 'bat', w: 1, gate: true,
      t: 'Pin không phồng',
      how: 'Nhìn nghiêng khe giữa màn hình và khung: có hở hay đội lên không. Ấn nhẹ viền màn hình và mặt lưng xem có lún, phập phồng. Màn hình có mảng trắng mờ do bị đè từ bên trong cũng là dấu hiệu.',
      pass: 'Màn hình phẳng, khe đều, không lún.',
      levels: gate('Phẳng, khe đều', 'Có dấu hiệu phồng', 'Pin phồng có thể cháy. Không mua, hoặc chỉ mua giá xác.')
    },
    {
      id: 'ph.charge', g: 'bat', w: 2, tool: 'battery',
      t: 'Sạc',
      how: c => 'Cắm sạc dây' + (c.model && c.model.magsafe ? ', thử cả sạc không dây / MagSafe' : '') + '. Lắc nhẹ dây xem có chập chờn. Soi cổng sạc bằng đèn xem có bụi, gỉ.',
      pass: 'Nhận sạc ngay, phần trăm tăng, cáp cắm chặt.',
      levels: LV.std
    },

    // ---------- Màn hình ----------
    {
      id: 'ph.glass', g: 'scr', w: 3,
      t: 'Mặt kính màn hình',
      how: 'Tắt màn hình, nghiêng dưới đèn để thấy vết xước. Soi bốn góc xem có mẻ, nứt.',
      levels: [
        { id: 'ok', label: 'Không xước', f: 1 },
        { id: 'minor', label: 'Xước nhẹ, khó thấy', f: 0.75 },
        { id: 'major', label: 'Xước rõ / mẻ góc', f: 0.4 },
        { id: 'bad', label: 'Nứt, vỡ', f: 0, cap: 60, note: 'Kính nứt: tối đa hạng Khá. Trừ tiền thay màn.' }
      ]
    },
    {
      id: 'ph.display', g: 'scr', w: 3, tool: 'screen',
      t: c => 'Hiển thị: điểm chết, ám màu' + (c.model && c.model.oled ? ', bóng mờ' : ''),
      how: c => 'Mở công cụ Thử màn hình trên chính máy này, xem lần lượt nền trắng, đen, đỏ, xanh lá, xanh dương, xám ở độ sáng tối đa.' + (c.model && c.model.oled ? ' Màn OLED: soi trên nền xám xem có bóng thanh trạng thái, bàn phím in hằn (burn-in).' : ''),
      pass: 'Màu đều, không chấm, không sọc, không bóng.',
      levels: [
        { id: 'ok', label: 'Hoàn hảo', f: 1 },
        { id: 'minor', label: 'Ám nhẹ / bóng mờ khó thấy', f: 0.7 },
        { id: 'major', label: 'Điểm chết, sọc, burn-in rõ', f: 0.2 },
        { id: 'bad', label: 'Hỏng hiển thị', f: 0, cap: 40 }
      ]
    },
    {
      id: 'ph.touch', g: 'scr', w: 2, tool: 'touch',
      t: 'Cảm ứng',
      how: 'Mở công cụ Thử cảm ứng, kéo ngón tay tô kín mọi ô. Hoặc giữ một biểu tượng rồi kéo đi khắp màn hình, qua cả bốn góc.',
      pass: 'Mọi ô đều ăn, không khựng, không tự bấm.',
      levels: [
        { id: 'ok', label: 'Mượt, đủ', f: 1 },
        { id: 'major', label: 'Có vùng chập chờn', f: 0.3 },
        { id: 'bad', label: 'Liệt / tự bấm', f: 0, cap: 40 }
      ]
    },
    {
      id: 'ph.truetone', g: 'scr', w: 2, when: c => c.brand === 'apple' && !!c.model && c.model.truetone,
      t: 'True Tone và tự chỉnh độ sáng',
      path: 'Cài đặt › Màn hình và độ sáng',
      how: 'Phải có công tắc True Tone. Bật lên, đưa máy từ chỗ đèn vàng sang chỗ đèn trắng: màu màn hình phải ấm lên hoặc lạnh đi.',
      pass: 'Có True Tone và màu đổi theo ánh sáng.',
      levels: [
        { id: 'ok', label: 'Có, hoạt động', f: 1 },
        { id: 'major', label: 'Mất True Tone', f: 0.3, note: 'Thường do màn hình đã thay không chuẩn.' }
      ]
    },

    // ---------- Camera ----------
    {
      id: 'ph.rearcam', g: 'cam', w: 3, tool: 'camera',
      t: 'Camera sau, từng ống kính',
      how: c => 'Mở Camera, bấm lần lượt ' + (c.model && c.model.zoom ? c.model.zoom.join(', ') : 'từng mức zoom') + '. Mỗi mức phải lên hình nét, không đen màn, không báo lỗi. Bật đèn flash chụp thử một tấm.',
      pass: 'Mọi ống kính lên hình, ảnh nét.',
      levels: [
        { id: 'ok', label: 'Đủ, nét', f: 1 },
        { id: 'minor', label: 'Hơi mờ một ống', f: 0.6 },
        { id: 'bad', label: 'Một ống không lên hình', f: 0, cap: 55, note: 'Trừ tiền thay cụm camera.' }
      ]
    },
    {
      id: 'ph.ois', g: 'cam', w: 2,
      t: 'Chống rung và lấy nét',
      how: 'Quay video vừa đi vừa lắc nhẹ máy, áp tai vào cụm camera nghe có tiếng lạch cạch, rè không. Đưa camera cách vật khoảng 10 cm xem lấy nét có giật không.',
      pass: 'Hình ổn định, không kêu, lấy nét nhanh.',
      levels: LV.std
    },
    {
      id: 'ph.frontcam', g: 'cam', w: 1,
      t: 'Camera trước',
      how: 'Chụp selfie và quay video selfie, xem nét và tiếng.',
      levels: LV.std
    },
    {
      id: 'ph.camglass', g: 'cam', w: 1,
      t: 'Kính camera, bụi trong ống',
      how: 'Soi mặt kính từng ống kính xem nứt, xước. Chĩa camera vào tường trắng xem có đốm mờ cố định.',
      levels: LV.std
    },

    // ---------- Chức năng ----------
    {
      id: 'ph.bio', g: 'fn', w: 5,
      t: c => c.model && c.model.touchId ? 'Touch ID' : c.brand === 'apple' ? 'Face ID' : 'Vân tay / mở khoá khuôn mặt',
      how: c => c.brand === 'apple'
        ? (c.model && c.model.touchId ? 'Cài đặt › Touch ID và mật mã: thêm vân tay mới, khoá rồi mở lại vài lần.' : 'Cài đặt › Face ID và mật mã › Đặt lại Face ID › Thiết lập Face ID. Cài xong, khoá rồi mở lại vài lần.')
        : 'Thêm vân tay mới, khoá rồi mở lại vài lần.',
      pass: 'Cài được và mở khoá nhanh.',
      levels: [
        { id: 'ok', label: 'Cài được, nhanh', f: 1 },
        { id: 'major', label: 'Chập chờn', f: 0.4 },
        { id: 'bad', label: 'Không cài được', f: 0, cap: 35, note: 'Face ID gắn với bo mạch, thường không sửa được ngoài Apple. Hầu hết nên bỏ.' }
      ]
    },
    {
      id: 'ph.speaker', g: 'fn', w: 2, tool: 'speaker',
      t: 'Loa ngoài và loa thoại',
      how: 'Mở công cụ Thử loa trên chính máy này, phát âm trái, phải ở mức to. Che lần lượt loa dưới và loa thoại phía trên để chắc cả hai đều kêu.',
      pass: 'Cả hai loa kêu, không rè.',
      levels: LV.std
    },
    {
      id: 'ph.mic', g: 'fn', w: 2, tool: 'mic',
      t: 'Micro',
      how: 'Ghi âm vài giây bằng công cụ Thử micro hoặc app Ghi âm, quay một video, rồi nghe lại.',
      pass: 'Tiếng rõ, không rè, không nhỏ bất thường.',
      levels: LV.std
    },
    {
      id: 'ph.call', g: 'fn', w: 2,
      t: 'Cuộc gọi và cảm biến tiệm cận',
      how: 'Gọi cho một người quen, nghe bằng loa thoại. Đưa máy sát tai: màn hình phải tắt, rời ra thì sáng lại.',
      levels: LV.std
    },
    {
      id: 'ph.buttons', g: 'fn', w: 2,
      t: 'Nút bấm',
      how: c => {
        const b = ['nút nguồn', 'tăng giảm âm lượng'];
        if (c.model && c.model.action) b.push('nút Tác vụ (cạnh trái, phía trên)');
        else if (c.brand === 'apple') b.push('cần gạt im lặng');
        if (c.model && c.model.camCtrl) b.push('nút Điều khiển Camera (cạnh phải, bấm để mở, chạm nhẹ rồi vuốt để zoom, bấm mạnh để chụp)');
        if (c.model && c.model.spen) b.push('bút S Pen');
        return 'Bấm thử ' + b.join(', ') + '.';
      },
      pass: 'Bấm có cảm giác tách rõ, không lún, không kẹt.',
      levels: LV.std
    },
    {
      id: 'ph.vibrate', g: 'fn', w: 1,
      t: 'Rung',
      how: c => c.brand === 'apple' ? (c.model && c.model.action ? 'Giữ nút Tác vụ để bật rồi tắt im lặng.' : 'Gạt cần im lặng.') + ' Máy phải rung êm, rõ.' : 'Bật chế độ rung, gọi thử hoặc dùng công cụ Thử rung.',
      levels: LV.std
    },
    {
      id: 'ph.conn', g: 'fn', w: 2,
      t: 'Wi-Fi, Bluetooth, GPS, NFC',
      how: 'Bắt Wi-Fi hoặc điểm truy cập từ máy bạn, kết nối tai nghe Bluetooth, mở Bản đồ xem chấm vị trí. Thử chạm thẻ thanh toán hoặc thẻ metro nếu có NFC.',
      levels: LV.std
    },
    {
      id: 'ph.sensors', g: 'fn', w: 1, tool: 'sensors',
      t: 'Xoay màn hình, la bàn',
      how: 'Xoay ngang máy trong app Ảnh; mở La bàn hoặc công cụ Cảm biến xem hướng có xoay theo máy.',
      levels: LV.std
    },
    {
      id: 'ph.water', g: 'fn', w: 2,
      t: 'Dấu hiệu vào nước',
      how: c => (c.simExpect === 'none' ? 'Máy không có khay SIM nên không xem được chỉ thị nước. ' : 'Rút khay SIM, soi đèn vào khe: chỉ thị nước bình thường màu trắng/bạc, đỏ hẳn là đã vào nước. ') + 'Soi cổng sạc, loa xem có gỉ xanh; xem camera có hơi nước bên trong.',
      levels: [
        { id: 'ok', label: 'Không có', f: 1 },
        { id: 'major', label: 'Nghi vào nước', f: 0.3, note: 'Hỏng do nước có thể phát sau. Apple không bảo hành.' },
        { id: 'bad', label: 'Rõ ràng vào nước, gỉ', f: 0, cap: 45 }
      ]
    },

    // ---------- Ngoại hình ----------
    {
      id: 'ph.frame', g: 'body', w: 2,
      t: 'Khung viền',
      how: 'Xoay máy dưới đèn, soi bốn góc và cạnh. Đặt máy lên mặt bàn phẳng xem có cập kênh (cong).',
      levels: [
        { id: 'ok', label: 'Như mới', f: 1 },
        { id: 'minor', label: 'Trầy nhẹ', f: 0.75 },
        { id: 'major', label: 'Móp góc', f: 0.4 },
        { id: 'bad', label: 'Cong / móp nặng', f: 0.05, cap: 55 }
      ]
    },
    {
      id: 'ph.back', g: 'body', w: 2,
      t: 'Mặt lưng',
      how: 'Soi kính lưng (hoặc vỏ lưng) dưới đèn.',
      levels: [
        { id: 'ok', label: 'Như mới', f: 1 },
        { id: 'minor', label: 'Xước nhẹ', f: 0.75 },
        { id: 'major', label: 'Nứt kính lưng', f: 0.15, note: 'Nứt kính lưng thường làm giảm 15–40% giá.' }
      ]
    },

    // ---------- Phụ kiện và bảo hành ----------
    { id: 'ph.box', g: 'acc', w: 1, t: 'Hộp, cáp, hoá đơn', how: 'Nếu có hộp, so IMEI và số sê-ri in trên tem hộp với máy.', levels: LV.box },
    { id: 'ph.warranty', g: 'acc', w: 1, t: 'Bảo hành còn lại', how: c => c.brand === 'apple' ? 'Xem ở checkcoverage.apple.com hoặc Cài đặt › Cài đặt chung › AppleCare và bảo hành. Bảo hành Apple gần như không dùng được ở Nga.' : 'Hỏi phiếu bảo hành của cửa hàng hoặc hãng.', levels: LV.warranty }
  ]
};
