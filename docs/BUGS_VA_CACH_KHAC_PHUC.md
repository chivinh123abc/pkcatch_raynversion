# Các bug đã gặp và cách khắc phục

Cập nhật: **16/11/2026**. Sổ này tổng hợp lỗi đã gặp trong quá trình làm bản clone, cách xử lý và cách kiểm tra để tránh tái diễn. Chỉ ghi lỗi và sai lệch đã được báo cáo; không đưa danh sách tính năng mới vào đây.

**Cách đọc trạng thái:** “Đã sửa” là đã có thay đổi và kiểm tra trong phạm vi nêu ở tài liệu dẫn nguồn, không có nghĩa toàn bộ game đã giống100%. “Cần rà tiếp” là phần vẫn còn giới hạn đã biết. Các số kiểm tra ở từng báo cáo thuộc từng đợt, không cộng dồn thành một lần chạy mới.

## Lỗi bổ sung trong đợt inspect/gift

### BUG-31 — Inspect có thao tác và cách hiển thị tự thêm

- **Biểu hiện:** thanh Stats một màu/tỷ lệ tùy ý, History thiếu nguồn/địa điểm/OT/Wins, danh sách move inline, Family bấm điều hướng và nút chuyển đội không có trong inspect native.
- **Cách sửa:** dùng DOM/CSS và dữ liệu drawer native; Stats gradient/vạch chia/shiny; Family tĩnh; History đủ trường và không suy đoán metadata cũ. Bỏ nút chuyển đội khỏi inspect, kiểm tra lại kéo thả/preset ở Team/PC.
- **Kiểm tra:** browser inspect ba viewport, chiêu tương lai/trạng thái, Escape drawer, History fixture và thao tác đội; xem [báo cáo](INSPECT_GIFTS_NATIVE_REVIEW.md).

### BUG-32 — Quà cốt truyện dùng modal tự dựng và nhận ngay khi chọn hình

- **Cách sửa:** hóa thạch dùng ItemFX.choose trong sân; Pokémon dùng LinkFx; có bước xác nhận native. Khi đổi node/unmount, hủy FX/timer/listener để callback cũ không cấp quà. Chốt pace đầu FX, roll shiny thật và kiểm tra lại vật phẩm đổi quà.
- **Lỗi gặp khi port:** selector `.native-gift .item-choice.ready` yêu cầu root lồng nhau, trong khi hai class cùng một root. `pointer-events:auto` không áp dụng nên Arena chặn click hóa thạch. Generator nay scope root selector đúng; test dùng click thật, không force.
- **Kiểm tra:** hóa thạch normal/reduced, một/nhiều Pokémon, xác nhận hai bước, đổi tốc độ, đổi node, receipt/refresh; định nghĩa quà14 Kanto so trực tiếp với native.

### BUG-33 — HP lệch native v0.5.02 vì thiếu hệ số1,1

- **Biểu hiện:** Gyarados shiny100 local825HP, native907HP.
- **Cách sửa:** bổ sung HP_BOOST vào công thức, nâng party/PC nhận diện công thức cũ, giữ UID/EXP/HP hiện tại và trạng thái gục. Không hardcode số907 trong inspect, không reset save, không thay checkpoint đối thủ giữa trận.
- **Kiểm tra:** core kiểm tra chỉ số mẫu, save/load, migration lặp và Pokémon gục/tùy chỉnh; browser chiến đấu và cadence được ghi ở handoff.

## 1. Chiến đấu, tốc độ và hiệu ứng

### BUG-01 — Pokémon hết HP vẫn tiếp tục phản đòn

- **Biểu hiện:** đối thủ bị hạ nhưng vẫn đánh lại; HP và thứ tự hành động không khớp hình ảnh.
- **Nguyên nhân:** điều phối lượt chưa ràng buộc việc phản công với HP sau điểm chạm; callback đến muộn có thể tiếp tục lượt cũ.
- **Cách sửa:** trừ HP tại callback impact, chặn HP tại0, kiểm tra KO trước khi xếp actor tiếp theo. Pokémon đã gục không được tạo đòn đánh mới. Callback phải đúng encounter/operation key.
- **Kiểm tra lại:** dùng đòn đủ hạ đối thủ, xác nhận HP về0 và không có phản công; gọi impact lặp không trừ thêm HP.
- **Trạng thái:** đã sửa. Nguồn: [R02 runtime](R02_RUNTIME.md), [Chương1](R03_CHAPTER_1.md). Code: `src/game/systems/battle.ts`; test: `tests/gameplay-runtime.test.mjs`, `tests/arena.spec.ts`.

### BUG-02 — HP giảm không đúng lúc đòn đánh chạm

- **Biểu hiện:** thanh HP thay đổi trước hoặc sau va chạm, làm cảm giác đòn đánh bị lệch.
- **Cách sửa:** renderer báo impact về runtime; chỉ commit damage tại impact và chỉ một lần. Tách thời điểm trừ HP khỏi recovery và thời gian đọc thông báo.
- **Kiểm tra lại:** quan sát HP trước/sau điểm chạm bằng hiệu ứng thật; callback impact gọi hai lần vẫn chỉ gây damage một lần.
- **Trạng thái:** đã sửa luồng impact. Nguồn: [R02](R02_RUNTIME.md), [nhịp chiến đấu](BATTLE_CADENCE_REVIEW.md). Không coi đây là nghiệm thu mọi frame của mọi move.

### BUG-03 — Đánh quá nhanh ở cả ×1, ×2, ×3

