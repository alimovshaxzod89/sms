const { defineStore } = require("pinia");

const useCore = defineStore('core', {
    state: () => ({
        collapsed: false,
    }),
    actions: {
    },
});

export default useCore;