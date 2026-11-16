# Đối chiếu inspect và quà cốt truyện

Ngày16/11/2026. Yêu cầu: tái hiện bằng chứng game gốc, bỏ phần tự thêm; không thiết kế luồng hoặc điều kiện mới.

## Sửa mũi tên chiêu bị lặp — 16/11/2026

Người dùng báo dòng Spark/Electric hiện hai dấu sang phải. `InspectPokemonCard.tsx` chèn ký tự `›` trực tiếp trong span, đồng thời CSS native đã có `.dc-move.tap>span:first-child:after { content:" ›" }`. Đã bỏ ký tự JSX, giữ pseudo-element native; không đổi generator/CSS sinh, nội dung chiêu hoặc drawer. Nguồn cùng CSS SHA256 `3e06fa8ed6cfcca3070da71b03fe5758d6b786faba9accdb4b680590f6cc525b`, không cần tải/đối chiếu lại toàn live cho lỗi DOM nhỏ này. Ca inspect có sẵn trong `strict-parity.spec.ts` nay kiểm tra label không chứa mũi tên văn bản và pseudo còn đúng một dấu, rồi mở/đóng Moves như trước. Kết quả cuối ở handoff mới nhất.

**Cập nhật tiếp:** xem [badge/bóng/font/Stats](NOTIFICATION_INSPECT_PARITY.md). Người dùng đã làm rõ Codex dừng, chưa báo game freeze. PC native không giới hạn; không diễn giải ghi chú “giới hạn PC” phía dưới thành một tính năng cần thêm. Các mục runtime inspect chưa nối vẫn giữ trạng thái chưa hoàn chỉnh.

## Nguồn và quy tắc

`npm run reference:check` đã xác nhận build live `b05c8cc201`, trùng cache đang đối chiếu; không tải lại toàn bộ tài nguyên.

- App v0.5.02: `c0081498f217061d529fb18ecc4833e9490c93e0b425fc3d04b713d990fdda11`.
- CSS: `3e06fa8ed6cfcca3070da71b03fe5758d6b786faba9accdb4b680590f6cc525b`.
- [Dữ liệu và các helper native](strict-parity-evidence/native-data.json), [DOM inspect](strict-parity-evidence/native-inspect.html), [ảnh native](strict-parity-evidence/native-inspect.png), [bản dịch từ I18n native](strict-parity-evidence/translations.json).
- `scripts/audit-inspect-gifts.mjs` chạy bundle chuẩn trong Chrome cô lập, chặn mạng ngoài. Lượt đầy đủ xuất1977 hàng Moves của151 loài, bao gồm chiêu trạng thái, chiêu tương lai, kế thừa và mô tả gốc; `--texts-only` chỉ lấy bản dịch. Production dùng JSON và renderer được tách, không chạy app gốc.
- `AGENTS.md` bổ sung quy tắc bắt buộc: chỉ triển khai UI/hành vi/điều kiện có bằng chứng; bỏ tiện ích tự thêm; thiếu dữ liệu lịch sử hiển thị dấu gạch ngang, không bịa nguồn nhận.

## Inspect đã sửa

- Bỏ Move trái/phải, To PC, Add/Swap trong inspect và thao tác bấm vào họ để mở inspect khác. Team/PC vẫn có kéo thả và preset, đã kiểm tra lại quyền sở hữu/HP/UID khi đổi đội.
- Bỏ danh sách chiêu inline tự dựng. Dải move mở drawer riêng với DOM/CSS, thứ tự, nội dung và trạng thái learned từ native; Escape đóng drawer trước, giữ inspect. Drawer không cuộn lại theo mỗi cập nhật store nền.
- Stats dùng chỉ số cơ bản chia160, gradient đa màu, vạch chia40, đoạn cộng shiny có sọc. Hiển thị tên HP/Attack/Defense/Sp. Atk/Sp. Def/Speed và HP hiện tại/tối đa. Không dùng tỷ lệ `value/500` hoặc thanh xanh một màu.
- Family dùng thẻ tĩnh `evo`, nhánh `evo-branches`, icon đá tiến hóa và dấu cộng/marker bóng do CSS native vẽ; tooltip lấy nguyên nội dung native. Không thêm nút điều hướng vào cây.
- History có Caught/Received on, Location, Origin, Original Trainer, Wins; ngày theo tiếng Anh của game. Bắt mới và nhận quà ghi `where/how` thật tại node; save cũ thiếu trường không được suy đoán địa điểm/nguồn.
- Shiny marker và khóa Tastes lấy CSS/icon native. Artwork giữ GIF Gen5ani của người dùng, tách khỏi PNG nhỏ ở Family/Team.

### HP thật và tương thích save

Native v0.5.02 có `HP_BOOST=1.1`. Đã áp dụng vào công thức thực, không sửa riêng chuỗi HP: Gyarados shiny100 có907HP, ATK280/DEF179/SPA137/SPD225/SPE183, tổng chỉ số gốc540.

Chỉ nâng HP cho Pokémon party/PC nhận diện đúng công thức cũ; UID, EXP, metadata và HP hiện tại giữ nguyên, con gục vẫn0. Ví dụ825max/234hiện tại thành907max/234hiện tại, không tự hồi máu. Dữ liệu tùy chỉnh không khớp công thức cũ giữ nguyên. Checkpoint đối thủ đang dở giữ snapshot đã lưu để không thay HP hoặc kết quả giữa trận; encounter tiếp theo dùng công thức mới. Không đổi save key/version/reset marker.

