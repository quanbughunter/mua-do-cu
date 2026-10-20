// ===== Quy ra tiền: chi phí sửa từng bộ phận và luật trừ tiền cho từng mục =====
// Giá hợp lý = Giá tham chiếu × Hệ số ngoại hình − Σ chi phí sửa lỗi đã thấy − Σ rủi ro mục chưa kiểm.
// Chi phí sửa tính bằng USD theo bảng giá hãng, nhân "hệ số giá tiệm" trong Cài đặt rồi đổi ra tiền đang dùng.
// Người dùng sửa được từng khoản ngay trên màn hình kết quả, vì giá sửa mỗi nơi một khác.

const R = Math.round;

// Bảng giá sửa ngoài bảo hành của Apple ở Mỹ (màn 129–379, pin 89–129, kính lưng 169–199 USD).
// Face ID: theo mức trừ của 24hStore (3–6 triệu ₫). Các mục khác là ước lượng, sửa được.
function phoneRepairUSD(m) {
  const n = (m && m.name) || '';
  const y = (m && m.year) || 2023;
  if (m && m.brand === 'apple') {
    const usd = m.usd || 999;
    const pm = /Pro Max/.test(n), plus = /Plus|Air/.test(n), pro = /Pro/.test(n), mini = /mini/.test(n), se = /SE/.test(n);
    const screen = se ? 129 : mini ? 229 : pm ? (y >= 2022 ? 379 : 329) : plus ? 329 : pro ? (y >= 2022 ? 329 : 279)
      : n === 'iPhone 11' ? 199 : /16e|17e/.test(n) ? 229 : 279;
    const battery = se ? 89 : y >= 2026 ? 129 : y >= 2024 ? 119 : 99;
    const glassBack = y >= 2023 || (y === 2022 && !pro);
    return {
      screen, battery,
      back: glassBack ? (pm || plus ? 199 : 169) : (pm ? 599 : pro ? 549 : 449),
      rearcam: R(usd * 0.18), frontcam: R(usd * 0.08),
      bio: m.touchId ? 90 : y <= 2019 ? 120 : y <= 2021 ? 190 : 230,
      port: 79, speaker: 59, mic: 59, buttons: 59, vibrate: 49, sensors: 59, camglass: 39, board: R(usd * 0.35)
    };
  }
  const usd = (m && m.usd) || 500;
  return {
    screen: R(usd * 0.22), battery: 69, back: R(usd * 0.08) + 20, rearcam: R(usd * 0.14), frontcam: R(usd * 0.06),
    bio: R(usd * 0.07), port: 49, speaker: 45, mic: 45, buttons: 45, vibrate: 39, sensors: 45, camglass: 29, board: R(usd * 0.35)
  };
}

// AirPods: giá thay một tai / hộp sạc của Apple (69–99 USD); Max: pin 79, đệm tai 69. Hãng khác: ước lượng theo giá bán.
function headphoneRepairUSD(m) {
  const over = m && m.form === 'over';
  const usd = (m && m.usd) || (over ? 300 : 150);
  if (m && m.brand === 'apple' && !over) {
    const pro = /Pro/.test(m.name);
    const bud = /Pro 3/.test(m.name) ? 99 : pro ? 89 : 69;
    return { bud, batt: bud * 2, case: pro ? 99 : 69, tips: 8, clean: 10, hinge: 0, cushion: 0 };
  }
  if (m && m.max) return { bud: R(usd * 0.35), batt: 79, case: 0, tips: 0, clean: 10, hinge: R(usd * 0.25), cushion: 69 };
  if (over) return { bud: R(usd * 0.35), batt: 50, case: 0, tips: 0, clean: 10, hinge: 45, cushion: 30 };
  return { bud: R(usd * 0.4), batt: R(usd * 0.6), case: R(usd * 0.35), tips: 10, clean: 10, hinge: 0, cushion: 0 };
}

