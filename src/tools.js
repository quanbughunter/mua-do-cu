// ===== Công cụ kiểm tra chạy trên trình duyệt =====
// Mỗi công cụ vẽ vào một tấm toàn màn hình. api: { insp, ctx, item, answer(levelId), setInput(k, v), patch(fn), close(), toast(msg) }

const TOOL_NAMES = {
  screen: 'Thử màn hình', touch: 'Thử cảm ứng', speaker: 'Thử loa', audio: 'Thử âm thanh trái, phải', mic: 'Thử micro',
  noise: 'Tiếng ồn để thử chống ồn', sensors: 'Cảm biến và rung', camera: 'Xem từng camera', battery: 'Trạng thái sạc',
  drain: 'Tính độ chai pin tai nghe', airpods: 'Đối chiếu số model AirPods', exif: 'Đọc ảnh máy ảnh', dust: 'Tìm bụi cảm biến',
  hotpixel: 'Tìm điểm nóng, điểm chết', coverage: 'Tra bảo hành Apple', partno: 'Giải mã số máy', imei: 'Kiểm tra IMEI'
};

const live = { stream: null, ctx: null, nodes: [], timers: [], rec: null, listeners: [] };
function stopLive() {
  live.nodes.forEach(n => { try { n.stop ? n.stop() : null; } catch (e) {} try { n.disconnect(); } catch (e) {} });
  live.nodes = [];
  live.timers.forEach(t => clearTimeout(t)); live.timers = [];
  if (live.stream) { live.stream.getTracks().forEach(t => t.stop()); live.stream = null; }
  if (live.rec && live.rec.state !== 'inactive') { try { live.rec.stop(); } catch (e) {} }
  live.listeners.forEach(([t, ev, fn]) => t.removeEventListener(ev, fn)); live.listeners = [];
  document.querySelectorAll('.fill, .touchgrid').forEach(el => el.remove());
  if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
}
function listen(t, ev, fn, opt) { t.addEventListener(ev, fn, opt); live.listeners.push([t, ev, fn]); }
function audioCtx() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!live.ctx || live.ctx.state === 'closed') live.ctx = new AC();
  if (live.ctx.state === 'suspended') live.ctx.resume();
  return live.ctx;
}
function blockedMsg(err, what) {
  const name = err && err.name;
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'Trình duyệt không cho dùng ' + what + '. Nếu đang mở trong Claude, hãy mở bản web (GitHub Pages) trên điện thoại; nếu đã từ chối quyền, bật lại trong cài đặt trang.';
  if (name === 'NotFoundError') return 'Không tìm thấy ' + what + ' trên máy này.';
  return 'Không mở được ' + what + (err && err.message ? ': ' + err.message : '') + '.';
}
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Nút chọn mức ngay trong công cụ.
function levelPicker(api, highlight) {
  if (!api.item) return '';
  return '<div class="field"><span class="lbl">Ghi kết quả vào phiếu: ' + esc(textOf(api.item.t, api.ctx)) + '</span><div class="levels">' +
    api.item.levels.map(l => '<button class="lv ' + lvTone(l) + '" data-pick="' + l.id + '"' + (l.id === highlight ? ' aria-pressed="true"' : '') + '>' + esc(l.label) + '</button>').join('') + '</div></div>';
}
function lvTone(l) { return l.ko ? 't-stop' : l.f >= 0.95 ? 't-pass' : l.f >= 0.5 ? 't-warn' : 't-stop'; }
function bindPicker(el, api) {
  el.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => { api.answer(b.dataset.pick); api.close(); }));
}

const TOOLS = {};

// ---------- Màn hình ----------
TOOLS.screen = (el, api) => {
  const colors = [['#FFFFFF', 'Trắng: tìm điểm tối, ám vàng ở viền'], ['#000000', 'Đen: tìm điểm sáng, hở sáng (màn LCD)'], ['#FF0000', 'Đỏ'], ['#00FF00', 'Xanh lá'], ['#0000FF', 'Xanh dương'], ['#808080', 'Xám 50%: tìm bóng mờ, vệt in hằn'], ['#333333', 'Xám tối: tìm sọc, loang màu'], ['#C8C8C8', 'Xám sáng: soi kỹ vùng thanh trạng thái và bàn phím']];
  el.innerHTML = '<p class="how">Kéo độ sáng lên tối đa. Màn hình sẽ phủ kín một màu, chạm để sang màu tiếp theo (' + colors.length + ' màu). Soi kỹ từng màu ở cả bốn góc.</p>' +
    '<div class="btnrow"><button class="btn primary" id="t-go">Bắt đầu</button></div><div id="t-after" hidden>' + levelPicker(api) + '</div>';
  el.querySelector('#t-go').onclick = () => {
    let i = 0;
    const f = document.createElement('div');
    f.className = 'fill';
    const cap = document.createElement('div'); cap.className = 'cap'; f.appendChild(cap);
    const show = () => { f.style.background = colors[i][0]; cap.textContent = (i + 1) + '/' + colors.length + ' · ' + colors[i][1]; };
    show();
    f.addEventListener('pointerdown', e => {
      e.preventDefault();
      i++;
      if (i >= colors.length) { f.remove(); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); el.querySelector('#t-after').hidden = false; bindPicker(el, api); return; }
      show();
      if (i === 1) cap.style.opacity = '.85';
    });
    document.body.appendChild(f);
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
  };
};

