# Đối chiếu màn chờ và giao diện — 16/11/2026

> Yêu cầu mới cùng ngày đã thay đổi NEW và hình học: xem [LAYOUT_PARITY_REVIEW.md](LAYOUT_PARITY_REVIEW.md). Hiện không còn NEW từng ô/header Pokédex; số đo style của báo cáo này không chứng minh bố cục khớp. Các mô tả NEW và media800px lịch sử bên dưới đã được thay thế.

## Nguồn và phạm vi

Yêu cầu: Pokémon màn chờ sinh động/ngẫu nhiên/có shiny; rà font, màu chữ, độ đậm, bóng nhãn hệ, nền/viền Team/PC và Pokédex. Dùng snapshot **BUILD b05c8cc201**, app `c0081498f2`, CSS `3e06fa8ed6`. Hash đầy đủ được ghi trong [reference.json](ui-polish-evidence/reference.json). Đã mở URL live nhưng web reader không đọc được trang JavaScript; không tuyên bố đã xác minh build mới hơn snapshot.

`scripts/capture-ui-polish-reference.mjs` chạy native trong profile riêng, route toàn bộ về cache/local asset, chặn network; tạo đội/PC fixture, gọi renderer Team/Pokédex và đo computed style. Không dùng save/tài khoản người dùng. Bản production không chạy native app.

## Thay đổi

- `TitleField` + `titleScene.ts` thay đàn cố định/quỹ đạo lặp bằng lựa chọn loài không trùng, vị trí ngẫu nhiên, z-index theo độ sâu; 30 con desktop/14 mobile. Theo nhánh native:60% đi theo mục tiêu mới,15% nhảy,25% dừng; bước300ms, bắt đầu so le. Một shiny có màu thật và glint.
- Bóng ném theo đường cong24 đoạn, có Poké/Ultra Ball, va chạm, vòng/spark, Pokémon sáng trắng và thu vào bóng, nảy, lắc1–3 lần, click thành công, tan biến rồi con mới rơi xuống. Giữ trạng thái shiny khi thay con như native. Tối đa3 bóng cùng lúc. Timer/WAAPI/DOM thuộc scene, hủy khi thoát/resize/đổi reduced motion; không dùng RNG hoặc speed combat.
- Pool title sinh từ native danh sách vùng, cờ legendary/mythical và **file regular+shiny thực có**. Hiện chọn93 loài thường Sinnoh. Native live dùng Unova494–649 nhưng bộ box icon local hiện đến493; số556 file bao gồm các form ID lớn, không phải556 loài liên tục. Không tham chiếu file495–556 không tồn tại, không tự mở vùng trong gameplay. Khi có đủ icon vùng mới, chạy lại capture/extractor sẽ cập nhật pool. Đây là giới hạn asset còn lại so với native.
- `typePresentation.json` + `TypeBadge`: đủ18 màu nguồn (ví dụ Fire `#EE8130`, Fairy `#D685AD`), chữ tối theo màu hệ, bỏ bóng chữ trắng/đen cũ và dùng inset shadow native. Team, modal/capture dùng cùng component; nhãn Gym trong Progress có đủ `--tc` để dùng chung công thức. Không đổi tương khắc/damage.
- `ui-polish-reference.css` sinh từ nguồn pin: token chữ/nền/ink/scanline, bề mặt/viền/font của collection, selector trạng thái unknown/seen/caught, border/header, frame pixel menu active và filter. Giữ nguyên media/supports liên quan. `ui-polish.css` chỉ là adapter DOM/cascade và responsive; sửa nguồn qua extractor, không sửa CSS sinh.
- Tên Team và tên Dex dùng Jersey10 như native, tiêu đề Jersey15; khôi phục weight/line-height, text-shadow header và số level. Các style không có viền nhìn thấy không đem màu border mặc định của Tailwind so làm lỗi giả.
- Team/PC có scanline, nền PC dạng lưới và màu tier từ đợt trước. Bỏ huy hiệu Love Ball gán sai từ active combat thành buddy (clone chưa có buddy riêng), dùng dấu shiny vàng. EXP vẫn hiển thị dữ liệu save thật; không ép đầy thanh chỉ để giống fixture native.
- Dex: viền theo màu vùng ở caught, viền tối ở unknown/seen; sửa silhouette bị nhân opacity/filter hai lần. Caught chỉ có một marker Pokéball, seen grayscale/mờ, NEW nhỏ theo vị trí native. Vòng tiến độ đi từ góc trái với chuyển đỏ→vàng. Thêm Unova ở danh sách **khóa**, bố cục5 dòng như native; số liệu vẫn151 loài đang hỗ trợ, không hiển thị649 như thể đã tích hợp dữ liệu.
- Filter dùng wrapper để frame pixel có pseudo-element; select vẫn dùng bàn phím/native option, giữ aria-label và chức năng cũ. Thứ tự filter Dex theo native:Status→Types→Regions→Shinies.

## Kiểm tra và bằng chứng

Nguồn ảnh/computed style: [ui-polish-evidence](ui-polish-evidence/). `native-team/pokedex/types.png` và `local-team/pokedex/types/title.png`; `style-diff.json` ghi sai khác ở tập thuộc tính đo. Loại khỏi so sánh gradient phần trăm Dex do native tổng649, clone151; font/nền/viền/bóng còn lại được kiểm tra trực tiếp. Đây là kiểm tra các selector đã đo, không phải bằng chứng mọi pixel toàn game khớp.

`tests/ui-polish.spec.ts` đo collection và18 badge, đàn không trùng, shiny có ảnh, bắt/thay con thật, cleanup, reload đổi đàn, resize và reduced motion. `tests/ui-presentation.test.mjs` xác minh cả186 PNG regular/shiny của pool93 loài tồn tại và là68×56, cùng bảng18 màu. Kết quả cuối được cập nhật ở handoff.

Lượt hồi quy rộng: **82/82 core**, **44/46 browser**; hai ca còn lại bắt được weight của wrapper filter bị rule cũ ép700 và assertion252px của Dex cũ. Đã sửa weight600 theo native, đổi assertion279px theo fixture mới5 vùng; chạy lại **3/3** geometry/computed style/title đạt, `style-diff.json` rỗng. Build đạt, còn cảnh báo chunk JS>500kB. Sau xem ảnh mobile, giảm padding/font control ở màn hẹp để tên filter không bị cắt; xác minh lại UI/mobile ở lượt cuối. Không cộng các lượt browser có ca trùng thành tổng duy nhất.

Lượt cuối sau chỉnh control mobile: **3/3** geometry, mobile collection/capture và computed style/type badge đạt; ảnh `local-team-mobile.png`, `local-pokedex-mobile.png` đã xem. Các tập mẫu style đo không còn diff; source lấy native palette/frame, số liệu Dex vẫn cố ý theo151 loài. Test desktop/mobile không có tràn ngang; title test xác nhận ảnh shiny thật, bắt/thay loài và không còn animation sau reduced motion/thoát màn. Runner/Chrome thử đã dừng.

Giữ save key/schema/marker, party/PC/preset/NEW, chapter và cadence/battle/capture/reward. Không reset save, không đổi GIF Gen5ani. Chưa nghiệm thu âm thanh/từng frame title, theme sáng hoặc giao diện các hoạt động chưa có runtime; không kết luận toàn game đạt100%. Bước tiếp theo theo yêu cầu người dùng, không tự chuyển R05.