## Gift/fossil đã đối chiếu

Test core so trực tiếp toàn bộ định nghĩa gift/find/trade/static-reward của14 template Kanto với build hiện tại. Các điều kiện dưới đây có từ native, không thêm giá tiền, cấp mở hoặc badge tùy ý.

| Nơi | Điều kiện/quà native |
| --- | --- |
| Oak’s Lab | Starter1/4/7 Lv5; luồng onboarding riêng đang có |
| Pewter Museum | Old Amber, một lần theo receipt `old-amber` |
| Route4 Pokémon Center | Magikarp Lv5, receipt `magikarp`; không tự thêm phí500₽ |
| Mt. Moon | Chọn Dome hoặc Helix Fossil, receipt `fossil` một lần |
| Celadon Mansion | Eevee Lv28, receipt `eevee` |
| Pokémon Tower | Ghost Marowak cần `silph-scope`, một lần; sau trận nhận Cubone Lv30, receipt `cubone-fuji` |
| Fighting Dojo | Chọn Hitmonlee hoặc Hitmonchan Lv42, receipt `dojo` |
| Cinnabar Lab | Chỉ hiện offer có vật phẩm: Dome→Kabuto140, Helix→Omanyte138, Old Amber→Aerodactyl142; Lv30 |

Định nghĩa bước cụ thể và tên node xem JSON nguồn, không dựa số bước UI vì route có sinh ngẫu nhiên.

### Giao diện và thời điểm nhận

- Bỏ bảng “Choose your gift”/lưới starter dùng chung tự dựng.
- Vật phẩm/hóa thạch dùng `ItemFX.choose` native trong Arena: rơi/nảy, chọn một vật phẩm rồi xác nhận, thu vật phẩm và kết thúc FX mới commit. Pace chốt đầu effect; đổi tốc độ không chạy lại hoặc ngắt animation.
- Pokémon quà dùng `LinkFx` native: thả bóng, mở bóng, hiện Pokémon, hộp thoại và chạm tiếp tục; nhiều lựa chọn có chọn rồi xác nhận. Sau nhận, nút thẻ dùng đúng bản dịch `Awesome!` của `Super !`.
- Khi giảm chuyển động, dùng nhánh `hatch-fx.gift` native với gift balls và xác nhận; không thay bằng modal tự thiết kế.
- Gift Pokémon có roll shiny, receipt và metadata đúng; thẻ nhận dùng shiny thực, kể cả shiny mới của loài đã có. Offer hóa thạch kiểm tra lại số lượng khi commit; không trừ vật phẩm lúc vừa chọn hình.
- Adapter giữ timer/RAF/root/listener của từng lượt, hủy khi đổi node/unmount; callback cũ không nhận quà. Keyframe CSS quà có tên riêng để không đè animation chiến đấu.
- `scripts/extract-gift-effects.mjs` trích hai closure visual và CSS có hash guard; không sửa trực tiếp các engine/style sinh tự động. Âm thanh vẫn dùng adapter Sfx hiện có.

## Giới hạn còn phải làm theo native

Đợt này không đồng nghĩa toàn bộ inspect và hệ thống collection đã hoàn chỉnh. **Keep duplicates, tiến hóa/điều kiện vật phẩm và hoạt cảnh tiến hóa, giữ nút candy để dùng liên tục, Tastes và SFX** còn cần nối runtime/đối chiếu riêng; không đặt nút giả hoặc tự bịa hành vi để lấp chỗ trống. Cơ chế chứa bản trùng/nhánh họ và giới hạn PC ở runtime cũ cũng chưa được coi là chuẩn đầy đủ. Chưa nghiệm thu các vùng ngoài Kanto.

Ảnh native offline thiếu artwork ở đường dẫn cũ nên không dùng ảnh đó để tuyên bố đã so từng frame GIF. Bản local dùng Gen5ani đúng nguồn người dùng yêu cầu. Bố cục/font/thanh Stats/History và điều kiện quà có bằng chứng riêng nêu trên; không ghi90–100% toàn game.

## Kiểm tra

- `npm test`: **94/94** core, gồm đối chiếu điều kiện quà14 template, HP/migration và gift shiny/nguồn nhận.
- Browser Buddy/collections/Kanto gifts/strict parity: **29/29**, gồm1440/390/320px, kéo thả/preset, refresh trước/sau chọn hóa thạch, xác nhận hai bước, normal/multi/reduced FX, đổi tốc độ và hủy request cũ.
- Hồi quy sau cô lập keyframes: **23/23**, gồm Arena/capture/heal, cadence×1/×2/×3 và trận Misty thật. Sau rà hình/sửa vị trí nút LinkFx, title/footer native và bỏ dim dư: **10/10** Buddy/strict parity đạt. Các lượt có ca trùng, không cộng tổng như các ca độc lập.
- Build cuối đạt; còn cảnh báo chunk>500kB. Đã xem ảnh cuối; runner/Vite/Chrome do kiểm tra tạo đã dừng.

Ảnh local: [inspect](strict-parity-evidence/local-inspect.png), [hóa thạch](strict-parity-evidence/local-fossil.png), [Pokémon quà](strict-parity-evidence/local-gift-pokemon.png), [chọn Pokémon](strict-parity-evidence/local-gift-choice.png).
