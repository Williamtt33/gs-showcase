import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-surface-0 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center px-6"
      >
        <div className="text-[120px] font-display gradient-text leading-none mb-4 select-none">404</div>
        <h1 className="text-xl font-semibold text-text-2 mb-2">页面不存在</h1>
        <p className="text-text-3 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
          Page not found. The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/"
            className="px-6 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-text-2 text-sm hover:bg-white/[0.08] transition-all"
          >首页</Link>
          <Link to="/gallery"
            className="px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:shadow-lg hover:shadow-white/10 transition-all"
          >场景画廊</Link>
        </div>
      </motion.div>
    </main>
  )
}
