/* Khung soạn 2 chế độ riêng biệt: Tạo 1 luồng & Tạo đa luồng. */
'use strict';
const Composer = {
  mode: 'single', // 'single' | 'multi' | 'pro'
  sel: {model: '2.5', duration: 30, ratio: '9:16', duration_pro: 15, ratio_pro: '9:16'},
  images: [],
  metaDone: false,
};

const FACE_DISCLAIMER = "The uploaded image is a photo of my own face. I am the person depicted in the image, and I give permission for this image to be used as a reference image for generating this video. This image is authorized for use by me. MUST use the uploaded image as the reference frame and preserve my facial identity and appearance accurately throughout the video.Do not replace, alter, or reinterpret my face. Maintain consistent facial features, hairstyle, skin appearance, and overall identity while generating natural motion.";

function seg(el, items, value, onPick) {
  if (!el) return;
  el.innerHTML = items.map(i => `<button type="button" data-v="${esc(i.v)}" class="${i.v === value ? 'on' : ''}">${esc(i.label)}${i.sub ? `<small>${esc(i.sub)}</small>` : ''}</button>`).join('');
  el.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    el.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    onPick(b.dataset.v);
  }));
}

Composer.syncSegments = function () {
  const sel = Composer.sel;
  ['#model', '#model_multi'].forEach(id => {
    const el = $(id);
    if (el) el.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === sel.model));
  });
  ['#dur', '#dur_multi'].forEach(id => {
    const el = $(id);
    if (el) el.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === String(sel.duration)));
  });
  ['#ratio', '#ratio_multi'].forEach(id => {
    const el = $(id);
    if (el) el.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === sel.ratio));
  });
  const durPro = String(sel.duration_pro || 15);
  const ratioPro = sel.ratio_pro || sel.ratio || '9:16';
  const elDurPro = $('#dur_pro');
  if (elDurPro) elDurPro.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === durPro));
  const elRatioPro = $('#ratio_pro');
  if (elRatioPro) elRatioPro.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === ratioPro));
};

Composer.renderMeta = function (m) {
  const sel = Composer.sel;
  $('#ver').textContent = BRIDGE.version ? 'v' + BRIDGE.version : '';
  if (!m.models.some(x => x.id === sel.model)) sel.model = m.models[0].id;

  // Single mode segments
  const modelItems = m.models.map(x => ({v: x.id, label: x.id === '2.5' ? 'Seedance 2.5 ⭐' : x.label.replace(/\s*\(.*\)$/, ''), sub: x.id === '2.5' ? 'Không giới hạn 30s' : (x.credits ? x.credits + ' credit' : 'chưa rõ')}));
  seg($('#model'), modelItems, sel.model, v => { sel.model = v; Composer.syncSegments(); Composer.changed(); });

  const durItems = m.durations.map(d => ({v: String(d), label: d === 30 ? '30 giây 🔥' : d + ' giây', sub: d === 30 ? 'Tối đa' : ''}));
  seg($('#dur'), durItems, String(sel.duration), v => { sel.duration = +v; Composer.syncSegments(); Composer.changed(); });

  const labels = m.ratio_labels || {};
  const ratioItems = m.ratios.map(r => ({v: r, label: r, sub: labels[r] || ''}));
  seg($('#ratio'), ratioItems, sel.ratio, v => { sel.ratio = v; Composer.syncSegments(); Composer.changed(); });

  // Multi mode segments
  const modelItemsMulti = m.models.map(x => ({v: x.id, label: x.id === '2.5' ? 'Seedance 2.5 ⭐' : x.label.replace(/\s*\(.*\)$/, ''), sub: x.id === '2.5' ? '30s' : (x.credits ? x.credits + 'c' : '')}));
  if ($('#model_multi')) seg($('#model_multi'), modelItemsMulti, sel.model, v => { sel.model = v; Composer.syncSegments(); Composer.changed(); });

  const durItemsMulti = m.durations.map(d => ({v: String(d), label: d === 30 ? '30s 🔥' : d + 's', sub: ''}));
  if ($('#dur_multi')) seg($('#dur_multi'), durItemsMulti, String(sel.duration), v => { sel.duration = +v; Composer.syncSegments(); Composer.changed(); });

  if ($('#ratio_multi')) seg($('#ratio_multi'), ratioItems, sel.ratio, v => { sel.ratio = v; Composer.syncSegments(); Composer.changed(); });

  // Pro mode segments (chuẩn 15s, 10s, 5s)
  const durItemsPro = [
    {v: '15', label: '15s ⭐ (Chuẩn)', sub: 'Tối đa'},
    {v: '10', label: '10s', sub: ''},
    {v: '5', label: '5s', sub: ''}
  ];
  if ($('#dur_pro')) {
    const curDurPro = String(sel.duration_pro || 15);
    seg($('#dur_pro'), durItemsPro, curDurPro, v => { sel.duration_pro = +v; Composer.syncSegments(); Composer.changed(); });
  }
  if ($('#ratio_pro')) {
    const curRatioPro = sel.ratio_pro || sel.ratio || '9:16';
    seg($('#ratio_pro'), ratioItems, curRatioPro, v => { sel.ratio_pro = v; Composer.syncSegments(); Composer.changed(); });
  }

  Composer.renderThumbs();
  Composer.updateCost();
  Composer.updateMultiReadyBadge();
  Composer.onProInput();
};

