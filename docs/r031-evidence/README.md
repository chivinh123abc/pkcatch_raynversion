# Bằng chứng R03.1

Chrome/Playwright, 15/11/2026. Reference: snapshot live v0.4.103 từ R00, không phải APK cũ. JSON chứa fixture, HTML và số đo. Native dùng `WEATHER.force('clear')`, `DAYTIME.force('day')` chỉ trong harness.

| Viewport | Bản chuẩn | Clone | Số đo |
|---|---|---|---|
| 1440×900 | [reference-desktop.png](reference-desktop.png) | [local-desktop.png](local-desktop.png) | [native](reference-desktop.json), [clone](local-desktop.json) |
| 390×844 | [reference-mobile.png](reference-mobile.png) | [local-mobile.png](local-mobile.png) | [native](reference-mobile.json), [clone](local-mobile.json) |
| 320×740 | Chưa chụp native riêng | [local-small-mobile.png](local-small-mobile.png) | [clone](local-small-mobile.json) |
| Bag 390×844 | Chưa nghiệm thu Bag native đầy đủ | [local-bag-mobile.png](local-bag-mobile.png) | Inventory/đóng/focus kiểm tra bằng browser test |

[comparison.json](comparison.json) ghi delta clone − native. Desktop khớp khung, rail/HP/EXP, Consumables và Found here; tile Found here lệch dọc khoảng 0.8px. Mobile còn khác thứ tự community/chapter/menu và gutter; không đánh dấu khớp toàn màn.

Fixture: #4/#7/#25/#16/#10/#19, nhiều mức HP/EXP, #16 gục, #25 poison. Seen/caught cố ý chỉ chọn một phần để thể hiện cả silhouette và tile xám. Không dùng cùng enemy/route seed; ảnh này không chứng minh timing combat.

Tái tạo từ root dự án, lần lượt:

```powershell
node scratch/visual-parity/audit-battle-panels.mjs
node scratch/visual-parity/check-battle-panels.mjs
node scratch/visual-parity/compare-battle-panels.mjs
```

Sinh CSS scope: `node scratch/visual-parity/extract-panel-styles.mjs`; adapter ở `src/styles/battle-panels.css`. `reference-rules.json` ghi rule tham chiếu, không phải số đo UI thực tế.
