<template>
  <div class="p-4">
    <!-- Teachers List -->
    <a-card>
      <TeachersList
        :permissions="adminPermissions"
        role="TEACHER"
      />
    </a-card>
  </div>
</template>

<script setup>
import TeachersList from '@/components/shared/lists/TeachersList.vue';

// Permissions for Teacher
const adminPermissions = {
  canEdit: false,
  canDelete: false,
  canView: true,
};

</script>

<style scoped>
</style>