Composer.setMode = function (m) {
  Composer.mode = m;
  const isSingle = m === 'single';
  const isMulti = m === 'multi';
  const isPro = m === 'pro';
  const btnSingle = $('#btn-mode-single'), btnMulti = $('#btn-mode-multi'), btnPro = $('#btn-mode-pro');
  if (btnSingle) btnSingle.classList.toggle('on', isSingle);
  if (btnMulti) btnMulti.classList.toggle('on', isMulti);
  if (btnPro) btnPro.classList.toggle('on', isPro);
  if ($('#pane-single')) $('#pane-single').hidden = !isSingle;
  if ($('#pane-multi')) $('#pane-multi').hidden = !isMulti;
  if ($('#pane-pro')) $('#pane-pro').hidden = !isPro;
  lsSet('composer_mode', m);
  if (isSingle) Composer.onInput();
  else if (isMulti) Composer.onMultiInput();
  else if (isPro) Composer.onProInput();
};

Composer.credits = () => { const m = S.meta && S.meta.models.find(x => x.id === Composer.sel.model); return m ? m.credits : null; };

// Chế độ 1 luồng: bỏ tách dòng, toàn bộ ô nhập là 1 video duy nhất
Composer.promptsSingle = () => {
  const v = $('#p') ? $('#p').value.trim() : '';
  return v ? [v] : [];
};

// Chế độ đa luồng: mỗi dòng là 1 prompt video riêng biệt
Composer.promptsMulti = () => {
  const el = $('#p_multi');
  if (!el) return [];
  return el.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
};

// Chế độ Pro (1 nick, kịch bản phân cảnh): mỗi dòng là 1 cảnh
Composer.promptsPro = () => {
  const el = $('#p_pro');
  if (!el) return [];
  return el.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
};

Composer.prompts = () => {
  if (Composer.mode === 'multi') return Composer.promptsMulti();
  if (Composer.mode === 'pro') return Composer.promptsPro();
  return Composer.promptsSingle();
};

Composer.onProInput = function () {
  const prompts = Composer.promptsPro();
  if ($('#pcount_pro')) {
    $('#pcount_pro').textContent = `${prompts.length} prompt (${prompts.length} video)`;
  }
  if ($('#cost_pro')) {
    if (prompts.length > 10) {
      $('#cost_pro').innerHTML = `<span style="color:#f59e0b">⚠️ Đã nhập <b>${prompts.length} prompt</b>. Dola giới hạn ~10 video/ngày/acc.</span>`;
    } else if (prompts.length > 0) {
      const chats = Math.ceil(prompts.length / 2);
      $('#cost_pro').innerHTML = `<b>${prompts.length} video Pro</b> (${chats} phiên chat · 2 video/chat · tự New Chat sau 30s)`;
    } else {
      $('#cost_pro').innerHTML = `Tối đa ~10 video/ngày trên 1 tài khoản duy nhất`;
    }
  }
};

Composer.updateCost = function () {
  const prompts = Composer.promptsSingle().length || 1;
  const perImage = $('#perimage')?.checked && Composer.images.length > 1;
  const units = perImage ? Composer.images.length : 1;
  const copies = +$('#copies')?.value || 1;
  const total = prompts * units * copies;
  const per = Composer.credits();
  if ($('#perimage-f')) $('#perimage-f').hidden = Composer.images.length < 2;
  const parts = [];
  if (units > 1) parts.push(`${units} ảnh`);
  if (copies > 1) parts.push(`${copies} bản`);
  const breakdown = parts.length > 0 && total > 1 ? ` (${parts.join(' × ')})` : '';
  if ($('#dry')?.checked) $('#cost').innerHTML = `Chạy thử ${total} video${breakdown}: không tốn credit`;
  else if (per) $('#cost').innerHTML = `<b>${total} video</b>${breakdown} ≈ <b>${per * total} credit</b>`;
  else $('#cost').innerHTML = `<b>${total} video</b>${breakdown} · credit model này chưa đo được`;

  const ready = (S.profiles || []).filter(p => p.enabled && p.login !== false && p.credits_today !== 0 && !p.resting);
  const known = ready.filter(p => p.credits_today != null);
  const sum = known.reduce((a, p) => a + p.credits_today, 0);
  const warn = $('#costwarn');
  if (warn) {
    if (!$('#dry')?.checked && per && known.length && per * total > sum) {
      warn.hidden = false;
      warn.textContent = `Cần ≈ ${per * total} credit nhưng ${known.length} tài khoản sẵn sàng chỉ còn ${sum}${ready.length > known.length ? ` (${ready.length - known.length} nick chưa rõ credit)` : ''}. Phần thiếu sẽ chờ tới khi có credit hoặc lỗi «hết lượt».`;
    } else warn.hidden = true;
  }
};

