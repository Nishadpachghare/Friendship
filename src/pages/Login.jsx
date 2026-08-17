import React, { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import { STORY_META } from '../data/seedData.js'

export default function Login() {
  const { user, login, ready } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (ready && user) {
    const dest = location.state?.from?.pathname || '/'
    return <Navigate to={dest} replace />
  }

  function handleSubmit(e) {
    e.preventDefault()
    const result = login(username, password)
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* ambient floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-gold/30 animate-drift"
            style={{
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              left: `${(i * 137) % 100}%`,
              top: `${(i * 71) % 100}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${6 + (i % 5)}s`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="glass rounded-2xl w-full max-w-sm p-8 sm:p-10 shadow-goldglow relative z-10"
      >
        <p className="text-center text-xs tracking-[0.4em] text-ash mb-2">PRIVATE</p>
        <h1 className="text-center font-display text-4xl gold-text-anim mb-1">{STORY_META.namesShort}</h1>
        <p className="text-center text-parchment/50 text-sm mb-8">Two people only. Everyone else, this door is locked.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs tracking-wide text-ash mb-1">USERNAME</label>
            <input
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-ink/60 border border-gold/25 rounded-lg px-3 py-2.5 text-parchment"
              placeholder="your name"
            />
          </div>
          <div>
            <label className="block text-xs tracking-wide text-ash mb-1">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-ink/60 border border-gold/25 rounded-lg px-3 py-2.5 text-parchment"
              placeholder="our secret"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            className="w-full bg-gold hover:bg-gold-light transition-colors text-ink font-medium tracking-wide rounded-lg py-3 mt-2"
          >
            Enter our story
          </button>
        </form>
      </motion.div>
    </div>
  )
}
