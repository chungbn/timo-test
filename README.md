# Ôn thi TIMO lớp 1 – 5

Web học và thi thử Toán TIMO lớp 1 đến lớp 5: https://timo-test-268b2.web.app (Firebase Hosting). Không cần cài đặt: mở `index.html` bằng trình duyệt.
Hoặc chạy server tĩnh: `python3 -m http.server 8000` rồi vào http://localhost:8000.

## Tính năng
- **Lớp 1 – 5**: mỗi lớp có lý thuyết, dạng bài, lộ trình, đề thi và thử thách riêng theo chương trình lớp đó. Phụ huynh chọn lớp cho từng hồ sơ bé trong **Khu vực phụ huynh** (Sửa hồ sơ → *Bé đang học lớp*); chế độ khách chọn lớp ở trang **Tiến độ**. Sao, điểm thi và thống kê của từng lớp được giữ riêng nên đổi lớp qua lại không mất tiến độ.
- **5 chủ đề TIMO**: Tư duy logic, Số học, Lý thuyết số, Hình học, Tổ hợp. Mỗi chủ đề có kiến thức cần nhớ, mẹo và ví dụ mẫu.
- **Lộ trình 24 bài mỗi chủ đề** (5 câu/bài, tối đa 3 sao/bài): 4 bài *Làm quen* (rất dễ, có hình minh họa), rồi tăng chậm lên Cấp 1, 2, 3 — mỗi bài chuyển tiếp chỉ thêm 1 câu khó hơn. Chấm ngay, có lời giải.
- **Thi thử**: 90 đề cố định (30 đề Chuẩn, 30 đề Nâng cao, 30 đề Nhanh) và đề ngẫu nhiên. Có đồng hồ đếm ngược, bảng câu hỏi, đánh dấu câu, chấm điểm, xếp huy chương và xem lại lời giải.
- **Thử thách hôm nay**: hoàn thành 10 câu được thưởng **20 sao** (mỗi ngày một lần; thẻ quà hiện ngay đầu trang chủ khi chưa nhận). Sao thưởng tính vào tổng sao và bảng xếp hạng.
- **Luyện tổng hợp**, **Tính nhẩm 60 giây**.
- **Sổ tay lỗi sai**: tự lưu câu làm sai và xóa khi làm lại đúng.
- **Bảng xếp hạng**: số sao và số câu đã làm theo tuần, tháng, mọi thời điểm; kỷ lục ngày học liên tiếp (giữ lại dù chuỗi bị đứt); điểm thi cao nhất. Chỉ hiện tên gọi và con vật đại diện; phụ huynh có thể ẩn bé.
- **Tài khoản phụ huynh** (Firebase, tùy chọn): mỗi tài khoản có nhiều hồ sơ bé, tiến độ đồng bộ trên mọi thiết bị, báo cáo học tập cho phụ huynh. Không đăng nhập vẫn học được, tiến độ lưu trên trình duyệt.
- **Tiến độ**: tỉ lệ đúng theo chủ đề, lịch sử bài thi, chuỗi ngày học.
- Bàn phím số trên màn hình (dùng tốt trên máy tính bảng), nút 🔊 đọc đề (tiếng Việt).

## Cấu trúc
- `js/generators.js`: 63 dạng bài lớp 1 (4 cấp độ: Làm quen, 1, 2, 3), mỗi dạng sinh câu hỏi ngẫu nhiên theo cấp độ, kèm lời giải và hình vẽ SVG. Cuối file có `T.GH` (hàm và hình vẽ dùng chung), `T.generate`, `T.generateLesson`, `T.generateExam`.
- `js/grade2.js` ... `js/grade5.js`: nội dung lớp 2 – 5 (lý thuyết từng chủ đề, dạng bài, lộ trình), đăng ký bằng `T.addGrade(lớp, { topics, gens, lessons })`.
- `js/topics.js`: lý thuyết và lộ trình lớp 1 (`RAMP`, `LESSONS`), sổ đăng ký lớp (`T.GRADES`, `T.grade`, `T.setGrade`), khóa tiến độ theo lớp, cấu hình đề thi, mức huy chương.
- `js/app.js`: giao diện và điều hướng. `js/storage.js`: lưu tiến độ vào `localStorage`, gộp dữ liệu giữa các thiết bị.
- `js/cloud.js`: đăng nhập, hồ sơ bé, đồng bộ Firestore. `js/firebase-config.js`: cấu hình Firebase. `firestore.rules`: quy tắc bảo mật.

