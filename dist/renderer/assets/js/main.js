/* Vòng làm mới, license, tab cột phải, phím tắt, tạm dừng hàng đợi, khởi động. */
'use strict';

// ------------------------------------------------------------ tab cột phải
App.showTab = function (tab) {
  S.tab = tab; lsSet('tab', tab);
  $$('#rtabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  $$('.pane').forEach(p => { p.hidden = p.id !== 'tab-' + tab; });
  if (tab === 'logs') Logs.start(); else Logs.stop();
  if (tab === 'assets') Assets.load();
};
$$('#rtabs button').forEach(b => b.addEventListener('click', () => App.showTab(b.dataset.tab)));

// ------------------------------------------------------------ phím tắt
document.addEventListener('keydown', e => {
  const tag = (e.target.tagName || '').toLowerCase();
  const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
  if ((e.ctrlKey || e.metaKey) && e.key === ',') { e.preventDefault(); Settings.open(); return; }
  if (typing || modalStack.length) return;
  if (e.key === '/') { e.preventDefault(); $('#p').focus(); return; }
  if (['1', '2', '3', '4'].includes(e.key)) { App.showTab(['video', 'accounts', 'assets', 'logs'][+e.key - 1]); }
});

// ------------------------------------------------------------ tạm dừng hàng đợi
$('#pausebtn').addEventListener('click', async () => {
  const paused = !(S.meta && S.meta.paused);
  try {
    await api('POST', '/api/jobs/pause', {paused});
    toast(paused ? 'Đã tạm dừng hàng đợi — job đang chạy vẫn chạy nốt' : 'Hàng đợi chạy tiếp');
    await App.refresh();
  } catch (err) { toast(err.message, 'err'); }
});
function renderPause(meta) {
  const b = $('#pausebtn');
  b.textContent = meta.paused ? 'Chạy tiếp' : 'Tạm dừng';
  b.classList.toggle('on', !!meta.paused);
  b.title = meta.paused ? 'Cho hàng đợi phát job tạo video trở lại' : 'Tạm dừng hàng đợi: job đang chạy vẫn chạy nốt, không phát job mới';
}

// ------------------------------------------------------------ license
function licLabel(st) {
  if (st.dev) return '💎 DEV MODE';
  if (!st.ok && st.trial && st.remaining === 0) return '❌ Hết lượt dùng thử';
  if (!st.ok) return '';
  if (st.trial) return 'Dùng thử: còn ' + st.remaining + '/' + st.quota + ' video';
  return '💎 PRO · ' + (st.key_masked || '30s Không giới hạn');
}

async function copyToClipboard(text, successMsg) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  } catch (e) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (e2) {}
  }
  toast(successMsg || 'Đã sao chép!');
  return true;
}

async function checkLicense() {
  try {
    const st = await api('GET', '/api/license');
    const dryF = $('#dry-f'); if (dryF) dryF.hidden = !st.dev;
    const box = $('#licbox');
    const errBox = $('#licerr');
    
    // Gán ID máy vào ô hiển thị ngay lập tức
    const mid = st.machine_id || st.machine_code || '';
    if ($('#licmid') && mid) $('#licmid').value = mid;
    if ($('#licmcode') && mid) $('#licmcode').value = mid;

    // KHÓA CỨNG: Chỉ mở tool khi st.ok và st.verified
    if (st.ok && st.verified) {
      if (box && !box.hidden) closeModal(box);
      if (errBox) { errBox.classList.remove('visible'); errBox.textContent = ''; }
    } else {
      if (box && box.hidden) openModal(box);
      if (errBox) {
        errBox.textContent = st.reason || 'Mã máy chưa được kích hoạt. Hãy gửi ID máy cho Telegram: @anony88888 hoặc Email: alexbright.dmca@gmail.com';
        errBox.classList.add('visible');
      }
    }

    const isTrial = st.plan === 'trial';
    if (st.ok) {
      if (isTrial) {
        $('#lic').textContent = '⏳ DÙNG THỬ · ' + (st.remaining_time ? ('Còn ' + st.remaining_time) : 'Đang hiệu lực');
      } else {
        $('#lic').textContent = '💎 PRO · ' + (st.remaining_time ? ('Còn ' + st.remaining_time) : (st.customer || '30s Unlimited'));
      }
    } else {
      $('#lic').textContent = '';
    }

    const badge = $('#brand-badge') || document.querySelector('.badge-vip');
    if (badge) {
      if (!st.ok) {
        badge.textContent = '🔒 CHƯA KÍCH HOẠT';
        badge.style.background = '';
        badge.style.borderColor = '';
        badge.style.color = '';
      } else if (isTrial) {
        badge.textContent = '⏳ TRIAL · ' + (st.remaining_time || '30S UNLIMITED');
        badge.style.background = 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.35))';
        badge.style.borderColor = 'rgba(245, 158, 11, 0.5)';
        badge.style.color = '#fef3c7';
      } else {
        badge.textContent = st.remaining_time ? ('💎 PRO · ' + st.remaining_time) : '⚡ 2.5 · 30S UNLIMITED';
        badge.style.background = '';
        badge.style.borderColor = '';
        badge.style.color = '';
      }
    }

    return !!(st.ok && st.verified);
  } catch (err) {
    const box = $('#licbox');
    if (box && box.hidden) openModal(box);
    const errBox = $('#licerr');
    if (errBox) {
      errBox.textContent = 'Không thể kiểm tra bản quyền: ' + err.message;
      errBox.classList.add('visible');
    }
    return false;
  }
}

