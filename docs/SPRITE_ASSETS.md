# Sprite Gen 5 và màn chiến đấu

Ngày: **15/11/2026**. Tiếp tục phần hình ảnh R03.1 theo yêu cầu người dùng; R04 vẫn chưa hoàn tất.

## Bộ GIF đang dùng

Đã chuyển sang **Showdown gen5ani do người dùng cung cấp**, gồm mặt trước/mặt sau, thường/shiny. GIF Charmander có SHA-256 `1c0c6dfe583825e5c6009b2cc32cbdb39115c905f4812f06553b7fefd8e2e83a`, trùng byte với `assets/pokemon/art/4.gif` đã đối chiếu ở baseline gốc. Không dùng bộ `ani` 3D trước đó.

```text
resources/
  README.md
  pokemon/showdown/
    gen5ani/              # 1.255 GIF nguồn
    gen5ani-shiny/        # 1.252
    gen5ani-back/         # 1.137
    gen5ani-back-shiny/   # 1.135

public/assets/pokemon/
  <id>.png                # Icon box thường, giữ nguồn riêng
  shiny/<id>.png          # Icon box shiny
  showdown/
    gen5ani/              # Các loài đang hỗ trợ: 151 GIF
    gen5ani-shiny/        # 151
    gen5ani-back/         # 151
    gen5ani-back-shiny/   # 151
```

Đã xóa **8 thư mục `ani*` cũ** ở hai gốc source/runtime theo yêu cầu; build mới cũng chỉ chứa thư mục `gen5ani*`. Không xóa dữ liệu tham khảo hoặc icon PNG. Giữ toàn bộ 4.779 GIF Gen 5 nguồn; chỉ phát hành 604 GIF tương ứng 151 loài hiện được hỗ trợ. Có tài nguyên các loài/form khác không đồng nghĩa gameplay đã hỗ trợ chúng.

Chạy `npm run assets:sync` sau khi cập nhật nguồn. Script kiểm tra header/kích thước của đủ 604 file trước khi xuất, giữ nguyên byte và frame, chuẩn hóa đường dẫn bằng slug (`nidoranf`, `nidoranm`, `farfetchd`, `mrmime`), sinh `src/data/showdownSprites.json`. Manifest/hash ở [resource-inventory.json](sprite-evidence/resource-inventory.json). Không cần đổi tên GIF sang số và không cần tải ảnh từ mạng lúc chơi.

## Đúng loại ảnh ở từng vị trí

| Vị trí | Thành phần | Nguồn |
|---|---|---|
| Modal bắt mới, thẻ chi tiết trong Pokédex/Team | `PokemonArt` | GIF Gen 5 mặt trước, đúng thường/shiny |
| Chọn starter | `PokemonArt` | GIF khi chọn, khung đầu khi chưa chọn |
| Lưới Pokédex, Team/PC và các ô nhỏ | `PokemonSprite` / `PanelSprite` | PNG box, đúng cách bản chuẩn phân biệt icon và art |
| Pokémon trên sân | `BattleSprite` | PNG box đã bỏ vùng trong suốt bằng canvas như native `UI.trimSprite`; idle và FX do engine/UI điều khiển |

Không đổi Pokémon trên sân thành GIF mặt sau: bản chuẩn được đối chiếu dùng PNG box ở đây. Resolver luôn dùng chung, không hardcode từng loài trong UI. Alias `getPokemonBattleSpriteUrl` phục vụ biến thể GIF/back; Arena chủ động dùng `BattleSprite`.

Thẻ bắt mới giữ **scale .78** theo yêu cầu trước; chuyển động đến từ frame GIF, bỏ hiệu ứng co giãn giả thêm lên ảnh. Đổi x1/x2/x3 không đổi URL hoặc remount GIF. Pokémon chưa thấy và chế độ reduced motion dùng khung ảnh đóng băng. Nếu không tải được GIF, thẻ có fallback icon local.

## Sửa màn chơi chính

- Sửa cột phải tại viewport 1100–1379px thành 300px theo CSS native; từ 1380px giữ 320px. Sân trước đó bị hẹp 20px ở viewport 1280px.
- Rail chỉ dùng scale1 khi tile nhỏ hơn56px; tile lớn chỉ dùng2× nếu nội dung vừa `tile−8`, không dùng3× cho các loài nhỏ. Cỡ tile tính theo sáu vị trí, căn giữa số hàng thực có. Đã sửa bóng đổ bị căn giữa hai lần. Xem [đợt rà panel/tốc độ/trainer16/11](R03_1_TRAINER_SPEED_REVIEW.md).
- `BattleSprite` crop theo bounds, cache ảnh và bỏ callback tải muộn khi Pokémon thay đổi. Ref của Battle/Capture FX trỏ vào ảnh đã crop, không còn nhắm giữa canvas trong suốt 68×56.
- Căn lại HP, bóng đổ pixel, khung tên trainer, font/letter spacing, số bóng và kích thước trainer theo ảnh gốc. Không sửa công thức combat hoặc save.

Fixture desktop **1280×800** dùng Charmander Lv11 và Geodude Lv14 tại Brock, tắt idle chỉ trong harness để đo hình học. Sân native/clone đều ở (280,108), **658×370.125**. Ảnh Charmander có phần nội dung21×19, vẽ42×38 ở k2; Geodude24×15, vẽ48×30. Vị trí hai ảnh được lưu trong JSON. Bounds của **302 icon thường/shiny** đã được quét alpha và khớp metadata: [box-bounds-check.json](sprite-evidence/box-bounds-check.json).

Bằng chứng: [sân clone](sprite-evidence/local-brock.png), [sân native](sprite-evidence/reference-brock.png), [modal clone](sprite-evidence/local-card.png), [modal native](sprite-evidence/reference-card.png), [số đo clone](sprite-evidence/local-brock.json), [số đo native](sprite-evidence/reference-brock.json).

Ảnh native được dựng từ snapshot có nguồn và fixture thử nghiệm; nhịp log/portrait trainer có thể khác vì không replay cùng combat queue. Không lấy ảnh này làm bằng chứng mọi frame FX hoặc toàn bộ màn giống100%. Mobile vẫn còn khác shell/community/chapter/menu như báo cáo R03.1; không tự đánh dấu hết các sai khác cũ.

## Xác minh

- Core/store/runtime/asset: **55/55**.
- Browser battle, speed/contact/capture, heal/Skip, collection, overlay, save, panel: **33 ca hiện có đạt** trong lượt kiểm tra chung.
- Browser GIF/art mới: **4/4 đạt**, gồm frame thực đổi khi x3, shiny, crop trên sân, mobile320 và reduced motion. Dùng screenshot pixel để kiểm tra GIF đang phát; canvas `drawImage` chỉ cho khung mặc định nên không dùng để đo animation đang chạy.
- Build thành công; cảnh báo chunk JS>500kB vẫn còn. Bản build chứa604 GIF Gen5, không còn `ani*`.
- Không reset save, không đổi saveVersion/key/reset marker. Các Vite/Chrome của công cụ kiểm tra đã được đóng sau chạy.

Tái kiểm tra:

```powershell
npm run assets:sync
node scripts/measure-box-sprites.mjs
npm test
node scratch/visual-parity/run-browser-checks.mjs tests/pokemon-sprites.spec.ts
node scratch/visual-parity/audit-brock-view.mjs
npm run build
```
