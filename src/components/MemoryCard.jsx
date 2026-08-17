import React, { useMemo, useEffect, useState } from "react";
import { Play } from "lucide-react";
import { motion } from "framer-motion";
import { createVideoThumbnail } from "../utils/videoThumbnail.js";
import { getCloudinaryVideoThumbnail } from "../utils/cloudinary.js";

export default function MemoryCard({ memory, onOpen }) {
  const [generatedThumb, setGeneratedThumb] = useState("");

  const mediaSrc = useMemo(() => {
    if (memory.mediaBlob instanceof Blob) {
      return URL.createObjectURL(memory.mediaBlob);
    }
    if (memory.video) return memory.video;
    if (memory.image) return memory.image;
    return "";
  }, [memory.mediaBlob, memory.video, memory.image]);

  const thumbnailBlobSrc = useMemo(() => {
    if (memory.thumbnailBlob instanceof Blob) {
      return URL.createObjectURL(memory.thumbnailBlob);
    }
    return "";
  }, [memory.thumbnailBlob]);

  const cloudinaryVideoThumb = useMemo(() => {
    if (memory.video) {
      return getCloudinaryVideoThumbnail(memory.video);
    }
    return "";
  }, [memory.video]);

  const thumbnailSrc =
    thumbnailBlobSrc || memory.thumbnail || cloudinaryVideoThumb || generatedThumb;

  const isVideo =
    memory.mediaType === "video" || (!!memory.video && !memory.image);

  useEffect(() => {
    if (!isVideo) return;
    if (memory.thumbnailBlob instanceof Blob || memory.thumbnail || cloudinaryVideoThumb) return;
    if (!(memory.mediaBlob instanceof Blob)) return;

    let cancelled = false;
    createVideoThumbnail(memory.mediaBlob).then((blob) => {
      if (cancelled || !blob) return;
      setGeneratedThumb(URL.createObjectURL(blob));
    });

    return () => {
      cancelled = true;
    };
  }, [isVideo, memory.mediaBlob, memory.thumbnail, memory.thumbnailBlob, cloudinaryVideoThumb]);

  useEffect(() => {
    return () => {
      if (memory.mediaBlob instanceof Blob && mediaSrc) {
        URL.revokeObjectURL(mediaSrc);
      }
      if (thumbnailBlobSrc) {
        URL.revokeObjectURL(thumbnailBlobSrc);
      }
      if (generatedThumb) {
        URL.revokeObjectURL(generatedThumb);
      }
    };
  }, [memory.mediaBlob, mediaSrc, thumbnailBlobSrc, generatedThumb]);

  const showVideoThumb = isVideo && thumbnailSrc;
  const showVideoFallback = isVideo && !thumbnailSrc && mediaSrc;
  const showImage = !isVideo && mediaSrc;

  return (
    <motion.button
      onClick={() => onOpen(memory)}
      whileHover={{ y: -4 }}
      className="glass rounded-xl overflow-hidden text-left group"
    >
      <div className="aspect-[4/3] bg-ink2 flex items-center justify-center overflow-hidden relative">
        {showVideoThumb ? (
          <>
            <img
              src={thumbnailSrc}
              alt={memory.caption}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="bg-black/60 rounded-full p-3 shadow-goldglow">
                <Play size={22} className="text-gold fill-gold" />
              </span>
            </span>
          </>
        ) : showVideoFallback ? (
          <>
            <video
              src={`${mediaSrc}#t=0.5`}
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
        ) : showImage ? (
          <img
            src={mediaSrc}
            alt={memory.caption}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="text-ash text-xs tracking-widest">NO PHOTO YET</span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-gold tracking-widest mb-1">
          {memory.category?.toUpperCase()}
        </p>
        <p className="text-parchment/90 text-sm line-clamp-2">
          {memory.caption}
        </p>
        <p className="text-ash text-xs mt-2">{memory.date}</p>
      </div>
    </motion.button>
  );
}
