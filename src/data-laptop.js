// ===== Laptop =====
// Đời máy Dell ở data-dell.js (DELL_MODELS, sinh bằng tools/make_dell_data.py); Lenovo, HP, MacBook, ASUS, Acer, MSI
// ở data-laptops.js (LAPTOP_MORE, sinh bằng tools/make_laptop_data.py). Máy chưa có trong bảng chọn mục "… khác" của hãng.

const LP_OTHER = [
  ['dell', 'Laptop Dell khác'], ['lenovo', 'Laptop Lenovo khác'], ['hp', 'Laptop HP khác'], ['apple', 'MacBook khác'],
  ['asus', 'Laptop ASUS khác'], ['acer', 'Laptop Acer khác'], ['msi', 'Laptop MSI khác'], ['other', 'Laptop hãng khác']
].map(x => ({ id: x[0] === 'other' ? 'lp-other' : 'lp-' + x[0] + '-other', brand: x[0], group: 'Khác', name: x[1] }));
const LAPTOP_MODELS = (typeof DELL_MODELS !== 'undefined' ? DELL_MODELS : []).concat(typeof LAPTOP_MORE !== 'undefined' ? LAPTOP_MORE : [], LP_OTHER);

// Văn bản theo hãng: phím vào BIOS, chỗ in số sê-ri, trang tra bảo hành.
const LP_BIOS_KEY = {
  dell: 'F2 (menu khởi động F12)', lenovo: 'F1 trên ThinkPad, F2 hoặc nút Novo (lỗ nhỏ cạnh máy) trên IdeaPad, Legion, Yoga',
  hp: 'Esc rồi F10', asus: 'F2 (hoặc Del)', acer: 'F2', msi: 'Del', other: 'F2, Del hoặc F10 tuỳ hãng'
};
const LP_BIOS_NOTE = {
  dell: ' Trên Dell đời mới, mật khẩu BIOS lưu trong chip nên tháo pin CMOS không xoá được.',
  lenovo: ' ThinkPad có "Supervisor Password" lưu trong chip bảo mật: quên là phải thay chip hoặc bo mạch.',
  hp: ' HP doanh nghiệp (EliteBook, ZBook) có mật khẩu quản trị BIOS lưu trong chip, tháo pin CMOS không xoá được.'
};
const LP_SERIAL = {
  dell: 'Service Tag (7 ký tự)', lenovo: 'S/N (8 ký tự) và MT/MTM (vd. 20W0S0XX00)', hp: 'S/N (10 ký tự) và P/N (Product number, vd. 4K7G3PA)',
  apple: 'số sê-ri (Serial)', asus: 'S/N (12 ký tự)', acer: 'S/N (22 ký tự) hoặc SNID (11–12 số)', msi: 'S/N', other: 'số sê-ri'
};
const LP_WARRANTY = {
  dell: ['Dell (tra theo Service Tag)', 'https://www.dell.com/support/home/vi-vn'],
  lenovo: ['Lenovo', 'https://pcsupport.lenovo.com/us/en/warrantylookup'],
  hp: ['HP', 'https://support.hp.com/us-en/check-warranty'],
  apple: ['Apple', 'https://checkcoverage.apple.com/'],
  asus: ['ASUS', 'https://www.asus.com/support/warranty-status-inquiry/'],
  acer: ['Acer', 'https://www.acer.com/us-en/support'],
  msi: ['MSI', 'https://www.msi.com/support/technical_details/product-warranty-related']
};
const lpMac = c => c.brand === 'apple';
const lpBrandName = b => ({ dell: 'Dell', lenovo: 'Lenovo', hp: 'HP', apple: 'Apple', asus: 'ASUS', acer: 'Acer', msi: 'MSI' })[b] || '';
// Bàn phím cánh bướm: MacBook Pro 13/15 2016–2019 và MacBook Air 2018–2019 (MacBook Pro 16 2019 đã dùng phím cắt kéo).
const lpButterfly = m => !!(m && m.brand === 'apple' && m.year >= 2016 && m.year <= 2019 && !/Pro 16/.test(m.name) && /Pro 1[35]|Air 13/.test(m.name));
// Flexgate: cáp màn MacBook Pro 13/15 đời 2016–2018 mòn dần khi mở gập.
const lpFlexgate = m => !!(m && m.brand === 'apple' && m.year >= 2016 && m.year <= 2018 && /Pro 1[35]/.test(m.name));

