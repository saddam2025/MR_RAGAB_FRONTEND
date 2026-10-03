import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ConfirmModal from '../ui/ConfirmModal';
import lectureService from '../../services/lectureService';
import { uploadVideoToBunny } from '../../services/bunnyUploadService';
import { resolveApiAssetUrl } from '../../services/api';

const blank = (order = 1) => ({ title_ar: '', title_en: '', description_ar: '', description_en: '', order, price: '', isFree: false, isPublished: false, quizId: '', thumbnail: null, video: null, homework: null });
const fieldClasses = 'w-full rounded-md border border-surface-border bg-surface-default px-3 py-2 text-sm text-ink-900';

export default function LectureManager({ instructorId, courseId }) {
  const navigate = useNavigate();
  const [lectures, setLectures] = useState([]);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [videoProgress, setVideoProgress] = useState(null);

  const load = async () => {
    try { setLectures((await lectureService.list(instructorId, courseId)).data.data || []); } catch (err) { setError(err?.message || 'تعذر تحميل المحاضرات.'); }
  };
  useEffect(() => { load(); }, [instructorId, courseId]);
  const change = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const save = async () => {
    if (!draft?.title_ar?.trim()) return setError('عنوان المحاضرة بالعربية مطلوب.');
    if (draft.video && !['video/mp4', 'video/webm'].includes(draft.video.type)) return setError('يُقبل فيديو MP4 أو WebM فقط.');
    setSaving(true); setError(''); setVideoProgress(null);
    try {
      const fields = { ...draft, price: draft.isFree ? 0 : Number(draft.price) || 0 };
      const files = { thumbnail: draft.thumbnail, homework: draft.homework };
      delete fields.thumbnail; delete fields.video; delete fields.homework; delete fields.isFree; delete fields.order;
      const saved = draft._id ? await lectureService.update(instructorId, courseId, draft._id, fields, files) : await lectureService.create(instructorId, courseId, fields, files);
      const lecture = saved.data.data;
      if (draft.video) {
        const initialized = await lectureService.initVideoUpload(instructorId, courseId, lecture._id, draft.video.name);
        await uploadVideoToBunny(draft.video, initialized.data.data.upload, setVideoProgress);
        await lectureService.confirmVideoUpload(instructorId, courseId, lecture._id, initialized.data.data.uploadId);
      }
      setDraft(null); await load();
    } catch (err) { setError(err?.message || 'تعذر حفظ المحاضرة أو رفع الفيديو.'); }
    finally { setSaving(false); setVideoProgress(null); }
  };
  const move = async (index, direction) => {
    const next = [...lectures]; const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]]; setLectures(next);
    try { const response = await lectureService.reorder(instructorId, courseId, next.map((lecture) => lecture._id)); setLectures(response.data.data || []); } catch (err) { setError(err?.message || 'تعذر تغيير الترتيب.'); load(); }
  };
  const confirmDelete = async () => { try { await lectureService.remove(instructorId, courseId, removing._id); setRemoving(null); await load(); } catch (err) { setError(err?.message || 'تعذر حذف المحاضرة.'); } };

  return <section className="rounded-2xl bg-surface-default p-6 shadow-card space-y-4">
    <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">محاضرات الدورة</h2><p className="text-sm text-ink-500">تُضاف المحاضرات تلقائياً في نهاية الترتيب، ويمكن تغيير ترتيبها بالسهمين. لكل محاضرة وسائطها وسعرها المستقلان.</p></div><Button type="button" onClick={() => setDraft(blank(lectures.length + 1))}>إضافة محاضرة</Button></div>
    {error && <p role="alert" className="rounded bg-danger-soft p-3 text-sm text-danger-DEFAULT">{error}</p>}
    {draft && <div className="space-y-3 rounded-xl border border-brand-300 p-4"><h3 className="font-semibold">{draft._id ? 'تعديل المحاضرة' : 'محاضرة جديدة'}</h3><div className="grid grid-cols-1 gap-3 md:grid-cols-2"><Input required value={draft.title_ar} onChange={(e) => change('title_ar', e.target.value)} placeholder="العنوان بالعربية" /><Input value={draft.title_en} onChange={(e) => change('title_en', e.target.value)} placeholder="العنوان بالإنجليزية" /><textarea className={fieldClasses} value={draft.description_ar} onChange={(e) => change('description_ar', e.target.value)} placeholder="الوصف بالعربية" /><textarea className={fieldClasses} value={draft.description_en} onChange={(e) => change('description_en', e.target.value)} placeholder="الوصف بالإنجليزية" /><Input type="number" min="0" disabled={draft.isFree} value={draft.price} onChange={(e) => change('price', e.target.value)} placeholder="السعر" /><label className="text-sm">صورة المحاضرة<input className="mt-1 block" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => change('thumbnail', e.target.files?.[0] || null)} /></label><label className="text-sm">فيديو المحاضرة<input className="mt-1 block" type="file" accept="video/mp4,video/webm" onChange={(e) => change('video', e.target.files?.[0] || null)} /></label><label className="text-sm">مرفق الواجب<input className="mt-1 block" type="file" accept=".pdf,.doc,.docx" onChange={(e) => change('homework', e.target.files?.[0] || null)} /></label></div>{videoProgress !== null && <div role="status" className="text-sm text-ink-600">جارٍ رفع الفيديو مباشرةً إلى Bunny Stream: {videoProgress}%<progress className="mt-1 block h-2 w-full" value={videoProgress} max="100" /></div>}<div className="flex gap-5 text-sm"><label><input type="checkbox" checked={draft.isFree} onChange={(e) => { change('isFree', e.target.checked); if (e.target.checked) change('price', 0); }} /> مجانية</label><label><input type="checkbox" checked={draft.isPublished} onChange={(e) => change('isPublished', e.target.checked)} /> منشورة</label></div><div className="flex gap-2"><Button type="button" onClick={save} disabled={saving}>{saving ? 'جارٍ الحفظ...' : 'حفظ المحاضرة'}</Button><Button type="button" variant="subtle" onClick={() => setDraft(null)}>إلغاء</Button></div></div>}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {lectures.map((lecture, index) => <article key={lecture._id} className="group overflow-hidden rounded-3xl border border-surface-border bg-surface-default shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft">
        <div className="relative aspect-[16/9] overflow-hidden bg-surface-muted">{lecture.thumbnailUrl ? <img src={resolveApiAssetUrl(lecture.thumbnailUrl)} alt={lecture.title_ar || lecture.title_en} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center text-4xl text-brand-500" aria-label="لا توجد صورة للمحاضرة">📚</div>}<div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-transparent" /></div>
        <div className="space-y-3 p-4"><h3 className="min-h-12 line-clamp-2 text-base font-bold leading-6 text-ink-900">{lecture.order}. {lecture.title_ar || lecture.title_en}</h3><p className="text-sm text-ink-500">{Number(lecture.price) === 0 ? 'مجانية' : `${lecture.price} ج.م`} · {lecture.isPublished ? 'منشورة' : 'مسودة'}</p><div className="flex flex-wrap gap-2 border-t border-surface-border pt-3"><Button type="button" size="sm" variant="subtle" onClick={() => move(index, -1)} disabled={index === 0}>↑</Button><Button type="button" size="sm" variant="subtle" onClick={() => move(index, 1)} disabled={index === lectures.length - 1}>↓</Button><Button type="button" size="sm" variant="subtle" onClick={() => navigate(`/${instructorId}/admin/courses/${courseId}/lectures/${lecture._id}/quizzes/manage`)}>الاختبار</Button><Button type="button" size="sm" variant="subtle" onClick={() => setDraft({ ...lecture, isFree: Number(lecture.price) === 0, thumbnail: null, video: null, homework: null })}>تعديل</Button><Button type="button" size="sm" variant="danger" onClick={() => setRemoving(lecture)}>حذف</Button></div></div>
      </article>)}
      {lectures.length === 0 && <p className="text-sm text-ink-500">لا توجد محاضرات بعد.</p>}
    </div>
    {removing && <ConfirmModal title="حذف المحاضرة" description={`سيتم حذف «${removing.title_ar || removing.title_en}» نهائياً.`} confirmLabel="حذف" busy={false} onConfirm={confirmDelete} onCancel={() => setRemoving(null)} />}
  </section>;
}
