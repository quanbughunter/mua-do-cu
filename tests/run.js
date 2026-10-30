// Kiểm thử lõi: chạy `node tests/run.js`
const fs = require('fs'), path = require('path');
const A = require('./load.js')();
let pass = 0, fail = 0;
function ok(cond, name, extra) { if (cond) pass++; else { fail++; console.log('✗ ' + name + (extra !== undefined ? ' → ' + JSON.stringify(extra) : '')); } }
const S = Object.assign({}, A.DEFAULT_SETTINGS);
const near = (a, b, t) => Math.abs(a - b) <= (t || 1);

// ---------- IMEI ----------
ok(A.checkIMEI('490154203237518').ok, 'IMEI hợp lệ 490154203237518');
ok(!A.checkIMEI('353919082513642').ok, 'IMEI sai chữ số kiểm 353919082513642');
ok(A.checkIMEI('35-391908-251364-3').ok === A.checkIMEI('353919082513643').ok, 'IMEI có gạch nối');
ok(!A.checkIMEI('12345').ok, 'IMEI thiếu số');
ok(A.checkIMEI('3539190825136401').sv, 'IMEISV 16 số');

// ---------- Số máy Apple ----------
const p1 = A.decodeApplePartNo('mfyn4za/a');
ok(p1.ok && p1.first === 'M' && p1.region === 'ZA', 'Giải mã MFYN4ZA/A', p1);
ok(p1.regionModern === 'Hồng Kông' && /Singapore/.test(p1.regionLegacy), 'ZA có cả hai bảng', p1);
const p2 = A.decodeApplePartNo('FN2Q3LL/A');
ok(p2.ok && p2.source.tone === 'info' && p2.region === 'LL', 'Máy tân trang F…LL/A', p2);
ok(A.decodeApplePartNo('3H123VN/A').source.tone === 'warn', 'Máy trưng bày 3…');
ok(!A.decodeApplePartNo('XYZ').ok, 'Số máy sai dạng');
const m17 = A.PHONE.models.find(m => m.id === 'ip-17pm'), m14 = A.PHONE.models.find(m => m.id === 'ip-14'), mAir = A.PHONE.models.find(m => m.id === 'ip-air');
ok(A.simExpectation(m17, A.decodeApplePartNo('MFYN4LL/A')) === 'none', '17 Pro Max bản Mỹ chỉ eSIM');
ok(A.simExpectation(m17, A.decodeApplePartNo('MFYN4J/A')) === 'none', '17 Pro Max bản Nhật chỉ eSIM');
ok(A.simExpectation(m17, p1) === 'tray', '17 Pro Max ZA/A có khay');
ok(A.simExpectation(m14, A.decodeApplePartNo('MPUF3LL/A')) === 'none', '14 bản Mỹ chỉ eSIM');
ok(A.simExpectation(m14, A.decodeApplePartNo('MPUF3VN/A')) === 'tray', '14 bản VN có khay');
ok(A.simExpectation(mAir, null) === 'none', 'iPhone Air luôn chỉ eSIM');

// ---------- AirPods ----------
const set1 = A.checkAirpodsSet('A3047', 'A3048', 'A2968');
ok(set1.verdict.tone === 'pass' && set1.ids[0] === 'ap-p2c', 'AirPods Pro 2 USB-C cùng bộ', set1.verdict);
ok(A.checkAirpodsSet('A3047', 'A3048', 'A2700').verdict.tone === 'warn', 'Lẫn hộp Lightning');
ok(A.checkAirpodsSet('A3047', 'A9999', '').verdict.tone === 'stop', 'Số lạ');
ok(A.checkAirpodsSet('A2083', 'A2084', 'A2190').ids[0] === 'ap-p1', 'Pro 1');

