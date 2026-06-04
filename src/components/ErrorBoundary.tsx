import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface-0 flex items-center justify-center">
          <div className="text-center px-6 max-w-md">
            <div className="text-6xl mb-6 opacity-40">—</div>
            <h1 className="text-2xl font-display text-text-1 mb-3">出现了一些问题</h1>
            <p className="text-text-3 text-sm mb-2 leading-relaxed">Something went wrong. Please refresh the page.</p>
            {this.state.error && (
              <p className="text-text-3/50 text-xs font-mono mb-8 break-all">{this.state.error.message}</p>
            )}
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
                className="px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:shadow-lg transition-all">
                刷新页面
              </button>
              <a href="/"
                className="px-6 py-3 rounded-xl border border-white/[0.08] text-text-2 text-sm hover:bg-white/[0.04] transition-all">
                回到首页
              </a>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
