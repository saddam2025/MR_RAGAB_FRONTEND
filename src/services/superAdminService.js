import api from './api';

const superAdminService = {
  listTenants: (params = {}) => api.get('/super-admin/tenants', { params }),
  createTenant: (payload) => api.post('/super-admin/tenants', payload),
  getTenant: (id) => api.get(`/super-admin/tenants/${id}`),
  updateTenant: (id, payload) => api.patch(`/super-admin/tenants/${id}`, payload),
  deleteTenant: (id) => api.delete(`/super-admin/tenants/${id}`),
  getTenantStats: (id) => api.get(`/super-admin/tenants/${id}/stats`),
};

export default superAdminService;
