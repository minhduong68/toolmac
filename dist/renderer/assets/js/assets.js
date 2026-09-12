/* Tab Kho nhân vật: lưới asset, hộp thêm/sửa với ảnh có vai trò, gọi @tag vào prompt. */
'use strict';
const Assets = {editing: null, pending: [], sort: 'updated', filter: '', q: ''};
const ROLES = {cover: 'Ảnh bìa', full: 'Toàn thân', outfit: 'Trang phục', product: 'Sản phẩm', other: 'Khác'};
const ROLE_ORDER = ['cover', 'full', 'outfit', 'product', 'other'];

Assets.load = async function () {
  try { S.assets = (await api('GET', '/api/assets')).assets; } catch (e) { S.assets = S.assets || []; }
  $('#n-assets').textContent = S.assets.length || '';
  Assets.render();
  Composer.renderTagChips();
};

Assets.cover = a => a.images.find(im => im.role === 'cover') || a.images[0] || null;
Assets.imgUrl = (a, im) => withToken(`/api/assets/${a.id}/images/${im.id}`);

Assets.render = function () {
  if (S.tab !== 'assets') return;
  const norm = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase();
  const q = norm(Assets.q);
  let list = S.assets.filter(a => !q || a.tag.includes(q) || norm(a.name).includes(q) || norm(a.desc).includes(q));
  if (Assets.filter === 'nocover') list = list.filter(a => !a.images.some(im => im.role === 'cover'));
  if (Assets.filter === 'nodesc') list = list.filter(a => !a.desc);
  if (Assets.filter === 'noimg') list = list.filter(a => !a.images.length);
  list = [...list].sort((a, b) => Assets.sort === 'name' ? a.name.localeCompare(b.name, 'vi') : Assets.sort === 'images' ? b.images.length - a.images.length : Assets.sort === 'created' ? (a.created < b.created ? 1 : -1) : (a.updated < b.updated ? 1 : -1));
  $('#assetgrid').innerHTML = list.map(a => {
    const cov = Assets.cover(a);
    return `<div class="acard" data-id="${esc(a.id)}"><div class="cov">${cov ? `<img src="${Assets.imgUrl(a, cov)}" alt="">` : '@'}</div>
      <div class="body"><div class="tag">@${esc(a.tag)}</div><div class="nm">${esc(a.name)}</div><div class="ds">${esc(a.desc || 'Chưa có mô tả — thêm để nhân vật đồng nhất hơn')}</div>
      <div class="ft"><span>${a.images.length} ảnh${cov ? '' : ' · thiếu bìa'}</span><button class="btn sm" data-act="use" title="Chèn @${esc(a.tag)} vào prompt">Gọi trong prompt</button></div></div></div>`;
  }).join('') || `<div class="empty" style="grid-column:1/-1"><div class="frame"></div><div><h3>${S.assets.length ? 'Không có asset nào khớp' : 'Kho còn trống'}</h3><p>${S.assets.length ? 'Thử xoá bộ lọc hoặc đổi từ khoá.' : 'Thêm nhân vật, sản phẩm, trang phục kèm mô tả và vài ảnh. Sau đó gõ @tag trong prompt là app tự gắn ảnh và mô tả vào mọi video — nhân vật giữ nguyên qua nhiều video.'}</p></div></div>`;
  $('#assetgrid').querySelectorAll('.acard').forEach(card => {
    const a = S.assets.find(x => x.id === card.dataset.id);
    card.addEventListener('click', e => { if (e.target.closest('[data-act=use]')) { Composer.insertTag(a.tag); App.showTab('video'); } else Assets.open(a); });
  });
};
$('#assetq').addEventListener('input', () => { Assets.q = $('#assetq').value.trim(); Assets.render(); });
$('#assetsort').addEventListener('change', () => { Assets.sort = $('#assetsort').value; Assets.render(); });
$('#assetfilter').addEventListener('change', () => { Assets.filter = $('#assetfilter').value; Assets.render(); });

// ------------------------------------------------------------ hộp thêm / sửa
Assets.open = function (a) {
  Assets.editing = a; Assets.pending = [];
  $('#assettitle').textContent = a ? `@${a.tag}` : 'Thêm nhân vật / asset';
  $('#atag').value = a ? a.tag : ''; $('#aname').value = a ? a.name : ''; $('#adesc').value = a ? a.desc : '';
  $('#atagnorm').textContent = ''; $('#asseterr').textContent = '';
  $('#assetdel').hidden = !a;
  Assets.renderThumbs();
  openModal($('#assetbox'));
};
/** Từ popover @ (tag mới) hoặc từ thẻ video (ảnh chụp). */
Assets.openNew = function ({tag = '', image = null, fromPrompt = false} = {}) {
  Assets.open(null);
  $('#atag').value = tag; Assets.onTag();
  if (image) { Assets.pending.push({preview: image, role: 'cover'}); Assets.renderThumbs(); }
  Assets.afterSave = fromPrompt ? (saved) => Composer.insertTag(saved.tag) : null;
  if (S.tab !== 'assets' && !fromPrompt && image) toast('Chọn hoặc tạo asset để lưu khung hình này');
};
Assets.afterSave = null;
Assets.onTag = function () {
  const v = $('#atag').value;
  const n = v.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase().replace(/^@+/, '').replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40);
  const dup = S.assets.find(a => a.tag === n && (!Assets.editing || a.id !== Assets.editing.id));
  $('#atagnorm').textContent = n ? (dup ? `@${n} đã tồn tại (${dup.name})` : `gõ trong prompt: @${n}`) : '';
  if (!$('#aname').value && n) $('#aname').placeholder = v.trim() || 'Tên';
};
$('#atag').addEventListener('input', Assets.onTag);

