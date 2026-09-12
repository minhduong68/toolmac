/* Tab Video: KPI + biểu đồ 7 ngày, lọc/tìm/sắp xếp, chọn nhiều, thẻ video có ETA và giải thích lỗi. */
'use strict';
const Jobs = {prevStatus: new Map(), lastAccJson: ''};

// ------------------------------------------------------------ KPI + biểu đồ
Jobs.renderKpi = function (meta) {
  const st = meta.stats; if (!st) return;
  const days = st.days || [];
  const max = Math.max(1, ...days.map(d => d.done + d.error));
  const DOW = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const cols = days.map(d => {
    const n = d.done + d.error, dt = new Date(d.date + 'T00:00:00');
    const h = v => Math.round((v / max) * 100);
    return `<div class="col ${n ? '' : 'none'}"><span class="tip">${fmtDMY(d.date)}: ${d.done} xong${d.error ? `, ${d.error} lỗi` : ''}</span>${d.error ? `<div class="b err" style="height:${h(d.error)}%"></div>` : ''}<div class="b done" style="height:${n ? h(d.done) : 6}%"></div></div>`;
  }).join('');
  const xs = days.map(d => `<span>${DOW[new Date(d.date + 'T00:00:00').getDay()]}</span>`).join('');
  const html = [
    `<div class="kpi"><div class="l">Video hôm nay</div><div class="v">${st.videos_today}<small>≈ ${st.credits_today} credit</small></div></div>`,
    `<div class="kpi"><div class="l">Tỉ lệ thành công</div><div class="v">${st.success_rate == null ? '—' : st.success_rate + '%'}<small>${st.done} xong · ${st.error} lỗi</small></div></div>`,
    `<div class="kpi"><div class="l">Đang chạy / chờ</div><div class="v">${st.running}<small>+ ${st.queued} chờ</small></div></div>`,
    `<div class="kpi wide"><div class="l">7 ngày qua</div><div class="bars">${cols}</div><div class="chartx">${xs}</div><div class="legend"><span><i style="background:var(--moss)"></i>xong</span><span><i style="background:var(--red)"></i>lỗi</span></div></div>`,
  ].join('');
  if ($('#kpi').innerHTML !== html) $('#kpi').innerHTML = html;
};

Jobs.renderAccountFilter = function (profiles) {
  const s = $('#accf'), cur = s.value;
  const html = '<option value="">Mọi tài khoản</option>' + profiles.map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
  if (s.innerHTML !== html) { s.innerHTML = html; if ([...s.options].some(o => o.value === cur)) s.value = cur; }
};

// ------------------------------------------------------------ giải thích lỗi
/** Câu chữ ngữ nghĩa cho thẻ lỗi: server gửi error_kind/error_hint (1.1.0) thì dùng, không thì đoán từ câu lỗi. */
Jobs.explain = function (j) {
  const r = j.result || {};
  if (r.error_hint) return r.error_hint;
  const e = (j.error || '').toLowerCase();
  if (!e) return '';
  if (e.includes('daily limit')) return 'Tài khoản này hết lượt hôm nay. App đã cho nick nghỉ tới sáng mai và chuyển job sang nick khác nếu có.';
  if (e.includes('proxy')) return 'Proxy của tài khoản không kết nối được — sửa ở tab Tài khoản (cột Proxy) rồi Chạy lại.';
  if (e.includes('chưa đăng nhập')) return 'Phiên đăng nhập hết hạn. Nạp cookie mới hoặc đăng nhập lại ở tab Tài khoản.';
  if (e.includes("couldn't generate") || e.includes("couldn't be generated") || e.includes("something went wrong")) return 'Dola nhận yêu cầu nhưng render hỏng — Dola không trừ credit cho video hỏng. Chạy lại được.';
  if (e.includes('captcha') || e.includes('xác minh')) return 'Dola yêu cầu xác minh Captcha — bấm «Mở trình duyệt» ở tab Tài khoản để giải Captcha rồi Chạy lại.';
  if (e.includes('máy chủ từ chối')) return 'Dola không nhận yêu cầu này (nội dung, ảnh hoặc bản quyền bị chặn). Chưa trừ credit. Sửa prompt/ảnh rồi Chạy lại.';
  if (/hết \d+ phút/.test(e)) return 'Hết thời gian chờ mà Dola chưa trả video. Video có thể vẫn đang render — vài phút nữa bấm «Lấy video từ Dola», không tốn credit.';
  if (e.includes('không bắt được request')) return 'Tin nhắn chưa gửi được hoặc trang Dola đổi cấu trúc. Chưa trừ credit. Thử Chạy lại; lặp lại thì chờ bản cập nhật.';
  if (e.includes('app bị tắt')) return r.conversation_url ? 'App tắt giữa chừng sau khi đã gửi yêu cầu. Bấm «Lấy video từ Dola» để tải về, không tốn credit.' : 'App tắt trước khi gửi yêu cầu. Chạy lại là được, chưa trừ credit.';
  if (e.includes('tải video thất bại') || e.includes('tải về')) return 'Dola đã có video nhưng tải về máy lỗi. Bấm «Lấy video từ Dola», không tốn credit.';
  if (e.includes('không còn profile nào khác')) return 'Không còn tài khoản nào khác để chuyển. Kiểm tra tab Tài khoản.';
  if (e.includes('hết giờ chờ đăng nhập')) return 'Cửa sổ đăng nhập mở 10 phút mà chưa đăng nhập xong.';
  return '';
};

