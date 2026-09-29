import api from './api';

const quizService = {
  getQuiz: (quizId) => api.get(`/quizzes/${quizId}`),
  getMySubmission: (quizId) => api.get(`/quizzes/${quizId}/my-submission`),
  submitQuiz: (quizId, answers) => api.post(`/quizzes/${quizId}/submit`, { answers }),
  getSubmission: (submissionId) => api.get(`/quizzes/submissions/${submissionId}`),
  checkMonthlyExamEligibility: (quizId) => api.get(`/quizzes/${quizId}/eligibility`),
  getRetryQuestions: (submissionId) => api.post(`/quizzes/submissions/${submissionId}/retry`),
  submitRetry: (submissionId, answers) => api.post(`/quizzes/submissions/${submissionId}/retry/submit`, { answers }),
};

export default quizService;
