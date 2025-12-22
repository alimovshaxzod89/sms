<template>
  <a-card class="flex-1 m-4 mt-0 border-none">
    <!-- Top -->
    <div class="flex items-center justify-between">
      <a-typography-title :level="4" class="!mb-0 hidden md:block">
        All Teachers
      </a-typography-title>
      <div class="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
        <BaseTableSearch 
          v-model="searchValue" 
        />
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
            @click="emit('addTeacher')"
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
        :data-source="formattedTeachers" 
        :loading="teachersStore.isLoading"
        :pagination="paginationConfig"
        :permissions="permissions"
        :scroll="{ x: 'max-content' }"
        @view-row="handleView"
        @edit-row="handleEdit"
        @delete-row="handleDelete"
      />
    </div>
  </a-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTeachersStore } from '@/store/teacher/teachers.pinia';
import BaseTableSearch from '@components/base-components/BaseTableSearch.vue';
import IconFilter from '@components/icon/IconFilter.vue';
import IconSort from '@components/icon/IconSort.vue';
import IconPlus from '@components/icon/IconPlus.vue';
import BaseTable from '@components/base-components/BaseTable.vue';


const router = useRouter();
const teachersStore = useTeachersStore();

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

const emit = defineEmits(['addTeacher', 'editTeacher', 'deleteTeacher']);

// State
const searchValue = ref('');

// Table columns konfiguratsiyasi
const tableColumns = computed(() => [
  {
    title: 'Rasm',
    key: 'photo',
    dataIndex: 'photo',
    width: 80,
    align: 'center'
  },
  {
    title: 'F.I.O.',
    key: 'name',
    dataIndex: 'name',
    sorter: true,
    width: 200,
    align: 'center',
    customRender: ({ record }) => `${record.name} ${record.surname}`
  },
  {
    title: 'Fanlar',
    key: 'subjects',
    dataIndex: 'subjects',
    width: 250,
    align: 'center',
  },
  {
    title: 'Sinflar',
    key: 'classes',
    dataIndex: 'classes',
    width: 250,
    align: 'center',
  },
  // {
  //   title: 'Email',
  //   key: 'email',
  //   dataIndex: 'email',
  //   width: 200,
  //   align: 'center'
  // },
  {
    title: 'Telefon',
    key: 'phone',
    dataIndex: 'phone',
    width: 150,
    align: 'center'
  },
  {
    title: 'Manzil',
    key: 'address',
    dataIndex: 'address',
    ellipsis: true,
    align: 'center'
  },
  {
    title: 'Amallar',
    key: 'action',
    width: 150,
    fixed: 'right',
    align: 'center'
  }
]);

// Formatlangan o'qituvchilar ro'yxati
const formattedTeachers = computed(() => {
  return teachersStore.getTeachers.map(teacher => ({
    ...teacher,
    key: teacher._id || teacher.id, // Table uchun unique key
  }));
});

// Pagination config
const paginationConfig = computed(() => ({
  current: teachersStore.pagination.currentPage,
  pageSize: teachersStore.pagination.pageSize,
  total: teachersStore.pagination.total,
  showSizeChanger: true,
  showTotal: (total) => `Jami ${total} ta o'qituvchi`,
  pageSizeOptions: ['10', '20', '50', '100'],
}));

// Component mount bo'lganda o'qituvchilarni yuklash
onMounted(() => {
  teachersStore.fetchTeachers();
});

const handleView = (record) => {
  router.push({ 
    name: "TeacherDetail", 
    params: { id: record._id || record.id } 
  });
};

const handleEdit = (record) => {
  emit('editTeacher', record);
};

const handleDelete = (record) => {
  emit('deleteTeacher', record);
};
</script>

<style scoped></style>