/* Quản lý tập trung Proxy & Đa Khóa TopProxy (API xoay) */
'use strict';

const Proxies = {
  keys: [],         // Danh sách API Key TopProxy đang theo dõi trong bảng
  staticList: [],   // Danh sách Proxy tĩnh đang theo dõi trong bảng
  keyCache: {},     // Cache kết quả kiểm tra key xoay { ip, location, isp, expires, ok, loading, message }
  staticCache: {},  // Cache kết quả kiểm tra proxy tĩnh { ip, ms, ok, loading, error }
  checking: false,
  initialized: false
};
window.Proxies = Proxies;

/** Lấy danh sách key đang lưu trong bảng theo dõi */
Proxies.getParsedKeys = function () {
  return Proxies.keys || [];
};

/** Lấy danh sách proxy tĩnh đang lưu trong bảng theo dõi */
Proxies.getParsedStatic = function () {
  return Proxies.staticList || [];
};

/** Lấy danh sách key người dùng vừa gõ/dán trong ô textarea */
Proxies.getInputKeys = function () {
  const raw = ($('#pm_topproxy_input')?.value || '').trim();
  if (!raw) return [];
  const lines = raw.split(/[\r\n,;]+/).map(k => k.trim()).filter(Boolean);
  return [...new Set(lines)];
};

/** Lấy danh sách proxy tĩnh người dùng vừa gõ/dán trong ô textarea */
Proxies.getInputStatic = function () {
  const raw = ($('#pm_static_pool')?.value || '').trim();
  if (!raw) return [];
  const lines = raw.split(/[\r\n]+/).map(p => p.trim()).filter(Boolean);
  return [...new Set(lines)];
};

/** Khởi tạo / Tải dữ liệu từ settings vào bộ nhớ bảng theo dõi */
Proxies.load = async function (force = false) {
  let s = S.meta && S.meta.settings;
  if (!s || force) {
    try {
      const res = await api('GET', '/api/settings');
      if (res && res.settings) {
        if (!S.meta) S.meta = {};
        S.meta.settings = res.settings;
        s = res.settings;
      }
    } catch (_) {}
  }
  s = s || {};

  // Chế độ proxy
  if ($('#pm_proxy_mode')) {
    $('#pm_proxy_mode').value = s.proxy_mode || 'topproxy';
  }

  // Danh sách key TopProxy xoay đã lưu trong settings
  const rawKeys = s.topproxy_keys || s.topproxy_key || '';
  const savedKeys = String(rawKeys).split(/[\r\n,;]+/).map(k => k.trim()).filter(Boolean);

  // Danh sách proxy tĩnh đã lưu trong settings
  let savedStatic = [];
  if (Array.isArray(s.proxy_pool)) {
    savedStatic = s.proxy_pool.map(p => String(p).trim()).filter(Boolean);
  } else if (typeof s.proxy_pool === 'string') {
    savedStatic = s.proxy_pool.split(/[\r\n]+/).map(p => p.trim()).filter(Boolean);
  }

  if (!Proxies.initialized) {
    Proxies.keys = [...new Set(savedKeys)];
    Proxies.staticList = [...new Set(savedStatic)];
    Proxies.initialized = true;
  } else {
    // Nếu trong bộ nhớ chưa có mà settings có dữ liệu mới thì nạp
    if (!Proxies.keys.length && savedKeys.length) {
      Proxies.keys = [...new Set(savedKeys)];
    }
    if (!Proxies.staticList.length && savedStatic.length) {
      Proxies.staticList = [...new Set(savedStatic)];
    }
  }

  // LƯU Ý QUAN TRỌNG: TUYỆT ĐỐI KHÔNG ghi đè value của textarea nhập liệu (#pm_topproxy_input và #pm_static_pool)!
  // Tránh việc người dùng đang dán hay chuẩn bị bấm Thêm thì bị xóa mất dữ liệu.

  Proxies.updateStats();
  Proxies.renderRotKeysTable();
  Proxies.renderStaticTable();
  Proxies.renderAccProxyTable();
};

Proxies.updateStats = function () {
  const keys = Proxies.keys || [];
  const statKeys = $('#pm_stat_keys_count');
  if (statKeys) statKeys.textContent = `${keys.length} key`;

  // Hiển thị số lượng key đang gõ/dán trong ô textarea
  const inputKeys = Proxies.getInputKeys();
  const parsedCount = $('#pm_keys_parsed_count');
  if (parsedCount) {
    if (inputKeys.length > 0) {
      parsedCount.innerHTML = `<span style="color:#38bdf8;font-weight:700">📝 Có ${inputKeys.length} key trong ô dán (bấm "➕ Thêm & Kiểm tra")</span>`;
    } else {
      parsedCount.textContent = `Bảng đang theo dõi: ${keys.length} API Key`;
    }
  }

  // Đếm số key live trong cache
  let liveCount = 0;
  keys.forEach(k => {
    if (Proxies.keyCache[k] && Proxies.keyCache[k].ok) liveCount++;
  });
  const statLive = $('#pm_stat_keys_live');
  if (statLive) {
    if (liveCount > 0) {
      statLive.innerHTML = `<span style="color:#10b981;font-weight:700">🟢 ${liveCount} / ${keys.length} key hoạt động</span>`;
    } else {
      statLive.textContent = keys.length ? 'Chưa kiểm tra (Bấm nút kiểm tra)' : 'Chưa có key nào';
    }
  }

  // Proxy tĩnh
  const staticList = Proxies.staticList || [];
  const statStatic = $('#pm_stat_static_count');
  if (statStatic) statStatic.textContent = `${staticList.length} proxy`;

  const inputStatic = Proxies.getInputStatic();
  const staticParsed = $('#pm_static_parsed_count');
  if (staticParsed) {
    if (inputStatic.length > 0) {
      staticParsed.innerHTML = `<span style="color:#a855f7;font-weight:700">📝 Có ${inputStatic.length} proxy trong ô dán (bấm "➕ Thêm & Kiểm tra")</span>`;
    } else {
      staticParsed.textContent = `Bảng đang theo dõi: ${staticList.length} proxy tĩnh`;
    }
  }

  const modeBadge = $('#pm_stat_mode_badge');
  const currentMode = $('#pm_proxy_mode')?.value || (S.meta?.settings?.proxy_mode) || 'topproxy';
  if (modeBadge) {
    modeBadge.textContent = currentMode === 'topproxy' ? '⚡ Chế độ: TopProxy (API xoay)' : (currentMode === 'tor' ? '🧅 Chế độ: Tor Free' : '🌐 Chế độ: Proxy tĩnh');
  }

  // Thống kê tài khoản
  const profs = S.profiles || [];
  const assigned = profs.filter(p => p.proxy || p.proxy_rotate).length;
  const statAcc = $('#pm_stat_acc_assigned');
  if (statAcc) statAcc.textContent = `${assigned} / ${profs.length} nick`;

  const statPercent = $('#pm_stat_acc_percent');
  if (statPercent) {
    const pct = profs.length ? Math.round((assigned / profs.length) * 100) : 0;
    statPercent.textContent = `${pct}% tài khoản có proxy`;
  }
};

