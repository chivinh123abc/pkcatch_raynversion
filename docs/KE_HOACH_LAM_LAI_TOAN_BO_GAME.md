# Kế hoạch làm lại toàn bộ Poké’Catch

> AI vào sau: bắt đầu từ [trạng thái bàn giao](AI_HANDOFF.md) và [rule làm việc](../AGENTS.md). Các cập nhật theo ngày bên dưới là lịch sử triển khai; trạng thái hiện tại và kiểm tra theo phạm vi nằm trong handoff.

Ngày lập: **14/11/2026**. Trạng thái: **kế hoạch triển khai, chưa phải danh sách đã hoàn thành**.

**Cập nhật R00 — 14/11/2026:** Đã chốt baseline bản live v0.4.103 / BUILD `5598c5890a`, lưu ảnh/DOM/hash và ma trận đối chiếu. Xem [phiên bản chuẩn](reference-version.md) và [checklist R00](REFERENCE_CHECKLIST.md). Bước tiếp theo là R01.1: làm lại Progress/Adventure theo màn riêng. Các tính năng khóa, online sau đăng nhập và timing toàn bộ FX chưa được nghiệm thu.

**Cập nhật R01.1 — 14/11/2026:** Đã chuyển Progress thành màn Adventure, nối preview/Continue/Start và căn geometry shell/sân theo số đo live. Xem [báo cáo R01.1](R01_PROGRESS_LAYOUT.md). Các mục Team/PC, Pokédex, overlay/mobile và dữ liệu hành trình còn lại tiếp tục theo kế hoạch; chưa đánh dấu toàn bộ R01 hoàn tất.

**Cập nhật R01.3–R01.5 — 15/11/2026:** Đã căn Team/PC và Pokédex theo CSS live, có preset/PC order lưu thật, NEW đã xem, thẻ chi tiết dùng dữ liệu UID hiện tại; sửa modal/focus/toast và card 320px. Xem [báo cáo cùng giới hạn](R01_COLLECTIONS_OVERLAYS.md). Kiểm tra 16 test store và 19 test browser đạt; dữ liệu vẫn Kanto 151. Bước tiếp theo R02, không coi dữ liệu chương và các hệ thống chưa tích hợp là hoàn thành.

**Cập nhật R02 — 15/11/2026:** Đã tách runtime theo encounter, các hệ thống battle/capture/reward/node và adapter FX. Có phase, clock/RNG inject, hủy timer/callback cũ, ledger chống thưởng lặp và speed snapshot. Xem [báo cáo R02](R02_RUNTIME.md) và kết quả kiểm tra trong nhật ký dự án. Bước tiếp theo R03: hoàn chỉnh vòng Chương 1; công thức và dữ liệu chưa được coi là đã đúng toàn bộ.

**Cập nhật R03 — 15/11/2026:** Đã nối vòng save mới → chọn starter → wild/trainer/item/Center → Brock → Boulder Badge → Chương 2; bổ sung checkpoint chống nhận EXP/thưởng lặp khi refresh. Core48/48, browser toàn bộ30/30; sau chỉnh cuối chạy lại2/2 ca contact/capture. Có video native x1/x2/x3 và đo ba move mẫu so với bundle chuẩn (lệch tối đa3ms trong lần đo). Xem [R03 và các giới hạn](R03_CHAPTER_1.md); chưa coi generator route, battle đôi, tiến hóa hay toàn bộ move/FX là đã nghiệm thu. Tiếp theo R04 — adapter và validator dữ liệu chapter.

**Cập nhật R03.1 — 15/11/2026:** Theo ưu tiên giao diện, đã đối chiếu và căn hai panel chiến đấu trước R04: rail HP/EXP/status, sprite, Consumables/Bag và Found here theo pool Chương 1. Desktop khớp số đo khung/slot; mobile fit 390px/320px nhưng shell/gutter còn sai khác ghi rõ trong [báo cáo R03.1](R03_1_BATTLE_PANELS.md). Core48/48, browser33/33, sau căn cuối chạy lại7/7 panel, build đạt. Bag dùng vật phẩm đầy đủ vẫn ở R06. Tiếp theo R04.

