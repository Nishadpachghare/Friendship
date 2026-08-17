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
  const { quizQuestions, markGameUnlocked } = useData()
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
      if (correct) setScore((s) => s + 1)
      if (step + 1 < total) {
        setStep((s) => s + 1)
        setSelected(null)
      } else {
        setFinished(true)
        markGameUnlocked('quiz')
      }
    }, 700)
  }

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

  if (finished) {
    return (
      <div className="max-w-md mx-auto px-5 py-24 text-center">
        <p className="text-xs tracking-[0.4em] text-ash mb-4">RESULT</p>
        <h1 className="font-display text-2xl text-parchment mb-2">Your Friendship Score</h1>
        <div className="font-display text-7xl gold-text-anim my-6">{pct}%</div>
        <p className="text-gold text-lg mb-10">{verdict(pct)}</p>
        <Link to="/games" className="text-sm text-parchment/60 hover:text-gold underline underline-offset-4">
          Back to games
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-5 sm:px-8 py-16">
      <p className="text-xs tracking-[0.4em] text-ash mb-2 text-center">QUESTION {step + 1} OF {total}</p>
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
