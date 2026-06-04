import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Hero from '../components/Hero'

const features = [
  { icon: '✨', title: '沉浸式体验', desc: '自由旋转缩放，从任意角度探索三维场景的每一处细节' },
  { icon: '🎨', title: '照片级画质', desc: '高精度三维重建，保留真实场景的光影与色彩' },
  { icon: '🖱️', title: '直观交互', desc: '点击场景中的标记点，发现隐藏在场景里的故事' },
  { icon: '📱', title: '随时随地', desc: '浏览器即开即用，无需安装任何软件或插件' },
]

export default function Home() {
  return (
    <main>
      <Hero />

      {/* Features */}
      <section className="relative py-24 sm:py-32 bg-surface-1">
        <div className="absolute inset-0 bg-mesh opacity-50" />
        <div className="relative max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display tracking-tight mb-4">
              以前所未有的方式<span className="gradient-text">探索三维世界</span>
            </h2>
            <p className="text-text-3 text-base max-w-lg mx-auto font-light">在浏览器中实时漫游高精度三维场景</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group p-6 sm:p-8 rounded-2xl border border-border-1 hover:border-border-2 bg-surface-2/40 hover:bg-surface-2/80 transition-all duration-500"
              >
                <div className="w-11 h-11 rounded-xl bg-white/[0.04] flex items-center justify-center text-xl mb-5 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
                <h3 className="font-semibold text-text-1 text-[15px] mb-2">{f.title}</h3>
                <p className="text-[13px] text-text-3 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 sm:py-36 bg-surface-0 overflow-hidden">
        <div className="absolute inset-0 bg-mesh" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display tracking-tight mb-6">
              准备好<span className="gradient-text">探索</span>了吗？
            </h2>
            <p className="text-text-3 text-base mb-10 font-light">选择一个场景，开始您的三维之旅</p>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2.5 px-10 py-4 rounded-2xl bg-white text-black font-semibold text-[14px] hover:shadow-2xl hover:shadow-white/10 hover:scale-[1.03] transition-all duration-500 active:scale-[0.98]"
            >
              探索场景
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
