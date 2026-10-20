// ===== Lõi tính toán: ngữ cảnh, chấm điểm, định giá, kết luận =====
// Không đụng tới DOM, chạy được trong Node để kiểm thử.

const AXIS_BY_GROUP = { lock: 'gate', id: 'info', body: 'cos', acc: 'extra' };
const FAULT_CAP = 69;         // có lỗi chức năng → tối đa hạng Khá (như DiagnoTest)
const COVERAGE_MIN = 0.8;     // kiểm dưới 80% → hạng tạm tính, không lên hai hạng cao nhất
const PROVISIONAL_CAP = 84;
const FLOOR_SHARE = 0.15;     // giá sàn = giá trị linh kiện, ~15% giá tham chiếu

function getCategory(id) { return CATEGORIES.find(c => c.id === id) || null; }
function getModel(cat, id) { return cat && id ? cat.models.find(m => m.id === id) || null : null; }

function newInspection(catId, modelId) {
  const now = Date.now();
  return {
    id: 'k' + now.toString(36) + Math.random().toString(36).slice(2, 6),
    cat: catId, model: modelId || '', created: now, updated: now,
    info: {}, inputs: {}, answers: {}, na: {}, notes: {}, costs: {}, tools: {}
  };
}

function buildContext(insp) {
  const cat = getCategory(insp.cat);
  const model = getModel(cat, insp.model);
  const info = insp.info || {};
  const part = cat && cat.id === 'phone' && model && model.brand === 'apple' ? decodeApplePartNo(info.partno) : null;
  return {
    cat, model, info, part,
    inputs: insp.inputs || {},
    brand: model ? model.brand : (info.brand || 'other'),
    simExpect: cat && cat.id === 'phone' ? simExpectation(model, part) : null,
    hasLens: !!(info.hasLens || info.lens)
  };
}

// Văn bản trong dữ liệu có thể là chuỗi, hàm (theo ngữ cảnh) hoặc bảng theo hãng.
function textOf(v, c) {
  if (v == null) return '';
  if (typeof v === 'function') return v(c) || '';
  if (typeof v === 'object') return v[c.brand] || v.default || '';
  return v;
}

function applicableItems(cat, c) {
  return cat.items.filter(it => !it.when || it.when(c));
}

function ruleOf(item) {
  const r = MONEY[item.id] || {};
  return {
    axis: r.axis || (item.gate && item.g === 'lock' ? 'gate' : AXIS_BY_GROUP[item.g] || 'fn'),
    fix: r.fix || null,
    p: r.p != null ? r.p : 0,
    lv: r.lv || {}
  };
}

function levelOf(item, id) { return id ? item.levels.find(l => l.id === id) || null : null; }

function gradeOf(score) { return GRADES.find(g => score >= g.min) || GRADES[GRADES.length - 1]; }
function cosGradeOf(score) { return COS_GRADES.find(g => score >= g.min) || COS_GRADES[COS_GRADES.length - 1]; }

function interp(curve, x) {
  if (x <= curve[0][0]) return curve[0][1];
  for (let i = 1; i < curve.length; i++) {
    const [x1, y1] = curve[i];
    if (x <= x1) { const [x0, y0] = curve[i - 1]; return y0 + (y1 - y0) * (x - x0) / (x1 - x0); }
  }
  return curve[curve.length - 1][1];
}