// ---------- Cảm ứng ----------
TOOLS.touch = (el, api) => {
  el.innerHTML = '<p class="how">Màn hình chia thành các ô. Kéo ngón tay tô kín mọi ô, kể cả sát mép và bốn góc. Ô nào không đổi màu dù đã kéo qua nhiều lần là vùng cảm ứng chết.</p>' +
    '<div class="btnrow"><button class="btn primary" id="t-go">Bắt đầu</button></div><div id="t-res"></div><div id="t-after" hidden>' + levelPicker(api) + '</div>';
  el.querySelector('#t-go').onclick = () => {
    const size = 46, cols = Math.max(5, Math.floor(innerWidth / size)), rows = Math.max(8, Math.floor(innerHeight / size));
    const g = document.createElement('div');
    g.className = 'touchgrid';
    g.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
    g.style.gridTemplateRows = 'repeat(' + rows + ', 1fr)';
    let html = '';
    for (let k = 0; k < cols * rows; k++) html += '<i></i>';
    g.innerHTML = html + '<span class="cap">Còn ' + cols * rows + ' ô</span><button class="iconbtn x" aria-label="Dừng"><svg class="ico"><use href="#i-x"/></svg></button>';
    const cells = g.querySelectorAll('i'), cap = g.querySelector('.cap');
    let left = cells.length;
    const finish = (all) => {
      g.remove();
      el.querySelector('#t-res').innerHTML = '<div class="note ' + (all ? 'tone-pass">Mọi ô đều ăn cảm ứng.' : 'tone-warn">Dừng khi còn ' + left + ' ô chưa tô. Nếu đã kéo qua mà ô không đổi màu thì cảm ứng có vùng chết.') + '</div>';
      el.querySelector('#t-after').hidden = false; bindPicker(el, api);
    };
    const hit = (x, y) => {
      const t = document.elementFromPoint(x, y);
      if (t && t.parentNode === g && t.tagName === 'I' && !t.classList.contains('on')) {
        t.classList.add('on'); left--; cap.textContent = left ? 'Còn ' + left + ' ô' : 'Đủ mọi ô';
        if (!left) setTimeout(() => finish(true), 400);
      }
    };
    g.addEventListener('pointerdown', e => { e.preventDefault(); hit(e.clientX, e.clientY); });
    g.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') hit(e.clientX, e.clientY); });
    g.querySelector('.x').addEventListener('click', () => finish(false));
    document.body.appendChild(g);
  };
};

// ---------- Âm thanh ----------
function beep(ac, freq, pan, t0, dur, type) {
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type || 'sine'; o.frequency.value = freq;
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.5, t0 + 0.02); g.gain.setValueAtTime(0.5, t0 + dur - 0.05); g.gain.linearRampToValueAtTime(0, t0 + dur);
  let out = g;
  if (ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = pan; g.connect(p); out = p; }
  o.connect(g); out.connect(ac.destination);
  o.start(t0); o.stop(t0 + dur + 0.05);
  live.nodes.push(o);
}
function audioTool(el, api, mode) {
  const intro = mode === 'speaker'
    ? 'Phát trên chính máy đang kiểm. Bên trái là loa thoại (phía trên), bên phải là loa dưới khi cầm dọc; trên iPhone hai loa tạo âm thanh nổi. Che lần lượt từng loa để chắc cả hai đều kêu, không rè ở mức to.'
    : 'Đeo tai nghe đang kiểm, kết nối với điện thoại của bạn. Tiếng bíp trầm phải ở tai trái, tiếng bíp cao ở tai phải. Bản quét tần số đi từ 30 Hz (rất trầm) lên 16 kHz: nghe xem có chỗ nào rè, rung, hay một bên tắt tiếng.';
  el.innerHTML = '<p class="how">' + intro + '</p><div class="btnrow">' +
    '<button class="btn" data-a="L">Trái</button><button class="btn" data-a="R">Phải</button><button class="btn" data-a="C">Cả hai</button>' +
    '<button class="btn" data-a="S">Quét tần số</button><button class="btn" data-a="X">Dừng</button></div><p class="hint" id="t-st"></p>' + levelPicker(api);
  const st = el.querySelector('#t-st');
  el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
    const ac = audioCtx();
    if (!ac) { st.textContent = 'Trình duyệt không hỗ trợ phát âm thanh.'; return; }
    stopNodes();
    const t = ac.currentTime + 0.05, a = b.dataset.a;
    if (a === 'L') { for (let k = 0; k < 3; k++) beep(ac, 520, -1, t + k * 0.45, 0.3); st.textContent = 'Đang phát bên trái (âm trầm).'; }
    if (a === 'R') { for (let k = 0; k < 3; k++) beep(ac, 980, 1, t + k * 0.45, 0.3); st.textContent = 'Đang phát bên phải (âm cao).'; }
    if (a === 'C') { beep(ac, 440, 0, t, 1.2, 'triangle'); beep(ac, 660, 0, t + 1.3, 1.2, 'triangle'); st.textContent = 'Đang phát cả hai bên.'; }
    if (a === 'S') {
      const o = ac.createOscillator(), g = ac.createGain();
      o.frequency.setValueAtTime(30, t); o.frequency.exponentialRampToValueAtTime(16000, t + 12);
      g.gain.setValueAtTime(0.35, t); g.gain.setValueAtTime(0.35, t + 11.8); g.gain.linearRampToValueAtTime(0, t + 12);
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 12.1); live.nodes.push(o);
      st.textContent = 'Đang quét 30 Hz → 16 kHz trong 12 giây.';
    }
    if (a === 'X') st.textContent = '';
  });
  bindPicker(el, api);
  function stopNodes() { live.nodes.forEach(n => { try { n.stop(); } catch (e) {} }); live.nodes = []; }
}
TOOLS.speaker = (el, api) => audioTool(el, api, 'speaker');
TOOLS.audio = (el, api) => audioTool(el, api, 'headphones');

