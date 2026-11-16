# Pokémon mẫu để thử màu độ hiếm — 16/11/2026

## Bộ04: thêm24 Pokémon shiny theo yêu cầu

Bộ hiện tại giữ12 mẫu thường và bổ sung **24 shiny Lv20, HP đầy, EXP0** qua factory có sẵn: Bulbasaur, Charmander, Squirtle, Caterpie, Pidgey, Rattata, Pikachu, Raichu, Jigglypuff, Meowth, Psyduck, Growlithe, Alakazam, Gengar, Scyther, Gyarados, Eevee, Snorlax, Dragonite, Articuno, Zapdos, Moltres, Mewtwo, Mew. Dùng stats shiny/GIF/resolver hiện có; đây là fixture được người dùng yêu cầu, không sửa tỷ lệ shiny trong gameplay và không cần kiểm tra lại live.

**F5 đúng bản local đang chơi → Continue → Team/PC.** Giữ điều kiện DEV/localhost và save đã chọn starter của bộ03. Marker hiện tại `pokecatch_rarity_test_20261116_04`, backup nguyên chuỗi trước cấp `pokecatch_backup_before_rarity_test_20261116_04`; marker03 không cản nâng bộ. UID mẫu thường vẫn01; shiny dùng prefix riêng `pokecatch_shiny_test_20261116_04`, không chuyển Pokémon thường thành shiny. Giữ mọi marker/backup cũ và party/preset/checkpoint; mẫu đã chuyển vào đội vẫn chống trùng bằng UID. Save đã có12 thường chỉ thêm24 shiny; save chưa có mẫu nhận tổng36. Lần reload sau không cấp thêm. Workspace không trực tiếp sửa profile trình duyệt thật.

Kiểm tra core fixture **4/4 đạt**, có nâng bộ03→04 chỉ thêm shiny và giữ backup/marker cũ. Browser **1/1 đạt**, xác nhận24 shiny/fullHP/Lv20 trong save, hiển thị PC, backup/party/checkpoint và reload không trùng. Build đạt (cảnh báo chunk cũ); production preview local cũng đạt36 mẫu/24 shiny, xem [bằng chứng](team-pc-evidence/preview-grant.json). Runner/Vite/Chrome thử đã dừng. Phần dưới là mô tả bộ03 trước khi bổ sung shiny, giữ để tra lịch sử.

## Bộ03 trước đó

Theo yêu cầu người dùng, `src/game/runtime/rarityTestSave.ts` cấp **3 con cho mỗi độ hiếm hiện có trong Kanto**. Đợt03 sửa việc bộ mẫu chưa xuất hiện: app tự gọi trước `loadGame` khi save đã chọn starter, chưa có marker03 và đang chạy Vite DEV hoặc localhost/127.0.0.1/::1 (cả build preview local). **F5 đúng host/port/path đang chơi rồi bấm Continue**, không cần query. `?rarity-test=1` vẫn dùng được trong môi trường này. Save thuộc localStorage trình duyệt; không thể ghi trực tiếp vào profile thật từ workspace. Trang production trên host công khai không tự cấp fixture.

Thêm12 Pokémon thường Lv20, HP đầy, EXP0, thông số qua factory hiện có:

| Độ hiếm | Pokémon |
|---|---|
| Common | Rattata19, Pikachu25, Pidgey16 |
| Uncommon | Raticate20, Pidgeotto17, Raichu26 |
| Rare | Venusaur3, Dragonite149, Gyarados130 |
| Legendary | Articuno144, Mewtwo150, Mew151 |

Tier lấy từ mapping native đã có trong `pokemonRarity.json`, nguồn/hash ở [RARITY_BACKGROUNDS.md](RARITY_BACKGROUNDS.md). Không tải lại live. Kanto không có tier Unique; không tự thêm tier giả.

Chỉ nối PC và bổ sung caught/seen Dex. Party/HP hiện có, preset, reviewed-ID, chapter, checkpoint, inventory và tiền giữ nguyên; loài vừa bổ sung có thể làm tăng badge Dex theo native. Marker bộ mới `pokecatch_rarity_test_20261116_03`; backup nguyên chuỗi save trước khi thêm ở `pokecatch_backup_before_rarity_test_20261116_03`. Giữ UID mẫu bộ01: nếu đã nhận8 con cũ, chỉ bổ sung4 con còn thiếu, kể cả mẫu cũ đã chuyển vào đội; không đè cấp/HP của mẫu đang có. Marker/backup01/02 giữ nguyên. UID cố định chống thêm trùng ngay cả nếu marker ghi lỗi. Backup lỗi thì không ghi đè save. Thành công chọn sẵn Team/PC; query nếu có được xóa, mở lại không cấp thêm. Không đổi key/schema/version/reset marker.

Kiểm tra bộ12: core **3/3 đạt**, gồm phân bổ tier lấy từ `pokemonRarity.json`, bảo toàn/nâng bộ8 cũ, mẫu đã chuyển vào đội, chống lặp và lỗi backup/unready. Browser **1/1 đạt** với query/Continue/PC/backup/gọi lại không cấp trùng; dùng `domcontentloaded` để không chờ mọi asset ngoài trong navigation. Build cuối đạt, còn cảnh báo chunk>500kB có từ trước. Runner/Vite/Chrome thử đã dừng. Không khẳng định đã sửa save thật của người dùng trước khi họ mở URL; browser test dùng profile riêng.

Cập nhật luồng title cùng ngày: sau cấp mẫu, màn tiêu đề vẫn hiện Continue; bấm Continue sẽ vào Team/PC đã chọn sẵn. Query không còn cho phép bỏ qua màn đầu. Xem [ONBOARDING_PARITY.md](ONBOARDING_PARITY.md).

Bản03 còn được kiểm tra bằng `scripts/check-local-grant-preview.mjs`: build production chạy trên preview localhost3011, seed save trong profile riêng, mở không query tự thêm12, backup đúng nguyên chuỗi, reload không trùng. Bằng chứng [preview-grant.json](team-pc-evidence/preview-grant.json). Đây không phải profile thật của người dùng. Mẫu Lv20 hiện đầy thanh EXP nếu tiến trình còn cap20; hoàn thành Brock mở cap24, không tự tăng cấp mẫu.

Bước tiếp: F5 đúng origin đang dùng rồi thử sort/filter/chi tiết PC/Pokédex. R05 chưa triển khai.
