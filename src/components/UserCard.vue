<template>
  <div class="min-w-[130px] flex-1 rounded-2xl odd:bg-blue-200 even:bg-blue-100 p-4">
    <div class="flex justify-between items-center">
        <span class="text-[10px] bg-white rounded-full px-2 py-1 text-blue-500">2024/25</span>
        <IconMore />
    </div>
    <h1 class="text-2xl font-semibold my-4">1,234</h1>
    <h2 class="capitalize text-sm text-gray-600 font-medium"> {{ type }} </h2>
  </div>
</template>

<script setup>
import IconMore from './icon/IconMore.vue';
const props = defineProps({
  type: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>

</style>