// frontend/src/store/auth/auth.pinia.js
import { defineStore } from 'pinia';
import { login as loginService, logout as logoutService, getMe, updatePassword } from '@/services/modules/auth/auth.service';

export const useAuth = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    role: localStorage.getItem('role') || null,
    isAuthenticated: false,
    isLoading: false
  }),

  getters: {
    /**
     * Foydalanuvchi autentifikatsiya qilinganmi?
     */
    isLoggedIn: (state) => {
      return state.isAuthenticated && !!state.token && !!state.user;
    },

    /**
     * Foydalanuvchi roli
     */
    userRole: (state) => {
      return state.role?.toUpperCase();
    },

    /**
     * Foydalanuvchi to'liq ismi
     */
    fullName: (state) => {
      if (!state.user) return '';
      return `${state.user.name || ''} ${state.user.surname || ''}`.trim();
    }
  },

  actions: {
    /**
     * Tizimga kirish
     */
    async login(credentials) {
      this.isLoading = true;
      
      try {
        const result = await loginService(credentials);
        
        if (result.success) {
          // Token va ma'lumotlarni saqlash
          this.token = result.data.token;
          this.user = result.data.user;
          this.role = result.data.user.role;
          this.isAuthenticated = true;
          
          // LocalStorage'ga saqlash
          localStorage.setItem('token', result.data.token);
          localStorage.setItem('role', result.data.user.role);
          
          return {
            success: true,
            user: result.data.user
          };
        } else {
          return {
            success: false,
            error: result.error
          };
        }
      } catch (error) {
        return {
          success: false,
          error: error.message || 'Kirishda xatolik yuz berdi'
        };
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Tizimdan chiqish
     */
    async logout() {
      this.isLoading = true;
      
      try {
        // Backend'ga logout so'rovi yuborish
        await logoutService();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        // Har holatda ma'lumotlarni tozalash
        this.clearAuth();
        this.isLoading = false;
      }
    },

    /**
     * Auth ma'lumotlarini tozalash
     */
    clearAuth() {
      this.user = null;
      this.token = null;
      this.role = null;
      this.isAuthenticated = false;
      
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    },

    /**
     * Joriy foydalanuvchi ma'lumotlarini yuklash
     */
    async fetchUser() {
      if (!this.token) {
        this.clearAuth();
        return false;
      }

      this.isLoading = true;
      
      try {
        const result = await getMe();
        
        if (result.success) {
          this.user = result.data;
          this.isAuthenticated = true;
          return true;
        } else {
          this.clearAuth();
          return false;
        }
      } catch (error) {
        this.clearAuth();
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Parolni yangilash
     */
    async changePassword(passwords) {
      this.isLoading = true;
      
      try {
        const result = await updatePassword(passwords);
        
        if (result.success && result.data.token) {
          // Yangi tokenni saqlash
          this.token = result.data.token;
          localStorage.setItem('token', result.data.token);
          
          return {
            success: true
          };
        } else {
          return {
            success: false,
            error: result.error
          };
        }
      } catch (error) {
        return {
          success: false,
          error: error.message || 'Parolni yangilashda xatolik'
        };
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * LocalStorage'dan auth holatini tiklash
     */
    initAuth() {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      
      if (token && role) {
        this.token = token;
        this.role = role;
        // User ma'lumotlarini yuklash
        this.fetchUser();
      } else {
        this.clearAuth();
      }
    }
  }
});