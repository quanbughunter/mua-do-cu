// ===== Giao diện: vẽ các màn hình từ trạng thái =====

const BRAND_NAMES = { apple: 'Apple', samsung: 'Samsung', pixel: 'Google Pixel', xiaomi: 'Xiaomi', sony: 'Sony', bose: 'Bose', canon: 'Canon', nikon: 'Nikon', fujifilm: 'Fujifilm', other: 'Khác' };
const ITEM_LINKS = {
  'ph.blacklist': [['imei.info', 'https://www.imei.info/']],
  'ph.serial': [['checkcoverage.apple.com', 'https://checkcoverage.apple.com/']],
  'hp.serial': [['checkcoverage.apple.com', 'https://checkcoverage.apple.com/']],
  'cm.stolen': [['lenstag.com', 'https://www.lenstag.com/']]
};
const STORAGES = ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB'];
const TABS = [['info', 'Thông tin'], ['gates', 'Bắt buộc'], ['check', 'Kiểm tra'], ['result', 'Kết quả']];

const icon = (id, cls) => '<svg class="ico' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#i-' + id + '"/></svg>';
const toneOfLevel = l => l.ko ? 'stop' : l.f >= 0.95 ? 'pass' : l.f >= 0.5 ? 'warn' : 'stop';
const pct = x => Math.round(x * 100) + '%';

function moneyOf(v) { return fmtMoney(v, S.settings.currency); }
function sign(v) { return (v > 0 ? '−' : '+') + moneyOf(Math.abs(v)); }

function verdictBits(sc, v) {
  if (sc.ko.length) return { stamp: VERDICTS.stop.stamp, tone: 'stop' };
  if (v.verdict) return { stamp: v.verdict.stamp, tone: v.verdict.tone };
  if (sc.gatesPending.length) return { stamp: 'Chưa xong', tone: 'info' };
  return { stamp: 'Chưa có giá', tone: 'info' };
}

// ---------- Trang đầu ----------
function renderHome() {
  const list = S.list.slice().sort((a, b) => b.updated - a.updated);
  const slips = list.map(insp => {
    const sc = scoreInspection(insp), v = valuate(insp, S.settings, sc), c = sc.ctx, vb = verdictBits(sc, v);
    return '<button class="slip" data-act="open" data-id="' + insp.id + '">' +
      '<span class="nm">' + esc(c.model ? c.model.name : c.cat.name + ' (chưa chọn máy)') + (insp.info.storage ? ' · ' + esc(insp.info.storage) : '') + '</span>' +
      '<span class="meta">' + (insp.info.example ? '<span class="tag-ex">Ví dụ</span>' : '') + '<span>' + new Date(insp.updated).toLocaleDateString('vi-VN') + '</span><span>' + sc.counts.done + '/' + sc.counts.total + ' mục</span>' +
      (v.fair && !sc.ko.length ? '<span class="mono">' + moneyOf(v.fair) + '</span>' : '') + '</span>' +
      '<span class="right"><span class="score">' + (sc.score != null && !sc.ko.length ? Math.round(sc.score) + '<small>/100</small>' : '—') + '</span><span class="stamp sm c-' + vb.tone + '">' + esc(vb.stamp) + '</span></span></button>';
  }).join('');
  return '<header class="appbar"><div class="wrap row"><div class="ttl"><h1>Soi Đồ Cũ</h1><div class="sub">Kiểm, chấm điểm, ra giá đồ cũ trước khi trả tiền</div></div>' +
    '<button class="iconbtn" data-act="settings" aria-label="Cài đặt">' + icon('gear') + '</button></div></header>' +
    '<main class="wrap stack" style="padding-bottom:40px">' +
    '<section class="hero"><div class="brand">Soi <em>đồ cũ</em><br>trước khi trả tiền</div>' +
    '<p class="lede">Chọn máy, app sinh đúng danh sách cần kiểm. Kiểm xong từng mục thì ra điểm trên 100, giá hợp lý theo chi phí sửa, và câu trả lời: mua, trả giá hay bỏ.</p></section>' +
    '<div class="sect-h"><h2>Kiểm tra mới</h2></div><div class="cats">' +
    CATEGORIES.map(c => '<button class="cat" data-act="new" data-cat="' + c.id + '">' + icon(c.icon) + '<b>' + c.name + '</b><span>' + c.models.length + ' mẫu · ' + c.items.length + ' mục kiểm</span></button>').join('') + '</div>' +
    '<div class="sect-h"><h2>Phiếu đã lưu</h2><span class="prog">' + list.length + '</span></div>' +
    (slips || '<div class="empty">Chưa có phiếu nào. Chọn một loại ở trên để bắt đầu.</div>') +
    '<p class="hint">Phiếu lưu trên trình duyệt của máy này, không gửi đi đâu. Mở Cài đặt để đổi tiền tệ, tỷ giá và hệ số giá sửa.</p></main>';
}

