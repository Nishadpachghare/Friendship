import React, { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { MEMORY_CATEGORIES } from "../data/seedData.js";
import { useAuth } from "../context/AuthContext.jsx";
import { createVideoThumbnail, blobToDataUrl } from "../utils/videoThumbnail.js";

export default function AddMemoryModal({ onClose, onSave }) {
  const { user } = useAuth();
  const [caption, setCaption] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState(MEMORY_CATEGORIES[0]);
  const [image, setImage] = useState("");
  const [video, setVideo] = useState("");
  const [mediaBlob, setMediaBlob] = useState(null);
  const [mediaType, setMediaType] = useState("");
  const [mediaPreview, setMediaPreview] = useState("");
  const [thumbnailBlob, setThumbnailBlob] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [isGeneratingThumb, setIsGeneratingThumb] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (mediaPreview) URL.revokeObjectURL(mediaPreview);
      if (thumbnailPreview.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [mediaPreview, thumbnailPreview]);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const maxSizeMb = isVideo ? 100 : 3;
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(
        `That ${isVideo ? "video" : "photo"} is a bit large -- try one under ${maxSizeMb}MB.`,
      );
      return;
    }

    setError("");
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    const previewUrl = URL.createObjectURL(file);
    setMediaBlob(file);
    setMediaType(isVideo ? "video" : "image");
    setMediaPreview(previewUrl);

    if (isVideo) {
      setVideo(previewUrl);
      setImage("");
      if (thumbnailPreview.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreview);
      }
      setThumbnailPreview("");
      setIsGeneratingThumb(true);
      const generatedThumb = await createVideoThumbnail(file);
      setThumbnailBlob(generatedThumb);
      setThumbnailPreview(generatedThumb ? URL.createObjectURL(generatedThumb) : "");
      setIsGeneratingThumb(false);
    } else {
      setImage(previewUrl);
      setVideo("");
      setThumbnailBlob(null);
      if (thumbnailPreview.startsWith("blob:")) {
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

    let finalThumbnail = thumbnailBlob;
    if (mediaType === "video" && mediaBlob instanceof Blob && !finalThumbnail) {
      setIsGeneratingThumb(true);
      finalThumbnail = await createVideoThumbnail(mediaBlob);
      setThumbnailBlob(finalThumbnail);
      setIsGeneratingThumb(false);
    }

    const thumbnail =
      finalThumbnail instanceof Blob ? await blobToDataUrl(finalThumbnail) : "";

    onSave({
      caption: caption.trim(),
      date,
      category,
      image: "",
      video: "",
      mediaBlob,
      mediaType,
      thumbnailBlob: finalThumbnail,
      thumbnail,
      addedBy: user?.displayName,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="glass rounded-2xl w-full max-w-lg p-6 sm:p-8 relative shadow-goldglow">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-ash hover:text-gold"
        >
          <X size={20} />
        </button>
        <h2 className="font-display text-2xl text-gold mb-1">Add a memory</h2>
        <p className="text-parchment/60 text-sm mb-6">
          Saved as added by {user?.displayName}.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs tracking-wide text-ash mb-1">
              DATE
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-ink/60 border border-gold/25 rounded-lg px-3 py-2 text-parchment"
            />
          </div>

          <div>
            <label className="block text-xs tracking-wide text-ash mb-1">
              CATEGORY
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-ink/60 border border-gold/25 rounded-lg px-3 py-2 text-parchment"
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
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              placeholder="What happened here?"
              className="w-full bg-ink/60 border border-gold/25 rounded-lg px-3 py-2 text-parchment resize-none"
            />
          </div>

          <div>
            <label className="block text-xs tracking-wide text-ash mb-1">
              PHOTO OR VIDEO (optional)
            </label>
            <label className="flex items-center gap-2 justify-center border border-dashed border-gold/30 rounded-lg py-4 cursor-pointer hover:border-gold/60 transition-colors">
              <Upload size={16} className="text-gold" />
              <span className="text-sm text-parchment/70">
                {image
                  ? "Photo selected"
                  : video
                    ? "Video selected"
                    : "Click to upload a photo or video"}
              </span>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFile}
                className="hidden"
              />
            </label>
            {image && (
              <img
                src={image}
                alt="Preview"
                className="mt-3 rounded-lg max-h-40 mx-auto object-cover"
              />
            )}
            {video && thumbnailPreview && (
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
            {video && !thumbnailPreview && !isGeneratingThumb && (
              <video
                src={video}
                controls
                className="mt-3 rounded-lg max-h-40 mx-auto"
              />
            )}
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          {isGeneratingThumb && (
            <p className="text-xs text-gold/80">
              Generating video thumbnail...
            </p>
          )}

          <button
            type="submit"
            disabled={isGeneratingThumb}
            aria-busy={isGeneratingThumb}
            className="w-full bg-gold hover:bg-gold-light transition-colors text-ink font-medium tracking-wide rounded-lg py-3"
          >
            {isGeneratingThumb ? "Preparing thumbnail..." : "Save memory"}
          </button>
        </form>
      </div>
    </div>
  );
}