Composer.changed = function () {
  Composer.updateCost();
  lsSet('draft', {prompt: $('#p')?.value, sel: Composer.sel, copies: $('#copies')?.value, perimage: $('#perimage')?.checked, face_image: $('#face_image')?.checked});
};

Composer.restoreDraft = function () {
  const d = lsGet('draft', null);
  if (!d) return;
  if (d.sel) Object.assign(Composer.sel, d.sel);
  if (typeof d.prompt === 'string' && $('#p')) $('#p').value = d.prompt;
  if (d.copies && $('#copies')) $('#copies').value = d.copies;
  if (typeof d.perimage === 'boolean' && $('#perimage')) $('#perimage').checked = d.perimage;
  if (typeof d.face_image === 'boolean' && $('#face_image')) $('#face_image').checked = d.face_image;
  Composer.onInput();
};

Composer.onInput = function () {
  const p = $('#p');
  if (!p) return;
  const v = p.value;
  if ($('#pcount')) $('#pcount').textContent = v.length + ' ký tự';
  if ($('#pwarn')) $('#pwarn').hidden = !/[0-9]|second/i.test(v);
  Composer.renderTagChips();
  Composer.changed();
};

Composer.onMultiInput = function () {
  const prompts = Composer.promptsMulti();
  const copies = +$('#copies_multi')?.value || 1;
  const total = prompts.length * copies;
  const per = Composer.credits();
  if ($('#pcount_multi')) {
    $('#pcount_multi').textContent = `${prompts.length} prompt (${total} video)`;
  }
  if ($('#cost_multi')) {
    const parts = [];
    if (prompts.length > 0) parts.push(`${prompts.length} prompt`);
    if (copies > 1) parts.push(`${copies} bản`);
    const breakdown = parts.length > 1 ? ` (${parts.join(' × ')})` : '';
    if (per) $('#cost_multi').innerHTML = `<b>${total} video</b>${breakdown} ≈ <b>${per * total} credit</b>`;
    else $('#cost_multi').innerHTML = `<b>${total} video</b>${breakdown}`;
  }
  Composer.updateMultiReadyBadge();
};

Composer.updateMultiReadyBadge = function () {
  const ready = (S.profiles || []).filter(p => p.enabled && p.login !== false && p.credits_today !== 0 && !p.resting);
  const sum = ready.filter(p => p.credits_today != null).reduce((a, p) => a + p.credits_today, 0);
  const badge = $('#multi_ready_badge');
  const text = $('#multi_ready_text');
  if (badge && text) {
    if (ready.length === 0) {
      text.innerHTML = '⚠️ Chưa có tài khoản nào sẵn sàng (hãy kiểm tra tab Tài khoản)';
      badge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
      badge.style.background = 'rgba(239, 68, 68, 0.1)';
      badge.style.color = '#ef4444';
    } else {
      text.innerHTML = `🟢 <b>${ready.length} tài khoản</b> sẵn sàng chạy song song · Tổng ≈ <b>${sum} credit</b>`;
      badge.style.borderColor = 'rgba(16, 185, 129, 0.25)';
      badge.style.background = 'rgba(16, 185, 129, 0.1)';
      badge.style.color = '#10b981';
    }
  }
};

