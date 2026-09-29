import api from './api';

const standaloneExamService = {
  getAvailable: () => api.get('/exams/available'),
  start: (examId) => api.post(`/exams/${examId}/start`, {}),
  submit: (examId, answers) => api.post(`/exams/${examId}/submit`, { answers }),
  getMyScores: () => api.get('/students/me/exam-scores')
};

export default standaloneExamService;
