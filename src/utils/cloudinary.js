import { CLOUDINARY_CONFIG } from '../config/cloudinary.js';

/**
 * Calculates SHA-1 hex hash using the browser's Web Crypto API
 */
async function generateSha1(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Derives a video thumbnail image URL from a Cloudinary video URL
 * Cloudinary can extract any frame as an image by changing extension to .jpg or adding `so_0`
 */
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

/**
 * Optimizes an image URL with Cloudinary transformations (auto format & quality)
 */
export function getOptimizedCloudinaryUrl(url, { width, quality = 'auto' } = {}) {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) {
    return url;
  }
  const transforms = [`f_auto`, `q_${quality}`];
  if (width) transforms.push(`w_${width}`);
  const transformStr = transforms.join(',') + '/';

  if (url.includes('/upload/') && !url.includes(transformStr)) {
    return url.replace('/upload/', `/upload/${transformStr}`);
  }
  return url;
}

/**
 * Helper to upload via unsigned preset
 */
async function tryUnsignedUpload(uploadUrl, file, preset, folder, resourceType) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);
  if (folder) formData.append('folder', folder);

  const res = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (res.ok) {
    let thumb = '';
    if (data.resource_type === 'video' || resourceType === 'video') {
      thumb = getCloudinaryVideoThumbnail(data.secure_url);
    }
    return {
      url: data.url,
      secure_url: data.secure_url,
      public_id: data.public_id,
      resource_type: data.resource_type || resourceType,
      format: data.format,
      width: data.width,
      height: data.height,
      duration: data.duration,
      thumbnail_url: thumb,
    };
  }
  return null;
}

/**
 * Uploads an image or video file directly to Cloudinary
 * 
 * @param {File|Blob|string} file - The file, blob, or data URL to upload
 * @param {Object} options - Upload options
 * @param {Function} [options.onProgress] - Callback for upload progress (0 - 100)
 * @param {string} [options.folder] - Custom folder in Cloudinary
 * @param {string} [options.resourceType] - 'image' | 'video' | 'auto'
 * @returns {Promise<{ secure_url: string, public_id: string, resource_type: string, thumbnail_url: string }>}
 */
export async function uploadToCloudinary(file, options = {}) {
  const {
    onProgress = null,
    folder = CLOUDINARY_CONFIG.folder || 'friendship_story',
    resourceType: customResourceType = null,
  } = options;

  if (!file) {
    throw new Error('No file provided for upload.');
  }

  // Determine resource type: 'video' or 'image'
  let resourceType = customResourceType;
  if (!resourceType) {
    if (file instanceof Blob || file instanceof File) {
      resourceType = file.type.startsWith('video/') ? 'video' : 'image';
    } else if (typeof file === 'string' && file.startsWith('data:video/')) {
      resourceType = 'video';
    } else {
      resourceType = 'image';
    }
  }

  const cloudName = CLOUDINARY_CONFIG.cloudName;
  const apiKey = CLOUDINARY_CONFIG.apiKey;
  const apiSecret = CLOUDINARY_CONFIG.apiSecret;
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  // First try unsigned presets if configured
  const candidatePresets = [
    CLOUDINARY_CONFIG.uploadPreset,
    'friendship_preset',
    'ml_default',
    'friendship',
  ].filter(Boolean);

  for (const preset of candidatePresets) {
    try {
      const result = await tryUnsignedUpload(uploadUrl, file, preset, folder, resourceType);
      if (result) {
        if (onProgress) onProgress(100);
        return result;
      }
    } catch {
      // Continue to signed attempt
    }
  }

  // Fallback to signed upload
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = [];
  if (folder) {
    paramsToSign.push(`folder=${folder}`);
  }
  paramsToSign.push(`timestamp=${timestamp}`);

  const stringToSign = paramsToSign.join('&') + apiSecret;
  const signature = await generateSha1(stringToSign);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  if (folder) {
    formData.append('folder', folder);
  }
  formData.append('signature', signature);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadUrl, true);

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = async () => {
      let response;
      try {
        response = JSON.parse(xhr.responseText);
      } catch (err) {
        return reject(new Error('Invalid response from Cloudinary server.'));
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        let thumbnailUrl = '';
        if (response.resource_type === 'video' || resourceType === 'video') {
          thumbnailUrl = getCloudinaryVideoThumbnail(response.secure_url);
        }

        resolve({
          url: response.url,
          secure_url: response.secure_url,
          public_id: response.public_id,
          resource_type: response.resource_type || resourceType,
          format: response.format,
          width: response.width,
          height: response.height,
          duration: response.duration,
          thumbnail_url: thumbnailUrl,
        });
      } else {
        const rawMsg = response?.error?.message || `Upload failed with status ${xhr.status}`;
        console.warn('Cloudinary upload error:', rawMsg);

        if (rawMsg.includes('missing permissions') || rawMsg.includes('actions=["create"]')) {
          reject(
            new Error(
              'Cloudinary permission missing: Please create an Unsigned Upload Preset named "friendship_preset" in your Cloudinary Settings -> Upload -> Upload Presets (or grant "Create" permission to your API Key).'
            )
          );
        } else {
          reject(new Error(rawMsg));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error while uploading to Cloudinary.'));
    };

    xhr.send(formData);
  });
}