// ------------------------------------------------------------ @tag
const MENTION_BEFORE = /(^|[^\p{L}\p{N}_@])@([\p{L}\p{N}_]*)$/u;
let mentionIdx = 0, mentionItems = [];
Composer.mentionQuery = function () {
  const ta = $('#p');
  if (!ta) return null;
  const before = ta.value.slice(0, ta.selectionStart);
  const m = MENTION_BEFORE.exec(before);
  return m ? {q: m[2], start: ta.selectionStart - m[2].length - 1} : null;
};
Composer.renderMention = function () {
  const box = $('#mention'), mq = Composer.mentionQuery();
  if (!box || !mq) { if (box) box.hidden = true; return; }
  const q = mq.q.toLowerCase();
  const norm = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase();
  mentionItems = (S.assets || []).filter(a => !q || a.tag.includes(q) || norm(a.name).includes(norm(q))).slice(0, 8);
  const exact = (S.assets || []).some(a => a.tag === q);
  let html = mentionItems.map((a, i) => {
    const cov = a.images.find(im => im.role === 'cover') || a.images[0];
    return `<div class="it ${i === mentionIdx ? 'on' : ''}" data-i="${i}">${cov ? `<img src="${withToken(`/api/assets/${a.id}/images/${cov.id}`)}" alt="">` : '<span class="thumb add" style="width:32px;height:32px;font-size:14px">@</span>'}<div><div class="t">@${esc(a.tag)} <span class="hint2">${esc(a.name)}</span></div><div class="d">${esc(a.desc || (a.images.length + ' ảnh'))}</div></div></div>`;
  }).join('');
  if (q && !exact) html += `<div class="it ${mentionIdx === mentionItems.length ? 'on' : ''}" data-i="${mentionItems.length}"><span class="thumb add" style="width:32px;height:32px;font-size:18px">+</span><div><div class="t">Tạo nhân vật mới: @${esc(q)}</div><div class="d">mở kho nhân vật</div></div></div>`;
  if (!html) html = `<div class="foot">Kho còn trống — thêm nhân vật ở tab «Kho nhân vật» rồi gõ @tag ở đây.</div>`;
  else html += `<div class="foot">↑ ↓ chọn · Enter chèn · Esc đóng</div>`;
  box.innerHTML = html; box.hidden = false;
  box.querySelectorAll('.it').forEach(el => el.addEventListener('mousedown', e => { e.preventDefault(); Composer.pickMention(+el.dataset.i); }));
};
Composer.pickMention = function (i) {
  const mq = Composer.mentionQuery(); if (!mq) return;
  if (i >= mentionItems.length) { $('#mention').hidden = true; Assets.openNew({tag: mq.q, fromPrompt: true}); return; }
  const a = mentionItems[i], ta = $('#p');
  const after = ta.value.slice(ta.selectionStart);
  ta.value = ta.value.slice(0, mq.start) + '@' + a.tag + ' ' + after;
  const pos = mq.start + a.tag.length + 2;
  ta.setSelectionRange(pos, pos); ta.focus();
  $('#mention').hidden = true; mentionIdx = 0;
  Composer.onInput();
};
Composer.insertTag = function (tag) {
  const ta = $('#p');
  if (!ta) return;
  const pos = ta.selectionStart || ta.value.length;
  const before = ta.value.slice(0, pos), after = ta.value.slice(pos);
  const sp = before && !/\s$/.test(before) ? ' ' : '';
  ta.value = before + sp + '@' + tag + ' ' + after;
  ta.focus(); const p = (before + sp + '@' + tag + ' ').length; ta.setSelectionRange(p, p);
  Composer.onInput(); toast(`Đã chèn @${tag} vào prompt`);
};
Composer.renderTagChips = function () {
  const p = $('#p');
  if (!p) return;
  const found = new Map();
  for (const m of p.value.matchAll(/(^|[^\p{L}\p{N}_@])@([\p{L}\p{N}_]{1,60})/gu)) {
    const tag = m[2].normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase().replace(/[^a-z0-9_]+/g, '_');
    if (!found.has(tag)) found.set(tag, (S.assets || []).find(a => a.tag === tag) || null);
  }
  if ($('#tagchips')) {
    $('#tagchips').innerHTML = [...found].map(([tag, a]) => a
      ? `<span class="chip tag" title="${esc(a.desc || '')}">@${esc(tag)} → ${esc(a.name)}${a.images.length ? ` · ${a.images.length} ảnh` : ''}</span>`
      : `<span class="chip warn" title="Chưa có trong kho: gửi đi thì giữ nguyên chữ @${esc(tag)}">@${esc(tag)} chưa có trong kho</span>`).join('');
  }
};

$('#p')?.addEventListener('input', () => { Composer.onInput(); Composer.renderMention(); });
$('#p')?.addEventListener('click', Composer.renderMention);
$('#p')?.addEventListener('blur', () => setTimeout(() => { if ($('#mention')) $('#mention').hidden = true; }, 120));
$('#p')?.addEventListener('keydown', e => {
  const open = !$('#mention')?.hidden && (mentionItems.length || Composer.mentionQuery()?.q);
  if (open) {
    const n = mentionItems.length + (Composer.mentionQuery()?.q && !(S.assets || []).some(a => a.tag === Composer.mentionQuery().q.toLowerCase()) ? 1 : 0);
    if (e.key === 'ArrowDown') { e.preventDefault(); mentionIdx = (mentionIdx + 1) % Math.max(1, n); Composer.renderMention(); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); mentionIdx = (mentionIdx - 1 + Math.max(1, n)) % Math.max(1, n); Composer.renderMention(); return; }
    if ((e.key === 'Enter' && !e.ctrlKey && !e.metaKey) || e.key === 'Tab') { if (n) { e.preventDefault(); Composer.pickMention(mentionIdx); return; } }
    if (e.key === 'Escape') { e.preventDefault(); $('#mention').hidden = true; return; }
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); $('#f')?.requestSubmit(); }
});
['#copies', '#dry', '#perimage'].forEach(s => $(s)?.addEventListener('input', Composer.onInput));

