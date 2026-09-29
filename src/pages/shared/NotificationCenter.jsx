export const route = {
  path: '/:instructorId/notifications',
  index: false,
  auth: 'required',
  title: 'الإشعارات',
};

import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import notificationService from '../../services/notificationService';

const PAGE_SIZE = 20;

function messageFor(error, fallback) {
  return error?.message || fallback;
}

function formatDate(value) {
  if (!value) return 'غير متاح';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'غير متاح' : date.toLocaleString('ar-EG');
}

function destinationFor(notification, instructorId, role) {
  if (['new_course', 'new_lecture'].includes(notification.type) && notification.relatedId) {
    if (role === 'parent') return `/${instructorId}/parent/courses`;
    return `/${instructorId}/courses/${notification.relatedId}`;
  }
  if (notification.type === 'assignment_submitted' && notification.relatedId) return `/${instructorId}/assistant/grade/${notification.relatedId}`;
  if (notification.type === 'assignment_graded') return role === 'parent' ? `/${instructorId}/parent/assignment-grades` : `/${instructorId}/assignment-grades`;
  if (notification.type === 'exam_result') return role === 'parent' ? `/${instructorId}/parent/exam-grades` : `/${instructorId}/exam-grades`;
  if (notification.type === 'message') return role === 'parent' ? `/${instructorId}/parent/activity` : `/${instructorId}/assistant/messages`;
  return null;
}

export default function NotificationCenter() {
  const { instructorId } = useParams();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [readingId, setReadingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await notificationService.list(page, PAGE_SIZE);
      const payload = response?.data || {};
      setNotifications(Array.isArray(payload.data) ? payload.data : []);
      setPagination(payload.pagination || null);
    } catch (requestError) {
      setNotifications([]);
      setPagination(null);
      setError(messageFor(requestError, 'تعذر تحميل الإشعارات. حاول مرة أخرى.'));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markRead = async (notificationId) => {
    setReadingId(notificationId);
    setActionError('');
    try {
      const response = await notificationService.markRead(notificationId);
      const savedNotification = response?.data?.data;
      if (savedNotification?._id) {
        setNotifications((current) => current.map((item) => (
          item._id === savedNotification._id ? savedNotification : item
        )));
      } else {
        await loadNotifications();
      }
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (requestError) {
      setActionError(messageFor(requestError, 'تعذر تعليم الإشعار كمقروء. حاول مرة أخرى.'));
    } finally {
      setReadingId(null);
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    setActionError('');
    try {
      await notificationService.markAllRead();
      await loadNotifications();
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (requestError) {
      setActionError(messageFor(requestError, 'تعذر تعليم جميع الإشعارات كمقروءة. حاول مرة أخرى.'));
    } finally {
      setMarkingAll(false);
    }
  };

  const totalPages = pagination?.totalPages || 1;
  const hasUnread = notifications.some((notification) => !notification.read);

  return (
    <div className="mx-auto max-w-3xl space-y-6" dir="rtl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-brand-600">ابقَ على اطلاع</p>
          <h1 className="text-2xl font-extrabold text-ink-900">الإشعارات</h1>
        </div>
        <Button variant="subtle" size="sm" onClick={markAllRead} disabled={!hasUnread || markingAll}>
          {markingAll ? 'جارٍ التحديث...' : 'تحديد الكل كمقروء'}
        </Button>
      </div>

      {actionError && <div role="alert" className="rounded-xl bg-danger-soft p-4 text-sm text-danger-DEFAULT">{actionError}</div>}

      {loading ? (
        <div className="rounded-[var(--radius-xl)] bg-surface-default p-8 text-center text-ink-500 shadow-card">جارٍ تحميل الإشعارات...</div>
      ) : error ? (
        <div role="alert" className="rounded-[var(--radius-xl)] bg-danger-soft p-6 text-center text-danger-DEFAULT">
          <p>{error}</p>
          <Button variant="subtle" size="sm" className="mt-4" onClick={loadNotifications}>إعادة المحاولة</Button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-[var(--radius-xl)] bg-surface-default p-10 text-center text-ink-500 shadow-card">لا توجد إشعارات حتى الآن.</div>
      ) : (
        <>
          <div className="overflow-hidden rounded-[var(--radius-xl)] border border-surface-border bg-surface-default shadow-card">
            {notifications.map((notification) => {
              const destination = destinationFor(notification, instructorId, user?.role);
              const isReading = readingId === notification._id;
              return (
                <article key={notification._id} className={`flex items-start gap-4 border-b border-surface-border p-5 text-right last:border-0 ${notification.read ? 'bg-surface-default' : 'bg-surface-muted'}`}>
                  <span aria-label={notification.read ? 'مقروء' : 'غير مقروء'} className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${notification.read ? 'bg-surface-border' : 'bg-brand-500'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-bold text-ink-900">{notification.title}</h2>
                      {!notification.read && <Badge variant="brand">جديد</Badge>}
                    </div>
                    {notification.body && <p className="mt-1 text-sm leading-6 text-ink-600">{notification.body}</p>}
                    <p className="mt-2 text-xs text-ink-500">{formatDate(notification.createdAt)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {destination && <Link className="text-sm font-bold text-brand-600 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-500/50" to={destination}>{notification.type === 'new_course' || notification.type === 'new_lecture' ? 'عرض الكورس' : notification.type === 'assignment_submitted' ? 'فتح الواجب للتصحيح' : notification.type === 'message' ? 'فتح الرسائل' : 'عرض التفاصيل'}</Link>}
                      {!notification.read && <Button variant="subtle" size="sm" onClick={() => markRead(notification._id)} disabled={isReading}>{isReading ? 'جارٍ التحديث...' : 'تعليم كمقروء'}</Button>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {pagination && totalPages > 1 && (
            <nav aria-label="صفحات الإشعارات" className="flex items-center justify-between gap-3">
              <Button variant="subtle" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>الأحدث</Button>
              <span className="text-sm text-ink-600">صفحة {pagination.page} من {totalPages}</span>
              <Button variant="subtle" size="sm" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>الأقدم</Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
