<template>
    <a-card class="flex-1 m-4 mt-0 border-none">
      <!-- Top -->
      <div class="flex items-center justify-between">
        <a-typography-title :level="4" class="!mb-0 hidden md:block">
          All Subjects
        </a-typography-title>
        <div class="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <BaseTableSearch 
            v-model="searchValue" 
            @search="handleSearch" 
            @press-enter="handlePressEnter"
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
              @click="emit('addSubject')"
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
          :data-source="formattedSubjects" 
          :loading="subjectsStore.isLoading"
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
// 1. Imports - Vue core
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// 2. Imports - Components
import BaseTable from '@components/base-components/BaseTable.vue';
import BaseTableSearch from '@components/base-components/BaseTableSearch.vue';
import IconFilter from '@components/icon/IconFilter.vue';
import IconPlus from '@components/icon/IconPlus.vue';
import IconSort from '@components/icon/IconSort.vue';
// 3. Imports - Composables
import { useSearch } from '@/composables/useSearch';
// 4. Imports - Store
import { useSubjectsStore } from '@/store/subject/subjects.pinia';

// 5. Composables / Router / Store
const router = useRouter();
const route = useRoute();
const subjectsStore = useSubjectsStore();

// 6. Props
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

// 7. Emits
const emit = defineEmits(['addSubject', 'editSubject', 'deleteSubject']);

// 8. Composables (useSearch)
const { searchValue } = useSearch({
    debounceMs: 500,
    queryKey: 'search',
    onSearch: (value) => {
        performSearch(value);
    }
});

// 9. Computed
// Table columns konfiguratsiyasi
const tableColumns = computed(() => [
    {
        title: '№',
        key: 'number',
        width: 60,
        align: 'center',
        fixed: 'left'
    },
    {
        title: 'Fan',
        key: 'name',
        dataIndex: 'name',
        sorter: true,
        ellipsis: true
    },
    {
        title: "O'qituvchilar",
        key: 'teachers',
        dataIndex: 'teachers',
        align: 'center',
        ellipsis: true
    },
    {
        title: 'Amallar',
        key: 'action',
        align: 'center'
    }
]);

const formattedSubjects = computed(() => {
    return subjectsStore.getSubjects.map((subject) => ({
        ...subject,
        key: subject._id || subject.id,
    }));
});

// Pagination config
const paginationConfig = computed(() => ({
    current: subjectsStore.pagination.currentPage,
    pageSize: subjectsStore.pagination.pageSize,
    total: subjectsStore.pagination.total,
    showSizeChanger: true,
    showTotal: (total) => `Jami ${total} ta fan`
}));

// 10. Methods
/**
 * Qidiruvni amalga oshirish
 */
const performSearch = (searchQuery = '') => {
    const page = parseInt(route.query.page) || 1;
    const pageSize = parseInt(route.query.pageSize) || 10;
    
    subjectsStore.fetchSubjects({
        page,
        pageSize,
        search: searchQuery,
    });
};

/**
 * URL query params'ni yangilash (browser history'ga yozilmaydi)
 */
const updateURLParams = (params) => {
    const query = {
        ...route.query,
        ...params,
    };
    
    // Bo'sh qiymatlarni olib tashlash
    Object.keys(query).forEach(key => {
        if (query[key] === '' || query[key] === null || query[key] === undefined) {
            delete query[key];
        }
    });
    
    router.replace({ query });
};

/**
 * URL query params'dan ma'lumotlarni o'qib, store'ga yuborish
 */
const loadFromURL = () => {
    const query = route.query;
    const page = parseInt(query.page) || 1;
    const pageSize = parseInt(query.pageSize) || 10;
    const search = query.search || '';
    
    // Local state'ni yangilash
    searchValue.value = search;
    
    // Agar search bo'sh bo'lsa, to'g'ridan-to'g'ri yuklash
    if (!search) {
        subjectsStore.fetchSubjects({
            page,
            pageSize,
            search: '',
        });
    }
};

/**
 * Pagination o'zgarganda URL'ni yangilash
 */
const handleTableChange = ({ pag, filters, sorter }) => {
    if (pag) {
        updateURLParams({
            page: pag.current,
            pageSize: pag.pageSize,
            search: searchValue.value || '',
        });
    }

    // Kelajakda sorter va filterlarni ham qo'shish mumkin
    if (sorter) {
        // Sorting logikasi
    }
    
    if (filters) {
        // Filter logikasi
    }
};

const handleSearch = (value) => {};
const handlePressEnter = () => {};

const handleView = (record) => {
    console.log('View subject:', record);
    // View logic
};

const handleEdit = (record) => {
    console.log('Edit subject:', record);
    emit('editSubject', record);
};

const handleDelete = (record) => {
    console.log('Delete subject:', record);
    emit('deleteSubject', record);
};

// 11. Watchers
/**
 * URL query params o'zgarganda (browser back/forward) ma'lumotlarni yangilash
 */
watch(() => route.query, (newQuery) => {
    // Faqat URL o'zgarganda ishlaydi (component ichida o'zgartirishlar emas)
    const page = parseInt(newQuery.page) || 1;
    const pageSize = parseInt(newQuery.pageSize) || 10;
    const search = newQuery.search || '';
    
    // Agar store'dagi qiymatlar URL'dan farq qilsa, yangilash
    if (
        subjectsStore.pagination.currentPage !== page ||
        subjectsStore.pagination.pageSize !== pageSize ||
        searchValue.value !== search
    ) {
        searchValue.value = search;
        subjectsStore.fetchSubjects({
            page,
            pageSize,
            search,
        });
    }
}, { deep: true });

// 12. Lifecycle Hooks
onMounted(() => {
    if (Object.keys(route.query).length > 0) {
        loadFromURL();
    } else {
        // Aks holda default qiymatlar bilan yuklash
        subjectsStore.fetchSubjects();
    }
});
</script>
  
  <style scoped></style>