// ------------------------------------------------------------ Chế độ 1 luồng: clipboard / lịch sử
$('#pasteclip')?.addEventListener('click', async () => {
  try {
    const text = (await navigator.clipboard.readText() || '').trim();
    if (!text) return toast('Clipboard trống', 'err');
    const cur = $('#p').value.trim();
    $('#p').value = cur ? cur + '\n' + text : text; Composer.onInput();
    toast('Đã dán prompt từ clipboard');
  } catch (e) { toast('Không đọc được clipboard: ' + e.message, 'err'); }
});
Composer.pushHistory = function (prompts) {
  const h = lsGet('history', []);
  for (const p of prompts) { const i = h.indexOf(p); if (i >= 0) h.splice(i, 1); h.unshift(p); }
  lsSet('history', h.slice(0, 30));
};
$('#histbtn')?.addEventListener('click', () => {
  const h = lsGet('history', []);
  $('#histlist').innerHTML = h.length ? h.map((p, i) => `<div class="h" data-i="${i}">${esc(p)}</div>`).join('') : '<div class="hint">Chưa có prompt nào. Gửi một video là có.</div>';
  $('#histlist').querySelectorAll('.h').forEach(el => el.addEventListener('click', () => {
    const cur = $('#p').value.trim();
    $('#p').value = cur ? cur + '\n' + h[+el.dataset.i] : h[+el.dataset.i]; Composer.onInput(); closeModal($('#histbox')); $('#p').focus();
  }));
  openModal($('#histbox'));
});
$('#histclear')?.addEventListener('click', () => { lsSet('history', []); closeModal($('#histbox')); toast('Đã xoá lịch sử prompt'); });

// ------------------------------------------------------------ Chế độ đa luồng: nạp .txt / clipboard / lọc dòng
$('#loadtxt_multi')?.addEventListener('click', () => $('#txtfile_multi')?.click());
$('#txtfile_multi')?.addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  const text = await f.text();
  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  if (!lines.length) return toast('File không có dòng prompt nào', 'err');
  $('#p_multi').value = lines.join('\n');
  Composer.onMultiInput();
  toast(`Đã nạp ${lines.length} prompt từ ${f.name}`);
});

$('#pasteclip_multi')?.addEventListener('click', async () => {
  try {
    const text = (await navigator.clipboard.readText() || '').trim();
    if (!text) return toast('Clipboard trống', 'err');
    const cur = $('#p_multi').value.trim();
    $('#p_multi').value = cur ? cur + '\n' + text : text;
    Composer.onMultiInput();
    const count = text.split(/\r?\n/).filter(s => s.trim()).length;
    toast(`Đã dán ${count} dòng prompt từ clipboard`);
  } catch (e) { toast('Không đọc được clipboard: ' + e.message, 'err'); }
});

$('#clean_multi')?.addEventListener('click', () => {
  const raw = $('#p_multi').value;
  const lines = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const unique = [...new Set(lines)];
  $('#p_multi').value = unique.join('\n');
  Composer.onMultiInput();
  toast(`Đã lọc: còn ${unique.length} prompt hợp lệ`);
});

$('#p_multi')?.addEventListener('input', Composer.onMultiInput);
$('#copies_multi')?.addEventListener('input', Composer.onMultiInput);

$('#multi_dispatch')?.addEventListener('change', () => {
  const isSel = $('#multi_dispatch').value === 'selected';
  if ($('#multi_acc_select_wrap')) $('#multi_acc_select_wrap').hidden = !isSel;
});

$('#multi_acc_select_all')?.addEventListener('click', () => {
  const cbs = $('#multi_acc_list')?.querySelectorAll('input[type="checkbox"]');
  if (!cbs || !cbs.length) return;
  const allChecked = [...cbs].every(cb => cb.checked);
  cbs.forEach(cb => cb.checked = !allChecked);
  $('#multi_acc_select_all').textContent = allChecked ? 'Chọn tất cả' : 'Bỏ chọn tất cả';
});

// Chuyển chế độ 1 luồng vs Đa luồng vs Pro
$('#btn-mode-single')?.addEventListener('click', () => Composer.setMode('single'));
$('#btn-mode-multi')?.addEventListener('click', () => Composer.setMode('multi'));
$('#btn-mode-pro')?.addEventListener('click', () => Composer.setMode('pro'));

// ------------------------------------------------------------ Chế độ Pro: nạp file .txt, clipboard, lọc dòng
$('#loadtxt_pro')?.addEventListener('click', () => $('#txtfile_pro')?.click());
$('#txtfile_pro')?.addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  const text = await f.text();
  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  if (!lines.length) return toast('File không có dòng prompt nào', 'err');
  $('#p_pro').value = lines.join('\n');
  Composer.onProInput();
  toast(`Đã nạp ${lines.length} cảnh từ ${f.name}`);
});

$('#pasteclip_pro')?.addEventListener('click', async () => {
  try {
    const text = (await navigator.clipboard.readText() || '').trim();
    if (!text) return toast('Clipboard trống', 'err');
    const cur = $('#p_pro').value.trim();
    $('#p_pro').value = cur ? cur + '\n' + text : text;
    Composer.onProInput();
    const count = text.split(/\r?\n/).filter(s => s.trim()).length;
    toast(`Đã dán ${count} dòng kịch bản từ clipboard`);
  } catch (e) { toast('Không đọc được clipboard: ' + e.message, 'err'); }
});

