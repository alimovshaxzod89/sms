<template>
    <a-table 
        :columns="columns" 
        :data-source="dataSource" 
        :loading="loading"
        :pagination="pagination"
        :scroll="scrollConfig"
        @change="handleTableChange"
    >
        <!-- Custom slotlar qo'shish mumkin -->
        <template #bodyCell="{ column, record, index }">
            <!-- Number column uchun slot -->
            <template v-if="column.key === 'number'">
                <span class="text-gray-600 font-medium">
                    {{ getRowNumber(index) }}
                </span>
            </template>
            <template v-if="column.key === 'photo'">
                <a-avatar :src="record.photo || noAvatarImg" :size="40" />
            </template>
            <template v-else-if="column.key === 'subjects'">
                <div class="flex flex-wrap gap-1 justify-center">
                    <template v-if="!record.subjects || record.subjects.length === 0">
                        <span class="text-gray-400">-</span>
                    </template>
                    <template v-else>
                        <a-tag 
                            v-for="subject in record.subjects" 
                            :key="subject._id || subject.id || subject"
                            color="blue"
                            class="mb-1"
                        >
                            {{ typeof subject === 'string' ? subject : subject.name }}
                        </a-tag>
                    </template>
                </div>
            </template>
            <template v-else-if="column.key === 'students'">
                <div class="flex flex-wrap gap-1 justify-center">
                    <template v-if="!record.students || record.students.length === 0">
                        <span class="text-gray-400">-</span>
                    </template>
                    <template v-else>
                        <a-tag 
                            v-for="(student, index) in record.students" 
                            :key="student._id || student.id || student || index"
                            color="green"
                            class="mb-1"
                        >
                            {{ typeof student === 'string' ? student : (student.name || student.fullName || '-') }}
                        </a-tag>
                    </template>
                </div>
            </template>
            <template v-else-if="column.key === 'teachers'">
                <div class="flex flex-wrap gap-1 justify-center">
                    <template v-if="!record.teachers || record.teachers.length === 0">
                        <span class="text-gray-400">-</span>
                    </template>
                    <template v-else>
                        <a-tag v-for="teacher in record.teachers" :key="teacher" color="green">
                            {{typeof teacher === 'string' ? teacher : `${teacher.name} ${teacher.surname}` || '-'}}
                        </a-tag>
                    </template>
                </div>
            </template>
            <template v-else-if="column.key === 'classes'">
                <div class="flex flex-wrap gap-1 justify-center">
                    <template v-if="!record.classes || record.classes.length === 0">
                        <span class="text-gray-400">-</span>
                    </template>
                    <template v-else>
                        <a-tag 
                            v-for="cls in record.classes" 
                            :key="cls._id || cls.id || cls"
                            color="green"
                            class="mb-1"
                        >
                            {{ cls.name }}
                        </a-tag>
                    </template>
                </div>
            </template>
            <template v-else-if="column.key === 'gradeId'">
                <div class="flex flex-wrap gap-1 justify-center">
                    <a-tag color="blue">
                        {{ record.gradeId.level || record.gradeId.name || '-' }}
                    </a-tag>
                </div>
            </template>
            <template v-else-if="column.key === 'classId'">
                <div class="flex flex-wrap gap-1 justify-center">
                    <a-tag color="green">
                        {{ record.classId.name || '-' }}
                    </a-tag>
                </div>
            </template>
            <template v-else-if="column.key === 'startTime' || column.key === 'dueDate' || column.key === 'endTime'">
                <div class="flex flex-wrap gap-1 justify-center">
                    <span class="text-gray-600 font-medium">
                        {{ record[column.key] }}
                    </span>
                </div>
            </template>
            <template v-else-if="column.key === 'action'">
                <div class="flex items-center justify-center gap-2">
                    <button 
                        v-if="permissions?.canView" 
                        @click="$emit('viewRow', record)"
                        class="p-1.5 hover:bg-blue-50 rounded transition-colors"
                        title="Ko'rish"
                    >
                        <IconEye class="w-4 h-4 text-blue-500" />
                    </button>
                    <button 
                        v-if="permissions?.canEdit" 
                        @click="$emit('editRow', record)"
                        class="p-1.5 hover:bg-green-50 rounded transition-colors"
                        title="Tahrirlash"
                    >
                        <IconEdit class="w-4 h-4 text-green-500" />
                    </button>
                    <!-- <button 
                        v-if="permissions?.canDelete" 
                        @click="$emit('deleteRow', record)"
                        class="p-1.5 hover:bg-red-50 rounded transition-colors"
                        title="O'chirish"
                    >
                        <IconTrash class="w-4 h-4 text-danger" />
                    </button> -->
                    <a-popconfirm
                        v-if="permissions?.canDelete"
                        title="O‘chirishni tasdiqlaysizmi?"
                        :ok-text="'Ha'"
                        :cancel-text="'Yo‘q'"
                        ok-type="danger"
                        @confirm="$emit('deleteRow', record)"
                    >
                        <button
                        class="p-1.5 hover:bg-red-50 rounded transition-colors"
                        title="O'chirish"
                        >
                        <IconTrash class="w-4 h-4 text-danger" />
                        </button>
                    </a-popconfirm>
                </div>
            </template>
        </template>
    </a-table>
</template>

<script setup>
import { computed } from 'vue';
import IconEye from '@components/icon/IconEye.vue';
import IconEdit from '@components/icon/IconEdit.vue';
import IconTrash from '@components/icon/IconTrash.vue';
import noAvatarImg from '@/assets/imgs/noAvatar.png';
import dayjs from 'dayjs';

const props = defineProps({
    columns: {
        type: Array,
        required: true
    },
    dataSource: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    },
    pagination: {
        type: [Object, Boolean],
        default: () => ({
            current: 1,
            pageSize: 10,
            total: 0,
            showSizeChanger: true,
            showTotal: (total) => `Jami ${total} ta`
        })
    },
    permissions: {
        type: Object,
        default: () => ({
            canEdit: true,
            canDelete: true,
            canView: true,
        })
    },
    scroll: {
        type: Object,
        default: () => ({})
    }
});

console.log(props.dataSource);

const emits = defineEmits(['changePage', 'viewRow', 'editRow', 'deleteRow']);

// Scroll konfiguratsiyasi - fixed columnlar ishlashi uchun kerak
const scrollConfig = computed(() => {
    // Agar fixed columnlar mavjud bo'lsa, scroll qo'shish kerak
    const hasFixedColumns = props.columns.some(col => col.fixed === 'left' || col.fixed === 'right');
    
    if (hasFixedColumns || props.scroll?.x) {
        return {
            x: props.scroll?.x || 'max-content',
            y: props.scroll?.y
        };
    }
    
    return props.scroll;
});

const formatDate = (date) => {
    return dayjs(date).format('DD.MM.YYYY');
}

// Row raqamini hisoblash - pagination'ni hisobga oladi
const getRowNumber = (index) => {
    if (!props.pagination || props.pagination === false) {
        return index + 1;
    }
    
    const currentPage = props.pagination.current || 1;
    const pageSize = props.pagination.pageSize || 10;
    
    return (currentPage - 1) * pageSize + index + 1;
};

const handleTableChange = (pag, filters, sorter) => {
    emits('changePage', { pag, filters, sorter });
};
</script>

<style scoped>
/* Fixed columnlar bilan muammolarni hal qilish uchun */
:deep(.ant-table .ant-table-fixed-right) {
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);
}

:deep(.ant-table .ant-table-cell) {
    white-space: nowrap;
}

/* Actions column uchun */
:deep(.ant-table .ant-table-cell-fix-right) {
    background: #fff;
}
</style>

