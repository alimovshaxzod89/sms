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
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Auth store'dan foydalanish (agar Pinia instance mavjud bo'lsa)
      try {
        // Store'ni import qilish - bu context'tan qat'i nazar ishlaydi
        const authStore = useAuth();
        await authStore.logout();
      } catch (storeError) {
        // Store mavjud bo'lmasa, oddiy tozalash
        localStorage.removeItem('token');
        localStorage.removeItem('role');
      }
      
      // Login sahifasiga yo'naltirish
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;