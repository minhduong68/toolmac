/* Tab Video: KPI + biểu đồ 7 ngày, lọc/tìm/sắp xếp, chọn nhiều, thẻ video có ETA và giải thích lỗi. */
'use strict';
const Jobs = {prevStatus: new Map(), lastAccJson: ''};
window.Jobs = Jobs;

// ------------------------------------------------------------ KPI + biểu đồ (Studio Status Ribbon)
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
  const readyAccounts = (S.profiles || []).filter(Accounts.ready).length;
  const rateStr = st.success_rate == null ? '—' : st.success_rate + '%';
  const isRunning = (st.running || 0) > 0;

  const html = `
    <div class="ribbon-strip">
      <div class="ribbon-pill ${isRunning ? 'pulse-cyan' : ''}" title="Số video đang tạo song song trên các tài khoản">
        <svg class="pill-ico cyan" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
        <span class="pill-num cyan">${st.running}</span>
        <span class="pill-lbl">Đang tạo</span>
      </div>
      <div class="ribbon-pill" title="Số video đang xếp hàng đợi lượt">
        <svg class="pill-ico amber" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        <span class="pill-num amber">${st.queued}</span>
        <span class="pill-lbl">Hàng đợi</span>
      </div>
      <div class="ribbon-pill" title="Số video đã tạo thành công">
        <svg class="pill-ico emerald" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        <span class="pill-num emerald">${st.done}</span>
        <span class="pill-lbl">Đã xong</span>
      </div>
      <div class="ribbon-pill" title="Số video gặp lỗi hoặc bị gián đoạn">
        <svg class="pill-ico rose" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        <span class="pill-num rose">${st.error}</span>
        <span class="pill-lbl">Lỗi</span>
      </div>
      <div class="ribbon-pill" title="Số tài khoản Dola đã sẵn sàng">
        <svg class="pill-ico blue" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        <span class="pill-num blue">${readyAccounts}</span>
        <span class="pill-lbl">Tài khoản</span>
      </div>
      <div class="ribbon-pill-divider"></div>
      <div class="ribbon-pill" title="Tỉ lệ hoàn thành thành công">
        <span class="pill-lbl">Tỉ lệ:</span>
        <span class="pill-num violet">${rateStr}</span>
      </div>
      <div class="ribbon-pill" title="Tổng video tạo trong ngày hôm nay">
        <span class="pill-lbl">Hôm nay:</span>
        <span class="pill-num white">${st.videos_today}</span>
        <span class="pill-sub">(${st.credits_today}c)</span>
      </div>
      <button type="button" class="ribbon-pill btn-chart-popover" id="btn-toggle-7days" title="Bấm để xem nhanh biểu đồ hiệu suất 7 ngày">
        <svg class="pill-ico" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
        <span>7 ngày</span>
      </button>
      <div class="chart-popover-dropdown" id="popover-7days" hidden>
        <div class="chart-popover-head">
          <span>Biểu đồ hiệu suất 7 ngày qua</span>
          <button type="button" class="chart-popover-close" id="btn-close-popover-7days">✕</button>
        </div>
        <div class="bars">${cols}</div>
        <div class="chartx">${xs}</div>
        <div class="legend"><span><i style="background:var(--pro-emerald)"></i> xong</span><span><i style="background:var(--pro-rose)"></i> lỗi</span></div>
      </div>
    </div>
  `;
  if ($('#kpi').innerHTML !== html) {
    $('#kpi').innerHTML = html;
    $('#btn-toggle-7days')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const pop = $('#popover-7days');
      if (pop) pop.hidden = !pop.hidden;
    });
    $('#btn-close-popover-7days')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const pop = $('#popover-7days');
      if (pop) pop.hidden = true;
    });
  }
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
  if (e.includes('máy chủ từ chối')) return 'Dola không nhận yêu cầu này (nội dung hoặc ảnh bị chặn). Chưa trừ credit. Sửa prompt/ảnh rồi Chạy lại.';
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
  if (j.status === 'draft') return `<div class="state"><span class="big">📝 Bản nháp</span>Kịch bản sẵn sàng. Bấm «Chạy» để đưa vào hàng đợi tạo video.</div>`;
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
  if (j.status === 'draft') {
    return `<button class="btn sm primary" data-act="draft_run">▶ Chạy</button>
            <button class="btn sm quiet" data-act="draft_dup">📋 Nhân bản</button>
            <button class="btn sm quiet danger" data-act="draft_del">Xoá</button>`;
  }
  const r = j.result || {}, a = [];
  if (j.status === 'queued') a.push(`<button class="btn sm quiet" data-act="cancel">Huỷ</button>`);
  if (j.status === 'running') {
    a.push(`<button class="btn sm danger" data-act="cancel" title="Dừng task tức thì, giải phóng luồng ngay">Dừng ngay</button>`);
    if (j.kind === 'generate' && !r.path && (convUrl || targetProf)) {
      a.push(`<button class="btn sm btn-rescan-video" data-act="rescan_video" title="Quét ngay trang Dola của task này: nếu Dola đã trả video sẽ tự động tải về và hoàn thành task ngay">🔍 Quét lại trang</button>`);
    }
  }
  if (j.status === 'done' && r.path) {
    a.push(`<a class="btn sm" href="${withToken(`/api/jobs/${j.id}/video`)}" download="${esc((r.path || 'video.mp4').split(/[\\/]/).pop())}">Tải xuống</a>`);
    a.push(`<button class="btn sm quiet" data-act="folder">Thư mục</button>`);
    if (r.playable) a.push(`<button class="btn sm quiet" data-act="tolib" title="Chụp khung hình đầu làm ảnh cho một nhân vật trong kho">Lưu vào kho</button>`);
  }
  const targetProf = j.assigned || (j.tried && j.tried.length ? j.tried[j.tried.length - 1] : null) || (j.profile !== 'auto' ? j.profile : null) || (S.profiles && S.profiles.find(p => p.status === 'ready' || p.is_logged_in)?.id) || (S.profiles && S.profiles[0]?.id);
  const convUrl = (r && r.conversation_url) || j.conversation_url;
  if (j.kind === 'generate' && (targetProf || convUrl)) {
    a.push(`<button class="btn sm primary-ish" data-act="window" title="${convUrl ? 'Xem Dola: mở thẳng cuộc trò chuyện của task này' : 'Mở trang Dola của tài khoản này'}">Xem Dola</button>`);
  }
  if (j.kind === 'generate' && j.status !== 'queued') {
    a.push(`<button class="btn sm quiet" data-act="reuse" title="Đưa prompt và cài đặt này về khung soạn">Dùng lại</button>`);
    a.push(`<button class="btn sm quiet" data-act="copy" title="Chép prompt">Chép</button>`);
  }
  if (['error', 'interrupted'].includes(j.status) && j.error) {
    a.push(`<button class="btn sm quiet" data-act="copyerr" title="Chép câu lỗi kỹ thuật + nhật ký của job này để gửi hỗ trợ">Chép lỗi</button>`);
  }
  if (!['queued', 'running'].includes(j.status)) {
    if (j.kind === 'generate' && !r.path && !j.dry_run && (convUrl || targetProf)) {
      a.push(`<button class="btn sm btn-rescan-video ${r.recover_first ? 'primary-ish' : ''}" data-act="rescan_video" title="Quét lại trang Dola của task này: nếu có video sẽ tự động tải về và xóa logo ngay, không tốn credit">🔍 Quét lại trang</button>`);
    }
    if (r.error_kind === 'duration_limit' && j.duration > 15) a.push(`<button class="btn sm primary-ish" data-act="retry15" title="Dola chỉ nhận 4–15 giây cho yêu cầu này: chạy lại đúng prompt với 15 giây">Chạy lại 15 giây</button>`);
    a.push(`<button class="btn sm primary-ish" data-act="edit_retry" title="Sửa lại prompt, ảnh hoặc thời lượng rồi gửi lại">✏️ Sửa & Gửi lại</button>`);
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
Jobs.delDraft = function (j) {
  if (typeof Composer === 'undefined') return;
  const idx = (j.seq || 1) - 1;
  if (!Composer.multiCards || !Composer.multiCards.length) {
    Composer.syncMultiCardsFromText();
  }
  if (Composer.multiCards && Composer.multiCards.length > idx) {
    Composer.multiCards.splice(idx, 1);
    Composer.syncTextFromMultiCards();
    Composer.renderPromptPreview();
    toast(`Đã xoá cảnh #${j.seq}`);
    return;
  }
  const p = $('#p');
  if (p && p.value.trim()) {
    const lines = p.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    if (lines.length > idx) {
      lines.splice(idx, 1);
      p.value = lines.join('\n');
      if (typeof Composer.onInput === 'function') Composer.onInput();
      toast(`Đã xoá cảnh #${j.seq}`);
    }
  }
};

Jobs.dupDraft = function (j) {
  if (typeof Composer === 'undefined') return;
  const idx = (j.seq || 1) - 1;
  if (!Composer.multiCards || !Composer.multiCards.length) {
    Composer.syncMultiCardsFromText();
  }
  if (Composer.multiCards && Composer.multiCards[idx]) {
    const orig = Composer.multiCards[idx];
    const cloned = {
      id: Composer.generatePromptId ? Composer.generatePromptId() : ('c_' + Date.now()),
      prompt: orig.prompt,
      images: (orig.images || []).map(im => ({ ...im }))
    };
    Composer.multiCards.splice(idx + 1, 0, cloned);
    Composer.syncTextFromMultiCards();
    Composer.renderPromptPreview();
    toast(`Đã nhân bản cảnh #${j.seq}`);
    return;
  }
  const p = $('#p');
  if (p && p.value.trim()) {
    const lines = p.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    if (lines[idx]) {
      lines.splice(idx + 1, 0, lines[idx]);
      p.value = lines.join('\n');
      if (typeof Composer.onInput === 'function') Composer.onInput();
      toast(`Đã nhân bản cảnh #${j.seq}`);
    }
  }
};

Jobs.delDraftImage = function (j, imgIdx, tr) {
  if (typeof Composer === 'undefined') return;
  const idx = (j.seq || 1) - 1;
  if (!Composer.multiCards || !Composer.multiCards.length) {
    Composer.syncMultiCardsFromText();
  }
  let card = (Composer.multiCards || []).find(c => c.id === j.id) || (Composer.multiCards && Composer.multiCards[idx]);
  if (card && card.images && card.images[imgIdx] !== undefined) {
    card.images.splice(imgIdx, 1);
    if (j && j.images) j.images = card.images;
  } else if (j && j.images && j.images[imgIdx] !== undefined) {
    j.images.splice(imgIdx, 1);
  }
  if (tr && typeof updateRow === 'function') {
    updateRow(tr, j);
  }
  Composer.renderPromptPreview();
  toast('Đã xoá ảnh tham chiếu');
};

Jobs.copyDraftImagesToAll = function (j) {
  if (typeof Composer === 'undefined') return;
  const idx = (j.seq || 1) - 1;
  if (!Composer.multiCards || !Composer.multiCards.length) {
    Composer.syncMultiCardsFromText();
  }
  let sourceCard = (Composer.multiCards || []).find(c => c.id === j.id) || (Composer.multiCards && Composer.multiCards[idx]);
  const imgs = (sourceCard && sourceCard.images && sourceCard.images.length) ? sourceCard.images : (j.images || []);
  if (!imgs.length) {
    toast('Cảnh này chưa có ảnh tham chiếu để sao chép', 'warn');
    return;
  }
  (Composer.multiCards || []).forEach(c => {
    c.images = imgs.map(im => ({ ...im }));
  });
  (S.draftBatch || []).forEach(d => {
    d.images = imgs.map(im => ({ ...im }));
  });
  Composer.renderPromptPreview();
  toast(`Đã sao chép ${imgs.length} ảnh của cảnh #${j.seq || 1} cho tất cả các cảnh!`);
};

Jobs.addImagesToDraft = async function (j, files, tr) {
  if (!files || !files.length || typeof Composer === 'undefined') return;
  const imgFiles = [...files].filter(f => f.type.startsWith('image/') || /\.(jpe?g|png|webp|bmp|gif|jfif)$/i.test(f.name));
  if (!imgFiles.length) {
    toast('Chỉ chấp nhận tệp định dạng hình ảnh (JPG, PNG, WebP...)', 'err');
    return;
  }
  toast(`Đang tải lên ${imgFiles.length} ảnh tham chiếu…`);
  try {
    if (!Composer.multiCards || !Composer.multiCards.length) {
      Composer.syncMultiCardsFromText();
    }
    const cardIdx = Math.max(0, (j.seq || 1) - 1);
    let card = (Composer.multiCards || []).find(c => c.id === j.id) || (Composer.multiCards && Composer.multiCards[cardIdx]);
    if (!card && Composer.multiCards) {
      while (Composer.multiCards.length <= cardIdx) {
        Composer.multiCards.push({
          id: Composer.generatePromptId ? Composer.generatePromptId() : ('p_' + Math.random().toString(36).slice(2, 8)),
          prompt: j.prompt || '',
          images: []
        });
      }
      card = Composer.multiCards[cardIdx];
    }
    if (!card) {
      card = { id: j.id || ('p_' + Math.random().toString(36).slice(2, 8)), prompt: j.prompt || '', images: [] };
    }

    card.images = card.images || [];
    for (const f of imgFiles) {
      const b64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = rej;
        r.readAsDataURL(f);
      });
      const up = await api('POST', '/api/upload', { name: f.name || 'image.jpg', data_b64: b64 });
      const imgObj = { id: up.id, name: f.name || 'image.jpg', preview: b64 };
      card.images.push(imgObj);
    }
    if (j) {
      j.images = card.images;
      j.card = card;
    }
    if (cardIdx === 0 || !Composer.multiCards || Composer.multiCards.length <= 1) {
      Composer.images = [...card.images];
      if (typeof Composer.renderThumbs === 'function') Composer.renderThumbs();
    }
    if (typeof Composer.renderMultiCards === 'function') {
      Composer.renderMultiCards();
    }
    const row = tr || document.getElementById('job-' + j.id);
    if (row && typeof updateRow === 'function') {
      updateRow(row, j);
    }
    if (typeof Composer.renderPromptPreview === 'function') {
      Composer.renderPromptPreview();
    } else if (typeof Jobs.renderTable === 'function') {
      Jobs.render(S.jobs || []);
    }
    toast(`Đã thêm ${imgFiles.length} ảnh tham chiếu vào cảnh #${j.seq || 1}`);
  } catch (err) {
    toast('Lỗi tải ảnh tham chiếu: ' + err.message, 'err');
  }
};

