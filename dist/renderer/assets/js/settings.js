/* Hộp Cài đặt + chủ đề sáng/tối. */
'use strict';
const Settings = {theme: 'auto'};
window.Settings = Settings;
const THEMES = [['auto', 'Tự động', 'theo Windows'], ['light', 'Sáng', ''], ['dark', 'Tối', '']];

Settings.applyTheme = function (t) {
  Settings.theme = t;
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme;
  lsSet('theme', t);
  try { localStorage.setItem('theme', t); } catch (e) {}
  $('#themebtn').title = 'Giao diện: ' + (THEMES.find(x => x[0] === t) || THEMES[0])[1] + ' (bấm để đổi)';
};
$('#themebtn').addEventListener('click', async () => {
  const i = THEMES.findIndex(x => x[0] === Settings.theme);
  const next = THEMES[(i + 1) % THEMES.length][0];
  Settings.applyTheme(next);
  try { await api('POST', '/api/settings', {theme: next}); } catch (e) {}
  toast('Giao diện: ' + THEMES.find(x => x[0] === next)[1]);
});

Settings.loadLicense = async function () {
  try {
    const st = await api('GET', '/api/license');
    if ($('#s_licmid') && st && st.machine_id) $('#s_licmid').value = st.machine_id;
    if ($('#s_licres')) {
      if (st && st.ok) {
        $('#s_licres').innerHTML = `<span style="color:#10b981;font-weight:700">💎 BẢN QUYỀN ${(st.plan || 'PRO').toUpperCase()} · ${esc(st.remaining_time || 'Vĩnh Viễn')}</span><br><span style="font-size:12px;color:var(--ink-2)">Khách hàng: <b>${esc(st.customer || 'Hợp lệ')}</b> · Key: <code>${esc(st.key_masked || '******')}</code></span>`;
      } else {
        $('#s_licres').innerHTML = `<span style="color:#ef4444;font-weight:600">❌ Chưa kích hoạt bản quyền</span><br><span style="font-size:12px;color:var(--ink-2)">${esc(st?.reason || 'Vui lòng nhập License key để mở khóa tính năng.')}</span>`;
      }
    }
  } catch (e) {}
};

Settings.updateProxyModeVisibility = function () {
  const mode = $('#s_proxy_mode')?.value || 'static';
  if ($('#s_topproxy_wrap')) $('#s_topproxy_wrap').style.display = (mode === 'topproxy') ? 'block' : 'none';
  if ($('#s_static_proxy_wrap')) $('#s_static_proxy_wrap').style.display = (mode === 'static') ? 'block' : 'none';
  if ($('#s_tor_wrap')) $('#s_tor_wrap').style.display = (mode === 'tor') ? 'block' : 'none';
};
$('#s_proxy_mode')?.addEventListener('change', () => Settings.updateProxyModeVisibility());

