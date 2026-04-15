import { getData, postData, putData } from './apiService';

const ENDPOINT = '/auth';

export const AuthService = {
  // Autenticación
  login: (credentials) => postData(`${ENDPOINT}/login`, credentials),
  register: (userData) => postData(`${ENDPOINT}/register`, userData),

  // Fase 2.1 — Nuevos endpoints de perfil
  getProfile: () => getData(`${ENDPOINT}/me`),
  updateProfile: (data) => putData(`${ENDPOINT}/me`, data),
  changePassword: (data) => putData(`${ENDPOINT}/password`, data),

  // Persistencia en localStorage (APK)
  setToken: (token) => localStorage.setItem('domina_token', token),
  getToken: () => localStorage.getItem('domina_token'),
  removeToken: () => localStorage.removeItem('domina_token'),

  setUser: (user) => localStorage.setItem('domina_user', JSON.stringify(user)),
  getUser: () => {
    try { return JSON.parse(localStorage.getItem('domina_user')); } catch { return null; }
  },
  removeUser: () => localStorage.removeItem('domina_user'),

  // Fase 3.1 — Presupuesto mensual persistido
  getBudget: () => Number(localStorage.getItem('domina_budget')) || 1000000,
  setBudget: (val) => localStorage.setItem('domina_budget', String(val))
};
