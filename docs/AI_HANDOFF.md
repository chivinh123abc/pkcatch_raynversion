# Bàn giao hiện tại cho AI

Cập nhật **16/11/2026**. Đọc sau `AGENTS.md`, rồi chỉ mở tài liệu đúng phần cần làm.

## Đợt mới nhất: thẻ tiến trình, badge màu và Center khi cả đội gục

Đọc [PROGRESS_HEAL_REVIEW.md](PROGRESS_HEAL_REVIEW.md). Live kiểm tra07:13UTC16/11 vẫn build `b05c8cc201`, app/CSS hash cũ; dùng cache, không tải bundle mới. Native onclick summary có hai nhánh: đang ở màn khác→sân đang chơi; đang ở sân→Progress của chương hiện tại. `LeftSidebar` đã sửa theo activeView, không reload/selectChapter; Enter/Space chung handler và aria-label tùy hành động.

`chapterIcon` dùng tám badge màu crop từ frlg-n.png, SVG nhúng tile16px sinh bởi `extract-kanto-badge-icons.mjs`, manifest/hash ở `docs/progress-heal-evidence/badge-assets.json`. Summary32px như native zoom2. Không xóa PNG cũ; không tự tô màu Boulder vốn xám. Progress/timeline/trainer dùng cùng resolver; trạng thái off/sil chưa nhận vẫn giữ riêng.

Cả đội gục đã chuyển nodeType=center nhưng Arena còn đọc scene theo currentStep tuyến cũ. Nay center chọn đúng nền50-centre-pokemon-v2 và header Center; HealFX thất bại dùng tên Center chung thay vì ghép badge thành địa danh. Giữ heal request/callback/timing, route cursor về đầu sau heal, không reset save/marker hoặc đổi schema. Native defeat renderer/resolver/handler và hai nhánh click ở `docs/progress-heal-evidence/reference.json`; harness có bridge Adventure tab→native App.show do bỏ qua title bootstrap, không giả là full live session.

Kiểm tra **100/100 core**, build cuối đạt/cảnh báo chunk cũ. Browser arena/progress lượt rộng17/18 (assertion ép Boulder phải có màu sai), sửa assertion theo native rồi badge1/1 đạt. Sau chốt badge32px/tên Center và ảnh, **4/4 cuối đạt**: normal heal, defeat heal, hai nhánh summary, tám tile/cascade. Có một lượt chụp ảnh dùng waitFor strict locator bị lỗi vì hai canvas transition; đổi sang kiểm count0 trước chụp, không sửa product để né test. Không cộng lượt trùng; các ca rộng còn lại thuộc trước chỉnh renderer nhỏ cuối. Đã xem ảnh cuối Cascade xanh và Center. Runner/Vite/Chrome kiểm tra đã dừng. **BUG-43–45**; không tự đổi milestone.

## Đợt trước: mũi tên chiêu inspect bị lặp

Đã bỏ ký tự `›` viết trực tiếp ở `InspectPokemonCard.tsx`, vì CSS native `.dc-move.tap>span:first-child:after` đã sinh đúng một mũi tên. Không đổi CSS sinh, save hoặc runtime. Browser inspect có sẵn **1/1 đạt**, xác nhận label không còn dấu trong text/pseudo còn đúng dấu native và Moves vẫn mở/đóng; build đạt (cảnh báo chunk cũ). Không chạy lại core/toàn browser cho thay đổi JSX một ký tự. Nguồn/chi tiết ở [INSPECT_GIFTS_NATIVE_REVIEW.md](INSPECT_GIFTS_NATIVE_REVIEW.md), ghi **BUG-42**. Runner/Vite/Chrome kiểm tra đã dừng; không đổi milestone.

## Đợt trước: hiển thị shiny trong Team/PC

Theo ảnh người dùng, đã audit cùng snapshot/hash native và sửa **PC thiếu icon shiny trước Lv.**, Team/mini dùng ký tự ✦ sai hình. Nay dùng đúng `i.shiny-mk` với SVG pixel16px native, Team/mini đặt sau tên; `.pc-cell .lvl` giữ flex/align/gap2px. Mobile mini ẩn tên/icon theo native. Generator `extract-team-pc-styles.mjs` trích CSS, không sửa file sinh bằng tay. Sprite PNG shiny/resolver và tierGlow của loài giữ nguyên; không thêm aura, không phục hồi NEW từng ô, không sửa save/marker04 hoặc shiny rate.