Settings.populate = async function () {
  let s = S.meta && S.meta.settings;
  if (!s) {
    try {
      const res = await api('GET', '/api/settings');
      if (res && res.settings) {
        if (!S.meta) S.meta = {};
        S.meta.settings = res.settings;
        s = res.settings;
      }
    } catch (_) {}
  }
  if (!s) return;
  if ($('#s_output_dir')) $('#s_output_dir').value = s.output_dir || '';
  if ($('#s_filename_template')) $('#s_filename_template').value = s.filename_template || '{stt} - {prompt} - {gio}';
  if ($('#s_remove_watermark')) $('#s_remove_watermark').checked = !!s.remove_watermark;
  if ($('#s_wait_minutes')) $('#s_wait_minutes').value = s.wait_minutes || 20;
  if ($('#s_recover_wait_minutes')) $('#s_recover_wait_minutes').value = s.recover_wait_minutes || s.wait_minutes || 20;
  if ($('#s_pause_min_s')) $('#s_pause_min_s').value = s.pause_min_s || 0;
  if ($('#s_pause_max_s')) $('#s_pause_max_s').value = s.pause_max_s || 0;
  if ($('#s_auto_rotate')) $('#s_auto_rotate').checked = !!s.auto_rotate;
  if ($('#s_prompt_duration_hint')) $('#s_prompt_duration_hint').checked = s.prompt_duration_hint !== false;
  if ($('#s_notify_sound')) $('#s_notify_sound').checked = !!s.notify_sound;
  if ($('#s_notify_os')) $('#s_notify_os').checked = !!s.notify_os;
  if ($('#s_proxy_mode')) $('#s_proxy_mode').value = s.proxy_mode || 'static';
  if ($('#s_topproxy_key')) {
    const rawK = s.topproxy_keys || s.topproxy_key || '';
    const keyArr = String(rawK).split(/[\r\n,;]+/).map(k => k.trim()).filter(Boolean);
    $('#s_topproxy_key').value = keyArr.join('\n');
  }
  if ($('#s_topproxy_res')) $('#s_topproxy_res').textContent = '';
  Settings.updateProxyModeVisibility();
  if ($('#s_proxy_pool')) $('#s_proxy_pool').value = (s.proxy_pool || []).join('\n');
  if ($('#s_tor_region')) $('#s_tor_region').value = s.tor_region || 'no_us';
  if ($('#s_telegram_token')) $('#s_telegram_token').value = s.telegram_token ? '••••••••' : '';
  if ($('#s_telegram_chat_id')) $('#s_telegram_chat_id').value = s.telegram_chat_id || '';
  if ($('#s_telegram_screenshot')) $('#s_telegram_screenshot').checked = s.telegram_send_screenshot !== false;
  if ($('#s_telegram_notify_video_err')) $('#s_telegram_notify_video_err').checked = s.telegram_notify_video_err !== false;
  if ($('#s_telegram_notify_login_err')) $('#s_telegram_notify_login_err').checked = s.telegram_notify_login_err !== false;
  if ($('#s_telegram_test_res')) $('#s_telegram_test_res').textContent = '';
  if ($('#s_tele_badge')) {
    const hasTele = !!(s.telegram_token && s.telegram_chat_id);
    $('#s_tele_badge').textContent = hasTele ? 'Đã kích hoạt' : 'Chưa kích hoạt';
    $('#s_tele_badge').style.background = hasTele ? 'rgba(34,197,94,0.18)' : 'rgba(100,116,139,0.2)';
    $('#s_tele_badge').style.color = hasTele ? '#4ade80' : '#94a3b8';
  }
  if ($('#s_proxyres')) $('#s_proxyres').textContent = '';
  if ($('#s_proxylist')) $('#s_proxylist').hidden = true;
  if ($('#settingserr')) $('#settingserr').textContent = '';
  if ($('#s_theme')) seg($('#s_theme'), THEMES.map(([v, l, sub]) => ({v, label: l, sub})), s.theme, v => Settings.applyTheme(v));
  Settings.preview();
  Settings.loadLicense();
};

Settings.open = function () {
  App.showTab('settings');
  Settings.populate();
};
$('#settingsbtn').addEventListener('click', Settings.open);