// ---------- Màn kiểm tra ----------
function renderInsp(insp) {
  const sc = scoreInspection(insp), v = valuate(insp, S.settings, sc), c = sc.ctx;
  const nonGate = sc.rows.filter(r => !r.item.gate && !r.item.optional && !r.na);
  const tabCnt = {
    info: c.model ? (insp.info.ask ? 'đủ giá' : 'thiếu giá') : 'chọn máy',
    gates: sc.counts.gatesDone + '/' + sc.counts.gates,
    check: nonGate.filter(r => r.level).length + '/' + nonGate.length,
    result: sc.score != null && !sc.ko.length ? Math.round(sc.score) + ' điểm' : sc.ko.length ? 'loại' : ''
  };
  const title = c.model ? c.model.name : 'Chọn máy cần kiểm';
  const sub = c.cat.name + (insp.info.storage ? ' · ' + insp.info.storage : '') + (insp.info.example ? ' · phiếu ví dụ' : '');
  let html = '<header class="appbar"><div class="wrap"><div class="row">' +
    '<button class="iconbtn" data-act="home" aria-label="Về trang đầu">' + icon('back') + '</button>' +
    '<div class="ttl"><h1>' + esc(title) + '</h1><div class="sub">' + esc(sub) + '</div></div>' +
    '<button class="iconbtn" data-act="copyreport" aria-label="Sao chép phiếu">' + icon('copy') + '</button></div>' +
    '<nav class="tabs" role="tablist">' + TABS.map(([id, name]) =>
      '<button class="tab" role="tab" data-act="tab" data-tab="' + id + '" aria-selected="' + (S.ui.tab === id) + '"><span class="lb">' + name + '</span>' +
      '<span class="cnt' + (tabCnt[id] ? '' : ' none') + '">' + (tabCnt[id] || '·') + '</span>' + (id === 'gates' && sc.ko.length ? '<span class="dot" title="Có lỗi loại trực tiếp"></span>' : '') + '</button>').join('') +
    '</nav></div></header><main class="wrap stack">';
  if (S.ui.tab === 'info') html += renderInfo(insp, sc, v);
  else if (S.ui.tab === 'gates') html += renderGates(insp, sc);
  else if (S.ui.tab === 'check') html += renderCheck(insp, sc, v);
  else html += renderResult(insp, sc, v);
  html += '</main>' + renderTicket(sc, v);
  return html;
}

function renderTicket(sc, v) {
  const vb = verdictBits(sc, v);
  const ko = sc.ko.length > 0;
  return '<footer class="ticket"><button class="wrap row" data-act="tab" data-tab="result" aria-label="Xem kết quả">' +
    '<span class="sc">' + (sc.score != null && !ko ? Math.round(sc.score) + '<small>/100</small>' : '—') + '</span>' +
    '<span class="mid"><span class="k">' + (ko ? 'Lỗi loại trực tiếp' : 'Giá hợp lý') + '</span><span class="v" id="tk-v">' + (ko ? esc(textOf(sc.ko[0].item.t, sc.ctx)) : v.fair ? moneyOf(v.fair) : 'cần giá tham chiếu') + '</span></span>' +
    '<span class="stamp sm c-' + vb.tone + '">' + esc(vb.stamp) + '</span></button></footer>';
}

// ---------- Tab Thông tin ----------
function modelSelect(insp, c) {
  const groups = {};
  c.cat.models.forEach(m => { (groups[m.brand] = groups[m.brand] || []).push(m); });
  return '<div class="field"><label for="f-model">Máy cần kiểm</label><select class="inp" id="f-model" data-f="model"><option value="">— Chọn model —</option>' +
    Object.keys(groups).map(b => '<optgroup label="' + (BRAND_NAMES[b] || b) + '">' + groups[b].map(m => '<option value="' + m.id + '"' + (m.id === insp.model ? ' selected' : '') + '>' + esc(m.name) + (m.year ? ' (' + m.year + ')' : '') + '</option>').join('') + '</optgroup>').join('') +
    '</select></div>';
}

function decodePartHTML(c) {
  const p = c.part;
  if (!p) return '';
  if (!p.ok) return '<div class="decode tone-warn">' + esc(p.msg) + '</div>';
  const reg = [];
  if (p.regionModern) reg.push('bảng mới (từ iPhone 17 Pro): ' + p.regionModern);
  if (p.regionLegacy) reg.push('bảng cũ: ' + p.regionLegacy);
  const sim = c.simExpect === 'none' ? 'Chỉ eSIM, không có khay SIM' : c.simExpect === 'tray' ? 'Có khay SIM vật lý' : null;
  return '<div class="decode tone-' + (p.source.tone === 'pass' ? 'pass' : p.source.tone === 'warn' ? 'warn' : 'info') + '">' +
    '<span><b>' + esc(p.first) + '</b> · ' + esc(p.source.text) + (p.source.note ? '. ' + esc(p.source.note) : '') + '</span>' +
    '<span><b>' + esc(p.region) + '</b> · ' + (reg.length ? esc(reg.join('; ')) : 'mã vùng chưa có trong bảng') + '</span>' +
    (sim ? '<span><b>SIM</b> · ' + sim + '</span>' : '') + '</div>';
}
function decodeImeiHTML(v) {
  const r = checkIMEI(v);
  if (!r) return '';
  return '<div class="decode tone-' + (r.ok ? 'pass' : 'stop') + '">' + esc(r.msg) + '</div>';
}
function compsHTML(insp) {
  const st = compStats(insp.info.comps, S.settings.currency, S.settings);
  if (!st) return '<p class="hint">Mỗi dòng một giá, có thể kèm chữ: "74 000 ₽ pin 88%", "18,5tr", "$520". Giá khác tiền tệ được đổi theo tỷ giá trong Cài đặt.</p>';
  const out = st.items.filter(x => x.out).length;
  return '<div class="decode tone-info"><span>' + st.n + ' tin · trung vị <b class="mono">' + moneyOf(st.median) + '</b>' + (st.n >= 3 ? ' · khoảng giữa ' + moneyOf(st.p25) + ' – ' + moneyOf(st.p75) : '') + '</span>' +
    (out ? '<span>Bỏ ' + out + ' tin lệch xa (' + st.items.filter(x => x.out).map(x => moneyOf(x.value)).join(', ') + ')</span>' : '') +
    (st.n < 2 ? '<span>Cần ít nhất 2 tin để dùng làm giá tham chiếu.</span>' : '') + '</div>';
}
function refHTML(insp, c) {
  const r = referencePrice(insp, c, S.settings);
  return '<div class="note ' + (r.src === 'estimate' || r.src === 'none' ? 'tone-warn' : 'tone-pass') + '">Giá tham chiếu: <b class="mono">' + (r.value ? moneyOf(r.value) : '—') + '</b>. ' + esc(r.text) + '.</div>';
}

