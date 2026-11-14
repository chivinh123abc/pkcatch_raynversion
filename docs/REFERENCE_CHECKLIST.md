# R00 — Ma trận đối chiếu game gốc và clone

Ngày: **14/11/2026**. Chuẩn: [v0.4.103 / BUILD 5598c5890a](reference-version.md). Kế hoạch: [R00–R11](KE_HOACH_LAM_LAI_TOAN_BO_GAME.md).

**Sau R01.1:** Progress không còn dùng modal; shell/sân đã căn theo số đo. Các bảng dưới giữ nguyên kết quả baseline R00 để theo dõi trước/sau. Trạng thái mới và ảnh nằm trong [báo cáo R01.1](R01_PROGRESS_LAYOUT.md).

**Sau R01.3–R01.5, 15/11/2026:** Team/PC, Pokédex và card đã căn lại; preset/PC order/NEW có lưu; modal dùng portal + inert/focus; card 320px không chồng thông tin. Xem [báo cáo mới](R01_COLLECTIONS_OVERLAYS.md). Các số đo/phạm vi cũ phía dưới vẫn là baseline R00, không phải trạng thái mới nhất.

## Cách đọc

- **Đã có:** có code hoặc thao tác tương ứng, chưa mặc nhiên giống bản chuẩn.
- **Còn lệch:** đã quan sát được khác biệt về nội dung, vị trí hoặc hành vi.
- **Còn thiếu:** chưa có màn hoặc nghiệp vụ tương ứng trong clone.
- **Chưa xác minh:** chưa quan sát đủ tình huống, không kết luận đúng/sai theo suy đoán.
- **Theo yêu cầu:** khác biệt có chủ đích của người dùng, cần giữ.

`live-*.png/json` và `clone-*.png` dưới [reference/2026-11-14](reference/2026-11-14/) là bằng chứng R00. JSON có text, nút và geometry ở thời điểm chụp. Các ảnh dùng fixture khác schema và không đồng bộ RNG/giờ; chưa phải cặp ảnh để chấm screenshot diff. Xem điều kiện trong [reference-version.md](reference-version.md).

## Màn hình, thao tác và khoảng thiếu

