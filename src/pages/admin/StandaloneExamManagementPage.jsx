export const route = { path: '/:instructorId/admin/standalone-exams', index: false, auth: 'required', roles: ['admin', 'assistant'], title: 'إدارة الامتحانات المنفصلة' };

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { stageLabel } from '../../constants/stages';
import { resolveApiAssetUrl } from '../../services/api';
import standaloneExamAdminService from '../../services/standaloneExamAdminService';

const statusMeta = { draft: ['مسودة', 'neutral'], published: ['منشور', 'success'], closed: ['معلّق', 'danger'] };

export default function StandaloneExamManagementPage() {
  const { instructorId } = useParams();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const load = async () => { setLoading(true); setError(''); try { const response = await standaloneExamAdminService.list(instructorId); setExams(response.data?.data || []); } catch (requestError) { setError(requestError?.message || 'تعذر تحميل الامتحانات.'); } finally { setLoading(false); } };
  useEffect(() => { load(); }, [instructorId]);
  const runAction = async () => { const { type, exam } = pendingAction; setBusy(true); setError(''); try { if (type === 'publish') await standaloneExamAdminService.publish(instructorId, exam._id); if (type === 'close') await standaloneExamAdminService.close(instructorId, exam._id); if (type === 'delete') await standaloneExamAdminService.remove(instructorId, exam._id); setPendingAction(null); await load(); } catch (requestError) { setPendingAction(null); setError(requestError?.message || 'تعذر تنفيذ الإجراء.'); } finally { setBusy(false); } };
  const copy = pendingAction?.type === 'delete' ? ['حذف الامتحان', `سيتم حذف «${pendingAction.exam.title}» نهائياً.`, 'حذف'] : pendingAction?.type === 'publish' ? ['نشر الامتحان', `سيصبح «${pendingAction.exam.title}» متاحاً للطلاب في مرحلته.`, 'نشر'] : ['تعليق الامتحان', `لن يتمكن الطلاب من بدء «${pendingAction?.exam.title}» بعد التعليق، وستبقى الدرجات محفوظة.`, 'تعليق'];
  return <div dir="rtl" className="mx-auto max-w-6xl space-y-6"><header className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-bold text-ink-900">إدارة الامتحانات المنفصلة</h1><p className="mt-1 text-sm text-ink-500">نشر وتعليق وحذف الامتحانات المحفوظة.</p></div><Button onClick={() => navigate(`/${instructorId}/admin/standalone-exams/new`)}>+ إنشاء امتحان جديد</Button></header>{error && <p role="alert" className="rounded-xl bg-danger-soft p-4 text-danger-DEFAULT">{error}</p>}{loading ? <p className="rounded-2xl bg-surface-default p-6 text-ink-500 shadow-card">جارٍ تحميل الامتحانات...</p> : <section className="grid gap-4 md:grid-cols-2">{exams.map((exam) => { const [label, variant] = statusMeta[exam.status] || statusMeta.draft; return <article key={exam._id} className="overflow-hidden rounded-2xl bg-surface-default shadow-card"><button type="button" className="flex w-full gap-4 p-5 text-right" onClick={() => navigate(`/${instructorId}/admin/standalone-exams/${exam._id}/edit`)}>{exam.thumbnailUrl ? <img src={resolveApiAssetUrl(exam.thumbnailUrl)} alt="" className="h-20 w-24 rounded-xl object-cover" /> : <div className="grid h-20 w-24 place-items-center rounded-xl bg-surface-muted text-2xl">📝</div>}<div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate font-bold text-ink-900">{exam.title}</h2><Badge variant={variant}>{label}</Badge></div><p className="mt-2 text-sm text-ink-600">{stageLabel(exam.stage)} · {exam.durationMinutes} دقيقة · {exam.questions?.length || 0} أسئلة</p></div></button><div className="flex flex-wrap gap-2 border-t border-surface-border p-4"><Button size="sm" variant="subtle" onClick={() => navigate(`/${instructorId}/admin/standalone-exams/${exam._id}/edit`)}>تعديل</Button>{exam.status !== 'published' && <Button size="sm" onClick={() => setPendingAction({ type: 'publish', exam })}>نشر</Button>}{exam.status !== 'closed' && <Button size="sm" variant="subtle" onClick={() => setPendingAction({ type: 'close', exam })}>تعليق</Button>}<Button size="sm" variant="danger" onClick={() => setPendingAction({ type: 'delete', exam })}>حذف</Button></div></article>; })}{exams.length === 0 && <p className="rounded-2xl bg-surface-default p-8 text-center text-ink-500 shadow-card md:col-span-2">لا توجد امتحانات منفصلة بعد.</p>}</section>}{pendingAction && <ConfirmModal title={copy[0]} description={copy[1]} confirmLabel={copy[2]} busy={busy} onConfirm={runAction} onCancel={() => setPendingAction(null)} />}</div>;
}
