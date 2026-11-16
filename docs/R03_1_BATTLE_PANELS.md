# R03.1 — Hai panel chiến đấu

Ngày: **15/11/2026**. Thực hiện sau R03, trước R04 theo ưu tiên giao diện của người dùng.

## Bản chuẩn

Snapshot live **v0.4.103 / BUILD 5598c5890a**, bundle `app.c0c995f8f9.js`, CSS `app.7130b4d937.css`, đã chốt ở R00. Harness chạy bản chuẩn trong trình duyệt riêng; production dùng React, CSS scope và dữ liệu adapter, không chạy bundle game gốc.

Ảnh/DOM/fixture/số đo ở [r031-evidence](r031-evidence/README.md). Fixture có sáu Pokémon với HP/EXP khác nhau, một con gục, Pikachu poison, bốn loại berry, hai buff và một Exp. Candy S. Bản chuẩn được đặt ban ngày/trời quang để so với điều kiện Chương 1 clone đang hỗ trợ. Không dùng fixture này để kết luận mọi trạng thái đã giống.

## Đã sửa

- `BattlePartyRail`: sprite 68×56 căn theo phần pixel có nội dung, giữ idle; Pokémon gục chuyển xám và ngừng idle. Căn level, HP/EXP, status/shiny, viền đang chọn và popup XP bên cạnh ô.
- Thay vạch EXP trang trí luôn đầy bằng EXP thật. Chọn Pokémon khỏe và kéo đổi thứ tự trên desktop dùng action hiện có, giữ UID/HP/EXP và Pokémon đang ra sân.
- Consumables chỉ hiển thị berry còn số lượng; số lượng/timer dùng state thật. Gập/mở, trợ giúp, trạng thái không có berry; ẩn khối nếu inventory rỗng. Bag mở danh sách vật phẩm thật.
- Found here Chương 1 lấy cùng nguồn pool với battle, đổi Route 1 → Route 2 → Viridian Forest theo bước; đếm loài duy nhất đang sở hữu. Tile phân biệt chưa thấy, đã thấy, đang giữ và từng bắt nhưng không còn giữ; nhấn mở thẻ Pokémon.
- Nhóm ngày/mưa và phần trăm theo điều kiện. Theo native `zonePool`, Nanab nhân rare đang có thể gặp; loài bị khóa dùng trọng số gốc trong tỷ lệ giả định, không nhân buff.
- Bag có đóng/Escape, khóa nền, trap/restore focus; capture ưu tiên và đóng Bag để không chồng dialog. Resolver Exp. Candy S dùng đúng ảnh S.
- Desktop: Found here lấp chiều cao còn lại, nội dung có thể cuộn. Mobile: sân vuông, sáu ô tự co theo sân, cột phải rộng bằng sân, không tràn ngang ở 390px/320px.
- CSS scope sinh trong `battle-panels-reference.css`; chỉnh React/layout tại `battle-panels.css`, import cuối. Đã sửa pseudo-element nút Bag che tiêu đề do thiếu `position:relative`.
- Theo phản hồi người dùng: bỏ ảnh Poké Ball bổ sung trong tile caught vì CSS baseline đã vẽ một quả 16px qua `::after`. Giữ một dấu bắt duy nhất và thêm `caught` vào nhãn accessible. Ảnh và 7 ca browser panel đã chạy lại sau sửa.

## Đối chiếu desktop 1440×900

| Thành phần | Bản chuẩn | Clone |
|---|---|---|
| Sân | (280,108), 798×448.875 | Khớp |
| Rail | (291,121), 60×422.875 | Khớp |
| Ô đội hình đầu | (291,159), 60×60 | Khớp |
| Level, HP, EXP | Vị trí/kích thước DOM chuẩn | Khớp bốn số đo |
| Consumables | (1094,72), 320×122 | Khớp |
| Found here | (1094,206), 320×678 | Khớp |
| Ô berry đầu | (1112,136), 52×44 | Khớp |
| Ô Found here đầu | (1112,254), 52×52 | Thấp hơn khoảng 0.8px |

Chi tiết [comparison.json](r031-evidence/comparison.json). Khớp hình học không đồng nghĩa toàn game giống 100% từng pixel.

## Giới hạn

- **Mobile chưa khớp toàn bộ shell live.** Clone giữ vị trí bảng community/chapter và menu từ các đợt trước. Harness resize native giữ gutter 10px; clone bỏ gutter: tại viewport 390px, sân clone 358px so với 348px, ô rail 46px so với 45px. Khác thứ tự khối ngoài sân làm tọa độ dọc chưa trùng. Hai panel fit màn, nhưng vẫn cần căn shell mobile trước nghiệm thu cuối.
- Runtime Chương 1 hiện là ban ngày/trời quang; nhóm thời tiết khác là xem trước. Chưa thêm runtime thời tiết trong R03.1.
- Pool chapter sau, gồm selector khu vực Chương 7, vẫn là dữ liệu legacy. R04 phải thay bằng adapter/validator; chưa nghiệm thu số liệu các chapter này.
- Bag hiện xem inventory; dùng candy/stone/fossil, Shop và luồng vật phẩm đầy đủ thuộc R05/R06.
- Kéo rail dùng HTML drag/drop desktop. Mobile có chọn Pokémon và quản lý đội ở Team/PC; chưa tái tạo gesture kéo rail bằng ngón tay.
- Ảnh đối chiếu sáu loài mẫu, chưa rà toàn bộ 151 sprite/shiny/form. Panel dùng resolver chung, không hardcode đường dẫn từng loài.

## Xác minh

- `npm test`: **48/48** core/store/runtime.
- `node scratch/visual-parity/run-browser-checks.mjs tests/arena.spec.ts tests/collections.spec.ts tests/progress.spec.ts tests/battle-panels.spec.ts`: **33/33**, gồm contact/capture, đổi speed, heal/Skip, collection/modal, save và panel.
- Sau chỉnh chiều cao Found here/line-height/gap cuối: chạy lại riêng **7/7** ca panel, có kiểm tra focus nền và capture ưu tiên.
- `npm run build`: thành công; cảnh báo chunk JS >500kB vẫn còn.
- Không chạy lại ba video toàn Chương 1: đợt này không sửa combat/checkpoint/công thức thưởng. Video R03 là bằng chứng của đợt R03.

Script tự đóng Chrome/Vite. Không reset save hoặc đổi saveVersion/key/reset marker. Backup: `scratch/backups/r031-code-2026-11-15.zip`.

Tiếp theo **R04 — adapter và validator dữ liệu chapter**; giữ danh sách khác biệt mobile để xử lý trước nghiệm thu giao diện cuối.