// ---------- Chấm điểm ----------
function scoreInspection(insp) {
  const c = buildContext(insp);
  const cat = c.cat;
  const items = applicableItems(cat, c);
  const groupW = {};
  cat.groups.forEach(g => { groupW[g.id] = g.W; });

  // trọng số hiệu dụng: W nhóm chia đều theo w của các mục áp dụng trong nhóm
  const wsum = {};
  items.forEach(it => { if (!insp.na[it.id] && it.w) wsum[it.g] = (wsum[it.g] || 0) + it.w; });

  const rows = items.map(it => {
    const rule = ruleOf(it);
    const na = !!insp.na[it.id];
    const level = na ? null : levelOf(it, insp.answers[it.id]);
    const ew = !na && it.w && groupW[it.g] ? groupW[it.g] * it.w / wsum[it.g] : 0;
    const lvr = level ? (rule.lv[level.id] || {}) : {};
    const fault = !!level && rule.axis === 'fn' && level.f < 0.5 && lvr.fault !== false;
    return { item: it, rule, na, level, ew, fault, status: na ? 'na' : level ? 'done' : 'todo' };
  });

  let sw = 0, swf = 0, total = 0;
  const caps = [], ko = [], gatesPending = [];
  let cw = 0, cwf = 0, cosN = 0;
  const faults = [], wear = [];
  rows.forEach(r => {
    const it = r.item;
    if (!r.na) total += r.ew;
    if (r.level) {
      sw += r.ew; swf += r.ew * r.level.f;
      if (r.level.ko) ko.push({ item: it, level: r.level });
      if (r.level.cap != null) caps.push({ cap: r.level.cap, why: textOf(it.t, c) + ': ' + r.level.label });
      if (r.fault) faults.push(r);
      else if (r.rule.axis === 'fn' && r.level.f < 1) wear.push(r);
      if (r.rule.axis === 'cos' && it.w) { cw += it.w; cwf += it.w * r.level.f; cosN++; }
    } else if (!r.na && it.gate && !it.optional) {
      gatesPending.push(it);
    }
  });
  if (faults.length) caps.push({ cap: FAULT_CAP, why: 'Có lỗi chức năng (' + faults.map(f => textOf(f.item.t, c)).join(', ') + ')' });

  const coverage = total ? sw / total : 0;
  const provisional = coverage < COVERAGE_MIN;
  if (provisional && sw > 0) caps.push({ cap: PROVISIONAL_CAP, why: 'Mới kiểm ' + Math.round(coverage * 100) + '% khối lượng, hạng chỉ là tạm tính' });

  const raw = sw ? 100 * swf / sw : null;
  let score = raw;
  let capBy = null;
  if (raw != null) caps.forEach(k => { if (k.cap < score) { score = k.cap; capBy = k; } });
  if (score != null) score = Math.round(score * 10) / 10;

  const cosScore = cw ? 100 * cwf / cw : null;
  const todo = rows.filter(r => r.status === 'todo' && !r.item.optional);
  return {
    ctx: c, rows, raw, score, capBy, caps, ko, gatesPending,
    coverage, provisional,
    grade: score != null ? gradeOf(score) : null,
    cos: { score: cosScore, grade: cosScore != null ? cosGradeOf(cosScore) : null, n: cosN },
    faults, wear,
    counts: {
      total: rows.filter(r => !r.na && !r.item.optional).length,
      done: rows.filter(r => r.status === 'done' && !r.item.optional).length,
      todo: todo.length,
      gates: rows.filter(r => r.item.gate && !r.na && !r.item.optional).length,
      gatesDone: rows.filter(r => r.item.gate && r.level && !r.item.optional).length
    }
  };
}

// ---------- Tiền tệ ----------
function usdTo(cur, s) {
  return cur === 'USD' ? 1 : cur === 'RUB' ? s.usdRub : s.usdRub * s.rubVnd;
}
function convert(v, from, to, s) { return from === to ? v : v / usdTo(from, s) * usdTo(to, s); }

function roundTo(v, step, mode) {
  const f = mode === 'down' ? Math.floor : mode === 'up' ? Math.ceil : Math.round;
  return f(v / step) * step;
}

function fmtMoney(v, cur, locale) {
  if (v == null || !isFinite(v)) return '—';
  const C = CURRENCIES[cur];
  const n = Math.round(Math.abs(v)).toLocaleString(locale || C.locale);
  const s = C.after ? n + ' ' + C.symbol : C.symbol + n;
  return v < 0 ? '−' + s : s;
}

