export const route = { path: '/:instructorId/assistant/messages', index: false, auth: 'required', roles: ['assistant', 'admin'], title: 'رسائل أولياء الأمور' };

import React, { useCallback, useEffect, useState } from 'react';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import useAuth from '../../hooks/useAuth';
import messageService from '../../services/messageService';

const PAGE_SIZE = 20;

function messageFor(error, fallback) {
  return error?.message || fallback;
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('ar-EG');
}

export default function ParentMessagesInboxPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [listError, setListError] = useState('');
  const [moreError, setMoreError] = useState('');
  const [threadError, setThreadError] = useState('');
  const [actionError, setActionError] = useState('');
  const currentUserId = user?._id || user?.id;

  const loadConversations = useCallback(async (page = 1) => {
    const setBusy = page === 1 ? setLoading : setLoadingMore;
    setBusy(true);
    if (page === 1) setListError('');
    else setMoreError('');
    try {
      const response = await messageService.listConversations(page, PAGE_SIZE);
      const payload = response?.data || {};
      const received = Array.isArray(payload.data) ? payload.data : [];
      setConversations((current) => (page === 1 ? received : [...current, ...received]));
      setPagination(payload.pagination || null);
    } catch (requestError) {
      if (page === 1) setListError(messageFor(requestError, 'تعذر تحميل المحادثات. حاول مرة أخرى.'));
      else setMoreError(messageFor(requestError, 'تعذر تحميل المزيد من المحادثات. حاول مرة أخرى.'));
    } finally {
      setBusy(false);
    }
  }, []);

  const loadThread = useCallback(async (conversation) => {
    if (!conversation?.studentId) return;
    setLoadingThread(true);
    setThreadError('');
    try {
      const response = await messageService.getThread(conversation.studentId);
      const payload = response?.data || {};
      setMessages(Array.isArray(payload.data) ? payload.data : []);
    } catch (requestError) {
      setMessages([]);
      setThreadError(messageFor(requestError, 'تعذر تحميل الرسائل. حاول مرة أخرى.'));
    } finally {
      setLoadingThread(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const selectConversation = async (conversation) => {
    setSelected(conversation);
    setDraft('');
    setActionError('');
    await loadThread(conversation);
  };

  const send = async (event) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !selected?.parentId || !selected?.studentId) return;

    setSending(true);
    setActionError('');
    try {
      await messageService.send({ toUserId: selected.parentId, studentId: selected.studentId, body });
      setDraft('');
      await Promise.all([loadThread(selected), loadConversations()]);
    } catch (requestError) {
      setActionError(messageFor(requestError, 'تعذر إرسال الرسالة. حاول مرة أخرى.'));
    } finally {
      setSending(false);
    }
  };

  const hasMore = pagination && pagination.page < pagination.totalPages;

  return (
    <div className="space-y-6" dir="rtl">
      <div><p className="text-sm font-bold text-brand-600">التواصل والمتابعة</p><h1 className="text-2xl font-extrabold text-ink-900">رسائل أولياء الأمور</h1></div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)]">
        <section className="rounded-[var(--radius-xl)] border border-surface-border bg-surface-default p-4 shadow-card">
          <h2 className="px-2 text-lg font-extrabold text-ink-900">المحادثات</h2>
          {loading ? <p className="p-4 text-sm text-ink-500">جارٍ تحميل المحادثات...</p> : listError ? <div role="alert" className="m-2 rounded-xl bg-danger-soft p-3 text-sm text-danger-DEFAULT"><p>{listError}</p><Button variant="subtle" size="sm" className="mt-3" onClick={() => loadConversations()}>إعادة المحاولة</Button></div> : conversations.length === 0 ? <p className="p-4 text-sm text-ink-500">لا توجد محادثات حالياً.</p> : <div className="mt-3 space-y-2">{conversations.map((conversation) => <button key={`${conversation.parentId}-${conversation.studentId}`} type="button" onClick={() => selectConversation(conversation)} className={`w-full rounded-xl p-3 text-right transition ${selected?.parentId === conversation.parentId && selected?.studentId === conversation.studentId ? 'bg-brand-100' : 'bg-surface-muted hover:bg-surface-border'}`}><div className="flex items-start gap-3"><Avatar name={conversation.parent?.name} avatarUrl={conversation.parent?.avatarUrl} size="sm" /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-bold text-ink-900">{conversation.parent?.name || 'ولي الأمر'}</p>{conversation.unreadCount > 0 && <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-white">{conversation.unreadCount}</span>}</div><p className="mt-1 truncate text-xs text-ink-600">{conversation.lastMessagePreview}</p><p className="mt-1 text-xs text-ink-500">{formatDate(conversation.lastMessageAt)}</p></div></div></button>)}</div>}
          {moreError && <p role="alert" className="m-2 rounded-xl bg-danger-soft p-3 text-sm text-danger-DEFAULT">{moreError}</p>}
          {hasMore && <div className="p-3 text-center"><Button variant="subtle" size="sm" onClick={() => loadConversations(pagination.page + 1)} disabled={loadingMore}>{loadingMore ? 'جارٍ التحميل...' : 'تحميل المزيد'}</Button></div>}
        </section>

        <section className="flex min-h-[32rem] flex-col rounded-[var(--radius-xl)] border border-surface-border bg-surface-default shadow-card">
          {!selected ? <div className="grid flex-1 place-items-center p-8 text-center text-ink-500">اختر محادثة لعرض الرسائل.</div> : <><header className="flex items-center gap-3 border-b border-surface-border p-4"><Avatar name={selected.parent?.name} avatarUrl={selected.parent?.avatarUrl} /><div><h2 className="font-extrabold text-ink-900">{selected.parent?.name || 'ولي الأمر'}</h2><p className="text-xs text-ink-500">محادثة مرتبطة بالطالب</p></div></header><div className="flex-1 space-y-3 overflow-y-auto p-4">{loadingThread ? <p className="text-sm text-ink-500">جارٍ تحميل الرسائل...</p> : threadError ? <div role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger-DEFAULT"><p>{threadError}</p><Button variant="subtle" size="sm" className="mt-3" onClick={() => loadThread(selected)}>إعادة المحاولة</Button></div> : messages.length === 0 ? <p className="text-sm text-ink-500">لا توجد رسائل في هذه المحادثة.</p> : messages.map((message) => <article key={message._id} className={`max-w-[85%] rounded-xl p-3 text-sm ${String(message.fromUserId) === String(currentUserId) ? 'mr-auto bg-brand-600 text-white' : 'ml-auto bg-surface-muted text-ink-900'}`}><p>{message.body}</p><p className={`mt-1 text-xs ${String(message.fromUserId) === String(currentUserId) ? 'text-white/75' : 'text-ink-500'}`}>{formatDate(message.createdAt)}</p></article>)}</div><form className="border-t border-surface-border p-4" onSubmit={send}>{actionError && <p role="alert" className="mb-3 rounded-xl bg-danger-soft p-3 text-sm text-danger-DEFAULT">{actionError}</p>}<label className="sr-only" htmlFor="parent-message-body">نص الرسالة</label><textarea id="parent-message-body" className="input min-h-24 w-full" value={draft} onChange={(event) => setDraft(event.target.value)} disabled={sending} placeholder="اكتب رسالتك…" /><div className="mt-3 flex justify-end"><Button type="submit" disabled={!draft.trim() || sending}>{sending ? 'جارٍ الإرسال...' : 'إرسال'}</Button></div></form></>}
        </section>
      </div>
    </div>
  );
}
