<template>
    <div>
        <h1>Parents List</h1>
    </div>
  </template>
  
<script setup>
  const props = defineProps({
    permissions: {
      type: Object,
      default: () => ({
        canEdit: true,
        canDelete: true,
        canView: true,
      })
    },
    role: {
      type: String,
      default: 'ADMIN'
    }
  });
  
  
</script>

<style scoped>
</style>