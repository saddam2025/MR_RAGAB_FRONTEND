// src/pages/admin/ExportStudentsPage.jsx
export const route = {
  path: '/:instructorId/admin/students/export',
  index: false,
  auth: 'required',
  roles: ['admin', 'assistant'],
  title: 'تصدير بيانات الطلاب'
};

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

function DownloadIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 20h16" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getDownloadFilename(contentDisposition) {
  const utf8Match = contentDisposition?.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match) {
    try { return decodeURIComponent(utf8Match[1]); } catch { /* Use the fallback header below. */ }
  }

  const filenameMatch = contentDisposition?.match(/filename="?([^";]+)"?/i);
  return filenameMatch?.[1] || `students-export-${new Date().toISOString().slice(0, 10)}.csv`;
}

export default function ExportStudentsPage() {
  const { instructorId } = useParams();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  const handleExport = async () => {
    if (!instructorId || isExporting) return;

    setIsExporting(true);
    setExportError('');

    try {
      const response = await api.get(`/instructors/${instructorId}/students/export`, {
        responseType: 'blob',
        headers: { Accept: 'text/csv' }
      });
      const blob = response.data instanceof Blob
        ? response.data
        : new Blob([response.data], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = getDownloadFilename(response.headers?.['content-disposition']);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setExportError(error?.message || 'تعذر تصدير بيانات الطلاب. حاول مرة أخرى.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas text-ink-900" dir="rtl">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <section className="rounded-2xl border border-surface-border bg-surface-default p-6 text-right">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-brand-100 p-3 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400">
              <DownloadIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">تصدير بيانات الطلاب</h1>
              <p className="mt-2 text-sm text-ink-600">
                سيتم تنزيل ملف CSV يحتوي على بيانات طلاب منصتك الحالية.
              </p>
            </div>
          </div>

          {exportError && (
            <div role="alert" className="mt-5 rounded-xl bg-danger-soft p-4 text-sm text-danger-DEFAULT">
              {exportError}
            </div>
          )}

          <button
            type="button"
            onClick={handleExport}
            disabled={!instructorId || isExporting}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-ink-900 transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <DownloadIcon />
            {isExporting ? 'جارٍ إعداد الملف...' : 'تصدير الطلاب CSV'}
          </button>
        </section>
      </div>
    </div>
  );
}
