# Liar's Deck — The Last Call

Play online: https://vltruong01.github.io/liars-deck-referee/

Source: https://github.com/vltruong01/liars-deck-referee


Game trọng tài offline dành cho nhóm chơi Liar's Deck bằng bài thật. Vanilla JavaScript, CSS, SVG gốc, GSAP và Web Audio; không cần tài khoản hay máy chủ.

## Chơi ngay trên Windows

1. Mở thư mục `dist`.
2. Nhấp đúp **PLAY.cmd**, hoặc mở **Liars-Deck.html** bằng Chrome, Edge hay Firefox.
3. Chọn 2–4 người, nhập tên và dùng mũi tên để chọn một trong sáu nhân vật.
4. Bấm **START GAME**. Chơi bài thật; ai thua lượt thì chọn nhân vật đó rồi bấm **FIRE**.
5. Người sống cuối cùng thắng. **Manage players** sửa tên/reset từng người; **New match** trở lại chọn người; **Play again** giữ nhóm và nạp mới tất cả ổ đạn.

Không cần Internet, Node, npm hoặc cài đặt phần mềm để chơi. Có thể chỉ gửi một file `dist/Liars-Deck.html` cho bạn bè. `dist/index.html` là cùng bản game để dùng trên máy chủ tĩnh nếu muốn.

Nút bánh răng chỉnh âm lượng, giảm chớp sáng và giảm chuyển động. Nút khung vuông bật/tắt toàn màn hình nếu trình duyệt hỗ trợ. Âm thanh được tạo trên máy sau thao tác đầu tiên. Giao diện bằng tiếng Anh. Dùng Tab/Enter để điều khiển; Escape hủy chọn nhân vật trước khi bắn. Đang bắn thì không thể hủy.

## Lưu tiến độ và luật ổ đạn

Mỗi người có sáu buồng với đúng một viên đạn, chọn bằng `crypto.getRandomValues` và rejection sampling để loại bỏ sai lệch modulo. Mỗi lần bóp cò tiến đúng một buồng, không đảo lại sau phát trống. Nếu năm phát đầu trống thì phát thứ sáu chắc chắn loại người chơi.

Tên, skin, vị trí đạn, số phát và người bị loại được lưu trong localStorage. Kết quả được lưu **trước** hoạt cảnh. Tải lại giữa phát bắn sẽ hiện kết quả đã lưu, không bắn thêm. Trò chơi chặn bấm lặp và chặn bắn người đã bị loại/người thắng cuối cùng. Sửa tên không thay đổi ổ đạn. Reset luôn cần xác nhận.

Để tiếp tục ván cũ, dùng **cùng trình duyệt, profile và vị trí file**. Chỉ dùng một tab cho mỗi ván. Đổi tên/di chuyển file, mở bản index.html thay thế hoặc xóa dữ liệu trình duyệt có thể tạo vùng lưu trữ khác. Một số chế độ riêng tư chặn/xóa lưu trữ. Lỗi lưu sẽ báo rõ và không cho âm thầm tiếp tục; save hỏng được giữ nguyên cho tới khi bạn xác nhận thay thế.

## Điện thoại

Xoay điện thoại **ngang** để chơi. Màn hình dọc hiện hướng dẫn xoay máy và giữ tiến độ. Setup, bàn chơi và cảnh FIRE đều vừa một viewport ngang; không cần cuộn trang. Chuyển file HTML sang thiết bị và mở bằng trình duyệt hỗ trợ JavaScript cho file cục bộ. Một số trình xem file/Quick Look trên điện thoại chỉ xem trước và không chạy JavaScript; khi đó cần mở qua trình duyệt hoặc một máy chủ tĩnh trong mạng nội bộ. Đã kiểm thử Chromium ở 8 kích thước; chưa thử trên điện thoại thật.

## Phát triển

Yêu cầu Node.js 22.14+ và npm. Trong thư mục dự án:

```sh
npm ci
npm test
npm run build
npm run test:browser
npm run dev
```

Preview tại `http://127.0.0.1:4173`. Sau khi sửa mã nguồn, chạy build lại rồi tải lại trình duyệt. Bản phát hành vẫn mở trực tiếp từ đĩa, không cần chạy dev server.

Playwright dùng Google Chrome đã cài trên máy (`channel: chrome`). agent-browser dùng Chrome for Testing riêng; đã cài bằng `agent-browser install`. `node scripts/inspect-ui.mjs` chụp bàn chơi/cảnh FIRE ở bốn kích thước qua agent-browser. Ảnh và báo cáo nằm trong `docs/`. Các công cụ này chỉ phục vụ phát triển, không cần để chơi.

`src/engine.js`: luật và lưu trữ; `src/app.js`: giao diện/cinematic; `src/art.js`: SVG gốc; `src/audio.js`: âm thanh tổng hợp; `src/style.css`: responsive. `scripts/build.mjs` nhúng GSAP, JS và CSS vào HTML tự chứa. Các bộ đếm không hiển thị vị trí đạn.

## Đặc tả và kiểm thử

OpenSpec changes: `liars-deck-offline-referee`, `mobile-landscape-ui`; các artifact proposal, design, specs và tasks được lưu trong `openspec/changes/archive` khi hoàn tất. Đặc tả chính nằm trong `openspec/specs`. Xem [báo cáo UI và ảnh trước/sau](docs/UI-REDESIGN.md).

Xem `VERIFICATION.md` để biết kết quả kiểm thử và giới hạn xác minh. Vitest kiểm tra phân bố đều, cả sáu vị trí đạn, độc lập người chơi, bấm lặp, loại người chơi, reset, sửa tên, lỗi lưu và tải lại giữa phát bắn. Không dùng thống kê ngẫu nhiên dễ thất bại: test kiểm tra ánh xạ và rejection sampling bằng mẫu xác định.

## Tài sản và thư viện

Toàn bộ hình phòng, nhân vật, súng và hiệu ứng âm thanh là mã gốc. Kho Simsz/russian-roulette chỉ được đọc tham khảo bên ngoài source tree, không sao chép code/tài sản/thuật toán có trọng số. Xem `THIRD-PARTY-NOTICES.md` và thông báo bản quyền GSAP trong bundle. Không có CDN, font từ xa, tracking hay runtime fetch.


Latest executed tool/browser audit: [docs/QA_AUDIT.md](docs/QA_AUDIT.md). Includes the 44px management-field correction, final 36/36 Vitest and 10/10 Playwright results, four-state visual review at four sizes, retained trace and deployment blockers.


Mobile character studio: per-player hats, eyewear, mouth accessories, suit/tie palettes and bow ties. Open Customize during setup or Style in Manage Players; cosmetic edits keep revolver progress. See [mobile QA and screenshots](docs/MOBILE_QA_REPORT.md).


Cinematic polish: two rear seats plus one at each table end, three outfit silhouettes and articulated execution. Use **New Match ? Edit current players** to change the ongoing group without losing progress. See [current cinematic QA](docs/CINEMATIC_QA_REPORT.md).

Execution correction: shared two-arm SVG rig, compact SHOT/DIED HUD, 2.85-second suspense, centered customized red-X reveal and stable automatic camera return. See [execution QA](docs/EXECUTION_QA_REPORT.md).
