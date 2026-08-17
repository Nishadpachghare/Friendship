import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { user, ready } = useAuth()

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink text-ash text-sm tracking-widest">
        LOADING OUR STORY...
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children
}