Chi tiết/bằng chứng ở [TEAM_PC_PARITY_REVIEW.md](TEAM_PC_PARITY_REVIEW.md), `docs/team-pc-evidence/reference.json` có shinyMarkup/helpers/computed và ảnh native/local. Audit phải đặt `mon.shiny=true`; tham số boolean thứ ba của native `makeMon` không bật shiny. Chỉ dùng cache cùng app/CSS hash, không tải lại bundle/live. Browser **12/12 đạt** (team-pc-parity6, Buddy5, rarity save1); sau đổi thêm icon nút Shinies chạy lại **2/2 shiny desktop/mobile đạt**, build cuối đạt/cảnh báo chunk cũ. Một lượt đầu chờ tải PNG5s không đủ; poll ảnh nay30s, không sửa product để né ca kiểm tra. Đã xem ảnh native và local desktop/mobile. Không đổi domain/runtime nên không chạy lại core. Runner/Vite/Chrome do bài kiểm tra tạo đã dừng. Ghi **BUG-41**; phần thiếu inspect/gift/tiến hóa/Tastes/SFX vẫn giữ.

## Đợt trước: thêm24 mẫu shiny vào local save

Theo yêu cầu mới, `rarityTestSave.ts` nâng marker/backup lên **04**, giữ12 mẫu thường và thêm24 shiny Lv20 qua factory hiện có. Save đã nhận bộ03 chỉ thêm24; UID thường01 giữ nguyên, shiny prefix riêng04, không đè/chuyển đổi Pokémon cũ. Giữ party/preset/tiến trình/schema/reset marker và backup/marker01–03. Tự cấp khi F5 đúng DEV/localhost rồi Continue; không sửa được profile thật từ workspace. Không đổi shiny rate/gameplay hoặc mở vùng. Danh sách và cách dùng ở [RARITY_TEST_SAVE.md](RARITY_TEST_SAVE.md); hướng dẫn marker03 bên dưới là lịch sử.

Core fixture **4/4 đạt** gồm nâng bộ12→36, shiny đúng24/fullHP/level20, backup nguyên chuỗi và chống lặp. Browser fixture **1/1 đạt**: reload không query, Continue,24 shiny trong PC, giữ party/checkpoint và không cấp trùng. Build đạt (cảnh báo chunk cũ); production localhost preview đạt36 mẫu/24 shiny/backup/party/reload không lặp, bằng chứng `docs/team-pc-evidence/preview-grant.json` đã cập nhật. Runner/Vite/Chrome do các bài kiểm tra tạo đã dừng. Chỉ sửa fixture/test/docs; không chạy lại toàn bộ combat/UI vì không đổi runtime hoặc renderer. Không cần bug ID mới vì đây là yêu cầu thêm dữ liệu test.

## Đợt trước: bóng pixel, EXP PC, bộ mẫu và mini team

Đọc [TEAM_PC_PARITY_REVIEW.md](TEAM_PC_PARITY_REVIEW.md). Live kiểm tra lại06:38UTC16/11 vẫn build `b05c8cc201`, app `c0081498f2`/CSS `3e06fa8ed6`; tái sử dụng cache. **Bóng lần trước chưa đủ:** thiếu mask-composite/mask-position khiến caro thành đặc. Generator `extract-team-pc-styles.mjs` lấy đầy đủ mask/hover cho menu/filter, PC EXP native sát mép5px/3px, và CSS mini team. Đã xem crop native/local và ảnh mobile cuối.

Đã có mini team sáu slot khi cuộn qua ngưỡng native, top/width theo header/content, filter bám dưới, inspect/kéo thả và ẩn/inert/cleanup khi rời màn. Desktop sprite fitScale96, mobile tileScale24/34. Chưa đối chiếu từng frame idle.

**PC thường không nhận battle EXP.** Native vẫn cho Buddy trong PC thưởng theo mốc K.O. và family EXP khi bắt/quà trùng; giữ hai ngoại lệ này. Đã nối cap tiến trình Kanto vào reward/capture/gift/candy và Team/PC/inspect:20/24/30/38/46/54/62/70/75/83/88/93/95/100, dựa completedChapters/badge cao nhất, không phụ thuộc replay. Không hạ cấp hoặc ghi lại EXP cũ khi load. Native cap tiến trình giữ EXP dư tối đa next-1, Lv100 về0. Bảng candyXp lấy mẫu dưới cap20 bị0 từ Lv20; thưởng nay dùng round(levelXp×3) và kiểm cap riêng. `extract-kanto-level-caps.mjs` sinh bảng có guard từ bằng chứng native.

**Bộ test03 tự chạy khi reload save đã chọn starter trên DEV hoặc localhost/127.0.0.1/::1, cả production preview local; không cần query.** Có backup03 nguyên chuỗi, giữ marker/backup01/02 và UID01; bộ8 chỉ thêm4, bộ12 không trùng. Không đổi schema/reset marker. Người dùng cần F5 đúng origin rồi Continue; workspace không truy cập được profile thật. Có12 mẫu/4tier native, không bịa Unique Kanto. Chi tiết [RARITY_TEST_SAVE.md](RARITY_TEST_SAVE.md), ghi chú query-only phía dưới đã cũ.

