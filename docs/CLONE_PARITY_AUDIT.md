# Kiểm tra bản clone và lộ trình đạt độ tương đồng 90–100%

Ngày kiểm tra: **14/11/2026**. Phạm vi: mã React trong `src/`, dữ liệu `public/data/`, tài nguyên và bản tham khảo cục bộ. Đây là kiểm tra mã và build; **chưa phải chứng nhận giống giao diện bằng ảnh đối chiếu**.

## Kết luận thực tế

Dự án có nền tảng cho màn hình chiến đấu: bố cục, font, sprite, hiệu ứng, route, trainer, hồi máu và bắt Pokémon. Phần thiếu lớn nằm ở dữ liệu hành trình, tiến triển lâu dài và các màn hình tương tác. Có asset hoặc file JSON chưa có nghĩa là hệ thống đó đã được tích hợp vào game.

Không đủ bằng chứng để chấm một tỷ lệ hoàn thành hiện tại. Những dòng “100%”, “đã hoàn thành” trong nhật ký cũ không thay thế được kiểm thử. Ví dụ: nhật ký nói có persist middleware, nhưng store thực tế dùng `create()` với `saveGame/loadGame` thủ công; nhiều chương khai báo tổng số bước khác với mảng bước thực tế.

Đã thử truy cập https://pokecatch-online.netlify.app/ trong phiên này. Công cụ đọc web không lấy được nội dung giao diện chạy bằng JavaScript. Những nhận xét về bản gốc bên dưới dựa thêm vào snapshot trong dự án; chúng chưa xác nhận phiên bản live mới nhất.

## Những gì đã sửa trong lượt này

- **Team/PC:** mở từ sidebar; xem đội hình và HP/EXP; đổi thứ tự; gửi Pokémon vào PC; rút khi đội còn chỗ; chọn slot để đổi với PC khi đủ 6 con; tìm kiếm và phân trang PC.
- **An toàn đội hình:** giữ Pokémon đang hoạt động khi đổi thứ tự; không gửi con khỏe cuối cùng vào PC; chặn thay đội giữa đòn đánh, bắt Pokémon hoặc hồi máu.
- **Pokédex Kanto:** lưới 151 loài; tìm theo tên/số/hệ; lọc tất cả/đã gặp/đã bắt/chưa gặp; xem hệ và base stats của loài đã biết.
- **Save phiên bản 2:** giữ khóa `pokecatch_save_v1`; bổ sung PC, huy hiệu, bóng, Pokédex đã gặp, Pokémon đang dùng, bóng đã chọn, tốc độ, auto-catch và trainer tag. Đọc save cũ thiếu trường mới. Kiểm tra cấu trúc Pokémon và bộ đếm trước khi áp dụng.
- **Autosave:** mỗi 15 giây, khi tab ẩn và khi rời trang; đổi đội hình cũng lưu ngay. Không thay hội thoại khi autosave. Khi tải lại, encounter khởi tạo lại tại node đã lưu, không phục hồi giữa animation.
- **Hiển thị thật:** dấu đã bắt ở Adventure/Found here lấy từ save; bộ đếm Found here tính từ danh sách; TopBar dùng tổng 151 phù hợp dữ liệu hiện tại; berry hết buff không còn hiện thời gian mẫu.
- **Kiểm thử:** `npm test` kiểm tra save/load, save cũ, dữ liệu lỗi, PC, đổi đội và tránh thưởng lại node vật phẩm. `npm run build` kiểm tra TypeScript và bundle.

Modal mới dùng font, màu và sprite hiện có. **Chưa xác nhận bố cục modal giống nguyên bản**; cần ảnh chụp modal gốc để đối chiếu. Shop và các mục ngoài danh sách trên vẫn cần làm.

## Các khoảng thiếu đã xác nhận từ mã

