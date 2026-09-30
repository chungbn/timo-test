(function (T) {
  'use strict';
  // Tài khoản phụ huynh (Firebase Auth) + hồ sơ các bé + đồng bộ tiến độ (Firestore).
  // Firestore: users/{uid}/kids/{kidId} { nickname, avatar, progress, ... }
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
    user: null,
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
  const progressOf = d => ({ stats: d.stats, stars: d.stars, exams: d.exams, best: d.best, speedBest: d.speedBest, daily: d.daily });
  const readProfile = () => { try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); } catch (e) { return null; } };

  // Firestore không nhận giá trị undefined
  const clean = o => JSON.parse(JSON.stringify(o));

  function useGuest() {
    Cloud.kid = null;
    Store.use(Store.GUEST_KEY);
  }

  Cloud.init = async function () {
    if (!cfg) return;
    // Mở lại ngay hồ sơ lần trước từ bộ nhớ máy để không phải chờ mạng
    const p = readProfile();
    if (p) { Store.use(cacheKey(p.uid, p.kidId)); Cloud.kid = { id: p.kidId, nickname: p.nickname, avatar: p.avatar }; }
    try {
      if (!window.firebase) {
        await loadScript(SDK + 'firebase-app-compat.js');
        await Promise.all([loadScript(SDK + 'firebase-auth-compat.js'), loadScript(SDK + 'firebase-firestore-compat.js')]);
      }
      firebase.initializeApp(cfg);
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
    auth.getRedirectResult().catch(e => { Cloud.lastError = errorText(e); emitChange(); });
    auth.onAuthStateChanged(async user => {
      Cloud.user = user;
      if (!user) {
        Cloud.kids = [];
        useGuest();
        localStorage.removeItem(PROFILE_KEY);
      } else {
        try {
          await db.collection('users').doc(user.uid).set({ email: user.email || '', name: user.displayName || '', lastLogin: now() }, { merge: true });
          await Cloud.refreshKids();
          const prof = readProfile();
          const kid = prof && prof.uid === user.uid && Cloud.kids.find(k => k.id === prof.kidId);
          if (kid) await Cloud.selectKid(kid.id);
          else { Cloud.kid = null; Store.use(Store.GUEST_KEY); }
        } catch (e) { console.error(e); Cloud.lastError = errorText(e); }
      }
      Cloud.ready = true;
      emitChange();
    });

    Store.onChange = onStoreChange;
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') Cloud.flush(); });
    window.addEventListener('pagehide', () => Cloud.flush());
  };

  // ---------------- đăng nhập ----------------
  Cloud.signInGoogle = async function () {
    const provider = new firebase.auth.GoogleAuthProvider();
    try { await auth.signInWithPopup(provider); }
    catch (e) {
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') return auth.signInWithRedirect(provider);
      throw new Error(errorText(e));
    }
  };
  Cloud.signInEmail = async (email, pass) => { try { await auth.signInWithEmailAndPassword(email, pass); } catch (e) { throw new Error(errorText(e)); } };
  Cloud.signUpEmail = async (email, pass) => { try { await auth.createUserWithEmailAndPassword(email, pass); } catch (e) { throw new Error(errorText(e)); } };
  Cloud.resetPassword = async email => { try { await auth.sendPasswordResetEmail(email); } catch (e) { throw new Error(errorText(e)); } };
  Cloud.signOut = async function () {
    await Cloud.flush();
    localStorage.removeItem(PROFILE_KEY);
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
    Store.use(cacheKey(uid, id), merged);
    Cloud.kid = kid;
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ uid, kidId: id, nickname: kid.nickname, avatar: kid.avatar }));
    emitChange();
  };

  Cloud.leaveKid = async function () {
    await Cloud.flush();
    localStorage.removeItem(PROFILE_KEY);
    Cloud.kid = null;
    Store.use(Store.GUEST_KEY);
    emitChange();
  };

  // importGuest: chuyển tiến độ đang học ở chế độ khách (trên máy này) vào hồ sơ mới
  Cloud.addKid = async function ({ nickname, avatar, importGuest }) {
    const ref = kidsCol().doc();
    const guest = Store.read(Store.GUEST_KEY);
    const progress = importGuest ? progressOf(guest) : progressOf(Store.blank());
    await ref.set(Object.assign(clean({ nickname, avatar, progress }), { createdAt: now(), updatedAt: now() }));
    if (importGuest && guest.mistakes.length) {
      const batch = db.batch();
      guest.mistakes.forEach(m => batch.set(ref.collection('mistakes').doc(String(m.k)), clean(m)));
      await batch.commit();
    }
    if (importGuest) { Store.use(Store.GUEST_KEY, Store.blank()); }
    await Cloud.refreshKids();
    await Cloud.selectKid(ref.id);
    return ref.id;
  };

  Cloud.updateKid = async function (id, { nickname, avatar }) {
    await kidRef(id).update({ nickname, avatar, updatedAt: now() });
    await Cloud.refreshKids();
    if (Cloud.kid && Cloud.kid.id === id) {
      Object.assign(Cloud.kid, { nickname, avatar });
      const p = readProfile();
      if (p) localStorage.setItem(PROFILE_KEY, JSON.stringify(Object.assign(p, { nickname, avatar })));
    }
    emitChange();
  };

  Cloud.deleteKid = async function (id) {
    const ms = await kidRef(id).collection('mistakes').get();
    const batch = db.batch();
    ms.docs.forEach(d => batch.delete(d.ref));
    batch.delete(kidRef(id));
    await batch.commit();
    try { localStorage.removeItem(cacheKey(Cloud.user.uid, id)); } catch (e) { /* bỏ qua */ }
    if (Cloud.kid && Cloud.kid.id === id) { localStorage.removeItem(PROFILE_KEY); Cloud.kid = null; Store.use(Store.GUEST_KEY); }
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
      if (Cloud.kid && ref.id === Cloud.kid.id) {
        // Gộp lần nữa với dữ liệu hiện tại: bé có thể đã làm thêm câu trong lúc đang gửi
        const cur = Store.data, next = Store.merge(cur, merged);
        next.mistakes = cur.mistakes;
        Store.use(Store.key, next);
      }
    } catch (e) {
      // Mất mạng: ghi thẳng, Firestore sẽ tự gửi khi có mạng trở lại
      ref.update({ progress: clean(progressOf(local)), updatedAt: now() }).catch(err => { dirty = true; console.warn(err); });
    }
  };

  // ---------------- báo cáo cho phụ huynh ----------------
  Cloud.kidSummary = function (kid) {
    const d = Object.assign(Store.blank(), kid.progress || {});
    if (Cloud.kid && Cloud.kid.id === kid.id) Object.assign(d, progressOf(Store.data));
    const stats = Object.values(d.stats);
    const done = stats.reduce((a, s) => a + s.done, 0), correct = stats.reduce((a, s) => a + s.correct, 0);
    const weak = T.TOPICS.map(t => ({ t, s: d.stats[t.id] })).filter(x => x.s && x.s.done >= 5)
      .sort((a, b) => a.s.correct / a.s.done - b.s.correct / b.s.done)[0];
    return {
      stars: Store.totalStars(d), done, pct: done ? Math.round(correct / done * 100) : 0,
      exams: d.exams.length, bestExam: d.exams.length ? Math.max(...d.exams.map(e => e.score)) : null,
      lastExam: d.exams[0] || null, streak: Store.streak(d), weak: weak ? weak.t : null,
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