**R04.2 — cập nhật 16/11/2026:** 14 template Kanto đã nối generator/runtime và selector chung; strict audit đạt 0 vấn đề. Có gift/fossil/static/unlock, đội Gym đã scale, League và save theo seed. Xem [R04.2 và giới hạn](R04_2_KANTO_RUNTIME.md). Đã bổ sung [màn mở đầu và starter](ONBOARDING_PARITY.md), cùng [hướng dẫn học từ đầu](HOC_LAM_GAME_TU_DAU.md). Chưa coi mọi NPC, weather tự động hoặc cơ chế tiến hóa/Shop là hoàn chỉnh.

**Bổ sung hình ảnh R03.1 — 15/11/2026:** Đã thay art PNG phóng lớn bằng GIF Showdown gen5ani local từ nguồn người dùng; tổ chức lại resources/public và xóa bộ ani cũ. Sửa scale icon rail ở sân nhỏ, crop sprite trên sân và geometry desktop trung bình. Xem [cấu trúc sprite và bằng chứng](SPRITE_ASSETS.md). Core/asset55/55; browser33 ca cũ và4 ca GIF đạt; build đạt. Không coi R04 hoặc mọi sai khác mobile đã hoàn tất.

## 1. Mục tiêu và cách thực hiện

Hoàn thiện bản React hiện tại để tái hiện game tham khảo về giao diện, vị trí, nhịp chơi, hiệu ứng, cơ chế và nội dung. Mục tiêu nghiệm thu là độ tương đồng 90–100% **trong phạm vi đã xác định và có bằng chứng**, không tự gán tỷ lệ dựa trên số lượng asset hoặc màn hình đã dựng.

Làm lại từng hệ thống trên nền dự án hiện tại. Giữ những phần đã hoạt động: React/TypeScript/Vite, font Jersey, resolver sprite, dữ liệu đã xác minh, engine hiệu ứng, save tương thích và các kiểm tra có ích. Chỉ thay phần cũ sau khi phần mới chạy được và vượt kiểm tra tương ứng. Bảo toàn các thay đổi người dùng đã bổ sung.

Phạm vi mặc định là game chạy phía client, không phụ thuộc backend game gốc, không iframe hoặc reverse proxy. Các tính năng nhiều người chơi thật cần một quyết định kiến trúc riêng; không trình bày dữ liệu mô phỏng như người chơi trực tuyến thật.

**Đầu ra cuối:** chơi được hành trình đã chốt từ save mới; đủ các màn hình và thao tác thuộc phạm vi; animation đúng trình tự ở x1/x2/x3; save bền vững; có ảnh/video đối chiếu và bộ kiểm tra hồi quy.

## 2. Điểm xuất phát đã kiểm tra

| Phần hiện có | Hướng xử lý |
|---|---|
| Arena, HP theo điểm chạm, capture/heal/item FX | Giữ và chuẩn hóa điều phối; kiểm chứng lại toàn bộ tình huống |
| Thu/tung Pokémon, trainer KO, idle, chia EXP đội, thất bại rồi hồi máu | Bảo toàn; bổ sung tình huống hồi quy khi tách code |
| Team/PC, Pokédex dạng màn hình cạnh sidebar, thẻ bắt mới | Hoàn thiện theo bản chuẩn, không quay lại modal danh sách cũ |
| Sprite trong modal đã giảm và có idle; thông báo bắt đã nâng khỏi battle log | Giữ làm yêu cầu đã được người dùng điều chỉnh |
| Save/load và autosave | Giữ tương thích; bổ sung version, backup và migration có kiểm tra |
| `chaptersData.ts` nhiều chương dùng `CHAPTER_1_STEPS` | Cần thay bằng dữ liệu riêng và kiểm tra độ dài node |
| `useGameStore.ts`, `Arena.tsx` chứa nhiều trách nhiệm | Tách dần logic, điều phối FX và phần trình bày |
| Nhiều lớp CSS cùng định nghĩa giao diện | Kiểm kê override, gom dần theo thành phần sau khi chốt hình chuẩn |
| Dữ liệu JSON lớn hơn 151 loài ứng dụng đang dùng | Cần adapter và kiểm tra thực tế trước khi mở các vùng |

