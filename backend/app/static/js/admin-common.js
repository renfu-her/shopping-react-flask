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
        const response = await fetch('/static/base.html', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`加载 base.html 失败: ${response.status} ${response.statusText}`);
        }
        
        const html = await response.text();
        console.log('base.html 加载成功');
        
        // 移除 base.html 中的 script 标签，避免重复执行
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const scripts = doc.querySelectorAll('script');
        scripts.forEach(script => script.remove());
        
        // 将 base.html 的 body 内容替换当前页面的 body 内容
        const baseBody = doc.body;
        const baseApp = baseBody.querySelector('#app');
        
        if (baseApp) {
            // 替换整个 body 内容
            document.body.innerHTML = baseBody.innerHTML;
            console.log('body 内容已替换');
            
            // 确保 jQuery 已加载
            if (!document.querySelector('script[src*="jquery"]')) {
                const jqueryScript = document.createElement('script');
                jqueryScript.src = 'https://code.jquery.com/jquery-3.7.1.min.js';
                document.head.appendChild(jqueryScript);
            }
            
            // 确保 Tailwind CSS 已加载
            if (!document.querySelector('script[src*="tailwindcss"]')) {
                const tailwindScript = document.createElement('script');
                tailwindScript.src = 'https://cdn.tailwindcss.com';
                document.head.appendChild(tailwindScript);
            }
            
            // 确保 Font Awesome CSS 已加载
            if (!document.querySelector('link[href*="font-awesome"]')) {
                const faLink = document.createElement('link');
                faLink.rel = 'stylesheet';
                faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
                faLink.integrity = 'sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==';
                faLink.crossOrigin = 'anonymous';
                faLink.referrerPolicy = 'no-referrer';
                document.head.appendChild(faLink);
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
            
            // 初始化导航菜单
            initNavigation();
            
            // 隐藏加载提示
            const loadingDiv = document.getElementById('loading');
            if (loadingDiv) {
                loadingDiv.style.display = 'none';
            }
            
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

