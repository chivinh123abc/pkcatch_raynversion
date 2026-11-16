# Phiên bản chuẩn của dự án

> **Kiểm tra bổ sung16/11/2026:** live hiện quan sát là **v0.5.02 / BUILD b05c8cc201**, app `c0081498f2`, CSS `3e06fa8ed6`. Đã tích hợp phần chiêu/FX và learnset151 loài theo [báo cáo cập nhật](LIVE_MOVE_UPDATE.md). UI/chapter chưa đối chiếu lại toàn bộ; baseline v0.4.103 phía dưới vẫn là bằng chứng cho các đợt UI trước. Dùng `npm run reference:check` để kiểm tra build nhanh.

Đã đối chiếu từng mục changelog trong [V0_5_02_UPDATE.md](V0_5_02_UPDATE.md); bổ sung preview chiêu Team/PC theo `mainMove` v0.5.02. Các mục thuộc vùng mới, trade và raid chưa áp dụng vì thiếu hệ thống tương ứng.

Chốt ngày **14/11/2026**, trong bước R00. Đây là nguồn chuẩn để triển khai các bước tiếp theo của [kế hoạch làm lại game](KE_HOACH_LAM_LAI_TOAN_BO_GAME.md).

## Bản chuẩn chính

- URL người dùng cung cấp: <https://pokecatch-online.netlify.app/>.
- Tài nguyên ứng dụng được trang này tải từ `https://pokecatch-online.pages.dev/` trong phiên kiểm tra.
- Phiên bản hiển thị trong Options: **Poke’Catch v0.4.103**.
- `window.BUILD` trong boot đã ghi: **5598c5890a**.
- JavaScript chính: `bundle/app.c0c995f8f9.js`.
- CSS chính: `bundle/app.7130b4d937.css`.
- Ngôn ngữ kiểm tra: English; Chrome headless, desktop **1440×900 CSS px**, device scale factor 1, zoom mặc định 100%.
- Profile mới, tên nhân vật thử `Audit`, không đăng nhập Discord/Google, không dùng save hoặc tài khoản của người dùng.

| Tài nguyên | SHA-256 |
|---|---|
| HTML trang Netlify | `c316581f008ed52c54007b4c20bbf1945134aeb4c47c5644642847238296ef3d` |
| `boot.js` | `597c8b762bf397b85e38a9afe20eeb094b2cefd13e13bfd66f575fff979a3ae5` |
| `app.c0c995f8f9.js` | `c0c995f8f99702b2af8e19a46a386cd6a04165c66537adb76b2a732b94a66f54` |
| `app.7130b4d937.css` | `7130b4d937e06bcbbb9c6dee9faf6ca3325aefe12c68a3f1d849ea4b6d2f3c20` |
| `lang-en.8974090e4d.js` | `8974090e4db6c9d5931571cc05778f02ba5835bd40ad263422d90d17473a876a` |

Đầy đủ URL, thời điểm, HTTP status, lỗi console và danh mục màn đã ghi nằm trong [manifest live](reference/2026-11-14/live-discovery.json). Bundle/HTML gốc đã tải nằm tại `scratch/visual-parity/reference-2026-11-14/`. Hash xác định tài nguyên đã quan sát; không chứng minh trang sẽ giữ nguyên ở lần truy cập sau.

## Thứ tự ưu tiên khi nguồn mâu thuẫn

1. Yêu cầu trực tiếp của người dùng và các điều chỉnh đã chấp nhận trong phiên làm việc.
2. Hành vi/ảnh của bản live được định danh phía trên.
3. CSS/JS của đúng bundle live để giải thích hành vi và số liệu.
4. Snapshot web cũ trong `thamkhao/gamegoc/`, video và trace cũ: dùng để bổ sung trường hợp chưa ghi lại, phải ghi nhãn nguồn.
5. APK trong `thamkhao/extracted_apk/`: chỉ là nguồn hỗ trợ dữ liệu/asset; có sửa đổi riêng, không dùng như bằng chứng bản live hiện tại.

Các ảnh `scratch/visual-parity/original-team.png`, `original-pokedex.png`, `original-new-catch.png` trước đây lấy từ replay APK. Không được đổi nhãn chúng thành ảnh live. Bộ ảnh có tiền tố `live-` trong thư mục R00 mới được chụp trực tiếp từ website.

Không đưa bundle gốc, iframe hay proxy game gốc vào bản React để đạt giao diện giống. Không thêm backend chỉ vì bản chuẩn có đăng nhập; Social/Trades thật vẫn là phạm vi kiến trúc cần xác định riêng.

