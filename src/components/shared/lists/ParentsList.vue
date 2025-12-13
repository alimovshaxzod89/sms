<template>
  <a-card class="flex-1 m-4 mt-0 border-none">
    <!-- Top -->
    <div class="flex items-center justify-between">
      <a-typography-title :level="4" class="!mb-0 hidden md:block">
        All Parents
      </a-typography-title>
      <div class="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
        <BaseTableSearch v-model="searchValue" @search="handleSearch" />
        <a-space class="self-end">
          <a-button 
            shape="circle" 
            type="text"
            class="bg-yellow-300 hover:bg-yellow-400"
          >
            <template #icon>
              <IconFilter />
            </template>
          </a-button>
          <a-button 
            shape="circle" 
            type="text"
            class="bg-yellow-300 hover:bg-yellow-400"
          >
            <template #icon>
              <IconSort />
            </template>
          </a-button>
          <a-button 
            shape="circle" 
            type="text"
            class="bg-yellow-300 hover:bg-yellow-400"
          >
            <template #icon>
              <IconPlus />
            </template>
          </a-button>
        </a-space>
      </div>
    </div>
    
    <!-- List -->
    <div class="mt-4 overflow-x-auto">
      <BaseTable 
        :columns="tableColumns" 
        :data-source="parentsData" 
        :loading="loading"
        :pagination="paginationConfig"
        :permissions="permissions"
        :scroll="{ x: 'max-content' }"
        @change-page="handleTableChange"
        @view-row="handleView"
        @edit-row="handleEdit"
        @delete-row="handleDelete"
      />
    </div>
  </a-card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { parentsData } from '@/lib/data';
import BaseTableSearch from '@components/base-components/BaseTableSearch.vue';
import IconFilter from '@components/icon/IconFilter.vue';
import IconSort from '@components/icon/IconSort.vue';
import IconPlus from '@components/icon/IconPlus.vue';
import BaseTable from '@components/base-components/BaseTable.vue';

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

// State
const searchValue = ref('');
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);

// Table columns konfiguratsiyasi
const tableColumns = computed(() => [
  {
    title: 'F.I.O.',
    key: 'name',
    dataIndex: 'name',
    sorter: true,
    ellipsis: true
  },
  {
    title: 'Talabalar',
    key: 'students',
    dataIndex: 'students',
    align: 'center',
    ellipsis: true
  },
  {
    title: 'Telefon',
    key: 'phone',
    dataIndex: 'phone',
    align: 'center',
    ellipsis: true
  },
  
  {
    title: 'Manzil',
    key: 'address',
    dataIndex: 'address',
    ellipsis: true,
    align: 'center',
    ellipsis: true
  },
  {
    title: 'Amallar',
    key: 'action',
    width: 150,
    // fixed: 'right',
    align: 'center',
    ellipsis: true
  }
]);

// Pagination config
const paginationConfig = computed(() => ({
  current: currentPage.value,
  pageSize: pageSize.value,
  total: searchValue.value 
    ? parentsData.filter(parent => 
        parent.name.toLowerCase().includes(searchValue.value.toLowerCase()) ||
        parent.email.toLowerCase().includes(searchValue.value.toLowerCase()) ||
        parent.phone.includes(searchValue.value) ||
        parent.students.some(student => student.toLowerCase().includes(searchValue.value.toLowerCase()))
      ).length
    : parentsData.length,
  showSizeChanger: true,
  showTotal: (total) => `Jami ${total} ta ota-ona`
}));

// Handlers
const handleSearch = (value) => {
  searchValue.value = value;
  currentPage.value = 1; // Qidiruvda birinchi sahifaga qaytish
};

const handleTableChange = ({ pag, filters, sorter }) => {
  if (pag) {
    currentPage.value = pag.current;
    pageSize.value = pag.pageSize;
  }
  // Sorter va filterlarni qo'shish mumkin
};

const handlePaginationChange = (page, size) => {
  currentPage.value = page;
  pageSize.value = size;
};

const handleView = (record) => {
  console.log('View parent:', record);
  // View logic
};

const handleEdit = (record) => {
  console.log('Edit parent:', record);
  // Edit logic
};

const handleDelete = (record) => {
  console.log('Delete parent:', record);
  // Delete logic with confirmation
};
</script>

<style scoped></style>