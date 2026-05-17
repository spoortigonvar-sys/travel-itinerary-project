import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export const tripsAPI = {
  getAll: () => api.get('/trips'),
  getOne: (id) => api.get(`/trips/${id}`),
  create: (data) => api.post('/trips', data),
  update: (id, data) => api.put(`/trips/${id}`, data),
  delete: (id) => api.delete(`/trips/${id}`),
};

export const itineraryAPI = {
  getByTrip: (tripId) => api.get(`/itinerary/trip/${tripId}`),
  addActivity: (dayId, data) => api.post(`/itinerary/${dayId}/activity`, data),
  removeActivity: (dayId, actId) => api.delete(`/itinerary/${dayId}/activity/${actId}`),
};

export const expensesAPI = {
  getByTrip: (tripId) => api.get(`/expenses/trip/${tripId}`),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
};

export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data)
};

export default api;
