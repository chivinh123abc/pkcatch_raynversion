# Căn lại tỷ lệ khung game và collection — 16/11/2026

## Nguồn và phương pháp

Yêu cầu: phân bổ kích thước giống bản gốc, bỏ NEW trên từng Pokémon trong Pokédex; thông báo ở mục chọn màn được xóa khi ghé màn.

Nguồn UI là snapshot v0.5.02, BUILD **b05c8cc201**, app `c0081498f2`, CSS `3e06fa8ed6`. Đã mở URL live nhưng web reader không đọc được ứng dụng JavaScript; không xác nhận một build mới hơn. Hash đầy đủ nằm trong [reference.json](layout-evidence/reference.json). Script kiểm tra SHA256 trước khi chạy renderer native trong profile riêng, route cache/local và chặn network. Không dùng save người chơi hoặc đưa bundle native vào production.

`node scripts/measure-layout-reference.mjs` đo native ở viewport CSS 320,390,640,641,800,1000,1100,1440,1920,2560px. `tests/layout-parity.spec.ts` tạo cùng fixture 6 Pokémon đội hình,4 PC, có shiny; đo clone ở cùng viewport và DPR mặc định1. Không suy ra CSS pixel từ độ lớn ảnh người dùng hoặc giả định browser zoom.

## Các nguyên nhân và sửa đổi

- Clone dùng mốc mobile800px, native640px. Đổi media adapter liên quan sang640/641; tablet641–1099 dùng cột sidebar208px và khung sidebar224px, thay vì264px. Desktop lớn vẫn giới hạn1860px.
- Sân: native dưới1100px đưa panel phải xuống hàng dưới; clone vẫn trừ260px cho cột phải. Mốc1100–1379 dùng panel300px, từ1380 dùng320px. Mobile native là sân **1:1**, clone còn4:3. Header mobile56px, gutter10px và vị trí sân cũng được đồng bộ.
- Arena luôn mounted. Khung ẩn ở collection dùng cùng vị trí/kích thước khung đang hiển thị, kể cả tablet và mobile; không restart runtime/FX hoặc thay speed/cadence.
- Pokédex bị padding12px ở cả vùng lẫn lưới: bỏ lớp dư, chỉnh mép header và khoảng cách. Desktop tile144px; mobile58px,5 cột, số nằm đáy và ẩn tên như native; marker caught mobile14px. Sprite giữ PNG crop và bội số nguyên.
- PC bỏ min-height116/88px ép ô lớn hơn cột; giữ aspect1:1. Khôi phục khung art76px desktop/40px mobile, vị trí level và EXP. Team dùng art132px desktop/88px mobile; chiều cao ô theo nội dung thực, không cắt move thành một dòng ở màn hẹp. Dấu shiny có box riêng để font fallback không làm cả hàng cao thêm6px.
- Hero Dex tự tăng chiều cao khi latest catches xuống hàng. Latest catches dùng ô56×50px, gap2px. Thanh lọc mobile giữ một hàng search/status/shiny/more; type/region và sort PC mở trong popover, có Done/ESC. Tránh selector `.btn.small:not(#_)` của CSS cũ lấn display bằng adapter có specificity tương ứng.
- Bỏ hẳn DOM `.dex-new` và `.dex-unread` trong collection. `markCollectionVisited('pokedex')` đồng bộ cả `dexNotifiedSpecies` và `pokedexReviewed` cho toàn bộ loài đã bắt, lưu ngay. Pokémon xuất hiện khi đang mở Dex cũng được xem là đã đọc. Badge menu Team/PC và Pokédex vẫn tách riêng, ghé màn nào xóa badge màn đó; không cần bấm từng thẻ.

Adapter không sinh: `src/styles/layout-parity.css`, import sau UI polish. Không sửa tay CSS sinh. Giữ key/version/marker save, party/PC/preset, dữ liệu chapter, GIF Gen5ani và combat.

## Số đo sân sau sửa

| Viewport CSS | Vị trí x,y | Kích thước sân native = clone |
|---|---|---|
| 1920 | 305,108 | 1228 × 690.75 |
| 1440 | 280,108 | 798 × 448.875 |
| 1100 | 280,108 | 478 × 268.875 |
| 1000 | 240,108 | 734 × 412.875 |
| 800 | 240,108 | 534 × 300.375 |
| 641 | 240,108 | 375 × 210.9375 |
| 640 | 16,106 | 598 × 598 |
| 390 | 16,106 | 348 × 348 |

Nguồn kết quả: [arena.json](layout-evidence/arena.json). Test còn mở collection sau mỗi mốc để kiểm tra geometry của Arena không đổi.

## Bằng chứng, giới hạn và bước tiếp

[layout-evidence](layout-evidence/) chứa số đo native/local, ảnh đôi Team/Pokédex ở1440/1920/800/390px. `checked-diff.json` chỉ kiểm tra các đại lượng so được: khung trang/header, Team/slot, chiều rộng/cao ô PC/Dex, kích thước lưới Dex và vòng tiến độ. `diff.json` giữ cả sai khác thô, **không được diễn giải nó là0 hoặc mọi pixel đã giống**.

DOM React đặt sidebar bên trong main, native đặt cạnh main nên rect main không tương đương. Native còn Evolve all, pill thưởng shiny theo vùng và649 loài; clone giữ151 loài, Can evolve và bộ lọc hiện có. Vì thế cách xuống hàng một số toolbar/header, tổng chiều dài trang và tọa độ y phía dưới chúng vẫn có khác biệt ở một số viewport hẹp. Một số header hero hẹp lệch khoảng2–6px. Không ép thông số/nội dung giả để che các phần runtime còn thiếu. Màu/typography được kiểm tra riêng bằng UI polish; báo cáo cũ không phải nghiệm thu hình học.

Bước tiếp chỉ theo yêu cầu người dùng: rà phần toolbar/header còn khác khi có adapter tiến hóa/thưởng vùng; đối chiếu modal/hoạt động chưa hỗ trợ riêng. Không tự chuyển R05, reset save hoặc tuyên bố toàn game đạt90–100%.

Kiểm tra cuối: **83/83 core**, **37/37 browser** (arena, battle panels, collection, progress, layout matrix và UI polish), build thành công. `checked-diff.json` rỗng: các đại lượng kiểm tra chính khớp trong sai số tối đa1 CSS px; tám khung sân trong bảng khớp số đo trực tiếp. `style-diff.json` của UI polish vẫn rỗng ở tập selector đo. Đã xem ảnh desktop/mobile sau sửa, không tràn ngang. Bộ browser còn kiểm tra impact/HP/capture, đổi tốc độ không restart FX, thông báo và save sau reload, giữ Arena mounted và popover mobile. Build còn cảnh báo chunk JS>500kB như trước. Runner và Chrome thử đã dừng.