/* ── QUẢN LÝ TOPPROXY API KEYS (XOAY) ────────────────────────── */

Proxies.renderRotKeysTable = function () {
  const tbody = $('#pm_rot_keys_list');
  if (!tbody) return;
  const keys = Proxies.keys || [];
  const summaryEl = $('#pm_keys_table_summary');
  if (summaryEl) summaryEl.textContent = `Tổng: ${keys.length} API Key xoay`;

  if (!keys.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:24px 16px;color:var(--ink-3)">
      <div style="font-size:28px;margin-bottom:6px">🔑</div>
      <b>Chưa có API Key TopProxy nào trong danh sách.</b><br>
      <span style="font-size:12px">Hãy dán 1 hoặc nhiều key vào khung trên (mỗi dòng một key) rồi bấm <b>"➕ Thêm & Kiểm tra Key"</b>.</span>
    </td></tr>`;
    Proxies.updateKeySelectCount();
    return;
  }

  const profs = S.profiles || [];

  tbody.innerHTML = keys.map((k, idx) => {
    const shortKey = k.length > 20 ? (k.slice(0, 8) + '••••' + k.slice(-6)) : k;
    const cache = Proxies.keyCache[k];

    // Tìm nick nào đang dùng key này
    const assignedProfs = profs.filter(p => p.proxy_rotate && p.proxy_key === k);
    let assignedHtml = '<span class="dim" style="font-size:11.5px">Chưa phân bổ</span>';
    if (assignedProfs.length > 0) {
      assignedHtml = assignedProfs.map(p => `<span class="chip" style="font-size:11px;background:rgba(56,189,248,0.12);color:#38bdf8;border:1px solid rgba(56,189,248,0.3)" title="Nick ${esc(p.name)} đang dùng key này">${esc(p.name)}</span>`).join(' ');
    }

    let statusHtml = '<span class="badge dim" style="font-size:11px">🟡 Chưa check</span>';
    let ipHtml = '<span class="dim">—</span>';
    let locHtml = '<span class="dim">—</span>';
    let expireHtml = '<span class="dim">—</span>';

    if (cache) {
      if (cache.loading) {
        statusHtml = '<span class="badge" style="background:rgba(56,189,248,0.2);color:#38bdf8;font-size:11px">🔄 Đang test…</span>';
      } else if (cache.ok) {
        statusHtml = '<span class="badge ok" style="font-size:11px">🟢 Hoạt động</span>';
        ipHtml = `<div style="display:flex;align-items:center;gap:4px">
          <span style="font-family:monospace;font-weight:700;color:#38bdf8;font-size:12.5px">${esc(cache.ip || '')}</span>
          <button type="button" class="ico sm" onclick="copyText('${cache.ip}', 'IP')" title="Chép IP này" style="padding:1px 4px">📋</button>
        </div>`;
        locHtml = `<span style="font-size:12px">${esc(cache.location || 'VN')} · <b>${esc(cache.isp || 'TopProxy')}</b></span>`;
        expireHtml = `<span style="font-size:11.5px;color:#10b981">${esc(cache.expires || cache.message || 'Sẵn sàng')}</span>`;
      } else {
        statusHtml = '<span class="badge err" style="font-size:11px">🔴 Lỗi / Hết hạn</span>';
        expireHtml = `<span style="color:#ef4444;font-size:11.5px;font-weight:600" title="${esc(cache.message || '')}">${esc(cache.message ? cache.message.slice(0, 30) : 'Kết nối thất bại')}</span>`;
      }
    }

    return `
      <tr data-key="${esc(k)}">
        <td style="text-align:center">
          <input type="checkbox" class="pm-key-cb" data-key="${esc(k)}" style="cursor:pointer">
        </td>
        <td style="text-align:center;font-weight:700;color:var(--ink-3)">#${idx + 1}</td>
        <td>
          <div style="display:flex;align-items:center;gap:6px">
            <code style="font-size:12px;color:var(--ink);background:var(--panel-2);padding:2px 6px;border-radius:4px" title="${esc(k)}">${esc(shortKey)}</code>
            <button type="button" class="ico sm" onclick="copyText('${k}', 'API Key')" title="Chép toàn bộ Key này" style="padding:1px 4px">📋</button>
          </div>
        </td>
        <td>${statusHtml}</td>
        <td>${ipHtml}</td>
        <td>${locHtml}</td>
        <td>${expireHtml}</td>
        <td><div style="display:flex;flex-wrap:wrap;gap:4px">${assignedHtml}</div></td>
        <td style="text-align:center">
          <div style="display:inline-flex;align-items:center;gap:4px">
            <button type="button" class="btn xs" onclick="Proxies.checkSingleKey('${k}')" style="background:#0284c7;color:#fff;border:none;font-weight:600;padding:2px 8px;border-radius:4px" title="Lấy IP mới & kiểm tra key này">🔄 Đổi IP</button>
            <button type="button" class="ico danger xs" onclick="Proxies.deleteKey('${k}')" title="Xóa key này khỏi bảng theo dõi" style="padding:2px 6px">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Wire checkbox change listeners
  tbody.querySelectorAll('.pm-key-cb').forEach(cb => {
    cb.addEventListener('change', () => Proxies.updateKeySelectCount());
  });
  Proxies.updateKeySelectCount();
};

Proxies.updateKeySelectCount = function () {
  const cbs = Array.from(document.querySelectorAll('.pm-key-cb'));
  const checked = cbs.filter(cb => cb.checked);
  const countEl = $('#pm_keys_sel_count');
  if (countEl) countEl.textContent = String(checked.length);

  const allCb = $('#pm_keys_select_all');
  if (allCb) {
    allCb.checked = cbs.length > 0 && checked.length === cbs.length;
    allCb.indeterminate = checked.length > 0 && checked.length < cbs.length;
  }
};

Proxies.clearKeySelection = function () {
  document.querySelectorAll('.pm-key-cb').forEach(cb => { cb.checked = false; });
  const allCb = $('#pm_keys_select_all');
  if (allCb) { allCb.checked = false; allCb.indeterminate = false; }
  Proxies.updateKeySelectCount();
};

/** THÊM VÀ KIỂM TRA TOPPROXY KEY (Dán 1 hoặc nhiều key, bấm thêm và kiểm tra) */
Proxies.addAndCheckKeys = async function () {
  const newKeys = Proxies.getInputKeys();
  if (!newKeys.length) {
    if (!Proxies.keys.length) {
      return toast('Vui lòng dán ít nhất 1 API key TopProxy vào khung trên!', 'err');
    }
    toast('Đang kiểm tra lại các API Key trong bảng theo dõi...');
    return Proxies.checkAllKeys();
  }

  // Thêm các key mới vào Proxies.keys (giữ nguyên các key cũ đã có, loại bỏ trùng lặp)
  const existingSet = new Set(Proxies.keys);
  let addedCount = 0;
  for (const k of newKeys) {
    if (!existingSet.has(k)) {
      Proxies.keys.push(k);
      existingSet.add(k);
      addedCount++;
    }
  }

  // Xóa nội dung trong ô dán sau khi đã thêm thành công vào bảng theo dõi
  if ($('#pm_topproxy_input')) {
    $('#pm_topproxy_input').value = '';
  }

  // Lưu ngay vào settings
  await Proxies.save(false);
  Proxies.updateStats();
  Proxies.renderRotKeysTable();

  toast(`✅ Đã thêm ${addedCount} API Key mới vào bảng theo dõi! Đang kiểm tra & lấy IP...`);

  // Tự động kiểm tra các key mới thêm
  await Proxies.checkKeys(newKeys);
};

/** Chỉ nạp key vào bảng theo dõi mà chưa kiểm tra ngay */
Proxies.applyKeys = async function () {
  const newKeys = Proxies.getInputKeys();
  if (!newKeys.length) {
    return toast('Vui lòng dán ít nhất 1 API key TopProxy vào khung trên!', 'err');
  }
  const existingSet = new Set(Proxies.keys);
  let addedCount = 0;
  for (const k of newKeys) {
    if (!existingSet.has(k)) {
      Proxies.keys.push(k);
      existingSet.add(k);
      addedCount++;
    }
  }
  if ($('#pm_topproxy_input')) $('#pm_topproxy_input').value = '';
  await Proxies.save(false);
  Proxies.updateStats();
  Proxies.renderRotKeysTable();
  toast(`✅ Đã thêm ${addedCount} API Key mới vào bảng theo dõi! Bấm "Kiểm tra" để lấy IP.`);
};

/** Xử lý khi bấm nút "Kiểm tra & Lấy IP mới nhất" */
Proxies.onCheckKeysClick = async function () {
  const inputKeys = Proxies.getInputKeys();
  if (inputKeys.length > 0) {
    return Proxies.addAndCheckKeys();
  }
  if (!Proxies.keys.length) {
    return toast('Chưa có API key nào trong bảng theo dõi để kiểm tra. Hãy dán key vào ô trên!', 'err');
  }
  return Proxies.checkAllKeys();
};

/** Xóa 1 API key khỏi bảng theo dõi ("nào xóa mới xóa") */
Proxies.deleteKey = async function (key) {
  if (!confirm(`Bạn có chắc muốn xóa API key "${key.slice(0, 10)}..." khỏi bảng theo dõi không?`)) return;
  Proxies.keys = Proxies.keys.filter(k => k !== key);
  delete Proxies.keyCache[key];
  await Proxies.save(false);

  // Gỡ key này khỏi các nick đang được phân bổ key này
  const assignedProfs = (S.profiles || []).filter(p => p.proxy_rotate && p.proxy_key === key);
  for (const p of assignedProfs) {
    try {
      await api('PATCH', `/api/profiles/${p.id}`, {
        proxy: null,
        proxy_rotate: false,
        proxy_key: null
      });
    } catch (_) {}
  }

  toast(`✅ Đã xóa API key khỏi bảng theo dõi${assignedProfs.length ? ` và gỡ khỏi ${assignedProfs.length} nick` : ''}!`);
  await App.refresh();
  Proxies.updateStats();
  Proxies.renderRotKeysTable();
  Proxies.renderAccProxyTable();
};

/** Xóa các API key đã tích chọn */
Proxies.deleteSelectedKeys = async function () {
  const cbs = Array.from(document.querySelectorAll('.pm-key-cb:checked'));
  const keysToDel = cbs.map(cb => cb.dataset.key).filter(Boolean);
  if (!keysToDel.length) return toast('Vui lòng tích chọn ít nhất 1 API Key để xóa', 'err');
  if (!confirm(`Bạn có chắc chắn muốn XÓA ${keysToDel.length} API Key đã chọn khỏi bảng theo dõi không?`)) return;

  const toDelSet = new Set(keysToDel);
  Proxies.keys = Proxies.keys.filter(k => !toDelSet.has(k));
  keysToDel.forEach(k => delete Proxies.keyCache[k]);
  await Proxies.save(false);

  const assigned = (S.profiles || []).filter(p => p.proxy_rotate && toDelSet.has(p.proxy_key));
  for (const prof of assigned) {
    try {
      await api('PATCH', `/api/profiles/${prof.id}`, { proxy: null, proxy_rotate: false, proxy_key: null });
    } catch (_) {}
  }

  toast(`✅ Đã xóa ${keysToDel.length} API Key đã chọn khỏi bảng theo dõi!`);
  await App.refresh();
  Proxies.updateStats();
  Proxies.renderRotKeysTable();
  Proxies.renderAccProxyTable();
};

/** Tích chọn tất cả các key lỗi / hết hạn */
Proxies.selectExpiredKeys = function () {
  const cbs = Array.from(document.querySelectorAll('.pm-key-cb'));
  let count = 0;
  cbs.forEach(cb => {
    const k = cb.dataset.key;
    const cache = Proxies.keyCache[k];
    const isExpired = cache && (
      cache.ok === false ||
      /hết hạn|expired|hết lượt|lỗi|fail|die|thất bại/i.test(cache.message || cache.expires || '')
    );
    if (isExpired) {
      cb.checked = true;
      count++;
    } else {
      cb.checked = false;
    }
  });
  Proxies.updateKeySelectCount();
  if (count === 0) {
    toast('Không tìm thấy key lỗi hoặc hết hạn nào trong kết quả kiểm tra (Hãy bấm "Kiểm tra & Lấy IP" trước nếu chưa test).');
  } else {
    toast(`Đã chọn ${count} key hết hạn / lỗi! Bấm "Xóa key đã chọn" để xóa.`);
  }
};

/** Xóa sạch tất cả các key lỗi / hết hạn */
Proxies.deleteExpiredKeys = async function () {
  const expiredKeys = Proxies.keys.filter(k => {
    const cache = Proxies.keyCache[k];
    return cache && (
      cache.ok === false ||
      /hết hạn|expired|hết lượt|lỗi|fail|die|thất bại/i.test(cache.message || cache.expires || '')
    );
  });
  if (!expiredKeys.length) {
    return toast('Không tìm thấy API Key nào bị lỗi hoặc hết hạn để xóa (bấm Kiểm tra trước nếu chưa test).', 'err');
  }
  if (!confirm(`Hệ thống tìm thấy ${expiredKeys.length} API Key bị hết hạn hoặc lỗi kết nối.\n\nBạn có chắc chắn muốn XÓA SẠCH TOÀN BỘ ${expiredKeys.length} key này khỏi bảng theo dõi không?`)) return;

  const expSet = new Set(expiredKeys);
  Proxies.keys = Proxies.keys.filter(k => !expSet.has(k));
  expiredKeys.forEach(k => delete Proxies.keyCache[k]);
  await Proxies.save(false);

  const assigned = (S.profiles || []).filter(p => p.proxy_rotate && expSet.has(p.proxy_key));
  for (const prof of assigned) {
    try {
      await api('PATCH', `/api/profiles/${prof.id}`, { proxy: null, proxy_rotate: false, proxy_key: null });
    } catch (_) {}
  }

  toast(`🔥 Đã xóa sạch ${expiredKeys.length} API Key hết hạn/lỗi khỏi bảng theo dõi!`);
  await App.refresh();
  Proxies.updateStats();
  Proxies.renderRotKeysTable();
  Proxies.renderAccProxyTable();
};

/* ── QUẢN LÝ PROXY TĨNH (STATIC POOL) ────────────────────────── */

Proxies.renderStaticTable = function () {
  const tbody = $('#pm_static_results_list');
  if (!tbody) return;
  const list = Proxies.staticList || [];

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:16px;color:var(--ink-3)">
      Chưa có proxy tĩnh nào trong danh sách. Hãy dán 1 hoặc nhiều proxy vào khung trên theo định dạng <code>Host:Port:User:Pass</code> rồi bấm <b>"➕ Thêm & Kiểm tra Proxy"</b>.
    </td></tr>`;
    Proxies.updateStaticSelectCount();
    return;
  }

  tbody.innerHTML = list.map((p, idx) => {
    const cache = Proxies.staticCache[p];
    let ipText = '<span class="dim">—</span>';
    let pingText = '<span class="dim">—</span>';
    let statusBadge = '<span class="badge dim" style="font-size:11px">🟡 Chưa check</span>';

    if (cache) {
      if (cache.loading) {
        statusBadge = '<span class="badge" style="background:rgba(168,85,247,0.2);color:#c084fc;font-size:11px">🔄 Đang test…</span>';
      } else if (cache.ok) {
        statusBadge = '<span class="badge ok" style="font-size:11px">🟢 Sống</span>';
        ipText = `<span style="font-family:monospace;font-weight:700;color:#10b981;font-size:12px">${esc(cache.ip || '')}</span>`;
        pingText = `<span style="font-size:11.5px;color:var(--ink-2)">${cache.ms ? cache.ms + ' ms' : 'OK'}</span>`;
      } else {
        statusBadge = '<span class="badge err" style="font-size:11px">🔴 Chết / Lỗi</span>';
        ipText = `<span style="color:#ef4444;font-size:11px" title="${esc(cache.error || '')}">${esc(cache.error ? cache.error.slice(0, 20) : 'Lỗi kết nối')}</span>`;
      }
    }

    return `
      <tr data-proxy="${esc(p)}">
        <td style="text-align:center">
          <input type="checkbox" class="pm-static-cb" data-proxy="${esc(p)}" style="cursor:pointer">
        </td>
        <td style="text-align:center;font-weight:700;color:var(--ink-3)">#${idx + 1}</td>
        <td>
          <div style="display:flex;align-items:center;gap:6px">
            <code style="font-size:12px;font-family:monospace;background:var(--panel-2);padding:2px 6px;border-radius:4px" title="${esc(p)}">${esc(p)}</code>
            <button type="button" class="ico sm" onclick="copyText('${p}', 'Proxy')" title="Chép proxy này" style="padding:1px 4px">📋</button>
          </div>
        </td>
        <td>${ipText}</td>
        <td>${pingText}</td>
        <td>${statusBadge}</td>
        <td style="text-align:center">
          <button type="button" class="btn xs danger" onclick="Proxies.deleteStaticProxy('${esc(p)}')" style="background:#dc2626;color:#fff;border:none;font-weight:600;padding:2px 8px;border-radius:4px" title="Xóa proxy này khỏi bảng theo dõi">🗑️ Xóa</button>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.pm-static-cb').forEach(cb => {
    cb.addEventListener('change', () => Proxies.updateStaticSelectCount());
  });
  Proxies.updateStaticSelectCount();
};