// ------------------------------------------------------------ ETA
Jobs.eta = function (j) {
  const st = S.meta && S.meta.stats; if (!st) return '';
  const avg = st.avg_seconds[`${j.model}|${j.duration}`] ?? st.avg_seconds[j.model] ?? 360;
  if (j.status === 'running') {
    const left = avg - elapsedSec(j.started);
    return left > 30 ? `≈ còn ${fmtMin(left)}` : left > -avg ? 'sắp xong' : 'lâu hơn bình thường — xem nhật ký';
  }
  if (j.status === 'queued') {
    const ready = Math.max(1, S.profiles.filter(Accounts.ready).length);
    const ahead = S.jobs.filter(x => x.status === 'queued' && x.kind === 'generate' && x.seq < j.seq).length;
    const wait = Math.ceil((ahead + 1) / ready) * avg - (S.jobs.some(x => x.status === 'running') ? avg / 2 : 0);
    return `ước tính bắt đầu sau ~${fmtMin(Math.max(30, wait))}`;
  }
  return '';
};

// ------------------------------------------------------------ thẻ
// Các bước của một job tạo video, đúng thứ tự server báo (scheduler.ts JobStage).
// "sending" và "sent" gộp thành một chấm "Gửi"; "rendering" là "Dola dựng".
const STEPS = [
  {short: 'Trình duyệt', title: 'Mở trình duyệt ẩn của nick', stages: ['browser']},
  {short: 'Phiên', title: 'Kiểm tra phiên đăng nhập với Dola', stages: ['session']},
  {short: 'Soạn', title: 'Mở trang tạo video, bật chế độ video, đính ảnh', stages: ['compose']},
  {short: 'Gửi', title: 'Gửi yêu cầu, chờ Dola nhận', stages: ['sending', 'sent']},
  {short: 'Dola dựng', title: 'Dola đang dựng video', stages: ['rendering']},
  {short: 'Tải về', title: 'Tải tệp video về máy', stages: ['downloading']},
  {short: 'Xử lý', title: 'Chuyển mã, xoá watermark', stages: ['processing']},
];
const STAGE_INDEX = {};
STEPS.forEach((s, i) => s.stages.forEach(st => { STAGE_INDEX[st] = i; }));
STAGE_INDEX.done = STEPS.length;