$('#clean_pro')?.addEventListener('click', () => {
  const raw = $('#p_pro').value;
  const lines = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const unique = [...new Set(lines)];
  $('#p_pro').value = unique.join('\n');
  Composer.onProInput();
  toast(`Đã lọc: còn ${unique.length} cảnh hợp lệ`);
});

$('#p_pro')?.addEventListener('input', Composer.onProInput);
$('#p_pro')?.addEventListener('change', Composer.onProInput);
$('#p_pro')?.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    $('#go_pro')?.click();
  }
});

// Gửi Chế độ Pro (1 Acc, chia chunk 2 cảnh/chat, New Chat sau 30s)
$('#go_pro')?.addEventListener('click', async () => {
  /* TRIAL_SUBMIT_GUARD_V1 */
  if (S.trial && S.trial.remaining === 0) { $('#ferr_pro').textContent = 'Bạn đã hết lượt video dùng thử. Không thể tạo thêm video.'; return; }
  const btn = $('#go_pro'); btn.disabled = true; $('#ferr_pro').textContent = '';
  const prompts = Composer.promptsPro();
  if (!prompts.length) {
    $('#ferr_pro').textContent = 'Nhập ít nhất 1 dòng cảnh prompt để chạy Chế độ Pro.';
    btn.disabled = false;
    $('#p_pro').focus();
    return;
  }
  const prof = $('#prof_pro')?.value;
  if (!prof) {
    $('#ferr_pro').textContent = 'Bạn chưa chọn tài khoản Dola nào để chạy Chế độ Pro.';
    btn.disabled = false;
    return;
  }

  try {
    const r = await api('POST', '/api/jobs', {
      prompts,
      model: '2.5',
      duration: Composer.sel.duration_pro || 15,
      ratio: Composer.sel.ratio_pro || Composer.sel.ratio || '9:16',
      profile: prof,
      mode: 'pro',
      dry_run: $('#dry')?.checked || false
    });
    Composer.pushHistory(prompts);
    toast(r.ids.length > 1 ? `Đã khởi chạy Chế độ Pro: ${r.ids.length} video đã vào hàng đợi` : 'Đã thêm video Pro vào hàng đợi');
    S.filter = 'all'; S.q = ''; $('#q').value = '';
    if (S.tab !== 'video') App.showTab('video');
    await App.refresh();
  } catch (err) {
    $('#ferr_pro').textContent = err.message;
  } finally {
    btn.disabled = false;
  }
});

// Gửi đa luồng
$('#go_multi')?.addEventListener('click', async () => {
  /* TRIAL_SUBMIT_GUARD_V1 */
  if (S.trial && S.trial.remaining === 0) { $('#ferr_multi').textContent = 'Bạn đã hết lượt video dùng thử. Không thể tạo thêm video.'; return; }
  const btn = $('#go_multi'); btn.disabled = true; $('#ferr_multi').textContent = '';
  const prompts = Composer.promptsMulti();
  if (!prompts.length) {
    $('#ferr_multi').textContent = 'Nhập ít nhất 1 dòng prompt để chạy đa luồng.';
    btn.disabled = false;
    $('#p_multi').focus();
    return;
  }
  const copies = +$('#copies_multi').value || 1;
  const dispatch = $('#multi_dispatch').value;
  let targetProfiles = null;
  if (dispatch === 'selected') {
    targetProfiles = [...$('#multi_acc_list').querySelectorAll('input[type="checkbox"]:checked')].map(cb => cb.value);
    if (!targetProfiles.length) {
      $('#ferr_multi').textContent = 'Bạn chưa chọn tài khoản nào để chạy đa luồng.';
      btn.disabled = false;
      return;
    }
  }

  try {
    const r = await api('POST', '/api/jobs', {
      prompts,
      model: Composer.sel.model,
      duration: Composer.sel.duration,
      ratio: Composer.sel.ratio || null,
      profile: dispatch === 'auto' ? 'auto' : undefined,
      profiles: targetProfiles,
      copies,
      dry_run: $('#dry')?.checked || false
    });
    Composer.pushHistory(prompts);
    toast(r.ids.length > 1 ? `Đã khởi chạy đa luồng: ${r.ids.length} video đã vào hàng đợi` : 'Đã thêm video vào hàng đợi');
    S.filter = 'all'; S.q = ''; $('#q').value = '';
    if (S.tab !== 'video') App.showTab('video');
    await App.refresh();
  } catch (err) {
    $('#ferr_multi').textContent = err.message;
  } finally {
    btn.disabled = false;
  }
});

$('#p_multi')?.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    $('#go_multi')?.click();
  }
});

