<template>
    <div class="p-4">
      <!-- Lessons List -->
      <a-card>
        <LessonsList
          :permissions="adminPermissions"
          role="ADMIN"
        />
      </a-card>
    </div>
  </template>
  
  <script setup>
  import LessonsList from '@/components/shared/lists/LessonsList.vue';
  
  // Permissions for Admin
  const adminPermissions = {
    canEdit: true,
    canDelete: true,
    canView: true,
  };
  
</script>
  
<style scoped>
</style>

