import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function FinalPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-5">
      <div className="max-w-lg text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="font-display italic text-2xl text-parchment/80 mb-10"
        >
          So... that's us.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1 }}
          className="text-parchment/50 leading-relaxed mb-10"
        >
          From our first meeting to our stupidest conversations, from random laughs to our first fight...
          somehow, all those little moments became something really important.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 2.2 }}
          className="font-display text-3xl gold-text-anim mb-14"
        >
          Thank you for being part of my story. &hearts;
        </motion.p>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 3 }}
          onClick={() => navigate('/')}
          className="text-sm tracking-widest text-gold border border-gold/40 rounded-full px-6 py-2.5 hover:bg-gold/10 transition-colors"
        >
          REPLAY OUR STORY &#8635;
        </motion.button>
      </div>
    </div>
  )
}
