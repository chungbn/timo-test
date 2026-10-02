(function (T) {
  'use strict';
  // Tài khoản phụ huynh (Firebase Auth) + hồ sơ các bé + đồng bộ tiến độ (Firestore).
  // Firestore: users/{uid}/kids/{kidId} { nickname, avatar, grade (lớp 1 – 5), progress, ... }
  //            users/{uid}/kids/{kidId}/mistakes/{k} { k, q, at }
  // Chưa có FIREBASE_CONFIG thì mọi thứ tắt, web chạy ở chế độ khách như cũ.
  const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
  const PROFILE_KEY = 'timo1-profile';
  const Store = T.Store;
  const cfg = window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey ? window.FIREBASE_CONFIG : null;

  let auth, db;
  let listeners = [];
  let flushTimer = null, dirty = false;

  const Cloud = T.Cloud = {
    enabled: !!cfg,
    ready: false,   // đã biết trạng thái đăng nhập
    loading: false, // đang tải dữ liệu của tài khoản vừa đăng nhập
    user: null,
    parent: {},     // users/{uid}: { pinHash, ... }
    justSignedIn: false, // vừa đăng nhập bằng mật khẩu/Google: coi như phụ huynh đang cầm máy
    kids: [],
    kid: null,      // hồ sơ bé đang học
    subscribe(fn) { listeners.push(fn); },
  };
  const emitChange = () => listeners.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });

  const loadScript = src => new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = () => rej(new Error('Không tải được ' + src));
    document.head.appendChild(s);
  });

  const cacheKey = (uid, kidId) => `${Store.GUEST_KEY}:${uid}:${kidId}`;
  const kidsCol = () => db.collection('users').doc(Cloud.user.uid).collection('kids');
  const kidRef = id => kidsCol().doc(id);
  const toDate = ts => (ts && ts.toDate ? ts.toDate() : ts ? new Date(ts) : null);
  const now = () => firebase.firestore.FieldValue.serverTimestamp();
  const progressOf = d => ({
    stats: d.stats, stars: d.stars, exams: d.exams, best: d.best, speedBest: d.speedBest, daily: d.daily,
    starLog: d.starLog || {}, doneLog: d.doneLog || {}, bestStreak: d.bestStreak || 0, bestExam: d.bestExam || 0,
    logsSince: d.logsSince || null,
  });
  const readProfile = () => { try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); } catch (e) { return null; } };

  // Firestore không nhận giá trị undefined
  const clean = o => JSON.parse(JSON.stringify(o));

  function useGuest() {
    Cloud.kid = null;
    T.setGrade(T.guestGrade());
    Store.use(Store.GUEST_KEY);
  }
  // Lưu hồ sơ đang học trên máy (mở lại ngay lần sau, không phải chờ mạng)
  const saveProfile = (uid, kid) => localStorage.setItem(PROFILE_KEY, JSON.stringify({ uid, kidId: kid.id, nickname: kid.nickname, avatar: kid.avatar, grade: kid.grade || 1 }));

  Cloud.init = async function () {
    if (!cfg) return;
    // Mở lại ngay hồ sơ lần trước từ bộ nhớ máy để không phải chờ mạng
    const p = readProfile();
    if (p) { Store.use(cacheKey(p.uid, p.kidId)); Cloud.kid = { id: p.kidId, nickname: p.nickname, avatar: p.avatar, grade: p.grade || 1 }; T.setGrade(p.grade); }
    try {
      if (!window.firebase) {
        await loadScript(SDK + 'firebase-app-compat.js');
        await Promise.all([loadScript(SDK + 'firebase-auth-compat.js'), loadScript(SDK + 'firebase-firestore-compat.js'),
          cfg.measurementId ? loadScript(SDK + 'firebase-analytics-compat.js').catch(() => { /* bị chặn quảng cáo: bỏ qua */ }) : null]);
      }
      firebase.initializeApp(cfg);
      if (cfg.measurementId) T.Analytics.init(firebase); else T.Analytics.init({});
      auth = firebase.auth();
      auth.languageCode = 'vi';
      db = firebase.firestore();
      db.enablePersistence({ synchronizeTabs: true }).catch(() => { /* trình duyệt không hỗ trợ: vẫn chạy online */ });
    } catch (e) {
      console.error(e);
      Cloud.enabled = false; Cloud.ready = true;
      if (Cloud.kid) useGuest();
      emitChange();
      return;
    }
    auth.getRedirectResult().then(r => { if (r && r.user) { Cloud.justSignedIn = true; trackAuth(r, 'google'); } }, e => { Cloud.lastError = errorText(e); emitChange(); });
    auth.onAuthStateChanged(async user => {
      Cloud.user = user;
      T.Analytics.setUserId(user ? user.uid : null);
      // Đang tải dữ liệu phụ huynh (mã PIN, hồ sơ các bé): giao diện chờ, tránh ghi đè lẫn nhau
      Cloud.loading = !!user;
      if (user) emitChange();
      if (!user) {
        Cloud.kids = [];
        Cloud.parent = {};
        useGuest();
        localStorage.removeItem(PROFILE_KEY);
      } else {
        try {
          const uref = db.collection('users').doc(user.uid);
          await uref.set({ email: user.email || '', name: user.displayName || '', lastLogin: now() }, { merge: true });
          Cloud.parent = (await uref.get()).data() || {};
          await Cloud.refreshKids();
          const prof = readProfile();
          const kid = prof && prof.uid === user.uid && Cloud.kids.find(k => k.id === prof.kidId);
          if (kid) await Cloud.selectKid(kid.id);
          else useGuest();
        } catch (e) { console.error(e); Cloud.lastError = errorText(e); }
      }
      Cloud.loading = false;
      Cloud.ready = true;
      T.Analytics.setUser({ account_type: user ? 'parent' : 'guest', kid_profiles: user ? String(Cloud.kids.length) : '0', grade: String(T.grade) });
      emitChange();
    });

    Store.onChange = onStoreChange;
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') Cloud.flush(); });
    window.addEventListener('pagehide', () => Cloud.flush());
  };

  // ---------------- đăng nhập ----------------
  // sign_up khi tài khoản vừa được tạo (cả Google lần đầu), còn lại là login
  function trackAuth(cred, method) {
    const isNew = cred && cred.additionalUserInfo && cred.additionalUserInfo.isNewUser;
    T.Analytics.track(isNew ? 'sign_up' : 'login', { method });
  }
  Cloud.signInGoogle = async function () {
    const provider = new firebase.auth.GoogleAuthProvider();
    try { trackAuth(await auth.signInWithPopup(provider), 'google'); Cloud.justSignedIn = true; }
    catch (e) {
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') return auth.signInWithRedirect(provider);
      throw new Error(errorText(e));
    }
  };
  Cloud.signInEmail = async (email, pass) => { try { trackAuth(await auth.signInWithEmailAndPassword(email, pass), 'email'); Cloud.justSignedIn = true; } catch (e) { throw new Error(errorText(e)); } };
  Cloud.signUpEmail = async (email, pass) => { try { trackAuth(await auth.createUserWithEmailAndPassword(email, pass), 'email'); Cloud.justSignedIn = true; } catch (e) { throw new Error(errorText(e)); } };
  Cloud.resetPassword = async email => { try { await auth.sendPasswordResetEmail(email); } catch (e) { throw new Error(errorText(e)); } };
  // ---------------- mã PIN phụ huynh ----------------
  // PIN 4 số khóa khu vực phụ huynh để bé không tự xóa dữ liệu. Lưu dạng băm SHA-256 (kèm uid) trong users/{uid}.
  async function hashPin(pin) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`timo-pin:${Cloud.user.uid}:${pin}`));
    return [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, '0')).join('');
  }
  Cloud.hasPin = () => !!(Cloud.parent && Cloud.parent.pinHash);
  Cloud.checkPin = async pin => Cloud.hasPin() && (await hashPin(pin)) === Cloud.parent.pinHash;
  Cloud.setPin = async function (pin) {
    T.Analytics.track('parent_pin_set', { first_time: !Cloud.hasPin() });
    const pinHash = await hashPin(pin);
    await db.collection('users').doc(Cloud.user.uid).set({ pinHash, pinUpdatedAt: now() }, { merge: true });
    Cloud.parent = Object.assign({}, Cloud.parent, { pinHash });
  };
  // Tài khoản đăng nhập bằng mật khẩu hay Google (để xác nhận lại khi quên PIN)
  Cloud.usesPassword = () => !!(auth.currentUser && auth.currentUser.providerData.some(p => p.providerId === 'password'));
  Cloud.reauth = async function (password) {
    const u = auth.currentUser;
    try {
      if (Cloud.usesPassword()) await u.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(u.email, password));
      else await u.reauthenticateWithPopup(new firebase.auth.GoogleAuthProvider());
    } catch (e) {
      throw new Error(e.code === 'auth/user-mismatch' ? 'Vui lòng chọn đúng tài khoản Google đang đăng nhập.' : errorText(e));
    }
  };

  Cloud.signOut = async function () {
    T.Analytics.track('logout');
    await Cloud.flush();
    localStorage.removeItem(PROFILE_KEY);
    Cloud.justSignedIn = false;
    await auth.signOut();
  };

  // ---------------- hồ sơ bé ----------------
  Cloud.refreshKids = async function () {
    const snap = await kidsCol().get();
    Cloud.kids = snap.docs.map(d => Object.assign({ id: d.id }, d.data()))
      .sort((a, b) => (toDate(a.createdAt) || 0) - (toDate(b.createdAt) || 0));
    return Cloud.kids;
  };

  Cloud.selectKid = async function (id) {
    await Cloud.flush();
    const uid = Cloud.user.uid;
    const [snap, ms] = await Promise.all([kidRef(id).get(), kidRef(id).collection('mistakes').get()]);
    if (!snap.exists) throw new Error('Không tìm thấy hồ sơ.');
    const kid = Object.assign({ id }, snap.data());
    const local = Store.read(cacheKey(uid, id));
    const merged = Store.merge(local, kid.progress || {});
    // Sổ tay lỗi sai: Firestore là nguồn chính (đã gồm cả thay đổi chờ gửi khi offline)
    merged.mistakes = ms.docs.map(d => d.data()).sort((a, b) => b.at - a.at).slice(0, 80);
    const migrated = Store.use(cacheKey(uid, id), merged);
    Cloud.kid = kid;
    T.setGrade(kid.grade);
    saveProfile(uid, kid);
    T.Analytics.setUser({ grade: String(T.grade) });
    T.Analytics.track('kid_profile_select');
    if (migrated) { dirty = true; schedule(800); } // gửi nhật ký vừa bổ sung lên mạng (kèm bảng xếp hạng)
    else writeLeaderboard(kid, Store.data); // cập nhật kỳ tuần/tháng mới
    emitChange();
  };

  Cloud.leaveKid = async function () {
    T.Analytics.track('guest_mode_select');
    await Cloud.flush();
    localStorage.removeItem(PROFILE_KEY);
    useGuest();
    emitChange();
  };

  // importGuest: chuyển tiến độ đang học ở chế độ khách (trên máy này) vào hồ sơ mới
  Cloud.addKid = async function ({ nickname, avatar, grade, importGuest }) {
    const ref = kidsCol().doc();
    const guest = Store.read(Store.GUEST_KEY);
    const progress = importGuest ? progressOf(guest) : progressOf(Store.blank());
    grade = T.validGrade(grade);
    await ref.set(Object.assign(clean({ nickname, avatar, grade, progress }), { createdAt: now(), updatedAt: now() }));
    if (importGuest && guest.mistakes.length) {
      const batch = db.batch();
      guest.mistakes.forEach(m => batch.set(ref.collection('mistakes').doc(String(m.k)), clean(m)));
      await batch.commit();
    }
    if (importGuest) { Store.use(Store.GUEST_KEY, Store.blank()); }
    // Hồ sơ mới: đã có sẵn dữ liệu nên chọn luôn, không cần đọc lại từ server
    await Cloud.flush();
    const kid = { id: ref.id, nickname, avatar, grade, progress, createdAt: new Date(), updatedAt: new Date() };
    Cloud.kids.push(kid);
    const data = Object.assign(Store.blank(), progress, { mistakes: importGuest ? guest.mistakes : [] });
    Store.use(cacheKey(Cloud.user.uid, ref.id), data);
    Cloud.kid = kid;
    T.setGrade(grade);
    saveProfile(Cloud.user.uid, kid);
    T.Analytics.setUser({ grade: String(grade), kid_profiles: String(Cloud.kids.length) });
    T.Analytics.track('kid_profile_create', { imported_guest: !!importGuest, kid_profiles: Cloud.kids.length });
    emitChange();
    return ref.id;
  };

  Cloud.updateKid = async function (id, { nickname, avatar, grade }) {
    grade = T.validGrade(grade);
    const before = Cloud.kids.find(x => x.id === id);
    const oldGrade = before ? T.validGrade(before.grade) : grade;
    await kidRef(id).update({ nickname, avatar, grade, updatedAt: now() });
    await Cloud.refreshKids();
    const k = Cloud.kids.find(x => x.id === id);
    if (k) writeLeaderboard(k, Cloud.kid && Cloud.kid.id === id ? Store.data : k.progress);
    if (Cloud.kid && Cloud.kid.id === id) {
      Object.assign(Cloud.kid, { nickname, avatar, grade });
      T.setGrade(grade);
      saveProfile(Cloud.user.uid, Cloud.kid);
      T.Analytics.setUser({ grade: String(grade) });
    }
    T.Analytics.track('kid_profile_update', { grade_changed: oldGrade !== grade });
    if (oldGrade !== grade) T.Analytics.track('grade_change', { grade, from_grade: oldGrade, source: 'parent' });
    emitChange();
  };

  // Xóa toàn bộ tiến độ học tập của một bé (giữ lại hồ sơ)
  Cloud.resetKid = async function (id) {
    T.Analytics.track('kid_progress_reset');
    if (Cloud.kid && Cloud.kid.id === id) { Store.reset(); dirty = false; }
    else {
      await kidRef(id).update({ progress: progressOf(Store.blank()), updatedAt: now() });
      await deleteAllMistakes(kidRef(id));
      try { localStorage.removeItem(cacheKey(Cloud.user.uid, id)); } catch (e) { /* bỏ qua */ }
    }
    const k = Cloud.kids.find(x => x.id === id);
    if (k) { k.progress = progressOf(Store.blank()); await writeLeaderboard(k, Store.blank()); }
    emitChange();
  };

  Cloud.deleteKid = async function (id) {
    T.Analytics.track('kid_profile_delete');
    const ms = await kidRef(id).collection('mistakes').get();
    const batch = db.batch();
    ms.docs.forEach(d => batch.delete(d.ref));
    batch.delete(kidRef(id));
    await batch.commit();
    await lbRef(id).delete().catch(() => { /* chưa có trên bảng */ });
    try { localStorage.removeItem(cacheKey(Cloud.user.uid, id)); } catch (e) { /* bỏ qua */ }
    if (Cloud.kid && Cloud.kid.id === id) { localStorage.removeItem(PROFILE_KEY); useGuest(); }
    await Cloud.refreshKids();
    emitChange();
  };

  // ---------------- đồng bộ ----------------
  // Mỗi câu trả lời chỉ đánh dấu "cần gửi" (gửi gộp sau 20 giây); hết bài, nộp bài thi... thì gửi ngay.
  function onStoreChange(kind, payload) {
    if (!Cloud.user || !Cloud.kid || !db) return;
    const ref = kidRef(Cloud.kid.id);
    const warn = e => console.warn('Đồng bộ thất bại', e);
    if (kind === 'answer') { dirty = true; schedule(20000); }
    else if (kind === 'progress') { dirty = true; schedule(800); }
    else if (kind === 'mistake-add') ref.collection('mistakes').doc(String(payload.k)).set(clean(payload)).catch(warn);
    else if (kind === 'mistake-remove') ref.collection('mistakes').doc(String(payload)).delete().catch(warn);
    else if (kind === 'mistakes-clear') deleteAllMistakes(ref).catch(warn);
    else if (kind === 'reset') {
      dirty = false;
      ref.update({ progress: progressOf(Store.blank()), updatedAt: now() }).catch(warn);
      deleteAllMistakes(ref).catch(warn);
    }
  }

  async function deleteAllMistakes(ref) {
    const ms = await ref.collection('mistakes').get();
    const batch = db.batch();
    ms.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }

  function schedule(ms) {
    if (flushTimer) { if (ms >= 20000) return; clearTimeout(flushTimer); }
    flushTimer = setTimeout(() => Cloud.flush(), ms);
  }

  Cloud.flush = async function () {
    if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
    if (!dirty || !Cloud.user || !Cloud.kid || !db) return;
    dirty = false;
    const ref = kidRef(Cloud.kid.id), local = Store.data;
    try {
      // Gộp với bản trên mạng (có thể máy khác vừa ghi) rồi mới ghi đè
      const merged = await db.runTransaction(async tx => {
        const snap = await tx.get(ref);
        const m = Store.merge(local, (snap.exists && snap.data().progress) || {});
        tx.update(ref, { progress: clean(progressOf(m)), updatedAt: now() });
        return m;
      });
      if (Cloud.kid && ref.id === Cloud.kid.id) writeLeaderboard(Cloud.kid, merged);
      if (Cloud.kid && ref.id === Cloud.kid.id) {
        // Gộp lần nữa với dữ liệu hiện tại: bé có thể đã làm thêm câu trong lúc đang gửi
        const cur = Store.data, next = Store.merge(cur, merged);
        next.mistakes = cur.mistakes;
        Store.use(Store.key, next);
      }
    } catch (e) {
      // Mất mạng: ghi thẳng, Firestore sẽ tự gửi khi có mạng trở lại
      ref.update({ progress: clean(progressOf(local)), updatedAt: now() }).catch(err => { dirty = true; console.warn(err); });
      if (Cloud.kid && ref.id === Cloud.kid.id) writeLeaderboard(Cloud.kid, local);
    }
  };

  // ---------------- bảng xếp hạng ----------------
  // leaderboard/{uid}_{kidId}: chỉ tên gọi, con vật đại diện và các con số. Mọi người đọc được; chỉ phụ huynh ghi được của con mình.
  // Chỉ số theo tuần/tháng lưu ở trường có tên theo kỳ (ws_2026_40, md_2026_09...) để truy vấn bằng chỉ mục tự động của Firestore;
  // mỗi lần ghi là ghi đè cả bản ghi nên trường của kỳ cũ tự biến mất.
  const lbRef = kidId => db.collection('leaderboard').doc(`${Cloud.user.uid}_${kidId}`);
  const onBoard = kid => kid.onLeaderboard !== false;
  function lbEntry(kid, d) {
    d = Object.assign(Store.blank(), d);
    const wk = T.weekKey(), mk = T.monthKey();
    const e = {
      uid: Cloud.user ? Cloud.user.uid : '', kidId: kid.id, nickname: kid.nickname, avatar: kid.avatar || '🙂', grade: kid.grade || 1,
      allStars: Store.totalStars(d), allDone: Object.values(d.stats).reduce((a, s) => a + (s.done || 0), 0),
      bestStreak: Store.bestStreakOf(d), bestExam: Store.bestExamOf(d), updatedAt: now(),
    };
    const add = (k, v) => { if (v > 0) e[k] = v; };
    add(`ws_${wk}`, T.periodSum(d.starLog, 'week') + Store.bonusStars(d, 'week')); add(`wd_${wk}`, T.periodSum(d.doneLog, 'week'));
    add(`ms_${mk}`, T.periodSum(d.starLog, 'month') + Store.bonusStars(d, 'month')); add(`md_${mk}`, T.periodSum(d.doneLog, 'month'));
    return e;
  }
  function writeLeaderboard(kid, d) {
    if (!db || !Cloud.user || !kid) return Promise.resolve();
    const p = onBoard(kid) ? lbRef(kid.id).set(lbEntry(kid, d)) : lbRef(kid.id).delete();
    return p.catch(e => console.warn('Không cập nhật được bảng xếp hạng', e));
  }
  // Tên trường cần sắp xếp cho từng bảng
  Cloud.lbField = function (period, metric) {
    if (period === 'all') return { stars: 'allStars', done: 'allDone', streak: 'bestStreak', exam: 'bestExam' }[metric];
    const key = period === 'week' ? T.weekKey() : T.monthKey();
    return `${period === 'week' ? 'w' : 'm'}${metric === 'stars' ? 's' : 'd'}_${key}`;
  };
  const lbCache = {};
  Cloud.fetchLeaderboard = async function (field, limit = 50) {
    const c = lbCache[field];
    if (c && Date.now() - c.at < 60000) return c.rows;
    if (!db) throw new Error('Tài khoản chưa được bật.');
    try {
      const snap = await db.collection('leaderboard').orderBy(field, 'desc').limit(limit).get();
      const rows = snap.docs.map(d => Object.assign({ id: d.id }, d.data())).filter(r => (r[field] || 0) > 0);
      lbCache[field] = { at: Date.now(), rows };
      return rows;
    } catch (e) { throw new Error(errorText(e)); }
  };
  Cloud.lbEntryFor = (kid, d) => lbEntry(kid, d);
  Cloud.setLeaderboard = async function (id, on) {
    T.Analytics.track('leaderboard_visibility', { visible: on });
    await kidRef(id).update({ onLeaderboard: on, updatedAt: now() });
    const kid = Cloud.kids.find(k => k.id === id);
    if (kid) kid.onLeaderboard = on;
    if (Cloud.kid && Cloud.kid.id === id) Cloud.kid.onLeaderboard = on;
    const d = Cloud.kid && Cloud.kid.id === id ? Store.data : (kid && kid.progress) || {};
    Object.keys(lbCache).forEach(k => delete lbCache[k]);
    await writeLeaderboard(kid, d);
    emitChange();
  };

  // ---------------- báo cáo cho phụ huynh ----------------
  Cloud.kidSummary = function (kid) {
    const d = Object.assign(Store.blank(), kid.progress || {});
    if (Cloud.kid && Cloud.kid.id === kid.id) Object.assign(d, progressOf(Store.data));
    const stats = Object.values(d.stats), grade = T.validGrade(kid.grade);
    const done = stats.reduce((a, s) => a + s.done, 0), correct = stats.reduce((a, s) => a + s.correct, 0);
    // Chủ đề cần luyện thêm: theo thống kê của lớp bé đang học
    const weak = T.TOPICS.map(t => ({ t, s: d.stats[T.statKey(t.id, grade)] })).filter(x => x.s && x.s.done >= 5)
      .sort((a, b) => a.s.correct / a.s.done - b.s.correct / b.s.done)[0];
    return {
      grade, stars: Store.totalStars(d), lessonStars: Store.gradeLessonStars(d, grade), done, pct: done ? Math.round(correct / done * 100) : 0,
      exams: d.exams.length, bestExam: d.exams.length ? Math.max(...d.exams.map(e => e.score)) : null,
      lastExam: d.exams[0] || null, streak: Store.streak(d), bestStreak: Store.bestStreakOf(d), weak: weak ? weak.t : null,
      updatedAt: toDate(kid.updatedAt),
    };
  };

  function errorText(e) {
    const m = {
      'auth/invalid-email': 'Email không hợp lệ.',
      'auth/user-not-found': 'Email hoặc mật khẩu không đúng.',
      'auth/wrong-password': 'Email hoặc mật khẩu không đúng.',
      'auth/invalid-credential': 'Email hoặc mật khẩu không đúng.',
      'auth/invalid-login-credentials': 'Email hoặc mật khẩu không đúng.',
      'auth/email-already-in-use': 'Email này đã có tài khoản. Hãy chọn "Đăng nhập".',
      'auth/weak-password': 'Mật khẩu cần ít nhất 6 ký tự.',
      'auth/too-many-requests': 'Thử quá nhiều lần. Vui lòng đợi một lát rồi thử lại.',
      'auth/popup-closed-by-user': 'Cửa sổ đăng nhập đã bị đóng.',
      'auth/cancelled-popup-request': 'Cửa sổ đăng nhập đã bị đóng.',
      'auth/network-request-failed': 'Không có kết nối mạng.',
      'auth/unauthorized-domain': 'Tên miền này chưa được cho phép trong Firebase (Authentication → Settings → Authorized domains).',
      'auth/configuration-not-found': 'Firebase Authentication chưa được bật (Authentication → Get started, rồi bật Google và Email/Password).',
      'auth/operation-not-allowed': 'Cách đăng nhập này chưa được bật trong Firebase (Authentication → Sign-in method).',
      'permission-denied': 'Không có quyền truy cập dữ liệu. Kiểm tra lại Firestore Rules.',
    };
    return m[e && e.code] || (e && e.message) || 'Có lỗi xảy ra, vui lòng thử lại.';
  }
})(window.T);
