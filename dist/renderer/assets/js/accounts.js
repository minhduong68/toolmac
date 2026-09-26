/* Tab Tài khoản: KPI, cảnh báo phiên, bảng (tìm/sắp xếp), proxy, nghỉ, thêm nhiều nick. */
'use strict';
const Accounts = {lastJson: '', ckTarget: null, proxyTarget: null, currentSubtab: 'all'};
window.Accounts = Accounts;

const ICONS = {
  check: '<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/></svg>',
  cookie: '<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9 4 4 0 0 1-4-4 4 4 0 0 1-5-5z"/><circle cx="8.5" cy="10.5" r=".8"/><circle cx="10" cy="15.5" r=".8"/><circle cx="15" cy="15" r=".8"/></svg>',
  fb: '<svg viewBox="0 0 24 24" width="15" height="15" fill="#1877f2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
  window: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13"/><path d="M9 7V4h6v3"/></svg>',
};

Accounts.ready = p => p.enabled && p.login !== false && p.credits_today !== 0 && !p.resting;

Accounts.render = function (profiles) {
  const ready = profiles.filter(Accounts.ready).length;
  const busy = profiles.filter(p => p.state === 'busy' || p.state === 'login' || p.state === 'starting').length;
  const paused = S.meta && S.meta.paused;
  if ($('#pulse')) {
    $('#pulse').innerHTML = (paused ? `<span class="stat paused"><span class="dot"></span>Hàng đợi đang tạm dừng</span>` : '') +
      `<span class="stat ${busy ? 'on' : ''}"><span class="dot"></span>${busy ? busy + ' tài khoản đang tạo' : 'Không có video đang tạo'}</span><span class="stat">${ready} tài khoản sẵn sàng</span>`;
  }
  if ($('#accready')) $('#accready').textContent = ready ? `${ready} tài khoản có thể nhận` : 'Chưa có tài khoản nào sẵn sàng';
  if ($('#n-accounts')) $('#n-accounts').textContent = profiles.length || '';
  const json = JSON.stringify(profiles) + S.accq + JSON.stringify(S.accsort);
  if (json === Accounts.lastJson) return;
  Accounts.lastJson = json;

  const activeCount = profiles.filter(p => p.login === true).length;
  const errorCount = profiles.filter(p => p.login === false || (p.rest_reason && p.rest_reason.length > 0)).length;
  const allCount = profiles.length;
  const elCntActive = $('#acc_count_active'); if (elCntActive) elCntActive.textContent = activeCount;
  const elCntError = $('#acc_count_error'); if (elCntError) elCntError.textContent = errorCount;
  const elCntAll = $('#acc_count_all'); if (elCntAll) elCntAll.textContent = allCount;

  $$('.acc-subtab-btn').forEach(btn => {
    if (!btn._bound) {
      btn._bound = true;
      btn.addEventListener('click', () => {
        Accounts.currentSubtab = btn.dataset.subtab || 'all';
        $$('.acc-subtab-btn').forEach(b => {
          const isMe = b === btn;
          b.classList.toggle('active', isMe);
          b.classList.toggle('quiet', !isMe);
        });
        Accounts.lastJson = '';
        Accounts.render(S.profiles || []);
      });
    }
  });
  Composer.renderProfileSelect(profiles);
  Jobs.renderAccountFilter(profiles);

  const errToolbar = $('#acc_error_toolbar');
  if (errToolbar) {
    errToolbar.style.display = (Accounts.currentSubtab === 'error') ? 'flex' : 'none';
  }

  const resting = profiles.filter(p => p.resting).length;
  const expiring = profiles.filter(p => p.login === true && p.session_days_left != null && p.session_days_left < 7);
  const noCredit = profiles.filter(p => p.credits_today === 0).length;
  $('#acckpi').innerHTML = [
    ['Tổng nick', profiles.length, ''],
    ['Sẵn sàng', ready, 'đang bật, còn phiên, còn lượt'],
    ['Đang nghỉ', resting + noCredit, 'hết lượt hôm nay / bị giới hạn'],
    ['Sắp hết phiên', expiring.length, 'dưới 7 ngày'],
  ].map(([l, v, s]) => `<div class="kpi"><div class="l">${l}</div><div class="v">${v}${s ? `<small>${s}</small>` : ''}</div></div>`).join('');
  const banner = $('#sessbanner');
  if (expiring.length) {
    banner.hidden = false;
    banner.innerHTML = `<b>${expiring.length} tài khoản sắp hết phiên:</b> ${expiring.map(p => `${esc(p.name)} (${p.session_days_left < 0 ? 'đã hết' : 'còn ' + p.session_days_left + ' ngày'})`).join(', ')}. Nạp cookie mới hoặc đăng nhập lại trước khi hết hạn, không thì nick tự rơi khỏi hàng đợi.`;
  } else banner.hidden = true;

  let rows = profiles.map((p, i) => ({p, i}));
  if (S.accq) { const q = S.accq.toLowerCase(); rows = rows.filter(({p}) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)); }
  if (Accounts.currentSubtab === 'active') {
    rows = rows.filter(({p}) => p.login === true);
  } else if (Accounts.currentSubtab === 'error') {
    rows = rows.filter(({p}) => p.login === false || (p.rest_reason && p.rest_reason.length > 0));
  }
  const k = S.accsort.key;
  if (k) {
    const val = p => k === 'name' ? p.name.toLowerCase() : k === 'session' ? (p.session_days_left ?? -999) : k === 'credits' ? (p.credits_today ?? -1) : (p.last_check || '');
    rows.sort((a, b) => { const x = val(a.p), y = val(b.p); return (x < y ? -1 : x > y ? 1 : 0) * (S.accsort.asc ? 1 : -1); });
  }
  $$('#acctbl th.sortable').forEach(th => { th.classList.toggle('sorted', th.dataset.sort === k); th.classList.toggle('asc', th.dataset.sort === k && S.accsort.asc); });

  $('#acclist').innerHTML = rows.map(({p, i}) => {
    const isBusy = !!p.current_job;
    const isLoggedOut = p.login === false;
    const isVang = isLoggedOut;
    const isExhausted = (p.credits_today === 0 || p.resting || !!p.rest_until);
    const canForceUse = !isVang && (isExhausted || !p.enabled);
    const live = p.login === true
      ? '<span class="pill live">LIVE</span>'
      : isVang
      ? '<span class="pill dead" style="background:#ef4444;color:#fff;font-weight:700" title="Phiên Dola bị thu hồi hoặc hết hạn — Vui lòng đăng nhập lại">⚠️ BỊ VĂNG DOLA</span><div class="sub2" style="color:#ef4444;font-weight:700;margin-top:2px">Yêu cầu đăng nhập lại</div>'
      : '<span class="pill">CHƯA KIỂM</span>';
    const rest = p.resting ? `<div class="sub2" style="margin-top:2px"><span class="pill rest" title="${esc(p.rest_reason || '')}">NGHỈ TỚI ${fmtHM(p.rest_until)}</span>${canForceUse ? `<button class="btn sm" data-act="wake" ${isBusy ? 'disabled' : ''} style="background:#10b981;color:#fff;border-color:#10b981;font-size:10px;font-weight:700;padding:1px 6px;border-radius:4px;cursor:pointer;margin-left:4px;display:inline-flex;align-items:center;gap:2px" title="Bỏ nghỉ, kích hoạt lại để nhận video ngay">⚡ Dùng tiếp</button>` : ''}</div>` : '';
    let session = '<span class="muted">—</span>';
    if (p.login === true) {
      if (p.session_days_left == null) session = '<span class="muted">chưa rõ hạn</span>';
      else if (p.session_days_left < 0) session = '<span class="bad">đã hết hạn</span>';
      else session = `<b class="${p.session_days_left < 7 ? 'warn-t' : 'ok'}">${p.session_days_left}</b> ngày<div class="sub2">hết ${fmtDMY(p.session_expires)}</div>`;
    }
    let credit = p.credits_today == null ? '<span class="muted">chưa rõ</span>' : p.credits_today === 0 ? '<span class="bad">hết hôm nay</span>' : `<b class="ok">${p.credits_today}</b> còn lại`;
    if (canForceUse && p.credits_today === 0) {
      credit += `<div style="margin-top:4px"><button class="btn sm" data-act="wake" ${isBusy ? 'disabled' : ''} style="background:#10b981;color:#fff;border-color:#10b981;font-size:11px;font-weight:700;padding:2px 8px;border-radius:5px;cursor:pointer;display:inline-flex;align-items:center;gap:3px;white-space:nowrap;box-shadow:0 1px 4px rgba(16,185,129,0.3)" title="Kích hoạt lại tài khoản này để tiếp tục tạo video (bỏ qua giới hạn hết credit hôm nay)">⚡ Dùng tiếp</button></div>`;
    }
    const proxy = p.proxy ? `<div class="proxy" data-act="proxy" title="Proxy riêng — mọi lượt tạo, đăng nhập, kiểm tra đều đi IP này. Bấm để đổi.">${p.proxy_rotate ? '<span style="color:#0284c7;font-weight:700" title="Proxy xoay 70s">🔄 70s</span> ' : ''}${esc(p.proxy_masked)}</div>` : `<div class="proxy muted" data-act="proxy" title="Chưa có proxy riêng: đi thẳng bằng IP máy. Bấm để đặt.">đi IP máy</div>`;
    return `<tr class="${p.enabled ? '' : 'off'}" data-id="${esc(p.id)}">
      <td style="text-align:center"><input type="checkbox" class="acc-select" data-id="${esc(p.id)}" style="cursor:pointer"></td>
      <td class="num">${i + 1}</td>
      <td><div class="name" title="Bấm để đổi tên">${esc(p.name)}</div><div class="sub2">${esc(p.id)}${p.created ? ' · tạo ' + fmtDMY(p.created) : ''}</div><div style="margin-top:4px;display:flex;flex-direction:column;gap:3px">
        <div style="display:inline-flex;align-items:center;gap:4px;background:rgba(245,158,11,0.14);color:#d97706;padding:2px 7px;border-radius:5px;font-size:11px;font-weight:700;width:fit-content;border:1px solid rgba(245,158,11,0.25)" title="Cookie Dola là phiên đăng nhập CHÍNH để tạo video">
          🍪 Cookie Dola (Đăng nhập chính)${p.dola_session_snippet ? ` · <span style="font-family:monospace;font-size:10px">${esc(p.dola_session_snippet)}</span>` : ''}
        </div>
        ${p.dola_uid ? `<div class="sub2" style="font-size:11px;color:var(--ink-2)">UID Dola: <code style="color:var(--accent,#7c5cff);font-weight:600">${esc(p.dola_uid)}</code></div>` : ''}
        ${p.login_method === 'fb_cred' ? `<div class="sub2" style="color:#1877f2;font-size:11px;font-weight:600">📘 FB (Phụ để cấp cookie qua TK|MK)</div>` : ''}
        ${p.login_method === 'fb_cookie' ? `<div class="sub2" style="color:#3b82f6;font-size:11px;font-weight:600">📘 FB (Phụ để cấp cookie qua Cookie)</div>` : ''}
        ${p.login_method === 'google' ? `<div class="sub2" style="color:#ea4335;font-size:11px;font-weight:600">🔴 Google (Phụ để cấp cookie)</div>` : ''}
      </div></td>
      <td>${live}<div class="sub2"><span class="dot ${esc(p.state)}"></span>${PSTATE[p.state] || esc(p.state)}${p.enabled ? '' : ' · đã tắt'}</div>${rest}</td>
      <td>${session}</td>
      <td>${credit}</td>
      <td>${proxy}</td>
      <td class="when">${fmtHMDM(p.last_check)}</td>
      <td style="vertical-align:middle;text-align:center;padding:6px 4px">
        <div style="display:flex;flex-direction:column;gap:3px;align-items:center;margin:0 auto;width:max-content">
          ${canForceUse ? `<button class="btn sm" data-act="wake" ${isBusy ? 'disabled' : ''} style="background:#10b981;color:#fff;border-color:#10b981;font-size:11px;font-weight:700;padding:2px 8px;border-radius:6px;display:inline-flex;align-items:center;gap:3px;white-space:nowrap;width:86px;justify-content:center;box-shadow:0 1px 4px rgba(16,185,129,0.3)" title="Kích hoạt lại nick này để tiếp tục nhận video (bỏ qua trạng thái nghỉ/0 credit)">⚡ Dùng tiếp</button>` : ''}
          <button class="btn sm" data-act="reset_credit" ${isBusy ? 'disabled' : ''} style="background:#ef4444;color:#fff;border-color:#ef4444;font-size:11px;font-weight:600;padding:2px 8px;border-radius:6px;display:inline-flex;align-items:center;gap:3px;white-space:nowrap;width:86px;justify-content:center" title="Mở Chrome (không ẩn) để xóa nick Dola cũ và đăng nhập lại bằng FB để nhận credit mới">⚡ Reset</button>
          ${(p.has_google_cred || p.login_method === 'google')
            ? `<button class="btn sm" data-act="relogin_google" ${isBusy ? 'disabled' : ''} style="background:#ea4335;color:#fff;border-color:#ea4335;font-size:11px;font-weight:600;padding:2px 8px;border-radius:6px;display:inline-flex;align-items:center;gap:3px;white-space:nowrap;width:86px;justify-content:center" title="Tự động đăng nhập lại Google để cấp lại phiên Dola mới">🔄 Cấp lại GG</button>`
            : `<button class="btn sm" data-act="relogin_fb" ${isBusy ? 'disabled' : ''} style="background:#1877f2;color:#fff;border-color:#1877f2;font-size:11px;font-weight:600;padding:2px 8px;border-radius:6px;display:inline-flex;align-items:center;gap:3px;white-space:nowrap;width:86px;justify-content:center" title="Tự động cấp lại phiên Dola bằng thông tin Facebook đã lưu">🔄 Cấp lại FB</button>`}
        </div>
      </td>
      <td class="acts" style="vertical-align:middle;text-align:center;padding:6px 4px">
        <div style="display:grid;grid-template-columns:repeat(4,28px);gap:3px;justify-content:center;margin:0 auto;width:max-content">
          <button class="ico" data-act="check" ${isBusy ? 'disabled' : ''} title="Kiểm tra đăng nhập và credit (kéo cửa sổ Chrome ra để xem)" style="margin:0">${ICONS.check}</button>
          <button class="ico" data-act="window" title="Mở trình duyệt Chrome của tài khoản này" style="margin:0">${ICONS.window}</button>
          <button class="ico" data-act="cookie" ${isBusy ? 'disabled' : ''} title="Nạp cookie mới cho tài khoản này — không mở cửa sổ" style="margin:0">${ICONS.cookie}</button>
          <button class="ico" data-act="export_cookie" ${isBusy ? 'disabled' : ''} title="Xuất Cookie Dola của tài khoản này (JSON / text)" style="margin:0">📤</button>
          <button class="ico" data-act="cookie_fb" ${isBusy ? 'disabled' : ''} title="Cập nhật cookie Facebook để tự động đăng nhập Dola" style="margin:0">${ICONS.fb}</button>
          <button class="ico" data-act="login" ${isBusy ? 'disabled' : ''} title="Đăng nhập Google: chỉ mở cửa sổ khi tài khoản thật sự chưa đăng nhập" style="margin:0"><b>G</b></button>
          <button class="ico" data-act="toggle" title="${p.enabled ? 'Ngừng nhận video tự động' : 'Cho nhận video tự động'}" style="margin:0">${p.enabled ? ICONS.pause : ICONS.play}</button>
          <button class="ico danger" data-act="delete" ${isBusy ? 'disabled' : ''} title="Xoá tài khoản khỏi app (xoá cả phiên đăng nhập trên máy này)" style="margin:0">${ICONS.trash}</button>
        </div>
      </td></tr>`;
  }).join('') || `<tr><td colspan="10" class="hint">${profiles.length ? 'Không có tài khoản nào khớp từ khoá.' : 'Chưa có tài khoản nào. Bấm «+ Dán cookie» (không cần mở Chrome), «+ Thêm nhiều nick» hoặc «+ Đăng nhập Google».'}</td></tr>`;

  $('#acclist').querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', async () => {
    const id = b.closest('tr').dataset.id, p = profiles.find(x => x.id === id); $('#perr').textContent = '';
    try {
      const act = b.dataset.act;
      if (act === 'export_cookie') {
        try {
          const res = await api('GET', `/api/profiles/${id}/cookies`);
          if (!res || !res.cookies || !res.cookies.length) {
            toast(`Tài khoản «${p.name}» chưa có cookie Dola nào trong máy.`, 'err');
            return;
          }
          Accounts.showCookieExportModal(p.id, p.name, res.cookies, res.cookie_string);
        } catch (err) {
          toast(`Lỗi xuất cookie: ${err.message}`, 'err');
        }
        return;
      }
      else if (act === 'toggle') { await api('PATCH', '/api/profiles/' + id, {enabled: !p.enabled}); toast(p.enabled ? `Đã tắt ${p.name}` : `Đã bật ${p.name}`); }
      else if (act === 'cookie') { Accounts.openCookieBox(p); return; }
      else if (act === 'cookie_fb') { Accounts.openFbCookieBox(p); return; }
      else if (act === 'proxy') { Accounts.openProxyBox(p); return; }
      else if (act === 'relogin_fb') {
        toast(`Đang tự động đăng nhập Facebook để cấp lại phiên Dola cho «${p.name}»...`);
        b.disabled = true;
        const origText = b.innerHTML;
        b.innerHTML = '⏳ Đang cấp lại...';
        try {
          const res = await api('POST', `/api/profiles/${id}/relogin-fb`);
          toast(`Cấp lại phiên Dola thành công cho «${p.name}»! (${res.profile?.login ? 'Đã đăng nhập' : 'Hoàn tất'})`);
        } catch (err) {
          toast(`Lỗi cấp lại phiên FB: ${err.message}`, 'err');
        } finally {
          b.disabled = false;
          b.innerHTML = origText;
          Accounts.lastJson = '';
          await App.refresh();
        }
        return;
      }
      else if (act === 'relogin_google') {
        toast(`Đang tự động đăng nhập Google để cấp lại phiên Dola cho «${p.name}»...`);
        b.disabled = true;
        const origText = b.innerHTML;
        b.innerHTML = '⏳ Đang cấp lại...';
        try {
          const res = await api('POST', `/api/profiles/${id}/relogin-google`);
          toast(`Cấp lại phiên Google thành công cho «${p.name}»! (${res.profile?.login ? 'Đã đăng nhập' : 'Hoàn tất'})`);
        } catch (err) {
          toast(`Lỗi cấp lại phiên Google: ${err.message}`, 'err');
        } finally {
          b.disabled = false;
          b.innerHTML = origText;
          Accounts.lastJson = '';
          await App.refresh();
        }
        return;
      }
      else if (act === 'reset_credit') {
        toast(`Đang mở Chrome để Auto Reset Credit cho «${p.name}» (chạy trực tiếp không qua proxy)...`);
        b.disabled = true;
        const origText = b.innerHTML;
        b.innerHTML = '⏳ Khởi động...';
        let lastSeq = 0;
        try { const cur = await api('GET', '/api/logs?limit=1'); lastSeq = cur.last_seq || 0; } catch {}
        const pollTimer = setInterval(async () => {
          try {
            const r = await api('GET', `/api/logs?since=${lastSeq}&scope=${encodeURIComponent(p.name)}`);
            if (r.entries && r.entries.length) {
              lastSeq = r.last_seq;
              const lastMsg = r.entries[r.entries.length - 1].msg;
              b.innerHTML = `⏳ ${lastMsg.slice(0, 24)}...`;
            }
          } catch {}
        }, 1000);
        try {
          const res = await api('POST', `/api/profiles/${id}/reset-credit`);
          toast(`Reset credit thành công cho «${p.name}»! Credit mới: ${res.credits ?? 10}`);
        } catch (err) {
          toast(`Lỗi reset credit: ${err.message}`, 'err');
        } finally {
          clearInterval(pollTimer);
          b.disabled = false;
          b.innerHTML = origText;
          Accounts.lastJson = '';
          await App.refresh();
        }
        return;
      }
      else if (act === 'wake') {
        if (p.login === false) {
          toast(`Tài khoản «${p.name}» đã bị văng phiên Dola, bắt buộc phải đăng nhập lại!`, 'err');
          return;
        }
        b.disabled = true;
        const origText = b.innerHTML;
        b.innerHTML = '⏳ Đang kích hoạt...';
        try {
          await api('POST', `/api/profiles/${id}/wake`);
          toast(`Đã kích hoạt lại «${p.name}» thành công, sẵn sàng nhận video!`);
        } catch (err) {
          toast(`Lỗi kích hoạt: ${err.message}`, 'err');
        } finally {
          b.disabled = false;
          b.innerHTML = origText;
          Accounts.lastJson = '';
          await App.refresh();
        }
        return;
      }
      else if (act === 'delete') {
        const ok = await confirmBox({title: 'Xoá tài khoản?', msg: `Xoá «${p.name}» khỏi app và xoá phiên đăng nhập của nó trên máy này. Job đang chờ trên nick này bị huỷ. Tài khoản Dola không bị ảnh hưởng.`, ok: 'Xoá', danger: true});
        if (!ok) return;
        await api('DELETE', `/api/profiles/${id}`); toast('Đã xoá tài khoản');
      }
      else if (act === 'window') {
        await api('POST', `/api/profiles/${id}/window`, {show: true, mode: 'browser'});
        toast(`Đang mở trình duyệt Chrome cho ${p.name}`);
      }
      else {
        await api('POST', `/api/profiles/${id}/${act}`);
        if (act === 'check') toast(`Đang kiểm tra ${p.name}`);
        else toast(`Đang kiểm tra phiên của ${p.name}; chưa đăng nhập thì cửa sổ Google sẽ mở`);
      }
      Accounts.lastJson = ''; await App.refresh();
    } catch (err) { $('#perr').textContent = err.message; }
  }));
  $('#acclist').querySelectorAll('.name').forEach(el => el.addEventListener('click', () => {
    if (el.querySelector('input')) return;
    const id = el.closest('tr').dataset.id, old = el.textContent;
    el.innerHTML = `<input type="text" value="${esc(old)}" aria-label="Tên tài khoản">`;
    const inp = el.querySelector('input'); inp.focus(); inp.select();
    let done = false;
    const finish = async save => {
      if (done) return; done = true;
      const name = inp.value.trim();
      if (save && name && name !== old) { try { await api('PATCH', '/api/profiles/' + id, {name}); toast('Đã đổi tên'); } catch (err) { $('#perr').textContent = err.message; } }
      Accounts.lastJson = ''; await App.refresh();
    };
    inp.addEventListener('keydown', ev => { if (ev.key === 'Enter') finish(true); if (ev.key === 'Escape') finish(false); });
    inp.addEventListener('blur', () => finish(true));
  }));
};

