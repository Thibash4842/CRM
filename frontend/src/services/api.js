const API_BASE = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Request failed: ${response.status}`);
    }

    return data.data !== undefined ? data.data : data;
  }

  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) });
  }

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  }

  patch(endpoint, body) {
    return this.request(endpoint, { method: 'PATCH', body: JSON.stringify(body) });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  me: () => api.get('/auth/me'),
};

export const dashboardApi = {
  get: () => api.get('/dashboard'),
};

export const leadsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/leads${query ? `?${query}` : ''}`);
  },
  getById: (id) => api.get(`/leads/${id}`),
  create: (data) => api.post('/leads', data),
  update: (id, data) => api.put(`/leads/${id}`, data),
  delete: (id) => api.delete(`/leads/${id}`),
  convert: (id, data = {}) => api.post(`/leads/${id}/convert`, data),
  markLost: (id, data) => api.post(`/leads/${id}/lost`, data),
  restore: (id) => api.post(`/leads/${id}/restore`),
  getTrash: () => api.get('/leads/trash'),
  getConverted: () => api.get('/leads/converted'),
  getLost: () => api.get('/leads/lost'),
  bulkCreate: async (dataArray) => {
    try {
      return await api.post('/leads/bulk', dataArray);
    } catch {
      // Fallback: create one by one if bulk endpoint doesn't exist
      const results = [];
      for (const data of dataArray) {
        try {
          const result = await api.post('/leads', data);
          results.push(result);
        } catch (err) {
          results.push({ error: err.message });
        }
      }
      return results;
    }
  },
};

export const dealsApi = {
  getAll: (stage) => api.get(stage ? `/deals?stage=${stage}` : '/deals'),
  create: (data) => api.post('/deals', data),
  update: (id, data) => api.put(`/deals/${id}`, data),
  updateStage: (id, stage) => api.patch(`/deals/${id}/stage`, { stage }),
  delete: (id) => api.delete(`/deals/${id}`),
};

export const clientsApi = {
  getAll: (search) => api.get(search ? `/clients?search=${search}` : '/clients'),
  getById: (id) => api.get(`/clients/${id}`),
  getTimeline: (id) => api.get(`/clients/${id}/timeline`),
  create: (data) => api.post('/clients', data),
  convert: (leadId) => api.post(`/clients/convert/${leadId}`, {}),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
};

export const tasksApi = {
  getAll: (status) => api.get(status ? `/tasks?status=${status}` : '/tasks'),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

export const projectsApi = {
  getAll: (status) => api.get(status ? `/projects?status=${status}` : '/projects'),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

export const invoicesApi = {
  getAll: (status) => api.get(status ? `/invoices?status=${status}` : '/invoices'),
  create: (data) => api.post('/invoices', data),
  updateStatus: (id, status) => api.patch(`/invoices/${id}/status`, { status }),
  delete: (id) => api.delete(`/invoices/${id}`),
};

export const paymentsApi = {
  getAll: () => api.get('/payments'),
  getSummary: () => api.get('/payments/summary'),
  record: (data) => api.post('/payments', data),
};

export const reportsApi = {
  revenue: () => api.get('/reports/revenue'),
  sales: () => api.get('/reports/sales'),
  leads: () => api.get('/reports/leads'),
  conversion: () => api.get('/reports/conversion'),
  projects: () => api.get('/reports/projects'),
};

export const usersApi = {
  getAll: () => api.get('/users'),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const activitiesApi = {
  getForEntity: (entityType, entityId) => api.get(`/activities/${entityType}/${entityId}`),
};

export const notificationsApi = {
  getAll: (params = {}) => {
    const filterParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        filterParams[key] = params[key];
      }
    });
    const query = new URLSearchParams(filterParams).toString();
    return api.get(`/notifications${query ? `?${query}` : ''}`);
  },
  getUnread: () => api.get('/notifications/unread'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  clearAllRead: () => api.delete('/notifications/read-all'),
  getStats: () => api.get('/notifications/stats'),
};

export const notificationSettingsApi = {
  get: () => api.get('/notification-settings'),
  update: (data) => api.put('/notification-settings', data),
};
