import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, PenLine, CheckCircle2, WifiOff, Loader2, Database } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import GoldDivider from '../components/GoldDivider.jsx'

const GAMES = [
  { to: '/games/quiz', id: 'quiz', title: 'Who Knows Who Better?', desc: 'Your custom questions. Prove you actually pay attention.', emoji: '🧠' },
  { to: '/games/guess-photo', id: 'guess-photo', title: 'Guess The Memory', desc: 'A blurred photo. Can they guess where it was taken?', emoji: '🕵️' },
  { to: '/games/memory-machine', id: 'memory-machine', title: 'Random Memory Machine', desc: 'One button. One surprise memory.', emoji: '🎰' },
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
  const { unlockedGames, quizQuestions, guessPhotoRounds, serverOnline, gameDataLoading } = useData()

  const counts = {
    quizQuestions: quizQuestions.length,
    guessPhotoRounds: guessPhotoRounds.length,
  }

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16">
      <p className="text-xs tracking-[0.4em] text-ash mb-2">PLAY TO UNLOCK MORE</p>
      <h1 className="font-display text-5xl gold-text-anim mb-4">Our Games</h1>
      <GoldDivider />

      {/* Server status banner */}
      {!serverOnline && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
        >
          <WifiOff size={15} className="text-red-400 shrink-0" />
          <span className="text-red-300/90">
            Backend server offline — run <code className="bg-red-900/30 px-1.5 py-0.5 rounded text-xs">npm run server</code> in the project folder to load game data from MongoDB.
          </span>
        </motion.div>
      )}

      {serverOnline && gameDataLoading && (
        <div className="mt-6 flex items-center gap-2 text-sm text-gold/60">
          <Loader2 size={13} className="animate-spin" />
          <span>Loading game data from MongoDB...</span>
        </div>
      )}

      {/* Game Builders */}
      <div className="grid sm:grid-cols-2 gap-5 mt-8 mb-10">
        {BUILDERS.map((b) => {
          const count = counts[b.countKey]
          return (
            <div
              key={b.id}
              className="glass rounded-2xl p-6 border border-gold/20 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs tracking-[0.3em] text-gold">GAME BUILDER</p>
                {serverOnline && (
                  <span className="ml-auto flex items-center gap-1 text-[9px] text-emerald-400/70 tracking-widest">
                    <Database size={8} />MONGODB
                  </span>
                )}
              </div>

              <h2 className="font-display text-xl text-parchment mb-2">{b.title}</h2>
              <p className="text-parchment/60 text-sm flex-1">{b.desc}</p>

              <p className="text-ash text-xs mt-3 mb-4 flex items-center gap-1.5">
                {gameDataLoading && serverOnline ? (
                  <><Loader2 size={10} className="animate-spin" /> Loading...</>
                ) : (
                  count === 0 ? b.emptyLabel : b.readyLabel(count)
                )}
              </p>

              <Link
                to={b.buildTo}
                className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-ink font-medium rounded-full px-5 py-2.5 self-start transition-colors"
              >
                {count === 0 ? (
                  <><Plus size={16} /> Add content</>
                ) : (
                  <><PenLine size={16} /> Edit ({count})</>
                )}
              </Link>
            </div>
          )
        })}
      </div>

      {/* Progress text */}
      <p className="text-parchment/60 text-sm mb-2">
        {unlockedGames.length} of {GAMES.length} games played this session
        {unlockedGames.length < GAMES.length && ' — play all three to unlock a hidden memory.'}
      </p>

      {/* Game Cards */}
      <div className="grid sm:grid-cols-3 gap-5 mt-10">
        {GAMES.map((g, i) => {
          const completed = unlockedGames.includes(g.id)
          return (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link
                to={g.to}
                className={`glass rounded-xl p-6 flex flex-col items-start gap-3 h-full transition-colors ${
                  completed ? 'border-gold/40' : 'hover:border-gold/50'
                }`}
              >
                <span className="text-3xl">{g.emoji}</span>
                <p className="font-display text-xl text-parchment">{g.title}</p>
                <p className="text-sm text-parchment/50 flex-1">
                  {g.id === 'quiz' && counts.quizQuestions > 0
                    ? `${counts.quizQuestions} custom question${counts.quizQuestions === 1 ? '' : 's'} waiting.`
                    : g.id === 'guess-photo' && counts.guessPhotoRounds > 0
                      ? `${counts.guessPhotoRounds} custom round${counts.guessPhotoRounds === 1 ? '' : 's'} waiting.`
                      : g.desc}
                </p>

                {/* Completed badge — properly rendered */}
                {completed && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 tracking-widest">
                    <CheckCircle2 size={12} />
                    PLAYED
                  </span>
                )}
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Unlock reward */}
      {unlockedGames.length >= GAMES.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-8 text-center mt-12 shadow-goldglow"
        >
          <p className="text-gold text-sm tracking-widest mb-2">🔓 NEW MEMORY UNLOCKED</p>
          <p className="font-display italic text-xl text-parchment/90">"That day I'll never forget..."</p>
        </motion.div>
      )}

      {/* 🏆 LEADERBOARD & SCORES SECTION */}
      <div className="mt-16 pt-10 border-t border-gold/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs tracking-[0.4em] text-gold uppercase mb-1">LIVE SCOREBOARD</p>
            <h2 className="font-display text-3xl text-parchment">Player Hall of Fame</h2>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-ash bg-ink2 border border-gold/15 rounded-full px-3 py-1">
            <Database size={12} className="text-gold" /> MongoDB Saved
          </span>
        </div>

        {/* Player Comparison Cards */}
        {(() => {
          const { gameScores = [] } = useData()
          const bhoomiScores = gameScores.filter((s) => s.player === 'Bhoomi')
          const nishadScores = gameScores.filter((s) => s.player === 'Nishad')
          const bhoomiMax = bhoomiScores.length > 0 ? Math.max(...bhoomiScores.map((s) => s.percentage || 0)) : 0
          const nishadMax = nishadScores.length > 0 ? Math.max(...nishadScores.map((s) => s.percentage || 0)) : 0
          const isBhoomiCrown = bhoomiMax > nishadMax || (bhoomiMax > 0 && bhoomiMax === nishadMax && bhoomiScores.length >= nishadScores.length)
          const isNishadCrown = nishadMax > bhoomiMax

          return (
            <>
              <div className="grid sm:grid-cols-2 gap-5 mb-8">
                {/* Bhoomi Card */}
                <div className={`glass rounded-2xl p-6 relative border transition-colors ${isBhoomiCrown ? 'border-gold/50 shadow-goldglow bg-gold/5' : 'border-gold/20'}`}>
                  {isBhoomiCrown && (
                    <span className="absolute -top-3 right-4 bg-gold text-ink text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                      👑 LEADER
                    </span>
                  )}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-2xl shrink-0">
                      🌸
                    </div>
                    <div>
                      <h3 className="font-display text-2xl text-parchment">Bhoomi</h3>
                      <p className="text-xs text-gold tracking-widest uppercase">PLAYER 1</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-ink/60 border border-gold/15 rounded-xl p-3 text-center">
                    <div>
                      <p className="text-ash text-[10px] tracking-wider uppercase">Games Played</p>
                      <p className="font-display text-2xl text-parchment">{bhoomiScores.length}</p>
                    </div>
                    <div>
                      <p className="text-ash text-[10px] tracking-wider uppercase">Best Score</p>
                      <p className="font-display text-2xl text-gold">{bhoomiMax}%</p>
                    </div>
                  </div>
                </div>

                {/* Nishad Card */}
                <div className={`glass rounded-2xl p-6 relative border transition-colors ${isNishadCrown ? 'border-gold/50 shadow-goldglow bg-gold/5' : 'border-gold/20'}`}>
                  {isNishadCrown && (
                    <span className="absolute -top-3 right-4 bg-gold text-ink text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                      👑 LEADER
                    </span>
                  )}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0">
                      ⚡
                    </div>
                    <div>
                      <h3 className="font-display text-2xl text-parchment">Nishad</h3>
                      <p className="text-xs text-gold tracking-widest uppercase">PLAYER 2</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-ink/60 border border-gold/15 rounded-xl p-3 text-center">
                    <div>
                      <p className="text-ash text-[10px] tracking-wider uppercase">Games Played</p>
                      <p className="font-display text-2xl text-parchment">{nishadScores.length}</p>
                    </div>
                    <div>
                      <p className="text-ash text-[10px] tracking-wider uppercase">Best Score</p>
                      <p className="font-display text-2xl text-gold">{nishadMax}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Scores History List */}
              <div className="glass rounded-2xl p-6 border border-gold/20">
                <h3 className="font-display text-xl text-parchment mb-4">Recent Game Scores</h3>
                {gameScores.length === 0 ? (
                  <p className="text-ash text-sm italic text-center py-6">
                    No game scores saved yet. Play a game as Bhoomi or Nishad to record your score!
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {gameScores.map((s, idx) => (
                      <div
                        key={s.id || idx}
                        className="flex items-center justify-between bg-ink/50 hover:bg-ink/80 border border-gold/10 rounded-xl px-4 py-3 text-sm transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            s.player === 'Bhoomi' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {s.player === 'Bhoomi' ? '🌸' : '⚡'}
                          </span>
                          <div>
                            <p className="font-medium text-parchment">{s.player}</p>
                            <p className="text-xs text-ash">{s.gameTitle || 'Memory Game'}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-gold text-base">{s.score} / {s.total}</span>
                          <span className="text-xs text-parchment/60 ml-2">({s.percentage}%)</span>
                          {s.date && <p className="text-[10px] text-ash">{s.date}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )
        })()}
      </div>
    </div>
  )
}
