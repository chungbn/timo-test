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
  // Đáp án ô nhập: số tự nhiên (bỏ qua dấu chấm/khoảng trắng ngăn cách hàng nghìn, chữ kèm theo như "15 viên"),
  // số thập phân "3,5" (gõ dấu phẩy hoặc chấm, so theo giá trị) hoặc phân số tối giản "3/4".
  function isCorrect(q, v) {
    if (v == null || String(v).trim() === '') return false;
    if (q.type === 'choice') return v === q.answer;
    const s = String(v).trim().replace(/\s+/g, ' ');
    if (q.answer.includes('/')) return s.replace(/\s/g, '') === q.answer;
    if (q.answer.includes(',')) {
      const m = s.match(/\d+(?:[.,]\d+)?/);
      return !!m && Math.abs(Number(m[0].replace(',', '.')) - Number(q.answer.replace(',', '.'))) < 1e-9;
    }
    const m = s.replace(/(\d)[.\s](?=\d{3}(?!\d))/g, '$1').match(/\d+/);
    return !!m && Number(m[0]) === Number(q.answer);
  }

  // Lớp 4 – 5 có phân số, số thập phân: bàn phím thêm dấu phẩy và dấu gạch phân số
  function keypad(extra) {
    const keys = extra ? [1, 2, 3, 4, 5, 6, 7, 8, 9, ',', 0, '/', 'C', '⌫'] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '⌫'];
    return `<div class="keypad">${keys.map(k => `<button type="button" class="kp" data-act="kp" data-k="${k}">${k}</button>`).join('')}</div>`;
  }

  function answerArea(q, val, locked) {
    if (q.type === 'choice') {
      return `<div class="choices">${q.choices.map(c => `<button type="button" class="choice ${val === c ? 'sel' : ''}" data-act="choice" data-v="${esc(c)}" ${locked ? 'disabled' : ''}>${esc(c)}</button>`).join('')}</div>`;
    }
    const extra = (q.grade || 1) >= 4;
    return `<div class="answer-area"><label class="ans-wrap">Đáp số: <input class="ans" inputmode="${extra ? 'decimal' : 'numeric'}" autocomplete="off" maxlength="${(q.grade || 1) >= 2 ? 10 : 4}" value="${esc(val || '')}" ${locked ? 'disabled' : ''} placeholder="?"></label>${locked ? '' : keypad(extra)}</div>`;
  }

  function questionCard(q, label, val, locked) {
    const t = topicById(q.topic);
    currentQ = q;
    return `<div class="qcard" style="--c:${t.color}">
      <div class="q-top"><span class="q-label">${label}</span><span class="tag">${t.icon} ${t.name} · ${(q.grade || 1) !== T.grade ? T.gradeName(q.grade || 1) + ' · ' : ''}${T.levelName(q.lv)}</span><button type="button" class="icon-btn" data-act="tts" title="Đọc đề">🔊</button></div>
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

  // Lớp đang học: hồ sơ bé do phụ huynh đổi trong Khu vực phụ huynh; chế độ khách đổi ở trang Tiến độ
  function gradeHint() {
    if (Cloud.kid) return '<small class="muted">Cha mẹ có thể đổi lớp trong <a href="#/account">Khu vực phụ huynh</a>.</small>';
    return '<small class="muted"><a href="#/progress">Đổi lớp</a></small>';
  }
  function gradeOptions(cur) {
    return T.GRADE_LIST.map(g => `<option value="${g}" ${g === cur ? 'selected' : ''}>Lớp ${g}</option>`).join('');
  }
  function updateBrand() {
    const logo = document.querySelector('.logo');
    if (logo) logo.innerHTML = `🦉 <span>TIMO</span> Lớp ${T.grade}`;
    document.title = `Ôn thi TIMO lớp ${T.grade}`;
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
    return T.stripHtml(String(html).replace(/&frasl;/g, '⁄').replace(/<\/?(br|div|p|li)[^>]*>/gi, '. ').replace(/&nbsp;/g, ' '))
      .replace(EMOJI_RUN_RE, (m, e) => ` ${m.split(e).length - 1} ${EMOJI_WORDS[e] || ''}, `)
      .replace(EMOJI_RE, m => EMOJI_WORDS[m] ? ` ${EMOJI_WORDS[m]}, ` : ' ')
      .replace(/□/g, ' ô trống ').replace(/−/g, ' trừ ').replace(/\+/g, ' cộng ').replace(/=/g, ' bằng ')
      .replace(/×/g, ' nhân ').replace(/\s:\s/g, ' chia ').replace(/(\d)\s*[/⁄]\s*(\d)/g, '$1 phần $2').replace(/→/g, ', ').replace(/\s*<\s*/g, ' bé hơn ').replace(/\s*>\s*/g, ' lớn hơn ')
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
    // Chưa nhận quà hôm nay: đưa thẻ Thử thách lên đầu trang cho bé thấy ngay
    const dailyCard = `
    <a class="daily ${todayDone ? 'done' : ''}" href="#/daily">
      <div class="daily-ico">🌞</div>
      <div class="daily-text"><h3>Thử thách hôm nay</h3><p>${todayDone
        ? `Con đã nhận <b>${T.DAILY_BONUS} ⭐</b> hôm nay (${d.daily[T.today()]}/10 câu đúng). Mai quay lại nhận tiếp nhé!`
        : `Làm xong 10 câu hỏi là được thưởng ngay <b>${T.DAILY_BONUS} sao</b>! Mỗi ngày một lần.`}</p></div>
      ${todayDone
        ? `<span class="gift got"><span class="gift-ico">✅</span><b>+${T.DAILY_BONUS} ⭐</b><small>đã nhận</small></span>`
        : `<span class="gift"><span class="gift-ico">🎁</span><b>+${T.DAILY_BONUS} ⭐</b><small>Nhận ngay →</small></span>`}
    </a>`;
    $app.innerHTML = `
    ${todayDone ? '' : dailyCard}
    <section class="hero">
      <div class="hero-text">
        <h1>${Cloud.kid ? `Chào ${esc(Cloud.kid.nickname)} ${esc(Cloud.kid.avatar || '')}!` : `Chinh phục <span>TIMO</span> lớp ${T.grade} 🦉`}</h1>
        <p><span class="grade-pill">📘 Đang học chương trình lớp ${T.grade}</span> ${gradeHint()}</p>
        <p>Học theo 5 chủ đề của kỳ thi Olympic Toán Quốc tế TIMO: Tư duy logic, Số học, Lý thuyết số, Hình học và Tổ hợp. Mỗi lần luyện là một bộ câu hỏi mới!</p>
        <div class="hero-stats">
          <div><b>${Store.totalStars()}</b><span>⭐ sao</span></div>
          <div><b>${done}</b><span>📝 câu đã làm</span></div>
          <div><b>${bestExam}</b><span>🏆 điểm thi cao nhất</span></div>
          <div><b>${Store.streak()}</b><span>🔥 ngày liên tiếp</span></div>
        </div>
      </div>
    </section>

${todayDone ? dailyCard : ''}

    <h2 class="sec-title">📚 Học theo chủ đề</h2>
    <div class="grid topics">
      ${TOPICS.map(t => {
        const st = topicStars(t.id), max = T.LESSON_COUNT * 3;
        return `<a class="card topic" href="#/topic/${t.id}" style="--c:${t.color}">
          <div class="ico">${t.icon}</div><h3>${t.name}</h3><p>${T.topicInfo(t.id).desc}</p>
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
      <a class="card mode" href="#/rank" style="--c:#eab308"><div class="ico">🏆</div><h3>Bảng xếp hạng</h3><p>Sao, số câu theo tuần, tháng; kỷ lục ngày học, điểm thi</p></a>
      <a class="card mode" href="#/progress" style="--c:#14b8a6"><div class="ico">📊</div><h3>Tiến độ học tập</h3><p>Thống kê theo chủ đề, lịch sử bài thi</p></a>
    </div>`;
  }

  // ---------------- CHỦ ĐỀ ----------------
  function renderTopic(id) {
    if (!topicById(id)) return renderHome();
    const t = T.topicInfo(id);
    $app.innerHTML = `
    <a href="#/" class="back">← Trang chủ</a>
    <section class="topic-head" style="--c:${t.color}">
      <div class="ico big">${t.icon}</div>
      <div><h1>${t.name} <small class="muted">· Lớp ${T.grade}</small></h1><p>${t.desc}</p></div>
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
    Store.recordAnswer(T.statKey(q.topic, q.grade || 1), ok);
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
      if (stars === 3 || s.bonus) confetti();
    }
    const next = s.lesson && s.lesson < T.LESSON_COUNT ? `#/practice/${s.topic}/${s.lesson + 1}` : null;
    const msg = stars === 3 ? 'Tuyệt vời! Con là nhà toán học nhí! 🏆' : stars === 2 ? 'Rất tốt! Cố thêm chút nữa để được 3 sao nhé! 🌟' : stars === 1 ? 'Khá lắm! Xem lại lời giải và thử lần nữa nhé! 💪' : 'Không sao cả! Đọc lại phần kiến thức rồi luyện tiếp nhé! 📖';
    $app.innerHTML = `
    <div class="result-card">
      ${s.bonus ? `<div class="bonus-banner">🎁 Con hoàn thành Thử thách hôm nay và được thưởng <b>${T.DAILY_BONUS} ⭐</b>!</div>` : ''}
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
    <h1 class="page-title">📝 Thi thử TIMO lớp ${T.grade}</h1>
    <p class="lead">Đề thi được chia đều 5 chủ đề như đề thi thật. Mỗi đề số luôn giữ nguyên câu hỏi để con làm lại và so sánh điểm. Chọn "Đề ngẫu nhiên" để có đề mới hoàn toàn.</p>
    ${modes.map(([key, M]) => `
      <section class="exam-group">
        <div class="exam-group-head"><h2>${M.name}</h2><span>${M.desc}</span><a class="btn primary small" href="#/exam/${key}/r">🎲 Đề ngẫu nhiên</a></div>
        <div class="exam-grid">
          ${Array.from({ length: T.EXAM_COUNT }, (_, i) => {
            const b = Store.best(T.examKey(key, i + 1));
            const m = b != null ? T.medal(b) : null;
            return `<a class="exam-tile ${m ? m.cls : ''}" href="#/exam/${key}/${i + 1}"><b>Đề ${i + 1}</b><small>${b != null ? `${m.icon} ${b}đ` : 'Chưa làm'}</small></a>`;
          }).join('')}
        </div>
      </section>`).join('')}`;
  }

  function buildExam(mode, no) {
    const M = T.EXAM_MODES[mode], grade = T.grade;
    const qs = T.generateExam(mode, no, grade);
    return {
      mode, no, grade, key: T.examKey(mode, no, grade), M, qs,
      title: `${M.name} lớp ${grade} · ${no === 'r' ? 'Đề ngẫu nhiên' : 'Đề số ' + no}`,
      answers: qs.map(() => ''), flags: qs.map(() => false),
      idx: 0, started: false, submitted: false,
    };
  }

  function routeExam(mode, no) {
    if (!T.EXAM_MODES[mode]) return renderExamList();
    const key = T.examKey(mode, no);
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
    e.qs.forEach((q, i) => { Store.recordAnswer(T.statKey(q.topic, e.grade), e.res[i]); if (!e.res[i]) Store.addMistake(q); });
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
  // Phép tính nhẩm theo lớp: lớp 1 cộng trừ; lớp 2 thêm bảng nhân 2, 5; lớp 3 trở lên đủ bảng nhân chia, số lớn dần
  function speedQuestion(level) {
    const R = T.makeRng(), g = T.grade, hard = level >= 8 ? 1 : 0, harder = level >= 16 ? 1 : 0;
    const max = g === 1 ? (level < 8 ? 10 : level < 16 ? 20 : 50) : [0, 0, 100, 1000, 1000, 10000][g] / (harder ? 1 : hard ? 2 : 10);
    const kinds = g === 1 ? ['add', 'sub'] : g === 2 ? ['add', 'sub', 'mul'] : ['add', 'sub', 'mul', 'div'];
    const kind = R.pick(kinds);
    if (kind === 'mul' || kind === 'div') {
      const t = g === 2 ? R.pick([2, 5, 2, 5, 3, 4]) : R.int(2, 9);
      const k = g >= 4 && harder ? R.int(11, 25) : g >= 3 && hard ? R.int(2, 12) : R.int(1, 10);
      return kind === 'mul' ? { text: `${t} × ${k}`, ans: t * k } : { text: `${t * k} : ${t}`, ans: k };
    }
    if (kind === 'add') { const a = R.int(1, max - 1), b = R.int(1, max - a); return { text: `${a} + ${b}`, ans: a + b }; }
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
      <div class="answer-area"><label class="ans-wrap">Đáp số: <input class="ans" inputmode="numeric" autocomplete="off" maxlength="6" placeholder="?"></label>${keypad()}</div>
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
    ${Cloud.kid ? '' : `<div class="card flat grade-set" style="--c:#2563eb">
      <label>📘 Chương trình đang học: <select id="guest-grade">${gradeOptions(T.grade)}</select></label>
      <small class="muted">Đổi lớp sẽ đổi lộ trình bài học, đề thi và thử thách. Sao và tiến độ của từng lớp được giữ riêng.${Cloud.enabled ? ' Khi bé học bằng hồ sơ, cha mẹ đổi lớp trong Khu vực phụ huynh.' : ''}</small>
    </div>`}
    <div class="hero-stats wide">
      <div><b>${done}</b><span>câu đã làm</span></div>
      <div><b>${done ? Math.round(correct / done * 100) : 0}%</b><span>tỉ lệ đúng</span></div>
      <div><b>${Store.totalStars()}</b><span>⭐ sao (lộ trình lớp ${T.grade}: ${Store.gradeLessonStars(d, T.grade)}/${TOPICS.length * T.LESSON_COUNT * 3} · thưởng ${Store.bonusStars()})</span></div>
      <div><b>${d.exams.length}</b><span>bài thi</span></div>
      <div><b>${d.speedBest}</b><span>⚡ kỷ lục tính nhẩm</span></div>
      <div><b>${Store.streak()}</b><span>🔥 ngày liên tiếp</span></div>
      <div><b>${Store.bestStreakOf(d)}</b><span>🏅 kỷ lục ngày liên tiếp</span></div>
    </div>
    <h2 class="sec-title">Theo chủ đề · Lớp ${T.grade}</h2>
    <div class="topic-bars card flat">
      ${TOPICS.map(t => {
        const s = d.stats[T.statKey(t.id)] || { done: 0, correct: 0 };
        const pct = s.done ? Math.round(s.correct / s.done * 100) : 0;
        return `<div class="tb"><span>${t.icon} ${t.name}</span><div class="meter" style="--c:${t.color}"><div style="width:${pct}%"></div></div><b>${pct}%</b><small>${s.correct}/${s.done} câu · ⭐ ${topicStars(t.id)}/${T.LESSON_COUNT * 3} sao · xong ${T.lessons(t.id).filter(L => Store.stars(T.lessonKey(t.id, L.n))).length}/${T.LESSON_COUNT} bài</small></div>`;
      }).join('')}
      ${(() => {
        const weak = TOPICS.map(t => ({ t, s: d.stats[T.statKey(t.id)] })).filter(x => x.s && x.s.done >= 5).sort((a, b) => a.s.correct / a.s.done - b.s.correct / b.s.done)[0];
        return weak ? `<p class="tip">💡 Con nên luyện thêm chủ đề <a href="#/topic/${weak.t.id}"><b>${weak.t.icon} ${weak.t.name}</b></a>.</p>` : '';
      })()}
    </div>
    <h2 class="sec-title">Lịch sử bài thi</h2>
    ${d.exams.length ? `<div class="table-wrap"><table class="hist"><thead><tr><th>Ngày</th><th>Đề</th><th>Điểm</th><th>Đúng</th><th>Thời gian</th></tr></thead><tbody>
      ${d.exams.map(x => `<tr><td>${new Date(x.date).toLocaleDateString('vi-VN')}</td><td>${esc(x.title)}</td><td><b>${x.score}</b> ${T.medal(x.score).icon}</td><td>${x.correct}/${x.n}</td><td>${T.fmtTime(x.usedSec)}</td></tr>`).join('')}
    </tbody></table></div>` : '<p class="muted">Chưa có bài thi nào. <a href="#/exams">Làm bài thi thử đầu tiên →</a></p>'}
    ${Cloud.enabled
      ? `<p class="muted small">🔒 Việc xóa dữ liệu học tập nằm trong <a href="#/account">Khu vực phụ huynh</a>${Cloud.user ? '' : ' (cần đăng nhập tài khoản phụ huynh)'}.</p>`
      : '<div class="actions"><button class="btn danger" data-act="reset">🗑 Xóa toàn bộ dữ liệu học tập</button></div>'}`;
  }

  // ---------------- TÀI KHOẢN ----------------
  const Cloud = T.Cloud;
  const AVATARS = ['🐰', '🐯', '🐼', '🦊', '🐻', '🐱', '🐶', '🐸', '🐵', '🦁', '🐨', '🐧', '🦄', '🐙', '🐢', '🦖'];
  let acct = {
    form: null, msg: '', err: '', busy: false, guestChosen: false, emailMode: 'login', email: '', pass: '',
    unlockedUntil: 0, pin: { stage: null, buf: '', first: '', pending: null }, pinTries: 0,
    // thời điểm hết tạm khóa (sai PIN 5 lần) — lưu trên máy để tải lại trang cũng không bỏ qua được
    get pinLockUntil() { try { return +localStorage.getItem('timo1-pinlock') || 0; } catch (e) { return 0; } },
    set pinLockUntil(v) { try { localStorage.setItem('timo1-pinlock', String(v)); } catch (e) { /* bỏ qua */ } },
  };

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

  // ---- Khu vực phụ huynh: khóa bằng mã PIN 4 số ----
  const UNLOCK_MS = 10 * 60 * 1000; // mở khóa trong 10 phút kể từ thao tác cuối
  const isUnlocked = () => Date.now() < acct.unlockedUntil;
  const unlock = () => { acct.unlockedUntil = Date.now() + UNLOCK_MS; };
  const lock = () => { acct.unlockedUntil = 0; acct.form = null; };
  // Thao tác của phụ huynh: nếu đang khóa thì hỏi PIN (hoặc xác nhận tài khoản khi chưa có PIN) rồi làm tiếp
  function requireParent(act, el) {
    if (isUnlocked()) { unlock(); return true; }
    acct.pin = { stage: Cloud.hasPin() ? 'enter' : 'reauth', buf: '', first: '', pending: act ? { act, id: el && el.dataset ? el.dataset.id : undefined } : null };
    acct.err = acct.msg = '';
    renderAccount();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return false;
  }
  function afterUnlock() {
    const p = acct.pin.pending;
    acct.pin = { stage: null, buf: '', first: '', pending: null };
    if (p) acctAction(p.act, { dataset: { id: p.id } });
    else renderAccount();
  }

  async function pinKey(k) {
    const P = acct.pin;
    if (acct.busy || !['enter', 'create', 'confirm'].includes(P.stage)) return;
    if (Date.now() < acct.pinLockUntil) { acct.err = `Sai quá nhiều lần. Vui lòng đợi ${Math.ceil((acct.pinLockUntil - Date.now()) / 1000)} giây.`; renderAccount(); return; }
    if (k === '⌫') P.buf = P.buf.slice(0, -1);
    else if (P.buf.length < 4) P.buf += k;
    acct.err = '';
    if (P.buf.length < 4) { renderAccount(); return; }
    const pin = P.buf;
    P.buf = '';
    if (P.stage === 'enter') {
      acct.busy = true; renderAccount();
      const ok = await Cloud.checkPin(pin);
      acct.busy = false;
      if (ok) { acct.pinTries = 0; unlock(); afterUnlock(); return; }
      acct.pinTries++;
      if (acct.pinTries >= 5) { acct.pinTries = 0; acct.pinLockUntil = Date.now() + 30000; acct.err = 'Sai mã PIN 5 lần. Vui lòng đợi 30 giây rồi thử lại.'; }
      else acct.err = 'Mã PIN không đúng.';
      renderAccount();
    } else if (P.stage === 'create') {
      P.first = pin; P.stage = 'confirm'; renderAccount();
    } else {
      if (pin !== P.first) { P.stage = 'create'; P.first = ''; acct.err = 'Hai lần nhập không khớp. Vui lòng tạo lại mã PIN.'; renderAccount(); return; }
      await acctRun(async () => { await Cloud.setPin(pin); unlock(); }, 'Đã lưu mã PIN phụ huynh.');
      if (!acct.err) afterUnlock();
    }
  }

  function pinCard() {
    const P = acct.pin, dis = acct.busy ? 'disabled' : '';
    if (P.stage === 'reauth') {
      return `<div class="card flat pin-card" style="--c:#6366f1">
        <h2>🔐 Xác nhận tài khoản phụ huynh</h2>
        <p class="small">${Cloud.hasPin() ? 'Để đặt lại mã PIN, vui lòng xác nhận lại tài khoản.' : 'Tài khoản chưa có mã PIN. Vui lòng xác nhận tài khoản để tạo mã PIN phụ huynh.'}</p>
        ${Cloud.usesPassword()
          ? `<label class="lbl">Mật khẩu của ${esc(Cloud.user.email || '')}<input id="ac-reauth" type="password" autocomplete="current-password"></label>
             <div class="actions"><button class="btn primary" id="primary" data-act="ac-reauth" ${dis}>${acct.busy ? '⏳ Đang kiểm tra...' : 'Xác nhận'}</button><button class="btn" data-act="ac-pin-cancel">Hủy</button></div>`
          : `<div class="actions"><button class="btn google" data-act="ac-reauth" ${dis}><span class="g">G</span> Xác nhận bằng Google</button><button class="btn" data-act="ac-pin-cancel">Hủy</button></div>`}
      </div>`;
    }
    const title = { enter: '🔒 Nhập mã PIN phụ huynh', create: '🔑 Tạo mã PIN phụ huynh', confirm: '🔑 Nhập lại mã PIN để xác nhận' }[P.stage];
    const sub = { enter: 'Khu vực này dành cho cha mẹ.', create: 'Chọn 4 chữ số dễ nhớ với cha mẹ. Mã này dùng để mở khu vực phụ huynh: xóa dữ liệu học tập, sửa hoặc xóa hồ sơ, đăng xuất.', confirm: 'Nhập lại 4 chữ số vừa chọn.' }[P.stage];
    return `<div class="card flat pin-card" style="--c:#6366f1">
      <h2>${title}</h2><p class="small muted">${sub}</p>
      <div class="pin-dots">${[0, 1, 2, 3].map(i => `<span class="${i < P.buf.length ? 'on' : ''}"></span>`).join('')}</div>
      <div class="keypad pin-pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map(k => k === '' ? '<span></span>' : `<button type="button" class="kp" data-act="ac-pin-key" data-k="${k}" ${dis}>${k}</button>`).join('')}</div>
      <p class="center-text small">${P.stage === 'enter' ? '<a href="javascript:void 0" data-act="ac-pin-forgot">Quên mã PIN?</a> · ' : ''}${P.stage === 'enter' || Cloud.hasPin() ? '<a href="javascript:void 0" data-act="ac-pin-cancel">Hủy</a>' : ''}</p>
    </div>`;
  }

  function renderAccount() {
    const alerts = `${acct.err ? `<div class="fb bad small-fb">⚠️ ${esc(acct.err)}</div>` : ''}${acct.msg ? `<div class="fb ok small-fb">✅ ${esc(acct.msg)}</div>` : ''}`;
    if (!Cloud.enabled) {
      $app.innerHTML = `<a href="#/" class="back">← Trang chủ</a>
      <div class="result-card intro"><div class="ico big">🔒</div><h1>Tài khoản chưa được bật</h1>
      <p>Web đang chạy ở chế độ khách: tiến độ được lưu trên trình duyệt này. Người quản trị cần điền cấu hình Firebase vào <code>js/firebase-config.js</code> (xem hướng dẫn trong <code>README.md</code>).</p></div>`;
      return;
    }
    if (!Cloud.ready || Cloud.loading) { $app.innerHTML = '<div class="result-card"><div class="ico big">⏳</div><h2>Đang tải tài khoản...</h2></div>'; return; }
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

    // Vừa đăng nhập: phụ huynh đang cầm máy nên mở khóa; chưa có PIN thì tạo ngay
    if (Cloud.justSignedIn) {
      Cloud.justSignedIn = false;
      unlock();
      if (!Cloud.hasPin()) acct.pin = { stage: 'create', buf: '', first: '', pending: null };
    }
    const open = isUnlocked();
    if (open && Cloud.hasPin() && !Cloud.kids.length && !acct.form && !acct.pin.stage) acct.form = { avatar: null, nickname: null };

    const f = open ? acct.form : null;
    const guestHasData = !Store.isEmpty(Store.read(Store.GUEST_KEY));
    const formHtml = f ? (() => {
      const kid = f.id ? Cloud.kids.find(k => k.id === f.id) : null;
      const av = f.avatar || (kid && kid.avatar) || AVATARS[Cloud.kids.length % AVATARS.length];
      return `<div class="card flat kid-form" style="--c:#f97316">
        <h2>${kid ? 'Sửa hồ sơ' : 'Thêm hồ sơ cho bé'}</h2>
        <label class="lbl">Tên gọi của bé<input id="kid-name" maxlength="20" value="${esc(f.nickname != null ? f.nickname : kid ? kid.nickname : '')}" placeholder="Ví dụ: Bin, Na, Su..."></label>
        <label class="lbl">Bé đang học lớp<select id="kid-grade">${gradeOptions(f.grade || (kid && kid.grade) || (kid ? 1 : T.guestGrade()))}</select></label>
        <p class="muted small">Lớp quyết định lộ trình bài học, đề thi thử và thử thách hằng ngày. Đổi lớp lúc nào cũng được, tiến độ của từng lớp được giữ riêng.</p>
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

    const parentArea = open ? `
      <div class="parent-head">
        <h2 class="sec-title">👨‍👩‍👧 Khu vực phụ huynh <span class="badge-open">🔓 Đang mở</span></h2>
        <div class="actions">
          <button class="btn small" data-act="ac-new">➕ Thêm bé</button>
          <button class="btn small" data-act="ac-pin-change">🔑 Đổi mã PIN</button>
          <button class="btn small" data-act="ac-lock">🔒 Khóa lại</button>
          <button class="btn small" data-act="ac-logout" ${dis}>Đăng xuất</button>
        </div>
      </div>
      ${formHtml}
      ${Cloud.kids.length ? `<div class="report">${Cloud.kids.map(k => {
        const s = Cloud.kidSummary(k);
        return `<div class="card flat rep" style="--c:#14b8a6">
          <div class="rep-head"><span class="kid-av sm">${esc(k.avatar || '🙂')}</span><b>${esc(k.nickname)}</b><span class="grade-pill">Lớp ${k.grade || 1}</span>
            <button class="btn small" data-act="ac-edit" data-id="${k.id}">✏️ Sửa hồ sơ</button>
            <button class="btn small ${k.onLeaderboard === false ? '' : 'lb-on'}" data-act="ac-lb" data-id="${k.id}" ${dis} title="Hiện hoặc ẩn bé trên bảng xếp hạng">🏆 ${k.onLeaderboard === false ? 'Đang ẩn' : 'Đang hiện'} trên bảng xếp hạng</button>
            <button class="btn small danger" data-act="ac-reset" data-id="${k.id}" ${dis}>🗑 Xóa dữ liệu học tập</button></div>
          <div class="rep-grid">
            <div><b>${s.stars}</b><span>⭐ sao · lộ trình lớp ${s.grade} ${s.lessonStars}/${TOPICS.length * T.LESSON_COUNT * 3}</span></div>
            <div><b>${s.done}</b><span>câu đã làm</span></div>
            <div><b>${s.pct}%</b><span>tỉ lệ đúng</span></div>
            <div><b>${s.exams}</b><span>bài thi${s.bestExam != null ? ` · cao nhất ${s.bestExam}đ` : ''}</span></div>
            <div><b>${s.streak}</b><span>🔥 ngày liên tiếp · kỷ lục ${s.bestStreak}</span></div>
          </div>
          <p class="small">${s.weak ? `💡 Nên luyện thêm: <b>${s.weak.icon} ${s.weak.name}</b>. ` : ''}${s.lastExam ? `Bài thi gần nhất: ${esc(s.lastExam.title)} – <b>${s.lastExam.score} điểm</b>. ` : ''}${s.updatedAt ? `<span class="muted">Cập nhật ${s.updatedAt.toLocaleString('vi-VN')}</span>` : ''}</p>
        </div>`;
      }).join('')}</div>` : ''}
      <p class="muted small">Khu vực phụ huynh tự khóa sau 10 phút không thao tác hoặc khi bé chọn hồ sơ để học.</p>`
      : `<div class="card flat parent-locked" style="--c:#6366f1">
        <div><h2>👨‍👩‍👧 Khu vực phụ huynh</h2>
        <p class="small muted">Báo cáo học tập, thêm/sửa/xóa hồ sơ, xóa dữ liệu học tập, đổi mã PIN và đăng xuất.</p></div>
        <button class="btn primary" data-act="ac-unlock">🔒 ${Cloud.hasPin() ? 'Mở bằng mã PIN' : 'Tạo mã PIN để mở'}</button>
      </div>`;

    $app.innerHTML = `<a href="#/" class="back">← Trang chủ</a>
      <div class="acct-head">
        <div><h1 class="page-title">${Cloud.kids.length ? 'Ai đang học đấy?' : 'Tạo hồ sơ cho bé'}</h1>
        <p class="muted">Tài khoản phụ huynh: <b>${esc(Cloud.user.email || Cloud.user.displayName || '')}</b></p></div>
      </div>
      ${alerts}
      ${acct.pin.stage ? pinCard() : ''}
      ${Cloud.kids.length ? `<div class="kids">
        ${Cloud.kids.map(k => `<button class="kid ${Cloud.kid && Cloud.kid.id === k.id ? 'cur' : ''}" data-act="ac-pick" data-id="${k.id}" ${dis}>
          <span class="kid-av">${esc(k.avatar || '🙂')}</span><b>${esc(k.nickname)}</b><small>Lớp ${k.grade || 1} · ⭐ ${Cloud.kidSummary(k).stars} sao</small>
          ${Cloud.kid && Cloud.kid.id === k.id ? '<span class="kid-cur">Đang học</span>' : ''}
        </button>`).join('')}
      </div>` : ''}
      ${Cloud.kid ? '<p class="small"><a href="javascript:void 0" data-act="ac-guest">Học ở chế độ khách (không lưu vào hồ sơ nào)</a></p>' : ''}
      ${acct.pin.stage && !open ? '' : parentArea}`;
    const nameInput = document.getElementById('kid-name');
    if (nameInput && !acct.busy) nameInput.focus();
    const re = document.getElementById('ac-reauth');
    if (re && re.type === 'password' && !acct.busy) re.focus();
  }

  // Thao tác chỉ dành cho phụ huynh (cần mở khóa bằng PIN)
  const PARENT_ACTS = ['ac-new', 'ac-edit', 'ac-del', 'ac-reset', 'ac-logout', 'ac-pin-change', 'ac-lb'];

  function acctAction(act, el) {
    const val = id => (document.getElementById(id) || {}).value || '';
    // Giữ lại nội dung đã gõ khi form được vẽ lại (ví dụ sau khi báo lỗi)
    if (document.getElementById('ac-email')) { acct.email = val('ac-email').trim(); acct.pass = val('ac-pass'); }
    if (PARENT_ACTS.includes(act) && Cloud.user && !requireParent(act, el)) return true;
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
      case 'ac-logout':
        lock(); acct.guestChosen = false; acct.pass = ''; acct.emailMode = 'login';
        acctRun(() => Cloud.signOut());
        break;
      case 'ac-pick':
        acct.guestChosen = false;
        lock(); // bé bắt đầu học: khóa khu vực phụ huynh
        acctRun(() => Cloud.selectKid(el.dataset.id)).then(() => { if (!acct.err) location.hash = '#/'; });
        break;
      case 'ac-unlock': requireParent(null); break;
      case 'ac-lock': lock(); acct.msg = acct.err = ''; renderAccount(); break;
      case 'ac-pin-key': pinKey(el.dataset.k); break;
      case 'ac-pin-cancel': acct.pin = { stage: null, buf: '', first: '', pending: null }; acct.err = ''; renderAccount(); break;
      case 'ac-pin-forgot': acct.pin.stage = 'reauth'; acct.pin.buf = ''; acct.err = ''; renderAccount(); break;
      case 'ac-pin-change': acct.pin = { stage: 'create', buf: '', first: '', pending: null }; acct.err = acct.msg = ''; renderAccount(); window.scrollTo({ top: 0, behavior: 'smooth' }); break;
      case 'ac-reauth': {
        const pw = val('ac-reauth');
        if (Cloud.usesPassword() && !pw) { acct.err = 'Vui lòng nhập mật khẩu.'; renderAccount(); break; }
        acctRun(async () => { await Cloud.reauth(pw); unlock(); acct.pin.stage = 'create'; acct.pin.buf = ''; });
        break;
      }
      case 'ac-new': acct.form = { avatar: null, nickname: null }; acct.err = acct.msg = ''; renderAccount(); break;
      case 'ac-edit': acct.form = { id: el.dataset.id, avatar: null, nickname: null }; acct.err = acct.msg = ''; renderAccount(); break;
      case 'ac-cancel': acct.form = null; renderAccount(); break;
      case 'ac-av':
        acct.form.avatar = el.dataset.a;
        acct.form.nickname = val('kid-name');
        acct.form.grade = +val('kid-grade') || null;
        document.querySelectorAll('.av').forEach(b => b.classList.toggle('sel', b === el));
        break;
      case 'ac-save': {
        const nickname = val('kid-name').trim();
        if (!nickname) { acct.err = 'Vui lòng nhập tên gọi của bé.'; acct.form.nickname = ''; renderAccount(); break; }
        const f = acct.form, kid = f.id && Cloud.kids.find(k => k.id === f.id);
        const avatar = f.avatar || (kid && kid.avatar) || document.querySelector('.av.sel').dataset.a;
        const imp = document.getElementById('kid-import');
        const grade = T.validGrade(val('kid-grade'));
        acctRun(async () => {
          if (f.id) await Cloud.updateKid(f.id, { nickname, avatar, grade });
          else await Cloud.addKid({ nickname, avatar, grade, importGuest: !!(imp && imp.checked) });
          acct.form = null;
        }, f.id ? 'Đã lưu hồ sơ.' : `Đã tạo hồ sơ cho ${nickname}. Bé có thể bắt đầu học!`);
        break;
      }
      case 'ac-lb': {
        const kid = Cloud.kids.find(k => k.id === el.dataset.id);
        if (!kid) break;
        const on = kid.onLeaderboard === false;
        acctRun(() => Cloud.setLeaderboard(kid.id, on), on ? `${kid.nickname} đã hiện trên bảng xếp hạng.` : `Đã ẩn ${kid.nickname} khỏi bảng xếp hạng.`);
        break;
      }
      case 'ac-reset': {
        const kid = Cloud.kids.find(k => k.id === el.dataset.id);
        if (!kid || !confirm(`Xóa toàn bộ sao, điểm thi, thống kê và sổ tay lỗi sai của "${kid.nickname}"? Hồ sơ vẫn được giữ lại. Không thể khôi phục.`)) break;
        acctRun(() => Cloud.resetKid(kid.id), `Đã xóa dữ liệu học tập của ${kid.nickname}.`);
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

  // Gõ PIN bằng bàn phím máy tính
  document.addEventListener('keydown', ev => {
    if (document.body.dataset.view !== 'account' || !['enter', 'create', 'confirm'].includes(acct.pin.stage)) return;
    if (/^[0-9]$/.test(ev.key)) { ev.preventDefault(); pinKey(ev.key); }
    else if (ev.key === 'Backspace') { ev.preventDefault(); pinKey('⌫'); }
  });

  // ---------------- BẢNG XẾP HẠNG ----------------
  const LB_PERIODS = [['week', 'Tuần này'], ['month', 'Tháng này'], ['all', 'Mọi thời điểm']];
  const LB_METRICS = {
    stars: { icon: '⭐', name: 'Số sao', unit: 'sao' },
    done: { icon: '📝', name: 'Số câu đã làm', unit: 'câu' },
    streak: { icon: '🔥', name: 'Kỷ lục ngày học liên tiếp', unit: 'ngày', allOnly: true },
    exam: { icon: '🏆', name: 'Điểm thi cao nhất', unit: 'điểm', allOnly: true },
  };
  let lbView = (() => { try { return Object.assign({ period: 'week', metric: 'stars' }, JSON.parse(localStorage.getItem('timo1-lb') || '{}')); } catch (e) { return { period: 'week', metric: 'stars' }; } })();
  let lbToken = 0;

  function lbPeriodLabel(period) {
    if (period === 'week') { const w = T.weekDates(); const f = k => k.slice(8) + '/' + k.slice(5, 7); return `${f(w[0])} – ${f(w[6])}`; }
    if (period === 'month') { const t = T.today(); return `Tháng ${+t.slice(5, 7)}/${t.slice(0, 4)}`; }
    return 'Từ trước đến nay';
  }

  function renderRank() {
    const { period, metric } = lbView, M = LB_METRICS[metric];
    let note = '';
    if (Cloud.enabled && !Cloud.user) note = '👨‍👩‍👧 <a href="#/account">Đăng nhập tài khoản phụ huynh</a> để bé được lên bảng xếp hạng.';
    else if (Cloud.user && !Cloud.kid) note = '👤 <a href="#/account">Chọn hồ sơ của bé</a> để xem thứ hạng của bé.';
    else if (Cloud.kid && Cloud.kid.onLeaderboard === false) note = '🙈 Bé đang được ẩn khỏi bảng xếp hạng. Cha mẹ có thể bật lại trong Khu vực phụ huynh.';
    $app.innerHTML = `
      <a href="#/" class="back">← Trang chủ</a>
      <section class="rank-hero">
        <div class="rank-trophy">🏆</div>
        <h1>Bảng xếp hạng</h1>
        <p>${M.icon} ${M.name} · <b>${lbPeriodLabel(period)}</b></p>
      </section>
      <div class="rank-tabs">
        <div class="seg">${LB_PERIODS.map(([k, n]) => `<button class="${k === period ? 'on' : ''}" data-act="lb-period" data-k="${k}">${n}</button>`).join('')}</div>
        <div class="chips">${Object.entries(LB_METRICS).filter(([, m]) => period === 'all' || !m.allOnly)
          .map(([k, m]) => `<button class="chip ${k === metric ? 'on' : ''}" data-act="lb-metric" data-k="${k}">${m.icon} ${m.name}</button>`).join('')}</div>
      </div>
      <div id="lb-list" class="rank-body"><div class="rank-empty"><div class="spin">⭐</div><p>Đang tải bảng xếp hạng...</p></div></div>
      ${note ? `<p class="rank-note">${note}</p>` : ''}
      <p class="rank-foot">Bảng xếp hạng chỉ hiện tên gọi và con vật đại diện của bé. Số sao gồm sao trong lộ trình bài học và ${T.DAILY_BONUS} sao thưởng mỗi ngày hoàn thành Thử thách hôm nay; theo tuần/tháng là số sao đạt thêm trong kỳ đó. Kỷ lục ngày học liên tiếp được giữ lại kể cả khi chuỗi bị đứt.</p>`;
    if (!Cloud.enabled) { document.getElementById('lb-list').innerHTML = '<div class="rank-empty"><div class="big-ico">🔒</div><p>Bảng xếp hạng cần bật tài khoản (Firebase).</p></div>'; return; }
    loadRank(++lbToken);
  }

  async function loadRank(token) {
    const { period, metric } = lbView, M = LB_METRICS[metric], field = Cloud.lbField(period, metric);
    let rows, err;
    try { await Cloud.flush(); rows = await Cloud.fetchLeaderboard(field); } catch (e) { err = e.message; }
    const box = document.getElementById('lb-list');
    if (token !== lbToken || !box) return; // người dùng đã chuyển tab
    if (err) { box.innerHTML = `<div class="rank-empty"><div class="big-ico">⚠️</div><p>${esc(err)}</p></div>`; return; }
    const mine = r => Cloud.user && r.uid === Cloud.user.uid;
    const cur = r => Cloud.kid && mine(r) && r.kidId === Cloud.kid.id;
    const tag = r => cur(r) ? '<span class="rk-tag me">Con</span>' : mine(r) ? '<span class="rk-tag">Nhà mình</span>' : '';
    const val = r => `<b>${r[field]}</b> <small>${M.unit}</small>`;
    if (!rows.length) {
      box.innerHTML = `<div class="rank-empty"><div class="big-ico">🚀</div><p>Chưa có ai trên bảng ${period === 'all' ? 'này' : lbPeriodLabel(period).toLowerCase()}.<br><b>Hãy là người đầu tiên!</b></p></div>`;
    } else {
      // Bục vinh quang: hạng 2 – hạng 1 – hạng 3
      const podium = [1, 0, 2].filter(i => rows[i]).map(i => {
        const r = rows[i];
        return `<div class="pod pod-${i + 1} ${cur(r) ? 'me' : mine(r) ? 'ours' : ''}" data-rank="${i + 1}">
          ${i === 0 ? '<div class="crown">👑</div>' : ''}
          <div class="pod-av">${esc(r.avatar || '🙂')}</div>
          <div class="pod-name">${esc(r.nickname)}</div>${tag(r)}<div class="pod-grade">Lớp ${esc(r.grade || 1)}</div>
          <div class="pod-val">${val(r)}</div>
          <div class="pod-step"><span>${['🥇', '🥈', '🥉'][i]}</span></div>
        </div>`;
      }).join('');
      const rest = rows.slice(3).map((r, j) => `
        <li class="${cur(r) ? 'me' : mine(r) ? 'ours' : ''}" data-rank="${j + 4}">
          <span class="rk-n">${j + 4}</span><span class="rk-av">${esc(r.avatar || '🙂')}</span>
          <span class="rk-name">${esc(r.nickname)}${tag(r)}<small class="rk-grade">Lớp ${esc(r.grade || 1)}</small></span><span class="rk-val">${val(r)}</span>
        </li>`).join('');
      box.innerHTML = `<div class="podium">${podium}</div>${rest ? `<ol class="rk-list">${rest}</ol>` : ''}`;
    }
    // Thứ hạng của bé đang học
    if (Cloud.user && Cloud.kid && Cloud.kid.onLeaderboard !== false) {
      const idx = rows.findIndex(cur);
      const v = idx >= 0 ? rows[idx][field] : (Cloud.lbEntryFor(Cloud.kid, Store.data)[field] || 0);
      const msg = idx === 0 ? 'Con đang dẫn đầu! Giữ vững nhé! 👑' : idx > 0 ? `Cố thêm chút nữa để vượt lên hạng ${idx}! 💪` : v ? 'Chưa vào top 50, cố lên nhé! 💪' : 'Học thêm để lên bảng nhé! 💪';
      box.insertAdjacentHTML('beforeend', `<div class="rank-me">
        <span class="rm-av">${esc(Cloud.kid.avatar || '🙂')}</span>
        <div class="rm-text"><b>${esc(Cloud.kid.nickname)}</b><small>${msg}</small></div>
        <div class="rm-stat"><span>Hạng</span><b>${idx >= 0 ? idx + 1 : '–'}</b></div>
        <div class="rm-stat"><span>${M.name}</span><b>${v}</b></div>
      </div>`);
    }
  }

  // Khi trạng thái tài khoản thay đổi: cập nhật góc trên và vẽ lại trang (trừ khi bé đang làm bài)
  Cloud.subscribe(() => {
    renderAccountChip();
    updateBrand();
    const view = document.body.dataset.view;
    if (Cloud.user && !Cloud.kid && !acct.guestChosen && ['home', 'topic', 'progress', 'mistakes', 'exams'].includes(view)) {
      location.hash = '#/account';
      return;
    }
    if (['home', 'topic', 'progress', 'mistakes', 'exams', 'rank'].includes(view)) route();
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
    updateBrand();
    if (!a) renderHome();
    else if (a === 'topic') renderTopic(b);
    else if (a === 'practice' && topicById(b) && +c >= 1 && +c <= T.LESSON_COUNT) {
      const t = topicById(b), n = +c, L = T.lessons(b)[n - 1];
      startSession({ title: `${t.icon} Lớp ${T.grade} · Bài ${n}: ${L.t}`, back: `#/topic/${b}`, topic: b, lesson: n, starKey: T.lessonKey(b, n), make: () => T.generateLesson(b, n) });
    } else if (a === 'mixed') {
      startSession({ title: '🎯 Luyện tổng hợp', back: '#/', make: () => mixedQuestions(T.makeRng(), 10) });
    } else if (a === 'daily') {
      const date = T.today();
      startSession({
        title: `🌞 Thử thách ngày ${date.split('-').reverse().join('/')}${Store.data.daily[date] == null ? ` · 🎁 xong nhận ${T.DAILY_BONUS} ⭐` : ''}`, back: '#/', mode: 'daily',
        make: () => mixedQuestions(T.makeRng(T.hashStr('daily' + (T.grade === 1 ? '' : T.grade) + date)), 10, [1, 2, 2, 3, 2]),
        onDone: s => { s.bonus = Store.setDaily(date, s.correct); },
      });
    } else if (a === 'exams') renderExamList();
    else if (a === 'exam') routeExam(b, c === 'r' ? 'r' : +c || 1);
    else if (a === 'speed') renderSpeedIntro();
    else if (a === 'mistakes') renderMistakes();
    else if (a === 'progress') renderProgress();
    else if (a === 'rank') renderRank();
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
    if (act === 'lb-period' || act === 'lb-metric') {
      lbView[act === 'lb-period' ? 'period' : 'metric'] = el.dataset.k;
      if (lbView.period !== 'all' && LB_METRICS[lbView.metric].allOnly) lbView.metric = 'stars';
      try { localStorage.setItem('timo1-lb', JSON.stringify(lbView)); } catch (e) { /* bỏ qua */ }
      renderRank();
      return;
    }
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

  $app.addEventListener('change', ev => {
    if (ev.target.id !== 'guest-grade' || Cloud.kid) return;
    T.setGuestGrade(ev.target.value);
    T.setGrade(ev.target.value);
    exam = null;
    renderAccountChip();
    route();
  });

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
