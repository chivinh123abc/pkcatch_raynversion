# Poke'Catch Online - Nhật Ký & Tài Liệu Kỹ Thuật Dự Án (Project Knowledge Base)

### Chiêu/FX live v0.5.02 — 16/11/2026
- Live mới: **v0.5.02 / BUILD b05c8cc201**, app `c0081498f2`, CSS `3e06fa8ed6`; [docs/LIVE_MOVE_UPDATE.md](docs/LIVE_MOVE_UPDATE.md) và `docs/live-update-2026-11-16/` có changelog/hash/delta/FX coverage. Chỉ phần chiêu/FX/learnset đã cập nhật; baseline UI/chapter trước vẫn v0.4.103, không đánh dấu toàn clone là v0.5.02.
- `moves.json`503→661:160 thêm,2 bỏ;116 chiêu mới có power hiệu lực>0. Native runtime bổ sung20 entry sau literal641, phải trích sau khởi tạo. `chapterOneReference.json.moveSource` ghi nguồn mới riêng;151 learnset dùng **learnAll hiệu lực** (bao gồm kế thừa, floor65/85 cho chiêu mạnh và bỏ recharge), không dùng raw learn.
- `battleFxEngine.ts` là standalone renderer từ bundle mới, giữ clock/speed snapshot/EffectTimers/cancel, không nạp app gốc vào production. 4 FX không có marker barDef chốt callback tại kết thúc bình thường đúng một lần. Giữ recovery+325/pace đã sửa, không reset save.
- `scripts/sync-live-moves.mjs` tái tạo dữ liệu/adapter của build đã pin, kiểm tra anchor trước ghi. Snapshot trong `scratch/live-update-2026-11-16/`, backup `scratch/backups/live-moves-20261116.zip`.
- **63/63 core**, nhóm cuối **20/20 browser**; browser phát đủ116 FX mới, impact đúng một lần, không watchdog; cancel rồi tái sử dụng canvas ở pace1/2/2,5 đạt. 6 ca trainer cũng đạt trong lượt kiểm tra trước sửa fallback4 FX. Build thành công; chunkJS>500kB vẫn còn. Chiêu status không được giả làm damage; cơ chế riêng/cinematic/raid/trade/vùng mới còn theo phạm vi riêng.
- Kiểm tra build nhanh: **`npm run reference:check`** chỉ tải boot.js và so với `liveMoveUpdate.json`; build trùng thì không tải bundle/asset. Nếu đổi build, chỉ lấy section cần cập nhật và diff, tránh in/đọc lại toàn bộ JS minify.

### Sửa nhịp đánh quá nhanh ở mọi tốc độ — 16/11/2026
- [docs/BATTLE_CADENCE_REVIEW.md](docs/BATTLE_CADENCE_REVIEW.md) bổ sung cho R03.1: mapping pace1/2/2,5 chưa đủ. Native `Adventure.step()` xử lý **một actor**; sau `Qn` recovery260ms (hoặc710ms có chi tiết), vòng UI còn chờ325ms, tất cả chia pace. Clone cũ chỉ260ms trước phản công và bỏ thời gian đọc thông báo hệ/chí mạng.
- `attackRecoveryDelay` phân biệt thường260, chi tiết710, trượt400, miễn nhiễm500ms. `battle.ts` giữ khóa qua recovery và325ms queue cho cả hai actor; dispatch/mở khóa chung callback để polling không chen đòn. HP vẫn trừ tại impact, KO không phản đòn, timer cũ bị hủy khi đổi node.
- Đo Tackle start→actor tiếp theo ở×1: native946ms, clone cũ610ms, sau940ms; ×2:488/320/490ms; ×3:385/270/391ms. JSON trước/sau trong `docs/battle-cadence-2026-11-16/`, audit native dùng Qn/BattleFX thật từ snapshot, dừng vòng nền và tự chờ325/pace để đo fixture ổn định.
- **60/60 core**, **22/22 browser** sau sửa; build thành công. Không reset save, không đổi damage/EXP/asset hoặc tốc độ chạy bên trong BattleFX.

### R03.1 — Rà panel, tốc độ và trainer — 16/11/2026
- Chi tiết/bằng chứng/giới hạn: [docs/R03_1_TRAINER_SPEED_REVIEW.md](docs/R03_1_TRAINER_SPEED_REVIEW.md). Chuẩn là snapshot live v0.4.103/BUILD5598c5890a; đã chạy `demoIntro` native để kiểm tra nhịp thực, không tự nhận kiểm tra phiên bản live mới hơn.
- `railLayout.ts` tính tile theo ít nhất6 vị trí (28–60px), căn giữa số hàng thực có; `PanelSprite` chỉ cho1×/2×, không3× các loài nhỏ. Bóng sân chỉ căn giữa một lần, bỏ `translate` kép.
- **Nút ×3 native lưu4 nhưng pace=2.5**. Clone giữ UI/save1/2/3, chuyển qua `gameplaySpeed()` trước khi dùng cho FX/nhịp325/pace. Buff vẫn chạy theo giây thực. VS/Gym giữ thời gian chuyển động cố định, chỉ chia khoảng giữ; đổi tốc độ áp dụng ở chặng kế tiếp, không restart chặng hiện tại.
- `trainerPresentation` là request không persist, có key và stage intro/sendout. Combat khóa tới khi bóng/ảnh hiển thị xong; thay Pokémon trainer cũng chờ recall→sendout, không cho đánh vào sprite chưa hiện. Callback cũ/lặp bị bỏ qua, watchdog20s chống kẹt. Restore checkpoint xóa request và mở khóa runtime để không kẹt intro.
- `TrainerPresentation`/`trainerFx` sở hữu timer/WAAPI/layer riêng; giữ Arena mounted khi mở collection. `trainer-reference.css` sinh bằng `scripts/extract-trainer-styles.mjs`, gồm viền pixel base từ CSS Frames được native sinh lúc chạy. Adapter trong `trainer.css`. Alias Bug Catcher đúng là `bugcatcher.png`; màu8 Gym theo snapshot.
- Xác minh: **58/58 core**, **49/49 browser** gồm walkthrough Chương1 ở×1/×2/×3; sau bổ sung viền pixel/màu Gym, chạy lại **19/19 trainer/panel/sprite**. Build thành công, còn cảnh báo chunkJS>500kB. Không đổi key/version/reset marker và không reset save. Các FX phụ cinematic Gym/SFX còn trong phạm vi rà video/R10; R04.2 dữ liệu chapter chưa được coi là hoàn tất.
- Rà cuối: scene dither cũng lấy `gameplaySpeed()` tại lúc bắt đầu; không retime effect đang chạy. **16/16 arena/trainer** chạy lại đạt và build lại thành công.

