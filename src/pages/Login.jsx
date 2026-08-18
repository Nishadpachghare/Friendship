import React, { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, User, Sparkles, KeyRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { STORY_META } from '../data/seedData.js'

export default function Login() {
  const { user, login, ready } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  if (ready && user) {
    const dest = location.state?.from?.pathname || '/'
    return <Navigate to={dest} replace />
  }

  function handleSubmit(e) {
    e?.preventDefault()
    setError('')
    const result = login(username, password)
    if (!result.ok) {
      setError(result.error)
      return
    }
    const dest = location.state?.from?.pathname || '/'
    navigate(dest)
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 py-8 relative overflow-hidden bg-[#0a0a0a]">
      {/* Ambient floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 16 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-gold/25 animate-drift"
            style={{
              width: `${2 + (i % 4)}px`,
              height: `${2 + (i % 4)}px`,
              left: `${(i * 137) % 100}%`,
              top: `${(i * 71) % 100}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${6 + (i % 5)}s`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="glass rounded-3xl w-full max-w-sm p-6 sm:p-10 shadow-goldglow relative z-10 border border-gold/25"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-gold/10 border border-gold/20 rounded-full px-3 py-1 text-[10px] tracking-[0.3em] text-gold uppercase mb-3">
            <Lock size={11} /> Private Space
          </div>
          <h1 className="font-display text-4xl sm:text-5xl gold-text-anim mb-1">{STORY_META.namesShort}</h1>
          <p className="text-parchment/60 text-xs sm:text-sm mt-1">
            Two people only. Everyone else, this door is locked.
          </p>
        </div>

        {/* Manual Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs tracking-wide text-ash mb-1.5 font-medium">
              <User size={13} className="text-gold/70" /> USERNAME
            </label>
            <input
              autoFocus
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-ink/70 border border-gold/25 focus:border-gold rounded-xl px-3.5 py-2.5 text-sm text-parchment placeholder:text-ash/40 outline-none transition-all"
              placeholder="your name"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs tracking-wide text-ash mb-1.5 font-medium">
              <KeyRound size={13} className="text-gold/70" /> PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-ink/70 border border-gold/25 focus:border-gold rounded-xl px-3.5 py-2.5 pr-10 text-sm text-parchment placeholder:text-ash/40 outline-none transition-all"
                placeholder="our secret"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ash hover:text-gold transition-colors p-1 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-3 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gold hover:bg-gold-light transition-all text-ink font-semibold tracking-wide rounded-xl py-3 shadow-goldglow hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Sparkles size={16} /> Enter our story
          </button>
        </form>
      </motion.div>
    </div>
  )
}