Jobs.openDraftImagePicker = function (j, tr) {
  let fileInput = document.getElementById('draft_row_img_input');
  if (!fileInput) {
    fileInput = document.createElement('input');
    fileInput.id = 'draft_row_img_input';
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;
    fileInput.hidden = true;
    document.body.appendChild(fileInput);
  }
  fileInput.value = '';
  fileInput.onchange = async (e) => {
    const files = Array.from(e.target.files || []);
    fileInput.value = '';
    if (files && files.length) {
      const cur = (S.draftBatch && S.draftBatch.find(d => d.id === j.id)) || j;
      await Jobs.addImagesToDraft(cur, files, tr);
    }
  };
  fileInput.click();
};

Jobs.openQueuedImagePicker = function (j, tr) {
  let fileInput = document.getElementById('queued_row_img_input');
  if (!fileInput) {
    fileInput = document.createElement('input');
    fileInput.id = 'queued_row_img_input';
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;
    fileInput.hidden = true;
    document.body.appendChild(fileInput);
  }
  fileInput.value = '';
  fileInput.onchange = async (e) => {
    const files = Array.from(e.target.files || []);
    fileInput.value = '';
    if (files && files.length) {
      const cur = (S.jobs && S.jobs.find(x => x.id === j.id)) || j;
      await Jobs.addImagesToQueued(cur, files, tr);
    }
  };
  fileInput.click();
};

