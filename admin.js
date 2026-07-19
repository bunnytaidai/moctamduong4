/**
 * admin.js
 * Logic quản trị thời gian thực cho Menu Muxintang
 * Hỗ trợ kéo thả văn bản, cắt xén ảnh (Cropper.js), quản lý dịch vụ và đồng bộ Firebase
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. KHAI BÁO CÁC PHẦN TỬ DOM
    // -------------------------------------------------------------
    const pageListContainer = document.getElementById('page-list-container');
    const canvasPreview = document.getElementById('canvas-preview');
    const editorControlsPane = document.getElementById('editor-controls-pane');
    const noPageSelectedMsg = document.getElementById('no-page-selected');
    const editorPageTitle = document.getElementById('editor-page-title');
    
    // Controls Trang
    const inputPageName = document.getElementById('input-page-name');
    const btnTypeImage = document.getElementById('btn-type-image');
    const btnTypeCustom = document.getElementById('btn-type-custom');
    const labelPageOrder = document.getElementById('label-page-order');
    const fileUploader = document.getElementById('file-uploader');
    const editorActionButtons = document.getElementById('editor-action-buttons');
    const btnDiscardPageChanges = document.getElementById('btn-discard-page-changes');
    const btnSavePageChanges = document.getElementById('btn-save-page-changes');
    
    // Controls Chữ (Text) nâng cấp
    const sectionTextManager = document.getElementById('section-text-manager');
    const textEditInstructions = document.getElementById('text-edit-instructions');
    const textElementEditor = document.getElementById('text-element-editor');
    const btnAddText = document.getElementById('btn-add-text');
    const inputTextContent = document.getElementById('input-text-content');
    const selectTextFont = document.getElementById('select-text-font');
    const inputTextSize = document.getElementById('input-text-size');
    const selectTextAlign = document.getElementById('select-text-align');
    const inputTextColor = document.getElementById('input-text-color');
    const inputTextColorHex = document.getElementById('input-text-color-hex');
    const inputTextBg = document.getElementById('input-text-bg');
    const checkTextBgTransparent = document.getElementById('check-text-bg-transparent');
    const inputTextBorder = document.getElementById('input-text-border');
    const checkTextBorderNone = document.getElementById('check-text-border-none');
    const inputTextBorderWidth = document.getElementById('input-text-border-width');
    const inputTextBorderRadius = document.getElementById('input-text-border-radius');
    const inputTextPadding = document.getElementById('input-text-padding');
    const inputTextLineheight = document.getElementById('input-text-lineheight');
    const inputTextLetterspacing = document.getElementById('input-text-letterspacing');
    const selectTextShadow = document.getElementById('select-text-shadow');
    const btnFormatBold = document.getElementById('btn-format-bold');
    const btnFormatItalic = document.getElementById('btn-format-italic');
    const btnFormatUnderline = document.getElementById('btn-format-underline');
    const btnDeleteText = document.getElementById('btn-delete-text');
    
    // Controls Dịch vụ (Services) nâng cấp
    const sectionServicesManager = document.getElementById('section-services-manager');
    const btnToggleServices = document.getElementById('btn-toggle-services');
    const btnAddService = document.getElementById('btn-add-service');
    const servicesEditorContainer = document.getElementById('services-editor-container');
    const serviceListEditorDom = document.getElementById('service-list-editor-dom');
    const servicesDisabledMsg = document.getElementById('services-disabled-msg');
    const selectServicesFont = document.getElementById('select-services-font');
    const inputServicesSize = document.getElementById('input-services-size');
    const selectServicesAlign = document.getElementById('select-services-align');
    const inputServicesColor = document.getElementById('input-services-color');
    const inputServicesColorHex = document.getElementById('input-services-color-hex');
    const inputServicesPriceColor = document.getElementById('input-services-price-color');
    const inputServicesPriceColorHex = document.getElementById('input-services-price-color-hex');
    const btnServicesBold = document.getElementById('btn-services-bold');
    const btnServicesItalic = document.getElementById('btn-services-italic');
    const inputServicesBg = document.getElementById('input-services-bg');
    const checkServicesBgTransparent = document.getElementById('check-services-bg-transparent');
    const inputServicesBorder = document.getElementById('input-services-border');
    const checkServicesBorderNone = document.getElementById('check-services-border-none');
    const inputServicesBorderRadius = document.getElementById('input-services-border-radius');
    
    // Controls Nhật ký & Log (v3.0)
    const logContainer = document.getElementById('log-container');
    const btnClearLogs = document.getElementById('btn-clear-logs');

    // Controls Ảnh nền web toàn cục
    const globalBgUploader = document.getElementById('global-bg-uploader');
    const inputSiteTitle = document.getElementById('input-site-title');
    const btnDeleteGlobalBg = document.getElementById('btn-delete-global-bg');
    const globalBgThumbnail = document.getElementById('global-bg-thumbnail');

    // Controls Xem trước nâng cấp (v3.7.1)
    const previewResolution = document.getElementById('preview-resolution');
    const btnPreviewModeEdit = document.getElementById('btn-preview-mode-edit');
    const btnPreviewModeFlip = document.getElementById('btn-preview-mode-flip');
    const flipPreviewContainer = document.getElementById('flip-preview-container');
    const flipPreviewBookViewport = document.getElementById('flip-preview-book-viewport');
    const flipPreviewBook = document.getElementById('flip-preview-book');
    const btnFlipPrev = document.getElementById('btn-flip-prev');
    const btnFlipNext = document.getElementById('btn-flip-next');
    const flipPageIndicator = document.getElementById('flip-page-indicator');
    const editorHintMsg = document.getElementById('editor-hint-msg');

    // Controls Thiết bị xem trước Responsive
    const btnDeviceDesktop = document.getElementById('btn-device-desktop');
    const btnDeviceTablet = document.getElementById('btn-device-tablet');
    const btnDeviceMobile = document.getElementById('btn-device-mobile');

    // Controls Cài đặt chung v3.2
    const btnSaveGlobal = document.getElementById('btn-save-global');
    const btnDiscardGlobal = document.getElementById('btn-discard-global');
    const globalSettingsActions = document.getElementById('global-settings-actions');

    // Controls Hình ảnh trang v3.2
    const btnDeletePageImage = document.getElementById('btn-delete-page-image');
    const pageImageThumbnail = document.getElementById('page-image-thumbnail');

    // Controls GitHub Cloud nâng cấp (v3.0)
    const btnCheckGhToken = document.getElementById('btn-check-gh-token');
    const selectGhRepo = document.getElementById('select-gh-repo');
    const newRepoCreator = document.getElementById('new-repo-creator');
    const inputNewGhRepo = document.getElementById('input-new-gh-repo');
    const btnCreateGhRepo = document.getElementById('btn-create-gh-repo');
    
    // Modals
    const firebaseModal = document.getElementById('firebase-modal');
    const cropperModal = document.getElementById('cropper-modal');
    const btnOpenFirebaseModal = document.getElementById('btn-open-firebase-modal');
    const btnCloseFirebaseModal = document.getElementById('btn-close-firebase-modal');
    const btnCloseCropperModal = document.getElementById('btn-close-cropper-modal');
    const btnSaveFirebase = document.getElementById('btn-save-firebase');
    const btnClearFirebase = document.getElementById('btn-clear-firebase');
    
    // Inputs Firebase
    const inputFbApiKey = document.getElementById('input-fb-api-key');
    const inputFbDbUrl = document.getElementById('input-fb-db-url');
    const inputFbProjId = document.getElementById('input-fb-proj-id');
    const inputFbStorageBucket = document.getElementById('input-fb-storage-bucket');
    const inputFbAppId = document.getElementById('input-fb-app-id');
    
    // Cropper Target
    const cropperTargetImg = document.getElementById('cropper-target-img');
    const btnConfirmCrop = document.getElementById('btn-confirm-crop');
    const btnCancelCrop = document.getElementById('btn-cancel-crop');
    
    // Toast
    const toastNotification = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');

    // -------------------------------------------------------------
    // 1.5. HÀM GHI LOG NHẬT KÝ HOẠT ĐỘNG (Activity Logger)
    // -------------------------------------------------------------
    function addSystemLog(message, type = 'info') {
        if (!logContainer) return;
        const now = new Date();
        const timeStr = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
        
        const logEl = document.createElement('div');
        logEl.className = `log-item ${type}`;
        logEl.textContent = `${timeStr} ${message}`;
        
        logContainer.appendChild(logEl);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    if (btnClearLogs) {
        btnClearLogs.onclick = () => {
            logContainer.innerHTML = '';
            addSystemLog('Nhật ký đã được dọn sạch.', 'info');
        };
    }

    // -------------------------------------------------------------
    // 2. BIẾN TRẠNG THÁI TOÀN CỤC (STATE)
    // -------------------------------------------------------------
    let allPages = [];            // Danh sách tất cả các trang
    let activePageId = null;      // ID của trang đang được sửa
    let activePageData = null;    // Bản sao dữ liệu của trang đang sửa
    let isInitialLoad = true;     // Cờ hiệu đánh dấu lần đầu tiên tải trang để khôi phục trạng thái (v3.7.1)
    
    let siteTitleOriginal = '';   // Tiêu đề trang web gốc từ DB
    let siteTitleDraft = '';      // Tiêu đề trang web nháp đang sửa
    let globalBgOriginal = '';    // Ảnh nền web gốc từ DB
    let globalBgDraft = '';       // Ảnh nền web nháp đang sửa
    let pendingImageDeletions = []; // Danh sách URL ảnh cũ chờ xóa khi Lưu thành công (v3.2)
    let previewMode = 'edit';     // Chế độ xem trước: 'edit' (sửa) hoặc 'flip' (lật trang 3D)
    let flipPreviewBookInstance = null; // Đối tượng St.PageFlip xem trước
    
    let selectedTextId = null;    // ID phần tử text đang được chọn trong canvas
    let cropper = null;           // Đối tượng thư viện cắt ảnh Cropper.js
    let imageToCropFile = null;   // File ảnh gốc đang đợi để cắt
    
    // Kích thước canvas mô phỏng thực tế (Dùng tính tỷ lệ % khi kéo thả)
    const CANVAS_WIDTH = 310;
    const CANVAS_HEIGHT = 440;
    const MENU_ASPECT_RATIO = 380 / 540; // Tỷ lệ vàng ~ 0.7037 của flipbook

    // -------------------------------------------------------------
    // 3. KHỞI TẠO & ĐỒNG BỘ DỮ LIỆU THỜI GIAN THỰC
    // -------------------------------------------------------------
    // Lắng nghe thay đổi dữ liệu từ DataManager để cập nhật sơ đồ thời gian thực
    DataManager.onDataChange(async (pages) => {
        allPages = pages;
        renderPageList();
        
        // --- KHÔI PHỤC TRẠNG THÁI CẤU HÌNH KHI F5 TRANG (v3.7.1) ---
        if (isInitialLoad && allPages.length > 0) {
            isInitialLoad = false;
            
            const savedPageId = localStorage.getItem('muxintang_admin_active_page_id');
            const savedDeviceMode = localStorage.getItem('muxintang_admin_active_device');
            const savedPreviewMode = localStorage.getItem('muxintang_admin_preview_mode');
            
            // 1. Mở lại trang đang làm việc dở
            if (savedPageId && allPages.some(p => p.id === savedPageId)) {
                selectPage(savedPageId);
            }
            
            // 2. Chuyển lại đúng thiết bị xem trước
            if (savedDeviceMode) {
                switchDevice(savedDeviceMode);
            }
            
            // 3. Chuyển lại đúng tab xem trước (Sửa / Lật 3D)
            if (savedPreviewMode) {
                if (savedPreviewMode === 'flip') {
                    if (btnPreviewModeFlip) btnPreviewModeFlip.click();
                } else {
                    if (btnPreviewModeEdit) btnPreviewModeEdit.click();
                }
            }
        }
        
        // Đồng bộ Cài đặt chung (v3.7.1)
        try {
            const title = await DataManager.getSiteTitle();
            siteTitleOriginal = title || '';
            // Chỉ cập nhật giá trị ô nhập nếu người dùng không đang gõ tập trung vào đó
            if (document.activeElement !== inputSiteTitle && !siteTitleDraft) {
                inputSiteTitle.value = siteTitleOriginal;
            }
            
            const bg = await DataManager.getGlobalBg();
            globalBgOriginal = bg || '';
            if (!globalBgDraft) {
                updateGlobalBgUI(globalBgOriginal);
            }
        } catch (err) {
            console.error("Lỗi đồng bộ cấu hình cài đặt chung:", err);
        }
        
        // Nếu trang đang active bị xóa bởi máy khác, ẩn editor
        if (activePageId && !pages.find(p => p.id === activePageId)) {
            closeEditor();
        } else if (activePageId) {
            // Cập nhật lại bản sao dữ liệu mới nhất
            const updatedPage = pages.find(p => p.id === activePageId);
            // Chỉ cập nhật nếu không có phiên làm việc nháp đang chưa lưu (hoặc đồng bộ tự động)
            // Để đơn giản, ta load lại và vẽ lại nếu dữ liệu đám mây thay đổi
            activePageData = JSON.parse(JSON.stringify(updatedPage));
            renderCanvasPreview();
        }
        
        updateFirebaseStatusUI();
        addSystemLog(`Đồng bộ dữ liệu thành công! Tìm thấy ${pages.length} trang thực đơn.`, 'success');
    });

    async function updateGlobalBgUI(bgUrl) {
        const actualUrl = bgUrl ? await DataManager.getImageUrl(bgUrl) : 'images/spa_background.png';
        if (actualUrl) {
            globalBgThumbnail.style.backgroundImage = `url('${actualUrl}')`;
            globalBgThumbnail.style.display = 'block';
            btnDeleteGlobalBg.style.display = bgUrl ? 'block' : 'none';
            return;
        }
        globalBgThumbnail.style.backgroundImage = 'none';
        globalBgThumbnail.style.display = 'none';
        btnDeleteGlobalBg.style.display = 'none';
    }

    async function updatePageImageUI() {
        if (!activePageData) return;
        
        // Tự động đồng bộ ảnh nền giữa custom (bg_image) và image (image) để giữ hình ảnh khi chuyển đổi loại nội dung
        if (activePageData.type === 'custom' && !activePageData.bg_image && activePageData.image) {
            activePageData.bg_image = activePageData.image;
        } else if (activePageData.type === 'image' && !activePageData.image && activePageData.bg_image) {
            activePageData.image = activePageData.bg_image;
        }
        
        let imgUri = activePageData.type === 'custom' ? activePageData.bg_image : activePageData.image;
        let isFallback = false;
        
        // Tự động đồng bộ/sử dụng ảnh nền website toàn cục nếu trang tùy chỉnh chưa có ảnh nền riêng
        if (activePageData.type === 'custom' && !imgUri) {
            imgUri = globalBgDraft && globalBgDraft !== '__DELETE__' ? globalBgDraft : (globalBgOriginal || 'images/spa_background.png');
            isFallback = true;
        }
        
        if (imgUri) {
            const actualUrl = await DataManager.getImageUrl(imgUri);
            if (actualUrl) {
                pageImageThumbnail.style.backgroundImage = `url('${actualUrl}')`;
                pageImageThumbnail.style.display = 'block';
                // Chỉ hiển thị nút xóa ảnh nền nếu đây không phải là ảnh nền đồng bộ mặc định (ảnh toàn cục)
                btnDeletePageImage.style.display = isFallback ? 'none' : 'block';
                return;
            }
        }
        pageImageThumbnail.style.backgroundImage = 'none';
        pageImageThumbnail.style.display = 'none';
        btnDeletePageImage.style.display = 'none';
    }

    // Kiểm tra xem trang hiện tại có thay đổi gì so với dữ liệu gốc không
    function checkChanges() {
        let hasPageChanges = false;
        if (activePageId && activePageData) {
            const originalPage = allPages.find(p => p.id === activePageId);
            if (originalPage) {
                hasPageChanges = JSON.stringify(activePageData) !== JSON.stringify(originalPage);
            }
        }
        
        const hasTitleChanges = siteTitleDraft !== '' && siteTitleDraft !== siteTitleOriginal;
        const hasBgChanges = globalBgDraft !== '' && globalBgDraft !== globalBgOriginal;
        
        const hasAnyChanges = hasPageChanges || hasTitleChanges || hasBgChanges;
        
        if (hasAnyChanges) {
            editorActionButtons.style.display = 'flex';
        } else {
            editorActionButtons.style.display = 'none';
        }
        
        // Cập nhật hiển thị panel nút Lưu/Hủy riêng biệt của Cài đặt chung (v3.2)
        if (globalSettingsActions) {
            if (hasTitleChanges || hasBgChanges) {
                globalSettingsActions.style.display = 'flex';
            } else {
                globalSettingsActions.style.display = 'none';
            }
        }
    }

    // Khai báo các input cho Đám Mây Kép
    const btnOpenCloudModal = document.getElementById('btn-open-cloud-modal');
    const cloudModal = document.getElementById('cloud-modal');
    const btnCloseCloudModal = document.getElementById('btn-close-cloud-modal');
    
    // Tab buttons
    const tabBtnFirebase = document.getElementById('tab-btn-firebase');
    const tabBtnGithub = document.getElementById('tab-btn-github');
    const tabContentFirebase = document.getElementById('tab-content-firebase');
    const tabContentGithub = document.getElementById('tab-content-github');
    
    // GitHub Inputs
    const inputGhUsername = document.getElementById('input-gh-username');
    const inputGhRepo = document.getElementById('input-gh-repo');
    const inputGhBranch = document.getElementById('input-gh-branch');
    const inputGhToken = document.getElementById('input-gh-token');
    const btnSaveGithub = document.getElementById('btn-save-github');
    const btnClearGithub = document.getElementById('btn-clear-github');

    // Điền cấu hình Firebase cũ nếu có
    const fbConfig = DataManager.getFirebaseConfig();
    if (fbConfig) {
        inputFbApiKey.value = fbConfig.apiKey || '';
        inputFbDbUrl.value = fbConfig.databaseURL || '';
        inputFbProjId.value = fbConfig.projectId || '';
        inputFbStorageBucket.value = fbConfig.storageBucket || '';
        inputFbAppId.value = fbConfig.appId || '';
    }

    // Điền cấu hình GitHub cũ nếu có
    const ghConfig = DataManager.getGithubConfig();
    if (ghConfig) {
        inputGhUsername.value = ghConfig.username || '';
        inputGhBranch.value = ghConfig.branch || 'main';
        inputGhToken.value = ghConfig.token || '';
        
        // Tự động tải danh sách repo cũ
        if (ghConfig.token) {
            setTimeout(() => checkGithubToken(ghConfig.token, ghConfig.repo), 500);
        }
    }

    // Kiểm tra GitHub Token, nạp thông tin User và danh sách Repo
    async function checkGithubToken(token, selectRepoValue = '') {
        if (!token) return;
        addSystemLog('Bắt đầu kiểm tra GitHub Access Token...', 'info');
        
        try {
            // A. Lấy Username
            const userRes = await fetch('https://api.github.com/user', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });
            if (userRes.status !== 200) {
                throw new Error(`Token không hợp lệ (HTTP ${userRes.status})`);
            }
            const userData = await userRes.json();
            inputGhUsername.value = userData.login;
            addSystemLog(`Xác thực thành công tài khoản GitHub: ${userData.login}`, 'success');
            
            // B. Tải danh sách Repos
            addSystemLog('Đang tải danh sách Repository có sẵn...', 'info');
            const reposRes = await fetch('https://api.github.com/user/repos?per_page=100&type=owner', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });
            if (reposRes.status !== 200) {
                throw new Error(`Không lấy được danh sách Repos (HTTP ${reposRes.status})`);
            }
            const reposData = await reposRes.json();
            
            // C. Điền vào dropdown select
            selectGhRepo.innerHTML = '';
            
            const defaultOpt = document.createElement('option');
            defaultOpt.value = '';
            defaultOpt.textContent = '-- Chọn kho chứa (Repository) --';
            selectGhRepo.appendChild(defaultOpt);
            
            reposData.forEach(repo => {
                const opt = document.createElement('option');
                opt.value = repo.name;
                opt.textContent = repo.name;
                if (repo.name === selectRepoValue) opt.selected = true;
                selectGhRepo.appendChild(opt);
            });
            
            // Thêm option tạo mới
            const createOpt = document.createElement('option');
            createOpt.value = '__CREATE_NEW__';
            createOpt.textContent = '+ Tạo mới Repository mới...';
            selectGhRepo.appendChild(createOpt);
            
            toggleNewRepoPanel();
            addSystemLog(`Nạp thành công ${reposData.length} Repository.`, 'success');
            
        } catch (e) {
            console.error(e);
            addSystemLog(`Lỗi kiểm tra Token: ${e.message}`, 'error');
            showToast('Lỗi xác thực GitHub!', 'warn');
        }
    }

    function toggleNewRepoPanel() {
        if (selectGhRepo.value === '__CREATE_NEW__') {
            newRepoCreator.style.display = 'flex';
        } else {
            newRepoCreator.style.display = 'none';
        }
    }

    selectGhRepo.onchange = async () => {
        toggleNewRepoPanel();
        
        const repo = selectGhRepo.value;
        if (repo && repo !== '__CREATE_NEW__') {
            const token = inputGhToken.value.trim();
            const username = inputGhUsername.value.trim();
            const branch = inputGhBranch.value.trim() || 'main';
            
            if (token && username) {
                addSystemLog(`Đang kết nối thử và tải dữ liệu từ repository: ${username}/${repo}...`, 'info');
                showToast('Đang nạp dữ liệu từ Repo...', 'info');
                
                const tempConfig = { username, repo, branch, token };
                try {
                    await DataManager.loadTempGithubConfig(tempConfig);
                    addSystemLog(`Đã nạp dữ liệu từ Repo "${repo}". Nhấp "Lưu GitHub" để áp dụng chính thức cấu hình này.`, 'success');
                    showToast('Nạp dữ liệu Repo thành công!');
                } catch (err) {
                    addSystemLog(`Không tìm thấy dữ liệu thực đơn trên Repo "${repo}". Sẽ khởi tạo mặc định khi nhấn "Lưu GitHub".`, 'warn');
                    showToast('Repo chưa có dữ liệu thực đơn!', 'info');
                }
            }
        }
    };

    // Nút kiểm tra token click
    btnCheckGhToken.onclick = () => {
        const token = inputGhToken.value.trim();
        if (!token) {
            alert('Vui lòng nhập GitHub Access Token!');
            return;
        }
        checkGithubToken(token);
    };

    // Tạo Repo mới trực tuyến
    btnCreateGhRepo.onclick = async () => {
        const token = inputGhToken.value.trim();
        const newRepoName = inputNewGhRepo.value.trim();
        
        if (!token || !newRepoName) {
            alert('Vui lòng nhập tên Repo muốn tạo!');
            return;
        }
        
        addSystemLog(`Đang gửi yêu cầu tạo Repo "${newRepoName}" lên GitHub...`, 'info');
        try {
            const res = await fetch('https://api.github.com/user/repos', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: newRepoName,
                    description: 'Menu online lật trang 3D tự động được quản trị qua Muxintang Admin Dashboard',
                    private: false,
                    auto_init: true
                })
            });
            
            if (res.status !== 201) {
                const errInfo = await res.json();
                throw new Error(errInfo.message || 'Lỗi API tạo Repo');
            }
            
            addSystemLog(`Đã tạo thành công Repository "${newRepoName}"!`, 'success');
            showToast('Tạo Repository thành công!');
            
            // Reload lại dropdown và chọn Repo vừa tạo
            await checkGithubToken(token, newRepoName);
            inputNewGhRepo.value = '';
        } catch (e) {
            console.error(e);
            addSystemLog(`Thất bại khi tạo Repo: ${e.message}`, 'error');
            showToast('Tạo Repository thất bại!', 'warn');
        }
    };

    // Cập nhật trạng thái hiển thị Cloud ở header
    function updateFirebaseStatusUI() {
        const mode = DataManager.getStorageMode();
        if (mode === 'firebase') {
            btnOpenCloudModal.innerHTML = '<i class="fa-solid fa-cloud" style="color: #55ff55;"></i> Đang Firebase';
            btnOpenCloudModal.style.borderColor = '#55ff55';
        } else if (mode === 'github') {
            btnOpenCloudModal.innerHTML = '<i class="fa-brands fa-github" style="color: #55ccff;"></i> Đang GitHub';
            btnOpenCloudModal.style.borderColor = '#55ccff';
        } else {
            btnOpenCloudModal.innerHTML = '<i class="fa-solid fa-cloud"></i> Cài Đặt Đám Mây';
            btnOpenCloudModal.style.borderColor = 'var(--gold-color)';
        }
    }

    // -------------------------------------------------------------
    // 4. RENDER DANH SÁCH SƠ ĐỒ TRANG (CỘT TRÁI)
    // -------------------------------------------------------------
    async function renderPageList() {
        pageListContainer.innerHTML = '';
        
        if (allPages.length === 0) {
            pageListContainer.innerHTML = '<div class="no-data-msg">Không có trang nào. Ấn nút (+) để thêm trang.</div>';
            return;
        }

        for (let i = 0; i < allPages.length; i++) {
            const page = allPages[i];
            const isBia = (i === 0 || i === allPages.length - 1);
            
            const item = document.createElement('div');
            item.className = `page-item ${page.id === activePageId ? 'active' : ''}`;
            item.setAttribute('data-id', page.id);
            item.setAttribute('draggable', 'true'); // Hỗ trợ kéo thả
            
            // Xử lý thumbnail ảnh nền
            const thumb = document.createElement('div');
            thumb.className = 'page-thumb';
            const imgUri = page.type === 'custom' ? page.bg_image : page.image;
            if (imgUri) {
                const thumbUrl = await DataManager.getImageUrl(imgUri);
                if (thumbUrl) thumb.style.backgroundImage = `url('${thumbUrl}')`;
            } else {
                thumb.innerHTML = '<i class="fa-regular fa-image"></i>';
            }
            
            const details = document.createElement('div');
            details.className = 'page-details';
            
            const title = document.createElement('div');
            title.className = 'page-title';
            title.textContent = page.name || `Trang #${page.order}`;
            
            const type = document.createElement('div');
            type.className = 'page-type';
            type.textContent = isBia 
                ? (i === 0 ? 'Bìa trước (Trang cứng)' : 'Bìa sau (Trang cứng)')
                : (page.type === 'custom' ? 'Thiết kế chữ / Báo giá' : 'Trang ảnh đơn');
                
            details.appendChild(title);
            details.appendChild(type);
            
            const actions = document.createElement('div');
            actions.className = 'page-actions';
            
            // Nút xóa trang (Chỉ giữ lại nút xóa, thay sắp xếp bằng kéo thả trực quan)
            const btnDel = document.createElement('button');
            btnDel.className = 'action-icon-btn btn-delete-page';
            btnDel.title = 'Xóa trang này';
            btnDel.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
            btnDel.onclick = (e) => {
                e.stopPropagation();
                if (allPages.length <= 2) {
                    showToast('Cuốn sách phải chứa ít nhất 2 trang để lật được!', 'warn');
                    return;
                }
                if (confirm(`Bạn có chắc chắn muốn xóa "${page.name || 'trang này'}" không?`)) {
                    DataManager.deletePage(page.id);
                    showToast('Đã xóa trang khỏi hệ thống!');
                }
            };
            actions.appendChild(btnDel);

            // Drag and Drop Events
            item.addEventListener('dragstart', (e) => {
                item.classList.add('dragging');
                e.dataTransfer.setData('text/plain', i);
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            item.addEventListener('dragenter', (e) => {
                e.preventDefault();
                if (!item.classList.contains('dragging')) {
                    item.classList.add('drag-over');
                }
            });

            item.addEventListener('dragleave', () => {
                item.classList.remove('drag-over');
            });

            item.addEventListener('drop', async (e) => {
                e.preventDefault();
                item.classList.remove('drag-over');
                const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
                const toIdx = i;
                
                if (fromIdx !== toIdx) {
                    addSystemLog(`Đang sắp xếp lại trang từ vị trí ${fromIdx + 1} sang ${toIdx + 1}...`, 'info');
                    await movePageOrder(fromIdx, toIdx);
                }
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                document.querySelectorAll('.page-item').forEach(el => el.classList.remove('drag-over'));
            });

            // Click vào trang để chỉnh sửa
            item.onclick = () => selectPage(page.id);
            
            item.appendChild(thumb);
            item.appendChild(details);
            item.appendChild(actions);
            
            pageListContainer.appendChild(item);
        }
    }

    // Thay đổi thứ tự trang và lưu ngay lập tức
    async function movePageOrder(fromIdx, toIdx) {
        const pagesCopy = [...allPages];
        const pageToMove = pagesCopy.splice(fromIdx, 1)[0];
        pagesCopy.splice(toIdx, 0, pageToMove);
        
        const orderedIds = pagesCopy.map(p => p.id);
        await DataManager.updatePagesOrder(orderedIds);
        showToast('Đã thay đổi thứ tự và áp dụng realtime!');
    }

    // -------------------------------------------------------------
    // 5. CHỌN TRANG CẦN BIÊN TẬP (EDITOR CONTROLLER)
    // -------------------------------------------------------------
    function selectPage(pageId) {
        // Kiểm tra xem trang hiện tại đang làm việc có thay đổi chưa lưu không
        if (activePageId && activePageData) {
            const originalPage = allPages.find(p => p.id === activePageId);
            if (originalPage) {
                const hasChanges = JSON.stringify(activePageData) !== JSON.stringify(originalPage);
                if (hasChanges) {
                    const confirmLeave = confirm("Trang hiện tại có thay đổi chưa lưu. Bạn có chắc chắn muốn rời đi và bỏ qua thay đổi này không?");
                    if (!confirmLeave) {
                        // Người dùng muốn ở lại, không chuyển trang nữa
                        document.querySelectorAll('.page-item').forEach(item => {
                            item.classList.toggle('active', item.getAttribute('data-id') === activePageId);
                        });
                        return;
                    }
                }
            }
        }

        activePageId = pageId;
        localStorage.setItem('muxintang_admin_active_page_id', pageId); // Lưu ID trang đang chọn
        const page = allPages.find(p => p.id === pageId);
        if (!page) return;
        
        // Tạo bản sao dữ liệu làm việc để tránh ghi đè trực tiếp khi chưa ấn Lưu
        activePageData = JSON.parse(JSON.stringify(page));
        selectedTextId = null;
        
        // Cập nhật giao diện sơ đồ
        document.querySelectorAll('.page-item').forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-id') === pageId);
        });
        
        // Hiển thị khung editor
        noPageSelectedMsg.style.display = 'none';
        editorControlsPane.style.display = 'flex';
        
        // Load thông tin chung vào form
        editorPageTitle.textContent = (page.name || `Trang #${page.order}`).toUpperCase();
        inputPageName.value = page.name || '';
        labelPageOrder.textContent = `Trang số ${page.order} / ${allPages.length}`;
        
        // Set tab loại trang
        setPageTypeTab(activePageData.type);
        
        // Vẽ Canvas Preview
        renderCanvasPreview();
        
        // Load bảng thuộc tính chữ về trạng thái ban đầu
        updateTextEditorUI();
        
        // Khởi tạo trình soạn dịch vụ báo giá
        initServicesEditor();
        
        // Cập nhật thumbnail hình ảnh của trang hiện tại (v3.2)
        updatePageImageUI();
        
        // Ẩn bộ nút khi vừa nạp trang mới (do dữ liệu nháp khớp với dữ liệu gốc)
        checkChanges();

        // --- NÂNG CẤP v3.7.1: TỰ ĐỘNG ÉP SÁCH LẬT ĐẾN TRANG ĐƯỢC CHỌN TRONG MENU ADMIN ---
        if (previewMode === 'flip' && flipPreviewBookInstance) {
            const activeIdx = allPages.findIndex(p => p.id === pageId);
            if (activeIdx >= 0) {
                flipPreviewBookInstance.flip(activeIdx * 2);
            }
        }
    }

    function closeEditor() {
        activePageId = null;
        activePageData = null;
        selectedTextId = null;
        noPageSelectedMsg.style.display = 'flex';
        editorControlsPane.style.display = 'none';
        editorPageTitle.textContent = 'CHƯA CHỌN TRANG';
        canvasPreview.innerHTML = '';
        document.querySelectorAll('.page-item').forEach(item => item.classList.remove('active'));
        
        // Dọn thumbnail trang v3.2
        if (pageImageThumbnail && btnDeletePageImage) {
            pageImageThumbnail.style.backgroundImage = 'none';
            pageImageThumbnail.style.display = 'none';
            btnDeletePageImage.style.display = 'none';
        }
    }

    function setPageTypeTab(type) {
        activePageData.type = type;
        if (type === 'custom') {
            btnTypeCustom.classList.add('active');
            btnTypeImage.classList.remove('active');
            sectionTextManager.style.display = 'flex';
            sectionServicesManager.style.display = 'flex';
        } else {
            btnTypeImage.classList.add('active');
            btnTypeCustom.classList.remove('active');
            sectionTextManager.style.display = 'none';
            sectionServicesManager.style.display = 'none';
        }
    }

    btnTypeImage.onclick = () => {
        setPageTypeTab('image');
        updatePageImageUI();
        renderCanvasPreview();
        checkChanges();
    };

    btnTypeCustom.onclick = () => {
        setPageTypeTab('custom');
        updatePageImageUI();
        renderCanvasPreview();
        checkChanges();
    };

    inputPageName.oninput = (e) => {
        activePageData.name = e.target.value;
        editorPageTitle.textContent = e.target.value.toUpperCase() || 'TRANG KHÔNG TÊN';
        checkChanges();
    };

    // -------------------------------------------------------------
    // 6. VẼ CANVAS MÔ PHỎNG TRỰC QUAN (PREVIEW GENERATOR)
    // -------------------------------------------------------------
    async function renderCanvasPreview() {
        canvasPreview.innerHTML = '';
        canvasPreview.className = 'page-canvas';
        
        if (!activePageData) return;
        
        // Cần lấy ảnh nền hiển thị
        let imgUri = activePageData.type === 'custom' ? activePageData.bg_image : activePageData.image;
        
        // Tự động đồng bộ/sử dụng ảnh nền website toàn cục nếu trang tùy biến chưa cấu hình ảnh nền riêng
        if (activePageData.type === 'custom' && !imgUri) {
            imgUri = globalBgDraft && globalBgDraft !== '__DELETE__' ? globalBgDraft : (globalBgOriginal || 'images/spa_background.png');
        }
        
        if (imgUri) {
            const url = await DataManager.getImageUrl(imgUri);
            if (url) {
                canvasPreview.style.backgroundImage = `url('${url}')`;
            } else {
                canvasPreview.style.backgroundImage = 'none';
            }
        } else {
            canvasPreview.style.backgroundImage = 'none';
            canvasPreview.style.backgroundColor = '#fdfcf7';
        }
        
        // Nếu là trang transparent (trang 1 lót bên trái)
        const isBiaTransparent = allPages.findIndex(p => p.id === activePageId) === 0;
        // Thực ra trang transparent là cố định trang 1 trong flipbook để che lề trái. Trang bìa trước chính là trang index 0 trong db.
        // Ta chỉ render viền đứt nét để admin nhận diện.
        
        // Nếu là trang tùy biến (custom) thì vẽ chữ và bảng dịch vụ
        if (activePageData.type === 'custom') {
            const canvasWidth = canvasPreview.offsetWidth || 310;
            const scaleRatio = canvasWidth / 380;

            // A. Vẽ các phần tử chữ
            if (activePageData.texts) {
                activePageData.texts.forEach(text => {
                    const textEl = document.createElement('div');
                    textEl.className = `canvas-text-el ${text.id === selectedTextId ? 'selected' : ''}`;
                    textEl.setAttribute('data-id', text.id);
                    
                    let style = `left: ${text.x}%; top: ${text.y}%; font-family: ${text.font || 'Montserrat'}, sans-serif; font-size: ${Math.floor(text.size * 0.81 * scaleRatio)}px; color: ${text.color || '#333'}; white-space: pre-wrap;`;
                    if (text.w !== undefined) style += ` width: ${text.w}%;`;
                    if (text.h !== undefined) style += ` height: ${text.h}%;`;
                    if (text.bold) style += ' font-weight: bold;';
                    if (text.italic) style += ' font-style: italic;';
                    if (text.underline) style += ' text-decoration: underline;';
                    
                    // Nâng cấp: Căn lề
                    if (text.align) style += ` text-align: ${text.align};`;
                    
                    // Nâng cấp: Nền khung
                    if (text.bgTransparent !== false) {
                        style += ' background-color: transparent;';
                    } else if (text.bgColor) {
                        style += ` background-color: ${text.bgColor};`;
                    }
                    
                    // Nâng cấp: Viền khung
                    if (text.borderNone) {
                        style += ' border: none;';
                    } else if (text.borderColor) {
                        const bWidth = text.borderWidth !== undefined ? text.borderWidth : 1;
                        style += ` border: ${bWidth}px solid ${text.borderColor};`;
                    }
                    if (text.borderRadius !== undefined) {
                        style += ` border-radius: ${text.borderRadius}px;`;
                    }
                    
                    // Nâng cấp: Padding
                    if (text.padding !== undefined) {
                        style += ` padding: ${text.padding}px;`;
                    }
                    
                    // Nâng cấp: Khoảng cách dòng và chữ
                    if (text.lineHeight) style += ` line-height: ${text.lineHeight};`;
                    if (text.letterSpacing !== undefined) style += ` letter-spacing: ${text.letterSpacing}px;`;
                    
                    // Nâng cấp: Bóng chữ
                    if (text.shadow === 'soft') {
                        style += ' text-shadow: 1px 1px 3px rgba(0,0,0,0.3);';
                    } else if (text.shadow === 'hard') {
                        style += ' text-shadow: 2px 2px 5px rgba(0,0,0,0.7);';
                    }

                    textEl.setAttribute('style', style);
                    
                    // Thêm phần tử chứa text nội dung
                    const textSpan = document.createElement('span');
                    textSpan.textContent = text.content;
                    textEl.appendChild(textSpan);
                    
                    // Thêm tay nắm co giãn kích thước (Resize Handle)
                    const resizeHandle = document.createElement('div');
                    resizeHandle.className = 'resize-handle';
                    textEl.appendChild(resizeHandle);
                    
                    // Click chọn chữ
                    textEl.addEventListener('mousedown', (e) => {
                        e.stopPropagation();
                        selectTextElement(text.id);
                        initDragElement(e, textEl, 'text');
                    });
                    
                    textEl.addEventListener('touchstart', (e) => {
                        e.stopPropagation();
                        selectTextElement(text.id);
                        initDragElement(e, textEl, 'text');
                    }, { passive: true });
                    
                    // Xử lý click nút resize handle
                    resizeHandle.addEventListener('mousedown', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        initResizeElement(e, textEl, text.id);
                    });
                    
                    canvasPreview.appendChild(textEl);
                });
            }
            
            // B. Vẽ bảng dịch vụ báo giá
            if (activePageData.services && activePageData.services.length > 0) {
                const sContainer = document.createElement('div');
                sContainer.className = `canvas-services-container ${selectedTextId === 'services_box' ? 'selected' : ''}`;
                sContainer.id = 'canvas-services-box';
                
                const sX = activePageData.services_x !== undefined ? activePageData.services_x : 10;
                const sY = activePageData.services_y !== undefined ? activePageData.services_y : 25;
                const sW = activePageData.services_w !== undefined ? activePageData.services_w : 80;
                
                const sFont = activePageData.services_font || 'Montserrat';
                const sSize = activePageData.services_size || 13;
                const sColor = activePageData.services_color || '#2b2b2b';
                const sPriceColor = activePageData.services_price_color || '#a62b2b';
                const sAlign = activePageData.services_align || 'left';
                const isBold = activePageData.services_bold !== false;
                const isItalic = !!activePageData.services_italic;
                
                // Style cho container bảng dịch vụ
                let containerStyle = `left: ${sX}%; top: ${sY}%; width: ${sW}%; font-size: ${Math.floor(sSize * scaleRatio)}px;`;
                
                if (activePageData.services_bg_transparent) {
                    containerStyle += ' background: transparent !important;';
                } else if (activePageData.services_bg) {
                    containerStyle += ` background: ${activePageData.services_bg} !important;`;
                }
                
                if (activePageData.services_border_none) {
                    containerStyle += ' border: none !important;';
                } else if (activePageData.services_border) {
                    containerStyle += ` border: 1px solid ${activePageData.services_border} !important;`;
                }
                
                if (activePageData.services_border_radius !== undefined) {
                    containerStyle += ` border-radius: ${activePageData.services_border_radius}px !important;`;
                }
                
                sContainer.setAttribute('style', containerStyle);
                
                activePageData.services.forEach(service => {
                    const item = document.createElement('div');
                    item.className = 'service-item';
                    
                    // Style cho từng dòng dịch vụ
                    let itemStyle = `display: flex; align-items: center; justify-content: space-between; width: 100%; font-family: '${sFont}', sans-serif; text-align: ${sAlign};`;
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
                    line.setAttribute('style', `border-bottom: 1.5px dotted ${activePageData.services_border || 'rgba(197, 160, 89, 0.6)'};`);
                    
                    const price = document.createElement('span');
                    price.className = 'service-price';
                    price.setAttribute('style', `color: ${sPriceColor}; font-weight: 700; white-space: nowrap; padding-left: 5px;`);
                    price.textContent = service.price;
                    
                    item.appendChild(name);
                    item.appendChild(line);
                    item.appendChild(price);
                    sContainer.appendChild(item);
                });
                
                // Kéo thả cả bảng báo giá
                sContainer.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                    selectTextElement('services_box'); // Chọn dịch vụ
                    initDragElement(e, sContainer, 'services');
                });
                sContainer.addEventListener('touchstart', (e) => {
                    e.stopPropagation();
                    selectTextElement('services_box');
                    initDragElement(e, sContainer, 'services');
                }, { passive: true });
                
                canvasPreview.appendChild(sContainer);
            }
        }
    }

    // Click vào vùng trống canvas để hủy chọn chữ
    canvasPreview.addEventListener('mousedown', () => {
        selectTextElement(null);
    });

    // -------------------------------------------------------------
    // 7. DRAG & DROP & RESIZE CHỮ BẰNG JS THUẦN (HIGHLY OPTIMIZED)
    // -------------------------------------------------------------
    function initDragElement(event, element, type) {
        const isTouch = event.type.startsWith('touch');
        const startX = isTouch ? event.touches[0].clientX : event.clientX;
        const startY = isTouch ? event.touches[0].clientY : event.clientY;
        
        const canvasRect = canvasPreview.getBoundingClientRect();
        
        const initialLeft = element.offsetLeft;
        const initialTop = element.offsetTop;
        
        function onMouseMove(e) {
            const moveX = isTouch ? e.touches[0].clientX : e.clientX;
            const moveY = isTouch ? e.touches[0].clientY : e.clientY;
            
            let deltaX = moveX - startX;
            let deltaY = moveY - startY;
            
            let newLeft = initialLeft + deltaX;
            let newTop = initialTop + deltaY;
            
            // Khống chế trong khung canvas
            if (newLeft < 0) newLeft = 0;
            if (newLeft > canvasRect.width - element.offsetWidth) newLeft = canvasRect.width - element.offsetWidth;
            if (newTop < 0) newTop = 0;
            if (newTop > canvasRect.height - element.offsetHeight) newTop = canvasRect.height - element.offsetHeight;
            
            element.style.left = `${newLeft}px`;
            element.style.top = `${newTop}px`;
        }
        
        function onMouseUp(e) {
            document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', onMouseMove);
            document.removeEventListener(isTouch ? 'touchend' : 'mouseup', onMouseUp);
            
            // Tính toán % để lưu trữ
            const finalLeftPct = parseFloat(((element.offsetLeft / canvasRect.width) * 100).toFixed(2));
            const finalTopPct = parseFloat(((element.offsetTop / canvasRect.height) * 100).toFixed(2));
            
            // Cập nhật dữ liệu
            if (type === 'text') {
                const textId = element.getAttribute('data-id');
                const textObj = activePageData.texts.find(t => t.id === textId);
                if (textObj) {
                    textObj.x = finalLeftPct;
                    textObj.y = finalTopPct;
                }
            } else if (type === 'services') {
                activePageData.services_x = finalLeftPct;
                activePageData.services_y = finalTopPct;
            }
            checkChanges();
        }
        
        document.addEventListener(isTouch ? 'touchmove' : 'mousemove', onMouseMove);
        document.addEventListener(isTouch ? 'touchend' : 'mouseup', onMouseUp);
    }

    // Co giãn kích thước chiều rộng/chiều cao của khung chữ khi kéo góc (Resize)
    function initResizeElement(event, element, textId) {
        event.preventDefault();
        const isTouch = event.type.startsWith('touch');
        const startX = isTouch ? event.touches[0].clientX : event.clientX;
        const startY = isTouch ? event.touches[0].clientY : event.clientY;
        
        const textObj = activePageData.texts.find(t => t.id === textId);
        if (!textObj) return;
        
        const canvasRect = canvasPreview.getBoundingClientRect();
        const initialWidthPx = element.offsetWidth;
        const initialHeightPx = element.offsetHeight;
        
        function onMouseMove(e) {
            const moveX = isTouch ? e.touches[0].clientX : e.clientX;
            const moveY = isTouch ? e.touches[0].clientY : e.clientY;
            
            const deltaX = moveX - startX;
            const deltaY = moveY - startY;
            
            let newWidthPx = initialWidthPx + deltaX;
            let newHeightPx = initialHeightPx + deltaY;
            
            // Giới hạn kích thước tối thiểu
            if (newWidthPx < 40) newWidthPx = 40;
            if (newHeightPx < 15) newHeightPx = 15;
            
            // Giới hạn kích thước tối đa không tràn canvas
            const maxW = canvasRect.width - element.offsetLeft;
            const maxH = canvasRect.height - element.offsetTop;
            if (newWidthPx > maxW) newWidthPx = maxW;
            if (newHeightPx > maxH) newHeightPx = maxH;
            
            // Lưu tạm thời lên DOM element
            element.style.width = `${newWidthPx}px`;
            element.style.height = `${newHeightPx}px`;
        }
        
        function onMouseUp() {
            document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', onMouseMove);
            document.removeEventListener(isTouch ? 'touchend' : 'mouseup', onMouseUp);
            
            // Quy đổi sang % để lưu vào dữ liệu
            textObj.w = parseFloat(((element.offsetWidth / canvasRect.width) * 100).toFixed(2));
            textObj.h = parseFloat(((element.offsetHeight / canvasRect.height) * 100).toFixed(2));
            
            renderCanvasPreview();
            checkChanges();
        }
        
        document.addEventListener(isTouch ? 'touchmove' : 'mousemove', onMouseMove);
        document.addEventListener(isTouch ? 'touchend' : 'mouseup', onMouseUp);
    }

    // -------------------------------------------------------------
    // 8. SOẠN THẢO THUỘC TÍNH VĂN BẢN (TEXT PROPERTIES EDITOR)
    // -------------------------------------------------------------
    function selectTextElement(textId) {
        selectedTextId = textId;
        
        // Vẽ lại canvas để đổi class selected cho viền vàng
        document.querySelectorAll('.canvas-text-el').forEach(el => {
            el.classList.toggle('selected', el.getAttribute('data-id') === textId);
        });
        
        const sBox = document.getElementById('canvas-services-box');
        if (sBox) {
            sBox.classList.toggle('selected', textId === 'services_box');
        }
        
        updateTextEditorUI();
    }

    function updateTextEditorUI() {
        if (!selectedTextId || selectedTextId === 'services_box') {
            textEditInstructions.style.display = 'block';
            textElementEditor.style.display = 'none';
            return;
        }
        
        const textObj = activePageData.texts.find(t => t.id === selectedTextId);
        if (!textObj) {
            textEditInstructions.style.display = 'block';
            textElementEditor.style.display = 'none';
            return;
        }
        
        textEditInstructions.style.display = 'none';
        textElementEditor.style.display = 'flex';
        
        // Điền dữ liệu chữ
        inputTextContent.value = textObj.content || '';
        selectTextFont.value = textObj.font || 'Montserrat';
        inputTextSize.value = textObj.size || 16;
        selectTextAlign.value = textObj.align || 'left';
        inputTextColor.value = textObj.color || '#c5a059';
        inputTextColorHex.value = textObj.color || '#c5a059';
        
        inputTextBg.value = textObj.bgColor || '#ffffff';
        checkTextBgTransparent.checked = textObj.bgTransparent !== false; // mặc định trong suốt (true)
        inputTextBg.disabled = checkTextBgTransparent.checked;
        
        inputTextBorder.value = textObj.borderColor || '#c5a059';
        checkTextBorderNone.checked = textObj.borderNone !== false; // mặc định không viền (true)
        inputTextBorder.disabled = checkTextBorderNone.checked;
        inputTextBorderWidth.value = textObj.borderWidth !== undefined ? textObj.borderWidth : 1;
        inputTextBorderWidth.disabled = checkTextBorderNone.checked;
        inputTextBorderRadius.value = textObj.borderRadius !== undefined ? textObj.borderRadius : 4;
        inputTextBorderRadius.disabled = checkTextBorderNone.checked;
        
        inputTextPadding.value = textObj.padding !== undefined ? textObj.padding : 4;
        inputTextLineheight.value = textObj.lineHeight || 1.4;
        inputTextLetterspacing.value = textObj.letterSpacing || 0;
        selectTextShadow.value = textObj.shadow || 'none';
        
        // Trạng thái các nút định dạng
        btnFormatBold.classList.toggle('active', !!textObj.bold);
        btnFormatItalic.classList.toggle('active', !!textObj.italic);
        btnFormatUnderline.classList.toggle('active', !!textObj.underline);
    }

    // Sự kiện chỉnh sửa chữ thời gian thực
    inputTextContent.oninput = (e) => {
        if (!selectedTextId) return;
        const textObj = activePageData.texts.find(t => t.id === selectedTextId);
        if (textObj) {
            textObj.content = e.target.value;
            // Update nhanh trên canvas
            const el = document.querySelector(`.canvas-text-el[data-id="${selectedTextId}"]`);
            if (el) {
                el.querySelector('span').textContent = e.target.value;
            }
            checkChanges();
        }
    };

    selectTextFont.onchange = (e) => {
        if (!selectedTextId) return;
        const textObj = activePageData.texts.find(t => t.id === selectedTextId);
        if (textObj) {
            textObj.font = e.target.value;
            renderCanvasPreview();
            checkChanges();
        }
    };

    inputTextSize.oninput = (e) => {
        if (!selectedTextId) return;
        const textObj = activePageData.texts.find(t => t.id === selectedTextId);
        if (textObj) {
            textObj.size = parseInt(e.target.value) || 16;
            renderCanvasPreview();
            checkChanges();
        }
    };

    selectTextAlign.onchange = (e) => {
        if (!selectedTextId) return;
        const textObj = activePageData.texts.find(t => t.id === selectedTextId);
        if (textObj) {
            textObj.align = e.target.value;
            renderCanvasPreview();
            checkChanges();
        }
    };

    // Color picker
    inputTextColor.oninput = (e) => {
        if (!selectedTextId) return;
        const textObj = activePageData.texts.find(t => t.id === selectedTextId);
        if (textObj) {
            textObj.color = e.target.value;
            inputTextColorHex.value = e.target.value;
            renderCanvasPreview();
            checkChanges();
        }
    };

    inputTextColorHex.oninput = (e) => {
        if (!selectedTextId) return;
        const textObj = activePageData.texts.find(t => t.id === selectedTextId);
        if (textObj && e.target.value.match(/^#[0-9A-F]{6}$/i)) {
            textObj.color = e.target.value;
            inputTextColor.value = e.target.value;
            renderCanvasPreview();
            checkChanges();
        }
    };

    inputTextBg.oninput = (e) => {
        if (!selectedTextId) return;
        const textObj = activePageData.texts.find(t => t.id === selectedTextId);
        if (textObj) {
            textObj.bgColor = e.target.value;
            renderCanvasPreview();
            checkChanges();
        }
    };

    checkTextBgTransparent.onchange = (e) => {
        if (!selectedTextId) return;
        const textObj = activePageData.texts.find(t => t.id === selectedTextId);
        if (textObj) {
            textObj.bgTransparent = e.target.checked;
            inputTextBg.disabled = e.target.checked;
            renderCanvasPreview();
            checkChanges();
        }
    };

    inputTextBorder.oninput = (e) => {
        if (!selectedTextId) return;
        const textObj = activePageData.texts.find(t => t.id === selectedTextId);
        if (textObj) {
            textObj.borderColor = e.target.value;
            renderCanvasPreview();
            checkChanges();
        }
    };

    checkTextBorderNone.onchange = (e) => {
        if (!selectedTextId) return;
        const textObj = activePageData.texts.find(t => t.id === selectedTextId);
        if (textObj) {
            textObj.borderNone = e.target.checked;
            inputTextBorder.disabled = e.target.checked;
            inputTextBorderWidth.disabled = e.target.checked;
            inputTextBorderRadius.disabled = e.target.checked;
            renderCanvasPreview();
            checkChanges();
        }
    };

    inputTextBorderWidth.oninput = (e) => {
        if (!selectedTextId) return;
        const textObj = activePageData.texts.find(t => t.id === selectedTextId);
        if (textObj) {
            textObj.borderWidth = parseInt(e.target.value) || 1;
            renderCanvasPreview();
            checkChanges();
        }
    };

    inputTextBorderRadius.oninput = (e) => {
        if (!selectedTextId) return;
        const textObj = activePageData.texts.find(t => t.id === selectedTextId);
        if (textObj) {
            textObj.borderRadius = parseInt(e.target.value) || 0;
            renderCanvasPreview();
            checkChanges();
        }
    };

    inputTextPadding.oninput = (e) => {
        if (!selectedTextId) return;
        const textObj = activePageData.texts.find(t => t.id === selectedTextId);
        if (textObj) {
            textObj.padding = parseInt(e.target.value) || 0;
            renderCanvasPreview();
            checkChanges();
        }
    };

    inputTextLineheight.oninput = (e) => {
        if (!selectedTextId) return;
        const textObj = activePageData.texts.find(t => t.id === selectedTextId);
        if (textObj) {
            textObj.lineHeight = parseFloat(e.target.value) || 1.4;
            renderCanvasPreview();
            checkChanges();
        }
    };

    inputTextLetterspacing.oninput = (e) => {
        if (!selectedTextId) return;
        const textObj = activePageData.texts.find(t => t.id === selectedTextId);
        if (textObj) {
            textObj.letterSpacing = parseInt(e.target.value) || 0;
            renderCanvasPreview();
            checkChanges();
        }
    };

    selectTextShadow.onchange = (e) => {
        if (!selectedTextId) return;
        const textObj = activePageData.texts.find(t => t.id === selectedTextId);
        if (textObj) {
            textObj.shadow = e.target.value;
            renderCanvasPreview();
            checkChanges();
        }
    };

    // Định dạng Bold/Italic/Underline
    btnFormatBold.onclick = () => {
        if (!selectedTextId) return;
        const textObj = activePageData.texts.find(t => t.id === selectedTextId);
        if (textObj) {
            textObj.bold = !textObj.bold;
            btnFormatBold.classList.toggle('active', textObj.bold);
            renderCanvasPreview();
            checkChanges();
        }
    };

    btnFormatItalic.onclick = () => {
        if (!selectedTextId) return;
        const textObj = activePageData.texts.find(t => t.id === selectedTextId);
        if (textObj) {
            textObj.italic = !textObj.italic;
            btnFormatItalic.classList.toggle('active', textObj.italic);
            renderCanvasPreview();
            checkChanges();
        }
    };

    btnFormatUnderline.onclick = () => {
        if (!selectedTextId) return;
        const textObj = activePageData.texts.find(t => t.id === selectedTextId);
        if (textObj) {
            textObj.underline = !textObj.underline;
            btnFormatUnderline.classList.toggle('active', textObj.underline);
            renderCanvasPreview();
            checkChanges();
        }
    };

    // Thêm chữ mới
    btnAddText.onclick = () => {
        if (!activePageData.texts) activePageData.texts = [];
        
        const newText = {
            id: 'text_' + Date.now(),
            content: 'Nội dung chữ mới',
            font: 'Montserrat',
            size: 16,
            color: '#c5a059', // Màu đồng cổ mặc định cho sang
            bold: false,
            italic: false,
            underline: false,
            x: 20, // Ở giữa trái canvas
            y: 40,
            w: 30, // Chiều rộng mặc định 30%
            h: 8   // Chiều cao mặc định 8%
        };
        
        activePageData.texts.push(newText);
        selectedTextId = newText.id;
        
        renderCanvasPreview();
        updateTextEditorUI();
        checkChanges();
    };

    // Xóa chữ
    btnDeleteText.onclick = () => {
        if (!selectedTextId) return;
        activePageData.texts = activePageData.texts.filter(t => t.id !== selectedTextId);
        selectedTextId = null;
        renderCanvasPreview();
        updateTextEditorUI();
        checkChanges();
    };

    // -------------------------------------------------------------
    // 9. QUẢN LÝ THỰC ĐƠN BÁO GIÁ DỊCH VỤ (PRICE LIST)
    // -------------------------------------------------------------
    function initServicesEditor() {
        if (activePageData.services && activePageData.services.length > 0) {
            btnToggleServices.textContent = "Tắt bảng giá";
            btnToggleServices.classList.add('btn-danger');
            btnAddService.style.display = 'block';
            servicesEditorContainer.style.display = 'flex';
            servicesDisabledMsg.style.display = 'none';
            updateServicesEditorUI();
            renderServiceEditorList();
        } else {
            btnToggleServices.textContent = "Bật bảng giá";
            btnToggleServices.classList.remove('btn-danger');
            btnAddService.style.display = 'none';
            servicesEditorContainer.style.display = 'none';
            servicesDisabledMsg.style.display = 'block';
        }
    }

    function updateServicesEditorUI() {
        if (!activePageData) return;
        
        selectServicesFont.value = activePageData.services_font || 'Montserrat';
        inputServicesSize.value = activePageData.services_size || 13;
        selectServicesAlign.value = activePageData.services_align || 'left';
        
        inputServicesColor.value = activePageData.services_color || '#2b2b2b';
        inputServicesColorHex.value = activePageData.services_color || '#2b2b2b';
        
        inputServicesPriceColor.value = activePageData.services_price_color || '#a62b2b';
        inputServicesPriceColorHex.value = activePageData.services_price_color || '#a62b2b';
        
        btnServicesBold.classList.toggle('active', activePageData.services_bold !== false);
        btnServicesItalic.classList.toggle('active', !!activePageData.services_italic);
        
        inputServicesBg.value = activePageData.services_bg || '#fdfcf7';
        checkServicesBgTransparent.checked = !!activePageData.services_bg_transparent;
        inputServicesBg.disabled = !!activePageData.services_bg_transparent;
        
        inputServicesBorder.value = activePageData.services_border || '#c5a059';
        checkServicesBorderNone.checked = !!activePageData.services_border_none;
        inputServicesBorder.disabled = !!activePageData.services_border_none;
        
        inputServicesBorderRadius.value = activePageData.services_border_radius !== undefined ? activePageData.services_border_radius : 8;
    }

    // Sự kiện chỉnh sửa bảng giá thời gian thực
    selectServicesFont.onchange = (e) => {
        activePageData.services_font = e.target.value;
        renderCanvasPreview();
        checkChanges();
    };

    inputServicesSize.oninput = (e) => {
        activePageData.services_size = parseInt(e.target.value) || 13;
        renderCanvasPreview();
        checkChanges();
    };

    selectServicesAlign.onchange = (e) => {
        activePageData.services_align = e.target.value;
        renderCanvasPreview();
        checkChanges();
    };

    inputServicesColor.oninput = (e) => {
        activePageData.services_color = e.target.value;
        inputServicesColorHex.value = e.target.value;
        renderCanvasPreview();
        checkChanges();
    };

    inputServicesColorHex.oninput = (e) => {
        if (e.target.value.match(/^#[0-9A-F]{6}$/i)) {
            activePageData.services_color = e.target.value;
            inputServicesColor.value = e.target.value;
            renderCanvasPreview();
            checkChanges();
        }
    };

    inputServicesPriceColor.oninput = (e) => {
        activePageData.services_price_color = e.target.value;
        inputServicesPriceColorHex.value = e.target.value;
        renderCanvasPreview();
        checkChanges();
    };

    inputServicesPriceColorHex.oninput = (e) => {
        if (e.target.value.match(/^#[0-9A-F]{6}$/i)) {
            activePageData.services_price_color = e.target.value;
            inputServicesPriceColor.value = e.target.value;
            renderCanvasPreview();
            checkChanges();
        }
    };

    btnServicesBold.onclick = () => {
        activePageData.services_bold = activePageData.services_bold === false ? true : !activePageData.services_bold;
        btnServicesBold.classList.toggle('active', activePageData.services_bold !== false);
        renderCanvasPreview();
        checkChanges();
    };

    btnServicesItalic.onclick = () => {
        activePageData.services_italic = !activePageData.services_italic;
        btnServicesItalic.classList.toggle('active', activePageData.services_italic);
        renderCanvasPreview();
        checkChanges();
    };

    inputServicesBg.oninput = (e) => {
        activePageData.services_bg = e.target.value;
        renderCanvasPreview();
        checkChanges();
    };

    checkServicesBgTransparent.onchange = (e) => {
        activePageData.services_bg_transparent = e.target.checked;
        inputServicesBg.disabled = e.target.checked;
        renderCanvasPreview();
        checkChanges();
    };

    inputServicesBorder.oninput = (e) => {
        activePageData.services_border = e.target.value;
        renderCanvasPreview();
        checkChanges();
    };

    checkServicesBorderNone.onchange = (e) => {
        activePageData.services_border_none = e.target.checked;
        inputServicesBorder.disabled = e.target.checked;
        renderCanvasPreview();
        checkChanges();
    };

    inputServicesBorderRadius.oninput = (e) => {
        activePageData.services_border_radius = parseInt(e.target.value) || 0;
        renderCanvasPreview();
        checkChanges();
    };

    btnToggleServices.onclick = () => {
        if (!activePageData.services) activePageData.services = [];
        
        if (activePageData.services.length > 0) {
            // Tắt bảng giá
            if (confirm("Tắt bảng giá sẽ xóa các dịch vụ đã nhập trên trang này. Bạn đồng ý chứ?")) {
                activePageData.services = [];
                initServicesEditor();
                renderCanvasPreview();
                checkChanges();
            }
        } else {
            // Bật bảng giá, chèn 1 món mẫu
            activePageData.services = [
                { id: 'srv_' + Date.now(), name: 'Dịch vụ mẫu', price: '150.000đ' }
            ];
            activePageData.services_x = 10;
            activePageData.services_y = 25;
            activePageData.services_w = 80;
            activePageData.services_font = 'Montserrat';
            activePageData.services_size = 13;
            activePageData.services_color = '#2b2b2b';
            activePageData.services_price_color = '#a62b2b';
            activePageData.services_align = 'left';
            activePageData.services_bold = true;
            activePageData.services_italic = false;
            activePageData.services_bg = '#fdfcf7';
            activePageData.services_bg_transparent = false;
            activePageData.services_border = '#c5a059';
            activePageData.services_border_none = false;
            activePageData.services_border_radius = 8;
            
            initServicesEditor();
            renderCanvasPreview();
            checkChanges();
        }
    };

    function renderServiceEditorList() {
        serviceListEditorDom.innerHTML = '';
        if (!activePageData.services) return;
        
        activePageData.services.forEach((srv, idx) => {
            const row = document.createElement('div');
            row.className = 'service-edit-item';
            
            const inputName = document.createElement('input');
            inputName.type = 'text';
            inputName.className = 'form-input';
            inputName.placeholder = 'Tên dịch vụ';
            inputName.style.flex = '2';
            inputName.value = srv.name;
            inputName.oninput = (e) => {
                srv.name = e.target.value;
                renderCanvasPreview();
                checkChanges();
            };
            
            const inputPrice = document.createElement('input');
            inputPrice.type = 'text';
            inputPrice.className = 'form-input';
            inputPrice.placeholder = 'Giá';
            inputPrice.style.flex = '1';
            inputPrice.value = srv.price;
            inputPrice.oninput = (e) => {
                srv.price = e.target.value;
                renderCanvasPreview();
                checkChanges();
            };
            
            const btnDel = document.createElement('button');
            btnDel.className = 'action-icon-btn';
            btnDel.style.color = '#ff6b6b';
            btnDel.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
            btnDel.onclick = () => {
                activePageData.services.splice(idx, 1);
                if (activePageData.services.length === 0) {
                    // Tắt luôn bảng giá
                    initServicesEditor();
                } else {
                    renderServiceEditorList();
                }
                renderCanvasPreview();
                checkChanges();
            };
            
            row.appendChild(inputName);
            row.appendChild(inputPrice);
            row.appendChild(btnDel);
            serviceListEditorDom.appendChild(row);
        });
    }

    btnAddService.onclick = () => {
        if (!activePageData.services) activePageData.services = [];
        activePageData.services.push({
            id: 'srv_' + Date.now(),
            name: 'Món mới',
            price: '100K'
        });
        renderServiceEditorList();
        renderCanvasPreview();
        checkChanges();
    };

    // -------------------------------------------------------------
    // 10. CẮT ẢNH & UPLOAD HÌNH ẢNH (CROPPER & UPLOADER)
    // -------------------------------------------------------------
    fileUploader.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        imageToCropFile = file;
        const reader = new FileReader();
        reader.onload = (event) => {
            // Hiển thị modal và ảnh để crop
            cropperTargetImg.src = event.target.result;
            openModal(cropperModal);
            
            // Hủy đối tượng Cropper cũ nếu có
            if (cropper) {
                cropper.destroy();
            }
            
            // Khởi động Cropper.js với tỉ lệ vàng flipbook (0.7037) và cho phép thu phóng tự do lấy toàn bộ ảnh (v3.7.1)
            setTimeout(() => {
                const cropperZoomSlider = document.getElementById('cropper-zoom-slider');
                if (cropperZoomSlider) cropperZoomSlider.value = 1; // Reset slider về 1

                cropper = new Cropper(cropperTargetImg, {
                    aspectRatio: MENU_ASPECT_RATIO,
                    viewMode: 0, // Đặt bằng 0 để ảnh có thể thu nhỏ tự do nhỏ hơn khung cắt, không ép che phủ
                    dragMode: 'move',
                    autoCropArea: 1.0, // Cắt tự động 100% diện tích
                    restore: false,
                    guides: true,
                    center: true,
                    highlight: false,
                    cropBoxMovable: true,
                    cropBoxResizable: true,
                    toggleDragModeOnDblclick: false,
                    zoomable: true,
                    zoomOnTouch: true,
                    zoomOnWheel: true,
                    zoom: function(e) {
                        // Đồng bộ giá trị slider khi pinch-to-zoom trên di động hoặc cuộn chuột
                        if (cropperZoomSlider) {
                            cropperZoomSlider.value = e.detail.ratio;
                        }
                    }
                });

                // Cấu hình sự kiện cho slider và nút reset
                if (cropperZoomSlider) {
                    cropperZoomSlider.oninput = (e) => {
                        if (cropper) cropper.zoomTo(parseFloat(e.target.value));
                    };
                }

                const btnResetZoom = document.getElementById('btn-reset-zoom');
                if (btnResetZoom) {
                    btnResetZoom.onclick = () => {
                        if (cropper) {
                            const containerData = cropper.getContainerData();
                            const imageData = cropper.getImageData();
                            // Tính toán tỷ lệ tối thiểu để ảnh nằm trọn vẹn trong khung cắt
                            const minRatio = Math.min(
                                containerData.width / imageData.naturalWidth,
                                containerData.height / imageData.naturalHeight
                            );
                            cropper.zoomTo(minRatio);
                            if (cropperZoomSlider) cropperZoomSlider.value = minRatio;
                        }
                    };
                }
            }, 100);
        };
        reader.readAsDataURL(file);
    };

    // Đồng ý Cắt ảnh
    btnConfirmCrop.onclick = () => {
        if (!cropper) return;
        
        // Xuất canvas đã cắt
        cropper.getCroppedCanvas({
            width: 500, // Định kích thước xuất tối đa để vừa đẹp, không quá nặng
            height: Math.round(500 / MENU_ASPECT_RATIO),
            fillColor: '#fdfcf7', // Tô màu nền giấy ngà sang trọng cho các khoảng trống nếu thu nhỏ ảnh lấy toàn bộ (v3.7.1)
            imageSmoothingQuality: 'high'
        }).toBlob(async (blob) => {
            if (!blob) return;
            
            showToast('Đang xử lý hình ảnh và upload...', 'info');
            closeModal(cropperModal);
            
            const isBg = activePageData.type === 'custom';
            try {
                // Upload ảnh thông qua DataManager
                const url = await DataManager.uploadImage(activePageId, blob, isBg);
                
                // Đưa ảnh cũ bị thay thế vào danh sách chờ xóa để giải phóng file rác khi bấm Lưu (v3.2)
                const oldUrl = isBg ? activePageData.bg_image : activePageData.image;
                if (oldUrl && oldUrl !== url) {
                    pendingImageDeletions.push(oldUrl);
                    addSystemLog('Đã đưa ảnh cũ bị thay thế vào danh sách chờ dọn dẹp.', 'info');
                }
                
                if (isBg) {
                    activePageData.bg_image = url;
                } else {
                    activePageData.image = url;
                }
                
                showToast('Upload ảnh và cắt xén thành công!');
                updatePageImageUI();
                renderCanvasPreview();
                checkChanges();
            } catch (err) {
                console.error("Lỗi upload ảnh:", err);
                showToast('Lỗi upload ảnh nền!', 'warn');
            }
            
            // Reset input file
            fileUploader.value = '';
        }, 'image/jpeg', 0.88); // Xuất dạng JPEG chất lượng cao để tiết kiệm dung lượng
    };

    btnCancelCrop.onclick = () => {
        closeModal(cropperModal);
        fileUploader.value = '';
    };

    // -------------------------------------------------------------
    // 11. THÊM TRANG MỚI & LƯU THAY ĐỔI
    // -------------------------------------------------------------
    // Thêm trang mới vào sơ đồ
    document.getElementById('btn-add-page').onclick = async () => {
        const pages = await DataManager.getPages();
        const nextOrder = pages.length + 1;
        const newPageId = 'page_' + Date.now();
        
        const newPage = {
            id: newPageId,
            name: `Trang nội dung ${nextOrder}`,
            type: 'image', // Mặc định chỉ up ảnh cho nhanh
            order: nextOrder,
            image: '',
            bg_image: '',
            texts: [],
            services: []
        };
        
        await DataManager.savePage(newPageId, newPage);
        selectPage(newPageId);
        showToast('Đã thêm một trang mới và đồng bộ realtime!');
    };

    // Lưu chỉnh sửa trang hiện tại và Cài đặt chung
    btnSavePageChanges.onclick = async () => {
        showToast('Đang lưu và áp dụng realtime...', 'info');
        addSystemLog('Bắt đầu đồng bộ các thay đổi lên hệ thống...', 'info');
        
        try {
            // A. Lưu trang đang sửa
            if (activePageId && activePageData) {
                const originalPage = allPages.find(p => p.id === activePageId);
                if (originalPage && JSON.stringify(activePageData) !== JSON.stringify(originalPage)) {
                    await DataManager.savePage(activePageId, activePageData);
                    addSystemLog(`Đã lưu thành công các thay đổi của Trang "${activePageData.name}"`, 'success');
                }
            }
            
            // B. Lưu tiêu đề trang web nếu có thay đổi
            if (siteTitleDraft !== '' && siteTitleDraft !== siteTitleOriginal) {
                await DataManager.saveSiteTitle(siteTitleDraft);
                siteTitleOriginal = siteTitleDraft;
                siteTitleDraft = '';
                addSystemLog(`Đã lưu Tiêu đề trang web mới: "${siteTitleOriginal}"`, 'success');
            }
            
            // C. Lưu hình nền web nếu có thay đổi
            if (globalBgDraft !== '' && globalBgDraft !== globalBgOriginal) {
                const saveUrl = globalBgDraft === '__DELETE__' ? '' : globalBgDraft;
                await DataManager.saveGlobalBg(saveUrl);
                globalBgOriginal = saveUrl;
                globalBgDraft = '';
                addSystemLog(saveUrl ? 'Đã áp dụng hình nền trang web toàn cục mới.' : 'Đã gỡ ảnh nền tùy chỉnh, chuyển về mặc định.', 'success');
            }
            
            showToast('Đã lưu và cập nhật menu online thành công!');
            
            // Dọn dẹp trạng thái và cập nhật trực tiếp GUI không reload trang
            
            // Thực hiện xóa các tệp ảnh cũ đang chờ xóa để giải phóng file rác (v3.2)
            if (pendingImageDeletions.length > 0) {
                for (const urlToDelete of pendingImageDeletions) {
                    await DataManager.deleteImage(urlToDelete);
                }
                addSystemLog(`Đã tự động dọn dẹp sạch sẽ ${pendingImageDeletions.length} tệp ảnh rác cũ khỏi bộ lưu trữ.`, 'success');
                pendingImageDeletions = [];
            }
            
            const freshPages = await DataManager.getPages();
            allPages = freshPages;
            
            if (activePageId) {
                const updatedPage = allPages.find(p => p.id === activePageId);
                if (updatedPage) {
                    activePageData = JSON.parse(JSON.stringify(updatedPage));
                }
            }
            
            renderPageList();
            renderCanvasPreview();
            initGlobalSettingsUI();
            checkChanges();
        } catch (e) {
            console.error("Lỗi khi lưu dữ liệu:", e);
            addSystemLog(`Thất bại khi lưu: ${e.message}`, 'error');
            showToast('Lỗi lưu dữ liệu!', 'warn');
        }
    };

    // Hủy bỏ các chỉnh sửa nháp vừa thao tác
    btnDiscardPageChanges.onclick = () => {
        if (confirm('Bạn có chắc chắn muốn hủy bỏ toàn bộ các chỉnh sửa nháp chưa lưu (bao gồm cả Cài đặt chung) không?')) {
            // Phục hồi trang
            if (activePageId && activePageData) {
                const originalPage = allPages.find(p => p.id === activePageId);
                if (originalPage) {
                    activePageData = JSON.parse(JSON.stringify(originalPage));
                    renderCanvasPreview();
                    updateTextEditorUI();
                    initServicesEditor();
                    updatePageImageUI();
                }
            }
            
            // Phục hồi tiêu đề
            if (siteTitleDraft !== '') {
                siteTitleDraft = '';
                inputSiteTitle.value = siteTitleOriginal;
            }
            
            // Phục hồi hình nền
            if (globalBgDraft !== '') {
                globalBgDraft = '';
                updateGlobalBgUI(globalBgOriginal);
                document.body.style.backgroundImage = globalBgOriginal 
                    ? `radial-gradient(circle at 50% 50%, rgba(20, 30, 20, 0.6) 0%, var(--bg-dark) 100%), url('${globalBgOriginal}')`
                    : `radial-gradient(circle at 50% 50%, rgba(20, 30, 20, 0.6) 0%, var(--bg-dark) 100%), url('images/spa_background.png')`;
            }
            
            pendingImageDeletions = []; // Reset danh sách chờ xóa mà không xóa ảnh nào (v3.2)
            checkChanges();
            showToast('Đã hủy bỏ toàn bộ các thay đổi nháp!', 'info');
            addSystemLog('Đã hủy toàn bộ các chỉnh sửa nháp.', 'info');
        }
    };

    // -------------------------------------------------------------
    // 12. CẤU HÌNH ĐÁM MÂY KÉP CONNECTION (FIREBASE & GITHUB CLOUD)
    // -------------------------------------------------------------
    btnOpenCloudModal.onclick = () => {
        const mode = DataManager.getStorageMode();
        if (mode === 'github') {
            switchCloudTab('github');
        } else {
            switchCloudTab('firebase');
        }
        openModal(cloudModal);
    };

    btnCloseCloudModal.onclick = () => {
        closeModal(cloudModal);
    };

    // Chuyển đổi giữa các tab Firebase và GitHub
    function switchCloudTab(tabName) {
        if (tabName === 'firebase') {
            tabBtnFirebase.classList.add('active');
            tabBtnGithub.classList.remove('active');
            tabContentFirebase.classList.add('active');
            tabContentGithub.classList.remove('active');
        } else {
            tabBtnGithub.classList.add('active');
            tabBtnFirebase.classList.remove('active');
            tabContentGithub.classList.add('active');
            tabContentFirebase.classList.remove('active');
        }
    }

    tabBtnFirebase.onclick = () => switchCloudTab('firebase');
    tabBtnGithub.onclick = () => switchCloudTab('github');

    // Lưu Firebase
    btnSaveFirebase.onclick = () => {
        const config = {
            apiKey: inputFbApiKey.value.trim(),
            databaseURL: inputFbDbUrl.value.trim(),
            projectId: inputFbProjId.value.trim(),
            storageBucket: inputFbStorageBucket.value.trim(),
            appId: inputFbAppId.value.trim()
        };
        
        if (!config.apiKey || !config.databaseURL) {
            alert('Vui lòng điền tối thiểu API Key và Database URL!');
            return;
        }
        
        DataManager.saveFirebaseConfig(config);
        closeModal(cloudModal);
        
        showToast('Đang kết nối Firebase và đồng bộ dữ liệu...', 'info');
        setTimeout(() => location.reload(), 1000);
    };

    btnClearFirebase.onclick = () => {
        if (confirm('Bạn có chắc chắn muốn ngắt kết nối Firebase? Dữ liệu sẽ quay về lưu cục bộ ở máy này.')) {
            DataManager.saveFirebaseConfig(null);
            closeModal(cloudModal);
            showToast('Đã xoá cấu hình Firebase, chuyển về Local.', 'info');
            setTimeout(() => location.reload(), 1000);
        }
    };

    // Lưu GitHub
    btnSaveGithub.onclick = async () => {
        const token = inputGhToken.value.trim();
        const username = inputGhUsername.value.trim();
        const repo = selectGhRepo.value;
        const branch = inputGhBranch.value.trim() || 'main';
        
        if (repo === '__CREATE_NEW__' || !repo) {
            alert('Vui lòng chọn hoặc tạo Repository trước khi lưu cấu hình!');
            return;
        }
        
        if (!token || !username) {
            alert('Vui lòng điền và kiểm tra đầy đủ thông tin GitHub (Token, Username)!');
            return;
        }
        
        const config = { username, repo, branch, token };
        DataManager.saveGithubConfig(config);
        
        btnSaveGithub.disabled = true;
        btnSaveGithub.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang đồng bộ...';
        
        addSystemLog(`Đã lưu cấu hình GitHub Cloud. Bắt đầu đẩy toàn bộ mã nguồn lên repo ${username}/${repo} để deploy Pages...`, 'info');
        
        try {
            await syncEntireSourceToGithub();
            closeModal(cloudModal);
            showToast('Cài đặt & Đồng bộ GitHub thành công!', 'success');
            setTimeout(() => location.reload(), 1500);
        } catch (err) {
            console.error(err);
            addSystemLog(`Đồng bộ thất bại: ${err.message}. Tuy nhiên cấu hình vẫn được lưu cục bộ.`, 'warn');
            closeModal(cloudModal);
            setTimeout(() => location.reload(), 1500);
        } finally {
            btnSaveGithub.disabled = false;
            btnSaveGithub.textContent = 'Lưu cấu hình';
        }
    };

    btnClearGithub.onclick = () => {
        if (confirm('Bạn có chắc chắn muốn ngắt kết nối GitHub? Dữ liệu sẽ quay về lưu cục bộ ở máy này.')) {
            DataManager.saveGithubConfig(null);
            closeModal(cloudModal);
            showToast('Đã xoá cấu hình GitHub, chuyển về Local.', 'info');
            setTimeout(() => location.reload(), 1000);
        }
    };

    // -------------------------------------------------------------
    // HÀM TIỆN ÍCH HIỂN THỊ MODAL & TOAST
    // -------------------------------------------------------------
    function openModal(modalEl) {
        modalEl.classList.add('active');
    }

    function closeModal(modalEl) {
        modalEl.classList.remove('active');
        if (modalEl === cropperModal && cropper) {
            cropper.destroy();
            cropper = null;
        }
    }

    // Đóng modal khi bấm nút chéo
    btnCloseCropperModal.onclick = () => closeModal(cropperModal);

    function showToast(message, type = 'success') {
        toastMessage.textContent = message;
        
        // Màu sắc icon tùy loại toast
        const icon = toastNotification.querySelector('i');
        if (type === 'success') {
            icon.className = 'fa-solid fa-circle-check';
            icon.style.color = '#55ff55';
        } else if (type === 'info') {
            icon.className = 'fa-solid fa-circle-info';
            icon.style.color = '#55ccff';
        } else {
            icon.className = 'fa-solid fa-triangle-exclamation';
            icon.style.color = '#ff5555';
        }
        
        toastNotification.classList.add('show');
        
        // Tự tắt sau 3 giây
        setTimeout(() => {
            toastNotification.classList.remove('show');
        }, 3000);
    }

    // -------------------------------------------------------------
    // 13. CẤU HÌNH CHUNG & XEM TRƯỚC LẬT TRANG 3D ST.PAGEFLIP (v3.7.1)
    // -------------------------------------------------------------
    // A. Đồng bộ cấu hình chung lúc khởi tạo
    async function initGlobalSettingsUI() {
        try {
            const title = await DataManager.getSiteTitle();
            siteTitleOriginal = title || '';
            if (inputSiteTitle && document.activeElement !== inputSiteTitle && !siteTitleDraft) {
                inputSiteTitle.value = siteTitleOriginal;
            }
            
            const bg = await DataManager.getGlobalBg();
            globalBgOriginal = bg || '';
            if (!globalBgDraft) {
                updateGlobalBgUI(globalBgOriginal);
                if (globalBgOriginal) {
                    const actualUrl = await DataManager.getImageUrl(globalBgOriginal);
                    document.body.style.backgroundImage = `radial-gradient(circle at 50% 50%, rgba(20, 30, 20, 0.6) 0%, var(--bg-dark) 100%), url('${actualUrl}')`;
                } else {
                    document.body.style.backgroundImage = `radial-gradient(circle at 50% 50%, rgba(20, 30, 20, 0.6) 0%, var(--bg-dark) 100%), url('images/spa_background.png')`;
                }
            }
        } catch (e) {
            console.error("Lỗi nạp cấu hình chung khởi tạo:", e);
        }
    }
    
    // Thực thi nạp lúc tải trang và lắng nghe trigger callbacks
    initGlobalSettingsUI();
    
    DataManager.onDataChange(() => {
        initGlobalSettingsUI();
    });

    // C. Gán click cho nút Lưu/Hủy Cài đặt chung mới (v3.2)
    if (btnSaveGlobal && btnDiscardGlobal) {
        btnSaveGlobal.onclick = () => btnSavePageChanges.click();
        btnDiscardGlobal.onclick = () => btnDiscardPageChanges.click();
    }

    // B. Lắng nghe sự kiện Cài đặt chung
    if (inputSiteTitle) {
        inputSiteTitle.oninput = (e) => {
            siteTitleDraft = e.target.value;
            checkChanges();
        };
    }

    if (btnDeleteGlobalBg) {
        btnDeleteGlobalBg.onclick = () => {
            if (confirm('Bạn có chắc chắn muốn gỡ bỏ ảnh nền tùy chỉnh này để dùng ảnh mặc định của spa không?')) {
                globalBgDraft = '__DELETE__';
                updateGlobalBgUI('');
                document.body.style.backgroundImage = `radial-gradient(circle at 50% 50%, rgba(20, 30, 20, 0.6) 0%, var(--bg-dark) 100%), url('images/spa_background.png')`;
                addSystemLog('Đã gỡ ảnh nền web nháp. Nhấp "Lưu thay đổi" để áp dụng lên đám mây.', 'info');
                checkChanges();
            }
        };
    }

    if (btnDeletePageImage) {
        btnDeletePageImage.onclick = () => {
            if (!activePageData) return;
            if (confirm('Bạn có chắc chắn muốn gỡ bỏ hình ảnh của trang này không?')) {
                const imgToDelete = activePageData.type === 'custom' ? activePageData.bg_image : activePageData.image;
                if (imgToDelete) {
                    pendingImageDeletions.push(imgToDelete);
                }
                
                if (activePageData.type === 'custom') {
                    activePageData.bg_image = '';
                } else {
                    activePageData.image = '';
                }
                
                updatePageImageUI();
                renderCanvasPreview();
                checkChanges();
                showToast('Đã gỡ ảnh trang nháp! Hãy bấm Lưu thay đổi để áp dụng.', 'info');
                addSystemLog('Đã gỡ hình ảnh trang nháp. Hãy bấm Lưu thay đổi để hoàn tất.', 'info');
            }
        };
    }

    if (globalBgUploader) {
        globalBgUploader.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            addSystemLog('Đang tải ảnh nền lên và tối ưu hóa...', 'info');
            showToast('Đang tải ảnh nền web nháp...', 'info');
            
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > 1600) {
                        height = Math.round((1600 / width) * height);
                        width = 1600;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    canvas.toBlob(async (blob) => {
                        try {
                            const url = await DataManager.uploadImage('global_bg_image_draft', blob, true);
                            
                            // Đưa ảnh nền cũ vào danh sách chờ xóa để dọn dẹp file rác khi bấm Lưu (v3.2)
                            if (globalBgOriginal && globalBgOriginal !== url) {
                                pendingImageDeletions.push(globalBgOriginal);
                                addSystemLog('Đã đưa ảnh nền website cũ vào danh sách chờ dọn dẹp.', 'info');
                            }
                            
                            globalBgDraft = url;
                            
                            addSystemLog('Tải ảnh nền nháp thành công! Nhấp "Lưu thay đổi" để áp dụng.', 'success');
                            showToast('Đã nạp ảnh nền nháp!');
                            
                            updateGlobalBgUI(url);
                            document.body.style.backgroundImage = `radial-gradient(circle at 50% 50%, rgba(20, 30, 20, 0.6) 0%, var(--bg-dark) 100%), url('${url}')`;
                            checkChanges();
                        } catch (err) {
                            console.error(err);
                            addSystemLog(`Lỗi tải ảnh nền web: ${err.message}`, 'error');
                            showToast('Lỗi tải ảnh nền!', 'warn');
                        }
                    }, 'image/jpeg', 0.85);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
            globalBgUploader.value = '';
        };
    }

    // C. Thay đổi kích thước mô phỏng Responsive và hiển thị Resolution
    if (btnDeviceDesktop && btnDeviceTablet && btnDeviceMobile) {
        let currentMode = 'desktop';

        function switchDevice(mode) {
            currentMode = mode;
            localStorage.setItem('muxintang_admin_active_device', mode); // Ghi nhớ thiết bị
            btnDeviceDesktop.classList.toggle('active', mode === 'desktop');
            btnDeviceTablet.classList.toggle('active', mode === 'tablet');
            btnDeviceMobile.classList.toggle('active', mode === 'mobile');
            
            let w = 380, h = 540, label = 'Desktop';
            if (mode === 'desktop') {
                w = 380; h = 540; label = 'Desktop';
            } else if (mode === 'tablet') {
                w = 310; h = 440; label = 'Tablet';
            } else {
                w = 240; h = 340; label = 'Mobile';
            }
            
            canvasPreview.style.width = `${w}px`;
            canvasPreview.style.height = `${h}px`;
            
            if (previewResolution) {
                previewResolution.textContent = `Kích thước: ${w}px x ${h}px (${label})`;
            }
            
            addSystemLog(`Đã chuyển độ phân giải xem trước sang: ${mode.toUpperCase()} (${w}x${h})`, 'info');
            
            if (previewMode === 'flip') {
                initFlipbookPreview(w, h);
            } else {
                renderCanvasPreview();
            }
        }

        btnDeviceDesktop.onclick = () => switchDevice('desktop');
        btnDeviceTablet.onclick = () => switchDevice('tablet');
        btnDeviceMobile.onclick = () => switchDevice('mobile');
    }

    // D. Chuyển đổi giữa chế độ biên tập và lật trang 3D
    if (btnPreviewModeEdit && btnPreviewModeFlip) {
        btnPreviewModeEdit.onclick = () => {
            if (previewMode === 'edit') return;
            previewMode = 'edit';
            localStorage.setItem('muxintang_admin_preview_mode', 'edit'); // Ghi nhớ chế độ sửa
            btnPreviewModeEdit.classList.add('active');
            btnPreviewModeFlip.classList.remove('active');
            
            canvasPreview.style.display = 'block';
            flipPreviewContainer.style.display = 'none';
            if (editorHintMsg) editorHintMsg.style.display = 'block';
            
            if (flipPreviewBookInstance) {
                flipPreviewBookInstance.destroy();
                flipPreviewBookInstance = null;
            }
            
            renderCanvasPreview();
            addSystemLog('Đã chuyển sang chế độ thiết kế (Sửa chữ/dịch vụ)', 'info');
        };
        
        btnPreviewModeFlip.onclick = () => {
            if (previewMode === 'flip') return;
            const currentWidth = canvasPreview.offsetWidth || 380;
            const currentHeight = canvasPreview.offsetHeight || 540;
            
            previewMode = 'flip';
            localStorage.setItem('muxintang_admin_preview_mode', 'flip'); // Ghi nhớ chế độ lật
            btnPreviewModeFlip.classList.add('active');
            btnPreviewModeEdit.classList.remove('active');
            
            canvasPreview.style.display = 'none';
            flipPreviewContainer.style.display = 'flex';
            if (editorHintMsg) editorHintMsg.style.display = 'none';
            
            initFlipbookPreview(currentWidth, currentHeight);
            addSystemLog('Đã kích hoạt chế độ xem trước lật sách 3D trực quan.', 'info');
        };

        // Tự động khôi phục chế độ xem và thiết bị đã lưu sau khi load (v3.7.1)
        setTimeout(() => {
            const savedDevice = localStorage.getItem('muxintang_admin_active_device') || 'desktop';
            switchDevice(savedDevice);
            
            const savedPreviewMode = localStorage.getItem('muxintang_admin_preview_mode') || 'edit';
            if (savedPreviewMode === 'flip') {
                btnPreviewModeFlip.click();
            } else {
                btnPreviewModeEdit.click();
            }
        }, 150);
        
        // Điều hướng nút lật trang thu nhỏ
        if (btnFlipPrev && btnFlipNext) {
            btnFlipPrev.onclick = () => {
                if (flipPreviewBookInstance) {
                    const currentIdx = flipPreviewBookInstance.getCurrentPageIndex();
                    const currentSpread = Math.floor(currentIdx / 2) + 1;
                    if (currentSpread > 1) {
                        const targetIdx = (currentSpread - 2) * 2;
                        flipPreviewBookInstance.flip(targetIdx);
                    }
                }
            };
            btnFlipNext.onclick = () => {
                if (flipPreviewBookInstance) {
                    const currentIdx = flipPreviewBookInstance.getCurrentPageIndex();
                    const totalPages = flipPreviewBookInstance.getPageCount();
                    const totalSpreads = Math.ceil(totalPages / 2);
                    const currentSpread = Math.floor(currentIdx / 2) + 1;
                    if (currentSpread < totalSpreads) {
                        const targetIdx = currentSpread * 2;
                        flipPreviewBookInstance.flip(targetIdx);
                    }
                }
            };
        }
    }

    // E. Hàm khởi tạo trình lật trang xem trước (v3.7.1)
    async function initFlipbookPreview(forcedW, forcedH) {
        if (flipPreviewBookInstance) {
            try {
                flipPreviewBookInstance.destroy();
            } catch (e) {
                console.error("Lỗi khi dọn dẹp bộ nhớ lật sách:", e);
            }
            flipPreviewBookInstance = null;
        }
        
        const viewport = document.getElementById('flip-preview-book-viewport');
        if (!viewport) return;
        
        let bookEl = document.getElementById('flip-preview-book');
        if (!bookEl) {
            bookEl = document.createElement('div');
            bookEl.id = 'flip-preview-book';
            bookEl.className = 'flipbook';
            bookEl.style.background = 'transparent';
            viewport.appendChild(bookEl);
        } else {
            bookEl.innerHTML = '';
        }
        
        // Lấy danh sách các trang hiện có (sử dụng bản nháp nếu đang active)
        const pagesToRender = allPages.map(page => {
            if (activePageId && page.id === activePageId) {
                return activePageData;
            }
            return page;
        });
        
        if (pagesToRender.length === 0) {
            flipPreviewBook.innerHTML = '<div style="color: var(--text-muted); font-size: 0.8rem; padding: 20px;">Không có trang nào để hiển thị</div>';
            return;
        }

        // Tải trước tất cả các đường dẫn hình ảnh của các trang một cách đồng thời để tránh lỗi clone DOM không đồng bộ của thư viện
        const imagePromises = pagesToRender.map(async (pageData) => {
            let imgUri = pageData.type === 'custom' ? pageData.bg_image : pageData.image;
            // Fallback lấy ảnh nền website toàn cục nếu là trang tùy biến chưa có ảnh nền riêng
            if (pageData.type === 'custom' && !imgUri) {
                imgUri = globalBgDraft && globalBgDraft !== '__DELETE__' ? globalBgDraft : (globalBgOriginal || 'images/spa_background.png');
            }
            if (imgUri) {
                try {
                    return await DataManager.getImageUrl(imgUri);
                } catch(e) {
                    console.error(e);
                    return '';
                }
            }
            return '';
        });

        const resolvedUrls = await Promise.all(imagePromises);
        
        const tempFragment = document.createDocumentFragment();
        
        // Xác định kích thước sách lật dựa trên canvas
        const bookW = forcedW || canvasPreview.offsetWidth || 310;
        const bookH = forcedH || canvasPreview.offsetHeight || 440;
        
        // 1. Trang lót trong suốt bên lề trái
        const pageTrans = document.createElement('div');
        pageTrans.className = 'page page-transparent';
        pageTrans.setAttribute('data-density', 'hard');
        pageTrans.style.width = `${bookW}px`;
        pageTrans.style.height = `${bookH}px`;
        pageTrans.innerHTML = '<div class="page-content" style="width: 100%; height: 100%;"></div>';
        tempFragment.appendChild(pageTrans);
        
        // 2. Render các trang nội dung
        for (let i = 0; i < pagesToRender.length; i++) {
            const pageData = pagesToRender[i];
            const url = resolvedUrls[i];
            
            // Trang lót trắng từ trang chẵn
            if (i > 0) {
                const whitePage = document.createElement('div');
                whitePage.className = 'page page-white';
                whitePage.style.width = `${bookW}px`;
                whitePage.style.height = `${bookH}px`;
                whitePage.innerHTML = '<div class="page-content" style="width: 100%; height: 100%;"></div>';
                tempFragment.appendChild(whitePage);
            }
            
            const contentPage = document.createElement('div');
            contentPage.className = pageData.type === 'custom' ? 'page page-custom' : 'page page-image';
            contentPage.style.width = `${bookW}px`;
            contentPage.style.height = `${bookH}px`;
            
            if (i === 0 || i === pagesToRender.length - 1) {
                contentPage.setAttribute('data-density', 'hard');
            }
            
            const pageContent = document.createElement('div');
            pageContent.className = 'page-content';
            pageContent.style.width = '100%';
            pageContent.style.height = '100%';
            
            if (url) {
                pageContent.style.backgroundImage = `url('${url}')`;
            }
            
            if (pageData.type === 'custom') {
                if (pageData.texts) {
                    pageData.texts.forEach(text => {
                        const textEl = document.createElement('div');
                        textEl.className = 'custom-text-element';
                        const scaleRatio = bookW / 380;
                        
                        let style = `position: absolute; left: ${text.x}%; top: ${text.y}%; font-family: ${text.font || 'Montserrat'}, sans-serif; font-size: ${Math.floor(text.size * 0.81 * scaleRatio)}px; color: ${text.color || '#333'};`;
                        if (text.w !== undefined) style += ` width: ${text.w}%;`;
                        if (text.h !== undefined) style += ` height: ${text.h}%;`;
                        if (text.bold) style += ' font-weight: bold;';
                        if (text.italic) style += ' font-style: italic;';
                        if (text.underline) style += ' text-decoration: underline;';
                        textEl.setAttribute('style', style);
                        textEl.textContent = text.content;
                        pageContent.appendChild(textEl);
                    });
                }
                
                if (pageData.services && pageData.services.length > 0) {
                    const sContainer = document.createElement('div');
                    sContainer.className = 'custom-services-container';
                    const scaleRatio = bookW / 380;
                    
                    const sX = pageData.services_x !== undefined ? pageData.services_x : 10;
                    const sY = pageData.services_y !== undefined ? pageData.services_y : 25;
                    const sW = pageData.services_w !== undefined ? pageData.services_w : 80;
                    sContainer.setAttribute('style', `position: absolute; left: ${sX}%; top: ${sY}%; width: ${sW}%; font-size: ${Math.floor(13 * scaleRatio)}px;`);
                    
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
                        sContainer.appendChild(item);
                    });
                    pageContent.appendChild(sContainer);
                }
            }
            
            contentPage.appendChild(pageContent);
            tempFragment.appendChild(contentPage);
        }
        
        bookEl.appendChild(tempFragment);
        
        flipPreviewBookViewport.style.width = `${bookW * 2 + 30}px`;
        flipPreviewBookViewport.style.height = `${bookH + 30}px`;
        
        try {
            flipPreviewBookInstance = new St.PageFlip(bookEl, {
                width: bookW,
                height: bookH,
                size: "fixed",
                minWidth: bookW,
                maxWidth: bookW,
                minHeight: bookH,
                maxHeight: bookH,
                showCover: false,
                usePortrait: false,
                flippingTime: 300,
                swipeDistance: 15,
                maxShadowOpacity: 0.4,
                showPageCorners: true,
                disableKeyPress: true
            });
            
            flipPreviewBookInstance.loadFromHTML(bookEl.querySelectorAll('.page'));
            updateFlipPageIndicator();
            
            // --- NÂNG CẤP v3.7.1: TỰ ĐỘNG LẬT ĐẾN TRANG ĐANG CHỌN KHI KHỞI TẠO XEM TRƯỚC LẬT TRANG 3D ---
            if (activePageId) {
                const activeIdx = allPages.findIndex(p => p.id === activePageId);
                if (activeIdx >= 0) {
                    setTimeout(() => {
                        if (flipPreviewBookInstance) {
                            flipPreviewBookInstance.flip(activeIdx * 2);
                        }
                    }, 150);
                }
            }
            
            flipPreviewBookInstance.on('flip', (e) => {
                updateFlipPageIndicator(e.data);
            });
        } catch (err) {
            console.error("Lỗi khởi tạo PageFlip xem trước:", err);
            addSystemLog("Lỗi khởi tạo hiệu ứng lật trang 3D.", "error");
        }
    }

    function updateFlipPageIndicator(pageIndex) {
        if (!flipPreviewBookInstance) return;
        const currentIdx = (pageIndex !== undefined) ? pageIndex : flipPreviewBookInstance.getCurrentPageIndex();
        const totalPages = flipPreviewBookInstance.getPageCount();
        const totalSpreads = Math.ceil(totalPages / 2);
        const currentSpread = Math.floor(currentIdx / 2) + 1;
        
        flipPageIndicator.textContent = `${currentSpread} / ${totalSpreads}`;
        
        const bookEl = document.getElementById('flip-preview-book');
        if (!bookEl) return;
        
        const pages = bookEl.querySelectorAll('.page');
        if (pages.length > 0) {
            if (pages[0]) pages[0].style.pointerEvents = 'none';
            const lastPageIdx = totalPages - 1;
            if (currentSpread === totalSpreads) {
                if (pages[lastPageIdx]) pages[lastPageIdx].style.pointerEvents = 'none';
            } else {
                if (pages[lastPageIdx]) pages[lastPageIdx].style.pointerEvents = 'auto';
            }
        }
    }

    // ==========================================================================
    // 14. LOGIC PHÓNG TO ẢNH XEM CHI TIẾT CHO ADMIN (v3.7.1)
    // ==========================================================================
    const adminZoomModal = document.getElementById('admin-image-zoom-modal');
    const adminZoomImg = document.getElementById('admin-zoom-modal-img');
    const adminZoomCaption = document.getElementById('admin-zoom-caption');
    const adminZoomClose = document.getElementById('admin-zoom-close-btn');

    async function triggerAdminZoom(imgUri, captionText) {
        if (!imgUri || !adminZoomModal || !adminZoomImg) return;
        try {
            const actualUrl = await DataManager.getImageUrl(imgUri);
            if (actualUrl) {
                adminZoomImg.src = actualUrl;
                if (adminZoomCaption) adminZoomCaption.textContent = captionText;
                openModal(adminZoomModal); // Sử dụng hàm dựng sẵn của admin để mở modal mượt mà
            }
        } catch (e) {
            console.error("Lỗi phóng to ảnh trong admin:", e);
        }
    }

    // A. Nhấp vào thumbnail trang ở cột phải
    if (pageImageThumbnail) {
        pageImageThumbnail.onclick = () => {
            if (!activePageData) return;
            let imgUri = activePageData.type === 'custom' ? activePageData.bg_image : activePageData.image;
            // Fallback lấy ảnh nền website toàn cục nếu là trang tùy biến chưa có ảnh riêng
            if (activePageData.type === 'custom' && !imgUri) {
                imgUri = globalBgDraft && globalBgDraft !== '__DELETE__' ? globalBgDraft : (globalBgOriginal || 'images/spa_background.png');
            }
            if (imgUri) {
                triggerAdminZoom(imgUri, `Ảnh trang: ${activePageData.name || 'Không tên'}`);
            }
        };
    }

    // B. Nhấp vào thumbnail ảnh nền website ở cột trái
    if (globalBgThumbnail) {
        globalBgThumbnail.onclick = () => {
            const imgUri = globalBgDraft && globalBgDraft !== '__DELETE__' ? globalBgDraft : (globalBgOriginal || 'images/spa_background.png');
            triggerAdminZoom(imgUri, "Hình nền website toàn cục (Global Background)");
        };
    }

    // C. Nhấp vào vùng trống của Canvas xem trước ở cột giữa
    if (canvasPreview) {
        canvasPreview.addEventListener('click', (e) => {
            // Chỉ kích hoạt khi click chính xác vào nền canvas trống (không đè lên chữ/dịch vụ)
            if (e.target === canvasPreview && activePageData) {
                if (canvasPreview.classList.contains('page-transparent')) return;
                
                let imgUri = activePageData.type === 'custom' ? activePageData.bg_image : activePageData.image;
                // Fallback lấy ảnh nền website toàn cục nếu là trang tùy biến chưa có ảnh riêng
                if (activePageData.type === 'custom' && !imgUri) {
                    imgUri = globalBgDraft && globalBgDraft !== '__DELETE__' ? globalBgDraft : (globalBgOriginal || 'images/spa_background.png');
                }
                if (imgUri) {
                    triggerAdminZoom(imgUri, `Xem trước ảnh nền: ${activePageData.name || 'Không tên'}`);
                }
            }
        });
    }

    // D. Sự kiện đóng modal
    if (adminZoomClose) {
        adminZoomClose.onclick = () => {
            closeModal(adminZoomModal); // Sử dụng hàm dựng sẵn của admin để đóng modal
        };
    }
    if (adminZoomModal) {
        adminZoomModal.onclick = (e) => {
            if (e.target === adminZoomModal) {
                closeModal(adminZoomModal);
            }
        };
    }
    // Đồng bộ toàn bộ mã nguồn website tĩnh lên GitHub Repository (v3.8)
    async function syncEntireSourceToGithub() {
        const ghConfig = DataManager.getGithubConfig();
        if (!ghConfig || !ghConfig.token) {
            throw new Error('Chưa cấu hình tài khoản hoặc thiếu GitHub Access Token!');
        }
        
        addSystemLog('Khởi động đồng bộ mã nguồn website lên GitHub Repository...', 'info');
        showToast('Đang đồng bộ source code lên GitHub...', 'info');
        
        const filesToSync = [
            'index.html',
            'index.css',
            'main.js',
            'data-manager.js',
            'admin.html',
            'admin.js',
            'icon.js',
            'server.js',
            'start_project.bat',
            'stop_project.bat',
            '.nojekyll',
            '.github/workflows/static.yml'
        ];
        
        const imagesToSync = [
            'images/dau.jpg',
            'images/2.jpg',
            'images/3.jpg',
            'images/4.jpg',
            'images/5.jpeg',
            'images/6.jpg',
            'images/7.jpg',
            'images/8.jpg',
            'images/cuoi.jpg',
            'images/spa_background.png',
            'icon/1-phone.png',
            'icon/2-wechat.png',
            'icon/3-zalo.png',
            'icon/4-maps.png'
        ];
        
        try {
            // A. Kích hoạt GitHub Pages bằng Actions
            const pagesUrl = `https://api.github.com/repos/${ghConfig.username}/${ghConfig.repo}/pages`;
            try {
                await fetch(pagesUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${ghConfig.token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/vnd.github+json',
                        'X-GitHub-Api-Version': '2022-11-28'
                    },
                    body: JSON.stringify({ build_type: 'workflow' })
                });
                addSystemLog('Đã bật tính năng GitHub Pages (build_type: workflow).', 'success');
            } catch (e) {
                // Đã bật từ trước hoặc có lỗi, tiếp tục tiến trình
            }
            
            // B. Tải lên các file mã nguồn cốt lõi
            for (const filePath of filesToSync) {
                addSystemLog(`Đang đẩy file mã nguồn: ${filePath}...`, 'info');
                const fileRes = await fetch(`${filePath}?t=${Date.now()}`);
                if (fileRes.ok) {
                    const content = await fileRes.text();
                    await uploadFileToGithub(filePath, content, false);
                } else {
                    addSystemLog(`Bỏ qua file không đọc được: ${filePath}`, 'warn');
                }
            }
            
            // C. Tải lên các file ảnh mặc định nếu chưa tồn tại
            for (const imgPath of imagesToSync) {
                const checkUrl = `https://api.github.com/repos/${ghConfig.username}/${ghConfig.repo}/contents/${imgPath}?ref=${ghConfig.branch || 'main'}`;
                const checkRes = await fetch(checkUrl, {
                    headers: { 
                        'Authorization': `Bearer ${ghConfig.token}`,
                        'Accept': 'application/vnd.github+json',
                        'X-GitHub-Api-Version': '2022-11-28'
                    }
                });
                if (checkRes.status !== 200) {
                    addSystemLog(`Tải lên tài nguyên ảnh mặc định thiếu trên repo: ${imgPath}...`, 'info');
                    const imgRes = await fetch(imgPath);
                    if (imgRes.ok) {
                        const blob = await imgRes.blob();
                        await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                                const rawBase64 = reader.result.split(',')[1];
                                try {
                                    await uploadFileToGithub(imgPath, rawBase64, true);
                                    resolve();
                                } catch (err) { reject(err); }
                            };
                            reader.onerror = reject;
                            reader.readAsDataURL(blob);
                        });
                    }
                }
            }
            
            addSystemLog(`Đã đồng bộ thành công toàn bộ mã nguồn lên repo ${ghConfig.username}/${ghConfig.repo}.`, 'success');
            showToast('Đồng bộ mã nguồn GitHub thành công!');
        } catch (error) {
            console.error("Lỗi đồng bộ mã nguồn:", error);
            addSystemLog(`Lỗi đồng bộ mã nguồn lên GitHub: ${error.message}`, 'error');
            throw error;
        }
    }
    
    // Hàm phụ trợ upload tệp đơn lẻ lên GitHub qua API
    async function uploadFileToGithub(filePath, content, isBase64 = false) {
        const ghConfig = DataManager.getGithubConfig();
        const { username, repo, token, branch = 'main' } = ghConfig;
        const url = `https://api.github.com/repos/${username}/${repo}/contents/${filePath}`;
        
        let sha = null;
        try {
            const checkRes = await fetch(`${url}?ref=${branch}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });
            if (checkRes.status === 200) {
                const fileInfo = await checkRes.json();
                sha = fileInfo.sha;
            }
        } catch (e) {}

        let base64Content = isBase64 ? content : btoa(unescape(encodeURIComponent(content)));

        const body = {
            message: `Dong bo code ${filePath} [v3.8]`,
            content: base64Content,
            branch: branch
        };
        if (sha) body.sha = sha;

        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(`Ghi file ${filePath} thất bại: ${err.message}`);
        }
    }
});