Proxies.updateStaticSelectCount = function () {
  const cbs = Array.from(document.querySelectorAll('.pm-static-cb'));
  const checked = cbs.filter(cb => cb.checked);
  const countEl = $('#pm_static_sel_count');
  if (countEl) countEl.textContent = String(checked.length);

  const allCb = $('#pm_static_select_all');
  if (allCb) {
    allCb.checked = cbs.length > 0 && checked.length === cbs.length;
    allCb.indeterminate = checked.length > 0 && checked.length < cbs.length;
  }
};

Proxies.clearStaticSelection = function () {
  document.querySelectorAll('.pm-static-cb').forEach(cb => { cb.checked = false; });
  const allCb = $('#pm_static_select_all');
  if (allCb) { allCb.checked = false; allCb.indeterminate = false; }
  Proxies.updateStaticSelectCount();
};

/** THÊM VÀ KIỂM TRA PROXY TĨNH (Dán 1 hoặc nhiều proxy, bấm thêm và kiểm tra) */
Proxies.addAndCheckStatic = async function () {
  const newProxies = Proxies.getInputStatic();
  if (!newProxies.length) {
    if (!Proxies.staticList.length) {
      return toast('Vui lòng dán ít nhất 1 proxy tĩnh vào khung trên!', 'err');
    }
    toast('Đang kiểm tra lại các proxy tĩnh trong bảng theo dõi...');
    return Proxies.checkStatic();
  }

  const existingSet = new Set(Proxies.staticList);
  let addedCount = 0;
  for (const p of newProxies) {
    if (!existingSet.has(p)) {
      Proxies.staticList.push(p);
      existingSet.add(p);
      addedCount++;
    }
  }

  if ($('#pm_static_pool')) {
    $('#pm_static_pool').value = '';
  }

  await Proxies.save(false);
  Proxies.updateStats();
  Proxies.renderStaticTable();

  toast(`✅ Đã thêm ${addedCount} proxy tĩnh mới vào bảng theo dõi! Đang kiểm tra kết nối & ping...`);
  await Proxies.checkStatic(newProxies);
};

