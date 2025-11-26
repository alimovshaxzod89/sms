<template>
    <div class="flex items-center justify-between p-4 bg-white">
      <!-- Burger Menu (faqat mobile da) -->
      <div class="lg:hidden cursor-pointer" @click="$emit('toggleSidebar')">
        <IconMenu class="w-6 h-6" />
      </div>
  
      <!-- Search Bar -->
      <div class="hidden md:flex items-center gap-2 bg-[#F7F8FA] border border-gray-200 rounded-md p-2 flex-1 lg:flex-none max-w-md ml-4 lg:ml-0">
        <IconSearch />
        <input type="text" placeholder="Search..." class="w-full outline-none bg-[#F7F8FA] rounded-md" />
      </div>
  
      <!-- Icons and User -->
      <div class="flex items-center gap-2">
        <div class="bg-white rounded-full flex items-center justify-center cursor-pointer">
          <IconComment class="w-5 h-5" />
        </div>
        <div class="bg-white rounded-full flex items-center justify-center cursor-pointer">
          <IconAnnouncement class="w-5 h-5" />
        </div>
        <div class="hidden sm:flex flex-col">
          <span class="text-xs leading-3 font-medium">John Doe</span>
          <span class="text-[10px] leading-3 text-gray-500 font-medium">Admin</span>
        </div>
        <div class="bg-gray-200 p-2.5 rounded-full flex items-center justify-center cursor-pointer">
          <IconUser />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import IconSearch from '@/components/icon/IconSearch.vue';
  import IconComment from '@/components/icon/IconComment.vue';
  import IconAnnouncement from '@/components/icon/IconAnnouncement.vue';
  import IconUser from '@/components/icon/IconUser.vue';
  import IconMenu from '@/components/icon/IconMenu.vue';
  
  // Emit toggle event
  defineEmits(['toggleSidebar']);
  </script>
  
  <style scoped></style>