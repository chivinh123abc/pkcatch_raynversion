# Bằng chứng R03 — 15/11/2026

- `reference-mechanics.json`: config, Chương 1, route đã build và bảng EXP đọc từ bundle chuẩn v0.4.103 / BUILD5598c5890a trong profile thử cô lập.
- `reference-timing.json`, `local-timing.json`: số đo cùng fixture sân 710×400 cho Tackle, Scratch, Fire Spin ở x1/x2/x3.
- [Video move bản chuẩn](reference-moves-x1-x2-x3.webm) và [video move clone](local-moves-x1-x2-x3.webm): fixture kỹ thuật dùng cùng sprite và geometry, không phải video hành trình từ save mới.
- `chapter-x1.webm`, `chapter-x2.webm`, `chapter-x3.webm`: video walkthrough native; JSON và ảnh `*-complete.png` tương ứng ghi kết quả cuối.

Video walkthrough dùng đội **Squirtle/Butterfree/Pikachu Lv.20** để kiểm tra toàn pipeline FX trong thời gian hữu hạn. Không ép HP/sát thương/KO/completion, không Skip hồi máu. Fixture được ghi rõ trong JSON từng video. Các bài core `tests/gameplay-runtime.test.mjs` mới là bài từ save mới Lv.5 với clock/RNG cố định, không cấp đội Lv.20.

Các thư mục `reference-video/` và `local-video/` chứa bản ghi thô từ lần đo. Không coi số đo ba move hay một fixture là bằng chứng mọi move/cơ chế đã giống hoàn toàn. Xem phạm vi và giới hạn tại [R03_CHAPTER_1.md](../R03_CHAPTER_1.md).