- **Nguyên nhân:** clone thiếu khoảng chờ325/pace sau từng actor và thiếu thời gian đọc thông báo khắc hệ/chí mạng; không thể chữa chỉ bằng đổi hệ số tốc độ.
- **Cách sửa:** sau FX giữ khóa qua recovery rồi mới chờ hàng đợi trước actor kế tiếp. Recovery thường260ms, chi tiết710ms, trượt400ms, miễn nhiễm500ms; các khoảng này chia pace. Mở khóa và dispatch cùng callback để polling không chen lượt.
- **Kiểm tra lại:** đo Tackle start→actor kế tiếp. Ở đợt đo, native/clone sau sửa lần lượt là946/940ms tại×1,488/490ms tại×2,385/391ms tại×3. Đây là fixture có kiểm soát, không phải số cố định cho mọi chiêu.
- **Trạng thái:** đã sửa. Nguồn: [BATTLE_CADENCE_REVIEW.md](BATTLE_CADENCE_REVIEW.md). Code: `src/game/domain/presentationTiming.ts`, `src/game/systems/battle.ts`; test: `tests/battle-cadence.spec.ts`.

### BUG-04 — Hiểu sai tốc độ ×3 và tăng tốc mọi khoảng thời gian

- **Nguyên nhân:** coi nhãn×3 là pace3; trong snapshot native đã đối chiếu, nhãn này có pace2,5. Một số chuyển động trainer/Gym có thời lượng cố định, không chia toàn bộ cho tốc độ.
- **Cách sửa:** giữ UI/save1/2/3, dùng `gameplaySpeed()` đổi sang1/2/2,5. Chỉ chia các khoảng chờ thuộc luật tốc độ; buff vẫn theo giây thực.
- **Kiểm tra lại:** so cadence ở ba nút; xác nhận buff không tụt nhanh hơn khi tăng tốc và cinematic không bị cắt ngắn toàn bộ.
- **Trạng thái:** đã sửa theo snapshot. Nguồn: [trainer và tốc độ](R03_1_TRAINER_SPEED_REVIEW.md).

### BUG-05 — Đổi tốc độ hoặc mở Team/PC làm ngắt/phát lại FX

- **Nguyên nhân cần tránh:** gắn vòng đời hiệu ứng vào mỗi lần render/thay speed hoặc unmount Arena khi mở màn khác.
- **Cách sửa đã áp dụng:** giữ Arena mounted; mỗi request Battle/Capture/Heal/Item chốt speed lúc bắt đầu. Đổi nút không đổi key request hiện tại; hiệu ứng kế tiếp dùng speed mới. Timer/layer có cleanup riêng.
- **Kiểm tra lại:** đổi speed giữa đòn đánh, capture và heal; mở Team/PC rồi quay lại. Effect key và instance đang chạy được giữ, impact/reward chỉ một lần.
- **Trạng thái:** đã sửa các luồng được kiểm tra. Nguồn: [R02](R02_RUNTIME.md); test: `tests/arena.spec.ts`.

### BUG-06 — Callback cũ tác động lên node mới hoặc cấp thưởng lặp

- **Biểu hiện:** đổi node/encounter nhưng timer cũ vẫn trừ HP, mở khóa sai lượt hoặc cấp lại tiền/EXP/Pokémon.
- **Cách sửa:** runtime quản lý encounter ID, operation key, timer và watchdog. Đổi node hủy job cũ; callback vẫn phải kiểm tra key. Ledger chặn commit lặp theo loại thưởng và ID.
- **Kiểm tra lại:** đổi node trước impact/completion, gọi completion lặp, Skip rồi để callback tự nhiên đến sau; không có damage/thưởng/chuyển hai node.
- **Trạng thái:** đã sửa. Nguồn: [R02](R02_RUNTIME.md). Code: `src/game/runtime/GameplayRuntime.ts`, `src/game/systems/`; test: `tests/gameplay-runtime.test.mjs`.

### BUG-07 — Trainer bắt đầu đánh khi Pokémon chưa được tung ra xong

- **Biểu hiện:** đánh vào sprite chưa hiện hoặc sai chuỗi thu/tung khi trainer đổi Pokémon; checkpoint có thể giữ khóa intro.
- **Cách sửa:** request presentation có key và stage intro/sendout; combat chờ renderer hoàn tất. Thay đối thủ phải qua recall→sendout. Bỏ callback cũ/lặp, có watchdog; restore checkpoint không giữ request intro tạm thời.
- **Kiểm tra lại:** intro trainer/Gym, KO Pokémon đầu, đổi speed giữa cảnh và reload giữa trận; chỉ đánh sau sendout, không kẹt khóa.
- **Trạng thái:** đã sửa điều phối. Các chi tiết cinematic/SFX vẫn cần rà tiếp. Nguồn: [R03.1 trainer](R03_1_TRAINER_SPEED_REVIEW.md).

### BUG-08 — Chuyển bước khi heal hoặc rơi vật phẩm chưa hoàn tất

- **Biểu hiện:** quà chưa rơi/nhặt xong đã sang cảnh khác; Skip hoặc completion có thể chuyển bước trùng.
- **Cách sửa:** node chờ presentation hoàn tất qua key hiện tại. Skip và completion đi chung luồng kết thúc có chống lặp. Khi cả đội thất bại phải hồi phục trước, rồi mới quay về đầu route.
- **Kiểm tra lại:** để hiệu ứng chạy hết, bấm Skip nhiều lần, đổi speed trong lúc heal/item; inventory và node chỉ cập nhật một lần.
- **Trạng thái:** đã chuẩn hóa vòng đời; độ giống hình ảnh từng FX vẫn cần đối chiếu riêng. Nguồn: [R02](R02_RUNTIME.md), [Chương1](R03_CHAPTER_1.md).

## 2. Sprite, panel và modal

### BUG-09 — Panel phải hiện hai Poké Ball chồng nhau

- **Nguyên nhân:** tile caught vừa thêm ảnh trong JSX vừa nhận bóng qua CSS `::after` của baseline.
- **Cách sửa:** chỉ giữ một marker; không thêm ảnh thứ hai khi pseudo-element đã đảm nhiệm. Nhãn accessible vẫn thể hiện caught.
- **Kiểm tra lại:** Found here/Pokédex ở trạng thái caught chỉ có một quả bóng; so cả desktop và mobile.
- **Trạng thái:** đã sửa. Nguồn: [panel chiến đấu](R03_1_BATTLE_PANELS.md), [UI polish](UI_POLISH_REVIEW.md).