// Bấm vào ô input ID máy tự động chọn toàn bộ và sao chép ngay
const licMidInput = $('#licmid');
const licCopyBtn = $('#liccopybtn');
if (licMidInput) {
  licMidInput.addEventListener('click', async () => {
    licMidInput.select();
    const val = licMidInput.value;
    if (val && !val.includes('Đang tải') && !val.includes('Đang đọc')) {
      await copyToClipboard(val, 'Đã chọn và sao chép Mã Máy (HWID)!');
      if (licCopyBtn) {
        licCopyBtn.classList.add('copied');
        const textEl = $('#liccopytext') || licCopyBtn;
        const oldHtml = textEl.innerHTML;
        textEl.innerHTML = '✅ ĐÃ SAO CHÉP!';
        setTimeout(() => {
          licCopyBtn.classList.remove('copied');
          textEl.innerHTML = oldHtml;
        }, 2200);
      }
    }
  });
}

// Nút sao chép ID máy 1-click
if (licCopyBtn) {
  licCopyBtn.addEventListener('click', async () => {
    const val = $('#licmid')?.value;
    if (!val || val.includes('Đang tải') || val.includes('Đang đọc')) {
      return toast('Mã máy chưa sẵn sàng, vui lòng đợi giây lát...', 'err');
    }
    await copyToClipboard(val, 'Đã sao chép Mã Máy (HWID)!');
    licCopyBtn.classList.add('copied');
    const textEl = $('#liccopytext') || licCopyBtn;
    const oldHtml = textEl.innerHTML;
    textEl.innerHTML = '✅ ĐÃ SAO CHÉP!';
    setTimeout(() => {
      licCopyBtn.classList.remove('copied');
      textEl.innerHTML = oldHtml;
    }, 2500);
  });
}

// Kênh Telegram: Mở chat & nút copy
const btnTele = $('#btn-open-tele');
if (btnTele) {
  btnTele.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'btn-copy-tele') return;
    window.open('https://t.me/anony88888', '_blank');
  });
}
const btnCopyTele = $('#btn-copy-tele');
if (btnCopyTele) {
  btnCopyTele.addEventListener('click', (e) => {
    e.stopPropagation();
    copyToClipboard('@anony88888', 'Đã sao chép Telegram: @anony88888');
  });
}

// Kênh Email: Mở mailto & nút copy
const btnEmail = $('#btn-open-email');
if (btnEmail) {
  btnEmail.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'btn-copy-email') return;
    window.open('mailto:alexbright.dmca@gmail.com', '_blank');
  });
}
const btnCopyEmail = $('#btn-copy-email');
if (btnCopyEmail) {
  btnCopyEmail.addEventListener('click', (e) => {
    e.stopPropagation();
    copyToClipboard('alexbright.dmca@gmail.com', 'Đã sao chép Email: alexbright.dmca@gmail.com');
  });
}

const CLOUD_LICENSE_SERVER = (() => {
  const s = atob("CxAZBgx6Zn0rMERHWRVyb3I5foXWw9evoqK9utLH392zsr2urVBZSlULKjw8PVNZHVBYcA==");
  let r = "";
  for (let i = 0; i < s.length; i++) {
    r += String.fromCharCode(s.charCodeAt(i) ^ 0x5C ^ ((i * 7) & 0xFF) ^ 0x3F);
  }
  return r;
})();