function stateBlock(j) {
  const r = j.result || {};
  if (j.kind !== 'generate') {
    const t = KIND[j.kind] || j.kind;
    const detail = j.status === 'running' ? (j.kind === 'login' ? 'Đang kiểm tra phiên; nếu chưa đăng nhập, cửa sổ đăng nhập Google sẽ mở.' : j.kind === 'cookies' ? 'Đang nạp cookie vào trình duyệt ẩn và kiểm tra với Dola.' : 'Đang mở trình duyệt để kiểm tra.') : j.status === 'done' ? (r.login ? 'Đã đăng nhập' + (r.credits != null ? `, còn ${r.credits} credit` : '') : 'Chưa đăng nhập') : (j.error || STATUS[j.status]);
    return `<div class="state"><span class="big">${esc(t)}</span>${esc(detail)}</div>`;
  }
  if (j.status === 'running') {
    // Bước hiện tại từ server (stage/stage_note/progress); job 1.1.0 cũ không có thì rơi về dòng log cuối.
    const note = j.stage_note || (j.log.length ? j.log[j.log.length - 1].replace(/^\d\d:\d\d:\d\d /, '') : 'Đang mở trình duyệt');
    const pct = Math.max(0, Math.min(100, Number(j.progress) || 0));
    const idx = STAGE_INDEX[j.stage] ?? -1;
    const steps = STEPS.map((s, i) => `<li class="${i < idx ? 'done' : i === idx ? 'cur' : ''}" title="${esc(s.title)}">${esc(s.short)}</li>`).join('');
    const tries = j.attempts ? `<span class="chip warn">thử lại ${j.attempts}/3</span>` : '';
    return `<div class="state"><div class="ring"></div><span class="big">${elapsed(j.started)}</span>đang tạo trên ${esc(j.assigned_name || '…')} ${tries}
      <div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
      <div class="stage">${esc(note)}</div>
      <ol class="steps">${steps}</ol>
      <div class="eta">${esc(Jobs.eta(j))}</div></div>`;
  }
  if (j.status === 'queued') return `<div class="state"><span class="big">Đang chờ</span>${j.profile === 'auto' ? 'Sẽ chạy khi có tài khoản rảnh' : 'Chờ ' + esc(j.profile_name) + ' rảnh'}${j.stage_note && j.stage === 'queued' && /^(Đổi nick|Lỗi tạm)/.test(j.stage_note) ? `<div class="step">${esc(j.stage_note)}</div>` : ''}<div class="eta">${esc(S.meta && S.meta.paused ? 'hàng đợi đang tạm dừng' : Jobs.eta(j))}</div></div>`;
  // Lỗi: câu người đọc được lên trước (vì sao, credit, làm gì), câu kỹ thuật của Dola/app xuống dưới để soi và chép.
  if (j.status === 'error') return `<div class="state"><span class="big">Không tạo được</span><div class="why">${esc(Jobs.explain(j) || j.error || '')}</div>${Jobs.explain(j) && j.error ? `<div class="detail"><b>Chi tiết:</b> ${esc(j.error)}</div>` : ''}</div>`;
  if (j.status === 'interrupted') return `<div class="state"><span class="big">Gián đoạn</span><div class="why">${esc(Jobs.explain(j) || j.error || '')}</div>${Jobs.explain(j) && j.error ? `<div class="detail"><b>Chi tiết:</b> ${esc(j.error)}</div>` : ''}</div>`;
  if (j.status === 'done' && r.path && !r.playable) return `<div class="state"><span class="big">🏆 Xong</span>Video ở dạng HEVC, app không phát được. Bấm Tải xuống hoặc mở bằng VLC.</div>`;
  if (j.status === 'done' && j.dry_run) return `<div class="state"><span class="big">Chạy thử xong</span>Request đã được chặn tại máy, không tốn credit.</div>`;
  return `<div class="state"><span class="big">${j.status === 'done' ? '🏆 Xong' : esc(STATUS[j.status] || j.status)}</span>${esc(j.error || '')}</div>`;
}
function jobMeta(j) {
  const r = j.result || {}, chips = [];
  if (j.assigned_name) chips.push(`<span class="chip ok">${esc(j.assigned_name)}</span>`);
  else chips.push(`<span class="chip">${esc(j.profile_name)}</span>`);
  if (j.kind === 'generate') {
    if (j.mode === 'pro') chips.push(`<span class="chip" style="background:rgba(59,130,246,0.15);color:#3b82f6;border:1px solid rgba(59,130,246,0.3)"><b>🔄 PRO 10V</b></span>`);
    const is25 = j.model === '2.5', is30 = j.duration === 30;
    chips.push(`<span class="chip ${is25 ? 'ok' : ''}"><b>${is25 ? '⚡ 2.5 PRO' : 'Seedance ' + esc(j.model)}</b></span>`);
    chips.push(`<span class="chip ${is30 ? 'hot' : ''}"><b>${is30 ? '🔥 30s CỰC ĐẠI' : j.duration + ' giây'}</b>${j.ratio ? ' · ' + esc(j.ratio) : ''}</span>`);
  }
  (j.assets || []).forEach(t => chips.push(`<span class="chip tag">@${esc(t)}</span>`));
  if (j.images && j.images.length) chips.push(`<span>${j.images.length} ảnh ref</span>`);
  if (r.credits_left != null) chips.push(`<span>còn ${r.credits_left} credit</span>`);
  if (j.status === 'done' && r.path && !j.dry_run && !r.watermark_removed) chips.push(`<span>còn watermark</span>`);
  if (r.recovered) chips.push(`<span class="chip">lấy lại</span>`);
  if (j.status !== 'done' && r.credit_used) chips.push(`<span class="chip ${r.credit_used === 'no' ? 'ok' : r.credit_used === 'yes' ? 'bad' : 'warn'}">${{no: 'chưa trừ credit', yes: 'đã trừ credit, video có trên Dola', maybe: 'có thể đã trừ credit'}[r.credit_used]}</span>`);
  if (j.status === 'done' && j.finished) chips.push(`<span title="${esc(fmtTime(j.finished))}">${esc(relTime(j.finished))}</span>`);
  else chips.push(`<span title="${esc(fmtTime(j.created))}">${esc(relTime(j.created))}</span>`);
  return chips.join('');
}
function jobActions(j) {
  const r = j.result || {}, a = [];
  if (j.status === 'queued') a.push(`<button class="btn sm quiet" data-act="cancel">Huỷ</button>`);
  if (j.status === 'running') a.push(`<button class="btn sm danger" data-act="cancel" title="Dừng task tức thì, giải phóng luồng ngay">Dừng ngay</button>`);
  if (j.status === 'done' && r.path) {
    a.push(`<a class="btn sm" href="${withToken(`/api/jobs/${j.id}/video`)}" download="${esc((r.path || 'video.mp4').split(/[\\/]/).pop())}">Tải xuống</a>`);
    a.push(`<button class="btn sm quiet" data-act="folder">Thư mục</button>`);
    if (r.playable) a.push(`<button class="btn sm quiet" data-act="tolib" title="Chụp khung hình đầu làm ảnh cho một nhân vật trong kho">Lưu vào kho</button>`);
  }
  if (j.kind === 'generate' && j.assigned) {
    const shown = S.winShown.has(j.assigned);
    a.push(`<button class="btn sm ${shown ? 'quiet' : 'primary-ish'}" data-act="window" title="${shown ? 'Đóng cửa sổ Dola' : 'Mở trang Dola của tài khoản này trong một cửa sổ của app'}">${shown ? 'Đóng Dola' : 'Xem Dola'}</button>`);
  }
  if (j.kind === 'generate' && j.status !== 'queued') {
    a.push(`<button class="btn sm quiet" data-act="reuse" title="Đưa prompt và cài đặt này về khung soạn">Dùng lại</button>`);
    a.push(`<button class="btn sm quiet" data-act="copy" title="Chép prompt">Chép</button>`);
  }
  if (['error', 'interrupted'].includes(j.status) && j.error) {
    a.push(`<button class="btn sm quiet" data-act="copyerr" title="Chép câu lỗi kỹ thuật + nhật ký của job này để gửi hỗ trợ">Chép lỗi</button>`);
  }
  if (!['queued', 'running'].includes(j.status)) {
    if (j.kind === 'generate' && !r.path && !j.dry_run && r.conversation_url) {
      a.push(`<button class="btn sm ${r.recover_first ? 'primary-ish' : ''}" data-act="recover" title="Mở lại đúng cuộc trò chuyện này trên Dola: nếu Dola đã tạo xong thì tải video về. Không gửi yêu cầu mới, không tốn credit.">${r.recover_first ? '★ ' : ''}Lấy video từ Dola</button>`);
    }
    if (r.error_kind === 'duration_limit' && j.duration > 15) a.push(`<button class="btn sm primary-ish" data-act="retry15" title="Dola chỉ nhận 4–15 giây cho yêu cầu này: chạy lại đúng prompt với 15 giây">Chạy lại 15 giây</button>`);
    a.push(`<button class="btn sm quiet" data-act="retry">Chạy lại</button>`);
    a.push(`<button class="btn sm quiet danger" data-act="delete">Xoá</button>`);
  }
  return a.join('');
}
function makeTile(j) {
  const el = document.createElement('article');
  el.className = 'tile'; el.id = 'job-' + j.id;
  el.innerHTML = `<input type="checkbox" class="pick" title="Chọn để thao tác hàng loạt"><span class="seq"></span><div class="media"><div class="vid"></div><div class="st"></div></div>
    <div class="info"><p class="prompt" title="Bấm để xem đủ prompt"></p><div class="meta"></div></div>
    <details><summary>Nhật ký</summary><pre></pre></details>
    <div class="acts"></div>`;
  el.querySelector('.prompt').addEventListener('click', ev => ev.currentTarget.classList.toggle('open'));
  el.querySelector('.pick').addEventListener('change', ev => { if (ev.target.checked) S.selected.add(j.id); else S.selected.delete(j.id); Jobs.renderBulk(); el.classList.toggle('sel', ev.target.checked); });
  el.querySelector('.acts').addEventListener('click', ev => Jobs.onAct(ev, el, j));
  return el;
}
/** Xử lý một nút thao tác -- dùng chung cho thẻ lưới và hàng bảng (jobstable.js). */
Jobs.onAct = async function (ev, el, j) {
    const b = ev.target.closest('button[data-act]'); if (!b) return;
    const job = S.jobs.find(x => x.id === j.id) || j;
    const act = b.dataset.act; b.disabled = true;
    try {
      if (act === 'play') { Jobs.play(job); b.disabled = false; return; }
      if (act === 'view-detail') { Jobs.openDetail(job); b.disabled = false; return; }
      if (act === 'window') {
        // Mở/đóng cửa sổ Dola của nick trong một cửa sổ Electron của app.
        const show = !S.winShown.has(job.assigned);
        await api('POST', `/api/profiles/${job.assigned}/window`, {show});
        if (show) S.winShown.add(job.assigned); else S.winShown.delete(job.assigned);
        toast(show ? `Đang mở trang Dola của ${job.assigned_name || job.assigned}` : 'Đã đóng cửa sổ Dola');
        b.disabled = false; Jobs.render(S.jobs); return;
      }
      if (act === 'retry15') { await api('POST', `/api/jobs/${j.id}/retry`, {duration: 15}); toast('Đã thêm lại với 15 giây'); await App.refresh(); return; }
      if (act === 'cancel') {
        const isRun = job.status === 'running';
        b.textContent = 'Đang dừng…';
        await api('POST', `/api/jobs/${j.id}/cancel`);
        toast(isRun ? 'Đã dừng task tức thì và giải phóng luồng' : 'Đã huỷ');
      }
      else if (act === 'retry') {
        if (job.status === 'done' && !job.dry_run) {
          const ok = await confirmBox({title: 'Chạy lại video đã xong?', msg: 'Sẽ gửi một yêu cầu MỚI tới Dola và trừ credit như tạo video mới. Video cũ vẫn còn trong thư mục.', ok: 'Chạy lại'});
          if (!ok) { b.disabled = false; return; }
        }
        await api('POST', `/api/jobs/${j.id}/retry`); toast('Đã thêm lại vào hàng đợi');
      }
      else if (act === 'recover') { await api('POST', `/api/jobs/${j.id}/recover`); toast('Đang mở lại Dola để lấy video, không tốn credit'); }
      else if (act === 'delete') { await api('DELETE', `/api/jobs/${j.id}`); S.selected.delete(j.id); toast('Đã xoá khỏi danh sách, file vẫn còn trong thư mục'); }
      else if (act === 'folder') { const r = await api('POST', '/api/open-folder', {job_id: j.id}); toast('Đã mở ' + r.path); }
      else if (act === 'reuse') { Composer.reuse(job); b.disabled = false; return; }
      else if (act === 'copy') { await copyText(job.prompt, 'Đã chép prompt'); b.disabled = false; return; }
      else if (act === 'copyerr') {
        const r = job.result || {};
        const text = [`Job #${job.seq} (${job.id})`, `Lỗi: ${job.error || ''}`, r.error_hint ? `Giải thích: ${r.error_hint}` : '', r.conversation_url ? `Cuộc trò chuyện: ${r.conversation_url}` : '', '', 'Nhật ký:', ...job.log].filter(x => x !== null && x !== undefined).join('\n');
        await copyText(text, 'Đã chép lỗi và nhật ký'); b.disabled = false; return;
      }
      else if (act === 'tolib') { Jobs.saveFrame(el, job); b.disabled = false; return; }
      await App.refresh();
    } catch (err) { toast(err.message, 'err'); b.disabled = false; }
};
/** Chụp khung hình đang hiện của <video> → mở hộp asset với ảnh đó. */
Jobs.saveFrame = function (el, job) {
  const v = el.querySelector('video');
  if (!v || !v.videoWidth) return toast('Video chưa tải xong, bấm play rồi thử lại', 'err');
  try {
    const c = document.createElement('canvas');
    const k = Math.min(1, 1024 / Math.max(v.videoWidth, v.videoHeight));
    c.width = Math.round(v.videoWidth * k); c.height = Math.round(v.videoHeight * k);
    c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
    Assets.openNew({image: c.toDataURL('image/jpeg', 0.88), tag: (job.assets || [])[0] || ''});
  } catch (e) { toast('Không chụp được khung hình: ' + e.message, 'err'); }
};
function updateTile(el, j) {
  const r = j.result || {};
  el.dataset.status = j.status; el.dataset.kind = j.kind;
  el.classList.toggle('novideo', j.status === 'done' && !(r.path && r.playable));
  el.classList.toggle('sel', S.selected.has(j.id));
  el.querySelector('.pick').checked = S.selected.has(j.id);
  const seq = el.querySelector('.seq'); if (seq.textContent !== '#' + j.seq) seq.textContent = '#' + j.seq;
  const prompt = el.querySelector('.prompt');
  if (prompt.textContent !== j.prompt) prompt.textContent = j.prompt;
  const meta_ = el.querySelector('.meta'), mh = jobMeta(j);
  if (meta_.innerHTML !== mh) meta_.innerHTML = mh;
  const vid = el.querySelector('.vid'), st = el.querySelector('.st');
  const showVideo = j.status === 'done' && r.path && r.playable;
  if (showVideo) {
    if (!vid.firstChild) { const v = document.createElement('video'); v.controls = true; v.setAttribute('controlsList', 'nodownload nofullscreen noremoteplayback noplaybackrate'); v.disablePictureInPicture = true; v.disableRemotePlayback = true; v.loop = true; v.oncontextmenu = ev => { ev.preventDefault(); return false; }; v.preload = 'metadata'; v.src = withToken(`/api/jobs/${j.id}/video`); vid.appendChild(v); }
    st.innerHTML = '';
  } else {
    if (vid.firstChild) vid.innerHTML = '';
    const sh = stateBlock(j); if (st.innerHTML !== sh) st.innerHTML = sh;
  }
  const pre = el.querySelector('pre'), logText = j.log.join('\n');
  if (pre.textContent !== logText) pre.textContent = logText;
  el.querySelector('details').hidden = !j.log.length;
  const acts = jobActions(j);
  if (el.querySelector('.acts').innerHTML !== acts) el.querySelector('.acts').innerHTML = acts;
}