### BUG-10 — Pokémon trong rail bên trái quá lớn, ô chia sai tỷ lệ

- **Nguyên nhân:** scale theo loài nhỏ có thể lên3×; chiều cao chia theo số Pokémon thực có làm đội ít con bị kéo to.
- **Cách sửa:** `railLayout.ts` tính theo sức chứa tối thiểu6 vị trí, tile28–60px, căn giữa số hàng đang dùng. `PanelSprite` chỉ dùng1×/2× và dựa vào phần pixel có nội dung.
- **Kiểm tra lại:** đội1–6 con, loài nhỏ/lớn, Pokémon gục, các viewport hẹp; sprite không che level/HP.
- **Trạng thái:** đã sửa các mẫu được kiểm tra. Nguồn: [R03.1 trainer/sprite](R03_1_TRAINER_SPEED_REVIEW.md); test: `tests/pokemon-sprites.spec.ts`, `tests/battle-panels.spec.ts`.

### BUG-11 — Bóng đổ trên sân lệch khỏi Pokémon

- **Nguyên nhân:** căn giữa hai lần bằng `transform` và `translate`.
- **Cách sửa:** chỉ giữ một phép dịch căn giữa, thống nhất pivot của sprite và shadow.
- **Kiểm tra lại:** so tâm sprite/shadow ở hai phía sân và nhiều kích thước cửa sổ.
- **Trạng thái:** đã sửa. Nguồn: [R03.1](R03_1_TRAINER_SPEED_REVIEW.md).

### BUG-12 — Ảnh trong modal bắt mới quá to, đứng im hoặc dùng sai bộ ảnh

- **Cách sửa:** giữ scale capture khoảng0,78 và idle theo yêu cầu. Artwork lớn đi qua `PokemonArt` với GIF Showdown **Gen5ani** người dùng cung cấp; icon danh sách/rail/sân vẫn dùng PNG crop theo renderer tương ứng.
- **Tổ chức tài nguyên:** nguồn trong `resources/pokemon/showdown/gen5ani*`, đồng bộ phần được hỗ trợ sang `public/assets/pokemon/showdown/` bằng `npm run assets:sync`; không hardcode đường dẫn từng loài.
- **Kiểm tra lại:** capture thường/shiny, modal chi tiết, GIF tải thật; không đổi đồng loạt icon nhỏ sang GIF.
- **Trạng thái:** đã sửa nguồn artwork và presentation đã triển khai. Nguồn: [sprite assets](SPRITE_ASSETS.md), [collection/modal](R01_COLLECTIONS_OVERLAYS.md).

### BUG-13 — Thông báo bắt thành công chồng thanh chữ chiến đấu

- **Biểu hiện:** kết quả bắt và battle log đè lên nhau ở đáy sân.
- **Cách sửa:** tách vị trí kết quả bắt khỏi log/speed controls, dành khoảng cách riêng theo viewport thay vì cùng ghim một tọa độ đáy.
- **Kiểm tra lại:** capture thật ở desktop/mobile; thông báo kết quả luôn nằm phía trên log và không che nút tốc độ.
- **Trạng thái:** đã sửa các viewport được kiểm tra. Nguồn: [collection/modal](R01_COLLECTIONS_OVERLAYS.md); test: `tests/arena.spec.ts`, ca `capture success stays above the battle log`.

### BUG-14 — Dialog chi tiết và bắt mới chồng lên nhau; nội dung modal hẹp bị đè

- **Cách sửa:** App sở hữu capture dialog toàn cục và ưu tiên capture hơn chi tiết/Bag. Modal dùng portal, inert nền, trap/restore focus. Capture chờ Continue, ESC không tự bỏ qua. `dc-facts` là con trực tiếp của `dc-top`, chia vùng ảnh/type/facts rõ ràng.
- **Kiểm tra lại:** đang xem chi tiết thì có capture mới; chỉ một dialog hiện. Ở320×568, genus/type/facts/Continue không đè nhau, nội dung có thể cuộn.
- **Trạng thái:** đã sửa. Nguồn: [R01 collections/overlays](R01_COLLECTIONS_OVERLAYS.md); test: `tests/collections.spec.ts`, `tests/battle-panels.spec.ts`.

## 3. Giao diện, thông báo và vị trí cuộn

### BUG-15 — Badge thông báo menu chồng chữ hoặc không mất khi mở màn

- **Cách sửa:** badge có class bố trí riêng trong nút, không kế thừa text-shadow active. Tách trạng thái đã ghé Team/PC theo UID và Dex theo species. Màn đang mở không hiện count; Pokémon đến khi đang ở màn cũng được đánh dấu đã xem.
- **Kiểm tra lại:** có Pokémon mới, mở từng màn và reload; badge màn tương ứng mất, không xóa nhầm badge màn còn lại.
- **Trạng thái:** đã sửa; hành vi NEW từng ô tiếp tục được thay thế ở BUG-16. Code: `src/App.tsx`, `src/components/LeftSidebar.tsx`, `src/store/useGameStore.ts`; test: `tests/collections.spec.ts`.

### BUG-16 — Pokédex hiện NEW trên từng Pokémon và bắt bấm từng thẻ để xóa

- **Nguyên nhân:** UI dùng `pokedexReviewed` cho từng entry, tách khỏi badge ghé màn nên người dùng đã mở Dex vẫn thấy NEW khắp lưới.
- **Cách sửa theo yêu cầu mới nhất:** bỏ DOM `.dex-new` và `.dex-unread` trong collection. Khi ghé Dex, `markCollectionVisited('pokedex')` đồng bộ toàn bộ loài đã bắt vào `dexNotifiedSpecies` và `pokedexReviewed`, lưu ngay.
- **Kiểm tra lại:** mở Dex lần đầu không có NEW từng ô/header vùng; không cần bấm từng Pokémon; reload vẫn giữ đã đọc.
- **Trạng thái:** đã sửa. Không khôi phục cách làm cũ trong tài liệu lịch sử. Nguồn: [layout review](LAYOUT_PARITY_REVIEW.md); test: `tests/collections.spec.ts`, `tests/game-store.test.mjs`.

