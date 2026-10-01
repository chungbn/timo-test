// Nội dung Toán lớp 5 (SGK 2018) + các dạng TIMO lớp 5: lý thuyết, dạng bài và lộ trình của 5 chủ đề.
(function (T) {
  'use strict';
  const { mk, choicesOf, box, C2, range, sum, digitsOf, gcd, svg, INK, NAMES, SHAPES, FRUITS,
    svgFan, svgGrid, svgClock, fmt, dec, frac } = T.GH;

  // ---------- tiện ích ----------
  const V = (R, fns) => R.pick(fns)();
  const fr = (a, b) => `<sup>${a}</sup>&frasl;<sub>${b}</sub>`;
  const frR = (a, b) => { const g = gcd(a, b); return b / g === 1 ? String(a / g) : fr(a / g, b / g); };
  const FN = ' <i>(viết dưới dạng phân số tối giản, ví dụ 3/4)</i>';
  const lcm = (a, b) => a / gcd(a, b) * b;
  const isPrime = n => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
  const divisorsOf = n => range(1, n).filter(d => n % d === 0);
  const fact = n => (n <= 1 ? 1 : n * fact(n - 1));
  const Cn = (n, k) => (k < 0 || k > n ? 0 : Math.round(fact(n) / (fact(k) * fact(n - k))));
  const hm = m => (m < 60 ? `${m} phút` : `${Math.floor(m / 60)} giờ${m % 60 ? ` ${m % 60} phút` : ''}`);
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const DAYS = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']; // theo getUTCDay()
  const low = s => (s === 'Chủ nhật' ? s : 'thứ ' + s.slice(4));
  const seqOf = arr => `<div class="seq">${arr.join('; ')}</div>`;
  const ds = n => sum(digitsOf(n));
  const leap = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const MONTH_DAYS = y => [31, leap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const perms = n => {
    if (n === 1) return [[0]];
    const out = [];
    for (const p of perms(n - 1)) for (let i = 0; i <= p.length; i++) out.push([...p.slice(0, i), n - 1, ...p.slice(i)]);
    return out;
  };

  // ---------- hình vẽ ----------
  const tx = (x, y, s, a = 'middle') => `<text x="${x}" y="${y}" text-anchor="${a}" font-size="16" font-weight="700" fill="${INK}">${s}</text>`;
  const ST = `stroke="${INK}" stroke-width="3"`;
  const DASH = `stroke="${INK}" stroke-width="2" stroke-dasharray="6 5"`;
  function figRect(wl, hl) {
    return svg(330, 165, `<rect x="40" y="15" width="200" height="115" fill="#bfdbfe" ${ST}/>` + tx(140, 155, wl) + tx(250, 78, hl, 'start'), 300);
  }
  function figSquare(l) {
    return svg(250, 165, `<rect x="40" y="15" width="115" height="115" fill="#fde68a" ${ST}/>` + tx(97, 155, l) + tx(165, 78, l, 'start'), 220);
  }
  function figTri(bl, hl) {
    return svg(300, 175, `<polygon points="30,140 270,140 100,20" fill="#fde68a" ${ST}/><line x1="100" y1="20" x2="100" y2="140" ${DASH}/>` +
      `<polyline points="100,128 112,128 112,140" fill="none" stroke="${INK}" stroke-width="2"/>` + tx(150, 165, bl) + tx(106, 95, hl, 'start'), 280);
  }
  function figTrap(top, bottom, hl) {
    return svg(300, 175, `<polygon points="80,30 210,30 270,140 30,140" fill="#bbf7d0" ${ST}/><line x1="80" y1="30" x2="80" y2="140" ${DASH}/>` +
      tx(145, 22, top) + tx(150, 165, bottom) + tx(86, 95, hl, 'start'), 280);
  }
  function figCircle(label, diameter) {
    const ln = diameter ? `<line x1="20" y1="90" x2="160" y2="90" ${ST}/>` : `<line x1="90" y1="90" x2="160" y2="90" ${ST}/>`;
    return svg(180, 180, `<circle cx="90" cy="90" r="70" fill="#fbcfe8" ${ST}/>${ln}<circle cx="90" cy="90" r="4" fill="${INK}"/>` + tx(diameter ? 90 : 125, 80, label), 170);
  }
  function figBox(a, b, c) {
    return svg(340, 180, `<polygon points="60,60 110,20 270,20 220,60" fill="#dbeafe" ${ST}/><polygon points="220,60 270,20 270,110 220,150" fill="#93c5fd" ${ST}/>` +
      `<rect x="60" y="60" width="160" height="90" fill="#bfdbfe" ${ST}/>` + tx(140, 172, a) + tx(252, 142, b, 'start') + tx(52, 110, c, 'end'), 300);
  }
  function figSqCircle(label, inner, noSquare) {
    let s = noSquare ? '' : `<rect x="20" y="20" width="160" height="160" fill="#fde68a" ${ST}/>`;
    s += `<circle cx="100" cy="100" r="80" fill="#fbcfe8" ${ST}/>`;
    if (inner) s += `<polygon points="100,20 180,100 100,180 20,100" fill="#bfdbfe" ${ST}/>`;
    return svg(200, 210, s + tx(100, 202, label), 190);
  }
  function figCut(al, bl, cl, dl) {
    return svg(340, 180, `<rect x="50" y="20" width="230" height="125" fill="#bbf7d0" ${ST}/><rect x="190" y="20" width="90" height="55" fill="#fff" ${DASH}/>` +
      tx(165, 168, al) + tx(44, 88, bl, 'end') + tx(235, 95, cl) + tx(288, 52, dl, 'start'), 300);
  }
  function figPath(r, c, P) {
    const k = 44, w = c * k + 60, h = r * k + 50, x0 = 30, y0 = 20;
    let s = '';
    for (let i = 0; i <= r; i++) s += `<line x1="${x0}" y1="${y0 + i * k}" x2="${x0 + c * k}" y2="${y0 + i * k}" ${ST}/>`;
    for (let j = 0; j <= c; j++) s += `<line x1="${x0 + j * k}" y1="${y0}" x2="${x0 + j * k}" y2="${y0 + r * k}" ${ST}/>`;
    s += `<circle cx="${x0}" cy="${y0 + r * k}" r="7" fill="#ef4444"/>` + tx(x0 - 4, y0 + r * k + 26, 'A');
    s += `<circle cx="${x0 + c * k}" cy="${y0}" r="7" fill="#2563eb"/>` + tx(x0 + c * k + 18, y0 + 6, 'B');
    if (P) s += `<circle cx="${x0 + P[1] * k}" cy="${y0 + (r - P[0]) * k}" r="7" fill="#f59e0b"/>` + tx(x0 + P[1] * k + 14, y0 + (r - P[0]) * k - 8, 'C', 'start');
    return svg(w, h, s);
  }
  function figVenn(la, lb) {
    return svg(300, 150, `<circle cx="115" cy="75" r="62" fill="#bfdbfe" fill-opacity=".7" ${ST}/><circle cx="185" cy="75" r="62" fill="#fbcfe8" fill-opacity=".7" ${ST}/>` +
      tx(85, 80, la) + tx(215, 80, lb), 280);
  }

  // =====================================================================
  // SỐ HỌC
  // =====================================================================
  function arCalc0(R) {
    return V(R, [
      () => { const a = R.int(112, 989), b = R.int(3, 9); return mk({ text: `Tính:<div class="seq">${a} × ${b} = ?</div>`, answer: a * b, solution: `${a} × ${b} = <b>${a * b}</b>.` }); },
      () => { const q = R.int(102, 999), d = R.int(3, 9); return mk({ text: `Tính:<div class="seq">${q * d} : ${d} = ?</div>`, answer: q, solution: `${q * d} : ${d} = <b>${q}</b> (thử lại: ${q} × ${d} = ${q * d}).` }); },
      () => { const a = R.int(10, 99), b = R.int(2, 9), c = R.int(11, 40); return mk({ text: `Tính giá trị biểu thức:<div class="seq">${a} + ${b} × ${c}</div>`, answer: a + b * c, solution: `Nhân trước, cộng sau: ${b} × ${c} = ${b * c}; ${a} + ${b * c} = <b>${a + b * c}</b>.` }); },
      () => { const a = R.int(11, 60), b = R.int(11, 39), c = R.int(2, 9); return mk({ text: `Tính giá trị biểu thức:<div class="seq">(${a} + ${b}) × ${c}</div>`, answer: (a + b) * c, solution: `Trong ngoặc trước: ${a} + ${b} = ${a + b}; ${a + b} × ${c} = <b>${(a + b) * c}</b>.` }); },
      () => { const a = R.int(21, 79), b = R.pick([11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 27, 28, 29]); return mk({ text: `Tính:<div class="seq">${a} × ${b} = ?</div>`, answer: a * b, solution: `${a} × ${b} = ${a} × ${Math.floor(b / 10) * 10} + ${a} × ${b % 10} = ${a * Math.floor(b / 10) * 10} + ${a * (b % 10)} = <b>${a * b}</b>.` }); },
    ]);
  }

  function arDec(R, lv) {
    if (lv === 0) {
      const A = R.int(11, 199), B = R.int(11, 199);
      if (R.chance(0.5)) return mk({ text: `Tính:<div class="seq">${dec(A / 10)} + ${dec(B / 10)} = ?</div>`, answer: dec((A + B) / 10), solution: `Đặt tính thẳng dấu phẩy, cộng như số tự nhiên: ${dec(A / 10)} + ${dec(B / 10)} = <b>${dec((A + B) / 10)}</b>.` });
      const x = Math.max(A, B) + 5, y = Math.min(A, B);
      return mk({ text: `Tính:<div class="seq">${dec(x / 10)} − ${dec(y / 10)} = ?</div>`, answer: dec((x - y) / 10), solution: `Đặt tính thẳng dấu phẩy, trừ như số tự nhiên: ${dec(x / 10)} − ${dec(y / 10)} = <b>${dec((x - y) / 10)}</b>.` });
    }
    if (lv === 1) {
      return V(R, [
        () => { const A = R.int(101, 999), B = R.int(101, 999); return mk({ text: `Tính:<div class="seq">${dec(A / 10)} + ${dec(B / 100)} = ?</div>`, answer: dec((10 * A + B) / 100), solution: `Viết ${dec(A / 10)} = ${(A / 10).toFixed(2).replace('.', ',')} rồi đặt thẳng dấu phẩy: ${dec(A / 10)} + ${dec(B / 100)} = <b>${dec((10 * A + B) / 100)}</b>.` }); },
        () => { const N = R.int(10, 50); let B = R.int(101, 100 * N - 1); if (B % 10 === 0) B++; return mk({ text: `Tính:<div class="seq">${N} − ${dec(B / 100)} = ?</div>`, answer: dec((100 * N - B) / 100), solution: `Viết ${N} = ${N},00 rồi trừ: ${N},00 − ${dec(B / 100)} = <b>${dec((100 * N - B) / 100)}</b>.` }); },
        () => { const A = R.int(101, 999), k = R.int(3, 9); return mk({ text: `Tính:<div class="seq">${dec(A / 100)} × ${k} = ?</div>`, answer: dec(A * k / 100), solution: `Nhân như số tự nhiên: ${A} × ${k} = ${A * k}. Thừa số ${dec(A / 100)} có 2 chữ số ở phần thập phân nên tách 2 chữ số từ phải sang: <b>${dec(A * k / 100)}</b>.` }); },
        () => { const q = R.int(101, 999), d = R.int(2, 9); return mk({ text: `Tính:<div class="seq">${dec(q * d / 100)} : ${d} = ?</div>`, answer: dec(q / 100), solution: `Chia như số tự nhiên, khi bắt đầu chia phần thập phân thì đánh dấu phẩy vào thương: ${dec(q * d / 100)} : ${d} = <b>${dec(q / 100)}</b> (thử lại: ${dec(q / 100)} × ${d} = ${dec(q * d / 100)}).` }); },
      ]);
    }
    return V(R, [
      () => { let A = R.int(11, 99), B = R.int(11, 99); if (A % 10 === 0) A++; if (B % 10 === 0) B++; return mk({ text: `Tính:<div class="seq">${dec(A / 10)} × ${dec(B / 10)} = ?</div>`, answer: dec(A * B / 100), solution: `Nhân như số tự nhiên: ${A} × ${B} = ${A * B}. Hai thừa số có tất cả 2 chữ số ở phần thập phân nên tách 2 chữ số: <b>${dec(A * B / 100)}</b>.` }); },
      () => { const q = R.int(11, 99), d = R.int(2, 25); return mk({ text: `Tính:<div class="seq">${dec(q * d / 100)} : ${dec(d / 10)} = ?</div>`, answer: dec(q / 10), solution: `Nhân cả số bị chia và số chia với 10: ${dec(q * d / 10)} : ${d} = <b>${dec(q / 10)}</b>.` }); },
      () => { const A = R.int(11, 99), k = R.int(3, 9), C = R.int(101, 999); return mk({ text: `Tính giá trị biểu thức:<div class="seq">${dec(A / 10)} × ${k} + ${dec(C / 100)}</div>`, answer: dec((10 * A * k + C) / 100), solution: `Nhân trước: ${dec(A / 10)} × ${k} = ${dec(A * k / 10)}; cộng sau: ${dec(A * k / 10)} + ${dec(C / 100)} = <b>${dec((10 * A * k + C) / 100)}</b>.` }); },
      () => { const B = R.int(11, 150), A = B + R.int(11, 99), k = R.int(2, 8); return mk({ text: `Tính giá trị biểu thức:<div class="seq">(${dec(A / 10)} − ${dec(B / 10)}) × ${k}</div>`, answer: dec((A - B) * k / 10), solution: `Trong ngoặc trước: ${dec(A / 10)} − ${dec(B / 10)} = ${dec((A - B) / 10)}; ${dec((A - B) / 10)} × ${k} = <b>${dec((A - B) * k / 10)}</b>.` }); },
    ]);
  }

  function arMul10(R, lv) {
    let X = R.int(101, 9999); if (X % 10 === 0) X++;
    const x = X / 100;
    const ops = lv === 0
      ? [['×', '10', 10, 'phải', 1], ['×', '100', 100, 'phải', 2], ['×', '1000', 1000, 'phải', 3], [':', '10', 0.1, 'trái', 1], [':', '100', 0.01, 'trái', 2]]
      : [['×', '0,1', 0.1, 'trái', 1], ['×', '0,01', 0.01, 'trái', 2], ['×', '0,001', 0.001, 'trái', 3], [':', '0,1', 10, 'phải', 1], [':', '0,01', 100, 'phải', 2], [':', '0,001', 1000, 'phải', 3]];
    const [op, s, m, dir, k] = R.pick(ops);
    const ans = dec(x * m);
    const rule = lv === 0
      ? `${op === '×' ? 'Nhân với' : 'Chia cho'} ${s} ta chuyển dấu phẩy sang bên ${dir} ${k} chữ số`
      : `${op === '×' ? 'Nhân với' : 'Chia cho'} ${s} ${op === '×' ? `cũng như chia cho ${10 ** k}` : `cũng như nhân với ${10 ** k}`}: chuyển dấu phẩy sang bên ${dir} ${k} chữ số`;
    if (R.chance(0.3)) {
      return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${box} ${op} ${s} = ${ans}</div>`, answer: dec(x), solution: `${rule}. Muốn tìm ô trống ta làm ngược lại: chuyển dấu phẩy của ${ans} sang bên ${dir === 'phải' ? 'trái' : 'phải'} ${k} chữ số, được <b>${dec(x)}</b>.` });
    }
    return mk({ text: `Tính nhẩm:<div class="seq">${dec(x)} ${op} ${s} = ?</div>`, answer: ans, solution: `${rule}. ${dec(x)} ${op} ${s} = <b>${ans}</b>.` });
  }

  function arPct(R, lv) {
    const P5 = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75];
    if (lv === 1) {
      return V(R, [
        () => { const p = R.pick(P5), b = R.int(2, 30) * 20, a = p * b / 100; return mk({ text: `Một trường có ${b} học sinh, trong đó số học sinh nữ chiếm ${p}%. Hỏi trường có bao nhiêu học sinh nữ?`, answer: a, solution: `Tìm ${p}% của ${b}: ${b} : 100 × ${p} = <b>${a}</b> học sinh nữ.` }); },
        () => { const p = R.pick(P5), b = R.int(2, 30) * 20, a = p * b / 100; return mk({ text: `Tìm ${p}% của ${b}.`, answer: a, solution: `${b} × ${p} : 100 = <b>${a}</b>.` }); },
        () => { const b = R.pick([20, 25, 40, 50]), a = R.int(1, b - 1), p = a * 100 / b; return mk({ text: `Lớp 5A có ${b} học sinh, trong đó có ${a} học sinh giỏi. Số học sinh giỏi chiếm bao nhiêu phần trăm số học sinh cả lớp? (chỉ ghi số, không ghi dấu %)`, answer: dec(p), solution: `Tỉ số phần trăm: ${a} : ${b} = ${dec(a / b)} = <b>${dec(p)}</b>%.` }); },
        () => { const b = R.pick([200, 250, 400, 500]), p = R.pick([12, 24, 30, 36, 48, 60, 64, 72, 80, 88, 92]), a = p * b / 100; return mk({ text: `Một vườn có ${b} cây, trong đó có ${a} cây cam. Số cây cam chiếm bao nhiêu phần trăm số cây trong vườn? (chỉ ghi số)`, answer: p, solution: `${a} : ${b} = ${dec(a / b)} = <b>${p}</b>%.` }); },
      ]);
    }
    if (lv === 2) {
      return V(R, [
        () => { const p = R.pick(P5), x = R.int(2, 40) * 20, a = p * x / 100; return mk({ text: `${p}% của một số là ${a}. Tìm số đó.`, answer: x, solution: `Số đó là: ${a} : ${p} × 100 = <b>${x}</b>.` }); },
        () => { const X = R.int(10, 90) * 10000, p = R.pick([10, 15, 20, 25, 30, 40]), Y = X * (100 - p) / 100; return mk({ text: `Một chiếc cặp giá ${fmt(X)} đồng. Cửa hàng giảm giá ${p}%. Hỏi sau khi giảm giá, chiếc cặp có giá bao nhiêu đồng?`, answer: Y, solution: `Số tiền được giảm: ${fmt(X)} × ${p} : 100 = ${fmt(X - Y)} đồng. Giá mới: ${fmt(X)} − ${fmt(X - Y)} = <b>${fmt(Y)}</b> đồng.` }); },
        () => { const X = R.int(10, 90) * 10000, p = R.pick([10, 20, 25, 40, 50]), Y = X * (100 - p) / 100; return mk({ text: `Sau khi giảm giá ${p}%, một đôi giày có giá ${fmt(Y)} đồng. Hỏi lúc chưa giảm giá, đôi giày giá bao nhiêu đồng?`, answer: X, solution: `Giá mới bằng 100% − ${p}% = ${100 - p}% giá cũ. Giá cũ: ${fmt(Y)} : ${100 - p} × 100 = <b>${fmt(X)}</b> đồng.` }); },
        () => { const X = R.int(10, 90) * 10000, p = R.pick([10, 15, 20, 25, 30]), Y = X * (100 + p) / 100; return mk({ text: `Cô Lan mua một chiếc quạt giá ${fmt(X)} đồng rồi bán lại, lãi ${p}% so với giá mua. Hỏi cô bán chiếc quạt giá bao nhiêu đồng?`, answer: Y, solution: `Tiền lãi: ${fmt(X)} × ${p} : 100 = ${fmt(Y - X)} đồng. Giá bán: ${fmt(X)} + ${fmt(Y - X)} = <b>${fmt(Y)}</b> đồng.` }); },
      ]);
    }
    return V(R, [
      () => { const p = R.pick([10, 20, 30, 40, 50]), a = 100 - p * p / 100; return mk({ text: `Giá một món hàng tăng thêm ${p}%, sau đó lại giảm ${p}% (tính theo giá mới). Hỏi giá lúc sau bằng bao nhiêu phần trăm giá ban đầu? (chỉ ghi số)`, answer: a, solution: `Coi giá ban đầu là 100%. Sau khi tăng: ${100 + p}%. Giảm ${p}% của ${100 + p}% là ${100 + p} × ${p} : 100 = ${dec((100 + p) * p / 100)}%. Giá lúc sau: ${100 + p}% − ${dec((100 + p) * p / 100)}% = <b>${a}</b>%.` }); },
      () => {
        for (;;) {
          const a = R.pick([100, 200, 300, 400, 500]), p = R.pick([3, 4, 5, 6, 8]), q = R.int(1, p - 1), salt = a * p / 100;
          if ((salt * 100) % q) continue;
          const tot = salt * 100 / q;
          return mk({ text: `Có ${a} kg nước biển chứa ${p}% muối. Hỏi phải đổ thêm bao nhiêu ki-lô-gam nước lã để được loại nước chứa ${q}% muối?`, answer: tot - a, solution: `Lượng muối: ${a} × ${p} : 100 = ${salt} kg (không đổi khi thêm nước). Lúc sau ${salt} kg muối chiếm ${q}% nên nước mới nặng ${salt} : ${q} × 100 = ${tot} kg. Phải đổ thêm: ${tot} − ${a} = <b>${tot - a}</b> kg.` });
        }
      },
      () => {
        for (;;) {
          const a = R.pick([20, 25, 30, 40, 50, 60, 70, 80, 90]), b = R.pick([5, 10, 15, 20, 25, 30, 40, 50]), M = R.int(1, 10) * 100;
          if (b >= a || (M * (100 - a)) % (100 - b)) continue;
          const dry = M * (100 - a) / (100 - b), solid = M * (100 - a) / 100;
          return mk({ text: `Hạt tươi chứa ${a}% nước. Người ta phơi ${M} kg hạt tươi, được hạt khô chứa ${b}% nước. Hỏi được bao nhiêu ki-lô-gam hạt khô?`, answer: dry, solution: `Phần "hạt nguyên chất" không đổi: ${M} × ${100 - a} : 100 = ${solid} kg. Trong hạt khô, phần này chiếm 100% − ${b}% = ${100 - b}%. Hạt khô: ${solid} : ${100 - b} × 100 = <b>${dry}</b> kg.` });
        }
      },
      () => { const p = R.pick([125, 200, 250, 400, 500, 80, 50, 40, 160]); return mk({ text: `Số học sinh nam bằng ${p}% số học sinh nữ. Hỏi số học sinh nữ bằng bao nhiêu phần trăm số học sinh nam? (chỉ ghi số)`, answer: dec(10000 / p), solution: `Coi số nữ là 100 phần thì số nam là ${p} phần. Số nữ so với số nam: 100 : ${p} = ${dec(100 / p)} = <b>${dec(10000 / p)}</b>%.` }); },
    ]);
  }

  function arFrac(R, lv) {
    if (lv === 0) {
      return V(R, [
        () => { for (;;) { const b = R.int(3, 12), x = R.int(1, b - 1), y = R.int(1, b - 1); if ((x + y) % b === 0) continue; return mk({ text: `Tính:<div class="seq">${fr(x, b)} + ${fr(y, b)} = ?</div>${FN}`, answer: frac(x + y, b), solution: `Cộng hai tử số, giữ nguyên mẫu số: ${fr(x + y, b)}${gcd(x + y, b) > 1 ? ` = ${frR(x + y, b)}` : ''}. Đáp số <b>${frac(x + y, b)}</b>.` }); } },
        () => { for (;;) { const b = R.int(3, 12), x = R.int(2, b + 4), y = R.int(1, x - 1); if ((x - y) % b === 0) continue; return mk({ text: `Tính:<div class="seq">${fr(x, b)} − ${fr(y, b)} = ?</div>${FN}`, answer: frac(x - y, b), solution: `Trừ hai tử số, giữ nguyên mẫu số: ${fr(x - y, b)}${gcd(x - y, b) > 1 ? ` = ${frR(x - y, b)}` : ''}. Đáp số <b>${frac(x - y, b)}</b>.` }); } },
        () => { for (;;) { const a = R.int(1, 7), b = R.int(a + 1, 9), k = R.int(2, 6); if (gcd(a, b) > 1) continue; return mk({ text: `Rút gọn phân số ${fr(a * k, b * k)}.${FN}`, answer: frac(a, b), solution: `Chia cả tử số và mẫu số cho ${k}: ${fr(a * k, b * k)} = ${fr(a, b)}. Đáp số <b>${frac(a, b)}</b>.` }); } },
      ]);
    }
    if (lv === 1) {
      return V(R, [
        () => { for (;;) { const b1 = R.int(2, 9), b2 = R.int(2, 9), a1 = R.int(1, b1 - 1), a2 = R.int(1, b2 - 1), t = a1 * b2 + a2 * b1; if (b1 === b2 || gcd(a1, b1) > 1 || gcd(a2, b2) > 1 || !frac(t, b1 * b2).includes('/')) continue; const m = lcm(b1, b2); return mk({ text: `Tính:<div class="seq">${fr(a1, b1)} + ${fr(a2, b2)} = ?</div>${FN}`, answer: frac(t, b1 * b2), solution: `Quy đồng mẫu số ${m}: ${fr(a1 * m / b1, m)} + ${fr(a2 * m / b2, m)} = ${fr(a1 * m / b1 + a2 * m / b2, m)}. Đáp số <b>${frac(t, b1 * b2)}</b>.` }); } },
        () => { for (;;) { const b1 = R.int(2, 9), b2 = R.int(2, 9), a1 = R.int(1, b1 - 1), a2 = R.int(1, b2 - 1), t = a1 * b2 - a2 * b1; if (b1 === b2 || t <= 0 || gcd(a1, b1) > 1 || gcd(a2, b2) > 1 || !frac(t, b1 * b2).includes('/')) continue; const m = lcm(b1, b2); return mk({ text: `Tính:<div class="seq">${fr(a1, b1)} − ${fr(a2, b2)} = ?</div>${FN}`, answer: frac(t, b1 * b2), solution: `Quy đồng mẫu số ${m}: ${fr(a1 * m / b1, m)} − ${fr(a2 * m / b2, m)} = ${fr(a1 * m / b1 - a2 * m / b2, m)}. Đáp số <b>${frac(t, b1 * b2)}</b>.` }); } },
        () => { for (;;) { const b1 = R.int(2, 9), b2 = R.int(2, 9), a1 = R.int(1, 8), a2 = R.int(1, 8); if (gcd(a1, b1) > 1 || gcd(a2, b2) > 1 || a1 % b1 === 0 || a2 % b2 === 0 || !frac(a1 * a2, b1 * b2).includes('/')) continue; return mk({ text: `Tính:<div class="seq">${fr(a1, b1)} × ${fr(a2, b2)} = ?</div>${FN}`, answer: frac(a1 * a2, b1 * b2), solution: `Tử nhân tử, mẫu nhân mẫu: ${fr(`${a1} × ${a2}`, `${b1} × ${b2}`)} = ${fr(a1 * a2, b1 * b2)}. Đáp số <b>${frac(a1 * a2, b1 * b2)}</b>.` }); } },
        () => { for (;;) { const b1 = R.int(2, 9), b2 = R.int(2, 9), a1 = R.int(1, 8), a2 = R.int(1, 8); if (gcd(a1, b1) > 1 || gcd(a2, b2) > 1 || a1 % b1 === 0 || a2 % b2 === 0 || !frac(a1 * b2, b1 * a2).includes('/')) continue; return mk({ text: `Tính:<div class="seq">${fr(a1, b1)} : ${fr(a2, b2)} = ?</div>${FN}`, answer: frac(a1 * b2, b1 * a2), solution: `Chia cho một phân số là nhân với phân số đảo ngược: ${fr(a1, b1)} × ${fr(b2, a2)} = ${fr(a1 * b2, b1 * a2)}. Đáp số <b>${frac(a1 * b2, b1 * a2)}</b>.` }); } },
        () => { for (;;) { const w = R.int(1, 5), b = R.int(2, 9), a = R.int(1, b - 1); if (gcd(a, b) > 1) continue; return mk({ text: `Chuyển hỗn số sau thành phân số:<div class="seq">${w}${fr(a, b)}</div>${FN}`, answer: frac(w * b + a, b), solution: `${w}${fr(a, b)} = ${fr(`${w} × ${b} + ${a}`, b)} = ${fr(w * b + a, b)}. Đáp số <b>${frac(w * b + a, b)}</b>.` }); } },
      ]);
    }
    return V(R, [
      () => { const q = R.int(3, 9), p = R.int(1, q - 1), N = q * R.int(3, 20); return mk({ text: `Tìm ${fr(p, q)} của ${N}.`, answer: N * p / q, solution: `${N} × ${fr(p, q)} = ${N} : ${q} × ${p} = <b>${N * p / q}</b>.` }); },
      () => { const q = R.int(3, 9), p = R.int(1, q - 1), N = q * R.int(3, 20); return mk({ text: `Biết ${fr(p, q)} của một số là ${N * p / q}. Tìm số đó.`, answer: N, solution: `Số đó là: ${N * p / q} : ${fr(p, q)} = ${N * p / q} : ${p} × ${q} = <b>${N}</b>.` }); },
      () => { for (;;) { const w1 = R.int(1, 4), w2 = R.int(1, 4), b1 = R.int(2, 6), b2 = R.int(2, 6), a1 = R.int(1, b1 - 1), a2 = R.int(1, b2 - 1); if (b1 === b2 || gcd(a1, b1) > 1 || gcd(a2, b2) > 1) continue; const n1 = w1 * b1 + a1, n2 = w2 * b2 + a2, ans = frac(n1 * b2 + n2 * b1, b1 * b2); if (!ans.includes('/')) continue; return mk({ text: `Tính:<div class="seq">${w1}${fr(a1, b1)} + ${w2}${fr(a2, b2)} = ?</div>${FN}`, answer: ans, solution: `Đổi ra phân số: ${fr(n1, b1)} + ${fr(n2, b2)} = ${fr(n1 * b2, b1 * b2)} + ${fr(n2 * b1, b1 * b2)} = ${fr(n1 * b2 + n2 * b1, b1 * b2)}. Đáp số <b>${ans}</b>.` }); } },
      () => {
        for (;;) {
          const q = R.pick([3, 4, 5]), p = R.int(1, q - 1), q2 = R.pick([3, 4, 5]), p2 = R.int(1, q2 - 1), L = q * q2 * R.int(2, 6);
          const s1 = L * p / q, r1 = L - s1, s2 = r1 * p2 / q2, left = r1 - s2;
          if (left <= 0 || gcd(p, q) > 1 || gcd(p2, q2) > 1) continue;
          return mk({ text: `Một tấm vải dài ${L} m. Lần thứ nhất cắt đi ${fr(p, q)} tấm vải, lần thứ hai cắt đi ${fr(p2, q2)} số vải còn lại. Hỏi tấm vải còn lại bao nhiêu mét?`, answer: left, solution: `Lần 1 cắt: ${L} × ${fr(p, q)} = ${s1} m, còn ${r1} m. Lần 2 cắt: ${r1} × ${fr(p2, q2)} = ${s2} m. Còn lại: ${r1} − ${s2} = <b>${left}</b> m.` });
        }
      },
    ]);
  }

  function arQuick(R, lv) {
    if (lv === 1) {
      return V(R, [
        () => { const a = R.int(12, 99), b = R.int(11, 89), c = 100 - b; return mk({ text: `Tính nhanh:<div class="seq">${a} × ${b} + ${a} × ${c}</div>`, answer: a * 100, solution: `${a} × ${b} + ${a} × ${c} = ${a} × (${b} + ${c}) = ${a} × 100 = <b>${a * 100}</b>.` }); },
        () => { const A = R.int(11, 99), m = R.int(11, 89), n = 100 - m; return mk({ text: `Tính nhanh:<div class="seq">${dec(A / 10)} × ${dec(m / 10)} + ${dec(A / 10)} × ${dec(n / 10)}</div>`, answer: A, solution: `= ${dec(A / 10)} × (${dec(m / 10)} + ${dec(n / 10)}) = ${dec(A / 10)} × 10 = <b>${A}</b>.` }); },
        () => { const a = R.int(12, 99), c = R.int(11, 89), b = c + 10; return mk({ text: `Tính nhanh:<div class="seq">${a} × ${b} − ${a} × ${c}</div>`, answer: a * 10, solution: `= ${a} × (${b} − ${c}) = ${a} × 10 = <b>${a * 10}</b>.` }); },
        () => { const [p, q] = R.pick([[0.25, 4], [0.25, 40], [0.5, 2], [0.5, 20], [1.25, 8], [2.5, 4], [0.125, 8]]), x = R.int(11, 99); return mk({ text: `Tính nhanh:<div class="seq">${dec(p)} × ${x} × ${q}</div>`, answer: dec(p * q * x), solution: `Đổi chỗ các thừa số: (${dec(p)} × ${q}) × ${x} = ${dec(p * q)} × ${x} = <b>${dec(p * q * x)}</b>.` }); },
      ]);
    }
    if (lv === 2) {
      return V(R, [
        () => { const n = R.int(4, 9); return mk({ text: `Tính:<div class="seq">${fr(1, '1×2')} + ${fr(1, '2×3')} + ${fr(1, '3×4')} + ... + ${fr(1, `${n}×${n + 1}`)}</div>${FN}`, answer: frac(n, n + 1), solution: `Mỗi số hạng tách thành hiệu: ${fr(1, '1×2')} = 1 − ${fr(1, 2)}; ${fr(1, '2×3')} = ${fr(1, 2)} − ${fr(1, 3)}; ... Các số ở giữa triệt tiêu nhau, còn 1 − ${fr(1, n + 1)} = ${fr(n, n + 1)}. Đáp số <b>${frac(n, n + 1)}</b>.` }); },
        () => { const a = R.int(12, 99); return R.chance(0.5) ? mk({ text: `Tính nhanh:<div class="seq">${a} × 99 + ${a}</div>`, answer: a * 100, solution: `= ${a} × 99 + ${a} × 1 = ${a} × (99 + 1) = ${a} × 100 = <b>${a * 100}</b>.` }) : mk({ text: `Tính nhanh:<div class="seq">${a} × 101 − ${a}</div>`, answer: a * 100, solution: `= ${a} × 101 − ${a} × 1 = ${a} × (101 − 1) = ${a} × 100 = <b>${a * 100}</b>.` }); },
        () => { const n = R.int(4, 7), P = 2 ** n; return mk({ text: `Tính:<div class="seq">${range(1, n).map(i => fr(1, 2 ** i)).join(' + ')}</div>${FN}`, answer: frac(P - 1, P), solution: `Tổng này thêm ${fr(1, P)} nữa thì bằng 1 (vì ${fr(1, P)} + ${fr(1, P)} = ${fr(1, P / 2)}, rồi ${fr(1, P / 2)} + ${fr(1, P / 2)} = ${fr(1, P / 4)}, ...). Tổng = 1 − ${fr(1, P)} = ${fr(P - 1, P)}. Đáp số <b>${frac(P - 1, P)}</b>.` }); },
        () => { const s = R.pick([1, 2, 5]), n = R.int(8, 20), t = range(1, n).map(i => s * i), tot = s * n * (n + 1) / 2; return mk({ text: `Tính nhanh:<div class="seq">${dec(t[0] / 10)} + ${dec(t[1] / 10)} + ${dec(t[2] / 10)} + ... + ${dec(t[n - 1] / 10)}</div>`, answer: dec(tot / 10), solution: `Dãy cách đều ${dec(s / 10)}, có ${n} số hạng. Tổng = (số đầu + số cuối) × số số hạng : 2 = (${dec(t[0] / 10)} + ${dec(t[n - 1] / 10)}) × ${n} : 2 = <b>${dec(tot / 10)}</b>.` }); },
      ]);
    }
    return V(R, [
      () => { const n = R.int(4, 9), L = 2 * n - 1; return mk({ text: `Tính:<div class="seq">${fr(2, '1×3')} + ${fr(2, '3×5')} + ${fr(2, '5×7')} + ... + ${fr(2, `${L}×${L + 2}`)}</div>${FN}`, answer: frac(2 * n, 2 * n + 1), solution: `${fr(2, '1×3')} = 1 − ${fr(1, 3)}; ${fr(2, '3×5')} = ${fr(1, 3)} − ${fr(1, 5)}; ... Các số ở giữa triệt tiêu: tổng = 1 − ${fr(1, L + 2)} = ${fr(2 * n, 2 * n + 1)}. Đáp số <b>${frac(2 * n, 2 * n + 1)}</b>.` }); },
      () => { const n = R.int(4, 9), L = 2 * n - 1; return mk({ text: `Tính:<div class="seq">${fr(1, '1×3')} + ${fr(1, '3×5')} + ... + ${fr(1, `${L}×${L + 2}`)}</div>${FN}`, answer: frac(n, 2 * n + 1), solution: `Nhân tổng với 2: ${fr(2, '1×3')} + ${fr(2, '3×5')} + ... = 1 − ${fr(1, L + 2)} = ${fr(2 * n, 2 * n + 1)}. Chia lại cho 2: ${fr(n, 2 * n + 1)}. Đáp số <b>${frac(n, 2 * n + 1)}</b>.` }); },
      () => { const n = R.int(3, 7), L = 3 * n - 2; return mk({ text: `Tính:<div class="seq">${fr(3, '1×4')} + ${fr(3, '4×7')} + ... + ${fr(3, `${L}×${L + 3}`)}</div>${FN}`, answer: frac(3 * n, 3 * n + 1), solution: `${fr(3, '1×4')} = 1 − ${fr(1, 4)}; ${fr(3, '4×7')} = ${fr(1, 4)} − ${fr(1, 7)}; ... Tổng = 1 − ${fr(1, L + 3)} = ${fr(3 * n, 3 * n + 1)}. Đáp số <b>${frac(3 * n, 3 * n + 1)}</b>.` }); },
      () => { const n = R.int(6, 20); return mk({ text: `Tính:<div class="seq">(1 − ${fr(1, 2)}) × (1 − ${fr(1, 3)}) × ... × (1 − ${fr(1, n)})</div>${FN}`, answer: frac(1, n), solution: `= ${fr(1, 2)} × ${fr(2, 3)} × ${fr(3, 4)} × ... × ${fr(n - 1, n)}. Tử số của mỗi phân số giản ước với mẫu số của phân số đứng trước, còn lại ${fr(1, n)}. Đáp số <b>${frac(1, n)}</b>.` }); },
      () => { const n = 2 * R.int(3, 10); return mk({ text: `Tính:<div class="seq">(1 + ${fr(1, 2)}) × (1 + ${fr(1, 3)}) × ... × (1 + ${fr(1, n)})</div>${FN}`, answer: frac(n + 1, 2), solution: `= ${fr(3, 2)} × ${fr(4, 3)} × ${fr(5, 4)} × ... × ${fr(n + 1, n)}. Các số giản ước liên tiếp, còn lại ${fr(n + 1, 2)}. Đáp số <b>${frac(n + 1, 2)}</b>.` }); },
    ]);
  }

  function arAvg(R, lv) {
    if (lv === 0) {
      const k = R.pick([3, 4]), nums = range(1, k).map(() => R.int(10, 60));
      const r = sum(nums) % k; if (r) nums[k - 1] += k - r;
      const s = sum(nums);
      return mk({ text: `Tìm trung bình cộng của các số:${seqOf(nums)}`, answer: s / k, solution: `Tổng: ${nums.join(' + ')} = ${s}. Trung bình cộng: ${s} : ${k} = <b>${s / k}</b>.` });
    }
    if (lv === 1) {
      return V(R, [
        () => { for (;;) { const m = R.int(20, 60), a = R.int(10, 70), b = R.int(10, 70), c = R.int(10, 70), x = 4 * m - a - b - c; if (x < 5) continue; return mk({ text: `Trung bình cộng của bốn số là ${m}. Ba số đầu là ${a}, ${b}, ${c}. Tìm số thứ tư.`, answer: x, solution: `Tổng bốn số: ${m} × 4 = ${4 * m}. Số thứ tư: ${4 * m} − ${a} − ${b} − ${c} = <b>${x}</b>.` }); } },
        () => { const A = R.int(11, 199), B = R.int(11, 199); return mk({ text: `Tìm trung bình cộng của hai số ${dec(A / 10)} và ${dec(B / 10)}.`, answer: dec((A + B) / 20), solution: `(${dec(A / 10)} + ${dec(B / 10)}) : 2 = ${dec((A + B) / 10)} : 2 = <b>${dec((A + B) / 20)}</b>.` }); },
        () => { const a = R.int(35, 60), b = R.int(35, 60); let c = R.int(35, 60); const r = (a + b + c) % 3; if (r) c += 3 - r; return mk({ text: `Một ô tô giờ thứ nhất đi được ${a} km, giờ thứ hai đi được ${b} km, giờ thứ ba đi được ${c} km. Hỏi trung bình mỗi giờ ô tô đi được bao nhiêu ki-lô-mét?`, answer: (a + b + c) / 3, solution: `(${a} + ${b} + ${c}) : 3 = ${a + b + c} : 3 = <b>${(a + b + c) / 3}</b> km.` }); },
      ]);
    }
    if (lv === 2) {
      return V(R, [
        () => { for (;;) { const m = R.int(20, 60), n = R.int(15, 65), x = 5 * m - 4 * n; if (x < 3 || x > 150 || m === n) continue; return mk({ text: `Trung bình cộng của năm số là ${m}. Nếu bỏ đi một số thì trung bình cộng của bốn số còn lại là ${n}. Tìm số bị bỏ đi.`, answer: x, solution: `Tổng năm số: ${m} × 5 = ${5 * m}. Tổng bốn số còn lại: ${n} × 4 = ${4 * n}. Số bị bỏ: ${5 * m} − ${4 * n} = <b>${x}</b>.` }); } },
        () => { const n = R.int(20, 35), o = R.int(25, 35), w = o + n + 1; return mk({ text: `Lớp 5B có ${n} học sinh, cân nặng trung bình mỗi bạn là ${o} kg. Nếu tính thêm cả cô giáo thì cân nặng trung bình tăng thêm 1 kg. Hỏi cô giáo nặng bao nhiêu ki-lô-gam?`, answer: w, solution: `Trung bình mới: ${o} + 1 = ${o + 1} kg. Tổng cân nặng ${n + 1} người: ${o + 1} × ${n + 1} = ${(o + 1) * (n + 1)} kg. Tổng ${n} học sinh: ${o} × ${n} = ${o * n} kg. Cô giáo nặng: ${(o + 1) * (n + 1)} − ${o * n} = <b>${w}</b> kg.` }); },
        () => { const a = 2 * R.int(5, 30), b = a + 2 * R.int(5, 30), odd = R.chance(0.5), x = odd ? a + 1 : a, y = odd ? b + 1 : b; return mk({ text: `Tìm trung bình cộng của các số ${odd ? 'lẻ' : 'chẵn'} từ ${x} đến ${y}.`, answer: (x + y) / 2, solution: `Dãy cách đều nên trung bình cộng = (số đầu + số cuối) : 2 = (${x} + ${y}) : 2 = <b>${(x + y) / 2}</b>.` }); },
      ]);
    }
    return V(R, [
      () => { for (;;) { const k = R.int(2, 5), m = R.int(4, 7), x = m + (k + 1); if (x > 10) continue; return mk({ text: `${R.pick(NAMES)} có điểm trung bình ${k} bài kiểm tra là ${m}. Muốn điểm trung bình ${k + 1} bài là ${m + 1} thì bài thứ ${k + 1} phải được bao nhiêu điểm?`, answer: x, solution: `Tổng ${k} bài: ${m} × ${k} = ${m * k}. Tổng ${k + 1} bài cần có: ${m + 1} × ${k + 1} = ${(m + 1) * (k + 1)}. Bài thứ ${k + 1}: ${(m + 1) * (k + 1)} − ${m * k} = <b>${x}</b> điểm.` }); } },
      () => {
        for (;;) {
          const p = R.int(2, 4), q = R.int(2, 4), c = R.int(2, 15), b = q * c, a = p * b, S = a + b + c;
          if (S % 3) continue;
          const u = 1 + q + p * q, askA = R.chance(0.5);
          return mk({ text: `Trung bình cộng của ba số là ${S / 3}. Số thứ nhất gấp ${p} lần số thứ hai, số thứ hai gấp ${q} lần số thứ ba. Tìm số ${askA ? 'thứ nhất' : 'thứ ba'}.`, answer: askA ? a : c, solution: `Tổng ba số: ${S / 3} × 3 = ${S}. Coi số thứ ba là 1 phần thì số thứ hai là ${q} phần, số thứ nhất là ${p * q} phần; tổng ${u} phần. Một phần: ${S} : ${u} = ${c}. ${askA ? `Số thứ nhất: ${c} × ${p * q} = <b>${a}</b>.` : `Số thứ ba là <b>${c}</b>.`}` });
        }
      },
      () => { const bo = R.int(32, 45); let me = R.int(30, bo); if ((bo + me) % 2) me++; let con = R.int(6, 12); con += (3 - (bo + me + con) % 3) % 3; const s = bo + me + con; return mk({ text: `Trung bình cộng số tuổi của bố, mẹ và ${R.pick(NAMES)} là ${s / 3} tuổi. Trung bình cộng số tuổi của bố và mẹ là ${(bo + me) / 2} tuổi. Hỏi bạn ấy bao nhiêu tuổi?`, answer: con, solution: `Tổng tuổi ba người: ${s / 3} × 3 = ${s}. Tổng tuổi bố và mẹ: ${(bo + me) / 2} × 2 = ${bo + me}. Tuổi của bạn: ${s} − ${bo + me} = <b>${con}</b> tuổi.` }); },
    ]);
  }

  function arSumDiff(R, lv) {
    const ctx = R.pick([['Hai thùng có tất cả', 'lít dầu', 'thùng thứ nhất', 'thùng thứ hai', 'lít'], ['Hai lớp thu được tất cả', 'kg giấy vụn', 'lớp 5A', 'lớp 5B', 'kg'], ['Hai kho chứa tất cả', 'tấn thóc', 'kho A', 'kho B', 'tấn']]);
    if (lv === 0) {
      const small = R.int(10, 200), d = R.int(5, 80), S = 2 * small + d, askBig = R.chance(0.5);
      return mk({ text: `${ctx[0]} ${S} ${ctx[1]}, ${ctx[2]} nhiều hơn ${ctx[3]} ${d} ${ctx[4]}. Hỏi ${askBig ? ctx[2] : ctx[3]} có bao nhiêu ${ctx[4]}?`, answer: askBig ? small + d : small, solution: askBig ? `Số lớn = (tổng + hiệu) : 2 = (${S} + ${d}) : 2 = <b>${small + d}</b> ${ctx[4]}.` : `Số bé = (tổng − hiệu) : 2 = (${S} − ${d}) : 2 = <b>${small}</b> ${ctx[4]}.` });
    }
    const rat = () => { for (;;) { const a = R.int(1, 7), b = R.int(2, 9); if (a < b && gcd(a, b) === 1) return [a, b]; } };
    if (lv === 1) {
      return V(R, [
        () => { const [a, b] = rat(), u = R.int(3, 30), askFirst = R.chance(0.5); return mk({ text: `${ctx[0]} ${(a + b) * u} ${ctx[1]}. Số ${ctx[4]} của ${ctx[2]} bằng ${fr(a, b)} số ${ctx[4]} của ${ctx[3]}. Hỏi ${askFirst ? ctx[2] : ctx[3]} có bao nhiêu ${ctx[4]}?`, answer: (askFirst ? a : b) * u, solution: `Coi ${ctx[2]} là ${a} phần thì ${ctx[3]} là ${b} phần, tổng ${a + b} phần. Một phần: ${(a + b) * u} : ${a + b} = ${u}. ${cap(askFirst ? ctx[2] : ctx[3])}: ${u} × ${askFirst ? a : b} = <b>${(askFirst ? a : b) * u}</b> ${ctx[4]}.` }); },
        () => { const W = R.int(5, 40), d = R.int(2, 20), L = W + d, P = 2 * (L + W); return mk({ text: `Một mảnh vườn hình chữ nhật có chu vi ${P} m, chiều dài hơn chiều rộng ${d} m. Tính diện tích mảnh vườn (theo m²).`, answer: L * W, solution: `Nửa chu vi: ${P} : 2 = ${P / 2} m. Chiều dài: (${P / 2} + ${d}) : 2 = ${L} m; chiều rộng: ${L} − ${d} = ${W} m. Diện tích: ${L} × ${W} = <b>${L * W}</b> m².` }); },
        () => { const small = R.int(100, 900), d = R.int(20, 300), S = 2 * small + d; return mk({ text: `Tổng hai số là ${S}, hiệu hai số là ${d}. Tìm số lớn.`, answer: small + d, solution: `Số lớn = (${S} + ${d}) : 2 = <b>${small + d}</b>.` }); },
      ]);
    }
    if (lv === 2) {
      return V(R, [
        () => { const [a, b] = rat(), u = R.int(3, 30), askBig = R.chance(0.5); return mk({ text: `Hiệu hai số là ${(b - a) * u}. Số bé bằng ${fr(a, b)} số lớn. Tìm số ${askBig ? 'lớn' : 'bé'}.`, answer: (askBig ? b : a) * u, solution: `Số bé ${a} phần, số lớn ${b} phần, hiệu ${b - a} phần. Một phần: ${(b - a) * u} : ${b - a} = ${u}. Số ${askBig ? 'lớn' : 'bé'}: ${u} × ${askBig ? b : a} = <b>${(askBig ? b : a) * u}</b>.` }); },
        () => { const k = R.int(2, 6), u = R.int(5, 40); return mk({ text: `Cửa hàng có số gạo tẻ gấp ${k} lần số gạo nếp, nhiều hơn gạo nếp ${(k - 1) * u} kg. Hỏi cửa hàng có bao nhiêu ki-lô-gam gạo tẻ?`, answer: k * u, solution: `Gạo nếp 1 phần, gạo tẻ ${k} phần, hơn nhau ${k - 1} phần. Một phần: ${(k - 1) * u} : ${k - 1} = ${u} kg. Gạo tẻ: ${u} × ${k} = <b>${k * u}</b> kg.` }); },
        () => {
          const S = R.pick([[999, 'số lớn nhất có ba chữ số'], [1000, 'số bé nhất có bốn chữ số'], [99, 'số lớn nhất có hai chữ số'], [100, 'số bé nhất có ba chữ số']]);
          const D = R.pick([[99, 'số lẻ lớn nhất có hai chữ số'], [98, 'số chẵn lớn nhất có hai chữ số'], [10, 'số bé nhất có hai chữ số'], [11, 'số lẻ bé nhất có hai chữ số'], [9, 'số lớn nhất có một chữ số'], [8, 'số chẵn lớn nhất có một chữ số']].filter(d => d[0] % 2 === S[0] % 2 && d[0] < S[0]));
          const big = (S[0] + D[0]) / 2, askBig = R.chance(0.5);
          return mk({ text: `Tổng hai số là ${S[1]}, hiệu hai số là ${D[1]}. Tìm số ${askBig ? 'lớn' : 'bé'}.`, answer: askBig ? big : big - D[0], solution: `Tổng là ${S[0]}, hiệu là ${D[0]}. Số lớn: (${S[0]} + ${D[0]}) : 2 = ${big}. ${askBig ? `Số lớn là <b>${big}</b>.` : `Số bé: ${big} − ${D[0]} = <b>${big - D[0]}</b>.`}` });
        },
      ]);
    }
    return V(R, [
      () => {
        for (;;) {
          const u = R.int(5, 40), k = R.int(2, 5), a = R.int(2, 15), b = R.int(2, 15), first = k * u - a, second = u + b;
          if (first <= 0) continue;
          const askFirst = R.chance(0.5);
          return mk({ text: `Tổng hai số là ${first + second}. Nếu thêm vào số thứ nhất ${a} đơn vị và bớt ở số thứ hai ${b} đơn vị thì số thứ nhất gấp ${k} lần số thứ hai. Tìm số ${askFirst ? 'thứ nhất' : 'thứ hai'}.`, answer: askFirst ? first : second, solution: `Tổng mới: ${first + second} + ${a} − ${b} = ${(k + 1) * u}. Số thứ hai mới là 1 phần, số thứ nhất mới là ${k} phần: một phần = ${(k + 1) * u} : ${k + 1} = ${u}. ${askFirst ? `Số thứ nhất mới: ${k * u}; số thứ nhất: ${k * u} − ${a} = <b>${first}</b>.` : `Số thứ hai: ${u} + ${b} = <b>${second}</b>.`}` });
        }
      },
      () => {
        const small = R.int(8, 60), q = R.int(3, 6), r = R.int(1, Math.min(small - 1, 9)), d = small * (q - 1) + r, askBig = R.chance(0.5);
        return mk({ text: `Hiệu hai số là ${d}. Lấy số lớn chia cho số bé được thương là ${q} và số dư là ${r}. Tìm số ${askBig ? 'lớn' : 'bé'}.`, answer: askBig ? small * q + r : small, solution: `Số lớn = số bé × ${q} + ${r}, nên hiệu = số bé × ${q - 1} + ${r}. Số bé: (${d} − ${r}) : ${q - 1} = ${small}. ${askBig ? `Số lớn: ${small} × ${q} + ${r} = <b>${small * q + r}</b>.` : `Số bé là <b>${small}</b>.`}` });
      },
      () => {
        for (;;) {
          const u = R.int(4, 30), [a, b] = rat(), x = R.int(2, 20), A0 = a * u + x, B0 = b * u - x;
          if (B0 <= 0) continue;
          return mk({ text: `Hai kho có tất cả ${A0 + B0} tấn thóc. Nếu chuyển ${x} tấn từ kho A sang kho B thì số thóc kho A bằng ${fr(a, b)} số thóc kho B. Hỏi lúc đầu kho A có bao nhiêu tấn thóc?`, answer: A0, solution: `Tổng không đổi: ${A0 + B0} tấn. Sau khi chuyển, kho A ${a} phần, kho B ${b} phần; một phần: ${A0 + B0} : ${a + b} = ${u} tấn. Kho A lúc sau: ${a * u} tấn; lúc đầu: ${a * u} + ${x} = <b>${A0}</b> tấn.` });
        }
      },
    ]);
  }

  function arRatio(R, lv) {
    if (lv === 1) {
      return V(R, [
        () => { const a = R.int(2, 9), p = R.int(5, 40) * 1000; let b = R.int(2, 15); if (b === a) b++; return mk({ text: `Mua ${a} kg táo hết ${fmt(a * p)} đồng. Hỏi mua ${b} kg táo như thế hết bao nhiêu đồng?`, answer: b * p, solution: `Giá 1 kg: ${fmt(a * p)} : ${a} = ${fmt(p)} đồng. ${b} kg: ${fmt(p)} × ${b} = <b>${fmt(b * p)}</b> đồng.` }); },
        () => { for (;;) { const a = R.int(3, 12), d = R.int(4, 20), W = a * d, opts = divisorsOf(W).filter(x => x !== a && x >= 2 && x <= 30 && W / x >= 2); if (!opts.length) continue; const b = R.pick(opts); return mk({ text: `${a} người làm xong một công việc trong ${d} ngày. Hỏi muốn làm xong công việc đó trong ${W / b} ngày thì cần bao nhiêu người? (mức làm như nhau)`, answer: b, solution: `Một người làm xong trong: ${d} × ${a} = ${W} ngày. Muốn xong trong ${W / b} ngày cần: ${W} : ${W / b} = <b>${b}</b> người.` }); } },
        () => { const x = R.int(6, 12), k = R.pick([50, 150, 200, 250, 300, 350, 400]); return mk({ text: `Một ô tô cứ đi 100 km thì tiêu thụ ${x} lít xăng. Hỏi ô tô đi ${k} km thì tiêu thụ bao nhiêu lít xăng?`, answer: dec(x * k / 100), solution: `${k} km gấp ${dec(k / 100)} lần 100 km. Số xăng: ${x} × ${dec(k / 100)} = <b>${dec(x * k / 100)}</b> lít.` }); },
      ]);
    }
    return V(R, [
      () => { for (;;) { const a = R.int(10, 60), d = R.int(10, 40), k = R.int(2, d - 2), m = R.int(2, 40); if ((a * (d - k)) % (a + m)) continue; return mk({ text: `Một bếp ăn dự trữ gạo đủ cho ${a} người ăn trong ${d} ngày. Sau ${k} ngày, có thêm ${m} người đến ăn. Hỏi số gạo còn lại đủ cho cả bếp ăn trong bao nhiêu ngày nữa? (mức ăn mỗi người như nhau)`, answer: a * (d - k) / (a + m), solution: `Số gạo còn lại đủ cho ${a} người ăn ${d} − ${k} = ${d - k} ngày, tức là đủ cho 1 người ăn ${a} × ${d - k} = ${a * (d - k)} ngày. Có ${a} + ${m} = ${a + m} người thì ăn được: ${a * (d - k)} : ${a + m} = <b>${a * (d - k) / (a + m)}</b> ngày.` }); } },
      () => { const S = R.pick([1000, 2000, 5000, 10000, 100000, 500000, 1000000]), L = R.int(2, 15), km = S >= 100000; return mk({ text: `Trên bản đồ tỉ lệ 1 : ${fmt(S)}, quãng đường từ nhà ${R.pick(NAMES)} đến ${km ? 'thành phố' : 'trường'} đo được ${L} cm. Hỏi độ dài thật của quãng đường đó là bao nhiêu ${km ? 'ki-lô-mét' : 'mét'}?`, answer: dec(km ? L * S / 100000 : L * S / 100), solution: `Độ dài thật: ${L} × ${fmt(S)} = ${fmt(L * S)} cm = <b>${dec(km ? L * S / 100000 : L * S / 100)}</b> ${km ? 'km' : 'm'}.` }); },
      () => { const S = R.pick([100000, 200000, 500000, 1000000]), cm = R.int(2, 20), D = cm * S / 100000; return mk({ text: `Quãng đường giữa hai thị trấn dài ${dec(D)} km. Trên bản đồ tỉ lệ 1 : ${fmt(S)}, quãng đường đó dài bao nhiêu xăng-ti-mét?`, answer: cm, solution: `${dec(D)} km = ${fmt(D * 100000)} cm. Trên bản đồ: ${fmt(D * 100000)} : ${fmt(S)} = <b>${cm}</b> cm.` }); },
    ]);
  }

  function arMotion(R, lv) {
    if (lv === 1) {
      return V(R, [
        () => { const v = R.int(8, 15) * 4, tq = R.int(5, 14); return mk({ text: `Một ô tô đi với vận tốc ${v} km/giờ trong ${hm(tq * 15)}. Tính quãng đường ô tô đi được (theo km).`, answer: v * tq / 4, solution: `Đổi ${hm(tq * 15)} = ${dec(tq / 4)} giờ. Quãng đường: ${v} × ${dec(tq / 4)} = <b>${v * tq / 4}</b> km.` }); },
        () => { let v = R.int(30, 60); const th = R.int(2, 7); if (th % 2 && v % 2) v++; const s = v * th / 2; return mk({ text: `Một xe máy đi quãng đường ${s} km hết ${hm(th * 30)}. Tính vận tốc của xe máy (theo km/giờ).`, answer: v, solution: `Đổi ${hm(th * 30)} = ${dec(th / 2)} giờ. Vận tốc: ${s} : ${dec(th / 2)} = <b>${v}</b> km/giờ.` }); },
        () => { for (;;) { const v = R.int(4, 15), tm = R.int(1, 15) * 10; if ((v * tm) % 60) continue; return mk({ text: `Một người đi xe đạp với vận tốc ${v} km/giờ trên quãng đường dài ${v * tm / 60} km. Hỏi người đó đi hết bao nhiêu phút?`, answer: tm, solution: `Thời gian: ${v * tm / 60} : ${v} = ${dec(tm / 60)} giờ = ${dec(tm / 60)} × 60 = <b>${tm}</b> phút.` }); } },
        () => { const v = 3 * R.int(10, 30); return mk({ text: `Một ô tô đi với vận tốc ${v} km/giờ. Hỏi mỗi phút ô tô đi được bao nhiêu mét?`, answer: v * 1000 / 60, solution: `${v} km = ${fmt(v * 1000)} m; 1 giờ = 60 phút. Mỗi phút: ${fmt(v * 1000)} : 60 = <b>${v * 1000 / 60}</b> m.` }); },
      ]);
    }
    if (lv === 2) {
      return V(R, [
        () => { const t2 = R.int(2, 6), v1 = R.int(30, 60); let v2 = R.int(30, 60); if (t2 % 2 && (v1 + v2) % 2) v2++; const AB = (v1 + v2) * t2 / 2; return mk({ text: `Quãng đường AB dài ${AB} km. Cùng một lúc, một ô tô đi từ A với vận tốc ${v1} km/giờ và một xe máy đi từ B với vận tốc ${v2} km/giờ, đi ngược chiều nhau. Hỏi sau bao nhiêu giờ hai xe gặp nhau?`, answer: dec(t2 / 2), solution: `Mỗi giờ hai xe gần nhau thêm: ${v1} + ${v2} = ${v1 + v2} km. Thời gian để gặp nhau: ${AB} : ${v1 + v2} = <b>${dec(t2 / 2)}</b> giờ.` }); },
        () => { const t2 = R.int(2, 8), g = 2 * R.int(2, 10), v2 = R.int(10, 40), v1 = v2 + g, D = g * t2 / 2; return mk({ text: `Một xe máy ở A và một xe đạp ở B cách nhau ${D} km. Cùng lúc, xe máy đi từ A với vận tốc ${v1} km/giờ đuổi theo xe đạp đi từ B với vận tốc ${v2} km/giờ (cùng chiều). Hỏi sau bao nhiêu giờ xe máy đuổi kịp xe đạp?`, answer: dec(t2 / 2), solution: `Mỗi giờ xe máy gần xe đạp thêm: ${v1} − ${v2} = ${g} km. Thời gian đuổi kịp: ${D} : ${g} = <b>${dec(t2 / 2)}</b> giờ.` }); },
        () => {
          for (;;) {
            const t2 = R.int(2, 6), g = R.pick([10, 12, 15, 20, 24, 25, 30]), v1 = g * t2 / 2;
            if (!Number.isInteger(v1) || v1 < 25 || v1 > 50) continue;
            const h0 = R.int(6, 8), T0 = (h0 + 1) * 60 + t2 * 30, ans = hm(T0);
            return mk({ type: 'choice', choices: choicesOf(R, ans, [hm(T0 - 30), hm(T0 + 30), hm(T0 - 60), hm(T0 + 60)]), text: `Lúc ${h0} giờ, một xe máy đi từ A với vận tốc ${v1} km/giờ. Đến ${h0 + 1} giờ, một ô tô cũng đi từ A đuổi theo với vận tốc ${v1 + g} km/giờ. Hỏi ô tô đuổi kịp xe máy lúc mấy giờ?`, answer: ans, solution: `Khi ô tô xuất phát, xe máy đã đi được ${v1} km. Mỗi giờ ô tô gần thêm ${v1 + g} − ${v1} = ${g} km. Thời gian đuổi kịp: ${v1} : ${g} = ${dec(t2 / 2)} giờ${t2 % 2 ? ` = ${hm(t2 * 30)}` : ''}. Ô tô đuổi kịp lúc ${h0 + 1} giờ + ${hm(t2 * 30)} = <b>${ans}</b>.` });
          }
        },
        () => {
          const v = R.int(8, 15) * 4, tq = R.int(5, 12), s = v * tq / 4, h0 = R.int(6, 9), m0 = R.pick([0, 15, 30, 45]), rest = R.pick([15, 30]);
          const T0 = h0 * 60 + m0 + tq * 15 + rest, ans = hm(T0);
          return mk({ type: 'choice', choices: choicesOf(R, ans, [hm(T0 - rest), hm(T0 + 15), hm(T0 - 15 - rest), hm(T0 + 30)]), text: `Một ô tô khởi hành từ A lúc ${hm(h0 * 60 + m0)} với vận tốc ${v} km/giờ, đi đến B cách A ${s} km. Dọc đường ô tô nghỉ ${rest} phút. Hỏi ô tô đến B lúc mấy giờ?`, answer: ans, solution: `Thời gian đi: ${s} : ${v} = ${dec(tq / 4)} giờ = ${hm(tq * 15)}. Cộng thêm ${rest} phút nghỉ. Ô tô đến B lúc: ${hm(h0 * 60 + m0)} + ${hm(tq * 15)} + ${rest} phút = <b>${ans}</b>.` });
        },
      ]);
    }
    return V(R, [
      () => { const t1 = R.int(2, 5), t2 = t1 + R.int(1, 3), k = R.int(1, 3), w = k * (t2 - t1), v = k * (t1 + t2), AB = (v + w) * t1, askAB = R.chance(0.6); return askAB ? mk({ text: `Một ca nô xuôi dòng từ A đến B hết ${t1} giờ và ngược dòng từ B về A hết ${t2} giờ. Vận tốc dòng nước là ${w} km/giờ. Tính quãng đường AB (theo km).`, answer: AB, solution: `Vận tốc xuôi dòng hơn vận tốc ngược dòng: ${w} × 2 = ${2 * w} km/giờ. Trên cùng quãng đường, vận tốc tỉ lệ nghịch với thời gian: vận tốc xuôi : vận tốc ngược = ${t2} : ${t1}. Hiệu ${t2 - t1} phần ứng với ${2 * w} km/giờ, một phần = ${2 * w / (t2 - t1)} km/giờ. Vận tốc xuôi: ${2 * w / (t2 - t1)} × ${t2} = ${v + w} km/giờ. AB = ${v + w} × ${t1} = <b>${AB}</b> km.` }) : mk({ text: `Quãng sông AB dài ${AB} km. Một ca nô xuôi dòng từ A đến B hết ${t1} giờ và ngược dòng từ B về A hết ${t2} giờ. Tính vận tốc dòng nước (theo km/giờ).`, answer: w, solution: `Vận tốc xuôi: ${AB} : ${t1} = ${v + w} km/giờ. Vận tốc ngược: ${AB} : ${t2} = ${v - w} km/giờ. Vận tốc dòng nước = (xuôi − ngược) : 2 = (${v + w} − ${v - w}) : 2 = <b>${w}</b> km/giờ.` }); },
      () => { const v = R.int(10, 25), t1 = R.int(6, 15), l = v * t1, T2 = R.int(t1 + 10, t1 + 50), b = v * T2 - l; return R.chance(0.5) ? mk({ text: `Một đoàn tàu dài ${l} m chạy qua một cột điện hết ${t1} giây. Với vận tốc đó, đoàn tàu chạy qua hết một cây cầu dài ${b} m mất bao nhiêu giây?`, answer: T2, solution: `Vận tốc tàu: ${l} : ${t1} = ${v} m/giây. Qua hết cầu, tàu phải đi quãng đường bằng chiều dài cầu cộng chiều dài tàu: ${b} + ${l} = ${b + l} m. Thời gian: ${b + l} : ${v} = <b>${T2}</b> giây.` }) : mk({ text: `Một đoàn tàu chạy qua một cột điện hết ${t1} giây và chạy qua hết một cây cầu dài ${b} m mất ${T2} giây. Tính chiều dài đoàn tàu (theo m).`, answer: l, solution: `Qua cột điện tàu đi quãng đường bằng chiều dài tàu; qua cầu đi thêm chiều dài cầu. ${b} m ứng với ${T2} − ${t1} = ${T2 - t1} giây, vận tốc: ${b} : ${T2 - t1} = ${v} m/giây. Chiều dài tàu: ${v} × ${t1} = <b>${l}</b> m.` }); },
      () => { for (;;) { const t1 = R.int(3, 7), d = R.int(1, 2), base = t1 - d, v1 = base * R.int(1, 12); if (v1 < 20 || v1 > 50) continue; const v2 = v1 * t1 / base; return mk({ text: `Một người đi từ A đến B. Nếu đi với vận tốc ${v1} km/giờ thì đến B chậm hơn ${d} giờ so với khi đi với vận tốc ${v2} km/giờ. Tính quãng đường AB (theo km).`, answer: v1 * t1, solution: `Trên cùng quãng đường, thời gian tỉ lệ nghịch với vận tốc: thời gian đi chậm : thời gian đi nhanh = ${v2} : ${v1} = ${t1} : ${base}. Hiệu ${t1 - base} phần ứng với ${d} giờ nên thời gian đi chậm là ${t1} giờ. AB = ${v1} × ${t1} = <b>${v1 * t1}</b> km.` }); } },
    ]);
  }

  const WORK2 = (() => { const out = []; for (let a = 2; a <= 30; a++) for (let b = a; b <= 30; b++) if ((a * b) % (a + b) === 0) out.push([a, b, a * b / (a + b)]); return out; })();
  const WORK_OUT = (() => { const out = []; for (let a = 2; a <= 15; a++) for (let b = a + 1; b <= 30; b++) if ((a * b) % (b - a) === 0 && a * b / (b - a) <= 40) out.push([a, b, a * b / (b - a)]); return out; })();
  function arWork(R, lv) {
    if (lv === 2) {
      return V(R, [
        () => { const [a, b, t] = R.pick(WORK2); return mk({ text: `Một mình anh Hùng làm xong một công việc trong ${a} giờ, một mình anh Dũng làm xong công việc đó trong ${b} giờ. Hỏi nếu hai anh cùng làm thì sau bao nhiêu giờ sẽ xong công việc?`, answer: t, solution: `Mỗi giờ anh Hùng làm được ${fr(1, a)} công việc, anh Dũng làm được ${fr(1, b)} công việc. Cả hai làm được: ${fr(1, a)} + ${fr(1, b)} = ${frR(a + b, a * b)} công việc. Thời gian: <b>${t}</b> giờ.` }); },
        () => { const [a, b, t] = R.pick(WORK2.filter(x => x[0] !== x[1])); const sw = R.chance(0.5), A = sw ? b : a, B = sw ? a : b; return mk({ text: `Hai vòi nước cùng chảy vào một bể cạn thì sau ${t} giờ đầy bể. Riêng vòi thứ nhất chảy thì sau ${A} giờ đầy bể. Hỏi riêng vòi thứ hai chảy thì sau bao nhiêu giờ đầy bể?`, answer: B, solution: `Mỗi giờ hai vòi chảy được ${fr(1, t)} bể, vòi thứ nhất chảy được ${fr(1, A)} bể. Vòi thứ hai chảy được: ${fr(1, t)} − ${fr(1, A)} = ${fr(1, B)} bể. Vòi thứ hai chảy đầy bể sau <b>${B}</b> giờ.` }); },
        () => { for (;;) { const a = R.int(2, 12), b = R.int(2, 12); if (!frac(a + b, a * b).includes('/')) continue; return mk({ text: `Người thứ nhất làm xong một công việc trong ${a} giờ, người thứ hai làm xong trong ${b} giờ. Hỏi trong 1 giờ, cả hai người cùng làm được mấy phần công việc?${FN}`, answer: frac(a + b, a * b), solution: `${fr(1, a)} + ${fr(1, b)} = ${fr(a + b, a * b)}. Đáp số <b>${frac(a + b, a * b)}</b>.` }); } },
      ]);
    }
    return V(R, [
      () => { const [a, b, t] = R.pick(WORK_OUT); return mk({ text: `Một vòi nước chảy vào bể cạn thì sau ${a} giờ đầy bể. Một vòi khác tháo nước ra thì sau ${b} giờ bể đầy sẽ cạn. Nếu bể đang cạn mà mở cả hai vòi cùng lúc thì sau bao nhiêu giờ bể đầy?`, answer: t, solution: `Mỗi giờ vòi chảy vào ${fr(1, a)} bể, vòi tháo ra ${fr(1, b)} bể. Mỗi giờ bể có thêm: ${fr(1, a)} − ${fr(1, b)} = ${fr(1, t)} bể. Bể đầy sau <b>${t}</b> giờ.` }); },
      () => { const [a, b, c, t] = R.pick([[2, 3, 6, 1], [4, 6, 12, 2], [6, 10, 15, 3], [10, 15, 30, 5], [6, 12, 12, 3], [12, 24, 24, 6], [8, 12, 24, 4], [12, 20, 30, 6], [3, 6, 6, 1.5], [6, 9, 18, 3], [4, 12, 12, 2.4]]); const n = b * c + a * c + a * b, d = a * b * c; return mk({ text: `Ba người cùng làm một công việc. Nếu làm một mình, người thứ nhất làm xong trong ${a} ngày, người thứ hai trong ${b} ngày, người thứ ba trong ${c} ngày. Hỏi cả ba người cùng làm thì xong công việc trong bao nhiêu ngày?`, answer: dec(t), solution: `Mỗi ngày cả ba làm được: ${fr(1, a)} + ${fr(1, b)} + ${fr(1, c)} = ${frR(n, d)} công việc. Thời gian: 1 : ${frR(n, d)} = <b>${dec(t)}</b> ngày.` }); },
      () => { for (;;) { const a = R.int(4, 15), b = R.int(4, 20), x = R.int(1, 6); if ((x * (a + b)) % b) continue; const r = a - x * (a + b) / b; if (r <= 0) continue; return mk({ text: `Người thứ nhất làm một mình xong công việc trong ${a} giờ, người thứ hai làm một mình xong trong ${b} giờ. Hai người cùng làm trong ${x} giờ thì người thứ hai nghỉ, người thứ nhất làm tiếp phần còn lại. Hỏi người thứ nhất phải làm tiếp bao nhiêu giờ nữa?`, answer: r, solution: `Mỗi giờ hai người làm được ${fr(1, a)} + ${fr(1, b)} = ${frR(a + b, a * b)} công việc. Sau ${x} giờ làm được ${frR(x * (a + b), a * b)} công việc, còn lại ${frR(a * b - x * (a + b), a * b)} công việc. Người thứ nhất làm tiếp: ${frR(a * b - x * (a + b), a * b)} : ${fr(1, a)} = <b>${r}</b> giờ.` }); } },
    ]);
  }

  function arUnknown(R, lv) {
    if (lv === 1) {
      return V(R, [
        () => { const X = R.int(11, 99), A = R.int(11, 50); return mk({ text: `Tìm ${box}:<div class="seq">${box} × ${dec(A / 10)} = ${dec(X * A / 100)}</div>`, answer: dec(X / 10), solution: `Thừa số chưa biết = tích : thừa số đã biết: ${box} = ${dec(X * A / 100)} : ${dec(A / 10)} = <b>${dec(X / 10)}</b>.` }); },
        () => { const X = R.int(101, 999), A = R.int(101, 999); return mk({ text: `Tìm ${box}:<div class="seq">${box} − ${dec(A / 100)} = ${dec(X / 100)}</div>`, answer: dec((X + A) / 100), solution: `Số bị trừ = hiệu + số trừ: ${box} = ${dec(X / 100)} + ${dec(A / 100)} = <b>${dec((X + A) / 100)}</b>.` }); },
        () => { const X = R.int(11, 99), d = R.int(2, 9); return mk({ text: `Tìm ${box}:<div class="seq">${box} : ${d} = ${dec(X / 10)}</div>`, answer: dec(X * d / 10), solution: `Số bị chia = thương × số chia: ${box} = ${dec(X / 10)} × ${d} = <b>${dec(X * d / 10)}</b>.` }); },
        () => { const A = R.int(500, 999), X = R.int(11, A - 100); return mk({ text: `Tìm ${box}:<div class="seq">${dec(A / 10)} − ${box} = ${dec((A - X) / 10)}</div>`, answer: dec(X / 10), solution: `Số trừ = số bị trừ − hiệu: ${box} = ${dec(A / 10)} − ${dec((A - X) / 10)} = <b>${dec(X / 10)}</b>.` }); },
      ]);
    }
    return V(R, [
      () => { const X = R.int(11, 99), A = R.int(5, 40), k = R.int(2, 9); return mk({ text: `Tìm ${box}:<div class="seq">(${box} + ${dec(A / 10)}) × ${k} = ${dec((X + A) * k / 10)}</div>`, answer: dec(X / 10), solution: `${box} + ${dec(A / 10)} = ${dec((X + A) * k / 10)} : ${k} = ${dec((X + A) / 10)}. ${box} = ${dec((X + A) / 10)} − ${dec(A / 10)} = <b>${dec(X / 10)}</b>.` }); },
      () => { const X = R.int(11, 199), a = R.int(11, 89), b = 100 - a; return mk({ text: `Tìm ${box}:<div class="seq">${box} × ${dec(a / 10)} + ${box} × ${dec(b / 10)} = ${X}</div>`, answer: dec(X / 10), solution: `${box} × (${dec(a / 10)} + ${dec(b / 10)}) = ${X}, tức là ${box} × 10 = ${X}. ${box} = <b>${dec(X / 10)}</b>.` }); },
      () => { const X = R.int(11, 99), [s, m] = R.pick([['0,25', 4], ['0,5', 2], ['0,125', 8], ['0,2', 5]]); return mk({ text: `Tìm ${box}:<div class="seq">${box} : ${s} = ${X}</div>`, answer: dec(X / m), solution: `Chia cho ${s} cũng như nhân với ${m}, nên ${box} × ${m} = ${X}. ${box} = ${X} : ${m} = <b>${dec(X / m)}</b>.` }); },
    ]);
  }

  // =====================================================================
  // LÝ THUYẾT SỐ
  // =====================================================================
  const RULES = { 2: 'chữ số tận cùng là 0, 2, 4, 6, 8', 5: 'chữ số tận cùng là 0 hoặc 5', 3: 'tổng các chữ số chia hết cho 3', 9: 'tổng các chữ số chia hết cho 9', 10: 'chữ số tận cùng là 0', 4: 'hai chữ số tận cùng tạo thành số chia hết cho 4' };
  function nuDiv0(R) {
    const k = R.pick([2, 5, 3, 9, 10, 4]);
    const good = k * R.int(Math.ceil(100 / k), Math.floor(999 / k));
    const bad = [];
    while (bad.length < 3) { const x = R.int(100, 999); if (x % k && !bad.includes(x)) bad.push(x); }
    return mk({ type: 'choice', choices: R.shuffle([good, ...bad].map(String)), text: `Số nào dưới đây chia hết cho ${k}?`, answer: String(good), solution: `Số chia hết cho ${k} khi ${RULES[k]}. Số <b>${good}</b> thỏa mãn.` });
  }

  const PLACES = ['hàng trăm', 'hàng chục', 'hàng đơn vị', 'hàng phần mười', 'hàng phần trăm', 'hàng phần nghìn'];
  function nuPlace0(R) {
    const d = R.sample(range(1, 9), 6), N = d.reduce((a, x) => a * 10 + x, 0), s = dec(N / 1000);
    return V(R, [
      () => { const i = R.int(0, 5); return mk({ type: 'choice', choices: choicesOf(R, PLACES[i], PLACES), text: `Trong số <b>${s}</b>, chữ số ${d[i]} thuộc hàng nào?`, answer: PLACES[i], solution: `Phần nguyên ${s.split(',')[0]} gồm hàng trăm, chục, đơn vị. Phần thập phân ${s.split(',')[1]} gồm hàng phần mười, phần trăm, phần nghìn. Chữ số ${d[i]} thuộc <b>${PLACES[i]}</b>.` }); },
      () => { const i = R.int(2, 5), vals = range(0, 5).map(j => dec(d[i] * 10 ** (2 - j))); return mk({ type: 'choice', choices: choicesOf(R, vals[i], vals), text: `Giá trị của chữ số ${d[i]} trong số <b>${s}</b> là:`, answer: vals[i], solution: `Chữ số ${d[i]} ở ${PLACES[i]} nên có giá trị <b>${vals[i]}</b>.` }); },
      () => { const a = R.int(1, 99), b = R.int(0, 9), c = R.int(1, 9); return mk({ text: `Viết số thập phân gồm ${a} đơn vị, ${b} phần mười và ${c} phần trăm.`, answer: dec(a + b / 10 + c / 100), solution: `${a} đơn vị, ${b} phần mười, ${c} phần trăm viết là <b>${dec(a + b / 10 + c / 100)}</b>.` }); },
    ]);
  }

  function nuCmpDec(R, lv) {
    if (lv === 0) {
      const I = R.int(0, 30), [a, b] = R.sample(range(1, 9), 2);
      const vals = R.sample([100 * a + 10 * b, 100 * b + 10 * a, 100 * a, 10 * a + b, 100 * a + b], 4);
      const big = R.chance(0.5), ans = dec(I + (big ? Math.max(...vals) : Math.min(...vals)) / 1000);
      const ss = vals.map(v => dec(I + v / 1000));
      return mk({ type: 'choice', choices: R.shuffle(ss), text: `Số nào ${big ? 'lớn' : 'bé'} nhất?${seqOf(ss)}`, answer: ans, solution: `Các số có cùng phần nguyên ${I}. Viết thêm chữ số 0 cho đủ ba chữ số ở phần thập phân rồi so sánh: ${vals.map(v => `${I},${String(v).padStart(3, '0')}`).join('; ')}. Số ${big ? 'lớn' : 'bé'} nhất là <b>${ans}</b>.` });
    }
    return V(R, [
      () => { const N = R.int(1001, 99999), to = R.pick([['hàng đơn vị', 1000], ['hàng phần mười', 100], ['hàng phần trăm', 10]]); const r = Math.floor((N + to[1] / 2) / to[1]) * to[1]; return mk({ text: `Làm tròn số ${dec(N / 1000)} đến ${to[0]}.`, answer: dec(r / 1000), solution: `Nhìn chữ số ngay sau ${to[0]}: bé hơn 5 thì giữ nguyên, từ 5 trở lên thì cộng thêm 1 vào ${to[0]}; bỏ các chữ số phía sau. Kết quả: <b>${dec(r / 1000)}</b>.` }); },
      () => { for (;;) { const A = R.int(11, 400), B = A + R.int(20, 90); if (A % 10 === 0 || B % 10 === 0) continue; const lo = Math.floor(A / 10) + 1, hi = Math.floor(B / 10); return mk({ text: `Có bao nhiêu số tự nhiên x thỏa mãn:<div class="seq">${dec(A / 10)} < x < ${dec(B / 10)}</div>`, answer: hi - lo + 1, solution: `Các số đó là ${lo}, ${lo + 1}, ..., ${hi}. Có ${hi} − ${lo} + 1 = <b>${hi - lo + 1}</b> số.` }); } },
      () => { const b = R.pick([10, 100, 1000]); let a = R.int(1, b * 3); if (a % 10 === 0) a++; return mk({ text: `Viết phân số thập phân ${fr(a, b)} dưới dạng số thập phân.`, answer: dec(a / b), solution: `Mẫu số ${b} có ${String(b).length - 1} chữ số 0 nên phần thập phân có ${String(b).length - 1} chữ số: ${fr(a, b)} = <b>${dec(a / b)}</b>.` }); },
    ]);
  }

  function nuDivis(R, lv) {
    if (lv === 1) {
      return V(R, [
        () => { for (;;) { const a = R.int(1, 9), c = R.int(0, 9), s = a + c; if (s % 9 === 0) continue; const x = 9 - s % 9; return mk({ text: `Tìm chữ số thích hợp điền vào ô trống để số <b>${a}${box}${c}</b> chia hết cho 9.`, answer: x, solution: `Tổng các chữ số ${a} + ${box} + ${c} phải chia hết cho 9: ${s} + ${x} = ${s + x}. Chữ số cần điền là <b>${x}</b>.` }); } },
        () => { const a = R.int(1, 9), c = R.int(0, 9), opts = range(0, 9).filter(x => (a + x + c) % 3 === 0), x = Math.max(...opts); return mk({ text: `Tìm chữ số lớn nhất điền vào ô trống để số <b>${a}${box}${c}</b> chia hết cho 3.`, answer: x, solution: `Tổng ${a} + ${box} + ${c} phải chia hết cho 3: ô trống có thể là ${opts.join(', ')}. Lớn nhất là <b>${x}</b>.` }); },
        () => { const a = R.int(1, 9), b = R.int(0, 9), c = R.pick([0, 2, 4, 6, 8]), opts = range(0, 9).filter(x => (10 * x + c) % 4 === 0), sm = R.chance(0.5), x = sm ? Math.min(...opts) : Math.max(...opts); return mk({ text: `Tìm chữ số ${sm ? 'bé' : 'lớn'} nhất điền vào ô trống để số <b>${a}${b}${box}${c}</b> chia hết cho 4.`, answer: x, solution: `Số chia hết cho 4 khi hai chữ số tận cùng tạo thành số chia hết cho 4: ${box}${c} có thể là ${opts.map(o => `${o}${c}`).join(', ')}. Chữ số ${sm ? 'bé' : 'lớn'} nhất là <b>${x}</b>.` }); },
      ]);
    }
    // Số có bốn chữ số dạng □ab□, tìm theo điều kiện chia hết (vét cạn để chắc chắn đúng)
    const conds = [
      { f: n => n % 90 === 0, t: 'chia hết cho cả 2, 5 và 9', why: 'Chia hết cho 2 và 5 nên chữ số tận cùng là 0; chia hết cho 9 nên tổng các chữ số chia hết cho 9.' },
      { f: n => n % 30 === 0, t: 'chia hết cho cả 2, 3 và 5', why: 'Chia hết cho 2 và 5 nên chữ số tận cùng là 0; chia hết cho 3 nên tổng các chữ số chia hết cho 3.' },
      { f: n => n % 45 === 0, t: 'chia hết cho cả 5 và 9', why: 'Chia hết cho 5 nên tận cùng là 0 hoặc 5; chia hết cho 9 nên tổng các chữ số chia hết cho 9.' },
      { f: n => n % 18 === 0, t: 'chia hết cho cả 2 và 9', why: 'Chia hết cho 2 nên tận cùng là chữ số chẵn; chia hết cho 9 nên tổng các chữ số chia hết cho 9.' },
      { f: n => n % 36 === 0, t: 'chia hết cho cả 4 và 9', why: 'Hai chữ số cuối tạo thành số chia hết cho 4; tổng các chữ số chia hết cho 9.' },
      { f: n => n % 15 === 0, t: 'chia hết cho cả 3 và 5', why: 'Tận cùng là 0 hoặc 5; tổng các chữ số chia hết cho 3.' },
    ];
    for (;;) {
      const cd = R.pick(lv === 2 ? conds.slice(0, 4) : conds);
      const mid = [R.int(0, 9), R.int(0, 9)];
      const sols = [];
      for (let a = 1; a <= 9; a++) for (let b = 0; b <= 9; b++) { const n = a * 1000 + mid[0] * 100 + mid[1] * 10 + b; if (cd.f(n)) sols.push(n); }
      if (!sols.length) continue;
      const ask = lv === 2 ? (sols.length === 1 ? 'one' : R.pick(['max', 'min'])) : R.pick(['count', 'count', 'max', 'min']);
      if (lv === 3 && sols.length < 2) continue;
      const ans = ask === 'count' ? sols.length : ask === 'max' ? Math.max(...sols) : ask === 'min' ? Math.min(...sols) : sols[0];
      const q = ask === 'count' ? 'Có bao nhiêu số như vậy?' : ask === 'one' ? 'Tìm số đó.' : `Tìm số ${ask === 'max' ? 'lớn' : 'bé'} nhất thỏa mãn.`;
      return mk({ text: `Điền chữ số vào hai ô trống để được số có bốn chữ số <b>${box}${mid[0]}${mid[1]}${box}</b> ${cd.t}. ${q}`, answer: ans, solution: `${cd.why} Thử các khả năng, ta được các số: ${sols.join(', ')}. ${ask === 'count' ? `Có <b>${ans}</b> số.` : `Đáp số: <b>${ans}</b>.`}` });
    }
  }

  function nuCount(R, lv) {
    const fl = (n, k) => Math.floor(n / k);
    if (lv === 0) {
      const k = R.pick([2, 5, 10]), n = R.int(3, 10) * 10 + R.int(0, 9);
      return mk({ text: `Từ 1 đến ${n} có bao nhiêu số chia hết cho ${k}?`, answer: fl(n, k), solution: `Các số đó là ${k}, ${2 * k}, ${3 * k}, ..., ${fl(n, k) * k}. Lấy ${n} : ${k} được ${fl(n, k)}${n % k ? ` (dư ${n % k})` : ''}, nên có <b>${fl(n, k)}</b> số.` });
    }
    if (lv === 1) {
      return V(R, [
        () => { const k = R.pick([3, 4, 6, 7, 9, 11]), a = R.int(100, 400), b = R.int(500, 999), f = Math.ceil(a / k) * k, l = fl(b, k) * k; return mk({ text: `Từ ${a} đến ${b} có bao nhiêu số chia hết cho ${k}?`, answer: (l - f) / k + 1, solution: `Số đầu tiên là ${f}, số cuối cùng là ${l}, hai số liền nhau cách nhau ${k}. Số các số: (${l} − ${f}) : ${k} + 1 = <b>${(l - f) / k + 1}</b>.` }); },
        () => { const k = R.pick([2, 3, 4, 5, 6, 9]), f = Math.ceil(100 / k) * k, l = fl(999, k) * k; return mk({ text: `Có bao nhiêu số có ba chữ số chia hết cho ${k}?`, answer: (l - f) / k + 1, solution: `Số bé nhất: ${f}, số lớn nhất: ${l}. Số các số: (${l} − ${f}) : ${k} + 1 = <b>${(l - f) / k + 1}</b>.` }); },
      ]);
    }
    const [a, b] = R.pick([[2, 3], [2, 5], [3, 5], [3, 4], [2, 7], [3, 7], [4, 5]]), n = R.int(50, 300), A = fl(n, a), B = fl(n, b), AB = fl(n, a * b);
    const base = `Từ 1 đến ${n}: có ${A} số chia hết cho ${a}, ${B} số chia hết cho ${b}, ${AB} số chia hết cho cả ${a} và ${b} (tức chia hết cho ${a * b}).`;
    const kind = R.pick(lv === 2 ? ['or', 'butnot'] : ['neither', 'xor', 'or3']);
    if (kind === 'or') return mk({ text: `Từ 1 đến ${n} có bao nhiêu số chia hết cho ${a} hoặc chia hết cho ${b}?`, answer: A + B - AB, solution: `${base} Số chia hết cho ${a} hoặc ${b}: ${A} + ${B} − ${AB} = <b>${A + B - AB}</b>.` });
    if (kind === 'butnot') return mk({ text: `Từ 1 đến ${n} có bao nhiêu số chia hết cho ${a} nhưng không chia hết cho ${b}?`, answer: A - AB, solution: `${base} Số cần tìm: ${A} − ${AB} = <b>${A - AB}</b>.` });
    if (kind === 'neither') return mk({ text: `Từ 1 đến ${n} có bao nhiêu số không chia hết cho ${a} và cũng không chia hết cho ${b}?`, answer: n - (A + B - AB), solution: `${base} Số chia hết cho ${a} hoặc ${b}: ${A} + ${B} − ${AB} = ${A + B - AB}. Số cần tìm: ${n} − ${A + B - AB} = <b>${n - (A + B - AB)}</b>.` });
    if (kind === 'xor') return mk({ text: `Từ 1 đến ${n} có bao nhiêu số chia hết cho ${a} hoặc ${b} nhưng không chia hết cho cả hai số đó?`, answer: A + B - 2 * AB, solution: `${base} Số cần tìm: (${A} − ${AB}) + (${B} − ${AB}) = <b>${A + B - 2 * AB}</b>.` });
    const m = range(1, n).filter(x => x % 2 === 0 || x % 3 === 0 || x % 5 === 0).length;
    return mk({ text: `Từ 1 đến ${n} có bao nhiêu số chia hết cho ít nhất một trong ba số 2, 3, 5?`, answer: m, solution: `Chia hết cho 2: ${fl(n, 2)}; cho 3: ${fl(n, 3)}; cho 5: ${fl(n, 5)}. Bớt các số bị đếm hai lần (chia hết cho 6: ${fl(n, 6)}; cho 10: ${fl(n, 10)}; cho 15: ${fl(n, 15)}) rồi thêm lại số chia hết cho 30: ${fl(n, 30)}. Kết quả: ${fl(n, 2)} + ${fl(n, 3)} + ${fl(n, 5)} − ${fl(n, 6)} − ${fl(n, 10)} − ${fl(n, 15)} + ${fl(n, 30)} = <b>${m}</b>.` });
  }

  const CYC = { 2: [2, 4, 8, 6], 3: [3, 9, 7, 1], 7: [7, 9, 3, 1], 8: [8, 4, 2, 6], 4: [4, 6], 9: [9, 1] };
  const lastPow = (b, n) => CYC[b][(n - 1) % CYC[b].length];
  const zeros = n => Math.floor(n / 5) + Math.floor(n / 25) + Math.floor(n / 125);
  function nuLastDig(R, lv) {
    if (lv === 1) {
      return V(R, [
        () => { const a = R.int(12, 99), b = R.int(12, 99), c = R.int(12, 99), d = (a * b * c) % 10; return mk({ text: `Tích ${a} × ${b} × ${c} có chữ số tận cùng là chữ số nào?`, answer: d, solution: `Chỉ cần nhân các chữ số tận cùng: ${a % 10} × ${b % 10} = ${(a % 10) * (b % 10)}, tận cùng ${(a * b) % 10}; ${(a * b) % 10} × ${c % 10} = ${((a * b) % 10) * (c % 10)}, tận cùng <b>${d}</b>.` }); },
        () => { const a = R.int(12, 99), b = R.int(12, 99), c = R.int(12, 99), e = R.int(12, 99), d = (a * b + c * e) % 10; return mk({ text: `Kết quả của ${a} × ${b} + ${c} × ${e} có chữ số tận cùng là chữ số nào?`, answer: d, solution: `${a} × ${b} tận cùng là ${(a * b) % 10}; ${c} × ${e} tận cùng là ${(c * e) % 10}. Tổng có tận cùng là chữ số tận cùng của ${(a * b) % 10} + ${(c * e) % 10}: <b>${d}</b>.` }); },
        () => { const k = R.int(5, 12); return mk({ text: `Tích của ${k} số lẻ đầu tiên 1 × 3 × 5 × ... × ${2 * k - 1} có chữ số tận cùng là chữ số nào?`, answer: 5, solution: `Tích có thừa số 5 và mọi thừa số đều lẻ, nên tích là số lẻ chia hết cho 5: tận cùng là <b>5</b>.` }); },
      ]);
    }
    if (lv === 2) {
      return V(R, [
        () => { const b = R.pick([2, 3, 7, 8]), n = R.int(20, 99); return mk({ text: `Tích ${b} × ${b} × ${b} × ... × ${b} (có ${n} thừa số ${b}) có chữ số tận cùng là chữ số nào?`, answer: lastPow(b, n), solution: `Chữ số tận cùng lặp lại theo chu kỳ 4: ${CYC[b].join(', ')}, ${CYC[b][0]}, ... Ta có ${n} = 4 × ${Math.floor(n / 4)} + ${n % 4}. ${n % 4 === 0 ? 'Chia hết cho 4 nên lấy số cuối của chu kỳ' : `Dư ${n % 4} nên lấy số thứ ${n % 4} của chu kỳ`}: <b>${lastPow(b, n)}</b>.` }); },
        () => { const n = R.int(10, 49); return mk({ text: `Tích 1 × 2 × 3 × ... × ${n} có tận cùng bao nhiêu chữ số 0?`, answer: zeros(n), solution: `Mỗi cặp thừa số 2 và 5 tạo một chữ số 0; thừa số 2 rất nhiều nên chỉ cần đếm thừa số 5. Từ 1 đến ${n} có ${Math.floor(n / 5)} số chia hết cho 5${n >= 25 ? ` và ${Math.floor(n / 25)} số chia hết cho 25 (mỗi số cho thêm một thừa số 5)` : ''}. Số chữ số 0: <b>${zeros(n)}</b>.` }); },
        () => { const b = R.pick([4, 9]), n = R.int(20, 99); return mk({ text: `Tích ${b} × ${b} × ... × ${b} (có ${n} thừa số ${b}) có chữ số tận cùng là chữ số nào?`, answer: lastPow(b, n), solution: `Tận cùng lặp lại: ${CYC[b].join(', ')}, ${CYC[b].join(', ')}, ... (số lẻ thừa số thì tận cùng ${CYC[b][0]}, số chẵn thừa số thì tận cùng ${CYC[b][1]}). ${n} là số ${n % 2 ? 'lẻ' : 'chẵn'} nên tận cùng là <b>${lastPow(b, n)}</b>.` }); },
      ]);
    }
    return V(R, [
      () => { const n = R.int(50, 130); return mk({ text: `Tích 1 × 2 × 3 × ... × ${n} có tận cùng bao nhiêu chữ số 0?`, answer: zeros(n), solution: `Đếm thừa số 5: có ${Math.floor(n / 5)} số chia hết cho 5, ${Math.floor(n / 25)} số chia hết cho 25${n >= 125 ? `, ${Math.floor(n / 125)} số chia hết cho 125` : ''}. Số chữ số 0: ${Math.floor(n / 5)} + ${Math.floor(n / 25)}${n >= 125 ? ` + ${Math.floor(n / 125)}` : ''} = <b>${zeros(n)}</b>.` }); },
      () => { const e = R.pick([3, 7, 9]), k = R.int(5, 9), terms = range(1, k).map(i => 10 * i + e), d = lastPow(e, k); return mk({ text: `Tích ${terms[0]} × ${terms[1]} × ${terms[2]} × ... × ${terms[k - 1]} có chữ số tận cùng là chữ số nào?`, answer: d, solution: `Có ${k} thừa số, đều tận cùng là ${e}. Tận cùng của tích nhiều số tận cùng ${e} lặp lại theo chu kỳ ${CYC[e].join(', ')}. Với ${k} thừa số được <b>${d}</b>.` }); },
      () => { const n = R.int(20, 99), m = R.int(20, 99), d = (lastPow(2, n) + lastPow(3, m)) % 10; return mk({ text: `Gọi A là tích của ${n} thừa số 2, B là tích của ${m} thừa số 3. Tổng A + B có chữ số tận cùng là chữ số nào?`, answer: d, solution: `Tận cùng của A theo chu kỳ 2, 4, 8, 6: ${n} chia 4 dư ${n % 4} → ${lastPow(2, n)}. Tận cùng của B theo chu kỳ 3, 9, 7, 1: ${m} chia 4 dư ${m % 4} → ${lastPow(3, m)}. Tổng tận cùng là <b>${d}</b>.` }); },
    ]);
  }

  function nuRem(R, lv) {
    if (lv === 1) {
      return V(R, [
        () => { const b = R.int(4, 12), q = R.int(10, 99), r = R.int(1, b - 1); return mk({ text: `Một số chia cho ${b} được thương là ${q} và số dư là ${r}. Tìm số đó.`, answer: b * q + r, solution: `Số bị chia = thương × số chia + số dư = ${q} × ${b} + ${r} = <b>${b * q + r}</b>.` }); },
        () => { const b = R.int(4, 12), q = R.int(10, 99); return mk({ text: `Một số chia cho ${b} được thương là ${q} và có số dư là số dư lớn nhất có thể. Tìm số đó.`, answer: b * q + b - 1, solution: `Số dư lớn nhất khi chia cho ${b} là ${b - 1}. Số đó: ${q} × ${b} + ${b - 1} = <b>${b * q + b - 1}</b>.` }); },
        () => { const n = R.int(1000, 99999), k = R.pick([3, 9]); return mk({ text: `Số ${n} chia cho ${k} dư bao nhiêu?`, answer: n % k, solution: `Một số và tổng các chữ số của nó có cùng số dư khi chia cho ${k}. Tổng chữ số: ${digitsOf(n).join(' + ')} = ${ds(n)}; ${ds(n)} chia ${k} dư <b>${n % k}</b>.` }); },
      ]);
    }
    if (lv === 2) {
      return V(R, [
        () => { const S = R.pick([[2, 3, 4], [2, 3, 4, 5], [2, 3, 4, 5, 6], [3, 4, 5], [4, 5, 6], [2, 5, 6], [3, 5, 7]]), r = R.int(1, Math.min(...S) - 1), L = S.reduce(lcm), ans = L + r; return mk({ text: `Tìm số tự nhiên bé nhất lớn hơn ${r} mà chia cho ${S.join(', ')} đều dư ${r}.`, answer: ans, solution: `Số đó bớt ${r} thì chia hết cho ${S.join(', ')}. Số bé nhất (khác 0) chia hết cho ${S.join(', ')} là ${L}. Số cần tìm: ${L} + ${r} = <b>${ans}</b>.` }); },
        () => { const S = R.pick([[3, 4, 5], [4, 5, 6], [2, 3, 4, 5], [5, 6, 7], [3, 4, 5, 6]]), L = S.reduce(lcm); return mk({ text: `Tìm số tự nhiên bé nhất mà chia cho ${S.map(s => `${s} dư ${s - 1}`).join(', ')}.`, answer: L - 1, solution: `Thêm 1 vào số đó thì chia hết cho ${S.join(', ')}. Số bé nhất chia hết cho ${S.join(', ')} là ${L}. Số cần tìm: ${L} − 1 = <b>${L - 1}</b>.` }); },
        () => { const n = R.int(10, 60), k = R.pick([3, 5, 9, 7]), s = n * (n + 1) / 2; return mk({ text: `Tổng 1 + 2 + 3 + ... + ${n} chia cho ${k} dư bao nhiêu?`, answer: s % k, solution: `Tổng = (1 + ${n}) × ${n} : 2 = ${s}. ${s} = ${k} × ${Math.floor(s / k)} + ${s % k}. Số dư là <b>${s % k}</b>.` }); },
      ]);
    }
    return V(R, [
      () => {
        for (;;) {
          const M = R.sample([3, 4, 5, 7, 9], 3).sort((a, b) => a - b), rs = M.map(m => R.int(0, m - 1));
          if (rs.every(r => r === 0) || gcd(M[0], M[1]) > 1 || gcd(M[0], M[2]) > 1 || gcd(M[1], M[2]) > 1) continue;
          const big = R.chance(0.5), start = big ? 100 : 1;
          let x = start; while (!M.every((m, i) => x % m === rs[i])) x++;
          const top = M[2], cands = []; for (let y = start; y <= x; y++) if (y % top === rs[2]) cands.push(y);
          if (cands.length > 14) continue;
          return mk({ text: `Tìm số tự nhiên bé nhất ${big ? 'có ba chữ số ' : ''}mà ${M.map((m, i) => (rs[i] ? `chia cho ${m} dư ${rs[i]}` : `chia hết cho ${m}`)).join(', ')}.`, answer: x, solution: `Các số ${big ? 'có ba chữ số ' : ''}${rs[2] ? `chia cho ${top} dư ${rs[2]}` : `chia hết cho ${top}`} là: ${cands.join(', ')}, ... Thử lần lượt điều kiện với ${M[0]} và ${M[1]}: số đầu tiên thỏa mãn là <b>${x}</b>.` });
        }
      },
      () => { const d = R.int(4, 9), r = R.int(1, d - 1), N = d * 10 ** R.int(2, 3) + R.int(1, 99), m0 = Math.floor((N - 1) / d) * d, ans = m0 + r < N ? m0 + r : m0 + r - d; return mk({ text: `Tìm số lớn nhất bé hơn ${N} mà chia cho ${d} dư ${r}.`, answer: ans, solution: `Số lớn nhất bé hơn ${N} chia hết cho ${d} là ${m0}. ${m0 + r < N ? `Cộng thêm ${r} được ${ans}, vẫn bé hơn ${N}.` : `Cộng thêm ${r} thì không còn bé hơn ${N}, nên lùi lại ${d}: ${ans}.`} Đáp số: <b>${ans}</b>.` }); },
      () => { const S = R.pick([[2, 3, 4, 5, 6], [3, 4, 5], [4, 6, 9], [3, 5, 7]]), r = R.int(1, Math.min(...S) - 1), L = S.reduce(lcm), k = Math.ceil((100 - r) / L), ans = k * L + r; return mk({ text: `Tìm số bé nhất có ba chữ số mà chia cho ${S.join(', ')} đều dư ${r}.`, answer: ans, solution: `Số cần tìm bằng một số chia hết cho ${S.join(', ')} cộng thêm ${r}. Các số chia hết cho ${S.join(', ')} là bội của ${L}: ${L}, ${2 * L}, ... Số bé nhất có ba chữ số dạng đó: ${k} × ${L} + ${r} = <b>${ans}</b>.` }); },
    ]);
  }

  const pageDigits = n => sum(range(1, n).map(x => String(x).length));
  function nuPages(R, lv) {
    if (lv === 1) {
      const n = R.int(30, 300);
      return mk({ text: `Để đánh số trang một quyển sách dày ${n} trang (bắt đầu từ trang 1) cần dùng bao nhiêu chữ số?`, answer: pageDigits(n), solution: `Trang 1 – 9: 9 trang × 1 chữ số. Trang 10 – ${Math.min(n, 99)}: ${Math.min(n, 99) - 9} trang × 2 chữ số. ${n > 99 ? `Trang 100 – ${n}: ${n - 99} trang × 3 chữ số. ` : ''}Tổng: 9 + ${2 * (Math.min(n, 99) - 9)}${n > 99 ? ` + ${3 * (n - 99)}` : ''} = <b>${pageDigits(n)}</b> chữ số.` });
    }
    if (lv === 2) {
      return V(R, [
        () => { const n = R.int(100, 400), D = pageDigits(n); return mk({ text: `Để đánh số trang một quyển sách (bắt đầu từ trang 1), người ta dùng hết ${D} chữ số. Hỏi quyển sách dày bao nhiêu trang?`, answer: n, solution: `Trang 1 – 9 dùng 9 chữ số, trang 10 – 99 dùng 180 chữ số: cộng lại 189 chữ số. Còn ${D} − 189 = ${D - 189} chữ số cho các trang có 3 chữ số: ${D - 189} : 3 = ${(D - 189) / 3} trang. Sách dày: 99 + ${(D - 189) / 3} = <b>${n}</b> trang.` }); },
        () => { const n = R.int(40, 99), D = pageDigits(n); return mk({ text: `Một bạn viết liên tiếp các số tự nhiên từ 1 đến ${n} thành một dãy. Hỏi bạn đã viết bao nhiêu chữ số?`, answer: D, solution: `Từ 1 đến 9: 9 chữ số. Từ 10 đến ${n}: ${n - 9} số × 2 = ${2 * (n - 9)} chữ số. Tổng: 9 + ${2 * (n - 9)} = <b>${D}</b>.` }); },
      ]);
    }
    const n = R.int(50, 250), d = R.int(1, 9);
    const cnt = [0, 0, 0];
    for (let x = 1; x <= n; x++) { const s = String(x); for (let i = 0; i < s.length; i++) if (+s[s.length - 1 - i] === d) cnt[i]++; }
    const tot = sum(cnt);
    return mk({ text: `Viết các số tự nhiên từ 1 đến ${n}. Hỏi chữ số ${d} được viết bao nhiêu lần?`, answer: tot, solution: `Đếm theo từng hàng. Ở hàng đơn vị: ${cnt[0]} lần. Ở hàng chục: ${cnt[1]} lần. Ở hàng trăm: ${cnt[2]} lần. Tổng: ${cnt[0]} + ${cnt[1]} + ${cnt[2]} = <b>${tot}</b> lần.` });
  }

  function nuDivisors(R, lv) {
    if (lv === 1) {
      return V(R, [
        () => { const n = R.pick([12, 18, 20, 24, 28, 30, 32, 36, 40, 42, 45, 48, 50, 54, 56, 60, 64, 72]), D = divisorsOf(n); return mk({ text: `Số ${n} có bao nhiêu ước?`, answer: D.length, solution: `Các ước của ${n}: ${D.join(', ')}. Có <b>${D.length}</b> ước.` }); },
        () => { const N = R.int(20, 60), P = range(2, N - 1).filter(isPrime); return mk({ text: `Có bao nhiêu số nguyên tố nhỏ hơn ${N}? (Số nguyên tố là số lớn hơn 1, chỉ có hai ước là 1 và chính nó)`, answer: P.length, solution: `Các số nguyên tố nhỏ hơn ${N}: ${P.join(', ')}. Có <b>${P.length}</b> số.` }); },
        () => { for (;;) { const g = R.int(2, 12), a = R.int(2, 6), b = R.int(2, 6); if (gcd(a, b) > 1 || a === b) continue; return mk({ text: `Cô có ${g * a} cái bút và ${g * b} quyển vở, muốn chia đều cho các bạn sao cho mỗi bạn có số bút như nhau và số vở như nhau (không thừa). Hỏi chia được cho nhiều nhất bao nhiêu bạn?`, answer: g, solution: `Số bạn phải là số lớn nhất mà cả ${g * a} và ${g * b} đều chia hết cho nó. Ước của ${g * a}: ${divisorsOf(g * a).join(', ')}; ước của ${g * b}: ${divisorsOf(g * b).join(', ')}. Ước chung lớn nhất là <b>${g}</b>.` }); } },
      ]);
    }
    if (lv === 2) {
      return V(R, [
        () => { for (;;) { const a = R.int(4, 15), b = R.int(4, 15); if (a === b || lcm(a, b) === Math.max(a, b)) continue; const M = Math.max(a, b); return mk({ text: `Hai đèn nháy cùng sáng lúc 8 giờ. Đèn xanh cứ ${a} giây sáng một lần, đèn đỏ cứ ${b} giây sáng một lần. Hỏi sau ít nhất bao nhiêu giây hai đèn lại cùng sáng?`, answer: lcm(a, b), solution: `Số giây phải chia hết cho cả ${a} và ${b}. Các bội của ${M}: ${range(1, lcm(a, b) / M).map(i => i * M).join(', ')}. Số bé nhất cũng chia hết cho ${Math.min(a, b)} là <b>${lcm(a, b)}</b>.` }); } },
        () => { const n = R.pick([36, 48, 60, 72, 80, 84, 90, 96, 100, 120]), D = divisorsOf(n), s = sum(D); return mk({ text: `Tính tổng tất cả các ước của ${n}.`, answer: s, solution: `Các ước của ${n}: ${D.join(', ')}. Tổng: <b>${s}</b>.` }); },
        () => { const n = R.int(80, 200), D = divisorsOf(n); const pairs = D.filter(d => d * d <= n).map(d => d * d === n ? `${d} × ${d}` : `${d} × ${n / d}`); return mk({ text: `Số ${n} có bao nhiêu ước?`, answer: D.length, solution: `Tách ${n} thành tích hai số: ${pairs.join('; ')}. Các ước: ${D.join(', ')}. Có <b>${D.length}</b> ước.` }); },
      ]);
    }
    return V(R, [
      () => { const N = R.int(30, 200), P = range(2, 14).filter(p => isPrime(p) && p * p < N); return mk({ text: `Có bao nhiêu số tự nhiên nhỏ hơn ${N} có đúng 3 ước?`, answer: P.length, solution: `Số có đúng 3 ước là tích của một số nguyên tố với chính nó (ví dụ 4 có các ước 1, 2, 4). Các số nhỏ hơn ${N}: ${P.map(p => `${p} × ${p} = ${p * p}`).join('; ')}. Có <b>${P.length}</b> số.` }); },
      () => { const k = R.pick([4, 5, 6, 8, 9, 10, 12]); let n = 1; while (divisorsOf(n).length !== k) n++; return mk({ text: `Tìm số tự nhiên bé nhất có đúng ${k} ước.`, answer: n, solution: `Thử lần lượt các số. Số ${n} có các ước: ${divisorsOf(n).join(', ')} (đúng ${k} ước); các số bé hơn đều không có đúng ${k} ước. Đáp số <b>${n}</b>.` }); },
      () => { const a = R.int(10, 50), b = a + R.int(20, 60), P = range(a, b).filter(isPrime); return mk({ text: `Từ ${a} đến ${b} có bao nhiêu số nguyên tố?`, answer: P.length, solution: `Loại các số chia hết cho 2, 3, 5, 7. Các số nguyên tố còn lại: ${P.join(', ')}. Có <b>${P.length}</b> số.` }); },
    ]);
  }

  function nuDigitSum(R, lv) {
    if (lv === 1) {
      const s = R.int(5, 26), nums = range(100, 999).filter(n => ds(n) === s), k = R.pick(['min', 'max', 'evenmin']);
      if (k === 'evenmin') { const x = Math.min(...nums.filter(n => n % 2 === 0)); return mk({ text: `Tìm số chẵn bé nhất có ba chữ số mà tổng các chữ số bằng ${s}.`, answer: x, solution: `Muốn số bé nhất, chữ số hàng trăm càng bé càng tốt, rồi đến hàng chục; chữ số hàng đơn vị phải chẵn. Thử từ hàng trăm nhỏ nhất ta được <b>${x}</b> (${digitsOf(x).join(' + ')} = ${s}).` }); }
      const x = k === 'min' ? nums[0] : nums[nums.length - 1];
      return mk({ text: `Tìm số ${k === 'min' ? 'bé' : 'lớn'} nhất có ba chữ số mà tổng các chữ số bằng ${s}.`, answer: x, solution: k === 'min' ? `Hàng trăm bé nhất có thể, dồn phần lớn về hàng đơn vị (nhiều nhất là 9): <b>${x}</b> (${digitsOf(x).join(' + ')} = ${s}).` : `Hàng trăm lớn nhất có thể (nhiều nhất là 9), rồi đến hàng chục: <b>${x}</b> (${digitsOf(x).join(' + ')} = ${s}).` });
    }
    if (lv === 2) {
      return V(R, [
        () => { const s = R.int(10, 30), nums = range(1000, 9999).filter(n => ds(n) === s && new Set(String(n)).size === 4), big = R.chance(0.5), x = big ? nums[nums.length - 1] : nums[0]; return mk({ text: `Tìm số ${big ? 'lớn' : 'bé'} nhất có bốn chữ số khác nhau mà tổng các chữ số bằng ${s}.`, answer: x, solution: `Chọn chữ số từ hàng nghìn sang hàng đơn vị, mỗi hàng ${big ? 'lớn' : 'bé'} nhất có thể sao cho các chữ số còn lại vẫn đủ tổng ${s} và khác nhau. Được <b>${x}</b> (${digitsOf(x).join(' + ')} = ${s}).` }); },
        () => { const s = R.int(2, 7), nums = range(100, 999).filter(n => ds(n) === s); return mk({ text: `Có bao nhiêu số có ba chữ số mà tổng các chữ số bằng ${s}?`, answer: nums.length, solution: `Liệt kê theo chữ số hàng trăm: ${nums.join(', ')}. Có <b>${nums.length}</b> số.` }); },
      ]);
    }
    return V(R, [
      () => { const s = R.int(8, 16), nums = range(100, 999).filter(n => ds(n) === s), by = range(1, 9).map(a => nums.filter(n => Math.floor(n / 100) === a).length); return mk({ text: `Có bao nhiêu số có ba chữ số mà tổng các chữ số bằng ${s}?`, answer: nums.length, solution: `Đếm theo chữ số hàng trăm a = 1, 2, ..., 9; với mỗi a, đếm số cách chọn hai chữ số còn lại có tổng ${s} − a: ${by.map((c, i) => `a = ${i + 1}: ${c}`).join('; ')}. Tổng: <b>${nums.length}</b> số.` }); },
      () => { const k = R.int(2, 10), nums = range(10, 99).filter(n => n === k * ds(n)); return mk({ text: `Có bao nhiêu số có hai chữ số mà số đó gấp ${k} lần tổng các chữ số của nó?`, answer: nums.length, solution: `Gọi số đó có chữ số hàng chục a, hàng đơn vị b: 10 × a + b = ${k} × (a + b). Thử a từ 1 đến 9 ta được: ${nums.join(', ')}. Có <b>${nums.length}</b> số.` }); },
      () => { for (;;) { const s = R.int(10, 23), nums = range(100, 999).filter(n => ds(n) === s && n % 5 === 0); if (!nums.length) continue; return mk({ text: `Có bao nhiêu số có ba chữ số chia hết cho 5 mà tổng các chữ số bằng ${s}?`, answer: nums.length, solution: `Chữ số tận cùng là 0 hoặc 5. Tận cùng 0: hai chữ số đầu có tổng ${s}; tận cùng 5: hai chữ số đầu có tổng ${s - 5}. Các số: ${nums.join(', ')}. Có <b>${nums.length}</b> số.` }); } },
    ]);
  }

  function nuAddDigit(R, lv) {
    if (lv === 2) {
      return V(R, [
        () => { const n = R.int(12, 999); return mk({ text: `Khi viết thêm chữ số 0 vào bên phải một số tự nhiên thì số đó tăng thêm ${9 * n} đơn vị. Tìm số đó.`, answer: n, solution: `Viết thêm chữ số 0 vào bên phải thì số mới gấp 10 lần số cũ, tức là tăng thêm 9 lần số cũ. Số đó: ${9 * n} : 9 = <b>${n}</b>.` }); },
        () => { const n = R.int(12, 999), d = R.int(1, 9), X = 9 * n + d; return mk({ text: `Khi viết thêm chữ số ${d} vào bên phải một số tự nhiên thì số đó tăng thêm ${X} đơn vị. Tìm số đó.`, answer: n, solution: `Số mới = số cũ × 10 + ${d}, nên phần tăng thêm = số cũ × 9 + ${d}. Số cũ: (${X} − ${d}) : 9 = <b>${n}</b>.` }); },
        () => { for (;;) { const n = R.int(100, 999), X = n - Math.floor(n / 10); if (range(100, 999).filter(m => m - Math.floor(m / 10) === X).length !== 1) continue; const a = Math.floor(n / 10), b = n % 10; return mk({ text: `Khi xóa chữ số hàng đơn vị của một số có ba chữ số thì số đó giảm đi ${X} đơn vị. Tìm số đó.`, answer: n, solution: `Gọi chữ số bị xóa là b, số còn lại là A thì số ban đầu = A × 10 + b, giảm đi A × 9 + b = ${X}. Lấy ${X} chia cho 9 được thương ${a}, dư ${b} (b là chữ số nên thử thấy chỉ cách này hợp lệ), nên A = ${a}, b = ${b}. Số đó là <b>${n}</b>.` }); } },
      ]);
    }
    return V(R, [
      () => { const L = []; for (let d = 1; d <= 9; d++) for (let k = 2; k <= 60; k++) { const n = 100 * d / (k - 1); if (Number.isInteger(n) && n >= 10 && n <= 99) L.push([d, k, n]); } const [d, k, n] = R.pick(L); return mk({ text: `Một số có hai chữ số, khi viết thêm chữ số ${d} vào bên trái thì được số mới gấp ${k} lần số đó. Tìm số đó.`, answer: n, solution: `Viết thêm ${d} vào bên trái số có hai chữ số là cộng thêm ${d * 100}. Vậy ${d * 100} bằng ${k} − 1 = ${k - 1} lần số đó. Số đó: ${d * 100} : ${k - 1} = <b>${n}</b>.` }); },
      () => { const L = []; for (let d = 1; d <= 9; d++) for (let k = 11; k <= 200; k++) { const n = 1001 * d / (k - 10); if (Number.isInteger(n) && n >= 10 && n <= 99) L.push([d, k, n]); } const [d, k, n] = R.pick(L); return mk({ text: `Một số có hai chữ số, khi viết thêm chữ số ${d} vào cả bên trái và bên phải thì được số mới gấp ${k} lần số đó. Tìm số đó.`, answer: n, solution: `Số mới = ${d * 1000} + số đó × 10 + ${d} = ${1001 * d} + 10 × số đó. Vậy ${1001 * d} bằng ${k} − 10 = ${k - 10} lần số đó. Số đó: ${1001 * d} : ${k - 10} = <b>${n}</b>.` }); },
      () => { const a = R.int(1, 8), b = R.int(a + 1, 9), X = 9 * (b - a), s = a + b; return mk({ text: `Một số có hai chữ số có tổng các chữ số bằng ${s}. Nếu đổi chỗ hai chữ số thì được số mới lớn hơn số cũ ${X} đơn vị. Tìm số đó.`, answer: 10 * a + b, solution: `Đổi chỗ hai chữ số thì phần tăng thêm = 9 × (hàng đơn vị − hàng chục). Hiệu hai chữ số: ${X} : 9 = ${b - a}, tổng ${s}. Hàng đơn vị: (${s} + ${b - a}) : 2 = ${b}; hàng chục: ${a}. Số đó là <b>${10 * a + b}</b>.` }); },
    ]);
  }

  function nuParity(R, lv) {
    const CH = ['Số chẵn', 'Số lẻ'];
    if (lv === 0) {
      return V(R, [
        () => { const ns = range(1, R.int(3, 4)).map(() => R.int(11, 99)), s = sum(ns), odd = ns.filter(x => x % 2).length; return mk({ type: 'choice', choices: CH, text: `Tổng ${ns.join(' + ')} là số chẵn hay số lẻ? (không cần tính)`, answer: CH[s % 2], solution: `Trong tổng có ${odd} số lẻ. ${odd % 2 ? 'Số các số lẻ là số lẻ' : 'Số các số lẻ là số chẵn'} nên tổng là <b>${CH[s % 2].toLowerCase()}</b>.` }); },
        () => { const ns = range(1, 3).map(() => R.int(11, 99)), p = ns.some(x => x % 2 === 0) ? 0 : 1; return mk({ type: 'choice', choices: CH, text: `Tích ${ns.join(' × ')} là số chẵn hay số lẻ? (không cần tính)`, answer: CH[p], solution: p ? `Mọi thừa số đều lẻ nên tích là <b>số lẻ</b>.` : `Có ít nhất một thừa số chẵn nên tích là <b>số chẵn</b>.` }); },
        () => { const a = R.int(10, 60), b = a + R.int(15, 60), c = range(a, b).filter(x => x % 2).length, f = a % 2 ? a : a + 1, l = b % 2 ? b : b - 1; return mk({ text: `Từ ${a} đến ${b} có bao nhiêu số lẻ?`, answer: c, solution: `Số lẻ đầu tiên: ${f}, số lẻ cuối cùng: ${l}. Số các số lẻ: (${l} − ${f}) : 2 + 1 = <b>${c}</b>.` }); },
      ]);
    }
    if (lv === 1) {
      return V(R, [
        () => { const n = R.int(10, 99), s = n * (n + 1) / 2, odd = Math.ceil(n / 2); return mk({ type: 'choice', choices: CH, text: `Tổng 1 + 2 + 3 + ... + ${n} là số chẵn hay số lẻ?`, answer: CH[s % 2], solution: `Từ 1 đến ${n} có ${odd} số lẻ. ${odd % 2 ? 'Số các số lẻ là số lẻ' : 'Số các số lẻ là số chẵn'} nên tổng là <b>${CH[s % 2].toLowerCase()}</b> (tổng bằng ${s}).` }); },
        () => { const S = 2 * R.int(20, 200) + 1; return mk({ type: 'choice', choices: CH, text: `Tổng của hai số tự nhiên là ${S}. Hỏi tích của hai số đó là số chẵn hay số lẻ?`, answer: 'Số chẵn', solution: `Tổng là số lẻ nên có một số chẵn và một số lẻ. Tích có thừa số chẵn nên là <b>số chẵn</b>.` }); },
        () => { const k = R.int(5, 30), odd = R.chance(0.5), n = 2 * k + (odd ? 1 : 0); return mk({ type: 'choice', choices: CH, text: `Cộng ${n} số lẻ bất kì với nhau thì được số chẵn hay số lẻ?`, answer: odd ? 'Số lẻ' : 'Số chẵn', solution: `Hai số lẻ cộng lại được số chẵn. ${n} số lẻ ghép được ${k} cặp${odd ? ', còn thừa 1 số lẻ' : ''}. Kết quả là <b>${odd ? 'số lẻ' : 'số chẵn'}</b>.` }); },
      ]);
    }
    return V(R, [
      () => { const k = R.int(8, 30); return mk({ text: `Tính tổng ${k} số lẻ đầu tiên: 1 + 3 + 5 + ... + ${2 * k - 1}.`, answer: k * k, solution: `Dãy có ${k} số hạng, tổng = (1 + ${2 * k - 1}) × ${k} : 2 = ${k} × ${k} = <b>${k * k}</b>.` }); },
      () => { const n = R.int(5, 30), s = n * (n + 1) / 2, ok = s % 2 === 0; return mk({ type: 'choice', choices: ['Có', 'Không'], text: `Có thể chia các số 1, 2, 3, ..., ${n} thành hai nhóm sao cho tổng các số trong hai nhóm bằng nhau không?`, answer: ok ? 'Có' : 'Không', solution: `Tổng các số: (1 + ${n}) × ${n} : 2 = ${s}. ${ok ? `Đây là số chẵn, và ta luôn chia được (ví dụ ghép các cặp đầu – cuối có tổng bằng nhau rồi chia đều các cặp), mỗi nhóm có tổng ${s / 2}.` : 'Đây là số lẻ nên không thể chia thành hai phần bằng nhau.'} Câu trả lời: <b>${ok ? 'Có' : 'Không'}</b>.` }); },
      () => { const a = R.int(3, 9) * 2 + 1, n = R.int(10, 40), odd = n % 2; return mk({ type: 'choice', choices: CH, text: `Cho ${n} số tự nhiên, mỗi số đều bằng ${a} hoặc ${a + 2}. Tổng của chúng là số chẵn hay số lẻ?`, answer: CH[odd], solution: `${a} và ${a + 2} đều là số lẻ. Tổng của ${n} số lẻ là ${odd ? 'số lẻ' : 'số chẵn'} (vì ${n} là số ${odd ? 'lẻ' : 'chẵn'}). Đáp số: <b>${CH[odd].toLowerCase()}</b>.` }); },
    ]);
  }

  // =====================================================================
  // HÌNH HỌC
  // =====================================================================
  function geArea0(R) {
    const a = R.int(5, 30), b = R.int(3, a - 1), u = R.pick(['cm', 'dm', 'm']), askP = R.chance(0.4);
    if (R.chance(0.3)) return mk({ text: `Một hình vuông có cạnh ${a} ${u}. Tính ${askP ? `chu vi hình vuông (theo ${u})` : `diện tích hình vuông (theo ${u}²)`}.`, visual: figSquare(`${a} ${u}`), answer: askP ? 4 * a : a * a, solution: askP ? `Chu vi = cạnh × 4 = ${a} × 4 = <b>${4 * a}</b> ${u}.` : `Diện tích = cạnh × cạnh = ${a} × ${a} = <b>${a * a}</b> ${u}².` });
    return mk({ text: `Một hình chữ nhật có chiều dài ${a} ${u}, chiều rộng ${b} ${u}. Tính ${askP ? `chu vi (theo ${u})` : `diện tích (theo ${u}²)`}.`, visual: figRect(`${a} ${u}`, `${b} ${u}`), answer: askP ? 2 * (a + b) : a * b, solution: askP ? `Chu vi = (dài + rộng) × 2 = (${a} + ${b}) × 2 = <b>${2 * (a + b)}</b> ${u}.` : `Diện tích = dài × rộng = ${a} × ${b} = <b>${a * b}</b> ${u}².` });
  }

  function geTri(R, lv) {
    if (lv === 0) {
      let a = R.int(4, 30); const h = R.int(3, 20); if ((a * h) % 2) a++;
      return mk({ text: `Tính diện tích hình tam giác có độ dài đáy ${a} cm và chiều cao ${h} cm (theo cm²).`, visual: figTri(`${a} cm`, `${h} cm`), answer: a * h / 2, solution: `Diện tích tam giác = đáy × chiều cao : 2 = ${a} × ${h} : 2 = <b>${a * h / 2}</b> cm².` });
    }
    if (lv === 1) {
      return V(R, [
        () => { const A = R.int(21, 99), H = R.int(11, 60); return mk({ text: `Tính diện tích hình tam giác có độ dài đáy ${dec(A / 10)} dm và chiều cao ${dec(H / 10)} dm (theo dm²).`, visual: figTri(`${dec(A / 10)} dm`, `${dec(H / 10)} dm`), answer: dec(A * H / 200), solution: `S = ${dec(A / 10)} × ${dec(H / 10)} : 2 = ${dec(A * H / 100)} : 2 = <b>${dec(A * H / 200)}</b> dm².` }); },
        () => { const a = R.int(3, 30), b = R.int(3, 30); return mk({ text: `Một tam giác vuông có hai cạnh góc vuông dài ${a} cm và ${b} cm. Tính diện tích tam giác đó (theo cm²).`, answer: dec(a * b / 2), solution: `Trong tam giác vuông, lấy một cạnh góc vuông làm đáy thì cạnh kia là chiều cao. S = ${a} × ${b} : 2 = <b>${dec(a * b / 2)}</b> cm².` }); },
        () => { const A = R.int(11, 30), h = R.int(3, 15) * 2; return mk({ text: `Một hình tam giác có độ dài đáy ${dec(A / 10)} m và chiều cao ${h} dm. Tính diện tích hình tam giác (theo dm²).`, answer: A * h / 2, solution: `Đổi ${dec(A / 10)} m = ${A} dm. S = ${A} × ${h} : 2 = <b>${A * h / 2}</b> dm².` }); },
      ]);
    }
    return V(R, [
      () => { for (;;) { const a = R.int(4, 30), h = R.int(3, 30); if ((a * h) % 2) continue; return mk({ text: `Một hình tam giác có diện tích ${a * h / 2} cm² và độ dài đáy ${a} cm. Tính chiều cao của tam giác (theo cm).`, visual: figTri(`${a} cm`, '?'), answer: h, solution: `Chiều cao = diện tích × 2 : đáy = ${a * h / 2} × 2 : ${a} = <b>${h}</b> cm.` }); } },
      () => { const S = 2 * R.int(10, 200); return mk({ text: `Tam giác ABC có diện tích ${S} cm². M là trung điểm của cạnh BC. Tính diện tích tam giác ABM (theo cm²).`, answer: S / 2, solution: `Hai tam giác ABM và ACM có chung chiều cao hạ từ A và hai đáy BM = MC, nên diện tích bằng nhau. S(ABM) = ${S} : 2 = <b>${S / 2}</b> cm².` }); },
      () => { for (;;) { const x = R.int(2, 8), h = R.int(3, 20), a = R.int(5, 30); if ((x * h) % 2 || (a * h) % 2) continue; return mk({ text: `Một hình tam giác có đáy ${a} cm. Nếu kéo dài đáy thêm ${x} cm (giữ nguyên chiều cao) thì diện tích tăng thêm ${x * h / 2} cm². Tính diện tích tam giác ban đầu (theo cm²).`, answer: a * h / 2, solution: `Phần tăng thêm là tam giác có đáy ${x} cm, cùng chiều cao. Chiều cao: ${x * h / 2} × 2 : ${x} = ${h} cm. Diện tích ban đầu: ${a} × ${h} : 2 = <b>${a * h / 2}</b> cm².` }); } },
    ]);
  }

  function geTrap(R, lv) {
    const gen = () => { for (;;) { const a = R.int(10, 40), b = R.int(4, a - 2), h = R.int(3, 20); if (((a + b) * h) % 2 === 0) return [a, b, h, (a + b) * h / 2]; } };
    if (lv === 1) {
      return V(R, [
        () => { const [a, b, h, S] = gen(); return mk({ text: `Tính diện tích hình thang có đáy lớn ${a} cm, đáy bé ${b} cm và chiều cao ${h} cm (theo cm²).`, visual: figTrap(`${b} cm`, `${a} cm`, `${h} cm`), answer: S, solution: `S = (đáy lớn + đáy bé) × chiều cao : 2 = (${a} + ${b}) × ${h} : 2 = <b>${S}</b> cm².` }); },
        () => { const A = R.int(50, 150), B = R.int(20, A - 10), H = R.int(20, 80); return mk({ text: `Tính diện tích hình thang có hai đáy dài ${dec(A / 10)} m và ${dec(B / 10)} m, chiều cao ${dec(H / 10)} m (theo m²).`, visual: figTrap(`${dec(B / 10)} m`, `${dec(A / 10)} m`, `${dec(H / 10)} m`), answer: dec((A + B) * H / 200), solution: `S = (${dec(A / 10)} + ${dec(B / 10)}) × ${dec(H / 10)} : 2 = ${dec((A + B) / 10)} × ${dec(H / 10)} : 2 = <b>${dec((A + B) * H / 200)}</b> m².` }); },
      ]);
    }
    if (lv === 2) {
      return V(R, [
        () => { const [a, b, h, S] = gen(); return mk({ text: `Một hình thang có diện tích ${S} cm², hai đáy dài ${a} cm và ${b} cm. Tính chiều cao hình thang (theo cm).`, visual: figTrap(`${b} cm`, `${a} cm`, '?'), answer: h, solution: `Chiều cao = diện tích × 2 : (tổng hai đáy) = ${S} × 2 : (${a} + ${b}) = <b>${h}</b> cm.` }); },
        () => { const [a, b, h, S] = gen(); return mk({ text: `Một hình thang có diện tích ${S} m², chiều cao ${h} m và đáy bé ${b} m. Tính đáy lớn (theo m).`, answer: a, solution: `Tổng hai đáy: ${S} × 2 : ${h} = ${a + b} m. Đáy lớn: ${a + b} − ${b} = <b>${a}</b> m.` }); },
        () => { const a = R.int(3, 8) * 10, b = R.int(2, a / 10 - 1) * 10, h = R.int(2, 6) * 10, k = R.int(40, 70), S = (a + b) * h / 2; return mk({ text: `Một thửa ruộng hình thang có đáy lớn ${a} m, đáy bé ${b} m, chiều cao ${h} m. Trung bình cứ 100 m² thu hoạch được ${k} kg thóc. Hỏi thửa ruộng thu được bao nhiêu ki-lô-gam thóc?`, answer: dec(S * k / 100), solution: `Diện tích: (${a} + ${b}) × ${h} : 2 = ${S} m². Số thóc: ${S} : 100 × ${k} = <b>${dec(S * k / 100)}</b> kg.` }); },
      ]);
    }
    return V(R, [
      () => { for (;;) { const a = R.int(15, 50), x = R.int(2, 10), b = a - x, h = R.int(4, 20); if ((x * h) % 2 || ((a + b) * h) % 2) continue; return mk({ text: `Một hình thang vuông có đáy lớn ${a} m. Nếu kéo dài đáy bé thêm ${x} m thì được một hình chữ nhật, khi đó diện tích tăng thêm ${x * h / 2} m². Tính diện tích hình thang (theo m²).`, answer: (a + b) * h / 2, solution: `Phần thêm vào là tam giác vuông có một cạnh góc vuông ${x} m, cạnh kia bằng chiều cao hình thang: ${x * h / 2} × 2 : ${x} = ${h} m. Đáy bé: ${a} − ${x} = ${b} m. S = (${a} + ${b}) × ${h} : 2 = <b>${(a + b) * h / 2}</b> m².` }); } },
      () => { for (;;) { const s = R.int(14, 60), x = R.int(2, 9), h = R.int(3, 20); if ((x * h) % 2 || (s * h) % 2) continue; return mk({ text: `Một hình thang có tổng hai đáy là ${s} cm. Nếu tăng đáy lớn thêm ${x} cm thì diện tích tăng thêm ${x * h / 2} cm². Tính diện tích hình thang ban đầu (theo cm²).`, answer: s * h / 2, solution: `Phần tăng thêm là tam giác có đáy ${x} cm, chiều cao bằng chiều cao hình thang: ${x * h / 2} × 2 : ${x} = ${h} cm. S = ${s} × ${h} : 2 = <b>${s * h / 2}</b> cm².` }); } },
      () => { for (;;) { const [p, q] = R.pick([[2, 3], [3, 4], [3, 5], [1, 2], [2, 5], [4, 5]]), u = R.int(2, 10), b = p * u, a = q * u, h = R.int(4, 30); if (((a + b) * h) % 2) continue; return mk({ text: `Một hình thang có đáy bé bằng ${fr(p, q)} đáy lớn, đáy lớn hơn đáy bé ${a - b} cm, chiều cao ${h} cm. Tính diện tích hình thang (theo cm²).`, answer: (a + b) * h / 2, solution: `Đáy bé ${p} phần, đáy lớn ${q} phần, hơn nhau ${q - p} phần ứng với ${a - b} cm: một phần ${u} cm. Đáy lớn ${a} cm, đáy bé ${b} cm. S = (${a} + ${b}) × ${h} : 2 = <b>${(a + b) * h / 2}</b> cm².` }); } },
    ]);
  }

  function geCircle(R, lv) {
    if (lv === 1) {
      return V(R, [
        () => { const r = R.int(2, 20); return mk({ text: `Tính diện tích hình tròn có bán kính ${r} cm (lấy π ≈ 3,14; theo cm²).`, visual: figCircle(`r = ${r} cm`), answer: dec(r * r * 3.14), solution: `S = r × r × 3,14 = ${r} × ${r} × 3,14 = <b>${dec(r * r * 3.14)}</b> cm².` }); },
        () => { const d = R.int(2, 30); return mk({ text: `Tính chu vi hình tròn có đường kính ${d} dm (lấy π ≈ 3,14; theo dm).`, visual: figCircle(`d = ${d} dm`, true), answer: dec(d * 3.14), solution: `C = d × 3,14 = ${d} × 3,14 = <b>${dec(d * 3.14)}</b> dm.` }); },
        () => { const r2 = R.int(3, 30); return mk({ text: `Tính chu vi hình tròn có bán kính ${dec(r2 / 2)} m (lấy π ≈ 3,14; theo m).`, visual: figCircle(`r = ${dec(r2 / 2)} m`), answer: dec(r2 * 3.14), solution: `C = r × 2 × 3,14 = ${dec(r2 / 2)} × 2 × 3,14 = <b>${dec(r2 * 3.14)}</b> m.` }); },
      ]);
    }
    if (lv === 2) {
      return V(R, [
        () => { const r = R.int(2, 25); return mk({ text: `Một hình tròn có chu vi ${dec(r * 2 * 3.14)} cm. Tính bán kính hình tròn đó (theo cm).`, answer: r, solution: `r = C : 3,14 : 2 = ${dec(r * 2 * 3.14)} : 3,14 : 2 = <b>${r}</b> cm.` }); },
        () => { const r = R.int(2, 15); return mk({ text: `Một hình tròn có chu vi ${dec(r * 2 * 3.14)} cm. Tính diện tích hình tròn đó (lấy π ≈ 3,14; theo cm²).`, answer: dec(r * r * 3.14), solution: `Bán kính: ${dec(r * 2 * 3.14)} : 3,14 : 2 = ${r} cm. S = ${r} × ${r} × 3,14 = <b>${dec(r * r * 3.14)}</b> cm².` }); },
        () => { const r = R.int(2, 9), Rr = r + R.int(1, 6); return mk({ text: `Một hình vành khăn giới hạn bởi hai hình tròn cùng tâm có bán kính ${Rr} cm và ${r} cm. Tính diện tích hình vành khăn (lấy π ≈ 3,14; theo cm²).`, answer: dec((Rr * Rr - r * r) * 3.14), solution: `S = ${Rr} × ${Rr} × 3,14 − ${r} × ${r} × 3,14 = (${Rr * Rr} − ${r * r}) × 3,14 = <b>${dec((Rr * Rr - r * r) * 3.14)}</b> cm².` }); },
        () => { const D = R.pick([4, 5, 6, 7, 8]), n = R.int(10, 500); return mk({ text: `Bánh xe của một chiếc xe có đường kính ${D} dm. Hỏi bánh xe lăn trên mặt đất ${n} vòng thì xe đi được bao nhiêu mét? (lấy π ≈ 3,14)`, answer: dec(D * 3.14 * n / 10), solution: `Mỗi vòng xe đi được đúng chu vi bánh xe: ${D} × 3,14 = ${dec(D * 3.14)} dm. ${n} vòng: ${dec(D * 3.14)} × ${n} = ${dec(D * 3.14 * n)} dm = <b>${dec(D * 3.14 * n / 10)}</b> m.` }); },
      ]);
    }
    return V(R, [
      () => { const a = 2 * R.int(2, 15), r = a / 2; return mk({ text: `Một hình vuông cạnh ${a} cm, bên trong vẽ hình tròn lớn nhất có thể (tiếp xúc bốn cạnh). Tính diện tích phần hình vuông nằm ngoài hình tròn (lấy π ≈ 3,14; theo cm²).`, visual: figSqCircle(`cạnh ${a} cm`), answer: dec(a * a - r * r * 3.14), solution: `Bán kính hình tròn: ${a} : 2 = ${r} cm. Diện tích hình vuông: ${a} × ${a} = ${a * a} cm². Diện tích hình tròn: ${r} × ${r} × 3,14 = ${dec(r * r * 3.14)} cm². Phần còn lại: ${a * a} − ${dec(r * r * 3.14)} = <b>${dec(a * a - r * r * 3.14)}</b> cm².` }); },
      () => { const k = R.int(2, 5); return mk({ text: `Nếu tăng bán kính một hình tròn lên gấp ${k} lần thì diện tích hình tròn tăng lên gấp bao nhiêu lần?`, answer: k * k, solution: `S = r × r × 3,14. Bán kính gấp ${k} lần thì diện tích gấp ${k} × ${k} = <b>${k * k}</b> lần.` }); },
      () => { const p = R.pick([10, 20, 30, 50]), inc = 2 * p + p * p / 100; return mk({ text: `Nếu tăng bán kính một hình tròn thêm ${p}% thì diện tích hình tròn tăng thêm bao nhiêu phần trăm? (chỉ ghi số)`, answer: dec(inc), solution: `Bán kính mới bằng ${dec((100 + p) / 100)} lần bán kính cũ, nên diện tích mới bằng ${dec((100 + p) / 100)} × ${dec((100 + p) / 100)} = ${dec((100 + p) * (100 + p) / 10000)} lần diện tích cũ, tức ${dec((100 + p) * (100 + p) / 100)}%. Tăng thêm <b>${dec(inc)}</b>%.` }); },
      () => { const r = R.int(2, 12); return mk({ text: `Một nửa hình tròn có bán kính ${r} cm. Tính chu vi của nửa hình tròn đó (gồm cả đường kính; lấy π ≈ 3,14; theo cm).`, answer: dec(r * 3.14 + 2 * r), solution: `Nửa đường tròn dài: ${r} × 2 × 3,14 : 2 = ${dec(r * 3.14)} cm. Cộng đường kính ${2 * r} cm: <b>${dec(r * 3.14 + 2 * r)}</b> cm.` }); },
    ]);
  }

  function geBox(R, lv) {
    if (lv === 0) {
      return V(R, [
        () => { const a = R.int(2, 12); return mk({ text: `Tính thể tích hình lập phương có cạnh ${a} cm (theo cm³).`, visual: figBox(`${a} cm`, `${a} cm`, `${a} cm`), answer: a ** 3, solution: `V = cạnh × cạnh × cạnh = ${a} × ${a} × ${a} = <b>${a ** 3}</b> cm³.` }); },
        () => { const a = R.int(3, 15), b = R.int(2, a), c = R.int(2, 12); return mk({ text: `Tính thể tích hình hộp chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm, chiều cao ${c} cm (theo cm³).`, visual: figBox(`${a} cm`, `${b} cm`, `${c} cm`), answer: a * b * c, solution: `V = dài × rộng × cao = ${a} × ${b} × ${c} = <b>${a * b * c}</b> cm³.` }); },
        () => { const a = R.int(2, 15); return mk({ text: `Một hình lập phương có cạnh ${a} dm. Tính diện tích một mặt của hình lập phương (theo dm²).`, visual: figBox(`${a} dm`, `${a} dm`, `${a} dm`), answer: a * a, solution: `Mỗi mặt là hình vuông cạnh ${a} dm: ${a} × ${a} = <b>${a * a}</b> dm².` }); },
      ]);
    }
    if (lv === 1) {
      return V(R, [
        () => { const a = R.int(4, 20), b = R.int(2, a), c = R.int(2, 15); return mk({ text: `Một hình hộp chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm, chiều cao ${c} cm. Tính diện tích xung quanh (theo cm²).`, visual: figBox(`${a} cm`, `${b} cm`, `${c} cm`), answer: 2 * (a + b) * c, solution: `Sxq = chu vi đáy × chiều cao = (${a} + ${b}) × 2 × ${c} = <b>${2 * (a + b) * c}</b> cm².` }); },
        () => { const a = R.int(4, 20), b = R.int(2, a), c = R.int(2, 15); return mk({ text: `Một hình hộp chữ nhật có chiều dài ${a} dm, chiều rộng ${b} dm, chiều cao ${c} dm. Tính diện tích toàn phần (theo dm²).`, visual: figBox(`${a} dm`, `${b} dm`, `${c} dm`), answer: 2 * (a + b) * c + 2 * a * b, solution: `Sxq = (${a} + ${b}) × 2 × ${c} = ${2 * (a + b) * c} dm². Hai đáy: ${a} × ${b} × 2 = ${2 * a * b} dm². Stp = ${2 * (a + b) * c} + ${2 * a * b} = <b>${2 * (a + b) * c + 2 * a * b}</b> dm².` }); },
        () => { const a = R.int(2, 15), tp = R.chance(0.5); return mk({ text: `Một hình lập phương có cạnh ${a} cm. Tính diện tích ${tp ? 'toàn phần' : 'xung quanh'} (theo cm²).`, visual: figBox(`${a} cm`, `${a} cm`, `${a} cm`), answer: (tp ? 6 : 4) * a * a, solution: `Diện tích một mặt: ${a} × ${a} = ${a * a} cm². ${tp ? 'Toàn phần gồm 6 mặt' : 'Xung quanh gồm 4 mặt'}: ${a * a} × ${tp ? 6 : 4} = <b>${(tp ? 6 : 4) * a * a}</b> cm².` }); },
        () => { const A = R.int(15, 50), B = R.int(11, A - 2), C = R.int(2, 10); return mk({ text: `Tính thể tích hình hộp chữ nhật có chiều dài ${dec(A / 10)} m, chiều rộng ${dec(B / 10)} m, chiều cao ${C} m (theo m³).`, visual: figBox(`${dec(A / 10)} m`, `${dec(B / 10)} m`, `${C} m`), answer: dec(A * B * C / 100), solution: `V = ${dec(A / 10)} × ${dec(B / 10)} × ${C} = <b>${dec(A * B * C / 100)}</b> m³.` }); },
      ]);
    }
    if (lv === 2) {
      return V(R, [
        () => { const a = R.int(10, 30), b = R.int(8, 20), c = R.int(5, 15), L = a * b * c; return mk({ text: `Một bể nước dạng hình hộp chữ nhật có chiều dài ${dec(a / 10)} m, chiều rộng ${dec(b / 10)} m, chiều cao ${dec(c / 10)} m. Hỏi bể chứa đầy được bao nhiêu lít nước? (1 dm³ = 1 lít)`, visual: figBox(`${dec(a / 10)} m`, `${dec(b / 10)} m`, `${dec(c / 10)} m`), answer: L, solution: `Đổi ra đề-xi-mét: ${a} dm, ${b} dm, ${c} dm. V = ${a} × ${b} × ${c} = ${fmt(L)} dm³ = <b>${fmt(L)}</b> lít.` }); },
        () => { const k = R.int(2, 5); return mk({ text: `Nếu tăng cạnh của một hình lập phương lên gấp ${k} lần thì thể tích hình lập phương tăng lên gấp bao nhiêu lần?`, answer: k ** 3, solution: `V = cạnh × cạnh × cạnh. Mỗi cạnh gấp ${k} lần nên thể tích gấp ${k} × ${k} × ${k} = <b>${k ** 3}</b> lần.` }); },
        () => { const a = R.int(2, 12), tp = R.chance(0.5); return mk({ text: `Một hình lập phương có thể tích ${a ** 3} cm³. Tính diện tích ${tp ? 'toàn phần' : 'xung quanh'} của hình lập phương đó (theo cm²).`, answer: (tp ? 6 : 4) * a * a, solution: `Tìm số nhân với chính nó 3 lần được ${a ** 3}: ${a} × ${a} × ${a} = ${a ** 3}, nên cạnh là ${a} cm. Diện tích ${tp ? 'toàn phần' : 'xung quanh'}: ${a} × ${a} × ${tp ? 6 : 4} = <b>${(tp ? 6 : 4) * a * a}</b> cm².` }); },
        () => { const a = R.int(10, 25), b = R.int(6, a), c = R.int(6, 15), p = R.pick([25, 40, 50, 60, 75, 80]), V0 = a * b * c, w = V0 * p / 100; return mk({ text: `Một bể cá dạng hình hộp chữ nhật dài ${a} dm, rộng ${b} dm, cao ${c} dm. Lượng nước trong bể chiếm ${p}% thể tích bể. Hỏi trong bể có bao nhiêu lít nước?`, answer: dec(w), solution: `Thể tích bể: ${a} × ${b} × ${c} = ${V0} dm³. Lượng nước: ${V0} × ${p} : 100 = ${dec(w)} dm³ = <b>${dec(w)}</b> lít.` }); },
      ]);
    }
    return V(R, [
      () => { const n = R.int(3, 8), k = R.int(0, 3); const val = [(n - 2) ** 3, 6 * (n - 2) ** 2, 12 * (n - 2), 8][k]; const why = [`Các hình không được sơn nằm ở bên trong, tạo thành hình lập phương có mỗi cạnh ${n} − 2 = ${n - 2} hình: ${n - 2} × ${n - 2} × ${n - 2} = <b>${val}</b>.`, `Hình có đúng 1 mặt sơn nằm ở phần giữa mỗi mặt: mỗi mặt có ${n - 2} × ${n - 2} = ${(n - 2) ** 2} hình, 6 mặt: <b>${val}</b>.`, `Hình có đúng 2 mặt sơn nằm dọc các cạnh (trừ hai đầu): mỗi cạnh có ${n - 2} hình, 12 cạnh: ${n - 2} × 12 = <b>${val}</b>.`, `Hình có 3 mặt sơn nằm ở 8 đỉnh: <b>8</b>.`][k]; return mk({ text: `Một hình lập phương lớn được sơn kín các mặt ngoài rồi cắt thành ${n ** 3} hình lập phương nhỏ bằng nhau (mỗi cạnh chia thành ${n} phần). Hỏi có bao nhiêu hình lập phương nhỏ ${['không được sơn mặt nào', 'được sơn đúng 1 mặt', 'được sơn đúng 2 mặt', 'được sơn 3 mặt'][k]}?`, visual: figBox(`${n} phần`, `${n} phần`, `${n} phần`), answer: val, solution: why }); },
      () => { const a = R.int(4, 12), b = R.int(3, 10), h = R.int(2, 9); return mk({ text: `Một bể kính dạng hình hộp chữ nhật có đáy dài ${a} dm, rộng ${b} dm, đang chứa nước. Thả một hòn đá chìm hẳn vào bể thì mực nước dâng lên thêm ${h} cm (nước không tràn ra ngoài). Tính thể tích hòn đá (theo dm³).`, answer: dec(a * b * h / 10), solution: `Thể tích hòn đá bằng thể tích phần nước dâng lên. Đổi ${h} cm = ${dec(h / 10)} dm. V = ${a} × ${b} × ${dec(h / 10)} = <b>${dec(a * b * h / 10)}</b> dm³.` }); },
      () => { const b = R.int(3, 15), d = R.int(1, 8), a = b + d, h = R.int(2, 12), X = 2 * (a + b) * h; return mk({ text: `Một hình hộp chữ nhật có diện tích xung quanh ${X} cm², chiều cao ${h} cm, chiều dài hơn chiều rộng ${d} cm. Tính thể tích hình hộp (theo cm³).`, answer: a * b * h, solution: `Chu vi đáy: ${X} : ${h} = ${2 * (a + b)} cm, nửa chu vi ${a + b} cm. Chiều dài: (${a + b} + ${d}) : 2 = ${a} cm, chiều rộng ${b} cm. V = ${a} × ${b} × ${h} = <b>${a * b * h}</b> cm³.` }); },
    ]);
  }

  function geUnits(R, lv) {
    const conv = (v, f, t, m) => mk({ text: `Điền số thích hợp vào chỗ trống:<div class="seq">${dec(v)} ${f} = ${box} ${t}</div>`, answer: dec(v * m), solution: `${m >= 1 ? `1 ${f} = ${fmt(m)} ${t}` : `1 ${t} = ${fmt(Math.round(1 / m))} ${f}`}. Vậy ${dec(v)} ${f} = <b>${dec(v * m)}</b> ${t}.` });
    if (lv === 0) {
      return V(R, [
        () => conv(R.int(2, 99), 'm²', 'dm²', 100),
        () => conv(R.int(2, 99), 'dm²', 'cm²', 100),
        () => conv(R.int(2, 9), 'm²', 'cm²', 10000),
        () => conv(R.int(2, 99) * 100, 'cm²', 'dm²', 0.01),
        () => conv(R.int(2, 9), 'dm³', 'cm³', 1000),
      ]);
    }
    if (lv === 1) {
      return V(R, [
        () => conv(R.int(11, 99) / 10, 'm²', 'dm²', 100),
        () => conv(R.int(101, 999), 'dm²', 'm²', 0.01),
        () => conv(R.int(2, 30), 'ha', 'm²', 10000),
        () => conv(R.int(2, 9), 'km²', 'ha', 100),
        () => conv(R.int(11, 99) * 1000, 'm²', 'ha', 0.0001),
        () => { const a = R.int(1, 30), b = R.int(1, 99); return mk({ text: `Viết số thập phân thích hợp vào chỗ trống:<div class="seq">${a} m² ${b} dm² = ${box} m²</div>`, answer: dec(a + b / 100), solution: `1 dm² = 0,01 m² nên ${b} dm² = ${dec(b / 100)} m². Vậy ${a} m² ${b} dm² = <b>${dec(a + b / 100)}</b> m².` }); },
      ]);
    }
    return V(R, [
      () => conv(R.int(11, 99) / 10, 'm³', 'dm³', 1000),
      () => conv(R.int(101, 999), 'cm³', 'dm³', 0.001),
      () => conv(R.int(11, 99) / 10, 'm³', 'lít', 1000),
      () => conv(R.int(11, 999), 'dm³', 'm³', 0.001),
      () => { const a = R.int(1, 20), b = R.int(1, 999); return mk({ text: `Viết số thập phân thích hợp vào chỗ trống:<div class="seq">${a} m³ ${b} dm³ = ${box} m³</div>`, answer: dec(a + b / 1000), solution: `1 dm³ = 0,001 m³ nên ${b} dm³ = ${dec(b / 1000)} m³. Vậy ${a} m³ ${b} dm³ = <b>${dec(a + b / 1000)}</b> m³.` }); },
      () => { const a = R.int(2, 9), b = R.int(1, 99) * 10; return mk({ text: `Điền số thích hợp vào chỗ trống:<div class="seq">${a} lít ${b} ml = ${box} ml</div>`, answer: a * 1000 + b, solution: `1 lít = 1000 ml. ${a} lít ${b} ml = ${a * 1000} + ${b} = <b>${a * 1000 + b}</b> ml.` }); },
    ]);
  }

  function geTime(R, lv) {
    if (lv === 0) {
      const [u1, u2, m] = R.pick([['giờ', 'phút', 60], ['phút', 'giây', 60], ['ngày', 'giờ', 24], ['năm', 'tháng', 12], ['thế kỉ', 'năm', 100], ['tuần', 'ngày', 7]]);
      const v = R.int(2, 9);
      return mk({ text: `Điền số thích hợp vào chỗ trống:<div class="seq">${v} ${u1} = ${box} ${u2}</div>`, answer: v * m, solution: `1 ${u1} = ${m} ${u2}. ${v} ${u1} = ${v} × ${m} = <b>${v * m}</b> ${u2}.` });
    }
    if (lv === 1) {
      return V(R, [
        () => { const q = R.int(5, 30); return mk({ text: `Điền số thích hợp vào chỗ trống:<div class="seq">${dec(q / 4)} giờ = ${box} phút</div>`, answer: q * 15, solution: `${dec(q / 4)} giờ = ${dec(q / 4)} × 60 = <b>${q * 15}</b> phút.` }); },
        () => { const q = R.int(1, 19) * 3; return mk({ text: `Viết số thập phân thích hợp vào chỗ trống:<div class="seq">${q} phút = ${box} giờ</div>`, answer: dec(q / 60), solution: `${q} phút = ${q} : 60 giờ = <b>${dec(q / 60)}</b> giờ.` }); },
        () => { const a = R.int(60, 300), b = R.int(30, 200), T0 = a + b, ans = hm(T0); return mk({ type: 'choice', choices: choicesOf(R, ans, [hm(T0 + 60), hm(T0 - 60), hm(T0 + 10), hm(T0 - 10), hm(T0 + 40)]), text: `Tính:<div class="seq">${hm(a)} + ${hm(b)}</div>`, answer: ans, solution: `Cộng giờ với giờ, phút với phút; nếu số phút từ 60 trở lên thì đổi 60 phút = 1 giờ. Kết quả: <b>${ans}</b>.` }); },
        () => { const a = R.int(180, 500), b = R.int(30, a - 60), T0 = a - b, ans = hm(T0); return mk({ type: 'choice', choices: choicesOf(R, ans, [hm(T0 + 60), hm(T0 - 60), hm(T0 + 20), hm(T0 - 20), hm(T0 + 40)]), text: `Tính:<div class="seq">${hm(a)} − ${hm(b)}</div>`, answer: ans, solution: `Trừ giờ với giờ, phút với phút; nếu số phút không đủ trừ thì đổi 1 giờ = 60 phút. Kết quả: <b>${ans}</b>.` }); },
      ]);
    }
    return V(R, [
      () => { const a = R.int(70, 200), k = R.int(2, 6), T0 = a * k, ans = hm(T0); return mk({ type: 'choice', choices: choicesOf(R, ans, [hm(T0 + 60), hm(T0 - 60), hm(T0 + 30), hm(T0 - 30), hm(a * (k - 1))]), text: `Một người thợ làm một sản phẩm hết ${hm(a)}. Hỏi người đó làm ${k} sản phẩm như thế hết bao nhiêu thời gian?`, answer: ans, solution: `Nhân số giờ và số phút với ${k}: ${hm(a)} × ${k} = ${(a % 60) * k >= 60 ? `${Math.floor(a / 60) * k} giờ ${(a % 60) * k} phút. Đổi ${(a % 60) * k} phút = ${hm((a % 60) * k)}, được <b>${ans}</b>` : `<b>${ans}</b>`}.` }); },
      () => { const y = R.int(1001, 2099); return mk({ text: `Năm ${y} thuộc thế kỉ thứ mấy? (ghi số)`, answer: Math.ceil(y / 100), solution: `Thế kỉ thứ ${Math.ceil(y / 100)} gồm các năm từ ${(Math.ceil(y / 100) - 1) * 100 + 1} đến ${Math.ceil(y / 100) * 100}. Năm ${y} thuộc thế kỉ thứ <b>${Math.ceil(y / 100)}</b>.` }); },
      () => { const k = R.int(2, 6), q = R.int(2, 8), T0 = k * q * 15, ans = hm(q * 15); return mk({ type: 'choice', choices: choicesOf(R, ans, [hm(q * 15 + 15), hm(q * 15 + 30), hm(q * 15 + 45), hm(q * 15 + 60)]), text: `Một máy làm ${k} sản phẩm hết ${hm(T0)}. Hỏi trung bình máy làm một sản phẩm hết bao lâu?`, answer: ans, solution: `Đổi ${hm(T0)} = ${T0} phút. ${T0} : ${k} = ${q * 15} phút${q * 15 >= 60 ? ` = <b>${ans}</b>` : `. Đáp số <b>${ans}</b>`}.` }); },
      () => { const h = R.int(6, 9), m = R.pick([0, 15, 30, 45]), d = R.int(70, 260), T0 = h * 60 + m + d, ans = hm(T0); return mk({ type: 'choice', choices: choicesOf(R, ans, [hm(T0 + 60), hm(T0 - 60), hm(T0 + 15), hm(T0 - 15)]), text: `Một buổi học bắt đầu lúc ${hm(h * 60 + m)} và kéo dài ${hm(d)}. Hỏi buổi học kết thúc lúc mấy giờ?`, answer: ans, solution: `${hm(h * 60 + m)} + ${hm(d)} = <b>${ans}</b>.` }); },
    ]);
  }

  function geChange(R, lv) {
    if (lv === 2) {
      return V(R, [
        () => { const k = R.int(2, 6); return mk({ text: `Nếu tăng cạnh của một hình vuông lên gấp ${k} lần thì diện tích hình vuông tăng lên gấp bao nhiêu lần?`, answer: k * k, solution: `Diện tích = cạnh × cạnh. Cạnh gấp ${k} lần thì diện tích gấp ${k} × ${k} = <b>${k * k}</b> lần.` }); },
        () => { const a = R.int(2, 5), b = R.int(2, 5); return mk({ text: `Một hình chữ nhật, nếu tăng chiều dài lên gấp ${a} lần và tăng chiều rộng lên gấp ${b} lần thì diện tích tăng lên gấp bao nhiêu lần?`, answer: a * b, solution: `Diện tích mới = (dài × ${a}) × (rộng × ${b}) = dài × rộng × ${a * b}. Diện tích gấp <b>${a * b}</b> lần.` }); },
        () => { const L = R.int(10, 40), W = R.int(4, L - 1), x = R.int(2, 9); return mk({ text: `Một hình chữ nhật có chiều dài ${L} m. Nếu tăng chiều dài thêm ${x} m thì diện tích tăng thêm ${x * W} m². Tính diện tích hình chữ nhật ban đầu (theo m²).`, visual: figRect(`${L} m`, '?'), answer: L * W, solution: `Phần tăng thêm là hình chữ nhật có một cạnh ${x} m, cạnh kia bằng chiều rộng: ${x * W} : ${x} = ${W} m. Diện tích ban đầu: ${L} × ${W} = <b>${L * W}</b> m².` }); },
        () => { const a = R.int(4, 30), x = R.int(1, 6), y = 2 * a * x + x * x; return mk({ text: `Nếu tăng cạnh của một hình vuông thêm ${x} cm thì diện tích tăng thêm ${y} cm². Tính cạnh hình vuông ban đầu (theo cm).`, answer: a, solution: `Phần tăng thêm gồm 2 hình chữ nhật (cạnh ban đầu × ${x}) và 1 hình vuông nhỏ ${x} × ${x} = ${x * x} cm². Hai hình chữ nhật: ${y} − ${x * x} = ${y - x * x} cm², mỗi hình ${(y - x * x) / 2} cm². Cạnh: ${(y - x * x) / 2} : ${x} = <b>${a}</b> cm.` }); },
      ]);
    }
    return V(R, [
      () => { const p = R.pick([10, 20, 30, 40, 50]); return mk({ text: `Một hình chữ nhật, nếu tăng chiều dài thêm ${p}% và giảm chiều rộng đi ${p}% thì diện tích giảm đi bao nhiêu phần trăm? (chỉ ghi số)`, answer: p * p / 100, solution: `Diện tích mới = ${dec((100 + p) / 100)} × ${dec((100 - p) / 100)} = ${dec((100 + p) * (100 - p) / 10000)} lần diện tích cũ, tức ${dec((100 + p) * (100 - p) / 100)}%. Giảm đi 100% − ${dec((100 + p) * (100 - p) / 100)}% = <b>${dec(p * p / 100)}</b>%.` }); },
      () => { const p = R.pick([25, 100, 150, 300, 400]), d = 100 * p / (100 + p), g = gcd(100 + p, 100); return mk({ text: `Một hình chữ nhật, nếu tăng chiều dài thêm ${p}% thì phải giảm chiều rộng đi bao nhiêu phần trăm để diện tích không đổi? (chỉ ghi số)`, answer: d, solution: `Chiều dài mới bằng ${100 + p}% = ${fr((100 + p) / g, 100 / g)} chiều dài cũ. Để diện tích không đổi, chiều rộng mới phải bằng ${fr(100 / g, (100 + p) / g)} = ${100 - d}% chiều rộng cũ. Giảm đi <b>${d}</b>%.` }); },
      () => { const p = R.pick([10, 20, 30, 40, 50]), q = R.pick([10, 20, 30, 40, 50]), inc = p + q + p * q / 100; return mk({ text: `Một hình chữ nhật, nếu tăng chiều dài thêm ${p}% và tăng chiều rộng thêm ${q}% thì diện tích tăng thêm bao nhiêu phần trăm? (chỉ ghi số)`, answer: dec(inc), solution: `Diện tích mới = ${dec((100 + p) / 100)} × ${dec((100 + q) / 100)} = ${dec((100 + p) * (100 + q) / 10000)} lần diện tích cũ, tức ${dec((100 + p) * (100 + q) / 100)}%. Tăng thêm <b>${dec(inc)}</b>%.` }); },
      () => { const W = R.int(4, 20), L = W + R.int(2, 20), x = R.int(2, 8), y = (L + x) * (W + x) - L * W; return mk({ text: `Một hình chữ nhật có chiều dài hơn chiều rộng ${L - W} cm. Nếu tăng cả chiều dài và chiều rộng thêm ${x} cm thì diện tích tăng thêm ${y} cm². Tính diện tích hình chữ nhật ban đầu (theo cm²).`, answer: L * W, solution: `Phần tăng thêm = ${x} × (dài + rộng) + ${x} × ${x}. Nên ${x} × (dài + rộng) = ${y} − ${x * x} = ${y - x * x}, dài + rộng = ${L + W} cm. Chiều dài: (${L + W} + ${L - W}) : 2 = ${L} cm, chiều rộng ${W} cm. Diện tích: ${L} × ${W} = <b>${L * W}</b> cm².` }); },
    ]);
  }

  function geCompose(R, lv) {
    if (lv === 1) {
      return V(R, [
        () => { const a = R.int(12, 30), b = R.int(6, a - 3), c = R.int(2, Math.floor(a / 2)), d = R.int(2, Math.floor(b / 2)); return mk({ text: `Một tấm bìa hình chữ nhật dài ${a} cm, rộng ${b} cm. Người ta cắt đi một hình chữ nhật nhỏ ở góc dài ${c} cm, rộng ${d} cm. Tính diện tích phần bìa còn lại (theo cm²).`, visual: figCut(`${a} cm`, `${b} cm`, `${c} cm`, `${d} cm`), answer: a * b - c * d, solution: `Diện tích tấm bìa: ${a} × ${b} = ${a * b} cm². Phần cắt đi: ${c} × ${d} = ${c * d} cm². Còn lại: ${a * b} − ${c * d} = <b>${a * b - c * d}</b> cm².` }); },
        () => { const a = R.int(12, 30), b = R.int(6, a - 3), c = R.int(2, Math.floor(a / 2)), d = R.int(2, Math.floor(b / 2)); return mk({ text: `Một tấm bìa hình chữ nhật dài ${a} cm, rộng ${b} cm bị cắt đi một hình chữ nhật nhỏ ở góc (dài ${c} cm, rộng ${d} cm) như hình vẽ. Tính chu vi phần bìa còn lại (theo cm).`, visual: figCut(`${a} cm`, `${b} cm`, `${c} cm`, `${d} cm`), answer: 2 * (a + b), solution: `Khi cắt ở góc, hai đoạn mới tạo ra dài đúng bằng hai đoạn bị mất đi, nên chu vi không đổi: (${a} + ${b}) × 2 = <b>${2 * (a + b)}</b> cm.` }); },
        () => { for (;;) { const a = R.int(4, 15), h = R.int(3, 12); if ((a * h) % 2) continue; return mk({ text: `Một hình gồm một hình vuông cạnh ${a} cm và một hình tam giác có đáy là một cạnh của hình vuông, chiều cao ${h} cm (tam giác nằm ngoài hình vuông). Tính diện tích cả hình (theo cm²).`, answer: a * a + a * h / 2, solution: `Hình vuông: ${a} × ${a} = ${a * a} cm². Tam giác: ${a} × ${h} : 2 = ${a * h / 2} cm². Cả hình: ${a * a} + ${a * h / 2} = <b>${a * a + a * h / 2}</b> cm².` }); } },
      ]);
    }
    if (lv === 2) {
      return V(R, [
        () => { const a = R.int(15, 40), b = R.int(10, a), x = R.int(1, 3); return mk({ text: `Một mảnh vườn hình chữ nhật dài ${a} m, rộng ${b} m. Người ta làm hai lối đi rộng ${x} m, một lối song song với chiều dài, một lối song song với chiều rộng, cắt nhau ở giữa vườn. Tính diện tích phần đất còn lại để trồng rau (theo m²).`, answer: (a - x) * (b - x), solution: `Dồn bốn mảnh đất trồng rau lại sát nhau, ta được hình chữ nhật dài ${a} − ${x} = ${a - x} m, rộng ${b} − ${x} = ${b - x} m. Diện tích: ${a - x} × ${b - x} = <b>${(a - x) * (b - x)}</b> m².` }); },
        () => { const a = R.int(15, 40), b = R.int(10, a), x = R.int(1, 3); return mk({ text: `Một mảnh vườn hình chữ nhật dài ${a} m, rộng ${b} m. Người ta làm một lối đi rộng ${x} m chạy sát bên trong xung quanh vườn. Tính diện tích lối đi (theo m²).`, answer: a * b - (a - 2 * x) * (b - 2 * x), solution: `Phần bên trong lối đi là hình chữ nhật dài ${a} − ${2 * x} = ${a - 2 * x} m, rộng ${b} − ${2 * x} = ${b - 2 * x} m, diện tích ${(a - 2 * x) * (b - 2 * x)} m². Lối đi: ${a * b} − ${(a - 2 * x) * (b - 2 * x)} = <b>${a * b - (a - 2 * x) * (b - 2 * x)}</b> m².` }); },
        () => { const r = R.int(2, 6), a = 2 * r + R.int(2, 10), b = 2 * r + R.int(1, 8); return mk({ text: `Một tấm tôn hình chữ nhật dài ${a} dm, rộng ${b} dm. Người ta khoét đi một lỗ hình tròn bán kính ${r} dm. Tính diện tích tấm tôn còn lại (lấy π ≈ 3,14; theo dm²).`, answer: dec(a * b - r * r * 3.14), solution: `Tấm tôn: ${a} × ${b} = ${a * b} dm². Lỗ tròn: ${r} × ${r} × 3,14 = ${dec(r * r * 3.14)} dm². Còn lại: ${a * b} − ${dec(r * r * 3.14)} = <b>${dec(a * b - r * r * 3.14)}</b> dm².` }); },
      ]);
    }
    return V(R, [
      () => { const S = 2 * R.int(10, 200); return mk({ text: `Một hình vuông lớn có diện tích ${S} cm². Vẽ hình tròn tiếp xúc bốn cạnh của hình vuông, rồi vẽ hình vuông nhỏ có bốn đỉnh nằm trên hình tròn (như hình). Tính diện tích hình vuông nhỏ (theo cm²).`, visual: figSqCircle('', true), answer: S / 2, solution: `Hai đường chéo của hình vuông nhỏ đều là đường kính, bằng cạnh hình vuông lớn. Kẻ hai đường chéo đó, hình vuông lớn được chia thành 8 tam giác bằng nhau, hình vuông nhỏ gồm 4 tam giác. Diện tích hình vuông nhỏ: ${S} : 2 = <b>${S / 2}</b> cm².` }); },
      () => { const r = R.int(2, 10); return mk({ text: `Một hình tròn có bán kính ${r} cm. Bên trong vẽ hình vuông có bốn đỉnh nằm trên hình tròn. Tính diện tích phần hình tròn nằm ngoài hình vuông (lấy π ≈ 3,14; theo cm²).`, visual: figSqCircle(`r = ${r} cm`, true, true), answer: dec(r * r * 1.14), solution: `Hình vuông có đường chéo bằng đường kính ${2 * r} cm. Diện tích hình vuông = đường chéo × đường chéo : 2 = ${2 * r} × ${2 * r} : 2 = ${2 * r * r} cm². Hình tròn: ${r} × ${r} × 3,14 = ${dec(r * r * 3.14)} cm². Phần ngoài: ${dec(r * r * 3.14)} − ${2 * r * r} = <b>${dec(r * r * 1.14)}</b> cm².` }); },
      () => { const a = 2 * R.int(2, 10), r = a / 2; return mk({ text: `Một hình vuông có cạnh ${a} cm. Tại mỗi đỉnh của hình vuông vẽ một phần tư hình tròn có bán kính ${r} cm (bằng nửa cạnh) nằm trong hình vuông. Tính diện tích phần hình vuông nằm ngoài bốn phần tư hình tròn (lấy π ≈ 3,14; theo cm²).`, answer: dec(a * a - r * r * 3.14), solution: `Bốn phần tư hình tròn ghép lại được một hình tròn bán kính ${r} cm: ${r} × ${r} × 3,14 = ${dec(r * r * 3.14)} cm². Phần còn lại: ${a * a} − ${dec(r * r * 3.14)} = <b>${dec(a * a - r * r * 3.14)}</b> cm².` }); },
    ]);
  }

  function geCountFig(R, lv) {
    if (lv === 1) {
      const n = R.int(3, 7);
      return mk({ text: `Từ một đỉnh, kẻ ${n} đoạn thẳng xuống cạnh đáy như hình. Hình vẽ có bao nhiêu hình tam giác?`, visual: svgFan(n, 1), answer: C2(n), solution: `Mỗi tam giác ứng với một cặp đoạn thẳng xuất phát từ đỉnh. Số cặp: ${range(1, n - 1).reverse().join(' + ')} = <b>${C2(n)}</b>.` });
    }
    const n = R.int(lv === 2 ? 3 : 4, lv === 2 ? 5 : 7), L = R.int(2, lv === 2 ? 3 : 4);
    if (R.chance(0.5)) return mk({ text: `Hình vẽ có bao nhiêu hình tam giác?`, visual: svgFan(n, L), answer: C2(n) * L, solution: `Có ${n} đoạn thẳng xuất phát từ đỉnh; mỗi đoạn nằm ngang tạo với chúng ${range(1, n - 1).reverse().join(' + ')} = ${C2(n)} tam giác. Có ${L} đoạn nằm ngang (kể cả đáy): ${C2(n)} × ${L} = <b>${C2(n) * L}</b> tam giác.` });
    return mk({ text: `Hình vẽ có bao nhiêu hình thang?`, visual: svgFan(n, L), answer: C2(n) * C2(L), solution: `Mỗi hình thang được tạo bởi 2 đoạn thẳng xuất phát từ đỉnh (có ${C2(n)} cách chọn) và 2 đoạn nằm ngang (chọn trong ${L} đoạn: ${C2(L)} cách). Số hình thang: ${C2(n)} × ${C2(L)} = <b>${C2(n) * C2(L)}</b>.` });
  }

  // =====================================================================
  // TƯ DUY LOGIC
  // =====================================================================
  function loSeq0(R) {
    return V(R, [
      () => { const s = R.pick([2, 5, 3, 4]), a = R.int(1, 20), t = range(0, 4).map(i => a + s * i); return mk({ text: `Tìm số tiếp theo của dãy số:${seqOf([...t.map(x => dec(x / 10)), '?'])}`, answer: dec((t[4] + s) / 10), solution: `Mỗi số hơn số trước ${dec(s / 10)}. Số tiếp theo: ${dec(t[4] / 10)} + ${dec(s / 10)} = <b>${dec((t[4] + s) / 10)}</b>.` }); },
      () => { const s = R.int(3, 12), a = R.int(1, 30), t = range(0, 4).map(i => a + s * i); return mk({ text: `Tìm số tiếp theo của dãy số:${seqOf([...t, '?'])}`, answer: a + 5 * s, solution: `Mỗi số hơn số trước ${s}. Số tiếp theo: ${t[4]} + ${s} = <b>${a + 5 * s}</b>.` }); },
      () => { const a = R.int(1, 3), k = R.pick([2, 3]), t = range(0, 4).map(i => a * k ** i); return mk({ text: `Tìm số tiếp theo của dãy số:${seqOf([...t, '?'])}`, answer: t[4] * k, solution: `Mỗi số gấp ${k} lần số trước. Số tiếp theo: ${t[4]} × ${k} = <b>${t[4] * k}</b>.` }); },
    ]);
  }

  function loOrder0(R) {
    const ps = R.sample(NAMES, 4), [unit, word, most] = R.pick([['m', 'cao', 'cao nhất'], ['kg', 'nặng', 'nặng nhất'], ['m', 'nhảy xa', 'nhảy xa nhất']]);
    const base = R.int(25, 40);
    const pool = unit === 'kg' ? [5, 2, 8, 10, 9].map(x => base + x / 10) : [125, 130, 132, 128, 140, 119].map(x => x / 100);
    const vals = R.sample(pool, 4), best = vals.indexOf(Math.max(...vals));
    const stat = ps.map((p, i) => `${p} ${word} ${dec(vals[i])} ${unit}`).join('; ');
    return mk({ type: 'choice', choices: R.shuffle(ps.slice()), text: `${stat}. Bạn nào ${most}?`, answer: ps[best], solution: `So sánh các số thập phân: ${vals.slice().sort((a, b) => b - a).map(dec).join(' > ')}. Bạn ${most} là <b>${ps[best]}</b>.` });
  }

  function loSeq(R, lv) {
    if (lv === 1) {
      return V(R, [
        () => { const a = R.int(1, 20), d = R.int(2, 9), n = R.int(20, 100); return mk({ text: `Cho dãy số:${seqOf([a, a + d, a + 2 * d, a + 3 * d, '...'])}Tìm số hạng thứ ${n} của dãy.`, answer: a + (n - 1) * d, solution: `Dãy cách đều ${d}. Số hạng thứ ${n} = số đầu + (${n} − 1) × ${d} = ${a} + ${n - 1} × ${d} = <b>${a + (n - 1) * d}</b>.` }); },
        () => { const a = R.int(1, 20), d = R.int(2, 9), n = R.int(15, 80), b = a + (n - 1) * d; return mk({ text: `Dãy số sau có bao nhiêu số hạng?${seqOf([a, a + d, a + 2 * d, '...', b])}`, answer: n, solution: `Số số hạng = (số cuối − số đầu) : khoảng cách + 1 = (${b} − ${a}) : ${d} + 1 = <b>${n}</b>.` }); },
        () => { const a = R.int(1, 9), d = R.int(1, 5), t = [a]; for (let i = 1; i < 6; i++) t.push(t[i - 1] + d * i); return mk({ text: `Tìm số tiếp theo của dãy số:${seqOf([...t.slice(0, 5), '?'])}`, answer: t[5], solution: `Khoảng cách giữa hai số liền nhau: ${range(1, 4).map(i => d * i).join(', ')}, ... mỗi lần tăng thêm ${d}. Số tiếp theo: ${t[4]} + ${5 * d} = <b>${t[5]}</b>.` }); },
      ]);
    }
    if (lv === 2) {
      return V(R, [
        () => { const a = R.int(1, 20), d = R.int(2, 9), n = R.int(10, 40), b = a + (n - 1) * d; return mk({ text: `Tính tổng:<div class="seq">${a} + ${a + d} + ${a + 2 * d} + ... + ${b}</div>`, answer: (a + b) * n / 2, solution: `Số số hạng: (${b} − ${a}) : ${d} + 1 = ${n}. Tổng = (số đầu + số cuối) × số số hạng : 2 = (${a} + ${b}) × ${n} : 2 = <b>${(a + b) * n / 2}</b>.` }); },
        () => { const a = R.int(1, 5), b = R.int(1, 5), t = [a, b]; for (let i = 2; i < 8; i++) t.push(t[i - 1] + t[i - 2]); return mk({ text: `Tìm số tiếp theo của dãy số:${seqOf([...t.slice(0, 7), '?'])}`, answer: t[7], solution: `Từ số thứ ba, mỗi số bằng tổng hai số đứng ngay trước nó. Số tiếp theo: ${t[5]} + ${t[6]} = <b>${t[7]}</b>.` }); },
        () => { const n = R.int(10, 30); return R.chance(0.5) ? mk({ text: `Cho dãy số:${seqOf([1, 4, 9, 16, 25, '...'])}Tìm số hạng thứ ${n}.`, answer: n * n, solution: `Số hạng thứ k bằng k × k (1 × 1, 2 × 2, 3 × 3, ...). Số hạng thứ ${n}: ${n} × ${n} = <b>${n * n}</b>.` }) : mk({ text: `Cho dãy số:${seqOf([2, 6, 12, 20, 30, '...'])}Tìm số hạng thứ ${n}.`, answer: n * (n + 1), solution: `Số hạng thứ k bằng k × (k + 1): 1 × 2, 2 × 3, 3 × 4, ... Số hạng thứ ${n}: ${n} × ${n + 1} = <b>${n * (n + 1)}</b>.` }); },
      ]);
    }
    return V(R, [
      () => { const k = R.int(40, 400); let s = ''; for (let i = 1; s.length < k; i++) s += i; const d = +s[k - 1]; const sol = k <= 189 ? `9 chữ số đầu là 1 – 9. Còn ${k - 9} chữ số thuộc các số có hai chữ số (10, 11, ...): ${k - 9} = 2 × ${Math.floor((k - 10) / 2)} + ${((k - 10) % 2) + 1}, đó là chữ số thứ ${((k - 10) % 2) + 1} của số ${10 + Math.floor((k - 10) / 2)}: <b>${d}</b>.` : `Các số 1 – 9 dùng 9 chữ số, 10 – 99 dùng 180 chữ số (cộng 189). Còn ${k - 189} chữ số thuộc các số có ba chữ số (100, 101, ...): đó là chữ số thứ ${((k - 190) % 3) + 1} của số ${100 + Math.floor((k - 190) / 3)}: <b>${d}</b>.`; return mk({ text: `Viết liên tiếp các số tự nhiên bắt đầu từ 1 thành một dãy chữ số:<div class="seq">123456789101112131415...</div>Chữ số thứ ${k} là chữ số nào?`, answer: d, solution: sol }); },
      () => { const m = R.pick([3, 4, 5]), n = R.int(30, 200); let c = 0, x = 0; while (c < n) { x++; if (x % m) c++; } const first = range(1, 3 * m).filter(y => y % m).slice(0, m + 1), g = Math.floor((n - 1) / (m - 1)), rest = n - (m - 1) * g; return mk({ text: `Dãy các số tự nhiên không chia hết cho ${m}:${seqOf([...first, '...'])}Số hạng thứ ${n} của dãy là số nào?`, answer: x, solution: `Cứ ${m} số tự nhiên liên tiếp thì có ${m - 1} số thuộc dãy. ${n} = ${m - 1} × ${g} + ${rest}. Hết ${g} nhóm (đến số ${m * g}), đếm thêm ${rest} số thuộc dãy được <b>${x}</b>.` }); },
      () => { const a = R.int(1, 9), d = R.int(2, 6), n = R.int(30, 120), X = a + R.int(10, n - 1) * d + R.pick([0, 1]), inn = (X - a) % d === 0; return mk({ type: 'choice', choices: ['Có', 'Không'], text: `Cho dãy số ${a}; ${a + d}; ${a + 2 * d}; ${a + 3 * d}; ... Số ${X} có thuộc dãy này không?`, answer: inn ? 'Có' : 'Không', solution: `Các số trong dãy chia cho ${d} đều dư ${a % d}. ${X} chia cho ${d} dư ${X % d} nên câu trả lời là <b>${inn ? 'Có' : 'Không'}</b>${inn ? ` (là số hạng thứ ${(X - a) / d + 1})` : ''}.` }); },
    ]);
  }

  function loCycle(R, lv) {
    if (lv === 0) {
      const base = R.sample(SHAPES, 4), pat = R.pick([base.slice(0, 3), [base[0], base[1], base[1]], base.slice(0, 2)]), k = pat.length;
      const L = 2 * k + R.int(0, k - 1), ans = pat[L % k];
      return mk({ type: 'choice', choices: choicesOf(R, ans, base), text: `Hình tiếp theo là hình nào?<div class="seq emoji">${range(0, L - 1).map(i => pat[i % k]).join(' ')} ?</div>`, answer: ans, solution: `Nhóm ${pat.join('')} lặp lại liên tục. Hình tiếp theo là <b>${ans}</b>.` });
    }
    const word = R.pick(['TOAN', 'TIMO', 'HOCGIOI', 'VIETNAM', 'OLYMPIC', 'SAOMAI']), k = word.length;
    const n = R.int(lv === 1 ? 30 : 200, lv === 1 ? 150 : 2026);
    const rep = word.repeat(3) + '...';
    if (lv === 1 || R.chance(0.5)) {
      const ans = word[(n - 1) % k], r = n % k;
      return mk({ type: 'choice', choices: choicesOf(R, ans, [...new Set(word)]), text: `Viết lặp lại liên tiếp chữ <b>${word}</b>:<div class="seq">${rep}</div>Chữ cái thứ ${n} là chữ gì?`, answer: ans, solution: `Mỗi nhóm có ${k} chữ cái. ${n} = ${k} × ${Math.floor(n / k)} + ${r}. ${r === 0 ? `Chữ thứ ${n} là chữ cuối của nhóm` : `Chữ thứ ${n} là chữ thứ ${r} của nhóm`}: <b>${ans}</b>.` });
    }
    const ch = R.pick([...new Set(word)]), per = [...word].filter(c => c === ch).length, q = Math.floor(n / k), r = n % k, extra = [...word.slice(0, r)].filter(c => c === ch).length, ans = q * per + extra;
    return mk({ text: `Viết lặp lại liên tiếp chữ <b>${word}</b>:<div class="seq">${rep}</div>Trong ${n} chữ cái đầu tiên có bao nhiêu chữ <b>${ch}</b>?`, answer: ans, solution: `${n} = ${k} × ${q} + ${r}: có ${q} nhóm đủ và ${r} chữ cái lẻ${r ? ` (${word.slice(0, r)})` : ''}. Mỗi nhóm có ${per} chữ ${ch}, phần lẻ có ${extra} chữ ${ch}. Tổng: ${q} × ${per} + ${extra} = <b>${ans}</b>.` });
  }

  const dow = (y, m, d) => new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  function loCalendar(R, lv) {
    if (lv === 1) {
      const d = R.int(0, 6), n = R.int(10, 100), ans = DAYS[(d + n) % 7];
      return mk({ type: 'choice', choices: choicesOf(R, ans, DAYS), text: `Hôm nay là ${low(DAYS[d])}. Hỏi ${n} ngày nữa là thứ mấy?`, answer: ans, solution: `Cứ 7 ngày thì lặp lại thứ cũ. ${n} = 7 × ${Math.floor(n / 7)} + ${n % 7}. Từ ${low(DAYS[d])} đếm thêm ${n % 7} ngày: <b>${ans}</b>.` });
    }
    if (lv === 2) {
      return V(R, [
        () => { const y = R.int(2020, 2035), m = R.pick([1, 3, 5, 7, 8, 10, 12, 4, 6, 9, 11]), a = R.int(1, 9), b = R.int(a + 8, 30), w = dow(y, m, a), ans = DAYS[(w + b - a) % 7]; return mk({ type: 'choice', choices: choicesOf(R, ans, DAYS), text: `Ngày ${a} tháng ${m} năm ${y} là ${low(DAYS[w])}. Hỏi ngày ${b} tháng ${m} năm đó là thứ mấy?`, answer: ans, solution: `Từ ngày ${a} đến ngày ${b} cách nhau ${b - a} ngày = 7 × ${Math.floor((b - a) / 7)} + ${(b - a) % 7}. Từ ${low(DAYS[w])} đếm thêm ${(b - a) % 7} ngày: <b>${ans}</b>.` }); },
        () => { const y = R.pick([2024, 2025, 2026, 2027, 2028, 2030, 2032, 2100, 2000, 1900, 2036]), ans = leap(y) ? 366 : 365; return mk({ text: `Năm ${y} có bao nhiêu ngày?`, answer: ans, solution: `Năm nhuận là năm chia hết cho 4 nhưng không chia hết cho 100, hoặc năm chia hết cho 400. Năm ${y} ${leap(y) ? 'là' : 'không phải'} năm nhuận nên có <b>${ans}</b> ngày.` }); },
        () => { const y = R.pick([2024, 2025, 2026, 2027, 2028, 2030, 2032, 2100, 2000, 2036]), ans = leap(y) ? 29 : 28; return mk({ text: `Tháng 2 năm ${y} có bao nhiêu ngày?`, answer: ans, solution: `Năm ${y} ${leap(y) ? 'là' : 'không phải'} năm nhuận (năm nhuận chia hết cho 4, trừ các năm tròn trăm không chia hết cho 400). Tháng 2 có <b>${ans}</b> ngày.` }); },
      ]);
    }
    return V(R, [
      () => { const y = R.int(2020, 2035), m = R.int(3, 12), w = dow(y, 1, 1), MD = MONTH_DAYS(y), days = sum(MD.slice(0, m - 1)), ans = DAYS[dow(y, m, 1)]; return mk({ type: 'choice', choices: choicesOf(R, ans, DAYS), text: `Ngày 1 tháng 1 năm ${y} là ${low(DAYS[w])}. Hỏi ngày 1 tháng ${m} năm ${y} là thứ mấy?`, answer: ans, solution: `Năm ${y} ${leap(y) ? 'là' : 'không phải'} năm nhuận (tháng 2 có ${MD[1]} ngày). Từ 1/1 đến 1/${m} có ${MD.slice(0, m - 1).join(' + ')} = ${days} ngày = 7 × ${Math.floor(days / 7)} + ${days % 7}. Từ ${low(DAYS[w])} đếm thêm ${days % 7} ngày: <b>${ans}</b>.` }); },
      () => { const W = R.int(0, 6), d = R.int(3, 29), ans = DAYS[(W + (d - 2)) % 7]; return mk({ type: 'choice', choices: choicesOf(R, ans, DAYS), text: `Trong một tháng có ba ngày ${low(DAYS[W])} là ngày chẵn. Hỏi ngày ${d} của tháng đó là thứ mấy?`, answer: ans, solution: `Hai ngày ${low(DAYS[W])} liên tiếp cách nhau 7 ngày nên ngày chẵn, ngày lẻ xen kẽ. Ba ngày chẵn phải là ngày 2, 16, 30 (nếu bắt đầu từ ngày 4 thì ngày thứ ba là 32, không có). Ngày 2 là ${low(DAYS[W])}; ngày ${d} cách ngày 2 là ${d - 2} ngày = 7 × ${Math.floor((d - 2) / 7)} + ${(d - 2) % 7}. Ngày ${d} là <b>${ans}</b>.` }); },
      () => { const y = R.int(2020, 2035), w = dow(y, 1, 1), ans = DAYS[dow(y + 1, 1, 1)], days = leap(y) ? 366 : 365; return mk({ type: 'choice', choices: choicesOf(R, ans, DAYS), text: `Ngày 1 tháng 1 năm ${y} là ${low(DAYS[w])}. Hỏi ngày 1 tháng 1 năm ${y + 1} là thứ mấy?`, answer: ans, solution: `Năm ${y} có ${days} ngày = 7 × 52 + ${days - 364}. Từ ${low(DAYS[w])} đếm thêm ${days - 364} ngày: <b>${ans}</b>.` }); },
    ]);
  }

  function loAge(R, lv) {
    const A = R.pick(NAMES);
    if (lv === 0) {
      return V(R, [
        () => { const a = R.int(8, 12), d = R.int(22, 35), n = R.int(2, 10); return mk({ text: `Năm nay ${A} ${a} tuổi, bố hơn ${A} ${d} tuổi. Hỏi ${n} năm nữa bố bao nhiêu tuổi?`, answer: a + d + n, solution: `Năm nay bố: ${a} + ${d} = ${a + d} tuổi. ${n} năm nữa: ${a + d} + ${n} = <b>${a + d + n}</b> tuổi.` }); },
        () => { const a = R.int(8, 12), d = R.int(22, 35); return mk({ text: `Năm nay ${A} ${a} tuổi, mẹ hơn ${A} ${d} tuổi. Hỏi tổng số tuổi của hai mẹ con là bao nhiêu?`, answer: 2 * a + d, solution: `Mẹ: ${a} + ${d} = ${a + d} tuổi. Tổng: ${a} + ${a + d} = <b>${2 * a + d}</b> tuổi.` }); },
      ]);
    }
    if (lv === 1) {
      return V(R, [
        () => { const c = R.int(5, 14), d = R.int(22, 35), askC = R.chance(0.5); return mk({ text: `Tổng số tuổi của mẹ và ${A} là ${2 * c + d} tuổi. Mẹ hơn ${A} ${d} tuổi. Hỏi ${askC ? A : 'mẹ'} bao nhiêu tuổi?`, answer: askC ? c : c + d, solution: askC ? `Tuổi ${A} = (tổng − hiệu) : 2 = (${2 * c + d} − ${d}) : 2 = <b>${c}</b>.` : `Tuổi mẹ = (tổng + hiệu) : 2 = (${2 * c + d} + ${d}) : 2 = <b>${c + d}</b>.` }); },
        () => { for (;;) { const k = R.int(3, 7), c = R.int(5, 12), d = (k - 1) * c; if (d < 18 || d > 45) continue; return mk({ text: `Năm nay bố gấp ${k} lần tuổi ${A}, bố hơn ${A} ${d} tuổi. Hỏi năm nay ${A} bao nhiêu tuổi?`, answer: c, solution: `Tuổi ${A} 1 phần, tuổi bố ${k} phần, hơn nhau ${k - 1} phần = ${d} tuổi. Tuổi ${A}: ${d} : ${k - 1} = <b>${c}</b>.` }); } },
        () => { const c = R.int(5, 12), d = R.int(22, 35), n = R.int(3, 10); return mk({ text: `Năm nay ${A} ${c} tuổi, mẹ ${c + d} tuổi. Hỏi bao nhiêu năm nữa thì tổng số tuổi hai mẹ con là ${2 * c + d + 2 * n} tuổi?`, answer: n, solution: `Tổng hiện nay: ${c} + ${c + d} = ${2 * c + d}. Mỗi năm tổng tăng 2 tuổi. Cần tăng ${2 * n} tuổi: ${2 * n} : 2 = <b>${n}</b> năm.` }); },
      ]);
    }
    if (lv === 2) {
      return V(R, [
        () => { for (;;) { const C = R.int(4, 12), k = R.int(3, 7), n = R.int(2, 20), M = k * C, m = (M + n) / (C + n); if (!Number.isInteger(m) || m < 2 || m >= k || M - C < 18 || M - C > 40) continue; return mk({ text: `Hiện nay tuổi mẹ gấp ${k} lần tuổi ${A}. Sau ${n} năm nữa, tuổi mẹ gấp ${m} lần tuổi ${A}. Hỏi hiện nay ${A} bao nhiêu tuổi?`, answer: C, solution: `Hiệu số tuổi không đổi. Gọi tuổi ${A} hiện nay là 1 phần thì hiệu tuổi là ${k - 1} phần. Sau ${n} năm, tuổi mẹ gấp ${m} lần tuổi ${A} nên hiệu tuổi = ${m - 1} × (1 phần + ${n}) = ${m - 1} phần + ${(m - 1) * n}. Vậy ${k - 1} − ${m - 1} = ${k - m} phần ứng với ${(m - 1) * n} tuổi, một phần = ${(m - 1) * n} : ${k - m} = <b>${C}</b>. Hiện nay ${A} ${C} tuổi.` }); } },
        () => { const c1 = R.int(4, 10), d = R.int(2, 8), S = 2 * c1 + d, n = R.int(3, 10); return mk({ text: `Sau ${n} năm nữa, tổng số tuổi của hai anh em là ${S + 2 * n}. Hiện nay anh hơn em ${d} tuổi. Hỏi hiện nay em bao nhiêu tuổi?`, answer: c1, solution: `Tổng tuổi hiện nay: ${S + 2 * n} − ${n} × 2 = ${S}. Tuổi em: (${S} − ${d}) : 2 = <b>${c1}</b>.` }); },
        () => { const c = R.int(6, 12), b = c + R.int(24, 35), g = R.int(55, 70), t = g + b + c, k = R.int(3, 8); return mk({ text: `Tổng số tuổi của ông, bố và ${A} hiện nay là ${t} tuổi. Hỏi ${k} năm nữa, tổng số tuổi của ba người là bao nhiêu?`, answer: t + 3 * k, solution: `Mỗi năm mỗi người thêm 1 tuổi, ba người thêm 3 tuổi. Sau ${k} năm: ${t} + 3 × ${k} = <b>${t + 3 * k}</b> tuổi.` }); },
      ]);
    }
    return V(R, [
      () => { for (;;) { const C0 = R.int(2, 10), a = R.int(4, 9), b = R.int(2, a - 1), d = (a - 1) * C0; if (d % (b - 1)) continue; const s = d / (b - 1) - C0; if (s < 2 || d < 20 || d > 40) continue; const n = R.int(1, s - 1), m = s - n, C = C0 + n; return mk({ text: `Cách đây ${n} năm, tuổi bố gấp ${a} lần tuổi ${A}. Sau ${m} năm nữa, tuổi bố gấp ${b} lần tuổi ${A}. Hỏi hiện nay ${A} bao nhiêu tuổi?`, answer: C, solution: `Hiệu số tuổi không đổi. Gọi tuổi ${A} cách đây ${n} năm là 1 phần thì hiệu tuổi là ${a - 1} phần. Từ lúc đó đến ${m} năm nữa là ${n + m} năm, khi ấy tuổi ${A} là 1 phần + ${n + m} và hiệu tuổi = ${b - 1} × (1 phần + ${n + m}) = ${b - 1} phần + ${(b - 1) * (n + m)}. Vậy ${a - b} phần ứng với ${(b - 1) * (n + m)}, một phần = ${C0}. Hiện nay ${A}: ${C0} + ${n} = <b>${C}</b> tuổi.` }); } },
      () => { const e = R.int(4, 12), d = R.int(2, 8), an = e + d, S = e + an; return mk({ text: `Tổng số tuổi hai anh em hiện nay là ${S}. Khi tuổi em bằng tuổi anh hiện nay thì tổng số tuổi hai anh em là ${S + 2 * d}. Hỏi hiện nay anh bao nhiêu tuổi?`, answer: an, solution: `Khi em bằng tuổi anh hiện nay thì đã qua một số năm đúng bằng hiệu số tuổi; mỗi năm tổng tăng 2. Tổng tăng ${2 * d} nên đã qua ${d} năm, tức anh hơn em ${d} tuổi. Tuổi anh: (${S} + ${d}) : 2 = <b>${an}</b>.` }); },
      () => { const c = R.int(5, 12), k = R.int(3, 6), B = k * c, n = R.int(2, 6), S2 = B + c + 2 * n; return mk({ text: `Hiện nay tuổi bố gấp ${k} lần tuổi ${A}. Sau ${n} năm nữa, tổng số tuổi hai bố con là ${S2}. Hỏi hiện nay bố bao nhiêu tuổi?`, answer: B, solution: `Tổng tuổi hiện nay: ${S2} − ${n} × 2 = ${B + c}. Tuổi con 1 phần, bố ${k} phần, tổng ${k + 1} phần. Một phần: ${B + c} : ${k + 1} = ${c}. Bố: ${c} × ${k} = <b>${B}</b> tuổi.` }); },
    ]);
  }

  function loAssume(R, lv) {
    if (lv === 1) {
      const c = R.int(3, 30), d = R.int(3, 30), H = c + d, L = 2 * c + 4 * d, askD = R.chance(0.5);
      return mk({ text: `Vừa gà vừa chó có ${H} con, đếm được ${L} cái chân. Hỏi có bao nhiêu con ${askD ? 'chó' : 'gà'}?`, answer: askD ? d : c, solution: `Giả sử cả ${H} con đều là gà thì có ${H} × 2 = ${2 * H} chân, thiếu ${L} − ${2 * H} = ${L - 2 * H} chân. Mỗi con chó hơn con gà 2 chân nên số chó: ${L - 2 * H} : 2 = ${d}.${askD ? ` Có <b>${d}</b> con chó.` : ` Số gà: ${H} − ${d} = <b>${c}</b> con.`}` });
    }
    if (lv === 2) {
      return V(R, [
        () => { const a = R.int(3, 25), b = R.int(3, 25), N = a + b, W = 2 * a + 3 * b; return mk({ text: `Trong bãi có ${N} chiếc xe gồm xe đạp (2 bánh) và xe xích lô (3 bánh), tổng cộng ${W} bánh xe. Hỏi có bao nhiêu xe xích lô?`, answer: b, solution: `Giả sử cả ${N} xe đều là xe đạp: ${N} × 2 = ${2 * N} bánh, thiếu ${W} − ${2 * N} = ${W - 2 * N} bánh. Mỗi xích lô hơn xe đạp 1 bánh, nên có <b>${b}</b> xe xích lô.` }); },
        () => { const n = R.pick([10, 15, 20, 25]), a = R.pick([4, 5, 10]), b = R.pick([1, 2, 3]), x = R.int(Math.ceil(n * b / (a + b)) + 1, n), P = a * x - b * (n - x); return mk({ text: `Một bài thi có ${n} câu. Mỗi câu đúng được ${a} điểm, mỗi câu sai bị trừ ${b} điểm. ${R.pick(NAMES)} làm tất cả các câu và được ${P} điểm. Hỏi bạn ấy làm đúng bao nhiêu câu?`, answer: x, solution: `Giả sử đúng cả ${n} câu: ${n} × ${a} = ${n * a} điểm, hơn thực tế ${n * a} − ${P} = ${n * a - P} điểm. Mỗi câu sai thay vì đúng làm mất ${a} + ${b} = ${a + b} điểm. Số câu sai: ${n * a - P} : ${a + b} = ${n - x}. Số câu đúng: ${n} − ${n - x} = <b>${x}</b>.` }); },
        () => { const a = R.int(2, 15), b = R.int(2, 15), N = a + b, T0 = 2000 * a + 5000 * b; return mk({ text: `${R.pick(NAMES)} có ${N} tờ tiền gồm loại 2.000 đồng và 5.000 đồng, tổng cộng ${fmt(T0)} đồng. Hỏi có bao nhiêu tờ loại 5.000 đồng?`, answer: b, solution: `Giả sử cả ${N} tờ là loại 2.000 đồng: ${fmt(2000 * N)} đồng, thiếu ${fmt(T0 - 2000 * N)} đồng. Mỗi tờ 5.000 đồng hơn tờ 2.000 đồng là 3.000 đồng. Số tờ 5.000 đồng: ${fmt(T0 - 2000 * N)} : 3.000 = <b>${b}</b>.` }); },
      ]);
    }
    return V(R, [
      () => { for (;;) { const c = R.int(5, 40), d = R.int(5, 40), X = 4 * d - 2 * c; if (X <= 0) continue; return mk({ text: `Vừa gà vừa chó có ${c + d} con. Số chân chó nhiều hơn số chân gà là ${X} cái. Hỏi có bao nhiêu con gà?`, answer: c, solution: `Giả sử cả ${c + d} con đều là gà: số chân gà là ${2 * (c + d)}, số chân chó là 0, chân chó kém chân gà ${2 * (c + d)}. Thực tế chân chó hơn chân gà ${X}, chênh lệch ${2 * (c + d)} + ${X} = ${2 * (c + d) + X}. Mỗi lần đổi 1 con gà thành 1 con chó, chân chó thêm 4 và chân gà bớt 2, tức chênh lệch thay đổi 6. Số chó: ${2 * (c + d) + X} : 6 = ${d}. Số gà: ${c + d} − ${d} = <b>${c}</b>.` }); } },
      () => { const s = R.int(2, 10), d = R.int(2, 10), v = R.int(2, 10), N = s + d + v, L = 8 * s + 6 * (d + v), W = 2 * d + v, ask = R.pick(['s', 'd', 'v']), ans = { s, d, v }[ask], nm = { s: 'nhện', d: 'chuồn chuồn', v: 've sầu' }[ask]; return mk({ text: `Có ${N} con gồm ba loại: nhện (8 chân, không có cánh), chuồn chuồn (6 chân, 2 đôi cánh) và ve sầu (6 chân, 1 đôi cánh). Tổng cộng có ${L} chân và ${W} đôi cánh. Hỏi có bao nhiêu con ${nm}?`, answer: ans, solution: `Chuồn chuồn và ve sầu đều có 6 chân. Giả sử cả ${N} con đều có 6 chân: ${6 * N} chân, thiếu ${L - 6 * N} chân; mỗi con nhện hơn 2 chân nên có ${L - 6 * N} : 2 = ${s} con nhện. Còn ${d + v} con chuồn chuồn và ve sầu; giả sử đều là ve sầu thì có ${d + v} đôi cánh, thiếu ${W - d - v} đôi, nên có ${d} con chuồn chuồn và ${v} con ve sầu. Đáp số: <b>${ans}</b>.` }); },
      () => { const a = R.int(3, 15), b = R.int(3, 15), N = a + b, P = 4 * a + 7 * b; return mk({ text: `Một đoàn ${P} người đi du lịch, thuê ${N} chiếc xe gồm xe 4 chỗ và xe 7 chỗ, các xe đều chở vừa đủ số chỗ. Hỏi có bao nhiêu xe 7 chỗ?`, answer: b, solution: `Giả sử cả ${N} xe đều 4 chỗ: chở ${4 * N} người, thiếu ${P - 4 * N} người. Mỗi xe 7 chỗ chở hơn 3 người: ${P - 4 * N} : 3 = <b>${b}</b> xe 7 chỗ.` }); },
    ]);
  }

  const DEEDS = ['làm vỡ bình hoa', 'ăn vụng bánh', 'giấu hộp bút của cô', 'làm đổ lọ mực', 'quên tắt đèn lớp'];
  function loTruth(R, lv) {
    const n = lv === 1 ? 3 : 4, P = R.sample(NAMES, n), verb = R.pick(DEEDS);
    const modes = lv === 1 ? ['lie1', 'truth1'] : lv === 2 ? ['truth1', 'lie1'] : ['truth1', 'lie1', 'truth2'];
    for (let tries = 0; tries < 5000; tries++) {
      const mode = R.pick(modes), target = mode === 'truth1' ? 1 : mode === 'lie1' ? n - 1 : 2;
      const st = P.map((sp, i) => {
        const others = range(0, n - 1).filter(x => x !== i);
        const kind = R.pick(lv === 3 ? ['self', 'is', 'not', 'or'] : ['self', 'is', 'not']);
        if (kind === 'self') return { s: `Tớ không ${verb}.`, f: c => c !== i };
        const j = R.pick(others);
        if (kind === 'is') return { s: `${P[j]} ${verb}.`, f: c => c === j };
        if (kind === 'not') return { s: `${P[j]} không ${verb}.`, f: c => c !== j };
        const k = R.pick(others.filter(x => x !== j));
        return { s: `${P[j]} hoặc ${P[k]} ${verb}.`, f: c => c === j || c === k };
      });
      const cnt = range(0, n - 1).map(c => st.filter(x => x.f(c)).length);
      const ok = range(0, n - 1).filter(c => cnt[c] === target);
      if (ok.length !== 1) continue;
      const c = ok[0], rule = mode === 'truth1' ? 'chỉ có một bạn nói thật' : mode === 'lie1' ? 'chỉ có một bạn nói dối' : 'có đúng hai bạn nói thật';
      return mk({
        type: 'choice', choices: R.shuffle(P.slice()),
        text: `Một bạn trong nhóm đã ${verb}. Cô hỏi thì các bạn trả lời:<br>${P.map((p, i) => `• ${p}: "${st[i].s}"`).join('<br>')}<br>Biết rằng ${rule}. Ai đã ${verb}?`,
        answer: P[c],
        solution: `Thử từng trường hợp và đếm số câu nói đúng: ${range(0, n - 1).map(x => `nếu ${P[x]} ${verb} thì có ${cnt[x]} câu đúng`).join('; ')}. Chỉ trường hợp ${P[c]} thỏa mãn "${rule}". Bạn đó là <b>${P[c]}</b>.`,
      });
    }
    throw new Error('không tạo được bài suy luận');
  }

  const MATCH = [
    { items: ['đỏ', 'xanh', 'vàng', 'trắng'], intro: 'mặc áo một màu khác nhau', has: x => `mặc áo ${x}`, not: x => `không mặc áo ${x}`, by: x => `Bạn mặc áo ${x}` },
    { items: ['bóng đá', 'cờ vua', 'bơi lội', 'cầu lông'], intro: 'thích một môn thể thao khác nhau', has: x => `thích môn ${x}`, not: x => `không thích môn ${x}`, by: x => `Bạn thích môn ${x}` },
    { items: ['mèo', 'chó', 'thỏ', 'vẹt'], intro: 'nuôi một con vật khác nhau', has: x => `nuôi con ${x}`, not: x => `không nuôi con ${x}`, by: x => `Bạn nuôi con ${x}` },
    { items: ['Hà Nội', 'Huế', 'Đà Nẵng', 'Cần Thơ'], intro: 'có quê ở một nơi khác nhau', has: x => `quê ở ${x}`, not: x => `không phải quê ở ${x}`, by: x => `Bạn quê ở ${x}` },
  ];
  function loMatch(R, lv) {
    const n = lv === 3 ? 4 : 3, P = R.sample(NAMES, n), cat = R.pick(MATCH), items = R.sample(cat.items, n);
    let alive = perms(n);
    const pairs = R.shuffle(range(0, n * n - 1).map(x => [Math.floor(x / n), x % n]).filter(([i, j]) => i !== j));
    const clues = [];
    for (const [i, j] of pairs) {
      if (alive.length === 1) break;
      const nxt = alive.filter(p => p[i] !== j);
      if (nxt.length < alive.length) { clues.push([i, j]); alive = nxt; }
    }
    const k = R.int(0, n - 1);
    const lines = clues.map(([i, j]) => (R.chance(0.5) ? `${P[i]} ${cat.not(items[j])}` : `${cat.by(items[j])} không phải là ${P[i]}`) + '.');
    return mk({
      type: 'choice', choices: R.shuffle(P.slice()),
      text: `${P.join(', ')}, mỗi bạn ${cat.intro} (${R.shuffle(items.slice()).join(', ')}). Biết:<br>${lines.map(l => `• ${l}`).join('<br>')}<br>Hỏi ai ${cat.has(items[k])}?`,
      answer: P[k],
      solution: `Kẻ bảng, đánh dấu ✗ vào các ô bị loại theo từng dữ kiện; hàng hoặc cột nào chỉ còn một ô thì đánh ✓ và loại các ô cùng cột, cùng hàng. Chỉ có một cách xếp thỏa mãn: ${P.map((p, i) => `${p} – ${items[i]}`).join('; ')}. Vậy bạn ${cat.has(items[k])} là <b>${P[k]}</b>.`,
    });
  }

  function loTrees(R, lv) {
    if (lv === 0) {
      const d = R.pick([2, 3, 4, 5, 10]), k = R.int(5, 20), L = d * k;
      return mk({ text: `Trên một đoạn đường dài ${L} m, người ta trồng cây ở cả hai đầu đường, hai cây liền nhau cách nhau ${d} m. Hỏi trồng được bao nhiêu cây?`, answer: k + 1, solution: `Số khoảng cách: ${L} : ${d} = ${k}. Trồng cả hai đầu nên số cây nhiều hơn số khoảng 1: ${k} + 1 = <b>${k + 1}</b> cây.` });
    }
    if (lv === 1) {
      return V(R, [
        () => { const d = R.pick([3, 4, 5, 6, 8, 10]), k = R.int(8, 40), L = d * k; return mk({ text: `Dọc một đoạn đường dài ${L} m, người ta trồng cây ở cả hai bên đường, cứ ${d} m trồng một cây, hai đầu đường đều có cây. Hỏi trồng tất cả bao nhiêu cây?`, answer: 2 * (k + 1), solution: `Mỗi bên: ${L} : ${d} + 1 = ${k + 1} cây. Hai bên: ${k + 1} × 2 = <b>${2 * (k + 1)}</b> cây.` }); },
        () => { const d = R.pick([3, 4, 5, 6, 8, 10]), k = R.int(8, 40), L = d * k; return mk({ text: `Trên một đoạn đường dài ${L} m, người ta trồng cây cách đều ${d} m, nhưng hai đầu đường không trồng (vì là ngã tư). Hỏi trồng được bao nhiêu cây?`, answer: k - 1, solution: `Số khoảng: ${L} : ${d} = ${k}. Không trồng hai đầu nên số cây ít hơn số khoảng 1: ${k} − 1 = <b>${k - 1}</b> cây.` }); },
        () => { const d = R.pick([2, 3, 4, 5]), n = R.int(10, 50); return mk({ text: `Một hàng cây gồm ${n} cây, hai cây liền nhau cách nhau ${d} m. Hỏi cây đầu tiên cách cây cuối cùng bao nhiêu mét?`, answer: (n - 1) * d, solution: `${n} cây có ${n - 1} khoảng. Khoảng cách: ${n - 1} × ${d} = <b>${(n - 1) * d}</b> m.` }); },
      ]);
    }
    if (lv === 2) {
      return V(R, [
        () => { const d = R.pick([2, 3, 4, 5, 6]), k = R.int(15, 80); return mk({ text: `Quanh một hồ nước hình tròn có chu vi ${d * k} m, người ta trồng cây cách đều ${d} m. Hỏi trồng được bao nhiêu cây?`, answer: k, solution: `Trên đường khép kín, số cây bằng số khoảng: ${d * k} : ${d} = <b>${k}</b> cây.` }); },
        () => { const d = R.pick([2, 3, 4, 5]), a = d * R.int(5, 20), b = d * R.int(3, 15); return mk({ text: `Xung quanh một mảnh vườn hình chữ nhật dài ${a} m, rộng ${b} m, người ta trồng cây cách đều ${d} m, bốn góc đều có cây. Hỏi trồng được bao nhiêu cây?`, answer: 2 * (a + b) / d, solution: `Chu vi: (${a} + ${b}) × 2 = ${2 * (a + b)} m. Đường khép kín nên số cây bằng số khoảng: ${2 * (a + b)} : ${d} = <b>${2 * (a + b) / d}</b> cây.` }); },
        () => { const d = R.pick([5, 10, 4, 6]), k = R.int(10, 40), n = k + 1; return mk({ text: `Người ta trồng ${n} cây thành một hàng dọc theo một con đường, hai đầu đường đều có cây, các cây cách đều ${d} m. Hỏi con đường dài bao nhiêu mét?`, answer: k * d, solution: `${n} cây tạo ${n - 1} khoảng. Con đường dài: ${n - 1} × ${d} = <b>${k * d}</b> m.` }); },
      ]);
    }
    return V(R, [
      () => { const [a, b] = R.pick([[60, 40], [50, 30], [40, 30], [45, 30], [60, 45], [36, 24], [50, 40]]), M = lcm(a, b), L = M * R.int(3, 12); return mk({ text: `Dọc một con đường dài ${fmt(L)} m có các cột điện: cột đầu ở đầu đường và cứ ${a} m có một cột. Nay người ta dựng lại các cột, cứ ${b} m một cột (cột đầu vẫn ở đầu đường). Hỏi có bao nhiêu cột không phải dời đi?`, answer: L / M + 1, solution: `Cột không phải dời nằm ở vị trí cách đầu đường một số mét vừa chia hết cho ${a} vừa chia hết cho ${b}, tức là bội của ${M}. Số khoảng ${M} m: ${fmt(L)} : ${M} = ${L / M}. Số cột: ${L / M} + 1 = <b>${L / M + 1}</b>.` }); },
      () => { const [d1, d2] = R.pick([[6, 4], [5, 3], [10, 6], [8, 6], [12, 8], [6, 9], [4, 6]]), M = lcm(d1, d2), L = M * R.int(3, 15), n1 = L / d1 + 1, n2 = L / d2 + 1; return mk({ text: `Trên một đoạn đường, nếu trồng cây cách nhau ${d1} m (cả hai đầu có cây) thì cần ${n1} cây. Hỏi nếu trồng cây cách nhau ${d2} m (cả hai đầu có cây) thì cần bao nhiêu cây?`, answer: n2, solution: `Đoạn đường dài: (${n1} − 1) × ${d1} = ${L} m. Cách ${d2} m: ${L} : ${d2} + 1 = <b>${n2}</b> cây.` }); },
      () => { const d = R.pick([3, 4, 5]), k = R.int(10, 40), L = d * k, p = R.int(2, 9) * 10000; return mk({ text: `Dọc hai bên một con đường dài ${L} m, người ta trồng cây cách đều ${d} m, hai đầu đường không trồng. Mỗi cây giống giá ${fmt(p)} đồng. Hỏi tiền mua cây giống hết bao nhiêu đồng?`, answer: 2 * (k - 1) * p, solution: `Mỗi bên: ${L} : ${d} − 1 = ${k - 1} cây; hai bên ${2 * (k - 1)} cây. Tiền: ${2 * (k - 1)} × ${fmt(p)} = <b>${fmt(2 * (k - 1) * p)}</b> đồng.` }); },
    ]);
  }

  const angle = (h, m) => { let a = Math.abs(30 * (h % 12) - 5.5 * m); if (a > 180) a = 360 - a; return a; };
  function loClock(R, lv) {
    if (lv === 1) {
      const h = R.int(1, 11);
      return mk({ text: `Lúc ${h} giờ đúng, góc nhỏ tạo bởi kim giờ và kim phút là bao nhiêu độ?`, visual: svgClock(h, 0), answer: angle(h, 0), solution: `Mặt đồng hồ 360° chia thành 12 khoảng, mỗi khoảng 30°. Lúc ${h} giờ, hai kim cách nhau ${Math.min(h, 12 - h)} khoảng: ${Math.min(h, 12 - h)} × 30 = <b>${angle(h, 0)}</b>°.` });
    }
    if (lv === 2) {
      return V(R, [
        () => { const h = R.int(1, 12); return mk({ text: `Lúc ${h} giờ 30 phút, góc nhỏ tạo bởi kim giờ và kim phút là bao nhiêu độ?`, visual: svgClock(h, 30), answer: angle(h, 30), solution: `Tính từ số 12: kim phút chỉ số 6, ở 180°. Kim giờ nằm chính giữa số ${h} và số ${h % 12 + 1}, ở ${h % 12} × 30 + 15 = ${(h % 12) * 30 + 15}°. Hai kim cách nhau ${Math.abs((h % 12) * 30 + 15 - 180)}°. Góc nhỏ là <b>${angle(h, 30)}</b>°.` }); },
        () => { const a = R.int(1, 10), b = R.int(a + 1, 12); return mk({ text: `Từ ${a} giờ đến ${b} giờ cùng ngày, kim giờ quay được một góc bao nhiêu độ?`, answer: 30 * (b - a), solution: `Mỗi giờ kim giờ quay 360° : 12 = 30°. ${b - a} giờ: ${b - a} × 30 = <b>${30 * (b - a)}</b>°.` }); },
        () => { const m = R.pick([5, 10, 15, 20, 25, 40, 45, 50]); return mk({ text: `Trong ${m} phút, kim phút quay được một góc bao nhiêu độ?`, answer: 6 * m, solution: `Kim phút quay 360° trong 60 phút, mỗi phút 6°. ${m} phút: ${m} × 6 = <b>${6 * m}</b>°.` }); },
      ]);
    }
    return V(R, [
      () => { const h = R.int(1, 11), m = R.pick([10, 20, 40, 50, 15, 45, 5, 25, 35, 55]), raw = Math.abs(30 * h - 5.5 * m); return mk({ text: `Lúc ${h} giờ ${m} phút, góc nhỏ tạo bởi kim giờ và kim phút là bao nhiêu độ?`, visual: svgClock(h, m), answer: dec(angle(h, m)), solution: `Tính từ số 12 theo chiều kim đồng hồ: kim phút ở ${m} × 6 = ${6 * m}°; kim giờ ở ${h} × 30 + ${m} × 0,5 = ${dec(30 * h + 0.5 * m)}° (mỗi phút kim giờ đi 0,5°). Hai kim cách nhau ${dec(raw)}°${raw > 180 ? `, góc nhỏ là 360 − ${dec(raw)} = ${dec(360 - raw)}°` : ''}. Đáp số <b>${dec(angle(h, m))}</b>°.` }); },
      () => { const a = R.int(1, 4), h0 = R.int(6, 8), H = R.int(h0 + 4, h0 + 12), diff = (H - h0) * a, T0 = H * 60 + diff, ans = hm(T0); return mk({ type: 'choice', choices: choicesOf(R, ans, [hm(T0 - diff), hm(T0 + a), hm(T0 - a), hm(T0 + diff), hm(T0 - 2 * diff)]), text: `Một đồng hồ mỗi giờ chạy nhanh ${a} phút. Lúc ${h0} giờ sáng người ta chỉnh đồng hồ cho đúng. Hỏi đến ${H} giờ (giờ đúng) cùng ngày, đồng hồ đó chỉ mấy giờ?`, answer: ans, solution: `Từ ${h0} giờ đến ${H} giờ là ${H - h0} giờ, đồng hồ chạy nhanh ${H - h0} × ${a} = ${diff} phút. Đồng hồ chỉ: ${H} giờ + ${diff} phút = <b>${ans}</b>.` }); },
      () => { let h = R.int(1, 11); const m = R.pick([0, 30]); if (m === 0 && h === 6) h = R.pick([5, 7]); const A = angle(h, m); return mk({ text: `Lúc ${h} giờ${m ? ' 30 phút' : ' đúng'}, góc lớn (lớn hơn 180°) tạo bởi kim giờ và kim phút là bao nhiêu độ?`, visual: svgClock(h, m), answer: dec(360 - A), solution: `Góc nhỏ giữa hai kim là ${dec(A)}°. Hai góc cộng lại bằng 360°, nên góc lớn: 360 − ${dec(A)} = <b>${dec(360 - A)}</b>°.` }); },
    ]);
  }

  // =====================================================================
  // TỔ HỢP
  // =====================================================================
  function coRule(R, lv) {
    if (lv === 0) {
      return V(R, [
        () => { const a = R.int(2, 6), b = R.int(2, 6); return mk({ text: `${R.pick(NAMES)} có ${a} chiếc áo và ${b} chiếc quần. Hỏi bạn có bao nhiêu cách chọn một bộ quần áo (1 áo và 1 quần)?`, visual: `<div class="seq emoji">${'👕'.repeat(a)}&nbsp;&nbsp;${'👖'.repeat(b)}</div>`, answer: a * b, solution: `Mỗi áo đi được với ${b} quần. Số cách: ${a} × ${b} = <b>${a * b}</b>.` }); },
        () => { const a = R.int(2, 9), b = R.int(2, 9); return mk({ text: `Hộp có ${a} bút chì xanh và ${b} bút chì đỏ (các bút đều khác nhau). Hỏi có bao nhiêu cách lấy ra 1 chiếc bút chì?`, answer: a + b, solution: `Lấy bút xanh có ${a} cách, lấy bút đỏ có ${b} cách. Tất cả: ${a} + ${b} = <b>${a + b}</b> cách.` }); },
        () => { const [X, Y] = R.sample(FRUITS, 2), a = R.int(2, 5), b = R.int(2, 5); return mk({ text: `Trên bàn có ${a} quả ${X} và ${b} quả ${Y} (các quả đều khác nhau). Mỗi bạn chọn 1 quả ${X} và 1 quả ${Y}. Hỏi có bao nhiêu cách chọn?`, answer: a * b, solution: `Mỗi quả ${X} đi được với ${b} quả ${Y}: ${a} × ${b} = <b>${a * b}</b> cách.` }); },
      ]);
    }
    if (lv === 1) {
      return V(R, [
        () => { const a = R.int(2, 5), b = R.int(2, 5), c = R.int(1, 3); return mk({ text: `Từ A đến B có ${a} con đường, từ B đến C có ${b} con đường. Ngoài ra còn có ${c} con đường đi thẳng từ A đến C (không qua B). Hỏi có bao nhiêu cách đi từ A đến C?`, answer: a * b + c, solution: `Đi qua B: ${a} × ${b} = ${a * b} cách. Đi thẳng: ${c} cách. Tất cả: ${a * b} + ${c} = <b>${a * b + c}</b> cách.` }); },
        () => { const a = R.int(2, 5), b = R.int(2, 5), c = R.int(2, 4); return mk({ text: `Thực đơn có ${a} món mặn, ${b} món rau và ${c} món tráng miệng. Mỗi suất ăn gồm 1 món mặn, 1 món rau và 1 món tráng miệng. Hỏi có thể chọn được bao nhiêu suất ăn khác nhau?`, answer: a * b * c, solution: `${a} × ${b} × ${c} = <b>${a * b * c}</b> suất ăn.` }); },
        () => { const k = R.int(2, 4); return mk({ text: `Một ổ khóa số có ${k} vòng, mỗi vòng có các chữ số từ 0 đến 9. Hỏi có bao nhiêu mật mã khác nhau?`, answer: 10 ** k, solution: `Mỗi vòng có 10 cách chọn: ${Array(k).fill(10).join(' × ')} = <b>${10 ** k}</b>.` }); },
      ]);
    }
    return V(R, [
      () => { const a = R.int(2, 5), b = R.int(2, 5); return mk({ text: `Từ A đến B có ${a} con đường, từ B đến C có ${b} con đường. Hỏi có bao nhiêu cách đi từ A đến C rồi quay về A (đều qua B), sao cho trên mỗi chặng, đường về khác đường đi?`, answer: a * b * (a - 1) * (b - 1), solution: `Lượt đi: ${a} × ${b} = ${a * b} cách. Lượt về, mỗi chặng bớt đi 1 đường đã đi: ${b - 1} × ${a - 1} = ${(a - 1) * (b - 1)} cách. Tất cả: ${a * b} × ${(a - 1) * (b - 1)} = <b>${a * b * (a - 1) * (b - 1)}</b>.` }); },
      () => { const k = R.int(3, 4), n = 10 * 9 * 8 * (k === 4 ? 7 : 1); return mk({ text: `Một mật mã gồm ${k} chữ số khác nhau (có thể bắt đầu bằng chữ số 0). Hỏi có bao nhiêu mật mã như vậy?`, answer: n, solution: `Chữ số thứ nhất 10 cách, thứ hai 9 cách, thứ ba 8 cách${k === 4 ? ', thứ tư 7 cách' : ''}: ${[10, 9, 8, 7].slice(0, k).join(' × ')} = <b>${n}</b>.` }); },
      () => { const a = R.int(3, 6), b = R.int(2, 5), c = R.int(2, 4); return mk({ text: `Một cửa hàng có ${a} loại bánh, ${b} loại kẹo và ${c} loại nước. ${R.pick(NAMES)} muốn mua 2 món thuộc 2 nhóm khác nhau (mỗi nhóm 1 loại). Hỏi có bao nhiêu cách chọn?`, answer: a * b + a * c + b * c, solution: `Bánh – kẹo: ${a} × ${b} = ${a * b}; bánh – nước: ${a} × ${c} = ${a * c}; kẹo – nước: ${b} × ${c} = ${b * c}. Tất cả: <b>${a * b + a * c + b * c}</b> cách.` }); },
    ]);
  }

  function coHand(R, lv) {
    if (lv === 0) {
      const n = R.int(3, 6);
      return mk({ text: R.pick([`Có ${n} bạn gặp nhau, mỗi bạn bắt tay mỗi bạn khác đúng một lần. Hỏi có tất cả bao nhiêu cái bắt tay?`, `Có ${n} bạn chơi cờ, mỗi bạn đấu với mỗi bạn khác đúng một ván. Hỏi có tất cả bao nhiêu ván cờ?`, `Có ${n} bạn, mỗi bạn chụp chung một tấm ảnh với từng bạn khác (mỗi ảnh có đúng 2 bạn). Hỏi có tất cả bao nhiêu tấm ảnh?`]), visual: `<div class="seq emoji">${'🙂'.repeat(n)}</div>`, answer: C2(n), solution: `Mỗi cặp hai bạn được tính đúng một lần. Bạn thứ nhất ghép cặp với ${n - 1} bạn, bạn thứ hai ghép thêm với ${n - 2} bạn, ... Tổng: ${range(1, n - 1).reverse().join(' + ')} = <b>${C2(n)}</b>.` });
    }
    if (lv === 1) {
      return V(R, [
        () => { const n = R.int(6, 15); return mk({ text: `Có ${n} đội bóng thi đấu vòng tròn một lượt (mỗi đội gặp mỗi đội khác đúng một trận). Hỏi có tất cả bao nhiêu trận đấu?`, answer: C2(n), solution: `Mỗi đội đá ${n - 1} trận, ${n} đội: ${n} × ${n - 1} = ${n * (n - 1)}, nhưng mỗi trận được tính hai lần: ${n * (n - 1)} : 2 = <b>${C2(n)}</b> trận.` }); },
        () => { const n = R.int(5, 12); return mk({ text: `Trong một nhóm có ${n} bạn, mỗi bạn gửi một tấm thiệp cho mỗi bạn khác trong nhóm. Hỏi có tất cả bao nhiêu tấm thiệp?`, answer: n * (n - 1), solution: `Mỗi bạn gửi ${n - 1} tấm. ${n} bạn: ${n} × ${n - 1} = <b>${n * (n - 1)}</b> tấm thiệp.` }); },
      ]);
    }
    if (lv === 2) {
      return V(R, [
        () => { const n = R.int(5, 16); return mk({ text: `Trong một giải cờ vua, mỗi kì thủ gặp mỗi kì thủ khác đúng một ván. Tổng cộng có ${C2(n)} ván đấu. Hỏi có bao nhiêu kì thủ?`, answer: n, solution: `Số ván = số người × (số người − 1) : 2. Nên số người × (số người − 1) = ${C2(n)} × 2 = ${n * (n - 1)} = ${n} × ${n - 1}. Có <b>${n}</b> kì thủ.` }); },
        () => { const n = R.int(4, 10); return mk({ text: `Có ${n} đội bóng thi đấu vòng tròn hai lượt (mỗi cặp đội gặp nhau 2 trận: lượt đi và lượt về). Hỏi có tất cả bao nhiêu trận đấu?`, answer: n * (n - 1), solution: `Một lượt có ${n} × ${n - 1} : 2 = ${C2(n)} trận. Hai lượt: ${C2(n)} × 2 = <b>${n * (n - 1)}</b> trận.` }); },
        () => { const n = R.pick([4, 8, 16, 32, 6, 10, 12, 20]); return mk({ text: `Có ${n} đội tham gia giải đấu loại trực tiếp: mỗi trận có một đội thua và bị loại (không có trận hòa), cho đến khi còn một đội vô địch. Hỏi có tất cả bao nhiêu trận đấu?`, answer: n - 1, solution: `Mỗi trận loại đúng 1 đội. Phải loại ${n} − 1 = ${n - 1} đội nên có <b>${n - 1}</b> trận.` }); },
      ]);
    }
    return V(R, [
      () => { const n = R.int(5, 15); return mk({ text: `Một đa giác có ${n} cạnh. Hỏi đa giác đó có bao nhiêu đường chéo? (đường chéo nối hai đỉnh không kề nhau)`, answer: n * (n - 3) / 2, solution: `Mỗi đỉnh nối được với ${n} − 3 = ${n - 3} đỉnh không kề nó. ${n} đỉnh: ${n} × ${n - 3} = ${n * (n - 3)}, mỗi đường chéo được tính hai lần: ${n * (n - 3)} : 2 = <b>${n * (n - 3) / 2}</b>.` }); },
      () => { const a = R.int(3, 6), b = R.int(3, 6); return mk({ text: `Một buổi gặp mặt có ${a} bạn nam và ${b} bạn nữ. Mỗi bạn nam bắt tay mỗi bạn nữ đúng một lần, các bạn nam bắt tay nhau mỗi cặp một lần, còn các bạn nữ không bắt tay nhau. Hỏi có bao nhiêu cái bắt tay?`, answer: a * b + C2(a), solution: `Nam – nữ: ${a} × ${b} = ${a * b}. Nam – nam: ${a} × ${a - 1} : 2 = ${C2(a)}. Tổng: ${a * b} + ${C2(a)} = <b>${a * b + C2(a)}</b>.` }); },
      () => { const g = R.int(2, 4), k = R.int(4, 6); return mk({ text: `Một giải bóng đá có ${g * k} đội chia thành ${g} bảng, mỗi bảng ${k} đội đá vòng tròn một lượt. Sau đó đội nhất mỗi bảng vào vòng chung kết, đá vòng tròn một lượt. Hỏi cả giải có bao nhiêu trận?`, answer: g * C2(k) + C2(g), solution: `Mỗi bảng: ${k} × ${k - 1} : 2 = ${C2(k)} trận; ${g} bảng: ${g * C2(k)} trận. Vòng chung kết ${g} đội: ${C2(g)} trận. Tổng: <b>${g * C2(k) + C2(g)}</b>.` }); },
    ]);
  }

  function countNums(digits, len, cond, distinct) {
    let c = 0; const ex = [];
    const rec = pre => {
      if (pre.length === len) { const n = +pre.join(''); if (cond(n, pre)) { c++; if (ex.length < 12) ex.push(n); } return; }
      for (const d of digits) {
        if (pre.length === 0 && d === 0) continue;
        if (distinct && pre.includes(d)) continue;
        rec([...pre, d]);
      }
    };
    rec([]);
    return [c, ex];
  }
  function coNumbers(R, lv) {
    if (lv === 0) {
      const ds3 = R.sample(range(1, 9), 3), distinct = R.chance(0.6), [c, ex] = countNums(ds3, 2, () => true, distinct);
      return mk({ text: `Từ ba chữ số ${ds3.join(', ')}, lập được bao nhiêu số có hai chữ số ${distinct ? 'khác nhau' : '(các chữ số có thể lặp lại)'}?`, answer: c, solution: `Hàng chục có 3 cách chọn, hàng đơn vị có ${distinct ? 2 : 3} cách: 3 × ${distinct ? 2 : 3} = <b>${c}</b> (${ex.join(', ')}).` });
    }
    if (lv === 1) {
      const set = R.sample(range(1, 9), 3).concat([0]).sort((a, b) => a - b), [c] = countNums(set, 3, () => true, true);
      return mk({ text: `Từ bốn chữ số ${set.join(', ')}, lập được bao nhiêu số có ba chữ số khác nhau?`, answer: c, solution: `Hàng trăm không thể là 0: có 3 cách. Hàng chục: 3 cách (còn lại 3 chữ số, kể cả 0). Hàng đơn vị: 2 cách. Tổng: 3 × 3 × 2 = <b>${c}</b>.` });
    }
    if (lv === 2) {
      return V(R, [
        () => { const set = R.sample(range(1, 9), 3).concat([0]).sort((a, b) => a - b), [c, ex] = countNums(set, 3, n => n % 2 === 0, true); return mk({ text: `Từ bốn chữ số ${set.join(', ')}, lập được bao nhiêu số chẵn có ba chữ số khác nhau?`, answer: c, solution: `Chia trường hợp theo chữ số hàng đơn vị (phải chẵn): tận cùng là 0 thì hai chữ số đầu chọn tùy ý; tận cùng là chữ số chẵn khác 0 thì hàng trăm không được là 0. Liệt kê được: ${ex.join(', ')}${c > 12 ? ', ...' : ''}. Có <b>${c}</b> số.` }); },
        () => { for (;;) { const set = R.sample(range(1, 9), 4).sort((a, b) => a - b), X = R.int(3, 7) * 100 + R.int(0, 99), [c] = countNums(set, 3, n => n > X, true); if (!c) continue; return mk({ text: `Từ bốn chữ số ${set.join(', ')}, lập được bao nhiêu số có ba chữ số khác nhau lớn hơn ${X}?`, answer: c, solution: `Xét chữ số hàng trăm: nếu lớn hơn ${Math.floor(X / 100)} thì mọi cách chọn hai chữ số sau đều được (mỗi chữ số hàng trăm cho 3 × 2 = 6 số); nếu bằng ${Math.floor(X / 100)} thì xét thêm hàng chục, hàng đơn vị. Đếm được <b>${c}</b> số.` }); } },
        () => { for (;;) { const set = [...new Set(R.sample(range(1, 9), 2).concat([0, 5]))].sort((a, b) => a - b), [c, ex] = countNums(set, 3, n => n % 5 === 0, true); if (!c) continue; return mk({ text: `Từ các chữ số ${set.join(', ')}, lập được bao nhiêu số có ba chữ số khác nhau chia hết cho 5?`, answer: c, solution: `Số chia hết cho 5 tận cùng là 0 hoặc 5. Tận cùng 0: chọn hai chữ số đầu từ các chữ số còn lại; tận cùng 5: hàng trăm khác 0. Các số: ${ex.join(', ')}${c > 12 ? ', ...' : ''}. Có <b>${c}</b> số.` }); } },
      ]);
    }
    const all = range(0, 9);
    return V(R, [
      () => { const [c] = countNums(all, 3, (n, p) => p[0] < p[1] && p[1] < p[2], false); return mk({ text: `Có bao nhiêu số có ba chữ số mà các chữ số tăng dần từ trái sang phải (ví dụ 138)?`, answer: c, solution: `Chữ số 0 không thể có mặt (nếu có, 0 nhỏ nhất phải đứng đầu). Mỗi cách chọn 3 chữ số khác nhau từ 1 đến 9 cho đúng một số tăng dần. Số cách chọn: 9 × 8 × 7 : 6 = <b>${c}</b>.` }); },
      () => { const d = R.int(1, 9), [c] = countNums(all, 3, (n, p) => p.includes(d), false); return mk({ text: `Có bao nhiêu số có ba chữ số mà có ít nhất một chữ số ${d}?`, answer: c, solution: `Có 900 số có ba chữ số. Số không có chữ số ${d}: hàng trăm 8 cách (khác 0 và ${d}), hàng chục 9 cách, hàng đơn vị 9 cách: 8 × 9 × 9 = ${900 - c}. Số cần tìm: 900 − ${900 - c} = <b>${c}</b>.` }); },
      () => { const [c] = countNums(all, 3, n => n % 5 === 0, true); return mk({ text: `Có bao nhiêu số có ba chữ số khác nhau chia hết cho 5?`, answer: c, solution: `Tận cùng 0: hàng trăm 9 cách, hàng chục 8 cách → 72 số. Tận cùng 5: hàng trăm 8 cách (khác 0 và 5), hàng chục 8 cách → 64 số. Tổng: 72 + 64 = <b>${c}</b>.` }); },
      () => { const dis = R.chance(0.5), [c] = countNums([1, 3, 5, 7, 9], 3, () => true, dis); return mk({ text: `Có bao nhiêu số có ba chữ số mà tất cả các chữ số đều lẻ${dis ? ' và khác nhau' : ''}?`, answer: c, solution: dis ? `Có 5 chữ số lẻ: 1, 3, 5, 7, 9. Hàng trăm 5 cách, hàng chục 4 cách, hàng đơn vị 3 cách: <b>${c}</b>.` : `Mỗi hàng chọn một trong 5 chữ số lẻ: 5 × 5 × 5 = <b>${c}</b>.` }); },
      () => { const [c] = countNums(all, 4, (n, p) => p[3] % 2 === 0, true); return mk({ text: `Có bao nhiêu số chẵn có bốn chữ số khác nhau?`, answer: c, solution: `Tận cùng 0: 9 × 8 × 7 = 504 số. Tận cùng 2, 4, 6, 8 (4 cách): hàng nghìn 8 cách (khác 0 và chữ số cuối), hàng trăm 8 cách, hàng chục 7 cách → 4 × 8 × 8 × 7 = 1792 số. Tổng: 504 + 1792 = <b>${c}</b>.` }); },
    ]);
  }

  function coPerm(R, lv) {
    if (lv === 1) {
      const n = R.int(3, 5);
      return mk({ text: R.pick([`Có ${n} bạn xếp thành một hàng ngang để chụp ảnh. Hỏi có bao nhiêu cách xếp?`, `Có ${n} quyển sách khác nhau xếp thành một hàng trên giá. Hỏi có bao nhiêu cách xếp?`, `Có ${n} bạn ngồi vào ${n} chiếc ghế xếp thành một hàng. Hỏi có bao nhiêu cách ngồi?`]), answer: fact(n), solution: `Vị trí thứ nhất ${n} cách, thứ hai ${n - 1} cách, ... Số cách: ${range(1, n).reverse().join(' × ')} = <b>${fact(n)}</b>.` });
    }
    const [A, B] = R.sample(NAMES, 2);
    if (lv === 2) {
      return V(R, [
        () => { const n = R.int(4, 6); return mk({ text: `Có ${n} bạn, trong đó có ${A}, xếp thành một hàng. Hỏi có bao nhiêu cách xếp sao cho ${A} đứng đầu hàng?`, answer: fact(n - 1), solution: `${A} cố định ở đầu hàng, ${n - 1} bạn còn lại xếp tùy ý: ${range(1, n - 1).reverse().join(' × ')} = <b>${fact(n - 1)}</b>.` }); },
        () => { const n = R.int(4, 6); return mk({ text: `Có ${n} bạn, trong đó có ${A} và ${B}, xếp thành một hàng. Hỏi có bao nhiêu cách xếp sao cho ${A} và ${B} đứng cạnh nhau?`, answer: 2 * fact(n - 1), solution: `Coi ${A} và ${B} là một "khối": có ${n - 1} phần tử, xếp được ${fact(n - 1)} cách. Trong khối, hai bạn đổi chỗ được 2 cách. Tổng: ${fact(n - 1)} × 2 = <b>${2 * fact(n - 1)}</b>.` }); },
        () => { const w = R.pick(['TOAN', 'HOC', 'TIMO', 'SAO', 'BINH']); return mk({ text: `Đổi chỗ các chữ cái của từ <b>${w}</b> (mỗi chữ dùng đúng một lần), viết được bao nhiêu dãy chữ cái khác nhau (kể cả dãy ban đầu)?`, answer: fact(w.length), solution: `${w.length} chữ cái khác nhau: ${range(1, w.length).reverse().join(' × ')} = <b>${fact(w.length)}</b>.` }); },
      ]);
    }
    return V(R, [
      () => { const n = R.int(4, 6); return mk({ text: `Có ${n} bạn, trong đó có ${A} và ${B}, xếp thành một hàng. Hỏi có bao nhiêu cách xếp sao cho ${A} và ${B} không đứng cạnh nhau?`, answer: fact(n) - 2 * fact(n - 1), solution: `Tất cả: ${fact(n)} cách. Số cách hai bạn đứng cạnh nhau: 2 × ${fact(n - 1)} = ${2 * fact(n - 1)}. Không cạnh nhau: ${fact(n)} − ${2 * fact(n - 1)} = <b>${fact(n) - 2 * fact(n - 1)}</b>.` }); },
      () => { const n = R.int(4, 6); return mk({ text: `Có ${n} bạn, trong đó có ${A}, xếp thành một hàng. Hỏi có bao nhiêu cách xếp sao cho ${A} không đứng ở hai đầu hàng?`, answer: (n - 2) * fact(n - 1), solution: `${A} có ${n - 2} vị trí (trừ hai đầu). ${n - 1} bạn còn lại xếp vào ${n - 1} chỗ: ${fact(n - 1)} cách. Tổng: ${n - 2} × ${fact(n - 1)} = <b>${(n - 2) * fact(n - 1)}</b>.` }); },
      () => { const w = R.pick(['MAMA', 'NANA', 'BOBO', 'ANNA', 'TOTO', 'LALA', 'ABBA', 'MIMI']); return mk({ text: `Đổi chỗ các chữ cái của từ <b>${w}</b> (mỗi chữ dùng đúng một lần), viết được bao nhiêu dãy chữ cái khác nhau (kể cả dãy ban đầu)?`, answer: 6, solution: `Có 4 chữ cái gồm 2 cặp chữ giống nhau. Chọn 2 vị trí trong 4 vị trí cho một loại chữ: 4 × 3 : 2 = 6 cách, 2 vị trí còn lại cho loại kia. Có <b>6</b> dãy.` }); },
      () => { const b = R.int(2, 3), g = R.int(2, 3); return mk({ text: `Có ${b} bạn nam và ${g} bạn nữ xếp thành một hàng sao cho các bạn nam đứng liền nhau và các bạn nữ đứng liền nhau. Hỏi có bao nhiêu cách xếp?`, answer: 2 * fact(b) * fact(g), solution: `Nhóm nam đứng trước hoặc nhóm nữ đứng trước: 2 cách. Trong nhóm nam xếp ${fact(b)} cách, nhóm nữ ${fact(g)} cách. Tổng: 2 × ${fact(b)} × ${fact(g)} = <b>${2 * fact(b) * fact(g)}</b>.` }); },
    ]);
  }

  function coChoose(R, lv) {
    if (lv === 1) {
      return V(R, [
        () => { const n = R.int(4, 12); return mk({ text: `Cô giáo cần chọn 2 bạn trong ${n} bạn để đi trực nhật. Hỏi có bao nhiêu cách chọn?`, answer: C2(n), solution: `Chọn bạn thứ nhất ${n} cách, bạn thứ hai ${n - 1} cách, nhưng mỗi cặp bị đếm hai lần: ${n} × ${n - 1} : 2 = <b>${C2(n)}</b>.` }); },
        () => { const n = R.int(4, 12); return mk({ text: `Lớp có ${n} bạn ứng cử. Cần chọn 1 lớp trưởng và 1 lớp phó (hai bạn khác nhau). Hỏi có bao nhiêu cách chọn?`, answer: n * (n - 1), solution: `Lớp trưởng ${n} cách, lớp phó ${n - 1} cách (hai chức vụ khác nhau nên thứ tự có ý nghĩa): ${n} × ${n - 1} = <b>${n * (n - 1)}</b>.` }); },
      ]);
    }
    if (lv === 2) {
      return V(R, [
        () => { const m = R.int(3, 9), f = R.int(3, 9); return mk({ text: `Một nhóm có ${m} bạn nam và ${f} bạn nữ. Cần chọn 1 bạn nam và 1 bạn nữ để song ca. Hỏi có bao nhiêu cách chọn?`, answer: m * f, solution: `${m} × ${f} = <b>${m * f}</b> cách.` }); },
        () => { const n = R.int(4, 9); return mk({ text: `Có ${n} bạn, cần chọn 3 bạn để đi thi (không phân biệt thứ tự). Hỏi có bao nhiêu cách chọn?`, answer: Cn(n, 3), solution: `Nếu có thứ tự: ${n} × ${n - 1} × ${n - 2} = ${n * (n - 1) * (n - 2)}. Mỗi nhóm 3 bạn được đếm 3 × 2 × 1 = 6 lần: ${n * (n - 1) * (n - 2)} : 6 = <b>${Cn(n, 3)}</b>.` }); },
        () => { const m = R.int(3, 8), f = R.int(3, 8); return mk({ text: `Một nhóm có ${m} bạn nam và ${f} bạn nữ. Cần chọn 2 bạn cùng là nam hoặc cùng là nữ. Hỏi có bao nhiêu cách chọn?`, answer: C2(m) + C2(f), solution: `Hai nam: ${m} × ${m - 1} : 2 = ${C2(m)}. Hai nữ: ${f} × ${f - 1} : 2 = ${C2(f)}. Tổng: <b>${C2(m) + C2(f)}</b>.` }); },
      ]);
    }
    return V(R, [
      () => { const m = R.int(3, 6), f = R.int(2, 5), n = m + f; return mk({ text: `Một tổ có ${m} bạn nam và ${f} bạn nữ. Cần chọn 3 bạn, trong đó có ít nhất 1 bạn nữ. Hỏi có bao nhiêu cách chọn?`, answer: Cn(n, 3) - Cn(m, 3), solution: `Chọn 3 bạn bất kì: ${n} × ${n - 1} × ${n - 2} : 6 = ${Cn(n, 3)}. Chọn 3 bạn toàn nam: ${Cn(m, 3)}. Có ít nhất 1 nữ: ${Cn(n, 3)} − ${Cn(m, 3)} = <b>${Cn(n, 3) - Cn(m, 3)}</b>.` }); },
      () => { const n = R.int(5, 10); return mk({ text: `Có ${n} điểm, trong đó không có 3 điểm nào thẳng hàng. Hỏi vẽ được bao nhiêu hình tam giác có ba đỉnh là ba trong các điểm đó?`, answer: Cn(n, 3), solution: `Mỗi tam giác ứng với một cách chọn 3 điểm: ${n} × ${n - 1} × ${n - 2} : 6 = <b>${Cn(n, 3)}</b>.` }); },
      () => { const n = R.int(6, 10), k = R.int(3, n - 2); return mk({ text: `Có ${n} điểm, trong đó có đúng ${k} điểm cùng nằm trên một đường thẳng, ngoài ra không có 3 điểm nào khác thẳng hàng. Hỏi vẽ được bao nhiêu hình tam giác có đỉnh là các điểm đó?`, answer: Cn(n, 3) - Cn(k, 3), solution: `Chọn 3 điểm bất kì: ${Cn(n, 3)} cách. Bỏ đi các bộ 3 điểm nằm trên đường thẳng: ${Cn(k, 3)}. Số tam giác: ${Cn(n, 3)} − ${Cn(k, 3)} = <b>${Cn(n, 3) - Cn(k, 3)}</b>.` }); },
      () => { const m = R.int(3, 6), f = R.int(3, 6), n = m + f; return mk({ text: `Một nhóm có ${m} bạn nam và ${f} bạn nữ. Cần chọn 3 bạn có cả nam và nữ. Hỏi có bao nhiêu cách chọn?`, answer: Cn(n, 3) - Cn(m, 3) - Cn(f, 3), solution: `Tất cả: ${Cn(n, 3)}. Bỏ các nhóm toàn nam (${Cn(m, 3)}) và toàn nữ (${Cn(f, 3)}): ${Cn(n, 3)} − ${Cn(m, 3)} − ${Cn(f, 3)} = <b>${Cn(n, 3) - Cn(m, 3) - Cn(f, 3)}</b>.` }); },
    ]);
  }

  function coGrid(R, lv) {
    const ways = (r, c) => Cn(r + c, r);
    if (lv === 3) {
      const r = R.int(2, 4), c = R.int(3, 5), i = R.int(1, r - 1), j = R.int(1, c - 1), a = ways(i, j), b = ways(r - i, c - j);
      return mk({ text: `Một con kiến đi theo các cạnh của lưới ô vuông từ A đến B, mỗi bước chỉ đi sang phải hoặc đi lên trên. Hỏi có bao nhiêu đường đi từ A đến B mà đi qua điểm C?`, visual: figPath(r, c, [i, j]), answer: a * b, solution: `Từ A đến C (${j} bước sang phải, ${i} bước lên): ${a} đường. Từ C đến B (${c - j} bước sang phải, ${r - i} bước lên): ${b} đường. Đi qua C: ${a} × ${b} = <b>${a * b}</b>.` });
    }
    const [r, c] = lv === 1 ? R.pick([[1, 2], [1, 3], [2, 2], [1, 4], [2, 3]]) : R.pick([[3, 3], [2, 4], [3, 4], [2, 5], [3, 5]]);
    return mk({ text: `Một con kiến đi theo các cạnh của lưới ô vuông từ A đến B, mỗi bước chỉ đi sang phải hoặc đi lên trên. Hỏi có bao nhiêu đường đi khác nhau?`, visual: figPath(r, c), answer: ways(r, c), solution: `Ghi số đường đi đến từng giao điểm: các điểm ở hàng dưới cùng và cột bên trái đều ghi 1; mỗi điểm khác bằng tổng số ghi ở điểm bên trái và điểm bên dưới nó. Số ghi tại B là <b>${ways(r, c)}</b>.` });
  }

  function coPigeon(R, lv) {
    const C = ['đỏ', 'xanh', 'vàng', 'trắng', 'tím'];
    if (lv === 0) {
      const r = R.int(2, 8), b = R.int(2, 8);
      return mk({ text: `Hộp có ${r} viên bi đỏ và ${b} viên bi xanh. Không nhìn vào hộp, phải lấy ra ít nhất bao nhiêu viên bi để chắc chắn có 1 viên bi đỏ?`, visual: `<div class="seq emoji">${'🔴'.repeat(r)} ${'🔵'.repeat(b)}</div>`, answer: b + 1, solution: `Xui nhất là lấy hết ${b} viên xanh trước. Lấy thêm 1 viên nữa chắc chắn là đỏ: ${b} + 1 = <b>${b + 1}</b> viên.` });
    }
    if (lv === 1) {
      return V(R, [
        () => { const k = R.int(3, 5), cs = range(1, k).map(() => R.int(3, 10)); return mk({ text: `Hộp có ${cs.map((x, i) => `${x} bi ${C[i]}`).join(', ')}. Phải lấy ra ít nhất bao nhiêu viên (không nhìn) để chắc chắn có 2 viên cùng màu?`, answer: k + 1, solution: `Xui nhất là mỗi màu lấy 1 viên: ${k} viên khác màu nhau. Lấy thêm 1 viên nữa thì chắc chắn trùng màu: ${k} + 1 = <b>${k + 1}</b>.` }); },
        () => { const r = R.int(3, 10), b = R.int(3, 10), y = R.int(3, 10); return mk({ text: `Hộp có ${r} bi đỏ, ${b} bi xanh và ${y} bi vàng. Phải lấy ra ít nhất bao nhiêu viên (không nhìn) để chắc chắn có 1 viên bi vàng?`, answer: r + b + 1, solution: `Xui nhất: lấy hết ${r} bi đỏ và ${b} bi xanh trước. Thêm 1 viên nữa là bi vàng: ${r} + ${b} + 1 = <b>${r + b + 1}</b>.` }); },
      ]);
    }
    if (lv === 2) {
      return V(R, [
        () => { const cs = range(1, 3).map(() => R.int(3, 12)), s = cs.slice().sort((a, b) => b - a); return mk({ text: `Hộp có ${cs.map((x, i) => `${x} bi ${C[i]}`).join(', ')}. Phải lấy ra ít nhất bao nhiêu viên (không nhìn) để chắc chắn có đủ cả ba màu?`, answer: s[0] + s[1] + 1, solution: `Xui nhất là lấy hết hai màu nhiều bi nhất trước: ${s[0]} + ${s[1]} = ${s[0] + s[1]} viên mà vẫn thiếu một màu. Thêm 1 viên: <b>${s[0] + s[1] + 1}</b>.` }); },
        () => { const m = R.int(3, 5), cs = range(1, R.int(3, 4)).map(() => R.int(1, 9)); if (!cs.some(x => x >= m)) cs[0] = m + 2; const worst = sum(cs.map(x => Math.min(x, m - 1))); return mk({ text: `Hộp có ${cs.map((x, i) => `${x} bi ${C[i]}`).join(', ')}. Phải lấy ra ít nhất bao nhiêu viên (không nhìn) để chắc chắn có ${m} viên cùng màu?`, answer: worst + 1, solution: `Xui nhất là mỗi màu lấy được nhiều nhất ${m - 1} viên (màu nào ít hơn thì lấy hết): ${cs.map(x => Math.min(x, m - 1)).join(' + ')} = ${worst} viên mà chưa có ${m} viên cùng màu. Thêm 1 viên: <b>${worst + 1}</b>.` }); },
        () => { const n = R.int(13, 60), q = Math.floor(n / 12), r = n % 12; return mk({ text: `Một lớp có ${n} học sinh. Hỏi chắc chắn có ít nhất bao nhiêu bạn có sinh nhật trong cùng một tháng?`, answer: Math.ceil(n / 12), solution: `Có 12 tháng. ${n} = 12 × ${q} + ${r}. ${r ? `Dù chia đều mỗi tháng ${q} bạn thì vẫn còn ${r} bạn, nên có tháng có ít nhất ${q} + 1` : `Nếu chia đều thì mỗi tháng có ${q} bạn; nếu không đều thì có tháng nhiều hơn. Vậy chắc chắn có tháng có ít nhất`} = <b>${Math.ceil(n / 12)}</b> bạn.` }); },
      ]);
    }
    return V(R, [
      () => { const k = R.int(3, 6); return mk({ text: `Cần ít nhất bao nhiêu học sinh để chắc chắn có ${k} bạn sinh cùng một tháng?`, answer: 12 * (k - 1) + 1, solution: `Xui nhất là mỗi tháng có ${k - 1} bạn: 12 × ${k - 1} = ${12 * (k - 1)} bạn mà chưa có ${k} bạn cùng tháng. Thêm 1 bạn: <b>${12 * (k - 1) + 1}</b>.` }); },
      () => { const r = R.int(3, 10), b = R.int(3, 10), y = R.int(2, 8); return mk({ text: `Hộp có ${r} bi đỏ, ${b} bi xanh và ${y} bi vàng. Phải lấy ra ít nhất bao nhiêu viên (không nhìn) để chắc chắn có ít nhất 2 bi đỏ và 2 bi xanh?`, answer: Math.max(r, b) + y + 2, solution: `Xui nhất: lấy hết bi vàng (${y}), hết màu nhiều hơn trong hai màu đỏ, xanh (${Math.max(r, b)} viên) và 1 viên màu còn lại: ${y} + ${Math.max(r, b)} + 1 = ${y + Math.max(r, b) + 1} viên vẫn chưa đủ. Thêm 1 viên: <b>${Math.max(r, b) + y + 2}</b>.` }); },
      () => { const k = R.int(3, 5), p = R.int(2, 6); return mk({ text: `Trong ngăn kéo có tất của ${k} màu, mỗi màu có rất nhiều chiếc. Phải lấy ra ít nhất bao nhiêu chiếc (không nhìn) để chắc chắn ghép được ${p} đôi tất (mỗi đôi gồm 2 chiếc cùng màu, các đôi có thể khác màu nhau)?`, answer: 2 * p + k - 1, solution: `Xui nhất: đã ghép được ${p - 1} đôi và còn ${k} chiếc lẻ, mỗi màu một chiếc (không ghép thêm được): ${2 * (p - 1)} + ${k} = ${2 * (p - 1) + k} chiếc. Thêm 1 chiếc nữa sẽ trùng màu với một chiếc lẻ, ghép được đôi thứ ${p}: <b>${2 * p + k - 1}</b>.` }); },
    ]);
  }

  function coVenn(R, lv) {
    const [sa, sb] = R.pick([['bóng đá', 'cầu lông'], ['Toán', 'Tiếng Việt'], ['vẽ', 'hát'], ['bơi', 'cờ vua']]);
    const both = R.int(2, 12), oa = R.int(2, 20), ob = R.int(2, 20), none = R.int(0, 8), A = oa + both, B = ob + both, N = oa + ob + both + none;
    if (lv === 1) {
      if (R.chance(0.5)) return mk({ text: `Trong lớp có ${A} bạn thích ${sa}, ${B} bạn thích ${sb}, trong đó có ${both} bạn thích cả hai môn. Hỏi có bao nhiêu bạn thích ít nhất một trong hai môn?`, visual: figVenn(sa, sb), answer: A + B - both, solution: `Cộng ${A} + ${B} thì ${both} bạn thích cả hai bị đếm hai lần. Số bạn: ${A} + ${B} − ${both} = <b>${A + B - both}</b>.` });
      return mk({ text: `Lớp có ${N} bạn, trong đó ${A} bạn thích ${sa}, ${B} bạn thích ${sb}, ${both} bạn thích cả hai. Hỏi có bao nhiêu bạn không thích môn nào trong hai môn đó?`, visual: figVenn(sa, sb), answer: none, solution: `Thích ít nhất một môn: ${A} + ${B} − ${both} = ${A + B - both}. Không thích môn nào: ${N} − ${A + B - both} = <b>${none}</b>.` });
    }
    if (lv === 2) {
      if (R.chance(0.5)) return mk({ text: `Lớp có ${N} bạn. Có ${A} bạn thích ${sa}, ${B} bạn thích ${sb} và ${none} bạn không thích môn nào trong hai môn đó. Hỏi có bao nhiêu bạn thích cả hai môn?`, answer: both, solution: `Số bạn thích ít nhất một môn: ${N} − ${none} = ${N - none}. Thích cả hai: ${A} + ${B} − ${N - none} = <b>${both}</b>.` });
      return mk({ text: `Lớp có ${N} bạn. Có ${A} bạn thích ${sa}, ${B} bạn thích ${sb} và ${none} bạn không thích môn nào. Hỏi có bao nhiêu bạn chỉ thích ${sa} (không thích ${sb})?`, answer: oa, solution: `Thích ít nhất một môn: ${N} − ${none} = ${N - none}. Thích cả hai: ${A} + ${B} − ${N - none} = ${both}. Chỉ thích ${sa}: ${A} − ${both} = <b>${oa}</b>.` });
    }
    return V(R, [
      () => { const n = R.int(30, 45), a = R.int(Math.ceil(n / 2), n - 2), b = R.int(n - a + 2, n - 1); return mk({ text: `Lớp có ${n} bạn. Có ${a} bạn thích ${sa} và ${b} bạn thích ${sb}. Hỏi có ít nhất bao nhiêu bạn thích cả hai môn?`, answer: a + b - n, solution: `Số bạn thích ít nhất một môn không quá ${n}, mà ${a} + ${b} = ${a + b}. Phần dôi ra ${a + b} − ${n} = ${a + b - n} phải là các bạn bị đếm hai lần. Vậy ít nhất <b>${a + b - n}</b> bạn thích cả hai môn.` }); },
      () => mk({ text: `Lớp có ${N} bạn, trong đó ${none} bạn không thích môn nào trong hai môn ${sa} và ${sb}. Số bạn chỉ thích ${sa} là ${oa}, số bạn chỉ thích ${sb} là ${ob}. Hỏi có bao nhiêu bạn thích ${sb}?`, answer: B, solution: `Thích cả hai: ${N} − ${none} − ${oa} − ${ob} = ${both}. Thích ${sb}: ${ob} + ${both} = <b>${B}</b>.` }),
      () => { const two = R.int(6, 24), all3 = R.int(1, 5), one = R.int(5, 20), tot = one + two + all3; return mk({ text: `Mỗi bạn trong câu lạc bộ ${tot} người học ít nhất một môn trong ba môn: Toán, Văn, Anh. Có ${one} bạn chỉ học đúng một môn, ${two} bạn học đúng hai môn. Hỏi có bao nhiêu bạn học cả ba môn?`, answer: all3, solution: `Số bạn học từ hai môn trở lên: ${tot} − ${one} = ${two + all3}. Trong đó ${two} bạn học đúng hai môn. Học cả ba môn: ${two + all3} − ${two} = <b>${all3}</b>.` }); },
    ]);
  }

  function coCountShape(R, lv) {
    if (lv === 2) {
      return V(R, [
        () => { const n = R.int(3, 7); return mk({ text: `Một hình chữ nhật được chia thành ${n} ô vuông nằm thành một hàng như hình. Có bao nhiêu hình chữ nhật trong hình vẽ? (hình vuông cũng là hình chữ nhật)`, visual: svgGrid(1, n), answer: C2(n + 1), solution: `Mỗi hình chữ nhật được xác định bởi 2 trong ${n + 1} đường dọc: ${range(1, n).reverse().join(' + ')} = <b>${C2(n + 1)}</b>.` }); },
        () => { const n = R.int(2, 5); return mk({ text: `Hình vẽ là lưới gồm 2 hàng, ${n} cột ô vuông. Có bao nhiêu hình chữ nhật trong hình vẽ? (hình vuông cũng là hình chữ nhật)`, visual: svgGrid(2, n), answer: 3 * C2(n + 1), solution: `Chọn 2 trong 3 đường ngang: 3 cách. Chọn 2 trong ${n + 1} đường dọc: ${C2(n + 1)} cách. Số hình chữ nhật: 3 × ${C2(n + 1)} = <b>${3 * C2(n + 1)}</b>.` }); },
        () => { const n = R.int(2, 4), s = sum(range(1, n).map(k => k * k)); return mk({ text: `Hình vẽ là lưới ô vuông ${n} × ${n}. Có bao nhiêu hình vuông trong hình vẽ?`, visual: svgGrid(n, n), answer: s, solution: `Hình vuông cạnh 1 ô: ${n * n}; ${range(2, n).map(k => `cạnh ${k} ô: ${(n - k + 1) ** 2}`).join('; ')}. Tổng: <b>${s}</b>.` }); },
      ]);
    }
    return V(R, [
      () => { const r = R.int(3, 4), c = R.int(3, 5); return mk({ text: `Hình vẽ là lưới gồm ${r} hàng, ${c} cột ô vuông. Có bao nhiêu hình chữ nhật trong hình vẽ? (hình vuông cũng là hình chữ nhật)`, visual: svgGrid(r, c), answer: C2(r + 1) * C2(c + 1), solution: `Mỗi hình chữ nhật được xác định bởi 2 đường ngang (trong ${r + 1} đường: ${C2(r + 1)} cách) và 2 đường dọc (trong ${c + 1} đường: ${C2(c + 1)} cách). Số hình: ${C2(r + 1)} × ${C2(c + 1)} = <b>${C2(r + 1) * C2(c + 1)}</b>.` }); },
      () => { const r = R.int(2, 4), c = R.int(r + 1, 6), s = sum(range(1, r).map(k => (r - k + 1) * (c - k + 1))); return mk({ text: `Hình vẽ là lưới gồm ${r} hàng, ${c} cột ô vuông. Có bao nhiêu hình vuông trong hình vẽ?`, visual: svgGrid(r, c), answer: s, solution: `${range(1, r).map(k => `Cạnh ${k} ô: ${r - k + 1} × ${c - k + 1} = ${(r - k + 1) * (c - k + 1)}`).join('; ')}. Tổng: <b>${s}</b>.` }); },
      () => { const r = R.int(2, 3), c = R.int(3, 5), tot = C2(r + 1) * C2(c + 1), sq = sum(range(1, r).map(k => (r - k + 1) * (c - k + 1))); return mk({ text: `Hình vẽ là lưới gồm ${r} hàng, ${c} cột ô vuông. Có bao nhiêu hình chữ nhật mà không phải là hình vuông?`, visual: svgGrid(r, c), answer: tot - sq, solution: `Tất cả hình chữ nhật: ${C2(r + 1)} × ${C2(c + 1)} = ${tot}. Số hình vuông: ${sq}. Không phải hình vuông: ${tot} − ${sq} = <b>${tot - sq}</b>.` }); },
    ]);
  }

  function coCoins(R, lv) {
    const den = lv === 1 ? [1, 2, 5] : [2, 5, 10], n = lv === 1 ? R.int(6, 12) : 2 * R.int(8, 20);
    const list = [];
    for (let c = 0; den[2] * c <= n; c++) for (let b = 0; den[2] * c + den[1] * b <= n; b++) {
      const rest = n - den[2] * c - den[1] * b;
      if (rest % den[0]) continue;
      list.push([[c, den[2]], [b, den[1]], [rest / den[0], den[0]]].filter(x => x[0]).map(([k, d]) => `${k} tờ ${d}`).join(' + '));
    }
    return mk({ text: `Có nhiều tờ tiền loại ${den.map(d => `${d} nghìn`).join(', ')} đồng. Hỏi có bao nhiêu cách lấy ra các tờ tiền để được đúng ${n} nghìn đồng?`, answer: list.length, solution: `Xét số tờ ${den[2]} nghìn, rồi số tờ ${den[1]} nghìn, phần còn lại bằng tờ ${den[0]} nghìn${lv === 2 ? ' (phải chia hết cho 2)' : ''}. Các cách (tờ ... nghìn): ${list.join('; ')}. Có <b>${list.length}</b> cách.` });
  }

  // =====================================================================
  // ĐĂNG KÝ LỚP 5
  // =====================================================================
  const G = (id, fn, lv) => ({ id, fn, lv });
  const L_ = T.L_;
  T.addGrade(5, {
    topics: {
      logic: {
        desc: 'Dãy số, dãy chữ lặp, lịch – ngày tháng, tuổi, giả thiết tạm, ai nói thật, bảng suy luận, trồng cây, góc đồng hồ',
        points: [
          'Dãy cách đều: số hạng thứ n = số đầu + (n − 1) × khoảng cách; số số hạng = (số cuối − số đầu) : khoảng cách + 1; tổng = (số đầu + số cuối) × số số hạng : 2.',
          'Dãy lặp lại theo chu kỳ k: lấy n chia cho k, nhìn số dư để biết vị trí trong nhóm (dư 0 là phần tử cuối nhóm).',
          'Lịch: cứ 7 ngày lặp lại thứ cũ. Năm nhuận (chia hết cho 4, trừ năm tròn trăm không chia hết cho 400) có 366 ngày, tháng 2 có 29 ngày.',
          'Tuổi: hiệu số tuổi không đổi; mỗi năm tổng tuổi của n người tăng thêm n. Dùng sơ đồ đoạn thẳng với tổng – hiệu, tổng – tỉ, hiệu – tỉ.',
          'Giả thiết tạm: giả sử tất cả cùng một loại, tính phần chênh lệch rồi chia cho chênh lệch của mỗi con (mỗi xe, mỗi câu...).',
          'Ai nói thật: thử lần lượt từng trường hợp, đếm số câu đúng và chọn trường hợp khớp với điều kiện của đề.',
          'Trồng cây: đường thẳng trồng hai đầu thì số cây = số khoảng + 1; đường khép kín thì số cây = số khoảng. Đồng hồ: mỗi số cách nhau 30°, mỗi phút kim phút quay 6°, kim giờ quay 0,5°.',
        ],
        tips: [
          'Lập bảng khi bài có nhiều người và nhiều đặc điểm; đánh dấu ✗ cho ô bị loại, ✓ cho ô chắc chắn.',
          'Bài lịch: luôn đếm số ngày chênh lệch rồi chia cho 7, chỉ cần quan tâm số dư.',
          'Bài tuổi: vẽ sơ đồ ở thời điểm biết tỉ số, nhớ hiệu tuổi giữ nguyên ở mọi thời điểm.',
        ],
        examples: [
          { q: 'Tìm số hạng thứ 50 của dãy 3; 7; 11; 15; ...', a: 'Dãy cách đều 4. Số hạng thứ 50 = 3 + 49 × 4 = <b>199</b>.' },
          { q: 'Vừa gà vừa chó có 36 con, có 100 chân. Hỏi có bao nhiêu con chó?', a: 'Giả sử cả 36 con là gà: 72 chân, thiếu 28 chân. Mỗi chó hơn gà 2 chân: 28 : 2 = <b>14</b> con chó.' },
          { q: 'Lúc 3 giờ 30 phút, góc nhỏ giữa hai kim đồng hồ là bao nhiêu độ?', a: 'Kim phút chỉ số 6, kim giờ ở chính giữa số 3 và số 4. Hai kim cách nhau 2,5 khoảng: 2,5 × 30 = <b>75°</b>.' },
          { q: 'Một tháng có ba ngày Chủ nhật là ngày chẵn. Ngày 15 tháng đó là thứ mấy?', a: 'Ba Chủ nhật chẵn là ngày 2, 16, 30. Ngày 16 là Chủ nhật nên ngày 15 là <b>thứ Bảy</b>.' },
        ],
      },
      arith: {
        desc: 'Số thập phân, tỉ số phần trăm, phân số – hỗn số, tính nhanh, trung bình cộng, tổng – hiệu – tỉ, tỉ lệ, chuyển động đều, công việc chung',
        points: [
          'Số thập phân: cộng trừ thì đặt thẳng dấu phẩy; nhân như số tự nhiên rồi tách phần thập phân; nhân với 10, 100, 1000 dời dấu phẩy sang phải, nhân với 0,1; 0,01 dời sang trái.',
          'Tỉ số phần trăm của a và b: a : b × 100. Tìm p% của x: x × p : 100. Biết p% của một số là a thì số đó = a : p × 100.',
          'Phân số: quy đồng để cộng trừ; nhân tử với tử, mẫu với mẫu; chia là nhân với phân số đảo ngược. Hỗn số a b/c = (a × c + b)/c.',
          'Tính nhanh: a × b + a × c = a × (b + c); tách 1/(n × (n + 1)) = 1/n − 1/(n + 1) để các số triệt tiêu.',
          'Trung bình cộng = tổng các số : số các số. Tổng – hiệu: số lớn = (tổng + hiệu) : 2. Tổng – tỉ, hiệu – tỉ: tìm giá trị một phần.',
          'Chuyển động đều: s = v × t. Ngược chiều gặp nhau: t = quãng đường : (v1 + v2); cùng chiều đuổi kịp: t = khoảng cách : (v1 − v2). Xuôi dòng = v + v nước, ngược dòng = v − v nước.',
          'Công việc chung: làm xong trong a giờ thì mỗi giờ làm được 1/a công việc; cộng các phần lại rồi lấy 1 chia cho tổng.',
        ],
        tips: [
          'Đổi thời gian ra giờ (dạng số thập phân) trước khi tính vận tốc, quãng đường: 2 giờ 15 phút = 2,25 giờ.',
          'Bài phần trăm: coi số gốc là 100%, viết mọi đại lượng theo phần trăm của số gốc.',
          'Đề yêu cầu phân số thì nhớ rút gọn đến tối giản.',
        ],
        examples: [
          { q: 'Tính: 4,7 × 6,3 + 4,7 × 3,7', a: '= 4,7 × (6,3 + 3,7) = 4,7 × 10 = <b>47</b>.' },
          { q: 'Một chiếc cặp giá 200.000 đồng, giảm giá 15%. Giá mới là bao nhiêu?', a: 'Giảm 200.000 × 15 : 100 = 30.000 đồng. Giá mới: <b>170.000</b> đồng.' },
          { q: 'Tính 1/(1×2) + 1/(2×3) + ... + 1/(9×10)', a: '= 1 − 1/2 + 1/2 − 1/3 + ... + 1/9 − 1/10 = 1 − 1/10 = <b>9/10</b>.' },
          { q: 'Quãng đường AB dài 180 km. Hai xe đi ngược chiều từ A và B với vận tốc 40 km/giờ và 50 km/giờ. Sau bao lâu gặp nhau?', a: 'Mỗi giờ gần nhau 90 km. Thời gian: 180 : 90 = <b>2 giờ</b>.' },
        ],
      },
      number: {
        desc: 'Hàng của số thập phân, so sánh – làm tròn, chia hết, ước – bội, số nguyên tố, chữ số tận cùng, số dư, đánh số trang, cấu tạo số',
        points: [
          'Số thập phân: phần nguyên bên trái dấu phẩy, phần thập phân bên phải (phần mười, phần trăm, phần nghìn). So sánh phần nguyên trước, rồi từng hàng thập phân.',
          'Dấu hiệu chia hết: cho 2 (tận cùng chẵn), 5 (tận cùng 0, 5), 3 và 9 (tổng chữ số chia hết cho 3, 9), 4 (hai chữ số cuối tạo thành số chia hết cho 4).',
          'Số nguyên tố chỉ có hai ước là 1 và chính nó (2, 3, 5, 7, 11, 13, ...). Số có đúng 3 ước là bình phương của số nguyên tố (4, 9, 25, 49, ...).',
          'Chữ số tận cùng của tích chỉ phụ thuộc chữ số tận cùng các thừa số. Tích nhiều số 2 có tận cùng lặp lại 2, 4, 8, 6; số 3: 3, 9, 7, 1.',
          'Số chữ số 0 tận cùng của 1 × 2 × ... × n bằng số thừa số 5: n : 5 + n : 25 + ... (lấy phần nguyên).',
          'Số bị chia = thương × số chia + số dư (số dư nhỏ hơn số chia). Một số và tổng các chữ số của nó có cùng số dư khi chia cho 3, cho 9.',
          'Đánh số trang: trang 1 – 9 dùng 9 chữ số, 10 – 99 dùng 180 chữ số, từ 100 mỗi trang 3 chữ số. Viết thêm chữ số 0 vào bên phải một số thì số đó gấp 10 lần.',
        ],
        tips: [
          'Bài "chia cho 2, 3, 4, 5, 6 đều dư 1": bớt 1 thì chia hết, tìm số bé nhất chia hết cho tất cả rồi cộng 1.',
          'Đếm số chia hết cho a hoặc b: cộng hai nhóm rồi trừ phần đếm trùng (chia hết cho cả hai).',
          'Bài thêm/xóa chữ số: viết số mới theo số cũ (ví dụ số mới = số cũ × 10 + d) rồi lập phép tính.',
        ],
        examples: [
          { q: 'Tìm chữ số a để số 3a5 chia hết cho 9.', a: '3 + a + 5 = 8 + a chia hết cho 9 nên a = <b>1</b>.' },
          { q: 'Tích 1 × 2 × 3 × ... × 30 có tận cùng bao nhiêu chữ số 0?', a: 'Có 6 số chia hết cho 5 và 1 số chia hết cho 25 (số 25 cho thêm một thừa số 5): 6 + 1 = <b>7</b> chữ số 0.' },
          { q: 'Đánh số trang một quyển sách dày 120 trang cần bao nhiêu chữ số?', a: '9 × 1 + 90 × 2 + 21 × 3 = 9 + 180 + 63 = <b>252</b> chữ số.' },
          { q: 'Viết thêm chữ số 0 vào bên phải một số thì số đó tăng 432 đơn vị. Tìm số đó.', a: 'Số mới gấp 10 lần, tức tăng 9 lần số cũ: 432 : 9 = <b>48</b>.' },
        ],
      },
      geo: {
        desc: 'Tam giác, hình thang, hình tròn, hình hộp chữ nhật – lập phương, hình ghép, đổi đơn vị diện tích – thể tích, số đo thời gian, đếm hình',
        points: [
          'Tam giác: S = đáy × chiều cao : 2. Hình thang: S = (đáy lớn + đáy bé) × chiều cao : 2.',
          'Hình tròn: chu vi C = d × 3,14 = r × 2 × 3,14; diện tích S = r × r × 3,14.',
          'Hình hộp chữ nhật: Sxq = chu vi đáy × chiều cao; Stp = Sxq + 2 × diện tích đáy; V = dài × rộng × cao. Lập phương cạnh a: Sxq = a × a × 4, Stp = a × a × 6, V = a × a × a.',
          'Đơn vị diện tích liền nhau hơn kém nhau 100 lần (km², ha, m², dm², cm²); 1 ha = 10.000 m². Đơn vị thể tích liền nhau hơn kém nhau 1000 lần; 1 dm³ = 1 lít.',
          'Cạnh tăng gấp k lần: diện tích gấp k × k lần, thể tích gấp k × k × k lần.',
          'Hình ghép, khoét: chia thành các hình quen thuộc rồi cộng, hoặc lấy hình lớn trừ phần bị khoét.',
          'Thời gian: 1 giờ = 60 phút, 1 ngày = 24 giờ, 1 thế kỉ = 100 năm. Khi cộng giờ phút, đủ 60 phút thì đổi thành 1 giờ.',
        ],
        tips: [
          'Luôn đưa các kích thước về cùng một đơn vị trước khi tính.',
          'Bài "kéo dài đáy thêm x thì diện tích tăng y": phần tăng là một tam giác có đáy x, tìm chiều cao = y × 2 : x.',
          'Bài đếm tam giác, hình thang trong hình quạt: đếm số cặp cạnh xiên rồi nhân với số đoạn nằm ngang (hoặc số cặp đoạn ngang).',
        ],
        examples: [
          { q: 'Hình tròn bán kính 5 cm có diện tích bao nhiêu?', a: 'S = 5 × 5 × 3,14 = <b>78,5 cm²</b>.' },
          { q: 'Hình thang có hai đáy 12 cm, 8 cm, chiều cao 5 cm. Tính diện tích.', a: 'S = (12 + 8) × 5 : 2 = <b>50 cm²</b>.' },
          { q: 'Bể nước dài 2 m, rộng 1,5 m, cao 1 m chứa được bao nhiêu lít?', a: 'V = 2 × 1,5 × 1 = 3 m³ = 3000 dm³ = <b>3000 lít</b>.' },
          { q: 'Hình lập phương có cạnh tăng gấp 3 thì thể tích gấp mấy lần?', a: '3 × 3 × 3 = <b>27</b> lần.' },
        ],
      },
      comb: {
        desc: 'Quy tắc cộng – nhân, lập số, xếp hàng, chọn nhóm, bắt tay – thi đấu, đường đi trên lưới, Dirichlet, Venn, đếm hình',
        points: [
          'Quy tắc nhân: làm nhiều bước liên tiếp thì nhân số cách của từng bước. Quy tắc cộng: chọn một trong các trường hợp riêng biệt thì cộng.',
          'Lập số: chữ số đầu khác 0; với điều kiện chẵn hoặc chia hết cho 5, chọn chữ số tận cùng trước.',
          'Xếp n bạn thành hàng: n × (n − 1) × ... × 1 cách. Hai bạn đứng cạnh nhau: coi là một khối rồi nhân 2.',
          'Chọn 2 trong n (không thứ tự): n × (n − 1) : 2; chọn 3 trong n: n × (n − 1) × (n − 2) : 6. Bắt tay, thi đấu vòng tròn một lượt cũng là chọn 2.',
          'Đường đi trên lưới (chỉ sang phải, lên trên): ghi số cách đến mỗi nút = tổng số ở nút bên trái và nút bên dưới.',
          'Dirichlet: muốn "chắc chắn" thì xét trường hợp xui nhất rồi cộng thêm 1.',
          'Venn hai tập: số phần tử thuộc A hoặc B = |A| + |B| − |cả hai|. Số hình chữ nhật trong lưới = (số cách chọn 2 đường ngang) × (số cách chọn 2 đường dọc).',
        ],
        tips: [
          'Bài "ít nhất một": đếm tất cả rồi trừ đi trường hợp "không có cái nào".',
          'Bài có thứ tự (lớp trưởng – lớp phó) thì không chia 2; bài chọn nhóm (không thứ tự) thì chia cho số cách xếp trong nhóm.',
        ],
        examples: [
          { q: 'Từ các chữ số 0, 1, 2, 3 lập được bao nhiêu số có ba chữ số khác nhau?', a: 'Hàng trăm 3 cách, hàng chục 3 cách, hàng đơn vị 2 cách: 3 × 3 × 2 = <b>18</b> số.' },
          { q: '10 đội đá vòng tròn một lượt. Có bao nhiêu trận?', a: '10 × 9 : 2 = <b>45</b> trận.' },
          { q: 'Có 5 bạn xếp hàng, An và Bình đứng cạnh nhau. Có bao nhiêu cách?', a: 'Coi An – Bình là một khối: 4 × 3 × 2 × 1 = 24, nhân 2 cách đổi chỗ trong khối: <b>48</b> cách.' },
          { q: 'Lớp 40 bạn, 25 bạn thích bóng đá, 20 bạn thích cầu lông. Ít nhất bao nhiêu bạn thích cả hai?', a: '25 + 20 − 40 = <b>5</b> bạn.' },
        ],
      },
    },
    gens: {
      logic: [
        G('seq0', loSeq0, [0]), G('order0', loOrder0, [0]), G('cycle', loCycle, [0, 1, 2]), G('age', loAge, [0, 1, 2, 3]),
        G('trees', loTrees, [0, 1, 2, 3]), G('seq', loSeq, [1, 2, 3]), G('calendar', loCalendar, [1, 2, 3]),
        G('assume', loAssume, [1, 2, 3]), G('truth', loTruth, [1, 2, 3]), G('match', loMatch, [1, 2, 3]), G('clock', loClock, [1, 2, 3]),
      ],
      arith: [
        G('calc0', arCalc0, [0]), G('dec', arDec, [0, 1, 2]), G('mul10', arMul10, [0, 1]), G('frac', arFrac, [0, 1, 2]),
        G('avg', arAvg, [0, 1, 2, 3]), G('sumdiff', arSumDiff, [0, 1, 2, 3]), G('pct', arPct, [1, 2, 3]), G('quick', arQuick, [1, 2, 3]),
        G('ratio', arRatio, [1, 2]), G('motion', arMotion, [1, 2, 3]), G('unknown', arUnknown, [1, 2]), G('work', arWork, [2, 3]),
      ],
      number: [
        G('div0', nuDiv0, [0]), G('place0', nuPlace0, [0]), G('cmpdec', nuCmpDec, [0, 1]), G('count', nuCount, [0, 1, 2, 3]),
        G('parity', nuParity, [0, 1, 2]), G('divis', nuDivis, [1, 2, 3]), G('lastdig', nuLastDig, [1, 2, 3]), G('rem', nuRem, [1, 2, 3]),
        G('pages', nuPages, [1, 2, 3]), G('divisors', nuDivisors, [1, 2, 3]), G('digitsum', nuDigitSum, [1, 2, 3]), G('adddigit', nuAddDigit, [2, 3]),
      ],
      geo: [
        G('area0', geArea0, [0]), G('tri', geTri, [0, 1, 2]), G('box', geBox, [0, 1, 2, 3]), G('units', geUnits, [0, 1, 2]),
        G('time', geTime, [0, 1, 2]), G('trap', geTrap, [1, 2, 3]), G('circle', geCircle, [1, 2, 3]), G('compose', geCompose, [1, 2, 3]),
        G('countfig', geCountFig, [1, 2, 3]), G('change', geChange, [2, 3]),
      ],
      comb: [
        G('rule', coRule, [0, 1, 2]), G('hand', coHand, [0, 1, 2, 3]), G('numbers', coNumbers, [0, 1, 2, 3]), G('pigeon', coPigeon, [0, 1, 2, 3]),
        G('perm', coPerm, [1, 2, 3]), G('choose', coChoose, [1, 2, 3]), G('grid', coGrid, [1, 2, 3]), G('venn', coVenn, [1, 2, 3]),
        G('coins', coCoins, [1, 2]), G('countshape', coCountShape, [2, 3]),
      ],
    },
    lessons: {
      logic: T.lessonPath(
        [L_('Dãy số thập phân, dãy hình', 'seq0', 'cycle'), L_('So sánh, tính tuổi', 'order0', 'age'), L_('Trồng cây', 'trees', 'seq0')],
        [L_('Dãy số cách đều, dãy chữ lặp', 'seq', 'cycle'), L_('Lịch và đồng hồ', 'calendar', 'clock'), L_('Tuổi, giả thiết tạm', 'age', 'assume'), L_('Suy luận logic', 'truth', 'match', 'trees')],
        [L_('Quy luật, lịch, đồng hồ nâng cao', 'seq', 'cycle', 'calendar', 'clock'), L_('Suy luận, tuổi, giả thiết tạm nâng cao', 'truth', 'match', 'age', 'assume', 'trees')]),
      arith: T.lessonPath(
        [L_('Ôn tập bốn phép tính', 'calc0', 'avg'), L_('Số thập phân, nhân chia nhẩm', 'dec', 'mul10'), L_('Phân số, tổng – hiệu', 'frac', 'sumdiff')],
        [L_('Số thập phân, tìm số chưa biết', 'dec', 'mul10', 'unknown'), L_('Tỉ số phần trăm', 'pct'), L_('Phân số, tính nhanh, trung bình cộng', 'frac', 'quick', 'avg'), L_('Tổng – tỉ, tỉ lệ, chuyển động', 'sumdiff', 'ratio', 'motion')],
        [L_('Phần trăm, phân số, tính nhanh nâng cao', 'pct', 'frac', 'quick', 'dec', 'unknown'), L_('Chuyển động, công việc chung, tổng – tỉ', 'motion', 'work', 'sumdiff', 'avg', 'ratio')]),
      number: T.lessonPath(
        [L_('Dấu hiệu chia hết', 'div0', 'count'), L_('Hàng của số thập phân', 'place0', 'cmpdec'), L_('Chẵn lẻ, so sánh số thập phân', 'parity', 'cmpdec')],
        [L_('Làm tròn, chia hết', 'cmpdec', 'divis', 'count'), L_('Ước, bội, số nguyên tố', 'divisors', 'rem'), L_('Chữ số tận cùng, chẵn lẻ', 'lastdig', 'parity'), L_('Đánh số trang, tổng các chữ số', 'pages', 'digitsum')],
        [L_('Chia hết, số dư, ước bội nâng cao', 'divis', 'count', 'rem', 'divisors'), L_('Chữ số và cấu tạo số', 'lastdig', 'pages', 'digitsum', 'adddigit', 'parity')]),
      geo: T.lessonPath(
        [L_('Chu vi, diện tích, tam giác', 'area0', 'tri'), L_('Hình hộp, hình lập phương', 'box', 'units'), L_('Đơn vị đo, số đo thời gian', 'units', 'time')],
        [L_('Tam giác, hình thang', 'tri', 'trap'), L_('Hình tròn', 'circle', 'compose'), L_('Hình hộp, đổi đơn vị', 'box', 'units', 'time'), L_('Hình ghép, đếm hình', 'compose', 'countfig')],
        [L_('Diện tích nâng cao', 'tri', 'trap', 'circle', 'change'), L_('Thể tích, hình ghép, đếm hình nâng cao', 'box', 'compose', 'countfig', 'change', 'time')]),
      comb: T.lessonPath(
        [L_('Quy tắc cộng và nhân', 'rule', 'numbers'), L_('Bắt tay', 'hand', 'rule'), L_('Chắc chắn lấy được', 'pigeon', 'numbers')],
        [L_('Quy tắc đếm, lập số', 'rule', 'numbers', 'coins'), L_('Xếp hàng, chọn nhóm', 'perm', 'choose'), L_('Bắt tay, đường đi trên lưới', 'hand', 'grid'), L_('Dirichlet, Venn', 'pigeon', 'venn')],
        [L_('Lập số, xếp hàng, chọn nhóm nâng cao', 'numbers', 'perm', 'choose', 'rule'), L_('Đếm hình, đường đi, Dirichlet', 'countshape', 'grid', 'pigeon', 'venn', 'hand')]),
    },
  });
})(window.T);
