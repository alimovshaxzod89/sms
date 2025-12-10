<template>
    <div class="p-4">
      <!-- Teachers List -->
      <a-card>
        <TeachersList
          :permissions="adminPermissions"
          role="ADMIN"
        />
      </a-card>
    </div>
  </template>
  
  <script setup>
  import TeachersList from '@/components/shared/TeachersList.vue';
  
  // Permissions for Admin
  const adminPermissions = {
    canEdit: true,
    canDelete: true,
    canView: true,
  };
  
</script>
  
<style scoped>
</style>