function renderInfo(insp, sc, v) {
  const c = sc.ctx, cat = c.cat, f = cat.fields, I = insp.info;
  const cur = CURRENCIES[S.settings.currency];
  let h = '';
  if (I.example) h += '<div class="note tone-info"><b>Phiếu ví dụ.</b> Số máy, pin, giá người bán lấy từ chiếc iPhone 17 Pro Max bạn xem hôm trước; giá tin rao là số minh hoạ. Sửa thoải mái, hoặc tạo phiếu mới ở trang đầu.</div>';
  h += '<section class="panel"><h3>Nhận dạng</h3>' + modelSelect(insp, c);
  if (cat.id === 'camera') h += '<div class="btnrow"><button class="toolbtn" data-act="tool" data-tool="exif" data-item="cm.shutter">' + icon('tool', 'sm') + 'Đọc ảnh chụp thử: model, sê-ri, số lần chụp</button></div>';
  if (cat.id === 'headphones' && c.brand === 'apple') h += '<div class="btnrow"><button class="toolbtn" data-act="tool" data-tool="airpods" data-item="hp.numbers">' + icon('tool', 'sm') + 'Đối chiếu số model in trên tai và hộp</button></div>';
  if (f.includes('storage')) h += '<div class="field"><label for="f-storage">Dung lượng</label><select class="inp" id="f-storage" data-f="info.storage"><option value="">—</option>' + STORAGES.map(s => '<option' + (I.storage === s ? ' selected' : '') + '>' + s + '</option>').join('') + '</select></div>';
  if (f.includes('partno') && c.brand === 'apple') h += '<div class="field"><label for="f-partno">Số máy (Cài đặt › Cài đặt chung › Giới thiệu)</label><input class="inp mono" id="f-partno" data-f="info.partno" data-live="partno" autocapitalize="characters" autocomplete="off" placeholder="MFYN4ZA/A" value="' + esc(I.partno || '') + '"><div id="d-partno">' + decodePartHTML(c) + '</div></div>';
  if (f.includes('imei')) h += '<div class="field"><label for="f-imei">IMEI (bấm *#06#)</label><input class="inp mono" id="f-imei" data-f="info.imei" data-live="imei" inputmode="numeric" autocomplete="off" placeholder="15 chữ số" value="' + esc(I.imei || '') + '"><div id="d-imei">' + decodeImeiHTML(I.imei) + '</div></div>';
  if (f.includes('serial')) h += '<div class="field"><label for="f-serial">Số sê-ri</label><input class="inp mono" id="f-serial" data-f="info.serial" autocapitalize="characters" autocomplete="off" value="' + esc(I.serial || '') + '"></div>';
  if (f.includes('lens')) h += '<div class="grid2 tight"><div class="field"><label for="f-lens">Ống kính bán kèm</label><input class="inp" id="f-lens" data-f="info.lens" placeholder="vd. RF-S 18-45mm" value="' + esc(I.lens || '') + '"></div><div class="field"><label for="f-lensv">Giá ống kính đó (nếu biết)</label><input class="inp mono" id="f-lensv" data-f="info.lensValue" inputmode="decimal" value="' + esc(I.lensValue || '') + '"></div></div>';
  if (f.includes('warranty')) h += '<div class="field"><label for="f-warr">Bảo hành đến</label><input class="inp" id="f-warr" data-f="info.warranty" placeholder="vd. 04/11/2026" value="' + esc(I.warranty || '') + '"></div>';
  h += '</section>';

  const q = c.model ? cat.searchQuery(c.model, insp) : '';
  h += '<section class="panel"><h3>Giá</h3>' +
    '<div class="field"><label for="f-ask">Người bán đòi (' + cur.symbol + ')</label><input class="inp mono" id="f-ask" data-f="info.ask" data-live="price" inputmode="decimal" autocomplete="off" value="' + esc(I.ask || '') + '"></div>' +
    '<div class="field"><label for="f-comps">Giá tin rao cùng model, cùng dung lượng, tình trạng đẹp</label><textarea class="inp mono" id="f-comps" data-f="info.comps" data-live="price" rows="4" placeholder="74 000\n78 000\n72 500">' + esc(I.comps || '') + '</textarea><div id="d-comps">' + compsHTML(insp) + '</div></div>' +
    (q ? '<div class="links">' + MARKET_LINKS.map(L => '<a class="chiplink" href="' + esc(L.url(q)) + '" target="_blank" rel="noopener">Tìm trên ' + L.name + icon('ext', 'sm') + '</a>').join('') + '</div>' : '') +
    '<div class="field"><label for="f-ref">Hoặc tự nhập giá tham chiếu (máy cũ đẹp, đủ chức năng)</label><input class="inp mono" id="f-ref" data-f="info.ref" data-live="price" inputmode="decimal" autocomplete="off" value="' + esc(I.ref || '') + '"></div>' +
    '<div id="d-ref">' + refHTML(insp, c) + '</div></section>';

  const ins = insights(insp, sc);
  if (ins.length) h += '<section class="stack">' + ins.map(n => '<div class="note tone-' + n.tone + '">' + esc(n.text) + '</div>').join('') + '</section>';
  h += '<div class="btnrow"><button class="btn primary" data-act="tab" data-tab="gates">Sang mục bắt buộc ' + icon('chev', 'sm') + '</button></div>';
  h += S.ui.confirmDel === insp.id
    ? '<div class="confirm"><span>Xoá phiếu này?</span><button class="btn danger" data-act="del" data-id="' + insp.id + '">Xoá</button><button class="btn" data-act="canceldel">Giữ lại</button></div>'
    : '<div><button class="linkbtn muted" data-act="askdel" data-id="' + insp.id + '">' + icon('trash', 'sm') + 'Xoá phiếu</button></div>';
  return h;
}

