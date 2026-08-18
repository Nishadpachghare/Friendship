import { CLOUDINARY_CONFIG } from '../config/cloudinary.js';

// ─── IndexedDB blob store for local video/image fallback ──────────────────────
const MEDIA_DB_NAME  = 'ourstory_media_v1';
const MEDIA_DB_STORE = 'blobs';

function openMediaDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(MEDIA_DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(MEDIA_DB_STORE)) {
        req.result.createObjectStore(MEDIA_DB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror  = () => reject(req.error);
  });
}

async function saveBlobToMediaDb(key, blob) {
  const db = await openMediaDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_DB_STORE, 'readwrite');
    tx.objectStore(MEDIA_DB_STORE).put(blob, key);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror    = () => { db.close(); reject(tx.error); };
  });
}

export async function getBlobFromMediaDb(key) {
  const db = await openMediaDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_DB_STORE, 'readonly');
    const req = tx.objectStore(MEDIA_DB_STORE).get(key);
    req.onsuccess = () => { db.close(); resolve(req.result || null); };
    req.onerror   = () => { db.close(); reject(req.error); };
  });
}

export async function deleteBlobFromMediaDb(key) {
  try {
    const db = await openMediaDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(MEDIA_DB_STORE, 'readwrite');
      tx.objectStore(MEDIA_DB_STORE).delete(key);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror    = () => { db.close(); reject(tx.error); };
    });
  } catch { /* silent */ }
}

// ─── Local URL scheme ──────────────────────────────────────────────────────────
// We use a custom scheme  "localblob://<key>"  to identify locally stored blobs.
// When rendering, resolve this to an object URL via getBlobFromMediaDb.
export const LOCAL_BLOB_SCHEME = 'localblob://';

export function isLocalBlobUrl(url) {
  return typeof url === 'string' && url.startsWith(LOCAL_BLOB_SCHEME);
}

/**
 * Resolves a localblob:// URL to a real object URL.
 * IMPORTANT: caller must call URL.revokeObjectURL() when done.
 */
export async function resolveLocalBlobUrl(url) {
  if (!isLocalBlobUrl(url)) return url;
  const key = url.slice(LOCAL_BLOB_SCHEME.length);
  const blob = await getBlobFromMediaDb(key);
  if (!blob) return '';
  return URL.createObjectURL(blob);
}

// ─── SHA-1 helper ─────────────────────────────────────────────────────────────
async function generateSha1(message) {
  const msgUint8   = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
  const hashArray  = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ─── Cloudinary URL helpers ───────────────────────────────────────────────────
export function getCloudinaryVideoThumbnail(videoUrl) {
  if (!videoUrl || typeof videoUrl !== 'string') return '';
  if (!videoUrl.includes('cloudinary.com')) return '';
  try {
    let url = videoUrl.replace(/\.[^/.]+$/, '.jpg');
    if (url.includes('/video/upload/') && !url.includes('/so_0/')) {
      url = url.replace('/video/upload/', '/video/upload/so_0,q_auto,f_auto/');
    }
    return url;
  } catch {
    return videoUrl.replace(/\.[^/.]+$/, '.jpg');
  }
}

export function getOptimizedCloudinaryUrl(url, { width, quality = 'auto' } = {}) {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return url;
  const transforms  = [`f_auto`, `q_${quality}`];
  if (width) transforms.push(`w_${width}`);
  const transformStr = transforms.join(',') + '/';
  if (url.includes('/upload/') && !url.includes(transformStr)) {
    return url.replace('/upload/', `/upload/${transformStr}`);
  }
  return url;
}

// ─── Image compression (Canvas API) ──────────────────────────────────────────
export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

export async function compressImage(file, maxPx = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img       = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        if (width >= height) { height = Math.round((height * maxPx) / width); width = maxPx; }
        else                 { width  = Math.round((width  * maxPx) / height); height = maxPx; }
      }
      const canvas = document.createElement('canvas');
      canvas.width  = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => { if (blob) resolve(blob); else reject(new Error('Canvas compression failed')); },
        'image/jpeg', quality,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Image load failed')); };
    img.src = objectUrl;
  });
}

export async function compressImageForLocal(file) {
  return compressImage(file, 800, 0.65);
}

// ─── Unsigned preset helper ───────────────────────────────────────────────────
async function tryUnsignedUpload(uploadUrl, file, preset, folder, resourceType) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);
  if (folder) formData.append('folder', folder);

  const res  = await fetch(uploadUrl, { method: 'POST', body: formData });
  const data = await res.json();
  if (!res.ok) return null;

  let thumb = '';
  if (data.resource_type === 'video' || resourceType === 'video') {
    thumb = getCloudinaryVideoThumbnail(data.secure_url);
  }
  return {
    url: data.url, secure_url: data.secure_url, public_id: data.public_id,
    resource_type: data.resource_type || resourceType,
    format: data.format, width: data.width, height: data.height,
    duration: data.duration, thumbnail_url: thumb, storedLocally: false,
  };
}

