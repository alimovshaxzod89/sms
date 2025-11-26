<template>
  <div class="h-screen flex">
    <!-- Left Sidebar -->
    <div class="w-[14%] md:w-[8%] lg:w-[14%] p-2.5">
      <router-link  to="/" class="flex items-center justify-center gap-2">
        <img src="@/assets/vue.svg" alt="logo" class="w-[32px]">
        <span class="hidden lg:block">SMS</span>
      </router-link>
      <Menu />
    </div>
    <!-- Right Content -->
    <div class="w-[86%] md:w-[92%] lg:w-[86%] bg-[#F7F8FA] overflow-scroll"  >
      <NavbarComponent />
      <RouterView />
    </div>
  </div>
</template>

<script setup>
import NavbarComponent from '@/components/layouts/navbar/NavbarComponent.vue';
import Menu from '@/components/layouts/sidebar-menu/SidebarMenu.vue';


</script>

<style scoped>

</style>