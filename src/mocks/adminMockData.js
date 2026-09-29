// src/mocks/adminMockData.js
// Mock data for the admin-facing pages: AdminDashboard, CourseManagementPage,
// CourseEditorPage, QuizBuilderPage, ScratchCardManager, TenantSettingsPage.

export const adminProfile = {
  id: 'admin-1',
  name: 'أ. أحمد العتيبي',
  email: 'ahmed.otaibi@example.com',
  role: 'admin',
  instructorId: 'ins-1',
  avatar: '/images/instructors/ahmed.png'
};

export const adminStats = {
  totalStudents: 1284,
  activeCourses: 37,
  monthlyRevenue: 42150,
  pendingGrading: 19,
  newSignupsThisWeek: 46,
  averagePassRate: 78
};

export const revenueSeries = [
  { month: 'فبراير', revenue: 28500 },
  { month: 'مارس', revenue: 31200 },
  { month: 'أبريل', revenue: 29800 },
  { month: 'مايو', revenue: 35600 },
  { month: 'يونيو', revenue: 38900 },
  { month: 'يوليو', revenue: 42150 }
];

export const recentSignups = [
  { id: 'stu-201', name: 'مريم سالم', grade: 'تانية اعدادي', joinedAt: '2026-08-14T09:10:00Z' },
  { id: 'stu-202', name: 'عبدالله ناصر', grade: 'اولى ثانوي', joinedAt: '2026-08-13T18:40:00Z' },
  { id: 'stu-203', name: 'جنى فتحي', grade: 'اولى اعدادي', joinedAt: '2026-08-13T11:05:00Z' },
  { id: 'stu-204', name: 'حمزة وليد', grade: 'تانية ثانوي', joinedAt: '2026-08-12T20:15:00Z' }
];

// Full course catalog as seen from the admin/course-management screen —
// superset of tenantMockData's public catalog, with admin-only fields.
export const adminCourses = [
  {
    id: 'course-101',
    title: 'أساسيات الجبر',
    stage: 'grade-7',
    category: 'الشهر الأول',
    status: 'published', // 'draft' | 'published' | 'archived'
    price: 150,
    lessonsCount: 12,
    enrolledCount: 312,
    completionRate: 68,
    updatedAt: '2026-07-20T10:00:00Z'
  },
  {
    id: 'course-201',
    title: 'الهندسة المبسطة',
    stage: 'grade-8',
    category: 'الوحدة الثانية',
    status: 'published',
    price: 180,
    lessonsCount: 9,
    enrolledCount: 248,
    completionRate: 54,
    updatedAt: '2026-07-18T14:30:00Z'
  },
  {
    id: 'course-301',
    title: 'مقدمة في الإحصاء',
    stage: 'grade-9',
    category: 'الشهر الأول',
    status: 'published',
    price: 170,
    lessonsCount: 14,
    enrolledCount: 190,
    completionRate: 61,
    updatedAt: '2026-07-05T09:15:00Z'
  },
  {
    id: 'course-401',
    title: 'التفاضل والتكامل',
    stage: 'grade-11',
    category: 'الوحدة الثالثة',
    status: 'published',
    price: 220,
    lessonsCount: 16,
    enrolledCount: 134,
    completionRate: 45,
    updatedAt: '2026-06-28T13:00:00Z'
  },
  {
    id: 'course-501',
    title: 'مراجعة نهائية - ثانوية عامة',
    stage: 'grade-12',
    category: 'مراجعات',
    status: 'draft',
    price: 250,
    lessonsCount: 0,
    enrolledCount: 0,
    completionRate: 0,
    updatedAt: '2026-08-10T08:00:00Z'
  }
];

// Detail shape for CourseEditorPage — lessons/sections for one course.
export const courseEditorDetail = {
  'course-101': {
    id: 'course-101',
    title: 'أساسيات الجبر',
    description: 'مراجعة قوية لمفاهيم الجبر الأساسية للمرحلة الإعدادية',
    stage: 'grade-7',
    price: 150,
    status: 'published',
    sections: [
      {
        id: 'sec-1',
        title: 'الوحدة الأولى: المعادلات',
        lessons: [
          { id: 'les-1', title: 'مقدمة في المعادلات', durationMinutes: 14, videoStatus: 'ready' },
          { id: 'les-2', title: 'حل المعادلات من الدرجة الأولى', durationMinutes: 21, videoStatus: 'ready' },
          { id: 'les-3', title: 'تطبيقات عملية', durationMinutes: 18, videoStatus: 'processing' }
        ]
      },
      {
        id: 'sec-2',
        title: 'الوحدة الثانية: المتباينات',
        lessons: [
          { id: 'les-4', title: 'مقدمة في المتباينات', durationMinutes: 12, videoStatus: 'ready' },
          { id: 'les-5', title: 'حل المتباينات المركبة', durationMinutes: 19, videoStatus: 'not_uploaded' }
        ]
      }
    ]
  }
};

