# Team/PC, bóng pixel và EXP — 16/11/2026

## Đối chiếu shiny theo ảnh người dùng

Đã chạy lại `audit-team-pc.mjs` trên cùng snapshot/hash native, thêm fixture shiny thật (`mon.shiny=true`), không tải live/bundle mới. `Game.makeMon` của native không dùng boolean ở tham số thứ ba để bật shiny; audit phải đặt thuộc tính rõ ràng, nếu không sẽ đo nhầm Pokémon thường. Bằng chứng `reference.json.shiny`, `shinyHelpers`, `shinyMarkup` và [ảnh native](team-pc-evidence/native-shiny.png).

Native dùng **`UI.shinyIc` → `i.shiny-mk`**, icon SVG pixel16×16 có viền tối, vàng/trắng. **PC đặt trước Lv. trong `.lvl` flex, cách2px; Team/mini team đặt sau tên.** Mobile mini team ẩn tên nên ẩn luôn icon trong tên, không tự chuyển icon sang level. Clone thiếu icon PC và dùng ký tự Unicode ✦ ở hai hàng Team; đã thay đúng DOM và trích CSS native qua generator, gồm `.pc-cell .lvl` để giữ alignment/gap. Nút lọc Shinies cũng dùng cùng icon như screenshot native, thay ký tự font. Owned/capture inspect đã dùng đúng icon nên không sửa renderer đó.

Sprite vẫn dùng PNG shiny qua resolver hiện có. Không thêm glow riêng cho shiny: native vẫn lấy tierGlow của loài. Giữ hành vi đọc badge/NEW theo yêu cầu trước, không khôi phục NEW từng ô hoặc thay cơ chế nhận shiny. Đợt này không sửa save/marker04, gameplay hoặc tỷ lệ shiny.

Kiểm tra **12/12 browser đạt**: team-pc-parity6/Buddy5/rarity save1. Hai ca shiny1440/390 so SVG/computed16px/gap/DOM, đường dẫn/tải sprite shiny, ô thường không có icon và mini mobile ẩn tên; các ca khác giữ EXP cap, cuộn, kéo thả, inspect và save cấp một lần. Sau thêm icon nút lọc, chạy lại **2/2 shiny đạt** và build cuối đạt với cảnh báo chunk cũ. Lượt đầu kiểm tra ảnh hết5s chờ tải PNG; tăng poll lên30s, hai viewport đạt, không đổi loader/product. Không đổi runtime nên không chạy lại core. Đã xem [local desktop](team-pc-evidence/local-shiny-1440.png), [local mobile](team-pc-evidence/local-shiny-390.png) và native. Native fixture có NEW do seed mới, không phải yêu cầu khôi phục NEW cho clone. Runner/Chrome do lượt kiểm tra tạo đã dừng. Chưa nghiệm thu mọi kích thước/animation hoặc toàn bộ inspect.

## Nguồn xác minh

`npm run reference:check` lúc **2026-11-16T06:38:06.468Z** xác nhận live v0.5.02/build `b05c8cc201` không đổi. Tái sử dụng cache; không tải lại bundle. App SHA256 `c0081498f217061d529fb18ecc4833e9490c93e0b425fc3d04b713d990fdda11`; CSS SHA256 `3e06fa8ed6cfcca3070da71b03fe5758d6b786faba9accdb4b680590f6cc525b`.

`node scripts/audit-team-pc.mjs` chạy native trong Chrome cô lập, xuất [runtime/computed styles/caps](team-pc-evidence/reference.json). Cần cache `scratch/live-update-2026-11-16` và fallback `scratch/visual-parity/reference-2026-11-14`; không đưa app gốc vào sản phẩm. Hai generator `extract-team-pc-styles.mjs`, `extract-kanto-level-caps.mjs` đọc bằng chứng này, có guard hash.

## Các thay đổi

