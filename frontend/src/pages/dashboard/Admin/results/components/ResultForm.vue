<template>
  <div class="p-2">
    <a-form ref="formRef" :model="formState" layout="vertical">
      <a-form-item
        label="Score"
        name="score"
        :rules="[
          { required: true, message: 'Please input score' },
          { type: 'number', min: 0, max: 100, message: 'Score must be between 0 and 100' }
        ]"
      >
        <a-input-number 
          v-model:value="formState.score" 
          :min="0" 
          :max="100" 
          class="w-[100%]"
        />
      </a-form-item>
      <a-form-item
        label="Student"
        name="studentId"
        :rules="[{ required: true, message: 'Please select a student' }]"
      >
        <a-select
          v-model:value="formState.studentId"
          :loading="loadingStudents"
          placeholder="O'quvchini tanlang"
          allow-clear
        >
          <a-select-option
            v-for="student in students"
            :key="student._id"
            :value="student._id"
          >
            {{ student.name }} {{ student.surname }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item
        label="Exam"
        name="examId"
        :rules="[{ required: true, message: 'Please select an exam' }]"
      >
        <a-select
          v-model:value="formState.examId"
          :loading="loadingExams"
          placeholder="Imtihonni tanlang"
          allow-clear
        >
          <a-select-option
            v-for="exam in exams"
            :key="exam._id"
            :value="exam._id"
          >
            {{ exam.title }}
          </a-select-option>
        </a-select>
      </a-form-item>

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
// 2. Imports - Services
import { getStudents } from "@/services/modules/students/students.service";
import { getExams } from "@/services/modules/exams/exams.service";

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
  result: {
    type: Object,
    default: () => ({
      score: "",
      studentId: "",
      examId: "",
    }),
  },
});

// 4. Emits
const emit = defineEmits(["cancel", "submit"]);

// 5. Reactive State
const formRef = ref(null);
const formState = ref({
  score: "",
  studentId: "",
  examId: "",
});

const students = ref([]);
const loadingStudents = ref(false);
const exams = ref([]);
const loadingExams = ref(false);

// 6. Methods
/**
 * Formani tozalash
 */
const resetForm = () => {
  formState.value = {
    score: "",
    studentId: "",
    examId: "",
  };
  formRef.value?.resetFields();
};

/**
 * Formani result ma'lumotlari bilan to'ldirish
 * @param {Object} result - Natija ma'lumotlari
 */
const populateForm = (result) => {
    console.log(result)
  if (result && Object.keys(result).length > 0) {
    // studentId obyekt bo'lsa, uning _id sini olish
    const studentId = 
      typeof result.studentId === 'object' && result.studentId !== null
        ? result.studentId._id || result.studentId.id
        : result.studentId || "";
    
    // examId obyekt bo'lsa, uning _id sini olish
    const examId = 
      typeof result.examId === 'object' && result.examId !== null
        ? result.examId._id || result.examId.id
        : result.examId || "";
    
    formState.value = {
      score: result.score || "",
      studentId: studentId,
      examId: examId,
    };
  } else {
    resetForm();
  }
};

/**
 * O'quvchilarni yuklash
 */
const loadStudents = async () => {
  if (students.value.length === 0) {
    loadingStudents.value = true;
    try {
      const result = await getStudents({
        page: 1,
        limit: 100,
      });

      if (result.success) {
        students.value = result.data;
      }
    } catch (error) {
      console.error("O'quvchilarni yuklashda xatolik:", error);
      students.value = [];
    } finally {
      loadingStudents.value = false;
    }
  }
};

/**
 * Imtihonlarni yuklash
 */
const loadExams = async () => {
  if (exams.value.length === 0) {
    loadingExams.value = true;
    try {
      const result = await getExams({
        page: 1,
        limit: 100,
      });

      if (result.success) {
        exams.value = result.data;
      }
    } catch (error) {
      console.error("Imtihonlarni yuklashda xatolik:", error);
      exams.value = [];
    } finally {
      loadingExams.value = false;
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
      emit("submit", formState.value);
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
  () => props.result,
  (newResult) => {
    populateForm(newResult);
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
  loadStudents();
  loadExams();
});
</script>
<style scoped></style>