$$('#acctbl th.sortable').forEach(th => th.addEventListener('click', () => {
  const k = th.dataset.sort;
  S.accsort = S.accsort.key === k ? {key: S.accsort.asc ? k : '', asc: !S.accsort.asc} : {key: k, asc: true};
  Accounts.render(S.profiles);
}));
$('#accq').addEventListener('input', () => { S.accq = $('#accq').value.trim(); Accounts.render(S.profiles); });

// ------------------------------------------------------------ thêm acc nhanh
let quickAddActiveId = null;

$("#quickadd").addEventListener("click", () => {
  quickAddActiveId = null;
  $("#quickaddname").value = "Nick " + (S.profiles.length + 1);
  $("#quickaddproxy").value = "";
  if ($("#quickaddproxykey")) $("#quickaddproxykey").value = "";
  if ($("#quickaddproxyrotate")) $("#quickaddproxyrotate").checked = false;
  if ($("#quickaddproxykey-wrap")) $("#quickaddproxykey-wrap").hidden = true;
  if ($("#quickaddproxylabel")) $("#quickaddproxylabel").textContent = "Proxy riêng (tuỳ chọn)";
  if ($("#quickaddproxy")) $("#quickaddproxy").placeholder = "host:port:user:pass, gõ \"tor\" (miễn phí), hoặc để trống";
  if ($("#quickaddproxyhint")) $("#quickaddproxyhint").style.display = "none";
  $("#quickadderr").textContent = "";
  $("#quickaddstart").hidden = false;
  $("#quickaddstart").disabled = false;
  $("#quickaddstart").textContent = "🚀 Mở Chrome đăng nhập";
  $("#quickaddconfirm").hidden = true;
  $("#quickaddconfirm").disabled = false;
  $("#quickaddconfirm").textContent = "✅ Đã đăng nhập (Lưu & Đóng tab)";
  $("#quickaddstatus-text").innerHTML = "Nhập tên tài khoản rồi bấm <b>«Mở Chrome đăng nhập»</b> để mở trang Dola.";
  openModal($("#quickaddbox"));
  setTimeout(() => $("#quickaddname").focus(), 50);
});

