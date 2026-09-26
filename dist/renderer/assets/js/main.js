const CLIENT_CONFIG = Object.freeze({
  licenseServer: 'https://admin-web-eight-steel.vercel.app',
  supabase: {
    url: 'https://wcx9zbrwtrxfwfmk0drrsgvow1hdx5.supabase.co',
    anonKey: 'sb_publishable_wCx9zbRwtRXfwFmK0dRrsg_vOW1hDx5'
  },
  admin: {
    telegram: 'https://t.me/anony88888',
    telegramUser: '@anony88888',
    zaloGroup: 'https://zalo.me/g/t4cn56rel02pjomxwanh',
    zaloPrimary: 'https://zalo.me/0934230726',
    zaloPhonePrimary: '0934230726',
    zaloSecondary: 'https://zalo.me/0333688491',
    zaloPhoneSecondary: '0333688491'
  }
});

const CLOUD_LICENSE_SERVER = CLIENT_CONFIG.licenseServer;
/* Vòng làm mới, license, tab cột phải, phím tắt, tạm dừng hàng đợi, khởi động. */
'use strict';

// ------------------------------------------------------------ tab cột phải & sidebar AppShell
App.showTab = function (tab) {
  S.tab = tab; lsSet('tab', tab);
  document.body.dataset.activeTab = tab;
  document.body.classList.toggle('hide-composer', tab !== 'video');
  $$('#rtabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  $$('.glabs-nav-btn[data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  $$('.pane').forEach(p => { p.hidden = p.id !== 'tab-' + tab; });
  if (tab === 'logs') Logs.start(); else Logs.stop();
  if (tab === 'assets') {
    Assets.load();
    const cBadge = $('#char_count_badge');
    if (cBadge && S.assets) cBadge.textContent = S.assets.length;
  }
  if (tab === 'gallery' && window.Gallery) Gallery.load();
  if (tab === 'settings' && window.Settings) Settings.populate();
  if (tab === 'proxies' && window.Proxies) Proxies.load();
};
$$('#rtabs button').forEach(b => b.addEventListener('click', () => App.showTab(b.dataset.tab)));
$$('.glabs-nav-btn[data-tab]').forEach(b => b.addEventListener('click', () => App.showTab(b.dataset.tab)));

// Wire Studio Grid button in sidebar
const gridNavBtn = $('#sidebar_btn_grid');
if (gridNavBtn) {
  gridNavBtn.addEventListener('click', () => {
    if (window.Composer && Composer.openGridStudio) {
      Composer.openGridStudio();
    } else {
      const modal = $('#grid-studio-modal');
      if (modal) openModal(modal);
    }
  });
}

// Wire Telegram config in sidebar dock
const teleDockBtn = $('#btn_open_telegram_config');
if (teleDockBtn) {
  teleDockBtn.addEventListener('click', () => {
    const modal = $('#telegram-setup-modal');
    if (modal) openModal(modal);
  });
}

// Wire Theme toggle in sidebar dock
const themeDockBtn = $('#dock_theme_btn');
if (themeDockBtn) {
  themeDockBtn.addEventListener('click', () => {
    const tBtn = $('#themebtn');
    if (tBtn) tBtn.click();
  });
}

// ------------------------------------------------------------ phím tắt
document.addEventListener('keydown', e => {
  const tag = (e.target.tagName || '').toLowerCase();
  const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
  if ((e.ctrlKey || e.metaKey) && e.key === ',') { e.preventDefault(); Settings.open(); return; }
  if (typing || modalStack.length) return;
  if (e.key === '/') { e.preventDefault(); $('#p').focus(); return; }
  if (['1', '2', '3', '4', '5', '6'].includes(e.key)) { App.showTab(['video', 'gallery', 'accounts', 'assets', 'logs', 'settings'][+e.key - 1]); }
});

// ------------------------------------------------------------ tạm dừng hàng đợi
$('#pausebtn').addEventListener('click', async () => {
  const paused = !(S.meta && S.meta.paused);
  try {
    await api('POST', '/api/jobs/pause', {paused});
    toast(paused ? 'Đã tạm dừng hàng đợi — job đang chạy vẫn chạy nốt' : 'Hàng đợi chạy tiếp');
    await App.refresh();
  } catch (err) { toast(err.message, 'err'); }
});
function renderPause(meta) {
  const b = $('#pausebtn');
  b.textContent = meta.paused ? 'Chạy tiếp' : 'Tạm dừng';
  b.classList.toggle('on', !!meta.paused);
  b.title = meta.paused ? 'Cho hàng đợi phát job tạo video trở lại' : 'Tạm dừng hàng đợi: job đang chạy vẫn chạy nốt, không phát job mới';
}

// ------------------------------------------------------------ license
function licLabel(st) {
  if (st.dev) return '💎 DEV MODE';
  if (!st.ok && st.trial && st.remaining === 0) return '❌ Hết lượt dùng thử';
  if (!st.ok) return '';
  if (st.trial) return 'Dùng thử: còn ' + st.remaining + '/' + st.quota + ' video';
  return '💎 PRO · ' + (st.key_masked || '30s Không giới hạn');
}

async function copyToClipboard(text, successMsg) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  } catch (e) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (e2) {}
  }
  toast(successMsg || 'Đã sao chép!');
  return true;
}

