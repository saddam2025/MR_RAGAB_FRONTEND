export const route = { path: ['/:instructorId/admin/standalone-exams/new', '/:instructorId/admin/standalone-exams/:examId/edit'], index: false, auth: 'required', roles: ['admin', 'assistant'], title: 'إنشاء امتحان' };
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StandaloneExamForm from '../../components/admin/StandaloneExamForm';
export default function StandaloneExamEditorPage() { const { instructorId, examId } = useParams(); const navigate = useNavigate(); const goToManagement = () => navigate(`/${instructorId}/admin/standalone-exams`, { replace: true }); return <div dir="rtl" className="mx-auto max-w-5xl"><StandaloneExamForm instructorId={instructorId} examId={examId} onSaved={goToManagement} onCancel={goToManagement} /></div>; }