Lưu ý khi đọc báo cáo cũ: mã hiện tại đã có crit `1/24`, xử lý sát thương bằng 0 khi miễn nhiễm, power từ dữ liệu move và EXP đội. Không giao lại các mục này như thể chưa tồn tại. EXP gia đình, tiến hóa, status và tác động berry vẫn cần đối chiếu riêng; EXP đội không chứng minh EXP gia đình đã đúng.

## 3. Giai đoạn 0 — Chốt bản chuẩn và lập danh mục toàn game

**Việc làm**

- Kiểm tra trang gốc `https://pokecatch-online.netlify.app/` bằng profile thử riêng. Ghi ngày, ngôn ngữ, viewport, zoom, trạng thái save và bundle đang dùng.
- Lưu phiên bản chuẩn vào `docs/reference-version.md`. Snapshot web trong `thamkhao/gamegoc/` và APK trong `thamkhao/extracted_apk/` là nguồn hỗ trợ; ghi rõ chỗ khác nhau, không trộn âm thầm.
- Lập ma trận màn hình và tính năng: trigger, điều kiện mở khóa, input save, thao tác, state sau thao tác, ảnh/video, mức ưu tiên, trạng thái kiểm chứng.
- Chụp các trạng thái trống, khóa, đầy, lỗi, thành công; đo tọa độ và kích thước bằng CSS pixel.
- Ghi riêng các điều chỉnh người dùng đã yêu cầu, ví dụ kích thước Pokémon trong modal. Đây là khác biệt có chủ đích so với bản chuẩn.
- Sao lưu mã và save hiện tại; nếu chưa có Git, tạo baseline trước khi bắt đầu thay đổi lớn.

**Nghiệm thu:** có danh mục toàn game và bản chuẩn xác định. Các phần không truy cập được phải ghi “chưa quan sát”, không suy đoán thành đặc tả.

## 4. Giai đoạn 1 — Chốt toàn bộ khung giao diện

**Thứ tự:** nền và kích thước trang → header → sidebar → timeline → arena → panel phải → bảng tin → modal/toast.

- Định nghĩa token chung cho font, cỡ chữ, màu, border, radius, khoảng cách, bóng, layer và breakpoint.
- Đo lại chiều rộng cột, vị trí vùng chơi, tỷ lệ sân, sprite anchor, HP, rail đội hình, thời tiết, buff, log và nút tốc độ ở từng viewport.
- Lập quy tắc vị trí thông báo: log nằm ở đáy sân; kết quả bắt nằm trên log; toast có vùng riêng; dialog có backdrop/focus; không tăng z-index tùy tiện để che lỗi bố cục.
- Hoàn thiện Team/PC, Pokédex, Adventure và Dex Card theo cùng bộ token. Nội dung dài không phá khung.
- Thu gọn CSS trùng trong `index.css`, `reference-ui.css`, `reference-layout.css`, `native-fx.css`, `replica-ui.css` theo từng thành phần. Không xóa hàng loạt trước khi xác định rule đang dùng.
- Kiểm tra desktop 1366×768, 1440×900, 1904×918; mobile 390×844 và 360×800. Chỉ dùng viewport có ý nghĩa với bản chuẩn khi chấm độ giống.

**Nghiệm thu:** ảnh đối chiếu cùng điều kiện cho từng màn; không tràn ngang, không che nút, không chồng HP/log/thông báo; vùng chơi đúng kích thước. Có danh sách sai lệch còn lại và các khác biệt có chủ đích.

## 5. Giai đoạn 2 — Tách logic game khỏi giao diện và timer

Kiến trúc đích đề xuất, có thể điều chỉnh khi triển khai:

```text
src/game/domain/        kiểu dữ liệu và quy tắc tính toán thuần
src/game/data/          adapter và kiểm tra dữ liệu gốc
src/game/systems/       battle, capture, rewards, progression, inventory
src/game/runtime/       đồng hồ, RNG, hàng đợi sự kiện, điều phối animation
src/store/              state và action kết nối các hệ thống
src/components/         màn hình và thành phần trình bày
src/styles/             token, layout và CSS theo thành phần
```