function openExternalLink(url) {
  try {
    if (window.require) {
      const { shell } = window.require('electron');
      if (shell) return shell.openExternal(url);
    }
  } catch (e) {}
  window.open(url, '_blank');
}

// =============================================================================
// ALEX BRIGHT TOOL - UI/UX PRO MAX WAITING & ACTIVATION CONTROLLER
// =============================================================================
let waitingAutoPollTimer = null;
let isActivationCelebrationShown = false;

const OFFICIAL_CHANNELS = {
  zalo_group: CLIENT_CONFIG.admin.zaloGroup,
  telegram: CLIENT_CONFIG.admin.telegram,
  telegram_user: CLIENT_CONFIG.admin.telegramUser,
  zalo_admin: CLIENT_CONFIG.admin.zaloPrimary,
  zalo_phone: CLIENT_CONFIG.admin.zaloPhonePrimary,
  zalo_secondary: CLIENT_CONFIG.admin.zaloSecondary,
  supabase_url: CLIENT_CONFIG.supabase.url,
  supabase_anon_key: CLIENT_CONFIG.supabase.anonKey
};

function startWaitingAutoPoll() {
  if (waitingAutoPollTimer) return;
  waitingAutoPollTimer = setInterval(async () => {
    try {
      const st = await api('POST', '/api/license/trial');
      if (st && st.ok) {
        stopWaitingAutoPoll();
        showActivationSuccess(st);
      }
    } catch (e) {}
  }, 3500);
}

function stopWaitingAutoPoll() {
  if (waitingAutoPollTimer) {
    clearInterval(waitingAutoPollTimer);
    waitingAutoPollTimer = null;
  }
}

function showActivationSuccess(st) {
  if (isActivationCelebrationShown) return;
  isActivationCelebrationShown = true;

  const box = $('#licbox');
  const errBox = $('#licerr');
  if (errBox) {
    errBox.className = 'lic-err-box visible';
    errBox.style.background = 'rgba(16, 185, 129, 0.15)';
    errBox.style.borderColor = 'rgba(52, 211, 153, 0.4)';
    errBox.style.color = '#34d399';
    errBox.innerHTML = '🎉 <b>KÍCH HOẠT THÀNH CÔNG!</b> Đang mở khóa toàn bộ tính năng...';
  }

  toast('🎉 Bản quyền đã được kích hoạt thành công! Đang vào tool...', 'ok');

  setTimeout(() => {
    if (box) {
      box.hidden = true;
      box.style.display = 'none';
      if (typeof closeModal === 'function') closeModal(box);
    }
    checkLicense();
    if (typeof App !== 'undefined' && App.refresh) App.refresh();
  }, 1200);
}

