#!/usr/bin/env python3
"""Sinh src/data-laptops.js (LAPTOP_MORE: laptop Lenovo, HP, Apple, ASUS, Acer, MSI) từ tests/laptop-data/*.txt.

Mỗi tệp .txt: dòng "## brand=… line=… group=…" mở một nhóm, rồi mỗi đời máy một dòng, các cột cách nhau bởi "|":
  tên | năm | ra mắt (YYYY-MM) | cỡ màn | CPU | card | RAM | màn hình | nặng kg | pin Wh | giá Mỹ USD | thêm
Cột "thêm": series=…; codes=A,B; aliases=X,Y; note=…; charger=…; usdNote=…
Giá máy cũ ở Việt Nam: tests/laptop-data/vn-raw.txt ("@ url" rồi các dòng tên | CPU | card | RAM/SSD | giá).
Chạy lại sau khi sửa: python3 tools/make_laptop_data.py
"""
import json, pathlib, re, sys
from urllib.parse import urlparse

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / 'tests' / 'laptop-data'
OUT = ROOT / 'src' / 'data-laptops.js'
SEEN = 'xem 15/11/2026'
BRAND_NAME = {'lenovo': 'Lenovo', 'hp': 'HP', 'apple': '', 'asus': 'ASUS', 'acer': 'Acer', 'msi': 'MSI'}
COLS = ['name', 'year', 'launch', 'size', 'cpu', 'gpu', 'ram', 'display', 'weight', 'battery', 'usd', 'extra']
DGPU = re.compile(r'NVIDIA|GeForce|RTX|GTX|Quadro|MX\s?\d{3}|\bT\d{3,4}\b|\bA\d{3,4}\b|Radeon (?:Pro|RX)|RX \d{4}|Arc A\d', re.I)
STRIP_WORDS = r'\b(?:lenovo|hp|apple|asus|acer|msi|laptop|gaming|notebook|cũ|like new|new|mobile workstation)\b'


def num(v):
    v = (v or '').strip()
    if not v:
        return None
    m = re.search(r'\d+(?:[.,]\d+)?', v.replace(' ', ''))
    return float(m.group(0).replace(',', '.')) if m else None


def key(s):
    s = (s or '').lower()
    s = re.sub(r'\([^)]*\)', ' ', s)
    s = re.sub(STRIP_WORDS, ' ', s)
    s = re.sub(r'\bgen(?:eration)?\s*(\d+)', r'g\1', s)
    s = re.sub(r'2[\s-]?in[\s-]?1', '2in1', s)
    s = re.sub(r'[^a-z0-9]+', ' ', s)
    return ' '.join(s.split())


def contains(hay, needle):
    return bool(needle) and re.search(r'(^| )' + re.escape(needle) + r'( |$)', hay) is not None


def code_of(brand, line, name):
    if brand == 'apple':
        return re.sub(r'^MacBook\s+', '', name)
    if brand == 'lenovo':
        if re.match(r'^(ThinkPad|ThinkBook)\s', name):
            return re.sub(r'^(ThinkPad|ThinkBook)\s+', '', name)
        return name.split()[-1]
    if brand == 'hp':
        return re.sub(r'^(EliteBook|ProBook|ZBook|Elite Dragonfly|Victus|Omen|Pavilion|Envy|Spectre|HP)\s+', '', name)
    if brand in ('asus', 'acer'):
        return name.split()[-1]
    return name


def series_of(brand, name):
    if brand == 'hp':
        return re.sub(r'\s+G\d+$', '', name)
    if brand == 'lenovo':
        if name.startswith('ThinkPad'):
            return re.sub(r'\s+Gen\s*\d+$', '', name)
        return re.sub(r'\s+\S+$', '', name)
    return re.sub(r'\s+\S+$', '', name)


def parse_models():
    models, ids = [], set()
    for f in sorted(DATA.glob('*.txt')):
        if f.name in ('vn-raw.txt', 'apple-ids.txt'):
            continue
        sect = None
        for ln, line in enumerate(f.read_text(encoding='utf-8').splitlines(), 1):
            line = line.strip()
            if not line or line.startswith('# '):
                continue
            if line.startswith('##'):
                sect = dict(re.findall(r'(\w+)=([^=]+?)(?=\s+\w+=|$)', line[2:].strip()))
                continue
            cells = [c.strip() for c in line.split('|')]
            if len(cells) != len(COLS):
                sys.exit(f'{f.name}:{ln}: cần {len(COLS)} cột, có {len(cells)}')
            r = dict(zip(COLS, cells))
            extra = {}
            for part in r['extra'].split(';'):
                if '=' in part:
                    k, v = part.split('=', 1)
                    extra[k.strip()] = v.strip()
            brand, line_key = sect['brand'], sect['line']
            name = r['name']
            full = name if BRAND_NAME[brand] and name.startswith(BRAND_NAME[brand] + ' ') else (BRAND_NAME[brand] + ' ' + name).strip()
            code = code_of(brand, line_key, name)
            codes = []
            for c in extra.get('codes', '').split(','):
                c = c.strip()
                if re.fullmatch(r'\d{1,2}', c) and codes and re.match(r'^Mac', codes[-1]):
                    codes[-1] += ',' + c  # Model Identifier kiểu Mac14,2 / MacBookPro17,1
                elif c:
                    codes.append(c)
            if brand in ('asus', 'acer') and code not in codes:
                codes.append(code)
            mid = 'lp-' + brand + '-' + re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
            if mid in ids:
                sys.exit(f'{f.name}:{ln}: trùng id {mid}')
            ids.add(mid)
            usd = num(r['usd'])
            m = {
                'id': mid, 'brand': brand, 'group': sect['group'].strip(), 'line': line_key,
                'family': sect['group'].strip(), 'series': extra.get('series') or series_of(brand, name),
                'code': code, 'name': full, 'year': int(r['year']) if r['year'] else None,
                'launch': r['launch'], 'size': r['size'], 'cpu': r['cpu'], 'gpu': r['gpu'], 'ram': r['ram'],
                'display': r['display'], 'weight': num(r['weight']), 'battery': r['battery'],
                'charger': extra.get('charger', ''), 'usd': (int(usd) if usd and usd == int(usd) else usd),
                'usdNote': extra.get('usdNote', ''), 'note': extra.get('note', ''),
                'dgpu': bool(DGPU.search(r['gpu'])) and brand != 'apple',
                'codes': codes, 'aliases': [a.strip() for a in extra.get('aliases', '').split(',') if a.strip()],
            }
            models.append(m)
    return models