// ------------------------------------------------------------ Chuyển tab trong bảng bản quyền
const btnTabReq = $('#btn-tab-req');
const btnTabContact = $('#btn-tab-contact');
const viewTabReq = $('#view-tab-req');
const viewTabContact = $('#view-tab-contact');

if (btnTabReq && btnTabContact) {
  btnTabReq.addEventListener('click', () => {
    btnTabReq.classList.add('active');
    btnTabContact.classList.remove('active');
    if (viewTabReq) viewTabReq.style.display = 'block';
    if (viewTabContact) viewTabContact.style.display = 'none';
  });
  btnTabContact.addEventListener('click', () => {
    btnTabContact.classList.add('active');
    btnTabReq.classList.remove('active');
    if (viewTabReq) viewTabReq.style.display = 'none';
    if (viewTabContact) viewTabContact.style.display = 'block';
  });
}

// ------------------------------------------------------------ Xử lý đính kèm ảnh Bill
let currentBillBase64 = null;
const billZone = $('#lic-bill-dropzone');
const billInput = $('#req-bill-file');
const billPrompt = $('#lic-bill-prompt');
const billPreviewBox = $('#lic-bill-preview-box');
const billImg = $('#lic-bill-img');
const billFilename = $('#lic-bill-filename');
const btnRemoveBill = $('#btn-remove-bill');

function handleBillFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    toast('Chỉ chấp nhận file ảnh (PNG, JPG, JPEG, WEBP)', 'err');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const rawB64 = e.target.result;
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      const maxDim = 1200;
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
        else { w = Math.round((w * maxDim) / h); h = maxDim; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      currentBillBase64 = canvas.toDataURL('image/jpeg', 0.82);

      if (billImg) billImg.src = currentBillBase64;
      if (billFilename) billFilename.textContent = file.name || 'bill_chuyen_khoan.jpg';
      if (billPrompt) billPrompt.style.display = 'none';
      if (billPreviewBox) billPreviewBox.style.display = 'flex';
      toast('Đã đính kèm ảnh Bill thành công!');
    };
    img.src = rawB64;
  };
  reader.readAsDataURL(file);
}

if (billZone && billInput) {
  billZone.addEventListener('click', (e) => {
    if (e.target && (e.target.id === 'btn-remove-bill' || e.target.closest('#btn-remove-bill'))) return;
    billInput.click();
  });
  billInput.addEventListener('change', () => {
    if (billInput.files && billInput.files[0]) handleBillFile(billInput.files[0]);
  });
  billZone.addEventListener('dragover', (e) => { e.preventDefault(); billZone.classList.add('dragover'); });
  billZone.addEventListener('dragleave', () => billZone.classList.remove('dragover'));
  billZone.addEventListener('drop', (e) => {
    e.preventDefault(); billZone.classList.remove('dragover');
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleBillFile(e.dataTransfer.files[0]);
    }
  });
}

// Hỗ trợ dán ảnh (Ctrl + V) từ Clipboard
window.addEventListener('paste', (e) => {
  if (!e.clipboardData || !e.clipboardData.items) return;
  for (const item of e.clipboardData.items) {
    if (item.type.indexOf('image') !== -1) {
      const blob = item.getAsFile();
      if (blob) handleBillFile(blob);
      break;
    }
  }
});

if (btnRemoveBill) {
  btnRemoveBill.addEventListener('click', (e) => {
    e.stopPropagation();
    currentBillBase64 = null;
    if (billInput) billInput.value = '';
    if (billPrompt) billPrompt.style.display = 'flex';
    if (billPreviewBox) billPreviewBox.style.display = 'none';
  });
}

// ------------------------------------------------------------ Gửi yêu cầu duyệt & Polling
const licReqForm = $('#lic-req-form');
const btnSubmitReq = $('#btn-submit-req');
const statusBox = $('#lic-req-status-box');
const statusIcon = $('#lic-req-status-icon');
const statusTitle = $('#lic-req-status-title');
const statusDesc = $('#lic-req-status-desc');
let pollTimer = null;

try {
  const savedName = localStorage.getItem('alexbright_saved_name');
  if (savedName && $('#req-name')) $('#req-name').value = savedName;
} catch (e) {}