let previewTimer = null;
Settings.preview = async function () {
  clearTimeout(previewTimer);
  previewTimer = setTimeout(async () => {
    try {
      const r = await api('GET', '/api/settings/filename-preview?template=' + encodeURIComponent($('#s_filename_template').value));
      $('#s_preview').textContent = r.preview; $('#s_preview').className = '';
      $('#s_placeholders').innerHTML = r.placeholders.map(p => `<code>${esc(p.key)}</code> ${esc(p.help)}`).join(' · ');
    } catch (err) { $('#s_preview').textContent = err.message; $('#s_preview').className = 'err'; }
  }, 180);
};
$('#s_filename_template').addEventListener('input', Settings.preview);
$('#s_pick').addEventListener('click', async () => {
  try {
    const r = await api('POST', '/api/pick-folder');
    if (r.path) { $('#s_output_dir').value = r.path; Settings.preview(); }
  } catch (err) { toast(err.message, 'err'); }
});
$('#s_open').addEventListener('click', async () => {
  try { await api('POST', '/api/open-folder'); } catch (err) { toast(err.message, 'err'); }
});
$('#s_btn_proxyfree')?.addEventListener('click', () => {
  const cur = $('#s_proxy_pool').value.trim();
  const lines = cur ? cur.split(/\r?\n/).map(s => s.trim()).filter(Boolean) : [];
  if (!lines.includes('tor')) {
    lines.unshift('tor');
    $('#s_proxy_pool').value = lines.join('\n');
  }
  $('#s_proxyres').innerHTML = '<span style="color:#16a34a;font-weight:600">✅ Đã thêm Proxy Free (Tor) vào pool!</span> Bấm «Chia proxy» ở tab Tài khoản để gán cho các nick.';
});

$('#s_proxytest').addEventListener('click', async () => {
  const text = $('#s_proxy_pool').value;
  $('#s_proxyres').textContent = 'Đang kiểm tra…';
  $('#s_proxylist').hidden = true;
  $('#s_proxytest').disabled = true;
  try {
    const r = await api('POST', '/api/proxy/check', {text});
    const good = r.results.filter(x => x.ok).length;
    $('#s_proxyres').textContent = `${good}/${r.results.length} dùng được`;
    $('#s_proxylist').hidden = false;
    $('#s_proxylist').innerHTML = r.results.map(x =>
      `<div class="${x.ok ? 'good' : 'bad'}">${esc(x.text || x.proxy)} — ${x.ok ? 'OK (IP: ' + esc(x.ip || '') + ', ' + (x.ms || 0) + 'ms)' : esc(x.error || 'Lỗi kết nối')}</div>`
    ).join('');
  } catch (err) { $('#s_proxyres').textContent = 'Lỗi: ' + err.message; }
  finally { $('#s_proxytest').disabled = false; }
});

$('#s_copy_mid')?.addEventListener('click', () => {
  const val = $('#s_licmid')?.value;
  if (val) copyToClipboard(val, 'Đã sao chép Mã máy (HWID)!');
});
$('#s_copy_mcode')?.addEventListener('click', () => copyText($('#s_licmcode').value, 'Mã máy'));
$('#s_copy_both')?.addEventListener('click', () => {
  const mid = $('#s_licmid').value;
  const mcode = $('#s_licmcode').value;
  copyText(`ID máy: ${mid}\nMã máy: ${mcode}`, 'cả hai mã');
});

$('#s_lictry')?.addEventListener('click', async () => {
  const b = $('#s_lictry'); b.disabled = true; const old = b.textContent; b.textContent = 'Đang đồng bộ…';
  try {
    const st = await api('POST', '/api/license/trial');
    if (st.ok) {
      toast(st.plan === 'trial' ? `Dùng thử hợp lệ (${st.remaining_time})` : 'Bản quyền Pro hợp lệ');
      if (typeof checkLicense === 'function') checkLicense();
      Settings.loadLicense();
    } else {
      toast(st.reason || 'Chưa được kích hoạt', 'err');
      if ($('#s_licres')) $('#s_licres').innerHTML = `<span style="color:#ef4444;font-weight:600">${esc(st.reason || 'Chưa được kích hoạt')}</span>`;
    }
  } catch (err) { toast(err.message, 'err'); }
  finally { b.disabled = false; b.textContent = old; }
});

