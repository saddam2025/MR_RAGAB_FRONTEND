import * as tus from 'tus-js-client';

// The headers here are Bunny's short-lived, video-specific presigned headers
// received from our API. The Bunny master API key is never present in browser
// code or sent to the browser.
export function uploadVideoToBunny(file, upload, onProgress) {
  return new Promise((resolve, reject) => {
    const transfer = new tus.Upload(file, {
      endpoint: upload.endpoint,
      headers: upload.headers,
      metadata: { filename: file.name, filetype: file.type },
      retryDelays: [0, 3000, 5000, 10000, 20000],
      removeFingerprintOnSuccess: true,
      onError: reject,
      onProgress: (uploaded, total) => {
        if (total > 0 && onProgress) onProgress(Math.round((uploaded * 100) / total));
      },
      onSuccess: resolve
    });
    transfer.start();
  });
}
