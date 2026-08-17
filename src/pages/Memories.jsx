import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2 } from "lucide-react";
import { useData } from "../context/DataContext.jsx";
import { MEMORY_CATEGORIES } from "../data/seedData.js";
import MemoryCard from "../components/MemoryCard.jsx";
import AddMemoryModal from "../components/AddMemoryModal.jsx";
import GoldDivider from "../components/GoldDivider.jsx";

export default function Memories() {
  const { memories, addMemory, deleteMemory } = useData();
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = useMemo(
    () =>
      filter === "All"
        ? memories
        : memories.filter((m) => m.category === filter),
    [memories, filter],
  );

  const openMediaSrc = useMemo(() => {
    if (!open) return "";
    if (open.mediaBlob instanceof Blob)
      return URL.createObjectURL(open.mediaBlob);
    if (open.video) return open.video;
    if (open.image) return open.image;
    return "";
  }, [open]);

  useEffect(() => {
    return () => {
      if (open?.mediaBlob instanceof Blob && openMediaSrc) {
        URL.revokeObjectURL(openMediaSrc);
      }
    };
  }, [open, openMediaSrc]);

  const isOpenVideo =
    !!open && (open.mediaType === "video" || (!!open.video && !open.image));

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs tracking-[0.4em] text-ash mb-2">
            THE SCRAPBOOK
          </p>
          <h1 className="font-display text-5xl gold-text-anim">
            Memory Gallery
          </h1>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 text-sm text-ink bg-gold hover:bg-gold-light rounded-full px-5 py-2.5 self-start transition-colors"
        >
          <Plus size={16} /> Add memory
        </button>
      </div>

      <GoldDivider />

      <div className="flex flex-wrap gap-2 mb-8">
        {["All", ...MEMORY_CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`text-xs tracking-wide rounded-full px-4 py-2 border transition-colors ${
              filter === c
                ? "bg-gold text-ink border-gold"
                : "border-gold/25 text-parchment/70 hover:border-gold/60"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-ash text-sm italic py-16 text-center">
          Nothing here yet -- add the first one.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((m) => (
            <MemoryCard key={m.id} memory={m} onOpen={setOpen} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center px-4"
            onClick={() => setOpen(null)}
          >
            <button
              onClick={() => setOpen(null)}
              className="absolute top-6 right-6 text-parchment hover:text-gold"
            >
              <X size={26} />
            </button>
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-2xl w-full text-center"
            >
              <div className="glass rounded-2xl overflow-hidden mb-6">
                {isOpenVideo && openMediaSrc ? (
                  <video
                    src={openMediaSrc}
                    controls
                    className="w-full max-h-[60vh] object-contain bg-black"
                  />
                ) : openMediaSrc ? (
                  <img
                    src={openMediaSrc}
                    alt={open.caption}
                    className="w-full max-h-[60vh] object-contain bg-black"
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center text-ash text-sm tracking-widest">
                    NO PHOTO
                  </div>
                )}
              </div>
              <p className="font-display italic text-xl sm:text-2xl text-parchment/90">
                "{open.caption}"
              </p>
              <p className="text-gold text-sm tracking-widest mt-3">
                {open.date}
              </p>
              {open.addedBy && (
                <p className="text-ash text-xs mt-1">added by {open.addedBy}</p>
              )}
              <button
                onClick={() => {
                  deleteMemory(open.id);
                  setOpen(null);
                }}
                className="mt-5 inline-flex items-center gap-2 bg-red-500/85 hover:bg-red-500 text-white text-sm rounded-full px-4 py-2 transition-colors"
              >
                <Trash2 size={14} /> Delete this memory
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showAdd && (
        <AddMemoryModal onClose={() => setShowAdd(false)} onSave={addMemory} />
      )}
    </div>
  );
}