TOOLS.noise = (el, api) => {
  el.innerHTML = '<p class="how">Phát tiếng ồn trầm (giống tiếng động cơ, quạt) ra loa điện thoại, để cách tai khoảng 30 cm. Đeo tai nghe, bật và tắt chống ồn: khi bật, tiếng ồn phải nhỏ đi rõ rệt và đều ở hai tai, không có tiếng rít hay ù.</p>' +
    '<div class="btnrow"><button class="btn primary" id="t-on">Phát tiếng ồn</button><button class="btn" id="t-off">Dừng</button></div>' + levelPicker(api);
  el.querySelector('#t-on').onclick = () => {
    const ac = audioCtx(); if (!ac) return;
    live.nodes.forEach(n => { try { n.stop(); } catch (e) {} }); live.nodes = [];
    const len = ac.sampleRate * 3, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; }
    const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
    const g = ac.createGain(); g.gain.value = 0.9; src.connect(g); g.connect(ac.destination); src.start(); live.nodes.push(src);
  };
  el.querySelector('#t-off').onclick = () => { live.nodes.forEach(n => { try { n.stop(); } catch (e) {} }); live.nodes = []; };
  bindPicker(el, api);
};

// ---------- Micro ----------
TOOLS.mic = (el, api) => {
  const hp = api.ctx.cat.id === 'headphones';
  el.innerHTML = '<p class="how">' + (hp
    ? 'Kết nối tai nghe với điện thoại của bạn. Với AirPods: Cài đặt › Bluetooth › (i) › Micrô, chọn "Luôn dùng AirPods trái", ghi âm thử, rồi chọn "Luôn dùng AirPods phải" và ghi lại. Nói bình thường, nghe lại phải rõ, không rè.'
    : 'Ghi âm 5 giây bằng micro của máy đang kiểm rồi nghe lại. Thanh mức phải nhảy theo giọng nói. Thử thêm app Ghi âm và quay video để kiểm các micro còn lại.') +
    '</p><div class="meter"><i id="t-lv"></i></div><div class="btnrow"><button class="btn primary" id="t-rec">Ghi âm 5 giây</button></div><p class="hint" id="t-st"></p><audio id="t-au" controls hidden style="width:100%"></audio>' + levelPicker(api);
  const st = el.querySelector('#t-st'), lv = el.querySelector('#t-lv'), au = el.querySelector('#t-au');
  el.querySelector('#t-rec').onclick = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw { name: 'NotSupported', message: 'trình duyệt không hỗ trợ' };
      if (live.stream) live.stream.getTracks().forEach(t => t.stop());
      live.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ac = audioCtx(), an = ac.createAnalyser(); an.fftSize = 1024;
      const srcN = ac.createMediaStreamSource(live.stream); srcN.connect(an); live.nodes.push(srcN);
      const data = new Uint8Array(an.fftSize);
      const tick = () => {
        if (!live.stream) return;
        an.getByteTimeDomainData(data);
        let m = 0; for (let i = 0; i < data.length; i++) m = Math.max(m, Math.abs(data[i] - 128));
        lv.style.width = Math.min(100, m / 1.28) + '%';
        live.timers.push(setTimeout(tick, 60));
      };
      tick();
      if (!window.MediaRecorder) { st.textContent = 'Trình duyệt không ghi âm được, chỉ xem được mức âm.'; return; }
      const chunks = [];
      live.rec = new MediaRecorder(live.stream);
      live.rec.ondataavailable = e => chunks.push(e.data);
      live.rec.onstop = () => {
        const blob = new Blob(chunks, { type: live.rec.mimeType || 'audio/mp4' });
        au.src = URL.createObjectURL(blob); au.hidden = false; st.textContent = 'Nghe lại bản ghi:';
        if (live.stream) { live.stream.getTracks().forEach(t => t.stop()); live.stream = null; }
        lv.style.width = '0';
      };
      live.rec.start(); st.textContent = 'Đang ghi... nói vài câu.';
      live.timers.push(setTimeout(() => { if (live.rec && live.rec.state === 'recording') live.rec.stop(); }, 5000));
    } catch (err) { st.textContent = blockedMsg(err, 'micro'); }
  };
  bindPicker(el, api);
};

// ---------- Cảm biến, rung ----------
TOOLS.sensors = (el, api) => {
  el.innerHTML = '<p class="how">Xoay và nghiêng máy: các số phải đổi mượt, kim la bàn quay theo. Xoay ngang máy để thử tự xoay màn hình (cần tắt khoá xoay).</p>' +
    '<div class="compass"><i id="t-nd"></i></div><dl class="kv"><dt>Hướng</dt><dd id="t-h">—</dd><dt>Nghiêng trước sau</dt><dd id="t-b">—</dd><dt>Nghiêng trái phải</dt><dd id="t-g">—</dd><dt>Chiều màn hình</dt><dd id="t-o">—</dd></dl>' +
    '<div class="btnrow"><button class="btn primary" id="t-go">Bật cảm biến</button><button class="btn" id="t-vb">Thử rung</button></div><p class="hint" id="t-st"></p>' + levelPicker(api);
  const st = el.querySelector('#t-st');
  const or = () => { el.querySelector('#t-o').textContent = innerWidth > innerHeight ? 'Ngang' : 'Dọc'; };
  or(); listen(window, 'resize', or);
  el.querySelector('#t-go').onclick = async () => {
    try {
      if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const r = await DeviceOrientationEvent.requestPermission();
        if (r !== 'granted') throw { name: 'NotAllowedError' };
      }
      if (!('DeviceOrientationEvent' in window)) { st.textContent = 'Thiết bị này không có cảm biến hướng.'; return; }
      let got = false;
      listen(window, 'deviceorientation', e => {
        got = true;
        const h = e.webkitCompassHeading != null ? e.webkitCompassHeading : (e.alpha != null ? 360 - e.alpha : null);
        el.querySelector('#t-h').textContent = h != null ? Math.round(h) + '°' : '—';
        el.querySelector('#t-b').textContent = e.beta != null ? Math.round(e.beta) + '°' : '—';
        el.querySelector('#t-g').textContent = e.gamma != null ? Math.round(e.gamma) + '°' : '—';
        if (h != null) el.querySelector('#t-nd').style.transform = 'rotate(' + (-h) + 'deg)';
      });
      live.timers.push(setTimeout(() => { if (!got) st.textContent = 'Không nhận được dữ liệu cảm biến. Trong Claude, trang bị chặn cảm biến: hãy mở bản web.'; }, 1500));
    } catch (err) { st.textContent = blockedMsg(err, 'cảm biến chuyển động'); }
  };
  el.querySelector('#t-vb').onclick = () => {
    const ok = navigator.vibrate && navigator.vibrate([250, 120, 250, 120, 500]);
    st.textContent = ok ? 'Máy phải rung 3 nhịp.' : 'Trình duyệt không cho điều khiển rung (iPhone luôn chặn). Thử bằng cần gạt im lặng, nút Tác vụ hoặc gọi đến.';
  };
  bindPicker(el, api);
};

