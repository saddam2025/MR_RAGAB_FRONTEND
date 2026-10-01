import { MAX_TRANSLATION_CHARS, splitIntoSentences, validateTranslationInput } from './translatorUtils.js';

export function createTranslatorClient(workerFactory) {
  let worker = null;
  let nextId = 1;
  const pending = new Map();

  const getWorker = () => {
    if (worker) return worker;
    worker = workerFactory();
    worker.addEventListener('message', ({ data }) => {
      const request = pending.get(data?.id);
      if (!request) return;
      if (data.type === 'progress') {
        request.onProgress?.(data.progress);
        return;
      }
      if (data.type === 'result') {
        pending.delete(data.id);
        request.resolve(data.text);
      } else if (data.type === 'error') {
        pending.delete(data.id);
        request.reject(new Error(data.message || 'تعذر إتمام الترجمة.'));
      }
    });
    worker.addEventListener('error', (event) => {
      const error = new Error(event.message || 'تعذر تشغيل محرك الترجمة.');
      pending.forEach(({ reject }) => reject(error));
      pending.clear();
      worker?.terminate?.();
      worker = null;
    });
    return worker;
  };

  const translateChunk = (text, direction, onProgress) => new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject, onProgress });
    getWorker().postMessage({ id, type: 'translate', text, direction });
  });

  const preloadModels = (onProgress) => new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject, onProgress });
    getWorker().postMessage({ id, type: 'preload', directions: ['ar-en', 'en-ar'] });
  });

  return {
    preload: preloadModels,
    async translate(text, direction, onProgress) {
      const validation = validateTranslationInput(text);
      if (!validation.valid) {
        const message = validation.reason === 'too-long'
          ? `الحد الأقصى للنص ${MAX_TRANSLATION_CHARS} حرفًا.`
          : 'اكتب كلمة أو جملة للترجمة.';
        throw new Error(message);
      }

      const chunks = splitIntoSentences(validation.value);
      const translations = [];
      for (let index = 0; index < chunks.length; index += 1) {
        onProgress?.({ phase: 'translating', current: index + 1, total: chunks.length });
        translations.push(await translateChunk(chunks[index], direction, onProgress));
      }
      return translations.join(' ');
    },
    terminate() {
      worker?.terminate?.();
      worker = null;
      pending.forEach(({ reject }) => reject(new Error('تم إيقاف الترجمة.')));
      pending.clear();
    },
  };
}

export function getEnglishVoices(synthesis = globalThis.speechSynthesis) {
  if (!synthesis?.getVoices) return [];
  return synthesis.getVoices().filter((voice) => /^(en-US|en-GB)(-|$)/i.test(voice.lang || ''));
}

export function speakEnglishText({ text, voiceURI, slow = false, synthesis = globalThis.speechSynthesis, utteranceFactory = null }) {
  if (!text?.trim()) return { status: 'empty' };
  if (!synthesis?.speak || (!utteranceFactory && typeof SpeechSynthesisUtterance === 'undefined')) return { status: 'unavailable' };
  const voices = getEnglishVoices(synthesis);
  if (!voices.length) return { status: 'no-voice' };

  const utterance = utteranceFactory ? utteranceFactory(text.trim()) : new SpeechSynthesisUtterance(text.trim());
  utterance.lang = 'en-US';
  utterance.rate = slow ? 0.7 : 1;
  utterance.voice = voices.find((voice) => voice.voiceURI === voiceURI) || voices[0];
  synthesis.cancel?.();
  synthesis.speak(utterance);
  return { status: 'spoken' };
}

const wordDetailsMemoryCache = new Map();

export async function fetchEnglishWordDetails(word, { fetchImpl = globalThis.fetch, storage = globalThis.localStorage } = {}) {
  const normalizedWord = String(word || '').trim().toLowerCase();
  if (!/^[a-z]+(?:['-][a-z]+)*$/.test(normalizedWord)) return null;
  if (wordDetailsMemoryCache.has(normalizedWord)) return wordDetailsMemoryCache.get(normalizedWord);

  const cacheKey = `translator:dictionary:${normalizedWord}`;
  try {
    const cached = storage?.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      wordDetailsMemoryCache.set(normalizedWord, parsed);
      return parsed;
    }
  } catch {
    // A blocked or malformed localStorage cache must not affect translation.
  }

  try {
    const response = await fetchImpl(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(normalizedWord)}`);
    if (!response.ok) return null;
    const entries = await response.json();
    const entry = entries?.[0];
    if (!entry) return null;
    const phonetic = entry.phonetics?.find((item) => item.text)?.text || '';
    const audio = entry.phonetics?.find((item) => item.audio)?.audio || '';
    const meanings = (entry.meanings || []).slice(0, 2).map((meaning) => ({
      partOfSpeech: meaning.partOfSpeech || '',
      definitions: (meaning.definitions || []).slice(0, 2).map((definition) => ({
        text: definition.definition || '',
        example: definition.example || '',
      })).filter((definition) => definition.text),
    })).filter((meaning) => meaning.definitions.length);
    const details = { word: entry.word || normalizedWord, phonetic, audio, meanings };
    wordDetailsMemoryCache.set(normalizedWord, details);
    try { storage?.setItem(cacheKey, JSON.stringify(details)); } catch { /* cache is optional */ }
    return details;
  } catch {
    return null;
  }
}
