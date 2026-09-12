#!/bin/bash
# ==========================================================
# SCRIPT TỰ ĐỘNG CÀI ĐẶT TOOL SEEDANCE PRO TRÊN MACOS
# ==========================================================

echo "🚀 Đang chuẩn bị môi trường cho Tool Seedance Pro trên Mac..."

# Kiểm tra Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Chưa tìm thấy Node.js. Vui lòng cài đặt Node.js từ https://nodejs.org hoặc chạy: brew install node"
    exit 1
fi

echo "📦 Đang cài đặt thư viện Node.js..."
npm install

echo "🌐 Đang tải trình duyệt Playwright Chromium cho macOS..."
npx playwright install chromium

# Kiểm tra FFmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️ Chưa tìm thấy FFmpeg trên máy. Khuyến nghị cài đặt FFmpeg bằng Homebrew:"
    echo "   brew install ffmpeg"
else
    echo "✔ FFmpeg đã sẵn sàng tại: $(which ffmpeg)"
fi

# Cấp quyền thực thi
chmod +x run_mac.sh 2>/dev/null

echo "=========================================================="
echo "✅ Cài đặt hoàn tất! Bạn có thể chạy tool bằng lệnh:"
echo "   ./run_mac.sh"
echo "   hoặc: npm start"
echo "=========================================================="
