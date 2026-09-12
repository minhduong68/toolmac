/* Hộp Cài đặt + chủ đề sáng/tối. */
'use strict';
const Settings = {theme: 'auto'};
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
    if ($('#s_licmid')) $('#s_licmid').value = st.machine_id || $('#licmid')?.value || '';
    if ($('#s_licres')) {
      if (st.ok) {
        if (st.plan === 'trial') {
          $('#s_licres').innerHTML = `<span style="color:#f59e0b;font-weight:700">⏳ BẢN QUYỀN DÙNG THỬ · ${esc(st.remaining_time || 'Đang hiệu lực')}</span><br><span style="font-size:12px;color:var(--ink-2)">Được phép tạo video 30s không giới hạn số lượng trong suốt thời gian dùng thử.</span>`;
        } else {
          $('#s_licres').innerHTML = `<span style="color:#10b981;font-weight:700">💎 BẢN QUYỀN PRO UNLIMITED · ${esc(st.remaining_time || 'Vĩnh viễn')}</span><br><span style="font-size:12px;color:var(--ink-2)">Khách hàng: <b>${esc(st.customer || 'Khách hàng')}</b> · Tạo video 30s không giới hạn</span>`;
        }
      } else {
        $('#s_licres').innerHTML = `<span style="color:#ef4444;font-weight:600">🔒 Chưa kích hoạt: ${esc(st.reason || 'Vui lòng gửi Mã máy cho Admin để cấp quyền')}</span>`;
      }
    }
  } catch (e) {
    if ($('#s_licmid')) $('#s_licmid').value = $('#licmid')?.value || '';
  }
};

Settings.open = function () {
  const s = S.meta && S.meta.settings; if (!s) return toast('Chưa tải được cài đặt, thử lại sau', 'err');
  $('#s_output_dir').value = s.output_dir; $('#s_filename_template').value = s.filename_template;
  $('#s_remove_watermark').checked = s.remove_watermark; $('#s_wait_minutes').value = s.wait_minutes;
  $('#s_pause_min_s').value = s.pause_min_s; $('#s_pause_max_s').value = s.pause_max_s;
  $('#s_auto_rotate').checked = s.auto_rotate; $('#s_prompt_duration_hint').checked = s.prompt_duration_hint !== false; $('#s_notify_sound').checked = s.notify_sound; $('#s_notify_os').checked = s.notify_os;
  $('#s_proxy_pool').value = (s.proxy_pool || []).join('\n'); if ($('#s_tor_region')) $('#s_tor_region').value = s.tor_region || 'no_us'; $('#s_proxyres').textContent = ''; $('#s_proxylist').hidden = true;
  $('#settingserr').textContent = '';
  seg($('#s_theme'), THEMES.map(([v, l, sub]) => ({v, label: l, sub})), s.theme, v => Settings.applyTheme(v));
  Settings.preview();
  Settings.loadLicense();
  openModal($('#settingsbox'));
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
      `<div class="${x.ok ? 'good' : 'bad'}">${esc(x.proxy)} — ${x.ok ? 'ok (' + x.latency_ms + 'ms)' : esc(x.error)}</div>`
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

$('#settingsform').addEventListener('submit', async e => {
  e.preventDefault(); $('#settingserr').textContent = ''; $('#settingsgo').disabled = true;
  try {
    const r = await api('POST', '/api/settings', {
      output_dir: $('#s_output_dir').value, filename_template: $('#s_filename_template').value,
      remove_watermark: $('#s_remove_watermark').checked, wait_minutes: +$('#s_wait_minutes').value,
      pause_min_s: +$('#s_pause_min_s').value || 0, pause_max_s: +$('#s_pause_max_s').value || 0,
      auto_rotate: $('#s_auto_rotate').checked, prompt_duration_hint: $('#s_prompt_duration_hint').checked, notify_sound: $('#s_notify_sound').checked, notify_os: $('#s_notify_os').checked,
      theme: Settings.theme, proxy_pool: $('#s_proxy_pool').value, tor_region: $('#s_tor_region')?.value || 'no_us',
    });
    S.meta.settings = r.settings;
    closeModal($('#settingsbox'));
    toast('Đã lưu cài đặt' + (r.rejected_keys.length ? ` (bỏ qua: ${r.rejected_keys.join(', ')})` : ''));
    await App.refresh();
  } catch (err) { $('#settingserr').textContent = err.message; }
  finally { $('#settingsgo').disabled = false; }
});
