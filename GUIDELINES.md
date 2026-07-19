# Muxintang Moxibustion Wellness Center - Hướng Dẫn Vận Hành & Phát Triển (v3.8.0-debug-01)

Tài liệu này ghi lại các quy định, cấu trúc tài nguyên, quy trình vận hành và cẩm nang xử lý sự cố cho hệ thống Muxintang Moxibustion Wellness Center.

## 1. BẢNG DANH MỤC TÀI NGUYÊN

| STT | Tên Tài Nguyên | Phiên Bản | Relative Path | Tác Dụng | Lệnh Tải Bù / CDN |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Trang Chủ | v3.8.0-debug-01 | `./index.html` | Cấu trúc DOM chính hiển thị cuốn sách 3D và thanh liên hệ | (Có sẵn trong source code) |
| 2 | Phong Cách Trang Chủ | v3.8.0-debug-01 | `./index.css` | Thiết kế giao diện, phối cảnh 3D, nền trong suốt, hiệu ứng lật trang tràn khung và zoom bìa | (Có sẵn trong source code) |
| 3 | Kịch Bản Trang Chủ | v3.8.0-debug-01 | `./main.js` | Logic vận hành Flipbook, chặn vuốt lật bìa, điều phối zoom bìa và hiệu ứng lật | (Có sẵn trong source code) |
| 4 | Server Cục Bộ | v1.0 | `./server.js` | Server tĩnh bằng Node.js thuần phục vụ chạy thử cục bộ | (Có sẵn trong source code) |
| 5 | Script Khởi Chạy | v1.0 | `./start_project.bat` | Script batch tự động nạp cấu hình, mở server và mở trang web | (Có sẵn trong source code) |
| 6 | Script Tắt Dự Án | v1.0 | `./stop_project.bat` | Script batch dừng an toàn mọi dịch vụ đang chạy ngầm | (Có sẵn trong source code) |
| 7 | Trình Quản Lý Dữ Liệu | v3.7 | `./data-manager.js` | Cầu nối đồng bộ dữ liệu IndexedDB offline và Firebase realtime online | (Có sẵn trong source code) |
| 8 | Thư Viện PageFlip | v2.0.7 | CDN | Thư viện lật trang sách 3D (StPageFlip) | `https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.js` |
| 9 | Firebase Compat Core | v9.22.0 | CDN | Thư viện nền tảng kết nối Firebase | `https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js` |
| 10 | Firebase Realtime DB | v9.22.0 | CDN | Đồng bộ dữ liệu các trang sách thời gian thực | `https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js` |
| 11 | Firebase Storage | v9.22.0 | CDN | Quản lý tải ảnh nền và tài nguyên media của spa | `https://www.gstatic.com/firebasejs/9.22.0/firebase-storage-compat.js` |
| 12 | Trang Quản Trị | v3.7 | `./admin.html` / `./admin1.html` | Giao diện quản trị, thiết kế kéo thả các trang sách custom | (Có sẵn trong source code) |
| 13 | Kịch Bản Quản Trị | v3.7 | `./admin.js` | Logic cắt ảnh, tạo layout trang động và đồng bộ đám mây | (Có sẵn trong source code) |

## 2. LOGIC CÀI ĐẶT & VẬN HÀNH

Dự án sử dụng kiến trúc hoàn toàn Frontend không qua Server biên dịch (Serverless), dựa trên IndexedDB và Firebase. Để vận hành và chạy thử dự án trên máy trạm **RABBIT**:

*   **Bước 1: Mở Terminal hoặc PowerShell**
*   **Bước 2: Di chuyển vào thư mục dự án**
    ```powershell
    cd /d "c:\Users\Ok_duoc\Desktop\test02"
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
| **Lật trang bìa bị giật hoặc vẫn tự lật khi vuốt** | Sự kiện touch/mouse trên trang bìa rò rỉ lên container cha (bubble) khiến thư viện PageFlip nhận được cử chỉ. | Gọi `e.stopPropagation()` trong tất cả các sự kiện `touchstart`, `touchmove`, `touchend`, `touchcancel`, `mousedown`, `mousemove`, `mouseup`, `mouseleave` trên trang bìa (index 1). |
| **Ảnh trang bìa bị méo dẹt (sai tỷ lệ)** | Tỷ lệ ASPECT_RATIO trong JS sai lệch (cũ là 0.73) hoặc thuộc tính CSS `.page-content` sử dụng `background-size: 100% 100%` ép ảnh co giãn. | Đặt `ASPECT_RATIO = 0.75` (tương ứng tỷ lệ 3:4 chuẩn) trong `main.js`. Đồng thời áp dụng `background-size: cover !important` trong `index.css` cho `.page-content` để giữ nguyên tỷ lệ ảnh gốc. |
| **Trang bìa khi phóng to đè lên các trang khác khi đã lật sách** | Class `.zoomed` có `z-index: 1000 !important` cố định được áp đặt vĩnh viễn trên trang bìa. | Chỉ áp dụng `z-index: 1000 !important` và bóng đổ cực lớn khi trang bìa có class `.zoomed` (tức là khi người dùng đang chạm vuốt phóng to). Khi buông tay, xóa class `.zoomed` để trả về z-index do thư viện tự động quản lý. |
| **Mất hiệu ứng 3D sâu khi lật trang** | Phối cảnh `perspective` trong `.book-viewport` quá lớn (2500px) tạo góc nhìn dẹt. | Giảm `perspective` xuống `1400px` trong CSS để tạo góc nghiêng lật trang sâu và mạnh hơn, mang lại hiệu ứng 3D sống động. |
| **Khung 2 bị tối xám và che khuất nền** | CSS cũ đặt `background: rgba(18, 22, 18, 0.7)` kèm `box-shadow` tối màu. | Sửa `#khung-2` thành `background: transparent !important` và `box-shadow: none !important`. |
| **Cổng 8000 đã bị chiếm dụng** | Có dịch vụ khác đang chạy trên Port 8000. | Đổi biến môi trường `PORT=8080` trong file `.env` hoặc đổi trực tiếp cổng trong file `server.js` dòng 5. |