if ($("#quickaddproxyrotate")) {
  $("#quickaddproxyrotate").addEventListener("change", e => {
    const checked = e.target.checked;
    if ($("#quickaddproxykey-wrap")) $("#quickaddproxykey-wrap").hidden = !checked;
    if ($("#quickaddproxyhint")) $("#quickaddproxyhint").style.display = checked ? "block" : "none";
    if (checked) {
      if ($("#quickaddproxylabel")) $("#quickaddproxylabel").textContent = "Proxy / IP ban đầu (tuỳ chọn)";
      if ($("#quickaddproxy")) $("#quickaddproxy").placeholder = "Để trống app tự lấy từ Key xoay...";
      setTimeout(() => $("#quickaddproxykey")?.focus(), 50);
    } else {
      if ($("#quickaddproxylabel")) $("#quickaddproxylabel").textContent = "Proxy riêng (tuỳ chọn)";
      if ($("#quickaddproxy")) $("#quickaddproxy").placeholder = "host:port:user:pass, gõ \"tor\" (miễn phí), hoặc để trống";
    }
  });
}

$("#quickaddname").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (!$("#quickaddstart").hidden && !$("#quickaddstart").disabled) $("#quickaddstart").click();
    else if (!$("#quickaddconfirm").hidden && !$("#quickaddconfirm").disabled) $("#quickaddconfirm").click();
  }
});
$("#quickaddproxy").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (!$("#quickaddstart").hidden && !$("#quickaddstart").disabled) $("#quickaddstart").click();
  }
});

$("#quickaddstart").addEventListener("click", async () => {
  $("#quickadderr").textContent = "";
  const name = $("#quickaddname").value.trim() || ("Nick " + (S.profiles.length + 1));
  const isRotate = !!$("#quickaddproxyrotate")?.checked;
  const proxyKey = isRotate ? ($("#quickaddproxykey")?.value.trim() || null) : null;
  const proxy = $("#quickaddproxy").value.trim() || undefined;
  if (isRotate && !proxyKey) {
    $("#quickadderr").textContent = "Vui lòng nhập Key proxy xoay (proxyxoay.shop).";
    $("#quickaddproxykey")?.focus();
    return;
  }
  $("#quickaddstart").disabled = true;
  $("#quickaddstart").textContent = "Đang khởi động Chrome…";
  $("#quickaddstatus-text").innerHTML = "<span class=\"dot starting\"></span> Đang tạo profile Chrome và kết nối trang Dola…";
  try {
    const res = await api("POST", "/api/profiles/quick-add/start", { name, proxy, proxy_rotate: isRotate, proxy_key: proxyKey });
    quickAddActiveId = res.profile.id;
    $("#quickaddstart").hidden = true;
    $("#quickaddconfirm").hidden = false;
    $("#quickaddconfirm").disabled = false;
    $("#quickaddstatus-text").innerHTML = "🌐 <b>Cửa sổ Chrome Dola đang mở!</b><br>1. Hãy đăng nhập tài khoản Dola trên cửa sổ Chrome đó.<br>2. Đăng nhập xong, quay lại đây bấm <b>«✅ Đã đăng nhập (Lưu & Đóng tab)»</b>.";
  } catch (err) {
    $("#quickadderr").textContent = err.message;
    $("#quickaddstart").disabled = false;
    $("#quickaddstart").textContent = "🚀 Mở Chrome đăng nhập";
    $("#quickaddstatus-text").textContent = "Có lỗi khi mở trình duyệt: " + err.message;
  }
});

$("#quickaddconfirm").addEventListener("click", async () => {
  if (!quickAddActiveId) return;
  $("#quickadderr").textContent = "";
  const name = $("#quickaddname").value.trim();
  $("#quickaddconfirm").disabled = true;
  $("#quickaddconfirm").textContent = "Đang kiểm tra & lưu cookie…";
  try {
    const res = await api("POST", "/api/profiles/quick-add/confirm", { id: quickAddActiveId, name });
    closeModal($("#quickaddbox"));
    toast("Đã thêm tài khoản «" + res.profile.name + "» thành công!");
    quickAddActiveId = null;
    Accounts.lastJson = "";
    await App.refresh();
  } catch (err) {
    $("#quickadderr").textContent = err.message;
    $("#quickaddconfirm").disabled = false;
    $("#quickaddconfirm").textContent = "✅ Đã đăng nhập (Lưu & Đóng tab)";
  }
});

$("#quickaddcancel").addEventListener("click", async () => {
  if (quickAddActiveId) {
    try { await api("POST", "/api/profiles/quick-add/cancel", { id: quickAddActiveId }); } catch (e) {}
    quickAddActiveId = null;
  }
  closeModal($("#quickaddbox"));
  Accounts.lastJson = "";
  await App.refresh();
});

// ------------------------------------------------------------ Đăng nhập bằng Cookie Facebook
let parsedFbAccounts = [];
let isFbLoggingIn = false;
let fbBulkCancelled = false;

function parseFbInput(raw) {
  const result = { uid: null, username: null, password: null, twoFactor: null, cookies: [], cookieCount: 0, type: 'invalid' };
  if (!raw || typeof raw !== "string") return result;
  const str = raw.trim();

  if (str.startsWith("[") && str.endsWith("]")) {
    try {
      const arr = JSON.parse(str);
      if (Array.isArray(arr)) {
        result.cookies = arr.filter(c => c && c.name && c.value);
        result.cookieCount = result.cookies.length;
        const cUser = result.cookies.find(c => c.name === "c_user");
        if (cUser) { result.uid = cUser.value; result.username = cUser.value; }
        if (result.cookieCount > 0 && result.cookies.some(c => c.name === "c_user" || c.name === "xs")) {
          result.type = 'cookie';
        }
        return result;
      }
    } catch {}
  }

  let cookieChunk = "";
  const cUserMatch = str.match(/c_user=(\d+)/);
  if (cUserMatch) result.uid = cUserMatch[1];

  if (str.includes("|")) {
    const parts = str.split("|").map(s => s.trim()).filter(Boolean);
    const cookiePart = parts.find(p => p.includes("c_user=") || p.includes("xs="));
    if (cookiePart) {
      cookieChunk = cookiePart;
    }
    const nonCookieParts = parts.filter(p => p !== cookiePart);
    if (nonCookieParts.length >= 2) {
      result.username = nonCookieParts[0];
      if (/^\d{10,18}$/.test(result.username) && !result.uid) result.uid = result.username;
      result.password = nonCookieParts[1];
      for (let i = 2; i < nonCookieParts.length; i++) {
        const p = nonCookieParts[i].replace(/\s/g, "");
        if (/^[A-Za-z2-7]{14,40}$/.test(p) || /^\d{6}$/.test(p)) {
          if (!result.twoFactor) {
            result.twoFactor = nonCookieParts[i];
            break;
          }
        }
      }
    }
  } else {
    cookieChunk = str;
  }

  if (!cookieChunk && !result.password) {
    const match = str.match(/(?:c_user|xs|fr|datr|sb)=[^|\s]+/g);
    if (match) cookieChunk = match.join(";");
  }

  if (cookieChunk) {
    const pairs = cookieChunk.split(";");
    for (const pair of pairs) {
      const eqIdx = pair.indexOf("=");
      if (eqIdx !== -1) {
        const name = pair.slice(0, eqIdx).trim();
        const value = pair.slice(eqIdx + 1).trim();
        if (name && value) {
          result.cookies.push({ name, value });
          if (name === "c_user" && !result.uid) result.uid = value;
        }
      }
    }
  }
  result.cookieCount = result.cookies.length;
  const hasKeyCookie = result.cookies.some(c => c.name === "c_user" || c.name === "xs");
  if (result.cookieCount > 0 && hasKeyCookie) {
    result.type = 'cookie';
  } else if (result.username && result.password) {
    result.type = 'credentials';
  }
  return result;
}

function parseFbAccountsList(raw) {
  if (!raw || typeof raw !== "string") return [];
  const str = raw.trim();
  if (!str) return [];

  if (str.startsWith("[") && str.endsWith("]")) {
    try {
      const arr = JSON.parse(str);
      if (Array.isArray(arr) && arr.some(c => c && (c.name === "c_user" || c.name === "xs"))) {
        const parsed = parseFbInput(str);
        if (parsed.cookieCount > 0) {
          return [{
            lineIndex: 1,
            raw: str,
            uid: parsed.uid,
            username: parsed.username,
            password: parsed.password,
            twoFactor: parsed.twoFactor,
            cookies: parsed.cookies,
            cookieCount: parsed.cookieCount,
            type: 'cookie',
            valid: true
          }];
        }
      }
    } catch {}
  }

  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  return lines.map((line, idx) => {
    const parsed = parseFbInput(line);
    const valid = parsed.type === 'cookie' || parsed.type === 'credentials';
    return {
      lineIndex: idx + 1,
      raw: line,
      uid: parsed.uid || parsed.username,
      username: parsed.username,
      password: parsed.password,
      twoFactor: parsed.twoFactor,
      cookies: parsed.cookies,
      cookieCount: parsed.cookieCount,
      type: parsed.type,
      valid
    };
  });
}

$("#quickadd-btn-fb")?.addEventListener("click", () => {
  closeModal($("#quickaddbox"));
  $("#quickaddfb").click();
});

$("#quickaddfb").addEventListener("click", () => {
  parsedFbAccounts = [];
  isFbLoggingIn = false;
  fbBulkCancelled = false;
  $("#fbraw").value = "";
  $("#fbaccname").value = "";
  $("#fbproxy").value = "";
  if ($("#fbproxykey")) $("#fbproxykey").value = "";
  if ($("#fbproxyrotate")) $("#fbproxyrotate").checked = false;
  if ($("#fbproxykey-wrap")) $("#fbproxykey-wrap").hidden = true;
  if ($("#fbproxylabel")) $("#fbproxylabel").textContent = "Proxy riêng (tuỳ chọn)";
  if ($("#fbproxy")) $("#fbproxy").placeholder = "host:port:user:pass (mỗi dòng 1 proxy nếu nhiều tài khoản), gõ \"tor\", hoặc để trống";
  if ($("#fbaccnamelabel")) $("#fbaccnamelabel").textContent = "Tên tài khoản (tuỳ chọn)";
  if ($("#fbaccname")) $("#fbaccname").placeholder = "Để trống sẽ tự đặt theo UID FB";
  $("#fbparsedinfo").style.display = "none";
  if ($("#fbparsedwarn")) {
    $("#fbparsedwarn").style.display = "none";
    $("#fbparsedwarn").textContent = "";
  }
  $("#fbautologinerr").textContent = "";
  $("#fbstep1sec").hidden = false;
  $("#fbstep2sec").hidden = true;
  $("#fbstep1tab").style.color = "var(--accent)";
  $("#fbstep1tab").style.borderBottom = "2px solid var(--accent)";
  $("#fbstep2tab").style.color = "var(--ink-3)";
  $("#fbstep2tab").style.borderBottom = "none";
  $("#fbstep2back").textContent = "⬅️ Quay lại";
  $("#fbstep2back").disabled = false;
  $("#fbstartlogin").disabled = false;
  $("#fbstartlogin").textContent = "🚀 Mở trình duyệt & Đăng nhập Dola";
  $("#fbautostatus-text").innerHTML = "Sẵn sàng. Bấm nút dưới để mở trình duyệt và tự động đăng nhập Dola bằng FB.";
  $("#fbstep1next").textContent = "OK / Tiếp tục ➡️";
  openModal($("#quickaddfbbox"));
  setTimeout(() => $("#fbraw").focus(), 50);
});

