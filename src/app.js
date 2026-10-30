// ===== Điều khiển: trạng thái, lưu trữ, sự kiện =====

const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
const K_LIST = 'soi-do-cu.list', K_SET = 'soi-do-cu.settings', K_SEEN = 'soi-do-cu.seeded';

function normalize(insp) {
  ['info', 'inputs', 'answers', 'na', 'notes', 'costs', 'tools'].forEach(k => { if (!insp[k] || typeof insp[k] !== 'object') insp[k] = {}; });
  return insp;
}

// Phiếu ví dụ: chiếc iPhone 17 Pro Max đã xem (số máy, pin, giá đòi là thật; giá tin rao là số minh hoạ).
function sampleInspection() {
  const i = newInspection('phone', 'ip-17pm');
  i.info = {
    example: true, storage: '256GB', partno: 'MFYN4ZA/A', serial: 'MT77F6YYPV', warranty: '04/11/2026', ask: '71 000',
    comps: '74 000 (ví dụ)\n78 000 (ví dụ)\n72 500 (ví dụ)\n76 000 (ví dụ)\n69 900 (ví dụ)'
  };
  i.inputs = { battery: 90, cycles: 361 };
  Object.assign(i.answers, {
    'ph.actlock': 'ok', 'ph.mdm': 'ok', 'ph.carrier': 'ok', 'ph.imei': 'ok', 'ph.model': 'ok', 'ph.swell': 'ok',
    'ph.simtray': 'ok', 'ph.serial': 'ok', 'ph.parts': 'ok', 'ph.battery': 'ok', 'ph.charge': 'ok',
    'ph.glass': 'minor', 'ph.display': 'ok', 'ph.touch': 'ok', 'ph.truetone': 'ok', 'ph.rearcam': 'ok', 'ph.bio': 'ok',
    'ph.frame': 'minor', 'ph.back': 'ok', 'ph.box': 'minor', 'ph.warranty': 'minor'
  });
  i.created = i.updated = Date.now() - 36e5;
  return i;
}

const S = {
  settings: Object.assign({}, DEFAULT_SETTINGS, store.get(K_SET, {})),
  list: (store.get(K_LIST, null) || []).map(normalize),
  ui: { view: 'home', id: null, tab: 'info', open: {}, confirmDel: null, editCost: null, showRisk: false, layer: null, confirmWipe: false, quick: null, quickVal: {} }
};
if (!S.list.length && !store.get(K_SEEN, false)) { S.list.push(sampleInspection()); store.set(K_SEEN, true); }

function cur() { return S.list.find(x => x.id === S.ui.id) || null; }
function save() { store.set(K_LIST, S.list); }
function touch(insp) { insp.updated = Date.now(); save(); }

const $app = document.getElementById('app');
const $layer = document.getElementById('layer');

function render(keepScroll) {
  const y = window.scrollY;
  const insp = cur();
  // Giữ ô đang gõ sau khi vẽ lại (vd. vừa rời ô mã máy sang ô kế tiếp).
  const ae = document.activeElement;
  const aid = ae && ae.id && $app.contains(ae) && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName) ? ae.id : null;
  const sel = aid && typeof ae.selectionStart === 'number' ? [ae.selectionStart, ae.selectionEnd] : null;
  if (S.ui.view === 'insp' && insp) $app.innerHTML = renderInsp(insp);
  else { S.ui.view = 'home'; $app.innerHTML = renderHome(); }
  if (keepScroll) window.scrollTo(0, y);
  if (aid) {
    const el = document.getElementById(aid);
    if (el) { el.focus({ preventScroll: true }); if (sel && el.setSelectionRange) { try { el.setSelectionRange(sel[0], sel[1]); } catch (e) {} } }
  }
}

// Cập nhật phần phụ thuộc khi đang gõ (không vẽ lại cả trang để giữ con trỏ).
function refreshLive(kind) {
  const insp = cur(); if (!insp) return;
  const sc = scoreInspection(insp), v = valuate(insp, S.settings, sc), c = sc.ctx;
  const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
  if (kind === 'partno') set('d-partno', c.brand === 'apple' ? decodePartHTML(c) : codesHTML(c.codes, c.model));
  if (kind === 'imei') set('d-imei', decodeImeiHTML(insp.info.imei));
  if (kind === 'price') { set('d-comps', compsHTML(insp)); set('d-ref', refHTML(insp, c)); }
  const tk = document.querySelector('.ticket');
  if (tk) tk.outerHTML = renderTicket(sc, v);
}

let toastT = null;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 1800);
}

function copyText(text) {
  const fallback = () => {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.top = '-1000px';
    document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
    ta.remove();
    if (ok) toast('Đã sao chép'); else showText(text);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => toast('Đã sao chép'), fallback);
  else fallback();
}
function showText(text) {
  S.ui.layer = 'text';
  $layer.innerHTML = '<div class="sheet"><header class="appbar"><div class="wrap row"><button class="iconbtn" data-act="closelayer" aria-label="Đóng">' + icon('x') + '</button><div class="ttl"><h1>Chọn và sao chép</h1></div></div></header><div class="wrap body"><textarea class="inp mono" id="t-text" rows="14">' + esc(text) + '</textarea></div></div>';
  const ta = document.getElementById('t-text'); ta.focus(); ta.select();
}

