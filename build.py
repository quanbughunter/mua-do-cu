#!/usr/bin/env python3
"""Build Soi Đồ Cũ thành một trang duy nhất, ba bản:
  dist/artifact.html  — Claude artifact (không có khung html/head)
  dist/www/           — GitHub Pages / PWA (index.html + manifest + sw.js + icons)
Bản web cũng được chép ra thư mục gốc (index.html, sw.js, manifest.webmanifest) để GitHub Pages phục vụ.
"""
import base64, json, pathlib, shutil

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / 'src'
DIST = ROOT / 'dist'
FONTS = ROOT / 'fontsrc'
VERSION = '0.3.0'
JS_FILES = ['data-common.js', 'data-phone.js', 'data-headphones.js', 'data-camera.js', 'data-money.js',
            'decode.js', 'engine.js', 'tools.js', 'ui.js', 'app.js']

RANGES = {
    'latin': 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
    'latin-ext': 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF',
    'vietnamese': 'U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB',
}
FACES = [  # (thư mục, tên family, tiền tố file, các độ đậm)
    ('be-vietnam-pro', 'Be Vietnam Pro', 'be-vietnam-pro', (400, 500, 600, 700)),
    ('barlow-condensed', 'Barlow Condensed', 'barlow-condensed', (600, 700)),
    ('jetbrains-mono', 'JetBrains Mono', 'jetbrains-mono', (500,)),
]

def font_css():
    out = []
    for folder, family, prefix, weights in FACES:
        for w in weights:
            for sub, rng in RANGES.items():
                f = FONTS / folder / 'files' / f'{prefix}-{sub}-{w}-normal.woff2'
                if not f.exists():
                    continue
                data = base64.b64encode(f.read_bytes()).decode()
                out.append(f"@font-face{{font-family:'{family}';font-style:normal;font-weight:{w};font-display:swap;"
                           f"src:url(data:font/woff2;base64,{data}) format('woff2');unicode-range:{rng};}}")
    return '\n'.join(out)

def bundle(is_pwa):
    js = '\n'.join((SRC / f).read_text(encoding='utf-8') for f in JS_FILES)
    return ("(function () {\n'use strict';\nconst APP_VERSION = '" + VERSION + "';\nconst IS_PWA = " +
            ('true' if is_pwa else 'false') + ";\n" + js + "\n})();")

def build():
    css = (SRC / 'styles.css').read_text(encoding='utf-8')
    shell = (SRC / 'shell.html').read_text(encoding='utf-8')
    style = f'<style>\n{font_css()}\n{css}\n</style>'
    DIST.mkdir(exist_ok=True)
    desc = 'Soi Đồ Cũ — kiểm điện thoại, tai nghe, máy ảnh cũ: chấm điểm 100, ra giá hợp lý theo chi phí sửa, nên mua hay không.'

    # 1) artifact: không có khung, <title> và <style> đứng đầu
    (DIST / 'artifact.html').write_text(
        '<title>Soi Đồ Cũ</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'
        f'{style}\n{shell}\n<script>\n{bundle(False)}\n</script>\n', encoding='utf-8')

    # 2) web / PWA
    head = ('<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            '<meta name="theme-color" content="#FFFFFF" media="(prefers-color-scheme: light)">\n'
            '<meta name="theme-color" content="#161C27" media="(prefers-color-scheme: dark)">\n'
            f'<meta name="description" content="{desc}">\n'
            '<title>Soi Đồ Cũ</title>\n'
            '<link rel="manifest" href="manifest.webmanifest">\n'
            '<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">\n'
            '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">\n'
            '<meta name="apple-mobile-web-app-capable" content="yes">\n'
            '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}</style>\n')
    www = DIST / 'www'
    if www.exists():
        shutil.rmtree(www)
    www.mkdir(parents=True)
    (www / 'index.html').write_text(
        f'<!doctype html>\n<html lang="vi">\n<head>\n{head}{style}\n</head>\n<body>\n{shell}\n<script>\n{bundle(True)}\n</script>\n</body>\n</html>\n',
        encoding='utf-8')
    (www / 'manifest.webmanifest').write_text(json.dumps({
        'name': 'Soi Đồ Cũ', 'short_name': 'Soi Đồ Cũ', 'lang': 'vi', 'start_url': './', 'scope': './',
        'display': 'standalone', 'background_color': '#EEF1F5', 'theme_color': '#FFFFFF', 'description': desc,
        'icons': [
            {'src': 'icons/icon-192.png', 'sizes': '192x192', 'type': 'image/png'},
            {'src': 'icons/icon-512.png', 'sizes': '512x512', 'type': 'image/png'},
            {'src': 'icons/maskable-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'}
        ]
    }, ensure_ascii=False, indent=2), encoding='utf-8')
    (www / 'sw.js').write_text(
        "const C='soi-do-cu-" + VERSION + "';\n"
        "self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png'])));self.skipWaiting();});\n"
        "self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));self.clients.claim();});\n"
        "self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))));});\n",
        encoding='utf-8')
    icons = ROOT / 'icons'
    if icons.exists() and any(icons.iterdir()):
        shutil.copytree(icons, www / 'icons')
    (www / '.nojekyll').write_text('')
    for name in ('index.html', 'sw.js', 'manifest.webmanifest'):
        shutil.copy(www / name, ROOT / name)
    for p in [DIST / 'artifact.html', www / 'index.html']:
        print(p.relative_to(ROOT), f'{p.stat().st_size / 1024:.0f} KB')

if __name__ == '__main__':
    build()
