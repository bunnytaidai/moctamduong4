# Muxintang Moxibustion Wellness Center - Hướng Dẫn Vận Hành & Phát Triển (v3.9.0-debug-05)

Tài liệu này ghi lại các quy định, cấu trúc tài nguyên, quy trình vận hành và cẩm nang xử lý sự cố cho hệ thống Muxintang Moxibustion Wellness Center.

## 1. BẢNG DANH MỤC TÀI NGUYÊN

| STT | Tên Tài Nguyên | Phiên Bản | Relative Path | Tác Dụng | Lệnh Tải Bù / CDN |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Trang Chủ | v3.9.0-debug-05 | `./index.html` | Cấu trúc DOM chính hiển thị cuốn sách 3D và thanh liên hệ | (Có sẵn trong source code) |
| 2 | Phong Cách Trang Chủ | v3.9.0-debug-05 | `./index.css` | Thiết kế giao diện, phối cảnh 3D, nền trong suốt, hiệu ứng lật trang tràn khung và bóng đổ 3D sâu cực mạnh (không phóng to cuốn sách khi lật) | (Có sẵn trong source code) |
| 3 | Kịch Bản Trang Chủ | v3.9.0-debug-05 | `./main.js` | Logic vận hành Flipbook mượt mà, cố định chế độ trang đôi (orientation: landscape) trên tất cả thiết bị để giữ nguyên vị trí và kích thước gốc khi chạm vuốt | (Có sẵn trong source code) |
| 4 | Server Cục Bộ | v1.1 | `./server.js` | Server tĩnh bằng Node.js thuần hỗ trợ thêm API `/api/list-images` quét ảnh động | (Có sẵn trong source code) |
| 5 | Script Khởi Chạy | v1.0 | `./start_project.bat` | Script batch tự động nạp cấu hình, mở server và mở trang web | (Có sẵn trong source code) |
| 6 | Script Tắt Dự Án | v1.0 | `./stop_project.bat` | Script batch dừng an toàn mọi dịch vụ đang chạy ngầm | (Có sẵn trong source code) |
| 7 | Trình Quản Lý Dữ Liệu | v3.9.0-debug-05 | `./data-manager.js` | Đồng bộ dữ liệu, tự động thêm/xóa/sửa trang thực đơn theo tệp ảnh thực tế trong thư mục images | (Có sẵn trong source code) |
| 8 | Thư Viện PageFlip | v2.0.7 | CDN | Thư viện lật trang sách 3D (StPageFlip) | `https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.js` |
| 9 | Firebase Compat Core | v9.22.0 | CDN | Thư viện nền tảng kết nối Firebase | `https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js` |
| 10 | Firebase Realtime DB | v9.22.0 | CDN | Đồng bộ dữ liệu các trang sách thời gian thực | `https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js` |
| 11 | Firebase Storage | v9.22.0 | CDN | Quản lý tải ảnh nền và tài nguyên media của spa | `https://www.gstatic.com/firebasejs/9.22.0/firebase-storage-compat.js` |
| 12 | Trang Quản Trị | v3.9.0-debug-05 | `./admin.html` | Giao diện quản trị, WYSIWYG canvas, kéo thả sắp xếp trang và tuỳ chỉnh chữ nâng cao | (Có sẵn trong source code) |
| 13 | Kịch Bản Quản Trị | v3.9.0-debug-05 | `./admin.js` | Cấu hình đám mây, quét repo và tự động đẩy mã nguồn lên GitHub | (Có sẵn trong source code) |

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
| **Verify token thất bại khi liên kết GitHub Cloud (Lỗi đồng bộ)** | GitHub API siết chặt bảo mật OAuth, sử dụng header `Authorization: token ...` cũ bị chặn hoặc thiếu Accept header dẫn đến 401/403 Verify thất bại. | Cập nhật toàn bộ header gọi API GitHub trong `admin.js` và `data-manager.js` sang định dạng `Authorization: Bearer <token>` chuẩn mới, đồng thời bổ sung `'Accept': 'application/vnd.github+json'` và `'X-GitHub-Api-Version': '2022-11-28'` cho 100% cuộc gọi. |
| **Trang chủ hiển thị thiếu trang so với thư mục images** | Dữ liệu khởi tạo hoặc dữ liệu tĩnh trên máy chủ không được cập nhật khi Thỏ tự thêm/xóa file ảnh menu trong thư mục `images/`. | Hệ thống tự động quét danh sách ảnh động trong thư mục `images/` (qua API `/api/list-images` ở local hoặc API GitHub khi online). Tự động tạo thêm trang mới cho ảnh mới, tự xóa trang cũ cho ảnh đã xóa, và sắp xếp chính xác thứ tự: `dau.jpg` -> các trang số tăng dần -> `cuoi.jpg`. |
| **Cuốn sách bị trượt ngang dịch chuyển vị trí khi lật trang trên di động dọc** | StPageFlip tự động chuyển sang chế độ trang đơn (Portrait) và căn giữa trang hiện tại khiến cuốn sách bị dịch ngang qua lại lúc lật trang. | Cấu hình ép buộc chế độ trang đôi liên tục bằng `orientation: "landscape"` trên mọi thiết bị. Giúp cố định trục gáy sách ở tâm màn hình 100%, cuốn sách nằm im phăng phắc, giữ nguyên vị trí và kích thước gốc khi chạm vuốt. |
| **Cuốn sách bị co giãn phóng to khi đang lật trang (scale và translateZ)** | Class `.flipbook.flipping-active` cũ áp dụng `transform: scale(1.04) translateZ(60px)` làm biến đổi kích thước gốc của thực đơn khi người dùng chạm vuốt. | Loại bỏ thuộc tính `transform` trong `.flipbook.flipping-active`. Đảm bảo kích thước gốc được giữ nguyên tuyệt đối 100% ở bất kỳ thiết bị nào, chỉ tăng cường bóng đổ tĩnh và động bên dưới cuốn thực đơn. |
| **Xung đột nền chữ làm che khuất nền ảnh spa** | Các phần tử chữ cũ có nền xám hoặc đen mặc định. | Cung cấp tùy chọn checkbox "Xóa nền (Trong suốt)" đặt `bgTransparent: true` cho chữ và bảng báo giá dịch vụ. |
| **Cổng 8000 đã bị chiếm dụng** | Có dịch vụ khác đang chạy trên Port 8000. | Đổi biến môi trường `PORT=8080` trong file `.env` hoặc đổi trực tiếp cổng trong file `server.js` dòng 5. |