| Ưu tiên | Bằng chứng | Ảnh hưởng | Cách hoàn thiện |
|---|---|---|---|
| P0 | `chaptersData.ts`: nhiều chapter dùng `steps: CHAPTER_1_STEPS`; `totalSteps` khác `steps.length` | Đổi chương vẫn có thể đánh trainer Chương 1; bước không tồn tại quay về node đầu | Dữ liệu riêng từng chương; tổng bước suy ra từ mảng; test trainer/gym cuối chương |
| P0 | `loadStepNode()` chỉ phân biệt riêng Chương 7 và Mewtwo, phần còn lại dùng pool Chương 1 | Khu vực, cấp và Pokémon không đúng chương | Một bộ encounter dùng chung combat/Found here; trọng số, giờ, thời tiết cùng nguồn |
| P0 | Nhánh duplicate trong `catchEnemy()` tạo popup nhưng không sửa `exp`, `level` hay kho EXP gia đình | Bắt trùng không tạo tiến triển thật | Xác định EXP gia đình của bản chuẩn; cộng một lần; tiêu EXP, lên level và lưu |
| P0 | Có `evolvesTo` nhưng chưa có action tiến hóa | Không có vòng nuôi và tiến hóa | Adapter `evolutions.json`; điều kiện level/đá/khác; cập nhật stats/dex/save |
| P0 | `catchEnemy()` dùng `selectedBall`; không đọc Nanab/Pinap trong công thức bắt/thưởng | Berry có thời gian nhưng tác động chưa nhất quán | Hàm bóng hiệu lực và buff dùng chung hình ảnh, xác suất, tiêu vật phẩm, reward |
| P0 | `mechanics.json` ghi crit `1/24`; store dùng `0.05`; power cố định 55/50 | Các chiêu chưa có đủ đặc tính chiến đấu | Tích hợp moves: power/accuracy/category/status; constants thống nhất; test fixture |
| P0 | `Math.max(1, ...)` cả khi multiplier bằng 0; `PokemonType` thiếu Dark | Miễn nhiễm vẫn mất HP; chưa đủ 18 hệ | Thêm Dark/chart; xử lý miễn nhiễm trước clamp; test Normal/Ghost, Electric/Ground |
| P1 | Shop chỉ đổi tab; Day Care/Game Corner/Raids/Friends/Trades/Black Market chưa có handler nghiệp vụ | Menu chưa chơi được | Làm UI → action → dữ liệu → lưu → test; ưu tiên Shop/Bag, Day Care |
| P1 | Settings/ngày đêm chưa có handler; “7,378 playing” cố định | Thiết lập và online chưa phản ánh dữ liệu thật | Settings, âm thanh, ngôn ngữ, export/import; xác định phạm vi offline/online |
| P1 | `enemyStatus` chủ yếu SLP, chưa có bộ đếm hồi phục | Ngủ chưa có quy trình thức dậy đầy đủ | Status có thời hạn và tác động theo lượt, dùng chung log/UI/logic |
| P1 | Scene, giờ mưa, Found here và encounter tính riêng | Tỉ lệ và hình chưa bảo đảm khớp quái sinh ra | Time/weather service; selector khu vực chung cho Arena/Adventure/RightPanel |
| P1 | Buff giảm bằng interval, chưa bù thời gian tab đóng/ẩn | Thời hạn berry lệch đồng hồ thật | Lưu `expiresAt`; migration từ seconds cũ |
| P1 | Có 556 sprite thường nhưng chưa có `public/assets/shiny/` dù resolver trả URL ở đó | Shiny thiếu hình | Giải nén pack shiny theo `packs.json`; kiểm tra đường dẫn trước khi bật random shiny |
| P1 | `App.tsx` ép `min-w-[1100px]` | Màn hình nhỏ tràn ngang | Đối chiếu mobile gốc; sidebar drawer/tab; kiểm tra cảm ứng và tỉ lệ arena |
| P2 | Chưa có hệ thống SFX và browser tests trong package | Thiếu âm thanh và khó ngăn hồi quy UI | Âm thanh theo event; screenshot và kiểm thử hành trình |

