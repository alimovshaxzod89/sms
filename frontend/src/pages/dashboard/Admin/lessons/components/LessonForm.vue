<template>
  <div class="p-2">
    <a-form ref="formRef" :model="formState" layout="vertical">
      <a-form-item
        label="Dars nomi"
        name="name"
        :rules="[{ required: true, message: 'Please input Lesson name' }]"
      >
        <a-input v-model:value="formState.name" />
      </a-form-item>
      <!-- Subjects -->
      <a-form-item
        label="Fan nomi"
        name="subjectId"
        :rules="[{ required: true, message: 'Please input Subject name' }]"
      >
        <a-select
          v-model:value="formState.subjectId"
          :loading="loadingSubjects"
          placeholder="Subjectni tanlang"
          allow-clear
        >
          <a-select-option
            v-for="subject in subjects"
            :key="subject._id"
            :value="subject._id"
          >
            {{ subject.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <!-- Classes -->
      <a-form-item
        label="Sinf"
        name="class"
        :rules="[{ required: true, message: 'Please input Class name' }]"
      >
        <a-select
          v-model:value="formState.classId"
          :loading="loadingClasses"
          placeholder="Sinfni tanlang"
          allow-clear
        >
          <a-select-option
            v-for="classItem in classes"
            :key="classItem._id"
            :value="classItem._id"
          >
            {{ classItem.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <!-- Teachers -->
      <a-form-item
        label="Teacher"
        name="teacher"
        :rules="[{ required: true, message: 'Please input Teacher name' }]"
      >
        <a-select
          v-model:value="formState.teacherId"
          :loading="loadingTeachers"
          placeholder="O'qituvchini tanlang"
          allow-clear
        >
          <a-select-option
            v-for="teacher in teachers"
            :key="teacher._id"
            :value="teacher._id"
          >
            {{ teacher.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <!-- Lesson Day -->
      <a-form-item
        label="Dars kuni"
        name="day"
        :rules="[{ required: true, message: 'Please input Lesson day' }]"
      >
        <a-select v-model:value="formState.day" :options="dayOptions" />
      </a-form-item>
      <!-- Lesson Start Time and End Time -->
      <div class="flex gap-2">
        <a-form-item
          label="Dars boshlanish vaqtini tanlang"
          name="startTime"
          class="w-[100%]"
          :rules="[
            { required: true, message: 'Please input Lesson startTime' },
          ]"
        >
          <a-time-picker class="w-[100%]" v-model:value="formState.startTime" />
        </a-form-item>
        <a-form-item
          label="Dars tugash vaqtini tanlang"
          name="endTime"
          class="w-[100%]"
          :rules="[{ required: true, message: 'Please input Lesson endTime' }]"
        >
          <a-time-picker class="w-[100%]" v-model:value="formState.endTime" />
        </a-form-item>
      </div>
      <div class="flex justify-end gap-2">
        <a-button @click="emit('cancel')" :disabled="loading">
          Bekor qilish
        </a-button>
        <a-button
          class="bg-blue-600 text-white hover:bg-blue-700"
          type="primary"
          @click="handleSubmit"
          :disabled="loading"
        >
          {{ mode === "create" ? "Yaratish" : "Saqlash" }}
        </a-button>
      </div>
    </a-form>
  </div>
</template>
<script setup>
// 1. Imports - Vue core
import { onMounted, ref, watch } from "vue";
// 2. Imports - Utils
import dayjs from "dayjs";
import { WEEK_DAY_OPTIONS } from "@/utils/constants/weekDays";
// 3. Imports - Services
import { getClasses } from "@/services/modules/classes/classes.service";
import { getSubjects } from "@/services/modules/subjects/subjects.service";
import { getTeachers } from "@/services/modules/teachers/teachers.service";

// 3. Props
const props = defineProps({
  mode: {
    type: String,
    default: "create", // create or edit
  },
  loading: {
    type: Boolean,
    default: false,
  },
  lesson: {
    type: Object,
    default: () => ({
      name: "",
      subjectId: "",
      classId: "",
      teacherId: "",
      day: "",
      startTime: "",
      endTime: "",
    }),
  },
});

// 4. Emits
const emit = defineEmits(["cancel", "submit"]);

// 5. Reactive State
const formRef = ref(null);
const formState = ref({
  name: "",
  subjectId: "",
  classId: "",
  teacherId: "",
  day: "",
  startTime: "",
  endTime: "",
});

const dayOptions = WEEK_DAY_OPTIONS;
const subjects = ref([]);
const loadingSubjects = ref(false);
const classes = ref([]);
const loadingClasses = ref(false);
const teachers = ref([]);
const loadingTeachers = ref(false);

// 6. Methods
/**
 * Formani tozalash
 */
const resetForm = () => {
  formState.value = {
    name: "",
    subjectId: "",
    classId: "",
    teacherId: "",
    day: "",
    startTime: "",
    endTime: "",
  };
  formRef.value?.resetFields();
};

/**
 * String datani dayjs obyektiga o'girish
 * @param {string|Date|dayjs} date - O'girilishi kerak bo'lgan sana
 * @returns {dayjs|null} - dayjs obyekti yoki null
 */
const parseDate = (date) => {
  if (!date) return null;
  // Agar allaqachon dayjs obyekti bo'lsa
  if (dayjs.isDayjs(date)) return date;
  // String yoki Date bo'lsa, dayjs ga o'girish
  return dayjs(date);
};

/**
 * Formani lesson ma'lumotlari bilan to'ldirish
 * @param {Object} lesson - Dars ma'lumotlari
 */
const populateForm = (lesson) => {
  if (lesson && Object.keys(lesson).length > 0) {
    // subjectId obyekt bo'lsa, uning _id sini olish
    const subjectId =
      typeof lesson.subjectId === "object" && lesson.subjectId !== null
        ? lesson.subjectId._id || lesson.subjectId.id
        : lesson.subjectId || "";

    // classId obyekt bo'lsa, uning _id sini olish
    const classId =
      typeof lesson.classId === "object" && lesson.classId !== null
        ? lesson.classId._id || lesson.classId.id
        : lesson.classId || "";

    // teacherId obyekt bo'lsa, uning _id sini olish
    const teacherId =
      typeof lesson.teacherId === "object" && lesson.teacherId !== null
        ? lesson.teacherId._id || lesson.teacherId.id
        : lesson.teacherId || "";

    formState.value = {
      name: lesson.name || "",
      subjectId: subjectId,
      classId: classId,
      teacherId: teacherId,
      day: lesson.day || "",
      startTime: parseDate(lesson.startTime),
      endTime: parseDate(lesson.endTime),
    };
  } else {
    resetForm();
  }
};

/**
 * Subjectlarni yuklash
 */
const loadSubjects = async () => {
  if (subjects.value.length === 0) {
    loadingSubjects.value = true;
    try {
      const result = await getSubjects({
        page: 1,
        limit: 100,
      });
      if (result.success) {
        subjects.value = result.data;
      }
    } catch (error) {
      console.error("Subjectlarni yuklashda xatolik:", error);
      subjects.value = [];
    } finally {
      loadingSubjects.value = false;
    }
  }
};

/**
 * Classlarni yuklash
 */
const loadClasses = async () => {
  if (classes.value.length === 0) {
    loadingClasses.value = true;
    try {
      const result = await getClasses({
        page: 1,
        limit: 100,
      });
      if (result.success) {
        classes.value = result.data;
      }
    } catch (error) {
      console.error("Classesni yuklashda xatolik:", error);
      classes.value = [];
    } finally {
      loadingClasses.value = false;
    }
  }
};

/**
 * Teacherlarni yuklash
 */
const loadTeachers = async () => {
  if (teachers.value.length === 0) {
    loadingTeachers.value = true;
    try {
      const result = await getTeachers({
        page: 1,
        limit: 100,
      });
      if (result.success) {
        teachers.value = result.data;
      }
    } catch (error) {
      console.error("O'qituvchilarni yuklashda xatolik:", error);
      teachers.value = [];
    } finally {
      loadingTeachers.value = false;
    }
  }
};

/**
 * Form submit qilish
 */
const handleSubmit = () => {
  formRef.value
    ?.validate()
    .then(() => {
      // dayjs obyektlarini ISO string formatiga o'girish
      const submitData = {
        ...formState.value,
        startTime: formState.value.startTime
          ? dayjs(formState.value.startTime).toISOString()
          : null,
        endTime: formState.value.endTime
          ? dayjs(formState.value.endTime).toISOString()
          : null,
      };
      emit("submit", submitData);
    })
    .catch((error) => {
      console.error("Form validation error:", error);
    });
};

// 7. Watchers
/**
 * Props o'zgarganda formState ni yangilash
 */
watch(
  () => props.lesson,
  (newLesson) => {
    populateForm(newLesson);
  },
  { immediate: true, deep: true }
);

/**
 * Mode o'zgarganda ham formani tozalash
 */
watch(
  () => props.mode,
  (newMode) => {
    if (newMode === "create") {
      resetForm();
    }
  }
);

// 8. Lifecycle Hooks
onMounted(() => {
  loadSubjects();
  loadClasses();
  loadTeachers();
});
</script>
<style scoped></style>
