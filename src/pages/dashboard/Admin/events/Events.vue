<template>
    <div class="p-4">
        <a-card>
            <EventList 
                :permissions="adminPermissions"
                role="ADMIN"
            />
        </a-card>
    </div>
</template>
<script setup>
import EventList from '@/components/shared/lists/EventList.vue';

// Permissions for Admin
const adminPermissions = {
    canEdit: true,
    canDelete: true,
    canView: true,
};
</script>