// ---------- Công cụ ----------
function openTool(name, itemId) {
  const insp = cur(); if (!insp || !TOOLS[name]) return;
  const c = buildContext(insp);
  const item = itemId ? c.cat.items.find(x => x.id === itemId) : null;
  S.ui.layer = 'tool';
  $layer.innerHTML = '<div class="sheet"><header class="appbar"><div class="wrap row"><button class="iconbtn" data-act="closelayer" aria-label="Đóng">' + icon('x') + '</button><div class="ttl"><h1>' + esc(TOOL_NAMES[name]) + '</h1><div class="sub">' + esc(c.model ? c.model.name : c.cat.name) + '</div></div></div></header><div class="wrap body" id="tool-body"></div></div>';
  const api = {
    insp, ctx: c, item,
    answer(lv) { if (item) { insp.answers[item.id] = lv; delete insp.na[item.id]; touch(insp); } },
    setInput(k, val) { insp.inputs[k] = val; touch(insp); },
    patch(fn) { fn(insp); touch(insp); api.ctx = buildContext(insp); },
    close: closeLayer,
    toast
  };
  TOOLS[name](document.getElementById('tool-body'), api);
}
function closeLayer() {
  stopLive();
  S.ui.layer = null; $layer.innerHTML = '';
  render(true);
}

// ---------- Sự kiện ----------
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const a = b.dataset.act, id = b.dataset.id;
  const insp = cur();
  switch (a) {
    case 'home': S.ui.view = 'home'; S.ui.id = null; render(); window.scrollTo(0, 0); break;
    case 'new': {
      const n = newInspection(b.dataset.cat);
      S.list.push(n); save();
      Object.assign(S.ui, { view: 'insp', id: n.id, tab: 'info', open: {}, confirmDel: null });
      render(); window.scrollTo(0, 0);
      setTimeout(() => { const f = document.getElementById('f-model'); if (f) f.focus(); }, 50);
      break;
    }
    case 'open': Object.assign(S.ui, { view: 'insp', id, tab: 'info', open: {}, confirmDel: null, editCost: null }); render(); window.scrollTo(0, 0); break;
    case 'tab': S.ui.tab = b.dataset.tab; S.ui.editCost = null; render(); window.scrollTo(0, 0); break;
    case 'level': {
      if (!insp) break;
      const was = insp.answers[id];
      if (was === b.dataset.lv) delete insp.answers[id]; else insp.answers[id] = b.dataset.lv;
      delete insp.na[id]; delete S.ui.open[id];
      touch(insp); render(true);
      break;
    }
    case 'clear': if (insp) { delete insp.answers[id]; touch(insp); render(true); } break;
    case 'na': if (insp) { if (insp.na[id]) delete insp.na[id]; else { insp.na[id] = true; delete insp.answers[id]; } touch(insp); render(true); } break;
    case 'expand': S.ui.open[id] = true; render(true); break;
    case 'collapse': delete S.ui.open[id]; render(true); break;
    case 'tool': openTool(b.dataset.tool, b.dataset.item); break;
    case 'goinfo': S.ui.tab = 'info'; render(); setTimeout(() => { const f = document.getElementById(b.dataset.focus); if (f) { f.scrollIntoView({ block: 'center' }); f.focus(); } }, 30); break;
    case 'goitem': {
      if (!insp) break;
      const it = buildContext(insp).cat.items.find(x => x.id === id);
      S.ui.tab = it && (it.gate || it.optional) ? 'gates' : 'check'; S.ui.open[id] = true; render();
      setTimeout(() => { const el = document.getElementById('it-' + id); if (el) el.scrollIntoView({ block: 'center' }); }, 30);
      break;
    }
    case 'copyreport': if (insp) copyText(reportText(insp, S.settings)); break;
    case 'copy': { const el = document.getElementById(b.dataset.src); if (el) copyText(el.textContent); break; }
    case 'askdel': S.ui.confirmDel = id; render(true); break;
    case 'canceldel': S.ui.confirmDel = null; render(true); break;
    case 'del': S.list = S.list.filter(x => x.id !== id); save(); Object.assign(S.ui, { view: 'home', id: null, confirmDel: null }); render(); toast('Đã xoá phiếu'); break;
    case 'editcost': S.ui.editCost = id; render(true); setTimeout(() => { const f = document.getElementById('ec-' + id); if (f) f.focus(); }, 30); break;
    case 'savecost': {
      const f = document.getElementById('ec-' + id);
      const p = f ? parseMoney(f.value, S.settings.currency) : null;
      if (insp) { if (p) insp.costs[id] = convert(p.value, p.cur, S.settings.currency, S.settings); else delete insp.costs[id]; touch(insp); }
      S.ui.editCost = null; render(true); break;
    }
    case 'resetcost': if (insp) { delete insp.costs[id]; touch(insp); } S.ui.editCost = null; render(true); break;
    case 'togglerisk': S.ui.showRisk = !S.ui.showRisk; render(true); break;
    case 'settings': S.ui.layer = 'settings'; $layer.innerHTML = renderSettings(); break;
    case 'quick': {
      const q = b.dataset.q;
      S.ui.layer = 'quick'; S.ui.quick = q;
      $layer.innerHTML = renderQuick(q, S.ui.quickVal[q] || '');
      setTimeout(() => { const f = document.getElementById(q === 'market' ? 'q-code' : 'q-imei'); if (f) f.focus(); }, 30);
      break;
    }
    case 'qex': {
      const f = document.getElementById('q-code');
      if (f) { f.value = b.dataset.v; S.ui.quickVal.market = f.value; document.getElementById('q-out').innerHTML = quickMarketOut(f.value); }
      break;
    }
    case 'closelayer': closeLayer(); break;
    case 'resetsettings': S.settings = Object.assign({}, DEFAULT_SETTINGS); store.set(K_SET, S.settings); $layer.innerHTML = renderSettings(); toast('Đã về mặc định'); break;
    case 'exportdata': copyText(JSON.stringify({ app: 'soi-do-cu', v: 1, list: S.list }, null, 0)); break;
    case 'importdata': {
      const ta = document.getElementById('s-import');
      try {
        const d = JSON.parse(ta.value);
        const arr = Array.isArray(d) ? d : d.list;
        if (!Array.isArray(arr)) throw new Error('sai định dạng');
        let added = 0;
        arr.forEach(x => { if (x && x.id && x.cat && getCategory(x.cat) && !S.list.some(y => y.id === x.id)) { S.list.push(normalize(x)); added++; } });
        save(); ta.value = ''; toast('Đã nhập ' + added + ' phiếu');
      } catch (err) { toast('Không đọc được dữ liệu: ' + err.message); }
      break;
    }
    case 'askwipe': S.ui.confirmWipe = true; $layer.innerHTML = renderSettings(); break;
    case 'cancelwipe': S.ui.confirmWipe = false; $layer.innerHTML = renderSettings(); break;
    case 'wipe': S.list = []; save(); S.ui.confirmWipe = false; $layer.innerHTML = renderSettings(); toast('Đã xoá mọi phiếu'); break;
  }
});