- Tách từng phần từ store/Arena; giữ giao diện action hiện tại trong lúc chuyển đổi.
- Dùng một nguồn trạng thái cho phiên encounter. Các phase dự kiến: tìm kiếm → tung Pokémon → đánh → chạm đòn → KO → bắt/thu về → thưởng → tiếp tục.
- Mỗi đòn/encounter/reward có ID; callback cũ không tác động encounter mới; nhận thưởng đúng một lần.
- Tách thời gian thực của buff/save/day care khỏi tốc độ chiến đấu.
- Chuyển x1/x2/x3 chỉ điều chỉnh nhịp, không remount sân, không khởi động lại FX, không bỏ qua impact hoặc nhân đôi reward. Chốt chính sách đổi tốc độ giữa hiệu ứng theo bản chuẩn.
- Đưa RNG và clock thành dependency có thể cố định trong kiểm tra.

**Nghiệm thu:** hành vi đang hoạt động được giữ; đổi màn, đổi node, đổi tốc độ, ẩn tab không để lại callback sai hoặc gặp hai trận cùng lúc.

## 6. Giai đoạn 3 — Làm đúng một vòng chơi hoàn chỉnh ở Chương 1

Đây là mốc chứng minh nền tảng trước khi nhân rộng nội dung.

- Save mới → chọn starter → route → wild/trainer → item → center → Brock → huy hiệu → mở chương tiếp.
- Chuẩn hóa turn order, move/category/power/accuracy, STAB, tương khắc, crit, miss, miễn nhiễm và giới hạn HP.
- Định nghĩa status có thời hạn, điều kiện hồi phục và log đúng; không chỉ gắn nhãn SLP.
- Pokémon HP = 0 không đánh tiếp. Trainer thay đúng con; đội hết Pokémon khỏe chuyển qua quy trình thất bại/hồi máu đúng bản chuẩn.
- Bắt mới/trùng/thất bại/shiny: xác suất, bóng có hiệu lực, số lượng bóng, buff và phần thưởng cùng một nguồn dữ liệu.
- Phân biệt EXP chiến đấu, EXP gia đình và tài nguyên nâng cấp sau khi xác minh bản gốc. Tiền/XP hiển thị phải khớp số thực cộng vào save.
- Giữ nhịp hoàn tất hiệu ứng rồi mới đổi node; Skip hồi máu kết thúc đúng một lần.

**Nghiệm thu:** chơi xuyên Chương 1 từ save mới; refresh tại grass/item/heal/gym không mất tiến độ hoặc nhận thưởng hai lần. Thử party đầy, Pokémon gục và toàn đội thua. Có video x1/x2/x3.

## 7. Giai đoạn 4 — Dữ liệu hành trình và tiến triển dài hạn

- Tạo adapter cho chapter/node/encounter/trainer/gym/reward/unlock. Tổng bước suy ra từ dữ liệu hoặc có validator bắt sai lệch.
- Loại bỏ dữ liệu Chương 1 dùng thay cho chương khác. Mỗi chương có trainer, cấp, cảnh, pool và reward riêng.
- Dùng cùng selector encounter cho Arena, Found here và Adventure; đồng bộ giờ, thời tiết, trọng số và điều kiện xuất hiện.
- Theo dõi tiến độ, hoàn thành, replay, huy hiệu và phần thưởng một lần theo từng chapter.
- Mở rộng species/form/shiny theo dữ liệu và asset đã xác minh; thống nhất đủ hệ, gồm Dark nếu thuộc phạm vi. Không bật vùng có dữ liệu chưa hoàn chỉnh.
- Đối soát stat/EXP/move/evolution giữa JSON và kiểu TypeScript; không tự dùng công thức Pokémon phổ thông nếu game chuẩn có luật riêng.

**Nghiệm thu:** tất cả chapter được công bố trong phạm vi có đường đi hợp lệ, gym đúng và không fallback ngầm về chương khác; Found here khớp quái có thể gặp.