const LAPTOP = {
  id: 'laptop',
  name: 'Laptop',
  icon: 'laptop',
  models: LAPTOP_MODELS,
  retention: m => (m && m.brand === 'apple' ? 'mac' : 'laptop'),
  searchQuery: m => (m ? (m.code ? m.name.replace(/\s*\((?:\d{4}[^)]*)\)$/, '') : (lpBrandName(m.brand) ? (m.brand === 'apple' ? 'MacBook' : 'laptop ' + lpBrandName(m.brand)) : 'laptop')) : 'laptop'),
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
      id: 'lp.bios', g: 'lock', gate: true, when: c => !lpMac(c),
      t: 'Không bị khoá mật khẩu BIOS',
      how: c => 'Tắt máy, bật lên và bấm liên tục ' + (LP_BIOS_KEY[c.brand] || LP_BIOS_KEY.other) + ': phải vào được BIOS mà không hỏi mật khẩu. Thử thêm menu khởi động.' + (LP_BIOS_NOTE[c.brand] || ''),
      levels: gate('Vào BIOS không cần mật khẩu', 'Có mật khẩu BIOS hoặc ổ cứng', 'Máy khoá BIOS: chỉ mua khi người bán gỡ được ngay trước mặt bạn.')
    },
    {
      id: 'lp.maclock', g: 'lock', gate: true, when: lpMac,
      t: 'Đã thoát Apple ID, tắt Khoá kích hoạt',
      how: 'Menu Táo › Cài đặt hệ thống: dòng tên tài khoản trên cùng phải trống (đã đăng xuất Apple ID). Menu Táo › Giới thiệu về máy Mac › Thông tin khác › Báo cáo hệ thống › Phần cứng: dòng "Trạng thái Khoá kích hoạt" (Activation Lock Status) phải là Đã tắt. Máy Intel: bật máy giữ phím Option, nếu hiện ổ khoá đòi mật khẩu là còn mật khẩu firmware. Chắc nhất: nhờ người bán "Xoá tất cả nội dung và cài đặt" trước mặt bạn, rồi thiết lập lại như máy mới.',
      levels: gate('Đã thoát, Khoá kích hoạt tắt', 'Còn Apple ID, Khoá kích hoạt hoặc mật khẩu firmware', 'Mac còn khoá kích hoạt chỉ là cục gạch với người mua: không trả tiền khi chưa gỡ xong trước mặt bạn.')
    },
    {
      id: 'lp.mdm', g: 'lock', gate: true,
      t: 'Không còn bị công ty quản lý',
      how: c => lpMac(c)
        ? 'MacBook công ty thanh lý hay còn đăng ký Apple Business Manager. Mở Terminal, gõ profiles status -type enrollment: cả hai dòng phải là "No" (Enrolled via DEP: No, MDM enrollment: No). Cài đặt hệ thống › Quyền riêng tư và bảo mật › Hồ sơ (hoặc Cài đặt chung › Quản lý thiết bị) phải trống. Máy còn trong Apple Business Manager thì xoá sạch, cài lại macOS vẫn hiện màn "Quản lý từ xa" của công ty.'
        : 'Máy doanh nghiệp cũ (' + ({ lenovo: 'ThinkPad, ThinkBook', hp: 'EliteBook, ProBook, ZBook', asus: 'ExpertBook', acer: 'TravelMate' }[c.brand] || 'Latitude, Precision, ThinkPad, EliteBook') + ') hay còn dính quản lý của công ty. Vào Cài đặt › Tài khoản › Truy cập cơ quan hoặc trường học: phải trống. Đầu trang Cài đặt không có dòng "Một số cài đặt do tổ chức của bạn quản lý". Nếu người bán cài lại Windows mà màn thiết lập hiện "Chào mừng đến với <tên công ty>" thì máy còn đăng ký Autopilot.',
      levels: [
        { id: 'ok', label: 'Không có dấu hiệu', f: 1 },
        { id: 'doubt', label: 'Còn tài khoản công ty nhưng gỡ được', f: 0.6, note: 'Bắt người bán gỡ và cài lại hệ điều hành sạch trước khi trả tiền.' },
        { id: 'bad', label: 'Còn đăng ký Autopilot, Intune hoặc Apple Business Manager', f: 0, ko: true, note: 'Cài lại vẫn bị bắt đăng nhập tài khoản công ty: không mua.' }
      ]
    },
    {
      id: 'lp.tag', g: 'id', w: 3, tool: 'dellname',
      t: 'Số sê-ri (Service Tag) khớp, tra ra đúng đời máy',
      how: c => (c.brand === 'dell'
        ? 'Service Tag là mã 7 ký tự dán dưới đáy máy, cũng hiện trong BIOS (F2). Hai chỗ phải cùng một mã; khác nhau là đã thay bo mạch hoặc vỏ. Nhập mã vào ô Service Tag ở tab Thông tin rồi bấm tra trên trang Dell: xem cấu hình gốc lúc xuất xưởng, ngày giao hàng và bảo hành.'
        : lpMac(c)
          ? 'Số sê-ri khắc dưới đáy máy (dòng chữ nhỏ cạnh số model A…). So với số trong menu Táo › Giới thiệu về máy Mac. Tra trên checkcoverage.apple.com: phải ra đúng đời máy, màu, năm. Khác nhau là đã thay vỏ đáy hoặc bo mạch.'
          : 'Đọc ' + (LP_SERIAL[c.brand] || LP_SERIAL.other) + ' trên tem dưới đáy máy, so với số trong BIOS (' + (LP_BIOS_KEY[c.brand] || LP_BIOS_KEY.other) + '). Trong Windows: mở PowerShell, gõ Get-CimInstance Win32_BIOS để xem SerialNumber. Nhập số vào ô ở tab Thông tin rồi tra trên trang ' + (lpBrandName(c.brand) || 'hãng') + ': ra đúng đời máy, ngày xuất xưởng và bảo hành.' + (c.brand === 'lenovo' ? ' 4 ký tự đầu của MTM (vd. 20W0) là mã loại máy: gõ vào ô Tra tên máy để ra đúng đời.' : '')),
      levels: [
        { id: 'ok', label: 'Khớp, tra ra đúng máy', f: 1 },
        { id: 'minor', label: 'Mất tem đáy, trong máy vẫn đọc được số', f: 0.7 },
        { id: 'major', label: 'Không khớp hoặc tra không ra', f: 0.2, cap: 75, note: 'Máy đã thay bo mạch, hoặc tem giả. Hỏi rõ lý do và trả giá thấp.' }
      ]
    },
    {
      id: 'lp.spec', g: 'id', w: 4, tool: 'dellname',
      t: 'Cấu hình đúng như người bán nói',
      how: c => (lpMac(c)
        ? 'Menu Táo › Giới thiệu về máy Mac: xem chip, RAM, năm. Bấm Thông tin khác › Báo cáo hệ thống › Bộ nhớ: dung lượng ổ. MacBook Apple Silicon hàn chết RAM và ổ, không nâng cấp được: trả giá theo đúng cấu hình đang có'
        : 'Mở Trình quản lý tác vụ (Ctrl + Shift + Esc) › Hiệu năng: xem CPU, RAM, ổ cứng, card đồ hoạ. Hoặc gõ dxdiag') + '. So với lời người bán và với các tuỳ chọn của đời máy' + (c.model && c.model.cpu ? ' (CPU: ' + c.model.cpu + (c.model.gpu ? '; card: ' + c.model.gpu : '') + ')' : '') + '.',
      levels: [
        { id: 'ok', label: 'Đúng', f: 1 },
        { id: 'minor', label: 'RAM hoặc SSD nhỏ hơn', f: 0.6 },
        { id: 'major', label: 'CPU hoặc card đồ hoạ khác', f: 0.2 }
      ]
    },
    {
      id: 'lp.windows', g: 'id', w: 1, optional: true, when: c => !lpMac(c),
      t: 'Windows có bản quyền',
      how: 'Cài đặt › Hệ thống › Kích hoạt: "Windows đã được kích hoạt bằng giấy phép kỹ thuật số". Máy bán kèm Windows thường có sẵn bản quyền gắn với bo mạch.',
      levels: [
        { id: 'ok', label: 'Đã kích hoạt', f: 1 },
        { id: 'minor', label: 'Chưa kích hoạt hoặc bản crack', f: 0.5 }
      ]
    },
    {
      id: 'lp.battery', g: 'bat', w: 7, tool: 'battreport', input: { key: 'battery', label: 'Pin còn (Full charge ÷ Design)', unit: '%', min: 10, max: 110, auto: v => v >= 85 ? 'ok' : v >= 70 ? 'b70' : v >= 50 ? 'b50' : 'low' },
      t: 'Độ chai pin',
      how: c => lpMac(c)
        ? 'Cài đặt hệ thống › Pin › bấm (i) cạnh Tình trạng pin: xem "Dung lượng tối đa" (%). Menu Táo › Giới thiệu về máy Mac › Thông tin khác › Báo cáo hệ thống › Nguồn: xem "Số lần sạc" (Cycle Count). MacBook từ 2010 được Apple tính 1000 lần sạc; gần 1000 lần là sắp phải thay pin.'
        : 'Trên laptop: mở Command Prompt, gõ powercfg /batteryreport rồi mở tệp battery-report.html vừa tạo. So FULL CHARGE CAPACITY với DESIGN CAPACITY. Mở trang này ngay trên laptop rồi dùng công cụ Đọc battery report để app tự tính.' + ({ dell: ' BIOS Dell (F2) cũng có mục Battery Health.', lenovo: ' App Lenovo Vantage cũng hiện tình trạng pin.', hp: ' HP Support Assistant (hoặc F2 lúc khởi động) có mục kiểm tra pin.', asus: ' App MyASUS có mục chẩn đoán pin.' }[c.brand] || ''),
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
      how: c => 'Dùng sạc ' + (lpBrandName(c.brand) || 'của hãng') + ' đúng công suất in trên nhãn' + (c.model && c.model.charger ? ' (đời này: ' + c.model.charger + ')' : '') + '. ' + (lpMac(c)
        ? 'Cắm sạc: biểu tượng pin hiện tia sét, đèn MagSafe (nếu có) đổi màu. Báo cáo hệ thống › Nguồn ghi công suất bộ sạc đang cắm.'
        : 'Cắm sạc: đèn sáng, Windows báo đang sạc. BIOS không báo "adapter không xác định" hay "sạc công suất thấp".'),
      levels: LV.std
    },
    {
      id: 'lp.display', g: 'scr', w: 7, tool: 'screen',
      t: 'Màn hình: điểm chết, ám màu, hở sáng',
      how: c => 'Dùng công cụ Thử màn hình ngay trên laptop: xem từng màu nền trắng, đen, đỏ, xanh. Tìm điểm chết, vết ố, ám vàng, hở sáng ở viền khi nền đen. Kéo độ sáng lên cao nhất.' +
        (lpFlexgate(c.model) ? ' Đời này dính lỗi cáp màn (flexgate): mở màn từ từ quá khoảng 40°, nếu đáy màn loé vệt sáng như đèn sân khấu hoặc màn tắt là cáp đã mòn.' : '') +
        (lpMac(c) ? ' MacBook Retina 2015–2017 hay bong lớp chống loá (staingate): soi màn tắt dưới đèn, thấy mảng loang như vết ố là đã bong.' : ''),
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
      how: c => 'Mở công cụ Thử bàn phím ngay trên laptop và bấm lần lượt mọi phím. Bật đèn nền bàn phím (' + ({ dell: 'Fn + F10 hoặc F5', lenovo: 'Fn + Space', hp: 'F5 hoặc F4', apple: 'Trung tâm điều khiển › Độ sáng bàn phím', asus: 'Fn + F7 / F8', acer: 'Fn + F9', msi: 'Fn + phím có hình bàn phím' }[c.brand] || 'thường Fn + F10 hoặc F5') + ').' +
        (lpButterfly(c.model) ? ' Đời này dùng bàn phím cánh bướm hay kẹt bụi, lặp chữ: gõ thử một đoạn dài, xem có phím nào ăn hai lần hoặc không ăn. Thay bàn phím trên đời này phải thay cả mặt C, đắt.' : ''),
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
      how: c => lpMac(c)
        ? 'Chạy Cinebench (có bản cho Mac) hoặc xuất một video dài khoảng 10 phút, mở Giám sát hoạt động xem CPU. Máy không tắt, không giật. MacBook Air không có quạt nên nóng và tụt xung khi chạy lâu là bình thường; MacBook Pro quạt không được kêu lạch cạch.'
        : 'Chạy Cinebench hoặc một game khoảng 10 phút, mở HWiNFO xem nhiệt độ CPU. Máy không tắt đột ngột, không giật khựng, quạt không kêu lạch cạch. Quạt gào và nóng quá 95 °C thường do bụi, keo tản nhiệt khô.',
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
      how: c => lpMac(c)
        ? 'Mở Tiện ích ổ đĩa › Sơ cứu: không báo lỗi. Muốn xem độ hao mòn thì cài DriveDx hoặc smartmontools (smartctl -a disk0): "Percentage Used" càng thấp càng tốt. Ổ trên MacBook từ 2016 hàn chết vào bo mạch: ổ hỏng là phải sửa bo.'
        : 'Chạy CrystalDiskInfo: Health Status nên là "Good" và từ 90%. Xem thêm số giờ đã chạy (Power On Hours) và tổng dữ liệu đã ghi.',
      levels: [
        { id: 'ok', label: 'Good, từ 90%', f: 1 },
        { id: 'minor', label: 'Good, 70–89%', f: 0.7, fault: false },
        { id: 'major', label: 'Caution hoặc dưới 70%', f: 0.3 },
        { id: 'bad', label: 'Bad, lỗi đọc ghi', f: 0 }
      ]
    },
    {
      id: 'lp.gpu', g: 'perf', w: 3, when: c => !lpMac(c) && (!c.model || !c.model.code || !!c.model.dgpu),
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
    { id: 'lp.box', g: 'acc', w: 2, t: 'Sạc zin, hộp, giấy tờ', how: c => 'Sạc ' + (lpBrandName(c.brand) || '') + ' chính hãng, hộp máy, hoá đơn. Máy doanh nghiệp thanh lý thường chỉ có máy và sạc.', levels: LV.box },
    { id: 'lp.warranty', g: 'acc', w: 2, t: 'Bảo hành', how: c => 'Bảo hành ' + (LP_WARRANTY[c.brand] ? LP_WARRANTY[c.brand][0] : 'của hãng') + (lpMac(c) ? ' hoặc AppleCare (tra trên checkcoverage.apple.com)' : '') + ', hoặc bảo hành của cửa hàng. Hỏi rõ bảo hành gồm những gì: màn, pin, bo mạch.', levels: LV.warranty }
  ]
};
