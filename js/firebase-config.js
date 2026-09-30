// Cấu hình Firebase để bật tài khoản phụ huynh và đồng bộ tiến độ.
// Lấy từ Firebase Console → Project settings → Your apps → Web app → SDK setup and configuration.
// Các giá trị này được phép công khai; dữ liệu được bảo vệ bằng Firestore Rules (file firestore.rules).
// Để null thì web chạy ở chế độ khách (chỉ lưu trên trình duyệt).
window.FIREBASE_CONFIG = window.FIREBASE_CONFIG || null;
/* Ví dụ:
window.FIREBASE_CONFIG = {
  apiKey: 'AIza...',
  authDomain: 'ten-du-an.firebaseapp.com',
  projectId: 'ten-du-an',
  storageBucket: 'ten-du-an.appspot.com',
  messagingSenderId: '1234567890',
  appId: '1:1234567890:web:abc123',
};
*/
