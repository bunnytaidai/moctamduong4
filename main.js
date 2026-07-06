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
    let bookClone = null; // Bản sao lưu cấu trúc DOM của sách phục vụ khôi phục tự động (v3.4)

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
        // Căn lề hai bên cực mảnh, riêng trên di động chừa 25px (gáy 15px lề trái, 10px lề phải) để tối ưu không gian hiển thị tối đa trang lẻ bên phải (v3.4)
        const isMobile = window.innerWidth <= 600;
        const maxAllowedWidth = isMobile ? (window.innerWidth - 25) : (window.innerWidth - 10);
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
            // Tự động kiểm tra xem trang bên trái của đôi trang hiện tại có phải là trang trong suốt hay không (v3.4)
            const pages = bookEl ? bookEl.querySelectorAll('.page') : [];
            const leftPageIdx = (currentSpread - 1) * 2;
            const isLeftPageTransparent = pages[leftPageIdx] && pages[leftPageIdx].classList.contains('page-transparent');

            if (isLeftPageTransparent) {
                // Dịch gáy sách lệch sang để chỉ tạo bóng đổ cho trang phải vì bên trái trong suốt
                creaseOverlay.style.background = 'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 48%, rgba(0,0,0,0.85) 49.5%, rgba(255,255,255,0.25) 50.5%, rgba(0,0,0,0.3) 53%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0) 100%)';
            } else {
                // Trả về gáy 3D đối xứng 2 bên mềm mại cân đối chính giữa trục gáy
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
        const viewport = document.getElementById('book-viewport');
        if (!viewport) return;

        // Lưu lại chỉ số trang hiện tại trước khi hủy thực thể cũ để khôi phục khi resize
        const savedIdx = pageFlip ? pageFlip.getCurrentPageIndex() : 0;

        if (pageFlip) {
            try {
                pageFlip.destroy();
            } catch(e) {
                console.error("Lỗi khi hủy PageFlip cũ:", e);
            }
            pageFlip = null;
        }

        // Tự động khôi phục và phục dựng lại thẻ DOM #book sạch từ bản sao lưu động mới nhất
        let currentBookEl = document.getElementById('book');
        if (bookClone) {
            if (currentBookEl) {
                currentBookEl.remove();
            }
            currentBookEl = bookClone.cloneNode(true);
            viewport.appendChild(currentBookEl);
        }

        if (!currentBookEl) return;

        pageFlip = new St.PageFlip(currentBookEl, {
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
            maxShadowOpacity: 0.85, // Tăng mạnh độ đậm bóng đổ StPageFlip vẽ để tối ưu thị giác 3D (v3.4)
            showPageCorners: false, // TẮT hiệu ứng nhô mép góc trang khi rê chuột qua (v3.4)
            disableKeyPress: true
        });

        // Nạp nội dung từ các div .page đã được render động trong DOM mới
        pageFlip.loadFromHTML(currentBookEl.querySelectorAll('.page'));

        // Cập nhật trạng thái ban đầu và khôi phục trang trước khi resize
        if (savedIdx > 0 && savedIdx < pageFlip.getPageCount()) {
            pageFlip.flip(savedIdx);
        }
        updateSpineAndUI(savedIdx);

        // Đăng ký các sự kiện lật trang
        pageFlip.on('flip', (e) => {
            updateSpineAndUI(e.data);
        });

        pageFlip.on('changeState', (e) => {
            // Khi đang lật hoặc kéo, gáy sách tạm thời ẩn đi và hạ z-index xuống dưới để trang đang lật đè lên trên gáy sách (v3.4)
            if (creaseOverlay) {
                if (e.data === 'page_flip' || e.data === 'user_fold') {
                    creaseOverlay.style.opacity = '0';
                    creaseOverlay.style.zIndex = '1';
                } else {
                    // Khi lật xong, hiện lại gáy sách đè lên trên để tạo bóng đổ tĩnh chân thực
                    setTimeout(() => {
                        creaseOverlay.style.opacity = '0.85';
                        creaseOverlay.style.zIndex = '999';
                    }, 100); // Trì hoãn nhẹ 100ms để hoạt ảnh lật trang hoàn tất phẳng phiu
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
                        
                        let style = `position: absolute; left: ${text.x}%; top: ${text.y}%; font-family: ${text.font || 'Montserrat'}, sans-serif; font-size: ${text.size || 16}px; color: ${text.color || '#333'}; white-space: pre-wrap;`;
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
            
            contentPage.appendChild(pageContent);
            tempContainer.appendChild(contentPage);
        }
        
        // 4. Xóa các trang cũ trong DOM và chèn các trang động mới vào
        bookEl.innerHTML = '';
        bookEl.appendChild(tempContainer);
        
        // Lưu lại bản sao cấu trúc động mới nhất phục vụ tự phục hồi khi resize/lỗi (v3.4)
        bookClone = bookEl.cloneNode(true);
        
        // 5. Khởi tạo lại PageFlip để vẽ cuốn sách mới
        initPageFlip();
    }

    // Đăng ký sự kiện thay đổi dữ liệu thời gian thực từ DataManager
    DataManager.onDataChange(async (pages) => {
        // KIỂM TRA ĐỒNG BỘ TỪ DESIGNER (muxintang_ui_sync)
        const uiSync = localStorage.getItem('muxintang_ui_sync');
        if (uiSync) {
            try {
                const syncedPages = JSON.parse(uiSync);
                if (Array.isArray(syncedPages) && syncedPages.length > 0) {
                    const clientCustomPages = syncedPages.map((sp, idx) => {
                        const texts = [];
                        let services = [];
                        let services_x = 10, services_y = 25, services_w = 80;

                        sp.elements.forEach(el => {
                            if (el.type === 'text') {
                                texts.push({
                                    x: el.x,
                                    y: el.y,
                                    size: el.fontSize,
                                    color: el.color,
                                    bold: el.bold,
                                    italic: el.italic,
                                    underline: el.underline,
                                    content: el.content
                                });
                            } else if (el.type === 'services') {
                                services = el.services || [];
                                services_x = el.x;
                                services_y = el.y;
                                services_w = el.w;
                            }
                        });

                        return {
                            id: sp.id || `custom_${idx}`,
                            name: sp.name || `Trang Tùy Biến ${idx + 1}`,
                            type: 'custom',
                            order: idx + 2, // đặt sau trang bìa trước (order 1)
                            bg_image: sp.bg_image || 'images/2.jpg',
                            texts: texts,
                            services: services,
                            services_x: services_x,
                            services_y: services_y,
                            services_w: services_w
                        };
                    });

                    // Thay thế các trang giữa bằng các trang kéo thả tùy biến
                    if (pages.length >= 2) {
                        const coverStart = pages[0];
                        const coverEnd = pages[pages.length - 1];
                        
                        const mergedPages = [coverStart];
                        clientCustomPages.forEach((cp, cIdx) => {
                            cp.order = cIdx + 2;
                            mergedPages.push(cp);
                        });
                        coverEnd.order = mergedPages.length + 1;
                        mergedPages.push(coverEnd);
                        pages = mergedPages;
                    }
                }
            } catch (e) {
                console.error("Lỗi đồng bộ dữ liệu UI Designer:", e);
            }
        }
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

    // ==========================================================================
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

});