# R04.2 — Runtime 14 chương Kanto

Cập nhật 16/11/2026. Phạm vi: đường chơi Kanto, không phải nghiệm thu toàn game hoặc toàn bộ v0.5.02.

## Những gì đã nối

- Cả 14 template chính có runtime: tám Gym, Victory Road, Lorelei, Bruno, Agatha, Lance và Champion. Bốn hoạt động `special-*` chưa có adapter được khóa rõ bằng `runtimeSupported:false`.
- `chapterGenerator.ts` sinh node từ template, seed và snapshot các gift/vật phẩm lúc vào chương. Node giữ `source.chapterId/templateIndex`; không dùng route Chương 1 thay thế các chương khác.
- `chapterSelectors.ts` là đường đọc chung của Arena, timeline, Adventure, sidebar, encounter và Found here. Tổng bước lấy từ mảng đã sinh, gồm node tùy chọn; không lấy số của preview mặc định để kết thúc run.
- Dữ liệu trích bổ sung có **360 pool theo ngữ cảnh**: 40 template route × ba buổi × ba thời tiết. Encounter và tỷ lệ hiển thị dùng chung pool, kể cả trọng số Nanab và phân bố các bậc tiến hóa.
- Trainer thường dùng pool, lớp, level và luật tiến hóa của nguồn. Gym có các trainer dẫn đường, hệ, power và đội đã scale đúng ace. League có bốn đội dẫn đường riêng trước mỗi boss.
- Misty dùng **Staryu Lv.21, Psyduck Lv.22, Starmie Lv.24**. Không lấy nguyên level thấp trong raw template: native còn scale đội theo ace của chapter.
- Đã nối chọn hóa thạch, quà Pokémon, đổi hóa thạch, Silph Scope, Snorlax và Spirit Marowak/Cubone vào các node tương ứng. Đổi hóa thạch tiêu đúng một vật phẩm đã chọn; lần replay sau vẫn đổi loại hóa thạch khác được.
- Chỉ tám Gym cấp badge vật lý. Victory Road và League ghi vào `completedChapters`, dùng ảnh trainer thay badge Earth giả. Mở chương yêu cầu chương trước đã hoàn tất.
- Champion cuối cùng có trạng thái kết thúc: không tự lặp thưởng. Người chơi có thể Replay từ Adventure.
- Phần thưởng theo bảng nguồn: trainer `30 × level` rồi nhân hệ số tiền; League có hệ số tiền/EXP Kanto riêng (XP ×2,4), boss ×1,25 và hai mức replay trước/sau khi hoàn tất vùng. Không áp cùng hệ số 0,1 cho mọi lượt đánh lại League.
- Node quà ngẫu nhiên dùng trọng số ITEM_TABLE, berry mở theo số Gym trước chapter, tiền 300–1.200 trước hệ số 0,9 và năm stone Kanto. Stone đã phát hiện được đổi thành tiền theo nguồn. Bốn berry đã có cơ chế dùng đi vào inventory berry hiện tại; berry khác được giữ trong Bag để tiếp tục R06, chưa có tác dụng sử dụng.

## Tương thích và tính nhất quán

Chương 1 giữ đường 20 node đã kiểm chứng ở R03; chỉ bổ sung metadata/scene/power. Đây là ngoại lệ có chủ đích để không đổi chỉ số checkpoint của save đang chơi, chưa phải thay Chương 1 bằng generator ngẫu nhiên mới.

Save giữ nguyên `pokecatch_save_v1`, persist version 2 / saveVersion 4, marker `pokecatch_reset_20261115_02`. Không reset dữ liệu người dùng.

Trường mới `chapterRun` lưu seed, ngữ cảnh và snapshot gift/items; `completedChapters` lưu hoàn tất ngoài badge. Reload dựng lại cùng mảng node trước khi đọc currentStep. Checkpoint mới giữ source node. Checkpoint legacy Chương 1 vẫn hợp lệ; checkpoint chương cũ không chứng minh cùng source sẽ tạo lại encounter thay vì nạp nhầm trainer vào route mới. Party/PC/vật phẩm vẫn được giữ.