// ---------- Camera ----------
TOOLS.camera = (el, api) => {
  const zoom = api.ctx.model && api.ctx.model.zoom ? ' Máy này có các mức ' + api.ctx.model.zoom.join(', ') + ': thử từng mức trong app Camera.' : '';
  el.innerHTML = '<p class="how">Xem trực tiếp từng camera mà trình duyệt nhìn thấy. Mỗi camera phải lên hình nét, không đốm, không đen.' + zoom + '</p>' +
    '<video class="video" id="t-v" playsinline muted autoplay></video><div class="btnrow" id="t-list"></div><p class="hint" id="t-st"></p>' + levelPicker(api);
  const v = el.querySelector('#t-v'), list = el.querySelector('#t-list'), st = el.querySelector('#t-st');
  const start = async (constraints) => {
    try {
      if (live.stream) live.stream.getTracks().forEach(t => t.stop());
      live.stream = await navigator.mediaDevices.getUserMedia({ video: constraints, audio: false });
      v.srcObject = live.stream;
      const devs = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'videoinput');
      const cur = live.stream.getVideoTracks()[0];
      st.textContent = 'Đang xem: ' + (cur && cur.label ? cur.label : 'camera') + ' · trình duyệt thấy ' + devs.length + ' camera.';
      list.innerHTML = devs.map((d, k) => '<button class="btn" data-dev="' + esc(d.deviceId) + '">' + esc(d.label || 'Camera ' + (k + 1)) + '</button>').join('');
      list.querySelectorAll('[data-dev]').forEach(b => b.onclick = () => start({ deviceId: { exact: b.dataset.dev } }));
    } catch (err) { st.textContent = blockedMsg(err, 'camera'); }
  };
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) st.textContent = 'Trình duyệt không hỗ trợ camera.';
  else start({ facingMode: 'environment' });
  bindPicker(el, api);
};

// ---------- Pin, sạc ----------
TOOLS.battery = (el, api) => {
  el.innerHTML = '<p class="how">Cắm sạc rồi xem trạng thái đổi sang "Đang sạc". Lắc nhẹ đầu cáp: trạng thái không được nhảy qua lại.</p><dl class="kv"><dt>Mức pin</dt><dd id="t-l">—</dd><dt>Trạng thái</dt><dd id="t-c">—</dd></dl><p class="hint" id="t-st"></p>' + levelPicker(api);
  const st = el.querySelector('#t-st');
  if (!navigator.getBattery) { st.textContent = 'Trình duyệt này (Safari trên iPhone) không cho web đọc pin. Xem biểu tượng tia sét trên thanh trạng thái khi cắm sạc.'; bindPicker(el, api); return; }
  navigator.getBattery().then(b => {
    let flips = 0, last = b.charging;
    const up = () => {
      if (b.charging !== last) { flips++; last = b.charging; }
      el.querySelector('#t-l').textContent = Math.round(b.level * 100) + '%';
      el.querySelector('#t-c').textContent = (b.charging ? 'Đang sạc' : 'Không sạc') + (flips > 2 ? ' · chập chờn (' + flips + ' lần đổi)' : '');
    };
    up(); listen(b, 'chargingchange', up); listen(b, 'levelchange', up);
  }).catch(err => { st.textContent = blockedMsg(err, 'thông tin pin'); });
  bindPicker(el, api);
};

