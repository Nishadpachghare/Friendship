import React from 'react'
import { motion } from 'framer-motion'
import { FIGHT_STORY } from '../data/seedData.js'
import GoldDivider from '../components/GoldDivider.jsx'

const STEPS = [
  { key: 'whatHappened', label: 'What Happened' },
  { key: 'whatIThought', label: 'What I Thought' },
  { key: 'whatTheyThought', label: 'What You Thought' },
  { key: 'whatActuallyHappened', label: 'What Actually Happened' },
  { key: 'howWeFixed', label: 'How We Fixed It' },
  { key: 'whatWeLearned', label: 'What I Learned' },
]

export default function Fight() {
  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-20 text-center">
      <p className="text-ash text-sm tracking-widest mb-6">{FIGHT_STORY.intro}</p>
      <h1 className="font-display text-5xl gold-text-anim mb-10">Our First Fight</h1>
      <GoldDivider />

      <div className="space-y-10 mt-14 text-left">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="border-l-2 border-gold/30 pl-6 relative"
          >
            <span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-gold" />
            <p className="text-gold text-xs tracking-[0.3em] mb-1">{s.label.toUpperCase()}</p>
            <p className="text-parchment/85 font-display text-lg">{FIGHT_STORY[s.key]}</p>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="font-display italic text-2xl sm:text-3xl gold-text mt-20"
      >
        {FIGHT_STORY.closing} &hearts;
      </motion.p>
    </div>
  )
}
