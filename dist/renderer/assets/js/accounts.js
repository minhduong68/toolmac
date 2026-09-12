/* Tab Tài khoản: KPI, cảnh báo phiên, bảng (tìm/sắp xếp), proxy, nghỉ, thêm nhiều nick. */
'use strict';
const Accounts = {lastJson: '', ckTarget: null, proxyTarget: null};

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
  $('#pulse').innerHTML = (paused ? `<span class="stat paused"><span class="dot"></span>Hàng đợi đang tạm dừng</span>` : '') +
    `<span class="stat ${busy ? 'on' : ''}"><span class="dot"></span>${busy ? busy + ' tài khoản đang tạo' : 'Không có video đang tạo'}</span><span class="stat">${ready} tài khoản sẵn sàng</span>`;
  $('#accready').textContent = ready ? `${ready} tài khoản có thể nhận` : 'Chưa có tài khoản nào sẵn sàng';
  $('#n-accounts').textContent = profiles.length || '';
  const json = JSON.stringify(profiles) + S.accq + JSON.stringify(S.accsort);
  if (json === Accounts.lastJson) return;
  Accounts.lastJson = json;
  Composer.renderProfileSelect(profiles);
  Jobs.renderAccountFilter(profiles);

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
  const k = S.accsort.key;
  if (k) {
    const val = p => k === 'name' ? p.name.toLowerCase() : k === 'session' ? (p.session_days_left ?? -999) : k === 'credits' ? (p.credits_today ?? -1) : (p.last_check || '');
    rows.sort((a, b) => { const x = val(a.p), y = val(b.p); return (x < y ? -1 : x > y ? 1 : 0) * (S.accsort.asc ? 1 : -1); });
  }
  $$('#acctbl th.sortable').forEach(th => { th.classList.toggle('sorted', th.dataset.sort === k); th.classList.toggle('asc', th.dataset.sort === k && S.accsort.asc); });

  $('#acclist').innerHTML = rows.map(({p, i}) => {
    const isBusy = !!p.current_job;
    const live = p.login === true ? '<span class="pill live">LIVE</span>' : p.login === false ? '<span class="pill dead">CHƯA ĐĂNG NHẬP</span>' : '<span class="pill">CHƯA KIỂM</span>';
    const rest = p.resting ? `<div class="sub2"><span class="pill rest" title="${esc(p.rest_reason || '')}">NGHỈ TỚI ${fmtHM(p.rest_until)}</span><span class="link" data-act="wake" title="Bỏ nghỉ, cho nhận video ngay">dùng lại ngay</span></div>` : '';
    let session = '<span class="muted">—</span>';
    if (p.login === true) {
      if (p.session_days_left == null) session = '<span class="muted">chưa rõ hạn</span>';
      else if (p.session_days_left < 0) session = '<span class="bad">đã hết hạn</span>';
      else session = `<b class="${p.session_days_left < 7 ? 'warn-t' : 'ok'}">${p.session_days_left}</b> ngày<div class="sub2">hết ${fmtDMY(p.session_expires)}</div>`;
    }
    const credit = p.credits_today == null ? '<span class="muted">chưa rõ</span>' : p.credits_today === 0 ? '<span class="bad">hết hôm nay</span>' : `<b class="ok">${p.credits_today}</b> còn lại`;
    const proxy = p.proxy ? `<div class="proxy" data-act="proxy" title="Proxy riêng — mọi lượt tạo, đăng nhập, kiểm tra đều đi IP này. Bấm để đổi.">${p.proxy_rotate ? '<span style="color:#0284c7;font-weight:700" title="Proxy xoay 70s">🔄 70s</span> ' : ''}${esc(p.proxy_masked)}</div>` : `<div class="proxy muted" data-act="proxy" title="Chưa có proxy riêng: đi thẳng bằng IP máy. Bấm để đặt.">đi IP máy</div>`;
    return `<tr class="${p.enabled ? '' : 'off'}" data-id="${esc(p.id)}">
      <td class="num">${i + 1}</td>
      <td><div class="name" title="Bấm để đổi tên">${esc(p.name)}</div><div class="sub2">${esc(p.id)}${p.created ? ' · tạo ' + fmtDMY(p.created) : ''}</div></td>
      <td>${live}<div class="sub2"><span class="dot ${esc(p.state)}"></span>${PSTATE[p.state] || esc(p.state)}${p.enabled ? '' : ' · đã tắt'}</div>${rest}</td>
      <td>${session}</td>
      <td>${credit}</td>
      <td>${proxy}</td>
      <td class="when">${fmtHMDM(p.last_check)}</td>
      <td>
        <button class="btn sm" data-act="reset_credit" ${isBusy ? 'disabled' : ''} style="background:#ef4444;color:#fff;border-color:#ef4444;font-size:11.5px;font-weight:600;padding:4px 8px;border-radius:6px;display:inline-flex;align-items:center;gap:4px;white-space:nowrap" title="Mở Chrome (không ẩn) để xóa nick Dola cũ và đăng nhập lại bằng FB để nhận credit mới">⚡ Auto Reset Credit</button>
      </td>
      <td class="acts">
        <button class="ico" data-act="check" ${isBusy ? 'disabled' : ''} title="Kiểm tra đăng nhập và credit (kéo cửa sổ Chrome ra để xem)">${ICONS.check}</button>
        <button class="ico" data-act="cookie" ${isBusy ? 'disabled' : ''} title="Nạp cookie mới cho tài khoản này — không mở cửa sổ">${ICONS.cookie}</button>
        <button class="ico" data-act="cookie_fb" ${isBusy ? 'disabled' : ''} title="Cập nhật cookie Facebook để tự động đăng nhập Dola">${ICONS.fb}</button>
        <button class="ico" data-act="login" ${isBusy ? 'disabled' : ''} title="Đăng nhập Google: chỉ mở cửa sổ khi tài khoản thật sự chưa đăng nhập"><b>G</b></button>
        <button class="ico" data-act="window" title="Mở trình duyệt Chrome của tài khoản này">${ICONS.window}</button>
        <button class="ico" data-act="toggle" title="${p.enabled ? 'Ngừng nhận video tự động' : 'Cho nhận video tự động'}">${p.enabled ? ICONS.pause : ICONS.play}</button>
        <button class="ico danger" data-act="delete" ${isBusy ? 'disabled' : ''} title="Xoá tài khoản khỏi app (xoá cả phiên đăng nhập trên máy này)">${ICONS.trash}</button>
      </td></tr>`;
  }).join('') || `<tr><td colspan="9" class="hint">${profiles.length ? 'Không có tài khoản nào khớp từ khoá.' : 'Chưa có tài khoản nào. Bấm «+ Dán cookie» (không cần mở Chrome), «+ Thêm nhiều nick» hoặc «+ Đăng nhập Google».'}</td></tr>`;

  $('#acclist').querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', async () => {
    const id = b.closest('tr').dataset.id, p = profiles.find(x => x.id === id); $('#perr').textContent = '';
    try {
      const act = b.dataset.act;
      if (act === 'toggle') { await api('PATCH', '/api/profiles/' + id, {enabled: !p.enabled}); toast(p.enabled ? `Đã tắt ${p.name}` : `Đã bật ${p.name}`); }
      else if (act === 'cookie') { Accounts.openCookieBox(p); return; }
      else if (act === 'cookie_fb') { Accounts.openFbCookieBox(p); return; }
      else if (act === 'proxy') { Accounts.openProxyBox(p); return; }
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
      else if (act === 'wake') { await api('POST', `/api/profiles/${id}/wake`); toast(`${p.name} đã sẵn sàng nhận video lại`); }
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
let parsedFbAccountData = null;

function parseFbInput(raw) {
  const result = { uid: null, cookies: [], cookieCount: 0 };
  if (!raw || typeof raw !== "string") return result;
  const str = raw.trim();

  if (str.startsWith("[") && str.endsWith("]")) {
    try {
      const arr = JSON.parse(str);
      if (Array.isArray(arr)) {
        result.cookies = arr.filter(c => c && c.name && c.value);
        result.cookieCount = result.cookies.length;
        const cUser = result.cookies.find(c => c.name === "c_user");
        if (cUser) result.uid = cUser.value;
        return result;
      }
    } catch {}
  }

  let cookieChunk = "";
  const cUserMatch = str.match(/c_user=(\d+)/);
  if (cUserMatch) result.uid = cUserMatch[1];

  if (str.includes("|")) {
    const parts = str.split("|").map(s => s.trim()).filter(Boolean);
    for (const p of parts) {
      if (p.includes("c_user=") || p.includes("xs=")) {
        cookieChunk = p;
      } else if (!result.uid && /^\d{10,18}$/.test(p)) {
        result.uid = p;
      }
    }
  } else {
    cookieChunk = str;
  }

  if (!cookieChunk) {
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
  return result;
}

$("#quickadd-btn-fb")?.addEventListener("click", () => {
  closeModal($("#quickaddbox"));
  $("#quickaddfb").click();
});

$("#quickaddfb").addEventListener("click", () => {
  parsedFbAccountData = null;
  $("#fbraw").value = "";
  $("#fbaccname").value = "";
  $("#fbproxy").value = "";
  if ($("#fbproxykey")) $("#fbproxykey").value = "";
  if ($("#fbproxyrotate")) $("#fbproxyrotate").checked = false;
  if ($("#fbproxykey-wrap")) $("#fbproxykey-wrap").hidden = true;
  if ($("#fbproxylabel")) $("#fbproxylabel").textContent = "Proxy riêng (tuỳ chọn)";
  if ($("#fbproxy")) $("#fbproxy").placeholder = "host:port:user:pass, gõ \"tor\" (miễn phí), hoặc để trống";
  $("#fbparsedinfo").style.display = "none";
  $("#fbautologinerr").textContent = "";
  $("#fbstep1sec").hidden = false;
  $("#fbstep2sec").hidden = true;
  $("#fbstep1tab").style.color = "var(--accent)";
  $("#fbstep1tab").style.borderBottom = "2px solid var(--accent)";
  $("#fbstep2tab").style.color = "var(--ink-3)";
  $("#fbstep2tab").style.borderBottom = "none";
  $("#fbstartlogin").disabled = false;
  $("#fbstartlogin").textContent = "🚀 Mở trình duyệt & Đăng nhập Dola";
  $("#fbautostatus-text").innerHTML = "Sẵn sàng. Bấm nút dưới để mở trình duyệt và tự động đăng nhập Dola bằng FB.";
  openModal($("#quickaddfbbox"));
  setTimeout(() => $("#fbraw").focus(), 50);
});

$("#fbraw").addEventListener("input", () => {
  const text = $("#fbraw").value.trim();
  $("#fbautologinerr").textContent = "";
  if (!text) {
    $("#fbparsedinfo").style.display = "none";
    return;
  }
  const parsed = parseFbInput(text);
  if (parsed.cookieCount > 0) {
    $("#fbparsedinfo").style.display = "block";
    $("#fbparseduid").textContent = parsed.uid || "Không rõ";
    $("#fbparsedstatus").textContent = "✓ Đã nhận diện " + parsed.cookieCount + " cookie FB";
    $("#fbparsedcookies").textContent = parsed.cookies.map(c => c.name).slice(0, 6).join(", ") + (parsed.cookies.length > 6 ? "..." : "");
    if (!$("#fbaccname").value.trim() && parsed.uid) {
      $("#fbaccname").value = "FB - " + parsed.uid;
    }
  } else {
    $("#fbparsedinfo").style.display = "none";
  }
});

$("#fbstep1next").addEventListener("click", () => {
  const text = $("#fbraw").value.trim();
  if (!text) {
    $("#fbautologinerr").textContent = "Vui lòng nhập cookie Facebook hoặc dòng tài khoản.";
    $("#fbraw").focus();
    return;
  }
  const parsed = parseFbInput(text);
  if (parsed.cookieCount === 0) {
    $("#fbautologinerr").textContent = "Không tìm thấy cookie FB hợp lệ (cần ít nhất c_user hoặc xs).";
    $("#fbraw").focus();
    return;
  }
  parsedFbAccountData = text;
  $("#fbautologinerr").textContent = "";
  $("#fbstep1sec").hidden = true;
  $("#fbstep2sec").hidden = false;
  $("#fbstep1tab").style.color = "var(--ink-3)";
  $("#fbstep1tab").style.borderBottom = "none";
  $("#fbstep2tab").style.color = "var(--accent)";
  $("#fbstep2tab").style.borderBottom = "2px solid var(--accent)";
  setTimeout(() => $("#fbproxy").focus(), 50);
});

$("#fbstep1tab").addEventListener("click", () => {
  $("#fbstep2back").click();
});

$("#fbstep2tab").addEventListener("click", () => {
  if (parsedFbAccountData) {
    $("#fbstep1next").click();
  }
});

$("#fbstep2back").addEventListener("click", () => {
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
      if ($("#fbproxy")) $("#fbproxy").placeholder = "host:port:user:pass, gõ \"tor\" (miễn phí), hoặc để trống";
    }
  });
}

