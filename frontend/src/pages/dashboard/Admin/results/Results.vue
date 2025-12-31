<template>
  <div class="p-4">
    <!-- Results List -->
    <a-card>
      <ResultsList
        :permissions="adminPermissions"
        role="ADMIN"
        @addResult="openAddForm"
        @editResult="openEditForm"
        @deleteResult="openDeleteForm"
      />
    </a-card>
  </div>

  <a-drawer
    v-model:open="isFormOpen"
    :title="formMode === 'create' ? 'Add Result' : 'Edit Result'"
    width="500px"
    destroy-on-close
    @close="closeForm"
  >
    <ResultForm
      :mode="formMode"
      :loading="false"
      :result="selectedResult"
      @submit="handleFormSubmit"
      @cancel="closeForm"
    />
  </a-drawer>
</template>

<script setup>
// 1. Imports - Vue core
import { ref } from 'vue';
// 2. Imports - Components
import ResultsList from '@/components/shared/lists/ResultsList.vue';
import ResultForm from './components/ResultForm.vue';

// 3. Constants
// Permissions for Admin
const adminPermissions = {
  canEdit: true,
  canDelete: true,
  canView: true,
};

// 4. Reactive State
const isFormOpen = ref(false);
const formMode = ref('create');
const selectedResult = ref(null);

// 5. Methods
/**
 * Yangi natija qo'shish formini ochish
 */
const openAddForm = () => {
  formMode.value = 'create';
  selectedResult.value = null;
  isFormOpen.value = true;
};

/**
 * Natijani tahrirlash formini ochish
 * @param {Object} result - Tahrirlash kerak bo'lgan natija ma'lumotlari
 */
const openEditForm = (result) => {
  selectedResult.value = { ...result };
  formMode.value = 'edit';
  isFormOpen.value = true;
};

/**
 * Formani yopish va state'ni tozalash
 */
const closeForm = () => {
  selectedResult.value = null;
  formMode.value = 'create';
  isFormOpen.value = false;
};

/**
 * Natijani o'chirish
 * @param {Object} record - O'chirish kerak bo'lgan natija ma'lumotlari
 */
const openDeleteForm = (record) => {
  // TODO: keyinchalik bu yerga store.deleteResult(record.id) qo'shamiz
  console.log('DELETE TEMPLATE, record:', record);
};

/**
 * Form submit qilinganda ishlaydi
 * @param {Object} values - Form ma'lumotlari
 */
const handleFormSubmit = (values) => {
  if (formMode.value === 'create') {
    // TODO: keyin: resultsStore.createResult(values)
    console.log('CREATE TEMPLATE, values:', values);
  } else {
    // TODO: keyin: resultsStore.updateResult(selectedResult.value.id, values)
    console.log('EDIT TEMPLATE, id:', selectedResult.value?.id, 'values:', values);
  }
  closeForm();
};
</script>

<style scoped></style>

