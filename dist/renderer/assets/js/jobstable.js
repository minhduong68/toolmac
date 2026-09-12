const JICON_EYE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="16" height="16" fill="currentColor">
  <path d="M288 32c-144.8 0-267.8 82.8-325.5 204.3a48.59 48.59 0 0 0 0 43.4C20.2 401.2 143.2 484 288 484s267.8-82.8 325.5-204.3a48.59 48.59 0 0 0 0-43.4C555.8 114.8 432.8 32 288 32zm0 320c-70.7 0-128-57.3-128-128s57.3-128 128-128 128 57.3 128 128-57.3 128-128 128zm0-192a64 64 0 1 0 64 64 64.07 64.07 0 0 0-64-64z"/>
</svg>`;

function detailCell(j) {
  const r = j.result || {};
  const resp = (r.dola_response || j.error || r.error_hint || '').trim();
  const hasResp = Boolean(resp);
  let displayText = '';
  if (hasResp) {
    displayText = resp.length > 28 ? resp.slice(0, 28) + '…' : resp;
  } else if (j.status === 'running') {
    displayText = 'Đang đợi phản hồi…';
  } else {
    const when = j.status === 'done' && j.finished ? j.finished : j.created;
    displayText = when ? relTime(when) : '—';
  }
  return `<div class="detail-cell-wrap" style="display:flex;align-items:center;gap:6px;max-width:180px">
    <span class="detail-preview ${hasResp ? '' : 'dim'}" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;font-size:11.5px" title="${esc(resp || displayText)}">${esc(displayText)}</span>
    <button type="button" class="btn quiet sm btn-detail-eye" data-act="view-detail" title="Xem chi tiết phản hồi" style="padding:3px 5px;display:inline-flex;align-items:center;justify-content:center;line-height:1;border-radius:5px;cursor:pointer;flex-shrink:0;color:var(--moss)">
      ${JICON_EYE}
    </button>
  </div>`;
}

Jobs.openDetail = function (job) {
  const r = job.result || {};
  const resp = (r.dola_response || job.error || r.error_hint || '').trim();
  const box = $('#detailbox');
  if (!box) return;
  $('#detailtitle').textContent = `#${job.seq} · Chi tiết phản hồi Dola`;
  $('#detailprompt').textContent = job.prompt || '—';
  $('#detailcontent').textContent = resp || '(Chưa có nội dung phản hồi từ Dola)';
  const chips = [];
  if (job.model) chips.push(`Seedance ${job.model}`);
  if (job.duration) chips.push(`${job.duration} giây`);
  if (job.ratio) chips.push(job.ratio);
  if (job.assigned_name || job.assigned) chips.push(job.assigned_name || job.assigned);
  const when = job.status === 'done' && job.finished ? job.finished : job.created;
  if (when) chips.push(`${fmtTime(when)} (${relTime(when)})`);
  if (r.credits_left != null) chips.push(`Còn ${r.credits_left} credit`);
  $('#detailmeta').innerHTML = chips.map(c => `<span class="chip">${esc(c)}</span>`).join('');
  const copyBtn = $('#detailcopy');
  if (copyBtn) {
    copyBtn.onclick = () => {
      copyText(resp || job.prompt || '', 'chi tiết phản hồi');
    };
  }
  openModal(box);
};

/* Danh sách video dạng BẢNG (mỗi job một hàng) + hộp phát video + nút đổi Bảng/Lưới.
 * Dùng lại của jobs.js: Jobs.shown, Jobs.explain, Jobs.eta, jobActions (thẻ), Jobs.onAct (xử lý nút),
 * S.selected / Jobs.renderBulk (chọn nhiều). Cập nhật tại chỗ theo id, không vẽ lại cả bảng mỗi 2 giây. */

