export const MAX_TRANSLATION_CHARS = 500;

export const TRANSLATION_MODELS = Object.freeze({
  'ar-en': 'Xenova/opus-mt-ar-en',
  'en-ar': 'Xenova/opus-mt-en-ar',
});

export function detectTranslationDirection(text = '') {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/u.test(text) ? 'ar-en' : 'en-ar';
}

export function getTranslationDirection(text, override) {
  return override || detectTranslationDirection(text);
}

export function validateTranslationInput(text) {
  const value = String(text ?? '').trim();
  if (!value) return { valid: false, reason: 'empty' };
  if (value.length > MAX_TRANSLATION_CHARS) return { valid: false, reason: 'too-long' };
  return { valid: true, value };
}

export function splitIntoSentences(text, maxChunkLength = MAX_TRANSLATION_CHARS) {
  const normalized = String(text ?? '').trim();
  if (!normalized) return [];

  const sentences = normalized.split(/(?<=[.!?؟。])\s+/u).filter(Boolean);
  const chunks = [];

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;
    if (trimmed.length > maxChunkLength) {
      for (let offset = 0; offset < trimmed.length; offset += maxChunkLength) {
        chunks.push(trimmed.slice(offset, offset + maxChunkLength).trim());
      }
      continue;
    }
    chunks.push(trimmed);
  }
  return chunks;
}

export function isSingleEnglishWord(text = '') {
  return /^[A-Za-z]+(?:['-][A-Za-z]+)*$/.test(String(text).trim());
}
