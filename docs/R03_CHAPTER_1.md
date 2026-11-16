# R03 — Vòng Chương 1: starter → Brock

Ngày triển khai: **15/11/2026**. Bản chuẩn: **live v0.4.103 / BUILD `5598c5890a`** đã chốt ở R00. Đợt này xây dựng và kiểm tra vòng chơi Chương 1; không coi đó là nghiệm thu toàn game đạt 90–100%.

## Những gì đã thay đổi

| Phần | Kết quả |
|---|---|
| Save mới | Chọn Bulbasaur/Charmander/Squirtle Lv.5; 3.000₽, 0 token, không có berry/buff/bóng demo |
| Starter | Chỉ chọn một lần, lưu lựa chọn; dialog giữ focus và khóa thao tác nền |
| Stats và EXP | Bỏ IV31 giả lập; dùng stats/HP scale, đường EXP Kanto và EXP thưởng từ bản chuẩn; EXP đội và EXP gia đình được xử lý riêng |
| Move | Chọn từ learnset theo level và hiệu quả dự kiến, dùng power/accuracy override của chuẩn; không chọn ngẫu nhiên move mạnh chưa học |
| Combat | Thứ tự theo Speed, paralysis giảm Speed; crit 1/24, STAB, tương khắc 18 hệ, miễn nhiễm, HP chặn tại 0; KO không phản đòn |
| Status | Sleep có số lượt và thức dậy; freeze/thaw, paralysis, confusion, burn/poison có tác động; Center và Pokémon vừa bắt được xóa trạng thái |
| Capture | Xác suất và bốn lần kiểm tra rung theo bản chuẩn; loại bóng tự chọn theo tier, không trừ bóng thường; bắt trùng được xác nhận từ Pokémon đang sở hữu |
| Capture reward | Bắt mới thêm instance; trùng cộng XP vào đúng gia đình ở party/PC; số popup bằng lượng thực cộng; shiny đang chưa sở hữu được giữ lại |
| Item | Giữ quà random hiện có, thêm Exp Candy S ở Viridian và Old Amber một lần tại museum; item/gift được lưu vào save |
| Center | Chờ HealFX hoặc Skip; Skip/completion chỉ chuyển một node; cả đội thua hồi máu trước khi quay về đầu route |
| Brock | Geodude14/Onix15; áp dụng HP/power gym; thưởng lần đầu 1.260₽ (=1.400×0,9), nhận Boulder Badge, rồi chuyển Chương 2 |
| Save giữa trận | Giữ enemy HP, vị trí trainer, kết quả capture đang trình diễn và danh sách KO đã cấp EXP; node đã nhận thưởng có receipt |

### Những điểm nhật ký cũ khác bản chuẩn

- `WILD_MONEY` của bản chuẩn đang bằng **0**. Không tự thêm +₽85 cho mỗi wild KO theo ghi chú cũ.
- Razz tăng xác suất bắt **×1,25**, Golden Razz **×1,5**; không đổi mọi bóng thành Great/Ultra. Tên trường save `greatBall/ultraBall` được giữ để tương thích.
- Pinap tăng XP chiến đấu **×1,25**. Capture mới không cộng thêm một đợt XP chiến đấu thứ hai; duplicate nhận family XP.
- `CAPTURE_BONUS = 0,6`, `CAPTURE_MAX = 0,6`; kết quả bắt trùng dùng nhánh riêng. Bộ bóng Master cũ vẫn được hỗ trợ khi save thật còn số lượng, là nhánh tương thích của clone.
- Main FX báo hoàn tất điều phối ngay ở impact; particle/đuôi animation có thể tiếp tục. Chờ toàn bộ particle tắt làm clone chậm hơn bản chuẩn.

Các giá trị được đọc từ namespace của bundle gốc chạy trong profile cô lập, không sửa save/tài khoản thật và không nhúng bundle đó vào ứng dụng production. `src/data/chapterOneReference.json` chỉ là dữ liệu adapter: learnset, accuracy/power, bảng EXP, tier bóng và pool quan sát được. Xem [đặc tả trích xuất](r03-evidence/reference-mechanics.json).

## Save và nhận thưởng đúng một lần

Giữ khóa `pokecatch_save_v1`, `version:2/saveVersion:4`. Thêm các trường tương thích: `starterChosen`, `items`, `gifts`, `resolvedNode`, `encounterCheckpoint`.

- KO lưu UID đã cấp XP trước khi chuyển Pokémon của trainer. Reload dựng runtime mới, giữ HP/UID và tiếp tục nhánh KO mà không cấp EXP lần hai.
- Capture lưu outcome trước khi phát FX. Reload dùng lại outcome và không tiêu Master Ball lần nữa.
- Reward/capture hoàn tất ghi `resolvedNode` cùng dữ liệu đã cấp. Reload chuyển sang bước tiếp theo; không bỏ qua quà của node kế tiếp.
- Thắng Brock lưu huy hiệu và tiền cùng receipt. Refresh trong banner chiến thắng vẫn sang chương đã mở, không trả tiền lần hai.
- Save cũ có đội hình được xem là đã chọn starter. Không ép người đang chơi chọn lại hoặc xóa Pokémon. Bộ reset một lần đã được yêu cầu trước đây giữ nguyên revision đang có.

