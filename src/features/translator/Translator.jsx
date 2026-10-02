import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeftRight, BookOpen, Check, Copy, Languages, LoaderCircle, Mic2, Sparkles, Volume2 } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { createTranslatorClient, fetchEnglishWordDetails, getEnglishVoices, speakEnglishText } from './translatorClient.js';
import { getTranslationDirection, isSingleEnglishWord, MAX_TRANSLATION_CHARS } from './translatorUtils.js';

const directionLabels = {
  'ar-en': { source: 'العربية', target: 'English', sourceCode: 'ar', targetCode: 'en' },
  'en-ar': { source: 'English', target: 'العربية', sourceCode: 'en', targetCode: 'ar' },
};

function friendlyProgress(progress) {
  if (typeof progress === 'number') return Math.min(100, Math.max(0, progress <= 1 ? progress * 100 : progress));
  const value = Number(progress?.progress);
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value <= 1 ? value * 100 : value)) : null;
}

export default function Translator({ variant = 'full', className = '' }) {
  const isCompact = variant === 'compact';
  const clientRef = useRef(null);
  const audioRef = useRef(null);
  const sectionRef = useRef(null);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [directionOverride, setDirectionOverride] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [voices, setVoices] = useState([]);
  const [voiceURI, setVoiceURI] = useState('');
  const [slowSpeech, setSlowSpeech] = useState(false);
  const [speechMessage, setSpeechMessage] = useState('');
  const [wordDetails, setWordDetails] = useState(null);

  const direction = getTranslationDirection(input, directionOverride);
  const labels = directionLabels[direction];
  const englishText = direction === 'en-ar' ? input.trim() : output.trim();
  const englishWord = isSingleEnglishWord(englishText) ? englishText : '';
  const downloadProgress = friendlyProgress(progress);

  if (!clientRef.current) {
    clientRef.current = createTranslatorClient(() => new Worker(new URL('./translator.worker.js', import.meta.url), { type: 'module' }));
  }

  useEffect(() => () => {
    clientRef.current?.terminate();
    audioRef.current?.pause?.();
  }, []);

  useEffect(() => {
    if (!globalThis.speechSynthesis) return undefined;
    const loadVoices = () => setVoices(getEnglishVoices());
    loadVoices();
    speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
    return () => speechSynthesis.removeEventListener?.('voiceschanged', loadVoices);
  }, []);

  useEffect(() => {
    if (voiceURI && !voices.some((voice) => voice.voiceURI === voiceURI)) setVoiceURI('');
  }, [voiceURI, voices]);

  useEffect(() => {
    let active = true;
    setWordDetails(null);
    if (!englishWord) return () => { active = false; };
    const timer = window.setTimeout(() => {
      fetchEnglishWordDetails(englishWord).then((details) => { if (active) setWordDetails(details); });
    }, 350);
    return () => { active = false; window.clearTimeout(timer); };
  }, [englishWord]);

  const translate = async (event) => {
    event?.preventDefault();
    setError('');
    setSpeechMessage('');
    setCopied(false);
    setOutput('');
    setProgress(null);
    setWordDetails(null);
    setLoading(true);
    try {
      const translated = await clientRef.current.translate(input, direction, setProgress);
      setOutput(translated);
    } catch (translationError) {
      setError(translationError?.message || 'تعذر إتمام الترجمة. حاول مرة أخرى.');
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  const swapDirection = () => {
    setDirectionOverride(direction === 'ar-en' ? 'en-ar' : 'ar-en');
    if (output) {
      setInput(output);
      setOutput(input);
    }
    setWordDetails(null);
    setError('');
  };

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('تعذر النسخ من هذا المتصفح. حدد النص وانسخه يدويًا.');
    }
  };

  const playEnglish = async () => {
    setSpeechMessage('');
    const result = speakEnglishText({ text: englishText, voiceURI, slow: slowSpeech });
    if (result.status === 'spoken') return;
    if (result.status === 'empty') {
      setSpeechMessage('اكتب أو ترجم نصًا إنجليزيًا أولًا.');
      return;
    }
    if (result.status === 'unavailable' || result.status === 'no-voice') {
      const details = englishWord ? wordDetails || await fetchEnglishWordDetails(englishWord) : null;
      if (details?.audio) {
        audioRef.current?.pause?.();
        audioRef.current = new Audio(details.audio);
        audioRef.current.play().catch(() => setSpeechMessage('لا يوجد صوت إنجليزي متاح على جهازك حاليًا.'));
      } else {
        setSpeechMessage(result.status === 'unavailable' ? 'النطق الصوتي غير مدعوم في هذا المتصفح.' : 'لا يوجد صوت إنجليزي على جهازك. اختر أو ثبّت صوتًا باللغة الإنجليزية.');
      }
    }
  };

  const samples = useMemo(() => ['Hello', 'Amazing', 'Beautiful', 'Review'], []);

  return (
    <section ref={sectionRef} dir="rtl" className={`relative overflow-hidden rounded-[2rem] border ${isCompact ? 'border-[#263448] bg-[#0b111c] text-white shadow-[0_24px_70px_rgba(0,0,0,.3)]' : 'border-surface-border bg-surface-default text-ink-900 shadow-card'} ${className}`} aria-labelledby="translator-title">
      <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-brand-500/10 blur-3xl" />
      <div className={`relative grid gap-6 p-4 sm:p-6 lg:gap-8 ${isCompact ? 'lg:grid-cols-[.9fr_1.1fr] lg:p-8' : 'lg:grid-cols-[1.15fr_.85fr] lg:p-9'}`}>
        <div className="order-1 flex flex-col justify-center text-right lg:pr-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1.5 text-xs font-bold text-brand-700 dark:text-brand-200"><Sparkles size={14} /> قاموس ناطق مجاني</span>
          <h2 id="translator-title" className={`mt-4 font-display font-extrabold leading-tight ${isCompact ? 'text-white text-2xl sm:text-3xl' : 'text-ink-900 text-3xl sm:text-4xl'}`}>
            اكتب أي كلمة... واسمع النطق
          </h2>
          <p className={`mt-3 max-w-xl text-sm leading-7 sm:text-base ${isCompact ? 'text-white/70' : 'text-ink-500'}`}>
            اكتب كلمة أو جملة بالعربية أو الإنجليزية، واعرف معناها واستمع إلى نطقها بسهولة.
          </p>
          <p className={`mt-2 max-w-xl text-xs leading-6 sm:text-sm ${isCompact ? 'text-white/60' : 'text-ink-500'}`}>
            {isCompact ? 'المترجم هدية من مستر رجب لطلابه، وهتلاقيه كمان في لوحة التحكم وقت ما تحتاجه.' : 'اختار اتجاه الترجمة أو اتركه تلقائيًا، ثم اكتب كلمة أو جملة قصيرة وابدأ.'}
          </p>
          {!isCompact && <div className="mt-5 flex flex-wrap gap-2" aria-label="أمثلة إنجليزية للتجربة">
            {samples.map((sample) => <button key={sample} type="button" onClick={() => { setInput(sample); setDirectionOverride('en-ar'); setOutput(''); }} className="rounded-full border border-surface-border bg-surface-muted px-3 py-1.5 text-xs text-ink-600 transition hover:border-brand-400 hover:text-brand-700">{sample}</button>)}
          </div>}
          <div className={`mt-5 flex flex-wrap items-center gap-2 text-[11px] sm:text-xs ${isCompact ? 'text-white/75' : 'text-ink-500'}`}>
            <span className={`rounded-full border px-3 py-1.5 ${isCompact ? 'border-white/10 bg-white/5' : 'border-surface-border bg-surface-muted'}`}>هدية من مستر رجب لطلابه</span>
            <span className={`rounded-full border px-3 py-1.5 ${isCompact ? 'border-white/10 bg-white/5' : 'border-surface-border bg-surface-muted'}`}>ترجمة ونطق في مكان واحد</span>
          </div>
        </div>

        <form onSubmit={translate} className={`order-2 rounded-[1.75rem] border p-4 sm:p-5 ${isCompact ? 'border-white/10 bg-[#111927] lg:order-2' : 'border-surface-border bg-surface-muted/70 lg:order-2'}`}>
          {isCompact && <div className="mb-3" role="status" aria-live="polite">
            <p className="text-[11px] text-white/65">هيتم تحميل نموذج اللغة المطلوبة عند أول ترجمة لتقليل استهلاك الذاكرة.</p>
          </div>}
          <div className="mb-4 flex items-center justify-between gap-3">
              <span className={`text-[11px] font-semibold uppercase tracking-[.16em] sm:text-xs ${isCompact ? 'text-white/55' : 'text-ink-500'}`}>Speaking Dictionary</span>
            <div className="flex items-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${isCompact ? 'border-white/10 text-white/75' : 'border-surface-border text-ink-600'}`}>{labels.source}</span>
              <button type="button" onClick={swapDirection} aria-label="تبديل لغة الترجمة" title="تبديل لغة الترجمة" className="grid h-9 w-9 place-items-center rounded-full border border-brand-500/30 text-brand-600 transition hover:bg-brand-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"><ArrowLeftRight size={17} /></button>
              <span className={`rounded-full border border-brand-500/50 bg-brand-500/10 px-3 py-1 text-xs font-semibold ${isCompact ? 'text-blue-200' : 'text-brand-700 dark:text-brand-200'}`}>{labels.target}</span>
            </div>
          </div>

          <label htmlFor={`translator-input-${variant}`} className="sr-only">النص المراد ترجمته</label>
          <textarea
            id={`translator-input-${variant}`}
            value={input}
            maxLength={MAX_TRANSLATION_CHARS}
            onChange={(event) => { setInput(event.target.value); setOutput(''); setError(''); setSpeechMessage(''); }}
            placeholder={labels.sourceCode === 'ar' ? 'اكتب كلمة أو جملة بالعربية...' : 'Type a word or a short sentence...'}
            dir={labels.sourceCode === 'ar' ? 'rtl' : 'ltr'}
            className={`min-h-28 w-full resize-y rounded-2xl border p-4 text-base leading-7 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${isCompact ? 'border-white/10 bg-[#0b111c] text-white placeholder:text-white/35' : 'border-surface-border bg-surface-default text-ink-900 placeholder:text-ink-400'}`}
            aria-describedby={`translator-input-help-${variant}`}
          />
          <div id={`translator-input-help-${variant}`} className={`mt-1 flex justify-between text-[11px] ${isCompact ? 'text-white/45' : 'text-ink-500'}`}><span>الحد الأقصى 500 حرف</span><span>{input.length}/500</span></div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={loading || !input.trim()} className="min-w-36">
              {loading ? <><LoaderCircle size={17} className="ml-2 inline animate-spin" />جاري الترجمة</> : <><Languages size={17} className="ml-2 inline" />ترجم الآن</>}
            </Button>
              <span className={`text-[11px] ${isCompact ? 'text-white/50' : 'text-ink-500'}`}>{directionOverride ? 'اتجاه يدوي' : 'تحديد تلقائي للغة'}</span>
          </div>

          {loading && <div className="mt-4" role="status" aria-live="polite">
            <div className="mb-2 flex justify-between gap-3 text-xs text-ink-500"><span>{downloadProgress === null ? 'تحميل النموذج أو معالجة النص لأول مرة...' : `تحميل النموذج ${Math.round(downloadProgress)}%`}</span><span>يُحمّل مرة واحدة لكل اتجاه</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-default"><div className={`h-full rounded-full bg-brand-500 transition-all duration-300 ${downloadProgress === null ? 'w-2/5 animate-pulse' : ''}`} style={downloadProgress === null ? undefined : { width: `${downloadProgress}%` }} /></div>
          </div>}
          {error && <p role="alert" className="mt-3 rounded-xl border border-danger-DEFAULT/20 bg-danger-soft p-3 text-sm text-danger-DEFAULT">{error}</p>}

          <div className={`mt-4 rounded-2xl border p-4 ${isCompact ? 'border-white/10 bg-[#151e2c]' : 'border-surface-border bg-surface-default'}`} aria-live="polite">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className={`text-xs font-bold ${isCompact ? 'text-white/55' : 'text-ink-500'}`}>الترجمة · {labels.target}</span>
              {output && <div className="flex items-center gap-2">
                {labels.targetCode === 'en' && <button type="button" onClick={playEnglish} aria-label="استمع إلى نطق الترجمة" className={`${isCompact ? 'inline-flex items-center gap-2 rounded-full bg-[#2164ff] px-4 py-2 text-white' : 'grid h-8 w-8 place-items-center rounded-full text-brand-600 hover:bg-brand-500/10'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500`}>{isCompact && 'استمع للنطق'}<Volume2 size={17} /></button>}
                <button type="button" onClick={copyOutput} aria-label="نسخ الترجمة" className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-ink-500 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'تم النسخ' : 'نسخ'}</button>
              </div>}
            </div>
            <p dir={labels.targetCode === 'ar' ? 'rtl' : 'ltr'} className={`whitespace-pre-wrap leading-7 ${isCompact ? 'min-h-28 py-3 text-center text-3xl font-extrabold text-white sm:text-4xl' : `min-h-12 text-base ${output ? 'text-ink-900' : 'text-ink-400'}`}`}>{output || 'ستظهر الترجمة هنا.'}</p>
            {isCompact && <div className="mx-auto mb-2 flex h-8 max-w-[280px] items-center justify-center gap-1" aria-hidden="true">{[14, 24, 18, 30, 20, 12, 23, 32, 16, 25, 14, 29, 18, 24, 12, 30, 20, 15, 26, 18, 11, 24].map((height, index) => <span key={index} className="w-1 rounded-full bg-[#2164ff]/80 animate-pulse" style={{ height, animationDelay: `${index * 35}ms` }} />)}</div>}
          </div>

          {labels.sourceCode === 'en' && input.trim() && <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-surface-default px-3 py-2">
            <button type="button" onClick={playEnglish} className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-500/10 dark:text-brand-200"><Volume2 size={16} />استمع للكلمة الإنجليزية</button>
            {voices.length > 0 && <select aria-label="اختيار الصوت الإنجليزي" value={voiceURI} onChange={(event) => setVoiceURI(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-surface-border bg-surface-default px-2 py-1.5 text-xs text-ink-700"><option value="">الصوت الافتراضي</option>{voices.map((voice) => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>)}</select>}
            <button type="button" aria-pressed={slowSpeech} onClick={() => setSlowSpeech((current) => !current)} className={`rounded-lg border px-2 py-1.5 text-xs ${slowSpeech ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-200' : 'border-surface-border text-ink-500'}`}>{slowSpeech ? 'بطيء 0.7×' : 'عادي 1×'}</button>
          </div>}
          {direction === 'ar-en' && output && <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-surface-default px-3 py-2">
            <button type="button" onClick={playEnglish} className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-500/10 dark:text-brand-200"><Volume2 size={16} />استمع للنطق الإنجليزي</button>
            {voices.length > 0 && <select aria-label="اختيار الصوت الإنجليزي" value={voiceURI} onChange={(event) => setVoiceURI(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-surface-border bg-surface-default px-2 py-1.5 text-xs text-ink-700"><option value="">الصوت الافتراضي</option>{voices.map((voice) => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>)}</select>}
            <button type="button" aria-pressed={slowSpeech} onClick={() => setSlowSpeech((current) => !current)} className={`rounded-lg border px-2 py-1.5 text-xs ${slowSpeech ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-200' : 'border-surface-border text-ink-500'}`}>{slowSpeech ? 'بطيء 0.7×' : 'عادي 1×'}</button>
          </div>}
          {speechMessage && <p role="status" className="mt-2 text-xs text-ink-500">{speechMessage}</p>}

          {wordDetails && englishWord && <article className="mt-3 rounded-2xl border border-brand-500/20 bg-brand-500/5 p-4" aria-label="تفاصيل الكلمة الإنجليزية">
            <div className="flex items-center gap-2 text-sm font-bold text-ink-900"><BookOpen size={16} className="text-brand-600" />{wordDetails.word}{wordDetails.phonetic && <span dir="ltr" className="font-normal text-ink-500">{wordDetails.phonetic}</span>}{wordDetails.audio && <button type="button" onClick={() => { audioRef.current = new Audio(wordDetails.audio); audioRef.current.play().catch(() => {}); }} aria-label="تشغيل نطق القاموس" className="text-brand-600"><Mic2 size={15} /></button>}</div>
            <div className="mt-2 space-y-2">{wordDetails.meanings.map((meaning, index) => <div key={`${meaning.partOfSpeech}-${index}`} className="text-xs leading-5 text-ink-600"><span className="font-semibold">{meaning.partOfSpeech}: </span>{meaning.definitions.map((definition, definitionIndex) => <span key={definitionIndex}>{definition.text}{definition.example && <span className="block text-ink-500">“{definition.example}”</span>}</span>)}</div>)}</div>
          </article>}
        </form>
      </div>
    </section>
  );
}