// ---------- Đọc tiền ----------
const pm = (t, c) => { const r = A.parseMoney(t, c || 'RUB'); return r ? [Math.round(r.value), r.cur] : null; };
ok(JSON.stringify(pm('71 000')) === '[71000,"RUB"]', 'tiền: 71 000', pm('71 000'));
ok(JSON.stringify(pm('18,5tr')) === '[18500000,"VND"]', 'tiền: 18,5tr', pm('18,5tr'));
ok(JSON.stringify(pm('21 triệu')) === '[21000000,"VND"]', 'tiền: 21 triệu');
ok(JSON.stringify(pm('76k')) === '[76000,"RUB"]', 'tiền: 76k');
ok(JSON.stringify(pm('71к ₽')) === '[71000,"RUB"]', 'tiền: 71к ₽', pm('71к ₽'));
ok(JSON.stringify(pm('$520', 'RUB')) === '[520,"USD"]', 'tiền: $520');
ok(JSON.stringify(pm('19.990.000 đ', 'RUB')) === '[19990000,"VND"]', 'tiền: 19.990.000 đ', pm('19.990.000 đ', 'RUB'));
ok(JSON.stringify(pm('74 000 (ví dụ)')) === '[74000,"RUB"]', 'tiền kèm chữ', pm('74 000 (ví dụ)'));
ok(pm('') === null && pm('abc') === null, 'tiền rỗng');

// ---------- Thống kê tin rao ----------
const st = A.compStats('74000\n78000\n72500\n76000\n120000', 'RUB', S);
ok(st.n === 4 && st.median === 75000 && st.items.find(x => x.value === 120000).out, 'Loại tin lệch 3·MAD', st);
const st2 = A.compStats('20tr\n70000', 'RUB', S);
ok(st2.items[0].cur === 'VND' && near(st2.items[0].value, 20e6 / S.rubVnd), 'Đổi VND sang RUB', st2.items[0]);

// ---------- Chấm điểm ----------
function insp(cat, model, answers, info, inputs) {
  const i = A.newInspection(cat, model);
  Object.assign(i.answers, answers || {}); Object.assign(i.info, info || {}); Object.assign(i.inputs, inputs || {});
  return i;
}
function allOk(cat, model) {
  const i = insp(cat, model);
  const c = A.buildContext(i);
  A.applicableItems(c.cat, c).forEach(it => { i.answers[it.id] = it.levels[0].id; });
  return i;
}
const full = allOk('phone', 'ip-15pm');
let sc = A.scoreInspection(full);
ok(sc.score === 100 && sc.grade.id === 'S' && !sc.provisional && sc.coverage === 1, 'Đạt hết = 100, hạng Như mới', [sc.score, sc.grade.id]);
ok(sc.counts.done === sc.counts.total, 'Đếm đủ mục');

full.answers['ph.bio'] = 'bad';
sc = A.scoreInspection(full);
ok(sc.score <= 35 && sc.faults.length === 1, 'Face ID hỏng → tối đa 35', sc.score);
full.answers['ph.bio'] = 'ok'; full.answers['ph.speaker'] = 'major';
sc = A.scoreInspection(full);
ok(sc.score === 69 && sc.capBy.cap === 69, 'Lỗi chức năng bất kỳ → tối đa 69', sc.score);
full.answers['ph.speaker'] = 'minor';
sc = A.scoreInspection(full);
ok(sc.score > 69 && sc.faults.length === 0 && sc.wear.length === 1, 'Lỗi nhẹ không ép 69', sc.score);
full.answers['ph.speaker'] = 'ok'; full.answers['ph.battery'] = 'b80';
sc = A.scoreInspection(full);
ok(sc.score > 90 && sc.faults.length === 0, 'Pin 80–84% là hao mòn, không ép 69', sc.score);
full.answers['ph.battery'] = 'low';
sc = A.scoreInspection(full);
ok(sc.score === 69, 'Pin < 80% → tối đa 69', sc.score);
full.answers['ph.battery'] = 'ok'; full.answers['ph.actlock'] = 'bad';
sc = A.scoreInspection(full);
ok(sc.ko.length === 1, 'Dính iCloud → loại');
let v = A.valuate(full, S, sc);
ok(v.verdict.code === 'stop' && v.offers === null, 'Loại → không mua, không trả giá', v.verdict);

// Độ phủ thấp
const part = insp('phone', 'ip-15pm', { 'ph.glass': 'ok', 'ph.display': 'ok' });
sc = A.scoreInspection(part);
ok(sc.provisional && sc.score <= 84 && sc.gatesPending.length >= 5, 'Kiểm ít → tạm tính, tối đa 84, còn mục bắt buộc', [sc.score, sc.gatesPending.length]);
v = A.valuate(part, S, sc);
ok(v.verdict === null && v.ref.src === 'estimate', 'Chưa có giá đòi → chưa kết luận; giá ước tính từ khấu hao', v.ref.src);