// ------------------------------------------------------------ lọc + danh sách
const inTab = (j, f) => f === 'all' || (f === 'running' && (j.status === 'running' || j.status === 'queued')) || (f === 'done' && j.status === 'done') || (f === 'error' && ['error', 'cancelled', 'interrupted'].includes(j.status));
function renderTabs(jobs) {
  const counts = {all: jobs.length, running: jobs.filter(j => inTab(j, 'running')).length, done: jobs.filter(j => inTab(j, 'done')).length, error: jobs.filter(j => inTab(j, 'error')).length};
  const html = [['all', 'Tất cả'], ['running', 'Đang tạo'], ['done', 'Xong'], ['error', 'Lỗi']]
    .map(([k, l]) => `<button data-f="${k}" class="${S.filter === k ? 'on' : ''}">${l}<b>${counts[k]}</b></button>`).join('');
  if ($('#tabs').innerHTML !== html) {
    $('#tabs').innerHTML = html;
    $('#tabs').querySelectorAll('button').forEach(b => b.addEventListener('click', () => { S.filter = b.dataset.f; Jobs.render(S.jobs); }));
  }
}
Jobs.shown = function (jobs) {
  const q = S.q.toLowerCase();
  let list = jobs.filter(j => inTab(j, S.filter) && (!S.accf || j.assigned === S.accf || j.profile === S.accf)
    && (!q || j.prompt.toLowerCase().includes(q) || ('#' + j.seq).includes(q) || (j.assets || []).some(t => ('@' + t).includes(q))));
  if (S.sort === 'old') list = [...list].reverse();
  else if (S.sort === 'err') list = [...list].sort((a, b) => (inTab(b, 'error') ? 1 : 0) - (inTab(a, 'error') ? 1 : 0));
  return list;
};
Jobs.render = function (jobs) {
  renderTabs(jobs);
  $('#n-video').textContent = jobs.length || '';
  const box = $('#jobs');
  const running = jobs.filter(j => j.status === 'running').length, queued = jobs.filter(j => j.status === 'queued').length;
  $('#jcount').textContent = running || queued ? `${running} đang tạo, ${queued} đang chờ` : '';
  const shown = Jobs.shown(jobs);
  // Âm báo khi một job tạo video vừa đổi sang xong / lỗi (so với lần poll trước).
  const notify = S.meta && S.meta.settings && S.meta.settings.notify_sound;
  for (const j of jobs) {
    const prev = Jobs.prevStatus.get(j.id);
    if (prev && prev !== j.status && j.kind === 'generate') {
      if (j.status === 'done') {
        if (notify) beep('ok');
        toast(`🎉 Video #${j.seq} đã tạo xong!`, 'ok');
      } else if (j.status === 'error') {
        if (notify) beep('err');
        toast(`❌ Video #${j.seq} lỗi: ${j.error || ''}`, 'err');
      }
    }
    Jobs.prevStatus.set(j.id, j.status);
  }
  for (const id of [...S.selected]) if (!jobs.some(j => j.id === id)) S.selected.delete(id);
  if (Jobs.view() === 'table') {
    Jobs.renderTable(box, shown);
  } else {
    if (!box.classList.contains('grid')) { box.innerHTML = ''; box.className = 'grid'; }
    const seen = new Set();
    shown.forEach((j, i) => {
      seen.add('job-' + j.id);
      let el = document.getElementById('job-' + j.id);
      if (!el) el = makeTile(j);
      if (box.children[i] !== el) box.insertBefore(el, box.children[i] || null);
      updateTile(el, j);
    });
    [...box.children].forEach(el => { if (!seen.has(el.id)) el.remove(); });
  }
  if (!shown.length) {
    box.className = 'grid';
    box.innerHTML = jobs.length
      ? `<div class="empty"><div class="frame"></div><div><h3>Không có video nào khớp</h3><p>Đổi bộ lọc, xoá từ khoá tìm, hoặc chọn "Tất cả".</p></div></div>`
      : `<div class="empty"><div class="frame"></div><div><h3>Chưa có video nào</h3><p>Viết prompt ở khung bên trái (mỗi dòng một video), chọn model và độ dài, rồi bấm Tạo video. Mỗi video sẽ hiện ở đây và phát được ngay khi xong.</p><p>Muốn thử đường ống trước, tích "Chạy thử" để không tốn credit.</p></div></div>`;
  }
  $('#jobtools').hidden = !jobs.length;
  Jobs.renderBulk();
};
$('#q').addEventListener('input', () => { S.q = $('#q').value.trim(); Jobs.render(S.jobs); });
$('#accf').addEventListener('change', () => { S.accf = $('#accf').value; Jobs.render(S.jobs); });
$('#sortsel').addEventListener('change', () => { S.sort = $('#sortsel').value; Jobs.render(S.jobs); });

