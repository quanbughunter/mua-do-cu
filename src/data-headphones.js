// ===== Tai nghe không dây =====
// nums = số model của tai (trái/phải/biến thể) theo trang "Identify your AirPods" của Apple; case = số model hộp sạc.
// hours = thời lượng nghe công bố cho một lần sạc (bật chống ồn nếu có). fw = firmware mới nhất Apple công bố (17/9/2026).

const HEADPHONE_MODELS = [
  { id: 'ap-2', brand: 'apple', name: 'AirPods 2', year: 2019, usd: 159, form: 'tws', nums: ['A2031', 'A2032'], cases: ['A1602', 'A1938'], fw: '6F21', hours: 5, ctrl: 'chạm hai lần' },
  { id: 'ap-3', brand: 'apple', name: 'AirPods 3', year: 2021, usd: 179, form: 'tws', nums: ['A2564', 'A2565'], cases: ['A2897', 'A2566'], fw: '6F21', hours: 6, ctrl: 'bóp cảm biến lực', caseSpeaker: 'MagSafe' },
  { id: 'ap-4', brand: 'apple', name: 'AirPods 4', year: 2024, usd: 129, form: 'tws', nums: ['A3053', 'A3050', 'A3054'], cases: ['A3058'], fw: '9A348', hours: 5, ctrl: 'bóp cảm biến lực' },
  { id: 'ap-4anc', brand: 'apple', name: 'AirPods 4 chống ồn', year: 2024, usd: 179, form: 'tws', anc: true, nums: ['A3056', 'A3055', 'A3057'], cases: ['A3059'], fw: '9A348', hours: 4, ctrl: 'bóp cảm biến lực', caseSpeaker: true },
  { id: 'ap-p1', brand: 'apple', name: 'AirPods Pro 1', year: 2019, usd: 249, form: 'tws', anc: true, nums: ['A2083', 'A2084'], cases: ['A2190'], fw: '6F21', hours: 4.5, ctrl: 'bóp cảm biến lực', crackle: true },
  { id: 'ap-p2l', brand: 'apple', name: 'AirPods Pro 2 (Lightning)', year: 2022, usd: 249, form: 'tws', anc: true, nums: ['A2698', 'A2699', 'A2931'], cases: ['A2700'], fw: '9A348', hours: 6, ctrl: 'bóp cảm biến lực, vuốt chỉnh âm lượng', swipe: true, hearing: true, caseSpeaker: true },
  { id: 'ap-p2c', brand: 'apple', name: 'AirPods Pro 2 (USB-C)', year: 2023, usd: 249, form: 'tws', anc: true, nums: ['A3047', 'A3048', 'A3049'], cases: ['A2968'], fw: '9A348', hours: 6, ctrl: 'bóp cảm biến lực, vuốt chỉnh âm lượng', swipe: true, hearing: true, caseSpeaker: true },
  { id: 'ap-p3', brand: 'apple', name: 'AirPods Pro 3', year: 2025, usd: 249, form: 'tws', anc: true, nums: ['A3063', 'A3064', 'A3065'], cases: ['A3122'], fw: '9A348', hours: 8, ctrl: 'bóp cảm biến lực, vuốt chỉnh âm lượng', swipe: true, hearing: true, caseSpeaker: true },
  { id: 'ap-5', brand: 'apple', name: 'AirPods 5', year: 2026, form: 'tws', nums: ['A3531', 'A3532', 'A3533'], cases: ['A3530'], ctrl: 'bóp cảm biến lực' },
  { id: 'ap-5w', brand: 'apple', name: 'AirPods 5 (hộp sạc không dây)', year: 2026, form: 'tws', nums: ['A3439', 'A3440', 'A3441'], cases: ['A3529'], ctrl: 'bóp cảm biến lực', caseSpeaker: true },
  { id: 'ap-max', brand: 'apple', name: 'AirPods Max (Lightning)', year: 2020, usd: 549, form: 'over', anc: true, nums: ['A2096'], fw: '6F25', hours: 20, ctrl: 'núm Digital Crown, nút chống ồn', max: true },
  { id: 'ap-maxc', brand: 'apple', name: 'AirPods Max (USB-C)', year: 2024, usd: 549, form: 'over', anc: true, nums: ['A3184'], fw: '7E108', hours: 20, ctrl: 'núm Digital Crown, nút chống ồn', max: true },
  { id: 'ap-max2', brand: 'apple', name: 'AirPods Max 2', year: 2026, form: 'over', anc: true, nums: ['A3454'], hours: 20, ctrl: 'núm Digital Crown, nút chống ồn', max: true },
  { id: 'sn-wf4', brand: 'sony', name: 'Sony WF-1000XM4', year: 2021, usd: 280, form: 'tws', anc: true, hours: 8, app: 'Sony Sound Connect', ctrl: 'chạm', swellRisk: true },
  { id: 'sn-wf5', brand: 'sony', name: 'Sony WF-1000XM5', year: 2023, usd: 300, form: 'tws', anc: true, hours: 8, app: 'Sony Sound Connect', ctrl: 'chạm', foamTips: true },
  { id: 'sn-wh4', brand: 'sony', name: 'Sony WH-1000XM4', year: 2020, usd: 350, form: 'over', anc: true, hours: 30, app: 'Sony Sound Connect', ctrl: 'vuốt chạm trên chụp phải', hingeRisk: true },
  { id: 'sn-wh5', brand: 'sony', name: 'Sony WH-1000XM5', year: 2022, usd: 400, form: 'over', anc: true, hours: 30, app: 'Sony Sound Connect', ctrl: 'vuốt chạm trên chụp phải', hingeRisk: true },
  { id: 'sn-wh6', brand: 'sony', name: 'Sony WH-1000XM6', year: 2025, usd: 450, form: 'over', anc: true, hours: 30, app: 'Sony Sound Connect', ctrl: 'vuốt chạm trên chụp phải' },
  { id: 'sg-b2p', brand: 'samsung', name: 'Galaxy Buds2 Pro', year: 2022, usd: 230, form: 'tws', anc: true, hours: 5, app: 'Galaxy Wearable', ctrl: 'chạm' },
  { id: 'sg-b3p', brand: 'samsung', name: 'Galaxy Buds3 Pro', year: 2024, usd: 250, form: 'tws', anc: true, hours: 6, app: 'Galaxy Wearable', ctrl: 'bóp, vuốt cuống tai', tipRisk: true },
  { id: 'bo-qcu', brand: 'bose', name: 'Bose QuietComfort Ultra Headphones', year: 2023, usd: 429, form: 'over', anc: true, hours: 24, app: 'Bose', ctrl: 'nút và dải chạm' },
  { id: 'bo-qc45', brand: 'bose', name: 'Bose QuietComfort 45', year: 2021, usd: 329, form: 'over', anc: true, app: 'Bose', ctrl: 'nút bấm', hingeRisk: true },
  { id: 'tws-other', brand: 'other', name: 'Tai nghe nhét tai khác', form: 'tws' },
  { id: 'over-other', brand: 'other', name: 'Tai nghe chụp tai khác', form: 'over' }
];

