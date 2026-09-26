#!/bin/bash
# ==============================================================================
#      MỞ KHÓA BẢO MẬT APPLE GATEKEEPER CHO MACBOOK ("ỨNG DỤNG BỊ HỎNG")
# ==============================================================================
cd "$(dirname "$0")"

echo "========================================================"
echo "   TIỆN ÍCH MỞ KHÓA BẢO MẬT APPLE GATEKEEPER CHO MAC"
echo "========================================================"
echo ""
echo "Đang gỡ bỏ thuộc tính cách ly (Quarantine) của Apple..."

# 1. Gỡ cách ly thư mục hiện tại
xattr -cr . 2>/dev/null

# 2. Gỡ cách ly nếu app đã được kéo vào /Applications
if [ -d "/Applications/ALEX BRIGHT TOOL.app" ]; then
    xattr -cr "/Applications/ALEX BRIGHT TOOL.app" 2>/dev/null
fi

# 3. Cấp quyền chạy cho các file thực thi
chmod +x Chay_Tool_Mac.command 2>/dev/null
chmod +x Dong_Goi_File_Cai_Dat_DMG.command 2>/dev/null
if [ -d "resources/bin" ]; then
    chmod -R +x resources/bin/* 2>/dev/null
fi

echo "✅ ĐÃ MỞ KHÓA THÀNH CÔNG!"
echo "Bây giờ bạn có thể nhấp đúp mở App hoặc mở file Chay_Tool_Mac.command bình thường."
echo ""
read -p "Bấm phím Enter để đóng cửa sổ này..."
