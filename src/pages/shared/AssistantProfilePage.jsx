export const route = {
  path: ['/:instructorId/profiles/assistants/:assistantId', '/:instructorId/parent/profiles/assistants/:assistantId'],
  index: false,
  auth: 'required',
  roles: ['parent', 'admin'],
  title: 'ملف المساعد',
};

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Avatar from '../../components/ui/Avatar';
import profileService from '../../services/profileService';

function errorMessage(error) {
  if (error?.status === 403) return 'ليس لديك صلاحية لعرض ملف هذا المساعد.';
  if (error?.status === 404) return 'المساعد غير موجود أو لم يعد مرتبطاً بحسابك.';
  return error?.message || 'تعذر تحميل ملف المساعد. حاول مرة أخرى.';
}

export default function AssistantProfilePage() {
  const { assistantId } = useParams();
  const [assistant, setAssistant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    profileService.getAssistantProfile(assistantId)
      .then((response) => {
        if (active) setAssistant(response?.data?.data || null);
      })
      .catch((requestError) => {
        if (active) setError(errorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [assistantId]);

  if (loading) return <div className="rounded-2xl bg-surface-default p-6 text-center text-ink-500 shadow-card">جارٍ تحميل ملف المساعد...</div>;
  if (error) return <div role="alert" className="rounded-2xl bg-danger-soft p-6 text-center text-danger-DEFAULT">{error}</div>;
  if (!assistant) return <div role="alert" className="rounded-2xl bg-danger-soft p-6 text-center text-danger-DEFAULT">تعذر العثور على بيانات المساعد.</div>;

  return (
    <div className="mx-auto max-w-2xl" dir="rtl">
      <section className="rounded-[var(--radius-xl)] bg-surface-default p-7 text-center shadow-card">
        <Avatar avatarUrl={assistant.avatarUrl} name={assistant.name} size="lg" />
        <h1 className="mt-4 text-2xl font-extrabold text-ink-900">{assistant.name}</h1>
        <p className="mt-1 text-sm text-ink-500">{assistant.role === 'assistant' ? 'مساعد تعليمي' : assistant.role}</p>
        <p className="mt-6 rounded-xl bg-surface-muted p-4 text-sm leading-7 text-ink-700">{assistant.bio || 'لا توجد نبذة متاحة حالياً.'}</p>
      </section>
    </div>
  );
}
