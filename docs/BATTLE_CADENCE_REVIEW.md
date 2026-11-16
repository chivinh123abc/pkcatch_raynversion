# Sửa nhịp đánh quá nhanh — 16/11/2026

Người dùng phản hồi cả ×1/×2/×3 vẫn nhanh hơn bản gốc. Đã đo thực tế renderer của snapshot native v0.4.103/BUILD5598c5890a, thay vì chỉ đối chiếu hệ số tốc độ.

## Nguyên nhân

`Adventure.step()` native xử lý **một actor**, không xử lý cả cặp đánh/phản công. `Qn()` chờ hiệu ứng chạm, giữ kết quả rồi trả về; sau đó vòng UI mới chờ thêm325/pace ms trước actor kế tiếp. Bản clone chỉ chờ260/pace trước phản công, thiếu cả khoảng325/pace và thời gian đọc thông báo khắc hệ/chí mạng. Nhịp sau actor thứ hai còn phụ thuộc pha polling, thiếu ổn định.

| Kết quả đòn | Recovery native sau FX | Chờ hàng đợi kế tiếp |
|---|---:|---:|
| Thường | 260/pace ms | 325/pace ms |
| Chí mạng, siêu hiệu quả hoặc kém hiệu quả | 710/pace ms | 325/pace ms |
| Trượt | 400/pace ms | 325/pace ms |
| Miễn nhiễm | 500/pace ms | 325/pace ms |

450ms thời gian đọc chi tiết chỉ cộng một lần, kể cả vừa chí mạng vừa khắc hệ. Pace giữ1/2/2,5 cho ba nút. Không làm chậm animation bằng một hệ số tùy ý.

## Số đo trình duyệt

Tackle, từ lúc bắt đầu đòn đến lúc bắt đầu actor kế tiếp; đơn vị ms, có sai số frame/timer:

| Nút | Native, thường | Clone trước | Clone sau |
|---|---:|---:|---:|
| ×1 | 946 | 610 | 940 |
| ×2 | 488 | 320 | 490 |
| ×3 | 385 | 270 | 391 |

Khoảng từ lúc chạm đến actor kế tiếp ở×1: native thường591ms, sau sửa593ms; native có thông báo hệ1040ms, sau sửa1045ms. Bản clone trước chỉ264–273ms.

Bằng chứng: [native.json](battle-cadence-2026-11-16/native.json), các file `before-*` và `after-*` trong cùng thư mục. Native dùng chính `Qn` và BattleFX đã lưu; audit chỉ thêm phép ghi giờ tại impact, dừng vòng nền để fixture không tự thay đổi và chủ động chạy khoảng chờ325/pace của vòng UI. Fixture native hiệu quả×2 và clone hiệu quả×0,5 cùng đi qua nhánh đọc chi tiết450ms, không phải kiểm tra công thức damage.

Script đo native: `scratch/visual-parity/audit-native-cadence.mjs`; test clone: `tests/battle-cadence.spec.ts`. Các số đo là từng đoạn Tackle có kiểm soát, chưa đại diện cho mọi chiêu/status/cinematic.

## Thay đổi runtime

- `attackRecoveryDelay()` tính thời gian đọc kết quả theo roll thực. HP vẫn trừ ngay tại impact; không dời impact sang cuối recovery.
- Sau effect, giữ khóa trong recovery; sau đó kiểm tra KO/status và chờ hàng đợi trước actor tiếp theo. Áp dụng cho cả hai actor.
- Mở khóa và dispatch trong cùng callback, tránh polling chen một lượt mới trước phản công đã xếp hàng. Vòng đang chạy tự dispatch sau325/pace; trạng thái Pause được kiểm tra trước khi mở vòng tiếp theo.
- Callback có tag/epoch của runtime nên đổi node hủy chờ cũ. KO không phản đòn, reward vẫn chỉ cấp một lần. Không sửa battle engine, damage, EXP, save hoặc asset.
- Test giả lập Chương1 có ngân sách tick cao hơn để chứa thời gian đọc mới; vẫn phải thắng Brock và mở Cascade, không bỏ assertion tiến trình.

Kiểm tra sau sửa: **60/60 core**, **22/22 browser** gồm cadence thường/khắc hệ ở ba tốc độ, battle/capture/heal đổi tốc độ và trainer; build thành công, cảnh báo chunkJS>500kB còn như trước.

Đã chạy lại walkthrough trình duyệt Chương1 đến Brock ở×3 sau sửa cadence: đạt, không watchdog. Sau đó có [đợt cập nhật chiêu/FX v0.5.02](LIVE_MOVE_UPDATE.md); nguồn/số đo Tackle của báo cáo này vẫn ghi đúng phiên bản đã dùng lúc đo.
