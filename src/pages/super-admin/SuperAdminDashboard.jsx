export const route = { path: '/super-admin', index: true, auth: 'required', roles: ['super_admin'], title: 'الإدارة العليا' };

import React, { useEffect, useState } from 'react';
import { Building2, CircleAlert, CircleCheck, Clock3, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import superAdminService from '../../services/superAdminService';

const cards = [{ key: 'all', label: 'إجمالي المؤسسات', icon: Building2 }, { key: 'active', label: 'نشطة', icon: CircleCheck }, { key: 'trial', label: 'تجريبية', icon: Clock3 }, { key: 'suspended', label: 'معلّقة', icon: CircleAlert }];

export default function SuperAdminDashboard() {
  const [tenants, setTenants] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { superAdminService.listTenants().then((res) => setTenants(res.data.data || [])).catch((err) => setError(err?.message || 'تعذر تحميل بيانات المؤسسات')).finally(() => setLoading(false)); }, []);
  const count = (key) => key === 'all' ? tenants.length : tenants.filter((tenant) => tenant.subscriptionStatus === key).length;
  if (loading) return <div className="rounded-2xl bg-surface-default p-8 text-ink-500 shadow-card">جارٍ تحميل لوحة الإدارة...</div>;
  if (error) return <div className="rounded-2xl bg-danger-soft p-5 text-danger-DEFAULT">{error}</div>;
  return <div className="space-y-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-3xl font-bold">مرحباً بك</h2><p className="mt-2 text-ink-500">ملخص المؤسسات المسجلة على المنصة.</p></div><Link to="/super-admin/tenants/new" className="rounded-full bg-brand-500 px-5 py-3 text-sm font-bold text-white shadow-pop hover:bg-brand-600">إضافة مؤسسة</Link></div><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ key, label, icon: Icon }) => <div key={key} className="rounded-2xl border border-surface-border bg-surface-default p-5 shadow-card"><Icon className="text-brand-600" size={22} /><p className="mt-5 text-3xl font-bold">{count(key).toLocaleString('ar-EG')}</p><p className="mt-1 text-sm text-ink-500">{label}</p></div>)}</section><section className="rounded-2xl border border-surface-border bg-surface-default shadow-card"><div className="flex items-center justify-between border-b border-surface-border px-5 py-4"><h3 className="font-bold">أحدث المؤسسات</h3><Link className="text-sm font-semibold text-brand-600" to="/super-admin/tenants">عرض الكل</Link></div>{tenants.length ? <div className="divide-y divide-surface-border">{tenants.slice(0, 5).map((tenant) => <Link key={tenant._id} to={`/super-admin/tenants/${tenant._id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface-muted"><span><b className="block">{tenant.name}</b><span className="text-sm text-ink-500">{tenant.subdomain}</span></span><span className="text-sm text-ink-600">{tenant.subscriptionStatus}</span></Link>)}</div> : <div className="p-8 text-center text-ink-500"><Users className="mx-auto mb-3" />لا توجد مؤسسات بعد.</div>}</section></div>;
}