### BUG-17 — Phân bổ khung game, sidebar, sân và lưới khác bản gốc

- **Nguyên nhân:** adapter giữ mốc mobile800px thay vì640px; sidebar tablet rộng thừa40px; panel phải chưa xuống dưới khi<1100px; sân mobile4:3 thay vì1:1. Dex thêm padding lặp; PC bị ép min-height; Team bị cắt move một dòng.
- **Cách sửa:** đo cùng CSS viewport bằng renderer native, sửa adapter theo các breakpoint thực. Bỏ padding lưới dư, bỏ min-height ép ô PC, dùng kích thước art/scale nguyên và chiều cao Team theo nội dung. Dấu shiny có box riêng để font fallback không kéo cao cả hàng.
- **Kiểm tra lại:** ma trận10 viewport320–2560px; vị trí/kích thước sân ở8 viewport390–1920px; mở collection vẫn giữ geometry Arena. Không kết luận tỷ lệ từ ảnh chụp có zoom/DPR chưa biết.
- **Trạng thái:** đã sửa tập kích thước chính; **cần rà tiếp** một số header/toolbar do nội dung và tính năng còn khác. Nguồn: [LAYOUT_PARITY_REVIEW.md](LAYOUT_PARITY_REVIEW.md); code: `src/styles/layout-parity.css`; test: `tests/layout-parity.spec.ts`.

### BUG-18 — Font, nhãn hệ, độ hiếm hoặc silhouette hiển thị sai

- **Nguyên nhân đã xử lý:** font/weight/line-height và màu hardcode lệch nguồn; opacity/filter đặt ở nhiều lớp làm sprite tối hai lần; chỉ so màu/font nhưng hiểu nhầm là đã khớp hình học.
- **Cách sửa:** trích thuộc tính trình bày theo snapshot, dùng chung18 màu hệ và TypeBadge, đồng bộ tier glow. Chỉ áp filter silhouette ở một lớp ảnh. Đo computed style và geometry thành hai tập kiểm tra riêng.
- **Kiểm tra lại:** thường/shiny, caught/seen/unknown, nhiều độ hiếm, reduced motion; so font/nền/viền/bóng với đúng build tham chiếu.
- **Trạng thái:** đã sửa các selector/mẫu được kiểm tra; chưa nghiệm thu mọi màn/theme. Nguồn: [UI polish](UI_POLISH_REVIEW.md), [rarity](RARITY_BACKGROUNDS.md); test: `tests/ui-polish.spec.ts`, `tests/collections.spec.ts`.

### BUG-19 — Control không ẩn/không đúng font dù adapter đã ghi đè CSS

- **Nguyên nhân:** selector cũ `.btn.small:not(#_)` mang specificity của ID; rule mới có nhiều class vẫn có thể thua. Select trực tiếp cũng không vẽ frame pseudo-element như wrapper.
- **Cách sửa:** kiểm tra rule thắng trong computed style; dùng selector đủ specificity cho đúng control, không sửa tay CSS sinh. Đặt select trong `FilterSelect` để wrapper vẽ frame pixel. Mobile đưa bộ lọc phụ vào popover có Done/ESC.
- **Kiểm tra lại:** More filters ẩn trên desktop, hiện trên mobile; các filter phụ đóng/mở được, không tràn ngang; typography không bị rule cũ ép sai weight.
- **Trạng thái:** đã sửa. Nguồn: [layout review](LAYOUT_PARITY_REVIEW.md), [UI polish](UI_POLISH_REVIEW.md).

### BUG-20 — Cuộn Pokédex/Team-PC một lúc thì tự nhảy lên đầu

- **Nguyên nhân:** Arena vẫn mounted và sang node trong nền. Effect theo `currentStep` gọi `scrollIntoView()`, làm browser cuộn cả ancestor/document tới timeline dù Arena đang ẩn bằng opacity.
- **Tái hiện đã đo:** Dex desktop từ scrollY650 về78; mobile từ650 về85 sau đổi node. Team/PC dùng chung effect.
- **Cách sửa:** thay bằng `rail.scrollTo({left, behavior:'smooth'})`, tính left từ vị trí node và rail cộng scrollLeft hiện tại. Chỉ cuộn ngang thanh timeline; không pause game, remount Arena hoặc ép cửa sổ quay lại vị trí cũ để che lỗi.
- **Kiểm tra lại:** hai collection ở1440/390px, cuộn xuống rồi đổi ít nhất hai node nền; scrollY giữ nguyên. Ở sân thật, node cuối vẫn được đưa vào vùng nhìn của timeline. Fixture phải đủ dài và tính vị trí cuộn theo chiều cao thật, tránh nhầm browser clamp ở cuối trang với bug.
- **Trạng thái:** đã sửa; lượt cuối **10/10 browser đạt**, build đạt. Nguồn: [COLLECTION_SCROLL_FIX.md](COLLECTION_SCROLL_FIX.md). Code: `src/components/Arena.tsx`; test: `tests/collections.spec.ts`, `tests/arena.spec.ts`.

## 4. Màn mở đầu, dữ liệu và save

### BUG-21 — Mở game vào thẳng sân, bỏ qua màn đầu