const JICON = {
  play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="M12 3l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 21l1.2-6.5L2.5 9.9 9.1 9z"/></svg>',
  retry: '<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v5h-5"/></svg>',
  down: '<svg viewBox="0 0 24 24"><path d="M12 4v11"/><path d="M7 10l5 5 5-5"/><path d="M4 19h16"/></svg>',
  folder: '<svg viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
  copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>',
  bug: '<svg viewBox="0 0 24 24"><path d="M12 3l10 18H2z"/><path d="M12 10v4"/><path d="M12 17.5v.5"/></svg>',
  window: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/></svg>',
  reuse: '<svg viewBox="0 0 24 24"><path d="M4 12h12"/><path d="M12 8l4 4-4 4"/><path d="M20 5v14"/></svg>',
  lib: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 9"/></svg>',
  cancel: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 8l8 8M16 8l-8 8"/></svg>',
  log: '<svg viewBox="0 0 24 24"><path d="M5 6h14M5 12h14M5 18h9"/></svg>',
};

// ------------------------------------------------------------ kiểu hiển thị
Jobs.view = () => S.view || (S.view = lsGet('sv.view', 'table'));
Jobs.setView = function (v) {
  if (v === S.view) return;
  S.view = v; lsSet('sv.view', v);
  $('#jobs').innerHTML = '';
  Jobs.render(S.jobs);
};
$('#viewsel').addEventListener('click', ev => {
  const b = ev.target.closest('button[data-view]'); if (!b) return;
  Jobs.setView(b.dataset.view);
});
function paintViewSel() {
  $$('#viewsel button').forEach(b => b.classList.toggle('on', b.dataset.view === Jobs.view()));
}