- Bóng caro: bản trích trước thiếu **mask-composite và mask-position**, nên bóng vẫn thành dải đặc dù đã đúng mask-image. Đã chép đầy đủ lớp mask của tab active, hover và filter; giữ frame pixel native. Báo cáo trước về bóng chỉ đúng các thuộc tính đã đo, chưa đủ chứng minh hình ảnh cuối.
- Thanh PC native sát trái/phải/đáy, cao **5px desktop / 3px mobile**, không bo tròn; nền `#00000059`, gradient và inset highlight native. File sinh `team-pc-reference.css` import sau layout adapter để không bị hình học cũ đè.
- Thanh đội hình nổi khi `teamSlots.top < headerHeight - teamSlots.height*.25`; sáu slot, sprite/tên/level/EXP, click inspect và kéo thả dùng thao tác có sẵn. Bám kích thước header và vùng nội dung, đẩy filter xuống bằng `--mini-h`, ẩn/inert khi không cần, hủy observer/listener khi rời màn. Desktop sprite dùng fitScale96 (1×/2×), mobile tileScale24/34 theo bounds native.
- EXP: PC thường không nhận EXP từ K.O. Bản gốc **vẫn thưởng Buddy trong PC theo mốc K.O.**, và **feedFamily** từ bắt/quà trùng cho thành viên cùng họ đủ điều kiện ở party lẫn PC. Không xóa hai ngoại lệ native này.
- Nối giới hạn cấp theo tiến trình Kanto vào battle/Buddy/family/candy và thanh EXP Team/PC/inspect. Dãy cap theo chương: **20,24,30,38,46,54,62,70,75,83,88,93,95,100**. Dùng tiến trình cao nhất đã hoàn thành/badge đã lưu, không dùng chương replay đang chọn. Đạt cap hiện đầy thanh và ngừng nhận EXP; native giữ EXP dư tối đa `next-1` ở cap tiến trình, chỉ Lv100 xóa về0. Không hạ cấp hoặc sửa EXP Pokémon cũ lúc load.
- Bảng `chapterOneReference.tables[].candyXp` cũ lấy mẫu dưới cap20 nên từ Lv20 đều bằng0. Thay chỗ cấp thưởng bằng công thức native **round(levelXp × CANDY_LEVEL_SHARE)** với share3, sau kiểm tra cap riêng; tránh mất thưởng khi đã mở chương sau.
- Bộ test local tự chạy một lần khi mở lại save đã chọn starter trên Vite DEV hoặc localhost/127.0.0.1/::1, gồm cả preview production local. Xem [hướng dẫn save](RARITY_TEST_SAVE.md). Không truy cập được profile thật của người dùng từ workspace; phải reload đúng origin đang chơi mới áp dụng.

## Kiểm tra và giới hạn

Core **99/99 đạt**, bao gồm PC thường/Buddy, cap, kẹt ở Lv20 rồi mở Brock, không hồi sinh/hạ cấp và bảo toàn save mẫu. Browser **35/35 đạt**: collections, Buddy, notification/inspect, rarity save, strict gift/parity và team-pc-parity. Bao gồm EXP cap trước/sau Brock, kéo PC vào mini team, so native desktop/mobile và không hồi quy lỗi cuộn. Production localhost preview grant đạt trên build cuối (12 mẫu, backup/party giữ nguyên, reload không lặp). Build đạt, còn cảnh báo chunk>500kB có từ trước. Đã xem crop native/local và screenshot mobile cuối; ảnh ở `team-pc-evidence`. Server/Chrome do các runner tạo đã dừng. Log tạm trong `scratch/team-pc-{core,browser,build,preview}.log`, không phải nguồn lâu dài.

Không thay save schema/reset marker, không mở vùng hay thêm tier giả. Kanto chỉ có bốn tier đang hỗ trợ; Unique không có loài native tại đây. Các giới hạn inspect/gift/Tastes/SFX trong handoff trước vẫn còn; đợt này không phải nghiệm thu toàn game. Mini team dùng PNG theo native scale; chưa đối chiếu mọi frame idle animation.

Bước tiếp: người dùng F5 bản local, Continue rồi thử PC dài, filter, kéo thả và mẫu độ hiếm. Nếu vẫn thiếu mẫu, kiểm tra host/port/path cùng marker03 và backup03 trước khi sửa; không reset save.