Kiểm tra cuối **99/99 core, 35/35 browser**, production preview grant đạt, build đạt (cảnh báo chunk>500kB cũ). Browser gồm collection/scroll/Buddy/inspect/gift/notification/shadow/mini/EXP cap/save. `tests/buddy.spec.ts` chờ domcontentloaded và timeout60s để tránh tải asset làm fail navigation; hai test badge seed marker fixture để không bị bộ mẫu vừa cấp làm tăng Dex ngoài ca kiểm tra. Runner/Vite/Chrome do bài test tạo đã dừng. Bug mới **BUG-37–40**. Không tự chuyển milestone; giới hạn inspect/gift/Tastes/SFX trước vẫn còn.

## Đợt trước: bộ Pokémon test độ hiếm

Yêu cầu thêm2–3 Pokémon mỗi độ hiếm vào local save. Đã nâng `rarityTestSave.ts` lên **12 mẫu Lv20, 3 con mỗi Common/Uncommon/Rare/Legendary**; Kanto không có Unique, không gán tier giả hoặc mở vùng khác. Người dùng phải mở `?rarity-test=1` trên đúng origin/path đang chơi rồi Continue; không truy cập trực tiếp localStorage profile của họ từ workspace. Giữ party/preset/checkpoint/HP/tiền và save schema/reset marker. Bộ02 có backup riêng, giữ UID bộ01 để save đã nhận8 mẫu chỉ thêm4 con; marker/backup cũ không đụng tới. Xem [RARITY_TEST_SAVE.md](RARITY_TEST_SAVE.md). Core **3/3**, browser **1/1** và build cuối đạt (cảnh báo chunk cũ). Runner/Vite/Chrome do bài test tạo đã dừng.

## Đợt trước: Codex dừng, badge, bóng và font thẻ Pokémon

**Người dùng đã xác nhận “dừng” là Codex ngừng làm việc, chưa phải game bị treo.** Không điều tra/sửa một game freeze giả định hoặc đổi runtime chiến đấu vì câu hỏi cũ. Chưa có log để kết luận nguyên nhân phiên Codex dừng.

Đọc [NOTIFICATION_INSPECT_PARITY.md](NOTIFICATION_INSPECT_PARITY.md). Native v0.5.02/build `b05c8cc201` được kiểm tra live lại, app/CSS vẫn cùng hash. Audit runtime xác nhận **Dex báo loài mới; Team/PC chỉ báo shiny mới không có OT, dù ở đội hay PC**. Đã sửa sidebar, giữ reviewed-ID/schema/save hiện tại và hành vi bấm mở là xóa badge; không khôi phục NEW từng thẻ Dex.

Đã sửa tab chuyển trạng thái/bóng không nội suy theo CSS pixel native, lấy thêm mặt nút khi hover cho cả Team/PC và Dex; modal overlay blur3px/bóng20/60/viền3px; font Jersey10/Jersey15, facts/pips và nhãn New/Shiny của capture. CSS preview cũ đã bỏ, generator inspect dùng chung cho owned/Dex/capture. `extract-ui-polish-styles.mjs` nay cần thêm `docs/notification-inspect-evidence/reference.json` để tái tạo hover; audit riêng là `scripts/audit-notification-inspect.mjs`.

`PokemonStatBars.tsx` dùng chung: phần sọc trắng trong mẫu là **shiny +10%**, không phải HP đang trừ; Dex base stats đã bỏ thanh đơn màu chia180, dùng gradient/base160/vạch40 và không có bonus shiny. Rank/Tastes chưa nối đầy đủ. Keep duplicates/tiến hóa/hold candy/SFX của đợt trước vẫn chưa hoàn chỉnh; không coi tất cả inspect đã xong. **PC native không giới hạn**; không thêm cap dựa ghi chú cũ.

Kiểm tra cuối **30/30 browser đạt** (collections/Buddy/strict gift/parity mới), build cuối đạt; cảnh báo chunk>500kB còn từ trước. Đã xem ảnh capture native/local; native offline thiếu artwork nên không tuyên bố so từng frame GIF. Core/runtime không đổi, không chạy lại core vì đợt này chỉ sửa renderer/badge. Runner/Vite/Chrome do lượt kiểm tra tạo đã dừng. Bug mới **BUG-34–36**; không reset save/marker hoặc đổi milestone.

## Đợt trước: inspect/gift theo native, cấm tự sáng tạo

**Đọc [INSPECT_GIFTS_NATIVE_REVIEW.md](INSPECT_GIFTS_NATIVE_REVIEW.md) trước báo cáo Buddy cũ.** Người dùng yêu cầu bỏ UI/hành vi/điều kiện không có trong bản gốc; quy tắc đã thêm ở `AGENTS.md` và áp dụng các đợt sau. Không đặt nút/luồng giả để lấp tính năng chưa nối.

