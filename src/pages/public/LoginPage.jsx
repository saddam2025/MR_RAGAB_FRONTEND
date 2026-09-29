export const route = { path: ['/login', '/:instructorId/login'], index: false, auth: 'guest', title: 'تسجيل الدخول' };

import React from 'react';
import { useParams } from 'react-router-dom';
import LoginForm from '../../components/forms/LoginForm';
import Navbar from '../../layouts/Navbar';
import authImage from '../../assets/landing/log in and sign up pages.jpg';

export default function LoginPage() {
  const { instructorId } = useParams();
  return <div className="min-h-screen bg-surface-canvas text-ink-900" dir="rtl"><Navbar /><div className="grid min-h-[calc(100vh-84px)] grid-cols-1 lg:grid-cols-2"><aside className="hidden items-center justify-center bg-[#eaf5ff] p-8 lg:flex"><div className="max-w-md text-right"><img src={authImage} alt="تجربة تعليمية" className="w-full rounded-[2rem] bg-white object-contain p-3 shadow-card" /><h2 className="mt-7 text-3xl font-extrabold text-[#102650]">نورتنا تاني</h2><p className="mt-3 leading-7 text-[#526b8d]">كمّل رحلتك وتابع كل اللي فاتك بسهولة.</p></div></aside><main className="flex items-center justify-center px-4 py-12 sm:px-8"><div className="w-full max-w-md"><div className="mb-8 text-right"><h1 className="text-3xl font-bold text-ink-900">تسجيل الدخول</h1><p className="mt-2 text-sm text-ink-500">اكتب بياناتك عشان تدخل لحسابك</p></div><div className="rounded-3xl bg-surface-default p-6 shadow-card sm:p-8"><LoginForm instructorId={instructorId} /></div></div></main></div></div>;
}
