import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AuthService } from '../services/AuthService';
import router from '../router';

export const useAuthStore = defineStore('auth', () => {
  const user    = ref(AuthService.getUser());
  const token   = ref(AuthService.getToken());
  const loading = ref(false);
  const error   = ref(null);

  const isAuthenticated = computed(() => !!token.value);

  // Fase 5.4
  const clearError = () => { error.value = null; };

  // ─── LOGIN ───────────────────────────────────────
  const login = async (credentials) => {
    loading.value = true;
    error.value   = null;
    try {
      const data = await AuthService.login(credentials);
      user.value  = { _id: data._id, name: data.name, email: data.email };
      token.value = data.token;
      AuthService.setToken(data.token);
      AuthService.setUser(user.value);
      router.push('/');
    } catch (err) {
      error.value = err?.message || 'Error al iniciar sesión';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // ─── REGISTER ────────────────────────────────────
  const register = async (userData) => {
    loading.value = true;
    error.value   = null;
    try {
      const data = await AuthService.register(userData);
      user.value  = { _id: data._id, name: data.name, email: data.email };
      token.value = data.token;
      AuthService.setToken(data.token);
      AuthService.setUser(user.value);
      router.push('/');
    } catch (err) {
      error.value = err?.message || 'Error al registrarse';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // ─── UPDATE PROFILE — Fase 5.1 ──────────────────
  const updateProfile = async (profileData) => {
    loading.value = true;
    error.value   = null;
    try {
      const data = await AuthService.updateProfile(profileData);
      user.value  = { ...user.value, name: data.name, email: data.email };
      AuthService.setUser(user.value);
      return data;
    } catch (err) {
      error.value = err?.message || 'Error al actualizar perfil';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // ─── CHANGE PASSWORD — Fase 5.2 ─────────────────
  const changePassword = async (passwordData) => {
    loading.value = true;
    error.value   = null;
    try {
      await AuthService.changePassword(passwordData);
    } catch (err) {
      error.value = err?.message || 'Error al cambiar contraseña';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // ─── LOGOUT ──────────────────────────────────────
  const logout = () => {
    user.value  = null;
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
    clearError,
    login,
    register,
    updateProfile,
    changePassword,
    logout
  };
});
