#!/bin/bash
# ==============================================================================
#           ALEX BRIGHT TOOL - AI AUTOMATION STUDIO (macOS Edition)
# ==============================================================================
cd "$(dirname "$0")"

echo "========================================================"
echo "         ALEX BRIGHT TOOL - AI STUDIO v2.6.8"
echo "               PHIÊN BẢN DÀNH CHO MACOS"
echo "========================================================"
echo "* Hệ thống tự động hóa video AI chuyên nghiệp."
echo "* Tool sử dụng Mã Máy (HWID) để xác thực bản quyền."
echo "========================================================"
echo ""

# 1. Cấp quyền thực thi cho các file nhị phân nếu có
if [ -d "resources/bin" ]; then
    chmod -R +x resources/bin/* 2>/dev/null
fi

# 2. Kiểm tra Node.js
if ! command -v node &> /dev/null; then
    echo "⚠️ Máy của bạn chưa có Node.js!"
    echo "👉 Đang tự động kiểm tra Homebrew..."
    if command -v brew &> /dev/null; then
        echo "Đang cài đặt Node.js qua Homebrew..."
        brew install node
    else
        echo "❌ Vui lòng cài đặt Node.js từ: https://nodejs.org/"
        echo "Hoặc cài Homebrew tại: https://brew.sh"
        read -p "Bấm phím bất kỳ để thoát..."
        exit 1
    fi
fi

# 3. Kiểm tra node_modules
if [ ! -d "node_modules" ] || [ ! -d "node_modules/electron" ]; then
    echo "📦 [1/2] Đang cài đặt thư viện khởi chạy lần đầu (khoảng 30 giây)..."
    npm install
fi

# 4. Khởi chạy Tool
echo "🚀 [2/2] Đang khởi chạy ALEX BRIGHT TOOL..."
npx electron .

echo ""
echo "Tool đã đóng."
