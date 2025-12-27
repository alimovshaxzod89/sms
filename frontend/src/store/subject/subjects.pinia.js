import { defineStore } from 'pinia';
import { useCore } from '@/store/core.pinia';
import { getSubject, getSubjects } from '@/services/modules/subjects/subjects.service';

export const useSubjectsStore = defineStore('subjects', {
    state: () => ({
        // Fanlar ro'yxati
        subjects: [],
        
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
        
        // Tanlangan fan (bitta fan ma'lumotlari)
        selectedSubject: null,
    }),
    
    getters: {
        // Fanlar ro'yxatini qaytarish
        getSubjects: (state) => state.subjects,
        
        // Loading holatini qaytarish
        isLoading: (state) => state.loading,
        
        // Tanlangan fanni qaytarish
        getSelectedSubject: (state) => state.selectedSubject,
    },
    
    actions: {
        /**
         * Barcha fanlarni yuklash
         * @param {Object} options - Qo'shimcha parametrlar
         */
        async fetchSubjects(options = {}) {
            this.loading = true;
            const core = useCore();
            
            try {
                // Service'dan fanlarni olish
                const result = await getSubjects({
                    page: options.page || this.pagination.currentPage,
                    limit: options.pageSize || this.pagination.pageSize,
                    search: options.search || this.searchQuery,
                    subjectId: options.subjectId || this.filters.subjectId,
                });
                
                if (result.success) {
                    // State'ni yangilash
                    this.subjects = result.data;
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
                    this.subjects = [];
                }
            } catch (error) {
                core.setToast({
                    type: 'error',
                    message: 'Fanlarni yuklashda xatolik yuz berdi',
                });
                this.subjects = [];
            } finally {
                this.loading = false;
            }
        },
        
        /**
         * Bitta fan ID bo'yicha olish
         * @param {string} id - Fan ID
         */
        async fetchSubject(id) {
            this.loading = true;
            const core = useCore();
            
            try {
                const result = await getSubject(id);
                
                if (result.success) {
                    this.selectedSubject = result.data;
                } else {
                    core.setToast({
                        type: 'error',
                        message: result.error,
                    });
                    this.selectedSubject = null;
                }
            } catch (error) {
                core.setToast({
                    type: 'error',
                    message: 'Fanni yuklashda xatolik yuz berdi',
                });
                this.selectedSubject = null;
            } finally {
                this.loading = false;
            }
        },
        
    },
});