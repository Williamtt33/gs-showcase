import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext'
import { motion, AnimatePresence } from 'framer-motion'
import { getBuiltinModels } from '../utils/models'
import { getCustomModels, deleteCustomModel } from '../store/modelStore'
import ModelForm from '../components/editor/ModelForm'
import type { ModelMeta } from '../types'

/* ── Demo password (hardcoded) ── */
const ADMIN_PASSWORD = 'admin123'
const AUTH_KEY = 'gs_admin_auth'

function isAuthenticated(): boolean {
  return sessionStorage.getItem(AUTH_KEY) === '1'
}

function setAuth(value: boolean): void {
  if (value) sessionStorage.setItem(AUTH_KEY, '1')
  else sessionStorage.removeItem(AUTH_KEY)
}

/* ── Model row ── */

function ModelRow({ model, isBuiltin, onDelete }: {
  model: ModelMeta; isBuiltin: boolean; onDelete: (id: string) => void
}) {
  return (
    <div className="group flex items-center justify-between px-5 py-3.5 rounded-xl border border-border-1 bg-surface-2/40 hover:bg-surface-2/80 transition-all duration-300">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-2 h-2 rounded-full bg-accent-2/60 shrink-0 group-hover:shadow-[0_0_6px_rgba(163,181,166,0.4)] transition-shadow" />
        <span className="text-[13px] font-medium text-text-2 truncate">{model.name}</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 ml-3">
        <Link to={`/viewer/${model.id}`}
          className="px-3 py-1.5 rounded-lg text-text-3/60 hover:text-text-2 transition-all text-[12px] hover:bg-white/[0.03]"
        >查看</Link>
        {!isBuiltin && (
          <>
            <Link to={`/edit/${model.id}`}
              className="px-3 py-1.5 rounded-lg text-text-3/60 hover:text-text-2 transition-all text-[12px] hover:bg-white/[0.03]"
            >编辑</Link>
            <button onClick={() => onDelete(model.id)}
              className="px-3 py-1.5 rounded-lg text-accent-3/50 hover:text-accent-3 hover:bg-accent-3/[0.06] transition-all text-[12px] cursor-pointer"
              style={{ cursor: 'pointer' }}
            >删除</button>
          </>
        )}
      </div>
    </div>
  )
}

/* ── Login screen ── */

function LoginScreen({ onLogin }: { onLogin: (pw: string) => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!password) { setError('请输入密码'); return }
    setLoading(true)
    // Small delay for UX feedback
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        onLogin(password)
      } else {
        setError('密码错误，请重试')
        setPassword('')
        setLoading(false)
      }
    }, 400)
  }

  return (
    <div className="min-h-dyn bg-surface-0 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo area */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-1/20 via-accent-1/10 to-accent-2/20 border border-border-1 flex items-center justify-center mx-auto mb-4">
            <span className="text-lg font-bold text-accent-1/60">3D</span>
          </div>
          <h1 className="text-xl font-semibold text-text-1">管理后台</h1>
          <p className="text-[13px] text-text-3/50 mt-1">输入密码以继续</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="ink-card rounded-2xl p-6 space-y-4">
          <div>
            <label htmlFor="admin-pw" className="text-[11px] font-medium text-text-3/50 block mb-2 uppercase tracking-[0.08em]">
              密码
            </label>
            <input
              id="admin-pw"
              name="admin-pw"
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="请输入管理密码"
              autoFocus
              className="w-full bg-surface-2/80 border border-border-1 rounded-xl px-4 py-3 text-[14px] text-text-1 placeholder:text-text-3/25 focus:outline-none focus:border-accent-1/40 transition-colors"
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(e) }}
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[12px] text-accent-3/80 bg-accent-3/[0.06] border border-accent-3/10 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#e8e0d5] text-[#0a0908] text-[14px] font-semibold cursor-pointer border-none outline-none hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] transition-all duration-300 disabled:opacity-35 disabled:cursor-not-allowed"
            style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? '验证中...' : '登 录'}
          </button>
        </form>

        <p className="text-center text-[11px] text-text-3/25 mt-6">
          墨韵三维 · 管理后台
        </p>
      </motion.div>
    </div>
  )
}