Jobs.addImagesToQueued = async function (j, files, tr) {
  if (!files || !files.length) return;
  const imgFiles = [...files].filter(f => f.type.startsWith('image/') || /\.(jpe?g|png|webp|bmp|gif|jfif)$/i.test(f.name));
  if (!imgFiles.length) {
    toast('Chỉ chấp nhận tệp hình ảnh (JPG, PNG, WebP...)', 'err');
    return;
  }
  toast(`Đang tải lên ${imgFiles.length} ảnh tham chiếu cho job #${j.seq || j.id}…`);
  try {
    j.images = j.images || [];
    for (const f of imgFiles) {
      const b64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = rej;
        r.readAsDataURL(f);
      });
      const up = await api('POST', '/api/upload', { name: f.name || 'image.jpg', data_b64: b64 });
      j.images.push({ id: up.id, name: f.name || 'image.jpg', preview: b64 });
    }
    await api('PATCH', `/api/jobs/${j.id}/images`, { images: j.images });
    if (tr && typeof updateRow === 'function') {
      updateRow(tr, j);
    } else {
      Jobs.renderTable();
    }
    toast(`Đã cập nhật ${imgFiles.length} ảnh cho job #${j.seq || j.id}`);
  } catch (err) {
    toast('Lỗi cập nhật ảnh: ' + err.message, 'err');
  }
};

Jobs.delQueuedImage = async function (j, imgIdx, tr) {
  if (!j.images || j.images[imgIdx] === undefined) return;
  j.images.splice(imgIdx, 1);
  try {
    await api('PATCH', `/api/jobs/${j.id}/images`, { images: j.images });
    if (tr && typeof updateRow === 'function') {
      updateRow(tr, j);
    } else {
      Jobs.renderTable();
    }
    toast('Đã xoá ảnh tham chiếu');
  } catch (err) {
    toast('Lỗi xoá ảnh: ' + err.message, 'err');
  }
};

Jobs.runSingleDraft = async function (j) {
  const isFaceChecked = !!$('#face_image')?.checked || !!$('#face_image_multi')?.checked || !!$('#face_image_pro')?.checked;
  let text = (Composer.wrapDirectorPrompt ? Composer.wrapDirectorPrompt(j.prompt) : j.prompt).trim();
  const card = (Composer.multiCards || []).find(c => c.id === j.id) || (Composer.multiCards || [])[(j.seq || 1) - 1];
  const imgs = (j.images && j.images.length) ? j.images : (card && card.images ? card.images : []);
  const hasImages = imgs.length > 0;
  if (isFaceChecked && hasImages) {
    if (!text.includes(FACE_DISCLAIMER)) text = text + '\n\n' + FACE_DISCLAIMER;
  }
  const imageIds = imgs.map(im => typeof im === 'object' ? im.id : im).filter(Boolean);
  try {
    const r = await api('POST', '/api/jobs', {
      prompts: [text],
      items: [{ prompt: text, image_ids: imageIds }],
      model: j.model || Composer.sel.model || '2.5',
      duration: j.duration || Composer.sel.duration || 30,
      ratio: j.ratio || Composer.sel.ratio || '9:16',
      profile: j.profile && j.profile !== 'auto' ? j.profile : undefined,
      copies: 1,
      image_ids: imageIds,
      auto_retry_acc: true
    });
    toast(`Đã gửi cảnh #${j.seq} vào hàng đợi!`);
    Jobs.delDraft(j);
    await App.refresh();
  } catch (e) {
    toast('Lỗi chạy cảnh: ' + e.message, 'err');
  }
};

