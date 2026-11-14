# R01.1 — Progress/Adventure và khung ngoài

Ngày: **14/11/2026**. Chuẩn: [live v0.4.103](reference-version.md). Phạm vi lượt này: chuyển Progress thành màn riêng, nối thao tác chapter và căn shell/sân. Chưa hoàn thiện lại dữ liệu toàn bộ chapter hoặc mọi menu của R01–R09.

## Kết quả

- `AdventurePage.tsx` thay phần hiển thị của `AdventureModal.tsx` trong App. Progress và chapter card mở màn Adventure cạnh sidebar; không có backdrop che toàn trang.
- Dải vùng, danh sách chapter, trạng thái đang chơi/hoàn thành/khóa, banner gym, thông tin leader/level/reward, item và Pokémon theo nhóm điều kiện dùng bố cục bản live.
- Bấm chapter chỉ xem trước. Continue của chapter đang chơi giữ nguyên bước; Start/Replay chỉ đổi chapter sau xác nhận. Các badge và số Pokémon đã bắt lấy từ save, không dùng số đếm mẫu.
- Khóa chương thông thường dựa trên badge trước; khu đặc biệt theo bộ species hiện có hoặc thông báo điều kiện chưa đạt. Chapter đang chơi trong save cũ vẫn được Continue. Đây chưa thay thế bộ unlock/progression đầy đủ ở R04; League và nội dung chưa có trong dữ liệu không được dựng thành chương chơi giả.
- Pokémon trong danh sách có chi tiết, trạng thái seen/caught và silhouette khi chưa biết. Dialog bắt mới vẫn ưu tiên hơn dialog xem thông tin.
- Arena giữ nguyên instance, kích thước và renderer khi mở Progress/Team/Pokédex. Không reset encounter hoặc cắt effect chỉ vì đổi màn.
- Căn shell theo gutter 10px desktop, sidebar 264px gồm padding, cột phải 320px, timeline 28px; bỏ nhãn NEW luôn hiện, số online cố định và nút Sleep chưa có nghiệp vụ khỏi header.
- Desktop: thông tin chapter cuộn riêng, Continue luôn nằm trong card ở vùng nhìn thấy. Mobile: dải vùng cuộn ngang, danh sách/chi tiết xếp dọc, Continue tránh thanh navigation.

Tên state/action cũ `isAdventureModalOpen/openAdventureModal/closeAdventureModal` được giữ để không sửa lan store trong R01. Nó hiện điều khiển màn Progress, không còn mở Adventure modal. File modal cũ giữ lại nhưng không được App import.

## Số đo và bằng chứng

Đo lại DOM snapshot live với CSS cùng bundle, font Jersey, tắt animation để đo layout; không chạy lại game APK. Script: `scratch/visual-parity/prepare-r01-reference.mjs`. JSON đo nằm ở `scratch/visual-parity/r01-reference-geometry.json`.

Ở viewport **1440×900**, device scale factor 1:

| Thành phần | Bản chuẩn | Clone sau sửa |
|---|---|---|
| Header | x0, y0, 1430×60 | x0, y0, 1430×60 |
| Sidebar ngoài | x0, y60, 264×840 | x0, y60, 264×840 |
| Sân | x280, y108, 798×448.875 | x280, y108, 798×448.875 |
| Cột danh sách Adventure | x298; bề rộng 400 | x298; bề rộng 400 |
| Khối hai cột Adventure | x298, y248, rộng 1098 | x298, y248, rộng 1098 |

Ảnh trước R01 vẫn nằm trong `docs/reference/2026-11-14/`; không ghi đè baseline R00. Ảnh sau sửa và manifest riêng nằm trong [r01-evidence](r01-evidence/README.md). Ảnh source và clone khác thời điểm, seed, giờ và nội dung chapter; không dùng để công bố điểm pixel diff toàn game.

## Kiểm tra

- `npm test`: **13/13** test store đạt.
- Lượt browser toàn bộ: 11 kiểm tra Arena/Collections đạt; sau khi chỉnh card Continue và phần cuộn, chạy lại `tests/progress.spec.ts`: **3/3** đạt. Ba case kiểm tra geometry + Arena không remount + giữ bước, preview/unlock/xác nhận chapter và mobile không tràn/che Continue. Có kiểm tra các section item/Pokémon không chồng nhau.
- `npm run build`: TypeScript và Vite thành công; vẫn có cảnh báo JS chunk trên 500KB.
- Browser ghi ảnh không có pageerror. Server ghi ảnh/kiểm tra được mở tạm và đóng sau khi chạy.

Trên Windows, helper `scratch/visual-parity/run-browser-checks.mjs` mở Vite trực tiếp rồi chạy Playwright để đóng đúng process con, tránh npm/cmd giữ tiến trình ở bước teardown. Cách chạy:

```powershell
node scratch/visual-parity/run-browser-checks.mjs
node scratch/visual-parity/run-browser-checks.mjs tests/progress.spec.ts
node scratch/visual-parity/check-r01.mjs
node scratch/visual-parity/verify-r01.mjs
```

## Phần còn lại

- Chương, giá/reward, item pool, encounter và giờ/thời tiết vẫn lấy từ dữ liệu clone hiện tại. Ví dụ số Pokémon khu vực và reward có thể khác live; không sửa riêng chữ hiển thị để che sai dữ liệu. R04 cần hợp nhất các nguồn này.
- Guide/footer cộng đồng, Settings và các nghiệp vụ menu phụ chưa được bổ sung trong lượt này.
- Team/PC và Pokédex chỉ nhận khung ngoài mới; chi tiết còn lệch của R01.3/R01.4 chưa được coi là xong.
- Mobile đã kiểm tra chức năng và overflow; chưa khẳng định cách mở panel chi tiết trùng hoàn toàn với live mobile.

Bước kế tiếp theo kế hoạch: căn Team/PC, Pokédex theo baseline live và hoàn thiện quy tắc overlay/mobile; sau đó R02/R03 xử lý runtime và vòng chơi Chương 1.