// QuizBuilderPage
export const quizzes = [
  {
    id: 'quiz-1',
    title: 'اختبار الوحدة الأولى - المعادلات',
    courseId: 'course-101',
    questionsCount: 10,
    durationMinutes: 20,
    attemptsAllowed: 2,
    status: 'published',
    passingScore: 60
  },
  {
    id: 'quiz-2',
    title: 'اختبار سريع - الهندسة',
    courseId: 'course-201',
    questionsCount: 6,
    durationMinutes: 10,
    attemptsAllowed: 1,
    status: 'published',
    passingScore: 50
  },
  {
    id: 'quiz-3',
    title: 'اختبار شامل - الإحصاء',
    courseId: 'course-301',
    questionsCount: 15,
    durationMinutes: 30,
    attemptsAllowed: 1,
    status: 'draft',
    passingScore: 65
  }
];

export const quizQuestions = {
  'quiz-1': [
    {
      id: 'q1',
      type: 'mcq',
      prompt: 'ما ناتج حل المعادلة: 2س + 4 = 10 ؟',
      options: ['س = 2', 'س = 3', 'س = 4', 'س = 6'],
      correctOptionIndex: 1,
      points: 10
    },
    {
      id: 'q2',
      type: 'mcq',
      prompt: 'أي مما يلي يمثل معادلة من الدرجة الأولى؟',
      options: ['س² + 2 = 0', '3س - 5 = 7', 'س³ = 8', 'لا شيء مما سبق'],
      correctOptionIndex: 1,
      points: 10
    }
  ]
};

// ScratchCardManager
export const scratchCardBatches = [
  {
    id: 'batch-1',
    label: 'دفعة أغسطس - كروت شهرية',
    cardType: 'monthly',
    totalCards: 500,
    usedCards: 312,
    createdAt: '2026-08-01T00:00:00Z',
    pricePerCard: 199
  },
  {
    id: 'batch-2',
    label: 'دفعة يوليو - كروت المحاضرة الواحدة',
    cardType: 'per-lecture',
    totalCards: 1000,
    usedCards: 640,
    createdAt: '2026-07-05T00:00:00Z',
    pricePerCard: 15
  },
  {
    id: 'batch-3',
    label: 'دفعة تجريبية - صف ثاني عشر',
    cardType: 'monthly',
    totalCards: 100,
    usedCards: 12,
    createdAt: '2026-08-10T00:00:00Z',
    pricePerCard: 250
  }
];

export const scratchCardSamples = {
  'batch-1': [
    { code: 'MATH-8X2K-91QF', status: 'used', usedBy: 'مريم سالم', usedAt: '2026-08-12T10:00:00Z' },
    { code: 'MATH-3D7L-22RT', status: 'unused', usedBy: null, usedAt: null },
    { code: 'MATH-9P0Z-44WE', status: 'unused', usedBy: null, usedAt: null }
  ]
};

// TenantSettingsPage
export const tenantSettings = {
  brandName: 'منصة',
  logoUrl: '/images/instructors/ahmed.png',
  primaryColor: '#F5B915',
  subject: 'رياضيات',
  supportPhone: '+20 100 123 4567',
  supportEmail: 'support@riyadiaty.example.com',
  paymentGateways: {
    paymob: { enabled: true, integrationId: 'PMB-778812' },
    scratchCards: { enabled: true }
  },
  videoDelivery: {
    provider: 'bunny.net',
    pullZone: 'riyadiaty-vod',
    maxViewsPerLesson: 10,
    accessWindowDays: 10
  },
  notifications: {
    smsEnabled: true,
    emailEnabled: true,
    whatsappEnabled: false
  }
};

// Admin's view of all students (for a student list / search screen and
// StudentProfileDetailPage).
export const adminStudents = [
  {
    id: 'stu-101',
    name: 'يوسف الكعبي',
    grade: 'اولى اعدادي',
    email: 'youssef.k@example.com',
    subscriptionStatus: 'active',
    averageScore: 88,
    lastActive: '2026-08-14T18:00:00Z'
  },
  {
    id: 'stu-102',
    name: 'سارة العتيبي',
    grade: 'اولى اعدادي',
    email: 'sara.otaibi@example.com',
    subscriptionStatus: 'active',
    averageScore: 86,
    lastActive: '2026-08-14T09:00:00Z'
  },
  {
    id: 'stu-103',
    name: 'مريم سالم',
    grade: 'تانية اعدادي',
    email: 'mariam.salem@example.com',
    subscriptionStatus: 'pending-exam',
    averageScore: 74,
    lastActive: '2026-08-13T15:20:00Z'
  },
  {
    id: 'stu-104',
    name: 'عبدالله ناصر',
    grade: 'اولى ثانوي',
    email: 'abdullah.nasser@example.com',
    subscriptionStatus: 'expired',
    averageScore: 65,
    lastActive: '2026-08-01T08:00:00Z'
  }
];