/** Xử lý một nút thao tác -- dùng chung cho thẻ lưới và hàng bảng (jobstable.js). */
Jobs.onAct = async function (ev, el, j) {
    const b = ev.target.closest('button[data-act]'); if (!b) return;
    const job = S.jobs.find(x => x.id === j.id) || j;
    const act = b.dataset.act; b.disabled = true;
    try {
      if (act === 'draft_run') {
        b.disabled = false;
        await Jobs.runSingleDraft(j);
        return;
      }
      if (act === 'draft_dup') {
        b.disabled = false;
        Jobs.dupDraft(j);
        return;
      }
      if (act === 'draft_del') {
        b.disabled = false;
        Jobs.delDraft(j);
        return;
      }
      if (act === 'draft_add_img') {
        b.disabled = false;
        Jobs.openDraftImagePicker(j, el);
        return;
      }
      if (act === 'draft_del_img') {
        b.disabled = false;
        const imgIdx = +b.dataset.imgIdx;
        Jobs.delDraftImage(j, imgIdx, el);
        return;
      }
      if (act === 'queued_add_img') {
        b.disabled = false;
        Jobs.openQueuedImagePicker(j, el);
        return;
      }
      if (act === 'queued_del_img') {
        b.disabled = false;
        const imgIdx = +b.dataset.imgIdx;
        await Jobs.delQueuedImage(j, imgIdx, el);
        return;
      }
      if (act === 'draft_copy_imgs_to_all') {
        b.disabled = false;
        Jobs.copyDraftImagesToAll(j);
        return;
      }
      if (act === 'play') { Jobs.play(job); b.disabled = false; return; }
      if (act === 'to-gallery') {
        b.disabled = false;
        const pb = $('#playbox');
        if (pb && !pb.hidden && typeof closeModal === 'function') closeModal(pb);
        App.showTab('gallery');
        return;
      }
      if (act === 'view-prompt') { (typeof Jobs.openPrompt === 'function' ? Jobs.openPrompt(job) : Jobs.openDetail(job)); b.disabled = false; return; }
      if (act === 'view-detail') { Jobs.openDetail(job); b.disabled = false; return; }
      if (act === 'window') {
        const targetProfile = job.assigned || (job.tried && job.tried.length ? job.tried[job.tried.length - 1] : null) || (job.profile !== 'auto' ? job.profile : null) || (S.profiles && S.profiles.find(p => p.status === 'ready' || p.is_logged_in)?.id) || (S.profiles && S.profiles[0]?.id);
        if (!targetProfile) {
          toast('Không tìm thấy tài khoản để mở cửa sổ Dola', 'err');
          b.disabled = false;
          return;
        }
        const targetUrl = (job.result && job.result.conversation_url) || job.conversation_url || null;
        await api('POST', `/api/profiles/${targetProfile}/window`, {show: true, mode: 'browser', url: targetUrl});
        if (targetProfile) S.winShown.add(targetProfile);
        const accObj = (S.profiles || []).find(p => p.id === targetProfile);
        const accName = accObj?.name || targetProfile;
        toast(targetUrl ? `Đang mở cuộc trò chuyện của task trên «${accName}»` : `Đang mở trang Dola của «${accName}»`);
        b.disabled = false; Jobs.render(S.jobs); return;
      }
      if (act === 'edit_retry') {
        b.disabled = false;
        Jobs.openEditRetry(job);
        return;
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
      else if (act === 'rescan_video' || act === 'recover') {
        b.disabled = true;
        const oldHtml = b.innerHTML;
        b.innerHTML = '<span>⏳ Đang quét…</span>';
        try {
          toast('Đang quét lại trang Dola của task để tìm video…');
          const res = await api('POST', `/api/jobs/${j.id}/rescan-video`);
          if (res && res.found) {
            toast('🎉 Đã quét được video từ Dola và tự động tải về máy thành công!', 'ok');
          } else {
            toast(res?.message || 'Chưa tìm thấy video trên trang Dola của task này. Hãy đợi Dola dựng xong rồi bấm lại.', 'warn');
          }
        } catch (err) {
          toast(err?.message || 'Lỗi quét lại trang', 'err');
        } finally {
          b.disabled = false;
          b.innerHTML = oldHtml;
          await App.refresh();
        }
        return;
      }
      else if (act === 'delete') { await api('DELETE', `/api/jobs/${j.id}`); S.selected.delete(j.id); toast('Đã xoá khỏi danh sách, file vẫn còn trong thư mục'); }
      else if (act === 'folder') { const r = await api('POST', '/api/open-folder', {job_id: j.id}); toast('Đã mở ' + r.path); }
      else if (act === 'reuse') { Composer.reuse(job); b.disabled = false; return; }
      else if (act === 'copy') { await copyText(job.prompt, 'Đã chép prompt'); b.disabled = false; return; }
      else if (act === 'copyerr') {
        if (typeof Jobs.copySanitizedError === 'function') {
          await Jobs.copySanitizedError(job);
        } else {
          const r = job.result || {};
          const text = [`Job #${job.seq} (${job.id})`, `Lỗi: ${job.error || ''}`].join('\n');
          await copyText(text, 'Đã chép lỗi');
        }
        b.disabled = false;
        return;
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
const inTab = (j, f) => f === 'all' || (f === 'running' && j.status === 'running') || (f === 'queued' && j.status === 'queued') || (f === 'done' && j.status === 'done') || (f === 'error' && ['error', 'cancelled', 'interrupted'].includes(j.status));

Jobs.getDraftPrompts = function () {
  if (typeof Composer === 'undefined') return [];
  let rawList = [];
  const p = $('#p');
  if (p && p.value.trim()) {
    rawList = p.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  } else if (Composer.mode === 'multi') {
    rawList = (Composer.promptsMulti ? Composer.promptsMulti() : []);
  } else if (Composer.mode === 'pro') {
    rawList = (Composer.promptsPro ? Composer.promptsPro() : []);
  } else if (Composer.mode === 'single') {
    rawList = (Composer.promptsSingle ? Composer.promptsSingle() : []);
  }
  const readyAccs = Math.max(1, (S.profiles || []).filter(Accounts.ready).length);
  const duration = Number($('#duration_sel')?.value) || (Composer.sel && Composer.sel.duration) || 30;
  const model = '2.5';
  const ratio = (Composer.sel && Composer.sel.ratio) || '9:16';
  const baseSec = duration === 30 ? 210 : duration === 15 ? 120 : duration === 10 ? 90 : 60;

  if (!Composer.multiCards || Composer.multiCards.length !== rawList.length) {
    Composer.syncMultiCardsFromText();
  }

  return rawList.slice(0, 500).map((promptText, idx) => {
    const batch = Math.floor(idx / readyAccs);
    const estSeconds = (batch + 1) * baseSec;
    const card = (Composer.multiCards && Composer.multiCards[idx]) ? Composer.multiCards[idx] : null;
    const cardId = card ? card.id : ('draft_' + (idx + 1));
    const images = (card && card.images && card.images.length) ? card.images : (Composer.images && Composer.images.length ? Composer.images : []);
    return {
      seq: idx + 1,
      id: cardId,
      card,
      images,
      prompt: promptText,
      model,
      duration,
      ratio,
      estSeconds,
      batch: batch + 1,
      status: 'draft',
      kind: 'generate'
    };
  });
};

Jobs.runCurrentMode = function () {
  const btnStartNow = $('#btn_start_now');
  if (btnStartNow) {
    btnStartNow.click();
  } else if (typeof Composer !== 'undefined' && Composer.mode === 'multi') {
    $('#go_multi')?.click();
  } else if (typeof Composer !== 'undefined' && Composer.mode === 'pro') {
    $('#go_pro')?.click();
  } else {
    $('#go')?.click();
  }
  S.filter = 'all';
  setTimeout(() => Jobs.render(S.jobs || []), 150);
};

Jobs.renderPromptPreviewTable = function (box, drafts) {
  box.className = 'table prompt-preview-view';
  if (!drafts.length) {
    box.innerHTML = `
      <div class="empty">
        <div class="frame"></div>
        <div>
          <h3>Chưa có prompt nào trong khung soạn</h3>
          <p>Nhập 1 hoặc nhiều prompt (mỗi dòng một video) ở thanh bên trái để xem trước danh sách STT, gắn ảnh tham chiếu và ước tính số giây xử lý tại đây.</p>
        </div>
      </div>
    `;
    return;
  }

  const readyAccs = Math.max(1, (S.profiles || []).filter(Accounts.ready).length);
  const maxSec = drafts[drafts.length - 1].estSeconds;
  const maxMin = (maxSec / 60).toFixed(1);
  const isFaceChecked = !!($('#face_image_multi')?.checked || $('#face_image')?.checked || $('#face_image_pro')?.checked);

  const rows = drafts.map((d, idx) => `
    <tr class="prompt-preview-row" data-id="${esc(d.id)}" data-idx="${idx}">
      <td style="text-align:center">
        <span class="preview-stt-badge">#${d.seq}</span>
      </td>
      <td>
        <div class="preview-prompt-col">
          <textarea class="preview-prompt-textarea" data-id="${esc(d.id)}" data-idx="${idx}" placeholder="Nhập prompt cảnh #${d.seq}...">${esc(d.prompt)}</textarea>
          <div class="preview-row-quick-actions">
            <button type="button" class="preview-act-btn" data-act="dup" data-id="${esc(d.id)}" title="Nhân bản prompt & ảnh của cảnh này">📋 Nhân bản</button>
            <button type="button" class="preview-act-btn del" data-act="del" data-id="${esc(d.id)}" title="Xoá cảnh này">🗑️ Xoá</button>
          </div>
        </div>
      </td>
      <td>
        <div class="preview-images-col" data-id="${esc(d.id)}" data-idx="${idx}">
          <div class="preview-thumbs-list">
            ${(d.images || []).map((im, imgIdx) => {
              const src = typeof resolveRefImgSrc === 'function' ? resolveRefImgSrc(im) : (im.preview || im.id);
              return `
              <div class="preview-thumb-item" title="${esc(im.name || 'Ảnh tham chiếu')}">
                <img src="${src}" alt="" onclick="window.open('${src}')">
                <button type="button" class="preview-thumb-action del" data-card="${esc(d.id)}" data-idx="${imgIdx}" title="Xoá ảnh này khỏi cảnh #${d.seq}">✕</button>
                <button type="button" class="preview-thumb-action share" data-card="${esc(d.id)}" data-idx="${imgIdx}" title="Áp dụng ảnh này cho TẤT CẢ các cảnh">Dùng chung</button>
              </div>
            `;}).join('')}
            <button type="button" class="preview-add-img-btn" data-card="${esc(d.id)}" data-idx="${idx}" title="Thêm ảnh tham chiếu cho cảnh #${d.seq}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              <span>+ Thêm ảnh</span>
            </button>
          </div>
          <div class="preview-img-drop-hint">Kéo thả ảnh vào đây</div>
        </div>
      </td>
      <td>
        <div style="display:flex;flex-direction:column;gap:5px">
          <span class="chip ok" style="font-size:11.5px">⚡ Seedance ${esc(d.model)}</span>
          <span class="chip hot" style="font-size:11.5px">⏱️ ${d.duration}s · ${esc(d.ratio)}</span>
          ${isFaceChecked ? '<span class="chip" style="font-size:11px;background:rgba(16,185,129,0.15);color:#10b981;border:1px solid rgba(16,185,129,0.3);font-weight:600">🛡️ Lách mặt Dola</span>' : ''}
        </div>
      </td>
      <td style="text-align:center">
        <span class="eta-pill" title="Ước tính xử lý trên ${readyAccs} tài khoản sẵn sàng">
          ⏱️ Xong sau ~${d.estSeconds}s <small style="opacity:0.8">(${Math.round(d.estSeconds / 60)}p · đợt ${d.batch})</small>
        </span>
      </td>
      <td style="text-align:center">
        <span class="badge ok">⚡ Sẵn sàng</span>
      </td>
    </tr>
  `).join('');

  box.innerHTML = `
    <div class="tblwrap jwrap prompt-preview-wrap">
      <div class="prompt-preview-header-bar">
        <div class="prompt-preview-title-group">
          <span class="prompt-preview-badge">BẢN XEM TRƯỚC KỊCH BẢN</span>
          <span class="prompt-preview-count">${drafts.length} prompt (STT #1 – #${drafts.length})</span>
          <span class="prompt-preview-eta-summary">⏱️ Dự kiến hoàn thành toàn bộ: ~${maxMin} phút (~${maxSec}s)</span>
        </div>
        <div class="prompt-preview-actions-group">
          <label class="btn sm quiet" style="cursor:pointer;display:inline-flex;align-items:center;gap:6px" title="Bật/Tắt tự động thêm câu cam kết sở hữu bản quyền & khuôn mặt chính chủ để lách hoàn toàn bộ lọc bản quyền Dola">
            <input type="checkbox" id="preview_face_image_toggle" style="cursor:pointer" ${isFaceChecked ? 'checked' : ''}>
            <span style="font-weight:600;font-size:11.5px">🛡️ Lách bản quyền mặt</span>
          </label>
          <button type="button" class="btn sm quiet" id="btn_preview_apply_first_all" title="Lấy ảnh của cảnh #1 áp dụng cho toàn bộ các cảnh">
            <span>🖼️ Áp dụng ảnh #1 cho tất cả</span>
          </button>
          <button type="button" class="btn sm quiet" id="btn_preview_grid_studio" title="Mở Studio ghép ảnh Grid chất lượng cao">
            <span>🎨 Studio Grid</span>
          </button>
          <button type="button" class="btn sm primary btn-run-from-preview" onclick="Jobs.runCurrentMode()">
            <span>⚡ BẮT ĐẦU CHẠY NGAY (${drafts.length} VIDEO)</span>
          </button>
        </div>
      </div>
      <table class="tbl jtbl prompt-preview-table">
        <thead>
          <tr>
            <th style="width:50px;text-align:center">STT</th>
            <th>Nội dung Prompt kịch bản</th>
            <th style="width:280px">Ảnh tham chiếu (Từng prompt)</th>
            <th style="width:170px">Thông số cấu hình</th>
            <th style="width:200px;text-align:center">Thời gian xử lý xong (giây)</th>
            <th style="width:110px;text-align:center">Trạng thái</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;

  // Attach event listeners for prompt text editing
  box.querySelectorAll('.preview-prompt-textarea').forEach(ta => {
    ta.addEventListener('input', e => {
      const cardId = e.target.dataset.id;
      if (typeof Composer !== 'undefined' && Composer.onCardTextChange) {
        Composer.onCardTextChange(cardId, e.target.value);
      }
    });
  });

  // Attach duplicate and delete handlers
  box.querySelectorAll('.preview-act-btn[data-act="dup"]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (typeof Composer !== 'undefined' && Composer.duplicateCard) {
        Composer.duplicateCard(btn.dataset.id);
      }
    });
  });

  box.querySelectorAll('.preview-act-btn[data-act="del"]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (typeof Composer !== 'undefined' && Composer.removeCard) {
        Composer.removeCard(btn.dataset.id);
      }
    });
  });

  // Attach Add Image button per row
  box.querySelectorAll('.preview-add-img-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (typeof Composer !== 'undefined' && Composer.uploadCardImage) {
        Composer.uploadCardImage(btn.dataset.card);
      }
    });
  });

  // Attach Delete Image button on thumbnail
  box.querySelectorAll('.preview-thumb-action.del').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof Composer !== 'undefined' && Composer.removeCardImage) {
        Composer.removeCardImage(btn.dataset.card, +btn.dataset.idx);
      }
    });
  });

  // Attach Share Image button on thumbnail
  box.querySelectorAll('.preview-thumb-action.share').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof Composer !== 'undefined' && Composer.applyImageToAllCards) {
        Composer.applyImageToAllCards(btn.dataset.card, +btn.dataset.idx);
      }
    });
  });

  // Header quick buttons
  box.querySelector('#preview_face_image_toggle')?.addEventListener('change', e => {
    const val = e.target.checked;
    if (typeof syncFaceCheckboxes === 'function') {
      syncFaceCheckboxes(val);
    } else {
      if ($('#face_image')) $('#face_image').checked = val;
      if ($('#face_image_multi')) $('#face_image_multi').checked = val;
      if ($('#face_image_pro')) $('#face_image_pro').checked = val;
      if (typeof Composer !== 'undefined' && Composer.changed) Composer.changed();
    }
    toast(val ? 'Đã BẬT tự động lách bản quyền mặt người (Dola)' : 'Đã TẮT lách bản quyền mặt người');
    Jobs.renderPromptPreviewTable(box, drafts);
  });

  box.querySelector('#btn_preview_apply_first_all')?.addEventListener('click', () => {
    if (!Composer.multiCards || !Composer.multiCards.length) return toast('Chưa có danh sách prompt', 'err');
    const first = Composer.multiCards[0];
    if (!first.images || !first.images.length) return toast('Cảnh #1 chưa có ảnh tham chiếu nào', 'err');
    for (let i = 1; i < Composer.multiCards.length; i++) {
      Composer.multiCards[i].images = (first.images || []).map(im => ({ ...im }));
    }
    Composer.renderMultiCards();
    Composer.renderPromptPreview();
    toast(`Đã áp dụng ${first.images.length} ảnh từ cảnh #1 cho tất cả các cảnh!`);
  });

  box.querySelector('#btn_preview_grid_studio')?.addEventListener('click', () => {
    if (typeof Composer !== 'undefined' && Composer.openGridStudio) {
      Composer.openGridStudio();
    } else {
      $('#btn_multi_grid_studio')?.click();
    }
  });

  // Drag & drop support on rows
  box.querySelectorAll('.prompt-preview-row, .preview-images-col').forEach(zone => {
    zone.addEventListener('dragover', e => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', () => {
      zone.classList.remove('drag-over');
    });
    zone.addEventListener('drop', async e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const cardId = zone.dataset.id;
      if (!cardId) return;
      const files = [...(e.dataTransfer?.files || [])].filter(f => f.type.startsWith('image/') || /\.(jpe?g|png|webp|bmp|gif|jfif)$/i.test(f.name));
      if (!files.length) return;
      let targetCard = (Composer.multiCards || []).find(c => c.id === cardId);
      if (!targetCard && Composer.mode === 'single') targetCard = (Composer.multiCards || [])[0];
      if (targetCard) {
        await Composer.processAndAddFilesToCard(targetCard, files);
        Composer.renderMultiCards();
        Composer.renderPromptPreview();
        toast(`Đã thêm ${files.length} ảnh vào cảnh #${(Composer.multiCards || []).indexOf(targetCard) + 1}`);
      }
    });
  });
};