/** Chỉ nạp proxy tĩnh vào bảng mà chưa kiểm tra ngay */
Proxies.applyStatic = async function () {
  const newProxies = Proxies.getInputStatic();
  if (!newProxies.length) {
    return toast('Vui lòng dán ít nhất 1 proxy tĩnh vào khung trên!', 'err');
  }
  const existingSet = new Set(Proxies.staticList);
  let addedCount = 0;
  for (const p of newProxies) {
    if (!existingSet.has(p)) {
      Proxies.staticList.push(p);
      existingSet.add(p);
      addedCount++;
    }
  }
  if ($('#pm_static_pool')) $('#pm_static_pool').value = '';
  await Proxies.save(false);
  Proxies.updateStats();
  Proxies.renderStaticTable();
  toast(`✅ Đã thêm ${addedCount} proxy tĩnh mới vào bảng theo dõi! Bấm "Kiểm tra" để test.`);
};

/** Xử lý khi bấm nút "Kiểm tra kết nối & ping ms" */
Proxies.onCheckStaticClick = async function () {
  const inputStatic = Proxies.getInputStatic();
  if (inputStatic.length > 0) {
    return Proxies.addAndCheckStatic();
  }
  if (!Proxies.staticList.length) {
    return toast('Chưa có proxy tĩnh nào trong bảng theo dõi để kiểm tra. Hãy dán proxy vào ô trên!', 'err');
  }
  return Proxies.checkStatic();
};

