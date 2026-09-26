/**
 * Seedance AI Studio v2.5 - Reference Image Preprocessor
 * Mục tiêu: Chuẩn hóa chất lượng, tỷ lệ khung hình và tạo Reference Grid đa góc nhìn
 * (Face, Profile, Outfit, Context) nhằm tối ưu độ nhất quán (Consistency) cho Seedance 2.5.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ImagePreprocessor = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
  const MIN_DIMENSION = 256;              // Tối thiểu 256px
  const MAX_DIMENSION = 1280;             // Chuẩn Studio 1280px
  const JPEG_QUALITY = 0.88;              // Tối ưu dung lượng & chi tiết

  /**
   * Đọc file ảnh và trả về Image element đã load
   */
  function loadImage(srcOrFile) {
    return new Promise((resolve, reject) => {
      if (!srcOrFile) return reject(new Error('Chưa cung cấp nguồn ảnh'));
      if (typeof HTMLImageElement !== 'undefined' && srcOrFile instanceof HTMLImageElement) {
        if (srcOrFile.complete && (srcOrFile.naturalWidth > 0 || srcOrFile.width > 0)) return resolve(srcOrFile);
        srcOrFile.onload = () => resolve(srcOrFile);
        srcOrFile.onerror = () => reject(new Error('Ảnh bị lỗi hoặc không thể giải mã định dạng'));
        return;
      }
      if (typeof Image !== 'undefined' && srcOrFile instanceof Image) {
        if (srcOrFile.complete && (srcOrFile.naturalWidth > 0 || srcOrFile.width > 0)) return resolve(srcOrFile);
        srcOrFile.onload = () => resolve(srcOrFile);
        srcOrFile.onerror = () => reject(new Error('Ảnh bị lỗi hoặc không thể giải mã định dạng'));
        return;
      }
      if (typeof HTMLCanvasElement !== 'undefined' && srcOrFile instanceof HTMLCanvasElement) {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Không thể chuyển đổi canvas thành ảnh'));
        img.src = srcOrFile.toDataURL('image/jpeg', 0.95);
        return;
      }

      let resolvedSrc = null;
      if (typeof srcOrFile === 'string') {
        resolvedSrc = srcOrFile;
      } else if (typeof srcOrFile === 'object' && srcOrFile !== null) {
        if (typeof srcOrFile.dataUrl === 'string') resolvedSrc = srcOrFile.dataUrl;
        else if (typeof srcOrFile.src === 'string') resolvedSrc = srcOrFile.src;
        else if (typeof srcOrFile.preview === 'string') resolvedSrc = srcOrFile.preview;
      }

      if (resolvedSrc) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Ảnh bị lỗi hoặc không thể giải mã định dạng'));
        img.src = resolvedSrc;
        return;
      }

      if (srcOrFile instanceof Blob || (typeof File !== 'undefined' && srcOrFile instanceof File)) {
        const reader = new FileReader();
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Ảnh bị lỗi hoặc không thể giải mã định dạng'));
        reader.onload = (e) => { img.src = e.target.result; };
        reader.onerror = () => reject(new Error('Không thể đọc file ảnh'));
        reader.readAsDataURL(srcOrFile);
        return;
      }

      reject(new Error('Nguồn ảnh không hợp lệ'));
    });
  }

  /**
   * Kiểm tra tính hợp lệ của file ảnh
   */
  async function validateImage(file) {
    if (!file) return { valid: false, error: 'Chưa chọn file ảnh' };
    if (file.size && file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `Kích thước file (${(file.size / 1024 / 1024).toFixed(1)}MB) vượt quá giới hạn 20MB` };
    }
    const validExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.jfif'];
    const fileName = (file.name || '').toLowerCase();
    const hasValidExt = validExts.some(ext => fileName.endsWith(ext));
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
    if (file.type && !validTypes.includes(file.type.toLowerCase()) && !hasValidExt) {
      return { valid: false, error: `Định dạng ${file.type || 'không rõ'} không được hỗ trợ (cần JPEG, PNG hoặc WebP)` };
    }

    try {
      const img = await loadImage(file);
      if (img && img.width && img.height) {
        if (img.width < MIN_DIMENSION || img.height < MIN_DIMENSION) {
          return { valid: false, error: `Độ phân giải ảnh (${img.width}x${img.height}) quá nhỏ. Tối thiểu cần ${MIN_DIMENSION}x${MIN_DIMENSION}px` };
        }
        return {
          valid: true,
          width: img.width,
          height: img.height,
          size: file.size,
          name: file.name,
          type: file.type || 'image/jpeg'
        };
      }
    } catch (err) {
      // Cho phép tiếp tục nếu file hợp lệ
      return { valid: true, size: file.size, name: file.name, type: file.type || 'image/jpeg' };
    }
    return { valid: true, size: file.size, name: file.name, type: file.type || 'image/jpeg' };
  }

  /**
   * Resize và chuẩn hóa 1 ảnh đơn (Max 1280px, Lanczos/Bicubic scale)
   */
  async function normalizeSingleImage(srcOrFile, maxDim = MAX_DIMENSION, quality = JPEG_QUALITY) {
    const img = await loadImage(srcOrFile);
    let targetW = img.naturalWidth || img.width;
    let targetH = img.naturalHeight || img.height;

    if (targetW > maxDim || targetH > maxDim) {
      if (targetW >= targetH) {
        targetH = Math.round((targetH * maxDim) / targetW);
        targetW = maxDim;
      } else {
        targetW = Math.round((targetW * maxDim) / targetH);
        targetH = maxDim;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(img, 0, 0, targetW, targetH);

    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    return {
      dataUrl,
      canvas,
      width: targetW,
      height: targetH,
      gridType: '1x1',
      toDataURL: (type = 'image/jpeg', q = quality) => canvas.toDataURL(type, q)
    };
  }

  /**
   * Tạo Reference Grid đa góc nhìn (1x1, 1x2, 2x2)
   * Giúp Seedance 2.5 nắm bắt toàn diện khuôn mặt, trang phục và dáng người
   */
  async function createReferenceGrid(sources, gridType = '1x2', quality = JPEG_QUALITY) {
    if (!Array.isArray(sources) || sources.length === 0) {
      throw new Error('Cần ít nhất 1 ảnh để tạo Reference Grid');
    }

    const images = [];
    for (const src of sources) {
      try {
        const im = await loadImage(src);
        images.push(im);
      } catch (err) {
        console.warn('[ImagePreprocessor] Bỏ qua ảnh lỗi:', err.message);
      }
    }

    if (images.length === 0) {
      throw new Error('Không có ảnh hợp lệ nào được tải lên');
    }

    // Grid 1x1: Ảnh chuẩn hóa đơn
    if (gridType === '1x1') {
      return await normalizeSingleImage(images[0], MAX_DIMENSION, quality);
    }

    const BORDER = 6;
    const BG_COLOR = '#0f172a'; // Nền slate tối tiêu chuẩn

    // Grid 1x2: Ghép 2 ảnh song song (Chân dung + Toàn thân/Trang phục)
    if (gridType === '1x2') {
      const targetH = 720;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (images.length === 1) {
        // TỰ ĐỘNG TẠO 2 GÓC TỪ 1 ẢNH DUY NHẤT: Ô 1 Cận mặt, Ô 2 Toàn cảnh
        const im = images[0];
        const cellW = 540;
        canvas.width = cellW * 2 + BORDER;
        canvas.height = targetH;
        ctx.fillStyle = BG_COLOR;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const iw = im.naturalWidth || im.width || cellW;
        const ih = im.naturalHeight || im.height || targetH;

        // Ô 1: Cận mặt (Zoom ~1.7x vào nửa trên)
        const sw1 = iw / 1.7;
        const sh1 = ih / 1.7;
        const sx1 = Math.max(0, (iw - sw1) / 2);
        const sy1 = Math.max(0, ih * 0.08);
        ctx.drawImage(im, sx1, sy1, sw1, sh1, 0, 0, cellW, targetH);

        // Ô 2: Toàn cảnh / Gốc
        const scale2 = Math.max(cellW / iw, targetH / ih);
        const sw2 = cellW / scale2;
        const sh2 = targetH / scale2;
        const sx2 = (iw - sw2) / 2;
        const sy2 = (ih - sh2) / 2;
        ctx.drawImage(im, sx2, sy2, sw2, sh2, cellW + BORDER, 0, cellW, targetH);
      } else {
        const im1 = images[0];
        const im2 = images[1] || images[0];
        const h1 = im1.naturalHeight || im1.height || targetH;
        const w1_orig = im1.naturalWidth || im1.width || targetH;
        const h2 = im2.naturalHeight || im2.height || targetH;
        const w2_orig = im2.naturalWidth || im2.width || targetH;

        const w1 = Math.round(w1_orig * (targetH / h1));
        const w2 = Math.round(w2_orig * (targetH / h2));

        canvas.width = Math.min(MAX_DIMENSION, w1 + w2 + BORDER);
        canvas.height = targetH;
        ctx.fillStyle = BG_COLOR;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(im1, 0, 0, w1, targetH);
        ctx.drawImage(im2, w1 + BORDER, 0, w2, targetH);
      }

      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      return {
        dataUrl,
        canvas,
        width: canvas.width,
        height: canvas.height,
        gridType: '1x2',
        toDataURL: (type = 'image/jpeg', q = quality) => canvas.toDataURL(type, q)
      };
    }

    // Grid 2x2: Ghép 4 ô (Cận mặt, Góc nghiêng, Toàn thân, Bối cảnh)
    const cellW = 540;
    const cellH = 540;
    const canvasW = cellW * 2 + BORDER;
    const canvasH = cellH * 2 + BORDER;

    const canvas = document.createElement('canvas');
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    function drawCenterCrop(img, x, y, w, h) {
      const iw = img.naturalWidth || img.width || w;
      const ih = img.naturalHeight || img.height || h;
      const scale = Math.max(w / iw, h / ih);
      const sw = w / scale;
      const sh = h / scale;
      const sx = (iw - sw) / 2;
      const sy = (ih - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    }

    if (images.length === 1) {
      // 🌟 TỰ ĐỘNG TẠO BẢNG GRID 4 GÓC THÔNG MINH TỪ 1 ẢNH DUY NHẤT
      const im = images[0];
      const iw = im.naturalWidth || im.width || cellW;
      const ih = im.naturalHeight || im.height || cellH;

      // Ô 1 (Top-Left): Cận cảnh khuôn mặt (Face close-up, zoom ~1.8x nửa trên)
      const sw1 = iw / 1.8;
      const sh1 = ih / 1.8;
      const sx1 = Math.max(0, (iw - sw1) / 2);
      const sy1 = Math.max(0, ih * 0.08);
      ctx.drawImage(im, sx1, sy1, sw1, sh1, 0, 0, cellW, cellH);

      // Ô 2 (Top-Right): Góc đối xứng (Mirror horizontal flip)
      ctx.save();
      ctx.translate(cellW + BORDER + cellW, 0);
      ctx.scale(-1, 1);
      drawCenterCrop(im, 0, 0, cellW, cellH);
      ctx.restore();

      // Ô 3 (Bottom-Left): Trung cảnh (Mid-shot / 1.25x)
      const sw3 = iw / 1.25;
      const sh3 = ih / 1.25;
      const sx3 = Math.max(0, (iw - sw3) / 2);
      const sy3 = Math.max(0, (ih - sh3) / 2);
      ctx.drawImage(im, sx3, sy3, sw3, sh3, 0, cellH + BORDER, cellW, cellH);

      // Ô 4 (Bottom-Right): Toàn cảnh gốc (Master framing)
      drawCenterCrop(im, cellW + BORDER, cellH + BORDER, cellW, cellH);
    } else {
      // Nạp từ 2 - 4 ảnh rời
      const im1 = images[0];
      const im2 = images[1] || images[0];
      const im3 = images[2] || images[0];
      const im4 = images[3] || images[1] || images[0];

      drawCenterCrop(im1, 0, 0, cellW, cellH);
      drawCenterCrop(im2, cellW + BORDER, 0, cellW, cellH);
      drawCenterCrop(im3, 0, cellH + BORDER, cellW, cellH);
      drawCenterCrop(im4, cellW + BORDER, cellH + BORDER, cellW, cellH);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    return {
      dataUrl,
      canvas,
      width: canvasW,
      height: canvasH,
      gridType: '2x2',
      toDataURL: (type = 'image/jpeg', q = quality) => canvas.toDataURL(type, q)
    };
  }

  /**
   * Bộ lọc tàng hình AI (Stealth Cloak): Phủ vi nhiễu vô hình, lật gương ngang, xoay vi mô & đóng khung điện ảnh
   */
  async function applyStealthCloak(srcOrFile, options = {}) {
    const {
      microNoise = true,
      mirrorFlip = false,
      letterbox = false,
      quality = JPEG_QUALITY
    } = options;

    const img = await loadImage(srcOrFile);
    let targetW = img.naturalWidth || img.width;
    let targetH = img.naturalHeight || img.height;

    if (targetW > MAX_DIMENSION || targetH > MAX_DIMENSION) {
      if (targetW >= targetH) {
        targetH = Math.round((targetH * MAX_DIMENSION) / targetW);
        targetW = MAX_DIMENSION;
      } else {
        targetW = Math.round((targetW * MAX_DIMENSION) / targetH);
        targetH = MAX_DIMENSION;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.save();
    if (mirrorFlip) {
      // Lật gương ngang và xoay lệch 0.8 độ (phá vỡ pHash bản quyền)
      ctx.translate(targetW / 2, targetH / 2);
      ctx.rotate(0.014); // ~0.8 độ
      ctx.scale(-1, 1);
      ctx.translate(-targetW / 2, -targetH / 2);
    }
    ctx.drawImage(img, 0, 0, targetW, targetH);
    ctx.restore();

    // 1. Phủ vi nhiễu vô hình (Micro-noise Cloaking)
    if (microNoise) {
      try {
        const imgData = ctx.getImageData(0, 0, targetW, targetH);
        const data = imgData.data;
        const len = data.length;
        for (let i = 0; i < len; i += 4) {
          // Nhiễu Gaussian nhỏ +/- 4 giá trị màu (mắt thường không phân biệt được)
          const delta = (Math.random() - 0.5) * 7;
          data[i] = Math.min(255, Math.max(0, data[i] + delta));
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + delta));
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + delta));
        }
        ctx.putImageData(imgData, 0, 0);
      } catch (err) {
        console.warn('[applyStealthCloak] Không thể phủ vi nhiễu:', err.message);
      }
    }

    // 2. Viền phim điện ảnh & Scene Tag (Letterbox)
    if (letterbox) {
      const barH = Math.max(16, Math.round(targetH * 0.08));
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, targetW, barH);
      ctx.fillRect(0, targetH - barH, targetW, barH);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = `700 ${Math.max(10, Math.round(barH * 0.45))}px monospace`;
      ctx.fillText('SCENE DIRECTIVE - ORIGINAL FILM PRODUCTION #01', 12, targetH - Math.round(barH * 0.3));
    }

    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    return {
      dataUrl,
      canvas,
      width: targetW,
      height: targetH,
      toDataURL: (type = 'image/jpeg', q = quality) => canvas.toDataURL(type, q)
    };
  }

  return {
    validateImage,
    loadImage,
    normalizeSingleImage,
    createReferenceGrid,
    applyStealthCloak,
    MAX_FILE_SIZE,
    MIN_DIMENSION,
    MAX_DIMENSION
  };
});
