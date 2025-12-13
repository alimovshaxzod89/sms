<template>
    <div class="p-4">
      <!-- Assignments List -->
      <a-card>
        <AssignmentsList
          :permissions="adminPermissions"
          role="ADMIN"
        />
      </a-card>
    </div>
  </template>
  
  <script setup>
  import AssignmentsList from '@/components/shared/lists/AssignmentsList.vue';
  
  // Permissions for Admin
  const adminPermissions = {
    canEdit: true,
    canDelete: true,
    canView: true,
  };
  
</script>
  
<style scoped>
</style>

