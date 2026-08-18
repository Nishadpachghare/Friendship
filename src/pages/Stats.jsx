import React from 'react'
import { motion } from 'framer-motion'
import { STATS } from '../data/seedData.js'
import GoldDivider from '../components/GoldDivider.jsx'

const ROWS = [
  { key: 'laughs', label: 'Laughs', emoji: '😂' },
  { key: 'hangouts', label: 'Hangouts', emoji: '☕' },
  { key: 'messages', label: 'Messages', emoji: '📱' },
  { key: 'emotionalMoments', label: 'Emotional Moments', emoji: '🥺' },
  { key: 'fights', label: 'Fights', emoji: '😭' },
  { key: 'memories', label: 'Memories', emoji: '🤝' },
  { key: 'stupidDecisions', label: 'Stupid Decisions', emoji: '💀' },
  { key: 'argumentsWonByMe', label: 'Arguments Won By Me', emoji: '😂' },
]

export default function Stats() {
  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16">
      <p className="text-xs tracking-[0.4em] text-ash mb-2 text-center uppercase">IF OUR FRIENDSHIP WAS A GAME</p>
      <h1 className="font-display text-5xl gold-text-anim mb-4 text-center">Our Stats in Numbers</h1>
      <GoldDivider />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
        {ROWS.map((r, i) => (
          <motion.div
            key={r.key}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="glass rounded-xl p-4 sm:p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-gold/40 hover:shadow-goldglow transition-all duration-300 bg-gradient-to-b hover:from-gold/5 hover:to-transparent"
          >
            <span className="text-2xl sm:text-3xl mb-2 sm:mb-3 transform group-hover:scale-110 transition-transform duration-300">{r.emoji}</span>
            <span className="text-2xl sm:text-4xl font-display text-gold font-bold mb-1">{STATS[r.key]}</span>
            <span className="text-[10px] text-ash tracking-widest uppercase font-bold leading-tight">{r.label}</span>
          </motion.div>
        ))}
      </div>
      <p className="text-center text-ash text-xs mt-10 italic">(some numbers are exaggerated on purpose)</p>
    </div>
  )
}
