# Quy tắc làm việc cho AI — Poké’Catch Clone

## Bắt đầu và bàn giao

- Đọc [AI_HANDOFF.md](docs/AI_HANDOFF.md), rồi chỉ mở báo cáo liên quan. Yêu cầu mới nhất của người dùng quyết định ưu tiên; không tự chuyển milestone.
- Xem `git status --short` và diff đúng file; giữ công việc ngoài phạm vi. Không tự reset save, checkout đè file, dọn asset hoặc mở vùng mới.
- Nhật ký trước lần tách tài liệu16/11/2026 được giữ nguyên trong [PROJECT_HISTORY.md](docs/PROJECT_HISTORY.md). Chỉ tra mục cần thiết; các tuyên bố “100%” lịch sử không phải nghiệm thu hiện tại.
- Kết thúc: cập nhật **AI_HANDOFF.md** và báo cáo chuyên đề với thay đổi, nguồn/hash, kiểm tra, giới hạn, bước tiếp. Không nối nhật ký dài vào file này hoặc lưu nguyên log/suy nghĩ.

## Tiết kiệm token và thời gian

- Dùng `rg --files`, `rg -n` trong thư mục liên quan. Không quét `node_modules`, `dist`, `resources`, `thamkhao`, `scratch` khi chưa cần.
- Không in toàn bộ bundle/minified JS, font base64, JSON lớn/generated CSS. `Get-Content -TotalCount` vẫn có thể in một dòng minify rất lớn: dùng parser/script xuất **key, count, diff, hash hoặc đoạn giới hạn ký tự**.
- Bắt đầu bằng giả thuyết và ca tái hiện; đọc đúng hàm/section. Đọc song song phần độc lập, sửa theo phụ thuộc. Không đọc lại file vừa đọc nếu chưa đổi.
- Tái sử dụng manifest/ảnh/snapshot; chỉ xem trạng thái cần so, không dựng lại toàn baseline cho lỗi nhỏ.
- Chỉ kiểm tra live khi tác vụ cần bản mới hoặc người dùng yêu cầu: `npm run reference:check`. Build trùng moves/FX thì không tải lại bundle/asset cho phần này; **không suy ra UI/chapter đã đồng bộ**.
- Build khác: chỉ tải file đổi hash, trích section và so cấu trúc. Không tự nhập mọi thay đổi của live ngoài phạm vi được giao.
- Kiểm tra theo bảng ở handoff. Chỉ mở rộng/chạy lại khi sửa mới, lỗi mới hoặc nghi vấn chưa giải quyết. Chỉ sửa tài liệu: kiểm tra link/nội dung, không chạy build/browser.
- In tóm tắt lỗi và đường dẫn log, không lặp nguyên log. Báo tiến độ ngắn khi có kết quả mới; không hỏi lại việc đã được phép.
- Tiết kiệm bằng giảm đọc/tải/kiểm tra trùng; vẫn hoàn tất phần được giao và kiểm chứng cần thiết. Không tự đặt giới hạn token cứng hoặc giảm độ chính xác.

## Các điều phải giữ

- Game React/TypeScript chạy client độc lập. Không đưa app gốc, iframe/proxy vào production; snapshot chỉ để đối chiếu/trích dữ liệu và renderer có adapter.
- Save: `pokecatch_save_v1`, persist version2/saveVersion4. Không đổi marker reset hoặc làm mất party/PC/preset/NEW ngoài yêu cầu.
- Nút1/2/3 tương ứng pace1/2/**2,5**. Mỗi actor có recovery rồi chờ325/pace; không chỉ chờ một lần cho cả cặp đòn. Xem [nhịp chiến đấu](docs/BATTLE_CADENCE_REVIEW.md).
- HP trừ tại impact, KO không phản công, callback/reward một lần. Đổi encounter hủy callback cũ; đổi tốc độ/mở collection không restart FX; giữ Arena mounted.
- Sprite nhỏ/sân dùng resolver PNG crop, rail1×/2×. Artwork dùng GIF Gen5ani người dùng qua `npm run assets:sync`; không phục hồi `ani*` cũ hoặc hardcode file từng loài.
- CSS sinh tự động sửa qua script/adapter. `sync-live-moves.mjs` pin build: không bỏ guard để ép chạy engine mới.
- Chưa có bằng chứng thì ghi “chưa xác minh”; không tự ghi toàn game giống90–100%.

## Công cụ trên Windows

- PowerShell: dùng đường dẫn literal; tránh ghép shell chứa code/data chưa escape. Ghi tiếng Việt bằng công cụ hỗ trợ UTF-8; tránh pipe qua tiến trình dùng encoding mặc định làm mất dấu.
- Không trộn shell khi xóa/di chuyển; xác minh đích trong workspace trước thao tác đệ quy.
- Browser: `node scratch/visual-parity/run-browser-checks.mjs <spec...>` nếu runner còn. Không sửa `src` khi browser/audit chạy vì HMR làm sai kết quả; không dừng server/Chrome không do mình tạo.
- `scratch/` bị Git ignore: kiểm tra runner/snapshot tồn tại trước khi dùng. Giữ nguồn/hash trong `docs` hoặc metadata để khôi phục khi đổi máy.