- **Nguyên nhân:** trạng thái đã chọn starter bị dùng thay cho trạng thái đã bấm Continue trong phiên; hydrate save cũng có thể khởi tạo encounter quá sớm.
- **Cách sửa:** tách `sessionEntered` khỏi `starterChosen`. Reload luôn vào title; save cũ có Continue, save mới đi qua New game/Oak/starter. `loadGame({deferEncounter:true})` chỉ hydrate khi ở title; Continue mới restore encounter và chạy gameplay/autosave.
- **Kiểm tra lại:** save mới, save cũ, reload giữa Gym/capture; trước Continue không có combat timer, FX, thưởng hoặc autosave placeholder ghi đè checkpoint.
- **Trạng thái:** đã sửa. Nguồn: [onboarding](ONBOARDING_PARITY.md); test: `tests/onboarding.spec.ts`, `tests/startup-save.test.mjs`.

### BUG-22 — Reload làm reroll bắt Pokémon hoặc nhận lại thưởng

- **Nguyên nhân cần tránh:** chỉ lưu bước route mà không lưu outcome và receipt của node/encounter đã giải quyết.
- **Cách sửa:** lưu `encounterCheckpoint`, `resolvedNode`, enemy HP, trainer index, kết quả capture và UID đã cấp XP; commit thưởng cùng receipt trước khi advance. Run chương có seed/source node để dựng lại đúng tiến trình.
- **Kiểm tra lại:** reload trong capture, sau KO/Gym, khi nhận quà hoặc đổi hóa thạch; không reroll outcome, trừ vật phẩm hai lần hoặc thưởng lại.
- **Trạng thái:** đã sửa các luồng checkpoint đã triển khai. Nguồn: [Chương1](R03_CHAPTER_1.md), [Kanto runtime](R04_2_KANTO_RUNTIME.md); test: `tests/chapter-one.spec.ts`, `tests/kanto-runtime.spec.ts`.

### BUG-23 — EXP, tiền wild và hiệu quả berry dựa vào giả định cũ

- **Sai lệch đã ghi nhận:** thêm tiền mỗi wild KO, bắt mới cộng lại XP chiến đấu, nhầm tác dụng berry hoặc popup XP không đúng luồng thưởng.
- **Cách sửa theo baseline đã đối chiếu:** wild money=0; tách KO XP và family XP; capture mới không nhận KO XP lần hai, duplicate xử lý đúng họ ở party/PC. Razz/Golden Razz tăng xác suất×1,25/×1,5, Pinap XP×1,25; giữ tên trường save cũ để tương thích.
- **Kiểm tra lại:** so lượng XP thực cộng với popup, wild KO/capture mới/duplicate/shiny; test dùng RNG và clock kiểm soát. Không phục hồi công thức cũ chỉ vì có trong nhật ký.
- **Trạng thái:** đã điều chỉnh theo baseline Chương1; không suy ra mọi hoạt động/vùng mới đã có cùng luật. Nguồn: [R03_CHAPTER_1.md](R03_CHAPTER_1.md).

### BUG-24 — Nhiều chương dùng lại dữ liệu Chương1 hoặc tổng bước không khớp

- **Nguyên nhân:** chapter catalog có tên/metadata nhưng runtime vẫn lấy mảng bước legacy; mở chương mới không đồng nghĩa đã có nội dung riêng.
- **Cách sửa:** nối14 template Kanto vào generator/selector chung, lưu seed và ngữ cảnh của run; đồng bộ pool encounter và Found here, trainer/Gym/League, điều kiện mở chương, quà và replay. Chương1 giữ20 node đã kiểm tra để tương thích save.
- **Kiểm tra lại:** đi Chương2 tới Misty rồi các Gym/League; reload tái dựng cùng node; khóa chương và thưởng Champion hoạt động đúng.
- **Trạng thái:** đã nối runtime Kanto trong phạm vi báo cáo; NPC ngẫu nhiên, forecast/roamer và một số hoạt động còn giới hạn. Nguồn: [R04_2_KANTO_RUNTIME.md](R04_2_KANTO_RUNTIME.md); test: `tests/kanto-runtime.test.mjs`, `tests/kanto-runtime.spec.ts`.

## 5. Lỗi dữ liệu và tài nguyên được ghi trong các đợt trước

### BUG-25 — Đứng trận khi gặp trainer có loài chưa có trong dữ liệu

- **Biểu hiện lịch sử:** đứng hình khi gặp trainer thứ hai, Ace Trainer Maria, có Nidoran♀ và Spearow.
- **Nguyên nhân:** dữ liệu loài chưa đầy đủ, truy cập species không an toàn khi dựng Pokémon/hiển thị trainer.
- **Cách sửa đã ghi nhận:** bổ sung đủ151 loài Kanto và dùng resolver `getPokemonSpecies()` thay việc truy cập thiếu kiểm tra. Khi thêm trainer mới phải kiểm tra mọi species ID trong đội và pool đều có dữ liệu.
- **Kiểm tra lại:** đi qua trainer liên quan và audit ID của toàn bộ chapter; không chỉ kiểm tra starter hoặc Pokémon hoang dã đầu tiên.
- **Trạng thái:** đã sửa theo [nhật ký dự án](PROJECT_HISTORY.md); dữ liệu chương mới tiếp tục được audit ở [R04.2](R04_2_KANTO_RUNTIME.md).

### BUG-26 — Pokémon lật ngược hướng khi lao vào tấn công

- **Nguyên nhân lịch sử:** lật bằng `scaleX(-1)` ở cả lớp sprite lẫn keyframe `lungeRight`.
- **Cách sửa:** chỉ một lớp sở hữu hướng nhìn; lớp chuyển động chỉ dịch chuyển hoặc scale cần thiết, không lật thêm lần nữa. Với renderer mới, kiểm tra transform của từng wrapper trước khi sửa keyframe.
- **Kiểm tra lại:** đồng đội và đối thủ đều quay đúng hướng khi idle, lao tới, bị đánh và trở về; so cả sprite thường/shiny.
- **Trạng thái:** đã sửa ở đợt đầu theo [nhật ký](PROJECT_HISTORY.md). Không sao chép transform cũ đè lên renderer hiện tại trong `src/components/BattleSprite.tsx`.

### BUG-27 — Ảnh shiny trỏ vào thư mục không tồn tại

