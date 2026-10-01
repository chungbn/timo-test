// Nội dung Toán lớp 3 (SGK 2018 + dạng bài TIMO lớp 3): lý thuyết, dạng bài và lộ trình của 5 chủ đề.
(function (T) {
  'use strict';
  const { mk, choicesOf, box, C2, range, sum, digitsOf, gcd, line, svg, INK, NAMES, SHAPES, FRUITS, ANIMALS,
    svgSegments, svgFan, svgGrid, svgShapes, svgClock, svgBars, svgSquareDiag, svgOneShape, groupsOf5, fmt, dec, frac } = T.GH;

  // ---------- tiện ích riêng ----------
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const lcm = (a, b) => a / gcd(a, b) * b;
  const txt = (x, y, s, size = 16, color = INK) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="700" fill="${color}">${s}</text>`;
  const dot = (x, y, c = '#ef4444') => `<circle cx="${x}" cy="${y}" r="5" fill="${c}"/>`;
  const perms = arr => (arr.length <= 1 ? [arr.slice()] : arr.flatMap((x, i) => perms(arr.slice(0, i).concat(arr.slice(i + 1))).map(p => [x].concat(p))));
  const toRoman = n => { let s = ''; for (const [k, c] of [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]) while (n >= k) { s += c; n -= k; } return s; };
  const WD = ['Chủ nhật', 'thứ Hai', 'thứ Ba', 'thứ Tư', 'thứ Năm', 'thứ Sáu', 'thứ Bảy'];
  const WDC = WD.map(cap);
  const DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // DAYS[tháng], năm có tháng 2 có 28 ngày
  const doy = (d, m) => sum(DAYS.slice(1, m)) + d;
  const hm = (h, m) => (m ? `${h} giờ ${m} phút` : `${h} giờ`);
  const tl = t => hm(Math.floor(t / 60), t % 60); // phút tính từ 0 giờ → "8 giờ 15 phút"
  // Viết dãy chữ số (có thể có ô trống) theo cách viết số Việt Nam: [4,'□',7,2] → "4.□72"
  const fmtD = ds => ds.map((d, i) => ((ds.length - i) % 3 === 0 && i > 0 ? '.' : '') + d).join('');
  const roundTo = (n, p) => Math.floor((n + p / 2) / p) * p;

  // ---------- hình vẽ riêng ----------
  function svgTable(rows) {
    const cw = 66, ch = 44, w = rows[0].length * cw + 8, h = rows.length * ch + 8;
    let s = '';
    rows.forEach((r, i) => r.forEach((v, j) => {
      const x = 4 + j * cw, y = 4 + i * ch;
      s += `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" fill="${v === '?' ? '#fde68a' : '#fff'}" stroke="${INK}" stroke-width="2"/>` + txt(x + cw / 2, y + ch / 2 + 7, v, 20);
    }));
    return svg(w, h, s);
  }
  // Khúc gỗ đã cưa thành n đoạn
  function svgLog(n) {
    const seg = Math.min(60, Math.floor(300 / n)), w = n * seg + 8;
    let s = '';
    for (let i = 0; i < n; i++) s += `<rect x="${4 + i * seg}" y="10" width="${seg}" height="34" rx="6" fill="#fcd9a8" stroke="#92400e" stroke-width="2.5"/>`;
    return svg(w, 54, s);
  }
  // Hình chữ nhật có ghi kích thước (dài a, rộng b)
  function svgRect(a, b, unit = 'cm', square = false) {
    const k = Math.min(200 / a, 110 / b), W = Math.max(50, a * k), H = Math.max(36, b * k);
    let s = `<rect x="50" y="14" width="${W}" height="${H}" fill="#bfdbfe" stroke="${INK}" stroke-width="3"/>`;
    s += txt(50 + W / 2, 14 + H + 24, `${a} ${unit}`, 16);
    if (!square) s += txt(26, 14 + H / 2 + 6, `${b} ${unit}`, 16);
    return svg(W + 100, H + 44, s, 300);
  }
  function svgTriangle(a, b, c) {
    const s = `<polygon points="40,150 260,150 120,24" fill="#fde68a" stroke="${INK}" stroke-width="3"/>` +
      txt(150, 176, `${a} cm`) + txt(54, 84, `${b} cm`) + txt(222, 84, `${c} cm`);
    return svg(300, 186, s, 280);
  }
  function svgQuad(a, b, c, d) {
    const s = `<polygon points="40,150 270,150 230,30 80,40" fill="#bbf7d0" stroke="${INK}" stroke-width="3"/>` +
      txt(155, 176, `${a} cm`) + txt(280, 92, `${b} cm`) + txt(155, 26, `${c} cm`) + txt(28, 92, `${d} cm`);
    return svg(320, 186, s, 300);
  }
  // Các điểm trên một đoạn thẳng: pts = [[vị trí 0..1, tên], ...]
  function svgPoints(pts, labels) {
    const x0 = 30, x1 = 330, y = 34, X = p => x0 + (x1 - x0) * p;
    let s = line(x0, y, x1, y);
    (labels || []).forEach(([p, q, t]) => { s += txt((X(p) + X(q)) / 2, y - 12, t, 14, '#2563eb'); });
    pts.forEach(([p, l]) => { s += dot(X(p), y) + txt(X(p), y + 28, l, 18); });
    return svg(360, 72, s);
  }
  function svgCircle(lab, kind) {
    const cx = 110, cy = 100, r = 80;
    let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fbcfe8" stroke="${INK}" stroke-width="3"/>` + dot(cx, cy, INK) + txt(cx - 2, cy + 24, 'O', 16);
    if (kind === 'diam') s += line(cx - r, cy, cx + r, cy) + dot(cx - r, cy) + dot(cx + r, cy) + txt(cx - r - 14, cy + 6, 'B') + txt(cx + r + 14, cy + 6, 'C');
    else s += line(cx, cy, cx + r * 0.8, cy - r * 0.6) + dot(cx + r * 0.8, cy - r * 0.6) + txt(cx + r * 0.8 + 12, cy - r * 0.6 - 6, 'A');
    if (lab) s += txt(kind === 'diam' ? cx + 40 : cx + 22, kind === 'diam' ? cy - 10 : cy - 30, lab, 15, '#2563eb');
    return svg(230, 200, s, 210);
  }
  function svgCirclesRow(k) {
    const r = 26, W = 2 * r * k;
    let s = `<rect x="10" y="10" width="${W}" height="${2 * r}" fill="#fff" stroke="${INK}" stroke-width="3"/>`;
    for (let i = 0; i < k; i++) s += `<circle cx="${10 + r + 2 * r * i}" cy="${10 + r}" r="${r}" fill="#fbcfe8" stroke="${INK}" stroke-width="2.5"/>` + dot(10 + r + 2 * r * i, 10 + r, INK);
    return svg(W + 20, 2 * r + 20, s);
  }
  function svgTwoCircles() {
    const r = 60, c1 = 90, c2 = 150, cy = 75;
    const s = `<circle cx="${c1}" cy="${cy}" r="${r}" fill="none" stroke="${INK}" stroke-width="3"/><circle cx="${c2}" cy="${cy}" r="${r}" fill="none" stroke="${INK}" stroke-width="3"/>` +
      line(c1 - r, cy, c2 + r, cy, 2.5) + dot(c1 - r, cy) + dot(c2 + r, cy) + dot(c1, cy, INK) + dot(c2, cy, INK) +
      txt(c1 - r - 14, cy + 6, 'A') + txt(c2 + r + 14, cy + 6, 'B') + txt(c1, cy + 24, 'O') + txt(c2, cy + 24, 'I');
    return svg(270, 150, s, 260);
  }
  // Góc đỉnh (cx, cy), cạnh thứ nhất theo hướng rot độ, cạnh thứ hai quay thêm deg độ
  function angleBody(cx, cy, deg, rot, L, label) {
    const P = a => [(cx + L * Math.cos(a * Math.PI / 180)).toFixed(1), (cy - L * Math.sin(a * Math.PI / 180)).toFixed(1)];
    const [x1, y1] = P(rot), [x2, y2] = P(rot + deg);
    return line(cx, cy, x1, y1) + line(cx, cy, x2, y2) + dot(cx, cy) + (label ? txt(cx, cy + 26, label, 16) : '');
  }
  // Hình chữ nhật có k đường kẻ dọc và h đường kẻ ngang (kẻ hết chiều)
  function svgRectLines(k, h) {
    const W = 240, H = 130;
    let s = `<rect x="10" y="10" width="${W}" height="${H}" fill="#fff" stroke="${INK}" stroke-width="3"/>`;
    for (let i = 1; i <= k; i++) s += line(10 + W * i / (k + 1), 10, 10 + W * i / (k + 1), 10 + H);
    if (h) s += line(10, 10 + H / 2, 10 + W, 10 + H / 2);
    return svg(W + 20, H + 20, s, 260);
  }
  // Hình chữ nhật W × H bị khuyết góc trên bên phải w × h
  function svgLShape(W, H, w, h) {
    const k = Math.min(200 / W, 130 / H), X = v => 50 + v * k, Y = v => 20 + v * k;
    const s = `<polygon points="${X(0)},${Y(0)} ${X(W - w)},${Y(0)} ${X(W - w)},${Y(h)} ${X(W)},${Y(h)} ${X(W)},${Y(H)} ${X(0)},${Y(H)}" fill="#bbf7d0" stroke="${INK}" stroke-width="3"/>` +
      txt((X(0) + X(W)) / 2, Y(H) + 22, `${W} cm`) + txt(24, (Y(0) + Y(H)) / 2 + 6, `${H} cm`) +
      txt((X(0) + X(W - w)) / 2, Y(0) - 3, `${W - w} cm`, 14) +
      txt(X(W) + 28, (Y(h) + Y(H)) / 2 + 6, `${H - h} cm`, 14);
    return svg(X(W) + 70, Y(H) + 34, s, 320);
  }
  // Đường đi giữa các điểm: counts[i] = số con đường nối điểm i với điểm i + 1
  function svgRoads(counts, names) {
    const gap = 130, y = 70, w = gap * counts.length + 60;
    let s = '';
    counts.forEach((c, i) => {
      const x1 = 30 + gap * i, x2 = x1 + gap;
      for (let j = 0; j < c; j++) {
        const off = (j - (c - 1) / 2) * 34;
        s += `<path d="M ${x1} ${y} Q ${(x1 + x2) / 2} ${y + 2 * off} ${x2} ${y}" fill="none" stroke="${INK}" stroke-width="2.5"/>`;
      }
    });
    names.forEach((n, i) => { s += `<circle cx="${30 + gap * i}" cy="${y}" r="16" fill="#fde68a" stroke="${INK}" stroke-width="2.5"/>` + txt(30 + gap * i, y + 6, n, 16); });
    return svg(w, 140, s, Math.min(w, 420));
  }
  // Lưới đường phố r × c, A ở góc dưới bên trái, B ở góc trên bên phải
  function svgStreets(r, c) {
    const g = 50, w = c * g + 50, h = r * g + 50;
    let s = '';
    for (let i = 0; i <= r; i++) s += line(25, 25 + i * g, 25 + c * g, 25 + i * g);
    for (let j = 0; j <= c; j++) s += line(25 + j * g, 25, 25 + j * g, 25 + r * g);
    s += dot(25, 25 + r * g) + dot(25 + c * g, 25) + txt(12, 25 + r * g + 20, 'A') + txt(25 + c * g + 14, 20, 'B');
    return svg(w, h, s);
  }

  // =====================================================================
  // TƯ DUY LOGIC
  // =====================================================================
  function logicSeq0(R) {
    const kind = R.pick(['up', 'up', 'down', 'table', 'missing']);
    if (kind === 'table') {
      const s = R.int(2, 5), t = range(1, 4).map(i => s * i);
      return mk({ text: `Đếm thêm ${s} rồi tìm số tiếp theo:<div class="seq">${t.join(', ')}, ?</div>`, answer: 5 * s, solution: `Đây là các số trong bảng nhân ${s}: ${t.map((v, i) => `${s} × ${i + 1} = ${v}`).join('; ')}. Số tiếp theo là ${s} × 5 = <b>${5 * s}</b>.` });
    }
    const s = R.pick([2, 3, 5, 10]);
    if (kind === 'missing') {
      const a = R.int(1, 20), k = R.int(1, 3), t = range(0, 4).map(i => a + s * i);
      return mk({ text: `Điền số còn thiếu vào ô trống:<div class="seq">${t.map((v, i) => (i === k ? box : v)).join(', ')}</div>`, answer: t[k], solution: `Mỗi số hơn số đứng trước ${s} đơn vị. Số còn thiếu là ${t[k - 1]} + ${s} = <b>${t[k]}</b>.` });
    }
    if (kind === 'down') {
      const a = 4 * s + R.int(1, 30), t = range(0, 3).map(i => a - s * i);
      return mk({ text: `Tìm số tiếp theo:<div class="seq">${t.join(', ')}, ?</div>`, answer: a - 4 * s, solution: `Mỗi số kém số đứng trước ${s} đơn vị. Số tiếp theo là ${t[3]} − ${s} = <b>${a - 4 * s}</b>.` });
    }
    const a = R.int(0, 30), t = range(0, 3).map(i => a + s * i);
    return mk({ text: `Tìm số tiếp theo:<div class="seq">${t.join(', ')}, ?</div>`, answer: a + 4 * s, solution: `Mỗi số hơn số đứng trước ${s} đơn vị. Số tiếp theo là ${t[3]} + ${s} = <b>${a + 4 * s}</b>.` });
  }

  function logicPattern0(R) {
    const [A, B, C, X] = R.sample(SHAPES, 4);
    const pat = R.pick([[A, B, C], [A, A, B], [A, B, B]]);
    const N = R.int(7, 15), ans = pat[(N - 1) % 3], r = N % 3;
    return mk({
      type: 'choice', choices: choicesOf(R, ans, [...new Set(pat)].concat(X)),
      text: `Các hình được xếp theo quy luật:<div class="seq emoji">${range(0, 5).map(i => pat[i % 3]).join(' ')} ...</div>Hình thứ <b>${N}</b> là hình nào?`,
      answer: ans,
      solution: `Nhóm 3 hình ${pat.join('')} lặp lại. Hình thứ 3, 6, 9, 12, 15 là hình cuối nhóm (${pat[2]}). ` +
        (r === 0 ? `Vậy hình thứ ${N} là <b>${ans}</b>.` : `${N} = ${N - r} + ${r} nên hình thứ ${N} là hình thứ ${r} của nhóm: <b>${ans}</b>.`),
    });
  }

  function logicCompare0(R) {
    const [more, less, most, least] = R.pick([['cao hơn', 'thấp hơn', 'cao nhất', 'thấp nhất'], ['nặng hơn', 'nhẹ hơn', 'nặng nhất', 'nhẹ nhất'],
      ['nhiều tuổi hơn', 'ít tuổi hơn', 'nhiều tuổi nhất', 'ít tuổi nhất'], ['chạy nhanh hơn', 'chạy chậm hơn', 'chạy nhanh nhất', 'chạy chậm nhất']]);
    const o = R.sample(NAMES, 3);
    const st = [0, 1].map(i => (R.chance(0.5) ? `${o[i]} ${more} ${o[i + 1]}` : `${o[i + 1]} ${less} ${o[i]}`));
    const askMost = R.chance(0.5), ans = askMost ? o[0] : o[2];
    return mk({
      type: 'choice', choices: R.shuffle(o),
      text: `${R.shuffle(st).join('. ')}.<br>Hỏi bạn nào ${askMost ? most : least}?`, answer: ans,
      solution: `Xếp theo thứ tự: ${o.join(' → ')} (bạn đứng trước ${more} bạn đứng sau). Bạn ${askMost ? most : least} là <b>${ans}</b>.`,
    });
  }

  function logicAge(R, lv) {
    const A = R.pick(NAMES);
    if (lv === 0) {
      const a = R.int(6, 9);
      const [W, d] = R.pick([['Bố', R.int(25, 35)], ['Mẹ', R.int(22, 30)], ['Anh', R.int(2, 6)], ['Chị', R.int(2, 6)]]);
      const w = W.toLowerCase();
      if (R.chance(0.5)) return mk({ text: `Năm nay ${A} ${a} tuổi. ${W} của ${A} hơn ${A} ${d} tuổi. Hỏi năm nay ${w} của ${A} bao nhiêu tuổi?`, answer: a + d, solution: `Hơn ${d} tuổi thì làm phép cộng: ${a} + ${d} = <b>${a + d}</b> tuổi.` });
      return mk({ text: `Năm nay ${A} ${a} tuổi, ${w} của ${A} ${a + d} tuổi. Hỏi ${w} hơn ${A} bao nhiêu tuổi?`, answer: d, solution: `${a + d} − ${a} = <b>${d}</b> tuổi.` });
    }
    if (lv === 1) {
      const t = R.pick([
        () => { const a = R.int(6, 9), k = R.int(4, 5); return mk({ text: `Năm nay ${A} ${a} tuổi. Tuổi mẹ gấp ${k} lần tuổi ${A}. Hỏi năm nay mẹ bao nhiêu tuổi?`, answer: a * k, solution: `Tuổi mẹ: ${a} × ${k} = <b>${a * k}</b> tuổi.` }); },
        () => { const a = R.int(6, 9), d = R.int(2, 6), n = R.int(2, 6); return mk({ text: `Năm nay ${A} ${a} tuổi, chị của ${A} hơn ${A} ${d} tuổi. Hỏi ${n} năm nữa chị của ${A} bao nhiêu tuổi?`, answer: a + d + n, solution: `Năm nay chị ${a} + ${d} = ${a + d} tuổi. ${n} năm nữa chị ${a + d} + ${n} = <b>${a + d + n}</b> tuổi.` }); },
        () => { const a = R.int(6, 9), k = R.int(4, 6); return mk({ text: `Năm nay bố ${a * k} tuổi. Tuổi của ${A} bằng 1/${k} tuổi bố. Hỏi ${A} bao nhiêu tuổi?`, answer: a, solution: `1/${k} của ${a * k} là ${a * k} : ${k} = <b>${a}</b>. ${A} ${a} tuổi.` }); },
      ]);
      return t();
    }
    if (lv === 2) {
      const t = R.pick([
        () => { const c = R.int(5, 9), k = R.int(4, 6); return mk({ text: `Năm nay con ${c} tuổi, tuổi mẹ gấp ${k} lần tuổi con. Hỏi mẹ hơn con bao nhiêu tuổi?`, answer: c * (k - 1), solution: `Tuổi mẹ: ${c} × ${k} = ${c * k} tuổi. Mẹ hơn con: ${c * k} − ${c} = <b>${c * (k - 1)}</b> tuổi.` }); },
        () => { const S = R.int(12, 30), n = R.int(2, 6); return mk({ text: `Năm nay tổng số tuổi của hai anh em ${A} là ${S} tuổi. Hỏi ${n} năm nữa tổng số tuổi của hai anh em là bao nhiêu?`, answer: S + 2 * n, solution: `Mỗi năm, mỗi người thêm 1 tuổi nên tổng số tuổi thêm 2. Sau ${n} năm tổng tăng ${n} × 2 = ${2 * n} tuổi: ${S} + ${2 * n} = <b>${S + 2 * n}</b> tuổi.` }); },
        () => { const c = R.int(5, 10), m = c + R.int(22, 32), n = R.int(3, 9); return mk({ text: `Năm nay mẹ ${m} tuổi, ${A} ${c} tuổi. Hỏi ${n} năm nữa mẹ hơn ${A} bao nhiêu tuổi?`, answer: m - c, solution: `Hai người luôn hơn kém nhau một số tuổi không đổi. Năm nay mẹ hơn ${A} ${m} − ${c} = ${m - c} tuổi, nên ${n} năm nữa mẹ vẫn hơn <b>${m - c}</b> tuổi.` }); },
        () => { const c = R.int(5, 9), k = R.int(4, 6); return mk({ text: `Năm nay bố ${c * k} tuổi, ${A} ${c} tuổi. Hỏi tuổi bố gấp mấy lần tuổi ${A}?`, answer: k, solution: `${c * k} : ${c} = <b>${k}</b>. Tuổi bố gấp ${k} lần tuổi ${A}.` }); },
      ]);
      return t();
    }
    const t = R.pick([
      () => {
        const e = R.int(5, 12), d = R.int(2, 7), S = 2 * e + d, askE = R.chance(0.5);
        return mk({ text: `Tổng số tuổi của hai anh em ${A} là ${S} tuổi. Anh hơn em ${d} tuổi. Hỏi ${askE ? 'em' : 'anh'} bao nhiêu tuổi?`, answer: askE ? e : e + d, solution: `Bớt phần anh hơn em thì còn hai lần tuổi em: ${S} − ${d} = ${2 * e}. Tuổi em: ${2 * e} : 2 = ${e} tuổi.${askE ? ` Đáp số <b>${e}</b> tuổi.` : ` Tuổi anh: ${e} + ${d} = <b>${e + d}</b> tuổi.`}` });
      },
      () => {
        let c, k, D;
        do { c = R.int(6, 12); k = R.int(3, 5); D = (k - 1) * c; } while (D < 20 || D > 40);
        const y = R.int(1, Math.min(4, c - 2)), c0 = c - y;
        return mk({ text: `Năm nay mẹ ${c0 + D} tuổi, con ${c0} tuổi. Hỏi sau mấy năm nữa thì tuổi mẹ gấp ${k} lần tuổi con?`, answer: y, solution: `Mẹ luôn hơn con ${c0 + D} − ${c0} = ${D} tuổi. Khi tuổi mẹ gấp ${k} lần tuổi con thì mẹ hơn con ${k - 1} lần tuổi con, nên tuổi con lúc đó là ${D} : ${k - 1} = ${c}. Vậy sau ${c} − ${c0} = <b>${y}</b> năm nữa (khi đó mẹ ${c * k} tuổi, con ${c} tuổi).` });
      },
      () => {
        const c = R.int(6, 12), D = R.int(20, 32), S = 2 * c + D - 6;
        return mk({ text: `Cách đây 3 năm, tổng số tuổi của hai mẹ con là ${S} tuổi. Năm nay mẹ hơn con ${D} tuổi. Hỏi năm nay con bao nhiêu tuổi?`, answer: c, solution: `Sau 3 năm mỗi người thêm 3 tuổi, nên tổng số tuổi năm nay là ${S} + 6 = ${S + 6}. Hai lần tuổi con: ${S + 6} − ${D} = ${2 * c}. Tuổi con: ${2 * c} : 2 = <b>${c}</b> tuổi.` });
      },
    ]);
    return t();
  }

  function logicCut(R, lv) {
    if (lv === 0) {
      if (R.chance(0.5)) { const n = R.int(3, 7); return mk({ text: `Bác thợ cưa một khúc gỗ thành ${n} đoạn như hình. Hỏi bác đã cưa mấy lần?`, visual: svgLog(n), answer: n - 1, solution: `Mỗi chỗ cưa nằm giữa hai đoạn liền nhau. ${n} đoạn có ${n - 1} chỗ nối, nên cưa ${n} − 1 = <b>${n - 1}</b> lần.` }); }
      const n = R.int(3, 8);
      return mk({ text: `Có ${n} cây trồng thành một hàng:<div class="seq emoji">${'🌳'.repeat(n)}</div>Giữa hai cây liền nhau là một khoảng cách. Có bao nhiêu khoảng cách?`, answer: n - 1, solution: `Số khoảng cách ít hơn số cây 1: ${n} − 1 = <b>${n - 1}</b>.` });
    }
    let kinds;
    if (lv === 1) kinds = ['logs', 'trees', 'time'];
    else if (lv === 2) kinds = ['stairs', 'stairs2', 'sides', 'noends'];
    else kinds = ['lake', 'bell', 'climb', 'rest'];
    const kind = R.pick(kinds);
    if (kind === 'logs') {
      const d = R.int(2, 5), n = R.int(3, 9);
      return mk({ text: `Một khúc gỗ dài ${d * n} m. Người ta cưa thành các đoạn, mỗi đoạn dài ${d} m. Hỏi phải cưa mấy lần?`, answer: n - 1, solution: `Số đoạn gỗ: ${d * n} : ${d} = ${n} đoạn. Cưa thành ${n} đoạn cần ${n} − 1 = <b>${n - 1}</b> lần cưa.` });
    }
    if (kind === 'trees') {
      const d = R.int(2, 6), k = R.int(4, 10);
      return mk({ text: `Người ta trồng cây dọc một đoạn đường dài ${d * k} m, cứ ${d} m trồng một cây, có trồng cả ở hai đầu đường. Hỏi trồng được bao nhiêu cây?`, answer: k + 1, solution: `Số khoảng cách: ${d * k} : ${d} = ${k}. Trồng cả hai đầu thì số cây nhiều hơn số khoảng cách 1: ${k} + 1 = <b>${k + 1}</b> cây.` });
    }
    if (kind === 'time') {
      const n = R.int(3, 7), m = R.int(2, 6);
      return mk({ text: `Cưa một khúc gỗ thành ${n} đoạn, mỗi lần cưa mất ${m} phút. Hỏi cưa xong mất bao nhiêu phút?`, answer: (n - 1) * m, solution: `Cưa thành ${n} đoạn cần ${n - 1} lần cưa. Thời gian: ${n - 1} × ${m} = <b>${(n - 1) * m}</b> phút.` });
    }
    if (kind === 'stairs') {
      const f = R.int(3, 7), s = R.int(10, 20);
      return mk({ text: `Mỗi tầng của một tòa nhà có ${s} bậc cầu thang. Hỏi đi từ tầng 1 lên tầng ${f} phải bước qua bao nhiêu bậc?`, answer: (f - 1) * s, solution: `Từ tầng 1 lên tầng ${f} phải đi qua ${f} − 1 = ${f - 1} lượt cầu thang: ${f - 1} × ${s} = <b>${(f - 1) * s}</b> bậc.` });
    }
    if (kind === 'stairs2') {
      const a = R.int(3, 4), b = R.int(5, 9), s = R.int(10, 18);
      return mk({ text: `Đi từ tầng 1 lên tầng ${a} phải bước qua ${(a - 1) * s} bậc cầu thang. Hỏi đi từ tầng 1 lên tầng ${b} phải bước qua bao nhiêu bậc? (Các tầng có số bậc như nhau)`, answer: (b - 1) * s, solution: `Từ tầng 1 lên tầng ${a} là ${a - 1} lượt cầu thang, mỗi lượt ${(a - 1) * s} : ${a - 1} = ${s} bậc. Từ tầng 1 lên tầng ${b} là ${b - 1} lượt: ${b - 1} × ${s} = <b>${(b - 1) * s}</b> bậc.` });
    }
    if (kind === 'sides') {
      const d = R.int(3, 6), k = R.int(5, 12);
      return mk({ text: `Hai bên một con đường dài ${d * k} m, người ta trồng cây, cứ ${d} m trồng một cây, có trồng ở cả hai đầu đường. Hỏi trồng tất cả bao nhiêu cây?`, answer: 2 * (k + 1), solution: `Mỗi bên có ${d * k} : ${d} = ${k} khoảng cách, nên có ${k} + 1 = ${k + 1} cây. Hai bên: ${k + 1} × 2 = <b>${2 * (k + 1)}</b> cây.` });
    }
    if (kind === 'noends') {
      const d = R.int(2, 5), k = R.int(5, 12);
      return mk({ text: `Giữa hai cột điện cách nhau ${d * k} m, người ta trồng các cây, cứ ${d} m trồng một cây (không trồng ở chỗ hai cột điện). Hỏi trồng được bao nhiêu cây?`, answer: k - 1, solution: `Có ${d * k} : ${d} = ${k} khoảng cách. Không trồng ở hai đầu thì số cây ít hơn số khoảng cách 1: ${k} − 1 = <b>${k - 1}</b> cây.` });
    }
    if (kind === 'lake') {
      const d = R.int(3, 8), k = R.int(10, 30);
      return mk({ text: `Xung quanh một hồ nước có chu vi ${d * k} m, người ta trồng cây cách đều nhau ${d} m. Hỏi trồng được bao nhiêu cây?`, answer: k, solution: `Trồng theo vòng khép kín thì số cây bằng số khoảng cách: ${d * k} : ${d} = <b>${k}</b> cây.` });
    }
    if (kind === 'bell') {
      const a = R.int(3, 5), g = R.int(2, 4), b = R.int(6, 12);
      return mk({ text: `Một chiếc đồng hồ đánh ${a} tiếng chuông hết ${(a - 1) * g} giây (khoảng cách giữa hai tiếng liền nhau như nhau). Hỏi đồng hồ đánh ${b} tiếng chuông hết bao nhiêu giây?`, answer: (b - 1) * g, solution: `${a} tiếng chuông có ${a - 1} khoảng nghỉ, mỗi khoảng ${(a - 1) * g} : ${a - 1} = ${g} giây. ${b} tiếng chuông có ${b - 1} khoảng: ${b - 1} × ${g} = <b>${(b - 1) * g}</b> giây.` });
    }
    if (kind === 'climb') {
      const a = R.int(3, 5), g = R.int(1, 3), b = R.int(6, 10);
      return mk({ text: `${R.pick(NAMES)} đi bộ từ tầng 1 lên tầng ${a} hết ${(a - 1) * g} phút. Hỏi với tốc độ như thế, ${'bạn ấy'} đi từ tầng 1 lên tầng ${b} hết bao nhiêu phút?`, answer: (b - 1) * g, solution: `Từ tầng 1 lên tầng ${a} là ${a - 1} lượt cầu thang, mỗi lượt ${g} phút. Từ tầng 1 lên tầng ${b} là ${b - 1} lượt: ${b - 1} × ${g} = <b>${(b - 1) * g}</b> phút.` });
    }
    const n = R.int(4, 7), m = R.int(3, 6), r = R.int(1, 3);
    return mk({ text: `Bác thợ cưa một khúc gỗ thành ${n} đoạn. Mỗi lần cưa mất ${m} phút, sau mỗi lần cưa bác nghỉ ${r} phút (cưa xong lần cuối thì không nghỉ). Hỏi bác cưa xong hết bao nhiêu phút?`, answer: (n - 1) * m + (n - 2) * r, solution: `Cần ${n - 1} lần cưa: ${n - 1} × ${m} = ${(n - 1) * m} phút. Số lần nghỉ ít hơn số lần cưa 1: ${n - 2} lần, ${n - 2} × ${r} = ${(n - 2) * r} phút. Tổng: ${(n - 1) * m} + ${(n - 2) * r} = <b>${(n - 1) * m + (n - 2) * r}</b> phút.` });
  }

  function logicSeq(R, lv) {
    const kind = R.pick(lv === 1 ? ['add', 'sub', 'mul', 'missing'] : lv === 2 ? ['alt', 'grow', 'mul', 'missing', 'sub'] : ['fib', 'mulplus', 'square', 'inter', 'grow2']);
    const t = [];
    let sol;
    if (kind === 'add' || kind === 'missing') {
      const s = R.int(lv === 1 ? 3 : 6, lv === 1 ? 9 : 25), a = R.int(1, lv === 1 ? 50 : 200);
      for (let i = 0; i < 6; i++) t.push(a + s * i);
      if (kind === 'missing') {
        const k = R.int(1, 4);
        return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${t.map((v, i) => (i === k ? box : v)).join(', ')}</div>`, answer: t[k], solution: `Mỗi số hơn số đứng trước ${s} đơn vị. Ô trống là ${t[k - 1]} + ${s} = <b>${t[k]}</b> (thử lại: ${t[k]} + ${s} = ${t[k + 1]}).` });
      }
      sol = `Mỗi số hơn số đứng trước ${s} đơn vị. Số tiếp theo là ${t[4]} + ${s} = <b>${t[5]}</b>.`;
    } else if (kind === 'sub') {
      const s = R.int(3, lv === 1 ? 9 : 50), a = 5 * s + R.int(0, 100);
      for (let i = 0; i < 6; i++) t.push(a - s * i);
      sol = `Mỗi số kém số đứng trước ${s} đơn vị. Số tiếp theo là ${t[4]} − ${s} = <b>${t[5]}</b>.`;
    } else if (kind === 'mul') {
      const m = R.pick([2, 3]), a = R.int(1, lv === 1 ? 3 : 5);
      for (let i = 0; i < 6; i++) t.push(a * m ** i);
      sol = `Mỗi số gấp ${m} lần số đứng trước. Số tiếp theo là ${t[4]} × ${m} = <b>${t[5]}</b>.`;
    } else if (kind === 'alt') {
      const x = R.int(2, 12); let y = R.int(2, 12); while (y === x) y = R.int(2, 12);
      t.push(R.int(1, 30));
      for (let i = 1; i < 6; i++) t.push(t[i - 1] + (i % 2 ? x : y));
      sol = `Quy luật: cộng ${x}, cộng ${y}, cộng ${x}, cộng ${y}, ... xen kẽ nhau. Số tiếp theo là ${t[4]} + ${x} = <b>${t[5]}</b>.`;
    } else if (kind === 'grow') {
      const d0 = R.int(1, 5), e = R.int(1, 2), ds = range(0, 4).map(i => d0 + i * e);
      t.push(R.int(1, 20));
      for (let i = 1; i < 6; i++) t.push(t[i - 1] + ds[i - 1]);
      sol = `Khoảng cách giữa hai số liền nhau: ${ds.slice(0, 4).join(', ')}, ... (mỗi lần tăng thêm ${e}). Khoảng cách tiếp theo là ${ds[4]}, nên số tiếp theo là ${t[4]} + ${ds[4]} = <b>${t[5]}</b>.`;
    } else if (kind === 'fib') {
      const a = R.int(1, 5), b = R.int(a, 8);
      t.push(a, b);
      for (let i = 2; i < 6; i++) t.push(t[i - 1] + t[i - 2]);
      sol = `Từ số thứ ba, mỗi số bằng tổng hai số đứng ngay trước nó: ${t[2]} = ${t[0]} + ${t[1]}, ${t[3]} = ${t[1]} + ${t[2]}, ... Số tiếp theo là ${t[3]} + ${t[4]} = <b>${t[5]}</b>.`;
    } else if (kind === 'mulplus') {
      const m = R.pick([2, 3]), c = R.pick([1, 2, -1]), a = R.int(2, 4);
      t.push(a);
      for (let i = 1; i < 6; i++) t.push(t[i - 1] * m + c);
      const op = c > 0 ? `cộng ${c}` : `trừ ${-c}`, sg = c > 0 ? `+ ${c}` : `− ${-c}`;
      sol = `Mỗi số bằng số đứng trước nhân ${m} rồi ${op}: ${t[1]} = ${t[0]} × ${m} ${sg}, ${t[2]} = ${t[1]} × ${m} ${sg}, ... Số tiếp theo là ${t[4]} × ${m} ${sg} = <b>${t[5]}</b>.`;
    } else if (kind === 'square') {
      const k = R.int(1, 5);
      for (let i = 0; i < 6; i++) t.push((k + i) * (k + i));
      sol = `Các số lần lượt là ${range(0, 4).map(i => `${k + i} × ${k + i}`).join(', ')}. Số tiếp theo là ${k + 5} × ${k + 5} = <b>${t[5]}</b>.`;
    } else if (kind === 'inter') {
      const a = R.int(1, 20), s = R.int(2, 9), s2 = R.int(2, 9), b = 3 * s2 + R.int(10, 60);
      const u = [a, b, a + s, b - s2, a + 2 * s, b - 2 * s2, a + 3 * s];
      return mk({ text: `Tìm số tiếp theo của dãy số:<div class="seq">${u.slice(0, 6).join(', ')}, ?</div>`, answer: u[6], solution: `Đây là hai dãy xen kẽ nhau. Các số ở vị trí thứ 1, 3, 5: ${a}, ${a + s}, ${a + 2 * s} (mỗi lần thêm ${s}). Các số ở vị trí thứ 2, 4, 6: ${b}, ${b - s2}, ${b - 2 * s2} (mỗi lần bớt ${s2}). Số tiếp theo ở vị trí thứ 7: ${a + 2 * s} + ${s} = <b>${u[6]}</b>.` });
    } else {
      const a = R.int(1, 9);
      for (let i = 0; i < 6; i++) t.push(a + 2 ** i - 1);
      sol = `Khoảng cách giữa hai số liền nhau: 1, 2, 4, 8, ... (khoảng cách sau gấp đôi khoảng cách trước). Khoảng cách tiếp theo là 16, nên số tiếp theo là ${t[4]} + 16 = <b>${t[5]}</b>.`;
    }
    return mk({ text: `Tìm số tiếp theo của dãy số:<div class="seq">${t.slice(0, 5).join(', ')}, ?</div>`, answer: t[5], solution: sol });
  }

  function logicPattern(R, lv) {
    const base = R.sample(SHAPES, 4);
    const extra = SHAPES.filter(s => !base.includes(s));
    if (lv === 3) {
      const pat = R.pick([[base[0], base[1], base[1], base[2]], [base[0], base[0], base[1], base[2], base[1]], [base[0], base[1], base[0], base[2], base[2]]]);
      const X = R.pick([...new Set(pat)]), k = pat.length, N = R.int(25, 60);
      const q = Math.floor(N / k), r = N % k, c = pat.filter(s => s === X).length, cr = pat.slice(0, r).filter(s => s === X).length;
      return mk({
        text: `Các hình được xếp theo quy luật:<div class="seq emoji">${range(0, 2 * k - 1).map(i => pat[i % k]).join(' ')} ...</div>Trong ${N} hình đầu tiên có bao nhiêu hình ${X}?`,
        answer: q * c + cr,
        solution: `Nhóm ${k} hình ${pat.join('')} lặp lại, mỗi nhóm có ${c} hình ${X}. ${N} : ${k} = ${q} (dư ${r}): có ${q} nhóm đủ${r ? ` và ${r} hình đầu của nhóm tiếp theo (${pat.slice(0, r).join('')}), trong đó có ${cr} hình ${X}` : ''}. Số hình ${X}: ${q} × ${c}${r ? ` + ${cr}` : ''} = <b>${q * c + cr}</b>.`,
      });
    }
    const pat = lv === 1 ? R.pick([base.slice(0, 3), [base[0], base[0], base[1]], [base[0], base[1], base[1]]]) : R.pick([base.slice(0, 4), [base[0], base[1], base[1], base[2]], [base[0], base[0], base[1], base[2]]]);
    const k = pat.length, N = lv === 1 ? R.int(10, 20) : R.int(21, 60), uniq = [...new Set(pat)];
    const q = Math.floor(N / k), r = N % k, ans = pat[(N - 1) % k];
    return mk({
      type: 'choice', choices: choicesOf(R, ans, uniq.concat(R.sample(extra, 1))),
      text: `Các hình được xếp theo quy luật:<div class="seq emoji">${range(0, 2 * k - 1).map(i => pat[i % k]).join(' ')} ...</div>Hình thứ <b>${N}</b> là hình nào?`,
      answer: ans,
      solution: `Nhóm ${k} hình ${pat.join('')} lặp lại. ${N} : ${k} = ${q}${r ? ` (dư ${r})` : ''}. ` + (r === 0 ? `Hình thứ ${N} là hình cuối của nhóm thứ ${q}: <b>${ans}</b>.` : `Sau ${q} nhóm đủ, đếm tiếp ${r} hình của nhóm mới: hình thứ ${N} là <b>${ans}</b>.`),
    });
  }

  function logicTable(R, lv) {
    const rules = lv === 1 ? [
      { d: 'số thứ ba bằng tổng hai số đầu', f: (a, b) => a + b, s: (a, b) => `${a} + ${b}`, a: [10, 50], b: [10, 49] },
      { d: 'số thứ ba bằng tích hai số đầu', f: (a, b) => a * b, s: (a, b) => `${a} × ${b}`, a: [2, 9], b: [2, 9] },
      { d: 'số thứ ba bằng hiệu của số thứ nhất và số thứ hai', f: (a, b) => a - b, s: (a, b) => `${a} − ${b}`, a: [30, 99], b: [10, 29] },
    ] : lv === 2 ? [
      { d: 'lấy tổng hai số đầu nhân với 2', f: (a, b) => (a + b) * 2, s: (a, b) => `(${a} + ${b}) × 2`, a: [2, 20], b: [2, 20] },
      { d: 'lấy tích hai số đầu cộng thêm 1', f: (a, b) => a * b + 1, s: (a, b) => `${a} × ${b} + 1`, a: [2, 9], b: [2, 9] },
      { d: 'lấy tích hai số đầu bớt đi 1', f: (a, b) => a * b - 1, s: (a, b) => `${a} × ${b} − 1`, a: [2, 9], b: [2, 9] },
      { d: 'lấy số thứ nhất nhân 2 rồi cộng số thứ hai', f: (a, b) => a * 2 + b, s: (a, b) => `${a} × 2 + ${b}`, a: [3, 30], b: [1, 20] },
    ] : [
      { d: 'lấy số thứ nhất nhân với chính nó rồi cộng số thứ hai', f: (a, b) => a * a + b, s: (a, b) => `${a} × ${a} + ${b}`, a: [2, 9], b: [1, 9] },
      { d: 'lấy tích hai số đầu cộng với tổng hai số đầu', f: (a, b) => a * b + a + b, s: (a, b) => `${a} × ${b} + ${a} + ${b}`, a: [2, 9], b: [2, 9] },
      { d: 'lấy tổng hai số đầu nhân với hiệu hai số đầu', f: (a, b) => (a + b) * (a - b), s: (a, b) => `(${a} + ${b}) × (${a} − ${b})`, a: [4, 12], b: [1, 3] },
      { d: 'lấy tích hai số đầu chia cho 2', f: (a, b) => a * b / 2, s: (a, b) => `${a} × ${b} : 2`, a: [2, 9], b: [2, 9], even: true },
    ];
    const rule = R.pick(rules), rows = [];
    while (rows.length < 3) {
      const a = R.int(rule.a[0], rule.a[1]), b = R.int(rule.b[0], rule.b[1]);
      if (rule.even && (a * b) % 2) continue;
      if (rows.some(r => r[0] === a && r[1] === b)) continue;
      rows.push([a, b, rule.f(a, b)]);
    }
    const [a, b, c] = rows[2];
    return mk({
      text: 'Các số trong mỗi hàng được viết theo cùng một quy luật. Tìm số thay cho dấu ?',
      visual: svgTable(rows.map((r, i) => (i === 2 ? [String(r[0]), String(r[1]), '?'] : r.map(String)))),
      answer: c,
      solution: `Quy luật: ${rule.d}. Thử: ${rows.slice(0, 2).map(r => `${rule.s(r[0], r[1])} = ${r[2]}`).join('; ')}. Vậy số cần tìm là ${rule.s(a, b)} = <b>${c}</b>.`,
    });
  }

  function logicBalance(R, lv) {
    const [X, Y, Z] = R.sample(FRUITS, 3);
    const t = R.pick(lv === 1 ? ['chain', 'kg', 'weight'] : lv === 2 ? ['chain3', 'apples', 'packs'] : ['sys', 'ratio', 'sys2']);
    if (t === 'chain' || t === 'chain3') {
      const a = R.int(2, 3), b = R.int(2, 4), k = t === 'chain' ? 1 : R.int(2, 3), ans = k * a * b;
      return mk({ text: `Trên cân thăng bằng:<div class="seq emoji">1 ${X} = ${a} ${Y}<br>1 ${Y} = ${b} ${Z}</div>Hỏi ${k} ${X} nặng bằng mấy ${Z}?`, answer: ans, solution: `1 ${X} = ${a} ${Y} = ${a} × ${b} = ${a * b} ${Z}.${k > 1 ? ` Vậy ${k} ${X} nặng bằng ${a * b} × ${k} = <b>${ans}</b> ${Z}.` : ` Đáp số <b>${ans}</b> ${Z}.`}` });
    }
    if (t === 'kg') {
      const w = R.int(2, 4), k = R.pick([2, 4, 5, 8]);
      return mk({ text: `Một quả dưa hấu nặng ${w} kg. Quả dưa nặng bằng ${k} quả bưởi như nhau. Hỏi mỗi quả bưởi nặng bao nhiêu gam?`, answer: w * 1000 / k, solution: `${w} kg = ${fmt(w * 1000)} g. Mỗi quả bưởi nặng ${fmt(w * 1000)} : ${k} = <b>${fmt(w * 1000 / k)}</b> g.` });
    }
    if (t === 'weight') {
      const P = R.int(1, 3), m = 100 * R.int(1, 9);
      return mk({ text: `Đĩa cân bên trái có một quả bí và quả cân ${m} g. Đĩa cân bên phải có quả cân ${P} kg. Cân thăng bằng. Hỏi quả bí nặng bao nhiêu gam?`, answer: P * 1000 - m, solution: `${P} kg = ${fmt(P * 1000)} g. Quả bí nặng: ${fmt(P * 1000)} − ${m} = <b>${fmt(P * 1000 - m)}</b> g.` });
    }
    if (t === 'apples') {
      const k = R.int(3, 5), a = 50 * R.int(2, 5);
      return mk({ text: `${k} quả táo như nhau nặng bằng một quả bưởi. Quả bưởi nặng ${fmt(k * a)} g. Hỏi mỗi quả táo nặng bao nhiêu gam?`, answer: a, solution: `Mỗi quả táo nặng ${fmt(k * a)} : ${k} = <b>${a}</b> g.` });
    }
    if (t === 'packs') {
      let n, p;
      do { n = R.int(2, 3); p = 50 * R.int(6, 18); } while (n * p <= 1000 || n * p >= 2000);
      return mk({ text: `Đĩa cân bên trái có ${n} gói kẹo như nhau. Đĩa cân bên phải có một quả cân 1 kg và một quả cân ${n * p - 1000} g. Cân thăng bằng. Hỏi mỗi gói kẹo nặng bao nhiêu gam?`, answer: p, solution: `Đĩa phải nặng 1.000 + ${n * p - 1000} = ${fmt(n * p)} g. Mỗi gói kẹo: ${fmt(n * p)} : ${n} = <b>${p}</b> g.` });
    }
    if (t === 'sys') {
      const x = 50 * R.int(2, 8), y = 50 * R.int(2, 8);
      return mk({ text: `Một quả ${X} và một quả ${Y} nặng tất cả ${fmt(x + y)} g. Hai quả ${X} và một quả ${Y} nặng tất cả ${fmt(2 * x + y)} g. Hỏi quả ${Y} nặng bao nhiêu gam?`, answer: y, solution: `Lần thứ hai nhiều hơn lần thứ nhất đúng 1 quả ${X}, nên quả ${X} nặng ${fmt(2 * x + y)} − ${fmt(x + y)} = ${x} g. Quả ${Y} nặng ${fmt(x + y)} − ${x} = <b>${y}</b> g.` });
    }
    if (t === 'ratio') {
      let p, q, b;
      do { p = R.int(2, 3); q = R.int(p + 1, 6); b = R.int(2, 4); } while ((q * b) % p);
      return mk({ text: `Trên cân thăng bằng:<div class="seq emoji">${p} ${X} = ${q} ${Y}<br>1 ${Y} = ${b} ${Z}</div>Hỏi 1 ${X} nặng bằng mấy ${Z}?`, answer: q * b / p, solution: `${p} ${X} = ${q} ${Y} = ${q} × ${b} = ${q * b} ${Z}. Vậy 1 ${X} = ${q * b} : ${p} = <b>${q * b / p}</b> ${Z}.` });
    }
    const x = 50 * R.int(2, 8), y = 50 * R.int(2, 8), a = 2 * x + y, b = x + 2 * y;
    return mk({ text: `Hai quả ${X} và một quả ${Y} nặng ${fmt(a)} g. Một quả ${X} và hai quả ${Y} nặng ${fmt(b)} g. Hỏi một quả ${X} nặng bao nhiêu gam?`, answer: x, solution: `Gộp cả hai lần: 3 quả ${X} và 3 quả ${Y} nặng ${fmt(a)} + ${fmt(b)} = ${fmt(a + b)} g, nên 1 quả ${X} và 1 quả ${Y} nặng ${fmt(a + b)} : 3 = ${fmt(x + y)} g. Từ lần thứ nhất: 1 quả ${X} nặng ${fmt(a)} − ${fmt(x + y)} = <b>${x}</b> g.` });
  }

  function logicSeat(R, lv) {
    const n = lv + 2;
    const pos = (pm, X) => pm.indexOf(X) + 1;
    for (;;) {
      const names = R.sample(NAMES, n), truth = R.shuffle(names), all = perms(names);
      const tp = X => pos(truth, X);
      const makeClue = () => {
        const kind = R.pick(['abs', 'leftAdj', 'leftAdj', 'adj', 'notAdj', 'end', 'notEnd', 'left']);
        const [X, Y] = R.sample(names, 2);
        if (kind === 'abs') return { s: `${X} ngồi ở ghế số ${tp(X)}.`, f: pm => pos(pm, X) === tp(X) };
        if (kind === 'leftAdj') { const i = R.int(0, n - 2), A = truth[i], B = truth[i + 1]; return { s: `${A} ngồi ngay bên trái ${B}.`, f: pm => pos(pm, A) + 1 === pos(pm, B) }; }
        if (kind === 'adj') { const i = R.int(0, n - 2), [A, B] = R.shuffle([truth[i], truth[i + 1]]); return { s: `${A} ngồi cạnh ${B}.`, f: pm => Math.abs(pos(pm, A) - pos(pm, B)) === 1 }; }
        if (kind === 'notAdj') { if (Math.abs(tp(X) - tp(Y)) === 1) return null; return { s: `${X} không ngồi cạnh ${Y}.`, f: pm => Math.abs(pos(pm, X) - pos(pm, Y)) !== 1 }; }
        if (kind === 'end') { const A = R.pick([truth[0], truth[n - 1]]); return { s: `${A} ngồi ở một đầu hàng ghế.`, f: pm => pos(pm, A) === 1 || pos(pm, A) === n }; }
        if (kind === 'notEnd') { if (n < 4) return null; const A = R.pick(truth.slice(1, n - 1)); return { s: `${A} không ngồi ở đầu hàng ghế.`, f: pm => pos(pm, A) !== 1 && pos(pm, A) !== n }; }
        const [A, B] = tp(X) < tp(Y) ? [X, Y] : [Y, X];
        return { s: `${A} ngồi bên trái ${B} (không nhất thiết ngồi sát nhau).`, f: pm => pos(pm, A) < pos(pm, B) };
      };
      let clues = [], cand = all;
      for (let step = 0; step < 30 && cand.length > 1; step++) {
        const c = makeClue();
        if (!c || clues.some(x => x.s === c.s)) continue;
        const nc = cand.filter(pm => c.f(pm));
        if (nc.length < cand.length) { clues.push(c); cand = nc; }
      }
      if (cand.length !== 1) continue;
      for (let i = clues.length - 1; i >= 0; i--) {
        const rest = clues.filter((_, j) => j !== i);
        if (all.filter(pm => rest.every(c => c.f(pm))).length === 1) clues = rest;
      }
      if (clues.length < 2 || clues.filter(c => /ghế số/.test(c.s)).length > 1) continue;
      const order = truth.map((x, i) => `ghế ${i + 1}: ${x}`).join(', ');
      const head = `${n} bạn ${R.shuffle(names).join(', ')} ngồi trên một hàng ${n} ghế, các ghế đánh số 1 đến ${n} từ trái sang phải.<br>${R.shuffle(clues).map(c => '• ' + c.s).join('<br>')}<br>`;
      if (lv === 1 || R.chance(0.5)) {
        const k = R.int(1, n);
        return mk({ type: 'choice', choices: R.shuffle(names), text: head + `Hỏi bạn nào ngồi ở ghế số ${k}?`, answer: truth[k - 1], solution: `Thử xếp sao cho đúng mọi điều kiện, chỉ có một cách: ${order}. Bạn ngồi ghế số ${k} là <b>${truth[k - 1]}</b>.` });
      }
      const X = R.pick(names);
      return mk({ text: head + `Hỏi ${X} ngồi ở ghế số mấy?`, answer: tp(X), solution: `Thử xếp sao cho đúng mọi điều kiện, chỉ có một cách: ${order}. ${X} ngồi ở ghế số <b>${tp(X)}</b>.` });
    }
  }

  function logicTruth(R, lv) {
    const n = lv === 2 ? 3 : 4;
    const [act, short] = R.pick([['làm vỡ lọ hoa', 'làm vỡ'], ['ăn vụng chiếc bánh', 'ăn'], ['giấu chiếc bút của cô giáo', 'giấu'], ['vẽ lên bảng', 'vẽ']]);
    for (;;) {
      const names = R.sample(NAMES, n), k = R.pick([1, n - 1]);
      const st = names.map(S => {
        const others = names.filter(x => x !== S), X = R.pick(others);
        const type = R.pick(['me', 'is', 'not']);
        if (type === 'me') return { s: `${S}: “Tớ không ${short}.”`, f: c => c !== S };
        if (type === 'is') return { s: `${S}: “${X} ${short} đấy.”`, f: c => c === X };
        return { s: `${S}: “${X} không ${short}.”`, f: c => c !== X };
      });
      const cnt = c => st.filter(x => x.f(c)).length;
      const ok = names.filter(c => cnt(c) === k);
      if (ok.length !== 1) continue;
      const ans = ok[0], word = k === 1 ? 'chỉ có một bạn nói thật' : 'chỉ có một bạn nói dối';
      return mk({
        type: 'choice', choices: R.shuffle(names),
        text: `Một trong ${n} bạn ${names.join(', ')} đã ${act}. Khi cô hỏi, các bạn trả lời:<br>${st.map(x => x.s).join('<br>')}<br>Biết rằng ${word}. Hỏi ai đã ${act}?`,
        answer: ans,
        solution: `Thử lần lượt từng bạn:<br>${names.map(c => `• Nếu ${c} ${short} thì có ${cnt(c)} bạn nói thật${cnt(c) === k ? ' → đúng điều kiện.' : ' → loại.'}`).join('<br>')}<br>Vậy người đã ${act} là <b>${ans}</b>.`,
      });
    }
  }

  function logicRiver(R, lv) {
    const kind = lv === 2 ? R.pick(['boat', 'jug']) : R.pick(['jug', 'bottle', 'boat']);
    if (kind === 'boat') {
      const k = R.int(2, 3), n = R.int(k + 2, lv === 2 ? 7 : 10), f = Math.ceil((n - 1) / (k - 1)), ans = 2 * f - 1;
      return mk({ text: `Có ${n} người cần qua sông bằng một chiếc thuyền. Thuyền chở được nhiều nhất ${k} người (kể cả người chèo) và phải có người chèo thuyền quay về. Hỏi cần ít nhất bao nhiêu lượt thuyền (tính cả lượt đi và lượt về) để tất cả qua sông?`, answer: ans, solution: `Mỗi lần đi sang rồi quay về, thuyền đưa thêm được ${k - 1} người sang bờ bên kia (1 người phải chèo về). Lượt cuối cùng thuyền chở ${k} người sang và không phải về. Số lượt đi sang: ${f} (vì ${f - 1} × ${k - 1} + ${k} ≥ ${n}). Số lượt về ít hơn 1: ${f - 1}. Tổng: ${f} + ${f - 1} = <b>${ans}</b> lượt.` });
    }
    if (kind === 'bottle') {
      const k = R.int(2, 4), n = R.int(k * 2 + 1, 20);
      let drunk = n, e = n; const steps = [];
      while (e >= k) { const nw = Math.floor(e / k); steps.push(`${e} vỏ đổi được ${nw} chai${e % k ? ` (thừa ${e % k} vỏ)` : ''}`); drunk += nw; e = e % k + nw; }
      return mk({ text: `Cửa hàng cho đổi ${k} vỏ chai lấy 1 chai nước mới. ${R.pick(NAMES)} mua ${n} chai nước. Hỏi bạn ấy uống được nhiều nhất bao nhiêu chai nước (không mượn thêm vỏ)?`, answer: drunk, solution: `Uống ${n} chai, được ${n} vỏ. ${steps.join('; ')}. Uống hết lại có vỏ mới để đổi tiếp, đến khi còn ít hơn ${k} vỏ. Tổng số chai uống được: <b>${drunk}</b>.` });
    }
    const [A, B] = R.pick([[5, 3], [7, 4], [8, 5], [9, 4], [7, 3], [8, 3]]);
    const nm = ['can ' + A + ' l', 'can ' + B + ' l'], cap2 = [A, B];
    const OPS = [
      { d: `Đổ đầy ${nm[0]}.`, f: s => [A, s[1]] }, { d: `Đổ đầy ${nm[1]}.`, f: s => [s[0], B] },
      { d: `Đổ hết nước trong ${nm[0]} ra ngoài.`, f: s => [0, s[1]] }, { d: `Đổ hết nước trong ${nm[1]} ra ngoài.`, f: s => [s[0], 0] },
      { d: `Rót nước từ ${nm[0]} sang ${nm[1]} cho đến khi ${nm[1]} đầy hoặc ${nm[0]} hết nước.`, f: s => { const t = Math.min(s[0], B - s[1]); return [s[0] - t, s[1] + t]; }, pour: true },
      { d: `Rót nước từ ${nm[1]} sang ${nm[0]} cho đến khi ${nm[0]} đầy hoặc ${nm[1]} hết nước.`, f: s => { const t = Math.min(s[1], A - s[0]); return [s[0] + t, s[1] - t]; }, pour: true },
    ];
    for (;;) {
      const L = lv === 2 ? R.int(3, 4) : R.int(5, 6);
      let s = [0, 0]; const used = [], states = [];
      for (let i = 0; i < L; i++) {
        const choices = OPS.filter(o => { const t = o.f(s); return t[0] !== s[0] || t[1] !== s[1]; });
        const o = R.pick(choices); s = o.f(s); used.push(o); states.push(s);
      }
      if (used.filter(o => o.pour).length < 2 || !used[L - 1].pour || (s[0] === 0 && s[1] === 0)) continue;
      const which = s[0] === 0 ? 1 : s[1] === 0 ? 0 : R.int(0, 1);
      if (new Set(states.map(x => x.join(','))).size < L) continue;
      return mk({
        text: `Có một ${nm[0]} và một ${nm[1]}, lúc đầu cả hai can đều rỗng. Bạn ${R.pick(NAMES)} làm lần lượt:<br>${used.map((o, i) => `${i + 1}. ${o.d}`).join('<br>')}<br>Hỏi lúc này ${nm[which]} có bao nhiêu lít nước?`,
        answer: s[which],
        solution: `Ghi lại số nước trong (${nm[0]}, ${nm[1]}) sau mỗi bước:<br>${states.map((x, i) => `Bước ${i + 1}: (${x[0]} l, ${x[1]} l)`).join('<br>')}<br>Vậy ${nm[which]} có <b>${s[which]}</b> lít nước.`,
      });
    }
  }

  function logicCalendar(R, lv) {
    const wc = w => choicesOf(R, WDC[w], WDC);
    if (lv === 1) {
      const t = R.pick([
        () => { const w = R.int(0, 6), k = R.int(2, 13), a = (w + k) % 7; return mk({ type: 'choice', choices: wc(a), text: `Hôm nay là ${WD[w]}. Hỏi ${k} ngày nữa là thứ mấy?`, answer: WDC[a], solution: `${k > 7 ? `Cứ 7 ngày thì lặp lại thứ cũ; ${k} = 7 + ${k - 7}, nên chỉ cần đếm tiếp ${k - 7}` : `Đếm tiếp ${k}`} ngày từ ${WD[w]}: <b>${WDC[a]}</b>.` }); },
        () => { const w = R.int(0, 6), d = R.int(1, 12), k = R.pick([7, 14]); return mk({ type: 'choice', choices: wc(w), text: `Ngày ${d} của một tháng là ${WD[w]}. Hỏi ngày ${d + k} của tháng đó là thứ mấy?`, answer: WDC[w], solution: `${d + k} − ${d} = ${k} ngày, đúng ${k / 7} tuần lễ. Nên ngày ${d + k} cũng là <b>${WDC[w]}</b>.` }); },
        () => { const d = R.int(1, 16), w = R.int(1, 6); return mk({ text: `${cap(WD[w])} tuần này là ngày ${d}. Hỏi ${WD[w]} tuần sau là ngày bao nhiêu?`, answer: d + 7, solution: `Một tuần có 7 ngày: ${d} + 7 = <b>${d + 7}</b>.` }); },
      ]);
      return t();
    }
    if (lv === 2) {
      const t = R.pick([
        () => { const w = R.int(0, 6), d1 = R.int(1, 10), d2 = d1 + R.int(8, 20), a = (w + d2 - d1) % 7; return mk({ type: 'choice', choices: wc(a), text: `Ngày ${d1} tháng ${R.int(1, 12)} là ${WD[w]}. Hỏi ngày ${d2} của tháng đó là thứ mấy?`, answer: WDC[a], solution: `Từ ngày ${d1} đến ngày ${d2} là ${d2 - d1} ngày = ${Math.floor((d2 - d1) / 7)} tuần và ${(d2 - d1) % 7} ngày. Đếm tiếp ${(d2 - d1) % 7} ngày từ ${WD[w]}: <b>${WDC[a]}</b>.` }); },
        () => { const d = R.int(1, 7), w = R.int(1, 6), k = R.int(3, 4); return mk({ text: `Trong một tháng, ${WD[w]} đầu tiên là ngày ${d}. Hỏi ${WD[w]} thứ ${k === 3 ? 'ba' : 'tư'} của tháng đó là ngày bao nhiêu?`, answer: d + 7 * (k - 1), solution: `Các ${WD[w]} cách nhau 7 ngày: ${range(0, k - 1).map(i => d + 7 * i).join(', ')}. ${cap(WD[w])} thứ ${k === 3 ? 'ba' : 'tư'} là ngày <b>${d + 7 * (k - 1)}</b>.` }); },
        () => { const w = R.int(0, 6), d = R.int(20, 30), k = R.int(8, 17), a = ((w - k) % 7 + 7) % 7; return mk({ type: 'choice', choices: wc(a), text: `Hôm nay là ${WD[w]}, ngày ${d}. Hỏi ngày ${d - k} của tháng này là thứ mấy?`, answer: WDC[a], solution: `Ngày ${d - k} trước hôm nay ${k} ngày = ${Math.floor(k / 7)} tuần và ${k % 7} ngày. Đếm lùi ${k % 7} ngày từ ${WD[w]}: <b>${WDC[a]}</b>.` }); },
      ]);
      return t();
    }
    const t = R.pick([
      () => {
        const m = R.pick([1, 3, 4, 5, 6, 7, 8, 9, 10, 11]), L = DAYS[m], d1 = R.int(L - 8, L), d2 = R.int(3, 20), w = R.int(0, 6), k = L - d1 + d2, a = (w + k) % 7;
        return mk({ type: 'choice', choices: wc(a), text: `Ngày ${d1} tháng ${m} là ${WD[w]}. Hỏi ngày ${d2} tháng ${m + 1} là thứ mấy? (Tháng ${m} có ${L} ngày)`, answer: WDC[a], solution: `Từ ngày ${d1}/${m} đến ngày ${L}/${m} là ${L - d1} ngày, thêm ${d2} ngày của tháng ${m + 1}: tất cả ${k} ngày = ${Math.floor(k / 7)} tuần và ${k % 7} ngày. Đếm tiếp ${k % 7} ngày từ ${WD[w]}: <b>${WDC[a]}</b>.` });
      },
      () => {
        const m = R.int(1, 12), L = DAYS[m], w1 = R.int(0, 6), x = R.int(0, 6), first = 1 + (x - w1 + 7) % 7;
        const days = []; for (let d = first; d <= L; d += 7) days.push(d);
        return mk({ text: `Tháng ${m} năm nay có ${L} ngày. Ngày 1 tháng ${m} là ${WD[w1]}. Hỏi tháng ${m} có bao nhiêu ngày ${WD[x]}?`, answer: days.length, solution: `${cap(WD[x])} đầu tiên của tháng là ngày ${first}. Các ngày ${WD[x]}: ${days.join(', ')}. Có <b>${days.length}</b> ngày.` });
      },
      () => {
        const m = R.int(1, 10), w = R.int(0, 6), k = DAYS[m] + DAYS[m + 1], a = (w + k) % 7;
        return mk({ type: 'choice', choices: wc(a), text: `Ngày 1 tháng ${m} là ${WD[w]}. Hỏi ngày 1 tháng ${m + 2} là thứ mấy? (Tháng ${m} có ${DAYS[m]} ngày, tháng ${m + 1} có ${DAYS[m + 1]} ngày)`, answer: WDC[a], solution: `Từ ngày 1/${m} đến ngày 1/${m + 2} là ${DAYS[m]} + ${DAYS[m + 1]} = ${k} ngày = ${Math.floor(k / 7)} tuần và ${k % 7} ngày. Đếm tiếp ${k % 7} ngày từ ${WD[w]}: <b>${WDC[a]}</b>.` });
      },
    ]);
    return t();
  }

  // =====================================================================
  // SỐ HỌC
  // =====================================================================
  function arithMult0(R) {
    const X = R.pick(FRUITS), k = R.int(2, 5), n = R.int(2, 5);
    return mk({
      text: `Có ${k} đĩa, mỗi đĩa ${n} quả:<div class="seq emoji">${Array(k).fill(X.repeat(n)).join('&nbsp;&nbsp;&nbsp;')}</div>Có tất cả bao nhiêu quả?`, answer: k * n,
      solution: `${n} quả được lấy ${k} lần: ${Array(k).fill(n).join(' + ')} = ${n} × ${k} = <b>${k * n}</b> quả.`,
    });
  }

  function arithDiv0(R) {
    const X = R.pick(FRUITS), k = R.int(2, 5), q = R.int(2, 5), n = k * q;
    if (R.chance(0.5)) return mk({ text: `Chia đều ${n} quả cho ${k} bạn:<div class="seq emoji">${groupsOf5(X, n)}</div>Mỗi bạn được mấy quả?`, answer: q, solution: `${n} : ${k} = <b>${q}</b> quả (vì ${q} × ${k} = ${n}).` });
    return mk({ text: `Có ${n} quả, xếp vào các đĩa, mỗi đĩa ${q} quả:<div class="seq emoji">${groupsOf5(X, n)}</div>Xếp được mấy đĩa?`, answer: k, solution: `${n} : ${q} = <b>${k}</b> đĩa (vì ${q} × ${k} = ${n}).` });
  }

  function arithAddSub0(R) {
    if (R.chance(0.5)) { const a = R.int(100, 699), b = R.int(10, 999 - a); return mk({ text: `Tính:<div class="seq">${a} + ${b} = ?</div>`, answer: a + b, solution: `Cộng từ hàng đơn vị, đến hàng chục rồi hàng trăm (nhớ nếu có): ${a} + ${b} = <b>${a + b}</b>.` }); }
    const a = R.int(200, 999), b = R.int(10, a - 10);
    return mk({ text: `Tính:<div class="seq">${a} − ${b} = ?</div>`, answer: a - b, solution: `Trừ từ hàng đơn vị, đến hàng chục rồi hàng trăm (nhớ nếu có): ${a} − ${b} = <b>${a - b}</b>. Thử lại: ${a - b} + ${b} = ${a}.` });
  }

  function arithTable(R, lv) {
    const a = lv === 0 ? R.int(2, 5) : R.int(6, 9), b = R.int(lv === 0 ? 1 : 2, 10), c = a * b;
    const t = R.pick(lv === 0 ? ['mul', 'div'] : ['mul', 'div', 'm1', 'd1', 'd2']);
    if (t === 'mul') return mk({ text: `Tính:<div class="seq">${a} × ${b} = ?</div>`, answer: c, solution: `Theo bảng nhân ${a}: ${a} × ${b} = <b>${c}</b>.` });
    if (t === 'div') return mk({ text: `Tính:<div class="seq">${c} : ${a} = ?</div>`, answer: b, solution: `Vì ${a} × ${b} = ${c} nên ${c} : ${a} = <b>${b}</b>.` });
    if (t === 'm1') return mk({ text: `Điền số thích hợp vào ô trống:<div class="seq">${a} × ${box} = ${c}</div>`, answer: b, solution: `${box} = ${c} : ${a} = <b>${b}</b>.` });
    if (t === 'd1') return mk({ text: `Điền số thích hợp vào ô trống:<div class="seq">${box} : ${a} = ${b}</div>`, answer: c, solution: `Số bị chia = thương × số chia: ${b} × ${a} = <b>${c}</b>.` });
    return mk({ text: `Điền số thích hợp vào ô trống:<div class="seq">${c} : ${box} = ${a}</div>`, answer: b, solution: `Số chia = số bị chia : thương: ${c} : ${a} = <b>${b}</b>.` });
  }

  function arithMulDiv(R, lv) {
    const b = R.int(2, 9);
    const t = R.pick(['mul', 'div', 'mul2']);
    let a, q;
    if (t === 'mul') {
      a = lv === 1 ? R.int(12, 99) : R.int(1000, Math.min(9999, Math.floor(99999 / b)));
      return mk({ text: `Tính:<div class="seq">${fmt(a)} × ${b} = ?</div>`, answer: a * b, solution: `Nhân lần lượt từ hàng đơn vị sang trái (nhớ sang hàng bên cạnh): ${fmt(a)} × ${b} = <b>${fmt(a * b)}</b>.` });
    }
    if (t === 'mul2') {
      a = lv === 1 ? R.int(101, Math.floor(999 / b)) : R.int(10000, Math.floor(99999 / b));
      return mk({ text: `Tính:<div class="seq">${fmt(a)} × ${b} = ?</div>`, answer: a * b, solution: `Nhân lần lượt từ hàng đơn vị sang trái: ${fmt(a)} × ${b} = <b>${fmt(a * b)}</b>.` });
    }
    q = lv === 1 ? R.int(Math.ceil(100 / b), Math.floor(999 / b)) : R.int(Math.ceil(1000 / b), Math.floor((R.chance(0.5) ? 9999 : 99999) / b));
    const n = q * b;
    return mk({ text: `Tính:<div class="seq">${fmt(n)} : ${b} = ?</div>`, answer: q, solution: `Chia lần lượt từ hàng cao nhất sang phải: ${fmt(n)} : ${b} = <b>${fmt(q)}</b>. Thử lại: ${fmt(q)} × ${b} = ${fmt(n)}.` });
  }

  function arithExpr(R, lv) {
    if (lv === 1) {
      const t = R.pick([
        () => { const a = R.int(10, 99), b = R.int(2, 9), c = R.int(2, 9); return mk({ text: `Tính giá trị biểu thức:<div class="seq">${a} + ${b} × ${c}</div>`, answer: a + b * c, solution: `Nhân trước, cộng sau: ${b} × ${c} = ${b * c}; ${a} + ${b * c} = <b>${a + b * c}</b>.` }); },
        () => { const a = R.int(11, 30), b = R.int(2, 5), c = R.int(1, a * b - 1); return mk({ text: `Tính giá trị biểu thức:<div class="seq">${a} × ${b} − ${c}</div>`, answer: a * b - c, solution: `Nhân trước, trừ sau: ${a} × ${b} = ${a * b}; ${a * b} − ${c} = <b>${a * b - c}</b>.` }); },
        () => { const c = R.int(2, 9), q = R.int(2, 9), a = R.int(q + 10, 99); return mk({ text: `Tính giá trị biểu thức:<div class="seq">${a} − ${c * q} : ${c}</div>`, answer: a - q, solution: `Chia trước, trừ sau: ${c * q} : ${c} = ${q}; ${a} − ${q} = <b>${a - q}</b>.` }); },
        () => { const a = R.int(5, 20), b = R.int(3, 15), c = R.int(2, 6); return mk({ text: `Tính giá trị biểu thức:<div class="seq">(${a} + ${b}) × ${c}</div>`, answer: (a + b) * c, solution: `Tính trong ngoặc trước: ${a} + ${b} = ${a + b}; ${a + b} × ${c} = <b>${(a + b) * c}</b>.` }); },
      ]);
      return t();
    }
    if (lv === 2) {
      const t = R.pick([
        () => { const a = R.int(11, 40), b = R.int(2, 9), c = R.int(11, 40), d = R.int(2, 9); return mk({ text: `Tính giá trị biểu thức:<div class="seq">${a} × ${b} + ${c} × ${d}</div>`, answer: a * b + c * d, solution: `Làm phép nhân trước: ${a} × ${b} = ${a * b}; ${c} × ${d} = ${c * d}. Rồi cộng: ${a * b} + ${c * d} = <b>${a * b + c * d}</b>.` }); },
        () => { const c = R.int(2, 9), q = R.int(11, 60), b = R.int(10, 200), a = b + c * q; return mk({ text: `Tính giá trị biểu thức:<div class="seq">(${a} − ${b}) : ${c}</div>`, answer: q, solution: `Trong ngoặc trước: ${a} − ${b} = ${c * q}; ${c * q} : ${c} = <b>${q}</b>.` }); },
        () => { const b = R.int(2, 9), q = R.int(5, 40), c = R.int(2, 9); return mk({ text: `Tính giá trị biểu thức:<div class="seq">${b * q} : ${b} × ${c}</div>`, answer: q * c, solution: `Chỉ có nhân, chia thì tính lần lượt từ trái sang phải: ${b * q} : ${b} = ${q}; ${q} × ${c} = <b>${q * c}</b>.` }); },
        () => { const a = R.int(3, 9), c = R.int(10, 80), b = c + R.int(5, 60); return mk({ text: `Tính giá trị biểu thức:<div class="seq">${a} × (${b} − ${c})</div>`, answer: a * (b - c), solution: `Trong ngoặc trước: ${b} − ${c} = ${b - c}; ${a} × ${b - c} = <b>${a * (b - c)}</b>.` }); },
        () => { const c = R.int(2, 9), q = R.int(10, 50), a = R.int(100, 400), d = R.int(10, a); return mk({ text: `Tính giá trị biểu thức:<div class="seq">${a} + ${c * q} : ${c} − ${d}</div>`, answer: a + q - d, solution: `Chia trước: ${c * q} : ${c} = ${q}. Rồi tính từ trái sang phải: ${a} + ${q} = ${a + q}; ${a + q} − ${d} = <b>${a + q - d}</b>.` }); },
      ]);
      return t();
    }
    if (R.chance(0.5)) {
      for (;;) {
        const a = R.int(2, 12), b = R.int(2, 9), c = R.int(3, 9), d = R.int(1, c - 1);
        const E = [
          [`(${a} + ${b}) × ${c} − ${d}`, (a + b) * c - d],
          [`${a} + ${b} × (${c} − ${d})`, a + b * (c - d)],
          [`${a} + ${b} × ${c} − ${d}`, a + b * c - d],
          [`(${a} + ${b}) × (${c} − ${d})`, (a + b) * (c - d)],
        ];
        if (new Set(E.map(e => e[1])).size < 4) continue;
        const [s, v] = R.pick(E);
        return mk({ type: 'choice', choices: R.shuffle(E.map(e => e[0])), text: `Biểu thức nào dưới đây có giá trị bằng <b>${v}</b>?`, answer: s, solution: `Tính giá trị từng biểu thức (trong ngoặc trước, nhân trước cộng trừ sau):<br>${E.map(e => `${e[0]} = ${e[1]}`).join('<br>')}<br>Biểu thức có giá trị ${v} là <b>${s}</b>.` });
      }
    }
    const t = R.pick([
      () => { const a = R.int(10, 40), b = R.int(10, 40), c = R.int(2, 6), d = R.int(2, 9), e = R.int(2, Math.floor((a + b) * c / d)); return mk({ text: `Tính giá trị biểu thức:<div class="seq">(${a} + ${b}) × ${c} − ${d} × ${e}</div>`, answer: (a + b) * c - d * e, solution: `(${a} + ${b}) × ${c} = ${a + b} × ${c} = ${(a + b) * c}; ${d} × ${e} = ${d * e}; ${(a + b) * c} − ${d * e} = <b>${(a + b) * c - d * e}</b>.` }); },
      () => { const c = R.int(5, 30), b = c + R.int(2, 9), d = R.int(2, 9), a = (b - c) * d + R.int(0, 300); return mk({ text: `Tính giá trị biểu thức:<div class="seq">${a} − (${b} − ${c}) × ${d}</div>`, answer: a - (b - c) * d, solution: `${b} − ${c} = ${b - c}; ${b - c} × ${d} = ${(b - c) * d}; ${a} − ${(b - c) * d} = <b>${a - (b - c) * d}</b>.` }); },
      () => { const e = R.int(2, 9), q = R.int(3, 12), c = R.int(5, e * q - 1), d = e * q - c, a = R.int(20, 99), b = R.int(2, 9); return mk({ text: `Tính giá trị biểu thức:<div class="seq">${a} × ${b} − (${c} + ${d}) : ${e}</div>`, answer: a * b - q, solution: `${a} × ${b} = ${a * b}; (${c} + ${d}) : ${e} = ${e * q} : ${e} = ${q}; ${a * b} − ${q} = <b>${a * b - q}</b>.` }); },
    ]);
    return t();
  }

  function arithFindX(R, lv) {
    const A = R.int(2, 9);
    if (lv === 1) {
      const x = R.int(2, 9), t = R.int(0, 3);
      if (t === 0) return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${box} × ${A} = ${x * A}</div>`, answer: x, solution: `Thừa số chưa biết = tích : thừa số đã biết: ${x * A} : ${A} = <b>${x}</b>.` });
      if (t === 1) return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${box} : ${A} = ${x}</div>`, answer: x * A, solution: `Số bị chia = thương × số chia: ${x} × ${A} = <b>${x * A}</b>.` });
      if (t === 2) return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${A} × ${box} = ${x * A}</div>`, answer: x, solution: `${box} = ${x * A} : ${A} = <b>${x}</b>.` });
      return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${x * A} : ${box} = ${A}</div>`, answer: x, solution: `Số chia = số bị chia : thương: ${x * A} : ${A} = <b>${x}</b>.` });
    }
    if (lv === 2) {
      const t = R.int(0, 3);
      if (t === 0) { const x = R.int(100, 999); return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${box} × ${A} = ${fmt(x * A)}</div>`, answer: x, solution: `${box} = ${fmt(x * A)} : ${A} = <b>${x}</b>.` }); }
      if (t === 1) { const b = R.int(100, 999); return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${box} : ${A} = ${b}</div>`, answer: b * A, solution: `Số bị chia = thương × số chia: ${b} × ${A} = <b>${fmt(b * A)}</b>.` }); }
      if (t === 2) { const x = R.int(10, 99), c = R.int(10, 99); return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${box} × ${A} + ${c} = ${x * A + c}</div>`, answer: x, solution: `${box} × ${A} = ${x * A + c} − ${c} = ${x * A}. Vậy ${box} = ${x * A} : ${A} = <b>${x}</b>.` }); }
      const d = R.int(5, 60), c = R.int(5, 40); return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${box} : ${A} − ${c} = ${d}</div>`, answer: (d + c) * A, solution: `${box} : ${A} = ${d} + ${c} = ${d + c}. Vậy ${box} = ${d + c} × ${A} = <b>${(d + c) * A}</b>.` });
    }
    const t = R.int(0, 4);
    if (t === 0) { const q = R.int(5, 50), a = R.int(5, 99); return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">(${box} − ${a}) × ${A} = ${q * A}</div>`, answer: q + a, solution: `${box} − ${a} = ${q * A} : ${A} = ${q}. Vậy ${box} = ${q} + ${a} = <b>${q + a}</b>.` }); }
    if (t === 1) { const c = R.int(10, 60), a = R.int(2, Math.min(99, c * A - 1)); return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">(${box} + ${a}) : ${A} = ${c}</div>`, answer: c * A - a, solution: `${box} + ${a} = ${c} × ${A} = ${c * A}. Vậy ${box} = ${c * A} − ${a} = <b>${c * A - a}</b>.` }); }
    if (t === 2) { const b = R.int(10, 120), r = R.int(1, A - 1); return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${box} : ${A} = ${b} (dư ${r})</div>`, answer: A * b + r, solution: `Số bị chia = thương × số chia + số dư: ${b} × ${A} + ${r} = <b>${A * b + r}</b>.` }); }
    if (t === 3) { const x = R.int(10, 150), b = R.int(10, 99); return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${A} × ${box} − ${b} = ${fmt(A * x - b)}</div>`, answer: x, solution: `${A} × ${box} = ${fmt(A * x - b)} + ${b} = ${fmt(A * x)}. Vậy ${box} = ${fmt(A * x)} : ${A} = <b>${x}</b>.` }); }
    for (;;) {
      const x = R.int(4, 40), b = R.int(2, 9), p = x * A;
      if (p % b || b === A || p / b < 2) continue;
      return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${box} × ${A} = ${b} × ${p / b}</div>`, answer: x, solution: `Vế phải: ${b} × ${p / b} = ${p}. Vậy ${box} = ${p} : ${A} = <b>${x}</b>.` });
    }
  }

  function arithRemainder(R, lv) {
    const d = R.int(3, 9);
    if (lv === 1) {
      const q = R.int(3, Math.floor(98 / d) - 1), r = R.int(1, d - 1), n = d * q + r, askR = R.chance(0.6);
      return mk({ text: `Thực hiện phép chia:<div class="seq">${n} : ${d}</div>${askR ? 'Số dư là bao nhiêu?' : 'Thương là bao nhiêu?'}`, answer: askR ? r : q, solution: `${n} : ${d} = ${q} (dư ${r}), vì ${q} × ${d} = ${d * q} và ${n} − ${d * q} = ${r} (số dư ${r} bé hơn số chia ${d}). Đáp số <b>${askR ? r : q}</b>.` });
    }
    if (lv === 2) {
      const t = R.pick([
        () => mk({ text: `Trong một phép chia có số chia là ${d}, số dư lớn nhất có thể là bao nhiêu?`, answer: d - 1, solution: `Số dư luôn bé hơn số chia, nên số dư lớn nhất là ${d} − 1 = <b>${d - 1}</b>.` }),
        () => { const q = R.int(12, 99), r = R.int(1, d - 1); return mk({ text: `Một phép chia có số chia là ${d}, thương là ${q} và số dư là ${r}. Tìm số bị chia.`, answer: d * q + r, solution: `Số bị chia = thương × số chia + số dư: ${q} × ${d} + ${r} = <b>${d * q + r}</b>.` }); },
        () => { const q = R.int(12, 99); return mk({ text: `Một phép chia có số chia là ${d}, thương là ${q} và số dư là số dư lớn nhất có thể. Tìm số bị chia.`, answer: d * q + d - 1, solution: `Số dư lớn nhất là ${d - 1}. Số bị chia: ${q} × ${d} + ${d - 1} = <b>${d * q + d - 1}</b>.` }); },
        () => { const k = R.int(4, 9), q = R.int(4, 12), r = R.int(1, k - 1), n = k * q + r; return mk({ text: `Có ${n} bạn đi tham quan, mỗi xe chở được ${k} bạn. Hỏi cần ít nhất bao nhiêu xe để chở hết các bạn?`, answer: q + 1, solution: `${n} : ${k} = ${q} (dư ${r}). ${q} xe chở được ${q * k} bạn, còn ${r} bạn cần thêm 1 xe nữa. Cần ít nhất ${q} + 1 = <b>${q + 1}</b> xe.` }); },
        () => { const k = R.int(4, 9), q = R.int(4, 12), r = R.int(1, k - 1), n = k * q + r; return mk({ text: `Có ${n} m vải, may mỗi bộ quần áo hết ${k} m. Hỏi may được nhiều nhất bao nhiêu bộ quần áo?`, answer: q, solution: `${n} : ${k} = ${q} (dư ${r}). May được nhiều nhất <b>${q}</b> bộ, còn thừa ${r} m vải.` }); },
      ]);
      return t();
    }
    const t = R.pick([
      () => { const r = R.int(1, d - 1), m = R.int(2, 15), q = R.int(5, 20), ex = d * q + r; return mk({ text: `Một số chia cho ${d} dư ${r}. Nếu thêm ${m} vào số đó rồi chia cho ${d} thì được số dư là bao nhiêu?`, answer: (r + m) % d, solution: `Số đó gồm một số phần đủ ${d} và còn dư ${r}. Thêm ${m} thì phần dư thành ${r} + ${m} = ${r + m}, mà ${r + m} chia ${d} dư ${(r + m) % d}. Ví dụ: ${ex} : ${d} dư ${r}, ${ex + m} : ${d} dư ${(r + m) % d}. Đáp số <b>${(r + m) % d}</b>.` }); },
      () => { const r = R.int(1, d - 1), k = R.int(2, 5), q = R.int(5, 20), ex = d * q + r; return mk({ text: `Một số chia cho ${d} dư ${r}. Gấp số đó lên ${k} lần rồi chia cho ${d} thì được số dư là bao nhiêu?`, answer: (r * k) % d, solution: `Gấp lên ${k} lần thì phần dư cũng gấp lên thành ${r} × ${k} = ${r * k}, mà ${r * k} chia ${d} dư ${(r * k) % d}. Ví dụ: ${ex} : ${d} dư ${r}; ${ex * k} : ${d} dư ${(r * k) % d}. Đáp số <b>${(r * k) % d}</b>.` }); },
      () => { const r = R.int(1, d - 1), ans = range(100, 999).find(n => n % d === r); return mk({ text: `Tìm số bé nhất có ba chữ số mà chia cho ${d} thì dư ${r}.`, answer: ans, solution: `100 : ${d} = ${Math.floor(100 / d)} (dư ${100 % d}). Các số chia ${d} dư ${r} từ 100 trở đi: ${ans}, ${ans + d}, ... Số bé nhất là <b>${ans}</b>.` }); },
      () => { const r = R.int(1, d - 1), ans = range(100, 999).reverse().find(n => n % d === r); return mk({ text: `Tìm số lớn nhất có ba chữ số mà chia cho ${d} thì dư ${r}.`, answer: ans, solution: `999 : ${d} = ${Math.floor(999 / d)} (dư ${999 % d}). Số lớn nhất có ba chữ số chia ${d} dư ${r} là <b>${ans}</b> (${ans} = ${Math.floor(ans / d)} × ${d} + ${r}).` }); },
    ]);
    return t();
  }

  function arithTimes(R, lv) {
    const [A, B] = R.sample(NAMES, 2);
    if (lv === 1) {
      const k = R.int(2, 9), t = R.int(0, 3);
      if (t === 0) { const a = R.int(5, 40); return mk({ text: `Gấp số ${a} lên ${k} lần thì được số nào?`, answer: a * k, solution: `Gấp lên ${k} lần thì nhân với ${k}: ${a} × ${k} = <b>${a * k}</b>.` }); }
      if (t === 1) { const q = R.int(3, 30); return mk({ text: `Giảm số ${q * k} đi ${k} lần thì được số nào?`, answer: q, solution: `Giảm đi ${k} lần thì chia cho ${k}: ${q * k} : ${k} = <b>${q}</b>.` }); }
      if (t === 2) { const q = R.int(2, 15); return mk({ text: `1/${k} của ${q * k} là bao nhiêu?`, answer: q, solution: `Muốn tìm 1/${k} của một số, ta chia số đó cho ${k}: ${q * k} : ${k} = <b>${q}</b>.` }); }
      const b = R.int(3, 12); return mk({ text: `Số lớn là ${b * k}, số bé là ${b}. Hỏi số lớn gấp mấy lần số bé?`, answer: k, solution: `Lấy số lớn chia cho số bé: ${b * k} : ${b} = <b>${k}</b> lần.` });
    }
    if (lv === 2) {
      const k = R.int(2, 6);
      const t = R.pick([
        () => { const a = R.int(6, 30); return mk({ text: `${A} có ${a} viên bi. Số bi của ${B} gấp ${k} lần số bi của ${A}. Hỏi cả hai bạn có bao nhiêu viên bi?`, answer: a * (k + 1), solution: `${B} có ${a} × ${k} = ${a * k} viên. Cả hai có ${a} + ${a * k} = <b>${a * (k + 1)}</b> viên.` }); },
        () => { const q = R.int(5, 20), n = q * k; return mk({ text: `Mẹ hái được ${n} quả cam. Mẹ biếu bà 1/${k} số cam. Hỏi mẹ còn lại bao nhiêu quả cam?`, answer: n - q, solution: `Mẹ biếu bà ${n} : ${k} = ${q} quả. Mẹ còn ${n} − ${q} = <b>${n - q}</b> quả.` }); },
        () => { const q = R.int(5, 30), n = q * k; return mk({ text: `Thùng thứ nhất có ${n} l nước. Số nước ở thùng thứ hai bằng 1/${k} số nước ở thùng thứ nhất. Hỏi thùng thứ nhất nhiều hơn thùng thứ hai bao nhiêu lít?`, answer: n - q, solution: `Thùng thứ hai có ${n} : ${k} = ${q} l. Thùng thứ nhất nhiều hơn: ${n} − ${q} = <b>${n - q}</b> l.` }); },
        () => { const a = R.int(20, 90); return mk({ text: `Con lợn nặng ${a} kg, con bò nặng gấp ${k} lần con lợn. Hỏi con bò nặng hơn con lợn bao nhiêu ki-lô-gam?`, answer: a * (k - 1), solution: `Con bò nặng ${a} × ${k} = ${a * k} kg. Nặng hơn con lợn: ${a * k} − ${a} = <b>${a * (k - 1)}</b> kg.` }); },
      ]);
      return t();
    }
    const t = R.pick([
      () => { const k = R.int(2, 9), x = R.int(5, 50), c = R.int(2, 30); return mk({ text: `Tìm một số, biết rằng gấp số đó lên ${k} lần rồi bớt đi ${c} thì được ${x * k - c}.`, answer: x, solution: `Làm ngược lại: trước khi bớt ${c} là ${x * k - c} + ${c} = ${x * k}. Trước khi gấp ${k} lần là ${x * k} : ${k} = <b>${x}</b>.` }); },
      () => { const k = R.int(2, 9), q = R.int(4, 30), c = R.int(2, 40); return mk({ text: `Tìm một số, biết rằng giảm số đó đi ${k} lần rồi cộng thêm ${c} thì được ${q + c}.`, answer: q * k, solution: `Làm ngược lại: trước khi cộng ${c} là ${q + c} − ${c} = ${q}. Trước khi giảm ${k} lần là ${q} × ${k} = <b>${q * k}</b>.` }); },
      () => { let a, b, tot; do { a = R.int(2, 6); b = R.int(2, 9); tot = lcm(a, b) * R.int(1, 4); } while (a === b || tot > 200 || tot / a < 2); return mk({ text: `1/${a} số bi của ${A} là ${tot / a} viên. Hỏi 1/${b} số bi của ${A} là bao nhiêu viên?`, answer: tot / b, solution: `Số bi của ${A}: ${tot / a} × ${a} = ${tot} viên. 1/${b} số bi là ${tot} : ${b} = <b>${tot / b}</b> viên.` }); },
      () => { let a, k; do { a = R.int(4, 20); k = R.int(2, 5); } while ((a * (k - 1)) % 2); return mk({ text: `${A} có ${a} quyển truyện. Số truyện của ${B} gấp ${k} lần số truyện của ${A}. Hỏi ${B} phải cho ${A} bao nhiêu quyển để số truyện của hai bạn bằng nhau?`, answer: a * (k - 1) / 2, solution: `${B} có ${a} × ${k} = ${a * k} quyển, nhiều hơn ${A} ${a * k} − ${a} = ${a * (k - 1)} quyển. Muốn bằng nhau, ${B} cho ${A} một nửa số chênh lệch: ${a * (k - 1)} : 2 = <b>${a * (k - 1) / 2}</b> quyển.` }); },
    ]);
    return t();
  }

  function arithQuick(R, lv) {
    if (lv === 1) {
      const t = R.pick([
        () => { const a = R.int(11, 99); return mk({ text: `Tính nhanh:<div class="seq">${a} × 2 × 5</div>`, answer: a * 10, solution: `${a} × (2 × 5) = ${a} × 10 = <b>${a * 10}</b>.` }); },
        () => { const a = R.int(11, 99); return mk({ text: `Tính nhanh:<div class="seq">5 × ${a} × 2</div>`, answer: a * 10, solution: `Đổi chỗ: ${a} × (5 × 2) = ${a} × 10 = <b>${a * 10}</b>.` }); },
        () => { const a = R.int(12, 99), k = R.int(4, 6); return mk({ text: `Tính nhanh:<div class="seq">${Array(k).fill(a).join(' + ')}</div>`, answer: a * k, solution: `${a} được lấy ${k} lần: ${a} × ${k} = <b>${a * k}</b>.` }); },
        () => { const a = R.int(2, 9); return mk({ text: `Tính nhanh:<div class="seq">25 × ${a} × 4</div>`, answer: a * 100, solution: `(25 × 4) × ${a} = 100 × ${a} = <b>${a * 100}</b>.` }); },
      ]);
      return t();
    }
    if (lv === 2) {
      const t = R.pick([
        () => { const a = R.int(12, 99), b = R.int(1, 9); return mk({ text: `Tính nhanh:<div class="seq">${a} × ${b} + ${a} × ${10 - b}</div>`, answer: a * 10, solution: `${a} × (${b} + ${10 - b}) = ${a} × 10 = <b>${a * 10}</b>.` }); },
        () => { const a = R.int(12, 99); return mk({ text: `Tính nhanh:<div class="seq">${a} × 9 + ${a}</div>`, answer: a * 10, solution: `${a} × 9 + ${a} × 1 = ${a} × (9 + 1) = ${a} × 10 = <b>${a * 10}</b>.` }); },
        () => { const a = R.int(12, 99), b = R.int(11, 19); return mk({ text: `Tính nhanh:<div class="seq">${a} × ${b} − ${a} × ${b - 10}</div>`, answer: a * 10, solution: `${a} × (${b} − ${b - 10}) = ${a} × 10 = <b>${a * 10}</b>.` }); },
        () => { const a = R.int(2, 9), b = R.int(2, 9); return mk({ text: `Tính nhanh:<div class="seq">${a} × 5 × ${b} × 2</div>`, answer: a * b * 10, solution: `(${a} × ${b}) × (5 × 2) = ${a * b} × 10 = <b>${a * b * 10}</b>.` }); },
      ]);
      return t();
    }
    const t = R.pick([
      () => {
        const a = R.int(1, 15), d = R.int(2, 5), n = 2 * R.int(3, 5), nums = range(0, n - 1).map(i => a + d * i), s = sum(nums);
        return mk({ text: `Tính nhanh:<div class="seq">${nums.join(' + ')}</div>`, answer: s, solution: `Ghép số đầu với số cuối: ${range(0, n / 2 - 1).map(i => `(${nums[i]} + ${nums[n - 1 - i]})`).join(' + ')}. Mỗi cặp bằng ${nums[0] + nums[n - 1]}, có ${n / 2} cặp: ${nums[0] + nums[n - 1]} × ${n / 2} = <b>${s}</b>.` });
      },
      () => { const a = R.int(12, 99), b = R.int(1, 7), c = R.int(1, 9 - b - 1 < 1 ? 1 : 9 - b - 1), d = 10 - b - c; return mk({ text: `Tính nhanh:<div class="seq">${a} × ${b} + ${a} × ${c} + ${a} × ${d}</div>`, answer: a * 10, solution: `${a} × (${b} + ${c} + ${d}) = ${a} × 10 = <b>${a * 10}</b>.` }); },
      () => { const a = R.int(2, 9); return mk({ text: `Tính nhanh:<div class="seq">125 × ${a} × 8</div>`, answer: a * 1000, solution: `(125 × 8) × ${a} = 1.000 × ${a} = <b>${fmt(a * 1000)}</b>.` }); },
      () => { const a = R.int(12, 99); return mk({ text: `Tính nhanh:<div class="seq">${a} × 99 + ${a}</div>`, answer: a * 100, solution: `${a} × 99 + ${a} × 1 = ${a} × (99 + 1) = ${a} × 100 = <b>${a * 100}</b>.` }); },
      () => { const p = R.int(12, 99), q = R.int(2, 9), r = R.int(10, 99), a = R.int(12, 99); return mk({ text: `Tính nhanh:<div class="seq">(${p} × ${q} + ${r}) × (${a} × 3 − ${a} × 2 − ${a})</div>`, answer: 0, solution: `Ngoặc thứ hai: ${a} × 3 − ${a} × 2 − ${a} = ${a} × (3 − 2 − 1) = ${a} × 0 = 0. Số nào nhân với 0 cũng bằng 0, nên kết quả là <b>0</b>.` }); },
    ]);
    return t();
  }

  function arithWord(R, lv) {
    const [A, B] = R.sample(NAMES, 2);
    if (lv === 1) {
      const t = R.pick([
        () => { const [c, it] = R.pick([['hộp', 'cái bút'], ['túi', 'cái kẹo'], ['bó', 'bông hoa'], ['đĩa', 'quả cam'], ['hàng', 'cây']]), a = R.int(4, 9), b = R.int(3, 9); return mk({ text: `Mỗi ${c} có ${a} ${it}. Hỏi ${b} ${c} như thế có bao nhiêu ${it}?`, answer: a * b, solution: `${a} × ${b} = <b>${a * b}</b> ${it}.` }); },
        () => { const k = R.int(3, 9), q = R.int(3, 9); return mk({ text: `Có ${k * q} quả táo chia đều vào ${k} đĩa. Hỏi mỗi đĩa có bao nhiêu quả táo?`, answer: q, solution: `${k * q} : ${k} = <b>${q}</b> quả.` }); },
        () => { const k = R.int(3, 9), q = R.int(3, 9); return mk({ text: `Có ${k * q} l dầu rót đều vào các can, mỗi can ${k} l. Hỏi được bao nhiêu can dầu?`, answer: q, solution: `${k * q} : ${k} = <b>${q}</b> can.` }); },
      ]);
      return t();
    }
    if (lv === 2) {
      const t = R.pick([
        () => { const a = R.int(12, 36), b = R.int(3, 8), c = R.int(10, a * b - 10); return mk({ text: `Cửa hàng có ${b} hộp bánh, mỗi hộp ${a} cái. Cửa hàng đã bán ${c} cái bánh. Hỏi cửa hàng còn lại bao nhiêu cái bánh?`, answer: a * b - c, solution: `Số bánh lúc đầu: ${a} × ${b} = ${a * b} cái. Còn lại: ${a * b} − ${c} = <b>${a * b - c}</b> cái.` }); },
        () => { const k = R.int(3, 6), q = R.int(100, 1500), n = k * q; return mk({ text: `Một cửa hàng có ${fmt(n)} kg gạo, đã bán 1/${k} số gạo. Hỏi cửa hàng còn lại bao nhiêu ki-lô-gam gạo?`, answer: n - q, solution: `Đã bán: ${fmt(n)} : ${k} = ${fmt(q)} kg. Còn lại: ${fmt(n)} − ${fmt(q)} = <b>${fmt(n - q)}</b> kg.` }); },
        () => { const a = R.int(120, 900), k = R.int(2, 5); return mk({ text: `Quãng đường từ A đến B dài ${a} m. Quãng đường từ B đến C dài gấp ${k} lần quãng đường từ A đến B. Hỏi quãng đường từ A qua B đến C dài bao nhiêu mét?`, answer: a * (k + 1), solution: `Quãng đường BC: ${a} × ${k} = ${fmt(a * k)} m. Quãng đường A → B → C: ${a} + ${fmt(a * k)} = <b>${fmt(a * (k + 1))}</b> m.` }); },
        () => { const k = R.int(3, 5), x = k * R.int(6, 10), y = k * R.int(6, 10); return mk({ text: `Lớp 3A có ${x} bạn, lớp 3B có ${y} bạn. Cả hai lớp xếp hàng, mỗi hàng ${k} bạn. Hỏi xếp được tất cả bao nhiêu hàng?`, answer: (x + y) / k, solution: `Cả hai lớp có ${x} + ${y} = ${x + y} bạn. Số hàng: ${x + y} : ${k} = <b>${(x + y) / k}</b> hàng.` }); },
      ]);
      return t();
    }
    const t = R.pick([
      () => { let a, b, c; do { a = 50 * R.int(4, 40); b = R.int(2, 6); c = R.int(3, 8); } while ((a * b) % c || b === c); return mk({ text: `Có ${b} thùng sách, mỗi thùng ${fmt(a)} quyển. Số sách đó được chia đều cho ${c} thư viện. Hỏi mỗi thư viện nhận được bao nhiêu quyển sách?`, answer: a * b / c, solution: `Tổng số sách: ${fmt(a)} × ${b} = ${fmt(a * b)} quyển. Mỗi thư viện: ${fmt(a * b)} : ${c} = <b>${fmt(a * b / c)}</b> quyển.` }); },
      () => { const a = R.int(50, 300), c = R.int(2, 8), b = c + R.int(2, 9), tm = R.int(5, 20); return mk({ text: `Một bể đang có ${a} l nước. Người ta mở một vòi chảy vào bể, mỗi phút ${b} l, đồng thời mở một vòi khác chảy ra, mỗi phút ${c} l. Hỏi sau ${tm} phút bể có bao nhiêu lít nước?`, answer: a + tm * (b - c), solution: `Mỗi phút nước trong bể tăng ${b} − ${c} = ${b - c} l. Sau ${tm} phút tăng ${b - c} × ${tm} = ${(b - c) * tm} l. Bể có: ${a} + ${(b - c) * tm} = <b>${a + tm * (b - c)}</b> l.` }); },
      () => { const k = R.int(3, 6), q = 10 * R.int(10, 150), n = k * q, m = 10 * R.int(5, Math.floor((n - q) / 20)); return mk({ text: `Một kho có ${fmt(n)} kg gạo. Lần thứ nhất người ta lấy ra 1/${k} số gạo, lần thứ hai lấy ra ${fmt(m)} kg. Hỏi kho còn lại bao nhiêu ki-lô-gam gạo?`, answer: n - q - m, solution: `Lần thứ nhất lấy: ${fmt(n)} : ${k} = ${fmt(q)} kg. Hai lần lấy: ${fmt(q)} + ${fmt(m)} = ${fmt(q + m)} kg. Còn lại: ${fmt(n)} − ${fmt(q + m)} = <b>${fmt(n - q - m)}</b> kg.` }); },
      () => { const a = R.int(20, 90), k = R.int(2, 4), b = R.int(5, 30); return mk({ text: `Một đội trồng cây: ngày thứ nhất trồng được ${a} cây, ngày thứ hai trồng gấp ${k} lần ngày thứ nhất, ngày thứ ba trồng ít hơn ngày thứ hai ${b} cây. Hỏi cả ba ngày đội trồng được bao nhiêu cây?`, answer: a + 2 * a * k - b, solution: `Ngày thứ hai: ${a} × ${k} = ${a * k} cây. Ngày thứ ba: ${a * k} − ${b} = ${a * k - b} cây. Cả ba ngày: ${a} + ${a * k} + ${a * k - b} = <b>${a + 2 * a * k - b}</b> cây.` }); },
    ]);
    return t();
  }

  function arithUnit(R, lv) {
    if (lv === 1) {
      const u = R.int(2, 9), k = R.int(2, 5); let m = R.int(2, 9); if (m === k) m++;
      const [c, it, un] = R.pick([['can', 'dầu', 'l'], ['bao', 'gạo', 'kg'], ['hộp', 'bánh', 'cái'], ['túi', 'kẹo', 'cái']]);
      return mk({ text: `${k} ${c} ${it} như nhau có tất cả ${k * u} ${un}. Hỏi ${m} ${c} như thế có bao nhiêu ${un}?`, answer: m * u, solution: `Mỗi ${c}: ${k * u} : ${k} = ${u} ${un}. ${m} ${c}: ${u} × ${m} = <b>${m * u}</b> ${un}.` });
    }
    if (lv === 2) {
      const u = R.int(12, 250), k = R.int(3, 8); let m = R.int(2, 9); if (m === k) m++;
      if (R.chance(0.5)) return mk({ text: `${k} thùng như nhau có ${fmt(k * u)} quyển vở. Hỏi ${m} thùng như thế có bao nhiêu quyển vở?`, answer: m * u, solution: `Mỗi thùng: ${fmt(k * u)} : ${k} = ${u} quyển. ${m} thùng: ${u} × ${m} = <b>${fmt(m * u)}</b> quyển.` });
      return mk({ text: `${k} bao gạo như nhau nặng ${fmt(k * u)} kg. Hỏi có ${fmt(m * u)} kg gạo thì đựng được trong mấy bao như thế?`, answer: m, solution: `Mỗi bao: ${fmt(k * u)} : ${k} = ${u} kg. Số bao: ${fmt(m * u)} : ${u} = <b>${m}</b> bao.` });
    }
    const t = R.pick([
      () => { const u = 50 * R.int(4, 20), k = R.int(3, 9), m = R.int(2, 5); return mk({ text: `${k} xe tải như nhau chở được ${fmt(k * u)} kg hàng. Nếu thêm ${m} xe như thế thì chở được tất cả bao nhiêu ki-lô-gam hàng?`, answer: (k + m) * u, solution: `Mỗi xe chở: ${fmt(k * u)} : ${k} = ${fmt(u)} kg. Có ${k} + ${m} = ${k + m} xe, chở được: ${fmt(u)} × ${k + m} = <b>${fmt((k + m) * u)}</b> kg.` }); },
      () => { const u = 500 * R.int(6, 18), k = R.int(2, 5); let m = R.int(3, 9); if (m === k) m++; return mk({ text: `Mua ${k} quyển vở như nhau hết ${fmt(k * u)} đồng. Hỏi mua ${m} quyển vở như thế hết bao nhiêu tiền? (tính bằng đồng)`, answer: m * u, solution: `Giá 1 quyển: ${fmt(k * u)} : ${k} = ${fmt(u)} đồng. ${m} quyển: ${fmt(u)} × ${m} = <b>${fmt(m * u)}</b> đồng.` }); },
      () => { const u = R.int(15, 60), k = R.int(3, 6), M = u * (k + R.int(2, 6)); return mk({ text: `${k} thùng như nhau có ${k * u} chai nước. Muốn có ${M} chai thì cần thêm bao nhiêu thùng như thế nữa?`, answer: M / u - k, solution: `Mỗi thùng: ${k * u} : ${k} = ${u} chai. ${M} chai cần ${M} : ${u} = ${M / u} thùng. Cần thêm: ${M / u} − ${k} = <b>${M / u - k}</b> thùng.` }); },
      () => { const u = R.int(3, 5), k = R.int(2, 4); let m = R.int(3, 8); if (m === k) m++; return mk({ text: `Một người đi bộ trong ${k} giờ được ${k * u} km. Hỏi với cùng tốc độ, trong ${m} giờ người đó đi được bao nhiêu ki-lô-mét?`, answer: m * u, solution: `Mỗi giờ đi được ${k * u} : ${k} = ${u} km. ${m} giờ: ${u} × ${m} = <b>${m * u}</b> km.` }); },
    ]);
    return t();
  }

  function arithMoney(R, lv) {
    if (lv === 0) {
      const [p, q] = R.pick([[1000, 2000], [2000, 5000], [1000, 5000], [5000, 10000], [2000, 10000]]), a = R.int(1, 3), b = R.int(1, 3);
      return mk({ text: `Em có ${a} tờ ${fmt(p)} đồng và ${b} tờ ${fmt(q)} đồng:<div class="seq emoji">${'💵'.repeat(a + b)}</div>Hỏi em có tất cả bao nhiêu tiền? (tính bằng đồng)`, answer: a * p + b * q, solution: `${a} tờ ${fmt(p)} đồng là ${fmt(a * p)} đồng; ${b} tờ ${fmt(q)} đồng là ${fmt(b * q)} đồng. Tất cả: ${fmt(a * p)} + ${fmt(b * q)} = <b>${fmt(a * p + b * q)}</b> đồng.` });
    }
    const A = R.pick(NAMES);
    if (lv === 1) {
      const t = R.pick([
        () => { const p = 500 * R.int(4, 18), n = R.int(2, 5); return mk({ text: `Một quyển vở giá ${fmt(p)} đồng. Hỏi mua ${n} quyển vở như thế hết bao nhiêu tiền? (tính bằng đồng)`, answer: n * p, solution: `${fmt(p)} × ${n} = <b>${fmt(n * p)}</b> đồng.` }); },
        () => { const T0 = R.pick([20000, 50000]), c = 1000 * R.int(5, T0 / 1000 - 2); return mk({ text: `Mẹ có tờ ${fmt(T0)} đồng. Mẹ mua rau hết ${fmt(c)} đồng. Hỏi người bán phải trả lại mẹ bao nhiêu tiền? (tính bằng đồng)`, answer: T0 - c, solution: `${fmt(T0)} − ${fmt(c)} = <b>${fmt(T0 - c)}</b> đồng.` }); },
        () => { const a = R.int(1, 4), b = R.int(1, 4), c = R.int(1, 3); return mk({ text: `${A} có ${a} tờ 10.000 đồng, ${b} tờ 5.000 đồng và ${c} tờ 2.000 đồng. Hỏi ${A} có tất cả bao nhiêu tiền? (tính bằng đồng)`, answer: a * 10000 + b * 5000 + c * 2000, solution: `${fmt(a * 10000)} + ${fmt(b * 5000)} + ${fmt(c * 2000)} = <b>${fmt(a * 10000 + b * 5000 + c * 2000)}</b> đồng.` }); },
      ]);
      return t();
    }
    if (lv === 2) {
      const t = R.pick([
        () => { let n, p, q, T0; do { n = R.int(2, 5); p = 500 * R.int(8, 16); q = 1000 * R.int(3, 9); T0 = R.pick([50000, 100000]); } while (n * p + q >= T0); return mk({ text: `${A} mua ${n} quyển vở, mỗi quyển giá ${fmt(p)} đồng và một cái bút giá ${fmt(q)} đồng. ${A} đưa cô bán hàng tờ ${fmt(T0)} đồng. Hỏi cô bán hàng phải trả lại bao nhiêu tiền? (tính bằng đồng)`, answer: T0 - n * p - q, solution: `Tiền vở: ${fmt(p)} × ${n} = ${fmt(n * p)} đồng. Tiền vở và bút: ${fmt(n * p)} + ${fmt(q)} = ${fmt(n * p + q)} đồng. Trả lại: ${fmt(T0)} − ${fmt(n * p + q)} = <b>${fmt(T0 - n * p - q)}</b> đồng.` }); },
        () => { let p, T0; do { p = 1000 * R.int(3, 9); T0 = 10000 * R.int(2, 5); } while (T0 % p === 0); const q = Math.floor(T0 / p); return mk({ text: `${A} có ${fmt(T0)} đồng. Mỗi cái bút giá ${fmt(p)} đồng. Hỏi ${A} mua được nhiều nhất bao nhiêu cái bút?`, answer: q, solution: `${fmt(T0)} : ${fmt(p)} = ${q} (dư ${fmt(T0 - q * p)}). ${A} mua được nhiều nhất <b>${q}</b> cái bút và còn thừa ${fmt(T0 - q * p)} đồng.` }); },
        () => { const p = 1000 * R.int(2, 6), n = R.int(3, 6), q = 1000 * R.int(5, 15); return mk({ text: `Một cái bánh giá ${fmt(p)} đồng, một hộp sữa giá ${fmt(q)} đồng. Hỏi mua ${n} cái bánh và 2 hộp sữa hết bao nhiêu tiền? (tính bằng đồng)`, answer: n * p + 2 * q, solution: `${fmt(p)} × ${n} + ${fmt(q)} × 2 = ${fmt(n * p)} + ${fmt(2 * q)} = <b>${fmt(n * p + 2 * q)}</b> đồng.` }); },
      ]);
      return t();
    }
    const B = R.pick(NAMES.filter(x => x !== A));
    const t = R.pick([
      () => { const b = 1000 * R.int(5, 30), d = 1000 * R.int(2, 15), askA = R.chance(0.5); return mk({ text: `${A} và ${B} có tất cả ${fmt(2 * b + d)} đồng. ${A} có nhiều hơn ${B} ${fmt(d)} đồng. Hỏi ${askA ? A : B} có bao nhiêu tiền? (tính bằng đồng)`, answer: askA ? b + d : b, solution: `Hai lần số tiền của ${B}: ${fmt(2 * b + d)} − ${fmt(d)} = ${fmt(2 * b)} đồng. ${B} có ${fmt(2 * b)} : 2 = ${fmt(b)} đồng.${askA ? ` ${A} có ${fmt(b)} + ${fmt(d)} = <b>${fmt(b + d)}</b> đồng.` : ` Đáp số <b>${fmt(b)}</b> đồng.`}` }); },
      () => { const n = R.int(5, 10), x = R.int(1, n - 1), T0 = 5000 * x + 2000 * (n - x); return mk({ text: `${A} có ${n} tờ tiền gồm hai loại 2.000 đồng và 5.000 đồng, tổng cộng ${fmt(T0)} đồng. Hỏi ${A} có bao nhiêu tờ 5.000 đồng?`, answer: x, solution: `Giả sử cả ${n} tờ đều là tờ 2.000 đồng thì có ${fmt(2000 * n)} đồng, ít hơn thực tế ${fmt(T0)} − ${fmt(2000 * n)} = ${fmt(T0 - 2000 * n)} đồng. Mỗi tờ 5.000 đồng hơn tờ 2.000 đồng 3.000 đồng. Số tờ 5.000 đồng: ${fmt(T0 - 2000 * n)} : 3.000 = <b>${x}</b> tờ.` }); },
      () => { const v = 1000 * R.int(4, 9), p = 1000 * R.int(2, 6), a = 2 * p + 3 * v; return mk({ text: `Mua 2 cái bút và 3 quyển vở hết ${fmt(a)} đồng. Mua 2 cái bút và 5 quyển vở như thế hết ${fmt(a + 2 * v)} đồng. Hỏi một quyển vở giá bao nhiêu tiền? (tính bằng đồng)`, answer: v, solution: `Lần sau mua nhiều hơn lần trước 2 quyển vở và trả nhiều hơn ${fmt(a + 2 * v)} − ${fmt(a)} = ${fmt(2 * v)} đồng. Một quyển vở: ${fmt(2 * v)} : 2 = <b>${fmt(v)}</b> đồng.` }); },
    ]);
    return t();
  }

  // =====================================================================
  // LÝ THUYẾT SỐ
  // =====================================================================
  const PLACE = ['đơn vị', 'chục', 'trăm', 'nghìn', 'chục nghìn'];
  const partsText = n => digitsOf(n).map((d, i, a) => [d, PLACE[a.length - 1 - i]]).filter(p => p[0]).map(p => `${p[0]} ${p[1]}`).join(', ');

  function ntPlace(R, lv) {
    if (lv === 0) {
      const n = R.int(101, 999), [h, t, u] = digitsOf(n), k = R.int(0, 2);
      if (k === 0) return mk({ text: `Số gồm ${h} trăm, ${t} chục và ${u} đơn vị là số nào?`, answer: n, solution: `${h} trăm là ${h * 100}, ${t} chục là ${t * 10}: ${h * 100} + ${t * 10} + ${u} = <b>${n}</b>.` });
      if (k === 1) { const ask = R.int(0, 2), nm = ['trăm', 'chục', 'đơn vị'][ask]; return mk({ text: `Chữ số hàng ${nm} của số ${n} là chữ số nào?`, answer: [h, t, u][ask], solution: `${n} gồm ${h} trăm, ${t} chục và ${u} đơn vị. Chữ số hàng ${nm} là <b>${[h, t, u][ask]}</b>.` }); }
      return mk({ text: `Viết số thích hợp vào ô trống:<div class="seq">${h * 100} + ${t * 10} + ${u} = ${box}</div>`, answer: n, solution: `${h} trăm, ${t} chục, ${u} đơn vị là số <b>${n}</b>.` });
    }
    if (lv === 1) {
      const n = R.int(1000, 9999), k = R.int(0, 2);
      if (k === 0) { const m = R.chance(0.5) ? n - (Math.floor(n / 10) % 10) * 10 : n; return mk({ text: `Số gồm ${partsText(m)} là số nào?`, answer: m, solution: `Viết lần lượt các chữ số hàng nghìn, trăm, chục, đơn vị (hàng nào không có thì viết 0): <b>${fmt(m)}</b>.` }); }
      if (k === 1) { const ds = digitsOf(n); return mk({ text: `Viết số thích hợp vào ô trống:<div class="seq">${ds.map((d, i) => d * 10 ** (3 - i)).filter(v => v).map(fmt).join(' + ')} = ${box}</div>`, answer: n, solution: `Số gồm ${partsText(n)}: <b>${fmt(n)}</b>.` }); }
      const ds = digitsOf(n), cand = range(0, 3).filter(i => ds[i] && ds.filter(x => x === ds[i]).length === 1);
      if (!cand.length) return ntPlace(R, lv);
      const i = R.pick(cand), v = ds[i] * 10 ** (3 - i);
      return mk({ text: `Trong số ${fmt(n)}, chữ số ${ds[i]} có giá trị là bao nhiêu?`, answer: v, solution: `Chữ số ${ds[i]} ở hàng ${PLACE[3 - i]}, nên có giá trị là <b>${fmt(v)}</b>.` });
    }
    if (lv === 2) {
      const k = R.int(0, 2);
      if (k === 0) { const n = R.int(10, 99) * 1000 + R.pick([0, R.int(1, 9) * 100]) + R.pick([0, R.int(1, 9) * 10]) + R.pick([0, R.int(1, 9)]); return mk({ text: `Số gồm ${partsText(n)} là số nào?`, answer: n, solution: `Viết lần lượt các chữ số từ hàng chục nghìn đến hàng đơn vị (hàng nào không có thì viết 0): <b>${fmt(n)}</b>.` }); }
      if (k === 1) { const n = R.int(10000, 99999), ds = digitsOf(n), i = R.int(0, 2); return mk({ text: `Chữ số hàng ${PLACE[4 - i]} của số ${fmt(n)} là chữ số nào?`, answer: ds[i], solution: `${fmt(n)} gồm ${partsText(n)}. Chữ số hàng ${PLACE[4 - i]} là <b>${ds[i]}</b>.` }); }
      const a = R.int(1, 8), b = R.int(10, 19), c = R.int(1, 99), n = a * 1000 + b * 100 + c;
      return mk({ text: `Số gồm ${a} nghìn, ${b} trăm và ${c} đơn vị là số nào?`, answer: n, solution: `${b} trăm = 1 nghìn ${b - 10} trăm. Vậy số đó gồm ${a + 1} nghìn, ${b - 10} trăm và ${c} đơn vị: ${fmt(a * 1000)} + ${fmt(b * 100)} + ${c} = <b>${fmt(n)}</b>.` });
    }
    const t = R.pick([
      () => { const n = R.int(10000, 99999); return mk({ text: `Số ${fmt(n)} có tất cả bao nhiêu trăm?`, answer: Math.floor(n / 100), solution: `Bỏ hai chữ số hàng chục và hàng đơn vị: ${fmt(n)} có <b>${Math.floor(n / 100)}</b> trăm (và ${n % 100} đơn vị lẻ).` }); },
      () => { const n = R.int(100, 999), d = R.int(1, 9); return mk({ text: `Viết thêm chữ số ${d} vào bên trái số ${n} thì được một số mới. Hỏi số mới hơn số cũ bao nhiêu đơn vị?`, answer: d * 1000, solution: `Số mới là ${fmt(d * 1000 + n)} = ${fmt(d * 1000)} + ${n}. Số mới hơn số cũ <b>${fmt(d * 1000)}</b> đơn vị.` }); },
      () => { const n = R.int(1100, 9999), d = Math.floor(n / 1000); if (Math.floor(n / 100) % 10 === 0) return mk({ text: `Số ${fmt(n)} có tất cả bao nhiêu chục?`, answer: Math.floor(n / 10), solution: `Bỏ chữ số hàng đơn vị: ${fmt(n)} có <b>${Math.floor(n / 10)}</b> chục.` }); return mk({ text: `Xóa chữ số hàng nghìn của số ${fmt(n)} thì số đó giảm đi bao nhiêu đơn vị?`, answer: d * 1000, solution: `Xóa chữ số ${d} ở hàng nghìn, còn lại số ${n % 1000}. Số giảm đi ${fmt(n)} − ${n % 1000} = <b>${fmt(d * 1000)}</b>.` }); },
      () => { const d = R.int(0, 8); return mk({ text: `Tìm số lớn nhất có năm chữ số mà chữ số hàng nghìn là ${d}.`, answer: 90999 + d * 1000, solution: `Các hàng khác đều lấy chữ số lớn nhất là 9, hàng nghìn là ${d}: <b>${fmt(90999 + d * 1000)}</b>.` }); },
      () => { const d = R.int(1, 9); return mk({ text: `Tìm số bé nhất có năm chữ số mà chữ số hàng trăm là ${d}.`, answer: 10000 + d * 100, solution: `Hàng chục nghìn bé nhất là 1, các hàng còn lại (trừ hàng trăm) là 0: <b>${fmt(10000 + d * 100)}</b>.` }); },
    ]);
    return t();
  }

  function ntCompare(R, lv) {
    const sign = (a, b) => (a > b ? '>' : a < b ? '<' : '=');
    if (lv === 0 || (lv === 1 && R.chance(0.5))) {
      const big = lv === 0 ? 100 : 1000, a = R.int(big, big * 10 - 1);
      let b = R.chance(0.2) ? a : a + R.pick([-1, 1]) * R.pick([1, 10, 100, big === 1000 ? 1000 : 9, R.int(2, 99)]);
      if (b < big || b >= big * 10) b = a;
      const ans = sign(a, b), da = digitsOf(a), db = digitsOf(b), i = da.findIndex((d, k) => d !== db[k]);
      return mk({
        type: 'choice', choices: ['>', '<', '='],
        text: `Chọn dấu thích hợp điền vào ô trống:<div class="seq">${fmt(a)} ${box} ${fmt(b)}</div>`, answer: ans,
        solution: a === b ? 'Hai số giống hệt nhau nên điền dấu <b>=</b>.' : `Hai số có cùng số chữ số. So sánh từ hàng cao nhất: đến hàng ${PLACE[da.length - 1 - i]} thì ${da[i]} ${T.esc(sign(da[i], db[i]))} ${db[i]}. Vậy ${fmt(a)} <b>${T.esc(ans)}</b> ${fmt(b)}.`,
      });
    }
    if (lv === 1) {
      const base = R.int(1000, 9000), ds = digitsOf(base);
      const nums = [...new Set(range(1, 12).map(() => Number(R.shuffle(ds).join(''))).filter(x => x >= 1000))].slice(0, 4);
      if (nums.length < 3) return ntCompare(R, lv);
      const big = R.chance(0.5), ans = big ? Math.max(...nums) : Math.min(...nums);
      return mk({ type: 'choice', choices: R.shuffle(nums.map(fmt)), text: `Số nào ${big ? 'lớn nhất' : 'bé nhất'} trong các số dưới đây?`, answer: fmt(ans), solution: `Xếp từ bé đến lớn: ${nums.slice().sort((x, y) => x - y).map(fmt).join(' &lt; ')}. Số ${big ? 'lớn nhất' : 'bé nhất'} là <b>${fmt(ans)}</b>.` });
    }
    if (lv === 2) {
      const base = R.int(10, 98) * 1000;
      const nums = [...new Set(range(1, 8).map(() => base + R.int(0, 1999)))].slice(0, 5);
      while (nums.length < 5) nums.push(base + 2000 + nums.length);
      const sorted = nums.slice().sort((x, y) => x - y), k = R.int(2, 4), asc = R.chance(0.5), list = asc ? sorted : sorted.slice().reverse();
      return mk({ text: `Sắp xếp các số ${nums.map(fmt).join('; ')} theo thứ tự từ ${asc ? 'bé đến lớn' : 'lớn đến bé'}. Số đứng thứ ${k} là số nào?`, answer: list[k - 1], solution: `Từ ${asc ? 'bé đến lớn' : 'lớn đến bé'}: ${list.map(fmt).join('; ')}. Số đứng thứ ${k} là <b>${fmt(list[k - 1])}</b>.` });
    }
    for (;;) {
      const M = R.int(1000, 9999), dm = digitsOf(M), p = R.int(1, 3), op = R.pick(['>', '<']);
      const P = dm.slice(); for (let i = p + 1; i < 4; i++) P[i] = R.int(0, 9);
      const ok = range(0, 9).filter(d => { const v = Number(P.map((x, i) => (i === p ? d : x)).join('')); return op === '>' ? v > M : v < M; });
      if (ok.length < 1 || ok.length > 9) continue;
      const shown = fmtD(P.map((x, i) => (i === p ? box : x)));
      return mk({ text: `Có bao nhiêu chữ số có thể điền vào ô trống để được phép so sánh đúng?<div class="seq">${shown} ${T.esc(op)} ${fmt(M)}</div>`, answer: ok.length, solution: `Hai số có cùng các chữ số đứng trước ô trống. Thử từng chữ số từ 0 đến 9 (so sánh chữ số ở ô trống với ${dm[p]}, nếu bằng thì so sánh tiếp các hàng sau): các chữ số đúng là ${ok.join(', ')}. Có <b>${ok.length}</b> chữ số.` });
    }
  }

  function ntNext0(R) {
    const t = R.int(0, 2);
    if (t === 0) { const after = R.chance(0.5), a = R.int(101, 998); return mk({ text: `Số liền ${after ? 'sau' : 'trước'} của số ${a} là số nào?`, answer: after ? a + 1 : a - 1, solution: `Số liền ${after ? 'sau thì thêm 1' : 'trước thì bớt 1'}: ${a} ${after ? '+' : '−'} 1 = <b>${after ? a + 1 : a - 1}</b>.` }); }
    if (t === 1) { const a = R.int(1, 9) * 100 + 99; return mk({ text: `Số liền sau của số ${a} là số nào?`, answer: a + 1, solution: `${a} + 1 = <b>${a + 1}</b>.` }); }
    const a = R.int(11, 98) * 10; return mk({ text: `Điền số tròn chục thích hợp vào ô trống:<div class="seq">${a - 10}, ${a}, ${box}</div>`, answer: a + 10, solution: `Các số tròn chục hơn kém nhau 10: ${a} + 10 = <b>${a + 10}</b>.` });
  }

  function ntEvenOdd0(R) {
    const n = R.int(100, 999);
    if (R.chance(0.5)) { const ans = n % 2 ? 'Số lẻ' : 'Số chẵn'; return mk({ type: 'choice', choices: ['Số chẵn', 'Số lẻ'], text: `Số ${n} là số chẵn hay số lẻ?`, answer: ans, solution: `Chữ số tận cùng là ${n % 10}${n % 2 ? ' (1, 3, 5, 7, 9 là số lẻ)' : ' (0, 2, 4, 6, 8 là số chẵn)'}. Vậy ${n} là <b>${ans.toLowerCase()}</b>.` }); }
    const even = R.chance(0.5), w = even ? 'chẵn' : 'lẻ', ans = (n % 2 === 0) === even ? n + 2 : n + 1;
    return mk({ text: `Số ${w} liền sau của số ${n} là số nào?`, answer: ans, solution: `Các số ${w} hơn kém nhau 2. ${(n % 2 === 0) === even ? `${n} là số ${w} nên số ${w} liền sau là ${n} + 2` : `${n} không phải số ${w}, số liền sau ${n} + 1`} = <b>${ans}</b>.` });
  }

  function ntRoman(R, lv) {
    if (lv === 0) { const n = R.int(1, 12); return mk({ text: `Số La Mã sau có giá trị là bao nhiêu?<div class="seq">${toRoman(n)}</div>`, answer: n, solution: `I = 1, V = 5, X = 10. Chữ đứng sau thì cộng thêm, chữ I đứng trước V hoặc X thì bớt đi 1. ${toRoman(n)} = <b>${n}</b>.` }); }
    if (lv === 1) {
      const n = R.int(4, 20);
      if (R.chance(0.5)) return mk({ text: `Số La Mã sau có giá trị là bao nhiêu?<div class="seq">${toRoman(n)}</div>`, answer: n, solution: `I = 1, V = 5, X = 10. ${toRoman(n)} = <b>${n}</b>.` });
      const pool = [n - 1, n + 1, n - 2, n + 2, n + 5, n - 5].filter(x => x >= 1 && x <= 39).map(toRoman);
      return mk({ type: 'choice', choices: choicesOf(R, toRoman(n), pool), text: `Số ${n} viết bằng chữ số La Mã là:`, answer: toRoman(n), solution: `${n} = ${n >= 10 ? '10 + ' + (n - 10) : n}. Viết bằng chữ số La Mã: <b>${toRoman(n)}</b>.` });
    }
    if (lv === 2) {
      if (R.chance(0.5)) { const a = R.int(4, 20), b = R.int(4, 20), plus = R.chance(0.6) || a === b; const [x, y] = plus ? [a, b] : [Math.max(a, b), Math.min(a, b)]; const v = plus ? x + y : x - y; return mk({ text: `Tính rồi viết kết quả bằng chữ số thường:<div class="seq">${toRoman(x)} ${plus ? '+' : '−'} ${toRoman(y)} = ?</div>`, answer: v, solution: `${toRoman(x)} = ${x}, ${toRoman(y)} = ${y}. ${x} ${plus ? '+' : '−'} ${y} = <b>${v}</b>.` }); }
      const nums = R.sample(range(4, 30), 4), big = R.chance(0.5), ans = big ? Math.max(...nums) : Math.min(...nums);
      return mk({ type: 'choice', choices: R.shuffle(nums.map(toRoman)), text: `Số La Mã nào ${big ? 'lớn nhất' : 'bé nhất'}?`, answer: toRoman(ans), solution: `${nums.map(x => `${toRoman(x)} = ${x}`).join('; ')}. Số ${big ? 'lớn nhất' : 'bé nhất'} là <b>${toRoman(ans)}</b>.` });
    }
    const t = R.int(0, 2);
    if (t === 0) { const N = R.pick([20, 25, 30]), L = R.pick(['I', 'V', 'X']), list = range(1, N).filter(x => toRoman(x).includes(L)); return mk({ text: `Viết các số từ 1 đến ${N} bằng chữ số La Mã. Có bao nhiêu số có chứa chữ ${L}?`, answer: list.length, solution: `Các số có chữ ${L}: ${list.map(x => `${toRoman(x)}`).join(', ')}. Có <b>${list.length}</b> số.` }); }
    if (t === 1) { const N = R.int(8, 20), cnt = sum(range(1, N).map(x => toRoman(x).split('').filter(c => c === 'I').length)); return mk({ text: `Viết các số La Mã từ I đến ${toRoman(N)} thì phải viết tất cả bao nhiêu chữ I?`, answer: cnt, solution: `${range(1, N).map(toRoman).join(', ')}. Đếm các chữ I: tổng cộng <b>${cnt}</b> chữ.` }); }
    const n = R.int(12, 38), r = toRoman(n), m = r.split('').map(c => (c === 'I' ? 1 : 2)), s = sum(m);
    return mk({ text: `Xếp que diêm thành số La Mã: chữ I cần 1 que, chữ V cần 2 que, chữ X cần 2 que. Hỏi xếp số ${n} bằng chữ số La Mã cần bao nhiêu que diêm?`, answer: s, solution: `${n} viết là ${r}. Số que: ${m.join(' + ')} = <b>${s}</b>.` });
  }

  function ntRound(R, lv) {
    const PN = { 10: 'chục', 100: 'trăm', 1000: 'nghìn', 10000: 'chục nghìn' };
    const how = (n, p) => { const d = Math.floor((n % p) / (p / 10)); return `Chữ số ở hàng ngay sau hàng ${PN[p]} là ${d}${d >= 5 ? ' (từ 5 trở lên) nên làm tròn lên' : ' (bé hơn 5) nên làm tròn xuống'}`; };
    if (lv === 1 || lv === 2) {
      const [lo, hi, p] = R.pick(lv === 1 ? [[101, 999, 10], [1001, 9999, 100], [101, 999, 100]] : [[1001, 9999, 1000], [10001, 99999, 1000], [10001, 99999, 100], [10001, 99999, 10000]]);
      let n = R.int(lo, hi); if (n % p === 0) n += p / 2;
      return mk({ text: `Làm tròn số ${fmt(n)} đến hàng ${PN[p]} thì được số nào?`, answer: roundTo(n, p), solution: `${how(n, p)}: <b>${fmt(roundTo(n, p))}</b>.` });
    }
    const t = R.int(0, 2), p = R.pick([10, 100]), X = p === 10 ? 10 * R.int(11, 99) : 100 * R.int(11, 98);
    if (t === 0) return mk({ text: `Tìm số bé nhất mà khi làm tròn đến hàng ${PN[p]} thì được ${fmt(X)}.`, answer: X - p / 2, solution: `Các số làm tròn đến hàng ${PN[p]} được ${fmt(X)} là từ ${fmt(X - p / 2)} đến ${fmt(X + p / 2 - 1)} (từ 5 trở lên thì làm tròn lên). Số bé nhất là <b>${fmt(X - p / 2)}</b>.` });
    if (t === 1) return mk({ text: `Tìm số lớn nhất mà khi làm tròn đến hàng ${PN[p]} thì được ${fmt(X)}.`, answer: X + p / 2 - 1, solution: `Các số làm tròn đến hàng ${PN[p]} được ${fmt(X)} là từ ${fmt(X - p / 2)} đến ${fmt(X + p / 2 - 1)}. Số lớn nhất là <b>${fmt(X + p / 2 - 1)}</b>.` });
    return mk({ text: `Tính tổng của số bé nhất và số lớn nhất mà khi làm tròn đến hàng ${PN[p]} đều được ${fmt(X)}.`, answer: 2 * X - 1, solution: `Số bé nhất là ${fmt(X - p / 2)}, số lớn nhất là ${fmt(X + p / 2 - 1)}. Tổng: ${fmt(X - p / 2)} + ${fmt(X + p / 2 - 1)} = <b>${fmt(2 * X - 1)}</b>.` });
  }

  const FOUR = range(1000, 9999);
  const distinct = n => new Set(String(n)).size === String(n).length;
  function ntSpecial(R, lv) {
    const qs = lv === 1 ? [
      ['Số lớn nhất có bốn chữ số là số nào?', 9999, 'Mỗi hàng lấy chữ số lớn nhất là 9: <b>9.999</b>.'],
      ['Số bé nhất có bốn chữ số là số nào?', 1000, 'Hàng nghìn bé nhất là 1, các hàng khác là 0: <b>1.000</b>.'],
      ['Số lớn nhất có bốn chữ số khác nhau là số nào?', 9876, 'Chọn các chữ số lớn nhất, khác nhau, xếp từ lớn đến bé: <b>9.876</b>.'],
      ['Số bé nhất có bốn chữ số khác nhau là số nào?', 1023, 'Hàng nghìn bé nhất là 1, rồi lần lượt 0, 2, 3: <b>1.023</b>.'],
      ['Số lớn nhất có năm chữ số là số nào?', 99999, 'Mỗi hàng lấy chữ số 9: <b>99.999</b>.'],
      ['Số bé nhất có năm chữ số là số nào?', 10000, 'Hàng chục nghìn là 1, các hàng khác là 0: <b>10.000</b>.'],
      ['Số tròn nghìn lớn nhất có bốn chữ số là số nào?', 9000, 'Các số tròn nghìn có bốn chữ số: 1.000, 2.000, ..., 9.000. Lớn nhất là <b>9.000</b>.'],
    ] : lv === 2 ? [
      ['Tính tổng của số lớn nhất có ba chữ số và số bé nhất có bốn chữ số.', 1999, '999 + 1.000 = <b>1.999</b>.'],
      ['Tính hiệu của số lớn nhất có bốn chữ số và số lớn nhất có ba chữ số.', 9000, '9.999 − 999 = <b>9.000</b>.'],
      ['Số chẵn lớn nhất có bốn chữ số khác nhau là số nào?', 9876, 'Số lớn nhất có bốn chữ số khác nhau là 9.876, nó có tận cùng 6 nên là số chẵn: <b>9.876</b>.'],
      ['Số lẻ bé nhất có bốn chữ số khác nhau là số nào?', 1023, 'Số bé nhất có bốn chữ số khác nhau là 1.023, tận cùng 3 nên là số lẻ: <b>1.023</b>.'],
      ['Số lẻ lớn nhất có bốn chữ số khác nhau là số nào?', 9875, '9.876 là số chẵn. Giữ 9, 8, 7 ở ba hàng đầu, hàng đơn vị lẻ lớn nhất còn lại là 5: <b>9.875</b>.'],
      ['Số lớn nhất có bốn chữ số mà các chữ số đều chẵn là số nào?', 8888, 'Chữ số chẵn lớn nhất là 8: <b>8.888</b>.'],
      ['Số tròn trăm lớn nhất có bốn chữ số là số nào?', 9900, 'Số tròn trăm có hai chữ số tận cùng là 00. Lớn nhất là <b>9.900</b>.'],
      ['Tính hiệu của số bé nhất có năm chữ số và số lớn nhất có bốn chữ số.', 1, '10.000 − 9.999 = <b>1</b>.'],
    ] : (() => {
      const k1 = R.int(10, 30), mx = FOUR.filter(n => sum(digitsOf(n)) === k1).pop();
      const k2 = R.int(5, 25), mn = FOUR.find(n => sum(digitsOf(n)) === k2);
      const k3 = R.int(8, 20), mnd = FOUR.find(n => distinct(n) && sum(digitsOf(n)) === k3);
      const k4 = R.int(10, 26), mxd = FOUR.filter(n => distinct(n) && sum(digitsOf(n)) === k4).pop();
      const chk = n => `(${digitsOf(n).join(' + ')} = ${sum(digitsOf(n))})`;
      return [
        [`Tìm số lớn nhất có bốn chữ số mà tổng các chữ số bằng ${k1}.`, mx, `Muốn số lớn nhất, chọn chữ số hàng nghìn lớn nhất có thể, rồi đến hàng trăm, hàng chục, hàng đơn vị. Ta được <b>${fmt(mx)}</b> ${chk(mx)}.`],
        [`Tìm số bé nhất có bốn chữ số mà tổng các chữ số bằng ${k2}.`, mn, `Muốn số bé nhất, chữ số hàng nghìn bé nhất có thể (ít nhất là 1), dồn phần lớn vào các hàng thấp (hàng đơn vị, hàng chục). Ta được <b>${fmt(mn)}</b> ${chk(mn)}.`],
        [`Tìm số bé nhất có bốn chữ số khác nhau mà tổng các chữ số bằng ${k3}.`, mnd, `Chọn hàng nghìn bé nhất có thể, rồi hàng trăm, hàng chục bé nhất có thể, các chữ số khác nhau. Ta được <b>${fmt(mnd)}</b> ${chk(mnd)}.`],
        [`Tìm số lớn nhất có bốn chữ số khác nhau mà tổng các chữ số bằng ${k4}.`, mxd, `Chọn hàng nghìn lớn nhất có thể, rồi đến hàng trăm, hàng chục, các chữ số khác nhau. Ta được <b>${fmt(mxd)}</b> ${chk(mxd)}.`],
        ['Tính hiệu của số lớn nhất có bốn chữ số khác nhau và số bé nhất có bốn chữ số khác nhau.', 8853, 'Số lớn nhất có bốn chữ số khác nhau là 9.876, số bé nhất là 1.023. Hiệu: 9.876 − 1.023 = <b>8.853</b>.'],
      ];
    })();
    const [text, answer, solution] = R.pick(qs);
    return mk({ text, answer, solution });
  }

  function ntCount(R, lv) {
    if (lv === 1) {
      const t = R.int(0, 2);
      if (t === 0) { const a = R.int(100, 500), b = a + R.int(20, 300); return mk({ text: `Từ ${a} đến ${b} có bao nhiêu số?`, answer: b - a + 1, solution: `Số các số = số cuối − số đầu + 1: ${b} − ${a} + 1 = <b>${b - a + 1}</b>.` }); }
      if (t === 1) { const even = R.chance(0.5), w = even ? 'chẵn' : 'lẻ', a = R.int(10, 200), b = a + R.int(15, 60), f = (a % 2 === 0) === even ? a : a + 1, l = (b % 2 === 0) === even ? b : b - 1, n = (l - f) / 2 + 1; return mk({ text: `Từ ${a} đến ${b} có bao nhiêu số ${w}?`, answer: n, solution: `Số ${w} đầu tiên là ${f}, cuối cùng là ${l}, hai số ${w} liền nhau hơn kém 2. Số các số: (${l} − ${f}) : 2 + 1 = <b>${n}</b>.` }); }
      const [txt0, a] = R.pick([['ba', 900], ['bốn', 9000], ['hai', 90]]); return mk({ text: `Có bao nhiêu số có ${txt0} chữ số?`, answer: a, solution: `Các số có ${txt0} chữ số từ ${fmt(a / 9)} đến ${fmt(a / 9 * 10 - 1)}: ${fmt(a / 9 * 10 - 1)} − ${fmt(a / 9)} + 1 = <b>${fmt(a)}</b> số.` });
    }
    if (lv === 2) {
      const t = R.int(0, 2);
      if (t === 0) { const k = R.int(3, 9), n = R.int(50, 200), q = Math.floor(n / k); return mk({ text: `Từ 1 đến ${n} có bao nhiêu số chia hết cho ${k}?`, answer: q, solution: `Các số đó là ${k}, ${2 * k}, ${3 * k}, ..., ${q * k} (= ${k} × ${q}; ${n} : ${k} = ${q}${n % k ? ` dư ${n % k}` : ''}). Có <b>${q}</b> số.` }); }
      if (t === 1) { const a = R.int(1, 20), d = R.int(2, 7), n = R.int(10, 40), b = a + d * (n - 1); return mk({ text: `Dãy số sau có bao nhiêu số?<div class="seq">${a}, ${a + d}, ${a + 2 * d}, ..., ${b}</div>`, answer: n, solution: `Hai số liền nhau hơn kém ${d}. Số các số: (${b} − ${a}) : ${d} + 1 = ${(b - a) / d} + 1 = <b>${n}</b>.` }); }
      const [q, a, s] = R.pick([
        ['Có bao nhiêu số tròn chục có ba chữ số?', 90, 'Đó là 100, 110, ..., 990: (990 − 100) : 10 + 1 = <b>90</b> số.'],
        ['Có bao nhiêu số chẵn có ba chữ số?', 450, 'Đó là 100, 102, ..., 998: (998 − 100) : 2 + 1 = <b>450</b> số.'],
        ['Có bao nhiêu số lẻ có ba chữ số?', 450, 'Đó là 101, 103, ..., 999: (999 − 101) : 2 + 1 = <b>450</b> số.'],
        ['Có bao nhiêu số tròn trăm có bốn chữ số?', 90, 'Đó là 1.000, 1.100, ..., 9.900: (9.900 − 1.000) : 100 + 1 = <b>90</b> số.'],
        [`Có bao nhiêu số có ba chữ số mà chữ số hàng trăm là ${R.int(1, 9)}?`, 100, 'Hai chữ số sau có thể là 00, 01, ..., 99: có <b>100</b> số.'],
      ]);
      return mk({ text: q, answer: a, solution: s });
    }
    const t = R.int(0, 2);
    if (t === 0) { const k = R.int(3, 9), a = R.int(20, 150), b = a + R.int(60, 300), f = Math.ceil(a / k) * k, l = Math.floor(b / k) * k, n = (l - f) / k + 1; return mk({ text: `Từ ${a} đến ${b} có bao nhiêu số chia hết cho ${k}?`, answer: n, solution: `Số đầu tiên chia hết cho ${k} là ${f}, số cuối cùng là ${l}. Các số cách nhau ${k}: (${l} − ${f}) : ${k} + 1 = <b>${n}</b> số.` }); }
    if (t === 1) { const a = R.int(1, 20), d = R.int(2, 9), n = R.int(20, 100); return mk({ text: `Cho dãy số: ${a}, ${a + d}, ${a + 2 * d}, ${a + 3 * d}, ... Hỏi số thứ ${n} của dãy là số nào?`, answer: a + d * (n - 1), solution: `Từ số thứ nhất đến số thứ ${n} có ${n - 1} khoảng cách, mỗi khoảng ${d}. Số thứ ${n}: ${a} + ${n - 1} × ${d} = <b>${a + d * (n - 1)}</b>.` }); }
    const [q, a, s] = R.pick([
      ['Có bao nhiêu số có ba chữ số mà cả ba chữ số đều lẻ?', 125, 'Mỗi hàng có 5 cách chọn (1, 3, 5, 7, 9): 5 × 5 × 5 = <b>125</b> số.'],
      ['Có bao nhiêu số có ba chữ số mà cả ba chữ số đều chẵn?', 100, 'Hàng trăm có 4 cách (2, 4, 6, 8; không được là 0), hàng chục và hàng đơn vị mỗi hàng 5 cách: 4 × 5 × 5 = <b>100</b> số.'],
      ['Có bao nhiêu số có ba chữ số mà chữ số hàng trăm bằng chữ số hàng đơn vị?', 90, 'Hàng trăm có 9 cách (1 đến 9), hàng chục 10 cách, hàng đơn vị phải bằng hàng trăm: 9 × 10 = <b>90</b> số.'],
      ['Có bao nhiêu số có ba chữ số khác nhau?', 648, 'Hàng trăm 9 cách (khác 0), hàng chục 9 cách (khác hàng trăm), hàng đơn vị 8 cách: 9 × 9 × 8 = <b>648</b> số.'],
      ['Có bao nhiêu số có ba chữ số mà tận cùng là 5?', 90, 'Hàng trăm 9 cách, hàng chục 10 cách, hàng đơn vị là 5: 9 × 10 = <b>90</b> số.'],
    ]);
    return mk({ text: q, answer: a, solution: s });
  }

  function ntPages(R, lv) {
    const digitsTo = n => 9 + 2 * (Math.min(n, 99) - 9) + (n > 99 ? 3 * (n - 99) : 0);
    if (lv === 2) {
      const n = R.int(30, 250), d = digitsTo(n);
      return mk({ text: `Để đánh số trang một quyển sách từ trang 1 đến trang ${n}, cần viết tất cả bao nhiêu chữ số?`, answer: d, solution: `Trang 1 đến 9: 9 chữ số. Trang 10 đến ${Math.min(n, 99)}: ${Math.min(n, 99) - 9} trang × 2 = ${2 * (Math.min(n, 99) - 9)} chữ số.${n > 99 ? ` Trang 100 đến ${n}: ${n - 99} trang × 3 = ${3 * (n - 99)} chữ số.` : ''} Tổng: <b>${d}</b> chữ số.` });
    }
    if (R.chance(0.5)) {
      const n = R.int(100, 400), D = digitsTo(n);
      return mk({ text: `Để đánh số trang một quyển sách (bắt đầu từ trang 1) người ta đã viết tất cả ${fmt(D)} chữ số. Hỏi quyển sách có bao nhiêu trang?`, answer: n, solution: `Trang 1 đến 99 cần 9 + 90 × 2 = 189 chữ số. Còn lại ${fmt(D)} − 189 = ${D - 189} chữ số cho các trang có ba chữ số: ${D - 189} : 3 = ${n - 99} trang. Số trang: 99 + ${n - 99} = <b>${n}</b>.` });
    }
    const n = R.int(50, 150), d = R.int(1, 9);
    let u = 0, tn = 0, h = 0;
    for (let i = 1; i <= n; i++) { if (i % 10 === d) u++; if (i >= 10 && Math.floor(i / 10) % 10 === d) tn++; if (i >= 100 && Math.floor(i / 100) === d) h++; }
    return mk({ text: `Viết các số từ 1 đến ${n}. Hỏi chữ số ${d} được viết tất cả bao nhiêu lần?`, answer: u + tn + h, solution: `Ở hàng đơn vị: ${u} lần. Ở hàng chục: ${tn} lần.${h ? ` Ở hàng trăm: ${h} lần.` : ''} Tổng: ${[u, tn].concat(h ? [h] : []).join(' + ')} = <b>${u + tn + h}</b> lần.` });
  }

  function ntDivis(R, lv) {
    if (lv === 1) {
      const by = R.pick([2, 5]), good = n => n % by === 0;
      const pick = ok => { for (;;) { const n = R.int(100, 9999); if (good(n) === ok) return n; } };
      const ans = pick(true), others = [pick(false), pick(false), pick(false)];
      if (new Set(others.concat(ans)).size < 4) return ntDivis(R, lv);
      const opts = R.shuffle([ans].concat(others).map(fmt));
      return mk({ type: 'choice', choices: opts, text: `Trong các số ${opts.join('; ')}, số nào chia hết cho ${by}?`, answer: fmt(ans), solution: by === 2 ? `Số chia hết cho 2 có chữ số tận cùng là 0, 2, 4, 6, 8. Đó là số <b>${fmt(ans)}</b>.` : `Số chia hết cho 5 có chữ số tận cùng là 0 hoặc 5. Đó là số <b>${fmt(ans)}</b>.` });
    }
    if (lv === 2) {
      if (R.chance(0.5)) { const a = R.int(10, 300), b = a + R.int(30, 200), f = Math.ceil(a / 5) * 5, l = Math.floor(b / 5) * 5, n = (l - f) / 5 + 1; return mk({ text: `Từ ${a} đến ${b} có bao nhiêu số chia hết cho 5?`, answer: n, solution: `Số chia hết cho 5 có tận cùng là 0 hoặc 5. Số đầu tiên là ${f}, số cuối cùng là ${l}, các số cách nhau 5: (${l} − ${f}) : 5 + 1 = <b>${n}</b> số.` }); }
      const [q, a, s] = R.pick([
        ['Có bao nhiêu số có hai chữ số chia hết cho cả 2 và 5?', 9, 'Số chia hết cho cả 2 và 5 có tận cùng là 0: 10, 20, ..., 90. Có <b>9</b> số.'],
        ['Có bao nhiêu số có ba chữ số chia hết cho 5?', 180, 'Đó là 100, 105, ..., 995: (995 − 100) : 5 + 1 = <b>180</b> số.'],
        ['Số lớn nhất có ba chữ số chia hết cho 5 là số nào?', 995, 'Số chia hết cho 5 có tận cùng là 0 hoặc 5. Lớn nhất là <b>995</b>.'],
        ['Số lớn nhất có ba chữ số chia hết cho cả 2 và 5 là số nào?', 990, 'Phải có tận cùng là 0. Lớn nhất là <b>990</b>.'],
        ['Số lẻ bé nhất có ba chữ số chia hết cho 5 là số nào?', 105, 'Số lẻ chia hết cho 5 có tận cùng là 5. Bé nhất là <b>105</b>.'],
      ]);
      return mk({ text: q, answer: a, solution: s });
    }
    const t = R.int(0, 2);
    if (t === 0) {
      const ds = R.sample(range(1, 9).filter(x => x !== 5), 2).concat(R.chance(0.5) ? [0, 5] : [R.pick([0, 5]), R.pick([1, 2, 3, 4, 6, 7, 8, 9])]);
      const uniq = [...new Set(ds)]; if (uniq.length < 4) return ntDivis(R, lv);
      const list = [];
      for (const a of uniq) for (const b of uniq) for (const c of uniq) if (a && a !== b && b !== c && a !== c && c % 5 === 0) list.push(100 * a + 10 * b + c);
      list.sort((x, y) => x - y);
      return mk({ text: `Từ các chữ số ${uniq.slice().sort((x, y) => x - y).join(', ')} lập được bao nhiêu số có ba chữ số khác nhau và chia hết cho 5?`, answer: list.length, solution: `Hàng đơn vị phải là 0 hoặc 5. Liệt kê: ${list.join(', ')}. Có <b>${list.length}</b> số.` });
    }
    if (t === 1) {
      const [q, a, s] = R.pick([
        ['Số lớn nhất có bốn chữ số khác nhau chia hết cho 5 là số nào?', 9875, 'Tận cùng là 0 hoặc 5. Giữ 9, 8, 7 ở ba hàng đầu, hàng đơn vị chọn 5 (lớn hơn 0): <b>9.875</b>.'],
        ['Số lớn nhất có bốn chữ số khác nhau chia hết cho cả 2 và 5 là số nào?', 9870, 'Tận cùng phải là 0, ba hàng đầu là 9, 8, 7: <b>9.870</b>.'],
        ['Số bé nhất có bốn chữ số khác nhau chia hết cho 5 là số nào?', 1025, 'Ba hàng đầu bé nhất là 1, 0, 2; hàng đơn vị là 0 hoặc 5 và khác các chữ số trước, nên là 5: <b>1.025</b>.'],
        ['Số bé nhất có bốn chữ số khác nhau chia hết cho cả 2 và 5 là số nào?', 1230, 'Tận cùng là 0, ba chữ số đầu bé nhất khác 0 và khác nhau là 1, 2, 3: <b>1.230</b>.'],
      ]);
      return mk({ text: q, answer: a, solution: s });
    }
    const d = R.int(1, 9);
    return mk({ text: `Có bao nhiêu số có ba chữ số chia hết cho 5 mà chữ số hàng trăm là ${d}?`, answer: 20, solution: `Hàng trăm là ${d}, hàng chục có 10 cách (0 đến 9), hàng đơn vị có 2 cách (0 hoặc 5): 10 × 2 = <b>20</b> số.` });
  }

  function ntMod(R, lv) {
    const d = R.int(3, 9), r = R.int(1, d - 1);
    if (lv === 1 || lv === 2) {
      const [lo, hi] = lv === 1 ? [10, 99] : [100, 999], nm = lv === 1 ? 'hai' : 'ba', small = R.chance(0.5);
      const list = range(lo, hi).filter(n => n % d === r), ans = small ? list[0] : list[list.length - 1];
      return mk({ text: `Tìm số ${small ? 'bé' : 'lớn'} nhất có ${nm} chữ số mà chia cho ${d} thì dư ${r}.`, answer: ans, solution: small ? `${lo} : ${d} = ${Math.floor(lo / d)} (dư ${lo % d}). Các số chia ${d} dư ${r} từ ${lo} trở đi: ${list.slice(0, 3).join(', ')}, ... Số bé nhất là <b>${ans}</b>.` : `${hi} : ${d} = ${Math.floor(hi / d)} (dư ${hi % d}). Số lớn nhất có ${nm} chữ số chia ${d} dư ${r} là <b>${ans}</b> = ${Math.floor(ans / d)} × ${d} + ${r}.` });
    }
    const [a, b] = R.pick([[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [4, 6], [3, 7]]), L = lcm(a, b);
    const t = R.int(0, 2);
    if (t === 0) { const rr = R.int(1, Math.min(a, b) - 1); return mk({ text: `Tìm số bé nhất lớn hơn ${rr} mà chia cho ${a} dư ${rr} và chia cho ${b} cũng dư ${rr}.`, answer: L + rr, solution: `Bớt ${rr} thì số đó chia hết cho cả ${a} và ${b}. Số bé nhất (khác 0) chia hết cho cả ${a} và ${b} là ${L}. Số cần tìm: ${L} + ${rr} = <b>${L + rr}</b>.` }); }
    const small = t === 1, list = range(100, 999).filter(n => n % L === 0), ans = small ? list[0] : list[list.length - 1];
    return mk({ text: `Tìm số ${small ? 'bé' : 'lớn'} nhất có ba chữ số chia hết cho cả ${a} và ${b}.`, answer: ans, solution: `Số chia hết cho cả ${a} và ${b} thì chia hết cho ${L} (${L} là số bé nhất chia hết cho cả hai). Số ${small ? 'bé' : 'lớn'} nhất có ba chữ số chia hết cho ${L} là <b>${ans}</b> = ${L} × ${ans / L}.` });
  }

  function ntFromDigits(R, lv) {
    const useAll = ds => perms(ds).filter(p => p[0] !== 0).map(p => Number(p.join('')));
    if (lv === 1) {
      const ds = R.sample(range(1, 9), 4), max = R.chance(0.5), ans = max ? Number(ds.slice().sort((a, b) => b - a).join('')) : Number(ds.slice().sort((a, b) => a - b).join(''));
      return mk({ text: `Dùng cả bốn chữ số ${R.shuffle(ds).join(', ')} (mỗi chữ số dùng một lần) để lập số ${max ? 'lớn' : 'bé'} nhất có bốn chữ số.`, answer: ans, solution: `Xếp các chữ số từ ${max ? 'lớn đến bé' : 'bé đến lớn'}: <b>${fmt(ans)}</b>.` });
    }
    if (lv === 2) {
      const t = R.int(0, 2);
      if (t === 0) { const ds = R.sample(range(1, 9), 3).concat(0), all = useAll(ds), ans = Math.min(...all), s = ds.filter(x => x).sort((a, b) => a - b); return mk({ text: `Dùng cả bốn chữ số ${R.shuffle(ds).join(', ')} (mỗi chữ số dùng một lần) để lập số bé nhất có bốn chữ số.`, answer: ans, solution: `Chữ số 0 không đứng đầu, nên hàng nghìn là chữ số bé nhất khác 0 là ${s[0]}; tiếp theo là 0, rồi ${s[1]}, ${s[2]}: <b>${fmt(ans)}</b>.` }); }
      if (t === 1) {
        const ds = R.sample(range(0, 9), 4), max = R.chance(0.5), all = [];
        for (const a of ds) for (const b of ds) for (const c of ds) if (a && a !== b && b !== c && a !== c) all.push(100 * a + 10 * b + c);
        const ans = max ? Math.max(...all) : Math.min(...all);
        return mk({ text: `Từ bốn chữ số ${ds.join(', ')}, hãy lập số ${max ? 'lớn' : 'bé'} nhất có ba chữ số khác nhau.`, answer: ans, solution: max ? `Chọn ba chữ số lớn nhất, xếp từ lớn đến bé: <b>${ans}</b>.` : `Hàng trăm là chữ số bé nhất khác 0, hai hàng sau là hai chữ số bé nhất còn lại xếp từ bé đến lớn: <b>${ans}</b>.` });
      }
      const ds = R.sample(range(0, 9), 3), all = useAll(ds); if (all.length < 2) return ntFromDigits(R, lv);
      const mx = Math.max(...all), mn = Math.min(...all);
      return mk({ text: `Dùng cả ba chữ số ${ds.join(', ')} lập các số có ba chữ số khác nhau. Tính hiệu của số lớn nhất và số bé nhất lập được.`, answer: mx - mn, solution: `Số lớn nhất: ${mx}. Số bé nhất: ${mn}${ds.includes(0) ? ' (chữ số 0 không đứng đầu)' : ''}. Hiệu: ${mx} − ${mn} = <b>${mx - mn}</b>.` });
    }
    for (;;) {
      const ds = R.chance(0.6) ? R.sample(range(1, 9), 3).concat(0) : R.sample(range(1, 9), 4);
      const [cond, cw, cf] = R.pick([['even', 'số chẵn', n => n % 2 === 0], ['odd', 'số lẻ', n => n % 2 === 1], ['five', 'số chia hết cho 5', n => n % 5 === 0]]);
      const max = R.chance(0.5), all = useAll(ds).filter(cf);
      if (all.length < 2) continue;
      const ans = max ? Math.max(...all) : Math.min(...all);
      const ends = [...new Set(all.map(n => n % 10))].sort((a, b) => a - b);
      const best = ends.map(e => { const xs = all.filter(n => n % 10 === e); return [e, max ? Math.max(...xs) : Math.min(...xs)]; });
      return mk({
        text: `Dùng cả bốn chữ số ${R.shuffle(ds).join(', ')} (mỗi chữ số dùng một lần) để lập ${cw} ${max ? 'lớn' : 'bé'} nhất có bốn chữ số.`, answer: ans,
        solution: `Chữ số hàng đơn vị có thể là ${ends.join(' hoặc ')}. Với mỗi cách, xếp ba chữ số còn lại thành số ${max ? 'lớn' : 'bé'} nhất${max ? '' : ' (chữ số 0 không đứng đầu)'}: ${best.map(([e, v]) => `tận cùng ${e} → ${fmt(v)}`).join('; ')}. So sánh, số ${max ? 'lớn' : 'bé'} nhất là <b>${fmt(ans)}</b>.`,
      });
    }
  }

  // =====================================================================
  // HÌNH HỌC
  // =====================================================================
  function geoAngle(R, lv) {
    if (lv === 0) {
      const right = R.chance(0.5), deg = right ? 90 : R.pick([45, 60, 120, 135]), rot = R.pick([0, 0, 90]);
      const ans = right ? 'Góc vuông' : 'Góc không vuông';
      return mk({ type: 'choice', choices: ['Góc vuông', 'Góc không vuông'], text: 'Góc trong hình bên là góc vuông hay góc không vuông?', visual: svg(200, 150, angleBody(rot === 90 ? 150 : 50, 120, deg, rot, 95), 190), answer: ans, solution: right ? 'Đặt ê-ke vào thì hai cạnh của góc trùng với hai cạnh góc vuông của ê-ke: đó là <b>góc vuông</b>.' : 'Hai cạnh của góc không trùng với hai cạnh góc vuông của ê-ke: đó là <b>góc không vuông</b>.' });
    }
    if (lv === 1) {
      const L = ['A', 'B', 'C', 'D'], count = R.chance(0.5);
      const rights = count ? R.int(1, 3) : 1, isR = R.shuffle(range(0, 3).map(i => i < rights));
      const degs = isR.map(r => (r ? 90 : R.pick([45, 60, 120, 135, 30, 150])));
      let body = '';
      degs.forEach((d, i) => { const flat = d === 90 && R.chance(0.5); body += angleBody(60 + i * 120 - (flat ? 25 : 0), 100, d, flat ? 0 : 90 - d / 2, 58, `Đỉnh ${L[i]}`); });
      const vis = svg(480, 135, body, 460);
      if (count) return mk({ text: 'Trong hình bên có bao nhiêu góc vuông?', visual: vis, answer: rights, solution: `Dùng ê-ke kiểm tra từng góc. Góc vuông là góc đỉnh ${L.filter((_, i) => isR[i]).join(', ')}. Có <b>${rights}</b> góc vuông.` });
      const ans = `Góc đỉnh ${L[isR.indexOf(true)]}`;
      return mk({ type: 'choice', choices: L.map(x => `Góc đỉnh ${x}`), text: 'Góc nào trong hình bên là góc vuông?', visual: vis, answer: ans, solution: `Dùng ê-ke kiểm tra: <b>góc đỉnh ${L[isR.indexOf(true)]}</b> là góc vuông, các góc còn lại không vuông.` });
    }
    const k = R.int(1, 3), h = R.int(0, 1), ans = 4 + 4 * k + 4 * h + 4 * k * h;
    return mk({
      text: `Hình chữ nhật bên được kẻ thêm ${k} đoạn thẳng dọc${h ? ' và 1 đoạn thẳng ngang' : ''}. Hình bên có tất cả bao nhiêu góc vuông?`, visual: svgRectLines(k, h), answer: ans,
      solution: `Ở 4 đỉnh của hình chữ nhật: 4 góc vuông. Mỗi đầu của đoạn kẻ thêm nằm trên cạnh hình chữ nhật tạo ra 2 góc vuông: ${2 * (k + h)} đầu × 2 = ${4 * (k + h)} góc.${h ? ` Mỗi điểm đoạn ngang cắt đoạn dọc tạo ra 4 góc vuông: ${k} × 4 = ${4 * k} góc.` : ''} Tổng: <b>${ans}</b> góc vuông.`,
    });
  }

  function geoMidpoint(R, lv) {
    if (lv === 0) {
      const [P, Q] = R.sample(['M', 'N', 'O', 'I', 'C', 'D'], 2), outLeft = R.chance(0.5), p = R.pick([0.35, 0.5, 0.6]);
      const pts = outLeft ? [[0, Q], [0.3, 'A'], [0.3 + 0.7 * p * 0.9, P], [0.95, 'B']] : [[0.05, 'A'], [0.05 + 0.65 * p, P], [0.7, 'B'], [1, Q]];
      return mk({ type: 'choice', choices: R.shuffle([P, Q, 'A', 'B']), text: 'Ba điểm nào thẳng hàng thì có một điểm ở giữa. Trong hình bên, điểm nào ở giữa hai điểm A và B?', visual: svgPoints(pts), answer: P, solution: `Điểm ${P} nằm trên đoạn thẳng AB, giữa A và B. Điểm ${Q} nằm ngoài đoạn AB. Đáp án <b>${P}</b>.` });
    }
    if (lv === 1) {
      const m = R.int(3, 25), t = R.int(0, 1);
      if (t === 0) return mk({ text: `M là trung điểm của đoạn thẳng AB. Đoạn AB dài ${2 * m} cm. Hỏi đoạn AM dài bao nhiêu xăng-ti-mét?`, visual: svgPoints([[0, 'A'], [0.5, 'M'], [1, 'B']], [[0, 1, `${2 * m} cm`]]), answer: m, solution: `Trung điểm M chia đoạn AB thành hai phần bằng nhau: AM = ${2 * m} : 2 = <b>${m}</b> cm.` });
      return mk({ text: `M là trung điểm của đoạn thẳng AB. Đoạn AM dài ${m} cm. Hỏi đoạn AB dài bao nhiêu xăng-ti-mét?`, visual: svgPoints([[0, 'A'], [0.5, 'M'], [1, 'B']], [[0, 0.5, `${m} cm`]]), answer: 2 * m, solution: `AB gồm hai đoạn bằng nhau AM và MB: ${m} × 2 = <b>${2 * m}</b> cm.` });
    }
    if (lv === 2) {
      const k = R.int(2, 12), t = R.int(0, 1);
      if (t === 0) return mk({ text: `M là trung điểm của đoạn thẳng AB, N là trung điểm của đoạn thẳng MB. Biết AB dài ${4 * k} cm. Hỏi đoạn AN dài bao nhiêu xăng-ti-mét?`, visual: svgPoints([[0, 'A'], [0.5, 'M'], [0.75, 'N'], [1, 'B']], [[0, 1, `${4 * k} cm`]]), answer: 3 * k, solution: `AM = MB = ${4 * k} : 2 = ${2 * k} cm. MN = ${2 * k} : 2 = ${k} cm. AN = AM + MN = ${2 * k} + ${k} = <b>${3 * k}</b> cm.` });
      return mk({ text: `M là trung điểm của đoạn thẳng AB, N là trung điểm của đoạn thẳng AM. Biết NM dài ${k} cm. Hỏi đoạn AB dài bao nhiêu xăng-ti-mét?`, visual: svgPoints([[0, 'A'], [0.25, 'N'], [0.5, 'M'], [1, 'B']], [[0.25, 0.5, `${k} cm`]]), answer: 4 * k, solution: `AM = NM × 2 = ${2 * k} cm. AB = AM × 2 = <b>${4 * k}</b> cm.` });
    }
    if (R.chance(0.5)) {
      const a = R.int(2, 9), b = R.int(2, 9), L = 2 * a + 2 * b, p = (2 * a) / L;
      return mk({ text: `Đoạn thẳng AB dài ${L} cm. Điểm C nằm trên AB sao cho AC = ${2 * a} cm. M là trung điểm của AC, N là trung điểm của CB. Hỏi đoạn MN dài bao nhiêu xăng-ti-mét?`, visual: svgPoints([[0, 'A'], [p / 2, 'M'], [p, 'C'], [(1 + p) / 2, 'N'], [1, 'B']]), answer: a + b, solution: `CB = ${L} − ${2 * a} = ${2 * b} cm. MC = ${2 * a} : 2 = ${a} cm, CN = ${2 * b} : 2 = ${b} cm. MN = MC + CN = ${a} + ${b} = <b>${a + b}</b> cm. (MN luôn bằng một nửa AB.)` });
    }
    const k = R.int(3, 15);
    return mk({ text: `M là trung điểm của đoạn thẳng AB. N là trung điểm của AM, P là trung điểm của MB. Biết NP dài ${2 * k} cm. Hỏi đoạn AB dài bao nhiêu xăng-ti-mét?`, visual: svgPoints([[0, 'A'], [0.25, 'N'], [0.5, 'M'], [0.75, 'P'], [1, 'B']]), answer: 4 * k, solution: `NM = AM : 2 và MP = MB : 2, nên NP = NM + MP bằng một nửa AB. AB = ${2 * k} × 2 = <b>${4 * k}</b> cm.` });
  }

  function geoCircle(R, lv) {
    if (lv === 0) {
      const t = R.int(0, 3);
      if (t === 0) return mk({ type: 'choice', choices: ['Tâm', 'Bán kính', 'Đường kính'], text: 'Trong hình tròn bên, điểm O được gọi là gì?', visual: svgCircle('', 'rad'), answer: 'Tâm', solution: 'O là điểm chính giữa hình tròn, gọi là <b>tâm</b> của hình tròn.' });
      if (t === 1) return mk({ type: 'choice', choices: ['Tâm', 'Bán kính', 'Đường kính'], text: 'Trong hình tròn tâm O bên, đoạn thẳng OA được gọi là gì?', visual: svgCircle('', 'rad'), answer: 'Bán kính', solution: 'Đoạn thẳng nối tâm O với một điểm trên đường tròn là <b>bán kính</b>.' });
      if (t === 2) return mk({ type: 'choice', choices: ['Tâm', 'Bán kính', 'Đường kính'], text: 'Trong hình tròn tâm O bên, đoạn thẳng BC đi qua tâm O được gọi là gì?', visual: svgCircle('', 'diam'), answer: 'Đường kính', solution: 'Đoạn thẳng đi qua tâm, nối hai điểm trên đường tròn là <b>đường kính</b>.' });
      const r = R.int(2, 5);
      return mk({ text: `Hình tròn tâm O có bán kính OA = ${r} cm. Hỏi đường kính của hình tròn dài bao nhiêu xăng-ti-mét?`, visual: svgCircle(`${r} cm`, 'rad'), answer: 2 * r, solution: `Đường kính gấp 2 lần bán kính: ${r} × 2 = <b>${2 * r}</b> cm.` });
    }
    if (lv === 1) {
      const r = R.int(4, 40);
      if (R.chance(0.5)) return mk({ text: `Hình tròn tâm O có đường kính BC = ${2 * r} cm. Hỏi bán kính của hình tròn dài bao nhiêu xăng-ti-mét?`, visual: svgCircle(`${2 * r} cm`, 'diam'), answer: r, solution: `Bán kính bằng một nửa đường kính: ${2 * r} : 2 = <b>${r}</b> cm.` });
      return mk({ text: `Hình tròn tâm O có bán kính ${r} cm. Hỏi đường kính của hình tròn dài bao nhiêu xăng-ti-mét?`, visual: svgCircle(`${r} cm`, 'rad'), answer: 2 * r, solution: `Đường kính gấp 2 lần bán kính: ${r} × 2 = <b>${2 * r}</b> cm.` });
    }
    const k = R.int(2, 5), r = R.int(2, 9);
    if (lv === 2) {
      if (R.chance(0.5)) return mk({ text: `Có ${k} hình tròn bằng nhau, bán kính ${r} cm, xếp sát nhau thành một hàng vừa khít trong một hình chữ nhật như hình bên. Hỏi chiều dài hình chữ nhật là bao nhiêu xăng-ti-mét?`, visual: svgCirclesRow(k), answer: 2 * r * k, solution: `Mỗi hình tròn có đường kính ${r} × 2 = ${2 * r} cm. Chiều dài hình chữ nhật bằng ${k} đường kính: ${2 * r} × ${k} = <b>${2 * r * k}</b> cm.` });
      return mk({ text: `Có ${k} hình tròn bằng nhau, bán kính ${r} cm, xếp sát nhau thành một hàng như hình bên. Hỏi khoảng cách từ tâm hình tròn đầu tiên đến tâm hình tròn cuối cùng là bao nhiêu xăng-ti-mét?`, visual: svgCirclesRow(k), answer: 2 * r * (k - 1), solution: `Hai tâm liền nhau cách nhau 1 đường kính = ${2 * r} cm. Từ tâm đầu đến tâm cuối có ${k - 1} khoảng: ${2 * r} × ${k - 1} = <b>${2 * r * (k - 1)}</b> cm.` });
    }
    if (R.chance(0.5)) return mk({ text: `Có ${k} hình tròn bằng nhau, bán kính ${r} cm, xếp sát nhau thành một hàng vừa khít trong một hình chữ nhật như hình bên. Tính chu vi hình chữ nhật (đơn vị xăng-ti-mét).`, visual: svgCirclesRow(k), answer: 2 * (2 * r * k + 2 * r), solution: `Đường kính: ${2 * r} cm. Chiều dài = ${k} đường kính = ${2 * r * k} cm, chiều rộng = 1 đường kính = ${2 * r} cm. Chu vi: (${2 * r * k} + ${2 * r}) × 2 = <b>${2 * (2 * r * k + 2 * r)}</b> cm.` });
    return mk({ text: `Hai hình tròn bằng nhau tâm O và tâm I, hình tròn này đi qua tâm của hình tròn kia (như hình bên). Biết OI = ${r} cm. Tính độ dài đoạn thẳng AB (đơn vị xăng-ti-mét).`, visual: svgTwoCircles(), answer: 3 * r, solution: `Hình tròn tâm O đi qua I nên bán kính bằng OI = ${r} cm; hai hình tròn bằng nhau nên đều có bán kính ${r} cm. AB = AO + OI + IB = ${r} + ${r} + ${r} = <b>${3 * r}</b> cm.` });
  }

  function geoPerim(R, lv) {
    if (lv === 0) {
      if (R.chance(0.5)) { const a = R.int(3, 9), b = R.int(2, 8), c = R.int(2, 8); return mk({ text: 'Tính chu vi hình tam giác bên (đơn vị xăng-ti-mét).', visual: svgTriangle(a, b, c), answer: a + b + c, solution: `Chu vi là tổng độ dài các cạnh: ${a} + ${b} + ${c} = <b>${a + b + c}</b> cm.` }); }
      const [a, b, c, d] = range(1, 4).map(() => R.int(2, 9));
      return mk({ text: 'Tính chu vi hình tứ giác bên (đơn vị xăng-ti-mét).', visual: svgQuad(a, b, c, d), answer: a + b + c + d, solution: `Chu vi là tổng độ dài các cạnh: ${a} + ${b} + ${c} + ${d} = <b>${a + b + c + d}</b> cm.` });
    }
    if (lv === 1) {
      const t = R.int(0, 2);
      if (t === 0) { const b = R.int(3, 15), a = b + R.int(2, 20); return mk({ text: `Tính chu vi hình chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm.`, visual: svgRect(a, b), answer: 2 * (a + b), solution: `Chu vi hình chữ nhật = (dài + rộng) × 2 = (${a} + ${b}) × 2 = <b>${2 * (a + b)}</b> cm.` }); }
      if (t === 1) { const a = R.int(3, 25); return mk({ text: `Tính chu vi hình vuông có cạnh ${a} cm.`, visual: svgRect(a, a, 'cm', true), answer: 4 * a, solution: `Chu vi hình vuông = cạnh × 4 = ${a} × 4 = <b>${4 * a}</b> cm.` }); }
      const [a, b, c, d] = range(1, 4).map(() => R.int(8, 40));
      return mk({ text: 'Tính chu vi hình tứ giác bên (đơn vị xăng-ti-mét).', visual: svgQuad(a, b, c, d), answer: a + b + c + d, solution: `${a} + ${b} + ${c} + ${d} = <b>${a + b + c + d}</b> cm.` });
    }
    if (lv === 2) {
      const t = R.int(0, 2);
      if (t === 0) { const a = R.int(3, 30); return mk({ text: `Một hình vuông có chu vi ${4 * a} cm. Hỏi cạnh hình vuông dài bao nhiêu xăng-ti-mét?`, answer: a, solution: `Cạnh = chu vi : 4 = ${4 * a} : 4 = <b>${a}</b> cm.` }); }
      if (t === 1) { const b = R.int(3, 20), a = b + R.int(2, 20), askA = R.chance(0.5); return mk({ text: `Một hình chữ nhật có chu vi ${2 * (a + b)} cm, chiều ${askA ? 'rộng' : 'dài'} ${askA ? b : a} cm. Hỏi chiều ${askA ? 'dài' : 'rộng'} là bao nhiêu xăng-ti-mét?`, answer: askA ? a : b, solution: `Nửa chu vi (dài + rộng): ${2 * (a + b)} : 2 = ${a + b} cm. Chiều ${askA ? 'dài' : 'rộng'}: ${a + b} − ${askA ? b : a} = <b>${askA ? a : b}</b> cm.` }); }
      const b = R.int(3, 15), k = R.int(2, 4);
      return mk({ text: `Một hình chữ nhật có chiều rộng ${b} cm, chiều dài gấp ${k} lần chiều rộng. Tính chu vi hình chữ nhật đó (đơn vị xăng-ti-mét).`, answer: 2 * (b * k + b), solution: `Chiều dài: ${b} × ${k} = ${b * k} cm. Chu vi: (${b * k} + ${b}) × 2 = <b>${2 * (b * k + b)}</b> cm.` });
    }
    const t = R.int(0, 2);
    if (t === 0) { const k = R.int(2, 5), a = R.int(2, 9); return mk({ text: `Ghép ${k} hình vuông bằng nhau, mỗi hình có cạnh ${a} cm, thành một hàng ngang để được một hình chữ nhật. Tính chu vi hình chữ nhật đó (đơn vị xăng-ti-mét).`, visual: svgGrid(1, k), answer: 2 * (k * a + a), solution: `Chiều dài: ${a} × ${k} = ${k * a} cm, chiều rộng: ${a} cm. Chu vi: (${k * a} + ${a}) × 2 = <b>${2 * (k * a + a)}</b> cm.` }); }
    if (t === 1) { const h = R.int(2, 10), a = 2 * h; return mk({ text: `Cắt một hình vuông cạnh ${a} cm thành hai hình chữ nhật bằng nhau. Tính chu vi mỗi hình chữ nhật (đơn vị xăng-ti-mét).`, visual: svgRectLines(1, 0), answer: 2 * (a + h), solution: `Mỗi hình chữ nhật có chiều dài ${a} cm, chiều rộng ${a} : 2 = ${h} cm. Chu vi: (${a} + ${h}) × 2 = <b>${2 * (a + h)}</b> cm.` }); }
    const b = R.int(3, 20), a = b + 2 * R.int(1, 10);
    return mk({ text: `Một hình vuông có chu vi bằng chu vi hình chữ nhật dài ${a} cm, rộng ${b} cm. Tính cạnh hình vuông (đơn vị xăng-ti-mét).`, answer: (a + b) / 2, solution: `Chu vi hình chữ nhật: (${a} + ${b}) × 2 = ${2 * (a + b)} cm. Cạnh hình vuông: ${2 * (a + b)} : 4 = <b>${(a + b) / 2}</b> cm.` });
  }

  function geoArea(R, lv) {
    if (lv === 1) {
      if (R.chance(0.5)) { const b = R.int(2, 9), a = b + R.int(1, 8); return mk({ text: `Tính diện tích hình chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm (đơn vị xăng-ti-mét vuông).`, visual: svgRect(a, b), answer: a * b, solution: `Diện tích hình chữ nhật = dài × rộng = ${a} × ${b} = <b>${a * b}</b> cm².` }); }
      const a = R.int(2, 10); return mk({ text: `Tính diện tích hình vuông có cạnh ${a} cm (đơn vị xăng-ti-mét vuông).`, visual: svgRect(a, a, 'cm', true), answer: a * a, solution: `Diện tích hình vuông = cạnh × cạnh = ${a} × ${a} = <b>${a * a}</b> cm².` });
    }
    if (lv === 2) {
      const t = R.int(0, 2);
      if (t === 0) { const a = R.int(2, 12); return mk({ text: `Một hình vuông có chu vi ${4 * a} cm. Tính diện tích hình vuông đó (đơn vị xăng-ti-mét vuông).`, answer: a * a, solution: `Cạnh hình vuông: ${4 * a} : 4 = ${a} cm. Diện tích: ${a} × ${a} = <b>${a * a}</b> cm².` }); }
      if (t === 1) { const b = R.int(2, 9), a = b + R.int(1, 10); return mk({ text: `Một hình chữ nhật có chu vi ${2 * (a + b)} cm, chiều rộng ${b} cm. Tính diện tích hình chữ nhật đó (đơn vị xăng-ti-mét vuông).`, answer: a * b, solution: `Nửa chu vi: ${2 * (a + b)} : 2 = ${a + b} cm. Chiều dài: ${a + b} − ${b} = ${a} cm. Diện tích: ${a} × ${b} = <b>${a * b}</b> cm².` }); }
      const b = R.int(2, 9), k = R.int(2, 4);
      return mk({ text: `Một hình chữ nhật có chiều rộng ${b} cm, chiều dài gấp ${k} lần chiều rộng. Tính diện tích hình chữ nhật đó (đơn vị xăng-ti-mét vuông).`, answer: b * b * k, solution: `Chiều dài: ${b} × ${k} = ${b * k} cm. Diện tích: ${b * k} × ${b} = <b>${b * b * k}</b> cm².` });
    }
    const t = R.int(0, 2);
    if (t === 0) { const W = R.int(6, 12), H = R.int(5, 10), w = R.int(2, W - 3), h = R.int(2, H - 2); return mk({ text: 'Tính diện tích hình bên (đơn vị xăng-ti-mét vuông). Các góc của hình đều là góc vuông.', visual: svgLShape(W, H, w, h), answer: W * H - w * h, solution: `Bù thêm phần khuyết thì được hình chữ nhật ${W} cm × ${H} cm, diện tích ${W} × ${H} = ${W * H} cm². Phần khuyết là hình chữ nhật ${W} − ${W - w} = ${w} cm và ${H} − ${H - h} = ${h} cm, diện tích ${w} × ${h} = ${w * h} cm². Diện tích hình: ${W * H} − ${w * h} = <b>${W * H - w * h}</b> cm².` }); }
    if (t === 1) { const a = R.int(5, 12), b = R.int(2, a - 2); return mk({ text: `Một hình vuông cạnh ${a} cm được chia thành hai hình chữ nhật. Một hình chữ nhật có chiều rộng ${b} cm. Tính diện tích hình chữ nhật còn lại (đơn vị xăng-ti-mét vuông).`, visual: svgRectLines(1, 0), answer: a * (a - b), solution: `Hình chữ nhật còn lại có chiều dài ${a} cm, chiều rộng ${a} − ${b} = ${a - b} cm. Diện tích: ${a} × ${a - b} = <b>${a * (a - b)}</b> cm².` }); }
    const b = R.int(3, 12), d = R.int(1, 8), a = b + d;
    return mk({ text: `Một hình chữ nhật có chu vi ${2 * (a + b)} cm, chiều dài hơn chiều rộng ${d} cm. Tính diện tích hình chữ nhật đó (đơn vị xăng-ti-mét vuông).`, answer: a * b, solution: `Nửa chu vi (dài + rộng): ${a + b} cm. Chiều rộng: (${a + b} − ${d}) : 2 = ${b} cm, chiều dài: ${b} + ${d} = ${a} cm. Diện tích: ${a} × ${b} = <b>${a * b}</b> cm².` });
  }

  function geoCount(R, lv) {
    const sq = (r, c) => { const p = []; for (let k = 1; k <= Math.min(r, c); k++) p.push([k, (r - k + 1) * (c - k + 1)]); return p; };
    const squares = (r, c) => { const p = sq(r, c), a = sum(p.map(x => x[1])); return mk({ text: 'Hình bên có tất cả bao nhiêu hình vuông?', visual: svgGrid(r, c), answer: a, solution: p.map(([k, v]) => `Hình vuông ${k}×${k} ô: ${v}`).join('; ') + `. Tổng: <b>${a}</b> hình vuông.` }); };
    const rects = (r, c) => { const a = C2(c + 1) * C2(r + 1); return mk({ text: 'Hình bên có tất cả bao nhiêu hình chữ nhật? (Hình vuông cũng là hình chữ nhật)', visual: svgGrid(r, c), answer: a, solution: r === 1 ? `Hình gồm 1 ô: ${c}; gồm 2 ô: ${c - 1}; ...; gồm ${c} ô: 1. Tổng: ${range(1, c).reverse().join(' + ')} = <b>${a}</b>.` : `Theo chiều ngang, hình chữ nhật chiếm một số cột liền nhau trong ${c} cột: ${range(1, c).reverse().join(' + ')} = ${C2(c + 1)} cách. Theo chiều dọc, chiếm một số hàng liền nhau trong ${r} hàng: ${range(1, r).reverse().join(' + ')} = ${C2(r + 1)} cách. Số hình chữ nhật: ${C2(c + 1)} × ${C2(r + 1)} = <b>${a}</b>.` }); };
    const fan = n => { const a = C2(n), s = n - 1; return mk({ text: 'Hình bên có bao nhiêu hình tam giác?', visual: svgFan(n, 1), answer: a, solution: `Có ${s} tam giác đơn. ` + range(2, s).map(k => `Ghép ${k} tam giác liền nhau: ${s - k + 1}. `).join('') + `Tổng: ${range(1, s).reverse().join(' + ')} = <b>${a}</b> tam giác.` }); };
    if (lv === 1) return R.pick([() => squares(2, 2), () => squares(2, 3), () => fan(3), () => fan(4), () => rects(1, 3)])();
    if (lv === 2) return R.pick([() => rects(1, R.int(4, 5)), () => squares(3, 3), () => rects(2, 2), () => fan(5), () => squares(2, 4)])();
    return R.pick([
      () => rects(2, R.int(3, 4)), () => rects(3, 3), () => squares(3, 4), () => squares(4, 4),
      () => { const n = R.int(3, 4), a = 2 * C2(n); return mk({ text: 'Hình bên có bao nhiêu hình tam giác?', visual: svgFan(n, 2), answer: a, solution: `Các tam giác có cạnh đáy là đường ngang ở giữa: ${C2(n)}. Các tam giác có cạnh đáy là đáy lớn: ${C2(n)}. Tổng: ${C2(n)} + ${C2(n)} = <b>${a}</b>.` }); },
    ])();
  }

  function geoUnits(R, lv) {
    if (lv === 0) {
      if (R.chance(0.5)) {
        const [u, v, k] = R.pick([['m', 'cm', 100], ['kg', 'g', 1000], ['l', 'ml', 1000], ['km', 'm', 1000], ['cm', 'mm', 10]]), n = R.int(1, 5);
        return mk({ text: `Điền số thích hợp vào ô trống:<div class="seq">${n} ${u} = ${box} ${v}</div>`, answer: n * k, solution: `1 ${u} = ${fmt(k)} ${v}, nên ${n} ${u} = ${fmt(k)} × ${n} = <b>${fmt(n * k)}</b> ${v}.` });
      }
      const [it, ans, pool] = R.pick([['Chiếc bút chì dài khoảng 15 ...', 'cm', ['m', 'km', 'mm']], ['Cột cờ ở sân trường cao khoảng 10 ...', 'm', ['cm', 'km', 'mm']], ['Quãng đường từ Hà Nội đến Hải Phòng dài khoảng 100 ...', 'km', ['m', 'cm', 'mm']], ['Một quả trứng gà nặng khoảng 50 ...', 'g', ['kg']], ['Một bao gạo nặng khoảng 25 ...', 'kg', ['g']], ['Một chai nước khoáng nhỏ chứa khoảng 500 ...', 'ml', ['l']], ['Con kiến dài khoảng 5 ...', 'mm', ['cm', 'm', 'km']]]);
      return mk({ type: 'choice', choices: R.shuffle([ans].concat(pool)), text: `Chọn đơn vị thích hợp:<div class="seq">${it}</div>`, answer: ans, solution: `Đơn vị thích hợp là <b>${ans}</b>.` });
    }
    if (lv === 1) {
      const t = R.int(0, 3);
      if (t === 0) { const a = R.int(1, 9), b = R.int(1, 99); return mk({ text: `Điền số thích hợp vào ô trống:<div class="seq">${a} m ${b} cm = ${box} cm</div>`, answer: a * 100 + b, solution: `${a} m = ${a * 100} cm. ${a * 100} + ${b} = <b>${a * 100 + b}</b> cm.` }); }
      if (t === 1) { const [u, v] = R.pick([['kg', 'g'], ['km', 'm'], ['l', 'ml']]), a = R.int(1, 9), b = R.int(5, 999); return mk({ text: `Điền số thích hợp vào ô trống:<div class="seq">${a} ${u} ${b} ${v} = ${box} ${v}</div>`, answer: a * 1000 + b, solution: `${a} ${u} = ${fmt(a * 1000)} ${v}. ${fmt(a * 1000)} + ${b} = <b>${fmt(a * 1000 + b)}</b> ${v}.` }); }
      if (t === 2) { const a = R.int(1, 20), b = R.int(1, 9); return mk({ text: `Điền số thích hợp vào ô trống:<div class="seq">${a} cm ${b} mm = ${box} mm</div>`, answer: a * 10 + b, solution: `${a} cm = ${a * 10} mm. ${a * 10} + ${b} = <b>${a * 10 + b}</b> mm.` }); }
      const a = R.int(15, 28), b = R.int(2, 9), up = R.chance(0.5);
      return mk({ text: `Nhiệt độ buổi sáng là ${a}°C. Đến trưa, nhiệt độ ${up ? 'tăng thêm' : 'giảm đi'} ${b}°C. Hỏi nhiệt độ buổi trưa là bao nhiêu độ C?`, answer: up ? a + b : a - b, solution: `${a} ${up ? '+' : '−'} ${b} = <b>${up ? a + b : a - b}</b>°C.` });
    }
    if (lv === 2) {
      const t = R.pick([
        () => { const a = R.int(2, 5), b = 100 * R.int(1, 9), c = 100 * R.int(5, 9); return mk({ text: `Tính:<div class="seq">${a} kg ${b} g − ${c} g = ? g</div>`, answer: a * 1000 + b - c, solution: `${a} kg ${b} g = ${fmt(a * 1000 + b)} g. ${fmt(a * 1000 + b)} − ${c} = <b>${fmt(a * 1000 + b - c)}</b> g.` }); },
        () => { const a = R.int(2, 9), c = R.int(15, 95); return mk({ text: `Tính:<div class="seq">${a} m − ${c} cm = ? cm</div>`, answer: a * 100 - c, solution: `${a} m = ${a * 100} cm. ${a * 100} − ${c} = <b>${a * 100 - c}</b> cm.` }); },
        () => { const c = 50 * R.int(2, 19); return mk({ text: `Tính:<div class="seq">1 l − ${c} ml = ? ml</div>`, answer: 1000 - c, solution: `1 l = 1.000 ml. 1.000 − ${c} = <b>${1000 - c}</b> ml.` }); },
        () => { const c = 50 * R.int(2, 9), k = R.int(2, 6); return mk({ text: `Tính:<div class="seq">${c} g × ${k} = ? g</div>`, answer: c * k, solution: `${c} × ${k} = <b>${fmt(c * k)}</b> g.` }); },
        () => { const c = 50 * R.int(2, 19), a = R.int(1, 4); return mk({ text: `Tính:<div class="seq">${a} km − ${c} m = ? m</div>`, answer: a * 1000 - c, solution: `${a} km = ${fmt(a * 1000)} m. ${fmt(a * 1000)} − ${c} = <b>${fmt(a * 1000 - c)}</b> m.` }); },
      ]);
      return t();
    }
    const t = R.pick([
      () => { const [w, p] = R.pick([[2, 250], [3, 250], [2, 500], [3, 500], [4, 500], [1, 125], [2, 200], [3, 200]]); return mk({ text: `Có ${w} kg đường, chia đều vào các túi, mỗi túi ${p} g. Hỏi được bao nhiêu túi đường?`, answer: w * 1000 / p, solution: `${w} kg = ${fmt(w * 1000)} g. Số túi: ${fmt(w * 1000)} : ${p} = <b>${w * 1000 / p}</b> túi.` }); },
      () => { const [w, p] = R.pick([[2, 250], [1, 250], [3, 250], [2, 200], [1, 200], [2, 500]]); return mk({ text: `Một bình có ${w} l nước, rót đều vào các cốc, mỗi cốc ${p} ml. Hỏi rót được bao nhiêu cốc?`, answer: w * 1000 / p, solution: `${w} l = ${fmt(w * 1000)} ml. Số cốc: ${fmt(w * 1000)} : ${p} = <b>${w * 1000 / p}</b> cốc.` }); },
      () => { const L = R.int(2, 5), a = R.int(1, L - 1), b = 50 * R.int(1, 19); return mk({ text: `Quãng đường từ nhà ${R.pick(NAMES)} đến trường dài ${L} km. Bạn ấy đã đi được ${a} km ${b} m. Hỏi còn phải đi bao nhiêu mét nữa?`, answer: L * 1000 - a * 1000 - b, solution: `${L} km = ${fmt(L * 1000)} m; ${a} km ${b} m = ${fmt(a * 1000 + b)} m. Còn: ${fmt(L * 1000)} − ${fmt(a * 1000 + b)} = <b>${fmt(L * 1000 - a * 1000 - b)}</b> m.` }); },
      () => { const W = R.pick([20, 25, 30, 50]), k = R.int(2, 4), a = R.int(1, 3), b = 100 * R.int(1, 9), out = k * (a * 1000 + b); return mk({ text: `Một bao gạo nặng ${W} kg. Người ta lấy ra ${k} lần, mỗi lần ${a} kg ${b} g. Hỏi bao còn lại bao nhiêu gam gạo?`, answer: W * 1000 - out, solution: `Mỗi lần lấy ${fmt(a * 1000 + b)} g, ${k} lần lấy ${fmt(a * 1000 + b)} × ${k} = ${fmt(out)} g. ${W} kg = ${fmt(W * 1000)} g. Còn lại: ${fmt(W * 1000)} − ${fmt(out)} = <b>${fmt(W * 1000 - out)}</b> g.` }); },
    ]);
    return t();
  }

  function geoClock(R, lv) {
    const h = R.int(1, 11);
    if (lv === 0) {
      const m = R.pick([0, 30]), ans = hm(h, m), nx = h % 12 + 1;
      return mk({ type: 'choice', choices: choicesOf(R, ans, [hm(nx, m), hm(h, 30 - m), hm(nx, 30 - m), hm((h + 10) % 12 + 1, m)]), text: 'Đồng hồ chỉ mấy giờ?', visual: svgClock(h, m), answer: ans, solution: m ? `Kim dài chỉ số 6 là 30 phút, kim ngắn ở giữa số ${h} và số ${nx}: <b>${ans}</b>.` : `Kim dài chỉ số 12, kim ngắn chỉ số ${h}: <b>${ans}</b>.` });
    }
    if (lv === 1) {
      const m = 5 * R.int(1, 11);
      if (R.chance(0.3)) return mk({ text: `Kim phút (kim dài) chỉ vào số ${m / 5}. Hỏi đó là bao nhiêu phút?`, visual: svgClock(h, m), answer: m, solution: `Mỗi số trên mặt đồng hồ ứng với 5 phút: ${m / 5} × 5 = <b>${m}</b> phút.` });
      const ans = hm(h, m), pool = [hm(h, (m + 5) % 60 || 5), hm(h, m - 5 || 55), hm(h % 12 + 1, m), hm(m / 5, (h * 5) % 60)];
      return mk({ type: 'choice', choices: choicesOf(R, ans, pool.filter(x => x !== ans)), text: 'Đồng hồ chỉ mấy giờ?', visual: svgClock(h, m), answer: ans, solution: `Kim ngắn đã qua số ${h}, kim dài chỉ số ${m / 5} là ${m / 5} × 5 = ${m} phút: <b>${ans}</b>.` });
    }
    if (lv === 2) {
      if (R.chance(0.5)) {
        const m = 5 * R.int(8, 11), nx = h % 12 + 1, ans = `${nx} giờ kém ${60 - m} phút`;
        return mk({ type: 'choice', choices: choicesOf(R, ans, [`${h} giờ kém ${60 - m} phút`, `${nx} giờ kém ${m} phút`, `${nx} giờ ${60 - m} phút`, `${h} giờ kém ${m} phút`]), text: 'Đồng hồ chỉ mấy giờ? (đọc theo cách “kém”)', visual: svgClock(h, m), answer: ans, solution: `Đồng hồ chỉ ${h} giờ ${m} phút. Còn ${60 - m} phút nữa là đến ${nx} giờ, nên đọc là <b>${ans}</b>.` });
      }
      const s = 60 * R.int(6, 10) + 5 * R.int(0, 11), d = 5 * R.int(3, 10), e = s + d;
      return mk({ type: 'choice', choices: choicesOf(R, tl(e), [tl(e + 5), tl(e - 5), tl(e + 60), tl(e - 10)]), text: `${R.pick(NAMES)} bắt đầu làm bài lúc ${tl(s)} và làm trong ${d} phút. Hỏi bạn ấy làm xong lúc mấy giờ?`, answer: tl(e), solution: `${tl(s)} thêm ${d} phút${s % 60 + d >= 60 ? ` (đủ 60 phút thì thành 1 giờ)` : ''}: <b>${tl(e)}</b>.` });
    }
    const t = R.int(0, 2);
    if (t === 0) { const s = 60 * R.int(6, 9) + R.int(0, 59), d = R.int(20, 150), e = s + d; return mk({ text: `Một chuyến xe khởi hành lúc ${tl(s)} và đến nơi lúc ${tl(e)} cùng ngày. Hỏi chuyến xe đi hết bao nhiêu phút?`, answer: d, solution: `Từ ${tl(s)} đến ${tl(e)}: ${d >= 60 ? `${Math.floor(d / 60)} giờ ${d % 60} phút = ${Math.floor(d / 60)} × 60 + ${d % 60}` : d} = <b>${d}</b> phút.` }); }
    if (t === 1) { const s = 60 * R.int(6, 9) + 5 * R.int(0, 11), L = 60 + 5 * R.int(1, 11), e = s + L; return mk({ type: 'choice', choices: choicesOf(R, tl(e), [tl(e + 5), tl(e - 60), tl(e + 10), tl(e - 5)]), text: `Một bộ phim dài 1 giờ ${L - 60} phút, bắt đầu chiếu lúc ${tl(s)} tối. Hỏi bộ phim kết thúc lúc mấy giờ?`, answer: tl(e), solution: `${tl(s)} thêm 1 giờ là ${tl(s + 60)}, thêm tiếp ${L - 60} phút là <b>${tl(e)}</b>.` }); }
    const m = 5 * R.int(0, 11), add = 5 * R.int(5, 20), k = ((m + add) / 5) % 12 || 12;
    return mk({ text: `Đồng hồ đang chỉ như hình bên. Hỏi sau ${add} phút nữa kim phút (kim dài) chỉ vào số mấy?`, visual: svgClock(h, m), answer: k, solution: `Bây giờ kim phút chỉ ${m === 0 ? 'số 12' : `số ${m / 5}`}. Mỗi số ứng với 5 phút, ${add} phút kim phút đi thêm ${add / 5} số. ${m / 5} + ${add / 5} = ${(m + add) / 5}${(m + add) / 5 > 12 ? `, quá 12 thì bớt 12${(m + add) / 5 > 24 ? ' (hai lần)' : ''}` : ''}: kim phút chỉ số <b>${k}</b>.` });
  }

  function geoMonth(R, lv) {
    if (lv === 1) {
      const t = R.int(0, 2);
      if (t === 0) { const m = R.pick([1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]); return mk({ text: `Tháng ${m} có bao nhiêu ngày?`, answer: DAYS[m], solution: `Các tháng có 31 ngày: 1, 3, 5, 7, 8, 10, 12. Các tháng có 30 ngày: 4, 6, 9, 11. Tháng ${m} có <b>${DAYS[m]}</b> ngày.` }); }
      if (t === 1) { const k = R.chance(0.5); return mk({ text: `Một năm có bao nhiêu tháng có ${k ? 31 : 30} ngày?`, answer: k ? 7 : 4, solution: k ? 'Các tháng 1, 3, 5, 7, 8, 10, 12 có 31 ngày: <b>7</b> tháng.' : 'Các tháng 4, 6, 9, 11 có 30 ngày: <b>4</b> tháng.' }); }
      const k = R.int(2, 9); return mk({ text: `${k} tuần lễ có bao nhiêu ngày?`, answer: 7 * k, solution: `Mỗi tuần có 7 ngày: 7 × ${k} = <b>${7 * k}</b> ngày.` });
    }
    if (lv === 2) {
      const t = R.int(0, 2);
      if (t === 0) { const m = R.int(1, 11), L = DAYS[m], d = R.int(L - 10, L), k = R.int(L - d + 1, L - d + 15); return mk({ text: `Hôm nay là ngày ${d} tháng ${m}. Hỏi ${k} ngày nữa là ngày bao nhiêu của tháng ${m + 1}?${m === 2 ? ' (Tháng 2 năm nay có 28 ngày)' : ''}`, answer: d + k - L, solution: `Tháng ${m} có ${L} ngày. Từ ngày ${d} đến hết tháng ${m} là ${L - d} ngày. Còn ${k} − ${L - d} = ${d + k - L} ngày nữa, nên đó là ngày <b>${d + k - L}</b> tháng ${m + 1}.` }); }
      if (t === 1) { const m = R.int(3, 11), L = DAYS[m], d1 = R.int(10, L), d2 = R.int(1, 20); return mk({ text: `Từ ngày ${d1} tháng ${m} đến hết ngày ${d2} tháng ${m + 1} có tất cả bao nhiêu ngày (tính cả hai ngày đó)?`, answer: L - d1 + 1 + d2, solution: `Tháng ${m} có ${L} ngày. Từ ngày ${d1} đến ngày ${L} tháng ${m}: ${L} − ${d1} + 1 = ${L - d1 + 1} ngày. Thêm ${d2} ngày của tháng ${m + 1}: ${L - d1 + 1} + ${d2} = <b>${L - d1 + 1 + d2}</b> ngày.` }); }
      const m = R.int(1, 10), s = DAYS[m] + DAYS[m + 1] + DAYS[m + 2];
      return mk({ text: `Ba tháng ${m}, ${m + 1} và ${m + 2} có tất cả bao nhiêu ngày?${m <= 2 ? ' (Tháng 2 năm nay có 28 ngày)' : ''}`, answer: s, solution: `${DAYS[m]} + ${DAYS[m + 1]} + ${DAYS[m + 2]} = <b>${s}</b> ngày.` });
    }
    if (R.chance(0.5)) {
      const m1 = R.int(1, 9), m2 = R.int(m1 + 1, Math.min(12, m1 + 3)), d1 = R.int(1, DAYS[m1]), d2 = R.int(1, DAYS[m2]), k = doy(d2, m2) - doy(d1, m1);
      const parts = [`${DAYS[m1] - d1} ngày (đến hết tháng ${m1})`].concat(range(m1 + 1, m2 - 1).map(m => `${DAYS[m]} ngày (tháng ${m})`), [`${d2} ngày (tháng ${m2})`]);
      return mk({ text: `Ngày ${d2} tháng ${m2} cách ngày ${d1} tháng ${m1} (cùng một năm) bao nhiêu ngày?${m1 <= 2 && m2 > 2 ? ' (Tháng 2 năm đó có 28 ngày)' : ''}`, answer: k, solution: `Đếm từ ngày ${d1}/${m1}: ${parts.join(' + ')}. Tổng: ${[DAYS[m1] - d1].concat(range(m1 + 1, m2 - 1).map(m => DAYS[m]), [d2]).join(' + ')} = <b>${k}</b> ngày.` });
    }
    const N = R.int(40, 200); let m = 1; while (doy(DAYS[m], m) < N) m++;
    const d = N - doy(0, m), ans = `Ngày ${d} tháng ${m}`;
    const pool = [`Ngày ${d + 1} tháng ${m}`, `Ngày ${d - 1 || 2} tháng ${m}`, `Ngày ${d} tháng ${m + 1}`, `Ngày ${d} tháng ${m - 1}`].filter(x => x !== ans);
    return mk({ type: 'choice', choices: choicesOf(R, ans, pool), text: `Ngày thứ ${N} của năm là ngày nào? (Năm đó tháng 2 có 28 ngày)`, answer: ans, solution: `Cộng dồn số ngày các tháng: ${range(1, m - 1).map(k => DAYS[k]).join(' + ')} = ${doy(0, m)} ngày (hết tháng ${m - 1}). ${N} − ${doy(0, m)} = ${d}. Vậy đó là <b>${ans.toLowerCase()}</b>.` });
  }

  function geoTile(R, lv) {
    if (lv === 1) {
      const c = R.int(2, 5), p = R.int(2, 5), q = R.int(2, 4);
      if (R.chance(0.5)) return mk({ text: `Một tấm bìa hình chữ nhật dài ${p * c} cm, rộng ${q * c} cm được cắt thành các hình vuông cạnh ${c} cm (vừa hết). Hỏi được bao nhiêu hình vuông?`, visual: svgRect(p * c, q * c), answer: p * q, solution: `Theo chiều dài cắt được ${p * c} : ${c} = ${p} hình, theo chiều rộng ${q * c} : ${c} = ${q} hàng. Số hình vuông: ${p} × ${q} = <b>${p * q}</b>.` });
      const k = R.int(2, 6), a = R.int(2, 9);
      return mk({ text: `Ghép ${k} hình vuông cạnh ${a} cm thành một hàng ngang để được một hình chữ nhật. Hỏi chiều dài hình chữ nhật là bao nhiêu xăng-ti-mét?`, visual: svgGrid(1, k), answer: k * a, solution: `Chiều dài gồm ${k} cạnh hình vuông: ${a} × ${k} = <b>${k * a}</b> cm.` });
    }
    if (lv === 2) {
      const t = R.int(0, 2);
      if (t === 0) { const c = R.int(2, 5), p = R.int(4, 9), q = R.int(3, 7); return mk({ text: `Cần bao nhiêu viên gạch hình vuông cạnh ${c * 10} cm để lát kín một nền nhà hình chữ nhật dài ${p * c * 10} cm, rộng ${q * c * 10} cm (không cắt gạch)?`, answer: p * q, solution: `Mỗi hàng lát ${p * c * 10} : ${c * 10} = ${p} viên, có ${q * c * 10} : ${c * 10} = ${q} hàng. Số viên gạch: ${p} × ${q} = <b>${p * q}</b>.` }); }
      if (t === 1) { const n = R.int(3, 9); return mk({ text: `Xếp các ô vuông nhỏ thành một hình vuông lớn, mỗi cạnh có ${n} ô. Hỏi cần tất cả bao nhiêu ô vuông nhỏ?`, answer: n * n, solution: `Có ${n} hàng, mỗi hàng ${n} ô: ${n} × ${n} = <b>${n * n}</b> ô.` }); }
      const a = R.int(2, 9), k = R.int(2, 4);
      return mk({ text: `Ghép ${k * k} hình vuông nhỏ cạnh ${a} cm thành một hình vuông lớn (${k} hàng, mỗi hàng ${k} hình). Tính chu vi hình vuông lớn (đơn vị xăng-ti-mét).`, visual: svgGrid(k, k), answer: 4 * k * a, solution: `Cạnh hình vuông lớn: ${a} × ${k} = ${k * a} cm. Chu vi: ${k * a} × 4 = <b>${4 * k * a}</b> cm.` });
    }
    const t = R.int(0, 2);
    if (t === 0) { const n = R.int(4, 10); return mk({ text: `Một hình vuông lớn được ghép từ các ô vuông nhỏ, mỗi cạnh có ${n} ô. Hỏi có bao nhiêu ô vuông nhỏ nằm sát viền ngoài của hình vuông lớn?`, answer: 4 * n - 4, solution: `Mỗi cạnh có ${n} ô, 4 cạnh là ${n} × 4 = ${4 * n} ô, nhưng 4 ô ở góc được đếm 2 lần. Số ô ở viền: ${4 * n} − 4 = <b>${4 * n - 4}</b>. (Cách khác: tất cả ${n * n} ô, bớt ${n - 2} × ${n - 2} = ${(n - 2) * (n - 2)} ô bên trong.)` }); }
    if (t === 1) {
      const cols = R.int(3, 4), hs = range(1, cols).map(() => R.int(1, 4)), s = Math.max(cols, ...hs), total = sum(hs);
      return mk({ text: `Hình bên được ghép từ các ô vuông nhỏ. Cần ghép thêm ít nhất bao nhiêu ô vuông nhỏ nữa để được một hình vuông?`, visual: svgBars(hs), answer: s * s - total, solution: `Hình đang rộng ${cols} ô, cao ${Math.max(...hs)} ô, nên hình vuông bé nhất chứa được nó có cạnh ${s} ô, gồm ${s} × ${s} = ${s * s} ô. Đang có ${hs.join(' + ')} = ${total} ô. Cần thêm: ${s * s} − ${total} = <b>${s * s - total}</b> ô.` });
    }
    const a = R.int(2, 9);
    return mk({ text: `Có 4 hình vuông nhỏ, mỗi hình có cạnh ${a} cm. Ghép 4 hình đó thành một hình vuông lớn. Hỏi tổng chu vi 4 hình vuông nhỏ hơn chu vi hình vuông lớn bao nhiêu xăng-ti-mét?`, visual: svgGrid(2, 2), answer: 8 * a, solution: `Tổng chu vi 4 hình nhỏ: ${a} × 4 × 4 = ${16 * a} cm. Hình lớn có cạnh ${2 * a} cm, chu vi ${2 * a} × 4 = ${8 * a} cm. Hơn nhau: ${16 * a} − ${8 * a} = <b>${8 * a}</b> cm.` });
  }

  // =====================================================================
  // TỔ HỢP
  // =====================================================================
  function combOutfit0(R) {
    const [a, b] = R.pick([[1, 2], [1, 3], [2, 2], [2, 3], [3, 2]]);
    const shirts = ['áo đỏ', 'áo xanh', 'áo vàng'].slice(0, a), pants = ['quần đen', 'quần trắng', 'quần nâu'].slice(0, b), list = [];
    shirts.forEach(s => pants.forEach(p => list.push(`${s} – ${p}`)));
    return mk({ text: `${R.pick(NAMES)} có ${a} cái áo 👕 (${shirts.join(', ')}) và ${b} cái quần 👖 (${pants.join(', ')}). Có mấy cách chọn một bộ gồm 1 áo và 1 quần?`, answer: a * b, solution: `Các bộ: ${list.join('; ')}. Có <b>${a * b}</b> cách (mỗi áo đi với ${b} quần: ${Array(a).fill(b).join(' + ')} = ${a * b}).` });
  }

  function combOr0(R) {
    const [x, y, n1, n2] = R.pick([['🍦', '🍧', 'loại kem que', 'loại kem ốc'], ['🍬', '🍰', 'loại kẹo', 'loại bánh'], ['📕', '📗', 'quyển truyện tranh', 'quyển truyện cổ tích'], ['🎈', '🪀', 'quả bóng bay', 'con quay']]);
    const a = R.int(2, 5), b = R.int(2, 5);
    return mk({ text: `Có ${a} ${n1} ${x} khác nhau và ${b} ${n2} ${y} khác nhau. Em được chọn 1 món. Có mấy cách chọn?`, answer: a + b, solution: `Chọn ${n1}: ${a} cách. Chọn ${n2}: ${b} cách. Tất cả: ${a} + ${b} = <b>${a + b}</b> cách.` });
  }

  function combShare(R, lv) {
    const [A, B, C] = R.sample(NAMES, 3);
    if (lv <= 1) {
      const k = lv === 0 ? 1 : R.int(1, 2), n = lv === 0 ? R.int(3, 6) : R.int(6, 12), list = range(k, n - k).map(a => `${A} ${a} – ${B} ${n - a}`);
      return mk({ text: `Chia ${n} cái kẹo cho hai bạn ${A} và ${B}, mỗi bạn được ít nhất ${k} cái. Có bao nhiêu cách chia?`, answer: list.length, solution: `${A} có thể được từ ${k} đến ${n - k} cái, còn lại là của ${B}: ${list.join('; ')}. Có <b>${list.length}</b> cách.` });
    }
    const k = lv === 2 ? 1 : R.pick([0, 2]), n = lv === 2 ? R.int(5, 8) : k === 0 ? R.int(3, 6) : R.int(7, 11);
    const rows = []; let tot = 0;
    for (let a = k; a <= n - 2 * k; a++) { const w = n - a - 2 * k + 1; rows.push(`${A} được ${a}: ${w} cách`); tot += w; }
    const cond = k === 0 ? 'có thể có bạn không được quyển nào' : `mỗi bạn được ít nhất ${k} quyển`;
    return mk({ text: `Chia ${n} quyển vở cho ba bạn ${A}, ${B}, ${C} (${cond}). Có bao nhiêu cách chia?`, answer: tot, solution: `Xét số vở của ${A}, phần còn lại chia cho ${B} và ${C}: ${rows.join('; ')}. Tổng: <b>${tot}</b> cách.` });
  }

  function combArrange(R, lv) {
    const nm = R.sample(NAMES, 5);
    const run = (n, text, cond, how) => {
      const ps = perms(nm.slice(0, n)).filter(cond);
      const listed = ps.length <= 12 ? ` Các cách: ${ps.map(p => p.join(' – ')).join('; ')}.` : '';
      return mk({ text, answer: ps.length, solution: `${how}${listed} Có <b>${ps.length}</b> cách.` });
    };
    const [X, Y] = nm;
    if (lv === 0) return R.pick([
      () => run(2, `Có mấy cách xếp hai bạn ${X} và ${Y} đứng thành một hàng ngang?`, () => true, 'Bạn nào đứng trước cũng được.'),
      () => run(3, `Xếp ba bạn ${nm.slice(0, 3).join(', ')} thành một hàng ngang, ${X} luôn đứng đầu hàng. Có mấy cách xếp?`, p => p[0] === X, `${X} đứng đầu, hai bạn còn lại đổi chỗ cho nhau.`),
    ])();
    if (lv === 1) return R.pick([
      () => run(3, `Có bao nhiêu cách xếp ba bạn ${nm.slice(0, 3).join(', ')} đứng thành một hàng ngang?`, () => true, 'Vị trí đầu có 3 cách chọn, vị trí thứ hai còn 2 cách, vị trí cuối 1 cách: 3 × 2 × 1 = 6.'),
      () => run(3, `Xếp ba bạn ${nm.slice(0, 3).join(', ')} thành một hàng ngang, ${X} luôn đứng ở giữa. Có mấy cách xếp?`, p => p[1] === X, `${X} đứng giữa, hai bạn còn lại đổi chỗ hai đầu.`),
      () => run(3, `Xếp ba bạn ${nm.slice(0, 3).join(', ')} thành một hàng ngang, ${X} không đứng đầu hàng. Có mấy cách xếp?`, p => p[0] !== X, `Có 6 cách xếp ba bạn, trong đó 2 cách ${X} đứng đầu. Còn lại 6 − 2 = 4.`),
    ])();
    if (lv === 2) {
      return R.pick([
        () => run(4, `Có bao nhiêu cách xếp bốn bạn ${nm.slice(0, 4).join(', ')} đứng thành một hàng ngang?`, () => true, 'Vị trí đầu có 4 cách chọn, vị trí thứ hai 3 cách, thứ ba 2 cách, cuối 1 cách: 4 × 3 × 2 × 1 = 24.'),
        () => run(4, `Xếp bốn bạn ${nm.slice(0, 4).join(', ')} thành một hàng ngang, ${X} luôn đứng đầu hàng. Có mấy cách xếp?`, p => p[0] === X, `${X} đứng đầu, ba bạn còn lại xếp vào 3 chỗ: 3 × 2 × 1 = 6.`),
        () => { const n = R.int(4, 6); return mk({ text: `Lớp có ${n} bạn ứng cử. Cần chọn 1 bạn làm lớp trưởng và 1 bạn khác làm lớp phó. Có bao nhiêu cách chọn?`, answer: n * (n - 1), solution: `Chọn lớp trưởng: ${n} cách. Với mỗi cách, chọn lớp phó trong ${n - 1} bạn còn lại. Số cách: ${n} × ${n - 1} = <b>${n * (n - 1)}</b>.` }); },
      ])();
    }
    return R.pick([
      () => run(4, `Xếp bốn bạn ${nm.slice(0, 4).join(', ')} thành một hàng ngang sao cho ${X} và ${Y} luôn đứng cạnh nhau. Có bao nhiêu cách xếp?`, p => Math.abs(p.indexOf(X) - p.indexOf(Y)) === 1, `Coi ${X} và ${Y} là một "nhóm". Xếp nhóm này với 2 bạn còn lại: 3 × 2 × 1 = 6 cách. Trong nhóm, ${X} và ${Y} đổi chỗ được 2 cách: 6 × 2 = 12.`),
      () => run(4, `Xếp bốn bạn ${nm.slice(0, 4).join(', ')} thành một hàng ngang sao cho ${X} không đứng ở hai đầu hàng. Có bao nhiêu cách xếp?`, p => p[0] !== X && p[3] !== X, `${X} chỉ được đứng ở vị trí thứ 2 hoặc thứ 3: 2 cách. Ba bạn còn lại xếp vào 3 chỗ: 3 × 2 × 1 = 6 cách. Số cách: 2 × 6 = 12.`),
      () => run(4, `Xếp bốn bạn ${nm.slice(0, 4).join(', ')} thành một hàng ngang sao cho ${X} không đứng đầu hàng. Có bao nhiêu cách xếp?`, p => p[0] !== X, `Có 24 cách xếp bốn bạn, trong đó có 3 × 2 × 1 = 6 cách ${X} đứng đầu. Còn lại: 24 − 6 = 18.`),
      () => run(5, `Xếp năm bạn ${nm.join(', ')} thành một hàng ngang sao cho ${X} đứng đầu và ${Y} đứng cuối hàng. Có bao nhiêu cách xếp?`, p => p[0] === X && p[4] === Y, `${X} đứng đầu, ${Y} đứng cuối, ba bạn còn lại xếp vào 3 chỗ giữa: 3 × 2 × 1 = 6.`),
      () => run(5, `Xếp năm bạn ${nm.join(', ')} thành một hàng ngang sao cho ${X} luôn đứng đầu hàng. Có bao nhiêu cách xếp?`, p => p[0] === X, `${X} đứng đầu, bốn bạn còn lại xếp vào 4 chỗ: 4 × 3 × 2 × 1 = 24.`),
    ])();
  }

  function combHandshake(R, lv) {
    if (lv === 0) {
      const nm = R.sample(NAMES, 3);
      if (R.chance(0.5)) return mk({ text: `Ba bạn ${nm.join(', ')} gặp nhau, mỗi hai bạn bắt tay nhau một lần. Có tất cả bao nhiêu cái bắt tay?`, answer: 3, solution: `Các cặp bắt tay: ${nm[0]} – ${nm[1]}, ${nm[0]} – ${nm[2]}, ${nm[1]} – ${nm[2]}. Có <b>3</b> cái bắt tay.` });
      const n = R.int(3, 4), ans = C2(n);
      return mk({ text: `Có ${n} đội bóng thi đấu, mỗi hai đội đấu với nhau đúng một trận. Có tất cả bao nhiêu trận đấu?`, answer: ans, solution: `Đội thứ nhất đấu với ${n - 1} đội còn lại, đội thứ hai đấu thêm ${n - 2} trận nữa, ...: ${range(1, n - 1).reverse().join(' + ')} = <b>${ans}</b> trận.` });
    }
    if (lv === 1 || lv === 2) {
      const n = lv === 1 ? R.int(4, 6) : R.int(5, 9);
      if (lv === 2 && R.chance(0.4)) return mk({ text: `Có ${n} đội bóng thi đấu vòng tròn hai lượt (mỗi hai đội gặp nhau hai trận: lượt đi và lượt về). Có tất cả bao nhiêu trận đấu?`, answer: n * (n - 1), solution: `Mỗi lượt có ${range(1, n - 1).reverse().join(' + ')} = ${C2(n)} trận. Hai lượt: ${C2(n)} × 2 = <b>${n * (n - 1)}</b> trận.` });
      const [what, unit, who] = R.pick([['bạn gặp nhau, mỗi hai bạn bắt tay nhau một lần', 'cái bắt tay', 'bạn'], ['đội bóng thi đấu vòng tròn một lượt (mỗi hai đội gặp nhau một trận)', 'trận đấu', 'đội'], ['bạn chơi cờ, mỗi hai bạn đấu với nhau một ván', 'ván cờ', 'bạn']]);
      return mk({ text: `Có ${n} ${what}. Có tất cả bao nhiêu ${unit}?`, answer: C2(n), solution: `${cap(who)} thứ nhất với ${n - 1} ${who} còn lại; ${who} thứ hai thêm ${n - 2} (không tính lại với ${who} thứ nhất); ... Tổng: ${range(1, n - 1).reverse().join(' + ')} = <b>${C2(n)}</b> ${unit}.` });
    }
    const t = R.int(0, 2), n = R.int(5, 10);
    if (t === 0) return mk({ text: `Trong một giải bóng đá, mỗi hai đội gặp nhau đúng một trận. Cả giải có tất cả ${C2(n)} trận. Hỏi có bao nhiêu đội tham gia?`, answer: n, solution: `Thử: với k đội thì số trận là 1 + 2 + ... + (k − 1). ${range(1, n - 1).join(' + ')} = ${C2(n)}, nên có <b>${n}</b> đội.` });
    if (t === 1) { const m = R.int(4, 8); return mk({ text: `Trong một nhóm bạn, mỗi bạn gửi cho mỗi bạn khác trong nhóm một tấm thiệp. Cả nhóm gửi tất cả ${m * (m - 1)} tấm thiệp. Hỏi nhóm có bao nhiêu bạn?`, answer: m, solution: `Nếu nhóm có k bạn thì mỗi bạn gửi (k − 1) tấm, cả nhóm gửi k × (k − 1) tấm. ${m} × ${m - 1} = ${m * (m - 1)}, nên nhóm có <b>${m}</b> bạn.` }); }
    return mk({ text: `Trên một đường tròn có ${n} điểm. Nối mỗi hai điểm bằng một đoạn thẳng. Có tất cả bao nhiêu đoạn thẳng?`, answer: C2(n), solution: `Từ mỗi điểm kẻ được ${n - 1} đoạn đến các điểm còn lại; ${n} điểm được ${n} × ${n - 1} = ${n * (n - 1)}, nhưng mỗi đoạn được đếm 2 lần (ở hai đầu). Số đoạn: ${n * (n - 1)} : 2 = <b>${C2(n)}</b>.` });
  }

  function combRule(R, lv) {
    const A = R.pick(NAMES);
    if (lv === 1) {
      if (R.chance(0.5)) { const a = R.int(3, 5), b = R.int(2, 4); return mk({ text: `${A} có ${a} cái áo và ${b} cái quần khác nhau. Hỏi ${A} có bao nhiêu cách chọn một bộ gồm 1 áo và 1 quần?`, answer: a * b, solution: `Mỗi áo đi với ${b} quần: ${a} × ${b} = <b>${a * b}</b> cách.` }); }
      const a = R.int(3, 6), b = R.int(2, 5); return mk({ text: `Thực đơn bữa sáng có ${a} món ăn và ${b} loại đồ uống. Mỗi bạn chọn 1 món ăn và 1 đồ uống. Có bao nhiêu cách chọn?`, answer: a * b, solution: `Mỗi món ăn đi với ${b} đồ uống: ${a} × ${b} = <b>${a * b}</b> cách.` });
    }
    if (lv === 2) {
      if (R.chance(0.5)) { const a = R.int(2, 4), b = R.int(2, 3), c = R.int(2, 3); return mk({ text: `${A} có ${a} cái áo, ${b} cái quần và ${c} đôi giày khác nhau. Mỗi bộ gồm 1 áo, 1 quần và 1 đôi giày. Có bao nhiêu cách chọn một bộ?`, answer: a * b * c, solution: `Chọn áo và quần: ${a} × ${b} = ${a * b} cách. Mỗi cách đi với ${c} đôi giày: ${a * b} × ${c} = <b>${a * b * c}</b> cách.` }); }
      const a = R.int(2, 5), b = R.int(2, 5), c = R.int(2, 4); return mk({ text: `Cửa hàng có ${a} loại bút chì và ${b} loại bút bi. ${A} muốn mua 1 cái bút (bút chì hoặc bút bi) và 1 quyển vở trong ${c} loại vở. Có bao nhiêu cách chọn?`, answer: (a + b) * c, solution: `Chọn bút: ${a} + ${b} = ${a + b} cách. Mỗi cách chọn bút đi với ${c} loại vở: ${a + b} × ${c} = <b>${(a + b) * c}</b> cách.` });
    }
    const t = R.int(0, 2), a = R.int(3, 6), b = R.int(3, 6);
    if (t === 0) return mk({ text: `Một nhóm có ${a} bạn nam và ${b} bạn nữ. Cần chọn 1 bạn nam và 1 bạn nữ để đi thi múa đôi. Có bao nhiêu cách chọn?`, answer: a * b, solution: `Mỗi bạn nam ghép được với ${b} bạn nữ: ${a} × ${b} = <b>${a * b}</b> cách.` });
    if (t === 1) return mk({ text: `Một nhóm có ${a} bạn nam và ${b} bạn nữ. Cần chọn 2 bạn cùng là nam hoặc cùng là nữ để làm trực nhật. Có bao nhiêu cách chọn?`, answer: C2(a) + C2(b), solution: `Chọn 2 bạn nam: ${range(1, a - 1).reverse().join(' + ')} = ${C2(a)} cách. Chọn 2 bạn nữ: ${range(1, b - 1).reverse().join(' + ')} = ${C2(b)} cách. Tổng: ${C2(a)} + ${C2(b)} = <b>${C2(a) + C2(b)}</b> cách.` });
    const k = R.int(3, 4);
    return mk({ text: `Có ${k} màu sơn khác nhau. Sơn một lá cờ gồm 3 sọc ngang, mỗi sọc một màu, hai sọc liền nhau phải khác màu. Có bao nhiêu cách sơn?`, answer: k * (k - 1) * (k - 1), solution: `Sọc trên: ${k} cách. Sọc giữa khác sọc trên: ${k - 1} cách. Sọc dưới khác sọc giữa (được trùng sọc trên): ${k - 1} cách. Số cách: ${k} × ${k - 1} × ${k - 1} = <b>${k * (k - 1) * (k - 1)}</b>.` });
  }

  function combRoads(R, lv) {
    if (lv === 1) {
      const a = R.int(2, 3), b = R.int(2, 4);
      return mk({ text: `Từ A đến B có ${a} con đường, từ B đến C có ${b} con đường (như hình). Hỏi có bao nhiêu cách đi từ A đến C (đi qua B)?`, visual: svgRoads([a, b], ['A', 'B', 'C']), answer: a * b, solution: `Mỗi đường từ A đến B nối tiếp được với ${b} đường từ B đến C: ${a} × ${b} = <b>${a * b}</b> cách.` });
    }
    if (lv === 2) {
      if (R.chance(0.5)) { const a = R.int(2, 3), b = R.int(2, 3), c = R.int(2, 3); return mk({ text: `Từ A đến B có ${a} con đường, từ B đến C có ${b} con đường, từ C đến D có ${c} con đường (như hình). Hỏi có bao nhiêu cách đi từ A đến D (đi qua B và C)?`, visual: svgRoads([a, b, c], ['A', 'B', 'C', 'D']), answer: a * b * c, solution: `Từ A đến C: ${a} × ${b} = ${a * b} cách. Mỗi cách lại nối với ${c} đường từ C đến D: ${a * b} × ${c} = <b>${a * b * c}</b> cách.` }); }
      const a = R.int(2, 4), b = R.int(2, 3), c = R.int(1, 3);
      return mk({ text: `Từ nhà đến công viên có ${a} con đường, từ công viên đến trường có ${b} con đường. Ngoài ra còn ${c} con đường đi thẳng từ nhà đến trường (không qua công viên). Hỏi có bao nhiêu cách đi từ nhà đến trường?`, answer: a * b + c, solution: `Đi qua công viên: ${a} × ${b} = ${a * b} cách. Đi thẳng: ${c} cách. Tổng: ${a * b} + ${c} = <b>${a * b + c}</b> cách.` });
    }
    if (R.chance(0.5)) {
      const [r, c] = R.pick([[2, 2], [2, 3], [3, 2], [1, 4], [3, 3], [2, 4]]), ans = C2(r + c) && (function f(x, y) { return x === 0 || y === 0 ? 1 : f(x - 1, y) + f(x, y - 1); })(r, c);
      return mk({ text: `Một bạn đi từ A đến B theo các con phố trong hình, chỉ được đi sang phải hoặc đi lên. Có bao nhiêu cách đi?`, visual: svgStreets(r, c), answer: ans, solution: `Ghi số cách đi đến từng ngã tư: các ngã tư ở hàng dưới cùng và cột bên trái đều chỉ có 1 cách. Mỗi ngã tư khác có số cách bằng tổng số cách của ngã tư bên trái và ngã tư bên dưới nó. Làm lần lượt đến B được <b>${ans}</b> cách.` });
    }
    const a = R.int(2, 4), b = R.int(2, 4);
    return mk({ text: `Từ A đến B có ${a} con đường, từ B đến C có ${b} con đường. Bạn ${R.pick(NAMES)} đi từ A đến C (qua B) rồi quay về A (qua B), đường về không đi lại con đường nào đã đi. Có bao nhiêu cách đi cả đi và về?`, visual: svgRoads([a, b], ['A', 'B', 'C']), answer: a * b * (a - 1) * (b - 1), solution: `Lượt đi: ${a} × ${b} = ${a * b} cách. Lượt về phải chọn đường khác: từ C về B còn ${b - 1} đường, từ B về A còn ${a - 1} đường: ${b - 1} × ${a - 1} = ${(a - 1) * (b - 1)} cách. Cả đi và về: ${a * b} × ${(a - 1) * (b - 1)} = <b>${a * b * (a - 1) * (b - 1)}</b> cách.` });
  }

  function combDigits(R, lv) {
    const make = (ds, rep, cond) => {
      const out = [];
      for (const a of ds) for (const b of ds) for (const c of ds) {
        if (!a) continue;
        if (!rep && (a === b || b === c || a === c)) continue;
        const n = 100 * a + 10 * b + c;
        if (cond(n) && !out.includes(n)) out.push(n);
      }
      return out.sort((x, y) => x - y);
    };
    const group = list => [...new Set(list.map(n => Math.floor(n / 100)))].map(h => `hàng trăm là ${h}: ${list.filter(n => Math.floor(n / 100) === h).join(', ')}`).join('; ');
    for (;;) {
      let ds, rep = false, cond = () => true, cw = '';
      if (lv === 1) ds = R.chance(0.6) ? R.sample(range(1, 9), 3) : R.sample(range(1, 9), 2).concat(0);
      else if (lv === 2) { const k = R.int(0, 2); ds = k === 0 ? R.sample(range(1, 9), 4) : k === 1 ? R.sample(range(1, 9), 3).concat(0) : R.sample(range(1, 9), 2).concat(0); if (k === 2) { [cond, cw] = R.pick([[n => n % 2 === 0, ' và là số chẵn'], [n => n % 2 === 1, ' và là số lẻ']]); } }
      else {
        const k = R.int(0, 1);
        if (k === 0) { ds = R.sample(range(1, 9), 3).concat(0); [cond, cw] = R.pick([[n => n % 2 === 0, ' và là số chẵn'], [n => n % 2 === 1, ' và là số lẻ'], [n => n % 5 === 0, ' và chia hết cho 5']]); }
        else { ds = R.sample(range(1, 9), 2).concat(0); rep = true; }
      }
      const list = make(ds, rep, cond);
      if (list.length < 2 || list.length > 30) continue;
      const sd = ds.slice().sort((a, b) => a - b);
      return mk({
        text: `Từ các chữ số ${sd.join(', ')} có thể lập được bao nhiêu số có ba chữ số${rep ? ' (các chữ số có thể lặp lại)' : ' khác nhau'}${cw}?`, answer: list.length,
        solution: `Liệt kê theo ${group(list)}.${ds.includes(0) ? ' (Chữ số 0 không đứng ở hàng trăm.)' : ''} Có <b>${list.length}</b> số.`,
      });
    }
  }

  function combDigitSum(R, lv) {
    const diff = lv === 3 && R.chance(0.4);
    const k = lv === 2 ? R.int(2, 5) : diff ? R.int(6, 10) : R.pick([6, 7, 8, 24, 25, 26]);
    const list = range(100, 999).filter(n => sum(digitsOf(n)) === k && (!diff || distinct(n)));
    const hs = [...new Set(list.map(n => Math.floor(n / 100)))];
    const rows = hs.map(h => { const c = list.filter(n => Math.floor(n / 100) === h); return c.length <= 6 ? `hàng trăm ${h}: ${c.join(', ')} (${c.length} số)` : `hàng trăm ${h}: hai chữ số sau có tổng ${k - h}, ${c.length} số`; });
    return mk({ text: `Có bao nhiêu số có ba chữ số${diff ? ' khác nhau' : ''} mà tổng các chữ số bằng ${k}?`, answer: list.length, solution: `Xét chữ số hàng trăm: ${rows.join('; ')}. Tổng: ${hs.map(h => list.filter(n => Math.floor(n / 100) === h).length).join(' + ')} = <b>${list.length}</b> số.` });
  }

  function combCoins(R, lv) {
    const ways = (n, den) => {
      const out = [];
      const rec = (i, left, cur) => {
        if (i === den.length - 1) { if (left % den[i] === 0) out.push(cur.concat(Array(left / den[i]).fill(den[i]))); return; }
        for (let c = Math.floor(left / den[i]); c >= 0; c--) rec(i + 1, left - c * den[i], cur.concat(Array(c).fill(den[i])));
      };
      rec(0, n, []);
      return out;
    };
    if (lv === 2 && R.chance(0.4)) {
      const n = R.int(13, 39), den = [10, 5, 2, 1], used = []; let left = n;
      for (const d of den) { const c = Math.floor(left / d); if (c) used.push(`${c} tờ ${d}.000`); left -= c * d; }
      const cnt = sum(used.map(s => Number(s.split(' ')[0])));
      return mk({ text: `Có nhiều tờ tiền loại 1.000 đồng, 2.000 đồng, 5.000 đồng và 10.000 đồng. Muốn trả đúng ${fmt(n * 1000)} đồng thì cần ít nhất bao nhiêu tờ tiền?`, answer: cnt, solution: `Dùng tờ có mệnh giá lớn nhất có thể trước: ${used.join(', ')}. Cần ít nhất <b>${cnt}</b> tờ.` });
    }
    let n, den;
    if (lv === 1) { n = R.int(3, 6); den = [5, 2, 1]; }
    else if (lv === 2) { n = R.int(6, 9); den = [5, 2, 1]; }
    else { [n, den] = R.pick([[R.int(10, 12), [5, 2, 1]], [R.pick([20, 30]), [10, 5, 2]], [R.pick([12, 14, 16]), [5, 2]]]); }
    const list = ways(n, den), show = list.map(p => p.join(' + '));
    return mk({
      text: `Có nhiều tờ tiền loại ${den.slice().reverse().map(d => fmt(d * 1000)).join(' đồng, ')} đồng. Có bao nhiêu cách lấy ra các tờ tiền để được đúng ${fmt(n * 1000)} đồng? (Không cần dùng đủ các loại)`,
      answer: list.length,
      solution: `Liệt kê theo số tờ ${den[0]}.000 đồng từ nhiều đến ít (đơn vị nghìn đồng): ${show.join('; ')}. Có <b>${list.length}</b> cách.`,
    });
  }

  function combPigeon(R, lv) {
    const r = R.int(3, 8), g = R.int(3, 8), y = R.int(3, 7);
    if (lv === 1) {
      if (R.chance(0.5)) return mk({ text: `Trong hộp có ${r} bi đỏ và ${g} bi xanh. Không nhìn vào hộp, phải lấy ra ít nhất bao nhiêu viên bi để chắc chắn có một viên bi đỏ?`, answer: g + 1, solution: `Xui nhất là lấy hết ${g} bi xanh trước. Lấy thêm 1 viên nữa chắc chắn là bi đỏ: ${g} + 1 = <b>${g + 1}</b> viên.` });
      return mk({ text: `Trong hộp có ${r} bi đỏ và ${g} bi xanh. Không nhìn vào hộp, phải lấy ra ít nhất bao nhiêu viên bi để chắc chắn có 2 viên cùng màu?`, answer: 3, solution: `Xui nhất là 2 viên đầu khác màu (1 đỏ, 1 xanh). Viên thứ 3 chắc chắn trùng màu với một viên đã lấy: <b>3</b> viên.` });
    }
    if (lv === 2) {
      const t = R.int(0, 2);
      if (t === 0) return mk({ text: `Trong hộp có ${r} bi đỏ, ${g} bi xanh và ${y} bi vàng. Không nhìn, phải lấy ít nhất bao nhiêu viên để chắc chắn có 2 viên cùng màu?`, answer: 4, solution: `Có 3 màu. Xui nhất là 3 viên đầu mỗi viên một màu. Viên thứ 4 chắc chắn trùng màu: <b>4</b> viên.` });
      if (t === 1) { const m = Math.max(r, g); return mk({ text: `Trong hộp có ${r} bi đỏ và ${g} bi xanh. Không nhìn, phải lấy ít nhất bao nhiêu viên để chắc chắn có đủ cả hai màu?`, answer: m + 1, solution: `Xui nhất là lấy hết ${m} viên của màu nhiều hơn trước. Thêm 1 viên nữa chắc chắn là màu còn lại: ${m} + 1 = <b>${m + 1}</b> viên.` }); }
      return mk({ text: `Trong hộp có ${r} bi đỏ và ${g} bi xanh. Không nhìn, phải lấy ít nhất bao nhiêu viên để chắc chắn có 2 viên bi đỏ?`, answer: g + 2, solution: `Xui nhất là lấy hết ${g} bi xanh trước, sau đó lấy thêm 2 viên nữa đều là bi đỏ: ${g} + 2 = <b>${g + 2}</b> viên.` });
    }
    const t = R.int(0, 3);
    if (t === 0) { const c = R.int(3, 4), k = R.int(3, 4); return mk({ text: `Trong túi có ${c} màu bi, mỗi màu có 10 viên. Không nhìn, phải lấy ít nhất bao nhiêu viên để chắc chắn có ${k} viên cùng màu?`, answer: c * (k - 1) + 1, solution: `Xui nhất là mỗi màu lấy được ${k - 1} viên: ${c} × ${k - 1} = ${c * (k - 1)} viên mà chưa có ${k} viên cùng màu. Lấy thêm 1 viên nữa chắc chắn có ${k} viên cùng màu: <b>${c * (k - 1) + 1}</b> viên.` }); }
    if (t === 1) { const s = [r, g, y].sort((a, b) => a - b), ans = s[1] + s[2] + 1; return mk({ text: `Trong hộp có ${r} bi đỏ, ${g} bi xanh và ${y} bi vàng. Không nhìn, phải lấy ít nhất bao nhiêu viên để chắc chắn có đủ cả ba màu?`, answer: ans, solution: `Xui nhất là lấy hết hai màu nhiều nhất trước: ${s[2]} + ${s[1]} = ${s[1] + s[2]} viên. Thêm 1 viên nữa chắc chắn là màu thứ ba: <b>${ans}</b> viên.` }); }
    if (t === 2) { const n = R.int(3, 6); return mk({ text: `Trong ngăn kéo có ${n} đôi tất khác màu nhau (mỗi đôi 2 chiếc cùng màu) để lẫn lộn. Không nhìn, phải lấy ít nhất bao nhiêu chiếc để chắc chắn có 2 chiếc cùng màu?`, answer: n + 1, solution: `Có ${n} màu. Xui nhất là ${n} chiếc đầu mỗi chiếc một màu. Chiếc thứ ${n + 1} chắc chắn trùng màu: <b>${n + 1}</b> chiếc.` }); }
    const [u, k] = R.pick([['tháng', 12], ['thứ trong tuần', 7]]);
    return mk({ text: `Một nhóm phải có ít nhất bao nhiêu bạn để chắc chắn có 2 bạn sinh cùng ${u === 'tháng' ? 'một tháng' : 'một thứ trong tuần'}?`, answer: k + 1, solution: `Có ${k} ${u === 'tháng' ? 'tháng' : 'thứ trong tuần'}. Xui nhất là ${k} bạn sinh vào ${k} ${u === 'tháng' ? 'tháng' : 'thứ'} khác nhau. Bạn thứ ${k + 1} chắc chắn trùng với một bạn: <b>${k + 1}</b> bạn.` });
  }

  // =====================================================================
  const G = (id, fn, lv) => ({ id, fn, lv });
  const L_ = T.L_;
  T.addGrade(3, {
    topics: {
      logic: {
        desc: 'Dãy số quy luật, số còn thiếu, tuổi, trồng cây, cân đĩa, suy luận, xếp chỗ, đong nước, lịch',
        points: [
          'Dãy số: thử cộng, trừ, nhân giữa hai số liền nhau. Có dãy khoảng cách tăng dần, dãy gấp lên mấy lần, dãy "mỗi số bằng tổng hai số trước", dãy xen kẽ hai quy luật.',
          'Bảng số còn thiếu: tìm phép tính (cộng, nhân, ...) đúng với mọi hàng đã biết rồi áp dụng cho hàng còn thiếu.',
          'Tuổi: hiệu số tuổi không đổi theo thời gian. Mỗi năm tổng tuổi của hai người tăng 2. Tổng – hiệu: số bé = (tổng − hiệu) : 2.',
          'Trồng cây trên đoạn thẳng có cả hai đầu: số cây = số khoảng + 1; không trồng hai đầu: số cây = số khoảng − 1; quanh vòng tròn: số cây = số khoảng. Cưa n đoạn cần n − 1 lần. Từ tầng 1 lên tầng n đi n − 1 lượt cầu thang.',
          'Cân đĩa: thay vật này bằng vật kia có cùng cân nặng; so sánh hai lần cân để tìm phần hơn kém.',
          'Suy luận: thử lần lượt từng trường hợp, trường hợp nào đúng mọi điều kiện thì chọn.',
          'Lịch: cứ 7 ngày lặp lại thứ cũ. Tháng 4, 6, 9, 11 có 30 ngày; tháng 2 có 28 hoặc 29 ngày; các tháng còn lại có 31 ngày.',
        ],
        tips: [
          'Viết các khoảng cách giữa hai số liền nhau ngay dưới dãy số để dễ thấy quy luật.',
          'Bài suy luận: lập bảng hoặc thử từng bạn một, ghi "đúng/loại" để không bị rối.',
          'Bài đếm ngày: chia số ngày cho 7, chỉ cần đếm tiếp phần dư.',
        ],
        examples: [
          { q: 'Tìm số tiếp theo: 1, 2, 3, 5, 8, 13, ?', a: 'Mỗi số bằng tổng hai số đứng trước: 8 + 13 = <b>21</b>.' },
          { q: 'Năm nay mẹ 32 tuổi, con 8 tuổi. Sau mấy năm nữa tuổi mẹ gấp 3 lần tuổi con?', a: 'Mẹ luôn hơn con 24 tuổi. Khi tuổi mẹ gấp 3 lần tuổi con thì 24 bằng 2 lần tuổi con, con 12 tuổi. Vậy sau 12 − 8 = <b>4</b> năm.' },
          { q: 'Trồng cây hai bên đường dài 40 m, cứ 5 m một cây, có trồng ở hai đầu. Cần bao nhiêu cây?', a: 'Mỗi bên có 40 : 5 = 8 khoảng nên có 9 cây. Hai bên: 9 × 2 = <b>18</b> cây.' },
          { q: 'Ngày 1 tháng 3 là thứ Hai. Ngày 20 tháng 3 là thứ mấy?', a: 'Từ ngày 1 đến ngày 20 là 19 ngày = 2 tuần và 5 ngày. Đếm tiếp 5 ngày từ thứ Hai: <b>thứ Bảy</b>.' },
        ],
      },
      arith: {
        desc: 'Bảng nhân chia, nhân chia số có nhiều chữ số, biểu thức, tìm thành phần, chia có dư, gấp – giảm, 1/n, tính nhanh, lời văn, rút về đơn vị, tiền',
        points: [
          'Thuộc bảng nhân, bảng chia 2 đến 9. Nhân, chia số có 2 – 5 chữ số với số có một chữ số; thử lại phép chia bằng phép nhân.',
          'Thứ tự thực hiện: trong ngoặc trước; nhân, chia trước, cộng, trừ sau; chỉ có cộng trừ (hoặc chỉ có nhân chia) thì tính từ trái sang phải.',
          'Tìm thành phần: thừa số = tích : thừa số kia; số bị chia = thương × số chia; số chia = số bị chia : thương.',
          'Chia có dư: số dư luôn bé hơn số chia; số bị chia = thương × số chia + số dư.',
          'Gấp một số lên n lần thì nhân với n; giảm đi n lần thì chia cho n; muốn tìm 1/n của một số thì chia số đó cho n.',
          'Rút về đơn vị: tìm giá trị của 1 phần (phép chia) rồi tính cho nhiều phần (phép nhân) hoặc tìm số phần (phép chia).',
          'Tiền Việt Nam: các tờ 1.000, 2.000, 5.000, 10.000, 20.000, 50.000, 100.000 đồng.',
        ],
        tips: [
          'Tính nhanh: tìm cặp 2 × 5 = 10, 4 × 25 = 100, 8 × 125 = 1.000; dùng a × b + a × c = a × (b + c).',
          'Bài tìm số khi biết kết quả sau nhiều bước: làm ngược từ cuối lên, cộng thành trừ, nhân thành chia.',
          'Bài có lời văn hai bước: tóm tắt, tìm cái chưa biết trung gian trước rồi mới trả lời câu hỏi.',
        ],
        examples: [
          { q: 'Tính: 125 − (36 − 18) × 4', a: '36 − 18 = 18; 18 × 4 = 72; 125 − 72 = <b>53</b>.' },
          { q: 'Tìm □ biết □ : 6 = 15 (dư 4).', a: 'Số bị chia = thương × số chia + số dư: 15 × 6 + 4 = <b>94</b>.' },
          { q: '4 thùng như nhau có 48 l dầu. 7 thùng như thế có bao nhiêu lít dầu?', a: 'Mỗi thùng: 48 : 4 = 12 l. 7 thùng: 12 × 7 = <b>84</b> l.' },
          { q: 'Tính nhanh: 37 × 6 + 37 × 4', a: '37 × (6 + 4) = 37 × 10 = <b>370</b>.' },
        ],
      },
      number: {
        desc: 'Số đến 100.000, giá trị chữ số, so sánh, làm tròn, số La Mã, chẵn lẻ, chia hết cho 2 và 5, số dư, đánh số trang, lập số',
        points: [
          'Số có năm chữ số gồm chục nghìn, nghìn, trăm, chục, đơn vị. 10 đơn vị = 1 chục, 10 chục = 1 trăm, 10 trăm = 1 nghìn, 10 nghìn = 1 chục nghìn.',
          'So sánh: số nào nhiều chữ số hơn thì lớn hơn; cùng số chữ số thì so sánh từng hàng từ trái sang phải.',
          'Làm tròn: nhìn chữ số ngay sau hàng cần làm tròn, bé hơn 5 thì làm tròn xuống, từ 5 trở lên thì làm tròn lên.',
          'Số La Mã: I = 1, V = 5, X = 10. Chữ đứng sau thì cộng (VI = 6, XII = 12), chữ I đứng trước V hoặc X thì trừ (IV = 4, IX = 9).',
          'Số chia hết cho 2 có tận cùng là 0, 2, 4, 6, 8. Số chia hết cho 5 có tận cùng là 0 hoặc 5.',
          'Đếm số cách đều: (số cuối − số đầu) : khoảng cách + 1. Đánh số trang 1 đến 99 hết 189 chữ số.',
          'Lập số: chữ số 0 không đứng đầu. Muốn số lớn nhất, xếp chữ số lớn ở hàng cao.',
        ],
        tips: [
          'Bài số lớn nhất/bé nhất có điều kiện: quyết định hàng cao nhất trước, rồi lần lượt các hàng sau.',
          'Bài đếm chữ số: tách thành nhóm số có 1, 2, 3 chữ số; hoặc đếm riêng từng hàng (đơn vị, chục, trăm).',
        ],
        examples: [
          { q: 'Số gồm 4 nghìn, 15 trăm và 7 đơn vị là số nào?', a: '15 trăm = 1 nghìn 5 trăm. Số đó gồm 5 nghìn, 5 trăm, 7 đơn vị: <b>5.507</b>.' },
          { q: 'Tìm số bé nhất mà làm tròn đến hàng trăm được 3.500.', a: 'Các số từ 3.450 đến 3.549 làm tròn đến hàng trăm đều được 3.500. Bé nhất là <b>3.450</b>.' },
          { q: 'Đánh số trang một quyển sách từ 1 đến 120 cần bao nhiêu chữ số?', a: '1 – 9: 9 chữ số; 10 – 99: 90 × 2 = 180; 100 – 120: 21 × 3 = 63. Tổng: <b>252</b>.' },
          { q: 'XIV + VI = ?', a: 'XIV = 14, VI = 6. 14 + 6 = <b>20</b> (viết là XX).' },
        ],
      },
      geo: {
        desc: 'Góc vuông, trung điểm, hình tròn, chu vi, diện tích, đếm hình, đơn vị đo, xem đồng hồ, tháng – năm, ghép hình',
        points: [
          'Dùng ê-ke để kiểm tra góc vuông. M là trung điểm của AB khi M nằm giữa A, B và AM = MB = AB : 2.',
          'Hình tròn: tâm O, bán kính nối tâm với một điểm trên đường tròn, đường kính đi qua tâm. Đường kính = bán kính × 2.',
          'Chu vi là tổng độ dài các cạnh. Chu vi hình chữ nhật = (dài + rộng) × 2; chu vi hình vuông = cạnh × 4.',
          'Diện tích hình chữ nhật = dài × rộng; diện tích hình vuông = cạnh × cạnh (đơn vị cm²).',
          'Đổi đơn vị: 1 cm = 10 mm; 1 m = 100 cm; 1 km = 1.000 m; 1 kg = 1.000 g; 1 l = 1.000 ml.',
          'Đồng hồ: mỗi số trên mặt đồng hồ ứng với 5 phút của kim dài; 1 giờ = 60 phút. "8 giờ 45 phút" còn đọc là "9 giờ kém 15 phút".',
          'Đếm hình: đếm hình đơn, rồi hình ghép 2, ghép 3, ... Lưới có nhiều hàng: số hình chữ nhật = (cách chọn chiều ngang) × (cách chọn chiều dọc).',
        ],
        tips: [
          'Hình phức tạp (hình chữ L): bù thêm phần khuyết cho thành hình chữ nhật, hoặc cắt ra thành các hình chữ nhật nhỏ.',
          'Luôn đổi về cùng một đơn vị trước khi tính, và ghi đơn vị vào kết quả.',
          'Ghép hình vuông thành hình lớn thì các cạnh ghép vào bên trong không còn tính vào chu vi.',
        ],
        examples: [
          { q: 'Hình chữ nhật có chu vi 30 cm, chiều rộng 6 cm. Tính diện tích.', a: 'Nửa chu vi: 15 cm. Chiều dài: 15 − 6 = 9 cm. Diện tích: 9 × 6 = <b>54</b> cm².' },
          { q: 'Ghép 3 hình vuông cạnh 4 cm thành một hàng. Tính chu vi hình chữ nhật thu được.', a: 'Chiều dài 12 cm, chiều rộng 4 cm. Chu vi: (12 + 4) × 2 = <b>32</b> cm.' },
          { q: 'M là trung điểm AB, N là trung điểm MB, AB = 16 cm. Tính AN.', a: 'AM = MB = 8 cm, MN = 4 cm. AN = 8 + 4 = <b>12</b> cm.' },
          { q: '3 kg 200 g − 900 g = ? g', a: '3 kg 200 g = 3.200 g. 3.200 − 900 = <b>2.300</b> g.' },
        ],
      },
      comb: {
        desc: 'Quy tắc cộng, quy tắc nhân, đường đi, bắt tay – thi đấu, xếp hàng, lập số, tổng chữ số, chia kẹo, đổi tiền, trường hợp xấu nhất',
        points: [
          'Quy tắc cộng: chọn 1 trong nhóm này HOẶC nhóm kia thì cộng số cách. Quy tắc nhân: chọn lần lượt cái này VÀ cái kia thì nhân số cách.',
          'Đường đi qua nhiều chặng: nhân số đường của các chặng; thêm đường đi thẳng thì cộng thêm.',
          'Bắt tay, thi đấu vòng tròn một lượt: n người có 1 + 2 + ... + (n − 1) cặp. Hai lượt (đi – về) thì gấp đôi.',
          'Xếp n bạn thành hàng: n × (n − 1) × ... × 1 cách (3 bạn: 6 cách, 4 bạn: 24 cách).',
          'Lập số có ba chữ số khác nhau: hàng trăm khác 0, liệt kê theo hàng trăm từ bé đến lớn để không sót.',
          'Trường hợp xấu nhất: muốn "chắc chắn" thì giả sử mình rất xui, lấy hết những thứ không mong muốn trước.',
        ],
        tips: [
          'Vẽ sơ đồ cây hoặc liệt kê có thứ tự (theo hàng trăm, theo số kẹo của bạn thứ nhất, ...).',
          'Với bài có điều kiện "đứng cạnh nhau", hãy coi hai bạn đó là một nhóm rồi nhân thêm 2 (đổi chỗ trong nhóm).',
        ],
        examples: [
          { q: 'Từ 0, 1, 2, 3 lập được bao nhiêu số có ba chữ số khác nhau?', a: 'Hàng trăm có 3 cách (1, 2, 3), hàng chục 3 cách, hàng đơn vị 2 cách: 3 × 3 × 2 = <b>18</b> số.' },
          { q: '6 đội thi đấu vòng tròn một lượt. Có bao nhiêu trận?', a: '5 + 4 + 3 + 2 + 1 = <b>15</b> trận.' },
          { q: 'Xếp 4 bạn thành hàng, An và Bình luôn đứng cạnh nhau. Có bao nhiêu cách?', a: 'Coi An – Bình là một nhóm: xếp 3 "phần" có 6 cách, trong nhóm đổi chỗ 2 cách: 6 × 2 = <b>12</b> cách.' },
          { q: 'Hộp có 5 bi đỏ, 7 bi xanh, 4 bi vàng. Lấy ít nhất bao nhiêu viên để chắc chắn có đủ 3 màu?', a: 'Xui nhất là lấy hết 7 xanh và 5 đỏ: 12 viên. Thêm 1 viên chắc chắn là vàng: <b>13</b> viên.' },
        ],
      },
    },
    gens: {
      logic: [G('seq0', logicSeq0, [0]), G('pattern0', logicPattern0, [0]), G('compare0', logicCompare0, [0]), G('age', logicAge, [0, 1, 2, 3]), G('cut', logicCut, [0, 1, 2, 3]),
        G('seq', logicSeq, [1, 2, 3]), G('pattern', logicPattern, [1, 2, 3]), G('table', logicTable, [1, 2, 3]), G('balance', logicBalance, [1, 2, 3]), G('seat', logicSeat, [1, 2, 3]),
        G('calendar', logicCalendar, [1, 2, 3]), G('truth', logicTruth, [2, 3]), G('river', logicRiver, [2, 3])],
      arith: [G('mult0', arithMult0, [0]), G('div0', arithDiv0, [0]), G('addsub0', arithAddSub0, [0]), G('table', arithTable, [0, 1]), G('money', arithMoney, [0, 1, 2, 3]),
        G('muldiv', arithMulDiv, [1, 2]), G('expr', arithExpr, [1, 2, 3]), G('findx', arithFindX, [1, 2, 3]), G('remainder', arithRemainder, [1, 2, 3]), G('times', arithTimes, [1, 2, 3]),
        G('quick', arithQuick, [1, 2, 3]), G('word', arithWord, [1, 2, 3]), G('unit', arithUnit, [1, 2, 3])],
      number: [G('place', ntPlace, [0, 1, 2, 3]), G('compare', ntCompare, [0, 1, 2, 3]), G('next0', ntNext0, [0]), G('evenodd0', ntEvenOdd0, [0]), G('roman', ntRoman, [0, 1, 2, 3]),
        G('round', ntRound, [1, 2, 3]), G('special', ntSpecial, [1, 2, 3]), G('count', ntCount, [1, 2, 3]), G('pages', ntPages, [2, 3]), G('divis', ntDivis, [1, 2, 3]),
        G('mod', ntMod, [1, 2, 3]), G('fromdigits', ntFromDigits, [1, 2, 3])],
      geo: [G('angle', geoAngle, [0, 1, 2]), G('midpoint', geoMidpoint, [0, 1, 2, 3]), G('circle', geoCircle, [0, 1, 2, 3]), G('perim', geoPerim, [0, 1, 2, 3]), G('units', geoUnits, [0, 1, 2, 3]),
        G('clock', geoClock, [0, 1, 2, 3]), G('area', geoArea, [1, 2, 3]), G('count', geoCount, [1, 2, 3]), G('month', geoMonth, [1, 2, 3]), G('tile', geoTile, [1, 2, 3])],
      comb: [G('outfit0', combOutfit0, [0]), G('or0', combOr0, [0]), G('share', combShare, [0, 1, 2, 3]), G('arrange', combArrange, [0, 1, 2, 3]), G('handshake', combHandshake, [0, 1, 2, 3]),
        G('rule', combRule, [1, 2, 3]), G('roads', combRoads, [1, 2, 3]), G('digits', combDigits, [1, 2, 3]), G('digitsum', combDigitSum, [2, 3]), G('coins', combCoins, [1, 2, 3]),
        G('pigeon', combPigeon, [1, 2, 3])],
    },
    lessons: {
      logic: T.lessonPath(
        [L_('Dãy số đếm thêm', 'seq0'), L_('Dãy hình, so sánh', 'pattern0', 'compare0'), L_('Tính tuổi, cưa gỗ', 'age', 'cut')],
        [L_('Dãy số, dãy hình quy luật', 'seq', 'pattern'), L_('Số còn thiếu, cân đĩa', 'table', 'balance'), L_('Xếp chỗ, xem lịch', 'seat', 'calendar'), L_('Tuổi, trồng cây, cầu thang', 'age', 'cut')],
        [L_('Quy luật nâng cao', 'seq', 'pattern', 'table', 'balance'), L_('Suy luận nâng cao', 'truth', 'seat', 'river', 'calendar', 'age')]),
      arith: T.lessonPath(
        [L_('Phép nhân qua hình', 'mult0', 'table'), L_('Chia đều, cộng trừ', 'div0', 'addsub0'), L_('Tiền Việt Nam', 'money', 'table')],
        [L_('Bảng nhân, nhân chia', 'table', 'muldiv'), L_('Biểu thức, tìm thành phần', 'expr', 'findx'), L_('Chia có dư, gấp giảm', 'remainder', 'times'), L_('Lời văn, rút về đơn vị', 'word', 'unit', 'money')],
        [L_('Tính toán nâng cao', 'expr', 'findx', 'remainder', 'quick'), L_('Lời văn nâng cao', 'word', 'unit', 'money', 'times')]),
      number: T.lessonPath(
        [L_('Trăm, chục, đơn vị', 'place', 'next0'), L_('So sánh, chẵn lẻ', 'compare', 'evenodd0'), L_('Số La Mã', 'roman')],
        [L_('Số đến 100.000', 'place', 'compare'), L_('Làm tròn, số La Mã', 'round', 'roman'), L_('Số lớn nhất, bé nhất, lập số', 'special', 'fromdigits'), L_('Đếm số, chia hết, số dư', 'count', 'divis', 'mod')],
        [L_('Cấu tạo số nâng cao', 'place', 'round', 'special', 'fromdigits'), L_('Đếm số, đánh số trang', 'count', 'pages', 'divis', 'mod')]),
      geo: T.lessonPath(
        [L_('Góc vuông, điểm ở giữa', 'angle', 'midpoint'), L_('Hình tròn, chu vi', 'circle', 'perim'), L_('Đơn vị đo, xem giờ', 'units', 'clock')],
        [L_('Trung điểm, hình tròn, góc', 'midpoint', 'circle', 'angle'), L_('Chu vi và diện tích', 'perim', 'area'), L_('Đếm hình, ghép hình', 'count', 'tile'), L_('Đo lường, đồng hồ, lịch', 'units', 'clock', 'month')],
        [L_('Chu vi, diện tích nâng cao', 'perim', 'area', 'tile', 'circle'), L_('Đếm hình, đo lường nâng cao', 'count', 'angle', 'units', 'clock', 'month')]),
      comb: T.lessonPath(
        [L_('Chọn quần áo, chọn món', 'outfit0', 'or0'), L_('Chia kẹo, xếp hàng', 'share', 'arrange'), L_('Bắt tay, thi đấu', 'handshake', 'outfit0')],
        [L_('Quy tắc nhân, tìm đường', 'rule', 'roads'), L_('Bắt tay, xếp hàng', 'handshake', 'arrange'), L_('Lập số, chia kẹo', 'digits', 'share'), L_('Đổi tiền, trường hợp xấu nhất', 'coins', 'pigeon')],
        [L_('Đếm cách nâng cao', 'rule', 'roads', 'arrange', 'handshake', 'share'), L_('Lập số, đổi tiền, xấu nhất', 'digits', 'digitsum', 'coins', 'pigeon')]),
    },
  });
})(window.T);
