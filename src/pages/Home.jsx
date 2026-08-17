import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Clock, Music2, Pause, Calendar, ShieldAlert, Sparkles, Camera, Gamepad2, BarChart3, ChevronRight } from 'lucide-react'
import GoldDivider from '../components/GoldDivider.jsx'
import { STORY_META } from '../data/seedData.js'
import { useAuth } from '../context/AuthContext.jsx'

const TABS = ['All', 'Story', 'Scrapbook', 'Playroom']

const SECTIONS = [
  {
    to: '/timeline',
    label: 'Timeline',
    desc: 'How it all unfolded, moment by moment.',
    category: 'Story',
    icon: Calendar,
    color: 'from-gold/15 to-transparent',
  },
  {
    to: '/fight',
    label: 'The Fight',
    desc: 'The honest truths and what we learned.',
    category: 'Story',
    icon: ShieldAlert,
    color: 'from-gold-dim/20 to-transparent',
  },
  {
    to: '/what-if',
    label: 'What If',
    desc: 'The story that almost wasn’t.',
    category: 'Story',
    icon: Sparkles,
    color: 'from-gold-light/15 to-transparent',
  },
  {
    to: '/memories',
    label: 'Memories',
    desc: 'A scrapbook of photos, not just a gallery.',
    category: 'Scrapbook',
    icon: Camera,
    color: 'from-gold-light/15 to-transparent',
  },
  {
    to: '/games',
    label: 'Games',
    desc: 'Fun quizzes to prove you actually know me.',
    category: 'Playroom',
    icon: Gamepad2,
    color: 'from-gold-dim/20 to-transparent',
  },
  {
    to: '/stats',
    label: 'Stats',
    desc: 'Our friendship measured in numbers.',
    category: 'Playroom',
    icon: BarChart3,
    color: 'from-gold-light/15 to-transparent',
  },
]

export default function Home() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('All')
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  function toggleMusic() {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying((prev) => !prev)
  }

  const filteredSections = SECTIONS.filter(
    (s) => activeTab === 'All' || s.category === activeTab
  )

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <p className="text-xs tracking-[0.4em] text-ash mb-3 uppercase">
          Welcome back, Bhommiii
        </p>
        <h1 className="font-display text-5xl sm:text-7xl leading-[1.05] gold-text-anim mb-6">
          I didn't know you'd become this important to me.
        </h1>
        <p className="font-display italic text-xl sm:text-2xl text-parchment/80 max-w-2xl leading-relaxed">
          "I didn't know that day would be the beginning of something I'd come to value so deeply. Some friendships don't need a reason to become special—they simply become a part of your life that you quietly never want to lose."
        </p>

        {/* First Meet Info Box */}
        <div className="glass rounded-xl p-5 mt-8 max-w-4xl border border-gold/15 bg-gradient-to-r from-gold/5 via-transparent to-transparent">
          <p className="text-xs font-bold text-gold tracking-widest uppercase mb-3.5">
            OUR FIRST MEETING
          </p>
          <div className="grid sm:grid-cols-3 gap-5 text-sm text-parchment/70">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-gold/10 text-gold">
                <MapPin size={18} />
              </span>
              <div>
                <p className="text-xs text-ash tracking-wide uppercase">Location</p>
                <p className="font-medium text-parchment mt-0.5">{STORY_META.firstMeetLocation}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-gold/10 text-gold">
                <Clock size={18} />
              </span>
              <div>
                <p className="text-xs text-ash tracking-wide uppercase">Time & Date</p>
                <p className="font-medium text-parchment mt-0.5">
                  {STORY_META.firstMeetTime}, {STORY_META.firstMeetDate}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMusic}
                title={isPlaying ? 'Click to pause Jhol' : 'Click to play Jhol 🎵'}
                aria-label={isPlaying ? 'Pause Jhol' : 'Play Jhol'}
                className={`p-2 rounded-lg transition-all cursor-pointer border ${isPlaying
                  ? 'bg-gold/25 border-gold/50 text-gold shadow-goldglow animate-pulse'
                  : 'bg-gold/10 border-transparent text-gold hover:bg-gold/20 hover:border-gold/30'
                  }`}
              >
                {isPlaying ? <Pause size={18} /> : <Music2 size={18} />}
              </button>
              <div>
                <p className="text-xs text-ash tracking-wide uppercase">First Song(click to play)</p>
                <p className="font-medium text-parchment mt-0.5">
                  {STORY_META.firstFavSong}
                  {isPlaying && <span className="ml-2 text-xs text-gold/70 italic">playing...</span>}
                </p>
              </div>
              {/* Hidden audio element for local MP3 playback */}
              <audio ref={audioRef} src="/jhol.mp3" preload="auto" loop />
            </div>
          </div>
        </div>
      </motion.div>

      <GoldDivider className="my-12" />

      {/* Tabs Menu */}
      <div className="flex justify-between items-center mb-8 border-b border-gold/10 pb-0.5">
        <div className="flex gap-1 sm:gap-4 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative pb-3 text-sm font-semibold tracking-wider transition-colors whitespace-nowrap px-4 ${activeTab === tab ? 'text-gold' : 'text-parchment/60 hover:text-gold/80'
                }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeHomeTab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
        <span className="hidden sm:inline text-xs text-ash tracking-widest uppercase">
          {filteredSections.length} {filteredSections.length === 1 ? 'Section' : 'Sections'}
        </span>
      </div>

      {/* Cards Grid */}
      <motion.div layout className="grid sm:grid-cols-2 gap-5">
        <AnimatePresence mode="popLayout">
          {filteredSections.map((s, i) => {
            const Icon = s.icon
            return (
              <motion.div
                key={s.to}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
              >
                <Link
                  to={s.to}
                  className="group flex items-center justify-between glass rounded-xl p-5 hover:border-gold/50 transition-all duration-300 relative overflow-hidden bg-gradient-to-br hover:shadow-goldglow h-full min-h-[100px]"
                >
                  {/* Subtle Background Gradient Glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                  <div className="flex items-start gap-4 relative z-10">
                    <span className="p-3 rounded-lg bg-ink/40 border border-gold/15 text-gold group-hover:border-gold/30 group-hover:bg-gold/10 transition-all">
                      <Icon size={22} />
                    </span>
                    <div>
                      <span className="text-[10px] font-bold text-gold tracking-widest uppercase opacity-75">
                        {s.category}
                      </span>
                      <h3 className="font-display text-2xl text-parchment group-hover:text-gold transition-colors mt-0.5">
                        {s.label}
                      </h3>
                      <p className="text-sm text-parchment/60 mt-1 max-w-[260px] sm:max-w-xs leading-normal">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-gold opacity-50 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all relative z-10 ml-2 shrink-0"
                  />
                </Link>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
