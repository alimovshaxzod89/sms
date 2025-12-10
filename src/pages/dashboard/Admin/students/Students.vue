<template>
    <div class="p-4">
        <!-- Student List -->
        <a-card>
            <StudentList :permissions="adminPermissions" role="ADMIN" />
        </a-card>
    </div>
</template>

<script setup>
import StudentList from '@/components/shared/StudentList.vue';

// Permissions for Admin
const adminPermissions = {
    canEdit: true,
    canDelete: true,
    canView: true,
};

</script>

<style scoped></style>