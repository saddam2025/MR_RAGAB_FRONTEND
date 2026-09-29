export const route = {
  path: '/:instructorId/courses/:courseId/lectures/:lectureId/assignments',
  index: false,
  auth: 'required',
  roles: ['student'],
  title: 'تسليم الواجب',
};

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import api, { resolveApiAssetUrl } from '../../services/api';

export default function AssignmentSubmissionPage() {
  const { instructorId, courseId, lectureId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [course, setCourse] = useState(null);
  const [file, setFile] = useState(null);
  const [submissionNote, setSubmissionNote] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [mineResponse, courseResponse] = await Promise.all([
          api.get(`/courses/${courseId}/lectures/${lectureId}/assignments/mine`, {
            headers: { 'Cache-Control': 'no-cache' },
            params: { _: Date.now() }
          }),
          api.post(`/courses/${courseId}/lectures/${lectureId}/start-view`),
        ]);
        if (!active) return;
        const mine = mineResponse.data.data;
        setAssignment(mine);
        setSubmissionNote(mine?.submissionNote || '');
        setCourse(courseResponse.data.data.lecture);
      } catch (err) {
        if (active) setError(err?.message || 'تعذر تحميل بيانات الواجب.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [courseId, instructorId, lectureId]);

  const selectFile = (nextFile) => {
    if (!nextFile) return;
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(nextFile.type) || nextFile.size > 10 * 1024 * 1024) {
      setError('الملف يجب أن يكون PDF أو Word أو JPG أو PNG أو WebP وبحد أقصى 10 ميغابايت.');
      return;
    }
    setError(null);
    setFile(nextFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!file && !submissionNote.trim()) {
      setError('أرفق ملفاً أو أضف ملاحظة للتسليم.');
      return;
    }
    const formData = new FormData();
    if (file) formData.append('assignment', file);
    formData.append('submissionNote', submissionNote);
    setSubmitting(true);
    try {
      const response = await api.post(`/courses/${courseId}/lectures/${lectureId}/assignments/submit`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setAssignment(response.data.data);
      setFile(null);
      setSuccess('تم تسليم الواجب بنجاح وهو الآن بانتظار المراجعة.');
    } catch (err) {
      if (err?.status === 409) {
        try {
          const mineResponse = await api.get(`/courses/${courseId}/lectures/${lectureId}/assignments/mine`, {
            headers: { 'Cache-Control': 'no-cache' },
            params: { _: Date.now() }
          });
          setAssignment(mineResponse.data.data);
          setFile(null);
          setSuccess('تم تسجيل التسليم بالفعل وهو الآن بانتظار التقييم.');
          return;
        } catch (refreshError) {
          setError(refreshError?.message || 'تم تسجيل التسليم، لكن تعذر تحديث حالته. أعد تحميل الصفحة.');
          return;
        }
      }
      setError(err?.message || 'فشل تسليم الواجب. حاول مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  const status = assignment?.status;
  const showFeedback = status === 'graded' || status === 'resubmit';
  const canSubmit = !assignment || status === 'resubmit';
  if (loading) return <div dir="rtl" className="max-w-3xl mx-auto p-6 text-ink-600">جارٍ تحميل الواجب...</div>;

  return <div dir="rtl" className="max-w-3xl mx-auto space-y-6">
    <div><h1 className="text-xl font-semibold text-ink-900">واجب: {course?.title_ar || 'المحاضرة'}</h1></div>
    <section className="bg-surface-default rounded-2xl shadow-card p-6 space-y-4"><h2 className="text-lg font-semibold text-ink-900">التعليمات</h2><p className="text-sm text-ink-600 leading-relaxed">{course?.description_ar || 'ارفع حل الواجب أو أضف ملاحظاتك ثم أرسله للمراجعة.'}</p>{course?.homeworkUrl && <a href={resolveApiAssetUrl(course.homeworkUrl)} download><Button variant="ghost" size="sm">تحميل المرفقات</Button></a>}</section>
    {showFeedback && <section className="bg-surface-default rounded-2xl shadow-card p-6 space-y-3"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-ink-900">تقييم الواجب</h2>{assignment.grade != null && <Badge variant={status === 'graded' ? 'success' : 'danger'}>الدرجة: {assignment.grade}</Badge>}</div>{assignment.feedback && <p className="text-sm text-ink-600 leading-relaxed">{assignment.feedback}</p>}</section>}
    <section className="bg-surface-default rounded-2xl shadow-card p-6 space-y-4"><h2 className="text-lg font-semibold text-ink-900">تسليم الواجب</h2>{success && <div className="rounded-md p-3 bg-success-soft text-success-DEFAULT text-sm">{success}</div>}{error && <div className="rounded-md p-3 bg-danger-soft text-danger-DEFAULT text-sm">{error}</div>}{assignment?.submissionFileUrl && <a className="text-sm text-brand-700 underline" href={resolveApiAssetUrl(assignment.submissionFileUrl)} target="_blank" rel="noreferrer">عرض الملف المُسلَّم حالياً</a>}
      {canSubmit ? <form onSubmit={handleSubmit} className="space-y-4"><div onDragOver={(e) => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDrop={(e) => { e.preventDefault(); setDragActive(false); selectFile(e.dataTransfer.files?.[0]); }} className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${dragActive ? 'border-brand-500 bg-brand-50' : 'border-surface-border bg-surface-muted'}`}><p className="text-sm text-ink-500">{file ? file.name : 'اسحب الملف هنا أو اختر ملفاً'}</p><label className="inline-block mt-3"><span className="cursor-pointer text-sm text-brand-700 underline">اختر ملفاً</span><input type="file" className="hidden" accept=".pdf,.doc,.docx,image/jpeg,image/png,image/webp" onChange={(e) => selectFile(e.target.files?.[0])} /></label></div><div><label htmlFor="submissionNote" className="block text-sm font-medium text-ink-700 mb-1">ملاحظات التسليم</label><textarea id="submissionNote" value={submissionNote} onChange={(e) => setSubmissionNote(e.target.value)} rows={4} maxLength={5000} className="input w-full" placeholder="أضف أي ملاحظات حول حلك..." /></div><Button type="submit" variant="primary" disabled={submitting}>{submitting ? 'جارٍ التسليم...' : assignment ? 'إعادة تسليم الواجب' : 'تسليم الواجب'}</Button></form> : <div className="space-y-4"><p className="text-sm text-ink-600">{status === 'pending' ? 'تم تسليم الواجب وهو بانتظار التصحيح.' : 'تم تسليم الواجب ولا يمكن تغييره حالياً.'}</p><Button type="button" variant="primary" onClick={() => navigate(`/${instructorId}/assignment-grades`)}>شوف درجة الواجب</Button></div>}
    </section>
  </div>;
}
