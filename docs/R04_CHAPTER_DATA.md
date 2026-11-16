# R04 — Chuẩn hóa dữ liệu chapter

Ngày bắt đầu: **15/11/2026**. Nội dung dưới đây là báo cáo giai đoạn R04.1. **Cập nhật 16/11: R04.2 đã nối 14 chương chính vào runtime; strict audit đạt 0 vấn đề.** Xem [R04_2_KANTO_RUNTIME.md](R04_2_KANTO_RUNTIME.md) cho trạng thái hiện tại và các giới hạn. Các con số 32 vấn đề bên dưới là lịch sử trước khi sửa.

## R04.1 — Catalog và validator đã có

- `src/data/kantoChapterReference.json`: export **14 template Kanto** từ snapshot namespace của baseline live v0.4.103 / BUILD5598c5890a. Có tám gym, Victory Road và năm chapter League. Không gộp Elite Four/Champion vào Victory Road. Các vùng chưa được công bố mở không được bật thêm.
- Provenance ghi bundle, đường dẫn snapshot và SHA-256 của snapshot. Tái tạo bằng `node scripts/extract-kanto-reference.mjs`. Chỉ xuất dữ liệu JSON; không chạy bundle gốc trong production.
- `src/game/data/chapterCatalog.ts`: kiểu template/native step, kiểm tra schema và nguồn, ID/source index duy nhất, phạm vi species, cấp độ, khoảng level, số encounter, đội boss, reward, gift/static, node kind và chuỗi mở chapter. `getChapterTemplate` báo lỗi khi không có ID, không trả Chương 1 thay thế.
- `auditRuntimeChapters` kiểm tra dữ liệu hiện đang chạy riêng với template: tổng bước, số thứ tự, trainer, route dùng lại (cả bản sao mảng), boss khác bản chuẩn và chapter native chưa có adapter.
- **Catalog chưa nối vào runtime hoặc UI.** Các template chứa gift/static/unlock/trade và thông số generator; không ép thành các grass node giả để mở chương cho có. Tổng template step không phải tổng node sau generator có yếu tố ngẫu nhiên.

## Kết quả rà runtime hiện tại

Chạy `npm run audit:chapters`; xem [data-audit.json](r04-evidence/data-audit.json).

| Nhóm chưa đạt | Số điểm |
|---|---:|
| Tổng bước khác độ dài mảng node | 10 |
| Boss sprite/team khác template chuẩn | 8 |
| Dùng lại cùng đường đi chapter khác | 9 |
| Chapter League chưa có runtime adapter | 5 |
| Tổng | 32 |

Đây là các vấn đề tồn tại trong dữ liệu legacy được phát hiện, chưa phải lỗi mới do chuyển generator: R04.1 chưa thay gameplay. Một chapter có thể có nhiều điểm chưa đạt. Bốn hoạt động `special-*` chưa có template chứng minh trong catalog 14 chapter chính và vẫn cần khảo sát nguồn hoạt động riêng.

`audit:chapters` mặc định xuất báo cáo và kết thúc thành công nếu công cụ chạy được; `npm run audit:chapters -- --strict` là cổng nghiệm thu dữ liệu runtime, **hiện sẽ thất bại** vì 32 điểm trên. Validator catalog không hạ chuẩn để che lỗi runtime.

## Phần tiếp theo của R04

1. **R04.2:** Adapter/generator với RNG và context rõ ràng; mỗi node giữ nguồn template, pool, scene, trainer và reward riêng. Giữ tương thích Chương 1 đã kiểm chứng và save đang có. Tổng bước lấy từ node được sinh, không từ số cứng.
2. Đưa Arena, Found here và Adventure về cùng selector; trích đủ pool/điều kiện và trainer generator cho từng vùng Kanto. Hiện catalog chỉ chứa tham chiếu area, không tự chứng minh pool runtime đã đủ.
3. Triển khai gift/static/unlock/trade cần thiết cho đường đi; nối League và reward một lần, không mở chapter khi chưa có đường đi hợp lệ. Cơ chế vật phẩm/tiến hóa đầy đủ tiếp tục phối hợp R05/R06.
4. Đối chiếu replay, checkpoint/refresh, unlock và dữ liệu asset/species; cho strict audit đạt rồi mới nghiệm thu toàn R04.

## Kiểm tra giai đoạn này

- `npm test`: **52/52** (48 ca cũ + 4 ca catalog/audit). Ca mới cố ý làm hỏng species, level, boss, node kind, unlock, array reuse và count để kiểm tra validator bắt được lỗi.
- Sau chỉnh audit boss/route-copy cuối: chạy lại riêng **4/4** ca data.
- Lỗi hai Poké Ball ở Found here đã sửa: giữ pseudo-element 16px từ CSS chuẩn, bỏ ảnh `.zone-owned` vẽ trùng; nhãn accessible vẫn ghi `caught`. Browser panel **7/7** và ảnh R03.1 đã cập nhật.
- Build thành công; chunk JS >500kB là cảnh báo cũ. Catalog chưa import vào ứng dụng, không làm tăng production bundle.
- Không reset save, không đổi key/version/marker. Backup trước R04: `scratch/backups/r04-start-code-2026-11-15.zip`.
