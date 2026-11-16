# Collection tự kéo trang lên khi đang xem — 16/11/2026

## Nguyên nhân và sửa

Arena được giữ mounted khi mở Pokédex/Team/PC để chiến đấu và FX tiếp tục. Effect theo `currentStep` trong `src/components/Arena.tsx` gọi `activeNode.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'})`. API này cuộn cả ancestor/document; dù Arena đang ẩn bằng opacity, bước mới vẫn kéo cửa sổ về gần timeline. Không phải mất state của lưới hoặc collection bị remount.

Đã tái hiện Pokédex desktop: scrollY650→78 sau đổi node; mobile650→85. Team/PC dùng chung effect. Fixture kiểm tra PC tạo60 Pokémon để trang đủ dài; vị trí thử tính theo chiều dài thật, tránh nhầm browser clamp ở cuối trang thành lỗi.

Thay bằng `rail.scrollTo({left,behavior:'smooth'})`; tính left từ rect của node và thanh timeline cộng scrollLeft hiện có. Chỉ thanh tiến trình cuộn ngang. Không pause/remount Arena, không khóa scroll của collection hoặc kéo cửa sổ ngược lại để che lỗi. Timeline ẩn vẫn cập nhật vị trí cho lúc quay lại chiến đấu.

Đây là sửa lỗi local, không thay baseline/hash tham chiếu, CSS, save/schema/marker, đội hình hoặc timing combat.

## Kiểm chứng

- `tests/collections.spec.ts`: Pokédex và Team/PC ở1440/390px; cuộn xuống, đổi hai node nền, chờ smooth scroll rồi kiểm tra scrollY giữ nguyên.
- `tests/arena.spec.ts`: timeline mobile vẫn cuộn ngang tới node cuối và giữ scrollY của document; kiểm tra đổi speed/mở Team không làm lại capture request.
- Chạy thêm collection/filter/menu-notification/mobile để kiểm tra tương tác dùng chung.

Kết quả cuối: **10/10 browser đạt**, build thành công; còn cảnh báo chunk JS lớn đã có từ trước. Runner và Chrome kiểm tra đã dừng. Không chạy lại core vì không sửa logic domain/store. Không cần reset save. Khi sửa timeline sau này, tránh dùng `scrollIntoView` trên Arena đang chạy nền; thay đổi cần giữ cả khả năng căn ngang lẫn scroll document.