// Không áp dụng
const na = allOk('phone', 'ip-15pm');
delete na.answers['ph.conn']; na.na['ph.conn'] = true;
sc = A.scoreInspection(na);
ok(sc.score === 100 && sc.coverage === 1, 'Mục không áp dụng không tính', [sc.score, sc.coverage]);

// Áp dụng theo đời máy
const cSE = A.buildContext(insp('phone', 'ip-se3'));
const idsSE = A.applicableItems(cSE.cat, cSE).map(i => i.id);
ok(!idsSE.includes('ph.frp') && idsSE.includes('ph.actlock') && idsSE.includes('ph.truetone'), 'iPhone: có iCloud, không FRP');
const cS = A.buildContext(insp('phone', 'ss-s24u'));
const idsS = A.applicableItems(cS.cat, cS).map(i => i.id);
ok(idsS.includes('ph.frp') && idsS.includes('ph.root') && !idsS.includes('ph.parts'), 'Samsung: FRP, root; không có lịch sử linh kiện');
ok(/S Pen/.test(A.textOf(cS.cat.items.find(i => i.id === 'ph.buttons').how, cS)), 'S24 Ultra có S Pen');
const c17 = A.buildContext(insp('phone', 'ip-17pm', {}, { partno: 'MFYN4LL/A' }));
ok(/KHÔNG có khay/.test(A.textOf(c17.cat.items.find(i => i.id === 'ph.simtray').how, c17)), 'Bản LL: dặn không có khay SIM');

// ---------- Định giá ----------
const g = allOk('phone', 'ip-15pm');
g.info.comps = '80000\n82000\n78000\n81000';
g.info.ask = '72000';
sc = A.scoreInspection(g); v = A.valuate(g, S, sc);
const ref = 80500 * 0.95;
ok(near(v.ref.value, ref), 'Giá tham chiếu = trung vị × 0,95', v.ref.value);
ok(near(v.K, 1.04, 0.001), 'Ngoại hình hoàn hảo ×1,04', v.K);
ok(v.riskTotal === 0, 'Kiểm đủ thì không còn rủi ro');
ok(v.verdict.code === 'great', 'Đòi 72k, giá hợp lý ~79k → giá tốt', [v.fair, v.verdict.code]);
ok(v.offers.max <= v.fair && v.offers.open < v.offers.max, 'Giá trả mở đầu < tối đa ≤ giá hợp lý', v.offers);

// lỗi màn: trừ đúng chi phí thay màn 15 Pro Max (379 USD × 0,8 × 82)
g.answers['ph.display'] = 'bad';
sc = A.scoreInspection(g); v = A.valuate(g, S, sc);
const scr = v.found.find(d => d.id === 'ph.display');
ok(scr && near(scr.amount, 379 * 0.8 * 82), 'Trừ tiền thay màn theo bảng giá', scr && scr.amount);
// cùng lỗi trên iPhone 11 rẻ hơn hẳn
const g11 = allOk('phone', 'ip-11'); g11.answers['ph.display'] = 'bad'; g11.info.ref = '25000';
const v11 = A.valuate(g11, S);
ok(v11.found.find(d => d.id === 'ph.display').amount < scr.amount * 0.6, 'Lỗi màn iPhone 11 trừ ít hơn 15 Pro Max');
// sửa giá tay
g.costs['ph.display'] = 15000;
v = A.valuate(g, S);
ok(near(v.found.find(d => d.id === 'ph.display').amount, 15000), 'Giá sửa tự nhập được dùng');
delete g.costs['ph.display']; g.answers['ph.display'] = 'ok';

// kết luận theo tỉ lệ
const fairNow = A.valuate(g, S).fair;
g.info.ask = String(Math.round(fairNow * 1.2)); ok(A.valuate(g, S).verdict.code === 'haggle', 'Đòi 120% → trả giá');
g.info.ask = String(Math.round(fairNow * 1.5)); ok(A.valuate(g, S).verdict.code === 'walk', 'Đòi 150% → bỏ');
g.info.ask = String(Math.round(fairNow * 0.98)); ok(A.valuate(g, S).verdict.code === 'buy', 'Đòi 98% → mua được');

