<template>
    <div class="p-4">
      <!-- Subjects List -->
      <a-card>
        <SubjectsList
          :permissions="adminPermissions"
          role="ADMIN"
        />
      </a-card>
    </div>
  </template>
  
  <script setup>
  import SubjectsList from '@/components/shared/lists/SubjectsList.vue';
  
  // Permissions for Admin
  const adminPermissions = {
    canEdit: true,
    canDelete: true,
    canView: true,
  };
  
</script>
  
<style scoped>
</style>