// Đọc một con số tiền gõ tự do: "15 000", "15k", "18tr", "18,5 triệu", "71к", "1.2 млн", "$450"
function parseMoney(text, defCur) {
  if (text == null) return null;
  let s = String(text).toLowerCase().replace(/ /g, ' ').trim();
  if (!s) return null;
  let cur = defCur;
  const W = '[^a-z0-9à-ỹа-яё]';
  if (new RegExp('₫|vnđ|vnd|đồng|triệu|(^|' + W + '|\\d)(đ|tr)(' + W + '|$)').test(s)) cur = 'VND';
  else if (new RegExp('₽|руб|rub|тыс|млн|(^|' + W + '|\\d)(р|к)\\.?(' + W + '|$)').test(s)) cur = 'RUB';
  else if (/\$|usd|\bđô\b/.test(s)) cur = 'USD';
  const m = s.match(/(\d[\d\s.,]*)\s*(k|к|тыс\.?|ngh[iì]n|tr|triệu|млн|m)?/);
  if (!m) return null;
  let num = m[1].replace(/\s/g, '');
  const mult = !m[2] ? 1 : /^(k|к|тыс|ngh)/.test(m[2]) ? 1e3 : 1e6;
  if (mult > 1) num = num.replace(',', '.');
  else if (/^\d{1,3}([.,]\d{3})+$/.test(num)) num = num.replace(/[.,]/g, '');
  else num = num.replace(',', '.');
  const v = parseFloat(num) * mult;
  return isFinite(v) && v > 0 ? { value: v, cur } : null;
}

