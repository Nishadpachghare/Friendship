import React, { useState, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, ChevronDown, Calendar, ShieldAlert, Sparkles, Camera, Gamepad2, BarChart3 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { STORY_META } from '../data/seedData.js'

const CATEGORIES = [
  {
    label: 'Story',
    links: [
      { to: '/timeline', label: 'Timeline', desc: 'Our journey, moment by moment', icon: Calendar },
      { to: '/fight', label: 'The Fight', desc: 'Disagreements & what we learned', icon: ShieldAlert },
      { to: '/what-if', label: 'What If', desc: 'The story that almost wasn\'t', icon: Sparkles },
    ]
  },
  {
    label: 'Scrapbook',
    links: [
      { to: '/memories', label: 'Memories', desc: 'Photo gallery and moments', icon: Camera },
    ]
  },
  {
    label: 'Playroom',
    links: [
      { to: '/games', label: 'Games', desc: 'Fun quizzes and activities', icon: Gamepad2 },
      { to: '/stats', label: 'Stats', desc: 'Our friendship in numbers', icon: BarChart3 },
    ]
  }
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const timeoutRef = useRef(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function handleMouseEnter(label) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveDropdown(label)
  }

  function handleMouseLeave() {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 150)
  }

  return (
    <header className="sticky top-0 z-40 glass border-b border-gold/10">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16">
        <NavLink to="/" className="font-display text-2xl gold-text tracking-wide hover:opacity-90 transition-opacity">
          {STORY_META.namesShort}
        </NavLink>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm font-medium tracking-wide transition-colors ${
                isActive ? 'text-gold' : 'text-parchment/70 hover:text-gold'
              }`
            }
          >
            Home
          </NavLink>

          {CATEGORIES.map((cat) => {
            const isDropdownActive = activeDropdown === cat.label
            const isChildActive = cat.links.some((l) => window.location.pathname === l.to)

            return (
              <div
                key={cat.label}
                className="relative py-5"
                onMouseEnter={() => handleMouseEnter(cat.label)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className={`flex items-center gap-1 text-sm font-medium tracking-wide transition-colors ${
                    isDropdownActive || isChildActive ? 'text-gold' : 'text-parchment/70 hover:text-gold'
                  }`}
                >
                  {cat.label}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-250 ${isDropdownActive ? 'rotate-180' : ''}`}
                  />
                </button>

                {isDropdownActive && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-80 glass rounded-xl p-3 shadow-goldglow border border-gold/25 flex flex-col gap-1 anim-fade-in z-50">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2.5 h-2.5 rotate-45 glass border-t border-l border-gold/20" />
                    {cat.links.map((link) => {
                      const LinkIcon = link.icon
                      const isLinkActive = window.location.pathname === link.to
                      return (
                        <NavLink
                          key={link.to}
                          to={link.to}
                          onClick={() => setActiveDropdown(null)}
                          className={`flex items-start gap-3 p-2.5 rounded-lg transition-all ${
                            isLinkActive
                              ? 'bg-gold/15 text-gold border border-gold/30'
                              : 'hover:bg-gold/5 border border-transparent hover:border-gold/10'
                          }`}
                        >
                          <span className={`p-1.5 rounded-md ${isLinkActive ? 'bg-gold/20 text-gold' : 'bg-ink/80 text-gold/70'}`}>
                            <LinkIcon size={16} />
                          </span>
                          <div>
                            <div className={`text-sm font-medium ${isLinkActive ? 'text-gold' : 'text-parchment'}`}>
                              {link.label}
                            </div>
                            <div className="text-xs text-ash mt-0.5">{link.desc}</div>
                          </div>
                        </NavLink>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Profile & Logout */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2.5 text-sm text-parchment/80 bg-ink2 border border-gold/10 px-3 py-1.5 rounded-full">
            <span className="w-6 h-6 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold text-xs font-semibold">
              {user?.avatar}
            </span>
            {user?.displayName}
          </div>
          <button
            onClick={handleLogout}
            className="text-ash hover:text-gold transition-colors p-1.5 hover:bg-gold/5 rounded-full"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden text-gold p-1 hover:bg-gold/5 rounded"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {open && (
        <div className="lg:hidden glass border-t border-gold/15 px-5 py-6 flex flex-col gap-6 max-h-[85vh] overflow-y-auto">
          <NavLink
            to="/"
            onClick={() => setOpen(false)}
            className={({ isActive }) => `text-sm font-semibold tracking-wide ${isActive ? 'text-gold' : 'text-parchment'}`}
          >
            Home
          </NavLink>

          {CATEGORIES.map((cat) => (
            <div key={cat.label} className="flex flex-col gap-2">
              <span className="text-xs font-bold text-gold tracking-widest uppercase opacity-85">
                {cat.label}
              </span>
              <div className="pl-3 border-l border-gold/15 flex flex-col gap-3">
                {cat.links.map((link) => {
                  const LinkIcon = link.icon
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 text-sm ${isActive ? 'text-gold font-medium' : 'text-parchment/80'}`
                      }
                    >
                      <LinkIcon size={15} className="text-gold/75" />
                      {link.label}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}

          <div className="hairline" />

          <div className="flex items-center justify-between text-sm text-parchment/70 bg-ink2 border border-gold/10 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold text-xs font-semibold">
                {user?.avatar}
              </span>
              <span>{user?.displayName}</span>
            </div>
            <button onClick={handleLogout} className="text-gold flex items-center gap-1.5 font-medium hover:text-gold-light">
              <LogOut size={16} /> Log out
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
