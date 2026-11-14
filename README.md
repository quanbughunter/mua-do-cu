# Soi Đồ Cũ — kiểm đồ cũ trước khi trả tiền

Web app tiếng Việt cho người **mua** đồ điện tử cũ gặp trực tiếp người bán (chợ đồ cũ, Avito, Chợ Tốt). Chọn máy, app sinh đúng danh sách cần kiểm cho đời máy đó; kiểm xong từng mục thì ra **điểm trên 100**, **giá hợp lý** và câu trả lời **mua / trả giá / bỏ**, kèm giá trả mở đầu, giá tối đa và lời trả giá bằng tiếng Việt và tiếng Nga.

Có bốn nhóm: **điện thoại** (iPhone SE 2 → 18 Pro Max, Galaxy S23–S25, Pixel 8–10, Xiaomi), **laptop** (Dell; Lenovo ThinkPad, ThinkBook, IdeaPad, Legion, LOQ, Yoga; HP EliteBook, ProBook, ZBook, Victus, Omen, Pavilion, Envy, Spectre; MacBook Air, Pro, Neo; ASUS, Acer, MSI), **tai nghe** (AirPods các đời, Sony WF/WH-1000X, Galaxy Buds, Bose) và **máy ảnh** (Canon, Sony, Nikon, Fujifilm). Có bản APK cho Android.

## Cách app chấm và định giá

1. **Nhận dạng.** Giải mã số máy Apple (ký tự đầu: máy mới, tân trang, đổi bảo hành, trưng bày; hai chữ cuối: thị trường, có cả bảng cũ và bảng mới từ iPhone 17 Pro; bản nào chỉ eSIM), kiểm IMEI bằng thuật toán Luhn, đối chiếu số model AirPods (tai trái, phải, hộp có cùng một đời không), đọc thẳng file JPEG của máy ảnh để lấy model, số sê-ri và **số lần chụp** (Nikon, Sony, Pentax, Fujifilm, Canon R5/R6/R6 II/R8/R50).
2. **Cổng chặn.** Dính iCloud/FRP, MDM, khoá mạng, IMEI lệch, hàng giả, AirPods còn khoá Find My, pin phồng, sê-ri máy ảnh lệch: chỉ một mục không đạt là **không mua**, không định giá. Đây là cách Swappa, Swappie, Apple Financial Services đang làm.
3. **Điểm 100.** Mỗi mục có trọng số và mức (Tốt 1 · Hơi kém 0,7 · Lỗi rõ 0,3 · Hỏng 0). Điểm chỉ tính trên mục đã kiểm, luôn hiện độ phủ. Có lỗi chức năng thì tối đa 69 (hạng Khá); kiểm dưới 80% khối lượng thì hạng là "tạm tính", tối đa 84. Ngoại hình được xếp riêng thành A/B/C/D như chuẩn CTIA, để một chiếc đẹp mà hỏng Face ID không bị gộp thành "hạng B".
4. **Giá hợp lý** = giá tham chiếu × hệ số ngoại hình − chi phí sửa các lỗi đã thấy − rủi ro của mục chưa kiểm.
   - Giá tham chiếu: trung vị các tin rao cùng model bạn dán vào (bỏ tin lệch xa bằng 3·MAD, trừ 5% chênh giá rao/giá chốt), hoặc giá bạn tự nhập, hoặc ước tính thô theo khấu hao nếu chưa có gì.
   - Chi phí sửa theo **từng bộ phận và từng đời máy** (bảng giá ngoài bảo hành của Apple, giá thay màn trập theo phân khúc...) × hệ số giá tiệm trong Cài đặt. Cùng một lỗi màn hình, iPhone 11 bị trừ ít hơn nhiều so với 15 Pro Max. Bấm "sửa giá" để nhập giá tiệm thật.
   - Mục chưa kiểm không được coi là đạt: mỗi mục trừ "khả năng lỗi × chi phí sửa" (vd. Face ID 15% theo số liệu bán buôn của HOBI).
5. **Kết luận.** Giá đòi ≤ giá hợp lý: mua. Cao hơn đến mức giá hợp lý ÷ 0,73: trả giá (0,73 = giá chốt / giá rao trung bình trong 25 triệu cuộc trả giá trên eBay). Cao hơn nữa: bỏ.

## Tra mã máy: bản nước nào

