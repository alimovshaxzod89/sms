import { defineStore } from 'pinia';
import { getAnnouncements, getAnnouncement } from '@/services/modules/announcements/announcements.service';
import { useCore } from '@/store/core.pinia';

export const useAnnouncementsStore = defineStore('announcements', {
    state: () => ({
        // E'lonlar ro'yxati
        announcements: [],
        
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
        filters: {},
        
        // Loading holati
        loading: false,
        
        // Tanlangan e'lon (bitta e'lon ma'lumotlari)
        selectedAnnouncement: null,
    }),
    
    getters: {
        // E'lonlar ro'yxatini qaytarish
        getAnnouncements: (state) => state.announcements,
        
        // Loading holatini qaytarish
        isLoading: (state) => state.loading,
        
        // Tanlangan e'lonni qaytarish
        getSelectedAnnouncement: (state) => state.selectedAnnouncement,
    },
    
    actions: {
        /**
         * Barcha e'lonlar ro'yxatini yuklash
         * @param {Object} options - Qo'shimcha parametrlar
         */
        async fetchAnnouncements(options = {}) {
            this.loading = true;
            const core = useCore();
            
            try {
                // Service'dan e'lonlar ro'yxatini olish
                const result = await getAnnouncements({
                    page: options.page || this.pagination.currentPage,
                    limit: options.pageSize || this.pagination.pageSize,
                    search: options.search || this.searchQuery,
                });
                
                if (result.success) {
                    // State'ni yangilash
                    this.announcements = result.data;
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
                    this.announcements = [];
                }
            } catch (error) {
                core.setToast({
                    type: 'error',
                    message: 'E\'lonlar ro\'yxatini yuklashda xatolik yuz berdi',
                });
                this.announcements = [];
            } finally {
                this.loading = false;
            }
        },
        
        /**
         * Bitta e'lonni ID bo'yicha olish
         * @param {string} id - E'lon ID
         */
        async fetchAnnouncement(id) {
            this.loading = true;
            const core = useCore();
            
            try {
                const result = await getAnnouncement(id);
                
                if (result.success) {
                    this.selectedAnnouncement = result.data;
                } else {
                    core.setToast({
                        type: 'error',
                        message: result.error,
                    });
                    this.selectedAnnouncement = null;
                }
            } catch (error) {
                core.setToast({
                    type: 'error',
                    message: 'E\'lonni yuklashda xatolik yuz berdi',
                });
                this.selectedAnnouncement = null;
            } finally {
                this.loading = false;
            }
        },
        
    },
});

