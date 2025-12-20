import { defineStore } from "pinia";

export const useCore = defineStore('core', {
    state: () => ({
        // collapsed: false,
        loading: false,
        loadingUrls: new Set(),
        toast: null
    }),
    actions: {
        setLoading(loading){
            this.loading = loading;
        },
        addLoadingUrl(url){
            this.loadingUrls.add(url);
            this.loading = true;
        },
        removeLoadingUrl(url){
            this.loadingUrls.delete(url);
            this.loading = this.loadingUrls.size > 0;
        },
        setToast(toast){
            this.toast = toast;
        },
    },
});
