// Nội dung Toán lớp 4 (SGK 2018) và dạng bài TIMO lớp 4: lý thuyết, dạng bài, lộ trình.
(function (T) {
  'use strict';
  const { mk, choicesOf, box, C2, range, sum, digitsOf, gcd, line, svg, INK, NAMES, SHAPES, FRUITS, ANIMALS,
    svgFan, svgGrid, svgClock, fmt, frac } = T.GH;

  // ---------- tiện ích riêng ----------
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const FR_NOTE = ' (viết dưới dạng phân số tối giản, ví dụ 3/4)';
  const near = (ans, ds) => ds.map(d => ans + d).filter(x => x >= 0 && x !== ans);
  const ch = (R, correct, pool, o) => mk(Object.assign({ type: 'choice', choices: choicesOf(R, correct, pool), answer: String(correct) }, o));
  const WEEK = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật'];
  const wk = i => WEEK[((i % 7) + 7) % 7];
  const lo = s => (s === 'Chủ nhật' ? s : 'thứ ' + s.slice(4));
  const digitSum = n => sum(digitsOf(n));
  const distinct = n => new Set(String(n)).size === String(n).length;
  const firstIn = (a, b, p) => { for (let x = a; x <= b; x++) if (p(x)) return x; return null; };
  const lastIn = (a, b, p) => { for (let x = b; x >= a; x--) if (p(x)) return x; return null; };
  const countIn = (a, b, p) => { let c = 0; for (let x = a; x <= b; x++) if (p(x)) c++; return c; };
  const txt = (x, y, s, anchor = 'middle', fill = INK) => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="17" font-weight="700" fill="${fill}">${s}</text>`;
  const dash = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="6 5"/>`;
  const POLY = (pts, fill) => `<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${fill}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
  const tab = rows => `<table style="border-collapse:collapse;margin:10px auto;font-size:1.15em;font-weight:700">${rows.map(r => `<tr>${r.map(c => `<td style="border:2px solid ${INK};padding:6px 16px;text-align:center">${c}</td>`).join('')}</tr>`).join('')}</table>`;

  // Hình chữ nhật có ghi kích thước (a: chiều ngang thật, b: chiều dọc thật)
  function svgRect(a, b, la, lb, fill = '#bbf7d0') {
    const k = Math.min(200 / a, 150 / b), w = Math.max(40, Math.round(a * k)), h = Math.max(40, Math.round(b * k));
    return svg(w + 110, h + 50, `<rect x="90" y="10" width="${w}" height="${h}" fill="${fill}" stroke="${INK}" stroke-width="3"/>` +
      txt(90 + w / 2, h + 40, la) + txt(45, 16 + h / 2, lb), 300);
  }
  // Thanh chia n phần bằng nhau, tô các phần trong tập `on`
  function svgFracBar(n, on) {
    const W = 300 / n;
    let s = '';
    for (let i = 0; i < n; i++) s += `<rect x="${5 + i * W}" y="5" width="${W}" height="60" fill="${on.includes(i) ? '#fdba74' : '#fff'}" stroke="${INK}" stroke-width="3"/>`;
    return svg(310, 70, s, 300);
  }

  // =====================================================================
  // SỐ HỌC
  // =====================================================================
  function arCalc0(R) {
    const k = R.pick(['add', 'sub', 'mul', 'div']);
    if (k === 'add') { const a = R.int(1000, 5999), b = R.int(1000, 3999); return mk({ text: `Tính:<div class="seq">${fmt(a)} + ${fmt(b)} = ${box}</div>`, answer: a + b, solution: `Đặt tính rồi cộng từ hàng đơn vị: ${fmt(a)} + ${fmt(b)} = <b>${fmt(a + b)}</b>.` }); }
    if (k === 'sub') { const a = R.int(5000, 9999), b = R.int(1000, a - 1000); return mk({ text: `Tính:<div class="seq">${fmt(a)} − ${fmt(b)} = ${box}</div>`, answer: a - b, solution: `Đặt tính rồi trừ từ hàng đơn vị: ${fmt(a)} − ${fmt(b)} = <b>${fmt(a - b)}</b>.` }); }
    if (k === 'mul') { const a = R.int(105, 999), b = R.int(2, 9); return mk({ text: `Tính:<div class="seq">${a} × ${b} = ${box}</div>`, answer: a * b, solution: `${a} × ${b} = ${Math.floor(a / 100) * 100} × ${b} + ${a % 100} × ${b} = ${Math.floor(a / 100) * 100 * b} + ${(a % 100) * b} = <b>${fmt(a * b)}</b>.` }); }
    const b = R.int(2, 9), q = R.int(104, 999);
    return mk({ text: `Tính:<div class="seq">${fmt(b * q)} : ${b} = ${box}</div>`, answer: q, solution: `Thử lại bằng phép nhân: ${q} × ${b} = ${fmt(b * q)}. Vậy ${fmt(b * q)} : ${b} = <b>${q}</b>.` });
  }

  function arOrder0(R) {
    const k = R.pick(['a+bc', 'a-bc', '(a+b)c', 'ab-c', 'p:b+c']);
    const a = R.int(20, 90), b = R.int(3, 9), c = R.int(3, 9);
    if (k === 'a+bc') return mk({ text: `Tính giá trị của biểu thức:<div class="seq">${a} + ${b} × ${c}</div>`, answer: a + b * c, solution: `Nhân trước, cộng sau: ${a} + ${b} × ${c} = ${a} + ${b * c} = <b>${a + b * c}</b>.` });
    if (k === 'a-bc') { const A = a + 50; return mk({ text: `Tính giá trị của biểu thức:<div class="seq">${A} − ${b} × ${c}</div>`, answer: A - b * c, solution: `Nhân trước, trừ sau: ${A} − ${b} × ${c} = ${A} − ${b * c} = <b>${A - b * c}</b>.` }); }
    if (k === '(a+b)c') return mk({ text: `Tính giá trị của biểu thức:<div class="seq">(${a} + ${b}) × ${c}</div>`, answer: (a + b) * c, solution: `Tính trong ngoặc trước: (${a} + ${b}) × ${c} = ${a + b} × ${c} = <b>${(a + b) * c}</b>.` });
    if (k === 'ab-c') { const C = R.int(10, a * b - 1 > 10 ? Math.min(99, a * b - 1) : 10); return mk({ text: `Tính giá trị của biểu thức:<div class="seq">${a} × ${b} − ${C}</div>`, answer: a * b - C, solution: `Nhân trước, trừ sau: ${a} × ${b} − ${C} = ${a * b} − ${C} = <b>${a * b - C}</b>.` }); }
    const q = R.int(12, 99);
    return mk({ text: `Tính giá trị của biểu thức:<div class="seq">${b * q} : ${b} + ${a}</div>`, answer: q + a, solution: `Chia trước, cộng sau: ${b * q} : ${b} + ${a} = ${q} + ${a} = <b>${q + a}</b>.` });
  }

  function arWord0(R) {
    const X = R.pick(FRUITS), [A, B] = R.sample(NAMES, 2);
    const k = R.pick(['bags', 'times', 'share', 'part']);
    if (k === 'bags') {
      const n = R.int(3, 6), m = R.int(2, 5);
      return mk({ text: `Mỗi túi có ${n} quả ${X}. Hỏi ${m} túi như thế có bao nhiêu quả?`, visual: `<div class="seq emoji">${Array(m).fill('[' + X.repeat(n) + ']').join(' ')}</div>`, answer: n * m, solution: `${m} túi có: ${n} × ${m} = <b>${n * m}</b> quả.` });
    }
    if (k === 'times') {
      const a = R.int(6, 25), t = R.int(2, 6);
      return mk({ text: `${A} có ${a} viên bi. Số bi của ${B} gấp ${t} lần số bi của ${A}. Hỏi ${B} có bao nhiêu viên bi?`, answer: a * t, solution: `Gấp ${t} lần thì nhân với ${t}: ${a} × ${t} = <b>${a * t}</b> viên bi.` });
    }
    if (k === 'share') {
      const t = R.int(3, 8), q = R.int(6, 15);
      return mk({ text: `Có ${t * q} quyển vở chia đều cho ${t} bạn. Hỏi mỗi bạn được bao nhiêu quyển vở?`, answer: q, solution: `Mỗi bạn được: ${t * q} : ${t} = <b>${q}</b> quyển vở.` });
    }
    const t = R.pick([2, 3, 4, 5, 6]), q = R.int(5, 20);
    const nm = { 2: 'hai', 3: 'ba', 4: 'tư', 5: 'năm', 6: 'sáu' }[t];
    return mk({ text: `${A} có ${t * q} cái kẹo, ${A} cho em <sup>1</sup>/<sub>${t}</sub> (một phần ${nm}) số kẹo. Hỏi ${A} cho em bao nhiêu cái kẹo?`, answer: q, solution: `Một phần ${nm} số kẹo là: ${t * q} : ${t} = <b>${q}</b> cái kẹo.` });
  }

  function arFrac0(R) {
    const n = R.int(3, 8), m = R.int(1, n - 1);
    const on = R.sample(range(0, n - 1), m);
    const unshaded = R.chance(0.35);
    const top = unshaded ? n - m : m;
    const ans = `${top}/${n}`;
    const pool = [`${n - top}/${n}`, `${n}/${top}`, `${top}/${n + 1}`, `${top + 1}/${n}`, `${top}/${n - top}`].filter(s => !s.startsWith('0/'));
    return ch(R, ans, pool, {
      text: `Hình bên được chia thành các phần bằng nhau. Phân số chỉ phần ${unshaded ? 'KHÔNG tô màu' : 'đã tô màu'} là:`,
      visual: svgFracBar(n, on),
      solution: `Hình chia thành ${n} phần bằng nhau (mẫu số ${n}), có ${top} phần ${unshaded ? 'không tô màu' : 'tô màu'} (tử số ${top}). Phân số là <b>${ans}</b>.`,
    });
  }

  function arBig(R, lv) {
    if (lv === 1) {
      const k = R.pick(['add', 'sub', 'mul', 'div']);
      if (k === 'add') { const a = R.int(10000, 699999), b = R.int(10000, 299999); return mk({ text: `Tính:<div class="seq">${fmt(a)} + ${fmt(b)} = ${box}</div>`, answer: a + b, solution: `Đặt tính thẳng hàng rồi cộng từ phải sang trái: <b>${fmt(a + b)}</b>.` }); }
      if (k === 'sub') { const a = R.int(300000, 999999), b = R.int(10000, a - 10000); return mk({ text: `Tính:<div class="seq">${fmt(a)} − ${fmt(b)} = ${box}</div>`, answer: a - b, solution: `Đặt tính thẳng hàng rồi trừ từ phải sang trái: <b>${fmt(a - b)}</b>. Thử lại: ${fmt(a - b)} + ${fmt(b)} = ${fmt(a)}.` }); }
      if (k === 'mul') {
        const a = R.int(105, 989), b = R.int(12, 98), t = Math.floor(b / 10), u = b % 10;
        return mk({ text: `Tính:<div class="seq">${a} × ${b} = ${box}</div>`, answer: a * b, solution: `${a} × ${b} = ${a} × ${t * 10}${u ? ` + ${a} × ${u}` : ''} = ${fmt(a * t * 10)}${u ? ` + ${fmt(a * u)}` : ''} = <b>${fmt(a * b)}</b>.` });
      }
      const d = R.int(12, 64), q = R.int(105, 999);
      return mk({ text: `Tính:<div class="seq">${fmt(d * q)} : ${d} = ${box}</div>`, answer: q, solution: `Chia lần lượt từ trái sang phải. Thử lại: ${q} × ${d} = ${fmt(d * q)}. Vậy kết quả là <b>${q}</b>.` });
    }
    const k = R.pick(['mulx', 'divx', 'subx', 'xsub', 'rem', 'paren']);
    if (k === 'mulx') { const d = R.int(12, 99), q = R.int(105, 999); return mk({ text: `Tìm ${box}:<div class="seq">${box} × ${d} = ${fmt(d * q)}</div>`, answer: q, solution: `Thừa số chưa biết = tích : thừa số đã biết = ${fmt(d * q)} : ${d} = <b>${q}</b>.` }); }
    if (k === 'divx') { const d = R.int(12, 99), q = R.int(105, 999); return mk({ text: `Tìm ${box}:<div class="seq">${box} : ${d} = ${q}</div>`, answer: d * q, solution: `Số bị chia = thương × số chia = ${q} × ${d} = <b>${fmt(d * q)}</b>.` }); }
    if (k === 'subx') { const a = R.int(200000, 999999), b = R.int(10000, a - 10000); return mk({ text: `Tìm ${box}:<div class="seq">${fmt(a)} − ${box} = ${fmt(b)}</div>`, answer: a - b, solution: `Số trừ = số bị trừ − hiệu = ${fmt(a)} − ${fmt(b)} = <b>${fmt(a - b)}</b>.` }); }
    if (k === 'xsub') { const b = R.int(10000, 500000), c = R.int(10000, 400000); return mk({ text: `Tìm ${box}:<div class="seq">${box} − ${fmt(b)} = ${fmt(c)}</div>`, answer: b + c, solution: `Số bị trừ = hiệu + số trừ = ${fmt(c)} + ${fmt(b)} = <b>${fmt(b + c)}</b>.` }); }
    if (k === 'rem') {
      const d = R.int(12, 45), q = R.int(105, 650), r = R.int(1, d - 1);
      return mk({ text: `Trong một phép chia, số chia là ${d}, thương là ${q} và số dư là ${r}. Tìm số bị chia.`, answer: d * q + r, solution: `Số bị chia = thương × số chia + số dư = ${q} × ${d} + ${r} = ${fmt(d * q)} + ${r} = <b>${fmt(d * q + r)}</b>.` });
    }
    const a = R.int(15, 300), kk = R.int(3, 25), x = R.int(20, 400);
    return mk({ text: `Tìm ${box}:<div class="seq">(${box} + ${a}) × ${kk} = ${fmt((x + a) * kk)}</div>`, answer: x, solution: `${box} + ${a} = ${fmt((x + a) * kk)} : ${kk} = ${x + a}. Vậy ${box} = ${x + a} − ${a} = <b>${x}</b>.` });
  }

  function arQuick(R, lv) {
    const a = R.int(12, 89);
    if (lv === 1) {
      const k = R.pick(['x11', 'x10', '25x4', 'dist']);
      if (k === 'x11') return mk({ text: `Tính nhẩm:<div class="seq">${a} × 11 = ${box}</div>`, answer: a * 11, solution: `${a} × 11 = ${a} × 10 + ${a} = ${a * 10} + ${a} = <b>${a * 11}</b>. (Mẹo: viết tổng hai chữ số vào giữa.)` });
      if (k === 'x10') {
        const t = R.pick([10, 100, 1000]), b = R.int(12, 999);
        if (R.chance(0.5)) return mk({ text: `Tính nhẩm:<div class="seq">${b} × ${fmt(t)} = ${box}</div>`, answer: b * t, solution: `Nhân với ${fmt(t)} chỉ cần viết thêm ${String(t).length - 1} chữ số 0 vào bên phải: <b>${fmt(b * t)}</b>.` });
        return mk({ text: `Tính nhẩm:<div class="seq">${fmt(b * t)} : ${fmt(t)} = ${box}</div>`, answer: b, solution: `Chia số tròn cho ${fmt(t)} thì bỏ bớt ${String(t).length - 1} chữ số 0 ở bên phải: <b>${b}</b>.` });
      }
      if (k === '25x4') {
        const b = R.int(13, 99), [p, q] = R.pick([[25, 4], [5, 2], [50, 2], [125, 8], [20, 5]]);
        return mk({ text: `Tính bằng cách thuận tiện:<div class="seq">${p} × ${b} × ${q}</div>`, answer: p * q * b, solution: `Đổi chỗ các thừa số: ${p} × ${b} × ${q} = (${p} × ${q}) × ${b} = ${p * q} × ${b} = <b>${fmt(p * q * b)}</b>.` });
      }
      const s = R.pick([10, 100]), b = R.int(1, s - 1);
      return mk({ text: `Tính bằng cách thuận tiện:<div class="seq">${a} × ${b} + ${a} × ${s - b}</div>`, answer: a * s, solution: `Nhân một số với một tổng: ${a} × ${b} + ${a} × ${s - b} = ${a} × (${b} + ${s - b}) = ${a} × ${s} = <b>${fmt(a * s)}</b>.` });
    }
    if (lv === 2) {
      const k = R.pick(['99', '101', 'diff', 'three', 'pair']);
      if (k === '99') return mk({ text: `Tính bằng cách thuận tiện:<div class="seq">${a} × 99 + ${a}</div>`, answer: a * 100, solution: `${a} × 99 + ${a} × 1 = ${a} × (99 + 1) = ${a} × 100 = <b>${fmt(a * 100)}</b>.` });
      if (k === '101') return mk({ text: `Tính bằng cách thuận tiện:<div class="seq">${a} × 101 − ${a}</div>`, answer: a * 100, solution: `${a} × 101 − ${a} × 1 = ${a} × (101 − 1) = ${a} × 100 = <b>${fmt(a * 100)}</b>.` });
      if (k === 'diff') {
        const s = R.pick([10, 100]), c = R.int(12, 89), b = c + s;
        return mk({ text: `Tính bằng cách thuận tiện:<div class="seq">${a} × ${b} − ${a} × ${c}</div>`, answer: a * s, solution: `Nhân một số với một hiệu: ${a} × (${b} − ${c}) = ${a} × ${s} = <b>${fmt(a * s)}</b>.` });
      }
      if (k === 'three') {
        const b = R.int(20, 45), c = R.int(15, 40), d = 100 - b - c;
        return mk({ text: `Tính bằng cách thuận tiện:<div class="seq">${a} × ${b} + ${a} × ${c} + ${a} × ${d}</div>`, answer: a * 100, solution: `${a} × (${b} + ${c} + ${d}) = ${a} × 100 = <b>${fmt(a * 100)}</b>.` });
      }
      const [p, q] = R.pick([[4, 25], [2, 50], [8, 125], [5, 20]]), b = R.int(13, 79);
      return mk({ text: `Tính bằng cách thuận tiện:<div class="seq">${p} × ${b} × ${q}</div>`, answer: p * q * b, solution: `(${p} × ${q}) × ${b} = ${p * q} × ${b} = <b>${fmt(p * q * b)}</b>.` });
    }
    const k = R.pick(['double', 'split', 'mid', 'sym']);
    if (k === 'double') {
      const c = R.int(12, 45), b = 100 - 2 * c;
      return mk({ text: `Tính bằng cách thuận tiện:<div class="seq">${a} × ${b} + ${2 * a} × ${c}</div>`, answer: a * 100, solution: `${2 * a} × ${c} = ${a} × 2 × ${c} = ${a} × ${2 * c}. Nên biểu thức = ${a} × ${b} + ${a} × ${2 * c} = ${a} × (${b} + ${2 * c}) = ${a} × 100 = <b>${fmt(a * 100)}</b>.` });
    }
    if (k === 'split') {
      const kk = R.int(3, 9), b = 100 - kk;
      return mk({ text: `Tính bằng cách thuận tiện:<div class="seq">${a} × ${b} + ${a} × ${kk - 1} + ${a}</div>`, answer: a * 100, solution: `${a} × ${b} + ${a} × ${kk - 1} + ${a} × 1 = ${a} × (${b} + ${kk - 1} + 1) = ${a} × 100 = <b>${fmt(a * 100)}</b>.` });
    }
    if (k === 'mid') {
      const b = R.int(21, 79), c = 100 - b;
      return mk({ text: `Tính bằng cách thuận tiện:<div class="seq">${b} × ${a} + ${a} × ${c} − ${a * 10}</div>`, answer: a * 90, solution: `${a * 10} = ${a} × 10. Biểu thức = ${a} × (${b} + ${c} − 10) = ${a} × 90 = <b>${fmt(a * 90)}</b>.` });
    }
    const b = R.int(13, 49), s = R.pick([100, 200]), c = s - b, d = R.int(11, 99);
    return mk({ text: `Tính bằng cách thuận tiện:<div class="seq">${d} × ${b} + ${c} × ${d}</div>`, answer: d * s, solution: `${d} × ${b} + ${d} × ${c} = ${d} × (${b} + ${c}) = ${d} × ${s} = <b>${fmt(d * s)}</b>.` });
  }

  function arAvg(R, lv) {
    if (lv === 1) {
      const n = R.int(3, 4), m = R.int(15, 60);
      const xs = range(1, n - 1).map(() => m + R.int(-12, 12));
      xs.push(n * m - sum(xs));
      if (R.chance(0.4)) {
        const ps = R.sample(NAMES, n), mw = R.int(28, 36), w = range(1, n - 1).map(() => mw + R.int(-4, 4));
        w.push(n * mw - sum(w));
        return mk({ text: `${ps.map((p, i) => `${p} nặng ${w[i]} kg`).join(', ')}. Hỏi trung bình mỗi bạn nặng bao nhiêu ki-lô-gam?`, answer: mw, solution: `Tổng cân nặng: ${w.join(' + ')} = ${sum(w)} kg. Trung bình: ${sum(w)} : ${n} = <b>${mw}</b> kg.` });
      }
      return mk({ text: `Tìm số trung bình cộng của các số:<div class="seq">${xs.join('; ')}</div>`, answer: m, solution: `Tổng các số: ${xs.join(' + ')} = ${sum(xs)}. Trung bình cộng: ${sum(xs)} : ${n} = <b>${m}</b>.` });
    }
    if (lv === 2) {
      const k = R.pick(['third', 'two', 'score', 'seq']);
      if (k === 'third') {
        const m = R.int(30, 150), h = Math.floor(m / 2), a = m + R.int(-h, h), b = m + R.int(-h, h), c = 3 * m - a - b;
        return mk({ text: `Trung bình cộng của ba số là ${m}. Số thứ nhất là ${a}, số thứ hai là ${b}. Tìm số thứ ba.`, answer: c, solution: `Tổng ba số: ${m} × 3 = ${3 * m}. Số thứ ba: ${3 * m} − ${a} − ${b} = <b>${c}</b>.` });
      }
      if (k === 'two') {
        const m = R.int(40, 300), d = 2 * R.int(3, 30), big = m + d / 2;
        return mk({ text: `Trung bình cộng của hai số là ${m}. Số lớn hơn số bé ${d} đơn vị. Tìm số lớn.`, answer: big, solution: `Tổng hai số: ${m} × 2 = ${2 * m}. Số lớn: (${2 * m} + ${d}) : 2 = <b>${big}</b>.` });
      }
      if (k === 'score') {
        const A = R.pick(NAMES), n = R.int(3, 4), m = R.int(7, 9);
        const xs = range(1, n).map(() => R.int(6, 10));
        const need = (n + 1) * m - sum(xs);
        if (need < 5 || need > 10) return arAvg(R, lv);
        return mk({ text: `${A} đã có ${n} điểm kiểm tra: ${xs.join(', ')}. Bài kiểm tra tiếp theo ${A} cần được mấy điểm để điểm trung bình của cả ${n + 1} bài là ${m}?`, answer: need, solution: `Tổng điểm ${n + 1} bài cần có: ${m} × ${n + 1} = ${(n + 1) * m}. Đã có ${xs.join(' + ')} = ${sum(xs)}. Bài tiếp theo cần: ${(n + 1) * m} − ${sum(xs)} = <b>${need}</b> điểm.` });
      }
      const a = R.int(10, 60), d = R.pick([2, 3, 5]), n = R.int(5, 12), l = a + (n - 1) * d;
      if ((a + l) % 2) return arAvg(R, lv);
      return mk({ text: `Tìm số trung bình cộng của dãy số cách đều:<div class="seq">${a}; ${a + d}; ${a + 2 * d}; ...; ${l}</div>`, answer: (a + l) / 2, solution: `Với dãy cách đều, trung bình cộng = (số đầu + số cuối) : 2 = (${a} + ${l}) : 2 = <b>${(a + l) / 2}</b>.` });
    }
    const k = R.pick(['newcomer', 'pairs', 'more']);
    if (k === 'newcomer') {
      const n = R.int(4, 9), m = R.int(25, 40), kk = R.int(1, 3), W = m + (n + 1) * kk;
      return mk({ text: `Một nhóm có ${n} bạn, cân nặng trung bình là ${m} kg. Khi có thêm cô giáo vào nhóm thì cân nặng trung bình của cả nhóm tăng thêm ${kk} kg. Hỏi cô giáo nặng bao nhiêu ki-lô-gam?`, answer: W, solution: `Trung bình mới: ${m} + ${kk} = ${m + kk} kg. Tổng cân nặng ${n + 1} người: ${m + kk} × ${n + 1} = ${(m + kk) * (n + 1)} kg. Tổng của ${n} bạn: ${m} × ${n} = ${m * n} kg. Cô giáo nặng: ${(m + kk) * (n + 1)} − ${m * n} = <b>${W}</b> kg.` });
    }
    if (k === 'pairs') {
      let a, b, c;
      do { a = 2 * R.int(10, 60) + R.int(0, 1); b = a + 2 * R.int(-15, 15); c = a + 2 * R.int(-15, 15); } while ((a + b + c) % 3 || b <= 0 || c <= 0 || b === c);
      const p = (a + b) / 2, q = (b + c) / 2, r = (a + c) / 2, s = a + b + c;
      return mk({ text: `Trung bình cộng của số thứ nhất và số thứ hai là ${p}; của số thứ hai và số thứ ba là ${q}; của số thứ nhất và số thứ ba là ${r}. Tìm trung bình cộng của cả ba số.`, answer: s / 3, solution: `Tổng (số 1 + số 2) + (số 2 + số 3) + (số 1 + số 3) = ${2 * p} + ${2 * q} + ${2 * r} = ${2 * s}, đây là 2 lần tổng ba số. Tổng ba số: ${2 * s} : 2 = ${s}. Trung bình cộng: ${s} : 3 = <b>${s / 3}</b>.` });
    }
    const m = R.int(20, 60), x = R.int(10, 40), n = R.int(3, 5);
    return mk({ text: `Trung bình cộng của ${n} số là ${m}. Nếu viết thêm số thứ ${n + 1} thì trung bình cộng của ${n + 1} số tăng thêm ${x}. Tìm số viết thêm.`, answer: m + x + n * x, solution: `Trung bình mới: ${m} + ${x} = ${m + x}. Tổng ${n + 1} số: ${m + x} × ${n + 1} = ${(m + x) * (n + 1)}. Tổng ${n} số cũ: ${m} × ${n} = ${m * n}. Số viết thêm: ${(m + x) * (n + 1)} − ${m * n} = <b>${(m + x) * (n + 1) - m * n}</b>.` });
  }

  function arSumDiff(R, lv) {
    if (lv === 1) {
      const sm = R.int(20, 900), d = R.int(5, 300), S = 2 * sm + d;
      const big = R.chance(0.5);
      return mk({ text: `Tìm hai số biết tổng của chúng là ${fmt(S)} và hiệu của chúng là ${d}. Số ${big ? 'lớn' : 'bé'} là bao nhiêu?`, answer: big ? sm + d : sm, solution: `Số lớn = (tổng + hiệu) : 2 = (${fmt(S)} + ${d}) : 2 = ${sm + d}. Số bé = (tổng − hiệu) : 2 = (${fmt(S)} − ${d}) : 2 = ${sm}. Số ${big ? 'lớn' : 'bé'} là <b>${big ? sm + d : sm}</b>.` });
    }
    if (lv === 2) {
      const k = R.pick(['trees', 'special', 'rect']);
      if (k === 'trees') {
        const sm = R.int(40, 300), d = R.int(6, 60);
        return mk({ text: `Hai lớp 4A và 4B trồng được ${2 * sm + d} cây. Lớp 4A trồng nhiều hơn lớp 4B ${d} cây. Hỏi lớp 4A trồng được bao nhiêu cây?`, answer: sm + d, solution: `Lớp 4A: (${2 * sm + d} + ${d}) : 2 = <b>${sm + d}</b> cây. (Lớp 4B: ${sm} cây.)` });
      }
      if (k === 'special') {
        const [S, sn, D, dn] = R.pick([[999, 'số lớn nhất có ba chữ số', 99, 'số lẻ lớn nhất có hai chữ số'], [998, 'số chẵn lớn nhất có ba chữ số', 10, 'số bé nhất có hai chữ số'], [1000, 'số bé nhất có bốn chữ số', 98, 'số chẵn lớn nhất có hai chữ số'], [9999, 'số lớn nhất có bốn chữ số', 999, 'số lớn nhất có ba chữ số'], [999, 'số lớn nhất có ba chữ số', 11, 'số lẻ bé nhất có hai chữ số']]);
        const big = R.chance(0.5), ans = big ? (S + D) / 2 : (S - D) / 2;
        return mk({ text: `Tìm hai số có tổng là ${sn} và hiệu là ${dn}. Số ${big ? 'lớn' : 'bé'} là bao nhiêu?`, answer: ans, solution: `Tổng là ${fmt(S)}, hiệu là ${D}. Số lớn: (${fmt(S)} + ${D}) : 2 = ${(S + D) / 2}. Số bé: (${fmt(S)} − ${D}) : 2 = ${(S - D) / 2}. Số ${big ? 'lớn' : 'bé'} là <b>${ans}</b>.` });
      }
      const w = R.int(5, 30), d = R.int(2, 20), P = 2 * (2 * w + d);
      return mk({ text: `Một hình chữ nhật có chu vi ${P} cm, chiều dài hơn chiều rộng ${d} cm. Tính diện tích hình chữ nhật (cm²).`, answer: w * (w + d), solution: `Nửa chu vi (tổng chiều dài và chiều rộng): ${P} : 2 = ${P / 2} cm. Chiều rộng: (${P / 2} − ${d}) : 2 = ${w} cm, chiều dài: ${w + d} cm. Diện tích: ${w + d} × ${w} = <b>${w * (w + d)}</b> cm².` });
    }
    const k = R.pick(['move', 'three', 'add']);
    if (k === 'move') {
      const a = R.int(3, 30), b = R.int(3, 30), x = R.int(20, 300), y = x + a + b;
      return mk({ text: `Tổng của hai số là ${x + y}. Nếu thêm vào số bé ${a} đơn vị và bớt ở số lớn ${b} đơn vị thì hai số bằng nhau. Tìm số lớn.`, answer: y, solution: `Hai số bằng nhau nên số lớn hơn số bé ${a} + ${b} = ${a + b} đơn vị. Số lớn: (${x + y} + ${a + b}) : 2 = <b>${y}</b>.` });
    }
    if (k === 'three') {
      const c = R.int(10, 200), d2 = R.int(2, 30), d1 = R.int(2, 30), b = c + d2, a = b + d1, S = a + b + c;
      return mk({ text: `Tổng của ba số là ${S}. Số thứ nhất hơn số thứ hai ${d1} đơn vị, số thứ hai hơn số thứ ba ${d2} đơn vị. Tìm số thứ ba.`, answer: c, solution: `Số thứ hai = số thứ ba + ${d2}; số thứ nhất = số thứ ba + ${d2 + d1}. Ba lần số thứ ba: ${S} − ${d2} − ${d1 + d2} = ${3 * c}. Số thứ ba: ${3 * c} : 3 = <b>${c}</b>.` });
    }
    const sm = R.int(20, 200), d = R.int(10, 100), S = 2 * sm + d, t = R.int(5, 30);
    return mk({ text: `Hai thùng có tất cả ${S} lít dầu. Nếu đổ thêm ${t} lít vào thùng thứ nhất thì thùng thứ nhất hơn thùng thứ hai ${d + t} lít. Hỏi lúc đầu thùng thứ hai có bao nhiêu lít dầu?`, answer: sm, solution: `Lúc đầu thùng thứ nhất hơn thùng thứ hai ${d + t} − ${t} = ${d} lít. Thùng thứ hai: (${S} − ${d}) : 2 = <b>${sm}</b> lít.` });
  }

  function arRatio(R, lv) {
    if (lv === 1) {
      const kk = R.int(2, 6), sm = R.int(8, 150);
      if (R.chance(0.5)) {
        const S = sm * (kk + 1), big = R.chance(0.5);
        return mk({ text: `Tổng của hai số là ${fmt(S)}. Số lớn gấp ${kk} lần số bé. Tìm số ${big ? 'lớn' : 'bé'}.`, answer: big ? sm * kk : sm, solution: `Coi số bé là 1 phần thì số lớn là ${kk} phần. Tổng số phần: 1 + ${kk} = ${kk + 1}. Số bé: ${fmt(S)} : ${kk + 1} = ${sm}. Số lớn: ${sm} × ${kk} = ${sm * kk}. Số ${big ? 'lớn' : 'bé'} là <b>${big ? sm * kk : sm}</b>.` });
      }
      const D = sm * (kk - 1), big = R.chance(0.5);
      return mk({ text: `Hiệu của hai số là ${fmt(D)}. Số lớn gấp ${kk} lần số bé. Tìm số ${big ? 'lớn' : 'bé'}.`, answer: big ? sm * kk : sm, solution: `Coi số bé là 1 phần thì số lớn là ${kk} phần. Hiệu số phần: ${kk} − 1 = ${kk - 1}. Số bé: ${fmt(D)} : ${kk - 1} = ${sm}. Số lớn: ${sm} × ${kk} = ${sm * kk}. Số ${big ? 'lớn' : 'bé'} là <b>${big ? sm * kk : sm}</b>.` });
    }
    if (lv === 2) {
      let m, n; do { m = R.int(1, 7); n = R.int(m + 1, 9); } while (gcd(m, n) !== 1);
      const u = R.int(5, 60), A = m * u, B = n * u;
      const sumMode = R.chance(0.5);
      const ctx = R.pick([['Số thứ nhất', 'số thứ hai', ''], ['Số gạo nếp', 'số gạo tẻ', ' kg'], ['Số bạn nữ', 'số bạn nam', ' bạn']]);
      const askA = R.chance(0.5);
      const ans = askA ? A : B;
      const text = ctx[2] === ' bạn'
        ? `Một lớp học có ${sumMode ? A + B + ' học sinh' : 'các bạn nam và nữ'}. Số bạn nữ bằng ${frac(m, n)} số bạn nam.${sumMode ? '' : ` Số bạn nam nhiều hơn số bạn nữ ${B - A} bạn.`} Hỏi lớp có bao nhiêu ${askA ? 'bạn nữ' : 'bạn nam'}?`
        : ctx[2] === ' kg'
          ? `Một cửa hàng có gạo nếp và gạo tẻ. Số gạo nếp bằng ${frac(m, n)} số gạo tẻ. ${sumMode ? `Cửa hàng có tất cả ${A + B} kg gạo.` : `Số gạo tẻ nhiều hơn số gạo nếp ${B - A} kg.`} Hỏi cửa hàng có bao nhiêu ki-lô-gam gạo ${askA ? 'nếp' : 'tẻ'}?`
          : `${sumMode ? `Tổng của hai số là ${A + B}` : `Hiệu của hai số là ${B - A}`}. Số thứ nhất bằng ${frac(m, n)} số thứ hai. Tìm số thứ ${askA ? 'nhất' : 'hai'}.`;
      const parts = sumMode ? m + n : n - m, tot = sumMode ? A + B : B - A;
      return mk({ text, answer: ans, solution: `Coi ${ctx[0].toLowerCase()} là ${m} phần thì ${ctx[1]} là ${n} phần. ${sumMode ? 'Tổng' : 'Hiệu'} số phần: ${sumMode ? `${m} + ${n}` : `${n} − ${m}`} = ${parts}. Mỗi phần: ${tot} : ${parts} = ${u}. Đáp số: ${u} × ${askA ? m : n} = <b>${ans}</b>.` });
    }
    const k = R.pick(['erase0', 'add0', 'transfer']);
    if (k === 'erase0') {
      const sm = R.int(12, 99);
      return mk({ text: `Tổng của hai số là ${fmt(sm * 11)}. Nếu xóa chữ số 0 ở hàng đơn vị của số lớn thì được số bé. Tìm số lớn.`, answer: sm * 10, solution: `Xóa chữ số 0 ở hàng đơn vị là giảm số đó 10 lần, nên số lớn gấp 10 lần số bé. Tổng số phần: 10 + 1 = 11. Số bé: ${fmt(sm * 11)} : 11 = ${sm}. Số lớn: ${sm} × 10 = <b>${sm * 10}</b>.` });
    }
    if (k === 'add0') {
      const sm = R.int(12, 199);
      return mk({ text: `Hiệu của hai số là ${fmt(sm * 9)}. Nếu viết thêm chữ số 0 vào bên phải số bé thì được số lớn. Tìm số bé.`, answer: sm, solution: `Viết thêm chữ số 0 vào bên phải là gấp số đó lên 10 lần. Số lớn gấp 10 lần số bé, hiệu số phần: 10 − 1 = 9. Số bé: ${fmt(sm * 9)} : 9 = <b>${sm}</b>.` });
    }
    const kk = R.int(2, 4), u = R.int(10, 60), S = u * (kk + 1), t = R.int(3, Math.min(40, u * kk - 1)), A = u + t;
    return mk({ text: `Hai kho có tất cả ${S} tấn thóc. Nếu chuyển ${t} tấn thóc từ kho thứ nhất sang kho thứ hai thì số thóc ở kho thứ hai gấp ${kk} lần số thóc ở kho thứ nhất. Hỏi lúc đầu kho thứ nhất có bao nhiêu tấn thóc?`, answer: A, solution: `Chuyển thóc giữa hai kho thì tổng vẫn là ${S} tấn. Sau khi chuyển, kho thứ nhất là 1 phần, kho thứ hai là ${kk} phần: kho thứ nhất còn ${S} : ${kk + 1} = ${u} tấn. Lúc đầu kho thứ nhất có: ${u} + ${t} = <b>${A}</b> tấn.` });
  }

  function fr(a, b) { return `${a}/${b}`; }
  function arFracCalc(R, lv) {
    if (lv === 1) {
      const k = R.pick(['reduce', 'same', 'fill']);
      if (k === 'reduce') {
        let p, q; do { q = R.int(2, 12); p = R.int(1, q - 1); } while (gcd(p, q) !== 1);
        const t = R.int(2, 9);
        return mk({ text: `Rút gọn phân số ${fr(p * t, q * t)}${FR_NOTE}.`, answer: frac(p, q), solution: `Chia cả tử số và mẫu số cho ${t}: ${fr(p * t, q * t)} = ${fr(p * t + ' : ' + t, q * t + ' : ' + t)} = <b>${frac(p, q)}</b>.` });
      }
      if (k === 'same') {
        const n = R.int(5, 15), plus = R.chance(0.6);
        let a = R.int(1, n - 1), b = R.int(1, n - 1);
        if (!plus && a < b) [a, b] = [b, a];
        const top = plus ? a + b : a - b;
        if (top === 0 || top % n === 0) return arFracCalc(R, lv);
        return mk({ text: `Tính:<div class="seq">${fr(a, n)} ${plus ? '+' : '−'} ${fr(b, n)} = ${box}</div>${FR_NOTE.trim()}`, answer: frac(top, n), solution: `Cùng mẫu số: ${plus ? 'cộng' : 'trừ'} hai tử số và giữ nguyên mẫu số: ${fr(top, n)}${frac(top, n) !== fr(top, n) ? ` = ${frac(top, n)}` : ''}. Kết quả: <b>${frac(top, n)}</b>.` });
      }
      let p, q; do { q = R.int(2, 9); p = R.int(1, q - 1); } while (gcd(p, q) !== 1);
      const t = R.int(2, 8);
      return mk({ text: `Điền số thích hợp vào ô trống:<div class="seq">${fr(p, q)} = ${box}/${q * t}</div>`, answer: p * t, solution: `Mẫu số ${q} nhân ${t} được ${q * t}, nên tử số cũng nhân ${t}: ${p} × ${t} = <b>${p * t}</b>.` });
    }
    if (lv === 2) {
      const k = R.pick(['add', 'sub', 'mul', 'div']);
      const rnd = () => { let p, q; do { q = R.int(2, 9); p = R.int(1, 2 * q); } while (gcd(p, q) !== 1); return [p, q]; };
      const [a, b] = rnd(), [c, d] = rnd();
      let top, bot, how;
      if (k === 'add') { top = a * d + c * b; bot = b * d; how = `Quy đồng mẫu số rồi cộng: ${fr(a, b)} + ${fr(c, d)} = ${fr(a * d, bot)} + ${fr(c * b, bot)} = ${fr(top, bot)}`; }
      if (k === 'sub') { top = a * d - c * b; bot = b * d; how = `Quy đồng mẫu số rồi trừ: ${fr(a, b)} − ${fr(c, d)} = ${fr(a * d, bot)} − ${fr(c * b, bot)} = ${fr(top, bot)}`; }
      if (k === 'mul') { top = a * c; bot = b * d; how = `Tử nhân tử, mẫu nhân mẫu: ${fr(a, b)} × ${fr(c, d)} = ${fr(top, bot)}`; }
      if (k === 'div') { top = a * d; bot = b * c; how = `Nhân với phân số đảo ngược: ${fr(a, b)} : ${fr(c, d)} = ${fr(a, b)} × ${fr(d, c)} = ${fr(top, bot)}`; }
      if (top <= 0 || top % bot === 0 || (b === d && k !== 'mul' && k !== 'div')) return arFracCalc(R, lv);
      const ans = frac(top, bot);
      const op = { add: '+', sub: '−', mul: '×', div: ':' }[k];
      return mk({ text: `Tính:<div class="seq">${fr(a, b)} ${op} ${fr(c, d)} = ${box}</div>${FR_NOTE.trim()}`, answer: ans, solution: `${how}${ans !== fr(top, bot) ? ` = ${ans}` : ''}. Kết quả: <b>${ans}</b>.` });
    }
    const k = R.pick(['tele', 'prod', 'half', 'mix']);
    if (k === 'tele') {
      const n = R.int(4, 9), terms = range(1, n).map(i => fr(1, i * (i + 1)));
      return mk({ text: `Tính nhanh:<div class="seq">${terms.slice(0, 3).join(' + ')} + ... + ${terms[n - 1]}</div>${FR_NOTE.trim()}`, answer: frac(n, n + 1), solution: `Mỗi số hạng tách thành hiệu: 1/2 = 1 − 1/2; 1/6 = 1/2 − 1/3; 1/12 = 1/3 − 1/4; ...; ${terms[n - 1]} = 1/${n} − 1/${n + 1}. Cộng lại, các số ở giữa triệt tiêu: 1 − 1/${n + 1} = <b>${frac(n, n + 1)}</b>.` });
    }
    if (k === 'prod') {
      const s = R.int(1, 3), n = R.int(s + 4, s + 9), fs = range(s, n - 1).map(i => fr(i, i + 1));
      return mk({ text: `Tính nhanh:<div class="seq">${fs.slice(0, 3).join(' × ')} × ... × ${fs[fs.length - 1]}</div>${FR_NOTE.trim()}`, answer: frac(s, n), solution: `Tử số của phân số này giống mẫu số của phân số trước nên rút gọn được hết, chỉ còn tử số đầu tiên ${s} và mẫu số cuối cùng ${n}: kết quả là <b>${frac(s, n)}</b>.` });
    }
    if (k === 'half') {
      const n = R.int(3, 7), p = 2 ** n;
      return mk({ text: `Tính nhanh:<div class="seq">1/2 + 1/4 + 1/8 + ... + 1/${p}</div>${FR_NOTE.trim()}`, answer: frac(p - 1, p), solution: `Một cái bánh: ăn 1/2, rồi 1/4, rồi 1/8, ... thì phần còn lại luôn bằng phần vừa ăn. Sau khi ăn 1/${p}, phần còn lại là 1/${p}. Tổng: 1 − 1/${p} = <b>${frac(p - 1, p)}</b>.` });
    }
    const b = R.int(2, 6), a = R.int(1, b - 1), c = R.int(1, 5), d = R.int(c + 1, 7), e = R.int(1, 5), f = R.int(2, 7);
    const top = a * d * f + b * c * e, bot = b * d * f;
    if (top % bot === 0) return arFracCalc(R, lv);
    return mk({ text: `Tính:<div class="seq">${fr(a, b)} + ${fr(c, d)} × ${fr(e, f)} = ${box}</div>${FR_NOTE.trim()}`, answer: frac(top, bot), solution: `Nhân trước, cộng sau: ${fr(c, d)} × ${fr(e, f)} = ${frac(c * e, d * f)}. Rồi ${fr(a, b)} + ${frac(c * e, d * f)} = <b>${frac(top, bot)}</b>.` });
  }

  function arFracCmp(R, lv) {
    const vals = [];
    const kind = lv === 1 ? R.pick(['den', 'num']) : 'any';
    const D = R.int(5, 12), N = R.int(2, 7);
    let guard = 0;
    while (vals.length < 4 && guard++ < 200) {
      let p, q;
      if (kind === 'den') { q = D; p = R.int(1, 2 * D); }
      else if (kind === 'num') { p = N; q = R.int(N + 1, N + 12); }
      else { q = R.int(2, 12); p = R.int(1, q + 4); }
      if (gcd(p, q) !== 1 && kind === 'any') continue;
      if (vals.some(([x, y]) => x * q === p * y)) continue;
      vals.push([p, q]);
    }
    const big = R.chance(0.5);
    const sorted = vals.slice().sort((u, v) => u[0] * v[1] - v[0] * u[1]);
    const best = big ? sorted[3] : sorted[0];
    const ans = fr(best[0], best[1]);
    const shown = R.shuffle(vals.map(x => fr(x[0], x[1])));
    const how = kind === 'den' ? 'Các phân số cùng mẫu số: phân số nào có tử số lớn hơn thì lớn hơn.'
      : kind === 'num' ? 'Các phân số cùng tử số: phân số nào có mẫu số bé hơn thì lớn hơn.'
        : `Quy đồng mẫu số hoặc so sánh với 1, với 1/2 để xếp thứ tự: ${sorted.map(x => fr(x[0], x[1])).join(' &lt; ')}.`;
    return mk({ type: 'choice', choices: shown, answer: ans, text: `Trong các phân số ${shown.join('; ')}, phân số nào ${big ? 'lớn nhất' : 'bé nhất'}?`, solution: `${how} Phân số ${big ? 'lớn nhất' : 'bé nhất'} là <b>${ans}</b>.` });
  }

  function arFracOf(R, lv) {
    let m, n; do { n = R.int(2, 9); m = R.int(1, n - 1); } while (gcd(m, n) !== 1);
    if (lv === 1) {
      if (R.chance(0.3) && 60 % n === 0) return mk({ text: `${fr(m, n)} giờ bằng bao nhiêu phút?`, answer: 60 / n * m, solution: `1 giờ = 60 phút. ${fr(m, n)} của 60 phút là: 60 : ${n} × ${m} = <b>${60 / n * m}</b> phút.` });
      const Q = n * R.int(2, 15);
      return mk({ text: `Tìm ${fr(m, n)} của ${Q}.`, answer: Q / n * m, solution: `Muốn tìm ${fr(m, n)} của một số, ta lấy số đó chia cho ${n} rồi nhân với ${m}: ${Q} : ${n} × ${m} = <b>${Q / n * m}</b>.` });
    }
    if (lv === 2) {
      const k = R.pick(['class', 'rice', 'reverse']);
      const u = R.int(3, 12), Q = n * u;
      if (k === 'class') return mk({ text: `Lớp 4A có ${Q} học sinh, trong đó ${fr(m, n)} số học sinh là học sinh nữ. Hỏi lớp 4A có bao nhiêu học sinh nam?`, answer: Q - u * m, solution: `Số học sinh nữ: ${Q} : ${n} × ${m} = ${u * m} bạn. Số học sinh nam: ${Q} − ${u * m} = <b>${Q - u * m}</b> bạn.` });
      if (k === 'rice') { const Qk = Q * 5; return mk({ text: `Một cửa hàng có ${Qk} kg gạo, đã bán được ${fr(m, n)} số gạo đó. Hỏi cửa hàng còn lại bao nhiêu ki-lô-gam gạo?`, answer: Qk - Qk / n * m, solution: `Đã bán: ${Qk} : ${n} × ${m} = ${Qk / n * m} kg. Còn lại: ${Qk} − ${Qk / n * m} = <b>${Qk - Qk / n * m}</b> kg.` }); }
      const A = R.pick(NAMES);
      return mk({ text: `${fr(m, n)} số bi của ${A} là ${m * u} viên. Hỏi ${A} có bao nhiêu viên bi?`, answer: Q, solution: `${m * u} viên ứng với ${m} phần, mỗi phần (1/${n} số bi) là ${m * u} : ${m} = ${u} viên. ${A} có: ${u} × ${n} = <b>${Q}</b> viên bi.` });
    }
    let a, b, c, d; do { b = R.int(2, 5); a = R.int(1, b - 1); d = R.int(2, 5); c = R.int(1, d - 1); } while (gcd(a, b) !== 1 || gcd(c, d) !== 1);
    const kk = R.int(2, 6), N = b * d * kk, r1 = N / b * (b - a), r2 = r1 / d * (d - c);
    return mk({ text: `Một quyển truyện, ngày thứ nhất ${R.pick(NAMES)} đọc ${fr(a, b)} số trang. Ngày thứ hai đọc ${fr(c, d)} số trang còn lại. Sau hai ngày còn ${r2} trang chưa đọc. Hỏi quyển truyện có bao nhiêu trang?`, answer: N, solution: `Ngày thứ hai đọc ${fr(c, d)} số trang còn lại, nên ${r2} trang là ${fr(d - c, d)} số trang còn lại sau ngày thứ nhất. Số trang còn lại sau ngày thứ nhất: ${r2} : ${d - c} × ${d} = ${r1} trang. ${r1} trang là ${fr(b - a, b)} quyển truyện. Quyển truyện có: ${r1} : ${b - a} × ${b} = <b>${N}</b> trang.` });
  }

  function arWord(R, lv) {
    const A = R.pick(NAMES);
    if (lv === 1) {
      if (R.chance(0.5)) {
        const a = R.int(2, 6), p = 500 * R.int(8, 24), b = R.int(2, 5), q = 500 * R.int(4, 16), tot = a * p + b * q;
        const M = tot <= 50000 ? 50000 : tot <= 100000 ? 100000 : 200000;
        return mk({ text: `${A} mua ${a} quyển vở, mỗi quyển giá ${fmt(p)} đồng và ${b} cái bút, mỗi cái giá ${fmt(q)} đồng. ${A} đưa cô bán hàng ${fmt(M)} đồng. Hỏi cô bán hàng trả lại ${A} bao nhiêu tiền (đồng)?`, answer: M - tot, solution: `Tiền vở: ${fmt(p)} × ${a} = ${fmt(a * p)} đồng. Tiền bút: ${fmt(q)} × ${b} = ${fmt(b * q)} đồng. Tổng: ${fmt(tot)} đồng. Trả lại: ${fmt(M)} − ${fmt(tot)} = <b>${fmt(M - tot)}</b> đồng.` });
      }
      const s = R.int(12, 40), w = R.pick([25, 30, 45, 50]), c = R.int(2, 9);
      return mk({ text: `Mỗi xe tải chở ${s} bao gạo, mỗi bao nặng ${w} kg. Hỏi ${c} xe như thế chở được bao nhiêu ki-lô-gam gạo?`, answer: s * w * c, solution: `Mỗi xe chở: ${s} × ${w} = ${s * w} kg. ${c} xe chở: ${s * w} × ${c} = <b>${fmt(s * w * c)}</b> kg.` });
    }
    if (lv === 2) {
      const k = R.pick(['unit', 'boxes', 'step']);
      if (k === 'unit') {
        const n1 = R.int(3, 9), per = R.int(125, 850), n2 = R.int(2, 15);
        if (n1 === n2) return arWord(R, lv);
        return mk({ text: `${n1} xe tải như nhau chở được ${fmt(n1 * per)} kg hàng. Hỏi ${n2} xe tải như thế chở được bao nhiêu ki-lô-gam hàng?`, answer: n2 * per, solution: `Một xe chở: ${fmt(n1 * per)} : ${n1} = ${per} kg. ${n2} xe chở: ${per} × ${n2} = <b>${fmt(n2 * per)}</b> kg.` });
      }
      if (k === 'boxes') {
        const b1 = R.int(3, 8), per = R.int(6, 24), need = R.int(b1 + 2, 40);
        return mk({ text: `Cứ ${b1} hộp bút chì như nhau thì có ${b1 * per} cái bút. Hỏi cần bao nhiêu hộp như thế để có ${need * per} cái bút?`, answer: need, solution: `Mỗi hộp có: ${b1 * per} : ${b1} = ${per} cái. Số hộp cần: ${need * per} : ${per} = <b>${need}</b> hộp.` });
      }
      const p = R.int(15, 40), d = R.int(10, 25), x = R.int(3, 8);
      return mk({ text: `Một cửa hàng ngày đầu bán được ${p * x} kg đường, ngày thứ hai bán được ít hơn ngày đầu ${d} kg, ngày thứ ba bán được gấp đôi ngày thứ hai. Hỏi cả ba ngày bán được bao nhiêu ki-lô-gam đường?`, answer: p * x + 3 * (p * x - d), solution: `Ngày thứ hai: ${p * x} − ${d} = ${p * x - d} kg. Ngày thứ ba: ${p * x - d} × 2 = ${2 * (p * x - d)} kg. Cả ba ngày: ${p * x} + ${p * x - d} + ${2 * (p * x - d)} = <b>${p * x + 3 * (p * x - d)}</b> kg.` });
    }
    const k = R.pick(['food', 'food2', 'shop']);
    if (k === 'food') {
      for (;;) {
        const n = R.int(10, 60), d = R.int(10, 40), m = R.int(2, 40);
        if ((n * d) % (n + m) === 0 && n * d / (n + m) < d) return mk({ text: `Một bếp ăn dự trữ gạo đủ cho ${n} người ăn trong ${d} ngày. Nay có thêm ${m} người nữa. Hỏi số gạo đó đủ cho tất cả ăn trong bao nhiêu ngày? (Mức ăn mỗi người như nhau)`, answer: n * d / (n + m), solution: `Số gạo đủ cho 1 người ăn trong: ${n} × ${d} = ${fmt(n * d)} ngày. Có ${n} + ${m} = ${n + m} người nên ăn được: ${fmt(n * d)} : ${n + m} = <b>${n * d / (n + m)}</b> ngày.` });
      }
    }
    if (k === 'food2') {
      for (;;) {
        const n = R.int(10, 50), d = R.int(12, 40), x = R.int(2, d - 5), m = R.int(2, 40), left = n * (d - x);
        if (left % (n + m) === 0) return mk({ text: `Một đơn vị bộ đội có ${n} người, mang đủ gạo ăn trong ${d} ngày. Sau ${x} ngày, có thêm ${m} người đến. Hỏi số gạo còn lại đủ cho cả đơn vị ăn thêm bao nhiêu ngày nữa?`, answer: left / (n + m), solution: `Sau ${x} ngày, gạo còn lại đủ cho ${n} người ăn ${d} − ${x} = ${d - x} ngày, tức là đủ cho 1 người ăn ${n} × ${d - x} = ${left} ngày. Có ${n + m} người nên ăn được: ${left} : ${n + m} = <b>${left / (n + m)}</b> ngày.` });
      }
    }
    const p = 1000 * R.int(3, 9), x = R.int(4, 12), y = R.int(3, 9), q = p + 1000 * R.int(1, 4);
    return mk({ text: `Mẹ mua ${x} kg cam và ${y} kg táo hết ${fmt(x * p + y * q)} đồng. Biết mỗi ki-lô-gam táo đắt hơn mỗi ki-lô-gam cam ${fmt(q - p)} đồng. Hỏi mỗi ki-lô-gam cam giá bao nhiêu đồng?`, answer: p, solution: `Nếu táo cùng giá với cam thì mẹ trả ít hơn: ${fmt(q - p)} × ${y} = ${fmt((q - p) * y)} đồng, tức là ${fmt(x * p + y * q)} − ${fmt((q - p) * y)} = ${fmt((x + y) * p)} đồng cho ${x + y} kg cam. Mỗi ki-lô-gam cam: ${fmt((x + y) * p)} : ${x + y} = <b>${fmt(p)}</b> đồng.` });
  }

  function arSeries(R, lv) {
    if (lv === 2) {
      const a = R.int(1, 30), d = R.int(2, 6), n = R.int(8, 25), l = a + (n - 1) * d, S = (a + l) * n / 2;
      return mk({ text: `Tính tổng:<div class="seq">${a} + ${a + d} + ${a + 2 * d} + ... + ${l}</div>`, answer: S, solution: `Số số hạng: (${l} − ${a}) : ${d} + 1 = ${n}. Tổng = (số đầu + số cuối) × số số hạng : 2 = (${a} + ${l}) × ${n} : 2 = <b>${fmt(S)}</b>.` });
    }
    const k = R.pick(['div', 'odd', 'even3']);
    if (k === 'div') {
      const kk = R.int(3, 9), a = Math.ceil(10 / kk) * kk, l = Math.floor(99 / kk) * kk, n = (l - a) / kk + 1, S = (a + l) * n / 2;
      return mk({ text: `Tính tổng tất cả các số có hai chữ số chia hết cho ${kk}.`, answer: S, solution: `Các số đó là ${a}, ${a + kk}, ..., ${l}. Số số hạng: (${l} − ${a}) : ${kk} + 1 = ${n}. Tổng: (${a} + ${l}) × ${n} : 2 = <b>${fmt(S)}</b>.` });
    }
    if (k === 'odd') {
      const n = R.int(10, 40);
      return mk({ text: `Dãy số lẻ liên tiếp 1 + 3 + 5 + 7 + ... có tổng bằng ${n * n}. Hỏi dãy có bao nhiêu số hạng?`, answer: n, solution: `Nếu dãy có n số hạng thì số cuối là 2 × n − 1, tổng = (1 + 2 × n − 1) × n : 2 = n × n. Ta có n × n = ${n * n} nên n = <b>${n}</b>.` });
    }
    const a = R.pick([100, 102, 200, 150]), b = a + 2 * R.int(20, 60), n = (b - a) / 2 + 1, S = (a + b) * n / 2;
    return mk({ text: `Tính tổng các số chẵn từ ${a} đến ${b}.`, answer: S, solution: `Các số chẵn cách nhau 2 đơn vị. Số số hạng: (${b} − ${a}) : 2 + 1 = ${n}. Tổng: (${a} + ${b}) × ${n} : 2 = <b>${fmt(S)}</b>.` });
  }

  // =====================================================================
  // LÝ THUYẾT SỐ
  // =====================================================================
  const PLACES = ['hàng đơn vị', 'hàng chục', 'hàng trăm', 'hàng nghìn', 'hàng chục nghìn', 'hàng trăm nghìn', 'hàng triệu', 'hàng chục triệu'];
  const distinctNum = (R, len) => { const d = R.sample(range(0, 9), len); if (d[0] === 0) [d[0], d[1]] = [d[1], d[0]]; return +d.join(''); };

  function ntPlace0(R) {
    const n = distinctNum(R, 5), s = String(n), pos = R.int(0, 4), dgt = +s[4 - pos];
    if (R.chance(0.5)) return ch(R, cap(PLACES[pos]), PLACES.slice(0, 5).map(cap), { text: `Trong số ${fmt(n)}, chữ số ${dgt} thuộc hàng nào?`, solution: `Đếm từ phải sang trái: đơn vị, chục, trăm, nghìn, chục nghìn. Chữ số ${dgt} thuộc <b>${PLACES[pos]}</b>.` });
    const v = dgt * 10 ** pos;
    if (v === 0) return ntPlace0(R);
    return mk({ text: `Trong số ${fmt(n)}, chữ số ${dgt} có giá trị là bao nhiêu?`, answer: v, solution: `Chữ số ${dgt} thuộc ${PLACES[pos]} nên có giá trị là <b>${fmt(v)}</b>.` });
  }

  function ntCmp0(R) {
    const ds = R.sample(range(1, 9), 5);
    const set = new Set();
    while (set.size < 4) set.add(+R.shuffle(ds).join(''));
    const ns = [...set], big = R.chance(0.5);
    const ans = fmt(big ? Math.max(...ns) : Math.min(...ns));
    return mk({ type: 'choice', choices: ns.map(fmt), answer: ans, text: `Trong các số ${ns.map(fmt).join('; ')}, số nào ${big ? 'lớn nhất' : 'bé nhất'}?`, solution: `Các số đều có 5 chữ số. So sánh lần lượt từ hàng chục nghìn, rồi đến hàng nghìn, ... Số ${big ? 'lớn nhất' : 'bé nhất'} là <b>${ans}</b>.` });
  }

  function ntNext0(R) {
    const k = R.pick(['after', 'before', 'even', 'odd']);
    const n = R.pick([R.int(10000, 99998), R.int(1, 9) * 10000 - 1, R.int(1, 9) * 10000, R.int(100, 999) * 100]);
    if (k === 'after') return mk({ text: `Số liền sau của số ${fmt(n)} là số nào?`, answer: n + 1, solution: `Số liền sau thì thêm 1: ${fmt(n)} + 1 = <b>${fmt(n + 1)}</b>.` });
    if (k === 'before') return mk({ text: `Số liền trước của số ${fmt(n)} là số nào?`, answer: n - 1, solution: `Số liền trước thì bớt 1: ${fmt(n)} − 1 = <b>${fmt(n - 1)}</b>.` });
    const want = k === 'even' ? 0 : 1, m = n % 2 === want ? n + 2 : n + 1;
    return mk({ text: `Số ${k === 'even' ? 'chẵn' : 'lẻ'} liền sau của số ${fmt(n)} là số nào?`, answer: m, solution: `Hai số ${k === 'even' ? 'chẵn' : 'lẻ'} liên tiếp hơn kém nhau 2 đơn vị. ${n % 2 === want ? `${fmt(n)} là số ${k === 'even' ? 'chẵn' : 'lẻ'}, nên cộng thêm 2` : `${fmt(n)} không phải số ${k === 'even' ? 'chẵn' : 'lẻ'}, nên cộng thêm 1`}: <b>${fmt(m)}</b>.` });
  }

  const ROMAN = n => { const t = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]; let s = ''; for (const [v, r] of t) while (n >= v) { s += r; n -= v; } return s; };
  function ntRoman0(R) {
    const n = R.int(4, 30);
    if (R.chance(0.5)) return mk({ text: `Số La Mã <b style="font-size:1.3em">${ROMAN(n)}</b> có giá trị là bao nhiêu?`, answer: n, solution: `X = 10, V = 5, I = 1. Chữ số nhỏ đứng trước chữ số lớn thì trừ, đứng sau thì cộng. ${ROMAN(n)} = <b>${n}</b>.` });
    return ch(R, ROMAN(n), near(n, [-1, 1, -2, 2, 10, -10]).filter(x => x > 0 && x <= 39).map(ROMAN).concat([ROMAN(n).split('').reverse().join('')]).filter(s => s !== ROMAN(n)), { text: `Số ${n} viết bằng chữ số La Mã là:`, solution: `${n} = ${ROMAN(n).split('').join(' ')} → <b>${ROMAN(n)}</b>.` });
  }

  function ntBigRead(R, lv) {
    if (lv === 1) {
      const k = R.pick(['compose', 'value', 'digit']);
      if (k === 'compose') {
        const parts = [[R.int(1, 99), 1000000, 'triệu'], [R.int(0, 9), 100000, 'trăm nghìn'], [R.int(0, 9), 10000, 'chục nghìn'], [R.int(1, 9), 1000, 'nghìn'], [R.int(0, 9), 100, 'trăm'], [R.int(1, 9), 1, 'đơn vị']];
        const used = parts.filter(p => p[0] > 0 && (p[1] === 1000000 || R.chance(0.6)));
        const n = sum(used.map(p => p[0] * p[1]));
        return mk({ text: `Số gồm ${used.map(p => `${p[0]} ${p[2]}`).join(', ')} viết là số nào?`, answer: n, solution: `${used.map(p => fmt(p[0] * p[1])).join(' + ')} = <b>${fmt(n)}</b>.` });
      }
      const n = distinctNum(R, R.int(7, 8)), s = String(n), pos = R.int(2, s.length - 1), dgt = +s[s.length - 1 - pos];
      if (k === 'value' && dgt > 0) return mk({ text: `Trong số ${fmt(n)}, chữ số ${dgt} có giá trị là bao nhiêu?`, answer: dgt * 10 ** pos, solution: `Chữ số ${dgt} thuộc ${PLACES[pos]}, nên giá trị là <b>${fmt(dgt * 10 ** pos)}</b>.` });
      return mk({ text: `Chữ số ở ${PLACES[pos]} của số ${fmt(n)} là chữ số nào?`, answer: dgt, solution: `Các hàng tính từ phải sang trái: đơn vị, chục, trăm, nghìn, chục nghìn, trăm nghìn, triệu, chục triệu. Chữ số ở ${PLACES[pos]} là <b>${dgt}</b>.` });
    }
    const k = R.pick(['times', 'extreme', 'count']);
    if (k === 'times') {
      const p1 = R.int(3, 7), p2 = R.int(0, p1 - 2), dg = R.int(1, 9);
      const arr = Array.from({ length: 8 }, () => R.int(0, 9)).map(x => (x === dg ? (x + 1) % 10 : x));
      arr[7 - p1] = dg; arr[7 - p2] = dg;
      let s = arr.join('').replace(/^0+/, '');
      if (s.length <= p1) s = '1' + s;
      const n = +s;
      return mk({ text: `Trong số ${fmt(n)}, giá trị của chữ số ${dg} ở ${PLACES[p1]} gấp bao nhiêu lần giá trị của chữ số ${dg} ở ${PLACES[p2]}?`, answer: 10 ** (p1 - p2), solution: `Giá trị hai chữ số: ${fmt(dg * 10 ** p1)} và ${fmt(dg * 10 ** p2)}. ${fmt(dg * 10 ** p1)} : ${fmt(dg * 10 ** p2)} = <b>${fmt(10 ** (p1 - p2))}</b> lần.` });
    }
    if (k === 'extreme') {
      const L = R.int(6, 8), kind = R.pick(['max', 'min', 'minEven', 'maxOdd', 'minOdd', 'maxEven']);
      const isMax = kind.startsWith('max'), par = kind.endsWith('Even') ? 0 : kind.endsWith('Odd') ? 1 : -1;
      const out = [], used = new Set();
      for (let i = 0; i < L; i++) {
        const order = isMax ? range(0, 9).reverse() : range(0, 9);
        for (const dg of order) {
          if (used.has(dg) || (i === 0 && dg === 0)) continue;
          const rest = L - i - 1;
          if (i === L - 1 && par >= 0 && dg % 2 !== par) continue;
          const left = range(0, 9).filter(x => !used.has(x) && x !== dg);
          if (rest > 0 && par >= 0 && !left.some(x => x % 2 === par)) continue;
          out.push(dg); used.add(dg); break;
        }
      }
      const n = +out.join('');
      const nm = `số ${par === 0 ? 'chẵn ' : par === 1 ? 'lẻ ' : ''}${isMax ? 'lớn nhất' : 'bé nhất'} có ${L} chữ số khác nhau`;
      return mk({ text: `Tìm ${nm}.`, answer: n, solution: `Chọn lần lượt từ hàng cao nhất, mỗi hàng chọn chữ số ${isMax ? 'lớn nhất' : 'bé nhất'} còn dùng được (chữ số đầu khác 0${par >= 0 ? `, chữ số tận cùng phải ${par ? 'lẻ' : 'chẵn'}` : ''}). Số cần tìm là <b>${fmt(n)}</b>.` });
    }
    const t = R.pick([[6, 'số có sáu chữ số', 900000, 'Từ 100.000 đến 999.999 có 999.999 − 100.000 + 1 = '], [7, 'số tròn triệu có tám chữ số', 90, 'Đó là 10.000.000, 11.000.000, ..., 99.000.000: có 99 − 10 + 1 = '], [5, 'số có năm chữ số', 90000, 'Từ 10.000 đến 99.999 có 99.999 − 10.000 + 1 = '], [8, 'số tròn trăm nghìn có bảy chữ số', 90, 'Đó là 1.000.000, 1.100.000, ..., 9.900.000: có 99 − 10 + 1 = ']]);
    return mk({ text: `Có tất cả bao nhiêu ${t[1]}?`, answer: t[2], solution: `${t[3]}<b>${fmt(t[2])}</b> số.` });
  }

  function ntRound(R, lv) {
    if (lv === 1) {
      const n = R.int(100000, 9999999), p = R.pick([3, 4, 5]), u = 10 ** p, r = Math.round(n / u) * u;
      const dgt = Math.floor(n / (u / 10)) % 10;
      return mk({ text: `Làm tròn số ${fmt(n)} đến ${PLACES[p]} ta được số nào?`, answer: r, solution: `Xét chữ số ngay bên phải ${PLACES[p]} là ${dgt}. ${dgt >= 5 ? 'Chữ số này ≥ 5 nên làm tròn lên' : 'Chữ số này < 5 nên làm tròn xuống'}: <b>${fmt(r)}</b>.` });
    }
    const p = R.pick([2, 3]), u = 10 ** p, base = R.int(11, 99) * u, k = R.pick(['max', 'min', 'maxOdd', 'minEven']);
    const lo2 = base - u / 2, hi = base + u / 2 - 1;
    const ans = k === 'max' ? hi : k === 'min' ? lo2 : k === 'maxOdd' ? (hi % 2 ? hi : hi - 1) : (lo2 % 2 ? lo2 + 1 : lo2);
    const nm = { max: 'lớn nhất', min: 'bé nhất', maxOdd: 'lẻ lớn nhất', minEven: 'chẵn bé nhất' }[k];
    return mk({ text: `Một số tự nhiên khi làm tròn đến ${PLACES[p]} thì được ${fmt(base)}. Số ${nm} thỏa mãn là số nào?`, answer: ans, solution: `Các số làm tròn đến ${PLACES[p]} được ${fmt(base)} là các số từ ${fmt(lo2)} đến ${fmt(hi)}. Số ${nm} trong đó là <b>${fmt(ans)}</b>.` });
  }

  const DIVRULE = { 2: 'tận cùng là 0, 2, 4, 6, 8', 3: 'tổng các chữ số chia hết cho 3', 5: 'tận cùng là 0 hoặc 5', 9: 'tổng các chữ số chia hết cho 9' };
  const ov = s => `<span style="text-decoration:overline">${s}</span>`;
  function ntDivis(R, lv) {
    if (lv === 1) {
      const k = R.pick([2, 3, 5, 9, 10]);
      const ok = n => (k === 10 ? n % 10 === 0 : n % k === 0);
      let good; do { good = R.int(100, 9999); } while (!ok(good));
      const bad = [];
      while (bad.length < 3) { const x = R.int(100, 9999); if (!ok(x) && !bad.includes(x) && (k !== 9 || R.chance(0.5) || x % 3 === 0)) bad.push(x); }
      const nm = k === 10 ? 'cả 2 và 5' : k;
      return mk({ type: 'choice', choices: R.shuffle([good, ...bad].map(String)), answer: String(good), text: `Số nào dưới đây chia hết cho ${nm}?`, solution: `Dấu hiệu: ${k === 10 ? 'chia hết cho cả 2 và 5 thì tận cùng là 0' : `chia hết cho ${k} thì ${DIVRULE[k]}`}. ${k === 3 || k === 9 ? `Số ${good} có tổng chữ số ${digitsOf(good).join(' + ')} = ${digitSum(good)}. ` : ''}Số đó là <b>${good}</b>.` });
    }
    // Số có một hoặc hai chữ số chưa biết a, b
    const L = lv === 2 ? R.int(3, 4) : 4;
    const two = lv === 3;
    const divs = lv === 2 ? R.pick([[9], [3], [2, 3], [3, 5], [2, 9]]) : R.pick([[2, 5, 9], [5, 9], [2, 9], [3, 5], [2, 3, 5], [5, 3]]);
    const pa = two ? R.int(1, L - 2) : R.int(0, L - 1), pb = two ? L - 1 : -1;
    const tmpl = range(0, L - 1).map(i => (i === pa || i === pb ? null : R.int(i === 0 ? 1 : 0, 9)));
    const pattern = tmpl.map((d, i) => (i === pa ? 'a' : i === pb ? 'b' : d)).join('');
    const sols = [];
    for (let a = pa === 0 ? 1 : 0; a <= 9; a++) for (let b = 0; b <= (two ? 9 : 0); b++) {
      const n = +tmpl.map((d, i) => (i === pa ? a : i === pb ? b : d)).join('');
      if (divs.every(d => n % d === 0)) sols.push(n);
    }
    if (!sols.length) return ntDivis(R, lv);
    const nm = divs.length === 1 ? divs[0] : divs.slice(0, -1).join(', ') + ' và ' + divs[divs.length - 1];
    const rules = divs.map(d => `chia hết cho ${d} thì ${DIVRULE[d]}`).join('; ');
    const list = sols.map(fmt).join(', ');
    let ask, ans;
    if (sols.length === 1) { ask = two ? 'Tìm số đó.' : 'Tìm chữ số a.'; ans = two ? sols[0] : +String(sols[0])[pa]; }
    else { const m = R.pick(['count', 'max', 'min']); ask = m === 'count' ? 'Có bao nhiêu số như vậy?' : `Tìm số ${m === 'max' ? 'lớn nhất' : 'bé nhất'} như vậy.`; ans = m === 'count' ? sols.length : m === 'max' ? sols[sols.length - 1] : sols[0]; }
    return mk({ text: `Thay ${two ? 'a, b bằng chữ số thích hợp' : 'a bằng chữ số thích hợp'} để số ${ov(pattern)} chia hết cho ${divs.length > 1 ? 'cả ' : ''}${nm}. ${ask}`, answer: ans, solution: `Nhớ lại: ${rules}. Thử các chữ số, ta được ${sols.length === 1 ? 'số duy nhất' : 'các số'}: ${list}. Đáp số: <b>${typeof ans === 'number' && ans >= 1000 ? fmt(ans) : ans}</b>.` });
  }

  function ntCountDiv(R, lv) {
    const cnt = (N, k) => Math.floor(N / k);
    if (lv === 1) {
      const k = R.pick([2, 3, 5, 9]), N = R.int(40, 200), l = cnt(N, k) * k;
      return mk({ text: `Từ 1 đến ${N} có bao nhiêu số chia hết cho ${k}?`, answer: cnt(N, k), solution: `Các số đó là ${k}, ${2 * k}, ${3 * k}, ..., ${l}. Số các số: (${l} − ${k}) : ${k} + 1 = <b>${cnt(N, k)}</b>.` });
    }
    if (lv === 2) {
      const k = R.int(2, 9);
      if (R.chance(0.5)) {
        const a = Math.ceil(100 / k) * k, l = Math.floor(999 / k) * k, n = (l - a) / k + 1;
        return mk({ text: `Có bao nhiêu số có ba chữ số chia hết cho ${k}?`, answer: n, solution: `Số bé nhất: ${a}, số lớn nhất: ${l}. Số các số: (${l} − ${a}) : ${k} + 1 = <b>${n}</b>.` });
      }
      const A = R.int(20, 300), B = A + R.int(50, 400), a = Math.ceil(A / k) * k, l = Math.floor(B / k) * k, n = (l - a) / k + 1;
      return mk({ text: `Từ ${A} đến ${B} có bao nhiêu số chia hết cho ${k}?`, answer: n, solution: `Số đầu tiên chia hết cho ${k}: ${a}; số cuối cùng: ${l}. Số các số: (${l} − ${a}) : ${k} + 1 = <b>${n}</b>.` });
    }
    const N = R.int(100, 600), k = R.pick(['and10', 'and15', 'and18', 'or25', '3not9', 'not2not5']);
    if (k === 'and10' || k === 'and15' || k === 'and18') {
      const [m, nm] = { and10: [10, '2 và 5'], and15: [15, '3 và 5'], and18: [18, '2 và 9'] }[k];
      return mk({ text: `Từ 1 đến ${N} có bao nhiêu số chia hết cho cả ${nm}?`, answer: cnt(N, m), solution: `Số chia hết cho cả ${nm} là số chia hết cho ${m}: ${m}, ${2 * m}, ..., ${cnt(N, m) * m}. Có <b>${cnt(N, m)}</b> số.` });
    }
    if (k === 'or25') { const ans = cnt(N, 2) + cnt(N, 5) - cnt(N, 10); return mk({ text: `Từ 1 đến ${N} có bao nhiêu số chia hết cho 2 hoặc chia hết cho 5?`, answer: ans, solution: `Chia hết cho 2: ${cnt(N, 2)} số. Chia hết cho 5: ${cnt(N, 5)} số. Các số chia hết cho cả 2 và 5 (chia hết cho 10) bị đếm hai lần: ${cnt(N, 10)} số. Kết quả: ${cnt(N, 2)} + ${cnt(N, 5)} − ${cnt(N, 10)} = <b>${ans}</b>.` }); }
    if (k === '3not9') { const ans = cnt(N, 3) - cnt(N, 9); return mk({ text: `Từ 1 đến ${N} có bao nhiêu số chia hết cho 3 nhưng không chia hết cho 9?`, answer: ans, solution: `Chia hết cho 3: ${cnt(N, 3)} số. Trong đó chia hết cho 9: ${cnt(N, 9)} số (số chia hết cho 9 thì chia hết cho 3). Kết quả: ${cnt(N, 3)} − ${cnt(N, 9)} = <b>${ans}</b>.` }); }
    const ans = N - (cnt(N, 2) + cnt(N, 5) - cnt(N, 10));
    return mk({ text: `Từ 1 đến ${N} có bao nhiêu số không chia hết cho 2 và cũng không chia hết cho 5?`, answer: ans, solution: `Số chia hết cho 2 hoặc 5: ${cnt(N, 2)} + ${cnt(N, 5)} − ${cnt(N, 10)} = ${cnt(N, 2) + cnt(N, 5) - cnt(N, 10)}. Còn lại: ${N} − ${cnt(N, 2) + cnt(N, 5) - cnt(N, 10)} = <b>${ans}</b> số.` });
  }

  function ntRemainder(R, lv) {
    if (lv === 1) {
      if (R.chance(0.3)) { const d = R.int(3, 12); return mk({ text: `Trong phép chia cho ${d}, số dư lớn nhất có thể là bao nhiêu?`, answer: d - 1, solution: `Số dư luôn bé hơn số chia, nên số dư lớn nhất là ${d} − 1 = <b>${d - 1}</b>.` }); }
      const d = R.int(3, 9), q = R.int(15, 999), r = R.int(1, d - 1), n = d * q + r;
      return mk({ text: `Phép chia ${fmt(n)} : ${d} có số dư là bao nhiêu?`, answer: r, solution: `${fmt(n)} : ${d} = ${q} (dư ${r}), vì ${q} × ${d} = ${fmt(d * q)} và ${fmt(n)} − ${fmt(d * q)} = <b>${r}</b>.` });
    }
    if (lv === 2) {
      const k = R.pick([9, 3, 5, 2, 10]), n = R.int(10000, 9999999);
      const r = n % k;
      const how = k === 9 || k === 3 ? `Số dư khi chia cho ${k} bằng số dư của tổng các chữ số khi chia cho ${k}. Tổng các chữ số: ${digitsOf(n).join(' + ')} = ${digitSum(n)}; ${digitSum(n)} chia ${k} dư ${r}.`
        : `Số dư khi chia cho ${k} chỉ phụ thuộc chữ số tận cùng${k === 10 ? '' : ` (chữ số ${n % 10} chia ${k} dư ${r})`}.`;
      return mk({ text: `Không thực hiện phép chia, hãy cho biết số ${fmt(n)} chia cho ${k} dư bao nhiêu?`, answer: r, solution: `${how} Số dư là <b>${r}</b>.` });
    }
    const k = R.pick(['crt', 'sub', 'maxrem']);
    if (k === 'crt') {
      const r2 = R.int(0, 1), r5 = R.int(0, 4), m = R.pick([3, 9]), rm = R.int(0, m - 1), big = R.chance(0.5);
      const p = x => x % 2 === r2 && x % 5 === r5 && x % m === rm;
      const ans = big ? lastIn(100, 999, p) : firstIn(100, 999, p), u = ans % 10;
      const say = (d, r) => (r ? `chia ${d} dư ${r}` : `chia hết cho ${d}`);
      return mk({ text: `Tìm số ${big ? 'lớn nhất' : 'bé nhất'} có ba chữ số, biết số đó ${say(2, r2)}, ${say(5, r5)} và ${say(m, rm)}.`, answer: ans, solution: `${cap(say(2, r2))} và ${say(5, r5)} nên chữ số tận cùng là ${u}. ${cap(say(m, rm))} nên tổng các chữ số ${rm ? `chia ${m} dư ${rm}` : `chia hết cho ${m}`}. Thử từ ${big ? '99' + u + ' trở xuống' : '10' + u + ' trở lên'} (mỗi lần ${big ? 'bớt' : 'thêm'} 10), số đầu tiên thỏa mãn là <b>${ans}</b>.` });
    }
    if (k === 'sub') {
      const [M, d] = R.pick([[6, 3], [6, 2], [10, 5], [10, 2], [15, 5], [15, 3], [18, 9], [18, 3], [12, 3], [45, 9], [45, 5]]), r = R.int(1, M - 1);
      return mk({ text: `Một số chia cho ${M} dư ${r}. Hỏi số đó chia cho ${d} dư bao nhiêu?`, answer: r % d, solution: `Số đó = ${M} × thương + ${r}. Vì ${M} chia hết cho ${d} nên số dư khi chia cho ${d} bằng số dư của ${r} khi chia cho ${d}: <b>${r % d}</b>.` });
    }
    const d = R.int(6, 15), q = R.int(12, 99);
    return mk({ text: `Một phép chia có số chia là ${d}, thương là ${q} và số dư là số dư lớn nhất có thể. Tìm số bị chia.`, answer: d * q + d - 1, solution: `Số dư lớn nhất là ${d} − 1 = ${d - 1}. Số bị chia: ${q} × ${d} + ${d - 1} = <b>${d * q + d - 1}</b>.` });
  }

  function ntParity(R, lv) {
    const EO = ['Chẵn', 'Lẻ'];
    const say = b => (b ? 'Lẻ' : 'Chẵn');
    if (lv === 1) {
      const xs = range(1, R.int(3, 5)).map(() => R.int(101, 9999));
      const isSum = R.chance(0.6);
      const odd = isSum ? xs.filter(x => x % 2).length % 2 === 1 : xs.every(x => x % 2);
      return mk({ type: 'choice', choices: EO, answer: say(odd), text: `Không cần tính, hãy cho biết ${isSum ? 'tổng' : 'tích'} sau là số chẵn hay số lẻ?<div class="seq">${xs.join(isSum ? ' + ' : ' × ')}</div>`, solution: isSum ? `Tổng có ${xs.filter(x => x % 2).length} số lẻ. Tổng là số lẻ khi số các số lẻ là số lẻ. Vậy tổng là số <b>${say(odd).toLowerCase()}</b>.` : `Tích là số lẻ khi mọi thừa số đều lẻ; chỉ cần một thừa số chẵn thì tích chẵn. Vậy tích là số <b>${say(odd).toLowerCase()}</b>.` });
    }
    if (lv === 2) {
      const k = R.pick(['1ton', 'odds', 'mix']);
      if (k === '1ton') { const n = R.int(10, 99), S = n * (n + 1) / 2; return mk({ type: 'choice', choices: EO, answer: say(S % 2), text: `Tổng 1 + 2 + 3 + ... + ${n} là số chẵn hay số lẻ?`, solution: `Từ 1 đến ${n} có ${Math.ceil(n / 2)} số lẻ. ${Math.ceil(n / 2)} là số ${Math.ceil(n / 2) % 2 ? 'lẻ' : 'chẵn'} nên tổng là số <b>${say(S % 2).toLowerCase()}</b> (tổng bằng ${fmt(S)}).` }); }
      if (k === 'odds') { const n = R.int(5, 40); return mk({ type: 'choice', choices: EO, answer: say(n % 2), text: `Tổng của ${n} số lẻ bất kì là số chẵn hay số lẻ?`, solution: `Cứ hai số lẻ cộng lại được số chẵn. ${n} số lẻ ${n % 2 ? `gồm ${(n - 1) / 2} cặp và thừa 1 số lẻ` : `ghép được ${n / 2} cặp`}, nên tổng là số <b>${say(n % 2).toLowerCase()}</b>.` }); }
      const a = R.int(11, 99) * 2 + 1, b = R.int(11, 99) * 2 + 1, c = R.int(101, 999);
      const v = a * b + c;
      return mk({ type: 'choice', choices: EO, answer: say(v % 2), text: `Không cần tính, cho biết kết quả sau là số chẵn hay số lẻ?<div class="seq">${a} × ${b} + ${c}</div>`, solution: `${a} × ${b} là tích hai số lẻ nên là số lẻ. Số lẻ cộng ${c} (số ${c % 2 ? 'lẻ' : 'chẵn'}) được số <b>${say(v % 2).toLowerCase()}</b>.` });
    }
    const k = R.pick(['can', 'cards', 'flip']);
    if (k === 'can') {
      const n = R.int(5, 15), S = R.int(30, 200), ok = (S % 2) === (n % 2) && S >= n;
      return mk({ type: 'choice', choices: ['Có', 'Không'], answer: ok ? 'Có' : 'Không', text: `Có thể chọn ${n} số lẻ (có thể trùng nhau) để tổng của chúng bằng ${S} được không?`, solution: `Tổng của ${n} số lẻ là số ${n % 2 ? 'lẻ' : 'chẵn'}. ${S} là số ${S % 2 ? 'lẻ' : 'chẵn'}${ok ? `, cùng tính chẵn lẻ, ví dụ ${n - 1} số 1 và số ${S - n + 1}` : ''}. Vậy câu trả lời là <b>${ok ? 'Có' : 'Không'}</b>.` });
    }
    if (k === 'cards') {
      const n = R.int(6, 12), S = n * (n + 1) / 2;
      return mk({ type: 'choice', choices: ['Có', 'Không'], answer: S % 2 ? 'Không' : 'Có', text: `Có ${n} tấm thẻ ghi các số 1, 2, 3, ..., ${n}. Có thể chia các thẻ thành hai nhóm sao cho tổng các số ở hai nhóm bằng nhau không?`, solution: `Tổng tất cả các số: ${n} × ${n + 1} : 2 = ${S}. ${S % 2 ? `${S} là số lẻ nên không chia được thành hai phần bằng nhau` : `${S} là số chẵn, mỗi nhóm cần tổng ${S / 2}, và ta luôn ghép được`}. Câu trả lời: <b>${S % 2 ? 'Không' : 'Có'}</b>.` });
    }
    const n = R.int(5, 15);
    return mk({ type: 'choice', choices: ['Có', 'Không'], answer: n % 2 ? 'Không' : 'Có', text: `Có ${n} cái cốc đều đặt ngửa (miệng cốc hướng lên). Mỗi lượt được lật đúng 2 cái cốc. Sau một số lượt, có thể làm cho tất cả ${n} cái cốc đều úp xuống không?`, solution: `Mỗi lượt lật 2 cốc nên số cốc úp xuống tăng 2, giảm 2 hoặc không đổi, tức là luôn là số chẵn. ${n % 2 ? `${n} là số lẻ nên không thể. Câu trả lời: <b>Không</b>.` : `${n} là số chẵn: mỗi lượt lật 2 cốc đang ngửa, sau ${n / 2} lượt là xong. Câu trả lời: <b>Có</b>.`}` });
  }

  function ntLastDigit(R, lv) {
    if (lv === 2) {
      const k = R.pick(['prod', 'pow']);
      if (k === 'prod') {
        const xs = range(1, R.int(3, 4)).map(() => R.int(12, 999));
        const u = xs.reduce((p, x) => (p * (x % 10)) % 10, 1);
        return mk({ text: `Tích sau có chữ số tận cùng là chữ số nào?<div class="seq">${xs.join(' × ')}</div>`, answer: u, solution: `Chỉ cần nhân các chữ số tận cùng: ${xs.map(x => x % 10).join(' × ')} có tận cùng là <b>${u}</b>.` });
      }
      const [b, cyc] = R.pick([[9, [9, 1]], [4, [4, 6]], [5, [5]], [6, [6]], [2, [2, 4, 8, 6]], [3, [3, 9, 7, 1]]]), n = R.int(5, 30);
      const u = cyc[(n - 1) % cyc.length];
      return mk({ text: `Tích của ${n} thừa số ${b} (${Array(4).fill(b).join(' × ')} × ... × ${b}) có chữ số tận cùng là chữ số nào?`, answer: u, solution: `Chữ số tận cùng lặp lại theo chu kì: ${cyc.join(', ')}${cyc.length > 1 ? ', ...' : ''}. ${cyc.length > 1 ? `Chu kì dài ${cyc.length}; ${n} chia ${cyc.length} dư ${n % cyc.length}, ứng với vị trí thứ ${(n - 1) % cyc.length + 1} trong chu kì` : 'Luôn giữ nguyên'}. Tận cùng là <b>${u}</b>.` });
    }
    const k = R.pick(['zeros', 'oddprod', 'pow', 'range']);
    if (k === 'zeros') { const n = R.int(10, 60), z = Math.floor(n / 5) + Math.floor(n / 25); return mk({ text: `Tích 1 × 2 × 3 × ... × ${n} có tận cùng bao nhiêu chữ số 0?`, answer: z, solution: `Mỗi cặp thừa số 2 × 5 tạo ra một chữ số 0, và thừa số 2 có nhiều hơn thừa số 5. Các số chia hết cho 5: ${Math.floor(n / 5)} số${n >= 25 ? `; trong đó các số chia hết cho 25 (25${n >= 50 ? ', 50' : ''}) cho thêm ${Math.floor(n / 25)} thừa số 5` : ''}. Có <b>${z}</b> chữ số 0.` }); }
    if (k === 'oddprod') { const n = 2 * R.int(4, 30) + 1; return mk({ text: `Tích của các số lẻ từ 1 đến ${n} (1 × 3 × 5 × ... × ${n}) có chữ số tận cùng là chữ số nào?`, answer: 5, solution: `Tích có thừa số 5 nên tận cùng là 0 hoặc 5. Tích các số lẻ là số lẻ nên tận cùng không thể là 0. Tận cùng là <b>5</b>.` }); }
    if (k === 'pow') {
      const [b, cyc] = R.pick([[2, [2, 4, 8, 6]], [3, [3, 9, 7, 1]], [7, [7, 9, 3, 1]], [8, [8, 4, 2, 6]]]), n = R.int(20, 2026);
      const u = cyc[(n - 1) % 4];
      return mk({ text: `Tích của ${fmt(n)} thừa số ${b} có chữ số tận cùng là chữ số nào?`, answer: u, solution: `Chữ số tận cùng lặp lại theo chu kì 4: ${cyc.join(', ')}. ${fmt(n)} chia 4 dư ${n % 4}${n % 4 === 0 ? ' (ứng với vị trí thứ 4)' : ` (ứng với vị trí thứ ${n % 4})`}. Tận cùng là <b>${u}</b>.` });
    }
    const a = R.int(11, 89), b = a + R.int(3, 7);
    let u = 1; for (let x = a; x <= b; x++) u = (u * (x % 10)) % 10;
    return mk({ text: `Tích ${range(a, b).join(' × ')} có chữ số tận cùng là chữ số nào?`, answer: u, solution: `Nhân lần lượt các chữ số tận cùng (chỉ giữ lại chữ số tận cùng sau mỗi lần nhân): ${range(a, b).map(x => x % 10).join(' × ')} → tận cùng là <b>${u}</b>.` });
  }

  function ntDigitCount(R, lv) {
    if (lv === 1) { const n = R.int(20, 99), d = 9 + 2 * (n - 9); return mk({ text: `Viết các số tự nhiên từ 1 đến ${n} cần dùng bao nhiêu chữ số?`, answer: d, solution: `Từ 1 đến 9: 9 chữ số. Từ 10 đến ${n}: ${n - 9} số, mỗi số 2 chữ số: ${2 * (n - 9)} chữ số. Tổng: 9 + ${2 * (n - 9)} = <b>${d}</b>.` }); }
    if (lv === 2) {
      if (R.chance(0.5)) { const n = R.int(100, 999), d = 189 + 3 * (n - 99); return mk({ text: `Viết các số tự nhiên từ 1 đến ${n} cần dùng bao nhiêu chữ số?`, answer: d, solution: `Từ 1 đến 9: 9 chữ số. Từ 10 đến 99: 90 × 2 = 180 chữ số. Từ 100 đến ${n}: ${n - 99} số × 3 = ${fmt(3 * (n - 99))} chữ số. Tổng: 9 + 180 + ${fmt(3 * (n - 99))} = <b>${fmt(d)}</b>.` }); }
      const dg = R.int(1, 9), n = R.int(40, 150);
      let c = 0; for (let x = 1; x <= n; x++) c += String(x).split('').filter(z => +z === dg).length;
      let cu = 0, ct = 0, chh = 0; for (let x = 1; x <= n; x++) { if (x % 10 === dg) cu++; if (x >= 10 && Math.floor(x / 10) % 10 === dg) ct++; if (Math.floor(x / 100) === dg) chh++; }
      return mk({ text: `Khi viết các số từ 1 đến ${n}, chữ số ${dg} được viết bao nhiêu lần?`, answer: c, solution: `Hàng đơn vị (${dg}, ${10 + dg}, ${20 + dg}, ...): ${cu} lần. Hàng chục: ${ct} lần${chh ? `. Hàng trăm: ${chh} lần` : ''}. Tổng: <b>${c}</b> lần.` });
    }
    const k = R.pick(['kth', 'rev', 'count']);
    if (k === 'kth') {
      const K = R.int(10, 400); let s = ''; for (let x = 1; s.length < K; x++) s += x;
      const dgt = +s[K - 1];
      let explain;
      if (K <= 9) explain = `Chữ số thứ ${K} là ${dgt}`;
      else if (K <= 189) { const t = K - 9, num = 9 + Math.ceil(t / 2), pos = (t - 1) % 2; explain = `9 chữ số đầu là 1 – 9. Còn ${t} chữ số thuộc các số có 2 chữ số: ${t} = 2 × ${Math.floor((t - 1) / 2)} + ${pos + 1}, nên đó là chữ số thứ ${pos + 1} của số ${num}`; }
      else { const t = K - 189, num = 99 + Math.ceil(t / 3), pos = (t - 1) % 3; explain = `Các số 1 – 99 dùng 189 chữ số. Còn ${t} chữ số thuộc các số có 3 chữ số: ${t} = 3 × ${Math.floor((t - 1) / 3)} + ${pos + 1}, nên đó là chữ số thứ ${pos + 1} của số ${num}`; }
      return mk({ text: `Viết liền các số tự nhiên bắt đầu từ 1 ta được dãy chữ số:<div class="seq">123456789101112131415...</div>Chữ số thứ ${K} của dãy là chữ số nào?`, answer: dgt, solution: `${explain}. Đáp số: <b>${dgt}</b>.` });
    }
    if (k === 'rev') {
      const n = R.int(100, 999), D = 189 + 3 * (n - 99);
      return mk({ text: `Viết liền các số tự nhiên từ 1 đến n thì phải dùng tất cả ${fmt(D)} chữ số. Tìm n.`, answer: n, solution: `Các số từ 1 đến 99 dùng 9 + 180 = 189 chữ số. Còn lại ${fmt(D)} − 189 = ${fmt(D - 189)} chữ số cho các số có 3 chữ số: ${fmt(D - 189)} : 3 = ${n - 99} số. n = 99 + ${n - 99} = <b>${n}</b>.` });
    }
    const dg = R.int(1, 9), n = R.int(200, 600);
    let c = 0; for (let x = 1; x <= n; x++) c += String(x).split('').filter(z => +z === dg).length;
    let cu = 0, ct = 0, chh = 0; for (let x = 1; x <= n; x++) { if (x % 10 === dg) cu++; if (Math.floor(x / 10) % 10 === dg) ct++; if (Math.floor(x / 100) === dg) chh++; }
    return mk({ text: `Khi viết các số từ 1 đến ${n}, chữ số ${dg} xuất hiện bao nhiêu lần?`, answer: c, solution: `Đếm riêng từng hàng. Hàng đơn vị: ${cu} lần. Hàng chục: ${ct} lần. Hàng trăm: ${chh} lần. Tổng: ${cu} + ${ct} + ${chh} = <b>${c}</b> lần.` });
  }

  function ntExtreme(R, lv) {
    let pick;
    if (lv === 1) pick = R.pick([
      [4, 'bé nhất', 'có bốn chữ số khác nhau', distinct], [4, 'lớn nhất', 'có bốn chữ số khác nhau', distinct], [5, 'chẵn lớn nhất', 'có năm chữ số', x => x % 2 === 0],
      [4, 'lẻ bé nhất', 'có bốn chữ số khác nhau', x => distinct(x) && x % 2], [5, 'bé nhất', 'có năm chữ số khác nhau', distinct], [5, 'lẻ lớn nhất', 'có năm chữ số khác nhau', x => distinct(x) && x % 2],
      [4, 'chẵn lớn nhất', 'có bốn chữ số khác nhau', x => distinct(x) && x % 2 === 0], [3, 'lớn nhất', 'có ba chữ số khác nhau', distinct]]);
    else if (lv === 2) {
      const s = R.int(8, 30), L = R.int(3, 4);
      pick = R.pick([[L, 'bé nhất', `có ${L === 3 ? 'ba' : 'bốn'} chữ số mà tổng các chữ số bằng ${s}`, x => digitSum(x) === s], [L, 'lớn nhất', `có ${L === 3 ? 'ba' : 'bốn'} chữ số khác nhau mà tổng các chữ số bằng ${Math.min(s, 24)}`, x => distinct(x) && digitSum(x) === Math.min(s, 24)], [L, 'lớn nhất', `có ${L === 3 ? 'ba' : 'bốn'} chữ số mà tích các chữ số bằng ${R.pick([12, 18, 24, 36, 20])}`, null]]);
      if (!pick[3]) { const p = +pick[2].match(/(\d+)$/)[1]; pick[3] = x => digitsOf(x).reduce((a, b) => a * b, 1) === p; }
    } else {
      const d = R.pick([[9, 'chia hết cho 9'], [5, 'chia hết cho 5'], [10, 'chia hết cho cả 2 và 5'], [15, 'chia hết cho cả 3 và 5'], [18, 'chia hết cho cả 2 và 9'], [6, 'chia hết cho cả 2 và 3']]);
      const L = R.int(4, 5), cond = R.chance(0.5);
      pick = [L, R.pick(['lớn nhất', 'bé nhất']), `có ${L === 4 ? 'bốn' : 'năm'} chữ số khác nhau và ${d[1]}`, x => distinct(x) && x % d[0] === 0];
      if (cond && L === 4) pick = [3, R.pick(['lớn nhất', 'bé nhất']), `có ba chữ số khác nhau, ${d[1]} và có chữ số hàng chục là ${R.int(1, 8)}`, null];
      if (!pick[3]) { const t = +pick[2].match(/là (\d)$/)[1]; pick[3] = x => distinct(x) && x % d[0] === 0 && Math.floor(x / 10) % 10 === t; }
    }
    const [L, which, cond, p] = pick;
    const lo = 10 ** (L - 1), hi = 10 ** L - 1;
    const ans = which.includes('lớn') ? lastIn(lo, hi, p) : firstIn(lo, hi, p);
    if (ans == null) return ntExtreme(R, lv);
    return mk({ text: `Tìm số ${which} ${cond}.`, answer: ans, solution: `Muốn được số ${which.includes('lớn') ? 'lớn nhất' : 'bé nhất'}, ta chọn chữ số ở hàng cao nhất ${which.includes('lớn') ? 'lớn' : 'bé'} nhất có thể, rồi đến các hàng tiếp theo, sao cho vẫn thỏa mãn điều kiện. Số cần tìm là <b>${fmt(ans)}</b>.` });
  }

  function ntCentury(R, lv) {
    if (lv === 1) {
      const y = R.pick([R.int(1, 21) * 100, R.int(0, 20) * 100 + 1, R.int(101, 2099), R.int(1700, 2030)]);
      const c = Math.ceil(y / 100);
      return mk({ text: `Năm ${y} thuộc thế kỉ thứ mấy? (Viết số, ví dụ thế kỉ XXI thì viết 21)`, answer: c, solution: `Thế kỉ thứ ${c} gồm các năm từ ${100 * (c - 1) + 1} đến ${100 * c}. Năm ${y} thuộc thế kỉ <b>${c}</b> (thế kỉ ${ROMAN2(c)}).` });
    }
    const k = R.pick(['start', 'end', 'between', 'count']), c = R.int(2, 21);
    if (k === 'start') return mk({ text: `Thế kỉ ${ROMAN2(c)} bắt đầu từ năm nào?`, answer: 100 * (c - 1) + 1, solution: `Thế kỉ thứ nhất từ năm 1 đến năm 100, thế kỉ thứ hai từ năm 101 đến năm 200, ... Thế kỉ ${ROMAN2(c)} bắt đầu từ năm <b>${100 * (c - 1) + 1}</b>.` });
    if (k === 'end') return mk({ text: `Thế kỉ ${ROMAN2(c)} kết thúc vào năm nào?`, answer: 100 * c, solution: `Thế kỉ thứ ${c} kết thúc vào năm ${c} × 100 = <b>${100 * c}</b>.` });
    if (k === 'between') { const y = R.int(1000, 1999), nn = 2026 - y; return mk({ text: `Một sự kiện xảy ra vào năm ${y}. Tính đến năm 2026 là bao nhiêu năm?`, answer: nn, solution: `2026 − ${y} = <b>${nn}</b> năm.` }); }
    const a = R.int(1, 17), sp = R.int(1, 4), ys = R.int(1, 99);
    if (R.chance(0.5)) return mk({ text: `Từ đầu thế kỉ ${ROMAN2(a)} đến hết thế kỉ ${ROMAN2(a + sp)} là bao nhiêu năm?`, answer: 100 * (sp + 1), solution: `Gồm ${sp + 1} thế kỉ: ${range(a, a + sp).map(ROMAN2).join(', ')}. ${sp + 1} × 100 = <b>${100 * (sp + 1)}</b> năm.` });
    return mk({ text: `Năm ${100 * (a + sp - 1) + ys} là năm thứ mấy của thế kỉ ${ROMAN2(a + sp)}?`, answer: ys, solution: `Thế kỉ ${ROMAN2(a + sp)} bắt đầu từ năm ${100 * (a + sp - 1) + 1}. Năm ${100 * (a + sp - 1) + ys} là năm thứ ${100 * (a + sp - 1) + ys} − ${100 * (a + sp - 1)} = <b>${ys}</b> của thế kỉ.` });
  }
  const ROMAN2 = n => (n >= 20 ? 'XX' + ROMAN(n - 20) : n >= 10 ? 'X' + ROMAN(n - 10) : ROMAN(n));

  // =====================================================================
  // HÌNH HỌC
  // =====================================================================
  function svgAngle(deg) {
    const vx = deg >= 100 ? 160 : 50, vy = 140, L = 120, a = deg * Math.PI / 180;
    const x2 = (vx + L * Math.cos(a)).toFixed(1), y2 = (vy - L * Math.sin(a)).toFixed(1);
    const ax = (vx + 28 * Math.cos(a)).toFixed(1), ay = (vy - 28 * Math.sin(a)).toFixed(1);
    let s = line(vx, vy, vx + L + 20, vy) + line(vx, vy, x2, y2);
    s += deg === 90 ? `<polyline points="${vx + 20},${vy} ${vx + 20},${vy - 20} ${vx},${vy - 20}" fill="none" stroke="#ef4444" stroke-width="2.5"/>`
      : `<path d="M ${vx + 28} ${vy} A 28 28 0 0 0 ${ax} ${ay}" fill="none" stroke="#ef4444" stroke-width="2.5"/>`;
    s += `<circle cx="${vx}" cy="${vy}" r="5" fill="${INK}"/>` + txt(vx, vy + 22, 'O');
    return svg(320, 170, s, 280);
  }
  // Tứ giác/tam giác dùng cho nhận biết hình
  function svgShape4(kind, labels) {
    const P = {
      rect: [[30, 30], [250, 30], [250, 130], [30, 130]], sq: [[80, 20], [200, 20], [200, 140], [80, 140]],
      para: [[80, 30], [270, 30], [210, 130], [20, 130]], rhom: [[145, 10], [245, 80], [145, 150], [45, 80]],
      tri: [[140, 15], [250, 140], [30, 140]], trap: [[30, 30], [170, 30], [250, 130], [30, 130]],
    }[kind];
    let s = POLY(P, '#e0f2fe');
    if (labels) {
      const cx = sum(P.map(p => p[0])) / P.length, cy = sum(P.map(p => p[1])) / P.length;
      P.forEach((p, i) => { const dx = p[0] - cx, dy = p[1] - cy, d = Math.hypot(dx, dy); s += txt((p[0] + 18 * dx / d).toFixed(0), (p[1] + 18 * dy / d + 6).toFixed(0), labels[i]); });
    }
    return svg(280, 165, s, 280);
  }
  function svgPara(b, h, lb, lh) {
    const w = 190, H = Math.max(60, Math.min(120, Math.round(190 * h / b))), off = 50;
    let s = POLY([[20 + off, 15], [20 + off + w, 15], [20 + w, 15 + H], [20, 15 + H]], '#fde68a');
    s += dash(20 + off, 15, 20 + off, 15 + H) + `<polyline points="${20 + off},${15 + H - 12} ${32 + off},${15 + H - 12} ${32 + off},${15 + H}" fill="none" stroke="#ef4444" stroke-width="2"/>`;
    s += txt(20 + w / 2, 15 + H + 24, lb) + txt(20 + off + 10, 15 + H / 2 + 6, lh, 'start', '#ef4444');
    return svg(300, H + 50, s, 300);
  }
  function svgRhombus(l1, l2) {
    const cx = 140, cy = 85, rx = 115, ry = 70;
    let s = POLY([[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]], '#fbcfe8');
    s += dash(cx - rx, cy, cx + rx, cy) + dash(cx, cy - ry, cx, cy + ry);
    s += txt(cx + 55, cy - 8, l1) + txt(cx + 8, cy + 40, l2, 'start');
    return svg(280, 170, s, 280);
  }
  // Hình chữ L: rộng đáy a, cao b, rộng phần trên c, cao phần dưới bên phải d
  function svgL(a, b, c, d) {
    const k = Math.min(200 / a, 150 / b), X = 70, Y = 12;
    const A = a * k, B = b * k, Cc = c * k, D = d * k;
    let s = POLY([[X, Y], [X + Cc, Y], [X + Cc, Y + B - D], [X + A, Y + B - D], [X + A, Y + B], [X, Y + B]], '#c7d2fe');
    s += txt(X + A / 2, Y + B + 24, a + ' cm') + txt(X - 32, Y + B / 2 + 6, b + ' cm');
    s += txt(X + Cc / 2, Y + 20, c + ' cm') + txt(X + A + 34, Y + B - D / 2 + 6, d + ' cm');
    return svg(X + A + 80, Y + B + 36, s, 320);
  }
  function svgRays(n) {
    const ox = 30, oy = 170, L = 200;
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = (5 + 80 * i / (n - 1)) * Math.PI / 180, x = ox + L * Math.cos(a), y = oy - L * Math.sin(a);
      s += line(ox, oy, x.toFixed(1), y.toFixed(1)) + txt((ox + (L + 16) * Math.cos(a)).toFixed(1), (oy - (L + 16) * Math.sin(a) + 6).toFixed(1), 'ABCDEFGH'[i]);
    }
    s += `<circle cx="${ox}" cy="${oy}" r="5" fill="${INK}"/>` + txt(ox - 6, oy + 22, 'O');
    return svg(270, 200, s, 270);
  }

  function geoPerim0(R) {
    const sq = R.chance(0.3), w = R.int(sq ? 3 : 4, 15), h = sq ? w : R.int(2, w - 1);
    const area = R.chance(0.5);
    const nm = sq ? 'hình vuông' : 'hình chữ nhật';
    if (area) return mk({ text: `Tính diện tích ${nm} trong hình (đơn vị cm²).`, visual: svgRect(w, h, w + ' cm', h + ' cm', '#bbf7d0'), answer: w * h, solution: `Diện tích ${nm} = ${sq ? 'cạnh × cạnh' : 'chiều dài × chiều rộng'} = ${w} × ${h} = <b>${w * h}</b> cm².` });
    return mk({ text: `Tính chu vi ${nm} trong hình (đơn vị cm).`, visual: svgRect(w, h, w + ' cm', h + ' cm', '#bfdbfe'), answer: sq ? 4 * w : 2 * (w + h), solution: sq ? `Chu vi hình vuông = cạnh × 4 = ${w} × 4 = <b>${4 * w}</b> cm.` : `Chu vi hình chữ nhật = (dài + rộng) × 2 = (${w} + ${h}) × 2 = <b>${2 * (w + h)}</b> cm.` });
  }

  const ANG = ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt'];
  function geoAngle0(R) {
    const t = R.int(0, 3), deg = [R.int(2, 8) * 10, 90, R.int(10, 16) * 10, 180][t];
    return ch(R, ANG[t], ANG, { text: 'Góc đỉnh O trong hình là góc gì?', visual: svgAngle(deg), solution: `Góc nhọn bé hơn góc vuông, góc tù lớn hơn góc vuông và bé hơn góc bẹt; góc bẹt có hai cạnh nằm trên một đường thẳng. Góc trong hình là <b>${ANG[t].toLowerCase()}</b>.` });
  }

  function geoShape0(R) {
    const kind = R.pick(['rect', 'sq', 'para', 'rhom', 'tri']);
    const nm = { rect: 'Hình chữ nhật', sq: 'Hình vuông', para: 'Hình bình hành', rhom: 'Hình thoi', tri: 'Hình tam giác' }[kind];
    const pool = { rect: ['Hình vuông', 'Hình thoi', 'Hình tam giác'], sq: ['Hình bình hành', 'Hình tam giác', 'Hình tròn'], para: ['Hình chữ nhật', 'Hình vuông', 'Hình tam giác'], rhom: ['Hình chữ nhật', 'Hình vuông', 'Hình tam giác'], tri: ['Hình chữ nhật', 'Hình thoi', 'Hình bình hành'] }[kind];
    const why = { rect: 'có 4 góc vuông, hai cạnh dài bằng nhau, hai cạnh ngắn bằng nhau', sq: 'có 4 góc vuông và 4 cạnh bằng nhau', para: 'có hai cặp cạnh đối diện song song và bằng nhau, nhưng không có góc vuông', rhom: 'có 4 cạnh bằng nhau và hai cặp cạnh đối diện song song, nhưng không có góc vuông', tri: 'có 3 cạnh và 3 góc' }[kind];
    return ch(R, nm, pool, { text: 'Hình bên là hình gì?', visual: svgShape4(kind), solution: `Hình bên ${why}. Đó là <b>${nm.toLowerCase()}</b>.` });
  }

  function geoUnit0(R) {
    const t = R.pick([['m', 'cm', 100], ['dm', 'cm', 10], ['m', 'dm', 10], ['km', 'm', 1000], ['kg', 'g', 1000], ['giờ', 'phút', 60], ['m', 'mm', 1000], ['cm', 'mm', 10]]);
    const a = R.int(2, 9);
    if (R.chance(0.35) && t[2] >= 10) { const b = R.int(1, t[2] - 1); return mk({ text: `Điền số thích hợp:<div class="seq">${a} ${t[0]} ${b} ${t[1]} = ${box} ${t[1]}</div>`, answer: a * t[2] + b, solution: `1 ${t[0]} = ${t[2]} ${t[1]}, nên ${a} ${t[0]} = ${a * t[2]} ${t[1]}. ${a * t[2]} + ${b} = <b>${a * t[2] + b}</b> ${t[1]}.` }); }
    return mk({ text: `Điền số thích hợp:<div class="seq">${a} ${t[0]} = ${box} ${t[1]}</div>`, answer: a * t[2], solution: `1 ${t[0]} = ${t[2]} ${t[1]}, nên ${a} ${t[0]} = ${a} × ${t[2]} = <b>${a * t[2]}</b> ${t[1]}.` });
  }

  function geoRect(R, lv) {
    if (lv === 1) {
      const k = R.pick(['area', 'per', 'sq', 'back']);
      const a = R.int(8, 40), b = R.int(3, a - 2);
      if (k === 'area') return mk({ text: `Một hình chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm. Tính diện tích hình chữ nhật đó (cm²).`, visual: svgRect(a, b, a + ' cm', b + ' cm'), answer: a * b, solution: `Diện tích: ${a} × ${b} = <b>${a * b}</b> cm².` });
      if (k === 'per') return mk({ text: `Một hình chữ nhật có chiều dài ${a} m, chiều rộng ${b} m. Tính chu vi hình chữ nhật đó (m).`, visual: svgRect(a, b, a + ' m', b + ' m', '#bfdbfe'), answer: 2 * (a + b), solution: `Chu vi: (${a} + ${b}) × 2 = <b>${2 * (a + b)}</b> m.` });
      if (k === 'sq') { const s = R.int(5, 30); return mk({ text: `Một hình vuông có chu vi ${4 * s} cm. Tính diện tích hình vuông đó (cm²).`, answer: s * s, solution: `Cạnh hình vuông: ${4 * s} : 4 = ${s} cm. Diện tích: ${s} × ${s} = <b>${s * s}</b> cm².` }); }
      return mk({ text: `Một hình chữ nhật có diện tích ${a * b} cm², chiều rộng ${b} cm. Tính chiều dài hình chữ nhật đó (cm).`, answer: a, solution: `Chiều dài = diện tích : chiều rộng = ${a * b} : ${b} = <b>${a}</b> cm.` });
    }
    if (lv === 2) {
      const k = R.pick(['diff', 'times', 'half']);
      const w = R.int(4, 25);
      if (k === 'diff') { const d = R.int(2, 15), P = 2 * (2 * w + d); return mk({ text: `Một mảnh vườn hình chữ nhật có chu vi ${P} m, chiều dài hơn chiều rộng ${d} m. Tính diện tích mảnh vườn (m²).`, answer: w * (w + d), solution: `Nửa chu vi: ${P} : 2 = ${P / 2} m. Chiều rộng: (${P / 2} − ${d}) : 2 = ${w} m. Chiều dài: ${w + d} m. Diện tích: ${w + d} × ${w} = <b>${w * (w + d)}</b> m².` }); }
      if (k === 'times') { const kk = R.int(2, 5), P = 2 * w * (kk + 1); return mk({ text: `Một hình chữ nhật có chu vi ${P} cm, chiều dài gấp ${kk} lần chiều rộng. Tính diện tích hình chữ nhật (cm²).`, answer: kk * w * w, solution: `Nửa chu vi: ${P / 2} cm. Coi chiều rộng là 1 phần, chiều dài là ${kk} phần. Chiều rộng: ${P / 2} : ${kk + 1} = ${w} cm. Chiều dài: ${w * kk} cm. Diện tích: ${w * kk} × ${w} = <b>${kk * w * w}</b> cm².` }); }
      const s2 = R.int(4, 25);
      return mk({ text: `Một hình vuông có diện tích ${s2 * s2} cm². Tính chu vi hình vuông đó (cm).`, answer: 4 * s2, solution: `Tìm số nhân với chính nó được ${s2 * s2}: ${s2} × ${s2} = ${s2 * s2}, nên cạnh hình vuông là ${s2} cm. Chu vi: ${s2} × 4 = <b>${4 * s2}</b> cm.` });
    }
    const k = R.pick(['sameP', 'row', 'cutsq']);
    if (k === 'sameP') {
      let a, b; do { a = R.int(10, 40); b = R.int(4, a - 2); } while ((a + b) % 2);
      const s = (a + b) / 2;
      return mk({ text: `Một hình vuông có chu vi bằng chu vi hình chữ nhật dài ${a} cm, rộng ${b} cm. Tính diện tích hình vuông (cm²).`, answer: s * s, solution: `Chu vi hình chữ nhật: (${a} + ${b}) × 2 = ${2 * (a + b)} cm. Cạnh hình vuông: ${2 * (a + b)} : 4 = ${s} cm. Diện tích hình vuông: ${s} × ${s} = <b>${s * s}</b> cm².` });
    }
    if (k === 'row') {
      const n = R.int(3, 7), s = R.int(2, 9), P = 2 * (n * s + s);
      return mk({ text: `Xếp ${n} hình vuông bằng nhau, mỗi hình có cạnh ${s} cm, thành một hàng liền nhau để được một hình chữ nhật. Tính chu vi hình chữ nhật đó (cm).`, visual: svgGrid(1, n), answer: P, solution: `Hình chữ nhật dài ${n} × ${s} = ${n * s} cm, rộng ${s} cm. Chu vi: (${n * s} + ${s}) × 2 = <b>${P}</b> cm.` });
    }
    const w = R.int(4, 15), d = R.int(2, 10), a = w + d;
    return mk({ text: `Một hình chữ nhật có chiều dài ${a} cm, chiều rộng ${w} cm. Cắt đi một hình vuông có cạnh bằng chiều rộng thì phần còn lại là một hình chữ nhật nhỏ. Tính chu vi hình chữ nhật nhỏ (cm).`, visual: svgRect(a, w, a + ' cm', w + ' cm', '#fef3c7'), answer: 2 * (d + w), solution: `Hình vuông có cạnh ${w} cm. Hình chữ nhật còn lại có hai cạnh: ${a} − ${w} = ${d} cm và ${w} cm. Chu vi: (${d} + ${w}) × 2 = <b>${2 * (d + w)}</b> cm.` });
  }

  function geoPara(R, lv) {
    if (lv === 1) {
      if (R.chance(0.5)) { const b = R.int(6, 30), h = R.int(3, 20); return mk({ text: `Tính diện tích hình bình hành có độ dài đáy ${b} cm và chiều cao ${h} cm (cm²).`, visual: svgPara(b, h, b + ' cm', h + ' cm'), answer: b * h, solution: `Diện tích hình bình hành = đáy × chiều cao = ${b} × ${h} = <b>${b * h}</b> cm².` }); }
      let m, n; do { m = R.int(4, 24); n = R.int(3, 20); } while ((m * n) % 2 || m === n);
      return mk({ text: `Tính diện tích hình thoi có độ dài hai đường chéo là ${m} cm và ${n} cm (cm²).`, visual: svgRhombus(m + ' cm', n + ' cm'), answer: m * n / 2, solution: `Diện tích hình thoi = đường chéo × đường chéo : 2 = ${m} × ${n} : 2 = <b>${m * n / 2}</b> cm².` });
    }
    if (lv === 2) {
      const k = R.pick(['h', 'diag', 'perim']);
      if (k === 'h') { const b = R.int(6, 30), h = R.int(3, 20); return mk({ text: `Một hình bình hành có diện tích ${b * h} cm², độ dài đáy ${b} cm. Tính chiều cao của hình bình hành (cm).`, answer: h, solution: `Chiều cao = diện tích : đáy = ${b * h} : ${b} = <b>${h}</b> cm.` }); }
      if (k === 'diag') { const m = R.int(4, 24), n = 2 * R.int(2, 12); return mk({ text: `Một hình thoi có diện tích ${m * n / 2} cm², một đường chéo dài ${n} cm. Tính độ dài đường chéo còn lại (cm).`, answer: m, solution: `Tích hai đường chéo = diện tích × 2 = ${m * n} cm². Đường chéo còn lại: ${m * n} : ${n} = <b>${m}</b> cm.` }); }
      if (R.chance(0.5)) { const s = R.int(5, 40); return mk({ text: `Một hình thoi có cạnh dài ${s} cm. Tính chu vi hình thoi (cm).`, visual: svgShape4('rhom'), answer: 4 * s, solution: `Hình thoi có 4 cạnh bằng nhau. Chu vi: ${s} × 4 = <b>${4 * s}</b> cm.` }); }
      const a = R.int(8, 30), b = R.int(4, a - 1);
      return mk({ text: `Hình bình hành ABCD có cạnh AB = ${a} cm, cạnh BC = ${b} cm. Tính chu vi hình bình hành (cm).`, visual: svgShape4('para', ['A', 'B', 'C', 'D']), answer: 2 * (a + b), solution: `Hình bình hành có các cạnh đối diện bằng nhau: CD = AB = ${a} cm, DA = BC = ${b} cm. Chu vi: (${a} + ${b}) × 2 = <b>${2 * (a + b)}</b> cm.` });
    }
    const k = R.pick(['frac', 'same', 'sumbh']);
    if (k === 'frac') { const kk = R.int(2, 5), h = R.int(3, 12), b = h * kk; return mk({ text: `Một hình bình hành có độ dài đáy ${b} cm, chiều cao bằng ${fr(1, kk)} độ dài đáy. Tính diện tích hình bình hành (cm²).`, answer: b * h, solution: `Chiều cao: ${b} : ${kk} = ${h} cm. Diện tích: ${b} × ${h} = <b>${b * h}</b> cm².` }); }
    if (k === 'same') {
      for (;;) { const a = R.int(6, 20), b = R.int(3, 15), d1 = R.pick([4, 6, 8, 10, 12, 16, 20]); if ((2 * a * b) % d1 === 0) return mk({ text: `Một hình thoi có diện tích bằng diện tích hình chữ nhật dài ${a} cm, rộng ${b} cm. Biết một đường chéo của hình thoi dài ${d1} cm. Tính độ dài đường chéo còn lại (cm).`, answer: 2 * a * b / d1, solution: `Diện tích hình thoi: ${a} × ${b} = ${a * b} cm². Tích hai đường chéo: ${a * b} × 2 = ${2 * a * b}. Đường chéo còn lại: ${2 * a * b} : ${d1} = <b>${2 * a * b / d1}</b> cm.` }); }
    }
    const kk = R.int(2, 4), h = R.int(3, 12), b = kk * h;
    return mk({ text: `Một hình bình hành có tổng độ dài đáy và chiều cao là ${b + h} cm, độ dài đáy gấp ${kk} lần chiều cao. Tính diện tích hình bình hành (cm²).`, answer: b * h, solution: `Chiều cao là 1 phần, đáy là ${kk} phần. Chiều cao: ${b + h} : ${kk + 1} = ${h} cm, đáy: ${b} cm. Diện tích: ${b} × ${h} = <b>${b * h}</b> cm².` });
  }

  const U1 = [['tấn', 'kg', 1000], ['tạ', 'kg', 100], ['yến', 'kg', 10], ['tấn', 'tạ', 10], ['tạ', 'yến', 10], ['m²', 'dm²', 100], ['dm²', 'cm²', 100], ['phút', 'giây', 60], ['thế kỉ', 'năm', 100], ['giờ', 'phút', 60]];
  function geoUnits(R, lv) {
    if (lv === 1) {
      const t = R.pick(U1), a = R.int(2, 25);
      if (R.chance(0.3)) return mk({ text: `Điền số thích hợp:<div class="seq">${fmt(a * t[2])} ${t[1]} = ${box} ${t[0]}</div>`, answer: a, solution: `1 ${t[0]} = ${t[2]} ${t[1]}, nên ${fmt(a * t[2])} ${t[1]} = ${fmt(a * t[2])} : ${t[2]} = <b>${a}</b> ${t[0]}.` });
      return mk({ text: `Điền số thích hợp:<div class="seq">${a} ${t[0]} = ${box} ${t[1]}</div>`, answer: a * t[2], solution: `1 ${t[0]} = ${t[2]} ${t[1]}, nên ${a} ${t[0]} = ${a} × ${t[2]} = <b>${fmt(a * t[2])}</b> ${t[1]}.` });
    }
    if (lv === 2) {
      if (R.chance(0.65)) {
        const t = R.pick(U1.filter(x => x[2] >= 60)), a = R.int(2, 15), b = R.int(1, t[2] - 1);
        return mk({ text: `Điền số thích hợp:<div class="seq">${a} ${t[0]} ${b} ${t[1]} = ${box} ${t[1]}</div>`, answer: a * t[2] + b, solution: `${a} ${t[0]} = ${fmt(a * t[2])} ${t[1]}. ${fmt(a * t[2])} + ${b} = <b>${fmt(a * t[2] + b)}</b> ${t[1]}.` });
      }
      const t = R.pick([['phút', 'giây', 60, [2, 3, 4, 5, 6, 10]], ['giờ', 'phút', 60, [2, 3, 4, 5, 6, 10]], ['thế kỉ', 'năm', 100, [2, 4, 5, 10]], ['tấn', 'kg', 1000, [2, 4, 5, 8, 10]], ['m²', 'dm²', 100, [2, 4, 5, 10]]]);
      const n = R.pick(t[3]), m = R.int(1, n - 1);
      if (gcd(m, n) !== 1) return geoUnits(R, lv);
      return mk({ text: `Điền số thích hợp:<div class="seq">${fr(m, n)} ${t[0]} = ${box} ${t[1]}</div>`, answer: t[2] / n * m, solution: `1 ${t[0]} = ${t[2]} ${t[1]}. ${fr(m, n)} ${t[0]} = ${t[2]} : ${n} × ${m} = <b>${t[2] / n * m}</b> ${t[1]}.` });
    }
    const k = R.pick(['sub', 'mul', 'm2cm2', 'hsec', 'bags']);
    if (k === 'sub') { const a = R.int(3, 9), b = R.int(10, 900), c = R.int(500, a * 1000 - 100); return mk({ text: `Tính:<div class="seq">${a} tấn ${b} kg − ${fmt(c)} kg = ${box} kg</div>`, answer: a * 1000 + b - c, solution: `${a} tấn ${b} kg = ${fmt(a * 1000 + b)} kg. ${fmt(a * 1000 + b)} − ${fmt(c)} = <b>${fmt(a * 1000 + b - c)}</b> kg.` }); }
    if (k === 'mul') { const a = R.int(1, 9), b = R.int(5, 95), m = R.int(3, 9); return mk({ text: `Tính:<div class="seq">${a} tạ ${b} kg × ${m} = ${box} kg</div>`, answer: (a * 100 + b) * m, solution: `${a} tạ ${b} kg = ${a * 100 + b} kg. ${a * 100 + b} × ${m} = <b>${fmt((a * 100 + b) * m)}</b> kg.` }); }
    if (k === 'm2cm2') { const a = R.int(1, 9), b = R.int(5, 950); return mk({ text: `Điền số thích hợp:<div class="seq">${a} m² ${b} cm² = ${box} cm²</div>`, answer: a * 10000 + b, solution: `1 m² = 100 dm² = 10.000 cm². ${a} m² = ${fmt(a * 10000)} cm². ${fmt(a * 10000)} + ${b} = <b>${fmt(a * 10000 + b)}</b> cm².` }); }
    if (k === 'hsec') { const n = R.pick([2, 3, 4, 5, 6, 10, 12, 15, 20]); return mk({ text: `Điền số thích hợp:<div class="seq">${fr(1, n)} giờ = ${box} giây</div>`, answer: 3600 / n, solution: `1 giờ = 60 phút = 60 × 60 = 3.600 giây. ${fr(1, n)} giờ = 3.600 : ${n} = <b>${fmt(3600 / n)}</b> giây.` }); }
    const w = R.pick([25, 50, 20, 40]), t = R.int(1, 6), q = R.int(2, 9), total = t * 1000 + q * 100;
    if (total % w) return geoUnits(R, lv);
    return mk({ text: `Một xe chở ${t} tấn ${q} tạ gạo. Gạo được đóng vào các bao, mỗi bao ${w} kg. Hỏi xe chở bao nhiêu bao gạo?`, answer: total / w, solution: `${t} tấn ${q} tạ = ${fmt(total)} kg. Số bao: ${fmt(total)} : ${w} = <b>${total / w}</b> bao.` });
  }

  const clockAngle = (h, m) => { const d = Math.abs((h % 12) * 30 + m / 2 - 6 * m) % 360; return Math.min(d, 360 - d); };
  function geoAngles(R, lv) {
    const rays = n => { const ans = C2(n); return mk({ text: `Hình bên có ${n} tia chung gốc O. Hỏi có tất cả bao nhiêu góc (nhỏ hơn góc bẹt) có đỉnh O?`, visual: svgRays(n), answer: ans, solution: `Mỗi góc được tạo bởi 2 tia. Tia OA tạo với các tia còn lại ${n - 1} góc, tia OB tạo thêm ${n - 2} góc, ... Tổng: ${range(1, n - 1).reverse().join(' + ')} = <b>${ans}</b> góc.` }); };
    if (lv === 1) {
      if (R.chance(0.5)) return rays(R.int(3, 4));
      const h = R.int(1, 11), deg = clockAngle(h, 0), t = deg < 90 ? 0 : deg === 90 ? 1 : deg < 180 ? 2 : 3;
      return ch(R, ANG[t], ANG, { text: `Lúc ${h} giờ, kim giờ và kim phút tạo thành góc gì?`, visual: svgClock(h, 0), solution: `Mỗi khoảng giữa hai số liền nhau trên mặt đồng hồ là 30°. Lúc ${h} giờ, hai kim cách nhau ${Math.round(deg / 30)} khoảng, tức ${deg}°. Đó là <b>${ANG[t].toLowerCase()}</b>.` });
    }
    if (lv === 2) {
      const k = R.pick(['rays', 'clock', 'right']);
      if (k === 'rays') return rays(R.int(5, 6));
      if (k === 'clock') { const h = R.int(1, 11), deg = clockAngle(h, 0); return mk({ text: `Lúc ${h} giờ đúng, góc nhỏ tạo bởi kim giờ và kim phút bằng bao nhiêu độ?`, visual: svgClock(h, 0), answer: deg, solution: `Mặt đồng hồ chia 12 khoảng, mỗi khoảng 360° : 12 = 30°. Hai kim cách nhau ${deg / 30} khoảng: ${deg / 30} × 30° = <b>${deg}</b>°.` }); }
      const m = R.pick([5, 10, 15, 20, 25, 30]), h0 = R.int(1, 11);
      return mk({ text: `Đồng hồ chỉ từ ${h0} giờ đến ${h0} giờ ${m} phút. Hỏi kim phút đã quay được một góc bao nhiêu độ?`, answer: 6 * m, solution: `Kim phút quay một vòng (360°) hết 60 phút, nên mỗi phút quay 360° : 60 = 6°. ${m} phút quay được ${m} × 6° = <b>${6 * m}</b>°.` });
    }
    const k = R.pick(['rays', 'clock', 'clock']);
    if (k === 'rays') return rays(R.int(6, 8));
    const h = R.int(1, 11), m = R.pick([20, 30, 30, 40, 10]), deg = clockAngle(h, m);
    return mk({ text: `Lúc ${h} giờ ${m} phút, góc nhỏ tạo bởi kim giờ và kim phút bằng bao nhiêu độ?`, visual: svgClock(h, m), answer: deg, solution: `Kim phút ở vị trí ${m * 6}° (tính từ số 12). Kim giờ mỗi giờ đi 30°, mỗi phút đi thêm 30° : 60 = nửa độ, nên ở vị trí ${h} × 30° + ${m} : 2 = ${h * 30 + m / 2}°. ${Math.abs(h * 30 + m / 2 - m * 6) > 180 ? `Hai kim cách nhau ${Math.abs(h * 30 + m / 2 - m * 6)}°, góc nhỏ là 360° − ${Math.abs(h * 30 + m / 2 - m * 6)}° = <b>${deg}</b>°.` : `Hai kim cách nhau <b>${deg}</b>°.`}` });
  }

  function geoLines(R, lv) {
    const L = R.pick(['ABCD', 'MNPQ', 'EGHK', 'ABCD']);
    const s = (i, j) => L[i] + L[j];
    if (lv === 1) {
      const k = R.pick(['par', 'perp', 'par2']);
      if (k === 'par') return ch(R, s(2, 3), [s(0, 3), s(1, 2), s(0, 2)], { text: `Trong hình chữ nhật ${L}, cạnh nào song song với cạnh ${s(0, 1)}?`, visual: svgShape4('rect', L.split('')), solution: `Trong hình chữ nhật, hai cạnh đối diện song song với nhau. Cạnh song song với ${s(0, 1)} là <b>${s(2, 3)}</b>.` });
      if (k === 'par2') return ch(R, s(1, 2), [s(0, 1), s(2, 3), s(0, 2)], { text: `Trong hình chữ nhật ${L}, cạnh nào song song với cạnh ${s(0, 3)}?`, visual: svgShape4('rect', L.split('')), solution: `Hai cạnh đối diện của hình chữ nhật song song với nhau. Cạnh song song với ${s(0, 3)} là <b>${s(1, 2)}</b>.` });
      const ans = `${s(0, 3)} và ${s(1, 2)}`;
      return ch(R, ans, [`${s(2, 3)} và ${s(0, 3)}`, `${s(1, 2)} và ${s(2, 3)}`, `Chỉ cạnh ${s(2, 3)}`], { text: `Trong hình chữ nhật ${L}, cạnh ${s(0, 1)} vuông góc với những cạnh nào?`, visual: svgShape4('rect', L.split('')), solution: `Hình chữ nhật có 4 góc vuông. Cạnh ${s(0, 1)} vuông góc với hai cạnh kề nó: <b>${ans}</b>.` });
    }
    const fig = R.pick(['rect', 'trap']), ask = R.pick(['perp', 'par', 'right']);
    const nm = fig === 'rect' ? `hình chữ nhật ${L}` : `hình thang vuông ${L} (góc ${L[0]} và góc ${L[3]} vuông)`;
    const ans = { rect: { perp: 4, par: 2, right: 4 }, trap: { perp: 2, par: 1, right: 2 } }[fig][ask];
    const q = { perp: 'cặp cạnh vuông góc với nhau', par: 'cặp cạnh song song với nhau', right: 'góc vuông' }[ask];
    const sol = fig === 'rect'
      ? { perp: `Mỗi góc vuông cho một cặp cạnh vuông góc: ${s(0, 1)} và ${s(1, 2)}, ${s(1, 2)} và ${s(2, 3)}, ${s(2, 3)} và ${s(3, 0)}, ${s(3, 0)} và ${s(0, 1)}`, par: `${s(0, 1)} song song ${s(2, 3)}; ${s(0, 3)} song song ${s(1, 2)}`, right: 'Hình chữ nhật có 4 góc đều vuông' }[ask]
      : { perp: `${s(0, 3)} vuông góc với ${s(0, 1)} và ${s(0, 3)} vuông góc với ${s(3, 2)}`, par: `Chỉ có ${s(0, 1)} song song với ${s(3, 2)}`, right: `Chỉ có góc ${L[0]} và góc ${L[3]} vuông` }[ask];
    return mk({ text: `Cho ${nm} như hình bên. Hình có bao nhiêu ${q}?`, visual: svgShape4(fig === 'rect' ? 'rect' : 'trap', L.split('')), answer: ans, solution: `${sol}. Có <b>${ans}</b> ${q}.` });
  }

  function geoCompose(R, lv) {
    const Lshape = () => {
      const a = R.int(8, 20), b = R.int(6, 16), c = R.int(2, a - 3), d = R.int(2, b - 2);
      const area = R.chance(0.6);
      if (area) return mk({ text: 'Tính diện tích hình bên (cm²). Các góc trong hình đều là góc vuông.', visual: svgL(a, b, c, d), answer: c * (b - d) + a * d, solution: `Cắt hình thành 2 hình chữ nhật: phần dưới ${a} × ${d} = ${a * d} cm²; phần trên ${c} × (${b} − ${d}) = ${c} × ${b - d} = ${c * (b - d)} cm². Tổng: <b>${c * (b - d) + a * d}</b> cm².` });
      return mk({ text: 'Tính chu vi hình bên (cm). Các góc trong hình đều là góc vuông.', visual: svgL(a, b, c, d), answer: 2 * (a + b), solution: `Dời các cạnh ở chỗ lõm ra ngoài, ta được hình chữ nhật có hai cạnh ${a} cm và ${b} cm, có cùng chu vi. Chu vi: (${a} + ${b}) × 2 = <b>${2 * (a + b)}</b> cm.` });
    };
    if (lv === 2) {
      if (R.chance(0.6)) return Lshape();
      const s = R.int(3, 12), n = R.int(2, 4);
      return mk({ text: `Ghép ${n} hình vuông cạnh ${s} cm thành một hàng để được hình chữ nhật. Diện tích hình chữ nhật đó là bao nhiêu cm²?`, visual: svgGrid(1, n), answer: n * s * s, solution: `Mỗi hình vuông có diện tích ${s} × ${s} = ${s * s} cm². Hình chữ nhật: ${s * s} × ${n} = <b>${n * s * s}</b> cm². (Hoặc: ${n * s} × ${s}.)` });
    }
    const k = R.pick(['cut', 'three', 'corner', 'L']);
    if (k === 'L') return Lshape();
    if (k === 'cut') { const a = R.int(3, 15), n = R.int(2, 4), P = (2 * n + 2) * a; return mk({ text: `Một hình vuông được cắt thành ${n} hình chữ nhật bằng nhau bởi ${n - 1} đường thẳng song song với một cạnh. Tổng chu vi của ${n} hình chữ nhật là ${P} cm. Tính diện tích hình vuông (cm²).`, answer: a * a, solution: `Mỗi đường cắt tạo thêm 2 cạnh dài bằng cạnh hình vuông. Tổng chu vi = 4 cạnh + ${n - 1} × 2 cạnh = ${2 * n + 2} lần cạnh hình vuông. Cạnh: ${P} : ${2 * n + 2} = ${a} cm. Diện tích: ${a} × ${a} = <b>${a * a}</b> cm².` }); }
    if (k === 'three') { const s = R.int(2, 12), n = R.int(2, 5), P = 2 * (n + 1) * s; return mk({ text: `Một hình chữ nhật được chia thành ${n} hình vuông bằng nhau xếp thành một hàng. Chu vi hình chữ nhật là ${P} cm. Tính diện tích hình chữ nhật (cm²).`, visual: svgGrid(1, n), answer: n * s * s, solution: `Chu vi hình chữ nhật gồm ${2 * n + 2} cạnh hình vuông. Cạnh hình vuông: ${P} : ${2 * n + 2} = ${s} cm. Diện tích: ${n * s} × ${s} = <b>${n * s * s}</b> cm².` }); }
    const a = R.int(12, 30), b = R.int(8, a - 2), c = R.int(1, Math.floor(b / 2) - 1);
    if (R.chance(0.5)) return mk({ text: `Một tấm bìa hình chữ nhật dài ${a} cm, rộng ${b} cm. Người ta cắt bỏ ở mỗi góc một hình vuông cạnh ${c} cm. Tính chu vi phần bìa còn lại (cm).`, answer: 2 * (a + b), solution: `Ở mỗi góc, bỏ đi 2 đoạn dài ${c} cm nhưng lại thêm 2 đoạn dài ${c} cm, nên chu vi không đổi: (${a} + ${b}) × 2 = <b>${2 * (a + b)}</b> cm.` });
    return mk({ text: `Một tấm bìa hình chữ nhật dài ${a} cm, rộng ${b} cm. Người ta cắt bỏ ở mỗi góc một hình vuông cạnh ${c} cm. Tính diện tích phần bìa còn lại (cm²).`, answer: a * b - 4 * c * c, solution: `Diện tích tấm bìa: ${a} × ${b} = ${a * b} cm². Bốn hình vuông: ${c} × ${c} × 4 = ${4 * c * c} cm². Còn lại: ${a * b} − ${4 * c * c} = <b>${a * b - 4 * c * c}</b> cm².` });
  }

  function geoCountRect(R, lv) {
    const [r, c] = lv === 1 ? R.pick([[1, 3], [1, 4], [1, 5], [2, 2]]) : lv === 2 ? R.pick([[2, 3], [2, 4], [1, 6], [2, 5]]) : R.pick([[3, 3], [3, 4], [2, 6], [4, 4], [3, 5]]);
    const ans = C2(r + 1) * C2(c + 1);
    return mk({ text: 'Hình bên có tất cả bao nhiêu hình chữ nhật? (Hình vuông cũng được tính là hình chữ nhật)', visual: svgGrid(r, c), answer: ans,
      solution: r === 1 ? `Hình gồm 1 ô: ${c}; gồm 2 ô: ${c - 1}; ...; gồm ${c} ô: 1. Tổng: ${range(1, c).reverse().join(' + ')} = <b>${ans}</b>.`
        : `Mỗi hình chữ nhật được xác định bởi 2 đường kẻ dọc và 2 đường kẻ ngang. Có ${c + 1} đường dọc → ${C2(c + 1)} cách chọn; ${r + 1} đường ngang → ${C2(r + 1)} cách chọn. Số hình chữ nhật: ${C2(c + 1)} × ${C2(r + 1)} = <b>${ans}</b>.` });
  }

  function geoCountTri(R, lv) {
    const [n, layers] = lv === 1 ? [R.int(3, 5), 1] : lv === 2 ? R.pick([[4, 1], [5, 1], [3, 2], [4, 2]]) : R.pick([[5, 2], [4, 3], [6, 1], [3, 3], [5, 3], [6, 2]]);
    const one = C2(n), ans = one * layers;
    return mk({ text: 'Hình bên có tất cả bao nhiêu hình tam giác?', visual: svgFan(n, layers), answer: ans,
      solution: `Mỗi tam giác có đỉnh ở trên cùng và cạnh đáy nằm trên một đường ngang. Trên mỗi đường ngang có ${n} điểm, tạo ra ${range(1, n - 1).reverse().join(' + ')} = ${one} tam giác.${layers > 1 ? ` Có ${layers} đường ngang: ${one} × ${layers} = <b>${ans}</b> tam giác.` : ` Vậy có <b>${ans}</b> tam giác.`}` });
  }

  function geoGrow(R, lv) {
    if (lv === 2) {
      const k = R.pick(['area', 'sqper', 'rectper']);
      if (k === 'area') { const a = R.int(6, 30), t = R.int(2, 9); return mk({ text: `Một hình chữ nhật có chiều dài ${a} cm. Nếu tăng chiều rộng thêm ${t} cm (giữ nguyên chiều dài) thì diện tích tăng thêm bao nhiêu cm²?`, answer: a * t, solution: `Phần diện tích tăng thêm là một hình chữ nhật dài ${a} cm, rộng ${t} cm: ${a} × ${t} = <b>${a * t}</b> cm².` }); }
      if (k === 'sqper') { const t = R.int(2, 12); return mk({ text: `Một hình vuông, nếu tăng mỗi cạnh thêm ${t} cm thì chu vi tăng thêm bao nhiêu cm?`, answer: 4 * t, solution: `Hình vuông có 4 cạnh, mỗi cạnh tăng ${t} cm. Chu vi tăng: ${t} × 4 = <b>${4 * t}</b> cm.` }); }
      const a = R.int(10, 30), b = R.int(3, a - 2), T = R.int(2, 9);
      return mk({ text: `Một hình chữ nhật có chiều rộng ${b} cm. Nếu tăng chiều dài thêm ${T} cm thì diện tích tăng thêm bao nhiêu cm²? Biết chiều dài ban đầu là ${a} cm.`, answer: b * T, solution: `Phần tăng thêm là hình chữ nhật ${T} cm × ${b} cm (không phụ thuộc chiều dài ban đầu): ${T} × ${b} = <b>${b * T}</b> cm².` });
    }
    const k = R.pick(['sq', 'tosq', 'back']);
    if (k === 'sq') { const a = R.int(4, 20), t = R.int(1, 5), T = 2 * a * t + t * t; return mk({ text: `Nếu tăng cạnh của một hình vuông thêm ${t} cm thì diện tích tăng thêm ${T} cm². Tính diện tích hình vuông ban đầu (cm²).`, answer: a * a, solution: `Phần tăng gồm 2 hình chữ nhật (cạnh ban đầu × ${t}) và 1 hình vuông nhỏ ${t} × ${t} = ${t * t} cm². Hai hình chữ nhật: ${T} − ${t * t} = ${T - t * t} cm², mỗi hình ${(T - t * t) / 2} cm². Cạnh ban đầu: ${(T - t * t) / 2} : ${t} = ${a} cm. Diện tích: ${a} × ${a} = <b>${a * a}</b> cm².` }); }
    if (k === 'tosq') { const kk = R.int(2, 5), w = R.int(2, 10), d = w * (kk - 1); return mk({ text: `Một hình chữ nhật có chiều dài gấp ${kk} lần chiều rộng. Nếu tăng chiều rộng thêm ${d} cm thì được một hình vuông. Tính diện tích hình chữ nhật ban đầu (cm²).`, answer: kk * w * w, solution: `Khi thành hình vuông, chiều rộng mới bằng chiều dài, nên chiều dài hơn chiều rộng ${d} cm. Hiệu số phần: ${kk} − 1 = ${kk - 1}. Chiều rộng: ${d} : ${kk - 1} = ${w} cm, chiều dài: ${kk * w} cm. Diện tích: ${kk * w} × ${w} = <b>${kk * w * w}</b> cm².` }); }
    const a = R.int(8, 30), w = R.int(3, a - 2), t = R.int(2, 8);
    return mk({ text: `Một hình chữ nhật có chiều dài ${a} cm. Nếu tăng chiều rộng thêm ${t} cm thì được hình chữ nhật mới có diện tích ${a * (w + t)} cm². Tính diện tích hình chữ nhật ban đầu (cm²).`, answer: a * w, solution: `Chiều rộng mới: ${a * (w + t)} : ${a} = ${w + t} cm. Chiều rộng ban đầu: ${w + t} − ${t} = ${w} cm. Diện tích ban đầu: ${a} × ${w} = <b>${a * w}</b> cm².` });
  }

  // =====================================================================
  // TƯ DUY LOGIC
  // =====================================================================
  function lgSeq0(R) {
    const d = R.pick([5, 10, 20, 25, 50, 100, 200]), a = R.int(10, 80) * (d >= 100 ? 10 : 5) + R.int(0, 4), down = R.chance(0.35);
    const t = range(0, 3).map(i => (down ? a + 6 * d - i * d : a + i * d)), nxt = down ? t[3] - d : t[3] + d;
    return mk({ text: `Tìm số tiếp theo của dãy:<div class="seq">${t.map(fmt).join(', ')}, ${box}</div>`, answer: nxt, solution: `Mỗi số ${down ? 'kém' : 'hơn'} số liền trước ${d} đơn vị. Số tiếp theo: ${fmt(t[3])} ${down ? '−' : '+'} ${d} = <b>${fmt(nxt)}</b>.` });
  }

  function lgPattern0(R) {
    const p = R.int(3, 4), pat = R.sample(SHAPES, p), k = R.int(10, 40), ans = pat[(k - 1) % p];
    return ch(R, ans, pat, { text: `Các hình được xếp theo quy luật:<div class="seq emoji">${Array(2).fill(pat.join('')).join('')}${pat.slice(0, 2).join('')}...</div>Hình thứ ${k} là hình nào?`, solution: `Nhóm ${p} hình lặp lại: ${pat.join('')}. ${k} : ${p} = ${Math.floor(k / p)} (dư ${k % p}). ${k % p === 0 ? `Hình thứ ${k} là hình cuối của nhóm` : `Hình thứ ${k} là hình thứ ${k % p} của nhóm`}: <b>${ans}</b>.` });
  }

  function lgDay0(R) {
    const w = R.int(0, 6), k = R.pick(['n', 'yt', 'tm']);
    if (k === 'n') { const n = R.int(1, 7), ans = wk(w + n); return ch(R, ans, WEEK, { text: `Hôm nay là ${lo(WEEK[w])}. Hỏi ${n} ngày nữa là thứ mấy?`, solution: `Đếm tiếp ${n} ngày từ ${lo(WEEK[w])}: ${range(1, n).map(i => lo(wk(w + i))).join(', ')}. Đó là <b>${ans}</b>.` }); }
    if (k === 'yt') { const ans = wk(w + 2); return ch(R, ans, WEEK, { text: `Hôm qua là ${lo(WEEK[w])}. Hỏi ngày mai là thứ mấy?`, solution: `Hôm qua là ${lo(WEEK[w])} thì hôm nay là ${lo(wk(w + 1))}, ngày mai là <b>${ans}</b>.` }); }
    const ans = wk(w - 2);
    return ch(R, ans, WEEK, { text: `Ngày mai là ${lo(WEEK[w])}. Hỏi hôm qua là thứ mấy?`, solution: `Ngày mai là ${lo(WEEK[w])} thì hôm nay là ${lo(wk(w - 1))}, hôm qua là <b>${ans}</b>.` });
  }

  function lgCompare0(R) {
    const [more, less, most, least] = R.pick([['cao hơn', 'thấp hơn', 'cao nhất', 'thấp nhất'], ['nặng hơn', 'nhẹ hơn', 'nặng nhất', 'nhẹ nhất'], ['nhiều tuổi hơn', 'ít tuổi hơn', 'nhiều tuổi nhất', 'ít tuổi nhất']]);
    const o = R.sample(NAMES, 3);
    const st = [R.chance(0.5) ? `${o[0]} ${more} ${o[1]}` : `${o[1]} ${less} ${o[0]}`, R.chance(0.5) ? `${o[1]} ${more} ${o[2]}` : `${o[2]} ${less} ${o[1]}`];
    const top = R.chance(0.5), ans = top ? o[0] : o[2];
    return mk({ type: 'choice', choices: R.shuffle(o), answer: ans, text: `${R.shuffle(st).join('. ')}.<br>Hỏi bạn nào ${top ? most : least}?`, solution: `Xếp theo thứ tự: ${o.join(' → ')} (từ ${most.replace(' nhất', '')} nhất đến ${least.replace(' nhất', '')} nhất). Bạn ${top ? most : least} là <b>${ans}</b>.` });
  }

  function lgSeq(R, lv) {
    if (lv === 1) {
      if (R.chance(0.55)) { const a = R.int(1, 20), d = R.int(2, 9), n = R.int(10, 30); return mk({ text: `Cho dãy số cách đều:<div class="seq">${a}, ${a + d}, ${a + 2 * d}, ${a + 3 * d}, ...</div>Số hạng thứ ${n} của dãy là bao nhiêu?`, answer: a + (n - 1) * d, solution: `Khoảng cách giữa hai số liền nhau là ${d}. Từ số hạng thứ 1 đến số hạng thứ ${n} có ${n - 1} khoảng cách. Số hạng thứ ${n}: ${a} + ${n - 1} × ${d} = <b>${a + (n - 1) * d}</b>.` }); }
      const a = R.int(1, 10), t = [a]; for (let i = 1; i < 6; i++) t.push(t[i - 1] + i);
      return mk({ text: `Tìm số tiếp theo của dãy:<div class="seq">${t.slice(0, 5).join(', ')}, ${box}</div>`, answer: t[5], solution: `Khoảng cách tăng dần: +1, +2, +3, +4, rồi +5. Số tiếp theo: ${t[4]} + 5 = <b>${t[5]}</b>.` });
    }
    if (lv === 2) {
      const k = R.pick(['fib', 'sq', 'nn1', 'which', 'x2']);
      if (k === 'fib') { const a = R.int(1, 5), b = R.int(a, a + 4), t = [a, b]; for (let i = 2; i < 8; i++) t.push(t[i - 1] + t[i - 2]); return mk({ text: `Tìm số tiếp theo của dãy:<div class="seq">${t.slice(0, 7).join(', ')}, ${box}</div>`, answer: t[7], solution: `Từ số thứ ba, mỗi số bằng tổng hai số liền trước: ${t[2]} = ${t[0]} + ${t[1]}, ${t[3]} = ${t[1]} + ${t[2]}, ... Số tiếp theo: ${t[5]} + ${t[6]} = <b>${t[7]}</b>.` }); }
      if (k === 'sq') { const s = R.int(1, 5), add = R.pick([0, 0, 1, -1]), t = range(s, s + 5).map(i => i * i + add); return mk({ text: `Tìm số tiếp theo của dãy:<div class="seq">${t.slice(0, 5).join(', ')}, ${box}</div>`, answer: t[5], solution: `Các số có dạng ${add === 0 ? 'n × n' : add > 0 ? 'n × n + 1' : 'n × n − 1'}: ${range(s, s + 4).map(i => `${i} × ${i}${add ? (add > 0 ? ' + 1' : ' − 1') : ''}`).join(', ')}. Số tiếp theo: ${s + 5} × ${s + 5}${add ? (add > 0 ? ' + 1' : ' − 1') : ''} = <b>${t[5]}</b>.` }); }
      if (k === 'nn1') { const t = range(1, 7).map(i => i * (i + 1)); return mk({ text: `Tìm số tiếp theo của dãy:<div class="seq">${t.slice(0, 6).join(', ')}, ${box}</div>`, answer: t[6], solution: `Các số có dạng 1 × 2, 2 × 3, 3 × 4, ... (khoảng cách tăng thêm 2 mỗi lần: +4, +6, +8, ...). Số tiếp theo: 7 × 8 = <b>56</b>.` }); }
      if (k === 'which') { const a = R.int(1, 9), d = R.int(3, 9), n = R.int(20, 80), x = a + (n - 1) * d; return mk({ text: `Cho dãy số:<div class="seq">${a}, ${a + d}, ${a + 2 * d}, ${a + 3 * d}, ...</div>Số ${x} là số hạng thứ mấy của dãy?`, answer: n, solution: `Số khoảng cách từ ${a} đến ${x}: (${x} − ${a}) : ${d} = ${n - 1}. Số ${x} là số hạng thứ ${n - 1} + 1 = <b>${n}</b>.` }); }
      const a = R.int(1, 5), t = [a]; for (let i = 1; i < 6; i++) t.push(t[i - 1] * 2 + 1);
      return mk({ text: `Tìm số tiếp theo của dãy:<div class="seq">${t.slice(0, 5).join(', ')}, ${box}</div>`, answer: t[5], solution: `Mỗi số bằng số liền trước nhân 2 rồi cộng 1. Số tiếp theo: ${t[4]} × 2 + 1 = <b>${t[5]}</b>.` });
    }
    const k = R.pick(['big', 'tri', 'belong', 'sum']);
    if (k === 'big') { const a = R.int(1, 9), d = R.int(3, 12), n = R.int(80, 200); return mk({ text: `Cho dãy số:<div class="seq">${a}, ${a + d}, ${a + 2 * d}, ${a + 3 * d}, ...</div>Số hạng thứ ${n} của dãy là bao nhiêu?`, answer: a + (n - 1) * d, solution: `Số hạng thứ ${n} = số đầu + (${n} − 1) × khoảng cách = ${a} + ${n - 1} × ${d} = <b>${fmt(a + (n - 1) * d)}</b>.` }); }
    if (k === 'tri') { const a = R.int(1, 5), n = R.int(10, 25), v = a + n * (n - 1) / 2; return mk({ text: `Cho dãy số:<div class="seq">${a}, ${a + 1}, ${a + 3}, ${a + 6}, ${a + 10}, ${a + 15}, ...</div>Số hạng thứ ${n} của dãy là bao nhiêu?`, answer: v, solution: `Khoảng cách lần lượt là 1, 2, 3, 4, 5, ... Số hạng thứ ${n} = ${a} + (1 + 2 + ... + ${n - 1}) = ${a} + ${(n - 1) * n / 2} = <b>${v}</b>.` }); }
    if (k === 'belong') {
      const a = R.int(1, 9), d = R.int(3, 9), x = R.int(500, 3000), ok = (x - a) % d === 0;
      return mk({ type: 'choice', choices: ['Có', 'Không'], answer: ok ? 'Có' : 'Không', text: `Cho dãy số:<div class="seq">${a}, ${a + d}, ${a + 2 * d}, ${a + 3 * d}, ...</div>Số ${fmt(x)} có thuộc dãy số này không?`, solution: `Mỗi số của dãy khi chia cho ${d} đều dư ${a % d}. Số ${fmt(x)} chia cho ${d} dư ${x % d}. Vậy câu trả lời là <b>${ok ? 'Có' : 'Không'}</b>.` });
    }
    const a = R.int(1, 9), d = R.int(2, 6), n = R.int(15, 50), l = a + (n - 1) * d;
    return mk({ text: `Cho dãy số:<div class="seq">${a}, ${a + d}, ${a + 2 * d}, ..., ${l}</div>Dãy có bao nhiêu số hạng?`, answer: n, solution: `Số số hạng = (số cuối − số đầu) : khoảng cách + 1 = (${l} − ${a}) : ${d} + 1 = <b>${n}</b>.` });
  }

  function lgTable(R, lv) {
    const rules = {
      1: [['a + b', (a, b) => a + b], ['a × b', (a, b) => a * b], ['(a + b) × 2', (a, b) => (a + b) * 2], ['a − b', (a, b) => a - b]],
      2: [['a × b − a', (a, b) => a * b - a], ['a × 2 + b', (a, b) => a * 2 + b], ['(a − b) × 3', (a, b) => (a - b) * 3], ['a × b + b', (a, b) => a * b + b], ['a × a − b', (a, b) => a * a - b]],
      3: [['a × b − (a + b)', (a, b) => a * b - a - b], ['a × a + b × b', (a, b) => a * a + b * b], ['(a + b) × (a − b)', (a, b) => (a + b) * (a - b)], ['a × b + a + b', (a, b) => a * b + a + b]],
    }[lv];
    const [rs, f] = R.pick(rules);
    const rows = []; const seen = new Set();
    while (rows.length < 4) { const b = R.int(2, lv === 1 ? 15 : 9), a = b + R.int(1, lv === 1 ? 20 : 8); if (seen.has(a + ',' + b)) continue; seen.add(a + ',' + b); rows.push([a, b, f(a, b)]); }
    const ans = rows[3][2];
    const html = tab([['a', ...rows.map(r => r[0])], ['b', ...rows.map(r => r[1])], ['c', ...rows.slice(0, 3).map(r => r[2]), '?']]);
    return mk({ text: `Các số trong bảng được điền theo cùng một quy luật. Tìm số thay cho dấu ?${html}`, answer: ans, solution: `Quy luật: c = ${rs}. Kiểm tra: ${rows.slice(0, 2).map(r => `${rs.replace(/a/g, r[0]).replace(/b/g, r[1])} = ${r[2]}`).join('; ')}. Vậy ? = ${rs.replace(/a/g, rows[3][0]).replace(/b/g, rows[3][1])} = <b>${ans}</b>.` });
  }

  function lgAge(R, lv) {
    const C = R.pick(NAMES);
    if (lv === 1) {
      if (R.chance(0.6)) { const c = R.int(5, 15), d = R.int(20, 35); return mk({ text: `Tổng số tuổi của mẹ và ${C} là ${2 * c + d} tuổi. Mẹ hơn ${C} ${d} tuổi. Hỏi ${C} bao nhiêu tuổi?`, answer: c, solution: `Tuổi ${C} = (tổng − hiệu) : 2 = (${2 * c + d} − ${d}) : 2 = <b>${c}</b> tuổi.` }); }
      const c = R.int(5, 12), d = R.int(22, 35), x = R.int(c + 2, c + 15);
      return mk({ text: `Năm nay ${C} ${c} tuổi, bố ${c + d} tuổi. Hỏi khi ${C} ${x} tuổi thì bố bao nhiêu tuổi?`, answer: x + d, solution: `Bố luôn hơn ${C} ${c + d} − ${c} = ${d} tuổi. Khi ${C} ${x} tuổi, bố ${x} + ${d} = <b>${x + d}</b> tuổi.` });
    }
    if (lv === 2) {
      const k = R.pick(['diffk', 'sumk', 'sumn']);
      const kk = R.int(3, 6), c = R.int(5, 12);
      if (k === 'diffk') return mk({ text: `Mẹ hơn ${C} ${c * (kk - 1)} tuổi. Tuổi mẹ gấp ${kk} lần tuổi ${C}. Hỏi ${C} bao nhiêu tuổi?`, answer: c, solution: `Coi tuổi ${C} là 1 phần thì tuổi mẹ là ${kk} phần. Hiệu số phần: ${kk - 1}. Tuổi ${C}: ${c * (kk - 1)} : ${kk - 1} = <b>${c}</b> tuổi.` });
      if (k === 'sumk') return mk({ text: `Tổng số tuổi của bố và ${C} là ${c * (kk + 1)} tuổi. Tuổi bố gấp ${kk} lần tuổi ${C}. Hỏi bố bao nhiêu tuổi?`, answer: c * kk, solution: `Tổng số phần: ${kk} + 1 = ${kk + 1}. Tuổi ${C}: ${c * (kk + 1)} : ${kk + 1} = ${c}. Tuổi bố: ${c} × ${kk} = <b>${c * kk}</b> tuổi.` });
      const S = R.int(15, 30), n = R.int(2, 8), m = R.int(2, 3);
      return mk({ text: `Hiện nay tổng số tuổi của ${m === 2 ? 'hai anh em' : 'ba anh em'} là ${S} tuổi. Hỏi ${n} năm nữa tổng số tuổi của ${m === 2 ? 'hai' : 'ba'} anh em là bao nhiêu?`, answer: S + m * n, solution: `Mỗi năm, mỗi người thêm 1 tuổi nên tổng tăng ${m} tuổi. Sau ${n} năm tổng tăng ${m} × ${n} = ${m * n}. Tổng tuổi: ${S} + ${m * n} = <b>${S + m * n}</b> tuổi.` });
    }
    const k = R.pick(['future', 'past', 'frac']);
    if (k === 'future') {
      const kk = R.int(2, 4), x = R.int(8, 15), n = R.int(2, 8), d = x * (kk - 1), c = x - n;
      if (c < 1 || d < 20 || d > 40) return lgAge(R, lv);
      return mk({ text: `Năm nay mẹ ${c + d} tuổi, ${C} ${c} tuổi. Hỏi sau bao nhiêu năm nữa tuổi mẹ gấp ${kk} lần tuổi ${C}?`, answer: n, solution: `Mẹ luôn hơn ${C} ${d} tuổi. Khi tuổi mẹ gấp ${kk} lần tuổi ${C}, hiệu số phần là ${kk - 1}, tuổi ${C} lúc đó: ${d} : ${kk - 1} = ${x}. Số năm: ${x} − ${c} = <b>${n}</b> năm.` });
    }
    if (k === 'past') {
      const kk = R.int(3, 7), x = R.int(3, 8), n = R.int(2, 6), d = x * (kk - 1), c = x + n;
      if (d < 20 || d > 40) return lgAge(R, lv);
      return mk({ text: `Năm nay bố ${c + d} tuổi, ${C} ${c} tuổi. Hỏi cách đây bao nhiêu năm tuổi bố gấp ${kk} lần tuổi ${C}?`, answer: n, solution: `Bố luôn hơn ${C} ${d} tuổi. Lúc tuổi bố gấp ${kk} lần tuổi ${C}, tuổi ${C} là: ${d} : ${kk - 1} = ${x}. Cách đây: ${c} − ${x} = <b>${n}</b> năm.` });
    }
    for (;;) {
      const c = R.int(6, 14), kk = R.int(3, 5), n = R.int(1, c - 2), m = (kk * c - n) / (c - n);
      if (Number.isInteger(m) && m > kk) return mk({ text: `Năm nay tuổi ${C} bằng ${fr(1, kk)} tuổi mẹ. Cách đây ${n} năm, tuổi mẹ gấp ${m} lần tuổi ${C}. Hỏi năm nay ${C} bao nhiêu tuổi?`, answer: c, solution: `Hiệu số tuổi không đổi. Năm nay hiệu bằng ${kk - 1} lần tuổi ${C}; ${n} năm trước hiệu bằng ${m - 1} lần tuổi ${C} lúc đó. Thử: nếu năm nay ${C} ${c} tuổi thì mẹ ${kk * c} tuổi; ${n} năm trước ${C} ${c - n} tuổi, mẹ ${kk * c - n} tuổi = ${m} × ${c - n}. Đúng. Vậy ${C} năm nay <b>${c}</b> tuổi.` });
    }
  }

  function lgChicken(R, lv) {
    if (lv === 1 || lv === 2) {
      const H = lv === 1 ? R.int(6, 15) : R.int(18, 45), d = R.int(1, H - 1), g = H - d;
      const ctx = R.pick([['gà', 'chó', 2, 4, 'con', 'chân', 'Vừa gà vừa chó có tất cả H con, đếm được L chân.'], ['xe đạp', 'ô tô', 2, 4, 'chiếc', 'bánh xe', 'Trong bãi có xe đạp và ô tô, tất cả H chiếc xe với L bánh xe.'], ['ghế 3 chân', 'ghế 4 chân', 3, 4, 'cái', 'chân ghế', 'Trong phòng có ghế 3 chân và ghế 4 chân, tất cả H cái ghế với L chân ghế.']]);
      const [A, B, x, y, u, leg] = ctx, L = g * x + d * y;
      const askB = R.chance(0.5);
      return mk({ text: `${ctx[6].replace('H', H).replace('L', L)} Hỏi có bao nhiêu ${u} ${askB ? B : A}?`, answer: askB ? d : g,
        solution: `Giả sử tất cả đều là ${A} thì có ${H} × ${x} = ${H * x} ${leg}, ít hơn thực tế ${L} − ${H * x} = ${L - H * x} ${leg}. Mỗi ${B} hơn mỗi ${A} ${y - x} ${leg}. Số ${B}: ${L - H * x} : ${y - x} = ${d} ${u}. Số ${A}: ${H} − ${d} = ${g} ${u}. Đáp số: <b>${askB ? d : g}</b>.` });
    }
    const k = R.pick(['test', 'legsdiff', 'money']);
    if (k === 'test') {
      const n = R.pick([10, 20, 25, 30]), a = R.pick([4, 5, 10]), b = R.pick([1, 2, 3]), c = R.int(Math.ceil(n * b / (a + b)) + 1, n);
      const S = c * a - (n - c) * b;
      return mk({ text: `Một bài thi có ${n} câu. Mỗi câu đúng được ${a} điểm, mỗi câu sai hoặc bỏ qua bị trừ ${b} điểm. ${R.pick(NAMES)} làm hết bài và được ${S} điểm. Hỏi bạn đó làm đúng bao nhiêu câu?`, answer: c, solution: `Nếu đúng cả ${n} câu thì được ${n} × ${a} = ${n * a} điểm, hụt ${n * a} − ${S} = ${n * a - S} điểm. Mỗi câu sai thay vì đúng làm mất ${a} + ${b} = ${a + b} điểm. Số câu sai: ${n * a - S} : ${a + b} = ${n - c}. Số câu đúng: ${n} − ${n - c} = <b>${c}</b>.` });
    }
    if (k === 'legsdiff') {
      const d = R.int(3, 20), g = R.int(2 * d + 1, 2 * d + 30), X = 2 * g - 4 * d;
      return mk({ text: `Vừa gà vừa chó có ${g + d} con. Số chân gà nhiều hơn số chân chó ${X} chân. Hỏi có bao nhiêu con chó?`, answer: d, solution: `Nếu bớt đi 1 con chó và thêm 1 con gà (tổng số con không đổi) thì chân gà tăng 2, chân chó giảm 4, hiệu tăng 6. Giả sử tất cả là gà: hiệu là ${2 * (g + d)} chân. Thực tế hiệu là ${X}, kém ${2 * (g + d) - X} chân. Số chó: ${2 * (g + d) - X} : 6 = <b>${d}</b> con.` });
    }
    const n = R.int(10, 30), b = R.int(1, n - 1), a = n - b, T = a * 2 + b * 5;
    return mk({ text: `${R.pick(NAMES)} có ${n} tờ tiền gồm hai loại 2 nghìn đồng và 5 nghìn đồng, tổng cộng ${T} nghìn đồng. Hỏi có bao nhiêu tờ loại 5 nghìn đồng?`, answer: b, solution: `Giả sử cả ${n} tờ đều là loại 2 nghìn: ${n * 2} nghìn đồng, ít hơn thực tế ${T} − ${n * 2} = ${T - 2 * n} nghìn. Mỗi tờ 5 nghìn hơn tờ 2 nghìn 3 nghìn. Số tờ 5 nghìn: ${T - 2 * n} : 3 = <b>${b}</b> tờ.` });
  }

  function lgTrees(R, lv) {
    const d = R.pick([2, 3, 4, 5, 6, 8, 10]), n = R.int(8, 40), Lg = d * n;
    if (lv === 1) {
      if (R.chance(0.6)) return mk({ text: `Người ta trồng cây ở một bên đường dài ${Lg} m, hai cây liền nhau cách nhau ${d} m, cả hai đầu đường đều trồng cây. Hỏi trồng được bao nhiêu cây?`, answer: n + 1, solution: `Số khoảng cách: ${Lg} : ${d} = ${n}. Trồng cả hai đầu thì số cây = số khoảng + 1 = <b>${n + 1}</b> cây.` });
      return mk({ text: `Người ta trồng cây ở một bên đường dài ${Lg} m, hai cây liền nhau cách nhau ${d} m, hai đầu đường không trồng cây. Hỏi trồng được bao nhiêu cây?`, answer: n - 1, solution: `Số khoảng cách: ${Lg} : ${d} = ${n}. Không trồng ở hai đầu thì số cây = số khoảng − 1 = <b>${n - 1}</b> cây.` });
    }
    if (lv === 2) {
      const k = R.pick(['both', 'circle', 'rev']);
      if (k === 'both') return mk({ text: `Người ta trồng cây ở cả hai bên của một con đường dài ${Lg} m, hai cây liền nhau cách nhau ${d} m, các đầu đường đều có trồng cây. Hỏi trồng được tất cả bao nhiêu cây?`, answer: 2 * (n + 1), solution: `Mỗi bên: ${Lg} : ${d} + 1 = ${n + 1} cây. Hai bên: ${n + 1} × 2 = <b>${2 * (n + 1)}</b> cây.` });
      if (k === 'circle') return mk({ text: `Quanh một cái hồ có chu vi ${Lg} m, người ta trồng cây, hai cây liền nhau cách nhau ${d} m. Hỏi trồng được bao nhiêu cây?`, answer: n, solution: `Trồng theo vòng khép kín thì số cây bằng số khoảng cách: ${Lg} : ${d} = <b>${n}</b> cây.` });
      return mk({ text: `Một hàng có ${n + 1} cây, hai cây liền nhau cách nhau ${d} m. Hỏi khoảng cách từ cây đầu đến cây cuối là bao nhiêu mét?`, answer: Lg, solution: `${n + 1} cây tạo ra ${n} khoảng cách. Độ dài: ${n} × ${d} = <b>${Lg}</b> m.` });
    }
    const k = R.pick(['stairs', 'bell', 'add']);
    if (k === 'stairs') { const a = R.int(2, 4), t = R.int(1, 4), b = R.int(a + 2, 12); return mk({ text: `Một người đi từ tầng 1 lên tầng ${a} mất ${(a - 1) * t} phút. Hỏi với tốc độ đó, người ấy đi từ tầng 1 lên tầng ${b} mất bao nhiêu phút?`, answer: (b - 1) * t, solution: `Từ tầng 1 lên tầng ${a} phải đi ${a - 1} đoạn cầu thang, mỗi đoạn ${(a - 1) * t} : ${a - 1} = ${t} phút. Lên tầng ${b} đi ${b - 1} đoạn: ${b - 1} × ${t} = <b>${(b - 1) * t}</b> phút.` }); }
    if (k === 'bell') { const a = R.int(3, 5), t = R.int(1, 3), b = R.int(a + 2, 12); return mk({ text: `Một chiếc đồng hồ đánh ${a} tiếng chuông hết ${(a - 1) * t} giây. Hỏi đồng hồ đánh ${b} tiếng chuông hết bao nhiêu giây? (Khoảng cách giữa hai tiếng liền nhau như nhau)`, answer: (b - 1) * t, solution: `${a} tiếng chuông có ${a - 1} khoảng nghỉ, mỗi khoảng ${t} giây. ${b} tiếng có ${b - 1} khoảng: ${b - 1} × ${t} = <b>${(b - 1) * t}</b> giây.` }); }
    const d2 = d * R.pick([2, 3]);
    const m = Lg / d2;
    if (!Number.isInteger(m)) return lgTrees(R, lv);
    return mk({ text: `Trên một đoạn đường dài ${Lg} m đã trồng cây cách nhau ${d2} m (cả hai đầu đều có cây). Nay người ta trồng thêm cây để hai cây liền nhau chỉ cách nhau ${d} m. Hỏi phải trồng thêm bao nhiêu cây?`, answer: n - m, solution: `Lúc đầu có ${Lg} : ${d2} + 1 = ${m + 1} cây. Lúc sau có ${Lg} : ${d} + 1 = ${n + 1} cây. Trồng thêm: ${n + 1} − ${m + 1} = <b>${n - m}</b> cây.` });
  }

  function perms(arr) { if (arr.length <= 1) return [arr]; const out = []; arr.forEach((x, i) => perms(arr.slice(0, i).concat(arr.slice(i + 1))).forEach(p => out.push([x, ...p]))); return out; }
  function lgAssign(R, lv) {
    const n = lv === 1 ? 3 : 4;
    const ctx = R.pick([['mặc áo màu', ['đỏ', 'xanh', 'vàng', 'trắng']], ['thích con vật', ['mèo', 'chó', 'thỏ', 'cá']], ['học giỏi môn', ['Toán', 'Tiếng Việt', 'Tiếng Anh', 'Mĩ thuật']], ['nuôi con', ['mèo', 'chó', 'thỏ', 'vẹt']]]);
    const ppl = R.sample(NAMES, n), items = ctx[1].slice(0, n), sigma = R.shuffle(range(0, n - 1));
    const all = perms(range(0, n - 1));
    const cands = [];
    for (let p = 0; p < n; p++) for (let it = 0; it < n; it++) if (sigma[p] !== it) cands.push([p, it]);
    const clues = [];
    let left = all;
    for (const c of R.shuffle(cands)) {
      const nl = left.filter(s => s[c[0]] !== c[1]);
      if (nl.length < left.length) { clues.push(c); left = nl; }
      if (left.length === 1) break;
    }
    const target = R.int(0, n - 1), ans = items[sigma[target]];
    return mk({ type: 'choice', choices: items.slice(), answer: ans,
      text: `${ppl.join(', ')} mỗi bạn ${ctx[0]} khác nhau: ${items.join(', ')}. Biết rằng:<br>${clues.map(([p, it]) => `• ${ppl[p]} không ${ctx[0]} ${items[it]}.`).join('<br>')}<br>Hỏi ${ppl[target]} ${ctx[0]} gì?`,
      solution: `Lập bảng ${n} × ${n}, đánh dấu ✗ vào các ô "không". Hàng (hoặc cột) nào chỉ còn một ô trống thì ô đó đúng, rồi gạch ô đó ở các hàng khác. Kết quả: ${ppl.map((p, i) => `${p} – ${items[sigma[i]]}`).join('; ')}. Vậy ${ppl[target]} ${ctx[0]} <b>${ans}</b>.` });
  }

  function lgLiar(R, lv) {
    const n = lv === 2 ? 3 : R.int(3, 4);
    const ppl = R.sample(NAMES, n);
    const ev = R.pick(['làm vỡ bình hoa', 'ăn vụng bánh', 'giấu cây bút của cô giáo', 'làm đổ mực']);
    const truthMode = R.pick(['one-true', 'one-lie']);
    for (let tries = 0; tries < 400; tries++) {
      const st = ppl.map((_, s) => { const t = R.int(0, n - 1), neg = R.chance(0.5); return [s, t, neg]; });
      const holds = (cul, [, t, neg]) => (neg ? cul !== t : cul === t);
      const ok = range(0, n - 1).filter(cul => { const tr = st.filter(x => holds(cul, x)).length; return truthMode === 'one-true' ? tr === 1 : tr === n - 1; });
      if (ok.length !== 1) continue;
      const cul = ok[0];
      const say = ([s, t, neg]) => `${ppl[s]}: "${s === t ? (neg ? 'Tôi không ' + ev + '.' : 'Tôi đã ' + ev + '.') : `${ppl[t]} ${neg ? 'không ' : 'đã '}${ev}.`}"`;
      return mk({ type: 'choice', choices: ppl.slice(), answer: ppl[cul],
        text: `Một trong ${n} bạn ${ppl.join(', ')} đã ${ev}. Cô giáo hỏi, các bạn trả lời:<br>${st.map(say).join('<br>')}<br>Biết rằng chỉ có đúng một bạn nói ${truthMode === 'one-true' ? 'thật' : 'dối'}. Hỏi ai đã ${ev}?`,
        solution: `Thử lần lượt từng bạn là người ${ev}, đếm số câu nói thật. Chỉ khi ${ppl[cul]} là người ${ev} thì có đúng ${truthMode === 'one-true' ? 'một câu nói thật' : 'một câu nói dối'} (${st.filter(x => holds(cul, x) === (truthMode === 'one-true')).map(x => ppl[x[0]]).join(', ')} nói ${truthMode === 'one-true' ? 'thật' : 'dối'}). Vậy người ${ev} là <b>${ppl[cul]}</b>.` });
    }
    return lgAssign(R, 2);
  }

  const MONTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function lgCalendar(R, lv) {
    const w = R.int(0, 6);
    if (lv === 1) {
      const n = R.int(8, 60), ans = wk(w + n);
      return ch(R, ans, WEEK, { text: `Hôm nay là ${lo(WEEK[w])}. Hỏi ${n} ngày nữa là thứ mấy?`, solution: `Cứ 7 ngày lại lặp lại thứ cũ. ${n} = 7 × ${Math.floor(n / 7)} + ${n % 7}. Sau ${7 * Math.floor(n / 7)} ngày vẫn là ${lo(WEEK[w])}, thêm ${n % 7} ngày nữa là <b>${ans}</b>.` });
    }
    if (lv === 2) {
      if (R.chance(0.6)) {
        const d1 = R.int(1, 28), d2 = R.int(1, 30);
        if (d1 === d2) return lgCalendar(R, lv);
        const ans = wk(w + d2 - d1);
        return ch(R, ans, WEEK, { text: `Ngày ${d1} của một tháng là ${lo(WEEK[w])}. Hỏi ngày ${d2} của tháng đó là thứ mấy? (Tháng có 30 ngày)`, solution: `Hai ngày cách nhau ${Math.abs(d2 - d1)} ngày = 7 × ${Math.floor(Math.abs(d2 - d1) / 7)} + ${Math.abs(d2 - d1) % 7}. ${d2 > d1 ? 'Đếm tiếp' : 'Đếm lùi'} ${Math.abs(d2 - d1) % 7} ngày từ ${lo(WEEK[w])}: <b>${ans}</b>.` });
      }
      const len = R.pick([30, 31]), ws = R.int(0, 6), day = R.int(0, 6);
      const cnt = countIn(1, len, d => (ws + d - 1) % 7 === day);
      return mk({ text: `Một tháng có ${len} ngày, ngày 1 của tháng là ${lo(WEEK[ws])}. Hỏi tháng đó có bao nhiêu ngày ${lo(WEEK[day])}?`, answer: cnt, solution: `Ngày ${lo(WEEK[day])} đầu tiên là ngày ${firstIn(1, 7, d => (ws + d - 1) % 7 === day)}. Các ngày ${lo(WEEK[day])}: ${range(1, len).filter(d => (ws + d - 1) % 7 === day).join(', ')}. Có <b>${cnt}</b> ngày.` });
    }
    const k = R.pick(['month', 'even', 'year']);
    if (k === 'month') {
      const m = R.pick([0, 2, 3, 4, 5, 6, 7, 8, 9, 10]), d1 = R.int(1, 28), d2 = R.int(1, 28), gap = MONTHS[m] - d1 + d2, ans = wk(w + gap);
      return ch(R, ans, WEEK, { text: `Ngày ${d1} tháng ${m + 1} là ${lo(WEEK[w])}. Hỏi ngày ${d2} tháng ${m + 2} cùng năm là thứ mấy?`, solution: `Tháng ${m + 1} có ${MONTHS[m]} ngày. Từ ngày ${d1}/${m + 1} đến ngày ${d2}/${m + 2} là ${MONTHS[m]} − ${d1} + ${d2} = ${gap} ngày = 7 × ${Math.floor(gap / 7)} + ${gap % 7}. Đếm tiếp ${gap % 7} ngày từ ${lo(WEEK[w])}: <b>${ans}</b>.` });
    }
    if (k === 'even') {
      const d = R.int(1, 30), ans = wk(w + d - 2);
      return ch(R, ans, WEEK, { text: `Trong một tháng có 3 ngày ${lo(WEEK[w])} là ngày chẵn. Hỏi ngày ${d} của tháng đó là thứ mấy?`, solution: `Các ngày ${lo(WEEK[w])} cách nhau 7 ngày, xen kẽ chẵn – lẻ. Muốn có 3 ngày chẵn thì phải có 5 ngày ${lo(WEEK[w])}, bắt đầu từ ngày chẵn: 2, 9, 16, 23, 30. Ngày ${d} cách ngày 2 là ${Math.abs(d - 2)} ngày, nên ngày ${d} là <b>${ans}</b>.` });
    }
    const leap = R.chance(0.3), n = leap ? 366 : 365, ans = wk(w + n);
    return ch(R, ans, WEEK, { text: `Ngày 1 tháng 1 của một năm ${leap ? 'nhuận (có 366 ngày)' : 'thường (có 365 ngày)'} là ${lo(WEEK[w])}. Hỏi ngày 1 tháng 1 của năm sau là thứ mấy?`, solution: `${n} = 7 × 52 + ${n - 364}. Sau ${n} ngày thì thứ dịch đi ${n - 364} ngày: <b>${ans}</b>.` });
  }

  function lgMotion(R, lv) {
    if (lv === 1) {
      const k = R.pick(['dist', 'speed', 'walk']);
      if (k === 'dist') { const v = R.int(10, 60), t = R.int(2, 6); return mk({ text: `Một người đi xe máy, mỗi giờ đi được ${v} km. Hỏi trong ${t} giờ người đó đi được bao nhiêu ki-lô-mét?`, answer: v * t, solution: `Quãng đường: ${v} × ${t} = <b>${v * t}</b> km.` }); }
      if (k === 'speed') { const v = R.int(30, 70), t = R.int(2, 5); return mk({ text: `Một ô tô đi quãng đường dài ${v * t} km hết ${t} giờ. Hỏi trung bình mỗi giờ ô tô đi được bao nhiêu ki-lô-mét?`, answer: v, solution: `Mỗi giờ đi được: ${v * t} : ${t} = <b>${v}</b> km.` }); }
      const v = R.int(50, 90), t = R.int(10, 30);
      return mk({ text: `${R.pick(NAMES)} đi bộ đến trường, mỗi phút đi được ${v} m và đi hết ${t} phút. Hỏi quãng đường từ nhà đến trường dài bao nhiêu mét?`, answer: v * t, solution: `Quãng đường: ${v} × ${t} = <b>${fmt(v * t)}</b> m.` });
    }
    if (lv === 2) {
      const v1 = R.int(10, 50), v2 = R.int(10, 50), t = R.int(2, 5);
      if (R.chance(0.6)) return mk({ text: `Hai xe xuất phát cùng một lúc từ hai đầu quãng đường dài ${(v1 + v2) * t} km và đi ngược chiều nhau. Xe thứ nhất mỗi giờ đi ${v1} km, xe thứ hai mỗi giờ đi ${v2} km. Hỏi sau mấy giờ hai xe gặp nhau?`, answer: t, solution: `Mỗi giờ hai xe gần nhau thêm: ${v1} + ${v2} = ${v1 + v2} km. Thời gian gặp nhau: ${(v1 + v2) * t} : ${v1 + v2} = <b>${t}</b> giờ.` });
      const a = Math.max(v1, v2) + R.int(5, 20), b = Math.max(v1, v2), dd = (a - b) * t;
      return mk({ text: `Một xe máy đi trước một ô tô ${dd} km, cả hai cùng đi một chiều và xuất phát cùng lúc. Ô tô mỗi giờ đi ${a} km, xe máy mỗi giờ đi ${b} km. Hỏi sau mấy giờ ô tô đuổi kịp xe máy?`, answer: t, solution: `Mỗi giờ ô tô gần xe máy thêm: ${a} − ${b} = ${a - b} km. Thời gian đuổi kịp: ${dd} : ${a - b} = <b>${t}</b> giờ.` });
    }
    const k = R.pick(['pole', 'bridge', 'left']);
    if (k === 'pole') { const v = R.int(10, 25), t = R.int(6, 20); return mk({ text: `Một đoàn tàu dài ${v * t} m chạy qua một cột điện hết ${t} giây. Hỏi mỗi giây đoàn tàu chạy được bao nhiêu mét?`, answer: v, solution: `Tàu qua cột điện khi đầu tàu đến cột cho tới lúc đuôi tàu qua cột, tức là tàu đi được đúng bằng chiều dài của nó: ${v * t} m. Mỗi giây: ${v * t} : ${t} = <b>${v}</b> m.` }); }
    if (k === 'bridge') { const v = R.int(10, 25), t = R.int(10, 40), L = R.int(5, 20) * 10; if (v * t <= L) return lgMotion(R, lv); return mk({ text: `Một đoàn tàu dài ${L} m, mỗi giây chạy được ${v} m. Hỏi tàu chạy qua hết một cây cầu dài ${v * t - L} m mất bao nhiêu giây?`, answer: t, solution: `Để qua hết cầu, tàu phải đi quãng đường bằng chiều dài cầu cộng chiều dài tàu: ${v * t - L} + ${L} = ${v * t} m. Thời gian: ${v * t} : ${v} = <b>${t}</b> giây.` }); }
    const v1 = R.int(10, 40), v2 = R.int(10, 40), t = R.int(2, 4), dd = R.int(5, 40), S = (v1 + v2) * t + dd;
    return mk({ text: `Hai người ở hai địa điểm cách nhau ${S} km, cùng lúc đi ngược chiều về phía nhau. Sau ${t} giờ, hai người còn cách nhau ${dd} km. Người thứ nhất mỗi giờ đi ${v1} km. Hỏi người thứ hai mỗi giờ đi bao nhiêu ki-lô-mét?`, answer: v2, solution: `Sau ${t} giờ, hai người đi được tổng cộng ${S} − ${dd} = ${S - dd} km, tức mỗi giờ cả hai đi ${S - dd} : ${t} = ${v1 + v2} km. Người thứ hai: ${v1 + v2} − ${v1} = <b>${v2}</b> km mỗi giờ.` });
  }

  // =====================================================================
  // TỔ HỢP
  // =====================================================================
  function svgLattice(r, c) {
    const s0 = 50, X = 30, Y = 20;
    let s = '';
    for (let i = 0; i <= r; i++) s += line(X, Y + i * s0, X + c * s0, Y + i * s0);
    for (let j = 0; j <= c; j++) s += line(X + j * s0, Y, X + j * s0, Y + r * s0);
    s += `<circle cx="${X}" cy="${Y + r * s0}" r="7" fill="#ef4444"/><circle cx="${X + c * s0}" cy="${Y}" r="7" fill="#2563eb"/>`;
    s += txt(X - 14, Y + r * s0 + 20, 'A') + txt(X + c * s0 + 14, Y - 4, 'B');
    return svg(X + c * s0 + 34, Y + r * s0 + 30, s, Math.min(320, X + c * s0 + 34));
  }

  function cbOutfit0(R) {
    const a = R.int(2, 4), b = R.int(2, 4);
    const t = R.pick([['cái áo', 'cái quần', '👕', '👖', 'một bộ gồm 1 áo và 1 quần'], ['loại bánh', 'loại nước', '🍰', '🥤', 'một phần ăn gồm 1 bánh và 1 nước'], ['cái mũ', 'đôi giày', '🧢', '👟', 'một mũ và một đôi giày']]);
    return mk({ text: `${R.pick(NAMES)} có ${a} ${t[0]} và ${b} ${t[1]}. Có bao nhiêu cách chọn ${t[4]}?`, visual: `<div class="seq emoji">${t[2].repeat(a)}&nbsp;&nbsp;&nbsp;${t[3].repeat(b)}</div>`, answer: a * b, solution: `Mỗi ${t[0].replace(/^(cái|loại) /, '')} đi với ${b} ${t[1]}: ${Array(a).fill(b).join(' + ')} = ${a} × ${b} = <b>${a * b}</b> cách.` });
  }
  function cbHandshake0(R) {
    const n = R.int(3, 5), ps = R.sample(NAMES, n), pairs = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push(`${ps[i]} – ${ps[j]}`);
    return mk({ text: `${ps.join(', ')} gặp nhau, mỗi bạn bắt tay mỗi bạn khác đúng một lần. Hỏi có tất cả bao nhiêu cái bắt tay?`, answer: pairs.length, solution: `Liệt kê: ${pairs.join('; ')}. Có <b>${pairs.length}</b> cái bắt tay.` });
  }
  function cbList0(R) {
    const zero = R.chance(0.35), rep = !zero && R.chance(0.3);
    const ds = zero ? [0, ...R.sample(range(1, 9), 2)].sort() : R.sample(range(1, 9), 3).sort();
    const all = [];
    for (const a of ds) for (const b of ds) if (a && (rep || a !== b)) all.push(10 * a + b);
    return mk({ text: `Từ ba chữ số ${ds.join(', ')}, lập được bao nhiêu số có hai chữ số ${rep ? '(các chữ số có thể giống nhau)' : 'khác nhau'}?`, answer: all.length, solution: `Liệt kê theo chữ số hàng chục: ${all.join(', ')}.${zero ? ' Chữ số 0 không đứng ở hàng chục.' : ''} Có <b>${all.length}</b> số.` });
  }
  function cbPigeon0(R) {
    const r = R.int(2, 8), g = R.int(2, 8), [c1, c2] = R.pick([['đỏ', 'xanh'], ['trắng', 'đen'], ['vàng', 'tím']]);
    return mk({ text: `Trong túi có ${r} viên bi ${c1} và ${g} viên bi ${c2}. Không nhìn vào túi, phải lấy ra ít nhất bao nhiêu viên bi để chắc chắn có 1 viên bi ${c1}?`, visual: `<div class="seq emoji">${(c1 === 'đỏ' ? '🔴' : c1 === 'trắng' ? '⚪' : '🟡').repeat(r)} ${(c2 === 'xanh' ? '🔵' : c2 === 'đen' ? '⚫' : '🟣').repeat(g)}</div>`, answer: g + 1, solution: `Xui nhất là lấy hết ${g} viên ${c2} trước. Lấy thêm 1 viên nữa chắc chắn là bi ${c1}: ${g} + 1 = <b>${g + 1}</b> viên.` });
  }

  function cbRule(R, lv) {
    if (lv === 1) {
      const a = R.int(3, 8), b = R.int(3, 8);
      if (R.chance(0.6)) return mk({ text: `Căng tin có ${a} loại bánh mì và ${b} loại sữa. ${R.pick(NAMES)} muốn chọn 1 bánh mì và 1 hộp sữa. Hỏi có bao nhiêu cách chọn?`, answer: a * b, solution: `Chọn bánh mì: ${a} cách; với mỗi loại bánh có ${b} cách chọn sữa. Số cách: ${a} × ${b} = <b>${a * b}</b>.` });
      return mk({ text: `Căng tin có ${a} loại bánh mì và ${b} loại sữa. ${R.pick(NAMES)} chỉ được chọn 1 món (hoặc bánh mì, hoặc sữa). Hỏi có bao nhiêu cách chọn?`, answer: a + b, solution: `Chọn bánh mì: ${a} cách; hoặc chọn sữa: ${b} cách. Vì chỉ chọn một món nên cộng lại: ${a} + ${b} = <b>${a + b}</b> cách.` });
    }
    if (lv === 2) {
      const a = R.int(2, 5), b = R.int(2, 5), c = R.int(2, 4);
      if (R.chance(0.5)) return mk({ text: `Thực đơn có ${a} món chính, ${b} món canh và ${c} món tráng miệng. Một suất ăn gồm 1 món chính, 1 món canh và 1 món tráng miệng. Hỏi có bao nhiêu cách chọn suất ăn?`, answer: a * b * c, solution: `Theo quy tắc nhân: ${a} × ${b} × ${c} = <b>${a * b * c}</b> cách.` });
      return mk({ text: `Từ A đến B có ${a} con đường, từ B đến C có ${b} con đường. Ngoài ra có ${c} con đường đi thẳng từ A đến C. Hỏi có bao nhiêu cách đi từ A đến C?`, answer: a * b + c, solution: `Đi qua B: ${a} × ${b} = ${a * b} cách. Đi thẳng: ${c} cách. Tổng: ${a * b} + ${c} = <b>${a * b + c}</b> cách.` });
    }
    const k = R.pick(['return', 'code', 'flag']);
    if (k === 'return') { const a = R.int(2, 4), b = R.int(2, 4), ans = a * b * (a - 1) * (b - 1); return mk({ text: `Từ A đến B có ${a} con đường, từ B đến C có ${b} con đường. Một người đi từ A đến C (qua B) rồi quay về A (qua B), đường về không đi lại bất kì con đường nào đã đi. Hỏi có bao nhiêu cách đi cả đi lẫn về?`, answer: ans, solution: `Lượt đi: ${a} × ${b} = ${a * b} cách. Lượt về: từ C về B còn ${b - 1} đường, từ B về A còn ${a - 1} đường: ${b - 1} × ${a - 1} = ${(a - 1) * (b - 1)} cách. Tổng: ${a * b} × ${(a - 1) * (b - 1)} = <b>${ans}</b> cách.` }); }
    if (k === 'code') {
      const L = R.int(2, 4), t = R.pick([['chữ số lẻ', 5], ['chữ số chẵn', 5], ['chữ số khác 0', 9], ['chữ số', 10]]);
      return mk({ text: `Một mật mã gồm ${L} kí tự, mỗi kí tự là một ${t[0]} (các kí tự có thể giống nhau). Hỏi có bao nhiêu mật mã khác nhau?`, answer: t[1] ** L, solution: `Mỗi vị trí có ${t[1]} cách chọn. Số mật mã: ${Array(L).fill(t[1]).join(' × ')} = <b>${fmt(t[1] ** L)}</b>.` });
    }
    const n = R.int(3, 5), m = R.int(2, 3);
    let ans = 1; for (let i = 0; i < m; i++) ans *= n - i;
    return mk({ text: `Có ${n} màu khác nhau. Cần tô ${m} sọc của một lá cờ (các sọc xếp thành hàng ngang), mỗi sọc một màu và các sọc khác màu nhau. Hỏi có bao nhiêu cách tô?`, answer: ans, solution: `Sọc thứ nhất: ${n} cách; sọc thứ hai: ${n - 1} cách${m === 3 ? `; sọc thứ ba: ${n - 2} cách` : ''}. Số cách: ${range(0, m - 1).map(i => n - i).join(' × ')} = <b>${ans}</b>.` });
  }

  function cbNumbers(R, lv) {
    if (lv === 1) {
      const k = R.pick(['three', 'four', 'rep', 'all']);
      if (k === 'all') { const t = R.pick([['ba chữ số', 900, 'Từ 100 đến 999 có 999 − 100 + 1 = '], ['hai chữ số', 90, 'Từ 10 đến 99 có 99 − 10 + 1 = '], ['bốn chữ số', 9000, 'Từ 1.000 đến 9.999 có 9.999 − 1.000 + 1 = ']]); return mk({ text: `Có bao nhiêu số có ${t[0]}?`, answer: t[1], solution: `${t[2]}<b>${fmt(t[1])}</b> số.` }); }
      const n = k === 'four' ? 4 : 3, ds = R.sample(range(1, 9), n).sort();
      if (k === 'rep') return mk({ text: `Từ ba chữ số ${ds.join(', ')}, lập được bao nhiêu số có ba chữ số (các chữ số có thể lặp lại)?`, answer: 27, solution: `Hàng trăm: 3 cách, hàng chục: 3 cách, hàng đơn vị: 3 cách. Số các số: 3 × 3 × 3 = <b>27</b>.` });
      const ans = n === 3 ? 6 : 24;
      return mk({ text: `Từ ${n} chữ số ${ds.join(', ')}, lập được bao nhiêu số có ${n} chữ số khác nhau?`, answer: ans, solution: `Hàng cao nhất: ${n} cách; hàng tiếp theo: ${n - 1} cách; ... Số các số: ${range(1, n).reverse().join(' × ')} = <b>${ans}</b>.` });
    }
    // Đếm bằng cách liệt kê theo chữ số hàng đơn vị
    const L = lv === 2 ? 3 : R.int(3, 4);
    const useSet = lv === 2 ? R.chance(0.6) : R.chance(0.7);
    const ds = useSet ? [0, ...R.sample(range(1, 9), lv === 2 ? 3 : R.int(3, 4))].sort() : range(0, 9);
    const conds = [['chẵn', x => x % 2 === 0], ['lẻ', x => x % 2 === 1], ['chia hết cho 5', x => x % 5 === 0]];
    if (!useSet) conds.push(['có tổng các chữ số bằng ' + R.int(5, 15), null]);
    let [cn, cf] = R.pick(conds);
    if (!cf) { const s = +cn.match(/(\d+)$/)[1]; cf = x => digitSum(x) === s; }
    const diff = useSet ? R.chance(0.7) : cn.startsWith('có tổng') ? R.chance(0.3) : true;
    const okDig = x => String(x).split('').every(c => ds.includes(+c));
    const p = x => okDig(x) && cf(x) && (!diff || distinct(x));
    const lo2 = 10 ** (L - 1), hi = 10 ** L - 1;
    const ans = countIn(lo2, hi, p);
    if (ans === 0) return cbNumbers(R, lv);
    const byU = range(0, 9).map(u => [u, countIn(lo2, hi, x => p(x) && x % 10 === u)]).filter(x => x[1]);
    const Lw = L === 3 ? 'ba' : 'bốn';
    return mk({ text: useSet
      ? `Từ các chữ số ${ds.join(', ')} lập được bao nhiêu số ${cn.startsWith('có') ? '' : cn + ' '}có ${Lw} chữ số${diff ? ' khác nhau' : ''}${cn.startsWith('có') ? ' ' + cn : ''}?`
      : `Có bao nhiêu số có ${Lw} chữ số${diff ? ' khác nhau' : ''} ${cn.startsWith('có') ? 'mà ' + cn.slice(3) : 'và là số ' + cn}?`,
      answer: ans,
      solution: `${cn.startsWith('có') ? 'Đếm theo chữ số hàng đơn vị' : 'Xét chữ số hàng đơn vị trước (vì điều kiện nằm ở chữ số tận cùng), nhớ chữ số hàng cao nhất phải khác 0'}${diff ? ' và các chữ số khác nhau' : ''}: ${byU.map(([u, c]) => `tận cùng ${u}: ${c} số`).join('; ')}. Tổng: ${byU.map(x => x[1]).join(' + ')} = <b>${ans}</b>.` });
  }

  function cbHandshake(R, lv) {
    const ctx = R.pick([['đội bóng thi đấu vòng tròn một lượt (mỗi hai đội gặp nhau một trận)', 'trận đấu', 'đội'], ['bạn chơi cờ, mỗi hai bạn đấu với nhau một ván', 'ván cờ', 'bạn'], ['người dự họp, mỗi hai người bắt tay nhau một lần', 'cái bắt tay', 'người']]);
    if (lv === 1) { const n = R.int(5, 9); return mk({ text: `Có ${n} ${ctx[0]}. Hỏi có tất cả bao nhiêu ${ctx[1]}?`, answer: C2(n), solution: `Mỗi ${ctx[2]} gặp ${n - 1} ${ctx[2]} khác: ${n} × ${n - 1} = ${n * (n - 1)}, nhưng mỗi ${ctx[1]} được tính 2 lần. Số ${ctx[1]}: ${n * (n - 1)} : 2 = <b>${C2(n)}</b>.` }); }
    if (lv === 2) {
      const k = R.pick(['big', 'rev', 'two']), n = R.int(6, 16);
      if (k === 'big') return mk({ text: `Có ${n} ${ctx[0]}. Hỏi có tất cả bao nhiêu ${ctx[1]}?`, answer: C2(n), solution: `${n} × ${n - 1} : 2 = <b>${C2(n)}</b> ${ctx[1]}.` });
      if (k === 'rev') return mk({ text: `Trong một giải bóng đá, các đội thi đấu vòng tròn một lượt (mỗi hai đội gặp nhau đúng một trận). Có tất cả ${C2(n)} trận đấu. Hỏi có bao nhiêu đội tham gia?`, answer: n, solution: `Nếu có n đội thì số trận là n × (n − 1) : 2 = ${C2(n)}, tức n × (n − 1) = ${n * (n - 1)} = ${n} × ${n - 1}. Vậy có <b>${n}</b> đội.` });
      return mk({ text: `Có ${n} đội bóng thi đấu vòng tròn hai lượt (lượt đi và lượt về, mỗi lượt hai đội gặp nhau một trận). Hỏi có tất cả bao nhiêu trận đấu?`, answer: n * (n - 1), solution: `Mỗi lượt có ${n} × ${n - 1} : 2 = ${C2(n)} trận. Hai lượt: ${C2(n)} × 2 = <b>${n * (n - 1)}</b> trận.` });
    }
    const k = R.pick(['groups', 'couples', 'diag', 'lines']);
    if (k === 'groups') { const a = R.int(4, 6), b = R.int(4, 6), ans = C2(a) + C2(b) + 1; return mk({ text: `Một giải đấu chia thành hai bảng: bảng A có ${a} đội, bảng B có ${b} đội. Các đội trong mỗi bảng thi đấu vòng tròn một lượt. Sau đó đội nhất bảng A gặp đội nhất bảng B trong trận chung kết. Hỏi cả giải có bao nhiêu trận đấu?`, answer: ans, solution: `Bảng A: ${a} × ${a - 1} : 2 = ${C2(a)} trận. Bảng B: ${b} × ${b - 1} : 2 = ${C2(b)} trận. Chung kết: 1 trận. Tổng: ${C2(a)} + ${C2(b)} + 1 = <b>${ans}</b> trận.` }); }
    if (k === 'couples') { const n = R.int(3, 6), ans = C2(2 * n) - n; return mk({ text: `Có ${n} cặp vợ chồng đến dự tiệc. Mỗi người bắt tay tất cả mọi người, trừ vợ hoặc chồng của mình. Hỏi có tất cả bao nhiêu cái bắt tay?`, answer: ans, solution: `Có ${2 * n} người. Nếu ai cũng bắt tay nhau: ${2 * n} × ${2 * n - 1} : 2 = ${C2(2 * n)}. Bớt ${n} cặp vợ chồng không bắt tay: ${C2(2 * n)} − ${n} = <b>${ans}</b>.` }); }
    if (k === 'diag') { const n = R.int(5, 12), ans = C2(n) - n; return mk({ text: `Một hình ${n} cạnh (đa giác lồi có ${n} đỉnh) có bao nhiêu đường chéo?`, answer: ans, solution: `Nối hai đỉnh bất kì được ${n} × ${n - 1} : 2 = ${C2(n)} đoạn thẳng, trong đó ${n} đoạn là cạnh. Số đường chéo: ${C2(n)} − ${n} = <b>${ans}</b>.` }); }
    const n = R.int(6, 15);
    return mk({ text: `Cho ${n} điểm, trong đó không có 3 điểm nào thẳng hàng. Nối mỗi hai điểm bằng một đoạn thẳng. Hỏi có bao nhiêu đoạn thẳng?`, answer: C2(n), solution: `Mỗi điểm nối với ${n - 1} điểm còn lại, mỗi đoạn được tính 2 lần: ${n} × ${n - 1} : 2 = <b>${C2(n)}</b> đoạn thẳng.` });
  }

  function cbPath(R, lv) {
    const [r, c] = lv === 1 ? R.pick([[1, 2], [1, 3], [2, 2], [1, 4]]) : lv === 2 ? R.pick([[2, 3], [2, 4], [3, 3], [3, 2]]) : R.pick([[3, 4], [4, 4], [3, 5], [4, 3], [2, 6]]);
    const g = range(0, r).map(() => range(0, c).map(() => 1));
    for (let i = 1; i <= r; i++) for (let j = 1; j <= c; j++) g[i][j] = g[i - 1][j] + g[i][j - 1];
    const ans = g[r][c];
    return mk({ text: 'Một con kiến đi từ A đến B theo các cạnh của ô vuông, mỗi bước chỉ đi sang phải hoặc đi lên. Hỏi có bao nhiêu đường đi khác nhau?', visual: svgLattice(r, c), answer: ans,
      solution: `Ghi vào mỗi điểm số cách đi đến điểm đó: các điểm ở hàng dưới cùng và cột bên trái đều là 1; mỗi điểm khác bằng tổng số ở điểm bên trái và điểm bên dưới. Từ dưới lên: ${g.map(row => row.join(' – ')).join(' | ')}. Tại B: <b>${ans}</b> đường đi.` });
  }

  function cbArrange(R, lv) {
    const ps = R.sample(NAMES, 5);
    if (lv === 1) {
      const t = R.pick(['xếp thành một hàng dọc', 'ngồi vào một dãy 3 ghế', 'đứng thành một hàng để chụp ảnh']);
      const p3 = perms(ps.slice(0, 3)).map(p => p.join(' – '));
      return mk({ text: `Ba bạn ${ps.slice(0, 3).join(', ')} ${t}. Hỏi có bao nhiêu cách sắp xếp?`, answer: 6, solution: `Vị trí đầu: 3 cách, vị trí thứ hai: 2 cách, vị trí cuối: 1 cách. 3 × 2 × 1 = <b>6</b> cách: ${p3.join('; ')}.` });
    }
    if (lv === 2) {
      const k = R.pick(['four', 'first', 'three']);
      if (k === 'four') return mk({ text: `Bốn bạn ${ps.slice(0, 4).join(', ')} xếp thành một hàng ngang. Hỏi có bao nhiêu cách xếp?`, answer: 24, solution: `Vị trí 1: 4 cách; vị trí 2: 3 cách; vị trí 3: 2 cách; vị trí 4: 1 cách. 4 × 3 × 2 × 1 = <b>24</b> cách.` });
      if (k === 'first') return mk({ text: `Bốn bạn ${ps.slice(0, 4).join(', ')} xếp thành một hàng dọc, trong đó ${ps[0]} luôn đứng đầu hàng. Hỏi có bao nhiêu cách xếp?`, answer: 6, solution: `${ps[0]} đứng đầu, ba bạn còn lại xếp vào 3 chỗ: 3 × 2 × 1 = <b>6</b> cách.` });
      return mk({ text: `Có 4 bạn ${ps.slice(0, 4).join(', ')}. Cần chọn 3 bạn đứng vào 3 bậc nhất, nhì, ba của bục nhận giải. Hỏi có bao nhiêu cách?`, answer: 24, solution: `Bậc nhất: 4 cách; bậc nhì: 3 cách; bậc ba: 2 cách. 4 × 3 × 2 = <b>24</b> cách.` });
    }
    const k = R.pick(['five', 'adj', 'notfirst', 'end']);
    if (k === 'five') return mk({ text: `Năm bạn ${ps.join(', ')} xếp thành một hàng. Hỏi có bao nhiêu cách xếp?`, answer: 120, solution: `5 × 4 × 3 × 2 × 1 = <b>120</b> cách.` });
    if (k === 'adj') { const n = R.int(4, 5), ans = n === 4 ? 12 : 48; return mk({ text: `${n === 4 ? 'Bốn' : 'Năm'} bạn ${ps.slice(0, n).join(', ')} xếp thành một hàng, trong đó ${ps[0]} và ${ps[1]} luôn đứng cạnh nhau. Hỏi có bao nhiêu cách xếp?`, answer: ans, solution: `Coi ${ps[0]} và ${ps[1]} là một "nhóm". Xếp nhóm này cùng ${n - 2} bạn còn lại: ${range(1, n - 1).reverse().join(' × ')} = ${ans / 2} cách. Trong nhóm, hai bạn đổi chỗ được 2 cách. Tổng: ${ans / 2} × 2 = <b>${ans}</b> cách.` }); }
    if (k === 'notfirst') { const n = R.int(4, 5), all = n === 4 ? 24 : 120, f = all / n; return mk({ text: `${n === 4 ? 'Bốn' : 'Năm'} bạn ${ps.slice(0, n).join(', ')} xếp thành một hàng dọc, trong đó ${ps[0]} không đứng đầu hàng. Hỏi có bao nhiêu cách xếp?`, answer: all - f, solution: `Tất cả: ${range(1, n).reverse().join(' × ')} = ${all} cách. Số cách ${ps[0]} đứng đầu: ${range(1, n - 1).reverse().join(' × ')} = ${f}. Còn lại: ${all} − ${f} = <b>${all - f}</b> cách.` }); }
    const n = R.int(4, 5), rest = n === 4 ? 6 : 24;
    return mk({ text: `${n === 4 ? 'Bốn' : 'Năm'} bạn ${ps.slice(0, n).join(', ')} xếp thành một hàng ngang, trong đó ${ps[0]} phải đứng ở một trong hai đầu hàng. Hỏi có bao nhiêu cách xếp?`, answer: 2 * rest, solution: `${ps[0]} có 2 cách chọn chỗ (đầu trái hoặc đầu phải). ${n - 1} bạn còn lại xếp vào ${n - 1} chỗ: ${range(1, n - 1).reverse().join(' × ')} = ${rest} cách. Tổng: 2 × ${rest} = <b>${2 * rest}</b> cách.` });
  }

  function cbChoose2(R, lv) {
    if (lv === 1) { const n = R.int(4, 7); return mk({ text: `Tổ có ${n} bạn. Cô giáo cần chọn 2 bạn đi trực nhật. Hỏi có bao nhiêu cách chọn?`, answer: C2(n), solution: `Bạn thứ nhất ghép với ${n - 1} bạn còn lại, bạn thứ hai ghép thêm ${n - 2} bạn, ... Tổng: ${range(1, n - 1).reverse().join(' + ')} = <b>${C2(n)}</b> cách.` }); }
    if (lv === 2) {
      const k = R.pick(['ordered', 'mf', 'big']);
      if (k === 'ordered') { const n = R.int(5, 12); return mk({ text: `Lớp có ${n} bạn ứng cử. Cần chọn 1 bạn làm lớp trưởng và 1 bạn khác làm lớp phó. Hỏi có bao nhiêu cách chọn?`, answer: n * (n - 1), solution: `Lớp trưởng: ${n} cách; lớp phó: ${n - 1} cách (khác lớp trưởng). Số cách: ${n} × ${n - 1} = <b>${n * (n - 1)}</b>.` }); }
      if (k === 'mf') { const a = R.int(3, 12), b = R.int(3, 12); return mk({ text: `Đội văn nghệ có ${a} bạn nam và ${b} bạn nữ. Cần chọn 1 bạn nam và 1 bạn nữ để song ca. Hỏi có bao nhiêu cách chọn?`, answer: a * b, solution: `Chọn nam: ${a} cách; chọn nữ: ${b} cách. Số cách: ${a} × ${b} = <b>${a * b}</b>.` }); }
      const n = R.int(8, 15); return mk({ text: `Có ${n} bạn, cần chọn 2 bạn đi thi. Hỏi có bao nhiêu cách chọn?`, answer: C2(n), solution: `Chọn có thứ tự: ${n} × ${n - 1} = ${n * (n - 1)} cách, nhưng mỗi cặp bị tính 2 lần. Số cách: ${n * (n - 1)} : 2 = <b>${C2(n)}</b>.` });
    }
    const k = R.pick(['three', 'same', 'atleast']);
    if (k === 'three') { const n = R.int(4, 7), ans = n * (n - 1) * (n - 2) / 6; return mk({ text: `Có ${n} bạn, cần chọn 3 bạn đi dự trại hè. Hỏi có bao nhiêu cách chọn?`, answer: ans, solution: `Chọn có thứ tự: ${n} × ${n - 1} × ${n - 2} = ${n * (n - 1) * (n - 2)} cách. Mỗi nhóm 3 bạn được tính 3 × 2 × 1 = 6 lần. Số cách: ${n * (n - 1) * (n - 2)} : 6 = <b>${ans}</b>.` }); }
    const a = R.int(3, 8), b = R.int(3, 8);
    if (k === 'same') return mk({ text: `Nhóm có ${a} bạn nam và ${b} bạn nữ. Cần chọn 2 bạn cùng là nam hoặc cùng là nữ. Hỏi có bao nhiêu cách chọn?`, answer: C2(a) + C2(b), solution: `Hai bạn nam: ${a} × ${a - 1} : 2 = ${C2(a)} cách. Hai bạn nữ: ${b} × ${b - 1} : 2 = ${C2(b)} cách. Tổng: ${C2(a)} + ${C2(b)} = <b>${C2(a) + C2(b)}</b>.` });
    return mk({ text: `Nhóm có ${a} bạn nam và ${b} bạn nữ. Cần chọn 2 bạn, trong đó có ít nhất 1 bạn nữ. Hỏi có bao nhiêu cách chọn?`, answer: C2(a + b) - C2(a), solution: `Chọn 2 bạn bất kì: ${a + b} × ${a + b - 1} : 2 = ${C2(a + b)} cách. Bớt các cách chọn 2 bạn đều là nam: ${C2(a)}. Kết quả: ${C2(a + b)} − ${C2(a)} = <b>${C2(a + b) - C2(a)}</b>.` });
  }

  function cbPigeon(R, lv) {
    const r = R.int(3, 9), g = R.int(3, 9), y = R.int(3, 9);
    if (lv === 1) {
      if (R.chance(0.5)) return mk({ text: `Hộp có ${r} bi đỏ, ${g} bi xanh và ${y} bi vàng. Không nhìn, phải lấy ít nhất bao nhiêu viên để chắc chắn có 2 viên cùng màu?`, answer: 4, solution: `Xui nhất là 3 viên đầu có 3 màu khác nhau. Viên thứ 4 chắc chắn trùng màu với một viên đã lấy: <b>4</b> viên.` });
      return mk({ text: `Hộp có ${r} bi đỏ, ${g} bi xanh và ${y} bi vàng. Không nhìn, phải lấy ít nhất bao nhiêu viên để chắc chắn có 1 viên bi đỏ?`, answer: g + y + 1, solution: `Xui nhất là lấy hết ${g} bi xanh và ${y} bi vàng trước. Thêm 1 viên nữa là bi đỏ: ${g} + ${y} + 1 = <b>${g + y + 1}</b> viên.` });
    }
    if (lv === 2) {
      const k = R.pick(['month', 'k', 'week']);
      if (k === 'month') { const n = R.int(25, 45), ans = Math.ceil(n / 12); return mk({ text: `Lớp 4A có ${n} học sinh. Chắc chắn có ít nhất bao nhiêu bạn sinh cùng một tháng?`, answer: ans, solution: `Có 12 tháng. ${n} = 12 × ${Math.floor(n / 12)} + ${n % 12}. Nếu mỗi tháng có không quá ${ans - 1} bạn thì chỉ có nhiều nhất ${12 * (ans - 1)} bạn, ít hơn ${n}. Vậy chắc chắn có ít nhất <b>${ans}</b> bạn sinh cùng tháng.` }); }
      if (k === 'week') { const m = R.int(2, 4), ans = 7 * (m - 1) + 1; return mk({ text: `Cần ít nhất bao nhiêu bạn để chắc chắn có ${m} bạn sinh vào cùng một thứ trong tuần (cùng thứ Hai, hoặc cùng thứ Ba, ...)?`, answer: ans, solution: `Một tuần có 7 thứ. Xui nhất là mỗi thứ có ${m - 1} bạn: 7 × ${m - 1} = ${7 * (m - 1)} bạn. Thêm 1 bạn nữa: <b>${ans}</b> bạn.` }); }
      const kk = R.int(2, 4), mm = Math.max(kk, 3), R2 = r + mm, G2 = g + mm, Y2 = y + mm, ans = 3 * (kk - 1) + 1;
      return mk({ text: `Hộp có ${R2} bi đỏ, ${G2} bi xanh và ${Y2} bi vàng. Không nhìn, phải lấy ít nhất bao nhiêu viên để chắc chắn có ${kk} viên cùng màu?`, answer: ans, solution: `Xui nhất là mỗi màu lấy được ${kk - 1} viên: 3 × ${kk - 1} = ${3 * (kk - 1)} viên. Lấy thêm 1 viên nữa chắc chắn có ${kk} viên cùng màu: <b>${ans}</b> viên.` });
    }
    const k = R.pick(['kfew', 'all3', 'diff', 'two']);
    const cs = [['đỏ', R.int(1, 3)], ['xanh', R.int(4, 9)], ['vàng', R.int(5, 10)]];
    if (k === 'kfew') {
      const kk = 4, worst = sum(cs.map(c => Math.min(c[1], kk - 1)));
      return mk({ text: `Hộp có ${cs.map(c => `${c[1]} bi ${c[0]}`).join(', ')}. Không nhìn, phải lấy ít nhất bao nhiêu viên để chắc chắn có ${kk} viên cùng màu?`, answer: worst + 1, solution: `Xui nhất: lấy hết ${cs[0][1]} bi đỏ (không đủ ${kk} viên), mỗi màu xanh, vàng lấy ${kk - 1} viên. Tổng: ${cs.map(c => Math.min(c[1], kk - 1)).join(' + ')} = ${worst}. Thêm 1 viên nữa: <b>${worst + 1}</b> viên.` });
    }
    const ns = [r, g, y].sort((a, b) => a - b);
    if (k === 'all3') return mk({ text: `Hộp có ${r} bi đỏ, ${g} bi xanh và ${y} bi vàng. Không nhìn, phải lấy ít nhất bao nhiêu viên để chắc chắn có đủ cả ba màu?`, answer: ns[1] + ns[2] + 1, solution: `Xui nhất là lấy hết hai màu nhiều nhất trước: ${ns[2]} + ${ns[1]} = ${ns[1] + ns[2]} viên. Thêm 1 viên nữa chắc chắn có màu thứ ba: <b>${ns[1] + ns[2] + 1}</b> viên.` });
    if (k === 'diff') return mk({ text: `Hộp có ${r} bi đỏ, ${g} bi xanh và ${y} bi vàng. Không nhìn, phải lấy ít nhất bao nhiêu viên để chắc chắn có 2 viên khác màu?`, answer: ns[2] + 1, solution: `Xui nhất là lấy toàn bi của màu nhiều nhất (${ns[2]} viên). Thêm 1 viên nữa chắc chắn khác màu: <b>${ns[2] + 1}</b> viên.` });
    return mk({ text: `Hộp có ${r} bi đỏ, ${g} bi xanh và ${y} bi vàng. Không nhìn, phải lấy ít nhất bao nhiêu viên để chắc chắn có 2 viên bi đỏ?`, answer: g + y + 2, solution: `Xui nhất là lấy hết ${g} bi xanh và ${y} bi vàng trước, rồi mới lấy được bi đỏ. Cần thêm 2 viên đỏ: ${g} + ${y} + 2 = <b>${g + y + 2}</b> viên.` });
  }

  function cbPages(R, lv) {
    if (lv === 1) { const n = R.int(20, 99), d = 9 + 2 * (n - 9); return mk({ text: `Một quyển sách có ${n} trang. Để đánh số trang quyển sách (bắt đầu từ trang 1) cần dùng bao nhiêu chữ số?`, answer: d, solution: `Trang 1 – 9: 9 chữ số. Trang 10 – ${n}: ${n - 9} trang × 2 = ${2 * (n - 9)} chữ số. Tổng: 9 + ${2 * (n - 9)} = <b>${d}</b>.` }); }
    if (lv === 2) {
      if (R.chance(0.6)) { const n = R.int(100, 450), d = 189 + 3 * (n - 99); return mk({ text: `Một quyển sách có ${n} trang. Để đánh số trang quyển sách (bắt đầu từ trang 1) cần dùng bao nhiêu chữ số?`, answer: d, solution: `Trang 1 – 9: 9 chữ số. Trang 10 – 99: 90 × 2 = 180 chữ số. Trang 100 – ${n}: ${n - 99} × 3 = ${3 * (n - 99)} chữ số. Tổng: 9 + 180 + ${3 * (n - 99)} = <b>${d}</b>.` }); }
      const a = R.int(10, 80), b = R.int(120, 300), d = 2 * (100 - a) + 3 * (b - 99);
      return mk({ text: `${R.pick(NAMES)} đọc sách từ trang ${a} đến trang ${b}. Hỏi các số trang bạn ấy đã đọc gồm bao nhiêu chữ số?`, answer: d, solution: `Trang ${a} – 99: ${100 - a} trang × 2 = ${2 * (100 - a)} chữ số. Trang 100 – ${b}: ${b - 99} trang × 3 = ${3 * (b - 99)} chữ số. Tổng: <b>${d}</b>.` });
    }
    const k = R.pick(['rev', 'rev2', 'digit']);
    if (k === 'rev') { const n = R.int(100, 999), D = 189 + 3 * (n - 99); return mk({ text: `Để đánh số trang một quyển sách (bắt đầu từ trang 1) người ta dùng hết ${fmt(D)} chữ số. Hỏi quyển sách có bao nhiêu trang?`, answer: n, solution: `Trang 1 – 99 dùng 9 + 180 = 189 chữ số. Còn ${fmt(D)} − 189 = ${D - 189} chữ số cho các trang có 3 chữ số: ${D - 189} : 3 = ${n - 99} trang. Số trang: 99 + ${n - 99} = <b>${n}</b>.` }); }
    if (k === 'rev2') { const n = R.int(20, 99), D = 9 + 2 * (n - 9); return mk({ text: `Để đánh số trang một quyển truyện (bắt đầu từ trang 1) người ta dùng hết ${D} chữ số. Hỏi quyển truyện có bao nhiêu trang?`, answer: n, solution: `Trang 1 – 9 dùng 9 chữ số. Còn ${D} − 9 = ${D - 9} chữ số cho các trang có 2 chữ số: ${D - 9} : 2 = ${n - 9} trang. Số trang: 9 + ${n - 9} = <b>${n}</b>.` }); }
    const dg = R.int(1, 9), n = R.int(100, 300);
    let cu = 0, ct = 0, chh = 0; for (let x = 1; x <= n; x++) { if (x % 10 === dg) cu++; if (x >= 10 && Math.floor(x / 10) % 10 === dg) ct++; if (Math.floor(x / 100) === dg) chh++; }
    return mk({ text: `Đánh số trang một quyển sách dày ${n} trang (bắt đầu từ trang 1). Hỏi chữ số ${dg} được dùng bao nhiêu lần?`, answer: cu + ct + chh, solution: `Đếm từng hàng. Hàng đơn vị: ${cu} lần. Hàng chục: ${ct} lần. Hàng trăm: ${chh} lần. Tổng: <b>${cu + ct + chh}</b> lần.` });
  }

  function cbSquares(R, lv) {
    const [r, c] = lv === 2 ? R.pick([[2, 3], [3, 3], [2, 4]]) : R.pick([[3, 4], [4, 4], [3, 5], [4, 5]]);
    const parts = [];
    for (let k = 1; k <= Math.min(r, c); k++) parts.push([k, (r - k + 1) * (c - k + 1)]);
    const sq = sum(parts.map(p => p[1])), rect = C2(r + 1) * C2(c + 1);
    if (lv === 3 && R.chance(0.5)) return mk({ text: 'Hình bên có bao nhiêu hình chữ nhật KHÔNG phải là hình vuông?', visual: svgGrid(r, c), answer: rect - sq, solution: `Tất cả hình chữ nhật: ${C2(c + 1)} × ${C2(r + 1)} = ${rect} (chọn 2 đường dọc và 2 đường ngang). Số hình vuông: ${parts.map(p => p[1]).join(' + ')} = ${sq}. Không phải hình vuông: ${rect} − ${sq} = <b>${rect - sq}</b>.` });
    return mk({ text: 'Hình bên có tất cả bao nhiêu hình vuông?', visual: svgGrid(r, c), answer: sq, solution: parts.map(([k, v]) => `Hình vuông ${k}×${k}: ${v}`).join('; ') + `. Tổng: <b>${sq}</b> hình vuông.` });
  }

  // =====================================================================
  // ĐĂNG KÝ LỚP 4
  // =====================================================================
  const G = (id, fn, lv) => ({ id, fn, lv });
  const L_ = T.L_;
  T.addGrade(4, {
    topics: {
      logic: {
        desc: 'Dãy số quy luật, số trong bảng, tuổi, giả thiết tạm, trồng cây, suy luận, lịch, chuyển động',
        points: [
          'Dãy cách đều: số hạng thứ n = số đầu + (n − 1) × khoảng cách. Số số hạng = (số cuối − số đầu) : khoảng cách + 1.',
          'Dãy đặc biệt: Fibonacci (mỗi số bằng tổng hai số liền trước), bình phương 1, 4, 9, 16, ..., khoảng cách tăng dần.',
          'Bài toán tuổi: hiệu số tuổi không đổi theo thời gian; mỗi năm tổng tuổi của n người tăng n tuổi. Dùng tổng – hiệu, tổng – tỉ, hiệu – tỉ.',
          'Giả thiết tạm (gà – chó): giả sử tất cả là gà, tính số chân hụt, chia cho số chân chênh lệch của mỗi con.',
          'Trồng cây: trồng hai đầu số cây = số khoảng + 1; không trồng hai đầu số cây = số khoảng − 1; đường khép kín số cây = số khoảng.',
          'Lịch: cứ 7 ngày lặp lại thứ cũ. Năm thường 365 ngày = 52 tuần + 1 ngày.',
          'Chuyển động: quãng đường = vận tốc × thời gian. Ngược chiều thì cộng vận tốc, cùng chiều (đuổi nhau) thì trừ vận tốc.',
        ],
        tips: [
          'Bài nói dối – nói thật: thử lần lượt từng trường hợp rồi đếm số câu đúng.',
          'Bài xếp đồ vật cho từng người: kẻ bảng, đánh dấu ✗ vào ô loại trừ.',
          'Bài tuổi nên vẽ sơ đồ đoạn thẳng: phần hiệu luôn giữ nguyên.',
        ],
        examples: [
          { q: 'Dãy 2, 5, 8, 11, ... Số hạng thứ 50 là bao nhiêu?', a: 'Khoảng cách 3. Số hạng thứ 50 = 2 + 49 × 3 = <b>149</b>.' },
          { q: 'Vừa gà vừa chó có 36 con, có 100 chân. Có bao nhiêu con chó?', a: 'Giả sử toàn gà: 36 × 2 = 72 chân, hụt 100 − 72 = 28 chân. Mỗi chó hơn gà 2 chân. Số chó: 28 : 2 = <b>14</b> con.' },
          { q: 'Mẹ hơn con 24 tuổi, tuổi mẹ gấp 4 lần tuổi con. Con bao nhiêu tuổi?', a: 'Hiệu số phần: 4 − 1 = 3. Tuổi con: 24 : 3 = <b>8</b> tuổi.' },
          { q: 'Hôm nay thứ Hai. 30 ngày nữa là thứ mấy?', a: '30 = 7 × 4 + 2. Từ thứ Hai đếm thêm 2 ngày: <b>thứ Tư</b>.' },
        ],
      },
      arith: {
        desc: 'Số tự nhiên lớn, tính nhanh, trung bình cộng, tổng – hiệu, tổng – tỉ, hiệu – tỉ, phân số',
        points: [
          'Tính chất giao hoán, kết hợp; nhân một số với một tổng (hiệu): a × b + a × c = a × (b + c); a × b − a × c = a × (b − c).',
          'Tính nhanh: ghép thành 10, 100, 1000; 25 × 4 = 100, 125 × 8 = 1000; a × 99 + a = a × 100; nhân nhẩm với 11.',
          'Trung bình cộng = tổng các số : số các số. Tổng = trung bình cộng × số các số.',
          'Tổng – hiệu: số lớn = (tổng + hiệu) : 2; số bé = (tổng − hiệu) : 2.',
          'Tổng – tỉ, hiệu – tỉ: vẽ sơ đồ, tìm giá trị một phần = tổng (hiệu) : tổng (hiệu) số phần.',
          'Phân số: rút gọn, quy đồng mẫu số rồi mới cộng, trừ, so sánh; nhân tử với tử, mẫu với mẫu; chia là nhân với phân số đảo ngược.',
          'Tìm m/n của một số: lấy số đó chia cho n rồi nhân với m.',
        ],
        tips: [
          'Trước khi tính, nhìn xem có thừa số chung hay cặp số tròn trăm không.',
          'Bài có lời văn: tóm tắt đề bằng sơ đồ đoạn thẳng, ghi rõ đơn vị.',
          'Kết quả phân số luôn rút gọn đến tối giản.',
        ],
        examples: [
          { q: '37 × 99 + 37 = ?', a: '37 × 99 + 37 × 1 = 37 × (99 + 1) = 37 × 100 = <b>3.700</b>.' },
          { q: 'Tổng hai số là 120, số lớn gấp 3 lần số bé. Tìm số bé.', a: 'Tổng số phần: 3 + 1 = 4. Số bé: 120 : 4 = <b>30</b>.' },
          { q: 'Trung bình cộng của 3 số là 25, hai số đầu là 20 và 31. Tìm số thứ ba.', a: 'Tổng ba số: 25 × 3 = 75. Số thứ ba: 75 − 20 − 31 = <b>24</b>.' },
          { q: '1/2 + 1/3 = ?', a: 'Quy đồng: 3/6 + 2/6 = <b>5/6</b>.' },
        ],
      },
      number: {
        desc: 'Số đến lớp triệu, làm tròn, dấu hiệu chia hết cho 2, 3, 5, 9, số dư, chẵn lẻ, tận cùng, chữ số, thế kỉ',
        points: [
          'Lớp triệu gồm hàng triệu, chục triệu, trăm triệu. Giá trị của chữ số phụ thuộc vào hàng của nó.',
          'Làm tròn: nhìn chữ số ngay bên phải hàng cần làm tròn; nếu ≥ 5 thì làm tròn lên, nếu < 5 thì làm tròn xuống.',
          'Chia hết cho 2: tận cùng 0, 2, 4, 6, 8. Chia hết cho 5: tận cùng 0 hoặc 5. Chia hết cho cả 2 và 5: tận cùng 0.',
          'Chia hết cho 3 (cho 9): tổng các chữ số chia hết cho 3 (cho 9). Số dư khi chia cho 9 bằng số dư của tổng các chữ số.',
          'Chẵn lẻ: tổng có số lượng số lẻ là lẻ thì tổng lẻ; tích có một thừa số chẵn thì tích chẵn.',
          'Chữ số tận cùng của tích chỉ phụ thuộc chữ số tận cùng của các thừa số; tích của 2, 3, 7, 8 lặp lại theo chu kì 4.',
          'Thế kỉ thứ n gồm các năm từ (n − 1) × 100 + 1 đến n × 100. Năm 2000 thuộc thế kỉ XX, năm 2001 thuộc thế kỉ XXI.',
        ],
        tips: [
          'Đếm số chia hết cho k từ a đến b: (số cuối − số đầu) : k + 1.',
          'Muốn tìm số lớn nhất (bé nhất), chọn chữ số hàng cao nhất trước, càng lớn (càng bé) càng tốt.',
        ],
        examples: [
          { q: 'Tìm chữ số a để 4a5 chia hết cho 9.', a: '4 + a + 5 = 9 + a chia hết cho 9 nên <b>a = 0 hoặc a = 9</b> (được 405 hoặc 495).' },
          { q: 'Từ 1 đến 100 có bao nhiêu số chia hết cho 3?', a: 'Đó là 3, 6, ..., 99: (99 − 3) : 3 + 1 = <b>33</b> số.' },
          { q: 'Tích 1 × 2 × 3 × ... × 20 có tận cùng bao nhiêu chữ số 0?', a: 'Các thừa số 5, 10, 15, 20 cho 4 thừa số 5, ghép với 4 thừa số 2: <b>4</b> chữ số 0.' },
          { q: 'Năm 1945 thuộc thế kỉ thứ mấy?', a: 'Thế kỉ XX gồm các năm 1901 – 2000. Năm 1945 thuộc thế kỉ <b>XX</b>.' },
        ],
      },
      geo: {
        desc: 'Góc, vuông góc – song song, hình bình hành, hình thoi, chu vi – diện tích, hình ghép, đếm hình, đơn vị đo',
        points: [
          'Góc nhọn < góc vuông (90°) < góc tù < góc bẹt (180°). n tia chung gốc tạo ra n × (n − 1) : 2 góc.',
          'Hình chữ nhật: chu vi = (dài + rộng) × 2; diện tích = dài × rộng. Hình vuông: chu vi = cạnh × 4; diện tích = cạnh × cạnh.',
          'Hình bình hành có hai cặp cạnh đối diện song song và bằng nhau; diện tích = đáy × chiều cao.',
          'Hình thoi có 4 cạnh bằng nhau, hai đường chéo vuông góc; diện tích = đường chéo × đường chéo : 2.',
          'Hình ghép: cắt thành các hình chữ nhật để tính diện tích; hình có các góc vuông thì chu vi bằng chu vi hình chữ nhật bao ngoài.',
          'Đếm hình chữ nhật trong lưới: (số cách chọn 2 đường dọc) × (số cách chọn 2 đường ngang).',
          'Đơn vị: 1 tấn = 10 tạ = 100 yến = 1000 kg; 1 m² = 100 dm²; 1 dm² = 100 cm²; 1 phút = 60 giây; 1 thế kỉ = 100 năm.',
        ],
        tips: [
          'Vẽ hình, ghi kích thước lên hình trước khi tính.',
          'Khi một cạnh tăng thêm, phần diện tích tăng là một hình chữ nhật mới — hãy vẽ nó ra.',
          'Đổi về cùng một đơn vị rồi mới tính.',
        ],
        examples: [
          { q: 'Hình chữ nhật có chu vi 40 cm, chiều dài hơn chiều rộng 4 cm. Tính diện tích.', a: 'Nửa chu vi 20 cm. Rộng: (20 − 4) : 2 = 8 cm, dài 12 cm. Diện tích: 12 × 8 = <b>96 cm²</b>.' },
          { q: 'Hình thoi có hai đường chéo 8 cm và 6 cm. Tính diện tích.', a: '8 × 6 : 2 = <b>24 cm²</b>.' },
          { q: 'Lưới 2 × 3 ô vuông có bao nhiêu hình chữ nhật?', a: '4 đường dọc chọn 2: 6 cách; 3 đường ngang chọn 2: 3 cách. 6 × 3 = <b>18</b>.' },
          { q: '3 tạ 5 kg = ? kg', a: '3 tạ = 300 kg. 300 + 5 = <b>305</b> kg.' },
        ],
      },
      comb: {
        desc: 'Quy tắc nhân – cộng, lập số, bắt tay – thi đấu, đường đi trên lưới, xếp hàng, chọn nhóm, Dirichlet, đánh số trang',
        points: [
          'Quy tắc nhân: làm việc qua nhiều bước nối tiếp thì nhân số cách của từng bước. Quy tắc cộng: chọn "hoặc ... hoặc" thì cộng.',
          'Lập số có các chữ số khác nhau: chọn từng hàng, chữ số 0 không đứng đầu; có điều kiện ở hàng đơn vị thì xét hàng đơn vị trước.',
          'n đội thi đấu vòng tròn một lượt: n × (n − 1) : 2 trận. Hai lượt: n × (n − 1) trận.',
          'Xếp n người thành hàng: n × (n − 1) × ... × 1 cách (3 người: 6 cách, 4 người: 24 cách, 5 người: 120 cách).',
          'Chọn 2 trong n (không kể thứ tự): n × (n − 1) : 2. Chọn có thứ tự (trưởng, phó): n × (n − 1).',
          'Nguyên lý Dirichlet (trường hợp xấu nhất): n chuồng, nhốt n × k + 1 con thỏ thì có chuồng chứa ít nhất k + 1 con.',
          'Đánh số trang: trang 1 – 9 dùng 9 chữ số, trang 10 – 99 dùng 180 chữ số, mỗi trang có 3 chữ số dùng 3 chữ số.',
        ],
        tips: [
          'Đường đi trên lưới: ghi số cách đến mỗi điểm = tổng số ở điểm bên trái và bên dưới.',
          'Đếm phần bù: "ít nhất một" = tất cả − "không có cái nào".',
          'Với bài "chắc chắn", luôn tưởng tượng mình gặp may ít nhất.',
        ],
        examples: [
          { q: 'Từ 0, 1, 2, 3 lập được bao nhiêu số có ba chữ số khác nhau?', a: 'Hàng trăm: 3 cách (khác 0); hàng chục: 3 cách; hàng đơn vị: 2 cách. 3 × 3 × 2 = <b>18</b> số.' },
          { q: '8 đội đá vòng tròn một lượt. Có bao nhiêu trận?', a: '8 × 7 : 2 = <b>28</b> trận.' },
          { q: 'Lớp có 40 bạn. Chắc chắn có ít nhất bao nhiêu bạn sinh cùng tháng?', a: '40 = 12 × 3 + 4, nên có tháng có ít nhất 3 + 1 = <b>4</b> bạn.' },
          { q: 'Sách 120 trang cần bao nhiêu chữ số để đánh số trang?', a: '9 + 180 + 21 × 3 = <b>252</b> chữ số.' },
        ],
      },
    },
    gens: {
      logic: [G('seq0', lgSeq0, [0]), G('pattern0', lgPattern0, [0]), G('day0', lgDay0, [0]), G('compare0', lgCompare0, [0]),
        G('seq', lgSeq, [1, 2, 3]), G('table', lgTable, [1, 2, 3]), G('age', lgAge, [1, 2, 3]), G('chicken', lgChicken, [1, 2, 3]),
        G('trees', lgTrees, [1, 2, 3]), G('assign', lgAssign, [1, 2]), G('liar', lgLiar, [2, 3]), G('calendar', lgCalendar, [1, 2, 3]), G('motion', lgMotion, [1, 2, 3])],
      arith: [G('calc0', arCalc0, [0]), G('order0', arOrder0, [0]), G('word0', arWord0, [0]), G('frac0', arFrac0, [0]),
        G('big', arBig, [1, 2]), G('quick', arQuick, [1, 2, 3]), G('avg', arAvg, [1, 2, 3]), G('sumdiff', arSumDiff, [1, 2, 3]),
        G('ratio', arRatio, [1, 2, 3]), G('fraccalc', arFracCalc, [1, 2, 3]), G('fraccmp', arFracCmp, [1, 2]), G('fracof', arFracOf, [1, 2, 3]),
        G('word', arWord, [1, 2, 3]), G('series', arSeries, [2, 3])],
      number: [G('place0', ntPlace0, [0]), G('cmp0', ntCmp0, [0]), G('next0', ntNext0, [0]), G('roman0', ntRoman0, [0]),
        G('million', ntBigRead, [1, 2]), G('round', ntRound, [1, 2]), G('divis', ntDivis, [1, 2, 3]), G('countdiv', ntCountDiv, [1, 2, 3]),
        G('remainder', ntRemainder, [1, 2, 3]), G('parity', ntParity, [1, 2, 3]), G('lastdigit', ntLastDigit, [2, 3]), G('digits', ntDigitCount, [1, 2, 3]),
        G('extreme', ntExtreme, [1, 2, 3]), G('century', ntCentury, [1, 2])],
      geo: [G('perim0', geoPerim0, [0]), G('angle0', geoAngle0, [0]), G('shape0', geoShape0, [0]), G('unit0', geoUnit0, [0]),
        G('rect', geoRect, [1, 2, 3]), G('para', geoPara, [1, 2, 3]), G('units', geoUnits, [1, 2, 3]), G('angles', geoAngles, [1, 2, 3]),
        G('lines', geoLines, [1, 2]), G('compose', geoCompose, [2, 3]), G('countrect', geoCountRect, [1, 2, 3]), G('counttri', geoCountTri, [1, 2, 3]), G('grow', geoGrow, [2, 3])],
      comb: [G('outfit0', cbOutfit0, [0]), G('handshake0', cbHandshake0, [0]), G('list0', cbList0, [0]), G('pigeon0', cbPigeon0, [0]),
        G('rule', cbRule, [1, 2, 3]), G('numbers', cbNumbers, [1, 2, 3]), G('handshake', cbHandshake, [1, 2, 3]), G('path', cbPath, [1, 2, 3]),
        G('arrange', cbArrange, [1, 2, 3]), G('choose2', cbChoose2, [1, 2, 3]), G('pigeon', cbPigeon, [1, 2, 3]), G('pages', cbPages, [1, 2, 3]), G('squares', cbSquares, [2, 3])],
    },
    lessons: {
      logic: T.lessonPath(
        [L_('Dãy số và dãy hình', 'seq0', 'pattern0'), L_('Ngày trong tuần', 'day0', 'seq0'), L_('So sánh và sắp xếp', 'compare0', 'pattern0')],
        [L_('Dãy số cách đều, số trong bảng', 'seq', 'table'), L_('Bài toán tuổi, gà – chó', 'age', 'chicken'), L_('Trồng cây, suy luận', 'trees', 'assign'), L_('Lịch và chuyển động', 'calendar', 'motion')],
        [L_('Quy luật và suy luận nâng cao', 'seq', 'table', 'liar', 'calendar'), L_('Tuổi, giả thiết tạm, chuyển động nâng cao', 'age', 'chicken', 'trees', 'motion')]),
      arith: T.lessonPath(
        [L_('Ôn bốn phép tính', 'calc0', 'order0'), L_('Toán lời văn lớp 3', 'word0', 'calc0'), L_('Làm quen phân số', 'frac0', 'order0')],
        [L_('Số lớn và tính nhanh', 'big', 'quick'), L_('Trung bình cộng, tổng – hiệu', 'avg', 'sumdiff'), L_('Tổng – tỉ, hiệu – tỉ', 'ratio', 'word'), L_('Phân số', 'fraccalc', 'fraccmp', 'fracof')],
        [L_('Tính nhanh, dãy số, phân số nâng cao', 'quick', 'series', 'fraccalc', 'big'), L_('Toán điển hình nâng cao', 'avg', 'sumdiff', 'ratio', 'fracof', 'word')]),
      number: T.lessonPath(
        [L_('Hàng và giá trị chữ số', 'place0', 'cmp0'), L_('Số liền trước, liền sau', 'next0', 'cmp0'), L_('Số La Mã', 'roman0', 'place0')],
        [L_('Số đến lớp triệu, làm tròn', 'million', 'round'), L_('Dấu hiệu chia hết', 'divis', 'countdiv'), L_('Số dư, chẵn lẻ', 'remainder', 'parity'), L_('Chữ số, số lớn nhất – bé nhất, thế kỉ', 'digits', 'extreme', 'century')],
        [L_('Chia hết và số dư nâng cao', 'divis', 'countdiv', 'remainder', 'lastdigit'), L_('Chữ số và cấu tạo số nâng cao', 'digits', 'extreme', 'parity', 'million', 'round')]),
      geo: T.lessonPath(
        [L_('Chu vi, diện tích lớp 3', 'perim0', 'unit0'), L_('Góc và các hình', 'angle0', 'shape0'), L_('Đổi đơn vị đo', 'unit0', 'perim0')],
        [L_('Hình chữ nhật, hình vuông', 'rect', 'units'), L_('Hình bình hành, hình thoi', 'para', 'lines'), L_('Góc, vuông góc, song song', 'angles', 'lines'), L_('Đếm hình', 'countrect', 'counttri')],
        [L_('Chu vi, diện tích nâng cao', 'rect', 'para', 'compose', 'grow'), L_('Góc, đếm hình, đơn vị nâng cao', 'angles', 'countrect', 'counttri', 'units')]),
      comb: T.lessonPath(
        [L_('Chọn đồ, lập số', 'outfit0', 'list0'), L_('Bắt tay', 'handshake0', 'outfit0'), L_('Lấy bi chắc chắn', 'pigeon0', 'list0')],
        [L_('Quy tắc nhân, quy tắc cộng', 'rule', 'numbers'), L_('Bắt tay, thi đấu, chọn 2', 'handshake', 'choose2'), L_('Đường đi, xếp hàng', 'path', 'arrange'), L_('Dirichlet, đánh số trang', 'pigeon', 'pages')],
        [L_('Đếm số và xếp hàng nâng cao', 'numbers', 'arrange', 'choose2', 'rule'), L_('Đếm hình, đường đi, Dirichlet nâng cao', 'path', 'squares', 'pigeon', 'pages', 'handshake')]),
    },
  });
})(window.T);