Build live đã kiểm tra lại bằng `npm run reference:check`: v0.5.02 `b05c8cc201`, trùng app `c0081498f2`/CSS `3e06fa8ed6` trong cache. Đã sửa Stats gradient/segmented/shiny theo base160, History đủ nguồn/địa điểm/OT/Wins, Family tĩnh/nhánh/icon đá; bỏ điều hướng họ, learned moves inline và nút chuyển đội trong inspect. Moves mở drawer native riêng, dữ liệu1977 hàng/151 loài từ runtime native. Team/PC vẫn kéo thả/preset; test đã đổi sang thao tác thật này.

Quà bỏ modal “Choose your gift” tự dựng. `adventureGiftEffects.ts` bọc visual `LinkFx`/`ItemFX.choose` được trích có guard/hash, một/nhiều Pokémon hoặc hóa thạch trong Arena; chọn rồi xác nhận, xong FX mới nhận. Reduced-motion dùng nhánh gift native. Adapter sở hữu timer/RAF/root/listener, hủy khi đổi node; pace hóa thạch chốt đầu FX, LinkFx giữ timing native. CSS keyframe có prefix riêng, không đè battle. Gift shiny/metadata/card dùng dữ liệu thật; fossil kiểm tra số lượng trước commit. Định nghĩa điều kiện gift/find/trade/static14 Kanto đã so thẳng với build này.

HP_BOOST1,1 đã vào công thức thật: Gyarados shiny100=907HP. Party/PC khớp công thức cũ được nâng maxHP, giữ nguyên HP hiện tại/UID/EXP, gục vẫn0; checkpoint đối thủ giữ snapshot tới hết encounter. Save key/version/marker không đổi, không reset.

Kiểm tra core **94/94**; browser **29/29** collections/Buddy/gifts, sau cô lập keyframes **23/23** gồm arena, capture/heal, cadence×1/×2/×3, trận Misty thật và strict parity. Lượt rà hình cuối sửa vị trí nút LinkFx theo CSS native, bỏ lớp dim dư ở Family và lấy nguyên title/footer/Buddy tooltip từ I18n; chạy lại **10/10 Buddy/strict parity** đạt, đã xem ảnh cuối. Các lượt có test trùng, không cộng thành62 ca độc lập. Build cuối đạt, còn cảnh báo chunk>500kB; runner/Vite/Chrome do lượt kiểm tra tạo đã dừng. Save/marker không reset.

**Còn thiếu thật:** Keep duplicates/giới hạn PC và retention nhánh họ, tiến hóa/item/FX, giữ candy liên tục, Tastes/SFX; không được coi inspect/toàn game100%. Chi tiết/giới hạn và cách tái tạo ở báo cáo mới. Không quay về UI tự thêm trong báo cáo lịch sử.

## Đợt trước: Buddy và inspect

Đã nối **Buddy UID riêng**, EXP chiến đấu×1,3, mốc K.O. theo họ gốc/ramp Lv20, thưởng riêng kể cả Buddy trong PC, chọn/bỏ/reset counter và save tương thích. Starter mới tự là Buddy; save cũ không tự chọn hoặc reset. Owned inspect dùng `InspectPokemonCard.tsx`: Love Ball, GIF Gen5ani, facts/move, EXP/candy thật, stats, Family/nhánh Eevee, History; marker Team/PC chỉ đúng Buddy. Không đưa tính năng đánh dấu yêu thích vào.

Đọc [BUDDY_INSPECT_REVIEW.md](BUDDY_INSPECT_REVIEW.md) trước khi sửa. Luật ở `buddy.ts`/`buddyReference.json`, reward commit vẫn một lần, không nhân family/candy XP. CSS sinh bởi `extract-inspect-styles.mjs`; adapter `inspect.css`, tách khỏi class capture/Dex preview. Không bỏ `position:relative` trên action button: pseudo frame có thể phủ toàn thẻ; xem BUG-29. Khung local/native cùng460/348/278px tại1440/390/320.

Kiểm tra cuối: **91/91 core**, **22/22 browser Buddy/collections**, build đạt (cảnh báo chunk cũ). **17/17 arena/cadence** đạt trước chỉnh CSS artwork cuối; walkthrough Chương1×1/×2/×3 và onboarding đạt ở lượt trước chỉnh nhỏ HP chưa lên cấp/CSS cuối. Xem báo cáo để biết thứ tự/phạm vi; không gộp thành một lần43/43. Ảnh cuối đã xem, runner/Chrome đã dừng. Save/marker không đổi.

