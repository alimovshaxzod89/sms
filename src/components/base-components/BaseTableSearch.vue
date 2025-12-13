<template>
    <!-- Search Bar -->
    <div class="w-full md:w-auto flex items-center gap-2 bg-[#F7F8FA] border border-gray-200 rounded-md px-2 flex-1 lg:flex-none max-w-md ml-4 lg:ml-0">
      <IconSearch />
      <a-input 
        placeholder="Search..." 
        :bordered="false"
        class="!bg-[#F7F8FA] !outline-none"
      />
    </div>
</template>

<script setup>
import IconSearch from '@components/icon/menu-icons/IconSearch.vue';


</script>

<style scoped>
</style>

