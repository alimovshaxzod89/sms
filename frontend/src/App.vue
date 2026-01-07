<template>
  <RouterView />
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuth } from '@/store/auth/auth.pinia';

const authStore = useAuth();

onMounted(() => {
  // Ilova yuklanganda auth holatini tiklash
  authStore.initAuth();
});
</script>

<style scoped>
.main-loader {
  height: 100%;
}

.main-loader :deep(.ant-spin-container) {
  height: 100%;
}
</style>