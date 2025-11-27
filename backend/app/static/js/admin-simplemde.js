/**
 * SimpleMDE Markdown 编辑器工具函数
 * 使用 SimpleMDE: https://github.com/sparksuite/simplemde-markdown-editor
 */

/**
 * 初始化 SimpleMDE 编辑器
 * @param {string} textareaId - textarea 元素的 ID
 * @param {object} options - SimpleMDE 配置选项
 * @returns {SimpleMDE} SimpleMDE 实例
 */
function initSimpleMDE(textareaId, options = {}) {
    // 确保 SimpleMDE 已加载
    if (typeof SimpleMDE === 'undefined') {
        console.error('SimpleMDE 未加载，请确保已引入 SimpleMDE CSS 和 JS');
        return null;
    }
    
    const textarea = document.getElementById(textareaId);
    if (!textarea) {
        console.error(`找不到 ID 为 "${textareaId}" 的 textarea 元素`);
        return null;
    }
    
    // 移除 required 属性，因为 SimpleMDE 会隐藏原始 textarea
    // 隐藏的 required 字段会导致浏览器验证错误
    textarea.removeAttribute('required');
    
    // 默认配置
    const defaultOptions = {
        element: textarea,
        spellChecker: false, // 禁用拼写检查（避免网络请求）
        placeholder: '開始輸入 Markdown 內容...',
        status: ['lines', 'words', 'cursor'], // 状态栏显示
        toolbar: [
            'bold', 'italic', 'strikethrough', '|',
            'heading-1', 'heading-2', 'heading-3', '|',
            'code', 'quote', 'unordered-list', 'ordered-list', '|',
            'link', 'image', 'table', 'horizontal-rule', '|',
            'preview', 'side-by-side', 'fullscreen', '|',
            'guide'
        ],
        shortcuts: {
            'toggleBold': 'Cmd-B',
            'toggleItalic': 'Cmd-I',
            'drawLink': 'Cmd-K',
            'togglePreview': 'Cmd-P',
            'toggleSideBySide': 'F9',
            'toggleFullScreen': 'F11'
        }
    };
    
    // 合并用户配置
    const config = { ...defaultOptions, ...options };
    
    // 创建 SimpleMDE 实例
    const simplemde = new SimpleMDE(config);
    
    // 初始化后再次确保移除 required 属性（SimpleMDE 可能会重新添加）
    setTimeout(() => {
        textarea.removeAttribute('required');
    }, 100);
    
    return simplemde;
}

/**
 * 获取 SimpleMDE 编辑器的内容
 * @param {SimpleMDE} simplemde - SimpleMDE 实例
 * @returns {string} 编辑器内容
 */
function getSimpleMDEValue(simplemde) {
    if (!simplemde) return '';
    return simplemde.value();
}

/**
 * 设置 SimpleMDE 编辑器的内容
 * @param {SimpleMDE} simplemde - SimpleMDE 实例
 * @param {string} value - 要设置的内容
 */
function setSimpleMDEValue(simplemde, value) {
    if (!simplemde) return;
    simplemde.value(value || '');
}

