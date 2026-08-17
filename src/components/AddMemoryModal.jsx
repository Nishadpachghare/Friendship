import React, { useState, useEffect } from "react";
import { X, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { MEMORY_CATEGORIES } from "../data/seedData.js";
import { useAuth } from "../context/AuthContext.jsx";
import { createVideoThumbnail } from "../utils/videoThumbnail.js";
import { uploadToCloudinary, getCloudinaryVideoThumbnail } from "../utils/cloudinary.js";

export default function AddMemoryModal({ onClose, onSave }) {
  const { user } = useAuth();
  const [caption, setCaption] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState(MEMORY_CATEGORIES[0]);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState("");
  const [mediaPreview, setMediaPreview] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [isGeneratingThumb, setIsGeneratingThumb] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (mediaPreview && mediaPreview.startsWith("blob:")) {
        URL.revokeObjectURL(mediaPreview);
      }
      if (thumbnailPreview && thumbnailPreview.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [mediaPreview, thumbnailPreview]);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const maxSizeMb = isVideo ? 100 : 25;
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(
        `That ${isVideo ? "video" : "photo"} is a bit large — try one under ${maxSizeMb}MB.`,
      );
      return;
    }

    setError("");
    if (mediaPreview && mediaPreview.startsWith("blob:")) {
      URL.revokeObjectURL(mediaPreview);
    }
    const previewUrl = URL.createObjectURL(file);
    setMediaFile(file);
    setMediaType(isVideo ? "video" : "image");
    setMediaPreview(previewUrl);

    if (isVideo) {
      if (thumbnailPreview && thumbnailPreview.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreview);
      }
      setThumbnailPreview("");
      setIsGeneratingThumb(true);
      try {
        const generatedThumb = await createVideoThumbnail(file);
        if (generatedThumb) {
          setThumbnailPreview(URL.createObjectURL(generatedThumb));
        }
      } catch (err) {
        console.warn("Could not generate client video thumbnail:", err);
      } finally {
        setIsGeneratingThumb(false);
      }
    } else {
      if (thumbnailPreview && thumbnailPreview.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreview);
      }
      setThumbnailPreview("");
      setIsGeneratingThumb(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!caption.trim() || !date) {
      setError("A date and a few words about the memory are needed.");
      return;
    }

    let finalImageUrl = "";
    let finalVideoUrl = "";
    let finalThumbnailUrl = "";

    if (mediaFile) {
      setIsUploading(true);
      setUploadProgress(0);
      try {
        const uploadResult = await uploadToCloudinary(mediaFile, {
          resourceType: mediaType === "video" ? "video" : "image",
          onProgress: (pct) => setUploadProgress(pct),
        });

        if (mediaType === "video") {
          finalVideoUrl = uploadResult.secure_url;
          finalThumbnailUrl =
            uploadResult.thumbnail_url ||
            getCloudinaryVideoThumbnail(uploadResult.secure_url);
        } else {
          finalImageUrl = uploadResult.secure_url;
        }
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        setError(`Upload to Cloudinary failed: ${err.message || "Unknown error"}`);
        setIsUploading(false);
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
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="glass rounded-2xl w-full max-w-lg p-6 sm:p-8 relative shadow-goldglow">
        <button
          onClick={onClose}
          disabled={isUploading}
          aria-label="Close"
          className="absolute top-4 right-4 text-ash hover:text-gold disabled:opacity-40"
        >
          <X size={20} />
        </button>
        <h2 className="font-display text-2xl text-gold mb-1">Add a memory</h2>
        <p className="text-parchment/60 text-sm mb-6">
          Saved directly to Cloudinary and added by {user?.displayName}.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs tracking-wide text-ash mb-1">
              DATE
            </label>
            <input
              type="date"
              value={date}
              disabled={isUploading}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-ink/60 border border-gold/25 rounded-lg px-3 py-2 text-parchment disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs tracking-wide text-ash mb-1">
              CATEGORY
            </label>
            <select
              value={category}
              disabled={isUploading}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-ink/60 border border-gold/25 rounded-lg px-3 py-2 text-parchment disabled:opacity-50"
            >
              {MEMORY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs tracking-wide text-ash mb-1">
              CAPTION
            </label>
            <textarea
              value={caption}
              disabled={isUploading}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              placeholder="What happened here?"
              className="w-full bg-ink/60 border border-gold/25 rounded-lg px-3 py-2 text-parchment resize-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs tracking-wide text-ash mb-1">
              PHOTO OR VIDEO (Direct Cloudinary Upload)
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
                {mediaFile
                  ? `${mediaType === "video" ? "Video" : "Photo"} selected (${mediaFile.name})`
                  : "Click to choose a photo or video"}
              </span>
              <input
                type="file"
                disabled={isUploading}
                accept="image/*,video/*"
                onChange={handleFile}
                className="hidden"
              />
            </label>

            {mediaType === "image" && mediaPreview && (
              <img
                src={mediaPreview}
                alt="Preview"
                className="mt-3 rounded-lg max-h-40 mx-auto object-cover"
              />
            )}

            {mediaType === "video" && thumbnailPreview && (
              <div className="mt-3 relative rounded-lg overflow-hidden max-h-40 mx-auto">
                <img
                  src={thumbnailPreview}
                  alt="Video thumbnail preview"
                  className="w-full max-h-40 object-cover"
                />
                <span className="absolute bottom-2 right-2 text-[10px] tracking-widest bg-black/70 text-gold px-2 py-0.5 rounded">
                  VIDEO
                </span>
              </div>
            )}

            {mediaType === "video" && !thumbnailPreview && mediaPreview && (
              <video
                src={mediaPreview}
                controls
                className="mt-3 rounded-lg max-h-40 mx-auto"
              />
            )}
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          {isGeneratingThumb && (
            <p className="text-xs text-gold/80 flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin" /> Generating video thumbnail...
            </p>
          )}

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

          <button
            type="submit"
            disabled={isGeneratingThumb || isUploading}
            aria-busy={isGeneratingThumb || isUploading}
            className="w-full bg-gold hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-ink font-medium tracking-wide rounded-lg py-3 flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Uploading... ({uploadProgress}%)
              </>
            ) : isGeneratingThumb ? (
              "Preparing thumbnail..."
            ) : (
              "Save memory"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