// ------------------------------------------------------------ ô của một hàng
function statusCell(j) {
  const r = j.result || {};
  if (j.kind !== 'generate') {
    const t = KIND[j.kind] || j.kind;
    if (j.status === 'running') return `<span class="badge run">Đang chạy</span><div class="sub">${esc(j.stage_note || (j.kind === 'login' ? 'Cửa sổ đăng nhập đang mở' : 'Đang kiểm tra phiên với Dola'))}</div>`;
    if (j.status === 'done') {
      const note = r.login === false ? 'CHƯA đăng nhập' : r.login ? `Đã đăng nhập${r.credits != null ? `, còn ${r.credits} credit` : ''}` : 'Xong';
      return `<span class="badge ${r.login === false ? 'bad' : 'ok'}">${esc(t)}</span><div class="sub">${esc(note)}</div>`;
    }
    return `<span class="badge ${j.status === 'error' ? 'bad' : ''}">${esc(STATUS[j.status] || j.status)}</span><div class="sub">${esc(j.error || t)}</div>`;
  }
  if (j.status === 'running') {
    const pct = Math.max(0, Math.min(100, Number(j.progress) || 0));
    const note = j.stage_note || 'Đang mở trình duyệt';
    const tries = j.attempts ? ` · thử lại ${j.attempts}/3` : '';
    return `<div class="status-run-wrap"><span class="badge run">Đang tạo <b>${elapsed(j.started)}</b></span>
      <button type="button" class="btn-cancel-now" data-act="cancel" title="Dừng task tức thì (giải phóng luồng ngay)">Dừng ngay</button></div>
      <div class="pbar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
      <div class="sub stage">${esc(note)}${tries}</div><div class="sub dim">${esc(Jobs.eta(j))}</div>`;
  }
  if (j.status === 'queued') {
    const note = j.stage_note && /^(Đổi nick|Lỗi tạm)/.test(j.stage_note) ? j.stage_note : (S.meta && S.meta.paused ? 'Hàng đợi đang tạm dừng' : Jobs.eta(j));
    return `<span class="badge">Đang chờ</span><div class="sub dim">${esc(note)}</div>`;
  }
  if (j.status === 'done') {
    if (j.dry_run) return `<span class="badge ok">Chạy thử xong</span><div class="sub dim">không tốn credit</div>`;
    const wm = r.path && !r.watermark_removed ? ' · còn watermark' : '';
    return `<span class="badge ok">🏆 Xong</span><div class="sub dim">${r.playable ? 'phát được' : r.path ? 'HEVC, mở bằng VLC' : ''}${wm}</div>`;
  }
  if (j.status === 'error' || j.status === 'interrupted') {
    const hint = Jobs.explain(j) || j.error || '';
    const credit = r.credit_used ? `<span class="chip ${r.credit_used === 'no' ? 'ok' : r.credit_used === 'yes' ? 'bad' : 'warn'}">${{no: 'chưa trừ credit', yes: 'đã trừ, video có trên Dola', maybe: 'có thể đã trừ'}[r.credit_used]}</span>` : '';
    return `<span class="badge bad">${j.status === 'error' ? 'Không tạo được' : 'Gián đoạn'}</span><div class="sub why" title="${esc(j.error || '')}">${esc(hint)}</div>${credit}`;
  }
  return `<span class="badge">${esc(STATUS[j.status] || j.status)}</span>`;
}
function videoCell(j) {
  const r = j.result || {};
  if (j.kind !== 'generate') return '<span class="dim">—</span>';
  if (j.status === 'done' && r.path) {
    const tall = !j.ratio || /^(9:16|3:4)$/.test(j.ratio);
    return `<button type="button" class="thumb ${tall ? 'tall' : 'wide'}" data-act="play" title="Phát video">
      <img src="${withToken(`/api/jobs/${j.id}/thumb`)}" alt="" loading="lazy" onerror="this.remove()"><span class="pl">${JICON.play}</span></button>`;
  }
  if (j.status === 'running') return `<div class="thumb tall ph"><div class="ring sm"></div></div>`;
  return '<span class="dim">—</span>';
}
function accountCell(j) {
  if (j.status === 'running' && j.assigned) return `<div class="sub dim" style="margin:0 0 3px">${j.kind === 'generate' ? 'đang tạo bằng' : 'đang chạy trên'}</div><span class="chip live" title="${esc(j.assigned_name || j.assigned)}"><b>${esc(j.assigned_name || j.assigned)}</b></span>`;
  if (j.assigned) return `<span class="chip">${esc(j.assigned_name || j.assigned)}</span>`;
  if (j.status === 'queued') return `<span class="chip">${j.profile === 'auto' ? 'tự chọn nick rảnh' : 'chờ ' + esc(j.profile_name)}</span>`;
  return `<span class="chip">${esc(j.profile_name || '')}</span>`;
}
function specCell(j) {
  if (j.kind !== 'generate') return '<span class="dim">—</span>';
  const extra = [];
  if (j.ratio) extra.push(esc(j.ratio));
  if (j.images && j.images.length) extra.push(`${j.images.length} ảnh`);
  (j.assets || []).forEach(t => extra.push('@' + esc(t)));
  const is25 = j.model === '2.5';
  const is30 = j.duration === 30;
  const modelBadge = is25
    ? `<div class="spec-model vip">⚡ Seedance 2.5 PRO</div>`
    : `<div class="spec-model">Seedance ${esc(j.model)}</div>`;
  const durBadge = is30
    ? `<div class="spec-dur hot">🔥 30s CỰC ĐẠI${extra.length ? ' · ' + extra.join(' · ') : ''}</div>`
    : `<div class="spec-dur">⏱️ ${j.duration} giây${extra.length ? ' · ' + extra.join(' · ') : ''}</div>`;
  return `${modelBadge}${durBadge}`;
}
function fileCell(j) {
  const r = j.result || {};
  if (!r.path) return '<span class="dim">—</span>';
  const name = String(r.path).split(/[\\/]/).pop();
  return `<button type="button" class="linkish" data-act="folder" title="${esc(r.path)}">${esc(name)}</button>`;
}
function rowActions(j) {
  const r = j.result || {}, a = [];
  const ico = (act, icon, title, cls = '') => a.push(`<button type="button" class="ico ${cls}" data-act="${act}" title="${esc(title)}">${JICON[icon]}</button>`);
  if (j.kind === 'generate' && j.assigned) ico('window', 'window', S.winShown.has(j.assigned) ? 'Đóng cửa sổ Dola' : 'Xem Dola: mở trang Dola của tài khoản này trong cửa sổ của app', S.winShown.has(j.assigned) ? 'on' : 'hot');
  if (j.status === 'queued') ico('cancel', 'cancel', 'Huỷ, bỏ khỏi hàng đợi');
  if (j.status === 'running') ico('cancel', 'cancel', 'Dừng task tức thì (giải phóng luồng ngay)', 'danger hot');
  if (j.status === 'done' && r.path) {
    a.push(`<a class="ico" href="${withToken(`/api/jobs/${j.id}/video`)}" download="${esc(String(r.path).split(/[\\/]/).pop())}" title="Tải xuống">${JICON.down}</a>`);
    ico('folder', 'folder', 'Mở thư mục chứa file');
  }
  if (j.kind === 'generate' && j.status !== 'queued') {
    ico('reuse', 'reuse', 'Dùng lại: đưa prompt và cài đặt về khung soạn');
    ico('copy', 'copy', 'Chép prompt');
  }
  if (['error', 'interrupted'].includes(j.status) && j.error) ico('copyerr', 'bug', 'Chép lỗi + nhật ký để gửi hỗ trợ');
  if (!['queued', 'running'].includes(j.status)) {
    if (j.kind === 'generate' && !r.path && !j.dry_run && r.conversation_url) ico('recover', 'star', 'Lấy video từ Dola: mở lại cuộc trò chuyện, có video thì tải về, không tốn credit', r.recover_first ? 'hot' : '');
    if (r.error_kind === 'duration_limit' && j.duration > 15) a.push(`<button type="button" class="btn sm primary-ish" data-act="retry15" title="Dola chỉ nhận 4–15 giây cho yêu cầu này: chạy lại đúng prompt với 15 giây">15 giây</button>`);
    ico('retry', 'retry', j.status === 'done' && !j.dry_run ? 'Chạy lại (gửi yêu cầu mới, trừ credit)' : 'Chạy lại');
    ico('delete', 'trash', 'Xoá khỏi danh sách (file vẫn còn)', 'danger');
  }
  return a.join('');
}

