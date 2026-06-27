import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { ModelMeta } from '../types'
import { getThumbnail } from '../utils/fileStorage'
import { LatticeFrameHover } from './decor/LatticeFrame'

interface Props { model: ModelMeta; index: number }

export default function ModelCard({ model, index }: Props) {
  const [thumb, setThumb] = useState<string | null>(null)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (model.thumbnail === '[local]') {
      getThumbnail(model.id).then(setThumb)
    } else if (model.thumbnail && model.thumbnail.startsWith('/')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resolve relative path from props
      setThumb(model.thumbnail)
    }
  }, [model.id, model.thumbnail])

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/viewer/${model.id}`} className="block group/card">
        {/* ── Thumbnail through the lattice window ── */}
        <LatticeFrameHover>
          <div className="relative aspect-[4/3] bg-surface-2 overflow-hidden">
            {thumb && !imgError ? (
              <img
                src={thumb}
                alt={model.name}
                onError={() => setImgError(true)}
                className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700"
              />
            ) : (
              /* Decorative placeholder — soft abstract shapes */
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute inset-0 bg-ink-wash opacity-60" />
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="w-20 h-12 rounded-full bg-accent-1/[0.06] blur-xl" />
                  <div className="w-28 h-4 rounded-full bg-accent-2/[0.04] blur-md" />
                  <div className="w-16 h-3 rounded-full bg-text-1/[0.03] blur-sm" />
                </div>
              </div>
            )}

            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-surface-2/60 via-transparent to-transparent opacity-50 group-hover/card:opacity-30 transition-opacity duration-500" />

            {/* Play button — centered */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.06 }}
                className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm border border-white/[0.06] flex items-center justify-center group-hover/card:bg-black/30 group-hover/card:border-white/[0.1] transition-all duration-500"
              >
                <svg className="w-4 h-4 text-white/40 group-hover/card:text-white/60 transition-colors duration-500 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5.14v14l11-7-11-7z" />
                </svg>
              </motion.div>
            </div>
          </div>
        </LatticeFrameHover>

        {/* ── Title plaque — like a carved wooden nameplate below the window ── */}
        <div className="mt-3 px-1">
          <h3 className="text-[15px] font-semibold text-text-1 group-hover/card:text-accent-1 transition-colors leading-snug tracking-[0.02em]">
            {model.name}
          </h3>
          {model.description && (
            <p className="text-[12px] text-text-3/45 mt-1 line-clamp-2 leading-[1.65] group-hover/card:text-text-3/60 transition-colors">
              {model.description}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