// Máy ảnh: thay màn trập 150–400 USD (Swappa, PhotoWorkout), vệ sinh cảm biến < 100 USD (SlashGear).
function cameraRepairUSD(m) {
  const usd = (m && m.usd) || 1200;
  const tier = (m && (m.tier || (m.rated && m.rated.n >= 200000 ? 'ff' : 'mid'))) || 'mid';
  return {
    shutter: { entry: 160, mid: 220, ff: 300, pro: 380 }[tier] || 220,
    clean: 60, sensor: R(usd * 0.45), af: R(usd * 0.3), ibis: R(usd * 0.2) + 50, lcd: 130, evf: 170,
    buttons: 70, slot: 120, ports: 80, battery: 50, mount: 90, grip: 35, water: R(usd * 0.3), board: R(usd * 0.35)
  };
}

const PART_NAMES = {
  screen: 'thay màn hình', battery: 'thay pin', back: 'thay kính lưng / vỏ', rearcam: 'thay camera sau', frontcam: 'thay camera trước',
  bio: 'mất Face ID / Touch ID', port: 'thay cổng sạc', speaker: 'thay loa', mic: 'thay micro', buttons: 'sửa nút', vibrate: 'thay motor rung',
  sensors: 'sửa cảm biến', camglass: 'thay kính camera', board: 'sửa bo mạch',
  bud: 'thay một tai', batt: 'thay tai (pin chai)', case: 'thay hộp sạc', tips: 'mua nút tai', clean: 'vệ sinh', hinge: 'sửa bản lề', cushion: 'thay đệm tai',
  shutter: 'thay màn trập', sensor: 'thay cảm biến', af: 'sửa lấy nét', ibis: 'sửa chống rung', lcd: 'thay màn LCD', evf: 'thay kính ngắm',
  slot: 'thay khe thẻ', ports: 'sửa cổng', mount: 'thay ngàm', grip: 'thay cao su', water: 'xử lý hỏng do nước'
};

