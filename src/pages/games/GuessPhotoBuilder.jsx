import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Trash2, Pencil, Play, Upload, Loader2 } from "lucide-react";
import { useData } from "../../context/DataContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { uploadToCloudinary, resolveLocalBlobUrl } from "../../utils/cloudinary.js";
import GoldDivider from "../../components/GoldDivider.jsx";

function RoundThumbnail({ image }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let cancelled = false;
    let createdUrl = "";
    async function load() {
      if (!image) { setSrc(""); return; }
      if (image.startsWith("localblob://")) {
        createdUrl = await resolveLocalBlobUrl(image);
        if (!cancelled) setSrc(createdUrl);
      } else {
        if (!cancelled) setSrc(image);
      }
    }
    load();
    return () => {
      cancelled = true;
      if (createdUrl && createdUrl.startsWith("blob:")) URL.revokeObjectURL(createdUrl);
    };
  }, [image]);

  if (!src) {
    return (
      <div className="w-full h-full flex items-center justify-center text-ash text-[10px] tracking-widest">
        NO PHOTO
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      className="w-full h-full object-cover"
      style={{ filter: "blur(5px) brightness(0.85)" }}
    />
  );
}

const EMPTY_FORM = {
  prompt: "Where was this?",
  options: ["", "", "", ""],
  answer: "",
};