// giá sàn khi lỗi quá nhiều
const wreck = allOk('phone', 'ip-15pm'); wreck.info.ref = '30000';
['ph.display', 'ph.touch', 'ph.bio', 'ph.rearcam', 'ph.water', 'ph.back', 'ph.frame', 'ph.glass'].forEach(id => { wreck.answers[id] = (A.PHONE.items.find(i => i.id === id).levels.slice(-1)[0].id); });
v = A.valuate(wreck, S);
ok(v.floorHit && near(v.fair, 30000 * 0.15, 100), 'Lỗi chồng lỗi → chạm giá xác', v.fair);

// tiền tệ
const S2 = Object.assign({}, S, { currency: 'VND' });
v = A.valuate(insp('phone', 'ip-15pm', {}, { ref: '20 triệu' }), S2);
ok(near(v.ref.value, 20e6), 'Giá tham chiếu VND', v.ref.value);
ok(A.fmtMoney(71000, 'RUB') === '71.000 ₽' && A.fmtMoney(-5, 'USD') === '−$5', 'Định dạng tiền', A.fmtMoney(71000, 'RUB'));

// ---------- Tai nghe ----------
const hp = allOk('headphones', 'ap-p2c');
hp.info.ref = '9000'; hp.answers['hp.drain'] = 'mid';
v = A.valuate(hp, S);
const dr = v.found.find(d => d.id === 'hp.drain');
ok(dr && near(dr.amount, 0.4 * 178 * 0.8 * 82), 'Pin AirPods chai vừa: trừ 40% giá thay hai tai', dr && dr.amount);
ok(A.scoreInspection(hp).faults.length === 0, 'Pin 60–79% là hao mòn');
const hpF = allOk('headphones', 'ap-p2c'); hpF.answers['hp.fake'] = 'bad';
ok(A.valuate(hpF, S).verdict.code === 'stop', 'Hàng giả → không mua');
const cMax = A.buildContext(insp('headphones', 'ap-max'));
const idsMax = A.applicableItems(cMax.cat, cMax).map(i => i.id);
ok(idsMax.includes('hp.hinge') && !idsMax.includes('hp.case'), 'AirPods Max: bản lề, không hộp sạc');

// ---------- Máy ảnh ----------
const cam = allOk('camera', 'c-r6'); cam.info.ref = '120000';
cam.inputs.shutter = 250000;
const itS = A.CAMERA.items.find(i => i.id === 'cm.shutter');
cam.answers['cm.shutter'] = itS.input.auto(250000, A.buildContext(cam));
ok(cam.answers['cm.shutter'] === 'high', 'R6 250k/300k lần → 70–100%', cam.answers['cm.shutter']);
sc = A.scoreInspection(cam); v = A.valuate(cam, S, sc);
ok(sc.faults.length === 0 && near(v.found.find(d => d.id === 'cm.shutter').amount, 0.5 * 300 * 0.8 * 82), 'Màn trập gần hết tuổi: trừ nửa tiền thay, không tính là lỗi');
cam.answers['cm.shutter'] = itS.input.auto(60000, A.buildContext(cam));
ok(cam.answers['cm.shutter'] === 'ok' && !A.valuate(cam, S).found.some(d => d.id === 'cm.shutter'), 'Số chụp thấp: không trừ tiền');
ok(A.ratedShutter(A.CAMERA.models.find(m => m.id === 'c-r5')).n === 500000, 'R5: 500k lần (hãng)');

