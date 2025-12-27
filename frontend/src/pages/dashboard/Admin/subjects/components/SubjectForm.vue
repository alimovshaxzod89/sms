<template>
    <div class="p-2">
        <a-form
            ref="formRef"
            :model="formState"
            layout="vertical"
        >
            <a-form-item
                label="Fan nomi"
                name="name"
                :rules="[{ required: true, message: 'Please input your subject name' }]"
            >
                <a-input v-model:value="formState.name" />
            </a-form-item>
            <a-form-item
                label="O'qituvchilar"
                name="teachers"
                :rules="[
                    { required: true, message: 'Please select your teachers' },
                    { type: 'array', message: 'Please select at least one teacher' }
                ]"
            >
                <a-select v-model:value="formState.teachers" mode="multiple" :loading="loading">
                    <a-select-option 
                        v-for="teacher in teachers" 
                        :key="teacher._id || teacher.id" 
                        :value="teacher._id || teacher.id"
                    >
                        {{ `${teacher.name || ''} ${teacher.surname || ''}`.trim() }}
                    </a-select-option>
                </a-select>
            </a-form-item>
            <div class="flex justify-end gap-2">
                <a-button
                    @click="emit('cancel')"
                    :disabled="loading"
                >
                    Bekor qilish
                </a-button>
                <a-button
                    class="bg-blue-600 text-white hover:bg-blue-700"
                    type="primary"
                    @click="handleSubmit"
                    :disabled="loading"
                >
                    {{ mode === 'create' ? 'Yaratish' : 'Saqlash' }}
                </a-button>
            </div>
        </a-form>
    </div>
</template>
<script setup>
// 1. Imports
import { ref, watch, onMounted } from 'vue';
import { getTeachers } from '@/services/modules/teachers/teachers.service';

// 2. Props
const props = defineProps({
    mode: {
        type: String,
        default: 'create' // create or edit
    },
    loading: {
        type: Boolean,
        default: false
    },
    subject: {
        type: Object,
        default: () => ({
            name: '',
            teachers: []
        })
    }
});

// 3. Emits
const emit = defineEmits(['cancel', 'submit']);

// 4. Refs / State
const formRef = ref(null);
const formState = ref({
    name: '',
    teachers: []
});

// Local state - pagination state ni o'zgartirmaslik uchun
const teachers = ref([]);
const loading = ref(false);

// 5. Methods
const handleSubmit = () => {
    formRef.value?.validate()
        .then(() => {
            emit('submit', formState.value);
        })
        .catch((error) => {
            console.error(error);
        });
};

const loadTeachers = async () => {
    // Agar teachers bo'sh bo'lsa, yuklash
    if (teachers.value.length === 0) {
        loading.value = true;
        try {
            // Service dan to'g'ridan-to'g'ri API chaqirish (store'dan emas)
            const result = await getTeachers({ 
                page: 1, 
                limit: 100 // Backend maksimal limit
            });
            
            if (result.success) {
                teachers.value = result.data;
            }
        } catch (error) {
            console.error('O\'qituvchilarni yuklashda xatolik:', error);
            teachers.value = [];
        } finally {
            loading.value = false;
        }
    }
};

// 6. Watchers
// Props o'zgarganda formState ni yangilash
watch(
    () => props.subject,
    (newSubject) => {
        if (newSubject) {
            // teachers array ichida teacher objectlari bo'lsa, ularni ID ga aylantirish
            const teacherIds = newSubject.teachers?.map(teacher => {
                // Agar teacher object bo'lsa (populate qilingan)
                if (typeof teacher === 'object' && teacher !== null) {
                    return teacher._id || teacher.id;
                }
                // Agar allaqachon ID bo'lsa
                return teacher;
            }) || [];
            
            formState.value = {
                name: newSubject.name || '',
                teachers: teacherIds
            };
        } else {
            // Create mode uchun formani tozalash
            formState.value = {
                name: '',
                teachers: []
            };
        }
    },
    { immediate: true, deep: true }
);

// Mode o'zgarganda ham formani tozalash
watch(
    () => props.mode,
    (newMode) => {
        if (newMode === 'create') {
            formState.value = {
                name: '',
                teachers: []
            };
            // Form validatsiyasini tozalash
            formRef.value?.resetFields();
        }
    }
);

// 7. Lifecycle Hooks
// Component mount bo'lganda o'qituvchilarni yuklash
onMounted(() => {
    loadTeachers();
});
</script>
<style scoped></style>