// ------------------------------------------------------------ chọn nhiều + hàng loạt
Jobs.renderBulk = function () {
  const n = S.selected.size;
  $('#bulkbar').hidden = !n;
  $('#bulkn').textContent = `${n} video đã chọn`;
  $('#selall').textContent = n && n >= Jobs.shown(S.jobs).length ? 'Bỏ chọn tất cả' : 'Chọn tất cả';
};
$('#selall').addEventListener('click', () => {
  const shown = Jobs.shown(S.jobs);
  if (S.selected.size >= shown.length && shown.length) S.selected.clear(); else shown.forEach(j => S.selected.add(j.id));
  Jobs.render(S.jobs);
});
$('#bulkclear').addEventListener('click', () => { S.selected.clear(); Jobs.render(S.jobs); });
async function bulk(action, ids, confirmOpts) {
  if (confirmOpts && !(await confirmBox(confirmOpts))) return;
  try {
    const r = await api('POST', '/api/jobs/bulk', {action, ids});
    const verb = {retry: 'chạy lại', delete: 'xoá', cancel: 'huỷ', retry_failed: 'chạy lại', delete_done: 'dọn', cancel_queued: 'huỷ'}[action];
    toast(r.ok ? `Đã ${verb} ${r.ok} video${r.skipped ? `, bỏ qua ${r.skipped} (${r.errors[0] || 'không áp dụng được'})` : ''}` : `Không có video nào để ${verb}`, r.ok ? 'ok' : 'err');
    if (action.startsWith('delete')) S.selected.clear();
    await App.refresh();
  } catch (err) { toast(err.message, 'err'); await App.refresh(); }
}
$$('#bulkbar [data-bulk]').forEach(b => b.addEventListener('click', () => {
  const ids = [...S.selected], n = ids.length, act = b.dataset.bulk;
  const done = ids.filter(id => { const j = S.jobs.find(x => x.id === id); return j && j.status === 'done' && !j.dry_run; }).length;
  bulk(act, ids, act === 'delete' ? {title: `Xoá ${n} video khỏi danh sách?`, msg: 'File trong thư mục vẫn còn nguyên. Video đang chạy sẽ bị bỏ qua.', ok: 'Xoá', danger: true}
    : act === 'retry' && done ? {title: `Chạy lại ${n} video?`, msg: `${done} video trong số này đã xong: chạy lại sẽ gửi yêu cầu mới và trừ credit như tạo mới.`, ok: 'Chạy lại'} : null);
}));
$('#retryfailed').addEventListener('click', () => {
  const n = S.jobs.filter(j => j.kind === 'generate' && inTab(j, 'error')).length;
  if (!n) return toast('Không có video lỗi nào');
  bulk('retry_failed', undefined, {title: `Chạy lại ${n} video lỗi?`, msg: 'Mỗi video là một yêu cầu mới tới Dola (trừ credit khi Dola render). Video có nút «Lấy video từ Dola» nên bấm nút đó trước, không tốn credit.', ok: 'Chạy lại tất cả'});
});
$('#cleandone').addEventListener('click', () => {
  const n = S.jobs.filter(j => j.status === 'done').length;
  if (!n) return toast('Không có job nào đã xong');
  bulk('delete_done', undefined, {title: `Dọn ${n} job đã xong khỏi danh sách?`, msg: 'Chỉ bỏ khỏi danh sách trong app. File video trong thư mục vẫn còn nguyên.', ok: 'Dọn', danger: true});
});
$('#cancelqueued').addEventListener('click', () => {
  const n = S.jobs.filter(j => j.status === 'queued').length;
  if (!n) return toast('Hàng đợi đang trống');
  bulk('cancel_queued', undefined, {title: `Huỷ ${n} video đang chờ?`, msg: 'Video đang chạy vẫn chạy nốt. Video đã huỷ chạy lại được sau.', ok: 'Huỷ hàng đợi', danger: true});
});
