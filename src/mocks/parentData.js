// Mock data used by parent pages
// Place this file at src/mocks/parentData.js

export const children = [
  {
    id: 'child-1',
    name: 'سارة العتيبي',
    grade: 'اولى اعدادي',
    avatar: '/images/avatars/girl1.png',
    enrolledCourses: 3,
  },
  {
    id: 'child-2',
    name: 'يوسف الكعبي',
    grade: 'اولى اعدادي',
    avatar: '/images/avatars/boy1.png',
    enrolledCourses: 4,
  },
];

export const reports = {
  'child-1': {
    summary: {
      completedLessons: 18,
      pendingAssignments: 2,
      averageScore: 86,
      lastActive: '2026-07-14T10:30:00Z',
    },
    courses: [
      {
        id: 'course-101',
        title: 'أساسيات الرياضيات',
        instructor: 'أ. أحمد العتيبي',
        progressPercent: 72,
        lastActivity: '2026-07-12T09:00:00Z',
      },
      {
        id: 'course-201',
        title: 'الهندسة المبسطة',
        instructor: 'أ. فاطمة',
        progressPercent: 40,
        lastActivity: '2026-06-30T14:20:00Z',
      },
    ],
    recentGrades: [
      { id: 'g1', title: 'اختبار الأسبوع 5', score: 92, date: '2026-07-10' },
      { id: 'g2', title: 'واجب: نظرية فيثاغورس', score: 78, date: '2026-07-05' },
      { id: 'g3', title: 'اختبار سريع', score: 88, date: '2026-06-28' },
    ],
  },

  'child-2': {
    summary: {
      completedLessons: 34,
      pendingAssignments: 0,
      averageScore: 91,
      lastActive: '2026-07-15T16:45:00Z',
    },
    courses: [
      {
        id: 'course-301',
        title: 'الجبر المتقدم',
        instructor: 'أ. خالد',
        progressPercent: 85,
        lastActivity: '2026-07-15T16:00:00Z',
      },
      {
        id: 'course-102',
        title: 'التفاضل والتكامل',
        instructor: 'أ. أحمد العتيبي',
        progressPercent: 60,
        lastActivity: '2026-07-01T11:10:00Z',
      },
    ],
    recentGrades: [
      { id: 'g4', title: 'اختبار منتصف الفصل', score: 95, date: '2026-07-08' },
      { id: 'g5', title: 'واجب: مسائل تطبيقية', score: 89, date: '2026-07-02' },
    ],
  },
};

export const activities = {
  'child-1': [
    { id: 'a1', type: 'lesson', title: 'مشاهدة درس: الكسور', date: '2026-07-14T10:00:00Z' },
    { id: 'a2', type: 'quiz', title: 'أداء اختبار: الأسبوع 5', date: '2026-07-10T09:30:00Z' },
    { id: 'a3', type: 'assignment', title: 'تسليم واجب: مسائل تطبيقية', date: '2026-07-05T12:00:00Z' },
  ],
  'child-2': [
    { id: 'a4', type: 'lesson', title: 'مشاهدة درس: معادلات تفاضلية', date: '2026-07-15T16:00:00Z' },
    { id: 'a5', type: 'quiz', title: 'أداء اختبار: منتصف الفصل', date: '2026-07-08T10:00:00Z' },
  ],
};

// ParentDashboard — top-level notifications shown alongside the children list.
export const parentNotifications = [
  {
    id: 'pn-1',
    childId: 'child-1',
    title: 'نتيجة اختبار جديدة',
    body: 'حصلت سارة على 92% في اختبار الأسبوع 5.',
    date: '2026-07-10T09:35:00Z',
    read: false,
  },
  {
    id: 'pn-2',
    childId: 'child-2',
    title: 'تذكير بالاشتراك',
    body: 'سيتم تجديد اشتراك يوسف الشهري خلال 5 أيام.',
    date: '2026-07-27T08:00:00Z',
    read: false,
  },
  {
    id: 'pn-3',
    childId: 'child-1',
    title: 'واجب متأخر',
    body: 'لدى سارة واجب لم يتم تسليمه بعد: نظرية فيثاغورس.',
    date: '2026-07-06T07:00:00Z',
    read: true,
  },
];

export const parentProfile = {
  id: 'parent-1',
  name: 'وليد العتيبي',
  email: 'walid.otaibi@example.com',
  phone: '+20 101 234 5678',
  role: 'parent',
  instructorId: 'ins-1',
  linkedChildIds: ['child-1', 'child-2'],
};
