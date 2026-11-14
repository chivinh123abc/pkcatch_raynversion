# R01.3–R01.5 — Team/PC, Pokédex, modal và mobile

Ngày cập nhật: **15/11/2026**, múi giờ Asia/Saigon. Bản chuẩn vẫn là [live v0.4.103 / BUILD 5598c5890a](reference-version.md) đã ghi ở R00. Không nâng phiên bản tham khảo trong lượt này.

## R01.3 — Team/PC

- Căn lại panel xanh, header, sáu slot, sprite, type chips, tên, level/move, thanh EXP, nội dung slot trống và thanh lọc theo CSS live.
- Desktop 1440×900: panel tại (280,72), kích thước **1134×308**; slot đầu tại (298,152), cao **210px**. Preset có năm vị trí; PC dùng lưới và toolbar cùng phong cách tham khảo.
- Slot trống đưa focus vào ô tìm PC. Kéo PC vào slot để thêm hoặc đổi với Pokémon đang giữ slot; kéo đội vào PC để gửi; kéo giữa các thành viên để đổi thứ tự. Trên cảm ứng vẫn có các nút Move/To PC/Add/Swap trong thẻ chi tiết.
- PC có tìm kiếm, hệ, shiny, điều kiện tiến hóa theo dữ liệu level hiện có; sort Recent/No./Name/Level/Rarity/Stats/Custom, đảo chiều và phân trang. Custom giữ thứ tự kéo của các Pokémon PC trong save.
- Thẻ Pokémon sở hữu dùng HP/stat hiện tại của đúng UID, không giữ bản sao object cũ trong state của dialog. Các thao tác lỗi được thông báo ngay trong thẻ.
- Pokémon khỏe có idle nhẹ; con hết HP không chạy idle. Dấu active lấy từ `activePartyIndex`.

### Preset và bảo toàn dữ liệu

`partyPresets` chỉ lưu các UID, không sao chép Pokémon. Khi đổi preset, store phân phối lại cùng các object giữa party/PC, giữ HP, EXP, level, stats, shiny và thời điểm bắt. Chặn chuyển khi đang đánh, bắt hoặc heal và khi preset không có thành viên khỏe.

Khác biệt có chủ đích so với live: nhấn **+** lưu bản đội hiện tại vào preset mới. Bản live có thể tạo đội rỗng; runtime clone hiện vẫn cần một Pokémon khỏe nên chưa tạo preset rỗng. Nhãn nút ghi rõ “Save current team as Team …”. Không mô phỏng một preset rỗng rồi tự thêm Pokémon giả.

Các thay đổi đội sau đó thuộc preset đang chọn. Khi lưu/chuyển preset, danh sách UID hiện tại được đồng bộ. Khi đọc save, UID không tồn tại/bị trùng bị lọc; party đã lưu là nguồn chính cho preset đang dùng.

## R01.4 — Pokédex

- Hero đỏ gọn lại theo bốn dòng Kanto/Johto/Hoenn/Sinnoh, vòng tiến độ 128px, danh sách bắt gần nhất và các vùng khóa phía dưới.
- Desktop hero **1134×252**, khớp geometry đo từ DOM/CSS bản chuẩn. Tỷ lệ thấp có một chữ số thập phân; phần trăm và số đã bắt tính từ ID duy nhất.
- Grid, số thứ tự, tên, silhouette và bóng đã bắt được căn lại. Có NEW cho loài đã bắt nhưng chưa mở entry; mở entry lưu `pokedexReviewed`. Counter NEW ở sidebar cũng dùng trạng thái này.
- Lọc theo tên/số/hệ, shiny và trạng thái all/caught/not caught/seen/unknown; thu gọn Kanto; vùng không có dữ liệu vẫn khóa.

Phạm vi dữ liệu **vẫn là 151 loài Kanto**, không đổi bộ species/save thành 493 chỉ để hiển thị cùng số với live. Tổng vòng tiến độ là 151 và số vùng hoàn thành tính trên một vùng có dữ liệu. Đây là khác biệt còn lại với bản chuẩn, cần adapter và nội dung ở R04 trước khi mở Johto/Hoenn/Sinnoh.

NEW không có lịch sử từ save cũ: các loài chưa có trong `pokedexReviewed` ban đầu hiện NEW, và marker được lưu sau khi người chơi xem entry. Số Caught trong card dựa trên số đang sở hữu, tối thiểu một nếu dex đã ghi nhận; không khôi phục được số lần bắt lịch sử nếu save chưa lưu số đó.

## R01.5 — Modal, thông báo và mobile

