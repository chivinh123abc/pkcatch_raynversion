# Màn mở đầu và chọn starter

Ngày 16/11/2026. Nguồn UI: **v0.5.02 / BUILD b05c8cc201**, app `c0081498f2`, CSS `3e06fa8ed6`.

App SHA256: `c0081498f217061d529fb18ecc4833e9490c93e0b425fc3d04b713d990fdda11`.
CSS SHA256: `3e06fa8ed6cfcca3070da71b03fe5758d6b786faba9accdb4b680590f6cc525b`.

## Luồng đã triển khai

Mỗi lần mở/reload đều qua **Title**, kể cả save đã có starter:

- Save mới: `Title / New game → Oak → Red/Leaf → tên → lời chào → chọn starter → hiệu ứng xác nhận → runtime`.
- Save có sẵn: `Title / Continue → runtime hiện có`, không chọn lại starter hoặc reset tiến trình.
- Title gọi `loadGame({deferEncounter:true})` để hydrate hồ sơ, chưa khởi tạo encounter/FX/watchdog/thưởng. Continue gọi `loadGame()` khôi phục checkpoint rồi mới chạy `startGameplayLoop` và autosave. Không autosave trạng thái placeholder khi đang ở title. Gift/capture dialog chờ sau Continue. Arena vẫn mounted khi mở collection để giữ geometry/FX.

- Title có logo vào cảnh, menu, Pokémon đi/nhún và hiệu ứng bóng bắt trang trí; có How to play và ghi chú cập nhật Kanto.
- Oak đứng trước nền phòng lab gốc, hội thoại gõ từng chữ theo nhịp 18 ms/ký tự. Click đầu hoàn tất câu, click tiếp mới qua câu. Skip/Escape bỏ phần giới thiệu, vẫn yêu cầu chọn nhân vật và tên.
- Chọn Red/Leaf, tên tối đa 10 ký tự, không nhận tên chỉ gồm khoảng trắng. React hiển thị tên bằng text, không chèn tên vào HTML.
- Cảnh chọn starter dùng bố cục **LinkFx** của bản mới: nền sao tối, ba bệ sáng, bóng rơi, tia sáng và Pokémon hiện ra; chọn một con sẽ bật GIF Gen5ani từ tài nguyên người dùng, làm tối các con còn lại và đổi lời thoại/nút.
- Escape ở cảnh chọn hỗ trợ Pikachu như nhánh ẩn native. Bấm xác nhận chỉ commit một lần sau khi kết thúc hiệu ứng. Tốc độ combat không tác động onboarding.
- Tên/nhân vật được lưu cùng Pokémon; avatar dùng lại ở TopBar, sân và VS. Giữ Red mặc định cho save cũ thiếu trường `trainerSprite`.
- Khóa nền bằng inert, giữ focus trong luồng, dọn timer/scroll-lock khi unmount. Có bố cục mobile và prefers-reduced-motion.

## Tổ chức mã

- `src/components/StarterSelection.tsx`: state machine của presentation; chỉ gọi `chooseStarter` khi hoàn tất.
- `scripts/extract-onboarding-styles.mjs`: trích selector liên quan từ CSS pin; giữ media query/keyframe, scope dưới `.onboarding-root`, đổi URL asset về `/assets/`.
- `src/styles/onboarding-reference.css`: file sinh; không sửa tay.
- `src/styles/onboarding.css`: adapter cho React, sprite, hiệu ứng CSS và responsive. Sprite PNG nhỏ vẫn giữ resolver/crop, ảnh lớn dùng `PokemonArt`.
- `chooseStarter(id, profile?)`: commit party/Dex/hồ sơ rồi load node và save. Gọi lại sau khi đã chọn không đổi starter.

## Bằng chứng và những khác biệt còn lại

