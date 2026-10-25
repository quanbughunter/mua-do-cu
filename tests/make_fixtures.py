#!/usr/bin/env python3
"""Tạo ảnh JPEG tối giản có EXIF + MakerNote giống máy thật, để kiểm bộ đọc số chụp.
Đáp án được đối chiếu bằng ExifTool (xem tests/run.js)."""
import struct, pathlib

OUT = pathlib.Path(__file__).resolve().parent / 'fixtures'
OUT.mkdir(exist_ok=True)

def ifd(entries, base_off, le=True):
    """entries: list of (tag, type, count, bytes). Returns (ifd_bytes, data_bytes) where data follows the IFD."""
    e = '<' if le else '>'
    n = len(entries)
    data = b''
    out = struct.pack(e + 'H', n)
    data_start = base_off + 2 + 12 * n + 4
    for tag, typ, count, raw in sorted(entries):
        if len(raw) <= 4:
            out += struct.pack(e + 'HHI', tag, typ, count) + raw.ljust(4, b'\0')
        else:
            off = data_start + len(data)
            out += struct.pack(e + 'HHII', tag, typ, count, off)
            data += raw + (b'\0' if len(raw) % 2 else b'')
    out += struct.pack(e + 'I', 0)
    return out + data

def asc(s):
    b = s.encode() + b'\0'
    return (2, len(b), b)

def jpeg(make, model, makernote_fn, body_serial=None):
    # TIFF: header(8) | IFD0 | ExifIFD | MakerNote
    le = True
    ifd0_off = 8
    make_e, model_e = asc(make), asc(model)
    # IFD0 has 3 entries: Make, Model, ExifPointer → size = 2+36+4 + data
    ifd0_size = len(ifd([(0x010F,) + make_e, (0x0110,) + model_e, (0x8769, 4, 1, b'\0\0\0\0')], ifd0_off))
    exif_off = ifd0_off + ifd0_size
    exif_off += exif_off % 2
    # Exif IFD entries: MakerNote (+ BodySerial)
    n_ex = 1 + (1 if body_serial else 0)
    mn_off = exif_off + 2 + 12 * n_ex + 4   # MakerNote (0x927C) là khối dữ liệu đầu tiên sau IFD
    mn = makernote_fn(mn_off)
    ex_entries = [(0x927C, 7, len(mn), mn)]
    if body_serial:
        ex_entries.append((0xA431,) + asc(body_serial))
    exif = ifd(ex_entries, exif_off)
    ifd0 = ifd([(0x010F,) + make_e, (0x0110,) + model_e, (0x8769, 4, 1, struct.pack('<I', exif_off))], ifd0_off)
    tiff = b'II*\0' + struct.pack('<I', ifd0_off) + ifd0
    tiff = tiff.ljust(exif_off, b'\0') + exif
    # MakerNote placed by ifd(): it's the first data blob after the Exif IFD entries
    app1 = b'Exif\0\0' + tiff
    return b'\xff\xd8' + b'\xff\xe1' + struct.pack('>H', len(app1) + 2) + app1 + b'\xff\xd9'

def check_mn_offset(blob, mn, expect_off):
    i = blob.find(mn)
    assert i - 12 == expect_off, (i - 12, expect_off)

# --- Canon: MakerNote là IFD thường, offset tính từ đầu TIFF ---
def canon(serial, ci_size, sc_off, count):
    def fn(at):
        ci = bytearray(ci_size)
        ci[sc_off:sc_off + 4] = struct.pack('<I', count)
        return ifd([(0x000C, 4, 1, struct.pack('<I', serial)), (0x000D, 7, len(ci), bytes(ci))], at)
    return fn

# --- Sony: phần đầu "SONY DSC \0\0\0", khối 0x9050 mã hoá thay thế b^3 mod 249 ---
def sony_enc(b):
    return (b * b * b) % 249 if b < 249 else b

def sony(sc_off, count, size=0x200, first5zero=False):
    def fn(at):
        plain = bytearray(size)
        for i in range(size):
            plain[i] = (i * 7 + 3) % 251
        if first5zero:
            plain[0:5] = b'\0\0\0\0\0'
        plain[sc_off:sc_off + 4] = struct.pack('<I', count)
        enc = bytes(sony_enc(b) for b in plain)
        if first5zero:
            enc = b'\0\0\0\0\0' + enc[5:]
        return b'SONY DSC \0\0\0' + ifd([(0x9050, 7, len(enc), enc), (0x2000, 7, 4, b'\0\0\0\0')], at + 12)
    return fn

