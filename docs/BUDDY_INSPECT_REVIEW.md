# Buddy và thẻ inspect Pokémon

Cập nhật16/11/2026, theo yêu cầu đối chiếu Buddy/thẻ Gyarados shiny. Không triển khai tính năng đánh dấu yêu thích.

**Đã có đợt thay thế:** đọc [INSPECT_GIFTS_NATIVE_REVIEW.md](INSPECT_GIFTS_NATIVE_REVIEW.md) trước. Các mô tả Family bấm để điều hướng, learned moves inline, nút chuyển đội trong inspect và HP825 ở báo cáo này là lịch sử; chúng đã được sửa/bỏ theo yêu cầu chỉ làm đúng native. Build live đã được xác minh lại trong đợt mới.

## Nguồn đối chiếu

- Ảnh người dùng gửi và runtime/CSS native **v0.5.02, BUILD `b05c8cc201`** đã lưu trong cache; trang live hiện tại là app JavaScript nên đọc HTML không xác nhận được build mới hơn.
- App SHA256: `c0081498f217061d529fb18ecc4833e9490c93e0b425fc3d04b713d990fdda11`.
- CSS SHA256: `3e06fa8ed6cfcca3070da71b03fe5758d6b786faba9accdb4b680590f6cc525b`.
- `scripts/capture-buddy-reference.mjs` chạy runtime native trong Chrome riêng, chặn request ngoài/cache, trích mốc Buddy, candy, family/evolution151 loài, DOM, font và hình học. Tái tạo cần cache đúng hash. Không đưa bundle native vào production.
- `scripts/extract-inspect-styles.mjs` sinh CSS scope riêng từ CSS nguồn. Adapter React trong `src/styles/inspect.css`; không sửa trực tiếp CSS sinh tự động.
- [native.json](buddy-evidence/native.json), [số đo](buddy-evidence/native-metrics.json), [khung ở ba viewport](buddy-evidence/native-geometry.json). Native offline không có GIF ở đường dẫn artwork cũ nên ảnh native chỉ làm bằng chứng khung/font; artwork sản phẩm dùng Gen5ani local theo yêu cầu trước, không giả là đã so từng frame GIF native.
- [Probe K.O. native](buddy-evidence/native-ko.json): Rattata Lv5 nằm ngoài đội, gọi K.O. năm lần; bốn lần đầu không thưởng, lần5 nhận144EXP và lênLv6/0EXP; chọn lại cùng UID giữcounter1, đổi UID đưa về0. Dùng `--evidence-only` khi chạy script giữa lượt browser local để không ghi lại production manifest gây HMR.

## Cơ chế đã nối

- Chỉ có một Buddy, tham chiếu bằng **UID**, độc lập Pokémon đang chiến đấu. Có thể chọn/bỏ ngay bằng Love Ball trên thẻ inspect. UID không sở hữu bị từ chối; chọn lại cùng UID không xóa tiến trình; đổi/bỏ Buddy đặt lại K.O.
- Buddy trong đội nhận **×1,3 EXP chiến đấu**, nhân cùng active×1,1, trainer/League và Pinap **trước khi làm tròn**. Không nhân family XP khi bắt trùng hoặc EXP kẹo.
- Mỗi enemy K.O. hợp lệ tăng bộ đếm một lần. Mốc theo **tier của họ gốc**, không theo tier của dạng tiến hóa: `[5,10,20,50,50]`. Dưới Lv20: `max(min(5,n),round(n*level/20))`. Gyarados thuộc họ Magikarp nên mốc5; starter đạt mốc20 khi Lv20 trở lên. Các mẫu1/4/19/129/130/144/150 tại sáu cấp đã đo trực tiếp bằng `Game.buddyGoal()` native.
- Đủ mốc: reset bộ đếm, cộng `levelXp(level)*3` cho riêng Buddy. Buddy trong **PC** vẫn nhận phần thưởng K.O., không nhận EXP chiến đấu của đội. Buddy Lv100 vẫn reset bộ đếm, không tích trữ EXP để nhận sau.
- Tận dụng ledger `ko:<enemyUid>` và checkpoint `awardedEnemyUids`; retry callback/reload không cộng lặp EXP/K.O. Save luôn sau commit.
- Starter của save mới tự thành Buddy. Save cũ thiếu Buddy giữ nguyên Pokémon và không tự chọn hộ; khôi phục UID/counter hợp lệ. Giữ key/version/reset marker hiện tại, không reset save.

## Thẻ inspect