$("#fbraw").addEventListener("input", () => {
  const text = $("#fbraw").value.trim();
  $("#fbautologinerr").textContent = "";
  if ($("#fbparsedwarn")) {
    $("#fbparsedwarn").style.display = "none";
    $("#fbparsedwarn").textContent = "";
  }
  if (!text) {
    $("#fbparsedinfo").style.display = "none";
    parsedFbAccounts = [];
    return;
  }

  const list = parseFbAccountsList(text);
  const validList = list.filter(item => item.valid);
  const invalidList = list.filter(item => !item.valid);

  if (validList.length === 0) {
    $("#fbparsedinfo").style.display = "none";
    parsedFbAccounts = [];
    return;
  }

  parsedFbAccounts = validList;
  $("#fbparsedinfo").style.display = "block";

  if (list.length === 1 && validList.length === 1) {
    const acc = validList[0];
    const isCreds = acc.type === 'credentials';
    const accDisplayId = acc.uid || acc.username || "Không rõ";
    if ($("#fbparsedlbl")) $("#fbparsedlbl").innerHTML = (isCreds ? 'Tài khoản: ' : 'UID: ') + '<b id="fbparseduid">' + esc(accDisplayId) + '</b>';
    if (isCreds) {
      $("#fbparsedstatus").textContent = "✓ Đã nhận diện Tài khoản FB (" + (acc.twoFactor ? "Pass + 2FA" : "Mật khẩu") + ")";
      $("#fbparsedcookies").textContent = `Tài khoản: ${acc.username} | Mật khẩu: ••••••••` + (acc.twoFactor ? ` | 2FA: Sẵn sàng` : ` | 2FA: Không có`);
    } else {
      $("#fbparsedstatus").textContent = "✓ Đã nhận diện " + acc.cookieCount + " cookie FB";
      $("#fbparsedcookies").textContent = acc.cookies.map(c => c.name).slice(0, 6).join(", ") + (acc.cookies.length > 6 ? "..." : "");
    }
    $("#fbparsedstatus").style.color = "var(--good, #10b981)";
    if ($("#fbaccnamelabel")) $("#fbaccnamelabel").textContent = "Tên tài khoản (tuỳ chọn)";
    if (!$("#fbaccname").value.trim() && accDisplayId && accDisplayId !== "Không rõ") {
      $("#fbaccname").value = "FB - " + accDisplayId;
    }
    $("#fbaccname").placeholder = "Để trống sẽ tự đặt theo UID FB";
    $("#fbstep1next").textContent = "OK / Tiếp tục ➡️";
  } else {
    // Nhiều tài khoản (mỗi dòng 1 nick)
    if ($("#fbparsedlbl")) $("#fbparsedlbl").innerHTML = 'Số lượng: <b id="fbparseduid">' + validList.length + ' tài khoản</b>';
    if (invalidList.length === 0) {
      $("#fbparsedstatus").textContent = `✓ Đã nhận diện ${validList.length}/${list.length} tài khoản hợp lệ`;
      $("#fbparsedstatus").style.color = "var(--good, #10b981)";
    } else {
      $("#fbparsedstatus").textContent = `⚠️ ${validList.length}/${list.length} tài khoản hợp lệ (${invalidList.length} dòng lỗi)`;
      $("#fbparsedstatus").style.color = "var(--warn, #f59e0b)";
      if ($("#fbparsedwarn")) {
        $("#fbparsedwarn").style.display = "block";
        $("#fbparsedwarn").innerHTML = `<b>Bỏ qua dòng lỗi:</b> ` + invalidList.map(item => `Dòng ${item.lineIndex} (cần cookie c_user/xs hoặc UID|Pass|2FA)`).join(", ");
      }
    }
    const uidsPreview = validList.map(a => a.uid || a.username || "Nick").slice(0, 5).join(", ") + (validList.length > 5 ? ` (+${validList.length - 5} nick nữa)` : "");
    $("#fbparsedcookies").textContent = `Danh sách tài khoản: ${uidsPreview}`;
    if ($("#fbaccnamelabel")) $("#fbaccnamelabel").textContent = "Tiền tố tên tài khoản (tuỳ chọn)";
    $("#fbaccname").placeholder = "Để trống sẽ tự đặt FB - UID cho từng tài khoản";
    $("#fbstep1next").textContent = `OK / Tiếp tục (${validList.length} tài khoản) ➡️`;
  }
});

$("#fbstep1next").addEventListener("click", () => {
  const text = $("#fbraw").value.trim();
  if (!text) {
    $("#fbautologinerr").textContent = "Vui lòng nhập cookie Facebook hoặc danh sách dòng tài khoản.";
    $("#fbraw").focus();
    return;
  }
  const list = parseFbAccountsList(text);
  const validList = list.filter(item => item.valid);
  if (validList.length === 0) {
    $("#fbautologinerr").textContent = "Không tìm thấy tài khoản Facebook hợp lệ nào (cần cookie c_user/xs hoặc định dạng UID|Pass|2FA).";
    $("#fbraw").focus();
    return;
  }

  parsedFbAccounts = validList;
  $("#fbautologinerr").textContent = "";
  $("#fbstep1sec").hidden = true;
  $("#fbstep2sec").hidden = false;
  $("#fbstep1tab").style.color = "var(--ink-3)";
  $("#fbstep1tab").style.borderBottom = "none";
  $("#fbstep2tab").style.color = "var(--accent)";
  $("#fbstep2tab").style.borderBottom = "2px solid var(--accent)";

  if (validList.length === 1) {
    if ($("#fbthread-row")) $("#fbthread-row").style.display = "none";
    if ($("#fbheadless")) $("#fbheadless").checked = true;
    $("#fbstartlogin").textContent = "🚀 Mở trình duyệt & Đăng nhập Dola";
    $("#fbautostatus-text").innerHTML = "Sẵn sàng. Bấm nút dưới để mở trình duyệt và tự động đăng nhập Dola bằng FB.";
  } else {
    if ($("#fbthread-row")) $("#fbthread-row").style.display = "flex";
    if ($("#fbheadless")) $("#fbheadless").checked = true;
    const threadCount = $("#fbthreads") ? Math.min(parseInt($("#fbthreads").value, 10) || 10, validList.length) : 10;
    $("#fbstartlogin").textContent = `🚀 Đăng nhập ${validList.length} tài khoản FB (${threadCount} luồng)`;
    $("#fbautostatus-text").innerHTML = `Sẵn sàng đăng nhập <b>${validList.length}</b> tài khoản Facebook song song (tối đa <b>${threadCount}</b> luồng đồng thời).<br><span style="font-size:12px;color:var(--ink-2)">Hệ thống sẽ tự động chạy đa luồng giúp nạp toàn bộ danh sách với tốc độ siêu nhanh.</span>`;
  }
  setTimeout(() => $("#fbproxy").focus(), 50);
});

$("#fbthreads")?.addEventListener("input", () => {
  const val = Math.min(20, Math.max(1, parseInt($("#fbthreads").value, 10) || 1));
  if (parsedFbAccounts && parsedFbAccounts.length > 1) {
    const threadCount = Math.min(val, parsedFbAccounts.length);
    $("#fbstartlogin").textContent = `🚀 Đăng nhập ${parsedFbAccounts.length} tài khoản FB (${threadCount} luồng)`;
  }
});

$("#fbstep1tab").addEventListener("click", () => {
  if (isFbLoggingIn) return;
  $("#fbstep2back").click();
});

$("#fbstep2tab").addEventListener("click", () => {
  if (isFbLoggingIn) return;
  if (parsedFbAccounts && parsedFbAccounts.length > 0) {
    $("#fbstep1next").click();
  }
});

$("#fbstep2back").addEventListener("click", () => {
  if (isFbLoggingIn) {
    fbBulkCancelled = true;
    $("#fbstep2back").disabled = true;
    $("#fbstep2back").textContent = "⏳ Đang dừng các luồng...";
    return;
  }
  $("#fbstep1sec").hidden = false;
  $("#fbstep2sec").hidden = true;
  $("#fbstep1tab").style.color = "var(--accent)";
  $("#fbstep1tab").style.borderBottom = "2px solid var(--accent)";
  $("#fbstep2tab").style.color = "var(--ink-3)";
  $("#fbstep2tab").style.borderBottom = "none";
  $("#fbautologinerr").textContent = "";
});

if ($("#fbproxyrotate")) {
  $("#fbproxyrotate").addEventListener("change", e => {
    const checked = e.target.checked;
    if ($("#fbproxykey-wrap")) $("#fbproxykey-wrap").hidden = !checked;
    if (checked) {
      if ($("#fbproxylabel")) $("#fbproxylabel").textContent = "Proxy / IP ban đầu (tuỳ chọn)";
      if ($("#fbproxy")) $("#fbproxy").placeholder = "Để trống app tự lấy từ Key xoay...";
      setTimeout(() => $("#fbproxykey")?.focus(), 50);
    } else {
      if ($("#fbproxylabel")) $("#fbproxylabel").textContent = "Proxy riêng (tuỳ chọn)";
      if ($("#fbproxy")) $("#fbproxy").placeholder = "host:port:user:pass (mỗi dòng 1 proxy nếu nhiều tài khoản), gõ \"tor\", hoặc để trống";
    }
  });
}

$("#fbstartlogin").addEventListener("click", async () => {
  if (!parsedFbAccounts || parsedFbAccounts.length === 0) return;
  $("#fbautologinerr").textContent = "";

  const total = parsedFbAccounts.length;
  const customName = $("#fbaccname").value.trim();
  const isRotate = !!$("#fbproxyrotate")?.checked;
  const proxyRaw = $("#fbproxy").value.trim();
  const proxyLines = proxyRaw ? proxyRaw.split(/\r?\n/).map(s => s.trim()).filter(Boolean) : [];
  const rotKey = isRotate ? ($("#fbproxykey")?.value.trim() || proxyRaw) : null;

  // Lấy số luồng cài đặt (1 đến 20)
  let concurrency = 1;
  const threadInput = $("#fbthreads");
  if (threadInput) {
    const val = parseInt(threadInput.value, 10);
    if (!isNaN(val) && val >= 1) {
      concurrency = Math.min(20, Math.max(1, val));
    }
  }
  if (total === 1) concurrency = 1;
  concurrency = Math.min(concurrency, total);

  // Tùy chọn chạy ẩn Chrome
  const isHeadless = $("#fbheadless") ? !!$("#fbheadless").checked : (concurrency > 1);

  isFbLoggingIn = true;
  fbBulkCancelled = false;

  $("#fbstartlogin").disabled = true;
  $("#fbstep2back").disabled = false;
  $("#fbstep2back").textContent = "🛑 Dừng lại";

  let successCount = 0;
  let failCount = 0;
  let activeThreads = 0;
  let nextIndex = 0;
  const results = new Array(total);

  const updateStatusUI = () => {
    const completed = successCount + failCount;
    if (total === 1) {
      $("#fbstartlogin").textContent = `⏳ Đang xử lý...`;
      $("#fbautostatus-text").innerHTML =
        `<span class="dot starting"></span> Đang nạp cookie Facebook và tự động đăng nhập Dola. Vui lòng quan sát...`;
    } else {
      $("#fbstartlogin").textContent = `⏳ Đang chạy [${activeThreads} luồng] (${completed}/${total})...`;
      $("#fbautostatus-text").innerHTML =
        `<span class="dot starting"></span> <b>Đang đăng nhập đa luồng (${activeThreads} luồng song song / tối đa ${concurrency})</b><br>` +
        `<span style="font-size:12.5px">Tiến độ: <b>${completed}/${total}</b> ` +
        `(<span style="color:var(--good, #10b981);font-weight:600">${successCount} thành công</span>` +
        (failCount > 0 ? `, <span style="color:var(--bad, #ef4444);font-weight:600">${failCount} lỗi</span>` : "") +
        `)</span>` +
        `<div style="font-size:11.5px;color:var(--ink-2);margin-top:3px">${isHeadless ? '👻 Chế độ ẩn Chrome giúp máy mượt và chạy siêu nhanh' : '🖥️ Đang hiển thị cửa sổ trình duyệt'}</div>`;
    }
  };

  updateStatusUI();

  async function worker() {
    while (nextIndex < total && !fbBulkCancelled) {
      const i = nextIndex++;
      const acc = parsedFbAccounts[i];

      // Tính tên tài khoản
      let accName;
      if (customName) {
        accName = (total === 1) ? customName : (customName + " - " + (acc.uid || (i + 1)));
      } else {
        accName = acc.uid ? ("FB - " + acc.uid) : ("Nick " + (i + 1));
      }

      // Tính proxy cho tài khoản này (vòng lặp proxy)
      let accProxy = null;
      let accProxyKey = null;
      if (isRotate) {
        accProxy = rotKey;
        accProxyKey = rotKey;
      } else if (proxyLines.length > 0) {
        accProxy = proxyLines[i % proxyLines.length];
      }

      activeThreads++;
      updateStatusUI();

      try {
        const res = await api("POST", "/api/profiles/quick-add-fb", {
          fbData: acc.raw,
          name: accName,
          proxy: accProxy || undefined,
          proxy_rotate: isRotate,
          proxy_key: accProxyKey || undefined,
          headless: isHeadless
        });
        successCount++;
        results[i] = { name: res.profile?.name || accName, uid: acc.uid, ok: true };
        toast(`✅ [${successCount + failCount}/${total}] Đã thêm «${res.profile?.name || accName}»`);
        Accounts.lastJson = "";
        App.refresh();
      } catch (err) {
        failCount++;
        const errMsg = err.message || String(err);
        results[i] = { name: accName, uid: acc.uid, ok: false, error: errMsg };
        toast(`❌ Lỗi «${accName}»: ${errMsg}`, "err");
      } finally {
        activeThreads--;
        updateStatusUI();
      }
    }
  }

  // Khởi chạy đồng thời concurrency luồng (stagger nhẹ 250ms để tối ưu tài nguyên hệ thống)
  const workers = [];
  for (let w = 0; w < concurrency; w++) {
    if (fbBulkCancelled || nextIndex >= total) break;
    workers.push(worker());
    if (w < concurrency - 1 && concurrency > 1) {
      await new Promise(r => setTimeout(r, 250));
    }
  }

  await Promise.all(workers);

  isFbLoggingIn = false;
  $("#fbstep2back").textContent = "⬅️ Quay lại";
  $("#fbstep2back").disabled = false;

  const validResults = results.filter(Boolean);
  const ranCount = validResults.length;

  if (total === 1) {
    if (successCount === 1) {
      $("#fbautostatus-text").innerHTML = "🎉 <b>Đăng nhập Dola thành công!</b> Đã lưu phiên cho «" + esc(validResults[0]?.name || "") + "».";
      toast("Đã thêm tài khoản «" + (validResults[0]?.name || "") + "» thành công!");
      setTimeout(() => {
        closeModal($("#quickaddfbbox"));
        parsedFbAccounts = [];
      }, 1200);
      Accounts.lastJson = "";
      await App.refresh();
    } else {
      $("#fbautologinerr").textContent = validResults[0]?.error || "Đăng nhập thất bại.";
      $("#fbstartlogin").disabled = false;
      $("#fbstartlogin").textContent = "🚀 Mở trình duyệt & Đăng nhập Dola";
      $("#fbautostatus-text").textContent = "Đăng nhập thất bại: " + (validResults[0]?.error || "");
    }
  } else {
    // Tổng kết nhiều tài khoản
    if (successCount > 0) {
      let html = `🎉 <b>Hoàn tất!</b> Đã đăng nhập thành công <b>${successCount}/${total}</b> tài khoản (${concurrency} luồng)` +
        (fbBulkCancelled ? " (đã dừng theo yêu cầu)" : "") + ".";
      if (failCount > 0) {
        html += `<div style="margin-top:6px;max-height:90px;overflow-y:auto;color:var(--bad, #ef4444);font-size:12px;line-height:1.4">` +
          `<b>${failCount} tài khoản lỗi:</b><br>` +
          validResults.filter(r => !r.ok).map(r => `• ${esc(r.name)}: ${esc(r.error)}`).join("<br>") +
          `</div>`;
      }
      $("#fbautostatus-text").innerHTML = html;
      toast(`Hoàn thành thêm tài khoản FB: ${successCount}/${total} thành công!`);
      Accounts.lastJson = "";
      await App.refresh();

      if (failCount === 0 && !fbBulkCancelled) {
        setTimeout(() => {
          closeModal($("#quickaddfbbox"));
          parsedFbAccounts = [];
        }, 2200);
      } else {
        $("#fbstartlogin").disabled = false;
        $("#fbstartlogin").textContent = "🚀 Đăng nhập lại các nick lỗi";
      }
    } else {
      $("#fbautologinerr").textContent = `Tất cả ${ranCount} tài khoản đều thất bại. Lỗi: ` + (validResults[0]?.error || "");
      $("#fbautostatus-text").textContent = `Đăng nhập thất bại cho toàn bộ ${ranCount} tài khoản.`;
      $("#fbstartlogin").disabled = false;
      $("#fbstartlogin").textContent = `🚀 Thử lại (${total} tài khoản)`;
    }
  }
});

