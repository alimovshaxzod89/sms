import api from '@/utils/api';
import {useCore} from '@/store/core.pinia';


/**
 * Foydalanuvchini tizimga kirishi
 * @param {Object} credentials - Kirish ma'lumotlari
 * @param {string} credentials.username - Foydalanuvchi nomi
 * @param {string} credentials.password - Parol
 * @param {string} credentials.role - Rol (admin, teacher, student, parent)
 * @returns {Promise} API javobi
 */

export const login = async (credentials) => {
    const core = useCore();
    const loadingUrl = 'login';
    
    try {
      core.addLoadingUrl(loadingUrl);
      
      const response = await api.post('/auth/login', {
        username: credentials.username,
        password: credentials.password,
        role: credentials.role
      });
      
      return {
        success: true,
        data: {
          token: response.data.token,
          user: response.data.user
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Kirishda xatolik yuz berdi',
        data: null
      };
    } finally {
      core.removeLoadingUrl(loadingUrl);
    }
};

/**
 * Joriy foydalanuvchi ma'lumotlarini olish
 * @returns {Promise} API javobi
 */
export const getMe = async () => {
    const core = useCore();
    const loadingUrl = 'getMe';
    
    try {
      core.addLoadingUrl(loadingUrl);
      const response = await api.get('/auth/me');
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Foydalanuvchi ma\'lumotlarini olishda xatolik',
        data: null
      };
    } finally {
      core.removeLoadingUrl(loadingUrl);
    }
};

/**
 * Foydalanuvchini tizimdan chiqarish
 * @returns {Promise} API javobi
 */
export const logout = async () => {
  const core = useCore();
  const loadingUrl = 'logout';
  
  try {
    core.addLoadingUrl(loadingUrl);
    await api.post('/auth/logout');
    
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Chiqishda xatolik yuz berdi'
    };
  } finally {
    core.removeLoadingUrl(loadingUrl);
  }
};

/**
 * Parolni yangilash
 * @param {Object} passwords - Parollar
 * @param {string} passwords.currentPassword - Hozirgi parol
 * @param {string} passwords.newPassword - Yangi parol
 * @returns {Promise} API javobi
 */
export const updatePassword = async (passwords) => {
    const core = useCore();
    const loadingUrl = 'updatePassword';
    
    try {
      core.addLoadingUrl(loadingUrl);
      const response = await api.put('/auth/updatepassword', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      
      return {
        success: true,
        data: {
          token: response.data.token
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Parolni yangilashda xatolik yuz berdi'
      };
    } finally {
      core.removeLoadingUrl(loadingUrl);
    }
};