<template>
  <div class="p-4">
    <!-- Announcements List -->
    <a-card>
      <AnnouncementsList
        :permissions="adminPermissions"
        role="ADMIN"
        @addAnnouncement="openAddForm"
        @editAnnouncement="openEditForm"
        @deleteAnnouncement="openDeleteForm"
      />
    </a-card>
  </div>

  <a-drawer
    v-model:open="isFormOpen"
    :title="formMode === 'create' ? 'Add Announcement' : 'Edit Announcement'"
    width="500px"
    destroy-on-close
    @close="closeForm"
  >
    <AnnouncementForm
      :mode="formMode"
      :loading="false"
      :announcement="selectedAnnouncement"
      @submit="handleFormSubmit"
      @cancel="closeForm"
    />
  </a-drawer>
</template>

<script setup>
// 1. Imports - Vue core
import { ref } from 'vue';
// 2. Imports - Components
import AnnouncementsList from '@/components/shared/lists/AnnouncementsList.vue';
import AnnouncementForm from './components/AnnouncementForm.vue';

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
const selectedAnnouncement = ref(null);

// 5. Methods
/**
 * Yangi e'lon qo'shish formini ochish
 */
const openAddForm = () => {
  formMode.value = 'create';
  selectedAnnouncement.value = null;
  isFormOpen.value = true;
};

/**
 * E'lonni tahrirlash formini ochish
 * @param {Object} announcement - Tahrirlash kerak bo'lgan e'lon ma'lumotlari
 */
const openEditForm = (announcement) => {
  selectedAnnouncement.value = { ...announcement };
  formMode.value = 'edit';
  isFormOpen.value = true;
};

/**
 * Formani yopish va state'ni tozalash
 */
const closeForm = () => {
  selectedAnnouncement.value = null;
  formMode.value = 'create';
  isFormOpen.value = false;
};

/**
 * E'lonni o'chirish
 * @param {Object} record - O'chirish kerak bo'lgan e'lon ma'lumotlari
 */
const openDeleteForm = (record) => {
  // TODO: keyinchalik bu yerga announcementsStore.deleteAnnouncement(record.id) qo'shamiz
  console.log('DELETE TEMPLATE, announcement:', record);
};

/**
 * Form submit qilinganda ishlaydi
 * @param {Object} values - Form ma'lumotlari
 */
const handleFormSubmit = (values) => {
  if (formMode.value === 'create') {
    // TODO: keyin: announcementsStore.createAnnouncement(values)
    console.log('FORM SUBMIT, values:', values);
  } else {
    // TODO: keyin: announcementsStore.updateAnnouncement(selectedAnnouncement.value.id, values)
    console.log('EDIT TEMPLATE, id:', selectedAnnouncement.value?.id, 'values:', values);
  }
  closeForm();
};
</script>

<style scoped>
</style>
