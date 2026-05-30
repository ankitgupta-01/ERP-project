import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common.Authorization;
  }
};

const storedToken =
  localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
setAuthToken(storedToken);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('authUser');
      setAuthToken(null);
      if (!window.location.pathname.startsWith('/login')) {
        window.dispatchEvent(new Event('auth:expired'));
      }
    }
    return Promise.reject(error);
  },
);

export const invoiceAPI = {
  getAll: () => API.get('/invoices'),
  getOne: (id) => API.get(`/invoices/${id}`),
  create: (data) => API.post('/invoices', data),
  update: (id, data) => API.put(`/invoices/${id}`, data),
  delete: (id) => API.delete(`/invoices/${id}`),
  getNextNumber: (type) => API.get(`/counter/next/${type}`),
};

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  profile: () => API.get('/auth/profile'),
  logout: () => API.post('/auth/logout'),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  resetPassword: (data) => API.post('/auth/reset-password', data),
};

export const adminAPI = {
  users: () => API.get('/auth/admin/users'),
  analytics: () => API.get('/auth/admin/analytics'),
  updateRole: (id, role) => API.patch(`/auth/admin/users/${id}/role`, { role }),
  deleteUser: (id) => API.delete(`/auth/admin/users/${id}`),
};
