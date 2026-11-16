# Badge, bóng giao diện và thẻ Pokémon

Ngày 16/11/2026. Người dùng xác nhận “dừng” là **Codex dừng làm việc**, chưa phải game bị treo. Không sửa combat, watchdog, chuyển node hoặc reward để chữa một lỗi game chưa tái hiện. Chưa có log phiên Codex bị dừng nên chưa xác định được nguyên nhân công cụ/phiên làm việc; đợt này tiếp tục đối chiếu và sửa các mục giao diện được giao.

## Nguồn kiểm chứng

`npm run reference:check` lúc `2026-11-16T06:16:02.542Z` xác nhận live v0.5.02, build `b05c8cc201`, trùng cache. Không tải lại bundle/asset không đổi.

- App SHA256: `c0081498f217061d529fb18ecc4833e9490c93e0b425fc3d04b713d990fdda11`.
- CSS SHA256: `3e06fa8ed6cfcca3070da71b03fe5758d6b786faba9accdb4b680590f6cc525b`.
- [Bằng chứng runtime, DOM, computed styles và helper native](notification-inspect-evidence/reference.json).
- Tái tạo: `node scripts/audit-notification-inspect.mjs`; cần cache app/CSS nêu trên và baseline assets như các audit trước. Chạy Chrome cô lập, chặn mạng ngoài; không dùng save người chơi, không ghi dữ liệu vào production.

## Kết quả xác minh và sửa

### Badge menu

Giả thuyết “Team/PC không bao giờ có thông báo bắt mới” **không đúng hoàn toàn**. Native có cả `Screens.team.newCount` và `Screens.pokedex.newCount`:

- Pokédex đếm entry có `firstAt > dexVisit`: loài mới trong Dex.
- Team/PC đếm Pokémon sở hữu có `shiny && !ot && caughtAt > pcVisit`. Bao gồm shiny trong đội hoặc PC; Pokémon có chủ cũ không tính.
- Audit nhận sáu Pokémon thường vào đội và con thứ bảy vào PC: Team/PC vẫn 0, Dex lần lượt 1/6/7. Nhận shiny mới: Team/PC 1. Chuyển shiny đó vào đội: vẫn 1. Gắn OT: Team/PC 0.

`LeftSidebar.tsx` đã bỏ cách đếm tất cả UID mới. Vẫn dùng các trường reviewed hiện có, đánh dấu khi mở collection và lưu ngay theo yêu cầu trước; không đổi schema/marker/save và không khôi phục NEW từng thẻ Pokédex. Đây là adapter reviewed-ID, không thay bằng timestamp native vì có thể làm mất trạng thái chưa đọc của save hiện tại.

### Bóng, lớp phủ và font

- Native pixel navigation tắt transition/animation của tab và pseudo-element. Clone còn `transition:all .15s` nên sau khi click có frame trung gian: bóng chữ chỉ dịch khoảng0,4px thay vì2px, nền/viền cũng nội suy. Đã tắt theo native cho menu. Generator bổ sung mặt nút khi hover, không giữ cứng màu của frame nghỉ. Nền và bóng hai lớp của Team/PC/Pokédex được kiểm tra ở cả nghỉ và hover.
- Modal dùng nền phủ `#05070cb8`, blur3px, padding16px, bóng `0 20px 60px #0009`, viền3px/radius18px. Trước đó clone dùng blur4px, bóng16/40 và viền2px ở preview.
- Gỡ các adapter preview cũ trong `replica-ui.css`/`collections.css`; mở rộng generator inspect cho cả owned inspect lẫn Dex/capture preview. Không sửa CSS sinh thủ công.
- Genus/body/facts/nút Continue dùng Jersey10 đúng native; tên Pokémon Jersey15. Khôi phục weight, line-height, cỡ chữ và padding từng phần. Sửa màu chữ/bóng chữ Continue/Awesome! bị CSS pixel cũ ghi đè.
- Thẻ shiny mới có icon shiny cạnh tên và một nhãn New; không hiện đồng thời hai pill New/Shiny. Rarity dùng pips native thay dấu chấm tự dựng.
- Facts trở lại trong `.dc-id` như DOM gốc; breakpoint native tự chuyển facts xuống hàng dưới trên mobile, không dùng vị trí tuyệt đối để né chồng chữ.

### Sọc trắng Stats

Trong mẫu Gyarados shiny của người dùng, đó là **phần cộng shiny +10%**, không phải HP chờ trừ hay EXP. `UI.statBars` vẽ đoạn cơ bản trước, đoạn `i.shiny` sau, dùng base-stat scale160 và vạch chia40. Giá trị số vẫn là chỉ số thật theo cấp; ví dụ Gyarados shiny100 có907HP.

Đã dùng chung `PokemonStatBars.tsx` cho owned inspect và Dex preview. Owned shiny có sáu đoạn bonus sọc; Pokémon thường và Dex base stats không có sọc shiny. Dex trước đó vẫn dùng thanh đơn màu chia180; đã bỏ. Native còn có segment rank/Tastes riêng, các hệ thống đó chưa được coi là đã nối trong clone Kanto.

## Phạm vi và việc còn lại

Các mục Keep duplicates/retention nhánh họ, tiến hóa/vật phẩm/FX, giữ candy, Tastes/SFX của [báo cáo inspect/gift](INSPECT_GIFTS_NATIVE_REVIEW.md) vẫn phải triển khai theo bằng chứng riêng; đợt sửa badge/font/bóng/Stats này không chứng nhận toàn bộ inspect hoàn chỉnh. **PC native không giới hạn số lượng** theo chính tooltip Team; ghi chú “giới hạn PC” ở báo cáo cũ không phải yêu cầu thêm giới hạn.

Artwork trong audit native offline có thể thiếu ảnh ở đường dẫn cũ; không dùng screenshot đó để tuyên bố từng frame GIF khớp. Clone tiếp tục dùng Gen5ani của người dùng. Combat, cadence, HP/reward và save không thay trong đợt này.

## Kiểm tra

- **30/30 browser đạt** trong cùng lần chạy cuối: `tests/notification-inspect.spec.ts`, `collections.spec.ts`, `buddy.spec.ts`, `strict-parity.spec.ts`. Có đối chiếu font/bóng/hover từng thuộc tính với native, badge normal/shiny/OT/ngày thiếu/reload, Stats, owned inspect1440/390/320, capture mobile, cuộn collection và gift/fossil/reduced motion.
- `npm run build` cuối đạt; còn cảnh báo chunk>500kB có từ trước. Không đổi domain/runtime nên không chạy lại core; kết quả94 core trong báo cáo cũ thuộc lượt cũ.
- Đã xem ảnh capture native/local; khác số lượng/seed và native offline thiếu artwork nên chỉ dùng để đối chiếu phần đã có bằng chứng. Không coi ảnh GIF đã khớp từng frame.
- Runner/Vite/Chrome do lượt kiểm tra tạo đã dừng; không reset save hoặc marker. Sổ lỗi bổ sung BUG-34–36.
# Đính chính bóng tab ngày16/11/2026

Lần kiểm tra tiếp theo xác định bản trích ở báo cáo này còn thiếu mask-composite/mask-position, nên chưa tái hiện đủ bóng caro. Đã sửa và kiểm chứng tại [TEAM_PC_PARITY_REVIEW.md](TEAM_PC_PARITY_REVIEW.md); dùng kết quả đó cho bóng pixel hiện tại.