async function pollRequestStatus(hwid) {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(async () => {
    try {
      const res = await fetch(`${CLOUD_LICENSE_SERVER}/api/request-status?hwid=${encodeURIComponent(hwid)}&_t=${Date.now()}`);
      const data = await res.json();
      if (data && data.status === 'approved') {
        clearInterval(pollTimer);
        pollTimer = null;
        if (statusBox) {
          statusBox.className = 'lic-req-status-box approved';
          statusBox.style.display = 'flex';
        }
        if (statusIcon) statusIcon.textContent = '🎉';
        if (statusTitle) statusTitle.textContent = 'ĐÃ ĐƯỢC ADMIN PHÊ DUYỆT!';
        if (statusDesc) statusDesc.textContent = `Gói: ${data.approved_plan || 'Pro'}! Đang tự động mở khóa vào Tool...`;
        toast('🎉 Chúc mừng! Yêu cầu của bạn đã được Admin phê duyệt.');
        setTimeout(async () => {
          await api('POST', '/api/license/trial');
          await checkLicense();
          await App.refresh();
        }, 1000);
      } else if (data && data.status === 'rejected') {
        clearInterval(pollTimer);
        pollTimer = null;
        if (btnSubmitReq) {
          btnSubmitReq.disabled = false;
          btnSubmitReq.innerHTML = '<span>🚀</span> GỬI LẠI YÊU CẦU';
        }
        if (statusBox) {
          statusBox.className = 'lic-req-status-box rejected';
          statusBox.style.display = 'flex';
        }
        if (statusIcon) statusIcon.textContent = '❌';
        if (statusTitle) statusTitle.textContent = 'YÊU CẦU BỊ TỪ CHỐI';
        if (statusDesc) statusDesc.textContent = `Lý do: ${data.reason || 'Thông tin không hợp lệ'}. Bạn có thể kiểm tra lại thông tin và gửi lại.`;
        toast(`Yêu cầu bị từ chối: ${data.reason || 'Không hợp lệ'}`, 'err');
      }
    } catch (err) {}
  }, 3000);
}

if (licReqForm) {
  licReqForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = ($('#req-name')?.value || '').trim();
    const planType = $('#req-plan-type')?.value || 'pro_30d';
    const message = ($('#req-msg')?.value || '').trim();
    const hwid = ($('#licmid')?.value || '').trim();

    if (!hwid || hwid.includes('Đang')) {
      toast('Đang đọc mã máy, vui lòng chờ 1-2 giây rồi bấm lại', 'err');
      return;
    }
    if (!name) {
      toast('Vui lòng nhập Tên hoặc Telegram của bạn', 'err');
      return;
    }

    try { localStorage.setItem('alexbright_saved_name', name); } catch (e) {}

    if (btnSubmitReq) {
      btnSubmitReq.disabled = true;
      btnSubmitReq.innerHTML = '<span>⏳</span> Đang gửi tới Telegram Admin...';
    }

    if (statusBox) {
      statusBox.className = 'lic-req-status-box pending';
      statusBox.style.display = 'flex';
    }
    if (statusIcon) statusIcon.textContent = '⏳';
    if (statusTitle) statusTitle.textContent = 'Đang gửi yêu cầu tới Admin...';
    if (statusDesc) statusDesc.textContent = 'Đang chuyển thông tin và ảnh bill về Telegram Admin...';

    try {
      const res = await fetch(`${CLOUD_LICENSE_SERVER}/api/request-license`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hwid,
          name,
          plan_type: planType,
          message,
          bill_b64: currentBillBase64
        })
      });
      const data = await res.json();
      if (data && data.success) {
        toast('Đã gửi yêu cầu tới Admin thành công! Vui lòng chờ duyệt trong giây lát.');
        if (btnSubmitReq) {
          btnSubmitReq.disabled = false;
          btnSubmitReq.innerHTML = '<span>✅</span> ĐÃ GỬI XONG — ĐANG CHỜ PHÊ DUYỆT';
          btnSubmitReq.style.background = 'linear-gradient(135deg, #059669 0%, #10b981 100%)';
        }
        if (statusTitle) statusTitle.textContent = 'Đang chờ Admin phê duyệt qua Telegram...';
        if (statusDesc) statusDesc.textContent = 'Yêu cầu kèm mã máy và bill đã đến Telegram Admin. Tool sẽ tự động mở khóa ngay khi Admin bấm duyệt trên điện thoại!';
        pollRequestStatus(hwid);
      } else {
        throw new Error(data.error || 'Gửi yêu cầu thất bại');
      }
    } catch (err) {
      if (btnSubmitReq) {
        btnSubmitReq.disabled = false;
        btnSubmitReq.innerHTML = '<span>🚀</span> GỬI LẠI YÊU CẦU';
      }
      if (statusBox) {
        statusBox.className = 'lic-req-status-box rejected';
        statusBox.style.display = 'flex';
      }
      if (statusIcon) statusIcon.textContent = '⚠️';
      if (statusTitle) statusTitle.textContent = 'Lỗi kết nối';
      if (statusDesc) statusDesc.textContent = err.message || 'Không thể gửi yêu cầu tới máy chủ. Vui lòng thử lại.';
      toast(err.message || 'Lỗi gửi yêu cầu', 'err');
    }
  });
}