// ------------------------------------------------------------ thêm bằng Google
// ------------------------------------------------------------ Tự Động Đăng Nhập Google (Bulk Tk|Mk|2FA|Proxy)
let parsedGoogleAccounts = [];
let isGgLoggingIn = false;

function parseGoogleAccountsList(raw) {
  if (!raw) return [];
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  return lines.map((line, idx) => {
    if (line.startsWith("#") || line.startsWith("//")) return { lineIndex: idx + 1, valid: false };
    const parts = line.split("|").map(p => p.trim());
    if (parts.length >= 2) {
      const email = parts[0];
      const password = parts[1];
      let twoFactor = parts[2] || null;
      let recoveryOrProxy = parts[3] || null;
      let proxyPart = parts[4] || null;
      let recovery = null;
      let proxy = null;

      if (recoveryOrProxy) {
        if (recoveryOrProxy.includes(":") || recoveryOrProxy.startsWith("http") || recoveryOrProxy.startsWith("socks")) {
          proxy = recoveryOrProxy;
        } else if (recoveryOrProxy.includes("@")) {
          recovery = recoveryOrProxy;
        } else {
          twoFactor = twoFactor || recoveryOrProxy;
        }
      }
      if (proxyPart) proxy = proxyPart;

      const valid = email.includes("@") && password.length > 0;
      return {
        lineIndex: idx + 1,
        valid,
        email,
        password,
        twoFactor,
        recovery,
        proxy
      };
    }
    return { lineIndex: idx + 1, valid: false };
  });
}

$("#addgoogle")?.addEventListener("click", () => {
  parsedGoogleAccounts = [];
  isGgLoggingIn = false;
  $("#ggraw").value = "";
  $("#ggproxy").value = "";
  if ($("#ggproxykey")) $("#ggproxykey").value = "";
  if ($("#ggproxyrotate")) $("#ggproxyrotate").checked = false;
  if ($("#ggproxykey-wrap")) $("#ggproxykey-wrap").hidden = true;
  $("#ggparsedinfo").style.display = "none";
  if ($("#ggparsedwarn")) {
    $("#ggparsedwarn").style.display = "none";
    $("#ggparsedwarn").textContent = "";
  }
  $("#ggautologinerr").textContent = "";
  $("#ggstep1sec").hidden = false;
  $("#ggstep2sec").hidden = true;
  $("#ggstep1tab").style.color = "#ea4335";
  $("#ggstep1tab").style.borderBottom = "2px solid #ea4335";
  $("#ggstep2tab").style.color = "var(--ink-3)";
  $("#ggstep2tab").style.borderBottom = "none";
  $("#ggstep2back").textContent = "⬅️ Quay lại";
  $("#ggstep2back").disabled = false;
  $("#ggstartlogin").disabled = false;
  $("#ggstartlogin").textContent = "🚀 Bắt đầu Đăng nhập Google";
  $("#ggautostatus-text").innerHTML = "Sẵn sàng. Bấm nút dưới để bắt đầu tự động mở trình duyệt và đăng nhập Google.";
  $("#ggstep1next").textContent = "Tiếp tục sang bước 2 ➡️";
  openModal($("#quickaddgooglebox"));
  setTimeout(() => $("#ggraw").focus(), 50);
});

$("#ggproxyrotate")?.addEventListener("change", e => {
  const isChecked = e.target.checked;
  if ($("#ggproxykey-wrap")) $("#ggproxykey-wrap").hidden = !isChecked;
});

$("#ggstep1tab")?.addEventListener("click", () => {
  if (isGgLoggingIn) return;
  $("#ggstep1sec").hidden = false;
  $("#ggstep2sec").hidden = true;
  $("#ggstep1tab").style.color = "#ea4335";
  $("#ggstep1tab").style.borderBottom = "2px solid #ea4335";
  $("#ggstep2tab").style.color = "var(--ink-3)";
  $("#ggstep2tab").style.borderBottom = "none";
});

$("#ggstep2tab")?.addEventListener("click", () => {
  if (parsedGoogleAccounts.length === 0) return;
  $("#ggstep1next").click();
});

$("#ggstep2back")?.addEventListener("click", () => {
  if (isGgLoggingIn) return;
  $("#ggstep1sec").hidden = false;
  $("#ggstep2sec").hidden = true;
  $("#ggstep1tab").style.color = "#ea4335";
  $("#ggstep1tab").style.borderBottom = "2px solid #ea4335";
  $("#ggstep2tab").style.color = "var(--ink-3)";
  $("#ggstep2tab").style.borderBottom = "none";
});

$("#ggraw")?.addEventListener("input", () => {
  const text = $("#ggraw").value.trim();
  $("#ggautologinerr").textContent = "";
  if ($("#ggparsedwarn")) {
    $("#ggparsedwarn").style.display = "none";
    $("#ggparsedwarn").textContent = "";
  }
  if (!text) {
    $("#ggparsedinfo").style.display = "none";
    parsedGoogleAccounts = [];
    return;
  }

  const list = parseGoogleAccountsList(text);
  const validList = list.filter(item => item.valid);
  const invalidList = list.filter(item => !item.valid);

  if (validList.length === 0) {
    $("#ggparsedinfo").style.display = "none";
    parsedGoogleAccounts = [];
    return;
  }

  parsedGoogleAccounts = validList;
  $("#ggparsedinfo").style.display = "block";
  $("#ggparsedcount").textContent = validList.length;

  if (invalidList.length === 0) {
    $("#ggparsedstatus").textContent = `✓ Đã nhận diện ${validList.length}/${list.length} tài khoản hợp lệ`;
    $("#ggparsedstatus").style.color = "var(--good, #10b981)";
  } else {
    $("#ggparsedstatus").textContent = `⚠️ ${validList.length}/${list.length} tài khoản hợp lệ (${invalidList.length} dòng không đúng định dạng)`;
    $("#ggparsedstatus").style.color = "var(--warn, #f59e0b)";
    if ($("#ggparsedwarn")) {
      $("#ggparsedwarn").style.display = "block";
      $("#ggparsedwarn").innerHTML = `<b>Bỏ qua dòng lỗi:</b> ` + invalidList.map(item => `Dòng ${item.lineIndex} (cần email@gmail.com|pass)`).join(", ");
    }
  }

  const previewEmails = validList.map(a => a.email).slice(0, 4).join(", ") + (validList.length > 4 ? ` (+${validList.length - 4} tài khoản nữa)` : "");
  $("#ggparsedsummary").textContent = `Danh sách: ${previewEmails}`;
  $("#ggstep1next").textContent = `Tiếp tục (${validList.length} tài khoản) ➡️`;
});

$("#ggstep1next")?.addEventListener("click", () => {
  if (parsedGoogleAccounts.length === 0) {
    $("#ggautologinerr").textContent = "Vui lòng nhập ít nhất 1 tài khoản Google hợp lệ dạng email|password";
    return;
  }
  $("#ggstep1sec").hidden = true;
  $("#ggstep2sec").hidden = false;
  $("#ggstep1tab").style.color = "var(--ink-3)";
  $("#ggstep1tab").style.borderBottom = "none";
  $("#ggstep2tab").style.color = "#ea4335";
  $("#ggstep2tab").style.borderBottom = "2px solid #ea4335";
});

$("#ggstartlogin")?.addEventListener("click", async () => {
  if (isGgLoggingIn) return;
  if (!parsedGoogleAccounts || parsedGoogleAccounts.length === 0) {
    $("#ggautologinerr").textContent = "Danh sách tài khoản trống!";
    return;
  }

  isGgLoggingIn = true;
  $("#ggstartlogin").disabled = true;
  $("#ggstep2back").disabled = true;
  $("#ggautologinerr").textContent = "";

  const total = parsedGoogleAccounts.length;
  const concurrency = parseInt($("#ggthreads")?.value || "2", 10);
  const tileGrid = $("#ggtilegrid")?.checked !== false;
  const proxy = $("#ggproxy")?.value.trim() || "";
  const proxyRotate = $("#ggproxyrotate")?.checked || false;
  const proxyKey = $("#ggproxykey")?.value.trim() || "";

  $("#ggautostatus-text").innerHTML = `⏳ <b>Đang khởi chạy...</b> Chuẩn bị mở ${Math.min(total, concurrency)} tab Chrome song song để đăng nhập ${total} tài khoản Google.`;

  try {
    const rawText = $("#ggraw").value;
    const res = await api('POST', '/api/profiles/quick-add-google-bulk', {
      accounts: rawText,
      concurrency,
      tileGrid,
      proxy,
      proxyRotate,
      proxyKey
    });

    const successCount = res.success || 0;
    const failCount = res.failed || 0;

    let html = `🎉 <b>Hoàn tất!</b> Đã đăng nhập thành công <b>${successCount}/${total}</b> tài khoản Google (${concurrency} tab song song).`;
    if (failCount > 0 && res.items) {
      const failedItems = res.items.filter(i => !i.ok);
      html += `<div style="margin-top:6px;max-height:90px;overflow-y:auto;color:var(--bad, #ef4444);font-size:12px;line-height:1.4">` +
        `<b>${failCount} tài khoản lỗi / cần tương tác:</b><br>` +
        failedItems.map(i => `• ${esc(i.email)}: ${esc(i.error || "Thất bại")}`).join("<br>") +
        `</div>`;
    }
    $("#ggautostatus-text").innerHTML = html;
    toast(`Thêm tài khoản Google: ${successCount}/${total} thành công!`);
    Accounts.lastJson = "";
    await App.refresh();

    if (failCount === 0) {
      setTimeout(() => {
        closeModal($("#quickaddgooglebox"));
        parsedGoogleAccounts = [];
      }, 2500);
    } else {
      $("#ggstartlogin").disabled = false;
      $("#ggstartlogin").textContent = "🚀 Đăng nhập lại các nick lỗi";
      $("#ggstep2back").disabled = false;
    }
  } catch (err) {
    $("#ggautologinerr").textContent = `Lỗi hệ thống: ${err.message}`;
    $("#ggautostatus-text").textContent = `Có lỗi xảy ra: ${err.message}`;
    $("#ggstartlogin").disabled = false;
    $("#ggstep2back").disabled = false;
  } finally {
    isGgLoggingIn = false;
  }
});