function renderTabs(jobs) {
  jobs = (jobs || []).filter(j => !j.kind || j.kind === 'generate');
  const drafts = S.draftBatch || [];
  const counts = {
    all: jobs.length,
    preview: drafts.length,
    running: jobs.filter(j => j.status === 'running').length,
    queued: jobs.filter(j => j.status === 'queued').length,
    done: jobs.filter(j => inTab(j, 'done')).length,
    error: jobs.filter(j => inTab(j, 'error')).length
  };
  const tabDefs = [
    ['all', 'Tất cả'],
    ...(drafts.length > 0 ? [['preview', `📝 Kịch bản (${drafts.length})`]] : []),
    ['running', 'Đang tạo'],
    ['queued', 'Đang chờ'],
    ['done', 'Xong'],
    ['error', 'Lỗi']
  ];
  if (S.filter === 'preview' && drafts.length === 0) S.filter = 'all';
  const html = tabDefs.map(([k, l]) => `<button data-f="${k}" class="${S.filter === k ? 'on' : ''}">${l}<b>${counts[k]}</b></button>`).join('');
  if ($('#tabs').innerHTML !== html) {
    $('#tabs').innerHTML = html;
    $('#tabs').querySelectorAll('button').forEach(b => b.addEventListener('click', () => { S.filter = b.dataset.f; Jobs.render(S.jobs); }));
  }
}