$("#fbstartlogin").addEventListener("click", async () => {
  if (!parsedFbAccountData) return;
  $("#fbautologinerr").textContent = "";
  const name = $("#fbaccname").value.trim() || undefined;
  const isRotate = !!$("#fbproxyrotate")?.checked;
  const proxy = $("#fbproxy").value.trim() || undefined;

  $("#fbstartlogin").disabled = true;
  $("#fbstep2back").disabled = true;
  $("#fbstartlogin").textContent = "⏳ Đang mở trình duyệt & đăng nhập...";
  $("#fbautostatus-text").innerHTML = '<span class="dot starting"></span> Đang mở trình duyệt Chrome, nạp cookie Facebook và tự động đăng nhập Dola. Vui lòng quan sát cửa sổ Chrome...';

  try {
    const res = await api("POST", "/api/profiles/quick-add-fb", {
      fbData: parsedFbAccountData,
      name,
      proxy,
      proxy_rotate: isRotate,
      proxy_key: isRotate ? proxy : null
    });
    $("#fbautostatus-text").innerHTML = "🎉 <b>Đăng nhập Dola thành công!</b> Đã lưu phiên cho «" + res.profile.name + "».";
    toast("Đã thêm tài khoản «" + res.profile.name + "» thành công!");
    setTimeout(() => {
      closeModal($("#quickaddfbbox"));
      parsedFbAccountData = null;
    }, 1200);
    Accounts.lastJson = "";
    await App.refresh();
  } catch (err) {
    $("#fbautologinerr").textContent = err.message || String(err);
    $("#fbstartlogin").disabled = false;
    $("#fbstep2back").disabled = false;
    $("#fbstartlogin").textContent = "🚀 Mở trình duyệt & Đăng nhập Dola";
    $("#fbautostatus-text").textContent = "Đăng nhập thất bại: " + (err.message || String(err));
  }
});