// Error toolbar batch actions
$("#btn_relogin_all_failed_google")?.addEventListener("click", async () => {
  const btn = $("#btn_relogin_all_failed_google");
  btn.disabled = true;
  const orig = btn.innerHTML;
  btn.innerHTML = "⏳ Đang đăng nhập lại...";
  toast("Bắt đầu tự động đăng nhập lại tất cả tài khoản Google đang lỗi...");
  try {
    const res = await api("POST", "/api/profiles/relogin-failed-google");
    toast(`Đã xử lý xong: ${res.reloaded}/${res.total} tài khoản Google phục hồi thành công!`);
  } catch (err) {
    toast(`Lỗi khi đăng nhập lại Google: ${err.message}`, "err");
  } finally {
    btn.disabled = false;
    btn.innerHTML = orig;
    Accounts.lastJson = "";
    await App.refresh();
  }
});

$("#btn_delete_all_error_accs")?.addEventListener("click", async () => {
  const errProfiles = (S.profiles || []).filter(p => p.login === false || (p.rest_reason && p.rest_reason.length > 0));
  if (!errProfiles.length) {
    toast("Hiện không có tài khoản lỗi nào.");
    return;
  }
  const ok = await confirmBox({
    title: "Xoá toàn bộ nick lỗi?",
    msg: `Bạn có chắc muốn xoá toàn bộ ${errProfiles.length} tài khoản đang bị lỗi / văng phiên? Thao tác này không thể hoàn tác.`,
    ok: "Xoá tất cả nick lỗi",
    danger: true
  });
  if (!ok) return;
  for (let p of errProfiles) {
    try { await api("DELETE", `/api/profiles/${p.id}`); } catch {}
  }
  toast(`Đã xoá ${errProfiles.length} tài khoản lỗi.`);
  Accounts.lastJson = "";
  await App.refresh();
});
$('#addp-cancel').addEventListener('click', () => { $('#addp').hidden = true; $('#pname').value = ''; });
$('#addp').addEventListener('submit', async e => {
  e.preventDefault(); $('#perr').textContent = '';
  const name = $('#pname').value.trim();
  // Trước đây chỗ này `return` im lặng: bấm nút với ô trống trông như app chết.
  if (!name) { $('#perr').textContent = 'Nhập tên tài khoản trước, ví dụ: Shop B.'; $('#pname').focus(); return; }
  try { await api('POST', '/api/profiles', {name}); $('#pname').value = ''; $('#addp').hidden = true; toast('Đã thêm tài khoản, cửa sổ đăng nhập Google đang mở'); Accounts.lastJson = ''; await App.refresh(); }
  catch (err) { $('#perr').textContent = err.message; }
});
$('#checkall').addEventListener('click', async () => {
  $('#perr').textContent = '';
  try {
    const r = await api('POST', '/api/profiles/check-all');
    toast(r.ids.length ? `Đang kiểm tra ${r.ids.length} tài khoản` : 'Không có tài khoản nào rảnh để kiểm tra');
    Accounts.lastJson = ''; await App.refresh();
  } catch (err) { $('#perr').textContent = err.message; }
});
Accounts.wakeAll = async function(ids = null) {
  const isBulkSelected = Array.isArray(ids) && ids.length > 0;
  const profiles = S.profiles || [];
  const targetProfiles = isBulkSelected ? profiles.filter(p => ids.includes(p.id)) : profiles;
  
  const msg = isBulkSelected
    ? `Kích hoạt lại ${ids.length} tài khoản đã chọn để tiếp tục tạo video?\n\n(Lưu ý: Chỉ áp dụng cho nick còn phiên LIVE. Nick bị văng phiên bắt buộc phải đăng nhập lại)`
    : `Kích hoạt lại TẤT CẢ các tài khoản đang hết credit/nghỉ ngơi để tiếp tục nhận video?\n\n(Lưu ý: Chỉ áp dụng cho nick còn phiên LIVE. Nick bị văng phiên bắt buộc phải đăng nhập lại)`;

  if (!confirm(msg)) return;

  toast(isBulkSelected ? 'Đang kích hoạt lại các nick đã chọn...' : 'Đang kích hoạt lại toàn bộ nick...');
  try {
    const res = await api('POST', '/api/profiles/wake-all', isBulkSelected ? { ids } : {});
    let info = `Đã kích hoạt lại ${res.woken || 0} tài khoản thành công!`;
    if (res.skipped_vang > 0) {
      info += ` (Bỏ qua ${res.skipped_vang} nick bị văng phiên — bắt buộc đăng nhập lại)`;
    }
    toast(info, (res.woken || 0) > 0 ? 'ok' : 'warn');
  } catch (err) {
    toast(`Lỗi kích hoạt lại: ${err.message}`, 'err');
  } finally {
    Accounts.lastJson = '';
    await App.refresh();
    Accounts.updateBatchBar?.();
  }
};

$('#btn_wake_all')?.addEventListener('click', () => Accounts.wakeAll());
$('#btn_wake_all_error')?.addEventListener('click', () => Accounts.wakeAll());
$('#acc_batch_wake')?.addEventListener('click', () => Accounts.wakeAll(Accounts.getSelectedIds()));

$('#assignproxy').addEventListener('click', async () => {
  $('#perr').textContent = '';
  try {
    const r = await api('POST', '/api/profiles/assign-proxy');
    if (r.mode === 'topproxy') toast(`Đã gán TopProxy (API xoay) cho toàn bộ ${r.assigned} tài khoản!`);
    else if (!r.assigned) toast('Mọi nick đã có proxy riêng — không cần gán thêm');
    else toast(`${r.pool} proxy dùng được — đã chia cho ${r.assigned} nick${r.shared ? `, ${r.shared} nick phải dùng chung (Loop Proxy)` : ', mỗi nick một cái'}`);
    Accounts.lastJson = ''; await App.refresh();
  } catch (err) { $('#perr').textContent = err.message; }
});

// ------------------------------------------------------------ hộp dán cookie
Accounts.openCookieBox = function (p) {
  Accounts.ckTarget = p ? p.id : null;
  $('#cktitle').textContent = p ? `Nạp cookie mới cho ${p.name}` : 'Thêm tài khoản bằng cookie';
  $('#ckname-f').hidden = !!p; $('#ckproxy-f').hidden = !!p;
  $('#ckname').value = ''; $('#cktext').value = ''; $('#ckproxy').value = ''; $('#ckerr').textContent = '';
  openModal($('#ckbox'));
  (p ? $('#cktext') : $('#ckname')).focus();
};
$('#addcookie').addEventListener('click', () => Accounts.openCookieBox(null));
$('#ckform').addEventListener('submit', async e => {
  e.preventDefault(); $('#ckerr').textContent = '';
  const cookies = $('#cktext').value.trim();
  if (!cookies) { $('#ckerr').textContent = 'Dán cookie vào ô trước đã.'; $('#cktext').focus(); return; }
  const name = $('#ckname').value.trim(); // để trống backend sẽ tự đặt 1, 2, 3...
  $('#ckgo').disabled = true;
  try {
    if (Accounts.ckTarget) await api('POST', `/api/profiles/${Accounts.ckTarget}/cookies`, {cookies});
    else {
      const isRot = !!$('#ckproxyrotate')?.checked;
      const rotKey = ($('#ckproxykey')?.value || '').trim();
      const pxVal = $('#ckproxy').value.trim();
      await api('POST', '/api/profiles', {
        name,
        cookies,
        proxy: pxVal || undefined,
        proxy_rotate: isRot,
        proxy_key: isRot ? rotKey : undefined
      });
    }
    closeModal($('#ckbox'));
    toast('Đang nạp phiên vào trình duyệt ẩn — vài giây nữa bảng sẽ cập nhật');
    Accounts.lastJson = ''; await App.refresh();
  } catch (err) { $('#ckerr').textContent = err.message; }
  finally { $('#ckgo').disabled = false; }
});

// ------------------------------------------------------------ thêm nhiều nick
function updateBulkProxyModeUI() {
  const mode = $('#bulk_proxy_mode')?.value || 'topproxy';
  if ($('#bulk_topproxy_wrap')) $('#bulk_topproxy_wrap').hidden = (mode !== 'topproxy');
  if ($('#bulk_static_wrap')) $('#bulk_static_wrap').hidden = (mode !== 'static');
}
$('#bulk_proxy_mode')?.addEventListener('change', updateBulkProxyModeUI);

$('#addbulk').addEventListener('click', () => {
  $('#bulkres').hidden = true;
  $('#bulkerr').textContent = '';
  const s = S.meta && S.meta.settings;
  if ($('#bulk_proxy_mode')) {
    $('#bulk_proxy_mode').value = (s && s.proxy_mode) || 'topproxy';
  }
  if ($('#bulk_topproxy_key')) {
    $('#bulk_topproxy_key').value = (s && s.topproxy_key) || '';
  }
  updateBulkProxyModeUI();
  openModal($('#bulkbox'));
});

function countBulkCookies(raw) {
  let s = String(raw || '').trim();
  if (!s) return 0;
  if (s.startsWith('{') || s.startsWith('[')) {
    try {
      let p = JSON.parse(s);
      if (Array.isArray(p?.profiles)) return p.profiles.length;
      if (Array.isArray(p) && p.length > 0 && Array.isArray(p[0])) return p.length;
      if (Array.isArray(p) && p.length > 0 && typeof p[0] === 'object') return p.length;
    } catch {}
  }
  let jsonArrays = [...s.matchAll(/\[\s*\{[\s\S]*?\}\s*\]/g)];
  if (jsonArrays.length > 1) return jsonArrays.length;
  let lines = s.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  return lines.length;
}

$('#bulkck')?.addEventListener('input', () => {
  const cnt = countBulkCookies($('#bulkck').value);
  const el = $('#bulk_live_counter');
  if (el) {
    el.textContent = cnt > 0 ? `⚡ Đã nhận diện: ${cnt} tài khoản` : 'Chưa có dữ liệu cookie';
    el.style.color = cnt > 0 ? '#10b981' : 'var(--ink-3)';
  }
});