Ghi chú HP825/chưa migrate và nguồn chỉ cache thuộc đợt cũ, đã được thay thế bởi đợt inspect/gift phía trên. Tastes/tiến hóa/hold candy/SFX vẫn chưa hoàn chỉnh; không dùng ghi chú lịch sử để phục hồi thao tác tự thêm.

## Các đợt trước và việc còn lại

Sổ lỗi tập trung: [BUGS_VA_CACH_KHAC_PHUC.md](BUGS_VA_CACH_KHAC_PHUC.md) ghi45 bug/sai lệch đã gặp, nguyên nhân, cách khắc phục, ca kiểm tra và giới hạn. Khi sửa bug mới, cập nhật mục tương ứng hoặc thêm ID; không đưa tính năng mới vào sổ. Đợt tạo sổ ban đầu chỉ sửa tài liệu; các mục bổ sung có kiểm tra và nguồn riêng.

Đợt sửa trước: **Pokédex tự nhảy lên khi cuộn, kiểm tra/sửa cả Team/PC**. Nguyên nhân là effect sang node của Arena đang mounted gọi `scrollIntoView`, cuộn luôn document dù đang ẩn. Đã đổi sang `rail.scrollTo` chỉ căn ngang timeline; giữ runtime/FX và vị trí đọc của cả hai collection. Xem [COLLECTION_SCROLL_FIX.md](COLLECTION_SCROLL_FIX.md). Không thêm cơ chế pause Arena hay reset save để chữa lỗi cuộn.

Kiểm tra sửa scroll: **10/10 browser đạt**, gồm cả hai collection ở desktop/mobile, timeline vẫn căn node cuối, capture không restart khi chuyển màn, filter/menu/mobile; build đạt với cảnh báo chunk cũ. Không đổi domain/store nên không chạy lại core. Runner/Chrome đã dừng.

Yêu cầu gần nhất: **căn lại phân bổ kích thước theo game gốc và bỏ NEW trên từng ô Pokédex**. Đã đo native v0.5.02 ở10 viewport, sửa mốc mobile640px, sidebar tablet, panel phải xuống dưới khi<1100px, sân mobile1:1, padding/tile PC/Dex và compact filter. Arena khớp vị trí/kích thước ở8 viewport390–1920px; giữ geometry khi mở collection. `markCollectionVisited('pokedex')` đánh dấu tất cả đã đọc và lưu ngay; chỉ còn badge ở menu, không có NEW ở ô hoặc header vùng. Xem [LAYOUT_PARITY_REVIEW.md](LAYOUT_PARITY_REVIEW.md) và các giới hạn toolbar/header còn lại; không coi toàn game100%. Không tự chuyển R05 hoặc đổi save.

Đợt trước: màn chờ có walk/hop/capture/respawn, pool93 loài Sinnoh có cả icon regular/shiny local (Unova chưa có box icon); type badge18 màu/contrast native; stylesheet v0.5.02, frame pixel sidebar/filter, font/tint/scanline/viền Dex và silhouette. Xem [UI_POLISH_REVIEW.md](UI_POLISH_REVIEW.md). Ghi chú NEW nhỏ trong báo cáo đó đã được yêu cầu mới thay thế: **không khôi phục NEW từng thẻ**.

Kiểm tra lượt căn kích thước: **83/83 core**, **37/37 browser**, build đạt (cảnh báo chunk lớn cũ). `docs/layout-evidence/checked-diff.json` rỗng; audit thô còn khác cấu trúc DOM/toolbar/tổng chiều dài trang, xem giới hạn trong báo cáo. Tái tạo native: `node scripts/measure-layout-reference.mjs`; xác minh: runner với `tests/layout-parity.spec.ts`. Adapter cuối `src/styles/layout-parity.css`; không dùng báo cáo style cũ thay cho đo hình học. Server/Chrome thử đã dừng.

Luồng mở game của đợt trước: mỗi lần mở/reload đều có title: save cũ Continue, save mới New game→Oak→starter. Title hydrate bằng `loadGame({deferEncounter:true})`, chưa khởi tạo encounter/FX/watchdog, chưa chạy combat/autosave; Continue mới restore checkpoint và vào runtime. Có hai nút Google/Discord và panel nói rõ bản local chưa nối OAuth/cloud backend, không giả đăng nhập thành công. Xem [ONBOARDING_PARITY.md](ONBOARDING_PARITY.md). Không reset save/marker.

Đợt trước: **thêm Pokémon nhiều độ hiếm vào save để test**. Công cụ dev opt-in `?rarity-test=1` backup save hiện có rồi thêm8 Pokémon Lv20 vào PC, không lặp khi reload; vẫn phải bấm Continue để vào Team/PC. Vì save nằm trong trình duyệt người dùng, chỉ áp dụng khi họ mở URL trên đúng origin đang chơi. Chi tiết [RARITY_TEST_SAVE.md](RARITY_TEST_SAVE.md).

