import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AuthService } from '../services/AuthService';
import router from '../router';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(AuthService.getUser());
  const token = ref(AuthService.getToken());
  const loading = ref(false);
  const error = ref(null);

  const isAuthenticated = computed(() => !!token.value);

  const login = async (credentials) => {
    loading.value = true;
    error.value = null;
    try {
      const data = await AuthService.login(credentials);
      user.value = { name: data.name, email: data.email };
      token.value = data.token;
      
      AuthService.setToken(data.token);
      AuthService.setUser(user.value);
      
      router.push('/');
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al iniciar sesión';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const register = async (userData) => {
    loading.value = true;
    error.value = null;
    try {
      const data = await AuthService.register(userData);
      user.value = { name: data.name, email: data.email };
      token.value = data.token;
      
      AuthService.setToken(data.token);
      AuthService.setUser(user.value);
      
      router.push('/');
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al registrarse';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    AuthService.removeToken();
    AuthService.removeUser();
    router.push('/login');
  };

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout
  };
});
