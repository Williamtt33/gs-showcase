import { useState, useEffect, useCallback } from 'react'
import { usePage } from '../App'
import { useToast } from './Toast'
import { getAllModels, deleteModel } from '../store'
import { supabase } from '../supabase'
import type { ModelMeta } from '../types'

export default function Admin() {
  const { go } = usePage()
  const { addToast } = useToast()
  const [authed, setAuthed] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [models, setModels] = useState<ModelMeta[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    getAllModels().then(setModels).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    // Check if already signed in to Supabase
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) { setAuthed(true); load() }
      else setLoading(false)
    })
  }, [load])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')

    // Local credential fallback (works without Supabase)
    if (email === '1590992057@qq.com' && password === 'Admin123456!') {
      setAuthed(true)
      addToast('已登录（本地验证）', 'success')
      load()
      // Also try Supabase sync in background
      supabase.auth.signInWithPassword({ email, password }).catch(() => {})
      return
    }

    // Try Supabase auth
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setAuthError('邮箱或密码错误')
      } else {
        setAuthed(true)
        addToast('已登录', 'success')
        load()
      }
    } catch {
      setAuthError('登录服务不可用，请检查网络')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个模型吗？')) return
    try {
      await deleteModel(id)
      addToast('已删除', 'success')
      load()
    } catch (e: any) {
      addToast(`删除失败: ${e.message}`, 'error')
    }
  }

  if (!authed) {
    return (
      <main className="min-h-screen bg-surface-0 flex items-center justify-center" style={{ paddingTop: '90px' }}>
        <div className="w-full max-w-sm mx-auto px-6">
          <h1 className="text-2xl font-display tracking-tight text-center mb-8">管理员登录</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="邮箱"
                className="w-full px-4 py-3 rounded-xl border border-border-1 bg-white text-text-1 text-sm focus:outline-none focus:border-accent-1/50 transition-colors"
                required
              />
            </div>
            <div>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="密码"
                className="w-full px-4 py-3 rounded-xl border border-border-1 bg-white text-text-1 text-sm focus:outline-none focus:border-accent-1/50 transition-colors"
                required
              />
            </div>
            {authError && <p className="text-accent-3 text-xs">{authError}</p>}
            <button type="submit" className="btn-primary w-full text-[14px] py-3 rounded-xl" style={{ cursor: 'pointer' }}>
              登录
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-surface-0" style={{ paddingTop: '90px' }}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-display tracking-tight">模型管理</h1>
          <button
            onClick={load}
            className="px-4 py-2 rounded-lg bg-white border border-border-1 text-text-3/70 text-xs hover:text-text-1 transition-colors cursor-pointer"
            style={{ cursor: 'pointer' }}
          >
            刷新
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-white/[0.06] border-t-accent-1 rounded-full animate-spin mx-auto" />
          </div>
        ) : models.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-3/50 text-sm">暂无模型</p>
          </div>
        ) : (
          <div className="space-y-3">
            {models.map(model => (
              <div
                key={model.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-white border border-border-1"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-1">{model.name}</p>
                  <p className="text-[11px] text-text-3/50 truncate">{model.file}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] text-text-3/40 font-mono">{model.pointCount || '-'}</span>
                  <span className="text-[10px] text-text-3/40 font-mono">{model.size || '-'}</span>
                </div>
                <button
                  onClick={() => go({ route: 'viewer', modelId: model.id, edit: true })}
                  className="px-3 py-1.5 rounded-lg text-[11px] text-accent-1/70 hover:bg-accent-1/5 transition-colors bg-transparent border-none cursor-pointer"
                  style={{ cursor: 'pointer' }}
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(model.id)}
                  className="px-3 py-1.5 rounded-lg text-[11px] text-accent-3/70 hover:bg-accent-3/5 transition-colors bg-transparent border-none cursor-pointer"
                  style={{ cursor: 'pointer' }}
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
