
function getRowImages(j) {
  if (!j) return [];
  if (Array.isArray(j.images) && j.images.length > 0) return j.images;
  if (j.card && Array.isArray(j.card.images) && j.card.images.length > 0) return j.card.images;
  const cardIdx = (j.seq || 1) - 1;
  if (typeof Composer !== 'undefined') {
    if (Composer.multiCards && Composer.multiCards[cardIdx] && Array.isArray(Composer.multiCards[cardIdx].images) && Composer.multiCards[cardIdx].images.length > 0) {
      return Composer.multiCards[cardIdx].images;
    }
    if (j.status === 'draft' && (cardIdx === 0 || !Composer.multiCards || Composer.multiCards.length <= 1)) {
      if (Array.isArray(Composer.images) && Composer.images.length > 0) {
        return Composer.images;
      }
    }
  }
  return [];
}
window.getRowImages = getRowImages;

function resolveRefImgSrc(im) {
  if (!im) return '';
  if (typeof im === 'object') {
    if (im.preview) return im.preview;
    if (im.url) return im.url;
    if (im.id) {
      const fn = String(im.id).split(/[/\\]/).pop();
      return typeof withToken === 'function' ? withToken(`/api/uploads/${encodeURIComponent(fn)}`) : `/api/uploads/${encodeURIComponent(fn)}`;
    }
  }
  if (typeof im === 'string') {
    if (im.startsWith('data:') || im.startsWith('http://') || im.startsWith('https://')) return im;
    const fn = im.split(/[/\\]/).pop();
    return typeof withToken === 'function' ? withToken(`/api/uploads/${encodeURIComponent(fn)}`) : `/api/uploads/${encodeURIComponent(fn)}`;
  }
  return '';
}
window.resolveRefImgSrc = resolveRefImgSrc;

function sanitizeErrorDiagnostics(str) {
  if (!str) return '';
  return String(str)
    .replace(/(?:password|pass|pwd|key|token|secret|sessionid|sid_tt|cookie)[\s:="']+([^\s,"'}{]+)/gi, '***REDACTED***')
    .replace(/Bearer\s+[a-zA-Z0-9_\-\.]+/gi, 'Bearer ***REDACTED***')
    .replace(/([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/g, m => m.slice(0, 3) + '***@***');
}

Jobs.copySanitizedError = async function (job) {
  const r = job.result || {};
  const sanitize = sanitizeErrorDiagnostics;
  const lines = [
    '=== THÔNG TIN BÁO LỖI SEEDANCE ===',
    `Tác vụ: #${job.seq} (${job.id})`,
    `Trạng thái: ${job.status}`,
    `Thời gian: ${job.created || ''} -> ${job.finished || ''}`,
    `Tài khoản: ${job.assigned_name || job.assigned || 'Auto'}`,
    `Thông số: Seedance ${job.model || '2.5'} · ${job.duration || 15}s · ${job.ratio || '9:16'}`,
    `Prompt: ${sanitize(job.prompt)}`,
    `Chi tiết lỗi: ${sanitize(job.error || r.error_hint || 'Không rõ nguyên nhân')}`,
    r.error_hint ? `Chẩn đoán: ${sanitize(r.error_hint)}` : '',
    r.credit_used ? `Tình trạng credit: ${r.credit_used === 'no' ? 'Chưa trừ credit' : r.credit_used === 'yes' ? 'Đã trừ credit trên Dola' : 'Có thể đã trừ'}` : '',
    '',
    '=== NHẬT KÝ CHI TIẾT ===',
    ...(Array.isArray(job.log) ? job.log.slice(-15).map(sanitize) : []),
    '=================================='
  ].filter(Boolean);

  await copyText(lines.join('\n'), 'Đã chép thông tin lỗi (đã lọc bảo mật)');
};

Jobs.startInlinePromptEdit = function (tr, j) {
  const cPrompt = tr.querySelector('.c-prompt');
  if (!cPrompt || cPrompt.querySelector('.inline-edit-input')) return;
  const currentPrompt = j.prompt || '';
  cPrompt.innerHTML = `<div class="inline-edit-wrap" style="display:flex;align-items:center;gap:4px;width:100%">
    <input type="text" class="inline-edit-input" value="${esc(currentPrompt)}" style="flex:1">
    <button type="button" class="btn sm primary btn-inline-save" style="padding:2px 8px;font-size:11px">Lưu</button>
    <button type="button" class="btn sm quiet btn-inline-cancel" style="padding:2px 6px;font-size:11px">✕</button>
  </div>`;
  const inp = cPrompt.querySelector('.inline-edit-input');
  inp.focus();
  inp.select();

  const doSave = async () => {
    const val = inp.value.trim();
    if (!val) { toast('Prompt không được để trống', 'err'); return; }
    try {
      await api('POST', `/api/jobs/${j.id}/prompt`, { prompt: val });
      j.prompt = val;
      toast('Đã cập nhật prompt thành công!');
      updateRow(tr, j);
    } catch (err) {
      toast('Lỗi cập nhật: ' + err.message, 'err');
      updateRow(tr, j);
    }
  };

  cPrompt.querySelector('.btn-inline-save').onclick = doSave;
  cPrompt.querySelector('.btn-inline-cancel').onclick = () => updateRow(tr, j);
  inp.onkeydown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); doSave(); }
    if (e.key === 'Escape') { e.preventDefault(); updateRow(tr, j); }
  };
};

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

function cleanPrompt(p) {
  if (!p) return '';
  let str = String(p).trim();
  str = str.replace(/\[DIRECTOR SCENE[^\]]*\]\s*/gi, '');
  str = str.replace(/Cinematic camera angle, theatrical acting performance, professional fictional movie production scene:\s*/gi, '');
  str = str.replace(/\s*\[Technical Direction:[^\]]*\]/gi, '');
  return str.trim() || String(p).trim();
}

