import { useRef, useEffect } from 'react'
import PointCloudBackground from './PointCloudBackground'

function ScrollRoller({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-accent-1/25 to-transparent" />
      <div className="w-8 h-[5px] rounded-full bg-accent-1/30" />
      <div className="w-8 h-[5px] rounded-full bg-accent-1/25" />
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-accent-1/25 to-transparent" />
    </div>
  )
}

function InkIcon({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-9 h-9 rounded-sm flex items-center justify-center shrink-0 ${className}`}
      style={{ border: '1px solid rgba(51,46,42,0.12)', color: '#4A4744' }}>
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </div>
  )
}

const mouseIcon = <><rect x="5" y="2" width="14" height="20" rx="7" /><line x1="12" y1="6" x2="12" y2="10" /></>
const wasdIcon = <><rect x="7" y="3" width="4" height="6" rx="1" /><rect x="13" y="3" width="4" height="6" rx="1" /><rect x="7" y="11" width="4" height="6" rx="1" /><rect x="13" y="11" width="4" height="6" rx="1" /><rect x="7" y="19" width="4" height="3" rx="1" /></>
const arrowsIcon = <><circle cx="12" cy="12" r="10" /><path d="M12 6v12M12 6l-4 4M12 6l4 4" /></>
const helpIcon = <><circle cx="12" cy="12" r="10" /><path d="M9.5 9a3.5 3.5 0 015.5 2.5c0 2-3.5 3-3.5 3" /><circle cx="12" cy="18" r="0.5" fill="currentColor" /></>
const browserIcon = <><rect x="3" y="4" width="18" height="14" rx="2" /><line x1="3" y1="8" x2="21" y2="8" /></>
const qualityIcon = <><circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="9" /></>
const realtimeIcon = <><circle cx="17" cy="12" r="3" fill="currentColor" opacity="0.3" /><polyline points="2,12 5,12 8,7 11,17 14,10 16,11 19,9" /></>
const mobileIcon = <><rect x="5" y="2" width="14" height="20" rx="3" /><line x1="9" y1="19" x2="15" y2="19" /></>
const openIcon = <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.15" /></>

function InkPointCloudPlaceholder() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * 100, y: Math.random() * 100,
      r: 0.4 + Math.random() * 1.6,
      vx: (Math.random() - 0.5) * 0.03, vy: (Math.random() - 0.5) * 0.03,
      a: 0.04 + Math.random() * 0.08,
    }))

    let animId: number
    const render = () => {
      const w = canvas.width = canvas.clientWidth * devicePixelRatio
      const h = canvas.height = canvas.clientHeight * devicePixelRatio
      ctx.clearRect(0, 0, w, h)

      for (const p of particles) {
        p.x += p.vx; p.y += p.vy
        if (p.x < -5) p.x = 105; if (p.x > 105) p.x = -5
        if (p.y < -5) p.y = 105; if (p.y > 105) p.y = -5

        const cx = p.x / 100 * w; const cy = p.y / 100 * h
        ctx.beginPath()
        ctx.arc(cx, cy, p.r * devicePixelRatio, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(51,46,42,${p.a})`
        ctx.fill()

        for (const q of particles) {
          const dx = (p.x - q.x) / 100 * w
          const dy = (p.y - q.y) / 100 * h
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 40 * devicePixelRatio && dist > 0) {
            ctx.beginPath()
            ctx.moveTo(cx, cy)
            ctx.lineTo(q.x / 100 * w, q.y / 100 * h)
            ctx.strokeStyle = `rgba(51,46,42,${0.02 * (1 - dist / (40 * devicePixelRatio))})`
            ctx.lineWidth = 0.3
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(render)
    }
    render()
    return () => cancelAnimationFrame(animId)
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ background: 'transparent' }} />
}

const exploreItems = [
  { icon: mouseIcon, title: '鼠标交互', desc: '拖拽旋转视角，滚轮缩放远近，右键平移视野。就像翻阅一本立体的历史图册。' },
  { icon: wasdIcon, title: '飞行模式', desc: 'WASD 键在场景中自由穿行，Q/E 升降，Shift 加速，鼠标控制方向。' },
  { icon: arrowsIcon, title: '初始视角', desc: '一键回到场景最佳观赏角度。迷失在点云中时，这是你的指南针。' },
  { icon: helpIcon, title: '操控帮助', desc: '随时按 H 键查看完整快捷键列表，所有操作一目了然。' },
]