/** Xóa 1 proxy tĩnh khỏi bảng theo dõi */
Proxies.deleteStaticProxy = async function (proxy) {
  if (!confirm(`Bạn có chắc muốn xóa proxy "${proxy}" khỏi bảng theo dõi không?`)) return;
  Proxies.staticList = Proxies.staticList.filter(p => p !== proxy);
  delete Proxies.staticCache[proxy];
  await Proxies.save(false);

  // Gỡ proxy này khỏi các nick đang gán
  const assigned = (S.profiles || []).filter(p => p.proxy === proxy);
  for (const prof of assigned) {
    try {
      await api('PATCH', `/api/profiles/${prof.id}`, { proxy: null, proxy_rotate: false, proxy_key: null });
    } catch (_) {}
  }

  toast(`✅ Đã xóa proxy khỏi bảng theo dõi!`);
  await App.refresh();
  Proxies.updateStats();
  Proxies.renderStaticTable();
  Proxies.renderAccProxyTable();
};

/** Xóa các proxy tĩnh đã chọn */
Proxies.deleteSelectedStatic = async function () {
  const cbs = Array.from(document.querySelectorAll('.pm-static-cb:checked'));
  const proxiesToDel = cbs.map(cb => cb.dataset.proxy).filter(Boolean);
  if (!proxiesToDel.length) return toast('Vui lòng tích chọn ít nhất 1 proxy tĩnh để xóa', 'err');
  if (!confirm(`Bạn có chắc chắn muốn XÓA ${proxiesToDel.length} proxy tĩnh đã chọn khỏi bảng theo dõi không?`)) return;

  const toDelSet = new Set(proxiesToDel);
  Proxies.staticList = Proxies.staticList.filter(p => !toDelSet.has(p));
  proxiesToDel.forEach(p => delete Proxies.staticCache[p]);
  await Proxies.save(false);

  const assigned = (S.profiles || []).filter(p => p.proxy && toDelSet.has(p.proxy));
  for (const prof of assigned) {
    try {
      await api('PATCH', `/api/profiles/${prof.id}`, { proxy: null, proxy_rotate: false, proxy_key: null });
    } catch (_) {}
  }

  toast(`✅ Đã xóa ${proxiesToDel.length} proxy tĩnh đã chọn khỏi bảng theo dõi!`);
  await App.refresh();
  Proxies.updateStats();
  Proxies.renderStaticTable();
  Proxies.renderAccProxyTable();
};

/** Tích chọn tất cả các proxy tĩnh chết / lỗi */
Proxies.selectDeadStatic = function () {
  const cbs = Array.from(document.querySelectorAll('.pm-static-cb'));
  let count = 0;
  cbs.forEach(cb => {
    const p = cb.dataset.proxy;
    const cache = Proxies.staticCache[p];
    if (cache && cache.ok === false) {
      cb.checked = true;
      count++;
    } else {
      cb.checked = false;
    }
  });
  Proxies.updateStaticSelectCount();
  if (count === 0) {
    toast('Không tìm thấy proxy chết nào trong kết quả kiểm tra (Hãy bấm "Kiểm tra kết nối" trước).', 'err');
  } else {
    toast(`Đã chọn ${count} proxy chết / lỗi! Bấm "Xóa proxy đã chọn" để xóa.`);
  }
};

/** Xóa sạch tất cả các proxy chết / lỗi */
Proxies.deleteDeadStatic = async function () {
  const deadList = Proxies.staticList.filter(p => {
    const cache = Proxies.staticCache[p];
    return cache && cache.ok === false;
  });
  if (!deadList.length) {
    return toast('Không tìm thấy proxy chết nào trong bộ nhớ (Hãy bấm "Kiểm tra kết nối & ping ms" trước để rà soát).', 'err');
  }
  if (!confirm(`Hệ thống tìm thấy ${deadList.length} proxy tĩnh bị chết hoặc lỗi kết nối.\n\nBạn có chắc chắn muốn XÓA SẠCH TOÀN BỘ ${deadList.length} proxy này khỏi bảng theo dõi không?`)) return;

  const deadSet = new Set(deadList);
  Proxies.staticList = Proxies.staticList.filter(p => !deadSet.has(p));
  deadList.forEach(p => delete Proxies.staticCache[p]);
  await Proxies.save(false);

  const assigned = (S.profiles || []).filter(p => p.proxy && deadSet.has(p.proxy));
  for (const prof of assigned) {
    try {
      await api('PATCH', `/api/profiles/${prof.id}`, { proxy: null, proxy_rotate: false, proxy_key: null });
    } catch (_) {}
  }

  toast(`🔥 Đã xóa sạch ${deadList.length} proxy chết/lỗi khỏi bảng theo dõi!`);
  await App.refresh();
  Proxies.updateStats();
  Proxies.renderStaticTable();
  Proxies.renderAccProxyTable();
};