- **Nguyên nhân lịch sử:** đường dẫn `public/assets/shiny/` không đúng cấu trúc asset. Đợt đầu từng dùng remote fallback để tránh mất hình.
- **Cách xử lý hiện tại:** PNG shiny đi qua resolver chung tới `/assets/pokemon/shiny/<id>.png`; GIF shiny dùng manifest/resolver Gen5ani riêng. Không khôi phục remote fallback hoặc đường dẫn cũ chỉ vì còn được mô tả trong tài liệu lịch sử.
- **Kiểm tra lại:** ảnh tải thật với naturalWidth/naturalHeight hợp lệ, kiểm tra cả PNG thường/shiny và artwork GIF cho loài được hỗ trợ; không xem placeholder là đã đạt.
- **Trạng thái:** đã chuyển sang cấu trúc local hiện tại. Nguồn lịch sử: [R01 collections](R01_COLLECTIONS_OVERLAYS.md); cấu trúc mới: [SPRITE_ASSETS.md](SPRITE_ASSETS.md). Code: `src/data/pokemonData.ts`, `src/components/PokemonArt.tsx`.

### BUG-28 — Hiệu ứng đồng tiền dùng sai tài nguyên/trình bày

- **Biểu hiện lịch sử:** hình đồng tiền và hiệu ứng rơi chưa giống nguồn, có tài nguyên SVG tạm thay cho đồng xu quay.
- **Cách sửa đã ghi nhận:** dùng `coin-spin-frames.png` gồm6 frame32×32 trong spritesheet192×32, chạy animation theo frame; phân biệt icon hộp coin trên TopBar với vật phẩm tiền rơi. Quà rơi/nảy có bóng và số lượng riêng, không bọc thành card giả.
- **Kiểm tra lại:** xem đủ chuỗi rơi→nảy→thu/biến mất, số tiền/vật phẩm được cấp đúng một lần; node chờ đúng completion như BUG-08. Không tự thêm tiền vào wild KO: quy tắc baseline mới ở BUG-23 thay thế ghi chú cũ.
- **Trạng thái:** tài nguyên đã được thay theo [nhật ký](PROJECT_HISTORY.md); vòng đời đã chuẩn hóa ở [R02](R02_RUNTIME.md). Timing/hình ảnh từng particle vẫn cần rà riêng, không coi mục này là nghiệm thu FX100%.

### BUG-29 — Lớp viền của nút phủ lên toàn bộ thẻ inspect

- **Biểu hiện khi tích hợp inspect native:** nền xanh của nút To PC phủ lên GIF, facts và các section, dù kiểm tra kích thước DOM vẫn đạt.
- **Nguyên nhân:** pseudo-element tạo khung pixel dùng `position:absolute; inset:0`; nút thao tác thiếu `position:relative` khi tách khỏi class dialog cũ, nên lớp khung lấy cả thẻ làm containing block. Các selector dùng chung của thẻ cũ cũng làm sai font/khoảng cách inspect mới.
- **Cách sửa:** scope owned inspect bằng `replica-inspect`, giữ capture/Dex preview ở class riêng; nút thao tác có `position:relative; isolation:isolate`, kích thước/flex phù hợp mobile. Giữ CSS native trong file sinh riêng, adapter trong `src/styles/inspect.css`.
- **Kiểm tra lại:** ngoài bounding box, dùng `elementFromPoint` tại tâm artwork để xác nhận không bị lớp nút che; chụp và xem thật desktop/390/320. Kiểm tra thao tác trong Family, đóng thẻ và capture ưu tiên.
- **Trạng thái:** đã sửa trong đợt [Buddy/inspect](BUDDY_INSPECT_REVIEW.md); regression ở `tests/buddy.spec.ts`.

### BUG-30 — GIF bị cắt bên phải khi inspect trên mobile

- **Biểu hiện:** Gyarados vẫn bị cắt dù đã giảm ảnh bằng `scale`; ở viewport390px, box GIF kết thúc tại150,2px nhưng khung hero chỉ tới147px.
- **Nguyên nhân:** grid track mặc định lấy min-content128px của artwork, lớn hơn khung112/90px. `place-items:center` căn giữa trong track lớn đó, nên ảnh vẫn lệch sau khi scale.
- **Cách sửa:** wrapper `.dc-hero .w` đặt `min-width:0; min-height:0; grid-template-columns:minmax(0,1fr)` và scale mobile phù hợp. Không đổi canvas/asset dùng chung hoặc bóp kích thước Pokémon trên sân để chữa lỗi dialog.
- **Kiểm tra lại:** so cả bounding box trái/phải của artwork với hero ở1440/390/320, xem screenshot và kiểm tra ảnh không bị lớp nút che. Regression trong `tests/buddy.spec.ts`.
- **Trạng thái:** đã sửa trong đợt [Buddy/inspect](BUDDY_INSPECT_REVIEW.md).

### BUG-34 — Team/PC báo mọi Pokémon mới thay vì chỉ shiny

- **Biểu hiện:** bắt Pokémon thường cũng tăng badge Team/PC giống Pokédex, trái native.
- **Nguyên nhân xác minh:** clone đếm tất cả UID chưa đọc trong party/PC. Native `Screens.team.newCount` chỉ đếm shiny không có OT, `caughtAt > pcVisit`; Dex đếm loài theo `firstAt > dexVisit`.
- **Cách sửa:** lọc shiny/không OT/có ngày nhận trước khi đếm UID chưa đọc; giữ schema và reviewed-ID để không reset trạng thái save hiện tại. Mở collection vẫn đánh dấu toàn bộ đã đọc theo yêu cầu người dùng.
- **Kiểm tra:** audit native nhận Pokémon thường vào đội/PC, shiny mới ở PC rồi chuyển vào đội, shiny có OT; browser kiểm tra hai badge độc lập, legacy thiếu ngày, bấm mở và reload.
- **Trạng thái:** đã sửa. Nguồn/hash và kết quả ở [báo cáo](NOTIFICATION_INSPECT_PARITY.md).

