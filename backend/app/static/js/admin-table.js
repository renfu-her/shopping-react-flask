/**
 * 通用表格管理工具
 * 提供 CRUD 操作的通用函数
 */

/**
 * 创建表格 HTML 结构
 */
function createTableHTML(config) {
    const { title, createButtonText, searchPlaceholder, filters, columns } = config;
    
    const filtersHTML = filters ? filters.map(filter => `
        <select id="${filter.id}" class="px-4 py-2 border border-gray-300 rounded-lg">
            ${filter.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
        </select>
    `).join('') : '';
    
    const columnsHTML = columns.map(col => 
        `<th class="px-4 py-3 text-left text-sm font-semibold">${col.label}</th>`
    ).join('');
    
    return `
        <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold">${title}</h2>
                <button onclick="showCreateModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    ${createButtonText || '+ 新增'}
                </button>
            </div>
            <div class="flex gap-4 mb-6">
                <input type="text" id="search" placeholder="${searchPlaceholder || '搜尋...'}" 
                    class="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
                ${filtersHTML}
                <select id="page-size" class="px-4 py-2 border border-gray-300 rounded-lg">
                    <option value="10">10 筆/頁</option>
                    <option value="20">20 筆/頁</option>
                    <option value="50">50 筆/頁</option>
                </select>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>${columnsHTML}</tr>
                    </thead>
                    <tbody id="table-body" class="bg-white divide-y divide-gray-200"></tbody>
                </table>
            </div>
            <div class="mt-4 flex justify-between items-center">
                <span id="pagination-info" class="text-sm text-gray-600"></span>
                <div id="pagination" class="flex gap-2"></div>
            </div>
        </div>
    `;
}

/**
 * 创建 Modal HTML 结构
 */
