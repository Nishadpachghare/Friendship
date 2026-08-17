import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, PenLine } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import GoldDivider from '../components/GoldDivider.jsx'

const GAMES = [
  { to: '/games/quiz', id: 'quiz', title: 'Who Knows Who Better?', desc: 'Your custom questions. Prove you actually pay attention.', emoji: '\uD83E\uDDE0' },
  { to: '/games/guess-photo', id: 'guess-photo', title: 'Guess The Memory', desc: 'A blurred photo. Can they guess where it was taken?', emoji: '\uD83D\uDD75\uFE0F' },
  { to: '/games/memory-machine', id: 'memory-machine', title: 'Random Memory Machine', desc: 'One button. One surprise memory.', emoji: '\uD83C\uDFB0' },
]

const BUILDERS = [
  {
    id: 'quiz',
    title: 'Build Your Quiz',
    desc: 'Add questions here — they appear instantly in Who Knows Who Better.',
    buildTo: '/games/quiz/build',
    countKey: 'quizQuestions',
    emptyLabel: 'No questions yet',
    readyLabel: (n) => `${n} question${n === 1 ? '' : 's'} ready to play`,
  },
  {
    id: 'guess-photo',
    title: 'Build Guess The Memory',
    desc: 'Upload photos and answer choices — they appear instantly in the game.',
    buildTo: '/games/guess-photo/build',
    countKey: 'guessPhotoRounds',
    emptyLabel: 'No rounds yet',
    readyLabel: (n) => `${n} round${n === 1 ? '' : 's'} ready to play`,
  },
]

export default function GamesHub() {
  const { unlockedGames, quizQuestions, guessPhotoRounds } = useData()

  const counts = {
    quizQuestions: quizQuestions.length,
    guessPhotoRounds: guessPhotoRounds.length,
  }

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16">
      <p className="text-xs tracking-[0.4em] text-ash mb-2">PLAY TO UNLOCK MORE</p>
      <h1 className="font-display text-5xl gold-text-anim mb-4">Our Games</h1>
      <GoldDivider />

      <div className="grid sm:grid-cols-2 gap-5 mt-8 mb-10">
        {BUILDERS.map((b) => {
          const count = counts[b.countKey]
          return (
            <div
              key={b.id}
              className="glass rounded-2xl p-6 border border-gold/20 flex flex-col"
            >
              <p className="text-xs tracking-[0.3em] text-gold mb-2">GAME BUILDER</p>
              <h2 className="font-display text-xl text-parchment mb-2">{b.title}</h2>
              <p className="text-parchment/60 text-sm flex-1">{b.desc}</p>
              <p className="text-ash text-xs mt-3 mb-4">
                {count === 0 ? b.emptyLabel : b.readyLabel(count)}
              </p>
              <Link
                to={b.buildTo}
                className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-ink font-medium rounded-full px-5 py-2.5 self-start transition-colors"
              >
                {count === 0 ? (
                  <>
                    <Plus size={16} /> Add content
                  </>
                ) : (
                  <>
                    <PenLine size={16} /> Edit
                  </>
                )}
              </Link>
            </div>
          )
        })}
      </div>

      <p className="text-parchment/60 text-sm mb-2">
        {unlockedGames.length} of {GAMES.length} completed this session &mdash; finish all three to unlock a locked memory.
      </p>

      <div className="grid sm:grid-cols-3 gap-5 mt-10">
        {GAMES.map((g, i) => (
          <motion.div
            key={g.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <Link to={g.to} className="glass rounded-xl p-6 flex flex-col items-start gap-3 h-full hover:border-gold/50 transition-colors">
              <span className="text-3xl">{g.emoji}</span>
              <p className="font-display text-xl text-parchment">{g.title}</p>
              <p className="text-sm text-parchment/50 flex-1">
                {g.id === 'quiz' && counts.quizQuestions > 0
                  ? `${counts.quizQuestions} custom question${counts.quizQuestions === 1 ? '' : 's'} waiting.`
                  : g.id === 'guess-photo' && counts.guessPhotoRounds > 0
                    ? `${counts.guessPhotoRounds} custom round${counts.guessPhotoRounds === 1 ? '' : 's'} waiting.`
                    : g.desc}
              </p>
              {unlockedGames.includes(g.id) && (
                <span className="text-xs text-gold tracking-widest">\u2713 COMPLETED</span>
              )}
            </Link>
          </motion.div>
        ))}
      </div>

      {unlockedGames.length >= GAMES.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-8 text-center mt-12 shadow-goldglow"
        >
          <p className="text-gold text-sm tracking-widest mb-2">\uD83D\uDD13 NEW MEMORY UNLOCKED</p>
          <p className="font-display italic text-xl text-parchment/90">"That day I'll never forget..."</p>
        </motion.div>
      )}
    </div>
  )
}