### BUG-35 — Tab chọn và modal có bóng/lớp phủ khác native

- **Biểu hiện:** sau khi click Team/PC/Pokédex, nền/viền/bóng chữ có frame trung gian; mặt nút giữ màu cũ khi hover. Modal inspect/capture tối/mờ và đổ bóng khác.
- **Nguyên nhân:** `transition:all .15s` từ CSS cũ còn áp dụng trong khi native pixel tabs tắt transition/animation; frame được trích chỉ có trạng thái nghỉ. Backdrop clone dùng blur4px và bóng modal16/40 thay vì3px và20/60.
- **Cách sửa:** tắt transition tab và pseudo-element, generator lấy thêm mặt hover từ bằng chứng native; chuẩn hóa lớp phủ chung, viền3px/radius18px và bóng native.
- **Kiểm tra:** so computed styles khi chọn, hover, hai lớp pseudo của cả hai menu; modal desktop/mobile, focus trap và capture ưu tiên vẫn hoạt động.
- **Trạng thái:** đã sửa. Các modal khác không đi qua backdrop này chưa được coi là đã nghiệm thu.

### BUG-36 — Preview/capture còn font cũ và Stats đơn màu

- **Biểu hiện:** genus, facts, nút Continue khác font/weight; shiny mới hiện hai nhãn New/Shiny. Stats trong Dex khác owned inspect.
- **Nguyên nhân:** adapter preview cũ ghi đè CSS native, dùng Jersey15 cho nội dung/nút, facts14/16 sai weight; Dex còn renderer thanh đơn màu chia180, trong khi owned dùng native base160.
- **Cách sửa:** gỡ adapter cũ, mở rộng generator CSS cho cả preview/owned; Jersey10 nội dung và Jersey15 tên Pokémon, pips và header shiny native, chỉ một pill; chia sẻ `PokemonStatBars`. Sọc trắng là bonus shiny +10%, không thêm vào Dex base stats.
- **Kiểm tra:** so từng thuộc tính font/màu/line-height/padding với native, capture320px không chồng nội dung, Stats thường/shiny, số liệu907HP và sáu đoạn bonus của Gyarados.
- **Trạng thái:** đã sửa trong phạm vi [báo cáo](NOTIFICATION_INSPECT_PARITY.md); chưa chứng nhận toàn bộ inspect hoàn chỉnh.

### BUG-37 — Bóng tab vẫn thành dải đặc sau lần sửa trước

- **Tái hiện:** chọn Team/PC, Pokédex hoặc Progress, so cạnh phải/đáy với native.
- **Nguyên nhân:** bản trích pseudo mask bỏ `mask-composite` và `mask-position`; đúng màu/image vẫn chưa tạo được caro.
- **Sửa:** generator mới lấy đủ mask của before/after và hover, dùng cho cả filter liên quan; CSS sinh import sau layout adapter.
- **Kiểm tra:** so computed đầy đủ các trường mask và xem crop native/local; regression `team-pc-parity.spec.ts`. Chi tiết/hash ở [báo cáo](TEAM_PC_PARITY_REVIEW.md).

### BUG-38 — Thanh EXP PC sai vị trí và không tôn trọng giới hạn cấp

- **Tái hiện:** PC có thanh thụt vào8px/bo tròn; mẫu Lv20 ở đầu Kanto không hiện đầy và vẫn có thể nhận thêm EXP.
- **Nguyên nhân:** adapter cũ khác native; runtime chỉ chặn Lv100, thiếu cap tiến trình. Bảng thưởng candy cũ còn lấy mẫu dưới cap20 nên thưởng cấp cao đều bằng0.
- **Sửa:** track sát mép/đáy5px hoặc3px; cap theo tiến trình cao nhất đã hoàn thành, dùng chung battle/Buddy/family/candy và UI; thưởng dựa levelXp×3 rồi chặn cap riêng. PC thường không nhận battle EXP; giữ hai ngoại lệ native Buddy và cùng họ.
- **Kiểm tra:** `level-cap.test.mjs`, `buddy.test.mjs`, browser thanh EXP/inspect trước và sau Brock. Không hạ cấp Pokémon cũ, không reset save. Native giữ EXP dư tối đa next-1 ở cap tiến trình, Lv100 về0.

### BUG-39 — Đã thêm fixture nhưng người chơi vẫn không thấy Pokémon mẫu

- **Tái hiện:** reload save local bình thường hoặc preview production local không có đủ mẫu.
- **Nguyên nhân:** fixture trước chỉ kích hoạt trên DEV khi tự thêm query; browser test riêng không sửa profile thật của người dùng.
- **Sửa:** marker03 tự áp dụng một lần trên DEV/localhost cho save đã chọn starter, backup trước khi ghi, UID ổn định, nâng bộ8 thành12 không lặp. Không chạy trên host production công khai.
- **Kiểm tra:** core bảo toàn party/save/backup; browser không query, reload và preview production local. Người dùng cần F5 đúng origin; workspace không truy cập được storage profile thật. [Hướng dẫn](RARITY_TEST_SAVE.md).

### BUG-40 — Cuộn PC dài làm mất đội hình thay vì hiện thanh đội nổi

- **Tái hiện:** nhiều Pokémon PC, cuộn xuống dưới vùng sáu slot; clone không có mini team như native.
- **Nguyên nhân:** thiếu renderer/đo vị trí và CSS `.team-mini` của native.
- **Sửa:** ngưỡng cuộn theo team/header, thanh sáu slot fixed, sprite scale native, filter bám dưới; inspect/kéo thả dùng handler hiện có, ẩn/inert khi trở lại đầu và hủy observer khi rời màn.
- **Kiểm tra:** desktop1440/mobile390 so vị trí/kích thước với native, scale sáu sprite, inspect, kéo PC vào mini, ẩn khi về đầu/rời collection. Chưa nghiệm thu mọi frame idle sprite.