function createModalHTML(config) {
    const { fields, title } = config;
    
    const fieldsHTML = fields.map(field => {
        if (field.type === 'checkbox') {
            return `
                <div class="mb-4">
                    <label class="flex items-center">
                        <input type="checkbox" id="${field.id}" ${field.checked ? 'checked' : ''} class="mr-2">
                        <span>${field.label}</span>
                    </label>
                </div>
            `;
        }
        
        const required = field.required !== false ? 'required' : '';
        const inputType = field.type || 'text';
        const inputClass = 'w-full px-4 py-2 border rounded-lg';
        
        return `
            <div class="mb-4">
                <label class="block text-sm font-medium mb-2">${field.label}</label>
                ${field.type === 'select' ? `
                    <select id="${field.id}" ${required} class="${inputClass}">
                        ${field.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
                    </select>
                ` : `
                    <input type="${inputType}" id="${field.id}" ${required} class="${inputClass}" 
                        ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}>
                `}
            </div>
        `;
    }).join('');
    
    return `
        <div id="modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 id="modal-title" class="text-xl font-bold mb-4">${title || '新增'}</h3>
                <form id="form" onsubmit="handleSubmit(event)">
                    <input type="hidden" id="id">
                    ${fieldsHTML}
                    <div class="flex gap-2">
                        <button type="submit" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">儲存</button>
                        <button type="button" onclick="closeModal()" class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">取消</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

/**
 * 渲染分页
 */
function renderPagination(data, onPageChange) {
    const info = document.getElementById('pagination-info');
    if (info) {
        info.textContent = `顯示 ${(data.page - 1) * data.page_size + 1}-${Math.min(data.page * data.page_size, data.total)} / 共 ${data.total} 筆`;
    }
    
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    pagination.innerHTML = '';
    for (let i = 1; i <= data.total_pages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = `px-4 py-2 border rounded-lg ${i === data.page ? 'bg-blue-600 text-white' : 'border-gray-300 hover:bg-gray-50'}`;
        btn.onclick = () => onPageChange(i);
        pagination.appendChild(btn);
    }
}

/**
 * 创建表格管理器
 */
function createTableManager(config) {
    const {
        apiEndpoint,
        pageTitle,
        tableConfig,
        modalConfig,
        renderRow,
        getFilters,
        getFormData,
        onEdit
    } = config;
    
    let currentPage = 1;
    
    return {
        async loadData(page = 1) {
            const search = document.getElementById('search')?.value || '';
            const pageSize = document.getElementById('page-size')?.value || 10;
            const filters = getFilters ? getFilters() : {};
            
            const params = new URLSearchParams({ page, page_size: pageSize });
            if (search) params.append('search', search);
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    params.append(key, value);
                }
            });
            
            try {
                const res = await apiRequest(`${API_BASE}${apiEndpoint}?${params}`);
                if (!res) return;
                const data = await res.json();
                this.renderTable(data, renderRow);
                renderPagination(data, (p) => this.loadData(p));
                currentPage = page;
            } catch (error) {
                console.error('載入失敗:', error);
            }
        },
        
        renderTable(data, renderRowFn) {
            const tbody = document.getElementById('table-body');
            if (!tbody) return;
            
            const items = data.users || data.ads || data.items || [];
            tbody.innerHTML = items.map(item => renderRowFn(item)).join('');
        },
        
        async showCreateModal() {
            document.getElementById('modal-title').textContent = modalConfig.createTitle || '新增';
            document.getElementById('form').reset();
            document.getElementById('id').value = '';
            document.getElementById('modal').classList.remove('hidden');
        },
        
        async editItem(id) {
            try {
                const res = await apiRequest(`${API_BASE}${apiEndpoint}/${id}`);
                if (!res) return;
                const item = await res.json();
                
                if (onEdit) {
                    onEdit(item);
                } else {
                    // 默认编辑逻辑
                    document.getElementById('modal-title').textContent = modalConfig.editTitle || '編輯';
                    document.getElementById('id').value = item.id;
                    Object.keys(item).forEach(key => {
                        const el = document.getElementById(key);
                        if (el) {
                            if (el.type === 'checkbox') {
                                el.checked = item[key];
                            } else {
                                el.value = item[key] || '';
                            }
                        }
                    });
                }
                document.getElementById('modal').classList.remove('hidden');
            } catch (error) {
                alert('載入失敗: ' + error.message);
            }
        },
        
        async handleSubmit(e) {
            e.preventDefault();
            const id = document.getElementById('id').value;
            const data = getFormData ? getFormData() : this.getDefaultFormData();
            
            try {
                const url = id ? `${API_BASE}${apiEndpoint}/${id}` : `${API_BASE}${apiEndpoint}`;
                const method = id ? 'PUT' : 'POST';
                const res = await apiRequest(url, {
                    method,
                    body: JSON.stringify(data)
                });
                if (!res) return;
                if (res.ok) {
                    this.closeModal();
                    this.loadData(currentPage);
                } else {
                    const error = await res.json();
                    alert('操作失敗: ' + (error.detail || '未知錯誤'));
                }
            } catch (error) {
                alert('操作失敗: ' + error.message);
            }
        },
        
        getDefaultFormData() {
            const form = document.getElementById('form');
            const data = {};
            Array.from(form.elements).forEach(el => {
                if (el.name || el.id) {
                    const key = el.name || el.id;
                    if (el.type === 'checkbox') {
                        data[key] = el.checked;
                    } else if (el.value && key !== 'id') {
                        data[key] = el.type === 'number' ? parseInt(el.value) : el.value;
                    }
                }
            });
            return data;
        },
        
        async deleteItem(id, confirmMessage = '確定要刪除這個項目嗎？') {
            if (!confirm(confirmMessage)) return;
            try {
                const res = await apiRequest(`${API_BASE}${apiEndpoint}/${id}`, {
                    method: 'DELETE'
                });
                if (!res) return;
                if (res.ok) {
                    this.loadData(currentPage);
                } else {
                    const error = await res.json();
                    alert('刪除失敗: ' + (error.detail || '未知錯誤'));
                }
            } catch (error) {
                alert('刪除失敗: ' + error.message);
            }
        },
        
        closeModal() {
            document.getElementById('modal').classList.add('hidden');
        },
        
        init() {
            // 设置页面标题
            const pageTitleEl = document.getElementById('page-title');
            if (pageTitleEl) {
                pageTitleEl.textContent = pageTitle;
            }
            
            // 渲染表格和 modal
            const content = document.getElementById('page-content');
            if (content) {
                content.innerHTML = createTableHTML(tableConfig) + createModalHTML(modalConfig);
            }
            
            // 绑定事件
            document.getElementById('search')?.addEventListener('input', () => this.loadData(1));
            document.getElementById('page-size')?.addEventListener('change', () => this.loadData(1));
            
            // 绑定过滤器事件
            if (getFilters) {
                const filterElements = document.querySelectorAll('[id$="-filter"], [id$="-filter"]');
                filterElements.forEach(el => {
                    el.addEventListener('change', () => this.loadData(1));
                });
            }
            
            // 加载数据
            this.loadData(1);
        },
        
        getCurrentPage() {
            return currentPage;
        }
    };
}