$('#s_licgo')?.addEventListener('click', async () => {
  const key = $('#s_lickey').value.trim();
  if (!key) return toast('Vui lòng nhập License key', 'err');
  const b = $('#s_licgo'); b.disabled = true; const old = b.textContent; b.textContent = 'Đang gửi…';
  try {
    const st = await api('POST', '/api/license/activate', { key });
    if (st.ok) {
      toast('Đã kích hoạt bản quyền thành công!');
      if (typeof checkLicense === 'function') checkLicense();
      Settings.loadLicense();
    } else {
      toast(st.reason || 'Kích hoạt thất bại', 'err');
      if ($('#s_licres')) $('#s_licres').innerHTML = `<span style="color:#ef4444">${esc(st.reason || 'Kích hoạt thất bại')}</span>`;
    }
  } catch (err) { toast(err.message, 'err'); }
  finally { b.disabled = false; b.textContent = old; }
});

$('#s_topproxy_test')?.addEventListener('click', async () => {
  const key = ($('#s_topproxy_key').value || '').trim();
  if (!key) return toast('Vui lòng nhập API Key TopProxy', 'err');
  const btn = $('#s_topproxy_test');
  btn.disabled = true;
  const oldText = btn.textContent;
  btn.textContent = 'Đang kiểm tra…';
  $('#s_topproxy_res').innerHTML = '<span style="color:var(--ink-2)">Đang kết nối API TopProxy…</span>';
  try {
    const r = await api('POST', '/api/proxy/check-rotating', { key });
    if (r.ok) {
      $('#s_topproxy_res').innerHTML = `<span style="color:#10b981;font-weight:600">✅ Kết nối thành công!</span> IP: <b>${esc(r.ip)}</b> ${r.location ? '· ' + esc(r.location) : ''} ${r.isp ? '(' + esc(r.isp) + ')' : ''}`;
      toast('TopProxy hoạt động tốt: ' + r.ip);
    } else {
      $('#s_topproxy_res').innerHTML = `<span style="color:#ef4444;font-weight:600">❌ Lỗi:</span> ${esc(r.error || 'Không lấy được IP')}`;
      toast(r.error || 'Lỗi kiểm tra key', 'err');
    }
  } catch (err) {
    $('#s_topproxy_res').innerHTML = `<span style="color:#ef4444;font-weight:600">❌ Lỗi:</span> ${esc(err.message)}`;
    toast(err.message, 'err');
  } finally {
    btn.disabled = false;
    btn.textContent = oldText;
  }
});

$('#settingsform').addEventListener('submit', async e => {
  e.preventDefault(); $('#settingserr').textContent = ''; $('#settingsgo').disabled = true;
  try {
    let fnTemplate = ($('#s_filename_template')?.value || '').trim();
    if (!fnTemplate) {
      fnTemplate = '{stt} - {prompt} - {gio}';
      if ($('#s_filename_template')) $('#s_filename_template').value = fnTemplate;
    }
    const r = await api('POST', '/api/settings', {
      output_dir: $('#s_output_dir').value,
      filename_template: fnTemplate,
      remove_watermark: $('#s_remove_watermark').checked,
      wait_minutes: +$('#s_wait_minutes').value || 20,
      recover_wait_minutes: +$('#s_recover_wait_minutes')?.value || 20,
      pause_min_s: +$('#s_pause_min_s').value || 0,
      pause_max_s: +$('#s_pause_max_s').value || 0,
      auto_rotate: $('#s_auto_rotate').checked,
      prompt_duration_hint: $('#s_prompt_duration_hint').checked,
      notify_sound: $('#s_notify_sound').checked,
      notify_os: $('#s_notify_os').checked,
      theme: Settings.theme,
      proxy_mode: $('#s_proxy_mode')?.value || S.meta?.settings?.proxy_mode || 'topproxy',
      topproxy_key: ($('#s_topproxy_key')?.value || S.meta?.settings?.topproxy_key || '').trim(),
      proxy_pool: ($('#s_proxy_pool')?.value || (S.meta?.settings?.proxy_pool || []).join('\n')),
      tor_region: $('#s_tor_region')?.value || S.meta?.settings?.tor_region || 'no_us',
      telegram_token: ($('#s_telegram_token')?.value || '').trim(),
      telegram_chat_id: ($('#s_telegram_chat_id')?.value || '').trim(),
      telegram_send_screenshot: $('#s_telegram_screenshot') ? $('#s_telegram_screenshot').checked : true,
      telegram_notify_video_err: $('#s_telegram_notify_video_err') ? $('#s_telegram_notify_video_err').checked : true,
      telegram_notify_login_err: $('#s_telegram_notify_login_err') ? $('#s_telegram_notify_login_err').checked : true,
    });
    S.meta.settings = r.settings;
    if (window.Composer) Composer.updateOutputDirDisplay?.();
    if (window.Gallery) Gallery.load?.();
    toast('Đã lưu cài đặt thành công!' + (r.rejected_keys.length ? ` (bỏ qua: ${r.rejected_keys.join(', ')})` : ''));
    if ($('#s_session_interval_h')) $('#s_session_interval_h').value = r.settings.session_health_interval || 2;
    if ($('#s_tele_badge')) {
      const hasTele = !!(r.settings.telegram_token && r.settings.telegram_chat_id);
      $('#s_tele_badge').textContent = hasTele ? 'Đã kích hoạt' : 'Chưa kích hoạt';
      $('#s_tele_badge').style.background = hasTele ? 'rgba(34,197,94,0.18)' : 'rgba(100,116,139,0.2)';
      $('#s_tele_badge').style.color = hasTele ? '#4ade80' : '#94a3b8';
    }
    await App.refresh();
  } catch (err) { $('#settingserr').textContent = err.message; }
  finally { $('#settingsgo').disabled = false; }
});

