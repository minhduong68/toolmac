/* Kho Video và Auto Merge Studio - Kéo thả & Cắt ghép phân cảnh Pro */
'use strict';

const Gallery = {
  videos: [],
  selected: [], // array of filenames in merge order
  trims: {}, // { [filename]: { start: number, end: number } }
  loading: false,
  draggedChip: null,
  draggedCard: null,
  activeTrimVideo: null,

  init() {
    $('#gal-refresh')?.addEventListener('click', () => Gallery.load());
    $('#gal-delete-all')?.addEventListener('click', () => Gallery.deleteAll());
    $('#gal-delete-selected')?.addEventListener('click', () => Gallery.deleteSelected());
    $('#gal-delogo-selected')?.addEventListener('click', () => Gallery.delogoSelected());
    $('#gal-delogo-close-btn')?.addEventListener('click', () => Gallery.closeDelogoModal());
    $('#btn-delogo-done')?.addEventListener('click', () => Gallery.closeDelogoModal());
    $('#gal-search')?.addEventListener('input', () => Gallery.render());
    $('#gal-sort')?.addEventListener('change', () => Gallery.render());
    $('#gal-open-folder')?.addEventListener('click', async () => {
      try {
        await api('POST', '/api/gallery/open-folder');
      } catch (e) {
        toast('Không mở được thư mục: ' + e.message, 'err');
      }
    });

    $('#merge-select-all')?.addEventListener('click', () => {
      Gallery.selected = Gallery.getFilteredVideos().map(v => v.name);
      Gallery.render();
      Gallery.renderMergeTray();
    });

    $('#merge-clear-sel')?.addEventListener('click', () => {
      Gallery.selected = [];
      Gallery.trims = {};
      Gallery.render();
      Gallery.renderMergeTray();
    });

    $('#btn-start-merge')?.addEventListener('click', () => Gallery.startMerge());

    // Modal player listeners
    $('#gal-modal-close-btn')?.addEventListener('click', () => Gallery.closePlayer());
    $('#gal-modal-close-bg')?.addEventListener('click', () => Gallery.closePlayer());

    // Trimmer modal listeners
    $('#gal-trim-close-btn')?.addEventListener('click', () => Gallery.closeTrimmer());
    $('#gal-trim-close-bg')?.addEventListener('click', () => Gallery.closeTrimmer());
    $('#btn-trim-reset')?.addEventListener('click', () => Gallery.resetTrim());
    $('#btn-trim-apply')?.addEventListener('click', () => Gallery.saveTrim());

    // Setup dropzone on Timeline Track
    const tray = $('#merge-tray');
    if (tray) {
      tray.addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        tray.classList.add('drag-target-active');
      });
      tray.addEventListener('dragleave', e => {
        if (!tray.contains(e.relatedTarget)) {
          tray.classList.remove('drag-target-active');
        }
      });
      tray.addEventListener('drop', e => {
        e.preventDefault();
        tray.classList.remove('drag-target-active');
        const cardName = e.dataTransfer.getData('text/plain') || Gallery.draggedCard;
        if (cardName && !Gallery.selected.includes(cardName)) {
          Gallery.selected.push(cardName);
          Gallery.render();
          Gallery.renderMergeTray();
          toast(`Đã thêm "${cardName}" vào Timeline ghép`);
        }
        Gallery.draggedCard = null;
      });
    }

    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (!$('#gal-trim-modal')?.hidden) Gallery.closeTrimmer();
        else if (!$('#gal-player-modal')?.hidden) Gallery.closePlayer();
      }
    });
  },

  async load() {
    Gallery.loading = true;
    const grid = $('#gallery-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="skeleton-card"><div class="skeleton-thumb"></div><div class="skeleton-body"><div class="skeleton-line" style="width:75%"></div><div class="skeleton-line" style="width:45%"></div></div></div>
        <div class="skeleton-card"><div class="skeleton-thumb"></div><div class="skeleton-body"><div class="skeleton-line" style="width:80%"></div><div class="skeleton-line" style="width:50%"></div></div></div>
        <div class="skeleton-card"><div class="skeleton-thumb"></div><div class="skeleton-body"><div class="skeleton-line" style="width:70%"></div><div class="skeleton-line" style="width:40%"></div></div></div>
        <div class="skeleton-card"><div class="skeleton-thumb"></div><div class="skeleton-body"><div class="skeleton-line" style="width:85%"></div><div class="skeleton-line" style="width:60%"></div></div></div>
      `;
    }
    try {
      const res = await api('GET', '/api/gallery');
      Gallery.videos = res.videos || [];
      // Clean selected list of any removed videos
      Gallery.selected = Gallery.selected.filter(name => Gallery.videos.some(v => v.name === name));
      if ($('#n-gallery')) $('#n-gallery').textContent = Gallery.videos.length ? Gallery.videos.length : '';
      Gallery.render();
      Gallery.renderMergeTray();
    } catch (err) {
      if (grid) grid.innerHTML = `<div class="gal-error">Lỗi nạp video: ${esc(err.message)}</div>`;
    } finally {
      Gallery.loading = false;
    }
  },

  getFilteredVideos() {
    const q = ($('#gal-search')?.value || '').trim().toLowerCase();
    const sort = $('#gal-sort')?.value || 'new';
    let list = [...Gallery.videos];

    if (q) {
      list = list.filter(v => v.name.toLowerCase().includes(q) || (v.prompt && v.prompt.toLowerCase().includes(q)));
    }

    if (sort === 'new') list.sort((a, b) => b.mtime - a.mtime);
    else if (sort === 'old') list.sort((a, b) => a.mtime - b.mtime);
    else if (sort === 'size') list.sort((a, b) => b.size - a.size);
    else if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  },

  toggleSelect(name) {
    const idx = Gallery.selected.indexOf(name);
    if (idx >= 0) {
      Gallery.selected.splice(idx, 1);
      delete Gallery.trims[name];
    } else {
      Gallery.selected.push(name);
    }
    Gallery.render();
    Gallery.renderMergeTray();
  },

  moveOrder(name, delta) {
    const idx = Gallery.selected.indexOf(name);
    if (idx < 0) return;
    const newIdx = idx + delta;
    if (newIdx < 0 || newIdx >= Gallery.selected.length) return;
    const item = Gallery.selected.splice(idx, 1)[0];
    Gallery.selected.splice(newIdx, 0, item);
    Gallery.renderMergeTray();
  },

  removeOrder(name) {
    const idx = Gallery.selected.indexOf(name);
    if (idx >= 0) {
      Gallery.selected.splice(idx, 1);
      delete Gallery.trims[name];
      Gallery.render();
      Gallery.renderMergeTray();
    }
  },

  calculateTotalDuration() {
    let totalSec = 0;
    for (const name of Gallery.selected) {
      const trim = Gallery.trims[name];
      if (trim && trim.end > trim.start) {
        totalSec += (trim.end - trim.start);
      } else {
        const v = Gallery.videos.find(x => x.name === name);
        totalSec += (v && v.duration ? v.duration : 30);
      }
    }
    return Math.round(totalSec * 10) / 10;
  },

  // ---------------- Drag and Drop Handlers for Chips ----------------
  handleChipDragStart(e, name) {
    Gallery.draggedChip = name;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', name);
    setTimeout(() => {
      const el = $(`#merge-tray .merge-chip[data-name="${CSS.escape(name)}"]`);
      if (el) el.classList.add('dragging');
    }, 10);
  },

  handleChipDragOver(e, targetName) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!Gallery.draggedChip || Gallery.draggedChip === targetName) return;
    const el = $(`#merge-tray .merge-chip[data-name="${CSS.escape(targetName)}"]`);
    if (el) el.classList.add('drag-over');
  },

  handleChipDragLeave(e, targetName) {
    const el = $(`#merge-tray .merge-chip[data-name="${CSS.escape(targetName)}"]`);
    if (el) el.classList.remove('drag-over');
  },

  handleChipDrop(e, targetName) {
    e.preventDefault();
    const sourceName = Gallery.draggedChip;
    if (!sourceName || sourceName === targetName) return;
    const fromIdx = Gallery.selected.indexOf(sourceName);
    const toIdx = Gallery.selected.indexOf(targetName);
    if (fromIdx >= 0 && toIdx >= 0) {
      const item = Gallery.selected.splice(fromIdx, 1)[0];
      Gallery.selected.splice(toIdx, 0, item);
      Gallery.renderMergeTray();
    }
    Gallery.draggedChip = null;
  },

  handleChipDragEnd() {
    Gallery.draggedChip = null;
    $$('#merge-tray .merge-chip').forEach(c => c.classList.remove('dragging', 'drag-over'));
  },

  handleCardDragStart(e, name) {
    Gallery.draggedCard = name;
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', name);
  },

  // ---------------- Trimmer Handlers ----------------
  openTrimmer(name) {
    const modal = $('#gal-trim-modal');
    const vEl = $('#gal-trim-video');
    const titleEl = $('#gal-trim-title');
    const inStart = $('#trim-start');
    const inEnd = $('#trim-end');
    const badge = $('#trim-badge-calc');
    if (!modal || !vEl) return;

    Gallery.activeTrimVideo = name;
    if (titleEl) titleEl.textContent = `✂️ Cắt phân cảnh: ${name}`;

    const existing = Gallery.trims[name];
    const url = typeof withToken === 'function' ? withToken(`/api/gallery/video?file=${encodeURIComponent(name)}`) : `/api/gallery/video?file=${encodeURIComponent(name)}`;

    vEl.src = url;
    modal.hidden = false;

    const updateCalc = () => {
      const s = Math.max(0, parseFloat(inStart.value) || 0);
      const e = Math.max(s + 0.5, parseFloat(inEnd.value) || (vEl.duration || 30));
      const dur = (e - s).toFixed(1);
      if (badge) badge.textContent = `${dur}s`;
    };

    vEl.onloadedmetadata = () => {
      const maxDur = vEl.duration || 30;
      inStart.max = Math.max(0, maxDur - 0.5);
      inEnd.max = maxDur;
      if (existing) {
        inStart.value = existing.start;
        inEnd.value = Math.min(maxDur, existing.end);
      } else {
        inStart.value = 0;
        inEnd.value = Math.round(maxDur * 10) / 10;
      }
      updateCalc();
    };

    inStart.oninput = () => {
      vEl.currentTime = Math.max(0, parseFloat(inStart.value) || 0);
      updateCalc();
    };
    inEnd.oninput = () => {
      vEl.currentTime = Math.max(0, parseFloat(inEnd.value) || 0);
      updateCalc();
    };
  },

  closeTrimmer() {
    const modal = $('#gal-trim-modal');
    const vEl = $('#gal-trim-video');
    if (vEl) {
      vEl.pause();
      vEl.removeAttribute('src');
      try { vEl.load(); } catch (_) {}
    }
    if (modal) modal.hidden = true;
    Gallery.activeTrimVideo = null;
  },

  saveTrim() {
    const name = Gallery.activeTrimVideo;
    if (!name) return;
    const inStart = $('#trim-start');
    const inEnd = $('#trim-end');
    const vEl = $('#gal-trim-video');
    const maxDur = vEl?.duration || 30;
    const s = Math.max(0, parseFloat(inStart?.value) || 0);
    const e = Math.min(maxDur, parseFloat(inEnd?.value) || maxDur);

    if (s >= e) {
      toast('Thời điểm kết thúc phải lớn hơn thời điểm bắt đầu', 'err');
      return;
    }
    Gallery.trims[name] = { start: Math.round(s * 10) / 10, end: Math.round(e * 10) / 10 };
    toast(`Đã lưu đoạn cắt: ${Gallery.trims[name].start}s – ${Gallery.trims[name].end}s`);
    Gallery.closeTrimmer();
    Gallery.renderMergeTray();
  },

  resetTrim() {
    const name = Gallery.activeTrimVideo;
    if (!name) return;
    delete Gallery.trims[name];
    const vEl = $('#gal-trim-video');
    const maxDur = vEl?.duration || 30;
    if ($('#trim-start')) $('#trim-start').value = 0;
    if ($('#trim-end')) $('#trim-end').value = Math.round(maxDur * 10) / 10;
    if ($('#trim-badge-calc')) $('#trim-badge-calc').textContent = `${(Math.round(maxDur * 10) / 10)}s`;
    toast('Đã khôi phục video về thời lượng gốc');
    Gallery.closeTrimmer();
    Gallery.renderMergeTray();
  },

  renderMergeTray() {
    const tray = $('#merge-tray');
    const cntEl = $('#merge-selected-count');
    const btnMerge = $('#btn-start-merge');
    if (cntEl) cntEl.textContent = `Đã chọn: ${Gallery.selected.length} phân cảnh`;
    const btnDelSel = $('#gal-delete-selected');
    if (btnDelSel) {
      btnDelSel.style.display = Gallery.selected.length ? 'inline-flex' : 'none';
      btnDelSel.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Xóa đã chọn (${Gallery.selected.length})`;
    }
    const btnDelogo = $('#gal-delogo-selected');
    const txtDelogo = $('#gal-delogo-btn-text');
    if (btnDelogo) {
      btnDelogo.style.display = Gallery.selected.length ? 'inline-flex' : 'none';
      if (txtDelogo) {
        txtDelogo.textContent = `Xóa logo Dola AI (${Gallery.selected.length})`;
      }
    }

    if (btnMerge) {
      btnMerge.disabled = Gallery.selected.length < 2;
      btnMerge.title = Gallery.selected.length < 2 ? 'Cần chọn ít nhất 2 video để ghép' : `Ghép ${Gallery.selected.length} video thành 1 video hoàn chỉnh`;
    }

    const totalSec = Gallery.calculateTotalDuration();
    const durBadge = $('#timeline-duration-badge');
    if (durBadge) {
      const min = (totalSec / 60).toFixed(1);
      durBadge.textContent = `⏱️ Tổng: ${totalSec}s (~${min} phút · ${Gallery.selected.length} phân cảnh)`;
    }

    if (!tray) return;

    if (!Gallery.selected.length) {
      tray.innerHTML = '<span class="merge-tray-empty">Chưa chọn video nào. Hãy tích chọn video bên dưới hoặc kéo thả trực tiếp vào Timeline này để bắt đầu dựng ghép.</span>';
      return;
    }

    tray.innerHTML = Gallery.selected.map((name, i) => {
      const isFirst = i === 0;
      const isLast = i === Gallery.selected.length - 1;
      const thumbUrl = typeof withToken === "function" ? withToken(`/api/gallery/thumb?file=${encodeURIComponent(name)}`) : `/api/gallery/thumb?file=${encodeURIComponent(name)}`;
      const trim = Gallery.trims[name];
      const trimBadge = trim
        ? `<button type="button" class="chip-trim-btn active" onclick="Gallery.openTrimmer('${esc(name)}')" title="Bấm để sửa đoạn cắt">✂️ ${trim.start}s–${trim.end}s (${(trim.end - trim.start).toFixed(1)}s)</button>`
        : `<button type="button" class="chip-trim-btn" onclick="Gallery.openTrimmer('${esc(name)}')" title="Bấm để cắt phân cảnh này">✂️ Cắt</button>`;

      return `
        <div class="merge-chip" draggable="true" data-name="${esc(name)}"
          ondragstart="Gallery.handleChipDragStart(event, '${esc(name)}')"
          ondragover="Gallery.handleChipDragOver(event, '${esc(name)}')"
          ondragleave="Gallery.handleChipDragLeave(event, '${esc(name)}')"
          ondrop="Gallery.handleChipDrop(event, '${esc(name)}')"
          ondragend="Gallery.handleChipDragEnd()">
          <span class="chip-drag-handle" title="Kéo thả để đổi thứ tự">⋮⋮</span>
          <span class="chip-num">#${i + 1}</span>
          <img class="chip-thumb" src="${thumbUrl}" onerror="this.src='/assets/icon.png'">
          <div class="chip-info">
            <span class="chip-name" title="${esc(name)}">${esc(name.length > 20 ? name.slice(0, 18) + '…' : name)}</span>
            ${trimBadge}
          </div>
          <div class="chip-arrows">
            <button type="button" class="btn-arrow" ${isFirst ? 'disabled' : ''} onclick="Gallery.moveOrder('${esc(name)}', -1)" title="Chuyển lên trước">◀</button>
            <button type="button" class="btn-arrow" ${isLast ? 'disabled' : ''} onclick="Gallery.moveOrder('${esc(name)}', 1)" title="Chuyển xuống sau">▶</button>
          </div>
          <button type="button" class="chip-del" onclick="Gallery.removeOrder('${esc(name)}')" title="Bỏ video này khỏi timeline">✕</button>
        </div>
      `;
    }).join('');
  },

  render() {
    const grid = $('#gallery-grid');
    const totalBadge = $('#gal-total-badge');
    const filtered = Gallery.getFilteredVideos();

    if (totalBadge) totalBadge.textContent = `${Gallery.videos.length} video`;
    if (!grid) return;

    if (!filtered.length) {
      grid.innerHTML = `
        <div class="gal-empty">
          <span class="gal-empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--pro-text-muted);opacity:0.6;"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
          </span>
          <h4>Kho video trống</h4>
          <p>Các video tạo xong sẽ tự động lưu và hiển thị tại đây.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(v => {
      const isSel = Gallery.selected.includes(v.name);
      const thumbUrl = typeof withToken === "function" ? withToken(`/api/gallery/thumb?file=${encodeURIComponent(v.name)}`) : `/api/gallery/thumb?file=${encodeURIComponent(v.name)}`;
      const videoUrl = typeof withToken === "function" ? withToken(`/api/gallery/video?file=${encodeURIComponent(v.name)}`) : `/api/gallery/video?file=${encodeURIComponent(v.name)}`;
      const dlUrl = typeof withToken === "function" ? withToken(`/api/gallery/video?file=${encodeURIComponent(v.name)}&dl=1`) : `/api/gallery/video?file=${encodeURIComponent(v.name)}&dl=1`;
      const sizeMb = (v.size / (1024 * 1024)).toFixed(1);
      const dateStr = new Date(v.mtime).toLocaleString('vi-VN', {
        month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
      });
      const durStr = v.duration ? `${Math.round(v.duration)}s` : '';

      return `
        <div class="gal-card ${isSel ? 'selected' : ''}" draggable="true" data-name="${esc(v.name)}"
          ondragstart="Gallery.handleCardDragStart(event, '${esc(v.name)}')">
          <div class="gal-card-thumb-wrap">
            <img class="gal-card-thumb" src="${thumbUrl}" alt="" loading="lazy" onerror="this.src='/assets/icon.png'">
            <div class="gal-play-overlay" onclick="Gallery.playVideo('${esc(v.name)}', '${videoUrl}')" title="Phát video">
              <div class="play-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
              </div>
            </div>
            <label class="gal-chk-label" onclick="event.stopPropagation()">
              <input type="checkbox" class="gal-chk" ${isSel ? 'checked' : ''} onchange="Gallery.toggleSelect('${esc(v.name)}')">
            </label>
            <div class="gal-badges">
              ${durStr ? `<span class="gal-badge dur">${durStr}</span>` : ''}
              <span class="gal-badge size">${sizeMb} MB</span>
            </div>
          </div>
          <div class="gal-card-body">
            <div class="gal-card-name" title="${esc(v.name)}">${esc(v.name)}</div>
            ${v.prompt ? `<div class="gal-card-prompt" title="${esc(v.prompt)}">${esc(v.prompt)}</div>` : ''}
            <div class="gal-card-meta">
              <span style="display:inline-flex;align-items:center;gap:4px">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                ${dateStr}
              </span>
              ${v.model ? `<span class="gal-model">${esc(v.model)}</span>` : ''}
            </div>
            <div class="gal-card-actions">
              <button type="button" class="btn sm" onclick="Gallery.playVideo('${esc(v.name)}', '${videoUrl}')" title="Phát video" style="flex:1;display:inline-flex;align-items:center;justify-content:center;gap:4px">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
                <span>Phát</span>
              </button>
              <button type="button" class="btn sm quiet btn-card-delogo" onclick="Gallery.delogoVideo('${esc(v.name)}')" title="Xóa logo Dola AI cho video này" style="flex:1.2;display:inline-flex;align-items:center;justify-content:center;gap:4px">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
                <span>Xóa logo</span>
              </button>
              <a class="btn sm quiet" href="${dlUrl}" download="${esc(v.name)}" title="Tải về máy" style="width:28px;padding:0;display:inline-flex;align-items:center;justify-content:center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </a>
              <button type="button" class="btn sm quiet danger" onclick="Gallery.deleteVideo('${esc(v.name)}')" title="Xóa video này" style="width:28px;padding:0;display:inline-flex;align-items:center;justify-content:center">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  playVideo(name, customUrl) {
    const modal = $('#gal-player-modal');
    const vEl = $('#gal-modal-video');
    const titleEl = $('#gal-modal-title');
    const dl = $('#gal-modal-download');
    if (!modal || !vEl) return;
    if (titleEl) titleEl.textContent = name;
    const url = customUrl || (typeof withToken === 'function' ? withToken(`/api/gallery/video?file=${encodeURIComponent(name)}`) : `/api/gallery/video?file=${encodeURIComponent(name)}`);
    const dlUrl = typeof withToken === 'function' ? withToken(`/api/gallery/video?file=${encodeURIComponent(name)}&dl=1`) : (url + (url.includes('?') ? '&' : '?') + 'dl=1');
    if (dl) { dl.href = dlUrl; dl.download = name; }
    vEl.src = url;
    modal.hidden = false;
    vEl.load();
    vEl.play().catch(() => {});
  },

  closePlayer() {
    const modal = $('#gal-player-modal');
    const vEl = $('#gal-modal-video');
    if (vEl) {
      vEl.pause();
      vEl.removeAttribute('src');
      try { vEl.load(); } catch (_) {}
    }
    if (modal) modal.hidden = true;
  },

  async deleteAll() {
    if (!Gallery.videos || !Gallery.videos.length) {
      toast('Kho video hiện đang trống', 'info');
      return;
    }
    const count = Gallery.videos.length;
    if (!confirm(`Bạn có chắc chắn muốn xóa TOÀN BỘ ${count} video trong kho không?\nThao tác này sẽ xóa vĩnh viễn các file video khỏi máy tính!`)) {
      return;
    }
    try {
      await api('POST', '/api/gallery/delete', { all: true });
      Gallery.selected = [];
      Gallery.trims = {};
      toast(`Đã xóa sạch toàn bộ ${count} video trong kho!`);
      await Gallery.load();
    } catch (err) {
      toast('Lỗi xóa video: ' + err.message, 'err');
    }
  },

  async deleteSelected() {
    if (!Gallery.selected.length) {
      toast('Chưa chọn video nào để xóa', 'info');
      return;
    }
    const count = Gallery.selected.length;
    if (!confirm(`Bạn có chắc muốn xóa ${count} video đã chọn khỏi máy tính không?`)) {
      return;
    }
    try {
      await api('POST', '/api/gallery/delete', { filenames: Gallery.selected });
      toast(`Đã xóa ${count} video đã chọn thành công!`);
      Gallery.selected = [];
      Gallery.trims = {};
      await Gallery.load();
    } catch (err) {
      toast('Lỗi xóa video: ' + err.message, 'err');
    }
  },

  async deleteVideo(name) {
    if (!confirm(`Bạn có chắc chắn muốn xóa video "${name}" không?`)) return;
    try {
      await api('POST', '/api/gallery/delete', { filename: name });
      toast('Đã xóa video: ' + name);
      Gallery.removeOrder(name);
      await Gallery.load();
    } catch (err) {
      toast('Lỗi xóa video: ' + err.message, 'err');
    }
  },

  openDelogoModal(totalCount = 1) {
    const modal = $('#gal-delogo-modal');
    if (!modal) return;
    const spin = $('.delogo-spinner');
    if (spin) spin.style.display = 'block';
    const ico = $('.delogo-ico');
    if (ico) ico.textContent = '✨';
    const closeBtn = $('#gal-delogo-close-btn');
    if (closeBtn) closeBtn.style.display = 'none';
    const foot = $('#gal-delogo-foot');
    if (foot) foot.style.display = 'none';
    const pBar = $('#delogo-progress-bar');
    if (pBar) pBar.style.width = '15%';
    const pct = $('#delogo-pct-text');
    if (pct) pct.textContent = '15%';
    const cnt = $('#delogo-count-text');
    if (cnt) cnt.textContent = `0 / ${totalCount} video`;
    const curStatus = $('#delogo-current-status');
    if (curStatus) curStatus.textContent = 'Đang khởi tạo thuật toán FFmpeg...';
    const curFile = $('#delogo-current-file');
    if (curFile) curFile.textContent = 'Đang phân tích tọa độ watermark và bóc tách...';
    modal.hidden = false;
  },

  closeDelogoModal() {
    const modal = $('#gal-delogo-modal');
    if (modal) modal.hidden = true;
  },

  async delogoSelected() {
    if (!Gallery.selected.length) {
      toast('Chưa chọn video nào để xóa logo', 'info');
      return;
    }
    const count = Gallery.selected.length;
    if (!confirm(`Bạn có chắc muốn xóa logo Dola AI cho ${count} video đã chọn không?\nFFmpeg sẽ tự động nhận diện và bóc tách watermark cho từng video.`)) {
      return;
    }
    Gallery.openDelogoModal(count);
    try {
      Gallery.closePlayer();
      Gallery.closeTrimmer();

      const filenames = [...Gallery.selected];
      const curStatus = $('#delogo-current-status');
      if (curStatus) curStatus.textContent = `Đang xóa logo Dola AI cho ${count} video...`;
      const curFile = $('#delogo-current-file');
      if (curFile) curFile.textContent = `Đang xử lý ${count} video bằng FFmpeg delogo... Vui lòng không tắt app`;
      const pBar = $('#delogo-progress-bar');
      if (pBar) pBar.style.width = '40%';
      const pct = $('#delogo-pct-text');
      if (pct) pct.textContent = '40%';

      const res = await api('POST', '/api/gallery/delogo', { filenames });

      if (pBar) pBar.style.width = '100%';
      if (pct) pct.textContent = '100%';
      const cnt = $('#delogo-count-text');
      if (cnt) cnt.textContent = `${res.processed || count} / ${count} video`;
      if (curStatus) curStatus.textContent = '🎉 Hoàn tất xóa logo Dola AI!';
      if (curFile) curFile.textContent = `Đã xóa logo thành công cho ${res.processed || count} video chất lượng cao!`;
      const spin = $('.delogo-spinner');
      if (spin) spin.style.display = 'none';
      const ico = $('.delogo-ico');
      if (ico) ico.textContent = '✅';
      const closeBtn = $('#gal-delogo-close-btn');
      if (closeBtn) closeBtn.style.display = 'inline-flex';
      const foot = $('#gal-delogo-foot');
      if (foot) foot.style.display = 'flex';

      toast(`🎉 Đã xóa sạch logo Dola AI cho ${res.processed || count} video!`);
      await Gallery.load();
    } catch (err) {
      const curStatus = $('#delogo-current-status');
      if (curStatus) curStatus.textContent = '❌ Lỗi xóa logo: ' + err.message;
      const curFile = $('#delogo-current-file');
      if (curFile) curFile.textContent = 'Vui lòng kiểm tra lại file hoặc thử lại sau.';
      const spin = $('.delogo-spinner');
      if (spin) spin.style.display = 'none';
      const ico = $('.delogo-ico');
      if (ico) ico.textContent = '⚠️';
      const closeBtn = $('#gal-delogo-close-btn');
      if (closeBtn) closeBtn.style.display = 'inline-flex';
      const foot = $('#gal-delogo-foot');
      if (foot) foot.style.display = 'flex';
      toast('Lỗi xóa logo: ' + err.message, 'err');
    }
  },

  async delogoVideo(name) {
    if (!confirm(`Bạn có muốn xóa logo Dola AI cho video "${name}" không?\nFFmpeg sẽ tự động bóc tách watermark và giữ chất lượng chuẩn gốc.`)) {
      return;
    }
    Gallery.openDelogoModal(1);
    try {
      Gallery.closePlayer();
      Gallery.closeTrimmer();

      const curStatus = $('#delogo-current-status');
      if (curStatus) curStatus.textContent = `Đang xóa logo Dola AI...`;
      const curFile = $('#delogo-current-file');
      if (curFile) curFile.textContent = name;
      const pBar = $('#delogo-progress-bar');
      if (pBar) pBar.style.width = '50%';
      const pct = $('#delogo-pct-text');
      if (pct) pct.textContent = '50%';
      const cnt = $('#delogo-count-text');
      if (cnt) cnt.textContent = `1 / 1 video`;

      const res = await api('POST', '/api/gallery/delogo', { filename: name });

      if (pBar) pBar.style.width = '100%';
      if (pct) pct.textContent = '100%';
      if (curStatus) curStatus.textContent = '🎉 Đã xóa logo Dola AI thành công!';
      if (curFile) curFile.textContent = `Video sạch logo và sẵn sàng sử dụng: ${name}`;
      const spin = $('.delogo-spinner');
      if (spin) spin.style.display = 'none';
      const ico = $('.delogo-ico');
      if (ico) ico.textContent = '✅';
      const closeBtn = $('#gal-delogo-close-btn');
      if (closeBtn) closeBtn.style.display = 'inline-flex';
      const foot = $('#gal-delogo-foot');
      if (foot) foot.style.display = 'flex';

      toast(`🎉 Đã xóa logo video: ${name}`);
      await Gallery.load();
    } catch (err) {
      const curStatus = $('#delogo-current-status');
      if (curStatus) curStatus.textContent = '❌ Lỗi: ' + err.message;
      const spin = $('.delogo-spinner');
      if (spin) spin.style.display = 'none';
      const ico = $('.delogo-ico');
      if (ico) ico.textContent = '⚠️';
      const closeBtn = $('#gal-delogo-close-btn');
      if (closeBtn) closeBtn.style.display = 'inline-flex';
      const foot = $('#gal-delogo-foot');
      if (foot) foot.style.display = 'flex';
      toast('Lỗi xóa logo: ' + err.message, 'err');
    }
  },

  async startMerge() {
    if (Gallery.selected.length < 2) {
      toast('Cần chọn ít nhất 2 video để ghép', 'err');
      return;
    }
    const btn = $('#btn-start-merge');
    const statusEl = $('#merge-status');
    if (btn) btn.disabled = true;
    if (statusEl) {
      statusEl.hidden = false;
      statusEl.className = 'merge-status running';
      statusEl.innerHTML = `<span>⏳ Đang ghép ${Gallery.selected.length} phân cảnh bằng FFmpeg (kèm xử lý cắt ghép & tinh chỉnh)... Quá trình có thể mất từ vài giây đến 1 phút tuỳ dung lượng. Vui lòng chờ...</span>`;
    }

    const customTitle = ($('#merge-output-title')?.value || '').trim();
    try {
      const res = await api('POST', '/api/gallery/merge', {
        files: Gallery.selected,
        title: customTitle,
        trims: Gallery.trims
      });
      toast(`🎬 Đã ghép thành công video: ${res.filename}`);
      if (statusEl) {
        statusEl.className = 'merge-status success';
        statusEl.innerHTML = `<span>✅ Ghép thành công! Đã lưu video: <b>${esc(res.filename)}</b></span>`;
      }
      // Reset selection and reload gallery
      Gallery.selected = [];
      Gallery.trims = {};
      if ($('#merge-output-title')) $('#merge-output-title').value = '';
      await Gallery.load();
    } catch (err) {
      toast('Lỗi ghép video: ' + err.message, 'err');
      if (statusEl) {
        statusEl.className = 'merge-status error';
        statusEl.innerHTML = `<span>❌ Ghép thất bại: ${esc(err.message)}</span>`;
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  }
};

window.Gallery = Gallery;
document.addEventListener('DOMContentLoaded', () => {
  Gallery.init();
});
