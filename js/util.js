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

  const pad2 = n => String(n).padStart(2, '0');
  T.dateKey = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  T.today = () => T.dateKey(new Date());

  // Tuần tính từ thứ Hai đến Chủ nhật (theo giờ máy). Khóa dạng 2026_40 (năm_tuần ISO), tháng dạng 2026_09.
  T.weekDates = function (d) {
    d = d ? new Date(d) : new Date();
    const mon = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => T.dateKey(new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i)));
  };
  T.weekKey = function (d) {
    d = d ? new Date(d) : new Date();
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
    const week = Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7);
    return `${t.getUTCFullYear()}_${pad2(week)}`;
  };
  T.monthKey = function (d) { d = d ? new Date(d) : new Date(); return `${d.getFullYear()}_${pad2(d.getMonth() + 1)}`; };
  // Tổng của một nhật ký theo ngày ({ 'YYYY-MM-DD': số }) trong tuần/tháng hiện tại
  T.periodSum = function (log, period) {
    log = log || {};
    if (period === 'week') return T.weekDates().reduce((a, k) => a + (log[k] || 0), 0);
    const prefix = T.today().slice(0, 8);
    return Object.keys(log).filter(k => k.startsWith(prefix)).reduce((a, k) => a + (log[k] || 0), 0);
  };

  T.fmtTime = function (sec) {
    sec = Math.max(0, Math.round(sec));
    return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
  };
})(window.T);
