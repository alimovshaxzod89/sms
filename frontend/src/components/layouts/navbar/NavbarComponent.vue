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

      <!-- <div class="hidden sm:flex flex-col">
        <span class="text-xs leading-3 font-medium">John Doe</span>
        <span class="text-[10px] leading-3 text-gray-500 font-medium">Admin</span>
      </div> -->

      <!-- User Info -->
      <div v-if="!authStore.isLoading && authStore.isLoggedIn" class="hidden sm:flex flex-col">
        <span class="text-xs leading-3 font-medium">{{ fullName }}</span>
        <span class="text-[10px] leading-3 text-gray-500 font-medium">{{ userRoleDisplay }}</span>
      </div>

      <!-- Loading State -->
      <div v-else-if="authStore.isLoading" class="hidden sm:flex flex-col">
        <a-skeleton :title="false" :paragraph="{ rows: 2, width: ['60px', '40px'] }" active />
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
import { computed, onMounted, ref, watch } from 'vue';
import IconSearch from '@/components/icon/menu-icons/IconSearch.vue';
import IconComment from '@/components/icon/menu-icons/IconComment.vue';
import IconAnnouncement from '@/components/icon/menu-icons/IconAnnouncement.vue';
import IconUser from '@/components/icon/menu-icons/IconUser.vue';
import IconMenu from '@/components/icon/menu-icons/IconMenu.vue';
import { useAuth } from '@/store/auth/auth.pinia';

// Pinia store
const authStore = useAuth();

// Search state
const searchValue = ref('');

// Emit toggle event
defineEmits(['toggleSidebar']);

/**
 * User to'liq ismi (computed property)
 * Store'dagi fullName getter'idan foydalanadi
 */
const fullName = computed(() => authStore.fullName || 'ADMIN');

/**
 * User roli ko'rinishi (computed property)
 * Store'dagi userRole getter'idan foydalanadi va ko'rinish uchun formatlaydi
 */
const userRoleDisplay = computed(() =>{
  if(authStore.userRole){
    const roleMap = {
      'ADMIN': 'ADMIN',
      "TEACHER": 'O\'qituvchi',
      "STUDENT": 'O\'quvchi',
      "PARENT": 'Ota-ona',
    }

    return roleMap[authStore.userRole] || authStore.userRole.toUpperCase();
  };
})

/**
 * Component mount bo'lganda user ma'lumotlarini yuklash
 * Agar user allaqachon mavjud bo'lsa, qayta so'rov yubormaydi
 */
onMounted(async () => {
  // Agar token bor lekin user ma'lumotlari yo'q bo'lsa, yuklash
  if(authStore.token && !authStore.user){
    await authStore.fetchUser();
  }

  // Agar hech qanday auth ma'lumotlari yo'q bo'lsa, init qilish
  if (!authStore.token) {
    authStore.initAuth();
  }
})

/**
 * User ma'lumotlarini kuzatish (ixtiyoriy)
 * Agar boshqa joyda user yangilansa, avtomatik yangilanadi
 */
 watch(
  () => authStore.user,
  (newUser) => {
    if (newUser) {
      console.log('User ma\'lumotlari yangilandi:', newUser);
    }
  },
  { deep: true }
);
</script>

<style scoped></style>