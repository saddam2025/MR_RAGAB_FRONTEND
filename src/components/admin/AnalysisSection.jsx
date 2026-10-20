import React, { useEffect, useMemo, useState } from 'react';
import {
  Area, AreaChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from 'recharts';
import { CircleDollarSign, GraduationCap } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Input from '../ui/Input';
import api from '../../services/api';

const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const CHART_COLORS = ['var(--brand-500)', 'var(--success-DEFAULT)', 'var(--teal-DEFAULT)', 'var(--navy-500)', 'var(--danger-DEFAULT)'];
const EMPTY_SERIES = [];
const SOURCE_LABELS = {
  paymob: 'دفع إلكتروني',
  wallet: 'المحفظة',
  access_code: 'أكواد الوصول',
  free: 'اشتراك مجاني',
  scratchcard: 'كروت الشحن'
};

function cairoTodayParts() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  return Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, Number(part.value)]));
}

function dateValue(parts) {
  return parts.year + '-' + String(parts.month).padStart(2, '0') + '-' + String(parts.day).padStart(2, '0');
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('ar-EG', { maximumFractionDigits: 2 });
}

function formatCurrency(value) {
  return formatNumber(value) + ' ج.م';
}

function formatPercent(value) {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  const rounded = Math.round(Number(value));
  return (rounded > 0 ? '▲ ' : rounded < 0 ? '▼ ' : '') + formatNumber(Math.abs(rounded)) + '٪';
}

function Card({ title, subtitle, unit, loading, error, onRetry, children, className = '' }) {
  return (
    <section className={'rounded-2xl border border-surface-border bg-surface-default p-5 shadow-card transition duration-200 hover:shadow-soft motion-reduce:transition-none sm:p-6 ' + className}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-ink-900">{title}</h3>
          {subtitle && <p className="mt-1 text-xs text-ink-500">{subtitle}</p>}
        </div>
        {unit && <Badge variant="info">{unit}</Badge>}
      </div>
      {loading ? <div className="space-y-3 animate-pulse" aria-label="جارٍ تحميل البيانات"><div className="h-5 w-2/3 rounded-lg bg-surface-muted" /><div className="h-48 rounded-xl bg-surface-muted" /></div>
        : error ? <div role="alert" className="grid min-h-40 place-content-center gap-3 text-center"><p className="text-sm text-danger-DEFAULT">{error}</p><Button type="button" variant="subtle" size="sm" onClick={onRetry}>إعادة المحاولة</Button></div>
          : children}
    </section>
  );
}

function Kpi({ label, value, detail, tone = 'neutral' }) {
  const details = tone === 'positive' ? 'text-success-text' : tone === 'negative' ? 'text-danger-DEFAULT' : 'text-ink-500';
  return (
    <article className="rounded-2xl border border-surface-border bg-surface-default p-4 shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-soft motion-reduce:transition-none motion-reduce:hover:transform-none">
      <p className="text-sm text-ink-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ink-900">{value}</p>
      {detail && <p className={'mt-1 text-xs font-semibold ' + details}>{detail}</p>}
    </article>
  );
}

function EmptyChart({ message = 'لا توجد بيانات لهذه الفترة' }) {
  return <div className="grid h-64 place-items-center rounded-xl bg-surface-muted text-sm text-ink-500">{message}</div>;
}

function TooltipBox({ active, payload, label, currency = false }) {
  if (!active || !payload?.length) return null;
  return (
    <div dir="rtl" className="rounded-xl border border-surface-border bg-surface-default px-3 py-2 text-right text-sm text-ink-900 shadow-card">
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((item) => <p key={item.dataKey} className="text-ink-700">{item.name}: {currency ? formatCurrency(item.value) : formatNumber(item.value)}</p>)}
    </div>
  );
}