// ---------- Thẻ mục kiểm ----------
function itemCard(insp, r, c, totalEw, v) {
  const it = r.item, lvl = r.level;
  const t = textOf(it.t, c);
  const expanded = !lvl || S.ui.open[it.id] || r.na;
  const pts = r.ew && totalEw ? Math.round(r.ew / totalEw * 1000) / 10 : 0;
  const tag = it.gate ? 'bắt buộc' : it.optional ? 'nên làm' : pts ? '≈' + (pts >= 1 ? Math.round(pts) : pts) + ' điểm' : '';
  const cls = 'item' + (lvl ? ' done' : '') + (lvl && (lvl.ko || r.fault) ? ' bad' : '') + (r.na ? ' na' : '');
  if (!expanded) {
    return '<article class="' + cls + '" id="it-' + it.id + '"><div class="item-h"><h3>' + esc(t) + '</h3><span class="w">' + tag + '</span></div>' +
      '<div class="item-f"><button class="lv t-' + toneOfLevel(lvl) + '" aria-pressed="true" data-act="expand" data-id="' + it.id + '">' + esc(lvl.label) + '</button>' +
      (it.input && insp.inputs[it.input.key] != null ? '<span class="mono small muted">' + esc(insp.inputs[it.input.key]) + (it.input.unit ? ' ' + it.input.unit : '') + '</span>' : '') +
      '<button class="linkbtn" data-act="expand" data-id="' + it.id + '">Sửa</button></div></article>';
  }
  let h = '<article class="' + cls + '" id="it-' + it.id + '"><div class="item-h"><h3>' + esc(t) + '</h3><span class="w">' + tag + '</span></div>';
  const path = textOf(it.path, c);
  if (path) h += '<div class="path">' + esc(path) + '</div>';
  const how = textOf(it.how, c);
  if (how) h += '<p class="how">' + esc(how) + '</p>';
  const pass = textOf(it.pass, c);
  if (pass) h += '<p class="pass"><b>Đạt:</b> ' + esc(pass) + '</p>';
  if (ITEM_LINKS[it.id]) h += '<div class="links">' + ITEM_LINKS[it.id].map(([n, u]) => '<a class="chiplink" href="' + u + '" target="_blank" rel="noopener">' + n + icon('ext', 'sm') + '</a>').join('') + '</div>';
  if (r.na) return h + '<div class="item-f"><span class="small muted">Đã đánh dấu không áp dụng.</span><button class="linkbtn" data-act="na" data-id="' + it.id + '">Bỏ đánh dấu</button></div></article>';
  const ins = [it.input, it.input2].filter(x => x && (!x.when || x.when(c)));
  if (ins.length) {
    h += '<div class="inrow">' + ins.map(x => '<div class="field"><label for="in-' + x.key + '">' + esc(x.label) + '</label><div class="unit"><input class="inp mono" type="number" id="in-' + x.key + '" data-input="' + x.key + '" data-item="' + it.id + '" inputmode="numeric" min="' + x.min + '" max="' + x.max + '" value="' + esc(insp.inputs[x.key] != null ? insp.inputs[x.key] : '') + '">' + (x.unit ? '<span>' + esc(x.unit) + '</span>' : '') + '</div></div>').join('') + '</div>';
  }
  h += '<div class="levels" role="group" aria-label="Kết quả">' + it.levels.map(l =>
    '<button class="lv t-' + toneOfLevel(l) + '" data-act="level" data-id="' + it.id + '" data-lv="' + l.id + '" aria-pressed="' + (lvl && lvl.id === l.id) + '">' + esc(l.label) + '</button>').join('') + '</div>';
  if (lvl && lvl.note) h += '<div class="note lvnote tone-' + toneOfLevel(lvl) + '">' + esc(lvl.note) + '</div>';
  const foot = [];
  const tl = typeof it.tool === 'function' ? it.tool(c) : it.tool;
  if (tl && TOOLS[tl]) foot.push('<button class="toolbtn" data-act="tool" data-tool="' + tl + '" data-item="' + it.id + '">' + icon('tool', 'sm') + esc(TOOL_NAMES[tl]) + '</button>');
  else if (tl === 'partno' || tl === 'imei') foot.push('<button class="toolbtn" data-act="goinfo" data-focus="f-' + tl + '">' + icon('tool', 'sm') + esc(TOOL_NAMES[tl]) + '</button>');
  const cost = v && costHint(insp, it, r, c, v);
  if (cost) foot.push('<span class="small muted">' + cost + '</span>');
  if (lvl) foot.push('<button class="linkbtn muted" data-act="clear" data-id="' + it.id + '">Bỏ chọn</button>');
  if (!it.gate || it.optional) foot.push('<button class="linkbtn muted" data-act="na" data-id="' + it.id + '">Không áp dụng</button>');
  if (lvl && S.ui.open[it.id]) foot.push('<button class="linkbtn" data-act="collapse" data-id="' + it.id + '">Thu gọn</button>');
  if (foot.length) h += '<div class="item-f">' + foot.join('') + '</div>';
  return h + '</article>';
}

