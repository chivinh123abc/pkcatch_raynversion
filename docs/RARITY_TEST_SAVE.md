# Pokémon mẫu để thử màu độ hiếm — 16/11/2026

Theo yêu cầu người dùng, thêm công cụ dev vào `src/game/runtime/rarityTestSave.ts`, App gọi trước `loadGame` chỉ khi Vite DEV và URL có `?rarity-test=1`. Save thuộc localStorage trình duyệt, không có file save người dùng trong workspace; chưa thể ghi trực tiếp vào profile đang chơi. Mở URL đó **trên đúng host/port đang chơi**, sau khi đã chọn starter và lưu, để áp dụng. Ví dụ `http://localhost:3000/?rarity-test=1`; nếu dùng `127.0.0.1` hoặc `/react.html`, giữ nguyên host/path hiện tại rồi thêm query.

Thêm8 Pokémon thường Lv20, HP đầy, EXP0, thông số qua factory hiện có:

| Độ hiếm | Pokémon |
|---|---|
| Common | Rattata19, Pikachu25 |
| Uncommon | Raticate20, Pidgeotto17 |
| Rare | Venusaur3, Dragonite149 |
| Legendary | Articuno144, Mewtwo150 |

Tier lấy từ mapping native đã có trong `pokemonRarity.json`, nguồn/hash ở [RARITY_BACKGROUNDS.md](RARITY_BACKGROUNDS.md). Không tải lại live. Kanto không có tier Unique; không tự thêm tier giả.

Chỉ nối PC và bổ sung caught/seen Dex. Party/HP hiện có, preset, NEW, chapter, checkpoint, inventory và tiền giữ nguyên. Marker riêng `pokecatch_rarity_test_20261116_01`; backup nguyên chuỗi save trước khi thêm ở `pokecatch_backup_before_rarity_test_20261116_01`. UID cố định chống thêm trùng ngay cả nếu marker ghi lỗi. Backup lỗi thì không ghi đè save. URL thành công được xóa query và tự mở Team/PC; mở lại URL không cấp thêm. Không đổi key/schema/version/reset marker. Production không tự chạy công cụ.

Kiểm tra: core2/2 đạt (bảo toàn save, tạo mẫu, không lặp, lỗi backup/unready không ghi đè); browser1/1 đạt (luồng URL/save/PC và gọi lại URL); build đạt, còn cảnh báo chunk cũ >500kB. Runner/Chrome kiểm tra đã dừng. Không khẳng định đã sửa save thật của người dùng trước khi họ mở URL; browser test dùng profile riêng.

Cập nhật luồng title cùng ngày: sau cấp mẫu, màn tiêu đề vẫn hiện Continue; bấm Continue sẽ vào Team/PC đã chọn sẵn. Query không còn cho phép bỏ qua màn đầu. Xem [ONBOARDING_PARITY.md](ONBOARDING_PARITY.md).

Bước tiếp: người dùng mở URL trên origin đang dùng và thử sort/filter/chi tiết PC/Pokédex. R05 chưa triển khai.
