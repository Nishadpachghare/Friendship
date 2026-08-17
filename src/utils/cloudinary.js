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
    // If it's a Cloudinary video URL, convert extension to .jpg and add start-offset so_0
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

  const timestamp = Math.floor(Date.now() / 1000);

  // Build signed parameters
  // Cloudinary requires signing parameters in alphabetical order
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
        // If signed upload failed due to preset or permissions, attempt unsigned fallback if preset configured
        const errorMsg = response?.error?.message || `Upload failed with status ${xhr.status}`;
        console.warn('Cloudinary upload error:', errorMsg);

        if (CLOUDINARY_CONFIG.uploadPreset && !xhr.__retryUnsigned) {
          try {
            console.info('Attempting fallback to unsigned upload preset:', CLOUDINARY_CONFIG.uploadPreset);
            const fallbackFormData = new FormData();
            fallbackFormData.append('file', file);
            fallbackFormData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
            if (folder) fallbackFormData.append('folder', folder);

            const fallbackRes = await fetch(uploadUrl, {
              method: 'POST',
              body: fallbackFormData,
            });
            const fallbackData = await fallbackRes.json();
            if (fallbackRes.ok) {
              let thumb = '';
              if (fallbackData.resource_type === 'video' || resourceType === 'video') {
                thumb = getCloudinaryVideoThumbnail(fallbackData.secure_url);
              }
              return resolve({
                url: fallbackData.url,
                secure_url: fallbackData.secure_url,
                public_id: fallbackData.public_id,
                resource_type: fallbackData.resource_type || resourceType,
                format: fallbackData.format,
                width: fallbackData.width,
                height: fallbackData.height,
                duration: fallbackData.duration,
                thumbnail_url: thumb,
              });
            }
          } catch (fallbackErr) {
            console.error('Unsigned fallback failed:', fallbackErr);
          }
        }

        reject(new Error(errorMsg));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error while uploading to Cloudinary.'));
    };

    xhr.send(formData);
  });
}