function PieContents({ data, currency = false, reduceMotion = false }) {
  const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0);
  if (!total) return <EmptyChart />;
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(180px,0.8fr)_minmax(0,1fr)] md:items-center">
      <div className="h-56 min-w-0" dir="ltr" role="img" aria-label="رسم دائري لتوزيع البيانات">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data.filter((item) => Number(item.value) > 0)} dataKey="value" nameKey="name" innerRadius="45%" outerRadius="82%" paddingAngle={2} isAnimationActive={!reduceMotion} animationDuration={650}>
              {data.filter((item) => Number(item.value) > 0).map((item) => <Cell key={item.name} fill={item.color} stroke="var(--surface-default)" />)}
            </Pie>
            <Tooltip content={<TooltipBox currency={currency} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-2" dir="rtl">
        {data.map((item, index) => {
          const percentage = total ? Math.round((Number(item.value || 0) / total) * 100) : 0;
          return <li key={item.name} className="flex items-center gap-2 text-sm">
            <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: item.color || CHART_COLORS[index % CHART_COLORS.length] }} aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate text-ink-700">{item.name}</span>
            <strong className="text-ink-900">{currency ? formatCurrency(item.value) : formatNumber(item.value)}</strong>
            <span className="w-10 text-left text-xs text-ink-500">{formatNumber(percentage)}٪</span>
          </li>;
        })}
      </ul>
    </div>
  );
}