function quantile(sorted, q) {
  if (!sorted.length) return null;
  const pos = (sorted.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

// Tin rao tương đương: mỗi dòng một giá. Loại tin lệch xa trung vị quá 3·MAD.
function compStats(text, cur, s) {
  const lines = String(text || '').split(/\n|;/).map(x => x.trim()).filter(Boolean);
  const parsed = [];
  lines.forEach(line => {
    const p = parseMoney(line, cur);
    if (p) parsed.push({ line, value: convert(p.value, p.cur, cur, s), cur: p.cur, orig: p.value });
  });
  if (!parsed.length) return null;
  const vals = parsed.map(p => p.value).sort((a, b) => a - b);
  const med = quantile(vals, 0.5);
  const dev = vals.map(v => Math.abs(v - med)).sort((a, b) => a - b);
  const mad = quantile(dev, 0.5) * 1.4826;
  parsed.forEach(p => { p.out = mad > 0 && Math.abs(p.value - med) > 3 * mad; });
  const kept = parsed.filter(p => !p.out).map(p => p.value).sort((a, b) => a - b);
  return {
    items: parsed, n: kept.length,
    median: quantile(kept, 0.5), p25: quantile(kept, 0.25), p75: quantile(kept, 0.75),
    min: kept[0], max: kept[kept.length - 1]
  };
}

function modelAgeYears(m, now) {
  if (!m || !m.year) return null;
  const launch = new Date(m.year, 8, 20).getTime();
  return Math.max(0, ((now || Date.now()) - launch) / (365.25 * 864e5));
}

function referencePrice(insp, c, s) {
  const cur = s.currency;
  const comps = compStats(insp.info.comps, cur, s);
  const manual = parseMoney(insp.info.ref, cur);
  if (comps && comps.n >= 2) {
    return { value: comps.median * (1 - s.listingDiscount / 100), src: 'comps', comps,
      text: 'Trung vị ' + comps.n + ' tin rao, trừ ' + s.listingDiscount + '% chênh giá rao/giá chốt' };
  }
  if (manual) return { value: convert(manual.value, manual.cur, cur, s), src: 'manual', comps, text: 'Giá tham chiếu bạn nhập' };
  const m = c.model;
  if (m && m.usd) {
    const age = modelAgeYears(m);
    const keep = interp(RETENTION[c.cat.retention(m)], age);
    return { value: m.usd * keep * usdTo(cur, s), src: 'estimate', comps, age, keep,
      text: 'Ước tính thô: giá ra mắt ' + m.usd + ' USD × ' + Math.round(keep * 100) + '% sau ' + age.toFixed(1) + ' năm. Nên dán giá tin rao để chính xác hơn' };
  }
  return { value: null, src: 'none', comps, text: 'Chưa có giá tham chiếu: dán vài tin rao cùng model hoặc tự nhập' };
}

// Chi phí cơ sở của một kiểu sửa (trước khi nhân mức độ), theo tiền đang dùng.
function baseCost(fix, ctx, ref, s, partsUSD) {
  if (!fix) return null;
  if (typeof fix === 'function') fix = fix(ctx);
  const factor = s.repairFactor;
  if (typeof fix === 'string') {
    const u = partsUSD[fix];
    return u ? { value: u * factor * usdTo(s.currency, s), label: PART_NAMES[fix] || fix, part: fix } : null;
  }
  if (fix.usd) return { value: fix.usd * factor * usdTo(s.currency, s), label: 'chi phí sửa' };
  if (fix.pct) return ref ? { value: fix.pct * ref, label: Math.round(fix.pct * 100) + '% giá tham chiếu' } : null;
  if (fix.lens) {
    const lv = parseMoney(ctx.info.lensValue, s.currency);
    const base = lv ? convert(lv.value, lv.cur, s.currency, s) : (ref ? 0.25 * ref : null);
    return base ? { value: fix.lens * base, label: lv ? 'theo giá ống kính' : '25% giá tham chiếu (chưa nhập giá ống kính)' } : null;
  }
  return null;
}

// ---------- Định giá và kết luận ----------
function valuate(insp, s, sc) {
  sc = sc || scoreInspection(insp);
  const c = sc.ctx;
  const cur = s.currency;
  const ref = referencePrice(insp, c, s);
  const R0 = ref.value;
  const partsUSD = c.cat.repairUSD ? c.cat.repairUSD(c.model) : {};
  const K = sc.cos.score != null ? interp(COS_CURVE, sc.cos.score) : 1;
  const found = [], risk = [];

  sc.rows.forEach(r => {
    if (r.na) return;
    const it = r.item, rule = r.rule;
    const name = textOf(it.t, c);
    const override = insp.costs[it.id];
    if (r.level) {
      const lvr = rule.lv[r.level.id] || {};
      const rf = lvr.rf != null ? lvr.rf : (rule.axis === 'fn' ? 1 - r.level.f : 0);
      const fix = lvr.fix || rule.fix;
      let amount = 0, label = '';
      if (rf > 0) {
        const bc = override != null ? { value: override, label: 'bạn sửa' } : baseCost(fix, c, R0, s, partsUSD);
        if (bc) { amount += rf * bc.value; label = bc.label + (rf !== 1 ? ' × ' + Math.round(rf * 100) + '%' : ''); }
      }
      if (lvr.adj && R0) {
        amount -= lvr.adj * R0;
        label = (label ? label + '; ' : '') + (lvr.adj > 0 ? 'cộng ' : 'trừ ') + Math.round(Math.abs(lvr.adj) * 100) + '% giá';
      }
      if (Math.round(amount) !== 0) found.push({ id: it.id, name, level: r.level.label, amount, label, base: fix, rf });
    } else if (!it.gate && rule.axis === 'fn' && rule.p > 0) {
      const bc = override != null ? { value: override, label: 'bạn sửa' } : baseCost(rule.fix, c, R0, s, partsUSD);
      if (bc) risk.push({ id: it.id, name, amount: rule.p * bc.value, p: rule.p, cost: bc.value, label: Math.round(rule.p * 100) + '% khả năng lỗi × ' + bc.label });
    }
  });
  found.sort((a, b) => b.amount - a.amount);
  risk.sort((a, b) => b.amount - a.amount);
  const foundTotal = found.reduce((a, d) => a + d.amount, 0);
  const riskTotal = risk.reduce((a, d) => a + d.amount, 0);

  const C = CURRENCIES[cur];
  let fair = null, floorHit = false, base = null;
  if (R0) {
    base = R0 * K;
    fair = (base - foundTotal - riskTotal) * (1 - (s.margin || 0) / 100);
    if (fair < FLOOR_SHARE * R0) { fair = FLOOR_SHARE * R0; floorHit = true; }
    fair = roundTo(fair, C.step);
  }
  const fairBest = R0 ? roundTo(Math.max(FLOOR_SHARE * R0, base - foundTotal) * (1 - (s.margin || 0) / 100), C.step) : null;

  const askP = parseMoney(insp.info.ask, cur);
  const ask = askP ? convert(askP.value, askP.cur, cur, s) : null;

  let verdict = null, ratio = null;
  const reasons = [];
  if (sc.ko.length) {
    verdict = VERDICTS.stop;
    sc.ko.forEach(k => reasons.push(textOf(k.item.t, c) + ': ' + (k.level.note || k.level.label)));
  } else if (fair && ask) {
    ratio = ask / fair;
    const walkAt = 1 / s.closeRatio;
    verdict = ratio <= 0.92 ? VERDICTS.great : ratio <= 1.0 ? VERDICTS.buy : ratio <= walkAt ? VERDICTS.haggle : VERDICTS.walk;
  }
  const pending = !sc.ko.length && sc.gatesPending.length > 0;

  // Giá trả: mở đầu ở P25 tin rao (đã trừ lỗi), tối đa = giá hợp lý.
  let offers = null;
  if (fair && !sc.ko.length) {
    const max = roundTo(fair, C.step, 'down');
    let open = fair * 0.88;
    if (ref.comps && ref.comps.n >= 3) {
      const p25 = ref.comps.p25 * (1 - s.listingDiscount / 100) * K - foundTotal - riskTotal;
      if (p25 > 0) open = Math.min(open, p25);
    }
    open = Math.max(open, fair * 0.75);
    offers = { open: roundTo(open, C.bigStep, 'down'), max };
  }
  const cheap = R0 != null && R0 / usdTo(cur, s) < 40;
  const round = ask != null && ask >= 1000 && ask % (cur === 'VND' ? 1e6 : cur === 'RUB' ? 1000 : 50) === 0;

  return {
    cur, ref, K, base, found, risk, foundTotal, riskTotal, fair, fairBest, floorHit, ask, ratio,
    verdict, pending, reasons, offers, cheap, roundAsk: round, partsUSD
  };
}

// Ghi chú tự động từ số liệu nhập (pin so với chu kỳ, số chụp so với độ bền...).
function insights(insp, sc) {
  const c = sc.ctx, out = [];
  const inp = insp.inputs || {};
  if (c.cat.id === 'phone' && inp.battery) {
    const cyc = +inp.cycles || 0, bat = +inp.battery;
    if (cyc && c.model && c.brand === 'apple') {
      const life = c.model.cycles ? 1000 : 500;
      const expect = Math.max(70, 100 - cyc * 20 / life);
      if (bat > expect + 6 && cyc > 250) out.push({ tone: 'warn', text: 'Pin ' + bat + '% mà đã ' + cyc + ' chu kỳ: cao hơn mức thường gặp (~' + Math.round(expect) + '%). Có thể pin mới thay, xem mục Lịch sử linh kiện.' });
      else if (bat < expect - 6) out.push({ tone: 'warn', text: 'Pin chai nhanh hơn bình thường: ' + cyc + ' chu kỳ thường còn ~' + Math.round(expect) + '%, máy này ' + bat + '%.' });
      else out.push({ tone: 'pass', text: 'Pin ' + bat + '% với ' + cyc + ' chu kỳ là hợp lý (thường ~' + Math.round(expect) + '%).' });
    }
    const age = modelAgeYears(c.model);
    if (cyc && age != null && age > 0.2) {
      const perMonth = cyc / Math.max(1, (Date.now() - new Date(c.model.year, 8, 20)) / (30.44 * 864e5));
      if (perMonth > 40) out.push({ tone: 'warn', text: 'Khoảng ' + Math.round(perMonth) + ' chu kỳ mỗi tháng kể từ khi ra mắt: dùng rất nhiều (người thường ~20–30).' });
    }
  }
  if (c.cat.id === 'camera' && inp.shutter) {
    const r = ratedShutter(c.model), p = +inp.shutter / r.n;
    out.push({ tone: p < 0.7 ? 'pass' : 'warn', text: 'Đã dùng ' + Math.round(p * 100) + '% độ bền màn trập (' + (+inp.shutter).toLocaleString('vi-VN') + ' / ' + r.n.toLocaleString('vi-VN') + ', ' + (r.src === 'hãng' ? 'hãng công bố' : r.src === 'phụ' ? 'nguồn thứ cấp' : 'ước tính') + '). Dưới 70% thì số chụp gần như không ảnh hưởng giá.' });
  }
  if (c.cat.id === 'phone' && c.part && c.part.ok) {
    if (c.part.source.tone !== 'pass') out.push({ tone: c.part.source.tone === 'warn' ? 'warn' : 'info', text: 'Số máy bắt đầu bằng "' + c.part.first + '": ' + c.part.source.text + '.' + (c.part.source.note ? ' ' + c.part.source.note : '') });
    if (c.simExpect === 'none') out.push({ tone: 'info', text: 'Bản này chỉ dùng eSIM: không có khay SIM, nhà mạng của bạn phải hỗ trợ eSIM.' });
  }
  return out;
}

// Báo cáo dạng chữ để gửi người bán / lưu lại.
function reportText(insp, s) {
  const sc = scoreInspection(insp), v = valuate(insp, s, sc), c = sc.ctx;
  const L = [];
  L.push('PHIẾU KIỂM ĐỒ CŨ — ' + (c.model ? c.model.name : c.cat.name) + (insp.info.storage ? ' ' + insp.info.storage : ''));
  L.push(new Date(insp.updated).toLocaleString('vi-VN'));
  if (sc.score != null) L.push('Điểm: ' + Math.round(sc.score) + '/100 · ' + sc.grade.name + (sc.provisional ? ' (tạm tính)' : '') + ' · đã kiểm ' + sc.counts.done + '/' + sc.counts.total + ' mục');
  if (sc.cos.grade) L.push('Ngoại hình: ' + sc.cos.grade.id + ' (' + sc.cos.grade.name + ') · Chức năng: ' + (sc.faults.length ? sc.faults.length + ' lỗi' : 'chưa thấy lỗi'));
  if (v.verdict) L.push('Kết luận: ' + v.verdict.stamp.toUpperCase() + (v.reasons.length ? ' — ' + v.reasons.join('; ') : ''));
  if (v.fair && !sc.ko.length) L.push('Giá hợp lý: ' + fmtMoney(v.fair, v.cur) + (v.ask ? ' · Người bán đòi: ' + fmtMoney(v.ask, v.cur) : ''));
  if (v.offers) L.push('Trả giá: mở đầu ' + fmtMoney(v.offers.open, v.cur) + ', tối đa ' + fmtMoney(v.offers.max, v.cur));
  if (v.found.length) {
    L.push('Lỗi đã thấy:');
    v.found.forEach(d => L.push('  • ' + d.name + ' (' + d.level + '): ' + (d.amount >= 0 ? '−' : '+') + fmtMoney(Math.abs(d.amount), v.cur)));
  }
  const todo = sc.rows.filter(r => r.status === 'todo' && !r.item.optional);
  if (todo.length) L.push('Chưa kiểm: ' + todo.map(r => textOf(r.item.t, c)).join(', '));
  L.push('Giá tham chiếu: ' + (v.ref.value ? fmtMoney(v.ref.value, v.cur) : '—') + ' (' + v.ref.text + ')');
  return L.join('\n');
}