def apple_parse(s):
    t = s.lower()
    fam = 'neo' if 'neo' in t else 'air' if 'air' in t else 'pro' if re.search(r'macbook pro', t) else None
    chip = re.search(r'\b(m[1-6])(?:\s*(pro|max))?\b', t)
    chip = (chip.group(1) + (' ' + chip.group(2) if chip.group(2) else '')) if chip else None
    size = re.search(r'\b(13|14|15|16)\b', t)
    size = size.group(1) if size else None
    year = re.search(r'\b(20[12]\d)\b', t)
    year = int(year.group(1)) if year else None
    return fam, chip, size, year


def apple_match(models, raw):
    fam, chip, size, year = apple_parse(raw)
    out = []
    for m in models:
        if m['brand'] != 'apple':
            continue
        mf, mc, ms, my = apple_parse(m['name'])
        if fam != mf or (chip or None) != (mc or None):
            continue
        if size and ms and size != ms and not (fam == 'air' and size == '13' and ms == '13'):
            continue
        if not size and ms not in ('13', None) and fam != 'neo':
            continue
        if year and my and year != my and chip is None:
            continue
        out.append(m)
    if len(out) > 1:
        out = [m for m in out if ('oled' in m['name'].lower()) == ('oled' in raw.lower())]
    return out[0] if len(out) == 1 else None


def attach_prices(models):
    url, rows, miss = '', {}, []
    for line in (DATA / 'vn-raw.txt').read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        if line.startswith('@'):
            url = line[1:].strip()
            continue
        c = [x.strip() for x in line.split('|')]
        name, cpu, gpu, mem, price = c[0], c[1], c[2], c[3], int(c[4])
        hpc = re.search(r'\b(1[3-7]s?)-([a-z]{1,2})(\d)', name.lower())
        if 'macbook' in name.lower():
            hit = apple_match(models, name)
        elif hpc and next((m for m in models if (hpc.group(1) + '-' + hpc.group(2) + hpc.group(3)) in [c.lower() for c in m['codes']]), None):
            hit = next(m for m in models if (hpc.group(1) + '-' + hpc.group(2) + hpc.group(3)) in [c.lower() for c in m['codes']])
        else:
            k = key(name)
            best, blen = None, 0
            for m in models:
                if m['brand'] == 'apple':
                    continue
                for cand in [m['name'], m['code'], *m['aliases'], *m['codes']]:
                    ck = key(cand)
                    if len(ck) > blen and contains(k, ck) and (cand != m['code'] or len(ck) > 4):
                        best, blen = m, len(ck)
            hit = best
        if not hit:
            miss.append(name)
            continue
        cfg = ' · '.join(x for x in [cpu, gpu, (mem.replace('/', ' GB/') + ('' if mem.endswith('TB') else ' GB')) if mem and '/' in mem and mem.split('/')[1] else ''] if x)
        rows.setdefault(hit['id'], []).append((price, cfg, url))
    for m in models:
        r = rows.get(m['id'])
        if not r:
            continue
        lo, hi = min(x[0] for x in r), max(x[0] for x in r)
        cheap = min(r, key=lambda x: x[0])
        m['vnd'] = [round(lo, -5), round(hi, -5)]
        m['vndSrc'] = cheap[2]
        m['vndShop'] = urlparse(cheap[2]).netloc.replace('www.', '')
        m['vndSeen'] = SEEN
        m['vndNote'] = ('rẻ nhất: ' + cheap[1] if cheap[1] else '') + (' · ' if cheap[1] else '') + str(len(r)) + ' tin rao'
    return miss


def main():
    models = parse_models()
    miss = attach_prices(models)
    head = ('// Sinh tự động bởi tools/make_laptop_data.py từ tests/laptop-data/*.txt. Đừng sửa tay.\n'
            '// Thông số tổng hợp từ trang hãng (PSREF Lenovo, HP, Apple, everymac.com) và bài đánh giá; giá cũ ở Việt Nam từ cửa hàng, ghi nguồn và ngày xem.\n')
    rows = [{k: v for k, v in m.items() if v not in ('', None, [], False) or k == 'dgpu'} for m in models]
    body = 'const LAPTOP_MORE = [\n' + ',\n'.join('  ' + json.dumps(r, ensure_ascii=False) for r in rows) + '\n];\n'
    OUT.write_text(head + body, encoding='utf-8')
    by = {}
    for m in models:
        by[m['brand']] = by.get(m['brand'], 0) + 1
    print(OUT.relative_to(ROOT), len(models), 'đời máy', by)
    print('  có giá Mỹ:', sum(1 for m in models if m.get('usd')), '· có giá VN:', sum(1 for m in models if m.get('vnd')))
    if miss:
        print('  tin rao chưa khớp đời máy nào:', ', '.join(sorted(set(miss))))


if __name__ == '__main__':
    main()