- Dex Card render qua portal vào game shell. Header/main/navigation phía sau được đặt inert, khóa cuộn nền, giữ focus trong card và trả focus khi đóng.
- Card chi tiết đóng bằng ESC hoặc backdrop; card bắt mới chờ **Continue**, ESC không tự nhận thưởng/đổi node. Capture card ưu tiên hơn card chi tiết nên không có hai dialog chồng nhau.
- Tách khối ảnh, genus/type và facts thành các vùng grid riêng. Đã sửa chồng genus/type/facts ở màn **320×568**; nội dung dài xuống dòng trong card, card cuộn khi cần.
- Giữ sprite capture scale khoảng **.78** và idle theo yêu cầu người dùng. Giữ khoảng cách giữa kết quả bắt và battle log từ lượt trước.
- Toast đổi sang khung trắng theo nguồn, nằm giữa khung game ở phía trên; bỏ double translate theo trục X. Toast không nhận pointer, modal vẫn ở lớp trên.
- Mobile: năm preset co giãn theo chiều ngang, Team ba cột, PC/Dex năm cột nhỏ theo CSS tham khảo; search chiếm hàng riêng, filter xuống hàng khi cần thay vì ép chồng chữ. Navigation dưới vẫn dùng được sau khi đóng card.
- Sửa đường dẫn shiny đang trỏ vào thư mục `public/assets/shiny/` không tồn tại: resolver dùng nguồn PokéSprite shiny hiện có. Ảnh thường vẫn qua resolver cũ; shiny cần mạng, chưa phải bản đóng gói đầy đủ để chạy offline hoàn toàn.

## Lưu dữ liệu

- Giữ khóa `pokecatch_save_v1`, schema `version:2` và `saveVersion:4` hiện tại của dự án; các trường mới là bổ sung tương thích.
- Bổ sung `partyPresets`, `activePartyPreset`, `pokedexReviewed`. Save thiếu các trường này vẫn đọc được.
- Không sửa quy tắc migration đặc biệt version 3/4 đã có trong mã trước lượt này. Không truy cập hoặc ghi vào profile trình duyệt thực của người dùng khi kiểm tra.
- Bản sao source/tests/config trước thay đổi nằm tại `scratch/backups/r013-code-2026-11-14.zip`. Tên archive theo thời điểm bắt đầu công việc, trước khi phiên làm việc chuyển sang ngày 15/11.

## Bằng chứng và kiểm tra

Ảnh và manifest: [r013-r015-evidence](r013-r015-evidence/README.md). Bộ ảnh này độc lập với R00 và R01.1, không ghi đè baseline cũ.

Nguồn so layout là DOM live đã ghi + CSS cùng hash, reflow trong Chrome, tắt animation để đo. Các ảnh `reference-*` ở bộ này là **replay DOM/CSS**, không phải một lượt chơi live mới. Mobile có hành vi JS sắp lại shell nên không dùng ảnh DOM tĩnh để tự công bố pixel-perfect toàn màn mobile.

- `npm test`: **16/16** test store đạt, gồm bảo toàn UID/object/HP khi chuyển preset, preset bị khóa, lưu/load và PC order/NEW.
- Lượt browser đầy đủ: **19/19** đạt; sau các chỉnh CSS nhỏ cuối, chạy lại Collections + Progress: **13/13** đạt. Có drag PC → slot, swap đội đầy, preset, marker NEW, focus/inert/ESC, các vùng card không chồng ở 320px và geometry desktop.
- `npm run build`: thành công; cảnh báo JS chunk trên 500KB vẫn còn, thuộc tối ưu R10.
- `verify-collections.mjs`: kiểm tra source hash, ảnh, geometry Team/Dex, overflow mọi ảnh kiểm tra và toast căn giữa khung. Các lượt audit không ghi pageerror.

```powershell
node scratch/visual-parity/prepare-collections-reference.mjs
node scratch/visual-parity/check-collections.mjs
node scratch/visual-parity/verify-collections.mjs
node scratch/visual-parity/run-browser-checks.mjs
```

Các helper mở Vite/browser tạm rồi đóng đúng process sau khi chạy. `prepare-collections-reference.mjs` sinh CSS scoped `collections-reference.css`; các điều chỉnh React nằm trong `collections.css`.

## Phần còn lại trước khi nghiệm thu toàn game

- Tên move trong slot/card hiện là preview ổn định lấy từ move pool theo hệ. Combat vẫn chọn move theo hệ/đối thủ; chưa có preferred move riêng cho từng UID. Cần đồng bộ cơ chế và trường hiển thị ở R02/R03, không coi preview là đòn vừa đánh.
- Bộ lọc Can evolve chỉ dùng điều kiện level đang có; chưa đủ đá/điều kiện khác. Không thêm nút Evolve All giả khi chưa có hệ thống tiến hóa.
- Chưa có Rank/IV và tiến hóa/family XP đầy đủ, nên không dựng sort Rank hoặc dữ liệu giả cho các mục đó.
- Các vùng ngoài Kanto, Guide/Settings/Shop và hoạt động phụ tiếp tục theo kế hoạch tương ứng. Dữ liệu trainer/encounter/reward nhiều chương chưa được làm lại trong lượt UI này.
- Không công bố toàn game đạt 90–100% từ các ảnh kiểm tra trên. Đây là hoàn thiện R01.3–R01.5 trong phạm vi dữ liệu và runtime hiện có.

Bước tiếp theo là **R02: tách runtime chiến đấu/capture/reward khỏi Arena và store**, có clock/RNG và phase rõ ràng, rồi R03 hoàn thiện vòng chơi Chương 1.