## Những điều chỉnh người dùng cần giữ

- Pokémon trong thẻ bắt mới đã được giảm xuống khoảng **78% kích thước trước khi thu nhỏ**, có idle nhẹ. Đây là tỷ lệ transform của giao diện hiện tại, không phải yêu cầu pixel tuyệt đối cho mọi loài.
- Thông báo bắt thành công phải nằm trên thanh battle log và có khoảng hở ở cả desktop/mobile.
- Đổi tốc độ không làm ngắt hoặc phát lại hiệu ứng đang chạy.
- Bảo toàn các phần đã bổ sung: thu/tung Pokémon, trainer KO, idle, EXP đội và thất bại → hồi máu → quay lại route.

## Điều kiện so sánh và giới hạn

- Save live và save clone có schema khác nhau. R00 ghi hai fixture riêng, **chưa có cùng seed/clock/save cho screenshot diff**. Không lấy số pixel khác nhau giữa hai ảnh này để tự chấm phần trăm hoàn thành.
- Trạng thái clone dùng để ghi ảnh: một Charmander Lv.5, PC trống, seen/caught #4, không buff, dừng battle. [Bản ghi clone](reference/2026-11-14/clone-audit.json) chứa hash source, chapter và geometry. Tiền và trạng thái battle được điều chỉnh trong context thử, không ghi vào trình duyệt của người dùng.
- Live dùng luồng New game thật → chọn Red → đặt tên Audit → chọn Charmander → mở menu. Route vẫn có thể tiến triển khi mở màn khác. Một số ảnh chụp tại thời điểm chuyển cảnh; cần dựng fixture ổn định ở R01 trước khi lấy geometry làm tiêu chí chính xác.
- Qua các lượt quan sát, tổng bước Chương 1 từng hiển thị **21, 20 và 17**. Không quy định tổng bước live là hằng số 21. Cần xác minh cách dựng route/replay trước khi thay dữ liệu chương. Trong clone, 10 chương có `totalSteps !== steps.length` là vấn đề riêng đã đo trực tiếp, không suy ra từ biến động live này.
- Menu bị khóa/ẩn và các màn yêu cầu đăng nhập chỉ được ghi ở trạng thái đó. Không đánh dấu vòng chơi phía sau là đã kiểm chứng.
- Video FX mới ở ba tốc độ và mobile live cùng fixture chưa được hoàn tất trong R00. Trace thao tác có screenshot nằm trong thư mục scratch; đây không phải video thời gian thực dùng để nghiệm thu timing.
- Chưa thực hiện giao dịch, mua hàng, raid hoặc gửi lời mời/giao dịch với người chơi khác. Không đăng nhập hay sửa tài khoản bên ngoài.

## Cách tái lập

Chạy từ thư mục gốc dự án:

```powershell
# Website live: context mới, tạo nhân vật thử và ghi màn hình.
node scratch/visual-parity/audit-reference.mjs --screens

# Clone: tự mở Vite tạm ở cổng 3011, ghi ảnh rồi đóng server.
node scratch/visual-parity/audit-local.mjs
```

Script live cần quyền truy cập mạng. Script không tự vượt khóa để xem tính năng; các trạng thái khóa phải giữ nguyên và ghi nhận. Các lượt chạy lại ghi đè artifact cùng tên; nếu chốt một baseline mới, lưu sang thư mục ngày/phiên riêng trước khi chạy.

Mã và dữ liệu hiện tại đã được lưu tại `scratch/backups/r00-code-2026-11-14.zip` trước R01. Archive gồm `src`, `tests`, `public/data` và cấu hình hiện có; không gồm toàn bộ asset, node_modules hoặc save trong profile trình duyệt của người dùng.

## Trạng thái R00 và bước tiếp theo

Đã xác định bản chuẩn, tạo baseline code, ảnh/DOM/manifest và [ma trận đối chiếu](REFERENCE_CHECKLIST.md). Đây là baseline để bắt đầu R01; **chưa nghiệm thu độ giống toàn game**.

Ưu tiên R01: sửa cấu trúc Progress/Adventure theo màn riêng; đo lại cột phải và sân; căn header/sidebar; hoàn thiện Team/PC và Pokédex theo bản live; thống nhất modal/toast. Các trạng thái hiếm, tính năng khóa và timing được tiếp tục ghi khi triển khai hệ thống tương ứng.