// Luật tiền cho từng mục.
// axis: gate (cổng chặn) | info (nhận dạng) | fn (chức năng) | cos (ngoại hình) | extra (phụ kiện, bảo hành).
// fix: tên bộ phận ở bảng trên, hoặc { pct } (phần của giá tham chiếu), { usd }, { lens } (phần giá ống kính kèm).
// p: xác suất lỗi khi chưa kiểm (tính rủi ro). lv: theo từng mức, rf = phần chi phí sửa phải trừ
// (mặc định 1 − f với mục chức năng, 0 với mục ngoại hình), adj = cộng/trừ thẳng theo % giá tham chiếu,
// fault = false nếu mức đó là hao mòn chứ không phải lỗi (không bị ép điểm tối đa 69).
const MONEY = {
  // --- Điện thoại ---
  'ph.imei': { axis: 'gate', lv: { tray: { adj: -0.05 } } },
  'ph.model': { axis: 'info', lv: { minor: { adj: -0.03 }, major: { adj: -0.15 } } },
  'ph.simtray': { axis: 'info', lv: { bad: { adj: -0.2 } } },
  'ph.serial': { axis: 'info', lv: { minor: { adj: -0.03 } } },
  'ph.parts': { axis: 'info', lv: { used: { adj: -0.05 }, unknown: { adj: -0.15 }, bad: { adj: -0.35 } } },
  'ph.root': { axis: 'info', lv: { major: { adj: -0.15 } } },
  'ph.battery': { axis: 'fn', fix: 'battery', p: 0.25, lv: { b85: { rf: 0.25, fault: false }, b80: { rf: 0.6, fault: false }, low: { rf: 1 }, fake: { rf: 1, adj: -0.03 } } },
  'ph.charge': { axis: 'fn', fix: 'port', p: 0.05 },
  'ph.glass': { axis: 'cos', fix: 'screen', lv: { bad: { rf: 1 } } },
  'ph.display': { axis: 'fn', fix: 'screen', p: 0.08, lv: { minor: { rf: 0.3 }, major: { rf: 0.9 }, bad: { rf: 1 } } },
  'ph.touch': { axis: 'fn', fix: 'screen', p: 0.05, lv: { major: { rf: 0.8 }, bad: { rf: 1 } } },
  'ph.truetone': { axis: 'fn', fix: { pct: 0.1 }, p: 0.08, lv: { major: { rf: 1 } } },
  'ph.rearcam': { axis: 'fn', fix: 'rearcam', p: 0.06, lv: { minor: { rf: 0.5 }, bad: { rf: 1 } } },
  'ph.ois': { axis: 'fn', fix: 'rearcam', p: 0.06 },
  'ph.frontcam': { axis: 'fn', fix: 'frontcam', p: 0.04 },
  'ph.camglass': { axis: 'fn', fix: 'camglass', p: 0.05 },
  'ph.bio': { axis: 'fn', fix: 'bio', p: 0.15, lv: { major: { rf: 0.7 }, bad: { rf: 1 } } },
  'ph.speaker': { axis: 'fn', fix: 'speaker', p: 0.05 },
  'ph.mic': { axis: 'fn', fix: 'mic', p: 0.05 },
  'ph.call': { axis: 'fn', fix: 'speaker', p: 0.04 },
  'ph.buttons': { axis: 'fn', fix: 'buttons', p: 0.05 },
  'ph.vibrate': { axis: 'fn', fix: 'vibrate', p: 0.03 },
  'ph.conn': { axis: 'fn', fix: 'board', p: 0.03, lv: { minor: { rf: 0.2 }, major: { rf: 0.6 }, bad: { rf: 1 } } },
  'ph.sensors': { axis: 'fn', fix: 'sensors', p: 0.03 },
  'ph.water': { axis: 'fn', fix: { pct: 0.25 }, p: 0.05, lv: { major: { rf: 0.6 }, bad: { rf: 1 } } },
  'ph.frame': { axis: 'cos', fix: 'back', lv: { bad: { rf: 1 } } },
  'ph.back': { axis: 'cos', fix: 'back', lv: { major: { rf: 1 } } },
  'ph.box': { axis: 'extra', lv: { ok: { adj: 0.02 }, major: { adj: -0.03 } } },
  'ph.warranty': { axis: 'extra', lv: { ok: { adj: 0.05 }, minor: { adj: 0.02 } } },

  // --- Tai nghe ---
  'hp.fake': { axis: 'gate', lv: { doubt: { adj: -0.4 } } },
  'hp.numbers': { axis: 'info', lv: { mixed: { adj: -0.15 } } },
  'hp.serial': { axis: 'info', lv: { nobox: { adj: 0 } } },
  'hp.fw': { axis: 'info', lv: { major: { adj: -0.3 } } },
  'hp.drain': { axis: 'fn', fix: 'batt', p: 0.3, lv: { mid: { rf: 0.4, fault: false }, low: { rf: 1 }, uneven: { rf: 0.5 } } },
  'hp.charge': { axis: 'fn', fix: 'case', p: 0.05, lv: { major: { rf: 0.5 }, bad: { rf: 1, fix: 'bud' } } },
  'hp.sound': { axis: 'fn', fix: 'bud', p: 0.06, lv: { minor: { rf: 0.3 }, major: { rf: 0.9 }, bad: { rf: 1 } } },
  'hp.anc': { axis: 'fn', fix: 'bud', p: 0.05, lv: { major: { rf: 0.8 }, bad: { rf: 2 } } },
  'hp.crackle': { axis: 'fn', fix: 'bud', p: 0.25, lv: { major: { rf: 1 } } },
  'hp.conn': { axis: 'fn', fix: { pct: 0.2 }, p: 0.04 },
  'hp.mic': { axis: 'fn', fix: 'bud', p: 0.05 },
  'hp.controls': { axis: 'fn', fix: 'bud', p: 0.04 },
  'hp.case': { axis: 'fn', fix: 'case', p: 0.05, lv: { minor: { rf: 0.2, fault: false }, major: { rf: 0.8 } } },
  'hp.hinge': { axis: 'fn', fix: 'hinge', p: 0.08, lv: { minor: { rf: 0.2, fault: false }, major: { rf: 1 }, bad: { rf: 1 } } },
  'hp.tips': { axis: 'cos', fix: c => (c.model && c.model.form === 'over' ? 'cushion' : 'tips'), lv: { minor: { rf: 1 }, major: { rf: 1 } } },
  'hp.clean': { axis: 'cos', fix: 'clean', lv: { minor: { rf: 0.5 }, major: { rf: 1 } } },
  'hp.box': { axis: 'extra', lv: { ok: { adj: 0.02 }, major: { adj: -0.03 } } },
  'hp.warranty': { axis: 'extra', lv: { ok: { adj: 0.06 }, minor: { adj: 0.02 } } },

  // --- Máy ảnh ---
  'cm.shutter': { axis: 'fn', fix: 'shutter', p: 0.1, lv: { ok: { rf: 0 }, mid: { rf: 0, fault: false }, high: { rf: 0.5, fault: false }, over: { rf: 1, fault: false } } },
  'cm.shutterwork': { axis: 'fn', fix: 'shutter', p: 0.04, lv: { major: { rf: 1 }, bad: { rf: 1 } } },
  'cm.dust': { axis: 'fn', fix: 'clean', p: 0.3, lv: { minor: { rf: 1, fault: false }, major: { rf: 1.5, fault: false }, bad: { rf: 1, fix: 'sensor' } } },
  'cm.pixels': { axis: 'fn', fix: 'sensor', p: 0.04, lv: { minor: { rf: 0, fault: false }, major: { rf: 0.5 }, bad: { rf: 1 } } },
  'cm.af': { axis: 'fn', fix: 'af', p: 0.05 },
  'cm.ibis': { axis: 'fn', fix: 'ibis', p: 0.05 },
  'cm.lcd': { axis: 'fn', fix: 'lcd', p: 0.04, lv: { minor: { rf: 0, fault: false }, major: { rf: 0.8 }, bad: { rf: 1 } } },
  'cm.evf': { axis: 'fn', fix: 'evf', p: 0.03 },
  'cm.buttons': { axis: 'fn', fix: 'buttons', p: 0.05 },
  'cm.slots': { axis: 'fn', fix: 'slot', p: 0.04, lv: { major: { rf: 0.6 }, bad: { rf: 1 } } },
  'cm.ports': { axis: 'fn', fix: 'ports', p: 0.03 },
  'cm.battery': { axis: 'fn', fix: 'battery', p: 0.2, lv: { minor: { rf: 1, fault: false }, major: { rf: 1 } } },
  'cm.video': { axis: 'fn', fix: { pct: 0.1 }, p: 0.04 },
  'cm.drop': { axis: 'cos', fix: { pct: 0.15 }, lv: { major: { rf: 1 }, bad: { rf: 1, fix: { pct: 0.35 } } } },
  'cm.water': { axis: 'fn', fix: 'water', p: 0.04, lv: { major: { rf: 0.5 }, bad: { rf: 1 } } },
  'cm.mount': { axis: 'fn', fix: 'mount', p: 0.03 },
  'cm.grip': { axis: 'cos', fix: 'grip', lv: { bad: { rf: 1 } } },
  'cm.lglass': { axis: 'fn', fix: { lens: 1 }, p: 0.08, lv: { minor: { rf: 0, fault: false }, major: { rf: 0.35 }, bad: { rf: 0.8 } } },
  'cm.laperture': { axis: 'fn', fix: { lens: 1 }, p: 0.04, lv: { major: { rf: 0.3 }, bad: { rf: 0.6 } } },
  'cm.lmech': { axis: 'fn', fix: { lens: 0.6 }, p: 0.05 },
  'cm.box': { axis: 'extra', lv: { ok: { adj: 0.02 }, major: { adj: -0.03 } } },
  'cm.warranty': { axis: 'extra', lv: { ok: { adj: 0.05 }, minor: { adj: 0.02 } } }
};

PHONE.repairUSD = phoneRepairUSD;
HEADPHONES.repairUSD = headphoneRepairUSD;
CAMERA.repairUSD = cameraRepairUSD;