Jobs.openPrompt = function (job) {
  const box = $('#promptbox');
  if (!box) {
    Jobs.openDetail(job);
    return;
  }
  $('#prompttitle').textContent = `#${job.seq} · Chi tiết & Sửa Prompt`;
  const rawPrompt = job.prompt || '';
  const ta = $('#prompt_edit_textarea');
  if (ta) {
    ta.value = rawPrompt;
    ta.oninput = () => {
      if ($('#promptcharcount')) $('#promptcharcount').textContent = `${ta.value.length} ký tự`;
    };
  }
  if ($('#prompttext')) $('#prompttext').textContent = rawPrompt;
  if ($('#promptcharcount')) {
    $('#promptcharcount').textContent = `${rawPrompt.length} ký tự`;
  }

  const isDraft = job.status === 'draft';
  const isQueued = job.status === 'queued';
  const saveBtn = $('#btn_save_prompt_modal');
  const hintEl = $('#prompt_edit_hint');

  if (isDraft) {
    if (hintEl) {
      hintEl.textContent = '💡 Bạn đang sửa prompt bản nháp kịch bản. Bấm "Lưu thay đổi" để cập nhật ngay vào danh sách.';
      hintEl.style.color = '#38bdf8';
    }
    if (saveBtn) {
      saveBtn.style.display = 'inline-flex';
      saveBtn.innerHTML = '<span>💾</span><span>Lưu thay đổi (Kịch bản)</span>';
      saveBtn.onclick = () => {
        const val = ta ? ta.value.trim() : '';
        if (!val) { toast('Prompt không được để trống', 'err'); return; }
        job.prompt = val;
        const cardIdx = (job.seq || 1) - 1;
        if (typeof Composer !== 'undefined' && Composer.multiCards && Composer.multiCards[cardIdx]) {
          Composer.multiCards[cardIdx].prompt = val;
          if (typeof Composer.syncTextFromMultiCards === 'function') Composer.syncTextFromMultiCards();
        } else {
          const p = $('#p');
          if (p) {
            const lines = p.value.split(/\r?\n/);
            if (lines[cardIdx] !== undefined) lines[cardIdx] = val;
            p.value = lines.join('\n');
            if (typeof Composer !== 'undefined' && Composer.onInput) Composer.onInput();
          }
        }
        toast('Đã cập nhật prompt bản nháp thành công!');
        closeModal(box);
        const tr = document.getElementById('job-' + job.id);
        if (tr) updateRow(tr, job);
        else if (typeof App !== 'undefined') App.refresh();
      };
    }
  } else if (isQueued) {
    if (hintEl) {
      hintEl.textContent = '💡 Tác vụ đang trong hàng đợi. Bạn có thể sửa prompt trực tiếp bên dưới và bấm "Lưu thay đổi".';
      hintEl.style.color = '#38bdf8';
    }
    if (saveBtn) {
      saveBtn.style.display = 'inline-flex';
      saveBtn.innerHTML = '<span>💾</span><span>Lưu thay đổi (Hàng đợi)</span>';
      saveBtn.onclick = async () => {
        const val = ta ? ta.value.trim() : '';
        if (!val) { toast('Prompt không được để trống', 'err'); return; }
        try {
          await api('POST', `/api/jobs/${job.id}/prompt`, { prompt: val });
          job.prompt = val;
          toast('Đã cập nhật prompt thành công!');
          closeModal(box);
          const tr = document.getElementById('job-' + job.id);
          if (tr) updateRow(tr, job);
          else App.refresh();
        } catch (err) {
          toast('Lỗi cập nhật: ' + err.message, 'err');
        }
      };
    }
  } else {
    if (hintEl) {
      hintEl.textContent = 'ℹ️ Tác vụ đã chạy hoặc hoàn thành. Bạn có thể sửa nội dung và bấm "Đưa vào khung soạn" để tạo video mới.';
      hintEl.style.color = '#94a3b8';
    }
    if (saveBtn) {
      saveBtn.style.display = 'inline-flex';
      saveBtn.innerHTML = '<span>✏️</span><span>Đưa vào khung soạn</span>';
      saveBtn.onclick = () => {
        const val = ta ? ta.value.trim() : '';
        if (!val) { toast('Prompt không được để trống', 'err'); return; }
        const p = $('#p');
        if (p) {
          p.value = val;
          if (typeof Composer !== 'undefined' && Composer.onInput) Composer.onInput();
        }
        toast('Đã đưa prompt vào khung soạn thảo!');
        closeModal(box);
      };
    }
  }

  const copyBtn = $('#btn_copy_prompt_modal');
  if (copyBtn) {
    copyBtn.onclick = () => {
      const currentVal = ta ? ta.value : rawPrompt;
      copyText(currentVal, 'prompt video');
    };
  }

  const refSec = $('#promptrefsection');
  const refBox = $('#promptrefimages');
  const refCountEl = $('#prompt_modal_ref_count');
  const refFileInput = $('#prompt_modal_ref_file_input');

  const getJobImgs = () => {
    return (job.images && job.images.length) ? job.images : (job.card && job.card.images ? job.card.images : []);
  };

  const renderModalRefImages = () => {
    if (!refBox) return;
    const currentImgs = getJobImgs();
    if (refCountEl) refCountEl.textContent = `${currentImgs.length} ảnh`;
    if (!currentImgs.length) {
      refBox.innerHTML = '<span style="font-size:12px;color:var(--ink-3);padding:4px 6px">Chưa có ảnh tham chiếu cho prompt này. Bấm <b>"+ Thêm ảnh"</b> để đính kèm.</span>';
      return;
    }
    refBox.innerHTML = currentImgs.map((im, idx) => {
      const src = resolveRefImgSrc(im);
      return `
        <div class="prompt-modal-thumb" title="Ảnh #${idx + 1} (Bấm để xem to)">
          <img src="${src}" alt="" onclick="window.open('${src}')">
          ${(isDraft || isQueued) ? `<button type="button" class="prompt-modal-del" data-idx="${idx}" title="Xoá ảnh này">✕</button>` : ''}
        </div>
      `;
    }).join('');

    refBox.querySelectorAll('.prompt-modal-del').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = +btn.dataset.idx;
        const currentList = getJobImgs();
        currentList.splice(idx, 1);
        job.images = currentList;
        if (job.card) job.card.images = currentList;
        renderModalRefImages();
        const tr = document.getElementById('job-' + job.id);
        if (tr) updateRow(tr, job);
        if (typeof Composer !== 'undefined' && Composer.renderPromptPreview) {
          Composer.renderPromptPreview();
        }
      };
    });
  };

  if (refSec) {
    refSec.hidden = false;
    renderModalRefImages();
  }

  if (refFileInput) {
    refFileInput.onchange = async (e) => {
      const files = [...(e.target.files || [])].filter(f => f.type.startsWith('image/'));
      if (!files.length) return;
      toast(`Đang tải lên ${files.length} ảnh tham chiếu...`);
      try {
        const curList = getJobImgs();
        for (const file of files) {
          const dataUrl = await fileToDataUrl(file);
          const up = await api('POST', '/api/upload', { name: file.name || 'image.jpg', data_b64: dataUrl });
          curList.push({ id: up.id, name: file.name, preview: dataUrl });
        }
        job.images = curList;
        if (job.card) job.card.images = curList;
        renderModalRefImages();
        const tr = document.getElementById('job-' + job.id);
        if (tr) updateRow(tr, job);
        if (typeof Composer !== 'undefined' && Composer.renderPromptPreview) {
          Composer.renderPromptPreview();
        }
        toast(`Đã thêm ${files.length} ảnh tham chiếu vào prompt!`);
      } catch (err) {
        toast('Lỗi tải ảnh: ' + err.message, 'err');
      }
      refFileInput.value = '';
    };
  }

  const logSec = $('#promptlogsection');
  const logText = $('#promptlogtext');
  if (logSec && logText) {
    const logs = job.log || [];
    if (logs.length) {
      logSec.hidden = false;
      logText.textContent = logs.join('\n');
    } else {
      logSec.hidden = true;
      logText.textContent = '';
    }
  }

  const chips = [];
  if (job.model) chips.push(`Seedance ${job.model}`);
  if (job.duration) chips.push(`${job.duration} giây`);
  if (job.ratio) chips.push(job.ratio);
  if (job.assigned_name || job.assigned) chips.push(`Nick: ${job.assigned_name || job.assigned}`);
  const when = job.status === 'done' && job.finished ? job.finished : job.created;
  if (when) chips.push(`${fmtTime(when)} (${relTime(when)})`);
  if ($('#promptmeta')) {
    $('#promptmeta').innerHTML = chips.map(c => `<span class="chip">${esc(c)}</span>`).join('');
  }

  openModal(box);
};

