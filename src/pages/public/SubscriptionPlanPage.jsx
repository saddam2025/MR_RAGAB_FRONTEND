// src/pages/public/SubscriptionPlanPage.jsx
export const route = {
  path: '/:instructorId/stages/:stageId/plans',
  index: false,
  auth: null,
  title: 'خطط الاشتراك'
};

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function SubscriptionPlanPage() {
  const { instructorId, stageId } = useParams();
  const navigate = useNavigate();

  const monthlyPrice = '199 ر.س / شهر';
  const perLecturePrice = '15 ر.س / محاضرة';

  const monthlyFeatures = [
    'وصول لجميع محاضرات الشهر',
    'مواد داعمة وملفات قابلة للتحميل',
    'دعم مباشر من المعيدين'
  ];

  const perLectureFeatures = [
    'ادفع فقط مقابل ما تشاهده',
    'صلاحية محددة لكل محاضرة بعد الشراء',
    'مرونة في اختيار المحاضرات'
  ];

  const goToSubscriptionCheckout = () => {
    navigate(`/${instructorId}/checkout/subscription?stageId=${encodeURIComponent(stageId)}`);
  };

  const goToCourses = () => {
    navigate(`/${instructorId}/stages/${stageId}/courses`);
  };

  const FeatureItem = ({ text }) => (
    <li className="flex items-start gap-3 text-ink-700">
      <svg className="w-5 h-5 text-brand-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
      </svg>
      <span className="text-sm">{text}</span>
    </li>
  );

  return (
    <div className="min-h-screen bg-surface-canvas text-ink-900" dir="rtl">
      <header className="bg-surface-default border-b border-surface-border">
        <div className="container mx-auto px-4 py-6 text-right">
          <h1 className="text-2xl font-semibold">خطط الاشتراك</h1>
          <p className="text-sm text-ink-600 mt-1">اختر الخطة المناسبة للوصول إلى محاضرات المرحلة المختارة</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Monthly Subscription Card */}
          <div className="relative bg-surface-default rounded-2xl shadow-card p-6 flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-ink-900">اشتراك شهري</h2>
                  <Badge className="text-xs">الأكثر شيوعاً</Badge>
                </div>
                <div className="mt-3 text-3xl font-bold text-ink-900">{monthlyPrice}</div>
                <div className="text-sm text-ink-500 mt-2">سعر ثابت يمنحك وصولاً غير محدوداً طوال الشهر</div>
              </div>
            </div>

            <ul className="mt-6 space-y-3">
              {monthlyFeatures.map((f) => (
                <FeatureItem key={f} text={f} />
              ))}
            </ul>

            <div className="mt-4 text-sm text-ink-500">
              يجب اجتياز اختبار الشهر بنسبة 50% على الأقل للاشتراك بالشهر التالي
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Button variant="primary" onClick={goToSubscriptionCheckout}>اشترك الآن</Button>
              {/* FIX: Button has no "outline" variant (only primary/ghost/subtle) */}
              <Button variant="ghost" onClick={() => navigate(`/${instructorId}/stages/${stageId}/plans`)}>تفاصيل الخطة</Button>
            </div>
          </div>

          {/* Pay-per-Lecture Card */}
          <div className="bg-surface-default rounded-2xl shadow-card p-6 flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-ink-900">الدفع لكل محاضرة</h2>
                <div className="mt-3 text-3xl font-bold text-ink-900">{perLecturePrice}</div>
                <div className="text-sm text-ink-500 mt-2">مرونة كاملة في اختيار ما تريد مشاهدته</div>
              </div>
            </div>

            <ul className="mt-6 space-y-3">
              {perLectureFeatures.map((f) => (
                <FeatureItem key={f} text={f} />
              ))}
            </ul>

            <div className="mt-6 flex items-center gap-3">
              {/* FIX: Button has no "outline" variant */}
              <Button variant="subtle" onClick={goToCourses}>تصفح المحاضرات</Button>
              <Button variant="ghost" onClick={() => { /* optional secondary action */ }}>مقارنة</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
