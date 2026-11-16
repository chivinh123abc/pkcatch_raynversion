# Đối chiếu changelog v0.5.02 — 16/11/2026

Nguồn: changelog người dùng cung cấp, khớp [bản English đã lưu](live-update-2026-11-16/changelog-latest.json). Snapshot v0.5.02 BUILD `b05c8cc201`, app `c0081498f2`; [manifest/hash nguồn](live-update-2026-11-16/manifest.json). Tái sử dụng snapshot đã tải, không tải lại bundle/asset. Đây là trạng thái từng mục, không phải tuyên bố toàn bộ clone đã lên v0.5.02.

## Phạm vi áp dụng

| Mục trong changelog | Trạng thái trong clone |
|---|---|
| Chiêu power100–110 học từ Lv.65; trên110 từ Lv.85 | Đã nhập learnset hiệu lực của151 loài đang hỗ trợ. Kiểm tra toàn bộ learnset và các mốc64/65/84/85. |
| Không học Hyper Beam, Giga Impact và chiêu recharge khác | Đã loại theo learnset native; dữ liệu chiêu/FX vẫn có thể tồn tại trong catalog, không đồng nghĩa được học. |
| Badge vùng mới trên Trainer card và lúc nhận badge | Chưa áp dụng: chưa có Trainer card và runtime vùng mới. Không sửa badge Kanto để mô phỏng mục này. |
| Dấu đóng trên Trainer card, Guide, Tastes, Changelogs, raid/legendary team picker | Các màn được nêu chưa có trong clone. Dấu đóng thẻ Pokémon hiện có được kiểm tra hoạt động; không coi đó là hoàn thành fix cho các màn chưa có. |
| Trade giữ đúng vùng gốc và sửa Pokémon đã nhận sai vùng | Chưa có trade runtime hoặc dữ liệu home region để migrate. Cần adapter xác định vùng gốc theo species/origin khi triển khai trade, độc lập tab nhận; không suy từ tab đang chọn. |
| Giảm độ khó Gym thứ hai vùng mới | Chưa có region/Gym tương ứng. Giữ nguyên Misty và dữ liệu Kanto. Changelog không cung cấp chỉ số cụ thể; phải trích dữ liệu native đúng phiên bản khi làm vùng đó. |
| Cân bằng rustling grass, dust clouds, shadows, ripples ở vùng mới | Chưa có selector/node vùng đó. Không áp trọng số chưa biết lên pool Kanto. |
| Reroll daily shiny raid từ banner trước khi bắt đầu; cảnh báo khi bắt đầu | Sidebar mới có nút Raids, chưa có raid runtime/banner. Khi triển khai phải có trạng thái chưa bắt đầu/đã bắt đầu, khóa reroll sau start và xác nhận trước start. |

## Sửa bổ sung lần này: chiêu trên Team/PC

`collectionUtils.collectionMove` trước đây lấy tên cố định từ `TYPE_MOVES_MAP` theo hệ đầu tiên, bỏ qua species và level. Ví dụ Charmander có thể hiện Flamethrower ngay Lv.5 trong khi runtime đã dùng Ember.

Thêm `mainMove` trong `src/game/domain/chapterOne.ts`, khớp `Game.mainMove` native: chỉ xét chiêu đã học, bỏ blacklist, chấm theo power × accuracy × STAB × base ATK/SPA; giữ thứ tự khi bằng điểm và fallback chiêu trạng thái nếu chưa có đòn gây damage. Team slot và thẻ chi tiết dùng chung hàm này. Move trong battle vẫn tùy đối thủ qua `chooseBattleMove`.

Ví dụ Charmander: Lv.5 Ember; Lv.64 Flamethrower; Lv.65–84 Fire Blast; Lv.85 Overheat. Không đổi sát thương, timing, EXP, chapter, save key/version hoặc reset marker.

## Bằng chứng và kiểm tra

- Gọi trực tiếp `Game.mainMove({id, level})` của bundle đã cache trong Chrome profile mới, chặn mọi request ngoài file local. Chỉ dùng CSS cũ để khởi tạo, không dùng lần chạy này làm bằng chứng hình ảnh.
- [Fixture native](live-update-2026-11-16/main-moves.json):151 loài ×7 level (1/5/64/65/84/85/100) = **1.057 mẫu**; SHA256 `170f103869622b2b79c8dad567b45014ca2f7769778cac1fdaa6ce8ac92ae3df`. Script tái trích hiện tại: `scratch/live-update-2026-11-16/capture-main-moves.mjs` (scratch không đi theo Git).
- Bundle nguồn SHA256 `c0081498f217061d529fb18ecc4833e9490c93e0b425fc3d04b713d990fdda11`; hàm native xuất sẵn trong `runtime.json.gameMoveFunctions` để tra khi thiếu script.
- `tests/live-moves.test.mjs` đối chiếu toàn1.057 mẫu và tên chiêu qua helper UI; kiểm tra recharge và level floor của toàn151 learnset.
- `tests/collections.spec.ts` thêm kiểm tra Team và modal cập nhật tại64/65/84/85, đóng modal bằng nút X sau từng mốc.
- Core **64/64**, browser collection **12/12** đạt (gồm mốc chiêu mới, nút đóng chi tiết, modal bắt mới và mobile); build thành công, còn cảnh báo chunkJS>500kB. Không chạy lại toàn bộ FX vì không đổi engine/timing.

## Việc tiếp khi triển khai các mục còn thiếu

Giữ snapshot v0.5.02 làm nguồn cho các module tương ứng trong roadmap; chỉ nhập Gym/pool sau khi có region adapter, home-region migration sau khi có schema trade, raid reroll sau khi có runtime raid. Không tự mở vùng mới hoặc tăng nhãn phiên bản toàn game từ việc nhập riêng chiêu/FX. UI/chapter cũ vẫn có baseline riêng trong [reference-version.md](reference-version.md).
