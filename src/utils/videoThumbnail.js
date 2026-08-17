export function createVideoThumbnail(file, seekTime = 1) {
  return new Promise((resolve) => {
    const src = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("playsinline", "");
    video.style.cssText =
      "position:fixed;opacity:0;pointer-events:none;width:1px;height:1px;top:0;left:0";
    document.body.appendChild(video);

    let settled = false;
    const finish = (blob) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(src);
      video.remove();
      resolve(blob);
    };

    const timeout = setTimeout(() => finish(null), 12000);

    const capture = () => {
      if (settled) return;
      try {
        const width = 480;
        const vw = video.videoWidth || 16;
        const vh = video.videoHeight || 9;
        const height = Math.max(1, Math.round(width * (vh / vw)));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          clearTimeout(timeout);
          finish(null);
          return;
        }
        ctx.drawImage(video, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            clearTimeout(timeout);
            finish(blob || null);
          },
          "image/jpeg",
          0.82,
        );
      } catch {
        clearTimeout(timeout);
        finish(null);
      }
    };

    video.onerror = () => {
      clearTimeout(timeout);
      finish(null);
    };

    video.onloadeddata = () => {
      const duration = video.duration;
      const time =
        Number.isFinite(duration) && duration > 0
          ? Math.min(seekTime, Math.max(duration * 0.1, 0.1))
          : 0.1;
      if (Math.abs(video.currentTime - time) < 0.05) {
        capture();
      } else {
        video.currentTime = time;
      }
    };

    video.onseeked = capture;

    video.src = src;
    video.load();
  });
}

export function blobToDataUrl(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => resolve("");
    reader.readAsDataURL(blob);
  });
}