async function checkLicense() {
  try {
    const st = await api('GET', '/api/license');
    const box = $('#licbox');
    const errBox = $('#licerr');

    if (st && st.ok) {
      stopWaitingAutoPoll();
      if (box) {
        box.hidden = true;
        box.style.display = 'none';
        if (typeof closeModal === 'function') closeModal(box);
      }
      if (errBox) { errBox.classList.remove('visible'); errBox.textContent = ''; }

      const lic = $('#lic');
      if (lic) lic.textContent = st.remaining_time ? `👑 PRO · ${st.remaining_time}` : '👑 BẢN QUYỀN PRO';

      const badge = $('#brand-badge') || document.querySelector('.badge-vip');
      if (badge) {
        badge.textContent = `👑 PRO · ${st.remaining_time || 'HỢP LỆ'}`;
        badge.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        badge.style.borderColor = '#34d399';
        badge.style.color = '#ffffff';
      }
      return true;
    } else {
      // CHƯA KÍCH HOẠT -> Màn hình chờ khóa chặt ngoài tool
      if (box) {
        box.hidden = false;
        box.style.display = 'flex';
        if (typeof openModal === 'function') openModal(box);
      }
      if (errBox && st && st.reason) {
        errBox.classList.add('visible');
        errBox.textContent = st.reason;
      }
      if ($('#licmid') && st && st.machine_id) {
        $('#licmid').value = st.machine_id;
      }
      const badge = $('#brand-badge') || document.querySelector('.badge-vip');
      if (badge) {
        badge.textContent = '🔒 CHƯA KÍCH HOẠT';
        badge.style.background = 'linear-gradient(135deg, #ef4444, #b91c1c)';
        badge.style.borderColor = '#f87171';
        badge.style.color = '#ffffff';
      }
      // Bật tự động nhận diện bản quyền từ Web Admin
      startWaitingAutoPoll();
      return false;
    }
  } catch (err) {
    console.error('[License] checkLicense error:', err);
    return false;
  }
}

// Bấm vào ô input ID máy tự động chọn và sao chép
const licMidInput = $('#licmid');
const licCopyBtn = $('#liccopybtn');

function triggerCopyFeedback() {
  if (licCopyBtn) {
    licCopyBtn.classList.add('copied');
    const textEl = $('#liccopytext') || licCopyBtn;
    const oldHtml = textEl.innerHTML;
    textEl.innerHTML = '✓ ĐÃ SAO CHÉP!';
    setTimeout(() => {
      licCopyBtn.classList.remove('copied');
      textEl.innerHTML = oldHtml;
    }, 2200);
  }
}

if (licMidInput) {
  licMidInput.addEventListener('click', async () => {
    licMidInput.select();
    const val = licMidInput.value;
    if (val && !val.includes('Đang tải') && !val.includes('Đang đọc')) {
      await copyToClipboard(val, 'Đã sao chép Mã Máy (HWID)!');
      triggerCopyFeedback();
    }
  });
}

if (licCopyBtn) {
  licCopyBtn.addEventListener('click', async () => {
    const val = $('#licmid')?.value;
    if (!val || val.includes('Đang tải') || val.includes('Đang đọc')) {
      return toast('Mã máy chưa sẵn sàng, vui lòng đợi giây lát...', 'err');
    }
    await copyToClipboard(val, 'Đã sao chép Mã Máy (HWID)!');
    triggerCopyFeedback();
  });
}

// ── BIND 3 KÊNH LIÊN HỆ YÊU CẦU ────────────────────────────────────
// 1. Nhóm Zalo
const btnChannelZaloGroup = $('#btn-channel-zalo-group');
const btnOpenZaloGroup = $('#btn-open-zalo-group');
const btnCopyZaloGroup = $('#btn-copy-zalo-group');

if (btnChannelZaloGroup) {
  btnChannelZaloGroup.onclick = (e) => {
    if (e.target && (e.target.id === 'btn-copy-zalo-group' || e.target.closest('#btn-copy-zalo-group'))) return;
    openExternalLink(OFFICIAL_CHANNELS.zalo_group);
  };
}
if (btnOpenZaloGroup) {
  btnOpenZaloGroup.onclick = (e) => {
    e.stopPropagation();
    openExternalLink(OFFICIAL_CHANNELS.zalo_group);
  };
}
if (btnCopyZaloGroup) {
  btnCopyZaloGroup.onclick = (e) => {
    e.stopPropagation();
    copyToClipboard(OFFICIAL_CHANNELS.zalo_group, 'Đã sao chép link Nhóm Zalo!');
  };
}

// 2. Telegram Admin
const btnChannelTele = $('#btn-channel-tele');
const btnOpenTele = $('#btn-open-tele');
const btnCopyTele = $('#btn-copy-tele');

