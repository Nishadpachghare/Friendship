import React from 'react'

export default function GoldDivider({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 my-6 ${className}`}>
      <div className="hairline flex-1" />
      <span className="text-gold text-xs tracking-[0.3em]">&#10022;</span>
      <div className="hairline flex-1" />
    </div>
  )
}