Jobs.shown = function (jobs) {
  const q = S.q.toLowerCase();
  let list = (jobs || []).filter(j => (!j.kind || j.kind === 'generate') && inTab(j, S.filter) && (!S.accf || j.assigned === S.accf || j.profile === S.accf)
    && (!q || j.prompt.toLowerCase().includes(q) || ('#' + j.seq).includes(q) || (j.assets || []).some(t => ('@' + t).includes(q))));
  if (S.sort === 'old') list = [...list].reverse();
  else if (S.sort === 'err') list = [...list].sort((a, b) => (inTab(b, 'error') ? 1 : 0) - (inTab(a, 'error') ? 1 : 0));

  const drafts = S.draftBatch || [];
  const matchingDrafts = drafts.filter(d => !q || d.prompt.toLowerCase().includes(q) || ('#' + d.seq).includes(q));

  if (S.filter === 'preview') {
    return matchingDrafts;
  }
  return list;
};

Jobs.render = function (jobs) {
  jobs = (jobs || []).filter(j => !j.kind || j.kind === 'generate');
  const drafts = typeof Jobs.getDraftPrompts === 'function' ? Jobs.getDraftPrompts() : [];
  S.draftBatch = drafts;
  if (S.filter === 'preview' && drafts.length === 0) S.filter = 'all';
  renderTabs(jobs);
  const nVideo = $('#n-video');
  if (nVideo) nVideo.textContent = jobs.length ? `${jobs.length}` : (drafts.length ? `${drafts.length}` : '');
  const box = $('#jobs');
  if (!box) return;
  const running = jobs.filter(j => j.status === 'running').length, queued = jobs.filter(j => j.status === 'queued').length;
  const jcount = $('#jcount');
  if (jcount) jcount.textContent = running || queued ? `${running} đang tạo, ${queued} đang chờ` : (drafts.length ? `${drafts.length} bản nháp sẵn sàng` : '');

  const shown = Jobs.shown(jobs);
  const jobtools = $('#jobtools');
  if (jobtools) jobtools.hidden = !shown.length;

  if (S.filter === 'preview' && drafts.length > 0) {
    const doneCount = jobs.filter(j => j.status === 'done').length;
    $('#jobtools').innerHTML = `
      <button type="button" class="btn sm primary" id="btn-run-all-drafts" style="font-weight:700">⚡ Chạy tất cả (${drafts.length} video)</button>
      <button type="button" class="btn sm quiet" id="btn-apply-img1-all">🖼️ Dùng ảnh #1 cho tất cả</button>
      <button type="button" class="btn sm quiet danger" id="btn-clear-all-drafts">🗑️ Xoá toàn bộ nháp</button>
      ${doneCount > 0 ? `<button type="button" class="btn sm quiet" id="btn-clean-done-preview" title="Dọn sạch các video đã xong ở phiên trước khỏi danh sách">🧹 Dọn ${doneCount} video cũ đã xong</button>` : ''}
    `;
    $('#btn-run-all-drafts')?.addEventListener('click', () => Jobs.runCurrentMode());
    $('#btn-apply-img1-all')?.addEventListener('click', () => {
      if (!Composer.multiCards || !Composer.multiCards.length) {
        Composer.syncMultiCardsFromText();
      }
      if (!Composer.multiCards || !Composer.multiCards.length) return toast('Chưa có danh sách prompt', 'err');
      const first = Composer.multiCards[0];
      if (!first.images || !first.images.length) return toast('Cảnh #1 chưa có ảnh tham chiếu nào', 'err');
      Jobs.copyDraftImagesToAll(first);
    });
    $('#btn-clear-all-drafts')?.addEventListener('click', () => {
      if ($('#p_multi')) $('#p_multi').value = '';
      if ($('#p')) $('#p').value = '';
      Composer.multiCards = [];
      Composer.images = [];
      Composer.renderThumbs();
      Composer.onMultiInput(false);
      Composer.renderPromptPreview();
      toast('Đã xoá toàn bộ bản nháp');
    });
    $('#btn-clean-done-preview')?.addEventListener('click', async () => {
      try {
        const r = await api('POST', '/api/jobs/bulk', { action: 'delete_done' });
        toast(`Đã dọn sạch ${r.ok || 0} video đã xong từ phiên trước!`);
        await App.refresh();
      } catch (err) {
        toast('Lỗi dọn video: ' + err.message, 'err');
      }
    });
  } else {
    $('#jobtools').innerHTML = `
      <button type="button" class="btn sm quiet" id="selall">Chọn tất cả</button>
      <button type="button" class="btn sm quiet" id="retryfailed">Chạy lại mọi lỗi</button>
      <button type="button" class="btn sm quiet" id="cleandone">Dọn job đã xong</button>
      <button type="button" class="btn sm quiet" id="cancelqueued">Huỷ hàng đợi</button>
    `;
    $('#selall')?.addEventListener('click', () => {
      const shownList = Jobs.shown(S.jobs);
      const allSelected = shownList.every(j => S.selected.has(j.id));
      shownList.forEach(j => { if (allSelected) S.selected.delete(j.id); else S.selected.add(j.id); });
      Jobs.render(S.jobs);
    });
    $('#retryfailed')?.addEventListener('click', () => api('POST', '/api/jobs/bulk', {action: 'retry_failed'}).then(r => { toast(`Đã thêm lại ${r.ok || 0} job lỗi`); App.refresh(); }));
    $('#cleandone')?.addEventListener('click', () => api('POST', '/api/jobs/bulk', {action: 'delete_done'}).then(r => { toast(`Đã dọn ${r.ok || 0} job đã xong`); App.refresh(); }));
    $('#cancelqueued')?.addEventListener('click', () => api('POST', '/api/jobs/bulk', {action: 'cancel_queued'}).then(r => { toast(`Đã huỷ ${r.ok || 0} job trong hàng đợi`); App.refresh(); }));
  }

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
  for (const id of [...S.selected]) if (!jobs.some(j => j.id === id) && !drafts.some(d => d.id === id)) S.selected.delete(id);

  if (!shown.length) {
    box.className = 'grid';
    box.innerHTML = (jobs.length || drafts.length)
      ? `<div class="empty"><div class="frame"></div><div><h3>Không có mục nào khớp</h3><p>Đổi bộ lọc, xoá từ khoá tìm, hoặc chọn "Tất cả".</p></div></div>`
      : `<div class="empty"><div class="frame"></div><div><h3>Chưa có video hoặc kịch bản nào</h3><p>Viết prompt ở khung bên trái (mỗi dòng một video), chọn model và độ dài, rồi bấm Tạo video. Mỗi video sẽ hiện ở đây và phát được ngay khi xong.</p></div></div>`;
    Jobs.renderBulk();
    return;
  }

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
  Jobs.renderBulk();
};
$('#q').addEventListener('input', () => { S.q = $('#q').value.trim(); Jobs.render(S.jobs); });
$('#accf').addEventListener('change', () => { S.accf = $('#accf').value; Jobs.render(S.jobs); });
$('#sortsel').addEventListener('change', () => { S.sort = $('#sortsel').value; Jobs.render(S.jobs); });

