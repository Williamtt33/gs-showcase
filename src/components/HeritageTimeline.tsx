import { motion } from 'framer-motion'
import type { TimelineEvent } from '../data/heritage'

interface Props {
  events: TimelineEvent[]
}

export default function HeritageTimeline({ events }: Props) {
  return (
    <div className="relative">
      {/* Central vertical line */}
      <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px bg-gradient-to-b from-accent-1/20 via-accent-1/15 to-transparent" />

      <div className="space-y-12 sm:space-y-16">
        {events.map((ev, i) => {
          const isLeft = i % 2 === 0

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className={`relative flex items-start gap-5 md:gap-8 ${
                isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Timeline dot */}
              <div className="absolute left-4 md:left-1/2 -translate-x-1/2 top-1 w-3 h-3 rounded-full bg-accent-1/40 border-2 border-surface-0 shadow-[0_0_12px_rgba(212,165,116,0.25)] z-10" />

              {/* Content card */}
              <div
                className={`ml-10 md:ml-0 md:w-[calc(50%-2rem)] ${
                  isLeft ? 'md:pr-8 md:text-right' : 'md:pl-8 md:text-left'
                } pl-2`}
              >
                {/* Year badge */}
                <span
                  className="inline-block text-[11px] font-mono text-accent-1/60 tracking-[0.08em] mb-2"
                  style={{ fontFamily: "'JetBrains Mono', 'Noto Sans SC', monospace" }}
                >
                  {ev.year}
                </span>

                <h3 className="text-[15px] font-semibold text-text-1 mb-2 leading-snug">
                  {ev.title}
                </h3>

                <p className="text-[13px] text-text-3/70 leading-[1.75] max-w-md">
                  {ev.desc}
                </p>
              </div>

              {/* Spacer for the other side */}
              <div className="hidden md:block md:w-[calc(50%-2rem)]" />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