// ---------- Độ chai pin tai nghe ----------
function drainCalc(hours, minutes, l0, l1, r0, r1) {
  const exp = minutes / (hours * 60) * 100;
  const side = (a, b) => { if (a == null || b == null || isNaN(a) || isNaN(b)) return null; const d = a - b; return d > 0 ? { drop: d, health: Math.min(1.2, exp / d) } : { drop: d, health: null }; };
  const L = side(l0, l1), R = side(r0, r1);
  const hs = [L, R].filter(x => x && x.health != null).map(x => x.health);
  if (!hs.length) return { exp, L, R, level: null };
  const worst = Math.min(...hs);
  let level = worst >= 0.8 ? 'ok' : worst >= 0.6 ? 'mid' : 'low';
  if (L && R && L.drop > 0 && R.drop > 0 && Math.max(L.drop, R.drop) / Math.min(L.drop, R.drop) >= 1.5 && level !== 'low') level = 'uneven';
  return { exp, L, R, worst, level };
}
TOOLS.drain = (el, api) => {
  const m = api.ctx.model, t = api.insp.tools.drain || {};
  const over = m && m.form === 'over';
  const v = (k, d) => (t[k] != null ? t[k] : d);
  el.innerHTML = '<p class="how">Sạc đầy, bật chống ồn nếu có, nghe nhạc 50% âm lượng đúng ' + v('min', 20) + ' phút. Ghi phần trăm từng tai trước và sau (widget Pin hoặc giữ hộp gần iPhone). Phần trăm chỉ là số làm tròn nên kết quả là ước lượng để sàng lọc.' + (over ? ' Tai nghe chụp tai pin lớn: thử 20 phút sai số cao, nên thử lâu hơn.' : '') + '</p>' +
    '<div class="grid2"><div class="field"><label for="d-h">Giờ nghe công bố</label><input class="inp mono" id="d-h" inputmode="decimal" value="' + esc(v('hours', (m && m.hours) || 6)) + '"></div><div class="field"><label for="d-m">Thời gian thử (phút)</label><input class="inp mono" id="d-m" inputmode="numeric" value="' + esc(v('min', 20)) + '"></div></div>' +
    '<div class="grid2"><div class="field"><label for="d-l0">' + (over ? 'Pin lúc đầu' : 'Trái lúc đầu') + ' (%)</label><input class="inp mono" id="d-l0" inputmode="numeric" value="' + esc(v('l0', '')) + '"></div><div class="field"><label for="d-l1">' + (over ? 'Pin lúc sau' : 'Trái lúc sau') + ' (%)</label><input class="inp mono" id="d-l1" inputmode="numeric" value="' + esc(v('l1', '')) + '"></div></div>' +
    (over ? '' : '<div class="grid2"><div class="field"><label for="d-r0">Phải lúc đầu (%)</label><input class="inp mono" id="d-r0" inputmode="numeric" value="' + esc(v('r0', '')) + '"></div><div class="field"><label for="d-r1">Phải lúc sau (%)</label><input class="inp mono" id="d-r1" inputmode="numeric" value="' + esc(v('r1', '')) + '"></div></div>') +
    '<div id="d-out"></div>' + levelPicker(api);
  const num = id => { const x = el.querySelector('#' + id); return x && x.value !== '' ? parseFloat(x.value.replace(',', '.')) : null; };
  const calc = () => {
    const d = { hours: num('d-h'), min: num('d-m'), l0: num('d-l0'), l1: num('d-l1'), r0: num('d-r0'), r1: num('d-r1') };
    api.patch(insp => { insp.tools.drain = d; });
    const out = el.querySelector('#d-out');
    if (!d.hours || !d.min) { out.innerHTML = ''; return; }
    const r = drainCalc(d.hours, d.min, d.l0, d.l1, d.r0, d.r1);
    const fmt = s => !s ? '—' : s.health == null ? 'không tụt (thử lâu hơn)' : 'tụt ' + s.drop + '% → còn khoảng ' + Math.round(s.health * 100) + '%';
    out.innerHTML = '<div class="note ' + (r.level === 'ok' ? 'tone-pass' : r.level ? 'tone-warn' : 'tone-info') + '">Tai khoẻ sẽ tụt khoảng <b>' + r.exp.toFixed(1) + '%</b> sau ' + d.min + ' phút.<br>' +
      (over ? 'Pin: ' + fmt(r.L) : 'Trái: ' + fmt(r.L) + '<br>Phải: ' + fmt(r.R)) +
      (r.level === 'uneven' ? '<br>Hai bên tụt lệch nhau từ 1,5 lần trở lên.' : '') + '</div>';
    el.querySelectorAll('[data-pick]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.pick === r.level)));
  };
  el.querySelectorAll('input').forEach(i => i.addEventListener('input', calc));
  calc();
  bindPicker(el, api);
};

// ---------- AirPods ----------
TOOLS.airpods = (el, api) => {
  const t = api.insp.tools.airpods || {};
  el.innerHTML = '<p class="how">Số model in rất nhỏ ở mặt trong mỗi tai (chỗ áp vào tai) và dưới nắp hộp sạc, dạng A1234. Soi bằng đèn pin, chụp ảnh rồi phóng to cho dễ đọc. Apple không nói số nào là tai trái hay phải, nên app chỉ kiểm cả bộ có cùng một đời không.</p>' +
    '<div class="grid2"><div class="field"><label for="a-l">Tai trái</label><input class="inp mono" id="a-l" autocapitalize="characters" placeholder="A3047" value="' + esc(t.l || '') + '"></div><div class="field"><label for="a-r">Tai phải</label><input class="inp mono" id="a-r" autocapitalize="characters" placeholder="A3048" value="' + esc(t.r || '') + '"></div></div>' +
    '<div class="field"><label for="a-c">Hộp sạc</label><input class="inp mono" id="a-c" autocapitalize="characters" placeholder="A2968" value="' + esc(t.c || '') + '"></div><div id="a-out"></div>' + levelPicker(api);
  const run = () => {
    const l = el.querySelector('#a-l').value.trim(), r = el.querySelector('#a-r').value.trim(), c = el.querySelector('#a-c').value.trim();
    api.patch(insp => { insp.tools.airpods = { l, r, c }; });
    const res = checkAirpodsSet(l, r, c), out = el.querySelector('#a-out');
    if (!res) { out.innerHTML = ''; return; }
    out.innerHTML = '<div class="note tone-' + res.verdict.tone + '">' + esc(res.verdict.text) + '</div><dl class="kv">' + res.rows.map(x => '<dt>' + x.label + ' ' + esc(x.value) + '</dt><dd>' + (x.names.length ? esc(x.names.join(', ')) : 'không có trong danh sách') + '</dd>').join('') + '</dl>' +
      (res.ids.length === 1 && res.ids[0] !== api.insp.model ? '<button class="btn" id="a-set">Đặt máy là ' + esc(getModel(api.ctx.cat, res.ids[0]).name) + '</button>' : '');
    const set = out.querySelector('#a-set');
    if (set) set.onclick = () => { api.patch(insp => { insp.model = res.ids[0]; }); api.toast('Đã đổi model'); run(); };
    const lv = res.verdict.tone === 'pass' ? 'ok' : res.verdict.tone === 'warn' ? 'mixed' : 'bad';
    el.querySelectorAll('[data-pick]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.pick === lv)));
  };
  el.querySelectorAll('input').forEach(i => i.addEventListener('input', run));
  run();
  bindPicker(el, api);
};

// ---------- Đọc ảnh máy ảnh ----------
TOOLS.exif = (el, api) => {
  el.innerHTML = '<p class="how">Nhờ người bán chụp một tấm JPEG mới (không phải RAW) rồi gửi bạn <b>file gốc</b>: AirDrop, cáp, hoặc gửi dạng tệp. Ảnh gửi qua Zalo, Messenger, Telegram dạng ảnh bị xoá thông tin. Ảnh được đọc ngay trên máy bạn, không tải lên đâu cả.</p>' +
    '<div class="field"><label for="x-f">Chọn ảnh JPEG</label><input class="inp" type="file" id="x-f" accept="image/jpeg,.jpg,.jpeg"></div><div id="x-out"></div>';
  const out = el.querySelector('#x-out');
  el.querySelector('#x-f').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    out.innerHTML = '<p class="hint">Đang đọc…</p>';
    try {
      const buf = await f.slice(0, 1 << 20).arrayBuffer();
      const r = parseCameraJpeg(buf);
      if (r.error) { out.innerHTML = '<div class="note tone-warn">' + esc(r.error) + '</div>'; return; }
      const cat = api.ctx.cat, mid = r.catalogId, cm = mid ? getModel(cat, mid) : null;
      const curM = api.ctx.model;
      const serial = r.makerSerial || r.bodySerial;
      const rated = ratedShutter(cm || curM);
      let html = '<dl class="kv"><dt>Hãng, đời máy</dt><dd>' + esc((r.make || '?') + ' ' + (r.model || '')) + '</dd>' +
        '<dt>Số sê-ri trong ảnh</dt><dd>' + esc(serial || 'không có') + (r.makerSerial && r.bodySerial && r.makerSerial !== r.bodySerial ? ' (EXIF: ' + esc(r.bodySerial) + ')' : '') + '</dd>' +
        (r.lens ? '<dt>Ống kính</dt><dd>' + esc(r.lens) + (r.lensSerial ? ' · sê-ri ' + esc(r.lensSerial) : '') + '</dd>' : '') +
        (r.date ? '<dt>Ngày chụp</dt><dd>' + esc(r.date) + '</dd>' : '') +
        (r.software ? '<dt>Firmware</dt><dd>' + esc(r.software) + '</dd>' : '') +
        '<dt>Số lần chụp</dt><dd>' + (r.shutter ? '<b>' + r.shutter.value.toLocaleString('vi-VN') + '</b> (' + ({ total: 'tổng số lần chụp', mech: 'màn trập cơ', images: 'số ảnh, không thuần cơ học' }[r.shutter.kind]) + ')' : 'không đọc được') + '</dd>' +
        (r.mechCount ? '<dt>Riêng màn trập cơ</dt><dd>' + r.mechCount.toLocaleString('vi-VN') + '</dd>' : '') + '</dl>';
      if (r.shutter) {
        const p = r.shutter.value / rated.n;
        html += '<div class="note ' + (p < 0.7 ? 'tone-pass' : 'tone-warn') + '">Đã dùng khoảng <b>' + Math.round(p * 100) + '%</b> độ bền ' + rated.n.toLocaleString('vi-VN') + ' lần (' + (rated.src === 'hãng' ? 'hãng công bố' : rated.src === 'phụ' ? 'nguồn thứ cấp' : 'ước tính theo phân khúc') + ').</div>';
      }
      r.notes.forEach(n => { html += '<div class="note tone-info">' + esc(n) + '</div>'; });
      if (curM && mid && mid !== curM.id) html += '<div class="note tone-stop"><b>Ảnh từ ' + esc(cm.name) + '</b>, nhưng phiếu đang ghi ' + esc(curM.name) + '. Ảnh có thể không chụp từ máy đang bán.</div>';
      if (serial && api.insp.info.serial && api.insp.info.serial.replace(/\s/g, '') !== serial.replace(/\s/g, '')) html += '<div class="note tone-warn">Sê-ri trong ảnh khác sê-ri bạn ghi ở Thông tin (' + esc(api.insp.info.serial) + '). ' + (r.brand === 'fujifilm' ? 'Fujifilm ghi số nội bộ, chuyện này bình thường.' : 'Kiểm tra lại tem dưới đáy máy.') + '</div>';
      html += '<div class="btnrow">' + (cm && (!curM || curM.id !== mid) ? '<button class="btn" id="x-m">Đặt máy là ' + esc(cm.name) + '</button>' : '') +
        (r.shutter ? '<button class="btn primary" id="x-s">Ghi số chụp vào phiếu</button>' : '') +
        (serial && !api.insp.info.serial ? '<button class="btn" id="x-n">Ghi sê-ri vào Thông tin</button>' : '') + '</div>';
      out.innerHTML = html;
      const b1 = out.querySelector('#x-m'), b2 = out.querySelector('#x-s'), b3 = out.querySelector('#x-n');
      if (b1) b1.onclick = () => { api.patch(i => { i.model = mid; }); api.toast('Đã đặt model ' + cm.name); b1.remove(); };
      if (b2) b2.onclick = () => {
        api.patch(i => {
          i.inputs.shutter = r.shutter.value;
          const c2 = buildContext(i), it = CAMERA.items.find(x => x.id === 'cm.shutter');
          i.answers['cm.shutter'] = it.input.auto(r.shutter.value, c2);
          i.tools.exif = { make: r.make, model: r.model, serial, shutter: r.shutter.value, kind: r.shutter.kind };
        });
        api.toast('Đã ghi số chụp'); api.close();
      };
      if (b3) b3.onclick = () => { api.patch(i => { i.info.serial = serial; }); api.toast('Đã ghi sê-ri'); b3.remove(); };
    } catch (err) { out.innerHTML = '<div class="note tone-warn">Không đọc được ảnh: ' + esc(err.message) + '</div>'; }
  };
};

// ---------- Phân tích ảnh: bụi cảm biến và điểm nóng ----------
async function loadBitmap(file) {
  if (window.createImageBitmap) { try { return await createImageBitmap(file); } catch (e) {} }
  return await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error('không giải mã được ảnh')); im.src = URL.createObjectURL(file); });
}

