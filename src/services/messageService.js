import api from './api';

const messageService = {
  listConversations: (page = 1, limit = 20) => (
    api.get('/messages/conversations', { params: { page, limit } })
  ),
  getThread: (studentId) => api.get(`/messages/thread/${studentId}`),
  send: ({ toUserId, studentId, body }) => api.post('/messages', { toUserId, studentId, body }),
};

export default messageService;