$('#bulk_file_upload')?.addEventListener('change', ev => {
  const f = ev.target.files?.[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = e => {
    $('#bulkck').value = String(e.target?.result || '');
    $('#bulkck').dispatchEvent(new Event('input'));
    toast(`📁 Đã đọc file ${f.name}!`);
  };
  reader.readAsText(f);
});

$('#bulkform').addEventListener('submit', async e => {
  e.preventDefault(); $('#bulkerr').textContent = ''; $('#bulkgo').disabled = true;
  try {
    const pMode = $('#bulk_proxy_mode')?.value || 'topproxy';
    const topKey = ($('#bulk_topproxy_key')?.value || '').trim();
    const staticPx = $('#bulkpx')?.value || '';
    const payload = {
      cookies: $('#bulkck').value,
      proxies: pMode === 'topproxy' ? topKey : staticPx,
      proxy_mode: pMode,
      topproxy_key: topKey
    };
    const r = await api('POST', '/api/profiles/bulk', payload);
    const res = $('#bulkres'); res.hidden = false;
    res.innerHTML = `<b>${r.added.length} tài khoản đã thêm</b>${r.added.length ? ': ' + r.added.map(a => esc(a.name)).join(', ') : ''}. Đang nạp phiên vào trình duyệt ẩn, bảng sẽ cập nhật dần.` +
      (r.errors.length ? `<br><b>${r.errors.length} khối lỗi:</b><br>` + r.errors.map(x => `khối ${x.line}: ${esc(x.reason)}`).join('<br>') : '');
    if (r.added.length) { $('#bulkck').value = ''; if (pMode === 'static') $('#bulkpx').value = ''; }
    Accounts.lastJson = ''; await App.refresh();
  } catch (err) { $('#bulkerr').textContent = err.message; }
  finally { $('#bulkgo').disabled = false; }
});

// ------------------------------------------------------------ proxy riêng
function updateProxyBoxUI(isRotate) {
  const keyGrp = $('#proxykey-group');
  if (keyGrp) {
    if (isRotate) {
      keyGrp.style.display = 'block';
      if ($('#proxylabel')) $('#proxylabel').textContent = '🌐 IP xoay hiện tại (Tự đổi mỗi 70s)';
      if ($('#proxyhint')) $('#proxyhint').innerHTML = 'Hệ thống tự động lấy IP từ <b>Key xoay</b> mỗi 70s. Bạn cũng có thể bấm <b>«⚡ Lấy IP ngay»</b> ở trên để cập nhật IP tức thì.';
    } else {
      keyGrp.style.display = 'none';
      if ($('#proxylabel')) $('#proxylabel').textContent = '🌐 Proxy cố định (host:port, gõ \"tor\" dùng Tor Free, hoặc để trống)';
      if ($('#proxyhint')) $('#proxyhint').textContent = 'Gõ \"tor\" để dùng mạng Tor Exit Node miễn phí (tự xoay IP). Hoặc điền proxy HTTP/SOCKS5 riêng.';
    }
  }
}

if ($('#proxyrotate')) {
  $('#proxyrotate').addEventListener('change', e => {
    updateProxyBoxUI(e.target.checked);
  });
}

Accounts.openProxyBox = function (p) {
  Accounts.proxyTarget = p.id;
  $('#proxytitle').textContent = `Proxy riêng của ${p.name}`;
  const isRotate = !!p.proxy_rotate;
  if ($('#proxyrotate')) $('#proxyrotate').checked = isRotate;
  if ($('#proxykey')) $('#proxykey').value = p.proxy_key || '';
  $('#proxyval').value = p.proxy || '';
  $('#proxyres').textContent = '';
  $('#proxyerr').textContent = '';
  updateProxyBoxUI(isRotate);
  openModal($('#proxybox'));
};

// Nút Thử Key & Lấy IP ngay
$('#proxytestkey')?.addEventListener('click', async () => {
  const k = $('#proxykey').value.trim();
  if (!k) return ($('#proxyerr').textContent = 'Vui lòng nhập Key xoay trước.');
  $('#proxyres').textContent = 'Đang kết nối proxyxoay.shop lấy IP…';
  $('#proxyerr').textContent = '';
  try {
    const r = await api('POST', '/api/proxy/check-rotating', { key: k });
    if (r.ok) {
      $('#proxyval').value = r.canonical || r.proxyhttp || r.ip;
      $('#proxyres').innerHTML = `<span style="color:#16a34a;font-weight:600">✅ Lấy IP thành công!</span> IP: <b>${r.ip}</b> · Mạng: <b>${r.isp || 'N/A'}</b> · Vị trí: <b>${r.location || 'N/A'}</b><br><small style="color:#64748b">${r.message || ''}</small>`;
    } else {
      $('#proxyerr').textContent = `Lỗi từ proxyxoay: ${r.error || 'Key không hợp lệ'}`;
      $('#proxyres').textContent = '';
    }
  } catch (err) {
    $('#proxyerr').textContent = err.message;
    $('#proxyres').textContent = '';
  }
});

$('#btnproxyfree')?.addEventListener('click', () => {
  $('#proxyval').value = 'tor';
  if ($('#proxyrotate')) $('#proxyrotate').checked = false;
  updateProxyBoxUI(false);
  $('#proxyres').innerHTML = '<span style="color:#16a34a;font-weight:600">✅ Đã chọn Proxy Free (Tor)!</span> Nick sẽ tự cấp 1 cổng Tor riêng biệt và cách ly IP khi tạo video.';
  $('#proxyerr').textContent = '';
});

$('#quickaddusetor')?.addEventListener('click', () => {
  $('#quickaddproxy').value = 'tor';
  if ($('#quickaddproxyrotate')) $('#quickaddproxyrotate').checked = false;
  if ($('#quickaddproxykey-wrap')) $('#quickaddproxykey-wrap').hidden = true;
});

$('#proxyform').addEventListener('submit', async e => {
  e.preventDefault();
  $('#proxyerr').textContent = '';
  const isRotate = $('#proxyrotate') ? $('#proxyrotate').checked : false;
  const keyVal = $('#proxykey') ? $('#proxykey').value.trim() : '';
  const proxyVal = $('#proxyval').value.trim();
  try {
    let payload = {};
    if (isRotate) {
      if (!keyVal) throw new Error('Vui lòng nhập Key proxy xoay cho tài khoản này');
      payload = { proxy_rotate: true, proxy_key: keyVal, proxy: proxyVal || null };
    } else {
      payload = { proxy_rotate: false, proxy_key: null, proxy: proxyVal || null };
    }
    const r = await api('PATCH', `/api/profiles/${Accounts.proxyTarget}`, payload);
    closeModal($('#proxybox'));
    toast(r.warning ? r.warning : r.proxy_rotate ? `Đã lưu key xoay (70s), IP hiện tại: ${r.proxy_masked || r.proxy || 'đang lấy'}` : r.proxy ? `Đã đặt proxy ${r.proxy_masked}` : 'Đã bỏ proxy, nick đi thẳng bằng IP máy', r.warning ? 'err' : 'ok');
    Accounts.lastJson = ''; await App.refresh();
    if (window.Proxies && typeof Proxies.renderAccProxyTable === 'function') {
      Proxies.updateStats();
      Proxies.renderRotKeysTable();
      Proxies.renderAccProxyTable();
    }
  } catch (err) { $('#proxyerr').textContent = err.message; }
});

$('#btn_remove_account_proxy')?.addEventListener('click', async () => {
  if (!Accounts.proxyTarget) return;
  const p = S.profiles?.find(x => x.id === Accounts.proxyTarget);
  const name = p ? p.name : 'tài khoản này';
  if (!confirm(`Bạn có chắc muốn gỡ bỏ hoàn toàn proxy của "${name}" để nick đi thẳng bằng IP máy không?`)) return;
  try {
    await api('PATCH', `/api/profiles/${Accounts.proxyTarget}`, {
      proxy: null,
      proxy_rotate: false,
      proxy_key: null
    });
    closeModal($('#proxybox'));
    toast(`✅ Đã gỡ bỏ proxy cho "${name}", nick sẽ đi thẳng bằng IP máy!`, 'ok');
    Accounts.lastJson = '';
    await App.refresh();
    if (window.Proxies && typeof Proxies.renderAccProxyTable === 'function') {
      Proxies.updateStats();
      Proxies.renderRotKeysTable();
      Proxies.renderAccProxyTable();
    }
  } catch (err) {
    $('#proxyerr').textContent = err.message;
  }
});

$('#proxytest').addEventListener('click', async () => {
  const v = $('#proxyval').value.trim();
  if (!v) return ($('#proxyerr').textContent = 'Chưa có proxy/IP để kiểm tra kết nối.');
  $('#proxyres').textContent = 'Đang kiểm tra kết nối proxy (tối đa 15 giây)…';
  $('#proxyerr').textContent = '';
  try {
    const r = await api('POST', '/api/proxy/check', { proxies: [v] });
    const x = r.results[0];
    $('#proxyres').textContent = x.ok ? `Kết nối tốt — IP ra ngoài ${x.ip}, ${x.ms} ms` : `Không kết nối được: ${x.error}`;
  } catch (err) {
    $('#proxyerr').textContent = err.message;
    $('#proxyres').textContent = '';
  }
});


Accounts.fbTarget = null;
Accounts.openFbCookieBox = function (p) {
  if (!p) return;
  Accounts.fbTarget = p.id;
  const titleSpan = $('#ckfbtitle span');
  if (titleSpan) titleSpan.textContent = 'Cập nhật cookie FB cho ' + p.name;
  if ($('#ckfbtext')) $('#ckfbtext').value = '';
  if ($('#ckfberr')) $('#ckfberr').textContent = '';
  if ($('#ckfbparsedinfo')) $('#ckfbparsedinfo').style.display = 'none';
  if ($('#ckfbgo')) {
    $('#ckfbgo').disabled = false;
    $('#ckfbgo').textContent = '🚀 Cập nhật & Đăng nhập Dola';
  }
  openModal($('#ckfbbox'));
  setTimeout(() => $('#ckfbtext')?.focus(), 50);
};

$('#ckfbtext')?.addEventListener('input', () => {
  const t = $('#ckfbtext').value.trim();
  const info = $('#ckfbparsedinfo');
  if (!info) return;
  if (!t) { info.style.display = 'none'; return; }
  const parsed = parseFbInput(t);
  if (parsed.cookieCount > 0) {
    info.style.display = 'block';
    info.textContent = '✓ Đã nhận diện ' + parsed.cookieCount + ' cookie FB' + (parsed.uid ? ' (UID: ' + parsed.uid + ')' : '');
  } else {
    info.style.display = 'none';
  }
});

$('#ckfbform')?.addEventListener('submit', async e => {
  e.preventDefault();
  const text = $('#ckfbtext').value.trim();
  if (!text) {
    if ($('#ckfberr')) $('#ckfberr').textContent = 'Vui lòng dán cookie Facebook.';
    $('#ckfbtext')?.focus();
    return;
  }
  const btn = $('#ckfbgo');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Đang mở Chrome và tự động đăng nhập Dola...';
  }
  if ($('#ckfberr')) $('#ckfberr').textContent = '';
  try {
    await api('POST', '/api/profiles/' + Accounts.fbTarget + '/fb-cookies', { fbData: text });
    toast('Cập nhật cookie FB & đăng nhập Dola thành công!');
    closeModal($('#ckfbbox'));
    Accounts.lastJson = '';
    await App.refresh();
  } catch (err) {
    if ($('#ckfberr')) $('#ckfberr').textContent = err.message;
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '🚀 Cập nhật & Đăng nhập Dola';
    }
  }
});

// BATCH_ACCOUNT_ACTIONS_HANDLER
Accounts.getSelectedIds = function() {
  return [...$$('#acclist .acc-select:checked')].map(cb => cb.dataset.id).filter(Boolean);
};

Accounts.updateBatchBar = function() {
  const ids = Accounts.getSelectedIds();
  const bar = $('#acc_batch_bar');
  const countEl = $('#acc_sel_count');
  if (countEl) countEl.textContent = ids.length;
  if (bar) bar.style.display = ids.length > 0 ? 'flex' : 'none';
  const allCb = $('#acc_select_all');
  if (allCb) {
    const allItems = $$('#acclist .acc-select');
    allCb.checked = allItems.length > 0 && ids.length === allItems.length;
    allCb.indeterminate = ids.length > 0 && ids.length < allItems.length;
  }
};

$('#acc_select_all')?.addEventListener('change', e => {
  const chk = e.target.checked;
  $$('#acclist .acc-select').forEach(cb => { cb.checked = chk; });
  Accounts.updateBatchBar();
});

$('#acclist')?.addEventListener('change', e => {
  if (e.target.classList.contains('acc-select')) {
    Accounts.updateBatchBar();
  }
});

$('#acc_batch_clear')?.addEventListener('click', () => {
  $$('#acclist .acc-select').forEach(cb => { cb.checked = false; });
  Accounts.updateBatchBar();
});

$('#acc_batch_reset')?.addEventListener('click', async () => {
  const ids = Accounts.getSelectedIds();
  if (!ids.length) return;
  const profiles = S.profiles || [];
  const names = ids.map(id => profiles.find(p => p.id === id)?.name || id);
  if (!confirm(`Bạn có chắc muốn chạy Auto Reset Credit lần lượt cho ${ids.length} tài khoản đã chọn?\n(${names.slice(0, 5).join(', ')}${names.length > 5 ? '...' : ''})`)) return;
  
  const btn = $('#acc_batch_reset');
  btn.disabled = true;
  toast(`Bắt đầu Auto Reset Credit cho ${ids.length} tài khoản...`);
  let doneCount = 0;
  for (let idx = 0; idx < ids.length; idx++) {
    const id = ids[idx];
    const p = profiles.find(x => x.id === id);
    const pName = p?.name || id;
    toast(`[${idx + 1}/${ids.length}] Đang Auto Reset Credit cho «${pName}»...`);
    try {
      await api('POST', `/api/profiles/${id}/reset-credit`);
      doneCount++;
      toast(`[${idx + 1}/${ids.length}] «${pName}» thành công!`);
    } catch (err) {
      toast(`[${idx + 1}/${ids.length}] Lỗi «${pName}»: ${err.message}`, 'err');
    }
  }
  btn.disabled = false;
  toast(`Hoàn tất Auto Reset Credit (${doneCount}/${ids.length} thành công).`);
  await App.refresh();
  Accounts.updateBatchBar();
});

