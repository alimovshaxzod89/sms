<template>
    <a-pagination class="flex justify-center" v-model:current="current" :total="total" :page-size="pageSize" />
</template>

<script setup>
import { ref } from 'vue';

const current = ref(1);
const total = ref(100);
const pageSize = ref(10);

// const props = defineProps({
//     current: {
//         type: Number,
//         default: 1
//     },
//     total: {
//         type: Number,
//         default: 100
//     },
//     pageSize: {
//         type: Number,
//         default: 10
//     }
// })
</script>