function costHint(insp, it, r, c, v) {
  if (!r.rule.fix || r.rule.axis === 'gate' || r.rule.axis === 'info' || r.rule.axis === 'extra') return '';
  const ref = v.ref.value;
  const bc = insp.costs[it.id] != null ? { value: insp.costs[it.id] } : baseCost(r.rule.fix, c, ref, S.settings, v.partsUSD);
  if (!bc || !bc.value) return '';
  return 'Nếu phải sửa: ~' + moneyOf(roundTo(bc.value, CURRENCIES[S.settings.currency].step));
}

function totalEwOf(sc) { return sc.rows.reduce((a, r) => a + (r.na ? 0 : r.ew), 0); }

// ---------- Tab Bắt buộc ----------
function renderGates(insp, sc) {
  const c = sc.ctx;
  if (!c.model) return '<div class="note tone-info">Chọn máy ở tab Thông tin trước, danh sách mục kiểm sẽ theo đúng đời máy.</div>' + renderGatesList(insp, sc);
  return renderGatesList(insp, sc);
}
function renderGatesList(insp, sc) {
  const c = sc.ctx, tot = totalEwOf(sc);
  let h = '';
  if (sc.ko.length) h += '<div class="ko-banner"><b>Không mua</b>' + sc.ko.map(k => '<span>' + esc(textOf(k.item.t, c)) + ': ' + esc(k.level.note || k.level.label) + '</span>').join('') + '</div>';
  h += '<p class="hint">Kiểm những mục này trước khi xem các mục khác. Chỉ một mục không đạt là không mua, dù máy đẹp đến đâu.</p>';
  const rows = sc.rows.filter(r => r.item.gate || r.item.optional);
  h += rows.filter(r => !r.item.optional).map(r => itemCard(insp, r, c, tot, null)).join('');
  const opt = rows.filter(r => r.item.optional);
  if (opt.length) h += '<div class="sect-h"><h2>Nên làm thêm</h2></div>' + opt.map(r => itemCard(insp, r, c, tot, null)).join('');
  h += '<div class="btnrow"><button class="btn primary" data-act="tab" data-tab="check">Sang kiểm từng mục ' + icon('chev', 'sm') + '</button></div>';
  return h;
}

// ---------- Tab Kiểm tra ----------
function renderCheck(insp, sc, v) {
  const c = sc.ctx, tot = totalEwOf(sc);
  let h = '';
  c.cat.groups.forEach(g => {
    if (g.id === 'lock') return;
    const rows = sc.rows.filter(r => r.item.g === g.id && !r.item.gate && !r.item.optional);
    if (!rows.length) return;
    const done = rows.filter(r => r.level || r.na).length;
    h += '<div class="sect-h"><h2>' + esc(g.name) + '</h2><span class="prog">' + done + '/' + rows.length + '</span></div>';
    if (g.note) h += '<p class="hint">' + esc(g.note) + '</p>';
    h += rows.map(r => itemCard(insp, r, c, tot, v)).join('');
  });
  h += '<div class="btnrow"><button class="btn primary" data-act="tab" data-tab="result">Xem kết quả ' + icon('chev', 'sm') + '</button></div>';
  return h;
}

// ---------- Tab Kết quả ----------
function scripts(v, sc) {
  if (!v.offers || sc.ko.length) return null;
  const top = v.found.filter(d => d.amount > 0).slice(0, 4);
  const vi = (top.length ? 'Máy có ' + top.map(d => d.name.toLowerCase() + ' (' + d.level.toLowerCase() + (d.base && typeof d.base === 'string' ? ', ' + PART_NAMES[d.base] + ' khoảng ' + moneyOf(d.amount) : '') + ')').join('; ') + '. ' : '') +
    'Em trả ' + moneyOf(v.offers.open) + ' được không ạ?';
  const ruM = x => fmtMoney(x, S.settings.currency, 'ru-RU');
  const ruParts = top.filter(d => typeof d.base === 'string' && PART_RU[d.base]).map(d => PART_RU[d.base] + ' ~' + ruM(d.amount));
  const ru = 'Готов взять за ' + ruM(v.offers.open) + '.' + (ruParts.length ? ' Есть недостатки: ' + ruParts.join(', ') + '.' : top.length ? ' Есть недостатки, на ремонт уйдёт около ' + ruM(top.reduce((a, d) => a + d.amount, 0)) + '.' : '') + ' Деньги сразу.';
  return { vi, ru };
}

