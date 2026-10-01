import test from 'node:test';
import assert from 'node:assert/strict';
import { createTranslatorClient, fetchEnglishWordDetails, getEnglishVoices, speakEnglishText } from './translatorClient.js';
import { detectTranslationDirection, isSingleEnglishWord, splitIntoSentences, validateTranslationInput } from './translatorUtils.js';

test('detects Arabic text and defaults to English for non-Arabic input', () => {
  assert.equal(detectTranslationDirection('مرحبا'), 'ar-en');
  assert.equal(detectTranslationDirection('Hello 123'), 'en-ar');
});

test('validates the 500 character input limit and splits long sentences sequentially', () => {
  assert.equal(validateTranslationInput('a'.repeat(500)).valid, true);
  assert.deepEqual(validateTranslationInput('a'.repeat(501)), { valid: false, reason: 'too-long' });
  const chunks = splitIntoSentences(`${'a'.repeat(480)}. ${'b'.repeat(80)}?`);
  assert.ok(chunks.length >= 2);
  assert.ok(chunks.every((chunk) => chunk.length <= 500));
  assert.deepEqual(splitIntoSentences('First. Second!'), ['First.', 'Second!']);
});

test('translator client runs sentence chunks one after another in a worker', async () => {
  const requests = [];
  class MockWorker {
    listeners = {};
    addEventListener(name, callback) { this.listeners[name] = callback; }
    postMessage(message) {
      requests.push(message.text);
      queueMicrotask(() => this.listeners.message({ data: { id: message.id, type: 'result', text: message.text.toUpperCase() } }));
    }
    terminate() {}
  }
  const client = createTranslatorClient(() => new MockWorker());
  const translated = await client.translate('hello. world!', 'en-ar');
  assert.equal(translated, 'HELLO. WORLD!');
  assert.deepEqual(requests, ['hello.', 'world!']);
  client.terminate();
});

test('translator client preloads both language directions in the worker', async () => {
  let request;
  class MockWorker {
    listeners = {};
    addEventListener(name, callback) { this.listeners[name] = callback; }
    postMessage(message) {
      request = message;
      queueMicrotask(() => this.listeners.message({ data: { id: message.id, type: 'result', text: '' } }));
    }
    terminate() {}
  }
  const client = createTranslatorClient(() => new MockWorker());
  await client.preload();
  assert.equal(request.type, 'preload');
  assert.deepEqual(request.directions, ['ar-en', 'en-ar']);
  client.terminate();
});

test('speech service selects only US and UK English voices and supports slow speech', () => {
  const voices = [
    { lang: 'ar-EG', voiceURI: 'arabic' },
    { lang: 'en-US', voiceURI: 'us' },
    { lang: 'en-GB', voiceURI: 'uk' },
  ];
  const synthesis = { getVoices: () => voices, cancel() {}, speak(utterance) { this.lastUtterance = utterance; } };
  assert.deepEqual(getEnglishVoices(synthesis).map((voice) => voice.voiceURI), ['us', 'uk']);
  const result = speakEnglishText({
    text: 'Hello', voiceURI: 'uk', slow: true, synthesis,
    utteranceFactory: (text) => ({ text }),
  });
  assert.equal(result.status, 'spoken');
  assert.equal(synthesis.lastUtterance.rate, 0.7);
  assert.equal(synthesis.lastUtterance.voice.voiceURI, 'uk');
});

test('English single-word details are cached and unavailable dictionary data fails silently', async () => {
  assert.equal(isSingleEnglishWord("don't"), true);
  assert.equal(isSingleEnglishWord('two words'), false);
  const cache = new Map();
  const storage = { getItem: (key) => cache.get(key) || null, setItem: (key, value) => cache.set(key, value) };
  let fetchCount = 0;
  const fetchImpl = async () => {
    fetchCount += 1;
    return { ok: true, json: async () => [{ word: 'codexzzword', phonetics: [{ text: '/test/' }], meanings: [{ partOfSpeech: 'noun', definitions: [{ definition: 'A test word.', example: 'A test.' }] }] }] };
  };
  const first = await fetchEnglishWordDetails('codexzzword', { fetchImpl, storage });
  const second = await fetchEnglishWordDetails('codexzzword', { fetchImpl, storage });
  assert.deepEqual(second, first);
  assert.equal(fetchCount, 1);
  assert.equal(await fetchEnglishWordDetails('offlinezzword', { fetchImpl: async () => { throw new Error('offline'); }, storage: null }), null);
});