// ---------- EXIF so với ExifTool ----------
const FX = path.join(__dirname, 'fixtures');
const truth = JSON.parse(fs.readFileSync(path.join(FX, 'exiftool-13.59.json'), 'utf8'));
truth.forEach(t => {
  const b = fs.readFileSync(path.join(FX, t.SourceFile));
  const r = A.parseCameraJpeg(b.buffer.slice(b.byteOffset, b.byteOffset + b.length));
  const name = 'EXIF ' + t.SourceFile;
  ok(r.make === t.Make && r.model === t.Model, name + ' hãng/đời máy', [r.make, r.model]);
  const shut = t.ShutterCount != null ? t.ShutterCount : t.ImageCount;
  const supported = !/Canon1DmkIII/.test(t.SourceFile); // 1D Mark III: app không hỗ trợ (chỉ R5/R6/R6 II/R8/R50)
  if (shut != null && supported) ok(r.shutter && r.shutter.value === shut, name + ' số chụp = ' + shut, r.shutter);
  if (t.ShutterCount == null && t.ImageCount == null) ok(!r.shutter, name + ' không bịa số chụp', r.shutter);
  if (t.MechanicalShutterCount) ok(r.mechCount === t.MechanicalShutterCount, name + ' màn trập cơ', r.mechCount);
  const ser = t.SerialNumber != null ? String(t.SerialNumber).trim().replace(/^NO=\s*/, '') : null;
  if (ser && !/^SONY/.test(String(t.SerialNumber))) ok((r.makerSerial || '').replace(/^0+/, '') === ser.replace(/^0+/, ''), name + ' sê-ri ' + ser, r.makerSerial);
  if (t.SerialNumber && /^SONY/.test(String(t.SerialNumber))) ok(r.bodySerial === t.SerialNumber, name + ' sê-ri EXIF', r.bodySerial);
  if (t.InternalSerialNumber && /fuji/i.test(t.SourceFile) && /X-T5/.test(t.Model)) ok(r.makerSerial === t.InternalSerialNumber, name + ' sê-ri nội bộ', r.makerSerial);
});
ok(A.matchCameraModel('Canon EOS R6m2') === 'c-r6ii' && A.matchCameraModel('NIKON Z 6_2') === 'n-z6ii' && A.matchCameraModel('ILCE-7M3') === 's-a7iii', 'Khớp tên EXIF với danh mục');
const notJpeg = A.parseCameraJpeg(new Uint8Array([0x89, 0x50, 0x4e, 0x47]).buffer);
ok(!!notJpeg.error, 'Không phải JPEG → báo lỗi');

// ---------- Báo cáo ----------
const rep = A.reportText(g, S);
ok(/PHIẾU KIỂM ĐỒ CŨ/.test(rep) && /Giá hợp lý/.test(rep), 'Báo cáo chữ');