| ID | Màn / trigger và input | Quan sát bản live | Clone / kết luận hiện tại | Bằng chứng | Ưu tiên |
|---|---|---|---|---|---|
| UI01 | Mở website, không save | Title New game, hướng dẫn, changelog, đăng nhập | **Còn thiếu:** App đi thẳng vào route với dữ liệu mẫu | `live-initial.png`; `src/App.tsx`, store defaults | R01/R03 |
| UI02 | New game → Red → tên Audit | Oak, chọn avatar, nhập tên và hội thoại | **Còn thiếu:** chưa có onboarding tương ứng | `live-onboarding.png`, trace | R03 |
| UI03 | Chọn starter, chưa có Pokémon | Bulbasaur/Charmander/Squirtle, chọn rồi xác nhận | **Còn thiếu:** cấp sẵn Charmander, không có màn chọn | `live-starter.png`; store defaults | R03 |
| UI04 | Nhận Charmander Lv.5 | Dex Card NEW, thông tin loài, nút Awesome | **Đã có / còn lệch:** thẻ shared đã có; phân biệt quà starter với bắt wild, kiểm tra rarity và số caught | `live-starter-card.png`, `clone-new-catch.png` | R01/R03 |
| UI05 | Header + sidebar, sau starter | Save, Options, chapter, Guide/Discord; nút active rõ | **Còn lệch:** số playing cố định, NEW luôn hiện, thiếu Guide; geometry/spacing cần đo lại | `live-team.png`, `clone-team.png`; TopBar/LeftSidebar | R01/R06 |
| UI06 | Progress | Màn Adventure cạnh sidebar, dải vùng, danh sách khu/gym, ảnh info và Continue | **Còn lệch lớn:** Progress quay về sân; chapter mở Adventure modal, Regions hiển thị mẫu | `live-map.png`, `clone-map.png` | R01 đầu tiên |
| UI07 | Chọn chapter đang chơi / bị khóa | Có luật khóa theo huy hiệu, dex hoặc hoàn thành vùng | **Còn thiếu:** phải kiểm chứng và bổ sung gate/progress riêng, không chỉ chọn chapter | `live-map.json`; AdventureModal, chaptersData | R04 |
| UI08 | Sân, timeline, log và speed | Có rail, thời gian, nền theo địa điểm và log đáy | **Đã có / còn lệch:** cùng kiểu bố cục nhưng cột phải/sân khác bề rộng; ảnh live ngay sau starter còn chuyển cảnh | `live-adventure.png`, `clone-adventure.png` | R01 |
| UI09 | Found here / đổi khu | Số đếm theo khu; ẩn thông tin Pokémon chưa biết; có nhóm ngày/mưa | **Còn lệch:** pool/số đếm/nội dung nhóm khác, một số vùng còn data riêng hardcode | `live-map.json`, `clone-audit.json`; RightPanel | R01/R04 |
| UI10 | Consumables, inventory trống/có món | Panel có trạng thái theo món thực có | **Đã có / còn lệch:** clone luôn dựng bốn ô berry; BAG không mở màn | Consumables.tsx; ảnh adventure | R01/R06 |
| UI11 | Team/PC, một Charmander, PC trống | Sáu slot, move cạnh level, preset, nội dung hướng dẫn slot trống | **Đã có / còn lệch:** main screen đúng hướng; khác slot, tên move, preset và empty state | `live-team.png/json`, `clone-team.png` | R01/R05 |
| UI12 | PC tìm/lọc/sort, nhiều Pokémon | Có Shinies/Types/Can evolve và sort nhiều tiêu chí | **Đã có một phần:** clone có tìm/lọc/sort/pagination; chưa so đủ tiêu chí Rank/Rarity/Stats/Custom | `live-team.json`; CollectionPage; collection tests lịch sử | R05 |
| UI13 | PC đầy, swap, đổi thứ tự | **Chưa xác minh trên live trong R00** | **Đã có ở clone:** deposit/withdraw/swap, chặn con khỏe cuối và animation; cần so luật gốc | Store + tests/game-store.test.mjs | R05 |
| UI14 | Team details / nâng cấp / tiến hóa | **Chưa ghi đủ mọi tab live** | **Đã có stats/actions; còn thiếu nghiệp vụ:** family XP/evolution cần đối chiếu | CollectionPage/PokemonDetails; dữ liệu evolution có sẵn | R05 |
| UI15 | Pokédex sau starter | Tổng 493 ở bốn vùng được hỗ trợ; Kanto 151; đánh dấu NEW, nhóm vùng khóa | **Còn lệch:** clone tính tổng 151, thanh 9 vùng, chưa đồng bộ phạm vi/tổng đếm live | `live-pokedex.png/json`, `clone-pokedex.png` | R01/R04/R05 |
| UI16 | Dex tìm/lọc/status/chi tiết unknown | Có status, types, regions, shiny; loài chưa gặp ẩn thông tin | **Đã có một phần:** Kanto filter/known/unknown đã làm; cần so toàn bộ trạng thái và dismiss | CollectionPage/PokemonDetails; live-pokedex | R05 |
| UI17 | Shop với 3,000 ₽ | Buy/Sell, Candy S +600 EXP giá 1,200 ₽, món khóa theo badge, đá tiến hóa | **Còn thiếu:** click Shop chỉ đổi activeTab, không có screen/giao dịch | `live-shop.png/json`, `clone-shop-click.png` | R06 |
| UI18 | Bag → dùng item → chọn mục tiêu | **Chưa ghi thao tác live đầy đủ** | **Còn thiếu:** nút BAG hiện chỉ có title | Consumables.tsx | R06 |
| UI19 | Achievements sau starter | 160 mục chia Looks/Frames/Cutscenes, điều kiện và counter | **Còn thiếu:** click chỉ đổi activeTab | `live-achievements.png/json`, `clone-achievements-click.png` | R07 |
| UI20 | Options | General/Language/Graphics/Performance/Save/What's new/Advanced | **Còn thiếu:** Settings không có handler mở màn | `live-settings.png/json`, `clone-settings-click.png` | R06 |
| UI21 | Day Care, save mới | Boarders/incubator, slot đầu, mở slot bằng tiền, yêu cầu Ditto để có trứng | **Còn thiếu:** nút menu chưa có nghiệp vụ | `live-pension.png/json`; LeftSidebar | R07 |
| UI22 | Game Corner, 0 coins | Slot machine/Pachinko/Shop, nút launch có phí và bảng payout | **Còn thiếu:** menu chưa có handler; chưa kiểm chứng giao dịch live | `live-casino.png/json`; LeftSidebar | R08 |
| UI23 | Raids, save mới | Menu bị khóa/disabled; chưa quan sát vòng raid mở | **Còn thiếu:** không có raid system | manifest screens, ảnh menu khóa nếu có; LeftSidebar | R08 |
| UI24 | Underground, save mới | Menu bị khóa/disabled; chưa quan sát bảng đào | **Còn thiếu:** không có hệ thống đào | manifest screens, ảnh menu khóa nếu có; LeftSidebar | R08 |
| UI25 | Battle Tower | **Chưa xác minh:** không có mục hiển thị tương ứng trong menu live phiên starter | Clone có nút khóa; không đủ bằng chứng để suy ra luật mở | live menu + LeftSidebar | R08, cần khảo sát |
| UI26 | Friends, chưa đăng nhập | Màn giải thích cần đăng nhập, nút Discord/Google | **Còn thiếu:** menu không mở màn; online thật khác phạm vi client-only | `live-friends.png/json` | R09 |
| UI27 | Trades, chưa đăng nhập | Màn yêu cầu đăng nhập để đăng/chấp nhận offer | **Còn thiếu:** chưa có màn và nghiệp vụ; chưa thực hiện trade bên ngoài | `live-trade.png/json` | R09 |
| UI28 | Black Market, starter | Button có trong DOM nhưng bị hidden sau init | **Còn lệch:** clone luôn có mục trong Social; luật mở chưa xác minh | live DOM/manifest + LeftSidebar | R01/R09 |
| UI29 | Bảng tin | Khung và empty text; live còn phụ thuộc sự kiện/tài khoản | **Đã có khung:** nội dung clone là placeholder; chưa có feed thật | ảnh adventure; Arena | R01/R09 |
| UI30 | Mobile 390×844 | **Chưa có bộ live mới cùng fixture**; ảnh APK cũ chỉ tham khảo | **Đã có:** nav dưới, Team ba cột, ảnh local không tràn ngang; chưa chấm giống live | `clone-team-mobile.png`, clone-audit; APK ảnh cũ | R01 |

