import api from './api';

const subscriptionService = {
  getCurrent: (studentId, stage) => api.get(`/subscriptions/${studentId}/current`, { params: { stage } }),
  submitMonthlyExam: (subscriptionId, answers) => api.post(`/subscriptions/monthly-exam/${subscriptionId}/submit`, { answers }),
};

export default subscriptionService;
