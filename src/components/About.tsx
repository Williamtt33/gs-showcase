import PointCloudBackground from './PointCloudBackground'
import ScrollRoller from './ScrollRoller'

export default function About() {
  return (
    <main className="min-h-screen bg-surface-0 relative">
      {/* ── Background (same as Gallery) ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-ink-wash opacity-40" />
        <PointCloudBackground className="opacity-40" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(232,224,213,0.1) 6px, rgba(232,224,213,0.1) 7px)
            `,
          }}
        />
      </div>

      <div className="relative z-10" style={{ paddingTop: '90px' }}>
        {/* ── Header ── */}
        <section className="pt-20 sm:pt-28 pb-16 sm:pb-20">
          <div className="max-w-6xl lg:max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="mb-10 animate-fade-up"><ScrollRoller /></div>
            <div className="text-center animate-fade-up">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-[11px] font-medium tracking-[0.05em]"
                style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(141,163,145,0.12)', color: '#8DA391' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent-2/60" />
                关于
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display tracking-tight mb-6 leading-[1.22]">
                <span className="gradient-text">关于晶格视界</span>
              </h1>
              <p className="text-text-3/70 text-base sm:text-lg font-light max-w-lg mx-auto leading-[1.8]">
                以纸墨之意，承三维之形
              </p>
            </div>
          </div>
        </section>

        {/* ── 什么是 3DGS ── */}
        <section className="pb-20 sm:pb-24">
          <div className="max-w-6xl lg:max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="max-w-3xl animate-fade-up">
              <h2
                className="text-lg sm:text-xl font-semibold mb-5 tracking-[0.06em]"
                style={{ fontFamily: "'Noto Serif SC', serif", color: '#332E2A' }}
              >
                什么是 3D Gaussian Splatting
              </h2>
              <p className="text-text-2/80 text-sm sm:text-base leading-[1.8] mb-4">
                3D Gaussian Splatting（3DGS）是 2023 年诞生的三维重建技术。它从一组普通照片中自动还原出高精度三维场景。
              </p>
              <p className="text-text-2/80 text-sm sm:text-base leading-[1.8] mb-4">
                与传统的三角网格不同，3DGS 用数以百万计的"高斯点"来描述空间——每个点带有位置、颜色和透明度信息，就像无数个微小的彩色气泡，共同构成完整的立体画面。
              </p>
              <p className="text-text-2/80 text-sm sm:text-base leading-[1.8]">
                更重要的是，3DGS 可以在网页浏览器中实时渲染——不需要安装任何软件，也不需要高性能显卡。
              </p>
            </div>
          </div>
        </section>

        {/* ── 为什么选择 3DGS ── */}
        <section className="pb-20 sm:pb-24">
          <div className="max-w-6xl lg:max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="max-w-3xl animate-fade-up">
              <h2
                className="text-lg sm:text-xl font-semibold mb-5 tracking-[0.06em]"
                style={{ fontFamily: "'Noto Serif SC', serif", color: '#332E2A' }}
              >
                为什么选择高斯泼溅
              </h2>
              <p className="text-text-2/80 text-sm sm:text-base leading-[1.8] mb-4">
                相比传统的摄影测量和激光扫描，3DGS 重建速度快、文件体积小、渲染效果逼真。它能捕捉到复杂的光影变化和半透明材质，特别适合历史街区和文化遗产的数字化记录。
              </p>
              <p className="text-text-2/80 text-sm sm:text-base leading-[1.8]">
                晶格视界致力于用这项技术，为中国各地的历史街区建立数字档案，让古老的空间在虚拟世界中获得永恒的生命。
              </p>
            </div>
          </div>
        </section>

        {/* ── 如何探索 ── */}
        <section className="pb-20 sm:pb-24">
          <div className="max-w-6xl lg:max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <h2
              className="text-lg sm:text-xl font-semibold mb-8 tracking-[0.06em] text-center animate-fade-up"
              style={{ fontFamily: "'Noto Serif SC', serif", color: '#332E2A' }}
            >
              如何探索场景
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  icon: (<><rect x="5" y="2" width="14" height="20" rx="7" /><line x1="12" y1="6" x2="12" y2="10" /></>),
                  title: '鼠标交互', desc: '拖拽旋转视角，滚轮缩放远近，右键平移视野',
                },
                {
                  icon: (<><rect x="7" y="3" width="4" height="6" rx="1" /><rect x="13" y="3" width="4" height="6" rx="1" /><rect x="7" y="11" width="4" height="6" rx="1" /><rect x="13" y="11" width="4" height="6" rx="1" /><rect x="7" y="19" width="4" height="3" rx="1" /></>),
                  title: '飞行模式', desc: 'WASD 键自由穿行，Q/E 升降，Shift 加速',
                },
                {
                  icon: (<><circle cx="12" cy="12" r="10" /><path d="M12 6v12M12 6l-4 4M12 6l4 4" /></>),
                  title: '初始视角', desc: '一键回到场景最佳观赏角度',
                },
                {
                  icon: (<><circle cx="12" cy="12" r="10" /><path d="M9.5 9a3.5 3.5 0 015.5 2.5c0 2-3.5 3-3.5 3" /><circle cx="12" cy="18" r="0.5" fill="currentColor" /></>),
                  title: '快捷键', desc: '按 H 查看完整列表，← → 切换标注',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="ink-card rounded-2xl p-6 animate-fade-up text-center"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(200,169,110,0.08)', color: '#8B7332' }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      {item.icon}
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold mb-2 tracking-[0.03em]" style={{ color: '#332E2A' }}>{item.title}</h3>
                  <p className="text-xs text-text-3/60 leading-[1.7]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 五大优势 ── */}
        <section className="pb-20 sm:pb-24">
          <div className="max-w-6xl lg:max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <h2
              className="text-lg sm:text-xl font-semibold mb-8 tracking-[0.06em] text-center animate-fade-up"
              style={{ fontFamily: "'Noto Serif SC', serif", color: '#332E2A' }}
            >
              五大优势
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { title: '零安装体验', desc: '打开浏览器即可访问，无需下载任何软件或插件，手机和电脑都支持。' },
                { title: '毫米级精度', desc: '基于 3DGS 技术，从数千张照片中重建出毫米级精度的三维场景。' },
                { title: '流畅实时渲染', desc: 'WebGL 硬件加速，数百万高斯点实时渲染，稳定 60fps 交互体验。' },
                { title: '极致文件轻量', desc: '数十 MB 即可呈现完整场景，无需海量存储空间和传输带宽。' },
                { title: '云端永久保存', desc: '场景数据存储在云端，换设备也不会丢失。随时可以重新访问。' },
                { title: '开放共享平台', desc: '任何人都可以上传自己的三维扫描作品，共同丰富历史街区数字档案库。' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="ink-card rounded-2xl p-6 animate-fade-up"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <h3 className="text-sm font-semibold mb-2 tracking-[0.03em]" style={{ color: '#332E2A' }}>{item.title}</h3>
                  <p className="text-xs text-text-3/60 leading-[1.7]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 上传你的场景 ── */}
        <section className="pb-20 sm:pb-24">
          <div className="max-w-6xl lg:max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="max-w-3xl animate-fade-up">
              <h2
                className="text-lg sm:text-xl font-semibold mb-5 tracking-[0.06em]"
                style={{ fontFamily: "'Noto Serif SC', serif", color: '#332E2A' }}
              >
                上传你的场景
              </h2>
              <div className="space-y-4">
                <p className="text-text-2/80 text-sm sm:text-base leading-[1.8]">
                  你可以上传自己的 .splat 文件到晶格视界平台。支持主流 3DGS 训练工具（如 Nerfstudio、SuperSplat）导出的标准格式。
                </p>
                <p className="text-text-2/80 text-sm sm:text-base leading-[1.8]">
                  上传后的场景可以添加标注点（标记细节和历史信息）和相机路径（创建自动漫游动画），然后分享给任何人观看。
                </p>
                <p className="text-text-2/80 text-sm sm:text-base leading-[1.8]">
                  所有上传的场景经审核后公开展示，共同丰富历史街区数字档案库。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 数字化保护 ── */}
        <section className="pb-24 sm:pb-32">
          <div className="max-w-6xl lg:max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="max-w-3xl animate-fade-up">
              <h2
                className="text-lg sm:text-xl font-semibold mb-5 tracking-[0.06em]"
                style={{ fontFamily: "'Noto Serif SC', serif", color: '#332E2A' }}
              >
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

        {/* ── 落款 ── */}
        <div className="pb-16 text-center animate-fade-in">
          <div className="max-w-4xl mx-auto px-6 mb-5">
            <ScrollRoller />
          </div>
          <div className="flex justify-center gap-4">
            <div
              className="w-8 h-8 rounded-sm border border-accent-3/40 text-accent-3/50 text-[8px] font-bold rotate-6 select-none flex items-center justify-center"
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >鉴</div>
            <span
              className="text-[10px] text-text-3/25 tracking-[0.2em] font-medium self-end"
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              历史街区数字化保护 · 乙巳年
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}
