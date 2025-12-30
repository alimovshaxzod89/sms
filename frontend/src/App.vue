<template>
  <RouterView />
</template>
<script setup>
import { onMounted } from 'vue';

  onMounted(() => {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    if(!role || !token){
      localStorage.setItem('role', 'admin');
      localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY2NzExNDczLCJleHAiOjE3NjkzMDM0NzN9._puNFfHWBpL3ivVnX20iLr6koP-74YVCEkVwVYTlrKQ');
    }
  })
</script>

<style scoped>
.main-loader {
  height: 100%;
}

.main-loader :deep(.ant-spin-container) {
  height: 100%;
}
</style>