// src/pages/parent/ParentActivityPage.jsx
export const route = {
  path: '/:instructorId/parent/activity',
  index: false,
  auth: 'parent',
  title: 'النشاط والرسائل'
};

import React, { useEffect, useRef, useState } from 'react';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import messageService from '../../services/messageService';

function formatDateTime(iso) {
  try {
    return new Date(iso).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export default function ParentActivityPage() {
  const { user } = useAuth();
  const messagesRef = useRef(null);
  const [child, setChild] = useState(null);
  const [activities, setActivities] = useState([]);
  const [assistant, setAssistant] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [messageError, setMessageError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [childResponse, activityResponse, conversationsResponse] = await Promise.all([
          api.get('/parents/me/child'),
          api.get('/parents/me/child/activity'),
          messageService.listConversations()
        ]);
        const nextChild = childResponse?.data?.data;
        const conversation = (conversationsResponse?.data?.data || []).find((item) => String(item.studentId) === String(nextChild?.id));
        if (!active) return;
        setChild(nextChild || null);
        setActivities(activityResponse?.data?.data?.items || []);
        if (!conversation?.assistantId) return;

        setAssistant({ id: conversation.assistantId, ...conversation.assistant });
        const threadResponse = await messageService.getThread(nextChild.id);
        if (active) setMessages(threadResponse?.data?.data || []);
      } catch (error) {
        if (active) setLoadError(error?.message || 'تعذر تحميل النشاط والرسائل.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    const body = inputValue.trim();
    if (!body || !assistant?.id || !child?.id || sending) return;
    setSending(true);
    setMessageError('');
    try {
      const response = await messageService.send({ toUserId: assistant.id, studentId: child.id, body });
      setMessages((items) => [...items, response?.data?.data].filter(Boolean));
      setInputValue('');
    } catch (error) {
      setMessageError(error?.message || 'تعذر إرسال الرسالة.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div dir="rtl" className="py-8 text-center text-sm text-ink-500">جارٍ تحميل النشاط...</div>;
  if (loadError || !child) return <div dir="rtl" role="alert" className="rounded-xl bg-danger-soft p-4 text-center text-sm text-danger-DEFAULT">{loadError || 'لا تتوفر بيانات الطالب.'}</div>;

  return (
    <div className="space-y-6" dir="rtl">
      <section className="rounded-2xl bg-surface-default shadow-card p-4 flex flex-col" style={{ minHeight: 320 }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {assistant && <Avatar src={assistant.avatarUrl} name={assistant.name} size="sm" linkToProfile userId={String(assistant.id)} profileType="assistant" />}
            <div><h2 className="text-lg font-semibold">{assistant?.name || 'مراسلة المساعد'}</h2><p className="text-xs text-ink-500">{assistant ? 'اضغط على الصورة لعرض الملف الشخصي' : 'لا توجد محادثة متاحة مع مساعد لهذا الطالب بعد.'}</p></div>
          </div>
          <div className="text-sm text-ink-500">{messages.length} رسالة</div>
        </div>

        <div ref={messagesRef} className="flex-1 overflow-auto space-y-3 p-2 border border-surface-border rounded-md bg-surface-default" style={{ maxHeight: 320 }}>
          {messages.length === 0 ? <div className="text-center text-ink-600 py-6">لا توجد رسائل بعد</div> : messages.map((message) => {
            const isMine = String(message.fromUserId) === String(user?._id || user?.id);
            return <div key={message._id} className={`max-w-full ${isMine ? 'ml-auto text-right' : 'mr-auto text-left'}`}><div className={`inline-block rounded-lg p-3 ${isMine ? 'bg-brand-50 text-ink-900' : 'bg-surface-muted text-ink-900'}`}><div className="text-sm">{message.body}</div><div className="text-xs text-ink-500 mt-2">{formatDateTime(message.createdAt)}</div></div></div>;
          })}
        </div>

        {messageError && <p role="alert" className="mt-2 text-sm text-danger-DEFAULT">{messageError}</p>}
        <div className="mt-3 flex items-center gap-3"><Input value={inputValue} onChange={(event) => setInputValue(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} placeholder={assistant ? 'اكتب رسالة...' : 'لا يوجد مساعد متاح للمراسلة'} className="flex-1" dir="rtl" disabled={!assistant || sending} /><Button variant="primary" onClick={sendMessage} disabled={!assistant || sending}>{sending ? 'جارٍ الإرسال...' : 'إرسال'}</Button></div>
      </section>

      <section className="rounded-2xl bg-surface-default shadow-card p-4">
        <div className="flex items-center justify-between mb-3"><h2 className="text-lg font-semibold">النشاط الأخير</h2><div className="text-sm text-ink-500">{activities.length} عنصر</div></div>
        {activities.length === 0 ? <div className="text-ink-600">لا توجد أنشطة حديثة</div> : <div className="space-y-3">{activities.map((activity) => <div key={activity.id} className="flex items-start gap-3"><div className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-500" /><div className="flex-1"><div className="flex items-center justify-between"><div className="font-medium text-ink-900">{activity.title}</div><div className="text-xs text-ink-500">{formatDateTime(activity.occurredAt)}</div></div><div className="mt-1 text-sm text-ink-600">{activity.course?.title || activity.type}</div>{typeof activity.score === 'number' && <div className="mt-1 text-xs text-ink-500">الدرجة: {activity.score}</div>}</div></div>)}</div>}
      </section>
    </div>
  );
}