// ---------- Mã máy → bản nước nào ----------
{
  const one = s => A.decodeOneCode(s);
  const ip = one('MGCM3LL/A');
  ok(ip.ok && ip.brand === 'apple' && ip.grp === 'us' && /eSIM/.test(ip.notes.map(n => n.text).join()), 'Mã máy: MGCM3LL/A là bản Mỹ, có ghi chú eSIM', ip);
  ok(one('MGDF3VN/A').market.tone === 'pass' && one('MGDF3VN/A').market.text.indexOf('Việt Nam') >= 0, 'Mã máy: …VN/A là Việt Nam');
  ok(one('A2342').what === 'Mã kiểu máy Apple', 'Mã máy: A2342 nhận ra là mã A, nhắc đổi sang số máy');
  const sb = one('SM-S928B/DS');
  ok(sb.brand === 'samsung' && sb.model === 'Galaxy S24 Ultra' && sb.grp === 'intl' && sb.rows.some(r => r[0] === 'SIM'), 'Mã máy: SM-S928B/DS quốc tế, 2 SIM', sb);
  ok(one('SM-S928N').grp === 'kr' && one('SM-S928U').market.tone === 'warn' && one('SM-S928U1').grp === 'us' && one('SM-S9280').grp === 'cn', 'Mã máy: hậu tố N / U / U1 / 0');
  ok(one('S928B').model === 'Galaxy S24 Ultra', 'Mã máy: thiếu "SM-" vẫn đọc được khi đời máy có trong bảng');
  ok(one('SM-N975F/DS').model === 'Galaxy Note10+', 'Mã máy: Note10+ bản F');
  ok(one('SER/SER/SER').market.text === 'Nga' && one('SKZ/SKZ/SKZ,SKZ/SKZ').market.text === 'Kazakhstan', 'Mã máy: CSC SER, SKZ');
  const csv = one('S928BOXM6DZI1');
  ok(csv.ssBase === 'S928' && csv.rows.some(r => r[0] === 'CSC OXM'), 'Mã máy: Phiên bản CSC S928BOXM…', csv);
  ok(one('S928BXXS6DZI1').what === 'Phiên bản phần mềm Samsung', 'Mã máy: PDA không bị đọc nhầm thành CSC "XXS"');
  ok(one('SAOMC_SM-S928B_OXM_SKZ_16_0005').market.text === 'Kazakhstan', 'Mã máy: dòng SAOMC lấy CSC đang chạy');
  const xg = one('2312DRA50G');
  ok(xg.brand === 'xiaomi' && xg.grp === 'intl' && xg.rows.some(r => /12\/2023/.test(r[1])), 'Mã máy: 2312DRA50G quốc tế, mẫu 12/2023', xg);
  const rom = one('OS2.0.3.0.VNFMIXM');
  ok(rom.romRegion === 'MI' && rom.rows[0][1] === 'HyperOS 2 · Android 15', 'Mã máy: OS2.0.3.0.VNFMIXM là ROM Global, Android 15', rom);
  ok(one('3.0.305.0.WMLTWXM').romRegion === 'TW' && one('OS2.0.1.0.VNFCNXM').market.tone === 'warn', 'Mã máy: ROM TW, CN');
  ok(one('CPH2651').grp === 'intl' && one('PKB110').grp === 'cn', 'Mã máy: Oppo CPH quốc tế, PKB Trung Quốc');
  ok(one('DNP-AN00').grp === 'cn' && one('DNP-NX9').grp === 'intl' && one('ELE-L29').grp === 'intl', 'Mã máy: Honor/Huawei AN00 / NX9 / L29');
  ok(one('V2324A').grp === 'cn' && one('V2324').grp === 'intl', 'Mã máy: vivo đuôi A');
  ok(one('350683211411797').what === 'IMEI' && one('350683211411797').rows[1][1] === 'Đúng thuật toán Luhn', 'Mã máy: nhập IMEI thì kiểm Luhn, không đoán nước');
  ok(!one('XYZ12').ok, 'Mã máy: mã lạ báo chưa nhận ra');
  const c1 = A.decodeCodes('SM-S928N  SER/SER/SER');
  ok(c1.items.length === 2 && c1.cross.length === 1, 'Mã máy: model Hàn + phần mềm Nga → cảnh báo cài lại', c1.cross);
  ok(A.decodeCodes('SM-S928B/DS SER/SER/SER').cross.length === 0, 'Mã máy: model quốc tế + CSC Nga không cảnh báo');
  ok(A.decodeCodes('2312DRA50C OS2.0.3.0.VNFMIXM').cross.length === 1, 'Mã máy: Xiaomi bản C chạy ROM Global → cảnh báo ROM sửa');
  ok(A.decodeCodes('hello world').items.length === 0, 'Mã máy: chữ thường không sinh kết quả rác');
  const PM = A.PHONE.models, mdl = id => PM.find(m => m.id === id);
  ok(/S23 Ultra/.test(A.codeModelMismatch(mdl('ss-s24u'), A.decodeCodes('SM-S918B'))), 'Mã máy: chọn S24 Ultra mà mã là S23 Ultra → báo lệch');
  ok(A.codeModelMismatch(mdl('ss-s24u'), A.decodeCodes('SM-S928N')) === null, 'Mã máy: đúng đời thì không báo lệch');
  ok(/Apple/.test(A.codeModelMismatch(mdl('mi-rn13p'), A.decodeCodes('MGCM3LL/A'))), 'Mã máy: mã khác hãng → báo lệch');
  ok(A.codeModelMismatch(mdl('and-other'), A.decodeCodes('CPH2651')) === null, 'Mã máy: "Android hãng khác" nhận mã Oppo');
}

