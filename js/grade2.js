// Nội dung Toán lớp 2 (chương trình SGK 2018 + dạng bài TIMO lớp 2)
(function (T) {
  'use strict';
  const { mk, choicesOf, box, C2, range, sum, digitsOf, line, svg, INK, NAMES, SHAPES, FRUITS, ANIMALS,
    svgSegments, svgFan, svgGrid, svgClock, svgSquareDiag, svgOneShape, groupsOf5, fmt } = T.GH;

  // ---------- helpers ----------
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const pick = (R, fns) => R.pick(fns)();
  const rep = (x, n) => Array(n).fill(x).join(' + ');
  const LT = '&lt;', GT = '&gt;';
  const signHtml = s => (s === '<' ? LT : s === '>' ? GT : s);
  const DAYS = ['Chủ nhật', 'thứ Hai', 'thứ Ba', 'thứ Tư', 'thứ Năm', 'thứ Sáu', 'thứ Bảy'];
  const mod7 = i => ((i % 7) + 7) % 7;
  const day = i => DAYS[mod7(i)];
  const dayCap = i => cap(day(i));
  const dayChoices = (R, i) => choicesOf(R, dayCap(i), range(0, 6).filter(k => k !== mod7(i)).map(dayCap));
  const dig = (n, i) => Math.floor(n / 10 ** i) % 10;
  const PLACE = ['đơn vị', 'chục', 'trăm', 'nghìn'];
  const W = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  // Đọc số 0 – 999 bằng chữ
  function readNum(n) {
    if (n < 10) return W[n];
    const h = Math.floor(n / 100), t = Math.floor(n / 10) % 10, u = n % 10, s = [];
    if (h) s.push(W[h] + ' trăm');
    if (t === 0) { if (u) s.push('linh ' + W[u]); } else if (t === 1) { s.push('mười'); if (u) s.push(u === 5 ? 'lăm' : W[u]); } else { s.push(W[t] + ' mươi'); if (u) s.push(u === 1 ? 'mốt' : u === 5 ? 'lăm' : W[u]); }
    return s.join(' ');
  }
  // Lời giải cộng/trừ theo cột (đặt tính)
  function addSteps(a, b) {
    const L = String(Math.max(a, b)).length, parts = [];
    let c = 0;
    for (let i = 0; i < L; i++) {
      const x = dig(a, i), y = dig(b, i), s = x + y + c;
      const last = i === L - 1;
      parts.push(`hàng ${PLACE[i]}: ${x} + ${y}${c ? ' + 1 (nhớ)' : ''} = ${s}${s >= 10 && !last ? `, viết ${s % 10} nhớ 1` : ''}`);
      c = s >= 10 ? 1 : 0;
    }
    return `Đặt tính rồi cộng từ phải sang trái: ${parts.join('; ')}. Vậy ${a} + ${b} = <b>${a + b}</b>.`;
  }
  function subSteps(a, b) {
    const L = String(a).length, parts = [];
    let br = 0;
    for (let i = 0; i < L; i++) {
      const x = dig(a, i), y0 = dig(b, i), y = y0 + br;
      if (b < 10 ** i && !br) break;
      const pre = br ? `${y0} thêm 1 là ${y}; ` : '';
      if (x >= y) { parts.push(`hàng ${PLACE[i]}: ${pre}${x} − ${y} = ${x - y}`); br = 0; } else { parts.push(`hàng ${PLACE[i]}: ${pre}${x} không trừ được ${y}, lấy ${x + 10} − ${y} = ${x + 10 - y}, viết ${x + 10 - y} nhớ 1`); br = 1; }
    }
    return `Đặt tính rồi trừ từ phải sang trái: ${parts.join('; ')}. Vậy ${a} − ${b} = <b>${a - b}</b>.`;
  }
  // Các số có ba / hai chữ số lập từ các chữ số đã cho (mỗi chữ số dùng một lần, trừ khi cho lặp)
  function make3(ds, allowRep) {
    const out = new Set(), n = ds.length;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) {
      if (!allowRep && (i === j || j === k || i === k)) continue;
      if (ds[i] === 0) continue;
      out.add(100 * ds[i] + 10 * ds[j] + ds[k]);
    }
    return [...out].sort((x, y) => x - y);
  }
  function make2(ds, allowRep) {
    const out = new Set();
    ds.forEach((a, i) => ds.forEach((b, j) => { if (a !== 0 && (allowRep || i !== j)) out.add(10 * a + b); }));
    return [...out].sort((x, y) => x - y);
  }
  const listOrCount = (arr, max = 16) => (arr.length <= max ? arr.join(', ') : `${arr.slice(0, 5).join(', ')}, ..., ${arr[arr.length - 1]}`);

  // =====================================================================
  // TƯ DUY LOGIC
  // =====================================================================
  function seqQ(R, t, why, calc, minK = 1, missP = 0.35) {
    if (R.chance(missP)) {
      const k = R.int(minK, t.length - 2);
      return mk({
        text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${t.map((v, i) => (i === k ? box : v)).join(', ')}</div>`,
        answer: t[k], solution: `${why} Ô trống là ${calc(k)} = <b>${t[k]}</b>.`,
      });
    }
    const n = t.length - 1;
    return mk({
      text: `Tìm số tiếp theo của dãy số:<div class="seq">${t.slice(0, n).join(', ')}, ?</div>`,
      answer: t[n], solution: `${why} Số tiếp theo là ${calc(n)} = <b>${t[n]}</b>.`,
    });
  }
  const arith = (a, s, n) => range(0, n - 1).map(i => a + s * i);
  const seqAdd = (R, a, s, n) => { const t = arith(a, s, n); return seqQ(R, t, `Mỗi số hơn số đứng trước ${s} đơn vị.`, i => `${t[i - 1]} + ${s}`); };
  const seqSub = (R, a, s, n) => { const t = arith(a, -s, n); return seqQ(R, t, `Mỗi số kém số đứng trước ${s} đơn vị.`, i => `${t[i - 1]} − ${s}`); };

  function logicSeq(R, lv) {
    if (lv === 0) {
      if (R.chance(0.6)) { const s = R.pick([1, 2, 2, 5, 10]); return seqAdd(R, s === 1 ? R.int(10, 30) : s * R.int(0, 4), s, 5); }
      const s = R.pick([1, 2, 10]); return seqSub(R, s * R.int(5, 9) + (s === 1 ? R.int(0, 10) : 0), s, 5);
    }
    if (lv === 1) {
      return pick(R, [
        () => seqAdd(R, R.int(0, 40), R.int(2, 10), 6),
        () => { const s = R.int(2, 10); return seqSub(R, 5 * s + R.int(1, 40), s, 6); },
        () => { const s = R.pick([10, 50, 100]); return seqAdd(R, s === 100 ? 100 * R.int(1, 4) : s * R.int(1, 8), s, 6); },
      ]);
    }
    const kind = lv === 2 ? R.pick(['alt', 'altsub', 'double', 'big', 'down']) : R.pick(['grow', 'fib', 'two', 'double', 'altsub', 'grow']);
    if (kind === 'big') return seqAdd(R, R.int(10, 300), R.pick([11, 12, 15, 20, 25, 50]), 6);
    if (kind === 'down') { const s = R.pick([5, 9, 11, 15, 20, 100]); return seqSub(R, 5 * s + R.int(5, s === 100 ? 400 : 60), s, 6); }
    if (kind === 'alt') {
      const x = R.int(1, 9); let y = R.int(1, 9); while (y === x) y = R.int(1, 9);
      const t = [R.int(1, 30)];
      for (let i = 1; i < 6; i++) t.push(t[i - 1] + (i % 2 ? x : y));
      return seqQ(R, t, `Quy luật: cộng ${x}, cộng ${y}, cộng ${x}, cộng ${y}, ... xen kẽ nhau.`, i => `${t[i - 1]} + ${i % 2 ? x : y}`);
    }
    if (kind === 'altsub') {
      const x = R.int(4, lv === 2 ? 9 : 15), y = R.int(1, x - 1);
      const t = [R.int(5, 40)];
      for (let i = 1; i < 6; i++) t.push(t[i - 1] + (i % 2 ? x : -y));
      return seqQ(R, t, `Quy luật: cộng ${x} rồi trừ ${y}, cứ thế lặp lại.`, i => `${t[i - 1]} ${i % 2 ? '+' : '−'} ${i % 2 ? x : y}`);
    }
    if (kind === 'double') {
      const t = [R.int(1, lv === 2 ? 5 : 9)];
      for (let i = 1; i < 6; i++) t.push(t[i - 1] * 2);
      return seqQ(R, t, 'Mỗi số gấp đôi số đứng trước (số sau = số trước + số trước).', i => `${t[i - 1]} + ${t[i - 1]}`);
    }
    if (kind === 'grow') {
      const d0 = R.int(1, 3), e = R.int(1, 2), t = [R.int(1, 20)];
      for (let i = 1; i < 6; i++) t.push(t[i - 1] + d0 + (i - 1) * e);
      return seqQ(R, t, `Khoảng cách giữa hai số liền nhau tăng dần: +${d0}, +${d0 + e}, +${d0 + 2 * e}, +${d0 + 3 * e}, ...`, i => `${t[i - 1]} + ${d0 + (i - 1) * e}`);
    }
    if (kind === 'fib') {
      const t = [R.int(1, 4), R.int(1, 5)];
      for (let i = 2; i < 7; i++) t.push(t[i - 1] + t[i - 2]);
      return seqQ(R, t, 'Từ số thứ ba, mỗi số bằng tổng của hai số đứng ngay trước nó.', i => `${t[i - 2]} + ${t[i - 1]}`, 2);
    }
    const p = R.int(1, 5), q = R.pick([5, 10, 2, 3]) * (R.chance(0.5) ? 1 : -1);
    const t = [R.int(1, 9), q > 0 ? R.int(10, 30) : R.int(60, 90)];
    for (let i = 2; i < 7; i++) t.push(t[i - 2] + (i % 2 ? q : p));
    return seqQ(R, t, `Dãy gồm hai dãy xen kẽ nhau: các số ở vị trí thứ 1, 3, 5, ... tăng ${p}; các số ở vị trí thứ 2, 4, 6, ... ${q > 0 ? 'tăng' : 'giảm'} ${Math.abs(q)}.`,
      i => `${t[i - 2]} ${(i % 2 ? q : p) > 0 ? '+' : '−'} ${Math.abs(i % 2 ? q : p)}`, 2);
  }

  function logicPattern(R, lv) {
    const [a, b, c, d] = R.sample(SHAPES, 4);
    const pat = lv === 0 ? R.pick([[a, b], [a, b, c], [a, a, b], [a, b, b]])
      : lv === 1 ? R.pick([[a, b], [a, b, c], [a, a, b]])
        : lv === 2 ? R.pick([[a, b, c], [a, a, b], [a, b, c, d], [a, b, b, c]])
          : R.pick([[a, b, c, d], [a, a, b, c], [a, b, a, c], [a, a, b, b, c]]);
    const k = pat.length, uniq = [...new Set(pat)];
    const extra = SHAPES.filter(s => !uniq.includes(s));
    if (lv === 0) {
      const L = 2 * k + R.int(0, k - 1), ans = pat[L % k];
      return mk({
        type: 'choice', choices: choicesOf(R, ans, uniq.concat(R.sample(extra, 1))),
        text: `Hình tiếp theo là hình nào?<div class="seq emoji">${range(0, L - 1).map(i => pat[i % k]).join(' ')} ?</div>`,
        answer: ans, solution: `Nhóm hình ${pat.join('')} lặp lại liên tục. Hình tiếp theo là <b>${ans}</b>.`,
      });
    }
    const shown = `<div class="seq emoji">${range(0, 2 * k - 1).map(i => pat[i % k]).join(' ')} ...</div>`;
    if (lv === 3 && R.chance(0.5)) {
      const X = R.pick(uniq), N = R.int(20, 40), q = Math.floor(N / k), r = N % k;
      const inPat = pat.filter(s => s === X).length, inRest = pat.slice(0, r).filter(s => s === X).length, ans = q * inPat + inRest;
      return mk({
        text: `Các hình được xếp theo quy luật:${shown}Trong ${N} hình đầu tiên có bao nhiêu hình ${X}?`, answer: ans,
        solution: `Mỗi nhóm ${k} hình ${pat.join('')} có ${inPat} hình ${X}. ${N} hình gồm ${q} nhóm đủ${r ? ` và ${r} hình đầu của nhóm tiếp theo (${pat.slice(0, r).join('')})` : ''}. Số hình ${X}: ${rep(inPat, q)}${r ? ` + ${inRest}` : ''} = <b>${ans}</b>.`,
      });
    }
    const N = lv === 1 ? R.int(8, 15) : lv === 2 ? R.int(15, 40) : R.int(40, 99);
    const q = Math.floor(N / k), r = N % k, ans = pat[(N - 1) % k];
    const ends = q <= 4 ? range(1, q).map(i => i * k).join(', ') : `${k}, ${2 * k}, ${3 * k}, ..., ${q * k}`;
    return mk({
      type: 'choice', choices: choicesOf(R, ans, uniq.concat(R.sample(extra, 1))),
      text: `Các hình được xếp theo quy luật:${shown}Hình thứ <b>${N}</b> là hình nào?`, answer: ans,
      solution: `Nhóm ${k} hình ${pat.join('')} lặp lại. Các hình thứ ${ends} là hình cuối nhóm (${pat[k - 1]}).` +
        (r === 0 ? ` Vậy hình thứ ${N} là <b>${ans}</b>.` : ` Đếm tiếp ${r} hình của nhóm mới thì được hình thứ ${N}: <b>${ans}</b>.`),
    });
  }

  const ATTRS = [
    { more: 'cao hơn', less: 'thấp hơn', most: 'cao nhất', least: 'thấp nhất', base: 'cao' },
    { more: 'nặng hơn', less: 'nhẹ hơn', most: 'nặng nhất', least: 'nhẹ nhất', base: 'nặng' },
    { more: 'chạy nhanh hơn', less: 'chạy chậm hơn', most: 'chạy nhanh nhất', least: 'chạy chậm nhất', base: 'chạy nhanh' },
    { more: 'có nhiều nhãn vở hơn', less: 'có ít nhãn vở hơn', most: 'có nhiều nhãn vở nhất', least: 'có ít nhãn vở nhất', base: 'có nhiều nhãn vở' },
    { more: 'nhiều tuổi hơn', less: 'ít tuổi hơn', most: 'nhiều tuổi nhất', least: 'ít tuổi nhất', base: 'nhiều tuổi' },
  ];
  const RANK = ['', 'nhất', 'thứ hai', 'thứ ba', 'thứ tư'];
  function logicCompare(R, lv) {
    const A = R.pick(ATTRS);
    const n = [2, 3, 4, 5][lv];
    const o = R.sample(NAMES, n);
    if (lv === 0) {
      const st = R.chance(0.5) ? `${o[0]} ${A.more} ${o[1]}` : `${o[1]} ${A.less} ${o[0]}`;
      const askMore = R.chance(0.5), ans = askMore ? o[0] : o[1];
      return mk({
        type: 'choice', choices: R.shuffle(o), text: `${st}.<br>Hỏi bạn nào ${askMore ? A.more : A.less}?`, answer: ans,
        solution: `${o[0]} ${A.more} ${o[1]}, nghĩa là ${o[1]} ${A.less} ${o[0]}. Bạn ${askMore ? A.more : A.less} là <b>${ans}</b>.`,
      });
    }
    const st = [];
    for (let i = 0; i < n - 1; i++) st.push(R.chance(0.5) ? `${o[i]} ${A.more} ${o[i + 1]}` : `${o[i + 1]} ${A.less} ${o[i]}`);
    let k;
    if (lv === 1) k = R.pick([1, n]);
    else if (lv === 2) k = R.pick([1, n, 2]);
    else k = R.pick([2, 3, 4]);
    const ans = o[k - 1];
    const word = k === n ? A.least : `${A.base} ${RANK[k]}`;
    return mk({
      type: 'choice', choices: R.shuffle(o), text: `${R.shuffle(st).join('. ')}.<br>Hỏi bạn nào ${word}?`, answer: ans,
      solution: `Xếp các bạn theo thứ tự từ ${A.most} đến ${A.least}: ${o.join(' → ')}. Bạn ${word} là <b>${ans}</b>.`,
    });
  }

  function logicPosition0(R) {
    const n = R.int(5, 7), row = R.sample(ANIMALS, n);
    const shown = `Các con vật xếp thành một hàng:<div class="seq emoji">${row.join(' ')}</div>`;
    const kind = R.pick(['where', 'which', 'right', 'between']);
    if (kind === 'where') {
      const k = R.int(1, n);
      return mk({ text: `${shown}Tính từ trái sang, con ${row[k - 1]} đứng thứ mấy?`, answer: k, solution: `Đếm từ trái sang: ${row.slice(0, k).map((x, i) => `${x} thứ ${i + 1}`).join(', ')}. Con ${row[k - 1]} đứng thứ <b>${k}</b>.` });
    }
    if (kind === 'right') {
      const k = R.int(1, n);
      return mk({ text: `${shown}Tính từ phải sang, con ${row[k - 1]} đứng thứ mấy?`, answer: n - k + 1, solution: `Đếm từ phải sang: ${row.slice(k - 1).reverse().map((x, i) => `${x} thứ ${i + 1}`).join(', ')}. Con ${row[k - 1]} đứng thứ <b>${n - k + 1}</b>.` });
    }
    if (kind === 'between') {
      const i = R.int(0, n - 3), j = R.int(i + 2, n - 1);
      return mk({ text: `${shown}Giữa con ${row[i]} và con ${row[j]} có mấy con vật?`, answer: j - i - 1, solution: `Các con ở giữa: ${row.slice(i + 1, j).join(' ')}. Có <b>${j - i - 1}</b> con.` });
    }
    const k = R.int(1, n), ans = row[k - 1];
    return mk({ type: 'choice', choices: choicesOf(R, ans, row), text: `${shown}Tính từ trái sang, con vật đứng thứ ${k} là con nào?`, answer: ans, solution: `Đếm từ trái sang đến ${k}: <b>${ans}</b>.` });
  }

  function logicQueue(R, lv) {
    const [A, B] = R.sample(NAMES, 2);
    const kinds = lv === 1 ? ['total', 'reverse', 'around'] : lv === 2 ? ['total', 'reverse', 'middle', 'shift', 'ends'] : ['gap', 'grid', 'ends2', 'reverse'];
    const kind = R.pick(kinds);
    if (kind === 'total') {
      const a = R.int(lv === 1 ? 2 : 6, lv === 1 ? 9 : 18), b = R.int(lv === 1 ? 2 : 6, lv === 1 ? 9 : 18);
      return mk({ text: `Các bạn xếp thành một hàng ngang. ${A} đứng thứ ${a} tính từ trái sang và đứng thứ ${b} tính từ phải sang. Hỏi hàng có bao nhiêu bạn?`, answer: a + b - 1, solution: `Bên trái ${A} có ${a - 1} bạn, bên phải ${A} có ${b - 1} bạn. Cả hàng có ${a - 1} + 1 + ${b - 1} = <b>${a + b - 1}</b> bạn.` });
    }
    if (kind === 'around') {
      const a = R.int(2, 15), b = R.int(2, 15);
      return mk({ text: `Trong một hàng dọc, đứng trước ${A} có ${a} bạn, đứng sau ${A} có ${b} bạn. Hỏi hàng có bao nhiêu bạn?`, answer: a + b + 1, solution: `Hàng gồm ${a} bạn đứng trước, ${A} và ${b} bạn đứng sau: ${a} + 1 + ${b} = <b>${a + b + 1}</b> bạn.` });
    }
    if (kind === 'reverse') {
      const n = R.int(lv === 1 ? 6 : 15, lv === 1 ? 12 : 35), a = R.int(2, n - 1);
      return mk({ text: `Có ${n} bạn xếp thành một hàng dọc. ${A} đứng thứ ${a} tính từ đầu hàng. Hỏi ${A} đứng thứ mấy tính từ cuối hàng?`, answer: n - a + 1, solution: `Đứng sau ${A} có ${n} − ${a} = ${n - a} bạn. Tính từ cuối hàng, ${A} đứng thứ ${n - a} + 1 = <b>${n - a + 1}</b>.` });
    }
    if (kind === 'middle') {
      const n = 2 * R.int(4, 15) + 1;
      return mk({ text: `Có ${n} bạn xếp thành một hàng. ${A} đứng chính giữa hàng. Hỏi ${A} đứng thứ mấy tính từ đầu hàng?`, answer: (n + 1) / 2, solution: `Bỏ ${A} ra còn ${n - 1} bạn, chia đều hai bên, mỗi bên ${(n - 1) / 2} bạn. ${A} đứng thứ ${(n - 1) / 2} + 1 = <b>${(n + 1) / 2}</b>.` });
    }
    if (kind === 'shift') {
      const a = R.int(2, 12), k = R.int(2, 9);
      return mk({ text: `Trong một hàng dọc, ${A} đứng thứ ${a} tính từ đầu hàng. Giữa ${A} và ${B} có ${k} bạn, ${B} đứng sau ${A}. Hỏi ${B} đứng thứ mấy tính từ đầu hàng?`, answer: a + k + 1, solution: `Từ đầu hàng đến ${A} có ${a} bạn, thêm ${k} bạn ở giữa rồi đến ${B}: ${a} + ${k} + 1 = <b>${a + k + 1}</b>.` });
    }
    if (kind === 'ends') {
      const k = R.int(3, 20);
      return mk({ text: `${A} đứng đầu hàng, ${B} đứng cuối hàng. Giữa ${A} và ${B} có ${k} bạn. Hỏi hàng có bao nhiêu bạn?`, answer: k + 2, solution: `Hàng gồm ${A}, ${k} bạn ở giữa và ${B}: 1 + ${k} + 1 = <b>${k + 2}</b> bạn.` });
    }
    if (kind === 'gap') {
      const a = R.int(2, 8), b = R.int(2, 8), n = a + b + R.int(1, 10);
      return mk({ text: `Có ${n} bạn xếp thành một hàng ngang. ${A} đứng thứ ${a} tính từ bên trái, ${B} đứng thứ ${b} tính từ bên phải (${A} đứng bên trái ${B}). Hỏi giữa ${A} và ${B} có bao nhiêu bạn?`, answer: n - a - b, solution: `Từ bên trái đến ${A} có ${a} bạn, từ ${B} đến hết bên phải có ${b} bạn. Số bạn ở giữa: ${n} − ${a} − ${b} = <b>${n - a - b}</b> bạn.` });
    }
    if (kind === 'ends2') {
      const a = R.int(2, 8), b = R.int(2, 8), k = R.int(1, 8);
      return mk({ text: `Trong một hàng ngang, ${A} đứng thứ ${a} tính từ bên trái, ${B} đứng thứ ${b} tính từ bên phải. Giữa ${A} và ${B} có ${k} bạn (${A} đứng bên trái ${B}). Hỏi hàng có bao nhiêu bạn?`, answer: a + k + b, solution: `Tính từ trái đến ${A} có ${a} bạn, giữa hai bạn có ${k} bạn, tính từ ${B} đến hết bên phải có ${b} bạn. Cả hàng: ${a} + ${k} + ${b} = <b>${a + k + b}</b> bạn.` });
    }
    const len = R.int(3, 5), cols = R.int(2, 5);
    const p = R.int(1, len), q = R.int(1, cols);
    const total = len * cols;
    return mk({
      text: `Học sinh xếp thành các hàng dọc, hàng nào cũng có số bạn bằng nhau. ${A} đứng thứ ${p} tính từ đầu hàng và thứ ${len - p + 1} tính từ cuối hàng. Hàng của ${A} là hàng thứ ${q} tính từ trái và thứ ${cols - q + 1} tính từ phải. Hỏi có tất cả bao nhiêu học sinh?`,
      answer: total,
      solution: `Mỗi hàng có ${p} + ${len - p + 1} − 1 = ${len} bạn. Số hàng: ${q} + ${cols - q + 1} − 1 = ${cols} hàng. Tất cả: ${len} × ${cols} = ${rep(len, cols)} = <b>${total}</b> học sinh.`,
    });
  }

  function logicAge(R, lv) {
    const A = R.pick(NAMES);
    const a = R.int(6, 10);
    const rels = [['anh', R.int(2, 8), 1], ['chị', R.int(2, 8), 1], ['em', R.int(1, 4), -1], ['bố', R.int(24, 35), 1], ['mẹ', R.int(22, 32), 1], ['ông', R.int(50, 62), 1]];
    const [rel, d, sg] = R.pick(rels);
    const other = a + sg * d;
    if (lv === 1) {
      return pick(R, [
        () => mk({ text: `Năm nay ${A} ${a} tuổi. ${cap(rel)} của ${A} ${sg > 0 ? 'hơn' : 'kém'} ${A} ${d} tuổi. Hỏi năm nay ${rel} của ${A} bao nhiêu tuổi?`, answer: other, solution: `${sg > 0 ? 'Hơn' : 'Kém'} ${d} tuổi nên ${rel} của ${A}: ${a} ${sg > 0 ? '+' : '−'} ${d} = <b>${other}</b> tuổi.` }),
        () => { const r = R.pick(['anh', 'chị', 'bố', 'mẹ']), b = a + R.int(2, 30); return mk({ text: `Năm nay ${A} ${a} tuổi, ${r} của ${A} ${b} tuổi. Hỏi ${r} của ${A} hơn ${A} bao nhiêu tuổi?`, answer: b - a, solution: `${b} − ${a} = <b>${b - a}</b> tuổi.` }); },
        () => { const k = R.int(2, 9); return mk({ text: `Năm nay ${A} ${a} tuổi. Hỏi ${k} năm nữa ${A} bao nhiêu tuổi?`, answer: a + k, solution: `Mỗi năm thêm 1 tuổi. ${k} năm nữa ${A}: ${a} + ${k} = <b>${a + k}</b> tuổi.` }); },
      ]);
    }
    if (lv === 2) {
      return pick(R, [
        () => { const k = R.int(2, 9); return mk({ text: `Năm nay ${A} ${a} tuổi, ${rel} của ${A} ${sg > 0 ? 'hơn' : 'kém'} ${A} ${d} tuổi. Hỏi ${k} năm nữa ${rel} của ${A} bao nhiêu tuổi?`, answer: other + k, solution: `Năm nay ${rel} của ${A}: ${a} ${sg > 0 ? '+' : '−'} ${d} = ${other} tuổi. ${k} năm nữa: ${other} + ${k} = <b>${other + k}</b> tuổi.` }); },
        () => { const k = R.int(1, Math.min(5, other - 1)); return mk({ text: `Năm nay ${A} ${a} tuổi, ${rel} của ${A} ${sg > 0 ? 'hơn' : 'kém'} ${A} ${d} tuổi. Hỏi ${k} năm trước ${rel} của ${A} bao nhiêu tuổi?`, answer: other - k, solution: `Năm nay ${rel} của ${A}: ${a} ${sg > 0 ? '+' : '−'} ${d} = ${other} tuổi. ${k} năm trước: ${other} − ${k} = <b>${other - k}</b> tuổi.` }); },
        () => { const dd = R.int(2, 30), k = R.int(3, 20); return mk({ text: `${cap(R.pick(['anh', 'bố', 'mẹ', 'chị']))} hơn ${A} ${dd} tuổi. Hỏi ${k} năm nữa thì hơn ${A} bao nhiêu tuổi?`, answer: dd, solution: `Mỗi năm cả hai người đều thêm 1 tuổi nên số tuổi hơn kém không thay đổi: vẫn hơn <b>${dd}</b> tuổi.` }); },
      ]);
    }
    return pick(R, [
      () => { const dd = R.int(2, 8), b = a + dd, c = a + R.int(2, 12); const r = R.pick(['anh', 'chị']); return mk({ text: `Năm nay ${A} ${a} tuổi, ${r} của ${A} ${b} tuổi. Hỏi khi ${A} ${c} tuổi thì ${r} của ${A} bao nhiêu tuổi?`, answer: c + dd, solution: `${cap(r)} luôn hơn ${A}: ${b} − ${a} = ${dd} tuổi. Khi ${A} ${c} tuổi thì ${r} ${c} + ${dd} = <b>${c + dd}</b> tuổi.` }); },
      () => { const m = R.int(28, 36), c = R.int(5, 9); return mk({ text: `Năm nay mẹ ${m} tuổi, con ${c} tuổi. Hỏi khi con bằng tuổi mẹ hiện nay thì mẹ bao nhiêu tuổi?`, answer: 2 * m - c, solution: `Mẹ hơn con ${m} − ${c} = ${m - c} tuổi. Khi con ${m} tuổi thì mẹ ${m} + ${m - c} = <b>${2 * m - c}</b> tuổi.` }); },
      () => { const s = R.int(15, 40), k = R.int(2, 6), n = R.pick([2, 3]); const who = n === 2 ? 'hai anh em' : 'ba chị em'; return mk({ text: `Hiện nay tổng số tuổi của ${who} là ${s} tuổi. Hỏi ${k} năm nữa tổng số tuổi của ${who} là bao nhiêu?`, answer: s + n * k, solution: `Sau ${k} năm, mỗi người thêm ${k} tuổi. ${n} người thêm ${rep(k, n)} = ${n * k} tuổi. Tổng: ${s} + ${n * k} = <b>${s + n * k}</b> tuổi.` }); },
      () => { const x = R.int(3, 8), k = R.int(2, 5), m = R.int(2, 6); return mk({ text: `${k} năm trước ${A} ${x} tuổi. Hỏi ${m} năm nữa ${A} bao nhiêu tuổi?`, answer: x + k + m, solution: `Năm nay ${A}: ${x} + ${k} = ${x + k} tuổi. ${m} năm nữa: ${x + k} + ${m} = <b>${x + k + m}</b> tuổi.` }); },
    ]);
  }

  function logicCut(R, lv) {
    const kinds = lv === 1 ? ['cut', 'trees', 'floor', 'flags'] : lv === 2 ? ['time', 'stairs', 'road', 'bell'] : ['sides', 'circle', 'pieces', 'floortime'];
    const kind = R.pick(kinds);
    if (kind === 'cut') { const n = R.int(3, 12); return mk({ text: `Bác thợ mộc cưa một khúc gỗ thành ${n} đoạn. Hỏi bác phải cưa mấy lần?`, answer: n - 1, solution: `Mỗi lần cưa tạo thêm 1 đoạn. Từ 1 đoạn thành ${n} đoạn cần ${n} − 1 = <b>${n - 1}</b> lần cưa.` }); }
    if (kind === 'trees') { const n = R.int(4, 15); return mk({ text: `Trồng ${n} cây thành một hàng thẳng. Hỏi giữa các cây có bao nhiêu khoảng cách?`, answer: n - 1, solution: `Số khoảng cách ít hơn số cây 1: ${n} − 1 = <b>${n - 1}</b>.` }); }
    if (kind === 'floor') { const f = R.int(3, 10); return mk({ text: `Ngôi nhà có ${f} tầng. Đi từ tầng 1 lên tầng ${f} phải đi qua mấy đoạn cầu thang?`, answer: f - 1, solution: `Giữa hai tầng liền nhau có 1 đoạn cầu thang. Từ tầng 1 lên tầng ${f}: ${f} − 1 = <b>${f - 1}</b> đoạn.` }); }
    if (kind === 'flags') { const k = R.int(3, 12); return mk({ text: `Một đoạn đường được chia thành ${k} khoảng bằng nhau. Người ta cắm cờ ở cả hai đầu đường và ở mọi chỗ chia. Hỏi cắm bao nhiêu lá cờ?`, answer: k + 1, solution: `Cắm cả hai đầu thì số cờ nhiều hơn số khoảng 1: ${k} + 1 = <b>${k + 1}</b> lá cờ.` }); }
    if (kind === 'time') { const n = R.int(3, 6), m = R.int(2, 5); return mk({ text: `Cưa một khúc gỗ thành ${n} đoạn. Mỗi lần cưa mất ${m} phút. Hỏi cưa xong mất bao nhiêu phút?`, answer: (n - 1) * m, solution: `Cưa thành ${n} đoạn cần ${n - 1} lần cưa. Thời gian: ${m} × ${n - 1} = ${rep(m, n - 1)} = <b>${(n - 1) * m}</b> phút.` }); }
    if (kind === 'stairs') { const f = R.int(3, 5), s = R.int(5, 10); return mk({ text: `Để lên mỗi tầng phải bước ${s} bậc thang. Hỏi đi từ tầng 1 lên tầng ${f} phải bước bao nhiêu bậc?`, answer: (f - 1) * s, solution: `Từ tầng 1 lên tầng ${f} phải đi ${f - 1} đoạn cầu thang: ${rep(s, f - 1)} = <b>${(f - 1) * s}</b> bậc.` }); }
    if (kind === 'road') { const d = R.pick([2, 5]), k = R.int(3, 9), L = d * k; return mk({ text: `Một hàng rào dài ${L} m. Người ta đóng cọc ở cả hai đầu, hai cọc liền nhau cách nhau ${d} m. Hỏi đóng bao nhiêu cái cọc?`, answer: k + 1, solution: `Số khoảng: ${L} : ${d} = ${k}. Đóng cả hai đầu nên số cọc nhiều hơn số khoảng 1: ${k} + 1 = <b>${k + 1}</b> cọc.` }); }
    if (kind === 'bell') { const n = R.int(3, 8), g = R.int(2, 5); return mk({ text: `Một chiếc đồng hồ đánh chuông, hai tiếng chuông liền nhau cách nhau ${g} giây. Đồng hồ đánh ${n} tiếng chuông thì từ tiếng đầu đến tiếng cuối mất bao nhiêu giây?`, answer: (n - 1) * g, solution: `${n} tiếng chuông có ${n - 1} khoảng nghỉ. Thời gian: ${rep(g, n - 1)} = <b>${(n - 1) * g}</b> giây.` }); }
    if (kind === 'sides') { const k = R.int(3, 9); return mk({ text: `Người ta trồng cây ở hai bên một con đường. Mỗi bên đều trồng ở cả hai đầu đường, các cây cách đều nhau và mỗi bên có ${k} khoảng cách. Hỏi trồng tất cả bao nhiêu cây?`, answer: 2 * (k + 1), solution: `Mỗi bên có ${k} + 1 = ${k + 1} cây. Hai bên: ${k + 1} + ${k + 1} = <b>${2 * (k + 1)}</b> cây.` }); }
    if (kind === 'circle') { const n = R.int(4, 10), d = R.pick([2, 5]); return mk({ text: `Quanh một cái hồ hình tròn người ta trồng ${n} cây, hai cây liền nhau cách nhau ${d} m. Hỏi đi một vòng quanh hồ dài bao nhiêu mét?`, answer: n * d, solution: `Trồng quanh vòng tròn thì số khoảng bằng số cây: ${n} khoảng. Độ dài: ${d} × ${n} = <b>${n * d}</b> m.` }); }
    if (kind === 'pieces') { const d = R.pick([2, 5]), p = R.int(3, 6), m = R.int(2, 5), L = d * p; return mk({ text: `Một khúc gỗ dài ${L} dm được cưa thành các đoạn dài ${d} dm. Mỗi lần cưa mất ${m} phút. Hỏi cưa xong mất bao nhiêu phút?`, answer: (p - 1) * m, solution: `Số đoạn: ${L} : ${d} = ${p} đoạn, cần ${p - 1} lần cưa. Thời gian: ${rep(m, p - 1)} = <b>${(p - 1) * m}</b> phút.` }); }
    const u = R.int(2, 5), f2 = R.int(4, 6);
    return mk({ text: `${R.pick(NAMES)} đi từ tầng 1 lên tầng 3 hết ${2 * u} phút. Hỏi với cách đi như vậy, đi từ tầng 1 lên tầng ${f2} hết bao nhiêu phút?`, answer: (f2 - 1) * u, solution: `Từ tầng 1 lên tầng 3 là 2 đoạn cầu thang, mỗi đoạn ${2 * u} : 2 = ${u} phút. Lên tầng ${f2} phải đi ${f2 - 1} đoạn: ${rep(u, f2 - 1)} = <b>${(f2 - 1) * u}</b> phút.` });
  }

  function logicBalance(R, lv) {
    const [X, Y, Z] = R.sample(FRUITS, 3);
    if (lv === 1) {
      return pick(R, [
        () => { const a = R.int(2, 5); return mk({ text: `Trên cân thăng bằng:<div class="seq emoji">1 ${X} = ${a} ${Y}</div>Hỏi 2 ${X} nặng bằng mấy ${Y}?`, answer: 2 * a, solution: `Mỗi ${X} nặng bằng ${a} ${Y}. 2 ${X} nặng bằng ${a} + ${a} = <b>${2 * a}</b> ${Y}.` }); },
        () => { const a = R.int(1, 9), b = R.int(1, 9); return mk({ text: `Cân thăng bằng: đĩa bên trái có 1 quả bí, đĩa bên phải có quả cân ${a} kg và quả cân ${b} kg. Hỏi quả bí nặng mấy ki-lô-gam?`, answer: a + b, solution: `Cân thăng bằng nên quả bí nặng bằng hai quả cân: ${a} + ${b} = <b>${a + b}</b> kg.` }); },
        () => { const a = R.int(1, 5), b = a + R.int(2, 9); return mk({ text: `Cân thăng bằng: đĩa bên trái có 1 quả dưa và quả cân ${a} kg, đĩa bên phải có quả cân ${b} kg. Hỏi quả dưa nặng mấy ki-lô-gam?`, answer: b - a, solution: `Quả dưa cùng ${a} kg nặng bằng ${b} kg. Quả dưa nặng ${b} − ${a} = <b>${b - a}</b> kg.` }); },
      ]);
    }
    if (lv === 2) {
      return pick(R, [
        () => { const a = R.int(2, 3), b = R.int(2, 5); return mk({ text: `Trên cân thăng bằng:<div class="seq emoji">1 ${X} = ${a} ${Y}<br>1 ${Y} = ${b} ${Z}</div>Hỏi 1 ${X} nặng bằng mấy ${Z}?`, answer: a * b, solution: `1 ${X} nặng bằng ${a} ${Y}, mỗi ${Y} bằng ${b} ${Z}. Vậy 1 ${X} bằng ${rep(b, a)} = <b>${a * b}</b> ${Z}.` }); },
        () => { const b = R.int(3, 10), c = R.int(1, 10), a = R.int(1, Math.min(5, b + c - 1)); return mk({ text: `Cân thăng bằng: đĩa bên trái có 1 túi cam và quả cân ${a} kg, đĩa bên phải có quả cân ${b} kg và quả cân ${c} kg. Hỏi túi cam nặng mấy ki-lô-gam?`, answer: b + c - a, solution: `Đĩa phải nặng ${b} + ${c} = ${b + c} kg. Túi cam nặng ${b + c} − ${a} = <b>${b + c - a}</b> kg.` }); },
        () => { const x = R.int(2, 9), k = R.pick([2, 3]); return mk({ text: `Cân thăng bằng: đĩa bên trái có ${k} quả ${X} nặng bằng nhau, đĩa bên phải có các quả cân tổng cộng ${k * x} kg. Hỏi mỗi quả ${X} nặng mấy ki-lô-gam?`, answer: x, solution: `Tìm số mà ${k} lần số đó bằng ${k * x}: ${rep(x, k)} = ${k * x}. Mỗi quả nặng <b>${x}</b> kg.` }); },
      ]);
    }
    return pick(R, [
      () => { const x = R.int(2, 9), y = R.int(2, 9), askX = R.chance(0.5); return mk({ text: `Trên cân thăng bằng:<div class="seq emoji">${X} + ${Y} = ${x + y} kg<br>${X} + ${X} + ${Y} = ${2 * x + y} kg</div>Hỏi 1 ${askX ? X : Y} nặng mấy ki-lô-gam?`, answer: askX ? x : y, solution: `Dòng 2 hơn dòng 1 đúng 1 ${X}, nên ${X} nặng ${2 * x + y} − ${x + y} = ${x} kg.` + (askX ? ` Đáp số <b>${x}</b> kg.` : ` ${Y} nặng ${x + y} − ${x} = <b>${y}</b> kg.`) }); },
      () => { const a = 2, b = R.int(2, 3), k = R.int(2, 3), ans = k * a * b; return mk({ text: `Trên cân thăng bằng:<div class="seq emoji">1 ${X} = ${a} ${Y}<br>1 ${Y} = ${b} ${Z}</div>Hỏi ${k} ${X} nặng bằng mấy ${Z}?`, answer: ans, solution: `1 ${X} = ${a} ${Y} = ${rep(b, a)} = ${a * b} ${Z}. ${k} ${X} nặng bằng ${rep(a * b, k)} = <b>${ans}</b> ${Z}.` }); },
      () => { const a = R.int(2, 3), b = R.int(2, 3), ans = a * b + b; return mk({ text: `Trên cân thăng bằng:<div class="seq emoji">1 ${X} = ${a} ${Y}<br>1 ${Y} = ${b} ${Z}</div>Hỏi 1 ${X} và 1 ${Y} nặng bằng mấy ${Z}?`, answer: ans, solution: `1 ${X} = ${rep(b, a)} = ${a * b} ${Z}; 1 ${Y} = ${b} ${Z}. Cả hai: ${a * b} + ${b} = <b>${ans}</b> ${Z}.` }); },
    ]);
  }

  function logicWeek(R, lv) {
    const d = R.int(0, 6);
    const later = (k, ask) => {
      const ans = d + k, K = Math.abs(k), sg = Math.sign(k);
      let why;
      if (K < 7) why = `Đếm ${k > 0 ? 'tiếp' : 'lùi'} ${K} ngày từ ${day(d)}: ${range(1, K).map(i => day(d + sg * i)).join(', ')}.`;
      else {
        const q = Math.floor(K / 7), r = K % 7;
        why = `Cứ 7 ngày lại đến cùng một thứ. ${K} = ${rep(7, q)}${r ? ` + ${r}` : ''}, nên ${k > 0 ? 'sau' : 'trước đó'} ${7 * q} ngày vẫn là ${day(d)}${r ? `; đếm ${k > 0 ? 'tiếp' : 'lùi'} ${r} ngày nữa: ${range(1, r).map(i => day(d + sg * i)).join(', ')}` : ''}.`;
      }
      return mk({ type: 'choice', choices: dayChoices(R, ans), text: `Hôm nay là ${day(d)}. ${ask}`, answer: dayCap(ans), solution: `${why} Đáp số: <b>${dayCap(ans)}</b>.` });
    };
    if (lv === 0) { const t = R.pick([[1, 'Ngày mai'], [-1, 'Hôm qua']]); return later(t[0], `${t[1]} là thứ mấy?`); }
    if (lv === 1) {
      return pick(R, [
        () => { const k = R.int(2, 6); return later(k, `${k} ngày nữa là thứ mấy?`); },
        () => { const k = R.int(2, 5); return later(-k, `${k} ngày trước là thứ mấy?`); },
        () => { const t = R.pick([[2, 'Ngày kia'], [-2, 'Hôm kia']]); return later(t[0], `${t[1]} là thứ mấy?`); },
      ]);
    }
    if (lv === 2) {
      return pick(R, [
        () => { const k = R.int(8, 20); return later(k, `${k} ngày nữa là thứ mấy?`); },
        () => { const k = R.int(8, 14); return later(-k, `${k} ngày trước là thứ mấy?`); },
        () => { const w = R.int(1, 3), extra = R.int(1, 3); return later(7 * w + extra, `${w} tuần ${extra} ngày nữa là thứ mấy?`); },
      ]);
    }
    // cấp 3: biết thứ của hôm qua/hôm kia/ngày mai/ngày kia, tìm thứ sau k ngày kể từ hôm nay
    const [off, word] = R.pick([[-1, 'Hôm qua'], [-2, 'Hôm kia'], [1, 'Ngày mai'], [2, 'Ngày kia']]);
    const known = d + off, k = R.int(8, 30);
    const q = Math.floor(k / 7), r = k % 7, ans = d + k;
    return mk({
      type: 'choice', choices: dayChoices(R, ans),
      text: `${word} là ${day(known)}. Hỏi ${k} ngày nữa (tính từ hôm nay) là thứ mấy?`, answer: dayCap(ans),
      solution: `${word} là ${day(known)} nên hôm nay là ${day(d)}. ${k} = ${rep(7, q)}${r ? ` + ${r}` : ''}: sau ${7 * q} ngày vẫn là ${day(d)}${r ? `, đếm tiếp ${r} ngày được ${day(ans)}` : ''}. Đáp số: <b>${dayCap(ans)}</b>.`,
    });
  }

  const WHO = [
    { items: ['đỏ', 'xanh', 'vàng', 'trắng'], intro: (ns, its) => `${ns.join(', ')} mỗi bạn mặc một chiếc áo có màu khác nhau: ${its.join(', ')}.`, has: (n, c) => `${n} mặc áo ${c}`, not: (n, c) => `${n} không mặc áo ${c}`, lab: c => `áo ${c}`, q: n => `Hỏi ${n} mặc áo màu gì?`, ans: c => `Áo ${c}` },
    { items: ['bóng đá', 'cờ vua', 'bơi', 'vẽ'], intro: (ns, its) => `${ns.join(', ')} mỗi bạn thích một môn khác nhau: ${its.join(', ')}.`, has: (n, c) => `${n} thích ${c}`, not: (n, c) => `${n} không thích ${c}`, lab: c => `môn ${c}`, q: n => `Hỏi ${n} thích môn gì?`, ans: c => cap(c) },
    { items: ['mèo', 'chó', 'thỏ', 'vẹt'], intro: (ns, its) => `${ns.join(', ')} mỗi bạn nuôi một con vật khác nhau: ${its.join(', ')}.`, has: (n, c) => `${n} nuôi ${c}`, not: (n, c) => `${n} không nuôi ${c}`, lab: c => `con ${c}`, q: n => `Hỏi ${n} nuôi con gì?`, ans: c => `Con ${c}` },
  ];
  // Giải bằng loại trừ; trả về phép gán (ok = false nếu loại trừ không đủ) và các bước lời giải
  function solveWho(k, clues, th, names, items) {
    const poss = range(0, k - 1).map(() => new Set(range(0, k - 1)));
    for (const c of clues) { if (c.pos) poss[c.p] = new Set([c.i]); else poss[c.p].delete(c.i); }
    const asg = Array(k).fill(-1), steps = [];
    const set = (p, i, why) => {
      asg[p] = i;
      for (let o = 0; o < k; o++) if (o !== p) poss[o].delete(i);
      poss[p] = new Set([i]);
      if (why) steps.push(why);
    };
    clues.filter(c => c.pos).forEach(c => set(c.p, c.i, ''));
    let changed = true;
    while (changed) {
      changed = false;
      for (let p = 0; p < k; p++) {
        if (asg[p] < 0 && poss[p].size === 1) { const i = [...poss[p]][0]; set(p, i, `${names[p]} chỉ còn hợp với ${th.lab(items[i])}, nên ${th.has(names[p], items[i])}.`); changed = true; }
      }
      for (let i = 0; i < k; i++) {
        if (asg.includes(i)) continue;
        const ps = range(0, k - 1).filter(p => poss[p].has(i));
        if (ps.length === 1) { set(ps[0], i, `${cap(th.lab(items[i]))} chỉ còn hợp với ${names[ps[0]]}, nên ${th.has(names[ps[0]], items[i])}.`); changed = true; }
      }
    }
    return { ok: asg.every(x => x >= 0), asg, steps };
  }
  function logicWho(R, lv) {
    const k = lv === 3 && R.chance(0.5) ? 4 : 3, usePos = lv === 2 || k === 4;
    const th = R.pick(WHO), items = th.items.slice(0, k), names = R.sample(NAMES, k);
    for (let tries = 0; tries < 50; tries++) {
      const perm = R.shuffle(range(0, k - 1));
      const negs = [];
      for (let p = 0; p < k; p++) for (let i = 0; i < k; i++) if (i !== perm[p]) negs.push({ p, i, pos: false });
      let clues = [];
      if (usePos) { const p = R.int(0, k - 1); clues.push({ p, i: perm[p], pos: true }); }
      for (const c of R.shuffle(negs)) { if (solveWho(k, clues, th, names, items).ok) break; clues.push(c); }
      if (!solveWho(k, clues, th, names, items).ok) continue;
      for (const c of R.shuffle(clues.filter(x => !x.pos))) { const rest = clues.filter(x => x !== c); if (solveWho(k, rest, th, names, items).ok) clues = rest; }
      const res = solveWho(k, clues, th, names, items);
      const posP = clues.filter(c => c.pos).map(c => c.p);
      const ask = R.pick(range(0, k - 1).filter(p => !posP.includes(p))), ans = th.ans(items[perm[ask]]);
      const stmts = R.shuffle(clues).map(c => (c.pos ? th.has(names[c.p], items[c.i]) : th.not(names[c.p], items[c.i])));
      return mk({
        type: 'choice', choices: R.shuffle(items.map(th.ans)),
        text: `${th.intro(names, items)}<br>${stmts.map(cap).join('. ')}.<br>${th.q(names[ask])}`, answer: ans,
        solution: `${res.steps.join(' ')} Vậy câu trả lời là <b>${ans}</b>.`,
      });
    }
    return logicWho(R, 2);
  }

  function logicWater(R, lv) {
    if (lv === 2) {
      return pick(R, [
        () => { const a = R.int(5, 12), b = R.int(2, a - 2); return mk({ text: `Can to chứa đầy ${a} lít nước, can nhỏ loại ${b} lít đang rỗng. Rót nước từ can to sang can nhỏ cho đến khi can nhỏ đầy. Hỏi can to còn lại bao nhiêu lít nước?`, answer: a - b, solution: `Can nhỏ nhận đúng ${b} lít. Can to còn ${a} − ${b} = <b>${a - b}</b> lít.` }); },
        () => { const b = R.pick([2, 5]), k = R.int(3, 10); return mk({ text: `Thùng có ${b * k} lít nước. Dùng một cái ca loại ${b} lít múc nước ra, lần nào cũng múc đầy ca. Hỏi múc mấy lần thì hết nước?`, answer: k, solution: `Số lần múc: ${b * k} : ${b} = <b>${k}</b> lần.` }); },
        () => { const m = R.int(2, 5), V = 2 * m + R.int(1, 10); return mk({ text: `Một can chứa ${V} lít dầu. Người ta rót ra ${m} chai, mỗi chai 2 lít. Hỏi trong can còn lại bao nhiêu lít dầu?`, answer: V - 2 * m, solution: `Đã rót ra: 2 × ${m} = ${2 * m} lít. Còn lại: ${V} − ${2 * m} = <b>${V - 2 * m}</b> lít.` }); },
        () => { const c = R.int(5, 40), m = R.int(2, 8); return mk({ text: `Bể đang có ${c} lít nước. Bố đổ thêm vào bể ${m} xô nước, mỗi xô 5 lít. Hỏi bể có tất cả bao nhiêu lít nước?`, answer: c + 5 * m, solution: `Đổ thêm: 5 × ${m} = ${5 * m} lít. Bể có: ${c} + ${5 * m} = <b>${c + 5 * m}</b> lít.` }); },
      ]);
    }
    return pick(R, [
      () => {
        const [a, b] = R.pick([[5, 3], [7, 4], [7, 5], [8, 5], [9, 5], [9, 7], [4, 3], [10, 7], [10, 6], [8, 6]]);
        const ans = 2 * a - 2 * b;
        return mk({
          text: `Có một can ${a} lít và một can ${b} lít, cả hai đều rỗng. ${R.pick(NAMES)} làm như sau:<br>1) Đổ đầy can ${a} lít.<br>2) Rót từ can ${a} lít sang can ${b} lít cho đến khi can ${b} lít đầy.<br>3) Đổ hết nước ở can ${b} lít đi.<br>4) Rót hết nước còn lại ở can ${a} lít sang can ${b} lít.<br>5) Đổ đầy can ${a} lít lần nữa.<br>6) Rót từ can ${a} lít sang can ${b} lít cho đến khi can ${b} lít đầy.<br>Hỏi lúc này can ${a} lít còn bao nhiêu lít nước?`,
          answer: ans,
          solution: `Sau bước 2: can ${a} lít còn ${a} − ${b} = ${a - b} lít. Bước 4: can ${b} lít có ${a - b} lít, còn thiếu ${b} − ${a - b} = ${2 * b - a} lít mới đầy. Bước 6: rót ${2 * b - a} lít từ can ${a} lít (đang đầy) sang, can ${a} lít còn ${a} − ${2 * b - a} = <b>${ans}</b> lít.`,
        });
      },
      () => {
        const c = R.int(2, 4), b = c + R.int(2, 4), a = b + R.int(1, 6), askA = R.chance(0.5);
        return mk({
          text: `Có 3 can: can thứ nhất chứa đầy ${a} lít nước, can thứ hai loại ${b} lít và can thứ ba loại ${c} lít đều rỗng. Rót từ can thứ nhất sang cho đầy can thứ hai, rồi rót từ can thứ hai sang cho đầy can thứ ba. Hỏi lúc này can thứ ${askA ? 'nhất' : 'hai'} có bao nhiêu lít nước?`,
          answer: askA ? a - b : b - c,
          solution: `Sau lần rót đầu: can thứ nhất còn ${a} − ${b} = ${a - b} lít, can thứ hai có ${b} lít. Sau lần rót thứ hai: can thứ hai còn ${b} − ${c} = ${b - c} lít, can thứ ba có ${c} lít. Đáp số: <b>${askA ? a - b : b - c}</b> lít.`,
        });
      },
      () => {
        const b = R.pick([2, 5]), per = 2 * b, k = R.int(2, 5), c = R.int(1, 4) * 5, full = c + per * k;
        return mk({
          text: `Một bể chứa được ${full} lít nước, trong bể đang có ${c} lít. Mỗi lượt, ${R.pick(NAMES)} xách 2 xô nước, mỗi xô ${b} lít. Hỏi phải xách mấy lượt thì bể đầy?`,
          answer: k,
          solution: `Cần đổ thêm ${full} − ${c} = ${full - c} lít. Mỗi lượt xách được ${b} + ${b} = ${per} lít. Vì ${rep(per, k)} = ${full - c} nên cần <b>${k}</b> lượt.`,
        });
      },
    ]);
  }

  // =====================================================================
  // SỐ HỌC
  // =====================================================================
  // Cộng/trừ qua 10 trong phạm vi 20 (tách để được 10)
  function add20(a, b) { const f = 10 - a; return `${a} + ${b} = ${a} + ${f} + ${b - f} = 10 + ${b - f} = <b>${a + b}</b>.`; }
  function sub20(a, b) { const f = a - 10; return `${a} − ${b} = ${a} − ${f} − ${b - f} = 10 − ${b - f} = <b>${a - b}</b>.`; }

  function arithAdd0(R) {
    const X = R.pick(FRUITS);
    if (R.chance(0.5)) {
      const a = R.int(5, 9), b = R.int(11 - a, 9);
      return mk({
        text: `Có tất cả bao nhiêu quả?<div class="seq emoji">${groupsOf5(X, a)} &nbsp;+&nbsp; ${groupsOf5(X, b)}</div>`, answer: a + b,
        solution: `Có ${a} quả và ${b} quả. Lấy ${10 - a} quả ở nhóm sau bù cho đủ 10: ${add20(a, b).replace('<b>', '').replace('</b>.', '')} quả. Vậy có <b>${a + b}</b> quả.`,
      });
    }
    const [E, noun, cls, verb] = R.pick([['🐟', 'con cá', 'con', 'Mèo ăn mất'], ['🎈', 'quả bóng bay', 'quả', 'Gió thổi bay mất'], ['🍪', 'cái bánh', 'cái', 'Em ăn mất'], ['🐦', 'con chim', 'con', 'Có'], ['🌸', 'bông hoa', 'bông', 'Bạn hái mất']]);
    const a = R.int(11, 16), b = R.int(a - 9, 9);
    const act = cls === 'con' && E === '🐦' ? `Có ${b} con bay đi` : `${verb} ${b} ${cls}`;
    return mk({
      text: `Có ${a} ${noun}:<div class="seq emoji">${groupsOf5(E, a)}</div>${act}. Hỏi còn lại mấy ${cls}?`, answer: a - b,
      solution: `${sub20(a, b).replace('<b>', '').replace('</b>.', '')}. Còn lại <b>${a - b}</b> ${cls}.`,
    });
  }

  function arithCalc(R, lv) {
    if (lv === 0) {
      if (R.chance(0.5)) { const a = R.int(6, 9), b = R.int(11 - a, 9); return mk({ text: `Tính:<div class="seq">${a} + ${b} = ?</div>`, answer: a + b, solution: `Tách ${b} để ${a} được tròn 10: ${add20(a, b)}` }); }
      const a = R.int(11, 18), b = R.int(a - 9, 9);
      return mk({ text: `Tính:<div class="seq">${a} − ${b} = ?</div>`, answer: a - b, solution: `Trừ để được 10 trước: ${sub20(a, b)}` });
    }
    if (lv === 1) {
      if (R.chance(0.5)) {
        let a, b;
        do { a = R.int(15, 79); b = R.int(6, 99 - a); } while ((a % 10) + (b % 10) < 10 || a + b > 100);
        return mk({ text: `Tính:<div class="seq">${a} + ${b} = ?</div>`, answer: a + b, solution: addSteps(a, b) });
      }
      let a, b;
      do { a = R.int(30, 99); b = R.int(6, a - 5); } while (a % 10 >= b % 10);
      return mk({ text: `Tính:<div class="seq">${a} − ${b} = ?</div>`, answer: a - b, solution: subSteps(a, b) });
    }
    if (lv === 2) {
      return pick(R, [
        () => { const a = R.int(100, 750), b = R.int(15, 999 - a); return mk({ text: `Tính:<div class="seq">${a} + ${b} = ?</div>`, answer: a + b, solution: addSteps(a, b) }); },
        () => { const a = R.int(200, 999), b = R.int(15, a - 50); return mk({ text: `Tính:<div class="seq">${a} − ${b} = ?</div>`, answer: a - b, solution: subSteps(a, b) }); },
        () => { const a = R.int(25, 60), b = R.int(15, 39), c = R.int(10, a + b - 5); return mk({ text: `Tính:<div class="seq">${a} + ${b} − ${c} = ?</div>`, answer: a + b - c, solution: `Tính từ trái sang phải: ${a} + ${b} = ${a + b}; ${a + b} − ${c} = <b>${a + b - c}</b>.` }); },
      ]);
    }
    return pick(R, [
      () => { const a = R.int(150, 600), b = R.int(100, 380), c = R.int(50, a + b - 100); return mk({ text: `Tính:<div class="seq">${a} + ${b} − ${c} = ?</div>`, answer: a + b - c, solution: `Tính từ trái sang phải: ${a} + ${b} = ${a + b}; ${a + b} − ${c} = <b>${a + b - c}</b>.` }); },
      () => { const a = R.int(500, 999), b = R.int(100, 300), c = R.int(50, a - b - 10); return mk({ text: `Tính:<div class="seq">${a} − ${b} − ${c} = ?</div>`, answer: a - b - c, solution: `Tính từ trái sang phải: ${a} − ${b} = ${a - b}; ${a - b} − ${c} = <b>${a - b - c}</b>.` }); },
      () => { const a = R.pick([100, 1000]), b = R.int(a / 10 + 1, a - 10), c = R.int(10, 90); return mk({ text: `Tính:<div class="seq">${a} − ${b} + ${c} = ?</div>`, answer: a - b + c, solution: `${a} − ${b} = ${a - b}; ${a - b} + ${c} = <b>${a - b + c}</b>.` }); },
    ]);
  }

  const LEGS = [['con gà', 'cái chân', 2], ['con vịt', 'cái chân', 2], ['bàn tay', 'ngón tay', 5], ['con chó', 'cái chân', 4], ['con mèo', 'cái chân', 4], ['chiếc xe đạp', 'bánh xe', 2], ['chiếc ô tô', 'bánh xe', 4], ['ngôi sao', 'cánh', 5]];
  function arithMult(R, lv) {
    if (lv === 0) {
      const X = R.pick(FRUITS), b = R.pick([2, 2, 5, 3, 4]), a = R.int(2, 5);
      return mk({
        text: `Có ${a} đĩa, mỗi đĩa có ${b} quả. Hỏi có tất cả bao nhiêu quả?<div class="seq emoji">${Array(a).fill(X.repeat(b)).join('&nbsp;&nbsp;&nbsp;')}</div>`, answer: a * b,
        solution: `${b} quả được lấy ${a} lần: ${rep(b, a)} = <b>${a * b}</b> quả. Viết thành phép nhân: ${b} × ${a} = ${a * b}.`,
      });
    }
    if (lv === 1) {
      return pick(R, [
        () => { const b = R.pick([2, 5, 2, 5, 3, 4]), a = R.int(2, 10); return mk({ text: `Tính:<div class="seq">${b} × ${a} = ?</div>`, answer: a * b, solution: `${b} × ${a} = ${rep(b, a)} = <b>${a * b}</b>.` }); },
        () => { const b = R.int(2, 9), a = R.int(3, 6); return mk({ text: `Điền số thích hợp vào ô trống:<div class="seq">${rep(b, a)} = ${b} × ${box}</div>`, answer: a, solution: `Số ${b} được lấy ${a} lần nên ${rep(b, a)} = ${b} × <b>${a}</b>.` }); },
        () => { const [o, p, b] = R.pick(LEGS), a = R.int(2, b === 5 ? 6 : 9); return mk({ text: `Mỗi ${o} có ${b} ${p}. Hỏi ${a} ${o} có bao nhiêu ${p}?`, answer: a * b, solution: `${b} × ${a} = ${rep(b, a)} = <b>${a * b}</b> ${p}.` }); },
      ]);
    }
    if (lv === 2) {
      return pick(R, [
        () => { const [c, it, b] = R.pick([['hộp', 'bút chì', 5], ['bàn', 'bạn ngồi', 2], ['túi', 'quả cam', 5], ['đĩa', 'cái bánh', 4], ['luống', 'cây cải', 5], ['bó', 'bông hoa', 3]]), a = R.int(3, 10); return mk({ text: `Mỗi ${c} có ${b} ${it}. Hỏi ${a} ${c} như thế có bao nhiêu ${it}?`, answer: a * b, solution: `Số ${it}: ${b} × ${a} = <b>${a * b}</b>.` }); },
        () => { const b = R.int(2, 5), a = R.int(2, 10); return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${b} × ${box} = ${a * b}</div>`, answer: a, solution: `Nhẩm bảng nhân ${b}: ${b} × ${a} = ${a * b}. Vậy số cần điền là <b>${a}</b>.` }); },
        () => { const b = R.int(2, 5), a = R.int(3, 10), c = R.int(1, 20), plus = R.chance(0.5) || c >= a * b; return mk({ text: `Tính:<div class="seq">${b} × ${a} ${plus ? '+' : '−'} ${c} = ?</div>`, answer: plus ? a * b + c : a * b - c, solution: `Nhân trước, cộng trừ sau: ${b} × ${a} = ${a * b}; ${a * b} ${plus ? '+' : '−'} ${c} = <b>${plus ? a * b + c : a * b - c}</b>.` }); },
      ]);
    }
    return pick(R, [
      () => {
        let b, x, c, dd;
        do { b = R.int(2, 5); x = R.int(2, 10); c = R.int(2, 5); dd = b * x / c; } while (c === b || dd !== Math.floor(dd) || dd > 10 || dd < 2);
        return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${b} × ${box} = ${c} × ${dd}</div>`, answer: x, solution: `Vế phải: ${c} × ${dd} = ${c * dd}. Tìm ô trống: ${b} × ${box} = ${b * x}, nhẩm bảng nhân ${b} được ${b} × ${x} = ${b * x}. Đáp số <b>${x}</b>.` });
      },
      () => { const b = R.int(2, 5), x = R.int(1, 6), y = R.int(1, 9 - x); return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${b} × ${x} + ${b} × ${y} = ${b} × ${box}</div>`, answer: x + y, solution: `${b} × ${x} là ${x} lần số ${b}, ${b} × ${y} là ${y} lần số ${b}. Cộng lại được ${x} + ${y} = ${x + y} lần số ${b}. Vậy ô trống là <b>${x + y}</b>.` }); },
      () => { const g = R.int(2, 9), c = R.int(2, 6); return mk({ text: `Trong sân có ${g} con gà và ${c} con chó. Hỏi có tất cả bao nhiêu cái chân?`, answer: 2 * g + 4 * c, solution: `Chân gà: 2 × ${g} = ${2 * g}. Chân chó: 4 × ${c} = ${4 * c}. Tất cả: ${2 * g} + ${4 * c} = <b>${2 * g + 4 * c}</b> cái chân.` }); },
      () => { const k = R.int(2, 9); return mk({ text: `Tính nhanh:<div class="seq">2 × 5 × ${k} = ?</div>`, answer: 10 * k, solution: `2 × 5 = 10, nên 2 × 5 × ${k} = 10 × ${k} = <b>${10 * k}</b>.` }); },
      () => { const b = R.int(2, 5), a = R.int(3, 10); return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${b} × ${a} − ${b} = ${b} × ${box}</div>`, answer: a - 1, solution: `${a} lần số ${b} bớt đi 1 lần số ${b} thì còn ${a - 1} lần số ${b}. Ô trống là <b>${a - 1}</b>.` }); },
    ]);
  }

  function arithDiv(R, lv) {
    const b = R.pick([2, 5]), q = R.int(2, 10);
    if (lv === 1) {
      return pick(R, [
        () => mk({ text: `Tính:<div class="seq">${b * q} : ${b} = ?</div>`, answer: q, solution: `Vì ${b} × ${q} = ${b * q} nên ${b * q} : ${b} = <b>${q}</b>.` }),
        () => mk({ text: `Chia đều ${b * q} cái kẹo cho ${b} bạn. Hỏi mỗi bạn được mấy cái kẹo?`, answer: q, solution: `${b * q} : ${b} = <b>${q}</b> cái kẹo (vì ${b} × ${q} = ${b * q}).` }),
        () => mk({ text: `Có ${b * q} quả cam xếp vào các đĩa, mỗi đĩa ${b} quả. Hỏi xếp được mấy đĩa?`, answer: q, solution: `${b * q} : ${b} = <b>${q}</b> đĩa.` }),
      ]);
    }
    if (lv === 2) {
      return pick(R, [
        () => { const c = R.int(1, 20), plus = R.chance(0.5) || c >= q; return mk({ text: `Tính:<div class="seq">${b * q} : ${b} ${plus ? '+' : '−'} ${c} = ?</div>`, answer: plus ? q + c : q - c, solution: `Chia trước, cộng trừ sau: ${b * q} : ${b} = ${q}; ${q} ${plus ? '+' : '−'} ${c} = <b>${plus ? q + c : q - c}</b>.` }); },
        () => mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${box} × ${b} = ${b * q}</div>`, answer: q, solution: `${box} = ${b * q} : ${b} = <b>${q}</b>.` }),
        () => mk({ text: `Có ${b * q} học sinh xếp thành ${b} hàng đều nhau. Hỏi mỗi hàng có mấy học sinh?`, answer: q, solution: `${b * q} : ${b} = <b>${q}</b> học sinh.` }),
        () => mk({ text: `Một sợi dây dài ${b * q} dm được cắt thành các đoạn, mỗi đoạn dài ${b} dm. Hỏi cắt được mấy đoạn?`, answer: q, solution: `${b * q} : ${b} = <b>${q}</b> đoạn.` }),
      ]);
    }
    return pick(R, [
      () => { let k, m, bb; do { k = R.int(2, 5); m = R.int(2, 10); bb = R.pick([2, 5]); } while ((k * m) % bb || k * m > 50 || k * m / bb < 2); return mk({ text: `Có ${k} hộp bút, mỗi hộp ${m} cái. Chia đều số bút cho ${bb} bạn. Hỏi mỗi bạn được mấy cái bút?`, answer: k * m / bb, solution: `Số bút: ${m} × ${k} = ${k * m} cái. Mỗi bạn: ${k * m} : ${bb} = <b>${k * m / bb}</b> cái.` }); },
      () => { const qq = R.int(1, 5); return mk({ text: `Tính:<div class="seq">${10 * qq} : 2 : 5 = ?</div>`, answer: qq, solution: `${10 * qq} : 2 = ${5 * qq}; ${5 * qq} : 5 = <b>${qq}</b>.` }); },
      () => { const h = R.int(3, 20); return mk({ text: `Mẹ có ${2 * h} quả táo. Mẹ biếu bà một nửa số táo. Hỏi mẹ còn lại mấy quả táo?`, answer: h, solution: `Một nửa là chia làm 2 phần bằng nhau: ${2 * h} : 2 = ${h}. Mẹ còn lại <b>${h}</b> quả.` }); },
      () => { const per = R.int(2, 6), t = R.int(2, 5), bags = 5; return mk({ text: `${R.pick(NAMES)} có ${per * bags} viên bi chia đều vào ${bags} túi. ${R.pick(NAMES)} có ${t} túi bi như thế. Hỏi bạn ấy có bao nhiêu viên bi?`, answer: per * t, solution: `Mỗi túi có ${per * bags} : ${bags} = ${per} viên. ${t} túi có: ${per} × ${t} = <b>${per * t}</b> viên.` }); },
    ]);
  }

  // Một biểu thức và giá trị của nó, dùng cho bài so sánh
  function cmpExpr(R, lv) {
    if (lv === 0) { const a = R.int(5, 9), b = R.int(3, 9); return [`${a} + ${b}`, a + b]; }
    if (lv === 1) { const a = R.int(15, 69), b = R.int(6, 29); return R.chance(0.5) ? [`${a} + ${b}`, a + b] : [`${a + b} − ${b}`, a]; }
    if (lv === 2) {
      return R.chance(0.5) ? (() => { const a = R.int(150, 600), b = R.int(50, 300); return [`${a} + ${b}`, a + b]; })()
        : (() => { const b = R.int(2, 5), a = R.int(2, 10); return [`${b} × ${a}`, a * b]; })();
    }
    const b = R.int(2, 5), a = R.int(2, 10), c = R.int(1, 15);
    return R.chance(0.5) ? [`${b} × ${a} + ${c}`, a * b + c] : [`${b} × ${a} − ${Math.min(c, a * b - 1)}`, a * b - Math.min(c, a * b - 1)];
  }
  function arithCmp(R, lv) {
    const [lt, L] = cmpExpr(R, lv);
    let rt, Rv;
    const eq = R.chance(0.25);
    if (lv === 0) { Rv = eq ? L : R.int(L - 3, L + 3); rt = `${Rv}`; }
    else if (lv === 1) { if (eq) { const y = R.int(1, Math.min(9, L - 1)); Rv = L; rt = `${L - y} + ${y}`; } else { Rv = 10 * R.int(Math.max(1, Math.floor(L / 10) - 1), Math.min(10, Math.floor(L / 10) + 1)); rt = `${Rv}`; } }
    else {
      if (eq && lv === 2) { Rv = L; const y = R.int(1, L - 1); rt = `${L - y} + ${y}`; } else if (eq) { Rv = L; const y = R.int(1, Math.min(20, L - 1)); rt = `${L + y} − ${y}`; } else { [rt, Rv] = cmpExpr(R, lv); }
    }
    const ans = L > Rv ? '>' : L < Rv ? '<' : '=';
    return mk({
      type: 'choice', choices: ['>', '<', '='],
      text: `Chọn dấu thích hợp điền vào ô trống:<div class="seq">${lt} ${box} ${rt}</div>`, answer: ans,
      solution: `Vế trái bằng ${L}, vế phải bằng ${Rv}. Vì ${L} ${signHtml(ans)} ${Rv} nên điền dấu <b>${signHtml(ans)}</b>.`,
    });
  }

  function arithMissing(R, lv) {
    if (lv === 3) {
      return pick(R, [
        () => { const b = R.int(60, 100), c = R.int(5, 40), a = R.int(5, b - c - 5), x = b - c - a; return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${box} + ${a} = ${b} − ${c}</div>`, answer: x, solution: `Vế phải: ${b} − ${c} = ${b - c}. Số hạng cần tìm: ${b - c} − ${a} = <b>${x}</b>.` }); },
        () => { const b = R.int(15, 40), c = R.int(10, 30), a = b + c + R.int(5, 40), x = a - b - c; return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${a} − ${box} = ${b} + ${c}</div>`, answer: x, solution: `Vế phải: ${b} + ${c} = ${b + c}. Số trừ = số bị trừ − hiệu = ${a} − ${b + c} = <b>${x}</b>.` }); },
        () => { const a = R.int(10, 30), b = R.int(10, 30), c = R.int(10, 40), x = a + b + c; return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${box} − ${a} − ${b} = ${c}</div>`, answer: x, solution: `${box} − ${a} − ${b} cũng là ${box} − ${a + b}. Vậy ${box} = ${c} + ${a + b} = <b>${x}</b>.` }); },
        () => { const k = R.pick([2, 5]), x = R.int(2, 10), a = R.int(3, 30); return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${k} × ${box} + ${a} = ${k * x + a}</div>`, answer: x, solution: `${k} × ${box} = ${k * x + a} − ${a} = ${k * x}. Nhẩm bảng nhân ${k}: ${k} × ${x} = ${k * x}. Đáp số <b>${x}</b>.` }); },
        () => { const x = R.int(10, 45), a = R.int(5, 30); return mk({ text: `Hai ô trống có cùng một số. Tìm số đó:<div class="seq">${box} + ${box} + ${a} = ${2 * x + a}</div>`, answer: x, solution: `${box} + ${box} = ${2 * x + a} − ${a} = ${2 * x}. Số cộng với chính nó bằng ${2 * x} là <b>${x}</b> (${x} + ${x} = ${2 * x}).` }); },
      ]);
    }
    const big = lv === 2;
    const kind = R.pick(['plus', 'minus1', 'minus2']);
    if (kind === 'plus') {
      const a = big ? R.int(100, 600) : R.int(15, 70), x = big ? R.int(50, 999 - a) : R.int(8, 100 - a), b = a + x;
      const left = R.chance(0.5) ? `${box} + ${a}` : `${a} + ${box}`;
      return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${left} = ${b}</div>`, answer: x, solution: `Muốn tìm số hạng, lấy tổng trừ đi số hạng kia: ${b} − ${a} = <b>${x}</b>.` });
    }
    if (kind === 'minus1') {
      const a = big ? R.int(100, 500) : R.int(8, 50), b = big ? R.int(50, 999 - a) : R.int(5, 100 - a), x = a + b;
      return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${box} − ${a} = ${b}</div>`, answer: x, solution: `Muốn tìm số bị trừ, lấy hiệu cộng với số trừ: ${b} + ${a} = <b>${x}</b>.` });
    }
    const a = big ? R.int(300, 999) : R.int(30, 100), x = big ? R.int(50, a - 20) : R.int(8, a - 5), b = a - x;
    return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${a} − ${box} = ${b}</div>`, answer: x, solution: `Muốn tìm số trừ, lấy số bị trừ trừ đi hiệu: ${a} − ${b} = <b>${x}</b>.` });
  }

  function arithQuick(R, lv) {
    if (lv === 1) {
      return pick(R, [
        () => { const f = R.sample(range(1, 9), 2), nums = R.shuffle([f[0], 10 - f[0], f[1], 10 - f[1]]); return mk({ text: `Tính nhanh:<div class="seq">${nums.join(' + ')} = ?</div>`, answer: 20, solution: `Ghép thành các cặp có tổng bằng 10: (${f[0]} + ${10 - f[0]}) + (${f[1]} + ${10 - f[1]}) = 10 + 10 = <b>20</b>.` }); },
        () => { const t = R.int(1, 6) * 10, u = R.int(1, 9), a = t + u, c = 10 - u, b = R.int(11, 40); return mk({ text: `Tính nhanh:<div class="seq">${a} + ${b} + ${c} = ?</div>`, answer: a + b + c, solution: `Ghép ${a} với ${c} cho tròn chục: ${a} + ${c} = ${a + c}. Rồi ${a + c} + ${b} = <b>${a + b + c}</b>.` }); },
        () => { const a = R.pick([2, 5, 10]), n = R.int(4, 8); return mk({ text: `Tính nhanh:<div class="seq">${rep(a, n)} = ?</div>`, answer: a * n, solution: `Có ${n} số ${a} cộng lại: ${a} × ${n} = <b>${a * n}</b>.` }); },
      ]);
    }
    if (lv === 2) {
      return pick(R, [
        () => { const x = R.int(11, 49), y = R.int(11, 49), nums = R.shuffle([x, 100 - x, y, 100 - y]); return mk({ text: `Tính nhanh:<div class="seq">${nums.join(' + ')} = ?</div>`, answer: 200, solution: `Ghép các cặp có tổng bằng 100: (${x} + ${100 - x}) + (${y} + ${100 - y}) = 100 + 100 = <b>200</b>.` }); },
        () => { const n = R.int(120, 800), k = R.pick([99, 98, 97]); const plus = R.chance(0.5); const ans = plus ? n + k : n - k; return mk({ text: `Tính nhanh:<div class="seq">${n} ${plus ? '+' : '−'} ${k} = ?</div>`, answer: ans, solution: `${k} = 100 − ${100 - k}. Nên ${n} ${plus ? '+' : '−'} ${k} = ${n} ${plus ? '+' : '−'} 100 ${plus ? '−' : '+'} ${100 - k} = ${plus ? n + 100 : n - 100} ${plus ? '−' : '+'} ${100 - k} = <b>${ans}</b>.` }); },
        () => { const m = R.int(5, 9), nums = range(1, m).map(i => 2 * i), ans = sum(nums); return mk({ text: `Tính nhanh:<div class="seq">${nums.join(' + ')} = ?</div>`, answer: ans, solution: `Ghép số đầu với số cuối: ${range(0, Math.floor(m / 2) - 1).map(i => `(${nums[i]} + ${nums[m - 1 - i]})`).join(' + ')}${m % 2 ? ` + ${nums[(m - 1) / 2]}` : ''}. Mỗi cặp bằng ${2 + 2 * m}. Kết quả <b>${ans}</b>.` }); },
        () => { const a = R.int(100, 500), b = R.int(20, 99), c = R.int(11, 60); return mk({ text: `Tính nhanh:<div class="seq">${a} + ${b} + ${c} − ${b} = ?</div>`, answer: a + c, solution: `Cộng ${b} rồi lại trừ ${b} thì như không thêm gì. Kết quả: ${a} + ${c} = <b>${a + c}</b>.` }); },
      ]);
    }
    return pick(R, [
      () => { const a = R.int(11, 40), len = R.int(6, 10), nums = range(a, a + len - 1), ans = sum(nums), h = Math.floor(len / 2); return mk({ text: `Tính nhanh:<div class="seq">${nums.join(' + ')} = ?</div>`, answer: ans, solution: `Ghép số đầu với số cuối: ${range(0, h - 1).map(i => `(${nums[i]} + ${nums[len - 1 - i]})`).join(' + ')}${len % 2 ? ` + ${nums[h]}` : ''}. Có ${h} cặp, mỗi cặp bằng ${nums[0] + nums[len - 1]}${len % 2 ? `, thêm số ${nums[h]} ở giữa` : ''}. Kết quả <b>${ans}</b>.` }); },
      () => { const N = 2 * R.int(5, 10), terms = range(1, N).reverse(); const shown = N <= 12 ? terms.map((v, i) => (i ? (i % 2 ? ' − ' : ' + ') : '') + v).join('') : `${N} − ${N - 1} + ${N - 2} − ${N - 3} + ... + 2 − 1`; return mk({ text: `Tính nhanh:<div class="seq">${shown} = ?</div>`, answer: N / 2, solution: `Ghép từng cặp: (${N} − ${N - 1}) + (${N - 2} − ${N - 3}) + ... + (2 − 1). Mỗi cặp bằng 1, có ${N / 2} cặp. Kết quả <b>${N / 2}</b>.` }); },
      () => { const k = R.int(5, 9), nums = range(1, k).map(i => 10 * i), ans = sum(nums); return mk({ text: `Tính nhanh:<div class="seq">${nums.join(' + ')} = ?</div>`, answer: ans, solution: `Ghép số đầu với số cuối: ${range(0, Math.floor(k / 2) - 1).map(i => `(${nums[i]} + ${nums[k - 1 - i]})`).join(' + ')}${k % 2 ? ` + ${nums[(k - 1) / 2]}` : ''}. Mỗi cặp bằng ${10 + 10 * k}. Kết quả <b>${ans}</b>.` }); },
      () => { const s = R.pick([3, 4, 5]), a = R.int(2, 15), len = R.pick([6, 8]), nums = range(0, len - 1).map(i => a + s * i), ans = sum(nums); return mk({ text: `Tính nhanh:<div class="seq">${nums.join(' + ')} = ?</div>`, answer: ans, solution: `Ghép số đầu với số cuối: ${range(0, len / 2 - 1).map(i => `(${nums[i]} + ${nums[len - 1 - i]})`).join(' + ')}. Có ${len / 2} cặp, mỗi cặp bằng ${nums[0] + nums[len - 1]}: ${rep(nums[0] + nums[len - 1], len / 2)} = <b>${ans}</b>.` }); },
    ]);
  }

  function arithSymbols(R, lv) {
    const [X, Y, Z] = R.sample(ANIMALS, 3);
    if (lv === 1) {
      return pick(R, [
        () => { const x = R.int(6, 50); return mk({ text: `Mỗi con vật là một số. Tìm số của ${X}:<div class="seq emoji">${X} + ${X} = ${2 * x}</div>`, answer: x, solution: `Số nào cộng với chính nó bằng ${2 * x}? ${x} + ${x} = ${2 * x}. Vậy ${X} = <b>${x}</b>.` }); },
        () => { const x = R.int(2, 10); return mk({ text: `Mỗi con vật là một số. Tìm số của ${X}:<div class="seq emoji">${X} + ${X} + ${X} = ${3 * x}</div>`, answer: x, solution: `Ba số giống nhau cộng lại bằng ${3 * x}: ${x} + ${x} + ${x} = ${3 * x}. Vậy ${X} = <b>${x}</b>.` }); },
        () => { const x = R.int(10, 60), a = R.int(10, 39); return mk({ text: `Mỗi con vật là một số. Tìm số của ${X}:<div class="seq emoji">${X} + ${a} = ${x + a}</div>`, answer: x, solution: `${X} = ${x + a} − ${a} = <b>${x}</b>.` }); },
      ]);
    }
    if (lv === 2) {
      return pick(R, [
        () => { const x = R.int(5, 40), y = R.int(5, 40); return mk({ text: `Mỗi con vật là một số. Tìm số của ${Y}:<div class="seq emoji">${X} + ${X} = ${2 * x}<br>${X} + ${Y} = ${x + y}</div>`, answer: y, solution: `Từ dòng 1: ${X} = ${x}. Từ dòng 2: ${Y} = ${x + y} − ${x} = <b>${y}</b>.` }); },
        () => { const x = R.int(20, 60), y = R.int(3, x - 5); return mk({ text: `Mỗi con vật là một số. Tìm số của ${Y}:<div class="seq emoji">${X} + ${X} = ${2 * x}<br>${X} − ${Y} = ${x - y}</div>`, answer: y, solution: `Từ dòng 1: ${X} = ${x}. Từ dòng 2: ${Y} = ${x} − ${x - y} = <b>${y}</b>.` }); },
        () => { const k = R.pick([2, 5]), x = R.int(2, 10), y = R.int(5, 30); return mk({ text: `Mỗi con vật là một số. Tìm số của ${Y}:<div class="seq emoji">${X} × ${k} = ${k * x}<br>${Y} − ${X} = ${y}</div>`, answer: x + y, solution: `Từ dòng 1: ${X} = ${k * x} : ${k} = ${x}. Từ dòng 2: ${Y} = ${y} + ${x} = <b>${x + y}</b>.` }); },
      ]);
    }
    return pick(R, [
      () => { const x = R.int(5, 30), y = R.int(5, 30); return mk({ text: `Mỗi con vật là một số. Tìm số của ${Y}:<div class="seq emoji">${X} + ${Y} = ${x + y}<br>${X} + ${X} + ${Y} = ${2 * x + y}</div>`, answer: y, solution: `Dòng 2 nhiều hơn dòng 1 đúng một ${X}: ${X} = ${2 * x + y} − ${x + y} = ${x}. Vậy ${Y} = ${x + y} − ${x} = <b>${y}</b>.` }); },
      () => { const k = R.pick([2, 5]), x = R.int(2, 10), y = R.int(3, 20), z = R.int(3, 20); return mk({ text: `Mỗi con vật là một số. Tìm số của ${Z}:<div class="seq emoji">${X} × ${k} = ${k * x}<br>${X} + ${Y} = ${x + y}<br>${Y} + ${Z} = ${y + z}</div>`, answer: z, solution: `${X} = ${k * x} : ${k} = ${x}. ${Y} = ${x + y} − ${x} = ${y}. ${Z} = ${y + z} − ${y} = <b>${z}</b>.` }); },
      () => { const x = R.int(3, 10), y = R.int(2, 9); return mk({ text: `Mỗi con vật là một số. Tìm số của ${Y}:<div class="seq emoji">${X} + ${X} + ${X} = ${3 * x}<br>${X} + ${Y} + ${Y} = ${x + 2 * y}</div>`, answer: y, solution: `Dòng 1: ${X} = ${x}. Dòng 2: ${Y} + ${Y} = ${x + 2 * y} − ${x} = ${2 * y}, nên ${Y} = <b>${y}</b>.` }); },
    ]);
  }

  function arithWord(R, lv) {
    const [A, B] = R.sample(NAMES, 2);
    if (lv === 1) {
      return pick(R, [
        () => { const a = R.int(15, 60), b = R.int(6, 30); return mk({ text: `${A} có ${a} viên bi. ${B} có nhiều hơn ${A} ${b} viên bi. Hỏi ${B} có bao nhiêu viên bi?`, answer: a + b, solution: `Nhiều hơn thì làm phép cộng: ${a} + ${b} = <b>${a + b}</b> viên bi.` }); },
        () => { const a = R.int(40, 95), b = R.int(6, 35); return mk({ text: `Thùng thứ nhất có ${a} lít nước. Thùng thứ hai ít hơn thùng thứ nhất ${b} lít. Hỏi thùng thứ hai có bao nhiêu lít nước?`, answer: a - b, solution: `Ít hơn thì làm phép trừ: ${a} − ${b} = <b>${a - b}</b> lít.` }); },
        () => { const a = R.int(12, 20), b = R.int(12, 20); return mk({ text: `Lớp 2A có ${a} bạn nam và ${b} bạn nữ. Hỏi lớp 2A có tất cả bao nhiêu bạn?`, answer: a + b, solution: `${a} + ${b} = <b>${a + b}</b> bạn.` }); },
        () => { const a = R.int(30, 90), b = R.int(8, a - 10); return mk({ text: `Cửa hàng có ${a} quả dưa, đã bán ${b} quả. Hỏi cửa hàng còn lại bao nhiêu quả dưa?`, answer: a - b, solution: `${a} − ${b} = <b>${a - b}</b> quả dưa.` }); },
      ]);
    }
    if (lv === 2) {
      return pick(R, [
        () => { const a = R.int(15, 45), b = R.int(5, 20); return mk({ text: `${A} có ${a} nhãn vở. ${B} có nhiều hơn ${A} ${b} nhãn vở. Hỏi cả hai bạn có bao nhiêu nhãn vở?`, answer: 2 * a + b, solution: `${B} có ${a} + ${b} = ${a + b} nhãn vở. Cả hai có ${a} + ${a + b} = <b>${2 * a + b}</b> nhãn vở.` }); },
        () => { const a = R.int(20, 60), b = R.int(5, 19); return mk({ text: `${A} có ${a} viên bi. ${A} có ít hơn ${B} ${b} viên bi. Hỏi ${B} có bao nhiêu viên bi?`, answer: a + b, solution: `${A} ít hơn ${B} ${b} viên nghĩa là ${B} nhiều hơn ${A} ${b} viên. ${B} có ${a} + ${b} = <b>${a + b}</b> viên bi.` }); },
        () => { const a = R.int(30, 70), b = R.int(5, 20); return mk({ text: `Hàng trên có ${a} bông hoa, hàng dưới ít hơn hàng trên ${b} bông. Hỏi cả hai hàng có bao nhiêu bông hoa?`, answer: 2 * a - b, solution: `Hàng dưới: ${a} − ${b} = ${a - b} bông. Cả hai hàng: ${a} + ${a - b} = <b>${2 * a - b}</b> bông.` }); },
        () => { const a = R.int(30, 60), b = R.int(10, 25), c = R.int(5, 30); return mk({ text: `Trên xe buýt có ${a} người. Đến bến, ${b} người xuống và ${c} người lên. Hỏi trên xe lúc này có bao nhiêu người?`, answer: a - b + c, solution: `${a} − ${b} = ${a - b}; ${a - b} + ${c} = <b>${a - b + c}</b> người.` }); },
      ]);
    }
    return pick(R, [
      () => { const s = R.int(15, 35), d = R.int(3, 10), t = R.int(2 * s - d + 5, 99); return mk({ text: `Cửa hàng có ${t} kg gạo. Buổi sáng bán ${s} kg, buổi chiều bán ít hơn buổi sáng ${d} kg. Hỏi cửa hàng còn lại bao nhiêu ki-lô-gam gạo?`, answer: t - s - (s - d), solution: `Buổi chiều bán: ${s} − ${d} = ${s - d} kg. Cả ngày bán: ${s} + ${s - d} = ${2 * s - d} kg. Còn lại: ${t} − ${2 * s - d} = <b>${t - 2 * s + d}</b> kg.` }); },
      () => { const e = R.int(10, 40), c = R.int(2, 9); return mk({ text: `${A} cho ${B} ${c} viên bi thì hai bạn có số bi bằng nhau, mỗi bạn có ${e} viên. Hỏi lúc đầu ${A} có bao nhiêu viên bi?`, answer: e + c, solution: `Trước khi cho, ${A} có nhiều hơn bây giờ ${c} viên: ${e} + ${c} = <b>${e + c}</b> viên.` }); },
      () => { const c = R.int(3, 15); return mk({ text: `Nếu ${A} cho ${B} ${c} cái kẹo thì số kẹo của hai bạn bằng nhau. Hỏi lúc đầu ${A} có nhiều hơn ${B} bao nhiêu cái kẹo?`, answer: 2 * c, solution: `${A} bớt ${c} cái, ${B} thêm ${c} cái thì bằng nhau. Vậy lúc đầu ${A} hơn ${B}: ${c} + ${c} = <b>${2 * c}</b> cái kẹo.` }); },
      () => { const a = R.int(20, 50), b = R.int(5, 15), c = R.int(5, 15), Cn = R.pick(NAMES.filter(x => x !== A && x !== B)); return mk({ text: `${A} có ${a} quyển truyện. ${B} có ít hơn ${A} ${b} quyển. ${Cn} có nhiều hơn ${B} ${c} quyển. Hỏi ${Cn} có bao nhiêu quyển truyện?`, answer: a - b + c, solution: `${B} có ${a} − ${b} = ${a - b} quyển. ${Cn} có ${a - b} + ${c} = <b>${a - b + c}</b> quyển.` }); },
    ]);
  }

  const GOODS = [['quyển vở', 6, 12], ['cái bút', 4, 9], ['cái thước', 3, 7], ['hộp sữa', 6, 10], ['quyển truyện', 15, 35], ['gói bánh', 8, 20], ['cái tẩy', 2, 5]];
  const money = n => `${n} nghìn đồng`;
  function arithMoney(R, lv) {
    const [g1, g2] = R.sample(GOODS, 2);
    const p1 = R.int(g1[1], g1[2]), p2 = R.int(g2[1], g2[2]);
    const A = R.pick(NAMES);
    if (lv === 1) {
      return pick(R, [
        () => mk({ text: `${A} mua 1 ${g1[0]} giá ${money(p1)} và 1 ${g2[0]} giá ${money(p2)}. Hỏi ${A} phải trả tất cả bao nhiêu nghìn đồng?`, answer: p1 + p2, solution: `${p1} + ${p2} = <b>${p1 + p2}</b> nghìn đồng.` }),
        () => { const notes = R.sample([1, 2, 5, 10, 20, 50], R.int(3, 4)).sort((x, y) => y - x); const s = sum(notes); return mk({ text: `${A} có các tờ tiền:<div class="seq">${notes.map(n => `${fmt(n * 1000)} đồng`).join(' &nbsp; ')}</div>Hỏi ${A} có tất cả bao nhiêu nghìn đồng?`, answer: s, solution: `${notes.join(' + ')} = <b>${s}</b> nghìn đồng.` }); },
        () => { const have = R.pick([10, 20, 50]), p = R.int(2, have - 1); return mk({ text: `${A} có ${money(have)}. ${A} mua một món đồ chơi giá ${money(p)}. Hỏi ${A} còn lại bao nhiêu nghìn đồng?`, answer: have - p, solution: `${have} − ${p} = <b>${have - p}</b> nghìn đồng.` }); },
      ]);
    }
    if (lv === 2) {
      return pick(R, [
        () => { const note = p1 + p2 < 20 ? R.pick([20, 50]) : p1 + p2 < 50 ? R.pick([50, 100]) : 100; return mk({ text: `Mẹ đưa ${A} tờ ${money(note)} để mua 1 ${g1[0]} giá ${money(p1)} và 1 ${g2[0]} giá ${money(p2)}. Hỏi cô bán hàng phải trả lại ${A} bao nhiêu nghìn đồng?`, answer: note - p1 - p2, solution: `Tiền mua: ${p1} + ${p2} = ${p1 + p2} nghìn đồng. Tiền trả lại: ${note} − ${p1 + p2} = <b>${note - p1 - p2}</b> nghìn đồng.` }); },
        () => { const p = R.pick([2, 5]), n = R.int(3, 10); return mk({ text: `Mỗi ${R.pick(['cái bút chì', 'cái tẩy', 'tờ giấy màu', 'cái kẹo mút'])} giá ${money(p)}. Hỏi mua ${n} cái như thế hết bao nhiêu nghìn đồng?`, answer: p * n, solution: `${p} × ${n} = <b>${p * n}</b> nghìn đồng.` }); },
        () => { const a = R.int(8, 20), b = R.int(2, a - 2); return mk({ text: `Một cái bút giá ${money(a)}, đắt hơn một cái thước ${money(b)}. Hỏi mua 1 cái bút và 1 cái thước hết bao nhiêu nghìn đồng?`, answer: 2 * a - b, solution: `Giá thước: ${a} − ${b} = ${a - b} nghìn đồng. Mua cả hai: ${a} + ${a - b} = <b>${2 * a - b}</b> nghìn đồng.` }); },
      ]);
    }
    return pick(R, [
      () => { const [big, small] = R.pick([[10, 2], [10, 5], [20, 5], [20, 2], [50, 10], [100, 20], [50, 5], [100, 10], [20, 10], [100, 50]]); return mk({ text: `Đổi 1 tờ ${money(big)} thì được bao nhiêu tờ ${money(small)}?`, answer: big / small, solution: `Đếm thêm ${small} cho đến ${big}: ${range(1, big / small).map(i => small * i).join(', ')}. Được <b>${big / small}</b> tờ.` }); },
      () => { const a = R.int(1, 3), b = R.int(1, 4), have = 20 * a + 5 * b, p = R.int(10, have - 1); return mk({ text: `${A} có ${a} tờ ${money(20)} và ${b} tờ ${money(5)}. ${A} mua một quyển sách giá ${money(p)}. Hỏi ${A} còn lại bao nhiêu nghìn đồng?`, answer: have - p, solution: `${A} có: ${rep(20, a)} + ${rep(5, b)} = ${have} nghìn đồng. Còn lại: ${have} − ${p} = <b>${have - p}</b> nghìn đồng.` }); },
      () => { const b = R.int(5, 30), d = 2 * R.int(2, 10), a = b + d; const B = R.pick(NAMES.filter(n => n !== A)); return mk({ text: `${A} có ${money(a)}, ${B} có ${money(b)}. ${A} phải đưa cho ${B} bao nhiêu nghìn đồng để số tiền của hai bạn bằng nhau?`, answer: d / 2, solution: `${A} hơn ${B}: ${a} − ${b} = ${d} nghìn đồng. Đưa cho ${B} một nửa số tiền hơn: ${d} : 2 = <b>${d / 2}</b> nghìn đồng (khi đó mỗi bạn có ${b + d / 2} nghìn đồng).` }); },
      () => { const p = R.pick([2, 5]), n = R.int(3, 10), have = p * n; return mk({ text: `${A} có ${money(have)}. Mỗi cái bút chì giá ${money(p)}. Hỏi ${A} mua được nhiều nhất bao nhiêu cái bút chì?`, answer: n, solution: `${have} : ${p} = <b>${n}</b> cái bút chì.` }); },
    ]);
  }

  // =====================================================================
  // LÝ THUYẾT SỐ
  // =====================================================================
  const H = n => Math.floor(n / 100), Tn = n => Math.floor(n / 10) % 10, U = n => n % 10;
  const parts3 = n => `${H(n)} trăm, ${Tn(n)} chục và ${U(n)} đơn vị`;

  function ntPlace(R, lv) {
    if (lv === 0) {
      const n = R.int(11, 99);
      return pick(R, [
        () => { const ask = R.pick(['chục', 'đơn vị']), ans = ask === 'chục' ? Tn(n) : U(n); return mk({ text: ask === 'chục' ? `Số ${n} gồm mấy chục và ${U(n)} đơn vị?` : `Số ${n} gồm ${Tn(n)} chục và mấy đơn vị?`, answer: ans, solution: `${n} = ${10 * Tn(n)} + ${U(n)}, gồm ${Tn(n)} chục và ${U(n)} đơn vị. Đáp số <b>${ans}</b>.` }); },
        () => mk({ text: `Số gồm ${Tn(n)} chục và ${U(n)} đơn vị là số nào?`, answer: n, solution: `${Tn(n)} chục là ${10 * Tn(n)}, thêm ${U(n)} đơn vị được <b>${n}</b>.` }),
        () => { const c = R.int(1, 9); return mk({ text: `${c} chục bằng bao nhiêu đơn vị?<div class="seq emoji">${'🥢'.repeat(Math.min(c, 5))}${c > 5 ? ' ...' : ''}</div>`, answer: 10 * c, solution: `1 chục = 10 đơn vị, nên ${c} chục = ${10 * c} đơn vị. Đáp số <b>${10 * c}</b>.` }); },
      ]);
    }
    const n = R.int(101, 999);
    if (lv === 1) {
      return pick(R, [
        () => mk({ text: `Số gồm ${parts3(n)} là số nào?`, answer: n, solution: `${H(n)} trăm = ${100 * H(n)}, ${Tn(n)} chục = ${10 * Tn(n)}. ${100 * H(n)} + ${10 * Tn(n)} + ${U(n)} = <b>${n}</b>.` }),
        () => { const [w, f] = R.pick([['trăm', H], ['chục', Tn], ['đơn vị', U]]); return mk({ text: `Chữ số hàng ${w} của số ${n} là chữ số nào?`, answer: f(n), solution: `${n} gồm ${parts3(n)}. Chữ số hàng ${w} là <b>${f(n)}</b>.` }); },
        () => { const h = R.int(1, 9), t = R.int(0, 9), u = R.int(0, 9), m = 100 * h + 10 * t + u; return mk({ text: `Số "${readNum(m)}" viết là số nào?`, answer: m, solution: `"${readNum(m)}" gồm ${parts3(m)}. Viết là <b>${m}</b>.` }); },
      ]);
    }
    if (lv === 2) {
      return pick(R, [
        () => { const vals = [100 * H(n), 10 * Tn(n), U(n)], j = R.int(0, 2), val = vals[j]; const shown = vals.map((v, i) => (i === j ? box : v)).join(' + '); return mk({ text: `Tìm số thích hợp điền vào ô trống:<div class="seq">${n} = ${shown}</div>`, answer: val, solution: `${n} gồm ${parts3(n)}: ${n} = ${100 * H(n)} + ${10 * Tn(n)} + ${U(n)}. Ô trống là <b>${val}</b>.` }); },
        () => { const h = R.int(1, 9), u = R.int(1, 9); return mk({ text: `Số gồm ${h} trăm và ${u} đơn vị là số nào?`, answer: 100 * h + u, solution: `Không có chục nên chữ số hàng chục là 0: <b>${100 * h + u}</b>.` }); },
        () => { const h = R.int(1, 9), t = R.int(1, 9); return mk({ text: `Số gồm ${h} trăm và ${t} chục là số nào?`, answer: 100 * h + 10 * t, solution: `Không có đơn vị nên chữ số hàng đơn vị là 0: <b>${100 * h + 10 * t}</b>.` }); },
      ]);
    }
    return pick(R, [
      () => { const h = R.int(1, 7), t = R.int(10, 19), u = R.int(0, 9), m = 100 * h + 10 * t + u; return mk({ text: `Số gồm ${h} trăm, ${t} chục và ${u} đơn vị là số nào?`, answer: m, solution: `${t} chục = ${10 * t} = 1 trăm và ${t - 10} chục. Vậy có ${h + 1} trăm, ${t - 10} chục, ${u} đơn vị: ${100 * h} + ${10 * t} + ${u} = <b>${m}</b>.` }); },
      () => { const h = R.int(1, 8), x = R.int(11, 99), m = 100 * h + x; return mk({ text: `Số gồm ${h} trăm và ${x} đơn vị là số nào?`, answer: m, solution: `${100 * h} + ${x} = <b>${m}</b>.` }); },
      () => { const m = 10 * R.int(11, 99); return mk({ text: `Số ${m} có tất cả bao nhiêu chục?`, answer: m / 10, solution: `${m} = ${m / 10} chục (vì ${m / 10} × 10 = ${m}). Chú ý: chữ số hàng chục là ${Tn(m)} nhưng số chục là <b>${m / 10}</b>.` }); },
      () => { const m = R.int(101, 999); return mk({ text: `Số ${m} có tất cả bao nhiêu chục (bỏ qua số đơn vị lẻ)?`, answer: Math.floor(m / 10), solution: `${m} = ${10 * Math.floor(m / 10)} + ${U(m)}. ${10 * Math.floor(m / 10)} gồm <b>${Math.floor(m / 10)}</b> chục.` }); },
    ]);
  }

  function ntNeighbor(R, lv) {
    if (lv <= 1) {
      const a = lv === 0 ? R.int(10, 99) : R.pick([R.int(100, 998), 100 * R.int(1, 9), 10 * R.int(10, 99), 100 * R.int(1, 9) + 99]), after = R.chance(0.5);
      return mk({ text: `Số liền ${after ? 'sau' : 'trước'} của số ${a} là số nào?`, answer: after ? a + 1 : a - 1, solution: `Số liền ${after ? 'sau thì thêm 1' : 'trước thì bớt 1'}: ${a} ${after ? '+' : '−'} 1 = <b>${after ? a + 1 : a - 1}</b>.` });
    }
    if (lv === 2) {
      return pick(R, [
        () => { const a = R.int(101, 998); return mk({ text: `Số liền sau của số liền trước của ${a} là số nào?`, answer: a, solution: `Số liền trước của ${a} là ${a - 1}. Số liền sau của ${a - 1} là <b>${a}</b>.` }); },
        () => { const a = R.int(100, 997); return mk({ text: `Số nào lớn hơn ${a} nhưng bé hơn ${a + 2}?`, answer: a + 1, solution: `Giữa ${a} và ${a + 2} chỉ có số <b>${a + 1}</b>.` }); },
        () => { const a = 10 * R.int(10, 99) - R.int(1, 2); return mk({ text: `Số liền sau của số liền sau của ${a} là số nào?`, answer: a + 2, solution: `${a} → ${a + 1} → <b>${a + 2}</b>.` }); },
        () => { const a = R.int(110, 999); return mk({ text: `Số liền trước của số liền trước của ${a} là số nào?`, answer: a - 2, solution: `${a} → ${a - 1} → <b>${a - 2}</b>.` }); },
      ]);
    }
    return pick(R, [
      () => mk({ text: 'Số liền trước của số bé nhất có ba chữ số là số nào?', answer: 99, solution: 'Số bé nhất có ba chữ số là 100. Số liền trước của 100 là <b>99</b>.' }),
      () => mk({ text: 'Số liền sau của số lớn nhất có ba chữ số là số nào?', answer: 1000, solution: 'Số lớn nhất có ba chữ số là 999. Số liền sau là <b>1000</b>.' }),
      () => mk({ text: 'Số liền sau của số lớn nhất có hai chữ số là số nào?', answer: 100, solution: 'Số lớn nhất có hai chữ số là 99. Số liền sau là <b>100</b>.' }),
      () => { const a = R.int(20, 200); return mk({ text: `Hai số liền nhau có tổng bằng ${2 * a + 1}. Tìm số lớn hơn.`, answer: a + 1, solution: `Hai số liền nhau hơn kém nhau 1. Bớt 1 đi: ${2 * a + 1} − 1 = ${2 * a} là hai lần số bé, số bé là ${a}. Số lớn là ${a} + 1 = <b>${a + 1}</b>.` }); },
      () => { const a = R.int(10, 99); return mk({ text: `Ba số liền nhau có tổng bằng ${3 * a}. Tìm số ở giữa.`, answer: a, solution: `Ba số liền nhau: (số giữa − 1), số giữa, (số giữa + 1). Tổng bằng 3 lần số giữa. Thử: ${a - 1} + ${a} + ${a + 1} = ${3 * a}. Số ở giữa là <b>${a}</b>.` }); },
    ]);
  }

  function ntOrder(R, lv) {
    if (lv === 0) {
      const nums = R.sample(range(10, 99), 3), big = R.chance(0.5), ans = big ? Math.max(...nums) : Math.min(...nums);
      return mk({ type: 'choice', choices: nums.map(String), text: `Số nào ${big ? 'lớn nhất' : 'bé nhất'}?<div class="seq">${nums.join(', ')}</div>`, answer: ans, solution: `So sánh hàng chục trước, nếu bằng nhau thì so sánh hàng đơn vị. Xếp từ bé đến lớn: ${nums.slice().sort((x, y) => x - y).join(', ')}. Số ${big ? 'lớn nhất' : 'bé nhất'} là <b>${ans}</b>.` });
    }
    if (lv === 1) {
      const base = R.int(1, 8) * 100;
      const nums = R.sample(range(base, base + 199), 5);
      const sorted = nums.slice().sort((x, y) => x - y);
      const up = R.chance(0.5), k = R.int(2, 4), list = up ? sorted : sorted.slice().reverse();
      return mk({ text: `Sắp xếp các số ${nums.join(', ')} theo thứ tự từ ${up ? 'bé đến lớn' : 'lớn đến bé'}. Số đứng thứ ${k} là số nào?`, answer: list[k - 1], solution: `So sánh hàng trăm, rồi hàng chục, rồi hàng đơn vị. Từ ${up ? 'bé đến lớn' : 'lớn đến bé'}: ${list.join(', ')}. Số thứ ${k} là <b>${list[k - 1]}</b>.` });
    }
    // Điền chữ số vào ô trống để phép so sánh đúng
    for (let tries = 0; tries < 50; tries++) {
      const X = R.int(100, 999), pos = R.pick([1, 1, 0, 2]);
      const Y = X + R.int(-60, 60);
      if (Y < 100 || Y > 999 || Y === X) continue;
      const op = R.pick(['<', '>']);
      const val = d => X - dig(X, pos) * 10 ** pos + d * 10 ** pos;
      const ds = range(pos === 2 ? 1 : 0, 9).filter(d => (op === '<' ? val(d) < Y : val(d) > Y));
      if (ds.length < 1 || ds.length > 8) continue;
      const shown = String(X).split('').map((c, i) => (i === 2 - pos ? box : c)).join('');
      const opH = signHtml(op);
      if (lv === 2) {
        const ans = op === '<' ? Math.max(...ds) : Math.min(...ds), w = op === '<' ? 'lớn nhất' : 'bé nhất';
        return mk({ text: `Tìm chữ số ${w} điền vào ô trống:<div class="seq">${shown} ${opH} ${Y}</div>`, answer: ans, solution: `Thử lần lượt các chữ số: điền được ${ds.join(', ')} (ví dụ ${val(ans)} ${opH} ${Y}). Chữ số ${w} là <b>${ans}</b>.` });
      }
      return mk({ text: `Có bao nhiêu chữ số có thể điền vào ô trống?<div class="seq">${shown} ${opH} ${Y}</div>`, answer: ds.length, solution: `Thử lần lượt các chữ số${pos === 2 ? ' (hàng trăm phải khác 0)' : ''}: chỉ có ${ds.join(', ')} thỏa mãn (được các số ${ds.map(val).join(', ')}). Có <b>${ds.length}</b> chữ số.` });
    }
    return ntOrder(R, 1);
  }

  function ntRound(R, lv) {
    if (lv === 0) {
      return pick(R, [
        () => { const k = R.int(1, 8), after = R.chance(0.5) || k === 1; return mk({ text: `Số tròn chục liền ${after ? 'sau' : 'trước'} của ${10 * k} là số nào?`, answer: after ? 10 * k + 10 : 10 * k - 10, solution: `Các số tròn chục: 10, 20, 30, ..., 90. Số tròn chục liền ${after ? 'sau' : 'trước'} của ${10 * k} là <b>${after ? 10 * k + 10 : 10 * k - 10}</b>.` }); },
        () => { const ans = 10 * R.int(1, 9); const pool = R.sample(range(11, 99).filter(x => x % 10), 3); return mk({ type: 'choice', choices: R.shuffle([ans, ...pool].map(String)), text: 'Số nào là số tròn chục?', answer: ans, solution: `Số tròn chục có chữ số hàng đơn vị là 0. Đó là <b>${ans}</b>.` }); },
        () => { let n; do { n = R.int(11, 89); } while (n % 10 === 0); const lo = n - (n % 10); return mk({ text: `Số ${n} nằm giữa hai số tròn chục nào? Hãy cho biết số tròn chục lớn hơn.`, answer: lo + 10, solution: `${lo} ${LT} ${n} ${LT} ${lo + 10}. Số tròn chục lớn hơn là <b>${lo + 10}</b>.` }); },
      ]);
    }
    if (lv === 1) {
      return pick(R, [
        () => { const k = R.int(1, 8), after = R.chance(0.5) || k === 1; return mk({ text: `Số tròn trăm liền ${after ? 'sau' : 'trước'} của ${100 * k} là số nào?`, answer: after ? 100 * k + 100 : 100 * k - 100, solution: `Các số tròn trăm: 100, 200, ..., 900. Đáp số <b>${after ? 100 * k + 100 : 100 * k - 100}</b>.` }); },
        () => { let n; do { n = R.int(101, 998); } while (n % 10 === 0); const f = n - (n % 10); return mk({ text: `Số tròn chục lớn nhất bé hơn ${n} là số nào?`, answer: f, solution: `Hai số tròn chục gần ${n} nhất là ${f} và ${f + 10}. Số tròn chục lớn nhất bé hơn ${n} là <b>${f}</b>.` }); },
        () => { let n; do { n = R.int(101, 899); } while (n % 100 === 0); const c = n - (n % 100) + 100; return mk({ text: `Số tròn trăm bé nhất lớn hơn ${n} là số nào?`, answer: c, solution: `${n} nằm giữa ${c - 100} và ${c}. Số tròn trăm bé nhất lớn hơn ${n} là <b>${c}</b>.` }); },
      ]);
    }
    const countTens = (a, b) => { const l = []; for (let x = a + 1; x < b; x++) if (x % 10 === 0) l.push(x); return l; };
    if (lv === 2) {
      return pick(R, [
        () => { const a = R.int(100, 700), b = a + R.int(25, 90), l = countTens(a, b); return mk({ text: `Có bao nhiêu số tròn chục lớn hơn ${a} và bé hơn ${b}?`, answer: l.length, solution: `Đó là các số ${l.join(', ')}. Có <b>${l.length}</b> số.` }); },
        () => { const a = R.int(1, 5) * 100 + R.int(1, 99), b = R.int(6, 9) * 100 + R.int(1, 99); const l = []; for (let x = a + 1; x < b; x++) if (x % 100 === 0) l.push(x); return mk({ text: `Có bao nhiêu số tròn trăm lớn hơn ${a} và bé hơn ${b}?`, answer: l.length, solution: `Đó là các số ${l.join(', ')}. Có <b>${l.length}</b> số.` }); },
        () => { const k = R.int(11, 99), m = 10 * k; return mk({ text: `Số tròn chục ${m} gồm bao nhiêu chục?`, answer: k, solution: `${m} = ${k} chục. Đáp số <b>${k}</b>.` }); },
      ]);
    }
    const F = [['số tròn trăm lớn nhất', 900], ['số tròn trăm bé nhất', 100], ['số tròn chục lớn nhất có ba chữ số', 990], ['số tròn chục lớn nhất có hai chữ số', 90], ['số tròn chục bé nhất có ba chữ số', 100], ['số tròn chục bé nhất có hai chữ số', 10]];
    return pick(R, [
      () => mk({ text: 'Có bao nhiêu số tròn chục có ba chữ số?', answer: 90, solution: 'Các số tròn chục có ba chữ số: 100, 110, ..., 990. Mỗi trăm (100 – 190, 200 – 290, ...) có 10 số tròn chục, có 9 trăm: 10 × 9 = <b>90</b> số.' }),
      () => { const [p, q] = R.sample(F, 2), hi = p[1] >= q[1] ? p : q, lo = hi === p ? q : p, add = (R.chance(0.5) || hi[1] === lo[1]) && hi[1] + lo[1] <= 1000; return mk({ text: `Tính ${add ? 'tổng' : 'hiệu'} của ${hi[0]} và ${lo[0]}.`, answer: add ? hi[1] + lo[1] : hi[1] - lo[1], solution: `${cap(hi[0])} là ${hi[1]}, ${lo[0]} là ${lo[1]}. ${add ? `Tổng: ${hi[1]} + ${lo[1]}` : `Hiệu: ${hi[1]} − ${lo[1]}`} = <b>${add ? hi[1] + lo[1] : hi[1] - lo[1]}</b>.` }); },
      () => { const a = R.int(100, 400), b = a + R.int(100, 300), l = countTens(a, b); return mk({ text: `Có bao nhiêu số tròn chục lớn hơn ${a} và bé hơn ${b}?`, answer: l.length, solution: `Số tròn chục đầu tiên là ${l[0]}, cuối cùng là ${l[l.length - 1]}. Đếm theo chục: từ ${l[0] / 10} chục đến ${l[l.length - 1] / 10} chục có ${l[l.length - 1] / 10} − ${l[0] / 10} + 1 = <b>${l.length}</b> số.` }); },
    ]);
  }

  function ntEvenOdd(R, lv) {
    if (lv === 0) {
      return pick(R, [
        () => { const n = R.int(10, 99), ans = n % 2 ? 'Số lẻ' : 'Số chẵn'; return mk({ type: 'choice', choices: ['Số chẵn', 'Số lẻ'], text: `Số ${n} là số chẵn hay số lẻ?`, answer: ans, solution: `Chữ số hàng đơn vị là ${U(n)}${n % 2 ? ' (1, 3, 5, 7, 9 là lẻ)' : ' (0, 2, 4, 6, 8 là chẵn)'}. Vậy ${n} là <b>${ans.toLowerCase()}</b>.` }); },
        () => { const even = R.chance(0.5), n = R.int(10, 96), next = n % 2 === (even ? 0 : 1) ? n + 2 : n + 1; return mk({ text: `Số ${even ? 'chẵn' : 'lẻ'} liền sau của ${n} là số nào?`, answer: next, solution: `Các số ${even ? 'chẵn' : 'lẻ'} cách nhau 2 đơn vị. Số ${even ? 'chẵn' : 'lẻ'} liền sau ${n} là <b>${next}</b>.` }); },
      ]);
    }
    const even = R.chance(0.5), w = even ? 'chẵn' : 'lẻ';
    if (lv === 1) {
      const a = R.int(10, 70), b = a + R.int(8, 25), list = range(a, b).filter(n => (n % 2 === 0) === even);
      return mk({ text: `Từ ${a} đến ${b} có bao nhiêu số ${w}?`, answer: list.length, solution: `Các số ${w}: ${listOrCount(list)}. Có <b>${list.length}</b> số.` });
    }
    if (lv === 2) {
      return pick(R, [
        () => { const a = R.int(100, 800), b = a + R.int(20, 99), list = range(a, b).filter(n => (n % 2 === 0) === even); return mk({ text: `Từ ${a} đến ${b} có bao nhiêu số ${w}?`, answer: list.length, solution: `Số ${w} đầu tiên là ${list[0]}, cuối cùng là ${list[list.length - 1]}. Hai số ${w} liền nhau cách nhau 2: (${list[list.length - 1]} − ${list[0]}) : 2 + 1 = ${(list[list.length - 1] - list[0]) / 2} + 1 = <b>${list.length}</b> số.` }); },
        () => { const qs = [['Số chẵn lớn nhất có ba chữ số là số nào?', 998, 'Số lớn nhất có ba chữ số là 999 (lẻ). Số chẵn liền trước là <b>998</b>.'], ['Số lẻ bé nhất có ba chữ số là số nào?', 101, '100 là số chẵn, số lẻ liền sau là <b>101</b>.'], ['Số lẻ lớn nhất có hai chữ số là số nào?', 99, '<b>99</b> có chữ số tận cùng 9 nên là số lẻ.'], ['Số chẵn bé nhất có ba chữ số là số nào?', 100, '<b>100</b> có chữ số tận cùng 0 nên là số chẵn.']]; const [t, a, s] = R.pick(qs); return mk({ text: t, answer: a, solution: s }); },
      ]);
    }
    return pick(R, [
      () => { const [t, a, s] = R.pick([['Có bao nhiêu số lẻ có hai chữ số?', 45, 'Có 90 số có hai chữ số (10 đến 99), một nửa là số lẻ: 90 : 2 = <b>45</b>.'], ['Có bao nhiêu số chẵn có hai chữ số?', 45, 'Có 90 số có hai chữ số (10 đến 99), số chẵn và số lẻ xen kẽ nhau nên số chẵn là một nửa: <b>45</b>.'], ['Có bao nhiêu số chẵn có ba chữ số?', 450, 'Có 900 số có ba chữ số (100 đến 999), số chẵn bằng một nửa: <b>450</b>.'], ['Số chẵn lớn nhất có ba chữ số khác nhau là số nào?', 986, 'Hàng trăm 9, hàng chục 8; hàng đơn vị chẵn, khác 8: lớn nhất là 6. Đáp số <b>986</b>.'], ['Số lẻ bé nhất có ba chữ số khác nhau là số nào?', 103, 'Hàng trăm 1, hàng chục 0; hàng đơn vị lẻ, khác 1: bé nhất là 3. Đáp số <b>103</b>.']]); return mk({ text: t, answer: a, solution: s }); },
      () => { const a = R.int(10, 200), odd = R.chance(0.5), x = odd ? 2 * a + 1 : 2 * a; return mk({ text: `Hai số ${odd ? 'lẻ' : 'chẵn'} liền nhau có tổng bằng ${2 * x + 2}. Tìm số lớn hơn.`, answer: x + 2, solution: `Hai số ${odd ? 'lẻ' : 'chẵn'} liền nhau hơn kém nhau 2. Bớt 2 đi: ${2 * x + 2} − 2 = ${2 * x} là hai lần số bé, nên số bé là ${x}. Số lớn là ${x} + 2 = <b>${x + 2}</b>.` }); },
      () => { const n = R.int(30, 99), cnt = Math.ceil(n / 2); return mk({ text: `Từ 1 đến ${n} có bao nhiêu số lẻ?`, answer: cnt, solution: `Các số lẻ 1, 3, 5, ..., ${n % 2 ? n : n - 1}. Cứ hai số liền nhau có một số lẻ; ${n % 2 ? `từ 1 đến ${n - 1} có ${(n - 1) / 2} số lẻ, thêm số ${n}` : `${n} số có ${n} : 2 số lẻ`}: <b>${cnt}</b> số.` }); },
    ]);
  }

  function ntCount(R, lv) {
    if (lv === 1) {
      return pick(R, [
        () => { const a = R.int(10, 60), b = a + R.int(8, 35); return mk({ text: `Từ ${a} đến ${b} có bao nhiêu số?`, answer: b - a + 1, solution: `Số các số = số cuối − số đầu + 1 = ${b} − ${a} + 1 = <b>${b - a + 1}</b>.` }); },
        () => { const a = R.int(10, 60), b = a + R.int(4, 15); return mk({ text: `Có bao nhiêu số lớn hơn ${a} và bé hơn ${b}?`, answer: b - a - 1, solution: `Đó là các số từ ${a + 1} đến ${b - 1}: ${b - 1} − ${a + 1} + 1 = <b>${b - a - 1}</b> số.` }); },
      ]);
    }
    if (lv === 2) {
      return pick(R, [
        () => { const a = R.int(100, 700), b = a + R.int(20, 250); return mk({ text: `Từ ${a} đến ${b} có bao nhiêu số?`, answer: b - a + 1, solution: `${b} − ${a} + 1 = <b>${b - a + 1}</b> số.` }); },
        () => mk({ text: 'Có bao nhiêu số có hai chữ số?', answer: 90, solution: 'Các số có hai chữ số từ 10 đến 99: 99 − 10 + 1 = <b>90</b> số.' }),
        () => { const b = R.int(20, 99); return mk({ text: `Có bao nhiêu số có hai chữ số bé hơn ${b}?`, answer: b - 10, solution: `Các số từ 10 đến ${b - 1}: ${b - 1} − 10 + 1 = <b>${b - 10}</b> số.` }); },
        () => { const a = R.int(100, 800), b = a + R.int(10, 150); return mk({ text: `Có bao nhiêu số lớn hơn ${a} và bé hơn ${b}?`, answer: b - a - 1, solution: `Các số từ ${a + 1} đến ${b - 1}: ${b - 1} − ${a + 1} + 1 = <b>${b - a - 1}</b> số.` }); },
      ]);
    }
    return pick(R, [
      () => mk({ text: 'Có bao nhiêu số có ba chữ số?', answer: 900, solution: 'Các số từ 100 đến 999: 999 − 100 + 1 = <b>900</b> số.' }),
      () => { const b = R.int(150, 999); return mk({ text: `Có bao nhiêu số có ba chữ số bé hơn ${b}?`, answer: b - 100, solution: `Các số từ 100 đến ${b - 1}: ${b - 1} − 100 + 1 = <b>${b - 100}</b> số.` }); },
      () => { const b = R.int(100, 950); return mk({ text: `Có bao nhiêu số có ba chữ số lớn hơn ${b}?`, answer: 999 - b, solution: `Các số từ ${b + 1} đến 999: 999 − ${b + 1} + 1 = <b>${999 - b}</b> số.` }); },
      () => { const d = R.int(1, 9); return mk({ text: `Có bao nhiêu số có ba chữ số mà chữ số hàng trăm là ${d}?`, answer: 100, solution: `Đó là các số từ ${d}00 đến ${d}99: ${d}99 − ${d}00 + 1 = <b>100</b> số.` }); },
      () => mk({ text: 'Có bao nhiêu số có ba chữ số mà ba chữ số đều giống nhau?', answer: 9, solution: '111, 222, 333, 444, 555, 666, 777, 888, 999: có <b>9</b> số.' }),
      () => { const d = R.int(1, 9), u = R.int(0, 9); return mk({ text: `Có bao nhiêu số có ba chữ số có chữ số hàng trăm là ${d} và chữ số hàng đơn vị là ${u}?`, answer: 10, solution: `Chữ số hàng chục có thể là 0, 1, ..., 9: ${d}0${u}, ${d}1${u}, ..., ${d}9${u}. Có <b>10</b> số.` }); },
    ]);
  }

  const digitCount = n => (n <= 9 ? n : n <= 99 ? 9 + 2 * (n - 9) : 189 + 3 * (n - 99));
  function ntWrite(R, lv) {
    if (lv === 2) {
      return pick(R, [
        () => { const n = R.int(15, 99); return mk({ text: `${R.pick(NAMES)} đánh số trang một quyển truyện từ trang 1 đến trang ${n}. Hỏi phải viết tất cả bao nhiêu chữ số?`, answer: digitCount(n), solution: `Trang 1 đến 9: 9 chữ số. Trang 10 đến ${n}: ${n - 9} trang, mỗi trang 2 chữ số: ${n - 9} + ${n - 9} = ${2 * (n - 9)} chữ số. Tổng: 9 + ${2 * (n - 9)} = <b>${digitCount(n)}</b> chữ số.` }); },
        () => { const a = R.int(10, 60), b = a + R.int(5, 30); return mk({ text: `Viết các số từ ${a} đến ${b} thì phải viết bao nhiêu chữ số?`, answer: 2 * (b - a + 1), solution: `Từ ${a} đến ${b} có ${b} − ${a} + 1 = ${b - a + 1} số, mỗi số có 2 chữ số: ${b - a + 1} + ${b - a + 1} = <b>${2 * (b - a + 1)}</b> chữ số.` }); },
        () => { const n = R.int(100, 115); return mk({ text: `Viết các số từ 1 đến ${n} thì phải viết bao nhiêu chữ số?`, answer: digitCount(n), solution: `1 đến 9: 9 chữ số. 10 đến 99: 90 số × 2 = 180 chữ số. 100 đến ${n}: ${n - 99} số × 3 = ${3 * (n - 99)} chữ số. Tổng: 9 + 180 + ${3 * (n - 99)} = <b>${digitCount(n)}</b>.` }); },
      ]);
    }
    return pick(R, [
      () => {
        const n = R.int(30, 120), d = R.int(1, 9);
        let cnt = 0; const hits = [];
        for (let i = 1; i <= n; i++) { const c = digitsOf(i).filter(x => x === d).length; if (c) { cnt += c; hits.push(i); } }
        const dbl = hits.filter(h => digitsOf(h).filter(x => x === d).length > 1);
        return mk({ text: `Viết các số từ 1 đến ${n}. Hỏi chữ số ${d} được viết bao nhiêu lần?`, answer: cnt, solution: `Các số có chữ số ${d}: ${listOrCount(hits, 30)}.${dbl.length ? ` Chú ý ${dbl.join(', ')} có hai chữ số ${d}.` : ''} Tổng cộng <b>${cnt}</b> lần.` });
      },
      () => { const n = R.int(15, 99), k = digitCount(n); return mk({ text: `Để đánh số trang một quyển sách (bắt đầu từ trang 1) người ta phải viết tất cả ${k} chữ số. Hỏi quyển sách có bao nhiêu trang?`, answer: n, solution: `Trang 1 đến 9 dùng 9 chữ số. Còn lại ${k} − 9 = ${k - 9} chữ số cho các trang có 2 chữ số: ${k - 9} : 2 = ${(k - 9) / 2} trang (từ trang 10 đến trang ${n}). Quyển sách có 9 + ${(k - 9) / 2} = <b>${n}</b> trang.` }); },
      () => { const d = R.int(1, 9); return mk({ text: `Viết các số có hai chữ số. Hỏi chữ số ${d} được viết ở hàng chục bao nhiêu lần?`, answer: 10, solution: `Các số ${d}0, ${d}1, ..., ${d}9 có chữ số ${d} ở hàng chục: <b>10</b> lần.` }); },
    ]);
  }

  function ntFromDigits(R, lv) {
    let ds;
    if (lv === 1) ds = R.sample(range(1, 9), 3);
    else if (lv === 2) { ds = R.sample(range(1, 9), 3); if (R.chance(0.6)) ds[R.int(0, 2)] = 0; } else { ds = R.sample(range(1, 9), 4); if (R.chance(0.6)) ds[R.int(0, 3)] = 0; }
    const all = make3(ds, false), shown = R.shuffle(ds).join(', ');
    const zeroNote = ds.includes(0) ? ' Chữ số 0 không được đứng ở hàng trăm.' : '';
    if (lv === 1) {
      if (R.chance(0.3)) { const two = make2(ds, false), mx = R.chance(0.5); const ans = mx ? two[two.length - 1] : two[0]; return mk({ text: `Từ ba chữ số ${shown}, hãy lập số ${mx ? 'lớn nhất' : 'bé nhất'} có hai chữ số khác nhau.`, answer: ans, solution: `${mx ? 'Chọn chữ số lớn nhất ở hàng chục, chữ số lớn thứ hai ở hàng đơn vị' : 'Chọn chữ số bé nhất ở hàng chục, chữ số bé thứ hai ở hàng đơn vị'}: <b>${ans}</b>.` }); }
      const mx = R.chance(0.5), ans = mx ? all[all.length - 1] : all[0];
      return mk({ text: `Từ ba chữ số ${shown}, hãy lập số ${mx ? 'lớn nhất' : 'bé nhất'} có ba chữ số khác nhau.`, answer: ans, solution: `${mx ? 'Xếp các chữ số từ lớn đến bé' : 'Xếp các chữ số từ bé đến lớn'}: hàng trăm, hàng chục rồi hàng đơn vị. Được <b>${ans}</b>.` });
    }
    if (lv === 2) {
      return pick(R, [
        () => { const mx = R.chance(0.5), ans = mx ? all[all.length - 1] : all[0]; return mk({ text: `Từ ba chữ số ${shown}, hãy lập số ${mx ? 'lớn nhất' : 'bé nhất'} có ba chữ số khác nhau.`, answer: ans, solution: `${mx ? 'Chọn chữ số lớn nhất làm hàng trăm, rồi lớn tiếp theo làm hàng chục' : 'Chọn chữ số bé nhất (khác 0) làm hàng trăm, rồi chữ số bé nhất còn lại làm hàng chục'}.${zeroNote} Được <b>${ans}</b>.` }); },
        () => { const even = R.chance(0.5), l = all.filter(n => (n % 2 === 0) === even); if (!l.length) return ntFromDigits(R, 1); const mx = R.chance(0.5), ans = mx ? l[l.length - 1] : l[0]; return mk({ text: `Từ ba chữ số ${shown}, hãy lập số ${even ? 'chẵn' : 'lẻ'} ${mx ? 'lớn nhất' : 'bé nhất'} có ba chữ số khác nhau.`, answer: ans, solution: `Các số có ba chữ số khác nhau lập được: ${all.join(', ')}. Các số ${even ? 'chẵn' : 'lẻ'}: ${l.join(', ')}. Số ${mx ? 'lớn nhất' : 'bé nhất'} là <b>${ans}</b>.` }); },
      ]);
    }
    return pick(R, [
      () => { const mx = all[all.length - 1], mn = all[0]; return mk({ text: `Từ bốn chữ số ${shown}, lập số lớn nhất và số bé nhất có ba chữ số khác nhau. Tính hiệu của hai số đó.`, answer: mx - mn, solution: `Số lớn nhất: ${mx}. Số bé nhất: ${mn}.${zeroNote} Hiệu: ${mx} − ${mn} = <b>${mx - mn}</b>.` }); },
      () => { const mx = all[all.length - 1], mn = all[0]; if (mx + mn > 999) return mk({ text: `Từ bốn chữ số ${shown}, lập số lớn nhất và số bé nhất có ba chữ số khác nhau. Tính hiệu của hai số đó.`, answer: mx - mn, solution: `Số lớn nhất: ${mx}. Số bé nhất: ${mn}.${zeroNote} Hiệu: ${mx} − ${mn} = <b>${mx - mn}</b>.` }); return mk({ text: `Từ bốn chữ số ${shown}, lập số lớn nhất và số bé nhất có ba chữ số khác nhau. Tính tổng của hai số đó.`, answer: mx + mn, solution: `Số lớn nhất: ${mx}. Số bé nhất: ${mn}.${zeroNote} Tổng: ${mx} + ${mn} = <b>${mx + mn}</b>.` }); },
      () => { const t = 100 * R.pick(ds.filter(d => d > 0).sort((x, y) => x - y).slice(1)), l = all.filter(n => n > t); return mk({ text: `Từ bốn chữ số ${shown} lập được bao nhiêu số có ba chữ số khác nhau và lớn hơn ${t}?`, answer: l.length, solution: `Liệt kê: ${l.join(', ')}. Có <b>${l.length}</b> số.` }); },
    ]);
  }

  function ntDigitSum(R, lv) {
    if (lv === 1) {
      return pick(R, [
        () => { const n = R.int(101, 999), s = sum(digitsOf(n)); return mk({ text: `Tính tổng các chữ số của số ${n}.`, answer: s, solution: `${digitsOf(n).join(' + ')} = <b>${s}</b>.` }); },
        () => { const h = R.int(1, 9), u = R.int(0, 9), x = R.int(0, 9), s = h + x + u; return mk({ text: `Số ${h}${box}${u} có tổng các chữ số bằng ${s}. Tìm chữ số ở ô trống.`, answer: x, solution: `${h} + ${box} + ${u} = ${s}, nên ${box} = ${s} − ${h + u} = <b>${x}</b>.` }); },
      ]);
    }
    if (lv === 2) {
      return pick(R, [
        () => { const k = R.int(2, 17), l = range(10, 99).filter(n => sum(digitsOf(n)) === k); return mk({ text: `Có bao nhiêu số có hai chữ số mà tổng hai chữ số bằng ${k}?`, answer: l.length, solution: `Liệt kê theo hàng chục từ bé đến lớn: ${l.join(', ')}. Có <b>${l.length}</b> số.` }); },
        () => { const k = R.int(3, 17), l = range(10, 99).filter(n => sum(digitsOf(n)) === k), mx = R.chance(0.5), ans = mx ? l[l.length - 1] : l[0]; return mk({ text: `Tìm số ${mx ? 'lớn nhất' : 'bé nhất'} có hai chữ số mà tổng hai chữ số bằng ${k}.`, answer: ans, solution: `Muốn số ${mx ? 'lớn nhất' : 'bé nhất'} thì chữ số hàng chục phải ${mx ? 'lớn nhất' : 'bé nhất'} có thể. Các số: ${l.join(', ')}. Đáp số <b>${ans}</b>.` }); },
      ]);
    }
    const k = R.pick([2, 3, 4, 5, 24, 25, 26]), l = range(100, 999).filter(n => sum(digitsOf(n)) === k);
    return mk({ text: `Có bao nhiêu số có ba chữ số mà tổng các chữ số bằng ${k}?`, answer: l.length, solution: `Liệt kê theo hàng trăm từ ${k > 20 ? 'lớn đến bé' : 'bé đến lớn'}: ${(k > 20 ? l.slice().reverse() : l).join(', ')}. Có <b>${l.length}</b> số.` });
  }

  const distinct3 = n => new Set(String(n)).size === 3;
  function ntSpecial(R, lv) {
    const Q = lv === 1 ? [
      () => ['Số lớn nhất có ba chữ số là số nào?', 999, 'Mọi chữ số đều lớn nhất là 9: <b>999</b>.'],
      () => ['Số bé nhất có ba chữ số là số nào?', 100, 'Hàng trăm bé nhất là 1, hai hàng còn lại là 0: <b>100</b>.'],
      () => ['Số lớn nhất có ba chữ số khác nhau là số nào?', 987, 'Chọn các chữ số lớn nhất khác nhau: 9, 8, 7. Đáp số <b>987</b>.'],
      () => ['Số bé nhất có ba chữ số khác nhau là số nào?', 102, 'Hàng trăm bé nhất là 1, hàng chục 0, hàng đơn vị khác 1 và 0 nên bé nhất là 2: <b>102</b>.'],
      () => { const d = R.int(1, 8); return [`Số lớn nhất có ba chữ số mà chữ số hàng trăm là ${d} là số nào?`, 100 * d + 99, `Hàng trăm là ${d}, hai hàng còn lại lớn nhất là 9: <b>${100 * d + 99}</b>.`]; },
      () => { const d = R.int(2, 9); return [`Số bé nhất có ba chữ số mà chữ số hàng trăm là ${d} là số nào?`, 100 * d, `Hàng trăm là ${d}, hai hàng còn lại bé nhất là 0: <b>${100 * d}</b>.`]; },
    ] : lv === 2 ? [
      () => ['Hiệu của số lớn nhất có ba chữ số và số bé nhất có ba chữ số là bao nhiêu?', 899, '999 − 100 = <b>899</b>.'],
      () => ['Tổng của số lớn nhất có hai chữ số và số bé nhất có ba chữ số là bao nhiêu?', 199, '99 + 100 = <b>199</b>.'],
      () => { const d = R.int(1, 9); return [`Số bé nhất có ba chữ số mà chữ số hàng đơn vị là ${d} là số nào?`, 100 + d, `Hàng trăm bé nhất là 1, hàng chục là 0: <b>${100 + d}</b>.`]; },
      () => { const d = R.int(1, 9), l = range(100 * d, 100 * d + 99).filter(distinct3); return [`Số lớn nhất có ba chữ số khác nhau mà chữ số hàng trăm là ${d} là số nào?`, l[l.length - 1], `Hàng trăm là ${d}. Hàng chục lớn nhất (khác ${d}), rồi hàng đơn vị lớn nhất còn lại: <b>${l[l.length - 1]}</b>.`]; },
      () => { const d = R.int(1, 9), l = range(100 * d, 100 * d + 99).filter(distinct3); return [`Số bé nhất có ba chữ số khác nhau mà chữ số hàng trăm là ${d} là số nào?`, l[0], `Hàng trăm là ${d}. Hàng chục bé nhất (khác ${d}), rồi hàng đơn vị bé nhất còn lại: <b>${l[0]}</b>.`]; },
    ] : [
      () => { const k = R.int(6, 22), l = range(100, 999).filter(n => distinct3(n) && sum(digitsOf(n)) === k); return [`Số lớn nhất có ba chữ số khác nhau mà tổng các chữ số bằng ${k} là số nào?`, l[l.length - 1], `Muốn số lớn nhất, chọn hàng trăm lớn nhất có thể, rồi đến hàng chục. Thử từ hàng trăm 9 trở xuống được <b>${l[l.length - 1]}</b> (${digitsOf(l[l.length - 1]).join(' + ')} = ${k}).`]; },
      () => { const k = R.int(4, 20), l = range(100, 999).filter(n => distinct3(n) && sum(digitsOf(n)) === k); return [`Số bé nhất có ba chữ số khác nhau mà tổng các chữ số bằng ${k} là số nào?`, l[0], `Muốn số bé nhất, chọn hàng trăm bé nhất có thể, rồi đến hàng chục. Được <b>${l[0]}</b> (${digitsOf(l[0]).join(' + ')} = ${k}).`]; },
      () => { const k = R.int(2, 25), l = range(100, 999).filter(n => sum(digitsOf(n)) === k); return [`Số bé nhất có ba chữ số mà tổng các chữ số bằng ${k} là số nào?`, l[0], `Hàng trăm bé nhất có thể, rồi hàng chục bé nhất có thể, hàng đơn vị nhận phần còn lại (không quá 9): <b>${l[0]}</b>.`]; },
      () => { const c = R.pick([[n => Tn(n) === 2 * U(n), 'chữ số hàng chục gấp đôi chữ số hàng đơn vị'], [n => H(n) === Tn(n) + U(n), 'chữ số hàng trăm bằng tổng hai chữ số còn lại'], [n => H(n) - U(n) === 3, 'chữ số hàng trăm hơn chữ số hàng đơn vị 3 đơn vị'], [n => Tn(n) === H(n) + U(n), 'chữ số hàng chục bằng tổng hai chữ số còn lại']]); const l = range(100, 999).filter(n => distinct3(n) && c[0](n)), mx = R.chance(0.5), ans = mx ? l[l.length - 1] : l[0]; return [`Tìm số ${mx ? 'lớn nhất' : 'bé nhất'} có ba chữ số khác nhau mà ${c[1]}.`, ans, `Thử hàng trăm ${mx ? 'từ 9 trở xuống' : 'từ 1 trở lên'}, rồi hàng chục, hàng đơn vị thỏa điều kiện và các chữ số khác nhau. Số ${mx ? 'lớn nhất' : 'bé nhất'} tìm được là <b>${ans}</b>.`]; },
    ];
    const [text, answer, solution] = R.pick(Q)();
    return mk({ text, answer, solution });
  }

  // =====================================================================
  // HÌNH HỌC
  // =====================================================================
  const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || 'middle'}" font-size="${o.fs || 16}" font-weight="700" fill="${o.c || INK}">${s}</text>`;
  const dot = (x, y) => `<circle cx="${x}" cy="${y}" r="5" fill="#ef4444"/>`;

  function svgRuler(s, n) {
    const M = Math.max(s + n + 1, 6), u = 28, x0 = 18, w = M * u + 2 * x0;
    let b = `<rect x="${x0 - 10}" y="40" width="${M * u + 20}" height="44" rx="4" fill="#fef3c7" stroke="${INK}" stroke-width="2"/>`;
    for (let i = 0; i <= M; i++) { const x = x0 + i * u; b += line(x, 40, x, 54, 2) + txt(x, 74, i, { fs: 13 }); }
    const xa = x0 + s * u, xb = x0 + (s + n) * u;
    b += `<line x1="${xa}" y1="22" x2="${xb}" y2="22" stroke="#ef4444" stroke-width="6" stroke-linecap="round"/>`;
    b += `<line x1="${xa}" y1="22" x2="${xa}" y2="40" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3 3"/><line x1="${xb}" y1="22" x2="${xb}" y2="40" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3 3"/>`;
    b += txt(x0 + M * u - 4, 34, 'cm', { fs: 12, a: 'end' });
    return svg(w, 90, b);
  }
  function svgPoly(labs, letters = 'ABCDEF') {
    const n = labs.length + 1, gap = 90, w = gap * (n - 1) + 60;
    const pts = range(0, n - 1).map(i => [30 + gap * i, i % 2 ? 34 : 112]);
    let b = '';
    for (let i = 0; i < n - 1; i++) {
      b += line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
      const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
      if (labs[i]) b += txt(mx + 12, my + 6, labs[i], { a: 'start', c: '#2563eb', fs: 15 });
    }
    pts.forEach(([x, y], i) => { b += dot(x, y) + txt(x, y < 70 ? y - 12 : y + 24, letters[i], { fs: 18 }); });
    return svg(w, 142, b);
  }
  function svgTri(labs) {
    const [A, B, C] = [[34, 128], [146, 22], [262, 128]];
    let b = `<polygon points="${A} ${B} ${C}" fill="#fef9c3" stroke="${INK}" stroke-width="3"/>`;
    b += dot(...A) + dot(...B) + dot(...C);
    b += txt(22, 146, 'A', { fs: 18 }) + txt(146, 14, 'B', { fs: 18 }) + txt(274, 146, 'C', { fs: 18 });
    b += txt(80, 70, labs[0], { a: 'end', c: '#2563eb', fs: 15 }) + txt(212, 70, labs[1], { a: 'start', c: '#2563eb', fs: 15 }) + txt(148, 150, labs[2], { c: '#2563eb', fs: 15 });
    return svg(300, 158, b, 280);
  }
  const SN = { tri: 'Hình tam giác', quad: 'Hình tứ giác', rect: 'Hình chữ nhật', sq: 'Hình vuông', cir: 'Hình tròn' };
  function shapeCell(t, x, y) {
    if (t === 'tri') return `<polygon points="${x},${y - 20} ${x - 21},${y + 17} ${x + 21},${y + 17}" fill="#fde68a" stroke="${INK}" stroke-width="2.5"/>`;
    if (t === 'quad') return `<polygon points="${x - 23},${y + 17} ${x - 11},${y - 15} ${x + 13},${y - 19} ${x + 23},${y + 13}" fill="#ddd6fe" stroke="${INK}" stroke-width="2.5"/>`;
    if (t === 'rect') return `<rect x="${x - 24}" y="${y - 14}" width="48" height="28" fill="#bbf7d0" stroke="${INK}" stroke-width="2.5"/>`;
    if (t === 'sq') return `<rect x="${x - 18}" y="${y - 18}" width="36" height="36" fill="#bfdbfe" stroke="${INK}" stroke-width="2.5"/>`;
    return `<circle cx="${x}" cy="${y}" r="19" fill="#fbcfe8" stroke="${INK}" stroke-width="2.5"/>`;
  }
  function svgMix(list) {
    const per = 6, c = 60, w = Math.min(list.length, per) * c + 8, h = Math.ceil(list.length / per) * c + 8;
    return svg(w, h, list.map((t, i) => shapeCell(t, 4 + (i % per) * c + c / 2, 4 + Math.floor(i / per) * c + c / 2)).join(''));
  }
  const svgBigShape = t => (t === 'quad' ? svg(160, 130, `<polygon points="22,30 120,12 146,112 40,104" fill="#ddd6fe" stroke="${INK}" stroke-width="4"/>`, 150) : svgOneShape(t));

  function geoShape(R, lv) {
    if (lv === 0) {
      if (R.chance(0.6)) {
        const t = R.pick(Object.keys(SN)), ans = SN[t];
        const pool = Object.keys(SN).filter(k => k !== t && !(t === 'rect' && k === 'quad') && !(t === 'sq' && (k === 'quad' || k === 'rect')));
        const hint = { tri: 'có 3 cạnh, 3 đỉnh', quad: 'có 4 cạnh, 4 đỉnh (các cạnh dài ngắn khác nhau)', rect: 'có 4 góc vuông, 2 cạnh dài bằng nhau và 2 cạnh ngắn bằng nhau', sq: 'có 4 góc vuông và 4 cạnh dài bằng nhau', cir: 'tròn đều, không có cạnh' }[t];
        return mk({ type: 'choice', choices: choicesOf(R, ans, pool.map(k => SN[k])), text: 'Đây là hình gì?', visual: svgBigShape(t), answer: ans, solution: `Hình này ${hint}, đó là <b>${ans.toLowerCase()}</b>.` });
      }
      const t = R.pick(['tri', 'quad', 'rect', 'sq']), w = R.pick(['cạnh', 'đỉnh']), n = t === 'tri' ? 3 : 4;
      return mk({ text: `${SN[t]} có mấy ${w}?`, visual: svgBigShape(t), answer: n, solution: `Đếm các ${w} của hình: có <b>${n}</b> ${w}.` });
    }
    let list;
    do { list = range(1, R.int(8, 12)).map(() => R.pick(['tri', 'quad', 'rect', 'sq', 'cir'])); } while (!list.includes('tri') || !list.some(t => t === 'quad' || t === 'rect' || t === 'sq'));
    const cnt = ts => list.filter(t => ts.includes(t)).length;
    const kind = R.pick(['four', 'four', 'tri', 'corners']);
    if (kind === 'four') return mk({ text: 'Trong hình bên có bao nhiêu hình tứ giác? (Hình vuông và hình chữ nhật cũng là hình tứ giác.)', visual: svgMix(list), answer: cnt(['quad', 'rect', 'sq']), solution: `Hình tứ giác là hình có 4 cạnh: có ${cnt(['quad'])} tứ giác thường, ${cnt(['rect'])} hình chữ nhật, ${cnt(['sq'])} hình vuông. Tổng: <b>${cnt(['quad', 'rect', 'sq'])}</b> hình.` });
    if (kind === 'tri') return mk({ text: 'Trong hình bên có bao nhiêu hình tam giác?', visual: svgMix(list), answer: cnt(['tri']), solution: `Hình tam giác có 3 cạnh. Đếm được <b>${cnt(['tri'])}</b> hình.` });
    const ans = 3 * cnt(['tri']) + 4 * cnt(['quad', 'rect', 'sq']);
    return mk({ text: 'Đếm tổng số đỉnh của tất cả các hình trong hình bên. (Hình tròn không có đỉnh.)', visual: svgMix(list), answer: ans, solution: `${cnt(['tri'])} tam giác, mỗi hình 3 đỉnh: ${3 * cnt(['tri'])}. ${cnt(['quad', 'rect', 'sq'])} hình tứ giác, mỗi hình 4 đỉnh: ${4 * cnt(['quad', 'rect', 'sq'])}. Tổng: <b>${ans}</b> đỉnh.` });
  }

  const SOLIDS = {
    cầu: [['⚽', 'quả bóng đá'], ['🏀', 'quả bóng rổ'], ['🌍', 'quả địa cầu'], ['🍊', 'quả cam'], ['🎾', 'quả bóng tennis']],
    trụ: [['🥫', 'lon sữa'], ['🕯️', 'cây nến'], ['🧻', 'cuộn giấy'], ['🥁', 'cái trống'], ['🔋', 'viên pin']],
    hộp: [['📦', 'thùng giấy'], ['📕', 'quyển sách'], ['🧱', 'viên gạch']],
  };
  const SOLID_NAME = { cầu: 'Khối cầu', trụ: 'Khối trụ', hộp: 'Khối hộp chữ nhật' };
  const SOLID_HINT = { cầu: 'tròn đều về mọi phía, lăn được theo mọi hướng', trụ: 'có hai mặt đáy là hình tròn và thân tròn, dài', hộp: 'có 6 mặt đều là hình chữ nhật' };
  function geoSolids(R, lv) {
    if (lv === 0) {
      const k = R.pick(['cầu', 'cầu', 'trụ', 'trụ', 'hộp']), [e, name] = R.pick(SOLIDS[k]), ans = SOLID_NAME[k];
      const ch = Object.values(SOLID_NAME).concat(k === 'hộp' ? [] : ['Khối lập phương']);
      return mk({ type: 'choice', choices: R.shuffle(ch), text: `<div class="seq emoji">${e}</div>${cap(name)} có dạng khối gì?`, answer: ans, solution: `${cap(name)} ${SOLID_HINT[k]}, có dạng <b>${ans.toLowerCase()}</b>.` });
    }
    const all = Object.entries(SOLIDS).flatMap(([k, arr]) => arr.map(x => [k, ...x]));
    let row, k;
    do { row = R.sample(all, R.int(6, 8)); k = R.pick(['cầu', 'trụ']); } while (!row.some(x => x[0] === k));
    const hits = row.filter(x => x[0] === k);
    return mk({
      text: `Trong các đồ vật sau, có bao nhiêu đồ vật có dạng ${SOLID_NAME[k].toLowerCase()}?<div class="seq emoji">${row.map(x => x[1]).join(' ')}</div>(${row.map(x => `${x[1]} ${x[2]}`).join(', ')})`,
      answer: hits.length, solution: `${SOLID_NAME[k]} ${SOLID_HINT[k]}. Đó là: ${hits.map(x => x[2]).join(', ')}. Có <b>${hits.length}</b> đồ vật.`,
    });
  }

  const wrapH = h => ((h - 1) % 12 + 12) % 12 + 1;
  const tlab = (h, m) => (m ? `${wrapH(h)} giờ ${m} phút` : `${wrapH(h)} giờ`);
  function geoClock(R, lv) {
    const h = R.int(1, 12);
    if (lv <= 1) {
      if (lv === 1 && R.chance(0.3)) { const k = R.pick([3, 6, 9]); return mk({ text: `Kim phút (kim dài) chỉ vào số ${k}. Hỏi đó là bao nhiêu phút?`, answer: 5 * k, solution: `Mỗi số trên mặt đồng hồ cách nhau 5 phút. Kim phút chỉ số ${k}: ${rep(5, k)} = <b>${5 * k}</b> phút.` }); }
      const m = lv === 0 ? R.pick([0, 0, 30]) : R.pick([0, 15, 30]);
      const ans = tlab(h, m), others = [0, 15, 30].filter(x => x !== m);
      const pool = [tlab(h + 1, m), tlab(h - 1, m), ...others.map(x => tlab(h, x)), tlab(h + 1, others[0])];
      const why = m === 0 ? `Kim dài chỉ số 12, kim ngắn chỉ số ${h}` : m === 30 ? `Kim dài chỉ số 6 là 30 phút, kim ngắn nằm giữa số ${h} và số ${wrapH(h + 1)}` : `Kim dài chỉ số 3 là 15 phút, kim ngắn vừa qua số ${h} một chút`;
      return mk({ type: 'choice', choices: choicesOf(R, ans, pool), text: 'Đồng hồ chỉ mấy giờ?', visual: svgClock(h, m), answer: ans, solution: `${why}: <b>${ans}</b>.` });
    }
    if (lv === 2) {
      return pick(R, [
        () => {
          const m = R.pick([0, 15, 30]), [d, dl] = R.pick([[15, '15 phút'], [30, '30 phút'], [60, '1 giờ'], [120, '2 giờ'], [90, '1 giờ 30 phút']]);
          const tot = h * 60 + m + d, h2 = Math.floor(tot / 60), m2 = tot % 60, ans = tlab(h2, m2);
          const pool = [tlab(h2 + 1, m2), tlab(h2 - 1, m2), tlab(h2, (m2 + 15) % 60), tlab(h2, (m2 + 30) % 60), tlab(h, m)];
          return mk({ type: 'choice', choices: choicesOf(R, ans, pool), text: `Đồng hồ đang chỉ giờ như hình bên. Hỏi ${dl} nữa là mấy giờ?`, visual: svgClock(h, m), answer: ans, solution: `Đồng hồ đang chỉ ${tlab(h, m)}. Thêm ${dl} được <b>${ans}</b>.` });
        },
        () => { const H2 = R.int(13, 23); return mk({ text: `${H2} giờ còn gọi là mấy giờ chiều (hoặc tối)?`, answer: H2 - 12, solution: `Bớt đi 12: ${H2} − 12 = ${H2 - 12}. ${H2} giờ là <b>${H2 - 12}</b> giờ ${H2 < 18 ? 'chiều' : 'tối'}.` }); },
        () => { const k = R.int(1, 9); return mk({ text: `${k} giờ ${k < 6 ? 'chiều' : 'tối'} còn gọi là bao nhiêu giờ?`, answer: k + 12, solution: `Giờ buổi chiều, buổi tối thì cộng thêm 12: ${k} + 12 = <b>${k + 12}</b> giờ.` }); },
        () => { const k = R.int(1, 11); return mk({ text: `Kim phút chỉ vào số ${k}. Hỏi kim phút đã đi được bao nhiêu phút kể từ lúc chỉ số 12?`, answer: 5 * k, solution: `Mỗi số cách nhau 5 phút: 5 × ${k} = <b>${5 * k}</b> phút.` }); },
      ]);
    }
    return pick(R, [
      () => {
        const h1 = R.int(6, 10), m1 = R.pick([0, 15, 30]), dur = R.pick([45, 60, 75, 90, 105, 120, 150]);
        const t2 = h1 * 60 + m1 + dur, h2 = Math.floor(t2 / 60), m2 = t2 % 60;
        let sol;
        if (m1 === 0 && h2 === h1) sol = `Từ ${tlab(h1, 0)} đến ${tlab(h2, m2)} là ${m2} phút.`;
        else if (m1 === 0) sol = `Từ ${tlab(h1, 0)} đến ${tlab(h2, 0)} là ${h2 - h1} giờ = ${60 * (h2 - h1)} phút${m2 ? `, thêm ${m2} phút` : ''}.`;
        else { const a = 60 - m1, full = h2 - h1 - 1; sol = `Từ ${tlab(h1, m1)} đến ${tlab(h1 + 1, 0)} là ${a} phút.${full ? ` Từ ${tlab(h1 + 1, 0)} đến ${tlab(h2, 0)} là ${60 * full} phút.` : ''}${m2 ? ` Thêm ${m2} phút nữa.` : ''}`; }
        return mk({ text: `Một bộ phim hoạt hình bắt đầu lúc ${tlab(h1, m1)} sáng và kết thúc lúc ${tlab(h2, m2)}. Hỏi bộ phim dài bao nhiêu phút?`, answer: dur, solution: `${sol} Tổng cộng: <b>${dur}</b> phút. (1 giờ = 60 phút)` });
      },
      () => { const hh = R.int(1, 2), m = R.pick([0, 15, 30, 45]); return mk({ text: `Điền số thích hợp: ${hh} giờ${m ? ` ${m} phút` : ''} = ${box} phút.`, answer: 60 * hh + m, solution: `1 giờ = 60 phút. ${hh} giờ = ${rep(60, hh)} = ${60 * hh} phút${m ? `; thêm ${m} phút: ${60 * hh} + ${m}` : ''} = <b>${60 * hh + m}</b> phút.` }); },
      () => { const h1 = R.int(1, 6), k = R.int(2, 5); return mk({ text: `Từ ${h1} giờ đến ${h1 + k} giờ, kim phút (kim dài) quay được mấy vòng?`, answer: k, solution: `Mỗi giờ kim phút quay đúng 1 vòng. Từ ${h1} giờ đến ${h1 + k} giờ là ${k} giờ nên quay <b>${k}</b> vòng.` }); },
      () => { const h1 = R.int(7, 9), m1 = R.pick([0, 15, 30]), d1 = R.pick([30, 45]), br = R.pick([15, 30]); const t2 = h1 * 60 + m1 + d1 + br + d1, ans = tlab(Math.floor(t2 / 60), t2 % 60); const pool = [tlab(Math.floor(t2 / 60), (t2 + 15) % 60), tlab(Math.floor(t2 / 60) + 1, t2 % 60), tlab(Math.floor((t2 - br) / 60), (t2 - br) % 60), tlab(Math.floor(t2 / 60) - 1, t2 % 60)]; return mk({ type: 'choice', choices: choicesOf(R, ans, pool), text: `Buổi học bắt đầu lúc ${tlab(h1, m1)}. Có 2 tiết học, mỗi tiết ${d1} phút, giữa hai tiết được nghỉ ${br} phút. Hỏi buổi học kết thúc lúc mấy giờ?`, answer: ans, solution: `Tổng thời gian: ${d1} + ${br} + ${d1} = ${2 * d1 + br} phút. Từ ${tlab(h1, m1)} thêm ${2 * d1 + br} phút được <b>${ans}</b>.` }); },
    ]);
  }

  function geoLength(R, lv) {
    if (lv === 0) {
      return pick(R, [
        () => { const n = R.int(2, 10); return mk({ text: 'Đoạn thẳng màu đỏ dài bao nhiêu xăng-ti-mét?', visual: svgRuler(0, n), answer: n, solution: `Đầu đoạn thẳng ở vạch 0, cuối đoạn thẳng ở vạch ${n}. Đoạn thẳng dài <b>${n}</b> cm.` }); },
        () => { const a = R.int(3, 12), b = R.int(2, 20 - a); return mk({ text: `Tính:<div class="seq">${a} cm + ${b} cm = ? cm</div>`, answer: a + b, solution: `${a} + ${b} = ${a + b}, nên ${a} cm + ${b} cm = <b>${a + b}</b> cm.` }); },
        () => { const a = R.int(10, 19), b = R.int(2, a - 2); return mk({ text: `Bút chì dài ${a} cm, cục tẩy dài ${b} cm. Hỏi bút chì dài hơn cục tẩy bao nhiêu xăng-ti-mét?`, answer: a - b, solution: `${a} − ${b} = <b>${a - b}</b> cm.` }); },
      ]);
    }
    if (lv === 1) {
      return pick(R, [
        () => { const s = R.int(1, 5), n = R.int(2, 8); return mk({ text: 'Đoạn thẳng màu đỏ dài bao nhiêu xăng-ti-mét?', visual: svgRuler(s, n), answer: n, solution: `Đầu đoạn thẳng ở vạch ${s}, cuối ở vạch ${s + n}. Độ dài: ${s + n} − ${s} = <b>${n}</b> cm. (Chú ý: đoạn thẳng không bắt đầu từ vạch 0.)` }); },
        () => { const k = R.int(2, 9); return mk({ text: `Điền số thích hợp: ${k} dm = ${box} cm.`, answer: 10 * k, solution: `1 dm = 10 cm nên ${k} dm = <b>${10 * k}</b> cm.` }); },
        () => { const k = R.int(2, 9); return mk({ text: `Điền số thích hợp: ${10 * k} cm = ${box} dm.`, answer: k, solution: `10 cm = 1 dm nên ${10 * k} cm = <b>${k}</b> dm.` }); },
        () => { const k = R.int(1, 9), toCm = R.chance(0.5); return mk({ text: `Điền số thích hợp: ${k} m = ${box} ${toCm ? 'cm' : 'dm'}.`, answer: toCm ? 100 * k : 10 * k, solution: `1 m = 10 dm = 100 cm. Vậy ${k} m = <b>${toCm ? 100 * k : 10 * k}</b> ${toCm ? 'cm' : 'dm'}.` }); },
      ]);
    }
    if (lv === 2) {
      return pick(R, [
        () => { const a = R.int(1, 9), b = R.int(1, 9); return mk({ text: `Điền số thích hợp: ${a} m ${b} dm = ${box} dm.`, answer: 10 * a + b, solution: `${a} m = ${10 * a} dm. ${10 * a} + ${b} = <b>${10 * a + b}</b> dm.` }); },
        () => { const a = R.int(1, 9), b = R.int(1, 9); return mk({ text: `Điền số thích hợp: ${a} dm ${b} cm = ${box} cm.`, answer: 10 * a + b, solution: `${a} dm = ${10 * a} cm. ${10 * a} + ${b} = <b>${10 * a + b}</b> cm.` }); },
        () => { const x = R.int(5, 60), y = R.int(1, 4); return mk({ text: `Tính:<div class="seq">${x} cm + ${y} dm = ? cm</div>`, answer: x + 10 * y, solution: `Đổi ${y} dm = ${10 * y} cm. ${x} + ${10 * y} = <b>${x + 10 * y}</b> cm.` }); },
        () => { const x = R.int(15, 85); return mk({ text: `Tính:<div class="seq">1 m − ${x} cm = ? cm</div>`, answer: 100 - x, solution: `Đổi 1 m = 100 cm. 100 − ${x} = <b>${100 - x}</b> cm.` }); },
        () => {
          let vals;
          do { vals = [R.int(11, 99), 10 * R.int(2, 9), 10 * R.int(1, 8) + R.int(1, 9)]; } while (new Set(vals).size < 3);
          const labs = [`${vals[0]} cm`, `${vals[1] / 10} dm`, `${Math.floor(vals[2] / 10)} dm ${vals[2] % 10} cm`];
          const big = R.chance(0.5), idx = vals.indexOf(big ? Math.max(...vals) : Math.min(...vals));
          return mk({ type: 'choice', choices: R.shuffle(labs), text: `Độ dài nào ${big ? 'dài nhất' : 'ngắn nhất'}?`, answer: labs[idx], solution: `Đổi hết ra xăng-ti-mét: ${labs.map((l, i) => `${l} = ${vals[i]} cm`).join('; ')}. ${big ? 'Dài nhất' : 'Ngắn nhất'} là <b>${labs[idx]}</b>.` });
        },
      ]);
    }
    return pick(R, [
      () => (R.chance(0.5) ? mk({ text: `Điền số thích hợp: 1 km = ${box} m.`, answer: 1000, solution: 'Ki-lô-mét là đơn vị đo quãng đường dài: 1 km = <b>1000</b> m.' }) : mk({ text: `Điền số thích hợp: 1000 m = ${box} km.`, answer: 1, solution: '1000 m = <b>1</b> km.' })),
      () => { const x = 50 * R.int(2, 18); return mk({ text: `Quãng đường từ nhà ${R.pick(NAMES)} đến trường dài 1 km. Bạn ấy đã đi được ${x} m. Hỏi còn phải đi bao nhiêu mét nữa?`, answer: 1000 - x, solution: `Đổi 1 km = 1000 m. Còn phải đi: 1000 − ${x} = <b>${1000 - x}</b> m.` }); },
      () => { const n = R.int(2, 3), a = R.int(1, n === 2 ? 4 : 3); return mk({ text: `Một sợi dây dài 1 m. Cắt đi ${n} đoạn, mỗi đoạn dài ${a} dm. Hỏi sợi dây còn lại bao nhiêu đề-xi-mét?`, answer: 10 - n * a, solution: `Đổi 1 m = 10 dm. Đã cắt: ${rep(a, n)} = ${n * a} dm. Còn lại: 10 − ${n * a} = <b>${10 - n * a}</b> dm.` }); },
      () => { const a = R.int(10, 40), b = R.int(1, 2); const [A, B] = R.sample(NAMES, 2); return mk({ text: `${A} cao 1 m ${a} cm. ${B} thấp hơn ${A} ${b} dm. Hỏi ${B} cao bao nhiêu xăng-ti-mét?`, answer: 100 + a - 10 * b, solution: `${A} cao 1 m ${a} cm = ${100 + a} cm. ${b} dm = ${10 * b} cm. ${B} cao: ${100 + a} − ${10 * b} = <b>${100 + a - 10 * b}</b> cm.` }); },
      () => { const a = R.int(5, 25), b = R.int(1, 3), c = R.int(1, 3), d = R.int(1, 9); return mk({ text: `Tính tổng độ dài ba đoạn thẳng: ${a} cm, ${b} dm và ${c} dm ${d} cm. (Viết kết quả theo xăng-ti-mét)`, answer: a + 10 * b + 10 * c + d, solution: `Đổi: ${b} dm = ${10 * b} cm; ${c} dm ${d} cm = ${10 * c + d} cm. Tổng: ${a} + ${10 * b} + ${10 * c + d} = <b>${a + 10 * b + 10 * c + d}</b> cm.` }); },
    ]);
  }

  function geoMeasure(R, lv) {
    if (lv === 1) {
      return pick(R, [
        () => { const a = R.int(15, 60), b = R.int(10, 39); return mk({ text: `Bao gạo nặng ${a} kg, bao đường nặng ${b} kg. Hỏi cả hai bao nặng bao nhiêu ki-lô-gam?`, answer: a + b, solution: `${a} + ${b} = <b>${a + b}</b> kg.` }); },
        () => { const a = R.int(20, 60), b = R.int(5, a - 5); return mk({ text: `Can to đựng ${a} lít nước, can bé đựng ít hơn can to ${b} lít. Hỏi can bé đựng bao nhiêu lít nước?`, answer: a - b, solution: `Ít hơn thì làm phép trừ: ${a} − ${b} = <b>${a - b}</b> lít.` }); },
        () => { const a = R.int(25, 50), b = R.int(5, 20); return mk({ text: `${R.pick(NAMES)} cân nặng ${a} kg. Bố nặng hơn bạn ấy ${b + 20} kg. Hỏi bố cân nặng bao nhiêu ki-lô-gam?`, answer: a + b + 20, solution: `Nặng hơn thì làm phép cộng: ${a} + ${b + 20} = <b>${a + b + 20}</b> kg.` }); },
      ]);
    }
    if (lv === 2) {
      return pick(R, [
        () => { const w = R.pick([2, 5]), n = R.int(3, 10); return mk({ text: `Mỗi túi gạo nặng ${w} kg. Hỏi ${n} túi gạo như thế nặng bao nhiêu ki-lô-gam?`, answer: w * n, solution: `${w} × ${n} = <b>${w * n}</b> kg.` }); },
        () => { const b = R.pick([2, 5]), q = R.int(3, 10); return mk({ text: `Có ${b * q} lít nước mắm, rót đều vào các can, mỗi can ${b} lít. Hỏi rót được mấy can?`, answer: q, solution: `${b * q} : ${b} = <b>${q}</b> can.` }); },
        () => { const a = R.int(4, 9), b = R.int(1, a - 2); return mk({ text: `Con ngỗng nặng ${a} kg, con gà nhẹ hơn con ngỗng ${b} kg. Hỏi cả hai con nặng bao nhiêu ki-lô-gam?`, answer: 2 * a - b, solution: `Con gà nặng: ${a} − ${b} = ${a - b} kg. Cả hai: ${a} + ${a - b} = <b>${2 * a - b}</b> kg.` }); },
      ]);
    }
    return pick(R, [
      () => { const n1 = R.int(2, 4), n2 = R.int(2, 5); return mk({ text: `Cửa hàng có ${n1} can dầu loại 5 lít và ${n2} can dầu loại 2 lít. Hỏi cửa hàng có tất cả bao nhiêu lít dầu?`, answer: 5 * n1 + 2 * n2, solution: `Loại 5 lít: 5 × ${n1} = ${5 * n1} lít. Loại 2 lít: 2 × ${n2} = ${2 * n2} lít. Tất cả: ${5 * n1} + ${2 * n2} = <b>${5 * n1 + 2 * n2}</b> lít.` }); },
      () => { const d = 2 * R.int(2, 9), b = R.int(10, 40); return mk({ text: `Thùng thứ nhất có ${b + d} lít nước, thùng thứ hai có ${b} lít nước. Phải đổ bao nhiêu lít nước từ thùng thứ nhất sang thùng thứ hai để hai thùng có số nước bằng nhau?`, answer: d / 2, solution: `Thùng thứ nhất hơn thùng thứ hai ${b + d} − ${b} = ${d} lít. Đổ sang một nửa số hơn: ${d} : 2 = <b>${d / 2}</b> lít (khi đó mỗi thùng có ${b + d / 2} lít).` }); },
      () => { const m = R.int(1, 5), d = 2 * m + R.int(1, 10), b = R.int(10, 30); return mk({ text: `Bao gạo nặng ${b + d} kg, bao đường nặng ${b} kg. Người ta lấy ${m} kg gạo ở bao gạo đổ sang một túi, rồi đặt túi đó lên bao đường. Hỏi bao gạo còn nặng hơn bao đường (cả túi) bao nhiêu ki-lô-gam?`, answer: d - 2 * m, solution: `Bao gạo còn ${b + d} − ${m} = ${b + d - m} kg. Bao đường cùng túi: ${b} + ${m} = ${b + m} kg. Hơn nhau: ${b + d - m} − ${b + m} = <b>${d - 2 * m}</b> kg.` }); },
    ]);
  }

  function geoPolyline(R, lv) {
    const L = 'ABCDEF';
    if (lv === 0) {
      if (R.chance(0.5)) { const n = R.int(2, 5); return mk({ text: `Đường gấp khúc ${L.slice(0, n + 1)} gồm mấy đoạn thẳng?`, visual: svgPoly(Array(n).fill('')), answer: n, solution: `Các đoạn thẳng: ${range(0, n - 1).map(i => L[i] + L[i + 1]).join(', ')}. Có <b>${n}</b> đoạn thẳng.` }); }
      const a = R.int(2, 9), b = R.int(2, 9);
      return mk({ text: 'Tính độ dài đường gấp khúc ABC.', visual: svgPoly([`${a} cm`, `${b} cm`]), answer: a + b, solution: `Độ dài đường gấp khúc là tổng độ dài các đoạn thẳng: ${a} + ${b} = <b>${a + b}</b> cm.` });
    }
    if (lv === 1) {
      const n = R.int(3, 4), segs = range(1, n).map(() => R.int(5, n === 3 ? 30 : 22)), s = sum(segs);
      return mk({ text: `Tính độ dài đường gấp khúc ${L.slice(0, n + 1)}.`, visual: svgPoly(segs.map(v => `${v} cm`)), answer: s, solution: `${segs.join(' + ')} = <b>${s}</b> cm.` });
    }
    if (lv === 2) {
      return pick(R, [
        () => { const n = R.int(3, 5), a = R.pick([2, 3, 4, 5, 10]); return mk({ text: `Đường gấp khúc ${L.slice(0, n + 1)} gồm ${n} đoạn thẳng, mỗi đoạn dài ${a} cm. Tính độ dài đường gấp khúc đó.`, visual: svgPoly(Array(n).fill(`${a} cm`)), answer: a * n, solution: `Có ${n} đoạn dài ${a} cm: ${a} × ${n} = ${rep(a, n)} = <b>${a * n}</b> cm.` }); },
        () => { const n = R.int(3, 4), segs = range(1, n).map(() => R.int(5, 25)), k = R.int(0, n - 1), s = sum(segs); const labs = segs.map((v, i) => (i === k ? '?' : `${v} cm`)); return mk({ text: `Đường gấp khúc ${L.slice(0, n + 1)} dài ${s} cm. Tính độ dài đoạn ${L[k]}${L[k + 1]}.`, visual: svgPoly(labs), answer: segs[k], solution: `Tổng các đoạn đã biết: ${segs.filter((_, i) => i !== k).join(' + ')} = ${s - segs[k]} cm. Đoạn ${L[k]}${L[k + 1]}: ${s} − ${s - segs[k]} = <b>${segs[k]}</b> cm.` }); },
      ]);
    }
    return pick(R, [
      () => { const a = R.int(5, 15), d = R.int(2, Math.min(6, a - 1)), more = R.chance(0.5), b = more ? a + d : a - d, c = R.int(5, 20), s = a + b + c; return mk({ text: `Đường gấp khúc ABCD dài ${s} cm. Đoạn AB dài ${a} cm, đoạn BC ${more ? 'dài hơn' : 'ngắn hơn'} đoạn AB ${d} cm. Tính độ dài đoạn CD.`, visual: svgPoly([`${a} cm`, '', '']), answer: c, solution: `BC dài ${a} ${more ? '+' : '−'} ${d} = ${b} cm. AB + BC = ${a} + ${b} = ${a + b} cm. CD = ${s} − ${a + b} = <b>${c}</b> cm.` }); },
      () => { const s3 = range(1, 3).map(() => R.int(8, 30)); return mk({ text: 'Tính độ dài đường gấp khúc khép kín ABCA (đi từ A qua B, qua C rồi trở về A).', visual: svgTri(s3.map(v => `${v} cm`)), answer: sum(s3), solution: `Đường gấp khúc khép kín gồm 3 đoạn AB, BC, CA: ${s3.join(' + ')} = <b>${sum(s3)}</b> cm.` }); },
      () => { const n = R.int(3, 4), a = R.int(3, 9); return mk({ text: `Một con kiến bò quanh ${n === 3 ? 'một hình tam giác có 3 cạnh' : 'một hình vuông có 4 cạnh'} đều dài ${a} cm, bắt đầu từ một đỉnh và bò đúng một vòng trở về chỗ cũ. Hỏi con kiến đã bò bao nhiêu xăng-ti-mét?`, answer: n * a, solution: `Con kiến bò qua ${n} cạnh, mỗi cạnh ${a} cm: ${a} × ${n} = <b>${n * a}</b> cm.` }); },
    ]);
  }

  function geoSegments(R, lv) {
    if (lv === 3 && R.chance(0.4)) {
      const n = R.int(4, 6);
      return mk({ text: `Cho ${n} điểm, không có 3 điểm nào cùng nằm trên một đường thẳng. Nối mỗi cặp hai điểm bằng một đoạn thẳng. Hỏi có tất cả bao nhiêu đoạn thẳng?`, answer: C2(n), solution: `Điểm thứ nhất nối với ${n - 1} điểm còn lại; điểm thứ hai nối thêm ${n - 2} điểm mới; ... Tổng: ${range(1, n - 1).reverse().join(' + ')} = <b>${C2(n)}</b> đoạn.` });
    }
    const n = lv === 1 ? R.int(3, 4) : lv === 2 ? R.int(4, 5) : R.int(5, 6), Ls = 'ABCDEFGH';
    if (lv < 3 && R.chance(0.3)) {
      const p = R.int(0, n - 1);
      return mk({ text: `Hình bên có bao nhiêu đoạn thẳng có một đầu là điểm ${Ls[p]}?`, visual: svgSegments(n), answer: n - 1, solution: `Điểm ${Ls[p]} nối được với mỗi điểm còn lại: ${range(0, n - 1).filter(i => i !== p).map(i => [Ls[p], Ls[i]].sort().join('')).join(', ')}. Có <b>${n - 1}</b> đoạn.` });
    }
    return mk({ text: 'Hình bên có bao nhiêu đoạn thẳng?', visual: svgSegments(n), answer: C2(n), solution: `Đoạn thẳng bắt đầu từ A: ${n - 1} đoạn; từ B: ${n - 2} đoạn; ... Tổng: ${range(1, n - 1).reverse().join(' + ')} = <b>${C2(n)}</b> đoạn thẳng.` });
  }

  function fanTriSol(n, layers) {
    if (layers === 1) {
      const s = n - 1;
      return `Có ${s} tam giác đơn. ` + range(2, s).map(k => `Ghép ${k} tam giác liền nhau: ${s - k + 1}. `).join('') + `Tổng: ${range(1, s).reverse().join(' + ')} = <b>${C2(n)}</b> tam giác.`;
    }
    return `Mỗi đường ngang (kể cả cạnh đáy) cùng với đỉnh trên tạo ra ${range(1, n - 1).reverse().join(' + ')} = ${C2(n)} tam giác. Có ${layers} đường như vậy: ${rep(C2(n), layers)} = <b>${layers * C2(n)}</b> tam giác.`;
  }
  function geoTriangles(R, lv) {
    const opts = lv === 1 ? [[3, 1], [4, 1], 'd1'] : lv === 2 ? [[4, 1], [5, 1], [3, 2], 'd2'] : [[4, 2], [5, 2], [6, 1], [3, 3]];
    const o = R.pick(opts);
    if (o === 'd1') return mk({ text: 'Hình vuông được kẻ một đường chéo. Hình bên có bao nhiêu hình tam giác?', visual: svgSquareDiag(false), answer: 2, solution: 'Đường chéo chia hình thành <b>2</b> tam giác.' });
    if (o === 'd2') return mk({ text: 'Hình vuông được kẻ hai đường chéo. Hình bên có bao nhiêu hình tam giác?', visual: svgSquareDiag(true), answer: 8, solution: 'Hai đường chéo chia hình vuông thành 4 tam giác nhỏ. Mỗi đường chéo chia hình vuông thành 2 tam giác lớn: 2 đường chéo được 4 tam giác lớn. Tổng: 4 + 4 = <b>8</b>.' });
    const [n, layers] = o;
    return mk({ text: 'Hình bên có bao nhiêu hình tam giác?', visual: svgFan(n, layers), answer: layers * C2(n), solution: fanTriSol(n, layers) });
  }

  function gridRectSol(r, c, squaresOnly) {
    const parts = [];
    for (let a = 1; a <= r; a++) for (let b = 1; b <= c; b++) {
      if (squaresOnly && a !== b) continue;
      parts.push([`${a}×${b}`, (r - a + 1) * (c - b + 1)]);
    }
    const tot = sum(parts.map(p => p[1]));
    return [tot, `Đếm theo kích thước (số hàng × số cột ô): ${parts.map(([k, v]) => `${k}: ${v}`).join('; ')}. Tổng: <b>${tot}</b>.`];
  }
  function geoQuads(R, lv) {
    const opts = lv === 1 ? ['s2', 's3', 'f3'] : lv === 2 ? ['s4', 's5', 'g22', 'f4'] : ['g23', 'q33', 'f5', 'f33', 'f43'];
    const o = R.pick(opts);
    if (o[0] === 's') {
      const n = +o[1];
      return mk({ text: 'Hình bên có bao nhiêu hình chữ nhật? (Hình vuông cũng là hình chữ nhật.)', visual: svgGrid(1, n), answer: C2(n + 1), solution: `${range(1, n).map(k => `Hình gồm ${k} ô: ${n - k + 1}`).join('; ')}. Tổng: ${range(1, n).reverse().join(' + ')} = <b>${C2(n + 1)}</b>.` });
    }
    if (o === 'g22' || o === 'g23') {
      const c = o === 'g22' ? 2 : 3, [tot, sol] = gridRectSol(2, c, false);
      return mk({ text: 'Hình bên có tất cả bao nhiêu hình chữ nhật? (Hình vuông cũng là hình chữ nhật.)', visual: svgGrid(2, c), answer: tot, solution: sol });
    }
    if (o === 'q33') {
      const [tot, sol] = gridRectSol(3, 3, true);
      return mk({ text: 'Hình bên có tất cả bao nhiêu hình vuông?', visual: svgGrid(3, 3), answer: tot, solution: sol });
    }
    const n = +o[1], layers = o.length === 3 ? 3 : 2, ans = C2(layers) * C2(n);
    const sol = layers === 2
      ? `Phần nằm giữa đường ngang và cạnh đáy được chia thành ${n - 1} tứ giác nhỏ. Ghép các tứ giác liền nhau: ${range(1, n - 1).reverse().join(' + ')} = <b>${ans}</b> tứ giác.`
      : `Có 3 dải: dải trên, dải dưới và dải ghép cả hai. Mỗi dải có ${range(1, n - 1).reverse().join(' + ')} = ${C2(n)} tứ giác. Tổng: ${C2(n)} × 3 = <b>${ans}</b> tứ giác.`;
    return mk({ text: 'Hình bên có bao nhiêu hình tứ giác?', visual: svgFan(n, layers), answer: ans, solution: sol });
  }

  const MONTHS = { 1: 31, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31 };
  const monIdx = i => (i + 6) % 7; // thứ Hai = 0, ..., Chủ nhật = 6
  function geoCalendar(R, lv) {
    if (lv === 1) {
      return pick(R, [
        () => { const k = R.int(2, 4); return mk({ text: `Một tuần lễ có 7 ngày. Hỏi ${k} tuần lễ có bao nhiêu ngày?`, answer: 7 * k, solution: `${rep(7, k)} = <b>${7 * k}</b> ngày.` }); },
        () => { const m = +R.pick(Object.keys(MONTHS)); return mk({ text: `Tháng ${m} có bao nhiêu ngày?`, answer: MONTHS[m], solution: `Các tháng có 31 ngày: 1, 3, 5, 7, 8, 10, 12. Các tháng có 30 ngày: 4, 6, 9, 11. Tháng ${m} có <b>${MONTHS[m]}</b> ngày.` }); },
        () => { const d = R.int(1, 22), m = +R.pick(Object.keys(MONTHS)); return mk({ text: `Hôm nay là ngày ${d} tháng ${m}. Hỏi đúng 1 tuần nữa là ngày bao nhiêu tháng ${m}?`, answer: d + 7, solution: `1 tuần có 7 ngày: ${d} + 7 = <b>${d + 7}</b>.` }); },
        () => { const d = R.int(1, 22), off = R.int(1, 6); return mk({ text: `Thứ Hai tuần này là ngày ${d}. Hỏi ${day(1 + off)} tuần này là ngày bao nhiêu?`, answer: d + off, solution: `Từ thứ Hai đến ${day(1 + off)} là ${off} ngày: ${d} + ${off} = <b>${d + off}</b>.` }); },
      ]);
    }
    if (lv === 2) {
      return pick(R, [
        () => { const a = R.int(1, 12), diff = R.int(3, 18), b = a + diff, w = R.int(0, 6), m = +R.pick(Object.keys(MONTHS)), q = Math.floor(diff / 7), r = diff % 7; return mk({ type: 'choice', choices: dayChoices(R, w + diff), text: `Ngày ${a} tháng ${m} là ${day(w)}. Hỏi ngày ${b} tháng ${m} là thứ mấy?`, answer: dayCap(w + diff), solution: `Từ ngày ${a} đến ngày ${b} là ${diff} ngày${q ? ` = ${rep(7, q)}${r ? ` + ${r}` : ''}` : ''}. ${q ? `Sau ${7 * q} ngày vẫn là ${day(w)}${r ? `, đếm tiếp ${r} ngày` : ''}` : `Đếm tiếp ${r} ngày từ ${day(w)}`}: <b>${dayCap(w + diff)}</b>.` }); },
        () => { const x = R.int(0, 6), y = R.int(0, 6), off = monIdx(y) - monIdx(x) + 7, d = R.int(Math.max(1, 1 - off), Math.min(23, 30 - off)); return mk({ text: `${cap(day(x))} tuần này là ngày ${d}. Hỏi ${day(y)} tuần sau là ngày bao nhiêu?`, answer: d + off, solution: `${cap(day(x))} tuần sau là ngày ${d} + 7 = ${d + 7}. ${off === 7 ? `Đáp số <b>${d + off}</b>.` : `Từ ${day(x)} đến ${day(y)} ${off > 7 ? `thêm ${off - 7} ngày: ${d + 7} + ${off - 7}` : `lùi ${7 - off} ngày: ${d + 7} − ${7 - off}`} = <b>${d + off}</b>.`}` }); },
        () => { const d = R.int(15, 30), w = R.int(0, 6), k = R.int(1, 2); return mk({ type: 'choice', choices: dayChoices(R, w), text: `Ngày ${d} là ${day(w)}. Hỏi ngày ${d - 7 * k} cùng tháng là thứ mấy?`, answer: dayCap(w), solution: `Ngày ${d - 7 * k} cách ngày ${d} đúng ${7 * k} ngày (${k} tuần) nên cùng thứ: <b>${dayCap(w)}</b>.` }); },
      ]);
    }
    const m = +R.pick(Object.keys(MONTHS)), Ln = MONTHS[m], s = R.int(0, 6);
    return pick(R, [
      () => { const w = R.int(0, 6), dates = range(1, Ln).filter(j => mod7(s + j - 1) === w); return mk({ text: `Tháng ${m} có ${Ln} ngày. Ngày 1 tháng ${m} là ${day(s)}. Hỏi tháng ${m} có bao nhiêu ngày ${day(w)}?`, answer: dates.length, solution: `Các ngày ${day(w)}: ${dates.join(', ')} (cách nhau 7 ngày). Có <b>${dates.length}</b> ngày.` }); },
      () => { const w = mod7(s + Ln - 1); return mk({ type: 'choice', choices: dayChoices(R, w), text: `Tháng ${m} có ${Ln} ngày. Ngày 1 tháng ${m} là ${day(s)}. Hỏi ngày cuối cùng của tháng là thứ mấy?`, answer: dayCap(w), solution: `Ngày 1, 8, 15, 22, 29 đều là ${day(s)}. Ngày ${Ln} là ${Ln - 29} ngày sau ngày 29: <b>${dayCap(w)}</b>.` }); },
      () => { const w = R.int(0, 6), dates = range(1, Ln).filter(j => mod7(s + j - 1) === w); return mk({ text: `Ngày 1 tháng ${m} là ${day(s)}. Tháng ${m} có ${Ln} ngày. Hỏi ${day(w)} cuối cùng của tháng ${m} là ngày bao nhiêu?`, answer: dates[dates.length - 1], solution: `Ngày ${day(w)} đầu tiên là ngày ${dates[0]}; cộng thêm 7 mỗi lần: ${dates.join(', ')}. ${cap(day(w))} cuối cùng là ngày <b>${dates[dates.length - 1]}</b>.` }); },
      () => { const mm = R.pick([5, 7, 10, 12]), pm = mm - 1; return mk({ type: 'choice', choices: dayChoices(R, s - 1), text: `Ngày 1 tháng ${mm} là ${day(s)}. Hỏi ngày ${MONTHS[pm]} tháng ${pm} là thứ mấy?`, answer: dayCap(s - 1), solution: `Tháng ${pm} có ${MONTHS[pm]} ngày, nên ngày ${MONTHS[pm]} tháng ${pm} là ngay trước ngày 1 tháng ${mm}: <b>${dayCap(s - 1)}</b>.` }); },
    ]);
  }

  // =====================================================================
  // TỔ HỢP
  // =====================================================================
  function combPick0(R) {
    return pick(R, [
      () => { const a = R.int(2, 5), b = R.int(2, 5); return mk({ text: `Trên bàn có ${a} chiếc kẹo khác nhau và ${b} chiếc bánh khác nhau:<div class="seq emoji">${'🍬'.repeat(a)} &nbsp; ${'🍰'.repeat(b)}</div>Con được lấy 1 món (kẹo hoặc bánh). Có mấy cách lấy?`, answer: a + b, solution: `Lấy kẹo: ${a} cách. Lấy bánh: ${b} cách. Tất cả: ${a} + ${b} = <b>${a + b}</b> cách.` }); },
      () => { const items = R.sample(FRUITS, R.int(3, 7)); return mk({ text: `Mẹ có các loại quả:<div class="seq emoji">${items.join(' ')}</div>Con được chọn 1 quả. Có mấy cách chọn?`, answer: items.length, solution: `Mỗi quả là một cách chọn: có <b>${items.length}</b> cách.` }); },
      () => { const a = R.int(2, 4), b = R.int(2, 4), c = R.int(1, 3); return mk({ text: `Trong hộp có ${a} cái bút chì 🖍️, ${b} cái bút mực 🖊️ và ${c} cái bút màu 🖌️, các bút đều khác nhau. ${R.pick(NAMES)} lấy 1 cái bút. Có mấy cách lấy?`, answer: a + b + c, solution: `${a} + ${b} + ${c} = <b>${a + b + c}</b> cách.` }); },
    ]);
  }

  function combOutfit(R, lv) {
    const N = R.pick(NAMES);
    if (lv === 0) {
      const [a, b] = R.pick([[1, 2], [1, 3], [2, 2], [2, 3], [1, 4]]);
      const shirts = ['áo đỏ', 'áo xanh'].slice(0, a), pants = ['quần đen', 'quần trắng', 'quần nâu', 'quần xám'].slice(0, b), list = [];
      shirts.forEach(s => pants.forEach(p => list.push(`${s} – ${p}`)));
      return mk({ text: `${N} có ${a} cái áo 👕 (${shirts.join(', ')}) và ${b} cái quần 👖 (${pants.join(', ')}). Có mấy cách chọn 1 bộ gồm 1 áo và 1 quần?`, answer: a * b, solution: `Các bộ: ${list.join('; ')}. Có <b>${a * b}</b> cách.` });
    }
    if (lv === 1) {
      return pick(R, [
        () => { const a = R.int(2, 4), b = R.int(2, 5); return mk({ text: `${N} có ${a} cái áo và ${b} cái quần. Hỏi có bao nhiêu cách chọn một bộ gồm 1 áo và 1 quần?`, answer: a * b, solution: `Mỗi áo đi được với ${b} quần: ${rep(b, a)} = <b>${a * b}</b> cách.` }); },
        () => { const a = R.int(2, 5), b = R.int(2, 4); return mk({ text: `Bữa sáng có ${a} món ăn (xôi, phở, bánh mì, ...) và ${b} loại đồ uống. Mỗi bạn chọn 1 món ăn và 1 đồ uống. Có bao nhiêu cách chọn?`, answer: a * b, solution: `Mỗi món ăn đi với ${b} đồ uống: ${rep(b, a)} = <b>${a * b}</b> cách.` }); },
      ]);
    }
    if (lv === 2) {
      return pick(R, [
        () => { const a = R.int(2, 3), b = R.int(2, 3), c = 2; return mk({ text: `${N} có ${a} cái áo, ${b} cái quần và ${c} đôi giày. Mỗi bộ gồm 1 áo, 1 quần và 1 đôi giày. Có bao nhiêu cách chọn một bộ?`, answer: a * b * c, solution: `Chọn áo và quần: ${rep(b, a)} = ${a * b} cách. Mỗi cách đi với ${c} đôi giày: ${a * b} + ${a * b} = <b>${a * b * c}</b> cách.` }); },
        () => { const a = R.int(2, 5), b = R.int(2, 5); return mk({ text: `${N} có ${a} cái áo và một số cái quần. Bạn ấy chọn được tất cả ${a * b} bộ quần áo khác nhau (mỗi bộ 1 áo, 1 quần). Hỏi ${N} có mấy cái quần?`, answer: b, solution: `Mỗi quần đi với ${a} áo tạo ${a} bộ. Số quần: ${a * b} : ${a} = <b>${b}</b> (vì ${a} × ${b} = ${a * b}).` }); },
        () => { const a = R.int(2, 3), b = R.int(1, 3), c = R.int(1, 3); return mk({ text: `${N} có ${a} cái áo, ${b} cái quần và ${c} cái váy. Mỗi bộ gồm 1 áo và 1 quần hoặc 1 áo và 1 váy. Có bao nhiêu cách chọn một bộ?`, answer: a * (b + c), solution: `Mỗi áo đi với ${b} quần hoặc ${c} váy: ${b} + ${c} = ${b + c} cách. ${a} áo: ${rep(b + c, a)} = <b>${a * (b + c)}</b> cách.` }); },
      ]);
    }
    return pick(R, [
      () => { const a = R.int(2, 4), b = R.int(2, 4); return mk({ text: `${N} có ${a} cái áo (trong đó có 1 áo đỏ) và ${b} cái quần (trong đó có 1 quần trắng). Bạn ấy không bao giờ mặc áo đỏ với quần trắng. Hỏi có bao nhiêu cách chọn một bộ gồm 1 áo và 1 quần?`, answer: a * b - 1, solution: `Nếu không có điều kiện: ${rep(b, a)} = ${a * b} cách. Bỏ đi 1 bộ áo đỏ – quần trắng: ${a * b} − 1 = <b>${a * b - 1}</b> cách.` }); },
      () => { const a = R.int(3, 4), b = R.int(2, 4); return mk({ text: `${N} có ${a} cái áo (trong đó có 1 áo đỏ) và ${b} cái quần (trong đó có 1 quần đen). Áo đỏ chỉ được mặc với quần đen, các áo khác mặc với quần nào cũng được. Có bao nhiêu cách chọn một bộ?`, answer: (a - 1) * b + 1, solution: `Áo đỏ: 1 cách (với quần đen). ${a - 1} áo còn lại, mỗi áo ${b} cách: ${rep(b, a - 1)} = ${(a - 1) * b}. Tổng: ${(a - 1) * b} + 1 = <b>${(a - 1) * b + 1}</b> cách.` }); },
      () => { const a = R.int(2, 3), b = R.int(1, 2), c = R.int(1, 2); return mk({ text: `${N} có ${a} cái áo, ${b} cái quần, ${c} cái váy và 1 cái mũ. Mỗi bộ gồm 1 áo, 1 quần hoặc 1 váy; bạn ấy có thể đội mũ hoặc không đội mũ. Có bao nhiêu cách ăn mặc khác nhau?`, answer: a * (b + c) * 2, solution: `Chọn áo cùng quần hoặc váy: ${a} × ${b + c} = ${a * (b + c)} cách. Mỗi cách có 2 lựa chọn (đội mũ / không đội mũ): ${a * (b + c)} + ${a * (b + c)} = <b>${2 * a * (b + c)}</b> cách.` }); },
    ]);
  }

  function combRoads(R, lv) {
    if (lv === 1) {
      const a = R.int(2, 3), b = R.int(2, 4);
      return mk({ text: `Từ nhà 🏠 đến công viên 🌳 có ${a} con đường. Từ công viên đến trường 🏫 có ${b} con đường. Hỏi có bao nhiêu cách đi từ nhà đến trường (đi qua công viên)?`, answer: a * b, solution: `Mỗi đường từ nhà đến công viên nối được với ${b} đường đến trường: ${rep(b, a)} = <b>${a * b}</b> cách.` });
    }
    if (lv === 2) {
      return pick(R, [
        () => { const a = 2, b = R.int(2, 3), c = R.int(2, 3); return mk({ text: `Từ A đến B có ${a} con đường, từ B đến C có ${b} con đường, từ C đến D có ${c} con đường. Hỏi có bao nhiêu cách đi từ A đến D (đi qua B và C)?`, answer: a * b * c, solution: `Từ A đến C: ${rep(b, a)} = ${a * b} cách. Mỗi cách lại có ${c} đường đến D: ${rep(a * b, c)} = <b>${a * b * c}</b> cách.` }); },
        () => { const a = R.int(2, 3), b = R.int(2, 3), c = R.int(1, 3); return mk({ text: `Từ nhà đến công viên có ${a} con đường, từ công viên đến trường có ${b} con đường. Ngoài ra còn ${c} con đường đi thẳng từ nhà đến trường (không qua công viên). Hỏi có bao nhiêu cách đi từ nhà đến trường?`, answer: a * b + c, solution: `Qua công viên: ${rep(b, a)} = ${a * b} cách. Đi thẳng: ${c} cách. Tổng: ${a * b} + ${c} = <b>${a * b + c}</b> cách.` }); },
      ]);
    }
    return pick(R, [
      () => { const a = R.int(2, 3), b = R.int(2, 3), c = R.int(1, 3), d = R.int(2, 3); return mk({ text: `Từ A đến D có hai lối: đi qua B hoặc đi qua C. Từ A đến B có ${a} đường, từ B đến D có ${b} đường. Từ A đến C có ${c} đường, từ C đến D có ${d} đường. Hỏi có bao nhiêu cách đi từ A đến D?`, answer: a * b + c * d, solution: `Qua B: ${a} × ${b} = ${a * b} cách. Qua C: ${c} × ${d} = ${c * d} cách. Tổng: ${a * b} + ${c * d} = <b>${a * b + c * d}</b> cách.` }); },
      () => { const [a, b] = R.pick([[2, 2], [2, 3], [3, 2]]), ans = a * b * (b - 1) * (a - 1); return mk({ text: `Từ nhà đến hiệu sách có ${a} con đường, từ hiệu sách đến trường có ${b} con đường. ${R.pick(NAMES)} đi từ nhà qua hiệu sách đến trường, rồi lại đi qua hiệu sách về nhà, nhưng đường về không đi lại con đường nào đã đi. Hỏi có bao nhiêu cách đi và về?`, answer: ans, solution: `Lượt đi: ${a} × ${b} = ${a * b} cách. Lượt về: từ trường đến hiệu sách còn ${b - 1} đường, từ hiệu sách về nhà còn ${a - 1} đường: ${b - 1} × ${a - 1} = ${(a - 1) * (b - 1)} cách. Mỗi cách đi ghép với mỗi cách về: ${a * b} × ${(a - 1) * (b - 1)} = <b>${ans}</b> cách.` }); },
      () => { const a = R.int(2, 3), b = R.int(2, 3), c = R.int(2, 3); return mk({ text: `Từ A đến B có ${a} con đường, từ B đến C có ${b} con đường, từ C đến D có ${c} con đường. Ngoài ra có 1 con đường đi thẳng từ A đến C. Hỏi có bao nhiêu cách đi từ A đến D?`, answer: (a * b + 1) * c, solution: `Từ A đến C: qua B có ${a} × ${b} = ${a * b} cách, đi thẳng 1 cách, tất cả ${a * b + 1} cách. Từ C đến D có ${c} đường: ${rep(a * b + 1, c)} = <b>${(a * b + 1) * c}</b> cách.` }); },
    ]);
  }

  const MATCH = [['bạn gặp nhau, mỗi hai bạn bắt tay nhau một lần', 'cái bắt tay', 'bạn'], ['đội bóng thi đấu, mỗi hai đội đấu với nhau một trận', 'trận đấu', 'đội'], ['bạn chơi cờ, mỗi hai bạn đấu với nhau một ván', 'ván cờ', 'bạn']];
  const hsSol = (n, ctx) => `${cap(ctx[2])} thứ nhất với ${n - 1} ${ctx[2]} còn lại: ${n - 1}; ${ctx[2]} thứ hai thêm ${n - 2} (không tính lại với ${ctx[2]} thứ nhất); ... Tổng: ${range(1, n - 1).reverse().join(' + ')} = <b>${C2(n)}</b> ${ctx[1]}.`;
  function combHandshake(R, lv) {
    const ctx = R.pick(MATCH);
    if (lv === 1) { const n = R.int(3, 5); return mk({ text: `Có ${n} ${ctx[0]}. Hỏi có tất cả bao nhiêu ${ctx[1]}?`, answer: C2(n), solution: hsSol(n, ctx) }); }
    if (lv === 2) {
      return pick(R, [
        () => { const n = R.int(5, 7); return mk({ text: `Có ${n} ${ctx[0]}. Hỏi có tất cả bao nhiêu ${ctx[1]}?`, answer: C2(n), solution: hsSol(n, ctx) }); },
        () => { const m = R.int(3, 5); return mk({ text: `Có ${m} bạn. Mỗi bạn tặng cho mỗi bạn còn lại một tấm thiệp. Hỏi có tất cả bao nhiêu tấm thiệp?`, answer: m * (m - 1), solution: `Mỗi bạn tặng ${m - 1} tấm. ${m} bạn tặng: ${rep(m - 1, m)} = <b>${m * (m - 1)}</b> tấm. (Khác với bắt tay: A tặng B và B tặng A là 2 tấm thiệp.)` }); },
      ]);
    }
    return pick(R, [
      () => { const n = R.int(4, 8); return mk({ text: `Một số bạn gặp nhau, mỗi hai bạn bắt tay nhau đúng một lần. Đếm được tất cả ${C2(n)} cái bắt tay. Hỏi có bao nhiêu bạn?`, answer: n, solution: `Với n bạn thì số cái bắt tay là (n − 1) + (n − 2) + ... + 1. Thử: ${range(1, n - 1).reverse().join(' + ')} = ${C2(n)}. Vậy có <b>${n}</b> bạn.` }); },
      () => { const n = R.int(3, 5); return mk({ text: `Có ${n} đội bóng thi đấu, mỗi hai đội gặp nhau 2 trận (lượt đi và lượt về). Hỏi có tất cả bao nhiêu trận đấu?`, answer: n * (n - 1), solution: `Nếu mỗi cặp đấu 1 trận thì có ${range(1, n - 1).reverse().join(' + ')} = ${C2(n)} trận. Đấu 2 lượt: ${C2(n)} + ${C2(n)} = <b>${n * (n - 1)}</b> trận.` }); },
      () => { const a = R.int(2, 5), b = R.int(2, 5); return mk({ text: `Đội Xanh có ${a} bạn, đội Đỏ có ${b} bạn. Trước trận đấu, mỗi bạn đội Xanh bắt tay mỗi bạn đội Đỏ một lần (các bạn cùng đội không bắt tay nhau). Hỏi có bao nhiêu cái bắt tay?`, answer: a * b, solution: `Mỗi bạn đội Xanh bắt tay ${b} bạn đội Đỏ: ${rep(b, a)} = <b>${a * b}</b> cái bắt tay.` }); },
      () => { const n = R.int(5, 7), A = R.pick(NAMES); return mk({ text: `Có ${n} bạn gặp nhau, mỗi hai bạn bắt tay nhau một lần, riêng ${A} bị đau tay nên không bắt tay ai. Hỏi có bao nhiêu cái bắt tay?`, answer: C2(n - 1), solution: `Chỉ có ${n - 1} bạn bắt tay nhau: ${range(1, n - 2).reverse().join(' + ')} = <b>${C2(n - 1)}</b> cái bắt tay.` }); },
    ]);
  }

  function combDigits(R, lv) {
    const cards = ds => ds.map(d => `<b>${d}</b>`).join(' ');
    if (lv === 0) {
      const ds = R.sample(range(1, 9), 2).sort((x, y) => x - y), rp = R.chance(0.4), l = make2(ds, rp);
      return mk({ text: `Có các tấm thẻ ghi chữ số:<div class="seq">${cards(ds)}</div>Dùng các chữ số đó lập được bao nhiêu số có hai chữ số${rp ? ' (một chữ số có thể dùng hai lần)' : ' khác nhau'}?`, answer: l.length, solution: `Các số: ${l.join(', ')}. Có <b>${l.length}</b> số.` });
    }
    let ds, three, rp;
    if (lv === 1) { ds = R.sample(range(1, 9), 3); if (R.chance(0.4)) ds[0] = 0; three = false; rp = false; } else if (lv === 2) { ds = R.sample(range(1, 9), 3); if (R.chance(0.4)) ds[0] = 0; three = R.chance(0.6); rp = !three; } else { three = true; rp = R.chance(0.35); ds = R.sample(range(1, 9), rp ? R.pick([2, 3]) : 4); if (R.chance(0.5)) ds[0] = 0; }
    ds.sort((x, y) => x - y);
    const l = three ? make3(ds, rp) : make2(ds, rp);
    const k = ds.length, z = ds.includes(0);
    const first = z ? k - 1 : k;
    const rule = three
      ? (rp ? `Hàng trăm có ${first} cách chọn${z ? ' (khác 0)' : ''}, hàng chục ${k} cách, hàng đơn vị ${k} cách: ${first} × ${k} × ${k}` : `Hàng trăm có ${first} cách chọn${z ? ' (khác 0)' : ''}, hàng chục còn ${k - 1} cách, hàng đơn vị còn ${k - 2} cách: ${first} × ${k - 1} × ${k - 2}`)
      : (rp ? `Hàng chục có ${first} cách chọn${z ? ' (khác 0)' : ''}, hàng đơn vị ${k} cách: ${first} × ${k}` : `Hàng chục có ${first} cách chọn${z ? ' (khác 0)' : ''}, hàng đơn vị còn ${k - 1} cách: ${first} × ${k - 1}`);
    const ev = lv === 3 && !rp && R.chance(0.35);
    if (ev) {
      const e = l.filter(n => n % 2 === 0);
      if (e.length) return mk({ text: `Từ các chữ số ${ds.join(', ')} lập được bao nhiêu số chẵn có ba chữ số khác nhau?`, answer: e.length, solution: `Số chẵn có chữ số hàng đơn vị là 0, 2, 4, 6, 8. Liệt kê: ${e.join(', ')}. Có <b>${e.length}</b> số.` });
    }
    return mk({
      text: `Từ các chữ số ${ds.join(', ')} lập được bao nhiêu số có ${three ? 'ba' : 'hai'} chữ số${rp ? ' (các chữ số có thể lặp lại)' : ' khác nhau'}?`, answer: l.length,
      solution: `${rule} = ${l.length}.${l.length <= 18 ? ` Đó là: ${l.join(', ')}.` : ''} Có <b>${l.length}</b> số.`,
    });
  }

  function combSplit(R, lv) {
    if (lv === 3) {
      const n = R.int(6, 12), diff = R.chance(0.5), list = [];
      for (let a = 1; a <= n; a++) for (let b = diff ? a + 1 : a; b <= n; b++) { const c = n - a - b; if (diff ? c > b : c >= b) list.push(`${a} + ${b} + ${c}`); }
      return mk({ text: `Có bao nhiêu cách viết số ${n} thành tổng của ba số${diff ? ' khác nhau,' : ''} khác 0? (Đổi chỗ các số không tính là cách mới)`, answer: list.length, solution: `Liệt kê, số bé đứng trước: ${list.join('; ')}. Có <b>${list.length}</b> cách.` });
    }
    const n = lv === 1 ? R.int(5, 12) : R.int(11, 20), diff = lv === 2 && R.chance(0.5);
    const list = range(1, Math.floor(n / 2)).filter(a => !diff || a !== n - a).map(a => `${a} + ${n - a}`);
    return mk({ text: `Có bao nhiêu cách viết số ${n} thành tổng của hai số${diff ? ' khác nhau,' : ''} khác 0? (Ví dụ ${n - 1} + 1 và 1 + ${n - 1} chỉ tính là một cách)`, answer: list.length, solution: `Các cách: ${list.join('; ')}. Có <b>${list.length}</b> cách.` });
  }

  function coinWays(S, n) {
    const out = [];
    const rec = (i, left, acc) => {
      if (left === 0) { out.push(acc.slice()); return; }
      if (i >= S.length) return;
      for (let k = Math.floor(left / S[i]); k >= 0; k--) { for (let j = 0; j < k; j++) acc.push(S[i]); rec(i + 1, left - k * S[i], acc); acc.length -= k; }
    };
    rec(0, n, []);
    return out;
  }
  function combCoins(R, lv) {
    const [S, n] = lv === 1 ? R.pick([[[2, 1], R.int(3, 7)], [[5, 2], R.pick([7, 9, 10, 11, 12, 14])], [[20, 10], 10 * R.int(3, 6)]])
      : lv === 2 ? R.pick([[[5, 2, 1], R.int(5, 8)], [[50, 20, 10], 10 * R.int(5, 9)], [[10, 5], 5 * R.int(3, 7)]])
        : R.pick([[[5, 2, 1], R.int(9, 11)], [[10, 5, 2], R.pick([12, 14, 15, 16, 17, 20])], ['sub', 0]]);
    if (S === 'sub') {
      const set = R.pick([[1, 2, 5], [1, 2, 5, 10], [2, 5, 10], [1, 2, 4], [5, 10, 20]]);
      const sums = new Set();
      for (let mask = 1; mask < 1 << set.length; mask++) sums.add(sum(set.filter((_, i) => mask & (1 << i))));
      const sorted = [...sums].sort((x, y) => x - y);
      return mk({ text: `${R.pick(NAMES)} có ${set.length} tờ tiền: ${set.map(money).join(', ')}, mỗi loại một tờ. Dùng một hoặc nhiều tờ, bạn ấy có thể trả được bao nhiêu số tiền khác nhau (không cần trả lại)?`, answer: sorted.length, solution: `Thử mọi cách chọn tờ tiền, các số tiền trả được (nghìn đồng): ${sorted.join(', ')}. Có <b>${sorted.length}</b> số tiền khác nhau.` });
    }
    const ways = coinWays(S, n);
    return mk({ text: `Có nhiều tờ tiền loại ${S.slice().reverse().map(money).join(', ')}. Hỏi có bao nhiêu cách lấy ra các tờ tiền để được đúng ${money(n)}?`, answer: ways.length, solution: `Liệt kê từ tờ lớn đến tờ bé (đơn vị nghìn đồng): ${ways.map(w => w.join(' + ')).join('; ')}. Có <b>${ways.length}</b> cách.` });
  }

  function combPigeon(R, lv) {
    const r = R.int(2, 8), g = R.int(2, 8), y = R.int(3, 7);
    if (lv === 1) {
      return pick(R, [
        () => mk({ text: `Trong hộp có ${r} bi đỏ và ${g} bi xanh. Không nhìn vào hộp, phải lấy ra ít nhất bao nhiêu viên bi để chắc chắn có một viên bi đỏ?`, answer: g + 1, solution: `Xui nhất là lấy hết ${g} bi xanh trước. Lấy thêm 1 viên nữa chắc chắn là bi đỏ: ${g} + 1 = <b>${g + 1}</b> viên.` }),
        () => mk({ text: `Trong túi có ${r} cái kẹo cam và ${g} cái kẹo dâu. Không nhìn, phải lấy ra ít nhất bao nhiêu cái để chắc chắn có một cái kẹo dâu?`, answer: r + 1, solution: `Xui nhất là lấy hết ${r} kẹo cam trước. Thêm 1 cái nữa chắc chắn là kẹo dâu: <b>${r + 1}</b> cái.` }),
      ]);
    }
    if (lv === 2) {
      return pick(R, [
        () => { const three = R.chance(0.5), colors = three ? 3 : 2; return mk({ text: `Trong hộp có ${r} bi đỏ, ${g} bi xanh${three ? ` và ${y} bi vàng` : ''}. Không nhìn vào hộp, phải lấy ít nhất bao nhiêu viên để chắc chắn có 2 viên cùng màu?`, answer: colors + 1, solution: `Xui nhất là mỗi viên lấy ra một màu khác nhau: ${colors} viên ${colors} màu. Lấy thêm 1 viên nữa chắc chắn trùng màu: ${colors} + 1 = <b>${colors + 1}</b> viên.` }); },
        () => { const m = Math.max(r, g); return mk({ text: `Trong hộp có ${r} bi đỏ và ${g} bi xanh. Không nhìn, phải lấy ít nhất bao nhiêu viên để chắc chắn có đủ cả hai màu?`, answer: m + 1, solution: `Xui nhất là lấy hết màu nhiều hơn trước (${m} viên). Lấy thêm 1 viên chắc chắn là màu còn lại: <b>${m + 1}</b> viên.` }); },
        () => { const n = R.int(2, 5); return mk({ text: `Trong ngăn kéo có ${n} đôi tất khác màu nhau (mỗi đôi 2 chiếc cùng màu) để lẫn lộn. Không nhìn, phải lấy ít nhất bao nhiêu chiếc để chắc chắn có 2 chiếc cùng màu?`, answer: n + 1, solution: `Có ${n} màu. Xui nhất là lấy ${n} chiếc, mỗi chiếc một màu. Lấy thêm 1 chiếc chắc chắn trùng màu: <b>${n + 1}</b> chiếc.` }); },
      ]);
    }
    return pick(R, [
      () => mk({ text: `Trong hộp có ${r} bi đỏ, ${g} bi xanh và ${y} bi vàng. Không nhìn, phải lấy ít nhất bao nhiêu viên để chắc chắn có 2 viên bi vàng?`, answer: r + g + 2, solution: `Xui nhất là lấy hết ${r} bi đỏ và ${g} bi xanh trước. Sau đó lấy thêm 2 viên đều là bi vàng: ${r} + ${g} + 2 = <b>${r + g + 2}</b> viên.` }),
      () => { const three = R.chance(0.5), c = three ? 3 : 2, rr = Math.max(r, 3), gg = Math.max(g, 3); return mk({ text: `Trong hộp có ${rr} bi đỏ, ${gg} bi xanh${three ? ` và ${y} bi vàng` : ''}. Không nhìn, phải lấy ít nhất bao nhiêu viên để chắc chắn có 3 viên cùng màu?`, answer: 2 * c + 1, solution: `Xui nhất là mỗi màu lấy được 2 viên: ${rep(2, c)} = ${2 * c} viên mà chưa có 3 viên cùng màu. Lấy thêm 1 viên nữa chắc chắn có 3 viên cùng màu: <b>${2 * c + 1}</b> viên.` }); },
      () => { const s = [r, g, y].sort((a, b) => b - a); return mk({ text: `Trong hộp có ${r} bi đỏ, ${g} bi xanh và ${y} bi vàng. Không nhìn, phải lấy ít nhất bao nhiêu viên để chắc chắn có đủ ba màu?`, answer: s[0] + s[1] + 1, solution: `Xui nhất là lấy hết hai màu nhiều nhất trước: ${s[0]} + ${s[1]} = ${s[0] + s[1]} viên. Lấy thêm 1 viên chắc chắn là màu thứ ba: <b>${s[0] + s[1] + 1}</b> viên.` }); },
      () => { const n = R.int(4, 9); return mk({ text: `Trong ngăn kéo có ${n} chiếc tất trắng và ${n} chiếc tất đen để lẫn lộn. Trời tối, phải lấy ra ít nhất bao nhiêu chiếc để chắc chắn có 2 chiếc tất đen?`, answer: n + 2, solution: `Xui nhất là lấy hết ${n} chiếc tất trắng trước, sau đó 2 chiếc tiếp theo đều là tất đen: ${n} + 2 = <b>${n + 2}</b> chiếc.` }); },
    ]);
  }

  function combShare(R, lv) {
    const [A, B, Cn] = R.sample(NAMES, 3);
    if (lv === 0) {
      const n = R.int(3, 6), list = range(1, n - 1).map(k => `${A} ${k} – ${B} ${n - k}`);
      return mk({ text: `Chia ${n} cái kẹo 🍬 cho ${A} và ${B}, bạn nào cũng được ít nhất 1 cái. Có mấy cách chia?`, answer: n - 1, solution: `Các cách: ${list.join('; ')}. Có <b>${n - 1}</b> cách.` });
    }
    if (lv === 1) {
      return pick(R, [
        () => { const n = R.int(6, 10); return mk({ text: `Chia ${n} cái kẹo cho ${A} và ${B}, bạn nào cũng được ít nhất 1 cái. Có mấy cách chia?`, answer: n - 1, solution: `${A} có thể được 1, 2, ..., ${n - 1} cái (${B} được phần còn lại). Có <b>${n - 1}</b> cách.` }); },
        () => { const n = R.int(4, 9); return mk({ text: `Chia ${n} quả bóng cho ${A} và ${B} (có thể có bạn không được quả nào). Có mấy cách chia?`, answer: n + 1, solution: `${A} có thể được 0, 1, 2, ..., ${n} quả: có <b>${n + 1}</b> cách.` }); },
        () => { const n = R.int(6, 12); return mk({ text: `Chia ${n} quyển vở cho ${A} và ${B}, mỗi bạn được ít nhất 2 quyển. Có mấy cách chia?`, answer: n - 3, solution: `${A} có thể được 2, 3, ..., ${n - 2} quyển: ${n - 2} − 2 + 1 = <b>${n - 3}</b> cách.` }); },
      ]);
    }
    if (lv === 2) {
      const n = R.int(4, 7), rows = range(1, n - 2).map(a => `${A} ${a} cái: ${n - a - 1} cách`);
      return mk({ text: `Chia ${n} cái kẹo cho ba bạn ${A}, ${B}, ${Cn}, bạn nào cũng được ít nhất 1 cái. Có bao nhiêu cách chia?`, answer: C2(n - 1), solution: `Xét số kẹo của ${A}, phần còn lại chia cho ${B} và ${Cn} (mỗi bạn ít nhất 1): ${rows.join('; ')}. Tổng: ${range(1, n - 2).reverse().join(' + ')} = <b>${C2(n - 1)}</b> cách.` });
    }
    return pick(R, [
      () => { const n = R.int(8, 9); return mk({ text: `Chia ${n} cái kẹo cho ba bạn ${A}, ${B}, ${Cn}, bạn nào cũng được ít nhất 1 cái. Có bao nhiêu cách chia?`, answer: C2(n - 1), solution: `${A} được 1 cái thì ${B} và ${Cn} chia ${n - 1} cái: ${n - 2} cách; ${A} được 2 cái: ${n - 3} cách; ...; ${A} được ${n - 2} cái: 1 cách. Tổng: ${range(1, n - 2).reverse().join(' + ')} = <b>${C2(n - 1)}</b> cách.` }); },
      () => { const n = R.int(8, 10); return mk({ text: `Chia ${n} quyển vở cho ba bạn ${A}, ${B}, ${Cn}, bạn nào cũng được ít nhất 2 quyển. Có bao nhiêu cách chia?`, answer: C2(n - 4), solution: `Chia trước cho mỗi bạn 1 quyển, còn ${n - 3} quyển, chia tiếp sao cho mỗi bạn ít nhất 1 quyển nữa. ${A} được thêm ${range(1, n - 5).join(', ')} quyển (mỗi cách ứng với ${range(1, n - 5).reverse().join(', ')} cách chia cho hai bạn còn lại): ${range(1, n - 5).reverse().join(' + ')} = <b>${C2(n - 4)}</b> cách.` }); },
      () => { const n = R.int(7, 14), cnt = Math.floor((n - 1) / 2), list = range(1, cnt).map(b => `${A} ${n - b} – ${B} ${b}`); return mk({ text: `Chia ${n} cái kẹo cho ${A} và ${B}, bạn nào cũng được ít nhất 1 cái và ${A} được nhiều kẹo hơn ${B}. Có mấy cách chia?`, answer: cnt, solution: `Các cách: ${list.join('; ')}. Có <b>${cnt}</b> cách.` }); },
    ]);
  }

  const fact = n => (n <= 1 ? 1 : n * fact(n - 1));
  function perms(arr) { if (arr.length <= 1) return [arr]; return arr.flatMap((x, i) => perms(arr.slice(0, i).concat(arr.slice(i + 1))).map(p => [x, ...p])); }
  function combArrange(R, lv) {
    const ctx = R.pick([['bạn', 'đứng thành một hàng ngang để chụp ảnh'], ['bạn', 'ngồi vào một hàng ghế'], ['quyển sách khác nhau', 'xếp thành một hàng trên giá']]);
    const people = ctx[0] === 'bạn';
    if (lv === 1) {
      const n = R.int(2, 3), names = people ? R.sample(NAMES, n) : ['Toán', 'Tiếng Việt', 'Âm nhạc'].slice(0, n), l = perms(names);
      return mk({ text: `Có ${n} ${ctx[0]}${people ? ` (${names.join(', ')})` : ` (${names.join(', ')})`} ${ctx[1]}. Có bao nhiêu cách xếp?`, answer: l.length, solution: `Liệt kê: ${l.map(p => p.join(' – ')).join('; ')}. Có <b>${l.length}</b> cách.` });
    }
    if (lv === 2) {
      const [A, B, Cn] = R.sample(NAMES, 3), all = perms([A, B, Cn]);
      const c = R.pick([[p => p[1] === A, `${A} đứng ở giữa`], [p => p[0] !== A, `${A} không đứng đầu hàng`], [p => Math.abs(p.indexOf(A) - p.indexOf(B)) === 1, `${A} và ${B} đứng cạnh nhau`], [() => true, 'ai đứng đâu cũng được']]);
      const l = all.filter(c[0]);
      return mk({ text: `Ba bạn ${A}, ${B}, ${Cn} đứng thành một hàng ngang để chụp ảnh, sao cho ${c[1]}. Có bao nhiêu cách xếp?`, answer: l.length, solution: `Liệt kê (từ trái sang): ${l.map(p => p.join(' – ')).join('; ')}. Có <b>${l.length}</b> cách.` });
    }
    const [A, B] = R.sample(NAMES, 2);
    return pick(R, [
      () => mk({ text: `Có 4 bạn đứng thành một hàng ngang. Hỏi có bao nhiêu cách xếp?`, answer: 24, solution: 'Chỗ thứ nhất có 4 cách chọn bạn, chỗ thứ hai còn 3 cách, chỗ thứ ba còn 2 cách, chỗ cuối 1 cách: 4 × 3 × 2 × 1 = <b>24</b> cách.' }),
      () => mk({ text: `Có 4 bạn trong đó có ${A} đứng thành một hàng ngang, ${A} luôn đứng đầu hàng. Hỏi có bao nhiêu cách xếp?`, answer: 6, solution: `${A} đứng đầu, 3 bạn còn lại xếp vào 3 chỗ: 3 × 2 × 1 = <b>6</b> cách.` }),
      () => mk({ text: `Có 4 bạn trong đó có ${A} đứng thành một hàng ngang, ${A} đứng ở đầu hàng hoặc cuối hàng. Hỏi có bao nhiêu cách xếp?`, answer: 12, solution: `${A} đứng đầu: 3 bạn còn lại có 3 × 2 × 1 = 6 cách. ${A} đứng cuối: cũng 6 cách. Tổng: 6 + 6 = <b>12</b> cách.` }),
      () => mk({ text: `Có 4 bạn trong đó có ${A} và ${B} đứng thành một hàng ngang, ${A} và ${B} luôn đứng cạnh nhau. Hỏi có bao nhiêu cách xếp?`, answer: 12, solution: `Coi ${A} và ${B} là một "khối". Xếp khối cùng 2 bạn còn lại: 3 × 2 × 1 = 6 cách. Trong khối, ${A} – ${B} hoặc ${B} – ${A}: 2 cách. Tổng: 6 + 6 = <b>12</b> cách.` }),
    ]);
  }

  function combColor(R, lv) {
    const COL = ['đỏ', 'xanh', 'vàng', 'tím'];
    if (lv === 1) {
      const a = R.int(2, 4), same = R.chance(0.4), cs = COL.slice(0, a), l = [];
      cs.forEach(x => cs.forEach(y => { if (same || x !== y) l.push(`${x} – ${y}`); }));
      return mk({ text: `Có ${a} màu (${cs.join(', ')}). Tô màu cho 2 ô vuông đứng cạnh nhau, mỗi ô một màu${same ? ' (hai ô có thể cùng màu)' : ', hai ô phải khác màu'}. Có bao nhiêu cách tô?`, answer: l.length, solution: `Ô thứ nhất có ${a} cách, ô thứ hai có ${same ? a : a - 1} cách: ${rep(same ? a : a - 1, a)} = ${l.length}. Các cách: ${l.join('; ')}. Có <b>${l.length}</b> cách.` });
    }
    if (lv === 2) {
      return pick(R, [
        () => { const a = R.int(2, 3), ans = a * (a - 1) * (a - 1); return mk({ text: `Tô màu 3 ô vuông xếp thành một hàng ngang bằng ${a} màu, hai ô cạnh nhau phải khác màu. Có bao nhiêu cách tô?`, answer: ans, solution: `Ô thứ nhất: ${a} cách. Ô thứ hai khác ô thứ nhất: ${a - 1} cách. Ô thứ ba khác ô thứ hai: ${a - 1} cách. Tổng: ${a} × ${a - 1} × ${a - 1} = <b>${ans}</b> cách.` }); },
        () => mk({ text: 'Tô 3 ô vuông xếp thành một hàng bằng 3 màu đỏ, xanh, vàng, ba ô có ba màu khác nhau. Có bao nhiêu cách tô?', answer: 6, solution: 'Ô thứ nhất: 3 cách, ô thứ hai: 2 cách, ô thứ ba: 1 cách: 3 × 2 × 1 = <b>6</b> cách (đỏ – xanh – vàng, đỏ – vàng – xanh, xanh – đỏ – vàng, xanh – vàng – đỏ, vàng – đỏ – xanh, vàng – xanh – đỏ).' }),
        () => { const a = R.int(3, 4); return mk({ text: `Có ${a} màu. Tô một lá cờ có 2 sọc ngang, mỗi sọc một màu và hai sọc khác màu nhau. Có bao nhiêu cách tô?`, answer: a * (a - 1), solution: `Sọc trên: ${a} cách. Sọc dưới: ${a - 1} cách. Tổng: ${rep(a - 1, a)} = <b>${a * (a - 1)}</b> cách.` }); },
      ]);
    }
    return pick(R, [
      () => mk({ text: 'Có 4 màu. Tô một lá cờ có 3 sọc ngang, mỗi sọc một màu và ba sọc có ba màu khác nhau. Có bao nhiêu cách tô?', answer: 24, solution: 'Sọc thứ nhất: 4 cách, sọc thứ hai: 3 cách, sọc thứ ba: 2 cách: 4 × 3 × 2 = <b>24</b> cách.' }),
      () => mk({ text: 'Tô màu 3 ô vuông xếp thành một hàng ngang bằng 4 màu, hai ô cạnh nhau phải khác màu. Có bao nhiêu cách tô?', answer: 36, solution: 'Ô thứ nhất: 4 cách. Ô thứ hai: 3 cách. Ô thứ ba (khác ô thứ hai): 3 cách. Tổng: 4 × 3 × 3 = <b>36</b> cách.' }),
      () => mk({ text: 'Tô màu 4 ô vuông xếp thành một hàng ngang bằng 3 màu, hai ô cạnh nhau phải khác màu. Có bao nhiêu cách tô?', answer: 24, solution: 'Ô thứ nhất: 3 cách. Mỗi ô tiếp theo khác ô đứng trước: 2 cách. Tổng: 3 × 2 × 2 × 2 = <b>24</b> cách.' }),
      () => { const a = R.int(3, 4); return mk({ text: `Tô 3 ô vuông xếp thành một hàng bằng ${a} màu, ô ở giữa phải khác màu với cả hai ô bên cạnh (hai ô ngoài cùng có thể cùng màu). Có bao nhiêu cách tô?`, answer: a * (a - 1) * (a - 1), solution: `Ô giữa: ${a} cách. Ô bên trái khác ô giữa: ${a - 1} cách. Ô bên phải khác ô giữa: ${a - 1} cách. Tổng: ${a} × ${a - 1} × ${a - 1} = <b>${a * (a - 1) * (a - 1)}</b> cách.` }); },
    ]);
  }

  // =====================================================================
  const G = (id, fn, lv) => ({ id, fn, lv });
  const L_ = T.L_;
  T.addGrade(2, {
    topics: {
      logic: {
        desc: 'Dãy số, dãy hình, xếp hàng, so sánh, tuổi, cưa gỗ – trồng cây, cân thăng bằng, ngày trong tuần, suy luận, đong nước',
        points: [
          'Dãy số: tìm quy luật giữa hai số liền nhau (cộng đều, trừ đều, cộng xen kẽ, gấp đôi, khoảng cách tăng dần, số sau bằng tổng hai số trước).',
          'Dãy hình lặp lại theo nhóm: tìm nhóm lặp, các hình thứ k, 2k, 3k, ... là hình cuối nhóm.',
          'Xếp hàng: số bạn trong hàng = thứ tự từ trái + thứ tự từ phải − 1. Đứng thứ a từ đầu thì đứng thứ (n − a + 1) từ cuối.',
          'Cưa gỗ: n đoạn cần n − 1 lần cưa. Trồng cây hai đầu: số cây = số khoảng + 1. Trồng quanh vòng tròn: số cây = số khoảng. Từ tầng 1 lên tầng n đi n − 1 đoạn cầu thang.',
          'Tuổi: hiệu số tuổi của hai người không bao giờ thay đổi. Sau k năm, mỗi người thêm k tuổi.',
          'Ngày trong tuần lặp lại sau mỗi 7 ngày: sau 7, 14, 21, 28 ngày vẫn là thứ đó.',
          'Suy luận "ai là ai": kẻ bảng, gạch bỏ những ô "không", ô nào chỉ còn một khả năng thì đó là đáp án.',
        ],
        tips: [
          'Vẽ sơ đồ: mỗi bạn là một chấm tròn, mỗi khúc gỗ là một đoạn thẳng, mỗi cây là một dấu gạch.',
          'Bài cân thăng bằng: thay thế dần các vật nặng bằng vật nhẹ hơn (1 quả dưa = 2 quả bưởi = 6 quả táo).',
          'Đọc kĩ các từ "hôm qua", "hôm kia", "ngày mai", "ngày kia" trước khi đếm ngày.',
        ],
        examples: [
          { q: 'Tìm số tiếp theo: 1, 2, 3, 5, 8, 13, ?', a: 'Mỗi số bằng tổng hai số đứng ngay trước: 8 + 13 = <b>21</b>.' },
          { q: 'Cưa khúc gỗ thành 6 đoạn, mỗi lần cưa mất 3 phút. Cưa xong mất bao lâu?', a: '6 đoạn cần 5 lần cưa: 3 × 5 = <b>15</b> phút.' },
          { q: 'Hôm nay là thứ Ba. 10 ngày nữa là thứ mấy?', a: '10 = 7 + 3. Sau 7 ngày vẫn là thứ Ba, thêm 3 ngày: thứ Tư, thứ Năm, <b>thứ Sáu</b>.' },
          { q: 'Năm nay mẹ 32 tuổi, con 7 tuổi. Khi con bằng tuổi mẹ hiện nay thì mẹ bao nhiêu tuổi?', a: 'Mẹ luôn hơn con 32 − 7 = 25 tuổi. Khi con 32 tuổi, mẹ 32 + 25 = <b>57</b> tuổi.' },
        ],
      },
      arith: {
        desc: 'Cộng trừ có nhớ trong phạm vi 100 và 1000, tìm thành phần chưa biết, bảng nhân 2 – 5, bảng chia 2 – 5, tính nhanh, con vật thay số, toán có lời văn, tiền Việt Nam',
        points: [
          'Cộng, trừ có nhớ: đặt tính thẳng cột, tính từ phải sang trái (đơn vị → chục → trăm), nhớ 1 sang hàng bên trái.',
          'Tìm số hạng = tổng − số hạng kia. Tìm số bị trừ = hiệu + số trừ. Tìm số trừ = số bị trừ − hiệu.',
          'Phép nhân là tổng các số hạng bằng nhau: 2 + 2 + 2 + 2 = 2 × 4 = 8. Thuộc bảng nhân 2, 5 (và 3, 4).',
          'Phép chia là phép ngược của phép nhân: vì 5 × 4 = 20 nên 20 : 5 = 4 và 20 : 4 = 5.',
          'Biểu thức có nhân, chia và cộng, trừ: nhân chia trước, cộng trừ sau.',
          'Bài toán "nhiều hơn" làm phép cộng, "ít hơn" làm phép trừ. Cẩn thận câu "A ít hơn B" thì B nhiều hơn A.',
          'Tiền Việt Nam: các tờ 1 nghìn, 2 nghìn, 5 nghìn, 10 nghìn, 20 nghìn, 50 nghìn, 100 nghìn đồng.',
        ],
        tips: [
          'Tính nhanh: ghép các số thành tròn chục, tròn trăm (37 + 63 = 100), hoặc ghép số đầu với số cuối.',
          'Cộng với 99, 98: cộng 100 rồi bớt đi 1, 2. Trừ đi 99: trừ 100 rồi cộng thêm 1.',
          'Luôn thử lại: lấy kết quả phép trừ cộng với số trừ phải được số bị trừ.',
        ],
        examples: [
          { q: '47 + 35 = ?', a: 'Đơn vị: 7 + 5 = 12, viết 2 nhớ 1. Chục: 4 + 3 + 1 = 8. Kết quả <b>82</b>.' },
          { q: '□ − 28 = 45. Tìm □.', a: 'Số bị trừ = hiệu + số trừ: 45 + 28 = <b>73</b>.' },
          { q: 'Trong sân có 5 con gà và 3 con chó. Có bao nhiêu cái chân?', a: 'Chân gà: 2 × 5 = 10. Chân chó: 4 × 3 = 12. Tất cả: 10 + 12 = <b>22</b> cái chân.' },
          { q: 'Tính nhanh: 10 + 20 + 30 + 40 + 50 + 60 + 70 + 80 + 90', a: '(10 + 90) + (20 + 80) + (30 + 70) + (40 + 60) + 50 = 100 + 100 + 100 + 100 + 50 = <b>450</b>.' },
        ],
      },
      number: {
        desc: 'Số đến 1000: trăm – chục – đơn vị, so sánh, số tròn chục – tròn trăm, số liền trước – liền sau, chẵn lẻ, đếm số, đếm chữ số, lập số, tổng các chữ số',
        points: [
          'Số có ba chữ số gồm trăm, chục, đơn vị: 507 gồm 5 trăm, 0 chục, 7 đơn vị; 507 = 500 + 7. 10 chục = 1 trăm.',
          'So sánh hai số: số nào nhiều chữ số hơn thì lớn hơn; nếu bằng nhau, so sánh lần lượt hàng trăm, hàng chục, hàng đơn vị.',
          'Số tròn chục có hàng đơn vị là 0 (10, 20, ..., 990). Số tròn trăm có hai chữ số cuối là 00 (100, 200, ..., 900).',
          'Số chẵn tận cùng 0, 2, 4, 6, 8; số lẻ tận cùng 1, 3, 5, 7, 9. Hai số chẵn (lẻ) liền nhau hơn kém nhau 2.',
          'Từ a đến b có (b − a + 1) số. Có 90 số có hai chữ số và 900 số có ba chữ số.',
          'Đếm chữ số: từ 1 đến 9 có 9 chữ số, từ 10 đến 99 mỗi số có 2 chữ số, từ 100 trở đi mỗi số có 3 chữ số.',
          'Lập số lớn nhất: chữ số lớn đặt ở hàng cao. Lập số bé nhất: chữ số bé (khác 0) đặt ở hàng trăm.',
        ],
        tips: [
          'Liệt kê theo thứ tự (hàng trăm, rồi hàng chục từ bé đến lớn) để không bỏ sót.',
          'Chữ số 0 không được đứng đầu một số.',
          'Phân biệt "chữ số hàng chục" và "số chục": 350 có chữ số hàng chục là 5 nhưng có 35 chục.',
        ],
        examples: [
          { q: 'Số gồm 4 trăm, 12 chục và 5 đơn vị là số nào?', a: '12 chục = 1 trăm 2 chục. Vậy có 5 trăm, 2 chục, 5 đơn vị: <b>525</b>.' },
          { q: 'Viết các số từ 1 đến 30 cần bao nhiêu chữ số?', a: '1 đến 9: 9 chữ số. 10 đến 30: 21 số × 2 = 42 chữ số. Tổng: 9 + 42 = <b>51</b>.' },
          { q: 'Từ các chữ số 3, 0, 7 lập số bé nhất có ba chữ số khác nhau.', a: 'Hàng trăm bé nhất khác 0 là 3, rồi 0, rồi 7: <b>307</b>.' },
          { q: 'Có bao nhiêu chữ số điền vào ô trống: 4□7 < 452?', a: 'Hàng trăm bằng nhau, hàng chục □ phải bé hơn 5 (□ = 5 thì 457 > 452). □ là 0, 1, 2, 3, 4: <b>5</b> chữ số.' },
        ],
      },
      geo: {
        desc: 'Đoạn thẳng, đường gấp khúc, tứ giác, đếm hình, khối trụ – khối cầu, cm – dm – m – km, kg, lít, xem đồng hồ, ngày tháng, xem lịch',
        points: [
          'Độ dài đường gấp khúc bằng tổng độ dài các đoạn thẳng của nó.',
          'Hình tứ giác có 4 cạnh, 4 đỉnh. Hình vuông, hình chữ nhật đều là hình tứ giác.',
          '1 dm = 10 cm; 1 m = 10 dm = 100 cm; 1 km = 1000 m. Đổi về cùng đơn vị rồi mới cộng, trừ, so sánh.',
          'Đồng hồ: kim ngắn chỉ giờ, kim dài chỉ phút. Kim dài chỉ số 3 là 15 phút, số 6 là 30 phút. 1 giờ = 60 phút. 15 giờ là 3 giờ chiều.',
          'Một tuần có 7 ngày. Tháng 4, 6, 9, 11 có 30 ngày; tháng 1, 3, 5, 7, 8, 10, 12 có 31 ngày.',
          'Đếm hình: đếm hình đơn trước, rồi hình ghép 2, ghép 3, ... Hình có n tia chung đỉnh cắt một đáy: (n − 1) + (n − 2) + ... + 1 tam giác.',
          'Khối cầu tròn đều (quả bóng), khối trụ có hai đáy là hình tròn (lon sữa).',
        ],
        tips: [
          'Đo bằng thước: lấy số ở vạch cuối trừ số ở vạch đầu (đoạn thẳng không phải lúc nào cũng bắt đầu từ vạch 0).',
          'Đánh số các hình nhỏ 1, 2, 3, ... rồi ghép lại để đếm không sót.',
          'Bài xem lịch: các ngày cách nhau 7 ngày thì cùng một thứ.',
        ],
        examples: [
          { q: 'Đường gấp khúc ABCD có AB = 12 cm, BC = 15 cm, CD = 9 cm. Tính độ dài đường gấp khúc.', a: '12 + 15 + 9 = <b>36</b> cm.' },
          { q: '3 dm 5 cm = ? cm', a: '3 dm = 30 cm. 30 + 5 = <b>35</b> cm.' },
          { q: 'Phim bắt đầu lúc 7 giờ 30 phút, kết thúc lúc 9 giờ. Phim dài bao nhiêu phút?', a: 'Từ 7 giờ 30 đến 8 giờ: 30 phút; từ 8 giờ đến 9 giờ: 60 phút. Tổng <b>90</b> phút.' },
          { q: 'Ngày 3 tháng 5 là thứ Hai. Ngày 17 tháng 5 là thứ mấy?', a: '17 − 3 = 14 ngày = 2 tuần, nên cũng là <b>thứ Hai</b>.' },
        ],
      },
      comb: {
        desc: 'Chọn trang phục (quy tắc nhân), tìm đường, bắt tay – thi đấu, xếp hàng, lập số, tách số, đổi tiền, tô màu, chia kẹo, trường hợp xấu nhất',
        points: [
          'Quy tắc nhân: 3 áo và 4 quần thì có 4 + 4 + 4 = 3 × 4 = 12 bộ. Có thêm 2 đôi giày thì 12 × 2 = 24 bộ.',
          'Quy tắc cộng: chọn 1 món trong 3 kẹo HOẶC 4 bánh thì có 3 + 4 = 7 cách.',
          'Bắt tay (mỗi cặp một lần): n bạn có (n − 1) + (n − 2) + ... + 1 cái bắt tay. Tặng thiệp (mỗi người tặng mỗi người): n × (n − 1) tấm.',
          'Xếp n bạn thành hàng: chỗ đầu có n cách, chỗ thứ hai n − 1 cách, ... 3 bạn có 3 × 2 × 1 = 6 cách.',
          'Lập số: đếm số cách chọn từng hàng, nhớ chữ số 0 không đứng đầu.',
          'Trường hợp xấu nhất: muốn "chắc chắn" thì giả sử mình lấy phải những thứ không mong muốn trước.',
        ],
        tips: [
          'Liệt kê có thứ tự hoặc vẽ sơ đồ cây để không bỏ sót, không trùng lặp.',
          'Bài chia kẹo: cố định số kẹo của bạn thứ nhất rồi đếm cách chia phần còn lại.',
        ],
        examples: [
          { q: 'Từ các chữ số 1, 2, 3 lập được bao nhiêu số có ba chữ số khác nhau?', a: 'Hàng trăm 3 cách, hàng chục 2 cách, hàng đơn vị 1 cách: 3 × 2 × 1 = <b>6</b> số (123, 132, 213, 231, 312, 321).' },
          { q: '5 đội bóng, mỗi hai đội đấu một trận. Có bao nhiêu trận?', a: '4 + 3 + 2 + 1 = <b>10</b> trận.' },
          { q: 'Hộp có 5 bi đỏ, 3 bi xanh. Lấy ít nhất bao nhiêu viên để chắc chắn có 2 viên cùng màu?', a: 'Xui nhất: 1 đỏ, 1 xanh. Thêm 1 viên nữa chắc chắn trùng màu: <b>3</b> viên.' },
          { q: 'Chia 5 cái kẹo cho 3 bạn, mỗi bạn ít nhất 1 cái. Có mấy cách?', a: 'Bạn thứ nhất được 1 cái: 3 cách chia phần còn lại; 2 cái: 2 cách; 3 cái: 1 cách. Tổng 3 + 2 + 1 = <b>6</b> cách.' },
        ],
      },
    },
    gens: {
      logic: [G('seq', logicSeq, [0, 1, 2, 3]), G('pattern', logicPattern, [0, 1, 2, 3]), G('compare', logicCompare, [0, 1, 2, 3]), G('position0', logicPosition0, [0]), G('week', logicWeek, [0, 1, 2, 3]),
        G('queue', logicQueue, [1, 2, 3]), G('age', logicAge, [1, 2, 3]), G('cut', logicCut, [1, 2, 3]), G('balance', logicBalance, [1, 2, 3]), G('who', logicWho, [2, 3]), G('water', logicWater, [2, 3])],
      arith: [G('add0', arithAdd0, [0]), G('calc', arithCalc, [0, 1, 2, 3]), G('mult', arithMult, [0, 1, 2, 3]), G('cmp', arithCmp, [0, 1, 2, 3]),
        G('missing', arithMissing, [1, 2, 3]), G('div', arithDiv, [1, 2, 3]), G('quick', arithQuick, [1, 2, 3]), G('symbols', arithSymbols, [1, 2, 3]), G('word', arithWord, [1, 2, 3]), G('money', arithMoney, [1, 2, 3])],
      number: [G('place', ntPlace, [0, 1, 2, 3]), G('neighbor', ntNeighbor, [0, 1, 2, 3]), G('order', ntOrder, [0, 1, 2, 3]), G('round', ntRound, [0, 1, 2, 3]), G('evenodd', ntEvenOdd, [0, 1, 2, 3]),
        G('count', ntCount, [1, 2, 3]), G('write', ntWrite, [2, 3]), G('fromdigits', ntFromDigits, [1, 2, 3]), G('digitsum', ntDigitSum, [1, 2, 3]), G('special', ntSpecial, [1, 2, 3])],
      geo: [G('shape', geoShape, [0, 1]), G('solids', geoSolids, [0, 1]), G('clock', geoClock, [0, 1, 2, 3]), G('length', geoLength, [0, 1, 2, 3]), G('polyline', geoPolyline, [0, 1, 2, 3]),
        G('measure', geoMeasure, [1, 2, 3]), G('segments', geoSegments, [1, 2, 3]), G('triangles', geoTriangles, [1, 2, 3]), G('quads', geoQuads, [1, 2, 3]), G('calendar', geoCalendar, [1, 2, 3])],
      comb: [G('pick0', combPick0, [0]), G('outfit', combOutfit, [0, 1, 2, 3]), G('digits', combDigits, [0, 1, 2, 3]), G('share', combShare, [0, 1, 2, 3]),
        G('roads', combRoads, [1, 2, 3]), G('handshake', combHandshake, [1, 2, 3]), G('split', combSplit, [1, 2, 3]), G('coins', combCoins, [1, 2, 3]), G('pigeon', combPigeon, [1, 2, 3]), G('arrange', combArrange, [1, 2, 3]), G('color', combColor, [1, 2, 3])],
    },
    lessons: {
      logic: T.lessonPath(
        [L_('Dãy số đếm thêm', 'seq'), L_('Hình lặp lại, so sánh', 'pattern', 'compare'), L_('Vị trí, ngày trong tuần', 'position0', 'week')],
        [L_('Dãy số, dãy hình', 'seq', 'pattern'), L_('Xếp hàng, so sánh', 'queue', 'compare'), L_('Tính tuổi, cân thăng bằng', 'age', 'balance'), L_('Cưa gỗ, trồng cây, ngày trong tuần', 'cut', 'week')],
        [L_('Quy luật và suy luận', 'seq', 'pattern', 'who', 'compare'), L_('Bài toán thực tế nâng cao', 'queue', 'age', 'cut', 'balance', 'water')]),
      arith: T.lessonPath(
        [L_('Cộng trừ qua 10 bằng hình', 'add0', 'calc'), L_('Phép nhân bằng hình', 'mult'), L_('So sánh, tính nhẩm', 'cmp', 'calc')],
        [L_('Cộng trừ có nhớ, tìm số', 'calc', 'missing'), L_('Bảng nhân, bảng chia', 'mult', 'div'), L_('Toán có lời văn, tiền Việt Nam', 'word', 'money'), L_('Tính nhanh, con vật bí ẩn', 'quick', 'symbols')],
        [L_('Tính toán nâng cao', 'calc', 'missing', 'cmp', 'mult', 'div'), L_('Lời văn, tính nhanh nâng cao', 'word', 'money', 'quick', 'symbols')]),
      number: T.lessonPath(
        [L_('Chục và đơn vị', 'place', 'neighbor'), L_('So sánh, số tròn chục', 'order', 'round'), L_('Chẵn lẻ, số liền nhau', 'evenodd', 'neighbor')],
        [L_('Trăm, chục, đơn vị', 'place', 'neighbor'), L_('So sánh, số tròn trăm', 'order', 'round'), L_('Chẵn lẻ, đếm số', 'evenodd', 'count'), L_('Lập số, tổng các chữ số', 'fromdigits', 'digitsum', 'special')],
        [L_('Chữ số và cách viết số', 'write', 'digitsum', 'fromdigits', 'special'), L_('Suy luận về số', 'order', 'round', 'evenodd', 'count', 'neighbor')]),
      geo: T.lessonPath(
        [L_('Nhận biết hình, khối', 'shape', 'solids'), L_('Đo độ dài, đường gấp khúc', 'length', 'polyline'), L_('Xem đồng hồ', 'clock')],
        [L_('Đường gấp khúc, đoạn thẳng', 'polyline', 'segments'), L_('Đơn vị đo: cm, dm, m, kg, lít', 'length', 'measure'), L_('Đếm tam giác, tứ giác', 'triangles', 'quads', 'shape'), L_('Đồng hồ, lịch', 'clock', 'calendar')],
        [L_('Đo lường, thời gian nâng cao', 'length', 'measure', 'polyline', 'clock', 'calendar'), L_('Đếm hình nâng cao', 'segments', 'triangles', 'quads')]),
      comb: T.lessonPath(
        [L_('Có mấy cách chọn?', 'pick0', 'outfit'), L_('Lập số từ thẻ', 'digits'), L_('Chia kẹo', 'share')],
        [L_('Chọn trang phục, tìm đường', 'outfit', 'roads'), L_('Bắt tay, xếp hàng', 'handshake', 'arrange'), L_('Lập số, tách số, đổi tiền', 'digits', 'split', 'coins'), L_('Tô màu, lấy bi chắc chắn', 'color', 'pigeon')],
        [L_('Đếm cách nâng cao', 'outfit', 'roads', 'handshake', 'arrange', 'color'), L_('Lập số, chia kẹo, trường hợp xấu nhất', 'digits', 'share', 'coins', 'pigeon', 'split')]),
    },
  });
})(window.T);