$('#acc_batch_check')?.addEventListener('click', async () => {
  const ids = Accounts.getSelectedIds();
  if (!ids.length) return;
  toast(`Đang gửi yêu cầu kiểm tra ${ids.length} tài khoản...`);
  for (const id of ids) {
    try { await api('POST', `/api/profiles/${id}/check`); } catch {}
  }
  toast(`Đã kích hoạt kiểm tra cho ${ids.length} tài khoản.`);
  await App.refresh();
});

$('#acc_batch_toggle')?.addEventListener('click', async () => {
  const ids = Accounts.getSelectedIds();
  if (!ids.length) return;
  const profiles = S.profiles || [];
  // Toggle: if at least one is enabled, turn off all; else turn on all
  const anyOn = ids.some(id => profiles.find(p => p.id === id)?.enabled);
  const targetState = !anyOn;
  for (const id of ids) {
    try { await api('PATCH', `/api/profiles/${id}`, { enabled: targetState }); } catch {}
  }
  toast(`Đã ${targetState ? 'bật' : 'tắt'} ${ids.length} tài khoản.`);
  await App.refresh();
});

$('#acc_batch_delete')?.addEventListener('click', async () => {
  const ids = Accounts.getSelectedIds();
  if (!ids.length) return;
  const profiles = S.profiles || [];
  const names = ids.map(id => profiles.find(p => p.id === id)?.name || id);
  if (!confirm(`⚠️ Bạn có CHẮC CHẮN muốn xoá vĩnh viễn ${ids.length} tài khoản đã chọn không?\n(${names.join(', ')})`)) return;
  toast(`Đang xoá ${ids.length} tài khoản...`);
  for (const id of ids) {
    try { await api('DELETE', `/api/profiles/${id}`); } catch {}
  }
  toast(`Đã xoá xong ${ids.length} tài khoản.`);
  await App.refresh();
  Accounts.updateBatchBar();
});

$('#acc_batch_remove_proxy')?.addEventListener('click', async () => {
  const ids = Accounts.getSelectedIds();
  if (!ids.length) return;
  const profiles = S.profiles || [];
  const profsWithProxy = ids.filter(id => {
    const p = profiles.find(x => x.id === id);
    return p && (p.proxy || p.proxy_rotate);
  });
  if (!profsWithProxy.length) return toast('Các tài khoản đã chọn đều đang chạy trực tiếp bằng IP máy (không dùng proxy).');
  if (!confirm(`Bạn có chắc muốn gỡ bỏ proxy của ${profsWithProxy.length} tài khoản đã chọn để nick đi thẳng bằng IP máy không?`)) return;
  toast(`Đang gỡ bỏ proxy cho ${profsWithProxy.length} tài khoản...`);
  let count = 0;
  for (const id of profsWithProxy) {
    try {
      await api('PATCH', `/api/profiles/${id}`, {
        proxy: null,
        proxy_rotate: false,
        proxy_key: null
      });
      count++;
    } catch (_) {}
  }
  toast(`✅ Đã gỡ bỏ proxy thành công cho ${count} tài khoản!`);
  await App.refresh();
  Accounts.updateBatchBar();
  if (typeof Proxies !== 'undefined' && Proxies.load) {
    Proxies.load();
  }
});

// LIVE_COOKIE_INPUT_HELPER
$('#cktext')?.addEventListener('input', () => {
  const val = $('#cktext').value.trim();
  const info = $('#ckparsedinfo');
  if (!info) return;
  if (!val) { info.style.display = 'none'; return; }
  info.style.display = 'block';

  let hasSession = false;
  let token = null;
  let type = '';

  if (val.startsWith('[') || val.startsWith('{')) {
    try {
      const parsed = JSON.parse(val);
      const arr = Array.isArray(parsed) ? parsed : (parsed.cookies || [parsed]);
      type = `JSON Cookie-Editor (${arr.length} cookie)`;
      const s = arr.find(c => (c.name === 'sessionid' || c.name === 'sessionid_ss' || c.name === 'sid_tt' || c.name === 'sid_guard') && c.value);
      if (s) { hasSession = true; token = String(s.value); }
    } catch {}
  }
  if (!hasSession && (val.includes('=') || val.includes(';'))) {
    const m = val.match(/(?:sessionid|sessionid_ss|sid_tt|sid_guard)\s*=\s*([^;\r\n]+)/i);
    if (m) { hasSession = true; token = m[1].trim().replace(/^['"]|['"]$/g, ''); type = 'Chuỗi cookie (key=value)'; }
  }
  if (!hasSession && /^[a-zA-Z0-9_-]{16,128}$/.test(val)) {
    hasSession = true;
    token = val;
    type = `Mã SessionID (${val.length} ký tự)`;
  }
  if (!hasSession) {
    const m = val.match(/["']?value["']?\s*[:=]\s*["']([a-zA-Z0-9_-]{16,128})["']/i) || val.match(/sessionid(?:_ss)?\s*[:=]\s*["']?([a-zA-Z0-9_-]{16,128})["']?/i);
    if (m) { hasSession = true; token = m[1]; type = 'Khối JSON / Session token'; }
  }

  if (hasSession && token) {
    info.style.color = '#34d399';
    info.style.background = 'rgba(52, 211, 153, 0.12)';
    info.style.border = '1px solid rgba(52, 211, 153, 0.3)';
    info.innerHTML = `✅ <b>Đã nhận diện:</b> ${type} · Session: <code>${token.slice(0, 6)}...${token.slice(-4)}</code>`;
  } else {
    info.style.color = '#fbbf24';
    info.style.background = 'rgba(245, 158, 11, 0.12)';
    info.style.border = '1px solid rgba(245, 158, 11, 0.3)';
    info.innerHTML = `⚠️ <b>Đang nhận diện:</b> Dán nguyên văn Export JSON từ Cookie-Editor, chuỗi cookie hoặc mã sessionid.`;
  }
});

// Cookie Export Utilities
Accounts.showCookieExportModal = function (accId, accName, cookies, cookieStr) {
  const modal = $('#exportcookiebox');
  if (!modal) return;
  $('#export_cookie_title').textContent = `Xuất Cookie Dola — ${accName}`;
  $('#export_cookie_desc').textContent = `Cookie Dola của «${accName}» (Tổng cộng: ${cookies.length} cookie):`;
  const jsonStr = JSON.stringify(cookies, null, 2);
  $('#export_cookie_content').value = jsonStr;
  $('#export_cookie_count').textContent = `${cookies.length} cookie Dola`;

  const sessCookie = cookies.find(c => (c.name === 'sessionid' || c.name === 'sid_tt') && c.value);
  const sessVal = sessCookie ? sessCookie.value : '';

  $('#btn_close_export_cookie').onclick = () => closeModal(modal);

  $('#btn_copy_cookie_json').onclick = () => {
    navigator.clipboard.writeText(jsonStr);
    toast(`📋 Đã copy JSON ${cookies.length} cookie của «${accName}» vào bộ nhớ tạm!`);
  };

  $('#btn_copy_cookie_sess').onclick = () => {
    if (!sessVal) { toast('Không tìm thấy sessionid trong danh sách cookie', 'err'); return; }
    navigator.clipboard.writeText(sessVal);
    toast(`🔑 Đã copy SessionID (${sessVal.length} ký tự) của «${accName}»!`);
  };

  $('#btn_copy_cookie_str').onclick = () => {
    navigator.clipboard.writeText(cookieStr || cookies.map(c => `${c.name}=${c.value}`).join('; '));
    toast(`📋 Đã copy chuỗi cookie name=value của «${accName}» vào bộ nhớ tạm!`);
  };

  $('#btn_save_cookie_file').onclick = async () => {
    try {
      toast('Đang lưu file cookie...');
      const r = await api('POST', '/api/profiles/export-file', { profile_id: accId });
      toast(`💾 Đã lưu file và mở thư mục: ${r.filename}`);
    } catch (err) {
      toast(`Lỗi lưu file: ${err.message}`, 'err');
    }
  };

  openModal(modal);
};

$('#btn_export_all_cookies')?.addEventListener('click', async () => {
  try {
    toast('Đang xuất toàn bộ cookie...');
    const r = await api('POST', '/api/profiles/export-file', {});
    if (!r || !r.ok) throw new Error('Không có dữ liệu trả về');
    toast(`✅ Đã xuất cookie của ${r.count} tài khoản và mở thư mục chứa file!`);
  } catch (err) {
    toast(`Lỗi xuất cookie: ${err.message}`, 'err');
  }
});
window.Accounts = Accounts;

Accounts.checkAllProxies = async function() {
  const profiles = S.profiles || [];
  const proxiesToCheck = [];
  const rotKeysToCheck = [];

  profiles.forEach(p => {
    if (p.proxy_rotate && p.proxy_key) {
      if (!rotKeysToCheck.includes(p.proxy_key)) rotKeysToCheck.push(p.proxy_key);
    } else if (p.proxy) {
      if (!proxiesToCheck.includes(p.proxy)) proxiesToCheck.push(p.proxy);
    }
  });

  const pool = (S.settings && S.settings.proxy_pool) || [];
  pool.forEach(px => {
    if (px && !proxiesToCheck.includes(px)) proxiesToCheck.push(px);
  });
  const topKey = (S.settings && S.settings.topproxy_key) || '';
  if (topKey) {
    const keys = topKey.split(/[\r\n,;]+/).map(k => k.trim()).filter(Boolean);
    keys.forEach(k => {
      if (!rotKeysToCheck.includes(k)) rotKeysToCheck.push(k);
    });
  }

  if (!proxiesToCheck.length && !rotKeysToCheck.length) {
    toast('Chưa có proxy hoặc key xoay nào được cấu hình trong tài khoản hoặc cài đặt', 'warn');
    return;
  }

  const btn = $('#btn_check_all_proxies');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '⏳ Đang kiểm tra…';
  }
  toast(`Đang kiểm tra ${proxiesToCheck.length} proxy tĩnh và ${rotKeysToCheck.length} key xoay…`);

  try {
    let staticResults = [];
    if (proxiesToCheck.length) {
      const res = await api('POST', '/api/proxy/check', { proxies: proxiesToCheck });
      staticResults = res.results || [];
    }

    let rotResults = [];
    if (rotKeysToCheck.length) {
      const res = await api('POST', '/api/proxy/check-rotating', { keys: rotKeysToCheck });
      rotResults = res.results || (res.ok ? [{ key: rotKeysToCheck[0], ok: true, ip: res.ip }] : [{ key: rotKeysToCheck[0], ok: false, error: res.error }]);
    }

    const goodStatic = staticResults.filter(x => x.ok).length;
    const goodRot = rotResults.filter(x => x.ok).length;
    const totalGood = goodStatic + goodRot;
    const totalAll = staticResults.length + rotResults.length;

    let msg = `Kết quả kiểm tra: ${totalGood}/${totalAll} proxy sẵn sàng.\n`;
    if (rotResults.length) {
      msg += `\n🔄 Key xoay (${goodRot}/${rotResults.length}):\n` + rotResults.map(r => `• ${r.key}: ${r.ok ? '✅ IP ' + (r.ip || r.proxyhttp || 'OK') : '❌ ' + (r.error || r.message || 'Lỗi')}`).join('\n');
    }
    if (staticResults.length) {
      msg += `\n🌐 Proxy tĩnh (${goodStatic}/${staticResults.length}):\n` + staticResults.map(s => `• ${s.text || s.proxy}: ${s.ok ? '✅ OK (' + s.ms + 'ms, IP ' + (s.ip || '') + ')' : '❌ ' + (s.error || 'Lỗi')}`).join('\n');
    }

    alert(msg);
    toast(`Kiểm tra hoàn tất: ${totalGood}/${totalAll} proxy hoạt động tốt`);
  } catch (err) {
    toast('Lỗi kiểm tra proxy: ' + err.message, 'err');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '🌐 Kiểm tra Proxy';
    }
  }
};
$('#btn_check_all_proxies')?.addEventListener('click', () => Accounts.checkAllProxies());