function renderResult(insp, sc, v) {
  const c = sc.ctx, s = S.settings;
  let h = '';
  // Kết luận
  const vb = verdictBits(sc, v);
  let vt = '', vd = '';
  if (sc.ko.length) { vt = 'Có lỗi loại trực tiếp'; vd = v.reasons.map(esc).join('<br>'); }
  else if (v.verdict) { vt = v.verdict.title; vd = 'Người bán đòi ' + moneyOf(v.ask) + ' = <b>' + pct(v.ratio) + '</b> giá hợp lý.'; }
  else if (!v.fair) vt = 'Cần giá tham chiếu để định giá';
  else vt = 'Nhập giá người bán đòi để có kết luận';
  h += '<section class="panel"><div class="verdict"><span class="stamp c-' + vb.tone + '">' + esc(vb.stamp) + '</span><div><p class="vt">' + esc(vt) + '</p>' + (vd ? '<p class="small muted">' + vd + '</p>' : '') + '</div></div>';
  if (!sc.ko.length && sc.gatesPending.length) h += '<div class="note tone-info">Còn ' + sc.gatesPending.length + ' mục bắt buộc chưa kiểm: ' + sc.gatesPending.map(i => esc(textOf(i.t, c))).join(', ') + '. Chưa kiểm xong thì đừng trả tiền. <button class="linkbtn" data-act="tab" data-tab="gates">Kiểm ngay</button></div>';
  if (!v.ask && v.fair && !sc.ko.length) h += '<div><button class="linkbtn" data-act="goinfo" data-focus="f-ask">Nhập giá người bán đòi</button></div>';
  h += '</section>';

  // Điểm
  if (sc.score != null) {
    const g = sc.grade;
    h += '<section class="panel"><h3>Điểm tình trạng</h3><div class="scoreline"><div class="bignum">' + Math.round(sc.score) + '<small>/100</small></div><div class="stack" style="gap:6px">' +
      '<span class="grade c-' + g.tone + '">' + g.name + (sc.provisional ? ' · tạm tính' : '') + '</span>' +
      '<div class="bar" role="img" aria-label="Đã kiểm ' + pct(sc.coverage) + '"><i style="width:' + pct(sc.coverage) + '"></i></div>' +
      '<span class="small muted">Đã kiểm ' + sc.counts.done + '/' + sc.counts.total + ' mục, ' + pct(sc.coverage) + ' khối lượng điểm</span></div></div>' +
      '<div class="axes"><div class="axis"><span class="k">Ngoại hình</span><span class="v">' + (sc.cos.grade ? sc.cos.grade.id + ' · ' + sc.cos.grade.name : 'chưa kiểm') + '</span><span class="d">' + (sc.cos.score != null ? Math.round(sc.cos.score) + '/100 → hệ số giá ×' + v.K.toFixed(2) : 'tính hệ số ×1') + '</span></div>' +
      '<div class="axis"><span class="k">Chức năng</span><span class="v ' + (sc.faults.length ? 'c-stop' : '') + '">' + (sc.faults.length ? sc.faults.length + ' lỗi' : 'chưa thấy lỗi') + '</span><span class="d">' + (sc.faults.length ? esc(sc.faults.map(f => textOf(f.item.t, c)).join(', ')) : sc.wear.length ? 'hao mòn: ' + esc(sc.wear.map(f => textOf(f.item.t, c)).join(', ')) : 'mọi mục đã kiểm đều tốt') + '</span></div></div>' +
      (sc.capBy ? '<p class="small muted">Điểm gốc ' + Math.round(sc.raw) + ', bị giới hạn ở ' + sc.capBy.cap + ' vì: ' + esc(sc.capBy.why) + '.</p>' : '') + '</section>';
  }

  // Tiền
  if (!sc.ko.length) {
    h += '<section class="panel"><h3>Giá hợp lý</h3>';
    if (!v.ref.value) {
      h += '<div class="note tone-warn">' + esc(v.ref.text) + '. <button class="linkbtn" data-act="goinfo" data-focus="f-comps">Nhập giá</button></div>';
    } else {
      h += '<table class="ledger"><tbody>' +
        '<tr><td>Giá tham chiếu<span class="why">' + esc(v.ref.text) + '</span></td><td>' + moneyOf(v.ref.value) + '</td></tr>' +
        '<tr><td>Hệ số ngoại hình ×' + v.K.toFixed(2) + '<span class="why">' + (sc.cos.score != null ? 'ngoại hình ' + Math.round(sc.cos.score) + '/100; máy đẹp tiêu chuẩn = ×1,00' : 'chưa kiểm ngoại hình') + '</span></td><td>' + (Math.round(v.base - v.ref.value) === 0 ? '0' : sign(v.ref.value - v.base)) + '</td></tr>';
      if (v.found.length) {
        h += '<tr><td><b>Lỗi đã thấy</b></td><td>' + sign(v.foundTotal) + '</td></tr>';
        h += v.found.map(d => '<tr class="sub"><td>' + esc(d.name) + ' · ' + esc(d.level) + '<span class="why">' + esc(d.label) +
          (S.ui.editCost === d.id || !d.base || !d.rf ? '' : ' <button class="edit" data-act="editcost" data-id="' + d.id + '">sửa giá</button>') + '</span>' +
          (S.ui.editCost === d.id ? '<span class="inrow" style="margin-top:6px"><input class="inp mono" id="ec-' + d.id + '" data-cost="' + d.id + '" inputmode="decimal" placeholder="Giá sửa đủ (' + CURRENCIES[s.currency].symbol + ')" value="' + esc(insp.costs[d.id] != null ? Math.round(insp.costs[d.id]) : '') + '"><button class="btn" data-act="savecost" data-id="' + d.id + '">Lưu</button><button class="btn" data-act="resetcost" data-id="' + d.id + '">Mặc định</button></span>' : '') +
          '</td><td>' + sign(d.amount) + '</td></tr>').join('');
      }
      if (v.risk.length) {
        const showAll = S.ui.showRisk;
        const list = showAll ? v.risk : v.risk.slice(0, 4);
        h += '<tr><td><b>Rủi ro mục chưa kiểm</b><span class="why">' + v.risk.length + ' mục, mỗi mục = khả năng lỗi × chi phí sửa. Kiểm xong là khoản này mất.</span></td><td>' + sign(v.riskTotal) + '</td></tr>' +
          list.map(d => '<tr class="sub"><td>' + esc(d.name) + '<span class="why">' + esc(d.label) + '</span></td><td>' + sign(d.amount) + '</td></tr>').join('') +
          (v.risk.length > 4 ? '<tr class="sub"><td colspan="2" class="more"><button class="linkbtn" data-act="togglerisk">' + (showAll ? 'Thu gọn' : 'Xem thêm ' + (v.risk.length - 4) + ' mục') + '</button></td></tr>' : '');
      }
      if (s.margin) h += '<tr><td>Biên an toàn ' + s.margin + '%</td><td>−' + s.margin + '%</td></tr>';
      h += '<tr class="tot"><td>Giá hợp lý</td><td>' + moneyOf(v.fair) + '</td></tr>';
      if (v.ask) h += '<tr><td>Người bán đòi</td><td>' + moneyOf(v.ask) + '</td></tr>';
      h += '</tbody></table>';
      if (v.floorHit) h += '<div class="note tone-warn">Tổng chi phí sửa gần bằng giá máy: giá trên chỉ còn là giá xác lấy linh kiện.</div>';
      if (v.riskTotal > 0 && v.fairBest) h += '<p class="small muted">Nếu mọi mục còn lại đều đạt: <b class="mono">' + moneyOf(v.fairBest) + '</b>.</p>';
      const other = s.currency === 'RUB' ? 'VND' : 'RUB';
      h += '<p class="small muted">Quy đổi: ' + moneyOf(v.fair) + ' ≈ <span class="mono">' + fmtMoney(convert(v.fair, s.currency, other, s), other) + '</span> (tỷ giá trong Cài đặt).</p>';
      if (v.offers) {
        h += '<div class="offers"><div class="offer"><div class="k">Trả mở đầu</div><div class="v">' + moneyOf(v.offers.open) + '</div></div><div class="offer"><div class="k">Tối đa, quá thì bỏ</div><div class="v">' + moneyOf(v.offers.max) + '</div></div></div>';
        if (v.cheap) h += '<p class="small muted">Món rẻ: thường không đáng mặc cả nhiều, chỉ cần không vượt giá tối đa.</p>';
        else if (v.roundAsk) h += '<p class="small muted">Giá rao tròn số: người bán đặt giá tròn thường chấp nhận trả giá sâu hơn.</p>';
        const sp = scripts(v, sc);
        if (sp && v.ask && v.ask > v.offers.open) {
          h += '<div class="field"><span class="lbl">Lời trả giá</span><p class="script" id="sc-vi">' + esc(sp.vi) + '</p><div class="btnrow"><button class="btn" data-act="copy" data-src="sc-vi">' + icon('copy', 'sm') + 'Chép tiếng Việt</button></div>' +
            '<p class="script" id="sc-ru" lang="ru">' + esc(sp.ru) + '</p><div class="btnrow"><button class="btn" data-act="copy" data-src="sc-ru">' + icon('copy', 'sm') + 'Chép tiếng Nga</button></div></div>';
        }
      }
    }
    h += '</section>';
  }

  // Chưa kiểm
  const todo = sc.rows.filter(r => r.status === 'todo' && !r.item.optional);
  if (todo.length) h += '<section class="panel"><h3>Chưa kiểm ' + todo.length + ' mục</h3><ul class="list-plain">' + todo.slice(0, 12).map(r => '<li><button class="linkbtn" data-act="goitem" data-id="' + r.item.id + '">' + esc(textOf(r.item.t, c)) + '</button></li>').join('') + (todo.length > 12 ? '<li class="muted">và ' + (todo.length - 12) + ' mục khác</li>' : '') + '</ul></section>';

  h += '<div class="btnrow"><button class="btn" data-act="copyreport">' + icon('copy', 'sm') + 'Sao chép phiếu</button></div>' +
    '<p class="hint">Cách tính: giá hợp lý = giá tham chiếu × hệ số ngoại hình − chi phí sửa các lỗi đã thấy − rủi ro của mục chưa kiểm. Chi phí sửa ước theo bảng giá hãng × hệ số giá tiệm (' + s.repairFactor + ') trong Cài đặt; bấm "sửa giá" để nhập giá tiệm thật. Mua khi giá đòi ≤ giá hợp lý; trả giá khi cao hơn tới ' + Math.round((1 / s.closeRatio - 1) * 100) + '%; cao hơn nữa thì bỏ.</p>';
  return h;
}