// ------------------------------------------------------------ ảnh tham chiếu (chế độ 1 luồng)
Composer.renderThumbs = function () {
  const max = (S.meta && S.meta.max_ref_images) || 4;
  if (!$('#thumbs')) return;
  $('#thumbs').innerHTML = Composer.images.map((im, i) =>
    `<div class="thumb"><img src="${im.preview}" alt=""><button type="button" data-i="${i}" title="Bỏ ảnh này" aria-label="Bỏ ảnh">✕</button></div>`).join('') +
    `<div class="thumb add" id="addimg" role="button" tabindex="0" title="Thêm ảnh tham chiếu (tối đa ${max})">+</div>`;
  $('#thumbs').querySelectorAll('.thumb button').forEach(b => b.addEventListener('click', () => { Composer.images.splice(+b.dataset.i, 1); Composer.renderThumbs(); Composer.updateCost(); }));
  const add = $('#addimg');
  if (add) {
    add.addEventListener('click', () => $('#img')?.click());
    add.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('#img')?.click(); } });
  }
  if ($('#perimage-f')) $('#perimage-f').hidden = Composer.images.length < 2;
};

Composer.addFiles = async function (files) {
  const list = [...files].filter(f => f.type.startsWith('image/'));
  if (!list.length) return;
  $('#ferr').textContent = '';
  for (const file of list) {
    try {
      const dataUrl = await fileToDataUrl(file);
      const up = await api('POST', '/api/upload', {name: file.name || 'anh.jpg', data_b64: dataUrl});
      Composer.images.push({id: up.id, name: file.name, preview: dataUrl});
    } catch (err) { $('#ferr').textContent = 'Không tải được ảnh: ' + err.message; }
  }
  Composer.renderThumbs(); Composer.updateCost();
  toast(`Đã thêm ${list.length} ảnh tham chiếu`);
};

$('#img')?.addEventListener('change', async e => { await Composer.addFiles(e.target.files); e.target.value = ''; });

let dragDepth = 0;
window.addEventListener('dragenter', e => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) { dragDepth++; if ($('#dropover')) $('#dropover').hidden = false; } });
window.addEventListener('dragleave', () => { if (--dragDepth <= 0) { dragDepth = 0; if ($('#dropover')) $('#dropover').hidden = true; } });
window.addEventListener('dragover', e => { e.preventDefault(); });
window.addEventListener('drop', e => {
  e.preventDefault(); dragDepth = 0; if ($('#dropover')) $('#dropover').hidden = true;
  if (!$('#assetbox')?.hidden) return Assets.addFiles(e.dataTransfer.files);
  Composer.addFiles(e.dataTransfer.files);
});
document.addEventListener('paste', e => {
  const files = [...(e.clipboardData?.files || [])].filter(f => f.type.startsWith('image/'));
  if (!files.length) return;
  e.preventDefault();
  if (!$('#assetbox')?.hidden) return Assets.addFiles(files);
  Composer.addFiles(files);
});

// ------------------------------------------------------------ gửi chế độ 1 luồng
$('#face_image')?.addEventListener('change', () => Composer.changed());

$('#f')?.addEventListener('submit', async e => {
  e.preventDefault();
  if (Composer.mode !== 'single') return; // Chế độ đa luồng gửi qua #go_multi, Pro qua #go_pro
  /* TRIAL_SUBMIT_GUARD_V1 */
  if (S.trial && S.trial.remaining === 0) { $('#ferr').textContent = 'Bạn đã hết lượt video dùng thử. Không thể tạo thêm video.'; return; }
  const btn = $('#go'); btn.disabled = true; $('#ferr').textContent = '';
  const rawPrompts = Composer.promptsSingle();
  if (!rawPrompts.length) { $('#ferr').textContent = 'Viết prompt trước đã.'; btn.disabled = false; $('#p')?.focus(); return; }
  const copies = +$('#copies')?.value || 1;
  const isFaceImage = $('#face_image')?.checked;
  const sendPrompts = isFaceImage
    ? rawPrompts.map(p => p.includes(FACE_DISCLAIMER) ? p : (p + '\n\n' + FACE_DISCLAIMER))
    : rawPrompts;
  try {
    const r = await api('POST', '/api/jobs', {
      prompts: sendPrompts, model: Composer.sel.model, duration: Composer.sel.duration, ratio: Composer.sel.ratio || null,
      profile: $('#prof')?.value, copies, image_ids: Composer.images.map(i => i.id),
      per_image: $('#perimage')?.checked && Composer.images.length > 1, dry_run: $('#dry')?.checked,
    });
    Composer.pushHistory(rawPrompts);
    toast(r.ids.length > 1 ? `Đã thêm ${r.ids.length} video vào hàng đợi` : 'Đã thêm video vào hàng đợi');
    S.filter = 'all'; S.q = ''; $('#q').value = '';
    if (S.tab !== 'video') App.showTab('video');
    await App.refresh();
  } catch (err) { $('#ferr').textContent = err.message; }
  finally { btn.disabled = false; }
});
$('#openFolder')?.addEventListener('click', () => api('POST', '/api/open-folder', {}).then(r => toast('Đã mở ' + r.path)).catch(err => toast(err.message, 'err')));

