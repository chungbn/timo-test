// Xuất toàn bộ ngân hàng bài tập và 90 đề thi cố định ra data/questions.json
// Chạy: node scripts/export-questions.js [số câu tối đa mỗi dạng/cấp, mặc định 30]
const fs = require('fs');
const path = require('path');

global.window = global;
const root = path.join(__dirname, '..');
for (const f of ['util', 'topics', 'generators']) require(path.join(root, 'js', f + '.js'));
const T = window.T;

const PER_GEN = Number(process.argv[2]) || 30;
const questions = new Map(); // id -> câu hỏi

function add(q) {
  const id = `${q.topic}-${T.hashStr(q.text + '|' + q.visual + '|' + q.answer).toString(36)}`;
  if (!questions.has(id)) {
    questions.set(id, {
      id, topic: q.topic, level: q.lv, form: q.gen, type: q.type,
      text: q.text, visual: q.visual || '', choices: q.choices || null,
      answer: q.answer, solution: q.solution,
    });
  }
  return id;
}

// 1) Ngân hàng: mỗi dạng bài × mỗi cấp độ, tối đa PER_GEN câu khác nhau
for (const t of T.TOPICS) {
  for (const g of T.GENS[t.id]) {
    for (const lv of g.lv) {
      const R = T.makeRng(T.hashStr(`bank#${t.id}#${g.id}#${lv}`));
      const seen = new Set();
      for (let i = 0; i < PER_GEN * 15 && seen.size < PER_GEN; i++) {
        const q = Object.assign(g.fn(R, lv), { topic: t.id, lv, gen: g.id });
        seen.add(add(q));
      }
    }
  }
}

// 2) Đề thi cố định: sinh giống hệt buildExam() trong js/app.js
const exams = [];
for (const [mode, M] of Object.entries(T.EXAM_MODES)) {
  for (let no = 1; no <= T.EXAM_COUNT; no++) {
    const R = T.makeRng(T.hashStr(`${mode}#${no}`));
    const ids = [];
    for (const t of T.TOPICS) {
      const used = { gens: new Set(), texts: new Set() };
      for (const lv of M.levels) ids.push(add(T.generate(t.id, lv, R, used)));
    }
    exams.push({ id: `${mode}-${no}`, mode, no, title: `${M.name} · Đề số ${no}`, minutes: M.minutes, questionIds: ids });
  }
}

const list = [...questions.values()].sort((a, b) =>
  T.TOPICS.findIndex(t => t.id === a.topic) - T.TOPICS.findIndex(t => t.id === b.topic) || a.level - b.level || a.form.localeCompare(b.form));

const out = {
  name: 'Ngân hàng bài tập TIMO lớp 1',
  generatedAt: new Date().toISOString(),
  notes: 'text/solution/visual là HTML (visual là hình SVG). type "input": điền đáp số; type "choice": chọn một trong choices. Đề thi tham chiếu câu hỏi qua questionIds.',
  topics: T.TOPICS.map(({ id, name, icon, color, desc }) => ({ id, name, icon, color, desc })),
  levels: T.LEVELS,
  examModes: T.EXAM_MODES,
  stats: {
    questions: list.length,
    exams: exams.length,
    byTopic: Object.fromEntries(T.TOPICS.map(t => [t.id, [1, 2, 3].map(lv => list.filter(q => q.topic === t.id && q.level === lv).length)])),
  },
  questions: list,
  exams,
};

const file = path.join(root, 'data', 'questions.json');
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, JSON.stringify(out, null, 1));
console.log(`Đã ghi ${file}`);
console.log(`${list.length} câu hỏi, ${exams.length} đề thi, ${(fs.statSync(file).size / 1024 / 1024).toFixed(2)} MB`);
console.log('Số câu theo chủ đề [cấp 1, cấp 2, cấp 3]:', out.stats.byTopic);
