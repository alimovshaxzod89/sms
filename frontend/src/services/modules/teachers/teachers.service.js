import api from '@/utils/api';
import { useCore } from '@/store/core.pinia';

const core = useCore();

/**
 * Barcha o'qituvchilarni olish (pagination va search bilan)
 * @param {Object} params - Query parametrlar
 * @param {number} params.page - Sahifa raqami (default: 1)
 * @param {number} params.limit - Har bir sahifadagi elementlar soni (default: 10)
 * @param {string} params.search - Qidiruv so'zi (name, surname, email, username bo'yicha)
 * @param {string} params.subjectId - Fan ID bo'yicha filter
 * @returns {Promise} API javobi
 */
export const getTeachers = async (params = {}) => {
  const loadingUrl = 'getTeachers';
  
  try {
    // Loading holatini yoqish
    core.addLoadingUrl(loadingUrl);
    
    // API so'rovini yuborish
    const response = await api.get('/teachers', {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || '',
        subjectId: params.subjectId || '',
      }
    });
    
    // Muvaffaqiyatli javobni qaytarish
    return {
      success: true,
      data: response.data.data, // O'qituvchilar ro'yxati
      count: response.data.count, // Jami soni
      totalPages: response.data.totalPages, // Jami sahifalar soni
      currentPage: response.data.currentPage, // Hozirgi sahifa
    };
  } catch (error) {
    // Xatolik bo'lsa
    return {
      success: false,
      error: error.response?.data?.error || 'O\'qituvchilarni olishda xatolik yuz berdi',
      data: [],
      count: 0,
      totalPages: 0,
      currentPage: 1,
    };
  } finally {
    // Loading holatini o'chirish
    core.removeLoadingUrl(loadingUrl);
  }
};

/**
 * Bitta o'qituvchini ID bo'yicha olish
 * @param {string} id - O'qituvchi ID (MongoDB ObjectId yoki custom id)
 * @returns {Promise} API javobi
 */
export const getTeacher = async (id) => {
  const loadingUrl = `getTeacher-${id}`;
  
  try {
    core.addLoadingUrl(loadingUrl);
    const response = await api.get(`/teachers/${id}`);
    
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'O\'qituvchini olishda xatolik yuz berdi',
      data: null,
    };
  } finally {
    core.removeLoadingUrl(loadingUrl);
  }
};