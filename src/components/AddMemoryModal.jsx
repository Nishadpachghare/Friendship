import React, { useState, useEffect, useRef } from "react";
import { X, ImagePlus, Video, Loader2, CheckCircle2, Sparkles, Calendar, Tag, MessageSquare, CloudUpload, HardDrive } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MEMORY_CATEGORIES } from "../data/seedData.js";
import { useAuth } from "../context/AuthContext.jsx";
import { createVideoThumbnail } from "../utils/videoThumbnail.js";
import { uploadToCloudinary, getCloudinaryVideoThumbnail } from "../utils/cloudinary.js";

export default function AddMemoryModal({ onClose, onSave }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [caption, setCaption] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState(MEMORY_CATEGORIES[0]);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState("");
  const [mediaPreview, setMediaPreview] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [isGeneratingThumb, setIsGeneratingThumb] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (mediaPreview?.startsWith("blob:")) URL.revokeObjectURL(mediaPreview);
      if (thumbnailPreview?.startsWith("blob:")) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [mediaPreview, thumbnailPreview]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape" && !isUploading) onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isUploading, onClose]);

  async function processFile(file) {
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    const maxSizeMb = isVideo ? 100 : 25;
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`That ${isVideo ? "video" : "photo"} is too large — try one under ${maxSizeMb}MB.`);
      return;
    }
    setError("");
    if (mediaPreview?.startsWith("blob:")) URL.revokeObjectURL(mediaPreview);
    const previewUrl = URL.createObjectURL(file);
    setMediaFile(file);
    setMediaType(isVideo ? "video" : "image");
    setMediaPreview(previewUrl);

    if (isVideo) {
      if (thumbnailPreview?.startsWith("blob:")) URL.revokeObjectURL(thumbnailPreview);
      setThumbnailPreview("");
      setIsGeneratingThumb(true);
      try {
        const thumb = await createVideoThumbnail(file);
        if (thumb) setThumbnailPreview(URL.createObjectURL(thumb));
      } catch { /* silent */ } finally {
        setIsGeneratingThumb(false);
      }
    } else {
      if (thumbnailPreview?.startsWith("blob:")) URL.revokeObjectURL(thumbnailPreview);
      setThumbnailPreview("");
    }
  }

  function handleFile(e) { processFile(e.target.files?.[0]); }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!caption.trim() || !date) {
      setError("Please add a date and caption for this memory.");
      return;
    }

    let finalImageUrl = "";
    let finalVideoUrl = "";
    let finalThumbnailUrl = "";

    if (mediaFile) {
      setIsUploading(true);
      setIsCompressing(mediaType === "image");
      setUploadProgress(0);
      setError("");
      try {
        const uploadResult = await uploadToCloudinary(mediaFile, {
          resourceType: mediaType === "video" ? "video" : "image",
          onProgress: (pct) => {
            setIsCompressing(false); // compression done once progress starts
            setUploadProgress(pct);
          },
        });

        const isLocal = uploadResult.storedLocally === true;
        setSavedLocally(isLocal);

        if (mediaType === "video") {
          finalVideoUrl = uploadResult.secure_url;
          finalThumbnailUrl = uploadResult.thumbnail_url || getCloudinaryVideoThumbnail(uploadResult.secure_url);
        } else {
          finalImageUrl = uploadResult.secure_url;
          if (isLocal) finalThumbnailUrl = uploadResult.secure_url;
        }

        setUploadSuccess(true);
        await new Promise((r) => setTimeout(r, 900));
      } catch (err) {
        console.error("Upload failed:", err);
        setError(`Upload failed: ${err.message || "Unknown error"}`);
        setIsUploading(false);
        setIsCompressing(false);
        return;
      }
    }

    onSave({
      caption: caption.trim(),
      date,
      category,
      image: finalImageUrl,
      video: finalVideoUrl,
      mediaType: mediaType || (finalVideoUrl ? "video" : finalImageUrl ? "image" : ""),
      thumbnail: finalThumbnailUrl,
      addedBy: user?.displayName,
    });

    setIsUploading(false);
    setUploadSuccess(false);
    setSavedLocally(false);
    onClose();
  }

  const previewSrc =
    mediaType === "video" && thumbnailPreview
      ? thumbnailPreview
      : mediaType === "image" && mediaPreview
      ? mediaPreview
      : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md"
        onClick={(e) => { if (e.target === e.currentTarget && !isUploading) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="w-full sm:max-w-md relative"
          style={{
            background: "linear-gradient(135deg, rgba(20,18,12,0.97) 0%, rgba(12,10,6,0.99) 100%)",
            border: "1px solid rgba(201,162,39,0.22)",
            borderRadius: "clamp(1.25rem, 4vw, 1.75rem)",
            boxShadow: "0 -8px 60px rgba(201,162,39,0.12), 0 0 100px rgba(0,0,0,0.8)",
            maxHeight: "95dvh",
            overflowY: "auto",
          }}
        >
          {/* Decorative top glow line */}
          <div
            className="absolute top-0 left-8 right-8 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(201,162,39,0.6), transparent)" }}
          />

          {/* Drag handle (mobile) */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-gold/30" />
          </div>

          <div className="p-5 sm:p-7">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} className="text-gold/70" />
                  <span className="text-[10px] tracking-[0.35em] text-gold/60 uppercase">New Memory</span>
                </div>
                <h2 className="font-display text-3xl text-gold">Capture the moment</h2>
                <p className="text-parchment/45 text-xs mt-1">
                  by <span className="text-gold/70">{user?.displayName}</span>
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={isUploading}
                aria-label="Close"
                className="w-9 h-9 rounded-full flex items-center justify-center border border-gold/15 text-ash hover:text-gold hover:border-gold/40 disabled:opacity-30 transition-all duration-200 mt-1"
              >
                <X size={16} />
              </button>
            </div>

            {/* Media Drop Zone */}
            <div className="mb-5">
              <label
                className={`relative flex flex-col items-center justify-center rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                  isUploading ? "pointer-events-none" : ""
                } ${isDragging ? "ring-2 ring-gold/60 scale-[1.01]" : ""}`}
                style={{
                  background: previewSrc
                    ? "transparent"
                    : "rgba(201,162,39,0.04)",
                  border: `1.5px dashed ${isDragging ? "rgba(201,162,39,0.7)" : previewSrc ? "rgba(201,162,39,0.25)" : "rgba(201,162,39,0.2)"}`,
                  minHeight: previewSrc ? 0 : "130px",
                }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                {previewSrc ? (
                  <div className="relative w-full">
                    <img
                      src={previewSrc}
                      alt="Preview"
                      className="w-full rounded-2xl object-cover"
                      style={{ maxHeight: "220px", objectFit: "cover" }}
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 rounded-2xl" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)" }} />
                    {/* Media type badge */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
                      {mediaType === "video" ? <Video size={10} className="text-gold" /> : <ImagePlus size={10} className="text-gold" />}
                      <span className="text-[9px] tracking-widest text-gold uppercase">{mediaType}</span>
                    </div>
                    {/* Change button */}
                    {!isUploading && (
                      <div className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40">
                        <span className="text-xs text-white tracking-wide bg-black/60 px-3 py-1.5 rounded-full border border-white/20">Change</span>
                      </div>
                    )}
                    {isGeneratingThumb && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
                        <Loader2 size={9} className="animate-spin text-gold" />
                        <span className="text-[9px] text-gold">processing</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-8 px-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.18)" }}
                    >
                      <ImagePlus size={22} className="text-gold/60" />
                    </div>
                    <div className="text-center">
                      <p className="text-parchment/70 text-sm">
                        {isDragging ? "Drop it here ✨" : "Drop a photo or video"}
                      </p>
                      <p className="text-parchment/35 text-xs mt-0.5">or tap to browse · up to 100MB</p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  disabled={isUploading}
                  accept="image/*,video/*"
                  onChange={handleFile}
                  className="hidden"
                />
              </label>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Date + Category row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] tracking-[0.25em] text-gold/50 mb-2 uppercase">
                    <Calendar size={9} />Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    disabled={isUploading}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2.5 text-parchment disabled:opacity-40 transition-colors"
                    style={{
                      background: "rgba(201,162,39,0.05)",
                      border: "1px solid rgba(201,162,39,0.18)",
                      colorScheme: "dark",
                    }}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] tracking-[0.25em] text-gold/50 mb-2 uppercase">
                    <Tag size={9} />Category
                  </label>
                  <select
                    value={category}
                    disabled={isUploading}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2.5 text-parchment disabled:opacity-40 transition-colors"
                    style={{
                      background: "rgba(20,18,12,0.95)",
                      border: "1px solid rgba(201,162,39,0.18)",
                    }}
                  >
                    {MEMORY_CATEGORIES.map((c) => (
                      <option key={c} value={c} style={{ background: "#0d0b07" }}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Caption */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] tracking-[0.25em] text-gold/50 mb-2 uppercase">
                  <MessageSquare size={9} />Caption
                </label>
                <textarea
                  value={caption}
                  disabled={isUploading}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={2}
                  placeholder="What made this moment special?"
                  className="w-full text-sm rounded-xl px-3 py-2.5 text-parchment placeholder:text-parchment/25 resize-none disabled:opacity-40 transition-colors leading-relaxed"
                  style={{
                    background: "rgba(201,162,39,0.05)",
                    border: "1px solid rgba(201,162,39,0.18)",
                  }}
                />
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-red-400/90 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Upload progress */}
              <AnimatePresence>
                {(isUploading || isCompressing) && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl p-3.5"
                    style={{
                      background: "rgba(201,162,39,0.05)",
                      border: "1px solid rgba(201,162,39,0.15)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`flex items-center gap-2 text-xs font-medium ${
                        uploadSuccess
                          ? savedLocally ? "text-amber-400" : "text-emerald-400"
                          : "text-gold/80"
                      }`}>
                        {uploadSuccess ? (
                          <>
                            {savedLocally
                              ? <HardDrive size={12} />
                              : <CloudUpload size={12} />}
                            {savedLocally ? "Saved locally" : "Saved to Cloudinary"}
                            <CheckCircle2 size={12} />
                          </>
                        ) : isCompressing ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            <span>Compressing photo...</span>
                          </>
                        ) : (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            <span>Uploading...</span>
                          </>
                        )}
                      </div>
                      <span className="text-xs text-gold/50 tabular-nums">
                        {isCompressing ? "" : `${uploadProgress}%`}
                      </span>
                    </div>
                    {/* Track */}
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(201,162,39,0.1)" }}>
                      {isCompressing ? (
                        <div
                          className="h-full rounded-full animate-pulse"
                          style={{ width: "40%", background: "linear-gradient(90deg, #8a7530, #e8c468)" }}
                        />
                      ) : (
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: uploadSuccess
                              ? savedLocally
                                ? "linear-gradient(90deg, #f59e0b, #fcd34d)"
                                : "linear-gradient(90deg, #10b981, #34d399)"
                              : "linear-gradient(90deg, #8a7530, #e8c468, #c9a227)",
                          }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ ease: "easeOut", duration: 0.3 }}
                        />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Save button */}
              <motion.button
                type="submit"
                disabled={isGeneratingThumb || isUploading || isCompressing}
                whileTap={{ scale: 0.98 }}
                className="w-full relative overflow-hidden rounded-2xl py-3.5 text-sm font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                style={{
                  background: "linear-gradient(135deg, #c9a227 0%, #e8c468 50%, #c9a227 100%)",
                  backgroundSize: "200% 100%",
                  color: "#0a0800",
                  boxShadow: isGeneratingThumb || isUploading || isCompressing ? "none" : "0 4px 24px rgba(201,162,39,0.35)",
                }}
              >
                {isCompressing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={15} className="animate-spin" />
                    Compressing...
                  </span>
                ) : isUploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={15} className="animate-spin" />
                    Uploading... {uploadProgress}%
                  </span>
                ) : isGeneratingThumb ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={15} className="animate-spin" />
                    Generating preview...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles size={14} />
                    Save this memory
                  </span>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
