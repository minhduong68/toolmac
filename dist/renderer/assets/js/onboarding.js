/* ALEX BRIGHT TOOL - Interactive Step-by-Step Walkthrough Tour
 * Hướng dẫn trực quan từng bước: chỉ thẳng vào nút trên giao diện tool thật
 * Bước 1: Ấn vào đây để thêm acc
 * Bước 2: Sau khi thêm acc thì ấn vào đây để lưu
 * Bước 3: Ấn vào đây để nhập prompt tạo video
 * Bước 4: Ấn chọn acc
 * Bước 5: Ấn nút tạo video
 * Bước 6: Ấn vào đây để xem tình trạng job tạo video
 * Có nút tắt hướng dẫn để clear
 */
'use strict';

const TourGuide = {
  currentStep: 0,
  active: false,
  overlayEl: null,
  spotlightEl: null,
  tooltipEl: null,

  steps: [
    {
      id: 'step-add-acc',
      stepNum: 'Bước 1 / 6',
      title: 'Thêm tài khoản Dola',
      pointer: '👉 Ấn vào đây để thêm acc',
      desc: 'Bấm nút <b>«+ Thêm acc nhanh»</b> để mở cửa sổ Chrome đăng nhập Dola riêng biệt (không cần dán cookie thủ công).',
      targetSelector: '#quickadd',
      btnText: 'Ấn thêm acc ngay →',
      prepare: () => {
        if (typeof App.showTab === 'function') App.showTab('accounts');
      },
      action: () => {
        const qBtn = $('#quickadd');
        if (qBtn) qBtn.click();
      }
    },
    {
      id: 'step-save-acc',
      stepNum: 'Bước 2 / 6',
      title: 'Đăng nhập & Lưu nick',
      pointer: '👉 Sau khi thêm acc thì ấn vào đây để lưu',
      desc: 'Sau khi cửa sổ Chrome mở trang Dola và bạn đăng nhập nick xong, ấn nút này để lưu nick và cookie vào tool!',
      targetSelector: '#quickaddconfirm',
      fallbackSelector: '#quickaddbox .box',
      btnText: 'Đã lưu xong / Tiếp theo →',
      prepare: () => {
        if (typeof App.showTab === 'function') App.showTab('accounts');
        const qbox = $('#quickaddbox');
        if (qbox && qbox.hidden) {
          const qBtn = $('#quickadd');
          if (qBtn) qBtn.click();
        }
        // Hiện sẵn nút xác nhận để người dùng dễ nhìn
        const confirmBtn = $('#quickaddconfirm');
        if (confirmBtn) confirmBtn.hidden = false;
      },
      action: () => {
        const qbox = $('#quickaddbox');
        if (qbox && !qbox.hidden) {
          closeModal(qbox);
        }
      }
    },
    {
      id: 'step-enter-prompt',
      stepNum: 'Bước 3 / 6',
      title: 'Nhập Prompt tạo video',
      pointer: '👉 Ấn vào đây để nhập prompt để tạo video',
      desc: 'Gõ nội dung mô tả kịch bản, nhân vật, chuyển động vào ô này. Có thể nhập nhiều dòng (mỗi dòng 1 video riêng biệt).',
      targetSelector: '#p',
      btnText: 'Đã nhập prompt → Tiếp tục',
      prepare: () => {
        const qbox = $('#quickaddbox');
        if (qbox && !qbox.hidden) closeModal(qbox);
        const p = $('#p');
        if (p) {
          p.focus();
          p.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      },
      action: () => {
        const p = $('#p');
        if (p) p.focus();
      }
    },
    {
      id: 'step-select-acc',
      stepNum: 'Bước 4 / 6',
      title: 'Chọn tài khoản chạy',
      pointer: '👉 Ấn chọn acc',
      desc: 'Bấm chọn tài khoản Dola mà bạn muốn sử dụng để tạo video (hoặc để mặc định nếu chạy 1 nick).',
      targetSelector: '#prof',
      btnText: 'Đã chọn acc → Tiếp tục',
      prepare: () => {
        const prof = $('#prof');
        if (prof) prof.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
      action: () => {
        const prof = $('#prof');
        if (prof) prof.focus();
      }
    },
    {
      id: 'step-create-video',
      stepNum: 'Bước 5 / 6',
      title: 'Bắt đầu tạo video 30s',
      pointer: '👉 Ấn nút tạo video',
      desc: 'Bấm nút này (hoặc bấm nhanh phím tắt <b>Ctrl + Enter</b>) để bắt đầu gửi yêu cầu tạo video 2.5 (30s) lên Dola!',
      targetSelector: '#go',
      btnText: 'Tiếp theo →',
      prepare: () => {
        const goBtn = $('#go');
        if (goBtn) goBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
      action: () => {}
    },
    {
      id: 'step-view-jobs',
      stepNum: 'Bước 6 / 6',
      title: 'Theo dõi tiến trình & Lấy video',
      pointer: '👉 Ấn vào đây để xem tình trạng job tạo video',
      desc: 'Bấm vào đây để xem danh sách video đang render, thời gian còn lại và tự động tải video 1080P về máy tính.',
      targetSelector: '#rtabs button[data-tab="video"]',
      btnText: 'Hoàn tất 🎉',
      prepare: () => {
        if (typeof App.showTab === 'function') App.showTab('video');
      },
      action: () => {
        if (typeof App.showTab === 'function') App.showTab('video');
      }
    }
  ],

  createElements() {
    if (this.overlayEl) return;

    this.overlayEl = document.createElement('div');
    this.overlayEl.id = 'tour-overlay';
    this.overlayEl.className = 'tour-overlay';
    this.overlayEl.hidden = true;
    this.overlayEl.style.display = 'none';

    this.spotlightEl = document.createElement('div');
    this.spotlightEl.id = 'tour-spotlight';
    this.spotlightEl.className = 'tour-spotlight';
    this.spotlightEl.hidden = true;
    this.spotlightEl.style.display = 'none';

    this.tooltipEl = document.createElement('div');
    this.tooltipEl.id = 'tour-tooltip';
    this.tooltipEl.className = 'tour-tooltip';
    this.tooltipEl.hidden = true;
    this.tooltipEl.style.display = 'none';

    this.overlayEl.appendChild(this.spotlightEl);
    this.overlayEl.appendChild(this.tooltipEl);
    document.body.appendChild(this.overlayEl);

    window.addEventListener('resize', () => {
      if (this.active) this.renderCurrentStep();
    });
    window.addEventListener('scroll', () => {
      if (this.active) this.renderCurrentStep();
    }, true);
  },

  start(stepIndex = 0) {
    this.createElements();
    this.active = true;
    this.currentStep = Math.max(0, Math.min(stepIndex, this.steps.length - 1));
    this.overlayEl.hidden = false;
    this.overlayEl.style.display = 'block';
    lsSet('seedance_tour_dismissed', false);
    this.renderCurrentStep();
  },

  stop() {
    this.active = false;
    if (this.overlayEl) {
      this.overlayEl.hidden = true;
      this.overlayEl.style.display = 'none';
    }
    if (this.spotlightEl) {
      this.spotlightEl.hidden = true;
      this.spotlightEl.style.display = 'none';
    }
    if (this.tooltipEl) {
      this.tooltipEl.hidden = true;
      this.tooltipEl.style.display = 'none';
    }
    lsSet('seedance_tour_dismissed', true);
    toast('Đã tắt hướng dẫn. Bấm «💡 Hướng dẫn» ở góc trên để mở lại bất cứ lúc nào!');
  },

  next() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.renderCurrentStep();
    } else {
      this.finish();
    }
  },

  prev() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.renderCurrentStep();
    }
  },

  finish() {
    this.active = false;
    if (this.overlayEl) {
      this.overlayEl.hidden = true;
      this.overlayEl.style.display = 'none';
    }
    if (this.spotlightEl) {
      this.spotlightEl.hidden = true;
      this.spotlightEl.style.display = 'none';
    }
    if (this.tooltipEl) {
      this.tooltipEl.hidden = true;
      this.tooltipEl.style.display = 'none';
    }
    lsSet('seedance_tour_dismissed', true);
    toast('🎉 Chúc mừng bạn đã nắm rõ các bước sử dụng ALEX BRIGHT TOOL!');
  },

  renderCurrentStep() {
    if (!this.active) return;
    const step = this.steps[this.currentStep];
    if (!step) return;

    if (typeof step.prepare === 'function') {
      try { step.prepare(); } catch (e) {}
    }

    setTimeout(() => {
      let targetEl = document.querySelector(step.targetSelector);
      if (!targetEl && step.fallbackSelector) {
        targetEl = document.querySelector(step.fallbackSelector);
      }
      if (!targetEl) {
        targetEl = document.querySelector('aside') || document.body;
      }

      this.updateTooltipContent(step, targetEl);
      this.updatePositions(targetEl);
    }, 80);
  },

  updateTooltipContent(step, targetEl) {
    const isFirst = this.currentStep === 0;
    const isLast = this.currentStep === this.steps.length - 1;

    this.tooltipEl.innerHTML = `
      <div class="tour-header">
        <span class="tour-step-badge">${step.stepNum}</span>
        <button type="button" class="tour-close-btn" id="tour-btn-close" title="Tắt hướng dẫn">
          <span>✕</span>
          <span>Tắt hướng dẫn</span>
        </button>
      </div>

      <div class="tour-title">${step.title}</div>
      <div class="tour-prompt-pointer">${step.pointer}</div>
      <div class="tour-desc">${step.desc}</div>

      <div class="tour-footer">
        <button type="button" class="btn sm quiet" id="tour-btn-prev" ${isFirst ? 'disabled' : ''}>← Quay lại</button>
        <div style="display:flex;gap:6px;align-items:center;">
          <button type="button" class="btn sm primary" id="tour-btn-action">${step.btnText}</button>
        </div>
      </div>
    `;

    const closeBtn = this.tooltipEl.querySelector('#tour-btn-close');
    if (closeBtn) closeBtn.onclick = () => this.stop();

    const prevBtn = this.tooltipEl.querySelector('#tour-btn-prev');
    if (prevBtn && !isFirst) prevBtn.onclick = () => this.prev();

    const actionBtn = this.tooltipEl.querySelector('#tour-btn-action');
    if (actionBtn) {
      actionBtn.onclick = () => {
        if (typeof step.action === 'function') {
          try { step.action(); } catch (e) {}
        }
        this.next();
      };
    }
  },

  updatePositions(targetEl) {
    if (!targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const pad = 6;

    // 1. Cập nhật viền Spotlight xung quanh nút thật
    this.spotlightEl.style.top = `${Math.max(0, rect.top - pad)}px`;
    this.spotlightEl.style.left = `${Math.max(0, rect.left - pad)}px`;
    this.spotlightEl.style.width = `${Math.max(30, rect.width + pad * 2)}px`;
    this.spotlightEl.style.height = `${Math.max(24, rect.height + pad * 2)}px`;
    this.spotlightEl.hidden = false;
    this.spotlightEl.style.display = 'block';

    // 2. Tính toạ độ Tooltip thẻ nổi
    const ttWidth = Math.min(360, window.innerWidth - 32);
    const ttHeight = 210;
    const margin = 16;

    let top = rect.bottom + 14;
    let left = rect.left;

    // Nếu rớt ra ngoài cạnh dưới -> đặt phía trên
    if (top + ttHeight > window.innerHeight - margin) {
      top = Math.max(margin, rect.top - ttHeight - 14);
    }

    // Nếu rớt ra ngoài cạnh phải -> ép lùi sang trái
    if (left + ttWidth > window.innerWidth - margin) {
      left = window.innerWidth - ttWidth - margin;
    }
    if (left < margin) left = margin;

    this.tooltipEl.style.width = `${ttWidth}px`;
    this.tooltipEl.style.top = `${Math.round(top)}px`;
    this.tooltipEl.style.left = `${Math.round(left)}px`;
    this.tooltipEl.hidden = false;
    this.tooltipEl.style.display = 'flex';
  }
};

// Khởi chạy khi DOM sẵn sàng
function initTourSetup() {
  // Dọn dẹp sạch thẻ hướng dẫn tĩnh cũ bên phải nếu còn sót trong cache/DOM
  const oldWidget = document.getElementById('guide-widget');
  if (oldWidget) oldWidget.remove();
  const oldFab = document.getElementById('guide-fab');
  if (oldFab) oldFab.remove();

  TourGuide.createElements();

  // Nút trên thanh Header Bar
  const guideBtn = $('#guidebtn');
  if (guideBtn) {
    guideBtn.addEventListener('click', () => {
      if (TourGuide.active) {
        TourGuide.stop();
      } else {
        TourGuide.start(0);
      }
    });
  }

  // Tự động mở hướng dẫn cho người mới (nếu chưa từng tắt)
  const isDismissed = lsGet('seedance_tour_dismissed', false);
  if (!isDismissed) {
    setTimeout(() => {
      TourGuide.start(0);
    }, 600);
  }
}

document.addEventListener('DOMContentLoaded', initTourSetup);
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  initTourSetup();
}
