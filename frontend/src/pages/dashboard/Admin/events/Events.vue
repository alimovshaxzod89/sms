<template>
  <div class="p-4">
    <!-- Events List -->
    <a-card>
      <EventsList
        :permissions="adminPermissions"
        role="ADMIN"
        @addEvent="openAddForm"
        @editEvent="openEditForm"
        @deleteEvent="openDeleteForm"
      />
    </a-card>
  </div>

  <a-drawer
    v-model:open="isFormOpen"
    :title="formMode === 'create' ? 'Add Event' : 'Edit Event'"
    width="500px"
    destroy-on-close
    @close="closeForm"
  >
    <EventForm
      :mode="formMode"
      :loading="false"
      :event="selectedEvent"
      @submit="handleFormSubmit"
      @cancel="closeForm"
    />
  </a-drawer>
</template>

<script setup>
// 1. Imports - Vue core
import { ref } from 'vue';
// 2. Imports - Components
import EventsList from '@/components/shared/lists/EventsList.vue';
import EventForm from './components/EventForm.vue';

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
const selectedEvent = ref(null);

// 5. Methods
/**
 * Yangi tadbir qo'shish formini ochish
 */
const openAddForm = () => {
  formMode.value = 'create';
  selectedEvent.value = null;
  isFormOpen.value = true;
};

/**
 * Tadbirni tahrirlash formini ochish
 * @param {Object} event - Tahrirlash kerak bo'lgan tadbir ma'lumotlari
 */
const openEditForm = (event) => {
  selectedEvent.value = { ...event };
  formMode.value = 'edit';
  isFormOpen.value = true;
};

/**
 * Formani yopish va state'ni tozalash
 */
const closeForm = () => {
  selectedEvent.value = null;
  formMode.value = 'create';
  isFormOpen.value = false;
};

/**
 * Tadbirni o'chirish
 * @param {Object} record - O'chirish kerak bo'lgan tadbir ma'lumotlari
 */
const openDeleteForm = (record) => {
  // TODO: keyinchalik bu yerga store.deleteEvent(record.id) qo'shamiz
  console.log('DELETE TEMPLATE, event:', record);
};

/**
 * Form submit qilinganda ishlaydi
 * @param {Object} values - Form ma'lumotlari
 */
const handleFormSubmit = (values) => {
  if (formMode.value === 'create') {
    // TODO: keyin: eventsStore.createEvent(values)
    console.log('FORM SUBMIT, values:', values);
  } else {
    // TODO: keyin: eventsStore.updateEvent(selectedEvent.value.id, values)
    console.log('EDIT TEMPLATE, id:', selectedEvent.value?.id, 'values:', values);
  }
  closeForm();
};
</script>

<style scoped>
</style>