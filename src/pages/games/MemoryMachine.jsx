import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dices } from 'lucide-react'
import { useData } from '../../context/DataContext.jsx'

export default function MemoryMachine() {
  const { memories, timeline, markGameUnlocked } = useData()
  const [searching, setSearching] = useState(false)
  const [progress, setProgress] = useState(0)
  const [found, setFound] = useState(null)

  const pool = [...memories, ...timeline].filter((m) => m.caption || m.text)

  function generate() {
    if (searching || pool.length === 0) return
    setFound(null)
    setSearching(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          const pick = pool[Math.floor(Math.random() * pool.length)]
          setFound(pick)
          setSearching(false)
          markGameUnlocked('memory-machine')
          return 100
        }
        return p + Math.random() * 22
      })
    }, 140)
  }

  return (
    <div className="max-w-md mx-auto px-5 sm:px-8 py-20 text-center">
      <p className="text-xs tracking-[0.4em] text-ash mb-6">ONE BUTTON, ONE SURPRISE</p>
      <h1 className="font-display text-3xl text-parchment mb-10">Random Memory Machine</h1>

      <button
        onClick={generate}
        disabled={searching}
        className="mx-auto flex items-center gap-2 bg-gold hover:bg-gold-light disabled:opacity-60 text-ink font-medium rounded-full px-8 py-4 text-sm tracking-wide"
      >
        <Dices size={18} /> GENERATE A MEMORY
      </button>

      <AnimatePresence mode="wait">
        {searching && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-10">
            <p className="text-ash text-sm mb-3">Searching our memories...</p>
            <div className="w-full h-1.5 bg-ink2 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gold" animate={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
          </motion.div>
        )}

        {found && !searching && (
          <motion.div
            key="found"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-8 mt-10 shadow-goldglow"
          >
            <p className="text-gold text-xs tracking-widest mb-3">FOUND ONE \u2764\uFE0F</p>
            <p className="text-ash text-xs mb-2">{found.date}</p>
            <p className="font-display italic text-xl text-parchment/90">"{found.caption || found.text}"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
