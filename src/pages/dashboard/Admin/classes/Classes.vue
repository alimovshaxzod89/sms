<template>
    <div class="p-4">
      <!-- Subjects List -->
      <a-card>
        <ClassesList
          :permissions="adminPermissions"
          role="ADMIN"
        />
      </a-card>
    </div>
  </template>
  
  <script setup>
  import ClassesList from '@/components/shared/lists/ClassesList.vue';
  
  // Permissions for Admin
  const adminPermissions = {
    canEdit: true,
    canDelete: true,
    canView: true,
  };
  
</script>
  
<style scoped>
</style>