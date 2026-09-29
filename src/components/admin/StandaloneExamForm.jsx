import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import QuestionBuilder from './QuestionBuilder';
import { STAGES } from '../../constants/stages';
import { resolveApiAssetUrl } from '../../services/api';
import standaloneExamAdminService from '../../services/standaloneExamAdminService';

const blankQuestion = () => ({ id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, text: '', stemType: 'text', imageUrl: null, options: ['', '', '', ''], correctOptionIndex: 0, points: 1 });
const blankExam = () => ({ title: '', stage: STAGES[0].id, durationMinutes: 60, questions: [blankQuestion()], thumbnailUrl: null });

export default function StandaloneExamForm({ instructorId, examId, onSaved, onCancel }) {
  const [draft, setDraft] = useState(blankExam);
  const [thumbnail, setThumbnail] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(Boolean(examId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  useEffect(() => {
    let active = true;
    if (!examId) { setDraft(blankExam()); setThumbnail(null); setLoading(false); return () => { active = false; }; }
    setLoading(true); setError('');
    standaloneExamAdminService.get(instructorId, examId).then((response) => { if (active) { const exam = response.data.data; setDraft({ ...exam, questions: exam.questions.map((question) => ({ ...question, id: question._id || question.id })) }); } }).catch((requestError) => { if (active) setError(requestError?.message || 'تعذر تحميل الامتحان.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [instructorId, examId]);
  const updateQuestion = (index, patch) => setDraft((current) => ({ ...current, questions: current.questions.map((question, questionIndex) => questionIndex === index ? { ...question, ...patch } : question) }));
  const updateOption = (questionIndex, optionIndex, value) => setDraft((current) => ({ ...current, questions: current.questions.map((question, index) => index === questionIndex ? { ...question, options: question.options.map((option, optIndex) => optIndex === optionIndex ? value : option) } : question) }));
  const addQuestion = () => setDraft((current) => ({ ...current, questions: [...current.questions, blankQuestion()] }));
  const removeQuestion = (index) => setDraft((current) => ({ ...current, questions: current.questions.filter((_, questionIndex) => questionIndex !== index) }));
  const validate = () => { const next = {}; if (!draft.title.trim()) next.title = 'عنوان الامتحان مطلوب'; if (!STAGES.some((stage) => stage.id === draft.stage)) next.stage = 'المرحلة غير صالحة'; if (!Number.isInteger(Number(draft.durationMinutes)) || Number(draft.durationMinutes) < 1) next.durationMinutes = 'المدة يجب أن تكون دقيقة واحدة على الأقل'; if (!draft.questions.length) next.questions = 'أضف سؤالاً واحداً على الأقل'; draft.questions.forEach((question, index) => { if (question.stemType === 'image' ? !question.imageUrl : !question.text.trim()) next[`q-${index}-text`] = question.stemType === 'image' ? 'ارفع صورة السؤال أولاً' : 'نص السؤال مطلوب'; question.options.forEach((option, optIndex) => { if (!option.trim()) next[`q-${index}-opt-${optIndex}`] = 'مطلوب'; }); }); setErrors(next); return Object.keys(next).length === 0; };
  const fieldsForSave = () => ({ title: draft.title.trim(), stage: draft.stage, durationMinutes: Number(draft.durationMinutes), questions: draft.questions.map(({ text, stemType, imageUrl, options, correctOptionIndex, points }) => ({ text: (stemType === 'image' ? '' : text).trim(), stemType: stemType || 'text', imageUrl: stemType === 'image' ? imageUrl : null, options: options.map((option) => option.trim()), correctOptionIndex, points: Number(points) || 1 })) });
  const normalizedExam = (exam) => ({ ...exam, questions: exam.questions.map((question) => ({ ...question, id: question._id || question.id })) });
  const saveExam = () => draft._id
    ? standaloneExamAdminService.update(instructorId, draft._id, fieldsForSave(), thumbnail)
    : standaloneExamAdminService.create(instructorId, fieldsForSave(), thumbnail);
  const save = async () => {
    if (!validate()) return;
    setSaving(true); setError(''); setSuccess('');
    try { const response = await saveExam(); const saved = response.data.data; setSuccess(draft._id ? 'تم حفظ تعديلات الامتحان.' : 'تم حفظ الامتحان كمسودة بنجاح. يمكنك إنشاء امتحان جديد الآن.'); setThumbnail(null); if (!draft._id) setDraft(blankExam()); else setDraft(normalizedExam(saved)); onSaved?.(saved); } catch (requestError) { setError(requestError?.message || 'تعذر حفظ الامتحان.'); } finally { setSaving(false); }
  };
  const publishNow = async () => {
    if (!draft._id && !validate()) return;
    setSaving(true); setError(''); setSuccess('');
    let saved = draft._id ? draft : null;
    try {
      if (!saved) {
        const createResponse = await saveExam();
        saved = createResponse.data.data;
      }
      const publishResponse = await standaloneExamAdminService.publish(instructorId, saved._id);
      const published = publishResponse.data.data;
      setThumbnail(null); setDraft(normalizedExam(published));
      setSuccess('تم حفظ الامتحان ونشره بنجاح، وهو متاح الآن للطلاب في مرحلته.');
      onSaved?.(published);
    } catch (requestError) {
      if (saved?._id) {
        setThumbnail(null); setDraft(normalizedExam(saved));
        setError('تم حفظ الامتحان كمسودة، لكن تعذر نشره. يمكنك المحاولة مرة أخرى من هذه الصفحة أو من صفحة الإدارة.');
        onSaved?.(saved);
      } else {
        setError(requestError?.message || 'تعذر حفظ الامتحان ونشره.');
      }
    } finally { setSaving(false); }
  };
  const preview = useMemo(() => thumbnail ? URL.createObjectURL(thumbnail) : draft.thumbnailUrl ? resolveApiAssetUrl(draft.thumbnailUrl) : null, [thumbnail, draft.thumbnailUrl]);
  if (loading) return <p className="rounded-2xl bg-surface-default p-6 text-ink-500 shadow-card">جارٍ تحميل الامتحان...</p>;
  return <section className="space-y-6 rounded-2xl bg-surface-muted p-5 shadow-card"><header className="flex items-center justify-between gap-4"><div><h1 className="text-2xl font-bold text-ink-900">{examId ? 'تعديل امتحان' : 'إنشاء امتحان'}</h1><p className="mt-1 text-sm text-ink-500">احفظ كمسودة أو انشر الامتحان مباشرةً للطلاب في مرحلته.</p></div>{onCancel && <Button type="button" variant="subtle" onClick={onCancel}>العودة للإدارة</Button>}</header>{error && <p role="alert" className="rounded-xl bg-danger-soft p-4 text-danger-DEFAULT">{error}</p>}{success && <p role="status" className="rounded-xl bg-success-soft p-4 text-success-DEFAULT">{success}</p>}<div className="grid gap-4 md:grid-cols-2"><div><label className="mb-1 block text-sm text-ink-700">العنوان</label><Input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} error={errors.title} /></div><div><label className="mb-1 block text-sm text-ink-700">المرحلة</label><select className="input w-full" value={draft.stage} onChange={(event) => setDraft({ ...draft, stage: event.target.value })}>{STAGES.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}</select>{errors.stage && <p className="mt-1 text-xs text-danger-DEFAULT">{errors.stage}</p>}</div><div><label className="mb-1 block text-sm text-ink-700">المدة بالدقائق</label><Input type="number" min={1} value={draft.durationMinutes} onChange={(event) => setDraft({ ...draft, durationMinutes: event.target.value })} error={errors.durationMinutes} /></div><div><label className="mb-1 block text-sm text-ink-700">صورة الامتحان</label><input type="file" accept="image/*" className="block w-full text-sm text-ink-700" onChange={(event) => setThumbnail(event.target.files?.[0] || null)} />{preview && <img src={preview} alt="معاينة صورة الامتحان" className="mt-3 h-28 w-44 rounded-xl object-cover" />}</div></div><QuestionBuilder instructorId={instructorId} scope="exam" questions={draft.questions} errors={errors} onUpdateQuestion={updateQuestion} onUpdateOption={updateOption} onAddQuestion={addQuestion} onRemoveQuestion={removeQuestion} showExplanation={false} /><div className="flex flex-wrap justify-end gap-3"><Button type="button" variant="subtle" onClick={save} disabled={saving}>{saving ? 'جارٍ الحفظ...' : 'حفظ كمسودة'}</Button><Button type="button" onClick={publishNow} disabled={saving}>{saving ? 'جارٍ الحفظ...' : 'نشر الامتحان الآن'}</Button></div></section>;
}
StandaloneExamForm.propTypes = { instructorId: PropTypes.string.isRequired, examId: PropTypes.string, onSaved: PropTypes.func, onCancel: PropTypes.func };