Ảnh nằm trong [onboarding-evidence](onboarding-evidence/): `native-landing/new-game/after-skip/name/starter-ready.png`, ảnh clone desktop/mobile. Native được chạy bằng profile thử riêng từ snapshot, không dùng tài khoản/save người dùng. Các ảnh native starter còn thiếu sprite do bộ asset của snapshot thử; không dùng ảnh đó để kết luận kích thước artwork khớp tuyệt đối.

Hiệu ứng được viết lại cho vòng đời React, không import toàn bộ module LinkFx/native app. Bố cục theo CSS nguồn; chưa nghiệm thu hạt sáng/âm thanh/từng frame bằng video. Đợt [UI polish](UI_POLISH_REVIEW.md) thay title Kanto cố định bằng đàn ngẫu nhiên93 loài Sinnoh có cả icon shiny local, với đi/nhảy/dừng/bắt/thay con; live mới trang trí Unova nhưng clone chưa có bộ box icon của vùng đó. Nội dung giới thiệu được điều chỉnh theo các tính năng clone đã có.

Rà luồng mở game16/11: native `TitleFx` (`scratch/onboarding/module.js`, hàm `be/Fe`) luôn mở title, dùng `B()` để đổi New game/Continue và đặt hai nút Sign in with Discord/Google trong `.ti-account`. Đã tái hiện các nút và màu/provider icon trong adapter; CSS `.ti-account` đã thuộc extractor gốc. Web open tới live được thực hiện nhưng trang JS không có text đọc được; đối chiếu bằng snapshot pin/hash nêu trên, không tự nhận xác minh bản mới hơn.

Đăng nhập Google/Discord thật và cloud save cần backend, OAuth client/callback. Bản cục bộ chỉ có panel giải thích giới hạn khi bấm provider và nút Play/Continue locally; không thu thập mật khẩu, không gọi dịch vụ đăng nhập của game gốc hoặc giả lập đăng nhập thành công. Đây vẫn là giới hạn chức năng, không coi đã tích hợp auth. Title có ghi Local edition. Không xóa save để hiển thị màn đầu.

Công cụ `?rarity-test=1` vẫn cấp một lần và chọn sẵn Team/PC, nhưng phải bấm Continue trước khi tương tác PC như các lượt mở game khác.

Test riêng ở `tests/onboarding.spec.ts`: motion title, khóa nền, chọn Leaf/tên/GIF, commit/reload, mobile, tên rỗng, bàn phím, reduced motion và Pikachu. `tests/chapter-one.spec.ts` dùng lại helper đi qua onboarding thật trước walkthrough.

Hai ca onboarding đạt ở lượt cuối; fresh game và walkthrough Chương1×3 cũng đạt sau chỉnh thưởng cuối. Cả ×1/×2/×3 đã chạy đạt ở lượt trước chỉnh loot. Tổng core77/77, build đạt. Không reset save để thử màn mới.

## Kiểm tra sau sửa màn vào game — 16/11/2026

- **80/80 core** đạt sau thêm kiểm tra title hydrate Gym mà không có presentation/timer hoặc sửa raw save; Continue mới khởi tạo đúng Gym.
- **17/17 browser** onboarding/collection/rarity grant đạt ở lượt sửa title đầu; sau bổ sung deferEncounter chạy lại **7/7** fresh game/reload, Kanto seed/scene, gift checkpoint, onboarding desktop/mobile, account panel, combat chờ Continue và grant mẫu. Các lượt có ca trùng, không cộng thành tổng duy nhất.
- Build đạt, còn cảnh báo chunk cũ >500kB; diff check đạt. Runner/Chrome thử đã dừng. Screenshot màn Continue mobile: [local-continue-mobile.png](onboarding-evidence/local-continue-mobile.png); đã xem ảnh và kiểm tra hai nút provider trong viewport390×844.
- Không đăng nhập OAuth thật, chưa đối chiếu toàn bộ từng frame title với video live; vẫn dùng nguồn/hash pin ở đầu báo cáo. Save và marker reset giữ nguyên.