const HEADPHONES = {
  id: 'headphones',
  name: 'Tai nghe',
  icon: 'headphones',
  models: HEADPHONE_MODELS,
  retention: () => 'headphones',
  searchQuery: m => (m ? m.name : 'tai nghe'),
  fields: ['serial', 'warranty'],
  groups: [
    { id: 'lock', name: 'Chính hãng và tài khoản', W: 0, note: 'Không tính điểm. Lỗi ở đây là không mua.' },
    { id: 'id', name: 'Nhận dạng', W: 8 },
    { id: 'bat', name: 'Pin và sạc', W: 25 },
    { id: 'snd', name: 'Âm thanh và chống ồn', W: 27 },
    { id: 'mic', name: 'Micro và điều khiển', W: 15 },
    { id: 'body', name: 'Ngoại hình và vệ sinh', W: 20 },
    { id: 'acc', name: 'Phụ kiện và bảo hành', W: 5 }
  ],
  items: [
    {
      id: 'hp.fake', g: 'lock', gate: true,
      t: 'Hàng thật',
      how: c => {
        const a = [];
        if (c.brand === 'apple') a.push('Số sê-ri trong Cài đặt › Bluetooth › (i) phải trùng số trong nắp hộp sạc và trên hộp giấy, và tra ra đúng model ở checkcoverage.apple.com. Hàng giả đời mới vẫn hiện hiệu ứng kết nối như thật, nên đừng tin hiệu ứng.');
        if (c.model && c.model.app) a.push('Kết nối được với ứng dụng ' + c.model.app + ' và hiện đúng tên model. Hàng giả thường không kết nối được.');
        if (c.brand === 'samsung') a.push('Đóng nắp hộp: đèn ngoài sáng khoảng 5 giây. Chữ in trên hộp phải khắc laser, sắc nét.');
        if (c.brand === 'bose') a.push('Bose không có mẫu nào tên "TWS". Số sê-ri bị làm giả nhiều nên không đủ để chứng minh.');
        if (c.model && c.model.anc) a.push('Chống ồn phải giảm tiếng ồn rõ rệt. Hàng giả thường có nút chống ồn nhưng gần như không tác dụng.');
        a.push('Bản lề chắc, nam châm hút mạnh, chữ in mờ tinh tế, cổng sạc khít.');
        return a.join(' ');
      },
      levels: [
        { id: 'ok', label: 'Không có dấu hiệu giả', f: 1 },
        { id: 'doubt', label: 'Có điểm nghi vấn', f: 0.3, cap: 50, note: 'Chỉ mua nếu giá chấp nhận được như hàng không chính hãng.' },
        { id: 'bad', label: 'Hàng giả', f: 0, ko: true, note: 'Hàng giả: không mua.' }
      ]
    },
    {
      id: 'hp.findmy', g: 'lock', gate: true, when: c => c.brand === 'apple',
      t: 'Đã gỡ khỏi Find My của người bán',
      how: 'Người bán mở app Tìm › Thiết bị › chọn tai nghe › Gỡ bỏ thiết bị này, ngay trước mặt bạn. Sau đó bạn đặt lại tai nghe (giữ nút sau hộp khoảng 15 giây đến khi đèn nháy cam rồi trắng), ghép với iPhone của bạn và mở app Tìm.',
      pass: 'Tai nghe hiện trong mục Thiết bị của bạn, không có dòng "đã ghép với một Tài khoản Apple khác". Apple không gỡ khoá này giúp.',
      levels: gate('Đã vào app Tìm của tôi', 'Còn gắn tài khoản người bán', 'Tai nghe còn khoá Find My: không đưa được vào tài khoản của bạn.')
    },
    {
      id: 'hp.numbers', g: 'id', w: 2, when: c => c.brand === 'apple', tool: 'airpods',
      t: 'Số model tai và hộp cùng một đời',
      how: c => 'Số model in rất nhỏ dưới cuống mỗi tai và trong nắp hộp' + (c.model && c.model.nums ? ' (đời này: ' + c.model.nums.join(', ') + (c.model.cases ? '; hộp ' + c.model.cases.join(', ') : '') + ')' : '') + '. Dùng công cụ Kiểm số AirPods.',
      levels: [
        { id: 'ok', label: 'Cùng đời', f: 1 },
        { id: 'mixed', label: 'Lẫn đời (tai hoặc hộp thay)', f: 0.3, note: 'Có bộ phận đã thay: hỏi rõ và hạ giá.' },
        { id: 'bad', label: 'Không phải số Apple', f: 0, ko: true }
      ]
    },
    {
      id: 'hp.serial', g: 'id', w: 2,
      t: 'Số sê-ri khớp với hộp giấy',
      how: c => c.brand === 'apple' ? 'Số trong Cài đặt trùng số trong nắp hộp sạc và tem hộp giấy.' : c.brand === 'bose' ? 'Số dưới đệm tai trái trùng tem hộp.' : 'Số sê-ri trên tai nghe trùng tem hộp.',
      levels: [
        { id: 'ok', label: 'Khớp', f: 1 },
        { id: 'nobox', label: 'Không có hộp để so', f: 0.7 },
        { id: 'bad', label: 'Không khớp', f: 0, ko: true, note: 'Sê-ri không khớp: nghi hàng giả hoặc đồ trộm.' }
      ]
    },
    {
      id: 'hp.fw', g: 'id', w: 1,
      t: 'Firmware',
      how: c => c.brand === 'apple' ? 'Cài đặt › Bluetooth › (i) › mục Giới thiệu.' + (c.model && c.model.fw ? ' Bản mới nhất cho đời này: ' + c.model.fw + '.' : '') : 'Xem trong ứng dụng ' + (c.model && c.model.app ? c.model.app : 'của hãng') + '.',
      levels: [
        { id: 'ok', label: 'Mới nhất', f: 1 },
        { id: 'old', label: 'Cũ, cập nhật được', f: 0.85 },
        { id: 'major', label: 'Không cập nhật được / số lạ', f: 0.2, note: 'Chuỗi firmware lạ là dấu hiệu hàng giả.' }
      ]
    },

    // ---------- Pin và sạc ----------
    {
      id: 'hp.drain', g: 'bat', w: 4, tool: 'drain',
      t: 'Độ chai pin (thử 20 phút)',
      how: c => (c.model && c.model.form === 'over')
        ? 'Tai nghe chụp tai pin lớn (' + (c.model.hours || 30) + ' giờ), thử 20 phút chỉ tụt 1–2% nên khó đo. Xem sạc có nhận, phần trăm có tụt bất thường không, hỏi người bán thời gian dùng thực tế.'
        : 'Ghi phần trăm pin từng tai, bật chống ồn (nếu có), nghe nhạc ở 50% âm lượng đúng 20 phút rồi ghi lại. Công cụ Pin tai nghe tính ra độ chai.' + (c.model && c.model.hours ? ' Tai khoẻ tụt khoảng ' + (20 / (c.model.hours * 60) * 100).toFixed(1) + '% sau 20 phút.' : ''),
      levels: [
        { id: 'ok', label: '≥ 80%', f: 1 },
        { id: 'mid', label: '60–79%', f: 0.55, note: 'Mức thường gặp ở tai nghe 2–3 năm tuổi.' },
        { id: 'low', label: '< 60%', f: 0.15, note: 'Gần hết pin: tính như phải thay tai.' },
        { id: 'uneven', label: 'Một bên tụt nhanh gấp 1,5 lần', f: 0.4 }
      ]
    },
    {
      id: 'hp.charge', g: 'bat', w: 3,
      t: 'Sạc tai và hộp',
      how: c => c.model && c.model.form === 'over' ? 'Cắm sạc, đèn phải báo sạc và phần trăm tăng.' : 'Đặt tai vào hộp 10 phút: cả hai tai phải báo đang sạc và phần trăm tăng. Sạc hộp bằng dây, và không dây nếu hộp hỗ trợ.',
      levels: [
        { id: 'ok', label: 'Sạc đủ', f: 1 },
        { id: 'major', label: 'Một cách sạc hỏng', f: 0.4 },
        { id: 'bad', label: 'Một bên tai không sạc', f: 0, cap: 40 }
      ]
    },
    {
      id: 'hp.swell', g: 'bat', w: 1, gate: true,
      t: 'Pin không phồng, không nứt vỏ',
      how: c => 'Soi đường ghép vỏ từng tai và hộp xem có hở, phồng, nóng hoặc mùi hoá chất.' + (c.model && c.model.swellRisk ? ' Sony WF-1000XM4 có nhiều báo cáo pin quá nhiệt làm bung vỏ: kiểm kỹ.' : ''),
      levels: gate('Bình thường', 'Phồng / nứt / nóng', 'Pin phồng có thể cháy: không mua.')
    },

    // ---------- Âm thanh ----------
    {
      id: 'hp.sound', g: 'snd', w: 4, tool: 'audio',
      t: 'Âm thanh hai bên',
      how: 'Dùng công cụ Âm thanh tai nghe: phát tiếng trái, phải, rồi quét bass. Nghe thêm một bài nhiều bass và một bài giọng hát, ở mức vừa và mức to.',
      pass: 'Hai bên to đều, không rè, không lẹt xẹt.',
      levels: [
        { id: 'ok', label: 'Trong, đều', f: 1 },
        { id: 'minor', label: 'Lệch nhẹ', f: 0.7 },
        { id: 'major', label: 'Rè, lẹt xẹt', f: 0.25 },
        { id: 'bad', label: 'Một bên mất tiếng', f: 0, cap: 35 }
      ]
    },
    {
      id: 'hp.anc', g: 'snd', w: 3, when: c => !c.model || c.model.anc, tool: 'noise',
      t: 'Chống ồn và xuyên âm',
      how: 'Phát tiếng ồn từ một máy khác (công cụ Tiếng ồn) hoặc đứng gần đường. Không bật nhạc, chuyển Tắt → Chống ồn → Xuyên âm, đeo từng bên để so.',
      pass: 'Bật chống ồn thì tiếng ồn trầm giảm rõ, hai bên như nhau; xuyên âm nghe tự nhiên.',
      levels: [
        { id: 'ok', label: 'Mạnh, đều', f: 1 },
        { id: 'major', label: 'Yếu một bên / có tiếng rít', f: 0.3 },
        { id: 'bad', label: 'Không có tác dụng', f: 0, cap: 40, note: 'Mẫu có chống ồn mà không chống ồn: rất có thể hàng giả.' }
      ]
    },
    {
      id: 'hp.crackle', g: 'snd', w: 2, when: c => !!c.model && c.model.crackle,
      t: 'Lỗi rè của AirPods Pro 1',
      how: 'Bật nhạc nhiều bass, bật tắt chống ồn ở chỗ ồn, lắc đầu, đi nhanh và gọi thử. Chương trình đổi miễn phí của Apple đã kết thúc.',
      levels: [
        { id: 'ok', label: 'Không rè', f: 1 },
        { id: 'major', label: 'Có rè / chống ồn mất bass', f: 0.2, note: 'Tính như phải thay một tai.' }
      ]
    },
    {
      id: 'hp.conn', g: 'snd', w: 1,
      t: 'Kết nối ổn định',
      how: 'Đi xa 5–10 m có một bức tường xem có ngắt. Nếu tai nghe hỗ trợ kết nối hai máy, ghép thêm máy thứ hai và chuyển qua lại.',
      levels: LV.std
    },

    // ---------- Micro và điều khiển ----------
    {
      id: 'hp.mic', g: 'mic', w: 3, tool: 'mic',
      t: 'Micro từng bên',
      how: c => c.brand === 'apple' ? 'Cài đặt › [tên AirPods] › Micro › chọn Luôn bên trái, ghi âm thử 10 giây; rồi chọn Luôn bên phải, ghi âm lại. Xong đặt về Tự động.' : 'Đeo một bên, gọi hoặc ghi âm thử; đổi sang bên kia.',
      levels: LV.std
    },
    {
      id: 'hp.controls', g: 'mic', w: 2,
      t: 'Điều khiển và nhận diện đeo tai',
      how: c => 'Thử ' + (c.model && c.model.ctrl ? c.model.ctrl : 'mọi thao tác chạm, bấm') + ' trên từng bên. Tháo một tai ra: nhạc phải tự dừng.' + (c.model && c.model.hearing ? ' Mục Kiểm tra thính lực phải có trong Cài đặt của tai nghe.' : ''),
      levels: LV.std
    },

    // ---------- Ngoại hình và vệ sinh ----------
    {
      id: 'hp.case', g: 'body', w: 3, when: c => !c.model || c.model.form === 'tws',
      t: 'Hộp sạc: bản lề, nam châm, đèn',
      how: c => 'Mở đóng nắp nhiều lần: bản lề không lỏng, nắp đóng dứt khoát. Lắc nhẹ hộp: tai không rơi ra.' + (c.model && c.model.caseSpeaker ? ' Hộp này có loa: trong app Tìm bấm Phát âm thanh cho hộp, hoặc cắm sạc, phải nghe tiếng.' : ''),
      levels: [
        { id: 'ok', label: 'Chắc chắn', f: 1 },
        { id: 'minor', label: 'Bản lề hơi lỏng', f: 0.7 },
        { id: 'major', label: 'Nắp không đóng / tai rơi', f: 0.3 }
      ]
    },
    {
      id: 'hp.hinge', g: 'body', w: 3, when: c => !!c.model && c.model.form === 'over',
      t: 'Bản lề, khớp chụp tai, vòm đầu',
      how: c => 'Soi chỗ nối chụp tai với vòm đầu, uốn nhẹ nghe tiếng cót két.' + (c.model && c.model.hingeRisk ? ' Mẫu này hay nứt ở bản lề.' : '') + (c.model && c.model.max ? ' Tháo đệm tai xem có hơi nước, vết gỉ bên trong chụp.' : ''),
      levels: [
        { id: 'ok', label: 'Nguyên vẹn', f: 1 },
        { id: 'minor', label: 'Kêu cót két', f: 0.7 },
        { id: 'major', label: 'Nứt chân tóc', f: 0.2, cap: 60, note: 'Vết nứt thường lan rộng: tính tiền sửa.' },
        { id: 'bad', label: 'Gãy', f: 0, cap: 35 }
      ]
    },
    {
      id: 'hp.tips', g: 'body', w: 2,
      t: c => c.model && c.model.form === 'over' ? 'Đệm tai' : 'Nút tai',
      how: c => c.model && c.model.form === 'over' ? 'Đệm có bong da, rách, xẹp không.' : 'Nút tai có rách ở chân không.' + (c.model && c.model.foamTips ? ' WF-1000XM5 chính hãng dùng nút xốp; nút silicon là dấu hiệu cần hỏi lại.' : '') + (c.model && c.model.tipRisk ? ' Buds3 Pro hay rách nút tai.' : ''),
      levels: [
        { id: 'ok', label: 'Tốt', f: 1 },
        { id: 'minor', label: 'Cũ, nên thay', f: 0.7 },
        { id: 'major', label: 'Rách, bong', f: 0.4 }
      ]
    },
    {
      id: 'hp.clean', g: 'body', w: 2,
      t: 'Vệ sinh: lưới loa, ráy tai',
      how: 'Soi lưới loa và lỗ micro xem có ráy tai bít. Đừng chọc vật nhọn vào lưới.',
      levels: [
        { id: 'ok', label: 'Sạch', f: 1 },
        { id: 'minor', label: 'Hơi bẩn', f: 0.75 },
        { id: 'major', label: 'Bít lưới, tiếng nhỏ', f: 0.4 }
      ]
    },
    { id: 'hp.cosmetic', g: 'body', w: 2, t: 'Vỏ ngoài', how: 'Trầy xước, ố màu trên tai và hộp.', levels: LV.cosmetic },

    { id: 'hp.box', g: 'acc', w: 1, t: 'Hộp, cáp, hoá đơn', how: 'Hộp giấy giúp đối chiếu sê-ri.', levels: LV.box },
    { id: 'hp.warranty', g: 'acc', w: 1, t: 'Bảo hành còn lại', levels: LV.warranty }
  ]
};
