(function (T) {
  'use strict';
  // Dữ liệu học tập của hồ sơ đang dùng. Luôn lưu vào localStorage trước (chạy được khi mất mạng);
  // khi đăng nhập, cloud.js lắng nghe onChange để đồng bộ lên Firestore.
  const GUEST_KEY = 'timo1-data-v1';
  // starLog/doneLog: số sao đạt thêm / số câu đã làm theo từng ngày (cho bảng xếp hạng tuần, tháng).
  // bestStreak: kỷ lục số ngày học liên tiếp (giữ lại dù chuỗi bị đứt). bestExam: điểm thi cao nhất.
  const blank = () => ({ stats: {}, stars: {}, exams: [], best: {}, speedBest: 0, mistakes: [], daily: {}, starLog: {}, doneLog: {}, bestStreak: 0, bestExam: 0 });
  const LOG_DAYS = 70; // chỉ giữ nhật ký ~10 tuần gần nhất
  function pruneLog(log) {
    const cut = new Date(); cut.setDate(cut.getDate() - LOG_DAYS);
    const min = T.dateKey(cut);
    for (const k of Object.keys(log)) if (k < min) delete log[k];
  }
  const addLog = (log, n) => { const k = T.today(); log[k] = (log[k] || 0) + n; pruneLog(log); };
  const sumLog = log => Object.values(log || {}).reduce((a, v) => a + v, 0);

  // Nhật ký theo ngày mới có từ khi thêm bảng xếp hạng. Sao và số câu làm trước đó (chưa có ngày) được tính
  // một lần vào ngày đầu tiên chạy bản mới, để bảng tuần/tháng không bỏ sót. logsSince đánh dấu đã làm việc này.
  function migrateLogs(d) {
    if (d.logsSince) return false;
    const totalDone = Object.values(d.stats).reduce((a, s) => a + (s.done || 0), 0), total = lessonStars(d);
    // Chưa có gì (ví dụ bản lưu trống trên máy trước khi tải dữ liệu từ mạng): chưa đánh dấu, để lần sau xét lại
    if (!totalDone && !total) return false;
    d.logsSince = T.today();
    const done = totalDone - sumLog(d.doneLog);
    const stars = total - sumLog(d.starLog);
    if (done > 0) d.doneLog[d.logsSince] = (d.doneLog[d.logsSince] || 0) + done;
    if (stars > 0) d.starLog[d.logsSince] = (d.starLog[d.logsSince] || 0) + stars;
    return true;
  }
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

  // Sao = sao lộ trình bài học + sao thưởng (mỗi ngày hoàn thành Thử thách hôm nay được T.DAILY_BONUS sao).
  // Sao thưởng tính từ danh sách ngày đã hoàn thành (d.daily) nên đồng bộ nhiều máy không bị cộng trùng.
  T.DAILY_BONUS = 20;
  const lessonStars = d => Object.entries(d.stars).filter(([k]) => /-L\d+$/.test(k)).reduce((a, [, v]) => a + v, 0);
  const bonusStars = (d, period) => {
    const days = Object.keys(d.daily || {});
    return T.DAILY_BONUS * (period ? T.periodSum(Object.fromEntries(days.map(k => [k, 1])), period) : days.length);
  };
  function totalStars(d) { return lessonStars(d) + bonusStars(d); }
  // Số ngày học liên tiếp: ngày có làm bài (hoặc làm thử thách hôm nay). Hôm nay chưa học thì tính đến hôm qua.
  function streak(d) {
    const active = k => d.daily[k] != null || (d.doneLog && d.doneLog[k] > 0);
    let n = 0; const day = new Date();
    for (;;) {
      const k = T.dateKey(day);
      if (!active(k)) { if (n === 0 && k === T.today()) { day.setDate(day.getDate() - 1); continue; } break; }
      n++; day.setDate(day.getDate() - 1);
    }
    return n;
  }
  // Chuỗi ngày học dài nhất từng có (tính từ lịch sử + kỷ lục đã lưu), để chuỗi có đứt thì kỷ lục vẫn còn
  function longestRun(d) {
    const days = [...new Set(Object.keys(d.daily || {}).concat(Object.keys(d.doneLog || {}).filter(k => d.doneLog[k] > 0)))].sort();
    let best = 0, run = 0, prev = null;
    for (const k of days) {
      const t = new Date(k + 'T00:00:00');
      run = prev && Math.round((t - prev) / 86400000) === 1 ? run + 1 : 1;
      best = Math.max(best, run); prev = t;
    }
    return best;
  }
  const bestStreak = d => Math.max(d.bestStreak || 0, streak(d), longestRun(d));
  const bestExam = d => Math.max(d.bestExam || 0, ...d.exams.map(e => e.score || 0));

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
      // Nhật ký theo ngày lấy số lớn hơn (gộp nhiều lần vẫn không bị cộng trùng)
      starLog: maxMap(a.starLog, b.starLog), doneLog: maxMap(a.doneLog, b.doneLog),
      bestStreak: Math.max(a.bestStreak || 0, b.bestStreak || 0), bestExam: Math.max(bestExam(a), bestExam(b)),
      logsSince: [a.logsSince, b.logsSince].filter(Boolean).sort()[0] || null,
    };
  }

  // Dữ liệu cũ trên máy (khách): bổ sung nhật ký một lần
  if (migrateLogs(data)) { try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { /* bỏ qua */ } }

  T.Store = {
    GUEST_KEY, blank, read, merge, bestStreakOf: bestStreak, bestExamOf: bestExam,
    onChange: null, // (kind, payload) => void — cloud.js gán vào
    get data() { return data; },
    get key() { return key; },
    // Chuyển sang hồ sơ khác (khách hoặc một bé); không phát sự kiện đồng bộ.
    // Trả về true nếu vừa bổ sung nhật ký cho dữ liệu cũ (cần gửi lên mạng).
    use(newKey, newData) {
      key = newKey;
      data = Object.assign(blank(), newData || read(newKey));
      const migrated = migrateLogs(data);
      try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { /* bỏ qua */ }
      return migrated;
    },
    isEmpty(d) { d = d || data; return !Object.keys(d.stats).length && !Object.keys(d.stars).length && !d.exams.length && !d.mistakes.length && !d.speedBest; },

    recordAnswer(topic, ok) {
      const s = data.stats[topic] || (data.stats[topic] = { done: 0, correct: 0 });
      s.done++; if (ok) s.correct++;
      addLog(data.doneLog, 1);
      data.bestStreak = bestStreak(data);
      save('answer');
    },
    setStars(k, n) {
      const old = data.stars[k] || 0;
      if (n <= old) return;
      data.stars[k] = n;
      if (/-L\d+$/.test(k)) addLog(data.starLog, n - old); // chỉ tính sao của lộ trình bài học
      save('progress');
    },
    stars(k) { return data.stars[k] || 0; },
    totalStars(d) { return totalStars(d || data); },
    lessonStars(d) { return lessonStars(d || data); },
    bonusStars(d, period) { return bonusStars(d || data, period); },
    addExam(rec) {
      data.exams.unshift(rec);
      data.exams = data.exams.slice(0, 50);
      if (rec.key && !rec.key.endsWith('-r')) data.best[rec.key] = Math.max(data.best[rec.key] || 0, rec.score);
      data.bestExam = Math.max(data.bestExam || 0, rec.score);
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
    // Ghi nhận hoàn thành Thử thách hôm nay; trả về true nếu là lần đầu trong ngày (vừa nhận sao thưởng)
    setDaily(date, score) {
      const first = data.daily[date] == null;
      data.daily[date] = Math.max(data.daily[date] || 0, score);
      data.bestStreak = bestStreak(data);
      save('progress');
      return first;
    },
    streak(d) { return streak(d || data); },
    reset() { data = blank(); save('local'); emit('reset'); },
  };
})(window.T);
