# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Arabic ↔ English Translator

- Translation runs locally in a Web Worker with Transformers.js and the quantized ONNX models `Xenova/opus-mt-ar-en` and `Xenova/opus-mt-en-ar`. Both directions begin downloading automatically when the translator gets near the viewport; no manual download is needed. Together, the first download is roughly 200–300 MB plus about 22 MB for the ONNX runtime. Transformers.js caches model files in the browser Cache API; the runtime is cached separately.
- The UI supports Arabic/English auto-detection, manual direction swapping, inputs up to 500 characters, sequential sentence translation, copy, and browser speech voices in en-US/en-GB with normal/slow playback. A single English word can show cached phonetics and dictionary definitions from the free Dictionary API; dictionary details and its optional audio fallback need an internet connection unless already cached locally.
- Browser support requires WebAssembly, module Web Workers, and the Cache API for persistent model caching. The first model download requires internet access; after it completes, the cached model can translate without network access as long as the browser retains its cache. Device storage policies may evict cached files.
- To change a model, update its model ID in `src/features/translator/translatorUtils.js` and confirm that the replacement publishes Transformers.js-compatible ONNX weights. To add an optional paid translation provider later, add it behind the translator client interface (`createTranslatorClient`) without changing the UI.
- Run the focused utility and browser-service wrapper tests with `npm run test:translator`.