## 8. Giai đoạn 5 — Team/PC, tiến hóa và Pokédex hoàn chỉnh

- Team: chi tiết, đổi thứ tự, đổi Pokémon đang dùng theo điều kiện gốc, preset nếu có, gửi/rút/đổi PC, đặt tên nếu bản chuẩn hỗ trợ.
- PC: tìm/lọc/sort, phân trang, đầy/rỗng, lựa chọn nhiều và thao tác hàng loạt nếu đã quan sát được.
- Tích hợp EXP gia đình/nâng cấp, tiến hóa bằng level/vật phẩm/điều kiện. Giữ UID, áp dụng HP/stat theo quy tắc đã chốt và cập nhật dex/save.
- Pokédex: seen/caught/shiny, vùng, form, chi tiết và tổng đếm đúng dữ liệu được mở.
- Modal có focus, ESC phù hợp từng loại, nút đóng/Continue và ưu tiên rõ; không hai dialog giành bàn phím.
- Giữ sprite bắt mới nhỏ hơn trước, có idle; không dùng kích thước ảnh đầy vùng trong suốt để căn giữa.

**Nghiệm thu:** không mất hoặc nhân đôi Pokémon khi đổi đội; tiến hóa trừ đúng tài nguyên; lọc/sort không sửa dữ liệu gốc; mọi thay đổi tồn tại sau refresh.

## 9. Giai đoạn 6 — Shop, Bag, berry và Settings

- Shop: giá, điều kiện mở, số lượng, giới hạn, xác nhận, thiếu tiền, giao dịch đúng một lần.
- Bag: tồn kho, dùng vật phẩm, chọn mục tiêu, khóa trong phase không hợp lệ; cùng inventory với Shop và reward.
- Berry: hiệu lực thật trong capture/EXP/money, giới hạn cộng dồn, ưu tiên buff; timer chuyển sang timestamp có migration từ save cũ.
- Settings: âm lượng, tắt/bật âm thanh, ngôn ngữ/theme/tùy chọn animation nếu có ở bản chuẩn; lưu preference.
- Save thủ công/autosave, export/import, kiểm tra file, backup trước import/reset và phục hồi khi dữ liệu hỏng.
- Bỏ số “playing” cố định hoặc thể hiện đúng chế độ offline; không gọi là số người trực tuyến thật.

**Nghiệm thu:** không âm tiền/vật phẩm; buff đóng mở tab vẫn đúng hạn; import lỗi không phá save đang dùng; nút có phản hồi thật.

## 10. Giai đoạn 7 — Các hoạt động phụ và màn còn thiếu

Mỗi hệ thống phải đi đủ chuỗi **quan sát bản chuẩn → dữ liệu → logic → UI → save → kiểm tra**, không chỉ dựng một màn giống ảnh.

| Thứ tự | Hệ thống | Nội dung cần hoàn thiện |
|---|---|---|
| 1 | Achievements | Điều kiện, bộ đếm, nhận thưởng một lần, trạng thái khóa/đã nhận |
| 2 | Day Care | Gửi/rút, phí, giới hạn, thời gian thực, EXP/trứng nếu có |
| 3 | Game Corner | Vé/xu, luật chơi, xác suất, phần thưởng và giới hạn |
| 4 | Raids | Mở khóa, đội/boss, lượt hoặc timer, kết quả, phí và reward |
| 5 | Battle Tower | Tầng, đội đối thủ, luật đội hình, chuỗi thắng và reset |
| 6 | Underground | Tài nguyên, lượt/năng lượng, bảng đào và vật phẩm |
| 7 | Black Market/Trades/Social/Friends | Đặc tả rõ phần cục bộ và phần cần người chơi thật |

Nếu người dùng muốn giao dịch, bạn bè hoặc leaderboard thật: đề xuất backend, tài khoản, đồng bộ và xác thực giao dịch thành một hạng mục riêng trước khi triển khai. Trong phạm vi client-only, chỉ làm mô hình cục bộ được ghi rõ và không chấm là tương đương online.

