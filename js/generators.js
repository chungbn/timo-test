(function (T) {
  'use strict';

  const NAMES = ['An', 'Bình', 'Cường', 'Dũng', 'Hoa', 'Lan', 'Mai', 'Minh', 'Nam', 'Ngọc', 'Phúc', 'Quân', 'Tú', 'Vy', 'Hà', 'Khôi'];
  const SHAPES = ['🔴', '🔵', '🟡', '🟢', '⭐', '❤️', '🔺', '🟣', '🌙', '🍀'];
  const FRUITS = ['🍎', '🍊', '🍌', '🍐', '🍇', '🍓', '🍑', '🍍', '🍉', '🥥'];
  const ANIMALS = ['🐱', '🐶', '🐰', '🐻', '🐼', '🦊', '🐸', '🐯', '🐵', '🐷'];
  const INK = '#334155';

  // ---------- helpers ----------
  function mk(o) {
    return Object.assign({ type: 'input', visual: '', choices: null }, o, { answer: String(o.answer) });
  }
  function choicesOf(R, correct, pool, n = 4) {
    const out = [String(correct)];
    for (const p of R.shuffle(pool)) {
      const s = String(p);
      if (!out.includes(s)) out.push(s);
      if (out.length >= n) break;
    }
    return R.shuffle(out);
  }
  const box = '<span class="box">□</span>';
  const C2 = n => n * (n - 1) / 2;
  const range = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };
  const sum = arr => arr.reduce((a, b) => a + b, 0);
  const digitsOf = n => String(n).split('').map(Number);

  // ---------- SVG ----------
  const line = (x1, y1, x2, y2, w = 3) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${INK}" stroke-width="${w}" stroke-linecap="round"/>`;
  const svg = (w, h, body, max) => `<svg viewBox="0 0 ${w} ${h}" class="fig" style="max-width:${max || w}px">${body}</svg>`;

  function svgSegments(n) {
    const gap = 70, w = gap * (n - 1) + 60;
    let s = line(30, 30, 30 + gap * (n - 1), 30);
    for (let i = 0; i < n; i++) {
      const x = 30 + gap * i;
      s += `<circle cx="${x}" cy="30" r="6" fill="#ef4444"/><text x="${x}" y="62" text-anchor="middle" font-size="20" font-weight="700" fill="${INK}">${'ABCDEFGH'[i]}</text>`;
    }
    return svg(w, 72, s);
  }

  function svgFan(n, layers) {
    const ax = 150, ay = 16, by = 186, x0 = 20, x1 = 280;
    let s = '';
    for (let i = 0; i < n; i++) s += line(ax, ay, x0 + (x1 - x0) * i / (n - 1), by);
    s += line(x0, by, x1, by);
    for (let k = 1; k < layers; k++) {
      const t = k / layers, y = ay + (by - ay) * t;
      s += line(ax + (x0 - ax) * t, y, ax + (x1 - ax) * t, y);
    }
    return svg(300, 200, s, 280);
  }

  function svgGrid(rows, cols) {
    const c = 46, w = cols * c + 8, h = rows * c + 8;
    let s = '';
    for (let r = 0; r <= rows; r++) s += line(4, 4 + r * c, 4 + cols * c, 4 + r * c);
    for (let k = 0; k <= cols; k++) s += line(4 + k * c, 4, 4 + k * c, 4 + rows * c);
    return svg(w, h, s);
  }

  function svgShapes(list) {
    const per = 6, c = 58, w = Math.min(list.length, per) * c + 8, h = Math.ceil(list.length / per) * c + 8;
    let s = '';
    list.forEach((t, i) => {
      const x = 4 + (i % per) * c + c / 2, y = 4 + Math.floor(i / per) * c + c / 2;
      if (t === 'tri') s += `<polygon points="${x},${y - 20} ${x - 21},${y + 17} ${x + 21},${y + 17}" fill="#fde68a" stroke="${INK}" stroke-width="2.5"/>`;
      if (t === 'sq') s += `<rect x="${x - 18}" y="${y - 18}" width="36" height="36" fill="#bfdbfe" stroke="${INK}" stroke-width="2.5"/>`;
      if (t === 'cir') s += `<circle cx="${x}" cy="${y}" r="19" fill="#fbcfe8" stroke="${INK}" stroke-width="2.5"/>`;
    });
    return svg(w, h, s);
  }

  function svgClock(h, m) {
    const cx = 100, cy = 100;
    let s = `<circle cx="${cx}" cy="${cy}" r="90" fill="#fff" stroke="${INK}" stroke-width="5"/>`;
    for (let k = 1; k <= 12; k++) {
      const a = (k * 30 - 90) * Math.PI / 180;
      s += `<text x="${(cx + 70 * Math.cos(a)).toFixed(1)}" y="${(cy + 70 * Math.sin(a) + 7).toFixed(1)}" text-anchor="middle" font-size="19" font-weight="700" fill="${INK}">${k}</text>`;
    }
    const ha = (((h % 12) + m / 60) * 30 - 90) * Math.PI / 180, ma = (m * 6 - 90) * Math.PI / 180;
    s += `<line x1="${cx}" y1="${cy}" x2="${(cx + 42 * Math.cos(ha)).toFixed(1)}" y2="${(cy + 42 * Math.sin(ha)).toFixed(1)}" stroke="#ef4444" stroke-width="8" stroke-linecap="round"/>`;
    s += `<line x1="${cx}" y1="${cy}" x2="${(cx + 66 * Math.cos(ma)).toFixed(1)}" y2="${(cy + 66 * Math.sin(ma)).toFixed(1)}" stroke="#2563eb" stroke-width="5" stroke-linecap="round"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="6" fill="${INK}"/>`;
    return svg(200, 200, s, 190);
  }

  function svgBars(heights) {
    const c = 36, H = Math.max(...heights), w = heights.length * c + 8, h = H * c + 8;
    let s = '';
    heights.forEach((ht, i) => {
      for (let j = 0; j < ht; j++) s += `<rect x="${4 + i * c}" y="${4 + (H - 1 - j) * c}" width="${c}" height="${c}" fill="#a7f3d0" stroke="${INK}" stroke-width="2.5"/>`;
    });
    return svg(w, h, s);
  }

  function svgSquareDiag(both) {
    let s = `<rect x="10" y="10" width="160" height="160" fill="none" stroke="${INK}" stroke-width="3"/>` + line(10, 10, 170, 170);
    if (both) s += line(170, 10, 10, 170);
    return svg(180, 180, s, 170);
  }

  // =====================================================================
  // TƯ DUY LOGIC
  // =====================================================================
  function logicSeq(R, lv) {
    const kind = R.pick(lv === 1 ? ['add', 'sub'] : lv === 2 ? ['add', 'sub', 'alt', 'missing'] : ['alt', 'grow', 'missing', 'double']);
    const t = [];
    let sol;
    if (kind === 'add' || kind === 'missing') {
      const s = kind === 'missing' ? R.int(2, lv === 3 ? 9 : 5) : R.int(lv === 1 ? 1 : 2, lv === 1 ? 3 : 6);
      const a = R.int(0, lv === 1 ? 6 : 15);
      for (let i = 0; i < 6; i++) t.push(a + s * i);
      if (kind === 'missing') {
        const k = R.int(1, 4);
        const shown = t.map((v, i) => i === k ? box : v).join(', ');
        return mk({
          text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${shown}</div>`,
          answer: t[k],
          solution: `Mỗi số hơn số đứng trước ${s} đơn vị. Ô trống là ${t[k - 1]} + ${s} = <b>${t[k]}</b> (thử lại: ${t[k]} + ${s} = ${t[k + 1]}).`,
        });
      }
      sol = `Mỗi số hơn số đứng trước ${s} đơn vị. Số tiếp theo là ${t[4]} + ${s} = <b>${t[5]}</b>.`;
    } else if (kind === 'sub') {
      const s = R.int(1, lv === 1 ? 2 : 5);
      const a = R.int(5 * s + (lv === 1 ? 0 : 3), 5 * s + (lv === 1 ? 6 : 20));
      for (let i = 0; i < 6; i++) t.push(a - s * i);
      sol = `Mỗi số kém số đứng trước ${s} đơn vị. Số tiếp theo là ${t[4]} − ${s} = <b>${t[5]}</b>.`;
    } else if (kind === 'alt') {
      const x = R.int(1, 5); let y = R.int(1, 5); while (y === x) y = R.int(1, 5);
      t.push(R.int(0, 10));
      for (let i = 1; i < 6; i++) t.push(t[i - 1] + (i % 2 ? x : y));
      sol = `Quy luật: cộng ${x}, cộng ${y}, cộng ${x}, cộng ${y}, ... xen kẽ nhau. Số tiếp theo là ${t[4]} + ${x} = <b>${t[5]}</b>.`;
    } else if (kind === 'grow') {
      t.push(R.int(1, 6));
      for (let i = 1; i < 6; i++) t.push(t[i - 1] + i);
      sol = `Khoảng cách giữa hai số liền nhau tăng dần: +1, +2, +3, +4, ... Số tiếp theo là ${t[4]} + 5 = <b>${t[5]}</b>.`;
    } else {
      t.push(R.int(1, 3));
      for (let i = 1; i < 6; i++) t.push(t[i - 1] * 2);
      sol = `Mỗi số bằng số đứng trước cộng với chính nó (gấp đôi). Số tiếp theo là ${t[4]} + ${t[4]} = <b>${t[5]}</b>.`;
    }
    return mk({ text: `Tìm số tiếp theo của dãy số:<div class="seq">${t.slice(0, 5).join(', ')}, ?</div>`, answer: t[5], solution: sol });
  }

  function logicPattern(R, lv) {
    let pat;
    const base = R.sample(SHAPES, 4);
    if (lv === 1) pat = base.slice(0, R.int(2, 3));
    else if (lv === 2) pat = R.chance(0.5) ? base.slice(0, 3) : [base[0], base[0], base[1]];
    else pat = R.pick([base.slice(0, 4), [base[0], base[1], base[1], base[2]], [base[0], base[0], base[1], base[2]]]);
    const k = pat.length, uniq = [...new Set(pat)];
    const extra = SHAPES.filter(s => !uniq.includes(s));
    if (lv === 1) {
      const L = 2 * k + R.int(0, k - 1);
      const shown = range(0, L - 1).map(i => pat[i % k]).join(' ');
      const ans = pat[L % k];
      return mk({
        type: 'choice', choices: choicesOf(R, ans, uniq.concat(R.sample(extra, 1))),
        text: `Hình tiếp theo là hình nào?<div class="seq emoji">${shown} ?</div>`,
        answer: ans, solution: `Nhóm hình ${pat.join('')} lặp lại liên tục. Hình tiếp theo là <b>${ans}</b>.`,
      });
    }
    const N = R.int(lv === 2 ? 10 : 16, lv === 2 ? 20 : 40);
    const shown = range(0, 2 * k - 1).map(i => pat[i % k]).join(' ');
    const q = Math.floor(N / k), r = N % k, ans = pat[(N - 1) % k];
    const groups = range(1, Math.min(q, 4)).map(i => i * k).join(', ') + (q > 4 ? `, ..., ${q * k}` : '');
    const sol = `Nhóm ${k} hình ${pat.join('')} lặp lại. Hình thứ ${groups} là hình cuối nhóm (${pat[k - 1]}).` +
      (r === 0 ? ` Vậy hình thứ ${N} là <b>${ans}</b>.` : ` Đếm tiếp ${r} hình nữa thì được hình thứ ${N}: <b>${ans}</b>.`);
    return mk({
      type: 'choice', choices: choicesOf(R, ans, uniq.concat(R.sample(extra, 1))),
      text: `Các hình được xếp theo quy luật:<div class="seq emoji">${shown} ...</div>Hình thứ <b>${N}</b> là hình nào?`,
      answer: ans, solution: sol,
    });
  }

  function logicQueue(R, lv) {
    const [A, B] = R.sample(NAMES, 2);
    const kind = lv === 1 ? 'total' : lv === 2 ? R.pick(['total', 'reverse', 'middle']) : R.pick(['between', 'ends', 'reverse']);
    if (kind === 'total') {
      const a = R.int(2, lv === 1 ? 5 : 9), b = R.int(2, lv === 1 ? 5 : 9);
      return mk({
        text: `Các bạn xếp thành một hàng ngang. ${A} đứng thứ ${a} tính từ trái sang và đứng thứ ${b} tính từ phải sang. Hỏi hàng có bao nhiêu bạn?`,
        answer: a + b - 1,
        solution: `Bên trái ${A} có ${a - 1} bạn, bên phải ${A} có ${b - 1} bạn. Cả hàng có ${a - 1} + 1 + ${b - 1} = <b>${a + b - 1}</b> bạn.`,
      });
    }
    if (kind === 'reverse') {
      const n = R.int(lv === 2 ? 7 : 12, lv === 2 ? 12 : 20), a = R.int(2, n - 1);
      return mk({
        text: `Có ${n} bạn xếp thành một hàng dọc. ${A} đứng thứ ${a} tính từ đầu hàng. Hỏi ${A} đứng thứ mấy tính từ cuối hàng?`,
        answer: n - a + 1,
        solution: `Đứng sau ${A} có ${n} − ${a} = ${n - a} bạn. Tính từ cuối hàng, ${A} đứng thứ ${n - a} + 1 = <b>${n - a + 1}</b>.`,
      });
    }
    if (kind === 'middle') {
      const n = 2 * R.int(3, 8) + 1;
      return mk({
        text: `Có ${n} bạn xếp thành một hàng. ${A} đứng chính giữa hàng. Hỏi ${A} đứng thứ mấy tính từ đầu hàng?`,
        answer: (n + 1) / 2,
        solution: `Bỏ ${A} ra còn ${n - 1} bạn, chia đều hai bên, mỗi bên ${(n - 1) / 2} bạn. ${A} đứng thứ ${(n - 1) / 2} + 1 = <b>${(n + 1) / 2}</b>.`,
      });
    }
    if (kind === 'between') {
      const k = R.int(3, 9);
      return mk({
        text: `${A} đứng đầu hàng, ${B} đứng cuối hàng. Giữa ${A} và ${B} có ${k} bạn. Hỏi hàng có bao nhiêu bạn?`,
        answer: k + 2,
        solution: `Hàng gồm ${A}, ${k} bạn ở giữa và ${B}: 1 + ${k} + 1 = <b>${k + 2}</b> bạn.`,
      });
    }
    const a = R.int(2, 6), b = R.int(2, 6), k = R.int(1, 5);
    return mk({
      text: `Trong một hàng ngang, ${A} đứng thứ ${a} tính từ bên trái, ${B} đứng thứ ${b} tính từ bên phải. Giữa ${A} và ${B} có ${k} bạn (${A} đứng bên trái ${B}). Hỏi hàng có bao nhiêu bạn?`,
      answer: a + k + b,
      solution: `Tính từ trái đến ${A} có ${a} bạn, giữa hai bạn có ${k} bạn, tính từ ${B} đến hết bên phải có ${b} bạn. Cả hàng: ${a} + ${k} + ${b} = <b>${a + k + b}</b> bạn.`,
    });
  }

  function logicCompare(R, lv) {
    const attrs = [
      ['cao hơn', 'thấp hơn', 'cao nhất', 'thấp nhất', 'cao thứ hai'],
      ['nặng hơn', 'nhẹ hơn', 'nặng nhất', 'nhẹ nhất', 'nặng thứ hai'],
      ['có nhiều kẹo hơn', 'có ít kẹo hơn', 'có nhiều kẹo nhất', 'có ít kẹo nhất', 'có nhiều kẹo thứ hai'],
      ['chạy nhanh hơn', 'chạy chậm hơn', 'chạy nhanh nhất', 'chạy chậm nhất', 'chạy nhanh thứ hai'],
    ];
    const [more, less, most, least, second] = R.pick(attrs);
    const o = R.sample(NAMES, lv === 1 ? 3 : 4);
    const st = [];
    for (let i = 0; i < o.length - 1; i++) st.push(R.chance(0.5) ? `${o[i]} ${more} ${o[i + 1]}` : `${o[i + 1]} ${less} ${o[i]}`);
    const ask = lv === 3 ? R.pick(['most', 'least', 'second']) : R.pick(['most', 'least']);
    const ans = ask === 'most' ? o[0] : ask === 'least' ? o[o.length - 1] : o[1];
    const word = ask === 'most' ? most : ask === 'least' ? least : second;
    return mk({
      type: 'choice', choices: R.shuffle(o),
      text: `${R.shuffle(st).join('. ')}.<br>Hỏi bạn nào ${word}?`,
      answer: ans,
      solution: `Sắp xếp theo thứ tự (bạn ${most.replace(' nhất', '')} nhất đứng đầu): ${o.join(' → ')}. Bạn ${word} là <b>${ans}</b>.`,
    });
  }

  function logicExchange(R, lv) {
    const [X, Y, Z] = R.sample(FRUITS, 3);
    const a = lv === 1 ? 2 : R.int(2, 3), b = R.int(2, lv === 1 ? 3 : 4);
    const times = lv === 3 ? 2 : 1;
    const ans = times * a * b;
    const adds = Array(a).fill(b).join(' + ');
    let sol = `1 ${X} nặng bằng ${a} ${Y}. Mỗi ${Y} nặng bằng ${b} ${Z}, nên 1 ${X} nặng bằng ${adds} = `;
    sol += times === 2
      ? `${a * b} ${Z}. Vậy 2 ${X} nặng bằng ${a * b} + ${a * b} = <b>${ans}</b> ${Z}.`
      : `<b>${ans}</b> ${Z}.`;
    return mk({
      text: `Trên cân thăng bằng:<div class="seq emoji">1 ${X} = ${a} ${Y}<br>1 ${Y} = ${b} ${Z}</div>Hỏi ${times} ${X} nặng bằng mấy ${Z}?`,
      answer: ans, solution: sol,
    });
  }

  function logicAge(R, lv) {
    const A = R.pick(NAMES);
    const rel = R.pick([['anh', 'hơn'], ['chị', 'hơn'], ['em', 'kém']]);
    const a = R.int(6, 9), d = R.int(2, 6);
    const other = rel[1] === 'hơn' ? a + d : a - d;
    if (other < 1) return logicAge(R, lv);
    if (lv === 1) {
      return mk({
        text: `Năm nay ${A} ${a} tuổi. ${rel[0][0].toUpperCase() + rel[0].slice(1)} của ${A} ${rel[1]} ${A} ${d} tuổi. Hỏi năm nay ${rel[0]} của ${A} bao nhiêu tuổi?`,
        answer: other,
        solution: `${rel[1] === 'hơn' ? 'Hơn' : 'Kém'} ${d} tuổi nên ${rel[0]} ${a} ${rel[1] === 'hơn' ? '+' : '−'} ${d} = <b>${other}</b> tuổi.`,
      });
    }
    if (lv === 2) {
      const k = R.int(2, 5);
      return mk({
        text: `Năm nay ${A} ${a} tuổi, ${rel[0]} của ${A} ${rel[1]} ${A} ${d} tuổi. Hỏi ${k} năm nữa ${rel[0]} của ${A} bao nhiêu tuổi?`,
        answer: other + k,
        solution: `Năm nay ${rel[0]} ${other} tuổi. ${k} năm nữa ${rel[0]} ${other} + ${k} = <b>${other + k}</b> tuổi.`,
      });
    }
    const b = a + d, c = a + R.int(2, 6);
    return mk({
      text: `Năm nay ${A} ${a} tuổi, anh của ${A} ${b} tuổi. Hỏi khi ${A} ${c} tuổi thì anh của ${A} bao nhiêu tuổi?`,
      answer: c + d,
      solution: `Anh luôn hơn ${A} ${b} − ${a} = ${d} tuổi. Khi ${A} ${c} tuổi thì anh ${c} + ${d} = <b>${c + d}</b> tuổi.`,
    });
  }

  function logicCut(R, lv) {
    const kind = lv === 1 ? R.pick(['cut', 'trees']) : lv === 2 ? R.pick(['cut', 'time', 'trees']) : R.pick(['time', 'stairs', 'gaps']);
    if (kind === 'cut') {
      const n = R.int(lv === 1 ? 2 : 4, lv === 1 ? 5 : 10);
      return mk({ text: `Bác thợ mộc cưa một khúc gỗ thành ${n} đoạn. Hỏi bác phải cưa mấy lần?`, answer: n - 1, solution: `Mỗi lần cưa tạo thêm 1 đoạn. Từ 1 đoạn thành ${n} đoạn cần ${n} − 1 = <b>${n - 1}</b> lần cưa.` });
    }
    if (kind === 'time') {
      const n = R.int(3, lv === 2 ? 5 : 7), m = R.int(2, lv === 2 ? 3 : 5);
      const ans = (n - 1) * m;
      return mk({ text: `Cưa một khúc gỗ thành ${n} đoạn. Mỗi lần cưa mất ${m} phút. Hỏi cưa xong mất bao nhiêu phút?`, answer: ans, solution: `Cưa thành ${n} đoạn cần ${n - 1} lần cưa. Thời gian: ${Array(n - 1).fill(m).join(' + ')} = <b>${ans}</b> phút.` });
    }
    if (kind === 'trees') {
      const n = R.int(3, lv === 1 ? 6 : 12);
      return mk({ text: `Trồng ${n} cây thành một hàng thẳng. Giữa hai cây liền nhau có một khoảng cách. Hỏi có bao nhiêu khoảng cách?`, answer: n - 1, solution: `Số khoảng cách ít hơn số cây 1: ${n} − 1 = <b>${n - 1}</b>.` });
    }
    if (kind === 'gaps') {
      const k = R.int(4, 12);
      return mk({ text: `Trên một đoạn đường có ${k} khoảng cách bằng nhau. Người ta trồng cây ở cả hai đầu đường và giữa các khoảng. Hỏi trồng bao nhiêu cây?`, answer: k + 1, solution: `Trồng cả hai đầu thì số cây nhiều hơn số khoảng 1: ${k} + 1 = <b>${k + 1}</b> cây.` });
    }
    const f = R.int(3, 5), s = R.int(5, 10);
    const ans = (f - 1) * s;
    return mk({ text: `Để lên mỗi tầng phải bước ${s} bậc thang. Hỏi đi từ tầng 1 lên tầng ${f} phải bước bao nhiêu bậc?`, answer: ans, solution: `Từ tầng 1 lên tầng ${f} phải đi ${f - 1} lượt cầu thang: ${Array(f - 1).fill(s).join(' + ')} = <b>${ans}</b> bậc.` });
  }

  // =====================================================================
  // SỐ HỌC
  // =====================================================================
  function arithCalc(R, lv) {
    if (lv === 1) {
      if (R.chance(0.5)) { const a = R.int(1, 9), b = R.int(1, 10 - a); return mk({ text: `Tính: <div class="seq">${a} + ${b} = ?</div>`, answer: a + b, solution: `${a} + ${b} = <b>${a + b}</b>.` }); }
      const a = R.int(3, 10), b = R.int(1, a); return mk({ text: `Tính: <div class="seq">${a} − ${b} = ?</div>`, answer: a - b, solution: `${a} − ${b} = <b>${a - b}</b>.` });
    }
    if (lv === 2) {
      const a = R.int(5, 15), b = R.int(1, 20 - a), c = R.int(1, a + b);
      return mk({ text: `Tính: <div class="seq">${a} + ${b} − ${c} = ?</div>`, answer: a + b - c, solution: `${a} + ${b} = ${a + b}; ${a + b} − ${c} = <b>${a + b - c}</b>.` });
    }
    if (R.chance(0.5)) {
      const a = R.int(2, 7) * 10 + R.int(0, 9), b = R.int(1, 9 - Math.floor(a / 10)) * 10 + R.int(0, 9 - a % 10);
      return mk({ text: `Tính: <div class="seq">${a} + ${b} = ?</div>`, answer: a + b, solution: `Cộng chục với chục, đơn vị với đơn vị: ${a} + ${b} = <b>${a + b}</b>.` });
    }
    const a = R.int(40, 99), b = R.int(10, a - 10), c = R.int(1, 9);
    return mk({ text: `Tính: <div class="seq">${a} − ${b} + ${c} = ?</div>`, answer: a - b + c, solution: `${a} − ${b} = ${a - b}; ${a - b} + ${c} = <b>${a - b + c}</b>.` });
  }

  function arithMissing(R, lv) {
    const max = lv === 1 ? 10 : lv === 2 ? 20 : 99;
    const kind = lv === 3 ? R.pick(['plus', 'minus1', 'minus2', 'balance', 'same']) : R.pick(['plus', 'minus1', 'minus2']);
    if (kind === 'plus') {
      const a = R.int(1, max - 2), x = R.int(1, max - a), b = a + x;
      const left = R.chance(0.5) ? `${box} + ${a}` : `${a} + ${box}`;
      return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${left} = ${b}</div>`, answer: x, solution: `Số cần tìm = ${b} − ${a} = <b>${x}</b>.` });
    }
    if (kind === 'minus1') {
      const b = R.int(0, max - 2), a = R.int(1, max - b), x = a + b;
      return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${box} − ${a} = ${b}</div>`, answer: x, solution: `Số bị trừ = hiệu + số trừ = ${b} + ${a} = <b>${x}</b>.` });
    }
    if (kind === 'minus2') {
      const a = R.int(3, max), x = R.int(1, a), b = a - x;
      return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${a} − ${box} = ${b}</div>`, answer: x, solution: `Số trừ = số bị trừ − hiệu = ${a} − ${b} = <b>${x}</b>.` });
    }
    if (kind === 'balance') {
      const b = R.int(5, 20), c = R.int(5, 20), a = R.int(1, b + c - 1), x = b + c - a;
      return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${a} + ${box} = ${b} + ${c}</div>`, answer: x, solution: `Vế phải: ${b} + ${c} = ${b + c}. Vậy ${box} = ${b + c} − ${a} = <b>${x}</b>.` });
    }
    const x = R.int(2, 15);
    return mk({ text: `Hai ô trống có cùng một số. Tìm số đó:<div class="seq">${box} + ${box} = ${2 * x}</div>`, answer: x, solution: `Tìm số cộng với chính nó bằng ${2 * x}: ${x} + ${x} = ${2 * x}. Số đó là <b>${x}</b>.` });
  }

  function arithQuick(R, lv) {
    const kind = lv === 1 ? R.pick(['pairs', 'same']) : lv === 2 ? R.pick(['pairs', 'consec', 'same']) : R.pick(['consec', 'cancel', 'near']);
    if (kind === 'pairs') {
      const k = lv === 1 ? 2 : 3;
      const firsts = R.sample(range(1, 9), k), nums = [];
      firsts.forEach(a => nums.push(a, 10 - a));
      const order = R.shuffle(nums);
      return mk({ text: `Tính nhanh:<div class="seq">${order.join(' + ')} = ?</div>`, answer: 10 * k, solution: `Ghép thành các cặp có tổng bằng 10: ${firsts.map(a => `(${a} + ${10 - a})`).join(' + ')} = ${Array(k).fill(10).join(' + ')} = <b>${10 * k}</b>.` });
    }
    if (kind === 'same') {
      const a = R.int(2, lv === 1 ? 4 : 9), n = R.int(3, lv === 1 ? 4 : 6);
      return mk({ text: `Tính:<div class="seq">${Array(n).fill(a).join(' + ')} = ?</div>`, answer: a * n, solution: `Đếm thêm ${a} liên tiếp ${n} lần: ${range(1, n).map(i => a * i).join(', ')}. Kết quả <b>${a * n}</b>.` });
    }
    if (kind === 'consec') {
      const a = lv === 2 ? 1 : R.int(1, 11), len = R.int(lv === 2 ? 5 : 6, 9), b = a + len - 1;
      const nums = range(a, b), ans = sum(nums);
      const parts = [];
      for (let i = 0; i < Math.floor(len / 2); i++) parts.push(`(${nums[i]} + ${nums[len - 1 - i]})`);
      if (len % 2) parts.push(`${nums[(len - 1) / 2]}`);
      return mk({ text: `Tính nhanh:<div class="seq">${nums.join(' + ')} = ?</div>`, answer: ans, solution: `Ghép số đầu với số cuối: ${parts.join(' + ')}. Mỗi cặp bằng ${a + b}, có ${Math.floor(len / 2)} cặp${len % 2 ? ` và số ${nums[(len - 1) / 2]} ở giữa` : ''}. Kết quả <b>${ans}</b>.` });
    }
    if (kind === 'cancel') {
      const a = R.int(10, 50), b = R.int(2, 9), c = R.int(2, 9);
      return mk({ text: `Tính nhanh:<div class="seq">${a} + ${b} + ${c} − ${b} − ${c} = ?</div>`, answer: a, solution: `Cộng ${b} rồi trừ ${b}, cộng ${c} rồi trừ ${c} thì như không thêm gì. Kết quả <b>${a}</b>.` });
    }
    const a = R.int(1, 7) * 10 + 9, b = R.int(11, 89 - a);
    return mk({ text: `Tính nhanh:<div class="seq">${a} + ${b} = ?</div>`, answer: a + b, solution: `${a} = ${a + 1} − 1. Nên ${a} + ${b} = ${a + 1} + ${b} − 1 = ${a + 1 + b} − 1 = <b>${a + b}</b>.` });
  }

  function arithWord(R, lv) {
    const [A, B] = R.sample(NAMES, 2);
    if (lv === 1) {
      const t = R.pick([
        () => { const a = R.int(2, 7), b = R.int(1, 10 - a); return mk({ text: `${A} có ${a} viên bi. Mẹ cho ${A} thêm ${b} viên bi. Hỏi ${A} có tất cả bao nhiêu viên bi?`, answer: a + b, solution: `${a} + ${b} = <b>${a + b}</b> viên bi.` }); },
        () => { const a = R.int(5, 10), b = R.int(1, a - 1); return mk({ text: `Trên cành cây có ${a} con chim. ${b} con bay đi. Hỏi trên cành còn lại bao nhiêu con chim?`, answer: a - b, solution: `${a} − ${b} = <b>${a - b}</b> con chim.` }); },
        () => { const a = R.int(2, 8), b = R.int(1, 10 - a); return mk({ text: `Lớp em có ${a} bạn đội mũ đỏ và ${b} bạn đội mũ xanh. Hỏi có tất cả bao nhiêu bạn đội mũ?`, answer: a + b, solution: `${a} + ${b} = <b>${a + b}</b> bạn.` }); },
      ]);
      return t();
    }
    if (lv === 2) {
      const t = R.pick([
        () => { const a = R.int(5, 12), b = R.int(2, 7); return mk({ text: `${A} có ${a} cái kẹo. ${B} có nhiều hơn ${A} ${b} cái kẹo. Hỏi ${B} có bao nhiêu cái kẹo?`, answer: a + b, solution: `Nhiều hơn thì làm phép cộng: ${a} + ${b} = <b>${a + b}</b> cái kẹo.` }); },
        () => { const a = R.int(10, 19), b = R.int(2, 8); return mk({ text: `Hàng trên có ${a} bông hoa. Hàng dưới ít hơn hàng trên ${b} bông hoa. Hỏi hàng dưới có bao nhiêu bông hoa?`, answer: a - b, solution: `Ít hơn thì làm phép trừ: ${a} − ${b} = <b>${a - b}</b> bông hoa.` }); },
        () => { const a = R.int(8, 15), b = R.int(1, 5), c = R.int(1, 5); return mk({ text: `${A} có ${a} quyển vở. ${A} cho em ${b} quyển, sau đó mẹ mua thêm cho ${A} ${c} quyển. Hỏi ${A} có bao nhiêu quyển vở?`, answer: a - b + c, solution: `${a} − ${b} = ${a - b}; ${a - b} + ${c} = <b>${a - b + c}</b> quyển.` }); },
      ]);
      return t();
    }
    const t = R.pick([
      () => { const a = R.int(6, 15), b = R.int(2, 8); return mk({ text: `${A} có ${a} viên bi. ${B} có nhiều hơn ${A} ${b} viên bi. Hỏi cả hai bạn có bao nhiêu viên bi?`, answer: 2 * a + b, solution: `${B} có ${a} + ${b} = ${a + b} viên. Cả hai có ${a} + ${a + b} = <b>${2 * a + b}</b> viên.` }); },
      () => { const d = R.int(6, 15), c = R.int(2, 5); return mk({ text: `${A} cho ${B} ${c} cái kẹo thì hai bạn có số kẹo bằng nhau, mỗi bạn có ${d} cái. Hỏi lúc đầu ${A} có bao nhiêu cái kẹo?`, answer: d + c, solution: `Trước khi cho, ${A} có nhiều hơn ${c} cái: ${d} + ${c} = <b>${d + c}</b> cái kẹo.` }); },
      () => { const a = R.int(12, 20), b = R.int(2, 6); return mk({ text: `Hàng trên có ${a} bông hoa, hàng dưới ít hơn hàng trên ${b} bông. Hỏi cả hai hàng có bao nhiêu bông hoa?`, answer: 2 * a - b, solution: `Hàng dưới: ${a} − ${b} = ${a - b} bông. Cả hai hàng: ${a} + ${a - b} = <b>${2 * a - b}</b> bông.` }); },
      () => { const total = R.int(15, 30), a = R.int(5, total - 5); return mk({ text: `Lớp 1A có ${total} bạn, trong đó có ${a} bạn nam. Hỏi số bạn nữ nhiều hơn hay ít hơn số bạn nam bao nhiêu bạn? (Ghi số bạn chênh lệch)`, answer: Math.abs(total - 2 * a), solution: `Số bạn nữ: ${total} − ${a} = ${total - a}. Chênh lệch: ${Math.max(a, total - a)} − ${Math.min(a, total - a)} = <b>${Math.abs(total - 2 * a)}</b> bạn.` }); },
    ]);
    return t();
  }

  function arithSymbols(R, lv) {
    const [X, Y, Z] = R.sample(ANIMALS, 3);
    const x = R.int(1, 9), y = R.int(1, 9), z = R.int(1, 9);
    if (lv === 1) return mk({ text: `Mỗi con vật là một số. Tìm số của ${X}:<div class="seq emoji">${X} + ${X} = ${2 * x}</div>`, answer: x, solution: `Số nào cộng với chính nó bằng ${2 * x}? ${x} + ${x} = ${2 * x}. Vậy ${X} = <b>${x}</b>.` });
    if (lv === 2) return mk({ text: `Mỗi con vật là một số. Tìm số của ${Y}:<div class="seq emoji">${X} + ${X} = ${2 * x}<br>${X} + ${Y} = ${x + y}</div>`, answer: y, solution: `Từ dòng 1: ${X} = ${x}. Từ dòng 2: ${Y} = ${x + y} − ${x} = <b>${y}</b>.` });
    return mk({ text: `Mỗi con vật là một số. Tìm số của ${Z}:<div class="seq emoji">${X} + ${X} + ${X} = ${3 * x}<br>${X} + ${Y} = ${x + y}<br>${Y} + ${Z} = ${y + z}</div>`, answer: z, solution: `${X} = ${x} (vì ${x} + ${x} + ${x} = ${3 * x}). ${Y} = ${x + y} − ${x} = ${y}. ${Z} = ${y + z} − ${y} = <b>${z}</b>.` });
  }

  function arithCompare(R, lv) {
    let L, Rt, lt, rt;
    const forceEq = R.chance(0.25);
    if (lv === 1) {
      const a = R.int(1, 9), b = R.int(1, 10 - a); L = a + b; lt = `${a} + ${b}`;
      Rt = forceEq ? L : R.int(Math.max(1, L - 3), Math.min(10, L + 3)); rt = `${Rt}`;
    } else if (lv === 2) {
      const a = R.int(3, 12), b = R.int(1, 8); L = a + b; lt = `${a} + ${b}`;
      const c = forceEq ? R.int(1, L - 1) : R.int(2, 12), d = forceEq ? L - c : R.int(1, 8); Rt = c + d; rt = `${c} + ${d}`;
    } else {
      const a = R.int(20, 60), b = R.int(5, 30), c = R.int(1, 20); L = a + b - c; lt = `${a} + ${b} − ${c}`;
      const d = forceEq ? R.int(10, L) : R.int(20, 60), e = forceEq ? L - d : R.int(1, 30); Rt = d + e; rt = `${d} + ${e}`;
    }
    const ans = L > Rt ? '>' : L < Rt ? '<' : '=';
    return mk({
      type: 'choice', choices: ['>', '<', '='],
      text: `Chọn dấu thích hợp điền vào ô trống:<div class="seq">${lt} ${box} ${rt}</div>`,
      answer: ans, solution: `Vế trái bằng ${L}, vế phải bằng ${Rt}. Vì ${L} ${ans} ${Rt} nên điền dấu <b>${T.esc(ans)}</b>.`,
    });
  }

  function arithCount(R, lv) {
    const a = R.int(2, 9), b = a + R.int(3, 9);
    if (lv === 2) return mk({ text: `Tìm số lớn nhất có thể điền vào ô trống:<div class="seq">${box} + ${a} < ${b}</div>`, answer: b - a - 1, solution: `${box} + ${a} phải bé hơn ${b} nên ${box} bé hơn ${b} − ${a} = ${b - a}. Số lớn nhất là <b>${b - a - 1}</b>.` });
    return mk({ text: `Có bao nhiêu số (kể cả số 0) có thể điền vào ô trống?<div class="seq">${box} + ${a} < ${b}</div>`, answer: b - a, solution: `${box} bé hơn ${b} − ${a} = ${b - a}. Các số đó là 0, 1, ..., ${b - a - 1}: có <b>${b - a}</b> số.` });
  }

  // =====================================================================
  // LÝ THUYẾT SỐ
  // =====================================================================
  function ntPlace(R, lv) {
    if (lv === 1) {
      const c = R.int(1, 9), d = R.int(0, 9);
      return mk({ text: `Số gồm ${c} chục và ${d} đơn vị là số nào?`, answer: 10 * c + d, solution: `${c} chục là ${10 * c}, thêm ${d} đơn vị được <b>${10 * c + d}</b>.` });
    }
    if (lv === 2) {
      const n = R.int(11, 99), ask = R.pick(['chục', 'đơn vị']), ans = ask === 'chục' ? Math.floor(n / 10) : n % 10;
      return mk({ text: `Chữ số hàng ${ask} của số ${n} là mấy?`, answer: ans, solution: `${n} gồm ${Math.floor(n / 10)} chục và ${n % 10} đơn vị. Chữ số hàng ${ask} là <b>${ans}</b>.` });
    }
    const c = R.int(1, 7), d = R.int(10, 19), ans = 10 * c + d;
    return mk({ text: `Số gồm ${c} chục và ${d} đơn vị là số nào?`, answer: ans, solution: `${d} đơn vị = 1 chục và ${d - 10} đơn vị. Vậy có ${c + 1} chục và ${d - 10} đơn vị, là số <b>${ans}</b>.` });
  }

  function ntEvenOdd(R, lv) {
    const even = R.chance(0.5), w = even ? 'chẵn' : 'lẻ';
    let a, b;
    if (lv === 1) { a = 1; b = R.int(6, 12); }
    else if (lv === 2) { a = R.int(1, 15); b = a + R.int(6, 15); }
    else { a = R.int(10, 60); b = a + R.int(15, 35); }
    const list = range(a, b).filter(n => (n % 2 === 0) === even);
    const sol = list.length <= 14
      ? `Các số ${w} từ ${a} đến ${b}: ${list.join(', ')}. Có <b>${list.length}</b> số.`
      : `Các số ${w} là ${list[0]}, ${list[1]}, ${list[2]}, ..., ${list[list.length - 1]}. Đếm theo bước nhảy 2 được <b>${list.length}</b> số.`;
    return mk({ text: `Từ ${a} đến ${b} có bao nhiêu số ${w}?`, answer: list.length, solution: sol });
  }

  function ntCount(R, lv) {
    if (lv === 1) {
      const a = R.int(1, 10), b = a + R.int(3, 8);
      return mk({ text: `Có bao nhiêu số lớn hơn ${a} và bé hơn ${b}?`, answer: b - a - 1, solution: `Đó là các số ${range(a + 1, b - 1).join(', ')}. Có <b>${b - a - 1}</b> số.` });
    }
    if (lv === 2) {
      const a = R.int(5, 40), b = a + R.int(8, 30);
      return mk({ text: `Từ ${a} đến ${b} có bao nhiêu số?`, answer: b - a + 1, solution: `Số lượng số = ${b} − ${a} + 1 = <b>${b - a + 1}</b>.` });
    }
    const t = R.pick([
      () => { const b = R.int(20, 60); return mk({ text: `Có bao nhiêu số có hai chữ số bé hơn ${b}?`, answer: b - 10, solution: `Các số từ 10 đến ${b - 1}: ${b - 1} − 10 + 1 = <b>${b - 10}</b> số.` }); },
      () => mk({ text: 'Có bao nhiêu số có hai chữ số giống nhau?', answer: 9, solution: '11, 22, 33, 44, 55, 66, 77, 88, 99: có <b>9</b> số.' }),
      () => { const b = R.int(50, 90); return mk({ text: `Có bao nhiêu số có hai chữ số lớn hơn ${b}?`, answer: 99 - b, solution: `Các số từ ${b + 1} đến 99: 99 − ${b + 1} + 1 = <b>${99 - b}</b> số.` }); },
      () => { const d = R.int(1, 9); return mk({ text: `Có bao nhiêu số có hai chữ số mà chữ số hàng chục là ${d}?`, answer: 10, solution: `Đó là ${d}0, ${d}1, ..., ${d}9: có <b>10</b> số.` }); },
    ]);
    return t();
  }

  function ntSpecial(R, lv) {
    const qs = lv === 1 ? [
      ['Số lớn nhất có một chữ số là số nào?', 9, 'Các số có một chữ số là 0 đến 9. Lớn nhất là <b>9</b>.'],
      ['Số bé nhất có hai chữ số là số nào?', 10, 'Số có hai chữ số nhỏ nhất là <b>10</b>.'],
      ['Số lớn nhất có hai chữ số là số nào?', 99, 'Số có hai chữ số lớn nhất là <b>99</b>.'],
      ['Số tròn chục lớn nhất có hai chữ số là số nào?', 90, 'Các số tròn chục: 10, 20, ..., 90. Lớn nhất là <b>90</b>.'],
    ] : lv === 2 ? [
      ['Số lớn nhất có hai chữ số khác nhau là số nào?', 98, 'Hàng chục lớn nhất là 9, hàng đơn vị phải khác 9 nên lớn nhất là 8: <b>98</b>.'],
      ['Số bé nhất có hai chữ số khác nhau là số nào?', 10, '10 có hai chữ số 1 và 0 khác nhau. Đáp số <b>10</b>.'],
      ['Số chẵn lớn nhất có hai chữ số là số nào?', 98, 'Số lớn nhất có hai chữ số là 99 (lẻ), số chẵn liền trước là <b>98</b>.'],
      ['Số lẻ bé nhất có hai chữ số là số nào?', 11, '10 là số chẵn nên số lẻ bé nhất có hai chữ số là <b>11</b>.'],
      ['Số bé nhất có hai chữ số giống nhau là số nào?', 11, 'Các số có hai chữ số giống nhau: 11, 22, ... Bé nhất là <b>11</b>.'],
    ] : (() => {
      const k = R.int(5, 15);
      const two = range(10, 99).filter(n => sum(digitsOf(n)) === k);
      const k2 = R.int(3, 9);
      const two2 = range(10, 99).filter(n => sum(digitsOf(n)) === k2);
      return [
        [`Số lớn nhất có hai chữ số mà tổng hai chữ số bằng ${k} là số nào?`, two[two.length - 1], `Muốn số lớn nhất thì hàng chục lớn nhất có thể. Các số có tổng chữ số bằng ${k}: ${two.join(', ')}. Lớn nhất là <b>${two[two.length - 1]}</b>.`],
        [`Số bé nhất có hai chữ số mà tổng hai chữ số bằng ${k2} là số nào?`, two2[0], `Muốn số bé nhất thì hàng chục bé nhất có thể. Các số: ${two2.join(', ')}. Bé nhất là <b>${two2[0]}</b>.`],
        ['Số lớn nhất có hai chữ số khác nhau và là số lẻ là số nào?', 97, 'Hàng chục là 9, hàng đơn vị lẻ và khác 9: lớn nhất là 7. Đáp số <b>97</b>.'],
        ['Hiệu của số lớn nhất có hai chữ số và số bé nhất có hai chữ số là bao nhiêu?', 89, '99 − 10 = <b>89</b>.'],
      ];
    })();
    const [text, answer, solution] = R.pick(qs);
    return mk({ text, answer, solution });
  }

  function ntDigitSum(R, lv) {
    const k = lv === 2 ? R.int(2, 6) : R.int(7, 13);
    const list = range(10, 99).filter(n => sum(digitsOf(n)) === k);
    return mk({ text: `Có bao nhiêu số có hai chữ số mà tổng hai chữ số bằng ${k}?`, answer: list.length, solution: `Liệt kê theo hàng chục từ bé đến lớn: ${list.join(', ')}. Có <b>${list.length}</b> số.` });
  }

  function ntFromDigits(R, lv) {
    let ds = R.sample(range(1, 9), 3);
    if (lv === 3 && R.chance(0.6)) ds[R.int(0, 2)] = 0;
    const ask = R.pick(['max', 'min']);
    const all = [];
    for (const a of ds) for (const b of ds) if (a !== b && a !== 0) all.push(10 * a + b);
    all.sort((x, y) => x - y);
    const ans = ask === 'max' ? all[all.length - 1] : all[0];
    const shown = R.shuffle(ds).join(', ');
    let sol = ask === 'max'
      ? `Chọn chữ số lớn nhất làm hàng chục, chữ số lớn thứ hai làm hàng đơn vị: <b>${ans}</b>.`
      : `Chọn chữ số bé nhất (khác 0) làm hàng chục, rồi chữ số bé nhất còn lại làm hàng đơn vị: <b>${ans}</b>.`;
    if (ds.includes(0) && ask === 'min') sol += ' Nhớ: chữ số 0 không đứng đầu nhưng có thể đứng ở hàng đơn vị.';
    return mk({ text: `Từ các chữ số ${shown}, hãy lập số ${ask === 'max' ? 'lớn nhất' : 'bé nhất'} có hai chữ số khác nhau.`, answer: ans, solution: sol });
  }

  function ntWriteDigits(R, lv) {
    if (lv === 2 || R.chance(0.5)) {
      const n = lv === 2 ? R.int(10, 20) : R.int(21, 60);
      const ans = 9 + 2 * (n - 9);
      return mk({ text: `Bạn ${R.pick(NAMES)} đánh số trang một quyển truyện từ trang 1 đến trang ${n}. Hỏi bạn phải viết tất cả bao nhiêu chữ số?`, answer: ans, solution: `Trang 1 đến 9: 9 chữ số. Trang 10 đến ${n}: có ${n - 9} trang, mỗi trang 2 chữ số, được ${2 * (n - 9)} chữ số. Tổng: 9 + ${2 * (n - 9)} = <b>${ans}</b> chữ số.` });
    }
    const n = R.int(20, 50), d = R.int(1, 9);
    let cnt = 0; const hits = [];
    for (let i = 1; i <= n; i++) { const c = digitsOf(i).filter(x => x === d).length; if (c) { cnt += c; hits.push(i); } }
    return mk({ text: `Viết các số từ 1 đến ${n}. Hỏi chữ số ${d} được viết bao nhiêu lần?`, answer: cnt, solution: `Các số có chữ số ${d}: ${hits.join(', ')}.${hits.some(h => digitsOf(h).filter(x => x === d).length > 1) ? ` Chú ý số ${11 * d} có hai chữ số ${d}.` : ''} Tổng cộng <b>${cnt}</b> lần.` });
  }

  function ntNeighbor(R, lv) {
    if (lv === 1) {
      const a = R.int(1, 50), after = R.chance(0.5);
      return mk({ text: `Số liền ${after ? 'sau' : 'trước'} của số ${a} là số nào?`, answer: after ? a + 1 : a - 1, solution: `Số liền ${after ? 'sau thì thêm 1' : 'trước thì bớt 1'}: ${a} ${after ? '+' : '−'} 1 = <b>${after ? a + 1 : a - 1}</b>.` });
    }
    if (lv === 2) {
      const t = R.pick([
        () => { const a = R.int(5, 90); return mk({ text: `Số liền sau của số liền trước của ${a} là số nào?`, answer: a, solution: `Số liền trước của ${a} là ${a - 1}. Số liền sau của ${a - 1} là <b>${a}</b>.` }); },
        () => { const a = R.int(5, 90); return mk({ text: `Số nào lớn hơn ${a} nhưng bé hơn ${a + 2}?`, answer: a + 1, solution: `Giữa ${a} và ${a + 2} chỉ có số <b>${a + 1}</b>.` }); },
        () => { const a = R.int(5, 90); return mk({ text: `Số liền sau của số liền sau của ${a} là số nào?`, answer: a + 2, solution: `${a} → ${a + 1} → <b>${a + 2}</b>.` }); },
      ]);
      return t();
    }
    const t = R.pick([
      () => mk({ text: 'Số liền trước của số bé nhất có hai chữ số là số nào?', answer: 9, solution: 'Số bé nhất có hai chữ số là 10. Số liền trước của 10 là <b>9</b>.' }),
      () => mk({ text: 'Số liền sau của số lớn nhất có hai chữ số là số nào?', answer: 100, solution: 'Số lớn nhất có hai chữ số là 99. Số liền sau là <b>100</b>.' }),
      () => { const a = R.int(5, 40); return mk({ text: `Hai số liền nhau có tổng bằng ${2 * a + 1}. Tìm số lớn hơn.`, answer: a + 1, solution: `Hai số liền nhau hơn kém nhau 1. Thử: ${a} + ${a + 1} = ${2 * a + 1}. Số lớn hơn là <b>${a + 1}</b>.` }); },
      () => { const a = R.int(10, 40); return mk({ text: `Ba số liền nhau có tổng bằng ${3 * a}. Tìm số ở giữa.`, answer: a, solution: `Ba số liền nhau: số giữa bớt 1, số giữa, số giữa thêm 1. Tổng bằng 3 lần số giữa. ${a - 1} + ${a} + ${a + 1} = ${3 * a}. Số ở giữa là <b>${a}</b>.` }); },
    ]);
    return t();
  }

  function ntOrder(R, lv) {
    const max = lv === 1 ? 20 : 99;
    let nums;
    if (lv === 1) nums = R.sample(range(0, max), 5);
    else { const base = R.int(2, 8) * 10; nums = R.sample(range(base - 8, base + 9).concat([base + R.int(-30, 0) + 30]), 5); nums = [...new Set(nums)]; }
    while (nums.length < 5) { const x = R.int(10, 99); if (!nums.includes(x)) nums.push(x); }
    const sorted = nums.slice().sort((a, b) => a - b);
    if (lv === 3) return mk({ text: `Cho các số: ${nums.join(', ')}.<br>Tính tổng của số lớn nhất và số bé nhất.`, answer: sorted[4] + sorted[0], solution: `Sắp xếp: ${sorted.join(' < ')}. Số lớn nhất ${sorted[4]}, số bé nhất ${sorted[0]}. Tổng: ${sorted[4]} + ${sorted[0]} = <b>${sorted[4] + sorted[0]}</b>.` });
    const k = R.int(2, 4);
    return mk({ text: `Sắp xếp các số ${nums.join(', ')} theo thứ tự từ bé đến lớn. Số đứng thứ ${k} là số nào?`, answer: sorted[k - 1], solution: `Từ bé đến lớn: ${sorted.join(', ')}. Số thứ ${k} là <b>${sorted[k - 1]}</b>.` });
  }

  // =====================================================================
  // HÌNH HỌC
  // =====================================================================
  function geoSegments(R, lv) {
    const n = lv === 1 ? 3 : lv === 2 ? R.int(4, 5) : R.int(5, 6);
    const ans = C2(n), L = 'ABCDEFGH';
    const parts = range(1, n - 1).reverse();
    return mk({
      text: 'Hình bên có bao nhiêu đoạn thẳng?', visual: svgSegments(n), answer: ans,
      solution: `Đoạn thẳng bắt đầu từ ${L[0]}: ${n - 1} đoạn; từ ${L[1]}: ${n - 2} đoạn; ... Tổng: ${parts.join(' + ')} = <b>${ans}</b> đoạn thẳng.`,
    });
  }

  function geoFan(R, lv) {
    if (lv === 3 && R.chance(0.5)) {
      const n = R.int(3, 4), ans = 2 * C2(n);
      return mk({
        text: 'Hình bên có bao nhiêu hình tam giác?', visual: svgFan(n, 2), answer: ans,
        solution: `Phần trên (cạnh đáy là đường ngang ở giữa) có ${C2(n)} tam giác. Phần cả hình (cạnh đáy là đáy lớn) cũng có ${C2(n)} tam giác. Tổng: ${C2(n)} + ${C2(n)} = <b>${ans}</b>.`,
      });
    }
    const n = lv === 1 ? 3 : lv === 2 ? R.int(3, 4) : R.int(5, 6);
    const ans = C2(n), singles = n - 1;
    const parts = range(1, singles).reverse();
    return mk({
      text: 'Hình bên có bao nhiêu hình tam giác?', visual: svgFan(n, 1), answer: ans,
      solution: `Có ${singles} tam giác đơn. ` + range(2, singles).map(k => `Ghép ${k} tam giác liền nhau: ${singles - k + 1}. `).join('') + `Tổng: ${parts.join(' + ')} = <b>${ans}</b> tam giác.`,
    });
  }

  function geoGrid(R, lv) {
    if (lv === 1) {
      const r = R.int(2, 3), c = R.int(2, 4);
      return mk({ text: 'Hình bên có bao nhiêu ô vuông nhỏ?', visual: svgGrid(r, c), answer: r * c, solution: `Có ${r} hàng, mỗi hàng ${c} ô: ${Array(r).fill(c).join(' + ')} = <b>${r * c}</b> ô vuông.` });
    }
    const [r, c] = lv === 2 ? R.pick([[2, 2], [2, 3], [1, 4]]) : R.pick([[3, 3], [2, 4], [3, 4]]);
    const parts = [];
    for (let k = 1; k <= Math.min(r, c); k++) parts.push([k, (r - k + 1) * (c - k + 1)]);
    const ans = sum(parts.map(p => p[1]));
    return mk({
      text: 'Hình bên có tất cả bao nhiêu hình vuông?', visual: svgGrid(r, c), answer: ans,
      solution: parts.map(([k, v]) => `Hình vuông ${k}×${k}: ${v}`).join('; ') + `. Tổng: <b>${ans}</b> hình vuông.`,
    });
  }

  function geoStrip(R, lv) {
    const n = lv === 1 ? 2 : lv === 2 ? R.int(3, 4) : R.int(5, 6);
    const ans = n * (n + 1) / 2;
    return mk({
      text: 'Hình bên có bao nhiêu hình chữ nhật? (Hình vuông cũng được tính là hình chữ nhật)', visual: svgGrid(1, n), answer: ans,
      solution: `Hình gồm 1 ô: ${n}; gồm 2 ô: ${n - 1}; ...; gồm ${n} ô: 1. Tổng: ${range(1, n).reverse().join(' + ')} = <b>${ans}</b>.`,
    });
  }

  function geoShapes(R, lv) {
    const n = lv === 1 ? R.int(6, 9) : R.int(8, 12);
    const list = range(1, n).map(() => R.pick(['tri', 'sq', 'cir']));
    const tri = list.filter(x => x === 'tri').length, sq = list.filter(x => x === 'sq').length, cir = list.filter(x => x === 'cir').length;
    if (lv === 1) {
      const which = R.pick([['tri', 'hình tam giác', tri], ['sq', 'hình vuông', sq], ['cir', 'hình tròn', cir]]);
      return mk({ text: `Trong hình bên có bao nhiêu ${which[1]}?`, visual: svgShapes(list), answer: which[2], solution: `Đếm lần lượt từng ${which[1]}: có <b>${which[2]}</b> hình.` });
    }
    const ans = 3 * tri + 4 * sq;
    return mk({
      text: `Hãy đếm tổng số cạnh của tất cả các hình trong hình bên.${lv === 3 ? ' (Hình tròn không có cạnh)' : ''}`, visual: svgShapes(list), answer: ans,
      solution: `Có ${tri} tam giác (mỗi hình 3 cạnh) và ${sq} hình vuông (mỗi hình 4 cạnh)${cir ? `, ${cir} hình tròn không có cạnh` : ''}. Tổng: ${3 * tri} + ${4 * sq} = <b>${ans}</b> cạnh.`,
    });
  }

  function geoClock(R, lv) {
    const h = R.int(1, 12);
    if (lv === 3) {
      const k = R.int(2, 8), ans = (h + k - 1) % 12 + 1;
      return mk({
        text: `Đồng hồ đang chỉ ${h} giờ. Sau ${k} giờ nữa, kim ngắn sẽ chỉ vào số mấy?`, visual: svgClock(h, 0), answer: ans,
        solution: `Đếm tiếp ${k} số trên mặt đồng hồ từ số ${h}${h + k > 12 ? ' (sau số 12 quay lại số 1)' : ''}: <b>${ans}</b>.`,
      });
    }
    const m = lv === 1 ? 0 : R.pick([0, 30, 30]);
    const lab = (hh, mm) => mm ? `${hh} giờ 30 phút` : `${hh} giờ`;
    const ans = lab(h, m);
    const other = h % 12 + 1, prev = (h + 10) % 12 + 1;
    const pool = [lab(other, m), lab(prev, m), lab(h, m ? 0 : 30), lab(other, m ? 0 : 30)];
    return mk({
      type: 'choice', choices: choicesOf(R, ans, pool),
      text: 'Đồng hồ chỉ mấy giờ?', visual: svgClock(h, m), answer: ans,
      solution: m ? `Kim dài chỉ số 6 là 30 phút. Kim ngắn nằm giữa số ${h} và số ${other}, nên là <b>${ans}</b>.` : `Kim dài chỉ số 12, kim ngắn chỉ số ${h}: <b>${ans}</b>.`,
    });
  }

  function geoBars(R, lv) {
    const cols = lv === 1 ? 3 : R.int(4, 5), maxH = lv === 1 ? 3 : 4;
    const hs = range(1, cols).map(() => R.int(1, maxH));
    if (Math.max(...hs) < 2) hs[0] = 2;
    const total = sum(hs);
    if (lv === 3) {
      const H = Math.max(...hs), need = H * cols - total;
      if (need === 0) return geoBars(R, lv);
      return mk({ text: `Cần thêm ít nhất bao nhiêu ô vuông nhỏ để được một hình chữ nhật có ${cols} cột, mỗi cột cao ${H} ô?`, visual: svgBars(hs), answer: need, solution: `Hình chữ nhật cần ${Array(cols).fill(H).join(' + ')} = ${H * cols} ô. Đang có ${hs.join(' + ')} = ${total} ô. Cần thêm ${H * cols} − ${total} = <b>${need}</b> ô.` });
    }
    return mk({ text: 'Hình bên được ghép bởi bao nhiêu ô vuông nhỏ?', visual: svgBars(hs), answer: total, solution: `Đếm từng cột từ trái sang phải: ${hs.join(' + ')} = <b>${total}</b> ô vuông.` });
  }

  function geoSquareDiag(R, lv) {
    const both = lv === 3 || R.chance(0.5);
    return mk({
      text: 'Hình vuông bên được kẻ đường chéo. Có bao nhiêu hình tam giác?', visual: svgSquareDiag(both), answer: both ? 8 : 2,
      solution: both
        ? 'Hai đường chéo chia hình vuông thành 4 tam giác nhỏ. Mỗi đường chéo lại chia hình vuông thành 2 tam giác lớn, 2 đường chéo được 4 tam giác lớn. Tổng: 4 + 4 = <b>8</b>.'
        : 'Đường chéo chia hình vuông thành <b>2</b> tam giác.',
    });
  }

  // =====================================================================
  // TỔ HỢP
  // =====================================================================
  function combHandshake(R, lv) {
    const n = lv === 1 ? 3 : lv === 2 ? R.int(4, 5) : R.int(5, 7);
    if (lv === 3 && R.chance(0.4)) {
      const m = R.int(3, 5), ans = m * (m - 1);
      return mk({ text: `Có ${m} bạn. Mỗi bạn tặng cho mỗi bạn còn lại một tấm thiệp. Hỏi có tất cả bao nhiêu tấm thiệp?`, answer: ans, solution: `Mỗi bạn tặng ${m - 1} tấm. ${m} bạn tặng: ${Array(m).fill(m - 1).join(' + ')} = <b>${ans}</b> tấm. (Khác với bắt tay: A tặng B và B tặng A là 2 tấm thiệp.)` });
    }
    const ctx = R.pick([
      ['bạn gặp nhau, mỗi hai bạn bắt tay nhau một lần', 'cái bắt tay', 'bạn'],
      ['đội bóng thi đấu, mỗi hai đội đấu với nhau một trận', 'trận đấu', 'đội'],
      ['bạn chơi cờ, mỗi hai bạn đấu với nhau một ván', 'ván cờ', 'bạn'],
    ]);
    const ans = C2(n);
    return mk({ text: `Có ${n} ${ctx[0]}. Hỏi có tất cả bao nhiêu ${ctx[1]}?`, answer: ans, solution: `${ctx[2][0].toUpperCase() + ctx[2].slice(1)} thứ nhất với ${n - 1} ${ctx[2]} còn lại: ${n - 1}; ${ctx[2]} thứ hai thêm ${n - 2} (không tính lại với ${ctx[2]} thứ nhất); ... Tổng: ${range(1, n - 1).reverse().join(' + ')} = <b>${ans}</b> ${ctx[1]}.` });
  }

  function combOutfit(R, lv) {
    if (lv === 3) {
      const a = R.int(2, 3), b = R.int(2, 3), c = 2, ans = a * b * c;
      return mk({ text: `${R.pick(NAMES)} có ${a} cái áo, ${b} cái quần và ${c} cái mũ. Mỗi bộ gồm 1 áo, 1 quần và 1 mũ. Hỏi có bao nhiêu cách chọn một bộ?`, answer: ans, solution: `Chọn áo và quần: ${Array(a).fill(b).join(' + ')} = ${a * b} cách. Mỗi cách lại đi với ${c} mũ: ${a * b} + ${a * b} = <b>${ans}</b> cách.` });
    }
    const a = R.int(2, lv === 1 ? 2 : 4), b = R.int(2, 3), ans = a * b;
    return mk({ text: `${R.pick(NAMES)} có ${a} cái áo 👕 và ${b} cái quần 👖. Hỏi có bao nhiêu cách chọn một bộ gồm 1 áo và 1 quần?`, answer: ans, solution: `Mỗi áo đi với ${b} quần: ${Array(a).fill(b).join(' + ')} = <b>${ans}</b> cách.` });
  }

  function combRoads(R, lv) {
    const a = R.int(2, lv === 1 ? 2 : 3), b = R.int(2, 3);
    if (lv === 3) {
      const c = R.int(1, 3), ans = a * b + c;
      return mk({ text: `Từ nhà đến công viên có ${a} con đường. Từ công viên đến trường có ${b} con đường. Ngoài ra còn ${c} con đường đi thẳng từ nhà đến trường (không qua công viên). Hỏi có bao nhiêu cách đi từ nhà đến trường?`, answer: ans, solution: `Qua công viên: ${Array(a).fill(b).join(' + ')} = ${a * b} cách. Đi thẳng: ${c} cách. Tổng: ${a * b} + ${c} = <b>${ans}</b> cách.` });
    }
    const ans = a * b;
    return mk({ text: `Từ nhà 🏠 đến công viên 🌳 có ${a} con đường. Từ công viên đến trường 🏫 có ${b} con đường. Hỏi có bao nhiêu cách đi từ nhà đến trường (qua công viên)?`, answer: ans, solution: `Mỗi đường từ nhà đến công viên nối được với ${b} đường đến trường: ${Array(a).fill(b).join(' + ')} = <b>${ans}</b> cách.` });
  }

  function combDigits(R, lv) {
    let ds, rep = false;
    if (lv === 1) ds = R.sample(range(1, 9), 2);
    else if (lv === 2) ds = R.sample(range(1, 9), 3);
    else { ds = R.sample(range(1, 9), R.chance(0.5) ? 2 : 3); if (R.chance(0.5)) ds[0] = 0; rep = R.chance(0.5); }
    ds.sort((a, b) => a - b);
    const all = [];
    for (const a of ds) for (const b of ds) if (a !== 0 && (rep || a !== b)) all.push(10 * a + b);
    all.sort((x, y) => x - y);
    const cond = rep ? '(các chữ số có thể lặp lại)' : 'có hai chữ số khác nhau';
    return mk({ text: `Từ các chữ số ${ds.join(', ')} có thể lập được bao nhiêu số có hai chữ số ${cond}?`, answer: all.length, solution: `Liệt kê theo hàng chục: ${all.join(', ')}.${ds.includes(0) ? ' (Chữ số 0 không đứng ở hàng chục.)' : ''} Có <b>${all.length}</b> số.` });
  }

  function combPigeon(R, lv) {
    const r = R.int(2, 6), g = R.int(2, 6), y = R.int(2, 5);
    if (lv === 1) {
      return mk({ text: `Trong hộp có ${r} bi đỏ và ${g} bi xanh. Không nhìn vào hộp, phải lấy ra ít nhất bao nhiêu viên bi để chắc chắn có một viên bi đỏ?`, answer: g + 1, solution: `Xui nhất là lấy hết ${g} bi xanh trước. Lấy thêm 1 viên nữa chắc chắn là bi đỏ: ${g} + 1 = <b>${g + 1}</b> viên.` });
    }
    if (lv === 2) {
      const three = R.chance(0.5), colors = three ? 3 : 2;
      return mk({ text: `Trong hộp có ${r} bi đỏ, ${g} bi xanh${three ? ` và ${y} bi vàng` : ''}. Không nhìn vào hộp, phải lấy ít nhất bao nhiêu viên để chắc chắn có 2 viên cùng màu?`, answer: colors + 1, solution: `Xui nhất là mỗi lần lấy được một màu khác nhau: ${colors} viên ${colors} màu. Lấy thêm 1 viên nữa chắc chắn trùng màu: ${colors} + 1 = <b>${colors + 1}</b> viên.` });
    }
    const t = R.pick([
      () => { const m = Math.max(r, g); return mk({ text: `Trong hộp có ${r} bi đỏ và ${g} bi xanh. Không nhìn, phải lấy ít nhất bao nhiêu viên để chắc chắn có đủ cả hai màu?`, answer: m + 1, solution: `Xui nhất là lấy hết màu nhiều hơn trước (${m} viên). Lấy thêm 1 viên chắc chắn là màu còn lại: <b>${m + 1}</b> viên.` }); },
      () => mk({ text: `Trong hộp có ${r} bi đỏ, ${g} bi xanh và ${y} bi vàng. Không nhìn, phải lấy ít nhất bao nhiêu viên để chắc chắn có 1 viên bi vàng?`, answer: r + g + 1, solution: `Xui nhất là lấy hết ${r} bi đỏ và ${g} bi xanh trước. Thêm 1 viên nữa là bi vàng: ${r} + ${g} + 1 = <b>${r + g + 1}</b> viên.` }),
      () => { const n = R.int(3, 5), k = R.int(2, 3); return mk({ text: `Trong ngăn kéo có ${n} đôi tất khác màu nhau (mỗi đôi 2 chiếc cùng màu) để lẫn lộn. Không nhìn, phải lấy ít nhất bao nhiêu chiếc để chắc chắn có 2 chiếc cùng màu?`, answer: n + 1, solution: `Có ${n} màu. Xui nhất là lấy ${n} chiếc, mỗi chiếc một màu. Lấy thêm 1 chiếc chắc chắn trùng màu: <b>${n + 1}</b> chiếc.` }); },
    ]);
    return t();
  }

  function combSplit(R, lv) {
    if (lv === 3 && R.chance(0.5)) {
      const n = R.int(6, 10), list = [];
      for (let a = 1; a <= n; a++) for (let b = a; b <= n; b++) { const c = n - a - b; if (c >= b) list.push(`${a} + ${b} + ${c}`); }
      return mk({ text: `Có bao nhiêu cách viết số ${n} thành tổng của ba số khác 0? (Đổi chỗ các số không tính là cách mới)`, answer: list.length, solution: `Liệt kê từ bé đến lớn: ${list.join('; ')}. Có <b>${list.length}</b> cách.` });
    }
    const n = lv === 1 ? R.int(4, 6) : lv === 2 ? R.int(7, 10) : R.int(11, 16);
    const list = range(1, Math.floor(n / 2)).map(a => `${a} + ${n - a}`);
    return mk({ text: `Có bao nhiêu cách viết số ${n} thành tổng của hai số khác 0? (Ví dụ ${n - 1} + 1 và 1 + ${n - 1} chỉ tính là một cách)`, answer: list.length, solution: `Các cách: ${list.join('; ')}. Có <b>${list.length}</b> cách.` });
  }

  function combCoins(R, lv) {
    const n = lv === 2 ? R.int(4, 6) : R.int(7, 10);
    const list = [];
    for (let c = 0; 5 * c <= n; c++) for (let b = 0; 5 * c + 2 * b <= n; b++) {
      const a = n - 5 * c - 2 * b;
      const parts = [...Array(c).fill(5), ...Array(b).fill(2), ...Array(a).fill(1)];
      list.push(parts.join(' + '));
    }
    return mk({ text: `Có nhiều tờ tiền loại 1 nghìn, 2 nghìn và 5 nghìn đồng. Hỏi có bao nhiêu cách lấy ra các tờ tiền để được đúng ${n} nghìn đồng?`, answer: list.length, solution: `Liệt kê (đơn vị nghìn đồng): ${list.join('; ')}. Có <b>${list.length}</b> cách.` });
  }

  // =====================================================================
  const G = (id, fn, lv) => ({ id, fn, lv });
  const GENS = {
    logic: [G('seq', logicSeq, [1, 2, 3]), G('pattern', logicPattern, [1, 2, 3]), G('queue', logicQueue, [1, 2, 3]), G('compare', logicCompare, [1, 2, 3]), G('exchange', logicExchange, [1, 2, 3]), G('age', logicAge, [1, 2, 3]), G('cut', logicCut, [1, 2, 3])],
    arith: [G('calc', arithCalc, [1, 2, 3]), G('missing', arithMissing, [1, 2, 3]), G('quick', arithQuick, [1, 2, 3]), G('word', arithWord, [1, 2, 3]), G('symbols', arithSymbols, [1, 2, 3]), G('compare', arithCompare, [1, 2, 3]), G('count', arithCount, [2, 3])],
    number: [G('place', ntPlace, [1, 2, 3]), G('evenodd', ntEvenOdd, [1, 2, 3]), G('count', ntCount, [1, 2, 3]), G('special', ntSpecial, [1, 2, 3]), G('digitsum', ntDigitSum, [2, 3]), G('fromdigits', ntFromDigits, [1, 2, 3]), G('write', ntWriteDigits, [2, 3]), G('neighbor', ntNeighbor, [1, 2, 3]), G('order', ntOrder, [1, 2, 3])],
    geo: [G('segments', geoSegments, [1, 2, 3]), G('fan', geoFan, [1, 2, 3]), G('grid', geoGrid, [1, 2, 3]), G('strip', geoStrip, [1, 2, 3]), G('shapes', geoShapes, [1, 2, 3]), G('clock', geoClock, [1, 2, 3]), G('bars', geoBars, [1, 2, 3]), G('diag', geoSquareDiag, [2, 3])],
    comb: [G('handshake', combHandshake, [1, 2, 3]), G('outfit', combOutfit, [1, 2, 3]), G('roads', combRoads, [1, 2, 3]), G('digits', combDigits, [1, 2, 3]), G('pigeon', combPigeon, [1, 2, 3]), G('split', combSplit, [1, 2, 3]), G('coins', combCoins, [2, 3])],
  };
  T.GENS = GENS;

  // Sinh 1 câu hỏi; `used` giúp một bộ đề không lặp dạng bài / nội dung.
  T.generate = function (topic, lv, R, used) {
    used = used || { gens: new Set(), texts: new Set() };
    const list = GENS[topic].filter(g => g.lv.includes(lv));
    let pool = list.filter(g => !used.gens.has(g.id));
    if (!pool.length) { used.gens.clear(); pool = list; }
    let q, g;
    for (let tries = 0; tries < 20; tries++) {
      g = R.pick(pool);
      q = g.fn(R, lv);
      if (!used.texts.has(q.text + q.visual)) break;
    }
    used.gens.add(g.id);
    used.texts.add(q.text + q.visual);
    return Object.assign(q, { topic, lv, gen: g.id });
  };

  T.generateSet = function (topic, lv, n, R) {
    R = R || T.makeRng();
    const used = { gens: new Set(), texts: new Set() };
    return range(1, n).map(() => T.generate(topic, lv, R, used));
  };
})(window.T);
