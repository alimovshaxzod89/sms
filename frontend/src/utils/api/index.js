import axios from 'axios';

// Axios instansiyasini yaratish
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000, // 10 soniya
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Har bir so'rovdan oldin token qo'shish
api.interceptors.request.use(
  (config) => {
    // LocalStorage'dan token olish
    const token = localStorage.getItem('token');
    if (token) {
      // Authorization header'ga token qo'shish
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Har bir javobdan keyin xatoliklarni boshqarish
api.interceptors.response.use(
  (response) => {
    // Muvaffaqiyatli javobni to'g'ridan-to'g'ri qaytarish
    return response;
  },
  (error) => {
    // 401 - Unauthorized (Token eskirgan yoki yo'q)
    if (error.response?.status === 401) {
      // Token va role'ni o'chirish
      localStorage.removeItem('token');
      localStorage.removeItem('Role');
      // Login sahifasiga yo'naltirish
      window.location.href = '/';
    }
    
    // Boshqa xatoliklarni qaytarish
    return Promise.reject(error);
  }
);

export default api;