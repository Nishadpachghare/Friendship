import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext.jsx'
import GoldDivider from '../../components/GoldDivider.jsx'

function verdict(pct) {
  if (pct < 30) return 'Are we even friends? \uD83D\uDC80'
  if (pct < 60) return "Okay... you're getting there."
  if (pct < 80) return 'Not bad \uD83D\uDC40'
  return 'Okay bestie, you know too much. \uD83D\uDE2D\u2764\uFE0F'
}

export default function Quiz() {
  const { quizQuestions, markGameUnlocked, saveGameScore } = useData()
  const [player, setPlayer] = useState(null)
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState(null)
  const [finished, setFinished] = useState(false)

  const total = quizQuestions.length
  const q = quizQuestions[step]
  const pct = total > 0 ? Math.round((score / total) * 100) : 0

  function choose(option) {
    if (selected || !q) return
    setSelected(option)
    const correct = option === q.answer
    setTimeout(() => {
      const nextScore = correct ? score + 1 : score
      if (correct) setScore((s) => s + 1)
      if (step + 1 < total) {
        setStep((s) => s + 1)
        setSelected(null)
      } else {
        const finalPct = total > 0 ? Math.round((nextScore / total) * 100) : 0
        setFinished(true)
        markGameUnlocked('quiz')
        saveGameScore({
          player: player || 'Anonymous',
          gameId: 'quiz',
          gameTitle: 'Who Knows Who Better?',
          score: nextScore,
          total,
          percentage: finalPct,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        })
      }
    }, 700)
  }

  function restartQuiz() {
    setStep(0)
    setScore(0)
    setSelected(null)
    setFinished(false)
  }

  function changePlayer() {
    setPlayer(null)
    restartQuiz()
  }

  // ─── 1. PLAYER SELECTION ─────────────────────────────────────────────────────
  if (!player) {
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 border border-gold/30 shadow-goldglow"
        >
          <p className="text-xs tracking-[0.4em] text-gold uppercase mb-2">PLAYER SELECTION</p>
          <h1 className="font-display text-3xl text-parchment mb-2">Who is taking the quiz?</h1>
          <p className="text-parchment/60 text-sm mb-8">
            Select your name to start!
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setPlayer('Bhoomi')}
              className="glass hover:border-gold p-6 rounded-2xl flex flex-col items-center gap-3 transition-colors border border-gold/20 group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400 font-display text-3xl font-bold border border-pink-500/30 group-hover:border-gold transition-colors">
                🌸
              </div>
              <span className="font-display text-xl text-parchment group-hover:text-gold transition-colors">Bhoomi</span>
              <span className="text-[10px] tracking-widest text-gold/70 uppercase">PLAY AS BHOOMI</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setPlayer('Nishad')}
              className="glass hover:border-gold p-6 rounded-2xl flex flex-col items-center gap-3 transition-colors border border-gold/20 group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 font-display text-3xl font-bold border border-amber-500/30 group-hover:border-gold transition-colors">
                ⚡
              </div>
              <span className="font-display text-xl text-parchment group-hover:text-gold transition-colors">Nishad</span>
              <span className="text-[10px] tracking-widest text-gold/70 uppercase">PLAY AS NISHAD</span>
            </motion.button>
          </div>

          <Link
            to="/games"
            className="text-xs text-parchment/50 hover:text-gold underline underline-offset-4"
          >
            Back to games
          </Link>
        </motion.div>
      </div>
    )
  }

  // ─── 2. NO QUESTIONS ────────────────────────────────────────────────────────
  if (total === 0) {
    return (
      <div className="max-w-md mx-auto px-5 py-24 text-center">
        <p className="text-xs tracking-[0.4em] text-ash mb-4">NO QUIZ YET</p>
        <h1 className="font-display text-2xl text-parchment mb-4">
          Build your quiz first
        </h1>
        <p className="text-parchment/60 text-sm mb-8">
          The quiz is empty. Add your own questions — they will appear here
          automatically.
        </p>
        <Link
          to="/games/quiz/build"
          className="inline-block bg-gold hover:bg-gold-light text-ink font-medium rounded-full px-6 py-2.5 transition-colors"
        >
          Build your quiz
        </Link>
        <p className="mt-6">
          <Link
            to="/games"
            className="text-sm text-parchment/60 hover:text-gold underline underline-offset-4"
          >
            Back to games
          </Link>
        </p>
      </div>
    )
  }

  // ─── 3. RESULTS SCREEN ───────────────────────────────────────────────────────
  if (finished) {
    return (
      <div className="max-w-md mx-auto px-5 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-8 border border-gold/30 shadow-goldglow"
        >
          <p className="text-xs tracking-[0.4em] text-gold uppercase mb-1">
            PLAYER: <span className="font-bold text-parchment">{player.toUpperCase()}</span>
          </p>
          <h1 className="font-display text-2xl text-parchment mb-2">{player}'s Friendship Score</h1>
          <div className="font-display text-7xl gold-text-anim my-6">{pct}%</div>
          <p className="text-gold text-lg mb-8">{verdict(pct)}</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={restartQuiz}
              className="bg-gold hover:bg-gold-light text-ink font-medium rounded-full px-5 py-2.5 text-sm transition-colors cursor-pointer"
            >
              Take Quiz Again 🔄
            </button>
            <button
              onClick={changePlayer}
              className="border border-gold/40 text-gold hover:bg-gold/10 rounded-full px-5 py-2.5 text-sm transition-colors cursor-pointer"
            >
              Switch Player 👤
            </button>
          </div>
          <div className="mt-4">
            <Link
              to="/games"
              className="text-xs text-parchment/50 hover:text-gold underline underline-offset-4"
            >
              Back to games
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-5 sm:px-8 py-16">
      <div className="flex items-center justify-between text-xs text-ash mb-3">
        <button
          onClick={changePlayer}
          title="Click to switch player"
          className="flex items-center gap-1.5 bg-gold/10 hover:bg-gold/20 border border-gold/25 text-gold px-3 py-1 rounded-full font-medium transition-colors cursor-pointer"
        >
          👤 {player} <span className="text-[10px] opacity-60">✕</span>
        </button>
        <span className="tracking-[0.3em]">QUESTION {step + 1} OF {total}</span>
      </div>
      <div className="w-full h-1 bg-ink2 rounded-full overflow-hidden mb-10">
        <motion.div
          className="h-full bg-gold"
          animate={{ width: `${((step) / total) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.35 }}
        >
          <h2 className="font-display text-2xl sm:text-3xl text-parchment mb-8 text-center">{q.question}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {q.options.map((opt) => {
              const isCorrect = selected && opt === q.answer
              const isWrong = selected === opt && opt !== q.answer
              return (
                <button
                  key={opt}
                  onClick={() => choose(opt)}
                  className={`rounded-xl px-4 py-3 text-sm border transition-colors
                    ${isCorrect ? 'bg-gold/20 border-gold text-gold' : ''}
                    ${isWrong ? 'bg-red-500/10 border-red-400/50 text-red-300' : ''}
                    ${!selected ? 'border-gold/25 text-parchment/80 hover:border-gold/60' : ''}
                  `}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