// ─── Signed upload via XHR (with progress) ───────────────────────────────────
function trySignedUpload(uploadUrl, file, folder, apiKey, apiSecret, resourceType, onProgress) {
  return new Promise(async (resolve, reject) => {
    const timestamp  = Math.floor(Date.now() / 1000);
    const params     = folder
      ? `folder=${folder}&timestamp=${timestamp}`
      : `timestamp=${timestamp}`;
    const signature  = await generateSha1(params + apiSecret);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    if (folder) formData.append('folder', folder);
    formData.append('signature', signature);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadUrl, true);

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }

    xhr.onload = () => {
      let response;
      try { response = JSON.parse(xhr.responseText); } catch {
        return reject(new Error('Invalid Cloudinary response'));
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        let thumbnailUrl = '';
        if (response.resource_type === 'video' || resourceType === 'video') {
          thumbnailUrl = getCloudinaryVideoThumbnail(response.secure_url);
        }
        resolve({
          url: response.url, secure_url: response.secure_url,
          public_id: response.public_id, resource_type: response.resource_type || resourceType,
          format: response.format, width: response.width, height: response.height,
          duration: response.duration, thumbnail_url: thumbnailUrl, storedLocally: false,
        });
      } else {
        reject(new Error(response?.error?.message || `Status ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(formData);
  });
}

// ─── Local fallback: store blob in IndexedDB & return base64 data URL ─────────
async function storeLocally(file, resourceType, onProgress) {
  if (onProgress) onProgress(20);

  // For images: compress first
  let blobToStore = file;
  if (resourceType === 'image' && (file instanceof File || file instanceof Blob)) {
    try { blobToStore = await compressImage(file); } catch { blobToStore = file; }
  }

  if (onProgress) onProgress(60);
  const dataUrl = await readFileAsDataUrl(blobToStore);
  if (onProgress) onProgress(100);

  const key = `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  try { await saveBlobToMediaDb(key, blobToStore); } catch {}

  return {
    url: dataUrl,
    secure_url: dataUrl,
    public_id: key,
    resource_type: resourceType,
    format: file.type?.split('/')[1] || '',
    storedLocally: true,
    thumbnail_url: resourceType === 'video' ? '' : dataUrl,
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────
/**
 * Uploads a file to Cloudinary (unsigned preset → signed → local IndexedDB blob).
 * Images are auto-compressed with Canvas before upload (~10x smaller).
 */
export async function uploadToCloudinary(file, options = {}) {
  const {
    onProgress        = null,
    folder            = CLOUDINARY_CONFIG.folder || 'friendship_story',
    resourceType: customResourceType = null,
  } = options;

  if (!file) throw new Error('No file provided.');

  // Determine resource type
  let resourceType = customResourceType;
  if (!resourceType) {
    if (file instanceof Blob || file instanceof File) {
      resourceType = file.type.startsWith('video/') ? 'video' : 'image';
    } else {
      resourceType = 'image';
    }
  }

  const cloudName = CLOUDINARY_CONFIG.cloudName;
  const apiKey    = CLOUDINARY_CONFIG.apiKey;
  const apiSecret = CLOUDINARY_CONFIG.apiSecret;
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  // Auto-compress images before upload (skips videos — browser can't compress them)
  let fileToUpload = file;
  if (resourceType === 'image' && file instanceof File) {
    try {
      const orig = (file.size / 1024 / 1024).toFixed(1);
      const compressed = await compressImage(file);
      console.info(`[Cloudinary] Image: ${orig}MB → ${(compressed.size/1024/1024).toFixed(1)}MB`);
      fileToUpload = compressed;
    } catch { /* use original */ }
  }

  // ── 1. Try unsigned presets ──────────────────────────────────────────────
  const presets = [CLOUDINARY_CONFIG.uploadPreset, 'friendship_preset', 'ml_default', 'friendship']
    .filter(Boolean);

  for (const preset of presets) {
    try {
      const result = await tryUnsignedUpload(uploadUrl, fileToUpload, preset, folder, resourceType);
      if (result) { if (onProgress) onProgress(100); return result; }
    } catch { /* next */ }
  }

  // ── 2. Try signed upload ─────────────────────────────────────────────────
  try {
    const result = await trySignedUpload(uploadUrl, fileToUpload, folder, apiKey, apiSecret, resourceType, onProgress);
    if (result) return result;
  } catch { /* fall through */ }

  // ── 3. Local fallback — save blob to IndexedDB ───────────────────────────
  console.info(
    '[Memory] Cloudinary not configured — saving locally.\n' +
    'To enable cloud uploads: console.cloudinary.com → Settings → Upload → ' +
    'Upload Presets → Add "friendship_preset" (Unsigned).'
  );
  return storeLocally(file, resourceType, onProgress);
}
