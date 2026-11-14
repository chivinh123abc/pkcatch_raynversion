# Task Checklist: 01 - Autonomous Poke'Catch Local Engine & 3-Column UI

- **Mục tiêu:** Xây dựng độc lập ứng dụng Poke'Catch (React + TypeScript + Tailwind + Zustand) chạy hoàn toàn cục bộ 100%, tái tạo chuẩn xác layout 3 cột theo ảnh chụp ban đầu của người dùng (`media_1794054384671_10f3c732.jpg`).

## Phase 1: Kiến Trúc & Cấu Hình Cục Bộ (`package.json`, `index.html`, `src/index.css`)
- [x] T1.1: Cấu hình Vite + React 18 + TypeScript + Tailwind CSS độc lập, không phụ thuộc vào server bên ngoài.
- [x] T1.2: Định nghĩa hệ màu chuẩn tối `#12141c`, typography pixel art và hiệu ứng lunge/floating damage.

## Phase 2: Dữ Liệu & Engine Độc Lập (`src/types/`, `src/data/`, `src/store/`)
- [x] T2.1: Xây dựng hệ thống kiểu dữ liệu hoàn chỉnh `src/types/game.ts` (Pokemon, Stats, Route, Inventory).
- [x] T2.2: Bảng tương khắc hệ `src/data/typeChart.ts` tính toán multiplier sát thương.
- [x] T2.3: Danh mục Pokémon & công thức tính chỉ số chuẩn Gen 1-3 `src/data/pokemonData.ts`.
- [x] T2.4: Cấu hình Route 1, Gym Pewter và danh sách tỷ lệ xuất hiện wild Pokémon `src/data/routes.ts`.
- [x] T2.5: Store Zustand `src/store/useGameStore.ts` quản lý toàn bộ vòng lặp tự động chiến đấu, tính dame, bắt bóng, lưu LocalStorage.

## Phase 3: Giao Diện 3 Cột Khớp 100% Ảnh Gốc Ban Đầu
- [x] T3.1: `TopBar.tsx`: Thẻ huấn luyện viên `Ray#0910`, `Pokédex 124 / 251`, avatar tag `NEW`, số tiền `270,553 ₽`, `3,017 tokens`, trạng thái `7,486 playing`, nút `🌙`, `Save` và `⚙`.
- [x] T3.2: `LeftSidebar.tsx`: Thẻ Chapter đỏ `Route 1 · Chapter 1 · Boulder Badge`, thanh tiến trình đỏ, menu đầy đủ `Progress`, `Team/PC`, `Pokédex`, `Activities`, `Social`, `Shop`, `Achievements`.
- [x] T3.3: `Arena.tsx`:
  - Thanh tiến trình bước (16 Steps) phía trên cùng.
  - Sân đấu đồng cỏ Route 1, tag thời tiết `☀️ 15:24`.
  - Cột 6 ô Party dọc bên trái hiển thị sprite, cấp độ và thanh máu đỏ.
  - Pokémon đồng đội (Rhydon Lv.91) bên trái quay mặt sang phải chiến đấu với Pidgey/Rattata bên phải.
  - Hiệu ứng lao vào tấn công (`animate-lunge-right`/`left`) và số sát thương bay lên.
  - Hộp thoại màu trắng chữ đen ở đáy và cụm nút tốc độ đỏ `x1 | x2 | x3`.
- [x] T3.4: `RightPanel.tsx`:
  - Bảng `Consumables` góc trên phải: 4 loại bóng Pokéball với số lượng, nút `BAG ▾`.
  - Bảng `Found here` góc dưới phải: Danh sách Pokémon xuất hiện tại Route 1 (`3/3`) kèm mác `NEW` và cấp độ.

## Phase 4: Kiểm Thử & Xác Nhận
- [x] T4.1: Chạy `npm run build` đạt `0 lỗi` TypeScript (`strict: true`) và tạo bundle production sạch sẽ (`175 kB`).

## Phase 5: Tích hợp chuẩn PokéSprite (`msikma/pokesprite`)
- [x] T5.1: Chuyển toàn bộ Box Sprites sang kho [msikma/pokesprite](https://msikma.github.io/pokesprite/) (Gen 8 chuẩn 68x56 pixel).
- [x] T5.2: Chuyển toàn bộ Poké Balls sang PokéSprite (`items/ball/{poke,great,ultra,master}.png`).
- [x] T5.3: Chuyển Medicine / Items sang PokéSprite (`items/medicine/rare-candy.png`, `potion.png`).
- [ ] T5.4: Xây dựng các Modal chi tiết: Team/PC Manager, Pokédex 151, Shop mua bóng & vật phẩm.