Composer.renderProfileSelect = function (profiles) {
  const s = $('#prof'), cur = s ? (s.value || 'auto') : 'auto';
  if (s) {
    s.innerHTML = '<option value="auto">⚡ Tự động tìm nick rảnh (Chạy song song, không chờ)</option>' +
      profiles.filter(p => p.enabled).map(p => `<option value="${esc(p.id)}">${esc(p.name)}${p.resting ? ' (đang nghỉ)' : p.credits_today != null ? ` · ${p.credits_today} credit` : ''}</option>`).join('');
    if ([...s.options].some(o => o.value === cur)) s.value = cur;
  }

  // Cập nhật dropdown nick cho Chế độ Pro (chọn 1 nick duy nhất)
  const sPro = $('#prof_pro');
  if (sPro) {
    const curPro = sPro.value;
    const enabled = profiles.filter(p => p.enabled);
    sPro.innerHTML = enabled.length
      ? enabled.map(p => `<option value="${esc(p.id)}">${esc(p.name)}${p.resting ? ' (đang nghỉ)' : p.credits_today != null ? ` · ${p.credits_today}c` : ''}</option>`).join('')
      : '<option value="">Chưa có tài khoản nào được bật</option>';
    if ([...sPro.options].some(o => o.value === curPro)) sPro.value = curPro;
  }

  // Cập nhật danh sách checkbox nick chạy đa luồng
  const listEl = $('#multi_acc_list');
  if (listEl) {
    const prevChecked = new Set([...listEl.querySelectorAll('input[type="checkbox"]:checked')].map(cb => cb.value));
    const enabledProfiles = profiles.filter(p => p.enabled);
    if (!enabledProfiles.length) {
      listEl.innerHTML = '<div style="font-size:12px;color:var(--ink-2);padding:4px">Chưa có tài khoản nào được bật</div>';
    } else {
      listEl.innerHTML = enabledProfiles.map(p => {
        const isChecked = prevChecked.size === 0 || prevChecked.has(p.id);
        const statusText = p.resting ? ' (nghỉ)' : p.credits_today != null ? ` · ${p.credits_today}c` : '';
        return `<label class="multi-acc-item"><input type="checkbox" value="${esc(p.id)}" ${isChecked ? 'checked' : ''}> <span>${esc(p.name)}</span><small style="color:var(--ink-2)">${statusText}</small></label>`;
      }).join('');
    }
  }
  Composer.updateMultiReadyBadge();
};

/** «Dùng lại prompt» từ thẻ video */
Composer.reuse = function (j) {
  Composer.setMode('single');
  let cleanPrompt = j.prompt || '';
  if (cleanPrompt.includes(FACE_DISCLAIMER)) {
    cleanPrompt = cleanPrompt.replace(FACE_DISCLAIMER, '').trim();
    if ($('#face_image')) $('#face_image').checked = true;
  }
  if ($('#p')) $('#p').value = cleanPrompt;
  const m = S.meta;
  if (m) {
    Composer.sel.model = m.models.some(x => x.id === j.model) ? j.model : Composer.sel.model;
    Composer.sel.duration = m.durations.includes(j.duration) ? j.duration : Composer.sel.duration;
    Composer.sel.ratio = j.ratio || '';
    Composer.renderMeta(m);
  }
  Composer.onInput();
  if ($('#p')) $('#p').focus();
  $('aside')?.scrollTo(0, 0);
  toast('Đã đưa prompt về khung soạn 1 luồng');
};

// Khởi tạo các nút segment cho Chế độ Pro
try {
  const initDurPro = [
    { v: '15', label: '15s ⭐ (Chuẩn)', sub: 'Tối đa' },
    { v: '10', label: '10s', sub: '' },
    { v: '5', label: '5s', sub: '' }
  ];
  const initRatioPro = [
    { v: '9:16', label: '9:16', sub: 'dọc' },
    { v: '16:9', label: '16:9', sub: 'ngang' },
    { v: '1:1', label: '1:1', sub: 'vuông' },
    { v: '3:4', label: '3:4', sub: 'dọc 3:4' },
    { v: '4:3', label: '4:3', sub: 'ngang 4:3' },
    { v: '21:9', label: '21:9', sub: 'siêu rộng' }
  ];
  if ($('#dur_pro') && !$('#dur_pro').children.length) seg($('#dur_pro'), initDurPro, '15', v => { Composer.sel.duration_pro = +v; Composer.syncSegments(); });
  if ($('#ratio_pro') && !$('#ratio_pro').children.length) seg($('#ratio_pro'), initRatioPro, '9:16', v => { Composer.sel.ratio_pro = v; Composer.syncSegments(); });
} catch {}

// Khôi phục chế độ đã lưu
try {
  const savedMode = lsGet('composer_mode', 'single');
  Composer.setMode(savedMode);
} catch {}