const advantageItems = [
  { icon: browserIcon, title: '零安装体验', desc: '打开浏览器即可访问，无需下载任何软件或插件，手机和电脑都支持。' },
  { icon: qualityIcon, title: '毫米级精度', desc: '基于 3D Gaussian Splatting 技术，从数千张照片中重建出毫米级精度的三维场景。' },
  { icon: realtimeIcon, title: '实时渲染', desc: 'WebGL 硬件加速，百万级高斯点实时渲染，流畅的 60fps 交互体验。' },
  { icon: mobileIcon, title: '极致轻量', desc: '数十 MB 的文件即可呈现完整场景，无需海量存储和带宽。' },
  { icon: openIcon, title: '开放共享', desc: '任何人都可以上传自己的三维扫描作品，共建历史街区数字档案。' },
]

export default function About() {
  return (
    <main className="min-h-screen bg-surface-0 relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-ink-wash opacity-40" />
        <PointCloudBackground className="opacity-40" />
      </div>

      <div className="relative z-10" style={{ paddingTop: '90px' }}>
        {/* Header */}
        <section className="pt-20 sm:pt-28 pb-16 sm:pb-20">
          <div className="max-w-6xl lg:max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="mb-10 animate-fade-up"><ScrollRoller /></div>
            <div className="text-center animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-[11px] font-medium tracking-[0.05em]"
                style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(141,163,145,0.12)', color: '#8DA391' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-accent-2/60" />关于
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display tracking-tight mb-6 leading-[1.22]">
                <span className="gradient-text">关于墨韵三维</span>
              </h1>
              <p className="text-text-3/70 text-base sm:text-lg font-light max-w-lg mx-auto leading-[1.8]">
                以纸墨之意，承三维之形
              </p>
            </div>
          </div>
        </section>

        {/* What is 3DGS — dual column */}
        <section className="pb-20 sm:pb-24">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
              <div className="flex-1 lg:w-[60%] space-y-14 sm:space-y-18">
                <div className="animate-fade-up">
                  <h2 className="text-lg sm:text-xl font-semibold mb-5 tracking-[0.06em]" style={{ fontFamily: "'Noto Serif SC', serif", color: '#332E2A' }}>
                    什么是 3D Gaussian Splatting
                  </h2>
                  <p className="text-text-2/80 text-sm sm:text-base leading-[1.8] mb-4">
                    3D Gaussian Splatting（3DGS）是 2023 年诞生的一项革命性三维重建技术。它能够从一组普通照片中，自动还原出高精度的三维场景。
                  </p>
                  <p className="text-text-2/80 text-sm sm:text-base leading-[1.8]">
                    与传统网格模型不同，3DGS 用数以百万计的"高斯点"来描述空间。每个点都带有位置、颜色和透明度信息，就像无数个微小的彩色气泡，共同构成完整的立体画面。
                  </p>
                </div>

                <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
                  <h2 className="text-lg sm:text-xl font-semibold mb-5 tracking-[0.06em]" style={{ fontFamily: "'Noto Serif SC', serif", color: '#332E2A' }}>
                    为什么选择高斯泼溅
                  </h2>
                  <p className="text-text-2/80 text-sm sm:text-base leading-[1.8] mb-4">
                    相比传统的摄影测量和激光扫描，3DGS 重建速度快、文件体积小、渲染效果逼真。它能捕捉到复杂的光影变化和半透明材质，特别适合历史街区和文化遗产的数字化记录。
                  </p>
                  <p className="text-text-2/80 text-sm sm:text-base leading-[1.8] mb-4">
                    更重要的是，3DGS 可以在网页浏览器中实时渲染——不需要安装任何软件，也不需要高性能的显卡。这让三维世界真正变得触手可及。
                  </p>
                  <p className="text-text-2/80 text-sm sm:text-base leading-[1.8]">
                    墨韵三维致力于用这项技术，为中国各地的历史街区建立数字档案，让古老的空间在虚拟世界中获得永恒的生命。
                  </p>
                </div>
              </div>

              {/* Right column: ink placeholder */}
              <div className="lg:w-[40%] hidden lg:block animate-fade-up" style={{ animationDelay: '0.15s' }}>
                <div className="relative w-full sticky top-24"
                  style={{ height: 'min(520px, calc(100vh - 140px))', background: '#F2EFE9', border: '1px solid rgba(200,169,110,0.12)' }}>
                  <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 400 520" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#332E2A" strokeWidth="0.8">
                    <rect x="80" y="60" width="100" height="160" rx="2" />
                    <rect x="90" y="70" width="30" height="20" rx="1" />
                    <rect x="130" y="70" width="30" height="20" rx="1" />
                    <line x1="130" y1="60" x2="130" y2="20" />
                    <line x1="220" y1="80" x2="280" y2="80" />
                    <line x1="250" y1="80" x2="250" y2="40" />
                    <path d="M90,220 L200,160 L310,220" opacity="0.5" />
                    <circle cx="60" cy="180" r="20" opacity="0.4" />
                    <line x1="60" y1="200" x2="60" y2="260" />
                    <circle cx="330" cy="200" r="25" opacity="0.3" />
                    <line x1="330" y1="225" x2="330" y2="270" />
                    <path d="M0,300 Q60,250 120,290 Q180,240 240,280 Q300,230 400,290" strokeWidth="1.2" opacity="0.5" />
                    <path d="M0,340 Q80,290 160,330 Q240,280 400,330" opacity="0.3" />
                    <path d="M150,120 Q155,115 160,120 Q165,115 170,120" opacity="0.6" />
                    <path d="M200,100 Q203,97 206,100 Q209,97 212,100" opacity="0.4" />
                  </svg>
                  <InkPointCloudPlaceholder />
                  <div className="absolute left-4 bottom-4 text-[10px] select-none"
                    style={{ fontFamily: "'Noto Serif SC', serif", color: 'rgba(51,46,42,0.18)', writingMode: 'vertical-rl' }}>
                    三维点云示意
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How to Explore */}
        <section className="pb-20 sm:pb-24">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="animate-fade-up">
              <h2 className="text-lg sm:text-xl font-semibold mb-8 tracking-[0.06em] text-center" style={{ fontFamily: "'Noto Serif SC', serif", color: '#332E2A' }}>
                如何探索
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {exploreItems.map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <InkIcon>{item.icon}</InkIcon>
                    <div>
                      <h3 className="text-sm font-semibold mb-1.5 tracking-[0.04em]" style={{ color: '#332E2A' }}>{item.title}</h3>
                      <p className="text-xs text-text-3/70 leading-[1.8]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Upload */}
        <section className="pb-20 sm:pb-24">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="animate-fade-up">
              <h2 className="text-lg sm:text-xl font-semibold mb-5 tracking-[0.06em]" style={{ fontFamily: "'Noto Serif SC', serif", color: '#332E2A' }}>
                上传你的场景
              </h2>
              <div className="space-y-4">
                <p className="text-text-2/80 text-sm sm:text-base leading-[1.8]">
                  你可以上传自己的 .splat 文件到墨韵三维平台。支持主流 3DGS 训练工具（如 Nerfstudio、SuperSplat）导出的标准格式。
                </p>
                <p className="text-text-2/80 text-sm sm:text-base leading-[1.8]">
                  上传后的场景可以添加标注点（标记细节和历史信息）和相机路径（创建自动漫游动画），然后分享给任何人观看。
                </p>
                <p className="text-text-2/80 text-sm sm:text-base leading-[1.8]">
                  所有上传的场景都会经过审核后公开展示，共同丰富历史街区数字档案库。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Advantages */}
        <section className="pb-20 sm:pb-24">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="animate-fade-up">
              <h2 className="text-lg sm:text-xl font-semibold mb-8 tracking-[0.06em] text-center" style={{ fontFamily: "'Noto Serif SC', serif", color: '#332E2A' }}>
                五大优势
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {advantageItems.map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <InkIcon>{item.icon}</InkIcon>
                    <div>
                      <h3 className="text-sm font-semibold mb-1.5 tracking-[0.04em]" style={{ color: '#332E2A' }}>{item.title}</h3>
                      <p className="text-xs text-text-3/70 leading-[1.8]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Heritage */}
        <section className="pb-24 sm:pb-32">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="animate-fade-up">
              <h2 className="text-lg sm:text-xl font-semibold mb-5 tracking-[0.06em]" style={{ fontFamily: "'Noto Serif SC', serif", color: '#332E2A' }}>
                数字化保护的意义
              </h2>
              <div className="space-y-4">
                <p className="text-text-2/80 text-sm sm:text-base leading-[1.8]">
                  中国有数以千计的历史文化街区，每一处都承载着独特的建筑智慧和文化记忆。然而，城市化进程、自然灾害和时间侵蚀正在加速它们的消失。
                </p>
                <p className="text-text-2/80 text-sm sm:text-base leading-[1.8]">
                  数字化保护不是要替代实体保护，而是为每一处遗产建立一份永恒的数字孪生。即使建筑本身受损或消失，后人依然可以通过数字档案了解它的原貌、结构和细节。
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
