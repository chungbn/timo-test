// Kiểm tra nội dung các lớp: mọi dạng bài sinh câu hỏi hợp lệ ở mọi cấp độ, lộ trình và đề thi đầy đủ.
// Chạy: node scripts/check-grades.js [lớp ...]   (mặc định kiểm tra mọi lớp đã có)
const path = require('path');

global.window = global;
global.localStorage = { getItem: () => null, setItem: () => {} };
const root = path.join(__dirname, '..');
const grades = process.argv.slice(2).map(Number).filter(Boolean);
// Chỉ nạp file của các lớp cần kiểm tra (mặc định mọi lớp)
for (const f of ['util', 'topics', 'generators', ...[2, 3, 4, 5].filter(g => !grades.length || grades.includes(g)).map(g => 'grade' + g)]) {
  try { require(path.join(root, 'js', f + '.js')); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; }
}
const T = window.T;

const SEEDS = 400;
const list = grades.length ? grades : Object.keys(T.GRADES).map(Number);
let errors = 0;
const err = (g, msg) => { errors++; if (errors <= 200) console.log(`  ✗ [lớp ${g}] ${msg}`); };

// Đáp án ô nhập: số tự nhiên (không dấu chấm nghìn), số thập phân "3,5" hoặc phân số tối giản "3/4"
const ANSWER_RE = /^(\d+|\d+,\d*[1-9]|\d+\/\d+)$/;
const BAD_RE = /undefined|NaN|Infinity|\[object|null(?![\w-])/;

for (const g of list) {
  const G = T.GRADES[g];
  if (!G) { err(g, 'chưa có dữ liệu'); continue; }
  console.log(`Lớp ${g}`);
  for (const t of T.TOPICS) {
    const info = G.topics[t.id];
    if (!info || !info.desc || !(info.points || []).length || !(info.tips || []).length || !(info.examples || []).length) err(g, `${t.id}: thiếu lý thuyết (desc/points/tips/examples)`);
    const gens = G.gens[t.id] || [];
    const ids = gens.map(x => x.id);
    if (new Set(ids).size !== ids.length) err(g, `${t.id}: trùng id dạng bài`);
    for (const lv of [0, 1, 2, 3]) {
      const n = gens.filter(x => x.lv.includes(lv)).length;
      if (n < 3) err(g, `${t.id}: cấp ${lv} chỉ có ${n} dạng bài (cần ≥ 3)`);
    }
    let count = 0;
    for (const gen of gens) {
      for (const lv of gen.lv) {
        const texts = new Set();
        for (let s = 0; s < SEEDS; s++) {
          const R = T.makeRng(T.hashStr(`chk#${g}#${t.id}#${gen.id}#${lv}#${s}`));
          let q;
          try { q = gen.fn(R, lv); } catch (e) { err(g, `${t.id}/${gen.id} cấp ${lv}: lỗi ${e.message}`); break; }
          count++;
          const where = `${t.id}/${gen.id} cấp ${lv}`;
          if (!q || typeof q.text !== 'string' || !q.text) { err(g, `${where}: thiếu text`); break; }
          if (typeof q.solution !== 'string' || !q.solution.includes('<b>')) { err(g, `${where}: lời giải phải có đáp số in đậm <b>`); break; }
          const all = q.text + ' ' + q.solution + ' ' + (q.choices || []).join(' ') + ' ' + q.answer;
          if (BAD_RE.test(all)) { err(g, `${where}: có giá trị lỗi: ${all.match(BAD_RE)[0]} — ${q.text.slice(0, 120)}`); break; }
          if (q.answer === '' || q.answer == null) { err(g, `${where}: đáp án rỗng`); break; }
          if (q.type === 'choice') {
            if (!Array.isArray(q.choices) || q.choices.length < 2 || q.choices.length > 6) { err(g, `${where}: choices phải có 2–6 lựa chọn`); break; }
            if (new Set(q.choices.map(String)).size !== q.choices.length) { err(g, `${where}: lựa chọn bị trùng: ${q.choices.join(' | ')}`); break; }
            if (!q.choices.map(String).includes(q.answer)) { err(g, `${where}: đáp án "${q.answer}" không nằm trong lựa chọn`); break; }
          } else {
            if (!ANSWER_RE.test(q.answer)) { err(g, `${where}: đáp án ô nhập không hợp lệ "${q.answer}"`); break; }
            if (q.answer.length > 8) { err(g, `${where}: đáp án quá dài "${q.answer}"`); break; }
            if (q.answer.includes('/')) {
              const [a, b] = q.answer.split('/').map(Number);
              if (T.GH.gcd(a, b) !== 1 || b === 1) { err(g, `${where}: phân số chưa tối giản "${q.answer}"`); break; }
            }
          }
          texts.add(q.text + q.visual);
        }
        if (texts.size < 3) console.log(`  ⚠ [lớp ${g}] ${t.id}/${gen.id} cấp ${lv}: chỉ sinh được ${texts.size} câu khác nhau`);
      }
    }
    // Lộ trình: 24 bài, dạng bài trong từng bài phải tồn tại và có cấp độ của bài
    const lessons = G.lessons[t.id];
    if (!lessons || lessons.length !== T.LESSON_COUNT) { err(g, `${t.id}: lộ trình phải có ${T.LESSON_COUNT} bài`); continue; }
    T.lessons(t.id, g).forEach(L => {
      if (!L.t) err(g, `${t.id} bài ${L.n}: thiếu tên`);
      if (L.f) {
        for (const f of L.f) if (!ids.includes(f)) err(g, `${t.id} bài ${L.n}: không có dạng bài "${f}"`);
        for (const lv of new Set(L.levels)) if (!gens.some(x => L.f.includes(x.id) && x.lv.includes(lv))) err(g, `${t.id} bài ${L.n} (${L.t}): không dạng nào có cấp ${lv}`);
      }
      for (let s = 0; s < 5; s++) {
        const qs = T.generateLesson(t.id, L.n, T.makeRng(s), g);
        if (qs.length !== T.LESSON_SIZE) err(g, `${t.id} bài ${L.n}: sinh ${qs.length} câu`);
      }
    });
    console.log(`  ${t.icon} ${t.id}: ${gens.length} dạng bài, ${count} câu thử`);
  }
  for (const mode of Object.keys(T.EXAM_MODES)) {
    for (let no = 1; no <= T.EXAM_COUNT; no++) {
      const qs = T.generateExam(mode, no, g);
      if (qs.some(q => q.grade !== g)) err(g, `đề ${mode}-${no}: lẫn câu của lớp khác`);
    }
  }
}
console.log(errors ? `\n${errors} lỗi` : '\nOK: không có lỗi');
process.exit(errors ? 1 : 0);
