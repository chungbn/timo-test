(function (T) {
  'use strict';
  // Dữ liệu học tập của hồ sơ đang dùng. Luôn lưu vào localStorage trước (chạy được khi mất mạng);
  // khi đăng nhập, cloud.js lắng nghe onChange để đồng bộ lên Firestore.
  const GUEST_KEY = 'timo1-data-v1';
  const blank = () => ({ stats: {}, stars: {}, exams: [], best: {}, speedBest: 0, mistakes: [], daily: {} });
  const qKey = q => T.hashStr(q.text + '|' + q.visual + '|' + q.answer);

  function read(key) {
    try { return Object.assign(blank(), JSON.parse(localStorage.getItem(key) || '{}')); } catch (e) { return blank(); }
  }

  let key = GUEST_KEY;
  let data = read(key);
  const save = kind => {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { /* bộ nhớ đầy hoặc bị chặn */ }
    if (T.Store.onChange) T.Store.onChange(kind);
  };
  const emit = (kind, payload) => { if (T.Store.onChange) T.Store.onChange(kind, payload); };

  function totalStars(d) { return Object.entries(d.stars).filter(([k]) => /-L\d+$/.test(k)).reduce((a, [, v]) => a + v, 0); }
  function streak(d) {
    let n = 0; const day = new Date();
    for (;;) {
      const k = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      if (d.daily[k] == null) { if (n === 0 && k === T.today()) { day.setDate(day.getDate() - 1); continue; } break; }
      n++; day.setDate(day.getDate() - 1);
    }
    return n;
  }

  // Gộp tiến độ từ hai nơi (máy này và máy khác) mà không làm mất gì:
  // sao/điểm cao nhất/kỷ lục lấy số lớn hơn, lịch sử thi gộp lại, thống kê lấy bản đã làm nhiều câu hơn.
  function merge(a, b) {
    a = Object.assign(blank(), a); b = Object.assign(blank(), b);
    const maxMap = (x, y) => { const o = Object.assign({}, x); for (const k in y) o[k] = Math.max(o[k] || 0, y[k] || 0); return o; };
    const stats = Object.assign({}, a.stats);
    for (const k in b.stats) if (!stats[k] || b.stats[k].done > stats[k].done) stats[k] = b.stats[k];
    const seen = new Set(), exams = [];
    for (const e of a.exams.concat(b.exams)) { const id = e.key + '@' + e.date; if (!seen.has(id)) { seen.add(id); exams.push(e); } }
    exams.sort((x, y) => y.date - x.date);
    const ms = new Map();
    for (const m of a.mistakes.concat(b.mistakes)) if (!ms.has(m.k)) ms.set(m.k, m);
    return {
      stats, stars: maxMap(a.stars, b.stars), best: maxMap(a.best, b.best), daily: maxMap(a.daily, b.daily),
      speedBest: Math.max(a.speedBest || 0, b.speedBest || 0), exams: exams.slice(0, 50),
      mistakes: [...ms.values()].sort((x, y) => y.at - x.at).slice(0, 80),
    };
  }

  T.Store = {
    GUEST_KEY, blank, read, merge,
    onChange: null, // (kind, payload) => void — cloud.js gán vào
    get data() { return data; },
    get key() { return key; },
    // Chuyển sang hồ sơ khác (khách hoặc một bé); không phát sự kiện đồng bộ
    use(newKey, newData) {
      key = newKey;
      data = Object.assign(blank(), newData || read(newKey));
      try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { /* bỏ qua */ }
    },
    isEmpty(d) { d = d || data; return !Object.keys(d.stats).length && !Object.keys(d.stars).length && !d.exams.length && !d.mistakes.length && !d.speedBest; },

    recordAnswer(topic, ok) {
      const s = data.stats[topic] || (data.stats[topic] = { done: 0, correct: 0 });
      s.done++; if (ok) s.correct++;
      save('answer');
    },
    setStars(k, n) { if (n > (data.stars[k] || 0)) { data.stars[k] = n; save('progress'); } },
    stars(k) { return data.stars[k] || 0; },
    totalStars(d) { return totalStars(d || data); },
    addExam(rec) {
      data.exams.unshift(rec);
      data.exams = data.exams.slice(0, 50);
      if (rec.key && !rec.key.endsWith('-r')) data.best[rec.key] = Math.max(data.best[rec.key] || 0, rec.score);
      save('progress');
    },
    best(k) { return data.best[k]; },
    setSpeed(score) { if (score > data.speedBest) { data.speedBest = score; save('progress'); return true; } return false; },
    addMistake(q) {
      const k = qKey(q);
      if (data.mistakes.some(m => m.k === k)) return;
      const m = { k, q, at: Date.now() };
      data.mistakes.unshift(m);
      const dropped = data.mistakes.slice(80);
      data.mistakes = data.mistakes.slice(0, 80);
      save('local');
      emit('mistake-add', m);
      dropped.forEach(d => emit('mistake-remove', d.k));
    },
    removeMistake(q) {
      const k = qKey(q);
      if (!data.mistakes.some(m => m.k === k)) return;
      data.mistakes = data.mistakes.filter(m => m.k !== k);
      save('local');
      emit('mistake-remove', k);
    },
    clearMistakes() { data.mistakes = []; save('local'); emit('mistakes-clear'); },
    setDaily(date, score) { data.daily[date] = Math.max(data.daily[date] || 0, score); save('progress'); },
    streak(d) { return streak(d || data); },
    reset() { data = blank(); save('local'); emit('reset'); },
  };
})(window.T);
