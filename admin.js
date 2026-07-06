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
    
    // Controls Chữ (Text)
    const sectionTextManager = document.getElementById('section-text-manager');
    const textEditInstructions = document.getElementById('text-edit-instructions');
    const textElementEditor = document.getElementById('text-element-editor');
    const btnAddText = document.getElementById('btn-add-text');
    const inputTextContent = document.getElementById('input-text-content');
    const selectTextFont = document.getElementById('select-text-font');
    const inputTextSize = document.getElementById('input-text-size');
    const inputTextColor = document.getElementById('input-text-color');
    const inputTextColorHex = document.getElementById('input-text-color-hex');
    const btnFormatBold = document.getElementById('btn-format-bold');
    const btnFormatItalic = document.getElementById('btn-format-italic');
    const btnFormatUnderline = document.getElementById('btn-format-underline');
    const btnDeleteText = document.getElementById('btn-delete-text');
    
    // Controls Dịch vụ (Services)
    const sectionServicesManager = document.getElementById('section-services-manager');
    const btnToggleServices = document.getElementById('btn-toggle-services');
    const btnAddService = document.getElementById('btn-add-service');
    const servicesEditorContainer = document.getElementById('services-editor-container');
    const serviceListEditorDom = document.getElementById('service-list-editor-dom');
    const servicesDisabledMsg = document.getElementById('services-disabled-msg');
    
    // Controls Nhật ký & Log (v3.0)
    const logContainer = document.getElementById('log-container');
    const btnClearLogs = document.getElementById('btn-clear-logs');

    // Controls Ảnh nền web toàn cục
    const globalBgUploader = document.getElementById('global-bg-uploader');
    const inputSiteTitle = document.getElementById('input-site-title');
    const btnDeleteGlobalBg = document.getElementById('btn-delete-global-bg');
    const globalBgThumbnail = document.getElementById('global-bg-thumbnail');

    // Controls Xem trước nâng cấp (v3.6)
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
        
        // Đồng bộ Cài đặt chung (v3.6)
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
                headers: { 'Authorization': `token ${token}` }
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
                headers: { 'Authorization': `token ${token}` }
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
                    'Authorization': `token ${token}`,
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
            
            // Nút di chuyển lên (Sắp xếp)
            if (i > 0) {
                const btnUp = document.createElement('button');
                btnUp.className = 'action-icon-btn';
                btnUp.title = 'Di chuyển lên';
                btnUp.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
                btnUp.onclick = (e) => {
                    e.stopPropagation();
                    movePageOrder(i, i - 1);
                };
                actions.appendChild(btnUp);
            }
            
            // Nút di chuyển xuống (Sắp xếp)
            if (i < allPages.length - 1) {
                const btnDown = document.createElement('button');
                btnDown.className = 'action-icon-btn';
                btnDown.title = 'Di chuyển xuống';
                btnDown.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
                btnDown.onclick = (e) => {
                    e.stopPropagation();
                    movePageOrder(i, i + 1);
                };
                actions.appendChild(btnDown);
            }

            // Nút xóa trang
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
            // A. Vẽ các phần tử chữ
            if (activePageData.texts) {
                activePageData.texts.forEach(text => {
                    const textEl = document.createElement('div');
                    textEl.className = `canvas-text-el ${text.id === selectedTextId ? 'selected' : ''}`;
                    textEl.setAttribute('data-id', text.id);
                    
                    const canvasWidth = canvasPreview.offsetWidth || 310;
                    const scaleRatio = canvasWidth / 380;
                    let style = `left: ${text.x}%; top: ${text.y}%; font-family: ${text.font || 'Montserrat'}, sans-serif; font-size: ${Math.floor(text.size * 0.81 * scaleRatio)}px; color: ${text.color || '#333'};`;
                    if (text.bold) style += ' font-weight: bold;';
                    if (text.italic) style += ' font-style: italic;';
                    if (text.underline) style += ' text-decoration: underline;';
                    textEl.setAttribute('style', style);
                    
                    textEl.textContent = text.content;
                    
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
                
                const canvasWidth = canvasPreview.offsetWidth || 310;
                const scaleRatio = canvasWidth / 380;
                sContainer.setAttribute('style', `left: ${sX}%; top: ${sY}%; width: ${sW}%; font-size: ${Math.floor(13 * scaleRatio)}px;`);
                
                activePageData.services.forEach(service => {
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

    // Co giãn kích thước font chữ khi kéo góc
    function initResizeElement(event, element, textId) {
        event.preventDefault();
        const startX = event.clientX;
        const textObj = activePageData.texts.find(t => t.id === textId);
        if (!textObj) return;
        
        const initialSize = textObj.size || 16;
        
        function onMouseMove(e) {
            const deltaX = e.clientX - startX;
            // Mỗi 5px kéo ngang tương đương tăng/giảm 1px font size
            let newSize = initialSize + Math.round(deltaX / 5);
            if (newSize < 10) newSize = 10;
            if (newSize > 100) newSize = 100;
            
            textObj.size = newSize;
            
            // Update tạm thời lên canvas để mượt
            element.style.fontSize = `${Math.floor(newSize * 0.81)}px`;
            
            // Update input nếu text này đang được chọn
            if (selectedTextId === textId) {
                inputTextSize.value = newSize;
            }
        }
        
        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            renderCanvasPreview(); // Khởi tạo vẽ lại hoàn chỉnh
            checkChanges();
        }
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
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
        inputTextColor.value = textObj.color || '#333333';
        inputTextColorHex.value = textObj.color || '#333333';
        
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
                // Giữ lại handle resize
                el.firstChild.textContent = e.target.value;
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
            y: 40
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
            renderServiceEditorList();
        } else {
            btnToggleServices.textContent = "Bật bảng giá";
            btnToggleServices.classList.remove('btn-danger');
            btnAddService.style.display = 'none';
            servicesEditorContainer.style.display = 'none';
            servicesDisabledMsg.style.display = 'block';
        }
    }

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
            
            // Khởi động Cropper.js với tỉ lệ vàng flipbook (0.7037)
            setTimeout(() => {
                cropper = new Cropper(cropperTargetImg, {
                    aspectRatio: MENU_ASPECT_RATIO,
                    viewMode: 1, // Hạn chế vùng cắt luôn nằm trong ảnh
                    dragMode: 'move',
                    autoCropArea: 0.9, // Cắt tự động 90% diện tích
                    restore: false,
                    guides: true,
                    center: true,
                    highlight: false,
                    cropBoxMovable: true,
                    cropBoxResizable: true,
                    toggleDragModeOnDblclick: false
                });
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
    btnSaveGithub.onclick = () => {
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
        closeModal(cloudModal);
        
        addSystemLog(`Đã lưu cấu hình GitHub Cloud (Repo: ${username}/${repo}, Nhánh: ${branch})`, 'success');
        showToast('Cài đặt GitHub Cloud thành công!', 'success');
        setTimeout(() => location.reload(), 1000);
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
    // 13. CẤU HÌNH CHUNG & XEM TRƯỚC LẬT TRANG 3D ST.PAGEFLIP (v3.6)
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
            btnPreviewModeFlip.classList.add('active');
            btnPreviewModeEdit.classList.remove('active');
            
            canvasPreview.style.display = 'none';
            flipPreviewContainer.style.display = 'flex';
            if (editorHintMsg) editorHintMsg.style.display = 'none';
            
            initFlipbookPreview(currentWidth, currentHeight);
            addSystemLog('Đã kích hoạt chế độ xem trước lật sách 3D trực quan.', 'info');
        };
        
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

    // E. Hàm khởi tạo trình lật trang xem trước
    function initFlipbookPreview(forcedW, forcedH) {
        if (!flipPreviewBook) return;
        
        if (flipPreviewBookInstance) {
            flipPreviewBookInstance.destroy();
            flipPreviewBookInstance = null;
        }
        
        flipPreviewBook.innerHTML = '';
        
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
            
            const imgUri = pageData.type === 'custom' ? pageData.bg_image : pageData.image;
            if (imgUri) {
                DataManager.getImageUrl(imgUri).then(url => {
                    if (url) pageContent.style.backgroundImage = `url('${url}')`;
                }).catch(e => console.error(e));
            }
            
            if (pageData.type === 'custom') {
                if (pageData.texts) {
                    pageData.texts.forEach(text => {
                        const textEl = document.createElement('div');
                        textEl.className = 'custom-text-element';
                        const scaleRatio = bookW / 380;
                        
                        let style = `position: absolute; left: ${text.x}%; top: ${text.y}%; font-family: ${text.font || 'Montserrat'}, sans-serif; font-size: ${Math.floor(text.size * 0.81 * scaleRatio)}px; color: ${text.color || '#333'};`;
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
        
        flipPreviewBook.appendChild(tempFragment);
        
        flipPreviewBookViewport.style.width = `${bookW * 2 + 30}px`;
        flipPreviewBookViewport.style.height = `${bookH + 30}px`;
        
        try {
            flipPreviewBookInstance = new St.PageFlip(flipPreviewBook, {
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
            
            flipPreviewBookInstance.loadFromHTML(flipPreviewBook.querySelectorAll('.page'));
            updateFlipPageIndicator();
            
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
        
        const pages = flipPreviewBook.querySelectorAll('.page');
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
    // 14. LOGIC PHÓNG TO ẢNH XEM CHI TIẾT CHO ADMIN (v3.6)
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
});