// ------------------------------------------------------------ hàng
function makeRow(j) {
  const tr = document.createElement('tr');
  tr.id = 'job-' + j.id;
  tr.innerHTML = `<td class="c-pick"><input type="checkbox" class="pick" title="Chọn để thao tác hàng loạt"></td>
    <td class="c-seq"></td><td class="c-status"></td><td class="c-video"></td>
    <td class="c-prompt"><p class="prompt" title="Bấm để xem đủ prompt"></p><div class="fileline"></div><details class="rlog"><summary>${JICON.log} Nhật ký</summary><pre></pre></details></td>
    <td class="c-acc"></td><td class="c-spec"></td><td class="c-file"></td><td class="c-detail"></td><td class="c-acts"><div class="acts"></div></td>`;
  tr.querySelector('.prompt').addEventListener('click', ev => ev.currentTarget.classList.toggle('open'));
  tr.querySelector('.pick').addEventListener('change', ev => { if (ev.target.checked) S.selected.add(j.id); else S.selected.delete(j.id); Jobs.renderBulk(); tr.classList.toggle('sel', ev.target.checked); });
  tr.addEventListener('click', ev => {
    const b = ev.target.closest('button[data-act]'); if (!b || !tr.contains(b)) return;
    Jobs.onAct(ev, tr, j);
  });
  return tr;
}
function setHtml(el, html) { if (el.innerHTML !== html) el.innerHTML = html; }
function updateRow(tr, j) {
  tr.dataset.status = j.status; tr.dataset.kind = j.kind;
  tr.classList.toggle('sel', S.selected.has(j.id));
  tr.querySelector('.pick').checked = S.selected.has(j.id);
  setHtml(tr.querySelector('.c-seq'), `#${j.seq}`);
  setHtml(tr.querySelector('.c-status'), statusCell(j));
  setHtml(tr.querySelector('.c-video'), videoCell(j));
  const label = j.kind === 'generate' ? j.prompt : `${KIND[j.kind] || j.kind} · ${j.profile_name || ''}`;
  const p = tr.querySelector('.prompt'); if (p.textContent !== label) p.textContent = label;
  // Tên tệp nằm ngay dưới prompt (bấm mở thư mục) thay vì một cột riêng chiếm chỗ.
  setHtml(tr.querySelector('.fileline'), fileCell(j) === '<span class="dim">—</span>' ? '' : fileCell(j));
  const pre = tr.querySelector('pre'), logText = j.log.join('\n');
  if (pre.textContent !== logText) pre.textContent = logText;
  tr.querySelector('.rlog').hidden = !j.log.length;
  setHtml(tr.querySelector('.c-acc'), accountCell(j));
  setHtml(tr.querySelector('.c-spec'), specCell(j));
  setHtml(tr.querySelector('.c-file'), fileCell(j));
  setHtml(tr.querySelector('.c-detail'), detailCell(j));
  setHtml(tr.querySelector('.acts'), rowActions(j));
}