function findDust(gray, W, H) {
  const r = Math.max(8, Math.round(Math.max(W, H) / 45));
  const I = new Float64Array((W + 1) * (H + 1));
  for (let y = 0; y < H; y++) { let row = 0; for (let x = 0; x < W; x++) { row += gray[y * W + x]; I[(y + 1) * (W + 1) + x + 1] = I[y * (W + 1) + x + 1] + row; } }
  const box = (x, y) => {
    const x0 = Math.max(0, x - r), y0 = Math.max(0, y - r), x1 = Math.min(W, x + r + 1), y1 = Math.min(H, y + r + 1);
    return (I[y1 * (W + 1) + x1] - I[y0 * (W + 1) + x1] - I[y1 * (W + 1) + x0] + I[y0 * (W + 1) + x0]) / ((x1 - x0) * (y1 - y0));
  };
  const mask = new Uint8Array(W * H);
  let bright = 0;
  for (let y = r; y < H - r; y++) for (let x = r; x < W - r; x++) {
    const bg = box(x, y); bright += bg;
    if (bg - gray[y * W + x] > Math.max(4, bg * 0.03)) mask[y * W + x] = 1;
  }
  const meanBg = bright / Math.max(1, (W - 2 * r) * (H - 2 * r));
  const seen = new Uint8Array(W * H), spots = [], stack = [];
  const maxArea = W * H / 300;
  for (let i = 0; i < W * H; i++) {
    if (!mask[i] || seen[i]) continue;
    let n = 0, sx = 0, sy = 0, minx = W, maxx = 0, miny = H, maxy = 0;
    stack.push(i); seen[i] = 1;
    while (stack.length) {
      const j = stack.pop(), x = j % W, y = (j / W) | 0;
      n++; sx += x; sy += y; if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y;
      const nb = [j - 1, j + 1, j - W, j + W];
      for (const k of nb) if (k >= 0 && k < W * H && mask[k] && !seen[k] && Math.abs((k % W) - x) <= 1) { seen[k] = 1; stack.push(k); }
    }
    const w = maxx - minx + 1, h = maxy - miny + 1;
    if (n >= 5 && n <= maxArea && w / h < 4 && h / w < 4 && n / (w * h) > 0.3) spots.push({ x: sx / n, y: sy / n, rad: Math.max(w, h) / 2, n });
  }
  return { spots, meanBg, r };
}

