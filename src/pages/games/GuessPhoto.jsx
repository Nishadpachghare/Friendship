import React, { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useData } from '../../context/DataContext.jsx'

function getImageSrc(round) {
  if (round.imageBlob instanceof Blob) {
    return URL.createObjectURL(round.imageBlob)
  }
  return round.image || ''
}

export default function GuessPhoto() {
  const { guessPhotoRounds, markGameUnlocked } = useData()
  const [round, setRound] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [finished, setFinished] = useState(false)

  const total = guessPhotoRounds.length
  const r = guessPhotoRounds[round]
  const imageSrc = useMemo(() => (r ? getImageSrc(r) : ''), [r])

  useEffect(() => {
    return () => {
      if (r?.imageBlob instanceof Blob && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc)
      }
    }
  }, [r, imageSrc])

  function choose(opt) {
    if (answered || !r) return
    setAnswered(true)
    setCorrect(opt === r.answer)
  }

  function next() {
    if (round + 1 < total) {
      setRound((n) => n + 1)
      setAnswered(false)
    } else {
      setFinished(true)
      markGameUnlocked('guess-photo')
    }
  }

  if (total === 0) {
    return (
      <div className="max-w-md mx-auto px-5 py-24 text-center">
        <p className="text-xs tracking-[0.4em] text-ash mb-4">NO ROUNDS YET</p>
        <h1 className="font-display text-2xl text-parchment mb-4">
          Build your rounds first
        </h1>
        <p className="text-parchment/60 text-sm mb-8">
          There are no memory photos yet. Add your own photos and answer choices
          — they will show up here automatically.
        </p>
        <Link
          to="/games/guess-photo/build"
          className="inline-block bg-gold hover:bg-gold-light text-ink font-medium rounded-full px-6 py-2.5 transition-colors"
        >
          Build rounds
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
        <p className="font-display text-3xl gold-text-anim mb-4">Round complete \uD83C\uDF89</p>
        <p className="text-parchment/60 mb-8">You remember more than you think.</p>
        <Link to="/games" className="text-sm text-parchment/60 hover:text-gold underline underline-offset-4">Back to games</Link>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-5 sm:px-8 py-16 text-center">
      <p className="text-xs tracking-[0.4em] text-ash mb-6">ROUND {round + 1} OF {total}</p>

      <div className="glass rounded-2xl aspect-square flex items-center justify-center overflow-hidden mb-8 relative">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Guess the memory"
            className="w-full h-full object-cover transition-all duration-500"
            style={{ filter: answered ? 'none' : 'blur(22px) brightness(0.6)' }}
          />
        ) : (
          <span className="text-ash text-xs tracking-widest">
            {answered ? 'PHOTO REVEALED' : 'BLURRED PHOTO'}
          </span>
        )}
      </div>

      <p className="font-display text-xl text-parchment mb-6">
        {r.prompt || 'Where was this?'}
      </p>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {r.options.map((opt) => (
          <button
            key={opt}
            onClick={() => choose(opt)}
            className={`rounded-xl px-4 py-3 text-sm border transition-colors
              ${answered && opt === r.answer ? 'bg-gold/20 border-gold text-gold' : ''}
              ${!answered ? 'border-gold/25 text-parchment/80 hover:border-gold/60' : 'border-gold/10 text-parchment/40'}
            `}
          >
            {opt}
          </button>
        ))}
      </div>

      {answered && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className={`text-sm mb-4 ${correct ? 'text-gold' : 'text-parchment/60'}`}>
            {correct ? 'Correct! \uD83C\uDF89' : `It was actually: ${r.answer}`}
          </p>
          <button onClick={next} className="bg-gold hover:bg-gold-light text-ink rounded-full px-6 py-2.5 text-sm font-medium">
            {round + 1 < total ? 'Next round' : 'Finish'}
          </button>
        </motion.div>
      )}
    </div>
  )
}