if (btnChannelTele) {
  btnChannelTele.onclick = (e) => {
    if (e.target && (e.target.id === 'btn-copy-tele' || e.target.closest('#btn-copy-tele'))) return;
    openExternalLink(OFFICIAL_CHANNELS.telegram);
  };
}
if (btnOpenTele) {
  btnOpenTele.onclick = (e) => {
    e.stopPropagation();
    openExternalLink(OFFICIAL_CHANNELS.telegram);
  };
}
if (btnCopyTele) {
  btnCopyTele.onclick = (e) => {
    e.stopPropagation();
    copyToClipboard(OFFICIAL_CHANNELS.telegram_user, 'Đã sao chép Telegram: @anony88888');
  };
}

// 3. Zalo Cá Nhân Admin
const btnChannelZalo = $('#btn-channel-zalo');
const btnOpenZalo = $('#btn-open-zalo');
const btnCopyZalo = $('#btn-copy-zalo');

if (btnChannelZalo) {
  btnChannelZalo.onclick = (e) => {
    if (e.target && (e.target.id === 'btn-copy-zalo' || e.target.closest('#btn-copy-zalo'))) return;
    openExternalLink(OFFICIAL_CHANNELS.zalo_admin);
  };
}
if (btnOpenZalo) {
  btnOpenZalo.onclick = (e) => {
    e.stopPropagation();
    openExternalLink(OFFICIAL_CHANNELS.zalo_admin);
  };
}
if (btnCopyZalo) {
  btnCopyZalo.onclick = (e) => {
    e.stopPropagation();
    copyToClipboard(OFFICIAL_CHANNELS.zalo_phone, 'Đã sao chép số Zalo: 0934.230.726');
  };
}

// 4. Hotline / Zalo 2
const btnChannelHotline = $('#btn-channel-hotline');
const btnOpenHotline = $('#btn-open-hotline');
const btnCopyHotline = $('#btn-copy-hotline');

if (btnChannelHotline) {
  btnChannelHotline.onclick = (e) => {
    if (e.target && (e.target.id === 'btn-copy-hotline' || e.target.closest('#btn-copy-hotline'))) return;
    openExternalLink(CLIENT_CONFIG.admin.zaloSecondary || 'https://zalo.me/0333688491');
  };
}
if (btnOpenHotline) {
  btnOpenHotline.onclick = (e) => {
    e.stopPropagation();
    openExternalLink(CLIENT_CONFIG.admin.zaloSecondary || 'https://zalo.me/0333688491');
  };
}
if (btnCopyHotline) {
  btnCopyHotline.onclick = (e) => {
    e.stopPropagation();
    copyToClipboard(CLIENT_CONFIG.admin.zaloPhoneSecondary || '0333688491', 'Đã sao chép Hotline: 0333.688.491');
  };
}

// Bind key accordion toggle & direct key submit
const keyToggleEl = $('#lic-key-toggle');
if (keyToggleEl) {
  keyToggleEl.onclick = () => {
    const tab = $('#view-tab-key');
    if (tab) tab.style.display = (tab.style.display === 'none' || !tab.style.display) ? 'block' : 'none';
  };
}
const directKeyFormEl = $('#lic-key-direct-form');
if (directKeyFormEl) {
  directKeyFormEl.onsubmit = async (e) => {
    e.preventDefault();
    const k = $('#direct-key-input')?.value?.trim();
    if (!k) return;
    const btn = $('#btn-submit-direct-key');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Đang kiểm tra...'; }
    try {
      const res = await api('POST', '/api/license/activate', { key: k });
      if (res && res.ok) {
        showActivationSuccess(res);
      } else {
        const errBox = $('#licerr');
        if (errBox) {
          errBox.textContent = res?.reason || 'Mã Key không hợp lệ hoặc đã hết lượt kích hoạt.';
          errBox.classList.add('visible');
        }
      }
    } catch (err) {
      const errBox = $('#licerr');
      if (errBox) {
        errBox.textContent = err.message || 'Lỗi khi kích hoạt bằng key.';
        errBox.classList.add('visible');
      }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = '⚡ Kích Hoạt'; }
    }
  };
}

