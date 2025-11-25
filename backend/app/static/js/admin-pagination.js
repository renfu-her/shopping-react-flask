/**
 * 通用分页渲染函数
 * 修复 NaN 显示问题
 */
function renderPagination(data) {
    // 安全地获取分页数据，提供默认值
    const page = parseInt(data.page) || 1;
    const pageSize = parseInt(data.page_size) || 10;
    const total = parseInt(data.total) || 0;
    const totalPages = parseInt(data.total_pages) || 0;
    
    // 计算显示范围
    const start = total > 0 ? (page - 1) * pageSize + 1 : 0;
    const end = total > 0 ? Math.min(page * pageSize, total) : 0;
    
    // 更新分页信息
    const paginationInfo = document.getElementById('pagination-info');
    if (paginationInfo) {
        if (total > 0) {
            paginationInfo.textContent = `顯示 ${start}-${end} / 共 ${total} 筆`;
        } else {
            paginationInfo.textContent = `共 0 筆`;
        }
    }
    
    // 渲染分页按钮
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    pagination.innerHTML = '';
    if (totalPages > 0) {
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = `px-4 py-2 border rounded-lg ${i === page ? 'bg-blue-600 text-white' : 'border-gray-300 hover:bg-gray-50'}`;
            btn.onclick = () => {
                // 调用全局的 loadData 函数，如果存在的话
                if (typeof loadData === 'function') {
                    loadData(i);
                }
            };
            pagination.appendChild(btn);
        }
    }
}

