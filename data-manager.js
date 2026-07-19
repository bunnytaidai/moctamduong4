/**
 * data-manager.js (v2.5)
 * Quản lý dữ liệu thời gian thực cho Menu Online (Firebase, GitHub API & Offline Local Fallback)
 * Hỗ trợ 3 chế độ lưu trữ 100% MIỄN PHÍ:
 *   1. Chế độ FIREBASE (Khuyên dùng cho Realtime): Sử dụng Realtime Database & Storage.
 *   2. Chế độ GITHUB API (Lách luật tự chủ 100%): Lưu dữ liệu trực tiếp vào file menu_data.json và ảnh vào thư mục images trên repository của bạn qua GitHub API.
 *   3. Chế độ LOCAL (Offline): Sử dụng LocalStorage và IndexedDB để chạy thử nghiệm cục bộ trên máy.
 */

// -------------------------------------------------------------
// 1. Nhận diện cấu hình lưu trữ từ LocalStorage
// -------------------------------------------------------------
let firebaseConfig = null;
let githubConfig = null;
let activeStorageMode = 'local'; // 'local' | 'firebase' | 'github'

try {
    const savedFb = localStorage.getItem('muxintang_firebase_config');
    if (savedFb) firebaseConfig = JSON.parse(savedFb);
    
    const savedGh = localStorage.getItem('muxintang_github_config');
    if (savedGh) githubConfig = JSON.parse(savedGh);
} catch (e) {
    console.error("Không thể đọc cấu hình lưu trữ:", e);
}

let db = null;
let storage = null;
const dataChangeCallbacks = [];
let lastTriggeredPages = null; // Lưu trữ cấu hình thực đơn đã nạp gần nhất để đồng bộ ngay lập tức

// Hàm kích hoạt các callback phản hồi khi dữ liệu thay đổi
function triggerCallbacks(pagesList) {
    lastTriggeredPages = pagesList; // Lưu lại bộ dữ liệu mới nhất
    dataChangeCallbacks.forEach(cb => {
        try {
            cb(pagesList);
        } catch (e) {
            console.error("Lỗi thực thi callback thay đổi dữ liệu:", e);
        }
    });
}

// Khởi chạy kết nối dựa trên độ ưu tiên cấu hình
function initStorageConnection() {
    if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.databaseURL) {
        try {
            if (typeof firebase !== 'undefined' && firebase.apps) {
                if (!firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                }
                db = firebase.database();
                storage = firebase.storage();
                activeStorageMode = 'firebase';
                console.log("Đang chạy chế độ: FIREBASE CLOUD REALTIME");
                
                // Lắng nghe thay đổi realtime từ Firebase
                db.ref('menu_pages').on('value', (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        let pagesList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                        pagesList.sort((a, b) => a.order - b.order);
                        localStorage.setItem('muxintang_menu_pages_cache', JSON.stringify(pagesList));
                        triggerCallbacks(pagesList);
                    } else {
                        setupDefaultData();
                    }
                });

                // Lắng nghe ảnh nền toàn trang từ Firebase
                db.ref('global_bg').on('value', (snapshot) => {
                    const bg = snapshot.val();
                    localStorage.setItem('muxintang_global_bg', bg || '');
                    DataManager.getPages().then(pages => triggerCallbacks(pages)).catch(() => {});
                });

                // Lắng nghe tiêu đề trang web từ Firebase
                db.ref('site_title').on('value', (snapshot) => {
                    const title = snapshot.val();
                    localStorage.setItem('muxintang_site_title', title || '');
                    DataManager.getPages().then(pages => triggerCallbacks(pages)).catch(() => {});
                });

                // Lắng nghe thay đổi layout tổng thể từ Firebase (v3.5)
                db.ref('global_layout').on('value', (snapshot) => {
                    const layout = snapshot.val();
                    localStorage.setItem('muxintang_global_layout', JSON.stringify(layout || {}));
                    DataManager.getPages().then(pages => triggerCallbacks(pages)).catch(() => {});
                });
                return;
            }
        } catch (e) {
            console.error("Lỗi khởi tạo Firebase, tự động fallback:", e);
        }
    }

    if (githubConfig && githubConfig.username && githubConfig.repo && githubConfig.token) {
        activeStorageMode = 'github';
        console.log("Đang chạy chế độ: GITHUB API CLOUD (Database & Storage tích hợp thẳng vào Repo)");
        
        // Load dữ liệu lần đầu tiên từ GitHub
        loadGithubData();
        
        // Tạo chế độ Polling kiểm tra thay đổi file mỗi 30 giây để cập nhật realtime
        setInterval(() => {
            loadGithubData(true); // Chỉ load ngầm kiểm tra sha thay đổi
        }, 30000);
        return;
    }

    activeStorageMode = 'local';
    console.log("Đang chạy chế độ: LOCAL OFFLINE (LocalStorage & IndexedDB)");
    loadLocalData();
}

// -------------------------------------------------------------
// 2. KHỞI TẠO BỘ NHỚ LOCAL OFFLINE (IndexedDB cho ảnh)
// -------------------------------------------------------------
const DB_NAME = 'MuxintangLocalDB';
const DB_VERSION = 1;
const STORE_NAME = 'images';

function getLocalDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
            const database = e.target.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

