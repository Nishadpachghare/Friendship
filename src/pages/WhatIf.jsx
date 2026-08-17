import React from 'react'
import { motion } from 'framer-motion'

const LINES = [
  'No stupid conversations.',
  'No random plans.',
  'No inside jokes.',
  'No fights.',
  'No memories.',
]

export default function WhatIf() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5">
      <div className="max-w-lg text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-ash text-sm tracking-[0.4em] mb-6"
        >
          IMAGINE...
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-display text-4xl sm:text-5xl text-parchment mb-12"
        >
          What if we had never met?
        </motion.h1>

        <div className="space-y-3 mb-14">
          {LINES.map((line, i) => (
            <motion.p
              key={line}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 + i * 0.4 }}
              className="text-parchment/50 font-display italic text-lg"
            >
              {line}
            </motion.p>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1 + LINES.length * 0.4 + 0.4 }}
          className="font-display text-2xl sm:text-3xl gold-text-anim"
        >
          And honestly... I'm glad that's not our story. &hearts;
        </motion.p>
      </div>
    </div>
  )
}