Assets.thumbList = function () {
  const saved = Assets.editing ? Assets.editing.images.map(im => ({id: im.id, role: im.role, preview: Assets.imgUrl(Assets.editing, im)})) : [];
  return [...saved, ...Assets.pending];
};
Assets.renderThumbs = function () {
  const items = Assets.thumbList();
  $('#athumbs').innerHTML = items.map((im, i) => `<div class="thumb ${im.role === 'cover' ? 'cover' : ''}"><img src="${im.preview}" alt=""><button type="button" data-i="${i}" title="Bỏ ảnh">✕</button><div class="role" data-i="${i}" title="Bấm để đổi vai trò">${ROLES[im.role] || 'Khác'}</div></div>`).join('') +
    `<div class="thumb add" id="aaddimg" role="button" tabindex="0" title="Thêm ảnh (kéo-thả hoặc Ctrl+V cũng được)">+</div>`;
  $('#aaddimg').addEventListener('click', () => $('#aimg').click());
  $('#athumbs').querySelectorAll('.thumb button').forEach(b => b.addEventListener('click', async () => {
    const i = +b.dataset.i, im = items[i];
    try {
      if (im.id) { await api('DELETE', `/api/assets/${Assets.editing.id}/images/${im.id}`); Assets.editing.images = Assets.editing.images.filter(x => x.id !== im.id); }
      else Assets.pending.splice(i - (Assets.editing ? Assets.editing.images.length : 0), 1);
      Assets.renderThumbs();
    } catch (err) { $('#asseterr').textContent = err.message; }
  }));
  $('#athumbs').querySelectorAll('.role').forEach(r => r.addEventListener('click', async () => {
    const i = +r.dataset.i, im = items[i];
    const next = ROLE_ORDER[(ROLE_ORDER.indexOf(im.role) + 1) % ROLE_ORDER.length];
    try {
      if (im.id) { await api('PATCH', `/api/assets/${Assets.editing.id}/images/${im.id}`, {role: next}); Assets.editing = (await api('GET', '/api/assets')).assets.find(a => a.id === Assets.editing.id); }
      else { if (next === 'cover') Assets.pending.forEach(p => { if (p.role === 'cover') p.role = 'other'; }); im.role = next; }
      Assets.renderThumbs();
    } catch (err) { $('#asseterr').textContent = err.message; }
  }));
};
Assets.addFiles = async function (files) {
  const list = [...files].filter(f => f.type.startsWith('image/'));
  for (const f of list) Assets.pending.push({preview: await fileToDataUrl(f), role: Assets.thumbList().some(x => x.role === 'cover') ? 'other' : 'cover', name: f.name});
  if (list.length) Assets.renderThumbs();
};
$('#aimg').addEventListener('change', async e => { await Assets.addFiles(e.target.files); e.target.value = ''; });

$('#assetform').addEventListener('submit', async e => {
  e.preventDefault(); $('#asseterr').textContent = ''; $('#assetgo').disabled = true;
  try {
    const fields = {tag: $('#atag').value, name: $('#aname').value.trim() || $('#atag').value.trim(), desc: $('#adesc').value};
    let a = Assets.editing;
    if (a) a = await api('PATCH', `/api/assets/${a.id}`, fields);
    else a = await api('POST', '/api/assets', fields);
    for (const im of Assets.pending) await api('POST', `/api/assets/${a.id}/images`, {name: im.name, data_b64: im.preview, role: im.role});
    closeModal($('#assetbox'));
    toast(Assets.editing ? `Đã lưu @${a.tag}` : `Đã thêm @${a.tag} vào kho`);
    await Assets.load();
    if (Assets.afterSave) { Assets.afterSave(a); Assets.afterSave = null; }
  } catch (err) { $('#asseterr').textContent = err.message; }
  finally { $('#assetgo').disabled = false; }
});
$('#assetdel').addEventListener('click', async () => {
  const a = Assets.editing; if (!a) return;
  const ok = await confirmBox({title: `Xoá @${a.tag}?`, msg: `Xoá asset và ${a.images.length} ảnh của nó khỏi kho, không hoàn tác. Video đã tạo không bị ảnh hưởng.`, ok: 'Xoá', danger: true});
  if (!ok) return;
  try { await api('DELETE', `/api/assets/${a.id}`); closeModal($('#assetbox')); toast('Đã xoá asset'); await Assets.load(); }
  catch (err) { $('#asseterr').textContent = err.message; }
});
$('#addasset').addEventListener('click', () => Assets.open(null));