// Telegram Test Button Listener
$('#s_btn_test_telegram')?.addEventListener('click', async () => {
  const token = ($('#s_telegram_token')?.value || '').trim();
  const chatId = ($('#s_telegram_chat_id')?.value || '').trim();
  const resEl = $('#s_telegram_test_res');
  const btn = $('#s_btn_test_telegram');
  if (!token || !chatId) {
    if (resEl) {
      resEl.textContent = '❌ Vui lòng nhập Bot Token và Chat ID trước khi test.';
      resEl.style.color = 'var(--bad, #ef4444)';
    }
    return;
  }
  btn.disabled = true;
  const oldText = btn.textContent;
  btn.textContent = '⏳ Đang gửi...';
  if (resEl) {
    resEl.textContent = 'Đang gửi tin nhắn test tới Telegram...';
    resEl.style.color = 'var(--ink-2)';
  }
  try {
    const r = await api('POST', '/api/settings/test-telegram', { token, chat_id: chatId });
    if (resEl) {
      resEl.textContent = '✅ ' + (r.message || 'Kết nối Telegram thành công! Hãy kiểm tra tin nhắn Telegram.');
      resEl.style.color = 'var(--good, #10b981)';
    }
    toast('✅ Gửi tin nhắn test Telegram thành công!');
  } catch (err) {
    if (resEl) {
      resEl.textContent = '❌ ' + err.message;
      resEl.style.color = 'var(--bad, #ef4444)';
    }
    toast('Lỗi test Telegram: ' + err.message, 'err');
  } finally {
    btn.disabled = false;
    btn.textContent = oldText;
  }
});

