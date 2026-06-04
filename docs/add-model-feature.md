# 添加模型功能 — 实现逻辑文档

## 概述

"添加场景"功能允许用户在管理页面（`/admin`）上传自定义 `.splat` 3D 模型文件，录入场景信息，保存后在画廊中查看。

---

## 架构总览

```
Admin.tsx  (页面层)
   │
   ├── 按钮触发  →  setShowForm(true) + setEditingModel(null)
   │
   └── ModelForm.tsx  (表单层)
          │
          ├── 文件处理  →  FileDropZone.tsx  (拖拽上传)
          │                  handleSplatFile() → 读取 File 对象
          │                  handleCoverFile() → FileReader → base64
          │
          ├── 保存  →  handleSave()
          │              ├── storeSplatFile()  →  IndexedDB  (二进制数据)
          │              ├── storeThumbnail()  →  IndexedDB  (base64 图片)
          │              └── addCustomModel()  →  localStorage  (元数据 JSON)
          │
          └── 关闭  →  onClose() → setShowForm(false)
```

---

## 数据流详解

### 第一步：按钮触发（Admin.tsx 第 84-89 行）

```tsx
<button
  onClick={() => { setEditingModel(null); setShowForm(true) }}
  ...
>+ 添加场景</button>
```

- `setEditingModel(null)` — 标记为"新建"模式（非编辑已有模型）
- `setShowForm(true)` — 显示表单弹窗

### 第二步：表单渲染（ModelForm.tsx 第 100-110 行）

```tsx
<div className={`fixed inset-0 ... ${isOpen ? '' : 'hidden'}`} onClick={onClose}>
  <motion.div onClick={e => e.stopPropagation()}>
    {/* 表单内容 */}
  </motion.div>
</div>
```

- **始终挂载**在 DOM 中，用 CSS `hidden` 控制显隐（避免 Hook 顺序问题）
- 点击遮罩层背景关闭表单
- `e.stopPropagation()` 防止点击表单内容时触发关闭

### 第三步：填写表单（ModelForm.tsx 第 115-169 行）

表单有三个输入区域：

| 字段 | 组件 | 存储位置 |
|------|------|----------|
| 模型文件 | `FileDropZone` (拖拽或点击选择 `.splat`/`.ply` 文件) | `splatFile` state (File 对象) |
| 场景名称 | `<input>` 文本框 | `name` state (string) |
| 文件路径 | `<input>` 文本框 (备选方案) | `file` state (string) |
| 封面图片 | 隐藏 `<input type="file">` | `coverPreview` state (base64) |

**文件拖拽逻辑**（FileDropZone.tsx）：
- `onDrop` / `onInputChange` → 读取 `File` 对象
- 自动从文件名推断场景名称：`my_garden.splat` → `My Garden`

### 第四步：保存（ModelForm.tsx 第 54-98 行）

```
handleSave()
  │
  ├── 校验: name 不能为空, splatFile 或 file 至少一个
  │
  ├── 生成 modelId = editingModel?.id || generateId()
  │     generateId() = Date.now().toString(36) + 随机字符串
  │
  ├── 如果有上传文件 (splatFile):
  │     splatFile.arrayBuffer()  →  ArrayBuffer
  │     storeSplatFile(modelId, buffer, filename)  →  IndexedDB
  │     存到 'splat-files' object store, key = modelId
  │
  ├── 如果有封面图 (coverPreview):
  │     storeThumbnail(modelId, dataUrl)  →  IndexedDB
  │     存到 'thumbnails' object store, key = modelId
  │
  ├── 构建元数据:
  │     {
  │       name, nameEn,
  │       file: splatFile ? '[local]文件名' : 手动路径,
  │       thumbnail: coverPreview ? '[local]' : '',
  │       hotspots: [], cameraPaths: [], ...
  │     }
  │
  ├── 新建: addCustomModel(base, modelId)  →  localStorage
  │     读取 gs_custom_models → push 新模型 → 写回
  │
  └── 编辑: updateCustomModel(id, base)  →  localStorage
        找到对应模型 → 覆盖字段 → 写回
```

### 第五步：刷新列表（Admin.tsx 第 91 行）

```tsx
<ModelForm onSaved={load} ... />
```

保存成功后调用 `onSaved()` → `load()`：

```tsx
const load = useCallback(async () => {
  setBuiltinModels(await getBuiltinModels())  // 重新 fetch manifest.json
  setCustomModels(getCustomModels())           // 重新读 localStorage
}, [])
```

---

## 存储层级

```
┌─────────────────────────────────────────────────┐
│  模型元数据 (JSON)                                │
│  存储: localStorage['gs_custom_models']           │
│  内容: [{ id, name, file, thumbnail, ... }]      │
├─────────────────────────────────────────────────┤
│  模型文件 (二进制 ArrayBuffer)                     │
│  存储: IndexedDB → 'gs-showcase-files'           │
│        → 'splat-files' object store               │
│        key = modelId, value = { buffer, filename }│
├─────────────────────────────────────────────────┤
│  封面图片 (base64 data URL)                       │
│  存储: IndexedDB → 'gs-showcase-files'           │
│        → 'thumbnails' object store                │
│        key = modelId, value = { dataUrl }         │
└─────────────────────────────────────────────────┘
```

### 为什么分开存储？

- **localStorage** 有 5-10MB 限制，适合存元数据 JSON
- **IndexedDB** 容量大（浏览器限制宽松，通常几百 MB），适合存二进制文件和图片

### `[local]` 前缀机制

模型元数据中 `file` 字段的值：
- `[local]my_model.splat` → 文件在 IndexedDB 中，需通过 `getSplatFileUrl()` 读取
- `/models/builtin.splat` → 相对路径，从 `public/models/` 目录加载
- `https://...` → 远程 URL，直接使用

`resolveModelUrl()` 函数（`src/utils/models.ts`）根据前缀决定加载策略。

---

## 关键文件

| 文件 | 职责 |
|------|------|
| `src/pages/Admin.tsx` | 管理页面，管理模型列表和表单状态 |
| `src/components/editor/ModelForm.tsx` | 添加/编辑表单，处理文件上传和保存 |
| `src/components/FileDropZone.tsx` | 拖拽文件上传组件 |
| `src/store/modelStore.ts` | localStorage CRUD 操作 |
| `src/utils/fileStorage.ts` | IndexedDB 读写操作 |
| `src/utils/models.ts` | 模型 URL 解析，manifest 获取 |
| `src/types/index.ts` | `ModelMeta` 类型定义 |

---

## 当前已知问题

1. **按钮 cursor 不显示为 pointer** — 正在排查，可能与 Tailwind v4 CSS 处理有关
2. **编辑模式 state 重置依赖 CSS hidden** — 组件不卸载，需要手动在 `useEffect` 中重置表单字段
3. **英文名自动设置为中文名** — `nameEn: name.trim()` 导致无法输入独立的英文名