Đợt ngay trước: **cập nhật nền theo độ hiếm**. Đã thêm native tierGlow cho PC/Pokédex, đồng bộ nhãn/sort với tierIndex151 loài. Xem [RARITY_BACKGROUNDS.md](RARITY_BACKGROUNDS.md): manifest vẫn BUILD b05c8cc201, chỉ trích phần UI cần thiết từ cache; chưa tự làm R05.

Đợt trước đã nối 14 chương Kanto và onboarding, cùng tài liệu [HOC_LAM_GAME_TU_DAU.md](HOC_LAM_GAME_TU_DAU.md). Đọc [R04.2](R04_2_KANTO_RUNTIME.md) và [onboarding](ONBOARDING_PARITY.md) khi sửa các phần này. Changelog v0.5.02 vẫn chỉ áp các phần được ghi ở [V0_5_02_UPDATE.md](V0_5_02_UPDATE.md), không coi mọi vùng/hệ thống mới đã có.

- Nếu người dùng ưu tiên UI/FX: rà phần còn lại của R03.1 — chi tiết phụ cinematic Gym, SFX và sai khác mobile đã ghi; chưa nghiệm thu toàn bộ.
- R04.2 đã có generator theo seed, source node và selector chung. Chương1 giữ 20 node để tương thích; bốn hoạt động special chưa có adapter bị khóa. Còn NPC ngẫu nhiên, forecast/đổi weather tự động, roamer và video từng phòng League chưa nghiệm thu.
- Cơ chế riêng chiêu trạng thái, tiến hóa, Shop và hoạt động phụ còn theo roadmap. Vùng mới/raid/trade của live mới chưa được coi là đã clone.

## Phiên bản theo từng phần

| Phần | Nguồn đang áp dụng | Bằng chứng |
|---|---|---|
| Moves/FX/learnset151 loài | v0.5.02, BUILD `b05c8cc201`, app `c0081498f2` | `src/data/liveMoveUpdate.json`, [LIVE_MOVE_UPDATE.md](LIVE_MOVE_UPDATE.md) |
| Baseline UI, trainer, cadence, chapter catalog | v0.4.103, BUILD `5598c5890a`, app `c0c995f8f9` | [reference-version.md](reference-version.md), các báo cáo R03/R04 |
| Kanto runtime/pool/Gym/League | v0.4.103, BUILD `5598c5890a` | `kantoRuntimeReference.json`, [R04.2](R04_2_KANTO_RUNTIME.md) |
| Onboarding/layout title/Oak/starter | v0.5.02, BUILD `b05c8cc201`, CSS `3e06fa8ed6` | [ONBOARDING_PARITY.md](ONBOARDING_PARITY.md) |
| Nền PC/Dex và tier display/sort | v0.5.02, BUILD `b05c8cc201`, CSS `3e06fa8ed6` | [RARITY_BACKGROUNDS.md](RARITY_BACKGROUNDS.md) |
| Title animation, type18, collection typography/surface, sidebar/filter frame | v0.5.02, BUILD `b05c8cc201`, app/CSS pin như trên | [UI_POLISH_REVIEW.md](UI_POLISH_REVIEW.md), `docs/ui-polish-evidence/reference.json` |

Live có thể đổi sau ngày trên. `npm run reference:check` chỉ so build **moves/FX**, không đánh dấu toàn game đồng bộ. Đối chiếu live bằng profile thử riêng, không dùng tài khoản/save người dùng.

## Mở đúng phần