### BUG-41 — Pokémon shiny trong PC thiếu dấu nhận diện pixel

- **Biểu hiện:** ô PC có sprite shiny nhưng dòng Lv. thiếu dấu vàng trong ảnh native; Team/mini team dùng ký tự ✦ phụ thuộc font nên khác hình.
- **Nguyên nhân:** renderer PC chưa chèn `UI.shinyIc` tương đương; renderer Team dùng Unicode, CSS icon native chỉ được scope vào inspect.
- **Sửa:** chèn `i.shiny-mk` trước level ở PC, sau tên ở Team/mini; generator lấy nguyên icon SVG16px và alignment/gap native. Sprite shiny/nền tier giữ đúng resolver hiện có, không thêm hiệu ứng suy đoán.
- **Kiểm tra:** native audit thật với thuộc tính shiny, browser desktop/mobile so CSS icon, vị trí DOM, đường dẫn ảnh/tải ảnh và Pokémon thường không có icon; mini mobile ẩn tên đúng native. Chi tiết [báo cáo](TEAM_PC_PARITY_REVIEW.md).

### BUG-42 — Dòng chiêu trong inspect có hai mũi tên

- **Tái hiện:** mở inspect Pokémon, nhìn sau nhãn hệ của chiêu (ví dụ Spark/Electric), hiện `› ›` thay vì một dấu.
- **Nguyên nhân:** JSX chèn một ký tự `›`, CSS native `.dc-move.tap>span:first-child:after` lại sinh thêm `content:" ›"`.
- **Sửa:** xóa ký tự JSX, giữ pseudo native duy nhất; không sửa CSS sinh hoặc thao tác mở drawer.
- **Kiểm tra:** ca inspect có sẵn kiểm tra text/pseudo và mở/đóng Moves; chi tiết và nguồn ở [báo cáo inspect](INSPECT_GIFTS_NATIVE_REVIEW.md).

### BUG-43 — Thẻ tiến trình luôn resume, bấm ở sân không mở Progress

- **Tái hiện:** đang ở sân, bấm summary tên badge; không mở màn chọn tiến trình như native.
- **Nguyên nhân:** handler luôn gọi onResumeAdventure, thiếu nhánh theo activeView.
- **Sửa:** từ màn khác trở lại sân, từ sân mở Progress chọn sẵn chương hiện tại; không selectChapter hoặc tạo lại encounter. Enter/Space chung handler.
- **Kiểm tra:** Progress/Team/PC/Pokédex→sân→Progress, chapter/step/enemy UID/encounter giữ nguyên. [Nguồn và báo cáo](PROGRESS_HEAL_REVIEW.md).

### BUG-44 — Huy hiệu Cascade trong summary bị đơn sắc

- **Tái hiện:** chọn Chương2, summary hiện giọt nước trắng/xám thay vì xanh native.
- **Nguyên nhân:** chapterIcon dùng PNG đơn sắc theo tên badge; native crop tile tương ứng trong frlg-n.png.
- **Sửa:** generator có guard sinh SVG crop chính xác tám huy hiệu Kanto, helper dùng chung; giữ ảnh cũ và trạng thái off/sil của Progress. Boulder native vẫn xám, không tự tô màu.
- **Kiểm tra:** so pixel tám tile với strip nguồn; Cascade chưa nhận vẫn có màu. Manifest/hash và ảnh ở [báo cáo](PROGRESS_HEAL_REVIEW.md).

### BUG-45 — Cả đội gục, heal xuất hiện trên nền tuyến cũ

- **Tái hiện:** party hết HP, HealFX đã mở nhưng background vẫn là route/Gym vừa thua.
- **Nguyên nhân:** runtime đã chuyển nodeType=center nhưng Arena chỉ đọc scene theo currentStep; cursor chỉ về đầu sau heal nên renderer vẫn lấy node cũ.
- **Sửa:** nodeType=center chọn nền Pokémon Center native và tiêu đề khu vực phù hợp; sau heal trở lại scene tuyến. Giữ callback/timer/request heal và checkpoint hiện có.
- **Kiểm tra:** normal heal và defeat heal có Center, đổi speed không restart FX, completion lặp không advance hai lần, hồi HP rồi trở về tuyến. [Nguồn và báo cáo](PROGRESS_HEAL_REVIEW.md).

## 6. Quy trình ghi thêm bug

Khi gặp lỗi mới, thêm mục với **ID, biểu hiện/cách tái hiện, nguyên nhân đã xác minh, cách sửa, ca kiểm tra và trạng thái**. Nếu chưa biết nguyên nhân, ghi rõ chưa xác minh; không biến giả thuyết thành kết luận.

1. Tái hiện trên fixture/profile riêng; ghi viewport, bước chương, speed và loại save nếu liên quan.
2. Sửa nguyên nhân, giữ key/schema save và vòng đời runtime/FX; không reset save để làm lỗi biến mất.
3. Kiểm tra đường gây lỗi và ca liên quan, ghi đúng kết quả lần chạy. Chỉ đổi tài liệu thì kiểm tra link/nội dung, không chạy lại build/browser.
4. Dẫn tới báo cáo chuyên đề khi cần ảnh, số đo hoặc hash nguồn. Ghi rõ giới hạn chưa sửa.
5. Cập nhật [AI_HANDOFF.md](AI_HANDOFF.md) để AI sau tìm được mục mới; không coi nhật ký lịch sử là nguồn hành vi mới nhất khi đã có yêu cầu thay thế.

Đợt tạo sổ ban đầu (BUG-01–28) **chỉ sửa tài liệu**, không thay mã game hoặc dữ liệu người chơi. BUG-29–30 được bổ sung trong đợt Buddy/inspect có sửa code và kiểm tra riêng. Các kết quả trong từng mục thuộc các đợt có dẫn nguồn, không phải một đợt kiểm tra mới của toàn bộ bug.
