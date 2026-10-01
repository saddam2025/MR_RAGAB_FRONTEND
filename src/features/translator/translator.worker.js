import { env, pipeline } from '@huggingface/transformers';
import wasmModuleUrl from '../../../node_modules/@huggingface/transformers/dist/ort-wasm-simd-threaded.jsep.mjs?url';
import wasmBinaryUrl from '../../../node_modules/@huggingface/transformers/dist/ort-wasm-simd-threaded.jsep.wasm?url';
import { TRANSLATION_MODELS } from './translatorUtils.js';

env.useBrowserCache = true;
env.backends.onnx.wasm.numThreads = 1;
env.backends.onnx.wasm.wasmPaths = { mjs: wasmModuleUrl, wasm: wasmBinaryUrl };

const pipelines = new Map();
let runtimeReady = null;

async function prepareRuntime() {
  if (!runtimeReady) {
    runtimeReady = (async () => {
      const wasmCache = 'ragab-translator-runtime-v1';
      let response;
      if (typeof caches !== 'undefined') {
        const cache = await caches.open(wasmCache);
        response = await cache.match(wasmBinaryUrl);
        if (!response) {
          const downloaded = await fetch(wasmBinaryUrl);
          if (!downloaded.ok) throw new Error('تعذر تنزيل محرك الترجمة على هذا الجهاز.');
          await cache.put(wasmBinaryUrl, downloaded.clone());
          response = downloaded;
        }
      } else {
        response = await fetch(wasmBinaryUrl);
        if (!response.ok) throw new Error('تعذر تنزيل محرك الترجمة على هذا الجهاز.');
      }
      env.backends.onnx.wasm.wasmBinary = await response.arrayBuffer();
    })().catch((error) => {
      runtimeReady = null;
      throw error;
    });
  }
  return runtimeReady;
}

async function getPipeline(direction, id) {
  if (!pipelines.has(direction)) {
    if (typeof WebAssembly === 'undefined') throw new Error('WEBASSEMBLY_UNAVAILABLE');
    const task = pipeline('translation', TRANSLATION_MODELS[direction], {
      dtype: 'q8',
      progress_callback: (progress) => self.postMessage({ id, type: 'progress', progress }),
    });
    pipelines.set(direction, task);
    task.catch(() => pipelines.delete(direction));
  }
  return pipelines.get(direction);
}

self.addEventListener('message', async ({ data }) => {
  if (!['translate', 'preload'].includes(data?.type)) return;
  try {
    if (typeof WebAssembly === 'undefined') throw new Error('WEBASSEMBLY_UNAVAILABLE');
    await prepareRuntime();
    if (data.type === 'preload') {
      for (const direction of data.directions || []) {
        if (!TRANSLATION_MODELS[direction]) throw new Error('اتجاه الترجمة غير مدعوم.');
        await getPipeline(direction, data.id);
      }
      self.postMessage({ id: data.id, type: 'result', text: '' });
    } else {
      if (!TRANSLATION_MODELS[data.direction]) throw new Error('اتجاه الترجمة غير مدعوم.');
      const translator = await getPipeline(data.direction, data.id);
      const result = await translator(data.text, { max_new_tokens: 160 });
      self.postMessage({ id: data.id, type: 'result', text: result?.[0]?.translation_text || '' });
    }
  } catch (error) {
    const rawMessage = error?.message || '';
    const message = rawMessage === 'WEBASSEMBLY_UNAVAILABLE'
      ? 'متصفحك لا يدعم WebAssembly اللازم للترجمة. حدّث المتصفح أو جرّب متصفحًا أحدث.'
      : /memory|allocation|oom/i.test(rawMessage)
        ? 'مساحة الذاكرة غير كافية لتشغيل المترجم على هذا الجهاز. أغلق بعض التطبيقات وحاول مرة أخرى.'
        : /fetch|network|download|load failed|failed to/i.test(rawMessage)
          ? 'تعذر تحميل نموذج أو محرك الترجمة. تحقق من اتصال الإنترنت ثم حاول مرة أخرى.'
          : rawMessage || 'فشل تنزيل أو تشغيل نموذج الترجمة. حاول مرة أخرى.';
    self.postMessage({ id: data.id, type: 'error', message });
  }
});