// ------------------------------------------------------------ chọn nhiều + hàng loạt
Jobs.renderBulk = function () {
  const n = S.selected ? S.selected.size : 0;
  const bulkbar = $('#bulkbar');
  if (bulkbar) bulkbar.hidden = !n;
  const bulkn = $('#bulkn');
  if (bulkn) bulkn.textContent = `${n} video đã chọn`;
  const selall = $('#selall');
  if (selall) selall.textContent = n && n >= Jobs.shown(S.jobs).length ? 'Bỏ chọn tất cả' : 'Chọn tất cả';
};
$('#selall')?.addEventListener('click', () => {
  const shown = Jobs.shown(S.jobs);
  if (S.selected.size >= shown.length && shown.length) S.selected.clear(); else shown.forEach(j => S.selected.add(j.id));
  Jobs.render(S.jobs);
});
$('#bulkclear')?.addEventListener('click', () => { S.selected.clear(); Jobs.render(S.jobs); });
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


Jobs._editRetryImages = [];
Jobs.openEditRetry = function (job) {
  const modal = $('#modal_edit_retry');
  if (!modal) return;
  $('#edit_retry_job_id').value = job.id;
  $('#edit_retry_seq').textContent = '#' + (job.seq || '');

  let promptText = job.prompt || '';
  let hasFace = false;
  if (typeof FACE_PREFIX !== 'undefined' && promptText.startsWith(FACE_PREFIX.trim())) {
    promptText = promptText.replace(FACE_PREFIX.trim(), '').replace(/^:\s*/, '').trim();
    hasFace = true;
  }
  if (typeof FACE_DISCLAIMER !== 'undefined' && promptText.includes(FACE_DISCLAIMER)) {
    promptText = promptText.replace(FACE_DISCLAIMER, '').trim();
    hasFace = true;
  }
  $('#edit_retry_prompt').value = promptText;
  if ($('#edit_retry_face_image')) $('#edit_retry_face_image').checked = hasFace;

  if ($('#edit_retry_duration')) $('#edit_retry_duration').value = String(job.duration || 30);
  if ($('#edit_retry_ratio')) $('#edit_retry_ratio').value = job.ratio || '9:16';

  const profSel = $('#edit_retry_profile');
  if (profSel) {
    const profiles = S.profiles || [];
    profSel.innerHTML = '<option value="auto">⚡ Tự động (Auto)</option>' +
      profiles.filter(p => p.enabled).map(p => `<option value="${esc(p.id)}" ${p.id === job.assigned || p.id === job.profile ? 'selected' : ''}>${esc(p.name)}</option>`).join('');
  }

  Jobs._editRetryImages = (job.images || []).map(im => typeof im === 'object' ? im : { id: im, preview: (typeof resolveRefImgSrc === 'function' ? resolveRefImgSrc(im) : withToken('/api/uploads/' + im)) });
  Jobs.renderEditRetryThumbs();

  openModal(modal);
};