function grayFrom(img, maxSide) {
  const W0 = img.width, H0 = img.height, s = Math.min(1, maxSide / Math.max(W0, H0));
  const W = Math.round(W0 * s), H = Math.round(H0 * s);
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0, W, H);
  const d = g.getImageData(0, 0, W, H).data, gray = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) gray[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
  return { cv, g, gray, W, H };
}

TOOLS.dust = (el, api) => {
  el.innerHTML = '<p class="how">Đặt khẩu nhỏ nhất (f/16–f/22), lấy nét tay ở vô cực, chụp tường trắng hoặc bầu trời không mây, hơi lia máy khi chụp để tường không có hoa văn. Bụi hiện thành đốm mờ tròn, cố định. App tìm đốm tối hơn nền xung quanh.</p>' +
    '<div class="field"><label for="u-f">Chọn ảnh tường trắng</label><input class="inp" type="file" id="u-f" accept="image/*"></div><div id="u-out"></div>' + levelPicker(api);
  const out = el.querySelector('#u-out');
  el.querySelector('#u-f').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    out.innerHTML = '<p class="hint">Đang phân tích…</p>';
    try {
      const img = await loadBitmap(f);
      const { cv, g, gray, W, H } = grayFrom(img, 1400);
      const { spots, meanBg } = findDust(gray, W, H);
      g.lineWidth = Math.max(2, W / 400); g.strokeStyle = '#ff2d55';
      spots.forEach(s => { g.beginPath(); g.arc(s.x, s.y, Math.max(8, s.rad * 2.2), 0, Math.PI * 2); g.stroke(); });
      cv.className = 'canvasbox';
      const lv = spots.length === 0 ? 'ok' : spots.length <= 6 ? 'minor' : 'major';
      out.innerHTML = '<div class="note ' + (lv === 'ok' ? 'tone-pass' : 'tone-warn') + '">Tìm thấy <b>' + spots.length + '</b> đốm' + (meanBg < 120 ? '. Ảnh hơi tối, nên chụp sáng hơn để dễ thấy bụi.' : '.') + ' Đốm ở cùng chỗ trên nhiều ảnh mới chắc là bụi; đốm theo vật thể là vết trên tường.</div>';
      out.appendChild(cv);
      el.querySelectorAll('[data-pick]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.pick === lv)));
      api.patch(i => { i.tools.dust = { spots: spots.length }; });
    } catch (err) { out.innerHTML = '<div class="note tone-warn">Không phân tích được: ' + esc(err.message) + '</div>'; }
  };
  bindPicker(el, api);
};