Gift và boss ghi `resolvedNode` cùng phần thưởng trước khi advance. Refresh không chọn lại hóa thạch đã nhận, không tiêu lại vật phẩm và không cộng lại tiền Champion.

## Nguồn và cách tái tạo

- Chapter baseline: **v0.4.103, BUILD5598c5890a**, bundle `app.c0c995f8f9.js`. Không tự nhận dữ liệu chương đã đối chiếu bản v0.5.02 mới nhất.
- Catalog: `src/data/kantoChapterReference.json`, script `scripts/extract-kanto-reference.mjs`.
- Runtime: `src/data/kantoRuntimeReference.json`, provenance/hash snapshot nằm trong JSON.
- `scripts/capture-kanto-runtime.mjs` chạy snapshot cũ trong profile nghiên cứu riêng, chặn mạng ngoài, pin BUILD; thu native pool/Gym/League/scene và các hàm dùng để kiểm tra luật.
- `scripts/extract-kanto-runtime.mjs` chuyển dữ liệu thu được thành JSON dùng trong production. Production chạy generator TypeScript của clone; không nạp app gốc.
- Backup trước sửa: `scratch/backups/r042-start-20261116.zip`.

```powershell
node scripts/capture-kanto-runtime.mjs
node scripts/extract-kanto-runtime.mjs
npm run audit:chapters -- --strict
node --test tests/kanto-runtime.test.mjs
```

Snapshot/backup thuộc `scratch/`, không đi theo Git. Khi đổi máy cần khôi phục nguồn đúng manifest/hash; dữ liệu production và report phải được giữ.

## Kiểm tra và giới hạn

- Strict audit đạt **0 vấn đề**; xem [data-audit.json](r04-evidence/data-audit.json). Không hạ validator để bỏ qua chương sai.
- Bộ test Kanto mới: 14 chương × 100 seed; toàn bộ 360 context; điều kiện mở; gift/trade và reload; đi tới Misty ở ×1/×2/×3; đi tiếp đến Champion và reload trạng thái kết thúc; profile/starter; payout, XP League và từng loại loot/gate/asset.
- Browser đã kiểm tra scene/pool/timeline Chương 2, reload, chọn hóa thạch, intro/tung Pokémon/đánh Misty và mở Chương 3; cùng các nhóm Progress, panel và trainer.
- Walkthrough tự động dùng đội đã huấn luyện để kiểm tra runtime. Đó không phải bằng chứng cân bằng EXP hoặc thời gian cày tự nhiên từ starter tới League. Đội/seed nằm trong test.
- Nguồn có route League `Salle` không trả scene; adapter dùng phòng boss tương ứng. Chưa nghiệm thu video/pixel cho từng phòng League.
- Có selector cho ba loại weather; chuyển thời tiết/forecast tự động chưa được hoàn thiện trong đợt này. Chưa thêm roamer Mew, toàn bộ NPC ngẫu nhiên và các hoạt động phụ.
- Luật tiến hóa của encounter/trainer không đồng nghĩa cơ chế tiến hóa Pokémon sở hữu, Shop, TM hay vật phẩm sử dụng đã hoàn chỉnh. Các phần đó tiếp tục theo roadmap.

Kết quả tổng cuối đợt: **77/77 core**, strict audit **0 vấn đề**, build đạt (còn cảnh báo chunk JS lớn). Browser39/39 và24/24 của các nhóm hồi quy đạt; sau chỉnh payout/XP/loot chạy lại24/24 nhóm bị ảnh hưởng, gồm walkthrough Chương1×3. Chương1×1/×2 đã đạt trước chỉnh loot cuối. Không cộng các lượt có test trùng thành số ca duy nhất. Xem [verification.json](r04-evidence/verification.json) và [AI_HANDOFF.md](AI_HANDOFF.md).
