/* Tab Nhật ký: đọc thêm dần bằng ?since=, lọc mức/nguồn, tự cuộn, chép lỗi, xuất .txt. */
'use strict';
const Logs = {since: 0, timer: null, level: '', scope: '', lines: [], scopes: []};

Logs.reset = function () {
  Logs.since = 0; Logs.lines = []; $('#logbox').innerHTML = '';
};
Logs.poll = async function () {
  if (S.tab !== 'logs' || document.hidden) return;
  try {
    const r = await api('GET', `/api/logs?since=${Logs.since}&level=${encodeURIComponent(Logs.level)}&scope=${encodeURIComponent(Logs.scope)}`);
    if (r.entries.length) {
      Logs.since = r.entries[r.entries.length - 1].seq;
      Logs.lines.push(...r.entries);
      if (Logs.lines.length > 3000) Logs.lines.splice(0, Logs.lines.length - 3000);
      Logs.append(r.entries);
    } else if (r.last_seq < Logs.since) Logs.reset();   // server đã xoá
    Logs.renderScopes(r.scopes);
    $('#logcount').textContent = Logs.lines.length ? `${Logs.lines.length} dòng` : 'Chưa có log';
  } catch (e) { /* mất kết nối: vòng chính đã báo */ }
};
Logs.append = function (entries) {
  const box = $('#logbox');
  const atBottom = box.scrollTop + box.clientHeight >= box.scrollHeight - 30;
  const frag = document.createDocumentFragment();
  for (const e of entries) {
    const d = document.createElement('div');
    d.className = 'ln ' + e.level;
    d.innerHTML = `<span class="ts">${esc(e.ts.slice(11))}</span><span class="sc" title="${esc(e.scope)}">${esc(e.scope)}</span><span class="m">${esc(e.msg)}</span>`;
    frag.appendChild(d);
  }
  box.appendChild(frag);
  while (box.children.length > 3000) box.firstChild.remove();
  if ($('#logfollow').checked || atBottom) box.scrollTop = box.scrollHeight;
};
Logs.renderScopes = function (scopes) {
  if (JSON.stringify(scopes) === JSON.stringify(Logs.scopes)) return;
  Logs.scopes = scopes;
  const s = $('#logscope'), cur = s.value;
  s.innerHTML = '<option value="">Mọi nguồn</option>' + scopes.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join('');
  if ([...s.options].some(o => o.value === cur)) s.value = cur;
};
Logs.start = function () {
  Logs.reset(); Logs.poll();
  if (!Logs.timer) Logs.timer = setInterval(Logs.poll, 1000);
};
Logs.stop = function () { if (Logs.timer) { clearInterval(Logs.timer); Logs.timer = null; } };

$('#loglevel').addEventListener('change', () => { Logs.level = $('#loglevel').value; Logs.reset(); Logs.poll(); });
$('#logscope').addEventListener('change', () => { Logs.scope = $('#logscope').value; Logs.reset(); Logs.poll(); });
$('#logbox').addEventListener('scroll', () => {
  const box = $('#logbox');
  if (box.scrollTop + box.clientHeight < box.scrollHeight - 60) $('#logfollow').checked = false;
});
$('#logcopy').addEventListener('click', () => {
  const bad = Logs.lines.filter(e => e.level !== 'info').slice(-40);
  if (!bad.length) return toast('Chưa có dòng lỗi nào');
  copyText(bad.map(e => `${e.ts.replace('T', ' ')} [${e.level}] ${e.scope}: ${e.msg}`).join('\n'), `Đã chép ${bad.length} dòng lỗi/cảnh báo — dán cho hỗ trợ`);
});
$('#logexport').href = withToken('/api/logs/export');
$('#logclear').addEventListener('click', async () => {
  if (!(await confirmBox({title: 'Xoá nhật ký?', msg: 'Xoá toàn bộ nhật ký đang hiện. Nhật ký riêng của từng video (trong thẻ) vẫn còn.', ok: 'Xoá', danger: true}))) return;
  try { await api('POST', '/api/logs/clear'); Logs.reset(); toast('Đã xoá nhật ký'); } catch (e) { toast(e.message, 'err'); }
});
