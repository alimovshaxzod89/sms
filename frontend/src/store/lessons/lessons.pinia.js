import { defineStore } from 'pinia';
import { useCore } from '@/store/core.pinia';
import { getLesson, getLessons } from '@/services/modules/lessons/lessons.service';

export const useLessonsStore = defineStore('lessons', {
    state: () => ({
        // Lessonlar ro'yxati
        lessons: [],
        
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
        
        // Tanlangan Lesson (bitta Lesson ma'lumotlari)
        selectedLesson: null,
    }),
    
    getters: {
        // Lessonlar ro'yxatini qaytarish
        getLessons: (state) => state.lessons,
        
        // Loading holatini qaytarish
        isLoading: (state) => state.loading,
        
        // Tanlangan Lesson qaytarish
        getSelectedLesson: (state) => state.selectedLesson,
    },
    
    actions: {
        /**
         * Barcha Lessonlar yuklash
         * @param {Object} options - Qo'shimcha parametrlar
         */
        async fetchLessons(options = {}) {
            this.loading = true;
            const core = useCore();
            
            try {
                // Service'dan Lessonlar olish
                const result = await getLessons({
                    page: options.page || this.pagination.currentPage,
                    limit: options.pageSize || this.pagination.pageSize,
                    search: options.search || this.searchQuery,
                    subjectId: options.subjectId || this.filters.subjectId,
                });
                
                if (result.success) {
                    // State'ni yangilash
                    this.lessons = result.data;
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
                    this.lessons = [];
                }
            } catch (error) {
                core.setToast({
                    type: 'error',
                    message: 'Lessonlar yuklashda xatolik yuz berdi',
                });
                this.lessons = [];
            } finally {
                this.loading = false;
            }
        },
        
        /**
         * Bitta Lesson ID bo'yicha olish
         * @param {string} id - Lesson ID
         */
        async fetchLesson(id) {
            this.loading = true;
            const core = useCore();
            
            try {
                const result = await getLesson(id);
                
                if (result.success) {
                    this.selectedLesson = result.data;
                } else {
                    core.setToast({
                        type: 'error',
                        message: result.error,
                    });
                    this.selectedLesson = null;
                }
            } catch (error) {
                core.setToast({
                    type: 'error',
                    message: 'Lesson yuklashda xatolik yuz berdi',
                });
                this.selectedLesson = null;
            } finally {
                this.loading = false;
            }
        },
        
    },
});