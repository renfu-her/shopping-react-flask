/**
 * 后台管理通用 JavaScript 函数
 */

const API_BASE = '/backend/admin';

/**
 * 检查登录状态（通过 session）
 */
async function checkAuth() {
    try {
        console.log('检查认证状态...');
        const response = await fetch(`${API_BASE}/me`, {
            method: 'GET',
            credentials: 'include'  // 重要：包含 cookies
        });
        
        if (!response.ok) {
            console.log('认证失败，状态码:', response.status);
            if (response.status === 401) {
                window.location.href = '/backend/login';
            }
            return false;
        }
        console.log('认证成功');
        return true;
    } catch (error) {
        console.error('认证检查出错:', error);
        // 如果是网络错误，不要立即重定向，让用户看到错误信息
        if (error.message && error.message.includes('Failed to fetch')) {
            console.error('网络错误，无法连接到服务器');
            return false;
        }
        window.location.href = '/backend/login';
        return false;
    }
}

/**
 * 加载 base.html 并初始化页面
 * @param {Function} initPageFunction - 页面初始化函数
 */
async function loadBaseAndInit(initPageFunction) {
    try {
        // 先检查登录状态
        const isAuth = await checkAuth();
        if (!isAuth) {
            console.log('未通过认证，已重定向到登录页面');
            return;
        }

        console.log('认证通过，开始加载 base.html');

        // 加载 base.html
        const response = await fetch('/backend/static/base.html', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`加载 base.html 失败: ${response.status} ${response.statusText}`);
        }
        
        const html = await response.text();
        console.log('base.html 加载成功');
        
        // 解析 base.html
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // 提取 head 中的 link 和 script 标签
        const headLinks = doc.head.querySelectorAll('link');
        const headScripts = doc.head.querySelectorAll('script');
        
        // 将 base.html 的 body 内容替换当前页面的 body 内容
        const baseBody = doc.body;
        const baseApp = baseBody.querySelector('#app');
        
        if (baseApp) {
            // 先添加 head 中的 link 标签（CSS），跳过 Font Awesome（分类管理页面会直接使用 CDN）
            headLinks.forEach(link => {
                const href = link.getAttribute('href');
                // 跳过 Font Awesome，因为分类管理页面会直接使用 CDN
                if (href && href.includes('font-awesome')) {
                    return;
                }
                if (href && !document.querySelector(`link[href="${href}"]`)) {
                    const newLink = document.createElement('link');
                    newLink.rel = link.getAttribute('rel') || 'stylesheet';
                    newLink.href = href;
                    const integrity = link.getAttribute('integrity');
                    if (integrity) newLink.integrity = integrity;
                    const crossOrigin = link.getAttribute('crossorigin');
                    if (crossOrigin) newLink.crossOrigin = crossOrigin;
                    const referrerPolicy = link.getAttribute('referrerpolicy');
                    if (referrerPolicy) newLink.referrerPolicy = referrerPolicy;
                    document.head.appendChild(newLink);
                }
            });
            
            // 保存当前的 loading div（如果存在）
            const existingLoading = document.getElementById('loading');
            const loadingParent = existingLoading ? existingLoading.parentNode : null;
            const loadingNextSibling = existingLoading ? existingLoading.nextSibling : null;
            
            // 替换整个 body 内容
            document.body.innerHTML = baseBody.innerHTML;
            console.log('body 内容已替换');
            
            // 如果有保存的 loading div，将其重新添加到 body 最前面（覆盖 base.html 的内容）
            if (existingLoading && loadingParent) {
                document.body.insertBefore(existingLoading, document.body.firstChild);
            }
            
            // 加载 head 中的 script 标签（按顺序）
            const loadScripts = async () => {
                for (const script of headScripts) {
                    const src = script.getAttribute('src');
                    if (src) {
                        // 外部脚本
                        if (!document.querySelector(`script[src="${src}"]`)) {
                            await new Promise((resolve, reject) => {
                                const newScript = document.createElement('script');
                                newScript.src = src;
                                newScript.onload = resolve;
                                newScript.onerror = () => {
                                    console.warn(`脚本加载失败: ${src}`);
                                    resolve(); // 即使失败也继续
                                };
                                document.head.appendChild(newScript);
                            });
                        }
                    } else if (script.textContent.trim()) {
                        // 内联脚本（跳过，因为通常不需要执行）
                        console.log('跳过内联脚本');
                    }
                }
            };
            
            // 等待所有脚本加载完成
            await loadScripts();
            console.log('所有脚本已加载');
            
            // 确保 jQuery 已加载（等待最多 5 秒）
            let jqueryReady = false;
            for (let i = 0; i < 50; i++) {
                if (typeof window.$ !== 'undefined' || typeof window.jQuery !== 'undefined') {
                    jqueryReady = true;
                    console.log('jQuery 已加载');
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            if (!jqueryReady) {
                console.warn('jQuery 加载超时，但继续执行');
            }
            
            // 设置登出按钮
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async () => {
                    try {
                        await fetch(`${API_BASE}/logout`, {
                            method: 'POST',
                            credentials: 'include'
                        });
                    } catch (error) {
                        console.error('登出失敗:', error);
                    }
                    window.location.href = '/backend/login';
                });
            }
            
            // 初始化导航菜单（现在 jQuery 已经加载）
            initNavigation();
            
            // 初始化页面（延迟一下确保 DOM 已更新）
            setTimeout(() => {
                console.log('开始初始化页面内容');
                if (typeof initPageFunction === 'function') {
                    try {
                        initPageFunction();
                    } catch (error) {
                        console.error('页面初始化函数执行失败:', error);
                    }
                }
                
                // 页面内容初始化完成后再隐藏加载提示（添加淡出动画）
                setTimeout(() => {
                    const loadingDiv = document.getElementById('loading');
                    if (loadingDiv) {
                        loadingDiv.classList.add('hidden');
                        setTimeout(() => {
                            loadingDiv.style.display = 'none';
                        }, 300);
                    }
                }, 100);
            }, 200);
        } else {
            throw new Error('base.html 中找不到 #app 元素');
        }
    } catch (error) {
        console.error('載入 base.html 失敗:', error);
        
        // 隐藏加载提示
        const loadingDiv = document.getElementById('loading');
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
        
        // 显示错误信息给用户
        document.body.innerHTML = `
            <div style="padding: 20px; font-family: Arial, sans-serif;">
                <h1>加载错误</h1>
                <p>无法加载页面内容: ${error.message}</p>
                <p>请检查：</p>
                <ul>
                    <li>是否已登录？<a href="/backend/login">点击这里登录</a></li>
                    <li>服务器是否正常运行？</li>
                    <li>浏览器控制台是否有更多错误信息？</li>
                </ul>
            </div>
        `;
    }
}