| Tác vụ | Code bắt đầu | Tài liệu |
|---|---|---|
| Nhịp đánh, speed, HP, KO | `src/game/domain/presentationTiming.ts`, `src/game/systems/battle.ts`, `src/game/presentation/useArenaEffects.ts` | [BATTLE_CADENCE_REVIEW.md](BATTLE_CADENCE_REVIEW.md) |
| Chiêu/FX mới | `src/data/liveMoveUpdate.json`, `scripts/check-live-update.mjs`, `scripts/sync-live-moves.mjs` | [LIVE_MOVE_UPDATE.md](LIVE_MOVE_UPDATE.md) |
| Trainer, rail, sprite/bóng | `src/components/TrainerPresentation.tsx`, `PanelSprite.tsx`; `src/game/presentation/railLayout.ts`, `trainerFx.ts` | [R03_1_TRAINER_SPEED_REVIEW.md](R03_1_TRAINER_SPEED_REVIEW.md), [SPRITE_ASSETS.md](SPRITE_ASSETS.md) |
| Chapter/encounter | `src/game/data/chapterGenerator.ts`, `chapterSelectors.ts`, `src/game/systems/encounter.ts` | [R04_2_KANTO_RUNTIME.md](R04_2_KANTO_RUNTIME.md) |
| Quà/tiền/XP Kanto | `src/game/domain/kantoRewards.ts`, `src/game/systems/rewards.ts` | [R04_2_KANTO_RUNTIME.md](R04_2_KANTO_RUNTIME.md) |
| Title/Oak/starter | `src/components/StarterSelection.tsx`, `src/styles/onboarding.css`, `scripts/extract-onboarding-styles.mjs` | [ONBOARDING_PARITY.md](ONBOARDING_PARITY.md) |
| Đàn Pokémon title, theme/font/type/viền UI | `src/game/presentation/titleScene.ts`, `TitleField.tsx`, `TypeBadge.tsx`, `FilterSelect.tsx`, `scripts/capture-ui-polish-reference.mjs`, `scripts/extract-ui-polish-styles.mjs` | [UI_POLISH_REVIEW.md](UI_POLISH_REVIEW.md) |
| Collection/save | `src/components/CollectionPage.tsx`, `PokemonDetails.tsx`, `src/store/useGameStore.ts` | [R01_COLLECTIONS_OVERLAYS.md](R01_COLLECTIONS_OVERLAYS.md), [R02_RUNTIME.md](R02_RUNTIME.md) |
| Màu nền/độ hiếm Pokémon | `src/components/RarityGlow.tsx`, `src/game/presentation/pokemonRarity.ts`, `scripts/extract-rarity-ui.mjs` | [RARITY_BACKGROUNDS.md](RARITY_BACKGROUNDS.md) |
| Changelog v0.5.02, preview chiêu Team/PC | `src/game/domain/chapterOne.ts` (`mainMove`), `src/components/collectionUtils.ts` | [V0_5_02_UPDATE.md](V0_5_02_UPDATE.md) |
| Roadmap | — | [KE_HOACH_LAM_LAI_TOAN_BO_GAME.md](KE_HOACH_LAM_LAI_TOAN_BO_GAME.md); các mốc cũ là lịch sử |

Không in toàn `battleFxEngine.ts`, `chapterOneReference.json`, font hoặc bundle: có dòng rất dài. Dùng AST/script chỉ xuất section/diff/count/tên khóa cần xét.

## Kết quả gần nhất và giới hạn

- UI polish: **82/82 core**, hồi quy rộng44/46 browser; sửa2 lỗi cascade/assertion cũ rồi chạy lại3/3 (geometry/style/title), sau chỉnh padding control mobile thêm3/3 (geometry/mobile/style). Không cộng các lượt trùng; tập mẫu computed style và18 badge khớp native, `style-diff.json` rỗng. Build đạt, cảnh báo chunk cũ còn; ảnh desktop/mobile đã xem. Đàn title dùng93 loài Sinnoh vì box icon Unova chưa có; chưa nghiệm thu từng frame/SFX/theme sáng/toàn bộ hoạt động khóa. Giữ save/FX; runner đã dừng. Xem [UI_POLISH_REVIEW.md](UI_POLISH_REVIEW.md).
- Sửa màn vào game: **80/80 core**, browser17/17 ở lượt đầu; sau deferEncounter chạy lại **7/7** fresh/reload/Kanto checkpoint/onboarding/grant, build đạt. Không cộng hai lượt browser có ca trùng. Ảnh Continue mobile đã kiểm tra. Chi tiết [ONBOARDING_PARITY.md](ONBOARDING_PARITY.md); OAuth thật vẫn chưa nối. Runner/Chrome đã dừng.
- Công cụ thêm Pokémon test: **2/2 core**, **1/1 browser**, build đạt. Chỉ cấp khi URL dev có `?rarity-test=1`, giữ backup và chống lặp; save thật chỉ được sửa khi người dùng mở URL trên đúng origin. Xem [RARITY_TEST_SAVE.md](RARITY_TEST_SAVE.md).
- Đợt rarity: **19/19 browser** collections/sprites, build đạt; sau chờ ảnh thật test rarity chạy lại1/1 đạt. Computed gradient/animation so với native fixture; unknown ẩn, seen mờ, reduced motion tắt nhịp. Không chạy lại core hoặc sửa save. Runner/Chrome của đợt kiểm tra đã dừng.
- R04.2/onboarding: **77/77 core**, strict audit **0 vấn đề**, build đạt. Browser hồi quy đạt39/39 (arena/cadence/collection/Kanto/onboarding/trainer), sau căn title/focus đạt24/24 (onboarding, panel/sprite/progress và Chương1×1/×2/×3). Sau sửa nốt payout/XP/loot, chạy lại **24/24** arena/panel/Kanto/onboarding và fresh game/walkthrough Chương1×3 đạt. Các lượt có test trùng; không cộng thành số ca duy nhất. Không còn server/Chrome kiểm tra do lượt này giữ lại.
- Chương1 giữ20 node; 14 chương chính dùng selector chung, tổng bước run theo seed/snapshot. Node checkpoint mới có source; không nạp checkpoint legacy chương sau vào route khác. Champion kết thúc và reload không lặp thưởng; replay từ Adventure.
- Title luôn hiện trước khi vào sân; onboarding Oak/starter chỉ cho save chưa chọn. Có Red/Leaf/tên lưu, GIF Gen5ani, nhánh Pikachu/Escape, reduced motion; native FX được viết lại nên chưa nghiệm thu từng frame/SFX. Title trang trí pool Sinnoh hiện có, chưa có icon Unova; không có cloud login.
- Berry ngoài bốn loại đang dùng được giữ trong Bag; chưa nối tác dụng sử dụng. Item drop và League payout/XP đã dùng bảng/hệ số nguồn. Tiến hóa sở hữu/level cap/Shop và weather tự động cần tiếp tục, không suy ra đã xong từ dữ liệu encounter.
- Trước R04.2, sau đối chiếu changelog: **64/64 core**, **12/12 browser collection**, build đạt; `mainMove` khớp **1.057 mẫu native** của151 loài ở1/5/64/65/84/85/100. Các số này là lịch sử theo từng đợt.
- Danh mục503→661 chiêu:160 thêm,2 bỏ;116 chiêu mới gây damage có FX đã chạy. Dùng `learnAll` hiệu lực cho151 loài, không lấy raw learn;44 entry mới còn lại không được giả làm damage.
- **63/63 core**, **20/20 browser** cuối đạt: toàn116 FX mới, cancel/reuse canvas, arena/capture/heal và cadence ba tốc độ. 6 ca trainer đạt ở lượt trước sửa fallback4 FX, không phải lượt toàn bộ sau đó.
- Build đạt; cảnh báo chunkJS>500kB còn. Walkthrough Chương1×3 đạt sau sửa cadence **trước** nâng moves/FX; không ghi nhầm là video sau nâng cấp.
- Strict audit R04.2 hiện đạt **0 vấn đề**, thay kết quả lịch sử 32 vấn đề legacy. Runtime đã đi tới Misty ở ba speed và qua các chương đến Champion bằng fixture đã huấn luyện; chưa chứng minh cân bằng cày tự nhiên.
- Save giữ key `pokecatch_save_v1`, version2/saveVersion4. Marker code hiện tại `pokecatch_reset_20261115_02`; không kích hoạt reset mới. Tên cũ trong lịch sử không phải chỉ dẫn reset.

