<template>
  <a-layout class="h-screen">
    <!-- Desktop Sidebar (faqat lg va kattaroqda) -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      :collapsed-width="80"
      :width="200"
      class="!bg-white border-r border-gray-200 hidden lg:block"
    >
      <!-- Logo Section -->
      <div class="p-[1.21rem] flex items-center justify-center gap-2 border-b border-gray-200">
        <router-link to="/" class="flex items-center justify-center gap-2">
          <img src="@/assets/vue.svg" alt="logo" class="w-6">
          <span v-if="!collapsed" class="text-lg text-black font-semibold">SMS</span>
        </router-link>
      </div>
      
      <!-- Sidebar Menu -->
      <SidebarMenu />
    </a-layout-sider>

    <!-- Mobile Drawer Sidebar (faqat lg dan kichikda) -->
    <a-drawer
      v-model:open="drawerVisible"
      placement="left"
      :closable="false"
      :width="200"
      :body-style="{ padding: 0 }"
      class="lg:hidden"
    >
      <div class="bg-white h-full">
        <!-- Logo Section -->
        <div class="p-[1.21rem] flex items-center justify-center gap-2 border-b border-gray-200">
          <router-link to="/" class="flex items-center justify-center gap-2" @click="drawerVisible = false">
            <img src="@/assets/vue.svg" alt="logo" class="w-6">
            <span class="text-lg text-black font-semibold">SMS</span>
          </router-link>
        </div>
        
        <!-- Sidebar Menu -->
        <SidebarMenu @menu-click="drawerVisible = false" />
      </div>
    </a-drawer>

    <!-- Right Side Layout -->
    <a-layout>
      <!-- Header/Navbar -->
      <a-layout-header class="!bg-white !p-0 border-b border-gray-200">
        <NavbarComponent @toggle-sidebar="toggleSidebar" :show-burger="true" />
      </a-layout-header>

      <!-- Main Content -->
      <a-layout-content class="bg-[#F7F8FA] overflow-auto">
        <RouterView />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref } from 'vue';
import NavbarComponent from '@/components/layouts/navbar/NavbarComponent.vue';
import SidebarMenu from '@/components/layouts/sidebar-menu/SidebarMenu.vue';

// Desktop sidebar collapsed holati
const collapsed = ref(false);

// Mobile drawer visibility
const drawerVisible = ref(false);

// Toggle sidebar (desktop va mobile uchun)
const toggleSidebar = () => {
  // Mobile da drawer ni toggle qilish
  drawerVisible.value = !drawerVisible.value;
  
  // Desktop da collapsed ni toggle qilish (ixtiyoriy)
  // collapsed.value = !collapsed.value;
};
</script>

<style scoped>
/* Ant Design default padding va background uchun override */
:deep(.ant-layout-header) {
  height: auto;
  line-height: normal;
}

:deep(.ant-layout-sider-children) {
  display: flex;
  flex-direction: column;
}

/* Drawer uchun stil */
:deep(.ant-drawer-body) {
  background-color: white;
}
</style>