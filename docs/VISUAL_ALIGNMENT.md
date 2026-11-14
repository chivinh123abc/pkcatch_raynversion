# Đối chiếu vị trí, tốc độ và hiệu ứng — 14/11/2026

Đợt này tập trung màn hình chiến đấu theo phản hồi giao diện chưa giống. Tham chiếu: `thamkhao/gameplay.mp4`, DOM ghi trong `thamkhao/gamegoc/battle-reference-2026-11-08T04-25-07-414Z.json`, CSS `app.2a43a96474.css`, engine hiệu ứng đã trích xuất trong dự án. Đã truy cập trang live bằng Chrome trong context riêng để đọc thêm CSS/JS công khai; không đăng nhập hay thay đổi tài khoản của người dùng.

## Thay đổi

- Sân đấu từ chiều cao cố định 480px sang 16:9; giới hạn toàn trang 1860px, cột trái 248px và phải 300/320px; sửa cỡ chữ và khoảng cách vùng chiến đấu.
- Sprite dùng scale nguyên theo công thức gốc `max(2, round(arenaWidth * .24 / 68))`; giữ box 68×56. Vị trí ally 30%/22%, enemy 78%/25%; thanh HP tính từ biên phần hình thật trong sprite, không từ vùng ảnh trong suốt.
- Rail đội hình căn giữa dọc, slot thích ứng chiều cao sân; hộp thoại, nút tốc độ, huy hiệu buff và thẻ trainer được đưa về bố cục tham khảo. Consumables trở về một hàng icon nhỏ với timer đè lên ảnh.
- Bỏ CSS lunge/idle/flash chạy trùng engine. HP thay đổi qua `onImpact`, có khóa theo key và watchdog khi animation không chạy. Hủy hiệu ứng cũ khi đổi node.
- Bắt bóng dùng `CaptureFX.play`; bắt trùng thành công dùng `CaptureFX.quick`. Tọa độ ném lấy từ trainer và đối thủ thực tế; chỉ ghi kết quả sau khi animation hoàn tất. Bỏ bóng bay cố định 320px và các phase giả theo timer riêng.
- Mưa Chương 7 chỉ hiện trên đoạn biển; không còn phủ cả Seafoam Islands. Bóng từ berry được dùng thống nhất trong capture presentation và kết quả bắt.

## Kiểm chứng

- `npm test`: 13 test store, gồm hit đúng một lần, callback cũ bị vô hiệu khi đổi node, capture không thưởng trước animation và bóng berry nhất quán.
- `npm run test:ui`: 4 test Chrome thật. Kiểm tra 1374px và 1904px, tỷ lệ 16:9, tọa độ 30%/78%, x3 nhanh hơn x1, capture mới và trùng kết thúc không lỗi renderer.
- Ảnh trong `scratch/visual-parity/`: `original-00.png` trích từ video, `local-before.png`, `local-after.png`, `local-after-wide.png`.

Các ảnh dùng save/trạng thái kiểm tra riêng. Chưa có screenshot diff tự động với cùng save trên bản live; chưa xác nhận mọi màn hình, mọi chiêu thức hay toàn bộ game đạt 90–100%. Nội dung các chương, tiến triển và những khoảng thiếu còn lại nằm trong [báo cáo hệ thống](CLONE_PARITY_AUDIT.md).