`public/data/pokedex.json` có nhiều loài hơn `POKEMON_SPECIES_MAP` ứng dụng đang dùng. Các file encounters/evolutions/moves/mechanics cần adapter và được sử dụng thực tế; sao chép vào `public/` chưa đủ.

## Chọn một phiên bản chuẩn

Dự án có nhiều đời tham khảo:

- `thamkhao/gamegoc/index.html`, `scripts/app.5a63acc466.js`, `styles/`: snapshot web.
- `thamkhao/gamegoc/battle-reference-2026-11-08T04-25-07-414Z.json` và `.webm`: dấu vết giao diện/animation một phiên chơi.
- `thamkhao/gameplay.mp4` và video quay màn hình: hành vi nhìn thấy được.
- `thamkhao/extracted_apk/assets/`: dữ liệu/pack offline; `public/data/mechanics.json` là nguồn cơ chế đã có.
- `routes.ts` và `chaptersData.ts`: có cả bộ 20 bước và mảng Chương 1 cũ 19 bước.

Chọn **một snapshot web cụ thể** làm chuẩn giao diện và hành vi. Ghi ngày, URL, tên bundle vào `docs/reference-version.md` khi chốt. Nếu web và APK mâu thuẫn, ghi khác biệt và chọn theo bản chuẩn, không ghép công thức rồi gọi là “100%”. Dùng profile thử riêng khi ghi các thao tác ảnh hưởng save của game gốc.

## Bằng chứng giao diện cần thu thập

Chụp bản gốc và clone ở cùng viewport, zoom 100%, ngôn ngữ và save. Ghi kích thước bằng **CSS pixel**.

1. Lần đầu: starter, hướng dẫn, chưa có huy hiệu.
2. Arena: tìm quái, đánh, trượt, crit, faint, trainer nhiều con, gym, cả đội faint.
3. Bắt: thành công mới, trùng, thất bại, shiny, bóng nâng cấp, hết bóng giới hạn.
4. Node: vật phẩm, heal từ HP thấp, SKIP, hoàn thành và replay chapter.
5. Team/PC: danh sách/chi tiết, sắp xếp, PC nhiều trang, tiến hóa, dùng EXP/vật phẩm.
6. Pokédex: chưa thấy/đã thấy/đã bắt, bộ lọc, chi tiết, form.
7. Adventure: khóa/mở/hoàn thành, continue/replay, danh sách theo giờ/thời tiết.
8. Shop/Bag, Day Care, Game Corner, Raids, Achievements, Settings và các màn Social thuộc phạm vi.

Mỗi màn cần: ảnh tổng, ảnh sau thao tác, trạng thái trống/khóa/lỗi, video animation, thay đổi tiền/vật phẩm/EXP trước-sau. Tạo ma trận `screen | trigger | input save | expected state | screenshot | status`.

## Thứ tự triển khai

### A. Hành trình và tiến triển có thể chơi thật

- Chuẩn hóa chapter/node/encounter, bỏ tham chiếu Chương 1 ở chương khác.
- Tiến độ riêng từng chapter, mở khóa và thưởng một lần.
- Tách battle calculations khỏi animation; hủy timer khi đổi node; kết quả được nhận thưởng một lần.
- EXP, level, tiến hóa, berry, bắt theo bản chuẩn; export/import, migration và backup trước import.

**Nghiệm thu:** save mới chơi starter → Brock → nhận huy hiệu, bắt quái, đổi PC, tiến hóa, refresh và tiếp tục đúng. Save mạnh thử mọi chương đúng trainer/gym. Đội Lv.100 mặc định chưa chứng minh được độ cân bằng.

### B. Màn hình dùng hàng ngày

- Đối chiếu Team/PC và Pokédex vừa thêm với ảnh gốc; bổ sung các tab/thao tác thực sự có.
- Shop/Bag dùng chung inventory; giá/điều kiện lấy từ bản chuẩn.
- Day Care có timestamp, EXP đúng và hoạt động khi mở lại.
- Achievements dựa trên số liệu chơi; Settings/SFX/thông báo/save feedback.