2: 
3: > **Kiểm tra thực tế 14/11/2026:** Xem [báo cáo độ tương đồng](docs/CLONE_PARITY_AUDIT.md). Các mục “100%” bên dưới là nhật ký lịch sử, chưa phải kết quả nghiệm thu toàn game. Đã bổ sung Team/PC, Pokédex 151 loài, save v2 tương thích khóa cũ và autosave; `npm test` kiểm tra store. Nhiều chapter còn dùng lại dữ liệu Chương 1; EXP gia đình, tiến hóa, Shop và hoạt động phụ chưa hoàn chỉnh. Chưa xác minh độ giống bằng screenshot trình duyệt.
4: 
5: > **Mục tiêu:** Xây dựng bản sao 100% độc lập, chạy cục bộ (Client-Side Only) của webgame **Poké'Catch Online** (`pokecatch-online.netlify.app`), tái hiện chuẩn xác 100% giao diện retro pixel art, cơ chế chiến đấu tự động, bắt Pokémon và quản lý đội hình.
6: 
7: ---
8: 
9: ## 1. Kiến Trúc & Công Nghệ Cốt Lõi (Tech Stack)
10: - **Framework:** React 18 + TypeScript + Vite.
11: - **Styling:** Tailwind CSS v3 + CSS Variables + PostCSS.
12: - **State Management:** Zustand (có middleware `persist` lưu trực tiếp vào trình duyệt qua `localStorage` khóa `pokecatch_save_v1`).
13: - **Font chữ gốc bản quyền:** Nhúng trực tiếp font WOFF2 Base64 trong [`src/fonts.css`](file:///d:/Chivinh/2026_pokecatch/src/fonts.css):
14:   - **`Jersey 15`** (`var(--font-pixel)`): Dùng cho tiêu đề Route, tên nút bấm menu, nhãn thuộc tính, thẻ chữ to.
15:   - **`Jersey 10`** (`var(--font)`): Dùng cho thông số cấp độ, tỉ lệ %, số lượng vật phẩm, số đếm Pokédex.
16: - **Tính độc lập:** Hoàn toàn **KHÔNG** phụ thuộc vào backend, không dùng iframe hay reverse proxy API ngoài. Toàn bộ logic tương khắc hệ (Type chart), chỉ số Base Stats, công thức tính sát thương, EXP, và thuật toán tính tỉ lệ bắt bóng chạy trực tiếp tại client.
17: 
18: ---
19: 
20: ## 2. Quy Chuẩn Sprite & Tài Nguyên Đồ Họa (Asset Specifications)
21: 
22: ### A. Hình ảnh Pokémon (100% Động từ PokéSprite)
23: - **Nguồn chính thức:** [PokéSprite - Index](https://msikma.github.io/pokesprite/)
24: - **Repository URL:** `https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/{regular|shiny}/{slug}.png`
25: - **Kích thước chuẩn:** Box Sprites Gen 8 (kích thước gốc **68x56 pixel**).
26: - **Hàm xử lý:** [`getPokemonSpriteUrl(speciesId, isShiny)`](file:///d:/Chivinh/2026_pokecatch/src/data/pokemonData.ts) trong file `src/data/pokemonData.ts`.
27:   - Tự động chuẩn hóa slug (ví dụ: `Nidoran♀` -> `nidoran-f`, `Farfetch'd` -> `farfetchd`, `Mr. Mime` -> `mr-mime`).
28:   - Áp dụng đồng bộ cho cả **Pokémon trên sàn đấu (Arena)** lẫn **danh sách 6 ô đội hình bên trái sàn đấu**.
29:   - **TUYỆT ĐỐI KHÔNG** hardcode đường dẫn cục bộ tới các file lẻ tẻ cho hình ảnh Pokémon.
30: 
31: ### B. Bộ Icon Giao Diện Cục Bộ (Đã trích xuất từ file gốc `thamkhao/`)
32: Tất cả đã được lưu trữ trong thư mục `public/assets/`:
33: - **Thanh Menu bên trái (`public/assets/sidebar/`):**
34:   - `progress.png` (Town Map)
35:   - `team_pc.png` (Bình ấp / vial Pokémon Center)
36:   - `pok_dex.png` (Máy Pokédex màu đỏ)
37:   - `activities.png` (Cuốn sách mở)
38:   - `day_care.png` (Trứng Yoshi đốm xanh)
39:   - `game_corner.png` (Hộp xèng đỏ tia chớp vàng)
40:   - `raids.png` (Tinh thể pha lê xanh lấp lánh)
41:   - `battle_tower.png` (Thẻ bài Battle Tower)
42:   - `underground.png` (Máy khoan khai khoáng ngầm)
43:   - `social.png` (Trái tim hồng)
44:   - `friends.png` (Friend Ball xanh chấm đỏ)
45:   - `trades.svg` (Bụi sao tím)
46:   - `black_market.svg` (Huy hiệu Team Rocket chữ R)
47:   - `shop.png` (Tòa nhà Poké Mart)
48:   - `achievements.png` (Huy chương ruy băng xanh)
49:   - `padlock_pixel.svg` (Ổ khóa pixel art cho tính năng khóa)
50: - **Thanh Tuyến Đường / Timeline (`public/assets/ui/`):**
51:   - `tallgrass-icon.png` (Bụi cỏ 18x16px)
52:   - `pokecenter.png` (Trạm xá Pokémon Center 22x22px)
53:   - `coin-case.png` (Hộp xu token trên TopBar)
54:   - `razz-berry.png`, `nanab-berry.png`, `pinap-berry.png` (Các loại Berry)
55:   - `floppy.svg` (Icon đĩa mềm nút Save)
56: - **Huy hiệu Gym (`public/assets/badges/`):**
57:   - Cắt đủ 8 huy hiệu Kanto (`boulder-badge.png`, `cascade-badge.png`, `thunder-badge.png`, `rainbow-badge.png`, `soul-badge.png`, `marsh-badge.png`, `volcano-badge.png`, `earth-badge.png`).
58: - **Cảnh nền đấu trường (`public/assets/bg/scenes/`):**
59:   - `01-prairie-ouverte-710x400.webp` (Cảnh đồng cỏ mở Route 1)
60:   - `12-foret-jade-v2-710x400.webp` (Cảnh rừng Jade)
61: - **Nhân vật huấn luyện viên:**
62:   - `public/assets/trainers/red.png` (Avatar Red góc trên cùng bên trái).
63: 
64: ---
65: 
66: ## 3. Cấu Trúc Mã Nguồn (Codebase Structure)
67: ```
68: 2026_pokecatch/
69: ├── public/
70: │   ├── assets/
71: │   │   ├── badges/         # 8 huy hiệu Kanto Gym
72: │   │   ├── bg/scenes/      # Ảnh nền cảnh đấu trường WebP
73: │   │   ├── sidebar/        # 15 icon chuẩn cho thanh LeftSidebar
74: │   │   ├── trainers/       # Sprite avatar Red
75: │   │   └── ui/             # Bụi cỏ, pokecenter, berries, floppy disk
76: │   └── favicon.ico
77: ├── src/
78: │   ├── components/
79: │   │   ├── TopBar.tsx       # Thanh đầu trang: Red avatar, Pokédex count, tiền Kanto, Coins, Save, Weather
80: │   │   ├── LeftSidebar.tsx  # Menu điều hướng pixel art + nhóm Activities, Social mở gập
81: │   │   ├── Arena.tsx        # Đấu trường chính: 18-step timeline, battle loop, HP bar, lunge anim
82: │   │   └── RightPanel.tsx   # Panel phải: Consumables (Berries x29, x2, x1), Found here theo thời tiết
83: │   ├── data/
84: │   │   ├── pokemonData.ts   # 151 loài Pokémon Gen 1, base stats, resolver sprite PokéSprite
85: │   │   ├── routes.ts        # 18-step node data cho Route 1 Kanto (grass, center, ?, red, badge)
86: │   │   └── typeChart.ts     # Bảng tương khắc hệ chuẩn Pokémon (18 types)
87: │   ├── store/
88: │   │   └── useGameStore.ts  # Zustand store quản lý State: party, combat, inventory, routes, money
89: │   ├── types/
90: │   │   └── game.ts          # Type definitions cho Pokémon, Route, Combat, Inventory
91: │   ├── fonts.css            # Base64 nhúng 2 font Jersey 10 & Jersey 15
92: │   ├── index.css            # Tailwind + CSS styles cho pixel-art và animation
93: │   ├── App.tsx              # Bố cục 3 cột trung tâm (LeftSidebar | Arena | RightPanel)
94: │   └── main.tsx
95: ├── AGENTS.md                # Tài liệu kỹ thuật chi tiết dành cho các AI Agent / lập trình viên
96: ├── README.md                # Hướng dẫn khởi chạy & tổng quan người dùng
97: ├── package.json
98: └── vite.config.ts
99: ```
100: 
101: ---
102: 
103: ## 4. Trạng Thái Hiện Tại (Completed Checklist)
104: - [x] Đã cấu hình Vite + React 18 + Tailwind CSS chuẩn, biên dịch `npm run build` không lỗi.
105: - [x] Giao diện 3 cột khớp 100% bố cục từ ảnh gốc (`media_1794054384671_10f3c732.jpg` & `media_1794055667614_dab26b22.jpg`).
106: - [x] Đã dọn dẹp sạch toàn bộ file rác tạm thời trong thư mục `scratch/`.
107: - [x] Thanh LeftSidebar đã nạp đủ 15 icon pixel art gốc và 2 ổ khóa pixel cho Battle Tower và Underground.
108: - [x] Đã sửa triệt để lỗi animation Pokémon bị lật ngược mặt khi tấn công (bỏ double `scaleX(-1)` trong `@keyframes lungeRight`).
109: - [x] Đã loại bỏ hoàn toàn các thông báo/box log thừa trên màn hình chính (bao gồm box "Searching wild encounter..." và floating damage popup). Toàn bộ diễn biến chiến đấu, sát thương và trạng thái được gom tập trung 100% vào thanh thông báo RPG màu trắng ở đáy sàn đấu kèm bộ nút chỉnh tốc độ x1, x2, x3 chuẩn theo ảnh tham khảo.
110: - [x] Thanh tiến trình Route 1 hiển thị chuẩn 18 node với bụi cỏ (`tallgrass-icon.png`), trung tâm y tế (`pokecenter.png`), dấu chấm hỏi `?`, điểm đỏ đấu trainer, và huy hiệu đá Boulder Badge.
111: - [x] Đã tách bạch rõ ràng 2 loại tiền tệ: Tiền bên trái (`386,964 ₽`) là phần thưởng nhận được từ chơi game (đánh quái, hạ trainer, nhặt rương ?), còn xu bên phải (`3,017` hộp xu đỏ) giữ nguyên dành riêng cho hệ thống sự kiện sau này.
112: - [x] Khu vực Pokémon Center hồi máu chuẩn xác 100% trích xuất từ mã nguồn gốc `app.5a63acc466.js.download` (`t.HealFX`) và `app.2a43a96474.css` (`.heal-fx`, `.hm-stage`, `.hm-title`, `.hm-machine`, `.hm-tray`, `.hm-slot`, `.fx-skip`):
113:   - Lớp phủ mờ tối `background: #060810d9` trên nền bối cảnh phòng y tế.
114:   - Tiêu đề trung tâm `.hm-title` đổ bóng đỏ mận `text-shadow: 0 3px 0 #b8325c`.
115:   - 6 bệ hồi phục oval viền hồng sáng `.animate-heal-pad` cùng bóng đổ mặt sàn `blur-[1.5px]`.
116:   - 6 quả cầu Pokéball lơ lửng `.animate-heal-ball` phát ánh hào quang vàng kim `drop-shadow-[0_0_12px_rgba(253,224,71,0.95)]` kèm vòng năng lượng ngọc bích quanh chân cầu.
117:   - Các biểu tượng chữ thập y tế xanh lá (`✚`) bay lên không trung (`.animate-heal-cross`).
118:   - Nút **`SKIP ▸▸`** (`.fx-skip-btn`) chuẩn xác theo bản gốc ở chính giữa đáy sàn đấu cho phép bỏ qua animation hồi máu ngay lập tức.
119: - [x] Nạp đầy đủ dữ liệu 151 loài Pokémon Gen 1 vào `POKEMON_SPECIES_MAP` kèm hàm resolver an toàn `getPokemonSpecies(speciesId)`: Khắc phục triệt để lỗi đứng hình khi gặp Trainer thứ 2 (Ace Trainer Maria tại step 14 có Nidoran♀ #29 và Spearow #21) cũng như các Trainer tiếp theo (Gentleman Walter #52 Meowth).
120: - [x] Bộ đếm Berry hiển thị thời gian đếm ngược thực tế định dạng phút:giây (ví dụ `58:12`, `26:35`), đếm ngược theo từng giây cả ở cạnh phải sàn đấu lẫn ô boost vàng ở RightPanel.
121: - [x] Đã xóa bỏ cơ chế hardcode sprite cục bộ, chuyển sang cơ chế resolver lấy trực tiếp từ **PokéSprite Gen 8 (68x56)** cho toàn bộ Pokémon.
122: - [x] Bộ Icon Đồng Xu Chuẩn Bản Gốc (Trích xuất từ HAR `pokecatch.har`):
123:   - **Hộp Token / Xu trên TopBar:** `assets/ui/coin-case.png` (Hộp đỏ chứa xu vàng và tia sét).
124:   - **Hiệu ứng rơi tiền vàng (Money Drop):** Sử dụng spritesheet quay đồng xu 6 frame gốc `assets/ui/coin-spin-frames.png` (192x32px, mỗi frame 32x32px) chạy animation `@keyframes coinSpin steps(6, end) infinite`, kết hợp vật phẩm tiền tệ `assets/ui/relic-gold.png`. Loại bỏ hoàn toàn file SVG tạm `coin-pile.svg`.
125: - [x] Giao diện Consumables Bên Phải (RightPanel) Chuẩn Bản Gốc:
126:   - Hiển thị đầy đủ 4 ô Berries: Razz Berry (`×29`), Nanab Berry (`×2`), Pinap Berry (`×1`), Golden Razz Berry (`×2`).
127:   - Mỗi ô hiển thị chuẩn hình ảnh Quả Berry (`/assets/ui/...-berry.png`) kèm số lượng. Tuyệt đối không thay thế ô Berry bằng khối chữ đếm ngược số thô ráp.
128:   - Loại bỏ các viên thuốc đếm ngược lơ lửng trên sàn đấu Arena để giao diện chiến đấu sạch sẽ, tập trung vào thanh RPG đối thoại và các nút tốc độ x1, x2, x3.
129: - [x] Sửa Triệt Để Logic Trừ HP Trong Chiến Đấu (Combat Hit Timing):
130:   - Khi Pokémon của người chơi lao vào tấn công (lunge): Ngay khi đòn đánh chạm vào đối thủ (~130ms), HP của kẻ địch (ví dụ Pidgey) **bị trừ ngay lập tức** và thanh máu giảm tức thì, đồng thời cập nhật thanh log sát thương.
131:   - Nếu đòn đánh hạ gục kẻ địch (HP <= 0): Kẻ địch ngã gục (faint) ngay lập tức, **TUYỆT ĐỐI KHÔNG** để kẻ địch phản đòn khi đã hết máu.
132:   - Chỉ khi kẻ địch còn sống (HP > 0): Kẻ địch mới bắt đầu lao vào phản đòn (~320ms sau đó), và HP của người chơi chỉ bị trừ khi đòn phản công của kẻ địch chạm trúng Pokémon của mình.
133: - [x] Cơ chế Rơi Quà / Vật Phẩm (Item Drop System): Hoàn toàn **không dùng khung viền thẻ card**. Vật phẩm (Berry, Poké Ball, Tiền đồng xu quay) rơi tự do từ trên cao xuống nền đường đất với hiệu ứng nảy nhẹ (`.animate-item-drop`), bóng đổ mở rộng dưới mặt đất (`.animate-drop-shadow`) và chữ số lượng bay lên (`.animate-drop-text`).
134: - [x] Đồng bộ tiến trình node dấu `?`: Khi nhận quà tại node `?`, hệ thống chờ hiệu ứng rơi quà hoàn tất, chữ bay lên và vật phẩm biến mất hoàn toàn (`~1.7s` theo tốc độ game) rồi mới chuyển bước sang node kế tiếp (tránh tình trạng chưa nhặt xong quà đã nhảy qua cảnh Pokémon Center). Quà vẫn có tỉ lệ rơi ngẫu nhiên khi hạ Pokémon hoang dã (35%) và huấn luyện viên (50%).
135: - [x] Cơ Chế Bóng Ném Vô Hạn Tại Bãi Cỏ (Grass Nodes):
136:   - Người chơi **luôn luôn có sẵn bóng Poké Ball vô hạn** (`∞`) khi gặp Pokémon hoang dã tại bãi cỏ, không bao giờ rơi vào trạng thái hết bóng (`balls.pokeball <= 0`) làm gián đoạn trải nghiệm chơi.
137: - [x] Cơ Chế Nâng Cấp Bóng Bằng Berry (30 phút, Tích Lũy Tối Đa 8 Tiếng):
138:   - **Razz Berry:** Nhấn vào quả Razz Berry để ăn $\rightarrow$ Tự động nâng cấp toàn bộ bóng ném thành **Great Ball** (tỉ lệ bắt tăng lên x1.8) trong 30 phút (+1,800 giây).
139:   - **Golden Razz Berry:** Nhấn vào quả Golden Razz Berry để ăn $\rightarrow$ Tự động nâng cấp toàn bộ bóng ném thành **Ultra Ball** (tỉ lệ bắt tăng lên x2.5) trong 30 phút (+1,800 giây).
140:   - **Nanab Berry:** Làm dịu Pokémon hoang dã (+20% tỉ lệ bắt) trong 30 phút.
141:   - **Pinap Berry:** Nhân đôi phần thưởng tiền và kinh nghiệm trong 30 phút.
142:   - **Cơ chế cộng dồn (Stacking):** Ăn liên tiếp nhiều quả cùng loại sẽ cộng dồn thêm thời gian (+30 phút/quả), cho phép tích lũy tối đa lên đến **8 giờ** (28,800 giây = 480 phút).
143: - [x] Phần Thưởng Tiền Tại Bãi Cỏ (Grass Nodes):
144:   - Khi hạ Pokémon hoang dã ở bãi cỏ: Không rơi item vật lý rườm rà (không drop ball/berry/chest), chỉ tự động cộng tiền thưởng `₽` và hiển thị chữ thông báo nổi bay lên (`+₽85` bằng `.animate-drop-text`) ngay vị trí đối thủ bị hạ gục.
145: - [x] Sửa Lỗi Giao Diện Pokémon Center Khớp 100% Ảnh Gốc (So Sánh Indigo Plateau & Viridian):
146:   - **Loại bỏ hoàn toàn các thanh rãnh pin đen giả lập:** Xóa bỏ thanh rãnh đen `border-slate-700 bg-[#07090e]` nằm dưới quả cầu.
147:   - **Tái hiện chuẩn xác vòng hào quang ngọc bích (`ve.ring`):** Dưới chân mỗi quả Pokéball có vòng năng lượng hình elip ngọc bích phát sáng (`border-2 border-emerald-400 shadow-[0_0_12px_#34d399,inset_0_0_6px_#34d399]`) quét lần lượt từ trái sang phải khớp 100% bản gốc `media_1794060057267_112fa40c.jpg`.
148:   - **Vị trí nút SKIP chuẩn:** Nút **`SKIP ▸▸`** được ghim chắc chắn ở đáy sàn đấu (`bottom: 14px; left: 50%; transform: translateX(-50%)`), tách biệt hoàn toàn khỏi khu vực bệ hồi máu và nằm ngay ngắn trên nền sàn đấu như bản gốc.
149:   - **6 Bệ hồi phục màu hồng tím sáng:** Đặt đúng vị trí trên mặt bàn quầy tiếp đón Pokémon Center với bóng đổ mịn màng trên mặt gỗ.
150: - [x] Hiệu Ứng Hồi Máu Dần Dần Tại Pokémon Center:
- [x] **Cập nhật 14/11/2026 — Đồng bộ Chiến đấu, EXP, UI Panel & Animation Idle theo Game Gốc:**
  - **Thu & tung Pokémon đồng đội (`src/components/Arena.tsx`):** Pokéball thu (`allyRecalling`) và tung (`allySendingOut`) bay từ rìa trái (`sx = -18`, `sy = aRect.height * 0.65`), ẩn sprite Red trong lúc giao tranh.
  - **Hiệu ứng KO đối thủ (`src/components/Arena.tsx`):** Pokémon của Trainer hiển thị silhouette viền sáng đỏ KO cho tới khi thu về bóng (`enemyRecalling`); Pokémon hoang dã (khi không auto-catch) chạy `animate-faint`.
  - **Phóng to & căn vị trí sprite 2 bên panel (`src/styles/reference-layout.css`, `src/components/RightPanel.tsx`):** Phóng to sprite đội hình bên trái (`scale(1.38)`, dịch lên `-4px` để không bị `Lv.` che) và `Found here` bên phải (`w-12 h-11 scale-[1.28] -translate-y-0.5`, đặt `%` xuống đáy ô).
  - **Hiển thị `+XP` bên phải đội hình & chia EXP toàn đội (`src/store/useGameStore.ts`, `src/components/Arena.tsx`, `src/index.css`):** Công thức `calcBattleExp` (`XP_WINS_PER_LEVEL = 15`, `XP_BASE_REF = 60`, `XP_ACTIVE_BONUS = 1.1`), chia EXP cho toàn bộ đội hình kể cả Pokémon đã gục (đồng đội không ra trận nhận `baseExp × 1.0`, Pokémon ra trận nhận `×1.1`), tag `.xp-pop.rail-xp` hiển thị căn giữa theo chiều dọc và nằm ngoài bên phải từng ô.
  - **Xử lý khi cả đội thất bại (`src/store/useGameStore.ts`):** Hiện thông báo thất bại (`Defeated! Your entire team fainted.`), chuyển vào animation hồi máu của Pokémon Center trước, sau khi hồi máu xong mới quay lại bước 1 từ đầu route.
  - **Animation Idle (`src/styles/reference-layout.css`, `src/components/Arena.tsx`):** Thêm `@keyframes pen-idle` (`scale: 1.05 0.95`, `2.4s ease-in-out infinite`) cho Pokémon còn sống trên sàn đấu và thanh đội hình bên trái (độ trễ so le từng ô, Pokémon gục đứng yên).
  - **Kiểm tra:** `npm test` (`13/13` pass) và `npm run build` (`tsc -b && vite build` 0 lỗi).

### Đợt căn giao diện ngoài và Collection UI — 14/11/2026
- Dùng `CollectionPage.tsx` cho màn Team/PC và Pokédex cạnh sidebar; `CollectionModal.tsx` cũ không còn được App sử dụng.
- `PokemonDetails.tsx` dùng chung cho thẻ chi tiết và thẻ bắt mới; `capture` quyết định Continue, `isNew` chỉ quyết định nhãn NEW. Dialog bắt mới ưu tiên hơn dialog chi tiết.
- CSS gốc được scope trong `reference-ui.css` (tạo bằng `scratch/visual-parity/extract-ui-styles.mjs`); adapter React/mobile trong `replica-ui.css`. Không chèn bundle game gốc vào production.
- Giữ Arena mounted và giữ geometry khi mở collection, tránh ngắt hiệu ứng. App quản lý thẻ bắt mới toàn cục.
- `npm test` 13/13, `npm run test:ui` 9/9, build thành công. Xem `docs/VISUAL_ALIGNMENT.md` và ảnh `scratch/visual-parity/local-*.png`; chưa khẳng định toàn game đạt 90–100%.

### R00 — Baseline live và ma trận công việc — 14/11/2026
- Bản chuẩn mới: live v0.4.103, BUILD `5598c5890a`, app `c0c995f8f9`, CSS `7130b4d937`. Xem `docs/reference-version.md`; snapshot/APK cũ chỉ hỗ trợ, không coi là bằng chứng live.
- `docs/REFERENCE_CHECKLIST.md` có 30 mục UI và 16 nhóm cơ chế/FX; bằng chứng trong `docs/reference/2026-11-14/`. R00 chưa sửa code game.
- Live Progress mở màn Adventure cạnh sidebar, khác modal đang dùng trong clone. Tổng bước route live đã biến đổi giữa các phiên; không hardcode 21 dựa trên một ảnh.
- Runtime clone: 13 chapter, 10 dùng lại legacy `CHAPTER_1_STEPS`, 10 lệch tổng bước với mảng node. Không đánh dấu các chapter này hoàn thành.
- Baseline source/data: `scratch/backups/r00-code-2026-11-14.zip`. Ưu tiên tiếp theo R01.1 là Progress/Adventure, giữ Arena mounted và các sửa FX/EXP của người dùng.

### R01.1 — Progress page và shell — 14/11/2026
- `AdventurePage.tsx` được App render cạnh sidebar; `AdventureModal.tsx` không còn được import. State `isAdventureModalOpen` giữ tên cũ nhưng điều khiển Progress page.
- Progress/chapter card mở page; Continue giữ nguyên node hiện tại; preview không đổi encounter; chapter khác chỉ chuyển khi Start/Replay. Arena giữ mounted và geometry khi ẩn.
- `progress-reference.css` scope CSS của live v0.4.103, sinh bởi `prepare-r01-reference.mjs`; adapter và geometry mới trong `progress.css`, import sau replica-ui. Đừng sửa CSS sinh tự động nếu không cập nhật script/adapter.
- Desktop 1440×900: header1430×60, side264×840 ở(0,60), arena798×448.875 ở(280,108), right320, timeline28. Root giữ gutter scrollbar10px; mobile ẩn gutter.
- `docs/R01_PROGRESS_LAYOUT.md` và `docs/r01-evidence/` ghi ảnh/số đo/checks. Dữ liệu các chapter cũ chưa được làm lại; lock UI chỉ dựa dữ liệu/save hiện có.

### R01.3–R01.5 — Collections và overlay — 15/11/2026
- Live v0.4.103 vẫn là chuẩn. `collections-reference.css` sinh từ `prepare-collections-reference.mjs`; adapter trong `collections.css`, import cuối sau progress styles.
- Preset lưu UID qua `partyPresets/activePartyPreset`; tạo preset mới sao lưu đội hiện tại (không tạo đội rỗng vì runtime cần con khỏe). Chuyển preset không clone object Pokémon hoặc reset HP/EXP. PC Custom dùng thứ tự `pcBox`.
- `pokedexReviewed/reviewPokedexEntry` lưu NEW đã xem. Tổng dex vẫn151, vùng khác khóa; không hardcode493 nếu chưa tích hợp dữ liệu.
- `PokemonDetails` portal trực tiếp vào game shell, inert nền và trap/restore focus. Capture chỉ Continue; ESC không dismiss capture. `dc-facts` là con trực tiếp của `dc-top`, tránh hack display:contents gây chồng ở320px.
- Giữ scale capture .78 + idle. Shiny resolver dùng PokéSprite remote do thư mục shiny local chưa có; ảnh thường vẫn dùng resolver hiện tại.
- `docs/R01_COLLECTIONS_OVERLAYS.md`, `docs/r013-r015-evidence/` có giới hạn, ảnh và số đo. `npm test`16/16, browser toàn bộ19/19; UI rerun13/13 sau chỉnh cuối; build thành công. Bước tiếp R02, chưa sửa dữ liệu các chapter cũ.

### R02 — Runtime chiến đấu/capture/reward — 15/11/2026
- Chi tiết và giới hạn: [docs/R02_RUNTIME.md](docs/R02_RUNTIME.md). Backup trước sửa: `scratch/backups/r02-code-2026-11-15.zip`.
- `createGameStore({ clock, random })` tạo runtime riêng từng store. Default `useGameStore` giữ API cũ. `src/game/domain/` giữ kiểu/công thức; `src/game/systems/` giữ battle, capture, rewards và encounter; store ghép hệ thống và giữ save/collection/inventory.
- `GameplayRuntime` sở hữu encounter ID, operation key, phase, timer, watchdog và reward ledger. Đổi node vô hiệu callback cũ; impact/finish/reward lặp chỉ được áp dụng một lần. `encounter` trong state là snapshot để quan sát; không lưu callback/timer vào save.
- `useArenaEffects` là adapter cho engine native. Battle/Capture/Heal/Item chốt speed đầu hiệu ứng. Đổi tốc độ và mở collection không phát lại FX. `EffectTimers` hủy timer riêng của BattleFX; lớp DOM riêng cô lập callback particle đến muộn. Scene dither giữ thời lượng đã chốt khi bắt đầu.
- `startGameplayLoop` tách nhịp combat khỏi giây thực của buff. Khi tab bị trì hoãn, buff trừ thời gian thực đã qua; không bù hàng loạt đòn combat. Autosave giữ nhịp thực cũ.
- Giữ save `version:2/saveVersion:4`, key `pokecatch_save_v1`, preset/PC/NEW, scale capture .78 + idle và vị trí thông báo bắt. Không đổi dữ liệu chapter/công thức thành luật mới trong đợt refactor.
- Xác minh cuối: **33/33 test store/runtime**, **23/23 test browser**, **build thành công** (cảnh báo chunk >500kB còn như trước). Browser chạy bằng `node scratch/visual-parity/run-browser-checks.mjs`, tự dừng Vite sau chạy. Không còn server do lượt kiểm tra này giữ lại.
- Bước tiếp theo **R03 — vòng Chương 1 từ starter tới Brock**; EXP gia đình/duplicate, status, phần thưởng wild và timing video vẫn cần đối chiếu, không coi R02 là nghiệm thu độ giống toàn game.

### Menu collection: thông báo mới — 15/11/2026
- Đối chiếu bundle chuẩn `app.c0c995f8f9.js`: menu gọi cả `Screens.team.newCount()` và `Screens.pokedex.newCount()`, nhưng ép số của màn đang mở thành 0. Không kết luận game gốc chỉ có badge Team/PC.
- `teamReviewedUids` và `dexNotifiedSpecies` lưu riêng trạng thái đã ghé màn; App gọi `markCollectionVisited` khi mở collection bằng sidebar/mobile. `pokedexReviewed` vẫn dùng cho NEW trên từng thẻ, không dùng để đếm badge menu.
- Save cũ thiếu hai trường mới được khởi tạo từ Pokémon/dex hiện có, tránh tạo thông báo hàng loạt cho dữ liệu lịch sử. Giữ saveVersion4.
- Badge dùng `.sidebar-collection-unread`, position static trong nút, không kế thừa text-shadow của nút đang chọn; ẩn khi màn tương ứng đang mở.

### Reset save theo yêu cầu và thẻ tiếp tục chapter — 15/11/2026
- Thẻ chapter trên sidebar gọi `onResumeAdventure` để đóng Progress/collection và hiện sân hiện tại; không gọi `selectChapter/loadStepNode`, không mở bảng Progress. Nút Progress vẫn mở bản đồ.
- `applyRequestedSaveReset` áp dụng một lần trên mỗi origin bằng marker `pokecatch_reset_20261115_01`: backup save cũ vào `pokecatch_backup_before_reset_20261115_01`, xóa key save hiện tại, reset state đang chạy rồi load encounter mới. Các lần reload sau giữ tiến trình mới. Không đổi saveVersion hoặc file fixture của bản tham khảo.

### R03 — Vòng chơi Chương 1 và timing — 15/11/2026
- [docs/R03_CHAPTER_1.md](docs/R03_CHAPTER_1.md) ghi phạm vi, số đo và giới hạn; bằng chứng trong `docs/r03-evidence/`. Backup trước sửa: `scratch/backups/r03-code-2026-11-15.zip`.
- Save mới chọn một trong1/4/7 Lv.5; 3.000₽, không inventory/buff demo. `starterChosen` giữ lựa chọn; save cũ có party mặc định xem là đã chọn. Không reset thêm save hoặc nâng saveVersion trong R03.
- `chapterOneReference.json` là dữ liệu adapter từ namespace của bundle chuẩn c0c995f8f9 (learnset/EXP/accuracy/power/tier/pool). Production không chạy bundle gốc. Domain mới trong `chapterOne.ts` và `status.ts`; stats/HP theo công thức chuẩn, đủ18 hệ, move theo level/matchup, thứ tự lượt theo Speed.
- Wild money chuẩn=0. Razz/Golden Razz tăng xác suất ×1.25/×1.5; bóng theo tier. Nanab tăng trọng số rare×2 trong selector Chương1, đồng bộ Found here; Pinap XP×1.25. Tên trường buff cũ giữ tương thích.
- XP KO và family XP là hai luồng. Capture mới không cộng lại XP KO. Duplicate dựa sở hữu species/shiny; XP gia đình cấp vào party/PC đúng họ, popup khớp tổng thực cộng. Shiny của species thường đã sở hữu vẫn được giữ.
- `resolvedNode` và `encounterCheckpoint` lưu outcome capture, enemy HP, trainer index và UID đã cấp XP. Save tại commit thưởng; refresh không reroll outcome/tiêu Master lần hai, không thưởng lại KO/Brock, không bỏ qua item của node kế tiếp.
- Exp Candy S/Old Amber có inventory/gift receipt; Amber chỉ một lần. Brock áp HP/power gym, thưởng lần đầu1.260₽, nhận Boulder Badge và sang Chương2. Nội dung Chương2 trở đi vẫn chờ R04.
- BattleFX resolve tại impact như chuẩn; đuôi particle không khóa lượt. Adapter giữ FX sau completion bình thường, chỉ cancel khi bỏ effect/encounter; speed snapshot của R02 giữ nguyên.
- Kết quả: **48/48 core**, **30/30 browser toàn bộ**, **2/2 contact/capture chạy lại sau chỉnh cuối**, build thành công. Ba video native x1/x2/x3 đều tới kanto-2, tiền6.197₽ và không watchdog ở phần history được ghi. Video dùng fixture đội Lv.20; bài core riêng chứng minh đi từ cả3 starter Lv.5.
- Tackle/Scratch/Fire Spin đã đo cùng fixture ở x1/x2/x3: sai lệch impact/completion tối đa3ms ở lần đo. Không suy ra mọi move/FX đã giống hoàn toàn. Route generator, double battle, multi-hit riêng từng hit, tiến hóa và Bag đầy đủ còn trong các đợt sau.
- Vite bỏ watch `docs/test-results/scratch` để tránh Windows EBUSY khi copy video. Playwright ghi video cần FFmpeg; công cụ đã được tải theo phê duyệt trong phiên này.
- Revision reset đang có trong code được giữ nguyên (hiện `_02`); mục `_01` phía trên là nhật ký đợt reset trước.

### R03.1 — Hai panel chiến đấu trước R04 — 15/11/2026
- [docs/R03_1_BATTLE_PANELS.md](docs/R03_1_BATTLE_PANELS.md), ảnh/DOM/số đo trong `docs/r031-evidence/`; backup `scratch/backups/r031-code-2026-11-15.zip`.
- `BattlePartyRail` dùng HP/EXP thật, status/shiny, active/KO, popup XP và resolver sprite căn bounds. Chọn/kéo desktop dùng action hiện có, giữ UID/HP/EXP/active. Không khôi phục pseudo EXP luôn đầy từ `.battle-team-slot` cũ. Idle giữ cho con sống, KO đứng yên.
- `PanelSprite`, `PanelHeading`, `Consumables`, `InventoryDialog` tách UI. Berry chỉ hiện khi quantity>0; Bag xem inventory thật, focus/inert/Escape, capture ưu tiên. Dùng vật phẩm đầy đủ còn ở R05/R06.
- `game/presentation/foundHere.ts` lấy pool Chương 1 cùng nguồn battle; trạng thái ngày/trời quang, nhóm điều kiện bị khóa mờ. Theo native zonePool, loài bị khóa tính phần trăm với trọng số gốc, không nhân Nanab. Chapter sau/Chương7 vẫn legacy, chuyển R04.
- `battle-panels-reference.css` sinh bằng `scratch/visual-parity/extract-panel-styles.mjs` từ CSS baseline7130; adapter cuối trong `battle-panels.css`. Không sửa CSS sinh mà bỏ qua script. Hai CSS import sau collections.
- Desktop1440×900 khớp geometry sân/rail/level/HP/EXP và khung Consumables/Found here; tile Found here lệch dọc~0.8px. Mobile fit390/320, sân vuông; shell community/chapter/menu và gutter vẫn khác native, báo cáo ghi rõ, chưa gọi toàn màn100%.
- **48/48 core, 33/33 browser**, sau CSS cuối **7/7 panel** chạy lại, build đạt (chunk JS>500kB). Script browser/audit tự đóng Vite/Chrome. Không reset save, không đổi version/key/marker `_02`. Tiếp theo R04.

### Sửa Poké Ball trùng và khởi động R04.1 — 15/11/2026
- Tile caught Found here chỉ dùng `::after` 16px từ CSS chuẩn. Đã bỏ ảnh `.zone-owned` vẽ thêm gây hai quả bóng chồng nhau; accessible label vẫn ghi caught. Browser panel7/7, ảnh R03.1 cập nhật.
- [docs/R04_CHAPTER_DATA.md](docs/R04_CHAPTER_DATA.md): R04 đang triển khai, mới xong catalog/validator/audit. `kantoChapterReference.json` có14 template chính (8 gym + Victory Road +5 League) từ snapshot chuẩn, có provenance/hash; sinh bằng `scripts/extract-kanto-reference.mjs`.
- `game/data/chapterCatalog.ts` kiểm tra template và audit runtime riêng; không fallback template unknown về Chương1. `npm run audit:chapters` xuất `docs/r04-evidence/data-audit.json`; `-- --strict` hiện thất bại vì32 điểm dữ liệu legacy (10 count,8 boss,9 reuse,5 thiếu League). Không gọi R04 hoàn tất hoặc catalog đã nối gameplay.
- Core52/52, sau audit cuối data4/4 chạy lại; build đạt, cảnh báo chunk cũ còn. R04.2 tiếp theo: generator/adapter, cùng selector và node gift/static/unlock/trade. Không đổi save. Backup `scratch/backups/r04-start-code-2026-11-15.zip`.

### Gen5ani local, cấu trúc tài nguyên và sprite sân — 15/11/2026
- Người dùng yêu cầu chuyển sang gen5ani và xóa ani cũ. Đã chuyển4 thư mục nguồn vào `resources/pokemon/showdown/gen5ani*`, giữ4.779 GIF nguồn. `npm run assets:sync` xuất604 GIF (151 loài ×4 thường/shiny/front/back) vào `public/assets/pokemon/showdown/gen5ani*`, sinh `showdownSprites.json` và manifest/hash. Đã xóa8 thư mục ani cũ ở source/runtime; không dùng lại chúng hoặc tải ảnh ngoài khi có local.
- [docs/SPRITE_ASSETS.md](docs/SPRITE_ASSETS.md) ghi cấu trúc, loại ảnh và bằng chứng. `PokemonArt` dùng GIF cho modal/thẻ Pokédex/Team, giữ capture .78; starter chỉ animate khi chọn. Unknown/reduced motion đóng băng khung đầu. `PokemonSprite` tách khỏi Details, dùng PNG cho ô/lưới nhỏ. Grid Pokédex của baseline là PNG, không đổi mọi icon sang GIF.
- `BattleSprite` + `game/presentation/battleSprite.ts` crop PNG theo bounds như native UI.trimSprite và cache data URL. Arena/capture FX vẫn dùng PNG+idle; ref ảnh trỏ vào vùng đã crop. Alias resolver GIF có chữ Battle không có nghĩa Arena phải dùng GIF mặt sau.
- Rail tile<56 dùngscale1, tile lớn fit(tile−8); cỡ tile theo6 vị trí. Desktop1100–1379 có aside300px; >=1380 vẫn320. Adapter cuối ở `pokemon-sprites.css` căn HUD/HP/trainer/shadow. Quét alpha302 icon khớp spriteBounds hiện có.
- Core/asset55/55; browser33 ca cũ đạt và4/4 GIF/art đạt; build đạt, cảnh báo chunk cũ còn. GIFanimation kiểm tra bằng screenshot pixel (canvas drawImage cho khung mặc định). Không reset save. R04.2 và sai khác shell mobile vẫn còn theo kế hoạch.
