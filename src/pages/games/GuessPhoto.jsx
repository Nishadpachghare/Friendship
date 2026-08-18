import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useData } from '../../context/DataContext.jsx'
import { resolveLocalBlobUrl } from '../../utils/cloudinary.js'

export default function GuessPhoto() {
  const { guessPhotoRounds, markGameUnlocked, saveGameScore } = useData()
  const [player, setPlayer] = useState(null)
  const [round, setRound] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const total = guessPhotoRounds.length
  const r = guessPhotoRounds[round]
  const [imageSrc, setImageSrc] = useState('')

  useEffect(() => {
    let cancelled = false
    let createdUrl = ''

    async function load() {
      if (!r) { setImageSrc(''); return; }
      if (r.imageBlob instanceof Blob) {
        createdUrl = URL.createObjectURL(r.imageBlob)
        if (!cancelled) setImageSrc(createdUrl)
      } else if (r.image && r.image.startsWith('localblob://')) {
        createdUrl = await resolveLocalBlobUrl(r.image)
        if (!cancelled) setImageSrc(createdUrl)
      } else {
        if (!cancelled) setImageSrc(r.image || '')
      }
    }

    load()
    return () => {
      cancelled = true
      if (createdUrl && createdUrl.startsWith('blob:')) {
        URL.revokeObjectURL(createdUrl)
      }
    }
  }, [r])

  function choose(opt) {
    if (answered || !r) return
    const isRight = opt === r.answer
    setAnswered(true)
    setCorrect(isRight)
    if (isRight) setScore((s) => s + 1)
  }

  function restartGame() {
    setRound(0)
    setAnswered(false)
    setCorrect(false)
    setFinished(false)
    setScore(0)
  }

  function changePlayer() {
    setPlayer(null)
    restartGame()
  }

  function next() {
    if (round + 1 < total) {
      setRound((n) => n + 1)
      setAnswered(false)
    } else {
      const finalScore = correct ? score : score // score already updated in choose
      const pct = total > 0 ? Math.round((finalScore / total) * 100) : 0
      setFinished(true)
      markGameUnlocked('guess-photo')
      saveGameScore({
        player: player || 'Anonymous',
        gameId: 'guess-photo',
        gameTitle: 'Guess The Memory',
        score: finalScore,
        total,
        percentage: pct,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      })
    }
  }

  // ─── 1. PLAYER SELECTION SCREEN ──────────────────────────────────────────────
  if (!player) {
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 border border-gold/30 shadow-goldglow"
        >
          <p className="text-xs tracking-[0.4em] text-gold uppercase mb-2">PLAYER SELECTION</p>
          <h1 className="font-display text-3xl text-parchment mb-2">Who is playing?</h1>
          <p className="text-parchment/60 text-sm mb-8">
            Select your name to start the challenge!
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

  // ─── 2. NO ROUNDS SCREEN ─────────────────────────────────────────────────────
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

  // ─── 3. FINISHED / RESULTS SCREEN ────────────────────────────────────────────
  if (finished) {
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0
    let ratingTitle = `🎉 Great job, ${player}!`
    let stars = '⭐⭐⭐⭐'
    let message = `${player}, you remember almost everything!`

    if (percentage === 100) {
      ratingTitle = `🌟 Perfect 100%, ${player}!`
      stars = '⭐⭐⭐⭐⭐'
      message = `Unstoppable recall, ${player}! You remembered every single detail!`
    } else if (percentage >= 70) {
      ratingTitle = `🎉 Super Memory, ${player}!`
      stars = '⭐⭐⭐⭐'
      message = `Impressive work, ${player}! You know your best moments.`
    } else if (percentage >= 50) {
      ratingTitle = `✨ Good Effort, ${player}!`
      stars = '⭐⭐⭐'
      message = `Not bad, ${player}! A few foggy memories, but solid effort!`
    } else {
      ratingTitle = `😅 Foggy Memories, ${player}!`
      stars = '⭐⭐'
      message = `${player}, time to look back at the Scrapbook together!`
    }

    return (
      <div className="max-w-md mx-auto px-5 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-8 border border-gold/30 shadow-goldglow"
        >
          <span className="text-4xl mb-3 block">🏆</span>
          <p className="text-xs tracking-[0.3em] text-gold uppercase mb-1">
            PLAYER: <span className="font-bold text-parchment">{player.toUpperCase()}</span>
          </p>
          <h1 className="font-display text-3xl gold-text-anim mb-2">{ratingTitle}</h1>
          <p className="text-xl mb-4">{stars}</p>

          {/* Rating Score Card */}
          <div className="bg-ink/60 border border-gold/15 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-ash">Player:</span>
              <span className="text-gold font-bold">{player}</span>
            </div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-ash">Score:</span>
              <span className="text-gold font-bold text-base">{score} / {total} correct</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ash">Accuracy:</span>
              <span className="text-parchment font-bold">{percentage}%</span>
            </div>
            <div className="w-full h-2 bg-ink2 rounded-full overflow-hidden mt-3 border border-gold/10">
              <div
                className="h-full bg-gradient-to-r from-gold to-gold-light transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <p className="text-parchment/70 text-sm mb-8 italic">"{message}"</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={restartGame}
              className="bg-gold hover:bg-gold-light text-ink font-medium rounded-full px-5 py-2.5 text-sm transition-colors cursor-pointer"
            >
              Play Again 🔄
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
    <div className="max-w-md mx-auto px-5 sm:px-8 py-16 text-center">
      <div className="flex items-center justify-between text-xs text-ash mb-6">
        <button
          onClick={changePlayer}
          title="Click to switch player"
          className="flex items-center gap-1.5 bg-gold/10 hover:bg-gold/20 border border-gold/25 text-gold px-3 py-1 rounded-full font-medium transition-colors cursor-pointer"
        >
          👤 {player} <span className="text-[10px] opacity-60">✕</span>
        </button>
        <span className="tracking-[0.3em]">ROUND {round + 1} OF {total}</span>
      </div>

      <div className="glass rounded-2xl aspect-square flex items-center justify-center overflow-hidden mb-8 relative">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Guess the memory"
            className="w-full h-full object-cover transition-all duration-500"
            style={{ filter: answered ? 'none' : 'blur(10px) brightness(0.8)' }}
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