/**
 * 初始化导航菜单（展开/折叠和高亮）
 */
function initNavigation() {
    const currentPath = window.location.pathname;
    
    // 设置可折叠菜单
    $('.nav-group-header').on('click', function() {
        const group = $(this).data('group');
        const items = $(`#${group}-items`);
        const groupDiv = $(this).closest('.nav-group');
        
        // 切换展开/折叠
        items.toggleClass('expanded');
        groupDiv.toggleClass('expanded');
    });
    
    // 高亮当前页面
    $('.admin-nav-item').each(function() {
        const itemPath = $(this).data('path') || $(this).attr('href');
        // 检查当前路径是否匹配（包括 /add 和 /edit）
        if (currentPath === itemPath || 
            currentPath.startsWith(itemPath + '/') ||
            currentPath.startsWith(itemPath + '?') ||
            (itemPath === '/backend/users' && (currentPath === '/backend/users' || currentPath.startsWith('/backend/users/'))) ||
            (itemPath === '/backend/ads' && (currentPath === '/backend/ads' || currentPath.startsWith('/backend/ads/'))) ||
            (itemPath === '/backend/products' && (currentPath === '/backend/products' || currentPath.startsWith('/backend/products/'))) ||
            (itemPath === '/backend/categories' && (currentPath === '/backend/categories' || currentPath.startsWith('/backend/categories/'))) ||
            (itemPath === '/backend/news' && (currentPath === '/backend/news' || currentPath.startsWith('/backend/news/'))) ||
            (itemPath === '/backend/about' && (currentPath === '/backend/about' || currentPath.startsWith('/backend/about/'))) ||
            (itemPath === '/backend/faq' && (currentPath === '/backend/faq' || currentPath.startsWith('/backend/faq/'))) ||
            (itemPath === '/backend/orders' && (currentPath === '/backend/orders' || currentPath.startsWith('/backend/orders/')))
        ) {
            $(this).addClass('active bg-gray-700');
            
            // 自动展开包含当前页面的菜单组
            const groupItems = $(this).closest('.nav-group-items');
            if (groupItems.length) {
                groupItems.addClass('expanded');
                groupItems.closest('.nav-group').addClass('expanded');
            }
        }
    });
    
    // 默认展开所有菜单组
    $('.nav-group-items').addClass('expanded');
    $('.nav-group').addClass('expanded');
}

/**
 * 发送 API 请求（使用 session 认证）
 */
async function apiRequest(url, options = {}) {
    const defaultOptions = {
        credentials: 'include',  // 重要：包含 cookies（session）
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (response.status === 401) {
            window.location.href = '/backend/login';
            return null;
        }
        
        return response;
    } catch (error) {
        console.error('API 請求失敗:', error);
        throw error;
    }
}

