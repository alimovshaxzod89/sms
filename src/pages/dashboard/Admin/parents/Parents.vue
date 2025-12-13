<template>
    <div class="p-4">
      <!-- Parents List -->
      <a-card>
        <ParentsList
          :permissions="adminPermissions"
          role="ADMIN"
        />
      </a-card>
    </div>
  </template>
  
  <script setup>
  import ParentsList from '@/components/shared/lists/ParentsList.vue';
  
  // Permissions for Admin
  const adminPermissions = {
    canEdit: true,
    canDelete: true,
    canView: true,
  };
  
</script>
  
<style scoped>
</style>