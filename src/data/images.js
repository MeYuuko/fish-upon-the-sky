const MEDIA_BUCKET = 'media';
const MEDIA_PUBLIC_PREFIX = '/storage/v1/object/public/media/';

let webpSupportCache;

function supportsWebp() {
  if (typeof webpSupportCache === 'boolean') return webpSupportCache;
  try {
    if (typeof document === 'undefined') {
      webpSupportCache = false;
      return false;
    }
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    webpSupportCache = canvas.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    webpSupportCache = false;
  }
  return webpSupportCache;
}

/**
 * Returns the preferred output mime type and extension for canvas exports.
 */
export function getPreferredImageFormat(preservePng = false) {
  if (preservePng) return { contentType: 'image/png', ext: 'png' };
  if (supportsWebp()) return { contentType: 'image/webp', ext: 'webp' };
  return { contentType: 'image/jpeg', ext: 'jpg' };
}

function extensionForMime(contentType) {
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  return 'jpg';
}

function decodeDataUrlToBlob(dataUrl) {
  const match = String(dataUrl || '').match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const contentType = match[1];
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return {
    blob: new Blob([bytes], { type: contentType }),
    contentType,
    ext: extensionForMime(contentType),
  };
}

/**
 * Decodes and resizes an image File via Object URL (avoids raw Base64 RAM spikes)
 * and returns a compressed Data URL in WebP (with JPEG/PNG fallback).
 */
export function compressImageFile(
  file,
  { maxWidth = 1600, quality = 0.82, preservePng = false } = {},
) {
  return new Promise((resolve, reject) => {
    if (!file || !String(file.type || '').startsWith('image/')) {
      reject(new Error('Please choose a valid image file (JPG, PNG, WEBP).'));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('This image could not be decoded.'));
    };

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, maxWidth / Math.max(1, img.width));
      const targetW = Math.max(1, Math.round(img.width * scale));
      const targetH = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas is unavailable in this browser.'));
        return;
      }
      ctx.drawImage(img, 0, 0, targetW, targetH);
      const isPng = String(file.type || '').includes('png');
      const { contentType } = getPreferredImageFormat(preservePng && isPng);
      const useLosslessPng = contentType === 'image/png';
      resolve(canvas.toDataURL(contentType, useLosslessPng ? undefined : quality));
    };

    img.src = objectUrl;
  });
}

export function dataUrlToBlob(dataUrl, { maxWidth = 1600, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    const src = String(dataUrl || '');
    const isPng = src.startsWith('data:image/png');
    const isAlreadyOptimizedMime =
      src.startsWith('data:image/webp') || src.startsWith('data:image/jpeg') || isPng;

    const img = new Image();
    img.onerror = () => reject(new Error('Không đọc được dữ liệu ảnh để tải lên.'));
    img.onload = () => {
      if (img.width <= maxWidth && isAlreadyOptimizedMime) {
        const decoded = decodeDataUrlToBlob(src);
        if (decoded) {
          resolve(decoded);
          return;
        }
      }

      const scale = Math.min(1, maxWidth / Math.max(1, img.width));
      const targetW = Math.max(1, Math.round(img.width * scale));
      const targetH = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Trình duyệt không hỗ trợ xử lý ảnh.'));
        return;
      }
      ctx.drawImage(img, 0, 0, targetW, targetH);
      const { contentType, ext } = getPreferredImageFormat(isPng);
      const useLosslessPng = contentType === 'image/png';
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Không thể nén ảnh trước khi tải lên.'));
            return;
          }
          resolve({ blob, ext, contentType });
        },
        contentType,
        useLosslessPng ? undefined : quality,
      );
    };
    img.src = src;
  });
}

export async function uploadImage(client, prefix, dataUrl, opts) {
  const src = String(dataUrl || '');
  if (!src.startsWith('data:')) return src;

  const { blob, ext, contentType } = await dataUrlToBlob(src, opts);
  const path = `${prefix}/${crypto.randomUUID()}.${ext}`;

  const { error } = await client.storage.from(MEDIA_BUCKET).upload(path, blob, {
    contentType,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw error;

  const { data } = client.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Extracts the relative storage path inside the `media` bucket from a public URL.
 */
export function extractMediaPath(publicUrl) {
  const raw = String(publicUrl || '');
  const idx = raw.indexOf(MEDIA_PUBLIC_PREFIX);
  if (idx === -1) return null;
  const afterPrefix = raw.slice(idx + MEDIA_PUBLIC_PREFIX.length).split(/[?#]/)[0];
  if (!afterPrefix) return null;
  try {
    return decodeURIComponent(afterPrefix);
  } catch {
    return afterPrefix;
  }
}

/**
 * Best-effort deletion of a file in the `media` bucket; ignores non-fatal errors.
 */
export async function deleteImage(client, publicUrl) {
  if (!client || !publicUrl) return;
  const path = extractMediaPath(publicUrl);
  if (!path) return;
  try {
    await client.storage.from(MEDIA_BUCKET).remove([path]);
  } catch {
    // Non-fatal: UI deletion should not fail if storage object was already removed
  }
}
