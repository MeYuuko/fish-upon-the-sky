const MEDIA_BUCKET = 'media';

export function dataUrlToBlob(dataUrl, { maxWidth = 1600, quality = 0.85 } = {}) {
  return new Promise((resolve, reject) => {
    const src = String(dataUrl || '');
    const isPng = src.startsWith('data:image/png');
    const contentType = isPng ? 'image/png' : 'image/jpeg';
    const ext = isPng ? 'png' : 'jpg';

    const img = new Image();
    img.onerror = () => reject(new Error('Không đọc được dữ liệu ảnh để tải lên.'));
    img.onload = () => {
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
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Không thể nén ảnh trước khi tải lên.'));
            return;
          }
          resolve({ blob, ext, contentType });
        },
        contentType,
        isPng ? undefined : quality,
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
