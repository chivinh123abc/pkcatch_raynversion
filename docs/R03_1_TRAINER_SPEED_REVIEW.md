# R03.1 — Panel Pokémon, tốc độ và trainer — 16/11/2026

> **Sửa tiếp theo phản hồi đánh quá nhanh:** mapping ×3=2,5 chưa đủ. Đã đo lại native và bổ sung recovery cùng khoảng chờ hàng đợi sau **từng đòn**, thay cho nhịp phản công260/pace cũ. Số đo trước/sau và kiểm tra: [báo cáo nhịp chiến đấu](BATTLE_CADENCE_REVIEW.md).

Chuẩn đối chiếu: snapshot live **v0.4.103, BUILD 5598c5890a**, bundle `app.c0c995f8f9.js` và CSS `app.7130b4d937.css`. Đã chạy hàm giới thiệu trainer của bản chuẩn trong trình duyệt; đây là kiểm tra snapshot có nguồn, không khẳng định đã kiểm tra phiên bản live mới hơn.

## Panel Pokémon trong sân

- `railLayout.ts` theo phép tính `Ct` của native: dành chỗ cho ít nhất sáu ô, tile từ28 đến60px; gap5px desktop,3px mobile; căn giữa số hàng thực có với khoảng trống phía trên cho đồng hồ. Đội một Pokémon không bị kéo thành một ô lớn.
- Icon chỉ phóng **1× hoặc2×**, chỉ dùng2× khi tile≥56px và nội dung vẫn vừa `tile−8`. Cách tính cũ có thể phóng3× các loài nhỏ, khiến kích thước thiếu đồng nhất.
- Bóng đổ trên sân trước đó bị căn giữa hai lần bằng `transform` và `translate`. Nay chỉ giữ một phép căn giữa; kiểm tra hình học ở1280px và1440px.
- Pokémon trên sân và rail vẫn dùng PNG box crop cùng idle/FX theo native. GIF Gen5ani dùng cho các màn artwork đã triển khai; không thay PNG chiến đấu bằng GIF một cách đồng loạt.

## ×1 / ×2 / ×3

| Nút | Giá trị lưu của native | Nhịp thực |
|---|---:|---:|
| ×1 | 1 | 1 |
| ×2 | 2 | 2 |
| ×3 | 4 | **2,5** |

Clone giữ giá trị UI/save1/2/3 để tương thích, chuyển qua `gameplaySpeed()` khi tạo hiệu ứng hoặc tính nhịp combat. Nhịp kiểm tra lượt của native là `650 × 0,5 / pace` ms. Buff vẫn trừ theo giây thực, không theo tốc độ chơi.

Không chia mọi thời lượng cho tốc độ. Giới thiệu trainer thường có380ms vào,360ms hiện VS,300ms ra cố định; chỉ khoảng giữ750ms chia pace. Gym có1460ms chuyển động cố định và1420ms khoảng chờ chia pace. Mỗi chặng lấy tốc độ khi bắt đầu; đổi nút không hủy/phát lại chặng đang chạy. Battle/capture giữ snapshot tốc độ của request như R02.

[Số đo native](trainer-review-2026-11-16/native-speed-timing.json) được lấy từ `demoIntro`, gồm thêm250/pace ms mở đầu và sai số lập lịch frame. Các số đo cũ dùng trực tiếp tham số engine3 không đại diện cho nút ×3 của native.

## Chuỗi trainer và Gym

- Tách giới thiệu → trainer vào sân → bóng đối thủ → bóng đồng đội → mở combat. HP/bóng đổ của Pokémon được giữ ẩn đến lúc Pokémon xuất hiện.
- Khi đối thủ KO, chờ thu Pokémon rồi tung Pokémon kế tiếp; combat bị khóa đến khi hiển thị xong. Không phát lại cảnh trainer bước vào ở mỗi lần thay Pokémon.
- Callback gắn key encounter; callback cũ hoặc lặp không mở nhầm lượt. Có watchdog20 giây để tránh kẹt nếu renderer không hoàn tất. Đổi node hủy timer/animation riêng; đổi tốc độ hoặc mở Team/PC không dựng lại chuỗi hiện tại.
- Dùng markup/CSS VS, Gym và viền chân dung pixel sinh lúc chạy của native. `scripts/extract-trainer-styles.mjs` tái tạo CSS scope từ snapshot và bản trích xuất frame. Sửa alias ảnh `bug-catcher` thành file thực `bugcatcher`; màu8 Gym lấy theo dữ liệu chuẩn.
- Save checkpoint đang chiến đấu không phát lại intro và không giữ khóa runtime của intro mới tạo.

## Bằng chứng và giới hạn

Ảnh: [VS native](trainer-review-2026-11-16/native-vs.png), [VS clone](trainer-review-2026-11-16/local-vs.png), [Gym clone](trainer-review-2026-11-16/local-gym.png). Trainer, đội và kích thước fixture giữa các ảnh có thể khác; chúng chứng minh từng pha hiển thị, không phải phép so pixel của cùng một lượt chơi. [Số đo panel native](trainer-review-2026-11-16/reference-desktop.json) lưu kèm thông tin các nút tốc độ.

Lượt kiểm tra chung: **49/49 browser**, gồm vòng Chương1 từ starter đến Brock ở×1/×2/×3. Sau bổ sung viền chân dung sinh lúc chạy và màu Gym, nhóm trainer/panel/sprite đạt **19/19**. Core **58/58**; build thành công, còn cảnh báo chunkJS>500kB.

Rà cuối đã chuyển cả thời lượng scene dither qua pace chuẩn và chạy lại **16/16 arena/trainer**, gồm đổi tốc độ giữa battle/capture/heal và chuyển màn collection; build lại thành công. Ảnh Gym chụp sau khi flash kết thúc để thấy rõ màu/viền. Việc chụp ảnh VS được tách khỏi kiểm tra chức năng để không phụ thuộc vào thời điểm tải ảnh trong cửa sổ giới thiệu ngắn.

Chưa nghiệm thu100% mọi frame: âm thanh chưa tích hợp đầy đủ; một số chi tiết phụ của cinematic Gym như rung sân/burst theo nhãn và portrait bounce còn cần đối chiếu video. Dữ liệu các chapter legacy vẫn thuộc R04; không coi rà UI trainer là hoàn tất chúng. Không đổi save key/version/reset marker, không reset tiến trình người dùng.