/* Danh sách video dạng BẢNG (mỗi job một hàng) + hộp phát video + nút đổi Bảng/Lưới.
 * Dùng lại của jobs.js: Jobs.shown, Jobs.explain, Jobs.eta, jobActions (thẻ), Jobs.onAct (xử lý nút),
 * S.selected / Jobs.renderBulk (chọn nhiều). Cập nhật tại chỗ theo id, không vẽ lại cả bảng mỗi 2 giây. */

const JICON = {
  gallery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="M12 3l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 21l1.2-6.5L2.5 9.9 9.1 9z"/></svg>',
  edit_retry: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
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

Jobs.density = () => S.density || (S.density = lsGet('sv.density', 'compact'));
Jobs.setDensity = function (d) {
  if (d === S.density) return;
  S.density = d; lsSet('sv.density', d);
  paintDensitySel();
  applyDensityClass();
};
function paintDensitySel() {
  $$('#densitysel button').forEach(b => b.classList.toggle('on', b.dataset.density === Jobs.density()));
}
function applyDensityClass() {
  const box = $('#jobs');
  if (!box) return;
  box.classList.remove('density-compact', 'density-comfortable');
  box.classList.add('density-' + Jobs.density());
}
$('#densitysel')?.addEventListener('click', ev => {
  const b = ev.target.closest('button[data-density]'); if (!b) return;
  Jobs.setDensity(b.dataset.density);
});

// ------------------------------------------------------------ ô của một hàng
function statusCell(j) {
  if (j.status === 'draft') {
    const est = j.estSeconds ? (j.estSeconds >= 60 ? `~${(j.estSeconds/60).toFixed(1)}m` : `~${j.estSeconds}s`) : 'nhanh';
    return `<span class="badge draft">📝 Bản nháp</span><div class="sub dim">Sẵn sàng chạy (${est})</div>`;
  }
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
      <button type="button" class="btn-cancel-now" data-act="cancel" title="Dừng task tức thì (giải phóng luồng ngay)"><span class="cancel-icon">✕</span> Dừng</button></div>
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
    const isCopy = r.error_kind === 'copyright' || /for copyright protection|can(?:'|’)?t\s+show\s+you\s+the\s+generated\s+video|copyrighted\s+or\s+policy-violating|policy-violating\s+content|no\s+credits\s+were\s+used\s+for\s+this\s+video|vi phạm bản quyền/i.test(j.error || '');
    const isDaily = r.error_kind === 'daily_limit' || /daily limit|hết lượt trong ngày/i.test(j.error || '') || /daily limit|hết lượt trong ngày/i.test(hint);
    const isRate = r.error_kind === 'rate_limit' || /rate limit|quá tần suất|thao tác quá thường xuyên/i.test(j.error || '') || /giới hạn tần suất|gửi quá nhanh/i.test(hint);
    const isDuration = r.error_kind === 'duration_limit' || /chỉ nhận video \d+-\d+s/i.test(j.error || '') || /chỉ nhận video \d+-\d+s/i.test(hint);
    const isConfirm = r.error_kind === 'choice_required' || /đang chờ xác nhận|chọn phương án/i.test(j.error || '') || /đang chờ xác nhận|chọn phương án/i.test(hint);

    const badgeHtml = isCopy
      ? `<span class="badge bad" style="background:#dc2626;color:#fff;font-weight:700">⚠️ Vi phạm bản quyền</span>`
      : isDaily
      ? `<span class="badge bad" style="background:#d97706;color:#fff;font-weight:700">⏳ Hết lượt hôm nay</span>`
      : isRate
      ? `<span class="badge bad" style="background:#f59e0b;color:#1e293b;font-weight:700">⏱️ Quá tần suất</span>`
      : isDuration
      ? `<span class="badge bad" style="background:#8b5cf6;color:#fff;font-weight:700">📏 Giới hạn độ dài</span>`
      : isConfirm
      ? `<span class="badge bad" style="background:#3b82f6;color:#fff;font-weight:700">💬 Chờ xác nhận</span>`
      : `<span class="badge bad">${j.status === 'error' ? 'Không tạo được' : 'Gián đoạn'}</span>`;
    return `${badgeHtml}<div class="sub why" style="${isCopy ? 'color:#f87171' : ''}" title="${esc(j.error || '')}">${esc(hint)}</div>${credit}`;
  }
  return `<span class="badge">${esc(STATUS[j.status] || j.status)}</span>`;
}
function videoCell(j) {
  if (j.status === 'draft') return '<div class="thumb draft-ph" title="Kịch bản chờ chạy">Chờ chạy</div>';
  const r = j.result || {};
  if (j.kind !== 'generate') return '<span class="dim">—</span>';
  if (r.path) {
    const tall = !j.ratio || /^(9:16|3:4)$/.test(j.ratio);
    return `<button type="button" class="thumb ${tall ? 'tall' : 'wide'}" data-act="play" title="Phát video">
      <img src="${withToken(`/api/jobs/${j.id}/thumb`)}" alt="" loading="lazy" onerror="this.remove()"><span class="pl">${JICON.play}</span></button>`;
  }
  if (j.status === 'running') return `<div class="thumb tall ph"><div class="ring sm"></div></div>`;
  return '<span class="dim">—</span>';
}
function accountCell(j) {
  if (j.status === 'draft') return `<span class="chip">${esc(j.profile === 'auto' ? '⚡ Tự chia đều' : (j.profile_name || 'Tự động'))}</span>`;
  if (j.status === 'running' && j.assigned) return `<div class="sub dim" style="margin:0 0 3px">${j.kind === 'generate' ? 'đang tạo bằng' : 'đang chạy trên'}</div><span class="chip live" title="${esc(j.assigned_name || j.assigned)}"><b>${esc(j.assigned_name || j.assigned)}</b></span>`;
  if (j.assigned) return `<span class="chip">${esc(j.assigned_name || j.assigned)}</span>`;
  if (j.status === 'queued') return `<span class="chip">${j.profile === 'auto' ? 'tự chọn nick rảnh' : 'chờ ' + esc(j.profile_name)}</span>`;
  return `<span class="chip">${esc(j.profile_name || '')}</span>`;
}
function specCell(j) {
  if (j.kind !== 'generate' && j.status !== 'draft') return '<span class="dim">—</span>';
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
  return `<button type="button" class="file-chip" data-act="folder" title="Mở thư mục chứa: ${esc(r.path)}">
    <span class="file-chip-icon">📁</span>
    <span class="file-chip-name">${esc(name)}</span>
  </button>`;
}
function rowActions(j) {
  if (j.status === 'draft') {
    return `<button type="button" class="btn xs primary-ish" data-act="draft_run" title="Chạy riêng cảnh này" style="font-weight:700;padding:2px 7px;border-radius:4px">▶ Chạy</button>
            <button type="button" class="ico" data-act="draft_dup" title="Nhân bản cảnh này">${JICON.reuse || '📋'}</button>
            <button type="button" class="ico danger" data-act="draft_del" title="Xoá cảnh này">${JICON.trash || '🗑️'}</button>`;
  }
  const r = j.result || {}, a = [];
  const ico = (act, icon, title, cls = '') => a.push(`<button type="button" class="ico ${cls}" data-act="${act}" title="${esc(title)}">${JICON[icon]}</button>`);
  const targetProf = j.assigned || (j.tried && j.tried.length ? j.tried[j.tried.length - 1] : null) || (j.profile !== 'auto' ? j.profile : null) || (S.profiles && S.profiles.find(p => p.status === 'ready' || p.is_logged_in)?.id) || (S.profiles && S.profiles[0]?.id);
  const convUrl = (r && r.conversation_url) || j.conversation_url;
  if (j.kind === 'generate' && (targetProf || convUrl)) {
    const winTitle = convUrl ? 'Xem Dola: mở thẳng cuộc trò chuyện của task này' : 'Xem Dola: mở trang Dola của tài khoản này';
    ico('window', 'window', winTitle, 'hot');
  }
  if (j.status === 'queued') ico('cancel', 'cancel', 'Huỷ, bỏ khỏi hàng đợi');
  if (j.status === 'running') {
    ico('cancel', 'cancel', 'Dừng task tức thì (giải phóng luồng ngay)', 'danger hot');
  }
  if (r.path) {
    a.push(`<button type="button" class="ico hot" data-act="to-gallery" title="Xem và ghép trong Kho video">${JICON.gallery}</button>`);
    a.push(`<a class="ico" href="${withToken(`/api/jobs/${j.id}/video`)}" download="${esc(String(r.path).split(/[\\/]/).pop())}" title="Tải xuống">${JICON.down}</a>`);
    ico('folder', 'folder', 'Mở thư mục chứa file');
  }
  if (j.kind === 'generate' && j.status !== 'queued') {
    ico('reuse', 'reuse', 'Dùng lại: đưa prompt và cài đặt về khung soạn');
    ico('copy', 'copy', 'Chép prompt');
  }
  if (['error', 'interrupted'].includes(j.status) && j.error) ico('copyerr', 'bug', 'Chép lỗi + nhật ký để gửi hỗ trợ');
  if (!['queued', 'running'].includes(j.status)) {
    if (j.kind === 'generate' && j.status !== 'done' && !j.dry_run && (convUrl || targetProf)) {
      a.push(`<button type="button" class="btn sm btn-rescan-video ${r.recover_first ? 'primary-ish' : ''}" data-act="rescan_video" title="Quét lại trang Dola của task này: nếu có video sẽ tự động tải về và xóa logo ngay, không tốn credit"><span>🔍</span><span>Quét lại trang</span></button>`);
    }
    if (r.error_kind === 'duration_limit' && j.duration > 15) a.push(`<button type="button" class="btn sm primary-ish" data-act="retry15" title="Dola chỉ nhận 4–15 giây cho yêu cầu này: chạy lại đúng prompt với 15 giây">15 giây</button>`);
    a.push(`<button type="button" class="btn sm primary-ish" data-act="edit_retry" title="Sửa lại prompt, ảnh hoặc thời lượng rồi gửi lại" style="font-weight:600;display:inline-flex;align-items:center;gap:4px"><span>✏️</span><span>Sửa & gửi lại</span></button>`);
    ico('retry', 'retry', j.status === 'done' && !j.dry_run ? 'Chạy lại (gửi yêu cầu mới, trừ credit)' : 'Chạy lại');
    ico('delete', 'trash', 'Xoá khỏi danh sách (file vẫn còn)', 'danger');
  }
  return a.join('');
}

function refSlotsCell(j) {
  if (j.kind !== 'generate' && j.status !== 'draft') return '<span class="dim">—</span>';
  const imgs = getRowImages(j); if (!j.images || !j.images.length) j.images = imgs;
  const canEdit = j.status === 'draft' || j.status === 'queued';
  if (!canEdit && !imgs.length) return '<span class="dim">—</span>';

  const actAdd = j.status === 'draft' ? 'draft_add_img' : 'queued_add_img';
  const actDel = j.status === 'draft' ? 'draft_del_img' : 'queued_del_img';

  if (canEdit) {
    if (imgs.length === 0) {
      return `<div class="ref-slots-wrap">
        <button type="button" class="btn-add-ref-slot" data-act="${actAdd}" title="Bấm để chọn ảnh tham chiếu cho dòng này">
          <span style="font-size:13px;line-height:1;font-weight:700">+</span>
          <span>Thêm ảnh</span>
        </button>
      </div>`;
    }
    const slots = [];
    const showCount = Math.min(imgs.length, 3);
    for (let i = 0; i < showCount; i++) {
      const im = imgs[i];
      const src = resolveRefImgSrc(im);
      slots.push(`<div class="ref-thumb-slot" title="Ảnh #${i+1}: ${esc(im.name || '')} (Bấm xem to)">
        <img src="${src}" alt="" onclick="window.open('${src}')">
        <button type="button" class="ref-del-slot-btn" data-act="${actDel}" data-img-idx="${i}" title="Xoá ảnh này">✕</button>
      </div>`);
    }
    if (imgs.length < 4) {
      slots.push(`<button type="button" class="ref-thumb-slot empty" title="Thêm ảnh tiếp theo" data-act="${actAdd}">+</button>`);
    }
    if (imgs.length > 3) {
      const remain = imgs.length - 3;
      slots.push(`<div class="ref-thumb-slot more" title="Còn ${remain} ảnh khác" data-act="${actAdd}">+${remain}</div>`);
    }
    if (j.status === 'draft') {
      slots.push(`<button type="button" class="btn-copy-imgs-all" data-act="draft_copy_imgs_to_all" title="Áp dụng toàn bộ ảnh của cảnh này cho tất cả prompt khác">📋 Tất cả</button>`);
    }
    return `<div class="ref-slots-wrap">${slots.join('')}</div>`;
  } else {
    const slots = [];
    imgs.slice(0, 2).forEach((im, i) => {
      const src = resolveRefImgSrc(im);
      slots.push(`<div class="ref-thumb-slot readonly" title="Ảnh #${i+1} (Bấm xem to)"><img src="${src}" alt="" onclick="window.open('${src}')"></div>`);
    });
    if (imgs.length > 2) {
      const remain = imgs.length - 2;
      slots.push(`<div class="ref-thumb-slot more" title="Còn ${remain} ảnh khác">+${remain}</div>`);
    }
    return `<div class="ref-slots-wrap">${slots.join('')}</div>`;
  }
}

// ------------------------------------------------------------ hàng
function makeRow(j) {
  const tr = document.createElement('tr');
  tr.id = 'job-' + j.id;
  tr.innerHTML = `<td class="c-seq">
      <div style="display:flex;align-items:center;gap:6px">
        <input type="checkbox" class="pick" title="Chọn để thao tác hàng loạt" style="cursor:pointer">
        <span class="seq-num">#${j.seq}</span>
      </div>
    </td>
    <td class="c-status"></td>
    <td class="c-prompt"></td>
    <td class="c-slots"></td>
    <td class="c-acc"></td>
    <td class="c-video"></td>
    <td class="c-acts"><div class="acts"></div></td>`;
  tr.querySelector('.pick').addEventListener('change', ev => {
    if (ev.target.checked) S.selected.add(j.id); else S.selected.delete(j.id);
    Jobs.renderBulk();
    tr.classList.toggle('sel', ev.target.checked);
  });

  // Kéo thả file ảnh trực tiếp vào dòng prompt
  tr.addEventListener('dragover', ev => {
    ev.preventDefault();
    if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'copy';
    tr.classList.add('row-drag-over');
  });
  tr.addEventListener('dragleave', ev => {
    if (!tr.contains(ev.relatedTarget)) {
      tr.classList.remove('row-drag-over');
    }
  });
  tr.addEventListener('drop', async ev => {
    ev.preventDefault();
    tr.classList.remove('row-drag-over');
    const files = [...(ev.dataTransfer?.files || [])].filter(f =>
      f.type.startsWith('image/') || /\.(jpe?g|png|webp|bmp|gif|jfif)$/i.test(f.name)
    );
    if (!files.length) return;
    const cur = (S.draftBatch && S.draftBatch.find(d => d.id === j.id)) || j;
    if (cur.status === 'draft') {
      await Jobs.addImagesToDraft(cur, files);
    } else {
      toast('Chỉ có thể gắn ảnh tham chiếu cho bản nháp kịch bản', 'warn');
    }
  });

  tr.addEventListener('click', ev => {
    const b = ev.target.closest('[data-act]'); if (!b || !tr.contains(b)) return;
    const cur = (S.draftBatch && S.draftBatch.find(d => d.id === j.id)) || (S.jobs && S.jobs.find(x => x.id === j.id)) || j;
    if (b.dataset.act === 'copyerr') {
      Jobs.copySanitizedError(cur);
      return;
    }
    if (b.dataset.act === 'inline_edit') {
      Jobs.startInlinePromptEdit(tr, cur);
      return;
    }
    if (b.dataset.act === 'draft_copy_imgs_to_all') {
      Jobs.copyDraftImagesToAll(cur);
      return;
    }
    Jobs.onAct(ev, tr, cur);
  });
  return tr;
}
function setHtml(el, html) { if (el && el.innerHTML !== html) el.innerHTML = html; }

Jobs.onDraftPromptInput = function (j, val) {
  j.prompt = val;
  if (typeof Composer !== 'undefined') {
    const idx = (j.seq || 1) - 1;
    if (Composer.multiCards && Composer.multiCards[idx]) {
      Composer.multiCards[idx].prompt = val;
      if (typeof Composer.syncTextFromMultiCards === 'function') Composer.syncTextFromMultiCards();
    } else {
      const p = $('#p');
      if (p) {
        const lines = p.value.split(/\r?\n/);
        if (lines[idx] !== undefined) lines[idx] = val;
        p.value = lines.join('\n');
      }
    }
  }
};

function updateRow(tr, j) {
  tr.dataset.status = j.status;
  tr.dataset.kind = j.kind;
  tr.classList.toggle('sel', S.selected.has(j.id));
  const pickEl = tr.querySelector('.pick');
  if (pickEl) pickEl.checked = S.selected.has(j.id);

  setHtml(tr.querySelector('.c-status'), statusCell(j));

  // Prompt with Start/End image mini tags & inline edit
  const isQueued = j.status === 'queued';
  const label = (j.prompt != null && String(j.prompt).trim() !== '') ? j.prompt : (j.kind === 'generate' ? '' : `${KIND[j.kind] || j.kind || 'Tác vụ'} · ${j.profile_name || ''}`);
  const cleaned = cleanPrompt(label);

  const imgs = getRowImages(j); if (!j.images || !j.images.length) j.images = imgs;
  let imgBadge = '';
  if (imgs.length > 0) {
    const firstThumb = resolveRefImgSrc(imgs[0]);
    imgBadge = `<span class="prompt-ref-pill" data-act="view-prompt" title="${imgs.length} ảnh tham chiếu đã đính kèm cho prompt này (Bấm để xem/sửa)">${firstThumb ? `<img src="${firstThumb}" class="prompt-mini-thumb" alt="">` : ''}<span>🖼️ ${imgs.length}</span></span>`;
  }

  const cPrompt = tr.querySelector('.c-prompt');
  if (cPrompt && !cPrompt.querySelector('.inline-edit-input')) {
    const previewText = cleaned.length > 55 ? cleaned.slice(0, 52) + '...' : (cleaned || '(Prompt trống)');
    cPrompt.innerHTML = `<div class="prompt-cell-wrap" style="display:flex;align-items:center;justify-content:space-between;gap:6px;width:100%">
      <div style="display:flex;align-items:center;gap:6px;overflow:hidden;flex:1">
        ${imgBadge}
        <span class="prompt-text-preview" title="${esc(cleaned || '(Prompt trống)')}">${esc(previewText)}</span>
      </div>
      <button type="button" class="btn quiet sm btn-prompt-eye" data-act="view-prompt" title="Bấm xem và sửa prompt" style="padding:2px 6px;cursor:pointer;color:#38bdf8;flex-shrink:0">${JICON_EYE}</button>
    </div>`;

    const previewEl = cPrompt.querySelector('.prompt-text-preview');
    if (previewEl) {
      previewEl.onclick = () => {
        typeof Jobs.openPrompt === 'function' ? Jobs.openPrompt(j) : Jobs.openDetail(j);
      };
    }
  }

  setHtml(tr.querySelector('.c-slots'), refSlotsCell(j));
  setHtml(tr.querySelector('.c-acc'), accountCell(j));
  setHtml(tr.querySelector('.c-video'), videoCell(j));
  setHtml(tr.querySelector('.acts'), rowActions(j));
}
Jobs.renderTable = function (box, shown) {
  paintViewSel();
  paintDensitySel();
  applyDensityClass();
  let tbody = box.querySelector('.jtbl tbody');
  if (!box.classList.contains('table') || !tbody) {
    box.className = 'table';
    box.innerHTML = `<div class="tblwrap jwrap"><table class="tbl jtbl tbl-queue"><thead><tr>
      <th class="c-seq" style="width:58px">
        <div style="display:flex;align-items:center;gap:4px">
          <input type="checkbox" id="pick_all_jobs" title="Chọn tất cả" style="cursor:pointer">
          <span>STT</span>
        </div>
      </th>
      <th class="c-status" style="width:135px">Trạng thái</th>
      <th class="c-prompt" style="min-width:180px">Prompt</th>
      <th class="c-slots" style="width:165px">Ảnh tham chiếu</th>
      <th class="c-acc" style="width:130px">Tài khoản chạy</th>
      <th class="c-video" style="width:110px">Video kết quả</th>
      <th class="c-acts" style="width:170px">Thao tác</th>
    </tr></thead><tbody></tbody></table></div>`;
    tbody = box.querySelector('.jtbl tbody');

    const pickAll = box.querySelector('#pick_all_jobs');
    if (pickAll) {
      pickAll.onchange = () => {
        const isChecked = pickAll.checked;
        (shown || []).forEach(j => {
          if (isChecked) S.selected.add(j.id);
          else S.selected.delete(j.id);
        });
        Jobs.renderBulk();
        box.querySelectorAll('.pick').forEach(cb => cb.checked = isChecked);
      };
    }
  }
  applyDensityClass();
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
Jobs.play = function (job) {
  const r = job.result || {};
  if (!r.path) return toast('Job này chưa có video', 'err');
  const box = $('#playbox'), v = $('#pbvideo');
  $('#pbtitle').textContent = `#${job.seq} · ${job.assigned_name || ''}`;
  $('#pbprompt').textContent = job.prompt;
  $('#pbmeta').innerHTML = `<span class="chip">${esc(job.model)}, ${job.duration} giây${job.ratio ? ', ' + esc(job.ratio) : ''}</span>${r.credits_left != null ? `<span class="chip">còn ${r.credits_left} credit</span>` : ''}<span class="chip">${esc(String(r.path).split(/[\\/]/).pop())}</span>`;
  $('#pbacts').innerHTML = `<button type="button" class="btn sm primary" data-act="to-gallery">🎞️ Xem trong Kho video</button>
    <a class="btn sm" href="${withToken(`/api/jobs/${job.id}/video`)}" download="${esc(String(r.path).split(/[\\/]/).pop())}">Tải xuống</a>
    <button type="button" class="btn sm quiet" data-act="folder">Thư mục</button>
    <button type="button" class="btn sm quiet" data-act="reuse">Dùng lại</button>
    ${r.playable ? '<button type="button" class="btn sm quiet" data-act="tolib" title="Chụp khung hình làm ảnh mẫu nhân vật">Lưu làm nhân vật</button>' : ''}`;
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
