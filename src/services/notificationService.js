import api from './api';

const notificationService = {
  list: (page = 1, limit = 20) => api.get('/notifications', { params: { page, limit } }),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (notificationId) => api.patch(`/notifications/${notificationId}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export default notificationService;