async function saveLocalImage(id, base64OrBlob) {
    const localDb = await getLocalDB();
    return new Promise((resolve, reject) => {
        const transaction = localDb.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(base64OrBlob, id);
        request.onsuccess = () => resolve(id);
        request.onerror = (e) => reject(e.target.error);
    });
}

async function getLocalImage(id) {
    const localDb = await getLocalDB();
    return new Promise((resolve, reject) => {
        const transaction = localDb.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

async function deleteLocalImage(id) {
    const localDb = await getLocalDB();
    return new Promise((resolve, reject) => {
        const transaction = localDb.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
    });
}

// -------------------------------------------------------------
// 3. DỮ LIỆU MẪU MẶC ĐỊNH BAN ĐẦU
// -------------------------------------------------------------
const DEFAULT_PAGES = [
    { id: 'page_1', order: 1, type: 'image', image: 'images/dau.jpg', name: 'Trang Bìa Trước' },
    { id: 'page_2', order: 2, type: 'image', image: 'images/2.jpg', name: 'Giới thiệu / Cứu ngải' },
    { id: 'page_3', order: 3, type: 'image', image: 'images/3.jpg', name: 'Gội đầu dưỡng sinh' },
    { id: 'page_4', order: 4, type: 'image', image: 'images/4.jpg', name: 'Massage cổ vai gáy' },
    { id: 'page_5', order: 5, type: 'image', image: 'images/5.jpg', name: 'Chăm sóc thắt lưng' },
    { id: 'page_6', order: 6, type: 'image', image: 'images/6.jpg', name: 'Ngâm chân thảo dược' },
    { id: 'page_7', order: 7, type: 'image', image: 'images/cuoi.jpg', name: 'Trang Bìa Sau' }
];

async function setupDefaultData() {
    let defaultData = JSON.parse(JSON.stringify(DEFAULT_PAGES));
    try {
        const imgFiles = await fetchImageFilesList();
        defaultData = syncPagesWithImageFiles(defaultData, imgFiles);
    } catch (e) {
        console.error("Lỗi đồng bộ trong setupDefaultData:", e);
    }
    
    if (activeStorageMode === 'firebase' && db) {
        const updates = {};
        defaultData.forEach(page => { updates[`menu_pages/${page.id}`] = page; });
        await db.ref().update(updates);
        await db.ref('site_title').set('Muxintang Wellness Spa');
        await db.ref('global_bg').set('');
    } else if (activeStorageMode === 'github') {
        try {
            await saveGithubData(defaultData);
        } catch (err) {
            console.error("Không thể tự động khởi tạo menu_data.json trên GitHub Repo mới:", err);
            const fullData = {
                site_title: 'Muxintang Wellness Spa',
                global_bg: '',
                pages: defaultData
            };
            localStorage.setItem('muxintang_menu_pages_cache', JSON.stringify(fullData));
            localStorage.setItem('muxintang_site_title', 'Muxintang Wellness Spa');
            localStorage.setItem('muxintang_global_bg', '');
            triggerCallbacks(defaultData);
        }
    } else {
        const fullData = {
            site_title: 'Muxintang Wellness Spa',
            global_bg: '',
            pages: defaultData
        };
        localStorage.setItem('muxintang_menu_pages', JSON.stringify(fullData));
        localStorage.setItem('muxintang_site_title', 'Muxintang Wellness Spa');
        localStorage.setItem('muxintang_global_bg', '');
        triggerCallbacks(defaultData);
    }
}

// Hàm tải dữ liệu thực đơn tĩnh từ file menu_data.json trên host tĩnh (v3.3)
async function loadStaticMenuData() {
    try {
        // Thêm query timestamp chống trình duyệt cache kết quả cũ
        const res = await fetch(`menu_data.json?t=${Date.now()}`);
        if (res.ok) {
            const parsedData = await res.json();
            
            // KIỂM TRA PHIÊN BẢN CỦA CLOUD ĐỂ TRÁNH TRÌNH DUYỆT KHÁCH BỊ CACHE
            const serverTime = parsedData.last_updated;
            const localTime = localStorage.getItem('muxintang_last_updated');
            if (serverTime && localTime && parseInt(serverTime) > parseInt(localTime)) {
                localStorage.setItem('muxintang_last_updated', serverTime);
                localStorage.removeItem('muxintang_menu_pages_cache');
                localStorage.removeItem('muxintang_menu_pages');
                console.log("Phát hiện phiên bản Cloud mới hơn. Đang hard-reload trang web...");
                window.location.reload();
                return true;
            } else if (serverTime) {
                localStorage.setItem('muxintang_last_updated', serverTime);
            }

            let pagesList = Array.isArray(parsedData) ? parsedData : (parsedData.pages || []);
            
            // Tự động quét và đồng bộ trang theo tệp ảnh trong thư mục images (v3.9)
            try {
                const imgFiles = await fetchImageFilesList();
                pagesList = syncPagesWithImageFiles(pagesList, imgFiles);
            } catch (e) {
                console.error("Lỗi đồng bộ trang theo thư mục images:", e);
            }

            let globalBg = Array.isArray(parsedData) ? '' : (parsedData.global_bg || '');
            localStorage.setItem('muxintang_global_bg', globalBg);
            
            let globalLayout = parsedData.global_layout || {};
            let siteTitle = Array.isArray(parsedData) ? '' : (parsedData.site_title || '');
            localStorage.setItem('muxintang_site_title', siteTitle);
            localStorage.setItem('muxintang_global_layout', JSON.stringify(globalLayout));
            
            pagesList.sort((a, b) => a.order - b.order);
            
            // Cập nhật bộ nhớ đệm Local để hỗ trợ chạy offline
            localStorage.setItem('muxintang_menu_pages_cache', JSON.stringify(pagesList));
            localStorage.setItem('muxintang_menu_pages', JSON.stringify({
                site_title: siteTitle,
                global_bg: globalBg,
                pages: pagesList,
                global_layout: globalLayout
            }));
            
            triggerCallbacks(pagesList);
            console.log("Đồng bộ thành công dữ liệu thực đơn từ menu_data.json trên máy chủ.");
            return true;
        }
    } catch (err) {
        console.warn("Không thể tự động tải menu_data.json từ máy chủ (đang chạy offline):", err);
    }
    return false;
}

async function loadLocalData() {
    // 1. Cố gắng nạp dữ liệu thực đơn mới nhất từ file menu_data.json trên server tĩnh
    const hasLoadedStatic = await loadStaticMenuData();
    if (hasLoadedStatic) return;

    // 2. Fallback: Nếu không tải được (ví dụ chạy file:// offline hoặc mất kết nối), đọc từ LocalStorage
    let pages = null;
    try {
        const cached = localStorage.getItem('muxintang_menu_pages_cache');
        const local = localStorage.getItem('muxintang_menu_pages');
        
        let parsedCached = cached ? JSON.parse(cached) : null;
        let parsedLocal = local ? JSON.parse(local) : null;
        
        let finalCachedPages = parsedCached ? (Array.isArray(parsedCached) ? parsedCached : (parsedCached.pages || [])) : null;
        let finalLocalPages = parsedLocal ? (Array.isArray(parsedLocal) ? parsedLocal : (parsedLocal.pages || [])) : null;
        
        let cachedBg = parsedCached && !Array.isArray(parsedCached) ? parsedCached.global_bg : '';
        let localBg = parsedLocal && !Array.isArray(parsedLocal) ? parsedLocal.global_bg : '';
        if (cachedBg) localStorage.setItem('muxintang_global_bg', cachedBg);
        else if (localBg) localStorage.setItem('muxintang_global_bg', localBg);
        
        let cachedTitle = parsedCached && !Array.isArray(parsedCached) ? parsedCached.site_title : '';
        let localTitle = parsedLocal && !Array.isArray(parsedLocal) ? parsedLocal.site_title : '';
        if (cachedTitle) localStorage.setItem('muxintang_site_title', cachedTitle);
        else if (localTitle) localStorage.setItem('muxintang_site_title', localTitle);

        let cachedLayout = parsedCached && !Array.isArray(parsedCached) ? parsedCached.global_layout : null;
        let localLayout = parsedLocal && !Array.isArray(parsedLocal) ? parsedLocal.global_layout : null;
        if (cachedLayout) localStorage.setItem('muxintang_global_layout', JSON.stringify(cachedLayout));
        else if (localLayout) localStorage.setItem('muxintang_global_layout', JSON.stringify(localLayout));
        
        pages = finalCachedPages || finalLocalPages;
    } catch (e) {
        console.error(e);
    }

    // Tự động quét và đồng bộ trang theo tệp ảnh trong thư mục images khi chạy local (v3.9)
    try {
        const imgFiles = await fetchImageFilesList();
        pages = syncPagesWithImageFiles(pages || [], imgFiles);
        // Cập nhật lại bộ nhớ đệm
        localStorage.setItem('muxintang_menu_pages_cache', JSON.stringify(pages));
        if (pages && pages.length > 0) {
            const globalBg = localStorage.getItem('muxintang_global_bg') || '';
            const siteTitle = localStorage.getItem('muxintang_site_title') || '';
            const globalLayoutStr = localStorage.getItem('muxintang_global_layout') || '{}';
            const globalLayout = JSON.parse(globalLayoutStr);
            localStorage.setItem('muxintang_menu_pages', JSON.stringify({
                site_title: siteTitle,
                global_bg: globalBg,
                pages: pages,
                global_layout: globalLayout
            }));
        }
    } catch (e) {
        console.error("Lỗi đồng bộ trang theo thư mục images trong loadLocalData:", e);
    }

    if (!pages || pages.length === 0) {
        setupDefaultData();
    } else {
        pages.sort((a, b) => a.order - b.order);
        setTimeout(() => triggerCallbacks(pages), 50);
    }
}

// A. Hàm bổ trợ cắt đuôi file tương đương path.extname
function getFilenameExt(filename) {
    const idx = filename.lastIndexOf('.');
    return idx === -1 ? '' : filename.substring(idx);
}

// B. Hàm quét danh sách ảnh trong thư mục images (hỗ trợ cả GitHub API online và Local API offline)
async function fetchImageFilesList() {
    // 1. Nếu đang cấu hình GitHub, ưu tiên gọi GitHub API quét contents của thư mục images
    if (activeStorageMode === 'github' && githubConfig) {
        const { username, repo, token, branch = 'main' } = githubConfig;
        const url = `https://api.github.com/repos/${username}/${repo}/contents/images?ref=${branch}`;
        try {
            const headers = new Headers();
            headers.append('Accept', 'application/vnd.github+json');
            headers.append('X-GitHub-Api-Version', '2022-11-28');
            if (token) {
                headers.append('Authorization', `Bearer ${token}`);
            }
            const res = await fetch(url, { headers });
            if (res.ok) {
                const files = await res.json();
                const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
                return files
                    .filter(f => f.type === 'file' && imageExtensions.includes(getFilenameExt(f.name).toLowerCase()) && !f.name.toLowerCase().includes('spa_background'))
                    .map(f => f.name);
            }
        } catch (e) {
            console.error("Lỗi quét thư mục images trên GitHub:", e);
        }
    }
    
    // 2. Chạy local hoặc fallback: gọi API local quét thư mục images của dự án
    try {
        const res = await fetch('/api/list-images');
        if (res.ok) {
            const files = await res.json();
            return files.filter(f => !f.toLowerCase().includes('spa_background'));
        }
    } catch (e) {
        console.warn("Không thể quét images từ API local (chạy tĩnh):", e);
    }
    
    // 3. Trả về danh sách mặc định nếu hoàn toàn không kết nối được
    return ['dau.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg', 'cuoi.jpg'];
}

// C. Hàm đồng bộ danh sách trang dựa trên các tệp ảnh thực tế trong thư mục images
function syncPagesWithImageFiles(pagesList, imageFiles) {
    // Sắp xếp danh sách tệp ảnh theo đúng thứ tự logic:
    // - Bìa trước (dau.jpg, cover.jpg) đứng đầu.
    // - Bìa sau (cuoi.jpg, back.jpg) đứng cuối.
    // - Các tệp là số xếp tăng dần. Các tệp khác xếp theo bảng chữ cái.
    imageFiles.sort((a, b) => {
        const isCoverA = a.toLowerCase().includes('dau') || a.toLowerCase().includes('cover') || a.toLowerCase().includes('front');
        const isCoverB = b.toLowerCase().includes('dau') || b.toLowerCase().includes('cover') || b.toLowerCase().includes('front');
        if (isCoverA && !isCoverB) return -1;
        if (!isCoverA && isCoverB) return 1;

        const isBackA = a.toLowerCase().includes('cuoi') || a.toLowerCase().includes('back') || a.toLowerCase().includes('end');
        const isBackB = b.toLowerCase().includes('cuoi') || b.toLowerCase().includes('back') || b.toLowerCase().includes('end');
        if (isBackA && !isBackB) return 1;
        if (!isBackA && isBackB) return -1;

        const numA = parseInt(a.match(/\d+/));
        const numB = parseInt(b.match(/\d+/));
        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }
        if (!isNaN(numA)) return -1;
        if (!isNaN(numB)) return 1;

        return a.localeCompare(b);
    });

    const newPagesList = [];
    const validImagePaths = imageFiles.map(f => 'images/' + f);
    const mappedImages = new Set();

    // 1. Giữ lại các trang ảnh tĩnh có tệp tin còn tồn tại và giữ lại trang custom tự thiết kế
    pagesList.forEach(page => {
        if (page.type === 'custom') {
            newPagesList.push(page);
        } else if (page.type === 'image' && page.image) {
            if (validImagePaths.includes(page.image)) {
                newPagesList.push(page);
                mappedImages.add(page.image);
            }
        }
    });

    // 2. Tạo trang mới cho các tệp ảnh mới được thêm vào thư mục images
    imageFiles.forEach(filename => {
        const imgPath = 'images/' + filename;
        if (!mappedImages.has(imgPath)) {
            const isCover = filename.toLowerCase().includes('dau') || filename.toLowerCase().includes('cover') || filename.toLowerCase().includes('front');
            const isBack = filename.toLowerCase().includes('cuoi') || filename.toLowerCase().includes('back') || filename.toLowerCase().includes('end');
            
            newPagesList.push({
                id: 'page_' + filename.split('.')[0] + '_' + Math.random().toString(36).substr(2, 5),
                order: 9999, // Đặt tạm thời cuối
                type: 'image',
                image: imgPath,
                name: isCover ? 'Trang Bìa Trước' : (isBack ? 'Trang Bìa Sau' : 'Trang Menu ' + filename.split('.')[0])
            });
        }
    });

    // 3. Sắp xếp lại thứ tự order của toàn bộ danh sách trang
    newPagesList.sort((a, b) => {
        const isCoverA = a.type === 'image' && (a.image.toLowerCase().includes('dau') || a.image.toLowerCase().includes('cover'));
        const isCoverB = b.type === 'image' && (b.image.toLowerCase().includes('dau') || b.image.toLowerCase().includes('cover'));
        if (isCoverA && !isCoverB) return -1;
        if (!isCoverA && isCoverB) return 1;

        const isBackA = a.type === 'image' && (a.image.toLowerCase().includes('cuoi') || a.image.toLowerCase().includes('back'));
        const isBackB = b.type === 'image' && (b.image.toLowerCase().includes('cuoi') || b.image.toLowerCase().includes('back'));
        if (isBackA && !isBackB) return 1;
        if (!isBackA && isBackB) return -1;

        if (a.type === 'image' && b.type === 'image') {
            return validImagePaths.indexOf(a.image) - validImagePaths.indexOf(b.image);
        }

        return a.order - b.order;
    });

    // Cập nhật lại số thứ tự tuần tự
    newPagesList.forEach((page, idx) => {
        page.order = idx + 1;
    });

    return newPagesList;
}

// Hàm tải dữ liệu từ file menu_data.json trong Repo qua GitHub API
async function loadGithubData(isSilentPoll = false) {
    if (!githubConfig) return;
    const { username, repo, branch = 'main' } = githubConfig;
    const url = `https://api.github.com/repos/${username}/${repo}/contents/menu_data.json?ref=${branch}`;
    
    try {
        // Sử dụng Headers để ngăn chặn Github API bị cache từ trình duyệt khách
        const headers = new Headers();
        headers.append('pragma', 'no-cache');
        headers.append('cache-control', 'no-cache');
        
        // Nếu ở trang Admin, dùng token để tránh bị giới hạn API Rate Limit của Github
        if (githubConfig.token) {
            headers.append('Authorization', `Bearer ${githubConfig.token}`);
            headers.append('Accept', 'application/vnd.github+json');
            headers.append('X-GitHub-Api-Version', '2022-11-28');
        }

        const res = await fetch(url, { headers });
        if (res.status === 404) {
            if (!isSilentPoll) {
                console.log("Không tìm thấy file menu_data.json trên Github. Khởi tạo dữ liệu mặc định...");
                await setupDefaultData();
            }
            return;
        }

        const fileInfo = await res.json();
        
        // Nếu kiểm tra poll mà sha không đổi, bỏ qua không render lại tránh giật hình
        if (isSilentPoll && fileInfo.sha === lastGithubSha) {
            return;
        }
        
        lastGithubSha = fileInfo.sha;
        
        // Giải mã nội dung Base64 nhận được từ Github API (lọc bỏ khoảng trắng/xuống dòng)
        const base64Str = (fileInfo.content || '').replace(/\s/g, '');
        const decodedContent = decodeURIComponent(escape(atob(base64Str)));
        const parsedData = JSON.parse(decodedContent);
        
        // KIỂM TRA PHIÊN BẢN CỦA CLOUD ĐỂ TRÁNH TRÌNH DUYỆT KHÁCH BỊ CACHE
        const serverTime = parsedData.last_updated;
        const localTime = localStorage.getItem('muxintang_last_updated');
        if (serverTime && localTime && parseInt(serverTime) > parseInt(localTime)) {
            localStorage.setItem('muxintang_last_updated', serverTime);
            localStorage.removeItem('muxintang_menu_pages_cache');
            localStorage.removeItem('muxintang_menu_pages');
            console.log("Phát hiện phiên bản Cloud mới hơn. Đang hard-reload trang web...");
            window.location.reload();
            return;
        } else if (serverTime) {
            localStorage.setItem('muxintang_last_updated', serverTime);
        }

        let pagesList = Array.isArray(parsedData) ? parsedData : (parsedData.pages || []);
        
        // Tự động quét và đồng bộ trang theo tệp ảnh trong thư mục images (v3.9)
        try {
            const imgFiles = await fetchImageFilesList();
            pagesList = syncPagesWithImageFiles(pagesList, imgFiles);
        } catch (e) {
            console.error("Lỗi đồng bộ trang theo thư mục images:", e);
        }

        let globalBg = Array.isArray(parsedData) ? '' : (parsedData.global_bg || '');
        localStorage.setItem('muxintang_global_bg', globalBg);
        
        let siteTitle = Array.isArray(parsedData) ? '' : (parsedData.site_title || '');
        localStorage.setItem('muxintang_site_title', siteTitle);

        let globalLayout = parsedData.global_layout || {};
        localStorage.setItem('muxintang_global_layout', JSON.stringify(globalLayout));
        
        pagesList.sort((a, b) => a.order - b.order);
        
        // Cache lại
        localStorage.setItem('muxintang_menu_pages_cache', JSON.stringify(pagesList));
        triggerCallbacks(pagesList);
        
    } catch (err) {
        console.error("Lỗi khi kết nối GitHub API:", err);
        // Fallback về cache local khi mất mạng
        if (!isSilentPoll) {
            const cached = localStorage.getItem('muxintang_menu_pages_cache');
            if (cached) {
                const parsed = JSON.parse(cached);
                const pages = Array.isArray(parsed) ? parsed : (parsed.pages || []);
                triggerCallbacks(pages);
            }
        }
    }
}

// Hàm lưu dữ liệu vào file menu_data.json trong Repo qua GitHub API
async function saveGithubData(pagesData) {
    if (!githubConfig || !githubConfig.token) return;
    const { username, repo, token, branch = 'main' } = githubConfig;
    const url = `https://api.github.com/repos/${username}/${repo}/contents/menu_data.json`;
    
    // Bước A: Lấy SHA của file hiện tại để Github cho phép ghi đè
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
    } catch (e) {
        console.warn("Không tìm thấy file cũ để lấy SHA, có thể là tạo mới.");
    }

    // Bước B: Chuyển dữ liệu sang Base64
    const globalBg = localStorage.getItem('muxintang_global_bg') || '';
    const siteTitle = localStorage.getItem('muxintang_site_title') || '';
    const globalLayoutStr = localStorage.getItem('muxintang_global_layout') || '{}';
    const globalLayout = JSON.parse(globalLayoutStr);
    const fullData = {
        site_title: siteTitle,
        global_bg: globalBg,
        pages: pagesData,
        global_layout: globalLayout,
        last_updated: Date.now()
    };
    const jsonStr = JSON.stringify(fullData, null, 2);
    const base64Content = btoa(unescape(encodeURIComponent(jsonStr)));
    
    // Bước C: Thực hiện ghi đè commit trực tiếp lên Github
    const body = {
        message: "Cập nhật dữ liệu thực đơn Muxintang v2.0 [Admin Cloud]",
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
        const errInfo = await res.json();
        throw new Error(errInfo.message || "Lỗi lưu file lên Github");
    }
    
    const resData = await res.json();
    lastGithubSha = resData.content.sha;
    
    // Cập nhật callback ngay lập tức ở máy hiện tại
    triggerCallbacks(pagesData);
}

// -------------------------------------------------------------
// 5. API TƯƠNG TÁC DỮ LIỆU CÔNG KHAI (INTERFACE)
// -------------------------------------------------------------
const DataManager = {
    // Lưu cấu hình Firebase
    saveFirebaseConfig(config) {
        if (!config) {
            localStorage.removeItem('muxintang_firebase_config');
            firebaseConfig = null;
        } else {
            localStorage.setItem('muxintang_firebase_config', JSON.stringify(config));
            firebaseConfig = config;
            // Xóa cấu hình GitHub để tránh xung đột
            this.saveGithubConfig(null);
        }
        initStorageConnection();
    },

    getFirebaseConfig() { return firebaseConfig; },

    // Lưu cấu hình GitHub
    saveGithubConfig(config) {
        if (!config) {
            localStorage.removeItem('muxintang_github_config');
            githubConfig = null;
        } else {
            localStorage.setItem('muxintang_github_config', JSON.stringify(config));
            githubConfig = config;
            // Xóa cấu hình Firebase để tránh xung đột
            this.saveFirebaseConfig(null);
        }
        initStorageConnection();
    },

    getGithubConfig() { return githubConfig; },

    getStorageMode() { return activeStorageMode; },

    isFirebaseConnected() { return activeStorageMode === 'firebase'; },

    init() {
        initStorageConnection();
    },

    async getPages() {
        if (activeStorageMode === 'firebase' && db) {
            const snapshot = await db.ref('menu_pages').once('value');
            const data = snapshot.val();
            if (data) {
                let pagesList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                pagesList.sort((a, b) => a.order - b.order);
                return pagesList;
            }
        } else if (activeStorageMode === 'github') {
            await loadGithubData();
            const cached = localStorage.getItem('muxintang_menu_pages_cache');
            if (cached) return JSON.parse(cached);
        }
        
        // Fallback local
        const localData = localStorage.getItem('muxintang_menu_pages');
        if (localData) {
            const parsed = JSON.parse(localData);
            const pages = Array.isArray(parsed) ? parsed : (parsed.pages || []);
            pages.sort((a, b) => a.order - b.order);
            return pages;
        }
        return DEFAULT_PAGES;
    },

    async savePage(pageId, pageData) {
        const id = pageId || 'page_' + Date.now();
        const data = {
            id: id,
            name: pageData.name || 'Trang mới',
            type: pageData.type || 'image',
            order: pageData.order || 99,
            image: pageData.image || '',
            bg_image: pageData.bg_image || '',
            texts: pageData.texts || [],
            services: pageData.services || [],
            services_x: pageData.services_x !== undefined ? pageData.services_x : 10,
            services_y: pageData.services_y !== undefined ? pageData.services_y : 25,
            services_w: pageData.services_w !== undefined ? pageData.services_w : 80
        };

        if (activeStorageMode === 'firebase' && db) {
            await db.ref(`menu_pages/${id}`).set(data);
        } else {
            let pages = await this.getPages();
            const existingIdx = pages.findIndex(p => p.id === id);
            if (existingIdx >= 0) {
                pages[existingIdx] = data;
            } else {
                pages.push(data);
            }
            pages.sort((a, b) => a.order - b.order);
            
            if (activeStorageMode === 'github') {
                await saveGithubData(pages);
            } else {
                const globalBg = localStorage.getItem('muxintang_global_bg') || '';
                const siteTitle = localStorage.getItem('muxintang_site_title') || '';
                const fullData = {
                    site_title: siteTitle,
                    global_bg: globalBg,
                    pages: pages
                };
                localStorage.setItem('muxintang_menu_pages', JSON.stringify(fullData));
                triggerCallbacks(pages);
            }
        }
        return id;
    },

    async deletePage(pageId) {
        // Lấy thông tin trang trước để dọn dẹp file rác
        let pages = await this.getPages();
        const pageToDelete = pages.find(p => p.id === pageId);
        if (pageToDelete) {
            if (pageToDelete.image) {
                await this.deleteImage(pageToDelete.image);
            }
            if (pageToDelete.bg_image) {
                await this.deleteImage(pageToDelete.bg_image);
            }
        }

        if (activeStorageMode === 'firebase' && db) {
            await db.ref(`menu_pages/${pageId}`).remove();
        } else {
            pages = pages.filter(p => p.id !== pageId);
            pages.forEach((p, idx) => { p.order = idx + 1; });
            
            if (activeStorageMode === 'github') {
                await saveGithubData(pages);
            } else {
                const globalBg = localStorage.getItem('muxintang_global_bg') || '';
                const siteTitle = localStorage.getItem('muxintang_site_title') || '';
                const fullData = {
                    site_title: siteTitle,
                    global_bg: globalBg,
                    pages: pages
                };
                localStorage.setItem('muxintang_menu_pages', JSON.stringify(fullData));
                triggerCallbacks(pages);
            }
        }
    },

    async updatePagesOrder(orderedIds) {
        let pages = await this.getPages();
        orderedIds.forEach((id, index) => {
            const page = pages.find(p => p.id === id);
            if (page) page.order = index + 1;
        });
        pages.sort((a, b) => a.order - b.order);

        if (activeStorageMode === 'firebase' && db) {
            const updates = {};
            pages.forEach(p => { updates[`menu_pages/${p.id}/order`] = p.order; });
            await db.ref().update(updates);
        } else if (activeStorageMode === 'github') {
            await saveGithubData(pages);
        } else {
            const globalBg = localStorage.getItem('muxintang_global_bg') || '';
            const siteTitle = localStorage.getItem('muxintang_site_title') || '';
            const fullData = {
                site_title: siteTitle,
                global_bg: globalBg,
                pages: pages
            };
            localStorage.setItem('muxintang_menu_pages', JSON.stringify(fullData));
            triggerCallbacks(pages);
        }
    },

    // Hàm upload ảnh: Tự động chuyển đổi dựa trên chế độ đang chạy
    async uploadImage(pageId, fileOrBlob, isBg = false) {
        const imageKey = isBg ? `bg_image_${pageId}` : `page_image_${pageId}`;
        
        if (activeStorageMode === 'firebase' && storage) {
            const ref = storage.ref().child(`images/${imageKey}.jpg`);
            const snapshot = await ref.put(fileOrBlob);
            return await snapshot.ref.getDownloadURL();
        }
        
        if (activeStorageMode === 'github' && githubConfig) {
            // Chuyển blob sang base64 để upload lên Repo qua GitHub API
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const rawBase64 = reader.result.split(',')[1]; // Lấy phần dữ liệu mã hóa thô
                    const { username, repo, token, branch = 'main' } = githubConfig;
                    const url = `https://api.github.com/repos/${username}/${repo}/contents/images/${imageKey}.jpg`;
                    
                    try {
                        // Kiểm tra xem file đã tồn tại trên Github chưa để lấy SHA (nếu ghi đè)
                        let sha = null;
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

                        const body = {
                            message: `Upload hình ảnh ${imageKey} via Admin Dashboard [v2.0]`,
                            content: rawBase64,
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

                        if (!res.ok) throw new Error("Lỗi tải ảnh lên Github");
                        
                        // Trả về đường dẫn raw image URL của Github
                        // Cho phép truy cập hình ảnh tốc độ cao và miễn phí vĩnh viễn
                        const rawUrl = `https://raw.githubusercontent.com/${username}/${repo}/${branch}/images/${imageKey}.jpg`;
                        resolve(rawUrl);

                    } catch (e) {
                        reject(e);
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(fileOrBlob);
            });
        }

        // Chế độ Local: Lưu vào cơ sở dữ liệu IndexedDB của trình duyệt
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    await saveLocalImage(imageKey, reader.result);
                    resolve(`localdb://${imageKey}`);
                } catch (e) { reject(e); }
            };
            reader.onerror = reject;
            reader.readAsDataURL(fileOrBlob);
        });
    },

    // Hàm xóa ảnh để giải phóng tài nguyên rác (v3.2)
    async deleteImage(imageUrl) {
        if (!imageUrl) return;

        // Bỏ qua không xóa các ảnh mặc định của hệ thống
        const systemDefaults = ['images/dau.jpg', 'images/2.jpg', 'images/3.jpg', 'images/4.jpg', 'images/5.jpg', 'images/6.jpg', 'images/cuoi.jpg', 'images/spa_background.png'];
        if (systemDefaults.includes(imageUrl)) {
            console.log("Giữ lại ảnh mặc định của hệ thống:", imageUrl);
            return;
        }

        // 1. Nếu là IndexedDB local
        if (imageUrl.startsWith('localdb://')) {
            const imageKey = imageUrl.replace('localdb://', '');
            try {
                await deleteLocalImage(imageKey);
                console.log(`Đã xóa ảnh IndexedDB: ${imageKey}`);
            } catch (e) {
                console.error("Lỗi khi xóa ảnh IndexedDB:", e);
            }
            return;
        }

        // 2. Nếu là Firebase Storage
        if (activeStorageMode === 'firebase' && storage) {
            if (imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
                try {
                    await storage.refFromURL(imageUrl).delete();
                    console.log("Đã xóa ảnh trên Firebase Storage:", imageUrl);
                } catch (e) {
                    console.error("Lỗi khi xóa ảnh Firebase:", e);
                }
            }
            return;
        }

        // 3. Nếu là GitHub Cloud
        if (activeStorageMode === 'github' && githubConfig) {
            const { username, repo, token, branch = 'main' } = githubConfig;
            // Trích xuất tên tệp từ URL raw của GitHub
            const regex = new RegExp(`raw\\.githubusercontent\\.com/${username}/${repo}/${branch}/images/(.+)`, 'i');
            const match = imageUrl.match(regex);
            if (match && match[1]) {
                const filename = match[1];
                const url = `https://api.github.com/repos/${username}/${repo}/contents/images/${filename}`;
                try {
                    // Bước A: Lấy SHA của tệp
                    const checkRes = await fetch(`${url}?ref=${branch}`, {
                        headers: { 
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/vnd.github+json',
                            'X-GitHub-Api-Version': '2022-11-28'
                        }
                    });
                    if (checkRes.status === 200) {
                        const fileInfo = await checkRes.json();
                        const sha = fileInfo.sha;

                        // Bước B: Gọi API DELETE
                        const deleteRes = await fetch(url, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Accept': 'application/vnd.github+json',
                                'X-GitHub-Api-Version': '2022-11-28',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                message: `Xóa hình ảnh rác ${filename} via Admin Dashboard [v3.2]`,
                                sha: sha,
                                branch: branch
                            })
                        });
                        if (deleteRes.ok) {
                            console.log(`Đã xóa ảnh rác trên GitHub: ${filename}`);
                        } else {
                            console.warn("Lỗi API GitHub khi xóa file:", await deleteRes.json());
                        }
                    }
                } catch (e) {
                    console.error("Lỗi kết nối API GitHub khi xóa file rác:", e);
                }
            }
        }
    },

    async getSiteTitle() {
        if (activeStorageMode === 'firebase' && db) {
            const snapshot = await db.ref('site_title').once('value');
            return snapshot.val() || '';
        }
        return localStorage.getItem('muxintang_site_title') || '';
    },

    async saveSiteTitle(title) {
        localStorage.setItem('muxintang_site_title', title);
        
        if (activeStorageMode === 'firebase' && db) {
            await db.ref('site_title').set(title);
        } else if (activeStorageMode === 'github') {
            const pages = await this.getPages();
            await saveGithubData(pages);
        } else {
            const pages = await this.getPages();
            const globalBg = localStorage.getItem('muxintang_global_bg') || '';
            const fullData = {
                site_title: title,
                global_bg: globalBg,
                pages: pages
            };
            localStorage.setItem('muxintang_menu_pages', JSON.stringify(fullData));
            triggerCallbacks(pages);
        }
    },

    async getGlobalBg() {
        if (activeStorageMode === 'firebase' && db) {
            const snapshot = await db.ref('global_bg').once('value');
            return snapshot.val() || '';
        }
        return localStorage.getItem('muxintang_global_bg') || '';
    },

    async saveGlobalBg(imageUri) {
        localStorage.setItem('muxintang_global_bg', imageUri);
        
        if (activeStorageMode === 'firebase' && db) {
            await db.ref('global_bg').set(imageUri);
        } else if (activeStorageMode === 'github') {
            const pages = await this.getPages();
            await saveGithubData(pages);
        } else {
            const pages = await this.getPages();
            const siteTitle = localStorage.getItem('muxintang_site_title') || '';
            const globalLayoutStr = localStorage.getItem('muxintang_global_layout') || '{}';
            const globalLayout = JSON.parse(globalLayoutStr);
            const fullData = {
                site_title: siteTitle,
                global_bg: imageUri,
                pages: pages,
                global_layout: globalLayout
            };
            localStorage.setItem('muxintang_menu_pages', JSON.stringify(fullData));
            triggerCallbacks(pages);
        }
    },

    async getGlobalLayout() {
        if (activeStorageMode === 'firebase' && db) {
            const snapshot = await db.ref('global_layout').once('value');
            return snapshot.val() || {};
        }
        const localData = localStorage.getItem('muxintang_global_layout');
        return localData ? JSON.parse(localData) : {};
    },

    async saveGlobalLayout(layoutData) {
        localStorage.setItem('muxintang_global_layout', JSON.stringify(layoutData));
        
        if (activeStorageMode === 'firebase' && db) {
            await db.ref('global_layout').set(layoutData);
        } else if (activeStorageMode === 'github') {
            const pages = await this.getPages();
            await saveGithubData(pages);
        } else {
            const pages = await this.getPages();
            const siteTitle = localStorage.getItem('muxintang_site_title') || '';
            const globalBg = localStorage.getItem('muxintang_global_bg') || '';
            const fullData = {
                site_title: siteTitle,
                global_bg: globalBg,
                pages: pages,
                global_layout: layoutData
            };
            localStorage.setItem('muxintang_menu_pages', JSON.stringify(fullData));
            triggerCallbacks(pages);
        }
    },

    async loadTempGithubConfig(tempConfig) {
        const oldConfig = githubConfig;
        const oldMode = activeStorageMode;
        
        githubConfig = tempConfig;
        activeStorageMode = 'github';
        
        try {
            await loadGithubData(false);
        } catch (err) {
            githubConfig = oldConfig;
            activeStorageMode = oldMode;
            throw err;
        }
    },

    async getImageUrl(imageUri) {
        if (!imageUri) return '';
        if (imageUri.startsWith('localdb://')) {
            const imageKey = imageUri.replace('localdb://', '');
            try {
                const base64Data = await getLocalImage(imageKey);
                return base64Data || '';
            } catch (e) {
                console.error("Lỗi đọc ảnh từ IndexedDB:", e);
                return '';
            }
        }
        return imageUri;
    },

    onDataChange(callback) {
        if (typeof callback === 'function') {
            dataChangeCallbacks.push(callback);
            // Nếu hệ thống đã nạp sẵn dữ liệu từ trước, gọi ngay lập tức cho callback này
            if (lastTriggeredPages) {
                try {
                    callback(lastTriggeredPages);
                } catch (e) {
                    console.error("Lỗi thực thi callback khởi tạo ngay lập tức:", e);
                }
            }
        }
    },

    offDataChange(callback) {
        const index = dataChangeCallbacks.indexOf(callback);
        if (index > -1) dataChangeCallbacks.splice(index, 1);
    }
};

DataManager.init();
window.DataManager = DataManager;
