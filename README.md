# Ôn thi TIMO lớp 1

Web học và thi thử Toán TIMO lớp 1. Không cần cài đặt: mở `index.html` bằng trình duyệt.
Hoặc chạy server tĩnh: `python3 -m http.server 8000` rồi vào http://localhost:8000.

## Tính năng
- **5 chủ đề TIMO**: Tư duy logic, Số học, Lý thuyết số, Hình học, Tổ hợp. Mỗi chủ đề có kiến thức cần nhớ, mẹo và ví dụ mẫu.
- **Luyện tập 3 cấp độ** (10 câu/lượt): chấm ngay, có lời giải, tính sao ⭐.
- **Thi thử**: 90 đề cố định (30 đề Chuẩn, 30 đề Nâng cao, 30 đề Nhanh) và đề ngẫu nhiên. Có đồng hồ đếm ngược, bảng câu hỏi, đánh dấu câu, chấm điểm, xếp huy chương và xem lại lời giải.
- **Thử thách hôm nay**, **Luyện tổng hợp**, **Tính nhẩm 60 giây**.
- **Sổ tay lỗi sai**: tự lưu câu làm sai và xóa khi làm lại đúng.
- **Tiến độ**: tỉ lệ đúng theo chủ đề, lịch sử bài thi, chuỗi ngày học.
- Bàn phím số trên màn hình (dùng tốt trên máy tính bảng), nút 🔊 đọc đề (tiếng Việt).

## Cấu trúc
- `js/generators.js`: 38 dạng bài, mỗi dạng sinh câu hỏi ngẫu nhiên theo cấp độ, kèm lời giải và hình vẽ SVG.
- `js/topics.js`: nội dung lý thuyết, cấu hình đề thi, mức huy chương.
- `js/app.js`: giao diện và điều hướng. `js/storage.js`: lưu tiến độ vào `localStorage`.

Thêm dạng bài mới: viết hàm `(R, lv) => mk({ text, answer, solution, ... })` trong `generators.js` rồi đăng ký vào `GENS`.

## Ngân hàng bài tập (JSON)
`data/questions.json` chứa toàn bộ ngân hàng bài tập và 90 đề thi cố định (trùng khớp với đề trên web):
- `questions`: mỗi câu gồm `id`, `topic`, `level`, `form` (dạng bài), `type` (`input`/`choice`), `text`, `visual` (SVG), `choices`, `answer`, `solution`.
- `exams`: mỗi đề gồm `id` (vd. `full-3`), `mode`, `minutes`, `questionIds`.

Sinh lại sau khi sửa `generators.js`: `node scripts/export-questions.js [số câu mỗi dạng/cấp, mặc định 30]`.
