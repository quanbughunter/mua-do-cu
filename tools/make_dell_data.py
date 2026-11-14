#!/usr/bin/env python3
"""Sinh src/data-dell.js từ tests/dell-data/*.json.

Mỗi tệp JSON là một đợt tra cứu (Precision / Latitude-Vostro / XPS-Inspiron-G…), dạng:
  {"naming_rules": [{"rule", "src"}],
   "models": [{"code", "line", "name", "exists", "year", "launch", "size", "cpu", "gpu", "ram", "storage",
               "display", "weight_kg", "battery_wh", "usd_launch", "usd_src", "spec_src", "note"}],
   "vn_prices": [{"code", "line"?, "config", "vnd_min", "vnd_max", "condition", "shop", "url", "seen"}]}
Sửa số liệu thì sửa JSON rồi chạy lại: python3 tools/make_dell_data.py
"""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / 'tests' / 'dell-data'
OUT = ROOT / 'src' / 'data-dell.js'

SHORT = {'precision': 'Precision', 'promax': 'Pro Max', 'latitude': 'Latitude', 'pro': 'Pro', 'vostro': 'Vostro', 'xps': 'XPS',
         'inspiron': 'Inspiron', 'g': 'G', 'dell': 'Dell'}
GROUPS = {
    'precision': 'Dell Precision', 'promax': 'Dell Pro Max', 'latitude': 'Dell Latitude', 'pro': 'Dell Pro',
    'vostro': 'Dell Vostro', 'xps': 'Dell XPS', 'inspiron': 'Dell Inspiron', 'g': 'Dell G (chơi game)', 'dell': 'Dell (tên mới 2025)',
}
ORDER = list(GROUPS)
NEW_CODE = re.compile(r'\b((?:[DPM][ABC]\d{5})|(?:PW[57]\d{5}))\b')
DGPU = re.compile(r'NVIDIA|GeForce|RTX|GTX|Quadro|MX\s?\d{3}|\bT\d{3,4}\b|\bA\d{3,4}\b|Radeon (?:Pro|RX)|Arc A\d', re.I)