function scanHot(img, thr) {
  const W = img.width, H = img.height, T = 1024;
  const cv = document.createElement('canvas'); cv.width = T; cv.height = T;
  const g = cv.getContext('2d', { willReadFrequently: true });
  const hot = [], colN = new Uint32Array(W), rowN = new Uint32Array(H);
  let sum = 0, cnt = 0;
  for (let ty = 0; ty < H; ty += T - 2) for (let tx = 0; tx < W; tx += T - 2) {
    const w = Math.min(T, W - tx), h = Math.min(T, H - ty);
    g.clearRect(0, 0, T, T); g.drawImage(img, tx, ty, w, h, 0, 0, w, h);
    const d = g.getImageData(0, 0, w, h).data;
    const L = i => Math.max(d[i], d[i + 1], d[i + 2]);
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4, v = L(i);
      if ((x & 7) === 0 && (y & 7) === 0) { sum += v; cnt++; }
      if (v < thr) continue;
      const gx = tx + x, gy = ty + y;
      if ((tx > 0 && x === 1) || (ty > 0 && y === 1)) continue;
      colN[gx]++; rowN[gy]++;
      const nb = (L(i - 4) + L(i + 4) + L(i - w * 4) + L(i + w * 4)) / 4;
      if (nb < v * 0.6 && hot.length < 5000) hot.push([gx, gy, v]);
    }
  }
  const lineCols = [], lineRows = [];
  colN.forEach((n, x) => { if (n > H * 0.25) lineCols.push(x); });
  rowN.forEach((n, y) => { if (n > W * 0.25) lineRows.push(y); });
  // điểm nằm trên hàng/cột lỗi không tính là điểm nóng lẻ
  const lc = new Set(lineCols), lr = new Set(lineRows);
  const near = (set, v) => set.has(v) || set.has(v - 1) || set.has(v + 1);
  const single = hot.filter(([x, y]) => !near(lc, x) && !near(lr, y));
  return { W, H, hot: single, lineCols, lineRows, mean: cnt ? sum / cnt : 0 };
}

TOOLS.hotpixel = (el, api) => {
  el.innerHTML = '<p class="how">Đậy nắp ống kính, ISO 1600–3200, tốc độ 1 giây, tắt "Giảm nhiễu phơi sáng lâu", chụp JPEG chất lượng cao nhất. Ảnh phải gần như đen. Điểm sáng lẻ là điểm nóng; vài điểm là bình thường. Cả hàng hay cột sáng là cảm biến lỗi.</p>' +
    '<div class="field"><label for="h-f">Chọn ảnh đen (đậy nắp)</label><input class="inp" type="file" id="h-f" accept="image/*"></div><div id="h-out"></div>' + levelPicker(api);
  const out = el.querySelector('#h-out');
  el.querySelector('#h-f').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    out.innerHTML = '<p class="hint">Đang quét từng điểm ảnh… (ảnh lớn mất vài giây)</p>';
    await new Promise(r => setTimeout(r, 30));
    try {
      const img = await loadBitmap(f);
      const res = scanHot(img, 70);
      // gom điểm gần nhau thành cụm
      const cell = 24, grid = new Map();
      res.hot.forEach(([x, y]) => { const k = ((x / cell) | 0) + ',' + ((y / cell) | 0); grid.set(k, (grid.get(k) || 0) + 1); });
      const clusters = [...grid.values()].filter(n => n >= 4).length;
      const n = res.hot.length;
      let lv = n <= 8 ? 'ok' : n <= 40 ? 'minor' : 'major';
      if (clusters) lv = 'major';
      if (res.lineCols.length || res.lineRows.length) lv = 'bad';
      // ảnh xem trước: thu nhỏ, đánh dấu điểm
      const s = Math.min(1, 1100 / Math.max(res.W, res.H));
      const cv = document.createElement('canvas'); cv.width = Math.round(res.W * s); cv.height = Math.round(res.H * s); cv.className = 'canvasbox';
      const g = cv.getContext('2d'); g.drawImage(img, 0, 0, cv.width, cv.height);
      g.strokeStyle = '#ff2d55'; g.lineWidth = 1.5;
      res.hot.slice(0, 600).forEach(([x, y]) => { g.beginPath(); g.arc(x * s, y * s, 5, 0, Math.PI * 2); g.stroke(); });
      g.fillStyle = 'rgba(255,45,85,.6)';
      res.lineCols.slice(0, 50).forEach(x => g.fillRect(x * s, 0, 2, cv.height));
      res.lineRows.slice(0, 50).forEach(y => g.fillRect(0, y * s, cv.width, 2));
      const warn = res.mean > 40 ? ' Ảnh chưa đủ tối (độ sáng trung bình ' + Math.round(res.mean) + '/255): đậy kín nắp và chụp lại.' : '';
      out.innerHTML = '<div class="note ' + (lv === 'ok' ? 'tone-pass' : lv === 'bad' ? 'tone-stop' : 'tone-warn') + '">Ảnh ' + res.W + '×' + res.H + ': <b>' + n + '</b> điểm sáng lẻ' + (clusters ? ', <b>' + clusters + '</b> cụm' : '') +
        (res.lineCols.length || res.lineRows.length ? ', <b>' + (res.lineCols.length + res.lineRows.length) + '</b> hàng/cột sáng' : '') + '.' + warn + ' Máy ảnh thường tự "ánh xạ" điểm nóng: chạy Vệ sinh cảm biến hoặc Pixel Mapping trong menu rồi chụp lại.</div>';
      out.appendChild(cv);
      el.querySelectorAll('[data-pick]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.pick === lv)));
      api.patch(i => { i.tools.hotpixel = { n, clusters, lines: res.lineCols.length + res.lineRows.length }; });
    } catch (err) { out.innerHTML = '<div class="note tone-warn">Không phân tích được: ' + esc(err.message) + '. Ảnh quá lớn với trình duyệt này thì thử ảnh JPEG cỡ nhỏ hơn (cỡ M).</div>'; }
  };
  bindPicker(el, api);
};

TOOLS.coverage = (el, api) => {
  el.innerHTML = '<p class="how">Mở trang tra bảo hành của Apple (không phải ô tìm kiếm của Apple Support), nhập số sê-ri. Kết quả phải ra đúng model; ngày mua hợp lệ phải khớp lời người bán.</p>' +
    (api.insp.info.serial ? '<p>Số sê-ri: <b class="mono">' + esc(api.insp.info.serial) + '</b></p>' : '') +
    '<div class="links"><a class="chiplink" href="https://checkcoverage.apple.com/" target="_blank" rel="noopener">checkcoverage.apple.com <svg class="ico sm"><use href="#i-ext"/></svg></a></div>' + levelPicker(api);
  bindPicker(el, api);
};
