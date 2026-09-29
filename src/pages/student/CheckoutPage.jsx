// src/pages/student/CheckoutPage.jsx
export const route = {
  path: [
    '/:instructorId/checkout/:courseId',
    '/:instructorId/courses/:courseId/lectures/:lectureId/checkout'
  ],
  index: false,
  auth: 'required',
  roles: ['student'],
  title: 'الدفع',
};

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';
import courseService from '../../services/courseService';
import { stageLabel } from '../../constants/stages';
import { useAuth } from '../../hooks/useAuth';

export default function CheckoutPage() {
  const { instructorId, courseId, lectureId } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth() || {};
  const [searchParams] = useSearchParams();
  const [course, setCourse] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [orderError, setOrderError] = useState('');
  const [paymobLoading, setPaymobLoading] = useState(false);
  const [paymobError, setPaymobError] = useState('');
  const [iframeUrl, setIframeUrl] = useState('');
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletMessage, setWalletMessage] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseCodeLoading, setCourseCodeLoading] = useState(false);

  const isSubscription = courseId === 'subscription';
  const isLectureCheckout = Boolean(lectureId);
  const stageId = searchParams.get('stageId');

  useEffect(() => {
    let active = true;

    if (isSubscription) {
      setLoadingOrder(false);
      setCourse(null);
      setOrderError(stageId ? '' : 'لم يتم تحديد المرحلة الدراسية للاشتراك.');
      return () => { active = false; };
    }

    if (isLectureCheckout) {
      setLoadingOrder(true);
      setOrderError('');
      api.get(`/courses/${courseId}/lectures`)
        .then((response) => {
          const lecture = (response?.data?.data || []).find((item) => String(item._id) === String(lectureId));
          if (!lecture) throw new Error('المحاضرة غير متاحة.');
          if (active) setCourse(lecture);
        })
        .catch((error) => { if (active) setOrderError(error?.message || 'تعذر تحميل تفاصيل المحاضرة.'); })
        .finally(() => { if (active) setLoadingOrder(false); });
      return () => { active = false; };
    }

    setLoadingOrder(true);
    setOrderError('');
    courseService.get(instructorId, courseId)
      .then((response) => {
        if (active) setCourse(response?.data?.data || null);
      })
      .catch((error) => {
        if (active) setOrderError(error?.message || 'تعذر تحميل تفاصيل الدورة.');
      })
      .finally(() => {
        if (active) setLoadingOrder(false);
      });

    return () => { active = false; };
  }, [courseId, instructorId, isLectureCheckout, isSubscription, lectureId, stageId]);

  const startPaymobCheckout = async () => {
    setPaymobLoading(true);
    setPaymobError('');

    try {
      const response = isSubscription
        ? await api.post(`/subscriptions/${stageId}/checkout`, { instructorId, paymentMethod: 'paymob' })
        : await api.post(isLectureCheckout ? `/courses/${courseId}/lectures/${lectureId}/checkout/paymob` : `/courses/${courseId}/checkout/paymob`);
      const nextIframeUrl = response?.data?.data?.iframeUrl;
      if (!nextIframeUrl) throw new Error('لم تُرجع بوابة الدفع رابط الإطار المطلوب.');
      setIframeUrl(nextIframeUrl);
    } catch (error) {
      setPaymobError(error?.message || 'تعذر بدء عملية الدفع الإلكتروني.');
    } finally {
      setPaymobLoading(false);
    }
  };

  const enrollFreeCourse = async () => {
    setWalletLoading(true);
    setWalletMessage('');
    setPaymentError('');
    try {
      await api.post(isLectureCheckout ? `/courses/${courseId}/lectures/${lectureId}/checkout/free` : `/courses/${courseId}/checkout/free`);
      setWalletMessage(`تم الاشتراك في ${isLectureCheckout ? 'المحاضرة' : 'الدورة'} المجانية بنجاح.`);
      navigate(isLectureCheckout ? `/${instructorId}/courses/${courseId}` : `/${instructorId}/dashboard`, { replace: true });
    } catch (error) {
      setPaymentError(error?.message || 'تعذر إتمام الاشتراك المجاني.');
    } finally {
      setWalletLoading(false);
    }
  };

  const payWithWallet = async () => {
    setWalletLoading(true);
    setWalletMessage('');
    setPaymentError('');
    try {
      const response = await api.post(isLectureCheckout ? `/courses/${courseId}/lectures/${lectureId}/checkout/wallet` : `/courses/${courseId}/checkout/wallet`);
      updateUser?.({ walletBalance: response?.data?.data?.walletBalance });
      setWalletMessage(`تم الاشتراك في ${isLectureCheckout ? 'المحاضرة' : 'الدورة'} بنجاح. رصيدك المتبقي: ${response?.data?.data?.walletBalance ?? ''} ج.م`);
      navigate(isLectureCheckout ? `/${instructorId}/courses/${courseId}` : `/${instructorId}/dashboard`, { replace: true });
    } catch (error) {
      setPaymentError(error?.message || 'تعذر إتمام الدفع من المحفظة.');
    } finally {
      setWalletLoading(false);
    }
  };

  const redeemCourseCode = async () => {
    if (!courseCode.trim()) return;
    setCourseCodeLoading(true);
    setWalletMessage('');
    setPaymentError('');
    try {
      await api.post('/access-codes/redeem', { code: courseCode.trim(), expectedCourseId: courseId, ...(isLectureCheckout ? { expectedLectureId: lectureId } : {}) });
      setCourseCode('');
      setWalletMessage(`تم الاشتراك في ${isLectureCheckout ? 'المحاضرة' : 'الدورة'} باستخدام الكود بنجاح.`);
      navigate(isLectureCheckout ? `/${instructorId}/courses/${courseId}` : `/${instructorId}/dashboard`, { replace: true });
    } catch (error) {
      setPaymentError(error?.message || `تعذر استخدام كود ${isLectureCheckout ? 'المحاضرة' : 'الدورة'}.`);
    } finally {
      setCourseCodeLoading(false);
    }
  };

  const itemLabel = isLectureCheckout ? 'المحاضرة' : 'الدورة';
  const orderTitle = isSubscription ? 'اشتراك شهري' : (course?.title_ar || course?.title_en);
  const orderPrice = isSubscription ? null : course?.price;
  const isFreeCourse = !isSubscription && Number(orderPrice) === 0;

  return (
    <div dir="rtl" className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">الدفع</h1>
        <p className="text-sm text-ink-500 mt-1">
          {isSubscription ? 'إتمام الاشتراك الشهري' : `إتمام شراء ${itemLabel}`}
        </p>
      </div>

      {loadingOrder && <div className="rounded-xl bg-surface-default p-4 text-center text-sm text-ink-500">جارٍ تحميل تفاصيل الطلب...</div>}
      {orderError && <div role="alert" className="rounded-xl bg-danger-soft p-4 text-center text-sm text-danger-DEFAULT">{orderError}</div>}

      {!loadingOrder && !orderError && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <section className="bg-surface-default rounded-2xl shadow-card p-6">
              <h2 className="text-lg font-semibold text-ink-900">{isFreeCourse ? 'اشتراك مجاني' : 'خيارات الدفع'}</h2>
              {isFreeCourse ? (
                <>
                  <p className="mt-2 text-sm text-ink-600">هذه {itemLabel} مجانية ولا تتطلب أي وسيلة دفع.</p>
                  <Button className="mt-5" variant="primary" onClick={enrollFreeCourse} disabled={walletLoading}>{walletLoading ? 'جارٍ الاشتراك...' : 'اشتراك'}</Button>
                </>
              ) : <>
              <p className="mt-2 text-sm text-ink-600">
                سيتم فتح بوابة الدفع الآمنة لإتمام الدفع بالفيزا عند توفرها للخطة المختارة.
              </p>

              {paymobError && <div role="alert" className="mt-4 rounded-xl bg-danger-soft p-4 text-sm text-danger-DEFAULT">{paymobError}</div>}

              {!iframeUrl && (
                <Button className="mt-5" variant="primary" onClick={startPaymobCheckout} disabled={paymobLoading}>
                  {paymobLoading ? 'جارٍ فتح بوابة الدفع...' : 'الدفع بالفيزا'}
                </Button>
              )}

              {iframeUrl && (
                <iframe
                  title="بوابة الدفع بالفيزا"
                  src={iframeUrl}
                  className="mt-5 h-[680px] w-full rounded-xl border border-surface-border"
                  allow="payment"
                />
              )}
              {!isSubscription && (
                <div className="mt-6 border-t border-surface-border pt-5">
                  <h3 className="font-medium text-ink-900">الدفع من المحفظة</h3>
                  <p className="mt-1 text-sm text-ink-600">رصيدك الحالي: {user?.walletBalance ?? 0} ج.م.</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Button variant="subtle" onClick={payWithWallet} disabled={walletLoading}>{walletLoading ? 'جارٍ التنفيذ...' : 'الدفع بالمحفظة'}</Button>
                  </div>
                  <div className="mt-5 border-t border-surface-border pt-5"><h3 className="font-medium text-ink-900">الدفع بكود {isLectureCheckout ? 'المحاضرة' : 'الكورس'}</h3><div className="mt-3 flex flex-wrap gap-2"><input value={courseCode} onChange={(event) => setCourseCode(event.target.value)} placeholder={`أدخل كود ${isLectureCheckout ? 'المحاضرة' : 'الكورس'}`} className="min-w-0 flex-1 rounded-xl border border-surface-border bg-surface-canvas px-3 py-2 text-sm text-ink-900 outline-none" /><Button type="button" variant="primary" onClick={redeemCourseCode} disabled={courseCodeLoading || !courseCode.trim()}>{courseCodeLoading ? 'جارٍ التحقق...' : 'استخدام الكود'}</Button></div></div>
                </div>
              )}
              {walletMessage && <div className="mt-4 rounded-xl bg-success-soft p-3 text-sm text-success-DEFAULT">{walletMessage}</div>}
              {paymentError && <div role="alert" className="mt-4 rounded-xl bg-danger-soft p-3 text-sm text-danger-DEFAULT">{paymentError}</div>}
              </>}
            </section>
          </div>

          <aside className="bg-surface-default rounded-2xl shadow-card p-6 h-fit space-y-4">
            <h2 className="text-lg font-semibold text-ink-900">ملخص الطلب</h2>
            <div className="flex items-center justify-between text-sm gap-3">
              <span className="text-ink-600">{orderTitle}</span>
              {isSubscription && stageId && <Badge variant="neutral">{stageLabel(stageId)}</Badge>}
            </div>
            <div className="border-t border-surface-border pt-4 flex items-center justify-between">
              <span className="font-semibold text-ink-900">المجموع</span>
              <span className="font-semibold text-ink-900">
                {isFreeCourse ? 'مجاني' : (typeof orderPrice === 'number' ? `${orderPrice} ج.م` : 'يُحدده الخادم عند تفعيل الاشتراك')}
              </span>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
