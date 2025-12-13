<template>
    <div class="p-4">
      <!-- Announcements List -->
      <a-card>
        <AnnouncementsList
          :permissions="adminPermissions"
          role="ADMIN"
        />
      </a-card>
    </div>
  </template>
  
  <script setup>
  import AnnouncementsList from '@/components/shared/lists/AnnouncementsList.vue';
  
  // Permissions for Admin
  const adminPermissions = {
    canEdit: true,
    canDelete: true,
    canView: true,
  };
  
</script>
  
<style scoped>
</style>