Ở trang đầu, mục **Tra nhanh › Mã máy → bản nước nào** (không cần tạo phiếu), hoặc ô mã máy trong tab Thông tin của phiếu điện thoại. App đọc:

- **iPhone:** số máy (MGCM3LL/A): máy mới, tân trang, đổi bảo hành hay trưng bày; mã vùng; ghi chú SIM (bản Mỹ từ iPhone 14 chỉ eSIM, bản Trung Quốc/Hồng Kông 2 khe SIM), tiếng chụp bắt buộc (Nhật, Hàn).
- **Samsung:** số model (SM-S928B/DS, SM-S928N, SM-S928U1, SM-S9280) ra đời máy và vùng; mã CSC (SER/SER/SER, dòng SAOMC, Phiên bản CSC S928BOXM…); máy nhà mạng Nhật (SC-…, SCG…).
- **Xiaomi / Redmi / POCO:** kiểu máy (2312DRA50G: chữ cuối G/Y quốc tế, C Trung Quốc, I Ấn Độ, L Mỹ Latinh, J Nhật; 4 số đầu là tháng đăng ký mẫu) và phiên bản HyperOS/MIUI (MIXM, EUXM, CNXM, RUXM…; chữ cái ra bản Android).
- **Oppo / OnePlus** (CPH quốc tế, P__### Trung Quốc), **vivo** (đuôi A thường là Trung Quốc), **Honor / Huawei** (AN00/AL00 Trung Quốc, NX9/LX9/L29 quốc tế), Realme (báo không đọc được), IMEI (kiểm Luhn).

Nhập nhiều mã cách nhau bằng dấu cách để **so chéo**: số model Samsung bản Hàn mà phần mềm bản Nga, hoặc Xiaomi bản C mà chạy ROM Global, đều bị cảnh báo là phần mềm đã bị cài lại. Trong phiếu, nếu mã không khớp đời máy đã chọn (vd. chọn S24 Ultra mà mã là S918), app báo đỏ ngay dưới ô nhập. Bảng mã do cộng đồng tổng hợp (TheAppleWiki, AndroidSage, miuirom.org), hãng không công bố đầy đủ.

## Tra tên laptop ra cấu hình

Ở trang đầu, mục **Tra nhanh › Tên laptop → cấu hình**. Gõ tên in dưới đáy máy, trong BIOS hoặc trên tin rao, app tự nhận ra hãng:

| Hãng | Gõ được | App đọc ra |
|---|---|---|
| Dell | "Precision 5560", "Latitude 7420", "XPS 15 9510", "Pro Max 16 Plus", mã "PB14250" | hạng · cỡ màn · đời · Intel/AMD |
| Lenovo | "ThinkPad T14 Gen 3", "T480", "X1 Carbon Gen 9", "Legion 5 15ACH6H", "IdeaPad 5 14ITL05", "ThinkBook 14 G4 IAP", Machine Type "20W0…" | dòng, cỡ màn, đời (Gen hoặc số cuối mã), nền tảng chip (ACH = Ryzen 5000 H, IAH = Core 12 H…), bản H của Legion |
| HP | "EliteBook 840 G8", "ProBook 450 G9", "ZBook Firefly 14 G8", "Victus 16-d0123TX", "15s-fq2xxx", tên mới "EliteBook 8 G1i 14" | hạng 400/600/800/1000, cỡ màn, Intel/AMD, G ra năm; mã sau dấu gạch ra dòng, đời chip, TU/TX/AU/AX |
| MacBook | số model "A2338", Model Identifier "Mac14,2", "MacBook Air M2", "MacBook Pro 14 M3 Pro", "MacBook Air 2019", số máy "MGN63LL/A" | đời, chip, năm; số model dùng chung nhiều đời (A2338 = M1 và M2) thì hỏi lại |
| ASUS | "FX506HC", "GA401QM", "UX3402ZA", "X515EA", "A1505VA" | dòng (TUF, ROG, Zenbook, Vivobook, ExpertBook), khung, nền tảng chip, card theo từng giai đoạn |
| Acer | "AN515-57", "A515-56", "SF314-59", "PH315-54", "ANV15-51" | dòng, hạng, cỡ màn, AMD/Intel và đời theo số sau gạch, G = card rời |
| MSI | "Katana GF66 11UE", "GF63 Thin 11UC", "Katana 15 B13VFK", "Modern 14 C12M" | đời chip, đời và hạng card (U = RTX 30, V = RTX 40…) |

Với mỗi máy, app:

- **tách từng chữ số ra nghĩa** thành các ô: dòng máy, hạng (3 / 5 / 7 / 9), cỡ màn, đời (năm), biến thể (Intel, AMD, chip H…);
- cho **cấu hình** (CPU, card, RAM, ổ, màn, nặng, pin), **tháng năm ra mắt**, **giá khởi điểm ở Mỹ** lúc ra mắt (kèm quy ra tiền Việt theo tỷ giá trong Cài đặt) và **khoảng giá máy cũ ở Việt Nam** (cửa hàng, ngày xem, link);
- gợi ý **đời trước, đời sau, cùng đời khác cỡ**; tên trùng nhiều máy (5420 có cả Latitude và Inspiron, "Zephyrus G14" có 5 đời) thì hỏi lại;
- đời chưa có trong bảng vẫn đọc theo quy tắc, ghi rõ "≈ năm" là đoán.

Bảng có khoảng 160 đời Dell và 337 đời hãng khác (Lenovo 103, HP 89, Apple 52, ASUS 43, Acer 26, MSI 24), 109 đời có giá cũ ở Việt Nam. Thông số hãng khác ghi bản phổ biến: máy cũ nhiều cấu hình, nên đối chiếu số sê-ri trên trang hãng.

Bấm **Kiểm máy này** để mở phiếu laptop. Phiếu đi theo hãng: ô số sê-ri đúng loại (Service Tag Dell, S/N và MTM Lenovo, S/N HP, số sê-ri Mac…) có link tra bảo hành của hãng, MTM Lenovo tra ra đời máy; phím vào BIOS theo hãng; máy công ty còn quản lý từ xa (Autopilot / Intune, Apple Business Manager); độ chai pin, bản lề, bàn phím, màn, chạy nặng, cổng, Wi-Fi, loa… **MacBook** có mục riêng: Khoá kích hoạt (Find My), mật khẩu firmware, `profiles status -type enrollment`, số lần sạc, bàn phím cánh bướm 2016–2019, lỗi cáp màn (flexgate) 2016–2018; bỏ các mục BIOS, Windows, card rời; khấu hao và giá sửa riêng (thay pin theo bảng giá Apple). Ô **Hãng** trên phiếu lọc danh sách đời máy cho ngắn lại.

Công cụ riêng: **đọc battery report** (`powercfg /batteryreport` trên Windows: dung lượng thiết kế, sạc đầy, số lần sạc, đúng máy hay không, nhận cả tên máy Lenovo dạng Machine Type) và **thử bàn phím** (bấm từng phím, phím nào chết thì không sáng). Giá tham chiếu của phiếu lấy giữa khoảng giá cũ ở Việt Nam khi chưa dán tin rao.

Bảng số liệu: Dell ở `tests/dell-data/*.json` → `src/data-dell.js` (`python3 tools/make_dell_data.py`); hãng khác ở `tests/laptop-data/*.txt` (mỗi đời một dòng, cột cách nhau bởi `|`) và giá cũ ở `tests/laptop-data/vn-raw.txt` → `src/data-laptops.js` (`python3 tools/make_laptop_data.py`).

## Công cụ có sẵn

Thử màn hình theo màu, thử cảm ứng phủ ô, loa trái/phải và quét tần số, ghi âm thử micro, tiếng ồn để thử chống ồn, cảm biến và rung, xem từng camera, trạng thái sạc (Android), tính độ chai pin tai nghe sau 20 phút nghe, đối chiếu số model AirPods, đọc ảnh máy ảnh (EXIF/MakerNote), tìm bụi cảm biến từ ảnh tường trắng, tìm điểm nóng và hàng/cột chết từ ảnh đậy nắp, **đọc độ khoẻ pin máy Samsung** (ASOC/BSOH, số vòng sạc) từ tệp nhật ký `*#9900#`: chọn tệp `dumpState_….zip` là app tự giải nén và dò ngay trên máy, khoảng một giây, đồng thời cảnh báo nếu nhật ký là của máy khác model trong phiếu.

Mọi thứ chạy trên máy, không gửi dữ liệu đi đâu. Phiếu lưu trong trình duyệt (localStorage); chuyển máy bằng Cài đặt › Sao chép toàn bộ phiếu.

## Cấu trúc

| Đường dẫn | Nội dung |
|---|---|
| `index.html`, `manifest.webmanifest`, `sw.js`, `icons/` | Trang web đã build (GitHub Pages phục vụ trực tiếp) |
| `src/data-common.js` | Mức chấm, hạng, hệ số ngoại hình, khấu hao, tiền tệ, ngưỡng kết luận |
| `src/data-phone.js`, `data-laptop.js`, `data-headphones.js`, `data-camera.js` | Danh mục máy và các mục kiểm theo từng loại |
| `src/data-dell.js`, `src/dell.js` | Bảng đời máy Dell (sinh từ `tests/dell-data/`) và bộ đọc tên máy Dell |
| `src/data-laptops.js`, `src/laptops.js` | Bảng đời máy Lenovo, HP, Apple, ASUS, Acer, MSI (sinh từ `tests/laptop-data/`) và bộ đọc tên máy các hãng đó |
| `src/data-money.js` | Bảng chi phí sửa theo bộ phận và luật trừ tiền cho từng mục |
| `src/decode.js` | Giải mã số máy Apple, mã máy Samsung/Xiaomi/Oppo/vivo/Honor ra thị trường, IMEI, số model AirPods, EXIF/MakerNote máy ảnh, đọc ZIP và dò pin trong nhật ký Samsung |
| `src/engine.js` | Chấm điểm, định giá, kết luận, báo cáo (không dùng DOM, chạy được trong Node) |
| `src/tools.js`, `src/ui.js`, `src/app.js` | Công cụ kiểm, giao diện, xử lý thao tác |
| `src/styles.css`, `src/shell.html` | Giao diện, biểu tượng |
| `build.py` | Gộp mọi thứ thành 1 tệp HTML có nhúng font (`dist/` và thư mục gốc) |
| `android/` | Vỏ Android (WebView) và `build_apk.sh` đóng gói APK không cần Gradle |
| `tests/` | Kiểm thử lõi, ảnh mẫu EXIF, kiểm thử giao diện bằng Playwright |

## Đưa lên GitHub Pages

1. Tạo repo công khai `quanbughunter/mua-do-cu`, kéo thư mục này vào GitHub Desktop và Publish.
2. Trên GitHub: **Settings → Pages → Source: GitHub Actions**. Workflow `.github/workflows/pages.yml` tự triển khai mỗi lần push lên `main`.
3. Địa chỉ: `https://quanbughunter.github.io/mua-do-cu/`. Mở trên điện thoại, chọn "Thêm vào màn hình chính". Các công cụ cần micro, camera, cảm biến chỉ chạy ở bản web này (HTTPS), không chạy trong khung xem trước của Claude.

## Bản Android (APK)

APK chạy y hệt bản web nhưng offline hoàn toàn, có camera, micro, rung, chọn tệp và nút Back. Trang được nạp qua tên miền ảo `https://appassets.androidplatform.net/` (không ra mạng) để camera và micro chạy được.

**Tải bản mới nhất:** https://github.com/quanbughunter/mua-do-cu/releases/latest/download/SoiDoCu.apk (trong app: Cài đặt › Bản Android › Tải APK mới nhất). Mở file và bấm Cài đặt: bản mới cài đè lên bản cũ, phiếu vẫn giữ.

**Ra bản mới (GitHub build và tạo Release):**

1. Một lần đầu: trên GitHub vào **Settings › Secrets and variables › Actions › New repository secret**, tạo hai secret lấy từ `android/keystore/GITHUB-SECRETS.txt` (chỉ có trên máy, không đưa lên GitHub): `SOIDOCU_KEYSTORE_B64` và `SOIDOCU_KEYSTORE_PASSWORD`.
2. Mỗi lần cập nhật: sửa `VERSION` trong `build.py` (vd. `0.5.1`), commit và push. Workflow **Build APK** tự chạy, build, ký bằng khoá cũ và tạo Release `v0.5.1` có `SoiDoCu-0.5.1.apk` và `SoiDoCu.apk`. Push mà không đổi `VERSION` thì không build.
3. Muốn build lại cùng số phiên bản (vd. sửa lỗi nhỏ): tab **Actions › Build APK › Run workflow**, Release cũ được thay file mới.

`versionCode` = MAJOR×10000 + MINOR×100 + PATCH (0.5.1 → 501), luôn tăng theo phiên bản. **Giữ khoá ký** `android/keystore/soi-do-cu-release.jks` và `PASSWORD.txt`: mất khoá thì bản sau không cài đè được, phải gỡ app (mất phiếu).

Build trên máy Linux / WSL (không bắt buộc): `sudo apt install aapt apksigner zipalign android-sdk-platform-23 dalvik-exchange`, rồi `python3 build.py && ./android/build_apk.sh` → `android/out/SoiDoCu-<phiên bản>.apk`.

## Sửa và build lại

```bash
python3 build.py            # tạo dist/ và cập nhật index.html, sw.js, manifest ở thư mục gốc
node tests/run.js           # kiểm thử lõi: IMEI, số máy, mã máy theo hãng, tên laptop các hãng, tiền, chấm điểm, định giá, EXIF, pin Galaxy
node tests/ui-smoke.js      # chụp màn hình 390px sáng/tối (cần Playwright)
node tests/market-smoke.js  # thử Tra nhanh mã máy, IMEI và ô mã máy trong phiếu Samsung/Xiaomi
node tests/tool-smoke.js    # chạy thử công cụ đọc ảnh, bụi, điểm nóng, pin tai nghe
node tests/dell-smoke.js    # tra tên Dell, phiếu laptop, battery report, thử bàn phím, nút Back
node tests/laptops-smoke.js # tra tên Lenovo, HP, MacBook, ASUS, Acer, MSI; phiếu MacBook; lọc hãng; battery report máy Lenovo
python3 tools/make_dell_data.py    # sinh lại src/data-dell.js sau khi sửa tests/dell-data/*.json
python3 tools/make_laptop_data.py  # sinh lại src/data-laptops.js sau khi sửa tests/laptop-data/*.txt
python3 tests/make_fixtures.py   # tạo lại ảnh JPEG mẫu (Canon, Sony, Nikon Z, Fujifilm) và nhật ký Samsung mẫu
```

Muốn thêm một model: thêm một dòng vào danh mục trong `src/data-*.js` (cờ như `faceId`, `action`, `esim`, `anc`, `ibis`, `sc`...). Muốn thêm một loại đồ mới: tạo `data-<loại>.js` theo mẫu, thêm vào `CATEGORIES` và `JS_FILES` trong `build.py`.

## Giới hạn

- Không có API hợp pháp trả về giá đã bán trên Avito hay Chợ Tốt, nên giá tham chiếu dựa vào tin rao bạn dán vào. Càng nhiều tin cùng model, cùng dung lượng, giá càng sát.
- Bảng chi phí sửa, độ bền màn trập, đường khấu hao, xác suất lỗi là **ước lượng ban đầu** từ nguồn công khai; ở Moscow cần tự gom giá tiệm sửa thật. Tỷ giá tự nhập trong Cài đặt.
- Trang web không đọc được pin, linh kiện hay khoá iCloud của iPhone: app chỉ dẫn đường và giải mã những gì bạn nhập. Không có trang công khai nào tra được khoá iCloud từ năm 2017.
- Ảnh gửi qua ứng dụng nhắn tin bị xoá EXIF; cần file JPEG gốc.

## Nguồn

Ngưỡng hạng theo Back Market, Swappa và bản nháp Wear Index; hai trục ngoại hình/chức năng theo CTIA Wireless Device Grading Scales v5.1 (2026); trần 69 điểm theo DiagnoTest (MIT); bảng trừ tiền theo đời máy tham khảo 24hStore; giá sửa Apple theo bảng giá ngoài bảo hành; cách đọc số chụp theo mã nguồn ExifTool 13.59 (ảnh mẫu `tests/fixtures/*.jpg` viết hoa lấy từ bộ kiểm thử của ExifTool, Phil Harvey, cùng giấy phép với Perl); tỉ lệ trả giá theo NBER (Backus, Blake, Larsen, Tadelis); thông số laptop theo trang hãng (Dell, PSREF Lenovo, HP, Apple), everymac.com, Notebookcheck; giá laptop cũ ở Việt Nam theo laptoptcc.com, dienthoaivui.com.vn, didongviet.vn, cellphones.com.vn (xem 15/11/2026). Báo cáo nghiên cứu đầy đủ nằm trong project "myAPP_quan".
