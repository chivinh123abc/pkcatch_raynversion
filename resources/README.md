# Bộ tài nguyên nguồn

Các GIF do người dùng cung cấp được giữ tại:

```text
resources/pokemon/showdown/
  gen5ani/              # Mặt trước, thường
  gen5ani-shiny/        # Mặt trước, shiny
  gen5ani-back/         # Mặt sau, thường
  gen5ani-back-shiny/   # Mặt sau, shiny
```

Giữ nguyên tên Showdown như `charmander.gif`, `nidoranf.gif`, `mrmime.gif` và các tên form. Không cần đổi thành số Pokédex.

Chạy `npm run assets:sync` để kiểm tra GIF và chép bốn biến thể của các loài game hỗ trợ sang `public/assets/pokemon/showdown/`. Script sinh manifest kích thước và báo cáo hash; không cắt, chuyển định dạng hay làm mất frame GIF. Bản build chỉ cần tài nguyên trong `public`, không đọc trực tiếp `resources` khi chạy.

Bộ nguồn chứa nhiều thế hệ/form; việc có GIF không tự mở thêm species hoặc vùng chưa có dữ liệu gameplay. Bộ hiện tại là Showdown **gen5ani** pixel, cùng họ sprite với baseline gốc; các thư mục `ani*` cũ đã được bỏ theo yêu cầu người dùng. PNG của sân/ô nhỏ vẫn dùng bộ icon riêng.
