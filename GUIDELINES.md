# Muxintang Moxibustion Wellness Center - Hướng Dẫn Vận Hành & Phát Triển (v3.9.0-debug-01)

Tài liệu này ghi lại các quy định, cấu trúc tài nguyên, quy trình vận hành và cẩm nang xử lý sự cố cho hệ thống Muxintang Moxibustion Wellness Center.

## 1. BẢNG DANH MỤC TÀI NGUYÊN

| STT | Tên Tài Nguyên | Phiên Bản | Relative Path | Tác Dụng | Lệnh Tải Bù / CDN |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Trang Chủ | v3.9.0-debug-01 | `./index.html` | Cấu trúc DOM chính hiển thị cuốn sách 3D và thanh liên hệ | (Có sẵn trong source code) |
| 2 | Phong Cách Trang Chủ | v3.9.0-debug-01 | `./index.css` | Thiết kế giao diện, phối cảnh 3D, nền trong suốt, hiệu ứng lật trang tràn khung, zoom bìa và kéo thả trang | (Có sẵn trong source code) |
| 3 | Kịch Bản Trang Chủ | v3.9.0-debug-01 | `./main.js` | Logic vận hành Flipbook, chặn vuốt lật bìa, điều phối zoom bìa và vẽ trang custom mới | (Có sẵn trong source code) |
| 4 | Server Cục Bộ | v1.0 | `./server.js` | Server tĩnh bằng Node.js thuần phục vụ chạy thử cục bộ | (Có sẵn trong source code) |
| 5 | Script Khởi Chạy | v1.0 | `./start_project.bat` | Script batch tự động nạp cấu hình, mở server và mở trang web | (Có sẵn trong source code) |
| 6 | Script Tắt Dự Án | v1.0 | `./stop_project.bat` | Script batch dừng an toàn mọi dịch vụ đang chạy ngầm | (Có sẵn trong source code) |
| 7 | Trình Quản Lý Dữ Liệu | v3.9 | `./data-manager.js` | Cầu nối đồng bộ dữ liệu IndexedDB, Firebase và GitHub Cloud | (Có sẵn trong source code) |
| 8 | Thư Viện PageFlip | v2.0.7 | CDN | Thư viện lật trang sách 3D (StPageFlip) | `https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.js` |
| 9 | Firebase Compat Core | v9.22.0 | CDN | Thư viện nền tảng kết nối Firebase | `https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js` |
| 10 | Firebase Realtime DB | v9.22.0 | CDN | Đồng bộ dữ liệu các trang sách thời gian thực | `https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js` |
| 11 | Firebase Storage | v9.22.0 | CDN | Quản lý tải ảnh nền và tài nguyên media của spa | `https://www.gstatic.com/firebasejs/9.22.0/firebase-storage-compat.js` |
| 12 | Trang Quản Trị | v3.9.0-debug-01 | `./admin.html` | Giao diện quản trị, WYSIWYG canvas, kéo thả sắp xếp trang và tuỳ chỉnh chữ nâng cao | (Có sẵn trong source code) |
| 13 | Kịch Bản Quản Trị | v3.9.0-debug-01 | `./admin.js` | Logic kéo thả, thiết lập thuộc tính nâng cao của chữ và dịch vụ, đồng bộ GitHub Cloud | (Có sẵn trong source code) |

## 2. LOGIC CÀI ĐẶT & VẬN HÀNH

Dự án sử dụng kiến trúc hoàn toàn Frontend không qua Server biên dịch (Serverless), dựa trên IndexedDB, Firebase và GitHub API. Để vận hành và chạy thử dự án trên máy trạm **RABBIT**:

*   **Bước 1: Mở Terminal hoặc PowerShell**
*   **Bước 2: Di chuyển vào thư mục dự án**
    ```powershell
    cd /d "%~dp0"
    ```
*   **Bước 3: Khởi động Local Web Server để chạy thử**
    Có hai cách khởi chạy:
    - Cách A (Nhanh nhất): Chạy trực tiếp file `start_project.bat`.
    - Cách B (Thủ công): Chạy server qua Node.js:
      ```powershell
      node server.js
      ```
      Sau đó mở trình duyệt truy cập `http://localhost:8000/index.html`.

## 3. CẨM NANG CHẨN ĐOÁN LỖI (TROUBLESHOOTING)

| Tên Lỗi | Nguyên Nhân | Giải Pháp Tránh Xung Đột |
| :--- | :--- | :--- |
| **Verify Pages Actions thất bại (Lỗi 3 giây)** | Repo trên GitHub trống hoặc thiếu các tệp mã nguồn tĩnh (HTML/CSS/JS) cần thiết dẫn đến GitHub Pages build lỗi. | Khi người dùng lưu cài đặt GitHub Cloud hoặc nhấn lưu trang, hệ thống sẽ tự động gọi API GitHub đẩy toàn bộ source code (`index.html`, `index.css`, `main.js`, `.github/workflows/static.yml`...) lên repo để xây dựng Pages đồng nhất. |
| **Thiết bị khách bị lưu cache cũ không hiện thay đổi** | Trình duyệt lưu cache file `menu_data.json` và localstorage dữ liệu. | Mỗi lần lưu, hệ thống ghi thêm `last_updated: Date.now()`. Tại trang chủ, hệ thống sẽ tự động so sánh, nếu phát hiện phiên bản server mới hơn sẽ xoá cache local và hard reload trang. |
| **Kéo thả sắp xếp trang không phản hồi** | Thiếu thuộc tính `draggable="true"` hoặc xung đột sự kiện. | Toàn bộ item trang được gán `draggable="true"`. Sử dụng HTML5 Drag and Drop API cập nhật mảng orderedIds và đồng bộ về IndexedDB/Cloud. |
| **Xung đột nền chữ làm che khuất nền ảnh spa** | Các phần tử chữ cũ có nền xám hoặc đen mặc định. | Cung cấp tùy chọn checkbox "Xóa nền (Trong suốt)" đặt `bgTransparent: true` cho chữ và bảng báo giá dịch vụ. |
| **Cổng 8000 đã bị chiếm dụng** | Có dịch vụ khác đang chạy trên Port 8000. | Đổi biến môi trường `PORT=8080` trong file `.env` hoặc đổi trực tiếp cổng trong file `server.js` dòng 5. |
