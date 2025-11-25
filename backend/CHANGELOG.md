# 更改日志 (CHANGELOG)

## [2025-11-25] - Admin 界面改进和图片上传功能

### 添加的功能

#### 1. Admin 界面品牌名称更改
- **时间**: 2025-11-25 11:42:11
- **更改**: 将所有 admin 界面中的 "快點訂" 改为 "購物車管理"
- **影响文件**:
  - `app/static/base.html`
  - `app/static/login.html`
  - `app/static/admin/users/index.html` 和 `add-edit.html`
  - `app/static/admin/ads/index.html` 和 `add-edit.html`
  - `app/static/admin/products/index.html` 和 `add-edit.html`
  - `app/static/admin/categories/index.html` 和 `add-edit.html`
  - `app/static/admin/news/index.html` 和 `add-edit.html`
  - `app/static/admin/about/index.html` 和 `add-edit.html`
  - `app/static/admin/faq/index.html` 和 `add-edit.html`
  - `app/static/admin/orders/index.html`

#### 2. Admin 导航菜单重构
- **时间**: 2025-11-25 11:42:11
- **更改**: 
  - 将导航菜单重组为两个可折叠的分组：
    - **購物車管理**: 首頁 Banner, 使用者管理, 分類管理, 產品管理, 訂單管理
    - **內容管理**: 關於我們, 新聞管理, FAQ 管理
  - 添加了展开/折叠功能
  - 当前页面自动高亮显示（bg-gray-700）
  - 自动展开包含当前页面的菜单组
- **影响文件**:
  - `app/static/base.html` - 导航菜单结构
  - `app/static/js/admin-common.js` - 添加了 `initNavigation()` 函数

#### 3. 编辑页面全屏显示
- **时间**: 2025-11-25 11:42:11
- **更改**: 所有 add-edit.html 页面的表单容器改为占满整个画面
- **影响文件**:
  - `app/static/admin/users/add-edit.html`
  - `app/static/admin/ads/add-edit.html`
  - `app/static/admin/products/add-edit.html`
  - `app/static/admin/categories/add-edit.html`
  - `app/static/admin/news/add-edit.html`
  - `app/static/admin/about/add-edit.html`
  - `app/static/admin/faq/add-edit.html`
  - `app/static/base.html` - 更新 main 标签样式

#### 4. 图片上传功能实现
- **时间**: 2025-11-25 11:42:11
- **更改**: 
  - 实现了图片上传 API，支持 jpg/png 自动转换为 webp 格式
  - 使用 UUID 生成唯一文件名
  - 添加了图片上传前端组件
- **新增文件**:
  - `app/api/admin/upload.py` - 图片上传 API 端点
  - `app/static/js/admin-upload.js` - 图片上传前端工具库
- **修改文件**:
  - `pyproject.toml` - 添加 `pillow>=10.0.0` 依赖
  - `app/api/admin/__init__.py` - 注册 upload 路由
  - `app/static/admin/products/add-edit.html` - 集成图片上传
  - `app/static/admin/ads/add-edit.html` - 集成图片上传
  - `app/static/admin/categories/add-edit.html` - 集成图片上传
  - `app/static/admin/news/add-edit.html` - 集成图片上传
  - `app/static/admin/about/add-edit.html` - 集成图片上传
- **功能特点**:
  - 支持格式: jpg, jpeg, png, webp
  - 自动转换为 webp 格式（质量 85%）
  - 文件大小限制: 10MB
  - UUID 文件名: `{uuid}.webp`
  - 上传目录: `static/uploads/`
  - 图片预览功能
  - 上传进度提示

### 技术细节

#### 图片上传 API
- **端点**: `POST /backend/admin/upload`
- **认证**: 需要管理员权限
- **请求**: `multipart/form-data` (file)
- **响应**: 
  ```json
  {
    "url": "/static/uploads/{uuid}.webp",
    "filename": "{uuid}.webp",
    "size": 12345
  }
  ```

#### 图片处理
- 使用 Pillow (PIL) 进行图片处理
- 自动处理不同颜色模式（RGB, RGBA, P, LA）
- WebP 质量设置为 85%，压缩方法为 6（最佳压缩）

#### 前端组件
- `uploadImage(file)` - 上传图片函数
- `createImageUploadHTML(inputId, previewId, currentImageUrl)` - 创建上传组件 HTML
- `handleImageUpload(inputId, previewId)` - 处理图片上传
- `removeImage(previewId, inputId)` - 移除图片

### 依赖更新

```toml
dependencies = [
    ...
    "pillow>=10.0.0",  # 新增：图片处理库
]
```

### 目录结构

```
backend/
├── app/
│   ├── api/
│   │   └── admin/
│   │       └── upload.py          # 新增：图片上传 API
│   ├── static/
│   │   ├── js/
│   │   │   └── admin-upload.js     # 新增：图片上传前端工具
│   │   ├── uploads/                # 新增：图片上传目录
│   │   └── admin/
│   │       └── ...                 # 更新的编辑页面
│   └── ...
└── CHANGELOG.md                    # 本文件
```

### 注意事项

1. **图片存储**: 上传的图片存储在 `backend/static/uploads/` 目录
2. **静态文件服务**: 确保 FastAPI 正确配置了静态文件服务
3. **文件清理**: 建议定期清理未使用的图片文件
4. **安全性**: 上传功能需要管理员权限，已通过 `get_current_admin` 依赖保护

### 后续改进建议

1. 添加图片压缩优化（根据用途调整尺寸）
2. 实现图片删除 API
3. 添加图片管理界面（查看所有上传的图片）
4. 实现图片 CDN 集成
5. 添加图片水印功能

---

**最后更新**: 2025-11-25 11:42:11