/* ── Admin panel ── */

export default function Admin() {
  const { t } = useI18n()
  const [authenticated, setAuthenticated] = useState(() => isAuthenticated())
  const [builtinModels, setBuiltinModels] = useState<ModelMeta[]>([])
  const [customModels, setCustomModels] = useState<ModelMeta[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingModel, setEditingModel] = useState<ModelMeta | null>(null)
  const [loadingBuiltin, setLoadingBuiltin] = useState(true)

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

  useEffect(() => { if (authenticated) load() }, [authenticated, load])

  const handleLogin = () => {
    setAuth(true)
    setAuthenticated(true)
  }

  const handleLogout = () => {
    setAuth(false)
    setAuthenticated(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm(t.admin.deleteConfirm)) {
      deleteCustomModel(id)
      setCustomModels(getCustomModels())
    }
  }

  /* ── Not authenticated → login screen ── */
  if (!authenticated) {
    return <LoginScreen onLogin={handleLogin} />
  }

  /* ── Authenticated → admin dashboard ── */
  return (
    <main className="min-h-dyn bg-surface-0">
      <div className="max-w-3xl mx-auto px-6 pt-28 sm:pt-36 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-display tracking-tight">
              <span className="gradient-text">{t.admin.title}</span>
            </h1>
            <Link to="/" className="text-[13px] text-text-3/60 hover:text-text-2 transition-colors mt-1 inline-block">
              ← 返回首页
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setEditingModel(null); setShowForm(true) }}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#e8e0d5] text-[#0a0908] text-[14px] font-semibold cursor-pointer border-none outline-none hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] transition-all duration-300"
              style={{ cursor: 'pointer' }}
            >+ 上传场景</button>
          </div>
        </div>

        {/* Builtin models */}
        <section className="mb-8">
          <h2 className="text-caption font-semibold text-text-3/50 uppercase tracking-[0.15em] mb-3 pl-1">内置场景</h2>
          {loadingBuiltin ? (
            <div className="rounded-2xl border border-dashed border-border-1 p-10 text-center">
              <div className="w-6 h-6 border-2 border-white/[0.06] border-t-accent-1 rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="space-y-2">
              {builtinModels.map(m => <ModelRow key={m.id} model={m} isBuiltin onDelete={handleDelete} />)}
            </div>
          )}
        </section>

        {/* Custom models */}
        <section className="mb-12">
          <h2 className="text-caption font-semibold text-text-3/50 uppercase tracking-[0.15em] mb-3 pl-1">自定义场景</h2>
          {customModels.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border-1 p-10 text-center">
              <p className="text-text-3 text-[13px] mb-4">还没有自定义场景，点击上方按钮添加</p>
            </div>
          ) : (
            <div className="space-y-2">
              {customModels.map(m => <ModelRow key={m.id} model={m} isBuiltin={false} onDelete={handleDelete} />)}
            </div>
          )}
        </section>

        {/* Export + logout footer */}
        <section className="space-y-3">
          {customModels.length > 0 && (
            <div className="rounded-2xl border border-border-1 bg-surface-2/40 p-5 flex items-center justify-between">
              <p className="text-[12px] text-text-3/60">数据存储在浏览器中，建议定期导出备份</p>
              <button
                onClick={() => {
                  const data = { customModels: getCustomModels(), exportDate: new Date().toISOString() }
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob); const a = document.createElement('a')
                  a.href = url; a.download = `gs-backup-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url)
                }}
                className="px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-text-2 text-[12px] hover:bg-white/[0.06] transition-all cursor-pointer"
                style={{ cursor: 'pointer' }}
              >📥 导出备份</button>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={handleLogout}
              className="text-[12px] text-text-3/30 hover:text-accent-3/50 transition-colors cursor-pointer py-2"
              style={{ cursor: 'pointer' }}
            >退出登录</button>
          </div>
        </section>
      </div>

      {/* Model form modal */}
      <ModelForm
        isOpen={showForm}
        editingModel={editingModel}
        onSaved={load}
        onClose={() => { setShowForm(false); setEditingModel(null) }}
      />
    </main>
  )
}
