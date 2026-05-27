
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://finanzas-rjnw.onrender.com/api', // La URL de tu backend en producción
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default axiosInstance;