export default function GuessPhotoBuilder() {
  const {
    guessPhotoRounds,
    addGuessPhotoRound,
    updateGuessPhotoRound,
    deleteGuessPhotoRound,
  } = useData();
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function setOption(index, value) {
    setForm((prev) => {
      const options = [...prev.options];
      options[index] = value;
      return { ...prev, options };
    });
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setImageFile(null);
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview("");
    setEditingId(null);
    setIsUploading(false);
    setError("");
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload a photo (not a video).");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("That photo is a bit large — try one under 20MB.");
      return;
    }

    setError("");
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const prompt = form.prompt.trim() || "Where was this?";
    const options = form.options.map((o) => o.trim()).filter(Boolean);

    if (!imageFile && !imagePreview && !editingId) {
      setError("Please upload a photo for this round.");
      return;
    }
    if (options.length < 2) {
      setError("Add at least 2 answer options.");
      return;
    }
    if (!form.answer.trim()) {
      setError("Select the correct answer.");
      return;
    }
    if (!options.includes(form.answer.trim())) {
      setError("The correct answer must be one of your options.");
      return;
    }

    let finalImageUrl = "";
    if (imageFile) {
      setIsUploading(true);
      setUploadProgress(0);
      try {
        const uploadResult = await uploadToCloudinary(imageFile, {
          resourceType: "image",
          onProgress: (pct) => setUploadProgress(pct),
        });
        finalImageUrl = uploadResult.secure_url;
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        setError(`Upload to Cloudinary failed: ${err.message || "Unknown error"}`);
        setIsUploading(false);
        return;
      }
    } else if (editingId) {
      const existing = guessPhotoRounds.find((r) => r.id === editingId);
      finalImageUrl = existing?.image || "";
    }

    const payload = {
      prompt,
      options,
      answer: form.answer.trim(),
      image: finalImageUrl,
      addedBy: user?.displayName,
    };

    if (editingId) {
      updateGuessPhotoRound(editingId, payload);
    } else {
      addGuessPhotoRound(payload);
    }
    resetForm();
  }

  function startEdit(round) {
    setEditingId(round.id);
    setForm({
      prompt: round.prompt || "Where was this?",
      options: [
        round.options[0] || "",
        round.options[1] || "",
        round.options[2] || "",
        round.options[3] || "",
      ],
      answer: round.answer,
    });
    setImageFile(null);
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(round.image || "");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-16">
      <p className="text-xs tracking-[0.4em] text-ash mb-2">MEMORY BUILDER</p>
      <h1 className="font-display text-4xl sm:text-5xl gold-text-anim mb-3">
        Build Guess The Memory
      </h1>
      <p className="text-parchment/60 text-sm mb-6">
        Upload photos directly to Cloudinary with answer choices. Once saved, they appear
        instantly in <span className="text-gold">Guess The Memory</span>.
      </p>

      <GoldDivider />

      <form
        onSubmit={handleSubmit}
        className="glass rounded-2xl p-6 sm:p-8 mt-8 space-y-5"
      >
        <h2 className="font-display text-xl text-gold">
          {editingId ? "Edit round" : "New round"}
        </h2>

        <div>
          <label className="block text-xs tracking-wide text-ash mb-1">
            PHOTO (Uploaded directly to Cloudinary)
          </label>
          <label
            className={`flex items-center gap-2 justify-center border border-dashed border-gold/30 rounded-lg py-4 transition-colors ${
              isUploading
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:border-gold/60"
            }`}
          >
            <Upload size={16} className="text-gold" />
            <span className="text-sm text-parchment/70">
              {imageFile
                ? `Photo selected (${imageFile.name})`
                : imagePreview
                  ? "Change photo"
                  : "Click to upload a photo"}
            </span>
            <input
              type="file"
              disabled={isUploading}
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
          </label>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Round preview"
              className="mt-3 rounded-lg max-h-48 mx-auto object-cover"
              style={{ filter: "blur(6.5px) brightness(0.85)" }}
            />
          )}
        </div>

        <div>
          <label className="block text-xs tracking-wide text-ash mb-1">
            QUESTION
          </label>
          <input
            value={form.prompt}
            disabled={isUploading}
            onChange={(e) => setForm((p) => ({ ...p, prompt: e.target.value }))}
            placeholder="Where was this?"
            className="w-full bg-ink/60 border border-gold/25 rounded-lg px-3 py-2 text-parchment disabled:opacity-50"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-xs tracking-wide text-ash">
            ANSWER OPTIONS (2–4)
          </label>
          {form.options.map((opt, i) => (
            <input
              key={i}
              value={opt}
              disabled={isUploading}
              onChange={(e) => setOption(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
              className="w-full bg-ink/60 border border-gold/25 rounded-lg px-3 py-2 text-parchment disabled:opacity-50"
            />
          ))}
        </div>

        <div>
          <label className="block text-xs tracking-wide text-ash mb-1">
            CORRECT ANSWER
          </label>
          <select
            value={form.answer}
            disabled={isUploading}
            onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))}
            className="w-full bg-ink/60 border border-gold/25 rounded-lg px-3 py-2 text-parchment disabled:opacity-50"
          >
            <option value="">Select correct answer...</option>
            {form.options
              .map((o) => o.trim())
              .filter(Boolean)
              .map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        {isUploading && (
          <div className="space-y-1.5 p-3 rounded-lg bg-ink/70 border border-gold/20">
            <div className="flex justify-between items-center text-xs text-gold">
              <span className="flex items-center gap-1.5">
                <Loader2 size={13} className="animate-spin" /> Uploading to Cloudinary...
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-ink2 rounded-full overflow-hidden border border-gold/10">
              <div
                className="h-full bg-gradient-to-r from-gold to-gold-light transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isUploading}
            className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed text-ink font-medium rounded-lg px-5 py-2.5 transition-colors"
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Uploading... ({uploadProgress}%)
              </>
            ) : (
              <>
                <Plus size={16} />
                {editingId ? "Update round" : "Add round"}
              </>
            )}
          </button>
          {editingId && (
            <button
              type="button"
              disabled={isUploading}
              onClick={resetForm}
              className="text-sm text-parchment/60 hover:text-gold px-4 py-2.5 disabled:opacity-40"
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-parchment">
            Your rounds ({guessPhotoRounds.length})
          </h2>
          {guessPhotoRounds.length > 0 && (
            <Link
              to="/games/guess-photo"
              className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-light transition-colors"
            >
              <Play size={14} /> Play game
            </Link>
          )}
        </div>

        {guessPhotoRounds.length === 0 ? (
          <p className="text-ash text-sm italic py-8 text-center glass rounded-xl">
            No rounds yet — upload your first photo above.
          </p>
        ) : (
          <div className="space-y-3">
            {guessPhotoRounds.map((round, i) => (
              <motion.div
                key={round.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-xl p-4 sm:p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-ink2 shrink-0">
                    <RoundThumbnail image={round.image} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gold tracking-widest mb-1">
                      ROUND {i + 1}
                    </p>
                    <p className="text-parchment/90 text-sm sm:text-base">
                      {round.prompt || "Where was this?"}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {round.options.map((opt) => (
                        <li
                          key={opt}
                          className={`text-xs sm:text-sm ${
                            opt === round.answer
                              ? "text-gold"
                              : "text-parchment/50"
                          }`}
                        >
                          {opt === round.answer ? "✓ " : "· "}
                          {opt}
                        </li>
                      ))}
                    </ul>
                    {round.addedBy && (
                      <p className="text-ash text-xs mt-2">
                        by {round.addedBy}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(round)}
                      aria-label="Edit round"
                      className="text-ash hover:text-gold p-1.5"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => deleteGuessPhotoRound(round.id)}
                      aria-label="Delete round"
                      className="text-ash hover:text-red-400 p-1.5"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 text-center">
        <Link
          to="/games"
          className="text-sm text-parchment/60 hover:text-gold underline underline-offset-4"
        >
          Back to games
        </Link>
      </div>
    </div>
  );
}