// Nút kiểm tra bản quyền
const licTryBtn = $('#lictry');
if (licTryBtn) {
  licTryBtn.addEventListener('click', async () => {
    const errBox = $('#licerr');
    if (errBox) {
      errBox.classList.remove('visible');
      errBox.textContent = '';
    }
    licTryBtn.disabled = true;
    const oldHtml = licTryBtn.innerHTML;
    licTryBtn.innerHTML = '<span>⏳ Đang kiểm tra với máy chủ...</span>';
    try {
      const st = await api('POST', '/api/license/trial');
      const isVerified = await checkLicense();
      if (isVerified) {
        toast('Kích hoạt thành công! Chào mừng đến với ALEX BRIGHT TOOL.');
      } else {
        if (errBox) {
          errBox.textContent = st.reason || 'Mã máy chưa được kích hoạt trên hệ thống. Hãy liên hệ Telegram @anony88888 hoặc Email alexbright.dmca@gmail.com';
          errBox.classList.add('visible');
        }
      }
      await App.refresh();
    } catch (err) {
      if (errBox) {
        errBox.textContent = err.message || 'Lỗi kết nối kiểm tra bản quyền.';
        errBox.classList.add('visible');
      }
    } finally {
      licTryBtn.disabled = false;
      licTryBtn.innerHTML = oldHtml;
    }
  });
}

// Legacy form support (nếu nhập key trực tiếp)
const licForm = $('#licform');
if (licForm) {
  licForm.addEventListener('submit', async e => {
    e.preventDefault();
    const errBox = $('#licerr');
    if (errBox) { errBox.classList.remove('visible'); errBox.textContent = ''; }
    try {
      const st = await api('POST', '/api/license/activate', {key: $('#lickey')?.value || ''});
      if (!st.ok) {
        if (errBox) { errBox.textContent = st.reason || 'Kích hoạt thất bại.'; errBox.classList.add('visible'); }
      } else {
        toast('Đã kích hoạt thành công!');
      }
      await checkLicense(); await App.refresh();
    } catch (err) {
      if (errBox) { errBox.textContent = err.message; errBox.classList.add('visible'); }
    }
  });
}

// ------------------------------------------------------------ vòng làm mới
let lastDone = -1, failures = 0, refreshTimer = null, refreshing = false, licTick = 0;
App.refresh = async function () {
  if (refreshing) return;
  refreshing = true;
  try {
    const s = await api('GET', '/api/state');
    const first = !S.meta;
    S.meta = s.meta; S.profiles = s.profiles; S.jobs = s.jobs;
    S.trial = null;
    for (const btnId of ['#go', '#go_pro', '#go_multi']) {
      const b = $(btnId);
      if (b && b.disabled && b.title?.includes('dùng thử')) {
        b.disabled = false;
        b.title = '';
      }
    }
    // Nút «Xem Dola» sáng/nhạt theo cửa sổ thực đang mở (đóng cửa sổ thì nút tự nhạt).
    S.winShown = new Set(s.meta.viewers || []);
    if (first) { Composer.renderMeta(s.meta); Settings.applyTheme(s.meta.settings.theme); Composer.restoreDraft(); }
    else if (s.meta.settings.theme !== Settings.theme) Settings.applyTheme(s.meta.settings.theme);
    renderPause(s.meta);
    Jobs.renderKpi(s.meta);
    Accounts.render(s.profiles);
    Jobs.render(s.jobs);
    Composer.updateCost();
    // Số lượt dùng thử đổi khi có video xong; ngoài ra app tự hỏi lại máy chủ
    // định kỳ (hết hạn, bị khoá) nên cũng xem lại mỗi ~30 giây.
    const done = s.jobs.filter(j => j.status === 'done').length;
    licTick++;
    if (done !== lastDone || licTick % 2 === 0) { lastDone = done; checkLicense(); }
    if (failures) { failures = 0; $('#offline').hidden = true; toast('Đã kết nối lại với app'); }
  } catch (err) {
    failures++;
    if (failures >= 2) { $('#offline').hidden = false; $('#offline').textContent = 'Mất kết nối với app: ' + err.message + ' — đang thử lại…'; }
  } finally { refreshing = false; }
  schedule();
};
function schedule() {
  clearTimeout(refreshTimer);
  // Ẩn cửa sổ thì thưa ra; lỗi liên tiếp thì giãn dần tới 10 giây.
  const ms = document.hidden ? 8000 : failures >= 3 ? 10000 : 2000;
  refreshTimer = setTimeout(App.refresh, ms);
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) { App.refresh(); if (S.tab === 'logs') Logs.poll(); } });