/** Xóa sạch toàn bộ danh sách proxy tĩnh */
Proxies.clearAllStatic = async function () {
  if (!Proxies.staticList.length) return toast('Danh sách proxy tĩnh trong bảng theo dõi đã trống.');
  if (!confirm(`Bạn có chắc muốn XÓA SẠCH TOÀN BỘ ${Proxies.staticList.length} proxy tĩnh khỏi bảng theo dõi không?`)) return;
  Proxies.staticList = [];
  Proxies.staticCache = {};
  await Proxies.save(true);
  Proxies.renderStaticTable();
  toast('Đã xóa sạch toàn bộ proxy tĩnh khỏi bảng theo dõi!');
};

/* ── BẢNG TÀI KHOẢN & PHÂN BỔ PROXY ─────────────────────────── */

Proxies.renderAccProxyTable = function () {
  const tbody = $('#pm_acc_proxy_list');
  if (!tbody) return;
  const q = ($('#pm_acc_search')?.value || '').toLowerCase().trim();
  const profs = (S.profiles || []).filter(p => !q || (p.name || '').toLowerCase().includes(q) || (p.id || '').toLowerCase().includes(q));

  if (!profs.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:16px;color:var(--ink-3)">Không tìm thấy tài khoản nào khớp.</td></tr>';
    Proxies.updateAccProxySelectCount();
    return;
  }

  tbody.innerHTML = profs.map((p, idx) => {
    let modeText = '<span class="dim" style="font-size:12px">IP Gốc (Không proxy)</span>';
    let detailHtml = '<span class="dim">—</span>';
    let statusBadge = '<span class="badge dim">Tắt</span>';

    if (p.proxy_rotate) {
      modeText = '<span style="color:#38bdf8;font-weight:600;font-size:12px">⚡ TopProxy (Xoay)</span>';
      const key = p.proxy_key || '';
      const shortK = key.length > 16 ? (key.slice(0, 6) + '…' + key.slice(-4)) : (key || 'Mặc định');
      detailHtml = `<code style="font-size:11.5px;color:var(--ink);background:var(--panel-2);padding:2px 6px;border-radius:4px" title="Key: ${esc(key)}">🔑 ${esc(shortK)}</code>`;
      statusBadge = '<span class="badge ok">Live</span>';
    } else if (p.proxy) {
      modeText = '<span style="color:#a855f7;font-weight:600;font-size:12px">🌐 Proxy Tĩnh</span>';
      detailHtml = `<span style="font-family:monospace;font-size:11.5px" title="${esc(p.proxy)}">${esc(p.proxy.length > 28 ? p.proxy.slice(0, 25) + '…' : p.proxy)}</span>`;
      statusBadge = '<span class="badge ok">Live</span>';
    }

    return `
      <tr>
        <td style="text-align:center">
          <input type="checkbox" class="pm-acc-proxy-cb" value="${esc(p.id)}" style="cursor:pointer">
        </td>
        <td style="text-align:center;color:var(--ink-3)">#${idx + 1}</td>
        <td>
          <div style="font-weight:700;font-size:13px;color:var(--ink)">${esc(p.name)}</div>
          <div style="font-size:11px;color:var(--ink-3)">${esc(p.id)}</div>
        </td>
        <td>${modeText}</td>
        <td>${detailHtml}</td>
        <td>${statusBadge}</td>
        <td style="text-align:center">
          <div style="display:inline-flex;gap:4px;align-items:center">
            <button type="button" class="btn xs" onclick="Accounts.openProxyBox(S.profiles.find(x => x.id === '${p.id}'))" style="font-weight:600;padding:2px 8px;border-radius:4px">⚙️ Đổi</button>
            ${(p.proxy || p.proxy_rotate) ? `<button type="button" class="btn xs danger" onclick="Proxies.removeAccountProxy('${p.id}')" style="background:#dc2626;color:#fff;border:none;font-weight:600;padding:2px 8px;border-radius:4px" title="Gỡ bỏ proxy của nick này để đi thẳng IP máy">🗑️ Gỡ</button>` : ''}
            ${p.proxy_rotate && p.proxy_key ? `<button type="button" class="btn xs" onclick="Accounts.rotateProfileProxy('${p.id}', this)" style="background:#0284c7;color:#fff;border:none;font-weight:600;padding:2px 6px;border-radius:4px" title="Lấy IP mới ngay cho nick này">🔄 Đổi IP</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.pm-acc-proxy-cb').forEach(cb => {
    cb.addEventListener('change', () => Proxies.updateAccProxySelectCount());
  });
  Proxies.updateAccProxySelectCount();
};

Proxies.updateAccProxySelectCount = function () {
  const cbs = Array.from(document.querySelectorAll('.pm-acc-proxy-cb'));
  const checked = cbs.filter(cb => cb.checked);
  const btnSel = $('#pm_btn_del_sel_acc_proxies');
  const countEl = $('#pm_sel_acc_proxy_count');
  if (countEl) countEl.textContent = String(checked.length);
  if (btnSel) btnSel.style.display = checked.length > 0 ? 'inline-flex' : 'none';

  const allCb = $('#pm_acc_proxy_select_all');
  if (allCb) {
    allCb.checked = cbs.length > 0 && checked.length === cbs.length;
    allCb.indeterminate = checked.length > 0 && checked.length < cbs.length;
  }
};

Proxies.removeSelectedAccountProxies = async function () {
  const cbs = Array.from(document.querySelectorAll('.pm-acc-proxy-cb:checked'));
  const ids = cbs.map(cb => cb.value).filter(Boolean);
  if (!ids.length) return toast('Vui lòng chọn ít nhất 1 tài khoản để gỡ proxy', 'err');

  const profiles = S.profiles || [];
  const profsWithProxy = ids.filter(id => {
    const p = profiles.find(x => x.id === id);
    return p && (p.proxy || p.proxy_rotate);
  });
  if (!profsWithProxy.length) return toast('Các tài khoản đã chọn đều đang chạy trực tiếp bằng IP máy (không có proxy).');

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
  Proxies.updateStats();
  Proxies.renderRotKeysTable();
  Proxies.renderAccProxyTable();
};

Proxies.removeAccountProxy = async function (profileId) {
  const p = (S.profiles || []).find(x => x.id === profileId);
  const name = p ? p.name : 'tài khoản này';
  if (!confirm(`Bạn có chắc muốn gỡ bỏ hoàn toàn proxy của "${name}" để nick đi thẳng bằng IP máy không?`)) return;
  try {
    await api('PATCH', `/api/profiles/${profileId}`, {
      proxy: null,
      proxy_rotate: false,
      proxy_key: null
    });
    toast(`✅ Đã gỡ bỏ proxy của "${name}"!`);
    await App.refresh();
    Proxies.updateStats();
    Proxies.renderRotKeysTable();
    Proxies.renderAccProxyTable();
  } catch (err) {
    toast('Lỗi gỡ proxy: ' + err.message, 'err');
  }
};