// ── NÚT KIỂM TRA BẢN QUYỀN CHÍNH ───────────────────────────────────
const licTryBtn = $('#lictry');
if (licTryBtn) {
  licTryBtn.addEventListener('click', async () => {
    const errBox = $('#licerr');
    if (errBox) {
      errBox.classList.remove('visible');
      errBox.textContent = '';
    }
    licTryBtn.disabled = true;
    const oldHtml = licTryBtn.innerHTML;
    licTryBtn.innerHTML = '<span>⏳ Đang kiểm tra với máy chủ...</span>';
    try {
      const st = await api('POST', '/api/license/trial');
      const isVerified = await checkLicense();
      if (isVerified) {
        showActivationSuccess(st);
      } else {
        if (errBox) {
          errBox.textContent = st?.reason || 'Mã máy chưa được kích hoạt trên hệ thống. Hãy gửi mã máy cho Admin qua 3 kênh Zalo/Tele ở trên!';
          errBox.classList.add('visible');
        }
      }
      await App.refresh();
    } catch (err) {
      if (errBox) {
        errBox.textContent = err.message || 'Lỗi kết nối kiểm tra bản quyền.';
        errBox.classList.add('visible');
      }
    } finally {
      licTryBtn.disabled = false;
      licTryBtn.innerHTML = oldHtml;
    }
  });
}

// ── COLLAPSIBLE LICENSE KEY FORM ───────────────────────────────────
const licKeyToggle = $('#lic-key-toggle');
const viewTabKey = $('#view-tab-key');
if (licKeyToggle && viewTabKey) {
  licKeyToggle.addEventListener('click', () => {
    const isHidden = viewTabKey.style.display === 'none';
    viewTabKey.style.display = isHidden ? 'block' : 'none';
    licKeyToggle.innerHTML = isHidden
      ? '<span>🔑 Nhập mã License Key bên dưới: ▴</span>'
      : '<span>🔑 Bạn có sẵn mã License Key? Bấm vào đây để kích hoạt bằng Key ▾</span>';
  });
}

const licKeyDirectForm = $('#lic-key-direct-form');
const directKeyInput = $('#direct-key-input');
const btnSubmitDirectKey = $('#btn-submit-direct-key');

if (licKeyDirectForm) {
  licKeyDirectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const key = String(directKeyInput?.value || '').trim();
    if (!key) return;
    const errBox = $('#licerr');
    if (errBox) { errBox.classList.remove('visible'); errBox.textContent = ''; }
    if (btnSubmitDirectKey) {
      btnSubmitDirectKey.disabled = true;
      btnSubmitDirectKey.innerHTML = '<span>⏳ Xác thực...</span>';
    }
    try {
      const st = await api('POST', '/api/license/activate', { key });
      if (!st.ok) {
        if (errBox) {
          errBox.textContent = st.reason || 'Mã Key không hợp lệ hoặc đã hết hạn sử dụng.';
          errBox.classList.add('visible');
        }
      } else {
        showActivationSuccess(st);
      }
    } catch (err) {
      if (errBox) {
        errBox.textContent = err.message || 'Lỗi kết nối máy chủ.';
        errBox.classList.add('visible');
      }
    } finally {
      if (btnSubmitDirectKey) {
        btnSubmitDirectKey.disabled = false;
        btnSubmitDirectKey.innerHTML = '<span>⚡ Kích Hoạt</span>';
      }
    }
  });
}

// Legacy form support
const licForm = $('#licform');
if (licForm) {
  licForm.addEventListener('submit', async e => {
    e.preventDefault();
    const errBox = $('#licerr');
    if (errBox) { errBox.classList.remove('visible'); errBox.textContent = ''; }
    try {
      const st = await api('POST', '/api/license/activate', {key: $('#lickey')?.value || ''});
      if (!st.ok) {
        if (errBox) { errBox.textContent = st.reason || 'Kích hoạt thất bại.'; errBox.classList.add('visible'); }
      } else {
        showActivationSuccess(st);
      }
      await checkLicense(); await App.refresh();
    } catch (err) {
      if (errBox) { errBox.textContent = err.message; errBox.classList.add('visible'); }
    }
  });
}

