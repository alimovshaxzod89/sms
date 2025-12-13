<template>
    <div class="p-4">
      <!-- Results List -->
      <a-card>
        <ResultsList
          :permissions="adminPermissions"
          role="ADMIN"
        />
      </a-card>
    </div>
  </template>
  
  <script setup>
  import ResultsList from '@/components/shared/lists/ResultsList.vue';
  
  // Permissions for Admin
  const adminPermissions = {
    canEdit: true,
    canDelete: true,
    canView: true,
  };
  
</script>
  
<style scoped>
</style>

