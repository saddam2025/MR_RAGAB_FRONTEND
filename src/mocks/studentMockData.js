// src/mocks/studentMockData.js
// Mock data for the logged-in student's own dashboard/profile views
// (StudentDashboard.jsx and related student pages).

export const studentProfile = {
  id: 'student-1',
  name: 'يوسف الكعبي',
  email: 'youssef.k@example.com',
  avatar: '/images/avatars/boy1.png',
  role: 'student',
  grade: 'اولى اعدادي',
  stage: 'grade-7',
  password: 'password123',
  instructorId: 'ins-1',
  subscriptionType: 'monthly', // 'monthly' | 'per-lecture'
  subscriptionStatus: 'active', // 'active' | 'expired' | 'pending-exam'
  subscriptionRenewsAt: '2026-08-01T00:00:00Z',
  monthlyExamPassed: true,
  averageScore: 88,
  completedLessons: 24,
  pendingAssignments: 2,
  totalWatchHours: 37
};

export const enrolledCourses = [
  {
    id: 'course-101',
    title: 'أساسيات الجبر',
    instructor: 'أ. أحمد العتيبي',
    thumbnail: '/images/courses/algebra.png',
    category: 'الشهر الأول',
    progressPercent: 72,
    lastActivity: '2026-07-15T10:30:00Z',
    accessExpiresAt: '2026-07-25T00:00:00Z',
    viewsUsed: 3,
    maxViews: 10,
    nextLessonLocked: false
  },
  {
    id: 'course-201',
    title: 'الهندسة المبسطة',
    instructor: 'أ. فاطمة',
    thumbnail: '/images/courses/geometry.png',
    category: 'الوحدة الثانية',
    progressPercent: 40,
    lastActivity: '2026-07-10T14:20:00Z',
    accessExpiresAt: '2026-07-20T00:00:00Z',
    viewsUsed: 6,
    maxViews: 10,
    nextLessonLocked: true
  },
  {
    id: 'course-301',
    title: 'مقدمة في الإحصاء',
    thumbnail: '/images/courses/stats.png',
    instructor: 'أ. خالد',
    category: 'الشهر الأول',
    progressPercent: 15,
    lastActivity: '2026-07-05T09:00:00Z',
    accessExpiresAt: '2026-07-30T00:00:00Z',
    viewsUsed: 1,
    maxViews: 10,
    nextLessonLocked: false
  }
];

// AssignmentSubmissionPage — assignments the student owes work on.
export const studentAssignments = [
  {
    id: 'assign-1',
    courseId: 'course-101',
    courseTitle: 'أساسيات الجبر',
    title: 'واجب: حل المعادلات',
    dueAt: '2026-08-16T23:59:00Z',
    status: 'submitted', // 'not_submitted' | 'submitted' | 'graded'
    submittedAt: '2026-08-14T20:10:00Z',
    score: null,
    maxScore: 20,
    questions: [
      { id: 'q1', prompt: 'حل المعادلة: 3س - 6 = 9', type: 'text' },
      { id: 'q2', prompt: 'ارسم بيان المعادلة: ص = 2س + 1', type: 'upload' }
    ]
  },
  {
    id: 'assign-2',
    courseId: 'course-201',
    courseTitle: 'الهندسة المبسطة',
    title: 'واجب: مسائل الهندسة',
    dueAt: '2026-08-12T23:59:00Z',
    status: 'not_submitted',
    submittedAt: null,
    score: null,
    maxScore: 15,
    questions: [
      { id: 'q1', prompt: 'احسب مساحة مثلث طول قاعدته 8سم وارتفاعه 5سم', type: 'text' }
    ]
  }
];

// QuizTakingPage / QuizResultsPage
export const studentQuizzes = [
  {
    id: 'quiz-1',
    courseId: 'course-101',
    title: 'اختبار الوحدة الأولى - المعادلات',
    durationMinutes: 20,
    questionsCount: 10,
    attemptsAllowed: 2,
    attemptsUsed: 1,
    status: 'available' // 'available' | 'completed' | 'locked'
  },
  {
    id: 'quiz-2',
    courseId: 'course-201',
    title: 'اختبار سريع - الهندسة',
    durationMinutes: 10,
    questionsCount: 6,
    attemptsAllowed: 1,
    attemptsUsed: 1,
    status: 'completed'
  }
];

export const quizSubmissionResults = {
  'sub-quiz-2': {
    quizId: 'quiz-2',
    quizTitle: 'اختبار سريع - الهندسة',
    score: 5,
    maxScore: 6,
    passingScore: 3,
    passed: true,
    submittedAt: '2026-07-18T11:20:00Z',
    answers: [
      { questionId: 'q1', prompt: 'ما مجموع زوايا المثلث؟', selected: '180 درجة', correct: '180 درجة', isCorrect: true },
      { questionId: 'q2', prompt: 'كم عدد أضلاع الشكل السداسي؟', selected: '5', correct: '6', isCorrect: false }
    ]
  }
};

// RetryIncorrectQuestionsPage — pulls straight from the wrong answers above.
export const incorrectQuestionsBank = {
  'quiz-2': [
    {
      questionId: 'q2',
      prompt: 'كم عدد أضلاع الشكل السداسي؟',
      options: ['4', '5', '6', '8'],
      correctOptionIndex: 2
    }
  ]
};

// MonthlyExamGatePage
export const monthlyExamGate = {
  examId: 'monthly-exam-aug-2026',
  title: 'اختبار الشهر - أغسطس',
  requiredToUnlock: true,
  attemptsAllowed: 1,
  attemptsUsed: 0,
  passingScore: 60,
  durationMinutes: 40,
  questionsCount: 20,
  status: 'not_started' // 'not_started' | 'in_progress' | 'passed' | 'failed'
};

// ReelsViewerPage — short-form review clips tied to lessons.
export const studentReels = [
  {
    id: 'reel-1',
    courseId: 'course-101',
    title: 'اختصار حل المعادلات في 60 ثانية',
    thumbnail: '/images/reels/reel1.png',
    videoUrl: '/mock/reels/reel1.mp4',
    durationSeconds: 58,
    likes: 214
  },
  {
    id: 'reel-2',
    courseId: 'course-201',
    title: 'خدعة لحساب مساحة المثلث بسرعة',
    thumbnail: '/images/reels/reel2.png',
    videoUrl: '/mock/reels/reel2.mp4',
    durationSeconds: 45,
    likes: 176
  },
  {
    id: 'reel-3',
    courseId: 'course-301',
    title: 'الفرق بين المتوسط والوسيط في ثانيتين',
    thumbnail: '/images/reels/reel3.png',
    videoUrl: '/mock/reels/reel3.mp4',
    durationSeconds: 62,
    likes: 98
  }
];

// Student-facing notifications (used by NotificationCenter for this role).
export const studentNotifications = [
  { id: 'sn-1', title: 'تم تصحيح واجبك', body: 'واجب: مسائل تطبيقية — الدرجة 18/20', date: '2026-08-13T12:30:00Z', read: false },
  { id: 'sn-2', title: 'اختبار جديد متاح', body: 'اختبار الوحدة الأولى - المعادلات أصبح متاحًا', date: '2026-08-10T08:00:00Z', read: true },
  { id: 'sn-3', title: 'تذكير بالاشتراك', body: 'سيتم تجديد اشتراكك خلال 5 أيام', date: '2026-07-27T08:00:00Z', read: true }
];
