#!/bin/bash
# ==============================================================================
#      TỰ ĐỘNG ĐÓNG GÓI BẢN CÀI ĐẶT .DMG CHO NGƯỜI DÙNG MACBOOK
# ==============================================================================
cd "$(dirname "$0")"

echo "========================================================"
echo "    BẮT ĐẦU ĐÓNG GÓI BẢN CÀI ĐẶT .DMG CHO MACBOOK"
echo "========================================================"
echo ""

# 1. Kiểm tra Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Lỗi: Cần cài đặt Node.js trước khi build!"
    exit 1
fi

# 2. Cài đặt dependencies
echo "[1/3] Kiểm tra thư viện..."
npm install

# 3. Tiến hành đóng gói
echo "[2/3] Đang đóng gói ứng dụng thành file .dmg..."
npm run build:mac

# 4. Hoàn thành
if [ -d "dist_package" ]; then
    echo "[3/3] ✅ ĐÓNG GÓI THÀNH CÔNG!"
    echo "File .dmg đã được tạo trong thư mục: dist_package/"
    open dist_package
else
    echo "⚠️ Đóng gói kết thúc, vui lòng kiểm tra thông báo lỗi ở trên."
fi
