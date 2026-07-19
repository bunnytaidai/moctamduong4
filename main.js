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

    // Tỷ lệ khung hình của trang đơn (flyers / book cover: ~ 3:4 tức là 0.75)
    const ASPECT_RATIO = 0.75; 
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
        const frameWidth = contentFrame.clientWidth;
        const maxAllowedWidth = isMobile ? (frameWidth - 25) : (frameWidth - 10);
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

        // Thiết lập hiệu ứng phóng to trang bìa và chặn vuốt lật trang
        const pages = currentBookEl.querySelectorAll('.page');
        if (pages && pages.length > 1) {
            const coverPageEl = pages[1]; // Trang bìa đầu tiên (index 1)
            setupCoverPageZoom(coverPageEl);
        }

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
            const isFlippingState = (e.data === 'page_flip' || e.data === 'user_fold');
            
            // Áp dụng class hiệu ứng tràn khung 3D cho khung-1 và flipbook
            const khung1 = document.getElementById('khung-1');
            if (isFlippingState) {
                if (khung1) khung1.classList.add('flipping-active');
                if (currentBookEl) currentBookEl.classList.add('flipping-active');
            } else {
                setTimeout(() => {
                    if (khung1) khung1.classList.remove('flipping-active');
                    if (currentBookEl) currentBookEl.classList.remove('flipping-active');
                }, 300);
            }

            // Khi đang lật hoặc kéo, gáy sách tạm thời ẩn đi và hạ z-index xuống dưới để trang đang lật đè lên trên gáy sách (v3.4)
            if (creaseOverlay) {
                if (isFlippingState) {
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

    // Hàm thiết lập hiệu ứng zoom cho trang bìa và chặn vuốt lật trang
    function setupCoverPageZoom(coverPageEl) {
        if (!coverPageEl) return;

        coverPageEl.classList.add('page-cover-zoom');

        let isTouching = false;
        let startX = 0;
        let startY = 0;

        const handleStart = (clientX, clientY) => {
            isTouching = true;
            startX = clientX;
            startY = clientY;
            coverPageEl.classList.add('zoomed');
            coverPageEl.style.transform = `scale(1.15) rotateY(-5deg)`;
        };

        const handleMove = (clientX, clientY) => {
            if (!isTouching) return;
            const deltaX = (clientX - startX) * 0.15;
            const deltaY = (clientY - startY) * 0.15;
            const maxOffset = 25;
            const offsetX = Math.min(Math.max(deltaX, -maxOffset), maxOffset);
            const offsetY = Math.min(Math.max(deltaY, -maxOffset), maxOffset);
            // Áp dụng scale zoom, translate 3D parallax và rotate Y nghiêng nhẹ
            coverPageEl.style.transform = `scale(1.15) translate3d(${offsetX}px, ${offsetY}px, 60px) rotateY(-5deg)`;
        };

        const handleEnd = () => {
            if (!isTouching) return;
            isTouching = false;
            coverPageEl.classList.remove('zoomed');
            coverPageEl.style.transform = '';
        };

        // Chặn tuyệt đối sự kiện lan truyền lên cha (PageFlip) và xử lý zoom
        const touchEvents = ['touchstart', 'touchmove', 'touchend', 'touchcancel'];
        touchEvents.forEach(evt => {
            coverPageEl.addEventListener(evt, (e) => {
                e.stopPropagation(); // Chặn cử chỉ lật trang của PageFlip
                
                if (evt === 'touchstart' && e.touches.length > 0) {
                    handleStart(e.touches[0].clientX, e.touches[0].clientY);
                } else if (evt === 'touchmove' && e.touches.length > 0) {
                    handleMove(e.touches[0].clientX, e.touches[0].clientY);
                } else if (evt === 'touchend' || evt === 'touchcancel') {
                    handleEnd();
                }
            }, { passive: false });
        });

        // Mouse Events cho Desktop
        coverPageEl.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            handleStart(e.clientX, e.clientY);
        });

        coverPageEl.addEventListener('mousemove', (e) => {
            e.stopPropagation();
            handleMove(e.clientX, e.clientY);
        });

        coverPageEl.addEventListener('mouseup', (e) => {
            e.stopPropagation();
            handleEnd();
        });

        coverPageEl.addEventListener('mouseleave', (e) => {
            e.stopPropagation();
            handleEnd();
        });
    }

    // Hàm helper áp dụng CSS 3D & Nền khung cho các phần tử 2D (v3.7.6)
    function apply3DStylesToElement(domEl, configEl) {
        if (!configEl) return;
        // Shadow 3D
        if (configEl.boxShadow3D === 'soft') domEl.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
        else if (configEl.boxShadow3D === 'medium') domEl.style.boxShadow = '0 10px 25px rgba(0,0,0,0.35)';
        else if (configEl.boxShadow3D === 'hard') domEl.style.boxShadow = '0 20px 45px rgba(0,0,0,0.5)';
        else if (configEl.boxShadow3D === 'gold-glow') domEl.style.boxShadow = '0 0 15px rgba(212,175,55,0.6), 0 5px 15px rgba(0,0,0,0.3)';
        else if (configEl.boxShadow3D === 'none') domEl.style.boxShadow = 'none';

        // Rotate X/Y
        const rotX = configEl.rotateX3D || 0;
        const rotY = configEl.rotateY3D || 0;
        if (rotX !== 0 || rotY !== 0) {
            domEl.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        } else {
            domEl.style.transform = '';
        }

        // Background
        if (configEl.bg3D === 'paper') domEl.style.background = 'rgba(253, 252, 247, 0.95)';
        else if (configEl.bg3D === 'dark-herb') domEl.style.background = 'rgba(18, 22, 18, 0.85)';
        else if (configEl.bg3D === 'glass') {
            domEl.style.background = 'rgba(255, 255, 255, 0.1)';
            domEl.style.backdropFilter = 'blur(8px)';
            domEl.style.webkitBackdropFilter = 'blur(8px)';
        }
        else if (configEl.bg3D === 'gold-grad') domEl.style.background = 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(181, 146, 47, 0.2) 100%)';
        else if (configEl.bg3D === 'transparent') domEl.style.background = 'transparent';

        // Border 3D
        if (configEl.border3D === 'thin-gold') domEl.style.border = '1px solid rgba(212, 175, 55, 0.4)';
        else if (configEl.border3D === 'double-gold') domEl.style.border = '3px double #d4af37';
        else if (configEl.border3D === 'bevel-3d') {
            domEl.style.border = '1.5px solid rgba(255, 255, 255, 0.25)';
            domEl.style.borderBottomColor = 'rgba(0, 0, 0, 0.4)';
            domEl.style.borderRightColor = 'rgba(0, 0, 0, 0.4)';
        } else if (configEl.border3D === 'none') {
            domEl.style.border = 'none';
        }
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
                if (pageData.elements && pageData.elements.length > 0) {
                    pageData.elements.forEach(el => {
                        const div = document.createElement('div');
                        apply3DStylesToElement(div, el);
                        let style = `position: absolute; left: ${el.x}%; top: ${el.y}%; width: ${el.w}%; height: ${el.h}%;`;
                        
                        if (el.type === 'text') {
                            div.className = 'custom-text-element';
                            let txtStyle = `width: 100%; height: 100%; display: flex; align-items: center; white-space: pre-wrap; font-family: 'Montserrat', sans-serif; font-size: ${el.fontSize}px; color: ${el.color};`;
                            if (el.bold) txtStyle += ' font-weight: bold;';
                            if (el.italic) txtStyle += ' font-style: italic;';
                            if (el.underline) txtStyle += ' text-decoration: underline;';
                            div.setAttribute('style', style);
                            
                            const txt = document.createElement('div');
                            txt.setAttribute('style', txtStyle);
                            txt.innerText = el.content;
                            div.appendChild(txt);
                        } else if (el.type === 'services') {
                            div.className = 'custom-services-container';
                            div.setAttribute('style', style);
                            
                            const tbl = document.createElement('div');
                            tbl.className = 'pricing-table-element';
                            let tblStyle = `width: 100%; height: 100%; display: flex; flex-direction: column; gap: 12px; padding: 15px; background: rgba(253, 252, 247, 0.92); border: 1px solid rgba(197, 160, 89, 0.4); border-radius: 8px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);`;
                            tbl.setAttribute('style', tblStyle);
                            
                            if (el.services && el.services.length > 0) {
                                el.services.forEach(serv => {
                                    const row = document.createElement('div');
                                    row.className = 'service-row';
                                    row.setAttribute('style', 'display: flex; align-items: center; justify-content: space-between; width: 100%; font-size: 0.88rem; color: #2b2b2b;');
                                    row.innerHTML = `
                                        <span class="service-row-name" style="font-weight: 600; white-space: nowrap; padding-right: 5px;">${serv.name}</span>
                                        <span class="service-row-line" style="flex-grow: 1; border-bottom: 1.5px dotted rgba(197, 160, 89, 0.6); margin: 0 8px; align-self: flex-end; margin-bottom: 4px;"></span>
                                        <span class="service-row-price" style="font-weight: 700; color: #a62b2b; white-space: nowrap; padding-left: 5px;">${serv.price}</span>
                                    `;
                                    tbl.appendChild(row);
                                });
                            }
                            div.appendChild(tbl);
                        } else if (el.type === 'button') {
                            div.className = 'custom-button-element';
                            div.setAttribute('style', style);
                            
                            const btn = document.createElement('button');
                            let btnStyle = `width: 100%; height: 100%; border: none; font-family: 'Montserrat', sans-serif; font-size: ${el.fontSize}px; color: ${el.color}; background-color: ${el.bgColor || '#d4af37'}; border-radius: ${el.borderRadius || 4}px; cursor: pointer; pointer-events: auto !important; box-shadow: 0 4px 10px rgba(0,0,0,0.15);`;
                            if (el.bold) btnStyle += ' font-weight: bold;';
                            if (el.italic) btnStyle += ' font-style: italic;';
                            if (el.underline) btnStyle += ' text-decoration: underline;';
                            btn.setAttribute('style', btnStyle);
                            btn.innerText = el.content || 'Nút Bấm';
                            
                            btn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                if (window.executeButtonAction) window.executeButtonAction(el.actionType, el.actionValue);
                            });
                            div.appendChild(btn);
                        } else if (el.type === 'html') {
                            div.className = 'custom-html-element';
                            div.setAttribute('style', style + ' pointer-events: auto !important; overflow: auto;');
                            div.innerHTML = el.htmlContent || '<div>Mã HTML trống</div>';
                        }
                        
                        pageContent.appendChild(div);
                    });
                } else {
                    // Fallback tương thích ngược cũ cho texts và services
                    if (pageData.texts && pageData.texts.length > 0) {
                        pageData.texts.forEach(text => {
                            const textEl = document.createElement('div');
                            textEl.className = 'custom-text-element';
                            
                            let style = `position: absolute; left: ${text.x}%; top: ${text.y}%; font-family: ${text.font || 'Montserrat'}, sans-serif; font-size: ${text.size || 16}px; color: ${text.color || '#333'}; white-space: pre-wrap;`;
                            if (text.bold) style += ' font-weight: bold;';
                            if (text.italic) style += ' font-style: italic;';
                            if (text.underline) style += ' text-decoration: underline;';
                            
                            // Căn lề chữ
                            if (text.align) style += ` text-align: ${text.align};`;
                            
                            // Nền khung chữ
                            if (text.bgTransparent) {
                                style += ' background-color: transparent;';
                            } else if (text.bgColor) {
                                style += ` background-color: ${text.bgColor};`;
                            }
                            
                            // Viền khung chữ
                            if (text.borderNone) {
                                style += ' border: none;';
                            } else if (text.borderColor) {
                                const bWidth = text.borderWidth !== undefined ? text.borderWidth : 1;
                                style += ` border: ${bWidth}px solid ${text.borderColor};`;
                            }
                            if (text.borderRadius !== undefined) {
                                style += ` border-radius: ${text.borderRadius}px;`;
                            }
                            
                            // Padding đệm chữ
                            if (text.padding !== undefined) {
                                style += ` padding: ${text.padding}px;`;
                            }
                            
                            // Khoảng cách dòng và chữ
                            if (text.lineHeight) style += ` line-height: ${text.lineHeight};`;
                            if (text.letterSpacing !== undefined) style += ` letter-spacing: ${text.letterSpacing}px;`;
                            
                            // Đổ bóng chữ
                            if (text.shadow === 'soft') {
                                style += ' text-shadow: 1px 1px 3px rgba(0,0,0,0.3);';
                            } else if (text.shadow === 'hard') {
                                style += ' text-shadow: 2px 2px 5px rgba(0,0,0,0.7);';
                            }

                            textEl.setAttribute('style', style);
                            textEl.textContent = text.content;
                            pageContent.appendChild(textEl);
                        });
                    }
                    if (pageData.services && pageData.services.length > 0) {
                        const servicesContainer = document.createElement('div');
                        servicesContainer.className = 'custom-services-container';
                        const sX = pageData.services_x !== undefined ? pageData.services_x : 10;
                        const sY = pageData.services_y !== undefined ? pageData.services_y : 25;
                        const sW = pageData.services_w !== undefined ? pageData.services_w : 80;
                        
                        let containerStyle = `position: absolute; left: ${sX}%; top: ${sY}%; width: ${sW}%;`;
                        
                        // Nền bảng giá
                        if (pageData.services_bg_transparent) {
                            containerStyle += ' background: transparent !important;';
                        } else if (pageData.services_bg) {
                            containerStyle += ` background: ${pageData.services_bg} !important;`;
                        }
                        
                        // Viền bảng giá
                        if (pageData.services_border_none) {
                            containerStyle += ' border: none !important;';
                        } else if (pageData.services_border) {
                            containerStyle += ` border: 1px solid ${pageData.services_border} !important;`;
                        }
                        
                        if (pageData.services_border_radius !== undefined) {
                            containerStyle += ` border-radius: ${pageData.services_border_radius}px !important;`;
                        }
                        
                        servicesContainer.setAttribute('style', containerStyle);
                        
                        const sFont = pageData.services_font || 'Montserrat';
                        const sSize = pageData.services_size || 13;
                        const sColor = pageData.services_color || '#2b2b2b';
                        const sPriceColor = pageData.services_price_color || '#a62b2b';
                        const sAlign = pageData.services_align || 'left';
                        const isBold = pageData.services_bold !== false;
                        const isItalic = !!pageData.services_italic;
                        
                        pageData.services.forEach(service => {
                            const item = document.createElement('div');
                            item.className = 'service-item';
                            
                            let itemStyle = `display: flex; align-items: center; justify-content: space-between; width: 100%; font-family: '${sFont}', sans-serif; font-size: ${sSize}px; text-align: ${sAlign};`;
                            item.setAttribute('style', itemStyle);
                            
                            const name = document.createElement('span');
                            name.className = 'service-name';
                            let nameStyle = `color: ${sColor};`;
                            if (isBold) nameStyle += ' font-weight: bold;';
                            if (isItalic) nameStyle += ' font-style: italic;';
                            name.setAttribute('style', nameStyle);
                            name.textContent = service.name;
                            
                            const line = document.createElement('span');
                            line.className = 'service-line';
                            line.setAttribute('style', `flex-grow: 1; border-bottom: 1.5px dotted ${pageData.services_border || 'rgba(197, 160, 89, 0.6)'}; margin: 0 8px; align-self: flex-end; margin-bottom: 4px;`);
                            
                            const price = document.createElement('span');
                            price.className = 'service-price';
                            price.setAttribute('style', `font-weight: 700; color: ${sPriceColor}; white-space: nowrap; padding-left: 5px;`);
                            price.textContent = service.price;
                            
                            item.appendChild(name);
                            item.appendChild(line);
                            item.appendChild(price);
                            servicesContainer.appendChild(item);
                        });
                        pageContent.appendChild(servicesContainer);
                    }
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
                if (Array.isArray(syncedPages)) {
                    pages.forEach(page => {
                        const sp = syncedPages.find(p => p.id === page.id);
                        if (sp) {
                            page.type = 'custom';
                            page.bg_image = sp.bg_image || page.image || 'images/2.jpg';
                            page.elements = sp.elements || [];
                            
                            // Đồng bộ texts và services để tương thích ngược hoàn hảo
                            const texts = [];
                            let services = [];
                            let services_x = 10, services_y = 25, services_w = 80;

                            page.elements.forEach(el => {
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

                            page.texts = texts;
                            page.services = services;
                            page.services_x = services_x;
                            page.services_y = services_y;
                            page.services_w = services_w;
                        }
                    });
                }
            } catch (e) {
                console.error("Lỗi đồng bộ dữ liệu UI Designer:", e);
            }
        }
        window.bookPages = pages; // Lưu lại biến toàn cục để các nút hành động đọc thứ tự trang
        await renderPagesDynamic(pages);
        
        // Tải và áp dụng cấu hình giao diện tổng thể toàn trang (v3.5)
        try {
            const layout = await DataManager.getGlobalLayout();
            if (layout && layout.selectors) {
                applyGlobalLayout(layout);
            }
        } catch (e) {
            console.error("Lỗi khi tải giao diện tổng thể:", e);
        }
    });

    // Hàm thực thi hành động của nút bấm (v3.5)
    window.executeButtonAction = function(type, value) {
        if (type === 'goto_page') {
            const pages = window.bookPages || [];
            // Tìm trang theo ID
            const idx = pages.findIndex(p => p.id === value);
            if (idx !== -1) {
                if (window.pageFlip) window.pageFlip.flip(idx * 2 + 1);
            } else {
                const num = parseInt(value);
                if (!isNaN(num)) {
                    if (window.pageFlip) window.pageFlip.flip(num * 2 + 1);
                }
            }
        } else if (type === 'open_link') {
            window.open(value, '_blank');
        } else if (type === 'call_phone') {
            window.location.href = `tel:${value}`;
        } else if (type === 'custom_js') {
            try {
                eval(value);
            } catch (e) {
                console.error("Lỗi chạy JS hành động:", e);
            }
        }
    };

    // Hàm áp dụng cấu hình giao diện tổng thể toàn bộ trang (v3.5)
    function applyGlobalLayout(layout) {
        if (!layout || !layout.selectors) return;
        
        for (const selector in layout.selectors) {
            const config = layout.selectors[selector];
            let el = document.querySelector(selector);
            
            if (el) {
                // Di chuyển ra làm con trực tiếp của .main-wrapper để căn toạ độ tuyệt đối khớp 100% với simulator
                if (selector === '#frame-2' || selector === '#frame-3' || selector === '#book-viewport') {
                    const mainWrapper = document.querySelector('.main-wrapper');
                    if (mainWrapper && el.parentNode !== mainWrapper) {
                        mainWrapper.appendChild(el);
                    }
                }

                // Áp dụng mã HTML
                if (config.html !== undefined) {
                    el.innerHTML = config.html;
                }
                // Áp dụng mã CSS kèm theo !important cho từng thuộc tính để đè bẹp stylesheet mặc định
                if (config.css !== undefined) {
                    let cssWithImportant = config.css.split(';').map(style => {
                        let trimmed = style.trim();
                        if (!trimmed) return '';
                        if (trimmed.includes('!important')) return trimmed;
                        let colonIdx = trimmed.indexOf(':');
                        if (colonIdx === -1) return trimmed;
                        let key = trimmed.substring(0, colonIdx).trim();
                        let val = trimmed.substring(colonIdx + 1).trim();
                        return `${key}: ${val} !important`;
                    }).filter(Boolean).join('; ') + ';';
                    
                    el.style.cssText = cssWithImportant;
                }
                // Áp dụng sự kiện click JS
                if (config.js !== undefined && config.js !== '') {
                    el.setAttribute('onclick', config.js);
                    el.onclick = function(e) {
                        try {
                            eval(config.js);
                        } catch (err) {
                            console.error("Lỗi chạy JS tùy biến:", err);
                        }
                    };
                }
                // Hỗ trợ hiển thị icon
                if (config.iconClass) {
                    const iconCircle = el.querySelector('.icon-circle');
                    if (iconCircle) {
                        iconCircle.innerHTML = `<i class="${config.iconClass}"></i>`;
                    }
                }
            }
        }
    }



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