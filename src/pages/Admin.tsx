import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext'
import { motion, AnimatePresence } from 'framer-motion'
import { getBuiltinModels } from '../utils/models'
import { getCustomModels, deleteCustomModel } from '../store/modelStore'
import { getUploadHistory, clearUploadHistory } from '../utils/uploadHistory'
import type { UploadRecord } from '../utils/uploadHistory'
import ModelForm from '../components/editor/ModelForm'
import { useAuth, useIsAdmin } from '../lib/auth'
import { fetchCustomModels, deleteModel as deleteRemoteModel, isSupabaseConfigured } from '../lib/api'
import type { ModelMeta } from '../types'

/* ── Legacy local auth (fallback when Supabase not configured) ── */
const AUTH_KEY = 'gs_admin_auth'

function isLocalAuth(): boolean {
  return sessionStorage.getItem(AUTH_KEY) === '1'
}

function setLocalAuth(value: boolean): void {
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

/* ── Login screen — Supabase Auth with local fallback ── */

const ADMIN_CREDENTIALS = { email: '1590992057@qq.com', password: 'Admin123456!' }

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('请输入邮箱和密码'); return }
    setLoading(true)

    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      setLocalAuth(true)
      // Also attempt Supabase sign-in so cloud operations work
      try { await signIn(email, password) } catch { /* Supabase may be unavailable */ }
      onLogin()
    } else {
      setError('邮箱或密码错误，请重试')
      setPassword('')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dyn bg-surface-0 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-1/20 via-accent-1/10 to-accent-2/20 border border-border-1 flex items-center justify-center mx-auto mb-4">
            <span className="text-lg font-bold text-accent-1/60">3D</span>
          </div>
          <h1 className="text-xl font-semibold text-text-1">管理后台</h1>
          <p className="text-[13px] text-text-3/50 mt-1">
            使用管理员账号登录
          </p>
        </div>

        <form onSubmit={handleSubmit} className="ink-card rounded-2xl p-6 space-y-4">
          <div>
            <label htmlFor="admin-email" className="text-[11px] font-medium text-text-3/50 block mb-2 uppercase tracking-[0.08em]">邮箱</label>
            <input
              id="admin-email" name="admin-email" type="email" autoComplete="email"
              value={email} onChange={e => { setEmail(e.target.value); setError('') }}
              placeholder="admin@example.com" autoFocus
              className="w-full bg-surface-2/80 border border-border-1 rounded-xl px-4 py-3 text-[14px] text-text-1 placeholder:text-text-3/25 focus:outline-none focus:border-accent-1/40 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="admin-pw" className="text-[11px] font-medium text-text-3/50 block mb-2 uppercase tracking-[0.08em]">密码</label>
            <input
              id="admin-pw" name="admin-pw" type="password" autoComplete="current-password"
              value={password} onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="输入密码"
              className="w-full bg-surface-2/80 border border-border-1 rounded-xl px-4 py-3 text-[14px] text-text-1 placeholder:text-text-3/25 focus:outline-none focus:border-accent-1/40 transition-colors"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-[12px] text-accent-3/80 bg-accent-3/[0.06] border border-accent-3/10 rounded-lg px-3 py-2">
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl btn-primary text-[14px] font-semibold cursor-pointer border-none outline-none hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] transition-all duration-300 disabled:opacity-35 disabled:cursor-not-allowed"
            style={{ cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? '验证中...' : '登 录'}
          </button>
        </form>

        <p className="text-center text-[11px] text-text-3/25 mt-6">墨韵三维 · 管理后台</p>
      </motion.div>
    </div>
  )
}

/* ── Admin panel ── */

