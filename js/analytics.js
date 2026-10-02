(function (T) {
  'use strict';
  // Google Analytics 4 qua Firebase Analytics. cloud.js gọi T.Analytics.init() sau khi nạp SDK;
  // sự kiện bắn trước đó được xếp hàng rồi gửi sau. Chưa có cấu hình Firebase (measurementId) thì mọi lệnh bỏ qua.
  // Web cho trẻ em: tắt quảng cáo cá nhân hóa và Google signals, không gửi email/tên — chỉ gửi uid Firebase (ẩn danh).
  // Key Events (đánh dấu trong GA4): xem KEY_EVENTS và scripts/create-key-events.js.
  const queue = [];
  let ga = null, disabled = false, uid;
  const props = {};

  // Bỏ tham số rỗng; chuỗi dài quá 100 ký tự bị GA cắt nên tự cắt trước
  function clean(params) {
    const o = {};
    for (const [k, v] of Object.entries(params || {})) {
      if (v == null || v === '') continue;
      o[k] = typeof v === 'string' ? v.slice(0, 100) : typeof v === 'boolean' ? (v ? 1 : 0) : v;
    }
    return o;
  }

  const A = T.Analytics = {
    // Sự kiện được đánh dấu là Key Event trong GA4
    KEY_EVENTS: ['lesson_complete', 'exam_complete', 'daily_challenge_complete', 'sign_up', 'kid_profile_create'],

    async init(firebase) {
      try {
        if (!firebase.analytics || !(await firebase.analytics.isSupported())) throw new Error('Analytics không được hỗ trợ');
        // Đặt trước khi khởi tạo để áp dụng cho mọi lượt gửi (Firebase dùng lại hàm gtag có sẵn)
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
        window.gtag('set', { allow_google_signals: false, allow_ad_personalization_signals: false });
        ga = firebase.analytics();
        ga.setUserProperties(clean(props));
        if (uid !== undefined) ga.setUserId(uid);
        queue.splice(0).forEach(([n, p]) => ga.logEvent(n, p));
      } catch (e) {
        disabled = true; queue.length = 0;
        console.info('Analytics tắt:', e.message);
      }
    },

    track(name, params) {
      if (disabled) return;
      const p = clean(Object.assign({ grade: T.grade }, params));
      if (ga) ga.logEvent(name, p); else if (queue.length < 100) queue.push([name, p]);
    },

    // Thuộc tính người dùng: lớp, loại tài khoản (khách / phụ huynh), có hồ sơ bé hay không...
    setUser(o) {
      Object.assign(props, o);
      if (ga) ga.setUserProperties(clean(o));
    },
    setUserId(id) { uid = id || null; if (ga) ga.setUserId(uid); },

    // Đổi trang trong ứng dụng (điều hướng bằng #): GA tự gửi page_view lúc mở web, các lần đổi trang sau gửi screen_view
    screen(name, view) { A.track('screen_view', { firebase_screen: name, firebase_screen_class: view }); },
  };
  A.setUser({ grade: String(T.grade), account_type: 'guest' });
})(window.T);