// ------------------------------------------------------------ khởi động
Settings.applyTheme(lsGet('theme', 'auto'));
App.showTab(lsGet('tab', 'video'));
checkLicense().then(App.refresh);
Assets.load();


// =============================================================================
// POP-UP THÔNG BÁO TỪ ADMIN (POLLING ĐỊNH KỲ VỚI CLOUDFLARE)
// =============================================================================
let lastAnnouncementId = '';

async function checkAnnouncement() {
  try {
    const res = await fetch(CLOUD_LICENSE_SERVER + '/api/announcement', { method: 'GET', cache: 'no-store' });
    const data = await res.json();
    if (!data || !data.active || !data.message) return;

    const annId = data.id || ('ann_' + data.created_at);
    const seenId = localStorage.getItem('seen_ann_id');
    if (seenId === annId) return;

    // Hiển thị Pop-up modal
    const modal = $('#broadcast-modal');
    if (!modal) return;

    const titleEl = $('#bc-title');
    const msgEl = $('#bc-msg');
    const badgeEl = $('#bc-badge');

    if (titleEl) titleEl.textContent = data.title || '📢 THÔNG BÁO TỪ ADMIN';
    if (msgEl) msgEl.textContent = data.message;

    if (badgeEl) {
      if (data.type === 'danger') {
        badgeEl.textContent = '🚨';
        badgeEl.style.borderColor = '#ef4444';
        badgeEl.style.background = 'rgba(239, 68, 68, 0.2)';
      } else if (data.type === 'warning') {
        badgeEl.textContent = '⚠️';
        badgeEl.style.borderColor = '#f59e0b';
        badgeEl.style.background = 'rgba(245, 158, 11, 0.2)';
      } else {
        badgeEl.textContent = '📢';
        badgeEl.style.borderColor = '#38bdf8';
        badgeEl.style.background = 'rgba(56, 189, 248, 0.2)';
      }
    }

    openModal(modal);
    modal.hidden = false;
    modal.style.display = 'flex';

    const closeBtn = $('#btn-close-broadcast');
    if (closeBtn) {
      closeBtn.onclick = () => {
        localStorage.setItem('seen_ann_id', annId);
        closeModal(modal);
        modal.hidden = true;
        modal.style.display = 'none';
      };
    }
  } catch (err) {}
}

// Kiểm tra thông báo khi khởi động và định kỳ mỗi 30s
setTimeout(checkAnnouncement, 2000);
setInterval(checkAnnouncement, 30000);

// =============================================================================
// ĐỒNG BỘ KÊNH HỖ TRỢ / ZALO / TELEGRAM ĐỘNG TỪ CLOUDFLARE
// =============================================================================
let currentSupportContact = {
  zalo: "https://zalo.me/0988888888",
  telegram: "https://t.me/anony88888",
  tele_user: "@anony88888",
  hotline: "0988.888.888",
  email: "alexbright.dmca@gmail.com"
};

function openExternalLink(url) {
  try {
    if (window.require) {
      const { shell } = window.require('electron');
      if (shell) return shell.openExternal(url);
    }
  } catch (e) {}
  window.open(url, '_blank');
}