## Kiểm tra theo thay đổi

| Thay đổi | Kiểm tra trước bàn giao |
|---|---|
| Chỉ tài liệu/rule | Link tồn tại, nội dung đúng code; không chạy bộ game |
| Domain/store/data | `npm test`; build nếu đổi nguồn production |
| Battle/timing/FX | Core + `tests/arena.spec.ts`, `tests/battle-cadence.spec.ts`; thêm `tests/live-moves.spec.ts` khi sửa engine/moves |
| Trainer/Gym | Core + `tests/trainer-review.spec.ts`; ảnh/video đúng pha |
| Rail/sprite/collection | Chọn `tests/pokemon-sprites.spec.ts`, `tests/battle-panels.spec.ts`, `tests/collections.spec.ts` theo phần sửa |
| Chapter generator | Core + `npm run audit:chapters`; walkthrough chapter liên quan, ghi seed/team/speed |

Browser: `node scratch/visual-parity/run-browser-checks.mjs <spec...>`. Thiếu runner thì xem Playwright config, dùng runner sở hữu/thu hồi server tương đương; tránh Vite trùng port. Không sửa production source khi kiểm tra chạy.

## Quy trình cập nhật và bàn giao

1. Chốt phạm vi được giao → đọc metadata phần đó → kiểm tra build nếu cần.
2. Dùng cache; chỉ tải file đổi hash, trích section cần dùng, so cấu trúc và lưu provenance. Native renderer có alias/closure: rà adapter, không copy tùy tiện.
3. Sửa phần cụ thể → chạy nhóm kiểm tra tương ứng → ghi kết quả/giới hạn. Đã đạt thì dừng, trừ khi sửa mới tạo nghi vấn.
4. Cập nhật trạng thái đầu file này và báo cáo chuyên đề: nguồn, file chính, test/phạm vi, việc còn lại. Nếu dừng giữa chừng, ghi ca tái hiện và lệnh tiếp theo, không chỉ ghi “continue”.

Raw snapshot/runner trong `scratch/` không đi theo Git. Thiếu nguồn thì dùng manifest trong `docs` khôi phục đúng URL/hash; chưa có nguồn phải ghi chưa xác minh. Nhật ký nguyên bản: [PROJECT_HISTORY.md](PROJECT_HISTORY.md).
