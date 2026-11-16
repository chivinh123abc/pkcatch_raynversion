# Cập nhật chiêu và BattleFX từ live — 16/11/2026

Đối chiếu bổ sung theo changelog người dùng: [V0_5_02_UPDATE.md](V0_5_02_UPDATE.md). Team/PC và thẻ chi tiết hiện dùng `mainMove` theo species/level, khớp1.057 mẫu native; không còn preview chiêu cố định theo hệ. Xem báo cáo đó để phân biệt các fix đã áp dụng và phần cần vùng mới/trade/raid.

Đã kiểm tra bản công khai [Poké’Catch Online](https://pokecatch-online.netlify.app/) bằng profile thử riêng, không dùng tài khoản/save người dùng. Bản quan sát: **v0.5.02**, BUILD **b05c8cc201**, bundle `app.c0081498f2.js`. [Manifest và SHA256](live-update-2026-11-16/manifest.json); [changelog mới nhất](live-update-2026-11-16/changelog-latest.json).

## Đã tích hợp

- Danh mục runtime sau khi native khởi tạo có **661 chiêu**. So với clone503 chiêu: **160 thêm**,2 bỏ (`dynamax-cannon`, `eternabeam`), các chiêu trùng khóa giữ nguyên thông số. Đếm literal ban đầu chỉ641; native còn bổ sung20 entry khi khởi tạo, vì vậy không lấy con số literal làm kết quả cuối.
- Trong160 entry thêm, **116 gây sát thương** theo `Game.movePower`,44 còn lại là chiêu trạng thái/không gây sát thương. Các chiêu này không được giả làm đòn tấn công nếu runtime chưa hỗ trợ cơ chế riêng.
- Thay standalone Canvas BattleFX bằng engine của đúng bundle mới; dùng cả animation riêng và animation theo nhóm như native. 8 khóa mới có handler riêng: Skull Bash, Solar Blade, Triple Axel, Meteor Beam, Focus Blast, Poltergeist, Jump Kick và Supercell Slam. Những chiêu mới khác dùng handler của nhóm khi native cũng làm vậy.
- Đồng bộ **learnAll hiệu lực của151 loài đang hỗ trợ**, gồm chiêu kế thừa trong họ. Không chỉ thêm chiêu vào danh mục FX mà bỏ quên battle selector. Chiêu mạnh≥100power tuân thủ mốc65/85 của v0.5.02; chiêu recharge đã bị native loại khỏi learnset cũng được loại tương ứng.
- Đồng bộ power override, multi-hit, blacklist và bảng gây status. Giữ dữ liệu chapter, bảng EXP, pool encounter và cơ chế capture hiện có; `chapterOneReference.json.moveSource` ghi nguồn mới riêng, không đánh dấu toàn bộ dữ liệu Chương1 là v0.5.02.

## Adapter và timing

Không đưa ứng dụng/bundle gốc vào production. `scripts/sync-live-moves.mjs` chỉ xuất dữ liệu đã kiểm tra cùng standalone renderer; adapter vẫn dùng `EffectTimers`, callback impact một lần và `cancel()` của clone. Script pin build và kiểm tra anchor trước khi ghi để không áp nhầm adapter lên engine tương lai.

4 FX (`burning-jealousy`, `dragon-rage`, `ominous-wind`, `silver-wind`) kết thúc mà không có marker `#barDef`. Native áp sát thương sau khi await FX. Adapter báo impact tại lúc kết thúc bình thường nếu chưa có marker, đúng một lần; không đợi watchdog. Các chiêu đã có marker vẫn trừ HP ngay tại marker.

Giữ pace1/2/2,5 và recovery/queue đã sửa trong [báo cáo nhịp đánh](BATTLE_CADENCE_REVIEW.md). Đổi tốc độ không restart request đang chạy. Không đổi save key/version/reset marker và không reset save.

## Kiểm tra và giới hạn

- Core: kiểm tra toàn661 entry,116 chiêu mới gây damage,151 learnset, level/recharge và ít nhất10 chiêu mới thực sự được battle selector chọn.
- Browser: phát lần lượt toàn116 FX mới; kiểm tra callback impact, không chờ watchdog, hủy FX rồi dùng lại canvas ở pace1/2/2,5. Báo cáo chi tiết từng chiêu: [fx-coverage.json](live-update-2026-11-16/fx-coverage.json).
- Kết quả cuối: **63/63 core**, **20/20 browser** sau sửa fallback4 FX; cả116 FX mới đều báo impact đúng một lần, không watchdog. 6 ca trainer cũng đạt trong lượt trước đó. Build thành công; vẫn có cảnh báo chunkJS>500kB.

Đây là cập nhật phần **chiêu/FX và learnset**, không phải nâng toàn bộ clone lên v0.5.02. Các thay đổi khác của live như vùng mới, raid shiny hàng ngày, trade và badge vùng mới cần phần runtime/UI tương ứng. Fix dấu đóng dialog ở live được ghi trong changelog; chưa sao chép mù CSS mới lên những màn clone đang có adapter riêng. Chưa nghiệm thu pixel của mọi frame/status/cinematic hay cơ chế riêng của tất cả chiêu trạng thái.

## Kiểm tra cập nhật nhanh, ít tốn tài nguyên

```powershell
npm run reference:check
```

Lệnh chỉ tải `boot.js`, so BUILD và ghi manifest ngắn vào `scratch/live-update-check/latest.json`. Nếu build trùng phần moves/FX đã tích hợp thì dừng, không tải bundle/ảnh/GIF. Nếu khác, chỉ cần tải bundle đổi hash, trích các section cần dùng và so dữ liệu, không đọc/in toàn bộ JS minify hay rà lại toàn bộ UI.

Snapshot lần này giữ tại `scratch/live-update-2026-11-16/`; backup trước sửa: `scratch/backups/live-moves-20261116.zip`. Tái tạo cùng build bằng `node scripts/sync-live-moves.mjs`; build khác phải rà adapter trước.