// ------------------------------------------------------------ vòng làm mới
let lastDone = -1, failures = 0, refreshTimer = null, refreshing = false, licTick = 0;
App.refresh = async function () {
  if (refreshing) return;
  refreshing = true;
  let s;
  try {
    s = await api('GET', '/api/state');
    if (failures) { failures = 0; $('#offline').hidden = true; toast('Đã kết nối lại với app'); }
  } catch (netErr) {
    failures++;
    if (failures >= 2) { $('#offline').hidden = false; $('#offline').textContent = 'Mất kết nối với app: ' + netErr.message + ' — đang thử lại…'; }
    refreshing = false;
    schedule();
    return;
  }

  try {
    const first = !S.meta;
    S.meta = s.meta; S.profiles = s.profiles; S.jobs = s.jobs;
    S.trial = null;
    for (const btnId of ['#go', '#go_pro', '#go_multi']) {
      const b = $(btnId);
      if (b && b.disabled && b.title?.includes('dùng thử')) {
        b.disabled = false;
        b.title = '';
      }
    }
    // Nút «Xem Dola» sáng/nhạt theo cửa sổ thực đang mở (đóng cửa sổ thì nút tự nhạt).
    S.winShown = new Set(s.meta?.viewers || []);
    if (first) {
      try { if (typeof Composer !== 'undefined' && Composer.renderMeta) Composer.renderMeta(s.meta); } catch (e) { console.error('[Render Composer.renderMeta]', e); }
      try { if (typeof Settings !== 'undefined' && Settings.applyTheme) Settings.applyTheme(s.meta?.settings?.theme); } catch (e) { console.error('[Render Settings.applyTheme]', e); }
      try { if (typeof Composer !== 'undefined' && Composer.restoreDraft) Composer.restoreDraft(); } catch (e) { console.error('[Render Composer.restoreDraft]', e); }
    } else if (s.meta?.settings && s.meta.settings.theme !== (typeof Settings !== 'undefined' ? Settings.theme : '')) {
      try { if (typeof Settings !== 'undefined' && Settings.applyTheme) Settings.applyTheme(s.meta.settings.theme); } catch (e) {}
    }
    try { renderPause(s.meta); } catch (e) { console.error('[Render renderPause]', e); }
    try { if (typeof Jobs !== 'undefined' && Jobs.renderKpi) Jobs.renderKpi(s.meta); } catch (e) { console.error('[Render Jobs.renderKpi]', e); }
    try { if (typeof Accounts !== 'undefined' && Accounts.render) Accounts.render(s.profiles || []); } catch (e) { console.error('[Render Accounts.render]', e); }
    try { if (typeof Jobs !== 'undefined' && Jobs.render) Jobs.render(s.jobs || []); } catch (e) { console.error('[Render Jobs.render]', e); }
    try { if (typeof Composer !== 'undefined' && Composer.updateCost) Composer.updateCost(); } catch (e) {}
    try { if (typeof Composer !== 'undefined' && Composer.updateKPI) Composer.updateKPI(); } catch (e) {}
    try { if (S.tab === 'proxies' && window.Proxies) { Proxies.updateStats(); Proxies.renderAccProxyTable(); } } catch (e) {}
    const readyAccs = (s.profiles || []).filter(p => p.enabled && p.login !== false && p.credits_today !== 0 && !p.resting);
    const wbAccText = $('#workbench_accready_text');
    if (wbAccText) wbAccText.textContent = `${readyAccs.length} Nick Sẵn Sàng`;
    // Số lượt dùng thử đổi khi có video xong; ngoài ra app tự hỏi lại máy chủ
    // định kỳ (hết hạn, bị khoá) nên cũng xem lại mỗi ~30 giây.
    const done = s.jobs.filter(j => j.status === 'done').length;
    licTick++;
    if (done !== lastDone || licTick % 2 === 0) {
      if (done !== lastDone) {
        if (window.Gallery) {
          if (S.tab === 'gallery') Gallery.load();
          else {
            api('GET', '/api/gallery').then(res => {
              if ($('#n-gallery')) $('#n-gallery').textContent = res.videos?.length ? res.videos.length : '';
              if ($('#gal-total-badge')) $('#gal-total-badge').textContent = `${res.videos?.length || 0} video`;
            }).catch(() => {});
          }
        }
      }
      lastDone = done;
      checkLicense();
    }
  } catch (renderErr) {
    console.error('Lỗi giao diện (Render Error):', renderErr);
  } finally { refreshing = false; }
  schedule();
};
function schedule() {
  clearTimeout(refreshTimer);
  // Ẩn cửa sổ thì thưa ra; lỗi liên tiếp thì giãn dần tới 10 giây.
  const ms = document.hidden ? 8000 : failures >= 3 ? 10000 : 2000;
  refreshTimer = setTimeout(App.refresh, ms);
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) { App.refresh(); if (S.tab === 'logs') Logs.poll(); } });

