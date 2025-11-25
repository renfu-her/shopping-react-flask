/**
 * 图片上传工具函数
 */

/**
 * 上传图片并转换为 webp
 * @param {File} file - 要上传的图片文件
 * @returns {Promise<{url: string, filename: string}>}
 */
async function uploadImage(file) {
    if (!file) {
        throw new Error('请选择文件');
    }

    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        throw new Error('只支持 JPG、PNG 和 WEBP 格式的图片');
    }

    // 检查文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
        throw new Error('文件大小不能超过 10MB');
    }

    // 创建 FormData
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await apiRequest(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData,
            // 不要设置 Content-Type，让浏览器自动设置（包含 boundary）
            headers: {}
        });

        if (!response || !response.ok) {
            const error = await response.json();
            throw new Error(error.detail || '上传失败');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('上传失败:', error);
        throw error;
    }
}

/**
 * 创建图片上传组件 HTML
 * @param {string} inputId - 输入框 ID
 * @param {string} previewId - 预览图片 ID
 * @param {string} currentImageUrl - 当前图片 URL（用于编辑时显示）
 * @returns {string} HTML 字符串
 */
function createImageUploadHTML(inputId, previewId, currentImageUrl = '') {
    return `
        <div class="mb-4">
            <label class="block text-sm font-medium mb-2">圖片 <span class="text-red-500">*</span></label>
            <div class="space-y-4">
                <!-- 图片预览 -->
                <div id="${previewId}" class="relative border-2 border-dashed border-gray-300 rounded-lg p-4 ${currentImageUrl ? '' : 'hidden'}">
                    <img src="${currentImageUrl}" alt="预览" class="max-w-full max-h-64 mx-auto rounded-lg" id="${previewId}-img">
                    <button type="button" onclick="removeImage('${previewId}', '${inputId}')" class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <!-- 上传按钮 -->
                <div class="flex items-center gap-4">
                    <label for="${inputId}" class="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        選擇圖片
                    </label>
                    <input type="file" id="${inputId}" accept="image/jpeg,image/jpg,image/png,image/webp" class="hidden" onchange="handleImageUpload('${inputId}', '${previewId}')">
                    <span id="${inputId}-status" class="text-sm text-gray-500"></span>
                </div>
                
                <!-- 隐藏的 URL 输入框（用于提交表单） -->
                <input type="hidden" id="${inputId}-url" value="${currentImageUrl}">
            </div>
        </div>
    `;
}

/**
 * 处理图片上传
 * @param {string} inputId - 文件输入框 ID
 * @param {string} previewId - 预览容器 ID
 */
async function handleImageUpload(inputId, previewId) {
    const fileInput = document.getElementById(inputId);
    const file = fileInput.files[0];
    const statusSpan = document.getElementById(`${inputId}-status`);
    const previewDiv = document.getElementById(previewId);
    const previewImg = document.getElementById(`${previewId}-img`);
    const urlInput = document.getElementById(`${inputId}-url`);

    if (!file) {
        return;
    }

    // 显示上传中状态
    statusSpan.textContent = '上傳中...';
    statusSpan.className = 'text-sm text-blue-500';

    try {
        // 上传图片
        const result = await uploadImage(file);
        
        // 更新预览
        if (previewImg) {
            previewImg.src = result.url;
        }
        if (previewDiv) {
            previewDiv.classList.remove('hidden');
        }
        
        // 更新隐藏的 URL 输入框
        if (urlInput) {
            urlInput.value = result.url;
        }

        // 显示成功状态
        statusSpan.textContent = '上傳成功';
        statusSpan.className = 'text-sm text-green-500';
        
        // 3秒后清除状态
        setTimeout(() => {
            statusSpan.textContent = '';
        }, 3000);
    } catch (error) {
        // 显示错误状态
        statusSpan.textContent = '上傳失敗: ' + error.message;
        statusSpan.className = 'text-sm text-red-500';
        console.error('上传失败:', error);
    }
}

/**
 * 移除图片
 * @param {string} previewId - 预览容器 ID
 * @param {string} inputId - 文件输入框 ID
 */
function removeImage(previewId, inputId) {
    const previewDiv = document.getElementById(previewId);
    const fileInput = document.getElementById(inputId);
    const urlInput = document.getElementById(`${inputId}-url`);
    const statusSpan = document.getElementById(`${inputId}-status`);

    if (previewDiv) {
        previewDiv.classList.add('hidden');
    }
    if (fileInput) {
        fileInput.value = '';
    }
    if (urlInput) {
        urlInput.value = '';
    }
    if (statusSpan) {
        statusSpan.textContent = '';
    }
}

// 将函数暴露到全局
window.uploadImage = uploadImage;
window.createImageUploadHTML = createImageUploadHTML;
window.handleImageUpload = handleImageUpload;
window.removeImage = removeImage;