- Owned Pokémon dùng `InspectPokemonCard.tsx`, tách class khỏi thẻ capture/species để CSS cũ không làm lệch giao diện mới. Love Ball, tên/shiny, số Dex và nút X trên header; GIF Gen5ani, nhãn In team/PC, genus, type và biểu tượng rarity native.
- Facts Level/HP/Tastes; move chính theo cùng selector Team, power và danh sách chiêu đã học có thể mở. Thanh EXP, gauge Buddy và năm loại kẹo lấy số lượng thật trong túi.
- EXP Candy Kanto: S600, M9.000, XL150.000, Big600.000; Rare Candy tăng đúng một cấp. Không hardcode750 từ ảnh thuộc bối cảnh vùng khác. Chỉ trừ khi dùng thành công, Lv100/hết kẹo bị khóa, giữ UID/shiny và không hồi sinh Pokémon gục khi lên cấp. EXP nhỏ chưa lên cấp giữ nguyên HP/stats đã lưu; lênLv100 xóa EXP dư.
- Stats mở/đóng: tổng **base stats** (Gyarados540), hàng chi tiết là chỉ số của cá thể hiện tại. Family đếm regular/shiny riêng, có placeholder thiếu, chỉ mở thẻ của cá thể sở hữu; Eevee có ba nhánh đá song song. Đây là duyệt Family, chưa thêm hành động tiến hóa mới.
- History có ngày bắt và số trận thắng ghi nhận được; save cũ thiếu lịch sử hiển thị `—`, không bịa nơi bắt hoặc số trận. Tastes vẫn khóa vì chưa có adapter vùng Unova.
- Badge Love Ball chỉ hiện trên cá thể Buddy thực sự trong Team/PC; gửi/rút/chuyển preset không đổi Buddy. Giữ trap/restore focus, ESC, capture ưu tiên và Arena mounted. Khôi phục focus dùng `preventScroll`.
- Khung native/local đều **460px desktop,348px ở390,278px ở320**. Native font tiêu đề28px desktop; responsive có scroll nội bộ khi nội dung dài. Nút thao tác đội hình được giữ thêm bên dưới, nên chiều cao không so bằng số cố định của fixture native chỉ có một Pokémon.

## Kiểm tra và giới hạn

- `npm test`: **91/91 đạt**, có8 ca Buddy/candy/save/reward mới; test League tắt Buddy trong fixture để chỉ đo hệ số League.
- Build đạt, còn cảnh báo chunkJS>500kB đã có trước.
- Browser lượt cuối **22/22 Buddy/collections đạt**, gồm desktop390/320, bounds artwork, không bị nút che, actions không chồng, chọn/bỏ Buddy, Family Eevee/Magikarp, dùng kẹo, restore save, focus/capture ưu tiên/scroll/menu. Ảnh cuối trong `buddy-evidence/local-inspect-*.png` đã xem trực tiếp.
- **17/17 arena/cadence** đạt sau sửa domain cuối; sau đó chỉ sửa track artwork trong CSS scope inspect và chạy lại22 ca trên. Walkthrough Chương1 qua Brock **×1/×2/×3** và onboarding đạt ở lượt trước bước chỉnh HP nhỏ chưa lên cấp/CSS cuối. Không gọi đây là một lần chạy toàn bộ43 ca cùng đạt trên commit cuối.
- Đã sửa assert rarity cũ: native dùng CSS star cho Legendary, không phải ký tự `●`; test kiểm tra tên và marker thật. Không tắt test để bỏ qua hành vi lỗi.
- Chưa clone Tastes, nút tiến hóa/giữ bản trùng, SFX hoặc thao tác giữ chuột cho ăn kẹo liên tục. History cũ không có dữ liệu nguồn bắt đầy đủ.
- Phát hiện ngoài phạm vi: native v0.5.02 có `HP_BOOST:1.1`, còn công thức battle của clone hiện giữ baseline trước đó. Vì vậy Gyarados shiny Lv100 trong fixture local có825HP thay907; inspect hiển thị **HP thật của runtime**, không sửa số hiển thị để che khác biệt. Đồng bộ hệ số này cần đợt cân bằng/migration HP toàn bộ save/encounter riêng, không âm thầm đổi trong đợt Buddy/UI.
- Chưa tuyên bố toàn game hoặc mọi trạng thái inspect giống100%.

## Điểm vào code cho lần sau

`src/game/domain/buddy.ts` + `buddyReference.json` giữ luật/dữ liệu; `battle.ts` dùng chung cấp EXP, `rewards.ts` commit K.O./bonus; `useGameStore.ts` giữ chọn Buddy, candy và save. UI ở `InspectPokemonCard.tsx`, portal/focus ở `PokemonDetails.tsx`, marker ở `CollectionPage.tsx`. Kiểm tra: `tests/buddy.test.mjs`, `tests/buddy.spec.ts` và regression collection/arena/chapter/cadence.
