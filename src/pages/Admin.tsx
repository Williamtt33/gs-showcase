import { useEffect, useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext'
import { getBuiltinModels } from '../utils/models'
import { getCustomModels, deleteCustomModel } from '../store/modelStore'
import ModelForm from '../components/editor/ModelForm'
import type { ModelMeta } from '../types'

interface ModelRowProps {
  model: ModelMeta
  isBuiltin: boolean
  onEdit: (model: ModelMeta) => void
  onDelete: (id: string) => void
}

function ModelRow({ model, isBuiltin, onEdit, onDelete }: ModelRowProps) {
  return (
    <div className="group flex items-center justify-between px-5 py-3.5 rounded-xl border border-border-1 bg-surface-2/40 hover:bg-surface-2/80 transition-all duration-300">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-2 h-2 rounded-full bg-accent-2/60 shrink-0 group-hover:shadow-[0_0_6px_rgba(163,181,166,0.4)] transition-shadow" />
        <span className="text-[13px] font-medium text-text-2 truncate">{model.name}</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 ml-3">
        <Link to={`/viewer/${model.id}`}
          className="btn-ghost text-[12px] px-3 py-1.5 rounded-lg"
        >查看</Link>
        {!isBuiltin && (
          <>
            <button onClick={() => onEdit(model)}
              className="px-3 py-1.5 rounded-lg text-text-3/60 hover:text-text-2 transition-all text-[12px] hover:bg-white/[0.03]"
            >编辑</button>
            <button onClick={() => onDelete(model.id)}
              className="px-3 py-1.5 rounded-lg text-accent-3/50 hover:text-accent-3 hover:bg-accent-3/[0.06] transition-all text-[12px]"
            >删除</button>
          </>
        )}
      </div>
    </div>
  )
}

export default function Admin() {
  const { t } = useI18n()
  const [builtinModels, setBuiltinModels] = useState<ModelMeta[]>([])
  const [customModels, setCustomModels] = useState<ModelMeta[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingModel, setEditingModel] = useState<ModelMeta | null>(null)
  const [loadingBuiltin, setLoadingBuiltin] = useState(true)
  const addBtnRef = useRef<HTMLButtonElement>(null)

  // Use native DOM event for maximum reliability
  useEffect(() => {
    const el = addBtnRef.current
    if (!el) return
    const handler = (e: Event) => {
      e.preventDefault()
      setEditingModel(null)
      setShowForm(true)
    }
    el.addEventListener('click', handler)
    return () => el.removeEventListener('click', handler)
  }, [])

  const load = useCallback(async () => {
    try {
      setLoadingBuiltin(true)
      setBuiltinModels(await getBuiltinModels())
    } catch (err) {
      console.error('Failed to load builtin models:', err)
    } finally {
      setLoadingBuiltin(false)
    }
    setCustomModels(getCustomModels())
  }, [])

  useEffect(() => { load() }, [load])

  const handleEdit = (model: ModelMeta) => {
    setEditingModel(model)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm(t.admin.deleteConfirm)) {
      deleteCustomModel(id)
      setCustomModels(getCustomModels())
    }
  }

  return (
    <main className="min-h-screen bg-surface-0">
      <div className="max-w-3xl mx-auto px-6 pt-28 sm:pt-36 pb-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-display tracking-tight"><span className="gradient-text">{t.admin.title}</span></h1>
            <Link to="/gallery" className="text-[13px] text-text-3/60 hover:text-text-2 transition-colors mt-1 inline-block">← 返回画廊</Link>
          </div>
          <button
            ref={addBtnRef}
            onClick={() => { setEditingModel(null); setShowForm(true) }}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#e8e0d5] text-[#0a0908] text-[14px] font-semibold cursor-pointer border-none outline-none hover:shadow-lg hover:shadow-[#d4a574]/15 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] transition-all duration-300"
            type="button"
            style={{ cursor: 'pointer' }}
          >+ 添加场景</button>
        </div>

        <section className="mb-8">
          <h2 className="text-caption font-semibold text-text-3/50 uppercase tracking-[0.15em] mb-3 pl-1">内置场景</h2>
          {loadingBuiltin ? (
            <div className="rounded-2xl border border-dashed border-border-1 p-10 text-center">
              <div className="w-6 h-6 border-2 border-white/[0.06] border-t-accent-1 rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="space-y-2">
              {builtinModels.map(m => <ModelRow key={m.id} model={m} isBuiltin onEdit={handleEdit} onDelete={handleDelete} />)}
            </div>
          )}
        </section>

        <section className="mb-12">
          <h2 className="text-caption font-semibold text-text-3/50 uppercase tracking-[0.15em] mb-3 pl-1">自定义场景</h2>
          {customModels.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border-1 p-10 text-center">
              <p className="text-text-3 text-[13px] mb-4">还没有自定义场景，点击上方按钮添加</p>
            </div>
          ) : (
            <div className="space-y-2">
              {customModels.map(m => <ModelRow key={m.id} model={m} isBuiltin={false} onEdit={handleEdit} onDelete={handleDelete} />)}
            </div>
          )}
        </section>

        {customModels.length > 0 && (
          <section>
            <div className="rounded-2xl border border-border-1 bg-surface-2/40 p-6 flex items-center justify-between">
              <p className="text-[12px] text-text-3/60">数据存储在浏览器中，建议定期导出备份</p>
              <button
                onClick={() => {
                  const data = { customModels: getCustomModels(), exportDate: new Date().toISOString() }
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob); const a = document.createElement('a')
                  a.href = url; a.download = `gs-backup-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url)
                }}
                className="btn-ghost text-[13px]"
              >📥 导出备份</button>
            </div>
          </section>
        )}
      </div>

      <ModelForm isOpen={showForm} editingModel={editingModel} onSaved={load} onClose={() => { setShowForm(false); setEditingModel(null) }} />
    </main>
  )
}
