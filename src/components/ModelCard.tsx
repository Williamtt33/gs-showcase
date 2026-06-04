import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { ModelMeta } from '../types'
import { getThumbnail } from '../utils/fileStorage'

interface Props { model: ModelMeta; index: number }

const PARTICLES = [...Array(40)].map(() => ({
  width: `${8 + Math.random() * 45}px`,
  height: `${3 + Math.random() * 16}px`,
  left: `${5 + Math.random() * 90}%`,
  top: `${5 + Math.random() * 90}%`,
  background: `hsl(${35 + Math.random() * 30}, ${25 + Math.random() * 25}%, ${30 + Math.random() * 40}%)`,
  opacity: 0.08 + Math.random() * 0.15,
  transform: `rotate(${Math.random() * 360}deg)`,
  transitionDelay: `${Math.random() * 0.3}s`,
}))

export default function ModelCard({ model, index }: Props) {
  const [thumb, setThumb] = useState<string | null>(null)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (model.thumbnail === '[local]') {
      getThumbnail(model.id).then(setThumb)
    } else if (model.thumbnail && model.thumbnail.startsWith('/')) {
      setThumb(model.thumbnail)
    }
  }, [model.id, model.thumbnail])

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/viewer/${model.id}`} className="block group/card">
        <div className="relative rounded-2xl overflow-hidden border border-border-1 hover:border-white/[0.12] bg-surface-2/60 hover:bg-surface-2 transition-all duration-500 hover:shadow-2xl hover:shadow-accent-1/[0.04]">
          {/* Thumbnail area */}
          <div className="aspect-[4/3] relative overflow-hidden bg-surface-1">
            {/* Real thumbnail or decorative gaussian particles */}
            {thumb && !imgError ? (
              <img src={thumb} alt={model.name} onError={() => setImgError(true)}
                className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700" />
            ) : (
              <div className="absolute inset-0">
                {PARTICLES.map((p, i) => (
                  <div key={i} className="absolute rounded-full group-hover/card:scale-110 transition-transform duration-700"
                    style={p}
                  />
                ))}
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-surface-2 via-surface-2/20 to-transparent opacity-60 group-hover/card:opacity-40 transition-opacity duration-500" />

            {/* Center play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.08 }}
                className="w-16 h-16 rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.08] flex items-center justify-center group-hover/card:bg-white/[0.14] group-hover/card:border-white/[0.16] group-hover/card:shadow-[0_0_30px_rgba(255,255,255,0.06)] transition-all duration-500"
              >
                <svg className="w-6 h-6 text-white/40 group-hover/card:text-white/70 transition-colors duration-500 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5.14v14l11-7-11-7z" />
                </svg>
              </motion.div>
            </div>

            {/* Name overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h3 className="text-[16px] font-semibold text-white/90 group-hover/card:text-white transition-colors">
                {model.name}
              </h3>
              {model.description && (
                <p className="text-[13px] text-white/40 mt-1.5 line-clamp-1 group-hover/card:text-white/50 transition-colors">
                  {model.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
