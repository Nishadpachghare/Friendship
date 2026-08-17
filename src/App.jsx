import React from 'react'
import { Routes, Route, useLocation, Link } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Navbar from './components/Navbar.jsx'
import { STORY_META } from './data/seedData.js'

import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Timeline from './pages/Timeline.jsx'
import Memories from './pages/Memories.jsx'
import Fight from './pages/Fight.jsx'
import GamesHub from './pages/GamesHub.jsx'
import Quiz from './pages/games/Quiz.jsx'
import QuizBuilder from './pages/games/QuizBuilder.jsx'
import GuessPhoto from './pages/games/GuessPhoto.jsx'
import GuessPhotoBuilder from './pages/games/GuessPhotoBuilder.jsx'
import MemoryMachine from './pages/games/MemoryMachine.jsx'
import Stats from './pages/Stats.jsx'
import WhatIf from './pages/WhatIf.jsx'
import FinalPage from './pages/FinalPage.jsx'

function Shell({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <footer className="text-center py-10 text-xs text-ash tracking-widest uppercase">
        "Who knows, God knows, God plans"
      </footer>
    </>
  )
}

export default function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/end" element={<ProtectedRoute><FinalPage /></ProtectedRoute>} />

        <Route path="/" element={<ProtectedRoute><Shell><Home /></Shell></ProtectedRoute>} />
        <Route path="/timeline" element={<ProtectedRoute><Shell><Timeline /></Shell></ProtectedRoute>} />
        <Route path="/memories" element={<ProtectedRoute><Shell><Memories /></Shell></ProtectedRoute>} />
        <Route path="/fight" element={<ProtectedRoute><Shell><Fight /></Shell></ProtectedRoute>} />
        <Route path="/games" element={<ProtectedRoute><Shell><GamesHub /></Shell></ProtectedRoute>} />
        <Route path="/games/quiz/build" element={<ProtectedRoute><Shell><QuizBuilder /></Shell></ProtectedRoute>} />
        <Route path="/games/quiz" element={<ProtectedRoute><Shell><Quiz /></Shell></ProtectedRoute>} />
        <Route path="/games/guess-photo/build" element={<ProtectedRoute><Shell><GuessPhotoBuilder /></Shell></ProtectedRoute>} />
        <Route path="/games/guess-photo" element={<ProtectedRoute><Shell><GuessPhoto /></Shell></ProtectedRoute>} />
        <Route path="/games/memory-machine" element={<ProtectedRoute><Shell><MemoryMachine /></Shell></ProtectedRoute>} />
        <Route path="/stats" element={<ProtectedRoute><Shell><Stats /></Shell></ProtectedRoute>} />
        <Route path="/what-if" element={<ProtectedRoute><Shell><WhatIf /></Shell></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  )
}
