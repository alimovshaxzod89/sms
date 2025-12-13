<template>
    <div class="p-4">
      <!-- Exams List -->
      <a-card>
        <ExamsList
          :permissions="adminPermissions"
          role="ADMIN"
        />
      </a-card>
    </div>
  </template>
  
  <script setup>
  import ExamsList from '@/components/shared/lists/ExamsList.vue';
  
  // Permissions for Admin
  const adminPermissions = {
    canEdit: true,
    canDelete: true,
    canView: true,
  };
  
</script>
  
<style scoped>
</style>

