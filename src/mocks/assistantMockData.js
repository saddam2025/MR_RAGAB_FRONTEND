// src/mocks/assistantMockData.js
// Mock data for the assistant-facing pages: AssistantDashboard,
// AssignmentGradingPage, ParentMessagesInboxPage.

export const assistantProfile = {
  id: 'asst-1',
  name: 'أ. منى فؤاد',
  email: 'mona.fouad@example.com',
  role: 'assistant',
  instructorId: 'ins-1',
  assignedStages: ['grade-7', 'grade-8']
};

export const assistantStats = {
  pendingGrading: 19,
  gradedToday: 7,
  unreadParentMessages: 4,
  averageTurnaroundHours: 6
};

// Queue of ungraded submissions shown on AssistantDashboard and used as the
// list AssignmentGradingPage opens items from.
export const pendingSubmissions = [
  {
    id: 'sub-1',
    assignmentId: 'assign-1',
    assignmentTitle: 'واجب: حل المعادلات',
    studentId: 'stu-101',
    studentName: 'يوسف الكعبي',
    courseTitle: 'أساسيات الجبر',
    submittedAt: '2026-08-14T20:10:00Z',
    status: 'pending' // 'pending' | 'graded'
  },
  {
    id: 'sub-2',
    assignmentId: 'assign-1',
    assignmentTitle: 'واجب: حل المعادلات',
    studentId: 'stu-103',
    studentName: 'مريم سالم',
    courseTitle: 'أساسيات الجبر',
    submittedAt: '2026-08-14T18:45:00Z',
    status: 'pending'
  },
  {
    id: 'sub-3',
    assignmentId: 'assign-2',
    assignmentTitle: 'واجب: مسائل الهندسة',
    studentId: 'stu-102',
    studentName: 'سارة العتيبي',
    courseTitle: 'الهندسة المبسطة',
    submittedAt: '2026-08-13T12:30:00Z',
    status: 'graded',
    score: 18,
    maxScore: 20
  },
  {
    id: 'sub-4',
    assignmentId: 'assign-3',
    assignmentTitle: 'واجب: تمارين الإحصاء',
    studentId: 'stu-104',
    studentName: 'عبدالله ناصر',
    courseTitle: 'مقدمة في الإحصاء',
    submittedAt: '2026-08-12T09:00:00Z',
    status: 'pending'
  }
];

// Detail shape opened by AssignmentGradingPage for a single submission.
export const submissionDetail = {
  'sub-1': {
    id: 'sub-1',
    assignmentTitle: 'واجب: حل المعادلات',
    studentName: 'يوسف الكعبي',
    submittedAt: '2026-08-14T20:10:00Z',
    maxScore: 20,
    answers: [
      { questionId: 'q1', prompt: 'حل المعادلة: 3س - 6 = 9', answerText: 'س = 5', attachmentUrl: null },
      { questionId: 'q2', prompt: 'ارسم بيان المعادلة: ص = 2س + 1', answerText: null, attachmentUrl: '/mock/submissions/sub-1-q2.png' }
    ],
    existingScore: null,
    existingFeedback: ''
  }
};

// ParentMessagesInboxPage
export const parentMessages = [
  {
    id: 'msg-1',
    parentName: 'ولي أمر سارة العتيبي',
    childName: 'سارة العتيبي',
    lastMessage: 'هل يمكن معرفة سبب تأخر تصحيح واجب الأسبوع الماضي؟',
    sentAt: '2026-08-14T19:00:00Z',
    unread: true
  },
  {
    id: 'msg-2',
    parentName: 'ولي أمر يوسف الكعبي',
    childName: 'يوسف الكعبي',
    lastMessage: 'شكرًا على المتابعة المستمرة لابني.',
    sentAt: '2026-08-13T21:30:00Z',
    unread: false
  },
  {
    id: 'msg-3',
    parentName: 'ولي أمر مريم سالم',
    childName: 'مريم سالم',
    lastMessage: 'هل اجتازت مريم اختبار الشهر؟',
    sentAt: '2026-08-12T08:15:00Z',
    unread: true
  }
];