// ------------------------------------------------------------ khởi động
Settings.applyTheme(lsGet('theme', 'auto'));
if (!lsGet('seedance_v25_init', false)) {
  lsSet('seedance_v25_init', true);
  lsSet('tab', 'video');
}
App.showTab(lsGet('tab', 'video'));
checkLicense().then(App.refresh);
Assets.load();


// =============================================================================
// POP-UP THÔNG BÁO TỪ ADMIN (POLLING ĐỊNH KỲ VỚI CLOUDFLARE)
// =============================================================================
let lastAnnouncementId = '';

async function checkAnnouncement() {
  if (!CLOUD_LICENSE_SERVER) return;
  try {
    const res = await fetch(CLOUD_LICENSE_SERVER + '/api/announcement', { method: 'GET', cache: 'no-store' });
    const data = await res.json();
    if (!data || !data.active || !data.message) return;

    const annId = data.id || ('ann_' + data.created_at);
    const seenId = localStorage.getItem('seen_ann_id');
    if (seenId === annId) return;

    // Hiển thị Pop-up modal
    const modal = $('#broadcast-modal');
    if (!modal) return;

    const titleEl = $('#bc-title');
    const msgEl = $('#bc-msg');
    const badgeEl = $('#bc-badge');

    if (titleEl) titleEl.textContent = data.title || '📢 THÔNG BÁO TỪ ADMIN';
    if (msgEl) msgEl.textContent = data.message;

    const imgContainer = $('#bc-img-container');
    if (imgContainer) {
      if (data.image_url) {
        imgContainer.innerHTML = `<img src="${data.image_url}" style="max-width:100%;max-height:180px;border-radius:10px;object-fit:cover;border:1px solid rgba(255,255,255,0.15);margin-bottom:12px;" onerror="this.style.display='none'">`;
        imgContainer.style.display = 'block';
      } else {
        imgContainer.innerHTML = '';
        imgContainer.style.display = 'none';
      }
    }

    const linkContainer = $('#bc-link-container');
    if (linkContainer) {
      if (data.link_url) {
        const linkText = data.link_text || '⚡ Xem Chi Tiết / Tải Ngay →';
        linkContainer.innerHTML = `<a href="#" id="bc-action-link" style="display:inline-block;padding:11px 22px;background:linear-gradient(135deg,#0284c7,#38bdf8);color:#000;font-weight:800;font-size:13.5px;border-radius:10px;text-decoration:none;box-shadow:0 4px 15px rgba(56,189,248,0.35);">${linkText}</a>`;
        linkContainer.style.display = 'block';
        const actionLink = linkContainer.querySelector('#bc-action-link');
        if (actionLink) {
          actionLink.onclick = (e) => {
            e.preventDefault();
            openExternalLink(data.link_url);
          };
        }
      } else {
        linkContainer.innerHTML = '';
        linkContainer.style.display = 'none';
      }
    }

    if (badgeEl) {
      if (data.type === 'danger') {
        badgeEl.textContent = '🚨';
        badgeEl.style.borderColor = '#ef4444';
        badgeEl.style.background = 'rgba(239, 68, 68, 0.2)';
      } else if (data.type === 'warning') {
        badgeEl.textContent = '⚠️';
        badgeEl.style.borderColor = '#f59e0b';
        badgeEl.style.background = 'rgba(245, 158, 11, 0.2)';
      } else {
        badgeEl.textContent = '📢';
        badgeEl.style.borderColor = '#38bdf8';
        badgeEl.style.background = 'rgba(56, 189, 248, 0.2)';
      }
    }

    openModal(modal);
    modal.hidden = false;
    modal.style.display = 'flex';

    const closeBtn = $('#btn-close-broadcast');
    if (closeBtn) {
      closeBtn.onclick = () => {
        localStorage.setItem('seen_ann_id', annId);
        closeModal(modal);
        modal.hidden = true;
        modal.style.display = 'none';
      };
    }
  } catch (err) {}
}

// Kiểm tra thông báo khi khởi động và định kỳ mỗi 30s
setTimeout(checkAnnouncement, 2000);
setInterval(checkAnnouncement, 30000);

