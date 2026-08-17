import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { useData } from "../context/DataContext.jsx";
import { STORY_META } from "../data/seedData.js";
import GoldDivider from "../components/GoldDivider.jsx";

// Helper to format date strings like YYYY-MM-DD into "August 12th, 2024"
function formatTimelineDate(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const monthIndex = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  let suffix = "th";
  if (day === 1 || day === 21 || day === 31) suffix = "st";
  else if (day === 2 || day === 22) suffix = "nd";
  else if (day === 3 || day === 23) suffix = "rd";

  return `${months[monthIndex]} ${day}${suffix}, ${year}`;
}

export default function Timeline() {
  const { timeline, addTimelineEvent } = useData();
  const [active, setActive] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    emoji: "✨",
    date: "",
    text: "",
  });

  function handleAdd(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    addTimelineEvent(form);
    setForm({ title: "", emoji: "✨", date: "", text: "" });
    setShowForm(false);
  }

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16">
      {/* Title Section */}
      <div className="text-center mb-12">
        <h1 className="font-display text-5xl gold-text-anim mb-2">Our Story</h1>
        <div className="flex justify-center items-center gap-3 my-2 text-gold">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-gold" />
          <span className="text-lg">♥</span>
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-gold" />
        </div>
        <p className="text-sm text-ash font-medium">
          A timeline of our beautiful journey together ✨
        </p>
      </div>

      <GoldDivider />

      <div className="relative mt-16">
        {/* Timeline Central Line */}
        <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold/50 via-gold/15 to-transparent pointer-events-none" />

        <div className="space-y-12">
          {timeline.map((t, i) => {
            const isEven = i % 2 === 0;
            const isFirstMeet = t.title.toLowerCase().includes("meet");
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className={`relative flex items-center w-full ${
                  isEven ? "sm:flex-row-reverse" : "sm:flex-row"
                }`}
              >
                {/* Left side content container for desktop */}
                <div
                  className={`hidden sm:block sm:w-1/2 px-8 ${isEven ? "text-left" : "text-right"}`}
                >
                  {isEven && (
                    <div
                      className="glass rounded-2xl p-6 hover:border-gold/55 transition-all duration-300 inline-block text-left w-full max-w-md cursor-pointer hover:shadow-goldglow"
                      onClick={() => setActive(t)}
                    >
                      <span className="inline-block text-[11px] font-bold text-gold bg-gold/10 border border-gold/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2.5">
                        {formatTimelineDate(t.date)}
                      </span>
                      <h4 className="font-display text-2xl text-parchment mt-0.5 flex items-center gap-1.5">
                        {t.title}{" "}
                        <span className="text-gold text-lg font-light">♡</span>
                      </h4>
                      <p className="text-sm text-ash mt-2.5 leading-relaxed font-medium">
                        {t.text}
                      </p>

                      {isFirstMeet && (
                        <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-ash mt-4 pt-3 border-t border-gold/10">
                          <span className="flex items-center gap-1 font-medium">
                            <span className="text-gold">📍</span>{" "}
                            {STORY_META.firstMeetLocation}
                          </span>
                          <span className="text-gold/30">|</span>
                          <span className="flex items-center gap-1 font-medium">
                            <span className="text-gold">🕒</span>{" "}
                            {STORY_META.firstMeetTime}
                          </span>
                          <span className="text-gold/30">|</span>
                          <span className="flex items-center gap-1 font-medium">
                            <span className="text-gold">🎵</span>{" "}
                            {STORY_META.firstMeetSong}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Center Circle Indicator */}
                <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 z-10">
                  <button
                    onClick={() => setActive(t)}
                    className="bg-[#131313] border-2 border-gold/80 hover:border-gold rounded-full w-11 h-11 flex items-center justify-center text-lg shadow-sm hover:scale-110 transition-all cursor-pointer"
                  >
                    {t.emoji}
                  </button>
                </div>

                {/* Right side content container */}
                <div className="w-full sm:w-1/2 pl-14 sm:pl-8 sm:pr-8">
                  {/* Mobile content card */}
                  <div
                    className="sm:hidden glass rounded-xl p-5 cursor-pointer hover:border-gold/45 transition-colors"
                    onClick={() => setActive(t)}
                  >
                    <span className="inline-block text-[10px] font-bold text-gold bg-gold/10 border border-gold/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2.5">
                      {formatTimelineDate(t.date)}
                    </span>
                    <h4 className="font-display text-xl text-parchment mt-0.5 flex items-center gap-1.5">
                      {t.title}{" "}
                      <span className="text-gold text-base font-light">♡</span>
                    </h4>
                  </div>

                  {/* Desktop content card for odd indexes */}
                  {!isEven && (
                    <div
                      className="hidden sm:block glass rounded-2xl p-6 hover:border-gold/55 transition-all duration-300 text-left w-full max-w-md cursor-pointer hover:shadow-goldglow"
                      onClick={() => setActive(t)}
                    >
                      <span className="inline-block text-[11px] font-bold text-gold bg-gold/10 border border-gold/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2.5">
                        {formatTimelineDate(t.date)}
                      </span>
                      <h4 className="font-display text-2xl text-parchment mt-0.5 flex items-center gap-1.5">
                        {t.title}{" "}
                        <span className="text-gold text-lg font-light">♡</span>
                      </h4>
                      <p className="text-sm text-ash mt-2.5 leading-relaxed font-medium">
                        {t.text}
                      </p>

                      {isFirstMeet && (
                        <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-ash mt-4 pt-3 border-t border-gold/10">
                          <span className="flex items-center gap-1 font-medium">
                            <span className="text-gold">📍</span>{" "}
                            {STORY_META.firstMeetLocation}
                          </span>
                          <span className="text-gold/30">|</span>
                          <span className="flex items-center gap-1 font-medium">
                            <span className="text-gold">🕒</span>{" "}
                            {STORY_META.firstMeetTime}
                          </span>
                          <span className="text-gold/30">|</span>
                          <span className="flex items-center gap-1 font-medium">
                            <span className="text-gold">🎵</span>{" "}
                            {STORY_META.firstMeetSong}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Beginning of Forever Banner */}
      <div className="flex justify-center mt-20">
        <div className="glass border border-gold/25 rounded-full px-8 py-3.5 shadow-sm text-center">
          <p className="font-display italic text-lg text-gold flex items-center gap-2.5 justify-center">
            ✨ This is just the beginning of our forever story... 💫
          </p>
        </div>
      </div>

      {/* Add a Moment Button */}
      <div className="flex justify-center mt-12">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm text-ink bg-gold hover:bg-gold-light border border-transparent rounded-full px-6 py-2.5 hover:scale-105 transition-all shadow-sm font-semibold"
        >
          <Plus size={16} /> Add a moment to our story
        </button>
      </div>

      <AnimatePresence>
        {active && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            onClick={() => setActive(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl max-w-md w-full p-8 relative shadow-goldglow text-center anim-fade-in"
            >
              <button
                onClick={() => setActive(null)}
                className="absolute top-4 right-4 text-ash hover:text-gold"
              >
                <X size={20} />
              </button>
              <div className="text-4xl mb-3">{active.emoji}</div>
              <h3 className="font-display text-2xl text-gold mb-1">
                {active.title}
              </h3>
              <p className="text-xs text-ash mb-4 font-bold uppercase tracking-wider">
                {formatTimelineDate(active.date)}
              </p>
              <p className="text-parchment font-display italic text-lg leading-relaxed">
                "{active.text}"
              </p>
            </div>
          </div>
        )}

        {showForm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            onClick={() => setShowForm(false)}
          >
            <form
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleAdd}
              className="glass rounded-2xl max-w-sm w-full p-8 relative space-y-4 anim-fade-in"
            >
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 text-ash hover:text-gold"
              >
                <X size={20} />
              </button>
              <h3 className="font-display text-2xl text-gold">
                New timeline moment
              </h3>
              <div className="flex gap-3">
                <input
                  value={form.emoji}
                  onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                  className="w-16 bg-ink/60 border border-gold/25 rounded-lg px-3 py-2 text-center text-xl text-parchment"
                />
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Title"
                  className="flex-1 bg-ink/60 border border-gold/25 rounded-lg px-3 py-2 text-parchment"
                />
              </div>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full bg-ink/60 border border-gold/25 rounded-lg px-3 py-2 text-parchment"
              />
              <textarea
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                placeholder="What happened?"
                rows={3}
                className="w-full bg-ink/60 border border-gold/25 rounded-lg px-3 py-2 text-parchment resize-none"
              />
              <button
                type="submit"
                className="w-full bg-gold hover:bg-gold-light text-ink font-medium rounded-lg py-2.5 shadow-sm transition-colors"
              >
                Add to timeline
              </button>
            </form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
