import axios from "axios";
import { useAuthStore } from "../store/auth.js";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
  headers: {
    "Content-Type": "application/json"
  }
});

axiosInstance.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.token;

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 503 && error.response.data?.mantenimiento) {
      const authStore = useAuthStore();
      // Si el sistema está en mantenimiento y no es ADMIN, al lobby
      if (authStore.usuario?.rol !== 'ADMIN') {
        window.location.hash = '/mantenimiento';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;