**Nghiệm thu:** mọi nút có kết quả kiểm tra được; mua trừ đúng tiền, thêm đúng món, không âm; dữ liệu tồn tại sau refresh.

### C. Nội dung phụ và phạm vi offline

- Game Corner/Raids/Battle Tower/Underground theo điều kiện và reward bản chuẩn.
- Kiểm tra sprite thường/shiny, trainer, background, item; không 404.
- Friends/Trades/leaderboard: **mô phỏng cục bộ** phù hợp client-only; **kết nối người chơi thật** cần dịch vụ đồng bộ và mở rộng kiến trúc. localStorage không tự đồng bộ giữa các máy.

**Nghiệm thu:** tính năng trong phạm vi chơi xuyên suốt; ghi rõ phạm vi offline; dữ liệu online cố định không được trình bày như dữ liệu trực tiếp.

### D. Chỉnh sai lệch giao diện và kiểm tra độ ổn định

- Cố định dữ liệu thử, RNG, giờ, thời tiết.
- Chụp desktop 1440×900, laptop 1366×768 và viewport mobile gốc.
- Overlay ảnh để chỉnh font/kích thước/khoảng cách/sprite/màu/layer; video để kiểm tra mốc tấn công/hit/faint/reward/chuyển cảnh.
- Kiểm tra bàn phím, focus/ESC, nội dung dài, màn hình nhỏ, lưu lại và chơi liên tục.

**Nghiệm thu:** không còn lỗi nghiệp vụ nghiêm trọng; mỗi màn có ảnh đối chiếu và test đạt. Một ảnh Arena đẹp chưa đủ kết luận toàn game.

## Đo “90–100%”

Đây là cách chấm **đề xuất, không phải điểm hiện tại**:

| Nhóm | Trọng số | Bằng chứng |
|---|---:|---|
| Hành trình và cơ chế | 35% | Tình huống input/output xác định, test đạt |
| Màn hình và thao tác | 30% | Đủ màn, trạng thái và thao tác trong danh mục |
| Hình/animation/âm thanh | 25% | Ảnh/video cùng điều kiện, được đối chiếu và duyệt |
| Save/offline/responsive/ổn định | 10% | Refresh, đóng mở, asset, viewport, phiên dài |

Chỉ công bố 90% khi ít nhất 90% trọng số được xác minh và không còn lỗi P0. “100%” cần đóng toàn bộ mục trong phạm vi, gồm trạng thái hiếm. Nếu loại online khỏi phạm vi, ghi **độ giống bản offline**.

## Việc tiếp theo nên giao

Ưu tiên **Chương 1 từ starter đến Boulder Badge với reward/EXP/evolution/save thật**, rồi nhân cách tổ chức dữ liệu ra các chương khác.

Mẫu yêu cầu triển khai:

> Dùng [snapshot đã chọn] làm chuẩn. Hoàn thiện Chương 1 starter → Brock; dùng một nguồn node/encounter cho Arena và Found here; tích hợp EXP, lên cấp, tiến hóa theo dữ liệu gốc; lưu/load đầy đủ. Giữ phong cách UI. Test có seed cho bắt mới, bắt trùng, thất bại, party đầy, cả đội faint, refresh ở item/heal/gym. Đính kèm thay đổi và bằng chứng kiểm thử. Không đánh dấu hệ thống khác là hoàn thành.

## Giới hạn kiểm chứng trong phiên này

- `npm test`: test store; chưa bao phủ toàn bộ combat/UI.
- `npm run build`: TypeScript/Vite thành công; còn cảnh báo chunk >500 kB.
- Chưa chạy browser automation hoặc screenshot comparison; cần bước này trước khi nghiệm thu độ giống và tương tác modal trên trình duyệt.
- Workspace chưa có repository Git; nên tạo baseline commit trước các đợt tiếp theo.