Jobs.renderEditRetryThumbs = function () {
  const box = $('#edit_retry_thumbs');
  const countEl = $('#edit_retry_img_count');
  if (!box) return;
  const imgs = Jobs._editRetryImages || [];
  if (countEl) countEl.textContent = imgs.length;
  if (!imgs.length) {
    box.innerHTML = '<span style="font-size:12px;color:var(--ink-3);padding:0 6px">Chưa có ảnh tham chiếu. Bấm "+ Thêm ảnh" nếu muốn đính kèm.</span>';
    return;
  }
  box.innerHTML = imgs.map((im, idx) => {
    const src = typeof resolveRefImgSrc === 'function' ? resolveRefImgSrc(im) : (im.preview || withToken('/api/uploads/' + (im.id || im)));
    return `
    <div style="position:relative;display:inline-block;width:48px;height:48px;border-radius:6px;overflow:hidden;border:1px solid var(--line);background:#000">
      <img src="${src}" style="width:100%;height:100%;object-fit:cover" alt="">
      <button type="button" data-idx="${idx}" class="btn-del-edit-img" style="position:absolute;top:2px;right:2px;width:16px;height:16px;border-radius:50%;background:rgba(0,0,0,0.7);color:#fff;border:none;cursor:pointer;font-size:10px;line-height:1;display:flex;align-items:center;justify-content:center">✕</button>
    </div>
  `;}).join('');

  box.querySelectorAll('.btn-del-edit-img').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = +btn.dataset.idx;
      Jobs._editRetryImages.splice(idx, 1);
      Jobs.renderEditRetryThumbs();
    });
  });
};

function initEditRetryModal() {
  $('#btn_close_edit_retry')?.addEventListener('click', () => closeModal($('#modal_edit_retry')));
  $('#btn_cancel_edit_retry')?.addEventListener('click', () => closeModal($('#modal_edit_retry')));

  $('#edit_retry_img_file')?.addEventListener('change', async (e) => {
    const files = [...e.target.files].filter(f => f.type.startsWith('image/'));
    e.target.value = '';
    if (!files.length) return;
    for (const f of files) {
      try {
        const dataUrl = await fileToDataUrl(f);
        const up = await api('POST', '/api/upload', { name: f.name || 'image.jpg', data_b64: dataUrl });
        Jobs._editRetryImages.push({ id: up.id, name: f.name, preview: dataUrl });
      } catch (err) {
        toast('Lỗi tải ảnh: ' + err.message, 'err');
      }
    }
    Jobs.renderEditRetryThumbs();
  });

  $('#btn_submit_edit_retry')?.addEventListener('click', async () => {
    const pVal = ($('#edit_retry_prompt')?.value || '').trim();
    if (!pVal) {
      toast('Vui lòng nhập nội dung prompt.', 'err');
      return;
    }
    const btn = $('#btn_submit_edit_retry');
    btn.disabled = true;
    btn.textContent = 'Đang gửi…';
    try {
      let sendPrompt = pVal;
      if ($('#edit_retry_face_image')?.checked) {
        const prefix = typeof FACE_PREFIX !== 'undefined' ? FACE_PREFIX : '';
        const disc = typeof FACE_DISCLAIMER !== 'undefined' ? FACE_DISCLAIMER : '';
        if (prefix && !sendPrompt.startsWith(prefix.trim())) sendPrompt = prefix + sendPrompt;
        if (disc && !sendPrompt.includes(disc)) sendPrompt = sendPrompt + '\n\n' + disc;
      }
      const dur = Number($('#edit_retry_duration')?.value) || 30;
      const ratio = $('#edit_retry_ratio')?.value || '9:16';
      const prof = $('#edit_retry_profile')?.value || 'auto';
      const imageIds = (Jobs._editRetryImages || []).map(im => typeof im === 'object' ? im.id : im).filter(Boolean);

      await api('POST', '/api/jobs', {
        prompts: [sendPrompt],
        model: '2.5',
        duration: dur,
        ratio: ratio,
        profile: prof,
        image_ids: imageIds,
        auto_retry_acc: true,
        dry_run: false
      });
      closeModal($('#modal_edit_retry'));
      toast('🚀 Đã gửi lại yêu cầu video thành công!');
      await App.refresh();
    } catch (err) {
      toast('Lỗi gửi lại yêu cầu: ' + err.message, 'err');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>🚀 Gửi yêu cầu lại</span>';
    }
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEditRetryModal);
} else {
  initEditRetryModal();
}
window.Jobs = Jobs;
