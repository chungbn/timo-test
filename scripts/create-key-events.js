// Tạo Key Events và custom dimensions/metrics trong GA4 (Google Analytics Admin API v1beta).
// Chạy lại nhiều lần được: mục nào đã có thì bỏ qua.
//
// Cần: PROPERTY_ID (GA4 → Admin → Property details, dãy số) và ACCESS_TOKEN có quyền
// https://www.googleapis.com/auth/analytics.edit, ví dụ:
//   gcloud auth application-default login --scopes=https://www.googleapis.com/auth/analytics.edit,https://www.googleapis.com/auth/cloud-platform
//   ACCESS_TOKEN=$(gcloud auth application-default print-access-token) PROPERTY_ID=123456789 node scripts/create-key-events.js
// (hoặc lấy token ở https://developers.google.com/oauthplayground với scope analytics.edit)
const { PROPERTY_ID, ACCESS_TOKEN } = process.env;
if (!PROPERTY_ID || !ACCESS_TOKEN) { console.error('Thiếu PROPERTY_ID hoặc ACCESS_TOKEN (xem đầu file).'); process.exit(1); }

global.window = global;
window.T = { grade: 1 };
require('../js/analytics.js');
const KEY_EVENTS = window.T.Analytics.KEY_EVENTS;

// Tham số sự kiện cần đăng ký để xem được trong báo cáo GA4
const DIMENSIONS = [
  ['grade', 'Lớp', 'EVENT'], ['topic', 'Chủ đề', 'EVENT'], ['session_type', 'Loại phiên luyện', 'EVENT'],
  ['lesson', 'Bài số', 'EVENT'], ['lesson_name', 'Tên bài', 'EVENT'], ['level', 'Cấp độ câu hỏi', 'EVENT'],
  ['form', 'Dạng bài', 'EVENT'], ['exam_mode', 'Loại đề thi', 'EVENT'], ['exam_no', 'Đề số', 'EVENT'],
  ['medal', 'Huy chương', 'EVENT'], ['source', 'Nguồn', 'EVENT'], ['period', 'Kỳ xếp hạng', 'EVENT'],
  ['metric', 'Chỉ số xếp hạng', 'EVENT'], ['content', 'Nội dung đọc', 'EVENT'], ['from_grade', 'Lớp trước khi đổi', 'EVENT'],
  ['grade', 'Lớp đang học (người dùng)', 'USER'], ['account_type', 'Loại tài khoản', 'USER'], ['kid_profiles', 'Số hồ sơ bé', 'USER'],
];
const METRICS = [
  ['score', 'Điểm', 'STANDARD'], ['stars', 'Số sao bài học', 'STANDARD'], ['correct', 'Số câu đúng', 'STANDARD'],
  ['total', 'Tổng số câu', 'STANDARD'], ['duration_sec', 'Thời gian làm bài', 'SECONDS'],
];

const base = `https://analyticsadmin.googleapis.com/v1beta/properties/${PROPERTY_ID}`;
async function api(method, path, body) {
  const r = await fetch(base + path, { method, headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) throw new Error(`${method} ${path}: ${j.error ? j.error.message : r.status}`);
  return j;
}

(async () => {
  const have = (await api('GET', '/keyEvents?pageSize=200')).keyEvents || [];
  for (const eventName of KEY_EVENTS) {
    if (have.some(k => k.eventName === eventName)) { console.log(`= Key Event ${eventName} (đã có)`); continue; }
    await api('POST', '/keyEvents', { eventName, countingMethod: 'ONCE_PER_EVENT' });
    console.log(`+ Key Event ${eventName}`);
  }
  const dims = (await api('GET', '/customDimensions?pageSize=200')).customDimensions || [];
  for (const [parameterName, displayName, scope] of DIMENSIONS) {
    if (dims.some(d => d.parameterName === parameterName && d.scope === scope)) { console.log(`= Dimension ${parameterName} (${scope}, đã có)`); continue; }
    await api('POST', '/customDimensions', { parameterName, displayName, scope });
    console.log(`+ Dimension ${parameterName} (${scope})`);
  }
  const mets = (await api('GET', '/customMetrics?pageSize=200')).customMetrics || [];
  for (const [parameterName, displayName, measurementUnit] of METRICS) {
    if (mets.some(m => m.parameterName === parameterName)) { console.log(`= Metric ${parameterName} (đã có)`); continue; }
    await api('POST', '/customMetrics', { parameterName, displayName, measurementUnit, scope: 'EVENT' });
    console.log(`+ Metric ${parameterName}`);
  }
  console.log('Xong.');
})().catch(e => { console.error(e.message); process.exit(1); });
