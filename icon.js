document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // 1. KHAI BÁO CÁC NÚT LIÊN HỆ (Footer Khung 3)
    // ==========================================================================
    const btnHotline = document.getElementById('btn-hotline');
    const btnZalo = document.getElementById('btn-zalo');
    const btnWechat = document.getElementById('btn-wechat');
    const btnMaps = document.getElementById('btn-maps');

    // Các thông tin liên hệ tĩnh
    const PHONE_NUMBER = "0968868712";
    const WECHAT_ID = "NGALADY0708";
    const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/SF9DLhzzgzkMXWKm7";

    // ==========================================================================
    // 2. CẤU HÌNH HÀNH ĐỘNG CHO TỪNG ICON
    // ==========================================================================

    // Nút 1: HOTLINE - Thực hiện cuộc gọi trực tiếp
    if (btnHotline) {
        btnHotline.setAttribute('href', `tel:${PHONE_NUMBER}`);
        btnHotline.addEventListener('click', (e) => {
            console.log(`[Hotline] Đang gọi điện thoại đến số: ${PHONE_NUMBER}`);
        });
    }

    // Nút 2: ZALO - Mở ứng dụng Zalo và vào khung chat trực tiếp
    if (btnZalo) {
        btnZalo.setAttribute('href', `https://zalo.me/${PHONE_NUMBER}`);
        btnZalo.setAttribute('target', '_blank');
        btnZalo.addEventListener('click', (e) => {
            console.log(`[Zalo] Đang mở Zalo chat trực tiếp với số: ${PHONE_NUMBER}`);
        });
    }

    // Nút 3: WECHAT - Tự động sao chép ID, mở modal hiển thị và khởi động ứng dụng WeChat
    const wechatModal = document.getElementById('wechat-modal');
    const closeModal = document.getElementById('close-modal');
    const btnCopyWechat = document.getElementById('btn-copy-wechat');
    const copyToast = document.getElementById('copy-toast');
    const wechatIdElement = document.getElementById('wechat-id');

    // Đảm bảo ID WeChat hiển thị chính xác trong Modal DOM
    if (wechatIdElement) {
        wechatIdElement.textContent = WECHAT_ID;
    }

    if (btnWechat) {
        btnWechat.addEventListener('click', () => {
            if (wechatModal) {
                wechatModal.classList.add('active');
            }
            // Tự động sao chép ID vào clipboard để người dùng tiện dán tìm kiếm
            copyWeChatID();
        });
    }

    if (closeModal && wechatModal) {
        closeModal.addEventListener('click', () => {
            wechatModal.classList.remove('active');
            if (copyToast) copyToast.classList.remove('show');
        });
    }

    if (wechatModal) {
        wechatModal.addEventListener('click', (e) => {
            if (e.target === wechatModal) {
                wechatModal.classList.remove('active');
                if (copyToast) copyToast.classList.remove('show');
            }
        });
    }

    if (btnCopyWechat) {
        btnCopyWechat.addEventListener('click', () => {
            copyWeChatID();
        });
    }

    // Hàm thực hiện sao chép ID WeChat và tự kích hoạt mở ứng dụng WeChat (weixin://)
    function copyWeChatID() {
        navigator.clipboard.writeText(WECHAT_ID).then(() => {
            if (copyToast) {
                copyToast.textContent = `Đã sao chép ID "${WECHAT_ID}"! Đang mở WeChat...`;
                copyToast.classList.add('show');
            }

            // Đợi 1.2 giây để người dùng đọc thông báo rồi kích hoạt mở app WeChat qua deep link
            setTimeout(() => {
                window.location.href = "weixin://";
            }, 1200);

            // Tự động ẩn thông báo thành công sau 3 giây
            setTimeout(() => {
                if (copyToast) copyToast.classList.remove('show');
            }, 3500);
        }).catch(err => {
            console.error('Không thể tự động sao chép ID WeChat: ', err);
            if (copyToast) {
                copyToast.textContent = `Vui lòng sao chép ID WeChat thủ công: ${WECHAT_ID}`;
                copyToast.classList.add('show');
            }
        });
    }

    // Nút 4: MAPS - Mở bản đồ Google Maps chỉ đường từ vị trí hiện tại
    if (btnMaps) {
        btnMaps.setAttribute('href', GOOGLE_MAPS_URL);
        btnMaps.setAttribute('target', '_blank');
        btnMaps.addEventListener('click', (e) => {
            console.log(`[Google Maps] Đang dẫn đường đến địa điểm spa.`);
        });
    }
});