document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'q-code' || t.id === 'q-imei') {
    const q = t.id === 'q-code' ? 'market' : 'imei';
    S.ui.quickVal[q] = t.value;
    const out = document.getElementById('q-out');
    if (out) out.innerHTML = q === 'market' ? quickMarketOut(t.value) : quickImeiOut(t.value);
    return;
  }
  const insp = cur();
  if (t.dataset.f && insp) {
    const path = t.dataset.f;
    if (path === 'model') return;
    const k = path.split('.')[1];
    let val = t.value;
    if (k === 'partno' || k === 'code2') val = val.toUpperCase();
    insp.info[k] = val;
    touch(insp);
    refreshLive(t.dataset.live);
  }
});

document.addEventListener('change', e => {
  const t = e.target;
  const insp = cur();
  if (t.dataset.f === 'model' && insp) {
    insp.model = t.value; touch(insp); render(true); return;
  }
  if (t.dataset.f === 'info.storage' && insp) { insp.info.storage = t.value; touch(insp); render(true); return; }
  if (t.dataset.f && insp && (t.dataset.live === 'partno')) { setTimeout(() => render(true), 0); return; }
  if (t.dataset.input && insp) {
    const k = t.dataset.input, it = buildContext(insp).cat.items.find(x => x.id === t.dataset.item);
    const val = t.value === '' ? null : parseFloat(t.value);
    if (val == null || isNaN(val)) delete insp.inputs[k]; else insp.inputs[k] = val;
    if (it && it.input && it.input.key === k && it.input.auto && val != null && !isNaN(val)) {
      insp.answers[it.id] = it.input.auto(val, buildContext(insp));
      delete insp.na[it.id];
    }
    touch(insp); render(true); return;
  }
  if (t.dataset.set) {
    const k = t.dataset.set;
    S.settings[k] = k === 'currency' ? t.value : (parseFloat(t.value) || DEFAULT_SETTINGS[k]);
    if (k === 'closeRatio') S.settings[k] = Math.min(0.99, Math.max(0.4, S.settings[k]));
    store.set(K_SET, S.settings);
    render(true);
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && S.ui.layer) closeLayer();
  if (e.key === 'Enter' && e.target.dataset && e.target.dataset.cost) { const b = document.querySelector('[data-act="savecost"][data-id="' + e.target.dataset.cost + '"]'); if (b) b.click(); }
});

render();
if (IS_PWA && 'serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
