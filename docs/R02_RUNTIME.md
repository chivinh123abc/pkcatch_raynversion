# R02 — Runtime chiến đấu, capture và reward

Ngày: **15/11/2026**. Phạm vi: tách điều phối khỏi store/UI và giữ hành vi hiện có. Bản chuẩn giao diện tiếp tục là live v0.4.103 / BUILD `5598c5890a` đã ghi ở R00.

## Cấu trúc sau thay đổi

| Thành phần | Trách nhiệm |
|---|---|
| `src/game/runtime/GameplayRuntime.ts` | Vòng đời encounter, phase, operation ID, timer, watchdog, reward ledger, clock/RNG có thể inject |
| `src/game/runtime/gameLoop.ts` | Nhịp combat và nhịp thời gian thực của buff; cleanup khi App unmount |
| `src/game/domain/` | Kiểu state, tạo instance, công thức damage/EXP và chọn Pokémon khỏe |
| `src/game/systems/battle.ts` | Lượt đánh, điểm chạm, KO, thay Pokémon của trainer/đồng đội, thất bại |
| `src/game/systems/capture.ts` | Chốt kết quả bắt, yêu cầu animation, cấp Pokémon/EXP, chờ Continue |
| `src/game/systems/rewards.ts` | Cấp EXP khi KO, thưởng trainer/huy hiệu và quà tại node item qua ledger |
| `src/game/systems/encounter.ts` | Tải node, intro, Pokémon Center và chuyển bước |
| `src/game/presentation/useArenaEffects.ts` | Nối yêu cầu state với các engine FX; báo impact/completion bằng key |
| `src/game/presentation/EffectTimers.ts`, `effectLayer.ts` | Hủy callback native BattleFX; cô lập lớp capture/heal/item khi bỏ encounter |
| `src/store/useGameStore.ts` | Ghép hệ thống, inventory/collection và save/load tương thích |
| `src/components/Arena.tsx` | Layout, sprite, thanh HP/log, thời tiết và scene transition |

## Quy tắc runtime

- Mỗi store tạo một `GameplayRuntime` riêng. Không còn timer, khóa lượt hoặc callback kết quả dùng chung ở cấp module của store.
- `loadStepNode` mở encounter mới. Toàn bộ job cũ bị hủy; callback đã vào hàng đợi vẫn phải qua kiểm tra encounter ID.
- Runtime chỉ cho một operation combat hoặc capture tồn tại cùng lúc. Mỗi operation có key tăng dần, không tái sử dụng khi đổi node.
- Renderer báo điểm chạm để trừ HP. Báo impact/finish lặp không trừ HP lần hai. Nếu renderer không hoàn tất, watchdog giúp tiếp tục; watchdog cũng phải qua kiểm tra key.
- Ledger tách các loại thưởng `ko:<uid>`, `capture:<uid>`, `trainer:<uid>`, `item:<id>`. Cùng loại/cùng ID chỉ commit một lần trong encounter. KO và capture vẫn là hai loại EXP riêng theo hành vi cũ.
- Phase là nguồn điều phối (`encounter.phase`): `battle`, `attack`, `faint`, `capture`, `reward`, `awaiting-continue`, `recall`, `heal`, `item`, `intro`, `transition`. Các cờ cũ như `catchPhase` và `allyRecalling` tiếp tục dùng làm adapter cho JSX/FX; chưa đổi API action mà các màn đang sử dụng.
- Pokémon HP=0 không được đánh hoặc phản đòn. Cả đội gục chuyển qua Center, hồi xong mới về bước 1. Pokémon mới chờ người dùng Continue; gọi Continue lặp không nhảy hai node.

## Thời gian và đổi tốc độ

Battle/Capture/Heal/Item chốt tốc độ khi bắt đầu hiệu ứng. Đổi x1/x2/x3 không thay key, không remount sân và không phát lại hiệu ứng đang chạy. Hiệu ứng tiếp theo dùng tốc độ mới. Đây là chính sách của đợt R02 để giữ liền mạch; timing của toàn bộ move và hành vi đổi tốc độ của live vẫn cần đối chiếu bằng video ở R03/R10.

Buff dùng số giây thực đã trôi qua. Nếu callback bị trì hoãn do tab nền, lần chạy sau trừ số giây đã qua thay vì chỉ trừ một giây. Combat không phát lại hàng loạt đòn để bù thời gian bị treo. Autosave giữ chu kỳ thực 15 giây. Thời gian đóng hẳn trình duyệt và migration theo timestamp thuộc R06.

Native BattleFX có timer riêng, nên `cancel()` cũng hủy các callback trì hoãn của engine. Capture/heal/item dùng lớp DOM riêng cho từng lần chạy; callback particle đến muộn chỉ còn tham chiếu lớp đã tháo. Adapter bỏ qua completion của lần chạy đã cleanup. Không thay RNG của particle bằng RNG gameplay.

## Kiểm tra và cách chạy

```powershell
npm test
npm run build
node scratch/visual-parity/run-browser-checks.mjs
```

Kiểm thử store/runtime hiện có **33 ca đạt**: giữ 16 ca cũ và thêm 17 ca cho timer/epoch, callback lặp và reentrant, watchdog, ledger, clock/RNG cố định, nhiều store độc lập, speed snapshot, KO, capture bị hủy, Continue, thay Pokémon trainer, thưởng trainer, item và thất bại/hồi phục.

Bộ browser mở rộng từ 19 lên **23/23 ca đạt**, bổ sung đổi tốc độ giữa move/capture/heal, chuyển Team/PC trong capture, Skip và hủy encounter giữa capture. Toàn bộ bộ kiểm tra được chạy lại sau thay đổi adapter/engine cuối. Build thành công.

Build vẫn có cảnh báo bundle trên 500 kB như trước; chưa thực hiện code splitting trong R02.

## Save và giới hạn

- Giữ khóa `pokecatch_save_v1`, `version: 2`, `saveVersion: 4`, preset UID, thứ tự PC, NEW đã xem và autosave. Không lưu timer/callback/runtime vào save. Load game dựng encounter mới như trước.
- Backup trước sửa: `scratch/backups/r02-code-2026-11-15.zip`.
- Không đổi công thức damage/EXP, tỉ lệ bắt, bảng berry, dữ liệu chapter hoặc số loài. EXP gia đình/duplicate, status và nhiều chapter dùng lại dữ liệu cũ vẫn cần R03–R06.
- R02 không chứng minh toàn game giống 90–100%, không mở các tính năng khóa và không thay thế nghiệm thu video x1/x2/x3 của vòng Chương 1.

**Tiếp theo: R03 — hoàn chỉnh và đối chiếu vòng Chương 1 từ starter đến Brock**, dùng clock/RNG và event history vừa tách để tái hiện lỗi.
