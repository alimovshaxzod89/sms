<template>
  <div class="p-4">
    <!-- Lessons List -->
    <a-card>
      <LessonsList
        :permissions="adminPermissions"
        role="ADMIN"
        @addLesson="openAddForm"
        @editLesson="openEditForm"
        @deleteLesson="openDeleteForm"
      />
    </a-card>
  </div>

  <a-drawer
    v-model:open="isFormOpen"
    :title="formMode === 'create' ? 'Add Lesson' : 'Edit Lesson'"
    width="500px"
    destroy-on-close
    @close="closeForm"
  >
    <LessonForm
      :mode="formMode"
      :loading="false"
      :lesson="selectedLesson"
      @submit="handleFormSubmit"
      @cancel="closeForm"
    />
  </a-drawer>
</template>

<script setup>
// 1. Imports - Vue core
import { ref } from 'vue';
// 2. Imports - Components
import LessonsList from '@/components/shared/lists/LessonsList.vue';
import LessonForm from './components/LessonForm.vue';

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
const selectedLesson = ref(null);

// 5. Methods
/**
 * Yangi dars qo'shish formini ochish
 */
const openAddForm = () => {
  formMode.value = 'create';
  selectedLesson.value = null;
  isFormOpen.value = true;
};

/**
 * Darsni tahrirlash formini ochish
 * @param {Object} lesson - Tahrirlash kerak bo'lgan dars ma'lumotlari
 */
const openEditForm = (lesson) => {
  selectedLesson.value = { ...lesson };
  formMode.value = 'edit';
  isFormOpen.value = true;
};

/**
 * Formani yopish va state'ni tozalash
 */
const closeForm = () => {
  selectedLesson.value = null;
  formMode.value = 'create';
  isFormOpen.value = false;
};

/**
 * Darsni o'chirish
 * @param {Object} record - O'chirish kerak bo'lgan dars ma'lumotlari
 */
const openDeleteForm = (record) => {
  // TODO: keyinchalik bu yerga store.deleteLesson(record.id) qo'shamiz
  console.log('DELETE TEMPLATE, record:', record);
};

/**
 * Form submit qilinganda ishlaydi
 * @param {Object} values - Form ma'lumotlari
 */
const handleFormSubmit = (values) => {
  if (formMode.value === 'create') {
    // TODO: keyin: lessonsStore.createLesson(values)
    console.log('CREATE TEMPLATE, values:', values);
  } else {
    // TODO: keyin: lessonsStore.updateLesson(selectedLesson.value.id, values)
    console.log('EDIT TEMPLATE, id:', selectedLesson.value?.id, 'values:', values);
  }
  closeForm();
};
</script>
<style scoped></style>