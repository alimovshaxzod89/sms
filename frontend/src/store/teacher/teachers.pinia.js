import { defineStore } from 'pinia';
import { getTeachers, getTeacher } from '@/services/modules/teachers/teachers.service';
import { useCore } from '@/store/core.pinia';

export const useTeachersStore = defineStore('teachers', {
    state: () => ({
        // O'qituvchilar ro'yxati
        teachers: [],
        
        // Pagination ma'lumotlari
        pagination: {
            currentPage: 1,
            pageSize: 10,
            total: 0,
            totalPages: 0,
        },
        
        // Qidiruv so'zi
        searchQuery: '',
        
        // Filterlar
        filters: {
            subjectId: null,
        },
        
        // Loading holati
        loading: false,
        
        // Tanlangan o'qituvchi (bitta o'qituvchi ma'lumotlari)
        selectedTeacher: null,
    }),
    
    getters: {
        // O'qituvchilar ro'yxatini qaytarish
        getTeachers: (state) => state.teachers,
        
        // Loading holatini qaytarish
        isLoading: (state) => state.loading,
        
        // Tanlangan o'qituvchini qaytarish
        getSelectedTeacher: (state) => state.selectedTeacher,
    },
    
    actions: {
        /**
         * Barcha o'qituvchilarni yuklash
         * @param {Object} options - Qo'shimcha parametrlar
         */
        async fetchTeachers(options = {}) {
            this.loading = true;
            const core = useCore();
            
            try {
                // Service'dan o'qituvchilarni olish
                const result = await getTeachers({
                    page: options.page || this.pagination.currentPage,
                    limit: options.pageSize || this.pagination.pageSize,
                    search: options.search || this.searchQuery,
                    subjectId: options.subjectId || this.filters.subjectId,
                });
                
                if (result.success) {
                    // State'ni yangilash
                    this.teachers = result.data;
                    this.pagination = {
                        currentPage: result.currentPage,
                        pageSize: options.pageSize || this.pagination.pageSize,
                        total: result.count,
                        totalPages: result.totalPages,
                    };
                } else {
                    // Xatolik bo'lsa
                    core.setToast({
                        type: 'error',
                        message: result.error,
                    });
                    this.teachers = [];
                }
            } catch (error) {
                core.setToast({
                    type: 'error',
                    message: 'O\'qituvchilarni yuklashda xatolik yuz berdi',
                });
                this.teachers = [];
            } finally {
                this.loading = false;
            }
        },
        
        /**
         * Bitta o'qituvchini ID bo'yicha olish
         * @param {string} id - O'qituvchi ID
         */
        async fetchTeacher(id) {
            this.loading = true;
            const core = useCore();
            
            try {
                const result = await getTeacher(id);
                
                if (result.success) {
                    this.selectedTeacher = result.data;
                } else {
                    core.setToast({
                        type: 'error',
                        message: result.error,
                    });
                    this.selectedTeacher = null;
                }
            } catch (error) {
                core.setToast({
                    type: 'error',
                    message: 'O\'qituvchini yuklashda xatolik yuz berdi',
                });
                this.selectedTeacher = null;
            } finally {
                this.loading = false;
            }
        },
        
    },
});