Thêm dạng bài mới: viết hàm `(R, lv) => mk({ text, answer, solution, ... })` trong file của lớp đó rồi đăng ký vào `gens` (lớp 1: `GENS` trong `generators.js`). Đáp án ô nhập là số tự nhiên (`12500`), số thập phân `"3,5"` (dùng `dec`) hoặc phân số tối giản `"3/4"` (dùng `frac`); lớp 4 – 5 có thêm phím `,` và `/`.

Kiểm tra nội dung sau khi sửa: `node scripts/check-grades.js [lớp ...]` (sinh thử mọi dạng × cấp độ, kiểm tra đáp án, lựa chọn, lộ trình, đề thi).

**Khóa tiến độ theo lớp**: lớp 1 giữ khóa cũ (`logic-B3`, `full-12`, thống kê `logic`); lớp 2 – 5 thêm tiền tố `g{lớp}-` (`g3-logic-B3`, `g3-full-12`, `g3-logic`). Lớp của hồ sơ bé lưu ở trường `grade` của `users/{uid}/kids/{kidId}`; chế độ khách lưu `localStorage['timo-grade']`.

## Ngân hàng bài tập (JSON)
`data/questions.json` (lớp 1) và `data/questions-lop2.json` ... `questions-lop5.json` chứa toàn bộ ngân hàng bài tập và 90 đề thi cố định của từng lớp (trùng khớp với đề trên web):
- `questions`: mỗi câu gồm `id`, `grade`, `topic`, `level`, `form` (dạng bài), `type` (`input`/`choice`), `text`, `visual` (SVG), `choices`, `answer`, `solution`.
- `exams`: mỗi đề gồm `id` (vd. `full-3`), `mode`, `minutes`, `questionIds`.

Sinh lại sau khi sửa nội dung: `node scripts/export-questions.js [số câu mỗi dạng/cấp, mặc định 30] [lớp ..., mặc định mọi lớp]`.

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
- `users/{uid}/kids/{kidId}`: tên gọi, con vật đại diện, `grade` (lớp 1 – 5), `progress` (sao, thống kê, lịch sử thi, kỷ lục, ngày học).
- `users/{uid}/kids/{kidId}/mistakes/{k}`: sổ tay lỗi sai.
- `leaderboard/{uid}_{kidId}`: bảng xếp hạng (ai cũng đọc được): tên gọi, con vật, `grade`, `allStars`, `allDone`, `bestStreak`, `bestExam` và các trường theo kỳ `ws_/wd_{năm}_{tuần}` (sao/số câu trong tuần), `ms_/md_{năm}_{tháng}`. Mỗi lần ghi là ghi đè cả bản ghi nên trường của kỳ cũ tự mất; sắp xếp dùng chỉ mục một trường tự động của Firestore, không cần tạo chỉ mục.

**Khi sửa `firestore.rules`**, nhớ dán lại vào Firebase Console → Firestore Database → Rules → Publish.

**Khu vực phụ huynh** (trang Tài khoản) được khóa bằng mã PIN 4 số: báo cáo học tập, thêm/sửa/xóa hồ sơ, **xóa dữ liệu học tập** của từng bé, đổi PIN, đăng xuất. Bé chỉ chọn được hồ sơ để học. PIN được tạo ngay sau khi phụ huynh đăng nhập; quên PIN thì xác nhận lại mật khẩu hoặc tài khoản Google để đặt PIN mới. PIN lưu dạng băm SHA-256 trong `users/{uid}.pinHash`; sai 5 lần sẽ tạm khóa 30 giây; khu vực tự khóa sau 10 phút hoặc khi bé chọn hồ sơ.

Không lưu họ tên, ngày sinh hay thông tin cá nhân của trẻ. Tiến độ được gửi lên khi hết bài, nộp bài thi, đổi hồ sơ hoặc đóng trang (câu trả lời lẻ được gộp sau 20 giây), nên nằm thoải mái trong hạn mức miễn phí.

## Triển khai lên Firebase Hosting

```
firebase deploy --only hosting --project timo-test-268b2 --account chungtb21@gmail.com
```

Cấu hình trong `firebase.json`: chỉ đưa lên các file của web (bỏ `.git`, `scripts`, README...), HTML/JS/CSS gửi kèm `Cache-Control: no-cache` để trình duyệt luôn lấy bản mới. Có thể đưa luôn quy tắc Firestore bằng `--only hosting,firestore:rules`.
