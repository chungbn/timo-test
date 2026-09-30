(function (T) {
  'use strict';
  const $app = document.getElementById('app');
  const { esc, Store, TOPICS, topicById } = T;

  let session = null;   // phiên luyện tập
  let exam = null;      // bài thi đang làm
  let speed = null;     // thử thách tốc độ
  let currentQ = null;  // câu đang hiển thị (để đọc đề)
  let timers = [];
  const clearTimers = () => { timers.forEach(clearInterval); timers = []; };

  const PRAISE = ['Giỏi quá! 🎉', 'Chính xác! 🌟', 'Tuyệt vời! 🚀', 'Đúng rồi! 👏', 'Xuất sắc! 🏆', 'Con làm tốt lắm! 💯'];

  // ---------------- tiện ích giao diện ----------------
  function isCorrect(q, v) {
    if (v == null || String(v).trim() === '') return false;
    if (q.type === 'choice') return v === q.answer;
    const m = String(v).match(/\d+/);
    return !!m && Number(m[0]) === Number(q.answer);
  }

  function keypad() {
    return `<div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '⌫'].map(k => `<button type="button" class="kp" data-act="kp" data-k="${k}">${k}</button>`).join('')}</div>`;
  }

  function answerArea(q, val, locked) {
    if (q.type === 'choice') {
      return `<div class="choices">${q.choices.map(c => `<button type="button" class="choice ${val === c ? 'sel' : ''}" data-act="choice" data-v="${esc(c)}" ${locked ? 'disabled' : ''}>${esc(c)}</button>`).join('')}</div>`;
    }
    return `<div class="answer-area"><label class="ans-wrap">Đáp số: <input class="ans" inputmode="numeric" autocomplete="off" maxlength="4" value="${esc(val || '')}" ${locked ? 'disabled' : ''} placeholder="?"></label>${locked ? '' : keypad()}</div>`;
  }

  function questionCard(q, label, val, locked) {
    const t = topicById(q.topic);
    currentQ = q;
    return `<div class="qcard" style="--c:${t.color}">
      <div class="q-top"><span class="q-label">${label}</span><span class="tag">${t.icon} ${t.name} · ${T.levelName(q.lv)}</span><button type="button" class="icon-btn" data-act="tts" title="Đọc đề">🔊</button></div>
      <div class="q-text">${q.text}</div>
      ${q.visual ? `<div class="q-visual">${q.visual}</div>` : ''}
      ${answerArea(q, val, locked)}
    </div>`;
  }

  const topicStars = id => T.lessons(id).reduce((a, L) => a + Store.stars(T.lessonKey(id, L.n)), 0);
  // Bài nên học tiếp: bài đầu tiên chưa có sao
  const nextLesson = id => (T.lessons(id).find(L => !Store.stars(T.lessonKey(id, L.n))) || {}).n;
  function lessonLevel(L) {
    const a = Math.min(...L.levels), b = Math.max(...L.levels);
    return a === b ? T.levelName(a) : `${T.levelName(a)} → ${T.levelName(b)}`;
  }

  function starsHtml(n, max = 3) { return `<span class="stars">${'★'.repeat(n)}<span class="off">${'★'.repeat(max - n)}</span></span>`; }

  function focusAns() {
    const i = $app.querySelector('.ans:not([disabled])');
    if (i && window.matchMedia('(pointer:fine)').matches) i.focus();
  }

  // Đọc to bằng giọng tiếng Việt, chậm để các bé kịp nghe. Bấm lại cùng nút thì dừng đọc.
  const SPEECH_RATE = 0.7;
  let speakingKey = null;
  const EMOJI_WORDS = {
    '🍎': 'quả táo', '🍊': 'quả cam', '🍌': 'quả chuối', '🍐': 'quả lê', '🍇': 'chùm nho', '🍓': 'quả dâu', '🍑': 'quả đào', '🍍': 'quả dứa', '🍉': 'quả dưa hấu', '🥥': 'quả dừa',
    '🐱': 'con mèo', '🐶': 'con chó', '🐰': 'con thỏ', '🐻': 'con gấu', '🐼': 'con gấu trúc', '🦊': 'con cáo', '🐸': 'con ếch', '🐯': 'con hổ', '🐵': 'con khỉ', '🐷': 'con lợn',
    '🔴': 'tròn đỏ', '🔵': 'tròn xanh', '🟡': 'tròn vàng', '🟢': 'tròn xanh lá', '🟣': 'tròn tím', '⭐': 'ngôi sao', '❤️': 'trái tim', '🔺': 'tam giác đỏ', '🌙': 'mặt trăng', '🍀': 'cỏ bốn lá',
    '🐟': 'con cá', '🎈': 'quả bóng', '🍪': 'cái bánh', '🐦': 'con chim', '🍬': 'kẹo', '🍰': 'bánh', '👕': '', '👖': '', '🏠': '', '🌳': '', '🏫': '',
  };
  const EMOJI_ALT = Object.keys(EMOJI_WORDS).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const EMOJI_RE = new RegExp(EMOJI_ALT, 'g');
  const EMOJI_RUN_RE = new RegExp(`(${EMOJI_ALT})(?:\\s*\\1)+`, 'g'); // 🍎🍎🍎 → "3 quả táo"
  function toSpeech(html) {
    return T.stripHtml(String(html).replace(/<\/?(br|div|p|li)[^>]*>/gi, '. ').replace(/&nbsp;/g, ' '))
      .replace(EMOJI_RUN_RE, (m, e) => ` ${m.split(e).length - 1} ${EMOJI_WORDS[e] || ''}, `)
      .replace(EMOJI_RE, m => EMOJI_WORDS[m] ? ` ${EMOJI_WORDS[m]}, ` : ' ')
      .replace(/□/g, ' ô trống ').replace(/−/g, ' trừ ').replace(/\+/g, ' cộng ').replace(/=/g, ' bằng ')
      .replace(/×/g, ' nhân ').replace(/→/g, ', ').replace(/\s*<\s*/g, ' bé hơn ').replace(/\s*>\s*/g, ' lớn hơn ')
      .replace(/💡|Lời giải:/g, '').replace(/\s+/g, ' ').replace(/,\s*([.?:,])/g, '$1').replace(/:\s*\./g, ':')
      .replace(/(\.\s*){2,}/g, '. ').replace(/([?!])\s*\./g, '$1').replace(/,\s*$/, '').trim();
  }
  function speakText(txt, key) {
    if (!window.speechSynthesis) return;
    const again = speechSynthesis.speaking && speakingKey === key;
    speechSynthesis.cancel();
    speakingKey = null;
    if (again || !txt) return;
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = 'vi-VN'; u.rate = SPEECH_RATE;
    const v = speechSynthesis.getVoices().find(v => v.lang && v.lang.toLowerCase().startsWith('vi'));
    if (v) u.voice = v;
    u.onend = () => { if (speakingKey === key) speakingKey = null; };
    speakingKey = key;
    speechSynthesis.speak(u);
  }
  function speak(q) {
    if (!q) return;
    // Bài đếm hình: không đọc số lượng (sẽ lộ đáp án), chỉ nhắc bé đếm trên hình
    let src = q.gen === 'count0' ? q.text.split('<div')[0] + '. Con hãy đếm trên hình nhé.' : q.text;
    if (q.type === 'choice' && !/[<>=]/.test(q.answer)) src += '. Các lựa chọn: ' + q.choices.join(', ');
    speakText(toSpeech(src), 'q:' + q.text);
  }
  const sayBtn = '<button type="button" class="say" data-act="tts-sol" title="Đọc lời giải">🔊</button>';

  function confetti() {
    const colors = ['#f97316', '#8b5cf6', '#0ea5e9', '#10b981', '#ec4899', '#facc15'];
    for (let i = 0; i < 70; i++) {
      const p = document.createElement('i');
      p.className = 'confetti';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = Math.random() * 0.6 + 's';
      p.style.animationDuration = 2 + Math.random() * 1.5 + 's';
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 4200);
    }
  }

  function shake(el) { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }

  // ---------------- TRANG CHỦ ----------------
  function renderHome() {
    const d = Store.data;
    const done = Object.values(d.stats).reduce((a, s) => a + s.done, 0);
    const bestExam = d.exams.length ? Math.max(...d.exams.map(e => e.score)) : '–';
    const todayDone = d.daily[T.today()] != null;
    $app.innerHTML = `
    <section class="hero">
      <div class="hero-text">
        <h1>${Cloud.kid ? `Chào ${esc(Cloud.kid.nickname)} ${esc(Cloud.kid.avatar || '')}!` : 'Chinh phục <span>TIMO</span> lớp 1 🦉'}</h1>
        <p>Học theo 5 chủ đề của kỳ thi Olympic Toán Quốc tế TIMO: Tư duy logic, Số học, Lý thuyết số, Hình học và Tổ hợp. Mỗi lần luyện là một bộ câu hỏi mới!</p>
        <div class="hero-stats">
          <div><b>${Store.totalStars()}</b><span>⭐ sao</span></div>
          <div><b>${done}</b><span>📝 câu đã làm</span></div>
          <div><b>${bestExam}</b><span>🏆 điểm thi cao nhất</span></div>
          <div><b>${Store.streak()}</b><span>🔥 ngày liên tiếp</span></div>
        </div>
      </div>
    </section>

    <a class="daily ${todayDone ? 'done' : ''}" href="#/daily">
      <div class="daily-ico">🌞</div>
      <div><h3>Thử thách hôm nay</h3><p>${todayDone ? `Con đã làm hôm nay: ${d.daily[T.today()]}/10 câu đúng. Làm lại để cải thiện nhé!` : '10 câu hỏi mới mỗi ngày từ cả 5 chủ đề. Giữ chuỗi ngày học nhé!'}</p></div>
      <span class="go">${todayDone ? '✅' : 'Bắt đầu →'}</span>
    </a>

    <h2 class="sec-title">📚 Học theo chủ đề</h2>
    <div class="grid topics">
      ${TOPICS.map(t => {
        const st = topicStars(t.id), max = T.LESSON_COUNT * 3;
        return `<a class="card topic" href="#/topic/${t.id}" style="--c:${t.color}">
          <div class="ico">${t.icon}</div><h3>${t.name}</h3><p>${t.desc}</p>
          <div class="meter"><div style="width:${st / max * 100}%"></div></div><small>⭐ ${st}/${max} sao · ${T.LESSON_COUNT} bài</small>
        </a>`;
      }).join('')}
    </div>

    <h2 class="sec-title">🏁 Luyện thi</h2>
    <div class="grid modes">
      <a class="card mode" href="#/exams" style="--c:#2563eb"><div class="ico">📝</div><h3>Thi thử TIMO</h3><p>${T.EXAM_COUNT * 3} đề thi · 25 câu · 90 phút · chấm điểm & xếp huy chương</p></a>
      <a class="card mode" href="#/mixed" style="--c:#f59e0b"><div class="ico">🎯</div><h3>Luyện tổng hợp</h3><p>10 câu trộn ngẫu nhiên từ 5 chủ đề</p></a>
      <a class="card mode" href="#/speed" style="--c:#ef4444"><div class="ico">⚡</div><h3>Tính nhẩm 60 giây</h3><p>Làm được nhiều phép tính nhất có thể. Kỷ lục: ${d.speedBest}</p></a>
      <a class="card mode" href="#/mistakes" style="--c:#64748b"><div class="ico">📒</div><h3>Sổ tay lỗi sai</h3><p>${d.mistakes.length} câu cần ôn lại</p></a>
      <a class="card mode" href="#/progress" style="--c:#14b8a6"><div class="ico">📊</div><h3>Tiến độ học tập</h3><p>Thống kê theo chủ đề, lịch sử bài thi</p></a>
    </div>`;
  }

  // ---------------- CHỦ ĐỀ ----------------
  function renderTopic(id) {
    const t = topicById(id);
    if (!t) return renderHome();
    $app.innerHTML = `
    <a href="#/" class="back">← Trang chủ</a>
    <section class="topic-head" style="--c:${t.color}">
      <div class="ico big">${t.icon}</div>
      <div><h1>${t.name}</h1><p>${t.desc}</p></div>
    </section>
    <h2 class="sec-title">🗺️ Lộ trình ${T.LESSON_COUNT} bài · mỗi bài ${T.LESSON_SIZE} câu <small class="muted">⭐ ${topicStars(t.id)}/${T.LESSON_COUNT * 3}</small></h2>
    <div class="path">
      ${(() => {
        const next = nextLesson(t.id);
        return T.lessons(t.id).map(L => {
          const st = Store.stars(T.lessonKey(t.id, L.n));
          return `<a class="lesson ${st ? 'done' : ''} ${L.n === next ? 'next' : ''}" href="#/practice/${t.id}/${L.n}" style="--c:${t.color}">
            <span class="lesson-n">${L.n}</span>
            <span class="lesson-body"><b>${L.t}</b><small>${lessonLevel(L)}</small></span>
            ${L.n === next ? '<span class="lesson-go">Học tiếp →</span>' : starsHtml(st)}
          </a>`;
        }).join('');
      })()}
    </div>
    <div class="theory" style="--c:${t.color}">
      <h2>📖 Kiến thức cần nhớ</h2>
      <ul>${t.points.map(p => `<li>${p}</li>`).join('')}</ul>
      <h2>💡 Mẹo làm bài</h2>
      <ul>${t.tips.map(p => `<li>${p}</li>`).join('')}</ul>
      <h2>✏️ Ví dụ mẫu</h2>
      ${t.examples.map((e, i) => `<details class="example"><summary><b>Ví dụ ${i + 1}.</b> ${e.q}</summary><div class="solution">${sayBtn}💡 ${e.a}</div></details>`).join('')}
    </div>`;
  }

  // ---------------- PHIÊN LUYỆN TẬP ----------------
  function startSession(cfg) {
    session = Object.assign({}, cfg, { cfg, idx: 0, correct: 0, results: [], saved: false, questions: cfg.make() });
    renderSession();
  }

  function renderSession() {
    const s = session;
    if (s.idx >= s.questions.length) return renderSummary();
    const q = s.questions[s.idx];
    s.checked = false; s.sel = null;
    $app.innerHTML = `
    <div class="sess-head">
      <a href="${s.back}" class="back">← Thoát</a>
      <div class="sess-title">${s.title}</div>
      <div class="sess-score" id="score">✅ ${s.correct}/${s.idx}</div>
    </div>
    <div class="progress"><div style="width:${s.idx / s.questions.length * 100}%"></div></div>
    ${questionCard(q, `Câu ${s.idx + 1}/${s.questions.length}`)}
    <div id="fb"></div>
    <div class="actions"><button class="btn primary" id="primary" data-act="check">Kiểm tra ✔</button></div>`;
    focusAns();
  }

  function sessionCheck() {
    const s = session, q = s.questions[s.idx];
    const input = $app.querySelector('.ans');
    const v = q.type === 'choice' ? s.sel : (input ? input.value.trim() : '');
    if (!v) { shake($app.querySelector('.answer-area, .choices')); return; }
    const ok = isCorrect(q, v);
    s.checked = true;
    if (ok) s.correct++;
    s.results.push({ q, v, ok });
    Store.recordAnswer(q.topic, ok);
    if (!ok) Store.addMistake(q);
    else if (s.mode === 'mistakes') Store.removeMistake(q);

    if (input) input.disabled = true;
    const kp = $app.querySelector('.keypad'); if (kp) kp.remove();
    $app.querySelectorAll('.choice').forEach(b => {
      b.disabled = true;
      if (b.dataset.v === q.answer) b.classList.add('right');
      else if (b.dataset.v === v) b.classList.add('wrong');
    });
    $app.querySelector('#fb').innerHTML = `
      <div class="fb ${ok ? 'ok' : 'bad'}">${ok ? PRAISE[Math.floor(Math.random() * PRAISE.length)] : `😅 Chưa đúng rồi! Đáp án đúng là <b>${esc(q.answer)}</b>`}</div>
      <div class="solution">${sayBtn}<b>💡 Lời giải:</b> ${q.solution}</div>`;
    $app.querySelector('#score').textContent = `✅ ${s.correct}/${s.idx + 1}`;
    const btn = $app.querySelector('#primary');
    btn.dataset.act = 'next';
    btn.textContent = s.idx + 1 < s.questions.length ? 'Câu tiếp theo →' : 'Xem kết quả 🏁';
    btn.focus();
  }

  function renderSummary() {
    const s = session, n = s.questions.length, r = s.correct / n;
    const stars = r >= 0.9 ? 3 : r >= 0.7 ? 2 : r >= 0.5 ? 1 : 0;
    if (!s.saved) {
      s.saved = true;
      if (s.starKey) Store.setStars(s.starKey, stars);
      if (s.onDone) s.onDone(s);
      if (stars === 3) confetti();
    }
    const next = s.lesson && s.lesson < T.LESSON_COUNT ? `#/practice/${s.topic}/${s.lesson + 1}` : null;
    const msg = stars === 3 ? 'Tuyệt vời! Con là nhà toán học nhí! 🏆' : stars === 2 ? 'Rất tốt! Cố thêm chút nữa để được 3 sao nhé! 🌟' : stars === 1 ? 'Khá lắm! Xem lại lời giải và thử lần nữa nhé! 💪' : 'Không sao cả! Đọc lại phần kiến thức rồi luyện tiếp nhé! 📖';
    $app.innerHTML = `
    <div class="result-card">
      <div class="big-stars">${starsHtml(stars)}</div>
      <h1>${s.correct}/${n} câu đúng</h1>
      <p>${msg}</p>
      <div class="actions center">
        ${next && stars ? `<a class="btn primary" href="${next}">Bài tiếp theo →</a>` : ''}
        ${s.mode === 'mistakes' ? '' : `<button class="btn ${next && stars ? '' : 'primary'}" data-act="restart">🔄 Làm lại (câu mới)</button>`}
        <a class="btn" href="${s.back}">← Quay lại</a>
      </div>
    </div>
    <h2 class="sec-title">Xem lại bài làm</h2>
    ${reviewList(s.results.map(x => ({ q: x.q, v: x.v, ok: x.ok })))}`;
  }

  function reviewList(items) {
    return `<div class="review">${items.map((it, i) => `
      <details class="rv ${it.ok ? 'ok' : 'bad'}">
        <summary><span class="rv-n">${it.ok ? '✅' : '❌'} Câu ${i + 1}</span><span class="rv-q">${esc(T.stripHtml(it.q.text.replace(/<(br|div)[^>]*>/g, ' ')).slice(0, 90))}</span></summary>
        <div class="rv-body">
          <div class="q-text">${it.q.text}</div>
          ${it.q.visual ? `<div class="q-visual">${it.q.visual}</div>` : ''}
          <p>Con trả lời: <b>${it.v ? esc(it.v) : '<i>(bỏ trống)</i>'}</b> · Đáp án: <b>${esc(it.q.answer)}</b></p>
          <div class="solution">${sayBtn}💡 ${it.q.solution}</div>
        </div>
      </details>`).join('')}</div>`;
  }

  function mixedQuestions(R, n, levels) {
    const used = {};
    const out = [];
    for (let i = 0; i < n; i++) {
      const t = TOPICS[i % TOPICS.length];
      used[t.id] = used[t.id] || { gens: new Set(), texts: new Set() };
      out.push(T.generate(t.id, levels ? levels[i % levels.length] : R.int(1, 3), R, used[t.id]));
    }
    return R.shuffle(out);
  }

  // ---------------- ĐỀ THI ----------------
  function renderExamList() {
    const modes = Object.entries(T.EXAM_MODES);
    $app.innerHTML = `
    <a href="#/" class="back">← Trang chủ</a>
    <h1 class="page-title">📝 Thi thử TIMO</h1>
    <p class="lead">Đề thi được chia đều 5 chủ đề như đề thi thật. Mỗi đề số luôn giữ nguyên câu hỏi để con làm lại và so sánh điểm. Chọn "Đề ngẫu nhiên" để có đề mới hoàn toàn.</p>
    ${modes.map(([key, M]) => `
      <section class="exam-group">
        <div class="exam-group-head"><h2>${M.name}</h2><span>${M.desc}</span><a class="btn primary small" href="#/exam/${key}/r">🎲 Đề ngẫu nhiên</a></div>
        <div class="exam-grid">
          ${Array.from({ length: T.EXAM_COUNT }, (_, i) => {
            const b = Store.best(`${key}-${i + 1}`);
            const m = b != null ? T.medal(b) : null;
            return `<a class="exam-tile ${m ? m.cls : ''}" href="#/exam/${key}/${i + 1}"><b>Đề ${i + 1}</b><small>${b != null ? `${m.icon} ${b}đ` : 'Chưa làm'}</small></a>`;
          }).join('')}
        </div>
      </section>`).join('')}`;
  }

  function buildExam(mode, no) {
    const M = T.EXAM_MODES[mode];
    const seed = no === 'r' ? Math.floor(Math.random() * 1e9) : T.hashStr(`${mode}#${no}`);
    const R = T.makeRng(seed);
    const qs = [];
    for (const t of TOPICS) {
      const used = { gens: new Set(), texts: new Set() };
      for (const lv of M.levels) qs.push(T.generate(t.id, lv, R, used));
    }
    return {
      mode, no, key: `${mode}-${no}`, M, qs,
      title: `${M.name} · ${no === 'r' ? 'Đề ngẫu nhiên' : 'Đề số ' + no}`,
      answers: qs.map(() => ''), flags: qs.map(() => false),
      idx: 0, started: false, submitted: false,
    };
  }

  function routeExam(mode, no) {
    if (!T.EXAM_MODES[mode]) return renderExamList();
    const key = `${mode}-${no}`;
    if (exam && exam.key === key && no !== 'r') return exam.submitted ? renderExamResult() : exam.started ? (startExamTimer(), renderExam()) : renderExamIntro();
    exam = buildExam(mode, no);
    renderExamIntro();
  }

  function renderExamIntro() {
    const e = exam, M = e.M, pts = Math.round(100 / e.qs.length * 10) / 10;
    const best = e.no !== 'r' ? Store.best(e.key) : null;
    $app.innerHTML = `
    <a href="#/exams" class="back">← Danh sách đề</a>
    <div class="result-card intro">
      <div class="ico big">📝</div>
      <h1>${e.title}</h1>
      <ul class="rules">
        <li>📋 Đề gồm <b>${e.qs.length} câu</b>, chia đều 5 chủ đề: ${TOPICS.map(t => t.icon + ' ' + t.name).join(', ')}.</li>
        <li>⏱ Thời gian làm bài: <b>${M.minutes} phút</b>. Hết giờ bài sẽ tự động được nộp.</li>
        <li>✏️ Điền đáp số hoặc chọn đáp án. Con có thể làm câu nào trước cũng được và đánh dấu 🚩 câu cần xem lại.</li>
        <li>🏅 Mỗi câu đúng được <b>${pts} điểm</b>, tổng 100 điểm. Từ 85 điểm: Vàng · 70: Bạc · 50: Đồng · 30: Khuyến khích.</li>
      </ul>
      ${best != null ? `<p>Điểm cao nhất của con với đề này: <b>${best}</b> ${T.medal(best).icon}</p>` : ''}
      <div class="actions center"><button class="btn primary big" data-act="ex-start">Bắt đầu làm bài 🚀</button></div>
    </div>`;
  }

  function startExamTimer() {
    clearTimers();
    const tick = () => {
      if (!exam || exam.submitted) return clearTimers();
      const left = (exam.endAt - Date.now()) / 1000;
      const el = document.getElementById('timer');
      if (el) { el.textContent = '⏱ ' + T.fmtTime(left); el.classList.toggle('warn', left < 300); }
      if (left <= 0) submitExam(true);
    };
    tick();
    timers.push(setInterval(tick, 500));
  }

  function renderExam() {
    const e = exam, q = e.qs[e.idx];
    const per = e.M.per;
    $app.innerHTML = `
    <div class="exam-bar">
      <div class="exam-title">${e.title}</div>
      <div class="timer" id="timer">⏱ --:--</div>
      <button class="btn primary small" data-act="ex-submit">Nộp bài</button>
    </div>
    <div class="exam-layout">
      <div>
        ${questionCard(q, `Câu ${e.idx + 1}/${e.qs.length}`, e.answers[e.idx], false)}
        <div class="actions spread">
          <button class="btn" data-act="ex-prev" ${e.idx === 0 ? 'disabled' : ''}>← Câu trước</button>
          <button class="btn ${e.flags[e.idx] ? 'flagged' : ''}" data-act="ex-flag">🚩 ${e.flags[e.idx] ? 'Bỏ đánh dấu' : 'Đánh dấu'}</button>
          <button class="btn primary" data-act="ex-next">${e.idx + 1 < e.qs.length ? 'Câu sau →' : 'Nộp bài 🏁'}</button>
        </div>
      </div>
      <aside class="navgrid">
        <h3>Bảng câu hỏi</h3>
        ${TOPICS.map((t, ti) => `<div class="nav-row"><span title="${t.name}">${t.icon}</span>${e.qs.slice(ti * per, ti * per + per).map((_, j) => {
          const i = ti * per + j;
          return `<button class="nav-q ${e.answers[i] ? 'answered' : ''} ${e.flags[i] ? 'flag' : ''} ${i === e.idx ? 'cur' : ''}" data-act="ex-go" data-i="${i}">${i + 1}</button>`;
        }).join('')}</div>`).join('')}
        <div class="legend"><span class="nav-q answered">1</span> đã làm <span class="nav-q flag">1</span> đánh dấu</div>
        <p class="muted">Đã làm ${e.answers.filter(a => a).length}/${e.qs.length} câu</p>
      </aside>
    </div>`;
    const el = document.getElementById('timer');
    if (el) el.textContent = '⏱ ' + T.fmtTime((e.endAt - Date.now()) / 1000);
    focusAns();
  }

  function examGo(i) {
    if (i < 0 || i >= exam.qs.length) return;
    exam.idx = i;
    renderExam();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function submitExam(auto) {
    const e = exam;
    if (!e || e.submitted) return;
    if (!auto) {
      const un = e.answers.filter(a => !String(a).trim()).length;
      if (!confirm(un ? `Con còn ${un} câu chưa làm. Con có muốn nộp bài luôn không?` : 'Con chắc chắn muốn nộp bài chứ?')) return;
    }
    e.submitted = true;
    clearTimers();
    e.usedSec = Math.min(e.M.minutes * 60, Math.round((Date.now() - e.startAt) / 1000));
    e.res = e.qs.map((q, i) => isCorrect(q, e.answers[i]));
    e.correct = e.res.filter(Boolean).length;
    e.score = Math.round(e.correct * 100 / e.qs.length);
    e.qs.forEach((q, i) => { Store.recordAnswer(q.topic, e.res[i]); if (!e.res[i]) Store.addMistake(q); });
    Store.addExam({ key: e.key, title: e.title, score: e.score, correct: e.correct, n: e.qs.length, usedSec: e.usedSec, date: Date.now() });
    renderExamResult();
    if (auto) alert('⏰ Hết giờ! Bài làm đã được nộp.');
    if (e.score >= 85) confetti();
  }

  function renderExamResult() {
    const e = exam, m = T.medal(e.score), per = e.M.per;
    $app.innerHTML = `
    <a href="#/exams" class="back">← Danh sách đề</a>
    <div class="result-card ${m.cls}">
      <div class="medal">${m.icon}</div>
      <h1>${e.score} điểm</h1>
      <p class="medal-name">${m.name}</p>
      <p>${e.title} · Đúng ${e.correct}/${e.qs.length} câu · Thời gian ${T.fmtTime(e.usedSec)}</p>
      <div class="topic-bars">
        ${TOPICS.map((t, ti) => {
          const c = e.res.slice(ti * per, ti * per + per).filter(Boolean).length;
          return `<div class="tb"><span>${t.icon} ${t.name}</span><div class="meter" style="--c:${t.color}"><div style="width:${c / per * 100}%"></div></div><b>${c}/${per}</b></div>`;
        }).join('')}
      </div>
      <div class="actions center">
        <a class="btn primary" href="#/exam/${e.mode}/r" data-act="ex-new">🎲 Làm đề mới</a>
        ${e.no !== 'r' ? '<button class="btn" data-act="ex-retry">🔄 Làm lại đề này</button>' : ''}
        <a class="btn" href="#/mistakes">📒 Ôn câu sai</a>
      </div>
    </div>
    <h2 class="sec-title">Xem lại bài làm</h2>
    ${reviewList(e.qs.map((q, i) => ({ q, v: e.answers[i], ok: e.res[i] })))}`;
  }

  // ---------------- TÍNH NHẨM 60 GIÂY ----------------
  function speedQuestion(level) {
    const R = T.makeRng();
    const max = level < 8 ? 10 : level < 16 ? 20 : 50;
    if (R.chance(0.5)) { const a = R.int(1, max - 1), b = R.int(1, max - a); return { text: `${a} + ${b}`, ans: a + b }; }
    const a = R.int(2, max), b = R.int(1, a); return { text: `${a} − ${b}`, ans: a - b };
  }

  function renderSpeedIntro() {
    $app.innerHTML = `
    <a href="#/" class="back">← Trang chủ</a>
    <div class="result-card intro">
      <div class="ico big">⚡</div>
      <h1>Tính nhẩm 60 giây</h1>
      <p>Làm đúng càng nhiều phép tính càng tốt trong 60 giây. Làm đúng nhiều, phép tính sẽ khó dần lên!</p>
      <p>🏆 Kỷ lục của con: <b>${Store.data.speedBest}</b> câu</p>
      <div class="actions center"><button class="btn primary big" data-act="sp-start">Bắt đầu! 🚀</button></div>
    </div>`;
  }

  function renderSpeed() {
    $app.innerHTML = `
    <div class="speed">
      <div class="speed-top"><span id="sp-time" class="timer">⏱ 60</span><span class="sess-score">✅ <b id="sp-score">${speed.score}</b></span></div>
      <div class="speed-q" id="sp-q">${speed.q.text} = ?</div>
      <div class="answer-area"><label class="ans-wrap">Đáp số: <input class="ans" inputmode="numeric" autocomplete="off" maxlength="3" placeholder="?"></label>${keypad()}</div>
      <div class="actions center"><button class="btn primary big" data-act="sp-ok">OK ✔</button></div>
    </div>`;
    focusAns();
  }

  function speedCheck() {
    const input = $app.querySelector('.ans');
    if (!input || !input.value.trim()) return;
    const ok = Number(input.value) === speed.q.ans;
    if (ok) speed.score++; else speed.wrong++;
    speed.q = speedQuestion(speed.score);
    document.getElementById('sp-score').textContent = speed.score;
    const qel = document.getElementById('sp-q');
    qel.textContent = speed.q.text + ' = ?';
    qel.classList.remove('flash-ok', 'flash-bad'); void qel.offsetWidth;
    qel.classList.add(ok ? 'flash-ok' : 'flash-bad');
    input.value = '';
    focusAns();
  }

  function endSpeed() {
    clearTimers();
    const rec = Store.setSpeed(speed.score);
    if (rec && speed.score > 0) confetti();
    $app.innerHTML = `
    <div class="result-card">
      <div class="ico big">⚡</div>
      <h1>${speed.score} câu đúng</h1>
      <p>${rec && speed.score > 0 ? '🎉 Kỷ lục mới! Con giỏi quá!' : `Kỷ lục của con: ${Store.data.speedBest} câu. Cố lên nhé!`}</p>
      <p class="muted">Số câu sai: ${speed.wrong}</p>
      <div class="actions center"><button class="btn primary" data-act="sp-start">🔄 Chơi lại</button><a class="btn" href="#/">← Trang chủ</a></div>
    </div>`;
    speed = null;
  }

  // ---------------- SỔ TAY LỖI SAI ----------------
  function renderMistakes() {
    const ms = Store.data.mistakes;
    $app.innerHTML = `
    <a href="#/" class="back">← Trang chủ</a>
    <h1 class="page-title">📒 Sổ tay lỗi sai</h1>
    <p class="lead">Những câu con làm sai sẽ được lưu ở đây. Khi con làm lại đúng, câu đó sẽ được xóa khỏi sổ tay.</p>
    ${ms.length ? `
      <div class="actions"><button class="btn primary" data-act="mk-practice">✏️ Làm lại ${Math.min(10, ms.length)} câu</button><button class="btn" data-act="mk-clear">🗑 Xóa hết</button></div>
      <div class="grid mini">${TOPICS.map(t => `<div class="card flat" style="--c:${t.color}">${t.icon} ${t.name}: <b>${ms.filter(m => m.q.topic === t.id).length}</b> câu</div>`).join('')}</div>
      ${reviewList(ms.map(m => ({ q: m.q, v: '', ok: false })))}`
      : '<div class="result-card"><div class="ico big">🎉</div><h2>Sổ tay trống!</h2><p>Con chưa có câu sai nào cần ôn. Hãy luyện tập thêm nhé!</p></div>'}`;
  }

  // ---------------- TIẾN ĐỘ ----------------
  function renderProgress() {
    const d = Store.data;
    const done = Object.values(d.stats).reduce((a, s) => a + s.done, 0);
    const correct = Object.values(d.stats).reduce((a, s) => a + s.correct, 0);
    $app.innerHTML = `
    <a href="#/" class="back">← Trang chủ</a>
    <h1 class="page-title">📊 Tiến độ học tập</h1>
    <div class="hero-stats wide">
      <div><b>${done}</b><span>câu đã làm</span></div>
      <div><b>${done ? Math.round(correct / done * 100) : 0}%</b><span>tỉ lệ đúng</span></div>
      <div><b>${Store.totalStars()}/${TOPICS.length * T.LESSON_COUNT * 3}</b><span>⭐ sao</span></div>
      <div><b>${d.exams.length}</b><span>bài thi</span></div>
      <div><b>${d.speedBest}</b><span>⚡ kỷ lục tính nhẩm</span></div>
      <div><b>${Store.streak()}</b><span>🔥 ngày liên tiếp</span></div>
    </div>
    <h2 class="sec-title">Theo chủ đề</h2>
    <div class="topic-bars card flat">
      ${TOPICS.map(t => {
        const s = d.stats[t.id] || { done: 0, correct: 0 };
        const pct = s.done ? Math.round(s.correct / s.done * 100) : 0;
        return `<div class="tb"><span>${t.icon} ${t.name}</span><div class="meter" style="--c:${t.color}"><div style="width:${pct}%"></div></div><b>${pct}%</b><small>${s.correct}/${s.done} câu · ⭐ ${topicStars(t.id)}/${T.LESSON_COUNT * 3} sao · xong ${T.lessons(t.id).filter(L => Store.stars(T.lessonKey(t.id, L.n))).length}/${T.LESSON_COUNT} bài</small></div>`;
      }).join('')}
      ${(() => {
        const weak = TOPICS.map(t => ({ t, s: d.stats[t.id] })).filter(x => x.s && x.s.done >= 5).sort((a, b) => a.s.correct / a.s.done - b.s.correct / b.s.done)[0];
        return weak ? `<p class="tip">💡 Con nên luyện thêm chủ đề <a href="#/topic/${weak.t.id}"><b>${weak.t.icon} ${weak.t.name}</b></a>.</p>` : '';
      })()}
    </div>
    <h2 class="sec-title">Lịch sử bài thi</h2>
    ${d.exams.length ? `<div class="table-wrap"><table class="hist"><thead><tr><th>Ngày</th><th>Đề</th><th>Điểm</th><th>Đúng</th><th>Thời gian</th></tr></thead><tbody>
      ${d.exams.map(x => `<tr><td>${new Date(x.date).toLocaleDateString('vi-VN')}</td><td>${esc(x.title)}</td><td><b>${x.score}</b> ${T.medal(x.score).icon}</td><td>${x.correct}/${x.n}</td><td>${T.fmtTime(x.usedSec)}</td></tr>`).join('')}
    </tbody></table></div>` : '<p class="muted">Chưa có bài thi nào. <a href="#/exams">Làm bài thi thử đầu tiên →</a></p>'}
    <div class="actions"><button class="btn danger" data-act="reset">🗑 Xóa toàn bộ dữ liệu học tập</button></div>`;
  }

  // ---------------- TÀI KHOẢN ----------------
  const Cloud = T.Cloud;
  const AVATARS = ['🐰', '🐯', '🐼', '🦊', '🐻', '🐱', '🐶', '🐸', '🐵', '🦁', '🐨', '🐧', '🦄', '🐙', '🐢', '🦖'];
  let acct = { form: null, msg: '', err: '', busy: false, guestChosen: false, emailMode: 'login', email: '', pass: '' };

  function renderAccountChip() {
    const el = document.getElementById('acct');
    if (!el) return;
    if (!Cloud.enabled) { el.innerHTML = ''; return; }
    if (Cloud.kid) el.innerHTML = `<a href="#/account" class="acct-chip" title="Đổi hồ sơ">${esc(Cloud.kid.avatar || '🙂')} ${esc(Cloud.kid.nickname || '')}</a>`;
    else if (!Cloud.ready) el.innerHTML = '';
    else if (Cloud.user) el.innerHTML = '<a href="#/account" class="acct-chip">👤 Chọn hồ sơ</a>';
    else el.innerHTML = '<a href="#/account" class="acct-chip login">Đăng nhập</a>';
  }

  async function acctRun(fn, okMsg) {
    acct.busy = true; acct.err = ''; acct.msg = ''; renderAccount();
    try { await fn(); acct.msg = okMsg || ''; }
    catch (e) { acct.err = e.message || String(e); }
    acct.busy = false;
    if (document.body.dataset.view === 'account') renderAccount();
  }

  function renderAccount() {
    const alerts = `${acct.err ? `<div class="fb bad small-fb">⚠️ ${esc(acct.err)}</div>` : ''}${acct.msg ? `<div class="fb ok small-fb">✅ ${esc(acct.msg)}</div>` : ''}`;
    if (!Cloud.enabled) {
      $app.innerHTML = `<a href="#/" class="back">← Trang chủ</a>
      <div class="result-card intro"><div class="ico big">🔒</div><h1>Tài khoản chưa được bật</h1>
      <p>Web đang chạy ở chế độ khách: tiến độ được lưu trên trình duyệt này. Người quản trị cần điền cấu hình Firebase vào <code>js/firebase-config.js</code> (xem hướng dẫn trong <code>README.md</code>).</p></div>`;
      return;
    }
    if (!Cloud.ready) { $app.innerHTML = '<div class="result-card"><div class="ico big">⏳</div><h2>Đang tải tài khoản...</h2></div>'; return; }
    const dis = acct.busy ? 'disabled' : '';

    if (Cloud.user) acct.pass = '';
    if (!Cloud.user) {
      const signup = acct.emailMode === 'signup';
      $app.innerHTML = `<a href="#/" class="back">← Trang chủ</a>
      <div class="result-card intro auth-card">
        <div class="ico big">👨‍👩‍👧</div>
        <h1>Tài khoản phụ huynh</h1>
        <p class="muted center-text">Đăng nhập để lưu tiến độ của các bé lên mạng, học tiếp trên mọi thiết bị và xem báo cáo học tập. Mỗi tài khoản có thể tạo nhiều hồ sơ cho các bé.</p>
        ${alerts}
        <button class="btn google" data-act="ac-google" ${dis}><span class="g">G</span> Đăng nhập bằng Google</button>
        <div class="or"><span>hoặc dùng email</span></div>
        <form class="auth-form" onsubmit="return false">
          <label>Email<input id="ac-email" type="email" autocomplete="email" value="${esc(acct.email)}" required></label>
          <label>Mật khẩu<input id="ac-pass" type="password" autocomplete="${signup ? 'new-password' : 'current-password'}" minlength="6" value="${esc(acct.pass)}" required></label>
          <button class="btn primary" id="primary" data-act="${signup ? 'ac-signup' : 'ac-login'}" ${dis}>${acct.busy ? '⏳ Đang xử lý...' : signup ? 'Tạo tài khoản' : 'Đăng nhập'}</button>
        </form>
        <p class="center-text small">
          ${signup ? 'Đã có tài khoản? <a href="javascript:void 0" data-act="ac-mode" data-m="login">Đăng nhập</a>' : 'Chưa có tài khoản? <a href="javascript:void 0" data-act="ac-mode" data-m="signup">Tạo tài khoản mới</a> · <a href="javascript:void 0" data-act="ac-forgot">Quên mật khẩu?</a>'}
        </p>
        <p class="muted center-text small">Không đăng nhập vẫn học được bình thường, tiến độ chỉ lưu trên máy này.</p>
      </div>`;
      return;
    }

    const f = acct.form;
    const guestHasData = !Store.isEmpty(Store.read(Store.GUEST_KEY));
    const formHtml = f ? (() => {
      const kid = f.id ? Cloud.kids.find(k => k.id === f.id) : null;
      const av = f.avatar || (kid && kid.avatar) || AVATARS[Cloud.kids.length % AVATARS.length];
      return `<div class="card flat kid-form" style="--c:#f97316">
        <h2>${kid ? 'Sửa hồ sơ' : 'Thêm hồ sơ cho bé'}</h2>
        <label class="lbl">Tên gọi của bé<input id="kid-name" maxlength="20" value="${esc(f.nickname != null ? f.nickname : kid ? kid.nickname : '')}" placeholder="Ví dụ: Bin, Na, Su..."></label>
        <p class="lbl">Chọn con vật đại diện</p>
        <div class="avatars">${AVATARS.map(a => `<button type="button" class="av ${a === av ? 'sel' : ''}" data-act="ac-av" data-a="${a}">${a}</button>`).join('')}</div>
        ${!kid && guestHasData ? '<label class="check"><input type="checkbox" id="kid-import" checked> Chuyển tiến độ đang có trên máy này (chế độ khách) vào hồ sơ này</label>' : ''}
        <p class="muted small">Để bảo vệ trẻ em, web chỉ lưu tên gọi và con vật đại diện, không cần họ tên hay ngày sinh.</p>
        <div class="actions">
          <button class="btn primary" id="primary" data-act="ac-save" ${dis}>${acct.busy ? '⏳ Đang lưu...' : '💾 Lưu'}</button>
          <button class="btn" data-act="ac-cancel">Hủy</button>
          ${kid ? `<button class="btn danger" data-act="ac-del" data-id="${kid.id}" ${dis}>🗑 Xóa hồ sơ</button>` : ''}
        </div>
      </div>`;
    })() : '';

    $app.innerHTML = `<a href="#/" class="back">← Trang chủ</a>
      <div class="acct-head">
        <div><h1 class="page-title">${Cloud.kids.length ? 'Ai đang học đấy?' : 'Tạo hồ sơ cho bé'}</h1>
        <p class="muted">Phụ huynh: <b>${esc(Cloud.user.email || Cloud.user.displayName || '')}</b></p></div>
        <button class="btn small" data-act="ac-logout" ${dis}>Đăng xuất</button>
      </div>
      ${alerts}
      <div class="kids">
        ${Cloud.kids.map(k => `<button class="kid ${Cloud.kid && Cloud.kid.id === k.id ? 'cur' : ''}" data-act="ac-pick" data-id="${k.id}" ${dis}>
          <span class="kid-av">${esc(k.avatar || '🙂')}</span><b>${esc(k.nickname)}</b><small>⭐ ${Cloud.kidSummary(k).stars} sao</small>
          ${Cloud.kid && Cloud.kid.id === k.id ? '<span class="kid-cur">Đang học</span>' : ''}
        </button>`).join('')}
        ${!f || f.id ? `<button class="kid add" data-act="ac-new"><span class="kid-av">➕</span><b>Thêm bé</b></button>` : ''}
      </div>
      ${formHtml}
      ${Cloud.kid ? '<p class="small"><a href="javascript:void 0" data-act="ac-guest">Học ở chế độ khách (không lưu vào hồ sơ nào)</a></p>' : ''}
      ${Cloud.kids.length ? `<h2 class="sec-title">📊 Báo cáo cho phụ huynh</h2>
      <div class="report">${Cloud.kids.map(k => {
        const s = Cloud.kidSummary(k);
        return `<div class="card flat rep" style="--c:#14b8a6">
          <div class="rep-head"><span class="kid-av sm">${esc(k.avatar || '🙂')}</span><b>${esc(k.nickname)}</b>
            <button class="btn small" data-act="ac-edit" data-id="${k.id}">✏️ Sửa</button></div>
          <div class="rep-grid">
            <div><b>${s.stars}</b><span>⭐ sao / ${TOPICS.length * T.LESSON_COUNT * 3}</span></div>
            <div><b>${s.done}</b><span>câu đã làm</span></div>
            <div><b>${s.pct}%</b><span>tỉ lệ đúng</span></div>
            <div><b>${s.exams}</b><span>bài thi${s.bestExam != null ? ` · cao nhất ${s.bestExam}đ` : ''}</span></div>
            <div><b>${s.streak}</b><span>🔥 ngày liên tiếp</span></div>
          </div>
          <p class="small">${s.weak ? `💡 Nên luyện thêm: <b>${s.weak.icon} ${s.weak.name}</b>. ` : ''}${s.lastExam ? `Bài thi gần nhất: ${esc(s.lastExam.title)} – <b>${s.lastExam.score} điểm</b>. ` : ''}${s.updatedAt ? `<span class="muted">Cập nhật ${s.updatedAt.toLocaleString('vi-VN')}</span>` : ''}</p>
        </div>`;
      }).join('')}</div>` : ''}`;
    const nameInput = document.getElementById('kid-name');
    if (nameInput && !acct.busy) nameInput.focus();
  }

  function acctAction(act, el) {
    const val = id => (document.getElementById(id) || {}).value || '';
    // Giữ lại nội dung đã gõ khi form được vẽ lại (ví dụ sau khi báo lỗi)
    if (document.getElementById('ac-email')) { acct.email = val('ac-email').trim(); acct.pass = val('ac-pass'); }
    switch (act) {
      case 'ac-google': acctRun(() => Cloud.signInGoogle()); break;
      case 'ac-login': case 'ac-signup': {
        const email = val('ac-email').trim(), pass = val('ac-pass');
        if (!email || !pass) { acct.err = 'Vui lòng nhập email và mật khẩu.'; renderAccount(); break; }
        acctRun(() => act === 'ac-login' ? Cloud.signInEmail(email, pass) : Cloud.signUpEmail(email, pass));
        break;
      }
      case 'ac-mode': acct.emailMode = el.dataset.m; acct.err = acct.msg = ''; renderAccount(); break;
      case 'ac-forgot': {
        const email = val('ac-email').trim();
        if (!email) { acct.err = 'Nhập email vào ô Email rồi bấm "Quên mật khẩu?" lần nữa.'; renderAccount(); break; }
        acctRun(() => Cloud.resetPassword(email), `Đã gửi email đặt lại mật khẩu tới ${email}.`);
        break;
      }
      case 'ac-logout': acctRun(() => Cloud.signOut()); acct.form = null; acct.guestChosen = false; acct.pass = ''; acct.emailMode = 'login'; break;
      case 'ac-pick':
        acct.guestChosen = false;
        acctRun(() => Cloud.selectKid(el.dataset.id)).then(() => { if (!acct.err) location.hash = '#/'; });
        break;
      case 'ac-new': acct.form = { avatar: null, nickname: null }; acct.err = acct.msg = ''; renderAccount(); break;
      case 'ac-edit': acct.form = { id: el.dataset.id, avatar: null, nickname: null }; acct.err = acct.msg = ''; renderAccount(); window.scrollTo({ top: 0, behavior: 'smooth' }); break;
      case 'ac-cancel': acct.form = null; renderAccount(); break;
      case 'ac-av':
        acct.form.avatar = el.dataset.a;
        acct.form.nickname = val('kid-name');
        document.querySelectorAll('.av').forEach(b => b.classList.toggle('sel', b === el));
        break;
      case 'ac-save': {
        const nickname = val('kid-name').trim();
        if (!nickname) { acct.err = 'Vui lòng nhập tên gọi của bé.'; acct.form.nickname = ''; renderAccount(); break; }
        const f = acct.form, kid = f.id && Cloud.kids.find(k => k.id === f.id);
        const avatar = f.avatar || (kid && kid.avatar) || document.querySelector('.av.sel').dataset.a;
        const imp = document.getElementById('kid-import');
        acctRun(async () => {
          if (f.id) await Cloud.updateKid(f.id, { nickname, avatar });
          else await Cloud.addKid({ nickname, avatar, importGuest: !!(imp && imp.checked) });
          acct.form = null;
        }, f.id ? 'Đã lưu hồ sơ.' : `Đã tạo hồ sơ cho ${nickname}. Bé có thể bắt đầu học!`);
        break;
      }
      case 'ac-del': {
        const kid = Cloud.kids.find(k => k.id === el.dataset.id);
        if (!kid || !confirm(`Xóa hồ sơ "${kid.nickname}" cùng toàn bộ tiến độ học tập? Không thể khôi phục.`)) break;
        acctRun(async () => { await Cloud.deleteKid(kid.id); acct.form = null; }, 'Đã xóa hồ sơ.');
        break;
      }
      case 'ac-guest': acct.guestChosen = true; Cloud.leaveKid().then(() => { location.hash = '#/'; }); break;
      default: return false;
    }
    return true;
  }

  // Khi trạng thái tài khoản thay đổi: cập nhật góc trên và vẽ lại trang (trừ khi bé đang làm bài)
  Cloud.subscribe(() => {
    renderAccountChip();
    const view = document.body.dataset.view;
    if (Cloud.user && !Cloud.kid && !acct.guestChosen && ['home', 'topic', 'progress', 'mistakes', 'exams'].includes(view)) {
      location.hash = '#/account';
      return;
    }
    if (['home', 'topic', 'progress', 'mistakes', 'exams'].includes(view)) route();
    else if (view === 'account' && !acct.busy) renderAccount();
  });

  // ---------------- ĐIỀU HƯỚNG ----------------
  function route() {
    clearTimers();
    speed = null;
    if (window.speechSynthesis) speechSynthesis.cancel();
    const p = (location.hash.slice(1) || '/').split('/').filter(Boolean);
    const [a, b, c] = p;
    document.body.dataset.view = a || 'home';
    if (!a) renderHome();
    else if (a === 'topic') renderTopic(b);
    else if (a === 'practice' && topicById(b) && +c >= 1 && +c <= T.LESSON_COUNT) {
      const t = topicById(b), n = +c, L = T.lessons(b)[n - 1];
      startSession({ title: `${t.icon} Bài ${n}: ${L.t}`, back: `#/topic/${b}`, topic: b, lesson: n, starKey: T.lessonKey(b, n), make: () => T.generateLesson(b, n) });
    } else if (a === 'mixed') {
      startSession({ title: '🎯 Luyện tổng hợp', back: '#/', make: () => mixedQuestions(T.makeRng(), 10) });
    } else if (a === 'daily') {
      const date = T.today();
      startSession({
        title: `🌞 Thử thách ngày ${date.split('-').reverse().join('/')}`, back: '#/', mode: 'daily',
        make: () => mixedQuestions(T.makeRng(T.hashStr('daily' + date)), 10, [1, 2, 2, 3, 2]),
        onDone: s => Store.setDaily(date, s.correct),
      });
    } else if (a === 'exams') renderExamList();
    else if (a === 'exam') routeExam(b, c === 'r' ? 'r' : +c || 1);
    else if (a === 'speed') renderSpeedIntro();
    else if (a === 'mistakes') renderMistakes();
    else if (a === 'progress') renderProgress();
    else if (a === 'account') { acct.err = acct.msg = ''; renderAccount(); }
    else renderHome();
    window.scrollTo(0, 0);
  }

  let lastHash = location.hash;
  window.addEventListener('hashchange', () => {
    if (exam && exam.started && !exam.submitted && location.hash !== lastHash) {
      if (!confirm('Con đang làm bài thi. Nếu thoát ra, bài làm sẽ bị hủy. Con có chắc không?')) {
        history.replaceState(null, '', lastHash || '#/');
        return;
      }
      exam = null;
    }
    lastHash = location.hash;
    route();
  });
  window.addEventListener('beforeunload', ev => {
    if (exam && exam.started && !exam.submitted) { ev.preventDefault(); ev.returnValue = ''; }
  });

  // ---------------- SỰ KIỆN ----------------
  $app.addEventListener('click', ev => {
    const el = ev.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;
    if (act.startsWith('ac-')) { ev.preventDefault(); acctAction(act, el); return; }
    switch (act) {
      case 'tts': speak(currentQ); break;
      case 'tts-sol': {
        const box = el.closest('.solution').cloneNode(true);
        box.querySelectorAll('button').forEach(b => b.remove());
        speakText('Lời giải. ' + toSpeech(box.innerHTML), 'sol:' + box.innerHTML);
        break;
      }
      case 'kp': {
        const input = el.closest('.answer-area').querySelector('.ans');
        if (!input || input.disabled) break;
        const k = el.dataset.k;
        if (k === '⌫') input.value = input.value.slice(0, -1);
        else if (k === 'C') input.value = '';
        else if (input.value.length < (+input.maxLength > 0 ? +input.maxLength : 4)) input.value += k;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        break;
      }
      case 'choice':
        $app.querySelectorAll('.choice').forEach(b => b.classList.toggle('sel', b === el));
        if (exam && exam.started && !exam.submitted && document.body.dataset.view === 'exam') { exam.answers[exam.idx] = el.dataset.v; refreshNav(); }
        else if (session) session.sel = el.dataset.v;
        break;
      case 'check': sessionCheck(); break;
      case 'next': session.idx++; renderSession(); window.scrollTo({ top: 0, behavior: 'smooth' }); break;
      case 'restart': startSession(session.cfg); break;
      case 'ex-start':
        exam.started = true; exam.startAt = Date.now(); exam.endAt = exam.startAt + exam.M.minutes * 60000;
        renderExam(); startExamTimer(); break;
      case 'ex-prev': examGo(exam.idx - 1); break;
      case 'ex-next': exam.idx + 1 < exam.qs.length ? examGo(exam.idx + 1) : submitExam(false); break;
      case 'ex-go': examGo(+el.dataset.i); break;
      case 'ex-flag': exam.flags[exam.idx] = !exam.flags[exam.idx]; renderExam(); break;
      case 'ex-submit': submitExam(false); break;
      case 'ex-retry': exam = buildExam(exam.mode, exam.no); renderExamIntro(); break;
      case 'ex-new': {
        ev.preventDefault();
        const mode = exam.mode;
        exam = buildExam(mode, 'r');
        lastHash = `#/exam/${mode}/r`;
        history.replaceState(null, '', lastHash);
        renderExamIntro();
        window.scrollTo(0, 0);
        break;
      }
      case 'sp-start':
        speed = { score: 0, wrong: 0, endAt: Date.now() + 60000, q: speedQuestion(0) };
        renderSpeed();
        timers.push(setInterval(() => {
          const left = Math.ceil((speed.endAt - Date.now()) / 1000);
          const el2 = document.getElementById('sp-time');
          if (el2) { el2.textContent = '⏱ ' + Math.max(0, left); el2.classList.toggle('warn', left <= 10); }
          if (left <= 0) endSpeed();
        }, 250));
        break;
      case 'sp-ok': speedCheck(); break;
      case 'mk-practice': {
        const qs = Store.data.mistakes.slice(-10).map(m => m.q);
        startSession({ title: '📒 Ôn lại câu sai', back: '#/mistakes', mode: 'mistakes', make: () => T.makeRng().shuffle(qs) });
        break;
      }
      case 'mk-clear': if (confirm('Xóa hết các câu trong sổ tay lỗi sai?')) { Store.clearMistakes(); renderMistakes(); } break;
      case 'reset': if (confirm(`Xóa toàn bộ sao, điểm thi và thống kê${Cloud.kid ? ` của ${Cloud.kid.nickname} (cả trên mạng)` : ''}? Không thể khôi phục.`)) { Store.reset(); renderProgress(); } break;
    }
  });

  function refreshNav() {
    const b = $app.querySelector(`.nav-q[data-i="${exam.idx}"]`);
    if (b) b.classList.toggle('answered', !!String(exam.answers[exam.idx]).trim());
    const m = $app.querySelector('.navgrid .muted');
    if (m) m.textContent = `Đã làm ${exam.answers.filter(a => a).length}/${exam.qs.length} câu`;
  }

  $app.addEventListener('input', ev => {
    if (ev.target.matches('.ans') && exam && exam.started && !exam.submitted && document.body.dataset.view === 'exam') {
      exam.answers[exam.idx] = ev.target.value.trim();
      refreshNav();
    }
  });

  document.addEventListener('keydown', ev => {
    if (ev.key !== 'Enter' || ev.target.tagName === 'BUTTON' || ev.target.tagName === 'A') return;
    const view = document.body.dataset.view;
    if (view === 'speed' && speed) { ev.preventDefault(); speedCheck(); }
    else if (view === 'exam' && exam && exam.started && !exam.submitted) { ev.preventDefault(); if (exam.idx + 1 < exam.qs.length) examGo(exam.idx + 1); }
    else { const p = document.getElementById('primary'); if (p) { ev.preventDefault(); p.click(); } }
  });

  if (window.speechSynthesis) speechSynthesis.getVoices();
  Cloud.init();
  renderAccountChip();
  route();
})(window.T);
