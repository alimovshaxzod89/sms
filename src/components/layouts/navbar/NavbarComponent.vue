<template>
  <a-layout-header class="flex items-center justify-between p-4 !bg-white">
    <!-- Burger Menu (only mobile) -->
    <a-button 
      type="text" 
      class="lg:hidden !p-0 !h-auto" 
      @click="$emit('toggleSidebar')"
    >
      <IconMenu class="w-6 h-6" />
    </a-button>

    <!-- Search Bar -->
    <div class="hidden md:flex items-center gap-2 bg-[#F7F8FA] border border-gray-200 rounded-md px-2 flex-1 lg:flex-none max-w-md ml-4 lg:ml-0">
      <IconSearch />
      <a-input 
        v-model:value="searchValue" 
        placeholder="Search..." 
        :bordered="false"
        class="!bg-[#F7F8FA] !outline-none"
      />
    </div>

    <!-- Icons and User -->
    <a-space :size="8" class="flex items-center">
      <a-button 
        type="text" 
        shape="circle" 
        class="!bg-white flex items-center justify-center"
      >
        <IconComment class="w-5 h-5" />
      </a-button>

      <a-button 
        type="text" 
        shape="circle" 
        class="!bg-white flex items-center justify-center"
      >
        <IconAnnouncement class="w-5 h-5" />
      </a-button>

      <div class="hidden sm:flex flex-col">
        <span class="text-xs leading-3 font-medium">John Doe</span>
        <span class="text-[10px] leading-3 text-gray-500 font-medium">Admin</span>
      </div>

      <a-avatar class="bg-gray-200 flex items-center justify-center">
        <template #icon>
          <IconUser />
        </template>
      </a-avatar>
    </a-space>
  </a-layout-header>
</template>

<script setup>
import { ref } from 'vue';
import IconSearch from '@/components/icon/menu-icons/IconSearch.vue';
import IconComment from '@/components/icon/menu-icons/IconComment.vue';
import IconAnnouncement from '@/components/icon/menu-icons/IconAnnouncement.vue';
import IconUser from '@/components/icon/menu-icons/IconUser.vue';
import IconMenu from '@/components/icon/menu-icons/IconMenu.vue';

// Search state
const searchValue = ref('');

// Emit toggle event
defineEmits(['toggleSidebar']);
</script>

<style scoped></style>