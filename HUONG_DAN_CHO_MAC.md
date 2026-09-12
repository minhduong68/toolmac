# HƯỚNG DẪN CÀI ĐẶT & VẬN HÀNH TOOL SEEDANCE PRO TRÊN MACOS (MAC)
© 2026 ALEX BRIGHT TOOL - PRO UNLIMITED

---

## 📌 1. YÊU CẦU HỆ THỐNG
* **Hệ điều hành:** macOS 11 (Big Sur), 12 (Monterey), 13 (Ventura), 14 (Sonoma) hoặc mới hơn.
* **Kiến trúc Chip:** Hỗ trợ 100% cả **Apple Silicon (M1, M2, M3, M4)** và **Intel Core (x64)**.
* **Yêu cầu môi trường:** Cài sẵn **Node.js LTS** (tải tại https://nodejs.org).

---

## 🚀 2. CÁCH KHỞI CHẠY NHANH TRÊN MAC (DÀNH CHO DEV / SOURCE)

### Bước 1: Mở Terminal tại thư mục `Tool Mac`
Mở ứng dụng **Terminal** trên Mac, gõ lệnh `cd` trỏ đến thư mục này:
```bash
cd "/đường/dẫn/tới/Tool Mac"
```

### Bước 2: Chạy file cài đặt tự động
```bash
chmod +x setup_mac.sh run_mac.sh
./setup_mac.sh
```
Script sẽ tự động:
1. Cài đặt các gói phụ thuộc (`npm install`).
2. Tải trình duyệt Chromium headless tối ưu cho macOS.
3. Kiểm tra FFmpeg.

### Bước 3: Mở tool
```bash
./run_mac.sh
# hoặc:
npm start
```

---

## 📦 3. CÁCH ĐÓNG GÓI THÀNH FILE .DMG / .APP ĐỂ GỬI KHÁCH HÀNG DÙNG MAC

Nếu bạn muốn tạo file cài đặt `.dmg` chuyên nghiệp gửi cho khách hàng dùng Mac chỉ cần kéo thả vào thư mục Applications:

1. **Đóng gói cho Mac chip Apple Silicon (M1, M2, M3, M4):**
```bash
npm run build:mac:arm64
```

2. **Đóng gói cho Mac chip Intel:**
```bash
npm run build:mac:x64
```

3. **Đóng gói bản Universal (chạy được trên mọi máy Mac):**
```bash
npm run build:mac:universal
```

*File `.dmg` và `.zip` sẽ được tạo trong thư mục `dist/`.*

---

## ⚠️ 4. XỬ LÝ LỖI PHỔ BIẾN TRÊN MAC

### ❌ Lỗi 1: "App is damaged and can't be opened" (Ứng dụng bị hỏng)
* **Nguyên nhân:** Tính năng bảo mật Apple Gatekeeper tự động cách ly (quarantine) các file `.app` tải từ internet chưa có chứng chỉ Apple Developer.
* **Cách khắc phục (1 lệnh duy nhất):**
  Mở Terminal và chạy lệnh sau:
  ```bash
  sudo xattr -cr /Applications/"Tool Seedance Pro.app"
  ```
  *(Sau khi chạy lệnh trên, app sẽ mở mượt mà 100%).*

### ❌ Lỗi 2: Thiếu FFmpeg trên Mac
* Khách hàng mở Terminal và cài FFmpeg qua Homebrew:
  ```bash
  brew install ffmpeg
  ```
  *(Hoặc tool sẽ tự động fallback về thư viện có sẵn).*

---

## 🎬 5. CÁC TÍNH NĂNG ĐÃ THÍCH ỨNG TRÊN MAC
* **Thư mục lưu video:** Tự động lưu về thư mục chuẩn của Mac: `~/Movies/ALEX BRIGHT TOOL Video`.
* **Phím tắt:** Sử dụng tổ hợp phím `⌘ + Enter` (Command + Enter) để tạo nhanh video.
* **Menu macOS chuẩn:** Đầy đủ các phím tắt quen thuộc trên Mac như `⌘ + C` (Copy), `⌘ + V` (Paste), `⌘ + A` (Chọn tất cả), `⌘ + Q` (Thoát).
* **Đa luồng & Quota:** Kế thừa 100% thuật toán đa luồng song song thông minh và phân bổ 2 lượt/ngày theo tài khoản đã tối ưu.
