import { create } from 'zustand';
import api from '../utils/api';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  store: JSON.parse(localStorage.getItem('store') || 'null'),
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    if (data.store) localStorage.setItem('store', JSON.stringify(data.store));
    set({ user: data.user, store: data.store, token: data.token, loading: false });
    return data;
  },

  register: async (formData) => {
    set({ loading: true, error: null });
    const { data } = await api.post('/auth/register', formData);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    if (data.store) localStorage.setItem('store', JSON.stringify(data.store));
    set({ user: data.user, store: data.store || null, token: data.token, loading: false });
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('store');
    set({ user: null, store: null, token: null });
  },

  updateProfile: async (profileData) => {
    const { data } = await api.put('/auth/profile', profileData);
    localStorage.setItem('user', JSON.stringify(data.user));
    set({ user: data.user });
    return data;
  },

  fetchMe: async () => {
    const { data } = await api.get('/auth/me');
    localStorage.setItem('user', JSON.stringify(data.user));
    if (data.store) localStorage.setItem('store', JSON.stringify(data.store));
    set({ user: data.user, store: data.store });
    return data;
  }
}));

export default useAuthStore;