const PART_RU = {
  screen: 'замена экрана', battery: 'замена аккумулятора', back: 'замена задней крышки', rearcam: 'замена основной камеры', frontcam: 'замена фронтальной камеры',
  bio: 'не работает Face ID/Touch ID', port: 'замена разъёма зарядки', speaker: 'замена динамика', mic: 'замена микрофона', buttons: 'ремонт кнопок', vibrate: 'замена вибромотора',
  camglass: 'замена стекла камеры', board: 'ремонт платы', bud: 'замена наушника', batt: 'износ батареи наушников', case: 'замена кейса', tips: 'новые амбушюры', cushion: 'новые амбушюры',
  hinge: 'ремонт шарнира', shutter: 'замена затвора', clean: 'чистка матрицы', sensor: 'замена матрицы', af: 'ремонт автофокуса', ibis: 'ремонт стабилизатора', lcd: 'замена экрана',
  evf: 'замена видоискателя', slot: 'замена слота карты', ports: 'ремонт разъёмов', mount: 'замена байонета', grip: 'замена резинок', water: 'следы влаги'
};

// ---------- Cài đặt ----------
function renderSettings() {
  const s = S.settings;
  const num = (id, label, val, hint, step) => '<div class="field"><label for="' + id + '">' + label + '</label><input class="inp mono" type="number" id="' + id + '" data-set="' + id.slice(2) + '" value="' + val + '" step="' + (step || 'any') + '" inputmode="decimal">' + (hint ? '<span class="hint">' + hint + '</span>' : '') + '</div>';
  return '<div class="sheet"><header class="appbar"><div class="wrap row"><button class="iconbtn" data-act="closelayer" aria-label="Đóng">' + icon('x') + '</button><div class="ttl"><h1>Cài đặt</h1></div></div></header>' +
    '<div class="wrap body">' +
    '<section class="panel"><h3>Tiền tệ và tỷ giá</h3><div class="field"><label for="s-currency">Tính giá bằng</label><select class="inp" id="s-currency" data-set="currency">' +
    Object.keys(CURRENCIES).map(k => '<option value="' + k + '"' + (s.currency === k ? ' selected' : '') + '>' + CURRENCIES[k].name + ' (' + CURRENCIES[k].symbol + ')</option>').join('') + '</select></div>' +
    '<div class="grid2">' + num('s-usdRub', '1 USD = ? ₽', s.usdRub, '', '0.1') + num('s-rubVnd', '1 ₽ = ? ₫', s.rubVnd, '', '1') + '</div><span class="hint">Tỷ giá tự nhập, app không tự cập nhật. Dùng để đổi giá tin rao khác tiền tệ và giá sửa (tính bằng USD).</span></section>' +
    '<section class="panel"><h3>Định giá</h3>' +
    num('s-repairFactor', 'Hệ số giá sửa so với bảng giá hãng', s.repairFactor, 'Tiệm ngoài thường rẻ hơn hãng: 0,6–0,9. Đặt 1 nếu sửa ở hãng.', '0.05') +
    num('s-listingDiscount', 'Giá rao cao hơn giá chốt (%)', s.listingDiscount, 'Trừ khỏi trung vị tin rao để ra giá giao dịch thật.', '1') +
    num('s-closeRatio', 'Tỉ lệ giá chốt / giá đòi khi trả giá thành công', s.closeRatio, 'Mặc định 0,73 theo 25 triệu cuộc trả giá trên eBay. Người bán đòi cao hơn giá hợp lý ÷ tỉ lệ này thì nên bỏ.', '0.01') +
    num('s-margin', 'Biên an toàn khi mua của người lạ (%)', s.margin, 'Trừ thêm vào giá hợp lý vì không có bảo hành, không đổi trả.', '1') +
    '<div><button class="btn" data-act="resetsettings">Về mặc định</button></div></section>' +
    '<section class="panel"><h3>Dữ liệu</h3><p class="hint">Phiếu lưu trong trình duyệt này. Sao chép dữ liệu để chuyển sang máy khác, rồi dán vào đây ở máy kia.</p>' +
    '<div class="btnrow"><button class="btn" data-act="exportdata">' + icon('copy', 'sm') + 'Sao chép toàn bộ phiếu</button></div>' +
    '<div class="field"><label for="s-import">Dán dữ liệu đã sao chép</label><textarea class="inp mono" id="s-import" rows="3"></textarea></div><div class="btnrow"><button class="btn" data-act="importdata">Nhập</button></div>' +
    (S.ui.confirmWipe ? '<div class="confirm"><span>Xoá hết mọi phiếu?</span><button class="btn danger" data-act="wipe">Xoá hết</button><button class="btn" data-act="cancelwipe">Thôi</button></div>' : '<div><button class="linkbtn muted" data-act="askwipe">' + icon('trash', 'sm') + 'Xoá mọi phiếu</button></div>') +
    '</section><p class="hint">Soi Đồ Cũ ' + APP_VERSION + '. Bảng giá sửa, độ bền màn trập, mức khấu hao là ước lượng từ nguồn công khai, sửa được; app không thay cho thợ kiểm chuyên nghiệp.</p></div></div>';
}
