/* Dùng chung: chọn phần tử, gọi API, toast xếp chồng, modal, định dạng, localStorage, âm báo. */
'use strict';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const STATUS = {queued: 'Đang chờ', running: 'Đang tạo', done: '🏆 Xong', error: 'Lỗi', cancelled: 'Đã huỷ', interrupted: 'Gián đoạn'};
const PSTATE = {off: 'Nghỉ', starting: 'Đang mở', idle: 'Sẵn sàng', busy: 'Đang tạo', login: 'Đang đăng nhập'};
const KIND = {login: 'Đăng nhập tài khoản', check: 'Kiểm tra tài khoản', cookies: 'Nạp cookie'};
const BRIDGE = window.dolaStudio || {token: new URLSearchParams(location.search).get('t') || '', version: ''};
const withToken = url => url + (url.includes('?') ? '&' : '?') + 't=' + encodeURIComponent(BRIDGE.token);

/** Trạng thái dùng chung giữa các module. */
const S = {
  meta: null, profiles: [], jobs: [], assets: [], tab: 'video',
  selected: new Set(), filter: 'all', q: '', accf: '', sort: 'new',
  /** Nick nào đang được kéo cửa sổ Dola ra (nút «Xem Dola» trên job đang chạy). */
  winShown: new Set(),
  accsort: {key: '', asc: true}, accq: '',
};
/** main.js gắn App.refresh; module khác gọi sau mỗi thao tác. */
const App = {refresh: async () => {}};

async function api(method, url, body) {
  const r = await fetch(url, {method, headers: {'Content-Type': 'application/json', 'X-Token': BRIDGE.token},
                              body: body === undefined ? undefined : JSON.stringify(body)});
  const text = await r.text();
  let data = {}; try { data = JSON.parse(text); } catch (e) { data = {detail: text}; }
  if (!r.ok) throw new Error(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail || data));
  return data;
}

// ------------------------------------------------------------ toast (xếp chồng, tối đa 3)
function toast(msg, kind) {
  const box = $('#toasts');
  const t = document.createElement('div');
  t.className = 'toast' + (kind === 'err' ? ' err' : '');
  t.textContent = msg;
  t.addEventListener('click', () => t.remove());
  box.appendChild(t);
  while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => t.remove(), kind === 'err' ? 6000 : 4000);
}

// ------------------------------------------------------------ modal
const modalStack = [];
function openModal(el) {
  el.hidden = false;
  modalStack.push(el);
  const first = el.querySelector('input:not([type=hidden]):not([type=checkbox]), textarea, select, button.primary');
  if (first) setTimeout(() => first.focus(), 30);
}
function closeModal(el) {
  el.hidden = true;
  const i = modalStack.indexOf(el); if (i >= 0) modalStack.splice(i, 1);
  el.dispatchEvent(new CustomEvent('modal-close'));
}
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || !modalStack.length) return;
  const top = modalStack[modalStack.length - 1];
  if (top.dataset.locked) return;          // hộp license: không có đường tắt
  e.preventDefault(); closeModal(top);
});
$$('.overlay').forEach(ov => {
  ov.addEventListener('mousedown', e => { if (e.target === ov && !ov.dataset.locked) closeModal(ov); });
  ov.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => closeModal(ov)));
});

/** Hộp xác nhận dùng chung. Trả về true khi bấm nút chính. */
function confirmBox({title, msg, ok = 'Đồng ý', danger = false}) {
  return new Promise(resolve => {
    const box = $('#confirmbox');
    $('#cftitle').textContent = title; $('#cfmsg').textContent = msg; $('#cferr').textContent = '';
    const okb = $('#cfok'); okb.textContent = ok; okb.className = 'btn ' + (danger ? 'danger' : 'primary');
    const done = v => { okb.onclick = null; $('#cfcancel').onclick = null; box.removeEventListener('modal-close', onClose); closeModal(box); resolve(v); };
    const onClose = () => { okb.onclick = null; resolve(false); };
    okb.onclick = () => done(true);
    $('#cfcancel').onclick = () => done(false);
    box.addEventListener('modal-close', onClose, {once: true});
    openModal(box);
    setTimeout(() => okb.focus(), 30);
  });
}