// Nhận thông báo broadcast từ Admin qua Supabase (real-time qua heartbeat)
if (window.dolaStudio && typeof window.dolaStudio.onAdminBroadcast === 'function') {
  window.dolaStudio.onAdminBroadcast((data) => {
    try {
      if (!data || !data.message) return;
      // Reuse existing broadcast modal UI
      showAdminBroadcast(data);
    } catch {}
  });
}

function showAdminBroadcast(data) {
  try {
    const modal = $('#broadcast-modal');
    if (!modal) return;

    const annId = data.id || ('ipc_' + Date.now());
    const seenId = localStorage.getItem('seen_ann_id');
    if (seenId === annId) return;

    const titleEl = $('#bc-title');
    const msgEl = $('#bc-msg');
    const badgeEl = $('#bc-badge');

    if (titleEl) titleEl.textContent = data.title || '📢 THÔNG BÁO TỪ ADMIN';
    if (msgEl) msgEl.innerHTML = (data.message || '').replace(/\n/g, '<br>');

    const typeColors = { info: '#38bdf8', success: '#10b981', warning: '#f59e0b', error: '#ef4444', promo: '#f97316' };
    const typeIcons  = { info: '💬', success: '✅', warning: '⚠️', error: '🚨', promo: '🎁' };
    const color = typeColors[data.type] || '#38bdf8';
    const icon  = typeIcons[data.type] || '📢';

    if (badgeEl) {
      badgeEl.textContent = icon;
      badgeEl.style.borderColor = color;
      badgeEl.style.background = color + '33';
    }

    // Insert image nếu có
    const imgContainer = modal.querySelector('#bc-img-container');
    if (imgContainer) {
      if (data.image_url) {
        imgContainer.innerHTML = `<img src="${data.image_url}" style="width:100%;border-radius:8px;margin-bottom:12px;max-height:200px;object-fit:cover" onerror="this.style.display='none'">`;
        imgContainer.style.display = 'block';
      } else {
        imgContainer.style.display = 'none';
      }
    }

    // Insert link button nếu có
    const linkContainer = modal.querySelector('#bc-link-container');
    if (linkContainer) {
      if (data.link_url) {
        const linkText = data.link_text || 'Xem chi tiết →';
        linkContainer.innerHTML = `<a href="#" onclick="openExternalLink('${data.link_url}')" style="display:inline-block;margin-top:10px;padding:8px 18px;background:${color}22;color:${color};border:1px solid ${color}55;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none">${linkText}</a>`;
        linkContainer.style.display = 'block';
      } else {
        linkContainer.style.display = 'none';
      }
    }

    modal.hidden = false;
    modal.style.display = 'flex';

    const closeBtn = $('#btn-close-broadcast');
    if (closeBtn) {
      closeBtn.onclick = () => {
        localStorage.setItem('seen_ann_id', annId);
        modal.hidden = true;
        modal.style.display = 'none';
      };
    }
  } catch (err) {}
}


// =============================================================================
// ĐỒNG BỘ KÊNH HỖ TRỢ / ZALO / TELEGRAM ĐỘNG TỪ CLOUDFLARE
// =============================================================================
let currentSupportContact = {
  zalo: "https://zalo.me/0988888888",
  telegram: "https://t.me/anony88888",
  tele_user: "@anony88888",
  hotline: "0988.888.888",
  email: "alexbright.dmca@gmail.com"
};

// Khởi chạy đồng bộ thông tin lưu ý hệ thống


// =============================================================================
// ĐỒNG BỘ LƯU Ý & HƯỚNG DẪN TỪ ADMIN
// =============================================================================
async function syncSystemNotes() {
  try {
    const res = await fetch(CLOUD_LICENSE_SERVER + '/api/system-notes', { method: 'GET', cache: 'no-store' });
    const data = await res.json();
    const box = $('#admin-notes-box');
    const contentEl = $('#admin-notes-content');
    const tagEl = $('#admin-notes-tag');

    if (!box || !contentEl) return;

    if (data && data.active !== false && data.content && data.content.trim()) {
      contentEl.textContent = data.content;
      if (tagEl) tagEl.textContent = data.tag || 'Quan trọng';
      box.style.display = 'block';
    } else {
      box.style.display = 'none';
    }
  } catch (e) {}
}

setTimeout(syncSystemNotes, 2500);
setInterval(syncSystemNotes, 30000);


