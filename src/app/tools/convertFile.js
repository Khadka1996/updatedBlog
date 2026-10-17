'use client';

export const MAX_CONVERT_BYTES = 50 * 1024 * 1024;

/**
 * Upload `file` to /api/convert/<endpoint> and resolve with the converted
 * file as a Blob. Reports upload progress (0-100) through `onProgress`.
 * Rejects with an Error whose message is safe to show to the user.
 */
export function convertOnServer(endpoint, file, onProgress) {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_CONVERT_BYTES) {
      reject(new Error('File is too large. Maximum size is 50MB.'));
      return;
    }
    const body = new FormData();
    body.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/api/convert/${endpoint}`);
    xhr.responseType = 'blob';
    xhr.timeout = 5 * 60 * 1000;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
        return;
      }
      let message = 'Conversion failed. Please try again.';
      try {
        const data = JSON.parse(await xhr.response.text());
        if (data?.message) message = data.message;
      } catch {}
      if (xhr.status === 429) message = 'Too many conversions. Please wait a few minutes and try again.';
      if (xhr.status === 413) message = 'File is too large. Maximum size is 50MB.';
      reject(new Error(message));
    };
    xhr.onerror = () => reject(new Error('Network error. Check your connection and try again.'));
    xhr.ontimeout = () => reject(new Error('The conversion took too long. Please try a smaller file.'));
    xhr.send(body);
  });
}

/** "report.final.pdf" -> "report.final.docx" */
export const swapExtension = (name, ext) => `${name.replace(/\.[^./\\]+$/, '') || 'document'}.${ext}`;
