# Thẻ tiến trình, huy hiệu và nền hồi máu — 16/11/2026

## Nguồn

`npm run reference:check` lúc **2026-11-16T07:13:21.890Z** xác nhận live vẫn v0.5.02/build `b05c8cc201`; không tải lại bundle. App SHA256 `c0081498f217061d529fb18ecc4833e9490c93e0b425fc3d04b713d990fdda11`, CSS `3e06fa8ed6cfcca3070da71b03fe5758d6b786faba9accdb4b680590f6cc525b`.

`scripts/audit-progress-heal.mjs` chạy cache cùng hash trong Chrome cô lập, xuất [bằng chứng](progress-heal-evidence/reference.json): handler thẻ native, source renderer defeat, resolver scene, mapping/cách crop badge và hai nhánh click. Harness bỏ qua title bootstrap nên nối nút Adventure vào native App.show; **onclick thẻ summary và map.open giữ nguyên native**. Đây là ca kiểm tra branch có bridge được ghi rõ, không phải đăng nhập/chơi một lượt live hoàn chỉnh. Cache cần `scratch/live-update-2026-11-16` và fallback `scratch/visual-parity/reference-2026-11-14`.

## Đã sửa

Thẻ summary native kiểm tra `#screen-adventure.active`: đang ở Team/PC, Pokédex hoặc Progress thì trở lại Adventure; đang ở sân thì mở Progress của vùng hiện tại. Clone trước luôn gọi resume. `LeftSidebar.tsx` nay phân nhánh bằng activeView, dùng lại callback hiện có; không gọi selectChapter/loadStepNode, giữ nguyên node, enemy UID và encounter. Nhãn truy cập đổi theo hành động; Enter/Space dùng cùng handler. Progress chọn sẵn chương hiện tại qua state vốn có.

Badge native dùng `STORY.badgeHtml`/`frlg-n.png`, crop tile16px thứ n trong strip128×16, không dùng các PNG đơn sắc tên boulder/cascade cũ. `extract-kanto-badge-icons.mjs` có guard nguồn, sinh tám SVG bọc đúng vùng của PNG nhúng, không tô màu bằng CSS. `chapterIcon` dùng các tile này cho tám Gym Kanto, nên summary/Progress/timeline/trainer dùng chung ảnh màu; fallback trainer/League giữ nguyên. Summary hiển thị32×32px, tương đương native badgeHtml zoom2, thay vì chỉ đặt max-width lên ảnh intrinsic16px. [Manifest](progress-heal-evidence/badge-assets.json) ghi hash strip/tile/output để tái tạo. Không xóa ảnh cũ. **Boulder vốn màu xám trong native**, không ép nó có màu; Cascade phải xanh. CSS off/sil của badge chưa đạt vẫn giữ ở những chỗ vốn dùng trạng thái đó; summary hiện badge màu ngay cả chưa nhận.

Lúc cả đội gục, battle runtime đã đặt nodeType=center nhưng giữ route cursor tới khi heal xong. Arena trước chọn scene hoàn toàn từ route cursor nên heal xuất hiện trên nền trận vừa thua. Nay nodeType=center chọn đúng **50-centre-pokemon-v2-710x400.webp**, xác nhận từ native defeat renderer `bg:pokecenter,fallback:town` qua `SCENES.css`. Tiêu đề khu vực và HealFX chuyển thành Pokémon Center khi heal do thất bại, không ghép tên badge thành địa danh giả. Sau heal, scene lại theo node tuyến; không thay heal callback, pace, thời điểm hồi HP, return-to-start hoặc persist schema. Không dựng node giả/lưu lại route để chữa renderer.

## Kiểm tra và phạm vi

Core **100/100 đạt**, build cuối đạt (cảnh báo chunk>500kB cũ). Browser lượt rộng arena/progress **17/18 đạt**; ca badge còn ép mọi huy hiệu có pixel màu, sai với Boulder vốn xám. Sửa assertion: cả8 tile phải khớp pixel nguồn, riêng Cascade có màu; chạy lại **1/1 đạt**. Sau chốt32px và tên Center, **4/4 cuối đạt**: hai nhánh summary,8 tile/badge32px, heal bình thường và defeat/return một lần. Chụp ảnh chờ tất cả canvas dither rời DOM bằng count0; waitFor strict trước đó sai vì transition sân và HealFX có hai canvas cùng lúc. Đã xem ảnh cuối. Không cộng lượt kiểm tra trùng thành số ca mới. Runner/Vite/Chrome do các lượt kiểm tra tạo đã dừng.

Ca summary kiểm cả ba màn→sân→Progress và giữ encounter. Ca normal heal/defeat kiểm nền Center, FX không restart khi đổi tốc độ, stale completion không trả tuyến hai lần. Ca badge so pixel canvas cả8 SVG với crop native; Cascade chưa nhận vẫn xanh. [Summary Cascade](progress-heal-evidence/local-cascade-summary.png), [Center sau thất bại](progress-heal-evidence/local-defeat-center.png).

Không reset save/marker, không đổi milestone, không mở vùng. Chưa coi cinematic/SFX/chi tiết nhãn địa điểm trong HealFX hoặc toàn bộ UI đã nghiệm thu. Các giới hạn inspect/gift/Tastes vẫn giữ ở handoff trước. Bước tiếp: kiểm tra trên save thật bằng cách mở collection rồi bấm summary hai lần; gặp lỗi mới thì dùng ca tái hiện cụ thể, không reset tiến trình.