## Timing đo được

Cùng fixture sân 710×400, Chrome headless, cùng sprite, cùng đòn. Mỗi ô là **bản chuẩn / clone**, đơn vị ms đến impact và hoàn tất điều phối:

| Move | x1 | x2 | x3 |
|---|---:|---:|---:|
| Tackle | 344 / 341 | 174 / 173 | 118 / 118 |
| Scratch | 202 / 201 | 104 / 103 | 69 / 69 |
| Fire Spin | 341 / 340 | 175 / 173 | 117 / 118 |

Sai lệch lớn nhất ở lần đo này: **3 ms**. Đây là số đo của **ba đòn mẫu**, không phải tuyên bố mọi move đều có timing đúng. Video và JSON đo raw nằm trong `r03-evidence/`; script tái hiện:

```powershell
node scratch/r03/reference-probe.mjs --timing
node scratch/r03/local-timing.mjs
```

Engine chuẩn resolve tại impact; clone đã bỏ phần chờ particle settle khỏi promise điều phối và giữ particle chạy sau đó. Đổi speed không phát lại request đang chạy. Chỉ hủy khi bỏ encounter/hiệu ứng, không hủy chỉ vì hoàn tất điều phối bình thường.

## Kiểm tra vòng chơi

```powershell
npm test
npm run build
node scratch/visual-parity/run-browser-checks.mjs
```

- Kiểm thử core từ save mới, không tăng stats hay cấp Pokémon trong lúc chạy: Squirtle ở x1/x2/x3, Bulbasaur và Charmander ở x3 đều hoàn tất Chương 1, có Boulder Badge và sang Chương 2. Clock/RNG cố định; FX completion được mô phỏng bằng callback trong các bài core.
- Browser có bài chọn starter/lưu lựa chọn; các kiểm tra R01/R02 vẫn được giữ và cập nhật fixture cho semantics capture mới.
- Video walkthrough dùng **fixture huấn luyện có ghi rõ**: Squirtle, Butterfree, Pikachu Lv.20, sau đó engine tự chiến đấu và bắt theo xác suất. Không ép HP/đòn trúng, không gọi completion tay, không Skip hồi máu. Nhấn Continue khi hiện thẻ bắt mới. Video này kiểm tra pipeline FX ở ba tốc độ, không thay thế bài core từ save mới.
- Các ca bổ sung: party đầy, trùng species đã được tiến hóa, shiny của species đã sở hữu, toàn đội thua, nhiều callback, refresh sau KO trainer, refresh trong capture, refresh trước item và refresh sau Brock.

Kết quả: **48/48 core**, **30/30 browser toàn bộ**, **build thành công**. Sau chỉnh cuối trọng số Nanab và icon bóng đã chạy lại **2/2 ca contact/capture**. Cả ba video đều sang `kanto-2`, tiền cuối 6.197₽ với cùng RNG fixture, không watchdog trong phần history đã ghi. Đây là kết quả kiểm tra chức năng và timing theo phạm vi trên, không phải tỷ lệ giống toàn game.

## Giới hạn còn lại

- Chương 1 giữ route gồm 20 node gameplay; màn chọn starter nằm trước route. Bản chuẩn có thể tính gift starter vào timeline và thay đổi vị trí item/trainer khi build route. Chưa thay toàn bộ bằng generator của chuẩn.
- Pool Chương 1 đã nối selector chung với Found here; các biến thể thời tiết, tiến hóa encounter, level cap, wild/team battle đôi và bảng loot random đầy đủ vẫn cần adapter R04 và đối chiếu thêm.
- Multi-hit đang dùng power tổng kỳ vọng, chưa có chuỗi crit/HP riêng cho từng hit. Thời lượng và FX của mọi status/move chưa có video nghiệm thu toàn bộ.
- EXP gia đình cơ bản đã hoạt động; nhánh tiến hóa, lựa chọn giữ duplicate theo hình thái, UI tiến hóa và quản lý gia đình đầy đủ thuộc R05. Starter picker mới chưa tái hiện toàn bộ đoạn hội thoại/hoạt cảnh Oak của live.
- Item đã được cấp/lưu nhưng Bag/Shop dùng vật phẩm đầy đủ thuộc R06. Các chương sau vẫn còn dữ liệu cũ; mở được Chương 2 không đồng nghĩa nội dung chương đó đã được chuẩn hóa.
- Build còn cảnh báo bundle >500 kB. Vite đã bỏ theo dõi thư mục evidence/test-results/scratch để tránh lỗi Windows EBUSY khi ghi video.

**Bước tiếp theo: R04 — adapter chapter/encounter/reward/unlock và validator dữ liệu**, dựa trên các khác biệt còn ghi rõ ở trên.
