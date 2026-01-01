import { defineStore } from 'pinia';
import { getEvents, getEvent } from '@/services/modules/event/events.service';
import { useCore } from '@/store/core.pinia';

export const useEventsStore = defineStore('events', {
    state: () => ({
        // Tadbirlar ro'yxati
        events: [],
        
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
        
        // Tanlangan tadbir (bitta tadbir ma'lumotlari)
        selectedEvent: null,
    }),
    
    getters: {
        // Tadbirlar ro'yxatini qaytarish
        getEvents: (state) => state.events,
        
        // Loading holatini qaytarish
        isLoading: (state) => state.loading,
        
        // Tanlangan tadbirni qaytarish
        getSelectedEvent: (state) => state.selectedEvent,
    },
    
    actions: {
        /**
         * Barcha tadbirlar ro'yxatini yuklash
         * @param {Object} options - Qo'shimcha parametrlar
         */
        async fetchEvents(options = {}) {
            this.loading = true;
            const core = useCore();
            
            try {
                // Service'dan tadbirlar ro'yxatini olish
                const result = await getEvents({
                    page: options.page || this.pagination.currentPage,
                    limit: options.pageSize || this.pagination.pageSize,
                    search: options.search || this.searchQuery,
                });
                
                if (result.success) {
                    // State'ni yangilash
                    this.events = result.data;
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
                    this.events = [];
                }
            } catch (error) {
                core.setToast({
                    type: 'error',
                    message: 'Tadbirlar ro\'yxatini yuklashda xatolik yuz berdi',
                });
                this.events = [];
            } finally {
                this.loading = false;
            }
        },
        
        /**
         * Bitta tadbirni ID bo'yicha olish
         * @param {string} id - Tadbir ID
         */
        async fetchEvent(id) {
            this.loading = true;
            const core = useCore();
            
            try {
                const result = await getEvent(id);
                
                if (result.success) {
                    this.selectedEvent = result.data;
                } else {
                    core.setToast({
                        type: 'error',
                        message: result.error,
                    });
                    this.selectedEvent = null;
                }
            } catch (error) {
                core.setToast({
                    type: 'error',
                    message: 'Tadbirni yuklashda xatolik yuz berdi',
                });
                this.selectedEvent = null;
            } finally {
                this.loading = false;
            }
        },
        
    },
});