**Nghiệm thu:** mọi menu thuộc phạm vi có vòng chơi và dữ liệu bền vững; tính năng chưa làm hiển thị đúng trạng thái khóa, không dùng nút giả để tính hoàn thành.

## 11. Giai đoạn 8 — Rà toàn bộ hiệu ứng, âm thanh và hiệu năng

- Lập danh mục: idle, tung/thu bóng, attack theo move, miss/crit/status, HP, faint, trainer đổi con, capture, shiny, XP, level-up, tiến hóa, tiền rơi, item, heal, chuyển cảnh.
- Mỗi FX có trigger, anchor, duration, impact, complete và cancel. Đo bằng video/timestamp, không chỉ nhìn một frame.
- Kiểm tra x1/x2/x3 và đổi tốc độ giữa hiệu ứng; không giật về frame đầu, mất hit, mất thưởng hoặc ngắt FX khi mở màn khác.
- Âm thanh phát theo event, đúng một lần; kiểm tra autoplay policy và tùy chọn mute của trình duyệt.
- Dùng resolver sprite chung; lập manifest asset và kiểm tra 404. Nếu cần chạy hoàn toàn không có mạng, bổ sung cache/đóng gói asset qua manifest và resolver sau khi xác định nguồn tài nguyên, không hardcode đường dẫn từng Pokémon trong component.
- Tải lười màn/engine nặng, đo tải trang và bộ nhớ; xử lý cảnh báo bundle khi có số đo. Kiểm tra rò timer, canvas và audio khi chơi lâu.

**Nghiệm thu:** có video FX đại diện ở ba tốc độ, không lỗi console, không asset thiếu trong phạm vi; phiên chơi liên tục 30–60 phút không tăng bộ nhớ không kiểm soát.

## 12. Giai đoạn 9 — Nghiệm thu toàn game và bàn giao

**Bộ dữ liệu kiểm tra:** save mới; đội HP thấp; đội đầy; PC nhiều trang; trước/sau gym; đủ điều kiện tiến hóa; nhiều buff; shiny; save cũ; save hỏng. Dùng clock/RNG cố định khi cần so sánh.

**Bộ kiểm tra bắt buộc:**

- Unit: damage, miễn nhiễm/status, capture, EXP/level/evolution, encounter/unlock, inventory, reward một lần, save migration.
- Integration: battle → KO → capture/reward → node; trainer nhiều Pokémon; cả đội faint; đổi màn/tốc độ; callback cũ bị vô hiệu.
- Browser: thao tác thực tế, responsive, focus/modal, PC swap, mua/dùng đồ, tiến hóa, refresh và import/export.
- Visual: ảnh cùng viewport/save/giờ/thời tiết/font, có mask cho vùng ngẫu nhiên; so animation bằng video. Chốt ngưỡng diff sau khi đo nhiễu, không đặt phần trăm tùy ý.

Các lệnh hiện có để kiểm tra khi triển khai: `npm test`, `npm run test:ui`, `npm run build`. Không cần chạy build/test chỉ vì sửa tài liệu này.

**Điều kiện đóng một task:** có thay đổi chạy được, tiêu chí nghiệm thu đạt, bằng chứng phù hợp, tài liệu cập nhật và không làm hỏng phần đã có. Task mới tạo mặc định chưa hoàn thành.

**Điều kiện công bố hoàn tất:** không còn lỗi mất save, kẹt hành trình, Pokémon chết vẫn đánh, nhận thưởng hai lần hoặc thiếu nghiệp vụ của menu thuộc phạm vi. Mỗi màn/chức năng có bằng chứng nghiệm thu.

## 13. Cách theo dõi độ tương đồng

| Nhóm | Trọng số đề xuất | Cách xác minh |
|---|---:|---|
| Cơ chế và hành trình | 35% | Trường hợp đầu vào/đầu ra, chạy từ save mới, test nghiệp vụ |
| Màn hình và thao tác | 30% | Danh mục màn/trạng thái/nút có chức năng thật |
| Giao diện, FX, âm thanh | 25% | Ảnh/video cùng điều kiện và rà thủ công |
| Save, responsive, ổn định | 10% | Migration, refresh, mobile, asset và phiên dài |