Proxies.clearAllProxies = async function () {
  const profsWithProxy = (S.profiles || []).filter(p => p.proxy || p.proxy_rotate);
  if (!profsWithProxy.length) return toast('Hiện không có tài khoản nào đang dùng proxy.');
  if (!confirm(`Bạn có chắc chắn muốn GỠ BỎ PROXY của toàn bộ ${profsWithProxy.length} tài khoản không?\n\nTất cả nick sẽ chuyển về chạy trực tiếp bằng IP máy tính.`)) return;

  toast(`Đang gỡ bỏ proxy cho ${profsWithProxy.length} tài khoản...`);
  let count = 0;
  for (const p of profsWithProxy) {
    try {
      await api('PATCH', `/api/profiles/${p.id}`, {
        proxy: null,
        proxy_rotate: false,
        proxy_key: null
      });
      count++;
    } catch (_) {}
  }
  toast(`✅ Đã gỡ bỏ proxy thành công cho ${count} tài khoản!`);
  await App.refresh();
  Proxies.updateStats();
  Proxies.renderRotKeysTable();
  Proxies.renderAccProxyTable();
};

/* ── KIỂM TRA & LƯU CẤU HÌNH ─────────────────────────────────── */

/** Kiểm tra danh sách API key (nhận mảng keys hoặc kiểm tra toàn bộ bảng) */
Proxies.checkKeys = async function (keysToCheck = null) {
  const keys = (keysToCheck && keysToCheck.length) ? keysToCheck : (Proxies.keys || []);
  if (!keys.length) return toast('Chưa có API key nào để kiểm tra', 'err');
  const btn = $('#pm_btn_check_all_rot');
  const btnSub = $('#pm_btn_check_keys');
  const btnAdd = $('#pm_btn_add_and_check_keys');
  if (btn) btn.disabled = true;
  if (btnSub) btnSub.disabled = true;
  if (btnAdd) btnAdd.disabled = true;
  toast(`Đang kiểm tra ${keys.length} API Key TopProxy và lấy IP xuất...`);

  keys.forEach(k => {
    Proxies.keyCache[k] = Object.assign(Proxies.keyCache[k] || {}, { loading: true });
  });
  Proxies.renderRotKeysTable();

  try {
    const res = await api('POST', '/api/proxy/check-rotating', { keys });
    let live = 0;
    if (res && res.results && Array.isArray(res.results)) {
      res.results.forEach(r => {
        Proxies.keyCache[r.key] = {
          loading: false,
          ok: !!r.ok,
          ip: r.ip || r.proxyhttp || '',
          location: r.location || '',
          isp: r.isp || '',
          expires: r.expires || '',
          message: r.message || (r.ok ? 'Kết nối thành công' : 'Lỗi')
        };
        if (r.ok) live++;
      });
    } else if (res && keys.length === 1) {
      const k = keys[0];
      Proxies.keyCache[k] = {
        loading: false,
        ok: !!res.ok,
        ip: res.ip || res.proxyhttp || '',
        location: res.location || '',
        isp: res.isp || '',
        expires: res.expires || '',
        message: res.message || (res.ok ? 'Kết nối thành công' : 'Lỗi')
      };
      if (res.ok) live++;
    }

    Proxies.updateStats();
    Proxies.renderRotKeysTable();
    toast(`✅ Kiểm tra xong: ${live} / ${keys.length} key hoạt động tốt!`, live > 0 ? 'ok' : 'err');
  } catch (err) {
    keys.forEach(k => {
      Proxies.keyCache[k] = { loading: false, ok: false, message: err.message };
    });
    Proxies.renderRotKeysTable();
    toast('Lỗi kiểm tra key: ' + err.message, 'err');
  } finally {
    if (btn) btn.disabled = false;
    if (btnSub) btnSub.disabled = false;
    if (btnAdd) btnAdd.disabled = false;
  }
};

Proxies.checkAllKeys = function () {
  return Proxies.checkKeys(Proxies.keys);
};

Proxies.checkSingleKey = async function (key) {
  if (!key) return;
  toast(`Đang kiểm tra & lấy IP mới cho key: ${key.slice(0, 8)}...`);
  Proxies.keyCache[key] = Object.assign(Proxies.keyCache[key] || {}, { loading: true });
  Proxies.renderRotKeysTable();
  try {
    const res = await api('POST', '/api/proxy/check-rotating', { key });
    Proxies.keyCache[key] = {
      loading: false,
      ok: !!res.ok,
      ip: res.ip || res.proxyhttp || '',
      location: res.location || '',
      isp: res.isp || '',
      expires: res.expires || '',
      message: res.message || (res.ok ? 'Kết nối thành công' : 'Lỗi')
    };
    Proxies.updateStats();
    Proxies.renderRotKeysTable();
    if (res.ok) {
      toast(`✅ Key hợp lệ! IP mới: ${res.ip} (${res.location || ''})`);
    } else {
      toast(res.error || res.message || 'Key không lấy được IP', 'err');
    }
  } catch (err) {
    Proxies.keyCache[key] = { loading: false, ok: false, message: err.message };
    Proxies.renderRotKeysTable();
    toast('Lỗi: ' + err.message, 'err');
  }
};

Proxies.checkStatic = async function (proxiesToCheck = null) {
  const list = (proxiesToCheck && proxiesToCheck.length) ? proxiesToCheck : (Proxies.staticList || []);
  if (!list.length) return toast('Danh sách proxy tĩnh đang trống', 'err');
  const btn = $('#pm_btn_check_static');
  const btnAdd = $('#pm_btn_add_and_check_static');
  const resEl = $('#pm_static_res');
  if (btn) btn.disabled = true;
  if (btnAdd) btnAdd.disabled = true;
  if (resEl) resEl.textContent = 'Đang kiểm tra kết nối proxy tĩnh…';

  list.forEach(p => {
    Proxies.staticCache[p] = Object.assign(Proxies.staticCache[p] || {}, { loading: true });
  });
  Proxies.renderStaticTable();

  try {
    const r = await api('POST', '/api/proxy/check', { proxies: list });
    const results = r.results || [];
    let okCount = 0;

    results.forEach((res, i) => {
      const p = list[i] || res.proxy;
      if (res.ok) okCount++;
      Proxies.staticCache[p] = {
        loading: false,
        ok: !!res.ok,
        ip: res.ip || '',
        ms: res.ms || 0,
        error: res.error || (res.ok ? '' : 'Lỗi kết nối')
      };
    });

    Proxies.renderStaticTable();
    if (resEl) resEl.innerHTML = `<span style="color:#10b981;font-weight:700">✅ Hoàn tất: ${okCount} / ${results.length} proxy hoạt động tốt!</span>`;
    toast(`Đã kiểm tra ${results.length} proxy tĩnh: ${okCount} sống!`);
  } catch (err) {
    list.forEach(p => {
      Proxies.staticCache[p] = { loading: false, ok: false, error: err.message };
    });
    Proxies.renderStaticTable();
    if (resEl) resEl.innerHTML = `<span style="color:#ef4444;font-weight:700">❌ Lỗi: ${esc(err.message)}</span>`;
    toast(err.message, 'err');
  } finally {
    if (btn) btn.disabled = false;
    if (btnAdd) btnAdd.disabled = false;
  }
};