Jobs.renderTable = function (box, shown) {
  paintViewSel();
  let tbody = box.querySelector('tbody');
  if (!box.classList.contains('table') || !tbody) {
    box.className = 'table';
    box.innerHTML = `<div class="tblwrap jwrap"><table class="tbl jtbl"><thead><tr>
      <th class="c-pick"></th><th class="c-seq">#</th><th class="c-status">Trạng thái</th><th class="c-video">Video</th><th class="c-prompt">Prompt · tệp</th><th class="c-acc">Tài khoản</th><th class="c-spec">Thông số</th><th class="c-file">Tệp</th><th class="c-detail">Chi tiết</th><th class="c-acts">Thao tác</th>
    </tr></thead><tbody></tbody></table></div>`;
    tbody = box.querySelector('tbody');
  }
  const seen = new Set();
  shown.forEach((j, i) => {
    seen.add('job-' + j.id);
    let tr = document.getElementById('job-' + j.id);
    if (!tr || tr.tagName !== 'TR') { if (tr) tr.remove(); tr = makeRow(j); }
    if (tbody.children[i] !== tr) tbody.insertBefore(tr, tbody.children[i] || null);
    updateRow(tr, j);
  });
  [...tbody.children].forEach(tr => { if (!seen.has(tr.id)) tr.remove(); });
};

// ------------------------------------------------------------ hộp phát video
Jobs.play = function (job) {
  const r = job.result || {};
  if (!r.path) return toast('Job này chưa có video', 'err');
  const box = $('#playbox'), v = $('#pbvideo');
  $('#pbtitle').textContent = `#${job.seq} · ${job.assigned_name || ''}`;
  $('#pbprompt').textContent = job.prompt;
  $('#pbmeta').innerHTML = `<span class="chip">${esc(job.model)}, ${job.duration} giây${job.ratio ? ', ' + esc(job.ratio) : ''}</span>${r.credits_left != null ? `<span class="chip">còn ${r.credits_left} credit</span>` : ''}<span class="chip">${esc(String(r.path).split(/[\\/]/).pop())}</span>`;
  $('#pbacts').innerHTML = `<a class="btn sm" href="${withToken(`/api/jobs/${job.id}/video`)}" download="${esc(String(r.path).split(/[\\/]/).pop())}">Tải xuống</a>
    <button type="button" class="btn sm quiet" data-act="folder">Thư mục</button>
    <button type="button" class="btn sm quiet" data-act="reuse">Dùng lại</button>
    ${r.playable ? '<button type="button" class="btn sm quiet" data-act="tolib">Lưu vào kho</button>' : ''}`;
  $('#pbacts').onclick = ev => Jobs.onAct(ev, box, job);
  v.setAttribute('controlsList', 'nodownload nofullscreen noremoteplayback noplaybackrate');
  v.disablePictureInPicture = true;
  v.disableRemotePlayback = true;
  v.loop = true;
  v.oncontextmenu = ev => { ev.preventDefault(); return false; };
  box.oncontextmenu = ev => { ev.preventDefault(); return false; };
  v.src = withToken(`/api/jobs/${job.id}/video`);
  box.classList.toggle('wide', !!job.ratio && /^(16:9|4:3|21:9)$/.test(job.ratio));
  openModal(box);
  v.play().catch(() => {});
};
const stopPbVideo = () => { const v = $('#pbvideo'); if (v) { v.pause(); v.removeAttribute('src'); try { v.load(); } catch (_) {} } };
$('#playbox').addEventListener('modal-close', stopPbVideo);
window.addEventListener('blur', () => { const box = $('#playbox'); if (box && box.hidden) stopPbVideo(); });
document.addEventListener('visibilitychange', () => { const box = $('#playbox'); if (document.hidden || (box && box.hidden)) stopPbVideo(); });