# Thông số tra được viết bằng tiếng Anh: bỏ ghi chú nghiên cứu trong ngoặc, dịch các từ hay gặp.
META = re.compile(r'\s*\((?=[^()]*(?:verif|Wikipedia|per |listed|lists|NBC|source|VN |Neowin|review|tested|doc says|mentioned|at retail|Dell ships))[^()]*\)', re.I)
TERMS = [
    # cụm riêng, phải chạy trước các từ đơn
    (r'(\d+)\.(\d)in bay on some configs', r'khay \1,\2″ ở một số bản'), (r'\bdGPU configs exist\b', 'có bản card rời'), (r'\bnon-ECC\b', 'không ECC'),
    (r'\bplus (?=thế hệ|\d+(?:st|nd|rd|th))', 'và '), (r'\bdual-core\b', '2 nhân'), (r'\bquad-core\b', '4 nhân'), (r'\b(\d+)-core\b', r'\1 nhân'),
    (r'\((\d+)-rated\)', r'(hỗ trợ \1)'), (r'\blow-power\b', 'tiết kiệm điện'), (r'\blow[- ]blue[- ]light\b', 'giảm ánh sáng xanh'),
    (r'\bprivacy\b', 'chống nhìn trộm'), (r'\(other options?\)', '(còn bản khác)'), (r'\bon board \(soldered\)', 'hàn trên bo'),
    (r'\bsoldered \(on board\)', 'hàn trên bo'), (r'\bon board\b', 'hàn trên bo'), (r'\bclamshell\b', 'bản thường'), (r'\bwith pen\b', 'có bút'),
    (r'\bpen\b', 'bút'), (r'\bon non-magnesium\b', 'ở bản vỏ không phải magie'), (r'\bmagnesium\b', 'magie'), (r'\bat launch\b', 'lúc ra mắt'),
    (r'from Mar-Apr (\d{4})', r'từ 03–04/\1'), (r'\bAMD Ryzen AI versions\b', 'có bản AMD Ryzen AI'), (r'\bversions\b', 'bản'),
    (r'\bsome markets\b', 'một số thị trường'), (r'\bdual-drive\b', '2 ổ'), (r'\s*\bguide\b', ''),
    (r'(\d+)\.(\d)in\b', r'\1,\2″'), (r'(\d+)in\b', r'\1″'),
    (r'\(later SKUs with ([^)]*?) seen\)', r'(bản sau có \1)'), (r'\b(\d[\d\s/\-–]*GB) configs\b', r'bản \1'), (r'\s*\bconfigs? seen\b', ''),
    (r'\s*\bseen\b', ''), (r'\b(\S+) added in (\d{4})', r'\1 có thêm từ \2'), (r';?\s*soldered status not verified', ''),
    (r'\s*-\s*not verified from a Dell spec', ''), (r'\(US configs\)', '(bản Mỹ)'), (r'\((?:not |non-)replaceable\)', '(không thay được)'),
    (r'\(replaceable\)', '(thay được)'), (r'\b(\d{4}) refresh with ', r'bản làm mới \1 có '), (r'\(same code\)', '(cùng số hiệu)'),
    (r'from (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (\d{4})', lambda m: 'từ ' + '%02d' % ('JanFebMarAprMayJunJulAugSepOctNovDec'.index(m.group(1)) // 3 + 1) + '/' + m.group(2)),
    (r'\banti-glare\b', 'chống chói'), (r'\bmatte\b', 'nhám'), (r'\((\d+) ?W class\)', r'(\1 W)'), (r'\(([^()]*?) common\)', r'(hay gặp \1)'),
    (r'\bin China\b', 'ở Trung Quốc'), (r'\bon[- ](?:CPU )?package\b', 'trong chip'), (r'(\d+)-series\b', r'dòng \1'), (r'(\S+) series\b', r'dòng \1'),
    (r'\be\.g\.', 'vd.'), (r'\bsome (?:SKUs|configs)\b', 'một số bản'), (r'\(some configs\)', '(một số bản)'), (r'\blikely\b', 'có lẽ'),
    (r'higher-res (\S+) option(?:al)?', r'tuỳ chọn \1 nét hơn'), (r'\(config-dependent\)', '(tuỳ cấu hình)'), (r'\(later ([^)]*?) option(?:al)?\)', r'(sau có thêm \1)'), (r'\((?:only panel|panel only)\)', '(một loại màn)'), (r'\(([^()]*?) refresh\)', r'(\1 làm mới)'), (r'\bDell PR:', 'Dell công bố:'), (r', (i\d) only\)', r', chỉ bản \1)'),
    (r'\(panel only\)', '(một loại màn)'), (r'\bno SO-?DIMM\b', 'không có khe RAM rời'), (r'\bsoldered\b', 'hàn trên bo'),
    (r'\bsome\b', 'một số'), (r'\bconfigs?\b', 'bản'),
    (r'\s*\bper (?:Wikipedia|NBC|Dell|spec sheet)\b', ''), (r'(\d+)(?:st|nd|rd|th)[- ]gen(?:eration)?\b', r'thế hệ \1'),
    (r'\(touch opt\.?\)', '(tuỳ chọn cảm ứng)'), (r'\btouch optional\b', 'tuỳ chọn cảm ứng'), (r'\btouch/non-touch\b', 'có hoặc không cảm ứng'),
    (r'\bnon-touch\b', 'không cảm ứng'), (r'\btouch(?:screen)?\b', 'cảm ứng'), (r'\(opt\.?\)', '(tuỳ chọn)'), (r'\boptional\b', 'tuỳ chọn'),
    (r'\bopt\.', 'tuỳ chọn'), (r'\boptions?\b', 'tuỳ chọn'), (r'\bup to\b', 'tới'), (r'\bmax\.?\b', 'tối đa'), (r'\bmin\.?\b', 'tối thiểu'),
    (r'\bfrom (?=\S)', 'từ '), (r' to (?=\S)', ' đến '), (r'\bor\b', 'hoặc'), (r'\band\b', 'và'), (r'\bwith\b', 'khi có'), (r'\beach\b', 'mỗi ổ'),
    (r'\bslots?\b', 'khe'), (r'\b(?:onboard|soldered)\b', 'hàn trên bo'), (r'\bmodules?\b', 'thanh'), (r'\bnits\b', 'nit'),
    (r'\bthin\b', 'bản mỏng'), (r'\bperformance\b', 'bản hiệu năng'), (r'\bchassis\b', 'vỏ'), (r'\bincl\.', 'gồm'), (r'\bcores\b', 'nhân'),
    (r'\bdrives?\b', 'ổ'), (r'\bIntel (?:UHD |Iris Xe )?Graphics\b', lambda m: m.group(0) + ' (tích hợp)'), (r'\bintegrated\b', 'tích hợp'),
    (r'\bonly\b', 'chỉ'), (r'\bversion\b', 'bản'), (r'(\d+\s?Wh) battery', r'pin \1'), (r'\bbattery\b', 'pin'), (r'\bkeyboard\b', 'bàn phím'),
    (r'\bunder\b', 'dưới'), (r'\(no ', '(không có '), (r'\bpossible\b', 'lắp được'), (r'\bnot\b', 'không'), (r'\balso\b', 'cũng'),
    (r'(\d+)\.(\d)\s?(?:"|″|-inch|inch)', r'\1,\2″'), (r'(\d+)\s?(?:"|-inch\b|inch\b)', r'\1″'),
]


def vi(v):
    v = clean(v)
    if not v:
        return ''
    v = META.sub('', v)
    for pat, rep in TERMS:
        v = re.sub(pat, rep, v, flags=re.I)
    return re.sub(r'\s+', ' ', v).strip(' ;,')


def line_key(rec):
    t = ' '.join(str(rec.get(k) or '') for k in ('line', 'name')).lower()
    t = re.sub(r'\s+', ' ', t)
    if 'pro max' in t:
        return 'promax'
    for k in ('precision', 'latitude', 'vostro', 'inspiron', 'xps', 'alienware'):
        if k in t:
            return k
    if re.search(r'\bg\s?1[56]\b|\bg series\b|^g\b|dell g\b', t):
        return 'g'
    if re.search(r'\bdell pro\b|^pro\b', t):
        return 'pro'
    if re.search(r'\bdell\b|^\d', t):
        return 'dell'
    return None


def clean(v):
    if v is None:
        return ''
    if isinstance(v, (list, tuple)):
        v = '; '.join(str(x) for x in v if x)
    return re.sub(r'\s+', ' ', str(v)).strip()


def size_of(rec):
    m = re.search(r'(\d{2}(?:[.,]\d)?)', clean(rec.get('size')))
    if not m:
        m = re.search(r'\b(1[2-8])\b', clean(rec.get('name')))
    if not m:
        return ''
    return m.group(1).replace('.', ',') + '″'


def num(v):
    if v is None or v == '':
        return None
    if isinstance(v, (int, float)):
        return v
    m = re.search(r'\d+(?:[.,]\d+)?', str(v).replace(' ', ''))
    return float(m.group(0).replace(',', '.')) if m else None


def usd_of(v):
    v = num(v)
    if not v:
        return None
    return int(v) if v == int(v) else round(v, 2)


def series_of(key, code, name):
    if code and re.fullmatch(r'\d{4}', code):
        if key == 'xps':
            return 'XPS'
        if key == 'g':
            return 'G' + code[0]
        return SHORT[key] + ' ' + code[0] + '000'
    tier = re.search(r'\b(Plus|Premium)\b', name)
    return SHORT[key] + ' ' + (tier.group(1) if tier else 'Base')


def vnd_of(prices):
    """Gộp các tin rao cùng một đời máy: khoảng thấp nhất – cao nhất, kèm một nguồn tiêu biểu."""
    rows = []
    for p in prices:
        lo, hi = num(p.get('vnd_min')), num(p.get('vnd_max'))
        if not lo and not hi:
            continue
        lo, hi = lo or hi, hi or lo
        if lo > hi:
            lo, hi = hi, lo
        if lo < 1000:  # ghi theo triệu
            lo, hi = lo * 1e6, hi * 1e6
        rows.append((int(lo), int(hi), p))
    if not rows:
        return None
    lo = min(r[0] for r in rows)
    hi = max(r[1] for r in rows)
    # nguồn tiêu biểu: tin có link, giá giữa khoảng
    mid = (lo + hi) / 2
    rows.sort(key=lambda r: (not r[2].get('url'), abs((r[0] + r[1]) / 2 - mid)))
    p = rows[0][2]
    seen = clean(p.get('seen'))
    sm = re.match(r'(\d{4})-(\d{2})(?:-(\d{2}))?', seen)
    seen_vi = ('xem ' + (sm.group(3) + '/' if sm.group(3) else '') + sm.group(2) + '/' + sm.group(1)) if sm else seen
    note = vi(p.get('config'))
    if len(rows) > 1:
        note = (note + ' · ' if note else '') + str(len(rows)) + ' tin rao'
    return {
        'vnd': [round(lo, -5), round(hi, -5)], 'vndSrc': clean(p.get('url')), 'vndShop': clean(p.get('shop')),
        'vndSeen': seen_vi, 'vndNote': note, 'vndCond': clean(p.get('condition')),
    }


def main():
    files = sorted(f for f in DATA.glob('*.json') if f.name != 'notes-vi.json')
    notes_f = DATA / 'notes-vi.json'
    notes_vi = json.loads(notes_f.read_text(encoding='utf-8')) if notes_f.exists() else {}
    if not files:
        sys.exit('Không có tệp nào trong ' + str(DATA))
    models, rules, seen_ids, skipped = [], [], set(), []
    for f in files:
        d = json.loads(f.read_text(encoding='utf-8'))
        rules += [r for r in d.get('naming_rules', []) if r.get('rule')]
        recs = [r for r in d.get('models', [])]
        prices = d.get('vn_prices', [])
        for r in recs:
            if r.get('exists') is False:
                skipped.append(clean(r.get('name') or r.get('code')))
                continue
            key = line_key(r)
            if key not in GROUPS:
                skipped.append(clean(r.get('name') or r.get('code')) + ' (không rõ dòng)')
                continue
            name = clean(r.get('name')) or (GROUPS[key] + ' ' + clean(r.get('code')))
            if not name.lower().startswith('dell'):
                name = 'Dell ' + name
            code = clean(r.get('code')).upper().replace('DELL ', '')
            m4 = re.search(r'\b(\d{4})\b', code) or (re.search(r'\b(\d{4})\b', name) if key not in ('promax', 'pro', 'dell') else None)
            codes = sorted(set(NEW_CODE.findall(' '.join(clean(r.get(k)) for k in ('code', 'name', 'note', 'codes', 'cpu')))))
            name = re.sub(r'\s*\([^()]*\b(?:[DPM][ABC]\d{5}|PW\d{6})\b[^()]*\)', '', name).strip()
            if m4:
                code = m4.group(1)
            elif key in ('promax', 'pro', 'dell'):
                code = re.sub(r'^Dell\s+', '', name)
            gpu = clean(r.get('gpu'))
            m = {
                'id': 'dl-' + key + '-' + re.sub(r'[^a-z0-9]+', '-', code.lower()).strip('-'),
                'brand': 'dell', 'group': GROUPS[key], 'line': key, 'family': SHORT[key],
                'series': series_of(key, code, name), 'code': code, 'name': name,
                'year': int(num(r.get('year'))) if num(r.get('year')) else None,
                'launch': clean(r.get('launch')), 'size': size_of(r),
                'cpu': vi(r.get('cpu')), 'gpu': vi(gpu), 'ram': vi(r.get('ram')), 'storage': vi(r.get('storage')),
                'display': vi(r.get('display')), 'weight': num(r.get('weight_kg')),
                'battery': clean(r.get('battery_wh')).replace(' Wh', '').replace('Wh', ''),
                'charger': clean(r.get('charger')),
                'usd': usd_of(r.get('usd_launch')),
                'usdSrc': clean(r.get('usd_src')), 'specSrc': clean(r.get('spec_src')),
                'dgpu': bool(DGPU.search(gpu)), 'codes': codes,
            }
            nv = notes_vi.get(key + ':' + code) or notes_vi.get(code) or {}
            if isinstance(nv, str):
                nv = {'note': nv}
            m.update({k: val for k, val in nv.items() if k in ('note', 'usdNote', 'charger', 'usd', 'usdSrc', 'year', 'launch')})
            base, n = m['id'], 2
            while m['id'] in seen_ids:
                m['id'] = base + '-' + str(n)
                n += 1
            seen_ids.add(m['id'])
            # giá cũ ở VN: cùng số hiệu, nếu tin có ghi dòng thì phải khớp dòng
            mine = []
            for p in prices:
                pc = re.sub(r'^(?:DELL\s+)?(?:PRO MAX|PRO|PRECISION|LATITUDE|VOSTRO|INSPIRON|XPS)\s*', '', clean(p.get('code')).upper())
                if not pc or (pc != code.upper() and pc != re.sub(r'^DELL\s+', '', name.upper())):
                    continue
                pl = line_key({'line': p.get('line'), 'name': p.get('config')}) if (p.get('line') or re.search(r'precision|latitude|vostro|inspiron|xps|pro max', clean(p.get('config')), re.I)) else None
                same_code = [x for x in recs if clean(x.get('code')).upper() == pc and x.get('exists') is not False]
                if pl and pl != key:
                    continue
                if re.search(r'new[- ]unit|giá máy mới|outlier|stale|doubtful|priced like new', clean(p.get('note')), re.I):
                    continue  # tin rao giá máy mới, không phải máy cũ
                if re.search(r'2-in-1|2 in 1', clean(p.get('line')) + ' ' + clean(p.get('config')), re.I) and '2-in-1' not in name:
                    continue  # bản xoay gập dùng chung số hiệu với bản thường: không gộp giá
                if not pl and len(same_code) > 1 and line_key(same_code[0]) != key:
                    continue
                mine.append(p)
            v = vnd_of(mine)
            if v:
                m.update(v)
            models.append({k: val for k, val in m.items() if val not in ('', None, [])})
    models.sort(key=lambda m: (ORDER.index(m['line']), m.get('series', ''), m.get('year') or 0, m['code']))
    head = ('// Sinh tự động bởi tools/make_dell_data.py từ tests/dell-data/*.json. Đừng sửa tay.\n'
            '// Thông số và giá ra mắt ở Mỹ lấy từ trang Dell, Notebookcheck, PCMag…; giá cũ ở Việt Nam từ các cửa hàng, có ghi nguồn và ngày xem.\n')
    body = 'const DELL_MODELS = [\n' + ',\n'.join('  ' + json.dumps(m, ensure_ascii=False) for m in models) + '\n];\n'
    srcs = []
    for r in rules:
        if r.get('src') and r['src'] not in [s[1] for s in srcs]:
            srcs.append((clean(r['rule'])[:140], r['src']))
    body += 'const DELL_RULE_SOURCES = ' + json.dumps([{'t': t, 'u': u} for t, u in srcs[:12]], ensure_ascii=False) + ';\n'
    OUT.write_text(head + body, encoding='utf-8')
    by = {}
    for m in models:
        by[m['line']] = by.get(m['line'], 0) + 1
    print(OUT.relative_to(ROOT), len(models), 'đời máy', by)
    print('  có giá Mỹ:', sum(1 for m in models if m.get('usd')), '· có giá VN:', sum(1 for m in models if m.get('vnd')))
    if skipped:
        print('  bỏ qua:', ', '.join(skipped))


if __name__ == '__main__':
    main()
