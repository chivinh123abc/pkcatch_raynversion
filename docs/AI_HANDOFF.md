# Bàn giao hiện tại cho AI

Cập nhật **16/11/2026**. Đọc sau `AGENTS.md`, rồi chỉ mở tài liệu đúng phần cần làm.

## Trạng thái và việc tiếp

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