// ---------- Pin Galaxy từ nhật ký *#9900# ----------
(async () => {
  const note10 = 'x\n[ro.product.model]: [SM-N975F]\n[ro.build.PDA]: [N975FXXS9HWHA]\n' +
    'HealthInfo{.batteryCycleCount = 0, .batteryFullCharge = 4300000, .batteryChargeCounter = 1489640}\n' +
    'health: vendor.samsung.hardware.health@2.0::ISehHealth@Proxy | BatteryInfoBackUp |   mSavedBatteryAsoc: 73 |   mSavedBatteryMaxTemp: 571 |   mSavedBatteryMaxCurrent: 6896 |   mSavedBatteryUsage: 299304 |\n' +
    'D BatteryService: !@[BatteryInfo] writeToFile /sys/class/power_supply/battery/battery_cycle: 2992\n' +
    'D BatteryService: !@[BatteryInfo] writeToFile /sys/class/power_supply/battery/battery_cycle: 2993\n';
  const scan = (text, size) => { const sc = A.galaxyBattScanner(); for (let i = 0; i < text.length; i += size) sc.push(text.slice(i, i + size)); return sc.result(); };
  const g1 = scan(note10, 1 << 16);
  ok(g1.health === 73 && g1.src === 'asoc' && g1.bsoh == null, 'Pin Galaxy: ASOC 73%', g1);
  ok(g1.cycles === 2993 && g1.level === 'low', 'Pin Galaxy: 2.993 vòng, mức < 80%', [g1.cycles, g1.level]);
  ok(g1.remainMah === 3140 && g1.designMah === 4300 && g1.maxTempC === 57.1, 'Pin Galaxy: còn ≈ 3.140/4.300 mAh, 57,1 °C', [g1.remainMah, g1.designMah, g1.maxTempC]);
  ok(g1.model === 'SM-N975F' && g1.pda === 'N975FXXS9HWHA', 'Pin Galaxy: model và phần mềm', [g1.model, g1.pda]);
  const g2 = scan(note10, 7);
  ok(g2.health === 73 && g2.cycles === 2993 && g2.model === 'SM-N975F', 'Pin Galaxy: dòng bị cắt giữa hai đoạn vẫn đọc đúng', g2);
  const g3 = scan('mSavedBatteryAsoc: 91\nmSavedBatteryBsoh: 88\n', 100);
  ok(g3.health === 88 && g3.src === 'bsoh' && g3.level === 'b85', 'Pin Galaxy: có cả hai thì lấy BSOH', g3);
  const g4 = scan('mSavedBatteryAsoc: 84\nmSavedBatteryUsage: 41250\n', 100);
  ok(g4.cycles === 413 && g4.level === 'b80', 'Pin Galaxy: không có battery_cycle thì lấy Usage/100', g4);
  const g5 = scan('chỉ có dòng rác\n', 100);
  ok(g5.health == null && g5.level == null, 'Pin Galaxy: không có chỉ số thì không bịa', g5);
  // Gói ZIP mẫu (tests/fixtures/galaxy-dumpstate.zip, tạo bằng make_fixtures.py)
  const zlib = require('zlib');
  const zb = fs.readFileSync(path.join(FX, 'galaxy-dumpstate.zip'));
  const rd = (a, b) => Promise.resolve(new DataView(zb.buffer, zb.byteOffset + a, b - a));
  const ent = await A.findZipEntry(zb.length, rd);
  ok(ent && ent.name === 'dumpstate.txt' && ent.method === 8, 'ZIP: chọn dumpstate.txt lớn nhất, nén deflate', ent);
  const st = await A.zipDataStart(rd, ent);
  const txt = zlib.inflateRawSync(zb.subarray(st, st + ent.csize)).toString('utf8');
  ok(txt.length === ent.usize, 'ZIP: giải nén đúng kích thước', [txt.length, ent.usize]);
  const gz = scan(txt, 1 << 16);
  ok(gz.health === 90 && gz.asoc === 91 && gz.cycles === 412 && gz.level === 'ok', 'ZIP mẫu: BSOH 90%, 412 vòng', gz);
  ok(gz.remainMah === 4500 && gz.model === 'SM-S928B' && gz.maxTempC === 45.2, 'ZIP mẫu: 4.500/5.000 mAh, SM-S928B, 45,2 °C', gz);
  let threw = false;
  try { const junk = Buffer.from('không phải zip'); await A.findZipEntry(junk.length, (a, b) => Promise.resolve(new DataView(junk.buffer, junk.byteOffset + a, b - a))); } catch (e) { threw = true; }
  ok(threw, 'Không phải ZIP → báo lỗi');
  console.log('\n' + pass + ' đạt, ' + fail + ' lỗi');
  process.exit(fail ? 1 : 0);
})();