// Telegram Onboarding / Setup Modal Logic
Settings.initTelegramModal = function () {
  const modal = $('#telegram-setup-modal');
  if (!modal) return;

  const checkOnboarding = () => {
    try {
      const done = localStorage.getItem('telegram_onboarding_done');
      const hasToken = S.meta?.settings?.telegram_token || S.meta?.settings?.has_telegram_token;
      if (!done && !hasToken) {
        setTimeout(() => {
          if (!modal.hidden) return;
          openModal(modal);
        }, 1500);
      }
    } catch (_) {}
  };

  $('#tele_modal_skip')?.addEventListener('click', () => {
    try { localStorage.setItem('telegram_onboarding_done', '1'); } catch (_) {}
    closeModal(modal);
    toast('Đã bỏ qua. Bạn có thể cài đặt Telegram Bot bất kỳ lúc nào trong tab Cài đặt.');
  });

  $('#tele_modal_test')?.addEventListener('click', async () => {
    const token = ($('#tele_modal_token')?.value || '').trim();
    const chatIds = ($('#tele_modal_chat_ids')?.value || '').trim();
    const status = $('#tele_modal_status');
    if (!token || !chatIds) {
      if (status) {
        status.style.display = 'block';
        status.textContent = '❌ Vui lòng nhập Bot Token và ít nhất một Chat ID';
        status.style.color = '#ef4444';
      }
      return;
    }
    if (status) {
      status.style.display = 'block';
      status.textContent = '⏳ Đang kiểm tra kết nối tới Telegram...';
      status.style.color = '#38bdf8';
    }
    try {
      const r = await api('POST', '/api/settings/test-telegram', { token, chat_id: chatIds });
      if (status) {
        status.textContent = '✅ ' + (r.message || 'Kết nối thành công! Đã gửi tin nhắn test tới Admin.');
        status.style.color = '#10b981';
      }
      toast('✅ Kết nối Telegram thành công!');
    } catch (err) {
      if (status) {
        status.textContent = '❌ ' + err.message;
        status.style.color = '#ef4444';
      }
      toast('Lỗi test Telegram: ' + err.message, 'err');
    }
  });

  $('#tele_modal_save')?.addEventListener('click', async () => {
    const token = ($('#tele_modal_token')?.value || '').trim();
    const chatIds = ($('#tele_modal_chat_ids')?.value || '').trim();
    const screenshot = !!$('#tele_modal_screenshot')?.checked;
    const notifyErr = !!$('#tele_modal_notify_error')?.checked;

    if (!token || !chatIds) {
      return toast('Vui lòng nhập Bot Token và Chat ID trước khi lưu', 'err');
    }

    try {
      const r = await api('POST', '/api/settings', {
        telegram_token: token,
        telegram_chat_id: chatIds,
        telegram_send_screenshot: screenshot,
        telegram_notify_video_err: notifyErr,
        telegram_notify_login_err: notifyErr
      });
      if (S.meta) S.meta.settings = r.settings;
      try { localStorage.setItem('telegram_onboarding_done', '1'); } catch (_) {}
      closeModal(modal);
      Settings.populate();
      toast('✅ Đã lưu cấu hình Telegram Bot thành công!');
    } catch (err) {
      toast('Lỗi lưu cấu hình: ' + err.message, 'err');
    }
  });

  checkOnboarding();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Settings.initTelegramModal());
} else {
  Settings.initTelegramModal();
}