function FlowChart({ data, series, currency = false, reduceMotion = false, ariaLabel }) {
  const hasValues = data.some((item) => series.some((entry) => Number(item[entry.key] || 0) > 0));
  if (!hasValues) return <EmptyChart />;
  return (
    <div className="h-64 min-w-0" dir="ltr" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--surface-border)" strokeDasharray="4 5" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'var(--ink-500)', fontSize: 11 }} minTickGap={16} />
          <YAxis tickLine={false} axisLine={false} width={60} tick={{ fill: 'var(--ink-500)', fontSize: 11 }} tickFormatter={(value) => formatNumber(value)} />
          <Tooltip content={<TooltipBox currency={currency} />} />
          {series.length > 1 && <Legend wrapperStyle={{ direction: 'rtl', color: 'var(--ink-700)', fontSize: 12 }} />}
          {series.map((entry) => <Area key={entry.key} type="monotone" dataKey={entry.key} name={entry.name} stroke={entry.color} fill={entry.color} fillOpacity={0.14} strokeWidth={2.5} dot={{ r: 3, fill: 'var(--surface-default)', strokeWidth: 2 }} activeDot={{ r: 5 }} isAnimationActive={!reduceMotion} animationDuration={750} />)}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function buildParams(filters) {
  if (filters.mode === 'month' && !filters.fromMonth) return {};
  if (filters.mode === 'month') return { mode: 'month', year: String(filters.year), fromMonth: String(filters.fromMonth), ...(filters.toMonth ? { toMonth: String(filters.toMonth) } : {}) };
  if (filters.mode === 'year') return { mode: 'year', year: String(filters.year) };
  if (filters.mode === 'day') return { mode: 'day', fromDate: filters.fromDate, toDate: filters.toDate };
  return {};
}

function selectedPeriodLabel(filters, today) {
  if (filters.mode === 'month') {
    if (!filters.fromMonth) return 'أسابيع ' + MONTHS[today.month - 1] + ' ' + today.year;
    const from = Number(filters.fromMonth);
    const to = Number(filters.toMonth || filters.fromMonth);
    const count = to - from + 1;
    if (count === 1) return MONTHS[from - 1] + ' ' + filters.year;
    return MONTHS[from - 1] + ' – ' + MONTHS[to - 1] + ' ' + filters.year + ' · ' + formatNumber(count) + ' أشهر';
  }
  if (filters.mode === 'year') return 'سنة ' + filters.year;
  if (!filters.fromDate || !filters.toDate) return 'اختر تاريخ البداية والنهاية';
  return filters.fromDate === filters.toDate ? filters.fromDate : 'من ' + filters.fromDate + ' إلى ' + filters.toDate;
}

function validateFilters(filters) {
  if (filters.mode === 'month' && filters.fromMonth && filters.toMonth && Number(filters.toMonth) < Number(filters.fromMonth)) return 'شهر النهاية يجب أن يكون بعد شهر البداية أو مساوياً له.';
  if (filters.mode === 'day') {
    if (!filters.fromDate || !filters.toDate) return 'اختر تاريخ البداية والنهاية.';
    if (filters.toDate < filters.fromDate) return 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية أو مساوياً له.';
    const today = dateValue(cairoTodayParts());
    if (filters.toDate > today) return 'لا يمكن اختيار تاريخ مستقبلي.';
    const days = (Date.parse(filters.toDate + 'T00:00:00Z') - Date.parse(filters.fromDate + 'T00:00:00Z')) / 86400000 + 1;
    if (days > 62) return 'الحد الأقصى للفترة اليومية هو 62 يوماً.';
  }
  return '';
}

export default function AnalysisSection({ instructorId }) {
  const today = useMemo(cairoTodayParts, []);
  const [filters, setFilters] = useState({ mode: 'month', year: today.year, fromMonth: '', toMonth: '', fromDate: '', toDate: '' });
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const validationError = validateFilters(filters);
  const cardError = validationError || error;
  const periodLabel = selectedPeriodLabel(filters, today);
  const isDefaultView = filters.mode === 'month' && !filters.fromMonth;
  const years = useMemo(() => Array.from({ length: today.year - 1999 }, (_, index) => today.year - index), [today.year]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReduceMotion(mediaQuery.matches);
    updateMotion();
    mediaQuery.addEventListener?.('change', updateMotion);
    return () => mediaQuery.removeEventListener?.('change', updateMotion);
  }, []);

  useEffect(() => {
    if (!instructorId || validationError) return undefined;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    const timer = window.setTimeout(async () => {
      try {
        const response = await api.get('/instructors/' + encodeURIComponent(instructorId) + '/dashboard/analysis', {
          params: buildParams(filters),
          signal: controller.signal
        });
        setAnalysis(response.data?.data || null);
      } catch (requestError) {
        if (!controller.signal.aborted) setError(requestError?.message || 'تعذر تحميل التحليلات.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [filters, instructorId, retry, validationError]);

  const retryLoad = () => setRetry((value) => value + 1);
  const currentMonth = today.month;
  const maxMonth = Number(filters.year) === today.year ? currentMonth : 12;
  const updateMode = (mode) => setFilters((current) => {
    if (mode === 'day' && !current.fromDate) {
      const start = dateValue({ ...today, day: 1 });
      return { ...current, mode, fromDate: start, toDate: dateValue(today) };
    }
    if (mode === 'month' && current.year !== today.year && !current.fromMonth) return { ...current, mode, fromMonth: '1', toMonth: '' };
    return { ...current, mode };
  });
  const updateYear = (year) => setFilters((current) => ({
    ...current,
    year: Number(year),
    ...(current.mode === 'month' ? { fromMonth: current.fromMonth || (Number(year) === today.year ? String(currentMonth) : '1'), toMonth: '' } : {})
  }));
  const setQuickMonths = (count) => {
    const last = currentMonth;
    const first = Math.max(1, last - count + 1);
    setFilters((current) => ({ ...current, mode: 'month', year: today.year, fromMonth: String(first), toMonth: String(last) }));
  };
  const reset = () => setFilters({ mode: 'month', year: today.year, fromMonth: '', toMonth: '', fromDate: '', toDate: '' });

  const profitSeries = analysis?.profits?.series || EMPTY_SERIES;
  const studentSeries = analysis?.students?.series || EMPTY_SERIES;
  const profitPie = useMemo(() => profitSeries.map((item, index) => ({ name: item.label, value: item.amount, color: CHART_COLORS[index % CHART_COLORS.length] })), [profitSeries]);
  const studentPie = useMemo(() => {
    if (!analysis) return [];
    if (analysis.period?.isDefault) return [
      { name: 'طلاب سابقون', value: analysis.students.existingStudents, color: CHART_COLORS[0] },
      { name: 'جدد الشهر الماضي', value: analysis.students.previousMonth, color: CHART_COLORS[1] },
      { name: 'جدد هذا الشهر', value: analysis.students.currentMonth, color: CHART_COLORS[2] }
    ];
    return studentSeries.map((item, index) => ({ name: item.label, value: item.count, color: CHART_COLORS[index % CHART_COLORS.length] }));
  }, [analysis, studentSeries]);
  const profitGrowthTone = analysis?.profits?.percentChange > 0 ? 'positive' : analysis?.profits?.percentChange < 0 ? 'negative' : 'neutral';
  const studentGrowthTone = analysis?.students?.newPercentChange > 0 ? 'positive' : analysis?.students?.newPercentChange < 0 ? 'negative' : 'neutral';
  const profitFlowData = profitSeries.map((item) => ({ label: item.label, profit: item.amount }));
  const studentFlowData = analysis?.period?.isDefault
    ? (analysis.students.defaultWeeklySeries || []).map((item) => ({ label: item.label, current: item.current, previous: item.previous }))
    : studentSeries.map((item) => ({ label: item.label, registrations: item.count }));

  return (
    <section aria-labelledby="analysis-heading" className="space-y-6 animate-fadeIn motion-reduce:animate-none">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 id="analysis-heading" className="text-xl font-bold text-ink-900">التحليلات</h2><p className="mt-1 text-sm text-ink-500">الأرباح وتسجيلات الطلاب حسب الفترة المحددة.</p></div>
        {isDefaultView && <Badge variant="info">العرض الافتراضي: الشهر الحالي</Badge>}
      </div>

      <section aria-label="فلاتر التحليلات" className="space-y-4 rounded-2xl border border-surface-border bg-surface-default p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold text-ink-900">تصفية الفترة</h3>
          <div role="group" aria-label="نوع الفترة" className="inline-flex rounded-xl bg-surface-muted p-1">
            {[['day', 'يوم'], ['month', 'شهر'], ['year', 'سنة']].map(([mode, label]) => <button key={mode} type="button" aria-pressed={filters.mode === mode} onClick={() => updateMode(mode)} className={'rounded-lg px-4 py-2 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ' + (filters.mode === mode ? 'bg-brand-500 text-white shadow-card' : 'text-ink-600 hover:bg-surface-default hover:text-ink-900')}>{label}</button>)}
          </div>
        </div>

        {(filters.mode === 'month' || filters.mode === 'year') && <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-36 flex-1 text-sm text-ink-600">السنة
            <select value={filters.year} onChange={(event) => updateYear(event.target.value)} className="input mt-1 w-full rounded-lg px-3 py-2 text-sm text-ink-900">
              {years.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </label>
          {filters.mode === 'month' && <>
            <label className="min-w-36 flex-1 text-sm text-ink-600">من شهر
              <select value={filters.fromMonth} onChange={(event) => event.target.value ? setFilters((current) => ({ ...current, fromMonth: event.target.value, toMonth: '' })) : reset()} className="input mt-1 w-full rounded-lg px-3 py-2 text-sm text-ink-900">
                <option value="">العرض الافتراضي</option>
                {MONTHS.map((month, index) => <option key={month} value={index + 1} disabled={index + 1 > maxMonth}>{month}</option>)}
              </select>
            </label>
            <label className="min-w-36 flex-1 text-sm text-ink-600">إلى شهر <span className="text-ink-500">(اختياري)</span>
              <select value={filters.toMonth} onChange={(event) => setFilters((current) => ({ ...current, toMonth: event.target.value }))} disabled={!filters.fromMonth} className="input mt-1 w-full rounded-lg px-3 py-2 text-sm text-ink-900 disabled:opacity-50">
                <option value="">شهر واحد</option>
                {MONTHS.map((month, index) => <option key={month} value={index + 1} disabled={index + 1 < Number(filters.fromMonth) || index + 1 > maxMonth}>{month}</option>)}
              </select>
            </label>
          </>}
        </div>}

        {filters.mode === 'day' && <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-ink-600">من تاريخ <Input aria-label="تاريخ بداية الفترة" type="date" max={dateValue(today)} value={filters.fromDate} onChange={(event) => setFilters((current) => ({ ...current, fromDate: event.target.value }))} /></label>
          <label className="text-sm text-ink-600">إلى تاريخ <Input aria-label="تاريخ نهاية الفترة" type="date" max={dateValue(today)} value={filters.toDate} onChange={(event) => setFilters((current) => ({ ...current, toDate: event.target.value }))} /></label>
        </div>}

        {filters.mode === 'month' && <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-ink-500">اختيار سريع:</span>
          {[1, 2, 3, 5].map((count) => <Button key={count} type="button" size="sm" variant="subtle" onClick={() => setQuickMonths(count)}>{count === 1 ? 'الشهر الحالي' : 'آخر ' + formatNumber(count) + ' أشهر'}</Button>)}
        </div>}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-muted px-4 py-3">
          <p aria-live="polite" className="text-sm font-semibold text-ink-700">{validationError || (isDefaultView ? 'المعروض افتراضياً: ' + periodLabel : 'المعروض: ' + periodLabel)}</p>
          <Button type="button" size="sm" variant="ghost" onClick={reset}>العودة للعرض الافتراضي</Button>
        </div>
        {validationError && <p role="alert" className="text-sm text-danger-DEFAULT">{validationError}</p>}
      </section>

      <section aria-labelledby="profit-heading" className="space-y-4">
        <div className="flex items-center gap-2"><CircleDollarSign size={20} className="text-success-DEFAULT" aria-hidden="true" /><h3 id="profit-heading" className="text-lg font-bold text-ink-900">الأرباح</h3><Badge variant="neutral">{isDefaultView ? 'حسب الأسبوع' : filters.mode === 'day' ? 'حسب اليوم' : 'حسب الشهر'}</Badge></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {loading && !validationError ? Array.from({ length: 4 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl bg-surface-muted" />)
            : cardError ? <div className="sm:col-span-2 lg:col-span-4"><Card title="ملخص الأرباح" error={cardError} onRetry={retryLoad} /></div>
              : <>
                <Kpi label="إجمالي الأرباح" value={formatCurrency(analysis?.profits?.total)} detail={formatPercent(analysis?.profits?.percentChange) + ' مقارنة بالفترة السابقة'} tone={profitGrowthTone} />
                <Kpi label="متوسط الفترة" value={formatCurrency(analysis?.profits?.average)} detail="لكل أسبوع أو شهر أو يوم" />
                <Kpi label="أفضل فترة" value={analysis?.profits?.bestPeriod?.label || '—'} detail={formatCurrency(analysis?.profits?.bestPeriod?.amount)} />
                <Kpi label="عدد الفترات" value={formatNumber(analysis?.profits?.dataPoints)} detail="تشمل الفترات بلا معاملات" />
              </>}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title={isDefaultView ? 'توزيع الأرباح حسب الأسبوع' : 'توزيع الأرباح حسب الفترة'} subtitle={periodLabel} loading={loading && !validationError} error={cardError} onRetry={retryLoad}>
            <PieContents data={profitPie} currency reduceMotion={reduceMotion} />
          </Card>
          <Card title={'تدفق الأرباح — ' + periodLabel} unit="ج.م" loading={loading && !validationError} error={cardError} onRetry={retryLoad}>
            <FlowChart data={profitFlowData} series={[{ key: 'profit', name: 'الأرباح', color: CHART_COLORS[0] }]} currency reduceMotion={reduceMotion} ariaLabel="تدفق الأرباح خلال الفترة" />
          </Card>
        </div>
      </section>

      <section aria-labelledby="students-heading" className="space-y-4">
        <div className="flex items-center gap-2"><GraduationCap size={20} className="text-brand-500" aria-hidden="true" /><h3 id="students-heading" className="text-lg font-bold text-ink-900">تحليلات الطلاب</h3></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {loading && !validationError ? Array.from({ length: 5 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl bg-surface-muted" />)
            : cardError ? <div className="sm:col-span-2 lg:col-span-5"><Card title="ملخص الطلاب" error={cardError} onRetry={retryLoad} /></div>
              : <>
                <Kpi label="إجمالي الطلاب" value={formatNumber(analysis?.students?.total)} detail="حتى نهاية الفترة" />
                <Kpi label={analysis?.period?.isDefault ? 'جدد هذا الشهر' : 'جدد خلال الفترة'} value={formatNumber(analysis?.students?.newInPeriod)} detail={formatPercent(analysis?.students?.newPercentChange) + ' مقارنة بالفترة السابقة'} tone={studentGrowthTone} />
                <Kpi label={analysis?.period?.isDefault ? 'جدد الشهر الماضي' : 'جدد الفترة السابقة'} value={formatNumber(analysis?.students?.newPreviousPeriod)} detail="تسجيلات جديدة" />
                <Kpi label="نشطون تعليمياً" value={formatNumber(analysis?.students?.active)} detail="مشاهدة خلال آخر 30 يوماً" tone="positive" />
                <Kpi label="غير نشطين" value={formatNumber(analysis?.students?.inactive)} detail="من إجمالي الطلاب" tone="negative" />
              </>}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title={isDefaultView ? 'تركيبة الطلاب' : 'الطلاب الجدد حسب الفترة'} subtitle={periodLabel} loading={loading && !validationError} error={cardError} onRetry={retryLoad}>
            <PieContents data={studentPie} reduceMotion={reduceMotion} />
          </Card>
          <Card title={isDefaultView ? 'تسجيلات الطلاب الجدد أسبوعياً' : 'تدفق التسجيلات — ' + periodLabel} unit="طالب" loading={loading && !validationError} error={cardError} onRetry={retryLoad}>
            {isDefaultView
              ? <FlowChart data={studentFlowData} series={[{ key: 'current', name: 'هذا الشهر', color: CHART_COLORS[0] }, { key: 'previous', name: 'الشهر الماضي', color: CHART_COLORS[1] }]} reduceMotion={reduceMotion} ariaLabel="تسجيلات الطلاب الجديدة أسبوعياً هذا الشهر والشهر الماضي" />
              : <FlowChart data={studentFlowData} series={[{ key: 'registrations', name: 'طلاب جدد', color: CHART_COLORS[1] }]} reduceMotion={reduceMotion} ariaLabel="تسجيلات الطلاب الجدد خلال الفترة" />}
          </Card>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="نشطون مقابل غير نشطين" subtitle="نشط تعليمياً = مشاهدة محاضرة خلال آخر 30 يوماً" loading={loading && !validationError} error={cardError} onRetry={retryLoad}>
            <div>
              <div className="flex flex-wrap justify-between gap-2 text-sm font-semibold">
                <span className="text-success-text">نشطون: {formatNumber(analysis?.students?.active)} ({formatNumber(analysis?.students?.total ? analysis.students.active / analysis.students.total * 100 : 0)}٪)</span>
                <span className="text-danger-DEFAULT">غير نشطين: {formatNumber(analysis?.students?.inactive)} ({formatNumber(analysis?.students?.total ? analysis.students.inactive / analysis.students.total * 100 : 0)}٪)</span>
              </div>
              <div className="mt-3 flex h-3 overflow-hidden rounded-pill bg-surface-muted" role="img" aria-label="نسبة الطلاب النشطين تعليمياً وغير النشطين">
                <div className="bg-success-DEFAULT transition-all duration-700" style={{ width: (analysis?.students?.total ? analysis.students.active / analysis.students.total * 100 : 0) + '%' }} />
                <div className="bg-danger-DEFAULT transition-all duration-700" style={{ width: (analysis?.students?.total ? analysis.students.inactive / analysis.students.total * 100 : 0) + '%' }} />
              </div>
            </div>
          </Card>
          <Card title="مؤشرات المنصة" subtitle="الدورات المنشورة حالياً، والواجبات المقدمة في الفترة المحددة" loading={loading && !validationError} error={cardError} onRetry={retryLoad}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-surface-muted p-4"><p className="text-xs text-ink-500">دورات منشورة حالياً</p><strong className="mt-1 block text-xl text-ink-900">{formatNumber(analysis?.platform?.publishedCourses)}</strong></div>
              <div className="rounded-xl bg-surface-muted p-4"><p className="text-xs text-ink-500">واجبات معلقة للتصحيح</p><strong className="mt-1 block text-xl text-ink-900">{formatNumber(analysis?.platform?.pendingAssignments)}</strong></div>
              {(analysis?.profits?.revenueBySource || []).map((source) => <div key={source.source} className="rounded-xl bg-surface-muted p-4"><p className="text-xs text-ink-500">{SOURCE_LABELS[source.source] || source.source}</p><strong className="mt-1 block text-lg text-ink-900">{formatCurrency(source.amount)}</strong><span className="text-xs text-ink-500">{formatNumber(analysis.profits.revenueSourceTotal ? source.amount / analysis.profits.revenueSourceTotal * 100 : 0)}٪ من المشتريات المسجلة</span></div>)}
              {Number(analysis?.profits?.scratchcardTopups?.count) > 0 && <div className="rounded-xl bg-surface-muted p-4"><p className="text-xs text-ink-500">شحنات كروت الشحن</p><strong className="mt-1 block text-lg text-ink-900">{formatCurrency(analysis.profits.scratchcardTopups.amount)}</strong><span className="text-xs text-ink-500">{formatNumber(analysis.profits.scratchcardTopups.count)} عملية شحن</span></div>}
              {!(analysis?.profits?.revenueBySource || []).length && <p className="text-sm text-ink-500 sm:col-span-2">لا توجد مشتريات مسجلة لهذه الفترة.</p>}
            </div>
          </Card>
        </div>
      </section>
    </section>
  );
}

