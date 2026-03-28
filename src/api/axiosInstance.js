import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_FIREBASE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('customer_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error?.message || 'Action failed';
    if (error.response?.status === 401) {
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_user');
      window.location.href = '/login';
    }
    const customError = new Error(message);
    customError.response = error.response;
    return Promise.reject(customError);
  }
);

export default axiosInstance;