// ------------------------------------------------------------ thêm bằng Google
$('#addgoogle').addEventListener('click', () => { $('#addp').hidden = false; $('#pname').focus(); });
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
$('#assignproxy').addEventListener('click', async () => {
  $('#perr').textContent = '';
  try {
    const r = await api('POST', '/api/profiles/assign-proxy');
    if (!r.assigned) toast('Mọi nick đã có proxy riêng — không cần gán thêm');
    else toast(`${r.pool} proxy dùng được — đã chia cho ${r.assigned} nick${r.shared ? `, ${r.shared} nick phải dùng chung IP, nên mua thêm proxy` : ', mỗi nick một cái'}`);
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
  const name = $('#ckname').value.trim();
  if (!Accounts.ckTarget && !name) { $('#ckerr').textContent = 'Đặt tên cho tài khoản, ví dụ: Shop A.'; $('#ckname').focus(); return; }
  $('#ckgo').disabled = true;
  try {
    if (Accounts.ckTarget) await api('POST', `/api/profiles/${Accounts.ckTarget}/cookies`, {cookies});
    else await api('POST', '/api/profiles', {name, cookies, proxy: $('#ckproxy').value.trim() || undefined});
    closeModal($('#ckbox'));
    toast('Đang nạp phiên vào trình duyệt ẩn — vài giây nữa bảng sẽ cập nhật');
    Accounts.lastJson = ''; await App.refresh();
  } catch (err) { $('#ckerr').textContent = err.message; }
  finally { $('#ckgo').disabled = false; }
});

// ------------------------------------------------------------ thêm nhiều nick
$('#addbulk').addEventListener('click', () => { $('#bulkres').hidden = true; $('#bulkerr').textContent = ''; openModal($('#bulkbox')); });
$('#bulkform').addEventListener('submit', async e => {
  e.preventDefault(); $('#bulkerr').textContent = ''; $('#bulkgo').disabled = true;
  try {
    const r = await api('POST', '/api/profiles/bulk', {cookies: $('#bulkck').value, proxies: $('#bulkpx').value});
    const res = $('#bulkres'); res.hidden = false;
    res.innerHTML = `<b>${r.added.length} tài khoản đã thêm</b>${r.added.length ? ': ' + r.added.map(a => esc(a.name)).join(', ') : ''}. Đang nạp phiên vào trình duyệt ẩn, bảng sẽ cập nhật dần.` +
      (r.errors.length ? `<br><b>${r.errors.length} khối lỗi:</b><br>` + r.errors.map(x => `khối ${x.line}: ${esc(x.reason)}`).join('<br>') : '');
    if (r.added.length) { $('#bulkck').value = ''; $('#bulkpx').value = ''; }
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
  } catch (err) { $('#proxyerr').textContent = err.message; }
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
