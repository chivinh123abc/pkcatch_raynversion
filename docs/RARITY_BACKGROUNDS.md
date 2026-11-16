# Nền Pokémon theo độ hiếm — 16/11/2026

Đã kiểm tra lại manifest công khai: **v0.5.02 / BUILD b05c8cc201** vẫn là bản hiện tại lúc kiểm tra. Dùng bundle/CSS đã cache, không tải lại bộ moves/FX hoặc asset.

## Hiển thị đã áp dụng

Theo lời gọi `UI.tierGlow` trong nguồn, lớp màu xuất hiện trong **ô PC và ô Pokédex**. Đây là radial gradient từ góc dưới bên trái, nằm trên nền họa tiết nhưng dưới sprite/chữ; không đổi geometry của ô.

| Tier | Màu | Phạm vi gradient / alpha |
|---|---|---|
| Common | `#9aa4b1` | 34% / 20% |
| Uncommon | `#3b82f6` | 48% / 30% |
| Rare | `#a855f7` | 66% / 38% |
| Legendary | `#f5c518` | 88% / 42% |
| Unique | `#ff5fa2` | 88% / 42% |

Legendary/Unique có nhịp opacity3,2s, xuống0,55 ở giữa vòng. `prefers-reduced-motion` tắt animation. Ô Pokédex unknown ẩn màu; seen chỉ hiện opacity0,5 và đứng yên. Shiny dùng cùng tier của loài.

Unique có trong bảng nguồn nhưng chưa có loài Kanto nào thuộc tier này; không tự nâng Mew thành Unique. Không mở thêm vùng/loài.

Nhãn rarity trong PokémonDetails và sắp xếp Rarity của PC đọc chung bảng151 loài. Không dùng catchRate đơn lẻ để suy ra tier: native còn xét bậc tiến hóa, tổng chỉ số và legendary/mythical. Nền riêng của Team/thẻ chi tiết được giữ theo cấu trúc hiện có; không thêm glow ngoài vị trí đã xác nhận trong nguồn.

## Mã và nguồn

- `src/data/pokemonRarity.json`: tier metadata và native tierIndex cho151 loài, kèm source/hash.
- `src/game/presentation/pokemonRarity.ts`, `src/components/RarityGlow.tsx`: selector và lớp trang trí không bắt pointer/focus.
- `src/styles/rarity-reference.css`: CSS sinh có scope, giữ media query và keyframe.
- `src/styles/rarity.css`: adapter giữ sprite/chữ ở trên lớp màu.
- `scripts/capture-rarity-reference.mjs`: chạy snapshot trong profile riêng, chặn mạng ngoài; xuất `docs/rarity-evidence/native.json` và fixture ảnh native.
- `scripts/extract-rarity-ui.mjs`: kiểm tra hash CSS rồi tạo data/styles production. Không chạy app gốc trong production.

App SHA256: `c0081498f217061d529fb18ecc4833e9490c93e0b425fc3d04b713d990fdda11`.
CSS SHA256: `3e06fa8ed6cfcca3070da71b03fe5758d6b786faba9accdb4b680590f6cc525b`.

Nguồn công khai: `https://pokecatch-online.pages.dev/bundle/app.c0081498f2.js` và `app.3e06fa8ed6.css` cùng thư mục. Snapshot raw vẫn thuộc `scratch/`; native.json giữ dữ liệu/bằng chứng cần review khi đổi máy.

## Kiểm tra

**19/19 browser** collections + pokemon-sprites đạt, build đạt; còn cảnh báo chunk JS lớn từ trước. Sau bổ sung chờ ảnh thật và chụp lại bằng chứng, test rarity chạy lại1/1 đạt. Không chạy lại core vì chỉ đổi presentation/tier display/sort, không sửa cơ chế battle/save.

Test so trực tiếp computed gradient và tên animation với fixture native cho Common/Uncommon/Rare/Legendary; kiểm tra unknown/seen, Rarity sort, nhãn Legendary, reduced motion và sprite tải được. Các ca collection/GIF/preset/drag/focus cũ vẫn đạt.

Ảnh [PC clone](rarity-evidence/local-pc.png) và [fixture native](rarity-evidence/native-colors.png). Fixture native dựng các ô từ helper/CSS thật để đo màu, không được gọi là screenshot toàn màn PC của live. Ảnh mobile là viewport của clone, không phải nghiệm thu lại toàn bộ layout mobile.

Không đổi save key/version/marker hoặc reset tiến trình. Ưu tiên tiếp theo vẫn R05 khi người dùng yêu cầu; không tự triển khai trong đợt này.