// ------------------------------------------------------------ định dạng
const pad2 = n => String(n).padStart(2, '0');
const fmtDMY = iso => { const d = new Date(iso); return !iso || isNaN(d) ? '' : `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`; };
const fmtHMDM = iso => { const d = new Date(iso); return !iso || isNaN(d) ? '—' : `${pad2(d.getHours())}:${pad2(d.getMinutes())} ${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`; };
const fmtHM = iso => { const d = new Date(iso); return !iso || isNaN(d) ? '' : `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
const fmtTime = iso => (iso || '').replace('T', ' ').slice(5, 16).replace('-', '/');
const elapsedSec = iso => iso ? Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000)) : 0;
const elapsed = iso => { const s = elapsedSec(iso); return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`; };
const fmtMin = s => s < 60 ? `${Math.max(1, Math.round(s))} giây` : s < 3600 ? `${Math.round(s / 60)} phút` : `${(s / 3600).toFixed(1)} giờ`;
function relTime(iso) {
  if (!iso) return '';
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (isNaN(s)) return '';
  if (s < 60) return 'vừa xong';
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
  return fmtDMY(iso);
}

// ------------------------------------------------------------ localStorage (có thể bị chặn)
const lsGet = (k, def) => { try { const v = localStorage.getItem(k); return v === null ? def : JSON.parse(v); } catch (e) { return def; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

// ------------------------------------------------------------ âm báo (WebAudio, không cần file)
let audioCtx = null;
function beep(kind) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const notes = kind === 'err' ? [[330, 0], [220, .18]] : [[660, 0], [880, .14], [1100, .28]];
    for (const [f, at] of notes) {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, audioCtx.currentTime + at);
      g.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + at + 0.16);
      o.connect(g).connect(audioCtx.destination);
      o.start(audioCtx.currentTime + at); o.stop(audioCtx.currentTime + at + 0.2);
    }
  } catch (e) { /* máy không có âm thanh */ }
}

// ------------------------------------------------------------ ảnh
const readAsDataUrl = file => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(file); });
/** Thu nhỏ ảnh về <= max px cạnh dài, JPEG 0.85 (PNG giữ PNG nếu nhỏ). Ảnh 8 MB từ điện thoại không cần gửi nguyên. */
function shrinkImage(dataUrl, max = 1280) {
  return new Promise(resolve => {
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, max / Math.max(im.width, im.height));
      if (k === 1 && dataUrl.length < 1.5e6) return resolve(dataUrl);
      const c = document.createElement('canvas');
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      resolve(c.toDataURL('image/jpeg', 0.85));
    };
    im.onerror = () => resolve(dataUrl);
    im.src = dataUrl;
  });
}
async function fileToDataUrl(file) {
  return shrinkImage(await readAsDataUrl(file));
}
/** Chép chữ vào clipboard, báo toast. */
async function copyText(text, msg = 'Đã chép') {
  try { await navigator.clipboard.writeText(text); toast(msg); } catch (e) { toast('Không chép được: ' + e.message, 'err'); }
}

// --- Download notification interceptor ---
document.addEventListener('click', async ev => {
  const a = ev.target.closest('a[download]');
  if (!a || !a.href || !a.href.includes('/video')) return;
  ev.preventDefault();
  const rawName = a.getAttribute('download') || 'video.mp4';
  let filename = rawName;
  if (!filename.toLowerCase().includes('seedance')) {
    filename = 'alex bright tool - ' + filename;
  }
  if (!filename.toLowerCase().endsWith('.mp4')) filename += '.mp4';

  toast(`⏳ Đang chuẩn bị tải: ${filename}...`);
  try {
    const res = await fetch(a.href);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const tmp = document.createElement('a');
    tmp.href = url;
    tmp.download = filename;
    document.body.appendChild(tmp);
    tmp.click();
    tmp.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    toast(`✅ Đã tải xong: ${filename}`, 'ok');
    if (typeof beep === 'function') beep('ok');
    if (window.Notification && Notification.permission === 'granted') {
      try { new Notification('ALEX BRIGHT TOOL', { body: `Đã tải xong: ${filename}` }); } catch (_) {}
    }
  } catch (err) {
    toast(`Lỗi khi tải video: ${err.message}`, 'err');
    if (typeof beep === 'function') beep('err');
  }
});
if (window.Notification && Notification.permission === 'default') {
  try { Notification.requestPermission(); } catch (_) {}
}
