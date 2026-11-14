// ===== Laptop =====
// Đời máy Dell nằm ở data-dell.js (DELL_MODELS, sinh từ tests/dell-data/*.json bằng tools/make_dell_data.py).
// Laptop hãng khác dùng mục "Laptop hãng khác": vẫn chấm điểm được, nhưng không có bảng cấu hình.

const LAPTOP_MODELS = (typeof DELL_MODELS !== 'undefined' ? DELL_MODELS : []).concat([
  { id: 'lp-dell-other', brand: 'dell', group: 'Khác', name: 'Laptop Dell khác' },
  { id: 'lp-other', brand: 'other', group: 'Khác', name: 'Laptop hãng khác' }
]);

const LAPTOP = {
  id: 'laptop',
  name: 'Laptop',
  icon: 'laptop',
  models: LAPTOP_MODELS,
  retention: () => 'laptop',
  searchQuery: m => (m ? (m.brand === 'dell' && m.code ? m.name.replace(/^Dell /, 'Dell ') : m.name) : 'laptop'),
  fields: ['tag', 'warranty'],
  groups: [
    { id: 'lock', name: 'Khoá và quản lý', W: 0, note: 'Không tính điểm. Lỗi ở đây là không mua.' },
    { id: 'id', name: 'Nhận dạng và cấu hình', W: 10 },
    { id: 'bat', name: 'Pin và sạc', W: 18 },
    { id: 'scr', name: 'Màn hình và bản lề', W: 20 },
    { id: 'inp', name: 'Bàn phím và touchpad', W: 14 },
    { id: 'perf', name: 'Hiệu năng, nhiệt, ổ cứng', W: 16 },
    { id: 'io', name: 'Cổng, mạng, loa, webcam', W: 10 },
    { id: 'body', name: 'Vỏ máy', W: 8 },
    { id: 'acc', name: 'Phụ kiện và bảo hành', W: 4 }
  ],
  items: [
    {
      id: 'lp.bios', g: 'lock', gate: true,
      t: 'Không bị khoá mật khẩu BIOS',
      how: 'Tắt máy, bật lên và bấm F2 liên tục: phải vào được BIOS mà không hỏi mật khẩu. Thử thêm F12 (menu khởi động). Trên Dell đời mới, mật khẩu BIOS lưu trong chip nên tháo pin CMOS không xoá được.',
      levels: gate('Vào BIOS không cần mật khẩu', 'Có mật khẩu BIOS hoặc ổ cứng', 'Máy khoá BIOS: chỉ mua khi người bán gỡ được ngay trước mặt bạn.')
    },
    {
      id: 'lp.mdm', g: 'lock', gate: true,
      t: 'Không còn bị công ty quản lý',
      how: 'Máy doanh nghiệp cũ (Latitude, Precision) hay còn dính quản lý của công ty. Vào Cài đặt › Tài khoản › Truy cập cơ quan hoặc trường học: phải trống. Đầu trang Cài đặt không có dòng "Một số cài đặt do tổ chức của bạn quản lý". Nếu người bán cài lại Windows mà màn thiết lập hiện "Chào mừng đến với <tên công ty>" thì máy còn đăng ký Autopilot.',
      levels: [
        { id: 'ok', label: 'Không có dấu hiệu', f: 1 },
        { id: 'doubt', label: 'Còn tài khoản công ty nhưng gỡ được', f: 0.6, note: 'Bắt người bán gỡ và cài lại Windows sạch trước khi trả tiền.' },
        { id: 'bad', label: 'Còn đăng ký Autopilot / Intune', f: 0, ko: true, note: 'Cài lại Windows vẫn bị bắt đăng nhập tài khoản công ty: không mua.' }
      ]
    },
    {
      id: 'lp.tag', g: 'id', w: 3, tool: 'dellname',
      t: 'Service Tag khớp, tra ra đúng đời máy',
      how: c => (c.brand === 'dell'
        ? 'Service Tag là mã 7 ký tự dán dưới đáy máy, cũng hiện trong BIOS (F2). Hai chỗ phải cùng một mã; khác nhau là đã thay bo mạch hoặc vỏ. Nhập mã vào ô Service Tag ở tab Thông tin rồi bấm tra trên trang Dell: xem cấu hình gốc lúc xuất xưởng, ngày giao hàng và bảo hành.'
        : 'So số sê-ri dưới đáy máy với số trong BIOS và trên hộp. Tra bảo hành trên trang của hãng.'),
      levels: [
        { id: 'ok', label: 'Khớp, tra ra đúng máy', f: 1 },
        { id: 'minor', label: 'Mất tem đáy, BIOS vẫn có', f: 0.7 },
        { id: 'major', label: 'Không khớp hoặc tra không ra', f: 0.2, cap: 75, note: 'Máy đã thay bo mạch, hoặc tem giả. Hỏi rõ lý do và trả giá thấp.' }
      ]
    },
    {
      id: 'lp.spec', g: 'id', w: 4, tool: 'dellname',
      t: 'Cấu hình đúng như người bán nói',
      how: c => 'Mở Trình quản lý tác vụ (Ctrl + Shift + Esc) › Hiệu năng: xem CPU, RAM, ổ cứng, card đồ hoạ. Hoặc gõ dxdiag. So với lời người bán và với các tuỳ chọn của đời máy' + (c.model && c.model.cpu ? ' (CPU: ' + c.model.cpu + (c.model.gpu ? '; card: ' + c.model.gpu : '') + ')' : '') + '.',
      levels: [
        { id: 'ok', label: 'Đúng', f: 1 },
        { id: 'minor', label: 'RAM hoặc SSD nhỏ hơn', f: 0.6 },
        { id: 'major', label: 'CPU hoặc card đồ hoạ khác', f: 0.2 }
      ]
    },
    {
      id: 'lp.windows', g: 'id', w: 1, optional: true,
      t: 'Windows có bản quyền',
      how: 'Cài đặt › Hệ thống › Kích hoạt: "Windows đã được kích hoạt bằng giấy phép kỹ thuật số". Máy Dell thường có sẵn bản quyền gắn với bo mạch.',
      levels: [
        { id: 'ok', label: 'Đã kích hoạt', f: 1 },
        { id: 'minor', label: 'Chưa kích hoạt hoặc bản crack', f: 0.5 }
      ]
    },
    {
      id: 'lp.battery', g: 'bat', w: 7, tool: 'battreport', input: { key: 'battery', label: 'Pin còn (Full charge ÷ Design)', unit: '%', min: 10, max: 110, auto: v => v >= 85 ? 'ok' : v >= 70 ? 'b70' : v >= 50 ? 'b50' : 'low' },
      t: 'Độ chai pin',
      how: 'Trên laptop: mở Command Prompt, gõ powercfg /batteryreport rồi mở tệp battery-report.html vừa tạo. So FULL CHARGE CAPACITY với DESIGN CAPACITY. Mở trang này ngay trên laptop rồi dùng công cụ Đọc battery report để app tự tính. BIOS Dell (F2) cũng có mục Battery Health.',
      levels: [
        { id: 'ok', label: 'Còn từ 85%', f: 1 },
        { id: 'b70', label: '70–84%', f: 0.75 },
        { id: 'b50', label: '50–69%', f: 0.4 },
        { id: 'low', label: 'Dưới 50% hoặc báo thay pin', f: 0.1 },
        { id: 'swollen', label: 'Pin phồng', f: 0, note: 'Pin phồng đội touchpad hoặc vỏ, dễ cháy. Phải thay ngay, đừng sạc qua đêm.' }
      ]
    },
    {
      id: 'lp.charger', g: 'bat', w: 3,
      t: 'Sạc đúng công suất, sạc vào bình thường',
      how: c => 'Dùng sạc Dell đúng công suất in trên nhãn' + (c.model && c.model.charger ? ' (đời này: ' + c.model.charger + ')' : '') + '. Cắm sạc: đèn sáng, Windows báo đang sạc. BIOS không báo "adapter không xác định" hay "sạc công suất thấp".',
      levels: LV.std
    },
    {
      id: 'lp.display', g: 'scr', w: 7, tool: 'screen',
      t: 'Màn hình: điểm chết, ám màu, hở sáng',
      how: 'Dùng công cụ Thử màn hình ngay trên laptop: xem từng màu nền trắng, đen, đỏ, xanh. Tìm điểm chết, vết ố, ám vàng, hở sáng ở viền khi nền đen. Kéo độ sáng lên cao nhất.',
      levels: [
        { id: 'ok', label: 'Hoàn hảo', f: 1 },
        { id: 'minor', label: 'Hở sáng nhẹ hoặc 1–2 điểm chết', f: 0.7 },
        { id: 'major', label: 'Ố, sọc, ám màu rõ', f: 0.3 },
        { id: 'bad', label: 'Vỡ hoặc không lên hình', f: 0 }
      ]
    },
    {
      id: 'lp.hinge', g: 'scr', w: 3,
      t: 'Bản lề chắc, mở gập êm',
      how: 'Mở gập màn hình vài lần: không kêu, không lỏng, màn đứng yên ở mọi góc. Nhìn chân bản lề: không nứt vỏ quanh ốc.',
      levels: [
        { id: 'ok', label: 'Chắc, êm', f: 1 },
        { id: 'minor', label: 'Hơi lỏng', f: 0.7 },
        { id: 'major', label: 'Kêu, lỏng rõ, nứt chân', f: 0.3 }
      ]
    },
    {
      id: 'lp.keyboard', g: 'inp', w: 5, tool: 'keyboard',
      t: 'Bàn phím đủ phím, đèn nền',
      how: 'Mở công cụ Thử bàn phím ngay trên laptop và bấm lần lượt mọi phím. Bật đèn nền bàn phím (thường Fn + F10 hoặc F5).',
      levels: [
        { id: 'ok', label: 'Đủ phím', f: 1 },
        { id: 'minor', label: 'Phím bóng, mờ chữ', f: 0.8 },
        { id: 'major', label: '1–2 phím liệt hoặc dính', f: 0.4 },
        { id: 'bad', label: 'Liệt nhiều phím', f: 0 }
      ]
    },
    {
      id: 'lp.touchpad', g: 'inp', w: 3,
      t: 'Touchpad: di chuột, bấm, cuộn hai ngón',
      how: 'Di chuột khắp màn hình, bấm trái phải, cuộn hai ngón, thu phóng. Touchpad bị đội lên hoặc khó bấm có thể do pin phồng bên dưới.',
      levels: LV.std
    },
    {
      id: 'lp.stress', g: 'perf', w: 5,
      t: 'Chạy nặng không sập, quạt không gào',
      how: 'Chạy Cinebench hoặc một game khoảng 10 phút, mở HWiNFO xem nhiệt độ CPU. Máy không tắt đột ngột, không giật khựng, quạt không kêu lạch cạch. Quạt gào và nóng quá 95 °C thường do bụi, keo tản nhiệt khô.',
      levels: [
        { id: 'ok', label: 'Ổn định', f: 1 },
        { id: 'minor', label: 'Nóng, quạt to nhưng không sập', f: 0.7, fault: false },
        { id: 'major', label: 'Giật, tụt xung nặng', f: 0.3 },
        { id: 'bad', label: 'Sập nguồn, màn xanh', f: 0 }
      ]
    },
    {
      id: 'lp.ssd', g: 'perf', w: 3,
      t: 'Ổ SSD còn khoẻ',
      how: 'Chạy CrystalDiskInfo: Health Status nên là "Good" và từ 90%. Xem thêm số giờ đã chạy (Power On Hours) và tổng dữ liệu đã ghi.',
      levels: [
        { id: 'ok', label: 'Good, từ 90%', f: 1 },
        { id: 'minor', label: 'Good, 70–89%', f: 0.7, fault: false },
        { id: 'major', label: 'Caution hoặc dưới 70%', f: 0.3 },
        { id: 'bad', label: 'Bad, lỗi đọc ghi', f: 0 }
      ]
    },
    {
      id: 'lp.gpu', g: 'perf', w: 3, when: c => !c.model || c.model.dgpu || c.model.brand !== 'dell',
      t: 'Card đồ hoạ rời chạy đúng',
      how: 'Trình quản lý thiết bị › Bộ điều hợp hiển thị: không có dấu chấm than. Chạy 3D (FurMark, game) khoảng 5 phút: không nhoè, không sọc, không sập.',
      levels: LV.std
    },
    {
      id: 'lp.ports', g: 'io', w: 4,
      t: 'Cổng USB, HDMI, Thunderbolt, jack tai nghe',
      how: 'Cắm USB vào từng cổng, thử HDMI với màn ngoài hoặc tivi, thử sạc qua cổng USB-C (nếu máy hỗ trợ), cắm tai nghe vào jack 3,5 mm.',
      levels: LV.std
    },
    {
      id: 'lp.wifi', g: 'io', w: 2,
      t: 'Wi-Fi, Bluetooth',
      how: 'Kết nối Wi-Fi, mở vài trang web, ghép thử tai nghe hoặc điện thoại qua Bluetooth.',
      levels: LV.std
    },
    {
      id: 'lp.av', g: 'io', w: 3, tool: 'speaker',
      t: 'Loa, micro, webcam',
      how: 'Mở trang này trên laptop: Thử loa (trái, phải, quét tần số), Thử micro (ghi rồi nghe lại), Xem từng camera (webcam).',
      levels: LV.std
    },
    {
      id: 'lp.body', g: 'body', w: 5,
      t: 'Vỏ, góc máy, mặt lưng màn hình',
      how: 'Nhìn bốn góc, mặt lưng màn, mặt đáy: móp, nứt, xước. Bàn phím và kê tay bóng loáng cho biết máy dùng nhiều.',
      levels: LV.cosmetic
    },
    {
      id: 'lp.opened', g: 'body', w: 3,
      t: 'Không có dấu hiệu sửa chữa, vào nước',
      how: 'Ốc đáy toét, thiếu ốc, tem dán bị rách là máy đã tháo. Soi khe bàn phím, cổng: vệt ố, gỉ là dấu hiệu vào nước. Hỏi người bán đã thay gì.',
      levels: [
        { id: 'ok', label: 'Không có', f: 1 },
        { id: 'minor', label: 'Đã tháo vệ sinh, nâng cấp', f: 0.85, fault: false },
        { id: 'major', label: 'Dấu hiệu sửa bo hoặc vào nước', f: 0.3 }
      ]
    },
    { id: 'lp.box', g: 'acc', w: 2, t: 'Sạc zin, hộp, giấy tờ', how: 'Sạc Dell chính hãng, hộp máy, hoá đơn. Máy doanh nghiệp thanh lý thường chỉ có máy và sạc.', levels: LV.box },
    { id: 'lp.warranty', g: 'acc', w: 2, t: 'Bảo hành', how: 'Bảo hành Dell (tra theo Service Tag) hoặc bảo hành của cửa hàng. Hỏi rõ bảo hành gồm những gì: màn, pin, bo mạch.', levels: LV.warranty }
  ]
};
