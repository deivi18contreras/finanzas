import { postData } from './apiService';

const ENDPOINT = '/auth';

export const AuthService = {
  login: (credentials) => postData(`${ENDPOINT}/login`, credentials),
  register: (userData) => postData(`${ENDPOINT}/register`, userData),
  
  // Guardar token en localStorage para persistencia (APK)
  setToken: (token) => localStorage.setItem('domina_token', token),
  getToken: () => localStorage.getItem('domina_token'),
  removeToken: () => localStorage.removeItem('domina_token'),
  
  setUser: (user) => localStorage.setItem('domina_user', JSON.stringify(user)),
  getUser: () => JSON.parse(localStorage.getItem('domina_user')),
  removeUser: () => localStorage.removeItem('domina_user')
};
