(function (T) {
  'use strict';
  const KEY = 'timo1-data-v1';
  const blank = () => ({ stats: {}, stars: {}, exams: [], best: {}, speedBest: 0, mistakes: [], daily: {} });

  let data;
  try { data = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { data = blank(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* bộ nhớ đầy hoặc bị chặn */ } };
  const qKey = q => T.hashStr(q.text + '|' + q.visual + '|' + q.answer);

  T.Store = {
    get data() { return data; },
    recordAnswer(topic, ok) {
      const s = data.stats[topic] || (data.stats[topic] = { done: 0, correct: 0 });
      s.done++; if (ok) s.correct++;
      save();
    },
    setStars(key, n) { if (n > (data.stars[key] || 0)) { data.stars[key] = n; save(); } },
    stars(key) { return data.stars[key] || 0; },
    totalStars() { return Object.values(data.stars).reduce((a, b) => a + b, 0); },
    addExam(rec) {
      data.exams.unshift(rec);
      data.exams = data.exams.slice(0, 50);
      if (rec.key && !rec.key.endsWith('-r')) data.best[rec.key] = Math.max(data.best[rec.key] || 0, rec.score);
      save();
    },
    best(key) { return data.best[key]; },
    setSpeed(score) { if (score > data.speedBest) { data.speedBest = score; save(); return true; } return false; },
    addMistake(q) {
      const k = qKey(q);
      if (data.mistakes.some(m => m.k === k)) return;
      data.mistakes.unshift({ k, q, at: Date.now() });
      data.mistakes = data.mistakes.slice(0, 80);
      save();
    },
    removeMistake(q) { const k = qKey(q); data.mistakes = data.mistakes.filter(m => m.k !== k); save(); },
    clearMistakes() { data.mistakes = []; save(); },
    setDaily(date, score) { data.daily[date] = Math.max(data.daily[date] || 0, score); save(); },
    streak() {
      let n = 0; const d = new Date();
      for (;;) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (data.daily[key] == null) { if (n === 0 && key === T.today()) { d.setDate(d.getDate() - 1); continue; } break; }
        n++; d.setDate(d.getDate() - 1);
      }
      return n;
    },
    reset() { data = blank(); save(); },
  };
})(window.T);