async function syncSupportContact() {
  try {
    const res = await fetch(CLOUD_LICENSE_SERVER + '/api/support-info', { method: 'GET', cache: 'no-store' });
    const data = await res.json();
    if (data) {
      if (data.zalo) currentSupportContact.zalo = data.zalo;
      if (data.telegram) currentSupportContact.telegram = data.telegram;
      if (data.tele_user) currentSupportContact.tele_user = data.tele_user;
      if (data.hotline) currentSupportContact.hotline = data.hotline;
      if (data.email) currentSupportContact.email = data.email;
    }
  } catch (e) {}

  const valZalo = $('#val-contact-zalo');
  const valTele = $('#val-contact-tele');
  const valEmail = $('#val-contact-email');

  if (valZalo) valZalo.textContent = currentSupportContact.zalo ? 'Zalo Admin' : 'Chưa thiết lập';
  if (valTele) valTele.textContent = currentSupportContact.tele_user || '@anony88888';
  if (valEmail) valEmail.textContent = currentSupportContact.email || 'alexbright.dmca@gmail.com';
}

function setupSupportClickHandlers() {
  const getHwid = () => {
    const el = $('#licmid') || $('#licmcode');
    return el ? el.value.trim() : '';
  };

  const btnOpenZalo = $('#btn-open-zalo');
  const btnQuickZalo = $('#btn-quick-zalo');
  const btnCopyZalo = $('#btn-copy-zalo');

  const handleZaloClick = () => {
    let url = currentSupportContact.zalo || 'https://zalo.me';
    openExternalLink(url);
  };

  if (btnOpenZalo) btnOpenZalo.onclick = handleZaloClick;
  if (btnQuickZalo) btnQuickZalo.onclick = handleZaloClick;
  if (btnCopyZalo) {
    btnCopyZalo.onclick = (e) => {
      e.stopPropagation();
      copyToClipboard(currentSupportContact.zalo || '', 'Đã sao chép link Zalo!');
    };
  }

  const btnOpenTele = $('#btn-open-tele');
  const btnQuickTele = $('#btn-quick-tele');
  const btnCopyTele = $('#btn-copy-tele');

  const handleTeleClick = () => {
    let url = currentSupportContact.telegram || 'https://t.me/anony88888';
    openExternalLink(url);
  };

  if (btnOpenTele) btnOpenTele.onclick = handleTeleClick;
  if (btnQuickTele) btnQuickTele.onclick = handleTeleClick;
  if (btnCopyTele) {
    btnCopyTele.onclick = (e) => {
      e.stopPropagation();
      copyToClipboard(currentSupportContact.tele_user || '@anony88888', 'Đã sao chép Telegram!');
    };
  }

  const btnOpenEmail = $('#btn-open-email');
  const btnCopyEmail = $('#btn-copy-email');
  if (btnOpenEmail) {
    btnOpenEmail.onclick = () => {
      const hwid = getHwid();
      openExternalLink('mailto:' + (currentSupportContact.email || 'alexbright.dmca@gmail.com') + '?subject=' + encodeURIComponent('Kích hoạt Tool Seedance - HWID ' + hwid) + '&body=' + encodeURIComponent('Chào Admin, nhờ duyệt giúp tôi mã máy: ' + hwid));
    };
  }
  if (btnCopyEmail) {
    btnCopyEmail.onclick = (e) => {
      e.stopPropagation();
      copyToClipboard(currentSupportContact.email || 'alexbright.dmca@gmail.com', 'Đã sao chép Email!');
    };
  }
}

// Khởi chạy đồng bộ thông tin liên hệ
setTimeout(() => {
  syncSupportContact();
  setupSupportClickHandlers();
}, 1000);

// =============================================================================
// ĐỒNG BỘ LƯU Ý & HƯỚNG DẪN TỪ ADMIN
// =============================================================================
async function syncSystemNotes() {
  try {
    const res = await fetch(CLOUD_LICENSE_SERVER + '/api/system-notes', { method: 'GET', cache: 'no-store' });
    const data = await res.json();
    const box = $('#admin-notes-box');
    const contentEl = $('#admin-notes-content');
    const tagEl = $('#admin-notes-tag');

    if (!box || !contentEl) return;

    if (data && data.active !== false && data.content && data.content.trim()) {
      contentEl.textContent = data.content;
      if (tagEl) tagEl.textContent = data.tag || 'Quan trọng';
      box.style.display = 'block';
    } else {
      box.style.display = 'none';
    }
  } catch (e) {}
}

setTimeout(syncSystemNotes, 2500);
setInterval(syncSystemNotes, 30000);


