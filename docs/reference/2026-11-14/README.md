# Bằng chứng R00 — 14/11/2026

Định danh nguồn và điều kiện đầy đủ: [reference-version.md](../../reference-version.md). Kết luận công việc: [REFERENCE_CHECKLIST.md](../../REFERENCE_CHECKLIST.md).

## Bộ live được dùng

Lượt hoàn tất ghi trong [live-discovery.json](live-discovery.json), không có lỗi JavaScript được ghi nhận và không có fatal. Ảnh cùng tên có file JSON chứa text, nút và geometry:

- [Title](live-initial.png), [Oak](live-onboarding.png), [starter](live-starter.png), [thẻ starter](live-starter-card.png).
- [Sân ngay sau starter](live-adventure.png), [Progress/Adventure](live-map.png).
- [Team/PC](live-team.png), [Pokédex](live-pokedex.png).
- [Shop](live-shop.png), [Achievements](live-achievements.png), [Options](live-settings.png).
- [Day Care](live-pension.png), [Game Corner](live-casino.png).
- [Menu Raids khóa](live-raid-locked-menu.png), [menu Underground khóa](live-underground-locked-menu.png).
- [Friends chưa đăng nhập](live-friends.png), [Trades chưa đăng nhập](live-trade.png).

Black Market có button trong DOM nhưng hidden sau init, không có ảnh một màn Market đã mở. Raid/Underground chỉ có trạng thái menu khóa, chưa có nội dung sau mở khóa.

`live-before-starter` là trạng thái chuyển tiếp. `live-interrupted` và `live-starter-pending` còn lưu từ những lượt khảo sát chưa hoàn tất; **không dùng làm baseline nghiệm thu**. Video/trace cũ và các ảnh APK ở thư mục khác cũng không thay thế ảnh live mới.

Bundle, DOM và trace của lượt khảo sát nằm ở `scratch/visual-parity/reference-2026-11-14/`. Trace navigation cuối là `live-navigation.trace.zip`; trace có screenshot theo thao tác, không thay cho video timing FX.

## Bộ clone được dùng

Manifest: [clone-audit.json](clone-audit.json), kèm hash source và kết quả kiểm tra runtime các chapter.

- [Sân](clone-adventure.png), [Team/PC](clone-team.png), [Pokédex](clone-pokedex.png).
- [Modal Adventure hiện tại](clone-map.png), [thẻ bắt mới](clone-new-catch.png).
- [Click Shop](clone-shop-click.png), [click Achievements](clone-achievements-click.png), [click Settings](clone-settings-click.png): chứng minh màn còn thiếu trong phiên bản này.
- [Team mobile 390×844](clone-team-mobile.png).

Clone dùng fixture riêng và battle dừng; live có tiến triển tự động. Hai bộ có cùng viewport desktop nhưng **chưa cùng RNG, clock hay trạng thái gameplay**. Chỉ dùng R00 để phát hiện khác biệt cấu trúc, không tự tính phần trăm giống bằng ảnh này.

## Tái lập

```powershell
node scratch/visual-parity/audit-reference.mjs --screens
node scratch/visual-parity/audit-local.mjs
node scratch/visual-parity/verify-reference.mjs
```

Live cần quyền mạng. Local audit tự mở rồi đóng Vite ở 3011; dùng browser context riêng. Không nạp save người dùng. Không cần chạy toàn bộ unit/browser suite khi chỉ cập nhật tài liệu R00.