## Cơ chế, dữ liệu và FX cần kiểm chứng

| ID | Tình huống đầu vào / trigger | Kết quả cần kiểm chứng | Hiện trạng và bằng chứng | Ưu tiên |
|---|---|---|---|---|
| SYS01 | Một turn ở x1/x2/x3 | Hit đúng điểm chạm, HP cập nhật một lần | Đã có implementation và test contact; chưa đo video đầy đủ theo live mới | R02/R03 |
| SYS02 | Đòn làm HP về 0 | Không phản đòn, KO/recall/send-out đúng thứ tự | Có code đã bổ sung; cần fixture wild, trainer nhiều con và cả đội gục | R03 |
| SYS03 | Đổi speed giữa FX / chuyển sang Team | Không cắt FX, không replay hit hoặc reward | Arena được giữ mounted; cần kiểm tra mọi phase, không chỉ speed trước đòn | R02/R10 |
| SYS04 | Bắt wild mới, trùng, fail, shiny, party đầy | Cùng capture outcome giữa animation, state và save; thưởng một lần | Engine và callback reward đã có; R00 mới ghi card quà starter, chưa coi là video capture wild | R03 |
| SYS05 | Kết quả bắt cùng battle log | Không chồng chữ ở 1374px và 390px | Đã nâng kết quả; hai test trình duyệt riêng đã báo ok ở lượt sửa trước | Giữ hồi quy |
| SYS06 | Sprite trong thẻ bắt mới | Nhỏ hơn bản đầu và idle nhẹ | **Theo yêu cầu:** scale .78 với idle; giữ khi đổi source UI | Giữ hồi quy |
| SYS07 | Heal HP thấp / Skip / cả đội thua | HP hồi đúng, kết thúc một lần, route reset đúng thời điểm | Có HealFX và xử lý thất bại; thiếu video/test đầy đủ theo live mới | R03/R10 |
| SYS08 | Tiền/item tại ? và sau battle | Vị trí rơi, nảy, reward khớp log và state; x3 không nhảy node sớm | Có ItemFX; chưa chốt mọi drop rule/timing live mới | R03/R10 |
| SYS09 | Move/status/immune/crit | Dữ liệu và xác suất đúng phiên bản chuẩn | Đã có crit 1/24, miễn nhiễm 0 damage, move power; status và đủ hệ còn cần kiểm tra | R03/R04 |
| SYS10 | Duplicate / EXP đội / EXP gia đình | Số popup phải khớp tài nguyên thật và nguồn EXP | EXP đội đã có; chưa coi là đã hoàn thiện family XP | R05 |
| SYS11 | Chọn/reset/replay từng chapter | Node, trainer, unlock/reward không lấy nhầm Chương 1 | 13 chapter; **10** dùng lại `CHAPTER_1_STEPS`; **10** lệch totalSteps/length | R04 |
| SYS12 | Encounter + Found here + giờ/thời tiết | Một nguồn pool, số đếm và trọng số nhất quán | Còn nhiều selector/data riêng; không nghiệm thu từ UI đơn lẻ | R04 |
| SYS13 | Berry nâng bóng / Nanab / Pinap / đóng tab | Icon, xác suất, thưởng và thời hạn nhất quán | Có buff/action; timer còn seconds, cần đối chiếu timestamp/migration | R06 |
| SYS14 | Save cũ/hỏng, refresh, offline lâu | Không mất Pokémon/tiền, không thưởng lặp | 13 test store có sẵn; live có Welcome back/catch-up, clone chưa được xác minh tương đương | R06 |
| SYS15 | Shiny/form/species ngoài Kanto | Có data/ảnh đúng, không fallback sai | Clone giới hạn species hiện tại; asset/resolver phải kiểm kê lại theo mã mới | R04/R10 |
| SYS16 | Âm thanh, tab ẩn, chơi lâu | Không phát trùng; mute/save đúng; không rò timer/canvas | Chưa kiểm chứng toàn hệ thống | R10 |