# --- Nikon: "Nikon\0\x02\x10\0\0" + TIFF riêng, offset tính từ TIFF trong MakerNote ---
def nikon(serial, count, mech=None):
    def fn(at):
        ents = [(0x0001, 7, 4, b'0210'), (0x001D, ) + asc(serial), (0x00A7, 4, 1, struct.pack('<I', count))]
        if mech is not None:
            ents.append((0x0037, 4, 1, struct.pack('<I', mech)))
        return b'Nikon\0\x02\x10\0\0' + b'II*\0' + struct.pack('<I', 8) + ifd(ents, 8)
    return fn

# --- Fujifilm: "FUJIFILM" + offset IFD (LE), offset tính từ đầu MakerNote ---
def fuji(serial, count):
    def fn(at):
        return b'FUJIFILM' + struct.pack('<I', 12) + ifd([(0x0000, 7, 4, b'0130'), (0x0010,) + asc(serial), (0x1438, 3, 1, struct.pack('<H', 0x8000 | count))], 12)
    return fn

CASES = [
    ('canon-r6.jpg', 'Canon', 'Canon EOS R6', canon(123456789, 0x0B00, 0x0AF1, 45678), None),
    ('canon-r50.jpg', 'Canon', 'Canon EOS R50', canon(98765, 0x0E00, 0x0D29, 12345), None),
    ('canon-r10.jpg', 'Canon', 'Canon EOS R10', canon(4242, 0x0E00, 0x0D29, 777), None),
    ('sony-a7iii.jpg', 'SONY', 'ILCE-7M3', sony(0x3A, 23456), 'SONY-BODY-1'),
    ('sony-a7iv.jpg', 'SONY', 'ILCE-7M4', sony(0x3A, 0x01ABCDE), None),
    ('sony-a6700.jpg', 'SONY', 'ILCE-6700', sony(0x0A, 8765), None),
    ('sony-zve10.jpg', 'SONY', 'ZV-E10', sony(0x3A, 5432), None),
    ('sony-a77.jpg', 'SONY', 'SLT-A77V', sony(0x32, 54321, 0xC00), None),
    ('nikon-z6ii.jpg', 'NIKON CORPORATION', 'NIKON Z 6_2', nikon('6012345', 34567), None),
    ('nikon-d850.jpg', 'NIKON CORPORATION', 'NIKON D850', nikon('7654321', 120000, 98000), None),
    ('fuji-xt5.jpg', 'FUJIFILM', 'X-T5', fuji('FF12345678 ABCDEF', 9876), None),
]

# --- Nhật ký *#9900# của Samsung (tổng hợp, không chứa dữ liệu thật) ---
def galaxy_dump(path):
    """Gói dumpState giả: dumpstate.txt có các dòng pin như máy thật, chèn giữa nhiều dòng đệm
    để bộ đọc phải giải nén theo luồng. Đáp án: BSOH 90, ASOC 91, 412 vòng, 45,2 °C, 5000 mAh."""
    import zipfile
    pad = ''.join('10-25 12:%02d:%02d.000  1000  963  963 D Filler: dong dem so %d de tep du lon\n' % (i // 60 % 60, i % 60, i) for i in range(10000))
    txt = ('== dumpstate: 2026-10-25 12:00:00\n'
           "Build fingerprint: 'samsung/e3qxxx/e3q:16/BP4A.251205.006/S928BXXS6DZI1:user/release-keys'\n"
           '[ro.product.model]: [SM-S928B]\n[ro.build.PDA]: [S928BXXS6DZI1]\n' + pad +
           '10-24 16:20:52.439  1000   963  1056 D BatteryService: !@[BatteryInfo] writeToFile /sys/class/power_supply/battery/battery_cycle: 410\n' + pad +
           'health: vendor.samsung.hardware.health@2.0::ISehHealth@Proxy\nBatteryInfoBackUp\n'
           '  mSavedBatteryAsoc: 91\n  mSavedBatteryBsoh: 90\n  mSavedBatteryMaxTemp: 452\n  mSavedBatteryMaxCurrent: 4300\n  mSavedBatteryUsage: 41250\n' + pad +
           '10-25 02:05:43.112  1000   963  1056 D BatteryService: !@[BatteryInfo] writeToFile /sys/class/power_supply/battery/battery_cycle: 412\n'
           'HealthInfo{.batteryLevel = 88, .batteryCycleCount = 0, .batteryFullCharge = 5000000, .batteryChargeCounter = 4400000}\n' + pad)
    with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr('version.txt', '2.0')
        z.writestr('FS/data/misc/recovery/ro.build.fingerprint', 'samsung/e3qxxx/e3q')
        z.writestr('dumpstate_board.txt', 'board info\nmSavedBatteryAsoc: 12\n')
        z.writestr('dumpstate.txt', txt)

if __name__ == '__main__':
    for name, make, model, fn, bs in CASES:
        (OUT / name).write_bytes(jpeg(make, model, fn, bs))
        print('wrote', name)
    galaxy_dump(OUT / 'galaxy-dumpstate.zip')
    print('wrote galaxy-dumpstate.zip')