Proxies.save = async function (showToast = true) {
  const mode = $('#pm_proxy_mode')?.value || 'topproxy';
  const keys = Proxies.keys || [];
  const keysStr = keys.join('\n');
  const staticPool = Proxies.staticList || [];

  try {
    const r = await api('POST', '/api/settings', {
      proxy_mode: mode,
      topproxy_key: keysStr,
      topproxy_keys: keysStr,
      proxy_pool: staticPool
    });
    if (r && r.settings) {
      S.meta = S.meta || {};
      S.meta.settings = r.settings;
    }
    // Đồng bộ lại modal settings nếu mở
    if ($('#s_proxy_mode')) $('#s_proxy_mode').value = mode;
    if ($('#s_topproxy_key')) $('#s_topproxy_key').value = keysStr;
    if ($('#s_proxy_pool')) $('#s_proxy_pool').value = staticPool.join('\n');
    Proxies.updateStats();
    if (showToast) toast(`Đã lưu cấu hình Proxy (${keys.length} key xoay, ${staticPool.length} proxy tĩnh)!`);
  } catch (err) {
    if (showToast) toast('Lỗi lưu cấu hình: ' + err.message, 'err');
  }
};

Proxies.distributeAll = async function () {
  await Proxies.save(false);
  const btn = $('#pm_btn_distribute_all');
  if (btn) btn.disabled = true;
  try {
    const r = await api('POST', '/api/profiles/assign-proxy');
    if (r.mode === 'topproxy') {
      toast(`✅ Đã phân bổ đều ${r.pool} Key TopProxy cho toàn bộ ${r.assigned} tài khoản!`);
    } else if (!r.assigned) {
      toast('Mọi nick đã có proxy riêng — không cần gán thêm');
    } else {
      toast(`✅ Đã chia ${r.pool} proxy cho ${r.assigned} tài khoản!`);
    }
    await App.refresh();
    Proxies.updateStats();
    Proxies.renderRotKeysTable();
    Proxies.renderAccProxyTable();
  } catch (err) {
    toast('Lỗi chia proxy: ' + err.message, 'err');
  } finally {
    if (btn) btn.disabled = false;
  }
};

// Wire event listeners on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  $('#pm_btn_save')?.addEventListener('click', () => Proxies.save(true));

  // TopProxy Key Controls
  $('#pm_btn_add_and_check_keys')?.addEventListener('click', () => Proxies.addAndCheckKeys());
  $('#pm_btn_apply_keys')?.addEventListener('click', () => Proxies.applyKeys());
  $('#pm_btn_check_keys')?.addEventListener('click', () => Proxies.onCheckKeysClick());
  $('#pm_btn_check_all_rot')?.addEventListener('click', () => Proxies.checkAllKeys());
  $('#pm_topproxy_input')?.addEventListener('input', () => Proxies.updateStats());

  $('#pm_btn_distribute_all')?.addEventListener('click', () => Proxies.distributeAll());
  $('#pm_btn_reassign_all')?.addEventListener('click', () => Proxies.distributeAll());

  // TopProxy Batch Controls
  $('#pm_keys_select_all')?.addEventListener('change', e => {
    document.querySelectorAll('.pm-key-cb').forEach(cb => { cb.checked = e.target.checked; });
    Proxies.updateKeySelectCount();
  });
  $('#pm_btn_clear_key_sel')?.addEventListener('click', () => Proxies.clearKeySelection());
  $('#pm_btn_select_expired_keys')?.addEventListener('click', () => Proxies.selectExpiredKeys());
  $('#pm_btn_del_selected_keys')?.addEventListener('click', () => Proxies.deleteSelectedKeys());
  $('#pm_btn_del_expired_keys')?.addEventListener('click', () => Proxies.deleteExpiredKeys());

  // Static Pool Controls
  $('#pm_btn_add_and_check_static')?.addEventListener('click', () => Proxies.addAndCheckStatic());
  $('#pm_btn_apply_static')?.addEventListener('click', () => Proxies.applyStatic());
  $('#pm_btn_check_static')?.addEventListener('click', () => Proxies.onCheckStaticClick());
  $('#pm_btn_clear_static')?.addEventListener('click', () => Proxies.clearAllStatic());
  $('#pm_static_pool')?.addEventListener('input', () => Proxies.updateStats());

  $('#pm_static_select_all')?.addEventListener('change', e => {
    document.querySelectorAll('.pm-static-cb').forEach(cb => { cb.checked = e.target.checked; });
    Proxies.updateStaticSelectCount();
  });
  $('#pm_btn_clear_static_sel')?.addEventListener('click', () => Proxies.clearStaticSelection());
  $('#pm_btn_select_dead_static')?.addEventListener('click', () => Proxies.selectDeadStatic());
  $('#pm_btn_del_selected_static')?.addEventListener('click', () => Proxies.deleteSelectedStatic());
  $('#pm_btn_del_dead_static')?.addEventListener('click', () => Proxies.deleteDeadStatic());

  // Account Proxy Controls
  $('#pm_acc_search')?.addEventListener('input', () => Proxies.renderAccProxyTable());
  $('#pm_acc_proxy_select_all')?.addEventListener('change', e => {
    document.querySelectorAll('.pm-acc-proxy-cb').forEach(cb => { cb.checked = e.target.checked; });
    Proxies.updateAccProxySelectCount();
  });
  $('#pm_btn_del_sel_acc_proxies')?.addEventListener('click', () => Proxies.removeSelectedAccountProxies());
  $('#pm_btn_clear_all_acc_proxies')?.addEventListener('click', () => Proxies.clearAllProxies());

  // Proxy mode
  $('#pm_proxy_mode')?.addEventListener('change', () => {
    Proxies.save(false);
    Proxies.updateStats();
  });
  $('#pm_btn_use_tor')?.addEventListener('click', () => {
    if ($('#pm_proxy_mode')) $('#pm_proxy_mode').value = 'tor';
    Proxies.save(true);
    toast('Đã chuyển sang chế độ dùng Tor Free!');
  });
});
