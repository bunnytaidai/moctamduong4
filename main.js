document.addEventListener('DOMContentLoaded', () => {
    // Áp dụng ảnh nền web toàn cục nếu có cấu hình
    DataManager.getGlobalBg().then(bgUrl => {
        if (bgUrl) {
            document.body.style.backgroundImage = `radial-gradient(circle at 50% 50%, rgba(20, 30, 20, 0.6) 0%, var(--bg-dark) 100%), url('${bgUrl}')`;
        }
    }).catch(e => console.error("Lỗi nạp ảnh nền web:", e));

    // Áp dụng tiêu đề trang web từ cấu hình đám mây
    DataManager.getSiteTitle().then(title => {
        if (title) {
            document.title = title;
        }
    }).catch(e => console.error("Lỗi nạp tiêu đề trang web:", e));
    // ==========================================================================
    // 1. KHAI BÁO CÁC PHẦN TỬ DOM & ĐỊNH CẤU HÌNH BAN ĐẦU
    // ==========================================================================
    const bookEl = document.getElementById('book');
    const contentFrame = document.getElementById('frame-4');
    const pageIndicator = document.getElementById('page-indicator');
    const pageStack = document.getElementById('page-stack');
    const creaseOverlay = document.getElementById('book-crease');
    const btnPrev = document.getElementById('btn-prev-page');
    const btnNext = document.getElementById('btn-next-page');

    // Tỷ lệ khung hình của trang đơn (flyers / book cover: ~ 3:4 tức là 0.73)
    const ASPECT_RATIO = 0.73; 
    let pageWidth = 380;
    let pageHeight = 540;
    let pageFlip = null;

    // ==========================================================================
    // 2. TÍNH TOÁN KÍCH THƯỚC ĐÁP ỨNG (RESPONSIVE)
    // ==========================================================================
    function calculateBookSize() {
        if (!contentFrame) return;
        
        // Chiều cao book lấy khoảng 98% chiều cao của Frame 4 để tối ưu hóa không gian hiển thị tối đa
        const frameHeight = contentFrame.clientHeight;
        pageHeight = Math.floor(frameHeight * 0.98);
        
        // Nới rộng giới hạn chiều cao tối đa lên 850px để sách hiển thị to rõ rực rỡ hơn trên Desktop lớn
        if (pageHeight > 850) pageHeight = 850;
        if (pageHeight < 320) pageHeight = 320;

        // Tính chiều rộng trang đơn tương ứng
        pageWidth = Math.floor(pageHeight * ASPECT_RATIO);

        // ĐẢM BẢO KHÔNG TRÀN MÀN HÌNH DI ĐỘNG:
        // Căn lề hai bên cực mảnh (5px), riêng trên di động chừa 90px để hiển thị trang lót trái và nút điều hướng phải
        const isMobile = window.innerWidth <= 600;
        const maxAllowedWidth = isMobile ? (window.innerWidth - 90) : (window.innerWidth - 10);
        if (pageWidth > maxAllowedWidth) {
            pageWidth = maxAllowedWidth;
            // Tính ngược lại chiều cao tương ứng theo tỷ lệ vàng để không méo hình
            pageHeight = Math.floor(pageWidth / ASPECT_RATIO);
        }

        // Đẩy giá trị vào biến CSS toàn cục để căn chỉnh viewport, gáy, nút nhấn...
        document.documentElement.style.setProperty('--page-width', `${pageWidth}px`);
        document.documentElement.style.setProperty('--page-height', `${pageHeight}px`);
    }

    // Chạy lần đầu tiên để lấy kích thước
    calculateBookSize();

    // ==========================================================================
    // 3. LOGIC XỬ LÝ GÁY SÁCH 3D, CHỈ MỤC TRANG & TRẠNG THÁI NÚT ĐIỀU HƯỚNG
    // ==========================================================================
    function updateSpineAndUI(pageIndex) {
        if (!pageFlip) return;

        const currentIdx = (pageIndex !== undefined) ? pageIndex : pageFlip.getCurrentPageIndex();
        const totalPages = pageFlip.getPageCount(); 
        const totalSpreads = Math.ceil(totalPages / 2); // Tổng số đôi trang
        const currentSpread = Math.floor(currentIdx / 2) + 1;

        // A. Cập nhật chỉ số trang dạng "X / Y"
        const currentIdxEl = document.querySelector('.current-idx');
        const totalPagesEl = document.querySelector('.total-pages');
        if (currentIdxEl) currentIdxEl.textContent = currentSpread;
        if (totalPagesEl) totalPagesEl.textContent = totalSpreads;

        // B. Cập nhật trạng thái bật/tắt (disabled) của 2 nút điều hướng mũi tên
        if (btnPrev) {
            if (currentSpread === 1) {
                btnPrev.disabled = true;
                btnPrev.classList.add('disabled');
            } else {
                btnPrev.disabled = false;
                btnPrev.classList.remove('disabled');
            }
        }

        if (btnNext) {
            if (currentSpread === totalSpreads) {
                btnNext.disabled = true;
                btnNext.classList.add('disabled');
            } else {
                btnNext.disabled = false;
                btnNext.classList.remove('disabled');
            }
        }

        // C. Logic gáy sách & Chồng viền giấy lề trái (30px - 50px)
        // Khi đang ở Trang bìa đầu tiên (đôi trang 1: index 0, 1):
        // Trang bên trái là trong suốt (index 0) nên chưa có trang nào lật sang bên trái.
        if (pageStack) {
            if (currentSpread === 1) {
                pageStack.style.opacity = '0'; // Ẩn chồng giấy bên trái
            } else {
                pageStack.style.opacity = '0.9'; // Hiện chồng giấy tượng trưng các trang đã lật qua
            }
        }

        if (creaseOverlay) {
            if (currentSpread === 1) {
                // Dịch gáy sách lệch sang để chỉ tạo bóng đổ cho trang phải
                creaseOverlay.style.background = 'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 48%, rgba(0,0,0,0.85) 49.5%, rgba(255,255,255,0.25) 50.5%, rgba(0,0,0,0.3) 53%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0) 100%)';
            } else {
                // Trả về gáy 3D đối xứng 2 bên mềm mại
                creaseOverlay.style.background = 'linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.04) 20%, rgba(0, 0, 0, 0.2) 40%, rgba(0, 0, 0, 0.55) 46%, rgba(0, 0, 0, 0.85) 49%, rgba(0, 0, 0, 0.95) 50%, rgba(255, 255, 255, 0.25) 51%, rgba(0, 0, 0, 0.4) 54%, rgba(0, 0, 0, 0.15) 65%, rgba(0, 0, 0, 0.02) 80%, rgba(0, 0, 0, 0) 100%)';
            }
        }

        // D. Khóa vuốt trang thừa ở trang đầu và trang cuối để tránh lỗi hiển thị trắng trang
        const pages = document.querySelectorAll('.page');
        if (pages.length > 0) {
            // Trang đầu tiên (index 0) luôn khóa pointer-events để tránh vuốt ngược ra trước bìa đầu
            if (pages[0]) pages[0].style.pointerEvents = 'none';
            
            // Trang cuối cùng (index 13) khóa pointer-events khi đang ở đôi trang cuối cùng để tránh vuốt tiếp
            const lastPageIdx = totalPages - 1;
            if (currentSpread === totalSpreads) {
                if (pages[lastPageIdx]) pages[lastPageIdx].style.pointerEvents = 'none';
            } else {
                if (pages[lastPageIdx]) pages[lastPageIdx].style.pointerEvents = 'auto';
            }
        }
    }

    // ==========================================================================
    // 4. KHỞI TẠO THƯ VIỆN ST.PAGEFLIP TỪ DỮ LIỆU ĐỘNG (REALTIME UPDATE)
    // ==========================================================================
    function initPageFlip() {
        if (!bookEl) return;

        if (pageFlip) {
            pageFlip.destroy();
        }

        pageFlip = new St.PageFlip(bookEl, {
            width: pageWidth,
            height: pageHeight,
            size: "fixed",
            minWidth: pageWidth,
            maxWidth: pageWidth,
            minHeight: pageHeight,
            maxHeight: pageHeight,
            
            showCover: false,      // Sử dụng trang đôi liên tục.
            usePortrait: false,    // Ép hiển thị trang đôi kể cả trên mobile ngang.
            
            flippingTime: 300,     // Hoạt ảnh lật trang siêu tốc (300ms) cực kỳ nhạy và nhanh
            swipeDistance: 15,     // Giảm khoảng cách vuốt tối thiểu để lật trang nhanh hơn trên mobile
            maxShadowOpacity: 0.5, // Độ đậm của bóng bóng đổ StPageFlip vẽ
            showPageCorners: true, // Nhô mép trang khi di chuột qua để gợi ý lật
            disableKeyPress: true
        });

        // Nạp nội dung từ các div .page đã được render động trong DOM
        pageFlip.loadFromHTML(document.querySelectorAll('.page'));

        // Cập nhật trạng thái ban đầu
        updateSpineAndUI(0);

        // Đăng ký các sự kiện lật trang
        pageFlip.on('flip', (e) => {
            updateSpineAndUI(e.data);
        });

        pageFlip.on('changeState', (e) => {
            // Khi đang lật hoặc kéo, gáy sách hơi mờ đi để tạo cảm giác tự nhiên 3D
            if (creaseOverlay) {
                if (e.data === 'page_flip' || e.data === 'user_fold') {
                    creaseOverlay.style.opacity = '0.5';
                } else {
                    creaseOverlay.style.opacity = '0.85';
                }
            }
        });
    }

    // Hàm render động cấu trúc cuốn sách từ dữ liệu DataManager
    async function renderPagesDynamic(pages) {
        if (!bookEl) return;
        
        // 1. Tạo một fragment DOM chứa các trang mới
        const tempContainer = document.createDocumentFragment();
        
        // 2. Thêm trang lót trong suốt bên trái (trang 1)
        const pageTransparent = document.createElement('div');
        pageTransparent.className = 'page page-transparent';
        pageTransparent.setAttribute('data-density', 'hard');
        pageTransparent.innerHTML = '<div class="page-content"></div>';
        tempContainer.appendChild(pageTransparent);
        
        // 3. Render các trang từ dữ liệu
        for (let i = 0; i < pages.length; i++) {
            const pageData = pages[i];
            
            // Từ trang thứ 2 của dữ liệu trở đi, chèn 1 trang trắng lót bên trái (trang chẵn)
            if (i > 0) {
                const whitePage = document.createElement('div');
                whitePage.className = 'page page-white';
                whitePage.innerHTML = '<div class="page-content"></div>';
                tempContainer.appendChild(whitePage);
            }
            
            // Trang nội dung bên phải (trang lẻ)
            const contentPage = document.createElement('div');
            contentPage.className = pageData.type === 'custom' ? 'page page-custom' : 'page page-image';
            contentPage.setAttribute('data-page-id', pageData.id);
            
            // Bìa trước (trang đầu tiên) và bìa sau (trang cuối cùng) có chất liệu cứng
            if (i === 0 || i === pages.length - 1) {
                contentPage.setAttribute('data-density', 'hard');
            }
            
            const pageContent = document.createElement('div');
            pageContent.className = 'page-content';
            
            // Lấy URL hình ảnh (hỗ trợ chuyển đổi từ IndexedDB offline và Firebase online)
            const imgUri = pageData.type === 'custom' ? pageData.bg_image : pageData.image;
            if (imgUri) {
                try {
                    const realUrl = await DataManager.getImageUrl(imgUri);
                    if (realUrl) {
                        pageContent.style.backgroundImage = `url('${realUrl}')`;
                    }
                } catch (e) {
                    console.error("Lỗi tải ảnh nền cho trang:", pageData.id, e);
                }
            }
            
            // Nếu là trang tùy biến (custom), vẽ chữ và dịch vụ
            if (pageData.type === 'custom') {
                // A. Vẽ các phần tử chữ (text elements)
                if (pageData.texts && pageData.texts.length > 0) {
                    pageData.texts.forEach(text => {
                        const textEl = document.createElement('div');
                        textEl.className = 'custom-text-element';
                        
                        let style = `position: absolute; left: ${text.x}%; top: ${text.y}%; font-family: ${text.font || 'Montserrat'}, sans-serif; font-size: ${text.size || 16}px; color: ${text.color || '#333'};`;
                        if (text.bold) style += ' font-weight: bold;';
                        if (text.italic) style += ' font-style: italic;';
                        if (text.underline) style += ' text-decoration: underline;';
                        textEl.setAttribute('style', style);
                        textEl.textContent = text.content;
                        
                        pageContent.appendChild(textEl);
                    });
                }
                
                // B. Vẽ bảng báo giá dịch vụ (services list)
                if (pageData.services && pageData.services.length > 0) {
                    const servicesContainer = document.createElement('div');
                    servicesContainer.className = 'custom-services-container';
                    
                    const sX = pageData.services_x !== undefined ? pageData.services_x : 10;
                    const sY = pageData.services_y !== undefined ? pageData.services_y : 25;
                    const sW = pageData.services_w !== undefined ? pageData.services_w : 80;
                    servicesContainer.setAttribute('style', `position: absolute; left: ${sX}%; top: ${sY}%; width: ${sW}%;`);
                    
                    pageData.services.forEach(service => {
                        const item = document.createElement('div');
                        item.className = 'service-item';
                        
                        const name = document.createElement('span');
                        name.className = 'service-name';
                        name.textContent = service.name;
                        
                        const line = document.createElement('span');
                        line.className = 'service-line';
                        
                        const price = document.createElement('span');
                        price.className = 'service-price';
                        price.textContent = service.price;
                        
                        item.appendChild(name);
                        item.appendChild(line);
                        item.appendChild(price);
                        servicesContainer.appendChild(item);
                    });
                    
                    pageContent.appendChild(servicesContainer);
                }
            }
            
            // Lưu trữ đường dẫn ảnh vào DOM để xử lý tập trung bằng Event Delegation (v3.5)
            if (i > 0 && imgUri) {
                contentPage.setAttribute('data-img-uri', imgUri);
                contentPage.setAttribute('data-page-name', pageData.name || '');
            }
            
            contentPage.appendChild(pageContent);
            tempContainer.appendChild(contentPage);
        }
        
        // 4. Xóa các trang cũ trong DOM và chèn các trang động mới vào
        bookEl.innerHTML = '';
        bookEl.appendChild(tempContainer);
        
        // 5. Khởi tạo lại PageFlip để vẽ cuốn sách mới
        initPageFlip();
    }

    // Đăng ký sự kiện thay đổi dữ liệu thời gian thực từ DataManager
    DataManager.onDataChange(async (pages) => {
        await renderPagesDynamic(pages);
    });


    // ==========================================================================
    // 5. ĐĂNG KÝ SỰ KIỆN CLICK NÚT MŨI TÊN ĐIỀU HƯỚNG VỚI CƠ CHẾ CHỐNG XUNG ĐỘT
    // ==========================================================================
    let isFlipping = false; // Cờ theo dõi trạng thái lật trang chủ động từ nút bấm

    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (pageFlip && !isFlipping) {
                const currentIdx = pageFlip.getCurrentPageIndex();
                const currentSpread = Math.floor(currentIdx / 2) + 1;
                if (currentSpread > 1) {
                    isFlipping = true;
                    const targetIdx = (currentSpread - 2) * 2;
                    pageFlip.flip(targetIdx);
                    
                    // Giải phóng cờ lật sau 350ms (flippingTime = 300ms + 50ms buffer)
                    // Hoàn toàn không phụ thuộc vào trạng thái getState() của thư viện giúp nút bấm không bao giờ bị liệt
                    setTimeout(() => {
                        isFlipping = false;
                    }, 350);
                }
            }
        });
    }

    if (btnNext) {
        btnNext.addEventListener('click', () => {
            if (pageFlip && !isFlipping) {
                const currentIdx = pageFlip.getCurrentPageIndex();
                const totalPages = pageFlip.getPageCount();
                const totalSpreads = Math.ceil(totalPages / 2);
                const currentSpread = Math.floor(currentIdx / 2) + 1;
                if (currentSpread < totalSpreads) {
                    isFlipping = true;
                    const targetIdx = currentSpread * 2;
                    pageFlip.flip(targetIdx);
                    
                    // Giải phóng cờ lật sau 350ms
                    setTimeout(() => {
                        isFlipping = false;
                    }, 350);
                }
            }
        });
    }

    // Cơ chế Event Delegation (Ủy quyền sự kiện) xử lý click zoom ảnh thông minh (v3.5)
    if (bookEl) {
        bookEl.addEventListener('click', (e) => {
            const pageEl = e.target.closest('.page');
            if (!pageEl) return;

            const imgUri = pageEl.getAttribute('data-img-uri');
            const pageName = pageEl.getAttribute('data-page-name');

            if (imgUri && pageFlip && pageFlip.getState() === 'read') {
                const rect = pageEl.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const margin = rect.width * 0.15; // Chừa biên 15% lật trang
                
                if (clickX >= margin && clickX <= rect.width - margin) {
                    if (typeof window.openZoomModal === 'function') {
                        window.openZoomModal(imgUri, pageName);
                    }
                }
            }
        });
    }

    // ==========================================================================================
    // 6. RESPONSIVE WINDOW RESIZE
    // ==========================================================================
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            calculateBookSize();
            initPageFlip();
        }, 250); // Debounce resize sự kiện tránh giật lag
    });

    // ==========================================================================
    // 7. KHÓA HOÀN TOÀN CÁC THAO TÁC CUỘN & THU PHÓNG (PINCH TO ZOOM) BẰNG JS
    // ==========================================================================
    // Ngăn chặn pinch-to-zoom (thu phóng hai ngón tay) trên toàn giao diện
    document.addEventListener('touchstart', (event) => {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    }, { passive: false });

    // Ngăn chặn double-tap (nhấp đúp màn hình) tự động thu phóng trên một số dòng mobile
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });

    // Ngăn chặn cử chỉ zoom đặc thù trên iOS Safari
    document.addEventListener('gesturestart', (event) => {
        event.preventDefault();
    });

    // ==========================================================================
    // 8. LOGIC POPUP PHÓNG TO HÌNH ẢNH THỰC ĐƠN (v3.5)
    // ==========================================================================
    const zoomModal = document.getElementById('image-zoom-modal');
    const zoomImg = document.getElementById('zoom-modal-img');
    const zoomCaption = document.getElementById('zoom-caption');
    const zoomClose = document.getElementById('zoom-close-btn');

    window.openZoomModal = async function(imgUri, title) {
        if (!zoomModal || !zoomImg) return;
        try {
            const actualUrl = await DataManager.getImageUrl(imgUri);
            if (actualUrl) {
                zoomImg.src = actualUrl;
                zoomModal.style.display = 'flex';
                if (zoomCaption) zoomCaption.textContent = title || 'Thực đơn Muxintang';
            }
        } catch (e) {
            console.error("Lỗi phóng to hình ảnh:", e);
        }
    };

    if (zoomClose) {
        zoomClose.onclick = () => {
            zoomModal.style.display = 'none';
        };
    }

    if (zoomModal) {
        zoomModal.onclick = (e) => {
            if (e.target === zoomModal) {
                zoomModal.style.display = 'none';
            }
        };
    }

});