## Kết quả kiểm tra dữ liệu chương tại R00

Nguồn là runtime `ALL_CHAPTERS` của clone, ghi trong `clone-audit.json`, không chỉ tìm chuỗi trong mã.

| Chapter | totalSteps | steps.length | Dùng legacy Chương 1 |
|---|---:|---:|---|
| kanto-1 | 20 | 20 | Không |
| kanto-2 | 20 | 19 | Có |
| special-mewtwo | 10 | 10 | Không |
| kanto-3 | 22 | 19 | Có |
| kanto-4 | 24 | 19 | Có |
| kanto-5 | 25 | 19 | Có |
| kanto-6 | 26 | 19 | Có |
| kanto-7 | 30 | 30 | Không |
| special-power-plant | 15 | 19 | Có |
| special-seafoam | 15 | 19 | Có |
| kanto-8 | 30 | 19 | Có |
| kanto-9 | 35 | 19 | Có |
| special-blazing-cave | 15 | 19 | Có |

## Hạng mục R01 đầu tiên

1. **R01.1 — Progress/Adventure:** tách màn Adventure cạnh sidebar theo live. Chapter card mở/chọn hành trình theo tương tác gốc. Không chỉ đổi màu modal cũ; giữ Arena mounted để không cắt FX.
2. **R01.2 — Khung ngoài:** đồng bộ scrollbar/gutter, chiều rộng cột phải và sân, font, header/avatar, chapter card và menu footer. Khóa fixture giờ/RNG trước khi đo diff.
3. **R01.3 — Team/PC:** căn slot và card, empty state, move cạnh level, bộ lọc; preset chỉ có chức năng khi hệ thống thực sự được triển khai.
4. **R01.4 — Pokédex:** thống nhất số vùng/tổng đếm theo phạm vi dữ liệu, bố cục hero và trạng thái mới/chưa biết. Không hardcode 493 khi chưa có dữ liệu tương ứng.
5. **R01.5 — Overlay/mobile:** modal, toast, kết quả bắt và battle log dùng quy tắc không chồng; giữ các chỉnh sửa người dùng; chụp live mobile trước khi chốt breakpoint.

Mỗi mục phải có ảnh trước/sau cùng điều kiện và kiểm tra thao tác. Shop/Day Care hoặc nghiệp vụ chưa có vẫn thuộc R06–R09, không tính hoàn thành chỉ vì sidebar mở được một khung.

## Trạng thái bàn giao R00

- Đã chốt nguồn live, lưu source hash, ảnh/DOM và ma trận công việc.
- Đã ghi ảnh và kiểm tra navigation clone trong context riêng, không có pageerror ở lượt local audit; không sửa code game trong R00.
- Đã tạo archive code/dữ liệu trước R01; không truy cập save trong profile người dùng.
- Chưa có phép đo diff toàn game, video timing live ở ba tốc độ, các màn mở bằng huy hiệu hoặc hoạt động online sau đăng nhập. Các mục này vẫn **chưa xác minh**, không phải task bị đánh dấu hoàn thành.
