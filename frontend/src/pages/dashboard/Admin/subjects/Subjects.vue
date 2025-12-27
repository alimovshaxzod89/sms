<template>
    <div class="p-4">
      <!-- Subjects List -->
      <a-card>
        <SubjectsList
          :permissions="adminPermissions"
          role="ADMIN"
          @addSubject="openAddForm"
          @editSubject="openEditForm"
          @deleteSubject="openDeleteForm"
        />
      </a-card>
    </div>
    <a-drawer
      v-model:open="isFormOpen"
      :title="formMode === 'create' ? 'Add Subject' : 'Edit Subject'"
      width="500px"
      destroy-on-close
      @close="closeForm"
    >
      <SubjectForm 
        :mode="formMode"
        :loading="false"
        :subject="selectedSubject"
        @submit="handleFormSubmit"
        @cancel="closeForm"
      />
    </a-drawer>
  </template>
  
<script setup>
// 1. Imports
import { ref } from 'vue';
import SubjectsList from '@/components/shared/lists/SubjectsList.vue';
import SubjectForm from './components/SubjectForm.vue';

// 2. Constants
// Permissions for Admin
const adminPermissions = {
  canEdit: true,
  canDelete: true,
  canView: true,
};

// 3. Refs / State
const isFormOpen = ref(false);
const formMode = ref('create');
const selectedSubject = ref(null);

// 4. Methods
const openAddForm = () => {
  isFormOpen.value = true;
  formMode.value = 'create';
  selectedSubject.value = null;
};

const openEditForm = (subject) => {
  isFormOpen.value = true;
  formMode.value = 'edit';
  selectedSubject.value = { ...subject };
};

const openDeleteForm = (subject) => {
  console.log('DELETE SUBJECT', subject);
};

const closeForm = () => {
  selectedSubject.value = null;
  formMode.value = 'create';
  isFormOpen.value = false;
};

const handleFormSubmit = (values) => {
  if (formMode.value === 'create') {
    console.log('CREATE SUBJECT, values:', values);
    // keyin: subjectsStore.createSubject(values)
  } else {
    console.log('EDIT SUBJECT, id:', selectedSubject.value?.id, 'values:', values);
    // keyin: subjectsStore.updateSubject(selectedSubject.value.id, values)
  }
  isFormOpen.value = false;
};
</script>
  
<style scoped>
</style>