# Ôn thi TIMO lớp 1

Web học và thi thử Toán TIMO lớp 1. Không cần cài đặt: mở `index.html` bằng trình duyệt.
Hoặc chạy server tĩnh: `python3 -m http.server 8000` rồi vào http://localhost:8000.

## Tính năng
- **5 chủ đề TIMO**: Tư duy logic, Số học, Lý thuyết số, Hình học, Tổ hợp. Mỗi chủ đề có kiến thức cần nhớ, mẹo và ví dụ mẫu.
- **Lộ trình 12 bài mỗi chủ đề** (5 câu/bài, tối đa 3 sao/bài): bắt đầu từ mức *Làm quen* (rất dễ, có hình minh họa) rồi tăng dần lên Cấp 1, 2, 3. Chấm ngay, có lời giải.
- **Thi thử**: 90 đề cố định (30 đề Chuẩn, 30 đề Nâng cao, 30 đề Nhanh) và đề ngẫu nhiên. Có đồng hồ đếm ngược, bảng câu hỏi, đánh dấu câu, chấm điểm, xếp huy chương và xem lại lời giải.
- **Thử thách hôm nay**, **Luyện tổng hợp**, **Tính nhẩm 60 giây**.
- **Sổ tay lỗi sai**: tự lưu câu làm sai và xóa khi làm lại đúng.
- **Tài khoản phụ huynh** (Firebase, tùy chọn): mỗi tài khoản có nhiều hồ sơ bé, tiến độ đồng bộ trên mọi thiết bị, báo cáo học tập cho phụ huynh. Không đăng nhập vẫn học được, tiến độ lưu trên trình duyệt.
- **Tiến độ**: tỉ lệ đúng theo chủ đề, lịch sử bài thi, chuỗi ngày học.
- Bàn phím số trên màn hình (dùng tốt trên máy tính bảng), nút 🔊 đọc đề (tiếng Việt).

## Cấu trúc
- `js/generators.js`: 63 dạng bài (4 cấp độ: Làm quen, 1, 2, 3), mỗi dạng sinh câu hỏi ngẫu nhiên theo cấp độ, kèm lời giải và hình vẽ SVG.
- `js/topics.js`: nội dung lý thuyết, lộ trình bài học (`RAMP`, `LESSONS`), cấu hình đề thi, mức huy chương.
- `js/app.js`: giao diện và điều hướng. `js/storage.js`: lưu tiến độ vào `localStorage`, gộp dữ liệu giữa các thiết bị.
- `js/cloud.js`: đăng nhập, hồ sơ bé, đồng bộ Firestore. `js/firebase-config.js`: cấu hình Firebase. `firestore.rules`: quy tắc bảo mật.

Thêm dạng bài mới: viết hàm `(R, lv) => mk({ text, answer, solution, ... })` trong `generators.js` rồi đăng ký vào `GENS`.

## Ngân hàng bài tập (JSON)
`data/questions.json` chứa toàn bộ ngân hàng bài tập và 90 đề thi cố định (trùng khớp với đề trên web):
- `questions`: mỗi câu gồm `id`, `topic`, `level`, `form` (dạng bài), `type` (`input`/`choice`), `text`, `visual` (SVG), `choices`, `answer`, `solution`.
- `exams`: mỗi đề gồm `id` (vd. `full-3`), `mode`, `minutes`, `questionIds`.

Sinh lại sau khi sửa `generators.js`: `node scripts/export-questions.js [số câu mỗi dạng/cấp, mặc định 30]`.

## Bật tài khoản phụ huynh (Firebase)

Làm một lần, khoảng 15 phút, miễn phí (gói Spark):

1. Vào https://console.firebase.google.com → **Add project** (có thể tắt Google Analytics).
2. **Build → Authentication → Get started → Sign-in method**: bật **Google** và **Email/Password**.
3. **Authentication → Settings → Authorized domains → Add domain**: thêm `chungbn.github.io` (`localhost` có sẵn).
4. **Build → Firestore Database → Create database**: chọn vị trí `asia-southeast1 (Singapore)`, chế độ **Production**.
5. **Firestore Database → Rules**: dán toàn bộ nội dung file `firestore.rules` → **Publish**.
6. **Project settings (⚙️) → Your apps → Web (`</>`)**: đặt tên app, sao chép đoạn `firebaseConfig` và dán vào `js/firebase-config.js` (thay `null` bằng đối tượng cấu hình). Các giá trị này được phép công khai.
7. Commit và push; GitHub Pages sẽ cập nhật.

Chạy thử trên máy: dùng `python3 -m http.server 8000` rồi mở http://localhost:8000 (đăng nhập Google không hoạt động khi mở file trực tiếp bằng `file://`).

Dữ liệu trên Firestore:
- `users/{uid}`: email phụ huynh.
- `users/{uid}/kids/{kidId}`: tên gọi, con vật đại diện, `progress` (sao, thống kê, lịch sử thi, kỷ lục, ngày học).
- `users/{uid}/kids/{kidId}/mistakes/{k}`: sổ tay lỗi sai.

**Khu vực phụ huynh** (trang Tài khoản) được khóa bằng mã PIN 4 số: báo cáo học tập, thêm/sửa/xóa hồ sơ, **xóa dữ liệu học tập** của từng bé, đổi PIN, đăng xuất. Bé chỉ chọn được hồ sơ để học. PIN được tạo ngay sau khi phụ huynh đăng nhập; quên PIN thì xác nhận lại mật khẩu hoặc tài khoản Google để đặt PIN mới. PIN lưu dạng băm SHA-256 trong `users/{uid}.pinHash`; sai 5 lần sẽ tạm khóa 30 giây; khu vực tự khóa sau 10 phút hoặc khi bé chọn hồ sơ.

Không lưu họ tên, ngày sinh hay thông tin cá nhân của trẻ. Tiến độ được gửi lên khi hết bài, nộp bài thi, đổi hồ sơ hoặc đóng trang (câu trả lời lẻ được gộp sau 20 giây), nên nằm thoải mái trong hạn mức miễn phí.
