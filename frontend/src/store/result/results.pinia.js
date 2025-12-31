import { defineStore } from 'pinia';
import { getResults, getResult } from '@/services/modules/results/results.service';
import { useCore } from '@/store/core.pinia';

export const useResultsStore = defineStore('results', {
    state: () => ({
        // Natijalar ro'yxati
        results: [],
        
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
            studentId: null,
        },
        
        // Loading holati
        loading: false,
        
        // Tanlangan natija (bitta natija ma'lumotlari)
        selectedResult: null,
    }),
    
    getters: {
        // Natijalar ro'yxatini qaytarish
        getResults: (state) => state.results,
        
        // Loading holatini qaytarish
        isLoading: (state) => state.loading,
        
        // Tanlangan natijani qaytarish
        getSelectedResult: (state) => state.selectedResult,
    },
    
    actions: {
        /**
         * Barcha natijalarni yuklash
         * @param {Object} options - Qo'shimcha parametrlar
         */
        async fetchResults(options = {}) {
            this.loading = true;
            const core = useCore();
            
            try {
                // Service'dan natijalarni olish
                const result = await getResults({
                    page: options.page || this.pagination.currentPage,
                    limit: options.pageSize || this.pagination.pageSize,
                    search: options.search || this.searchQuery,
                    studentId: options.studentId || this.filters.studentId,
                });
                
                if (result.success) {
                    // State'ni yangilash
                    this.results = result.data;
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
                    this.results = [];
                }
            } catch (error) {
                core.setToast({
                    type: 'error',
                    message: 'Natijalarni yuklashda xatolik yuz berdi',
                });
                this.results = [];
            } finally {
                this.loading = false;
            }
        },
        
        /**
         * Bitta natijani ID bo'yicha olish
         * @param {string} id - Natija ID
         */
        async fetchResult(id) {
            this.loading = true;
            const core = useCore();
            
            try {
                const result = await getResult(id);
                
                if (result.success) {
                    this.selectedResult = result.data;
                } else {
                    core.setToast({
                        type: 'error',
                        message: result.error,
                    });
                    this.selectedResult = null;
                }
            } catch (error) {
                core.setToast({
                    type: 'error',
                    message: 'Natijani yuklashda xatolik yuz berdi',
                });
                this.selectedResult = null;
            } finally {
                this.loading = false;
            }
        },
        
    },
});