Đây là thước đo dự kiến, không phải điểm hiện tại. Chỉ công bố ≥90% khi phần tương ứng đã xác minh và không còn lỗi nghiêm trọng. Chỉ công bố 100% khi đóng hết các mục trong phạm vi, ghi rõ giới hạn offline và các điều chỉnh người dùng yêu cầu.

## 14. Thứ tự giao việc cụ thể

| Mã | Việc giao | Phụ thuộc | Đầu ra |
|---|---|---|---|
| R00 | Chốt phiên bản chuẩn, snapshot và ma trận màn | Không | Reference version + checklist có bằng chứng |
| R01 | Chốt shell, Arena, modal/toast, responsive | R00 | Bộ ảnh đối chiếu và CSS token |
| R02 | Tách battle/capture/reward runtime khỏi UI | R01 | Hệ thống phase, clock/RNG, giữ kiểm tra cũ |
| R03 | Hoàn chỉnh Chương 1 từ starter đến Brock | R02 | Vòng chơi end-to-end và video x1/x2/x3 |
| R03.1 | Đối chiếu và hoàn thiện hai panel chiến đấu | R03 | Rail/Consumables/Found here, ảnh desktop/mobile và giới hạn có bằng chứng |
| R04 | Chuẩn hóa dữ liệu, toàn bộ chapter thuộc phạm vi | R03, R03.1 | Validator + chapter/encounter/reward riêng |
| R05 | Team/PC, EXP gia đình, tiến hóa, Pokédex | R03, adapter R04 | Quản lý và tiến triển Pokémon hoàn chỉnh |
| R06 | Shop/Bag, berry, Settings, save migration | R03 | Giao dịch/vật phẩm/save có kiểm tra |
| R07 | Achievements và Day Care | R05, R06 | Hai vòng chức năng bền vững |
| R08 | Game Corner, Raids, Tower, Underground | R04, R06 | Nội dung phụ theo bản chuẩn |
| R09 | Social/Trade/Market theo phạm vi offline đã chốt | R00, R06 | Mô hình rõ ràng; backend là phạm vi riêng |
| R10 | Hoàn thiện FX/SFX/asset và tối ưu | R03–R09 | Báo cáo video, asset và hiệu năng |
| R11 | Nghiệm thu toàn bộ và bàn giao | R00–R10 | Kết quả kiểm tra, điểm có bằng chứng, danh sách giới hạn |

Không cần đợi cuối dự án mới chỉnh UI hoặc FX: mỗi R03–R09 phải nghiệm thu cả hành vi lẫn giao diện của phần mình. R10 là đợt rà toàn cục sau tích hợp.

**Bước đầu khi bắt đầu triển khai:** thực hiện R00, rồi R01. Kế hoạch này chưa tự khởi động việc viết lại code, chạy server hoặc đổi save.

## Tài liệu liên quan

- [Cập nhật chiêu/FX live v0.5.02](LIVE_MOVE_UPDATE.md):661 chiêu,160 entry mới,116 chiêu mới gây damage; đồng bộ learnset151 loài. Kiểm tra thay đổi nhanh bằng `npm run reference:check`; không tự đánh dấu các hệ thống vùng/raid/trade mới đã hoàn tất.

- [Sửa nhịp chiến đấu sau phản hồi đánh quá nhanh](BATTLE_CADENCE_REVIEW.md): đã bổ sung recovery và325/pace sau từng actor; so số đo native/clone ở cả ba nút.

- [Rà panel, tốc độ và trainer —16/11/2026](R03_1_TRAINER_SPEED_REVIEW.md): ×3 native là nhịp2,5; chuỗi intro/send-out khóa combat tới khi hiển thị xong. Dữ liệu chapter đã nối ở [R04.2](R04_2_KANTO_RUNTIME.md).

- [Kiểm tra khoảng thiếu hệ thống](CLONE_PARITY_AUDIT.md) — báo cáo lịch sử, phải đối soát với mã mới.
- [Các đợt căn giao diện đã làm](VISUAL_ALIGNMENT.md).
- [Nhật ký và quy ước dự án](../AGENTS.md).
