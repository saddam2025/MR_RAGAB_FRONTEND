import React, { lazy } from 'react';

/* Public pages */
const InstructorSelectorPage = lazy(() =>
  import('./pages/public/InstructorSelectorPage.jsx')
);
const LoginPage = lazy(() => import('./pages/public/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/public/RegisterPage.jsx'));

/* Student pages (scoped under /:instructorId/) */
const TenantHomepage = lazy(() => import('./pages/student/TenantHomepage.jsx'));
const CourseCatalogPage = lazy(() => import('./pages/student/CourseCatalogPage.jsx'));
const CourseDetailPage = lazy(() => import('./pages/student/CourseDetailPage.jsx'));
const CheckoutPage = lazy(() => import('./pages/student/CheckoutPage.jsx'));
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard.jsx'));
const ExamGradesPage = lazy(() => import('./pages/student/ExamGradesPage.jsx'));
const AssignmentGradesPage = lazy(() => import('./pages/student/AssignmentGradesPage.jsx')); 
const CoursePlayerPage = lazy(() => import('./pages/student/CoursePlayerPage.jsx'));
const AssignmentSubmissionPage = lazy(() =>
  import('./pages/student/AssignmentSubmissionPage.jsx')
);
const QuizTakingPage = lazy(() => import('./pages/student/QuizTakingPage.jsx'));
const QuizResultsPage = lazy(() => import('./pages/student/QuizResultsPage.jsx'));

/* Assistant pages */
const AssistantDashboard = lazy(() => import('./pages/assistant/AssistantDashboard.jsx'));
const AssignmentGradingPage = lazy(() =>
  import('./pages/assistant/AssignmentGradingPage.jsx')
);

/* Admin pages */
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const CourseManagementPage = lazy(() => import('./pages/admin/CourseManagementPage.jsx'));
const CourseEditorPage = lazy(() => import('./pages/admin/CourseEditorPage.jsx'));
const QuizBuilderPage = lazy(() => import('./pages/admin/QuizBuilderPage.jsx'));
const ScratchCardManager = lazy(() => import('./pages/admin/ScratchCardManager.jsx'));
const TenantSettingsPage = lazy(() => import('./pages/admin/TenantSettingsPage.jsx'));
const StudentProfilePage = lazy(() => import('./pages/shared/StudentProfilePage.jsx'));
const AssistantProfilePage = lazy(() => import('./pages/shared/AssistantProfilePage.jsx'));
const StudentsListPage = lazy(() => import('./pages/shared/StudentsListPage.jsx'));
const StudentDetailPage = lazy(() => import('./pages/shared/StudentDetailPage.jsx'));

/* Parent pages */
const ParentDashboard = lazy(() => import('./pages/parent/ParentDashboard.jsx'));
const ChildReportsPage = lazy(() => import('./pages/parent/ChildReportsPage.jsx'));
const ParentActivityPage = lazy(() => import('./pages/parent/ParentActivityPage.jsx'));
const ChildCoursesPage = lazy(() => import('./pages/parent/ChildCoursesPage.jsx'));
const ChildExamGradesPage = lazy(() => import('./pages/parent/ChildExamGradesPage.jsx'));
const ChildAssignmentGradesPage = lazy(() => import('./pages/parent/ChildAssignmentGradesPage.jsx'));

/* Super-admin pages (mounted by App.jsx's explicit non-tenant route group). */
const SuperAdminDashboard = lazy(() => import('./pages/super-admin/SuperAdminDashboard.jsx'));
const TenantsListPage = lazy(() => import('./pages/super-admin/TenantsListPage.jsx'));
const TenantCreatePage = lazy(() => import('./pages/super-admin/TenantCreatePage.jsx'));
const TenantDetailPage = lazy(() => import('./pages/super-admin/TenantDetailPage.jsx'));

/* Route collections */
const publicRoutes = [
  { path: '/select-instructor', element: InstructorSelectorPage },
  { path: '/login', element: LoginPage },
  { path: '/register', element: RegisterPage },
];

const scopedRoutes = [
  // student (make tenant homepage an explicit index route)
  { index: true, element: TenantHomepage }, // renders at "/:instructorId"
  { path: 'catalog', element: CourseCatalogPage },
  { path: 'courses/:courseId', element: CourseDetailPage },
  { path: 'checkout/:courseId', element: CheckoutPage },
  { path: 'courses/:courseId/lectures/:lectureId/checkout', element: CheckoutPage },
  { path: 'dashboard', element: StudentDashboard },
  { path: 'exam-grades', element: ExamGradesPage },
  { path: 'assignment-grades', element: AssignmentGradesPage },
  { path: 'courses/:courseId/lectures/:lectureId/learn', element: CoursePlayerPage },
  { path: 'courses/:courseId/lectures/:lectureId/assignments', element: AssignmentSubmissionPage },
  { path: 'courses/:courseId/quizzes/:quizId', element: QuizTakingPage },
  { path: 'quiz/results/:submissionId', element: QuizResultsPage },

  // assistant
  { path: 'assistant', element: AssistantDashboard },
  { path: 'assistant/grade/:assignmentId?', element: AssignmentGradingPage },

  // admin
  { path: 'admin', element: AdminDashboard },
  { path: 'admin/courses', element: CourseManagementPage },
  { path: 'admin/courses/editor/:courseId', element: CourseEditorPage },
  { path: 'admin/quiz-builder', element: QuizBuilderPage },
  { path: 'admin/courses/:courseId/lectures/:lectureId/quizzes/manage', element: QuizBuilderPage },
  { path: 'admin/scratchcards', element: ScratchCardManager },
  { path: 'admin/settings', element: TenantSettingsPage },

  // Shared protected profiles. Runtime routing reads page route exports via
  // routes.auto.js; these entries keep this legacy route collection aligned.
  { path: 'profiles/students/:studentId', element: StudentProfilePage, allowedRoles: ['admin', 'assistant'] },
  { path: 'students', element: StudentsListPage, allowedRoles: ['admin', 'assistant'] },
  { path: 'students/:studentId', element: StudentDetailPage, allowedRoles: ['admin', 'assistant'] },
  { path: 'profiles/assistants/:assistantId', element: AssistantProfilePage, allowedRoles: ['admin', 'parent'] },
  { path: 'parent/profiles/assistants/:assistantId', element: AssistantProfilePage, allowedRoles: ['admin', 'parent'] },

  // parent
  { path: 'parent', element: ParentDashboard },
  { path: 'parent/reports', element: ChildReportsPage },
  { path: 'parent/courses', element: ChildCoursesPage },
  { path: 'parent/exam-grades', element: ChildExamGradesPage },
  { path: 'parent/assignment-grades', element: ChildAssignmentGradesPage },
  { path: 'parent/activity', element: ParentActivityPage },
];

const superAdminRoutes = [
  { index: true, element: SuperAdminDashboard, allowedRoles: ['super_admin'] },
  { path: 'tenants', element: TenantsListPage, allowedRoles: ['super_admin'] },
  { path: 'tenants/new', element: TenantCreatePage, allowedRoles: ['super_admin'] },
  { path: 'tenants/:id', element: TenantDetailPage, allowedRoles: ['super_admin'] },
];

export default {
  public: publicRoutes,
  scoped: scopedRoutes,
  superAdmin: superAdminRoutes,
};