export default function Admin() {
  const { t } = useI18n()
  const isRemote = isSupabaseConfigured()
  const isAdmin = useIsAdmin()
  const { signOut } = useAuth()
  const isLocalAuthed = isLocalAuth()
  const [authenticated, setAuthenticated] = useState(() => isLocalAuthed || isAdmin)
  const [builtinModels, setBuiltinModels] = useState<ModelMeta[]>([])
  const [customModels, setCustomModels] = useState<ModelMeta[]>([])
  const [remoteModels, setRemoteModels] = useState<ModelMeta[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingModel, setEditingModel] = useState<ModelMeta | null>(null)
  const [loadingBuiltin, setLoadingBuiltin] = useState(true)
  const [uploadHistory, setUploadHistory] = useState<UploadRecord[]>([])
  const [loginKey, setLoginKey] = useState(0)

  // Sync auth state — local auth takes priority
  useEffect(() => {
    setAuthenticated(isLocalAuthed || isAdmin)
  }, [isLocalAuthed, isAdmin])

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
    setUploadHistory(getUploadHistory())
    // Also load remote models for management
    if (isRemote) {
      fetchCustomModels().then(setRemoteModels).catch(console.error)
    }
  }, [isRemote])

  useEffect(() => { if (authenticated) load() }, [authenticated, load])

  const handleLogin = () => {
    setLocalAuth(true)
    setAuthenticated(true)
  }

  const handleLogout = async () => {
    if (isAdmin) await signOut().catch(() => {})
    setLocalAuth(false)
    setAuthenticated(false)
    setLoginKey(k => k + 1)
  }

  const handleDeleteRemote = async (id: string) => {
    if (!window.confirm(t.admin.deleteConfirm)) return
    try {
      await deleteRemoteModel(id)
      setRemoteModels(prev => prev.filter(m => m.id !== id))
      // Also clean up local copy if exists
      deleteCustomModel(id)
      setCustomModels(getCustomModels())
    } catch (e) {
      console.error('Delete failed:', e)
      alert('删除失败，请重试')
    }
  }

  const handleDeleteLocal = (id: string) => {
    if (!window.confirm(t.admin.deleteConfirm)) return
    deleteCustomModel(id)
    setCustomModels(getCustomModels())
  }

  const handleClearHistory = () => {
    clearUploadHistory()
    setUploadHistory([])
  }

  const formatUpTime = (iso: string) => {
    const d = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return '刚刚'
    if (mins < 60) return `${mins} 分钟前`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} 小时前`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days} 天前`
    return d.toLocaleDateString('zh-CN')
  }

  const formatUpSize = (bytes: number) => {
    if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
    if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`
    return `${bytes} B`
  }

  /* ── CSS hidden pattern: both screens always mounted to keep ModelForm stable ── */
  return (
    <>
      {/* Login screen */}
      <div className={authenticated ? 'hidden' : ''}>
        <LoginScreen key={loginKey} onLogin={handleLogin} />
      </div>

      {/* Admin dashboard */}
      <main className={`min-h-dyn bg-surface-0 ${!authenticated ? 'hidden' : ''}`}>
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
                type="button"
                id="upload-scene-btn"
                onClick={(e) => { e.preventDefault(); setEditingModel(null); setShowForm(true) }}
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl btn-primary text-[14px] font-semibold cursor-pointer border-none outline-none hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] transition-all duration-300"
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
                {builtinModels.map(m => <ModelRow key={m.id} model={m} isBuiltin onDelete={handleDeleteLocal} />)}
              </div>
            )}
          </section>

          {/* Remote models (Supabase cloud) */}
          {isRemote && (
            <section className="mb-8">
              <h2 className="text-caption font-semibold text-text-3/50 uppercase tracking-[0.15em] mb-3 pl-1">云端场景</h2>
              {remoteModels.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border-1 p-10 text-center">
                  <p className="text-text-3 text-[13px] mb-4">云端暂无场景，上传第一个吧</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {remoteModels.map(m => <ModelRow key={m.id} model={m} isBuiltin={false} onDelete={handleDeleteRemote} />)}
                </div>
              )}
            </section>
          )}

          {/* Custom models (local only) */}
          <section className="mb-12">
            <h2 className="text-caption font-semibold text-text-3/50 uppercase tracking-[0.15em] mb-3 pl-1">
              {isRemote ? '本地场景' : '自定义场景'}
            </h2>
            {customModels.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border-1 p-10 text-center">
                <p className="text-text-3 text-[13px] mb-4">还没有自定义场景，点击上方按钮添加</p>
              </div>
            ) : (
              <div className="space-y-2">
                {customModels.map(m => <ModelRow key={m.id} model={m} isBuiltin={false} onDelete={handleDeleteLocal} />)}
              </div>
            )}
          </section>

          {/* Export + Upload + Logout footer */}
          <section className="space-y-3">
            {/* Upload scene — prominent CTA */}
            <div className="rounded-2xl border border-dashed border-accent-1/15 bg-accent-1/[0.02] p-5 text-center">
              <p className="text-[12px] text-text-3/50 mb-3">上传新的 3D 高斯泼溅场景</p>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setEditingModel(null); setShowForm(true) }}
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl btn-primary text-[14px] font-semibold cursor-pointer border-none outline-none hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] transition-all duration-300"
                style={{ cursor: 'pointer' }}
              >+ 上传场景</button>
            </div>

            {/* ── Upload history ── */}
            {uploadHistory.length > 0 && (
              <div className="rounded-2xl border border-border-1 bg-surface-2/40 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border-1">
                  <h3 className="text-[11px] font-semibold text-text-3/50 uppercase tracking-[0.12em]">上传记录</h3>
                  <button
                    onClick={() => { if (window.confirm('清除所有上传记录？')) handleClearHistory() }}
                    className="text-[10px] text-text-3/30 hover:text-accent-3/50 transition-colors cursor-pointer"
                    style={{ cursor: 'pointer' }}
                  >清除记录</button>
                </div>
                <div className="divide-y divide-border-1">
                  {uploadHistory.map((rec) => (
                    <div key={rec.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-white/[0.01] transition-colors">
                      {/* File type badge */}
                      <span className="text-[10px] font-mono text-text-3/30 w-10 shrink-0">
                        {rec.filename.split('.').pop()?.toUpperCase()}
                      </span>
                      {/* Name + filename */}
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] text-text-2 truncate">{rec.name}</p>
                        <p className="text-[10px] text-text-3/35 truncate">{rec.filename}</p>
                      </div>
                      {/* Size */}
                      <span className="text-[10px] text-text-3/30 font-mono shrink-0">{formatUpSize(rec.size)}</span>
                      {/* Time */}
                      <span className="text-[10px] text-text-3/25 shrink-0 w-16 text-right">{formatUpTime(rec.uploadedAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

        {/* Model form modal — always mounted, shown/hidden via CSS */}
        <ModelForm
          isOpen={showForm}
          editingModel={editingModel}
          onSaved={load}
          onClose={() => { setShowForm(false); setEditingModel(null) }}
        />
      </main>
    </>
  )
}
