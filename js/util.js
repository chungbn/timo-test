window.T = window.T || {};
(function (T) {
  'use strict';

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Bộ sinh số ngẫu nhiên; truyền seed để tạo đề cố định (Đề số 1, 2, ...)
  T.makeRng = function (seed) {
    const r = seed == null ? Math.random : mulberry32(seed);
    const R = {
      next: r,
      int(a, b) { return a + Math.floor(r() * (b - a + 1)); },
      pick(arr) { return arr[Math.floor(r() * arr.length)]; },
      chance(p) { return r() < p; },
      shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(r() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      },
      sample(arr, k) { return R.shuffle(arr).slice(0, k); },
    };
    return R;
  };

  T.hashStr = function (s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };

  T.esc = function (s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  };

  T.stripHtml = function (html) {
    const d = document.createElement('div');
    d.innerHTML = html;
    return d.textContent || '';
  };

  T.today = function () {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  T.fmtTime = function (sec) {
    sec = Math.max(0, Math.round(sec));
    return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
  };
})(window.T);
