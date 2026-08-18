import React, { useMemo, useEffect, useState } from "react";
import { Play, Cloud } from "lucide-react";
import { motion } from "framer-motion";
import {
  getCloudinaryVideoThumbnail,
  getOptimizedCloudinaryUrl,
  isLocalBlobUrl,
  resolveLocalBlobUrl,
} from "../utils/cloudinary.js";

export default function MemoryCard({ memory, onOpen }) {
  const [resolvedImage, setResolvedImage] = useState("");
  const [resolvedVideo, setResolvedVideo] = useState("");

  // Resolve localblob:// URLs to real object URLs
  useEffect(() => {
    let cancelled = false;
    let objUrls = [];

    async function resolve() {
      // Image
      if (memory.image) {
        if (isLocalBlobUrl(memory.image)) {
          const url = await resolveLocalBlobUrl(memory.image);
          if (!cancelled) { setResolvedImage(url); objUrls.push(url); }
        } else {
          if (!cancelled) setResolvedImage(
            memory.image.includes("cloudinary.com")
              ? getOptimizedCloudinaryUrl(memory.image, { width: 600, quality: "auto" })
              : memory.image
          );
        }
      }

      // Video
      if (memory.video) {
        if (isLocalBlobUrl(memory.video)) {
          const url = await resolveLocalBlobUrl(memory.video);
          if (!cancelled) { setResolvedVideo(url); objUrls.push(url); }
        } else {
          if (!cancelled) setResolvedVideo(memory.video);
        }
      }
    }

    resolve();

    return () => {
      cancelled = true;
      objUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [memory.image, memory.video]);

  const thumbnailSrc = useMemo(() => {
    if (memory.thumbnail && !isLocalBlobUrl(memory.thumbnail)) return memory.thumbnail;
    if (resolvedVideo && resolvedVideo.includes("cloudinary.com"))
      return getCloudinaryVideoThumbnail(resolvedVideo);
    return "";
  }, [memory.thumbnail, resolvedVideo]);

  const isVideo = memory.mediaType === "video" || (!!memory.video && !memory.image);
  const isCloudinary =
    (memory.image && memory.image.includes("cloudinary.com")) ||
    (memory.video && memory.video.includes("cloudinary.com"));
  const isLocal =
    isLocalBlobUrl(memory.image || "") || isLocalBlobUrl(memory.video || "");

  const cardImageSrc = isVideo ? (thumbnailSrc || resolvedVideo) : resolvedImage;

  return (
    <motion.button
      onClick={() => onOpen(memory)}
      whileHover={{ y: -4 }}
      className="glass rounded-xl overflow-hidden text-left group"
    >
      <div className="aspect-[4/3] bg-ink2 flex items-center justify-center overflow-hidden relative">
        {isVideo && thumbnailSrc ? (
          <>
            <img
              src={thumbnailSrc}
              alt={memory.caption}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="bg-black/60 rounded-full p-3 shadow-goldglow">
                <Play size={22} className="text-gold fill-gold" />
              </span>
            </span>
          </>
        ) : isVideo && resolvedVideo ? (
          <>
            <video
              src={`${resolvedVideo}#t=0.5`}
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="bg-black/50 rounded-full p-3 shadow-goldglow">
                <Play size={22} className="text-gold fill-gold" />
              </span>
            </span>
          </>
        ) : resolvedImage ? (
          <img
            src={resolvedImage}
            alt={memory.caption}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <span className="text-ash text-xs tracking-widest">NO PHOTO YET</span>
        )}

        {/* Storage badge */}
        {(isCloudinary || isLocal) && (
          <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1 opacity-50 group-hover:opacity-90 transition-opacity">
            <Cloud size={9} className={isCloudinary ? "text-gold" : "text-amber-400"} />
            <span className={`text-[8px] tracking-widest ${isCloudinary ? "text-gold" : "text-amber-400"}`}>
              {isCloudinary ? "CDN" : "LOCAL"}
            </span>
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs text-gold tracking-widest mb-1">
          {memory.category?.toUpperCase()}
        </p>
        <p className="text-parchment/90 text-sm line-clamp-2">{memory.caption}</p>
        <p className="text-ash text-xs mt-2">{memory.date}</p>
      </div>
    </motion.button>
  );
}