// ==================== BATCH PROXY CHECKER (ALEX BRIGHT OVERHAUL) ====================
Settings.initProxyBatchChecker = function () {
  const btn = $('#s_btn_check_all_proxies');
  const resContainer = $('#s_proxy_check_results');
  if (!btn || !resContainer) return;

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    const oldText = btn.innerHTML;
    btn.innerHTML = '⏳ Đang kiểm tra toàn bộ proxy...';
    resContainer.style.display = 'block';
    resContainer.innerHTML = '<span style="color:#38bdf8;font-size:12px">Đang kết nối kiểm tra các key xoay và proxy tĩnh...</span>';

    try {
      const topKeys = ($('#s_topproxy_keys')?.value || $('#s_topproxy_key')?.value || '').trim().split(/[\r\n,;]+/).map(k => k.trim()).filter(Boolean);
      const staticProxies = ($('#s_proxy_pool')?.value || '').trim().split(/[\r\n]+/).map(p => p.trim()).filter(Boolean);

      const rows = [];

      // Test rotating keys
      if (topKeys.length > 0) {
        try {
          const res = await api('POST', '/api/proxy/check-rotating', { keys: topKeys });
          const items = Array.isArray(res.results) ? res.results : [res];
          items.forEach((item, idx) => {
            rows.push({
              idx: idx + 1,
              type: 'Proxy Xoay',
              target: (item.key ? item.key.slice(0, 8) + '...' : 'Key #' + (idx + 1)),
              ok: !!item.ok,
              ip: item.ip || item.proxyhttp || '—',
              location: item.location || '—',
              isp: item.isp || '—',
              error: item.error || item.message || ''
            });
          });
        } catch (err) {
          rows.push({ idx: 1, type: 'Proxy Xoay', target: 'TopProxy Keys', ok: false, error: err.message });
        }
      }

      // Test static proxies
      if (staticProxies.length > 0) {
        try {
          const res = await api('POST', '/api/proxy/check', { proxies: staticProxies });
          (res.results || []).forEach((item, idx) => {
            rows.push({
              idx: rows.length + 1,
              type: 'Proxy Tĩnh',
              target: item.text ? item.text.replace(/:[^:]+@/, ':***@') : ('Proxy #' + (idx + 1)),
              ok: !!item.ok,
              ip: item.ip || '—',
              location: item.ms ? (item.ms + 'ms') : '—',
              isp: item.ok ? 'Live' : 'Dead',
              error: item.error || ''
            });
          });
        } catch (err) {
          rows.push({ idx: rows.length + 1, type: 'Proxy Tĩnh', target: 'Proxy Pool', ok: false, error: err.message });
        }
      }

      if (!rows.length) {
        resContainer.innerHTML = '<span style="color:#94a3b8;font-size:12px">Chưa có proxy nào để kiểm tra. Vui lòng nhập Key Proxy Xoay hoặc danh sách Proxy Tĩnh ở trên.</span>';
        return;
      }

      const liveCount = rows.filter(r => r.ok).length;
      const deadCount = rows.length - liveCount;

      let tableHtml = `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <span style="font-weight:700;font-size:12px;color:#f1f5f9">Kết quả kiểm tra: <span style="color:#10b981">${liveCount} Live</span> / <span style="color:#ef4444">${deadCount} Dead</span></span>
      </div>
      <table class="proxy-check-table">
        <thead>
          <tr>
            <th style="width:28px">#</th>
            <th style="width:80px">Loại</th>
            <th>Proxy / Key</th>
            <th style="width:80px">Trạng thái</th>
            <th style="width:110px">IP xuất</th>
            <th>Vị trí / Thông tin</th>
          </tr>
        </thead>
        <tbody>`;

      rows.forEach(r => {
        tableHtml += `<tr>
          <td style="color:#64748b">${r.idx}</td>
          <td><span style="font-size:10px;padding:1px 4px;border-radius:3px;background:rgba(255,255,255,0.06)">${esc(r.type)}</span></td>
          <td><code>${esc(r.target)}</code></td>
          <td>${r.ok ? '<span class="pill-live">LIVE</span>' : '<span class="pill-dead">DEAD</span>'}</td>
          <td><b>${esc(r.ip)}</b></td>
          <td style="color:#94a3b8">${esc(r.ok ? (r.location + (r.isp ? ' · ' + r.isp : '')) : (r.error || 'Không kết nối được'))}</td>
        </tr>`;
      });

      tableHtml += '</tbody></table>';
      resContainer.innerHTML = tableHtml;
      toast(`Kiểm tra hoàn tất: ${liveCount} Live, ${deadCount} Dead`);
    } catch (err) {
      resContainer.innerHTML = `<span style="color:#ef4444;font-size:12px">❌ Lỗi kiểm tra: ${esc(err.message)}</span>`;
      toast('Lỗi: ' + err.message, 'err');
    } finally {
      btn.disabled = false;
      btn.innerHTML = oldText;
    }
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Settings.initProxyBatchChecker());
} else {
  Settings.initProxyBatchChecker();
}
window.Settings = Settings;
